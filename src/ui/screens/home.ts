import type { Channel, Era, EraId } from '../../content/types'
import { DAYS, type Difficulty } from '../../game/config'
import { getLang } from '../../i18n/lang'
import { strings, t, tf, type Strings } from '../../i18n/strings'
import { card } from '../card'
import { h, mount, svg } from '../h'
import { speakerIcon, speakerOffIcon } from '../icons'
import { lettering } from '../ornament'

/** A chapter's best run: the difficulty and how many days were stamped right. */
export interface Best {
  difficulty: Difficulty
  days: number
}

export interface HomeProps {
  eras: Era[]
  best: Partial<Record<EraId, Best>>
  dailyDone: boolean
  /** Today's Aaj ka Taar number, when there is a puzzle today. */
  dailyNumber?: number
  /** Shows the right icon on the sound button. Defaults to on. */
  soundOn?: boolean
}

export interface HomeHandlers {
  chapter(id: EraId): void
  daily(): void
  continue(): void
  lang(): void
  sound(): void
  credits(): void
}

export const MODE_KEY: Record<Difficulty, keyof Strings> = { easy: 'modeEasy', medium: 'modeMedium', hard: 'modeHard' }

const survived = (b: Best | undefined) => b !== undefined && b.days >= DAYS[b.difficulty]

/** The first chapter, in order, not yet survived (else the first). */
export function suggestedEra(eras: Era[], best: Partial<Record<EraId, Best>>): Era | undefined {
  const ordered = [...eras].sort((a, b) => a.order - b.order)
  return ordered.find((e) => !survived(best[e.id])) ?? ordered[0]
}

/** Sound and language, top right over the room. */
export function cornerTools(soundOn: boolean, on: { sound(): void; lang(): void }): HTMLElement {
  const lang = getLang()
  const other = lang === 'en' ? 'hi' : 'en'
  return h('div', { class: 'corner' },
    h('button', { class: 'icon-btn', type: 'button', 'data-action': 'sound', 'aria-pressed': String(soundOn),
      'aria-label': t('sound', lang), title: t(soundOn ? 'soundOn' : 'soundOff', lang), onclick: () => on.sound() },
      soundOn ? speakerIcon() : speakerOffIcon()),
    h('button', { class: 'chip', type: 'button', 'data-action': 'lang', lang: other, 'aria-label': `${t('langChange', lang)}: ${strings[other].langSelf}`, onclick: () => on.lang() },
      strings[other].langSelf))
}

/** The title: the lettering for the eye, the name for screen readers. */
export function titleBlock(): HTMLElement {
  const lang = getLang()
  return h('h1', { class: 'home__title' }, lettering(), h('span', { class: 'sr-only' }, t('appName', lang)))
}

export function renderHome(root: HTMLElement, p: HomeProps, on: HomeHandlers): void {
  const lang = getLang()
  const eras = [...p.eras].sort((a, b) => a.order - b.order)
  const next = suggestedEra(eras, p.best)

  const tiles = h('ol', { class: 'chapters' }, eras.map((e) => {
    const b = p.best[e.id]
    const done = survived(b)
    const bestLine = !b ? null
      : done ? tf('bestSurvived', lang, { mode: t(MODE_KEY[b.difficulty], lang) })
      : tf('bestDays', lang, { n: b.days, mode: t(MODE_KEY[b.difficulty], lang) })
    const cls = ['chapter', `chapter--${e.channel}`, done ? 'is-survived' : '', e.id === next?.id ? 'is-next' : ''].filter(Boolean).join(' ')
    return h('li', null,
      h('button', { class: cls, type: 'button', 'data-era': e.id, onclick: () => on.chapter(e.id) },
        tileArt(e.channel),
        h('span', { class: 'chapter__year' }, e.year,
          b ? h('span', { class: `chapter__mark${done ? ' is-done' : ''}`, 'aria-hidden': 'true' }, done ? tickMark() : `${b.days}/${DAYS[b.difficulty]}`) : null),
        h('span', { class: 'chapter__place' }, e.place[lang]),
        bestLine ? h('span', { class: 'sr-only' }, bestLine) : null))
  }))

  const daily = h('button', { class: `daily${p.dailyDone ? ' is-done' : ''}`, type: 'button', 'data-action': 'daily', onclick: () => on.daily() },
    envelope(),
    h('span', { class: 'daily__title' }, p.dailyNumber ? `${t('dailyTitle', lang)} #${p.dailyNumber}` : t('dailyTitle', lang)),
    h('span', { class: 'daily__status' }, t(p.dailyDone ? 'dailyDone' : 'dailyPlay', lang)))

  const cont = h('button', { class: 'btn btn--primary btn--block btn--continue', type: 'button', 'data-action': 'continue', onclick: () => on.continue() },
    h('span', null, t('continue', lang)),
    next ? h('span', { class: 'btn__sub' }, `${next.place[lang]} ${next.year}`) : null)

  mount(root, h('div', { class: 'screen screen--home screen--card', lang },
    cornerTools(p.soundOn ?? true, on),
    h('div', { class: 'stack' },
      titleBlock(),
      card('home__card', [h('p', { class: 'home__premise' }, t('premise', lang)), tiles, daily], [cont]),
      h('p', { class: 'stack__foot' },
        h('button', { class: 'link link--light', type: 'button', 'data-action': 'credits', onclick: () => on.credits() }, t('credits', lang))))))
}

