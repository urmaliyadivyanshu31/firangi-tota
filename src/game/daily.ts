import type { Era, EraId, Message } from '../content/types'
import { ERAS } from '../content/registry'
import { DAILY_EPOCH } from './config'
import { mulberry32, seedFrom } from './rng'

const IST_OFFSET_MS = 330 * 60_000
const DAY_MS = 86_400_000
const SIZE = 5

export interface Daily { number: number; isoDate: string; era: EraId; messages: Message[] }

export function dailyFrom(nowMs: number, eras: Era[]): Daily {
  if (eras.length === 0) throw new Error('No eras loaded: cannot build the daily puzzle')
  const isoDate = new Date(nowMs + IST_OFFSET_MS).toISOString().slice(0, 10)
  const days = Math.floor((Date.parse(`${isoDate}T00:00:00Z`) - Date.parse(`${DAILY_EPOCH}T00:00:00Z`)) / DAY_MS)
  const number = Math.max(1, days + 1)
  const era = eras[(number - 1) % eras.length]!
  const rng = mulberry32(seedFrom(isoDate))

  // Seeded shuffle of the pool without onDay messages (they depend on a chapter's day), one per pair.
  const pool = era.messages.filter((m) => m.onDay === undefined)
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j]!, pool[i]!]
  }
  const picked: Message[] = []
  const pairs = new Set<string>()
  for (const m of pool) {
    if (picked.length === SIZE) break
    if (m.pair && pairs.has(m.pair)) continue
    if (m.pair) pairs.add(m.pair)
    picked.push(m)
  }
  if (picked.length < SIZE) throw new Error(`Era "${era.id}" has too few messages for the daily puzzle`)
  return { number, isoDate, era: era.id, messages: picked }
}

export function dailyFor(nowMs: number): Daily {
  return dailyFrom(nowMs, ERAS)
}
