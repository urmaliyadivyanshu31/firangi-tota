import { describe, expect, it } from 'vitest'
import fixture from '../../src/content/eras/_fixture'
import { countSentences, pencilTells, surfaceTells, validateEra } from '../../src/content/validate'
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

  describe('pencil tells', () => {
    const marks = (n: number) => Array.from({ length: n }, (_, i) => `w${i}`)
    const withCounts = (genuine: number[], forged: number[]): Era => {
      const e = fresh()
      const g = msg(e, 'm1')
      const f = msg(e, 'm2')
      e.messages = [
        ...genuine.map((n, i) => ({ ...structuredClone(g), id: `g${i}`, checks: { en: marks(n), hi: marks(n) } })),
        ...forged.map((n, i) => ({ ...structuredClone(f), id: `f${i}`, checks: { en: marks(n), hi: marks(n) } })),
      ]
      return e
    }
    const paired = (): Era => {
      const e = fresh()
      msg(e, 'm1').pair = 'p'
      msg(e, 'm2').pair = 'p'
      msg(e, 'm1').checks = { en: ['guards changed', 'the gate'], hi: ['पहरेदार बदले', 'फाटक पर'] }
      return e
    }
    it('accepts the untouched fixture', () => {
      expect(pencilTells(fresh())).toEqual([])
    })
    it('flags a pair whose halves carry different numbers of marks', () => {
      const p = pencilTells(paired())
      expect(p).toContain('m2: checks count differs from its pair (1 vs 2) [en]')
      expect(p).toContain('m2: checks count differs from its pair (1 vs 2) [hi]')
    })
    it('flags a mean gap beyond 15%', () => {
      expect(pencilTells(withCounts([3, 3], [2, 2]))).toEqual([
        'surface: pencil count gives away (3 vs 2) [en]',
        'surface: pencil count gives away (3 vs 2) [hi]',
      ])
    })
    it('flags a gap in the share with 2+ marks beyond 15 points, even when the means match', () => {
      const p = pencilTells(withCounts([2, 2], [1, 3]))
      expect(p).toContain('surface: pencil count gives away (100% vs 50% with 2+ marks) [en]')
      expect(p.some((x) => x.includes('(2 vs 2)'))).toBe(false)
    })
    it('accepts small gaps', () => {
      expect(pencilTells(withCounts([3, 3, 2], [3, 2, 2]))).toEqual([])
    })
    it('runs inside validateEra and can be switched off', () => {
      const e = paired()
      expect(validateEra(e)).toContain('m2: checks count differs from its pair (1 vs 2) [en]')
      const off = validateEra(e, { pencilTells: false })
      expect(off.some((x) => x.includes('checks count differs') || x.includes('pencil count'))).toBe(false)
    })
    it('flags a mark that leans on a filled-in date', () => {
      const e = fresh()
      msg(e, 'm1').checks = { en: ['On 11 May', 'guards changed'], hi: ['पहरेदार बदले', 'फाटक पर'] }
      const p = validateEra(e)
      expect(p).toContain('m1: check "On 11 May" depends on the date (not found on day 2) [en]')
      expect(p.some((x) => x.includes('depends on the date') && x.includes('[hi]'))).toBe(false)
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

  describe('case-file stories', () => {
    // the fixture's f1: value "The rising began on a Monday."; f2: "The court sat in Delhi."
    const story = (e: Era, en: string, hi = 'विद्रोह [[सोमवार]] को शुरू हुआ।') => {
      e.facts[0]!.story = { en, hi }
      return validateEra(e)
    }
    it('are required in both languages', () => {
      const e = fresh()
      e.facts[0]!.story.hi = ''
      expect(validateEra(e)).toContain('f1: story missing hi')
    })
    it('need a highlight, and well-formed ones', () => {
      expect(story(fresh(), 'The rising began on a Monday.')).toContain('f1: story needs at least one [[highlight]] [en]')
      expect(story(fresh(), 'The rising began on a [[Monday]].', 'विद्रोह सोमवार को शुरू हुआ।')).toContain('f1: story needs at least one [[highlight]] [hi]')
      for (const bad of ['The rising began on a [[Monday.', 'The rising began on a [[[[Monday]]]].', 'The [[]] rising began on a [[Monday]].']) {
        expect(story(fresh(), bad)).toContain('f1: story has a stray, empty or nested bracket [en]')
      }
    })
    it('are one sentence within the word limit, with Hindi at 1.5x', () => {
      expect(story(fresh(), 'The rising began on a [[Monday]]. It spread.')).toContain('f1: story must be one sentence (has 2) [en]')
      const long = (n: number) => Array.from({ length: n }, () => 'very').join(' ')
      expect(story(fresh(), `${long(20)} on a [[Monday]]`)).toContain('f1: story too long (23 words, max 22) [en]')
      expect(story(fresh(), `${long(19)} on a [[Monday]]`).some((p) => p.includes('story too long'))).toBe(false)
      expect(story(fresh(), 'The rising began on a [[Monday]].', `${'बहुत '.repeat(33)}[[सोमवार]]`)).toContain('f1: story too long (34 words, max 33) [hi]')
      // initials are not sentence ends, in either script
      expect(story(fresh(), 'The rising began on a [[Monday]], says B.C. Rao.').some((p) => p.includes('one sentence'))).toBe(false)
      expect(story(fresh(), 'The rising began on a [[Monday]].', 'बी.सी. कहते हैं: विद्रोह [[सोमवार]] को शुरू हुआ।').some((p) => p.includes('one sentence'))).toBe(false)
    })
    it("highlight every capitalised word of the value, but not one that is only the value's sentence case", () => {
      expect(story(fresh(), 'The [[rising]] began on a Monday.')).toContain('f1: story must highlight "Monday" from the value [en]')
      const e = fresh()
      e.facts[0]!.value.en = 'Enters at the Delhi Gate'
      expect(story(e, 'The road enters at the [[Delhi Gate]].').filter((p) => p.includes('must highlight'))).toEqual([])
      expect(story(e, 'The road comes in at the [[Delhi Gate]].')).toContain('f1: story must highlight "Enters" from the value [en]')
      e.facts[0]!.value.en = 'Maj-Gen Rees, from 7 Aug'
      expect(story(e, 'From [[7 August]], [[Major-General Rees]] leads.').filter((p) => p.includes('f1:'))).toEqual([])
    })
    it("put every number of the value in a highlight and add none", () => {
      const e = fresh()
      e.facts[0]!.value = { en: 'Rs 30 from 18 May', hi: '18 मई से 30 रुपये' }
      e.facts[0]!.label = { en: 'Pay, 1857', hi: 'तनख़्वाह, 1857' }
      const ok = '[[30 rupees]] from [[18 May]], in 1857.'
      const hiOk = '1857 में [[18 मई]] से [[30 रुपये]]।'
      expect(story(e, ok, hiOk).filter((p) => p.includes('f1:'))).toEqual([])
      expect(story(e, '30 rupees from [[18 May]].', hiOk)).toContain('f1: story: "30" from the value must sit in a [[highlight]] [en]')
      expect(story(e, ok, '[[18 मई]] से 30 रुपये, [[30]] नहीं।')).toContain('f1: story: "30" must sit in a [[highlight]] [hi]')
      expect(story(e, '[[30 rupees]] from [[18 May]], not [[40]].', hiOk)).toContain('f1: story: "40" is not in the fact\'s label or value [en]')
      expect(story(e, ok, '[[१८ मई]] से [[30 रुपये]]।')).toContain('f1: story uses Devanagari digits; write 0-9 [hi]')
    })
    it('name no one the fact and the era do not', () => {
      expect(story(fresh(), 'The rising began at Meerut on a [[Monday]].')).toContain('f1: story names "Meerut", which the fact and the era\'s intro do not [en]')
      // the fixture's persona names the Red Fort; "You" opens a sentence
      expect(story(fresh(), 'You sit at the Red Fort; the rising began on a [[Monday]].').filter((p) => p.includes('names'))).toEqual([])
    })
    it('come in 2 or 3 paragraphs, in story order', () => {
      const e = fresh()
      e.facts[1]!.para = 1
      expect(validateEra(e)).toContain('delhi-1857: the case file needs 2 or 3 paragraphs (has 1)')
      const back = fresh()
      back.facts = [back.facts[1]!, back.facts[0]!]
      expect(validateEra(back)).toContain('f1: para 1 after para 2: list the facts in story order')
    })
  })
})
