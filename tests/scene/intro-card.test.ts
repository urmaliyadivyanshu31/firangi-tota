// The intro cards' 2D drawing (shared by the 3D stage and the flat desk), the portrait loader and
// the paper clip's wire.
import { afterEach, describe, expect, it, vi } from 'vitest'
import { artFor, captionOf, clipPath, drawIntroSpread, drawTotaCard, drawYouCard, introReady, loadArt } from '../../src/scene/intro-card'
import type { IntroSpec } from '../../src/scene/types'
import { fake2d, fontPx, textWidth } from './fake-canvas'

afterEach(() => {
  vi.unstubAllGlobals()
})

const W = 1000
const H = 680
const you = { label: 'You', line: "a munshi in Bahadur Shah Zafar's darbar at the Red Fort", art: '/art/x-you.webp' }
const tota = { label: 'The Tota', line: "an agent for the Firangi, forging papers in the names of the King's men", art: '/art/x-tota.webp' }

describe('the cards', () => {
  it('YOU: the heading in spaced capitals, the line from a capital, every line inside its column', () => {
    const f = fake2d()
    drawYouCard(f.ctx, W, H, you, 'en')
    expect(f.texts.slice(0, 3).map((t) => t.text)).toEqual(['Y', 'O', 'U'])
    const body = f.texts.slice(3)
    expect(body.map((t) => t.text).join(' ')).toBe("A munshi in Bahadur Shah Zafar's darbar at the Red Fort")
    for (const t of body) expect(t.x + textWidth(t.text, t.font)).toBeLessThanOrEqual(W * 0.935 + 0.5)
    expect(Math.max(...body.map((t) => t.y))).toBeLessThanOrEqual(H)
  })

  it('THE TOTA: the heading, the line beside the portrait and clear of the stamp', () => {
    const f = fake2d()
    drawTotaCard(f.ctx, W, H, tota, 'en', null)
    const letters = f.texts.filter((t) => t.text.length === 1 && /[A-Z]/.test(t.text)).map((t) => t.text).join('')
    expect(letters.startsWith('THETOTA')).toBe(true)
    const body = f.texts.filter((t) => t.text.length > 1)
    expect(body.map((t) => t.text).join(' ')).toBe("An agent for the Firangi, forging papers in the names of the King's men")
    for (const t of body) {
      expect(t.x).toBeGreaterThanOrEqual(W * 0.43)
      expect(t.x + textWidth(t.text, t.font)).toBeLessThanOrEqual(W * 0.92 + 0.5)
      expect(t.y).toBeLessThanOrEqual(H * 0.71 + fontPx(t.font)) // the stamp sits below
    }
  })

  it('Hindi: the headings stay as written and the lines set in Devanagari', () => {
    const f = fake2d()
    drawYouCard(f.ctx, W, H, { ...you, label: 'आप', line: 'लाल क़िले का एक मुंशी' }, 'hi')
    drawTotaCard(f.ctx, W, H, { ...tota, label: 'तोता', line: 'फ़िरंगी का एजेंट' }, 'hi', null, true)
    const all = f.texts.map((t) => t.text)
    expect(all).toContain('आप')
    expect(all).toContain('तोता')
    expect(f.texts.find((t) => t.text.includes('मुंशी'))!.font).toContain('FT Deva')
  })

  it('a long hyphenated word shrinks the type or breaks after a hyphen, never running off the card', () => {
    const f = fake2d()
    drawYouCard(f.ctx, W, H, { ...you, line: 'an Indian cipher-and-telegraph-and-wireless-and-teleprinter clerk' }, 'en')
    const body = f.texts.slice(3)
    for (const t of body) expect(t.x + textWidth(t.text, t.font)).toBeLessThanOrEqual(W * 0.935 + 0.5)
    expect(body.some((t) => t.text.endsWith('-'))).toBe(true)
  })

  it('captions start with a capital in English only', () => {
    expect(captionOf('a munshi', 'en')).toBe('A munshi')
    expect(captionOf('लाल क़िले का', 'hi')).toBe('लाल क़िले का')
    expect(captionOf('', 'en')).toBe('')
  })

  it('the flat desk lays both cards out, stacked on a tall screen and side by side on a wide one', () => {
    const s: IntroSpec = { era: 'delhi-1857', lang: 'en', you, tota }
    for (const box of [{ x: 0, y: 70, w: 390, h: 640 }, { x: 0, y: 70, w: 1440, h: 700 }]) {
      const f = fake2d()
      drawIntroSpread(f.ctx, box, s, 1, true)
      expect(f.calls.filter((c) => c === 'rotate').length).toBeGreaterThanOrEqual(2)
      expect(f.texts.some((t) => t.text === 'Y')).toBe(true)
      expect(f.texts.some((t) => t.text.includes('Firangi'))).toBe(true)
    }
    // at k = 0 nothing is drawn yet
    const none = fake2d()
    drawIntroSpread(none.ctx, { x: 0, y: 0, w: 390, h: 640 }, s, 0, true)
    expect(none.texts).toHaveLength(0)
  })
})

