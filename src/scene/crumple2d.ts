// The toss on the flat desk: two drawn hands in the persona's sleeves screw the card up into a
// paper ball (the card's own picture squashed into a jagged, creased outline) and the right hand
// flicks it into the basket drawn on the floor. The same beats as the 3D stage (toss-beats.ts).
// No three.js here.
import type { EraId } from '../content/types'
import { css, mix, type Palette } from './palette'
import { TOSS, TOSS_AT, crumpleAtTime } from './toss-beats'

export interface Box {
  x: number
  y: number
  w: number
  h: number
}

/** One toss's own crumple: the jag of the ball's outline and where its creases fall. */
export interface Crumple2D {
  jag: number[]
  facets: { x: number; y: number; r: number; a: number; light: boolean }[]
  creases: { x0: number; y0: number; x1: number; y1: number }[]
}

const N = 22

export function planCrumple2D(seed: number): Crumple2D {
  let s = (seed >>> 0) || 1
  const rnd = () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
  return {
    jag: Array.from({ length: N }, () => rnd() * 2 - 1),
    facets: Array.from({ length: 30 }, () => ({ x: rnd() * 2 - 1, y: rnd() * 2 - 1, r: 0.18 + rnd() * 0.3, a: rnd() * Math.PI * 2, light: rnd() > 0.45 })),
    creases: Array.from({ length: 9 }, () => ({ x0: rnd() * 2 - 1, y0: rnd() * 2 - 1, x1: rnd() * 2 - 1, y1: rnd() * 2 - 1 })),
  }
}

/** The ball's radius on screen for a card this wide: about 7.5 cm against a 21 cm sheet. */
export const ballRadius = (cardW: number) => cardW * 0.19

const smooth = (k: number) => {
  const t = Math.min(1, Math.max(0, k))
  return t * t * (3 - 2 * t)
}

/** How far the sides are pushed in and how far it is a ball, at crumple k (as on the 3D stage). */
function stage2d(k: number): { sq: number; b: number } {
  return { sq: smooth(k / 0.8) * 0.6, b: Math.pow(smooth((k - 0.26) / 0.74), 1.15) }
}

/** Half the paper's width across the hands at crumple k. */
export function halfWidth2D(box: Box, k: number): number {
  const { sq, b } = stage2d(k)
  const sheet = (box.w / 2) * (1 - sq)
  return sheet + (ballRadius(box.w) - sheet) * b
}

/**
 * Draws the card at crumple k, centred at (cx, cy): squashed in from the sides along creases, then
 * gathered into a jagged ball; the card's own picture shows through, squeezed, under the facets.
 */
