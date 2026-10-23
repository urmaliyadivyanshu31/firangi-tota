import type { Channel, Era, Lang, Message, SourceRef } from '../content/types'
import { t, type Strings } from '../i18n/strings'
import { h } from './h'
import type { RevealSpec, RevealStamp } from '../scene/index'

// What a message really was, why, and the proof. Shared by the day's result card and the end card.

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

/** "Written for the game…", "Forged by the Tota…" or "Real document": the honest note under the sources. */
export function kindLine(msg: Message, lang: Lang): string {
  return t(kindKey(msg), lang)
}

/** Each era stamps its back in its own way: a Mughal seal, a CID stamp, RAIDED, a telegraph office. */
const STAMP_STYLE: Record<Channel, RevealStamp['style']> = { petition: 'seal', note: 'police', radio: 'raided', telegram: 'telegraph' }

/** The verdict said plainly, from what happened: right, a forgery passed, a genuine one rejected, or too slow. */
export function verdictLine(msg: Message, verdict: 'asli' | 'tota' | 'timeout', lang: Lang): string {
  if (verdict === 'timeout') return t('tooSlow', lang)
  const right = (verdict === 'asli') === msg.real
  if (right) return `${t('right', lang)} · ${t(msg.real ? 'wasGenuine' : 'wasForged', lang)}`
  return t(msg.real ? 'verdictRejected' : 'verdictPassed', lang)
}

/** The one-line tell (forged) or why (genuine). */
export function tellText(msg: Message, lang: Lang): string {
  return (msg.real ? msg.why?.text[lang] : msg.tells?.[0]?.explain[lang]) ?? ''
}

/**
 * What the paper's back says after the stamp. On the chapter's last reveal (caught, or the last day
 * survived) it also carries the era's ending: its title, one line of what happened, and its stamp.
 */
export function buildReveal(p: {
  era: Era
  msg: Message
  verdict: 'asli' | 'tota' | 'timeout'
  lang: Lang
  /** The chapter ends with this reveal. */
  end?: 'caught' | 'survived'
}): RevealSpec {
  const { era, msg, verdict, lang, end } = p
  const right = verdict !== 'timeout' && (verdict === 'asli') === msg.real
  const note = tellText(msg, lang)
  const first = messageSources(msg, era)[0]
  const ending = end ? era.endings?.[end] : undefined
  const line = end ? (end === 'caught' ? era.epilogue.caught : era.epilogue.survived)[0]?.[lang] : undefined
  // the ending's title, closed like a sentence, then its one line
  const title = ending?.title[lang]
  const closed = title && !/[.!?।]$/.test(title) ? `${title}${lang === 'hi' ? '।' : '.'}` : title
  const consequence = end ? [closed, line].filter(Boolean).join(' ') : ''
  const style = STAMP_STYLE[era.channel]
  const stamp: RevealStamp = end
    ? { text: ending?.stamp[lang] ?? t(end === 'caught' ? 'caughtStamp' : 'survivedStamp', lang), tone: end, style }
    : { text: t(right ? 'right' : verdict === 'timeout' ? 'tooSlow' : 'wrong', lang), tone: right ? 'right' : 'wrong', style }
  return {
    outcome: right ? 'right' : verdict === 'timeout' ? 'timeout' : 'wrong',
    real: msg.real,
    documentMark: !!msg.document,
    highlight: (msg.checks?.[lang] ?? []).filter((c) => c.trim() !== ''),
    note,
    back: {
      verdictLine: verdictLine(msg, verdict, lang),
      tell: note,
      ...(consequence ? { consequence } : {}),
      stamp,
      source: first ? formatSource(first, era) : '',
    },
    lang,
  }
}
