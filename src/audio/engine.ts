// The audio engine: one master gain, synthesized cues, era ambience.
// Everything is a safe no-op until unlock() succeeds, or when Web Audio is missing.
import type { EraId } from '../content/types'
import { startAmbience, type AmbienceHandle } from './ambience'
import { silentUnderAutomation } from './automation'
import { createSampler, type SampleName, type Sampler } from './samples'
import { playCue, type Cue, type CueOptions } from './synth'
import { voice } from './voice'

export type { Cue } from './synth'
export { cueForStage } from './stage-cues'

/** The cues played from the recorded typewriter sprite once it has loaded. */
const SAMPLED: Partial<Record<Cue, SampleName>> = { typeKey: 'key', typeSpace: 'space', typeDing: 'ding', typeReturn: 'return' }

const MASTER_LEVEL = 0.8

/** The ambience under the read-aloud voice: about 8 dB down, in 0.4 s; back up more slowly. */
export const DUCK_LEVEL = 0.4
const DUCK_DOWN_S = 0.4
const DUCK_UP_S = 1.2

/** The agarbatti's clock and tension ticks: the room's own clock stays quiet this long after each. */
const CLOCK_HUSH_MS = 2500

/** Music mode's crossfade: the room fades out (and back in) over this long. */
export const ROOM_CROSSFADE_S = 2.5

/**
 * The caught sequence's beats (src/scene/caught.ts). Music mode's songs dip under them, from the
 * first alarm until a moment after the last beat.
 */
export const ALARM_CUES: ReadonlySet<Cue> = new Set<Cue>([
  'bugleAlarm', 'kettleDrum', 'whistleShort', 'whistleLong', 'bootsRunning', 'airRaidWail', 'phoneBell',
  'knockFar', 'knockNear', 'knockDoor', 'caughtHush', 'caughtDark',
])
export const ALARM_DUCK_MS = 3000

type Ctor = new () => AudioContext

function contextCtor(): Ctor | null {
  const g = globalThis as unknown as { AudioContext?: Ctor; webkitAudioContext?: Ctor }
  return g.AudioContext ?? g.webkitAudioContext ?? null
}

export interface AudioEngine {
  unlock(): void
  setMuted(m: boolean): void
  /** `level` (0..1) is for the tension tick: how close the agarbatti is to burning out. */
  cue(c: Cue, o?: { level?: number }): void
  ambience(id: EraId | null): void
  /** Lowers the ambience (about 8 dB) while the read-aloud voice speaks, and lifts it after. */
  duckAmbience(on: boolean): void
  /** The tab was hidden (the context sleeps) or shown again (it wakes, unless muted). */
  setHidden(hidden: boolean): void
  /**
   * The room's ambience on or off. Off while Music mode's songs play: the room fades out over
   * ROOM_CROSSFADE_S and stays quiet across era changes; back on, it fades in again.
   */
  setRoom(on: boolean): void
  /**
   * Hears when something should sit over the music: the read-aloud voice, or the caught
   * sequence's alarm. Called with true when it starts and false when it is over.
   */
  onDuck(fn: (on: boolean) => void): void
}

