// The record's Focus tracks in the audio engine: loaded only when picked, looped seamlessly on their
// own music bus (the master mutes them, the volume knob sets them), faded in, dipped under the voice
// and the alarm, and given up (never hung) when the file does not come.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../src/audio/ambience', () => ({
  startAmbience: () => ({ stop: vi.fn(), hushClock: vi.fn() }),
  loopWindow: (_b: unknown, s: number) => [0, s],
}))
vi.mock('../../src/audio/voice', () => ({
  voice: { onState: () => () => undefined, play: vi.fn(), stop: vi.fn() },
}))

const { createAudioEngine, FOCUS_FADE_IN_S, FOCUS_DUCK_RATIO, FOCUS_LEVEL, FOCUS_LOAD_GUARD_MS } = await import('../../src/audio/engine')
import type { FocusState } from '../../src/audio/engine'

const param = (v = 1) => ({ value: v, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn(), setTargetAtTime: vi.fn(), cancelScheduledValues: vi.fn() })
type Node = ReturnType<typeof node>
function node() {
  return { connect: vi.fn(), disconnect: vi.fn(), start: vi.fn(), stop: vi.fn(), gain: param(), frequency: param(), detune: param(), Q: param(), playbackRate: param(), type: '', loop: false, loopStart: 0, loopEnd: 0, buffer: null as unknown }
}
const gains: Node[] = []
const sources: Node[] = []
class MockCtx {
  state = 'running'
  currentTime = 3
  sampleRate = 8000
  destination = node()
  resume = vi.fn(() => Promise.resolve())
  suspend = vi.fn(() => Promise.resolve())
  decodeAudioData = vi.fn(() => Promise.resolve({ duration: 150, sampleRate: 8000, getChannelData: () => new Float32Array(16) }))
  createGain() { const n = node(); gains.push(n); return n }
  createOscillator() { return node() }
  createBufferSource() { const n = node(); sources.push(n); return n }
  createBiquadFilter() { return node() }
  createBuffer(_c: number, len: number) { return { getChannelData: () => new Float32Array(len) } }
}
const g = globalThis as unknown as Record<string, unknown>
const fetchMock = vi.fn((_url: string) => Promise.resolve({ ok: true, arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)) }))
const urls = () => fetchMock.mock.calls.map((c) => c[0])
const focusUrls = () => urls().filter((u) => u.includes('focus-'))
const flush = async () => { for (let i = 0; i < 20; i++) await Promise.resolve() }
const RAIN = { file: 'focus-rain.m4a', seconds: 150 }
const RIVER = { file: 'focus-river.m4a', seconds: 109 }

beforeEach(() => {
  gains.length = 0
  sources.length = 0
  fetchMock.mockClear()
  g.AudioContext = MockCtx
  g.fetch = fetchMock
})
afterEach(() => {
  delete g.AudioContext
  vi.useRealTimers()
})

/** The music bus: the third gain the engine makes (after the master and the ambience's own). */
const musicBus = () => gains[2]!

