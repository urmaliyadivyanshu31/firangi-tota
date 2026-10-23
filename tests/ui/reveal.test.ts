import { describe, expect, it } from 'vitest'
import { strings } from '../../src/i18n/strings'
import { buildReveal, verdictLine } from '../../src/ui/reveal'
import { era, msgById } from './helpers'

describe('the reveal on the paper', () => {
  it('says the verdict plainly in three ways, and Right when it was right', () => {
    const e = era()
    const real = msgById(e, 'm1')
    const forged = msgById(e, 'm2')
    expect(verdictLine(forged, 'asli', 'en')).toBe(strings.en.verdictPassed)
    expect(verdictLine(real, 'tota', 'en')).toBe(strings.en.verdictRejected)
    expect(verdictLine(real, 'timeout', 'hi')).toBe(strings.hi.tooSlow)
    expect(verdictLine(forged, 'tota', 'en')).toBe(`${strings.en.right} · ${strings.en.wasForged}`)
  })

  it('circles the checked details, notes the tell, and cites the source', () => {
    const e = era()
    const r = buildReveal({ era: e, msg: msgById(e, 'm2'), verdict: 'tota', lang: 'en' })
    expect(r).toMatchObject({ outcome: 'right', real: false, documentMark: false, highlight: ['court sat in Lahore'], note: 'The court sat in Delhi, not Lahore.', lang: 'en' })
    expect(r.back.tell).toBe(r.note)
    expect(r.back.source).toBe('B. Author, Second Book (1950), ch. 3')
    expect(r.back.consequence).toBeUndefined()
    expect(r.back.stamp).toBeUndefined()
  })

  it('at a caught end, carries the era’s ending title, one line of what happened and its stamp', () => {
    const e = era()
    const r = buildReveal({ era: e, msg: msgById(e, 'm1'), verdict: 'tota', lang: 'en', end: 'caught' })
    expect(r.outcome).toBe('wrong')
    expect(r.note).toBe('The gate rota is recorded.')
    expect(r.back.verdictLine).toBe(strings.en.verdictRejected)
    expect(r.back.consequence).toBe('The forger got through The forgery was found.')
    expect(r.back.stamp).toBe('Caught')
  })

  it('at the last day survived, carries the survived ending, in Hindi too', () => {
    const e = era()
    e.messages[0]!.document = { sources: [{ id: 's1', loc: 'p. 3' }] }
    const r = buildReveal({ era: e, msg: msgById(e, 'm1'), verdict: 'asli', lang: 'hi', end: 'survived' })
    expect(r.outcome).toBe('right')
    expect(r.documentMark).toBe(true) // after the stamp the paper may show it (R30b)
    expect(r.back.stamp).toBe('पास')
    expect(r.back.consequence).toBe('हर चिट्ठी परखी गई शहर टिका रहा।')
  })

  it('names a timeout as such', () => {
    const e = era()
    expect(buildReveal({ era: e, msg: msgById(e, 'm2'), verdict: 'timeout', lang: 'en', end: 'caught' }).outcome).toBe('timeout')
  })
})
