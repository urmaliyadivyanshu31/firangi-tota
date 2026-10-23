import type { Lang } from '../../content/types'
import { strings } from '../../i18n/strings'
import { h, mount } from '../h'
import { parrotMark } from '../icons'

/** First visit: two big buttons. Each is labelled in its own language. */
export function renderLanguage(root: HTMLElement, on: { pick(l: Lang): void }): void {
  const btn = (l: Lang) =>
    h('button', { class: 'btn btn--chit btn--lang', type: 'button', lang: l, 'data-lang': l, onclick: () => on.pick(l) }, strings[l].langSelf)
  mount(root, h('div', { class: 'screen screen--lang' },
    parrotMark(),
    h('div', { class: 'lang__buttons', role: 'group', 'aria-label': 'भाषा / Language' }, btn('hi'), btn('en'))))
}
