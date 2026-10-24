// Era ambience: a calm musical bed, one natural layer recorded in the era's own kind of place, and
// now and then a small sound of the people around you (a page turned, a cup set down, footsteps
// passing). Steady, warm and low on information, so a player can settle in and think; nothing is
// sudden and nothing rises (the agarbatti's ticks stay the only tension).
//
// - Recorded (CC0, see CREDITS.md), loaded lazily: the natural bed (public/audio/<era>.m4a), the
//   instrument (public/audio/<era>-music.m4a: a tanpura, a harmonium) and the room's small sounds
//   (public/audio/room.m4a). A file that fails to load is skipped and the rest carries on.
// - Synthesized (src/audio/ambience-synth.ts): 1942's low pad and valve hum, the 1947 fan, the
//   clocks and the tonga bell.
// - Levels are set by loudness: the whole sits near -34 LUFS with no peak above about -20 dBFS,
//   far under the game's cues and the read-aloud voice (which also ducks it, see engine.ts).
import type { EraId } from '../content/types'
import { ceilingFan, drone, tongaBell, valveHum, wallClock, type Later, type Stoppable } from './ambience-synth'
import { ROOM, ROOM_FILE, type RoomClip } from './room-sprite'

export const BED_FILES: Record<EraId, string> = {
  'delhi-1857': 'delhi-1857.m4a',
  'lahore-1929': 'lahore-1929.m4a',
  'bombay-1942': 'bombay-1942.m4a',
  'delhi-1947': 'delhi-1947.m4a',
}

/** Recorded loops: [file, loop length in seconds] (the AAC file may carry codec padding). */
const BEDS: Record<EraId, [string, number]> = {
  'delhi-1857': [BED_FILES['delhi-1857'], 40],
  'lahore-1929': [BED_FILES['lahore-1929'], 40],
  'bombay-1942': [BED_FILES['bombay-1942'], 40],
  'delhi-1947': [BED_FILES['delhi-1947'], 34],
}
export const MUSIC_FILES: Partial<Record<EraId, [string, number]>> = {
  'delhi-1857': ['delhi-1857-music.m4a', 38.5],
  'lahore-1929': ['lahore-1929-music.m4a', 32],
  'delhi-1947': ['delhi-1947-music.m4a', 18.08],
}

/** Every loop file is stored at this loudness; each era sets where it sits in the room. */
const FILE_LUFS = -24

/** A room sound's momentary loudness (LUFS) before its own offset, and the ceiling on its peak (dBFS). */
const BURST_LUFS = -33
const BURST_PEAK = -24.5
/** The sprite stores every clip with its peak at -3 dBFS. */
const CLIP_PEAK = -3
/** The synthesized tonga bell's strike level, matched by ear to the recorded clips. */
const TONGA_LEVEL = 0.012

/** How often a room sound comes (seconds), and how the whole fades in and out. */
const BURST_GAP: [number, number] = [15, 40]
const FADE_IN = 2.5
const FADE_OUT = 0.6

const dB = (d: number): number => 10 ** (d / 20)

/** A small sound of the room: a recorded clip (`lp` puts it further off), or the synthesized tonga bell. */
type Burst = { clip: RoomClip; db?: number; lp?: number } | { tonga: true; db?: number }

interface RoomCtl {
  later: Later
  /** True while the agarbatti's own clock ticks, so the room's clock keeps quiet. */
  clockHushed: () => boolean
}

interface EraMix {
  /** Where the natural bed and the instrument sit (LUFS, before the master level). */
  bedLufs: number
  musicLufs?: number
  /** The room's steady synthesized sounds (and 1942's pad). */
  steady: (ctx: BaseAudioContext, dest: AudioNode, c: RoomCtl) => Stoppable[]
  /** Six to ten kinds of small sound, one every 15–40 s, never the same twice running. */
  bursts: Burst[]
}

