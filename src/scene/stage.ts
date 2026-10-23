// The 3D stage: owns the WebGL renderer and its lifecycle, the adaptive quality tier, the render
// loop, and the shared paper, stamps, dust and camera on top of an era's dressing.
// The app loads this module with a dynamic import (see index.ts) after the first paint.
import * as THREE from 'three'
import { mulberry32, seedFrom } from '../game/rng'
import { mountFallback } from './fallback'
import { ERA_PALETTES, mix } from './palette'
import {
  SPOTS,
  animateStamp,
  createCameraRig,
  createDust,
  createPaper,
  createStamps,
  disposeTree,
  findWarmLights,
  takeShadowsDirty,
  type Dust,
  type PaperProp,
  type PaperStamp,
  type StampSet,
  type WarmLight,
} from './props'
import {
  TIER_SETTINGS,
  createTierControl,
  loadSavedCeiling,
  loadSavedTier,
  parseTierParam,
  pickInitialTier,
  readDeviceSignals,
  saveTier,
  startTier,
} from './quality'
import { createTweens, ease, lerp } from './tween'
import { STAGE_LOST_EVENT, type EraDressing, type QualityTier, type Stage, type StageOptions, type StampKind } from './types'

export type { Stage, StageOptions } from './types'

const SETTLE_MS = 10_000 // a tier that holds steady this long is saved as the device's tier (R14)
const EXPOSURE = 1.0
const CAUGHT_EXPOSURE = 0.42

function getGL(canvas: HTMLCanvasElement, antialias: boolean): WebGL2RenderingContext | null {
  try {
    const gl = canvas.getContext('webgl2', {
      antialias,
      alpha: false,
      depth: true,
      stencil: false,
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
      powerPreference: 'default',
    })
    return (gl as WebGL2RenderingContext | null) ?? null
  } catch {
    return null
  }
}

/** Frees a context now; Safari caps live contexts per page. */
function releaseGL(gl: WebGL2RenderingContext): void {
  try {
    gl.getExtension('WEBGL_lose_context')?.loseContext()
  } catch {
    /* already gone */
  }
}

interface World {
  scene: THREE.Scene
  paper: PaperProp
  stamps: StampSet
  dust: Dust
  warm: WarmLight[]
  update(tMs: number, pxPerUnit: number): void
  dispose(): void
}

/**
 * Builds the stage in `el`. Returns null when WebGL2 is unavailable (three r186 is WebGL2-only),
 * so the app can use `mountFallback` instead.
 */
