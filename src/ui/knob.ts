import { h } from './h'

// The music volume knob: a ridged brass knob in a dial ring that glows amber up to the level (the
// .gramo__vol styles), a slider to assistive tech. Shared by the songs' cabinet and the record menu.

/** One arrow-key step of the volume knob, and one PageUp/PageDown step. */
export const VOLUME_STEP = 5
export const VOLUME_PAGE = 10
/** Pixels of drag across the knob's full turn (up or right turns it up). */
const DRAG_RANGE_PX = 160

export const clampVolume = (v: number): number => Math.max(0, Math.min(100, Math.round(v)))

export interface Knob {
  readonly el: HTMLElement
  /** Shows a level (0-100) without reporting it. */
  show(v: number): void
}

/** A volume knob that answers arrow keys, PageUp/PageDown, Home/End, a drag and the wheel. */
export function volumeKnob(get: () => number, set: (v: number) => void, extraClass = ''): Knob {
  const el = h('div', { class: `gramo__vol${extraClass ? ` ${extraClass}` : ''}`, role: 'slider', tabindex: '0', 'data-action': 'music-volume',
    'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-orientation': 'vertical' }, h('span', { class: 'gramo__vol-knob', 'aria-hidden': 'true' }))
  const change = (v: number) => set(clampVolume(v))
  el.addEventListener('keydown', (e) => {
    const by: Record<string, number> = {
      ArrowUp: VOLUME_STEP, ArrowRight: VOLUME_STEP, ArrowDown: -VOLUME_STEP, ArrowLeft: -VOLUME_STEP,
      PageUp: VOLUME_PAGE, PageDown: -VOLUME_PAGE, Home: -100, End: 100,
    }
    const by1 = by[e.key]
    if (by1 === undefined) return
    e.preventDefault()
    e.stopPropagation() // the record menu's arrow keys move between tracks, not this
    change(get() + by1)
  })
  let drag: { id: number; x: number; y: number; from: number } | null = null
  el.addEventListener('pointerdown', (e) => {
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, from: get() }
    try { el.setPointerCapture(e.pointerId) } catch { /* not capturable here */ }
    el.classList.add('is-turning')
    e.preventDefault()
    el.focus({ preventScroll: true })
  })
  el.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return
    const moved = (e.clientX - drag.x) - (e.clientY - drag.y)
    change(drag.from + (moved / DRAG_RANGE_PX) * 100)
  })
  const endDrag = (e: PointerEvent) => {
    if (!drag || e.pointerId !== drag.id) return
    drag = null
    el.classList.remove('is-turning')
  }
  el.addEventListener('pointerup', endDrag)
  el.addEventListener('pointercancel', endDrag)
  el.addEventListener('wheel', (e) => {
    if (e.deltaY === 0) return
    e.preventDefault()
    change(get() + (e.deltaY < 0 ? VOLUME_STEP : -VOLUME_STEP))
  }, { passive: false })
  function show(v: number): void {
    el.setAttribute('aria-valuenow', String(v))
    el.setAttribute('aria-valuetext', `${v}%`)
    // the knob turns through 270 degrees, from seven o'clock to five o'clock
    el.style.setProperty('--vol', String(v / 100))
  }
  show(get())
  return { el, show }
}