const MIX: Record<EraId, EraMix> = {
  // A Delhi darbar in May: a Mughal garden's fountain, a tanpura in C#, birds in the garden.
  'delhi-1857': {
    bedLufs: -38.5,
    musicLufs: -39,
    steady: () => [],
    bursts: [
      { clip: 'robin', db: -1 }, { clip: 'myna', db: -3 }, { clip: 'wings', db: -2 }, { clip: 'bangles', db: -3, lp: 5000 },
      { clip: 'hookah' }, { clip: 'pen', db: -2 }, { clip: 'page' }, { clip: 'steps', lp: 2200, db: -1 },
      { clip: 'murmur', db: -3 }, { clip: 'pour', db: -2 },
    ],
  },
  // A Lahore student's room in April: a harmonium drone in A, a breeze at the window, a clock far back.
  'lahore-1929': {
    bedLufs: -39,
    musicLufs: -39.5,
    steady: (ctx, dest, c) => [wallClock(ctx, dest, { period: 1, level: 0.15, tone: 1900, hushed: c.clockHushed }, c.later)],
    bursts: [
      { clip: 'page' }, { clip: 'pen', db: -2 }, { clip: 'creak', db: -2 }, { clip: 'cup' }, { clip: 'sparrows', db: -3 },
      { clip: 'steps', lp: 2600 }, { clip: 'door', db: -1 }, { clip: 'cough', db: -4, lp: 2200 }, { clip: 'bell', db: -5, lp: 2600 },
      { tonga: true, db: -4 },
    ],
  },
  // A secret radio room in Bombay, August: steady monsoon rain and the sea far off, a low pad in G,
  // the set's warm hum.
  'bombay-1942': {
    bedLufs: -39,
    steady: (ctx, dest) => [
      drone(ctx, dest, { notes: [[98, 0.5], [146.83, 0.6], [196, 0.55], [233.08, 0.16], [293.66, 0.3]], level: 0.024, tone: 1200, drift: 250, breath: 0.15, breathHz: 0.05 }),
      valveHum(ctx, dest, 0.0035),
    ],
    bursts: [
      { clip: 'page' }, { clip: 'pencil', db: -2 }, { clip: 'creak', db: -2 }, { clip: 'cup' }, { clip: 'stir', db: -1 },
      { clip: 'steps', lp: 1800, db: -1 }, { clip: 'door', db: -2, lp: 1800 }, { clip: 'cough', db: -4, lp: 2000 },
      { clip: 'murmur', db: -4, lp: 500 }, { clip: 'chair', db: -2 },
    ],
  },
  // The Viceroy's House, Delhi, August: a slow ceiling fan, soft rain outside, a slow clock and a
  // tanpura in E (higher and brighter than 1857's).
  'delhi-1947': {
    bedLufs: -39.5,
    musicLufs: -40,
    steady: (ctx, dest, c) => [
      ceilingFan(ctx, dest, { level: 0.085, bladeHz: 2.2 }),
      wallClock(ctx, dest, { period: 1.25, level: 0.13, tone: 1250, hushed: c.clockHushed }, c.later),
    ],
    bursts: [
      { clip: 'page' }, { clip: 'pen', db: -2 }, { clip: 'chair', db: -2 }, { clip: 'cup' }, { clip: 'pour', db: -3 },
      { clip: 'steps', lp: 2400 }, { clip: 'door', db: -1, lp: 2200 }, { clip: 'cough', db: -4, lp: 2200 },
      { clip: 'dove', db: -4 }, { clip: 'murmur', db: -4 },
    ],
  },
}

/** How many kinds of room sound an era has (for tests). */
export function burstKinds(id: EraId): number {
  return MIX[id].bursts.length
}

export interface AmbienceHandle {
  /** Fades out (over `fade` seconds, quickly by default) and stops. */
  stop(fade?: number): void
  /** The agarbatti's clock is ticking: the room's clock keeps quiet for `ms`. */
  hushClock(ms: number): void
}

export interface AmbienceOptions {
  /** A clock for the scheduling (default: setTimeout). */
  later?: Later
  random?: () => number
  /** Seconds between room sounds (default 15–40). */
  burstGap?: [number, number]
  /** False while a room sound should not start (the context sleeps, the voice is reading). */
  canBurst?: () => boolean
  /** Which layers play (all by default); the dev render measures them one at a time. */
  layers?: { bed?: boolean; music?: boolean; steady?: boolean; bursts?: boolean }
}

/**
 * Where a decoded loop really starts and ends: some decoders keep the AAC encoder's priming
 * silence at the front, so the loop starts at the first sound and runs for its known length.
 */
export function loopWindow(buf: AudioBuffer, seconds: number): [number, number] {
  let lead = 0
  try {
    const d = buf.getChannelData(0)
    const max = Math.min(d.length, 4096)
    while (lead < max && Math.abs(d[lead] ?? 0) < 1e-5) lead++
    if (lead >= max) lead = 0
  } catch { /* no samples to read: play the whole buffer */ }
  const start = lead / (buf.sampleRate || 44100)
  const end = Math.min(buf.duration || seconds, start + seconds)
  return [start, end > start ? end : buf.duration || seconds]
}

/**
 * Starts the era's ambience into `dest`. The recordings load through `loadBed`; until they arrive
 * (or if they never do) the synthesized layers play alone.
 */
