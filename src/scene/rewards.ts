// The rewards on the 3D desk: small real treasures in the desk's free front-right corner (clear of
// the paper, both stamps, the lamp and the basket shot), and the loose pieces that drop onto the
// paper's back when they are earned.
//
// Cheap by construction: every item of an era shares one material on one small texture atlas (its
// faces drawn by reward-art.ts), and the whole pile is merged into a single mesh, rebuilt only when
// the counts change. Low tier gets fewer segments; only high casts shadows; no lights are added.
// The coin stacks top out (twelve of a kind) and a small paper slip then shows the count.
import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import type { EraId } from '../content/types'
import { eraItems } from '../game/rewards'
import { markShadowsDirty, material } from './props'
import { LOOKS, drawFace, sideColor, type Look } from './reward-art'
import { FACE } from './sheet'
import { glowTexture } from './textures'
import type { QualityTier } from './types'

/** Where the pile lies: the free front-right corner of every era's desk (desk top y = 0, +z toward you). */
export const PILE = { x: 0.405, z: 0.172, yaw: -0.22 } as const
/** How many of one coin the pile shows before a slip takes over the counting. */
export const STACK = 6
const COIN_CAP = STACK * 2
const SWEET_CAP = 3
const RARE_CAP = 3

type V3 = [number, number, number]

/** An atlas cell, in UV space (v up, as the texture is flipped). */
interface Cell { u0: number; v0: number; u1: number; v1: number }

interface Atlas {
  canvas: HTMLCanvasElement
  texture: THREE.CanvasTexture
  face: Map<string, Cell>
  inside: Cell
  /** A valve's glass, unrolled. */
  glass: Cell
  strip: Map<string, Cell>
  dispose(): void
}

const COLS = 4
const ROWS = 2
// the last cell is cut into colour bands: each item's side colour, then glass, black and leaf
const EXTRA_STRIPS: Record<string, string> = { glass: '#b8c6c8', black: '#1c1916', brass: '#9a7632', grey: '#6d6a66' }

