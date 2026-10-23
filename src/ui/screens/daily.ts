import type { Era } from '../../content/types'
import { getLang } from '../../i18n/lang'
import { t, tf } from '../../i18n/strings'
import { card } from '../card'
import { announce, h, mount } from '../h'
import { gridTile } from '../ornament'

// The Aaj ka Taar result: the score, the share grid, and when the next one comes. Not the
// chapter's "caught" copy: the daily puzzle always plays all five.

export interface DailyEndProps {
  era: Era
  number: number
  results: boolean[]
  /** When the next puzzle opens (ms since epoch), and the clock to count down with. */
  nextAt: number
  now(): number
}

export interface DailyEndHandlers {
  share(): void
  chapter(): void
  home(): void
}

/** "07:12:33" until `ms` runs out. */
export function countdown(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000))
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`
}

let ticker = 0

export function renderDailyEnd(root: HTMLElement, p: DailyEndProps, on: DailyEndHandlers): void {
  const lang = getLang()
  const right = p.results.filter(Boolean).length
  const total = p.results.length
  const title = tf('dailyScore', lang, { n: p.number, right, total })

  const clock = h('span', { class: 'daily-end__clock' }, countdown(p.nextAt - p.now()))
  const [before = '', after = ''] = t('dailyNext', lang).split('{time}')

  const body = [
    h('header', { class: 'daily-end__head' },
      h('p', { class: 'daily-end__era' }, `${p.era.title[lang]} · ${p.era.place[lang]}`),
      h('h1', { class: 'daily-end__title' }, title)),
    h('div', { class: 'share-grid', role: 'img', 'aria-label': tf('shareGrid', lang, { right, total }), 'data-results': p.results.map((r) => (r ? '1' : '0')).join('') },
      p.results.map((r) => gridTile(r))),
    h('p', { class: 'daily-end__tomorrow' }, t('dailyTomorrow', lang)),
    h('p', { class: 'daily-end__next' }, before, clock, after),
  ]

  const actions = [
    h('button', { class: 'btn btn--primary btn--block', type: 'button', 'data-action': 'share', onclick: () => on.share() }, t('share', lang)),
    h('div', { class: 'row2' },
      h('button', { class: 'btn btn--chit', type: 'button', 'data-action': 'again', onclick: () => on.chapter() }, t('dailyChapter', lang)),
      h('button', { class: 'btn btn--chit', type: 'button', 'data-action': 'home', onclick: () => on.home() }, t('home', lang))),
  ]

  mount(root, h('div', { class: `screen screen--daily-end screen--card era-${p.era.id}`, lang },
    h('div', { class: 'stack' }, card('daily-end', body, actions))))
  announce(title)

  window.clearInterval(ticker)
  ticker = window.setInterval(() => {
    if (!clock.isConnected) return window.clearInterval(ticker)
    clock.textContent = countdown(p.nextAt - p.now())
  }, 1000)
}
