import type { Era, L10n, Lang, Message, SourceRef } from './types'
import { addDays, fillTemplate } from '../game/dates'
import { earliestDay } from '../game/run'

const LANGS: Lang[] = ['en', 'hi']

/** Word limits for every player-facing field (the numbers are below, and in docs/content-style.md, "Length"). Flip per era in tests as cuts merge. */
export const ENFORCE_WORD_LIMITS = true

/** Surface patterns must not reveal genuine vs forged (ellipsis share, message length). */
export const ENFORCE_SURFACE_TELLS = true

/** Pencil marks must not reveal genuine vs forged (count per pair, era-wide mean and 2+ share). */
export const ENFORCE_PENCIL_TELLS = true

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

export function validateEra(era: Era, opts: { wordLimits?: boolean; surfaceTells?: boolean; pencilTells?: boolean } = {}): string[] {
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

  for (const f of era.facts) {
    l10n(f.id, 'label', f.label)
    l10n(f.id, 'value', f.value)
    refs(f.id, 'fact', f.sources, true)
  }

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

  return problems
}
