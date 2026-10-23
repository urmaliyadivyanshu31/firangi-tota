import { describe, expect, it } from 'vitest'
import { ERAS } from '../../src/content/registry'
import { validateEra } from '../../src/content/validate'
import { buildRun } from '../../src/game/run'
import { dailyFrom } from '../../src/game/daily'
import { DAYS, type Difficulty } from '../../src/game/config'
import { mulberry32 } from '../../src/game/rng'

describe('registered eras', () => {
  for (const era of ERAS) {
    describe(era.id, () => {
      it('passes the validator', () => {
        expect(validateEra(era, { wordLimits: false })).toEqual([])
      })
      // Flip to a real test (validateEra(era) with limits) as each era's minimalist cut merges.
      it.todo(`${era.id} meets the minimalist word limits`)
      it('has enough messages with a good mix', () => {
        const real = era.messages.filter((m) => m.real).length
        const forged = era.messages.length - real
        expect(era.messages.length).toBeGreaterThanOrEqual(40)
        expect(real).toBeGreaterThanOrEqual(16)
        expect(forged).toBeGreaterThanOrEqual(16)
        for (const tier of [1, 2, 3]) {
          expect(era.messages.some((m) => m.tier === tier)).toBe(true)
        }
      })
      for (const d of ['easy', 'medium', 'hard'] as Difficulty[]) {
        it(`builds ${d} runs for 100 seeds`, () => {
          for (let seed = 1; seed <= 100; seed++) {
            expect(buildRun(era, d, mulberry32(seed))).toHaveLength(DAYS[d])
          }
        })
      }
      it('has the expected number of facts, rules and receipts', () => {
        expect(era.facts.length).toBeGreaterThanOrEqual(8)
        expect(era.facts.length).toBeLessThanOrEqual(10)
        expect(era.rules.length).toBeGreaterThanOrEqual(5)
        expect(era.rules.length).toBeLessThanOrEqual(7)
        expect(era.receipts.length).toBeGreaterThanOrEqual(2)
        expect(era.receipts.length).toBeLessThanOrEqual(3)
      })
    })
  }
  it('is sorted by order', () => {
    expect(ERAS.map((e) => e.order)).toEqual([...ERAS.map((e) => e.order)].sort((a, b) => a - b))
  })
  it('builds a 5-message daily puzzle for 30 consecutive dates', () => {
    if (ERAS.length === 0) return
    for (let i = 0; i < 30; i++) {
      expect(dailyFrom(Date.UTC(2026, 9, 24 + i, 6), ERAS).messages).toHaveLength(5)
    }
  })
})