export function startAmbience(
  ctx: AudioContext,
  dest: AudioNode,
  id: EraId,
  loadBed: (file: string) => Promise<AudioBuffer | null>,
  opts: AmbienceOptions = {},
): AmbienceHandle {
  const mix = MIX[id]
  const rng = opts.random ?? Math.random
  const on = { bed: true, music: true, steady: true, bursts: true, ...opts.layers }
  const rand = (a: number, b: number): number => a + rng() * (b - a)
  const canBurst = opts.canBurst ?? (() => ctx.state === 'running')

  const bus = ctx.createGain()
  bus.gain.setValueAtTime(0.0001, ctx.currentTime)
  bus.gain.linearRampToValueAtTime(1, ctx.currentTime + FADE_IN)
  bus.connect(dest)

  let stopped = false
  const timers: Array<ReturnType<typeof setTimeout>> = []
  const clock: Later = opts.later ?? ((ms, fn) => { timers.push(setTimeout(fn, ms)) })
  const later: Later = (ms, fn) => clock(ms, () => { if (!stopped) fn() })
  let clockQuietUntil = 0
  const ctl: RoomCtl = { later, clockHushed: () => Date.now() < clockQuietUntil }

  const layers: Stoppable[] = []
  if (on.steady) {
    try { layers.push(...mix.steady(ctx, bus, ctl)) } catch { /* never break the room */ }
  }

  // ---- the recorded loops: the natural bed and the instrument ----
  const loops: AudioBufferSourceNode[] = []
  const playLoop = ([file, seconds]: [string, number], lufs: number): void => {
    void loadBed(file).then((buf) => {
      if (stopped || !buf) return
      try {
        const src = ctx.createBufferSource()
        src.buffer = buf
        src.loop = true
        const [a, b] = loopWindow(buf, seconds)
        src.loopStart = a
        src.loopEnd = b
        const g = ctx.createGain()
        g.gain.value = dB(lufs - FILE_LUFS)
        src.connect(g)
        g.connect(bus)
        src.start(ctx.currentTime, a)
        loops.push(src)
      } catch { /* carry on silently */ }
    }).catch(() => { /* carry on silently */ })
  }
  if (on.bed) playLoop(BEDS[id], mix.bedLufs)
  const music = MUSIC_FILES[id]
  if (on.music && music && mix.musicLufs !== undefined) playLoop(music, mix.musicLufs)

  // ---- the room's small sounds ----
  let room: AudioBuffer | null = null
  if (on.bursts) {
    void loadBed(ROOM_FILE).then((buf) => { if (!stopped) room = buf }).catch(() => { /* bells only */ })
  }
  // a shuffled bag: every kind once before any comes again, and never the same twice running
  const kinds = mix.bursts
  let bag: number[] = []
  let last = -1
  const draw = (): number => {
    if (!bag.length) {
      bag = kinds.map((_, n) => n)
      for (let n = bag.length - 1; n > 0; n--) {
        const m = Math.floor(rng() * (n + 1))
        ;[bag[n], bag[m]] = [bag[m]!, bag[n]!]
      }
      // the bag is drawn from its end: the first draw must not repeat the last kind played
      if (bag.length > 1 && bag[bag.length - 1] === last) [bag[0], bag[bag.length - 1]] = [bag[bag.length - 1]!, bag[0]!]
    }
    return bag.pop() ?? 0
  }
  const playBurst = (t: number): void => {
    const i = draw()
    const k = kinds[i]
    if (!k) return
    if ('tonga' in k) {
      last = i
      tongaBell(ctx, bus, t, TONGA_LEVEL * dB((k.db ?? 0) + rand(-1.5, 1)))
      return
    }
    if (!room) { bag.push(i); return } // not loaded yet: this kind waits for the next turn
    last = i
    const [start, dur, lufs] = ROOM[k.clip]
    // set by loudness, a little different each time, and never past the peak ceiling
    const level = dB(Math.min(BURST_LUFS + (k.db ?? 0) + rand(-1.5, 1) - lufs, BURST_PEAK - CLIP_PEAK))
    const rate = rand(0.95, 1.04)
    const len = dur / rate
    const src = ctx.createBufferSource()
    src.buffer = room
    if (src.playbackRate) src.playbackRate.value = rate
    const g = ctx.createGain()
    // the clip already fades in and out; this soft envelope keeps any codec edge off the start
    g.gain.setValueAtTime(0.0001, t)
    g.gain.linearRampToValueAtTime(level, t + Math.min(0.08, len / 4))
    g.gain.setValueAtTime(level, t + len - 0.05)
    g.gain.linearRampToValueAtTime(0.0001, t + len)
    src.connect(g)
    let tail: AudioNode = g
    if (k.lp) {
      const lp = ctx.createBiquadFilter()
      lp.type = 'lowpass'
      lp.frequency.value = k.lp
      g.connect(lp)
      tail = lp
    }
    tail.connect(bus)
    src.start(t, start, dur)
    src.stop(t + len + 0.05)
  }
  const gap = opts.burstGap ?? BURST_GAP
  const nextBurst = (first = false): void => later(rand(first ? gap[0] * 0.6 : gap[0], gap[1]) * 1000, () => {
    try { if (canBurst()) playBurst(ctx.currentTime + 0.05) } catch { /* never break the bed */ }
    nextBurst()
  })
  if (on.bursts) nextBurst(true)

  return {
    stop(fade = FADE_OUT): void {
      if (stopped) return
      stopped = true
      timers.forEach(clearTimeout)
      const now = ctx.currentTime
      bus.gain.cancelScheduledValues(now)
      bus.gain.setValueAtTime(bus.gain.value, now)
      bus.gain.linearRampToValueAtTime(0.0001, now + fade)
      const kill = (): void => {
        for (const l of layers) l.stop()
        for (const s of loops) {
          try { s.stop() } catch { /* already stopped */ }
        }
        try { bus.disconnect() } catch { /* already disconnected */ }
      }
      setTimeout(kill, fade * 1000 + 60) // after the fade
    },
    hushClock(ms: number): void {
      clockQuietUntil = Math.max(clockQuietUntil, Date.now() + ms)
    },
  }
}