export function drawCrumpled(g: CanvasRenderingContext2D, card: CanvasImageSource | null, box: Box, cx: number, cy: number, k: number, twist: number, plan: Crumple2D, p: Palette): void {
  const { sq, b } = stage2d(k)
  const hw = (box.w / 2) * (1 - sq)
  const hh = (box.h / 2) * (1 - 0.5 * sq)
  const rb = ballRadius(box.w)
  g.save()
  g.translate(cx, cy)
  g.rotate(twist * 0.5)
  // the outline: the card's rectangle (buckling at its edges as it is squeezed) into a jagged ball
  g.beginPath()
  for (let i = 0; i < N; i++) {
    const th = (i / N) * Math.PI * 2
    const c = Math.cos(th)
    const s = Math.sin(th)
    const rect = Math.min(hw / Math.max(1e-4, Math.abs(c)), hh / Math.max(1e-4, Math.abs(s))) * (1 + sq * 0.08 * (plan.jag[i] ?? 0))
    const ball = rb * (1 + 0.2 * (plan.jag[i] ?? 0))
    const r = rect + (ball - rect) * b
    if (i === 0) g.moveTo(r * c, r * s)
    else g.lineTo(r * c, r * s)
  }
  g.closePath()
  g.save()
  g.shadowColor = 'rgba(0,0,0,0.4)'
  g.shadowBlur = 10
  g.shadowOffsetY = 5
  g.fillStyle = css(mix(p.paper, 0xffffff, 0.05))
  g.fill()
  g.restore()
  g.save()
  g.clip()
  // the card itself, squeezed into what is left of it
  const iw = hw * 2 + (rb * 2.6 - hw * 2) * b
  const ih = hh * 2 + (rb * 2.6 - hh * 2) * b
  if (card) {
    try {
      g.drawImage(card, -iw / 2, -ih / 2, iw, ih)
    } catch {
      /* a card that cannot be drawn leaves plain paper */
    }
  }
  // the creases: facets catching the lamp or falling into shade, thicker as it is screwed up
  const fold = Math.min(1, k * 1.7)
  const span = Math.max(hw, hh) + (rb - Math.max(hw, hh)) * b
  for (const f of plan.facets) {
    const x = f.x * span
    const y = f.y * span
    const r = f.r * span * (0.7 + 0.5 * b)
    g.beginPath()
    for (let j = 0; j < 3; j++) {
      const a = f.a + (j * Math.PI * 2) / 3 + j * 0.4
      g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r)
    }
    g.closePath()
    g.fillStyle = f.light ? `rgba(255,250,236,${(0.22 * fold).toFixed(3)})` : `rgba(70,46,26,${(0.26 * fold).toFixed(3)})`
    g.fill()
  }
  g.strokeStyle = `rgba(70,46,26,${(0.35 * fold).toFixed(3)})`
  g.lineWidth = Math.max(0.8, box.w / 220)
  for (const c of plan.creases) {
    g.beginPath()
    g.moveTo(c.x0 * span, c.y0 * span)
    g.lineTo(((c.x0 + c.x1) / 2 + 0.15) * span, ((c.y0 + c.y1) / 2 - 0.1) * span)
    g.lineTo(c.x1 * span, c.y1 * span)
    g.stroke()
  }
  // a ball is darker round its edge than at its middle, where the lamp catches it
  if (b > 0) {
    const shade = g.createRadialGradient(-rb * 0.3, -rb * 0.35, rb * 0.2, 0, 0, rb * 1.3)
    shade.addColorStop(0, 'rgba(255,248,230,0)')
    shade.addColorStop(1, `rgba(40,26,14,${(0.45 * b).toFixed(3)})`)
    g.fillStyle = shade
    g.fillRect(-span * 1.4, -span * 1.4, span * 2.8, span * 2.8)
  }
  g.restore()
  g.strokeStyle = `rgba(70,46,26,${(0.25 + 0.3 * fold).toFixed(3)})`
  g.lineWidth = 1
  g.stroke()
  g.restore()
}

// ---------------------------------------------------------------- the hands

/** The sleeves of each chapter's persona, drawn flat. */
const SLEEVE2D: Record<EraId, { cloth: number; band?: number; thread?: number; cuff?: number; rolled?: boolean }> = {
  'delhi-1857': { cloth: 0xefe8da, band: 0xc89b46, thread: 0x7b2531 },
  'lahore-1929': { cloth: 0xe5dbc5, thread: 0xab9e84 },
  'bombay-1942': { cloth: 0xd8caa8, rolled: true },
  'delhi-1947': { cloth: 0x30364a, cuff: 0xf2efe7 },
}
const SKIN2D = { back: 0x6c4632, palm: 0x9a7059, nail: 0xc39a86, line: 'rgba(36,18,8,0.55)' }

/**
 * One hand from above, its wrist at (x, y), the fingers pointing along `angle` (0 = straight up the
 * screen), its forearm and sleeve running back off the bottom of the screen. `side` 1 is the right
 * hand, -1 the left (mirrored). `curl` 0..1 folds the fingers over (they shorten as they curl).
 * `palm` shows the palm side instead of the back (the hand holding the ball up).
 */
