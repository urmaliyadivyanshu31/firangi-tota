// The rewards' look, drawn by hand on a 2D canvas: what shape each treasure is on the desk (LOOKS,
// for src/scene/rewards.ts), the art on its face (drawFace: a coin's struck face, a note's print, a
// sweet box's lid), and a small icon of it (drawIcon) for the flat desk and the home page's tag.
// No three.js here. Mughal coins carry abstract strokes in place of their legends, and nothing is
// religious.
import { FACE } from './sheet'

type G = CanvasRenderingContext2D

export type Metal = 'copper' | 'silver' | 'gold' | 'cupronickel' | 'nickelbrass' | 'nickel' | 'brass'

/** What a treasure is, in the round. Sizes are world metres (a coin's radius, a card's width). */
export type Look =
  | { kind: 'coin'; metal: Metal; r: number; t: number; scallops?: number; rough?: boolean; motif: CoinMotif }
  | { kind: 'flat'; w: number; d: number; paper: string; art: FlatArt }
  | { kind: 'dona'; r: number; h: number }
  | { kind: 'packet'; w: number; d: number; h: number; art: 'newsprint' | 'butter' }
  | { kind: 'box'; w: number; d: number; h: number }
  | { kind: 'valve'; r: number; h: number }
  | { kind: 'seal'; r: number; h: number }
  | { kind: 'badge'; r: number }

export type CoinMotif =
  | { strokes: number } // Mughal legend, drawn as abstract strokes
  | { lines: string[] } // a British India coin's reverse, its words and year
export type FlatArt = 'note' | 'leaflet' | 'radio-card' | 'pass'

/** Every item's look. Coins a little over life size so they read on the desk. */
export const LOOKS: Record<string, Look> = {
  'paisa-1857': { kind: 'coin', metal: 'copper', r: 0.0112, t: 0.0034, rough: true, motif: { strokes: 3 } },
  'halwa-1857': { kind: 'dona', r: 0.019, h: 0.011 },
  'rupee-1857': { kind: 'coin', metal: 'silver', r: 0.0118, t: 0.0026, motif: { strokes: 4 } },
  'mohur-1857': { kind: 'coin', metal: 'gold', r: 0.0108, t: 0.0024, motif: { strokes: 4 } },
  'seal-1857': { kind: 'seal', r: 0.0105, h: 0.019 },

  'anna-1929': { kind: 'coin', metal: 'cupronickel', r: 0.0112, t: 0.0018, scallops: 12, motif: { lines: ['1', 'ANNA', '1929'] } },
  'barfi-1929': { kind: 'packet', w: 0.036, d: 0.026, h: 0.012, art: 'newsprint' },
  'rupee-1929': { kind: 'coin', metal: 'silver', r: 0.0152, t: 0.0021, motif: { lines: ['ONE', 'RUPEE', 'INDIA 1929'] } },
  'note-1929': { kind: 'flat', w: 0.064, d: 0.038, paper: '#c9d0b0', art: 'note' },
  'leaflet-1929': { kind: 'flat', w: 0.05, d: 0.066, paper: '#e8b4ab', art: 'leaflet' },

  'pice-1942': { kind: 'coin', metal: 'copper', r: 0.0128, t: 0.0017, motif: { lines: ['1/4', 'ANNA', '1942'] } },
  'halwa-1942': { kind: 'packet', w: 0.04, d: 0.03, h: 0.008, art: 'butter' },
  'rupee-1942': { kind: 'coin', metal: 'silver', r: 0.0152, t: 0.0021, motif: { lines: ['ONE', 'RUPEE', 'INDIA 1942'] } },
  'valve-1942': { kind: 'valve', r: 0.0095, h: 0.036 },
  'card-1942': { kind: 'flat', w: 0.06, d: 0.038, paper: '#efe5cb', art: 'radio-card' },

  'anna-1947': { kind: 'coin', metal: 'nickelbrass', r: 0.0108, t: 0.0018, scallops: 12, motif: { lines: ['1', 'ANNA', '1947'] } },
  'jalebi-1947': { kind: 'box', w: 0.04, d: 0.031, h: 0.014 },
  'rupee-1947': { kind: 'coin', metal: 'nickel', r: 0.0142, t: 0.002, motif: { lines: ['ONE', 'RUPEE', 'INDIA 1947'] } },
  'pass-1947': { kind: 'flat', w: 0.056, d: 0.036, paper: '#efe9d8', art: 'pass' },
  'badge-1947': { kind: 'badge', r: 0.0125 },
}

