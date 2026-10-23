// delhi-1857: a chamber in the Red Fort at night, 17–30 May 1857. A munshi's low writing desk on
// a durrie, a brass chirag, a qalamdan and sealed petitions, before a cusped Mughal jharokha. Out
// of it: a moonless indigo sky (the new moon was sighted on 24 May), the Fort's crenellated
// walls, the lit city and the domes and minarets of the Jama Masjid. Primitives and small canvas
// textures only.
import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { ERA_PALETTES, mix } from '../palette'
import { SPOTS, createBatch, createDesk, createWarmLight, disposeTree, frameShot, material, scaleUv } from '../props'
import { TIER_SETTINGS } from '../quality'
import { blobTexture, clothTexture, glowTexture, makeNoise, metalTexture, plasterTexture, toTexture } from '../textures'
import type { EraDressing, QualityTier } from '../types'

type V3 = [number, number, number]
type P2 = [number, number]

const pal = ERA_PALETTES['delhi-1857']
/** A low writing desk: the munshi sits on the durrie, so the floor is close. */
const FLOOR_Y = -0.36
const BACK_Z = -0.52
const CAMERA: EraDressing['camera'] = { pos: [0, 0.86, 1.04], look: [0, 0.02, -0.04] }
/** The jharokha: opening half-width, sill, spring line, arch centre offset, reveal depth. */
const WIN = { x: 0.06, hw: 0.2, sill: 0.03, spring: 0.3, e: 0.07, depth: 0.2, border: 0.075, jaali: 0.13 }
const SANDSTONE = 0x7e4636
/** The chirag's spout points this way, toward the paper; the flame sits at its tip. */
const SPOUT = { dx: 0.8, dz: 0.6, r: 0.05, y: 0.224 }
const FLAME: V3 = [SPOTS.lamp.x + SPOUT.dx * SPOUT.r, SPOUT.y + 0.003, SPOTS.lamp.z + SPOUT.dz * SPOUT.r]

const rgb = (hex: number): [number, number, number] => [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255]

function canvas(w: number, h: number): { c: HTMLCanvasElement; g: CanvasRenderingContext2D | null } {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return { c, g: c.getContext('2d') }
}

/** Fills a canvas with a colour and soft stone grain (per pixel). */
function grain(g: CanvasRenderingContext2D, w: number, h: number, color: number, rng: () => number, amt = 0.14): void {
  const n = makeNoise(rng)
  const C = rgb(color)
  const img = g.createImageData(w, h)
  const d = img.data
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const u = x / w
      const v = y / h
      const k = 1 + (n(u * 6, v * 6, 6, 6) - 0.5) * amt + (n(u * 40, v * 40, 40, 40) - 0.5) * amt * 0.6
      const i = (y * w + x) * 4
      d[i] = C[0] * k
      d[i + 1] = C[1] * k
      d[i + 2] = C[2] * k
      d[i + 3] = 255
    }
  }
  g.putImageData(img, 0, 0)
}

// ---------------------------------------------------------------- the cusped arch

/**
 * The opening of a Shahjahani cusped (multifoil) arch, clockwise from the left sill corner: up the
 * jamb, over a slightly pointed arch scalloped into `lobes` foils, and down the right jamb.
 */
function cuspedArch(o: { hw: number; sill: number; spring: number; e: number; lobes: number; seg: number }): P2[] {
  const R = o.hw + o.e
  const base: P2[] = []
  const n = 48
  const a1 = Math.acos(-o.e / R)
  for (let i = 0; i <= n; i++) {
    const a = Math.PI + (a1 - Math.PI) * (i / n)
    base.push([o.e + R * Math.cos(a), o.spring + R * Math.sin(a)])
  }
  const a2 = Math.acos(o.e / R)
  for (let i = 1; i <= n; i++) {
    const a = a2 * (1 - i / n)
    base.push([-o.e + R * Math.cos(a), o.spring + R * Math.sin(a)])
  }
  const len: number[] = [0]
  for (let i = 1; i < base.length; i++) {
    const p = base[i] as P2
    const q = base[i - 1] as P2
    len.push((len[i - 1] ?? 0) + Math.hypot(p[0] - q[0], p[1] - q[1]))
  }
  const total = len[len.length - 1] ?? 1
  const at = (s: number): P2 => {
    let i = 1
    while (i < len.length - 1 && (len[i] ?? 0) < s) i++
    const l0 = len[i - 1] ?? 0
    const l1 = len[i] ?? 1
    const p = base[i - 1] as P2
    const q = base[i] as P2
    const k = l1 > l0 ? (s - l0) / (l1 - l0) : 0
    return [p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k]
  }
  const out: P2[] = [[-o.hw, o.sill]]
  for (let j = 0; j < o.lobes; j++) {
    const A = at((total * j) / o.lobes)
    const B = at((total * (j + 1)) / o.lobes)
    const dx = B[0] - A[0]
    const dy = B[1] - A[1]
    const c = Math.hypot(dx, dy)
    // each foil bulges outward (left of travel), so the cusps between foils point into the opening
    const depth = c * 0.3
    const cx = (A[0] + B[0]) / 2 + (-dy / c) * depth * 2
    const cy = (A[1] + B[1]) / 2 + (dx / c) * depth * 2
    for (let i = j === 0 ? 0 : 1; i <= o.seg; i++) {
      const t = i / o.seg
      const u = 1 - t
      out.push([u * u * A[0] + 2 * u * t * cx + t * t * B[0], u * u * A[1] + 2 * u * t * cy + t * t * B[1]])
    }
  }
  out.push([o.hw, o.sill])
  return out
}

