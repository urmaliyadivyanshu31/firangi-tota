import type { Era, Fact, L10n, Lang, Message, MinMode, Rule, SourceRef } from './types'
import { addDays, fillTemplate } from '../game/dates'
import { earliestDay, inMode } from '../game/run'
import { DAYS, type Difficulty } from '../game/config'
import { plainStory, storyParts, strayBrackets } from './story'

const LANGS: Lang[] = ['en', 'hi']

/** Word limits for every player-facing field (the numbers are below, and in docs/content-style.md, "Length"). Flip per era in tests as cuts merge. */
export const ENFORCE_WORD_LIMITS = true

/** Surface patterns must not reveal genuine vs forged (ellipsis share, message length). */
export const ENFORCE_SURFACE_TELLS = true

/** Pencil marks must not reveal genuine vs forged (count per pair, era-wide mean and 2+ share). */
export const ENFORCE_PENCIL_TELLS = true

/** Every check of every message must be verifiable from that mode's case file, its rules or the calendar (owner 10-24). */
export const ENFORCE_COVERAGE = true

/** Every day of the 14-day window: a message may be shown on any of them. */
const WINDOW_DAYS = Array.from({ length: 14 }, (_, i) => i + 1)

const HI_FACTOR = 1.5
const ABBREVIATIONS = new Set(['no', 'mr', 'mrs', 'ms', 'dr', 'st', 'sri', 'shri', 'smt', 'vs', 'etc', 'col', 'gen', 'lt', 'capt', 'sir', 'jr', 'sr', 'mt', 'rs', 'e.g', 'i.e', 'viz', 'approx'])

const words = (text: string): string[] => text.split(/\s+/).filter(Boolean)

