import type { Era, EraId, Message } from '../content/types'
import { ERAS } from '../content/registry'
import { DAILY_EPOCH } from './config'
import { mulberry32, seedFrom } from './rng'

const IST_OFFSET_MS = 330 * 60_000
const DAY_MS = 86_400_000
const SIZE = 5
const MIN_EACH = 2

export interface Daily { number: number; isoDate: string; era: EraId; messages: Message[] }

export function dailyFrom(nowMs: number, eras: Era[]): Daily {
  if (eras.length === 0) throw new Error('No eras loaded: cannot build the daily puzzle')
  const isoDate = new Date(nowMs + IST_OFFSET_MS).toISOString().slice(0, 10)
  const days = Math.floor((Date.parse(`${isoDate}T00:00:00Z`) - Date.parse(`${DAILY_EPOCH}T00:00:00Z`)) / DAY_MS)
  const number = Math.max(1, days + 1)
  const sorted = [...eras].sort((a, b) => a.order - b.order)
  const era = sorted[(number - 1) % sorted.length]!
  // The daily puzzle is treated as day 14 for rules: the UI must show ALL of the era's rules, so no tell gating here.
  const rng = mulberry32(seedFrom(isoDate))

  // Seeded shuffle of the pool without onDay messages (they depend on a chapter's day), one per pair.
  const pool = era.messages.filter((m) => m.onDay === undefined)
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j]!, pool[i]!]
  }
  // Pass 1 takes up to 2 genuine and 2 forged; pass 2 fills the rest. One member per pair throughout.
  const chosen = new Set<Message>()
  const pairs = new Set<string>()
  const tryTake = (m: Message) => {
    if (chosen.has(m) || (m.pair && pairs.has(m.pair))) return false
    if (m.pair) pairs.add(m.pair)
    chosen.add(m)
    return true
  }
  for (const real of [true, false]) {
    let n = 0
    for (const m of pool) if (n < MIN_EACH && m.real === real && tryTake(m)) n++
  }
  for (const m of pool) if (chosen.size < SIZE) tryTake(m)
  const picked = pool.filter((m) => chosen.has(m))
  if (picked.length < SIZE) throw new Error(`Era "${era.id}" has too few messages for the daily puzzle`)
  return { number, isoDate, era: era.id, messages: picked }
}

export function dailyFor(nowMs: number): Daily {
  return dailyFrom(nowMs, ERAS)
}
