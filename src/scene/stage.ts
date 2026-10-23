// The 3D stage: owns the WebGL renderer and its lifecycle, the adaptive quality tier, the render
// loop, and the shared paper, stamps, dust and camera on top of an era's dressing. It also runs the
// day's choreography: the wide room, the day title in the room, each era's arrival of the message
// and the lean-in over the paper, the stamp, and the verdict's flash.
// The app loads this module with a dynamic import (see index.ts) after the first paint.
import * as THREE from 'three'
import type { Lang } from '../content/types'
import { mulberry32, seedFrom } from '../game/rng'
import { arrive, placeAtRest, type ArrivalCtx, type StageCue } from './arrivals'
import { mountFallback, type Fallback } from './fallback'
import {
  SHEET_PX,
  SHEET_W,
  createCalendar,
  createEnvelope,
  createFlash,
  createMessageSheet,
  createTitleBoard,
  type CalendarLeaves,
  type Envelope,
  type Flash,
  type MessageSheet,
  type TitleBoard,
} from './message'
import { ERA_PALETTES, mix } from './palette'
import {
  DESK,
  FRAME_W,
  SPOTS,
  animateStamp,
  createCameraRig,
  createDust,
  createPaper,
  createStamps,
  disposeTree,
  findWarmLights,
  framePoints,
  frameShot,
  takeShadowsDirty,
  type Dust,
  type PaperProp,
  type PaperStamp,
  type Pose,
  type PoseFn,
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
import { MAX_ASPECT, TITLE_TONE, drawSheet, loadSheetFonts, measureSheet, type SheetMetrics } from './sheet'
import { fitPose, readInsets, rectOnDesk, rectOnWall, safeBox, type NdcBox } from './shots'
import { createTweens, ease, lerp } from './tween'
import {
  STAGE_LOST_EVENT,
  type DayTitle,
  type DressingHooks,
  type EraDressing,
  type FlashKind,
  type QualityTier,
  type SheetSpec,
  type Stage,
  type StageOptions,
  type StampKind,
  type V3,
} from './types'

export type { Stage, StageOptions } from './types'
export type { StageCue } from './arrivals'

const SETTLE_MS = 10_000 // a tier that holds steady this long is saved as the device's tier (R14)
const EXPOSURE = 1.0
const CAUGHT_EXPOSURE = 0.42
const TITLE_MS = 1600

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
  hooks: DressingHooks
  sheet: MessageSheet
  envelope: Envelope
  title: TitleBoard
  calendar: CalendarLeaves | null
  flash: Flash
  update(tMs: number, pxPerUnit: number): void
  dispose(): void
}

interface Msg {
  spec: SheetSpec
  m: SheetMetrics
  shown: boolean
  stamp: PaperStamp | null
}

/** The first number in a title ("Day 3", "दिन ३"), for the 1947 countdown. */
export function dayNumber(text: string): number | null {
  const ascii = text.replace(/[०-९]/g, (d) => String(d.charCodeAt(0) - 0x0966))
  const m = /\d+/.exec(ascii)
  return m ? Number(m[0]) : null
}

