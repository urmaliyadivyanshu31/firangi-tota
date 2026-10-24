// The audio engine: one master gain, synthesized cues, era ambience.
// Everything is a safe no-op until unlock() succeeds, or when Web Audio is missing.
import type { EraId } from '../content/types'
import { loopWindow, startAmbience, type AmbienceHandle } from './ambience'
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

/**
 * The record's Focus tracks (src/content/focus.ts) play on their own music bus into the master, so
 * the sound switch mutes them; the volume knob sets the bus. They fade in over FOCUS_FADE_IN_S,
 * dip to FOCUS_DUCK_RATIO under the voice and the alarm (as the songs do), and fade out on a change.
 */
export const FOCUS_FADE_IN_S = 4
export const FOCUS_FADE_OUT_S = 1.5
export const FOCUS_DUCK_RATIO = 0.6
/** The bus at full volume: the files sit at -26 LUFS, so at the default volume they play near -30. */
export const FOCUS_LEVEL = 1.15
/** A track that has not arrived and decoded by then is given up (the record stops, the room comes back). */
export const FOCUS_LOAD_GUARD_MS = 20_000

export interface FocusSpec {
  file: string
  /** The loop's length in seconds. */
  seconds: number
}
export type FocusState = 'loading' | 'playing' | 'stopped' | 'failed'

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
  /** Plays a Focus track (null stops it). Kept until the audio unlocks, and across a hidden tab. */
  focus(track: FocusSpec | null): void
  /** The music volume, 0..1: the Focus tracks' bus. */
  setMusicVolume(v: number): void
  /** Hears the Focus track's state: loading, playing, stopped, or failed (it could not load). */
  onFocus(fn: (s: FocusState) => void): void
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
    applyMusicLevel(on ? DUCK_DOWN_S : DUCK_UP_S)
    for (const fn of duckers) {
      try { fn(on) } catch { /* a listener never breaks the sound */ }
    }
  }
  let sampler: Sampler | null = null
  const beds = new Map<string, Promise<AudioBuffer | null>>()

  // ---- the Focus tracks ----
  let musicBus: GainNode | null = null
  let musicVolume = 0.65
  let focusWanted: FocusSpec | null = null
  let focusNow: { file: string; src: AudioBufferSourceNode; gain: GainNode } | null = null
  let focusGen = 0
  let focusState: FocusState = 'stopped'
  // only the track being played is held decoded (a few minutes of PCM is tens of megabytes)
  let focusBuf: { file: string; p: Promise<AudioBuffer | null> } | null = null
  const focusers: Array<(s: FocusState) => void> = []
  function setFocusState(s: FocusState): void {
    if (s === focusState) return
    focusState = s
    for (const fn of focusers) {
      try { fn(s) } catch { /* a listener never breaks the sound */ }
    }
  }
  const musicLevel = (): number => musicVolume * FOCUS_LEVEL * (musicDucked ? FOCUS_DUCK_RATIO : 1)
  function applyMusicLevel(seconds: number): void {
    const c = ctx
    const g = musicBus?.gain
    if (!c || !g) return
    const to = musicLevel()
    try {
      g.cancelScheduledValues(c.currentTime)
      g.setValueAtTime(g.value, c.currentTime)
      g.linearRampToValueAtTime(to, c.currentTime + seconds)
    } catch {
      g.value = to
    }
  }
  function fetchAudio(file: string): Promise<AudioBuffer | null> {
    const c = ctx
    if (!c) return Promise.resolve(null)
    const env = (import.meta as { env?: { BASE_URL?: string; AUDIO_REV?: string } }).env
    const base = env?.BASE_URL ?? '/'
    // the build's audio revision: a changed recording under the same name is never served stale
    const rev = env?.AUDIO_REV ? `?v=${env.AUDIO_REV}` : ''
    return fetch(`${base}audio/${file}${rev}`)
      .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error('audio missing'))))
      .then((data) => c.decodeAudioData(data))
      .catch(() => null)
  }
  function loadFocus(file: string): Promise<AudioBuffer | null> {
    if (focusBuf?.file !== file) {
      let timer: ReturnType<typeof setTimeout> | undefined
      const guard = new Promise<null>((resolve) => { timer = setTimeout(() => resolve(null), FOCUS_LOAD_GUARD_MS) })
      const p = Promise.race([fetchAudio(file), guard]).finally(() => clearTimeout(timer))
      focusBuf = { file, p }
      // a failed or timed-out load is tried afresh next time
      void p.then((b) => { if (!b && focusBuf?.p === p) focusBuf = null })
    }
    return focusBuf.p
  }
  function stopFocusNode(fade: number): void {
    const n = focusNow
    focusNow = null
    const c = ctx
    if (!n || !c) return
    try {
      const g = n.gain.gain
      g.cancelScheduledValues(c.currentTime)
      g.setValueAtTime(g.value, c.currentTime)
      g.linearRampToValueAtTime(0.0001, c.currentTime + fade)
      n.src.stop(c.currentTime + fade + 0.05)
    } catch {
      try { n.src.stop() } catch { /* already stopped */ }
    }
  }
  function syncFocus(): void {
    const want = focusWanted
    if (focusNow && want && focusNow.file === want.file) return
    const gen = ++focusGen
    stopFocusNode(FOCUS_FADE_OUT_S)
    if (!want) {
      setFocusState('stopped')
      return
    }
    const c = ctx
    const bus = musicBus
    if (!c || !bus) return // starts on unlock
    setFocusState('loading')
    void loadFocus(want.file).then((buf) => {
      if (gen !== focusGen || focusWanted !== want) return
      if (!buf) {
        setFocusState('failed')
        return
      }
      try {
        const src = c.createBufferSource()
        src.buffer = buf
        src.loop = true
        const [a, b] = loopWindow(buf, want.seconds)
        src.loopStart = a
        src.loopEnd = b
        const g = c.createGain()
        g.gain.setValueAtTime(0.0001, c.currentTime)
        g.gain.linearRampToValueAtTime(1, c.currentTime + FOCUS_FADE_IN_S)
        src.connect(g)
        g.connect(bus)
        src.start(c.currentTime, a)
        focusNow = { file: want.file, src, gain: g }
        setFocusState('playing')
      } catch {
        setFocusState('failed')
      }
    })
  }

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
      p = fetchAudio(file)
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
        musicBus = ctx.createGain()
        musicBus.gain.value = musicLevel()
        musicBus.connect(master)
        applyMute()
        // decode the typewriter sprite now, so the first key of a telegram is already instant
        sampler = createSampler(ctx, master, loadBed)
        restartAmbience()
        syncFocus()
      } catch {
        ctx = null
        master = null
        ambBus = null
        musicBus = null
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
    focus(track: FocusSpec | null): void {
      if (track?.file === focusWanted?.file && (track === null || focusState !== 'failed')) {
        focusWanted = track
        return
      }
      focusWanted = track
      syncFocus()
    },
    setMusicVolume(v: number): void {
      const next = Math.max(0, Math.min(1, v))
      if (next === musicVolume) return
      musicVolume = next
      applyMusicLevel(0.08)
    },
    onFocus(fn: (s: FocusState) => void): void {
      focusers.push(fn)
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
