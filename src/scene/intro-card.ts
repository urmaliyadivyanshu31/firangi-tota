// The two intro cards after Begin, drawn into 2D canvases: YOU, a buff dossier card with a
// portrait print held by a paper clip, and THE TOTA, a police notice with the portrait printed on
// it and a green parrot stamp that winks. The 3D stage and the 2D fallback both use these, so the
// cards read the same everywhere. No three.js here.
import type { Lang } from '../content/types'
import { mulberry32, seedFrom } from '../game/rng'
import { FACE, loadSheetFonts } from './sheet'
import type { IntroCard, IntroSpec } from './types'

type Ctx = CanvasRenderingContext2D
/** A portrait, once it has loaded. */
export type Art = HTMLImageElement

/** The cards' height over their width on a wide screen. */
export const CARD_ASPECT = 0.68
/**
 * The cards' height over their width for a screen of this shape. A phone is width-bound and has
 * height to spare, so its cards are taller: more room for the line, set bigger.
 */
export function cardAspect(screenAspect: number): number {
  return screenAspect < 0.9 ? 0.8 : CARD_ASPECT
}
/** The size unit for headings: the height of a wide-screen card, so taller cards keep their type. */
const unit = (W: number, H: number) => Math.min(H, W * CARD_ASPECT)
/** The photo print's white border, as a share of its width. */
const PRINT_EDGE = 0.055

// ---------------------------------------------------------------- the portraits

const arts = new Map<string, Promise<Art | null>>()
const ready = new Map<string, Art>()

/**
 * Starts loading a portrait (once per URL) and resolves with it, or with null when it cannot load.
 * A failed load is forgotten, so a later Begin tries again. Never rejects.
 */
export function loadArt(url: string): Promise<Art | null> {
  const hit = arts.get(url)
  if (hit) return hit
  const p = new Promise<Art | null>((resolve) => {
    if (typeof Image === 'undefined') return resolve(null)
    const img = new Image()
    img.decoding = 'async'
    const fail = () => {
      arts.delete(url)
      resolve(null)
    }
    img.onload = () => {
      ready.set(url, img)
      resolve(img)
    }
    img.onerror = fail
    try {
      img.src = url
    } catch {
      fail()
    }
  })
  arts.set(url, p)
  return p
}

/** The portrait if it has already loaded, else null (the card shows an empty mount until it does). */
export function artFor(url: string): Art | null {
  return ready.get(url) ?? null
}

/**
 * The faces and both portraits for `s`. Resolves when all are in or after `capMs`, whichever is
 * first; `late` runs if they arrive after the cap, so the cards can be drawn again.
 */
export function introReady(s: IntroSpec, capMs: number, late: () => void): Promise<void> {
  const all = Promise.all([loadSheetFonts(s.lang, 0), loadArt(s.you.art), loadArt(s.tota.art)])
  let capped = false
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      capped = true
      resolve()
    }, capMs)
    void all.then(() => {
      clearTimeout(timer)
      if (capped) late()
      resolve()
    })
  })
}

// ---------------------------------------------------------------- text

const font = (face: string, size: number, weight = '') => `${weight ? `${weight} ` : ''}${Math.max(1, Math.round(size * 10) / 10)}px ${face}`

/** "a munshi in …" reads as a caption under a heading: start it with a capital in English. */
export function captionOf(line: string, lang: Lang): string {
  return lang === 'en' && line ? line.charAt(0).toLocaleUpperCase('en') + line.slice(1) : line
}

/** Greedy wrap on spaces; a word too wide for the line may also break after its hyphens. */
function words(g: Ctx, text: string, maxW: number): string[] {
  const toks: { t: string; glued: boolean }[] = []
  for (const w of text.split(/\s+/).filter(Boolean)) {
    // (split and re-hyphenate: a lookbehind would not parse on older Safari)
    const parts = g.measureText(w).width > maxW && w.includes('-') ? w.split('-').map((p, i, a) => (i < a.length - 1 ? `${p}-` : p)).filter(Boolean) : [w]
    parts.forEach((t, i) => toks.push({ t, glued: i > 0 }))
  }
  const out: string[] = []
  let cur = ''
  for (const { t, glued } of toks) {
    const next = cur ? (glued ? cur + t : `${cur} ${t}`) : t
    if (cur && g.measureText(next).width > maxW) {
      out.push(cur)
      cur = t
    } else cur = next
  }
  if (cur) out.push(cur)
  return out
}