/** The soffit of the opening: the outline swept back by `depth`, faces turned into the opening. */
function revealGeometry(outline: P2[], depth: number, tile: number): THREE.BufferGeometry {
  const pos: number[] = []
  const nor: number[] = []
  const uv: number[] = []
  let run = 0
  for (let i = 0; i < outline.length; i++) {
    const A = outline[i] as P2
    const B = outline[(i + 1) % outline.length] as P2
    const dx = B[0] - A[0]
    const dy = B[1] - A[1]
    const L = Math.hypot(dx, dy)
    if (L < 1e-6) continue
    const nx = dy / L
    const ny = -dx / L
    const a0: V3 = [A[0], A[1], 0]
    const b0: V3 = [B[0], B[1], 0]
    const a1: V3 = [A[0], A[1], -depth]
    const b1: V3 = [B[0], B[1], -depth]
    const ua = run / tile
    const ub = (run + L) / tile
    const vd = depth / tile
    for (const [p, u, v] of [
      [a0, ua, 0], [b1, ub, vd], [b0, ub, 0],
      [a0, ua, 0], [a1, ua, vd], [b1, ub, vd],
    ] as [V3, number, number][]) {
      pos.push(...p)
      nor.push(nx, ny, 0)
      uv.push(u, v)
    }
    run += L
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  return g
}

// ---------------------------------------------------------------- textures

/** Red sandstone frame with white-marble inlay: a border, a moulding round the arch, rosettes. */
function frameTexture(size: number, rng: () => number, rect: { x0: number; y0: number; w: number; h: number }, outline: P2[], apex: number): THREE.CanvasTexture {
  const { c, g } = canvas(size, size)
  if (g) {
    grain(g, size, size, SANDSTONE, rng, 0.16)
    // draw in metres, origin at the frame's bottom-left, y up
    g.setTransform(size / rect.w, 0, 0, -size / rect.h, -rect.x0 * (size / rect.w), size + rect.y0 * (size / rect.h))
    const inlay = 'rgba(236,224,196,0.92)'
    const groove = 'rgba(40,14,8,0.55)'
    const line = (w: number, col: string, f: () => void) => {
      g.lineWidth = w
      g.strokeStyle = col
      g.beginPath()
      f()
      g.stroke()
    }
    const arch = () => {
      outline.forEach(([x, y], i) => (i === 0 ? g.moveTo(x + WIN.x, y) : g.lineTo(x + WIN.x, y)))
    }
    // a carved moulding round the opening: a groove, then a band of inlay
    line(0.022, groove, arch)
    // the inlay follows the arch a little outside its edge
    const out = outline.map(([x, y]): P2 =>
      y <= WIN.spring + 1e-6 ? [WIN.x + x + Math.sign(x) * 0.014, y] : [WIN.x + x * 1.07, WIN.spring + (y - WIN.spring) * 1.07],
    )
    line(0.006, inlay, () => out.forEach(([x, y], i) => (i === 0 ? g.moveTo(x, y) : g.lineTo(x, y))))
    // the rectangular frame (alfiz): groove and double inlay line
    const inset = 0.016
    const x0 = rect.x0 + inset
    const y0 = rect.y0 + 0.05
    const x1 = rect.x0 + rect.w - inset
    const y1 = rect.y0 + rect.h - inset
    line(0.008, groove, () => g.rect(x0, y0, x1 - x0, y1 - y0))
    line(0.0035, inlay, () => g.rect(x0 + 0.004, y0 + 0.004, x1 - x0 - 0.008, y1 - y0 - 0.008))
    line(0.002, inlay, () => g.rect(x0 + 0.011, y0 + 0.011, x1 - x0 - 0.022, y1 - y0 - 0.022))
    // a rosette in each spandrel, with a leaf either side
    for (const side of [-1, 1]) {
      const rx = WIN.x + side * (WIN.hw * 0.86)
      const ry = apex + (y1 - apex) * 0.1 - 0.02
      g.fillStyle = inlay
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2
        g.beginPath()
        g.ellipse(rx + Math.cos(a) * 0.012, ry + Math.sin(a) * 0.012, 0.0095, 0.0042, a, 0, Math.PI * 2)
        g.fill()
      }
      g.fillStyle = 'rgba(120,40,24,1)'
      g.beginPath()
      g.arc(rx, ry, 0.0055, 0, Math.PI * 2)
      g.fill()
      line(0.0028, inlay, () => {
        g.moveTo(rx - side * 0.022, ry - 0.004)
        g.quadraticCurveTo(rx - side * 0.05, ry - 0.03, rx - side * 0.075, ry - 0.012)
        g.moveTo(rx + side * 0.018, ry + 0.016)
        g.quadraticCurveTo(rx + side * 0.03, ry + 0.04, rx + side * 0.055, ry + 0.036)
      })
    }
  }
  return toTexture(c)
}

/** A stone jaali: octagons with small diamonds between, cut through (alpha), with a solid rim. */
function jaaliTexture(size: number, rng: () => number, w: number, h: number): THREE.CanvasTexture {
  const H = size / 2
  const { c, g } = canvas(size, H)
  if (g) {
    grain(g, size, H, mix(SANDSTONE, 0xb07050, 0.25), rng, 0.12)
    g.setTransform(size / w, 0, 0, H / h, 0, 0)
    const cell = h / 3.6
    const rim = 0.012
    const shape = (cx: number, cy: number, r: number, sides: number, rot: number) => {
      g.beginPath()
      for (let k = 0; k < sides; k++) {
        const a = rot + (k / sides) * Math.PI * 2
        const x = cx + Math.cos(a) * r
        const y = cy + Math.sin(a) * r
        if (k === 0) g.moveTo(x, y)
        else g.lineTo(x, y)
      }
      g.closePath()
    }
    const holes = (grow: number, f: () => void) => {
      for (let y = rim + cell / 2; y < h - rim; y += cell) {
        for (let x = rim + cell / 2; x < w - rim; x += cell) {
          shape(x, y, cell * 0.4 + grow, 8, Math.PI / 8)
          f()
          if (x + cell < w - rim && y + cell < h - rim) {
            shape(x + cell / 2, y + cell / 2, cell * 0.13 + grow, 4, 0)
            f()
          }
        }
      }
    }
    // a darker bevel round each hole, then cut the holes through
    g.fillStyle = 'rgba(30,10,6,0.6)'
    holes(cell * 0.06, () => g.fill())
    g.globalCompositeOperation = 'destination-out'
    g.fillStyle = '#000'
    holes(0, () => g.fill())
  }
  return toTexture(c)
}

/** A stencilled border on lime plaster: a vine with five-petalled flowers between ochre rules. */
function bandTexture(w: number, rng: () => number): THREE.CanvasTexture {
  const h = w / 8
  const { c, g } = canvas(w, h)
  if (g) {
    const s = h / 64
    const ochre = 'rgba(150,62,30,0.9)'
    g.fillStyle = ochre
    g.fillRect(0, 3 * s, w, 3 * s)
    g.fillRect(0, h - 6 * s, w, 3 * s)
    g.fillStyle = 'rgba(150,62,30,0.45)'
    g.fillRect(0, 9 * s, w, 1.5 * s)
    g.fillRect(0, h - 10.5 * s, w, 1.5 * s)
    const period = w / 4
    g.lineWidth = 2.2 * s
    g.strokeStyle = 'rgba(62,84,44,0.9)'
    g.beginPath()
    for (let x = 0; x <= w; x += 2) {
      const y = h / 2 + Math.sin((x / period) * Math.PI * 2) * 9 * s
      if (x === 0) g.moveTo(x, y)
      else g.lineTo(x, y)
    }
    g.stroke()
    for (let k = 0; k < 4; k++) {
      const x0 = k * period
      // a leaf on each swing of the vine
      for (const [dx, up] of [[0.25, -1], [0.75, 1]] as const) {
        const lx = x0 + dx * period
        const ly = h / 2 + up * 9 * s
        g.fillStyle = 'rgba(70,96,48,0.92)'
        g.beginPath()
        g.ellipse(lx, ly + up * 6 * s, 7 * s, 3 * s, up * 0.6, 0, Math.PI * 2)
        g.fill()
      }
      // a flower where the vine crosses the middle
      const fx = x0 + period * 0.5 + (rng() - 0.5) * 2 * s
      const fy = h / 2
      g.fillStyle = 'rgba(164,44,28,0.95)'
      for (let p = 0; p < 5; p++) {
        const a = (p / 5) * Math.PI * 2 - Math.PI / 2
        g.beginPath()
        g.ellipse(fx + Math.cos(a) * 6 * s, fy + Math.sin(a) * 6 * s, 5 * s, 3.4 * s, a, 0, Math.PI * 2)
        g.fill()
      }
      g.fillStyle = 'rgba(214,160,60,1)'
      g.beginPath()
      g.arc(fx, fy, 2.6 * s, 0, Math.PI * 2)
      g.fill()
      // a bud at the period boundary
      g.fillStyle = 'rgba(164,44,28,0.85)'
      g.beginPath()
      g.arc(x0, h / 2, 2.8 * s, 0, Math.PI * 2)
      g.fill()
    }
  }
  const t = toTexture(c)
  t.wrapS = THREE.RepeatWrapping
  return t
}

