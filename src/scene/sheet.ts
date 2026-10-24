// The message on the paper, drawn into a 2D canvas. The 3D sheet's texture and the 2D fallback
// both use it, so phones without WebGL2 read the same paper. No three.js here.
//
// Everything is laid out in page units: the sheet is 1000 units wide whatever its pixel size, and
// as tall as its text needs (between 3:4 and 1:1.8). Messages are short (15–30 words), so the body
// is set big: up to 66 units, never below 49 (17.5 px on screen when the sheet fills 92% of a
// 390 px phone) unless a long text would not fit even the tallest sheet.
import type { Channel, EraId, Lang } from '../content/types'
import { mulberry32, seedFrom } from '../game/rng'
import handUrl from './fonts/note-hand.woff2?url'
import type { DayTitle, SheetSpec, SheetStamp, StampKind } from './types'

type Ctx = CanvasRenderingContext2D

export const PAGE_W = 1000
export const MIN_ASPECT = 4 / 3
export const MAX_ASPECT = 1.8
/** The sheet keeps to this shape while the text can shrink toward BODY instead. */
const PREF_ASPECT = 1.45
/** Body size floor in page units: 17.3 px even on a 360 px phone (a 340 px sheet). */
export const BODY = 51
const BODY_MAX = 66
const BODY_MIN = 41
/** The stamp imprint's diameter as a share of the sheet's width. */
export const STAMP_SHARE = 0.36

// ---------------------------------------------------------------- fonts

const LATIN =
  'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD'
const DEVA = 'U+0900-097F, U+1CD0-1CF4, U+1CF7-1CF9, U+200C-200D, U+20A8, U+20B9, U+20F0, U+25CC, U+A830-A839, U+A8E0-A8FF, U+11B00-11B0A'

/** Font stacks. The FT families are registered here, so the sheet never depends on page CSS. */
export const FACE = {
  print: '"FT Print", "Old Standard TT", Georgia, "Times New Roman", serif',
  deva: '"FT Deva", "Tiro Devanagari Hindi", "Kohinoor Devanagari", "Noto Serif Devanagari", serif',
  type: '"FT Type", "Special Elite", "Courier New", Courier, monospace',
  sans: '"FT Sans", Mukta, system-ui, sans-serif',
  hand: '"FT Hand", "Segoe Print", "Bradley Hand", cursive',
} as const

interface FaceDef {
  family: string
  file: string
  range: string
  weight?: string
  langs: Lang[]
}

const FACES: FaceDef[] = [
  { family: 'FT Print', file: 'old-standard-tt-400-latin.woff2', range: LATIN, langs: ['en'] },
  { family: 'FT Type', file: 'special-elite-400-latin.woff2', range: LATIN, langs: ['en'] },
  { family: 'FT Deva', file: 'tiro-devanagari-hindi-400-latin.woff2', range: LATIN, langs: ['hi'] },
  { family: 'FT Deva', file: 'tiro-devanagari-hindi-400-devanagari.woff2', range: DEVA, langs: ['hi'] },
  { family: 'FT Sans', file: 'mukta-600-latin.woff2', range: LATIN, weight: '600', langs: ['en', 'hi'] },
  { family: 'FT Sans', file: 'mukta-600-devanagari.woff2', range: DEVA, weight: '600', langs: ['hi'] },
]

const loaded = new Map<string, Promise<boolean>>()

function fontBase(): string {
  try {
    return import.meta.env?.BASE_URL ?? '/'
  } catch {
    return '/'
  }
}

function loadFace(key: string, make: () => FontFace): Promise<boolean> {
  let p = loaded.get(key)
  if (!p) {
    p = (async () => {
      try {
        const face = make()
        document.fonts.add(face)
        await face.load()
        return true
      } catch {
        return false
      }
    })()
    loaded.set(key, p)
  }
  return p
}

/**
 * Loads the faces the sheet uses for `lang` (every face when no language is given). Resolves true
 * when all arrived, false on a timeout or an error, and never rejects. Canvas text never triggers
 * a font download on its own, so call this before drawing.
 */
export function loadSheetFonts(lang?: Lang, timeoutMs = 3000): Promise<boolean> {
  if (typeof document === 'undefined' || typeof FontFace === 'undefined' || !document.fonts) return Promise.resolve(true)
  const base = fontBase()
  const jobs = FACES.filter((f) => !lang || f.langs.includes(lang)).map((f) =>
    loadFace(`${f.family}|${f.file}`, () => new FontFace(f.family, `url(${base}fonts/${f.file}) format('woff2')`, { unicodeRange: f.range, weight: f.weight ?? '400', display: 'block' })),
  )
  jobs.push(loadFace('FT Hand', () => new FontFace('FT Hand', `url(${handUrl}) format('woff2')`, { display: 'block' })))
  const all = Promise.all(jobs).then((r) => r.every(Boolean))
  if (!(timeoutMs > 0)) return all
  return new Promise((resolve) => {
    const t = setTimeout(() => resolve(false), timeoutMs)
    void all.then((ok) => {
      clearTimeout(t)
      resolve(ok)
    })
  })
}

const font = (face: string, size: number, weight = '') => `${weight ? `${weight} ` : ''}${Math.max(1, Math.round(size * 10) / 10)}px ${face}`
const isDeva = (t: string) => /[ऀ-ॿ]/.test(t)
const ascii = (t: string) => /^[\x00-\x7F]*$/.test(t)

// ---------------------------------------------------------------- text layout

interface Tok {
  s: number
  e: number
  x: number
  w: number
}
interface Line {
  toks: Tok[]
  w: number
}

/** Greedy wrap on spaces. Devanagari words are never split, so conjuncts and matras stay whole. */
export function wrapText(ctx: Ctx, text: string, maxW: number, firstIndent = 0): Line[] {
  const space = ctx.measureText(' ').width
  const lines: Line[] = []
  let cur: Line = { toks: [], w: 0 }
  let limit = maxW - firstIndent
  const re = /\S+/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    const s = m.index
    const e = s + m[0].length
    const w = ctx.measureText(m[0]).width
    const x = cur.toks.length ? cur.w + space : 0
    if (cur.toks.length && x + w > limit) {
      lines.push(cur)
      limit = maxW
      cur = { toks: [{ s, e, x: 0, w }], w }
    } else {
      cur.toks.push({ s, e, x, w })
      cur.w = x + w
    }
  }
  if (cur.toks.length) lines.push(cur)
  return lines
}

/** Every place a check occurs in `text`; exact first, then ignoring case (same length in ASCII). */
export function findChecks(text: string, checks: readonly string[]): [number, number][] {
  const out: [number, number][] = []
  const low = text.toLowerCase()
  for (const c of checks) {
    const k = c.trim()
    if (!k) continue
    let hay = text
    let needle = k
    if (text.indexOf(k) < 0 && ascii(k) && low.length === text.length) {
      hay = low
      needle = k.toLowerCase()
    }
    let i = hay.indexOf(needle)
    while (i >= 0) {
      out.push([i, i + needle.length])
      i = hay.indexOf(needle, i + needle.length)
    }
  }
  return out
}

type Kind = 'print' | 'type' | 'hand'

interface Block {
  text: string
  face: string
  size: number
  weight: string
  lh: number
  lines: Line[]
  /** Left edge of the text column, or its right edge (align right) or centre (align center). */
  x: number
  /** First baseline. */
  y: number
  color: string
  kind: Kind
  align: 'left' | 'right' | 'center'
  firstIndent: number
  checkable: boolean
  /** Faux bold stroke, as a share of the size. */
  bold?: number
  /** Extra letter spacing in units (Latin only). */
  track?: number
  alpha?: number
  /** A form field typed before the arrival (From, To, No.): shown at once, not struck key by key. */
  field?: boolean
}

function makeBlock(ctx: Ctx, o: Omit<Block, 'lines'> & { maxW: number }): Block {
  ctx.font = font(o.face, o.size, o.weight)
  const lines = o.track && ascii(o.text) ? wrapTracked(ctx, o.text, o.maxW, o.track) : wrapText(ctx, o.text, o.maxW, o.firstIndent)
  return { ...o, lines }
}

/** Wrap for letter-spaced headings (spacing changes word widths). */
function wrapTracked(ctx: Ctx, text: string, maxW: number, track: number): Line[] {
  const wOf = (t: string) => ctx.measureText(t).width + track * Math.max(0, t.length - 1)
  const space = ctx.measureText(' ').width + track
  const lines: Line[] = []
  let cur: Line = { toks: [], w: 0 }
  const re = /\S+/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    const w = wOf(m[0])
    const x = cur.toks.length ? cur.w + space : 0
    if (cur.toks.length && x + w > maxW) {
      lines.push(cur)
      cur = { toks: [{ s: m.index, e: m.index + m[0].length, x: 0, w }], w }
    } else {
      cur.toks.push({ s: m.index, e: m.index + m[0].length, x, w })
      cur.w = x + w
    }
  }
  if (cur.toks.length) lines.push(cur)
  return lines
}

const blockBottom = (b: Block) => b.y + (Math.max(1, b.lines.length) - 1) * b.lh + b.size * 0.3

function lineLeft(b: Block, i: number): number {
  const line = b.lines[i]
  if (!line) return b.x
  const indent = i === 0 ? b.firstIndent : 0
  if (b.align === 'right') return b.x - line.w
  if (b.align === 'center') return b.x - line.w / 2
  return b.x + indent
}

function paintBlock(ctx: Ctx, b: Block, rng: () => number): void {
  ctx.save()
  ctx.font = font(b.face, b.size, b.weight)
  ctx.fillStyle = b.color
  ctx.strokeStyle = b.color
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'
  ctx.lineJoin = 'round'
  if (b.alpha !== undefined) ctx.globalAlpha = b.alpha
  b.lines.forEach((line, i) => {
    const x0 = lineLeft(b, i)
    const y = b.y + i * b.lh
    for (const t of line.toks) {
      const word = b.text.slice(t.s, t.e)
      if (b.kind === 'type' && !isDeva(word)) {
        // a typewriter: every letter struck on its own, a little off its line, unevenly inked
        let x = x0 + t.x
        for (const ch of word) {
          const a = 0.8 + rng() * 0.2
          ctx.globalAlpha = (b.alpha ?? 1) * a
          const dy = (rng() - 0.5) * b.size * 0.035
          ctx.fillText(ch, x, y + dy)
          if (rng() < 0.05) {
            ctx.globalAlpha = (b.alpha ?? 1) * a * 0.35
            ctx.fillText(ch, x + b.size * 0.02, y + dy + b.size * 0.012)
          }
          x += ctx.measureText(ch).width
        }
        ctx.globalAlpha = b.alpha ?? 1
      } else if (b.track && ascii(word)) {
        let x = x0 + t.x
        for (const ch of word) {
          ctx.fillText(ch, x, y)
          if (b.bold) {
            ctx.lineWidth = b.size * b.bold
            ctx.strokeText(ch, x, y)
          }
          x += ctx.measureText(ch).width + b.track
        }
      } else {
        const dy = b.kind === 'hand' ? (rng() - 0.5) * b.size * 0.05 : 0
        ctx.fillText(word, x0 + t.x, y + dy)
        if (b.bold) {
          ctx.lineWidth = b.size * b.bold
          ctx.strokeText(word, x0 + t.x, y + dy)
        }
      }
    }
  })
  ctx.restore()
}

/** Pencil squiggles under the checked words of a block. Returns how many it drew. */
interface Segment {
  xa: number
  xb: number
  /** The line's baseline. */
  y: number
  size: number
}