export function createStage(el: HTMLElement, opts: StageOptions): Stage | null {
  const search = typeof location !== 'undefined' ? location.search : ''
  const forced = opts.forceTier ?? parseTierParam(search)
  const debug = /[?&]debug(?=[=&]|$)/.test(search)
  const saved = forced ? undefined : loadSavedTier()
  const savedCeiling = forced ? undefined : loadSavedCeiling()
  const known = forced ?? saved

  // MSAA is fixed at context creation, so decide it before the renderer exists. When the tier is
  // not known yet, probe without MSAA (that context reads the GPU string), and only make a second
  // context if the detected tier wants MSAA.
  let canvas = document.createElement('canvas')
  let gl = getGL(canvas, known ? TIER_SETTINGS[known].antialias : false)
  if (!gl) return null
  const sig = readDeviceSignals(gl)
  const start = startTier({ forced, saved, detect: () => pickInitialTier(sig) })
  if (TIER_SETTINGS[start.tier].antialias && !gl.getContextAttributes()?.antialias) {
    const c2 = document.createElement('canvas')
    const gl2 = getGL(c2, true)
    if (gl2) {
      releaseGL(gl)
      canvas = c2
      gl = gl2
    }
  }

  let tier = start.tier
  let renderer!: THREE.WebGLRenderer
  let disposed = false
  let lost = false

  const makeRenderer = (c: HTMLCanvasElement, g: WebGL2RenderingContext): THREE.WebGLRenderer => {
    const r = new THREE.WebGLRenderer({ canvas: c, context: g, alpha: false, stencil: false, powerPreference: 'default' })
    r.outputColorSpace = THREE.SRGBColorSpace
    r.toneMapping = THREE.ACESFilmicToneMapping
    r.toneMappingExposure = exposure
    r.shadowMap.autoUpdate = false
    c.style.cssText = 'display:block;width:100%;height:100%'
    c.setAttribute('aria-hidden', 'true')
    c.addEventListener('webglcontextlost', (e) => {
      e.preventDefault()
      // A renderer replaced at a tier switch fires this too when we free it. Only the live one
      // may flag loss, or the picture freezes while the loop keeps running (the spike's bug).
      if (disposed || r !== renderer) return
      onLost()
    })
    return r
  }

  let exposure = EXPOSURE
  try {
    renderer = makeRenderer(canvas, gl)
  } catch {
    releaseGL(gl)
    return null
  }
  let aa = gl.getContextAttributes()?.antialias === true
  el.appendChild(canvas)

  const tweens = createTweens()
  const camera = new THREE.PerspectiveCamera(50, 1, 0.03, 30)
  const rig = createCameraRig(camera, tweens, { reducedMotion: opts.reducedMotion })
  // R14: save the tier once it holds for 10 s. A session that stepped down also saves that tier as
  // a ceiling, so the next session never probes above it; an older ceiling is carried forward.
  const tiers = createTierControl({
    start: tier,
    adaptive: !forced,
    ceiling: savedCeiling?.tier,
    settleMs: SETTLE_MS,
    onSettled: (t, steppedDown) => saveTier(t, steppedDown ? { tier: t, at: Date.now() } : savedCeiling),
  })

  let dressing: EraDressing | null = null
  let world: World | null = null
  let worldGen = 0
  let paperShown = false
  let stamped: PaperStamp | null = null
  let caughtState = false
  let busy = 0 // animations that a world rebuild would break; tier changes wait for them
  let casters = 0 // animations moving shadow casters
  let shadowDirty = true
  let queue: Promise<void> = Promise.resolve()
  let fallback: { setEra(id: EraDressing['id']): void; dispose(): void } | null = null

  // ------------------------------------------------------------ world

  const buildWorld = (d: EraDressing, t: QualityTier): World => {
    const pal = ERA_PALETTES[d.id]
    const s = TIER_SETTINGS[t]
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(pal.shade)
    scene.fog = new THREE.Fog(pal.shade, 2.6, 7.5)
    scene.add(new THREE.HemisphereLight(mix(pal.sky, 0x8a9ac0, 0.45), mix(pal.floor, 0x000000, 0.4), 0.9))
    const fill = new THREE.DirectionalLight(mix(d.lightColor, 0xffffff, 0.3), 0.32)
    fill.position.set(0.4, 1.4, 2.2)
    scene.add(fill)
    let dressed: ReturnType<EraDressing['build']>
    try {
      dressed = d.build({ scene, tier: t, rng: mulberry32(seedFrom(d.id)) })
    } catch (err) {
      disposeTree(scene) // whatever the dressing added before it threw
      throw err
    }
    const prng = mulberry32(seedFrom(`${d.id}:props`))
    const paper = createPaper({ palette: pal, tier: t, rng: prng })
    const stamps = createStamps({ palette: pal, tier: t, rng: prng })
    const warm = findWarmLights(scene)
    const lamp = warm[0]?.position ?? new THREE.Vector3(SPOTS.lamp.x, 0.25, SPOTS.lamp.z)
    const dust = createDust({
      count: s.dust,
      color: d.lightColor,
      center: [lamp.x + 0.28, 0.24, lamp.z + 0.14],
      size: [0.95, 0.5, 0.62],
      light: lamp,
      rng: prng,
      reducedMotion: opts.reducedMotion,
    })
    scene.add(paper.group, stamps.group, dust.points)
    return {
      scene,
      paper,
      stamps,
      dust,
      warm,
      update(tMs, px) {
        dressed.update(tMs)
        stamps.update()
        dust.update(tMs, px)
      },
      dispose() {
        dressed.dispose()
        paper.dispose()
        stamps.dispose()
        dust.dispose()
        scene.traverse((o) => {
          if ((o as THREE.Light).isLight) (o as THREE.Light).dispose()
        })
      },
    }
  }

  const paperRest = () => new THREE.Vector3(SPOTS.paper.x, 0, SPOTS.paper.z)

  const restoreState = (w: World) => {
    const g = w.paper.group
    g.position.copy(paperRest())
    g.rotation.y = SPOTS.paper.yaw
    g.visible = paperShown
    w.paper.setStamp(stamped)
    w.paper.setInk(1)
    rig.setPaper(paperRest())
    for (const l of w.warm) l.setDim(caughtState ? 0.3 : 1, true)
  }

  /** Returns false when the dressing failed to build; the stage then falls back like a lost context. */
  const setWorld = (d: EraDressing, t: QualityTier): boolean => {
    const old = world
    world = null
    old?.dispose()
    worldGen++
    try {
      world = buildWorld(d, t)
    } catch (err) {
      console.error('[stage] era dressing failed to build', err)
      fail('build-failed')
      return false
    }
    restoreState(world)
    shadowDirty = true
    return true
  }

  // ------------------------------------------------------------ renderer and tiers

  const configure = () => {
    const s = TIER_SETTINGS[tier]
    renderer.shadowMap.enabled = s.shadows !== 'none'
    renderer.shadowMap.type = s.shadows === 'pcf' ? THREE.PCFShadowMap : THREE.BasicShadowMap
    renderer.shadowMap.autoUpdate = false
    renderer.toneMappingExposure = exposure
  }

  let cssW = 1
  let cssH = 1
  const resize = () => {
    if (disposed) return
    cssW = Math.max(1, el.clientWidth || window.innerWidth || 1)
    cssH = Math.max(1, el.clientHeight || window.innerHeight || 1)
    const s = TIER_SETTINGS[tier]
    const dpr = Math.min(window.devicePixelRatio || 1, s.maxDpr, Math.sqrt(s.maxPixels / (cssW * cssH)))
    renderer.setPixelRatio(Math.max(0.5, dpr))
    renderer.setSize(cssW, cssH, false)
    rig.setAspect(cssW / cssH)
  }

  const swapRenderer = (antialias: boolean) => {
    const c = document.createElement('canvas')
    const g = getGL(c, antialias)
    if (!g) return
    let next: THREE.WebGLRenderer
    try {
      next = makeRenderer(c, g)
    } catch {
      releaseGL(g)
      return
    }
    const old = renderer
    renderer = next // before freeing the old one, so its context-lost event is ignored
    aa = g.getContextAttributes()?.antialias === true
    old.domElement.replaceWith(c)
    old.dispose()
    old.forceContextLoss()
  }

  const applyTier = (t: QualityTier) => {
    tier = t
    if (TIER_SETTINGS[t].antialias !== aa) swapRenderer(TIER_SETTINGS[t].antialias)
    configure()
    if (dressing) setWorld(dressing, t)
    resize()
    tiers.applied() // fresh window and warm-up: only frames at the new tier count
  }

  configure()
  resize()

  // ------------------------------------------------------------ loop

  let running = false
  let userPaused = false
  let raf = 0
  let last = 0
  let clock = 0
  const stats = { fps: 0, calls: 0, shadowCalls: 0, tris: 0, frames: 0, acc: 0 }

  const frame = (now: number) => {
    if (!running) return
    raf = requestAnimationFrame(frame)
    const dt = last ? now - last : 16.7
    last = now
    const next = tiers.take(busy === 0) // a rebuild mid-stamp would break the animation, so wait
    if (next) applyTier(next)
    const w = world
    if (!w) return
    const step = Math.min(dt, 100)
    clock += step
    tweens.tick(step)
    const pxPerUnit = renderer.domElement.height / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2))
    w.update(clock, pxPerUnit)
    rig.update(step, clock)
    const dressDirty = takeShadowsDirty(w.scene)
    const shadowPass = renderer.shadowMap.enabled && (shadowDirty || casters > 0 || dressDirty)
    if (shadowPass) {
      renderer.shadowMap.needsUpdate = true
      shadowDirty = false
    }
    renderer.render(w.scene, camera)
    const info = renderer.info.render
    if (shadowPass) stats.shadowCalls = info.calls
    else stats.calls = info.calls
    stats.tris = info.triangles
    stats.frames++
    stats.acc += dt
    tiers.frame(dt)
  }

  const syncRunning = () => {
    const should = !userPaused && !document.hidden && !lost && !disposed
    if (should && !running) {
      running = true
      last = 0
      tiers.warm(500) // the first frames after a resume are not representative
      raf = requestAnimationFrame(frame)
    } else if (!should && running) {
      running = false
      cancelAnimationFrame(raf)
      raf = 0
    }
  }
  document.addEventListener('visibilitychange', syncRunning)

  let resizeTimer = 0
  const onResize = () => {
    // debounced: the iOS URL bar fires resize repeatedly and each setSize reallocates buffers
    window.clearTimeout(resizeTimer)
    resizeTimer = window.setTimeout(resize, 120)
  }
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(onResize) : null
  ro?.observe(el)
  window.addEventListener('resize', onResize)

  // ------------------------------------------------------------ context loss

  function onLost() {
    fail('context-lost')
  }

  /** The stage goes inert, says so, and the 2D fallback takes its place in the mount. */
  function fail(reason: 'context-lost' | 'build-failed') {
    if (lost || disposed) return
    lost = true
    syncRunning()
    tweens.setInstant(true)
    tweens.clear()
    // display:none, not visibility:hidden, so the fallback canvas gets the mount's box
    renderer.domElement.style.display = 'none'
    const ev = new CustomEvent(STAGE_LOST_EVENT, { cancelable: true, detail: { era: dressing?.id, reason } })
    const appHandled = !el.dispatchEvent(ev)
    if (!appHandled && !disposed) fallback = mountFallback(el, dressing?.id ?? 'delhi-1857')
  }

  // ------------------------------------------------------------ debug overlay (?debug)

  let overlay: HTMLDivElement | null = null
  let overlayTimer = 0
  const debugInfo = () => ({
    tier,
    source: start.source,
    forced: !!forced,
    fps: stats.fps,
    calls: stats.calls,
    shadowCalls: stats.shadowCalls,
    tris: stats.tris,
    dpr: renderer.getPixelRatio(),
    canvas: [renderer.domElement.width, renderer.domElement.height],
    aa,
    gpu: sig.gpu ?? '',
    capped: tiers.info().capped,
    frames: renderer.info.render.frame,
    lost,
    running,
    canvases: el.querySelectorAll('canvas').length,
  })
  if (debug) {
    overlay = document.createElement('div')
    overlay.id = 'ft-debug'
    overlay.style.cssText =
      'position:fixed;left:8px;top:8px;z-index:9999;pointer-events:none;white-space:pre;' +
      'font:11px/1.35 ui-monospace,Menlo,monospace;color:#ffe9c8;background:rgba(10,6,4,.72);padding:6px 8px;border-radius:6px'
    document.body.appendChild(overlay)
    overlayTimer = window.setInterval(() => {
      if (stats.acc > 0) stats.fps = (stats.frames * 1000) / stats.acc
      stats.frames = 0
      stats.acc = 0
      const i = debugInfo()
      if (overlay) {
        overlay.textContent = [
          `tier ${i.tier} (${i.source})${i.capped ? '  30 fps cap' : ''}`,
          `fps ${i.fps.toFixed(1)}  calls ${i.calls}/${TIER_SETTINGS[i.tier].maxCalls} (${i.shadowCalls} with shadows)  tris ${(i.tris / 1000).toFixed(1)}k`,
          `dpr ${i.dpr.toFixed(2)}  ${i.canvas[0]}×${i.canvas[1]}  msaa ${i.aa ? 'on' : 'off'}`,
          i.gpu.slice(0, 60),
        ].join('\n')
      }
    }, 500)
    // test hook: queue a tier change as the adapter would
    const setTier = (t: QualityTier) => tiers.request(t)
    ;(window as unknown as { __ftStage?: unknown }).__ftStage = { info: debugInfo, setTier }
  }

  // ------------------------------------------------------------ the Stage API

  let exposureTok = 0 // a newer exposure change cancels an older tween still running
  const setExposure = (to: number, ms: number) => {
    const from = exposure
    const tok = ++exposureTok
    return tweens.run(ms, (k) => {
      if (tok !== exposureTok) return
      exposure = lerp(from, to, k)
      renderer.toneMappingExposure = exposure
    }, ease.out)
  }

  const liftCaught = () => {
    if (!caughtState) return
    caughtState = false
    void setExposure(EXPOSURE, opts.reducedMotion ? 0 : 400)
    for (const l of world?.warm ?? []) l.setDim(1)
  }

  const slidePaper = async () => {
    const w = world
    if (!w) return
    const gen = worldGen
    const g = w.paper.group
    const rest = paperRest()
    busy++
    try {
      if (paperShown && g.visible && !opts.reducedMotion) {
        const p0 = g.position.clone()
        const y0 = g.rotation.y
        await tweens.run(360, (k) => {
          g.position.set(p0.x + 0.8 * k, p0.y + 0.012 * Math.sin(k * Math.PI), p0.z - 0.12 * k)
          g.rotation.y = y0 - 0.5 * k
        }, ease.in)
      }
      if (gen !== worldGen) return
      stamped = null
      w.paper.setStamp(null)
      paperShown = true
      g.visible = true
      if (opts.reducedMotion) {
        g.position.copy(rest)
        g.rotation.y = SPOTS.paper.yaw
        return
      }
      const from = new THREE.Vector3(-0.12, 0, 0.6)
      await tweens.run(640, (k) => {
        g.position.lerpVectors(from, rest, k)
        g.position.y = 0.014 * Math.sin(k * Math.PI)
        g.rotation.y = lerp(-0.42, SPOTS.paper.yaw, k)
      }, ease.out)
    } finally {
      busy--
    }
  }

  const doStamp = async (kind: StampKind) => {
    const w = world
    if (!w || lost || disposed) return
    const gen = worldGen
    if (!paperShown) {
      paperShown = true
      restoreState(w)
    }
    const st: PaperStamp = {
      kind,
      u: 0.38 + Math.random() * 0.24,
      v: 0.75 + Math.random() * 0.07,
      rot: (Math.random() - 0.5) * 0.6,
    }
    const target = w.paper.pointAt(st.u, st.v)
    void rig.go('desk', opts.reducedMotion ? 0 : 450, ease.inOut)
    busy++
    casters++
    try {
      await animateStamp(w.stamps, kind, target, tweens, {
        reducedMotion: opts.reducedMotion,
        onImpact: () => {
          if (gen !== worldGen) return
          stamped = st
          w.paper.setStamp(st)
          w.paper.setInk(0)
          void tweens.run(opts.reducedMotion ? 200 : 140, (k) => w.paper.setInk(k), ease.out)
          rig.shake(0.012)
        },
      })
    } finally {
      busy--
      casters--
      shadowDirty = true
    }
  }

  const stage: Stage = {
    setEra(d) {
      if (disposed) return
      dressing = d
      paperShown = false
      stamped = null
      caughtState = false
      exposureTok++
      exposure = EXPOSURE
      if (lost) {
        fallback?.setEra(d.id)
        return
      }
      renderer.toneMappingExposure = exposure
      rig.setBase(d.camera)
      if (!setWorld(d, tier)) return
      tiers.warm(750) // texture generation and shader compiles make the next frames slow
      if (opts.reducedMotion) rig.jump('desk')
      else {
        rig.jump('intro')
        void rig.go('desk', 2600, ease.inOut)
      }
      syncRunning()
    },
    showPaper(o) {
      if (disposed || lost || !world) return
      liftCaught()
      const lean = o?.lean !== false
      queue = queue
        .then(() => {
          if (lean) void rig.go('read', opts.reducedMotion ? 0 : 1100, ease.inOut)
          // stay on (or return to) the desk shot; never cut short a move that is already heading there
          else if (rig.shot() !== 'desk') void rig.go('desk', opts.reducedMotion ? 0 : 700, ease.inOut)
          return slidePaper()
        })
        .catch(() => undefined)
    },
    stamp(kind) {
      if (disposed || lost || !world) return Promise.resolve()
      const job = queue.then(() => doStamp(kind))
      queue = job.catch(() => undefined)
      return job
    },
    caught() {
      if (disposed || lost || !world) return Promise.resolve()
      caughtState = true
      for (const l of world.warm) l.setDim(0.3)
      const dark = setExposure(CAUGHT_EXPOSURE, opts.reducedMotion ? 200 : 700)
      const drop = opts.reducedMotion ? Promise.resolve() : rig.go('caught', 650, ease.out)
      return Promise.all([dark, drop]).then(() => tweens.wait(opts.reducedMotion ? 0 : 250))
    },
    setPaused(p) {
      userPaused = p
      syncRunning()
    },
    dispose() {
      if (disposed) return
      disposed = true
      syncRunning()
      tweens.setInstant(true)
      tweens.clear()
      document.removeEventListener('visibilitychange', syncRunning)
      window.removeEventListener('resize', onResize)
      window.clearTimeout(resizeTimer)
      ro?.disconnect()
      if (overlayTimer) window.clearInterval(overlayTimer)
      overlay?.remove()
      world?.dispose()
      world = null
      renderer.dispose()
      renderer.forceContextLoss()
      renderer.domElement.remove()
      fallback?.dispose()
      fallback = null
    },
  }
  return stage
}
