// Rewards (owner 10-24): every right stamp earns a small period-true treasure of its chapter, drawn
// at random like a loot drop: mostly everyday coins and sweets, now and then a finer coin, and
// rarely a jackpot (the era's rare treasure, or a handful at once). Surviving a chapter adds its
// keepsake on top. They are a collection only: no pardon, hint or extra time ever comes from them,
// and one wrong stamp still ends the chapter. Nothing here is religious.
//
// Pure logic: the item list, the odds, the draw, the counts kept in localStorage, and the lines that
// name what was earned. The desk draws them (src/scene/reward-art.ts, src/scene/rewards.ts).
import type { EraId, Lang, Tier } from '../content/types'
import type { Difficulty } from './config'
import { store } from './storage'

/** common: everyday coin or sweet · fine: the silver (1947: nickel) rupee · rare: the jackpot treasure · keepsake: surviving the chapter. */
export type Rarity = 'common' | 'fine' | 'rare' | 'keepsake'

/** One kind of item. `slot` says which role it plays in its era's table. */
export interface RewardItem {
  id: string
  era: EraId
  slot: 'coin' | 'sweet' | 'fine' | 'rare' | 'keepsake'
  rarity: Rarity
  /** "a copper paisa" / "copper paise", and the Hindi. */
  name: Record<Lang, { one: string; many: string }>
}

/** What one draw (or the chapter's end) gives: an item, how many, and whether it was a jackpot. */
export interface Drop {
  item: string
  qty: number
  jackpot: boolean
}

type Names = RewardItem['name']
const n = (en1: string, enN: string, hi1: string, hiN: string): Names => ({ en: { one: en1, many: enN }, hi: { one: hi1, many: hiN } })

/**
 * Five items per chapter, each checked for its place and year:
 *
 * DELHI 1857 (the Red Fort court of Bahadur Shah II, May 1857)
 * - copper paisa: the everyday copper of Delhi's bazaars; thick copper paisas were struck at the
 *   Shahjahanabad (Delhi) mint under the later Mughals, and Company copper circulated beside them.
 * - sohan halwa in a leaf dona: Ghantewala of Chandni Chowk was selling sohan halwa from about 1790;
 *   sweets were carried in leaf donas long before card boxes.
 * - silver rupee of Bahadur Shah II: rupees in his name came from the Delhi mint through his reign
 *   (1837-57), and the rebel court struck them again in 1857 (Krause, Standard Catalog of World
 *   Coins, Mughal Empire, Bahadur Shah II).
 * - gold mohur (rare): gold mohurs in Bahadur Shah II's name are known from the Shahjahanabad mint;
 *   rare even then, a court treasure.
 * - court seal (keepsake): Mughal court orders went out under the emperor's seal; drawn plain, with
 *   no lettering and no religious formula.
 *
 * LAHORE 1929 (the HSRA in Lahore, spring 1929)
 * - one-anna coin: George V's cupro-nickel anna (1907-1936), with its wavy, scalloped edge.
 * - barfi in a paper packet: milk barfi was the everyday halwai sweet of Punjabi towns, sold wrapped
 *   in paper.
 * - silver rupee of George V: struck 1911-1936 in .917 silver, the rupee of the time (the case file
 *   puts the room's rent at Rs 13).
 * - ten-rupee note (rare): Government of India ten-rupee notes with George V's portrait were issued
 *   through the 1920s, before the Reserve Bank (1935); a large sum for a revolutionary's room.
 * - pink HSRA leaflet (keepsake): the party's notices were printed on pink paper and signed "Balraj"
 *   (the chapter's case file and its sources).
 *
 * BOMBAY 1942 (Quit India and the secret Congress Radio, August-November 1942)
 * - quarter anna: George VI's copper quarter anna (1938-1942), the small change of the street.
 * - Mahim halwa: the thin sheets of halwa from Mahim, sold in butter-paper packets, a Bombay sweet
 *   since the 19th century.
 * - silver rupee of George VI: wartime rupees (1940-45) were struck in quaternary (50%) silver.
 * - spare radio valve (rare): the transmitter ran on valves, and in wartime Bombay they were hard
 *   to come by; a spare kept the station on air.
 * - Congress Radio wavelength card (keepsake): the station announced itself on 42.34 metres
 *   ("This is the Congress Radio calling on 42.34 metres from somewhere in India", Usha Mehta).
 *
 * DELHI 1947 (the transfer of power, August 1947)
 * - one-anna coin: George VI's nickel-brass anna, still the coin of India in 1947 (the Republic's
 *   coins came in 1950).
 * - box of jalebis: the jalebi shop at Dariba Kalan, Chandni Chowk, dates from 1884, and sweets
 *   were handed out across Delhi on 15 August 1947.
 * - nickel rupee of 1947: the last rupee of British India, struck in pure nickel in 1946-47 with a
 *   tiger on its back.
 * - midnight session pass (rare): the Constituent Assembly met at 11 p.m. on 14 August 1947 in the
 *   Constitution Hall; gallery passes were few.
 * - tricolour badge (keepsake): the flag was adopted on 22 July 1947, and paper and tin tricolour
 *   badges were worn on Independence Day.
 */
