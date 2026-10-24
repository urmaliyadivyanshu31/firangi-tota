import { describe, expect, it } from 'vitest'
import { ERAS } from '../../src/content/registry'
import { pencilTells, surfaceTells, validateEra, wordLimits } from '../../src/content/validate'
import { buildRun } from '../../src/game/run'
import { dailyFrom } from '../../src/game/daily'
import { DAYS, type Difficulty } from '../../src/game/config'
import { mulberry32 } from '../../src/game/rng'

describe('registered eras', () => {
  for (const era of ERAS) {
    describe(era.id, () => {
      it('passes the validator', () => {
        expect(validateEra(era)).toEqual([])
      })
      it('meets the minimalist word limits', () => {
        expect(wordLimits(era)).toEqual([])
      })
      it('has no surface giveaways (ellipsis, length)', () => {
        expect(surfaceTells(era)).toEqual([])
      })
      it('has no pencil giveaways (marks per pair, era-wide counts)', () => {
        expect(pencilTells(era)).toEqual([])
      })
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
        // The edges of the rng: 0.99 skips every dated event (rng() >= EVENT_CHANCE), so the free pool
        // alone must fill the run; 0 takes every event it can. Both pick from the ends of each pool.
        for (const [label, r] of [['skips every event', 0.99], ['takes every event', 0]] as const) {
          it(`builds a ${d} run when the rng ${label}`, () => {
            const run = buildRun(era, d, () => r)
            expect(run).toHaveLength(DAYS[d])
            expect(new Set(run.map((m) => m.id)).size).toBe(run.length)
            const pairs = run.map((m) => m.pair).filter((p) => p !== undefined)
            expect(new Set(pairs).size).toBe(pairs.length)
            if (r > 0.6) expect(run.some((m) => m.onDay !== undefined)).toBe(false)
          })
        }
      }
      it('has the expected number of facts, rules and receipts', () => {
        // Easy's case file stays small; Medium and Hard add facts on top (minMode, owner 10-24)
        const easyFacts = era.facts.filter((f) => f.minMode === undefined).length
        expect(easyFacts).toBeGreaterThanOrEqual(8)
        expect(easyFacts).toBeLessThanOrEqual(10)
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
