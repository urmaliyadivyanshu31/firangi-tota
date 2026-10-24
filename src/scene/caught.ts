// The caught sequence's score: what happens, and when, after a wrong stamp (or the agarbatti
// burning out). A beat of silence, then the era's alarm; the room answers it in time (red light on
// the alarm's rhythm, a beam sweeping through the window, knocks on the doors coming closer); then
// the dark and the quiet, and the verdict turns over on the paper.
// No three.js here: the 3D stage and the 2D desk play the same score, and the synth reads the hit
// times inside its own cues (the bugle's figures, the telephone's rings, the knocks' raps) from it,
// so a red pulse always lands with the sound it belongs to.
import type { EraId } from '../content/types'
import type { StageCueName } from './types'

/** The bugle call's three figures, from the start of the bugleAlarm cue (ms). */
export const BUGLE_FIGURES_MS = [0, 520, 1040] as const
/** The kettle drum's roll ends on its accent this long after the cue (ms): with the bugle's last figure. */
export const DRUM_ACCENT_MS = 1060
/** The telephone's double ring: each ring of the bell starts at these offsets (ms) and lasts 400. */
export const PHONE_RINGS_MS = [0, 600] as const
/** The air-raid siren reaches the top of its first rise this long after it starts (ms). */
export const WAIL_RISE_MS = 900
/** The raps in one knock: a far door is pounded twice, the next one twice, yours three times. */
export const KNOCK_RAPS_MS = { far: [0, 170], near: [0, 160], door: [0, 150, 300] } as const

export type KnockKind = keyof typeof KNOCK_RAPS_MS

export interface CaughtBeat {
  /** ms from the start of the sequence */
  at: number
  /** the sound that starts here */
  cue?: StageCueName
  /** a red pulse, 0..1 */
  pulse?: number
  /** one rap of a knock: the room shakes and dust jumps (the cue rides on the knock's first rap) */
  rap?: KnockKind
}

/** A light sweeping across the room from outside: a mashaal, a lantern, a searchlight, a torch. */
export interface CaughtBeam {
  from: number
  to: number
  /** display colour, 0..1 */
  color: [number, number, number]
  /** the cone's half-angle, radians */
  width: number
  /** how bright at its peak (additive, display space) */
  strength: number
  /** how much the light flickers (a flame 0.2, a bulb 0) */
  flicker: number
}

export interface CaughtScore {
  beats: CaughtBeat[]
  beam: CaughtBeam
  /** the lamp flickers once in the silence */
  flicker: [number, number]
  /** the alarm sounds: the camera starts back from the paper and looks up */
  alarm: number
  /** the camera closes back in over the paper, tilting */
  push: [number, number]
  /** the room falls into the dark and goes quiet */
  dark: number
  /** the verdict may turn over */
  end: number
}

/** The beat of silence after the stamp lands, before the alarm. */
export const SILENCE_MS = 280
export const DARK_MS = 3500
export const CAUGHT_MS = 4200

const knock = (kind: KnockKind, at: number): CaughtBeat[] => {
  const cue: StageCueName = kind === 'far' ? 'knockFar' : kind === 'near' ? 'knockNear' : 'knockDoor'
  return KNOCK_RAPS_MS[kind].map((d, i) => ({ at: at + d, rap: kind, ...(i === 0 ? { cue } : {}) }))
}

/** The three knocks, each closer: a door down the lane, the next one, then yours. */
const knocks = (far: number, near: number, door: number): CaughtBeat[] => [...knock('far', far), ...knock('near', near), ...knock('door', door)]

const A = SILENCE_MS