export const REWARD_ITEMS: readonly RewardItem[] = [
  { id: 'paisa-1857', era: 'delhi-1857', slot: 'coin', rarity: 'common', name: n('a copper paisa', 'copper paise', 'एक ताँबे का पैसा', 'ताँबे के पैसे') },
  { id: 'halwa-1857', era: 'delhi-1857', slot: 'sweet', rarity: 'common', name: n('a dona of sohan halwa', 'donas of sohan halwa', 'सोहन हलवे का एक दोना', 'सोहन हलवे के दोने') },
  { id: 'rupee-1857', era: 'delhi-1857', slot: 'fine', rarity: 'fine', name: n('a silver rupee', 'silver rupees', 'चाँदी का एक रुपया', 'चाँदी के रुपये') },
  { id: 'mohur-1857', era: 'delhi-1857', slot: 'rare', rarity: 'rare', name: n('a gold mohur', 'gold mohurs', 'एक सोने की मोहर', 'सोने की मोहरें') },
  { id: 'seal-1857', era: 'delhi-1857', slot: 'keepsake', rarity: 'keepsake', name: n('a court seal', 'court seals', 'दरबार की एक मुहर', 'दरबार की मुहरें') },

  { id: 'anna-1929', era: 'lahore-1929', slot: 'coin', rarity: 'common', name: n('a one\u2011anna coin', 'one\u2011anna coins', 'एक आने का सिक्का', 'एक आने के सिक्के') },
  { id: 'barfi-1929', era: 'lahore-1929', slot: 'sweet', rarity: 'common', name: n('a packet of barfi', 'packets of barfi', 'बर्फ़ी का एक पुड़ा', 'बर्फ़ी के पुड़े') },
  { id: 'rupee-1929', era: 'lahore-1929', slot: 'fine', rarity: 'fine', name: n('a silver rupee', 'silver rupees', 'चाँदी का एक रुपया', 'चाँदी के रुपये') },
  { id: 'note-1929', era: 'lahore-1929', slot: 'rare', rarity: 'rare', name: n('a ten-rupee note', 'ten-rupee notes', 'दस रुपये का एक नोट', 'दस रुपये के नोट') },
  { id: 'leaflet-1929', era: 'lahore-1929', slot: 'keepsake', rarity: 'keepsake', name: n('a pink HSRA leaflet', 'pink HSRA leaflets', 'HSRA का एक गुलाबी पर्चा', 'HSRA के गुलाबी पर्चे') },

  { id: 'pice-1942', era: 'bombay-1942', slot: 'coin', rarity: 'common', name: n('a quarter anna', 'quarter annas', 'पाव आने का एक सिक्का', 'पाव आने के सिक्के') },
  { id: 'halwa-1942', era: 'bombay-1942', slot: 'sweet', rarity: 'common', name: n('a packet of Mahim halwa', 'packets of Mahim halwa', 'माहिम हलवे का एक पुड़ा', 'माहिम हलवे के पुड़े') },
  { id: 'rupee-1942', era: 'bombay-1942', slot: 'fine', rarity: 'fine', name: n('a silver rupee', 'silver rupees', 'चाँदी का एक रुपया', 'चाँदी के रुपये') },
  { id: 'valve-1942', era: 'bombay-1942', slot: 'rare', rarity: 'rare', name: n('a spare radio valve', 'spare radio valves', 'रेडियो का एक फ़ालतू वाल्व', 'रेडियो के फ़ालतू वाल्व') },
  { id: 'card-1942', era: 'bombay-1942', slot: 'keepsake', rarity: 'keepsake', name: n('a Congress Radio wavelength card', 'Congress Radio wavelength cards', 'कांग्रेस रेडियो का एक वेवलेंथ कार्ड', 'कांग्रेस रेडियो के वेवलेंथ कार्ड') },

  { id: 'anna-1947', era: 'delhi-1947', slot: 'coin', rarity: 'common', name: n('a one\u2011anna coin', 'one\u2011anna coins', 'एक आने का सिक्का', 'एक आने के सिक्के') },
  { id: 'jalebi-1947', era: 'delhi-1947', slot: 'sweet', rarity: 'common', name: n('a box of jalebis', 'boxes of jalebis', 'जलेबी का एक डिब्बा', 'जलेबी के डिब्बे') },
  { id: 'rupee-1947', era: 'delhi-1947', slot: 'fine', rarity: 'fine', name: n('a nickel rupee', 'nickel rupees', 'निकल का एक रुपया', 'निकल के रुपये') },
  { id: 'pass-1947', era: 'delhi-1947', slot: 'rare', rarity: 'rare', name: n('a midnight session pass', 'midnight session passes', 'आधी रात की सभा का एक पास', 'आधी रात की सभा के पास') },
  { id: 'badge-1947', era: 'delhi-1947', slot: 'keepsake', rarity: 'keepsake', name: n('a tricolour badge', 'tricolour badges', 'तिरंगे का एक बिल्ला', 'तिरंगे के बिल्ले') },
]

