import { describe, expect, it } from 'vitest'
import { dailyFrom } from '../../src/game/daily'
import { shareText } from '../../src/game/share'
import { fixturePool } from './fixture'

const pool = fixturePool()
describe('dailyFrom', () => {
  it('rolls over at IST midnight and numbers from the epoch', () => {
    const d = dailyFrom(Date.UTC(2026, 10, 1, 18, 45), pool)
    expect(d.isoDate).toBe('2026-11-02')
    expect(d.number).toBe(10)
    expect(dailyFrom(Date.UTC(2026, 10, 1, 18, 29), pool).isoDate).toBe('2026-11-01')
  })
  it('clamps earlier dates to #1', () => {
    expect(dailyFrom(Date.UTC(2026, 9, 1), pool).number).toBe(1)
  })
  it('rotates eras in order', () => {
    const at = (day: number) => dailyFrom(Date.UTC(2026, 9, 24 + day, 6), pool).era
    expect([at(0), at(1), at(2), at(3), at(4)]).toEqual(['delhi-1857', 'lahore-1929', 'bombay-1942', 'delhi-1947', 'delhi-1857'])
  })
  it('is deterministic, with 5 distinct messages', () => {
    const a = dailyFrom(Date.UTC(2026, 10, 5), pool)
    const b = dailyFrom(Date.UTC(2026, 10, 5), pool)
    expect(a.messages.map((m) => m.id)).toEqual(b.messages.map((m) => m.id))
    expect(a.messages).toHaveLength(5)
    expect(new Set(a.messages.map((m) => m.id)).size).toBe(5)
  })
  it('throws on an empty pool', () => {
    expect(() => dailyFrom(Date.UTC(2026, 10, 5), [])).toThrow(/era/i)
  })
})

describe('dailyFrom balance and order', () => {
  it('has at least 2 genuine and 2 forged over 60 consecutive dates', () => {
    for (let i = 0; i < 60; i++) {
      const d = dailyFrom(Date.UTC(2026, 9, 24 + i, 6), pool)
      expect(d.messages.filter((m) => m.real).length).toBeGreaterThanOrEqual(2)
      expect(d.messages.filter((m) => !m.real).length).toBeGreaterThanOrEqual(2)
    }
  })
  it('does not depend on the order eras are passed in', () => {
    const reversed = [...pool].reverse()
    for (let i = 0; i < 8; i++) {
      const t = Date.UTC(2026, 9, 24 + i, 6)
      expect(dailyFrom(t, reversed)).toEqual(dailyFrom(t, pool))
    }
  })
})

describe('shareText', () => {
  it('formats the result grid', () => {
    expect(shareText({ daily: 12, eraTitle: 'Dilli 1857', results: [true, true, false, true, true] })).toBe(
      'Firangi Tota · Aaj ka Taar #12 · Dilli 1857\n✅✅❌✅✅\nfirangitota.com',
    )
  })
})
