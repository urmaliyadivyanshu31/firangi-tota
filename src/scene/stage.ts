// The 3D stage: owns the WebGL renderer and its lifecycle, the adaptive quality tier, the render
// loop, and the shared paper, stamps, dust and camera on top of an era's dressing. It also runs the
// day's choreography: the wide room, the day title in the room, each era's arrival of the message
// and the lean-in over the paper, the stamp, and the verdict's flash.
// The app loads this module with a dynamic import (see index.ts) after the first paint.
import * as THREE from 'three'
import type { Lang } from '../content/types'
import { mulberry32, seedFrom } from '../game/rng'
import { arrive, placeAtRest, type ArrivalCtx, type StageCue } from './arrivals'
import { createBeam, type Beam } from './beam'
import { SILENCE_MS, beamAt, caughtScore, redAt, type KnockKind } from './caught'
import { createIntroCards, introPose, type IntroCards, type IntroPlay } from './intro'
import { introReady } from './intro-card'
import { bindParallax, createParallaxModel } from './parallax'
import { mountFallback, type Fallback } from './fallback'
import {
  SHEET_PX,
  SHEET_W,
  createBinPapers,
  createCalendar,
  createEnvelope,
  createFlash,
  createMessageSheet,
  createTitleBoard,
  type BinPaper,
  type BinPapers,
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
import { MARK_COLORS, MAX_ASPECT, TITLE_TONE, drawRevealMarks, drawSheet, drawSheetBack, highlightRects, loadSheetFonts, measureSheet, stampBox, type BackLayout, type SheetMetrics } from './sheet'
import { fitPose, readInsets, rectOnDesk, rectOnWall, safeBox, type NdcBox } from './shots'
import { createTweens, ease, lerp } from './tween'
import {
  STAGE_LOST_EVENT,
  type DayTitle,
  type DressingHooks,
  type EraDressing,
  type FlashKind,
  type IntroSpec,
  type QualityTier,
  type RevealSpec,
  type ScreenRect,
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
/**
 * The toss, in ms: the paper lifts off the desk, flies its arc into the basket, settles, and the
 * shot holds a breath on it. The camera draws back over `cam` from the start. Under reduced motion
 * the paper only fades (`fade`).
 */
const TOSS = { lift: 260, fly: 740, settle: 140, hold: 380, cam: 1000, fade: 320 } as const
/** The most read papers the basket shows; later ones go in under them. */
const BIN_MAX = 7

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
  /** The papers already tossed into the basket. */
  bin: BinPapers
  beam: Beam
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

/** A point on the cubic Bézier a → c1 → c2 → b at t (0..1). */
function cubic(a: THREE.Vector3, c1: THREE.Vector3, c2: THREE.Vector3, b: THREE.Vector3, t: number, out: THREE.Vector3): THREE.Vector3 {
  const u = 1 - t
  const k0 = u * u * u
  const k1 = 3 * u * u * t
  const k2 = 3 * u * t * t
  const k3 = t * t * t
  return out.set(
    a.x * k0 + c1.x * k1 + c2.x * k2 + b.x * k3,
    a.y * k0 + c1.y * k1 + c2.y * k2 + b.y * k3,
    a.z * k0 + c1.z * k1 + c2.z * k2 + b.z * k3,
  )
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
  // the pointer's glance (off under reduced motion; only over empty scene, never over the UI)
  const parallax = createParallaxModel()
  const unbindParallax = reduced ? () => undefined : bindParallax(el, parallax)
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
  // the toss: the papers already in the basket, and today's while it lies there in view (it joins
  // them once the camera has left it); off the desk the sheet casts no contact shadow
  let binned: BinPaper[] = []
  let inBin = false
  let airborne = false
  // after Begin: the two intro cards on the desk (rebuilt at rest with the world)
  let introSpec: IntroSpec | null = null
  let introCards: IntroCards | null = null
  let introToken = 0
  let introJobs = 0 // intro choreography in flight
  let introRush = false // Continue was pressed mid-intro: the cards jump home, then leave

  // the verdict on the paper: what was revealed for which message, and where its source line is
  let revealState: { spec: RevealSpec; token: number; back: BackLayout | null } | null = null
  // the pencil layer and the paper's back: the stage's too, reused for every verdict
  let overlayCanvas: HTMLCanvasElement | null = null
  let backCanvas: HTMLCanvasElement | null = null
  const revealCanvases = (t: QualityTier) => {
    const ow = t === 'low' ? 384 : 512
    const bw = SHEET_PX[t]
    if (!overlayCanvas || overlayCanvas.width !== ow) {
      overlayCanvas ??= document.createElement('canvas')
      overlayCanvas.width = ow
      overlayCanvas.height = Math.ceil(ow * MAX_ASPECT)
    }
    if (!backCanvas || backCanvas.width !== bw) {
      backCanvas ??= document.createElement('canvas')
      backCanvas.width = bw
      backCanvas.height = Math.ceil(bw * MAX_ASPECT)
    }
    return { overlayCanvas, backCanvas }
  }

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
    const sheet = createMessageSheet({ tier: t, canvas: sheetCanvasFor(t), paper: pal.paper, ...revealCanvases(t) })
    sheet.group.visible = false
    const envelope = createEnvelope(t)
    envelope.group.visible = false
    const title = createTitleBoard(t)
    title.place(hooks.title ?? defaultTitle())
    const calendar = hooks.calendar ? createCalendar(hooks.calendar, t) : null
    const flash = createFlash()
    const bin = createBinPapers(t, pal.paper)
    camera.add(flash.mesh)
    const beam = createBeam(t)
    camera.add(beam.mesh)
    scene.add(paper.group, stamps.group, dust.points, sheet.group, sheet.shadow, envelope.group, title.group, bin.group, camera)
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
      bin,
      beam,
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
        bin.dispose()
        camera.remove(flash.mesh)
        flash.dispose()
        camera.remove(beam.mesh)
        beam.dispose()
        scene.traverse((o) => {
          if ((o as THREE.Light).isLight) (o as THREE.Light).dispose()
        })
      },
    }
  }

  const defaultTitle = (): NonNullable<DressingHooks['title']> => ({ pos: [0, 0.5, -0.53], w: 0.46 })
  /** The desk top under the paper (the sheet's shadow lies on it). */
  const deskTop = () => 0

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
    if (msg?.shown && revealState && revealState.token === msgToken) {
      // (a tier change waits out the reveal, so the rebuilt sheet shows its back, already turned)
      paintReveal(w, revealState.spec, 1, true, true)
      w.sheet.setFlip(1)
    }
    // a rebuilt world has no sheet in its basket: today's paper is there as one of the copies
    if (inBin) w.sheet.group.visible = false
    inBin = false
    airborne = false
    w.bin.set(binned.slice(-BIN_MAX))
    if (introSpec) {
      const c = introCardsOn(w)
      c.draw(introSpec)
      c.rest(rig.aspect())
    } else dropIntroCards()
  }

  const dropIntroCards = () => {
    introCards?.dispose()
    introCards = null
  }

  /** The intro cards on this world, made the first time they are needed (and again for a turned screen). */
  const introCardsOn = (w: World): IntroCards => {
    if (introCards && introCards.group.parent === w.scene && introCards.fits(rig.aspect())) return introCards
    dropIntroCards()
    const c = createIntroCards(tier, rig.aspect())
    w.scene.add(c.group)
    introCards = c
    return c
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
    // compile the verdict flash's and the caught beam's shaders now, not on the frame they first show
    const fx = [world.flash.mesh, world.beam.mesh]
    for (const m of fx) m.visible = true
    try {
      renderer.compile(world.scene, camera)
    } catch {
      /* the first frame that shows them compiles them instead */
    }
    for (const m of fx) m.visible = false
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
    // a phone is width-bound: a thinner margin buys a 360 px screen its 17 px body text
    return fitPose({ points: pts, dir, aspect, box: box(aspect < 0.9 ? 0.018 : 0.04) })
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
  /** The era's basket; a room without one gets an unseen basket in front of the desk. */
  const basketOf = (w: World): NonNullable<DressingHooks['basket']> => w.hooks.basket ?? { mouth: [0.4, -0.47, 0.52], r: 0.12, depth: 0.28 }
  /**
   * The toss shot: drawn back from the paper until its spot on the desk and the whole basket fit,
   * seen from the front and above, so the throw lands in plain sight.
   */
  const tossPose: PoseFn = (aspect) => {
    const w = world
    if (!w) return deskPose(aspect)
    const bk = basketOf(w)
    const m = new THREE.Vector3(...bk.mouth)
    const r = sheetRest(w)
    // the basket whole, and the near half of the paper's spot on the desk it came from
    const pts = rectOnDesk(r.pos.clone().add(new THREE.Vector3(0, 0, w.sheet.h() / 4)), SHEET_W, w.sheet.h() / 2, r.yaw)
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2
      pts.push(new THREE.Vector3(m.x + Math.cos(a) * bk.r, m.y, m.z + Math.sin(a) * bk.r))
    }
    pts.push(new THREE.Vector3(m.x, m.y - bk.depth, m.z + (bk.foot ?? bk.r)))
    const portrait = aspect < 0.9
    const dir = new THREE.Vector3(portrait ? 0.1 : 0.2, portrait ? 1.1 : 1.0, 1).normalize()
    return fitPose({ points: pts, dir, aspect, box: box(portrait ? 0.06 : 0.1) })
  }
  /**
   * Where the n-th tossed paper comes to rest: standing in the basket, leaned back against the
   * wicker so its top shows over the rim, each turned a little from the last. Papers already in
   * the basket raise the floor it lands on.
   */
  const binPose = (bk: NonNullable<DressingHooks['basket']>, h: number, n: number): BinPaper => {
    const m = new THREE.Vector3(...bk.mouth)
    const floor = m.y - bk.depth + Math.min(n, BIN_MAX) * 0.012
    const room = m.y - floor
    // a shallow basket lays the paper over; a deep one stands it up
    const lean = Math.asin(Math.min(0.94, Math.max(0.38, (room * 1.05) / h)))
    // each paper faces the room a little differently, its written side up
    const yaw = (((n * 0.618) % 1) - 0.5) * 0.8
    const quat = new THREE.Quaternion()
      .setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw)
      .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), lean))
    // its foot stands on the floor, inside the wicker (the corners clear the narrow foot); its top
    // leans back across the mouth
    const half = SHEET_W / 2
    const lift = (h / 2) * Math.sin(lean)
    const back = (h / 2) * Math.cos(lean)
    const foot = (bk.foot ?? bk.r) - 0.008
    const shift = Math.max(0, back - Math.sqrt(Math.max(0, foot * foot - half * half)))
    const pos = new THREE.Vector3(m.x - Math.sin(yaw) * shift, floor + lift + 0.006, m.z - Math.cos(yaw) * shift)
    return { pos, quat, h }
  }
  rig.override('desk', deskPose)

  // ------------------------------------------------------------ the HUD insets

  /** The app publishes its HUD's footprint as --ft-hud-* on the mount; a change re-fits the shot. */
  let insetKey = ''
  const insetSignature = () => {
    const i = readInsets(el, cssW, cssH)
    return `${Math.round(i.top)}|${Math.round(i.right)}|${Math.round(i.bottom)}|${Math.round(i.left)}|${cssW}x${cssH}`
  }
  let insetFrames = 0
  const watchInsets = () => {
    if (++insetFrames < 12) return
    insetFrames = 0
    const key = insetSignature()
    if (key === insetKey) return
    const first = insetKey === ''
    insetKey = key
    if (first) return
    rig.refresh()
    // ease into the new framing from wherever the camera is
    void rig.go(rig.shot(), reduced ? 0 : 450, ease.inOut)
  }

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
    watchInsets()
    const glance = parallax.step(step)
    rig.setParallax(glance.yaw, glance.pitch)
    rig.update(step, clock)
    if (airborne || inBin) w.sheet.shadow.visible = false
    else w.sheet.updateShadow(deskTop())
    if (w.flash.mesh.visible) w.flash.fit(camera)
    if (w.beam.mesh.visible) w.beam.fit(camera, clock)
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
    caughtAbort?.()
    // display:none, not visibility:hidden, so the fallback canvas gets the mount's box
    renderer.domElement.style.display = 'none'
    const ev = new CustomEvent(STAGE_LOST_EVENT, { cancelable: true, detail: { era: dressing?.id, reason } })
    const appHandled = !el.dispatchEvent(ev)
    if (!appHandled && !disposed) {
      const fb = mountFallback(el, dressing?.id ?? 'delhi-1857', { onCue: cue })
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
    // dev hook: hold the camera at a pose, to look round a room for a shoot
    const pose = (pos: V3, look: V3, fov = 50) => rig.jumpTo(() => ({ pos: new THREE.Vector3(...pos), look: new THREE.Vector3(...look), fov }))
    ;(window as unknown as { __ftStage?: unknown }).__ftStage = { info: debugInfo, setTier, pose }
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
  const run = (fn: () => Promise<void>, now = false): Promise<void> => {
    ops++
    busy++
    // `now` starts at once instead of after the queue (the intro cuts in on the wide shot); what is
    // queued later still waits for it
    const job = (now ? Promise.resolve() : queue)
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
    queue = now ? Promise.all([queue, job]).then(() => undefined) : job
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
    w.sheet.setFlip(0)
    w.sheet.setOverlay(false)
    revealState = null
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
          lastImpact = clock
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
    rig.setParallaxScale(1)
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
    // yesterday's paper, still lying in the basket, joins the others now that it is out of sight
    if (gen === worldGen) settleBin(w)
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
    // a paper still in the basket stays there; the old sheet leaves first if it is still on the desk
    settleBin(w)
    if (w.sheet.group.visible) await clearSheet(w, true)
    if (paperShown) {
      paperShown = false
      w.paper.group.visible = false
    }
    const m = measure(s)
    if (!m || gen !== worldGen) return
    msg = { spec: s, m, shown: true, stamp: null }
    revealState = null
    w.sheet.setFlip(0)
    w.sheet.setOverlay(false)
    w.sheet.setStamp(null)
    w.sheet.setGlow(0.15)
    drawMessage(w, s, m)
    w.sheet.setOutside(s.to, s.lang, s.channel === 'petition')
    void hideTitle(w)
    rig.setSway(1)
    rig.setParallaxScale(1)
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
        rig.setParallaxScale(0.06)
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
      skipping: () => skipping,
    }
    await arrive(s.channel, ctx)
    if (gen !== worldGen) return
    // an arrival that stopped short still ends over the paper
    if (!leaned) await ctx.leanIn(reduced ? 0 : 900)
    w.sheet.setGlow(1)
  }

  /** Draws the verdict's pencil layer (at `progress`) and the back (with or without its stamp). */
  const paintReveal = (w: World, r: RevealSpec, progress: number, withBack: boolean, stamped: boolean) => {
    if (!msg) return
    const g = w.sheet.canvas.getContext('2d')
    const oc = overlayCanvas
    const bc = backCanvas
    if (!g || !oc || !bc) return
    const hl = highlightRects(g, msg.spec, r.highlight, msg.m.aspect)
    const og = oc.getContext('2d')
    if (og && w.sheet.overlay) {
      og.setTransform(1, 0, 0, 1, 0, 0)
      og.clearRect(0, 0, oc.width, oc.height)
      drawRevealMarks(og, oc.width, Math.round(oc.width * msg.m.aspect), hl, {
        color: r.real ? MARK_COLORS.verified : MARK_COLORS.slip,
        note: r.note,
        lang: r.lang,
        body: msg.m.body,
        bodyEnd: msg.m.bodyEnd,
        progress,
        avoid: [stampBox(msg.stamp?.u ?? msg.m.stampAt[0], msg.stamp?.v ?? msg.m.stampAt[1], msg.m.aspect)],
      })
      w.sheet.overlay.needsUpdate = true
      w.sheet.setOverlay(true)
    }
    if (!withBack) return
    const bg = bc.getContext('2d')
    if (bg && w.sheet.reverse) {
      bg.setTransform(1, 0, 0, 1, 0, 0)
      const used = Math.round(bc.width * msg.m.aspect)
      const layout = drawSheetBack(bg, bc.width, used, msg.spec, r, { stamp: stamped })
      bg.fillStyle = '#e9dcc0'
      bg.fillRect(0, used, bc.width, bc.height - used)
      w.sheet.reverse.needsUpdate = true
      if (revealState) revealState.back = layout
    }
  }

  const runReveal = async (r: RevealSpec) => {
    const w = world
    if (!w || !msg?.shown || lost || disposed) return
    const gen = worldGen
    const again = !!revealState && revealState.token === msgToken
    revealState = { spec: r, token: msgToken, back: revealState?.back ?? null }
    // the real-document tag may show now, after the stamp (R30b)
    const front: SheetSpec = { ...msg.spec, documentMark: r.documentMark, revealed: true }
    if (front.documentMark !== msg.spec.documentMark || msg.spec.revealed !== true) {
      msg.spec = front
      drawMessage(w, front, msg.m)
    }
    liftCaught()
    w.sheet.setGlow(1)
    rig.setParallaxScale(0.06)
    // always re-fit: the verdict's buttons may have changed the HUD since the lean-in
    insetKey = insetSignature()
    rig.refresh()
    void rig.goTo(readPose, reduced ? 0 : 650, ease.inOut)
    if (again || reduced) {
      paintReveal(w, r, 1, true, true)
      w.sheet.setFlip(1)
      return
    }
    // 1. the pencil rings the words, then the note writes itself in the margin
    paintReveal(w, r, 0, true, false)
    let last = -1
    await tweens.run(1400, (k) => {
      const q = Math.round(k * 14) / 14
      if (q !== last && gen === worldGen) {
        last = q
        paintReveal(w, r, q, false, false)
      }
    })
    if (gen !== worldGen) return
    paintReveal(w, r, 1, false, false)
    await tweens.wait(320)
    // 2. the paper lifts toward you and turns over, like a page
    cue('unfold')
    await tweens.run(reduced ? 0 : 950, (k) => w.sheet.setFlip(k), ease.inOut)
    w.sheet.setFlip(1)
    // 3. the era's stamp comes down on the back
    await tweens.wait(160)
    if (gen !== worldGen) return
    paintReveal(w, r, 1, true, true)
    cue('verdictStamp')
    rig.shake(0.007, 0.004)
    await tweens.wait(300)
  }

  /** Today's sheet, lying in the basket, joins the papers there (once the camera has left it). */
  const settleBin = (w: World) => {
    if (!inBin) return
    inBin = false
    const g = w.sheet.group
    g.visible = false
    w.sheet.setStamp(null)
    w.sheet.setFlip(0)
    w.sheet.setOverlay(false)
    revealState = null
    w.bin.set(binned.slice(-BIN_MAX))
  }

  /** The basket rocks on its foot when the paper drops in, and settles. */
  const rockBasket = (obj: THREE.Object3D | undefined, along: THREE.Vector3) => {
    if (!obj) return
    const q0 = obj.quaternion.clone()
    const axis = new THREE.Vector3(0, 1, 0).cross(along).normalize()
    const q = new THREE.Quaternion()
    const gen = worldGen
    void tweens
      .run(560, (k) => {
        if (gen !== worldGen) return
        obj.quaternion.copy(q0).premultiply(q.setFromAxisAngle(axis, 0.045 * Math.sin(k * Math.PI * 3) * (1 - k)))
      })
      .then(() => {
        if (gen === worldGen) obj.quaternion.copy(q0)
      })
  }

  const runToss = async () => {
    const w = world
    if (!w || !msg?.shown || lost || disposed) return
    const gen = worldGen
    const g = w.sheet.group
    const bk = basketOf(w)
    const h = w.sheet.h()
    const rest = binPose(bk, h, binned.length)
    const land = () => {
      if (msg) msg.shown = false
      binned.push(rest)
      inBin = true
    }
    if (reduced) {
      // no arc: the paper fades from the desk (the sounds still tell it went in the basket), and
      // is in the basket when the room is next seen
      cue('toss')
      await tweens.run(TOSS.fade, (k) => w.sheet.setFade(1 - k), ease.out)
      if (gen !== worldGen) return
      g.visible = false
      w.sheet.setFade(1)
      cue('tossLand')
      land()
      settleBin(w)
      return
    }
    airborne = true
    rig.setSway(1)
    rig.setParallaxScale(0.35)
    rig.refresh()
    const cam = rig.goTo(tossPose, TOSS.cam, ease.inOut)
    cue('toss')
    // 1. it lifts off the desk, tipping toward the basket, as if picked up
    const p0 = g.position.clone()
    const q0 = g.quaternion.clone()
    const mouth = new THREE.Vector3(...bk.mouth)
    const toward = mouth.clone().sub(p0).setY(0).normalize()
    const across = new THREE.Vector3(0, 1, 0).cross(toward).normalize()
    const p1 = p0.clone().add(new THREE.Vector3(0, 0.045, 0)).addScaledVector(toward, 0.02)
    const q1 = new THREE.Quaternion().setFromAxisAngle(across, 0.2).multiply(q0)
    await tweens.run(TOSS.lift, (k) => {
      g.position.lerpVectors(p0, p1, k)
      g.quaternion.slerpQuaternions(q0, q1, k)
    }, ease.out)
    if (gen !== worldGen) return
    // 2. the arc: up and out over the desk's edge, then down into the mouth, turning over once
    const c1 = p1.clone().addScaledVector(toward, 0.14).add(new THREE.Vector3(0, 0.27, 0))
    const c2 = mouth.clone().add(new THREE.Vector3(0, 0.36, 0))
    const end = rest.pos
    const spin = new THREE.Quaternion()
    const tmp = new THREE.Vector3()
    await tweens.run(TOSS.fly, (t) => {
      if (gen !== worldGen) return
      g.position.copy(cubic(p1, c1, c2, end, t, tmp))
      const turn = ease.inOut(t)
      g.quaternion.slerpQuaternions(q1, rest.quat, turn).premultiply(spin.setFromAxisAngle(across, Math.PI * 2 * turn))
    }, ease.linear)
    if (gen !== worldGen) return
    // 3. it lands: a rustle in the wicker, the basket rocks, the sheet settles
    g.position.copy(end)
    g.quaternion.copy(rest.quat)
    cue('tossLand')
    rockBasket(bk.obj, toward)
    land()
    airborne = false
    const sink = end.clone()
    await tweens.run(TOSS.settle, (k) => g.position.copy(sink).add(tmp.set(0, -0.008 * Math.sin(k * Math.PI), 0)), ease.out)
    g.position.copy(end)
    await Promise.all([cam, tweens.wait(TOSS.hold)])
  }

  // A phone is width-bound: a thin margin, since every pixel of card width is type size. A wide
  // screen keeps the pair to about four fifths of its width, centred between the plaques and the
  // Continue slip (which the app then sets just under the cards).
  const introPoseFn: PoseFn = (aspect) => {
    if (aspect < 0.9) return introPose(aspect, box(0.02))
    const b = box(0.012)
    const hw = aspect > 1.9 ? 0.9 : 0.8
    return introPose(aspect, { ...b, x0: Math.max(b.x0, -hw), x1: Math.min(b.x1, hw) })
  }

  const introPlay = (token: number): IntroPlay => {
    const gen = worldGen
    return {
      tw: tweens,
      reduced,
      aspect: rig.aspect(),
      cue,
      alive: () => gen === worldGen && token === introToken && !lost && !disposed,
      skipping: () => skipping || introRush,
    }
  }

  /** The intro cards slide onto the desk under the camera; again for the same intro, they redraw in place. */
  const runIntro = async (s: IntroSpec) => {
    const token = ++introToken
    const again = !!introCards?.shown() && introSpec?.era === s.era
    introSpec = s
    // the camera heads for the desk at once, while the faces and the portraits load
    rig.setSway(1)
    rig.setParallaxScale(0.3)
    // (again, the camera stays: a turned screen re-fits the shot by itself)
    const move = again ? Promise.resolve() : reduced ? (rig.jumpTo(introPoseFn), Promise.resolve()) : rig.goTo(introPoseFn, 1100, ease.inOut)
    const t0 = clock
    await introReady(s, 1200, () => {
      if (token === introToken && introSpec === s && world) introCardsOn(world).draw(s)
    })
    const w = world
    if (!w || lost || disposed || token !== introToken) return
    const c = introCardsOn(w)
    c.draw(s)
    if (again) {
      c.rest(rig.aspect())
      return
    }
    const gen = worldGen
    // the cards come in once the camera is most of the way down, so their landing is seen close
    await c.play({ ...introPlay(token), delay: Math.max(0, 520 - (clock - t0)) })
    await move
    // a beat after the cards settle, the parrot on the notice winks
    if (!reduced && gen === worldGen) {
      void tweens.wait(900).then(() => {
        if (token === introToken && introCards === c) return c.wink(introPlay(token))
      })
    }
  }

  const runClearIntro = async () => {
    const c = introCards
    if (!c || lost || disposed) return
    await c.leave(introPlay(introToken))
    if (introCards === c && !introSpec) dropIntroCards()
  }

  // ------------------------------------------------------------ the caught sequence

  /** Startled: the camera sits back from the paper and looks up, toward the window and the door. */
  const startledPose: PoseFn = (aspect) => {
    const d = deskPose(aspect)
    return { pos: d.pos.clone().add(new THREE.Vector3(0, -0.025, 0.03)), look: d.look.clone().add(new THREE.Vector3(0, 0.08, -0.06)), fov: d.fov }
  }
  /**
   * Closing in: the camera moves straight in toward the paper from where it sat back, so the paper
   * holds its place on the screen while the view tilts down onto it and the room leans.
   */
  const closingPose: PoseFn = (aspect) => {
    const s = startledPose(aspect)
    const paper = world ? sheetRest(world).pos : paperRest()
    return { pos: s.pos.clone().lerp(paper, 0.42), look: paper, fov: s.fov, roll: 0.035 }
  }
  /** Where the beam comes from (the window the dressing keeps in its wide shot), and how far along it the light is carried. */
  const beamSource = (w: World): { origin: THREE.Vector3; travel: THREE.Vector3 } => {
    const pts = wallPoints(w)
    const c = new THREE.Vector3()
    let x0 = Infinity
    let x1 = -Infinity
    for (const p of pts) {
      c.add(p)
      x0 = Math.min(x0, p.x)
      x1 = Math.max(x1, p.x)
    }
    c.multiplyScalar(1 / Math.max(1, pts.length))
    return { origin: c, travel: new THREE.Vector3(Number.isFinite(x1 - x0) ? (x1 - x0) * 0.35 : 0.1, 0, 0) }
  }
  /** Each rap of a knock, closer each time: how hard the room shakes, the dust jumps, the flame gutters. */
  const RAPS: Record<KnockKind, { shake: number; down: number; dust: number; dip: number }> = {
    far: { shake: 0.0015, down: 0, dust: 0, dip: 0 },
    near: { shake: 0.004, down: 0.002, dust: 0.5, dip: 0.55 },
    door: { shake: 0.009, down: 0.006, dust: 1, dip: 0.38 },
  }
  const ALARM_LAMP = 0.78
  const MIN_SILENCE = 120 // the lamp's flicker still gets its breath after the stamp has come home
  let lastImpact = -Infinity // (stage clock) when a stamp last hit the paper
  // ends a caught sequence at once when its world goes (setEra, a lost context, dispose), so the
  // choreography queued behind it never waits out the rest of the alarm
  let caughtAbort: (() => void) | null = null

  /** Plays the era's score (caught.ts) on one tween: a skip or a lost context lands every beat silently. */
  const runCaught = async () => {
    const w = world
    if (!w || !dressing || lost || disposed) return
    const gen = worldGen
    const alive = () => gen === worldGen && !lost && !disposed
    // the stamp's return to its rest has already held part of the pause before the alarm
    const sinceImpact = clock - lastImpact
    const score = caughtScore(dressing.id, sinceImpact < 2000 ? Math.max(MIN_SILENCE, SILENCE_MS - sinceImpact) : SILENCE_MS)
    caughtState = true
    w.beam.setup({ ...beamSource(w), color: score.beam.color, width: score.beam.width, cone: score.beam.shape === 'cone' })
    w.flash.fit(camera)
    const lamps = (k: number, now = false) => {
      for (const l of w.warm) l.setDim(k, now)
    }
    let next = 0
    let sounded = false // something is ringing, so a skip or an abort must hush it
    let flickered = false
    let relit = false
    let alarmed = false
    let pushed = false
    let darkened = false
    const step = (ms: number) => {
      if (!alive()) return
      const quiet = skipping
      for (let b = score.beats[next]; b && b.at <= ms; b = score.beats[++next]) {
        if (quiet) continue
        if (b.cue) {
          cue(b.cue)
          sounded = b.cue !== 'caughtHush' && b.cue !== 'caughtDark'
        }
        if (b.rap) {
          const r = RAPS[b.rap]
          rig.shake(r.shake, r.down) // (the rig keeps still under reduced motion)
          w.dust.kick(r.dust)
          if (r.dip && !reduced && !darkened) {
            lamps(r.dip, true)
            lamps(ALARM_LAMP)
          }
        }
      }
      if (quiet && sounded) {
        sounded = false
        cue('caughtHush')
      }
      // 0. the stamp has landed: silence, and the lamp flickers once
      if (!flickered && ms >= score.flicker[0]) {
        flickered = true
        lamps(reduced ? 0.55 : 0.15, !reduced)
      }
      if (!relit && ms >= score.flicker[1]) {
        relit = true
        lamps(1, !reduced)
      }
      // 1. the alarm: the light sags, the camera starts back from the paper and looks up
      if (!alarmed && ms >= score.alarm) {
        alarmed = true
        lamps(ALARM_LAMP)
        if (!reduced) void rig.goTo(startledPose, 1150, ease.inOut)
      }
      // 2. the room closes in: the camera moves in on the paper, tilting, while the knocks come
      if (!pushed && ms >= score.push[0]) {
        pushed = true
        if (!reduced) void rig.goTo(closingPose, score.push[1] - score.push[0], ease.inOutSine)
      }
      // 3. the dark, and the quiet
      if (!darkened && ms >= score.dark) {
        darkened = true
        lamps(0.3)
        w.sheet.setGlow(0.2)
        void setExposure(CAUGHT_EXPOSURE, reduced ? 300 : 700)
      }
      // the red light: a red lamp's glow pulsing on the alarm's hits, reaching a little further in
      // each time; one slow tint under reduced motion; gone by the time the paper turns over
      let amount = 0
      let spread = 0
      let wash = 0
      if (ms >= score.alarm) {
        if (reduced) {
          const e = ms - score.alarm
          amount = e < 260 ? (e / 260) * 0.85 : 0.85 * Math.max(0, 1 - (e - 260) / 1700)
          spread = 1
          wash = amount * 0.6
        } else {
          const red = redAt(score, ms)
          amount = 0.38 + 0.62 * red.pulse
          spread = red.creep
          wash = red.pulse * 0.9
        }
        if (ms > score.dark) amount *= Math.max(0, 1 - (ms - score.dark) / 600)
      }
      w.flash.set('wrong', amount, spread, wash)
      // the beam sweeping through (none under reduced motion)
      const beam = reduced ? { amount: 0, sweep: 0 } : beamAt(score.beam, ms)
      w.beam.set(beam.amount * score.beam.strength, beam.sweep)
    }
    const done = tweens.run(score.end, (k) => step(k * score.end), ease.linear)
    await new Promise<void>((resolve) => {
      caughtAbort = resolve
      void done.then(resolve)
    })
    caughtAbort = null
    if (!alive()) {
      if (sounded) cue('caughtHush')
      return
    }
    step(score.end)
    w.flash.set('wrong', 0, 0)
    w.beam.set(0, 0)
  }

  /** The screen box (CSS px) round some world points, or null off screen. */
  const screenRect = (pts: THREE.Vector3[]): ScreenRect | null => {
    camera.updateMatrixWorld()
    let x0 = Infinity
    let y0 = Infinity
    let x1 = -Infinity
    let y1 = -Infinity
    for (const p of pts) {
      const v = p.clone().project(camera)
      if (v.z > 1) return null
      const x = ((v.x + 1) / 2) * cssW
      const y = ((1 - v.y) / 2) * cssH
      x0 = Math.min(x0, x)
      y0 = Math.min(y0, y)
      x1 = Math.max(x1, x)
      y1 = Math.max(y1, y)
    }
    return Number.isFinite(x0) ? { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } : null
  }

  const stage: Stage = {
    setEra(d) {
      if (disposed) return
      caughtAbort?.()
      dressing = d
      paperShown = false
      stamped = null
      caughtState = false
      msg = null
      revealState = null
      calDays = null
      binned = []
      msgToken++
      introSpec = null
      introToken++
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
      // (a lost stage resolves at once, as STAGE_LOST_EVENT promises: the app plays it on its own desk)
      if (disposed || lost || !world) return Promise.resolve()
      return run(() => runCaught())
    },
    setPaused(p) {
      userPaused = p
      syncRunning()
    },
    establish() {
      if (disposed || lost || !world) return Promise.resolve()
      liftCaught()
      rig.setSway(2.4)
      rig.setParallaxScale(1)
      if (reduced) {
        rig.jumpTo(widePose)
        return Promise.resolve()
      }
      return run(() => rig.goTo(widePose, 1500, ease.inOut))
    },
    dayTitle(t) {
      if (lost) return fallback ? fallback.dayTitle(t) : Promise.resolve()
      if (disposed || !world) return Promise.resolve()
      if (introSpec) void stage.clearIntro() // the cards never stay under a day
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
      // R30b: the real-document tag may show now that the verdict is in
      if (msg?.spec.documentMark && !msg.spec.revealed) stage.redrawMessage({ ...msg.spec, revealed: true })
      // a wrong verdict holds still and silent: the red comes with the alarm, in caught()
      if (kind === 'wrong') return
      cue(kind)
      const fx = w.flash
      fx.fit(camera)
      // a soft saffron glow over the room, and the lamp swells for a breath
      for (const l of w.warm) l.setDim(1.35)
      void tweens.wait(380).then(() => {
        if (!caughtState) for (const l of world?.warm ?? []) l.setDim(1)
      })
      void tweens.run(reduced ? 700 : 1150, (k) => fx.set('right', k < 0.14 ? k / 0.14 : Math.pow(1 - (k - 0.14) / 0.86, 1.6), 0), ease.linear).then(() => fx.set('right', 0, 0))
      // (the camera stays on the paper: the verdict plays out on it, see reveal)
    },
    reveal(r) {
      if (lost) return fallback ? fallback.reveal(r) : Promise.resolve()
      if (disposed || !world) return Promise.resolve()
      return run(() => runReveal(r))
    },
    intro(s) {
      if (lost) return fallback ? fallback.intro(s) : Promise.resolve()
      if (disposed || !world) return Promise.resolve()
      liftCaught()
      introJobs++
      return run(() => runIntro(s), true).finally(() => {
        introJobs--
        if (introRush && introJobs === 0) {
          introRush = false
          if (!skipping && !lost && !disposed) tweens.setInstant(false)
        }
      })
    },
    clearIntro() {
      if (lost) return fallback ? fallback.clearIntro() : Promise.resolve()
      if (disposed || !world || (!introSpec && !introCards)) return Promise.resolve()
      const animating = introSpec !== null && introJobs > 0
      introSpec = null
      introToken++
      if (animating) {
        // the cards are still on their way: their motion ends at once where they are (quietly),
        // and they leave from there; the day after them is animated as usual
        introRush = true
        tweens.setInstant(true)
        tweens.clear()
      }
      return run(runClearIntro)
    },
    getSourceRect() {
      if (lost) return fallback?.getSourceRect() ?? null
      const w = world
      const src = revealState?.back?.source
      if (!w || !src || w.sheet.flip() < 0.999 || !w.sheet.group.visible) return null
      return screenRect([[src.u0, src.v0], [src.u1, src.v0], [src.u1, src.v1], [src.u0, src.v1]].map(([u = 0, v = 0]) => w.sheet.backPointAt(u, v)))
    },
    toss() {
      if (lost) return fallback ? fallback.toss() : Promise.resolve()
      if (disposed || !world) return Promise.resolve()
      return run(() => runToss())
    },
    getPaperRect() {
      if (lost) return fallback?.getPaperRect() ?? null
      const w = world
      // during the intro, the paper on the desk is the two cards
      if (w && introSpec && introCards?.shown() && !msg?.shown) return screenRect(introCards.corners())
      if (!w || !msg?.shown || !w.sheet.group.visible) return null
      const flipped = w.sheet.flip() > 0.5
      return screenRect([[0, 0], [1, 0], [1, 1], [0, 1]].map(([u = 0, v = 0]) => (flipped ? w.sheet.backPointAt(u, v) : w.sheet.pointAt(u, v))))
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
      caughtAbort?.()
      msgToken++
      syncRunning()
      tweens.setInstant(true)
      tweens.clear()
      document.removeEventListener('visibilitychange', syncRunning)
      unbindParallax()
      window.removeEventListener('resize', onResize)
      window.clearTimeout(resizeTimer)
      ro?.disconnect()
      if (overlayTimer) window.clearInterval(overlayTimer)
      overlay?.remove()
      dropIntroCards()
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