export function createAudioEngine(): AudioEngine {
  let ctx: AudioContext | null = null
  let master: GainNode | null = null
  // the ambience's own gain, between its layers and the master: the voice ducks it
  let ambBus: GainNode | null = null
  let ducked = false
  let muted = false
  let hidden = false
  let wanted: EraId | null = null
  let current: AmbienceHandle | null = null
  let roomOn = true
  // what the music hears: the voice's duck, or the alarm's
  let alarmUntil = 0
  let alarmTimer: ReturnType<typeof setTimeout> | undefined
  let musicDucked = false
  const duckers: Array<(on: boolean) => void> = []
  function syncMusicDuck(): void {
    const on = ducked || Date.now() < alarmUntil
    if (on === musicDucked) return
    musicDucked = on
    for (const fn of duckers) {
      try { fn(on) } catch { /* a listener never breaks the sound */ }
    }
  }
  let sampler: Sampler | null = null
  const beds = new Map<string, Promise<AudioBuffer | null>>()

  function applyMute(): void {
    if (master) master.gain.value = muted || silentUnderAutomation() ? 0 : MASTER_LEVEL
  }

  /** Sleeps while the tab is hidden, wakes when it is visible and not muted (saves the battery). */
  function syncRunning(): void {
    const c = ctx
    if (!c) return
    try {
      if (hidden) void c.suspend?.()?.catch?.(() => undefined)
      else if (!muted) void c.resume?.()?.catch?.(() => undefined)
    } catch { /* a context that cannot change state keeps its state */ }
  }

  function loadBed(file: string): Promise<AudioBuffer | null> {
    const c = ctx
    if (!c) return Promise.resolve(null)
    let p = beds.get(file)
    if (!p) {
      const env = (import.meta as { env?: { BASE_URL?: string; AUDIO_REV?: string } }).env
      const base = env?.BASE_URL ?? '/'
      // the build's audio revision: a changed recording under the same name is never served stale
      const rev = env?.AUDIO_REV ? `?v=${env.AUDIO_REV}` : ''
      p = fetch(`${base}audio/${file}${rev}`)
        .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error('bed missing'))))
        .then((data) => c.decodeAudioData(data))
        .catch(() => null)
      beds.set(file, p)
    }
    return p
  }

  function restartAmbience(fade?: number): void {
    current?.stop(fade)
    current = null
    const c = ctx
    if (c && ambBus && wanted && roomOn) {
      // a room sound never starts while the context sleeps or the voice is reading
      current = startAmbience(c, ambBus, wanted, loadBed, { canBurst: () => c.state === 'running' && !ducked })
    }
  }

  function applyDuck(): void {
    const c = ctx
    const g = ambBus?.gain
    if (!c || !g) return
    const now = c.currentTime
    const to = ducked ? DUCK_LEVEL : 1
    try {
      g.cancelScheduledValues(now)
      g.setValueAtTime(g.value, now)
      g.linearRampToValueAtTime(to, now + (ducked ? DUCK_DOWN_S : DUCK_UP_S))
    } catch {
      g.value = to
    }
  }

  return {
    unlock(): void {
      if (ctx) {
        if (!hidden) void ctx.resume?.()?.catch?.(() => undefined)
        return
      }
      const Ctor = contextCtor()
      if (!Ctor) return
      try {
        ctx = new Ctor()
        // Created and resumed inside the user gesture, as iOS Safari requires.
        void ctx.resume?.()?.catch?.(() => undefined)
        master = ctx.createGain()
        master.connect(ctx.destination)
        ambBus = ctx.createGain()
        ambBus.gain.value = ducked ? DUCK_LEVEL : 1
        ambBus.connect(master)
        applyMute()
        // decode the typewriter sprite now, so the first key of a telegram is already instant
        sampler = createSampler(ctx, master, loadBed)
        restartAmbience()
      } catch {
        ctx = null
        master = null
        ambBus = null
      }
    },
    setMuted(m: boolean): void {
      muted = m
      applyMute()
      if (!m) syncRunning() // unmuting on a visible tab wakes a context that slept while hidden
    },
    cue(c: Cue, o?: { level?: number }): void {
      if (ALARM_CUES.has(c)) {
        alarmUntil = Date.now() + ALARM_DUCK_MS
        clearTimeout(alarmTimer)
        alarmTimer = setTimeout(syncMusicDuck, ALARM_DUCK_MS + 20)
        syncMusicDuck()
      }
      if (!ctx || !master || muted) return
      // the agarbatti's clock is ticking: one clock in the room is enough
      if (c === 'clockTick' || c === 'tensionTick') current?.hushClock(CLOCK_HUSH_MS)
      try {
        const s = SAMPLED[c]
        if (s && sampler?.play(s)) return
        // the day title settles in the voice of the era whose room is playing
        const opts: CueOptions = { era: wanted, level: o?.level }
        playCue(ctx, master, c, opts)
      } catch { /* never break the game over a sound */ }
    },
    ambience(id: EraId | null): void {
      // the same room carries on (the chapter begins in the room its page was showing)
      if (id === wanted && (current || !ctx || !roomOn)) return
      wanted = id
      restartAmbience()
    },
    duckAmbience(on: boolean): void {
      if (on === ducked) return
      ducked = on
      applyDuck()
      syncMusicDuck()
    },
    setRoom(on: boolean): void {
      if (on === roomOn) return
      roomOn = on
      if (on) {
        if (!current) restartAmbience() // fades in on its own
      } else {
        current?.stop(ROOM_CROSSFADE_S)
        current = null
      }
    },
    onDuck(fn: (on: boolean) => void): void {
      duckers.push(fn)
    },
    setHidden(h: boolean): void {
      if (h === hidden) return
      hidden = h
      syncRunning()
    },
  }
}

export const audio: AudioEngine = createAudioEngine()

// The room goes quiet under the read-aloud voice (from the moment it is asked for, so the duck is
// down before the first word) and comes back when it ends, stops or fails.
voice.onState((s) => audio.duckAmbience(s === 'loading' || s === 'playing'))