describe('Focus tracks', () => {
  it('waits for the unlock, then fetches only the picked track and loops it with a 4 s fade in', async () => {
    const a = createAudioEngine()
    const states: FocusState[] = []
    a.onFocus((s) => states.push(s))
    a.focus(RAIN)
    expect(fetchMock).not.toHaveBeenCalled() // nothing before the first gesture
    a.unlock()
    expect(focusUrls()).toHaveLength(1)
    expect(focusUrls()[0]).toMatch(/\/audio\/focus-rain\.m4a(\?v=\w+)?$/)
    await flush()
    const src = sources.find((s) => s.loop)!
    expect(src.loop).toBe(true)
    expect(src.loopEnd).toBe(150)
    expect(src.start).toHaveBeenCalled()
    const fade = gains[gains.length - 1]!.gain
    expect(fade.setValueAtTime).toHaveBeenCalledWith(0.0001, 3)
    expect(fade.linearRampToValueAtTime).toHaveBeenCalledWith(1, 3 + FOCUS_FADE_IN_S)
    expect(states).toEqual(['loading', 'playing'])
    // through its own bus into the master, so the sound switch mutes it
    expect(musicBus().connect).toHaveBeenCalledWith(gains[0])
  })

  it('the volume knob sets the music bus; the voice and the alarm dip it and let it back', () => {
    const a = createAudioEngine()
    a.setMusicVolume(0.5)
    a.unlock()
    expect(musicBus().gain.value).toBeCloseTo(0.5 * FOCUS_LEVEL)
    a.setMusicVolume(0.8)
    expect(musicBus().gain.linearRampToValueAtTime).toHaveBeenLastCalledWith(expect.closeTo(0.8 * FOCUS_LEVEL), expect.any(Number))
    a.duckAmbience(true)
    expect(musicBus().gain.linearRampToValueAtTime).toHaveBeenLastCalledWith(expect.closeTo(0.8 * FOCUS_LEVEL * FOCUS_DUCK_RATIO), expect.any(Number))
    a.duckAmbience(false)
    expect(musicBus().gain.linearRampToValueAtTime).toHaveBeenLastCalledWith(expect.closeTo(0.8 * FOCUS_LEVEL), expect.any(Number))
    vi.useFakeTimers()
    a.cue('bugleAlarm')
    expect(musicBus().gain.linearRampToValueAtTime).toHaveBeenLastCalledWith(expect.closeTo(0.8 * FOCUS_LEVEL * FOCUS_DUCK_RATIO), expect.any(Number))
    vi.advanceTimersByTime(3100)
    expect(musicBus().gain.linearRampToValueAtTime).toHaveBeenLastCalledWith(expect.closeTo(0.8 * FOCUS_LEVEL), expect.any(Number))
  })

  it('a new track fades the old one out and holds only the new one; the same track again changes nothing', async () => {
    const a = createAudioEngine()
    a.unlock()
    a.focus(RAIN)
    await flush()
    const first = sources.find((s) => s.loop)!
    a.focus(RAIN)
    expect(focusUrls()).toHaveLength(1)
    a.focus(RIVER)
    expect(first.stop).toHaveBeenCalled()
    expect(focusUrls()[1]).toContain('focus-river.m4a')
    await flush()
    // back to the first: it is fetched afresh (only one decoded track is kept)
    a.focus(RAIN)
    expect(focusUrls()).toHaveLength(3)
  })

  it('null stops it and says so', async () => {
    const a = createAudioEngine()
    const states: FocusState[] = []
    a.onFocus((s) => states.push(s))
    a.unlock()
    a.focus(RAIN)
    await flush()
    const src = sources.find((s) => s.loop)!
    a.focus(null)
    expect(src.stop).toHaveBeenCalled()
    expect(states[states.length - 1]).toBe('stopped')
  })

  it('a file that will not load says failed, and is tried again when picked again', async () => {
    const a = createAudioEngine()
    const states: FocusState[] = []
    a.onFocus((s) => states.push(s))
    a.unlock()
    fetchMock.mockImplementationOnce(() => Promise.resolve({ ok: false, arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)) }))
    a.focus(RAIN)
    await flush()
    await flush()
    expect(states[states.length - 1]).toBe('failed')
    a.focus(RAIN)
    expect(focusUrls()).toHaveLength(2)
  })

  it('never hangs on a fetch that does not answer: the guard gives it up', async () => {
    vi.useFakeTimers()
    const a = createAudioEngine()
    const states: FocusState[] = []
    a.onFocus((s) => states.push(s))
    a.unlock()
    fetchMock.mockImplementationOnce(() => new Promise(() => undefined))
    a.focus(RAIN)
    expect(states).toEqual(['loading'])
    await vi.advanceTimersByTimeAsync(FOCUS_LOAD_GUARD_MS + 10)
    expect(states).toEqual(['loading', 'failed'])
  })
})
