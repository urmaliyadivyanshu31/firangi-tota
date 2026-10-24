// The stage's choreography sounds: the typewriter sprite, the synthesized paper and seal cues, and
// the one-line mapping from stage cues to audio cues.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cueForStage, createAudioEngine, type Cue } from '../../src/audio/engine'
import { SPRITE, SPRITE_FILE } from '../../src/audio/samples'
import { resetSynthCache } from '../../src/audio/synth'
import type { StageCueName } from '../../src/scene/types'

const param = (v = 1) => ({ value: v, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn(), setTargetAtTime: vi.fn(), cancelScheduledValues: vi.fn() })
interface MockNode { connect: ReturnType<typeof vi.fn>; start: ReturnType<typeof vi.fn>; stop: ReturnType<typeof vi.fn>; buffer: unknown; playbackRate: { value: number }; [k: string]: unknown }
const made: { nodes: MockNode[]; sources: MockNode[]; contexts: number } = { nodes: [], sources: [], contexts: 0 }
const SPRITE_BUFFER = { duration: 2.33, sprite: true }

function node(): MockNode {
  const n: MockNode = { connect: vi.fn(), disconnect: vi.fn(), start: vi.fn(), stop: vi.fn(), gain: param(), frequency: param(440), detune: param(0), Q: param(1), playbackRate: param(1), type: '', loop: false, buffer: null }
  made.nodes.push(n)
  return n
}

class MockCtx {
  state = 'suspended'
  currentTime = 0
  sampleRate = 8000
  destination = node()
  resume = vi.fn(() => Promise.resolve())
  decodeAudioData = vi.fn(() => Promise.resolve(SPRITE_BUFFER as unknown as AudioBuffer))
  constructor() { made.contexts++ }
  createGain() { return node() }
  createOscillator() { return node() }
  createBufferSource() { const n = node(); made.sources.push(n); return n }
  createBiquadFilter() { return node() }
  createBuffer(_c: number, len: number) { return { getChannelData: () => new Float32Array(len) } }
}

const g = globalThis as unknown as Record<string, unknown>
const NEW: Cue[] = [
  'typeKey', 'typeSpace', 'typeDing', 'typeReturn', 'sealCrack', 'paperUnfold', 'envelopeFlap', 'titleSettle', 'correct', 'caught',
  'fileOpen', 'cardTurn', 'stampPress', 'toggleClick', 'plaqueFlick', 'incense', 'clockTick', 'tensionTick', 'endTelegram',
]

beforeEach(() => {
  made.nodes = []
  made.sources = []
  made.contexts = 0
  resetSynthCache()
  g.AudioContext = MockCtx
  g.fetch = vi.fn(() => Promise.resolve({ ok: true, arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)) }))
})
afterEach(() => {
  delete g.AudioContext
})

describe('stage sounds', () => {
  it('are no-ops before the audio is unlocked', () => {
    const a = createAudioEngine()
    for (const c of NEW) a.cue(c)
    expect(made.contexts).toBe(0)
    expect(made.nodes).toHaveLength(0)
    expect(g.fetch).not.toHaveBeenCalled()
  })

  it('preload the typewriter sprite at the unlock, and each cue sounds after it', async () => {
    const a = createAudioEngine()
    a.unlock()
    expect(g.fetch).toHaveBeenCalledWith(expect.stringContaining(SPRITE_FILE))
    for (const c of NEW) {
      const before = made.nodes.length
      a.cue(c)
      expect(made.nodes.length, c).toBeGreaterThan(before)
    }
  })

  it('play keys from the recorded sprite once decoded, varied, starting at once', async () => {
    const a = createAudioEngine()
    a.unlock()
    await vi.waitFor(() => expect((made.contexts && made.nodes.length) || 0).toBeGreaterThan(0))
    await new Promise((r) => setTimeout(r, 0))
    const offsets = new Set<number>()
    const rates = new Set<number>()
    for (let i = 0; i < 12; i++) {
      made.sources = []
      a.cue('typeKey')
      const src = made.sources.find((s) => s.buffer === SPRITE_BUFFER)
      expect(src).toBeDefined()
      const call = src?.start.mock.calls[0] as [number, number, number] | undefined
      expect(call?.[0]).toBe(0) // now, not scheduled ahead
      offsets.add(call?.[1] ?? -1)
      rates.add(src?.playbackRate.value ?? 0)
    }
    const keyStarts = [SPRITE.key0, SPRITE.key1, SPRITE.key2, SPRITE.key3, SPRITE.key4].map(([s]) => s)
    for (const o of offsets) expect(keyStarts).toContain(o)
    expect(offsets.size).toBeGreaterThan(2)
    expect(rates.size).toBeGreaterThan(2)
  })

  it('stay silent when the sound is muted', async () => {
    const a = createAudioEngine()
    a.unlock()
    await new Promise((r) => setTimeout(r, 0))
    a.setMuted(true)
    const before = made.nodes.length
    for (const c of NEW) a.cue(c)
    expect(made.nodes.length).toBe(before)
  })
})

describe('era voices', () => {
  it('the day title settles in each era without trouble, and the tension tick takes a level', () => {
    const a = createAudioEngine()
    a.unlock()
    for (const era of ['delhi-1857', 'lahore-1929', 'bombay-1942', 'delhi-1947'] as const) {
      a.ambience(era)
      const before = made.nodes.length
      a.cue('titleSettle')
      expect(made.nodes.length, era).toBeGreaterThan(before)
    }
    for (const level of [0, 0.5, 1, 7]) expect(() => a.cue('tensionTick', { level })).not.toThrow()
    a.ambience(null)
  })
})

describe('the toss', () => {
  it('the paper leaving the desk and landing in the basket each sound, held well under full scale, and stay silent when muted', () => {
    expect(cueForStage('toss')).toBe('paperToss')
    expect(cueForStage('tossLand')).toBe('basketLand')
    const a = createAudioEngine()
    a.unlock()
    for (const c of ['paperToss', 'basketLand'] as const) {
      const before = made.nodes.length
      a.cue(c)
      const mine = made.nodes.slice(before)
      expect(mine.length, c).toBeGreaterThan(0)
      // every gain stage peaks well under full scale
      const peaks = mine.flatMap((n) => (n.gain as ReturnType<typeof param>).linearRampToValueAtTime.mock.calls.map((x) => x[0] as number))
      expect(peaks.length, c).toBeGreaterThan(0)
      expect(Math.max(...peaks), c).toBeLessThanOrEqual(0.2)
    }
    a.setMuted(true)
    const before = made.nodes.length
    a.cue('paperToss')
    a.cue('basketLand')
    expect(made.nodes.length).toBe(before)
  })
})

describe('cueForStage', () => {
  it('maps every stage cue to a sound, except the stamp the app voices itself', () => {
    const all: StageCueName[] = ['title', 'flip', 'arrive', 'seal', 'unfold', 'flap', 'key', 'space', 'ding', 'return', 'stamp', 'right', 'wrong', 'verdictStamp']
    const out = Object.fromEntries(all.map((n) => [n, cueForStage(n)]))
    expect(out).toEqual({
      title: 'titleSettle', flip: 'page', arrive: 'arrive', seal: 'sealCrack', unfold: 'paperUnfold', flap: 'envelopeFlap',
      key: 'typeKey', space: 'typeSpace', ding: 'typeDing', return: 'typeReturn', stamp: null, right: 'correct', wrong: 'caught', verdictStamp: 'stampAsli',
    })
  })
})