/** Number of sentences, splitting on . ? ! and । but not after abbreviations (No., Mr.), initials (M.K.) or "..." */
export function countSentences(text: string): number {
  const tokens = words(text)
  let n = 0
  let open = false
  for (const tok of tokens) {
    open = true
    const m = /^(.*?)([.?!।]+)["'”’)\]]*$/.exec(tok)
    if (!m) continue
    const [, stem = '', marks = ''] = m
    if (marks === '.' || marks.endsWith('.')) {
      if (/\.{2,}$/.test(marks)) continue
      if (marks === '.' && (ABBREVIATIONS.has(stem.toLowerCase()) || /^([A-Za-z]\.)*[A-Za-z]$/.test(stem))) continue
      // Devanagari initials: बी.सी., एच.एस.आर.ए.
      if (marks === '.' && /^([ऀ-ॿ]{1,4}\.)+[ऀ-ॿ]{1,4}$/.test(stem)) continue
    }
    n++
    open = false
  }
  return n + (open ? 1 : 0)
}

export function wordLimits(era: Era): string[] {
  const out: string[] = []
  const cap = (id: string, field: string, v: L10n | undefined, max: number) => {
    for (const lang of LANGS) {
      const raw = v?.[lang]
      if (typeof raw !== 'string') continue
      const limit = lang === 'hi' ? Math.ceil(HI_FACTOR * max) : max
      const n = words(fillTemplate(raw, era.windowStart, lang)).length
      if (n > limit) out.push(`${id}: ${field} too long (${n} words, max ${limit}) [${lang}]`)
    }
  }
  cap(era.id, 'persona', era.persona, 12)
  cap(era.id, 'forger', era.forger, 14)
  era.intro.forEach((p, i) => cap(era.id, `intro[${i}]`, p, 30))
  for (const f of era.facts) {
    cap(f.id, 'label', f.label, 3)
    cap(f.id, 'value', f.value, 6)
    if (f.story) cap(f.id, 'story', { en: plainStory(f.story.en ?? ''), hi: plainStory(f.story.hi ?? '') }, STORY_WORDS)
  }
  for (const r of era.rules) cap(r.id, 'text', r.text, 14)
  for (const m of era.messages) {
    cap(m.id, 'text', m.text, 30)
    cap(m.id, 'from', m.from, 5)
    cap(m.id, 'to', m.to, 5)
    m.tells?.forEach((t, i) => cap(m.id, `tells[${i}].explain`, t.explain, 14))
    if (m.why) cap(m.id, 'why.text', m.why.text, 14)
    for (const lang of LANGS) {
      const raw = m.text?.[lang]
      if (typeof raw !== 'string') continue
      const n = countSentences(fillTemplate(raw, era.windowStart, lang))
      if (n > 3) out.push(`${m.id}: text too many sentences (${n}, max 3) [${lang}]`)
    }
  }
  for (const r of era.receipts) {
    cap(r.id, 'quote', r.quote, 25)
    cap(r.id, 'joke', r.joke, 10)
    if (r.theirSide) cap(r.id, 'theirSide', r.theirSide, 16)
    cap(r.id, 'who', r.who, 6)
  }
  const paras = (field: 'survived' | 'caught', max: number) => {
    const list = era.epilogue[field]
    if (list.length > max) out.push(`epilogue: ${field} too many paragraphs (${list.length}, max ${max})`)
    list.forEach((p, i) => cap('epilogue', `${field}[${i}]`, p, 28))
  }
  for (const k of ['caught', 'survived'] as const) {
    cap(era.id, `endings.${k}.stamp`, era.endings?.[k]?.stamp, 3)
    cap(era.id, `endings.${k}.title`, era.endings?.[k]?.title, 9)
  }
  paras('survived', 3)
  paras('caught', 2)
  return out
}

const isDay = (n: unknown): boolean => typeof n === 'number' && Number.isInteger(n) && n >= 1 && n <= 14

const isIsoDate = (s: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false
  const d = new Date(`${s}T00:00:00Z`)
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s
}

export function surfaceTells(era: Era): string[] {
  const out: string[] = []
  for (const lang of LANGS) {
    const texts = (real: boolean) =>
      era.messages.filter((m) => m.real === real).map((m) => fillTemplate(m.text?.[lang] ?? '', era.windowStart, lang))
    const genuine = texts(true)
    const forged = texts(false)
    if (genuine.length === 0 || forged.length === 0) continue

    const share = (list: string[]) => list.filter((t) => t.includes('…') || t.includes('...')).length / list.length
    const g = share(genuine)
    const f = share(forged)
    if (g > 0 && f < 0.6 * g) {
      out.push(`surface: ellipsis gives away genuine (${Math.round(g * 100)}% genuine vs ${Math.round(f * 100)}% forged) [${lang}]`)
    }

    const mean = (list: string[]) => list.reduce((n, t) => n + words(t).length, 0) / list.length
    const gm = mean(genuine)
    const fm = mean(forged)
    if (Math.abs(fm - gm) > 0.25 * gm) {
      const r = (n: number) => Math.round(n * 10) / 10
      out.push(`surface: length gives away (${r(gm)} vs ${r(fm)} words) [${lang}]`)
    }
  }
  return out
}

/**
 * Pencil marks (checks) must not reveal genuine vs forged: every message of a pair carries as many
 * marks as its genuine half, and across the era the mean count and the share with 2+ marks match.
 */
export function pencilTells(era: Era): string[] {
  const out: string[] = []
  const pct = (n: number) => `${Math.round(n * 100)}%`
  const r = (n: number) => Math.round(n * 100) / 100
  for (const lang of LANGS) {
    const count = (m: Message) => m.checks?.[lang]?.length ?? 0

    const pairs = new Map<string, Message[]>()
    for (const m of era.messages) if (m.pair !== undefined) pairs.set(m.pair, [...(pairs.get(m.pair) ?? []), m])
    for (const list of pairs.values()) {
      const ref = list.find((m) => m.real) ?? list[0]!
      for (const m of list) {
        if (m !== ref && count(m) !== count(ref)) out.push(`${m.id}: checks count differs from its pair (${count(m)} vs ${count(ref)}) [${lang}]`)
      }
    }

    const genuine = era.messages.filter((m) => m.real).map(count)
    const forged = era.messages.filter((m) => !m.real).map(count)
    if (genuine.length === 0 || forged.length === 0) continue
    const mean = (list: number[]) => list.reduce((a, b) => a + b, 0) / list.length
    const gm = mean(genuine)
    const fm = mean(forged)
    if (Math.abs(fm - gm) > 0.15 * gm) out.push(`surface: pencil count gives away (${r(gm)} vs ${r(fm)}) [${lang}]`)
    const share = (list: number[]) => list.filter((n) => n >= 2).length / list.length
    const gs = share(genuine)
    const fs = share(forged)
    if (Math.abs(gs - fs) > 0.15) out.push(`surface: pencil count gives away (${pct(gs)} vs ${pct(fs)} with 2+ marks) [${lang}]`)
  }
  return out
}

/** A case-file story sentence: at most this many words in English (Hindi 1.5 times). */
export const STORY_WORDS = 22

const CALENDAR = /^(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|January|February|March|April|May|June|July|August|September|October|November|December)$/
/** Capitalised abbreviations a story may spell out ("Rs 30" as "30 rupees", "No. 69" as "number 69"). */
const NOT_NAMES = new Set(['Rs', 'No'])
/** Words that may open a story in capitals without being a name. */
const OPENERS = new Set(['You', 'Your', 'Our', 'We', 'The', 'A', 'An', 'Any', 'In', 'On', 'At', 'From', 'For', 'By', 'To', 'With', 'Since',
  'After', 'Before', 'Later', 'Ahead', 'Now', 'Here', 'There', 'This', 'That', 'These', 'Those', 'It', 'Its', 'He', 'She', 'They',
  'His', 'Her', 'Their', 'Each', 'Every', 'Only', 'Count', 'When', 'Then', 'And', 'But', 'So'])

const digitRuns = (text: string): string[] => text.match(/\d+/g) ?? []

/** The words of a text for name checks: hyphenated words in parts, no trailing dots or possessive 's. */
function nameParts(text: string): string[] {
  return (text.match(/[\p{L}\p{N}][\p{L}\p{M}\p{N}'’.]*/gu) ?? [])
    .map((w) => w.replace(/['’]s$/, '').replace(/['’.]+$/, ''))
    .filter(Boolean)
}

const isCapital = (w: string): boolean => /^\p{Lu}/u.test(w)

/**
 * The case file's story sentences. Each is one sentence with at least one [[highlight]]. Every
 * number of the value sits in a highlight (so Hard's blanks hide all of it), and every number in the
 * story comes from the fact's label or value. In English every capitalised word of the value sits in
 * a highlight, and the story names no one the fact and the era's intro do not already name.
 */
export function storyChecks(era: Era, f: Fact): string[] {
  const out: string[] = []
  for (const lang of LANGS) {
    const story = f.story?.[lang]
    if (typeof story !== 'string' || story.trim() === '') continue // reported as missing
    const at = `${f.id}: story`
    if (strayBrackets(story)) out.push(`${at} has a stray, empty or nested bracket [${lang}]`)
    const parts = storyParts(story)
    const marked = parts.filter((p) => p.hl).map((p) => p.text)
    if (marked.length === 0) out.push(`${at} needs at least one [[highlight]] [${lang}]`)
    const plain = plainStory(story)
    const n = countSentences(plain)
    if (n > 1) out.push(`${at} must be one sentence (has ${n}) [${lang}]`)
    if (/[०-९]/.test(story)) out.push(`${at} uses Devanagari digits; write 0-9 [${lang}]`)

    const value = digitRuns(f.value[lang] ?? '')
    const label = new Set(digitRuns(f.label[lang] ?? ''))
    const inMarks = new Set(marked.flatMap(digitRuns))
    for (const d of value) if (!inMarks.has(d)) out.push(`${at}: "${d}" from the value must sit in a [[highlight]] [${lang}]`)
    for (const d of digitRuns(plain)) if (!value.includes(d) && !label.has(d)) out.push(`${at}: "${d}" is not in the fact's label or value [${lang}]`)
    for (const p of parts) {
      if (p.hl) continue
      for (const d of digitRuns(p.text)) if (!label.has(d)) out.push(`${at}: "${d}" must sit in a [[highlight]] [${lang}]`)
    }
  }

  const en = f.story?.en
  if (typeof en !== 'string' || en.trim() === '') return out
  const plain = plainStory(en)
  const said = new Set(nameParts(plain))
  const marks = storyParts(en).filter((p) => p.hl).flatMap((p) => nameParts(p.text))
  const valueWords = nameParts(f.value.en ?? '')
  valueWords.forEach((w, i) => {
    if (!isCapital(w) || NOT_NAMES.has(w)) return
    // a value that opens "Two: ..." or "Reaches Delhi" is only in sentence case: the story says "two", "reaches"
    if (i === 0 && !CALENDAR.test(w) && (OPENERS.has(w) || (!said.has(w) && said.has(w.toLowerCase())))) return
    const hit = marks.some((m) => m === w || (w.length >= 3 && m.startsWith(w))) // "Aug" in "August"
    if (!hit) out.push(`${f.id}: story must highlight "${w}" from the value [en]`)
  })
  const known = new Set(nameParts([f.label.en, f.value.en, era.title.en, era.place.en, era.persona.en, era.forger.en, ...era.intro.map((p) => p.en)].join(' ')))
  const abbrev = valueWords.filter((w) => isCapital(w) && w.length >= 3)
  nameParts(plain).forEach((w, i) => {
    if (!isCapital(w) || known.has(w) || (i === 0 && OPENERS.has(w))) return
    if (abbrev.some((a) => w.startsWith(a))) return // "August" for the value's "Aug"
    out.push(`${f.id}: story names "${w}", which the fact and the era's intro do not [en]`)
  })
  return out
}

// ── Coverage: a player can only judge a message by its case file and rules (owner 10-24) ──

const MODES: Difficulty[] = ['easy', 'medium', 'hard']
const WEEKDAY_WORDS = /\b(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)\b|रविवार|सोमवार|मंगलवार|बुधवार|गुरुवार|शुक्रवार|शनिवार/
const MONTH_WORDS = /\b(January|February|March|April|May|June|July|August|September|October|November|December)\b|जनवरी|फ़रवरी|फरवरी|मार्च|अप्रैल|मई|जून|जुलाई|अगस्त|सितंबर|अक्टूबर|नवंबर|दिसंबर/
/** English words that carry no checkable detail, capitalised or not. */
const EN_STOP = new Set(['a', 'an', 'the', 'and', 'or', 'but', 'of', 'to', 'in', 'on', 'at', 'by', 'for', 'from', 'with', 'into', 'onto', 'upon', 'as', 'is',
  'are', 'was', 'were', 'be', 'been', 'being', 'has', 'have', 'had', 'do', 'does', 'did', 'it', 'its', 'he', 'she', 'they', 'them', 'his', 'her',
  'their', 'him', 'we', 'our', 'us', 'you', 'your', 'i', 'my', 'me', 'this', 'that', 'these', 'those', 'there', 'here', 'all', 'any', 'each', 'every',
  'no', 'not', 'nor', 'so', 'than', 'then', 'too', 'very', 'will', 'shall', 'would', 'should', 'can', 'could', 'may', 'might', 'must', 'who', 'whom',
  'which', 'what', 'when', 'where', 'why', 'how', 'if', 'out', 'up', 'down', 'over', 'under', 'about', 'after', 'before', 'also', 'only', 'just',
  'now', 'one', 'own', 'same', 'such', 'some', 'more', 'most', 'other', 'again', 'once', 'like', 'per', 'via', 'mr', 'mrs', 'sir', 'shri', 'sri',
  'th', 'st', 'nd', 'rd', 'am', 'pm', 'let', 'yet', 'still', 'even', 'well', 'quite', 'said', 'says', 'say'])
/** Hindi words that carry no checkable detail. */
const HI_STOP = new Set(['का', 'की', 'के', 'को', 'में', 'से', 'ने', 'पर', 'तक', 'और', 'या', 'भी', 'ही', 'तो', 'है', 'हैं', 'था', 'थी', 'थे', 'हो', 'होगा',
  'होगी', 'होंगे', 'हुआ', 'हुई', 'हुए', 'कर', 'करके', 'किया', 'किए', 'गया', 'गई', 'गए', 'यह', 'वह', 'ये', 'वे', 'इस', 'उस', 'इन', 'उन', 'एक',
  'नहीं', 'न', 'कोई', 'कुछ', 'सब', 'अब', 'जो', 'जब', 'तब', 'लिए', 'साथ', 'बाद', 'पहले', 'हम', 'हमारे', 'हमारी', 'हमारा', 'आप', 'आपके', 'आपकी', 'मैं',
  'मेरे', 'उनके', 'उनकी', 'उनका', 'उसके', 'उसकी', 'उसका', 'अपने', 'अपनी', 'अपना', 'श्री', 'जी', 'वाले', 'वाली', 'वाला', 'रहा', 'रही', 'रहे', 'दिया', 'दी',
  'दिए', 'लिया', 'ली', 'सकता', 'सकते', 'सकती', 'बहुत', 'यहां', 'वहां', 'क्या', 'कि'])

/** Hindi spellings vary by nukta and nasal sign; English by case. */
const norm = (s: string): string => s.toLowerCase().replace(/़/g, '').replace(/ँ/g, 'ं').replace(/[’‘]/g, "'")

const wordsOf = (s: string): string[] => (norm(s).match(/[\p{L}\p{M}]+/gu) ?? [])

/** The key tokens of a check: every digit run, then the capitalised names (EN) or the content words. */
export function checkTokens(check: string, lang: Lang): { digits: string[]; words: string[] } {
  const digits = digitRuns(check)
  const raw = check.match(/[\p{L}\p{M}]+/gu) ?? []
  if (lang === 'hi') return { digits, words: raw.map(norm).filter((w) => w.length >= 2 && !HI_STOP.has(w)) }
  const content = raw.filter((w) => !EN_STOP.has(w.toLowerCase()) && w.length >= 3)
  const names = content.filter((w) => isCapital(w))
  return { digits, words: (names.length > 0 || digits.length > 0 ? names : content).map(norm) }
}

/** A word matches its inflections: Hindu/Hindus, अंग्रेज़/अंग्रेज़ों, English/Englishmen. */
function wordMatch(tok: string, w: string): boolean {
  if (tok === w) return true
  const [a, b] = tok.length <= w.length ? [tok, w] : [w, tok]
  return a.length >= 3 && b.startsWith(a) && b.length - a.length <= 4
}

/** Every key token of the check sits in this one text. */
export function covers(text: string, check: string, lang: Lang): boolean {
  const { digits, words } = checkTokens(check, lang)
  if (digits.length === 0 && words.length === 0) return false
  const have = new Set(digitRuns(text))
  const ws = wordsOf(text)
  return digits.every((d) => have.has(d)) && words.every((t) => ws.some((w) => wordMatch(t, w)))
}

/**
 * A Hindi mark read in the line its English mark matched: every number of it is there, and so is
 * at least one of its words (Hindi has no capitals to pick the names out by).
 */
function coversHi(text: string, check: string): boolean {
  const { digits, words } = checkTokens(check, 'hi')
  const have = new Set(digitRuns(text))
  const ws = wordsOf(text)
  return digits.every((d) => have.has(d)) && (words.length === 0 || words.some((t) => ws.some((w) => wordMatch(t, w))))
}

/** What a fact's case-file line lets the player read: its story (and its short value and label). */
const factText = (f: Fact, lang: Lang): string => `${plainStory(f.story?.[lang] ?? '')} ${f.value?.[lang] ?? ''} ${f.label?.[lang] ?? ''}`

/** A rule that settles weekdays: it names a weekday and a date. */
const isCalendarRule = (r: Rule): boolean => WEEKDAY_WORDS.test(r.text?.en ?? '') && /\d/.test(r.text?.en ?? '')

/** A check the calendar settles: it names a weekday, or a date in a message that names a weekday. */
const dateLike = (check: string, text: string): boolean =>
  WEEKDAY_WORDS.test(check) || (MONTH_WORDS.test(check) && /\d/.test(check) && WEEKDAY_WORDS.test(text))

/** The modes a message can come in: its minMode, and a first day that falls within that mode's run. */
export function modesOf(era: Era, m: Message): Difficulty[] {
  const first = m.onDay ?? earliestDay(era, m)
  return MODES.filter((d) => inMode(m, d) && first <= DAYS[d])
}

/**
 * Every pencil mark (check) of every message is verifiable in every mode the message can come in:
 * its key tokens sit in one case-file line of that mode or in one rule arrived by the message's first
 * day, or it is a weekday or date the era's weekday rule settles, or `verify` names the fact, rule or
 * calendar that settles it. A forgery's slip (a mark its genuine twin does not carry) is settled by a
 * tell whose fact or rule is visible; every forgery needs such a tell.
 */
export function coverage(era: Era): string[] {
  const out: string[] = []
  const rank = (x?: MinMode) => (x === 'hard' ? 2 : x === 'medium' ? 1 : 0)
  for (const m of era.messages) {
    const first = m.onDay ?? earliestDay(era, m)
    const twin = m.pair !== undefined && !m.real ? era.messages.find((o) => o.pair === m.pair && o.real) : undefined
    for (const mode of modesOf(era, m)) {
      const facts = era.facts.filter((f) => inMode(f, mode))
      const rules = era.rules.filter((r) => r.arrivesOnDay <= first)
      const calendar = rules.some(isCalendarRule)
      const caught = (m.tells ?? []).some((t) =>
        (t.factId !== undefined && facts.some((f) => f.id === t.factId)) || (t.ruleId !== undefined && rules.some((r) => r.id === t.ruleId)))
      if (!m.real && !caught) out.push(`${m.id}: no tell whose fact or rule is in the ${mode} case file or rules`)
      for (const lang of LANGS) {
        const text = fillTemplate(m.text?.[lang] ?? '', era.windowStart, lang)
        const list = m.checks?.[lang] ?? []
        const enList = m.checks?.en ?? []
        list.forEach((c, i) => {
          // a Hindi mark is the translation of the English mark at its place: it is read in the same line
          const en = lang === 'hi' && enList.length === list.length ? enList[i] : undefined
          const ref = m.verify?.[c] ?? (en !== undefined ? m.verify?.[en] : undefined)
          if (ref !== undefined) {
            const [kind, id] = ref === 'calendar' ? ['calendar', ''] : [ref.slice(0, 4), ref.slice(5)]
            const fact = kind === 'fact' ? era.facts.find((f) => f.id === id) : undefined
            const rule = kind === 'rule' ? era.rules.find((r) => r.id === id) : undefined
            if (kind === 'fact' && !fact) out.push(`${m.id}: verify "${c}" names unknown fact "${id}"`)
            else if (fact && rank(fact.minMode) > rank(mode)) out.push(`${m.id}: verify "${c}" needs fact "${id}", which is not in the ${mode} case file [${lang}]`)
            else if (kind === 'rule' && !rule) out.push(`${m.id}: verify "${c}" names unknown rule "${id}"`)
            else if (rule && rule.arrivesOnDay > first) out.push(`${m.id}: verify "${c}" needs rule "${id}", which arrives on day ${rule.arrivesOnDay}, after day ${first} [${lang}]`)
            else if (kind === 'calendar' && !calendar) out.push(`${m.id}: verify "${c}" needs a weekday rule by day ${first} [${lang}]`)
            return
          }
          const texts = [...facts.map((f) => [factText(f, 'en'), factText(f, lang)]), ...rules.map((r) => [r.text?.en ?? '', r.text?.[lang] ?? ''])]
          if (texts.some(([enText, own]) => (en !== undefined ? covers(enText!, en, 'en') && coversHi(own!, c) : covers(own!, c, lang)))) return
          if (calendar && dateLike(c, text)) return
          // a forgery's slip: a mark its genuine twin does not say, caught by a visible tell
          const twinText = twin ? fillTemplate(twin.text?.[lang] ?? '', era.windowStart, lang) : ''
          if (!m.real && caught && !twinText.includes(c)) return
          out.push(`${m.id}: check "${c}" is not in the ${mode} case file or rules [${lang}]`)
        })
      }
    }
  }
  return out
}

export function validateEra(era: Era, opts: { wordLimits?: boolean; surfaceTells?: boolean; pencilTells?: boolean; coverage?: boolean } = {}): string[] {
  const problems: string[] = []
  const add = (id: string, msg: string) => problems.push(id ? `${id}: ${msg}` : msg)

  const l10n = (id: string, field: string, v: L10n | undefined) => {
    for (const lang of LANGS) {
      if (typeof v?.[lang] !== 'string' || v[lang].trim() === '') add(id, `${field} missing ${lang}`)
    }
  }

  const sourceIds = new Set(era.sources.map((s) => s.id))
  const factIds = new Set(era.facts.map((f) => f.id))
  const ruleIds = new Set(era.rules.map((r) => r.id))

  // a pair is gated as a unit: a Hard-only forgery must never reveal its genuine twin as the "easy" kind
  const pairModes = new Map<string, string>()
  for (const m of era.messages) {
    if (m.pair === undefined) continue
    const k = m.minMode ?? 'easy'
    const seen = pairModes.get(m.pair)
    if (seen === undefined) pairModes.set(m.pair, k)
    else if (seen !== k) add(m.id, `pair "${m.pair}" mixes minMode ${seen} and ${k}`)
  }

  const refs = (id: string, field: string, list: SourceRef[] | undefined, required: boolean) => {
    if (required && (!list || list.length === 0)) add(id, `${field} needs at least one source`)
    for (const r of list ?? []) {
      if (!sourceIds.has(r.id)) add(id, `${field} has unknown source "${r.id}"`)
    }
  }

  const dupes = (kind: string, ids: string[]) => {
    const seen = new Set<string>()
    for (const i of ids) {
      if (seen.has(i)) add(i, `duplicate id in ${kind}`)
      seen.add(i)
    }
  }

  // Era level
  if (!isIsoDate(era.windowStart)) add(era.id, `windowStart "${era.windowStart}" is not a valid ISO date`)
  l10n(era.id, 'title', era.title)
  l10n(era.id, 'place', era.place)
  l10n(era.id, 'persona', era.persona)
  l10n(era.id, 'forger', era.forger)
  era.intro.forEach((p, i) => l10n(era.id, `intro[${i}]`, p))

  dupes('sources', era.sources.map((s) => s.id))
  dupes('facts', era.facts.map((f) => f.id))
  dupes('rules', era.rules.map((r) => r.id))
  dupes('messages', era.messages.map((m) => m.id))
  dupes('receipts', era.receipts.map((r) => r.id))

  era.facts.forEach((f, i) => {
    l10n(f.id, 'label', f.label)
    l10n(f.id, 'value', f.value)
    l10n(f.id, 'story', f.story)
    refs(f.id, 'fact', f.sources, true)
    problems.push(...storyChecks(era, f))
    if (![1, 2, 3].includes(f.para)) add(f.id, `para ${String(f.para)} must be 1, 2 or 3`)
    const prev = era.facts[i - 1]
    if (prev && f.para < prev.para) add(f.id, `para ${f.para} after para ${prev.para}: list the facts in story order`)
  })
  const paras = new Set(era.facts.map((f) => f.para)).size
  if (era.facts.length >= 2 && (paras < 2 || paras > 3)) add(era.id, `the case file needs 2 or 3 paragraphs (has ${paras})`)

  for (const r of era.rules) {
    l10n(r.id, 'text', r.text)
    if (!isDay(r.arrivesOnDay)) add(r.id, `arrivesOnDay ${r.arrivesOnDay} must be an integer from 1 to 14`)
  }

  for (const m of era.messages) {
    const id = m.id
    l10n(id, 'from', m.from)
    l10n(id, 'to', m.to)
    l10n(id, 'text', m.text)
    if (m.onDay !== undefined && !isDay(m.onDay)) add(id, `onDay ${m.onDay} must be an integer from 1 to 14`)

    if (m.onDay !== undefined && isDay(m.onDay) && m.onDay < earliestDay(era, m)) add(id, 'onDay before its rule arrives')

    if (m.real) {
      if (m.tells && m.tells.length > 0) add(id, 'genuine message must not have tells')
      if (!m.why) add(id, 'genuine message needs why')
    } else {
      if (m.why) add(id, 'forged message must not have why')
      if (m.document) add(id, 'forged message must not have document')
      if (!m.tells || m.tells.length === 0) add(id, 'forged message needs at least one tell')
    }

    if (m.why) {
      l10n(id, 'why.text', m.why.text)
      refs(id, 'why', m.why.sources, true)
    }
    if (m.document) refs(id, 'document', m.document.sources, true)

    m.tells?.forEach((t, i) => {
      l10n(id, `tells[${i}].explain`, t.explain)
      if (t.factId !== undefined && !factIds.has(t.factId)) add(id, `tells[${i}] has unknown fact "${t.factId}"`)
      // the fact that catches this slip must be in the case file wherever the message can appear
      const fact = t.factId !== undefined ? era.facts.find((f) => f.id === t.factId) : undefined
      const rank = (x?: 'medium' | 'hard') => (x === 'hard' ? 2 : x === 'medium' ? 1 : 0)
      if (fact && rank(fact.minMode) > rank(m.minMode)) add(id, `tells[${i}] needs fact "${fact.id}" (case file from ${fact.minMode}), so the message needs minMode "${fact.minMode}" or higher`)
      if (t.ruleId !== undefined && !ruleIds.has(t.ruleId)) add(id, `unknown rule ${t.ruleId}`)
      refs(id, `tells[${i}]`, t.sources, false)
    })

    if (m.checks) {
      for (const lang of LANGS) {
        const raw = m.text[lang] ?? ''
        const filled = fillTemplate(raw, era.windowStart, lang)
        for (const c of m.checks[lang]) {
          if (c === '' || !filled.includes(c)) {
            add(id, `check not found in ${lang} text: "${c}"`)
            continue
          }
          // The paper fills {date}/{weekday} with the day it is shown, so a mark must not lean on them.
          if (!raw.includes('{')) continue
          const day = WINDOW_DAYS.find((d) => !fillTemplate(raw, addDays(era.windowStart, d - 1), lang).includes(c))
          if (day !== undefined) add(id, `check "${c}" depends on the date (not found on day ${day}) [${lang}]`)
        }
      }
    }
  }

  for (const r of era.receipts) {
    l10n(r.id, 'who', r.who)
    l10n(r.id, 'quote', r.quote)
    l10n(r.id, 'joke', r.joke)
    if (r.theirSide) l10n(r.id, 'theirSide', r.theirSide)
    refs(r.id, 'receipt', [r.source], true)
  }

  if (!era.endings) add('endings', 'missing')
  else {
    for (const k of ['caught', 'survived'] as const) {
      l10n(era.id, `endings.${k}.stamp`, era.endings[k]?.stamp)
      l10n(era.id, `endings.${k}.title`, era.endings[k]?.title)
    }
  }
  era.epilogue.survived.forEach((p, i) => l10n('epilogue', `survived[${i}]`, p))
  era.epilogue.caught.forEach((p, i) => l10n('epilogue', `caught[${i}]`, p))
  refs('epilogue', 'epilogue', era.epilogue.sources, true)

  if (opts.wordLimits ?? ENFORCE_WORD_LIMITS) problems.push(...wordLimits(era))

  if (opts.surfaceTells ?? ENFORCE_SURFACE_TELLS) problems.push(...surfaceTells(era))

  if (opts.pencilTells ?? ENFORCE_PENCIL_TELLS) problems.push(...pencilTells(era))

  if (opts.coverage ?? ENFORCE_COVERAGE) problems.push(...coverage(era))

  return problems
}