export function drawHand2D(g: CanvasRenderingContext2D, x: number, y: number, len: number, angle: number, side: 1 | -1, curl: number, era: EraId, palm = false): void {
  const sl = SLEEVE2D[era]
  const L = len
  g.save()
  g.translate(x, y)
  g.rotate(angle)
  g.scale(side, 1)
  g.lineJoin = 'round'
  g.lineCap = 'round'
  // the forearm in its sleeve, back to the bottom of the screen (and well past it)
  const arm = (y0: number, y1: number, w0: number, w1: number, fill: string | CanvasGradient) => {
    g.beginPath()
    g.moveTo(-w0, y0)
    g.lineTo(-w1, y1)
    g.lineTo(w1, y1)
    g.lineTo(w0, y0)
    g.closePath()
    g.fillStyle = fill
    g.fill()
    g.strokeStyle = 'rgba(30,18,10,0.35)'
    g.lineWidth = 1
    g.stroke()
  }
  const shadeDown = (hex: number, y0: number, y1: number) => {
    const grd = g.createLinearGradient(0, y0, 0, y1)
    grd.addColorStop(0, css(hex))
    grd.addColorStop(1, css(mix(hex, 0x000000, 0.7)))
    return grd
  }
  if (sl.rolled) {
    arm(0.02 * L, 0.42 * L, 0.15 * L, 0.17 * L, css(SKIN2D.back))
    arm(0.4 * L, 3 * L, 0.19 * L, 0.23 * L, shadeDown(sl.cloth, 0.4 * L, 1.3 * L))
    // the roll of khadi
    g.beginPath()
    g.ellipse(0, 0.42 * L, 0.215 * L, 0.06 * L, 0, 0, Math.PI * 2)
    g.fillStyle = css(mix(sl.cloth, 0xffffff, 0.08))
    g.fill()
    g.strokeStyle = 'rgba(60,44,24,0.45)'
    g.stroke()
  } else if (sl.cuff !== undefined) {
    arm(0.12 * L, 3 * L, 0.2 * L, 0.24 * L, shadeDown(sl.cloth, 0.12 * L, 1.3 * L))
    // the white shirt cuff and its button
    arm(0.0, 0.14 * L, 0.165 * L, 0.17 * L, css(sl.cuff))
    g.beginPath()
    g.arc(0.12 * L, 0.07 * L, 0.018 * L, 0, Math.PI * 2)
    g.fillStyle = '#d8cdb8'
    g.fill()
  } else {
    arm(0.0, 3 * L, 0.185 * L, 0.23 * L, shadeDown(sl.cloth, 0, 1.3 * L))
    if (sl.band !== undefined) arm(0.0, 0.06 * L, 0.19 * L, 0.192 * L, css(sl.band))
    if (sl.thread !== undefined) {
      g.strokeStyle = css(sl.thread, 0.9)
      g.lineWidth = Math.max(1, 0.012 * L)
      g.beginPath()
      g.moveTo(-0.19 * L, 0.075 * L)
      g.lineTo(0.19 * L, 0.075 * L)
      g.stroke()
    }
  }
  const skin = css(palm ? SKIN2D.palm : SKIN2D.back)
  g.fillStyle = skin
  g.strokeStyle = SKIN2D.line
  g.lineWidth = Math.max(1, 0.012 * L)
  // the thumb, on the inner side
  const finger = (fx: number, fy: number, a: number, l: number, w: number) => {
    g.save()
    g.translate(fx, fy)
    g.rotate(a)
    g.beginPath()
    g.moveTo(-w / 2, 0)
    g.lineTo(-w / 2, -l + w / 2)
    g.arc(0, -l + w / 2, w / 2, Math.PI, 0)
    g.lineTo(w / 2, 0)
    g.closePath()
    g.fill()
    g.stroke()
    if (!palm && curl < 0.55) {
      // the nail
      g.beginPath()
      g.ellipse(0, -l + w * 0.62, w * 0.28, w * 0.36, 0, 0, Math.PI * 2)
      g.fillStyle = css(SKIN2D.nail)
      g.fill()
      g.fillStyle = skin
    }
    g.restore()
  }
  finger(-0.16 * L, -0.16 * L, -0.75 + 0.5 * curl, 0.32 * L * (1 - 0.3 * curl), 0.115 * L)
  // the back of the hand
  g.beginPath()
  g.moveTo(-0.15 * L, 0.02 * L)
  g.quadraticCurveTo(-0.23 * L, -0.28 * L, -0.2 * L, -0.5 * L)
  g.lineTo(0.2 * L, -0.48 * L)
  g.quadraticCurveTo(0.22 * L, -0.2 * L, 0.15 * L, 0.02 * L)
  g.closePath()
  g.fill()
  g.stroke()
  // four fingers, fanned a little, shortening as they fold over
  const fold = 1 - 0.58 * curl
  const fingers: [number, number, number][] = [[-0.14, 0.4, -0.06], [-0.047, 0.44, -0.02], [0.047, 0.41, 0.02], [0.14, 0.33, 0.07]]
  for (const [fx, fl, fa] of fingers) finger(fx * L, -0.47 * L, fa * (1 - curl), fl * L * fold, 0.1 * L)
  if (!palm) {
    // the knuckles
    g.strokeStyle = 'rgba(36,18,8,0.3)'
    for (const [fx] of fingers) {
      g.beginPath()
      g.arc(fx * L, -0.47 * L, 0.03 * L, Math.PI * 1.1, Math.PI * 1.9)
      g.stroke()
    }
  }
  g.restore()
}

