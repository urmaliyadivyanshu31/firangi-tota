import type { Era } from '../../content/types'
import { fillTemplate } from '../../game/dates'
import { getLang } from '../../i18n/lang'
import { t } from '../../i18n/strings'
import { announce, h, mount } from '../h'

/** Two short screens: who you are and where, then how the day works. `next()` fires after the second. */
export function renderIntro(root: HTMLElement, p: { era: Era }, on: { next(): void }): void {
  const lang = getLang()
  const { era } = p
  let page = 0

  const row = (label: string, value: string) => h('div', { class: 'dossier__row' }, h('dt', null, label), h('dd', null, value))

  function draw(): void {
    const body = page === 0
      ? [
          h('p', { class: 'intro__where' }, `${era.place[lang]} ${era.year}`),
          h('dl', { class: 'dossier' },
            row(t('introYou', lang), era.persona[lang]),
            row(t('introForger', lang), era.forger[lang]),
            row(t('introFirstDay', lang), fillTemplate('{weekday}, {date}', era.windowStart, lang))),
          h('p', { class: 'intro__text' }, era.intro[0][lang]),
        ]
      : [
          h('p', { class: 'intro__text' }, era.intro[1][lang]),
          h('p', { class: 'intro__how' }, t('introHow', lang)),
          h('p', { class: 'intro__stakes' }, t('introStakes', lang)),
        ]
    const btn = h('button', { class: 'btn btn--primary btn--block', type: 'button', 'data-action': 'next',
      onclick: () => {
        if (page === 0) {
          page = 1
          draw()
        } else on.next()
      } }, t(page === 0 ? 'next' : 'begin', lang))

    mount(root, h('div', { class: `screen screen--intro era-${era.id}`, lang },
      h('div', { class: 'scroll intro__scroll' },
        h('article', { class: `intro__paper mat-${era.channel}`, lang }, h('h1', { class: 'intro__title' }, era.title[lang]), body)),
      h('footer', { class: 'intro__foot' }, btn)))
    announce(page === 0 ? era.intro[0][lang] : era.intro[1][lang])
  }
  draw()
}