/** Sets `text` in the box at the largest size from `max` down to `min` that fits; returns the lines drawn. */
function fitText(g: Ctx, text: string, box: { x: number; y: number; w: number; h: number }, o: { face: string; max: number; min: number; lead: number; color: string; align?: 'left' | 'center' }): string[] {
  let size = o.max
  let lines: string[] = []
  for (;;) {
    g.font = font(o.face, size)
    lines = words(g, text, box.w)
    const fits = lines.length * size * o.lead <= box.h && lines.every((l) => g.measureText(l).width <= box.w)
    if (fits || size <= o.min) break
    size = Math.max(o.min, size * 0.93)
  }
  g.fillStyle = o.color
  g.textBaseline = 'alphabetic'
  g.textAlign = o.align ?? 'left'
  const x = o.align === 'center' ? box.x + box.w / 2 : box.x
  lines.forEach((l, i) => g.fillText(l, x, box.y + size * (0.86 + i * o.lead)))
  return lines
}

/** Letter-spaced capitals (canvas letterSpacing is not everywhere yet), centred on cx; `stroke` thickens them. */
function spaced(g: Ctx, text: string, cx: number, y: number, track: number, stroke = false): void {
  const chars = [...text]
  const total = chars.reduce((n, ch) => n + g.measureText(ch).width, 0) + track * (chars.length - 1)
  let x = cx - total / 2
  g.textAlign = 'left'
  for (const ch of chars) {
    g.fillText(ch, x, y)
    if (stroke) g.strokeText(ch, x, y)
    x += g.measureText(ch).width + track
  }
}

const isDeva = (t: string) => /[ऀ-ॿ]/.test(t)

// ---------------------------------------------------------------- paper

/** Handmade card: a base colour, a soft light from the top left, mottling and fibres. */
function paperGround(g: Ctx, W: number, H: number, base: string, seed: string, ink: string): void {
  g.fillStyle = base
  g.fillRect(0, 0, W, H)
  const light = g.createRadialGradient(W * 0.2, H * 0.1, 0, W * 0.2, H * 0.1, W * 1.1)
  light.addColorStop(0, 'rgba(255,248,228,0.32)')
  light.addColorStop(1, 'rgba(255,248,228,0)')
  g.fillStyle = light
  g.fillRect(0, 0, W, H)
  const rng = mulberry32(seedFrom(seed))
  for (let i = 0; i < 70; i++) {
    const r = W * (0.02 + rng() * 0.08)
    g.fillStyle = `rgba(${ink},${(0.012 + rng() * 0.03).toFixed(3)})`
    g.beginPath()
    g.ellipse(rng() * W, rng() * H, r, r * (0.5 + rng() * 0.5), rng() * 3, 0, Math.PI * 2)
    g.fill()
  }
  g.strokeStyle = `rgba(${ink},0.08)`
  g.lineWidth = Math.max(1, W / 900)
  for (let i = 0; i < 90; i++) {
    const x = rng() * W
    const y = rng() * H
    const a = rng() * Math.PI
    const l = W * (0.008 + rng() * 0.025)
    g.beginPath()
    g.moveTo(x, y)
    g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l)
    g.stroke()
  }
  // the edges darken a touch, as handled card does
  const edge = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.45, W / 2, H / 2, Math.max(W, H) * 0.72)
  edge.addColorStop(0, `rgba(${ink},0)`)
  edge.addColorStop(1, `rgba(${ink},0.2)`)
  g.fillStyle = edge
  g.fillRect(0, 0, W, H)
}

/** The portrait drawn to cover a box (centred, cropped), or nothing when it has not loaded. */
function cover(g: Ctx, img: Art | null, x: number, y: number, w: number, h: number): void {
  if (!img || !img.naturalWidth) return
  const s = Math.max(w / img.naturalWidth, h / img.naturalHeight)
  const sw = w / s
  const sh = h / s
  try {
    g.drawImage(img, (img.naturalWidth - sw) / 2, (img.naturalHeight - sh) * 0.35, sw, sh, x, y, w, h)
  } catch {
    /* a broken image never breaks the card */
  }
}

// ---------------------------------------------------------------- YOU: the dossier card