/** A flat-woven cotton durrie: an indigo field banded in madder with cream pinstripes, a madder border with a cream zigzag. */
function durrieTexture(size: number, rng: () => number): THREE.CanvasTexture {
  const n = makeNoise(rng)
  const indigo = rgb(0x2b3556)
  const madder = rgb(0x8a2c1e)
  const cream = rgb(0xcfbf98)
  const { c, g } = canvas(size, size)
  if (g) {
    const img = g.createImageData(size, size)
    const d = img.data
    const threads = size / 2
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const u = x / size
        const v = y / size
        const edge = Math.min(u, 1 - u, v, 1 - v)
        let col = indigo
        if (edge < 0.025) col = indigo
        else if (edge < 0.085) {
          // the border: madder with a cream zigzag running round it
          const along = edge === Math.min(u, 1 - u) ? v : u
          const zig = Math.abs(((along * 30) % 1) - 0.5) * 2
          col = Math.abs((edge - 0.025) / 0.06 - zig) < 0.12 ? cream : madder
        } else {
          // broad madder bands on the indigo, each edged by a thin cream line
          const b = (v * 9) % 1
          col = b > 0.62 && b < 0.9 ? madder : indigo
          if (Math.abs(b - 0.6) < 0.012 || Math.abs(b - 0.92) < 0.012) col = cream
        }
        const weave = Math.sin(Math.PI * ((x + (Math.floor(y / 2) % 2)) % 2)) * 0.04
        const slub = (n(u * 8, v * threads, 8, threads) - 0.5) * 0.18
        const k = 0.9 + slub + weave
        const i = (y * size + x) * 4
        d[i] = col[0] * k
        d[i + 1] = col[1] * k
        d[i + 2] = col[2] * k
        d[i + 3] = 255
      }
    }
    g.putImageData(img, 0, 0)
  }
  return toTexture(c)
}

/** Kashmiri-style lacquer on papier-mâché: a dark red ground, gold rules and flower sprays. */
function lacquerTexture(w: number, rng: () => number): THREE.CanvasTexture {
  const h = w / 4
  const { c, g } = canvas(w, h)
  if (g) {
    g.fillStyle = '#3e130c'
    g.fillRect(0, 0, w, h)
    const s = h / 64
    const gold = '#c99a45'
    g.strokeStyle = gold
    g.lineWidth = 2 * s
    g.strokeRect(5 * s, 5 * s, w - 10 * s, h - 10 * s)
    g.lineWidth = 1 * s
    g.strokeRect(9 * s, 9 * s, w - 18 * s, h - 18 * s)
    // a cartouche in the middle and sprays of small flowers along the lid
    g.lineWidth = 1.6 * s
    g.beginPath()
    g.ellipse(w / 2, h / 2, 34 * s, 16 * s, 0, 0, Math.PI * 2)
    g.stroke()
    const flower = (x: number, y: number, r: number, col: string) => {
      g.fillStyle = col
      for (let p = 0; p < 5; p++) {
        const a = (p / 5) * Math.PI * 2
        g.beginPath()
        g.arc(x + Math.cos(a) * r, y + Math.sin(a) * r, r * 0.75, 0, Math.PI * 2)
        g.fill()
      }
      g.fillStyle = gold
      g.beginPath()
      g.arc(x, y, r * 0.5, 0, Math.PI * 2)
      g.fill()
    }
    flower(w / 2, h / 2, 5 * s, '#b8432c')
    for (let k = 0; k < 10; k++) {
      const x = 20 * s + rng() * (w - 40 * s)
      if (Math.abs(x - w / 2) < 42 * s) continue
      const y = 18 * s + rng() * (h - 36 * s)
      g.strokeStyle = '#5d7a3c'
      g.lineWidth = 1.2 * s
      g.beginPath()
      g.moveTo(x, y)
      g.quadraticCurveTo(x + 6 * s, y + 8 * s, x + 2 * s, y + 14 * s)
      g.stroke()
      flower(x, y, (2.2 + rng() * 1.6) * s, rng() < 0.5 ? '#b8432c' : '#d9b56a')
    }
  }
  return toTexture(c)
}

/** The brass chirag and its stand are unlit with a baked gradient; a flame 2 cm away blows lit brass out. */
function brassGradient(rng: () => number, size: number): THREE.CanvasTexture {
  const { c, g } = canvas(16, size)
  if (g) {
    const grad = g.createLinearGradient(0, size, 0, 0)
    grad.addColorStop(0, '#1e1208')
    grad.addColorStop(0.35, '#5a3a14')
    grad.addColorStop(0.7, '#a8742e')
    grad.addColorStop(0.92, '#e2b062')
    grad.addColorStop(1, '#ffe2a0')
    g.fillStyle = grad
    g.fillRect(0, 0, 16, size)
    const n = makeNoise(rng)
    for (let y = 0; y < size; y++) {
      g.fillStyle = `rgba(0,0,0,${(n(0, (y / size) * 20, 1, 20) * 0.2).toFixed(3)})`
      g.fillRect(0, y, 16, 1)
    }
  }
  return toTexture(c)
}

/** Soft rising streaks for the heat over the flame; tiles vertically. */
function shimmerTexture(): THREE.CanvasTexture {
  const W = 32
  const H = 128
  const { c, g } = canvas(W, H)
  if (g) {
    const img = g.createImageData(W, H)
    const d = img.data
    for (let y = 0; y < H; y++) {
      const v = y / H
      for (let x = 0; x < W; x++) {
        const u = x / W
        const centre = 0.5 + 0.12 * Math.sin(v * Math.PI * 4) + 0.06 * Math.sin(v * Math.PI * 10 + 1)
        const k = Math.exp(-Math.pow((u - centre) / 0.12, 2)) * (0.6 + 0.4 * Math.sin(v * Math.PI * 6) ** 2)
        const i = (y * W + x) * 4
        const b = Math.round(255 * k)
        d[i] = b
        d[i + 1] = b
        d[i + 2] = b
        d[i + 3] = 255
      }
    }
    g.putImageData(img, 0, 0)
  }
  const t = toTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  return t
}

// ---------------------------------------------------------------- outside the jharokha

interface Outside {
  group: THREE.Group
}

/**
 * The night beyond the window. Layers sit at real depths, laid out along the desk shot's line of
 * sight through the opening, so the parallax is honest: the Fort's ramparts, the city, the Jama
 * Masjid, then the sky. Silhouettes are vertex coloured, lighter on top where the sky lights
 * their edges, and merged into one unlit mesh; the stars are one Points draw.
 */
