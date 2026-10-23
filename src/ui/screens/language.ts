import type { Lang } from '../../content/types'
import { strings } from '../../i18n/strings'
import { card } from '../card'
import { h, mount } from '../h'
import { lettering } from '../ornament'

/** First visit: the title over the room, and two big buttons, each labelled in its own language. */
export function renderLanguage(root: HTMLElement, on: { pick(l: Lang): void }): void {
  const btn = (l: Lang) =>
    h('button', { class: 'btn btn--chit btn--lang', type: 'button', lang: l, 'data-lang': l, onclick: () => on.pick(l) }, strings[l].langSelf)
  mount(root, h('div', { class: 'screen screen--lang screen--card' },
    h('div', { class: 'stack' },
      h('h1', { class: 'home__title' }, lettering(), h('span', { class: 'sr-only' }, `${strings.hi.appName} · ${strings.en.appName}`)),
      card('lang', [
        h('p', { class: 'lang__ask', lang: 'hi' }, 'भाषा चुनें'),
        h('p', { class: 'lang__ask', lang: 'en' }, 'Choose a language'),
        h('div', { class: 'lang__buttons', role: 'group', 'aria-label': 'भाषा / Language' }, btn('hi'), btn('en')),
      ]))))
}
