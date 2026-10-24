// The toss's beats, shared by the 3D stage (toss.ts) and the flat desk (crumple2d.ts). No three.js
// here, so the 2D fallback can use them without loading the 3D chunk.

/**
 * The beats, in ms. The camera starts to draw back (`lead`), the hands come in (`reach`), three
 * squeezes screw the paper up, the right hand rolls the ball onto its palm while the left
 * withdraws (`roll`), cocks it (`windup`) and flicks it (`flick`) as the camera draws back to the
 * basket (`camOut`); the ball flies (`fly`), drops in and bounces (`settle`), and the shot holds a
 * breath (`hold`). From the start to the landing is about 2.4 s. Under reduced motion it only
 * fades (`fade`).
 */
export const TOSS = { lead: 80, reach: 250, squeezes: [300, 320, 380] as const, roll: 220, windup: 130, flick: 110, fly: 600, settle: 170, hold: 320, fade: 320, camIn: 650, camPush: 760, camOut: 850 } as const

/** How far each squeeze has screwed the paper up (0 flat … 1 a ball), and the wring after it. */
export const SQUEEZE_K = [0.42, 0.76, 1] as const
export const SQUEEZE_TWIST = [0.3, -0.26, 0.12] as const

const crumpleMs = TOSS.squeezes.reduce((a, b) => a + b, 0)

/** When each beat starts, from the start of the toss (ms). */
export const TOSS_AT = (() => {
  const reach = TOSS.lead
  const squeeze0 = reach + TOSS.reach
  const squeezes = TOSS.squeezes.map((_, i) => squeeze0 + TOSS.squeezes.slice(0, i).reduce((a, b) => a + b, 0))
  const roll = squeeze0 + crumpleMs
  const windup = roll + TOSS.roll
  const flick = windup + TOSS.windup
  const release = flick + TOSS.flick
  const land = release + TOSS.fly
  const end = land + TOSS.settle + TOSS.hold
  return { reach, squeezes, roll, windup, flick, release, land, end }
})()

/** From the start of the toss to the ball landing (ms). */
export const TOSS_LANDS_MS = TOSS_AT.land

/** How screwed up the paper is (0..1) at `e` ms into the toss, and the wring. */
export function crumpleAtTime(e: number): { k: number; twist: number; press: number } {
  let k = 0
  let twist = 0
  for (let i = 0; i < TOSS.squeezes.length; i++) {
    const t0 = TOSS_AT.squeezes[i] ?? 0
    const ms = TOSS.squeezes[i] ?? 1
    const k0 = i ? SQUEEZE_K[i - 1] ?? 0 : 0
    const k1 = SQUEEZE_K[i] ?? 1
    const tw0 = i ? SQUEEZE_TWIST[i - 1] ?? 0 : 0
    const tw1 = SQUEEZE_TWIST[i] ?? 0
    if (e < t0) break
    const t = Math.min(1, (e - t0) / ms)
    const p = Math.min(1, t / 0.6)
    const pe = 1 - Math.pow(1 - p, 3)
    const w = Math.min(1, Math.max(0, (t - 0.35) / 0.65))
    k = k0 + (k1 - k0) * pe
    twist = tw0 + (tw1 - tw0) * w * w * (3 - 2 * w)
    if (t < 1) return { k, twist, press: t < 0.6 ? Math.sin(p * Math.PI * 0.5) : 1 - ((t - 0.6) / 0.4) * 0.7 }
  }
  return { k, twist, press: 0.3 }
}
