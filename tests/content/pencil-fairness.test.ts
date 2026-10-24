import { describe, expect, it } from 'vitest'
import { ERAS } from '../../src/content/registry'
import type { Lang } from '../../src/content/types'
import { buildRun } from '../../src/game/run'
import { pencilOn, type Difficulty } from '../../src/game/config'
import { mulberry32 } from '../../src/game/rng'
import { pairChecks, relatedFacts } from '../../src/ui/pencil'

// On pencil days (Easy, Medium days 1-3) a player sees how many words are underlined and how many
// case-file lines are pencilled. Neither count may tell genuine from forged: the best rule of the form
// "N or more means genuine" (or forged) must stay near a coin toss over many seeded runs.

const SEEDS = 200
const LIMIT = 0.62

type Sample = { n: number; real: boolean }

/** Accuracy of the best threshold rule, either direction (thresholds 1-4). */
function bestRule(samples: Sample[]): number {
  let best = 0
  for (let t = 1; t <= 4; t++) {
    const ok = samples.filter((s) => s.n >= t === s.real).length / samples.length
    best = Math.max(best, ok, 1 - ok)
  }
  return best
}

describe('pencil marks do not give the answer away', () => {
  for (const era of ERAS) {
    for (const d of ['easy', 'medium'] as Difficulty[]) {
      it(`${era.id}, ${d}`, () => {
        const marks: Record<Lang, Sample[]> = { en: [], hi: [] }
        const lines: Record<Lang, Sample[]> = { en: [], hi: [] }
        for (let seed = 1; seed <= SEEDS; seed++) {
          buildRun(era, d, mulberry32(seed)).forEach((m, i) => {
            if (!pencilOn(d, i + 1)) return
            for (const lang of ['en', 'hi'] as Lang[]) {
              const checks = m.checks?.[lang] ?? []
              marks[lang].push({ n: checks.length, real: m.real })
              // the case file pencils lines from both halves of a pair, as the day screen does
              lines[lang].push({ n: relatedFacts(pairChecks(m, era, lang), era.facts, lang).length, real: m.real })
            }
          })
        }
        for (const lang of ['en', 'hi'] as Lang[]) {
          expect(bestRule(marks[lang]), `underlines [${lang}]`).toBeLessThanOrEqual(LIMIT)
          expect(bestRule(lines[lang]), `case-file lines [${lang}]`).toBeLessThanOrEqual(LIMIT)
        }
      })
    }
  }
})
