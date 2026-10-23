// The audio engine: one master gain, synthesized cues, era ambience.
// Everything is a safe no-op until unlock() succeeds, or when Web Audio is missing.
import type { EraId } from '../content/types'
import { startAmbience, type AmbienceHandle } from './ambience'
import { playCue, type Cue } from './synth'

export type { Cue } from './synth'

const MASTER_LEVEL = 0.8

type Ctor = new () => AudioContext

function contextCtor(): Ctor | null {
  const g = globalThis as unknown as { AudioContext?: Ctor; webkitAudioContext?: Ctor }
  return g.AudioContext ?? g.webkitAudioContext ?? null
}

export interface AudioEngine {
  unlock(): void
  setMuted(m: boolean): void
  cue(c: Cue): void
  ambience(id: EraId | null): void
}

export function createAudioEngine(): AudioEngine {
  let ctx: AudioContext | null = null
  let master: GainNode | null = null
  let muted = false
  let wanted: EraId | null = null
  let current: AmbienceHandle | null = null
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
    cue(c: Cue): void {
      if (!ctx || !master || muted) return
      try { playCue(ctx, master, c) } catch { /* never break the game over a sound */ }
    },
    ambience(id: EraId | null): void {
      wanted = id
      restartAmbience()
    },
  }
}

export const audio: AudioEngine = createAudioEngine()