const BY_ID = new Map(REWARD_ITEMS.map((i) => [i.id, i]))

export function rewardItem(id: string): RewardItem | undefined {
  return BY_ID.get(id)
}

/** The era's items in shelf order: coin, sweet, fine, rare, keepsake. */
export function eraItems(era: EraId): RewardItem[] {
  const order = ['coin', 'sweet', 'fine', 'rare', 'keepsake']
  return REWARD_ITEMS.filter((i) => i.era === era).sort((a, b) => order.indexOf(a.slot) - order.indexOf(b.slot))
}

function slotOf(era: EraId, slot: RewardItem['slot']): RewardItem {
  const it = REWARD_ITEMS.find((i) => i.era === era && i.slot === slot)
  if (!it) throw new Error(`No ${slot} reward for ${era}`)
  return it
}

// ------------------------------------------------------------------ the odds (all in one place)

/**
 * One right stamp draws once from this table (weights; they need not sum to 1). Tuned so a jackpot
 * lands about once every two or three chapters: a typical run stamps five to seven days right, so
 * 6.5% a stamp gives about 0.4 jackpots a chapter (P(at least one in 6) ≈ 0.33, mean gap ≈ 2.5
 * chapters). A tier 3 (hard) message doubles the fine and jackpot weights.
 */