function buildOutside(tier: QualityTier, rng: () => number): Outside {
  const ref = frameShot(CAMERA, 390 / 844)
  const cam = ref.pos
  const WZ = BACK_Z - WIN.depth
  const f = (z: number) => (z - cam.z) / (WZ - cam.z)
  /** World point at depth z seen through window-plane point (u, v). */
  const at = (z: number, u: number, v: number): V3 => [cam.x + (u - cam.x) * f(z), cam.y + (v - cam.y) * f(z), z]
  const low = tier === 'low'
  const parts: THREE.BufferGeometry[] = []
  const tmp = new THREE.Color()
  const lin = (hex: number, gain = 1) => tmp.set(hex).multiplyScalar(gain).toArray() as [number, number, number]

  /** Authored in window units around (u, v) at depth z; coloured bottom → top. */
  /** `sharp` > 1 keeps the sky-lit rim to the very top (tall walls); 1.6 suits domes and small parts. */
  const put = (geo: THREE.BufferGeometry, z: number, u: number, v: number, bottom: number, top: number, gain = 1, sharp = 1.6) => {
    const g = geo.index ? geo.toNonIndexed() : geo
    if (g !== geo) geo.dispose()
    g.computeBoundingBox()
    const bb = g.boundingBox as THREE.Box3
    const p = g.getAttribute('position') as THREE.BufferAttribute
    const col = new Float32Array(p.count * 3)
    const b = lin(bottom, gain)
    const t = lin(top, gain)
    const span = Math.max(1e-6, bb.max.y - bb.min.y)
    for (let i = 0; i < p.count; i++) {
      const k = Math.pow((p.getY(i) - bb.min.y) / span, sharp)
      col[i * 3] = b[0] + (t[0] - b[0]) * k
      col[i * 3 + 1] = b[1] + (t[1] - b[1]) * k
      col[i * 3 + 2] = b[2] + (t[2] - b[2]) * k
    }
    for (const name of Object.keys(g.attributes)) if (name !== 'position') g.deleteAttribute(name)
    g.setAttribute('color', new THREE.BufferAttribute(col, 3))
    const s = f(z)
    g.scale(s, s, s)
    g.translate(...at(z, u, v))
    parts.push(g)
  }
  // tall parts get height segments, so a sharp rim gradient has vertices to follow
  const box = (w: number, h: number, d = 0.01, hs = 1) => new THREE.BoxGeometry(w, h, d, 1, hs, 1).translate(0, h / 2, 0)
  const cyl = (rt: number, rb: number, h: number, seg = 10, hs = 1) => new THREE.CylinderGeometry(rt, rb, h, seg, hs).translate(0, h / 2, 0)
  const lathe = (pts: P2[], seg: number) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg)
  /** A bulbous Mughal dome with a narrow neck and a finial, radius r, base at y = 0. */
  const dome = (r: number, seg: number) =>
    lathe([[0, 0], [r * 0.92, 0], [r * 1.04, r * 0.3], [r * 1.0, r * 0.62], [r * 0.8, r * 0.92], [r * 0.46, r * 1.14], [r * 0.14, r * 1.26], [r * 0.07, r * 1.3], [r * 0.07, r * 1.38], [r * 0.12, r * 1.44], [r * 0.03, r * 1.5], [r * 0.025, r * 1.78], [0, r * 1.8]], seg)

  // the sky: indigo deepening upward, a faint warm haze over the lamps of the city, no moon
  const skyZ = -20
  {
    const g = new THREE.PlaneGeometry(1, 1, 1, 14)
    const p = g.getAttribute('position') as THREE.BufferAttribute
    const col = new Float32Array(p.count * 3)
    const v0 = -0.25
    const v1 = 1.1
    const stops: [number, number][] = [[0.12, 0x2a1c2c], [0.24, 0x24224a], [0.34, 0x1a1f4e], [0.5, 0x10153a], [0.7, 0x090c28], [1.1, 0x05071a]]
    for (let i = 0; i < p.count; i++) {
      const v = v0 + (p.getY(i) + 0.5) * (v1 - v0)
      let a = stops[0] as [number, number]
      let b = a
      for (const s of stops) {
        if (s[0] <= v) a = s
        if (s[0] >= v) {
          b = s
          break
        }
      }
      if (v >= (stops[stops.length - 1] as [number, number])[0]) b = a
      const k = b[0] > a[0] ? (v - a[0]) / (b[0] - a[0]) : 0
      const ca = lin(a[1], 1.25)
      const cb = lin(b[1], 1.25)
      col[i * 3] = ca[0] + (cb[0] - ca[0]) * k
      col[i * 3 + 1] = ca[1] + (cb[1] - ca[1]) * k
      col[i * 3 + 2] = ca[2] + (cb[2] - ca[2]) * k
      // window-plane coordinates → world at the sky's depth
      const u = WIN.x + p.getX(i) * 1.6
      const w = at(skyZ, u, v)
      p.setXYZ(i, w[0], w[1], skyZ)
    }
    g.deleteAttribute('normal')
    g.deleteAttribute('uv')
    g.setAttribute('color', new THREE.BufferAttribute(col, 3))
    parts.push(g.toNonIndexed())
    g.dispose()
  }

  // the Jama Masjid, far off on its plinth: a prayer hall with a tall central portal, three
  // white-marble domes and two minarets
  {
    const z = -13
    const u0 = WIN.x
    const roof = 0.3
    const hall = 0x16152a
    const hallTop = 0x34304c
    const marble = 0x2a2d48
    const marbleTop = 0x6c7194
    const segs = low ? 10 : 16
    put(box(0.29, roof + 0.2, 0.01, 6), z, u0, -0.2, 0x0b0a14, hallTop, 1, 4)
    // the arcade of the prayer hall, five bays a side, and the tall central portal (pishtaq)
    const bay = (hw: number, h: number) => {
      const sh = new THREE.Shape()
      sh.moveTo(-hw, 0)
      sh.lineTo(-hw, h * 0.62)
      sh.quadraticCurveTo(-hw, h * 0.9, 0, h)
      sh.quadraticCurveTo(hw, h * 0.9, hw, h * 0.62)
      sh.lineTo(hw, 0)
      return new THREE.ShapeGeometry(sh, 3).translate(0, 0, 0.0052)
    }
    for (let k = 1; k <= 5; k++) for (const s of [-1, 1]) put(bay(0.0085, 0.032), z, u0 + s * (0.032 + k * 0.022), roof - 0.046, 0x07060d, 0x0d0b16)
    put(box(0.074, 0.062, 0.012), z, u0, roof - 0.05, hall, 0x463e60)
    put(bay(0.022, 0.07).translate(0, 0, 0.0012), z, u0, roof - 0.05, 0x07060d, 0x100e1a)
    for (const s of [-1, 1]) put(cyl(0.0032, 0.0038, 0.075, 6), z, u0 + s * 0.039, roof - 0.05, hall, 0x4a4466)
    put(cyl(0.038, 0.04, 0.014, segs), z, u0, roof, marble, marbleTop)
    put(dome(0.048, segs), z, u0, roof + 0.014, marble, marbleTop)
    for (const s of [-1, 1]) {
      put(cyl(0.026, 0.028, 0.01, segs), z, u0 + s * 0.086, roof, marble, marbleTop)
      put(dome(0.032, segs), z, u0 + s * 0.086, roof + 0.01, marble, marbleTop, 0.95)
    }
    // minarets: tapering shafts with two galleries and an open kiosk on top
    for (const s of [-1, 1]) {
      const mu = u0 + s * 0.136
      put(cyl(0.0056, 0.0082, 0.5, 8), z, mu, -0.08, 0x121120, 0x37344f)
      if (!low) {
        for (const gv of [0.28, 0.36]) put(cyl(0.0115, 0.0095, 0.006, 8), z, mu, gv, 0x262439, 0x55536f)
      }
      put(cyl(0.0088, 0.0088, 0.014, 8), z, mu, 0.42, 0x262439, 0x48466a)
      put(dome(0.0102, 8), z, mu, 0.434, marble, marbleTop)
    }
  }

  // the city, flat-roofed with a few small domes and lamps in some windows, in two rows: the far
  // roofs show over the merlons from the desk; the nearer ones sit below the rampart's line and
  // are what the higher intro camera looks down on before the Masjid rises into the window
  const lamps: V3[] = []
  const rows = [
    { z: -4.3, lo: 0.1, hi: 0.17, n: low ? 10 : 18, base: 0x0a090f, roof: 0x2a2632 },
    { z: -6.5, lo: 0.205, hi: 0.255, n: low ? 14 : 24, base: 0x08070d, roof: 0x24202e },
  ]
  for (const row of rows) {
    let u = WIN.x - 0.4
    for (let i = 0; i < row.n && u < WIN.x + 0.42; i++) {
      const w = 0.022 + rng() * 0.03
      const top = row.lo + rng() * (row.hi - row.lo) + (rng() < 0.12 ? 0.022 : 0)
      put(box(w, top + 0.5, 0.02, 6), row.z + rng() * 0.3, u + w / 2, -0.5, row.base, row.roof, 1, 6)
      if (rng() < 0.18) put(dome(0.008, 8), row.z, u + w / 2, top, 0x14121c, 0x34304a)
      const lit = rng() < 0.45 ? 1 : rng() < 0.5 ? 2 : 0
      for (let k = 0; k < lit; k++) lamps.push(at(row.z + 0.4, u + w * (0.2 + rng() * 0.6), top - 0.009 - rng() * 0.05))
      u += w + rng() * 0.006
    }
  }
  for (const [x, y, z] of lamps) {
    const s = f(z) * (0.0065 + rng() * 0.0025)
    const g = new THREE.PlaneGeometry(s, s * 1.3)
    g.translate(x, y, z)
    const p = g.getAttribute('position') as THREE.BufferAttribute
    const col = new Float32Array(p.count * 3)
    const c = lin(rng() < 0.5 ? 0xffb35c : 0xe0802e, 2.6)
    for (let i = 0; i < p.count; i++) col.set(c, i * 3)
    g.deleteAttribute('normal')
    g.deleteAttribute('uv')
    g.setAttribute('color', new THREE.BufferAttribute(col, 3))
    parts.push(g.toNonIndexed())
    g.dispose()
  }

  // the Fort's own rampart of red sandstone, crenellated, with a bastion and its kiosk at the left
  {
    // near, so the higher intro camera looks over it onto the city instead of down its face
    const z = -1.6
    const wallTop = 0.168
    const red = 0x170c12
    const redTop = 0x4a2834
    put(box(0.9, wallTop + 0.5, 0.06, 12), z, WIN.x, -0.5, red, redTop, 1, 14)
    const step = low ? 0.04 : 0.03
    for (let u = WIN.x - 0.42; u < WIN.x + 0.45; u += step) {
      put(box(0.016, 0.02, 0.03), z, u, wallTop, 0x2c1620, 0x5a3442)
      if (!low) put(new THREE.ConeGeometry(0.0115, 0.008, 4).rotateY(Math.PI / 4).translate(0, 0.004, 0), z, u, wallTop + 0.02, 0x3a1e2a, 0x6a3e4e)
    }
    const bu = WIN.x - 0.17
    put(cyl(0.05, 0.056, 0.75, low ? 10 : 16, 12), z + 0.05, bu, -0.55, red, redTop, 1, 14)
    // torches at a gate in the rampart: seen from the intro, and glinting through the jaali
    for (const tu of [WIN.x + 0.07, WIN.x + 0.13]) lamps.push(at(z + 0.06, tu, 0.1))
    put(cyl(0.022, 0.022, 0.026, 8), z + 0.05, bu, 0.2, 0x2a1520, 0x5a3644)
    put(dome(0.026, low ? 8 : 12), z + 0.05, bu, 0.226, 0x2a1520, 0x6a4654)
  }

  const geo = mergeGeometries(parts, false)
  for (const p of parts) p.dispose()
  const group = new THREE.Group()
  if (geo) group.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, fog: false })))

  // stars: one Points draw, crisp at any DPR; the silhouettes in front hide the ones behind them
  {
    const count = low ? 70 : 150
    const z = skyZ + 0.4
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const u = WIN.x + (rng() - 0.5) * 0.7
      const v = 0.24 + Math.pow(rng(), 0.8) * 0.5
      pos.set(at(z, u, v), i * 3)
      const b = 0.25 + Math.pow(rng(), 3) * 1.3
      const warm = rng()
      col.set([b * (warm < 0.2 ? 1 : 0.86), b * (warm < 0.2 ? 0.88 : 0.9), b * (warm < 0.2 ? 0.7 : 1)], i * 3)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('color', new THREE.BufferAttribute(col, 3))
    const dot = glowTexture(32)
    const stars = new THREE.Points(
      g,
      new THREE.PointsMaterial({ size: low ? 2.4 : 2.8, sizeAttenuation: false, map: dot, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }),
    )
    stars.frustumCulled = false
    group.add(stars)
  }

  // soft halos round a few of the city's lamps
  if (!low && lamps.length) {
    const glows: THREE.BufferGeometry[] = []
    for (const [x, y, z] of lamps.filter((_, i) => i % 2 === 0).slice(0, 14)) {
      const s = f(z) * 0.05
      const g = new THREE.PlaneGeometry(s, s).translate(x, y, z + 0.01)
      const p = g.getAttribute('position') as THREE.BufferAttribute
      const col = new Float32Array(p.count * 3)
      for (let i = 0; i < p.count; i++) col.set([0.55, 0.27, 0.08], i * 3)
      g.deleteAttribute('normal')
      g.setAttribute('color', new THREE.BufferAttribute(col, 3))
      glows.push(g)
    }
    const merged = mergeGeometries(glows, false)
    for (const g of glows) g.dispose()
    if (merged) {
      group.add(
        new THREE.Mesh(
          merged,
          new THREE.MeshBasicMaterial({ map: glowTexture(64), vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }),
        ),
      )
    }
  }
  return { group }
}