// ---------------------------------------------------------------- the whole toss, frame by frame

export interface Toss2D {
  from: Box
  card: CanvasImageSource | null
  plan: Crumple2D
  era: EraId
  /** Where the ball drops into the basket, and the basket's radius on screen. */
  basket: { x: number; y: number; r: number }
}

const lerp = (a: number, b: number, k: number) => a + (b - a) * k
const inOut = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2)

/** Where the ball is (and how big) during the toss, after the crumple: rolled, cocked, flicked, flown. */
function ballAt(t: Toss2D, e: number, H: number): { x: number; y: number; s: number; rot: number } {
  const f = t.from
  const cx = f.x + f.w / 2
  const cy = f.y + f.h / 2 - H * 0.03
  const b1 = { x: cx + f.w * 0.06, y: cy + f.w * 0.04 }
  const b2 = { x: b1.x - f.w * 0.08, y: b1.y + f.w * 0.1 }
  const b3 = { x: b1.x + f.w * 0.22, y: b1.y - f.w * 0.2 }
  if (e < TOSS_AT.roll) return { x: cx, y: cy, s: 1, rot: 0 }
  if (e < TOSS_AT.windup) {
    const k = inOut((e - TOSS_AT.roll) / TOSS.roll)
    return { x: lerp(cx, b1.x, k), y: lerp(cy, b1.y, k), s: 1, rot: 0 }
  }
  if (e < TOSS_AT.flick) {
    const k = inOut((e - TOSS_AT.windup) / TOSS.windup)
    return { x: lerp(b1.x, b2.x, k), y: lerp(b1.y, b2.y, k), s: 1, rot: 0 }
  }
  if (e < TOSS_AT.release) {
    const k = Math.pow((e - TOSS_AT.flick) / TOSS.flick, 3)
    return { x: lerp(b2.x, b3.x, k), y: lerp(b2.y, b3.y, k), s: 1, rot: 0 }
  }
  // the arc: up over the desk's edge and down into the basket, turning as it goes, smaller with distance
  const k = Math.min(1, (e - TOSS_AT.release) / TOSS.fly)
  const bx = t.basket.x
  const by = t.basket.y + t.basket.r * 0.12
  const c1 = { x: lerp(b3.x, bx, 0.3), y: b3.y - H * 0.12 }
  const c2 = { x: bx, y: by - H * 0.24 }
  const u = 1 - k
  const x = u * u * u * b3.x + 3 * u * u * k * c1.x + 3 * u * k * k * c2.x + k * k * k * bx
  const y = u * u * u * b3.y + 3 * u * u * k * c1.y + 3 * u * k * k * c2.y + k * k * k * by
  const end = (t.basket.r * 0.42) / Math.max(1, ballRadius(f.w))
  return { x, y, s: lerp(1, end, Math.pow(k, 0.8)), rot: k * Math.PI * 3 }
}

/**
 * One frame of the toss at `e` ms: the hands, the paper being screwed up, the ball in flight. The
 * caller draws the still under it and the basket's front over the ball once it drops in.
 */
