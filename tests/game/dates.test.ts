import { describe, expect, it } from 'vitest'
import { fillTemplate } from '../../src/game/dates'
import { dayDate } from '../../src/game/dates'
import { pencilOn } from '../../src/game/config'
import { fixtureEra } from './fixture'

describe('fillTemplate', () => {
  it('fills date and weekday in English', () => {
    expect(fillTemplate('{weekday}, {date}', '1857-05-17', 'en')).toBe('Sunday, 17 May 1857')
  })
  it('fills date and weekday in Hindi', () => {
    expect(fillTemplate('{weekday}, {date}', '1857-05-17', 'hi')).toBe('रविवार, 17 मई 1857')
  })
  it('supports offsets', () => {
    expect(fillTemplate('{weekday+1}', '1947-08-14', 'en')).toBe('Friday')
    expect(fillTemplate('{date+2}', '1947-08-14', 'en')).toBe('16 August 1947')
    expect(fillTemplate('{date+20}', '1857-05-17', 'en')).toBe('6 June 1857')
  })
  it('leaves unknown tokens untouched', () => {
    expect(fillTemplate('{foo} {date-1} {date+x}', '1857-05-17', 'en')).toBe('{foo} {date-1} {date+x}')
  })
})

describe('dayDate', () => {
  it('day 1 is windowStart and day 14 is 13 days later', () => {
    const era = fixtureEra()
    expect(dayDate(era, 1)).toBe(era.windowStart)
    expect(dayDate(era, 14)).toBe('1857-05-23')
  })
})

describe('pencilOn', () => {
  it('follows the difficulty rule', () => {
    expect(pencilOn('easy', 1) && pencilOn('easy', 14)).toBe(true)
    expect([1, 2, 3].every((d) => pencilOn('medium', d))).toBe(true)
    expect(pencilOn('medium', 4)).toBe(false)
    expect([1, 7, 14].some((d) => pencilOn('hard', d))).toBe(false)
  })
})
