// The camera's small life under the pointer, as in the reference: hover tilts the view a few degrees
// toward the pointer, a drag (mouse button or one finger on empty scene) turns it a little further,
// and it springs back when let go. It is an additive offset on top of the scripted shots, and the
// stage scales it to almost nothing while the paper is being read.
//
// No three.js here: the math is a pure, testable model; bind() wires it to pointer events.

const DEG = Math.PI / 180

/** The furthest the view ever turns: about 6° of yaw and 4° of pitch. */
export const PARALLAX_MAX = { yaw: 6 * DEG, pitch: 4 * DEG } as const
/** How far plain hovering turns it, at the screen's edge. */
const HOVER = { yaw: 2.4 * DEG, pitch: 1.5 * DEG }
/** A drag across the whole screen gives the full turn. */
const DRAG_GAIN = 1.6
/** Time constant of the easing toward the target (ms): soft, never twitchy. */
const TAU_MS = 220

export interface ParallaxModel {
  /** The pointer over the scene, in -1..1 across and up the screen. */
  hover(x: number, y: number): void
  /** A drag in progress: how far it has gone since the press, in screen fractions. */
  drag(dx: number, dy: number): void
  /** Pointer left, button released or the gesture ended: spring home. */
  release(): void
  /** Advances the eased offset by dt and returns it (radians, clamped). */
  step(dtMs: number): { yaw: number; pitch: number }
  offset(): { yaw: number; pitch: number }
}

const clamp = (v: number, m: number) => (v > m ? m : v < -m ? -m : v)

export function createParallaxModel(): ParallaxModel {
  let tYaw = 0
  let tPitch = 0
  let yaw = 0
  let pitch = 0
  return {
    hover(x, y) {
      tYaw = clamp(clamp(x, 1) * HOVER.yaw, PARALLAX_MAX.yaw)
      tPitch = clamp(clamp(y, 1) * HOVER.pitch, PARALLAX_MAX.pitch)
    },
    drag(dx, dy) {
      tYaw = clamp(dx * DRAG_GAIN * PARALLAX_MAX.yaw * 2, PARALLAX_MAX.yaw)
      tPitch = clamp(-dy * DRAG_GAIN * PARALLAX_MAX.pitch * 2, PARALLAX_MAX.pitch)
    },
    release() {
      tYaw = 0
      tPitch = 0
    },
    step(dt) {
      const k = 1 - Math.exp(-Math.max(0, Math.min(dt, 100)) / TAU_MS)
      yaw = clamp(yaw + (tYaw - yaw) * k, PARALLAX_MAX.yaw)
      pitch = clamp(pitch + (tPitch - pitch) * k, PARALLAX_MAX.pitch)
      if (Math.abs(yaw) < 1e-6 && tYaw === 0) yaw = 0
      if (Math.abs(pitch) < 1e-6 && tPitch === 0) pitch = 0
      return { yaw, pitch }
    },
    offset: () => ({ yaw, pitch }),
  }
}

/** Elements the pointer may be over and still count as "the room" (not a card or a button). */
function overScene(target: EventTarget | null, mount: Element): boolean {
  if (!(target instanceof Element)) return false
  if (mount.contains(target)) return true
  if (target === document.body || target === document.documentElement) return true
  if (target.closest('[data-stage-pass]')) return true
  if (target.closest('button, a, input, select, textarea, label, [role], [tabindex], [contenteditable]')) return false
  // a transparent full-screen layout layer over the canvas (a screen container, a tap catcher)
  const r = target.getBoundingClientRect()
  return r.width >= window.innerWidth * 0.96 && r.height >= window.innerHeight * 0.96
}

/**
 * Listens on the window (the app's UI layers sit over the canvas) and feeds the model only when the
 * pointer is over empty scene. Returns a function that removes the listeners.
 */
export function bindParallax(mount: HTMLElement, model: ParallaxModel): () => void {
  if (typeof window === 'undefined') return () => undefined
  let dragId: number | null = null
  let x0 = 0
  let y0 = 0
  const norm = (e: PointerEvent): [number, number] => [(e.clientX / Math.max(1, window.innerWidth)) * 2 - 1, -((e.clientY / Math.max(1, window.innerHeight)) * 2 - 1)]
  const move = (e: PointerEvent) => {
    if (dragId !== null) {
      if (e.pointerId !== dragId) return
      model.drag((e.clientX - x0) / Math.max(1, window.innerWidth), (e.clientY - y0) / Math.max(1, window.innerHeight))
      return
    }
    // hover is for mice and pens; a finger only moves the view while it drags
    if (e.pointerType === 'touch') return
    if (!overScene(e.target, mount)) {
      model.release()
      return
    }
    const [x, y] = norm(e)
    model.hover(x, y)
  }
  const down = (e: PointerEvent) => {
    if (dragId !== null || !overScene(e.target, mount)) return
    if (e.pointerType === 'mouse' && e.button !== 0) return
    dragId = e.pointerId
    x0 = e.clientX
    y0 = e.clientY
  }
  const up = (e: PointerEvent) => {
    if (dragId !== null && e.pointerId !== dragId) return
    dragId = null
    model.release()
  }
  const leave = () => {
    if (dragId === null) model.release()
  }
  const opts: AddEventListenerOptions = { passive: true }
  window.addEventListener('pointermove', move, opts)
  window.addEventListener('pointerdown', down, opts)
  window.addEventListener('pointerup', up, opts)
  window.addEventListener('pointercancel', up, opts)
  document.documentElement.addEventListener('pointerleave', leave, opts)
  window.addEventListener('blur', leave)
  return () => {
    window.removeEventListener('pointermove', move)
    window.removeEventListener('pointerdown', down)
    window.removeEventListener('pointerup', up)
    window.removeEventListener('pointercancel', up)
    document.documentElement.removeEventListener('pointerleave', leave)
    window.removeEventListener('blur', leave)
  }
}