/** Light, base and shadow of each metal. */
export const METALS: Record<Metal, [string, string, string]> = {
  copper: ['#eaa676', '#b46b3c', '#5e3018'],
  silver: ['#f4f5f4', '#c4c8ca', '#6f7478'],
  gold: ['#ffe596', '#d9a536', '#82560f'],
  cupronickel: ['#efefe8', '#bfc0b8', '#6d6e68'],
  nickelbrass: ['#f6e6a6', '#c9b263', '#6e5c22'],
  nickel: ['#f2f3f0', '#c3c5c1', '#71736f'],
  brass: ['#f0cf7c', '#b38b39', '#5d4416'],
}

/** The colour a treasure shows on its edges and sides (a coin's rim, a card's edge, a box's sides). */
export function sideColor(id: string): string {
  const l = LOOKS[id]
  if (!l) return '#a08060'
  switch (l.kind) {
    case 'coin':
      return METALS[l.metal][1]
    case 'flat':
      return l.paper
    case 'dona':
      return '#5f7a35'
    case 'packet':
      return l.art === 'newsprint' ? '#d9d1bb' : '#e9dcae'
    case 'box':
      return '#e6d7b4'
    case 'valve':
      return '#cfd6d6'
    case 'seal':
      return METALS.brass[1]
    case 'badge':
      return '#d8d8d0'
  }
}

/** A hash of the id, so each drawing keeps its own small irregularities. */
function seeded(id: string): () => number {
  let h = 2166136261
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619)
  let a = h >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** A coin's outline: round, scalloped, or hand-struck and a little uneven. */
function coinPath(g: G, cx: number, cy: number, r: number, l: Extract<Look, { kind: 'coin' }>, rnd: () => number): void {
  g.beginPath()
  const n = 72
  const bumps = Array.from({ length: 7 }, () => (rnd() - 0.5) * 0.06)
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2
    let rr = r
    if (l.scallops) rr = r * (0.94 + 0.06 * Math.abs(Math.cos((a * l.scallops) / 2)))
    if (l.rough) rr = r * (1 + bumps[i % 7]! * Math.sin(a * 3 + 1))
    const x = cx + Math.cos(a) * rr
    const y = cy + Math.sin(a) * rr
    if (i === 0) g.moveTo(x, y)
    else g.lineTo(x, y)
  }
  g.closePath()
}