/** The buff dossier card under the YOU photo: a pasted label with the heading and the line in ink. */
export function drawYouCard(g: Ctx, W: number, H: number, c: IntroCard, lang: Lang): void {
  g.save()
  paperGround(g, W, H, '#c9a666', 'intro-you', '92,62,24')
  // the folder's crease along the top
  g.fillStyle = 'rgba(110,74,30,0.18)'
  g.fillRect(0, 0, W, H * 0.055)
  g.strokeStyle = 'rgba(96,64,28,0.4)'
  g.lineWidth = Math.max(1, W / 600)
  g.beginPath()
  g.moveTo(0, H * 0.055)
  g.lineTo(W, H * 0.055)
  g.stroke()
  const u = unit(W, H)
  // the photo's soft shadow on the card (the print itself is a separate piece of paper)
  const p = photoRect(W, H)
  g.fillStyle = 'rgba(50,30,10,0.18)'
  g.fillRect(p.x + W * 0.006, p.y + W * 0.008, p.w, p.h)
  // a cream label pasted on, a hair askew, with the heading
  const deva = lang === 'hi' || isDeva(c.label)
  const lx = W * 0.445
  const lw = W * 0.47
  const ly = H * 0.055 + u * 0.075
  const lh = u * 0.2
  g.save()
  g.translate(lx + lw / 2, ly + lh / 2)
  g.rotate(-0.012)
  g.fillStyle = 'rgba(60,36,12,0.22)'
  g.fillRect(-lw / 2 + W * 0.004, -lh / 2 + W * 0.005, lw, lh)
  g.fillStyle = '#f2e7cc'
  g.fillRect(-lw / 2, -lh / 2, lw, lh)
  g.strokeStyle = 'rgba(125,31,44,0.55)'
  g.lineWidth = Math.max(1, W / 700)
  g.strokeRect(-lw / 2 + W * 0.01, -lh / 2 + W * 0.01, lw - W * 0.02, lh - W * 0.02)
  g.fillStyle = '#7d1f2c'
  g.textBaseline = 'middle'
  if (deva) {
    g.font = font(FACE.deva, lh * 0.62)
    g.textAlign = 'center'
    g.fillText(c.label, 0, lh * 0.04)
  } else {
    g.font = font(FACE.print, lh * 0.56)
    spaced(g, c.label.toLocaleUpperCase('en'), 0, lh * 0.04, lh * 0.14)
  }
  g.restore()
  // the line, in ink, under the label
  const ty = ly + lh + u * 0.05
  fitText(g, captionOf(c.line, lang), { x: W * 0.455, y: ty, w: W * 0.48, h: H * 0.95 - ty }, {
    face: deva ? FACE.deva : FACE.print, max: W * 0.06, min: W * 0.043, lead: deva ? 1.4 : 1.24, color: '#2b1d13',
  })
  g.restore()
}

/** The YOU photo's place on its card (in the card's own units: px, or metres in 3D): a 3:4 print with its border, centred down the left. */
export function photoRect(W: number, H: number): { x: number; y: number; w: number; h: number } {
  const w = W * 0.34
  const h = Math.min(w * 1.32, H * 0.76)
  return { x: W * 0.045, y: H * 0.03 + (H - h) / 2, w, h }
}

/** The portrait print: a white deckled border round the picture (an empty mount until it loads). */
export function drawPhotoPrint(g: Ctx, W: number, H: number, img: Art | null): void {
  g.save()
  g.fillStyle = '#f3eddd'
  g.fillRect(0, 0, W, H)
  const e = W * PRINT_EDGE
  g.fillStyle = '#e9dfc7'
  g.fillRect(e, e, W - 2 * e, H - 2 * e)
  cover(g, img, e, e, W - 2 * e, H - 2 * e)
  // a faint silvering at the picture's edge, and the print's own edge
  g.strokeStyle = 'rgba(60,40,20,0.35)'
  g.lineWidth = Math.max(1, W / 300)
  g.strokeRect(e, e, W - 2 * e, H - 2 * e)
  g.strokeStyle = 'rgba(120,100,70,0.45)'
  g.strokeRect(0.5, 0.5, W - 1, H - 1)
  g.restore()
}

// ---------------------------------------------------------------- THE TOTA: the police notice

