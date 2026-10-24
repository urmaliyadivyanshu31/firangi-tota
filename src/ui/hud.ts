import type { Era, Lang } from '../content/types'
import { t, tf } from '../i18n/strings'
import { h, svg } from './h'
import { langSwitch, setMusicToggle, setSoundToggle, soundPlaque, type MusicState } from './controls'
import { eraLabel } from './message'
import { homeIcon } from './ornament'

// The thin top bar of a day: home, where you are, sound and language; then the day, the mode,
// the agarbatti and its seconds. The agarbatti and the sound icon update in place.

export type ModeKind = 'easy' | 'medium' | 'hard' | 'daily'

export interface HudProps {
  era: Era
  lang: Lang
  day: number
  days: number
  mode: { kind: ModeKind; label: string }
  /** Agarbatti left, 1 = full, 0 = burnt out. */
  timerFrac: number
  /** Whole seconds left, shown beside the stick. */
  secs: number
  soundOn: boolean
  /** Music mode and whether a song is playing (no record button without it). */
  music?: MusicState
}

export interface HudHandlers {
  home?(): void
  sound(): void
  music?(): void
  lang(): void
}

export const LOW_TIME = 0.3

const pad2 = (n: number) => String(Math.max(0, Math.floor(n))).padStart(2, '0')

function applyTimer(bar: HTMLElement, frac: number, secs?: number): void {
  const f = Math.min(1, Math.max(0, Number.isFinite(frac) ? frac : 0))
  const stick = bar.querySelector<HTMLElement>('.agarbatti')
  if (stick) {
    stick.style.setProperty('--burn', String(f))
    stick.setAttribute('aria-valuenow', String(Math.round(f * 100)))
    stick.classList.toggle('is-low', f < LOW_TIME)
  }
  const s = bar.querySelector<HTMLElement>('.hud__secs')
  if (s && secs !== undefined) {
    const txt = String(Math.max(0, Math.ceil(secs)))
    if (s.textContent !== txt) s.textContent = txt
    s.classList.toggle('is-low', f < LOW_TIME)
  }
}

/** Move the agarbatti and its seconds without re-rendering. */
export function setTimer(root: HTMLElement, frac: number, secs?: number): void {
  const bar = root.querySelector<HTMLElement>('.hud')
  if (bar) applyTimer(bar, frac, secs)
}

/** Swap the horn in place. */
export function setSound(root: HTMLElement, on: boolean, lang: Lang): void {
  const b = root.querySelector<HTMLButtonElement>('.hud [data-action="sound"]')
  if (b) setSoundToggle(b, on, lang)
}

/** Press or release the record, and start or stop it turning, in place. */
export function setMusic(root: HTMLElement, m: MusicState, lang: Lang): void {
  const b = root.querySelector<HTMLButtonElement>('.hud [data-action="music"]')
  if (b) setMusicToggle(b, m, lang)
}

const SMOKE = `<svg class="agarbatti__smoke" viewBox="0 0 24 64" aria-hidden="true" focusable="false">
  <path d="M12 62c-5-7 5-12 1-20s-7-11-2-19 6-11 2-21" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
  <path d="M12 62c3-6-2-10 1-17s6-10 3-17" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" opacity=".6"/>
</svg>`

function agarbatti(lang: Lang): HTMLElement {
  return h('div', { class: 'agarbatti', role: 'progressbar', 'aria-label': t('timerLabel', lang), 'aria-valuemin': 0, 'aria-valuemax': 100 },
    h('span', { class: 'agarbatti__stem' }),
    h('span', { class: 'agarbatti__track' },
      h('span', { class: 'agarbatti__ash' }),
      h('span', { class: 'agarbatti__coat' }),
      h('span', { class: 'agarbatti__ember' }, svg(SMOKE))))
}

// The day number flips when it changes (a new day), not on every re-render of the same day.
let lastDay = ''

export function hud(p: HudProps, on: HudHandlers): HTMLElement {
  const { lang } = p
  const where = eraLabel(p.era, lang)
  const key = `${p.era.id}|${p.mode.kind}|${p.day}`
  const flip = lastDay !== '' && lastDay !== key && lastDay.startsWith(`${p.era.id}|${p.mode.kind}|`)
  lastDay = key

  const iconBtn = (action: string, label: string, icon: SVGSVGElement, fn: () => void, extra: Record<string, string> = {}) =>
    h('button', { class: 'hud__btn', type: 'button', 'data-action': action, 'aria-label': label, title: label, onclick: fn, ...extra }, icon)

  const home = on.home
  const bar = h('header', { class: 'hud', lang },
    h('div', { class: 'hud__row hud__row--where' },
      home ? iconBtn('quit', t('home', lang), homeIcon(), () => home()) : null,
      h('p', { class: 'hud__where' },
        h('span', { class: 'hud__title' }, where.title),
        where.place ? h('span', { class: 'hud__place' }, where.place) : null),
      h('div', { class: 'hud__tools' },
        soundPlaque({ soundOn: p.soundOn, music: p.music, lang }, { sound: () => on.sound(), music: on.music ? () => on.music?.() : undefined }),
        langSwitch(lang, () => on.lang()))),
    h('div', { class: 'hud__row hud__row--clock' },
      h('p', { class: 'hud__day' },
        h('span', { class: 'hud__daylabel', 'aria-hidden': 'true' }, t('dayLabel', lang)),
        h('span', { class: `flip${flip ? ' is-flipping' : ''}`, 'aria-hidden': 'true' }, h('span', { class: 'flip__n' }, pad2(p.day))),
        h('span', { class: 'hud__total', 'aria-hidden': 'true' }, `/${pad2(p.days)}`),
        h('span', { class: 'sr-only' }, tf('dayOf', lang, { n: p.day, total: p.days }))),
      h('span', { class: `hud__mode hud__mode--${p.mode.kind}` }, p.mode.label),
      agarbatti(lang),
      h('span', { class: 'hud__secs', 'aria-hidden': 'true' }, '')))
  applyTimer(bar, p.timerFrac, p.secs)
  return bar
}