function coinFace(g: G, id: string, cx: number, cy: number, r: number, l: Extract<Look, { kind: 'coin' }>): void {
  const [light, base, dark] = METALS[l.metal]
  const rnd = seeded(id)
  g.save()
  coinPath(g, cx, cy, r, l, rnd)
  const grad = g.createRadialGradient(cx - r * 0.35, cy - r * 0.4, r * 0.05, cx, cy, r * 1.05)
  grad.addColorStop(0, light)
  grad.addColorStop(0.55, base)
  grad.addColorStop(1, dark)
  g.fillStyle = grad
  g.fill()
  g.clip()
  // a raised rim and a ring of beads inside it, struck a little off centre on a hand-struck coin
  g.strokeStyle = dark
  g.globalAlpha = 0.55
  g.lineWidth = r * 0.07
  g.beginPath()
  g.arc(cx, cy, r * 0.93, 0, Math.PI * 2)
  g.stroke()
  g.globalAlpha = 0.5
  g.fillStyle = dark
  const beads = l.scallops ? 0 : 34
  const off = l.rough ? r * 0.06 : 0
  for (let i = 0; i < beads; i++) {
    const a = (i / beads) * Math.PI * 2
    g.beginPath()
    g.arc(cx + off + Math.cos(a) * r * 0.8, cy + Math.sin(a) * r * 0.8, r * 0.035, 0, Math.PI * 2)
    g.fill()
  }
  g.globalAlpha = 0.72
  if ('strokes' in l.motif) {
    // a Mughal legend, as abstract struck strokes (no script, so nothing is said)
    g.strokeStyle = dark
    g.lineCap = 'round'
    g.lineWidth = r * 0.06
    const rows = l.motif.strokes
    for (let row = 0; row < rows; row++) {
      const y = cy + off * 0.5 + (row - (rows - 1) / 2) * r * 0.36
      const span = r * (0.95 - Math.abs(row - (rows - 1) / 2) * 0.22)
      let x = cx - span / 2
      while (x < cx + span / 2) {
        const w = r * (0.08 + rnd() * 0.18)
        g.beginPath()
        g.moveTo(x, y + r * 0.04)
        g.quadraticCurveTo(x + w * 0.5, y - r * (0.05 + rnd() * 0.12), x + w, y + r * 0.02)
        g.stroke()
        if (rnd() < 0.35) {
          g.beginPath()
          g.arc(x + w * 0.5, y - r * 0.16, r * 0.025, 0, Math.PI * 2)
          g.fillStyle = dark
          g.fill()
        }
        x += w + r * 0.07
      }
    }
  } else {
    // a British India reverse: the value and the year in a small wreath of leaves
    const lines = l.motif.lines
    g.fillStyle = dark
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    lines.forEach((t, i) => {
      const big = i === 0 && t.length <= 3
      const size = r * (big ? 0.5 : t.length > 7 ? 0.2 : 0.26)
      g.font = `700 ${size}px ${FACE.print}`
      const y = cy + (i - (lines.length - 1) / 2) * r * 0.42 + (big ? -r * 0.04 : 0)
      g.fillText(t, cx, y)
    })
    g.strokeStyle = dark
    g.lineWidth = r * 0.035
    for (const side of [-1, 1]) {
      for (let k = 0; k < 6; k++) {
        const a = Math.PI / 2 + side * (0.5 + k * 0.32)
        const x = cx + Math.cos(a) * r * 0.66
        const y = cy + Math.sin(a) * r * 0.66
        g.beginPath()
        g.ellipse(x, y, r * 0.07, r * 0.03, a + side * 0.9, 0, Math.PI * 2)
        g.stroke()
      }
    }
  }
  g.restore()
  // the edge of the outline, a little darker
  g.save()
  coinPath(g, cx, cy, r, l, seeded(id))
  g.strokeStyle = dark
  g.globalAlpha = 0.6
  g.lineWidth = Math.max(1, r * 0.03)
  g.stroke()
  g.restore()
}

/** Fine guilloche-like lines for printed money and passes. */
function guilloche(g: G, x: number, y: number, w: number, h: number, color: string, rnd: () => number): void {
  g.save()
  g.strokeStyle = color
  g.globalAlpha = 0.35
  g.lineWidth = Math.max(0.5, h * 0.006)
  for (let k = 0; k < 7; k++) {
    g.beginPath()
    const ph = rnd() * 6
    for (let i = 0; i <= 60; i++) {
      const t = i / 60
      const px = x + t * w
      const py = y + h * (0.5 + 0.38 * Math.sin(t * Math.PI * 6 + ph + k * 0.5) * Math.cos(t * Math.PI * 2 + k))
      if (i === 0) g.moveTo(px, py)
      else g.lineTo(px, py)
    }
    g.stroke()
  }
  g.restore()
}

function text(g: G, s: string, x: number, y: number, size: number, color: string, face: string = FACE.print, weight = '700', align: CanvasTextAlign = 'center'): void {
  g.font = `${weight} ${size}px ${face}`
  g.fillStyle = color
  g.textAlign = align
  g.textBaseline = 'middle'
  g.fillText(s, x, y)
}

/** Lines of grey "type" for small print that is not meant to be read. */
function typeBars(g: G, x: number, y: number, w: number, rows: number, gap: number, color: string, rnd: () => number): void {
  g.save()
  g.fillStyle = color
  for (let i = 0; i < rows; i++) {
    let px = x
    const end = x + w * (i === rows - 1 ? 0.55 : 0.95 + rnd() * 0.05)
    while (px < end) {
      const ww = gap * (0.8 + rnd() * 2.2)
      g.fillRect(px, y + i * gap * 1.6, Math.min(ww, end - px), gap * 0.55)
      px += ww + gap * 0.5
    }
  }
  g.restore()
}

