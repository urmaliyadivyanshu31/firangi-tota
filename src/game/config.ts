export type Difficulty = 'easy' | 'medium' | 'hard'

/** Days per chapter. */
export const DAYS: Record<Difficulty, 7 | 10 | 14> = { easy: 7, medium: 10, hard: 14 }

/** Seconds on the clock for each message. */
export const TIMER_S: Record<Difficulty, number> = { easy: 90, medium: 60, hard: 40 }

/** Puzzle #1 of the daily Aaj ka Taar (IST date). */
export const DAILY_EPOCH = '2026-10-24'

/** Pencil marks (the "check" highlights): Easy always, Medium for the first 5 days, Hard never. */
export const PENCIL_MEDIUM_DAYS = 5
export function pencilOn(d: Difficulty, day: number): boolean {
  if (d === 'easy') return true
  if (d === 'medium') return day <= PENCIL_MEDIUM_DAYS
  return false
}
