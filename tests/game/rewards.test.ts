import { beforeEach, describe, expect, it } from 'vitest'
import type { EraId } from '../../src/content/types'
import { mulberry32 } from '../../src/game/rng'
import {
  ODDS,
  REWARD_ITEMS,
  addDrops,
  cleanCollection,
  countPhrase,
  earnedLine,
  eraItems,
  jackpotLine,
  loadCollection,
  rewardItem,
  rollReward,
  saveDrops,
  survivalDrops,
  type Drop,
} from '../../src/game/rewards'
import { LOOKS } from '../../src/scene/reward-art'

const ERAS: EraId[] = ['delhi-1857', 'lahore-1929', 'bombay-1942', 'delhi-1947']

describe('the treasures', () => {
  it('each chapter has one coin, sweet, fine rupee, rare treasure and keepsake, each with a look', () => {
    for (const era of ERAS) {
      expect(eraItems(era).map((i) => i.slot)).toEqual(['coin', 'sweet', 'fine', 'rare', 'keepsake'])
    }
    const ids = REWARD_ITEMS.map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const it of REWARD_ITEMS) {
      expect(LOOKS[it.id], it.id).toBeDefined()
      for (const lang of ['en', 'hi'] as const) {
        expect(it.name[lang].one.trim()).not.toBe('')
        expect(it.name[lang].many.trim()).not.toBe('')
      }
    }
  })

  it('names nothing religious', () => {
    const banned = /prasad|temple|mosque|church|gurdwara|god|allah|ram\b|om\b|kalima|holy|sacred|प्रसाद|मंदिर|मस्जिद|भगवान|लड्डू/i
    for (const it of REWARD_ITEMS) for (const lang of ['en', 'hi'] as const) expect(`${it.name[lang].one} ${it.name[lang].many}`).not.toMatch(banned)
  })
})

describe('the draw', () => {
  const N = 200_000
  const tally = (era: EraId, tier: 1 | 2 | 3, seed: number) => {
    const rng = mulberry32(seed)
    const out = { coin: 0, sweet: 0, fine: 0, jackpot: 0, rare: 0, rupees: 0, sweets: 0 }
    const items = eraItems(era)
    for (let i = 0; i < N; i++) {
      const d = rollReward(era, tier, rng)
      const slot = items.find((x) => x.id === d.item)!.slot
      if (!d.jackpot) out[slot as 'coin' | 'sweet' | 'fine']++
      else {
        out.jackpot++
        if (slot === 'rare') out.rare++
        else if (slot === 'fine') out.rupees++
        else out.sweets++
      }
    }
    return out
  }

  it('falls within tolerance of the odds table over many seeded draws', () => {
    const total = ODDS.coin + ODDS.sweet + ODDS.fine + ODDS.jackpot
    for (const [i, era] of ERAS.entries()) {
      const t = tally(era, 1, 1000 + i)
      expect(t.coin / N).toBeCloseTo(ODDS.coin / total, 2)
      expect(t.sweet / N).toBeCloseTo(ODDS.sweet / total, 2)
      expect(t.fine / N).toBeCloseTo(ODDS.fine / total, 2)
      expect(Math.abs(t.jackpot / N - ODDS.jackpot / total)).toBeLessThan(0.003)
      // a jackpot pays as the rare treasure, a handful of rupees or a heap of sweets, by weight
      const k = ODDS.jackpotKinds
      const kt = k.rare + k.rupees + k.sweets
      expect(Math.abs(t.rare / t.jackpot - k.rare / kt)).toBeLessThan(0.02)
      expect(Math.abs(t.rupees / t.jackpot - k.rupees / kt)).toBeLessThan(0.02)
      expect(Math.abs(t.sweets / t.jackpot - k.sweets / kt)).toBeLessThan(0.02)
    }
  })

  it('a hard (tier 3) message doubles the fine and jackpot weights', () => {
    const b = ODDS.hardBoost
    const total = ODDS.coin + ODDS.sweet + (ODDS.fine + ODDS.jackpot) * b
    const t = tally('lahore-1929', 3, 77)
    expect(Math.abs(t.fine / N - (ODDS.fine * b) / total)).toBeLessThan(0.005)
    expect(Math.abs(t.jackpot / N - (ODDS.jackpot * b) / total)).toBeLessThan(0.003)
  })

  it('a jackpot lands about once every two or three chapters', () => {
    // a typical run stamps six days right on tier 1 and 2 messages
    const rng = mulberry32(42)
    const chapters = 20_000
    let jackpots = 0
    for (let c = 0; c < chapters; c++) for (let d = 0; d < 6; d++) if (rollReward('delhi-1857', d < 3 ? 1 : 2, rng).jackpot) jackpots++
    const every = chapters / jackpots
    expect(every).toBeGreaterThan(2)
    expect(every).toBeLessThan(3)
  })

  it('pays a handful of five rupees or a heap of three sweets, and repeats exactly for one seed', () => {
    const a = mulberry32(9)
    const b = mulberry32(9)
    const seen = new Set<string>()
    for (let i = 0; i < 4000; i++) {
      const x = rollReward('delhi-1947', 2, a)
      expect(rollReward('delhi-1947', 2, b)).toEqual(x)
      if (x.jackpot && x.qty > 1) seen.add(`${x.item}×${x.qty}`)
      if (!x.jackpot) expect(x.qty).toBe(1)
    }
    expect(seen).toEqual(new Set([`rupee-1947×${ODDS.handful}`, `jalebi-1947×${ODDS.heap}`]))
  })

  it('surviving gives the keepsake, and on Hard the rare treasure too', () => {
    expect(survivalDrops('bombay-1942', 'easy')).toEqual([{ item: 'card-1942', qty: 1, jackpot: false }])
    expect(survivalDrops('delhi-1857', 'hard')).toEqual([
      { item: 'seal-1857', qty: 1, jackpot: false },
      { item: 'mohur-1857', qty: 1, jackpot: true },
    ])
  })
})

