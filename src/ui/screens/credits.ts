import { getLang } from '../../i18n/lang'
import { t } from '../../i18n/strings'
import { h, mount } from '../h'
import { backIcon } from '../icons'

const INSPIRATION = 'https://github.com/atomiquest/Politburo-or-Parrot'

export function renderCredits(root: HTMLElement, on: { back(): void }): void {
  const lang = getLang()
  const [before = '', after = ''] = t('creditsInspired', lang).split('{title}')
  mount(root, h('div', { class: 'screen screen--credits', lang },
    h('div', { class: 'scroll credits__scroll' },
      h('button', { class: 'back', type: 'button', 'data-action': 'back', onclick: () => on.back() }, backIcon(), h('span', null, t('back', lang))),
      h('article', { class: 'credits__paper mat-radio' },
        h('h1', null, t('credits', lang)),
        h('p', { class: 'credits__inspired' }, before, h('a', { href: INSPIRATION, target: '_blank', rel: 'noopener noreferrer' }, 'Politburo or Parrot'), after),
        h('ul', { class: 'credits__list' },
          h('li', null, t('creditsCode', lang)),
          h('li', null, t('creditsText', lang)),
          h('li', null, t('creditsFonts', lang))),
        h('p', null, t('creditsAssets', lang))))))
}
