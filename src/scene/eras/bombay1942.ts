// Bombay, 30 Oct – 12 Nov 1942: the Congress Radio flat at Parekh Wadi, Girgaum, at night.
// Teal oil-painted walls, a heavy curtain drawn across the window with one slit of blacked-out
// city, a green-shaded lamp, and on the desk a home-built valve transmitter, a spring-ring
// microphone, a portable gramophone with a hand-labelled disc, headphones on a pencil-marked
// script and a tangle of wire. Post-monsoon November, so dry: no rain.
//
// Sources: docs/research/quit-india-1942.md §4 and §9 (homebuilt valve set, the Rs 250
// microphone, amplifier and pick-up, hand-labelled discs, a suitcase, top-floor flat, blackout).
import * as THREE from 'three'
import { ERA_PALETTES, css, mix } from '../palette'
import { SPOTS, createBatch, createDesk, createRoomShell, createWarmLight, disposeTree, material } from '../props'
import { TIER_SETTINGS } from '../quality'
import { clothTexture, glowTexture, makeNoise, toTexture, woodTexture } from '../textures'
import type { EraDressing, QualityTier } from '../types'

type V3 = [number, number, number]
type Mat = THREE.Material

const pal = ERA_PALETTES['bombay-1942']
/**
 * An electric bulb, so a little whiter than the oil-flame eras. The wall is a bluer teal than
 * the palette's, because under a tungsten lamp the palette teal renders olive; this one renders
 * as teal on screen. The palette (and so the 2D fallback) is unchanged.
 */
const LAMP = mix(pal.lamp, 0xffffff, 0.22)
const WALL = 0x356f8e
const BACK = -0.55 // the back wall (createRoomShell's default)
const CAMERA: EraDressing['camera'] = { pos: [0, 0.98, 0.92], look: [0, -0.12, 0.06] }

/** The transmitter cabinet: back right of the desk, its panel facing the operator. */
const TX = { x: 0.215, z: -0.235, w: 0.33, h: 0.12, d: 0.15 }
const TX_FRONT = TX.z + TX.d / 2
/** The ebonite front panel inside the cabinet's frame, in metres from its top-left corner. */
const PANEL = { w: 0.306, h: 0.096 }
const PANEL_X0 = TX.x - PANEL.w / 2
const PANEL_Y0 = 0.012 + PANEL.h
const P = {
  tune: { x: 0.062, y: 0.054 },
  meter: { x: 0.152, y: 0.046, pivotY: 0.057 },
  aerial: { x: 0.226, y: 0.056 },
  plate: { x: 0.274, y: 0.056 },
  toggle: { x: 0.226, y: 0.016 },
  pilot: { x: 0.274, y: 0.016 },
  jackA: { x: 0.142, y: 0.086 },
  jackB: { x: 0.162, y: 0.086 },
}
/** Panel coordinates to world, just proud of the panel face. */
const onPanel = (p: { x: number; y: number }, dz = 0): V3 => [PANEL_X0 + p.x, PANEL_Y0 - p.y, TX_FRONT + 0.0012 + dz]

/** The portable gramophone between the lamp and the transmitter. */
const GR = { x: -0.083, z: -0.232, w: 0.21, h: 0.068, d: 0.146 }
/** The microphone on its desk stand, left front of the lamp, turned toward the operator. */
const MIC = { x: -0.33, z: -0.035, yaw: 0.5 }
/** Script sheets with the headphones dropped on them, right of the paper. */
const SCRIPT = { x: 0.31, z: -0.05 }
/** The curtained window behind the transmitter; the slit between the panels sits at `slit`. */
const WIN = { left: 0.0, right: 0.55, slit: 0.215, top: 1.19, bottom: -0.32, z: BACK + 0.05 }
/** Top of the glazing behind the curtain: below the curtain's heading, so the night never shows above it. */
const GLASS_TOP = WIN.top - 0.07
const DADO_Y = 0.2 // top of the oil-painted dado above the desk top (about 1 m off the floor)
const CLOCK = { x: -0.21, y: 0.37, r: 0.058 }
/** Under the desk: the suitcase the set travels in, a bedroll and a stack of discs. */
const FLOOR_Y = -0.76

const lathe = (pts: [number, number][], seg: number) =>
  new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg)

const tube = (pts: V3[], r: number, seg: number, radial: number) =>
  new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))), seg, r, radial, false)

/** A flat sheet lying on the desk, turned by `yaw`. */
const sheet = (w: number, h: number) => new THREE.PlaneGeometry(w, h).rotateX(-Math.PI / 2)

/** Paints a canvas texture; a missing 2D context (tests, old WebViews) leaves it blank. */
function canvasTexture(
  w: number,
  h: number,
  draw: (g: CanvasRenderingContext2D) => void,
  o: { repeat?: [number, number]; anisotropy?: number } = {},
): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d')
  if (g) draw(g)
  return toTexture(c, o)
}

// ---------------------------------------------------------------- canvas textures

/** The transmitter's ebonite panel: tuning scale in metres, a milliammeter, knob scales. */
function panelTexture(width: number, rng: () => number): THREE.CanvasTexture {
  const k = width / PANEL.w
  const H = Math.round(PANEL.h * k)
  return canvasTexture(width, H, (g) => {
    const X = (m: number) => m * k
    const bg = g.createLinearGradient(0, 0, 0, H)
    bg.addColorStop(0, '#2a221c')
    bg.addColorStop(1, '#120e0b')
    g.fillStyle = bg
    g.fillRect(0, 0, width, H)
    for (let i = 0; i < 90; i++) {
      g.fillStyle = `rgba(255,240,220,${(0.012 + rng() * 0.03).toFixed(3)})`
      g.fillRect(rng() * width, rng() * H, X(0.01 + rng() * 0.05), Math.max(1, X(0.0003)))
    }
    g.strokeStyle = 'rgba(255,236,210,0.18)'
    g.lineWidth = Math.max(1, X(0.0008))
    g.strokeRect(X(0.001), X(0.001), width - X(0.002), H - X(0.002))
    const cream = '#ddd0ac'
    const ink = '#2a2118'
    const label = (t: string, x: number, y: number, size = 0.0048) => {
      g.fillStyle = cream
      g.font = `bold ${Math.max(6, Math.round(X(size)))}px Arial, Helvetica, sans-serif`
      g.textAlign = 'center'
      g.textBaseline = 'middle'
      g.fillText(t, X(x), X(y))
    }
    const ticks = (cx: number, cy: number, r0: number, r1: number, a0: number, a1: number, n: number, col: string) => {
      g.strokeStyle = col
      g.lineWidth = Math.max(1, X(0.0005))
      for (let i = 0; i <= n; i++) {
        const a = a0 + ((a1 - a0) * i) / n
        const long = i % 5 === 0 ? 1 : 0.6
        g.beginPath()
        g.moveTo(X(cx + Math.cos(a) * r0), X(cy + Math.sin(a) * r0))
        g.lineTo(X(cx + Math.cos(a) * (r0 + (r1 - r0) * long)), X(cy + Math.sin(a) * (r0 + (r1 - r0) * long)))
        g.stroke()
      }
    }
    // tuning: a cream band-spread scale over the knob, 39 to 43 metres
    const t = P.tune
    const a0 = Math.PI * 1.13
    const a1 = Math.PI * 1.87
    g.fillStyle = cream
    g.beginPath()
    g.arc(X(t.x), X(t.y), X(0.035), a0 - 0.05, a1 + 0.05)
    g.arc(X(t.x), X(t.y), X(0.021), a1 + 0.05, a0 - 0.05, true)
    g.closePath()
    g.fill()
    ticks(t.x, t.y, 0.0225, 0.028, a0, a1, 20, ink)
    g.fillStyle = ink
    g.font = `bold ${Math.max(6, Math.round(X(0.0046)))}px Arial, Helvetica, sans-serif`
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    for (let i = 0; i <= 4; i++) {
      const a = a0 + ((a1 - a0) * i) / 4
      g.fillText(String(39 + i), X(t.x + Math.cos(a) * 0.0315), X(t.y + Math.sin(a) * 0.0315))
    }
    label('METRES', t.x, 0.086)
    // milliammeter: bezel, cream face, scale around the needle's pivot
    const m = P.meter
    g.fillStyle = '#4a4740'
    g.beginPath()
    g.arc(X(m.x), X(m.y), X(0.027), 0, Math.PI * 2)
    g.fill()
    g.fillStyle = '#e9e0c4'
    g.beginPath()
    g.arc(X(m.x), X(m.y), X(0.0235), 0, Math.PI * 2)
    g.fill()
    ticks(m.x, m.pivotY, 0.0165, 0.021, Math.PI * 1.28, Math.PI * 1.72, 10, ink)
    g.fillStyle = ink
    g.font = `${Math.max(5, Math.round(X(0.0036)))}px Arial, Helvetica, sans-serif`
    g.fillText('0', X(m.x + Math.cos(Math.PI * 1.28) * 0.0125), X(m.pivotY + Math.sin(Math.PI * 1.28) * 0.0125))
    g.fillText('100', X(m.x + Math.cos(Math.PI * 1.72) * 0.0125), X(m.pivotY + Math.sin(Math.PI * 1.72) * 0.0125))
    g.fillText('mA', X(m.x), X(m.y + 0.004))
    // the two small knobs: a 0–10 scale each
    for (const [p, name] of [[P.aerial, 'AERIAL'], [P.plate, 'PLATE']] as const) {
      ticks(p.x, p.y, 0.0125, 0.0155, Math.PI * 0.75, Math.PI * 2.25, 10, cream)
      label(name, p.x, 0.083, 0.0042)
    }
    label('ON', P.toggle.x, P.toggle.y + 0.0085, 0.0036)
    // four screws
    for (const [sx, sy] of [[0.006, 0.006], [PANEL.w - 0.006, 0.006], [0.006, PANEL.h - 0.006], [PANEL.w - 0.006, PANEL.h - 0.006]]) {
      g.fillStyle = '#9a9284'
      g.beginPath()
      g.arc(X(sx ?? 0), X(sy ?? 0), X(0.0026), 0, Math.PI * 2)
      g.fill()
      g.strokeStyle = '#3a342c'
      g.lineWidth = Math.max(1, X(0.0006))
      g.beginPath()
      g.moveTo(X((sx ?? 0) - 0.002), X((sy ?? 0) - 0.0008))
      g.lineTo(X((sx ?? 0) + 0.002), X((sy ?? 0) + 0.0008))
      g.stroke()
    }
  })
}

