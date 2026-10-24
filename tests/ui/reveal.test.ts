import { describe, expect, it } from 'vitest'
import { strings } from '../../src/i18n/strings'
import { ERAS } from '../../src/content/registry'
import type { Lang, Message } from '../../src/content/types'
import { buildReveal, revealHighlight, shortSource, verdictLine } from '../../src/ui/reveal'
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
    expect(r.back.source).toBe('Second Book, 1950, ch. 3') // short on the paper; the popover has the full citation
    expect(r.back.consequence).toBeUndefined()
    expect(r.back.stamp).toEqual({ text: strings.en.right, tone: 'right', style: 'seal' })
  })

  it('at a caught end, carries the era’s ending title, one line of what happened and its stamp', () => {
    const e = era()
    const r = buildReveal({ era: e, msg: msgById(e, 'm1'), verdict: 'tota', lang: 'en', end: 'caught' })
    expect(r.outcome).toBe('wrong')
    expect(r.note).toBe('The gate rota is recorded.')
    expect(r.back.verdictLine).toBe(strings.en.verdictRejected)
    expect(r.back.consequence).toBe('The forger got through. The forgery was found.')
    expect(r.back.stamp).toEqual({ text: 'Caught', tone: 'caught', style: 'seal' })
  })

  it('at the last day survived, carries the survived ending, in Hindi too', () => {
    const e = era()
    e.messages[0]!.document = { sources: [{ id: 's1', loc: 'p. 3' }] }
    const r = buildReveal({ era: e, msg: msgById(e, 'm1'), verdict: 'asli', lang: 'hi', end: 'survived' })
    expect(r.outcome).toBe('right')
    expect(r.documentMark).toBe(true) // after the stamp the paper may show it (R30b)
    expect(r.back.stamp).toEqual({ text: 'पास', tone: 'survived', style: 'seal' })
    expect(r.back.consequence).toBe('हर चिट्ठी परखी गई। शहर टिका रहा।')
  })

  it('shortens a long citation for the paper: the title or the author, the year, the first part of the page', () => {
    const e = era()
    e.sources.push(
      { id: 'trial', author: 'Military Commission, Delhi (court record; repr. Calcutta 1895)', title: 'Proceedings on the Trial of Muhammad Bahadur Shah, titular King of Delhi', year: '1858' },
      { id: 'tp', author: 'Nicholas Mansergh (ed.)', title: 'The Transfer of Power 1942-7, Vol. XII: 8 July - 15 August 1947', year: '1983' },
      { id: 'sen', author: 'S. N. Sen', title: 'Eighteen Fifty-Seven', year: '1957' },
    )
    expect(shortSource({ id: 'trial', loc: 'Petition No. 63, 22 May 1857, p.33' }, e)).toBe('Military Commission, 1858, Petition No. 63')
    expect(shortSource({ id: 'tp', loc: 'No. 377' }, e)).toBe('The Transfer of Power 1942-7, 1983, No. 377')
    expect(shortSource({ id: 'sen', loc: 'pp.59-60' }, e)).toBe('Eighteen Fifty-Seven, 1957, pp.59-60')
    for (const id of ['trial', 'tp', 'sen']) expect(shortSource({ id, loc: 'p. 1' }, e).length).toBeLessThanOrEqual(60)
  })

  it('names a timeout as such', () => {
    const e = era()
    expect(buildReveal({ era: e, msg: msgById(e, 'm2'), verdict: 'timeout', lang: 'en', end: 'caught' }).outcome).toBe('timeout')
  })

  it('stamps the back in the era\u2019s own style', () => {
    const styles = (['petition', 'note', 'radio', 'telegram'] as const).map((channel) => {
      const e = era({ channel })
      return buildReveal({ era: e, msg: msgById(e, 'm1'), verdict: 'tota', lang: 'en', end: 'caught' }).back.stamp?.style
    })
    expect(styles).toEqual(['seal', 'police', 'raided', 'telegraph'])
  })

  it('circles only the slip on a forgery with a twin: the checks its genuine twin does not share', () => {
    const e = era()
    const genuine = msgById(e, 'm1')
    const forged = msgById(e, 'm2')
    genuine.pair = forged.pair = 'pp'
    genuine.checks = { en: ['the Kashmiri Gate', 'on 14 May', 'Mirza Mughal'], hi: ['कश्मीरी गेट', '14 मई को', 'मिर्ज़ा मुग़ल'] }
    forged.checks = { en: ['Kashmiri Gate', 'on 14 May', 'Mirza Moghul'], hi: ['कश्मीरी गेट', '14 मई को', 'मिर्ज़ा मोग़ल'] }
    for (const lang of ['en', 'hi'] as Lang[]) {
      const r = buildReveal({ era: e, msg: forged, verdict: 'tota', lang })
      expect(r.highlight).toEqual([forged.checks[lang][2]]) // only the differing substring
      expect(buildReveal({ era: e, msg: genuine, verdict: 'asli', lang }).highlight).toEqual(genuine.checks[lang]) // genuine: all
    }
    // nothing differs: the first check (the word beside the slip); no twin: every check
    forged.checks = { ...genuine.checks }
    expect(revealHighlight(forged, e, 'en')).toEqual([genuine.checks.en[0]])
    delete forged.pair
    forged.checks = { en: ['a', 'b'], hi: ['क', 'ख'] }
    expect(revealHighlight(forged, e, 'en')).toEqual(['a', 'b'])
  })

  it('in the real content, a paired forgery circles a check its twin shares only when every one is shared, and then only the first', () => {
    for (const era of ERAS) {
      for (const m of era.messages as Message[]) {
        if (m.real || !m.pair) continue
        const twins = era.messages.filter((o) => o !== m && o.pair === m.pair)
        if (twins.length === 0) continue
        for (const lang of ['en', 'hi'] as Lang[]) {
          const hl = revealHighlight(m, era, lang)
          const all = (m.checks?.[lang] ?? []).filter((c) => c.trim() !== '')
          const shared = (c: string) => twins.some((t) => (t.checks?.[lang] ?? []).some((x) => x.includes(c)))
          expect(hl.length, `${m.id} [${lang}]`).toBeGreaterThan(0)
          if (all.every(shared)) expect([[all[0]], all], `${m.id} [${lang}]`).toContainEqual(hl) // the first, or all when swapped
          else for (const c of hl) expect(shared(c), `${m.id} [${lang}] ${c}`).toBe(false)
        }
      }
    }
  })

  // The pairs whose halves check the same words, or did: each forgery circles exactly its slip.
  const SLIPS: Record<string, Record<Lang, string>> = {
    'd14-junagadh-tuesday': { en: 'Tuesday', hi: 'मंगलवार' },
    'daily-report-forged': { en: 'Report for', hi: 'की रिपोर्ट' },
    'lh-date1-f': { en: 'Dated', hi: 'तारीख़:' },
    'lh-papers-f': { en: 'Today,', hi: 'आज,' },
    'b42-weekday-f': { en: 'Tonight', hi: 'आज रात' },
  }
  it('b42-songs-f: the songs swapped, so both are circled, in both languages', () => {
    const era = ERAS.find((e) => e.messages.some((m) => m.id === 'b42-songs-f'))!
    const msg = era.messages.find((m) => m.id === 'b42-songs-f')!
    for (const lang of ['en', 'hi'] as Lang[]) expect(revealHighlight(msg, era, lang)).toEqual(msg.checks![lang])
  })

  for (const [id, slip] of Object.entries(SLIPS)) {
    it(`${id}: the verdict circles only the slip, in both languages`, () => {
      const era = ERAS.find((e) => e.messages.some((m) => m.id === id))!
      const msg = era.messages.find((m) => m.id === id)!
      expect(msg.real).toBe(false)
      for (const lang of ['en', 'hi'] as Lang[]) {
        expect(buildReveal({ era, msg, verdict: 'tota', lang }).highlight).toEqual([slip[lang]])
        expect(buildReveal({ era, msg, verdict: 'asli', lang }).highlight).toEqual([slip[lang]])
      }
    })
  }
})