export const ODDS = {
  /** The everyday coin of the era (most draws). */
  coin: 0.44,
  /** A sweet of the era, one dona, packet or box. */
  sweet: 0.295,
  /** The silver (1947: nickel) rupee. */
  fine: 0.2,
  /** A jackpot: one of the three below. */
  jackpot: 0.065,
  /** How a jackpot pays, by weight: the rare treasure, a handful of rupees, or a heap of sweets. */
  jackpotKinds: { rare: 0.5, rupees: 0.3, sweets: 0.2 },
  /** How many come in a handful (jackpot rupees) or a heap (jackpot sweets). */
  handful: 5,
  heap: 3,
  /** A tier 3 message multiplies the fine and jackpot weights by this. */
  hardBoost: 2,
} as const

/** Draws what one right stamp earns. `rng` gives floats in [0, 1) (seeded under ?seed). */
export function rollReward(era: EraId, tier: Tier, rng: () => number): Drop {
  const boost = tier === 3 ? ODDS.hardBoost : 1
  const w = { coin: ODDS.coin, sweet: ODDS.sweet, fine: ODDS.fine * boost, jackpot: ODDS.jackpot * boost }
  let r = rng() * (w.coin + w.sweet + w.fine + w.jackpot)
  if ((r -= w.coin) < 0) return { item: slotOf(era, 'coin').id, qty: 1, jackpot: false }
  if ((r -= w.sweet) < 0) return { item: slotOf(era, 'sweet').id, qty: 1, jackpot: false }
  if ((r -= w.fine) < 0) return { item: slotOf(era, 'fine').id, qty: 1, jackpot: false }
  const k = ODDS.jackpotKinds
  let j = rng() * (k.rare + k.rupees + k.sweets)
  if ((j -= k.rare) < 0) return { item: slotOf(era, 'rare').id, qty: 1, jackpot: true }
  if ((j -= k.rupees) < 0) return { item: slotOf(era, 'fine').id, qty: ODDS.handful, jackpot: true }
  return { item: slotOf(era, 'sweet').id, qty: ODDS.heap, jackpot: true }
}

/**
 * Surviving the chapter: its keepsake, always, on top of the last day's draw; surviving on Hard adds
 * the rare treasure too.
 */
export function survivalDrops(era: EraId, d: Difficulty): Drop[] {
  const out: Drop[] = [{ item: slotOf(era, 'keepsake').id, qty: 1, jackpot: false }]
  if (d === 'hard') out.push({ item: slotOf(era, 'rare').id, qty: 1, jackpot: true })
  return out
}

// ------------------------------------------------------------------ counts

/** Item id to count, for one era (or one run). */
export type Counts = Record<string, number>
/** Every era's counts, as kept under the `rewards` key. */
export type Collection = Partial<Record<EraId, Counts>>

const KEY = 'rewards'

/** Only known items with whole positive counts survive a read (old or hand-edited storage). */
export function cleanCollection(raw: unknown): Collection {
  const out: Collection = {}
  if (!raw || typeof raw !== 'object') return out
  for (const [era, counts] of Object.entries(raw as Record<string, unknown>)) {
    if (!counts || typeof counts !== 'object') continue
    const c: Counts = {}
    for (const [id, v] of Object.entries(counts as Record<string, unknown>)) {
      const it = BY_ID.get(id)
      if (!it || it.era !== era || typeof v !== 'number' || !Number.isFinite(v) || v < 1) continue
      c[id] = Math.min(99_999, Math.floor(v))
    }
    if (Object.keys(c).length) out[era as EraId] = c
  }
  return out
}

export function loadCollection(): Collection {
  return cleanCollection(store.get<unknown>(KEY, {}))
}

/** Adds drops to counts (a new object; the old is untouched). */
export function addDrops(counts: Counts, drops: readonly Drop[]): Counts {
  const out = { ...counts }
  for (const d of drops) out[d.item] = (out[d.item] ?? 0) + d.qty
  return out
}

/** Adds drops to the era's kept counts and saves them; returns the era's new counts. */
export function saveDrops(era: EraId, drops: readonly Drop[]): Counts {
  const all = loadCollection()
  const next = addDrops(all[era] ?? {}, drops)
  store.set(KEY, { ...all, [era]: next })
  return next
}

