import type { Era, Fact, Lang, Message } from '../content/types'

// Pencil marks in the case file: the facts that share words with the message's checks. The match
// uses only the checks, which genuine and forged messages both carry, so a mark never gives away
// the answer; it only says where to look.

const STOP: Record<Lang, Set<string>> = {
  en: new Set(('the and of to a an in on at for from with by his her its their our your is are was were be been has have had ' +
    'this that these those it as or not no all any will shall we you he she they them us me my mr sir who whom which what ' +
    'there here than then into onto upon over under about after before also but so if out up down off one two only very').split(' ')),
  hi: new Set(('और में के की का को से है हैं पर ने एक यह वह था थे थी लिए साथ भी तो ही जो कि नहीं अपने अपनी अपना आप हम वे ' +
    'उनके उनकी उनका इस उस तक बाद गया गई गए कर दिया दी हो रहा रही रहे या').split(' ')),
}

const WORD = /[\p{L}\p{M}\p{N}]+/gu

function words(text: string, lang: Lang): string[] {
  const out: string[] = []
  for (const m of text.toLowerCase().replace(/[’']s\b/g, '').match(WORD) ?? []) {
    const min = /^\p{N}+$/u.test(m) ? 2 : lang === 'hi' ? 2 : 3
    if (m.length >= min && !STOP[lang].has(m)) out.push(m)
  }
  return out
}

/** Same word, or one a short ending of the other ("regiment" / "regiments"). */
function same(a: string, b: string): boolean {
  if (a === b) return true
  if (a.length < 4 || b.length < 4) return false
  const [s, l] = a.length < b.length ? [a, b] : [b, a]
  return l.startsWith(s) && l.length - s.length <= 3
}

/** Ids of the facts (at most `max`, in case-file order) that relate to the checks. */
export function relatedFacts(checks: string[], facts: Fact[], lang: Lang, max = 3): string[] {
  const wanted = [...new Set(checks.flatMap((c) => words(c, lang)))]
  if (!wanted.length || !facts.length) return []
  const factWords = facts.map((f) => new Set(words(`${f.label[lang]} ${f.value[lang]}`, lang)))
  // A word found in most of the case file says nothing about where to look.
  const common = (w: string) => facts.length >= 4 && factWords.filter((s) => [...s].some((x) => same(w, x))).length > facts.length / 2
  const useful = wanted.filter((w) => !common(w))
  const scored = facts
    .map((f, i) => ({ id: f.id, i, score: useful.filter((w) => [...factWords[i]!].some((x) => same(w, x))).length }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .slice(0, max)
  return scored.sort((a, b) => a.i - b.i).map((s) => s.id)
}

/**
 * The checks the case file's pencil lines are worked out from: the message's own, plus its pair
 * twin's. Both halves of a pair then always mark the same lines, so a content edit to one half's
 * checks can never make the lines tell them apart.
 */
export function pairChecks(msg: Message, era: Pick<Era, 'messages'>, lang: Lang, own: string[] = msg.checks?.[lang] ?? []): string[] {
  if (msg.pair === undefined) return own
  const twins = era.messages.filter((o) => o !== msg && o.pair === msg.pair)
  return [...new Set([...own, ...twins.flatMap((o) => o.checks?.[lang] ?? [])])]
}