/** Where a character range of a block sits, one segment per line it spans (page units). */
function segments(ctx: Ctx, b: Block, a: number, z: number): Segment[] {
  ctx.save()
  ctx.font = font(b.face, b.size, b.weight)
  const measure = (t: string) => ctx.measureText(t).width + (b.track && ascii(t) ? b.track * t.length : 0)
  const out: Segment[] = []
  b.lines.forEach((line, i) => {
    const x0 = lineLeft(b, i)
    const hit = line.toks.filter((t) => t.e > a && t.s < z)
    const first = hit[0]
    const last = hit[hit.length - 1]
    if (!first || !last) return
    const xa = x0 + first.x + measure(b.text.slice(first.s, Math.max(a, first.s)))
    const xb = x0 + last.x + measure(b.text.slice(last.s, Math.min(z, last.e)))
    if (xb - xa >= 4) out.push({ xa, xb, y: b.y + i * b.lh, size: b.size })
  })
  ctx.restore()
  return out
}

function paintChecks(ctx: Ctx, b: Block, checks: readonly string[], rng: () => number): number {
  if (!b.checkable) return 0
  let n = 0
  for (const [a, z] of findChecks(b.text, checks)) {
    for (const sg of segments(ctx, b, a, z)) {
      pencilLine(ctx, sg.xa - 3, sg.xb + 3, sg.y + sg.size * 0.2, sg.size, rng)
      n++
    }
  }
  return n
}

/** A soft graphite underline: two quick, slightly wavy passes. */
function pencilLine(ctx: Ctx, x0: number, x1: number, y: number, size: number, rng: () => number): void {
  ctx.save()
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  const len = x1 - x0
  const steps = Math.max(4, Math.round(len / (size * 0.55)))
  const phase = rng() * 6
  for (let pass = 0; pass < 2; pass++) {
    ctx.strokeStyle = pass === 0 ? 'rgba(58,60,68,0.82)' : 'rgba(58,60,68,0.45)'
    ctx.lineWidth = size * (pass === 0 ? 0.07 : 0.045)
    ctx.beginPath()
    const tilt = (rng() - 0.5) * size * 0.08
    for (let i = 0; i <= steps; i++) {
      const k = i / steps
      const x = x0 + len * k + (pass ? size * 0.12 : 0)
      const yy = y + tilt * k + Math.sin(phase + k * steps * 1.9) * size * 0.045 + (rng() - 0.5) * size * 0.025 + pass * size * 0.06
      if (i === 0) ctx.moveTo(x, yy)
      else ctx.lineTo(x, yy)
    }
    ctx.stroke()
  }
  ctx.restore()
}

// ---------------------------------------------------------------- paper and ink

let grainCanvas: HTMLCanvasElement | null = null

/** A small tile of paper grain, made once and reused as a pattern. */
function grain(): HTMLCanvasElement | null {
  if (grainCanvas) return grainCanvas
  if (typeof document === 'undefined') return null
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')
  if (!g || typeof g.createImageData !== 'function') return null
  const img = g.createImageData(128, 128)
  const d = img.data
  if (!d) return null
  const r = mulberry32(7)
  for (let i = 0; i < d.length; i += 4) {
    const v = 200 + r() * 55
    d[i] = v
    d[i + 1] = v * 0.97
    d[i + 2] = v * 0.92
    d[i + 3] = 255
  }
  g.putImageData(img, 0, 0)
  grainCanvas = c
  return c
}

