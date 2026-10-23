import type { Era } from '../../content/types'
import { getLang } from '../../i18n/lang'
import { t } from '../../i18n/strings'
import { card } from '../card'
import { announce, h, mount } from '../h'

/** Two short cards: who you are, then how the day works. `next()` fires after the second. */
export function renderIntro(root: HTMLElement, p: { era: Era }, on: { next(): void }): void {
  const lang = getLang()
  const { era } = p
  let page = 0

  function draw(): void {
    const head = [
      h('p', { class: 'intro__where' }, era.place[lang]),
      h('h1', { class: 'intro__title' }, era.title[lang]),
    ]
    const body = page === 0
      ? [
          ...head,
          h('p', { class: 'intro__you' }, h('span', { class: 'intro__label' }, `${t('introYou', lang)}: `), era.persona[lang]),
          h('p', { class: 'intro__text' }, era.intro[0][lang]),
        ]
      : [
          ...head,
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

    mount(root, h('div', { class: `screen screen--intro screen--card era-${era.id}`, lang },
      h('div', { class: 'stack' },
        card(`intro intro--${page + 1}`, body, [btn]))))
    announce(page === 0 ? era.intro[0][lang] : era.intro[1][lang])
  }
  draw()
}
