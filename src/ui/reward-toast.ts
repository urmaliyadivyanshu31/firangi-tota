import { h } from './h'

// The reward toast (owner 10-24): whenever a reward is earned, a small paper chit with a brass token
// slides in from the top right, holds for about 2.5 s and slides away. A jackpot's chit is warmer and
// brighter. Two rewards close together queue, one after another, never overlapping. The chit never
// takes a tap (pointer-events: none in the CSS) and sits in a polite live region, so a screen reader
// says it too. Under reduced motion it fades and does not slide. Nothing waits on it: it is only a
// timer and some DOM, so a hidden tab, a lost WebGL context or a language switch cannot stall the game.

/** How long a chit stays up. A queue behind it shortens the hold so a chapter's three finds pass briskly. */
export const HOLD_MS = 2500
export const HOLD_QUEUED_MS = 1800
/** The slide away, and the beat between one chit and the next. */
export const OUT_MS = 340
export const OUT_REDUCED_MS = 160
export const GAP_MS = 140
/** More than this many waiting, and the oldest plain ones are dropped (a jackpot is never dropped). */
export const MAX_WAITING = 6

export interface ToastItem {
  /** The reward item id (its icon is drawn by `icon`). */
  item: string
  jackpot: boolean
  /** A jackpot's cry ("Jackpot!"), shown over the line. */
  kicker: string | null
  text: string
  lang: string
}

export interface RewardToastDeps {
  parent: HTMLElement
  reduced: boolean
  /** Where the chit's top edge goes now (px): under the top bar, and under the music cabinet when it is docked. */
  top(): number
  /** Draws the item's small icon on the token's canvas (best effort; the chit reads without it). */
  icon?(canvas: HTMLCanvasElement, item: string): void
}

export interface RewardToast {
  /** Queues a chit; `delayMs` waits before it first appears (the treasure landing on the paper). */
  push(t: ToastItem, delayMs?: number): void
  /** Takes everything down at once (leaving the day). */
  clear(): void
  /** Whether a chit is up or waiting. */
  busy(): boolean
  readonly el: HTMLElement
}

const ICON_PX = 40

export function createRewardToast(deps: RewardToastDeps): RewardToast {
  const host = h('div', { class: 'rtoast-host', 'aria-live': 'polite', 'aria-atomic': 'true' })
  deps.parent.appendChild(host)
  const waiting: ToastItem[] = []
  let timer = 0
  let up: HTMLElement | null = null
  /** An epoch that `clear` bumps, so a timer from before it does nothing. */
  let epoch = 0

  function build(t: ToastItem): HTMLElement {
    const canvas = h('canvas', { class: 'rtoast__icon', 'aria-hidden': 'true' })
    const dpr = Math.min(2, (typeof devicePixelRatio === 'number' && devicePixelRatio) || 1)
    canvas.width = canvas.height = Math.round(ICON_PX * dpr)
    canvas.style.width = canvas.style.height = `${ICON_PX}px`
    const words = h(
      'span',
      { class: 'rtoast__words' },
      t.kicker ? h('span', { class: 'rtoast__kicker' }, t.kicker) : null,
      t.kicker ? ' ' : null,
      h('span', { class: 'rtoast__line' }, t.text),
    )
    const el = h(
      'div',
      { class: `rtoast${t.jackpot ? ' rtoast--jackpot' : ''}${deps.reduced ? ' is-reduced' : ''}`, lang: t.lang },
      h('span', { class: 'rtoast__token', 'aria-hidden': 'true' }, canvas),
      words,
    )
    try {
      deps.icon?.(canvas, t.item)
    } catch {
      // the chit reads without its picture
    }
    return el
  }

  function show(): void {
    timer = 0
    const t = waiting.shift()
    if (!t) return
    const mine = epoch
    const el = build(t)
    up = el
    host.style.top = `${Math.max(0, Math.round(deps.top()))}px`
    host.appendChild(el)
    el.classList.add('is-in')
    const hold = waiting.length ? HOLD_QUEUED_MS : HOLD_MS
    const out = deps.reduced ? OUT_REDUCED_MS : OUT_MS
    timer = window.setTimeout(() => {
      if (mine !== epoch) return
      el.classList.remove('is-in')
      el.classList.add('is-out')
      timer = window.setTimeout(() => {
        if (mine !== epoch) return
        el.remove()
        up = null
        timer = window.setTimeout(show, GAP_MS)
      }, out)
    }, hold)
  }

  return {
    el: host,
    push(t, delayMs = 0) {
      // too many waiting (a very long run bonus): drop the oldest plain one, never a jackpot
      if (waiting.length >= MAX_WAITING) {
        const i = waiting.findIndex((w) => !w.jackpot)
        if (i >= 0) waiting.splice(i, 1)
        else return
      }
      waiting.push(t)
      if (up || timer) return
      timer = window.setTimeout(show, delayMs)
    },
    clear() {
      epoch++
      window.clearTimeout(timer)
      timer = 0
      waiting.length = 0
      up?.remove()
      up = null
      host.replaceChildren()
    },
    busy: () => up !== null || waiting.length > 0,
  }
}