const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`

function paperBase(ctx: Ctx, H: number, tint: number, rng: () => number, age: number): void {
  ctx.fillStyle = hex(tint)
  ctx.fillRect(0, 0, PAGE_W, H)
  const g = grain()
  if (g && typeof ctx.createPattern === 'function') {
    const pat = ctx.createPattern(g, 'repeat')
    if (pat) {
      ctx.save()
      ctx.globalCompositeOperation = 'multiply'
      ctx.globalAlpha = 0.55
      ctx.fillStyle = pat
      ctx.fillRect(0, 0, PAGE_W, H)
      ctx.restore()
    }
  }
  // mottling and fibres
  ctx.save()
  for (let i = 0; i < 70; i++) {
    const x = rng() * PAGE_W
    const y = rng() * H
    const r = 30 + rng() * 120
    const grd = ctx.createRadialGradient(x, y, 0, x, y, r)
    grd.addColorStop(0, `rgba(120,85,40,${(0.02 + rng() * 0.035 * age).toFixed(3)})`)
    grd.addColorStop(1, 'rgba(120,85,40,0)')
    ctx.fillStyle = grd
    ctx.fillRect(x - r, y - r, r * 2, r * 2)
  }
  ctx.lineCap = 'round'
  for (let i = 0; i < 120; i++) {
    const x = rng() * PAGE_W
    const y = rng() * H
    const a = rng() * Math.PI
    const l = 6 + rng() * 22
    ctx.strokeStyle = `rgba(110,80,45,${(0.05 + rng() * 0.08).toFixed(3)})`
    ctx.lineWidth = 0.8 + rng() * 1.2
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + rng() * 4, y + Math.sin(a) * l * 0.5 + rng() * 4, x + Math.cos(a) * l, y + Math.sin(a) * l)
    ctx.stroke()
  }
  for (let i = 0; i < 160; i++) {
    ctx.fillStyle = `rgba(90,60,30,${(0.04 + rng() * 0.1 * age).toFixed(3)})`
    const s = 0.8 + rng() * 2.2
    ctx.fillRect(rng() * PAGE_W, rng() * H, s, s)
  }
  // toned edges
  const edge = 26 + 30 * age
  const sides: [number, number, number, number][] = [
    [0, 0, edge, 0],
    [PAGE_W, 0, PAGE_W - edge, 0],
    [0, 0, 0, edge],
    [0, H, 0, H - edge],
  ]
  for (const [x0, y0, x1, y1] of sides) {
    const grd = ctx.createLinearGradient(x0, y0, x1, y1)
    grd.addColorStop(0, `rgba(125,82,35,${(0.16 + 0.22 * age).toFixed(3)})`)
    grd.addColorStop(1, 'rgba(125,82,35,0)')
    ctx.fillStyle = grd
    ctx.fillRect(0, 0, PAGE_W, H)
  }
  ctx.restore()
}

/** A crease: a faint dark valley with a lit edge beside it. */
function crease(ctx: Ctx, x0: number, y0: number, x1: number, y1: number): void {
  const nx = -(y1 - y0)
  const ny = x1 - x0
  const l = Math.hypot(nx, ny) || 1
  const ox = (nx / l) * 2.2
  const oy = (ny / l) * 2.2
  ctx.save()
  ctx.lineWidth = 3
  ctx.strokeStyle = 'rgba(90,70,45,0.16)'
  ctx.beginPath()
  ctx.moveTo(x0, y0)
  ctx.lineTo(x1, y1)
  ctx.stroke()
  ctx.lineWidth = 2
  ctx.strokeStyle = 'rgba(255,255,245,0.35)'
  ctx.beginPath()
  ctx.moveTo(x0 + ox, y0 + oy)
  ctx.lineTo(x1 + ox, y1 + oy)
  ctx.stroke()
  ctx.restore()
}

function setMultiply(ctx: Ctx): void {
  ctx.globalCompositeOperation = 'multiply'
  if (ctx.globalCompositeOperation !== 'multiply') ctx.globalCompositeOperation = 'source-over'
}

function star(ctx: Ctx, cx: number, cy: number, r: number, points: number, inner: number): void {
  ctx.beginPath()
  for (let i = 0; i < points * 2; i++) {
    const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2
    const rr = i % 2 ? r * inner : r
    if (i === 0) ctx.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr)
    else ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr)
  }
  ctx.closePath()
}

/** Ink colours of the two stamps (the same as the 3D stamps' faces). */
export const STAMP_COLORS: Record<StampKind, string> = { asli: '#a8231c', tota: '#1d7436' }
const STAMP_WORDS: Record<StampKind, [string, string]> = { asli: ['ASLI', 'असली'], tota: ['TOTA', 'तोता'] }

/**
 * The ASLI or TOTA imprint, centred at (cx, cy), `size` across. `wear: 'erase'` knocks specks out
 * of a transparent canvas (the 3D decal); a colour paints paper-coloured specks over the ink.
 */
export function drawStampImprint(ctx: Ctx, kind: StampKind, cx: number, cy: number, size: number, rot: number, seed: number, wear: 'erase' | string): void {
  const rng = mulberry32(seed)
  const col = STAMP_COLORS[kind]
  const [word, hindi] = STAMP_WORDS[kind]
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(rot)
  if (wear !== 'erase') setMultiply(ctx)
  ctx.globalAlpha = 0.9
  ctx.strokeStyle = col
  ctx.fillStyle = col
  ctx.lineWidth = size * 0.05
  ctx.beginPath()
  ctx.arc(0, 0, size * 0.455, 0, Math.PI * 2)
  ctx.stroke()
  ctx.lineWidth = size * 0.016
  ctx.beginPath()
  ctx.arc(0, 0, size * 0.385, 0, Math.PI * 2)
  ctx.stroke()
  // a band of small dots between the rings
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2
    ctx.beginPath()
    ctx.arc(Math.cos(a) * size * 0.42, Math.sin(a) * size * 0.42, size * 0.009, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.font = font(FACE.print, size * 0.25, '700')
  const track = size * 0.02
  const ww = ctx.measureText(word).width + track * (word.length - 1)
  let x = -ww / 2
  ctx.textAlign = 'left'
  for (const ch of word) {
    ctx.fillText(ch, x, size * 0.035)
    ctx.lineWidth = size * 0.012
    ctx.strokeText(ch, x, size * 0.035)
    x += ctx.measureText(ch).width + track
  }
  ctx.textAlign = 'center'
  ctx.fillRect(-size * 0.27, size * 0.075, size * 0.54, size * 0.012)
  ctx.font = font(FACE.deva, size * 0.15)
  ctx.fillText(hindi, 0, size * 0.25)
  star(ctx, -size * 0.3, -size * 0.17, size * 0.035, 5, 0.45)
  ctx.fill()
  star(ctx, size * 0.3, -size * 0.17, size * 0.035, 5, 0.45)
  ctx.fill()
  // wear: specks, and one side pressed lighter
  ctx.globalCompositeOperation = wear === 'erase' ? 'destination-out' : 'source-over'
  ctx.fillStyle = wear === 'erase' ? 'rgba(0,0,0,1)' : wear
  for (let i = 0; i < 260; i++) {
    ctx.globalAlpha = 0.25 + rng() * 0.6
    const r = Math.sqrt(rng()) * size * 0.5
    const a = rng() * Math.PI * 2
    const s = size * (0.004 + rng() * 0.012)
    ctx.fillRect(Math.cos(a) * r, Math.sin(a) * r, s, s * 0.8)
  }
  if (wear === 'erase') {
    ctx.globalAlpha = 0.4
    const fade = ctx.createLinearGradient(-size / 2, -size / 2, size / 2, size * 0.2)
    fade.addColorStop(0, 'rgba(0,0,0,0)')
    fade.addColorStop(1, 'rgba(0,0,0,1)')
    ctx.fillStyle = fade
    ctx.fillRect(-size / 2, -size / 2, size, size)
  }
  ctx.restore()
}

/** A round seal (mohur) impression: rings, a band of pseudo-script strokes, a rosette. */
function mohur(ctx: Ctx, cx: number, cy: number, r: number, col: string, paper: string, rng: () => number): void {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate((rng() - 0.5) * 0.4)
  setMultiply(ctx)
  ctx.globalAlpha = 0.82
  ctx.strokeStyle = col
  ctx.fillStyle = col
  ctx.lineWidth = r * 0.07
  ctx.beginPath()
  ctx.arc(0, 0, r, 0, Math.PI * 2)
  ctx.stroke()
  ctx.lineWidth = r * 0.025
  ctx.beginPath()
  ctx.arc(0, 0, r * 0.86, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2)
  ctx.stroke()
  // the band between the rings: little arcs and dots, like a line of script worn smooth
  ctx.lineCap = 'round'
  ctx.lineWidth = r * 0.04
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2 + rng() * 0.08
    const rr = r * (0.6 + rng() * 0.18)
    ctx.beginPath()
    ctx.arc(Math.cos(a) * rr, Math.sin(a) * rr, r * (0.04 + rng() * 0.06), a, a + 1.5 + rng() * 2)
    ctx.stroke()
    if (rng() < 0.5) {
      ctx.beginPath()
      ctx.arc(Math.cos(a + 0.12) * r * 0.77, Math.sin(a + 0.12) * r * 0.77, r * 0.022, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  // an eight-pointed rosette of two squares, and a flower at its heart
  ctx.lineWidth = r * 0.035
  for (const a of [0, Math.PI / 4]) {
    ctx.save()
    ctx.rotate(a)
    ctx.strokeRect(-r * 0.3, -r * 0.3, r * 0.6, r * 0.6)
    ctx.restore()
  }
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2
    ctx.beginPath()
    ctx.ellipse(Math.cos(a) * r * 0.12, Math.sin(a) * r * 0.12, r * 0.1, r * 0.05, a, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalCompositeOperation = 'source-over'
  ctx.fillStyle = paper
  for (let i = 0; i < 140; i++) {
    ctx.globalAlpha = 0.3 + rng() * 0.6
    const rr = Math.sqrt(rng()) * r
    const a = rng() * Math.PI * 2
    const s = r * (0.015 + rng() * 0.04)
    ctx.fillRect(Math.cos(a) * rr, Math.sin(a) * rr, s, s)
  }
  ctx.restore()
}

/** A decorative floral border band (a scrolling vine with leaves and five-petal flowers). */
function floralBorder(ctx: Ctx, H: number, rng: () => number): void {
  const o = 30 // outer rule inset
  const band = 46
  const red = '#8b2a1c'
  const green = '#56703a'
  const gold = '#b6862e'
  const indigo = '#2d3a66'
  ctx.save()
  setMultiply(ctx)
  ctx.strokeStyle = red
  ctx.lineWidth = 4
  ctx.strokeRect(o, o, PAGE_W - o * 2, H - o * 2)
  ctx.lineWidth = 1.6
  ctx.strokeRect(o + 7, o + 7, PAGE_W - (o + 7) * 2, H - (o + 7) * 2)
  ctx.lineWidth = 1.6
  ctx.strokeRect(o + band, o + band, PAGE_W - (o + band) * 2, H - (o + band) * 2)
  ctx.lineWidth = 3
  ctx.strokeRect(o + band + 6, o + band + 6, PAGE_W - (o + band + 6) * 2, H - (o + band + 6) * 2)
  const mid = o + 7 + (band - 7) / 2
  const amp = (band - 7) * 0.22
  // one edge at a time, the vine running along the band's centre line
  const edge = (x0: number, y0: number, x1: number, y1: number) => {
    const len = Math.hypot(x1 - x0, y1 - y0)
    const ux = (x1 - x0) / len
    const uy = (y1 - y0) / len
    const nx = -uy
    const ny = ux
    const period = 64
    const n = Math.max(1, Math.round(len / period))
    const p = len / n
    ctx.strokeStyle = green
    ctx.lineWidth = 2.4
    ctx.beginPath()
    for (let d = 0; d <= len; d += 3) {
      const off = Math.sin((d / p) * Math.PI * 2) * amp
      const x = x0 + ux * d + nx * off
      const y = y0 + uy * d + ny * off
      if (d === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
    for (let i = 0; i < n; i++) {
      for (const half of [0.25, 0.75]) {
        const d = (i + half) * p
        const side = half < 0.5 ? 1 : -1
        const bx = x0 + ux * d + nx * amp * side
        const by = y0 + uy * d + ny * amp * side
        // a leaf off the crest, a flower in the trough
        ctx.fillStyle = green
        ctx.beginPath()
        ctx.ellipse(bx + nx * side * 6 + ux * 8, by + ny * side * 6 + uy * 8, 9, 3.6, Math.atan2(uy, ux) + side * 0.7, 0, Math.PI * 2)
        ctx.fill()
        if ((i + (half < 0.5 ? 0 : 1)) % 2 === 0) {
          const fx = bx - nx * side * 3
          const fy = by - ny * side * 3
          ctx.fillStyle = red
          for (let k = 0; k < 5; k++) {
            const a = (k / 5) * Math.PI * 2 + rng() * 0.2
            ctx.beginPath()
            ctx.ellipse(fx + Math.cos(a) * 4.6, fy + Math.sin(a) * 4.6, 4.2, 2.6, a, 0, Math.PI * 2)
            ctx.fill()
          }
          ctx.fillStyle = gold
          ctx.beginPath()
          ctx.arc(fx, fy, 2.4, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }
  }
  const a = mid
  const b = PAGE_W - mid
  const c = H - mid
  edge(a + 24, a, b - 24, a)
  edge(b, a + 24, b, c - 24)
  edge(b - 24, c, a + 24, c)
  edge(a, c - 24, a, a + 24)
  // corner rosettes
  for (const [x, y] of [[a, a], [b, a], [b, c], [a, c]] as const) {
    ctx.fillStyle = indigo
    for (let k = 0; k < 8; k++) {
      const ang = (k / 8) * Math.PI * 2
      ctx.beginPath()
      ctx.ellipse(x + Math.cos(ang) * 9, y + Math.sin(ang) * 9, 7.5, 3.4, ang, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.fillStyle = gold
    ctx.beginPath()
    ctx.arc(x, y, 5, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

/** A small flourish under a heading: a stem with leaves and a bud. */
function sprig(ctx: Ctx, cx: number, y: number, w: number, col: string): void {
  ctx.save()
  setMultiply(ctx)
  ctx.strokeStyle = col
  ctx.fillStyle = col
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(cx - w / 2, y)
  ctx.bezierCurveTo(cx - w / 4, y - 10, cx - w / 8, y + 8, cx, y)
  ctx.bezierCurveTo(cx + w / 8, y - 8, cx + w / 4, y + 10, cx + w / 2, y)
  ctx.stroke()
  for (const s of [-1, 1]) {
    for (const k of [0.18, 0.34]) {
      ctx.beginPath()
      ctx.ellipse(cx + s * w * k, y - 6, 8, 3, s * -0.6, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.beginPath()
  ctx.arc(cx, y - 1, 5, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

// ---------------------------------------------------------------- words on the paper

interface Words {
  from: string
  to: string
  real: string
  check: string
}
const WORDS: Record<Lang, Words> = {
  en: { from: 'From', to: 'To', real: 'Real document', check: 'check the underlined' },
  hi: { from: 'प्रेषक', to: 'सेवा में', real: 'असली दस्तावेज़', check: 'जो रेखांकित है, उसे जाँचो' },
}

const HEADINGS: Record<Channel, Record<Lang, string>> = {
  petition: { en: 'Darbar-e-Mualla', hi: 'दरबार-ए-मुअल्ला' },
  note: { en: '', hi: '' },
  radio: { en: 'CONGRESS RADIO · 42.34 m', hi: 'कांग्रेस रेडियो · 42.34 मीटर' },
  telegram: { en: 'TELEGRAM', hi: 'तार' },
}

/** Splits a trailing " — Name" off the body as a signature. */
export function splitSignature(body: string): { body: string; sig?: string } {
  const m = /\s+[—–]\s*([^—–\n]{1,60})$/.exec(body)
  if (m && m.index > 8 && m[1]) return { body: body.slice(0, m.index).trimEnd(), sig: m[1].trim() }
  return { body }
}

const LEAFLET_HEAD = /^(.{6,90}?)(\s*\((?:NOTICE|नोटिस)\)|[.।]\s+(?:NOTICE|नोटिस))[.।]?\s+/i
const LEAFLET_SIG = /\s((?:Signed,?|Sd\/-|दस्तख़त:)\s*[^\n]{2,90}|[^.।!\n]{0,40}(?:Commander-in-|कमांडर-इन-)[^.।!\n]*[.।]?)$/i

/** A 1929 notice or leaflet: the printed heading, NOTICE, the body and a signature line. */
export function splitLeaflet(s: SheetSpec): { heading: string; notice: string; body: string; sig?: string } | null {
  if (s.channel !== 'note') return null
  const head = LEAFLET_HEAD.exec(s.body)
  const fromHeading = !!s.heading
  if (!fromHeading && !(head && /hindustan|हिंदुस्तान/i.test(head[1] ?? ''))) return null
  let rest = s.body
  let heading = s.heading ?? ''
  let notice = s.lang === 'hi' ? 'नोटिस' : 'NOTICE'
  if (head && head[1] && (!fromHeading || head[1] === s.heading)) {
    heading = head[1]
    const n = /(NOTICE|नोटिस)/i.exec(head[2] ?? '')
    if (n?.[1]) notice = n[1]
    rest = s.body.slice(head[0].length)
  }
  const sig = LEAFLET_SIG.exec(rest)
  if (sig && sig[1] && sig.index > 20) return { heading, notice, body: rest.slice(0, sig.index).trimEnd(), sig: sig[1].trim() }
  return { heading, notice, body: rest }
}

// ---------------------------------------------------------------- the layouts

interface Layout {
  /** Content height in units, without the footer. */
  height: number
  blocks: Block[]
  /** Where the body ends, for the stamp. */
  bodyEnd: number
  paint(ctx: Ctx, H: number, rng: () => number): void
  /** Paper tint for the stamp's wear. */
  tint: number
}

const FOOT = 150
const BOTTOM = 56

interface Env {
  s: SheetSpec
  B: number
  hi: boolean
  w: Words
}

function hand(env: Env): string {
  return env.hi ? FACE.deva : FACE.hand
}

/** The body face: Devanagari for Hindi, else the channel's face. */
function bodyFace(env: Env, kind: Kind): string {
  if (env.hi) return FACE.deva
  return kind === 'type' ? FACE.type : kind === 'hand' ? FACE.hand : FACE.print
}

function petitionLayout(ctx: Ctx, env: Env): Layout {
  const { s, B, hi, w } = env
  const L = 108
  const R = PAGE_W - 108
  const blocks: Block[] = []
  const ink = '#2c1a0f'
  const maroon = '#7d2016'
  const heading = makeBlock(ctx, {
    text: s.heading ?? HEADINGS.petition[s.lang], face: hi ? FACE.deva : FACE.print, size: Math.min(84, B * (hi ? 1.3 : 1.12)), weight: '', lh: B * 1.3,
    x: PAGE_W / 2 + 36, y: 182, color: maroon, kind: 'print', align: 'center', firstIndent: 0, checkable: true, bold: hi ? 0.02 : 0.028, maxW: 560,
  })
  blocks.push(heading)
  let y = blockBottom(heading) + 26
  const sprigY = y
  y += 30 + B * 0.62
  const dateB = makeBlock(ctx, {
    text: s.dateLine, face: hi ? FACE.deva : FACE.print, size: B * 0.6, weight: '', lh: B * 0.8, x: R, y, color: ink, kind: 'print', align: 'right', firstIndent: 0, checkable: true, maxW: R - L, alpha: 0.9,
  })
  blocks.push(dateB)
  y = blockBottom(dateB) + B * 0.95
  const label = (t: string) => makeBlock(ctx, {
    text: t, face: hi ? FACE.deva : FACE.print, size: B * 0.56, weight: '', lh: B, x: L, y, color: maroon, kind: 'print', align: 'left', firstIndent: 0, checkable: false, track: hi ? 0 : 2.5, maxW: 200,
  })
  for (const [lab, val] of [[w.from, s.from], [w.to, s.to]] as const) {
    const lb = label(hi ? lab : lab.toUpperCase())
    const lw = (lb.lines[0]?.w ?? 0) + 22
    blocks.push(lb)
    const v = makeBlock(ctx, {
      text: val, face: bodyFace(env, 'print'), size: B * 0.86, weight: '', lh: B * 1.18, x: L + Math.max(lw, 150), y, color: ink, kind: 'print', align: 'left', firstIndent: 0, checkable: true, maxW: R - L - Math.max(lw, 150),
    })
    blocks.push(v)
    y = blockBottom(v) + B * 0.95
  }
  const ruleY = y - B * 0.35
  y += B * 0.95
  const { body, sig } = splitSignature(s.body)
  const bodyB = makeBlock(ctx, {
    text: body, face: bodyFace(env, 'print'), size: B * (hi ? 1.04 : 1), weight: '', lh: B * (hi ? 1.5 : 1.42), x: L, y, color: ink, kind: 'print', align: 'left', firstIndent: B * 1.4, checkable: true, maxW: R - L,
  })
  blocks.push(bodyB)
  y = blockBottom(bodyB)
  if (sig) {
    const sb = makeBlock(ctx, {
      text: `— ${sig}`, face: bodyFace(env, 'print'), size: B * 0.95, weight: '', lh: B * 1.3, x: R, y: y + B * 1.25, color: ink, kind: 'print', align: 'right', firstIndent: 0, checkable: true, maxW: R - L,
    })
    blocks.push(sb)
    y = blockBottom(sb)
  }
  return {
    height: y,
    blocks,
    bodyEnd: y,
    tint: 0xeedfba,
    paint(c, H, rng) {
      paperBase(c, H, 0xeedfba, rng, 0.9)
      floralBorder(c, H, rng)
      const sealCol = seedFrom(s.from) % 3 === 0 ? '#2a211c' : '#9c2a1d'
      mohur(c, 166, 150, 48, sealCol, '#eedfba', rng)
      sprig(c, PAGE_W / 2 + 36, sprigY, 170, maroon)
      c.save()
      setMultiply(c)
      c.strokeStyle = 'rgba(125,32,22,0.55)'
      c.lineWidth = 1.6
      c.beginPath()
      c.moveTo(L, ruleY)
      c.lineTo(R, ruleY)
      c.moveTo(L, ruleY + 6)
      c.lineTo(R, ruleY + 6)
      c.stroke()
      c.restore()
      if (s.serial) pencilNote(c, s.serial, L + 4, H - BOTTOM - 22, B * 0.6, -0.03, hand(env))
    },
  }
}

function noteLayout(ctx: Ctx, env: Env): Layout {
  const { s, B, hi, w } = env
  const leaf = splitLeaflet(s)
  if (leaf) return leafletLayout(ctx, env, leaf)
  const L = 92
  const R = PAGE_W - 92
  const graphite = '#30333a'
  const blocks: Block[] = []
  const dateB = makeBlock(ctx, {
    text: s.dateLine, face: hand(env), size: B * (hi ? 0.66 : 0.74), weight: '', lh: B * 0.9, x: R, y: 112, color: graphite, kind: 'hand', align: 'right', firstIndent: 0, checkable: true, maxW: R - L,
  })
  const toB = makeBlock(ctx, {
    text: `${w.to}: ${s.to}`, face: hand(env), size: B * (hi ? 0.76 : 0.86), weight: '', lh: B * 1.1, x: L, y: blockBottom(dateB) + B * 1.1, color: graphite, kind: 'hand', align: 'left', firstIndent: 0, checkable: true, maxW: R - L,
  })
  blocks.push(dateB, toB)
  let y = blockBottom(toB) + B * 1.35
  const split = splitSignature(s.body)
  const bodyB = makeBlock(ctx, {
    text: split.body, face: bodyFace(env, 'hand'), size: B * (hi ? 1.04 : 1.12), weight: '', lh: B * (hi ? 1.5 : 1.46), x: L, y, color: graphite, kind: 'hand', align: 'left', firstIndent: 0, checkable: true, maxW: R - L,
  })
  blocks.push(bodyB)
  y = blockBottom(bodyB)
  const sig = split.sig ?? s.from
  const sb = makeBlock(ctx, {
    text: `— ${sig}`, face: bodyFace(env, 'hand'), size: B * (hi ? 1 : 1.08), weight: '', lh: B * 1.3, x: R, y: y + B * 1.3, color: graphite, kind: 'hand', align: 'right', firstIndent: 0, checkable: true, maxW: R - L,
  })
  blocks.push(sb)
  y = blockBottom(sb)
  return {
    height: y,
    blocks,
    bodyEnd: y,
    tint: 0xf0ebdc,
    paint(c, H, rng) {
      paperBase(c, H, 0xf0ebdc, rng, 0.45)
      // folded in half, then in half again
      crease(c, 0, H / 2, PAGE_W, H / 2)
      crease(c, PAGE_W / 2, 0, PAGE_W / 2, H)
      // faint ruled lines of an exercise book, under the writing
      c.save()
      c.strokeStyle = 'rgba(96,128,170,0.22)'
      c.lineWidth = 1.4
      for (let ly = bodyB.y + B * 0.28; ly < H - 40; ly += bodyB.lh) {
        c.beginPath()
        c.moveTo(24, ly)
        c.lineTo(PAGE_W - 24, ly)
        c.stroke()
      }
      c.restore()
    },
  }
}

function leafletLayout(ctx: Ctx, env: Env, leaf: { heading: string; notice: string; body: string; sig?: string }): Layout {
  const { s, B, hi, w } = env
  const L = 86
  const R = PAGE_W - 86
  const ink = '#241a1c'
  const blocks: Block[] = []
  const anno = makeBlock(ctx, {
    text: `${w.to}: ${s.to} · ${w.from}: ${s.from} · ${s.dateLine}`, face: hand(env), size: B * 0.56, weight: '', lh: B * 0.72, x: L, y: 76, color: '#3a3d45', kind: 'hand', align: 'left', firstIndent: 0, checkable: true, maxW: R - L, alpha: 0.9,
  })
  blocks.push(anno)
  const headText = !hi && ascii(leaf.heading) ? leaf.heading.toUpperCase() : leaf.heading
  const head = makeBlock(ctx, {
    text: headText, face: hi ? FACE.deva : FACE.print, size: B * (hi ? 1.2 : 1.02), weight: '', lh: B * (hi ? 1.42 : 1.22), x: PAGE_W / 2, y: blockBottom(anno) + B * 1.55, color: ink, kind: 'print', align: 'center', firstIndent: 0, checkable: true, bold: 0.035, track: hi ? 0 : 3, maxW: R - L,
  })
  blocks.push(head)
  let y = blockBottom(head) + B * 0.45
  const ruleY = y
  y += B * 1.05
  const notice = makeBlock(ctx, {
    text: leaf.notice.toUpperCase(), face: hi ? FACE.deva : FACE.print, size: B * 0.78, weight: '', lh: B, x: PAGE_W / 2, y, color: ink, kind: 'print', align: 'center', firstIndent: 0, checkable: true, track: hi ? 0 : 9, bold: 0.02, maxW: R - L,
  })
  blocks.push(notice)
  y = blockBottom(notice) + B * 1.05
  const bodyB = makeBlock(ctx, {
    text: leaf.body, face: bodyFace(env, 'print'), size: B * (hi ? 1.02 : 0.98), weight: '', lh: B * (hi ? 1.48 : 1.4), x: L, y, color: ink, kind: 'print', align: 'left', firstIndent: B * 1.2, checkable: true, maxW: R - L,
  })
  blocks.push(bodyB)
  y = blockBottom(bodyB)
  if (leaf.sig) {
    const sb = makeBlock(ctx, {
      text: leaf.sig, face: hand(env), size: B * (hi ? 1.0 : 1.12), weight: '', lh: B * 1.3, x: R, y: y + B * 1.4, color: '#1f1718', kind: 'hand', align: 'right', firstIndent: 0, checkable: true, maxW: R - L - 80,
    })
    blocks.push(sb)
    y = blockBottom(sb)
  }
  return {
    height: y,
    blocks,
    bodyEnd: y,
    tint: 0xefc6c0,
    paint(c, H, rng) {
      paperBase(c, H, 0xefc6c0, rng, 0.4)
      crease(c, 0, H / 2, PAGE_W, H / 2)
      c.save()
      setMultiply(c)
      c.strokeStyle = ink
      c.lineWidth = 4
      c.beginPath()
      c.moveTo(L + 40, ruleY)
      c.lineTo(R - 40, ruleY)
      c.stroke()
      c.lineWidth = 1.5
      c.beginPath()
      c.moveTo(L + 40, ruleY + 8)
      c.lineTo(R - 40, ruleY + 8)
      c.stroke()
      c.restore()
    },
  }
}

function radioLayout(ctx: Ctx, env: Env): Layout {
  const { s, B, hi, w } = env
  const M = 168 // the red margin
  const L = M + 26
  const R = PAGE_W - 70
  const ink = '#1d1d24'
  const blocks: Block[] = []
  const head = makeBlock(ctx, {
    text: s.heading ?? HEADINGS.radio[s.lang], face: hi ? FACE.deva : FACE.type, size: B * (hi ? 0.95 : 0.84), weight: '', lh: B * 1.1, x: L, y: 118, color: ink, kind: 'type', align: 'left', firstIndent: 0, checkable: true, maxW: R - L,
  })
  blocks.push(head)
  let y = blockBottom(head) + B * 1.0
  const dateB = makeBlock(ctx, {
    text: s.dateLine, face: hi ? FACE.deva : FACE.type, size: B * 0.66, weight: '', lh: B * 0.85, x: R, y, color: ink, kind: 'type', align: 'right', firstIndent: 0, checkable: true, maxW: R - L - (s.serial ? 260 : 0),
  })
  blocks.push(dateB)
  if (s.serial) {
    blocks.push(makeBlock(ctx, {
      text: s.serial, face: hi ? FACE.deva : FACE.type, size: B * 0.66, weight: '', lh: B * 0.85, x: L, y, color: ink, kind: 'type', align: 'left', firstIndent: 0, checkable: true, maxW: 300,
    }))
  }
  y = blockBottom(dateB) + B * 0.95
  for (const [lab, val] of [[w.from, s.from], [w.to, s.to]] as const) {
    const t = hi ? `${lab}: ${val}` : `${lab.toUpperCase()}: ${val}`
    const b = makeBlock(ctx, {
      text: t, face: hi ? FACE.deva : FACE.type, size: B * 0.74, weight: '', lh: B * 1.0, x: L, y, color: ink, kind: 'type', align: 'left', firstIndent: 0, checkable: true, maxW: R - L,
    })
    blocks.push(b)
    y = blockBottom(b) + B * 0.62
  }
  y += B * 0.95
  const split = splitSignature(s.body)
  const bodyB = makeBlock(ctx, {
    text: split.body, face: bodyFace(env, 'type'), size: B * (hi ? 1.04 : 0.98), weight: '', lh: B * (hi ? 1.5 : 1.46), x: L, y, color: ink, kind: 'type', align: 'left', firstIndent: 0, checkable: true, maxW: R - L,
  })
  blocks.push(bodyB)
  y = blockBottom(bodyB)
  if (split.sig) {
    const sb = makeBlock(ctx, {
      text: `— ${split.sig}`, face: bodyFace(env, 'type'), size: B * 0.92, weight: '', lh: B * 1.2, x: R, y: y + B * 1.2, color: ink, kind: 'type', align: 'right', firstIndent: 0, checkable: true, maxW: R - L,
    })
    blocks.push(sb)
    y = blockBottom(sb)
  }
  const edits = hi ? ['धीरे'] : ['slow']
  return {
    height: y,
    blocks,
    bodyEnd: y,
    tint: 0xf3eedb,
    paint(c, H, rng) {
      paperBase(c, H, 0xf3eedb, rng, 0.35)
      c.save()
      // foolscap: blue rules under the typed lines, a red margin, two punched holes
      c.strokeStyle = 'rgba(80,120,175,0.3)'
      c.lineWidth = 1.5
      for (let ly = bodyB.y + B * 0.3; ly < H - 30; ly += bodyB.lh) {
        c.beginPath()
        c.moveTo(18, ly)
        c.lineTo(PAGE_W - 18, ly)
        c.stroke()
      }
      c.strokeStyle = 'rgba(190,60,55,0.55)'
      c.lineWidth = 2.2
      c.beginPath()
      c.moveTo(M, 0)
      c.lineTo(M, H)
      c.moveTo(M + 6, 0)
      c.lineTo(M + 6, H)
      c.stroke()
      for (const hy of [H * 0.28, H * 0.72]) {
        c.fillStyle = 'rgba(30,22,16,0.85)'
        c.beginPath()
        c.arc(78, hy, 17, 0, Math.PI * 2)
        c.fill()
        c.strokeStyle = 'rgba(255,255,255,0.35)'
        c.lineWidth = 2
        c.beginPath()
        c.arc(78, hy, 18, 0.3, 2.2)
        c.stroke()
      }
      // the typed heading underlined with the underscore key
      c.strokeStyle = 'rgba(29,29,36,0.8)'
      c.lineWidth = 2.4
      c.setLineDash([B * 0.42, B * 0.08])
      c.beginPath()
      const hw = Math.min(R - L, head.lines[0]?.w ?? 300)
      c.moveTo(L, head.y + B * 0.22)
      c.lineTo(L + hw, head.y + B * 0.22)
      c.stroke()
      c.setLineDash([])
      c.restore()
      // pencil edits by the announcer: a bracket and a note in the margin, a tick by the date
      const top = bodyB.y - B * 0.8
      const bot = bodyB.y + Math.min(2, bodyB.lines.length - 1) * bodyB.lh + B * 0.3
      c.save()
      c.strokeStyle = 'rgba(58,60,68,0.75)'
      c.lineWidth = 3
      c.lineCap = 'round'
      c.beginPath()
      c.moveTo(M - 14, top)
      c.quadraticCurveTo(M - 30, top, M - 30, top + 16)
      c.lineTo(M - 30, bot - 16)
      c.quadraticCurveTo(M - 30, bot, M - 14, bot)
      c.stroke()
      c.beginPath()
      const tx = R - (dateB.lines[0]?.w ?? 200) - 44
      c.moveTo(tx, dateB.y - B * 0.3)
      c.lineTo(tx + 10, dateB.y - B * 0.05)
      c.lineTo(tx + 30, dateB.y - B * 0.65)
      c.stroke()
      c.restore()
      pencilNote(c, edits[0] ?? '', 104, (top + bot) / 2 + 40, B * 0.66, -Math.PI / 2 + 0.06, hand(env), 'center')
    },
  }
}

function telegramLayout(ctx: Ctx, env: Env): Layout {
  const { s, B, hi, w } = env
  const L = 80
  const R = PAGE_W - 80
  const print = '#33446a'
  const ink = '#1a1b20'
  const red = '#ad2a1e'
  const violet = '#5b3a8c'
  const blocks: Block[] = []
  const typed = hi ? FACE.deva : FACE.type
  const head = makeBlock(ctx, {
    text: s.heading ?? HEADINGS.telegram[s.lang], face: hi ? FACE.deva : FACE.print, size: hi ? 92 : 78, weight: '', lh: 90, x: PAGE_W / 2, y: 150, color: print, kind: 'print', align: 'center', firstIndent: 0, checkable: true, bold: 0.03, track: hi ? 0 : 22, maxW: 700,
  })
  blocks.push(head)
  const rule1 = 196
  // the priority stamp (left) and the number (right) share a row
  const rowY = rule1 + 74
  const prio = makeBlock(ctx, {
    text: hi ? 'अति आवश्यक' : 'MOST IMMEDIATE', face: hi ? FACE.deva : FACE.print, size: hi ? 34 : 28, weight: '', lh: 40, x: L + 22, y: rowY, color: red, kind: 'print', align: 'left', firstIndent: 0, checkable: false, bold: 0.035, track: hi ? 0 : 4, maxW: 420,
  })
  const serial = makeBlock(ctx, {
    text: `${hi ? 'सं.' : 'No.'} ${s.serial ?? '3408-S'}`, face: typed, size: 36, weight: '', lh: 40, x: R, y: rowY, color: ink, kind: 'type', align: 'right', firstIndent: 0, checkable: true, maxW: 300, field: true,
  })
  blocks.push(prio, serial)
  // From and To, typed on dotted rules, with the Received stamp beside them
  const ringW = 230
  const valueX = L + 104
  const valueR = R - ringW - 20
  let y = rowY + 92
  const fieldTop = y
  const rules: [number, number][] = []
  for (const [lab, val] of [[w.from, s.from], [w.to, s.to]] as const) {
    blocks.push(makeBlock(ctx, {
      text: hi ? lab : lab.toUpperCase(), face: hi ? FACE.deva : FACE.print, size: hi ? 28 : 22, weight: '', lh: 30, x: L, y, color: print, kind: 'print', align: 'left', firstIndent: 0, checkable: false, track: hi ? 0 : 3, maxW: 100,
    }))
    const v = makeBlock(ctx, {
      text: val, face: typed, size: Math.min(40, B * 0.72), weight: '', lh: 46, x: valueX, y, color: ink, kind: 'type', align: 'left', firstIndent: 0, checkable: true, maxW: valueR - valueX, field: true,
    })
    blocks.push(v)
    for (let i = 0; i < v.lines.length; i++) rules.push([valueX, v.y + i * v.lh + 12])
    y = blockBottom(v) + 52
  }
  const ringY = fieldTop + 18
  const received = makeBlock(ctx, {
    text: s.dateLine, face: hi ? FACE.deva : FACE.print, size: hi ? 26 : 22, weight: '', lh: 26, x: R - ringW / 2, y: ringY + 16, color: violet, kind: 'print', align: 'center', firstIndent: 0, checkable: true, maxW: ringW - 40, alpha: 0.9,
  })
  blocks.push(received)
  y = Math.max(y, ringY + 110) + 6
  const rule2 = y
  y += B * 1.45
  const split = splitSignature(s.body)
  const bodyB = makeBlock(ctx, {
    text: split.body, face: bodyFace(env, 'type'), size: B * (hi ? 1.04 : 0.98), weight: '', lh: B * (hi ? 1.5 : 1.44), x: L + 6, y, color: ink, kind: 'type', align: 'left', firstIndent: 0, checkable: true, maxW: R - L - 12,
  })
  blocks.push(bodyB)
  y = blockBottom(bodyB)
  if (split.sig) {
    const sb = makeBlock(ctx, {
      text: split.sig, face: typed, size: B * 0.9, weight: '', lh: B * 1.2, x: R - 6, y: y + B * 1.15, color: ink, kind: 'type', align: 'right', firstIndent: 0, checkable: true, maxW: R - L,
    })
    blocks.push(sb)
    y = blockBottom(sb)
  }
  return {
    height: y,
    blocks,
    bodyEnd: y,
    tint: 0xf1e5bf,
    paint(c, H) {
      paperBase(c, H, 0xf1e5bf, mulberry32(seedFrom(s.body)), 0.45)
      c.save()
      setMultiply(c)
      c.strokeStyle = print
      c.fillStyle = print
      c.lineWidth = 2.5
      c.strokeRect(28, 28, PAGE_W - 56, H - 56)
      c.textBaseline = 'alphabetic'
      c.textAlign = 'center'
      c.font = font(hi ? FACE.deva : FACE.print, hi ? 24 : 20)
      c.fillText(hi ? 'सांकेतिक' : 'C I P H E R', PAGE_W / 2, 66)
      c.lineWidth = 3
      c.beginPath()
      c.moveTo(L, rule1)
      c.lineTo(R, rule1)
      c.stroke()
      c.lineWidth = 1
      c.beginPath()
      c.moveTo(L, rule1 + 7)
      c.lineTo(R, rule1 + 7)
      c.stroke()
      c.setLineDash([2, 8])
      c.lineWidth = 1.6
      for (const [x, ly] of rules) {
        c.beginPath()
        c.moveTo(x, ly)
        c.lineTo(valueR, ly)
        c.stroke()
      }
      c.setLineDash([])
      c.lineWidth = 1.2
      c.beginPath()
      c.moveTo(L, rule2)
      c.lineTo(R, rule2)
      c.stroke()
      c.restore()
      // rubber stamps: the violet Received ring and the red priority box
      c.save()
      setMultiply(c)
      c.translate(R - ringW / 2, ringY)
      c.rotate(-0.07)
      c.strokeStyle = violet
      c.fillStyle = violet
      c.globalAlpha = 0.78
      c.lineWidth = 3.5
      c.beginPath()
      c.ellipse(0, 0, ringW / 2, 66, 0, 0, Math.PI * 2)
      c.stroke()
      c.lineWidth = 1.4
      c.beginPath()
      c.ellipse(0, 0, ringW / 2 - 9, 57, 0, 0, Math.PI * 2)
      c.stroke()
      c.font = font(hi ? FACE.deva : FACE.print, hi ? 24 : 19)
      c.textAlign = 'center'
      c.fillText(hi ? 'प्राप्त' : 'R E C E I V E D', 0, -20)
      c.restore()
      c.save()
      setMultiply(c)
      c.translate(L + 10, rowY - (hi ? 40 : 34))
      c.rotate(-0.03)
      c.strokeStyle = red
      c.globalAlpha = 0.85
      c.lineWidth = 3
      c.strokeRect(0, 0, (prio.lines[0]?.w ?? 300) + 24, hi ? 54 : 46)
      c.restore()
    },
  }
}

const LAYOUTS: Record<Channel, (ctx: Ctx, env: Env) => Layout> = {
  petition: petitionLayout,
  note: noteLayout,
  radio: radioLayout,
  telegram: telegramLayout,
}

/** A short pencilled note in the hand face. */
function pencilNote(ctx: Ctx, text: string, x: number, y: number, size: number, rot: number, face: string, align: CanvasTextAlign = 'left'): void {
  if (!text) return
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rot)
  ctx.font = font(face, size)
  ctx.textAlign = align
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = 'rgba(52,54,62,0.86)'
  ctx.fillText(text, 0, 0)
  ctx.restore()
}

/** "check the underlined", bottom left, with a little arrow curling up toward the text. */
function checkNote(ctx: Ctx, env: Env, H: number): void {
  const size = Math.min(56, env.B * (env.hi ? 0.8 : 0.86))
  const x = env.s.channel === 'radio' ? 196 : 96
  const y = H - BOTTOM - 34
  const face = hand(env)
  ctx.save()
  ctx.font = font(face, size)
  const tw = ctx.measureText(env.w.check).width
  ctx.restore()
  pencilNote(ctx, env.w.check, x, y, size, -0.035, face, 'left')
  ctx.save()
  ctx.strokeStyle = 'rgba(52,54,62,0.72)'
  ctx.lineWidth = 2.6
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  const ax = x + tw * 0.55
  const ay = y - size * 1.05 - tw * 0.02
  ctx.beginPath()
  ctx.moveTo(ax - 18, ay + 8)
  ctx.quadraticCurveTo(ax + 6, ay - 22, ax + 4, ay - 62)
  ctx.moveTo(ax + 4, ay - 62)
  ctx.lineTo(ax - 10, ay - 44)
  ctx.moveTo(ax + 4, ay - 62)
  ctx.lineTo(ax + 18, ay - 45)
  ctx.stroke()
  ctx.restore()
}

/** The "real document" label tied to the top corner: a buff tag with a scroll mark. */
function documentTag(ctx: Ctx, env: Env): void {
  const text = env.w.real
  ctx.save()
  ctx.translate(PAGE_W - 40, 20)
  ctx.rotate(0.12)
  ctx.font = font(env.hi ? FACE.deva : FACE.print, env.B * (env.hi ? 0.54 : 0.48))
  const tw = ctx.measureText(env.hi ? text : text.toUpperCase()).width + (env.hi ? 0 : 2 * text.length)
  const w = tw + 110
  const h = 70
  ctx.translate(-w, 0)
  ctx.shadowColor = 'rgba(40,25,10,0.35)'
  ctx.shadowBlur = 10
  ctx.shadowOffsetY = 4
  ctx.fillStyle = '#d9c38f'
  ctx.beginPath()
  ctx.moveTo(26, 0)
  ctx.lineTo(w, 0)
  ctx.lineTo(w, h)
  ctx.lineTo(26, h)
  ctx.lineTo(0, h / 2)
  ctx.closePath()
  ctx.fill()
  ctx.shadowColor = 'rgba(0,0,0,0)'
  ctx.strokeStyle = 'rgba(90,60,25,0.6)'
  ctx.lineWidth = 2
  ctx.stroke()
  // the eyelet and its string
  ctx.fillStyle = '#6b5532'
  ctx.beginPath()
  ctx.arc(24, h / 2, 9, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#efe4c6'
  ctx.beginPath()
  ctx.arc(24, h / 2, 5, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#8a3b26'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(24, h / 2)
  ctx.bezierCurveTo(-10, h / 2 - 30, -30, h + 10, -8, h + 34)
  ctx.stroke()
  // a rolled scroll
  ctx.strokeStyle = '#5a3b1c'
  ctx.fillStyle = '#efe4c6'
  ctx.lineWidth = 2.4
  const sx = 52
  const sy = h / 2 - 15
  ctx.fillRect(sx, sy + 4, 30, 22)
  ctx.strokeRect(sx, sy + 4, 30, 22)
  for (const ex of [sx, sx + 30]) {
    ctx.beginPath()
    ctx.ellipse(ex, sy + 15, 5, 13, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
  }
  ctx.beginPath()
  ctx.moveTo(sx + 7, sy + 12)
  ctx.lineTo(sx + 24, sy + 12)
  ctx.moveTo(sx + 7, sy + 18)
  ctx.lineTo(sx + 20, sy + 18)
  ctx.stroke()
  ctx.fillStyle = '#3d2a14'
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left'
  const label = env.hi ? text : text.toUpperCase()
  if (env.hi) ctx.fillText(label, 96, h / 2 + 3)
  else {
    let x = 96
    for (const ch of label) {
      ctx.fillText(ch, x, h / 2 + 2)
      x += ctx.measureText(ch).width + 2
    }
  }
  ctx.restore()
}

// ---------------------------------------------------------------- the public drawer

function envFor(s: SheetSpec, B: number): Env {
  const hi = s.lang === 'hi'
  return { s, B, hi, w: WORDS[s.lang] }
}

function compose(ctx: Ctx, s: SheetSpec, B: number): Layout {
  return LAYOUTS[s.channel](ctx, envFor(s, B))
}

const totalH = (l: Layout) => l.height + FOOT + BOTTOM

export interface TypedKey {
  /** Page u just past this key's letter: the reveal edge once it is struck. */
  u: number
  space: boolean
}

export interface TypedLine {
  /** Page v (0 top … 1 bottom) of the line's top and bottom. */
  top: number
  bottom: number
  /** Page u where the line starts and ends. */
  x0: number
  x1: number
  chars: number
  /** A pre-typed form field (From, To, No.), shown at once. */
  field: boolean
  /** Every key struck along the line, in order: letters (a Devanagari cluster counts as one) and spaces. */
  keys: TypedKey[]
}

const MARK = /[\u0900-\u0903\u093A-\u094F\u0951-\u0957\u0962\u0963\u200C\u200D]/

/** A word as typewriter keys: each letter, with Devanagari signs and conjuncts kept on their letter. */
export function keyClusters(word: string): string[] {
  const out: string[] = []
  for (const ch of word) {
    const prev = out[out.length - 1]
    if (prev !== undefined && (MARK.test(ch) || prev.endsWith('\u094D'))) out[out.length - 1] = prev + ch
    else out.push(ch)
  }
  return out
}

/** The letter keys (no spaces) a text is typed with, in order. */
export function typedKeys(text: string): string[] {
  return text.split(/\s+/).filter(Boolean).flatMap(keyClusters)
}

export interface SheetMetrics {
  /** Height over width, between MIN_ASPECT and MAX_ASPECT. */
  aspect: number
  /** Body size in page units after any shrinking. */
  body: number
  /** A good centre for the stamp imprint, (u, v) across and down the sheet. */
  stampAt: [number, number]
  /** The paper's colour (0xRRGGBB). */
  tint: number
  /** Every typed line, top to bottom: the typewriter strikes these one by one. */
  typed: TypedLine[]
  /** Page v where the writing ends (the free paper below is for the stamp and notes). */
  bodyEnd: number
}

/**
 * The largest body size from `from` down to `to` (in steps) whose layout fits `room` units of
 * height, or `to` with its layout when none does.
 */
function fit(ctx: Ctx, s: SheetSpec, from: number, to: number, room: number): { B: number; lay: Layout; ok: boolean } {
  let B = from
  for (;;) {
    const lay = compose(ctx, s, B)
    if (totalH(lay) <= room) return { B, lay, ok: true }
    if (B <= to) return { B, lay, ok: false }
    B = Math.max(to, B - 2)
  }
}

/** Lays the sheet out without drawing: the aspect it wants and where the stamp should land. */
export function measureSheet(ctx: Ctx, s: SheetSpec, aspect?: number): SheetMetrics {
  ctx.save()
  try {
    let r: { B: number; lay: Layout; ok: boolean }
    if (aspect !== undefined) r = fit(ctx, s, BODY_MAX, BODY_MIN, aspect * PAGE_W)
    else {
      // big text on a 3:4-ish sheet first; then a taller sheet; only then smaller text
      r = fit(ctx, s, BODY_MAX, BODY, PREF_ASPECT * PAGE_W)
      if (!r.ok) r = fit(ctx, s, BODY, BODY_MIN, MAX_ASPECT * PAGE_W)
    }
    const B = r.B
    const lay = r.lay
    const want = Math.min(MAX_ASPECT, Math.max(MIN_ASPECT, totalH(lay) / PAGE_W))
    const a = aspect ?? want
    const H = a * PAGE_W
    const stampR = (STAMP_SHARE * PAGE_W) / 2
    // below the body if there is room, else over the bottom right of it
    const v = Math.min(H - BOTTOM - stampR * 0.7, Math.max(lay.bodyEnd + stampR * 0.75, H * 0.62)) / H
    const typed: TypedLine[] = []
    for (const b of lay.blocks) {
      if (b.kind !== 'type') continue
      ctx.font = font(b.face, b.size, b.weight)
      b.lines.forEach((line, i) => {
        const y = b.y + i * b.lh
        const x = lineLeft(b, i)
        // where each key's letter ends, measured the way paintBlock strikes it
        const keys: TypedKey[] = []
        line.toks.forEach((t, j) => {
          if (j > 0) keys.push({ u: (x + t.x - 2) / PAGE_W, space: true })
          const word = b.text.slice(t.s, t.e)
          const perChar = !isDeva(word)
          let prefix = ''
          let w = 0
          for (const c of keyClusters(word)) {
            prefix += c
            w = perChar ? w + ctx.measureText(c).width : ctx.measureText(prefix).width
            keys.push({ u: (x + t.x + w + 1.5) / PAGE_W, space: false })
          }
        })
        typed.push({
          top: (y - b.size * 0.95) / H,
          bottom: (y + b.size * 0.35) / H,
          x0: (x - 4) / PAGE_W,
          x1: (x + line.w + 6) / PAGE_W,
          chars: keys.length,
          field: b.field === true,
          keys,
        })
      })
    }
    typed.sort((p, q) => p.top - q.top || p.x0 - q.x0)
    return { aspect: a, body: B, stampAt: [0.71, Math.min(0.9, Math.max(0.3, v))], tint: lay.tint, typed, bodyEnd: lay.bodyEnd / H }
  } finally {
    ctx.restore()
  }
}

/**
 * Draws the sheet for `s` into a w × h canvas region from (0, 0). The text shrinks a little if it
 * would not fit h; extra height stays blank paper (room for the stamp). With `stamp` the ink
 * imprint is drawn too (the 2D fallback; the 3D stage uses a decal instead).
 */
export function drawSheet(ctx: Ctx, w: number, h: number, s: SheetSpec, stamp?: SheetStamp): void {
  // (drawn in the context's current transform, so a caller can place and turn the sheet)
  const k = w / PAGE_W
  const H = h / k
  const m = measureSheet(ctx, s, H / PAGE_W)
  const lay = compose(ctx, s, m.body)
  const rng = mulberry32(seedFrom(`${s.era}|${s.channel}|${s.from}|${s.body.length}`))
  ctx.save()
  ctx.scale(k, k)
  ctx.globalAlpha = 1
  ctx.globalCompositeOperation = 'source-over'
  lay.paint(ctx, H, rng)
  for (const b of lay.blocks) paintBlock(ctx, b, rng)
  let underlined = 0
  if (s.pencil && s.checks.length) for (const b of lay.blocks) underlined += paintChecks(ctx, b, s.checks, rng)
  const env = envFor(s, m.body)
  if (underlined > 0) checkNote(ctx, env, H)
  // R30b: the real-document tag gives the answer away, so only after the verdict
  if (s.documentMark && s.revealed === true) documentTag(ctx, env)
  if (stamp) {
    const size = STAMP_SHARE * PAGE_W
    drawStampImprint(ctx, stamp.kind, stamp.at[0] * PAGE_W, stamp.at[1] * H, size, stamp.rot, seedFrom(`${stamp.kind}${s.body.length}`), hex(lay.tint))
  }
  ctx.restore()
}

/** The sheet's aspect for `s` (height over width), from a throwaway measure. */
export function sheetAspect(ctx: Ctx, s: SheetSpec): number {
  return measureSheet(ctx, s).aspect
}

// ---------------------------------------------------------------- the day title

export type TitleTone = 'gilt' | 'chalk' | 'cream' | 'glass'

export const TITLE_TONE: Record<EraId, TitleTone> = {
  'delhi-1857': 'gilt',
  'lahore-1929': 'chalk',
  'bombay-1942': 'cream',
  'delhi-1947': 'glass',
}

/**
 * The day's title lettering in a w × h region (2:1 works well). `clear` wipes the region first, for
 * a transparent texture; the 2D fallback draws straight over its painted room instead.
 */
export function drawDayTitle(ctx: Ctx, w: number, h: number, t: DayTitle, tone: TitleTone, clear = true): void {
  ctx.save()
  if (clear) ctx.clearRect(0, 0, w, h)
  const bigFace = isDeva(t.big) ? FACE.deva : tone === 'cream' ? FACE.type : FACE.print
  const smallFace = isDeva(t.small) ? FACE.deva : tone === 'cream' ? FACE.type : FACE.print
  let big = h * 0.4
  let small = h * 0.13
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  const track = isDeva(t.big) ? 0 : big * 0.08
  const bigText = isDeva(t.big) ? t.big : t.big.toUpperCase()
  const width = (s: number) => {
    ctx.font = font(bigFace, s)
    return ctx.measureText(bigText).width + track * (s / big) * Math.max(0, bigText.length - 1)
  }
  while (width(big) > w * 0.9 && big > 8) big *= 0.94
  ctx.font = font(smallFace, small)
  while (ctx.measureText(t.small).width > w * 0.92 && small > 6) {
    small *= 0.94
    ctx.font = font(smallFace, small)
  }
  const by = h * 0.56
  const sy = h * 0.82
  // a soft dark breath behind the words, so they read on a lit wall
  if (tone !== 'glass') {
    const grd = ctx.createRadialGradient(w / 2, h * 0.58, 0, w / 2, h * 0.58, w * 0.48)
    grd.addColorStop(0, 'rgba(8,5,3,0.42)')
    grd.addColorStop(0.6, 'rgba(8,5,3,0.18)')
    grd.addColorStop(1, 'rgba(8,5,3,0)')
    ctx.fillStyle = grd
    ctx.fillRect(0, 0, w, h)
  }
  const fill = (() => {
    if (tone === 'gilt') {
      const g = ctx.createLinearGradient(0, by - big, 0, by)
      g.addColorStop(0, '#fff1c4')
      g.addColorStop(0.55, '#e6b75a')
      g.addColorStop(1, '#a8742a')
      return g
    }
    if (tone === 'cream') return '#f3e5c4'
    if (tone === 'chalk') return '#f4f0e4'
    return 'rgba(255,255,255,0.94)'
  })()
  const drawLine = (text: string, f: string, size: number, y: number, tr: number, color: string | CanvasGradient) => {
    ctx.font = font(f, size)
    const tw = ctx.measureText(text).width + tr * Math.max(0, text.length - 1)
    ctx.shadowColor = tone === 'glass' ? 'rgba(220,235,255,0.75)' : 'rgba(0,0,0,0.7)'
    ctx.shadowBlur = tone === 'glass' ? size * 0.25 : size * 0.12
    ctx.shadowOffsetY = tone === 'glass' ? 0 : size * 0.04
    ctx.fillStyle = color
    ctx.textAlign = 'left'
    if (tr && !isDeva(text)) {
      let x = (w - tw) / 2
      for (const ch of text) {
        ctx.fillText(ch, x, y)
        x += ctx.measureText(ch).width + tr
      }
    } else ctx.fillText(text, (w - tw) / 2, y)
    if (tone === 'gilt') {
      ctx.shadowColor = 'rgba(0,0,0,0)'
      ctx.strokeStyle = 'rgba(70,40,10,0.55)'
      ctx.lineWidth = Math.max(1, size * 0.018)
      if (tr && !isDeva(text)) {
        let x = (w - tw) / 2
        for (const ch of text) {
          ctx.strokeText(ch, x, y)
          x += ctx.measureText(ch).width + tr
        }
      } else ctx.strokeText(text, (w - tw) / 2, y)
    }
  }
  drawLine(bigText, bigFace, big, by, track * (big / (h * 0.4)), fill)
  // a thin rule between the lines
  ctx.shadowColor = 'rgba(0,0,0,0)'
  ctx.fillStyle = tone === 'gilt' ? 'rgba(230,183,90,0.85)' : tone === 'glass' ? 'rgba(255,255,255,0.6)' : 'rgba(243,229,196,0.7)'
  ctx.fillRect(w * 0.36, h * 0.645, w * 0.28, Math.max(1, h * 0.008))
  drawLine(t.small, smallFace, small, sy, 0, tone === 'gilt' ? '#f1d79a' : fill)
  ctx.restore()
}

// ---------------------------------------------------------------- the verdict on the paper

/** A rectangle on the page in fractions: u across from the left, v down from the top. */
export interface PageRect {
  u0: number
  v0: number
  u1: number
  v1: number
}

export interface Highlight {
  text: string
  /** One rectangle per line the text runs across (empty when it is not on the paper). */
  rects: PageRect[]
}

/** Where each highlight substring sits on the sheet, from the same layout drawSheet uses. */
export function highlightRects(ctx: Ctx, s: SheetSpec, strings: readonly string[], aspect?: number): Highlight[] {
  const m = measureSheet(ctx, s, aspect)
  const lay = compose(ctx, s, m.body)
  const H = m.aspect * PAGE_W
  return strings.map((text) => {
    const rects: PageRect[] = []
    for (const b of lay.blocks) {
      if (!b.checkable) continue
      for (const [a, z] of findChecks(b.text, [text])) {
        for (const sg of segments(ctx, b, a, z)) {
          rects.push({ u0: (sg.xa - 4) / PAGE_W, u1: (sg.xb + 4) / PAGE_W, v0: (sg.y - sg.size * 0.9) / H, v1: (sg.y + sg.size * 0.32) / H })
        }
      }
    }
    return { text, rects }
  })
}

/** Pencil colours: red for the slip in a forgery, indigo for the details of a genuine message. */
export const MARK_COLORS = { slip: 'rgba(176,32,24,0.9)', verified: 'rgba(38,58,140,0.88)' } as const

export interface MarkOptions {
  color: string
  note: string
  lang: Lang
  /** Body size in page units (the note is set from it). */
  body: number
  /** Page v where the writing ends: the note goes in the free paper below it. */
  bodyEnd: number
  /** 0..1: rings drawn first, one after another, then the note writes itself. */
  progress: number
  /** Draw over what is there (the 2D fallback's paper) instead of clearing a transparent layer. */
  keep?: boolean
  /** Boxes the note must keep clear of (the stamp's imprint), as page fractions. */
  avoid?: PageRect[]
}

/** The page box (fractions) an ASLI/TOTA imprint centred at (u, v) covers, with a little air. */
export function stampBox(u: number, v: number, aspect: number): PageRect {
  const r = (STAMP_SHARE / 2) * 1.08
  return { u0: u - r, u1: u + r, v0: v - r / aspect, v1: v + r / aspect }
}

/**
 * The verdict's pencil work on a transparent w × h canvas laid over the sheet: a hand-drawn ring
 * round each short highlight (a double stroke under a long one), and the margin note.
 */
export function drawRevealMarks(ctx: Ctx, w: number, h: number, marks: Highlight[], o: MarkOptions): void {
  const k = w / PAGE_W
  const H = h / k
  ctx.save()
  if (!o.keep) ctx.clearRect(0, 0, w, h)
  ctx.scale(k, k)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.strokeStyle = o.color
  ctx.fillStyle = o.color
  const segs = marks.flatMap((m) => m.rects)
  const n = Math.max(1, segs.length)
  const ringsEnd = segs.length ? 0.6 : 0
  segs.forEach((r, i) => {
    const p0 = (i / n) * ringsEnd
    const p = Math.max(0, Math.min(1, (o.progress - p0) / (ringsEnd / n + 0.12)))
    if (p <= 0) return
    const rng = mulberry32(seedFrom(`${i}${r.u0.toFixed(3)}`))
    const x0 = r.u0 * PAGE_W
    const x1 = r.u1 * PAGE_W
    const y0 = r.v0 * H
    const y1 = r.v1 * H
    if (x1 - x0 < PAGE_W * 0.48) {
      // a quick loop round the words, starting at the left and overshooting where it closes
      const cx = (x0 + x1) / 2
      const cy = (y0 + y1) / 2
      const rx = (x1 - x0) / 2 + 12
      const ry = (y1 - y0) / 2 + 9
      for (let pass = 0; pass < 2; pass++) {
        ctx.lineWidth = pass ? 2.4 : 4.4
        ctx.globalAlpha = pass ? 0.5 : 0.95
        ctx.beginPath()
        const start = Math.PI * (0.9 + rng() * 0.2)
        const sweep = Math.PI * 2 * 1.1 * p
        const steps = 48
        for (let j = 0; j <= steps; j++) {
          const a = start + (sweep * j) / steps
          const wob = 1 + 0.05 * Math.sin(a * 3 + pass) + (j / steps) * 0.06
          const x = cx + Math.cos(a) * rx * wob
          const y = cy + Math.sin(a) * ry * wob - (j / steps) * 3
          if (j === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
      }
    } else {
      // a long one is struck under twice
      for (let pass = 0; pass < 2; pass++) {
        ctx.lineWidth = pass ? 2.6 : 4
        ctx.globalAlpha = pass ? 0.55 : 0.92
        ctx.beginPath()
        const yy = y1 + 3 + pass * 6
        const xe = x0 + (x1 - x0) * p
        for (let x = x0; x <= xe; x += 12) {
          const y = yy + Math.sin(x * 0.05 + pass) * 2.5
          if (x === x0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
      }
    }
  })
  ctx.globalAlpha = 1
  // the margin note, written in after the rings: in the free paper below the writing, above the
  // check note, beside (never under) the stamp; up to three lines, a little smaller if it must be
  const np = Math.max(0, Math.min(1, (o.progress - ringsEnd) / (1 - ringsEnd || 1)))
  if (o.note && np > 0) {
    const hi = o.lang === 'hi'
    const face = hi ? FACE.deva : FACE.hand
    const base = Math.min(58, o.body * (hi ? 0.86 : 0.94))
    const top0 = o.bodyEnd * H + base * 0.45
    const bottom0 = H - BOTTOM - 34 - base * 1.15
    let x0 = 90
    let x1 = PAGE_W - 90
    for (const b of o.avoid ?? []) {
      const by0 = b.v0 * H
      const by1 = b.v1 * H
      if (by1 <= top0 || by0 >= bottom0) continue
      const leftW = b.u0 * PAGE_W - 18 - x0
      const rightW = x1 - (b.u1 * PAGE_W + 18)
      if (leftW >= rightW) x1 = Math.min(x1, b.u0 * PAGE_W - 18)
      else x0 = Math.max(x0, b.u1 * PAGE_W + 18)
    }
    const room = Math.max(base * 1.3, bottom0 - top0)
    let size = base
    let lines: Line[] = []
    for (;;) {
      ctx.font = font(face, size)
      lines = wrapText(ctx, o.note, Math.max(160, x1 - x0))
      const fits = lines.length <= 3 && lines.length * size * 1.22 <= room
      if (fits || size <= base * 0.62) break
      size *= 0.94
    }
    const lh = size * 1.22
    const blockH = lines.length * lh
    const top = top0 + Math.max(0, (room - blockH) / 2) + size * 0.85
    // revealed a whole word at a time, so no word is ever cut part-way
    const words = lines.reduce((n, l) => n + l.toks.length, 0)
    let left = Math.round(words * np)
    ctx.save()
    ctx.translate(x0, top)
    ctx.rotate(-0.025)
    ctx.textBaseline = 'alphabetic'
    ctx.textAlign = 'left'
    lines.forEach((line, i) => {
      for (const t of line.toks) {
        if (left <= 0) return
        left--
        ctx.fillText(o.note.slice(t.s, t.e), t.x, i * lh)
      }
    })
    ctx.restore()
  }
  ctx.restore()
}

const STAMP_TONES: Record<RevealStampTone, string> = { caught: '#981b13', wrong: '#a8261a', right: '#1d6a3a', survived: '#21458a' }
type RevealStampTone = 'caught' | 'survived' | 'right' | 'wrong'

/** The era's rubber stamp: a Mughal seal, a police stamp, RAIDED, a telegraph office stamp. */
export function drawEraStamp(
  ctx: Ctx,
  cx: number,
  cy: number,
  size: number,
  st: { text: string; tone: RevealStampTone; style: 'seal' | 'police' | 'raided' | 'telegraph' },
  o: { lang: Lang; date: string; paper: string; seed: number },
): void {
  const rng = mulberry32(o.seed)
  const col = STAMP_TONES[st.tone]
  const hi = o.lang === 'hi'
  const face = hi ? FACE.deva : FACE.print
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(st.style === 'raided' ? -0.14 : -0.06 + rng() * 0.08)
  setMultiply(ctx)
  ctx.globalAlpha = 0.9
  ctx.strokeStyle = col
  ctx.fillStyle = col
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const fit = (text: string, max: number, px: number, weight = '') => {
    let p = px
    ctx.font = font(face, p, weight)
    while (ctx.measureText(text).width > max && p > 8) {
      p *= 0.93
      ctx.font = font(face, p, weight)
    }
    return p
  }
  const label = hi ? st.text : st.text.toUpperCase()
  if (st.style === 'raided') {
    const w = size * 1.25
    const h = size * 0.5
    ctx.lineWidth = size * 0.05
    ctx.strokeRect(-w / 2, -h / 2, w, h)
    ctx.lineWidth = size * 0.015
    ctx.strokeRect(-w / 2 + size * 0.05, -h / 2 + size * 0.05, w - size * 0.1, h - size * 0.1)
    const p = fit(label, w * 0.82, size * 0.24)
    ctx.fillText(label, 0, 0)
    ctx.lineWidth = p * 0.04
    ctx.strokeText(label, 0, 0)
  } else if (st.style === 'police') {
    const rx = size * 0.62
    const ry = size * 0.38
    ctx.lineWidth = size * 0.04
    ctx.beginPath()
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2)
    ctx.stroke()
    ctx.lineWidth = size * 0.013
    ctx.beginPath()
    ctx.ellipse(0, 0, rx - size * 0.06, ry - size * 0.06, 0, 0, Math.PI * 2)
    ctx.stroke()
    fit(label, rx * 1.5, size * 0.17)
    ctx.fillText(label, 0, size * 0.02)
    for (const sx of [-1, 1]) {
      star(ctx, sx * rx * 0.78, 0, size * 0.04, 5, 0.45)
      ctx.fill()
    }
    ctx.font = font(face, size * 0.075)
    ctx.fillText(o.date, 0, ry * 0.62)
  } else if (st.style === 'telegraph') {
    const r = size * 0.48
    ctx.lineWidth = size * 0.035
    ctx.beginPath()
    ctx.arc(0, 0, r, 0, Math.PI * 2)
    ctx.stroke()
    ctx.lineWidth = size * 0.012
    ctx.beginPath()
    ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2)
    ctx.stroke()
    // the date bar across the middle
    ctx.fillRect(-r * 0.8, -size * 0.07, r * 1.6, size * 0.012)
    ctx.fillRect(-r * 0.8, size * 0.07, r * 1.6, size * 0.012)
    fit(o.date, r * 1.45, size * 0.085)
    ctx.fillText(o.date, 0, 0)
    fit(label, r * 1.3, size * 0.12)
    ctx.fillText(label, 0, -r * 0.4)
    ctx.font = font(face, size * 0.07)
    ctx.fillText(hi ? 'तार घर' : 'TELEGRAPH OFFICE', 0, r * 0.4)
  } else {
    // the Mughal seal: rings, a band of strokes, the words at the heart
    const r = size * 0.48
    ctx.lineWidth = size * 0.04
    ctx.beginPath()
    ctx.arc(0, 0, r, 0, Math.PI * 2)
    ctx.stroke()
    ctx.lineWidth = size * 0.013
    ctx.beginPath()
    ctx.arc(0, 0, r * 0.84, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(0, 0, r * 0.62, 0, Math.PI * 2)
    ctx.stroke()
    ctx.lineWidth = size * 0.02
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2
      ctx.beginPath()
      ctx.arc(Math.cos(a) * r * 0.73, Math.sin(a) * r * 0.73, size * 0.025, a, a + 2)
      ctx.stroke()
    }
    fit(label, r * 1.1, size * 0.13)
    ctx.fillText(label, 0, 0)
  }
  // worn ink
  ctx.globalCompositeOperation = 'source-over'
  ctx.fillStyle = o.paper
  for (let i = 0; i < 220; i++) {
    ctx.globalAlpha = 0.25 + rng() * 0.55
    const rr = Math.sqrt(rng()) * size * 0.62
    const a = rng() * Math.PI * 2
    const sz = size * (0.004 + rng() * 0.01)
    ctx.fillRect(Math.cos(a) * rr, Math.sin(a) * rr * 0.8, sz, sz)
  }
  ctx.restore()
}

/** The back's inner box (page units) for each paper: words never cross into its furniture. */
export function backBox(channel: Channel, H: number): { L: number; R: number; top: number; bottom: number } {
  if (channel === 'petition') return { L: 120, R: PAGE_W - 120, top: 122, bottom: H - 112 } // inside the floral band
  if (channel === 'telegram') return { L: 82, R: PAGE_W - 82, top: 92, bottom: H - 66 } // inside the printed border
  if (channel === 'radio') return { L: 96, R: PAGE_W - 196, top: 92, bottom: H - 62 } // left of the red margin
  return { L: 96, R: PAGE_W - 96, top: 92, bottom: H - 62 }
}

/** One line of source: the size that fits (30 down to 23 units), else cut at a word with an ellipsis. */
export function sourceLine(ctx: Ctx, text: string, face: string, maxW: number): { text: string; size: number; w: number } {
  let size = 30
  ctx.font = font(face, size)
  while (ctx.measureText(text).width > maxW && size > 23) {
    size -= 1
    ctx.font = font(face, size)
  }
  let t = text
  if (ctx.measureText(t).width > maxW) {
    const words = text.split(' ')
    while (words.length > 1 && ctx.measureText(`${words.join(' ')}…`).width > maxW) words.pop()
    t = `${words.join(' ')}…`
    // a single overlong word: cut letters until it fits
    while (t.length > 2 && ctx.measureText(t).width > maxW) t = `${t.slice(0, -2)}…`
  }
  return { text: t, size, w: Math.min(maxW, ctx.measureText(t).width) }
}

export interface BackLayout {
  /** The source line on the back, for an accessible link laid over it. */
  source: PageRect
  /** Clear paper beside the era stamp (or above the source), where a reward may land. */
  free: PageRect
}

/**
 * The paper's back after the verdict, in the same form typography as its front: the verdict line,
 * the tell, the consequence when caught, the era stamp and a small source line. Returns where the
 * source line sits.
 */
export function drawSheetBack(
  ctx: Ctx,
  w: number,
  h: number,
  s: SheetSpec,
  r: { outcome: 'right' | 'wrong' | 'timeout'; back: { verdictLine: string; tell: string; consequence?: string; stamp?: { text: string; tone: RevealStampTone; style: 'seal' | 'police' | 'raided' | 'telegraph' }; source: string } },
  o: { stamp: boolean },
): BackLayout {
  const k = w / PAGE_W
  const H = h / k
  const hi = s.lang === 'hi'
  const leaf = splitLeaflet(s)
  const tint = s.channel === 'petition' ? 0xeedfba : s.channel === 'telegram' ? 0xf1e5bf : s.channel === 'radio' ? 0xf3eedb : leaf ? 0xefc6c0 : 0xf0ebdc
  const rng = mulberry32(seedFrom(`back|${s.era}|${r.back.verdictLine}`))
  // every word stays inside the paper's inner box: clear of the floral band, the printed border,
  // the foolscap margin
  const box = backBox(s.channel, H)
  const L = box.L
  const R = box.R
  const good = r.outcome === 'right'
  const ink = '#241a14'
  const verdictCol = good ? '#1d5c36' : '#a3261a'
  const printFace = hi ? FACE.deva : s.channel === 'telegram' || s.channel === 'radio' ? FACE.type : FACE.print
  const bodyF = hi ? FACE.deva : s.channel === 'note' ? FACE.hand : s.channel === 'petition' ? FACE.print : FACE.type
  ctx.save()
  ctx.scale(k, k)
  paperBase(ctx, H, tint, rng, 0.6)
  // the same furniture as the front, so it reads as the same paper
  if (s.channel === 'petition') floralBorder(ctx, H, rng)
  else if (s.channel === 'telegram') {
    ctx.save()
    setMultiply(ctx)
    ctx.strokeStyle = '#33446a'
    ctx.lineWidth = 2.5
    ctx.strokeRect(28, 28, PAGE_W - 56, H - 56)
    ctx.restore()
  } else if (s.channel === 'radio') {
    ctx.save()
    ctx.strokeStyle = 'rgba(190,60,55,0.55)'
    ctx.lineWidth = 2.2
    ctx.beginPath()
    ctx.moveTo(PAGE_W - 168, 0)
    ctx.lineTo(PAGE_W - 168, H)
    ctx.stroke()
    ctx.restore()
  } else crease(ctx, 0, H / 2, PAGE_W, H / 2)
  // the verdict as a headline, the tell and the consequence at the front's body size; all of it
  // shrinks together only if the stamp and the source would not fit below
  // the source: one line (a short form of about 60 characters fits), smaller if it must be, and
  // cut with an ellipsis beyond that
  const srcFace = hi ? FACE.deva : FACE.print
  const srcText = sourceLine(ctx, (hi ? 'स्रोत: ' : 'Source: ') + r.back.source, srcFace, R - L)
  const srcSize = srcText.size
  const srcH = srcSize * 1.6
  const layoutAt = (k: number) => {
    const B = 64 * k
    const vSize = (hi ? 96 : 88) * k
    const verdict = makeBlock(ctx, {
      text: r.back.verdictLine, face: printFace, size: vSize, weight: '', lh: (hi ? 112 : 100) * k, x: L, y: box.top + vSize * 0.85, color: verdictCol, kind: 'print', align: 'left', firstIndent: 0, checkable: false, bold: 0.028, maxW: R - L,
    })
    let y = blockBottom(verdict) + B * 0.5
    const ruleY = y
    y += B * 1.25
    const tell = makeBlock(ctx, {
      text: r.back.tell, face: bodyF, size: B * (hi ? 1.0 : 0.96), weight: '', lh: B * (hi ? 1.5 : 1.42), x: L, y, color: ink, kind: s.channel === 'note' ? 'hand' : 'print', align: 'left', firstIndent: 0, checkable: false, maxW: R - L,
    })
    y = blockBottom(tell)
    let cons: Block | null = null
    if (r.back.consequence) {
      cons = makeBlock(ctx, {
        text: r.back.consequence, face: hi ? FACE.deva : FACE.print, size: B * 0.86, weight: '', lh: B * 1.3, x: L, y: y + B * 1.2, color: '#6e1d14', kind: 'print', align: 'left', firstIndent: 0, checkable: false, maxW: R - L,
      })
      y = blockBottom(cons)
    }
    return { verdict, tell, cons, ruleY, y, B }
  }
  let fitK = 1
  let lay = layoutAt(fitK)
  // (room for the stamp is kept whether or not it has landed yet, so the words never jump)
  const stampRoom = r.back.stamp ? 230 : 40
  while (lay.y + lay.B * 0.6 + stampRoom + srcH > box.bottom && fitK > 0.62) {
    fitK *= 0.94
    lay = layoutAt(fitK)
  }
  const { verdict, tell, cons, ruleY } = lay
  let y = lay.y
  const B = lay.B
  for (const b of [verdict, tell, ...(cons ? [cons] : [])]) paintBlock(ctx, b, rng)
  ctx.save()
  setMultiply(ctx)
  ctx.strokeStyle = verdictCol
  ctx.globalAlpha = 0.6
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(L, ruleY)
  ctx.lineTo(L + (R - L) * 0.6, ruleY)
  ctx.stroke()
  ctx.restore()
  // the source, small, at the foot of the inner box, underlined like a reference to follow
  const srcTop = box.bottom - srcSize * 0.35
  ctx.font = font(srcFace, srcSize)
  ctx.fillStyle = '#3a4a6a'
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'
  ctx.fillText(srcText.text, L, srcTop)
  const srcW = srcText.w
  ctx.strokeStyle = 'rgba(58,74,106,0.5)'
  ctx.setLineDash([3, 5])
  ctx.lineWidth = 1.5
  ctx.beginPath()
  const lastY = srcTop + 6
  ctx.moveTo(L, lastY)
  ctx.lineTo(L + srcW, lastY)
  ctx.stroke()
  ctx.setLineDash([])
  // the stamp, in the free paper between the words and the source
  const free0 = y + B * 0.6
  const free1 = srcTop - srcSize * 1.4
  const size = Math.max(150, Math.min(340, free1 - free0, (R - L) * 0.5))
  const cy = Math.min(free1 - size * 0.5, Math.max(free0 + size * 0.5, (free0 + free1) / 2))
  const stampX = L + (R - L) * 0.64
  if (o.stamp && r.back.stamp) {
    drawEraStamp(ctx, stampX, cy, size, r.back.stamp, { lang: s.lang, date: s.dateLine, paper: hex(tint), seed: seedFrom(r.back.stamp.text) })
  }
  ctx.restore()
  // a reward lands left of the stamp, in the same band (the stamp's room is kept whether or not it shows)
  const fx1 = r.back.stamp ? Math.max(L + (R - L) * 0.3, stampX - size * 0.55) : L + (R - L) * 0.45
  const fy0 = r.back.stamp ? Math.max(free0, cy - size * 0.5) : free0
  const fy1 = r.back.stamp ? Math.min(free1, cy + size * 0.5) : Math.max(free0 + 1, free1)
  return {
    source: { u0: L / PAGE_W, u1: (L + srcW) / PAGE_W, v0: (srcTop - srcSize) / H, v1: (lastY + 8) / H },
    free: { u0: L / PAGE_W, u1: fx1 / PAGE_W, v0: fy0 / H, v1: Math.max(fy0 + 1, fy1) / H },
  }
}