/** Each chapter's caught moment sounds like its own time. */
const ALARMS: Record<EraId, { beats: CaughtBeat[]; beam: CaughtBeam }> = {
  // Delhi 1857: a British bugle sounds the alarm over a kettle drum's roll; a mashaal is carried
  // past the jharokha; the iron ring of the haveli door is beaten against it
  'delhi-1857': {
    beats: [
      { at: A, cue: 'kettleDrum' },
      { at: A + 20 + BUGLE_FIGURES_MS[0], cue: 'bugleAlarm', pulse: 0.7 },
      { at: A + 20 + BUGLE_FIGURES_MS[1], pulse: 0.85 },
      { at: A + DRUM_ACCENT_MS, pulse: 1 },
      ...knocks(2050, 2550, 3000),
    ],
    beam: { from: 1000, to: 2750, color: [1, 0.52, 0.18], width: 0.3, strength: 0.5, flicker: 0.22 },
  },
  // Lahore 1929: police whistles, short, short, long, then boots running up the gali; a police
  // lantern through the shutters; a lathi on the door
  'lahore-1929': {
    beats: [
      { at: A, cue: 'whistleShort', pulse: 0.7 },
      { at: A + 330, cue: 'whistleShort', pulse: 0.8 },
      { at: A + 660, cue: 'whistleLong', pulse: 1 },
      { at: 1350, cue: 'bootsRunning' },
      ...knocks(2300, 2700, 3100),
    ],
    beam: { from: 1100, to: 2800, color: [1, 0.76, 0.42], width: 0.24, strength: 0.45, flicker: 0.07 },
  },
  // Bombay 1942: a police whistle, then the air-raid siren winding up; a searchlight through the
  // slit in the blackout curtain; fists on the door
  'bombay-1942': {
    beats: [
      { at: A, cue: 'whistleLong', pulse: 0.75 },
      { at: 1000, cue: 'airRaidWail', pulse: 0.7 },
      { at: 1000 + WAIL_RISE_MS, pulse: 1 },
      ...knocks(2150, 2600, 3050),
    ],
    beam: { from: 1150, to: 2900, color: [0.74, 0.84, 1], width: 0.14, strength: 0.55, flicker: 0 },
  },
  // Delhi 1947: the office telephone rings, urgent, then a whistle outside; a torch through the
  // rain on the window; knuckles on the glass-panelled door
  'delhi-1947': {
    beats: [
      { at: A + PHONE_RINGS_MS[0], cue: 'phoneBell', pulse: 0.75 },
      { at: A + PHONE_RINGS_MS[1], pulse: 0.85 },
      { at: 1450, cue: 'whistleLong', pulse: 1 },
      ...knocks(2150, 2600, 3050),
    ],
    beam: { from: 1100, to: 2800, color: [1, 0.86, 0.6], width: 0.2, strength: 0.72, flicker: 0.02 },
  },
}

/**
 * The whole sequence for one era, its beats in time order. `silence` is the beat before the alarm:
 * the full SILENCE_MS when the agarbatti burnt out, less when the stamp's own return to the desk
 * has already held the pause (the 3D stage passes what is left), and everything after moves up.
 */
export function caughtScore(era: EraId, silence = SILENCE_MS): CaughtScore {
  const a = ALARMS[era] ?? ALARMS['delhi-1857']
  const quiet = Math.max(0, Math.min(SILENCE_MS, silence))
  const at = (ms: number) => Math.max(0, ms + quiet - SILENCE_MS)
  // the alarm is cut off and the room falls quiet; a low swell under the silence
  const dark: CaughtBeat[] = [{ at: DARK_MS, cue: 'caughtHush' }, { at: DARK_MS, cue: 'caughtDark' }]
  const beats = [...a.beats, ...dark].map((b) => ({ ...b, at: at(b.at) })).sort((x, y) => x.at - y.at)
  return {
    beats,
    beam: { ...a.beam, from: at(a.beam.from), to: at(a.beam.to) },
    flicker: [quiet * 0.32, quiet * 0.62],
    alarm: quiet,
    push: [at(1700), at(DARK_MS)],
    dark: at(DARK_MS),
    end: at(CAUGHT_MS),
  }
}

/** The red light at `ms`: how strong the pulse is now (0..1), and how far in its glow reaches (0..1). */
export function redAt(score: CaughtScore, ms: number): { pulse: number; creep: number } {
  let pulse = 0
  let creep = 0
  for (const b of score.beats) {
    if (!b.pulse || b.at > ms) continue
    const dt = ms - b.at
    pulse = Math.max(pulse, b.pulse * (dt < 70 ? dt / 70 : Math.exp(-(dt - 70) / 420)))
    creep += b.pulse * 0.32 * Math.min(1, dt / 420)
  }
  return { pulse, creep: Math.min(1, 0.12 + creep) }
}

/** The beam at `ms`: how bright (0..1, before its strength) and where it points (-1..1 across). */
export function beamAt(beam: CaughtBeam, ms: number): { amount: number; sweep: number } {
  if (ms <= beam.from || ms >= beam.to) return { amount: 0, sweep: 0 }
  const s = (ms - beam.from) / (beam.to - beam.from)
  const smooth = (a: number, b: number, x: number) => {
    const k = Math.min(1, Math.max(0, (x - a) / (b - a)))
    return k * k * (3 - 2 * k)
  }
  const amount = smooth(0, 0.18, s) * (1 - smooth(0.72, 1, s))
  const flick = beam.flicker ? 1 + beam.flicker * (0.6 * Math.sin(ms * 0.023) + 0.4 * Math.sin(ms * 0.041 + 1.3)) : 1
  // swung across the room: slow at the ends, quick through the middle
  const sweep = -Math.cos(Math.PI * s)
  return { amount: amount * flick, sweep }
}
