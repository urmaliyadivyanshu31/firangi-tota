import { describe, expect, it } from 'vitest'
import {
  MAX_ASPECT,
  MIN_ASPECT,
  PAGE_W,
  drawDayTitle,
  drawSheet,
  drawRevealMarks,
  drawSheetBack,
  findChecks,
  highlightRects,
  stampBox,
  measureSheet,
  splitLeaflet,
  splitSignature,
  wrapText,
} from '../../src/scene/sheet'
import sheetSrc from '../../src/scene/sheet.ts?raw'
import type { SheetSpec } from '../../src/scene/types'
import { fake2d, textWidth } from './fake-canvas'

const HI_BODY = 'बादशाह शान से तख़्त पर बैठे। मिर्ज़ा मुग़ल को पूरी फ़ौज का कमांडर-इन-चीफ़ बनाया गया। पाँचों पलटनों के बैंड आए और अंग्रेज़ी धुनें बजाते रहे।'
const EN_BODY = 'The King took his seat on the throne, in state. Mirza Mughal was made Commander-in-Chief of the whole of the Forces.'

const spec = (o: Partial<SheetSpec> = {}): SheetSpec => ({
  era: 'delhi-1857',
  channel: 'petition',
  lang: 'en',
  from: 'Chuni Lal, news-writer',
  to: "The King's office",
  dateLine: 'Monday, 18 May 1857',
  body: EN_BODY,
  checks: ['Mirza Mughal'],
  pencil: true,
  ...o,
})

describe('wrapText', () => {
  for (const [lang, text] of [['English', EN_BODY], ['Devanagari', HI_BODY]] as const) {
    it(`keeps every ${lang} line within the width and never splits a word`, () => {
      const { ctx } = fake2d()
      ctx.font = '40px serif'
      const maxW = 520
      const lines = wrapText(ctx, text, maxW)
      expect(lines.length).toBeGreaterThan(2)
      for (const line of lines) {
        expect(line.w).toBeLessThanOrEqual(maxW + 0.01)
        const last = line.toks[line.toks.length - 1]
        const first = line.toks[0]
        expect(first && last).toBeTruthy()
        if (first && last) expect(textWidth(text.slice(first.s, last.e), ctx.font)).toBeLessThanOrEqual(maxW + 0.01)
      }
      // the words come back whole and in order: lines break only at spaces
      const words = lines.flatMap((l) => l.toks.map((t) => text.slice(t.s, t.e)))
      expect(words.join(' ')).toBe(text.split(/\s+/).join(' '))
    })
  }

  it('starts a long word on its own line rather than overflowing the one before', () => {
    const { ctx } = fake2d()
    ctx.font = '20px serif'
    const lines = wrapText(ctx, 'aa bb cccccccccccccccccc', 120)
    expect(lines).toHaveLength(2)
  })
})