function flatFace(g: G, id: string, x: number, y: number, w: number, h: number, l: Extract<Look, { kind: 'flat' }>): void {
  const rnd = seeded(id)
  g.save()
  g.fillStyle = l.paper
  g.fillRect(x, y, w, h)
  // the paper's own tooth: a faint mottle
  g.globalAlpha = 0.08
  for (let i = 0; i < 40; i++) {
    g.fillStyle = rnd() < 0.5 ? '#000' : '#fff'
    g.beginPath()
    g.arc(x + rnd() * w, y + rnd() * h, Math.max(w, h) * (0.02 + rnd() * 0.05), 0, Math.PI * 2)
    g.fill()
  }
  g.globalAlpha = 1
  const u = Math.min(w, h)
  switch (l.art) {
    case 'note': {
      // a ten-rupee note of the 1920s: a framed print, the value, an oval vignette
      g.strokeStyle = '#4c5a3a'
      g.lineWidth = u * 0.03
      g.strokeRect(x + u * 0.06, y + u * 0.06, w - u * 0.12, h - u * 0.12)
      guilloche(g, x + u * 0.1, y + u * 0.1, w - u * 0.2, h - u * 0.2, '#56653e', rnd)
      g.fillStyle = 'rgba(231,226,198,0.92)'
      g.beginPath()
      g.ellipse(x + w * 0.24, y + h * 0.52, w * 0.13, h * 0.3, 0, 0, Math.PI * 2)
      g.fill()
      g.strokeStyle = '#4c5a3a'
      g.lineWidth = u * 0.02
      g.stroke()
      // the vignette left plain, only hatched: no likeness
      g.save()
      g.clip()
      g.globalAlpha = 0.25
      for (let i = -10; i < 10; i++) {
        g.beginPath()
        g.moveTo(x + w * 0.24 + i * u * 0.05, y + h * 0.2)
        g.lineTo(x + w * 0.24 + i * u * 0.05 + u * 0.2, y + h * 0.85)
        g.stroke()
      }
      g.restore()
      text(g, 'GOVERNMENT OF INDIA', x + w * 0.62, y + h * 0.24, h * 0.1, '#3a4630')
      text(g, 'TEN RUPEES', x + w * 0.62, y + h * 0.52, h * 0.15, '#2f3a26')
      text(g, '10', x + w * 0.88, y + h * 0.8, h * 0.17, '#5b2a22')
      text(g, '10', x + w * 0.44, y + h * 0.8, h * 0.12, '#5b2a22')
      break
    }
    case 'leaflet': {
      // the party's notice: the printed heading, NOTICE, the lines, and Balraj's name
      text(g, 'HINDUSTAN SOCIALIST', x + w / 2, y + h * 0.08, w * 0.075, '#3b1f1c')
      text(g, 'REPUBLICAN ARMY', x + w / 2, y + h * 0.15, w * 0.075, '#3b1f1c')
      g.fillStyle = '#3b1f1c'
      g.fillRect(x + w * 0.12, y + h * 0.2, w * 0.76, h * 0.008)
      text(g, 'NOTICE', x + w / 2, y + h * 0.28, w * 0.15, '#2a1513')
      typeBars(g, x + w * 0.1, y + h * 0.36, w * 0.8, 8, h * 0.028, 'rgba(50,25,22,0.55)', rnd)
      text(g, 'Balraj', x + w * 0.86, y + h * 0.88, w * 0.12, '#2a1513', FACE.hand, '400', 'right')
      break
    }
    case 'radio-card': {
      // the station's own card: its name and the wavelength it called on
      g.strokeStyle = '#a3291f'
      g.lineWidth = u * 0.035
      g.strokeRect(x + u * 0.07, y + u * 0.07, w - u * 0.14, h - u * 0.14)
      text(g, 'CONGRESS RADIO', x + w / 2, y + h * 0.27, h * 0.13, '#3b3326')
      text(g, '42.34 m', x + w / 2, y + h * 0.56, h * 0.26, '#a3291f', FACE.type, '400')
      text(g, 'from somewhere in India', x + w / 2, y + h * 0.8, h * 0.08, '#3b3326', FACE.print, '400')
      break
    }
    case 'pass': {
      // a gallery pass for the midnight session: a navy band, the date and hour, a number
      g.fillStyle = '#23305a'
      g.fillRect(x, y, w, h * 0.26)
      text(g, 'CONSTITUENT ASSEMBLY', x + w / 2, y + h * 0.13, h * 0.1, '#efe9d8')
      text(g, "VISITORS' GALLERY", x + w / 2, y + h * 0.4, h * 0.11, '#23305a')
      text(g, '14 AUGUST 1947', x + w / 2, y + h * 0.58, h * 0.12, '#2a2a2a')
      text(g, '11 P.M.', x + w / 2, y + h * 0.74, h * 0.1, '#2a2a2a')
      text(g, 'No. 0213', x + w * 0.9, y + h * 0.9, h * 0.08, '#7a2a20', FACE.type, '400', 'right')
      g.strokeStyle = 'rgba(35,48,90,0.5)'
      g.lineWidth = u * 0.02
      g.strokeRect(x + u * 0.04, y + u * 0.04, w - u * 0.08, h - u * 0.08)
      break
    }
  }
  g.restore()
}

