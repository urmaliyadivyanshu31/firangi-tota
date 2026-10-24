// What a player posts when they share a run: the result with its place and year, the most
// interesting thing from the run (the forgery they caught, or the one that caught them), a dare,
// and the link. Written the way a person brags to a friend, in the language on screen. The share
// server reads the Hindi ordinals from here, so relative imports end in `.js`.
import type { EraId, L10n, Lang, Message } from '../content/types.js'
import type { ChapterState } from './state.js'
import { totalFor, type ShareResult } from './share-code.js'

/** Where the player sat, as the post says it ("I held out all 7 days in …"). */
const WHERE: Record<EraId, L10n> = {
  'delhi-1857': { en: "in Bahadur Shah Zafar's darbar, Delhi 1857", hi: 'दिल्ली 1857 में बहादुर शाह ज़फ़र के दरबार में' },
  'lahore-1929': { en: "as a secret post box for Bhagat Singh's comrades, Lahore 1929", hi: 'लाहौर 1929 में भगत सिंह के साथियों का पोस्ट बॉक्स बनकर' },
  'bombay-1942': { en: 'on the secret Congress Radio, Bombay 1942', hi: 'बंबई 1942 में ख़ुफ़िया कांग्रेस रेडियो पर' },
  'delhi-1947': { en: "at the Viceroy's House telegraph desk, Delhi 1947", hi: 'दिल्ली 1947 में वायसराय हाउस की तार मेज़ पर' },
}

/** "On the 4th day", in Hindi words (a chapter is at most 14 days). */
export const ORDINAL_HI = ['पहले', 'दूसरे', 'तीसरे', 'चौथे', 'पाँचवें', 'छठे', 'सातवें', 'आठवें', 'नौवें', 'दसवें', 'ग्यारहवें', 'बारहवें', 'तेरहवें', 'चौदहवें']

/**
 * How the run ended: every day held, a forgery stamped ASLI, a genuine message stamped TOTA, or the
 * agarbatti burnt out.
 */
export type How = 'survived' | 'missed' | 'rejected' | 'timeout'

/**
 * The one fact a post carries: always a forgery's tell ("the 38th was in Delhi, not the 37th"),
 * one the player caught or the one that fooled them. A genuine message's explanation reads like
 * filler in a post, so it is never used; without a tell the post gets a short line instead.
 */
export interface Fact { kind: 'catch' | 'missed'; text: string }

/** At most this many characters before the link. */
export const MAX_POST = 230

/** The best forgery caught: the hardest one (the highest tier), and of those the latest. */
function bestCatch(caught: Message[], lang: Lang): Fact | undefined {
  let best: Message | undefined
  for (const m of caught) if (!m.real && m.tells?.length && (!best || m.tier >= best.tier)) best = m
  const text = best?.tells?.[0]?.explain[lang]
  return text ? { kind: 'catch', text } : undefined
}

/** The tell of a forgery that got past the player. */
function missedTell(m: Message, lang: Lang): Fact | undefined {
  const text = m.real ? undefined : m.tells?.[0]?.explain[lang]
  return text ? { kind: 'missed', text } : undefined
}

/** A chapter's story, read from its state at the end: how it ended and the fact worth telling. */
export function chapterStory(s: ChapterState, outcome: 'survived' | 'caught', lang: Lang): { how: How; fact?: Fact } {
  if (outcome === 'survived') {
    const fact = bestCatch(s.queue.slice(0, s.days), lang)
    return fact ? { how: 'survived', fact } : { how: 'survived' }
  }
  // every day before this one was stamped right (one wrong stamp ends a chapter)
  const before = s.queue.slice(0, s.day - 1)
  const msg = s.queue[s.day - 1]
  if (s.lastVerdict === 'timeout' || !msg) {
    const fact = bestCatch(before, lang)
    return fact ? { how: 'timeout', fact } : { how: 'timeout' }
  }
  // a forgery passed: its tell is the story. A genuine one thrown out: brag about the best catch
  // before it, if there was one.
  const fact = msg.real ? bestCatch(before, lang) : missedTell(msg, lang)
  const how: How = msg.real ? 'rejected' : 'missed'
  return fact ? { how, fact } : { how }
}

/** The daily puzzle's fact: the best forgery caught, else the first forgery that got past. */
export function dailyFact(messages: Message[], results: boolean[], lang: Lang): Fact | undefined {
  const caught = messages.filter((m, i) => results[i] === true && !m.real)
  const missed = messages.find((m, i) => results[i] === false && !m.real)
  return bestCatch(caught, lang) ?? (missed ? missedTell(missed, lang) : undefined)
}

