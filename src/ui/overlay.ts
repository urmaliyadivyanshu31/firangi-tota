import type { StampKind } from '../scene/index'
import { t } from '../i18n/strings'
import type { DayTitle, FlashKind } from './contract'
import { h } from './h'

// Scene effects drawn in the DOM, for the 2D desk (no WebGL): the day title, the room flash and
// the stamp's ink on the paper. The 3D stage draws its own; this mirrors them so the flat desk
// tells the day the same way. The layer sits on the stage element, under every screen.

export interface Fx {
  title(t: DayTitle): Promise<void>
  flash(kind: FlashKind): void
  imprint(kind: StampKind): void
  /** Finish what is playing now. */
  skip(): void
  /** Clear the imprint and anything still showing (a new day, or leaving). */
  clear(): void
}

const TITLE_MS = 1500
const FLASH_MS = 700

export function createFx(host: HTMLElement, reduced: boolean): Fx {
  const layer = h('div', { class: 'fx', 'aria-hidden': 'true' })
  host.appendChild(layer)
  let finish: (() => void) | null = null
  let timer = 0

  const done = () => {
    window.clearTimeout(timer)
    layer.querySelector('.fx-title')?.remove()
    const f = finish
    finish = null
    f?.()
  }

  return {
    title(d) {
      done()
      if (reduced) return Promise.resolve()
      layer.appendChild(h('div', { class: 'fx-title' }, h('p', { class: 'fx-title__big' }, d.big), h('p', { class: 'fx-title__small' }, d.small)))
      return new Promise<void>((resolve) => {
        finish = resolve
        timer = window.setTimeout(done, TITLE_MS)
      })
    },
    flash(kind) {
      layer.querySelector('.fx-flash')?.remove()
      if (reduced) return
      const el = h('div', { class: `fx-flash fx-flash--${kind}` })
      layer.appendChild(el)
      window.setTimeout(() => el.remove(), FLASH_MS)
    },
    imprint(kind) {
      layer.querySelector('.fx-imprint')?.remove()
      layer.appendChild(h('div', { class: `fx-imprint fx-imprint--${kind}` },
        h('span', { class: 'fx-imprint__dev' }, t(kind, 'hi')),
        h('span', { class: 'fx-imprint__lat' }, t(kind, 'en'))))
    },
    skip: done,
    clear() {
      done()
      layer.replaceChildren()
    },
  }
}