function donaFace(g: G, cx: number, cy: number, r: number, id: string): void {
  const rnd = seeded(id)
  g.save()
  // the leaf cup's rim, stitched leaves, then the halwa in it: crisp golden discs with nuts
  g.fillStyle = '#56722e'
  g.beginPath()
  g.arc(cx, cy, r, 0, Math.PI * 2)
  g.fill()
  g.strokeStyle = '#3b521c'
  g.lineWidth = r * 0.03
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2
    g.beginPath()
    g.moveTo(cx + Math.cos(a) * r * 0.62, cy + Math.sin(a) * r * 0.62)
    g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r)
    g.stroke()
  }
  const discs = 4
  for (let i = 0; i < discs; i++) {
    const a = (i / discs) * Math.PI * 2 + 0.4
    const dx = cx + Math.cos(a) * r * 0.26
    const dy = cy + Math.sin(a) * r * 0.26
    const gr = g.createRadialGradient(dx - r * 0.08, dy - r * 0.1, r * 0.02, dx, dy, r * 0.36)
    gr.addColorStop(0, '#e8b46a')
    gr.addColorStop(1, '#9b5d22')
    g.fillStyle = gr
    g.beginPath()
    g.arc(dx, dy, r * 0.34, 0, Math.PI * 2)
    g.fill()
    for (let k = 0; k < 5; k++) {
      g.fillStyle = rnd() < 0.5 ? '#9cb35a' : '#f2e2b8'
      g.fillRect(dx + (rnd() - 0.5) * r * 0.4, dy + (rnd() - 0.5) * r * 0.4, r * 0.06, r * 0.04)
    }
  }
  g.restore()
}

function packetFace(g: G, x: number, y: number, w: number, h: number, l: Extract<Look, { kind: 'packet' }>, id: string): void {
  const rnd = seeded(id)
  g.save()
  if (l.art === 'newsprint') {
    // barfi wrapped in an old newspaper and tied with string
    g.fillStyle = '#ddd5bf'
    g.fillRect(x, y, w, h)
    for (let c = 0; c < 3; c++) typeBars(g, x + w * (0.06 + c * 0.32), y + h * 0.1, w * 0.26, 9, h * 0.035, 'rgba(40,36,30,0.45)', rnd)
    g.fillStyle = 'rgba(40,36,30,0.6)'
    g.fillRect(x + w * 0.06, y + h * 0.05, w * 0.6, h * 0.04)
  } else {
    // Mahim halwa: thin orange and green sheets seen through butter paper
    g.fillStyle = '#e7d9a8'
    g.fillRect(x, y, w, h)
    const bands = ['#e08a3a', '#d9763a', '#9bb25a', '#e39a45']
    bands.forEach((c, i) => {
      g.fillStyle = c
      g.globalAlpha = 0.55
      g.fillRect(x + w * 0.1, y + h * (0.14 + i * 0.18), w * 0.8, h * 0.14)
    })
    g.globalAlpha = 0.35
    g.fillStyle = '#fff8e0'
    g.fillRect(x, y, w, h)
    g.globalAlpha = 1
    g.strokeStyle = 'rgba(150,120,70,0.5)'
    g.lineWidth = h * 0.02
    g.beginPath()
    g.moveTo(x, y + h * 0.5)
    g.lineTo(x + w, y + h * 0.48)
    g.stroke()
  }
  // the string, crossed and knotted
  g.strokeStyle = l.art === 'newsprint' ? '#8a2c22' : '#c9b37a'
  g.lineWidth = Math.min(w, h) * 0.035
  g.beginPath()
  g.moveTo(x + w * 0.5, y)
  g.lineTo(x + w * 0.5, y + h)
  g.moveTo(x, y + h * 0.5)
  g.lineTo(x + w, y + h * 0.5)
  g.stroke()
  g.beginPath()
  g.arc(x + w * 0.5, y + h * 0.5, Math.min(w, h) * 0.06, 0, Math.PI * 2)
  g.fillStyle = g.strokeStyle
  g.fill()
  g.restore()
}

