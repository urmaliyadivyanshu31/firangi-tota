import type { Lang } from '../content/types'
import { strings, t } from '../i18n/strings'
import { h, svg } from './h'

// The period controls every screen shares, top right: one brass plaque with a gramophone horn for
// game sound and a black shellac record for Music or the room's own sound, and a brass plaque with
// both languages, the current one inked in. Same labels and targets everywhere.

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
  return h('button', { class: 'plaque__btn plaque__btn--horn', type: 'button', 'data-action': 'sound', 'aria-pressed': String(on),
    'aria-label': t('sound', lang), title: t(on ? 'soundOn' : 'soundOff', lang), onclick: () => onToggle() }, horn(on))
}

/** Swap the horn in place (no re-render). */
export function setSoundToggle(btn: HTMLButtonElement, on: boolean, lang: Lang): void {
  btn.setAttribute('aria-pressed', String(on))
  btn.title = t(on ? 'soundOn' : 'soundOff', lang)
  btn.replaceChildren(horn(on))
}

/**
 * A 78 rpm shellac record with a red label and a little brass tonearm. In Music mode the arm rests
 * on the record, and the record turns slowly while a song is actually playing; in Room mode the
 * arm is parked off it.
 */
function record(): SVGSVGElement {
  const id = `rc${++uid}`
  return svg(`<svg class="disc" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
  <defs><radialGradient id="${id}" cx=".42" cy=".38" r=".7"><stop offset="0" stop-color="#3a302a"/><stop offset=".55" stop-color="#15100c"/><stop offset="1" stop-color="#050403"/></radialGradient></defs>
  <g class="disc__record">
    <circle cx="19" cy="21" r="16.5" fill="url(#${id})" stroke="#000" stroke-width=".8"/>
    <circle cx="19" cy="21" r="14.6" fill="none" stroke="#4a3f36" stroke-width=".35"/>
    <circle cx="19" cy="21" r="12.9" fill="none" stroke="#3b322b" stroke-width=".35"/>
    <circle cx="19" cy="21" r="11.2" fill="none" stroke="#4a3f36" stroke-width=".35"/>
    <circle cx="19" cy="21" r="9.5" fill="none" stroke="#3b322b" stroke-width=".35"/>
    <circle cx="19" cy="21" r="6.4" fill="#a8231a" stroke="#e9c870" stroke-width=".6"/>
    <path d="M14.6 19.4a4.8 4.8 0 0 1 8.8 0" fill="none" stroke="#f3dc9a" stroke-width=".9" stroke-linecap="round"/>
    <path d="M15.6 23.6h6.8" stroke="#f3dc9a" stroke-width=".6" stroke-linecap="round" opacity=".8"/>
    <circle cx="19" cy="21" r="1" fill="#f3e7cc"/>
  </g>
  <path d="M8.2 13.6A13 13 0 0 1 15 8.9" fill="none" stroke="#fff" stroke-width="1.1" stroke-linecap="round" opacity=".28"/>
  <path d="M29.2 30.4a13 13 0 0 1-4.6 3.6" fill="none" stroke="#fff" stroke-width=".8" stroke-linecap="round" opacity=".16"/>
  <g class="disc__arm">
    <path d="M35.2 5.2L29.6 19.6" stroke="#cf9d41" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M28.2 18.6l3.1 1.2-.9 2.6-3.1-1.2z" fill="#e9c870" stroke="#5a3a0e" stroke-width=".5"/>
    <circle cx="35.2" cy="5.2" r="2.6" fill="#7a5317" stroke="#e9c870" stroke-width=".8"/>
  </g>
</svg>`)
}

export interface MusicState {
  /** Music mode is picked (the record button is pressed). */
  on: boolean
  /** A song is actually playing (the record turns). */
  playing: boolean
}

function musicTitle(on: boolean, lang: Lang): string {
  return t(on ? 'music' : 'roomSound', lang)
}

export function musicToggle(m: MusicState, lang: Lang, onToggle: () => void): HTMLButtonElement {
  const btn = h('button', { class: 'plaque__btn plaque__btn--disc', type: 'button', 'data-action': 'music', 'aria-pressed': String(m.on),
    'aria-haspopup': 'menu', 'aria-expanded': 'false', 'aria-label': t('music', lang), title: musicTitle(m.on, lang), onclick: () => onToggle() }, record())
  btn.classList.toggle('is-spinning', m.on && m.playing)
  return btn
}

/** Press or release the record, and start or stop it turning, in place (the arm swings across). */
export function setMusicToggle(btn: HTMLButtonElement, m: MusicState, lang: Lang): void {
  btn.setAttribute('aria-pressed', String(m.on))
  btn.title = musicTitle(m.on, lang)
  btn.classList.toggle('is-spinning', m.on && m.playing)
}

/** Game sound and Music on one brass plaque: the horn and the record (the horn alone without `on.music`). */
export function soundPlaque(p: { soundOn: boolean; music?: MusicState; lang: Lang }, on: { sound(): void; music?(): void }): HTMLElement {
  const music = on.music
  return h('div', { class: 'plaque plaque--sound' },
    soundToggle(p.soundOn, p.lang, on.sound),
    music ? h('span', { class: 'plaque__bar', 'aria-hidden': 'true' }) : null,
    music ? musicToggle(p.music ?? { on: false, playing: false }, p.lang, music) : null)
}

/** "हिंदी | English" on one plaque; the current language is the inked, pressed segment. */
export function langSwitch(lang: Lang, onPick: (l: Lang) => void): HTMLElement {
  const opt = (l: Lang) =>
    h('button', { class: `langswitch__opt${l === lang ? ' is-on' : ''}`, type: 'button', lang: l, 'data-lang': l, 'aria-pressed': String(l === lang),
      onclick: () => { if (l !== lang) onPick(l) } }, strings[l].langSelf)
  return h('div', { class: 'plaque langswitch', role: 'group', 'data-action': 'lang', 'aria-label': `${t('langChange', lang)}: ${strings.hi.langSelf} / ${strings.en.langSelf}` },
    opt('hi'), h('span', { class: 'langswitch__bar', 'aria-hidden': 'true' }), opt('en'))
}

/** Sound, music and language together, as one cluster. */
export function controlCluster(
  p: { soundOn: boolean; music?: MusicState; lang: Lang },
  on: { sound(): void; music?(): void; lang(l: Lang): void },
): HTMLElement {
  return h('div', { class: 'controls' }, soundPlaque(p, on), langSwitch(p.lang, on.lang))
}