export function drawToss2D(g: CanvasRenderingContext2D, W: number, H: number, t: Toss2D, e: number, p: Palette): void {
  const f = t.from
  const cx = f.x + f.w / 2
  const cy0 = f.y + f.h / 2
  const L = Math.min(f.w * 0.8, W * 0.42)
  const { k, twist, press } = crumpleAtTime(e)
  // the paper lifts toward you as it is picked up
  const lift = smooth((e - TOSS_AT.squeezes[0]!) / 300) * H * 0.03
  const cy = cy0 - lift
  const hw = halfWidth2D(f, k)
  // the hands come in from the bottom of the screen
  const reach = inOut(Math.min(1, Math.max(0, (e - TOSS_AT.reach) / TOSS.reach)))
  const offY = H - cy + L * 0.6
  const grip = (side: 1 | -1) => ({
    x: cx + side * (hw + L * 0.1 - press * L * 0.015),
    y: cy + L * 0.42 + (1 - reach) * offY,
    a: side * (-0.55 + 0.25 * k),
  })
  const curl = 0.2 + 0.45 * k + 0.1 * press
  const ball = ballAt(t, e, H)
  const inHands = e < TOSS_AT.release
  // the left hand lets go and goes back down
  const leftOut = smooth((e - TOSS_AT.roll) / TOSS.roll)
  // the right hand: holding, then under the ball, then the flick, then gone
  const rightOut = smooth((e - TOSS_AT.release) / (TOSS.fly * 0.3))
  if (inHands || e < TOSS_AT.release + TOSS.fly) {
    if (e < TOSS_AT.roll) {
      drawCrumpled(g, t.card, f, cx, cy, k, twist, t.plan, p)
    } else if (e < TOSS_AT.land) {
      g.save()
      g.translate(ball.x, ball.y)
      g.rotate(ball.rot)
      g.scale(ball.s, ball.s)
      drawCrumpled(g, t.card, f, 0, 0, 1, 0, t.plan, p)
      g.restore()
    }
  }
  if (e < TOSS_AT.roll + TOSS.roll) {
    const l = grip(-1)
    drawHand2D(g, l.x, l.y + leftOut * offY, L, l.a, -1, curl * (1 - leftOut * 0.7), t.era)
  }
  if (e < TOSS_AT.release + TOSS.fly * 0.3) {
    if (e < TOSS_AT.roll) {
      const r = grip(1)
      drawHand2D(g, r.x, r.y, L, r.a, 1, curl, t.era)
    } else {
      // palm up under the ball, cupped round it; after the flick it drops away
      const turn = smooth((e - TOSS_AT.roll) / TOSS.roll)
      const r = grip(1)
      const hx = lerp(r.x, ball.x + L * 0.04, turn)
      const hy = lerp(r.y, ball.y + L * 0.5, turn) + rightOut * offY
      const after = e >= TOSS_AT.release
      drawHand2D(g, after ? hx + rightOut * L * 0.2 : hx, hy, L, lerp(r.a, after ? 0.25 : -0.1, turn), 1, after ? 0.2 : 0.55, t.era, turn > 0.5)
    }
  }
}

/** The ball is in the flight's last stretch: the basket's front is drawn over it from here. */
export const dropping = (e: number) => e >= TOSS_AT.release + TOSS.fly * 0.7

/** The read papers in the basket, as screwed-up balls whose tops show over the rim. */
export function drawBasketBalls(g: CanvasRenderingContext2D, b: { x: number; y: number; r: number }, ry: number, n: number, p: Palette): void {
  const count = Math.min(n, 9)
  const r = b.r * 0.27
  for (let i = 0; i < count; i++) {
    const row = i < 4 ? 0 : i < 7 ? 1 : 2
    const inRow = row === 0 ? i : row === 1 ? i - 4 : i - 7
    const per = row === 0 ? 4 : row === 1 ? 3 : 2
    const x = b.x + (inRow - (per - 1) / 2) * r * 1.55 + (row % 2) * r * 0.2
    const y = b.y + ry * 0.35 - row * r * 0.55
    g.save()
    g.translate(x, y)
    g.rotate(i * 1.3)
    const grd = g.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.15, 0, 0, r * 1.1)
    grd.addColorStop(0, css(mix(p.paper, 0xffffff, 0.12)))
    grd.addColorStop(1, css(mix(p.paper, p.shade, 0.45)))
    g.fillStyle = grd
    g.beginPath()
    for (let j = 0; j < 9; j++) {
      const a = (j / 9) * Math.PI * 2
      const rr = r * (0.88 + 0.16 * Math.sin(j * 2.7 + i))
      g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr)
    }
    g.closePath()
    g.fill()
    g.strokeStyle = css(p.ink, 0.3)
    g.lineWidth = 1
    g.stroke()
    // a crease or two
    g.beginPath()
    g.moveTo(-r * 0.5, -r * 0.1)
    g.lineTo(r * 0.05, r * 0.15)
    g.lineTo(r * 0.45, -r * 0.3)
    g.stroke()
    g.restore()
  }
}