/** The jalebi box's lid: cream card, a red border, the halwai's word for sweets. */
function boxLid(g: G, x: number, y: number, w: number, h: number): void {
  g.save()
  g.fillStyle = '#efe2c0'
  g.fillRect(x, y, w, h)
  const u = Math.min(w, h)
  g.strokeStyle = '#a3291f'
  g.lineWidth = u * 0.05
  g.strokeRect(x + u * 0.08, y + u * 0.08, w - u * 0.16, h - u * 0.16)
  g.lineWidth = u * 0.015
  g.strokeRect(x + u * 0.15, y + u * 0.15, w - u * 0.3, h - u * 0.3)
  text(g, 'मिठाई', x + w / 2, y + h * 0.47, h * 0.3, '#a3291f', FACE.deva, '700')
  text(g, 'CHANDNI CHOWK', x + w / 2, y + h * 0.74, h * 0.1, '#5b3a22')
  g.restore()
}

/** Inside the box: jalebis, orange coils on paper. */
function jalebis(g: G, x: number, y: number, w: number, h: number): void {
  g.save()
  g.fillStyle = '#f2e8cc'
  g.fillRect(x, y, w, h)
  const u = Math.min(w, h)
  const spots: [number, number][] = [[0.27, 0.3], [0.7, 0.3], [0.3, 0.72], [0.72, 0.7], [0.5, 0.5]]
  for (const [sx, sy] of spots) {
    const cx = x + w * sx
    const cy = y + h * sy
    g.strokeStyle = '#d9731f'
    g.lineWidth = u * 0.05
    g.lineCap = 'round'
    g.beginPath()
    for (let i = 0; i <= 40; i++) {
      const a = (i / 40) * Math.PI * 5
      const rr = u * 0.03 + (i / 40) * u * 0.13
      const px = cx + Math.cos(a) * rr
      const py = cy + Math.sin(a) * rr
      if (i === 0) g.moveTo(px, py)
      else g.lineTo(px, py)
    }
    g.stroke()
    g.strokeStyle = 'rgba(255,220,140,0.6)'
    g.lineWidth = u * 0.015
    g.stroke()
  }
  g.restore()
}

function badgeFace(g: G, cx: number, cy: number, r: number): void {
  g.save()
  g.beginPath()
  g.arc(cx, cy, r, 0, Math.PI * 2)
  g.clip()
  const stripes = ['#e2833a', '#f3efe2', '#2f7a3a']
  stripes.forEach((c, i) => {
    g.fillStyle = c
    g.fillRect(cx - r, cy - r + (i * 2 * r) / 3, 2 * r, (2 * r) / 3 + 1)
  })
  // the wheel, navy, with its 24 spokes
  g.strokeStyle = '#1f2e6e'
  g.lineWidth = r * 0.03
  g.beginPath()
  g.arc(cx, cy, r * 0.26, 0, Math.PI * 2)
  g.stroke()
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2
    g.beginPath()
    g.moveTo(cx, cy)
    g.lineTo(cx + Math.cos(a) * r * 0.26, cy + Math.sin(a) * r * 0.26)
    g.stroke()
  }
  g.restore()
  g.save()
  g.strokeStyle = '#8c8c84'
  g.lineWidth = r * 0.1
  g.beginPath()
  g.arc(cx, cy, r * 0.95, 0, Math.PI * 2)
  g.stroke()
  g.restore()
}

