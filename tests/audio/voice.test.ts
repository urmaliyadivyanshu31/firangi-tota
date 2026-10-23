import { afterEach, describe, expect, it, vi } from 'vitest'
import { createVoice, voiceUrl, type VoiceRequest, type VoiceState } from '../../src/audio/voice'

/** A stand-in for HTMLAudioElement: records calls, and the test fires its media events. */
class FakeAudio extends EventTarget {
  src = ''
  preload = ''
  muted = true
  volume = 0.5
  paused = true
  attrs: Record<string, string> = {}
  next: Promise<void> = Promise.resolve()
  play = vi.fn(() => { this.paused = false; return this.next })
  pause = vi.fn(() => { this.paused = true })
  setAttribute(k: string, v: string) { this.attrs[k] = v }
  fire(type: string) { this.dispatchEvent(new Event(type)) }
}

const A: VoiceRequest = { era: 'delhi-1857', id: 'ev-commanders-real', lang: 'en', day: 2 }
const B: VoiceRequest = { era: 'bombay-1942', id: 'some-radio-message', lang: 'hi', day: 1 }

function setup(init?: (a: FakeAudio) => void) {
  const audios: FakeAudio[] = []
  const v = createVoice({
    createAudio: () => {
      const a = new FakeAudio()
      init?.(a)
      audios.push(a)
      return a as unknown as HTMLAudioElement
    },
  })
  const states: VoiceState[] = []
  v.onState((s) => states.push(s))
  return { v, audios, states, el: () => audios[0]! }
}

const named = (name: string) => Object.assign(new Error(name), { name })

afterEach(() => { vi.restoreAllMocks() })

describe('voice client', () => {
  it('builds the endpoint URL from the request; Dastango is the default and needs no parameter', () => {
    expect(voiceUrl(A)).toBe('/api/voice?era=delhi-1857&id=ev-commanders-real&lang=en&day=2')
    expect(voiceUrl({ ...A, voice: 'dastango' })).toBe(voiceUrl(A))
    expect(voiceUrl({ ...A, voice: 'era' })).toBe(voiceUrl(A)) // old name for the default
    expect(voiceUrl({ ...A, voice: 'guest' })).toBe('/api/voice?era=delhi-1857&id=ev-commanders-real&lang=en&day=2&voice=guest')
  })

  it('the default voice under either name is the same message: a second tap stops it', async () => {
    const { v, el, states } = setup()
    await v.play({ ...A, voice: 'era' })
    await v.play({ ...A, voice: 'dastango' })
    expect(el().play).toHaveBeenCalledTimes(1)
    expect(states[states.length - 1]).toBe('idle')
  })

  it('switching to another voice for the playing message replays it, it does not stop', async () => {
    const { v, el, states } = setup()
    await v.play(A)
    await v.play({ ...A, voice: 'guest' })
    expect(el().src).toContain('voice=guest')
    expect(states).toEqual(['loading', 'playing', 'idle', 'loading', 'playing'])
  })

  it('starts playback synchronously inside the tap, then reports loading and playing', async () => {
    const { v, el, states } = setup()
    const done = v.play(A)
    // play() was called on the element before play() returned: iOS needs this inside the tap.
    expect(el().play).toHaveBeenCalledTimes(1)
    expect(el().src).toBe(voiceUrl(A))
    expect(el().attrs.playsinline).toBe('')
    expect(states).toEqual(['loading'])
    await done
    expect(states).toEqual(['loading', 'playing'])
  })

  it('plays even when game sound is muted: the element is never muted', async () => {
    const { v, el } = setup()
    await v.play(A)
    expect(el().muted).toBe(false)
    expect(el().volume).toBe(1)
  })

  it('goes idle when the clip ends', async () => {
    const { v, el, states } = setup()
    await v.play(A)
    el().fire('ended')
    expect(states[states.length - 1]).toBe('idle')
  })

  it('tapping the same message while it plays stops it', async () => {
    const { v, el, states } = setup()
    await v.play(A)
    await v.play(A)
    expect(el().pause).toHaveBeenCalled()
    expect(el().play).toHaveBeenCalledTimes(1)
    expect(states[states.length - 1]).toBe('idle')
  })

  it('tapping the same message while it loads also stops it', async () => {
    const { v, states } = setup()
    const first = v.play(A)
    await v.play(A)
    await first
    expect(states).toEqual(['loading', 'idle'])
  })

  it('a new message stops the old one and reuses one audio element', async () => {
    const { v, audios, el, states } = setup()
    await v.play(A)
    await v.play(B)
    expect(audios).toHaveLength(1)
    expect(el().src).toBe(voiceUrl(B))
    expect(el().play).toHaveBeenCalledTimes(2)
    expect(states).toEqual(['loading', 'playing', 'idle', 'loading', 'playing'])
  })

  it('the old clip’s aborted play() does not turn the new one into an error', async () => {
    let rejectOld: (e: Error) => void = () => {}
    const pending = new Promise<void>((_, rej) => { rejectOld = rej })
    const { v, states } = setup((a) => { a.play.mockImplementationOnce(() => pending) })
    const first = v.play(A) // still loading
    await v.play(B) // replaces it
    rejectOld(named('AbortError')) // the browser aborts the first clip's play()
    await first
    expect(states).toEqual(['loading', 'idle', 'loading', 'playing'])
  })

  it('a blocked or failed play() sets error', async () => {
    const { v, states } = setup((a) => { a.play.mockImplementationOnce(() => Promise.reject(named('NotAllowedError'))) })
    await v.play(A)
    expect(states).toEqual(['loading', 'error'])
  })

  it('a media error (for example a 503 from the server) sets error', async () => {
    const { v, el, states } = setup()
    const p = v.play(A)
    el().fire('error')
    await p
    expect(states[states.length - 1]).toBe('error')
  })

  it('after an error, tapping the same message tries again', async () => {
    const { v, el, states } = setup()
    const p = v.play(A)
    el().fire('error')
    await p
    await v.play(A)
    expect(el().play).toHaveBeenCalledTimes(2)
    expect(states[states.length - 1]).toBe('playing')
  })

  it('stop() silences a clip; its late events are ignored', async () => {
    const { v, el, states } = setup()
    await v.play(A)
    v.stop()
    el().fire('playing')
    el().fire('error')
    expect(states[states.length - 1]).toBe('idle')
  })

  it('never falls back to speechSynthesis', async () => {
    const speak = vi.fn()
    const g = globalThis as unknown as { speechSynthesis?: unknown }
    const before = g.speechSynthesis
    g.speechSynthesis = { speak, cancel: vi.fn(), getVoices: () => [] }
    try {
      const { v, el } = setup()
      const p = v.play(A)
      el().fire('error')
      await p
      expect(speak).not.toHaveBeenCalled()
    } finally {
      g.speechSynthesis = before
    }
  })

  it('onState returns an unsubscribe, and a throwing listener does not break playback', async () => {
    const { v } = setup()
    const seen: VoiceState[] = []
    v.onState(() => { throw new Error('listener bug') })
    const off = v.onState((s) => seen.push(s))
    await v.play(A)
    off()
    v.stop()
    expect(seen).toEqual(['loading', 'playing'])
  })
})
