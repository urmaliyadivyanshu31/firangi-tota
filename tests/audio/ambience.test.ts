// The era ambience: calm layers, the room's small sounds (varied, spaced out, never startling), the
// loop windows of the recorded beds, and the room clock keeping quiet under the agarbatti's.
import { describe, expect, it, vi } from 'vitest'
import { burstKinds, loopWindow, MUSIC_FILES, startAmbience, BED_FILES } from '../../src/audio/ambience'
import { ROOM, ROOM_FILE, type RoomClip } from '../../src/audio/room-sprite'
import type { EraId } from '../../src/content/types'

const ERAS: EraId[] = ['delhi-1857', 'lahore-1929', 'bombay-1942', 'delhi-1947']

interface Call { name: string; args: number[] }
const param = (v = 1) => {
  const calls: Call[] = []
  const rec = (name: string) => (...args: number[]) => { calls.push({ name, args }) }
  return { value: v, calls, setValueAtTime: rec('set'), linearRampToValueAtTime: rec('linear'), exponentialRampToValueAtTime: rec('exp'), setTargetAtTime: rec('target'), cancelScheduledValues: rec('cancel') }
}
type P = ReturnType<typeof param>
interface Node {
  kind: string
  connect: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn>; start: ReturnType<typeof vi.fn>; stop: ReturnType<typeof vi.fn>
  gain: P; frequency: P; detune: P; Q: P; playbackRate: P; type: string; loop: boolean; buffer: unknown; loopStart?: number; loopEnd?: number
}

class Ctx {
  state = 'running'
  currentTime = 0
  sampleRate = 8000
  nodes: Node[] = []
  node(kind: string): Node {
    const n: Node = { kind, connect: vi.fn(), disconnect: vi.fn(), start: vi.fn(), stop: vi.fn(), gain: param(), frequency: param(440), detune: param(0), Q: param(1), playbackRate: param(1), type: '', loop: false, buffer: null }
    this.nodes.push(n)
    return n
  }
  createGain() { return this.node('gain') }
  createOscillator() { return this.node('osc') }
  createBufferSource() { return this.node('source') }
  createBiquadFilter() { return this.node('filter') }
  createBuffer(_c: number, len: number) { return { getChannelData: () => new Float32Array(len) } }
}

const ROOM_BUF = { duration: 62, room: true }
const BED_BUF = { duration: 40.02, bed: true }

function setup(era: EraId, opts: { seed?: number; canBurst?: () => boolean } = {}) {
  const ctx = new Ctx()
  const timers: Array<{ ms: number; fn: () => void }> = []
  const later = (ms: number, fn: () => void) => { timers.push({ ms, fn }) }
  let s = opts.seed ?? 7
  const random = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 }
  const loads: string[] = []
  const loadBed = (file: string) => {
    loads.push(file)
    return Promise.resolve((file === ROOM_FILE ? ROOM_BUF : BED_BUF) as unknown as AudioBuffer)
  }
  const h = startAmbience(ctx as unknown as AudioContext, ctx.node('dest') as unknown as AudioNode, era, loadBed, { later, random, canBurst: opts.canBurst })
  /** Runs the next pending timer, moving the clock on by its delay. */
  const step = () => {
    const t = timers.shift()
    if (!t) return null
    ctx.currentTime += t.ms / 1000
    t.fn()
    return t
  }
  return { ctx, timers, step, h, loads }
}

/** Which room clip a buffer source plays, from its start offset. */
function clipOf(n: Node): RoomClip | null {
  if (n.buffer !== ROOM_BUF) return null
  const offset = n.start.mock.calls[0]?.[1] as number
  return (Object.keys(ROOM) as RoomClip[]).find((k) => ROOM[k][0] === offset) ?? null
}

