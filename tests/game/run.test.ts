import { describe, expect, it } from 'vitest'
import { buildRun, unitOf } from '../../src/game/run'
import { ERAS } from '../../src/content/registry'
import { DAYS, EVENT_CHANCE, type Difficulty } from '../../src/game/config'
import { mulberry32 } from '../../src/game/rng'
import { fixtureEra, msg } from './fixture'
import type { Era } from '../../src/content/types'

const DIFFS: Difficulty[] = ['easy', 'medium', 'hard']
const era = fixtureEra()

describe('buildRun', () => {
  for (const d of DIFFS) {
    it(`${d}: holds all invariants over 200 seeds`, () => {
      for (let seed = 1; seed <= 200; seed++) {
        const run = buildRun(era, d, mulberry32(seed))
        expect(run).toHaveLength(DAYS[d])
        const ids = run.map((m) => m.id)
        expect(new Set(ids).size).toBe(ids.length)
        const pairs = run.filter((m) => m.pair).map((m) => m.pair)
        expect(new Set(pairs).size).toBe(pairs.length)
        run.forEach((m, i) => {
          if (m.onDay !== undefined) expect(i + 1).toBe(m.onDay)
        })
        expect(run.filter((m) => m.real).length).toBeGreaterThanOrEqual(2)
        expect(run.filter((m) => !m.real).length).toBeGreaterThanOrEqual(2)
        if (d === 'easy') expect(run.slice(0, 3).every((m) => m.tier === 1)).toBe(true)
        if (d === 'hard') expect(run.filter((m) => m.tier === 3).length).toBeGreaterThanOrEqual(2)
      }
    })
  }

  it('places onDay messages on their day when they fit', () => {
    const seen = new Set<string>()
    for (let seed = 1; seed <= 50; seed++) for (const m of buildRun(era, 'hard', mulberry32(seed))) seen.add(m.id)
    expect(seen.has('day5')).toBe(true)
    expect(seen.has('day12')).toBe(true)
    for (let seed = 1; seed <= 50; seed++) {
      const ids = buildRun(era, 'easy', mulberry32(seed)).map((m) => m.id)
      expect(ids).not.toContain('day12')
    }
  })

  it('is deterministic for a seed', () => {
    const a = buildRun(era, 'hard', mulberry32(42)).map((m) => m.id)
    const b = buildRun(era, 'hard', mulberry32(42)).map((m) => m.id)
    expect(a).toEqual(b)
  })

  it('a replay steers away from the last run, keeping every invariant', () => {
    for (const e of ERAS) {
      for (const d of DIFFS) {
        let shared = 0
        let sharedBlind = 0
        for (let seed = 1; seed <= 40; seed++) {
          const first = buildRun(e, d, mulberry32(seed))
          const units = new Set(first.map(unitOf))
          const again = buildRun(e, d, mulberry32(seed + 1000), units)
          const blind = buildRun(e, d, mulberry32(seed + 1000))
          shared += again.filter((m) => units.has(unitOf(m))).length
          sharedBlind += blind.filter((m) => units.has(unitOf(m))).length
          expect(again).toHaveLength(DAYS[d])
          again.forEach((m, i) => {
            if (m.onDay !== undefined) expect(i + 1).toBe(m.onDay)
          })
          expect(again.filter((m) => m.real).length).toBeGreaterThanOrEqual(2)
          expect(again.filter((m) => !m.real).length).toBeGreaterThanOrEqual(2)
        }
        // at most a third of the overlap a memoryless replay would have
        expect(shared, `${e.id} ${d}`).toBeLessThanOrEqual(sharedBlind / 3)
      }
    }
  })

  it('relaxes tier preferences when the pool is small but big enough', () => {
    const messages = Array.from({ length: 14 }, (_, i) => msg(`m${i}`, 3, i % 2 === 0))
    const small: Era = { ...era, messages }
    for (let seed = 1; seed <= 20; seed++) {
      const run = buildRun(small, 'hard', mulberry32(seed))
      expect(run).toHaveLength(14)
      expect(new Set(run.map((m) => m.id)).size).toBe(14)
    }
  })

  it('never relaxes the pair rule: pair members count once toward the pool', () => {
    const messages = Array.from({ length: 14 }, (_, i) => msg(`m${i}`, 1, i % 2 === 0, { pair: `g${Math.floor(i / 2)}` }))
    expect(() => buildRun({ ...era, messages }, 'hard', mulberry32(1))).toThrow(/delhi-1857/)
  })

  it('throws naming the era when the pool is too small', () => {
    const messages = Array.from({ length: 9 }, (_, i) => msg(`m${i}`, 1, i % 2 === 0))
    expect(() => buildRun({ ...era, messages }, 'medium', mulberry32(1))).toThrow(/delhi-1857/)
  })

  describe('same-day event pairs', () => {
    const twin: Era = {
      ...era,
      messages: [
        ...era.messages.filter((m) => m.onDay === undefined),
        msg('ev-r', 2, true, { onDay: 5, pair: 'ev' }),
        msg('ev-f', 2, false, { onDay: 5, pair: 'ev' }),
      ],
    }
    it('picks either twin, never both, at most one and only on day 5', () => {
      const seen = new Set<string>()
      for (let seed = 1; seed <= 200; seed++) {
        const run = buildRun(twin, 'medium', mulberry32(seed))
        const ev = run.filter((m) => m.id.startsWith('ev-'))
        expect(ev.length).toBeLessThanOrEqual(1)
        if (ev[0]) {
          expect(run[4]!.id).toBe(ev[0].id)
          seen.add(ev[0].id)
        }
      }
      expect(seen).toEqual(new Set(['ev-r', 'ev-f']))
    })
    it('is deterministic for a seed', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const a = buildRun(twin, 'hard', mulberry32(seed)).map((m) => m.id)
        expect(buildRun(twin, 'hard', mulberry32(seed)).map((m) => m.id)).toEqual(a)
      }
    })
  })

  it('never places a rule-gated forgery before its rule arrives', () => {
    const gated = msg('gated', 1, false, { tells: [{ kind: 'knowledge', explain: { en: 'x', hi: 'x' }, ruleId: 'r5' }] })
    const g: Era = {
      ...era,
      rules: [{ id: 'r5', text: { en: 'x', hi: 'x' }, arrivesOnDay: 5 }],
      messages: [gated, ...era.messages],
    }
    let seen = false
    for (let seed = 1; seed <= 200; seed++) {
      const run = buildRun(g, 'hard', mulberry32(seed))
      const i = run.findIndex((m) => m.id === 'gated')
      if (i >= 0) {
        seen = true
        expect(i + 1).toBeGreaterThanOrEqual(5)
      }
    }
    expect(seen).toBe(true)
  })

  it('gates both halves of a pair when only the forged half has a rule', () => {
    const forged = msg('gp-f', 1, false, { pair: 'gp', tells: [{ kind: 'knowledge', explain: { en: 'x', hi: 'x' }, ruleId: 'r5' }] })
    const real = msg('gp-r', 1, true, { pair: 'gp' })
    const g: Era = {
      ...era,
      rules: [{ id: 'r5', text: { en: 'x', hi: 'x' }, arrivesOnDay: 5 }],
      messages: [forged, real, ...era.messages],
    }
    let seen = false
    for (let seed = 1; seed <= 200; seed++) {
      const run = buildRun(g, 'hard', mulberry32(seed))
      const i = run.findIndex((m) => m.pair === 'gp')
      if (i >= 0) {
        seen = true
        expect(i + 1).toBeGreaterThanOrEqual(5)
      }
    }
    expect(seen).toBe(true)
  })

  it('shows an event on its day in about EVENT_CHANCE of runs', () => {
    let hits = 0
    for (let seed = 1; seed <= 500; seed++) {
      const run = buildRun(era, 'hard', mulberry32(seed))
      if (run[4]!.id === 'day5') hits++
      for (const m of run) if (m.onDay !== undefined) expect(run.indexOf(m) + 1).toBe(m.onDay)
    }
    expect(hits / 500).toBeGreaterThan(EVENT_CHANCE - 0.07)
    expect(hits / 500).toBeLessThan(EVENT_CHANCE + 0.07)
  })
})
