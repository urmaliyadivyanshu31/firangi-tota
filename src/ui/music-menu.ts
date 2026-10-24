import type { Lang } from '../content/types'
import { FOCUS_TRACKS } from '../content/focus'
import { SONGS } from '../content/songs'
import { t } from '../i18n/strings'
import { h, svg } from './h'
import { volumeKnob } from './knob'

// The record's menu: a paper record sleeve that drops from the record button. Focus (calm nature
// recordings), two Songs, and the Room's own sound; the current choice carries an inked tick, and the
// volume knob sits at its foot. Picking a track keeps the sleeve open, so a player can hear one and
// then another; a tap outside, Escape, Tab out or the record again puts it away. Loaded only when
// the record is first tapped (app.ts).

/** What the record plays: the room, a Focus track or a song, kept as "focus:<id>" / "song:<id>". */
export type MusicChoice = 'room' | `focus:${string}` | `song:${string}`

export interface MusicMenuDeps {
  anchor: HTMLElement
  lang: Lang
  choice: MusicChoice
  volume: number
  onPick(c: MusicChoice): void
  onVolume(v: number): void
  /** The sleeve was put away (`refocus`: give the record its focus back, as after Escape). */
  onClose(refocus: boolean): void
}

export interface MusicMenu {
  readonly el: HTMLElement
  setChoice(c: MusicChoice): void
  setVolume(v: number): void
  /** The record was drawn again (a redraw of the top bar): the sleeve hangs from the new one. */
  moveTo(anchor: HTMLElement): void
  close(refocus?: boolean): void
}

// small ink vignettes, one per kind of sound, drawn in the sleeve's own ink
const G = (body: string) => svg(`<svg class="sleeve__glyph" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`)
const GLYPH: Record<string, string> = {
  // rain falling past a tiled eave
  rain: '<path d="M2.5 9.5l9.5-6 9.5 6"/><path d="M5 8v1.6M9 5.6v1.6M15 5.6v1.6M19 8v1.6"/><path d="M6.5 13l-1 2.6M11.5 13.5l-1 2.6M16.5 13l-1 2.6M9 18.5l-.8 2M14 18.5l-.8 2"/>',
  // a slow river under the bank
  river: '<path d="M2.5 9c2.4-1.6 4.4-1.6 6.6 0s4.4 1.6 6.6 0 4.2-1.6 5.8-.6"/><path d="M2.5 14c2.4-1.6 4.4-1.6 6.6 0s4.4 1.6 6.6 0 4.2-1.6 5.8-.6"/><path d="M5 19c1.8-1 3.4-1 5 0s3.4 1 5 0"/>',
  // the sun coming up over a hill, a bird crossing it
  sunrise: '<path d="M2.5 19.5h19"/><path d="M6.5 19.5a5.5 5.5 0 0 1 11 0"/><path d="M12 7V4.5M5.6 9.6L4 8M18.4 9.6L20 8"/><path d="M13.5 12.2c.7-.8 1.4-.8 2 0 .6-.8 1.3-.8 2 0"/>',
  // a leaf with a drop still on it
  birds: '<path d="M4 20c0-8.5 5.5-14 16-15-.6 10.5-6.5 15-16 15z"/><path d="M4 20L13.5 10.5"/><path d="M17.5 14.5c0 1-.7 1.7-1.5 1.7s-1.5-.7-1.5-1.7c0-.9 1.5-2.7 1.5-2.7s1.5 1.8 1.5 2.7z"/>',
  // a crescent moon over grass
  crickets: '<path d="M15.5 3.5a6 6 0 1 0 5 8.6A5 5 0 0 1 15.5 3.5z"/><path d="M3 21c.8-2.6 1.4-4.2 2.6-5.4M7 21c0-2.6.4-4.4 1.3-6M11 21c.2-2 .9-3.4 2-4.6"/>',
  // a 78 on its sleeve
  song: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="2.6"/><path d="M12 6.2a5.8 5.8 0 0 1 4.6 2.3" opacity=".7"/>',
  // the room: a window with its shutters open
  room: '<path d="M6 21V7.5a6 6 0 0 1 12 0V21"/><path d="M12 3v18M6 12.5h12"/><path d="M3.5 21h17"/>',
}
const TICK = '<svg class="sleeve__tick" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4.5 13.2c1.6 1.3 3 2.9 4.2 4.8 2.6-5.4 6.2-9.6 10.8-12.6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'

let uid = 0

