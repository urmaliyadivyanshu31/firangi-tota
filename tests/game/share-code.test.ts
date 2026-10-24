import { describe, expect, it } from 'vitest'
import type { EraId, Lang } from '../../src/content/types'
import { DAYS } from '../../src/game/config'
import { codeFromPath, DAILY_TOTAL, ERA_YEAR, isShareResult, parseShareCode, shareCode, totalFor, type ShareMode, type ShareResult } from '../../src/game/share-code'
import { SERVER_ERAS } from '../../server/eras'

const ERA_IDS = Object.keys(ERA_YEAR) as EraId[]
const MODES: ShareMode[] = ['easy', 'medium', 'hard', 'daily']
const LANGS: Lang[] = ['en', 'hi']

/** Every result the game can produce. */
function allResults(): ShareResult[] {
  const out: ShareResult[] = []
  for (const era of ERA_IDS) for (const mode of MODES) for (const lang of LANGS) {
    const total = totalFor(mode)
    for (let days = 0; days <= total; days++) out.push({ era, mode, lang, days, outcome: days === total ? 'survived' : 'caught' })
  }
  return out
}

describe('share codes', () => {
  it('reads back every result the game can produce, spelled canonically', () => {
    const results = allResults()
    expect(results).toHaveLength(4 * 2 * (8 + 11 + 15 + 6))
    const codes = new Set<string>()
    for (const r of results) {
      const code = shareCode(r)
      expect(code).toMatch(/^\d{4}-[emhd]\d{1,2}[sc]-(en|hi)$/)
      expect(parseShareCode(code)).toEqual({ result: r, canonical: true })
      codes.add(code)
    }
    expect(codes.size).toBe(results.length)
  })

  it('names the chapters by their year and counts the modes as the game does', () => {
    for (const id of ERA_IDS) expect(ERA_YEAR[id]).toBe(SERVER_ERAS[id].year)
    expect(shareCode({ era: 'delhi-1857', mode: 'easy', outcome: 'survived', days: 7, lang: 'en' })).toBe('1857-e7s-en')
    expect(shareCode({ era: 'delhi-1947', mode: 'hard', outcome: 'caught', days: 3, lang: 'hi' })).toBe('1947-h3c-hi')
    expect(totalFor('daily')).toBe(DAILY_TOTAL)
    expect(totalFor('hard')).toBe(DAYS.hard)
  })

  it('forgives capitals, leading zeros and missing dashes, but says the spelling was not canonical', () => {
    for (const raw of ['1857-E7S-EN', '1857e7sen', '1857-e07s-en', '1857-e007s-en', '1857e7s-en']) {
      expect(parseShareCode(raw)).toEqual({ result: { era: 'delhi-1857', mode: 'easy', outcome: 'survived', days: 7, lang: 'en' }, canonical: false })
    }
  })

  it('refuses anything the game cannot produce', () => {
    for (const raw of [
      '', '1857', '1857-e7s', '1858-e7s-en', '1857-x7s-en', '1857-e7x-en', '1857-e7s-fr',
      '1857-e6s-en', // survived, but not every day
      '1857-e7c-en', // caught, but every day held
      '1857-e8c-en', '1857-h15s-en', '1857-d6s-en', '1857-e-1c-en',
      '1857-e7s-en-', '1857 -e7s-en', '1857-e7s-en/x', '<script>', '1857-e7s-en'.repeat(3),
      '%31857-e7s-en', '1857-e7s-en\n',
    ]) expect(parseShareCode(raw), raw).toBeNull()
    expect(parseShareCode(undefined as unknown as string)).toBeNull()
    expect(() => shareCode({ era: 'delhi-1857', mode: 'easy', outcome: 'survived', days: 6, lang: 'en' })).toThrow()
    expect(isShareResult({ era: 'delhi-1857', mode: 'easy', outcome: 'caught', days: 2.5, lang: 'en' })).toBe(false)
    expect(isShareResult({ era: 'nowhere' as EraId, mode: 'easy', outcome: 'caught', days: 2, lang: 'en' })).toBe(false)
  })

  it('finds the code in a /s/ path', () => {
    expect(codeFromPath('/s/1857-e7s-en')).toBe('1857-e7s-en')
    expect(codeFromPath('/s/1857-e7s-en/')).toBe('1857-e7s-en')
    for (const p of ['/', '/s/', '/s', '/x/1857-e7s-en', '/s/a/b']) expect(codeFromPath(p), p).toBeNull()
  })
})
