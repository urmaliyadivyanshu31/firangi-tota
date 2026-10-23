import type { Era, Lang, Message, SourceRef } from '../content/types'
import { t, type Strings } from '../i18n/strings'
import { h } from './h'

// What a message really was, why, and the proof. Shared by the day reveal and the end screen.

/** "Author, Title (Year), loc" */
export function formatSource(ref: SourceRef, era: Era): string {
  const s = era.sources.find((x) => x.id === ref.id)
  const loc = ref.loc ? `, ${ref.loc}` : ''
  return s ? `${s.author}, ${s.title} (${s.year})${loc}` : `${ref.id}${loc}`
}

export function sourceItem(ref: SourceRef, era: Era): HTMLElement {
  const label = formatSource(ref, era)
  const url = era.sources.find((x) => x.id === ref.id)?.url
  const safe = url && /^https?:\/\//i.test(url) ? url : undefined
  return h('li', { class: 'source' }, safe ? h('a', { href: safe, target: '_blank', rel: 'noopener noreferrer' }, label) : label)
}

export function sourceList(refs: SourceRef[], era: Era): HTMLElement {
  return h('ul', { class: 'sources' }, refs.map((r) => sourceItem(r, era)))
}

/** Every source behind the verdict: the document, the why, or each tell (or its fact). No repeats. */
export function messageSources(msg: Message, era: Era): SourceRef[] {
  const refs: SourceRef[] = []
  if (msg.document) refs.push(...msg.document.sources)
  if (msg.real && msg.why) refs.push(...msg.why.sources)
  if (!msg.real) {
    for (const tell of msg.tells ?? []) {
      if (tell.sources?.length) refs.push(...tell.sources)
      else if (tell.factId) refs.push(...(era.facts.find((f) => f.id === tell.factId)?.sources ?? []))
    }
  }
  const seen = new Set<string>()
  return refs.filter((r) => {
    const key = `${r.id}|${r.loc ?? ''}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function kindKey(msg: Message): keyof Strings {
  if (msg.document) return 'kindReal'
  return msg.real ? 'kindWritten' : 'kindForged'
}

/** The why (genuine) or each tell's explanation (forged). */
export function explainEl(msg: Message, lang: Lang): HTMLElement {
  if (msg.real) return h('div', { class: 'explain' }, msg.why ? h('p', null, msg.why.text[lang]) : null)
  return h('div', { class: 'explain' }, h('ul', { class: 'tells' }, (msg.tells ?? []).map((tell) => h('li', null, tell.explain[lang]))))
}

/** Kind line, explanation and sources, in that order. */
export function proofEl(msg: Message, era: Era, lang: Lang): HTMLElement[] {
  const refs = messageSources(msg, era)
  return [
    h('p', { class: `kind kind--${msg.document ? 'document' : msg.real ? 'written' : 'forged'}` }, t(kindKey(msg), lang)),
    explainEl(msg, lang),
    refs.length ? h('div', { class: 'proof__sources' }, h('h3', null, t('sources', lang)), sourceList(refs, era)) : null,
  ].filter((x): x is HTMLElement => x !== null)
}
