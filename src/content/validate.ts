import type { Era, L10n, Lang, SourceRef } from './types'

const LANGS: Lang[] = ['en', 'hi']

// Task 3 replaces this stub with the real fillTemplate.
const fillTemplateStub = (text: string): string => text.replace(/\{[^}]*\}/g, '')

const isDay = (n: unknown): boolean => typeof n === 'number' && Number.isInteger(n) && n >= 1 && n <= 14

const isIsoDate = (s: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false
  const d = new Date(`${s}T00:00:00Z`)
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s
}

export function validateEra(era: Era): string[] {
  const problems: string[] = []
  const add = (id: string, msg: string) => problems.push(id ? `${id}: ${msg}` : msg)

  const l10n = (id: string, field: string, v: L10n | undefined) => {
    for (const lang of LANGS) {
      if (typeof v?.[lang] !== 'string' || v[lang].trim() === '') add(id, `${field} missing ${lang}`)
    }
  }

  const sourceIds = new Set(era.sources.map((s) => s.id))
  const factIds = new Set(era.facts.map((f) => f.id))

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
      refs(id, `tells[${i}]`, t.sources, false)
    })

    if (m.checks) {
      for (const lang of LANGS) {
        const filled = fillTemplateStub(m.text[lang] ?? '')
        for (const c of m.checks[lang]) {
          if (c === '' || !filled.includes(c)) add(id, `check not found in ${lang} text: "${c}"`)
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

  era.epilogue.survived.forEach((p, i) => l10n('epilogue', `survived[${i}]`, p))
  era.epilogue.caught.forEach((p, i) => l10n('epilogue', `caught[${i}]`, p))
  refs('epilogue', 'epilogue', era.epilogue.sources, true)

  return problems
}
