import type { Era, Lang } from '../../content/types'
import { t } from '../../i18n/strings'
import { h, mount } from '../h'
import { skipIcon } from '../ornament'

// After Begin: the room shows two cards on the desk, YOU and THE TOTA (drawn by the stage). The DOM
// keeps only what the room cannot: their words for screen readers, a tap that finishes the cards'
// motion, and one paper chip, Continue, the only way on (owner 10-24: no timer).

export interface IntroProps {
  era: Era
  lang: Lang
  you: { label: string; line: string }
  tota: { label: string; line: string }
  /** The cards have settled: the Continue chip shows. */
  settled: boolean
}

export interface IntroHandlers {
  /** Continue to day 1. */
  go(): void
  /** A tap on the room (or Space or Enter): finishes the cards' motion. */
  tap(): void
}

let active: { screen: HTMLElement; on: IntroHandlers } | null = null
let keysBound = false

function onKey(e: KeyboardEvent): void {
  const a = active
  // (the main page's Enter that pressed Begin is marked handled, so it never also skips the cards)
  if (!a || !a.screen.isConnected || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.repeat) return
  if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return
  const target = e.target instanceof Element ? e.target : null
  // the chip and the language and sound plaques are buttons that answer for themselves
  if (target?.closest('button, a, input, textarea, select')) return
  e.preventDefault()
  // the day that may follow at once must not take this same key as its own skip
  e.stopImmediatePropagation()
  a.on.tap()
}

export function renderIntro(root: HTMLElement, p: IntroProps, on: IntroHandlers): void {
  const { lang } = p
  const stop = lang === 'hi' ? '।' : '.'
  const go = h('button', { class: 'btn intro__go', type: 'button', 'data-action': 'intro-go', onclick: () => on.go() },
    h('span', { class: 'intro__label' }, t('continue', lang)), skipIcon())
  const screen = h('div', { class: `screen screen--intro era-${p.era.id}${p.settled ? ' is-settled' : ''}`, lang },
    h('div', { class: 'tapcatch intro__tap', 'aria-hidden': 'true', onpointerdown: () => on.tap() }),
    h('section', { class: 'sr-only intro__copy', 'aria-live': 'polite' },
      h('p', null, `${p.you.label}: ${p.you.line}${stop}`),
      h('p', null, `${p.tota.label}: ${p.tota.line}${stop}`)),
    h('footer', { class: 'intro__foot' }, go))
  const hadFocus = root.querySelector('.intro__go:focus, [data-action="begin"]:focus') !== null
  mount(root, screen)
  if (hadFocus) go.focus({ preventScroll: true })
  active = { screen, on }
  if (!keysBound) {
    document.addEventListener('keydown', onKey)
    keysBound = true
  }
}

/** The cards are down: the Continue chip comes up. */
export function setIntroSettled(root: HTMLElement): void {
  const screen = root.querySelector<HTMLElement>('.screen--intro')
  if (!screen) return
  screen.classList.add('is-settled')
}
