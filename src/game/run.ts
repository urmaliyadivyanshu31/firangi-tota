import type { Era, Message, Tier } from '../content/types'
import { DAYS, EVENT_CHANCE, type Difficulty } from './config'

/**
 * First day this message may appear: when the last rule needed to catch the tells of the message,
 * or of any message sharing its pair key, has arrived (a pair is gated as a unit, so a
 * gated forgery never reveals that its genuine twin is the "early" kind).
 */
export function earliestDay(era: Era, m: Message): number {
  let day = 1
  for (const x of era.messages.filter((o) => o === m || (m.pair !== undefined && o.pair === m.pair))) {
    for (const t of x.tells ?? []) {
      const rule = t.ruleId ? era.rules.find((r) => r.id === t.ruleId) : undefined
      if (rule) day = Math.max(day, rule.arrivesOnDay)
    }
  }
  return day
}

function tierWeights(d: Difficulty, day: number, days: number): [number, number, number] {
  if (day <= 3) return [1, 0, 0]
  const t = days > 1 ? (day - 1) / (days - 1) : 1
  const tier3Allowed = d === 'hard' ? day >= 5 : d === 'medium' ? day >= 8 : false
  return [Math.max(0.1, 1 - t * 0.8), 0.6, tier3Allowed ? t : 0]
}

function pickTier(w: [number, number, number], rng: () => number): Tier {
  const total = w[0] + w[1] + w[2]
  let r = rng() * total
  for (let i = 0; i < 3; i++) {
    r -= w[i]!
    if (r < 0) return (i + 1) as Tier
  }
  return 1
}

/** A message and its pair twin count as one: the player has "seen" a pair once either half came. */
export const unitOf = (m: Message): string => m.pair ?? `#${m.id}`

/**
 * One message per day. Preferences, in order of how readily they are relaxed:
 * not seen in the player's recent runs (`recent`, unit keys), then tier, then real/forged;
 * pair and no-duplicate rules never relax. Recent units only steer the picks, so a replay
 * brings different messages in a different order while every dated event keeps its true day.
 */
export function buildRun(era: Era, d: Difficulty, rng: () => number, recent: ReadonlySet<string> = new Set()): Message[] {
  const days = DAYS[d]
  const fresh = (m: Message) => !recent.has(unitOf(m))
  // the undated pool alone can fill the whole run, so a dated event seen last time may give way
  const poolUnits = new Set(era.messages.filter((m) => m.onDay === undefined).map(unitOf)).size
  const slots: (Message | undefined)[] = new Array(days).fill(undefined)
  const usedIds = new Set<string>()
  const usedPairs = new Set<string>()
  const take = (m: Message) => {
    usedIds.add(m.id)
    if (m.pair) usedPairs.add(m.pair)
  }

  // 1. onDay messages go to their own day: with probability EVENT_CHANCE, one random eligible candidate per day.
  for (let day = 1; day <= days; day++) {
    let cands = era.messages.filter((m) => m.onDay === day && earliestDay(era, m) <= day && !usedIds.has(m.id) && !(m.pair && usedPairs.has(m.pair)))
    if (d === 'easy' && day <= 3 && cands.some((m) => m.tier === 1)) cands = cands.filter((m) => m.tier === 1)
    if (cands.length === 0 || rng() >= EVENT_CHANCE) continue
    const unseen = cands.filter(fresh)
    if (unseen.length === 0 && recent.size > 0 && poolUnits >= days) continue
    const from = unseen.length > 0 ? unseen : cands
    const m = from[Math.floor(rng() * from.length)]!
    slots[day - 1] = m
    take(m)
  }

  // 2. The rest of the pool: never onDay messages (they only appear on their day).
  const free: number[] = []
  slots.forEach((s, i) => { if (!s) free.push(i) })
  const eligible = era.messages.filter((m) => m.onDay === undefined && !(m.pair && usedPairs.has(m.pair)))
  const units = new Set(eligible.map(unitOf)).size
  if (units < free.length) {
    throw new Error(`Era "${era.id}" has too few usable messages for a ${d} run: need ${free.length} more, have ${units}`)
  }

  // 3. Decide tier and real/forged for each free slot.
  const wantTier = new Map<number, Tier>()
  for (const i of free) wantTier.set(i, pickTier(tierWeights(d, i + 1, days), rng))
  if (d === 'hard') {
    const late = free.filter((i) => i + 1 >= 5 && wantTier.get(i) !== 3)
    let have = free.filter((i) => wantTier.get(i) === 3).length + slots.filter((s) => s?.tier === 3).length
    while (have < 2 && late.length > 0) {
      wantTier.set(late.splice(Math.floor(rng() * late.length), 1)[0]!, 3)
      have++
    }
  }
  const wantReal = new Map<number, boolean>()
  for (const i of free) wantReal.set(i, rng() < 0.5)
  const fix = (value: boolean) => {
    const count = () => slots.filter((s) => s?.real === value).length + free.filter((i) => wantReal.get(i) === value).length
    const flippable = free.filter((i) => wantReal.get(i) !== value)
    while (count() < 2 && flippable.length > 0) {
      wantReal.set(flippable.splice(Math.floor(rng() * flippable.length), 1)[0]!, value)
    }
  }
  fix(true)
  fix(false)

  // 4. Fill slots in day order, relaxing tier first, then real/forged.
  for (const i of free) {
    const ok = (m: Message) => m.onDay === undefined && earliestDay(era, m) <= i + 1 && !usedIds.has(m.id) && !(m.pair && usedPairs.has(m.pair))
    const tier = wantTier.get(i)!
    const real = wantReal.get(i)!
    const tiers = ([1, 2, 3] as Tier[]).sort((a, b) => Math.abs(a - tier) - Math.abs(b - tier))
    // a fresh message of a neighbouring tier beats a repeat, except where the tier is a promise:
    // the first three days are tier 1, and hard's tier-3 days stay tier 3
    const strict = i + 1 <= 3 || tier === 3
    let pool: Message[] = []
    for (const matchReal of [true, false]) {
      if (!strict && recent.size > 0) {
        for (const t of tiers.filter((x) => Math.abs(x - tier) <= 1)) {
          pool = era.messages.filter((m) => ok(m) && fresh(m) && m.tier === t && (!matchReal || m.real === real))
          if (pool.length) break
        }
      }
      if (!pool.length) {
        for (const t of tiers) {
          pool = era.messages.filter((m) => ok(m) && m.tier === t && (!matchReal || m.real === real))
          if (pool.length) break
        }
      }
      if (pool.length) break
    }
    if (pool.length === 0) {
      throw new Error(`Era "${era.id}" has no message that can appear on day ${i + 1} of a ${d} run (rule-gated tells?)`)
    }
    const unseen = pool.filter(fresh)
    const from = unseen.length > 0 ? unseen : pool
    const chosen = from[Math.floor(rng() * from.length)]!
    slots[i] = chosen
    take(chosen)
  }
  return slots as Message[]
}