/** The parrot mark, after the game's own (src/ui/icons.ts), as path data in a 96-unit box. */
const PARROT = {
  tail: 'M43 71C40 80 35 88 28.5 95l6.5.6C41.5 89 46 81 48.5 73.5z',
  body: 'M46 42c-8 6-11 18-7 27 3 6 10 8 15 5 6-4 8-14 7-23-1-6-8-11-15-9z',
  wing: 'M47 49c-7 6-9 18-6 30 5-2 10-9 11-17 0-6-2-10-5-13z',
  beak: 'M65 31.5c8-1.5 13.5 3.5 11.5 12-2-3.2-5.4-4.6-11-4.2z',
  dome: 'M39.5 24.5c0-16.5 31-16.5 31 0z',
  band: 'M39.8 21.2c9.2-2 21.2-2 30.4 0l.2 3.2c-9.4-1.8-21.4-1.8-30.8 0z',
}

/** The Tota's green rubber stamp: a ringed parrot in its sola topi. `wink` closes its eye. */
export function drawParrotStamp(g: Ctx, cx: number, cy: number, r: number, wink: boolean, paper: string): void {
  const ink = 'rgba(29,116,54,0.88)'
  g.save()
  g.translate(cx, cy)
  g.rotate(-0.16)
  g.strokeStyle = ink
  g.fillStyle = ink
  g.lineWidth = r * 0.07
  g.beginPath()
  g.arc(0, 0, r, 0, Math.PI * 2)
  g.stroke()
  g.lineWidth = r * 0.025
  g.beginPath()
  g.arc(0, 0, r * 0.86, 0, Math.PI * 2)
  g.stroke()
  if (typeof Path2D !== 'undefined') {
    const s = (r * 1.5) / 96
    g.save()
    g.translate(-48 * s - r * 0.02, -50 * s)
    g.scale(s, s)
    g.fill(new Path2D(PARROT.tail))
    g.fill(new Path2D(PARROT.body))
    g.beginPath()
    g.arc(55, 35, 13.5, 0, Math.PI * 2)
    g.fill()
    g.fill(new Path2D(PARROT.beak))
    g.save()
    g.translate(55, 22)
    g.rotate((-9 * Math.PI) / 180)
    g.translate(-55, -22)
    g.beginPath()
    g.ellipse(55, 25, 21, 4.6, 0, 0, Math.PI * 2)
    g.fill()
    g.fill(new Path2D(PARROT.dome))
    g.fillStyle = paper
    g.fill(new Path2D(PARROT.band))
    g.restore()
    // the wing and the perch in paper, so the ink reads as a cut block
    g.strokeStyle = paper
    g.lineWidth = 1.6
    g.stroke(new Path2D(PARROT.wing))
    g.strokeStyle = ink
    g.lineWidth = 3.4
    g.beginPath()
    g.moveTo(22, 77)
    g.lineTo(74, 77)
    g.stroke()
    // the eye: open, or a closed lid for the wink
    g.fillStyle = paper
    g.strokeStyle = paper
    if (wink) {
      g.lineWidth = 1.8
      g.beginPath()
      g.arc(61, 32.2, 3.1, 0.15 * Math.PI, 0.85 * Math.PI)
      g.stroke()
    } else {
      g.beginPath()
      g.arc(61, 33, 3.3, 0, Math.PI * 2)
      g.fill()
      g.fillStyle = ink
      g.beginPath()
      g.arc(61.7, 33.1, 1.7, 0, Math.PI * 2)
      g.fill()
    }
    g.restore()
  }
  // a little wear in the ink, the same every time
  const rng = mulberry32(17)
  g.fillStyle = paper
  for (let i = 0; i < 26; i++) {
    const a = rng() * Math.PI * 2
    const d = r * (0.2 + rng() * 0.85)
    g.globalAlpha = 0.35 + rng() * 0.4
    g.beginPath()
    g.arc(Math.cos(a) * d, Math.sin(a) * d, r * (0.012 + rng() * 0.03), 0, Math.PI * 2)
    g.fill()
  }
  g.restore()
}

