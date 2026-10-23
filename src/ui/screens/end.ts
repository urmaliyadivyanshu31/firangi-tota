import type { Epilogue, Era, Receipt } from '../../content/types'
import type { ChapterState } from '../../game/state'
import { getLang } from '../../i18n/lang'
import { t } from '../../i18n/strings'
import { card } from '../card'
import { announce, h, mount } from '../h'
import { formatSource, sourcesFold } from '../reveal'

export interface EndProps {
  era: Era
  state: ChapterState
  outcome: 'survived' | 'caught'
  receipts: Receipt[]
  /** The era's epilogue; the card shows up to three lines for the outcome, the sources behind a tap. */
  epilogue: Epilogue
}

export interface EndHandlers {
  again(): void
  home(): void
  share(): void
}

const MAX_LINES = 3
const MAX_RECEIPTS = 2

/** The end of a chapter: the verdict stamp, what happened next, two clippings and the buttons. */
export function renderEnd(root: HTMLElement, p: EndProps, on: EndHandlers): void {
  const lang = getLang()
  const { era, outcome } = p
  const survived = outcome === 'survived'
  const lines = (survived ? p.epilogue.survived : p.epilogue.caught).slice(0, MAX_LINES)
  const title = t(survived ? 'survivedTitle' : 'caughtTitle', lang)

  const head = h('header', { class: 'end__head' },
    h('p', { class: 'end__where' }, `${era.place[lang]} · ${era.year}`),
    h('h1', { class: `end__stamp end__stamp--${outcome}` }, title))

  const epilogue = h('section', { class: 'end__epilogue' },
    h('h2', { class: 'end__label' }, t(survived ? 'nextHappened' : 'caughtHappened', lang)),
    lines.map((l) => h('p', null, l[lang])),
    sourcesFold(p.epilogue.sources, era, lang))

  const clippings = p.receipts.slice(0, MAX_RECEIPTS).map((r, i) =>
    h('article', { class: 'receipt', 'data-receipt': r.id, style: `--i:${i}` },
      h('blockquote', { class: 'receipt__quote' }, h('p', null, r.quote[lang])),
      h('p', { class: 'receipt__who' }, r.who[lang]),
      h('p', { class: 'receipt__joke' }, r.joke[lang]),
      h('details', { class: 'fold fold--small' },
        h('summary', { class: 'fold__head' }, t('source', lang)),
        r.theirSide ? h('p', { class: 'receipt__side' }, h('span', { class: 'receipt__label' }, `${t('theirSide', lang)}: `), r.theirSide[lang]) : null,
        h('p', { class: 'receipt__source' }, formatSource(r.source, era)))))

  const actions = [
    h('button', { class: 'btn btn--primary btn--block', type: 'button', 'data-action': 'share', onclick: () => on.share() }, t('share', lang)),
    h('div', { class: 'row2' },
      h('button', { class: 'btn btn--chit', type: 'button', 'data-action': 'again', onclick: () => on.again() }, t('playAgain', lang)),
      h('button', { class: 'btn btn--chit', type: 'button', 'data-action': 'home', onclick: () => on.home() }, t('home', lang))),
  ]

  mount(root, h('div', { class: `screen screen--end screen--card era-${era.id}`, lang },
    h('div', { class: 'stack' },
      card(`end end--${outcome}`, [head, epilogue, clippings.length ? h('div', { class: 'receipts' }, clippings) : null], actions))))
  announce(title)
}
