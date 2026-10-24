// The ambience duck under the read-aloud voice, the room clock hushed by the agarbatti's ticks, and
// the room carrying on into the chapter (the ambience itself is stubbed here).
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { AmbienceOptions } from '../../src/audio/ambience'

const amb = vi.hoisted(() => ({
  starts: [] as Array<{ id: string; opts: AmbienceOptions; stop: ReturnType<typeof vi.fn>; hushClock: ReturnType<typeof vi.fn> }>,
  voiceCb: null as null | ((s: string, r: unknown) => void),
}))
vi.mock('../../src/audio/ambience', () => ({
  startAmbience: (_c: unknown, _d: unknown, id: string, _l: unknown, opts: AmbienceOptions) => {
    const h = { id, opts, stop: vi.fn(), hushClock: vi.fn() }
    amb.starts.push(h)
    return h
  },
}))
vi.mock('../../src/audio/voice', () => ({
  voice: { onState: (cb: (s: string, r: unknown) => void) => { amb.voiceCb = cb; return () => undefined }, play: vi.fn(), stop: vi.fn() },
}))

const { audio, createAudioEngine, DUCK_LEVEL } = await import('../../src/audio/engine')

const param = (v = 1) => ({ value: v, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn(), setTargetAtTime: vi.fn(), cancelScheduledValues: vi.fn() })
const gains: Array<{ gain: ReturnType<typeof param> }> = []
function node() {
  return { connect: vi.fn(), disconnect: vi.fn(), start: vi.fn(), stop: vi.fn(), gain: param(), frequency: param(), detune: param(), Q: param(), playbackRate: param(), type: '', loop: false, buffer: null }
}
class MockCtx {
  state = 'running'
  currentTime = 3
  sampleRate = 8000
  destination = node()
  resume = vi.fn(() => Promise.resolve())
  suspend = vi.fn(() => Promise.resolve())
  decodeAudioData = vi.fn(() => Promise.resolve({ duration: 1 }))
  createGain() { const n = node(); gains.push(n); return n }
  createOscillator() { return node() }
  createBufferSource() { return node() }
  createBiquadFilter() { return node() }
  createBuffer(_c: number, len: number) { return { getChannelData: () => new Float32Array(len) } }
}
const g = globalThis as unknown as Record<string, unknown>

beforeEach(() => {
  amb.starts.length = 0
  gains.length = 0
  g.AudioContext = MockCtx
  g.fetch = vi.fn(() => Promise.resolve({ ok: true, arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)) }))
})
afterEach(() => { delete g.AudioContext })

describe('the ambience under the voice', () => {
  it('ducks about 8 dB in 0.4 s and comes back', () => {
    expect(20 * Math.log10(DUCK_LEVEL)).toBeCloseTo(-8, 0)
    const a = createAudioEngine()
    a.unlock()
    const bus = gains[1]!.gain // the master is the first gain, the ambience's own the second
    a.duckAmbience(true)
    expect(bus.linearRampToValueAtTime).toHaveBeenLastCalledWith(DUCK_LEVEL, 3 + 0.4)
    a.duckAmbience(true) // no change, no new ramp
    expect(bus.linearRampToValueAtTime).toHaveBeenCalledTimes(1)
    a.duckAmbience(false)
    expect(bus.linearRampToValueAtTime).toHaveBeenLastCalledWith(1, expect.any(Number))
  })

  it('remembers a duck asked for before the audio was unlocked', () => {
    const a = createAudioEngine()
    a.duckAmbience(true)
    a.unlock()
    expect(gains[1]!.gain.value).toBe(DUCK_LEVEL)
  })

  it('lets no room sound start while ducked', () => {
    const a = createAudioEngine()
    a.unlock()
    a.ambience('delhi-1857')
    const canBurst = amb.starts[0]!.opts.canBurst!
    expect(canBurst()).toBe(true)
    a.duckAmbience(true)
    expect(canBurst()).toBe(false)
    a.duckAmbience(false)
    expect(canBurst()).toBe(true)
  })

  it('follows the read-aloud voice: down while it loads or plays, up when it ends, stops or fails', () => {
    const spy = vi.spyOn(audio, 'duckAmbience')
    for (const [s, on] of [['loading', true], ['playing', true], ['idle', false], ['playing', true], ['error', false]] as const) {
      amb.voiceCb?.(s, null)
      expect(spy).toHaveBeenLastCalledWith(on)
    }
    spy.mockRestore()
  })
})

describe('the room', () => {
  it('carries on when the same era is asked for again, and changes when another is', () => {
    const a = createAudioEngine()
    a.unlock()
    a.ambience('lahore-1929')
    a.ambience('lahore-1929')
    expect(amb.starts).toHaveLength(1)
    expect(amb.starts[0]!.stop).not.toHaveBeenCalled()
    a.ambience('bombay-1942')
    expect(amb.starts).toHaveLength(2)
    expect(amb.starts[0]!.stop).toHaveBeenCalled()
  })

  it("hushes its clock when the agarbatti's clock or tension tick plays", () => {
    const a = createAudioEngine()
    a.unlock()
    a.ambience('delhi-1947')
    const h = amb.starts[0]!
    a.cue('incense')
    expect(h.hushClock).not.toHaveBeenCalled()
    a.cue('clockTick')
    a.cue('tensionTick', { level: 0.5 })
    expect(h.hushClock).toHaveBeenCalledTimes(2)
  })
})
