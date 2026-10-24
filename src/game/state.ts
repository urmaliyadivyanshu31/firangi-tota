import type { Era, EraId, Message } from '../content/types'
import { DAYS, type Difficulty } from './config'
import { buildRun } from './run'

export type Phase = 'reading' | 'stamped' | 'caught' | 'survived'

export interface ChapterState {
  era: EraId
  difficulty: Difficulty
  day: number // 1-based
  days: number
  queue: Message[]
  phase: Phase
  lastCorrect?: boolean
  /** The last stamp, so the reveal can tell "Too slow" (timeout) from "Wrong". */
  lastVerdict?: Verdict
}

export type Verdict = 'asli' | 'tota' | 'timeout'

export function createChapter(era: Era, d: Difficulty, rng: () => number, recent?: ReadonlySet<string>): ChapterState {
  return { era: era.id, difficulty: d, day: 1, days: DAYS[d], queue: buildRun(era, d, rng, recent), phase: 'reading' }
}

export function stamp(s: ChapterState, verdict: Verdict): ChapterState {
  if (s.phase !== 'reading') return s
  const m = s.queue[s.day - 1]
  const correct = verdict !== 'timeout' && m !== undefined && (verdict === 'asli') === m.real
  return { ...s, phase: correct ? 'stamped' : 'caught', lastCorrect: correct, lastVerdict: verdict }
}

export function nextDay(s: ChapterState): ChapterState {
  if (s.phase !== 'stamped') return s
  if (s.day >= s.days) return { ...s, phase: 'survived' }
  const { lastCorrect: _c, lastVerdict: _v, ...rest } = s
  return { ...rest, day: s.day + 1, phase: 'reading' }
}
