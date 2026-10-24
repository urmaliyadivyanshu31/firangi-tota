// The toss's beats, shared by the 3D stage (toss.ts) and the flat desk (crumple2d.ts). No three.js
// here, so the 2D fallback can use them without loading the 3D chunk.

/**
 * The beats, in ms. The camera starts to draw back (`lead`), the hands come down over the paper
 * (`reach`), three squeezes screw it up between the palms, the left hand lets go while the right
 * turns over the ball, its back up (`take`), carries it out over the front edge of the desk toward
 * the basket (`carry`) and pushes a little toward it as the fingers open (`swing`), while the
 * camera draws back to the basket; the ball drops in (`fly`, about as long as a real drop of half a
 * metre), bounces (`settle`), and the shot holds a breath (`hold`). From the start to the landing
 * is about 2.5 s. Under reduced motion it only fades (`fade`).
 */
export const TOSS = { lead: 80, reach: 300, squeezes: [300, 320, 380] as const, take: 240, carry: 400, swing: 120, fly: 340, settle: 170, hold: 380, fade: 320, camIn: 650, camPush: 760 } as const

/** How far each squeeze has screwed the paper up (0 flat … 1 a ball), and the wring after it. */
export const SQUEEZE_K = [0.42, 0.76, 1] as const
export const SQUEEZE_TWIST = [0.3, -0.26, 0.12] as const

const crumpleMs = TOSS.squeezes.reduce((a, b) => a + b, 0)

/** When each beat starts, from the start of the toss (ms). `release` is when the ball leaves the hand. */
export const TOSS_AT = (() => {
  const reach = TOSS.lead
  const squeeze0 = reach + TOSS.reach
  const squeezes = TOSS.squeezes.map((_, i) => squeeze0 + TOSS.squeezes.slice(0, i).reduce((a, b) => a + b, 0))
  const take = squeeze0 + crumpleMs
  const carry = take + TOSS.take
  const swing = carry + TOSS.carry
  const release = swing + TOSS.swing
  const land = release + TOSS.fly
  const end = land + TOSS.settle + TOSS.hold
  return { reach, squeezes, take, carry, swing, release, land, end }
})()

/** From the start of the toss to the ball landing (ms). */
export const TOSS_LANDS_MS = TOSS_AT.land

/** How screwed up the paper is (0..1) at `e` ms into the toss, the wring, and how hard the hands press. */
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
    const s = squeezeAt(t)
    k = k0 + (k1 - k0) * s.k
    twist = tw0 + (tw1 - tw0) * s.wring
    if (t < 1) return { k, twist, press: s.press }
  }
  return { k, twist, press: 0.3 }
}

/**
 * One squeeze at t (0..1): the hands press in fast over its first six tenths (`k` of the way), then
 * wring as the grip eases (`wring`); `press` is how hard they squeeze, the fingers clenching with it.
 */
export function squeezeAt(t: number): { k: number; wring: number; press: number } {
  const p = Math.min(1, t / 0.6)
  const w = Math.min(1, Math.max(0, (t - 0.35) / 0.65))
  return { k: 1 - Math.pow(1 - p, 3), wring: w * w * (3 - 2 * w), press: t < 0.6 ? Math.sin(p * Math.PI * 0.5) : 1 - ((t - 0.6) / 0.4) * 0.7 }
}
