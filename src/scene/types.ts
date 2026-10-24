// Shared scene types. Type-only imports of three keep this module out of the three.js chunk.
import type * as THREE from 'three'
import type { Channel, EraId, Lang } from '../content/types'

export type QualityTier = 'low' | 'mid' | 'high'
export type StampKind = 'asli' | 'tota'
export type V3 = [number, number, number]

/** One message as it is printed on the paper. `drawSheet` in sheet.ts draws it. */
export interface SheetSpec {
  era: EraId
  channel: Channel
  lang: Lang
  /** Replaces the channel's printed heading (Darbar-e-Mualla, TELEGRAM, CONGRESS RADIO …). */
  heading?: string
  from: string
  to: string
  dateLine: string
  /** Replaces the channel's reference number (No. 3408-S …). */
  serial?: string
  /** Already placeholder-filled. A trailing " — Name" is set as a signature line. */
  body: string
  /** Substrings of body, from or to to underline in pencil when `pencil` is true. */
  checks: string[]
  pencil: boolean
  /**
   * A small "real document" tag in the corner, drawn as a paper label (no emoji glyph). It would
   * give the answer away, so it is drawn only when `revealed` is also true (ruling R30b): after
   * the stamp, never while the player decides.
   */
  documentMark?: boolean
  /** The verdict is in: the real-document tag may show. */
  revealed?: boolean
}

/** The ink imprint drawn onto a sheet: `at` is (u, v) across and down the sheet, 0..1. */
export interface SheetStamp {
  kind: StampKind
  at: [number, number]
  rot: number
}

export interface DayTitle {
  big: string
  small: string
}

/** The era-styled rubber stamp on the back of the paper after the verdict. */
export interface RevealStamp {
  text: string
  tone: 'caught' | 'survived' | 'right' | 'wrong'
  /** A Mughal seal (1857), a police stamp (1929), RAIDED (1942), a telegraph office stamp (1947). */
  style: 'seal' | 'police' | 'raided' | 'telegraph'
}

/** The verdict, played out on the same paper: marks on the front, then the back. */
export interface RevealSpec {
  outcome: 'right' | 'wrong' | 'timeout'
  /** Was the message genuine. */
  real: boolean
  /** Show the real-document tag now (it is after the stamp). */
  documentMark: boolean
  /** Substrings of the sheet (body, from, to) to ring in pencil: the slip, or the details that check out. */
  highlight: string[]
  /** One handwritten line in the margin ("X, not Y"). */
  note: string
  /** The paper's reverse side, set in the same form typography. */
  back: {
    verdictLine: string
    tell: string
    /** Only when caught: the era's ending title and its first line. */
    consequence?: string
    stamp?: RevealStamp
    /** Short "Author, Title (Year), p." */
    source: string
  }
  lang: Lang
}

/** A rectangle on screen in CSS pixels, for an accessible button laid over the paper. */
export interface ScreenRect {
  x: number
  y: number
  w: number
  h: number
}

export type FlashKind = 'right' | 'wrong'

/** One of the two intro cards: its heading, its one line and its portrait. */
export interface IntroCard {
  /** YOU / आप, THE TOTA / तोता. */
  label: string
  /** The era's one line about the person (era.persona, era.forger). */
  line: string
  /** The portrait's URL (a small WebP in /art/, fetched when Begin is pressed). */
  art: string
}

/** After Begin: who you are and who the Tota is, as two illustrated cards on the desk. */
export interface IntroSpec {
  era: EraId
  lang: Lang
  you: IntroCard
  tota: IntroCard
}

/**
 * Optional places in an era's room that the stage uses for its choreography. Everything is in
 * world metres (desk top y = 0, +z toward the player). A dressing without hooks gets defaults:
 * the day title on the back wall above the desk, arrivals onto the desk.
 */
export interface DressingHooks {
  /** Where the in-world day title appears: its centre, width, and the way the surface faces. */
  title?: { pos: V3; w: number; yaw?: number; tone?: 'gilt' | 'chalk' | 'cream' | 'glass' }
  /** Extra points the title shot keeps in frame (the 1947 calendar beside the window). */
  titleFrame?: V3[]
  /** What the wide establishing shot must show above the desk (a window, a jharokha). */
  wideFrame?: V3[]
  /** Where an arriving paper starts, off frame (a slid note, a tossed petition, an envelope). */
  entry?: V3
  /** 1947: the tear-off countdown calendar. The stage lays its own pages over the pad face. */
  calendar?: {
    pos: V3
    w: number
    h: number
    draw(g: CanvasRenderingContext2D, w: number, h: number, daysLeft: number): void
    /** The days left on the first day of the window (the pad as built shows this). */
    firstDay: number
  }
  /** 1947: the typewriter. `platen` is the typing line in the machine's frame (origin, yaw). */
  typewriter?: {
    origin: V3
    yaw: number
    platen: V3
    /** Lean of the paper back from vertical, radians. */
    lean: number
    /** The sheet the machine shows at rest; hidden while a telegram is typed. */
    idleSheet?: THREE.Object3D
    /** The carriage (platen, knobs, rail). It slides along the machine's x while typing. */
    carriage?: THREE.Object3D
  }
}

/**
 * One era's desk. `build` adds the room, desk, lamp and props to `scene` and returns per-frame
 * `update` and `dispose`. The stage owns the paper, the two stamps, dust and the camera, and
 * places them on the shared desk layout from `props.ts` (`DESK`, `SPOTS`), so dressings keep
 * those spots clear. A dressing whose shadow-casting parts move calls `markShadowsDirty(scene)`
 * from `props.ts` in `update`, because shadow maps only re-render on request.
 */
