import { afterEach, describe, expect, it, vi } from 'vitest'
import { mountFallback } from '../../src/scene/fallback'
import { ERA_PALETTES } from '../../src/scene/palette'
import type { EraId } from '../../src/content/types'
import type { SheetSpec } from '../../src/scene/types'
import { fake2d as fakeCanvas } from './fake-canvas'

afterEach(() => {
  vi.restoreAllMocks()
  document.body.innerHTML = ''
})

// A 2D context that records what was drawn, since jsdom has no canvas backend.
function fake2d() {
  const calls: string[] = []
  const grad = { addColorStop: () => undefined }
  const ctx = new Proxy({} as Record<string, unknown>, {
    get(target, key: string) {
      if (key in target) return target[key]
      if (key === 'createLinearGradient' || key === 'createRadialGradient') return () => grad
      return () => {
        calls.push(key)
      }
    },
    set(target, key: string, value) {
      target[key] = value
      return true
    },
  })
  return { ctx, calls }
}

describe('mountFallback', () => {
  it('draws a still desk on a 2D canvas and cleans up', () => {
    const { ctx, calls } = fake2d()
    const spy = vi
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockImplementation((() => ctx) as unknown as HTMLCanvasElement['getContext'])
    const el = document.createElement('div')
    document.body.appendChild(el)
    const fb = mountFallback(el, 'delhi-1857')
    expect(el.querySelectorAll('canvas')).toHaveLength(1)
    expect(spy).toHaveBeenCalledWith('2d', expect.anything())
    expect(spy).not.toHaveBeenCalledWith('webgl2', expect.anything())
    expect(calls).toContain('fillRect')
    expect(calls).toContain('fill')
    const before = calls.length
    fb.setEra('delhi-1947')
    expect(calls.length).toBeGreaterThan(before)
    fb.dispose()
    expect(el.querySelector('canvas')).toBeNull()
  })

  it('does not throw when the 2D context is unavailable', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
      (() => null) as unknown as HTMLCanvasElement['getContext'],
    )
    const el = document.createElement('div')
    const fb = mountFallback(el, 'bombay-1942')
    expect(() => fb.setEra('lahore-1929')).not.toThrow()
    expect(() => fb.dispose()).not.toThrow()
  })

  it('has a palette for every era', () => {
    const eras: EraId[] = ['delhi-1857', 'lahore-1929', 'bombay-1942', 'delhi-1947']
    for (const id of eras) expect(ERA_PALETTES[id], id).toBeDefined()
  })
})

describe('mountFallback: the message on paper', () => {
  const sheet = (o: Partial<SheetSpec> = {}): SheetSpec => ({
    era: 'bombay-1942',
    channel: 'radio',
    lang: 'en',
    from: 'Usha Mehta',
    to: 'All listeners',
    dateLine: 'Friday, 30 October 1942',
    body: 'This is the Congress Radio calling on 42.34 metres from somewhere in India.',
    checks: ['42.34 metres'],
    pencil: true,
    ...o,
  })

  it('draws the same sheet as the 3D stage, and redraws it in place', async () => {
    const f = fakeCanvas()
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation((() => f.ctx) as unknown as HTMLCanvasElement['getContext'])
    vi.stubGlobal('requestAnimationFrame', () => 1)
    const el = document.createElement('div')
    document.body.appendChild(el)
    const fb = mountFallback(el, 'bombay-1942')
    await fb.showMessage(sheet())
    // typed letters are now and then struck twice, so compare with doubled letters collapsed
    const words = f.texts.map((t) => t.text).join('').replace(/(.)\1+/g, '$1')
    expect(words).toContain('CONGRESRADIO')
    expect(words).toContain('calingon42.34metres')
    const before = f.texts.length
    fb.redrawMessage(sheet({ lang: 'hi', body: 'यह कांग्रेस रेडियो है, 42.34 मीटर पर।', checks: ['42.34 मीटर'] }))
    expect(f.texts.slice(before).map((t) => t.text).join('')).toContain('रेडियो')
    expect(el.querySelectorAll('canvas')).toHaveLength(1)
    expect(() => fb.flash('right')).not.toThrow()
    expect(() => fb.flash('wrong')).not.toThrow()
    await fb.stamp('tota')
    expect(f.texts.map((t) => t.text).join('')).toContain('TOTA')
    fb.dispose()
    expect(el.querySelector('canvas')).toBeNull()
    vi.unstubAllGlobals()
  })

  it('reveals the verdict on the same paper, then draws its back', async () => {
    vi.useFakeTimers()
    const f = fakeCanvas()
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation((() => f.ctx) as unknown as HTMLCanvasElement['getContext'])
    const el = document.createElement('div')
    document.body.appendChild(el)
    const fb = mountFallback(el, 'bombay-1942')
    await fb.showMessage(sheet())
    const done = fb.reveal({
      outcome: 'wrong', real: true, documentMark: false, highlight: ['42.34 metres'], note: 'the right wavelength',
      back: { verdictLine: 'Wrong — this one was genuine', tell: 'Congress Radio called on 42.34 metres.', stamp: { text: 'Raided', tone: 'caught', style: 'raided' }, source: 'Usha Mehta (1969), p. 12' },
      lang: 'en',
    })
    await vi.advanceTimersByTimeAsync(10)
    expect(f.texts.map((t) => t.text).join(' ')).toContain('wavelength')
    expect(fb.getSourceRect()).toBeNull()
    await vi.advanceTimersByTimeAsync(2000)
    await done
    const all = f.texts.map((t) => t.text).join(' ')
    expect(all).toContain('Wrong — this one was genuine')
    expect(all).toContain('RAIDED')
    expect(fb.getSourceRect()).not.toBeNull()
    expect(fb.getPaperRect()).not.toBeNull()
    fb.dispose()
    vi.useRealTimers()
  })

  it('a fresh desk takes the paper, its verdict and skip() back to back: the back shows at once (a lost context)', async () => {
    vi.useFakeTimers()
    try {
      const f = fakeCanvas()
      vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation((() => f.ctx) as unknown as HTMLCanvasElement['getContext'])
      const el = document.createElement('div')
      document.body.appendChild(el)
      const fb = mountFallback(el, 'bombay-1942')
      void fb.showMessage(sheet()) // not awaited: the fonts are still loading
      const done = fb.reveal({
        outcome: 'right', real: true, documentMark: true, highlight: [], note: '',
        back: { verdictLine: 'Right — genuine', tell: 'Congress Radio called on 42.34 metres.', source: 'Usha Mehta (1969), p. 12' },
        lang: 'en',
      })
      fb.skip()
      await vi.advanceTimersByTimeAsync(10) // well under the 1.5 s turn
      await done
      expect(f.texts.map((t) => t.text).join(' ')).toContain('Right — genuine')
      expect(fb.getSourceRect()).not.toBeNull()
      fb.dispose()
    } finally {
      vi.useRealTimers()
    }
  })

  it('skip() during the turn shows the back at once', async () => {
    vi.useFakeTimers()
    try {
      const f = fakeCanvas()
      vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation((() => f.ctx) as unknown as HTMLCanvasElement['getContext'])
      const el = document.createElement('div')
      document.body.appendChild(el)
      const fb = mountFallback(el, 'bombay-1942')
      await fb.showMessage(sheet())
      const done = fb.reveal({
        outcome: 'right', real: true, documentMark: false, highlight: [], note: 'checks out',
        back: { verdictLine: 'Right — genuine', tell: 'Congress Radio called on 42.34 metres.', source: 'Usha Mehta (1969), p. 12' },
        lang: 'en',
      })
      await vi.advanceTimersByTimeAsync(10)
      expect(fb.getSourceRect()).toBeNull() // still the front, with its marks
      fb.skip()
      await done
      expect(fb.getSourceRect()).not.toBeNull()
      fb.dispose()
    } finally {
      vi.useRealTimers()
    }
  })

  it('copes without a 2D context', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation((() => null) as unknown as HTMLCanvasElement['getContext'])
    const fb = mountFallback(document.createElement('div'), 'delhi-1947')
    await expect(fb.showMessage(sheet())).resolves.toBeUndefined()
    expect(() => fb.redrawMessage(sheet())).not.toThrow()
    expect(() => fb.flash('wrong')).not.toThrow()
    fb.dispose()
  })
})

