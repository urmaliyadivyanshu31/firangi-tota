import type { Channel, Era, EraId } from '../../content/types'
import { DAYS, TIMER_S, type Difficulty } from '../../game/config'
import { getLang } from '../../i18n/lang'
import { t, tf, type Strings } from '../../i18n/strings'
import { h, mount, svg } from '../h'
import { lettering } from '../ornament'
import { eraItems, type Collection } from '../../game/rewards'
import { drawIcon } from '../../scene/reward-art'

// The one page the game opens on: a period document over the live room of the chosen chapter. It
// carries the title, a two-line hook, the four chapters as artefact tabs, how many days you will
// hold out, and Begin. Who you are and who the Tota is come after Begin, as two illustrated cards
// on the desk (src/ui/screens/intro.ts). The paper takes the chosen era's own form: a court
// petition, a pink leaflet, a radio script, a telegram.

/** A chapter's best run: the difficulty and how many days were stamped right. */
export interface Best {
  difficulty: Difficulty
  days: number
}

export interface MainProps {
  eras: Era[]
  best: Partial<Record<EraId, Best>>
  selected: EraId
  difficulty: Difficulty
  /** The rewards kept so far, per chapter (src/game/rewards.ts). */
  collection?: Collection
}

export interface MainHandlers {
  select(id: EraId): void
  difficulty(d: Difficulty): void
  begin(): void
  credits(): void
}

export const MODE_KEY: Record<Difficulty, keyof Strings> = { easy: 'modeEasy', medium: 'modeMedium', hard: 'modeHard' }
const MODES: Difficulty[] = ['easy', 'medium', 'hard']

const survived = (b: Best | undefined) => b !== undefined && b.days >= DAYS[b.difficulty]

/** The first chapter, in order, not yet survived (else the first). */
export function suggestedEra(eras: Era[], best: Partial<Record<EraId, Best>>): Era | undefined {
  const ordered = [...eras].sort((a, b) => a.order - b.order)
  return ordered.find((e) => !survived(best[e.id])) ?? ordered[0]
}

// One main page is live at a time; the keyboard follows the latest render.
let active: { screen: HTMLElement; p: MainProps; on: MainHandlers; eras: Era[] } | null = null
let keysBound = false

function onKey(e: KeyboardEvent): void {
  const a = active
  if (!a || !a.screen.isConnected || e.altKey || e.ctrlKey || e.metaKey) return
  const target = e.target instanceof Element ? e.target : null
  if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return
  const i = a.eras.findIndex((x) => x.id === a.p.selected)
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    const next = a.eras[(i + (e.key === 'ArrowLeft' ? -1 : 1) + a.eras.length) % a.eras.length]
    if (next) {
      e.preventDefault()
      a.on.select(next.id)
    }
  } else if (e.key === '1' || e.key === '2' || e.key === '3') {
    a.on.difficulty(MODES[Number(e.key) - 1]!)
  } else if (e.key === 'Enter' && !e.repeat) {
    // Enter begins, unless it is pressing some other button (credits, sound, language)
    if (target?.closest('button') && !target.closest('[role="tab"], [data-mode], [data-action="begin"]')) return
    e.preventDefault()
    a.on.begin()
  }
}

/** "Delhi" from "Delhi 1857": the tab says the year big and the city small. */
function city(e: Era, lang: 'en' | 'hi'): string {
  return e.title[lang].replace(e.year, '').trim() || e.place[lang]
}