function sealFace(g: G, cx: number, cy: number, r: number): void {
  const [light, base, dark] = METALS.brass
  g.save()
  g.beginPath()
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8
    const x = cx + Math.cos(a) * r
    const y = cy + Math.sin(a) * r
    if (i === 0) g.moveTo(x, y)
    else g.lineTo(x, y)
  }
  g.closePath()
  const gr = g.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.05, cx, cy, r)
  gr.addColorStop(0, light)
  gr.addColorStop(0.6, base)
  gr.addColorStop(1, dark)
  g.fillStyle = gr
  g.fill()
  g.strokeStyle = dark
  g.lineWidth = r * 0.05
  g.stroke()
  // a plain engraved flower, no lettering
  g.globalAlpha = 0.6
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    g.beginPath()
    g.ellipse(cx + Math.cos(a) * r * 0.36, cy + Math.sin(a) * r * 0.36, r * 0.2, r * 0.08, a, 0, Math.PI * 2)
    g.stroke()
  }
  g.beginPath()
  g.arc(cx, cy, r * 0.12, 0, Math.PI * 2)
  g.fillStyle = dark
  g.fill()
  g.restore()
}

/**
 * The art on a treasure's face, filling the box (x, y, w, h): a coin's struck face, a card's print,
 * the top of a sweet. For a box, `part` picks the lid or the jalebis inside.
 */
export function drawFace(g: G, id: string, x: number, y: number, w: number, h: number, part: 'top' | 'inside' = 'top'): void {
  const l = LOOKS[id]
  if (!l) return
  const cx = x + w / 2
  const cy = y + h / 2
  const r = Math.min(w, h) / 2
  switch (l.kind) {
    case 'coin':
      return coinFace(g, id, cx, cy, r * 0.98, l)
    case 'flat':
      return flatFace(g, id, x, y, w, h, l)
    case 'dona':
      return donaFace(g, cx, cy, r, id)
    case 'packet':
      return packetFace(g, x, y, w, h, l, id)
    case 'box':
      return part === 'inside' ? jalebis(g, x, y, w, h) : boxLid(g, x, y, w, h)
    case 'valve': {
      // the valve seen from above: the glass dome with the getter's silver flash
      const gr = g.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.05, cx, cy, r)
      gr.addColorStop(0, '#f4fbfb')
      gr.addColorStop(0.5, '#b9c7c8')
      gr.addColorStop(1, '#5f6c6e')
      g.fillStyle = gr
      g.beginPath()
      g.arc(cx, cy, r * 0.96, 0, Math.PI * 2)
      g.fill()
      return
    }
    case 'seal':
      return sealFace(g, cx, cy, r * 0.96)
    case 'badge':
      return badgeFace(g, cx, cy, r * 0.97)
  }
}

/**
 * A small icon of the treasure as it sits on a desk, seen from a little above, centred in a square
 * of side `s` at (x, y): for the flat desk and the home page's tag.
 */