/** A home-cut disc: black shellac grooves, a sheen, and a cream label lettered by hand. */
function discTexture(size: number, rng: () => number): THREE.CanvasTexture {
  return canvasTexture(size, size, (g) => {
    const c = size / 2
    g.fillStyle = '#0c0b0b'
    g.fillRect(0, 0, size, size)
    for (let r = c * 0.36; r < c * 0.98; r += Math.max(1, size / 220)) {
      g.strokeStyle = rng() < 0.5 ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.5)'
      g.lineWidth = 1
      g.beginPath()
      g.arc(c, c, r, 0, Math.PI * 2)
      g.stroke()
    }
    // two opposite wedges of sheen, as a lamp catches the grooves
    for (const a of [Math.PI * 0.2, Math.PI * 1.2]) {
      const grad = g.createRadialGradient(c, c, c * 0.36, c, c, c)
      grad.addColorStop(0, 'rgba(255,240,220,0.02)')
      grad.addColorStop(0.6, 'rgba(255,240,220,0.13)')
      grad.addColorStop(1, 'rgba(255,240,220,0.04)')
      g.fillStyle = grad
      g.beginPath()
      g.moveTo(c, c)
      g.arc(c, c, c * 0.98, a - 0.22, a + 0.22)
      g.closePath()
      g.fill()
    }
    g.fillStyle = '#e4d6b4'
    g.beginPath()
    g.arc(c, c, c * 0.34, 0, Math.PI * 2)
    g.fill()
    g.strokeStyle = '#8a2a22'
    g.lineWidth = Math.max(1, size / 160)
    g.beginPath()
    g.arc(c, c, c * 0.3, 0, Math.PI * 2)
    g.stroke()
    g.fillStyle = '#232c44'
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    g.font = `italic ${Math.max(6, Math.round(size * 0.05))}px Georgia, "Times New Roman", serif`
    g.fillText('Vande', c, c - size * 0.05)
    g.fillText('Mataram', c, c + size * 0.035)
    g.fillStyle = '#0c0b0b'
    g.beginPath()
    g.arc(c, c, Math.max(1, size * 0.012), 0, Math.PI * 2)
    g.fill()
  })
}

/** A typed bulletin, marked up in pencil: underlines, a ring, a struck line, margin notes. */
function scriptTexture(w: number, rng: () => number): THREE.CanvasTexture {
  const h = Math.round(w * 1.333)
  return canvasTexture(w, h, (g) => {
    const s = w / 256
    g.fillStyle = css(pal.paper)
    g.fillRect(0, 0, w, h)
    for (let i = 0; i < 36; i++) {
      g.fillStyle = `rgba(140,110,60,${(0.015 + rng() * 0.035).toFixed(3)})`
      g.beginPath()
      g.arc(rng() * w, rng() * h, (8 + rng() * 34) * s, 0, Math.PI * 2)
      g.fill()
    }
    const edge = g.createLinearGradient(0, 0, w, 0)
    edge.addColorStop(0, 'rgba(120,90,40,0.16)')
    edge.addColorStop(0.08, 'rgba(120,90,40,0)')
    edge.addColorStop(0.92, 'rgba(120,90,40,0)')
    edge.addColorStop(1, 'rgba(120,90,40,0.16)')
    g.fillStyle = edge
    g.fillRect(0, 0, w, h)
    // typed lines in blocks of characters
    g.fillStyle = 'rgba(30,32,40,0.78)'
    const ch = 4.1 * s
    const lines: { y: number; x0: number; x1: number }[] = []
    let y = 30 * s
    let x = 0
    // a centred heading
    for (x = w / 2 - 34 * s; x < w / 2 + 34 * s; x += ch) if (rng() > 0.15) g.fillRect(x, y - 5.5 * s, ch * 0.75, 5.5 * s)
    y += 20 * s
    while (y < h - 26 * s) {
      const x0 = (lines.length % 6 === 0 ? 34 : 22) * s
      const x1 = w - (18 + rng() * (lines.length % 6 === 5 ? 110 : 26)) * s
      x = x0
      while (x < x1) {
        const word = 2 + Math.floor(rng() * 7)
        for (let i = 0; i < word && x < x1; i++) {
          const hh = (3.6 + rng() * 1.6) * s
          g.fillRect(x, y - hh, ch * 0.72, hh)
          x += ch
        }
        x += ch
      }
      lines.push({ y, x0, x1: x })
      y += (lines.length % 6 === 0 ? 17 : 11) * s
    }
    // pencil
    g.strokeStyle = 'rgba(64,64,70,0.8)'
    g.fillStyle = 'rgba(64,64,70,0.8)'
    g.lineWidth = Math.max(1, 1.4 * s)
    g.lineCap = 'round'
    const wobble = (x0: number, y0: number, x1: number, y1: number) => {
      g.beginPath()
      g.moveTo(x0, y0)
      const n = 8
      for (let i = 1; i <= n; i++) g.lineTo(x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n + (rng() - 0.5) * 1.6 * s)
      g.stroke()
    }
    const L = (i: number) => lines[Math.min(lines.length - 1, i)] ?? { y: h / 2, x0: 22 * s, x1: w - 22 * s }
    const l2 = L(2)
    wobble(l2.x0, l2.y + 2.5 * s, l2.x0 + 120 * s, l2.y + 3 * s)
    const l5 = L(5)
    g.beginPath()
    g.ellipse(l5.x0 + 70 * s, l5.y - 2.5 * s, 24 * s, 7 * s, -0.04, 0, Math.PI * 2)
    g.stroke()
    const l8 = L(8)
    wobble(l8.x0 - 4 * s, l8.y - 2.5 * s, l8.x1 + 2 * s, l8.y - 2.8 * s)
    const l9 = L(9)
    wobble(l9.x0 - 4 * s, l9.y - 2.5 * s, l9.x1 + 2 * s, l9.y - 2 * s)
    // a margin bracket and two ticks
    const a = L(11)
    const b = L(15)
    wobble(10 * s, a.y - 8 * s, 10 * s, b.y + 2 * s)
    wobble(10 * s, a.y - 8 * s, 15 * s, a.y - 8 * s)
    wobble(10 * s, b.y + 2 * s, 15 * s, b.y + 2 * s)
    for (const i of [1, 6, 12]) {
      const l = L(i)
      g.beginPath()
      g.moveTo(8 * s, l.y - 3 * s)
      g.lineTo(11 * s, l.y)
      g.lineTo(17 * s, l.y - 8 * s)
      g.stroke()
    }
    // a scribbled note in the right margin of the last short paragraph
    const n = L(17)
    let px = w - 96 * s
    g.beginPath()
    g.moveTo(px, n.y + 12 * s)
    let ph = 0
    while (px < w - 16 * s) {
      ph += 0.9 + rng() * 0.5
      px += 1.6 * s
      g.lineTo(px, n.y + 12 * s - (1 - Math.cos(ph)) * 2.6 * s * (rng() < 0.1 ? 2 : 1))
    }
    g.stroke()
  })
}

