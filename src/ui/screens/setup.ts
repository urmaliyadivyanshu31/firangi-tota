import type { Era } from '../../content/types'
import { DAYS, TIMER_S, type Difficulty } from '../../game/config'
import { getLang } from '../../i18n/lang'
import { t, tf } from '../../i18n/strings'
import { backButton, card } from '../card'
import { h, mount } from '../h'
import { MODE_KEY } from './home'

export interface SetupHandlers {
  start(d: Difficulty): void
  back(): void
}

/** The chapter, one question, and three shift tiles: days, mode, seconds. A tap starts. */
export function renderSetup(root: HTMLElement, p: { era: Era }, on: SetupHandlers): void {
  const lang = getLang()
  const { era } = p

  const modes = (['easy', 'medium', 'hard'] as Difficulty[]).map((d) =>
    h('button', { class: `mode mode--${d}`, type: 'button', 'data-mode': d, onclick: () => on.start(d) },
      h('span', { class: 'mode__days' }, String(DAYS[d])),
      h('span', { class: 'mode__unit' }, tf('modeDays', lang, { n: DAYS[d] }).replace(String(DAYS[d]), '').trim()),
      h('span', { class: 'mode__name' }, t(MODE_KEY[d], lang)),
      h('span', { class: 'mode__secs' }, tf('modeSeconds', lang, { s: TIMER_S[d] }))))

  const body = [
    h('header', { class: 'setup__era' },
      h('p', { class: 'setup__place' }, era.place[lang]),
      h('h1', { class: 'setup__title' }, era.title[lang])),
    h('h2', { class: 'setup__q' }, t('setupQuestion', lang)),
    h('div', { class: 'modes' }, modes),
  ]

  mount(root, h('div', { class: `screen screen--setup screen--card era-${era.id}`, lang },
    backButton(t('back', lang), () => on.back()),
    h('div', { class: 'stack' }, card('setup', body))))
}