describe('era ambience', () => {
  it('has six to ten kinds of room sound in every era', () => {
    for (const era of ERAS) {
      expect(burstKinds(era), era).toBeGreaterThanOrEqual(6)
      expect(burstKinds(era), era).toBeLessThanOrEqual(10)
    }
  })

  it('loads the bed, the instrument (where there is one) and the room sounds, and fades in over more than a second', async () => {
    for (const era of ERAS) {
      const { ctx, loads } = setup(era)
      await Promise.resolve()
      await Promise.resolve()
      expect(loads).toContain(BED_FILES[era])
      expect(loads).toContain(ROOM_FILE)
      if (MUSIC_FILES[era]) expect(loads).toContain(MUSIC_FILES[era]![0])
      const bus = ctx.nodes.find((n) => n.kind === 'gain' && n.gain.calls.some((c) => c.name === 'linear' && c.args[0] === 1))!
      const ramp = bus.gain.calls.find((c) => c.name === 'linear')!
      expect(ramp.args[1]).toBeGreaterThanOrEqual(1)
      // the recorded loops play looped, inside their loop window
      const loops = ctx.nodes.filter((n) => n.kind === 'source' && n.loop && n.buffer === BED_BUF)
      expect(loops.length, era).toBe(MUSIC_FILES[era] ? 2 : 1)
      for (const l of loops) expect(l.loopEnd).toBeGreaterThan(l.loopStart ?? 0)
    }
  })

  it('plays a room sound every 15–40 s, never the same one twice running, and many kinds over time', async () => {
    for (const era of ERAS) {
      const { ctx, timers, step } = setup(era, { seed: 11 })
      await Promise.resolve()
      await Promise.resolve()
      const played: string[] = []
      let bursts = 0
      while (bursts < 120) {
        const before = ctx.nodes.length
        const t = step()
        if (!t) break
        if (t.ms === 400) continue // the room clock's scheduler
        bursts++
        expect(t.ms, era).toBeGreaterThanOrEqual(bursts === 1 ? 9000 : 15000)
        expect(t.ms, era).toBeLessThanOrEqual(40000)
        const fresh = ctx.nodes.slice(before)
        const clip = fresh.map(clipOf).find((c) => c)
        // the tonga bell is synthesized: oscillators, no clip
        played.push(clip ?? (fresh.some((n) => n.kind === 'osc') ? 'tonga' : '?'))
      }
      expect(timers.length).toBeGreaterThan(0) // it keeps going
      expect(played).not.toContain('?')
      for (let i = 1; i < played.length; i++) expect(played[i], `${era} #${i}`).not.toBe(played[i - 1])
      expect(new Set(played).size, era).toBeGreaterThanOrEqual(6)
    }
  })

  it('keeps every room sound soft: faded in, under the peak ceiling, and quieter for clicks than for birds', async () => {
    const { ctx, step } = setup('delhi-1947', { seed: 3 })
    await Promise.resolve()
    await Promise.resolve()
    for (let i = 0; i < 300; i++) step()
    const sources = ctx.nodes.filter((n) => clipOf(n))
    expect(sources.length).toBeGreaterThan(20)
    // each clip's gain node: from silence, up to its level, at most -20.5 dB (the clip peaks at -3 dBFS)
    const gains = ctx.nodes.filter((n) => n.kind === 'gain' && n.gain.calls[0]?.name === 'set' && n.gain.calls[0].args[0] === 0.0001 && n.gain.calls.length === 4)
    expect(gains.length).toBeGreaterThan(20)
    for (const g of gains) {
      const up = g.gain.calls[1]!
      expect(up.args[0]).toBeLessThanOrEqual(10 ** (-20.5 / 20) + 1e-9)
      expect(up.args[1]! - g.gain.calls[0]!.args[1]!).toBeGreaterThan(0.01) // never an instant start
    }
  })

  it('starts no room sound while the context sleeps or the voice reads', async () => {
    let allowed = false
    const { ctx, step } = setup('lahore-1929', { canBurst: () => allowed })
    await Promise.resolve()
    await Promise.resolve()
    for (let i = 0; i < 200; i++) step()
    expect(ctx.nodes.filter((n) => clipOf(n))).toHaveLength(0)
    allowed = true
    for (let i = 0; i < 300; i++) step()
    expect(ctx.nodes.filter((n) => clipOf(n)).length).toBeGreaterThan(0)
  })

  it('hushes the room clock while the agarbatti ticks', () => {
    const { ctx, step, h } = setup('lahore-1929')
    const ticks = () => ctx.nodes.filter((n) => n.kind === 'source' && !n.loop && n.buffer && (n.buffer as { getChannelData?: unknown }).getChannelData).length
    for (let i = 0; i < 10; i++) step()
    const before = ticks()
    expect(before).toBeGreaterThan(0)
    h.hushClock(60_000)
    let clockSteps = 0
    while (clockSteps < 10) { const t = step(); if (t?.ms === 400) clockSteps++ }
    expect(ticks()).toBe(before)
  })

  it('stops everything, and no timer it left behind does anything after', async () => {
    vi.useFakeTimers()
    try {
      const { ctx, timers, h } = setup('delhi-1947')
      await Promise.resolve()
      await Promise.resolve()
      h.stop()
      vi.advanceTimersByTime(1000)
      const started = ctx.nodes.filter((n) => n.start.mock.calls.length > 0)
      expect(started.length).toBeGreaterThan(0)
      for (const n of started.filter((x) => x.kind === 'osc' || x.loop)) expect(n.stop).toHaveBeenCalled()
      const count = ctx.nodes.length
      for (const t of timers.splice(0)) t.fn()
      expect(ctx.nodes.length).toBe(count)
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('loopWindow', () => {
  it('skips an AAC priming silence at the front and keeps the loop length', () => {
    const sr = 8000
    const d = new Float32Array(sr * 3)
    for (let i = 1024; i < d.length; i++) d[i] = 0.1 * Math.sin(i)
    const buf = { sampleRate: sr, duration: 3, getChannelData: () => d } as unknown as AudioBuffer
    const [a, b] = loopWindow(buf, 2)
    expect(a).toBeCloseTo(1024 / sr, 5)
    expect(b).toBeCloseTo(1024 / sr + 2, 5)
  })

  it('plays the whole buffer when it cannot read the samples', () => {
    expect(loopWindow({ duration: 30 } as unknown as AudioBuffer, 40)).toEqual([0, 30])
  })
})