/**
 * What the slit between the curtains shows: a blacked-out Girgaum night. Deep sky with a few
 * stars, the dark roofline of the chawls opposite, two dim windows, and the window's transom.
 */
function slitTexture(w: number, h: number, rng: () => number): THREE.CanvasTexture {
  return canvasTexture(w, h, (g) => {
    const sky = g.createLinearGradient(0, 0, 0, h)
    sky.addColorStop(0, '#101a36')
    sky.addColorStop(0.4, '#2a3c66')
    sky.addColorStop(0.6, '#40527c')
    sky.addColorStop(1, '#1c2438')
    g.fillStyle = sky
    g.fillRect(0, 0, w, h)
    for (let i = 0; i < 9; i++) {
      g.fillStyle = `rgba(230,236,255,${(0.35 + rng() * 0.5).toFixed(2)})`
      const sz = Math.max(1, w / 24)
      g.fillRect(rng() * w, rng() * h * 0.4, sz, sz)
    }
    // the roofline opposite, then the dark face of the building
    const roof = h * 0.6
    g.fillStyle = '#06080e'
    g.beginPath()
    g.moveTo(0, roof + h * 0.02)
    g.lineTo(w * 0.45, roof + h * 0.02)
    g.lineTo(w * 0.45, roof - h * 0.012)
    g.lineTo(w, roof - h * 0.012)
    g.lineTo(w, h)
    g.lineTo(0, h)
    g.closePath()
    g.fill()
    // two windows behind blackout paper, barely lit
    g.fillStyle = 'rgba(214,150,70,0.75)'
    g.fillRect(w * 0.2, roof + h * 0.07, w * 0.5, h * 0.022)
    g.fillStyle = 'rgba(190,130,64,0.45)'
    g.fillRect(w * 0.35, roof + h * 0.16, w * 0.4, h * 0.016)
    // the window's own frame: a transom bar
    g.fillStyle = '#0a0806'
    g.fillRect(0, h * 0.25, w, h * 0.014)
  })
}

/** A wall clock face with Arabic numerals and minute ticks. */
function clockTexture(size: number): THREE.CanvasTexture {
  return canvasTexture(size, size, (g) => {
    const c = size / 2
    g.fillStyle = '#e8dfc6'
    g.fillRect(0, 0, size, size)
    g.strokeStyle = '#2a241c'
    g.fillStyle = '#2a241c'
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2
      const r0 = i % 5 === 0 ? 0.8 : 0.86
      g.lineWidth = Math.max(1, size / (i % 5 === 0 ? 70 : 160))
      g.beginPath()
      g.moveTo(c + Math.sin(a) * c * r0, c - Math.cos(a) * c * r0)
      g.lineTo(c + Math.sin(a) * c * 0.92, c - Math.cos(a) * c * 0.92)
      g.stroke()
    }
    g.font = `${Math.max(6, Math.round(size * 0.12))}px Georgia, "Times New Roman", serif`
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    for (let i = 1; i <= 12; i++) {
      const a = (i / 12) * Math.PI * 2
      g.fillText(String(i), c + Math.sin(a) * c * 0.66, c - Math.cos(a) * c * 0.66)
    }
  })
}

/** A disc in a kraft-paper sleeve: the centre hole shows the record and its hand-written label. */
function sleeveTexture(size: number, rng: () => number): THREE.CanvasTexture {
  return canvasTexture(size, size, (g) => {
    const c = size / 2
    g.fillStyle = '#9c7a4e'
    g.fillRect(0, 0, size, size)
    for (let i = 0; i < 40; i++) {
      g.fillStyle = `rgba(${rng() < 0.5 ? '60,40,20' : '200,170,120'},${(0.04 + rng() * 0.08).toFixed(3)})`
      g.fillRect(rng() * size, rng() * size, size * (0.05 + rng() * 0.3), Math.max(1, size / 128))
    }
    g.fillStyle = '#0d0c0b'
    g.beginPath()
    g.arc(c, c, size * 0.2, 0, Math.PI * 2)
    g.fill()
    g.fillStyle = '#e2d4b0'
    g.beginPath()
    g.arc(c, c, size * 0.14, 0, Math.PI * 2)
    g.fill()
    g.strokeStyle = '#2a3048'
    g.lineWidth = Math.max(1, size / 90)
    for (const dy of [-0.03, 0.02]) {
      g.beginPath()
      g.moveTo(c - size * 0.08, c + size * dy)
      for (let x = -0.08; x <= 0.08; x += 0.01) g.lineTo(c + size * x, c + size * (dy - Math.abs(Math.sin(x * 90 + rng())) * 0.012))
      g.stroke()
    }
    g.fillStyle = '#0d0c0b'
    g.beginPath()
    g.arc(c, c, Math.max(1, size * 0.012), 0, Math.PI * 2)
    g.fill()
  })
}

/** Baked brass gradient for the lamp's base and stem (unlit: a bulb 2 cm away blows Phong out). */
function stemTexture(size: number, rng: () => number): THREE.CanvasTexture {
  return canvasTexture(16, size, (g) => {
    // stops follow the lathe profile in lampBody: base rim, base dome, stem, socket
    const grad = g.createLinearGradient(0, size, 0, 0)
    grad.addColorStop(0, '#1e1206')
    grad.addColorStop(0.08, '#3c260a')
    grad.addColorStop(0.2, '#8a5c1a')
    grad.addColorStop(0.42, '#c8902e')
    grad.addColorStop(0.6, '#6a4612')
    grad.addColorStop(0.7, '#8e6220')
    grad.addColorStop(0.76, '#e0aa50')
    grad.addColorStop(0.8, '#2c2016')
    grad.addColorStop(1, '#1a130c')
    g.fillStyle = grad
    g.fillRect(0, 0, 16, size)
    const n = makeNoise(rng)
    for (let y = 0; y < size; y++) {
      g.fillStyle = `rgba(0,0,0,${(n(0, (y / size) * 24, 1, 24) * 0.18).toFixed(3)})`
      g.fillRect(0, y, 16, 1)
    }
  })
}

/** Light leaking through cased glass: bright at the shade's rim, dark toward the top. */
function shadeGlowTexture(): THREE.CanvasTexture {
  return canvasTexture(4, 64, (g) => {
    const grad = g.createLinearGradient(0, 64, 0, 0)
    grad.addColorStop(0, '#ffffff')
    grad.addColorStop(0.18, '#9a9a9a')
    grad.addColorStop(0.6, '#3a3a3a')
    grad.addColorStop(1, '#181818')
    g.fillStyle = grad
    g.fillRect(0, 0, 4, 64)
  })
}

// ---------------------------------------------------------------- the curtain

interface Curtain {
  geo: THREE.BufferGeometry
  /** Rest positions, so the sway is always an offset from them. */
  base: Float32Array
  /** Per vertex: how far down (0 top, 1 bottom) and how close to the slit (0 outer, 1 inner). */
  weight: Float32Array
  side: Float32Array
}

/**
 * One drawn curtain panel from x0 to x1(v), pleated under the rod and hanging straighter near
 * the slit. `innerRight` says which edge meets the slit.
 */
