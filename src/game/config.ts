export type Difficulty = 'easy' | 'medium' | 'hard'

/** Days per chapter. */
export const DAYS: Record<Difficulty, 7 | 10 | 14> = { easy: 7, medium: 10, hard: 14 }

/** Seconds on the clock for each message. */
export const TIMER_S: Record<Difficulty, number> = { easy: 90, medium: 60, hard: 40 }

/** Puzzle #1 of the daily Aaj ka Taar (IST date). */
export const DAILY_EPOCH = '2026-10-24'

/** Pencil marks (the "check" highlights): Easy always, Medium days 1-3, Hard never. */
export const PENCIL_MEDIUM_DAYS = 3
export function pencilOn(d: Difficulty, day: number): boolean {
  if (d === 'easy') return true
  if (d === 'medium') return day <= PENCIL_MEDIUM_DAYS
  return false
}

/** Chance that a day with event (onDay) candidates actually shows its event, for replay variety. */
export const EVENT_CHANCE = 0.6
