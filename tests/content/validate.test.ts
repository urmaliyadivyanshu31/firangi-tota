import { describe, expect, it } from 'vitest'
import fixture from '../../src/content/eras/_fixture'
import { countSentences, surfaceTells, validateEra } from '../../src/content/validate'
import type { Era } from '../../src/content/types'

const fresh = (): Era => structuredClone(fixture)
const msg = (e: Era, id: string) => {
  const m = e.messages.find((x) => x.id === id)
  if (!m) throw new Error('no message ' + id)
  return m
}
const has = (e: Era, text: string) => expect(validateEra(e).some((p) => p.includes(text))).toBe(true)

describe('validateEra', () => {
  it('accepts the untouched fixture', () => {
    expect(validateEra(fresh())).toEqual([])
  })
  it('requires a tell on a forged message', () => {
    const e = fresh()
    msg(e, 'm2').tells = []
    expect(validateEra(e)).toContain('m2: forged message needs at least one tell')
  })
  it('requires why on a real message', () => {
    const e = fresh()
    delete msg(e, 'm1').why
    has(e, 'why')
  })
  it('rejects tells on a genuine message', () => {
    const e = fresh()
    msg(e, 'm1').tells = structuredClone(msg(e, 'm2').tells)
    has(e, 'genuine message must not have tells')
  })
  it('rejects why or document on a forged message', () => {
    const e = fresh()
    msg(e, 'm2').why = structuredClone(msg(e, 'm1').why)
    msg(e, 'm2').document = { sources: [{ id: 's1' }] }
    has(e, 'forged message must not have why')
    has(e, 'forged message must not have document')
  })
  it('flags an unknown source', () => {
    const e = fresh()
    e.facts[0]!.sources = [{ id: 'nope' }]
    has(e, 'unknown source')
  })
  it('flags unknown sources in every place a SourceRef appears', () => {
    const e = fresh()
    msg(e, 'm1').why!.sources = [{ id: 'x1' }]
    msg(e, 'm1').document = { sources: [{ id: 'x2' }] }
    msg(e, 'm2').tells![0]!.sources = [{ id: 'x3' }]
    e.receipts[0]!.source = { id: 'x4' }
    e.epilogue.sources = [{ id: 'x5' }]
    const problems = validateEra(e).filter((p) => p.includes('unknown source'))
    expect(problems.length).toBeGreaterThanOrEqual(5)
  })
  it('flags an unknown fact on a tell', () => {
    const e = fresh()
    msg(e, 'm2').tells![0]!.factId = 'nope'
    has(e, 'unknown fact')
  })
  it('flags an unknown rule on a tell', () => {
    const e = fresh()
    msg(e, 'm2').tells![0]!.ruleId = 'nope'
    expect(validateEra(e)).toContain('m2: unknown rule nope')
  })
  it('flags an onDay message that precedes its rule', () => {
    const e = fresh()
    const rule = e.rules[0]!
    rule.arrivesOnDay = 6
    const m = msg(e, 'm2')
    m.tells![0]!.ruleId = rule.id
    m.onDay = 3
    expect(validateEra(e)).toContain('m2: onDay before its rule arrives')
    m.onDay = 6
    expect(validateEra(e).some((p) => p.includes('onDay before'))).toBe(false)
  })
  it('flags a missing hi string', () => {
    const e = fresh()
    e.messages[0]!.from.hi = ''
    has(e, 'missing hi')
  })
  it('flags a missing en string', () => {
    const e = fresh()
    e.epilogue.caught[0]!.en = '  '
    has(e, 'missing en')
  })
  it('flags a check absent from the filled text', () => {
    const e = fresh()
    msg(e, 'm1').checks = { en: ['guards changed'], hi: ['यह नहीं है'] }
    has(e, 'check not found')
  })
  it('runs checks against the filled text, not the template', () => {
    const e = fresh()
    msg(e, 'm1').checks = { en: ['{date}'], hi: ['पहरेदार बदले'] }
    has(e, 'check not found')
  })
  it('flags duplicate ids', () => {
    const e = fresh()
    e.messages[1]!.id = 'm1'
    has(e, 'duplicate id')
  })
  it('flags onDay outside 1-14', () => {
    const e = fresh()
    msg(e, 'm1').onDay = 15
    has(e, 'onDay')
  })
  it('flags arrivesOnDay outside 1-14', () => {
    const e = fresh()
    e.rules[0]!.arrivesOnDay = 0
    has(e, 'arrivesOnDay')
  })
  it('flags an invalid windowStart', () => {
    const e = fresh()
    e.windowStart = '1857-13-45'
    has(e, 'windowStart')
  })

  describe('word limits', () => {
    const long = (n: number) => Array.from({ length: n }, () => 'word').join(' ')
    it('flags an over-long English message with the exact problem string', () => {
      const e = fresh()
      msg(e, 'm1').text.en = long(31)
      expect(validateEra(e)).toContain('m1: text too long (31 words, max 30) [en]')
    })
    it('lets Hindi use 1.5x, rounded up', () => {
      const e = fresh()
      msg(e, 'm1').text.hi = long(45)
      expect(validateEra(e).some((p) => p.includes('too long') && p.includes('[hi]'))).toBe(false)
      msg(e, 'm1').text.hi = long(46)
      expect(validateEra(e)).toContain('m1: text too long (46 words, max 45) [hi]')
    })
    it('counts words after filling templates', () => {
      const e = fresh()
      msg(e, 'm1').text.en = `${long(28)} {date}`
      expect(validateEra(e)).toContain('m1: text too long (31 words, max 30) [en]')
    })
    it('limits sentences per message but not abbreviations or initials', () => {
      const e = fresh()
      msg(e, 'm1').text.en = 'One. Two? Three! Four.'
      expect(validateEra(e)).toContain('m1: text too many sentences (4, max 3) [en]')
      msg(e, 'm1').text.en = 'Mr. M.K. Gandhi sent No. 5 to Dr. Rao. Done.'
      expect(validateEra(e).some((p) => p.includes('sentences'))).toBe(false)
      expect(countSentences('एक। दो। तीन। चार।')).toBe(4)
    })
    it('limits other fields and can be switched off', () => {
      const e = fresh()
      e.facts[0]!.value.en = long(7)
      e.epilogue.caught = [e.epilogue.caught[0]!, e.epilogue.caught[0]!, e.epilogue.caught[0]!]
      const problems = validateEra(e)
      expect(problems).toContain('f1: value too long (7 words, max 6) [en]')
      expect(problems).toContain('epilogue: caught too many paragraphs (3, max 2)')
      expect(validateEra(e, { wordLimits: false }).some((p) => p.includes('too long'))).toBe(false)
    })
  })

  describe('surface tells', () => {
    const withTexts = (genuine: string[], forged: string[]): Era => {
      const e = fresh()
      const g = msg(e, 'm1')
      const f = msg(e, 'm2')
      e.messages = [
        ...genuine.map((t, i) => ({ ...structuredClone(g), id: `g${i}`, text: { en: t, hi: t } })),
        ...forged.map((t, i) => ({ ...structuredClone(f), id: `f${i}`, text: { en: t, hi: t } })),
      ]
      return e
    }
    it('accepts the untouched fixture', () => {
      expect(surfaceTells(fresh())).toEqual([])
    })
    it('flags an ellipsis that only genuine messages use', () => {
      const e = withTexts(['Send word now … quickly please', 'Come at dawn today please'], ['Send word now quickly please', 'Come at dawn today please'])
      expect(validateEra(e, { wordLimits: false })).toContain('surface: ellipsis gives away genuine (50% genuine vs 0% forged) [en]')
    })
    it('accepts ellipses used on both sides', () => {
      const e = withTexts(['Send word now … quickly', 'Come at dawn today'], ['Send word … quickly now', 'Come at dawn today'])
      expect(surfaceTells(e).some((p) => p.includes('ellipsis'))).toBe(false)
    })
    it('flags a length gap beyond 25%', () => {
      const e = withTexts(['one two three four'], ['one two three four five six'])
      expect(surfaceTells(e)).toContain('surface: length gives away (4 vs 6 words) [en]')
      const near = withTexts(['one two three four'], ['one two three four five'])
      expect(surfaceTells(near)).toEqual([])
    })
    it('can be switched off', () => {
      const e = withTexts(['one two three four'], ['one two three four five six'])
      expect(validateEra(e, { surfaceTells: false }).some((p) => p.startsWith('surface'))).toBe(false)
    })
  })

  describe('endings', () => {
    it('are required', () => {
      const e = fresh()
      delete (e as Partial<Era>).endings
      expect(validateEra(e)).toContain('endings: missing')
    })
    it('require both languages', () => {
      const e = fresh()
      e.endings!.caught.stamp.hi = ''
      has(e, 'endings.caught.stamp missing hi')
    })
    it('enforce word limits, with Hindi at 1.5x', () => {
      const e = fresh()
      e.endings!.survived.stamp = { en: 'one two three four', hi: 'एक दो तीन चार पाँच' }
      e.endings!.caught.title = { en: 'a b c d e f g h i j', hi: 'a b c d e f g h i j k l m n o' }
      const p = validateEra(e)
      expect(p).toContain('delhi-1857: endings.survived.stamp too long (4 words, max 3) [en]')
      expect(p.some((x) => x.includes('endings.survived.stamp') && x.includes('[hi]'))).toBe(false)
      expect(p).toContain('delhi-1857: endings.caught.title too long (10 words, max 9) [en]')
      expect(p).toContain('delhi-1857: endings.caught.title too long (15 words, max 14) [hi]')
    })
  })
})