/** The police notice: a ruled border, the heading in poster type, the portrait printed in, the line and the stamp. */
export function drawTotaCard(g: Ctx, W: number, H: number, c: IntroCard, lang: Lang, img: Art | null, wink = false): void {
  const paper = '#ece0c1'
  g.save()
  paperGround(g, W, H, paper, 'intro-tota', '74,54,30')
  // the printed border: a heavy rule and a fine one inside it
  const ink = '#221811'
  g.strokeStyle = ink
  g.lineWidth = W * 0.008
  const o = W * 0.03
  g.strokeRect(o, o, W - 2 * o, H - 2 * o)
  g.lineWidth = Math.max(1, W * 0.0022)
  const i2 = W * 0.043
  g.strokeRect(i2, i2, W - 2 * i2, H - 2 * i2)
  // small printer's flowers in the corners
  g.fillStyle = '#9c2a1d'
  for (const [x, y] of [[i2, i2], [W - i2, i2], [i2, H - i2], [W - i2, H - i2]] as const) {
    g.beginPath()
    g.arc(x, y, W * 0.007, 0, Math.PI * 2)
    g.fill()
  }
  // the heading, big, in poster type, with a red double rule under it
  const deva = lang === 'hi' || isDeva(c.label)
  const u = unit(W, H)
  g.fillStyle = ink
  g.textBaseline = 'alphabetic'
  if (deva) {
    g.font = font(FACE.sans, u * 0.15, '600')
    g.textAlign = 'center'
    g.fillText(c.label, W / 2, u * 0.205)
  } else {
    // a Victorian notice face, its strokes thickened the way an inked forme prints
    g.font = font(FACE.print, u * 0.15)
    g.strokeStyle = ink
    g.lineWidth = u * 0.009
    g.lineJoin = 'round'
    spaced(g, c.label.toLocaleUpperCase('en'), W / 2, u * 0.205, u * 0.032, true)
  }
  g.fillStyle = '#9c2a1d'
  g.fillRect(W * 0.08, u * 0.245, W * 0.84, Math.max(1, u * 0.008))
  g.fillRect(W * 0.08, u * 0.262, W * 0.84, Math.max(1, u * 0.0035))
  // the portrait, printed into the notice inside a fine rule
  const px = W * 0.072
  const py = u * 0.31
  const pw = W * 0.32
  const ph = H - u * 0.09 - py
  g.fillStyle = '#e2d4b2'
  g.fillRect(px, py, pw, ph)
  cover(g, img, px, py, pw, ph)
  // the press laid the picture into the paper: a little of the paper's warmth over it
  g.fillStyle = 'rgba(236,224,193,0.12)'
  g.fillRect(px, py, pw, ph)
  g.strokeStyle = ink
  g.lineWidth = Math.max(1, W * 0.003)
  g.strokeRect(px, py, pw, ph)
  // the line beside it, clear of the stamp below
  const sr = u * 0.13 // the stamp, bottom right, under the line
  const sy = H - u * 0.215
  fitText(g, captionOf(c.line, lang), { x: W * 0.43, y: u * 0.32, w: W * 0.49, h: sy - sr - u * 0.02 - u * 0.32 }, {
    face: deva ? FACE.deva : FACE.print, max: W * 0.06, min: W * 0.043, lead: deva ? 1.4 : 1.24, color: ink,
  })
  drawParrotStamp(g, W * 0.795, sy, sr, wink, paper)
  g.restore()
}

// ---------------------------------------------------------------- the paper clip

/**
 * A gem paper clip's wire as a polyline, in millimetres: x across (0..8), y along (0..32). The
 * outer loop first, then the inner one; the free end of the inner loop is the last point.
 */
export function clipPath(): [number, number][] {
  const pts: [number, number][] = []
  const line = (x0: number, y0: number, x1: number, y1: number, n: number) => {
    for (let i = 0; i < n; i++) pts.push([x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n])
  }
  const arc = (cx: number, cy: number, r: number, a0: number, a1: number, n: number) => {
    for (let i = 0; i < n; i++) {
      const a = a0 + ((a1 - a0) * i) / n
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r])
    }
  }
  line(1, 9, 1, 28, 4)
  arc(4, 28, 3, Math.PI, 0, 8)
  line(7, 28, 7, 4, 5)
  arc(4.75, 4, 2.25, 0, -Math.PI, 8)
  line(2.5, 4, 2.5, 24, 4)
  arc(4.25, 24, 1.75, Math.PI, 0, 7)
  line(6, 24, 6, 11, 3)
  pts.push([6, 11])
  return pts
}

/** Where along its length (mm) the clip crosses the photo's top edge: a third rests on the card above. */
export const CLIP_EDGE = 22
/** The clip is drawn this much larger than a real 32 mm gem clip, so it reads on a phone. */
export const CLIP_SCALE = 1.3

/**
 * The clip in 2D (the flat desk): steel wire with a highlight. (x, y) is where it crosses the
 * photo's top edge; `mm` is px per millimetre.
 */
