// Text for the share card, as glyph outlines. HarfBuzz (harfbuzzjs) shapes every line, so Hindi
// gets its conjuncts, its matras in the right place and its headline joined, and the card knows
// each line's exact width before it draws it. The renderer then only fills paths: no font is
// handed to it, and no text it might shape on its own.
//
// Server only. The fonts are the game's own families as TTF (server/og/fonts, scripts/og-fonts.sh).
import { readFileSync } from 'node:fs'
import * as hb from 'harfbuzzjs'

export type FaceName = 'print' | 'printBold' | 'deva' | 'type' | 'hand'

const FILES: Record<FaceName, string> = {
  print: 'old-standard-tt-400.ttf',
  printBold: 'old-standard-tt-700.ttf',
  deva: 'tiro-devanagari-hindi-400.ttf',
  type: 'special-elite-400.ttf',
  hand: 'kalam-400.ttf',
}

/** The faces that carry Devanagari; a line in Hindi is always set in one of them. */
const DEVA_FACES: ReadonlySet<FaceName> = new Set(['deva', 'hand'])

interface Loaded { font: hb.Font; upem: number; paths: Map<number, string> }
const loaded = new Map<FaceName, Loaded>()

function face(name: FaceName): Loaded {
  let f = loaded.get(name)
  if (!f) {
    const data = readFileSync(new URL(`./fonts/${FILES[name]}`, import.meta.url))
    const hbFace = new hb.Face(new hb.Blob(new Uint8Array(data)))
    f = { font: new hb.Font(hbFace), upem: hbFace.upem, paths: new Map() }
    loaded.set(name, f)
  }
  return f
}

const DEVA_RE = /[ऀ-ॿ]/

/** The face a line is really set in: a Latin-only face falls back to Tiro for Devanagari. */
export function faceFor(name: FaceName, text: string): FaceName {
  return DEVA_RE.test(text) && !DEVA_FACES.has(name) ? 'deva' : name
}

export interface Shaped {
  face: FaceName
  /** Glyph ids and pen positions, in font units (y up). */
  glyphs: { id: number; x: number; y: number }[]
  /** The advance of the whole line, in font units, tracking included. */
  advance: number
  upem: number
}

/** Shapes one line. `tracking` adds space after each spacing glyph, in em. */
export function shape(name: FaceName, text: string, tracking = 0): Shaped {
  const real = faceFor(name, text)
  const f = face(real)
  const buf = new hb.Buffer()
  buf.addText(text)
  buf.guessSegmentProperties()
  hb.shape(f.font, buf)
  const infos = buf.getGlyphInfos()
  const pos = buf.getGlyphPositions()
  const glyphs: Shaped['glyphs'] = []
  let x = 0
  const track = tracking * f.upem
  infos.forEach((info, i) => {
    const p = pos[i]!
    glyphs.push({ id: info.codepoint, x: x + p.xOffset, y: p.yOffset })
    x += p.xAdvance + (p.xAdvance > 0 ? track : 0)
  })
  if (track && glyphs.length) x -= track // no tracking after the last glyph
  return { face: real, glyphs, advance: x, upem: f.upem }
}

/** A glyph's outline as SVG path data, in font units (y up). */
export function glyphPath(name: FaceName, id: number): string {
  const f = face(name)
  let d = f.paths.get(id)
  if (d === undefined) {
    d = f.font.glyphToPath(id)
    f.paths.set(id, d)
  }
  return d
}

/** Collects the glyph outlines one card uses, so each is defined once and placed with <use>. */
export class GlyphSheet {
  private used = new Map<string, string>()

  ref(face: FaceName, id: number): string {
    const key = `g-${face}-${id}`
    if (!this.used.has(key)) this.used.set(key, glyphPath(face, id))
    return key
  }

  defs(): string {
    return [...this.used].filter(([, d]) => d).map(([id, d]) => `<path id="${id}" d="${d}"/>`).join('')
  }
}

export interface TextOpts {
  face: FaceName
  /** Font size in px. */
  size: number
  x: number
  /** The baseline. */
  y: number
  anchor?: 'start' | 'middle' | 'end'
  /** The line shrinks to fit this width (never grows). */
  maxWidth?: number
  tracking?: number
  /** Attributes for the group: fill, opacity, filter… Our own constants only. */
  attrs?: string
  /** An outline drawn under the fill, its width in px. */
  stroke?: { color: string; width: number }
}

/** The width a line takes at `size` px. */
export function measure(name: FaceName, text: string, size: number, tracking = 0): number {
  const s = shape(name, text, tracking)
  return (s.advance / s.upem) * size
}

/**
 * One line of text as a group of glyph <use>s. The text never reaches the SVG as text: only
 * glyph ids and numbers do.
 */
export function textLine(sheet: GlyphSheet, text: string, o: TextOpts): string {
  const s = shape(o.face, text, o.tracking ?? 0)
  let size = o.size
  const width = (s.advance / s.upem) * size
  if (o.maxWidth && width > o.maxWidth) size *= o.maxWidth / width
  const k = size / s.upem
  const w = s.advance * k
  const x0 = o.anchor === 'middle' ? o.x - w / 2 : o.anchor === 'end' ? o.x - w : o.x
  const uses = s.glyphs
    .map((g) => {
      const id = sheet.ref(s.face, g.id)
      return glyphPath(s.face, g.id) ? `<use href="#${id}" x="${round(g.x)}" y="${round(g.y)}"/>` : ''
    })
    .join('')
  const stroke = o.stroke ? ` stroke="${o.stroke.color}" stroke-width="${round(o.stroke.width / k)}" stroke-linejoin="round" paint-order="stroke"` : ''
  return `<g transform="translate(${round(x0)} ${round(o.y)}) scale(${k.toFixed(5)} ${(-k).toFixed(5)})"${stroke}${o.attrs ? ` ${o.attrs}` : ''}>${uses}</g>`
}

/** Where a line ends up: its left edge and width in px, for laying out what sits beside it. */
export function lineBox(text: string, o: Pick<TextOpts, 'face' | 'size' | 'x' | 'anchor' | 'maxWidth' | 'tracking'>): { x: number; w: number; size: number } {
  let size = o.size
  const width = measure(o.face, text, size, o.tracking ?? 0)
  if (o.maxWidth && width > o.maxWidth) size *= o.maxWidth / width
  const w = Math.min(width, o.maxWidth ?? Infinity)
  return { x: o.anchor === 'middle' ? o.x - w / 2 : o.anchor === 'end' ? o.x - w : o.x, w, size }
}

const round = (n: number) => Math.round(n * 10) / 10
