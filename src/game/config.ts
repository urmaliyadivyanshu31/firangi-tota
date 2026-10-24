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

/**
 * After a right stamp the verdict stays on the paper this long (ms), to be read, before the paper
 * is tossed into the basket and the next day starts by itself. A tap, Space or Enter tosses it at once.
 */
export const TOSS_HOLD_MS = 3000
/** Reading the source, or coming back to the tab, gives at least this much hold again (ms). */
export const TOSS_RESUME_MS = 1500
/** Taps and keys this soon after the verdict lands (ms) are taken as the end of a skip, not a toss. */
export const TOSS_GRACE_MS = 450