describe('the intro on the flat desk', () => {
  const intro = (lang: 'en' | 'hi' = 'en') => ({
    era: 'delhi-1857' as const,
    lang,
    you: { label: lang === 'en' ? 'You' : 'आप', line: 'a munshi at the Red Fort', art: '/art/fb-you.webp' },
    tota: { label: lang === 'en' ? 'The Tota' : 'तोता', line: 'an agent for the Firangi', art: '/art/fb-tota.webp' },
  })
  class InstantImage {
    onload: (() => void) | null = null
    onerror: (() => void) | null = null
    decoding = ''
    naturalWidth = 480
    naturalHeight = 640
    set src(_v: string) {
      queueMicrotask(() => this.onload?.())
    }
  }

  it('fades both cards up, skip() finishes the fade, and clearIntro or a day title takes them away', async () => {
    const frames: FrameRequestCallback[] = []
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => frames.push(cb))
    vi.stubGlobal('cancelAnimationFrame', () => undefined)
    vi.stubGlobal('Image', InstantImage)
    try {
      const f = fakeCanvas()
      vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation((() => f.ctx) as unknown as HTMLCanvasElement['getContext'])
      const el = document.createElement('div')
      document.body.appendChild(el)
      const fb = mountFallback(el, 'delhi-1857')
      let done = false
      void fb.intro(intro()).then(() => (done = true))
      await vi.waitFor(() => expect(frames.length).toBeGreaterThan(0))
      frames.shift()!(performance.now() + 100)
      expect(f.texts.some((t) => t.text === 'Y')).toBe(true)
      expect(done).toBe(false)
      fb.skip()
      await vi.waitFor(() => expect(done).toBe(true))
      expect(fb.getPaperRect()).toBeNull() // no message paper during the intro
      // a second call (a language change) redraws at once
      f.texts.length = 0
      await fb.intro(intro('hi'))
      expect(f.texts.some((t) => t.text === 'आप')).toBe(true)
      f.texts.length = 0
      await fb.clearIntro()
      expect(f.texts.some((t) => t.text === 'आप')).toBe(false)
      const third = fb.intro(intro())
      fb.skip() // (a desk attached mid-intro shows the cards at once)
      await third
      expect(f.texts.some((t) => t.text === 'Y')).toBe(true)
      f.texts.length = 0
      await fb.dayTitle({ big: 'Day 1', small: 'Sunday, 17 May 1857' }).catch(() => undefined)
      expect(f.texts.some((t) => t.text.includes('Firangi'))).toBe(false)
      fb.dispose()
    } finally {
      vi.unstubAllGlobals()
    }
  }, 10_000)
})