function makeAtlas(era: EraId, tier: QualityTier): Atlas {
  const cellPx = tier === 'low' ? 96 : tier === 'mid' ? 128 : 192
  const canvas = document.createElement('canvas')
  canvas.width = cellPx * COLS
  canvas.height = cellPx * ROWS
  const g = canvas.getContext('2d')
  const items = eraItems(era)
  const face = new Map<string, Cell>()
  const strip = new Map<string, Cell>()
  const cellRect = (i: number): Cell => {
    const c = i % COLS
    const r = Math.floor(i / COLS)
    const pad = 1.5 / canvas.width
    return { u0: c / COLS + pad, u1: (c + 1) / COLS - pad, v1: 1 - r / ROWS - pad, v0: 1 - (r + 1) / ROWS + pad }
  }
  const order = ['coin', 'fine', 'rare', 'keepsake', 'sweet']
  const inside = cellRect(5)
  const glassCell = cellRect(6)
  if (g) {
    g.fillStyle = '#8a6a48'
    g.fillRect(0, 0, canvas.width, canvas.height)
    order.forEach((slot, i) => {
      const it = items.find((x) => x.slot === slot)
      if (!it) return
      const look = LOOKS[it.id]
      const x = (i % COLS) * cellPx
      const y = Math.floor(i / COLS) * cellPx
      face.set(it.id, cellRect(i))
      g.save()
      // a wide card or box lid is drawn in its own proportions and squeezed into the square cell, so
      // it unsqueezes on the mesh
      const ar = look && (look.kind === 'flat' || look.kind === 'packet' || look.kind === 'box') ? look.w / look.d : 1
      g.translate(x, y)
      g.scale(1 / ar, 1)
      drawFace(g, it.id, 0, 0, cellPx * ar, cellPx)
      g.restore()
      if (look?.kind === 'box') {
        g.save()
        g.translate((5 % COLS) * cellPx, Math.floor(5 / COLS) * cellPx)
        g.scale(1 / ar, 1)
        drawFace(g, it.id, 0, 0, cellPx * ar, cellPx, 'inside')
        g.restore()
      }
    })
    // a valve's glass, unrolled: pale glass with the dark anode seen through it and the getter's
    // silver at the crown (twice round, so it shows from every side)
    if (items.some((it) => LOOKS[it.id]?.kind === 'valve')) {
      const x = (6 % COLS) * cellPx
      const y = Math.floor(6 / COLS) * cellPx
      const gr = g.createLinearGradient(x, 0, x + cellPx, 0)
      for (let k = 0; k <= 4; k++) {
        gr.addColorStop(k / 4, k % 2 ? '#93a3a4' : '#dfe9e9')
      }
      g.fillStyle = gr
      g.fillRect(x, y, cellPx, cellPx)
      for (const cx of [0.25, 0.75]) {
        g.fillStyle = 'rgba(52,48,44,0.85)'
        g.fillRect(x + cellPx * (cx - 0.1), y + cellPx * 0.3, cellPx * 0.2, cellPx * 0.42)
        g.fillStyle = 'rgba(150,140,128,0.9)'
        g.fillRect(x + cellPx * (cx - 0.02), y + cellPx * 0.22, cellPx * 0.04, cellPx * 0.6)
      }
      g.fillStyle = 'rgba(205,210,214,0.95)'
      g.fillRect(x, y + cellPx * 0.86, cellPx, cellPx * 0.14)
    }
    // the bands
    const bands = [...items.map((it) => [it.id, sideColor(it.id)] as const), ...Object.entries(EXTRA_STRIPS)]
    const x0 = 7 % COLS * cellPx
    const y0 = Math.floor(7 / COLS) * cellPx
    const bh = cellPx / bands.length
    bands.forEach(([key, color], i) => {
      g.fillStyle = color
      g.fillRect(x0, y0 + i * bh, cellPx, bh)
      const v = 1 - (y0 + (i + 0.5) * bh) / canvas.height
      const u = (x0 + cellPx / 2) / canvas.width
      strip.set(key, { u0: u, u1: u, v0: v, v1: v })
    })
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = tier === 'high' ? 4 : 1
  return {
    canvas,
    texture,
    face,
    inside,
    strip,
    glass: glassCell,
    dispose: () => texture.dispose(),
  }
}

/** Sets UVs from each vertex's normal: faces pointing up or down take `top` (by x, z within half-size hw, hd); the rest a band. */
function paint(geo: THREE.BufferGeometry, top: Cell | null, band: Cell, hw: number, hd: number, upOnly = false): THREE.BufferGeometry {
  const pos = geo.getAttribute('position')
  const nor = geo.getAttribute('normal')
  const uv = new Float32Array(pos.count * 2)
  for (let i = 0; i < pos.count; i++) {
    const ny = nor.getY(i)
    const capped = top && (upOnly ? ny > 0.7 : Math.abs(ny) > 0.7)
    if (capped) {
      const u = THREE.MathUtils.clamp(pos.getX(i) / (2 * hw) + 0.5, 0, 1)
      const v = THREE.MathUtils.clamp(0.5 - pos.getZ(i) / (2 * hd), 0, 1)
      uv[i * 2] = top.u0 + (top.u1 - top.u0) * u
      // a canvas row 0 is the far edge: v = 1 there
      uv[i * 2 + 1] = top.v0 + (top.v1 - top.v0) * v
    } else {
      uv[i * 2] = band.u0
      uv[i * 2 + 1] = band.v0
    }
  }
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
  return geo
}

/** Merges parts (each already placed) into one geometry with position, normal and uv only. */
function merge(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const clean = parts.map((p) => {
    const g = p.index ? p.toNonIndexed() : p
    for (const name of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(name)) g.deleteAttribute(name)
    return g
  })
  const out = mergeGeometries(clean, false) ?? new THREE.BufferGeometry()
  for (const p of parts) p.dispose()
  for (const c of clean) c.dispose()
  return out
}

/** One treasure's geometry, resting on y = 0 and centred on its axis; a box's lid comes apart. */
export interface PieceGeo {
  geo: THREE.BufferGeometry
  lid: THREE.BufferGeometry | null
  /** Its height, and its radius in plan (for spacing and the hit box). */
  h: number
  r: number
}

function pieceGeo(id: string, atlas: Atlas, tier: QualityTier): PieceGeo {
  const look: Look | undefined = LOOKS[id]
  const band = atlas.strip.get(id) ?? atlas.strip.get('grey')!
  const top = atlas.face.get(id) ?? null
  const seg = tier === 'low' ? 14 : 26
  const strip = (k: string) => atlas.strip.get(k) ?? band
  if (!look) return { geo: new THREE.BoxGeometry(0.01, 0.01, 0.01), lid: null, h: 0.01, r: 0.01 }
  switch (look.kind) {
    case 'coin': {
      let geo: THREE.BufferGeometry
      if (look.scallops) {
        const shape = new THREE.Shape()
        const n = look.scallops * (tier === 'low' ? 3 : 5)
        for (let i = 0; i <= n; i++) {
          const a = (i / n) * Math.PI * 2
          const rr = look.r * (0.94 + 0.06 * Math.abs(Math.cos((a * look.scallops) / 2)))
          if (i === 0) shape.moveTo(Math.cos(a) * rr, Math.sin(a) * rr)
          else shape.lineTo(Math.cos(a) * rr, Math.sin(a) * rr)
        }
        geo = new THREE.ExtrudeGeometry(shape, { depth: look.t, bevelEnabled: false, curveSegments: 1 })
        geo.rotateX(-Math.PI / 2)
      } else {
        geo = new THREE.CylinderGeometry(look.r, look.r, look.t, look.rough ? 12 : seg)
        geo.translate(0, look.t / 2, 0)
        if (look.rough) {
          // hand-struck: a little out of round
          const p = geo.getAttribute('position')
          for (let i = 0; i < p.count; i++) {
            const x = p.getX(i)
            const z = p.getZ(i)
            const a = Math.atan2(z, x)
            const k = 1 + 0.045 * Math.sin(a * 3 + 1) + 0.02 * Math.sin(a * 5)
            p.setXYZ(i, x * k, p.getY(i), z * k)
          }
          geo.computeVertexNormals()
        }
      }
      return { geo: paint(geo, top, band, look.r, look.r), lid: null, h: look.t, r: look.r }
    }
    case 'flat': {
      const t = 0.0005
      const geo = new THREE.BoxGeometry(look.w, t, look.d)
      geo.translate(0, t / 2, 0)
      return { geo: paint(geo, top, band, look.w / 2, look.d / 2, true), lid: null, h: t, r: Math.max(look.w, look.d) / 2 }
    }
    case 'packet': {
      const geo = new THREE.BoxGeometry(look.w, look.h, look.d)
      geo.translate(0, look.h / 2, 0)
      return { geo: paint(geo, top, band, look.w / 2, look.d / 2, true), lid: null, h: look.h, r: Math.max(look.w, look.d) / 2 }
    }
    case 'box': {
      const bh = look.h * 0.8
      const base = new THREE.BoxGeometry(look.w, bh, look.d)
      base.translate(0, bh / 2, 0)
      paint(base, atlas.inside, band, look.w / 2, look.d / 2, true)
      const lh = look.h * 0.32
      const lid = new THREE.BoxGeometry(look.w * 1.04, lh, look.d * 1.04)
      lid.translate(0, lh / 2, 0)
      paint(lid, top, band, (look.w * 1.04) / 2, (look.d * 1.04) / 2, true)
      return { geo: base, lid, h: look.h, r: Math.max(look.w, look.d) / 2 }
    }
    case 'dona': {
      // a leaf cup, flaring, and the sweets filling it to just under the rim
      const pts = [
        new THREE.Vector2(look.r * 0.55, 0),
        new THREE.Vector2(look.r * 0.8, look.h * 0.45),
        new THREE.Vector2(look.r * 0.98, look.h),
        new THREE.Vector2(look.r, look.h * 1.04),
      ]
      const cup = new THREE.LatheGeometry(pts, tier === 'low' ? 10 : 18)
      paint(cup, null, band, look.r, look.r)
      const fill = new THREE.CylinderGeometry(look.r * 0.93, look.r * 0.62, look.h * 0.85, tier === 'low' ? 10 : 18)
      fill.translate(0, (look.h * 0.85) / 2, 0)
      paint(fill, top, band, look.r * 0.93, look.r * 0.93, true)
      return { geo: merge([cup, fill]), lid: null, h: look.h, r: look.r }
    }
    case 'valve': {
      const bh = look.h * 0.22
      const base = new THREE.CylinderGeometry(look.r * 1.08, look.r * 1.08, bh, seg)
      base.translate(0, bh / 2, 0)
      paint(base, null, strip('black'), look.r, look.r)
      const pts: THREE.Vector2[] = [new THREE.Vector2(look.r * 0.92, bh), new THREE.Vector2(look.r, bh + look.h * 0.1), new THREE.Vector2(look.r, look.h * 0.78)]
      const steps = tier === 'low' ? 3 : 6
      for (let i = 1; i <= steps; i++) {
        const a = (i / steps) * (Math.PI / 2)
        pts.push(new THREE.Vector2(look.r * Math.cos(a), look.h * 0.78 + (look.h * 0.22) * Math.sin(a)))
      }
      const glass = new THREE.LatheGeometry(pts, seg)
      // its own UVs run round (u) and up the profile (v): squeeze them into the glass cell
      const guv = glass.getAttribute('uv')
      const gc = atlas.glass
      const gpos = glass.getAttribute('position')
      for (let i = 0; i < guv.count; i++) guv.setXY(i, gc.u0 + (gc.u1 - gc.u0) * guv.getX(i), gc.v1 - (gc.v1 - gc.v0) * THREE.MathUtils.clamp((gpos.getY(i) - bh) / (look.h - bh), 0, 1))
      guv.needsUpdate = true
      // the getter's silver flash on the crown, so the glass reads as a valve
      const cap = new THREE.CylinderGeometry(look.r * 0.62, look.r * 0.8, look.h * 0.08, seg)
      cap.translate(0, look.h * 0.86, 0)
      paint(cap, null, atlas.strip.get(id) ?? strip('glass'), look.r, look.r)
      return { geo: merge([base, glass, cap]), lid: null, h: look.h, r: look.r * 1.08 }
    }
    case 'seal': {
      const bh = look.h * 0.34
      const base = new THREE.CylinderGeometry(look.r * 0.95, look.r, bh, 8)
      base.rotateY(Math.PI / 8)
      base.translate(0, bh / 2, 0)
      paint(base, top, band, look.r, look.r, true)
      const pts = [
        new THREE.Vector2(look.r * 0.42, bh),
        new THREE.Vector2(look.r * 0.26, bh + look.h * 0.25),
        new THREE.Vector2(look.r * 0.3, bh + look.h * 0.4),
        new THREE.Vector2(look.r * 0.42, look.h * 0.86),
        new THREE.Vector2(look.r * 0.3, look.h * 0.97),
        new THREE.Vector2(0.0001, look.h),
      ]
      const handle = new THREE.LatheGeometry(pts, tier === 'low' ? 8 : 14)
      paint(handle, null, strip('brass'), look.r, look.r)
      return { geo: merge([base, handle]), lid: null, h: look.h, r: look.r }
    }
    case 'badge': {
      const t = 0.0018
      const geo = new THREE.CylinderGeometry(look.r, look.r, t, seg)
      geo.translate(0, t / 2, 0)
      return { geo: paint(geo, top, band, look.r, look.r, true), lid: null, h: t, r: look.r }
    }
  }
}

/** One placed piece in the pile (local to the pile's corner). */
interface Placed {
  id: string
  pos: V3
  yaw: number
}

/** Small irregularities that stay put from one rebuild to the next. */
function jitter(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453
  return x - Math.floor(x) - 0.5
}

/**
 * Where each item sits in the corner (the pile's own frame: +z toward the player), and the slips for
 * counts past what is shown. Three rows, so nothing hides another from the desk shot: the sweets
 * and the keepsake at the back, the coin stacks in the middle, the rare treasure fanned at the front;
 * the papers lie under it all.
 */
export function pileLayout(era: EraId, counts: Readonly<Record<string, number>>): { placed: Placed[]; slips: { id: string; n: number; pos: V3 }[] } {
  const items = eraItems(era)
  const placed: Placed[] = []
  const slips: { id: string; n: number; pos: V3 }[] = []
  const of = (slot: string) => items.find((i) => i.slot === slot)
  const num = (id: string | undefined) => (id ? Math.max(0, Math.floor(counts[id] ?? 0)) : 0)
  let floor = 0 // a paper under the coins lifts them a hair
  // the papers first, under everything (a note, a leaflet, a card, a pass)
  const FLATS = { keepsake: { at: [0.008, 0, -0.008] as V3, yaw: 0.32, slip: [0.05, 0, -0.004] as V3 }, rare: { at: [-0.01, 0, 0.026] as V3, yaw: -0.24, slip: [0.026, 0, 0.068] as V3 } }
  for (const slot of ['keepsake', 'rare'] as const) {
    const it = of(slot)
    const look = it ? LOOKS[it.id] : undefined
    const n = num(it?.id)
    if (!it || look?.kind !== 'flat' || n === 0) continue
    const f = FLATS[slot]
    const shown = Math.min(n, slot === 'rare' ? RARE_CAP : 1)
    for (let i = 0; i < shown; i++) placed.push({ id: it.id, pos: [f.at[0] + i * 0.006, floor + i * 0.0005, f.at[2] - i * 0.004], yaw: f.yaw + i * 0.16 })
    floor += shown * 0.0005
    if (n > shown) slips.push({ id: it.id, n, pos: f.slip })
  }
  // the coin stacks in the middle row: the everyday coin on the left, the rupees on the right
  const stacks: [string, V3[], V3][] = [
    ['coin', [[-0.034, 0, 0.006], [-0.015, 0, 0.02]], [-0.05, 0, 0.034]],
    ['fine', [[0.014, 0, 0.004], [0.032, 0, 0.018]], [0.052, 0, 0.034]],
  ]
  for (const [slot, spots, slip] of stacks) {
    const it = of(slot)
    const look = it ? LOOKS[it.id] : undefined
    const n = num(it?.id)
    if (!it || !look || look.kind !== 'coin' || n === 0) continue
    const shown = Math.min(n, COIN_CAP)
    for (let i = 0; i < shown; i++) {
      const s = spots[Math.floor(i / STACK)]!
      const k = i % STACK
      const seed = i * 7 + slot.length
      placed.push({ id: it.id, pos: [s[0] + jitter(seed) * 0.003, floor + k * look.t * 1.02, s[2] + jitter(seed + 3) * 0.003], yaw: jitter(seed + 5) * 6 })
    }
    if (n > shown) slips.push({ id: it.id, n, pos: slip })
  }
  // the rare treasure: gold coins fanned at the front, or valves standing at the back
  const rare = of('rare')
  const rl = rare ? LOOKS[rare.id] : undefined
  const rn = num(rare?.id)
  if (rare && rl && rn > 0 && rl.kind !== 'flat') {
    const shown = Math.min(rn, rl.kind === 'valve' ? 2 : RARE_CAP)
    for (let i = 0; i < shown; i++) {
      if (rl.kind === 'valve') placed.push({ id: rare.id, pos: [-0.034 + i * 0.019, 0, -0.034 + i * 0.006], yaw: i })
      else placed.push({ id: rare.id, pos: [-0.006 + i * 0.012, floor + i * 0.0009, 0.05 - i * 0.004], yaw: i * 0.8 })
    }
    if (rn > shown) slips.push({ id: rare.id, n: rn, pos: rl.kind === 'valve' ? [-0.052, 0, -0.012] : [0.03, 0, 0.066] })
  }
  // the sweets at the back right: boxes and packets stacked, donas side by side
  const sweet = of('sweet')
  const sl = sweet ? LOOKS[sweet.id] : undefined
  const sn = num(sweet?.id)
  if (sweet && sl && sn > 0) {
    const shown = Math.min(sn, sl.kind === 'dona' ? 2 : SWEET_CAP)
    for (let i = 0; i < shown; i++) {
      if (sl.kind === 'dona') placed.push({ id: sweet.id, pos: [0.03 - i * 0.032, 0, -0.04 + i * 0.006], yaw: i })
      else {
        const h = sl.kind === 'packet' || sl.kind === 'box' ? sl.h : 0.01
        placed.push({ id: sweet.id, pos: [0.03 + jitter(i + 11) * 0.004, i * h, -0.04 + jitter(i + 17) * 0.004], yaw: 0.3 + jitter(i + 23) * 0.5 })
      }
    }
    if (sn > shown) slips.push({ id: sweet.id, n: sn, pos: [0.06, 0, -0.016] })
  }
  // the keepsake that is not a paper: the court seal standing, the badge lying, at the back left
  const keep = of('keepsake')
  const kl = keep ? LOOKS[keep.id] : undefined
  const kn = num(keep?.id)
  if (keep && kl && kn > 0 && kl.kind !== 'flat') {
    const sealAt: V3 = sl?.kind === 'dona' && sn > 1 ? [-0.044, 0, -0.016] : [-0.034, 0, -0.03]
    placed.push({ id: keep.id, pos: kl.kind === 'seal' ? sealAt : [-0.012, floor, -0.03], yaw: 0.4 })
    if (kn > 1) slips.push({ id: keep.id, n: kn, pos: [-0.05, 0, -0.004] })
  }
  return { placed, slips }
}

export interface RewardKit {
  /** The pile, in world space (add it to the scene). */
  group: THREE.Group
  /** Rebuilds the pile for these counts (only when they changed). */
  setCounts(counts: Readonly<Record<string, number>>): void
  /** A loose piece of this item (for the earn moment), with its lid when it is a box. */
  piece(id: string): { obj: THREE.Group; lid: THREE.Object3D | null; h: number; r: number } | null
  /** About where an item lands on the pile (world), for a piece swept off the paper. */
  slotWorld(id: string): THREE.Vector3
  /** The jackpot's burst of light (an additive sprite; the stage moves and scales it). */
  burst: THREE.Sprite
  /** Per frame: the rare treasure's slow glint. */
  update(tMs: number): void
  /** The pieces' own material, faded in under reduced motion. */
  fadeMaterial(): THREE.Material
  dispose(): void
}

export function createRewardKit(o: { era: EraId; tier: QualityTier; reduced: boolean; scene: THREE.Scene }): RewardKit {
  const atlas = makeAtlas(o.era, o.tier)
  // a faint warm lift, so the treasures read in the dim corner away from the lamp (no light is added)
  const mat = material(o.tier, { map: atlas.texture, metal: true, shininess: 46, specular: 0x3a3226, emissive: 0x1a1009 })
  // the metal catches the lamp; paper and sweets stay matte (high: a specular map from the same cells)
  if (o.tier === 'high' && mat instanceof THREE.MeshPhongMaterial) {
    const sc = document.createElement('canvas')
    sc.width = atlas.canvas.width
    sc.height = atlas.canvas.height
    const sg = sc.getContext('2d')
    if (sg) {
      sg.fillStyle = '#000'
      sg.fillRect(0, 0, sc.width, sc.height)
      const cw = sc.width / COLS
      for (const it of eraItems(o.era)) {
        const look = LOOKS[it.id]
        const cell = atlas.face.get(it.id)
        const metal = look?.kind === 'coin' || look?.kind === 'seal' || look?.kind === 'valve'
        if (!cell || !metal) continue
        sg.fillStyle = '#d0d0d0'
        sg.fillRect(cell.u0 * sc.width - 2, (1 - cell.v1) * sc.height - 2, cw + 4, cw + 4)
      }
      // the coin edges and the glass in the bands
      sg.fillStyle = '#b0b0b0'
      sg.fillRect(sc.width - cw, sc.height / 2, cw, sc.height / 2)
      const spec = new THREE.CanvasTexture(sc)
      mat.specularMap = spec
    }
  }
  const geos = new Map<string, PieceGeo>()
  const geoOf = (id: string): PieceGeo => {
    let g = geos.get(id)
    if (!g) {
      g = pieceGeo(id, atlas, o.tier)
      geos.set(id, g)
    }
    return g
  }
  const group = new THREE.Group()
  group.name = 'reward-pile'
  group.position.set(PILE.x, 0, PILE.z)
  group.rotation.y = PILE.yaw
  let mesh: THREE.Mesh | null = null
  let slipMesh: THREE.Mesh | null = null
  let slipCanvas: HTMLCanvasElement | null = null
  let slipTex: THREE.CanvasTexture | null = null
  let slipMat: THREE.Material | null = null
  let key = ''
  const glintTex = glowTexture(64)
  const glintMat = new THREE.SpriteMaterial({ map: glintTex, color: 0xffe3a0, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })
  const glint = new THREE.Sprite(glintMat)
  glint.scale.setScalar(0.016)
  glint.visible = false
  glint.renderOrder = 3
  group.add(glint)
  const burstMat = new THREE.SpriteMaterial({ map: glintTex, color: 0xffd98a, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })
  const burst = new THREE.Sprite(burstMat)
  burst.visible = false
  burst.renderOrder = 4
  o.scene.add(burst)
  let glintAt: THREE.Vector3 | null = null
  let fade: THREE.Material | null = null

  const setCounts = (counts: Readonly<Record<string, number>>) => {
    const k = JSON.stringify(eraItems(o.era).map((i) => counts[i.id] ?? 0))
    if (k === key) return
    key = k
    if (mesh) {
      group.remove(mesh)
      mesh.geometry.dispose()
      mesh = null
    }
    if (slipMesh) {
      group.remove(slipMesh)
      slipMesh.geometry.dispose()
      slipMesh = null
    }
    const { placed, slips } = pileLayout(o.era, counts)
    const parts: THREE.BufferGeometry[] = []
    glintAt = null
    for (const p of placed) {
      const pg = geoOf(p.id)
      for (const src of [pg.geo, pg.lid]) {
        if (!src) continue
        const g = src.clone()
        if (src === pg.lid) g.translate(0, pg.h * 0.7, 0)
        g.rotateY(p.yaw)
        g.translate(p.pos[0], p.pos[1], p.pos[2])
        parts.push(g)
      }
      const it = eraItems(o.era).find((x) => x.id === p.id)
      const look = LOOKS[p.id]
      if (it?.slot === 'rare' && (look?.kind === 'coin' || look?.kind === 'valve')) glintAt = new THREE.Vector3(p.pos[0], p.pos[1] + pg.h + 0.002, p.pos[2])
    }
    if (parts.length) {
      mesh = new THREE.Mesh(merge(parts), mat)
      mesh.castShadow = o.tier === 'high'
      mesh.receiveShadow = o.tier !== 'low'
      mesh.name = 'reward-pile-mesh'
      group.add(mesh)
    }
    if (slips.length) {
      // the count slips: torn paper tags, "×23", on one small canvas
      slipCanvas ??= document.createElement('canvas')
      slipCanvas.width = 256
      slipCanvas.height = 64 * 4
      const g = slipCanvas.getContext('2d')
      const sp: THREE.BufferGeometry[] = []
      slips.slice(0, 4).forEach((s, i) => {
        if (g) {
          g.fillStyle = '#efe4c6'
          g.fillRect(0, i * 64, 256, 64)
          g.fillStyle = '#2a1d14'
          g.font = `700 40px ${FACE.print}`
          g.textAlign = 'center'
          g.textBaseline = 'middle'
          g.fillText(`×${s.n}`, 128, i * 64 + 34)
          g.strokeStyle = 'rgba(80,50,30,0.35)'
          g.strokeRect(4, i * 64 + 4, 248, 56)
        }
        const t = 0.0004
        const geo = new THREE.BoxGeometry(0.026, t, 0.0065)
        const cell: Cell = { u0: 0, u1: 1, v1: 1 - i / 4, v0: 1 - (i + 1) / 4 }
        paint(geo, cell, { u0: 0.5, u1: 0.5, v0: 1 - (i + 0.5) / 4, v1: 1 - (i + 0.5) / 4 }, 0.013, 0.00325, true)
        geo.rotateY(-PILE.yaw * 0.6 + jitter(i) * 0.3)
        geo.translate(s.pos[0], t / 2 + 0.0002, s.pos[2])
        sp.push(geo)
      })
      if (!slipTex) {
        slipTex = new THREE.CanvasTexture(slipCanvas)
        slipTex.colorSpace = THREE.SRGBColorSpace
        slipMat = material(o.tier, { map: slipTex })
      } else slipTex.needsUpdate = true
      slipMesh = new THREE.Mesh(merge(sp), slipMat!)
      slipMesh.receiveShadow = o.tier !== 'low'
      group.add(slipMesh)
    }
    glint.visible = glintAt !== null
    if (glintAt) glint.position.copy(glintAt)
    markShadowsDirty(o.scene)
  }

  return {
    group,
    setCounts,
    piece(id) {
      if (!LOOKS[id]) return null
      const pg = geoOf(id)
      const obj = new THREE.Group()
      const m = new THREE.Mesh(pg.geo, mat)
      m.castShadow = o.tier === 'high'
      obj.add(m)
      let lid: THREE.Mesh | null = null
      if (pg.lid) {
        lid = new THREE.Mesh(pg.lid, mat)
        lid.position.y = pg.h * 0.7
        lid.castShadow = o.tier === 'high'
        obj.add(lid)
      }
      obj.name = `reward-${id}`
      return { obj, lid, h: pg.h, r: pg.r }
    },
    slotWorld(id) {
      const { placed } = pileLayout(o.era, { [id]: 1 })
      const p = placed.find((x) => x.id === id)?.pos ?? [0, 0, 0]
      return group.localToWorld(new THREE.Vector3(p[0], p[1], p[2]))
    },
    burst,
    update(tMs) {
      if (!glint.visible) return
      if (o.reduced) {
        glintMat.opacity = 0.18
        return
      }
      // a slow glint now and then, as if the lamp's flame moved
      const s = Math.sin(tMs * 0.0017) * 0.5 + 0.5
      const tw = Math.pow(Math.max(0, Math.sin(tMs * 0.0023 + 1.3)), 14)
      glintMat.opacity = 0.08 + 0.12 * s + 0.55 * tw
      glint.scale.setScalar(0.012 + 0.012 * tw)
    },
    fadeMaterial() {
      if (!fade) {
        fade = mat.clone()
        fade.transparent = true
      }
      return fade
    },
    dispose() {
      if (mesh) mesh.geometry.dispose()
      if (slipMesh) slipMesh.geometry.dispose()
      for (const g of geos.values()) {
        g.geo.dispose()
        g.lid?.dispose()
      }
      geos.clear()
      mat.dispose()
      fade?.dispose()
      if (mat instanceof THREE.MeshPhongMaterial) mat.specularMap?.dispose()
      slipTex?.dispose()
      slipMat?.dispose()
      atlas.dispose()
      glintTex.dispose()
      glintMat.dispose()
      burstMat.dispose()
      o.scene.remove(burst)
      group.removeFromParent()
    },
  }
}