const isHindi = (t: string) => /[ऀ-ॿ]/.test(t)

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
  const reduced = opts.reducedMotion
  const cue = (name: StageCue) => {
    try {
      opts.onCue?.(name)
    } catch {
      /* a listener's error never breaks the stage */
    }
  }

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
  const rig = createCameraRig(camera, tweens, { reducedMotion: reduced })
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
  let fallback: Fallback | null = null
  // the day's message, the title and the countdown survive a world rebuild (tier change)
  let msg: Msg | null = null
  let lastSpec: SheetSpec | null = null // what the fallback shows if the context is lost
  let calDays: number | null = null
  let ops = 0 // choreography in flight (title, arrival, stamp); skip() finishes them
  let skipping = false
  let msgToken = 0

  // the sheet canvas is the stage's, reused for every message and across world rebuilds
  let sheetCanvas: HTMLCanvasElement | null = null
  const sheetCanvasFor = (t: QualityTier): HTMLCanvasElement => {
    const w = SHEET_PX[t]
    if (!sheetCanvas || sheetCanvas.width !== w) {
      sheetCanvas ??= document.createElement('canvas')
      sheetCanvas.width = w
      sheetCanvas.height = Math.ceil(w * MAX_ASPECT)
    }
    return sheetCanvas
  }

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
    const hooks = dressed.hooks ?? {}
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
      reducedMotion: reduced,
    })
    const sheet = createMessageSheet({ tier: t, canvas: sheetCanvasFor(t), paper: pal.paper })
    sheet.group.visible = false
    const envelope = createEnvelope(t)
    envelope.group.visible = false
    const title = createTitleBoard(t)
    title.place(hooks.title ?? defaultTitle())
    const calendar = hooks.calendar ? createCalendar(hooks.calendar, t) : null
    const flash = createFlash()
    camera.add(flash.mesh)
    scene.add(paper.group, stamps.group, dust.points, sheet.group, envelope.group, title.group, camera)
    if (calendar) scene.add(calendar.group)
    return {
      scene,
      paper,
      stamps,
      dust,
      warm,
      hooks,
      sheet,
      envelope,
      title,
      calendar,
      flash,
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
        sheet.dispose()
        envelope.dispose()
        title.dispose()
        calendar?.dispose()
        camera.remove(flash.mesh)
        flash.dispose()
        scene.traverse((o) => {
          if ((o as THREE.Light).isLight) (o as THREE.Light).dispose()
        })
      },
    }
  }

  const defaultTitle = (): NonNullable<DressingHooks['title']> => ({ pos: [0, 0.5, -0.53], w: 0.46 })

  const paperRest = () => new THREE.Vector3(SPOTS.paper.x, 0, SPOTS.paper.z)

  /** Where the message sheet lies: on the paper spot, pulled toward the player if it is long. */
  const sheetRest = (w: World) => {
    const h = w.sheet.h()
    return { pos: new THREE.Vector3(SPOTS.paper.x, 0, Math.max(SPOTS.paper.z, -0.12 + h / 2)), yaw: SPOTS.paper.yaw }
  }

  const drawMessage = (w: World, s: SheetSpec, m: SheetMetrics) => {
    const c = w.sheet.canvas
    const g = c.getContext('2d')
    if (g) {
      g.setTransform(1, 0, 0, 1, 0, 0)
      const used = Math.round(c.width * m.aspect)
      drawSheet(g, c.width, used, s)
      // the unused rows match the paper, so mipmaps never bleed a stale page into the edge
      g.fillStyle = `#${m.tint.toString(16).padStart(6, '0')}`
      g.fillRect(0, used, c.width, c.height - used)
    }
    w.sheet.setAspect(m.aspect)
    w.sheet.texture.needsUpdate = true
  }

  const measure = (s: SheetSpec): SheetMetrics | null => {
    const g = world?.sheet.canvas.getContext('2d')
    return g ? measureSheet(g, s) : null
  }

  const restoreState = (w: World) => {
    const g = w.paper.group
    g.position.copy(paperRest())
    g.rotation.y = SPOTS.paper.yaw
    g.visible = paperShown && !msg?.shown
    w.paper.setStamp(stamped)
    w.paper.setInk(1)
    rig.setPaper(paperRest())
    for (const l of w.warm) l.setDim(caughtState ? 0.3 : 1, true)
    if (msg?.shown) {
      drawMessage(w, msg.spec, msg.m)
      placeAtRest({ sheet: w.sheet, rest: sheetRest(w) })
      w.sheet.setStamp(msg.stamp)
      w.sheet.setInk(1)
      w.sheet.setGlow(rig.shot() === 'custom' ? 1 : 0.3)
    }
    if (w.calendar && calDays !== null) w.calendar.show(calDays)
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

  // ------------------------------------------------------------ shots

  /** The screen minus the HUD, in NDC, with a margin (a share of the free width each side). */
  const box = (margin = 0.04): NdcBox => safeBox(cssW, cssH, readInsets(el, cssW, cssH), margin)
  const deskDir = () => {
    const base = dressing?.camera ?? { pos: [0, 0.98, 0.92] as V3, look: [0, -0.12, 0.06] as V3 }
    return new THREE.Vector3(...base.pos).sub(new THREE.Vector3(...base.look)).normalize()
  }
  const wallPoints = (w: World | null): THREE.Vector3[] => {
    const h = w?.hooks
    if (h?.wideFrame?.length) return h.wideFrame.map((p) => new THREE.Vector3(...p))
    return [new THREE.Vector3(-0.3, 0.45, -0.5), new THREE.Vector3(0.3, 0.45, -0.5)]
  }
  const deskFront = () => [
    new THREE.Vector3(-FRAME_W / 2, 0, DESK.d / 2),
    new THREE.Vector3(FRAME_W / 2, 0, DESK.d / 2),
  ]
  /** Shift a pose so its lowest point sits on the box's floor (portrait: no dead floor below). */
  const anchorBottom = (pose: Pose, pts: THREE.Vector3[], b: NdcBox, aspect: number): Pose => {
    const cam = new THREE.PerspectiveCamera(pose.fov, aspect, 0.01, 50)
    cam.position.copy(pose.pos)
    cam.lookAt(pose.look)
    cam.updateMatrixWorld()
    let y0 = Infinity
    const v = new THREE.Vector3()
    for (const p of pts) y0 = Math.min(y0, v.copy(p).project(cam).y)
    const dy = y0 - b.y0
    if (!(dy > 0)) return pose
    const up = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 1)
    const d = pose.pos.distanceTo(pose.look)
    const shift = up.multiplyScalar(dy * d * Math.tan(THREE.MathUtils.degToRad(pose.fov) / 2))
    return { pos: pose.pos.clone().add(shift), look: pose.look.clone().add(shift), fov: pose.fov }
  }
  /** The desk shot: authored on landscape; on portrait, the desk low and the wall above it. */
  const deskPose: PoseFn = (aspect) => {
    if (!dressing) return frameShot({ pos: [0, 0.98, 0.92], look: [0, -0.12, 0.06] }, aspect)
    if (aspect >= 0.9) {
      // landscape: the authored shot, unless the HUD pins something at the side (the case file),
      // then the same view fitted into what is left
      const ins = readInsets(el, cssW, cssH)
      if (ins.left + ins.right < 1) return frameShot(dressing.camera, aspect)
      return fitPose({ points: framePoints(), dir: deskDir(), aspect, box: box(0.05) })
    }
    const pts = [...framePoints(), ...deskFront()]
    const b = { ...box(0.02), y1: 0.98 }
    const dir = deskDir().lerp(new THREE.Vector3(0, 0.62, 1).normalize(), 0.45).normalize()
    return anchorBottom(fitPose({ points: [...pts, ...wallPoints(world).map((p) => p.clone().setY(Math.min(p.y, 0.3)))], dir, aspect, box: b }), pts, b, aspect)
  }
  /** The wide room: the desk and what stands behind it (the window, the jharokha). */
  const widePose: PoseFn = (aspect) => {
    const portrait = aspect < 0.9
    // on a phone the room is tall and narrow: keep the paper's corner of the desk and let the
    // window or wall behind it fill the height
    const desk = [
      new THREE.Vector3(-DESK.w * (portrait ? 0.27 : 0.5), 0, DESK.d / 2),
      new THREE.Vector3(DESK.w * (portrait ? 0.27 : 0.5), 0, DESK.d / 2),
      new THREE.Vector3(-DESK.w * (portrait ? 0.33 : 0.4), 0, -DESK.d / 2),
      new THREE.Vector3(DESK.w * (portrait ? 0.33 : 0.4), 0, -DESK.d / 2),
    ]
    const pts = [...desk, ...wallPoints(world)]
    const b = portrait ? { ...box(0.01), y1: 0.97 } : { x0: -0.88, x1: 0.88, y0: -0.78, y1: 0.86 }
    const dir = new THREE.Vector3(0, 0.5, 1).normalize()
    const pose = fitPose({ points: pts, dir, aspect, box: b })
    return portrait ? anchorBottom(pose, desk, b, aspect) : pose
  }
  const titlePose: PoseFn = (aspect) => {
    const h = world?.hooks.title ?? defaultTitle()
    const c = new THREE.Vector3(...h.pos)
    const pts = rectOnWall(c, h.w * 0.84, h.w * 0.3, h.yaw ?? 0)
    for (const p of world?.hooks.titleFrame ?? []) pts.push(new THREE.Vector3(...p))
    const portrait = aspect < 0.9
    // centred in what the HUD leaves free (on a wide screen the case file covers the left)
    const free = box(0.04)
    const cx = (free.x0 + free.x1) / 2
    const hw = portrait ? 0.86 : Math.min(0.66, ((free.x1 - free.x0) / 2) * 0.86)
    const b = portrait ? { x0: -hw, x1: hw, y0: -0.25, y1: 0.62 } : { x0: cx - hw, x1: cx + hw, y0: -0.25, y1: 0.55 }
    const dir = new THREE.Vector3(Math.sin(h.yaw ?? 0) * 0.9, 0.16, Math.cos(h.yaw ?? 0)).normalize()
    return fitPose({ points: pts, dir, aspect, box: b })
  }
  const arrivePose: PoseFn = (aspect) => {
    const w = world
    if (!w) return deskPose(aspect)
    const r = sheetRest(w)
    const pts = rectOnDesk(r.pos, SHEET_W * 1.75, w.sheet.h() * 1.3, r.yaw)
    return fitPose({ points: pts, dir: new THREE.Vector3(0, 1, 0.75).normalize(), aspect, box: box(0.03) })
  }
  const readPose: PoseFn = (aspect) => {
    const w = world
    if (!w) return deskPose(aspect)
    const r = sheetRest(w)
    const pts = rectOnDesk(r.pos, SHEET_W, w.sheet.h(), r.yaw, 0.003)
    // a phone is width-bound: look nearly straight down. A wide screen is height-bound: lean back
    // a little, so the sheet foreshortens and can be drawn larger, as when reading at a desk
    const dir = new THREE.Vector3(0, 1, aspect < 0.9 ? 0.3 : 0.62).normalize()
    return fitPose({ points: pts, dir, aspect, box: box(0.04) })
  }
  const typewriterPose = (w: World): PoseFn | null => {
    const t = w.hooks.typewriter
    if (!t) return null
    return (aspect) => {
      const yawQ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), t.yaw)
      const o = new THREE.Vector3(...t.origin)
      const at = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).applyQuaternion(yawQ).add(o)
      const h = w.sheet.h()
      const lean = t.lean
      const top = (k: number) => at(0, t.platen[1] + Math.cos(lean) * h * k, t.platen[2] - Math.sin(lean) * h * k)
      // the platen and the sheet rising out of it, with a little of the keys below
      // (the carriage carries the sheet up to 9 cm either way, so leave room at the sides)
      const pts = [
        at(-0.17, t.platen[1], t.platen[2]),
        at(0.17, t.platen[1], t.platen[2]),
        at(-0.11, 0.1, 0.0),
        at(0.11, 0.1, 0.0),
        top(0.62).add(new THREE.Vector3(-0.16, 0, 0).applyQuaternion(yawQ)),
        top(0.62).add(new THREE.Vector3(0.16, 0, 0).applyQuaternion(yawQ)),
      ]
      const facing = new THREE.Vector3(Math.sin(t.yaw), 0, Math.cos(t.yaw))
      const dir = facing.add(new THREE.Vector3(-0.12, 0.62, 0)).normalize()
      return fitPose({ points: pts, dir, aspect, box: box(0.05) })
    }
  }
  rig.override('desk', deskPose)

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
    if (w.flash.mesh.visible) w.flash.fit(camera)
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
    if (!appHandled && !disposed) {
      const fb = mountFallback(el, dressing?.id ?? 'delhi-1857')
      fallback = fb
      if (lastSpec) void fb.showMessage(lastSpec)
    }
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
    shot: rig.shot(),
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
    void setExposure(EXPOSURE, reduced ? 0 : 400)
    for (const l of world?.warm ?? []) l.setDim(1)
  }

  /**
   * Queues a piece of choreography after whatever is running. It is counted from the moment it is
   * asked for, so skip() also finishes work still waiting its turn; it never rejects.
   */
  const run = (fn: () => Promise<void>): Promise<void> => {
    ops++
    busy++
    const job = queue
      .then(fn)
      .catch((err: unknown) => {
        console.warn('[stage] animation failed', err)
      })
      .finally(() => {
        ops--
        busy--
        if (ops === 0 && skipping) {
          skipping = false
          if (!lost && !disposed) tweens.setInstant(false)
        }
      })
    queue = job
    return job
  }

  const slidePaper = async () => {
    const w = world
    if (!w) return
    const gen = worldGen
    const g = w.paper.group
    const rest = paperRest()
    busy++
    try {
      if (paperShown && g.visible && !reduced) {
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
      if (reduced) {
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

  /** The stamped sheet from yesterday leaves the desk (unseen when the camera is on the wall). */
  const clearSheet = async (w: World, animate: boolean) => {
    const g = w.sheet.group
    if (!g.visible) return
    if (animate && !reduced) {
      const p0 = g.position.clone()
      const y0 = g.rotation.y
      await tweens.run(320, (k) => {
        g.position.set(p0.x + 0.75 * k, p0.y + 0.01 * Math.sin(k * Math.PI), p0.z - 0.1 * k)
        g.rotation.y = y0 - 0.45 * k
      }, ease.in)
    }
    g.visible = false
    w.sheet.setStamp(null)
  }

  const doStamp = async (kind: StampKind) => {
    const w = world
    if (!w || lost || disposed) return
    const gen = worldGen
    const onSheet = !!msg?.shown && w.sheet.group.visible
    if (!onSheet && !paperShown) {
      paperShown = true
      restoreState(w)
    }
    let st: PaperStamp
    let target: THREE.Vector3
    if (onSheet && msg) {
      const [u, v] = msg.m.stampAt
      st = { kind, u: u + (Math.random() - 0.5) * 0.06, v: v + (Math.random() - 0.5) * 0.04, rot: (Math.random() - 0.5) * 0.5 }
      target = w.sheet.pointAt(st.u, st.v)
    } else {
      st = { kind, u: 0.38 + Math.random() * 0.24, v: 0.75 + Math.random() * 0.07, rot: (Math.random() - 0.5) * 0.6 }
      target = w.paper.pointAt(st.u, st.v)
    }
    // over the paper the camera stays leaned in and the stamp comes into view; else the desk shot
    if (!onSheet || rig.shot() !== 'custom') void rig.go('desk', reduced ? 0 : 450, ease.inOut)
    busy++
    casters++
    try {
      await animateStamp(w.stamps, kind, target, tweens, {
        reducedMotion: reduced,
        onImpact: () => {
          if (gen !== worldGen) return
          cue('stamp')
          if (onSheet && msg) {
            msg.stamp = st
            w.sheet.setStamp(st)
            w.sheet.setInk(0)
            void tweens.run(reduced ? 200 : 140, (k) => w.sheet.setInk(k), ease.out)
          } else {
            stamped = st
            w.paper.setStamp(st)
            w.paper.setInk(0)
            void tweens.run(reduced ? 200 : 140, (k) => w.paper.setInk(k), ease.out)
          }
          rig.shake(0.012)
        },
      })
    } finally {
      busy--
      casters--
      shadowDirty = true
    }
  }

  /** Loads the sheet faces; on a slow network, draws now and again when they arrive. */
  const fontsFor = async (lang: Lang, onLate: () => void): Promise<void> => {
    const ok = await loadSheetFonts(lang, 2000)
    if (!ok) void loadSheetFonts(lang, 0).then((late) => late && !disposed && onLate())
    world?.sheet.drawDecals()
  }

  const runTitle = async (t: DayTitle) => {
    const lang: Lang = isHindi(t.big + t.small) ? 'hi' : 'en'
    await fontsFor(lang, () => {
      const w = world
      if (w && dressing) w.title.set(t, TITLE_TONE[dressing.id])
    })
    const w = world
    if (!w || !dressing || lost) return
    const gen = worldGen
    const t0 = clock
    w.title.set(t, TITLE_TONE[dressing.id])
    w.title.place(w.hooks.title ?? defaultTitle())
    w.title.setShow(0, 0)
    // yesterday's sheet goes while the camera looks at the wall
    if (msg?.shown) {
      msg.shown = false
      void clearSheet(w, false)
    }
    w.envelope.group.visible = false
    if (paperShown) {
      paperShown = false
      w.paper.group.visible = false
    }
    rig.setSway(1)
    const move = reduced ? (rig.jumpTo(titlePose), Promise.resolve()) : rig.goTo(titlePose, 800, ease.inOut)
    // the 1947 countdown: one leaf comes off the Viceroy's calendar
    const cal = w.calendar
    const day = dayNumber(t.big) ?? dayNumber(t.small)
    let flip: Promise<void> = Promise.resolve()
    if (cal && w.hooks.calendar && day !== null) {
      const to = Math.max(0, w.hooks.calendar.firstDay - (day - 1))
      const from = to + 1
      calDays = to
      if (reduced) cal.show(to)
      else {
        cal.prepareFlip(from, to)
        cal.setFlip(0)
        flip = tweens.wait(420).then(() => {
          cue('flip')
          return tweens.run(700, (k) => cal.setFlip(k), ease.inOut)
        })
      }
    }
    await tweens.wait(reduced ? 0 : 320)
    if (gen !== worldGen) return
    cue('title')
    // the numerals settle like printed type: a touch proud of the wall, then pressed flat
    await tweens.run(reduced ? 250 : 560, (k) => w.title.setShow(Math.min(1, k * 2.2), reduced ? 1 : ease.outBack(k)), ease.linear)
    await move
    await flip
    const held = clock - t0
    await tweens.wait(Math.max(reduced ? 700 : 250, TITLE_MS - held))
  }

  const hideTitle = (w: World) => {
    if (!w.title.group.visible) return Promise.resolve()
    return tweens.run(reduced ? 0 : 320, (k) => w.title.setShow(1 - k, 1), ease.out)
  }

  const runMessage = async (s: SheetSpec) => {
    const token = ++msgToken
    await fontsFor(s.lang, () => {
      if (msg && token === msgToken) stage.redrawMessage(msg.spec)
    })
    const w = world
    if (!w || lost || disposed || token !== msgToken) return
    const gen = worldGen
    liftCaught()
    // the old sheet leaves first if it is still on the desk
    if (w.sheet.group.visible) await clearSheet(w, true)
    if (paperShown) {
      paperShown = false
      w.paper.group.visible = false
    }
    const m = measure(s)
    if (!m || gen !== worldGen) return
    msg = { spec: s, m, shown: true, stamp: null }
    w.sheet.setStamp(null)
    w.sheet.setGlow(0.15)
    drawMessage(w, s, m)
    w.sheet.setOutside(s.to, s.lang, s.channel === 'petition')
    void hideTitle(w)
    rig.setSway(1)
    rig.refresh()
    const rest = sheetRest(w)
    let leaned = false
    const ctx: ArrivalCtx = {
      tw: tweens,
      rig,
      sheet: w.sheet,
      envelope: w.envelope,
      hooks: w.hooks,
      rest,
      metrics: m,
      lang: s.lang,
      reduced,
      cue,
      shake: (a, down) => rig.shake(a, down),
      leanIn: (ms) => {
        leaned = true
        void tweens.run(reduced ? 0 : ms, (k) => w.sheet.setGlow(0.15 + 0.85 * k), ease.inOut)
        if (reduced) {
          rig.jumpTo(readPose)
          return Promise.resolve()
        }
        return rig.goTo(readPose, ms, ease.inOut)
      },
      arrivePose,
      typewriterPose: typewriterPose(w),
      alive: () => gen === worldGen && !lost && !disposed,
    }
    await arrive(s.channel, ctx)
    if (gen !== worldGen) return
    // an arrival that stopped short still ends over the paper
    if (!leaned) await ctx.leanIn(reduced ? 0 : 900)
    w.sheet.setGlow(1)
  }

  const stage: Stage = {
    setEra(d) {
      if (disposed) return
      dressing = d
      paperShown = false
      stamped = null
      caughtState = false
      msg = null
      calDays = null
      msgToken++
      exposureTok++
      exposure = EXPOSURE
      if (lost) {
        fallback?.setEra(d.id)
        return
      }
      renderer.toneMappingExposure = exposure
      rig.setBase(d.camera)
      rig.setSway(1)
      if (!setWorld(d, tier)) return
      tiers.warm(750) // texture generation and shader compiles make the next frames slow
      if (reduced) rig.jump('desk')
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
      const w = world
      if (msg?.shown) {
        msg.shown = false
        w.sheet.group.visible = false
      }
      queue = queue
        .then(() => {
          if (lean) void rig.go('read', reduced ? 0 : 1100, ease.inOut)
          // stay on (or return to) the desk shot; never cut short a move that is already heading there
          else if (rig.shot() !== 'desk') void rig.go('desk', reduced ? 0 : 700, ease.inOut)
          return slidePaper()
        })
        .catch(() => undefined)
    },
    stamp(kind) {
      if (lost) return fallback ? fallback.stamp(kind) : Promise.resolve()
      if (disposed || !world) return Promise.resolve()
      return run(() => doStamp(kind))
    },
    caught() {
      if (disposed || lost || !world) return Promise.resolve()
      caughtState = true
      for (const l of world.warm) l.setDim(0.3)
      world.sheet.setGlow(0.2)
      const dark = setExposure(CAUGHT_EXPOSURE, reduced ? 200 : 700)
      const drop = reduced ? Promise.resolve() : rig.go('caught', 650, ease.out)
      return Promise.all([dark, drop]).then(() => tweens.wait(reduced ? 0 : 250))
    },
    setPaused(p) {
      userPaused = p
      syncRunning()
    },
    establish() {
      if (disposed || lost || !world) return Promise.resolve()
      liftCaught()
      rig.setSway(2.4)
      if (reduced) {
        rig.jumpTo(widePose)
        return Promise.resolve()
      }
      return run(() => rig.goTo(widePose, 1500, ease.inOut))
    },
    dayTitle(t) {
      if (lost) return fallback ? fallback.dayTitle(t) : Promise.resolve()
      if (disposed || !world) return Promise.resolve()
      return run(() => runTitle(t))
    },
    showMessage(s) {
      lastSpec = s
      if (lost) return fallback ? fallback.showMessage(s) : Promise.resolve()
      if (disposed || !world) return Promise.resolve()
      return run(() => runMessage(s))
    },
    redrawMessage(s) {
      lastSpec = s
      if (lost) {
        fallback?.redrawMessage(s)
        return
      }
      const w = world
      if (disposed || !w || !msg) return
      const m = measure(s)
      if (!m) return
      const old = msg.m
      const aspectChanged = Math.abs(m.aspect - old.aspect) > 1e-4
      msg.spec = s
      msg.m = m
      drawMessage(w, s, m)
      if (msg.stamp) {
        // the imprint keeps its place relative to the new layout
        msg.stamp = { ...msg.stamp, u: m.stampAt[0] + (msg.stamp.u - old.stampAt[0]), v: m.stampAt[1] + (msg.stamp.v - old.stampAt[1]) }
        w.sheet.setStamp(msg.stamp)
      }
      if (aspectChanged && msg.shown && w.sheet.fold() === 'flat' && w.sheet.group.visible) {
        const r = sheetRest(w)
        w.sheet.group.position.copy(r.pos)
        rig.refresh()
      }
    },
    flash(kind: FlashKind) {
      if (lost) {
        fallback?.flash(kind)
        return
      }
      const w = world
      if (disposed || !w) return
      cue(kind)
      // R30b: the real-document tag may show now that the verdict is in
      if (msg?.spec.documentMark && !msg.spec.revealed) stage.redrawMessage({ ...msg.spec, revealed: true })
      const fx = w.flash
      fx.fit(camera)
      if (kind === 'right') {
        // a soft saffron glow over the room, and the lamp swells for a breath
        for (const l of w.warm) l.setDim(1.35)
        void tweens.wait(380).then(() => {
          if (!caughtState) for (const l of world?.warm ?? []) l.setDim(1)
        })
        void tweens.run(reduced ? 700 : 1150, (k) => fx.set('right', k < 0.14 ? k / 0.14 : Math.pow(1 - (k - 0.14) / 0.86, 1.6), 0), ease.linear).then(() => fx.set('right', 0, 0))
      } else {
        // a dull thud: the room knocks down a hair and the light sags while red ink bleeds in
        rig.shake(0.004, reduced ? 0 : 0.014)
        for (const l of w.warm) l.setDim(0.72)
        void tweens.wait(500).then(() => {
          if (!caughtState) for (const l of world?.warm ?? []) l.setDim(1)
        })
        void tweens
          .run(reduced ? 800 : 1500, (k) => {
            const spread = reduced ? 1 : 1 - Math.pow(1 - Math.min(1, k / 0.42), 3)
            const amount = k < 0.62 ? 1 : 1 - (k - 0.62) / 0.38
            fx.set('wrong', amount, spread)
          }, ease.linear)
          .then(() => fx.set('wrong', 0, 0))
      }
      // the result card sits over the room: ease back to the desk with the stamped paper on it
      w.sheet.setGlow(0.35)
      void tweens.wait(reduced ? 0 : 280).then(() => {
        if (world === w && !caughtState) return rig.go('desk', reduced ? 0 : 1100, ease.inOut)
      })
    },
    skip() {
      if (disposed || lost) return
      if (ops === 0) {
        tweens.clear()
        return
      }
      skipping = true
      tweens.setInstant(true)
      tweens.clear()
    },
    dispose() {
      if (disposed) return
      disposed = true
      msgToken++
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
      sheetCanvas = null
    },
  }
  return stage
}

