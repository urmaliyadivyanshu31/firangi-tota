// Era ambience: a synthesized layer (always available) plus a recorded bed (lazy, optional).
import type { EraId } from '../content/types'
import {
  callBell, naqqaraHit, staticBed, tanpuraDrone, telegraphClick, tuningWhistle, valveHum, windBed,
  type Stoppable,
} from './synth'

export const BED_FILES: Record<EraId, string> = {
  'delhi-1857': 'delhi-1857.m4a',
  'lahore-1929': 'lahore-1929.m4a',
  'bombay-1942': 'bombay-1942.m4a',
  'delhi-1947': 'delhi-1947.m4a',
}

const FADE = 0.6

export interface AmbienceHandle { stop(): void }

type Schedule = (ctx: AudioContext, dest: AudioNode, later: (ms: number, fn: () => void) => void) => Stoppable[]

const rand = (a: number, b: number): number => a + Math.random() * (b - a)

// Each era mixes its own procedural layer. Nothing religious or political; no telegraph in 1857.
const LAYERS: Record<EraId, Schedule> = {
  'delhi-1857': (ctx, dest, later) => {
    // Low wind and an occasional distant naqqara (crows, carts and horses are in the recorded bed).
    const loop = (): void => later(rand(9000, 18000), () => {
      naqqaraHit(ctx, dest, ctx.currentTime + 0.02)
      if (Math.random() < 0.6) naqqaraHit(ctx, dest, ctx.currentTime + 0.3)
      loop()
    })
    loop()
    return [windBed(ctx, dest)]
  },
  'lahore-1929': (ctx, dest) => [tanpuraDrone(ctx, dest)],
  'bombay-1942': (ctx, dest, later) => {
    const loop = (): void => later(rand(12000, 24000), () => {
      tuningWhistle(ctx, dest, ctx.currentTime + 0.02)
      loop()
    })
    loop()
    return [staticBed(ctx, dest), valveHum(ctx, dest)]
  },
  'delhi-1947': (ctx, dest, later) => {
    // Telegraph chatter in short bursts, an occasional call bell.
    const burst = (): void => later(rand(3500, 9000), () => {
      const n = 3 + Math.floor(Math.random() * 6)
      let t = ctx.currentTime + 0.02
      for (let i = 0; i < n; i++) { telegraphClick(ctx, dest, t); t += rand(0.09, 0.3) }
      if (Math.random() < 0.15) callBell(ctx, dest, t + 0.3)
      burst()
    })
    burst()
    return []
  },
}

/**
 * Starts the era's layers into `master`. The recorded bed is loaded through `loadBed`;
 * a failure there is swallowed and the synthesized layer carries on alone.
 */
export function startAmbience(
  ctx: AudioContext,
  master: AudioNode,
  id: EraId,
  loadBed: (file: string) => Promise<AudioBuffer | null>,
): AmbienceHandle {
  const bus = ctx.createGain()
  bus.gain.setValueAtTime(0.0001, ctx.currentTime)
  bus.gain.linearRampToValueAtTime(1, ctx.currentTime + FADE)
  bus.connect(master)

  let stopped = false
  const timers: Array<ReturnType<typeof setTimeout>> = []
  const later = (ms: number, fn: () => void): void => {
    timers.push(setTimeout(() => { if (!stopped) fn() }, ms))
  }
  const layers = LAYERS[id](ctx, bus, later)
  let bed: AudioBufferSourceNode | null = null

  void loadBed(BED_FILES[id]).then((buf) => {
    if (stopped || !buf) return
    try {
      const src = ctx.createBufferSource()
      src.buffer = buf
      src.loop = true
      const g = ctx.createGain()
      g.gain.value = 1
      src.connect(g)
      g.connect(bus)
      src.start()
      bed = src
    } catch { /* carry on silently */ }
  }).catch(() => { /* carry on silently */ })

  return {
    stop(): void {
      if (stopped) return
      stopped = true
      timers.forEach(clearTimeout)
      const end = ctx.currentTime + 0.4
      bus.gain.cancelScheduledValues(ctx.currentTime)
      bus.gain.setValueAtTime(bus.gain.value, ctx.currentTime)
      bus.gain.linearRampToValueAtTime(0.0001, end)
      const kill = (): void => {
        for (const l of layers) l.stop()
        try { bed?.stop() } catch { /* already stopped */ }
        try { bus.disconnect() } catch { /* already disconnected */ }
      }
      setTimeout(kill, 450) // after the fade
    },
  }
}
