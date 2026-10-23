import { afterEach, describe, expect, it, vi } from 'vitest'
import { canSpeak, onVoicesChanged, pickVoice, speak } from '../../src/ui/speak'

type V = { lang: string; name: string }
const voice = (lang: string): V => ({ lang, name: lang })

class FakeUtterance {
  voice: unknown = null
  lang = ''
  rate = 1
  constructor(public text: string) {}
}

function fakeSynth(voices: V[]) {
  const listeners: (() => void)[] = []
  return {
    voices,
    getVoices: () => voices,
    speak: vi.fn(),
    cancel: vi.fn(),
    addEventListener: (_t: string, fn: () => void) => listeners.push(fn),
    removeEventListener: () => {},
    fire: () => listeners.forEach((fn) => fn()),
  }
}

afterEach(() => vi.unstubAllGlobals())

describe('speak', () => {
  it('canSpeak is false when speechSynthesis is undefined', () => {
    vi.stubGlobal('speechSynthesis', undefined)
    expect(canSpeak('hi')).toBe(false)
    expect(canSpeak('en')).toBe(false)
    expect(() => speak('x', 'hi')).not.toThrow()
  })

  it('canSpeak needs a matching voice', () => {
    vi.stubGlobal('speechSynthesis', fakeSynth([voice('en-US')]))
    expect(canSpeak('hi')).toBe(false)
    expect(canSpeak('en')).toBe(true)
  })

  it('picks hi* for Hindi and en-IN before other English voices', () => {
    const voices = [voice('en-US'), voice('en_IN'), voice('hi_IN')] as unknown as SpeechSynthesisVoice[]
    expect(pickVoice(voices, 'hi')!.lang).toBe('hi_IN')
    expect(pickVoice(voices, 'en')!.lang).toBe('en_IN')
    expect(pickVoice([voice('en-GB')] as unknown as SpeechSynthesisVoice[], 'en')!.lang).toBe('en-GB')
    expect(pickVoice([voice('fr-FR')] as unknown as SpeechSynthesisVoice[], 'en')).toBeUndefined()
  })

  it('speaks the text with the chosen voice', () => {
    const synth = fakeSynth([voice('hi-IN')])
    vi.stubGlobal('speechSynthesis', synth)
    vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance)
    speak('नमस्ते', 'hi')
    expect(synth.speak).toHaveBeenCalledTimes(1)
    const u = synth.speak.mock.calls[0]![0] as FakeUtterance
    expect(u.text).toBe('नमस्ते')
    expect((u.voice as V).lang).toBe('hi-IN')
    expect(u.lang).toBe('hi-IN')
  })

  it('re-checks when the voice list loads late', () => {
    const synth = fakeSynth([])
    vi.stubGlobal('speechSynthesis', synth)
    const cb = vi.fn()
    onVoicesChanged(cb)
    expect(canSpeak('hi')).toBe(false)
    synth.voices.push(voice('hi-IN'))
    synth.fire()
    expect(cb).toHaveBeenCalled()
    expect(canSpeak('hi')).toBe(true)
  })
})
