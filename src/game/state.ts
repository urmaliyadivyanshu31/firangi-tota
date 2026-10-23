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
}

export function createChapter(era: Era, d: Difficulty, rng: () => number): ChapterState {
  return { era: era.id, difficulty: d, day: 1, days: DAYS[d], queue: buildRun(era, d, rng), phase: 'reading' }
}

export function stamp(s: ChapterState, verdict: 'asli' | 'tota' | 'timeout'): ChapterState {
  if (s.phase !== 'reading') return s
  const m = s.queue[s.day - 1]
  const correct = verdict !== 'timeout' && m !== undefined && (verdict === 'asli') === m.real
  return { ...s, phase: correct ? 'stamped' : 'caught', lastCorrect: correct }
}

export function nextDay(s: ChapterState): ChapterState {
  if (s.phase !== 'stamped') return s
  if (s.day >= s.days) return { ...s, phase: 'survived' }
  const { lastCorrect: _drop, ...rest } = s
  return { ...rest, day: s.day + 1, phase: 'reading' }
}