describe('the counts', () => {
  beforeEach(() => localStorage.clear())

  it('are kept per chapter under ft:rewards and survive a reload', () => {
    const drops: Drop[] = [{ item: 'paisa-1857', qty: 1, jackpot: false }, { item: 'rupee-1857', qty: 5, jackpot: true }]
    expect(saveDrops('delhi-1857', drops)).toEqual({ 'paisa-1857': 1, 'rupee-1857': 5 })
    saveDrops('delhi-1857', [{ item: 'paisa-1857', qty: 1, jackpot: false }])
    saveDrops('delhi-1947', [{ item: 'badge-1947', qty: 1, jackpot: false }])
    expect(JSON.parse(localStorage.getItem('ft:rewards')!)).toEqual({ 'delhi-1857': { 'paisa-1857': 2, 'rupee-1857': 5 }, 'delhi-1947': { 'badge-1947': 1 } })
    expect(loadCollection()).toEqual({ 'delhi-1857': { 'paisa-1857': 2, 'rupee-1857': 5 }, 'delhi-1947': { 'badge-1947': 1 } })
  })

  it('drop anything unknown, misplaced or not a whole positive number', () => {
    expect(cleanCollection({ 'delhi-1857': { 'paisa-1857': 3.7, 'badge-1947': 2, nope: 1, 'rupee-1857': -1, 'mohur-1857': 'x' }, junk: 5 })).toEqual({ 'delhi-1857': { 'paisa-1857': 3 } })
    expect(cleanCollection(null)).toEqual({})
    localStorage.setItem('ft:rewards', '{broken')
    expect(loadCollection()).toEqual({})
  })

  it('add without touching the counts they were given', () => {
    const c = { 'anna-1929': 2 }
    expect(addDrops(c, [{ item: 'anna-1929', qty: 1, jackpot: false }, { item: 'note-1929', qty: 1, jackpot: true }])).toEqual({ 'anna-1929': 3, 'note-1929': 1 })
    expect(c).toEqual({ 'anna-1929': 2 })
  })
})

describe('the lines', () => {
  it('say what the run earned, finest first, in one line with no full stop', () => {
    const counts = { 'paisa-1857': 3, 'rupee-1857': 4, 'mohur-1857': 1 }
    expect(earnedLine(counts, 'en')).toBe('You earned a gold mohur, 4 silver rupees and 3 copper paise')
    expect(earnedLine({ 'rupee-1857': 4, 'mohur-1857': 1 }, 'en')).toBe('You earned a gold mohur and 4 silver rupees')
    expect(earnedLine({ 'rupee-1857': 4, 'mohur-1857': 1 }, 'hi')).toBe('आपकी कमाई: एक सोने की मोहर और 4 चाँदी के रुपये')
    expect(earnedLine({ 'card-1942': 1, 'halwa-1942': 2, 'pice-1942': 1 }, 'en')).toBe('You earned a Congress Radio wavelength card, 2 packets of Mahim halwa and a quarter anna')
    expect(earnedLine({}, 'en')).toBe('')
    for (const lang of ['en', 'hi'] as const) expect(earnedLine(counts, lang)).not.toMatch(/[.।]$/)
  })

  it("names a jackpot short: one treasure, or the handful in words", () => {
    expect(jackpotLine({ item: 'mohur-1857', qty: 1, jackpot: true }, 'en')).toBe('A gold mohur!')
    expect(jackpotLine({ item: 'mohur-1857', qty: 1, jackpot: true }, 'hi')).toBe('एक सोने की मोहर!')
    expect(jackpotLine({ item: 'rupee-1929', qty: 5, jackpot: true }, 'en')).toBe('Five silver rupees!')
    expect(jackpotLine({ item: 'rupee-1929', qty: 5, jackpot: true }, 'hi')).toBe('पाँच चाँदी के रुपये!')
    expect(jackpotLine({ item: 'jalebi-1947', qty: 3, jackpot: true }, 'en')).toBe('Three boxes of jalebis!')
    expect(countPhrase('valve-1942', 2, 'en')).toBe('2 spare radio valves')
    expect(rewardItem('nope')).toBeUndefined()
  })
})
