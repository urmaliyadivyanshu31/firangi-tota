import { describe, expect, it } from 'vitest'
import type { Fact } from '../../src/content/types'
import { strings } from '../../src/i18n/strings'
import { buildSheet, dayTitleFor, eraLabel, messageText } from '../../src/ui/message'
import { relatedFacts } from '../../src/ui/pencil'
import { era, msgById } from './helpers'

describe('the sheet the paper shows', () => {
  it('fills placeholders in the body, from and to, and gives the date line', () => {
    const e = era()
    const m = msgById(e, 'm1')
    m.from = { en: 'The Subedar, {weekday}', hi: 'सूबेदार, {weekday}' }
    const s = buildSheet({ era: e, msg: m, isoDate: '1857-05-11', lang: 'en', pencil: true })
    expect(s).toMatchObject({ era: e.id, channel: 'petition', lang: 'en', pencil: true, heading: strings.en.sheetPetitionHead })
    expect(s.body).toBe('On 11 May 1857 the guards changed at the Delhi gate.')
    expect(s.body).toBe(messageText(m, '1857-05-11', 'en'))
    expect(s.from).toBe('The Subedar, Monday')
    expect(s.to).toBe('The Clerk')
    expect(s.dateLine).toBe('Monday, 11 May 1857')
    expect(s.checks).toEqual(['the Delhi gate'])
    expect(s.documentMark).toBe(false)
  })

  it('carries the checks for the paper to underline, in the sheet language', () => {
    const e = era()
    const s = buildSheet({ era: e, msg: msgById(e, 'm2'), isoDate: '1857-05-12', lang: 'hi', pencil: false })
    expect(s.checks).toEqual(['लाहौर में लगा'])
    expect(s.pencil).toBe(false)
    expect(s.body).toContain('12 मई 1857')
  })

  it('adds no priority or serial of its own to a telegram, and never marks a real document (R30b)', () => {
    const e = era({ channel: 'telegram' })
    const m = msgById(e, 'm1')
    m.document = { sources: [{ id: 's1' }] }
    const s = buildSheet({ era: e, msg: m, isoDate: '1947-08-05', lang: 'en', pencil: false })
    expect(s.heading).toBe(strings.en.sheetTelegramHead)
    expect(s.serial).toBeUndefined()
    expect(s.documentMark).toBe(false)
  })

  it('titles the day in both languages', () => {
    expect(dayTitleFor(1, '1942-10-30', 'hi')).toEqual({ big: 'दिन 1', small: 'शुक्रवार, 30 अक्टूबर 1942' })
    expect(dayTitleFor(3, '1942-11-01', 'en')).toEqual({ big: 'Day 3', small: 'Sunday, 1 November 1942' })
  })

  it('labels the place in the top bar without saying the city twice', () => {
    const delhi = era({ title: { en: 'Delhi 1857', hi: 'दिल्ली 1857' }, place: { en: 'Red Fort, Delhi', hi: 'लाल क़िला, दिल्ली' } })
    expect(eraLabel(delhi, 'hi')).toEqual({ title: 'दिल्ली 1857', place: 'लाल क़िला' })
    const lahore = era({ title: { en: 'Lahore 1929', hi: 'लाहौर 1929' }, place: { en: 'Lahore', hi: 'लाहौर' } })
    expect(eraLabel(lahore, 'en')).toEqual({ title: 'Lahore 1929', place: null })
  })
})

describe('pencil marks in the case file', () => {
  const f = (id: string, en: string, hi = en): Fact => ({ id, label: { en: id, hi: id }, value: { en, hi }, story: { en, hi }, para: 1, sources: [] })
  const facts = [
    f('commanders', 'Mirza Mughal is Commander-in-Chief.'),
    f('regiments', 'The 3rd Light Cavalry and the 11th and 20th Native Infantry.'),
    f('gates', 'Kashmiri and Mori Gates in the north wall.'),
    f('money', '1 rupee = 16 annas.'),
    f('court', 'His chosen heir is Mirza Jawan Bakht.'),
  ]

  it('marks the facts that share words with the checks', () => {
    expect(relatedFacts(['Mirza Jawan Bakht as Commander-in-Chief'], facts, 'en')).toEqual(['commanders', 'court'])
    expect(relatedFacts(['the 3rd Light Cavalry rode in'], facts, 'en')).toEqual(['regiments'])
  })

  it('matches short word endings, ignores common words, and marks nothing for nothing', () => {
    expect(relatedFacts(['a regiment at the gate'], facts, 'en')).toEqual(['regiments', 'gates'])
    expect(relatedFacts(['and the of'], facts, 'en')).toEqual([])
    expect(relatedFacts([], facts, 'en')).toEqual([])
  })

  it('treats a genuine message and its forged twin alike: the marks come from the checks only', () => {
    const real = relatedFacts(['Mirza Mughal as Commander-in-Chief'], facts, 'en')
    const forged = relatedFacts(['Mirza Jawan Bakht as Commander-in-Chief'], facts, 'en')
    expect(real).toContain('commanders')
    expect(forged).toContain('commanders')
  })

  it('works on Devanagari', () => {
    const hi = [f('a', 'दरबार दिल्ली में लगता था।'), f('b', 'विद्रोह सोमवार को शुरू हुआ।')]
    expect(relatedFacts(['लाहौर में दरबार लगा'], hi, 'hi')).toEqual(['a'])
  })

  it('marks at most three facts', () => {
    const many = [1, 2, 3, 4, 5].map((n) => f(`x${n}`, `Gate ${n} and the fort`))
    expect(relatedFacts(['the fort gate'], [...many, ...facts], 'en').length).toBeLessThanOrEqual(3)
  })
})