export function renderMain(root: HTMLElement, p: MainProps, on: MainHandlers): void {
  const lang = getLang()
  const eras = [...p.eras].sort((a, b) => a.order - b.order)
  const era = eras.find((e) => e.id === p.selected) ?? eras[0]
  if (!era) throw new Error('No chapters to show')

  const tabs = h('div', { class: 'tabs-era', role: 'tablist', 'aria-label': t('chaptersLabel', lang) }, eras.map((e) => {
    const b = p.best[e.id]
    const done = survived(b)
    const on1 = e.id === era.id
    const bestLine = !b ? null
      : done ? tf('bestSurvived', lang, { mode: t(MODE_KEY[b.difficulty], lang) })
      : tf('bestDays', lang, { n: b.days, mode: t(MODE_KEY[b.difficulty], lang) })
    return h('button', { class: `chapter chapter--${e.channel}${on1 ? ' is-on' : ''}`, type: 'button', role: 'tab', id: `ft-tab-${e.id}`,
      'aria-selected': String(on1), 'aria-controls': 'ft-era-panel', tabindex: on1 ? 0 : -1, 'data-era': e.id, onclick: () => on.select(e.id) },
      tileArt(e.channel),
      h('span', { class: 'chapter__year' }, e.year),
      h('span', { class: 'chapter__place' }, city(e, lang)),
      b ? h('span', { class: `chapter__mark${done ? ' is-done' : ''}`, 'aria-hidden': 'true' }, done ? inkTick() : tally(b.days)) : null,
      bestLine ? h('span', { class: 'sr-only' }, `, ${bestLine}`) : null)
  }))

  const modes = h('div', { class: 'modes', role: 'radiogroup', 'aria-label': t('setupQuestion', lang) }, MODES.map((d) =>
    h('button', { class: `mode mode--${d}${d === p.difficulty ? ' is-on' : ''}`, type: 'button', role: 'radio', 'aria-checked': String(d === p.difficulty),
      'data-mode': d, onclick: () => on.difficulty(d) },
      // the number is the chapter's length in days: say so beside it, small, outside the ink loop
      h('span', { class: 'mode__count' },
        h('span', { class: 'mode__days' }, String(DAYS[d]), d === p.difficulty ? inkLoop() : null),
        h('span', { class: 'mode__unit' }, t('modeDaysUnit', lang))),
      h('span', { class: 'mode__name' }, t(MODE_KEY[d], lang)),
      h('span', { class: 'mode__secs' }, tf('modeSeconds', lang, { s: TIMER_S[d] })))))

  const doc = h('article', { class: `doc doc--${era.channel} era-${era.id}`, lang },
    h('span', { class: 'doc__paper', 'aria-hidden': 'true' }),
    docMark(era.channel),
    h('div', { class: 'doc__body' },
    h('h1', { class: 'home__title' }, lettering(), h('span', { class: 'sr-only' }, t('appName', lang))),
    h('p', { class: 'doc__hook' }, t('premise', lang)),
    tabs,
    h('section', { class: 'doc__era', id: 'ft-era-panel', role: 'tabpanel', 'aria-labelledby': `ft-tab-${era.id}` },
      h('h2', { class: 'doc__q' }, t('setupQuestion', lang)),
      modes,
      h('button', { class: 'btn btn--primary btn--block btn--begin', type: 'button', 'data-action': 'begin', onclick: () => on.begin() },
        h('span', null, t('begin', lang)))),
    h('p', { class: 'doc__credits' },
      h('button', { class: 'doc__creditsbtn', type: 'button', 'data-action': 'credits', onclick: () => on.credits() }, t('homeCredits', lang)))),
    treasure(era, p.collection?.[era.id] ?? {}, lang))

  const screen = h('div', { class: `screen screen--main era-${era.id}`, lang }, h('div', { class: 'stack' }, doc))
  const hadFocus = root.querySelector('[role="tab"]:focus') !== null
  mount(root, screen)
  if (hadFocus) screen.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')?.focus({ preventScroll: true })

  active = { screen, p, on, eras }
  if (!keysBound) {
    document.addEventListener('keydown', onKey)
    keysBound = true
  }
}

/** The chosen chapter's treasures, kept open across redraws (a language switch) until closed. */
let treasureOpen = false

/**
 * A small wooden treasure box on the paper's corner, shown once the chapter has earned anything; a tap
 * lifts its lid and hangs a paper tag with each treasure and its count.
 */