/** Words that may open a tell and read lower case after a colon ("My best catch: the 38th …"). */
const LOWER_START = new Set(['the', 'a', 'an', 'it', 'its', 'this', 'that', 'these', 'those', 'there', 'he', 'she', 'they', 'his', 'her', 'their', 'only', 'no', 'not', 'in', 'on', 'at', 'by', 'from', 'after', 'before', 'both', 'every', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'])

/** A tell as a clause: no full stop at the end, a lower-case opening word where English allows it. */
export function clause(text: string, lang: Lang): string {
  const t = text.trim().replace(/[.।]+$/u, '').trim()
  if (lang !== 'en') return t
  const first = /^([A-Za-z]+)\b/.exec(t)?.[1]
  return first && first[0] !== first[0]!.toLowerCase() && LOWER_START.has(first.toLowerCase()) ? t[0]!.toLowerCase() + t.slice(1) : t
}

const FACT_LEAD: Record<Fact['kind'], L10n> = {
  catch: { en: 'My best catch', hi: 'मेरी सबसे बढ़िया पकड़' },
  missed: { en: 'The slip I missed', hi: 'जो चूक मुझसे छूट गई' },
}

/**
 * When the run has no tell to tell, a short line true to how it ended. The Hindi never genders the
 * player: the Tota, the clock or the messages do the verbs.
 */
const NO_TELL: Record<How, L10n> = {
  // every forgery that came was caught: only a run with none at all lands here
  survived: { en: 'Every true word got through', hi: 'हर सच्ची बात आगे पहुँची' },
  missed: { en: "The Tota's forgery fooled me", hi: 'तोते की जालसाज़ी ने मुझे छल लिया' },
  rejected: { en: 'The Tota made me doubt the truth', hi: 'तोते ने मुझे सच पर ही शक करा दिया' },
  timeout: { en: 'The clock sided with the Tota', hi: 'इस बार घड़ी तोते के साथ थी' },
}

function headline(how: How, era: EraId, days: number, lang: Lang): string {
  const where = WHERE[era][lang]
  const day = days + 1 // the day the chapter ended on
  if (lang === 'hi') {
    const ord = ORDINAL_HI[day - 1] ?? `${day}वें`
    switch (how) {
      case 'survived': return `${where} मैंने पूरे ${days} दिन निकाल दिए`
      case 'missed': return `${where} ${ord} दिन फ़िरंगी तोते ने मुझे चकमा दे दिया`
      case 'rejected': return `${where} ${ord} दिन मैंने असली संदेश को जाली मान लिया`
      case 'timeout': return `${where} ${ord} दिन मेरी अगरबत्ती पूरी जल गई`
    }
  }
  switch (how) {
    case 'survived': return `I held out all ${days} days ${where}`
    case 'missed': return `The Firangi Tota fooled me on day ${day} ${where}`
    case 'rejected': return `I called a real message fake on day ${day} ${where}`
    case 'timeout': return `My agarbatti burnt out on day ${day} ${where}`
  }
}

function factLine(fact: Fact | undefined, lang: Lang): string | null {
  return fact ? `${FACT_LEAD[fact.kind][lang]}: ${clause(fact.text, lang)}` : null
}

/** Joins the lines, leaving out the dare and then the fact if the post would run too long. */
function fit(lines: string[], fact: string | null, dare: string): string {
  const tries = fact ? [[...lines, fact, dare], [...lines, fact], [...lines, dare]] : [[...lines, dare]]
  const fits = tries.map((ls) => ls.join('\n')).find((s) => s.length <= MAX_POST)
  return fits ?? lines.join('\n')
}

/** A chapter's post, without the link. */
export function chapterPost(p: { result: ShareResult; how: How; fact?: Fact }): string {
  const { result: r } = p
  const dare = r.outcome === 'survived'
    ? (r.lang === 'hi' ? 'अब आपकी बारी, तोता पकड़ पाएँगे?' : 'Your turn, can you spot the Tota?')
    : (r.lang === 'hi' ? 'आप कितने दिन टिकेंगे?' : 'Can you last longer?')
  return fit([`🦜 ${headline(p.how, r.era, r.days, r.lang)}`], factLine(p.fact, r.lang) ?? NO_TELL[p.how][r.lang], dare)
}

/** The daily puzzle's post, without the link: the score, the ticks and crosses, a fact and a dare. */
export function dailyPost(p: { result: ShareResult; number: number; eraTitle: string; results: boolean[]; fact?: Fact }): string {
  const { result: r } = p
  const total = totalFor('daily')
  const name = r.lang === 'hi' ? 'आज का तार' : 'Aaj ka Taar'
  const dare = r.days >= total
    ? (r.lang === 'hi' ? `आज आप भी ${total}/${total} ला पाएँगे?` : 'Can you match it today?')
    : (r.lang === 'hi' ? `आज आप ${r.days}/${total} से आगे जा पाएँगे?` : `Can you beat ${r.days}/${total} today?`)
  return fit([
    `🦜 ${name} #${p.number} · ${p.eraTitle} · ${r.days}/${total}`,
    p.results.map((x) => (x ? '✅' : '❌')).join(''),
  ], factLine(p.fact, r.lang), dare)
}

/** WhatsApp's own share page: the post and the link as one message. */
export function whatsappHref(text: string, url: string): string {
  return `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`
}

/** X's post composer, with the link passed separately so X draws its card. */
export function xHref(text: string, url: string): string {
  return `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
}