describe('the paper clip', () => {
  it('is one continuous wire, 8 mm across and about 32 mm long', () => {
    const pts = clipPath()
    for (let i = 1; i < pts.length; i++) {
      const [ax = 0, ay = 0] = pts[i - 1]!
      const [bx = 0, by = 0] = pts[i]!
      expect(Math.hypot(bx - ax, by - ay)).toBeLessThan(6)
    }
    const xs = pts.map((p) => p[0])
    const ys = pts.map((p) => p[1])
    expect(Math.min(...xs)).toBeCloseTo(1, 1)
    expect(Math.max(...xs)).toBeCloseTo(7, 1)
    expect(Math.max(...ys)).toBeCloseTo(31, 0)
  })
})

describe('the portraits', () => {
  class FakeImage {
    static made: FakeImage[] = []
    onload: (() => void) | null = null
    onerror: (() => void) | null = null
    decoding = ''
    src = ''
    constructor() {
      FakeImage.made.push(this)
    }
  }

  it('load once per URL, and a failed one is tried again next time', async () => {
    FakeImage.made = []
    vi.stubGlobal('Image', FakeImage)
    const a = loadArt('/art/a.webp')
    expect(loadArt('/art/a.webp')).toBe(a)
    expect(FakeImage.made).toHaveLength(1)
    FakeImage.made[0]!.onload?.()
    expect(await a).toBe(FakeImage.made[0])
    expect(artFor('/art/a.webp')).toBe(FakeImage.made[0])
    const b = loadArt('/art/b.webp')
    FakeImage.made[1]!.onerror?.()
    expect(await b).toBeNull()
    expect(artFor('/art/b.webp')).toBeNull()
    void loadArt('/art/b.webp')
    expect(FakeImage.made).toHaveLength(3)
  })

  it('the intro waits for them at most a capped time, and redraws when they come late', async () => {
    vi.useFakeTimers()
    try {
      FakeImage.made = []
      vi.stubGlobal('Image', FakeImage)
      const late = vi.fn()
      let done = false
      const s: IntroSpec = { era: 'delhi-1857', lang: 'en', you: { ...you, art: '/art/c-you.webp' }, tota: { ...tota, art: '/art/c-tota.webp' } }
      void introReady(s, 1200, late).then(() => (done = true))
      await vi.advanceTimersByTimeAsync(1100)
      expect(done).toBe(false)
      await vi.advanceTimersByTimeAsync(200)
      expect(done).toBe(true)
      expect(late).not.toHaveBeenCalled()
      for (const img of FakeImage.made) img.onload?.()
      await vi.advanceTimersByTimeAsync(0)
      expect(late).toHaveBeenCalledTimes(1)
    } finally {
      vi.useRealTimers()
    }
  })
})