function treasure(era: Era, counts: Readonly<Record<string, number>>, lang: 'en' | 'hi'): HTMLElement | null {
  const items = eraItems(era.id).filter((i) => (counts[i.id] ?? 0) > 0)
  if (!items.length) return null
  const tag = h('div', { class: 'treasure__tag', id: 'ft-treasure', role: 'group', 'aria-label': `${t('treasure', lang)} · ${era.title[lang]}` },
    h('p', { class: 'treasure__title' }, `${t('treasure', lang)} · ${era.title[lang]}`),
    h('ul', { class: 'treasure__row' }, items.map((it) => {
      const n = Math.floor(counts[it.id] ?? 0)
      const c = document.createElement('canvas')
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      c.width = c.height = Math.round(34 * dpr)
      c.setAttribute('aria-hidden', 'true')
      try {
        const g = c.getContext('2d')
        if (g) {
          g.scale(dpr, dpr)
          drawIcon(g, it.id, 0, 0, 34)
        }
      } catch {
        /* no canvas: the count and the name still say it */
      }
      const name = n === 1 ? it.name[lang].one : `${n} ${it.name[lang].many}`
      return h('li', { class: 'treasure__item', title: name }, c, h('span', { class: 'treasure__count', 'aria-hidden': 'true' }, `×${n}`), h('span', { class: 'sr-only' }, name))
    })))
  tag.hidden = !treasureOpen
  const wrap = h('div', { class: `treasure${treasureOpen ? ' is-open' : ''}` }, tag)
  const btn = h('button', { class: 'treasure__box', type: 'button', 'data-action': 'treasure', 'aria-expanded': String(treasureOpen), 'aria-controls': 'ft-treasure', 'aria-label': t('treasure', lang),
    onclick: () => {
      treasureOpen = !treasureOpen
      tag.hidden = !treasureOpen
      wrap.classList.toggle('is-open', treasureOpen)
      btn.setAttribute('aria-expanded', String(treasureOpen))
    } }, chestSvg())
  wrap.appendChild(btn)
  return wrap
}

/** A small sheesham box with brass corners and a hasp; its lid lifts when open. */
function chestSvg(): SVGSVGElement {
  return svg(`<svg viewBox="0 0 44 38" focusable="false" aria-hidden="true">
  <rect x="5" y="16" width="34" height="19" rx="2" fill="#6b3f1f"/>
  <path d="M5 21h34M5 28h34" stroke="#4a2a12" stroke-width="1"/>
  <rect x="5" y="16" width="34" height="19" rx="2" fill="none" stroke="#c9a24e" stroke-width="1.4"/>
  <path d="M5 30v5h5M39 30v5h-5M5 21v-5h5M39 21v-5h-5" stroke="#e0bb62" stroke-width="2" fill="none"/>
  <g class="treasure__lid">
    <path d="M5 16c0-6 3-9 8-9h18c5 0 8 3 8 9z" fill="#7a4a24" stroke="#c9a24e" stroke-width="1.4"/>
    <path d="M9 10.5h26" stroke="#4a2a12" stroke-width="1"/>
    <circle cx="22" cy="10" r="1.8" fill="#f1cf6a" stroke="#8a6420" stroke-width=".7"/>
  </g>
  <rect x="19.5" y="15" width="5" height="7" rx="1" fill="#e0bb62" stroke="#8a6420" stroke-width=".7"/>
  <circle cx="22" cy="19.4" r=".9" fill="#5a3a12"/>
</svg>`)
}

/** The era's own mark on the paper: a seal, a leaflet's banner, punched holes, a telegram head. */
function docMark(channel: Channel): HTMLElement {
  switch (channel) {
    case 'petition':
      return h('span', { class: 'doc__mark doc__mark--seal', 'aria-hidden': 'true' }, sealSvg())
    case 'note':
      return h('span', { class: 'doc__mark doc__mark--banner', 'aria-hidden': 'true' }, 'HINDUSTAN SOCIALIST REPUBLICAN ARMY')
    case 'radio':
      return h('span', { class: 'doc__mark doc__mark--holes', 'aria-hidden': 'true' }, h('i'), h('i'))
    case 'telegram':
      return h('span', { class: 'doc__mark doc__mark--wire', 'aria-hidden': 'true' }, h('span', null, 'POSTS AND TELEGRAPHS'), h('span', null, 'TELEGRAM'))
  }
}

