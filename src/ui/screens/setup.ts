import type { Era } from '../../content/types'
import { DAYS, PENCIL_MEDIUM_DAYS, TIMER_S, type Difficulty } from '../../game/config'
import { getLang } from '../../i18n/lang'
import { t, tf, type Strings } from '../../i18n/strings'
import { h, mount } from '../h'
import { backIcon } from '../icons'
import { MODE_KEY } from './home'

export interface SetupHandlers {
  start(d: Difficulty): void
  back(): void
}

const NOTE: Record<Difficulty, keyof Strings> = { easy: 'modeEasyNote', medium: 'modeMediumNote', hard: 'modeHardNote' }

export function renderSetup(root: HTMLElement, p: { era: Era }, on: SetupHandlers): void {
  const lang = getLang()
  const { era } = p

  const modes = (['easy', 'medium', 'hard'] as Difficulty[]).map((d) =>
    h('button', { class: `mode mode--${d}`, type: 'button', 'data-mode': d, onclick: () => on.start(d) },
      h('span', { class: 'mode__name' }, t(MODE_KEY[d], lang)),
      h('span', { class: 'mode__days' }, tf('modeDays', lang, { n: DAYS[d] })),
      h('span', { class: 'mode__secs' }, tf('modeSeconds', lang, { s: TIMER_S[d] })),
      h('span', { class: 'mode__note' }, tf(NOTE[d], lang, { n: PENCIL_MEDIUM_DAYS }))))

  mount(root, h('div', { class: `screen screen--setup era-${era.id}`, lang },
    h('div', { class: 'scroll setup__scroll' },
      h('button', { class: 'back', type: 'button', 'data-action': 'back', onclick: () => on.back() }, backIcon(), h('span', null, t('back', lang))),
      h('header', { class: `setup__era card mat-${era.channel}` },
        h('span', { class: 'card__year' }, era.year),
        h('span', { class: 'card__place' }, era.place[lang]),
        h('span', { class: 'card__title' }, era.title[lang])),
      h('h1', { class: 'setup__q' }, t('setupQuestion', lang)),
      h('div', { class: 'modes' }, modes))))
}
