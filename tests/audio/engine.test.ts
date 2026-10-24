import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createAudioEngine } from '../../src/audio/engine'
import { resetSynthCache } from '../../src/audio/synth'

interface Param { value: number; setValueAtTime: ReturnType<typeof vi.fn>; linearRampToValueAtTime: ReturnType<typeof vi.fn>; exponentialRampToValueAtTime: ReturnType<typeof vi.fn>; setTargetAtTime: ReturnType<typeof vi.fn>; cancelScheduledValues: ReturnType<typeof vi.fn> }
const param = (v = 1): Param => ({ value: v, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn(), setTargetAtTime: vi.fn(), cancelScheduledValues: vi.fn() })

interface MockNode { connect: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn>; start: ReturnType<typeof vi.fn>; stop: ReturnType<typeof vi.fn>; gain: Param; frequency: Param; detune: Param; Q: Param; type: string; loop: boolean; buffer: unknown }
const created: { gains: MockNode[]; sources: MockNode[]; oscs: MockNode[]; instances: MockCtx[] } = { gains: [], sources: [], oscs: [], instances: [] }

function node(): MockNode {
  return { connect: vi.fn(), disconnect: vi.fn(), start: vi.fn(), stop: vi.fn(), gain: param(), frequency: param(440), detune: param(0), Q: param(1), type: '', loop: false, buffer: null }
}

class MockCtx {
  state = 'suspended'
  currentTime = 0
  sampleRate = 8000
  destination = node()
  resume = vi.fn(() => { this.state = 'running'; return Promise.resolve() })
  suspend = vi.fn(() => { this.state = 'suspended'; return Promise.resolve() })
  close = vi.fn(() => Promise.resolve())
  decodeAudioData = vi.fn(() => Promise.resolve({ duration: 30 } as unknown as AudioBuffer))
  constructor() { created.instances.push(this) }
  createGain() { const n = node(); created.gains.push(n); return n }
  createOscillator() { const n = node(); created.oscs.push(n); return n }
  createBufferSource() { const n = node(); created.sources.push(n); return n }
  createBiquadFilter() { return node() }
  createBuffer(_c: number, len: number) { return { getChannelData: () => new Float32Array(len) } }
}

const g = globalThis as unknown as Record<string, unknown>

beforeEach(() => {
  created.gains = []; created.sources = []; created.oscs = []; created.instances = []
  resetSynthCache()
  g.AudioContext = MockCtx
  g.fetch = vi.fn(() => Promise.resolve({ ok: true, arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)) }))
})
afterEach(() => { delete g.AudioContext; delete g.webkitAudioContext; vi.useRealTimers() })

describe('audio engine', () => {
  it('cue() before unlock() is a no-op', () => {
    const a = createAudioEngine()
    a.cue('stampAsli')
    a.ambience('bombay-1942')
    expect(created.instances).toHaveLength(0)
    expect(created.oscs).toHaveLength(0)
    expect(g.fetch).not.toHaveBeenCalled()
  })

  it('unlock() creates and resumes the context inside the call', () => {
    const a = createAudioEngine()
    a.unlock()
    expect(created.instances).toHaveLength(1)
    expect(created.instances[0]!.resume).toHaveBeenCalled()
    a.unlock()
    expect(created.instances).toHaveLength(1)
  })

  it('every cue schedules sound after unlock and stays quiet when muted', () => {
    const a = createAudioEngine()
    a.unlock()
    const cues = ['arrive', 'stampAsli', 'stampTota', 'tick', 'correct', 'caught', 'survived', 'page'] as const
    for (const c of cues) {
      const before = created.oscs.length + created.sources.length
      a.cue(c)
      expect(created.oscs.length + created.sources.length).toBeGreaterThan(before)
    }
    a.setMuted(true)
    const before = created.oscs.length + created.sources.length
    a.cue('stampTota')
    expect(created.oscs.length + created.sources.length).toBe(before)
  })

  it('setMuted(true) sets the master gain to 0 and setMuted(false) restores it', () => {
    const a = createAudioEngine()
    a.unlock()
    const master = created.gains[0]!
    expect(master.gain.value).toBeGreaterThan(0)
    a.setMuted(true)
    expect(master.gain.value).toBe(0)
    a.setMuted(false)
    expect(master.gain.value).toBeGreaterThan(0)
  })

  it('setMuted before unlock is remembered', () => {
    const a = createAudioEngine()
    a.setMuted(true)
    a.unlock()
    expect(created.gains[0]!.gain.value).toBe(0)
  })

  it('ambience(era) starts a bed and ambience(null) stops it', async () => {
    const a = createAudioEngine()
    a.unlock()
    a.ambience('bombay-1942')
    await vi.waitFor(() => expect(created.sources.some((s) => s.loop && s.buffer && (s.buffer as { duration?: number }).duration === 30)).toBe(true))
    const started = [...created.oscs, ...created.sources].filter((n) => n.start.mock.calls.length > 0)
    expect(started.length).toBeGreaterThan(0)
    a.ambience(null)
    await vi.waitFor(() => { for (const n of started) expect(n.stop).toHaveBeenCalled() })
  })

  it('a bed requested then cancelled before its fetch resolves never starts', async () => {
    const a = createAudioEngine()
    a.unlock()
    a.ambience('delhi-1857')
    a.ambience(null)
    await new Promise((r) => setTimeout(r, 10))
    expect(created.sources.some((s) => s.loop && (s.buffer as { duration?: number } | null)?.duration === 30)).toBe(false)
  })

  it('carries on silently when the bed fails to load or decode', async () => {
    g.fetch = vi.fn(() => Promise.reject(new Error('offline')))
    const a = createAudioEngine()
    a.unlock()
    expect(() => a.ambience('lahore-1929')).not.toThrow()
    await new Promise((r) => setTimeout(r, 10))
    expect(() => a.cue('correct')).not.toThrow()
  })

  it('sleeps while the tab is hidden and wakes on return, unless muted', () => {
    const a = createAudioEngine()
    a.setHidden(true) // before unlock: nothing to suspend
    a.setHidden(false)
    a.unlock()
    const c = created.instances[0]!
    c.resume.mockClear()
    a.setHidden(true)
    expect(c.suspend).toHaveBeenCalledTimes(1)
    expect(c.state).toBe('suspended')
    a.setHidden(true) // no change, no call
    expect(c.suspend).toHaveBeenCalledTimes(1)
    a.unlock() // a stray gesture while hidden does not wake it
    expect(c.resume).not.toHaveBeenCalled()
    a.setHidden(false)
    expect(c.resume).toHaveBeenCalledTimes(1)
    expect(c.state).toBe('running')

    a.setMuted(true)
    a.setHidden(true)
    c.resume.mockClear()
    a.setHidden(false)
    expect(c.resume).not.toHaveBeenCalled() // muted: it stays asleep
    a.setMuted(false)
    expect(c.resume).toHaveBeenCalledTimes(1) // unmuting on a visible tab wakes it
  })

  it('is a safe no-op everywhere when AudioContext is missing', () => {
    delete g.AudioContext
    const a = createAudioEngine()
    expect(() => {
      a.unlock()
      a.setMuted(true)
      a.cue('caught')
      a.ambience('delhi-1947')
      a.ambience(null)
    }).not.toThrow()
  })

  it('falls back to webkitAudioContext', () => {
    delete g.AudioContext
    g.webkitAudioContext = MockCtx
    const a = createAudioEngine()
    a.unlock()
    expect(created.instances).toHaveLength(1)
  })
})