function curtainPanel(
  xOuter: number,
  inner: (v: number) => number,
  innerRight: boolean,
  folds: number,
  nx: number,
  ny: number,
  rng: () => number,
): THREE.BufferGeometry {
  const geo = new THREE.PlaneGeometry(1, 1, nx, ny)
  const pos = geo.getAttribute('position') as THREE.BufferAttribute
  const uv = geo.getAttribute('uv') as THREE.BufferAttribute
  const phase = rng() * Math.PI * 2
  const jit = Array.from({ length: folds + 2 }, () => 0.75 + rng() * 0.5)
  const height = WIN.top - WIN.bottom
  for (let i = 0; i < pos.count; i++) {
    const u = pos.getX(i) + 0.5
    const v = pos.getY(i) + 0.5 // 1 at the rod
    const xi = inner(v)
    const xl = innerRight ? xOuter : xi
    const xr = innerRight ? xi : xOuter
    const x = xl + (xr - xl) * u
    const toInner = innerRight ? u : 1 - u
    const f = u * folds
    const amp = 0.013 * (jit[Math.floor(f)] ?? 1) * (1 - 0.6 * Math.pow(toInner, 3)) * (0.9 + 0.25 * (1 - v))
    const z = WIN.z + amp * (0.5 + 0.5 * Math.sin(f * Math.PI * 2 + phase))
    pos.setXYZ(i, x, WIN.bottom + height * v, z)
    uv.setXY(i, (x - WIN.left) / 0.11, (height * v) / 0.11)
  }
  geo.computeVertexNormals()
  return geo
}

function createCurtain(nx: number, ny: number, rng: () => number): Curtain {
  // the slit is a narrow wedge: the panels touch under the rod and part a little lower down
  const gap = (v: number) => 0.006 + 0.034 * Math.pow(1 - v, 1.4)
  const panels = [
    curtainPanel(WIN.left, (v) => WIN.slit - gap(v) / 2, true, 5, nx, ny, rng),
    curtainPanel(WIN.right, (v) => WIN.slit + gap(v) / 2, false, 7, nx, ny, rng),
  ]
  // merged by hand and kept indexed, so the sway re-uploads as few vertices as possible
  const count = panels.reduce((n, g) => n + g.getAttribute('position').count, 0)
  const position = new Float32Array(count * 3)
  const normal = new Float32Array(count * 3)
  const uvs = new Float32Array(count * 2)
  const weight = new Float32Array(count)
  const side = new Float32Array(count)
  const index: number[] = []
  let o = 0
  panels.forEach((g, pi) => {
    const p = g.getAttribute('position') as THREE.BufferAttribute
    const n = g.getAttribute('normal') as THREE.BufferAttribute
    const t = g.getAttribute('uv') as THREE.BufferAttribute
    const first = o
    for (const i of g.index?.array ?? []) index.push(first + i)
    for (let i = 0; i < p.count; i++, o++) {
      position.set([p.getX(i), p.getY(i), p.getZ(i)], o * 3)
      normal.set([n.getX(i), n.getY(i), n.getZ(i)], o * 3)
      uvs.set([t.getX(i), t.getY(i)], o * 2)
      weight[o] = 1 - (p.getY(i) - WIN.bottom) / (WIN.top - WIN.bottom)
      side[o] = (pi === 0 ? -1 : 1) * Math.max(0, 1 - Math.abs(p.getX(i) - WIN.slit) / 0.3)
    }
    g.dispose()
  })
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(position, 3))
  geo.setAttribute('normal', new THREE.BufferAttribute(normal, 3))
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
  geo.setIndex(index)
  return { geo, base: position.slice(), weight, side }
}

// ---------------------------------------------------------------- the dressing

