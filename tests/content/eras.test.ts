import { describe, expect, it } from 'vitest'
import { ERAS } from '../../src/content/registry'
import { validateEra } from '../../src/content/validate'

describe('registered eras', () => {
  for (const era of ERAS) {
    describe(era.id, () => {
      it('passes the validator', () => {
        expect(validateEra(era)).toEqual([])
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
})