// Each chapter tile is a small artefact of its desk: a wax seal, a leaflet corner, a radio dial,
// a telegram strip. Each one moves a little (CSS), and holds still under reduced motion.
function tileArt(channel: Channel): HTMLElement {
  switch (channel) {
    case 'petition':
      return h('span', { class: 'art art--seal', 'aria-hidden': 'true' }, svg(`<svg viewBox="0 0 40 40" focusable="false">
  <path d="M20 2l3.6 2 4.2-.2 2.5 3.4 3.9 1.7.8 4.2 2.8 3.2-1.1 4.1 1.1 4.1-2.8 3.2-.8 4.2-3.9 1.7-2.5 3.4-4.2-.2L20 38l-3.6-2-4.2.2-2.5-3.4-3.9-1.7-.8-4.2-2.8-3.2 1.1-4.1-1.1-4.1 2.8-3.2.8-4.2 3.9-1.7 2.5-3.4 4.2.2z" fill="#8f2c1f"/>
  <circle cx="20" cy="20" r="12.5" fill="none" stroke="#e8b9a0" stroke-opacity=".5" stroke-width="1"/>
  <g fill="#e8b9a0" fill-opacity=".5"><ellipse cx="20" cy="14" rx="2" ry="4.4"/><ellipse cx="20" cy="26" rx="2" ry="4.4"/><ellipse cx="14" cy="20" rx="4.4" ry="2"/><ellipse cx="26" cy="20" rx="4.4" ry="2"/></g>
  <circle cx="20" cy="20" r="2.2" fill="#8f2c1f" stroke="#e8b9a0" stroke-opacity=".6" stroke-width=".8"/>
</svg>`), h('span', { class: 'art__glint' }))
    case 'note':
      return h('span', { class: 'art art--leaflet', 'aria-hidden': 'true' }, h('span', { class: 'art__fold' }))
    case 'radio':
      return h('span', { class: 'art art--dial', 'aria-hidden': 'true' }, svg(`<svg viewBox="0 0 48 30" focusable="false">
  <path d="M4 27a20 20 0 0 1 40 0" fill="#f6ecd6" stroke="#3b3326" stroke-width="1.4"/>
  <g stroke="#3b3326" stroke-width="1"><path d="M8.6 18.4l2 1.3M13.4 12.6l1.4 1.9M19.6 8.9l.7 2.2M28.4 8.9l-.7 2.2M34.6 12.6l-1.4 1.9M39.4 18.4l-2 1.3"/></g>
  <text x="24" y="23" text-anchor="middle" font-size="5.5" fill="#a3291f" font-family="serif">42.34</text>
  <g class="art__needle"><path d="M24 27L24 9" stroke="#a3291f" stroke-width="1.3" stroke-linecap="round"/></g>
  <circle cx="24" cy="27" r="2" fill="#3b3326"/>
</svg>`))
    case 'telegram':
      return h('span', { class: 'art art--strip', 'aria-hidden': 'true' }, h('span', { class: 'art__tape' }, 'STOP  TAAR  STOP  TAAR  STOP  TAAR  '))
  }
}

function tickMark(): SVGSVGElement {
  return svg(`<svg class="tick" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
  <circle cx="10" cy="10" r="8.6" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <path d="M6 10.4l2.8 2.8L14.2 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`)
}

/** A telegram envelope whose flap lifts now and then. */
function envelope(): HTMLElement {
  return h('span', { class: 'envelope', 'aria-hidden': 'true' }, svg(`<svg viewBox="0 0 36 26" focusable="false">
  <rect x="1" y="5" width="34" height="20" rx="2" fill="#efd99a" stroke="#6b5130" stroke-width="1.2"/>
  <path d="M1.6 24.4L14 14M34.4 24.4L22 14" stroke="#6b5130" stroke-width="1" fill="none"/>
  <g class="envelope__flap"><path d="M1.5 5.6L18 17.5 34.5 5.6z" fill="#e4c97e" stroke="#6b5130" stroke-width="1.2" stroke-linejoin="round"/></g>
  <circle cx="18" cy="15.5" r="3" fill="#a3291f"/>
</svg>`))
}
