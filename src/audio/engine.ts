// The audio engine: one master gain, synthesized cues, era ambience.
// Everything is a safe no-op until unlock() succeeds, or when Web Audio is missing.
import type { EraId } from '../content/types'
import { startAmbience, type AmbienceHandle } from './ambience'
import { createSampler, type SampleName, type Sampler } from './samples'
import { playCue, type Cue, type CueOptions } from './synth'

export type { Cue } from './synth'
export { cueForStage } from './stage-cues'

/** The cues played from the recorded typewriter sprite once it has loaded. */
const SAMPLED: Partial<Record<Cue, SampleName>> = { typeKey: 'key', typeSpace: 'space', typeDing: 'ding', typeReturn: 'return' }

const MASTER_LEVEL = 0.8

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
}

export function createAudioEngine(): AudioEngine {
  let ctx: AudioContext | null = null
  let master: GainNode | null = null
  let muted = false
  let wanted: EraId | null = null
  let current: AmbienceHandle | null = null
  let sampler: Sampler | null = null
  const beds = new Map<string, Promise<AudioBuffer | null>>()

  function applyMute(): void {
    if (master) master.gain.value = muted ? 0 : MASTER_LEVEL
  }

  function loadBed(file: string): Promise<AudioBuffer | null> {
    const c = ctx
    if (!c) return Promise.resolve(null)
    let p = beds.get(file)
    if (!p) {
      const base = (import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL ?? '/'
      p = fetch(`${base}audio/${file}`)
        .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error('bed missing'))))
        .then((data) => c.decodeAudioData(data))
        .catch(() => null)
      beds.set(file, p)
    }
    return p
  }

  function restartAmbience(): void {
    current?.stop()
    current = null
    if (ctx && master && wanted) current = startAmbience(ctx, master, wanted, loadBed)
  }

  return {
    unlock(): void {
      if (ctx) { void ctx.resume?.(); return }
      const Ctor = contextCtor()
      if (!Ctor) return
      try {
        ctx = new Ctor()
        // Created and resumed inside the user gesture, as iOS Safari requires.
        void ctx.resume?.()?.catch?.(() => undefined)
        master = ctx.createGain()
        master.connect(ctx.destination)
        applyMute()
        // decode the typewriter sprite now, so the first key of a telegram is already instant
        sampler = createSampler(ctx, master, loadBed)
        restartAmbience()
      } catch {
        ctx = null
        master = null
      }
    },
    setMuted(m: boolean): void {
      muted = m
      applyMute()
    },
    cue(c: Cue, o?: { level?: number }): void {
      if (!ctx || !master || muted) return
      try {
        const s = SAMPLED[c]
        if (s && sampler?.play(s)) return
        // the day title settles in the voice of the era whose room is playing
        const opts: CueOptions = { era: wanted, level: o?.level }
        playCue(ctx, master, c, opts)
      } catch { /* never break the game over a sound */ }
    },
    ambience(id: EraId | null): void {
      wanted = id
      restartAmbience()
    },
  }
}

export const audio: AudioEngine = createAudioEngine()