export function openMusicMenu(d: MusicMenuDeps): MusicMenu {
  const lang = d.lang
  let anchor = d.anchor
  const id = `sleeve${++uid}`
  let choice = d.choice
  let volume = d.volume
  let closed = false

  const item = (c: MusicChoice, glyph: string, name: string, sub?: string) =>
    h('button', { class: 'sleeve__item', type: 'button', role: 'menuitemradio', 'data-choice': c, 'aria-checked': 'false', tabindex: '-1',
      onclick: () => pick(c) },
    G(GLYPH[glyph] ?? GLYPH.room!),
    h('span', { class: 'sleeve__label' }, h('span', { class: 'sleeve__name' }, name), sub ? h('span', { class: 'sleeve__sub' }, sub) : null),
    svg(TICK))
  const group = (key: 'musicFocus' | 'musicSongs', items: HTMLElement[]) =>
    h('div', { class: 'sleeve__group', role: 'group', 'aria-labelledby': `${id}-${key}` },
      h('p', { class: 'sleeve__section', id: `${id}-${key}`, role: 'presentation' }, t(key, lang)), ...items)

  const items = [
    ...FOCUS_TRACKS.map((f) => item(`focus:${f.id}`, f.id, f.title[lang])),
    ...SONGS.map((s) => item(`song:${s.id}`, 'song', s.title[lang], s.film[lang])),
    item('room', 'room', t('roomSound', lang)),
  ]
  const nFocus = FOCUS_TRACKS.length
  const menu = h('div', { class: 'sleeve__menu', role: 'menu', 'aria-label': t('music', lang) },
    group('musicFocus', items.slice(0, nFocus)),
    group('musicSongs', items.slice(nFocus, nFocus + SONGS.length)),
    h('div', { class: 'sleeve__group sleeve__group--room', role: 'group', 'aria-label': t('roomSound', lang) }, items[items.length - 1]!))
  const knob = volumeKnob(() => volume, (v) => {
    if (v === volume) return
    volume = v
    knob.show(v)
    d.onVolume(v)
  })
  knob.el.setAttribute('aria-label', t('musicVolume', lang))
  const el = h('div', { class: 'sleeve', lang, 'data-open': 'true' },
    h('p', { class: 'sleeve__head', 'aria-hidden': 'true' }, t('musicChoose', lang)),
    menu,
    h('div', { class: 'sleeve__foot' }, h('span', { class: 'sleeve__vol-label', 'aria-hidden': 'true' }, t('musicVolume', lang)), knob.el))

  function setChoice(c: MusicChoice): void {
    choice = c
    for (const b of items) b.setAttribute('aria-checked', String(b.dataset.choice === c))
  }
  function pick(c: MusicChoice): void {
    if (closed) return
    setChoice(c)
    d.onPick(c)
  }

  function place(): void {
    const r = anchor.getBoundingClientRect()
    const W = window.innerWidth || document.documentElement.clientWidth
    const H = window.innerHeight || document.documentElement.clientHeight
    const width = Math.min(276, W - 16)
    const right = Math.max(8, Math.min(W - width - 8, W - r.right - 6))
    const top = Math.round(r.bottom + 10)
    el.style.width = `${width}px`
    el.style.right = `${right}px`
    el.style.top = `${top}px`
    el.style.maxHeight = `${Math.max(160, H - top - 12)}px`
    // the little fold points up at the record
    const tip = Math.max(18, Math.min(width - 18, r.left + r.width / 2 - (W - right - width)))
    el.style.setProperty('--tip', `${Math.round(tip)}px`)
  }

  function onKey(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      e.preventDefault()
      close(true)
      return
    }
    const at = items.indexOf(document.activeElement as HTMLButtonElement)
    if (at < 0) return
    const go: Record<string, number> = { ArrowDown: at + 1, ArrowUp: at - 1, Home: 0, End: items.length - 1 }
    const next = go[e.key]
    if (next === undefined) return
    e.preventDefault()
    focusItem((next + items.length) % items.length)
  }
  function focusItem(i: number): void {
    items.forEach((b, k) => b.setAttribute('tabindex', k === i ? '0' : '-1'))
    items[i]?.focus({ preventScroll: false })
  }
  const onDown = (e: Event) => {
    const target = e.target as Node | null
    if (target && (el.contains(target) || anchor.contains(target))) return
    close(false)
  }
  const onFocusOut = (e: FocusEvent) => {
    const to = e.relatedTarget as Node | null
    if (to && !el.contains(to) && !anchor.contains(to)) close(false)
  }
  const onResize = () => place()

  function close(refocus = false): void {
    if (closed) return
    closed = true
    el.removeEventListener('keydown', onKey)
    el.removeEventListener('focusout', onFocusOut)
    document.removeEventListener('pointerdown', onDown, true)
    window.removeEventListener('resize', onResize)
    el.remove()
    d.onClose(refocus)
  }

  setChoice(choice)
  document.body.appendChild(el)
  place()
  el.addEventListener('keydown', onKey)
  el.addEventListener('focusout', onFocusOut)
  document.addEventListener('pointerdown', onDown, true)
  window.addEventListener('resize', onResize)
  const current = Math.max(0, items.findIndex((b) => b.dataset.choice === choice))
  focusItem(current)

  return {
    el,
    setChoice,
    setVolume(v) {
      volume = v
      knob.show(v)
    },
    moveTo(a) {
      anchor = a
      place()
    },
    close,
  }
}