export function drawIcon(g: G, id: string, x: number, y: number, s: number): void {
  const l = LOOKS[id]
  if (!l) return
  const cx = x + s / 2
  const cy = y + s / 2
  g.save()
  // a soft shadow on the desk under it
  g.fillStyle = 'rgba(30,15,8,0.28)'
  g.beginPath()
  g.ellipse(cx + s * 0.04, cy + s * 0.2, s * 0.38, s * 0.12, 0, 0, Math.PI * 2)
  g.fill()
  switch (l.kind) {
    case 'coin': {
      const r = s * (l.r > 0.0135 ? 0.42 : 0.36)
      const t = Math.max(1.5, s * 0.06)
      // its edge, then the face tilted toward you
      g.save()
      g.translate(cx, cy + t / 2)
      g.scale(1, 0.78)
      g.fillStyle = METALS[l.metal][2]
      g.beginPath()
      g.arc(0, t, r, 0, Math.PI * 2)
      g.fill()
      g.restore()
      g.save()
      g.translate(cx, cy)
      g.scale(1, 0.78)
      drawFace(g, id, -r, -r, 2 * r, 2 * r)
      g.restore()
      break
    }
    case 'flat': {
      const ar = l.w / l.d
      const w = ar >= 1 ? s * 0.86 : s * 0.62
      const h = w / ar
      g.save()
      g.translate(cx, cy)
      g.rotate(-0.14)
      g.fillStyle = 'rgba(30,15,8,0.25)'
      g.fillRect(-w / 2 + 2, -h / 2 + 3, w, h)
      drawFace(g, id, -w / 2, -h / 2, w, h)
      g.restore()
      break
    }
    case 'dona': {
      const r = s * 0.42
      g.fillStyle = '#3f5520'
      g.beginPath()
      g.ellipse(cx, cy + s * 0.08, r * 0.82, r * 0.42, 0, 0, Math.PI * 2)
      g.fill()
      g.save()
      g.translate(cx, cy)
      g.scale(1, 0.62)
      drawFace(g, id, -r, -r, 2 * r, 2 * r)
      g.restore()
      break
    }
    case 'packet':
    case 'box': {
      const w = s * 0.8
      const h = w * (l.d / l.w) * 0.72
      const t = s * (l.kind === 'box' ? 0.2 : 0.14)
      g.fillStyle = l.kind === 'box' ? '#c9b48a' : sideColor(id)
      g.fillRect(cx - w / 2, cy - h / 2 + t * 0.4, w, h + t * 0.6)
      g.fillStyle = 'rgba(0,0,0,0.18)'
      g.fillRect(cx - w / 2, cy + h / 2, w, t * 0.6)
      g.save()
      g.translate(cx - w / 2, cy - h / 2 - t * 0.2)
      drawFace(g, id, 0, 0, w, h)
      g.restore()
      break
    }
    case 'valve': {
      // a glass envelope on a black base, the plates and the silver getter inside
      const w = s * 0.34
      const top = y + s * 0.08
      const baseY = y + s * 0.72
      g.fillStyle = '#1d1a18'
      g.fillRect(cx - w * 0.55, baseY, w * 1.1, s * 0.16)
      const gr = g.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0)
      gr.addColorStop(0, 'rgba(150,170,172,0.7)')
      gr.addColorStop(0.3, 'rgba(240,250,250,0.85)')
      gr.addColorStop(1, 'rgba(110,128,130,0.7)')
      g.fillStyle = gr
      g.beginPath()
      g.moveTo(cx - w / 2, baseY)
      g.lineTo(cx - w / 2, top + w / 2)
      g.arc(cx, top + w / 2, w / 2, Math.PI, 0)
      g.lineTo(cx + w / 2, baseY)
      g.closePath()
      g.fill()
      g.fillStyle = '#6d6a66'
      g.fillRect(cx - w * 0.22, top + s * 0.24, w * 0.44, s * 0.3)
      g.fillStyle = 'rgba(200,205,210,0.9)'
      g.fillRect(cx - w * 0.4, top + s * 0.02, w * 0.8, s * 0.06)
      break
    }
    case 'seal': {
      // an octagonal brass seal standing on its face, with its turned handle
      const [light, base, dark] = METALS.brass
      const w = s * 0.42
      const by = y + s * 0.6
      g.fillStyle = dark
      g.fillRect(cx - w / 2, by, w, s * 0.16)
      g.fillStyle = base
      g.fillRect(cx - w / 2, by - s * 0.02, w, s * 0.06)
      const gr = g.createLinearGradient(cx - w / 4, 0, cx + w / 4, 0)
      gr.addColorStop(0, base)
      gr.addColorStop(0.4, light)
      gr.addColorStop(1, dark)
      g.fillStyle = gr
      g.beginPath()
      g.moveTo(cx - w * 0.16, by)
      g.quadraticCurveTo(cx - w * 0.05, y + s * 0.4, cx - w * 0.12, y + s * 0.28)
      g.arc(cx, y + s * 0.22, w * 0.18, Math.PI * 0.9, Math.PI * 0.1)
      g.quadraticCurveTo(cx + w * 0.05, y + s * 0.4, cx + w * 0.16, by)
      g.closePath()
      g.fill()
      break
    }
    case 'badge': {
      const r = s * 0.38
      g.save()
      g.translate(cx, cy)
      g.scale(1, 0.85)
      drawFace(g, id, -r, -r, 2 * r, 2 * r)
      g.restore()
      break
    }
  }
  g.restore()
}