// ---------------------------------------------------------------- the dressing

const delhi1857: EraDressing = {
  id: 'delhi-1857',
  camera: CAMERA,
  lightColor: pal.lamp,
  build({ scene, tier, rng }) {
    const s = TIER_SETTINGS[tier]
    const low = tier === 'low'
    const root = new THREE.Group()
    root.name = 'delhi-1857'
    const tile = 1.2

    // -------------------------------------------------- the room and the jharokha
    const outline = cuspedArch({ hw: WIN.hw, sill: WIN.sill, spring: WIN.spring, e: WIN.e, lobes: 9, seg: low ? 5 : 7 })
    const apex = WIN.spring + Math.sqrt((WIN.hw + WIN.e) ** 2 - WIN.e ** 2)
    const fx0 = WIN.x - WIN.hw - WIN.border
    const fx1 = WIN.x + WIN.hw + WIN.border
    const fy0 = WIN.sill - 0.06
    const fy1 = apex + WIN.border + 0.03
    const rect = { x0: fx0, y0: fy0, w: fx1 - fx0, h: fy1 - fy0 }

    const wallMat = material(tier, {
      map: plasterTexture(pal.wall, { size: s.texSize, rng, anisotropy: s.anisotropy }),
      bump: 0.35,
      shininess: 4,
      specular: 0x0a0a0a,
    })
    const floorMat = material(tier, { color: mix(pal.floor, 0x8a7a66, 0.2), shininess: 10 })
    const trimMat = material(tier, { color: mix(pal.floor, 0x000000, 0.45), shininess: 14 })
    const sandTex = plasterTexture(SANDSTONE, { size: Math.min(256, s.texSize), rng, anisotropy: s.anisotropy })
    // a little emissive stands in for the lamplight bouncing round the deep reveal
    // on low the frame is plain tiling sandstone under Lambert, which reads brighter than the carved one: calm it
    const sandMat = material(tier, { map: sandTex, color: low ? 0xc4b2a8 : 0xffffff, bump: 0.5, shininess: 6, specular: 0x140c08, emissive: 0x140806 })
    /** The frame stands proud of the plaster by 2 cm; the reveal starts at its face. */
    const FZ = BACK_Z + 0.02

    const W = 3.2
    const H = 2.8
    const front = 1.8
    const depth = front - BACK_Z
    const b = createBatch()
    {
      const wall = new THREE.Shape([
        new THREE.Vector2(-W / 2, FLOOR_Y), new THREE.Vector2(W / 2, FLOOR_Y),
        new THREE.Vector2(W / 2, FLOOR_Y + H), new THREE.Vector2(-W / 2, FLOOR_Y + H),
      ])
      wall.holes.push(new THREE.Path([
        new THREE.Vector2(fx0, fy0), new THREE.Vector2(fx0, fy1), new THREE.Vector2(fx1, fy1), new THREE.Vector2(fx1, fy0),
      ]))
      b.add(scaleUv(new THREE.ShapeGeometry(wall), 1 / tile, 1 / tile), wallMat, [0, 0, BACK_Z], [0, 0, 0], false, false)
      b.add(scaleUv(new THREE.PlaneGeometry(depth, H), depth / tile, H / tile), wallMat, [-W / 2, FLOOR_Y + H / 2, BACK_Z + depth / 2], [0, Math.PI / 2, 0], false, false)
      b.add(scaleUv(new THREE.PlaneGeometry(depth, H), depth / tile, H / tile), wallMat, [W / 2, FLOOR_Y + H / 2, BACK_Z + depth / 2], [0, -Math.PI / 2, 0], false, false)
      b.add(new THREE.PlaneGeometry(W, depth), floorMat, [0, FLOOR_Y, BACK_Z + depth / 2], [-Math.PI / 2, 0, 0], false, true)
      b.add(new THREE.BoxGeometry(W, 0.07, 0.014), trimMat, [0, FLOOR_Y + 0.035, BACK_Z + 0.007], [0, 0, 0], false, false)
    }

    // the frame: carved red sandstone with marble inlay (plain sandstone on low), flush with the wall
    {
      const shape = new THREE.Shape([
        new THREE.Vector2(fx0, fy0), new THREE.Vector2(fx1, fy0), new THREE.Vector2(fx1, fy1), new THREE.Vector2(fx0, fy1),
      ])
      shape.holes.push(new THREE.Path(outline.map(([x, y]) => new THREE.Vector2(x + WIN.x, y))))
      const geo = new THREE.ShapeGeometry(shape, 2)
      if (low) {
        b.add(scaleUv(geo, 1 / 0.6, 1 / 0.6), sandMat, [0, 0, FZ], [0, 0, 0], false, true)
      } else {
        const uv = geo.getAttribute('uv') as THREE.BufferAttribute
        const p = geo.getAttribute('position') as THREE.BufferAttribute
        for (let i = 0; i < uv.count; i++) uv.setXY(i, (p.getX(i) - fx0) / rect.w, (p.getY(i) - fy0) / rect.h)
        const frameMat = material(tier, { map: frameTexture(s.texSize, rng, rect, outline, apex), bump: 0.8, shininess: 8, specular: 0x1a0e08, emissive: 0x140806 })
        b.add(geo, frameMat, [0, 0, FZ], [0, 0, 0], false, true)
      }
    }
    // the deep reveal, its floor, and the projecting sill
    // the reveal's shaded side would go black; lamplight bouncing round the recess keeps it readable
    const revealMat = material(tier, { map: sandTex, bump: 0.5, shininess: 6, specular: 0x140c08, emissive: 0x3e1c12 })
    b.add(revealGeometry(outline, WIN.depth + FZ - BACK_Z, 0.6), revealMat, [WIN.x, 0, FZ], [0, 0, 0], false, true)
    b.add(new THREE.BoxGeometry(fx1 - fx0 + 0.05, 0.024, 0.06), sandMat, [WIN.x, WIN.sill - 0.012, BACK_Z + 0.03])
    // a raised moulding round the frame and a cornice over it
    const mould = 0.016
    // rounded (torus-section) mouldings: a flat-sided box edge reads as a black seam where it turns from the lamp
    b.add(new THREE.BoxGeometry(fx1 - fx0 + mould * 2, mould, 0.03), sandMat, [WIN.x, fy1 + mould / 2, BACK_Z + 0.015])
    for (const x of [fx0, fx1]) b.add(new THREE.CylinderGeometry(mould * 0.7, mould * 0.7, fy1 - fy0, 10, 1), sandMat, [x, (fy0 + fy1) / 2, FZ], [0, 0, 0], false, true)
    b.add(new THREE.BoxGeometry(fx1 - fx0 + 0.09, 0.022, 0.07), sandMat, [WIN.x, fy1 + mould + 0.011, BACK_Z + 0.035])
    if (!low) {
      b.add(new THREE.BoxGeometry(fx1 - fx0 + 0.12, 0.012, 0.09), sandMat, [WIN.x, fy1 + mould + 0.028, BACK_Z + 0.045])
      // small stepped brackets under the sill
      for (const sx of [-1, 1]) {
        const x = WIN.x + sx * (WIN.hw + WIN.border * 0.45)
        b.add(new THREE.BoxGeometry(0.036, 0.014, 0.034), sandMat, [x, WIN.sill - 0.031, FZ + 0.017])
        b.add(new THREE.BoxGeometry(0.028, 0.014, 0.024), sandMat, [x, WIN.sill - 0.045, FZ + 0.012])
        b.add(new THREE.BoxGeometry(0.02, 0.016, 0.014), sandMat, [x, WIN.sill - 0.06, FZ + 0.007])
      }
      // slim baluster colonnettes on the jambs, with bracket capitals under the arch's spring
      const L = WIN.spring - WIN.sill
      const col = new THREE.LatheGeometry(
        ([[0, 0], [0.013, 0], [0.013, 0.012], [0.009, 0.02], [0.012, L * 0.12], [0.0065, L * 0.3], [0.0055, L * 0.8], [0.009, L * 0.86], [0.006, L * 0.9], [0.012, L * 0.96], [0.012, L], [0, L]] as P2[]).map(
          ([r, y]) => new THREE.Vector2(r, y),
        ),
        10,
      )
      for (const sx of [-1, 1]) {
        const x = WIN.x + sx * (WIN.hw + 0.016)
        b.add(col.clone(), sandMat, [x, WIN.sill, FZ + 0.004], [0, 0, 0], false, true)
        b.add(new THREE.BoxGeometry(0.04, 0.016, 0.026), sandMat, [x - sx * 0.006, WIN.spring + 0.008, FZ + 0.006], [0, 0, 0], false, true)
      }
      col.dispose()
    }
    // the jaali parapet at the outer end of the reveal
    {
      const jw = WIN.hw * 2
      const jaaliMat = material(tier, { map: jaaliTexture(Math.min(512, s.texSize), rng, jw, WIN.jaali), shininess: 6 })
      jaaliMat.alphaTest = 0.5
      b.add(new THREE.PlaneGeometry(jw, WIN.jaali), jaaliMat, [WIN.x, WIN.sill + WIN.jaali / 2, BACK_Z - WIN.depth + 0.012], [0, 0, 0], false, true)
    }
    // stencilled borders on the plaster: along the spring line either side of the frame, and a
    // frieze over the cornice (high tiers)
    {
      const bandMat = material(tier, { map: bandTexture(low ? 256 : 512, rng), transparent: true, decal: true, shininess: 4 })
      const bh = 0.045
      const period = bh * 8
      const strip = (x0: number, x1: number, y: number) => {
        const w = x1 - x0
        b.add(scaleUv(new THREE.PlaneGeometry(w, bh), w / period, 1), bandMat, [(x0 + x1) / 2, y, BACK_Z + 0.002], [0, 0, 0], false, true)
      }
      strip(-W / 2, fx0 - mould, WIN.spring + 0.01)
      strip(fx1 + mould, W / 2, WIN.spring + 0.01)
      strip(-W / 2, W / 2, fy1 + 0.14)
    }
    root.add(b.build())

    // -------------------------------------------------- outside
    const outside = buildOutside(tier, rng)
    root.add(outside.group)

    // -------------------------------------------------- the floor: a durrie and a bolster
    {
      const fb = createBatch()
      const durrie = material(tier, { map: durrieTexture(Math.max(256, s.texSize), rng), shininess: 2 })
      fb.add(new THREE.PlaneGeometry(1.9, 1.3), durrie, [0, FLOOR_Y + 0.003, 0.18], [-Math.PI / 2, 0, 0.0], false, true)
      if (!low) {
        // the edge of a gol takiya (round bolster) lying at the left, in striped cotton
        const cloth = material(tier, {
          map: clothTexture(0x7a2a1c, { size: Math.min(256, s.texSize), rng, stripe: 0xb88a40, repeat: [1, 4] }),
          shininess: 6,
        })
        const R = 0.064
        const body = new THREE.CylinderGeometry(R, R, 0.46, 18, 1)
        const buv = body.getAttribute('uv') as THREE.BufferAttribute
        for (let i = 0; i < buv.count; i++) buv.setXY(i, buv.getY(i), buv.getX(i)) // stripes run along it
        fb.add(body, cloth, [-0.46, FLOOR_Y + R, 0.45], [0, 0, Math.PI / 2])
        const cap = new THREE.LatheGeometry(
          ([[R * 0.98, 0], [R * 0.9, 0.012], [R * 0.6, 0.02], [R * 0.2, 0.024], [0, 0.026]] as P2[]).map(([r, y]) => new THREE.Vector2(r, y)),
          18,
        )
        // its end: gathered plain cloth with a covered button
        const endMat = material(tier, { color: 0x5a1a12, shininess: 8 })
        fb.add(cap, endMat, [-0.23, FLOOR_Y + R, 0.45], [0, 0, -Math.PI / 2])
        fb.add(new THREE.SphereGeometry(0.009, 10, 6), material(tier, { color: 0xb08a3c, shininess: 40, specular: 0x403018 }), [-0.203, FLOOR_Y + R, 0.45])
      }
      root.add(fb.build())
    }

    // -------------------------------------------------- the desk
    const desk = createDesk({ palette: pal, tier, rng, height: -FLOOR_Y, legs: 'turned' })
    root.add(desk.group)

    // -------------------------------------------------- the chirag on its stand
    {
      const lb = createBatch()
      const lampMat = new THREE.MeshBasicMaterial({ map: brassGradient(rng, 128) })
      const lathe = (pts: P2[], seg: number) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg)
      const stand = lathe(
        [
          [0, 0], [0.056, 0], [0.058, 0.004], [0.052, 0.01], [0.04, 0.016], [0.026, 0.024], [0.016, 0.034],
          [0.012, 0.046], [0.018, 0.054], [0.011, 0.064], [0.0085, 0.1], [0.0075, 0.15], [0.013, 0.158],
          [0.008, 0.166], [0.0075, 0.186], [0.033, 0.192], [0.036, 0.198], [0.032, 0.201], [0.012, 0.199], [0, 0.199],
        ],
        low ? 12 : 18,
      )
      lb.add(stand, lampMat, [SPOTS.lamp.x, 0, SPOTS.lamp.z], [0, 0, 0], false, false)
      // the chirag: a small bowl with a pinched spout toward the paper
      const bowl = lathe([[0, 0], [0.012, 0], [0.024, 0.005], [0.03, 0.013], [0.029, 0.018], [0.025, 0.016], [0.0, 0.0125]], low ? 12 : 16)
      const buv = bowl.getAttribute('uv') as THREE.BufferAttribute
      for (let i = 0; i < buv.count; i++) buv.setY(i, 0.22 + buv.getY(i) * 0.42)
      lb.add(bowl, lampMat, [SPOTS.lamp.x, 0.2, SPOTS.lamp.z], [0, 0, 0], false, false)
      const yaw = Math.atan2(SPOUT.dz, SPOUT.dx)
      const spoutLen = SPOUT.r - 0.02
      const spout = new THREE.CylinderGeometry(0.0035, 0.009, spoutLen, 8, 1, true)
      spout.rotateZ(-Math.PI / 2 + 0.18) // lies along +x, the tip tilted up a little
      spout.rotateY(-yaw)
      const suv = spout.getAttribute('uv') as THREE.BufferAttribute
      for (let i = 0; i < suv.count; i++) suv.setY(i, 0.8 + suv.getY(i) * 0.12)
      const mid = 0.02 + spoutLen / 2
      lb.add(spout, lampMat, [SPOTS.lamp.x + SPOUT.dx * mid, SPOUT.y - 0.006, SPOTS.lamp.z + SPOUT.dz * mid], [0, 0, 0], false, false)
      // the oil, dark in the bowl, and the wick at the tip
      const oil = new THREE.CircleGeometry(0.022, 14).rotateX(-Math.PI / 2)
      const ouv = oil.getAttribute('uv') as THREE.BufferAttribute
      for (let i = 0; i < ouv.count; i++) ouv.setXY(i, 0.5, 0.03)
      lb.add(oil, lampMat, [SPOTS.lamp.x, 0.2145, SPOTS.lamp.z], [0, 0, 0], false, false)
      const wick = new THREE.CylinderGeometry(0.0016, 0.002, 0.008, 6)
      const wuv = wick.getAttribute('uv') as THREE.BufferAttribute
      for (let i = 0; i < wuv.count; i++) wuv.setXY(i, 0.5, 0.02)
      lb.add(wick, lampMat, [FLAME[0], SPOUT.y - 0.001, FLAME[2]], [0, 0, 0], false, false)
      root.add(lb.build())
    }
    const light = createWarmLight({ tier, color: pal.lamp, position: FLAME, intensity: 1, glow: 'flame' })
    root.add(light.group)

    // a faint heat shimmer rising off the flame (mid and high)
    let shimmer: THREE.Mesh | null = null
    if (!low) {
      const tex = shimmerTexture()
      tex.repeat.set(1, 0.6)
      const g = new THREE.PlaneGeometry(0.05, 0.13, 1, 4)
      const p = g.getAttribute('position') as THREE.BufferAttribute
      const col = new Float32Array(p.count * 3)
      for (let i = 0; i < p.count; i++) {
        const v = p.getY(i) / 0.13 + 0.5
        const k = Math.sin(Math.PI * Math.min(1, v * 1.4)) * (1 - v * 0.5)
        col.set([k, k, k], i * 3)
      }
      g.setAttribute('color', new THREE.BufferAttribute(col, 3))
      shimmer = new THREE.Mesh(
        g,
        new THREE.MeshBasicMaterial({ map: tex, color: mix(pal.lamp, 0xffffff, 0.2), vertexColors: true, transparent: true, opacity: 0.09, depthWrite: false, blending: THREE.AdditiveBlending }),
      )
      shimmer.position.set(FLAME[0], FLAME[1] + 0.03 + 0.065, FLAME[2])
      shimmer.lookAt(new THREE.Vector3(...CAMERA.pos).setY(FLAME[1] + 0.1))
      root.add(shimmer)
    }

    // -------------------------------------------------- the munshi's things
    {
      const pb = createBatch()
      const brass = material(tier, { map: metalTexture(pal.metal, { size: 64, rng }), metal: true, shininess: 60, specular: 0x8a6a30 })
      const lacquer = material(tier, { map: lacquerTexture(low ? 128 : 256, rng), shininess: 70, specular: 0x3a2a1c })
      const reed = material(tier, { color: 0xc4a066, shininess: 18, specular: 0x221a10 })
      const rollPaper = material(tier, { color: mix(pal.paper, 0x9a7a4a, 0.18), shininess: 5 })
      const cord = material(tier, { color: 0x6a4420, shininess: 10 })
      const seal = material(tier, { color: 0x9c1d14, shininess: 50, specular: 0x402018 })
      const ink = material(tier, { color: 0x0b0806, shininess: 90, specular: 0x404040 })
      const lathe = (pts: P2[], seg: number) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg)
      const seg = low ? 10 : 16

      // qalamdan: a lacquered pen box with rounded ends, a reed qalam laid on its lid
      const Q = { x: 0.24, z: -0.215, yaw: 0.38, L: 0.2, H: 0.032, W: 0.048 }
      {
        const g = new THREE.BoxGeometry(Q.L - Q.W, Q.H, Q.W)
        g.translate(0, Q.H / 2, 0)
        const ends = [-1, 1].map((sx) => new THREE.CylinderGeometry(Q.W / 2, Q.W / 2, Q.H, 14).translate(sx * (Q.L - Q.W) / 2, Q.H / 2, 0))
        for (const p of [g, ...ends]) pb.add(p, lacquer, [Q.x, 0, Q.z], [0, Q.yaw, 0])
        // the lid's seam, a thin dark line round the box
        const seam = new THREE.BoxGeometry(Q.L - Q.W + 0.001, 0.0015, Q.W + 0.001)
        pb.add(seam, ink, [Q.x, Q.H * 0.68, Q.z], [0, Q.yaw, 0], false, false)
        // the qalam on the lid: a reed with a slanted nib, cut and inked
        const len = 0.18
        const shaft = new THREE.CylinderGeometry(0.0034, 0.0038, len, 8)
        shaft.rotateZ(Math.PI / 2)
        const nib = new THREE.ConeGeometry(0.0034, 0.016, 8)
        nib.rotateZ(-Math.PI / 2)
        nib.translate(len / 2 + 0.008, 0, 0)
        const tip = new THREE.ConeGeometry(0.0016, 0.006, 6)
        tip.rotateZ(-Math.PI / 2)
        tip.translate(len / 2 + 0.0135, 0, 0)
        const qy = Q.H + 0.0036
        const qyaw = Q.yaw - 0.12
        pb.add(shaft, reed, [Q.x - 0.006, qy, Q.z + 0.006], [0, qyaw, 0])
        pb.add(nib, reed, [Q.x - 0.006, qy, Q.z + 0.006], [0, qyaw, 0])
        pb.add(tip, ink, [Q.x - 0.006, qy, Q.z + 0.006], [0, qyaw, 0])
      }

      // the inkpot (davat): squat brass with a narrow mouth, the ink black and glossy
      const ID = { x: 0.085, z: -0.235 }
      pb.add(
        lathe([[0, 0], [0.022, 0], [0.027, 0.006], [0.029, 0.016], [0.025, 0.027], [0.014, 0.034], [0.011, 0.038], [0.014, 0.041], [0.012, 0.043], [0.009, 0.04], [0, 0.04]], seg),
        brass,
        [ID.x, 0, ID.z],
      )
      pb.add(new THREE.CircleGeometry(0.009, 12).rotateX(-Math.PI / 2), ink, [ID.x, 0.0405, ID.z], [0, 0, 0], false, false)
      // a second qalam standing in the ink
      {
        const len = 0.15
        const g = new THREE.CylinderGeometry(0.0032, 0.0036, len, 8)
        g.translate(0, len / 2, 0)
        pb.add(g, reed, [ID.x, 0.012, ID.z], [0.22, 0, -0.16])
      }

      // petitions: three rolls tied with cord, each with a red seal on the knot
      const rolls: { x: number; y: number; z: number; r: number; L: number; yaw: number }[] = [
        { x: -0.085, y: 0, z: -0.205, r: 0.0145, L: 0.2, yaw: 0.07 },
        { x: -0.06, y: 0, z: -0.245, r: 0.013, L: 0.18, yaw: -0.06 },
        { x: -0.07, y: 0.02, z: -0.226, r: 0.012, L: 0.17, yaw: 0.3 },
      ]
      for (const [i, r] of rolls.entries()) {
        const rot: V3 = [0, r.yaw, Math.PI / 2]
        const y = r.y + r.r
        pb.add(new THREE.CylinderGeometry(r.r, r.r, r.L, seg), rollPaper, [r.x, y, r.z], rot)
        // the rolled edge shows as a darker spiral at each end
        for (const sx of [-1, 1]) {
          const ex = r.x + Math.cos(r.yaw) * sx * (r.L / 2 + 0.0004)
          const ez = r.z - Math.sin(r.yaw) * sx * (r.L / 2 + 0.0004)
          pb.add(new THREE.RingGeometry(r.r * 0.3, r.r * 0.55, 10), cord, [ex, y, ez], [0, r.yaw + (sx * Math.PI) / 2, 0], false, false)
        }
        for (const t of [-0.28, 0.28]) {
          const cx = r.x + Math.cos(r.yaw) * t * r.L
          const cz = r.z - Math.sin(r.yaw) * t * r.L
          pb.add(new THREE.TorusGeometry(r.r + 0.0009, 0.0013, 5, seg), cord, [cx, y, cz], [0, r.yaw + Math.PI / 2, 0])
        }
        // the seal sits on the front tie, facing up and toward the room
        const sx = r.x + Math.cos(r.yaw) * 0.28 * r.L * (i === 1 ? -1 : 1)
        const sz = r.z - Math.sin(r.yaw) * 0.28 * r.L * (i === 1 ? -1 : 1)
        const disc = new THREE.CylinderGeometry(0.0075, 0.0082, 0.003, 12)
        pb.add(disc, seal, [sx, y + r.r * 0.55, sz + r.r * 0.75], [0.85, r.yaw, 0])
      }

      // a small brass pandan (paan box) on the durrie at the right
      if (!low) {
        const P = { x: 0.23, z: 0.44 }
        const k = 0.78
        const sc = (pts: P2[]): P2[] => pts.map(([r, y]) => [r * k, y * k])
        pb.add(lathe(sc([[0, 0], [0.05, 0], [0.052, 0.004], [0.05, 0.03], [0.053, 0.033], [0, 0.033]]), seg), brass, [P.x, FLOOR_Y + 0.003, P.z])
        pb.add(lathe(sc([[0, 0], [0.051, 0], [0.047, 0.012], [0.035, 0.024], [0.018, 0.03], [0.008, 0.034], [0.011, 0.04], [0, 0.046]]), seg), brass, [P.x, FLOOR_Y + 0.003 + 0.033 * k, P.z])
      }
      root.add(pb.build())

      // low tier: soft contact shadows under the props, since there are no shadow maps
      if (low) {
        const blob = new THREE.MeshBasicMaterial({ map: blobTexture(64), transparent: true, depthWrite: false, opacity: 0.8 })
        const bb = createBatch()
        const spot = (x: number, z: number, w: number, d: number, yaw = 0) =>
          bb.add(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2), blob, [x, 0.0012, z], [0, yaw, 0], false, false)
        spot(SPOTS.lamp.x, SPOTS.lamp.z, 0.16, 0.16)
        spot(Q.x, Q.z, Q.L * 1.25, Q.W * 2.4, Q.yaw)
        spot(ID.x, ID.z, 0.08, 0.08)
        spot(-0.075, -0.225, 0.24, 0.1, 0.05)
        root.add(bb.build())
      }
    }

    scene.add(root)
    return {
      update(t) {
        light.update(t)
        if (shimmer) {
          const tex = (shimmer.material as THREE.MeshBasicMaterial).map
          if (tex) tex.offset.y = -t * 0.00032
          shimmer.rotation.z = Math.sin(t * 0.0011) * 0.06
        }
      },
      dispose() {
        scene.remove(root)
        disposeTree(root)
      },
    }
  },
}

export default delhi1857