export function drawClip2d(g: Ctx, x: number, y: number, mm: number, rot = 0): void {
  const pts = clipPath()
  g.save()
  g.translate(x, y)
  g.rotate(rot)
  g.translate(0, CLIP_EDGE * mm)
  const path = () => {
    g.beginPath()
    pts.forEach(([px, py], i) => (i ? g.lineTo((px - 4) * mm, -py * mm) : g.moveTo((px - 4) * mm, -py * mm)))
  }
  g.lineJoin = 'round'
  g.lineCap = 'round'
  g.strokeStyle = 'rgba(30,24,18,0.35)'
  g.lineWidth = mm * 1.25
  g.translate(mm * 0.5, mm * 0.6)
  path()
  g.stroke()
  g.translate(-mm * 0.5, -mm * 0.6)
  g.strokeStyle = '#8e9396'
  g.lineWidth = mm * 1.05
  path()
  g.stroke()
  g.strokeStyle = 'rgba(240,244,246,0.75)'
  g.lineWidth = mm * 0.35
  path()
  g.stroke()
  g.restore()
}

// ---------------------------------------------------------------- the spread on the flat desk

/**
 * Both cards for the 2D fallback, as big as the free box allows: stacked on a tall screen, side by
 * side on a wide one. `k` (0..1) fades and lifts them in.
 */
export function drawIntroSpread(g: Ctx, box: { x: number; y: number; w: number; h: number }, s: IntroSpec, k: number, lift: boolean): { x: number; y: number; w: number; h: number } {
  const portrait = box.h > box.w
  const ca = cardAspect(box.w / box.h)
  const gap = Math.min(box.w, box.h) * 0.04
  let cw: number
  if (portrait) cw = Math.min(box.w * 0.96, (box.h * 0.96 - gap) / 2 / ca)
  else cw = Math.min((box.w * 0.82 - gap) / 2, (box.h * 0.9) / ca)
  const ch = cw * ca
  const cx = box.x + box.w / 2
  const cy = box.y + box.h / 2
  const places = portrait
    ? [{ x: cx - cw * 0.02, y: cy - ch / 2 - gap / 2, rot: -0.025 }, { x: cx + cw * 0.025, y: cy + ch / 2 + gap / 2, rot: 0.02 }]
    : [{ x: cx - cw / 2 - gap / 2, y: cy - ch * 0.02, rot: -0.025 }, { x: cx + cw / 2 + gap / 2, y: cy + ch * 0.03, rot: 0.02 }]
  const you = artFor(s.you.art)
  const tota = artFor(s.tota.art)
  places.forEach((pl, i) => {
    const kk = Math.max(0, Math.min(1, k * 1.6 - i * 0.6))
    if (kk <= 0) return
    g.save()
    g.globalAlpha = kk
    g.translate(pl.x, pl.y + (lift ? (1 - kk) * ch * 0.08 : 0))
    g.rotate(pl.rot)
    g.translate(-cw / 2, -ch / 2)
    g.shadowColor = 'rgba(0,0,0,0.45)'
    g.shadowBlur = cw * 0.04
    g.shadowOffsetY = cw * 0.012
    g.fillStyle = '#d8c6a0'
    g.fillRect(0, 0, cw, ch)
    g.shadowColor = 'rgba(0,0,0,0)'
    g.shadowBlur = 0
    g.shadowOffsetY = 0
    if (i === 0) {
      drawYouCard(g, cw, ch, s.you, s.lang)
      const p = photoRect(cw, ch)
      g.save()
      g.translate(p.x + p.w / 2, p.y + p.h / 2)
      g.rotate(-0.03)
      g.translate(-p.w / 2, -p.h / 2)
      drawPhotoPrint(g, p.w, p.h, you)
      g.restore()
      drawClip2d(g, p.x + p.w * 0.64, p.y, (cw / 200) * CLIP_SCALE, 0.03)
    } else {
      drawTotaCard(g, cw, ch, s.tota, s.lang, tota)
    }
    g.restore()
  })
  // where the pair lies (upright boxes; the turn is a hair), for the Continue slip under it
  const xs = places.flatMap((p) => [p.x - cw / 2, p.x + cw / 2])
  const ys = places.flatMap((p) => [p.y - ch / 2, p.y + ch / 2])
  return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) }
}
