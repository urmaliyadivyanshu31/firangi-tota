// The code in a share link, /s/1857-e7s-en: the chapter's year, the mode, the days, the outcome and
// the language. Only enums and small integers, so the preview card the server draws for a link can
// never carry anything a player typed. The game builds the link with it and the server reads it
// back; the server runs this file as a plain Node ES module, so its relative imports end in `.js`.
import type { EraId, Lang } from '../content/types.js'
import { DAYS, type Difficulty } from './config.js'

export type ShareMode = Difficulty | 'daily'
export type ShareOutcome = 'survived' | 'caught'

export interface ShareResult {
  era: EraId
  mode: ShareMode
  /** A chapter: held out every day, or caught. The daily puzzle: every message right, or not. */
  outcome: ShareOutcome
  /** Days held out (a chapter), or messages right (the daily puzzle). */
  days: number
  lang: Lang
}

/** Messages in one Aaj ka Taar (src/game/daily.ts; a test keeps the two equal). */
export const DAILY_TOTAL = 5

/** Each chapter by its year, the part of the code a person can read. */
export const ERA_YEAR: Record<EraId, string> = {
  'delhi-1857': '1857',
  'lahore-1929': '1929',
  'bombay-1942': '1942',
  'delhi-1947': '1947',
}

const MODE_LETTER: Record<ShareMode, string> = { easy: 'e', medium: 'm', hard: 'h', daily: 'd' }
const OUTCOME_LETTER: Record<ShareOutcome, string> = { survived: 's', caught: 'c' }
const LANGS: readonly Lang[] = ['en', 'hi']

const keyOf = <T extends string>(map: Record<T, string>, v: string): T | undefined =>
  (Object.keys(map) as T[]).find((k) => map[k] === v)

/** Days in a chapter of this mode, or messages in the daily puzzle. */
export function totalFor(mode: ShareMode): number {
  return mode === 'daily' ? DAILY_TOTAL : DAYS[mode]
}

/** A whole number of days within the mode, and "survived" exactly when it is all of them. */
export function isShareResult(r: ShareResult): boolean {
  if (!Object.prototype.hasOwnProperty.call(ERA_YEAR, r.era)) return false
  if (!Object.prototype.hasOwnProperty.call(MODE_LETTER, r.mode)) return false
  if (r.outcome !== 'survived' && r.outcome !== 'caught') return false
  if (!LANGS.includes(r.lang)) return false
  const total = totalFor(r.mode)
  if (!Number.isInteger(r.days) || r.days < 0 || r.days > total) return false
  return (r.outcome === 'survived') === (r.days === total)
}

/** "1857-e7s-en". Throws on a result that cannot happen in the game. */
export function shareCode(r: ShareResult): string {
  if (!isShareResult(r)) throw new Error(`not a shareable result: ${JSON.stringify(r)}`)
  return `${ERA_YEAR[r.era]}-${MODE_LETTER[r.mode]}${r.days}${OUTCOME_LETTER[r.outcome]}-${r.lang}`
}

const MAX_CODE = 24
const LENIENT = /^(\d{4})-?([a-z])(\d{1,3})([a-z])-?([a-z]{2})$/

/**
 * Reads a code. It forgives capitals, a leading zero and missing dashes, and says whether the
 * spelling was exactly the canonical one (the server redirects any other spelling to it). Anything
 * else, or a result the game cannot produce, is null.
 */
export function parseShareCode(raw: string): { result: ShareResult; canonical: boolean } | null {
  if (typeof raw !== 'string' || raw.length === 0 || raw.length > MAX_CODE) return null
  const m = LENIENT.exec(raw.toLowerCase())
  if (!m) return null
  const [, year = '', modeL = '', daysRaw = '', outcomeL = '', lang = ''] = m
  const era = keyOf(ERA_YEAR, year)
  const mode = keyOf(MODE_LETTER, modeL)
  const outcome = keyOf(OUTCOME_LETTER, outcomeL)
  if (!era || !mode || !outcome || !LANGS.includes(lang as Lang)) return null
  const result: ShareResult = { era, mode, outcome, days: Number(daysRaw), lang: lang as Lang }
  if (!isShareResult(result)) return null
  return { result, canonical: raw === shareCode(result) }
}

/** The code in a `/s/<code>` path (the game opened from a share link offline), or null. */
export function codeFromPath(pathname: string): string | null {
  const m = /^\/s\/([^/?#]+)\/?$/.exec(pathname)
  return m ? m[1]! : null
}
