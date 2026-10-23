import type { Era, EraId } from '../../content/types'
import { DAYS, type Difficulty } from '../../game/config'
import { getLang } from '../../i18n/lang'
import { strings, t, tf, type Strings } from '../../i18n/strings'
import { h, mount } from '../h'
import { mutedIcon, parrotMark, speakerIcon } from '../icons'

/** A chapter's best run: the difficulty and how many days were stamped right. */
export interface Best {
  difficulty: Difficulty
  days: number
}

export interface HomeProps {
  eras: Era[]
  best: Partial<Record<EraId, Best>>
  dailyDone: boolean
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

export function renderHome(root: HTMLElement, p: HomeProps, on: HomeHandlers): void {
  const lang = getLang()
  const other = lang === 'en' ? 'hi' : 'en'
  const soundOn = p.soundOn ?? true
  const eras = [...p.eras].sort((a, b) => a.order - b.order)
  const next = suggestedEra(eras, p.best)

  const bar = h('div', { class: 'home__bar' },
    h('button', { class: 'icon-btn', type: 'button', 'data-action': 'sound', 'aria-pressed': String(soundOn),
      'aria-label': t(soundOn ? 'soundOn' : 'soundOff', lang), title: t(soundOn ? 'soundOn' : 'soundOff', lang), onclick: () => on.sound() },
      soundOn ? speakerIcon() : mutedIcon()),
    h('button', { class: 'chip', type: 'button', 'data-action': 'lang', lang: other, 'aria-label': `${t('langChange', lang)}: ${strings[other].langSelf}`, onclick: () => on.lang() },
      strings[other].langSelf))

  const head = h('header', { class: 'home__head' },
    parrotMark(),
    h('h1', { class: 'home__title' }, t('appName', lang)),
    h('p', { class: 'home__alt', lang: other }, strings[other].appName),
    h('p', { class: 'home__tagline' }, t('tagline', lang)))

  const cont = h('button', { class: 'btn btn--primary btn--block btn--continue', type: 'button', 'data-action': 'continue', onclick: () => on.continue() },
    h('span', null, t('continue', lang)),
    next ? h('span', { class: 'btn__sub' }, `${next.place[lang]} ${next.year}`) : null)

  const daily = h('button', { class: `daily${p.dailyDone ? ' is-done' : ''}`, type: 'button', 'data-action': 'daily', onclick: () => on.daily() },
    h('span', { class: 'daily__title' }, h('span', { class: 'daily__strip' }, t('dailyTitle', lang))),
    h('span', { class: 'daily__body' }, t('dailyBody', lang)),
    h('span', { class: 'daily__status' }, t(p.dailyDone ? 'dailyDone' : 'dailyPlay', lang)))

  const cards = h('ol', { class: 'chapters' }, eras.map((e) => {
    const b = p.best[e.id]
    const bestLine = !b ? null
      : survived(b) ? tf('bestSurvived', lang, { mode: t(MODE_KEY[b.difficulty], lang) })
      : tf('bestDays', lang, { n: b.days, mode: t(MODE_KEY[b.difficulty], lang) })
    return h('li', null,
      h('button', { class: `card mat-${e.channel}${survived(b) ? ' is-survived' : ''}`, type: 'button', 'data-era': e.id, onclick: () => on.chapter(e.id) },
        h('span', { class: 'card__year' }, e.year),
        h('span', { class: 'card__place' }, e.place[lang]),
        h('span', { class: 'card__title' }, e.title[lang]),
        bestLine ? h('span', { class: 'card__best' }, bestLine) : null))
  }))

  const foot = h('footer', { class: 'home__foot' },
    h('button', { class: 'link', type: 'button', 'data-action': 'credits', onclick: () => on.credits() }, t('credits', lang)))

  mount(root, h('div', { class: 'screen screen--home', lang },
    h('div', { class: 'scroll home__scroll' }, bar, head, cont, daily, cards, foot)))
}