const bombay1942: EraDressing = {
  id: 'bombay-1942',
  camera: CAMERA,
  lightColor: LAMP,
  build({ scene, tier, rng }) {
    const s = TIER_SETTINGS[tier]
    const low = tier === 'low'
    const seg = low ? 10 : 18
    const root = new THREE.Group()
    root.name = 'bombay-1942'

    root.add(createRoomShell({ palette: { ...pal, wall: WALL }, tier, rng, floorY: -0.76, floor: 'stone' }))
    root.add(createDesk({ palette: pal, tier, rng, legs: 'square' }).group)

    // ------------------------------------------------------------ shared materials
    const darkWood = material(tier, {
      map: woodTexture('walnut', { size: Math.min(256, s.texSize), rng, anisotropy: s.anisotropy }),
      shininess: 45,
      specular: 0x2c2218,
    })
    const bakelite = material(tier, { color: 0x1d1612, shininess: 70, specular: 0x403832 })
    const metal = material(tier, { color: 0xb4b0a6, metal: true, shininess: 80, specular: 0x8c8a84 })
    const brass = material(tier, { color: 0xb08a48, metal: true, shininess: 60, specular: 0x7a5c2c })
    // low folds copper into brass: one warm metal for rod, rings, switches and coils
    const copper = low ? brass : material(tier, { color: 0xb8683c, metal: true, shininess: 70, specular: 0x845030 })
    // thin wire aliases without MSAA, so low draws it thicker
    const wire = low ? 1.6 : 1
    const cable = material(tier, { color: 0x2e2622, shininess: 6 })
    const leather = material(tier, {
      map: clothTexture(0x3b2a20, { size: Math.min(128, s.texSize), rng, repeat: [3, 3] }),
      shininess: 24,
      specular: 0x1c140e,
    })
    const felt = material(tier, { map: clothTexture(0x47201c, { size: 64, rng, repeat: [2, 2] }), shininess: 2 })
    // the chassis: steel in grey crackle paint
    const steel = material(tier, { color: 0x5e5c57, metal: true, shininess: 18, specular: 0x2a2a28 })
    const panel = material(tier, { map: panelTexture(low ? 256 : 512, rng), shininess: 40, specular: 0x302c28 })
    const disc = material(tier, { map: discTexture(low ? 128 : 256, rng), shininess: 90, specular: 0x4a4644 })
    const script = material(tier, { map: scriptTexture(low ? 128 : 256, rng), shininess: 4 })
    const dado = material(tier, { color: mix(WALL, 0x0a2440, 0.42), shininess: 38, specular: 0x1a2828 })
    const glass = material(tier, {
      color: 0xdfe8ea,
      transparent: true,
      opacity: low ? 0.16 : 0.22,
      shininess: 120,
      specular: 0xffffff,
      depthWrite: false,
    })
    // the valves' heaters: unlit, pulsed in update
    const CORE = new THREE.Color(2.2, 0.85, 0.26)
    const core = new THREE.MeshBasicMaterial({ color: CORE.clone() })

    const b = createBatch()

    // ------------------------------------------------------------ the wall: dado, rail, wiring
    b.add(new THREE.PlaneGeometry(3.2, DADO_Y + 0.76), dado, [0, (DADO_Y - 0.76) / 2, BACK + 0.002], [0, 0, 0], false, true)
    b.add(new THREE.BoxGeometry(3.2, 0.02, 0.014), darkWood, [0, DADO_Y, BACK + 0.007], [0, 0, 0], false, true)
    // surface wiring on a wooden batten: from the switchboard up to the ceiling
    const SW = { x: -0.37, y: 0.19 }
    b.add(new THREE.BoxGeometry(0.014, 1.75, 0.007), darkWood, [SW.x, SW.y + 0.05 + 0.875, BACK + 0.0035], [0, 0, 0], false, false)
    b.add(new THREE.BoxGeometry(0.11, 0.085, 0.012), darkWood, [SW.x, SW.y, BACK + 0.006], [0, 0, 0], false, true)
    for (const dx of [-0.025, 0.025]) {
      b.add(new THREE.CylinderGeometry(0.011, 0.013, 0.008, seg).rotateX(Math.PI / 2), brass, [SW.x + dx, SW.y + 0.008, BACK + 0.016], [0, 0, 0], false, false)
      b.add(new THREE.BoxGeometry(0.004, 0.009, 0.006), bakelite, [SW.x + dx, SW.y + 0.008, BACK + 0.022], [0, 0, 0.5], false, false)
    }
    // the lead from the board: down the wall and behind the desk, feeding lamp and set
    b.add(tube([[SW.x, SW.y - 0.04, BACK + 0.008], [SW.x + 0.01, SW.y - 0.14, BACK + 0.012], [SW.x + 0.05, -0.02, BACK + 0.03], [SW.x + 0.12, -0.08, BACK + 0.06]], 0.0025, 12, 4), cable, [0, 0, 0], [0, 0, 0], false, false)

    // ------------------------------------------------------------ the curtained window
    const curtainTex = clothTexture(mix(pal.accent, 0x2e2826, 0.35), { size: Math.min(256, s.texSize), rng, repeat: [1, 1], anisotropy: s.anisotropy })
    const curtainMat = material(tier, { map: curtainTex, bump: 0.25, shininess: 6, specular: 0x140a0a })
    const curtain = createCurtain(low ? 28 : 56, low ? 2 : 6, rng)
    const curtainMesh = new THREE.Mesh(curtain.geo, curtainMat)
    curtainMesh.receiveShadow = true
    root.add(curtainMesh)
    // the night behind the slit, unlit
    const sky = new THREE.Mesh(
      new THREE.PlaneGeometry(0.16, GLASS_TOP - WIN.bottom),
      new THREE.MeshBasicMaterial({ map: slitTexture(low ? 16 : 32, low ? 256 : 512, rng), fog: false }),
    )
    sky.position.set(WIN.slit, (GLASS_TOP + WIN.bottom) / 2, BACK + 0.004)
    root.add(sky)
    // rod, rings and finials above it
    const rodY = WIN.top + 0.012
    b.add(new THREE.CylinderGeometry(0.008, 0.008, WIN.right - WIN.left + 0.12, seg).rotateZ(Math.PI / 2), brass, [(WIN.left + WIN.right) / 2, rodY, WIN.z + 0.004], [0, 0, 0], false, false)
    for (const x of [WIN.left - 0.065, WIN.right + 0.065]) b.add(new THREE.SphereGeometry(0.015, seg, 8), brass, [x, rodY, WIN.z + 0.004], [0, 0, 0], false, false)
    for (const x of [WIN.left - 0.03, WIN.right + 0.03]) b.add(new THREE.BoxGeometry(0.01, 0.03, 0.055), brass, [x, rodY, BACK + 0.028], [0, 0, 0], false, false)
    if (!low) {
      for (let i = 0; i <= 16; i++) {
        const x = WIN.left + ((WIN.right - WIN.left) * i) / 16
        if (Math.abs(x - WIN.slit) < 0.02) continue
        b.add(new THREE.TorusGeometry(0.012, 0.0022, 5, 12), brass, [x, rodY - 0.004, WIN.z + 0.004], [0, 0, 0], false, false)
      }
    }
    // the aerial lead: up from the set and out under the curtain at the window's edge
    b.add(tube([[TX.x + 0.13, TX.h + 0.004, TX.z - 0.06], [TX.x + 0.2, 0.32, BACK + 0.12], [WIN.right - 0.04, 0.8, WIN.z + 0.03], [WIN.right - 0.02, 1.12, WIN.z + 0.025]], 0.0014, 16, 3), cable, [0, 0, 0], [0, 0, 0], false, false)

    // spare aerial wire, coiled on a nail between the clock and the window
    {
      const nx = -0.075
      const ny = 0.4
      b.add(new THREE.CylinderGeometry(0.0018, 0.0018, 0.02, 5).rotateX(Math.PI / 2), metal, [nx, ny, BACK + 0.01], [0, 0, 0], false, false)
      for (let i = 0; i < 4; i++) {
        const r = 0.036 + i * 0.0025
        b.add(new THREE.TorusGeometry(r, 0.0013 * wire, 3, low ? 14 : 22), copper, [nx + (i - 1.5) * 0.002, ny - r + 0.002, BACK + 0.008 + i * 0.002], [0.1 * i, 0, 0.05 * i - 0.08], false, false)
      }
    }

    // ------------------------------------------------------------ under the desk: suitcase, discs, bedroll
    {
      const cs = { x: 0.17, z: 0.12, w: 0.4, h: 0.12, d: 0.26, yaw: 0.12 }
      const cy = FLOOR_Y + cs.h / 2
      const m = new THREE.Matrix4().compose(
        new THREE.Vector3(cs.x, cy, cs.z),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(0, cs.yaw, 0)),
        new THREE.Vector3(1, 1, 1),
      )
      const at = (geo: THREE.BufferGeometry, mat: Mat) => b.add(geo.applyMatrix4(m), mat, [0, 0, 0], [0, 0, 0], false, true)
      at(new THREE.BoxGeometry(cs.w, cs.h, cs.d), leather)
      at(new THREE.BoxGeometry(cs.w + 0.004, 0.01, cs.d + 0.004).translate(0, 0.022, 0), leather)
      for (const dx of [-cs.w / 2, cs.w / 2]) for (const dz of [-cs.d / 2, cs.d / 2]) at(new THREE.BoxGeometry(0.02, cs.h + 0.004, 0.02).translate(dx, 0, dz), brass)
      for (const dx of [-0.11, 0.11]) at(new THREE.BoxGeometry(0.024, 0.02, 0.006).translate(dx, 0.022, cs.d / 2 + 0.002), brass)
      at(new THREE.TorusGeometry(0.035, 0.008, 5, 10, Math.PI).rotateX(Math.PI / 2).translate(0, -0.005, cs.d / 2), leather)
      if (!low) {
        // home-cut discs in paper sleeves, stacked on the case
        const sleeve = material(tier, { map: sleeveTexture(128, rng), shininess: 6 })
        for (let i = 0; i < 4; i++) {
          b.add(new THREE.BoxGeometry(0.25, 0.006, 0.25), sleeve, [cs.x - 0.02 + (rng() - 0.5) * 0.02, FLOOR_Y + cs.h + 0.003 + i * 0.0065, cs.z - 0.01 + (rng() - 0.5) * 0.02], [0, -0.2 + (rng() - 0.5) * 0.5, 0], false, true)
        }
        // a rolled bedroll, tied twice
        const durrie = material(tier, { map: clothTexture(0x6e5a40, { size: 128, rng, stripe: 0x5a2622, repeat: [2, 1] }), shininess: 3 })
        const br = 0.07
        const bx = -0.2
        const bz = 0.16
        b.add(new THREE.CylinderGeometry(br, br, 0.5, seg).rotateZ(Math.PI / 2), durrie, [bx, FLOOR_Y + br, bz], [0, -0.25, 0], false, true)
        for (const dx of [-0.15, 0.15]) b.add(new THREE.TorusGeometry(br + 0.002, 0.005, 4, seg).rotateY(Math.PI / 2), leather, [bx + dx * Math.cos(0.25), FLOOR_Y + br, bz + dx * Math.sin(0.25)], [0, -0.25, 0], false, false)
      }
    }

    // ------------------------------------------------------------ the wall clock: twenty to nine
    const clockFace = material(tier, { map: clockTexture(low ? 64 : 128), shininess: 30 })
    b.add(new THREE.CircleGeometry(CLOCK.r, seg + 6), clockFace, [CLOCK.x, CLOCK.y, BACK + 0.022], [0, 0, 0], false, false)
    b.add(new THREE.TorusGeometry(CLOCK.r + 0.006, 0.009, 6, seg + 6), darkWood, [CLOCK.x, CLOCK.y, BACK + 0.016], [0, 0, 0], false, false)
    b.add(new THREE.CylinderGeometry(CLOCK.r + 0.004, CLOCK.r + 0.004, 0.018, seg + 6).rotateX(Math.PI / 2), darkWood, [CLOCK.x, CLOCK.y, BACK + 0.009], [0, 0, 0], false, false)
    const hand = (len: number, wdt: number, angle: number) => {
      const g = new THREE.BoxGeometry(wdt, len, 0.002).translate(0, len / 2 - 0.005, 0)
      g.rotateZ(-angle)
      return g
    }
    // 8:41 pm: four minutes before the 8:45 broadcast
    b.add(hand(CLOCK.r * 0.5, 0.0055, ((8 + 41 / 60) / 12) * Math.PI * 2), bakelite, [CLOCK.x, CLOCK.y, BACK + 0.025], [0, 0, 0], false, false)
    b.add(hand(CLOCK.r * 0.74, 0.0038, (41 / 60) * Math.PI * 2), bakelite, [CLOCK.x, CLOCK.y, BACK + 0.027], [0, 0, 0], false, false)
    const secondHand = new THREE.Mesh(
      new THREE.BoxGeometry(0.0012, CLOCK.r * 0.9, 0.001).translate(0, CLOCK.r * 0.33, 0),
      new THREE.MeshBasicMaterial({ color: 0x7a1a12 }),
    )
    secondHand.position.set(CLOCK.x, CLOCK.y, BACK + 0.029)
    root.add(secondHand)

    // ------------------------------------------------------------ the green-shaded lamp
    const L = SPOTS.lamp
    const stem = new THREE.Mesh(
      lathe(
        [
          [0, 0], [0.056, 0], [0.058, 0.004], [0.055, 0.01], [0.045, 0.016], [0.03, 0.02], [0.02, 0.026],
          [0.012, 0.034], [0.009, 0.04], [0.0065, 0.05], [0.0065, 0.166], [0.01, 0.17], [0.012, 0.178],
          [0.012, 0.194], [0, 0.194],
        ],
        seg,
      ),
      new THREE.MeshBasicMaterial({ map: stemTexture(64, rng) }),
    )
    stem.position.set(L.x, 0, L.z)
    root.add(stem)
    const shadeMat = material(tier, { color: 0x2a6a3c, emissive: 0x1c6a34, shininess: 90, specular: 0x8aa890 })
    const glowMap = shadeGlowTexture()
    shadeMat.emissiveMap = glowMap
    const shade = new THREE.Mesh(
      lathe(
        [
          [0.0622, 0.17], [0.0608, 0.178], [0.057, 0.194], [0.05, 0.214], [0.039, 0.232], [0.026, 0.247],
          [0.015, 0.256], [0.008, 0.26],
        ],
        seg + 6,
      ),
      shadeMat,
    )
    shade.position.set(L.x, 0, L.z)
    root.add(shade)
    // the glass edge catches the bulb
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.0622, 0.0022, 5, seg + 6).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffe2a8 }))
    rim.position.set(L.x, 0.17, L.z)
    root.add(rim)
    b.add(lathe([[0.009, 0], [0.011, 0.004], [0.006, 0.011], [0.004, 0.019], [0, 0.021]], seg), brass, [L.x, 0.259, L.z], [0, 0, 0], false, false)
    // the flex: from the base, off the back of the desk
    b.add(tube([[L.x + 0.01, 0.004, L.z - 0.05], [L.x - 0.005, 0.003, L.z - 0.1], [L.x - 0.02, -0.004, -0.318], [L.x - 0.03, -0.12, -0.36]], 0.0022, 10, 4), cable, [0, 0, 0], [0, 0, 0], false, false)
    const light = createWarmLight({ tier, color: LAMP, position: [L.x, 0.2, L.z], intensity: 1.2, glow: 'none', flicker: 0.04 })
    root.add(light.group)

    // ------------------------------------------------------------ the transmitter
    const top = TX.h
    b.add(new THREE.BoxGeometry(TX.w, TX.h, TX.d - 0.008), darkWood, [TX.x, TX.h / 2, TX.z - 0.004], [0, 0, 0])
    // the frame round the panel
    const fz = TX_FRONT - 0.004
    b.add(new THREE.BoxGeometry(TX.w, 0.012, 0.008), darkWood, [TX.x, TX.h - 0.006, fz], [0, 0, 0])
    b.add(new THREE.BoxGeometry(TX.w, 0.012, 0.008), darkWood, [TX.x, 0.006, fz], [0, 0, 0])
    b.add(new THREE.BoxGeometry(0.012, TX.h, 0.008), darkWood, [TX.x - TX.w / 2 + 0.006, TX.h / 2, fz], [0, 0, 0])
    b.add(new THREE.BoxGeometry(0.012, TX.h, 0.008), darkWood, [TX.x + TX.w / 2 - 0.006, TX.h / 2, fz], [0, 0, 0])
    b.add(new THREE.PlaneGeometry(PANEL.w, PANEL.h), panel, [TX.x, 0.012 + PANEL.h / 2, TX_FRONT - 0.0028], [0, 0, 0], false, true)
    // knobs: a big tuning knob with a pointer, two small ones
    const knob = (p: { x: number; y: number }, r: number, depth: number) => {
      const [x, y, z] = onPanel(p)
      b.add(new THREE.CylinderGeometry(r * 1.2, r * 1.2, 0.003, seg).rotateX(Math.PI / 2), bakelite, [x, y, z - 0.003 + 0.0015], [0, 0, 0])
      b.add(new THREE.CylinderGeometry(r * 0.86, r, depth, seg).rotateX(Math.PI / 2), bakelite, [x, y, z - 0.003 + depth / 2], [0, 0, 0])
      b.add(new THREE.BoxGeometry(0.0014, r * 0.8, 0.001), metal, [x - r * 0.18, y + r * 0.34, z - 0.003 + depth + 0.0005], [0, 0, 0.45], false, false)
    }
    knob(P.tune, 0.0155, 0.012)
    knob(P.aerial, 0.009, 0.009)
    knob(P.plate, 0.009, 0.009)
    {
      const [x, y, z] = onPanel(P.toggle)
      b.add(new THREE.CylinderGeometry(0.0035, 0.0035, 0.003, 6).rotateX(Math.PI / 2), metal, [x, y, z - 0.0015], [0, 0, 0], false, false)
      b.add(new THREE.CylinderGeometry(0.0011, 0.0013, 0.01, 6).translate(0, 0.005, 0), metal, [x, y, z], [0.9, 0, 0], false, false)
      const [px, py, pz] = onPanel(P.pilot)
      b.add(new THREE.TorusGeometry(0.0052, 0.0012, 4, 10), metal, [px, py, pz], [0, 0, 0], false, false)
      b.add(new THREE.SphereGeometry(0.0045, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2).rotateX(Math.PI / 2), core, [px, py, pz - 0.0015], [0, 0, 0], false, false)
    }
    // two jacks with plugs pushed in
    for (const j of [P.jackA, P.jackB]) {
      const [x, y, z] = onPanel(j)
      b.add(new THREE.CylinderGeometry(0.0034, 0.0034, 0.003, 8).rotateX(Math.PI / 2), metal, [x, y, z - 0.0015], [0, 0, 0], false, false)
      b.add(new THREE.CylinderGeometry(0.0032, 0.0038, 0.013, 8).rotateX(Math.PI / 2), bakelite, [x, y, z + 0.0065], [0, 0, 0], false, false)
    }
    // the meter's needle drifts with the load
    const needle = new THREE.Mesh(
      new THREE.BoxGeometry(0.0009, 0.019, 0.0006).translate(0, 0.0095, 0),
      new THREE.MeshBasicMaterial({ color: 0x1a1612 }),
    )
    needle.position.set(...onPanel({ x: P.meter.x, y: P.meter.pivotY }, 0.0008))
    root.add(needle)
    // the open chassis on top: an aluminium plate, three valves, a coil and a tuning capacitor
    b.add(new THREE.BoxGeometry(TX.w - 0.026, 0.004, TX.d - 0.026), steel, [TX.x, top + 0.002, TX.z - 0.004], [0, 0, 0])
    const chassis = top + 0.004
    const valves: { x: number; z: number; k: number }[] = [
      { x: TX.x - 0.1, z: TX.z - 0.012, k: 1 },
      { x: TX.x - 0.048, z: TX.z - 0.03, k: 1 },
      { x: TX.x + 0.022, z: TX.z - 0.022, k: 1.32 },
    ]
    const glowGeos: THREE.BufferGeometry[] = []
    const camPos = new THREE.Vector3(...CAMERA.pos)
    const facer = new THREE.Object3D()
    for (const v of valves) {
      const k = v.k
      b.add(new THREE.CylinderGeometry(0.0125 * k, 0.0135 * k, 0.012, seg), bakelite, [v.x, chassis + 0.006, v.z], [0, 0, 0])
      const gy = chassis + 0.012
      b.add(
        lathe(
          [
            [0.0095, 0], [0.01, 0.006], [0.0125, 0.016], [0.0135, 0.026], [0.0132, 0.036], [0.0115, 0.045],
            [0.008, 0.052], [0.004, 0.056], [0.0018, 0.0585], [0, 0.059],
          ].map(([r, y]) => [(r ?? 0) * k, (y ?? 0) * k] as [number, number]),
          seg,
        ),
        glass,
        [v.x, gy, v.z],
        [0, 0, 0],
        false,
        false,
      )
      // the anode plates either side, the glowing heater between them
      const cy = gy + 0.026 * k
      for (const dx of [-0.0048, 0.0048]) b.add(new THREE.BoxGeometry(0.0012, 0.022 * k, 0.012 * k), bakelite, [v.x + dx * k, cy, v.z], [0, 0, 0], false, false)
      b.add(new THREE.CylinderGeometry(0.0022 * k, 0.0022 * k, 0.019 * k, 6), core, [v.x, cy, v.z], [0, 0, 0], false, false)
      b.add(new THREE.CylinderGeometry(0.0085 * k, 0.0085 * k, 0.0008, 10), metal, [v.x, gy + 0.042 * k, v.z], [0, 0, 0], false, false)
      const q = new THREE.PlaneGeometry(0.1 * k, 0.1 * k)
      facer.position.set(v.x, cy, v.z)
      facer.lookAt(camPos)
      facer.updateMatrix()
      q.applyMatrix4(facer.matrix)
      glowGeos.push(q)
    }
    // the tank coil: copper wound on a former, and a variable capacitor beside it
    {
      const cx = TX.x + 0.098
      const cz = TX.z + 0.02
      b.add(new THREE.CylinderGeometry(0.0128, 0.0128, 0.05, seg), bakelite, [cx, chassis + 0.025, cz], [0, 0, 0], false, false)
      const turns = 9
      const pts: V3[] = []
      for (let i = 0; i <= turns * 10; i++) {
        const a = (i / 10) * Math.PI * 2
        pts.push([Math.cos(a) * 0.0138, 0.008 + (i / (turns * 10)) * 0.034, Math.sin(a) * 0.0138])
      }
      b.add(tube(pts, 0.0011 * wire, turns * (low ? 8 : 12), low ? 3 : 4), copper, [cx, chassis, cz], [0, 0, 0], false, false)
      const vx = TX.x + 0.1
      const vz = TX.z - 0.04
      for (const dx of [-0.014, 0.014]) b.add(new THREE.BoxGeometry(0.002, 0.024, 0.022), metal, [vx + dx, chassis + 0.012, vz], [0, 0, 0], false, false)
      b.add(new THREE.CylinderGeometry(0.0016, 0.0016, 0.036, 6).rotateZ(Math.PI / 2), metal, [vx, chassis + 0.012, vz], [0, 0, 0], false, false)
      for (let i = 0; i < 5; i++) {
        const plate = new THREE.CylinderGeometry(0.0095, 0.0095, 0.0006, 10, 1, false, 0, Math.PI).rotateZ(Math.PI / 2)
        b.add(plate, metal, [vx - 0.009 + i * 0.0045, chassis + 0.012, vz], [0, 0, 0], false, false)
      }
    }
    const glowTex = glowTexture(64)
    const glowMat = new THREE.MeshBasicMaterial({
      map: glowTex,
      color: 0xff8c3a,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    })
    const glowGeo = mergeAll(glowGeos)
    const glows = new THREE.Mesh(glowGeo, glowMat)
    glows.renderOrder = 2
    root.add(glows)
    // a warm spill from the valves onto the chassis, panel top and curtain (not on low)
    let valveLight: THREE.PointLight | null = null
    if (!low) {
      valveLight = new THREE.PointLight(0xff8a3c, 0, 0.8, 2)
      valveLight.position.set(TX.x - 0.04, chassis + 0.1, TX.z - 0.03)
      root.add(valveLight)
    }

    // ------------------------------------------------------------ the gramophone
    {
      const { x, z, w, h, d } = GR
      b.add(new THREE.BoxGeometry(w, h, d), leather, [x, h / 2, z])
      b.add(new THREE.BoxGeometry(w - 0.012, 0.002, d - 0.012), felt, [x, h + 0.001, z], [0, 0, 0], false, true)
      if (!low) for (const dx of [-w / 2, w / 2]) for (const dz of [-d / 2, d / 2]) b.add(new THREE.BoxGeometry(0.012, 0.012, 0.012), brass, [x + dx, h - 0.004, z + dz], [0, 0, 0], false, false)
      // the turntable and the disc on it
      const tx = x - 0.022
      const tz = z + 0.004
      b.add(new THREE.CylinderGeometry(0.066, 0.066, 0.005, seg + 10), felt, [tx, h + 0.0045, tz], [0, 0, 0])
      b.add(new THREE.CircleGeometry(0.064, seg + 14).rotateX(-Math.PI / 2), disc, [tx, h + 0.0074, tz], [0, 0, 0], false, true)
      b.add(new THREE.CylinderGeometry(0.0645, 0.0645, 0.0016, seg + 10, 1, true), bakelite, [tx, h + 0.0066, tz], [0, 0, 0], false, false)
      b.add(new THREE.CylinderGeometry(0.0018, 0.0018, 0.012, 6), metal, [tx, h + 0.012, tz], [0, 0, 0], false, false)
      // the pick-up arm, its needle resting in the outer grooves
      const pv: V3 = [x + w / 2 - 0.024, h + 0.002, z - d / 2 + 0.026]
      b.add(new THREE.CylinderGeometry(0.009, 0.011, 0.012, seg), metal, [pv[0], pv[1] + 0.006, pv[2]], [0, 0, 0])
      const head: V3 = [tx + 0.044, h + 0.017, tz + 0.043]
      b.add(tube([[pv[0], pv[1] + 0.014, pv[2]], [pv[0] - 0.004, pv[1] + 0.02, pv[2] + 0.04], [head[0] + 0.006, head[1] + 0.002, head[2] - 0.012], head], 0.0026, 14, 6), metal, [0, 0, 0], [0, 0, 0])
      b.add(new THREE.BoxGeometry(0.016, 0.011, 0.024), metal, [head[0], head[1] - 0.004, head[2] + 0.006], [0, 0.5, 0])
      // the winding crank on the front
      b.add(tube([[x + w / 2 - 0.035, 0.04, z + d / 2], [x + w / 2 - 0.035, 0.04, z + d / 2 + 0.016], [x + w / 2 - 0.035, 0.022, z + d / 2 + 0.022]], 0.0022, 6, 5), metal, [0, 0, 0], [0, 0, 0])
      b.add(new THREE.CylinderGeometry(0.004, 0.004, 0.014, 8), bakelite, [x + w / 2 - 0.035, 0.016, z + d / 2 + 0.022], [0, 0, 0])
      // the lid, open past upright: leatherette outside, felt lining with a running order inside
      const lidAngle = -(Math.PI / 2 + 0.16)
      const hinge: V3 = [x, h, z - d / 2]
      b.add(new THREE.BoxGeometry(w, 0.01, d).translate(0, 0.005, d / 2), leather, hinge, [lidAngle, 0, 0])
      b.add(new THREE.PlaneGeometry(w - 0.014, d - 0.014).rotateX(Math.PI / 2).translate(0, -0.0006, d / 2), felt, hinge, [lidAngle, 0, 0], false, true)
      b.add(new THREE.PlaneGeometry(0.06, 0.08).rotateX(Math.PI / 2).translate(-0.04, -0.0012, d / 2 + 0.01), script, hinge, [lidAngle, 0, 0], false, false)
    }

    // ------------------------------------------------------------ the microphone
    {
      const m = new THREE.Matrix4().compose(
        new THREE.Vector3(MIC.x, 0, MIC.z),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(0, MIC.yaw, 0)),
        new THREE.Vector3(1, 1, 1),
      )
      const at = (geo: THREE.BufferGeometry, mat: Mat, cast = true) => b.add(geo.applyMatrix4(m), mat, [0, 0, 0], [0, 0, 0], cast, true)
      at(lathe([[0, 0], [0.036, 0], [0.037, 0.004], [0.033, 0.009], [0.02, 0.013], [0.008, 0.016], [0.006, 0.02], [0, 0.02]], seg), bakelite)
      at(new THREE.CylinderGeometry(0.0035, 0.0035, 0.044, 8).translate(0, 0.041, 0), metal)
      at(new THREE.BoxGeometry(0.082, 0.004, 0.006).translate(0, 0.062, 0), metal)
      for (const sx of [-0.0405, 0.0405]) at(new THREE.BoxGeometry(0.004, 0.044, 0.006).translate(sx, 0.084, 0), metal)
      const ry = 0.105
      at(new THREE.TorusGeometry(0.036, 0.0035, 6, seg + 6).translate(0, ry, 0), metal)
      at(new THREE.CylinderGeometry(0.017, 0.017, 0.014, seg).rotateX(Math.PI / 2).translate(0, ry, 0), bakelite)
      at(new THREE.CylinderGeometry(0.0145, 0.0145, 0.002, seg).rotateX(Math.PI / 2).translate(0, ry, 0.0075), metal)
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + Math.PI / 8
        const r = 0.0255
        const spring = new THREE.CylinderGeometry(0.0011, 0.0011, 0.015, 4).rotateZ(Math.PI / 2 - a)
        at(spring.translate(Math.cos(a) * r, ry + Math.sin(a) * r, 0), metal, false)
      }
      // its lead snakes round the lamp and behind the blotter to the set
      const [jx, jy, jz] = onPanel(P.jackA, 0.013)
      b.add(
        tube(
          [
            [MIC.x + 0.006, 0.003, MIC.z - 0.032], [MIC.x + 0.04, 0.003, -0.105], [-0.21, 0.003, -0.15], [-0.12, 0.003, -0.148],
            [-0.02, 0.003, -0.15], [0.07, 0.003, -0.146], [jx - 0.03, 0.003, jz + 0.006], [jx - 0.004, jy - 0.008, jz + 0.002], [jx, jy, jz],
          ],
          0.0024,
          40,
          low ? 3 : 5,
        ),
        cable,
      )
    }

    // ------------------------------------------------------------ script, pencil, headphones, the tangle
    {
      b.add(sheet(0.12, 0.16), script, [SCRIPT.x - 0.012, 0.0024, SCRIPT.z + 0.006], [0, -0.12, 0], false, true)
      b.add(sheet(0.12, 0.16), script, [SCRIPT.x, 0.0032, SCRIPT.z], [0, -0.34, 0], false, true)
      // the pencil: a hexagonal body, a sharpened end and its lead
      const pencil = new THREE.Matrix4().compose(
        new THREE.Vector3(SCRIPT.x - 0.05, 0.0072, SCRIPT.z + 0.045),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0.8, 0)),
        new THREE.Vector3(1, 1, 1),
      )
      const pc = (geo: THREE.BufferGeometry, mat: Mat) => b.add(geo.rotateZ(Math.PI / 2).applyMatrix4(pencil), mat, [0, 0, 0], [0, 0, 0], true, true)
      pc(new THREE.CylinderGeometry(0.0036, 0.0036, 0.08, 6), felt)
      pc(new THREE.CylinderGeometry(0.0036, 0.0011, 0.012, 6).translate(0, -0.046, 0), darkWood)
      pc(new THREE.CylinderGeometry(0.0011, 0.0002, 0.004, 6).translate(0, -0.054, 0), bakelite)
      // the headphones: two bakelite earpieces and a sprung band
      const c1: V3 = [SCRIPT.x - 0.04, 0.0034, SCRIPT.z - 0.036]
      const c2: V3 = [SCRIPT.x + 0.046, 0.0034, SCRIPT.z + 0.04]
      for (const c of [c1, c2]) {
        b.add(new THREE.CylinderGeometry(0.023, 0.025, 0.012, seg), bakelite, [c[0], c[1] + 0.006, c[2]])
        b.add(new THREE.CylinderGeometry(0.016, 0.019, 0.004, seg), bakelite, [c[0], c[1] + 0.014, c[2]])
        b.add(new THREE.TorusGeometry(0.0235, 0.0016, 4, seg).rotateX(Math.PI / 2), metal, [c[0], c[1] + 0.0122, c[2]], [0, 0, 0], false, false)
      }
      // the band lies in a half circle between them, bowed away from the operator
      const mx = (c1[0] + c2[0]) / 2
      const mz = (c1[2] + c2[2]) / 2
      const R = Math.hypot(c2[0] - c1[0], c2[2] - c1[2]) / 2
      const e1 = [(c1[0] - mx) / R, (c1[2] - mz) / R] as const
      const e2 = [-e1[1], e1[0]] as const
      const band: V3[] = []
      for (let i = 0; i <= 8; i++) {
        const a = 0.32 + ((Math.PI - 0.64) * i) / 8
        band.push([mx + R * (Math.cos(a) * e1[0] + Math.sin(a) * e2[0]), 0.013 + 0.006 * Math.sin(a), mz + R * (Math.cos(a) * e1[1] + Math.sin(a) * e2[1])])
      }
      b.add(tube(band, 0.0024, 24, 5), metal)
      // the cord: loose loops on the blotter's corner, then up into the second jack
      const [jx, jy, jz] = onPanel(P.jackB, 0.013)
      const loops: V3[] = [
        [c1[0] - 0.024, 0.006, c1[2] - 0.008], [0.2, 0.004, -0.083], [0.155, 0.003, -0.108], [0.168, 0.0045, -0.145],
        [0.214, 0.006, -0.126], [0.19, 0.0075, -0.093], [0.15, 0.005, -0.128], [0.176, 0.003, -0.152],
        [0.21, 0.0035, -0.142], [jx - 0.002, jy - 0.009, jz + 0.002], [jx, jy, jz],
      ]
      b.add(tube(loops, 0.0021, 48, low ? 3 : 5), cable)
      // pick-up lead from the gramophone into the side of the set
      b.add(tube([[GR.x + GR.w / 2, 0.03, GR.z - 0.04], [GR.x + GR.w / 2 + 0.012, 0.004, GR.z - 0.045], [TX.x - TX.w / 2 - 0.006, 0.004, TX.z - 0.03], [TX.x - TX.w / 2, 0.035, TX.z - 0.035]], 0.0022, 12, 4), cable)
    }

    // ------------------------------------------------------------ a faint cold spill where the curtains part (not on low)
    let spill: THREE.Mesh | null = null
    if (!low) {
      spill = new THREE.Mesh(
        new THREE.PlaneGeometry(0.11, GLASS_TOP - 0.1),
        new THREE.MeshBasicMaterial({ map: glowTex, color: 0x6a86bc, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }),
      )
      spill.position.set(WIN.slit, (GLASS_TOP + 0.1) / 2 - 0.02, WIN.z + 0.03)
      spill.renderOrder = 1
      root.add(spill)
    }

    root.add(b.build())
    scene.add(root)

    // ------------------------------------------------------------ motion
    const curtainPos = curtain.geo.getAttribute('position') as THREE.BufferAttribute
    const sway = !low
    const tick = { second: -1 }
    return {
      update(tMs) {
        light.update(tMs)
        const t = tMs / 1000
        // the valves breathe slowly; the meter needle wanders with the load
        const pulse = 0.86 + 0.1 * Math.sin(t * 1.25) + 0.04 * Math.sin(t * 3.7 + 1.3)
        core.color.copy(CORE).multiplyScalar(pulse)
        glowMat.opacity = 0.8 * pulse
        if (valveLight) valveLight.intensity = 0.03 * pulse
        needle.rotation.z = 0.32 - 0.16 * Math.sin(t * 0.31) - 0.06 * Math.sin(t * 1.7 + 0.4) - 0.02 * Math.sin(t * 7.3)
        // the clock ticks on from 8:41
        const sec = Math.floor(t) % 60
        if (sec !== tick.second) {
          tick.second = sec
          secondHand.rotation.z = -((12 + sec) / 60) * Math.PI * 2
        }
        // sea wind: the curtain's lower edge stirs and the slit breathes
        if (sway) {
          const arr = curtainPos.array as Float32Array
          const base = curtain.base
          const breathe = Math.sin(t * 0.5) * 0.5 + Math.sin(t * 1.3 + 0.7) * 0.25
          for (let i = 0; i < curtain.weight.length; i++) {
            const w = curtain.weight[i] ?? 0
            const sd = curtain.side[i] ?? 0
            const by = base[i * 3 + 1] ?? 0
            const wv = w * w
            arr[i * 3] = (base[i * 3] ?? 0) + sd * wv * 0.008 * breathe
            arr[i * 3 + 2] = (base[i * 3 + 2] ?? 0) + wv * 0.008 * (0.6 + 0.4 * Math.sin(t * 0.9 + by * 4)) * (breathe + 0.6)
          }
          curtainPos.needsUpdate = true
        }
      },
      dispose() {
        scene.remove(root)
        disposeTree(root) // the lamp's lights, the desk and the room shell included
      },
    }
  },
}

/** Merges plain geometries that share a material (the glow quads). */
function mergeAll(geos: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const b = createBatch()
  const tmp = new THREE.MeshBasicMaterial()
  for (const g of geos) b.add(g, tmp)
  const group = b.build()
  const mesh = group.children[0] as THREE.Mesh | undefined
  const geo = mesh ? mesh.geometry : new THREE.BufferGeometry()
  tmp.dispose()
  return geo
}

export default bombay1942
export { bombay1942 as bombay1942Dressing }