export interface EraDressing {
  id: EraId
  build(ctx: { scene: THREE.Scene; tier: QualityTier; rng: () => number }): {
    update(tMs: number): void
    dispose(): void
    /** Places the stage's choreography uses (title wall, calendar, typewriter). */
    hooks?: DressingHooks
  }
  /** The desk shot, authored for a portrait phone (about 390×844). The stage refits it per aspect. */
  camera: { pos: [number, number, number]; look: [number, number, number] }
  /** The warm colour of the era's lamp; tints the fill light and dust. */
  lightColor: number
}

/** Moments the stage marks, for sound: a title lands, a seal cracks, a typewriter dings … */
export type StageCueName =
  | 'title' | 'flip' | 'arrive' | 'seal' | 'unfold' | 'flap'
  // the typewriter: one 'key' per struck character, 'space' per space, 'ding' near the margin, 'return' per line
  | 'key' | 'space' | 'ding' | 'return'
  | 'stamp' | 'right' | 'wrong'
  // the verdict on the paper: the stamp that comes down on its back
  | 'verdictStamp'
  // the caught sequence (see caught.ts): each era's alarm, the knocks coming closer, the hush and the dark
  | 'bugleAlarm' | 'kettleDrum' | 'whistleShort' | 'whistleLong' | 'bootsRunning' | 'airRaidWail' | 'phoneBell'
  | 'knockFar' | 'knockNear' | 'knockDoor' | 'caughtHush' | 'caughtDark'
  // after Begin: an intro card slides onto the desk; the paper clip snaps onto the YOU photo
  | 'cardSlide' | 'clipSnap'

export interface StageOptions {
  reducedMotion: boolean
  forceTier?: QualityTier
  /** Called at each choreography moment (optional; for the audio layer). */
  onCue?: (name: StageCueName) => void
}

export interface Stage {
  setEra(d: EraDressing): void
  /**
   * A fresh sheet slides onto the desk and the camera leans in to read. With `lean: false` the
   * camera keeps the desk shot: the game does that, because its own readable paper covers the
   * sheet there, while the lamp, the stamps and the room stay in view around it.
   */
  showPaper(o?: { lean?: boolean }): void
  /** Raise, move, press, shake; resolves when the stamp is back at rest. */
  stamp(kind: StampKind): Promise<void>
  /**
   * The caught sequence after a wrong stamp or a burnt-out agarbatti, about 4 s (caught.ts has the
   * score): a beat of silence, the era's alarm, the room answering it (red pulses on its rhythm, a
   * beam sweeping through, knocks coming closer), then the dark. Skippable. The dark holds until the
   * next reveal, showMessage, establish or setEra.
   */
  caught(): Promise<void>
  setPaused(p: boolean): void
  dispose(): void

  /** The wide room shot for home, title and setup. Resolves when the camera arrives. */
  establish(): Promise<void>
  /** The day's title appears in the room (wall, window or calendar), about 1.6 s. */
  dayTitle(t: DayTitle): Promise<void>
  /**
   * The era's arrival (arzi, note, envelope or typewriter), then the lean-in over the paper.
   * Resolves when the message is readable. Fonts are loaded first.
   *
   * The lean-in keeps the paper inside the screen minus the HUD. The stage reads the HUD's size
   * from the CSS custom properties `--ft-hud-top`, `--ft-hud-bottom`, `--ft-hud-left` and
   * `--ft-hud-right` (px) on its mount element; without them it assumes a top bar and a row of
   * stamp buttons.
   */
  showMessage(s: SheetSpec): Promise<void>
  /** Language or pencil change: redraws the same sheet, no animation. */
  redrawMessage(s: SheetSpec): void
  /**
   * A room flash after the stamp: green-gold for right. A wrong verdict keeps the room still and
   * silent here: its red comes with the alarm, in caught().
   */
  flash(kind: FlashKind): void
  /** Finishes the current animation (title, arrival, camera move, stamp) at once. */
  skip(): void

  /**
   * The verdict on the paper itself (about 3 s, skippable): pencil rings round `highlight` and the
   * margin note write themselves, then the sheet lifts and turns over to its back, which carries
   * the verdict, the tell, the consequence, an era stamp and the source. Calling it again for the
   * same message (a language change) redraws at once, without the animation.
   */
  reveal(s: RevealSpec): Promise<void>
  /** Where the source line on the paper's back is on screen (CSS px), for an accessible button. */
  getSourceRect(): ScreenRect | null
  /** Where the paper is on screen (CSS px), to place a Next button below it. */
  getPaperRect(): ScreenRect | null

  /**
   * After Begin: the YOU dossier card and the Tota's police notice slide onto the desk and the
   * camera looks down on them (about 1.8 s; skip() finishes it). Resolves once they have settled.
   * Called again while they are there (a language switch, a turned phone), it redraws and
   * re-places them at once.
   */
  intro(s: IntroSpec): Promise<void>
  /** The intro cards leave the desk (about 0.4 s). It is queued, so a day title asked for next plays after it. */
  clearIntro(): Promise<void>
}

/**
 * Dispatched (cancelable) on the stage's mount element when the WebGL context is lost. The app
 * calls `preventDefault()` and mounts its own fallback; if nobody does, the stage mounts
 * `mountFallback` itself. Either way the stage keeps resolving `stamp` and `caught` at once.
 */
export const STAGE_LOST_EVENT = 'ft:stage-lost'
