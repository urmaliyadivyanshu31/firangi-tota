import type { Era, Message, Tier } from '../content/types'
import { DAYS, type Difficulty } from './config'

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

/**
 * One message per day. Preferences, in order of how readily they are relaxed:
 * tier first, then real/forged; pair and no-duplicate rules never relax.
 */
export function buildRun(era: Era, d: Difficulty, rng: () => number): Message[] {
  const days = DAYS[d]
  const slots: (Message | undefined)[] = new Array(days).fill(undefined)
  const usedIds = new Set<string>()
  const usedPairs = new Set<string>()
  const take = (m: Message) => {
    usedIds.add(m.id)
    if (m.pair) usedPairs.add(m.pair)
  }

  // 1. onDay messages go to their own day (later conflicts are skipped).
  for (const m of era.messages) {
    if (m.onDay === undefined || m.onDay > days || slots[m.onDay - 1]) continue
    if (m.pair && usedPairs.has(m.pair)) continue
    slots[m.onDay - 1] = m
    take(m)
  }

  // 2. The rest of the pool: never onDay messages (they only appear on their day).
  const free: number[] = []
  slots.forEach((s, i) => { if (!s) free.push(i) })
  const eligible = era.messages.filter((m) => m.onDay === undefined && !(m.pair && usedPairs.has(m.pair)))
  const units = new Set(eligible.map((m) => m.pair ?? `#${m.id}`)).size
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
    const ok = (m: Message) => m.onDay === undefined && !usedIds.has(m.id) && !(m.pair && usedPairs.has(m.pair))
    const tier = wantTier.get(i)!
    const real = wantReal.get(i)!
    const tiers = ([1, 2, 3] as Tier[]).sort((a, b) => Math.abs(a - tier) - Math.abs(b - tier))
    let pool: Message[] = []
    for (const matchReal of [true, false]) {
      for (const t of tiers) {
        pool = era.messages.filter((m) => ok(m) && m.tier === t && (!matchReal || m.real === real))
        if (pool.length) break
      }
      if (pool.length) break
    }
    const chosen = pool[Math.floor(rng() * pool.length)]!
    slots[i] = chosen
    take(chosen)
  }
  return slots as Message[]
}
