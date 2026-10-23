import { describe, expect, it } from 'vitest'
import { createChapter, nextDay, stamp } from '../../src/game/state'
import { mulberry32 } from '../../src/game/rng'
import { fixtureEra } from './fixture'

const mk = () => createChapter(fixtureEra(), 'easy', mulberry32(7))

describe('chapter state', () => {
  it('starts on day 1, reading', () => {
    const s = mk()
    expect(s).toMatchObject({ era: 'delhi-1857', difficulty: 'easy', day: 1, days: 7, phase: 'reading' })
    expect(s.queue).toHaveLength(7)
  })
  it('correct stamp -> stamped', () => {
    const s = mk()
    const verdict = s.queue[0]!.real ? 'asli' : 'tota'
    expect(stamp(s, verdict)).toMatchObject({ phase: 'stamped', lastCorrect: true })
  })
  it('wrong stamp -> caught', () => {
    const s = mk()
    const verdict = s.queue[0]!.real ? 'tota' : 'asli'
    expect(stamp(s, verdict)).toMatchObject({ phase: 'caught', lastCorrect: false })
  })
  it('timeout -> caught', () => {
    expect(stamp(mk(), 'timeout')).toMatchObject({ phase: 'caught', lastCorrect: false })
  })
  it('stamp outside reading is a no-op', () => {
    const caught = stamp(mk(), 'timeout')
    expect(stamp(caught, 'asli')).toBe(caught)
  })
  it('nextDay advances, and survives on the last day', () => {
    let s = mk()
    for (let day = 1; day <= 7; day++) {
      s = stamp(s, s.queue[day - 1]!.real ? 'asli' : 'tota')
      s = nextDay(s)
      if (day < 7) expect(s).toMatchObject({ day: day + 1, phase: 'reading' })
    }
    expect(s.phase).toBe('survived')
  })
  it('nextDay is a no-op unless stamped', () => {
    const s = mk()
    expect(nextDay(s)).toBe(s)
  })
})