function sealSvg(): SVGSVGElement {
  return svg(`<svg viewBox="0 0 40 40" focusable="false">
  <path d="M20 2l3.6 2 4.2-.2 2.5 3.4 3.9 1.7.8 4.2 2.8 3.2-1.1 4.1 1.1 4.1-2.8 3.2-.8 4.2-3.9 1.7-2.5 3.4-4.2-.2L20 38l-3.6-2-4.2.2-2.5-3.4-3.9-1.7-.8-4.2-2.8-3.2 1.1-4.1-1.1-4.1 2.8-3.2.8-4.2 3.9-1.7 2.5-3.4 4.2.2z" fill="#9c2a1d"/>
  <circle cx="20" cy="20" r="12.5" fill="none" stroke="#e8b9a0" stroke-opacity=".5" stroke-width="1"/>
  <g fill="#e8b9a0" fill-opacity=".5"><ellipse cx="20" cy="14" rx="2" ry="4.4"/><ellipse cx="20" cy="26" rx="2" ry="4.4"/><ellipse cx="14" cy="20" rx="4.4" ry="2"/><ellipse cx="26" cy="20" rx="4.4" ry="2"/></g>
  <circle cx="20" cy="20" r="2.2" fill="#9c2a1d" stroke="#e8b9a0" stroke-opacity=".6" stroke-width=".8"/>
</svg>`)
}

// Each chapter tab is a small artefact of its desk, with its own small motion (CSS): a wax seal
// that catches a glint, a leaflet corner that flutters, a radio needle that drifts, a telegram tape
// that ticks on a letter at a time. All hold still under reduced motion.
function tileArt(channel: Channel): HTMLElement {
  switch (channel) {
    case 'petition':
      return h('span', { class: 'art art--seal', 'aria-hidden': 'true' }, h('span', { class: 'art__arch' }), sealSvg(), h('span', { class: 'art__glint' }))
    case 'note':
      return h('span', { class: 'art art--leaflet', 'aria-hidden': 'true' }, h('span', { class: 'art__press' }, 'H.S.R.A.'), h('span', { class: 'art__fold' }))
    case 'radio':
      return h('span', { class: 'art art--dial', 'aria-hidden': 'true' }, svg(`<svg viewBox="0 0 48 30" focusable="false">
  <path d="M3 28a21 21 0 0 1 42 0z" fill="#c9a24e"/>
  <path d="M6 28a18 18 0 0 1 36 0z" fill="#f4ecd8"/>
  <g stroke="#3b3326" stroke-width="1"><path d="M9.4 20.2l2 1.2M13.7 14.6l1.4 1.8M19.7 11l.7 2.1M28.3 11l-.7 2.1M34.3 14.6l-1.4 1.8M38.6 20.2l-2 1.2"/></g>
  <text x="24" y="24.5" text-anchor="middle" font-size="5.2" fill="#a3291f" font-family="serif">42.34</text>
  <g class="art__needle"><path d="M24 28L24 11" stroke="#a3291f" stroke-width="1.3" stroke-linecap="round"/></g>
  <circle cx="24" cy="28" r="2.2" fill="#6b4a14"/>
</svg>`))
    case 'telegram':
      return h('span', { class: 'art art--strip', 'aria-hidden': 'true' }, h('span', { class: 'art__tape' }, 'STOP  TAAR  STOP  TAAR  STOP  TAAR  '))
  }
}

/** A survived chapter: a small ink tick stamped in a ring. */
function inkTick(): SVGSVGElement {
  return svg(`<svg class="tick" viewBox="0 0 22 22" aria-hidden="true" focusable="false">
  <circle cx="11" cy="11" r="9.4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="3 1.2"/>
  <path d="M6.5 11.4l3 3L15.6 8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`)
}

/** The chosen length: one quick loop of ink round the number, the way a clerk marks a form. */
function inkLoop(): SVGSVGElement {
  return svg(`<svg class="mode__loop" viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden="true" focusable="false">
  <path pathLength="1" d="M80 9C58 0 20 3 9 21C0 37 19 56 50 56C81 56 98 44 94 27C91 13 75 5 54 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" vector-effect="non-scaling-stroke"/>
</svg>`)
}

/** A best run so far, pencilled as a tally: strokes in fives, the fifth across. */
function tally(n: number): SVGSVGElement {
  const groups = Math.ceil(Math.min(n, 14) / 5)
  let d = ''
  let x = 1
  for (let g = 0; g < groups; g++) {
    const k = Math.min(5, n - g * 5)
    for (let i = 0; i < Math.min(k, 4); i++) d += `M${x + i * 3.2} 3.5v11`
    if (k === 5) d += `M${x - 1.2} 13L${x + 10.8} 4.5`
    x += 15
  }
  return svg(`<svg class="tally" viewBox="0 0 ${x} 18" aria-hidden="true" focusable="false"><path d="${d}" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`)
}
