import type { Lang } from '../content/types'
import { strings, t } from '../i18n/strings'
import { h, svg } from './h'

// The period controls every screen shares, top right: a brass gramophone horn for game sound and
// a brass plaque with both languages, the current one inked in. Same labels and targets everywhere.

let uid = 0

/** A brass gramophone horn; muted, a cork in the bell and an ink stroke across it. */
function horn(on: boolean): SVGSVGElement {
  const id = `hn${++uid}`
  return svg(`<svg class="horn${on ? '' : ' is-off'}" viewBox="0 0 34 30" aria-hidden="true" focusable="false">
  <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f8e19a"/><stop offset=".45" stop-color="#cf9d41"/><stop offset="1" stop-color="#7a5317"/></linearGradient></defs>
  <g transform="rotate(-24 17 15)">
    <path d="M4 13.6h6.5v3.8H4z" fill="#7a5317"/>
    <path d="M10.4 13.4C16 12.6 21 9.4 25.6 3.6V27.4C21 21.6 16 18.4 10.4 17.6Z" fill="url(#${id})" stroke="#5a3a0e" stroke-width=".8"/>
    <ellipse cx="25.6" cy="15.5" rx="3.1" ry="11.9" fill="${on ? '#3b2608' : '#8a6a3a'}" stroke="#e9c870" stroke-width="1"/>
    ${on ? '' : '<ellipse cx="25.6" cy="15.5" rx="2" ry="7.5" fill="#c9a979"/>'}
  </g>
  <circle cx="5.2" cy="22.6" r="2.4" fill="#5a3a0e"/>
  ${on ? '<path d="M30 8.5c1.6 1.4 1.6 4.6 0 6M31.8 6.2c2.6 2.6 2.6 8 0 10.6" fill="none" stroke="#e9c870" stroke-width="1.2" stroke-linecap="round" opacity=".8"/>' : '<path d="M3 3l28 24" stroke="#f3e7cc" stroke-width="3.4" stroke-linecap="round"/><path d="M3 3l28 24" stroke="#7a1c0e" stroke-width="1.8" stroke-linecap="round"/>'}
</svg>`)
}

export function soundToggle(on: boolean, lang: Lang, onToggle: () => void): HTMLButtonElement {
  return h('button', { class: 'plaque plaque--horn', type: 'button', 'data-action': 'sound', 'aria-pressed': String(on),
    'aria-label': t('sound', lang), title: t(on ? 'soundOn' : 'soundOff', lang), onclick: () => onToggle() }, horn(on))
}

/** Swap the horn in place (no re-render). */
export function setSoundToggle(btn: HTMLButtonElement, on: boolean, lang: Lang): void {
  btn.setAttribute('aria-pressed', String(on))
  btn.title = t(on ? 'soundOn' : 'soundOff', lang)
  btn.replaceChildren(horn(on))
}

/** "हिंदी | English" on one plaque; the current language is the inked, pressed segment. */
export function langSwitch(lang: Lang, onPick: (l: Lang) => void): HTMLElement {
  const opt = (l: Lang) =>
    h('button', { class: `langswitch__opt${l === lang ? ' is-on' : ''}`, type: 'button', lang: l, 'data-lang': l, 'aria-pressed': String(l === lang),
      onclick: () => { if (l !== lang) onPick(l) } }, strings[l].langSelf)
  return h('div', { class: 'plaque langswitch', role: 'group', 'data-action': 'lang', 'aria-label': `${t('langChange', lang)}: ${strings.hi.langSelf} / ${strings.en.langSelf}` },
    opt('hi'), h('span', { class: 'langswitch__bar', 'aria-hidden': 'true' }), opt('en'))
}

/** Sound and language together, as one cluster. */
export function controlCluster(p: { soundOn: boolean; lang: Lang }, on: { sound(): void; lang(l: Lang): void }): HTMLElement {
  return h('div', { class: 'controls' }, soundToggle(p.soundOn, p.lang, on.sound), langSwitch(p.lang, on.lang))
}
