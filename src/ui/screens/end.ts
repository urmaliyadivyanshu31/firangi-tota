import type { Epilogue, Era, Receipt } from '../../content/types'
import type { ChapterState } from '../../game/state'
import { getLang } from '../../i18n/lang'
import { t } from '../../i18n/strings'
import { announce, h, mount } from '../h'
import { formatSource, proofEl, sourceList } from '../reveal'

export interface EndProps {
  era: Era
  state: ChapterState
  outcome: 'survived' | 'caught'
  receipts: Receipt[]
  /** The era's epilogue; the screen shows the lines for the outcome plus its sources. */
  epilogue: Epilogue
  /** Share text to preview (the daily grid). The Share button shows either way. */
  share?: string
}

export interface EndHandlers {
  again(): void
  home(): void
  share(): void
  credits(): void
}

export function renderEnd(root: HTMLElement, p: EndProps, on: EndHandlers): void {
  const lang = getLang()
  const { era, state, outcome } = p
  const survived = outcome === 'survived'
  const last = state.queue[Math.min(state.day, state.queue.length) - 1]
  const lines = survived ? p.epilogue.survived : p.epilogue.caught

  const title = t(survived ? 'survivedTitle' : 'caughtTitle', lang)
  const head = h('header', { class: 'end__head' },
    h('h1', { class: `end__stamp end__stamp--${outcome}` }, h('span', { class: 'end__label' }, h('span', { class: 'end__ink' }, title))),
    h('p', { class: 'end__where' }, `${era.place[lang]} ${era.year}`))

  const epilogue = h('section', { class: 'end__card end__epilogue mat-' + era.channel, lang },
    h('h2', null, t(survived ? 'nextHappened' : 'caughtHappened', lang)),
    lines.map((l) => h('p', null, l[lang])),
    p.epilogue.sources.length ? h('div', { class: 'proof__sources' }, h('h3', null, t('sources', lang)), sourceList(p.epilogue.sources, era)) : null)

  const lastEl = last
    ? h('section', { class: 'end__card last' }, h('h2', null, t('lastMessage', lang)), proofEl(last, era, lang))
    : null

  const receipts = p.receipts.length
    ? h('section', { class: 'receipts' },
        h('h2', { class: 'receipts__title' }, t('onRecord', lang)),
        p.receipts.map((r) =>
          h('article', { class: 'receipt', 'data-receipt': r.id },
            h('blockquote', { class: 'receipt__quote' }, h('p', null, r.quote[lang])),
            h('p', { class: 'receipt__who' }, r.who[lang]),
            h('p', { class: 'receipt__joke' }, r.joke[lang]),
            r.theirSide ? h('p', { class: 'receipt__side' }, h('span', { class: 'receipt__label' }, `${t('theirSide', lang)}: `), r.theirSide[lang]) : null,
            h('p', { class: 'receipt__source' }, formatSource(r.source, era)))))
    : null

  const share = p.share ? h('section', { class: 'share' }, h('pre', { class: 'share__text' }, p.share)) : null

  const actions = h('footer', { class: 'end__actions' },
    h('button', { class: 'btn btn--primary btn--block', type: 'button', 'data-action': 'share', onclick: () => on.share() }, t('share', lang)),
    h('div', { class: 'end__row' },
      h('button', { class: 'btn btn--chit', type: 'button', 'data-action': 'again', onclick: () => on.again() }, t('playAgain', lang)),
      h('button', { class: 'btn btn--chit', type: 'button', 'data-action': 'home', onclick: () => on.home() }, t('home', lang))))

  const credits = h('p', { class: 'end__credits' },
    h('button', { class: 'link', type: 'button', 'data-action': 'credits', onclick: () => on.credits() }, t('credits', lang)))

  mount(root, h('div', { class: `screen screen--end era-${era.id}`, lang },
    h('div', { class: 'scroll end__scroll' }, head, epilogue, lastEl, receipts, share, credits),
    actions))
  announce(title)
}