describe('drawSheet', () => {
  const channels: SheetSpec['channel'][] = ['petition', 'note', 'radio', 'telegram']
  for (const channel of channels) {
    for (const lang of ['en', 'hi'] as const) {
      it(`draws a ${channel} sheet in ${lang} with every word inside the page`, () => {
        const { ctx, texts } = fake2d()
        const s = spec({ channel, lang, body: lang === 'hi' ? HI_BODY : EN_BODY, checks: lang === 'hi' ? ['मिर्ज़ा मुग़ल'] : ['Mirza Mughal'] })
        const m = measureSheet(ctx, s)
        expect(m.aspect).toBeGreaterThanOrEqual(MIN_ASPECT)
        expect(m.aspect).toBeLessThanOrEqual(MAX_ASPECT)
        drawSheet(ctx, 1024, 1024 * m.aspect, s)
        expect(texts.length).toBeGreaterThan(10)
        // drawSheet scales to page units, so the page is 1000 wide in these coordinates
        for (const t of texts) {
          expect(t.x, t.text).toBeGreaterThanOrEqual(-1)
          expect(t.x + textWidth(t.text, t.font), t.text).toBeLessThanOrEqual(PAGE_W + 1)
        }
        // the body is there, word by word (typed text is struck letter by letter)
        const all = texts.map((t) => t.text).join('')
        const sample = lang === 'hi' ? 'तख़्त' : 'throne'
        expect(all.replace(/\s/g, '')).toContain(sample)
      })
    }
  }

  it('sets the body at least 17.5 px on a 359 px sheet (92% of a 390 px phone)', () => {
    const { ctx } = fake2d()
    for (const lang of ['en', 'hi'] as const) {
      const m = measureSheet(ctx, spec({ lang, body: lang === 'hi' ? HI_BODY : EN_BODY }))
      expect((m.body * 359) / PAGE_W).toBeGreaterThanOrEqual(17.5)
    }
  })

  it('grows the sheet for a long text before it shrinks the type', () => {
    const { ctx } = fake2d()
    const short = measureSheet(ctx, spec())
    const long = measureSheet(ctx, spec({ body: `${EN_BODY} `.repeat(4) }))
    expect(long.aspect).toBeGreaterThan(short.aspect)
    expect(long.body).toBeLessThanOrEqual(short.body)
  })

  it('pencils the checks only when pencil marks are on, with the note to check them', () => {
    const on = fake2d()
    drawSheet(on.ctx, 1024, 1365, spec({ pencil: true }))
    const off = fake2d()
    drawSheet(off.ctx, 1024, 1365, spec({ pencil: false }))
    const lines = (calls: string[]) => calls.filter((c) => c === 'lineTo').length
    expect(lines(on.calls)).toBeGreaterThan(lines(off.calls))
    expect(on.texts.some((t) => t.text === 'check the underlined')).toBe(true)
    expect(off.texts.some((t) => t.text === 'check the underlined')).toBe(false)
  })

  it('never shows the real-document tag before the verdict (R30b)', () => {
    const hidden = fake2d()
    drawSheet(hidden.ctx, 1024, 1365, spec({ documentMark: true }))
    const tagged = (texts: { text: string }[]) => texts.map((t) => t.text).join('').replace(/\s/g, '').includes('REALDOCUMENT')
    expect(tagged(hidden.texts)).toBe(false)
    const shown = fake2d()
    drawSheet(shown.ctx, 1024, 1365, spec({ documentMark: true, revealed: true }))
    expect(tagged(shown.texts)).toBe(true)
  })

  it('draws the stamp imprint when given one (the 2D fallback)', () => {
    const { ctx, texts } = fake2d()
    drawSheet(ctx, 1024, 1365, spec(), { kind: 'tota', at: [0.7, 0.8], rot: 0.1 })
    expect(texts.map((t) => t.text).join('')).toContain('TOTA')
  })

  it('keeps the drawer free of three.js, so the fallback can use it before the 3D chunk loads', () => {
    expect(sheetSrc).not.toMatch(/from\s+['"]three/)
  })
})

describe('sheet text helpers', () => {
  it('finds checks exactly, then ignoring case', () => {
    expect(findChecks('Balraj, Commander-in-chief.', ['Commander-in-Chief'])).toEqual([[8, 26]])
    expect(findChecks('दोनों चाबियाँ दिखाए', ['चाबियाँ'])).toEqual([[6, 13]])
    expect(findChecks('nothing here', ['absent', ''])).toEqual([])
  })

  it('sets a trailing " — Name" as the signature', () => {
    expect(splitSignature('Hand it only to the one with the keys. — Villager')).toEqual({ body: 'Hand it only to the one with the keys.', sig: 'Villager' })
    expect(splitSignature('Commander-in-chief.')).toEqual({ body: 'Commander-in-chief.' })
  })

  it('reads a 1929 notice as a printed heading, NOTICE, body and signature', () => {
    const leaf = splitLeaflet(spec({
      era: 'lahore-1929',
      channel: 'note',
      body: 'HINDUSTAN SOCIALIST REPUBLICAN ARMY. NOTICE. It takes a loud voice to make the deaf hear. Long Live the Revolution. Signed, Balraj, Commander-in-Chief.',
    }))
    expect(leaf?.heading).toBe('HINDUSTAN SOCIALIST REPUBLICAN ARMY')
    expect(leaf?.notice).toBe('NOTICE')
    expect(leaf?.sig).toBe('Signed, Balraj, Commander-in-Chief.')
    expect(splitLeaflet(spec({ era: 'lahore-1929', channel: 'note', body: 'Keep it under your cot. — Villager' }))).toBeNull()
  })

  it('draws the day title without throwing in either script', () => {
    const { ctx, texts } = fake2d()
    drawDayTitle(ctx, 1024, 512, { big: 'दिन 1', small: 'शुक्रवार, 30 अक्टूबर 1942' }, 'cream')
    drawDayTitle(ctx, 1024, 512, { big: 'Day 1', small: 'Friday, 30 October 1942' }, 'glass')
    const all = texts.map((t) => t.text).join('')
    expect(all).toContain('दिन 1')
    expect(all).toContain('DAY 1')
  })
})

describe('the verdict on the paper', () => {
  for (const [lang, body, words] of [
    ['en', EN_BODY, ['Mirza Mughal', 'Commander-in-Chief']],
    ['hi', HI_BODY, ['मिर्ज़ा मुग़ल', 'कमांडर-इन-चीफ़']],
  ] as const) {
    it(`finds where each highlight sits on the ${lang} sheet, from the same layout`, () => {
      const { ctx } = fake2d()
      const s = spec({ lang, body })
      const found = highlightRects(ctx, s, [...words, 'not on this paper'])
      for (const h of found.slice(0, 2)) {
        expect(h.rects.length, h.text).toBeGreaterThan(0)
        for (const r of h.rects) {
          expect(r.u0).toBeGreaterThanOrEqual(0)
          expect(r.u1).toBeLessThanOrEqual(1)
          expect(r.u1).toBeGreaterThan(r.u0)
          expect(r.v1).toBeGreaterThan(r.v0)
          expect(r.v0).toBeGreaterThan(0.2) // in the body, below the heading and the From and To lines
          expect(r.v1).toBeLessThan(1)
        }
      }
      expect(found[2]?.rects).toEqual([])
      // the from and to lines can be marked too
      expect(highlightRects(ctx, s, [s.from])[0]?.rects.length).toBeGreaterThan(0)
    })
  }

  it('draws the back in the same form, with the verdict, the tell, the stamp and the source', () => {
    const { ctx, texts } = fake2d()
    const out = drawSheetBack(ctx, 1024, 1365, spec({ channel: 'telegram', era: 'delhi-1947' }), {
      outcome: 'wrong',
      back: {
        verdictLine: 'Wrong — this one was genuine',
        tell: 'The award was published on 17 August.',
        consequence: 'Your post is given away.',
        stamp: { text: 'Caught', tone: 'caught', style: 'telegraph' },
        source: 'Transfer of Power, vol. XII (1983), p. 579',
      },
    }, { stamp: true })
    const all = texts.map((t) => t.text).join(' ')
    for (const w of ['Wrong', 'genuine', 'published', 'given', 'CAUGHT', 'Source']) expect(all).toContain(w)
    expect(out.source.u1).toBeGreaterThan(out.source.u0)
    expect(out.source.v0).toBeGreaterThan(0.8) // at the foot of the paper
  })
})

describe('the margin note', () => {
  const note = 'फ़ौज मिर्ज़ा मुग़ल के हाथ थी, जैसा फ़ाइल में है'
  it('writes whole words only, never a word cut part-way, in at most three lines', () => {
    const words = note.split(' ')
    for (const progress of [0.7, 0.85, 1]) {
      const { ctx, texts } = fake2d()
      drawRevealMarks(ctx, 512, 683, [], { color: 'blue', note, lang: 'hi', body: 60, bodyEnd: 0.55, progress, avoid: [stampBox(0.71, 0.8, 4 / 3)] })
      for (const t of texts) expect(words).toContain(t.text)
      const lines = new Set(texts.map((t) => Math.round(t.y)))
      expect(lines.size).toBeLessThanOrEqual(3)
      if (progress === 1) expect(texts.map((t) => t.text).join(' ')).toBe(note)
    }
  })
})