// ------------------------------------------------------------------ the lines

const WORDS: Record<Lang, Record<number, string>> = {
  en: { 2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five', 6: 'Six' },
  hi: { 2: 'दो', 3: 'तीन', 4: 'चार', 5: 'पाँच', 6: 'छह' },
}

/** "a gold mohur", "4 silver rupees" (Hindi alike); counts in figures. */
export function countPhrase(id: string, qty: number, lang: Lang): string {
  const it = BY_ID.get(id)
  if (!it) return ''
  return qty === 1 ? it.name[lang].one : `${qty} ${it.name[lang].many}`
}

/** A jackpot's short line, said as it lands: "A gold mohur!", "Five silver rupees!" (Hindi alike). */
export function jackpotLine(d: Drop, lang: Lang): string {
  const it = BY_ID.get(d.item)
  if (!it) return ''
  if (d.qty === 1) {
    const one = it.name[lang].one
    return `${one.charAt(0).toUpperCase()}${one.slice(1)}!`
  }
  return `${WORDS[lang][d.qty] ?? d.qty} ${it.name[lang].many}!`
}

const RANK: Record<Rarity, number> = { keepsake: 0, rare: 1, fine: 2, common: 3 }

/**
 * What a run earned, in one line, the finest first: "You earned 4 silver rupees and a gold mohur";
 * "आपकी कमाई: 4 चाँदी के रुपये और एक सोने की मोहर". Empty when it earned nothing.
 */
export function earnedLine(counts: Counts, lang: Lang): string {
  const parts = Object.entries(counts)
    .filter(([id, q]) => q > 0 && BY_ID.has(id))
    .sort(([a], [b]) => RANK[BY_ID.get(a)!.rarity] - RANK[BY_ID.get(b)!.rarity] || (BY_ID.get(a)!.slot === 'coin' ? 1 : 0) - (BY_ID.get(b)!.slot === 'coin' ? 1 : 0))
    .map(([id, q]) => countPhrase(id, q, lang))
  if (!parts.length) return ''
  const and = lang === 'hi' ? ' और ' : ' and '
  const list = parts.length === 1 ? parts[0]! : `${parts.slice(0, -1).join(', ')}${and}${parts[parts.length - 1]}`
  return lang === 'hi' ? `आपकी कमाई: ${list}` : `You earned ${list}`
}

// ------------------------------------------------------------------ the toast's words

/** The two Hindi items that are feminine (मोहर, मुहर): the verb "मिला" agrees with them. */
const FEMININE = new Set(['mohur-1857', 'seal-1857'])

/**
 * What the reward toast says (no full stops: it is display copy). A plain drop reads "You got a
 * silver rupee" / "आपको चाँदी का एक रुपया मिला"; a jackpot adds its cry as a kicker over the item's
 * own line: "Jackpot!" and "A gold mohur" / "किस्मत चमकी!" and "एक सोने की मोहर".
 */
export function toastLine(d: Drop, lang: Lang): { kicker: string | null; text: string } {
  const it = BY_ID.get(d.item)
  if (!it) return { kicker: null, text: '' }
  const what = countPhrase(d.item, d.qty, lang)
  if (d.jackpot) {
    const line = d.qty === 1 ? what : `${WORDS[lang][d.qty] ?? d.qty} ${it.name[lang].many}`
    return { kicker: lang === 'hi' ? 'किस्मत चमकी!' : 'Jackpot!', text: `${line.charAt(0).toUpperCase()}${line.slice(1)}` }
  }
  if (lang === 'hi') {
    const f = FEMININE.has(d.item)
    const verb = d.qty === 1 ? (f ? 'मिली' : 'मिला') : f ? 'मिलीं' : 'मिले'
    return { kicker: null, text: `आपको ${what} ${verb}` }
  }
  return { kicker: null, text: `You got ${what}` }
}
