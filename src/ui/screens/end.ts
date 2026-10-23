import type { Epilogue, Era, Receipt } from '../../content/types'
import { dayDate } from '../../game/dates'
import { seedFrom } from '../../game/rng'
import type { ChapterState } from '../../game/state'
import { getLang } from '../../i18n/lang'
import { t } from '../../i18n/strings'
import { announce, h, mount } from '../h'
import { longDate } from '../message'
import { formatSource, messageSources, sourceList } from '../reveal'

export interface EndProps {
  era: Era
  state: ChapterState
  outcome: 'survived' | 'caught'
  receipts: Receipt[]
  epilogue: Epilogue
}

export interface EndHandlers {
  again(): void
  home(): void
  share(): void
}

const MAX_SURVIVED_LINES = 2
const MAX_RECEIPTS = 2

/**
 * The end of a chapter, as a telegram: what happened in one line, the tell, one consequence, and the
 * era's own rubber stamp across the form. Receipts and sources wait behind a tap.
 */
export function renderEnd(root: HTMLElement, p: EndProps, on: EndHandlers): void {
  const lang = getLang()
  const { era, state, outcome } = p
  const caught = outcome === 'caught'
  const last = state.queue[Math.min(state.day, state.queue.length) - 1]
  const ending = era.endings?.[outcome]
  const stampText = ending?.stamp[lang] ?? t(caught ? 'caughtStamp' : 'survivedStamp', lang)
  const heading = ending?.title[lang] ?? t(caught ? 'caughtTitle' : 'survivedTitle', lang)

  // What happened, said plainly from the verdict itself (no reversed logic).
  const verdict = !caught || !last ? null
    : state.lastVerdict === 'timeout' ? t('tooSlow', lang)
    : last.real ? t('verdictRejected', lang)
    : t('verdictPassed', lang)
  const tell = caught && last ? (last.real ? last.why?.text[lang] : last.tells?.[0]?.explain[lang]) : undefined
  const after = caught ? p.epilogue.caught.slice(0, 1) : p.epilogue.survived.slice(0, MAX_SURVIVED_LINES)

  const refs = [...(caught && last ? messageSources(last, era) : []), ...p.epilogue.sources]
  const seen = new Set<string>()
  const sources = refs.filter((r) => {
    const k = `${r.id}|${r.loc ?? ''}`
    return seen.has(k) ? false : (seen.add(k), true)
  })

  const clippings = p.receipts.slice(0, MAX_RECEIPTS).map((r, i) =>
    h('article', { class: 'receipt', 'data-receipt': r.id, style: `--i:${i}` },
      h('blockquote', { class: 'receipt__quote' }, h('p', null, r.quote[lang])),
      h('p', { class: 'receipt__who' }, r.who[lang]),
      h('p', { class: 'receipt__joke' }, r.joke[lang]),
      r.theirSide ? h('p', { class: 'receipt__side' }, h('span', { class: 'receipt__label' }, `${t('theirSide', lang)}: `), r.theirSide[lang]) : null,
      h('p', { class: 'receipt__source' }, formatSource(r.source, era))))

  const day = Math.max(1, Math.min(state.day, state.days))
  const wire = h('article', { class: `wire wire--${outcome}`, lang },
    h('header', { class: 'wire__head' },
      h('span', { class: 'wire__dept' }, 'POSTS AND TELEGRAPHS'),
      h('span', { class: 'wire__title' }, t('sheetTelegramHead', lang)),
      h('span', { class: 'wire__no' }, `No. ${1000 + (seedFrom(`${era.id}|${day}|${outcome}`) % 9000)}`),
      h('span', { class: 'wire__date' }, longDate(dayDate(era, day), lang))),
    h('h1', { class: 'wire__heading' }, heading),
    verdict ? h('p', { class: 'wire__verdict' }, verdict) : null,
    tell ? h('p', { class: 'wire__tell' }, tell) : null,
    after.map((l) => h('p', { class: 'wire__after' }, l[lang])),
    h('div', { class: 'wire__folds' },
      sources.length ? h('details', { class: 'fold' }, h('summary', { class: 'fold__head' }, t('source', lang)), sourceList(sources, era)) : null,
      clippings.length ? h('details', { class: 'fold fold--receipts' }, h('summary', { class: 'fold__head' }, t('receipts', lang)), h('div', { class: 'receipts' }, clippings)) : null),
    h('div', { class: `end-stamp end-stamp--${ending ? era.channel : 'plain'} end-stamp--${outcome}`, 'aria-hidden': 'true' },
      era.channel === 'note' && ending ? h('span', { class: 'end-stamp__top' }, 'C.I.D. LAHORE') : null,
      era.channel === 'telegram' && ending ? h('span', { class: 'end-stamp__top' }, 'TELEGRAPH OFFICE') : null,
      h('span', { class: 'end-stamp__text' }, stampText)),
    h('p', { class: 'sr-only' }, stampText))

  const actions = h('footer', { class: 'end__actions' },
    h('button', { class: 'btn btn--primary btn--block', type: 'button', 'data-action': 'share', onclick: () => on.share() }, t('share', lang)),
    h('div', { class: 'row2' },
      h('button', { class: 'btn btn--chit', type: 'button', 'data-action': 'again', onclick: () => on.again() }, t('playAgain', lang)),
      h('button', { class: 'btn btn--chit', type: 'button', 'data-action': 'home', onclick: () => on.home() }, t('home', lang))))

  mount(root, h('div', { class: `screen screen--end screen--card is-${outcome} era-${era.id}`, lang },
    h('div', { class: 'stack stack--end' }, h('div', { class: 'wire-wrap' }, wire), actions)))
  announce(`${stampText}. ${heading}`)
}
