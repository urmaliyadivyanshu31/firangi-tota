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

  describe('toss: the read card into the drawn basket', () => {
    const verdict = {
      outcome: 'right' as const, real: true, documentMark: false, highlight: [], note: '',
      back: { verdictLine: 'Right — genuine', tell: 'Congress Radio called on 42.34 metres.', source: 'Usha Mehta (1969), p. 12' },
      lang: 'en' as const,
    }
    let frames: FrameRequestCallback[] = []
    let now = 0
    const pump = (ms: number) => {
      for (let t = 0; t < ms; t += 16) {
        now += 16
        const due = frames
        frames = []
        for (const f of due) f(now)
      }
    }
    async function readCard(o: { reduced?: boolean } = {}) {
      frames = []
      now = 0
      vi.spyOn(performance, 'now').mockImplementation(() => now)
      vi.stubGlobal('requestAnimationFrame', (f: FrameRequestCallback) => frames.push(f))
      vi.stubGlobal('cancelAnimationFrame', () => undefined)
      if (o.reduced) vi.stubGlobal('matchMedia', (q: string) => ({ matches: q.includes('reduce'), addEventListener() {}, removeEventListener() {} }))
      const f = fakeCanvas()
      vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation((() => f.ctx) as unknown as HTMLCanvasElement['getContext'])
      const el = document.createElement('div')
      document.body.appendChild(el)
      const cues: string[] = []
      const fb = mountFallback(el, 'bombay-1942', { onCue: (c) => cues.push(c) })
      await fb.showMessage(sheet())
      const r = fb.reveal(verdict)
      fb.skip()
      await r
      return { fb, f, cues }
    }
    afterEach(() => vi.unstubAllGlobals())

    it('flies the card on frames, naming both beats, with the same timing as the 3D toss', async () => {
      const { fb, f, cues } = await readCard()
      expect(fb.getPaperRect()).not.toBeNull()
      let done = false
      void fb.toss().then(() => (done = true))
      expect(cues).toEqual(['toss'])
      expect(fb.getPaperRect()).toBeNull() // off the desk: no source button over it
      expect(fb.getSourceRect()).toBeNull()
      const drawn = f.calls.filter((c) => c === 'drawImage').length
      pump(600)
      expect(f.calls.filter((c) => c === 'drawImage').length).toBeGreaterThan(drawn + 20) // the card, frame by frame
      expect(cues).toEqual(['toss'])
      pump(450) // past the lift and the arc (1000 ms)
      expect(cues).toEqual(['toss', 'tossLand'])
      await Promise.resolve()
      expect(done).toBe(false) // the settle and a held breath
      pump(600)
      await Promise.resolve()
      expect(done).toBe(true)
      fb.dispose()
    })

    it('skip lands it at once; dispose never leaves it hanging', async () => {
      const a = await readCard()
      const p = a.fb.toss()
      pump(100)
      a.fb.skip()
      await p
      expect(a.cues).toEqual(['toss', 'tossLand'])
      a.fb.dispose()
      const b = await readCard()
      const q = b.fb.toss()
      b.fb.dispose()
      await expect(q).resolves.toBeUndefined()
    })

    it('under reduced motion the card fades where it lies, then is gone', async () => {
      const { fb, cues } = await readCard({ reduced: true })
      let done = false
      void fb.toss().then(() => (done = true))
      pump(200)
      await Promise.resolve()
      expect(done).toBe(false)
      pump(200)
      await Promise.resolve()
      expect(done).toBe(true)
      expect(cues).toEqual(['toss', 'tossLand'])
      fb.dispose()
    })

    it('resolves at once with no paper on the desk', async () => {
      const f = fakeCanvas()
      vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation((() => f.ctx) as unknown as HTMLCanvasElement['getContext'])
      const fb = mountFallback(document.createElement('div'), 'delhi-1857')
      await expect(fb.toss()).resolves.toBeUndefined()
      fb.dispose()
    })
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
