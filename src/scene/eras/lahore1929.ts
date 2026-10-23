// Lahore, 2–15 April 1929, night: a rented room that serves as a "post box" for HSRA notes.
// Pale lime wash going damp, a plain deal table, a hurricane lantern, a roadster leaning under a
// barred window whose wooden shutters stand half open onto flat roofs, a tank and wires. A coat
// and felt hat on a peg, a matka on a stool, newspapers, pink leaflets and a tin trunk.
//
// Layout (desk top at y = 0, +z toward the player): the back wall stands well behind the table
// (BZ) so the upper half of the bicycle and the lower part of the window both show above the
// table's back edge in the portrait desk shot. Everything is procedural.
import * as THREE from 'three'
import { ERA_PALETTES, mix } from '../palette'
import { DESK, SPOTS, createBatch, createDesk, createWarmLight, disposeTree, material } from '../props'
import { TIER_SETTINGS } from '../quality'
import {
  blobTexture,
  clothTexture,
  makeNoise,
  metalTexture,
  plasterTexture,
  stainTexture,
  stoneTexture,
  toTexture,
  woodTexture,
} from '../textures'
import type { EraDressing, QualityTier } from '../types'

type V3 = [number, number, number]
type Batch = ReturnType<typeof createBatch>
type Mat = THREE.Material

const pal = ERA_PALETTES['lahore-1929']
const CAMERA: EraDressing['camera'] = { pos: [0, 0.98, 0.92], look: [0, -0.12, 0.06] }

const FLOOR = -0.76
/** Inner face of the back wall, and its thickness (a 9-inch brick wall, plastered). */
const BZ = -1.0
const TH = 0.2
const ROOM = { halfW: 1.5, height: 2.8, front: 1.8 }
/** The opening in the back wall; the wooden frame sits inside it. */
const WIN = { x0: -0.12, x1: 0.42, y0: -0.04, y1: 0.94 }
const FR = 0.05
/** A small barred ventilator (roshandan) high above the window. */
const VENT = { x0: 0.02, x1: 0.28, y0: 1.12, y1: 1.3 }
/** A shallow plaster niche (aala) left of the window, with a few books in it. */
const NICHE = { x0: -0.46, x1: -0.22, y0: 0.02, y1: 0.25, d: 0.11 }
const CLEAR = { x0: WIN.x0 + FR, x1: WIN.x1 - FR, y0: WIN.y0 + FR, y1: WIN.y1 - FR }
/** The lantern's flame, inside its globe. */
const FLAME: V3 = [SPOTS.lamp.x, 0.09, SPOTS.lamp.z]

// The night outside is painted on two planes: the building across the lane, and the roofs and sky
// beyond. Bounds are world metres on each plane, sized to every ray the desk and intro shots send
// through the window (with margin for the camera's travel).
const NEAR = { z: -3, x0: -0.62, x1: 1.1, y0: -1.72, y1: -0.3 }
const FAR = { z: -6, x0: -1.05, x1: 1.85, y0: -4.0, y1: -0.9 }
/** Top of the distant roofline on the far plane, and of the parapet across the lane. */
const FAR_ROOF = -2.2
const NEAR_ROOF = -0.83

const SEG: Record<QualityTier, number> = { low: 6, mid: 8, high: 10 }

// ---------------------------------------------------------------- small geometry helpers

const vec = (p: V3) => new THREE.Vector3(p[0], p[1], p[2])
const UP = new THREE.Vector3(0, 1, 0)
const ONE = new THREE.Vector3(1, 1, 1)

/** Applies a position and Euler rotation to a geometry in place. */
function at(g: THREE.BufferGeometry, pos: V3, rot: V3 = [0, 0, 0]): THREE.BufferGeometry {
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0], rot[1], rot[2]))
  return g.applyMatrix4(new THREE.Matrix4().compose(vec(pos), q, ONE))
}

/** A cylinder from a to b, open-ended unless `caps`. */
function rod(a: V3, b: V3, r: number, seg: number, caps = false): THREE.BufferGeometry {
  const A = vec(a)
  const dir = vec(b).sub(A)
  const len = dir.length()
  const g = new THREE.CylinderGeometry(r, r, len, seg, 1, !caps)
  g.translate(0, len / 2, 0)
  const q = new THREE.Quaternion().setFromUnitVectors(UP, dir.normalize())
  return g.applyMatrix4(new THREE.Matrix4().compose(A, q, ONE))
}

/** A bent wire or tube through the points. */
const wire = (pts: V3[], r: number, seg: number, radial: number) =>
  new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(vec)), seg, r, radial, false)

const lathe = (pts: [number, number][], seg: number, phiStart = 0) =>
  new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg, phiStart)

const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d)

/** Moves a geometry's 0..1 UVs into [u0,u1]×[v0,v1] of an atlas texture. */
function region(g: THREE.BufferGeometry, u0: number, v0: number, u1: number, v1: number): THREE.BufferGeometry {
  const uv = g.getAttribute('uv') as THREE.BufferAttribute | undefined
  if (uv) for (let i = 0; i < uv.count; i++) uv.setXY(i, u0 + uv.getX(i) * (u1 - u0), v0 + uv.getY(i) * (v1 - v0))
  return g
}

/** UVs from world position along two axes, so a tiling texture keeps one texel size everywhere. */
function planarUv(g: THREE.BufferGeometry, au: 'x' | 'y' | 'z', av: 'x' | 'y' | 'z', tile: number): THREE.BufferGeometry {
  const p = g.getAttribute('position') as THREE.BufferAttribute
  const uv = g.getAttribute('uv') as THREE.BufferAttribute
  const get = (i: number, a: 'x' | 'y' | 'z') => (a === 'x' ? p.getX(i) : a === 'y' ? p.getY(i) : p.getZ(i))
  for (let i = 0; i < p.count; i++) uv.setXY(i, get(i, au) / tile, get(i, av) / tile)
  return g
}

/** UVs by height and by angle around a vertical axis, for baked lantern shading. */
function heightUv(g: THREE.BufferGeometry, h: number): THREE.BufferGeometry {
  const p = g.getAttribute('position') as THREE.BufferAttribute
  const uv = g.getAttribute('uv') as THREE.BufferAttribute
  for (let i = 0; i < p.count; i++) uv.setXY(i, Math.atan2(p.getZ(i), p.getX(i)) / (Math.PI * 2) + 0.5, p.getY(i) / h)
  return g
}

function canvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D | null] {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return [c, c.getContext('2d')]
}

const hex = (c: number) => `#${c.toString(16).padStart(6, '0')}`

// ---------------------------------------------------------------- the room

interface Mats {
  wall: Mat
  wood: Mat
  iron: Mat
  brass: Mat
}

/** Back wall around the window opening, its reveals, side walls, floor and skirting. */
function buildRoom(b: Batch, tier: QualityTier, rng: () => number, m: Mats) {
  const s = TIER_SETTINGS[tier]
  const T = 1.2
  const top = FLOOR + ROOM.height
  const W = ROOM.halfW
  const wallAt = (x0: number, x1: number, y0: number, y1: number) => {
    const g = new THREE.PlaneGeometry(x1 - x0, y1 - y0)
    g.translate((x0 + x1) / 2, (y0 + y1) / 2, BZ)
    b.add(planarUv(g, 'x', 'y', T), m.wall, [0, 0, 0], [0, 0, 0], false, true)
  }
  wallAt(-W, NICHE.x0, FLOOR, top)
  wallAt(NICHE.x1, WIN.x0, FLOOR, top)
  wallAt(NICHE.x0, NICHE.x1, FLOOR, NICHE.y0)
  wallAt(NICHE.x0, NICHE.x1, NICHE.y1, top)
  wallAt(WIN.x1, W, FLOOR, top)
  wallAt(WIN.x0, WIN.x1, FLOOR, WIN.y0)
  wallAt(WIN.x0, WIN.x1, WIN.y1, VENT.y0)
  wallAt(WIN.x0, VENT.x0, VENT.y0, VENT.y1)
  wallAt(VENT.x1, WIN.x1, VENT.y0, VENT.y1)
  wallAt(WIN.x0, WIN.x1, VENT.y1, top)
  // the reveals, so the opening shows the wall's thickness
  const h = WIN.y1 - WIN.y0
  const w = WIN.x1 - WIN.x0
  const ym = (WIN.y0 + WIN.y1) / 2
  const xm = (WIN.x0 + WIN.x1) / 2
  const reveal = (g: THREE.BufferGeometry, pos: V3, rot: V3, au: 'x' | 'z', av: 'y' | 'z') =>
    b.add(planarUv(at(g, pos, rot), au, av, T), m.wall, [0, 0, 0], [0, 0, 0], false, true)
  reveal(new THREE.PlaneGeometry(TH, h), [WIN.x0, ym, BZ - TH / 2], [0, Math.PI / 2, 0], 'z', 'y')
  reveal(new THREE.PlaneGeometry(TH, h), [WIN.x1, ym, BZ - TH / 2], [0, -Math.PI / 2, 0], 'z', 'y')
  reveal(new THREE.PlaneGeometry(w, TH), [xm, WIN.y1, BZ - TH / 2], [Math.PI / 2, 0, 0], 'x', 'z')
  reveal(new THREE.PlaneGeometry(w, TH), [xm, WIN.y0, BZ - TH / 2], [-Math.PI / 2, 0, 0], 'x', 'z')
  // the niche: back, sides, top and a wooden shelf lip at the bottom
  {
    const nh = NICHE.y1 - NICHE.y0
    const nw = NICHE.x1 - NICHE.x0
    const nz = BZ - NICHE.d / 2
    const nym = (NICHE.y0 + NICHE.y1) / 2
    const nxm = (NICHE.x0 + NICHE.x1) / 2
    reveal(new THREE.PlaneGeometry(nw, nh), [nxm, nym, BZ - NICHE.d], [0, 0, 0], 'x', 'y')
    reveal(new THREE.PlaneGeometry(NICHE.d, nh), [NICHE.x0, nym, nz], [0, Math.PI / 2, 0], 'z', 'y')
    reveal(new THREE.PlaneGeometry(NICHE.d, nh), [NICHE.x1, nym, nz], [0, -Math.PI / 2, 0], 'z', 'y')
    reveal(new THREE.PlaneGeometry(nw, NICHE.d), [nxm, NICHE.y1, nz], [Math.PI / 2, 0, 0], 'x', 'z')
    b.add(box(nw + 0.03, 0.018, NICHE.d + 0.03), m.wood, [nxm, NICHE.y0 - 0.009, BZ - NICHE.d / 2 + 0.015], [0, 0, 0], false, true)
  }
  const vh = VENT.y1 - VENT.y0
  const vw = VENT.x1 - VENT.x0
  const vym = (VENT.y0 + VENT.y1) / 2
  const vxm = (VENT.x0 + VENT.x1) / 2
  reveal(new THREE.PlaneGeometry(TH, vh), [VENT.x0, vym, BZ - TH / 2], [0, Math.PI / 2, 0], 'z', 'y')
  reveal(new THREE.PlaneGeometry(TH, vh), [VENT.x1, vym, BZ - TH / 2], [0, -Math.PI / 2, 0], 'z', 'y')
  reveal(new THREE.PlaneGeometry(vw, TH), [vxm, VENT.y1, BZ - TH / 2], [Math.PI / 2, 0, 0], 'x', 'z')
  reveal(new THREE.PlaneGeometry(vw, TH), [vxm, VENT.y0, BZ - TH / 2], [-Math.PI / 2, 0, 0], 'x', 'z')
  // side walls
  const depth = ROOM.front - BZ
  const zm = (ROOM.front + BZ) / 2
  for (const sgn of [-1, 1]) {
    const g = at(new THREE.PlaneGeometry(depth, ROOM.height), [sgn * W, FLOOR + ROOM.height / 2, zm], [0, (-sgn * Math.PI) / 2, 0])
    b.add(planarUv(g, 'z', 'y', T), m.wall, [0, 0, 0], [0, 0, 0], false, true)
  }
  // a floor of square brick tiles
  const floorTex = stoneTexture(mix(pal.floor, 0x2a1e16, 0.35), { size: Math.min(256, s.texSize), rng, anisotropy: s.anisotropy, repeat: [1, 1], cells: 4 })
  const floorMat = material(tier, { map: floorTex, bump: 0.4, shininess: 8, specular: 0x0c0c0c })
  const fg = at(new THREE.PlaneGeometry(2 * W, depth), [0, FLOOR, zm], [-Math.PI / 2, 0, 0])
  b.add(planarUv(fg, 'x', 'z', 0.9), floorMat, [0, 0, 0], [0, 0, 0], false, true)
  // a striped cotton durrie under the table
  const durrieTex = clothTexture(0x313a4c, { size: Math.min(256, s.texSize), rng, anisotropy: s.anisotropy, stripe: 0x5e3a2c, repeat: [1, 3] })
  const durrie = material(tier, { map: durrieTex, shininess: 2 })
  b.add(new THREE.PlaneGeometry(1.5, 1.15).rotateX(-Math.PI / 2), durrie, [0, FLOOR + 0.003, 0.18], [0, Math.PI / 2, 0], false, true)
  // a dark-washed skirting band
  const trim = material(tier, { color: mix(pal.wall, 0x2a2a22, 0.7), shininess: 6 })
  b.add(box(2 * W, 0.1, 0.012), trim, [0, FLOOR + 0.05, BZ + 0.006], [0, 0, 0], false, true)
}

/** Rising damp along the foot of the back wall, and a seep stain under the window sill. */
function buildDamp(b: Batch, tier: QualityTier, rng: () => number) {
  const s = TIER_SETTINGS[tier]
  const tex = stainTexture(mix(pal.wall, 0x4a4030, 0.62), { size: Math.min(256, s.texSize), rng, repeat: [1, 1] })
  tex.wrapS = THREE.RepeatWrapping
  const mat = material(tier, { map: tex, transparent: true, decal: true, shininess: 2 })
  const W = ROOM.halfW
  const rise = new THREE.PlaneGeometry(2 * W, 0.8)
  region(rise, 0.3, 0, 2.3, 1)
  b.add(rise, mat, [0, FLOOR + 0.4, BZ + 0.002], [0, 0, 0], false, true)
  // the seep hangs from the sill: the same stain, turned upside down
  const seep = new THREE.PlaneGeometry(WIN.x1 - WIN.x0 + 0.16, 0.42)
  region(seep, 0.15, 0, 0.75, 1)
  b.add(seep, mat, [(WIN.x0 + WIN.x1) / 2 + 0.02, WIN.y0 - 0.23, BZ + 0.002], [0, 0, Math.PI], false, true)
  // and a patch high on the left where the roof once leaked (seen in the wide shot)
  const leak = new THREE.PlaneGeometry(0.7, 0.4)
  region(leak, 0.4, 0, 0.9, 1)
  b.add(leak, mat, [-0.85, 1.45, BZ + 0.002], [0, 0, Math.PI + 0.15], false, true)
}

// ---------------------------------------------------------------- the window

interface WindowParts {
  latch: THREE.Group
}

/** The frame, sill, iron bars and two panelled shutters, one wide open and one ajar. */
function buildWindow(b: Batch, tier: QualityTier, m: Mats): WindowParts {
  const seg = SEG[tier]
  const zf = BZ - 0.035
  const h = WIN.y1 - WIN.y0
  const w = WIN.x1 - WIN.x0
  b.add(box(FR, h, 0.07), m.wood, [WIN.x0 + FR / 2, (WIN.y0 + WIN.y1) / 2, zf], [0, 0, 0], false, true)
  b.add(box(FR, h, 0.07), m.wood, [WIN.x1 - FR / 2, (WIN.y0 + WIN.y1) / 2, zf], [0, 0, 0], false, true)
  b.add(box(w - 2 * FR, FR, 0.07), m.wood, [(WIN.x0 + WIN.x1) / 2, WIN.y1 - FR / 2, zf], [0, 0, 0], false, true)
  b.add(box(w - 2 * FR, FR, 0.07), m.wood, [(WIN.x0 + WIN.x1) / 2, WIN.y0 + FR / 2, zf], [0, 0, 0], false, true)
  // a sill board that juts into the room
  b.add(box(w + 0.1, 0.03, 0.1), m.wood, [(WIN.x0 + WIN.x1) / 2, WIN.y0 - 0.015, BZ + 0.025], [0, 0, 0], false, true)
  // iron bars set in the frame, and one flat cross bar
  const n = 5
  const zb = zf - 0.005
  for (let k = 1; k <= n; k++) {
    const x = CLEAR.x0 + ((CLEAR.x1 - CLEAR.x0) * k) / (n + 1)
    b.add(rod([x, CLEAR.y0 - 0.01, zb], [x, CLEAR.y1 + 0.01, zb], 0.0065, seg), m.iron, [0, 0, 0], [0, 0, 0], false, false)
  }
  b.add(box(CLEAR.x1 - CLEAR.x0, 0.022, 0.006), m.iron, [(CLEAR.x0 + CLEAR.x1) / 2, 0.46, zb + 0.008], [0, 0, 0], false, false)

  // the ventilator above: a plain frame and three bars over the dark
  const vz = BZ - 0.03
  const vw = VENT.x1 - VENT.x0
  const vh = VENT.y1 - VENT.y0
  b.add(box(vw, 0.03, 0.06), m.wood, [(VENT.x0 + VENT.x1) / 2, VENT.y0 + 0.015, vz], [0, 0, 0], false, true)
  b.add(box(vw, 0.03, 0.06), m.wood, [(VENT.x0 + VENT.x1) / 2, VENT.y1 - 0.015, vz], [0, 0, 0], false, true)
  b.add(box(0.03, vh, 0.06), m.wood, [VENT.x0 + 0.015, (VENT.y0 + VENT.y1) / 2, vz], [0, 0, 0], false, true)
  b.add(box(0.03, vh, 0.06), m.wood, [VENT.x1 - 0.015, (VENT.y0 + VENT.y1) / 2, vz], [0, 0, 0], false, true)
  for (let k = 1; k <= 3; k++) {
    const x = VENT.x0 + (vw * k) / 4
    b.add(rod([x, VENT.y0 + 0.03, vz], [x, VENT.y1 - 0.03, vz], 0.006, seg), m.iron, [0, 0, 0], [0, 0, 0], false, false)
  }

  // shutters: stiles, rails and sunk panels, hinged on the frame's inner edges
  const LW = (CLEAR.x1 - CLEAR.x0) / 2
  const LH = CLEAR.y1 - CLEAR.y0
  const LT = 0.022
  const leaf = (hingeX: number, sgn: 1 | -1, angle: number) => {
    const rot: V3 = [0, -sgn * angle, 0]
    const pos: V3 = [hingeX, CLEAR.y0, BZ]
    const put = (g: THREE.BufferGeometry, mat: Mat, x: number, y: number, z: number) =>
      b.add(at(at(g, [sgn * x, y, z]), pos, rot), mat, [0, 0, 0], [0, 0, 0], false, true)
    put(box(0.04, LH, LT), m.wood, 0.02, LH / 2, LT / 2)
    put(box(0.04, LH, LT), m.wood, LW - 0.02, LH / 2, LT / 2)
    const rails: [number, number][] = [[0.03, 0.06], [0.27, 0.05], [0.55, 0.05], [LH - 0.03, 0.06]]
    for (const [y, rh] of rails) put(box(LW - 0.08, rh, LT), m.wood, LW / 2, y, LT / 2)
    for (let i = 0; i < rails.length - 1; i++) {
      const a = rails[i] as [number, number]
      const c = rails[i + 1] as [number, number]
      const y0 = a[0] + a[1] / 2
      const y1 = c[0] - c[1] / 2
      put(box(LW - 0.08, y1 - y0, LT * 0.45), m.wood, LW / 2, (y0 + y1) / 2, LT / 2)
    }
    for (const y of [0.1, LH - 0.1]) put(box(0.012, 0.06, LT + 0.004), m.iron, 0.004, y, LT / 2)
  }
  leaf(CLEAR.x0, 1, THREE.MathUtils.degToRad(78))
  const ajar = THREE.MathUtils.degToRad(48)
  leaf(CLEAR.x1, -1, ajar)

  // a hook latch hangs loose from the ajar shutter's free edge and stirs in the night air
  const local = new THREE.Vector3(-(LW - 0.03), 0.13, LT + 0.004).applyAxisAngle(UP, ajar)
  const eye: V3 = [CLEAR.x1 + local.x, CLEAR.y0 + local.y, BZ + local.z]
  b.add(at(new THREE.TorusGeometry(0.006, 0.0018, 4, 10), eye, [0, ajar, 0]), m.iron, [0, 0, 0], [0, 0, 0], false, false)
  const hook = new THREE.Group()
  const hg = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3([vec([0, 0, 0]), vec([0, -0.05, 0]), vec([0, -0.072, 0.004]), vec([0.008, -0.078, 0.008]), vec([0.012, -0.07, 0.008])]),
    10, 0.0022, 5, false,
  )
  const hookMesh = new THREE.Mesh(hg, m.iron)
  hook.add(hookMesh)
  hook.position.set(eye[0], eye[1], eye[2])
  hook.rotation.y = ajar
  return { latch: hook }
}

// ---------------------------------------------------------------- the night outside

interface Painter {
  x(wx: number): number
  y(wy: number): number
  /** Canvas pixels per world metre. */
  s: number
}

function painterFor(f: { x0: number; x1: number; y0: number; y1: number }, W: number, H: number): Painter {
  return {
    x: (wx) => ((wx - f.x0) / (f.x1 - f.x0)) * W,
    y: (wy) => ((f.y1 - wy) / (f.y1 - f.y0)) * H,
    s: W / (f.x1 - f.x0),
  }
}

/** Maps near-plane world points onto the far plane as seen from the desk shot, for the one-plane low tier. */
function nearOnFar(p: Painter): Painter {
  const cy = 1.12
  const cz = 1.03
  const k = (FAR.z - cz) / (NEAR.z - cz)
  return { x: (wx) => p.x(wx * k), y: (wy) => p.y(cy + (wy - cy) * k), s: p.s * k }
}

function rect(g: CanvasRenderingContext2D, p: Painter, x0: number, y0: number, x1: number, y1: number) {
  g.fillRect(p.x(x0), p.y(y1), p.x(x1) - p.x(x0), p.y(y0) - p.y(y1))
}

/** A lit window: a warm pane with a soft spill of light around it. */
function litWindow(g: CanvasRenderingContext2D, p: Painter, x: number, y: number, w: number, h: number, warm: number) {
  const cx = p.x(x + w / 2)
  const cy = p.y(y + h / 2)
  const r = Math.max(4, p.s * Math.max(w, h) * 1.6)
  const glow = g.createRadialGradient(cx, cy, 0, cx, cy, r)
  glow.addColorStop(0, `rgba(255,170,80,${0.32 * warm})`)
  glow.addColorStop(1, 'rgba(255,170,80,0)')
  g.fillStyle = glow
  g.fillRect(cx - r, cy - r, 2 * r, 2 * r)
  g.fillStyle = warm > 0.7 ? '#f6c070' : '#b98245'
  rect(g, p, x, y, x + w, y + h)
  // a shutter leaf or a bar across the pane
  g.fillStyle = 'rgba(30,20,12,0.7)'
  rect(g, p, x + w * 0.46, y, x + w * 0.54, y + h)
}

function paintSky(g: CanvasRenderingContext2D, p: Painter, W: number, H: number, rng: () => number) {
  const grad = g.createLinearGradient(0, 0, 0, p.y(FAR_ROOF - 0.1))
  grad.addColorStop(0, hex(mix(pal.sky, 0x000000, 0.35)))
  grad.addColorStop(0.55, hex(mix(pal.sky, 0x1c2648, 0.5)))
  grad.addColorStop(0.9, hex(mix(pal.sky, 0x4a4a58, 0.55)))
  grad.addColorStop(1, hex(mix(pal.sky, 0x5a5048, 0.6)))
  g.fillStyle = grad
  g.fillRect(0, 0, W, H)
  // stars, fewer toward the hazy horizon
  const horizon = p.y(FAR_ROOF + 0.05)
  for (let i = 0; i < 260; i++) {
    const y = Math.pow(rng(), 1.6) * horizon
    const x = rng() * W
    const a = (0.25 + rng() * 0.6) * (1 - y / horizon) + 0.08
    const r = (rng() < 0.08 ? 1.4 : 0.7) * Math.max(0.6, W / 1024)
    g.fillStyle = `rgba(225,232,255,${a.toFixed(2)})`
    g.beginPath()
    g.arc(x, y, r, 0, Math.PI * 2)
    g.fill()
  }
}

/**
 * The old city beyond: a low skyline of parapets, rooftop rooms, a tank on legs and a few trees,
 * then flat terraces stepping toward the lane, each with its sky-lit parapet and a dark drop below.
 */
function paintFarRoofs(g: CanvasRenderingContext2D, p: Painter, rng: () => number) {
  const rim = 'rgba(86,96,124,0.6)'
  // terraces first, farthest (highest on the plane) to nearest, so nearer ones overlap
  const bands: number[] = []
  for (let y = FAR_ROOF - 0.03, h = 0.05; y > FAR.y0; y -= h, h *= 1.18) bands.push(y)
  for (let r = 0; r < bands.length; r++) {
    const top = bands[r] as number
    const next = bands[r + 1] ?? FAR.y0
    let x = FAR.x0 - rng() * 0.2
    while (x < FAR.x1) {
      const w = 0.12 + rng() * (0.22 + r * 0.05)
      const lift = (rng() - 0.5) * 0.02 * (1 + r * 0.4)
      const roof = top + lift
      const drop = (top - next) * (0.35 + rng() * 0.2)
      // the terrace faces the sky; the wall below it falls into the dark lane
      const tone = 22 + Math.floor(rng() * 7)
      g.fillStyle = `rgb(${tone},${tone + 3},${tone + 13})`
      rect(g, p, x, roof - drop, x + w, roof)
      g.fillStyle = 'rgb(11,12,18)'
      rect(g, p, x, next - 0.05, x + w, roof - drop)
      g.fillStyle = rim
      rect(g, p, x, roof - 0.006 - r * 0.001, x + w, roof)
      if (rng() < 0.22) litWindow(g, p, x + w * (0.2 + rng() * 0.6), roof - drop - 0.012 - (0.02 + r * 0.008), 0.016 + r * 0.004, 0.02 + r * 0.006, rng() < 0.5 ? 1 : 0.55)
      if (rng() < 0.18) {
        // a rooftop room on this terrace
        const bw = w * (0.25 + rng() * 0.2)
        const bx = x + rng() * (w - bw)
        const bh = 0.035 + r * 0.012
        g.fillStyle = `rgb(${tone - 6},${tone - 4},${tone + 4})`
        rect(g, p, bx, roof - drop * 0.6, bx + bw, roof - drop * 0.6 + bh)
        g.fillStyle = rim
        rect(g, p, bx, roof - drop * 0.6 + bh - 0.004, bx + bw, roof - drop * 0.6 + bh)
        if (rng() < 0.5) litWindow(g, p, bx + bw * 0.4, roof - drop * 0.6, bw * 0.22, bh * 0.6, 0.9)
      }
      x += w + (rng() < 0.3 ? 0.012 + r * 0.004 : 0)
    }
  }
  // the skyline itself
  let x = FAR.x0
  let i = 0
  while (x < FAR.x1) {
    const w = 0.1 + rng() * 0.2
    const top = FAR_ROOF + (rng() - 0.5) * 0.04 + (rng() < 0.15 ? 0.045 : 0)
    const tone = 18 + Math.floor(rng() * 7)
    g.fillStyle = `rgb(${tone},${tone + 3},${tone + 12})`
    rect(g, p, x, FAR_ROOF - 0.035, x + w, top)
    g.fillStyle = rim
    rect(g, p, x, top - 0.005, x + w, top)
    if (rng() < 0.3) {
      const bw = w * (0.3 + rng() * 0.25)
      const bx = x + rng() * (w - bw)
      const bh = 0.03 + rng() * 0.025
      g.fillStyle = `rgb(${tone - 3},${tone},${tone + 8})`
      rect(g, p, bx, top, bx + bw, top + bh)
      g.fillStyle = rim
      rect(g, p, bx, top + bh - 0.004, bx + bw, top + bh)
      if (rng() < 0.4) litWindow(g, p, bx + bw * 0.4, top + 0.004, bw * 0.2, bh * 0.5, 0.75)
    }
    x += w
    i++
    if (i === 3) {
      // an iron water tank on legs
      const tx = x - w * 0.55
      g.fillStyle = 'rgb(15,17,25)'
      rect(g, p, tx, top + 0.045, tx + 0.06, top + 0.095)
      for (const lx of [tx + 0.006, tx + 0.05]) rect(g, p, lx, top, lx + 0.004, top + 0.045)
      g.fillStyle = rim
      rect(g, p, tx, top + 0.091, tx + 0.06, top + 0.095)
    }
  }
  // trees between the houses: round dark canopies above the parapets
  for (let k = 0; k < 4; k++) {
    const cx = FAR.x0 + (0.15 + k * 0.24 + rng() * 0.12) * (FAR.x1 - FAR.x0)
    const cy = FAR_ROOF + 0.02 + rng() * 0.03
    const rr = 0.035 + rng() * 0.035
    g.fillStyle = 'rgb(12,16,16)'
    for (let j = 0; j < 7; j++) {
      g.beginPath()
      g.arc(p.x(cx + (rng() - 0.5) * rr * 2.2), p.y(cy + (rng() - 0.3) * rr * 1.2), p.s * rr * (0.55 + rng() * 0.4), 0, Math.PI * 2)
      g.fill()
    }
  }
  // haze where the old city's lamps glow
  const hz = g.createLinearGradient(0, p.y(FAR_ROOF + 0.25), 0, p.y(FAR_ROOF - 0.4))
  hz.addColorStop(0, 'rgba(120,96,70,0)')
  hz.addColorStop(0.5, 'rgba(120,96,70,0.10)')
  hz.addColorStop(1, 'rgba(120,96,70,0)')
  g.fillStyle = hz
  g.fillRect(0, p.y(FAR_ROOF + 0.25), p.x(FAR.x1) + 4, p.y(FAR_ROOF - 0.4) - p.y(FAR_ROOF + 0.25))
}

/** The building across the lane: a parapet with brick jaali, an iron tank, a stair room, a pole and wires. */
function paintNearRoofs(g: CanvasRenderingContext2D, p: Painter, rng: () => number) {
  const face = '#0b0d13'
  const rim = 'rgba(70,78,104,0.7)'
  const L = NEAR.x0 - 0.2
  const R = NEAR.x1 + 0.2
  const step = 0.36
  // two houses, the right one a little taller
  g.fillStyle = face
  rect(g, p, L, NEAR.y0, step, NEAR_ROOF)
  rect(g, p, step, NEAR.y0, R, NEAR_ROOF + 0.035)
  // parapet with jaali gaps on the left house, a little skylight showing through
  g.fillStyle = '#20263a'
  for (let x = L + 0.01; x < step - 0.02; x += 0.034) {
    g.fillRect(p.x(x), p.y(NEAR_ROOF - 0.012), Math.max(1, p.s * 0.014), Math.max(1, p.s * 0.016))
  }
  g.fillStyle = rim
  rect(g, p, L, NEAR_ROOF - 0.006, step, NEAR_ROOF)
  rect(g, p, step, NEAR_ROOF + 0.029, R, NEAR_ROOF + 0.035)
  rect(g, p, step - 0.006, NEAR_ROOF, step, NEAR_ROOF + 0.035)
  // an iron tank on a brick stand, riveted bands catching a little skylight
  const tx = 0.2
  g.fillStyle = '#0d1017'
  rect(g, p, tx + 0.01, NEAR_ROOF, tx + 0.15, NEAR_ROOF + 0.06)
  g.fillStyle = '#141824'
  rect(g, p, tx, NEAR_ROOF + 0.06, tx + 0.16, NEAR_ROOF + 0.16)
  g.fillStyle = 'rgba(96,106,134,0.7)'
  for (const y of [0.085, 0.12]) rect(g, p, tx, NEAR_ROOF + y, tx + 0.16, NEAR_ROOF + y + 0.003)
  rect(g, p, tx, NEAR_ROOF + 0.152, tx + 0.16, NEAR_ROOF + 0.16)
  rect(g, p, tx, NEAR_ROOF + 0.06, tx + 0.004, NEAR_ROOF + 0.16)
  g.fillStyle = '#0d1017'
  rect(g, p, tx + 0.14, NEAR_ROOF - 0.3, tx + 0.148, NEAR_ROOF + 0.07)
  // a stair room with its door open and lamplight spilling onto the roof
  const sx = 0.6
  const sTop = NEAR_ROOF + 0.17
  g.fillStyle = face
  rect(g, p, sx, NEAR_ROOF + 0.03, sx + 0.3, sTop)
  g.fillStyle = rim
  rect(g, p, sx - 0.01, sTop - 0.006, sx + 0.31, sTop)
  const spill = g.createRadialGradient(p.x(sx + 0.12), p.y(NEAR_ROOF + 0.04), 0, p.x(sx + 0.12), p.y(NEAR_ROOF + 0.04), p.s * 0.14)
  spill.addColorStop(0, 'rgba(255,170,90,0.28)')
  spill.addColorStop(1, 'rgba(255,170,90,0)')
  g.fillStyle = spill
  g.fillRect(p.x(sx - 0.05), p.y(NEAR_ROOF + 0.2), p.s * 0.35, p.s * 0.25)
  g.fillStyle = '#e9a85c'
  rect(g, p, sx + 0.09, NEAR_ROOF + 0.035, sx + 0.15, NEAR_ROOF + 0.13)
  g.fillStyle = 'rgba(40,24,12,0.85)'
  rect(g, p, sx + 0.13, NEAR_ROOF + 0.035, sx + 0.15, NEAR_ROOF + 0.13)
  // windows in the facade below (the wide shot sees them)
  litWindow(g, p, 0.16, NEAR_ROOF - 0.3, 0.07, 0.11, 0.9)
  for (const wx of [-0.3, -0.1, 0.5, 0.8]) {
    g.fillStyle = 'rgba(20,22,30,1)'
    rect(g, p, wx, NEAR_ROOF - 0.3, wx + 0.07, NEAR_ROOF - 0.19)
    g.fillStyle = 'rgba(70,78,104,0.35)'
    rect(g, p, wx - 0.01, NEAR_ROOF - 0.305, wx + 0.08, NEAR_ROOF - 0.298)
  }
  litWindow(g, p, -0.42, NEAR_ROOF - 0.62, 0.07, 0.11, 0.55)
  // a wooden pole with a cross-arm, and wires sagging across the lane
  const px0 = 0.1
  const pTop = NEAR_ROOF + 0.2
  g.fillStyle = '#0e1016'
  rect(g, p, px0, NEAR.y0, px0 + 0.016, pTop)
  rect(g, p, px0 - 0.07, pTop - 0.03, px0 + 0.086, pTop - 0.018)
  g.strokeStyle = 'rgba(6,7,10,1)'
  g.lineWidth = Math.max(1, p.s * 0.004)
  const wires: [number, number, number][] = [
    [px0 + 0.08, R, 0.05],
    [px0 - 0.06, NEAR.x0 - 0.2, 0.08],
    [px0 + 0.02, NEAR.x0 - 0.2, 0.05],
  ]
  for (const [x0, x1, sag] of wires) {
    const y0 = pTop - 0.03
    const y1 = pTop - 0.03 - 0.04 * rng()
    g.beginPath()
    g.moveTo(p.x(x0), p.y(y0))
    g.quadraticCurveTo(p.x((x0 + x1) / 2), p.y((y0 + y1) / 2 - sag * 2), p.x(x1), p.y(y1))
    g.stroke()
  }
  // the street's lamplight glows faintly up the facade
  const street = g.createLinearGradient(0, p.y(NEAR.y0), 0, p.y(NEAR.y0 + 0.5))
  street.addColorStop(0, 'rgba(160,110,60,0.22)')
  street.addColorStop(1, 'rgba(160,110,60,0)')
  g.fillStyle = street
  g.globalCompositeOperation = 'source-atop'
  g.fillRect(0, p.y(NEAR.y0 + 0.5), p.x(R), p.y(NEAR.y0) - p.y(NEAR.y0 + 0.5))
  g.globalCompositeOperation = 'source-over'
}

/** The view through the window: two painted planes on high and mid, one on low. Unlit and fogless. */
function buildOutside(tier: QualityTier, rng: () => number): THREE.Group {
  const group = new THREE.Group()
  const S = tier === 'high' ? 1024 : 512
  const [fc, fg] = canvas(S, S)
  if (fg) {
    const p = painterFor(FAR, S, S)
    paintSky(fg, p, S, S, rng)
    paintFarRoofs(fg, p, rng)
    if (tier === 'low') paintNearRoofs(fg, nearOnFar(p), rng)
  }
  const farMat = new THREE.MeshBasicMaterial({ map: toTexture(fc), fog: false })
  const far = new THREE.Mesh(new THREE.PlaneGeometry(FAR.x1 - FAR.x0, FAR.y1 - FAR.y0), farMat)
  far.position.set((FAR.x0 + FAR.x1) / 2, (FAR.y0 + FAR.y1) / 2, FAR.z)
  group.add(far)
  if (tier !== 'low') {
    const NW = S
    const NH = S / 2
    const [nc, ng] = canvas(NW, NH)
    if (ng) paintNearRoofs(ng, painterFor(NEAR, NW, NH), rng)
    const nearMat = new THREE.MeshBasicMaterial({ map: toTexture(nc), fog: false, transparent: true, depthWrite: false })
    const near = new THREE.Mesh(new THREE.PlaneGeometry(NEAR.x1 - NEAR.x0, NEAR.y1 - NEAR.y0), nearMat)
    near.position.set((NEAR.x0 + NEAR.x1) / 2, (NEAR.y0 + NEAR.y1) / 2, NEAR.z)
    group.add(near)
  }
  return group
}

// ---------------------------------------------------------------- the hurricane lantern

/**
 * Tin, tinted by height: the fount's shoulder and the burner glow under the flame, the cap is lit
 * from below, the base falls into shadow. Unlit, because a light 3 cm from tin blows it out.
 */
function lanternTexture(rng: () => number, size: number): THREE.CanvasTexture {
  const [c, g] = canvas(32, size)
  if (g) {
    const grad = g.createLinearGradient(0, size, 0, 0)
    const stops: [number, string][] = [
      [0, '#120f0b'], [0.06, '#211c16'], [0.11, '#43372a'], [0.16, '#94733f'], [0.2, '#bf9356'],
      [0.24, '#8f6a3a'], [0.32, '#55412a'], [0.5, '#4c3b27'], [0.56, '#7a5d37'], [0.6, '#9c7646'],
      [0.66, '#443626'], [0.75, '#2c251d'], [1, '#211c17'],
    ]
    for (const [k, col] of stops) grad.addColorStop(k, col)
    g.fillStyle = grad
    g.fillRect(0, 0, 32, size)
    const n = makeNoise(rng)
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < 32; x += 4) {
        const k = n((x / 32) * 4, (y / size) * 32, 4, 32)
        g.fillStyle = `rgba(${k > 0.6 ? '60,30,10' : '0,0,0'},${(Math.abs(k - 0.5) * 0.3).toFixed(3)})`
        g.fillRect(x, y, 4, 1)
      }
    }
  }
  return toTexture(c)
}

interface Lantern {
  group: THREE.Group
  body: THREE.MeshBasicMaterial
  glass: THREE.MeshPhongMaterial | THREE.MeshLambertMaterial
}

/** A tubular hurricane lantern: fount, burner, glass globe in a wire guard, side tubes, cap and bail. */
function buildLantern(tier: QualityTier, rng: () => number): Lantern {
  const seg = tier === 'low' ? 12 : 20
  const wseg = tier === 'low' ? 3 : 4
  const H = 0.3
  const parts: THREE.BufferGeometry[] = []
  // fount (the fuel tank) and the burner collar
  parts.push(lathe([[0, 0], [0.056, 0], [0.06, 0.006], [0.061, 0.018], [0.058, 0.03], [0.046, 0.042], [0.028, 0.05], [0.022, 0.052], [0.022, 0.062], [0, 0.062]], seg))
  parts.push(lathe([[0, 0.062], [0.033, 0.062], [0.036, 0.067], [0.031, 0.07], [0, 0.07]], seg))
  // filler cap and wick-raiser knob
  parts.push(rod([0.034, 0.04, -0.024], [0.036, 0.052, -0.026], 0.008, 8, true))
  parts.push(rod([0.012, 0.065, 0.02], [0.012, 0.065, 0.045], 0.0028, 6))
  parts.push(rod([0.012, 0.065, 0.045], [0.012, 0.065, 0.05], 0.007, 10, true))
  // the two side tubes that feed air to the burner, the air chamber and the cap
  for (const sx of [-1, 1]) {
    parts.push(rod([sx * 0.054, 0.034, 0], [sx * 0.054, 0.19, 0], 0.0048, 8))
    parts.push(rod([sx * 0.054, 0.034, 0], [sx * 0.036, 0.046, 0], 0.0048, 8))
  }
  parts.push(rod([-0.058, 0.193, 0], [0.058, 0.193, 0], 0.0095, 10, true))
  parts.push(lathe([[0, 0.17], [0.03, 0.17], [0.035, 0.18], [0.033, 0.197], [0.024, 0.21], [0.012, 0.216], [0.012, 0.222], [0, 0.224]], seg))
  // wire guard around the globe
  for (let k = 0; k < 4; k++) {
    const a = Math.PI / 4 + (k * Math.PI) / 2
    const g = wire([[0.033, 0.07, 0], [0.049, 0.1, 0], [0.05, 0.135, 0], [0.036, 0.166, 0]], 0.0016, 8, wseg)
    g.rotateY(a)
    parts.push(g)
  }
  parts.push(new THREE.TorusGeometry(0.05, 0.0016, wseg, 24).rotateX(Math.PI / 2).translate(0, 0.118, 0))
  // the bail, hinged on the tube tops
  parts.push(wire([[-0.054, 0.2, 0], [-0.05, 0.24, 0], [-0.03, 0.272, 0], [0, 0.284, 0], [0.03, 0.272, 0], [0.05, 0.24, 0], [0.054, 0.2, 0]], 0.0021, 18, wseg))
  for (const p of parts) heightUv(p, H)
  const b = createBatch()
  const body = new THREE.MeshBasicMaterial({ map: lanternTexture(rng, tier === 'low' ? 64 : 128) })
  for (const p of parts) b.add(p, body, [0, 0, 0], [0, 0, 0], false, false)
  const group = b.build()
  // the glass globe, a little sooted at the top
  const glass = material(tier, {
    color: 0xfff1d6, emissive: 0x6a3c14, transparent: true, opacity: 0.3, shininess: 110, specular: 0xffffff,
    depthWrite: false, side: THREE.DoubleSide,
  }) as THREE.MeshPhongMaterial | THREE.MeshLambertMaterial
  const globe = new THREE.Mesh(lathe([[0.03, 0.07], [0.04, 0.084], [0.046, 0.108], [0.044, 0.134], [0.035, 0.155], [0.028, 0.169]], seg), glass)
  globe.renderOrder = 1
  group.add(globe)
  group.position.set(SPOTS.lamp.x, 0, SPOTS.lamp.z)
  group.rotation.y = 0.5
  return { group, body, glass }
}

// ---------------------------------------------------------------- the bicycle

function spokeTexture(size: number): THREE.CanvasTexture {
  const [c, g] = canvas(size, size)
  if (g) {
    const R = size / 2
    g.translate(R, R)
    g.strokeStyle = size < 256 ? 'rgba(190,190,182,0.55)' : 'rgba(200,200,192,0.9)'
    g.lineWidth = Math.max(1, size / 200)
    for (let i = 0; i < 36; i++) {
      const a = (i / 36) * Math.PI * 2
      const lean = i % 2 ? 0.42 : -0.42
      g.beginPath()
      g.moveTo(Math.cos(a) * R * 0.09, Math.sin(a) * R * 0.09)
      g.lineTo(Math.cos(a + lean) * R * 0.99, Math.sin(a + lean) * R * 0.99)
      g.stroke()
    }
    g.fillStyle = 'rgba(170,170,165,1)'
    g.beginPath()
    g.arc(0, 0, R * 0.1, 0, Math.PI * 2)
    g.fill()
  }
  return toTexture(c)
}

/**
 * A black roadster: 28-inch wheels, a sprung saddle, swept-back bars with a bell, mudguards and a
 * carrier. Built in its own frame (front axle at the origin, rear toward +x, ground at y = 0),
 * turned at the bars, then leaned against the back wall.
 */
function buildBicycle(b: Batch, tier: QualityTier, spokes: Mat) {
  const seg = SEG[tier]
  const enamel = material(tier, { color: 0x121110, shininess: 70, specular: 0x4a4a4a, side: THREE.DoubleSide })
  const rubber = material(tier, { color: 0x1d1814, shininess: 6, specular: 0x101010 })
  const steel = material(tier, { color: 0x85837c, shininess: 60, specular: 0x4a4a46, metal: true })
  const R = 0.355
  const WB = 1.12
  const BB: V3 = [0.7, 0.27, 0]
  const S: V3 = [0.9, 0.79, 0]
  const Hb: V3 = [0.19, 0.69, 0]
  const Ht: V3 = [0.235, 0.82, 0]
  const frame: [THREE.BufferGeometry, Mat][] = []
  const front: [THREE.BufferGeometry, Mat][] = []
  const wheel = (cx: number, out: [THREE.BufferGeometry, Mat][]) => {
    out.push([new THREE.TorusGeometry(R - 0.019, 0.019, seg, 44).translate(cx, R, 0), rubber])
    out.push([new THREE.TorusGeometry(R - 0.045, 0.008, 4, 44).translate(cx, R, 0), steel])
    out.push([rod([cx, R, -0.045], [cx, R, 0.045], 0.016, seg, true), steel])
    out.push([new THREE.CircleGeometry(R - 0.048, 28).translate(cx, R, 0), spokes])
  }
  const guard = (cx: number, start: number, len: number) =>
    new THREE.CylinderGeometry(R + 0.028, R + 0.028, 0.056, 28, 1, true, start, len).rotateX(Math.PI / 2).translate(cx, R, 0)
  // frame
  frame.push([rod(Hb, Ht, 0.017, seg), enamel])
  frame.push([rod([0.228, 0.8, 0], S, 0.013, seg), enamel])
  frame.push([rod([0.197, 0.705, 0], BB, 0.015, seg), enamel])
  frame.push([rod(BB, [0.905, 0.8, 0], 0.014, seg), enamel])
  for (const z of [-0.045, 0.045]) {
    frame.push([rod([0.9, 0.785, z * 0.4], [WB, R, z], 0.008, seg), enamel])
    frame.push([rod([0.71, 0.27, z * 0.6], [WB, R, z], 0.009, seg), enamel])
  }
  frame.push([rod(S, [0.918, 0.865, 0], 0.011, seg), steel])
  // a sprung leather saddle
  const saddle = new THREE.SphereGeometry(1, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2).scale(0.12, 0.035, 0.085).translate(0.95, 0.9, 0)
  const nose = new THREE.SphereGeometry(1, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2).scale(0.1, 0.03, 0.035).translate(0.84, 0.9, 0)
  frame.push([saddle, rubber], [nose, rubber])
  for (const z of [-0.05, 0.05]) {
    const coil: V3[] = []
    for (let i = 0; i <= 16; i++) {
      const a = (i / 16) * Math.PI * 8
      coil.push([1.0 + Math.cos(a) * 0.012, 0.865 + (i / 16) * 0.035, z + Math.sin(a) * 0.012])
    }
    frame.push([wire(coil, 0.0022, 32, 3), steel])
  }
  // rear wheel, its guard and the carrier over it
  wheel(WB, frame)
  frame.push([guard(WB, Math.PI * 0.95, Math.PI * 0.9), enamel])
  for (const z of [-0.06, 0.06]) {
    frame.push([rod([0.96, 0.82, z], [1.42, 0.8, z], 0.0045, 6), steel])
    frame.push([rod([1.36, 0.8, z], [WB + 0.01, R, z * 0.9], 0.0045, 6), steel])
  }
  for (const x of [1.05, 1.2, 1.35]) frame.push([rod([x, 0.805, -0.06], [x, 0.805, 0.06], 0.004, 6), steel])

  // the front: fork, wheel, guard, stem, bars, grips and bell, turned about the steering axis
  wheel(0, front)
  front.push([guard(0, -Math.PI * 0.05, Math.PI * 0.85), enamel])
  for (const z of [-0.048, 0.048]) front.push([wire([[0.185, 0.675, z * 0.6], [0.12, 0.52, z], [0.04, 0.4, z], [0, R, z]], 0.008, 10, seg), enamel])
  front.push([rod(Ht, [0.262, 0.905, 0], 0.011, seg), steel])
  front.push([rod([0.262, 0.905, 0], [0.272, 0.93, 0], 0.012, seg), steel])
  const bar: V3[] = [[0.44, 0.885, -0.27], [0.34, 0.9, -0.255], [0.28, 0.925, -0.16], [0.27, 0.932, 0], [0.28, 0.925, 0.16], [0.34, 0.9, 0.255], [0.44, 0.885, 0.27]]
  front.push([wire(bar, 0.0115, 24, seg), steel])
  for (const z of [-1, 1]) front.push([rod([0.36, 0.896, z * 0.262], [0.46, 0.882, z * 0.272], 0.0155, seg, true), rubber])
  front.push([new THREE.SphereGeometry(0.022, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2).translate(0.3, 0.934, -0.205), steel])
  const axis = vec(Ht).sub(vec(Hb)).normalize()
  const steer = new THREE.Matrix4()
    .makeTranslation(Hb[0], Hb[1], Hb[2])
    .multiply(new THREE.Matrix4().makeRotationAxis(axis, -0.8))
    .multiply(new THREE.Matrix4().makeTranslation(-Hb[0], -Hb[1], -Hb[2]))
  for (const [g] of front) g.applyMatrix4(steer)

  // lean it against the wall, front to the left, under the window
  const pos: V3 = [-0.06, FLOOR, BZ + 0.23]
  const rot: V3 = [-0.07, 0, 0]
  for (const [g, mat] of [...frame, ...front]) b.add(g, mat, pos, rot, false, false)
}

// ---------------------------------------------------------------- the peg, coat and hat

function clothAtlas(tier: QualityTier, rng: () => number): THREE.CanvasTexture {
  const S = tier === 'low' ? 128 : 256
  const wool = clothTexture(0x5b4d3f, { size: S, rng })
  const [c, g] = canvas(S * 2, S)
  if (g) {
    const img = wool.image as HTMLCanvasElement
    if (img && img.width) g.drawImage(img, 0, 0, S, S)
    else {
      g.fillStyle = '#3d352d'
      g.fillRect(0, 0, S, S)
    }
    // the coat's front opening, lapel shadow and buttons, centred at u = 0.25
    g.strokeStyle = 'rgba(10,8,6,0.75)'
    g.lineWidth = Math.max(1, S / 90)
    g.beginPath()
    g.moveTo(S * 0.5, S * 0.55)
    g.lineTo(S * 0.5, S * 1.0)
    g.moveTo(S * 0.5, S * 0.55)
    g.lineTo(S * 0.4, S * 0.86)
    g.moveTo(S * 0.5, S * 0.55)
    g.lineTo(S * 0.6, S * 0.86)
    g.stroke()
    g.fillStyle = 'rgba(14,10,8,0.9)'
    for (const y of [0.4, 0.28]) {
      g.beginPath()
      g.arc(S * 0.53, S * y, Math.max(1, S / 70), 0, Math.PI * 2)
      g.fill()
    }
    // felt for the hat, and its dark ribbon band
    const n = makeNoise(rng)
    const felt = g.createImageData(S, S)
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const k = 0.88 + n((x / S) * 16, (y / S) * 16, 16, 16) * 0.2
        const i = (y * S + x) * 4
        felt.data[i] = 92 * k
        felt.data[i + 1] = 78 * k
        felt.data[i + 2] = 62 * k
        felt.data[i + 3] = 255
      }
    }
    g.putImageData(felt, S, 0)
    g.fillStyle = '#1c1612'
    g.fillRect(S, S * 0.8, S, S * 0.2)
  }
  wool.dispose()
  return toTexture(c)
}

function buildPegAndCoat(b: Batch, tier: QualityTier, rng: () => number, m: Mats): Mat {
  const seg = SEG[tier]
  const cloth = material(tier, { map: clothAtlas(tier, rng), shininess: 3, specular: 0x080808 })
  // two turned wooden pegs, angled up a little: the coat on one, the hat on the other
  const peg = (x: number, y: number) => {
    const g = lathe([[0, 0], [0.018, 0], [0.018, 0.01], [0.011, 0.02], [0.012, 0.075], [0.017, 0.085], [0.012, 0.095], [0, 0.097]], seg)
    g.rotateX(Math.PI / 2 - 0.25)
    b.add(g, m.wood, [x, y, BZ], [0, 0, 0], false, true)
  }
  const cx = -0.56
  const cy = 0.96
  peg(cx, cy)
  // the coat hangs by its collar loop: a flattened body with sleeves
  const body = lathe(
    [[0, -0.68], [0.18, -0.68], [0.185, -0.64], [0.178, -0.5], [0.18, -0.3], [0.185, -0.15], [0.16, -0.09], [0.09, -0.04], [0.03, -0.005], [0, 0]],
    tier === 'low' ? 14 : 22,
    Math.PI,
  )
  region(body, 0, 0, 0.5, 1)
  body.scale(1, 1, 0.24)
  b.add(body, cloth, [cx, cy + 0.015, BZ + 0.06], [0.04, 0, 0], false, true)
  for (const sx of [-1, 1]) {
    const sleeve = wire([[sx * 0.14, -0.13, 0.02], [sx * 0.175, -0.3, 0.035], [sx * 0.168, -0.52, 0.04], [sx * 0.156, -0.6, 0.04]], 0.038, 8, seg)
    region(sleeve, 0.05, 0.1, 0.12, 0.4)
    b.add(sleeve, cloth, [cx, cy + 0.015, BZ + 0.06], [0.04, 0, 0], false, true)
  }
  // the felt hat hangs crown-out on its own peg
  const hx = -0.24
  const hy = 0.7
  peg(hx, hy)
  const hat = lathe(
    [[0, -0.004], [0.086, -0.006], [0.134, -0.002], [0.138, 0.016], [0.128, 0.004], [0.086, 0.004], [0.084, 0.03], [0.08, 0.088], [0.068, 0.11], [0.035, 0.112], [0, 0.098]],
    tier === 'low' ? 14 : 24,
  )
  region(hat, 0.5, 0.25, 1, 1)
  const hatRot: V3 = [1.25, 0, 0.25]
  const hatPos: V3 = [hx + 0.01, hy - 0.045, BZ + 0.035]
  b.add(hat, cloth, hatPos, hatRot, false, true)
  const band = new THREE.CylinderGeometry(0.0855, 0.087, 0.022, tier === 'low' ? 14 : 24, 1, true).translate(0, 0.016, 0)
  region(band, 0.5, 0, 1, 0.18)
  b.add(band, cloth, hatPos, hatRot, false, true)
  return cloth
}

/** Books in the niche: three standing, one lying across them, in cloth bindings. */
function buildBooks(b: Batch, cloth: Mat, paper: Mat) {
  const z = BZ - NICHE.d + 0.055
  const y0 = NICHE.y0
  const spines: [number, number, number, number, readonly [number, number, number, number]][] = [
    // x, width, height, lean, atlas region
    [NICHE.x0 + 0.03, 0.028, 0.19, 0, [0.02, 0.1, 0.2, 0.5]],
    [NICHE.x0 + 0.062, 0.034, 0.17, 0, [0.55, 0.85, 0.95, 0.98]],
    [NICHE.x0 + 0.1, 0.024, 0.18, -0.22, [0.55, 0.3, 0.95, 0.7]],
  ]
  for (const [x, w, h, lean, r] of spines) {
    const g = region(box(w, h, 0.13), ...r)
    g.translate(0, h / 2, 0)
    b.add(g, cloth, [x + Math.sin(-lean) * h * 0.5, y0, z], [0, 0, lean], false, true)
  }
  const lying = region(box(0.15, 0.03, 0.11), 0.02, 0.1, 0.2, 0.5)
  b.add(lying, cloth, [NICHE.x1 - 0.085, y0 + 0.015, z + 0.005], [0, 0.08, 0], false, true)
  b.add(region(box(0.142, 0.022, 0.104), ...ATLAS.newsprint), paper, [NICHE.x1 - 0.085, y0 + 0.015, z + 0.009], [0, 0.08, 0], false, true)
}

// ---------------------------------------------------------------- the matka on its stool

function matkaTexture(rng: () => number, size: number): THREE.CanvasTexture {
  const [c, g] = canvas(size, size)
  if (g) {
    // lathe v runs from the foot (canvas bottom) to the lip (top)
    const grad = g.createLinearGradient(0, size, 0, 0)
    grad.addColorStop(0, '#5a2a18')
    grad.addColorStop(0.3, '#6c3420')
    grad.addColorStop(0.42, '#9c5634')
    grad.addColorStop(0.8, '#b0663e')
    grad.addColorStop(1, '#8a4a2c')
    g.fillStyle = grad
    g.fillRect(0, 0, size, size)
    const n = makeNoise(rng)
    for (let y = 0; y < size; y++) {
      const ring = 0.06 * Math.sin((y / size) * 90) + 0.12 * (n(0.5, (y / size) * 24, 2, 24) - 0.5)
      g.fillStyle = ring > 0 ? `rgba(255,220,180,${ring.toFixed(3)})` : `rgba(0,0,0,${(-ring).toFixed(3)})`
      g.fillRect(0, y, size, 1)
    }
    // a painted band with a zigzag at the shoulder
    g.fillStyle = 'rgba(30,14,8,0.8)'
    g.fillRect(0, size * 0.2, size, size * 0.018)
    g.fillRect(0, size * 0.27, size, size * 0.018)
    g.strokeStyle = 'rgba(30,14,8,0.75)'
    g.lineWidth = Math.max(1, size / 110)
    g.beginPath()
    for (let x = 0; x <= size; x += size / 24) g.lineTo(x, size * (Math.round(x / (size / 24)) % 2 ? 0.222 : 0.262))
    g.stroke()
  }
  return toTexture(c)
}

function buildMatka(b: Batch, tier: QualityTier, rng: () => number, m: Mats) {
  const seg = tier === 'low' ? 14 : 22
  const sx = -0.53
  const sz = BZ + 0.17
  const stoolTop = FLOOR + 0.36
  // a plain wooden stool
  b.add(box(0.3, 0.024, 0.28), m.wood, [sx, stoolTop - 0.012, sz], [0, 0, 0], false, true)
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as const) {
    b.add(box(0.026, 0.34, 0.026), m.wood, [sx + dx * 0.12, FLOOR + 0.17, sz + dz * 0.11], [0, 0, 0], false, true)
  }
  b.add(box(0.26, 0.02, 0.016), m.wood, [sx, FLOOR + 0.1, sz + 0.11], [0, 0, 0], false, true)
  const clay = material(tier, { map: matkaTexture(rng, tier === 'low' ? 64 : 128), shininess: 5, specular: 0x0c0806 })
  const pot = lathe(
    [[0, 0], [0.06, 0], [0.1, 0.028], [0.133, 0.085], [0.14, 0.13], [0.13, 0.18], [0.1, 0.222], [0.066, 0.248], [0.058, 0.26], [0.066, 0.268], [0.07, 0.278], [0.06, 0.282], [0.05, 0.272], [0, 0.272]],
    seg,
  )
  b.add(pot, clay, [sx, stoolTop, sz], [0, 0.4, 0], false, true)
  // a clay lid, and a brass tumbler upturned on it
  const lid = lathe([[0, 0.281], [0.072, 0.275], [0.08, 0.277], [0.078, 0.282], [0, 0.29]], seg)
  region(lid, 0, 0.82, 1, 0.9)
  b.add(lid, clay, [sx, stoolTop, sz], [0, 0, 0], false, true)
  const cup = lathe([[0, 0.284], [0.034, 0.284], [0.036, 0.288], [0.031, 0.36], [0.028, 0.366], [0, 0.366]], seg)
  b.add(cup, m.brass, [sx + 0.01, stoolTop, sz + 0.005], [0, 0, 0], false, true)
}

// ---------------------------------------------------------------- papers: newspapers, leaflets, a label

/** Atlas regions in UV space (v up). */
const ATLAS = {
  tribune: [0, 0.52, 0.34, 1] as const,
  bande: [0, 0.02, 0.34, 0.5] as const,
  leaflet: [0.35, 0.33, 0.6, 1] as const,
  newsprint: [0.62, 0.68, 0.78, 1] as const,
  label: [0.62, 0.4, 0.78, 0.56] as const,
}

function paperAtlas(tier: QualityTier, rng: () => number): THREE.CanvasTexture {
  const W = tier === 'low' ? 512 : 1024
  const H = W / 2
  const [c, g] = canvas(W, H)
  if (!g) return toTexture(c)
  const r = (k: readonly [number, number, number, number]) => ({ x: k[0] * W, y: (1 - k[3]) * H, w: (k[2] - k[0]) * W, h: (k[3] - k[1]) * H })
  const greyText = (x0: number, y0: number, w: number, h: number, cols: number, ink: string) => {
    g.fillStyle = ink
    const cw = w / cols
    for (let col = 0; col < cols; col++) {
      for (let y = y0; y < y0 + h; y += h / 26) {
        const len = cw * (0.72 + rng() * 0.2)
        g.fillRect(x0 + col * cw + cw * 0.06, y, len, Math.max(1, h / 70))
      }
    }
  }
  // The Tribune, a quarter-folded front page: masthead, rules, a heavy headline and columns
  {
    const R = r(ATLAS.tribune)
    g.fillStyle = '#c4b899'
    g.fillRect(R.x, R.y, R.w, R.h)
    g.fillStyle = '#1d1b18'
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    g.font = `bold ${Math.round(R.h * 0.105)}px Georgia, "Times New Roman", serif`
    g.fillText('THE TRIBUNE', R.x + R.w / 2, R.y + R.h * 0.12)
    g.fillRect(R.x + R.w * 0.05, R.y + R.h * 0.24, R.w * 0.9, Math.max(1, R.h * 0.008))
    g.fillRect(R.x + R.w * 0.05, R.y + R.h * 0.27, R.w * 0.9, Math.max(1, R.h * 0.004))
    for (let i = 0; i < 2; i++) g.fillRect(R.x + R.w * 0.07, R.y + R.h * (0.31 + i * 0.07), R.w * (0.86 - i * 0.2), R.h * 0.045)
    greyText(R.x + R.w * 0.04, R.y + R.h * 0.48, R.w * 0.92, R.h * 0.48, 5, 'rgba(40,36,30,0.55)')
  }
  // Bande Mataram (Lahore, Urdu): a lithographed page, calligraphic lines running right to left
  {
    const R = r(ATLAS.bande)
    g.fillStyle = '#bfb193'
    g.fillRect(R.x, R.y, R.w, R.h)
    g.fillStyle = '#1d1b18'
    g.textAlign = 'center'
    g.font = `bold ${Math.round(R.h * 0.12)}px "Noto Nastaliq Urdu", "Noto Naskh Arabic", "Geeza Pro", "Times New Roman", serif`
    g.fillText('بندے ماترم', R.x + R.w / 2, R.y + R.h * 0.13)
    g.fillRect(R.x + R.w * 0.05, R.y + R.h * 0.25, R.w * 0.9, Math.max(1, R.h * 0.008))
    g.strokeStyle = 'rgba(40,36,30,0.55)'
    g.lineWidth = Math.max(1, R.h / 160)
    for (let col = 0; col < 4; col++) {
      const cx1 = R.x + R.w * (0.96 - col * 0.23)
      for (let y = R.y + R.h * 0.33; y < R.y + R.h * 0.95; y += R.h * 0.045) {
        g.beginPath()
        let x = cx1
        g.moveTo(x, y)
        while (x > cx1 - R.w * 0.2) {
          x -= R.w * (0.01 + rng() * 0.012)
          g.lineTo(x, y - (rng() < 0.3 ? R.h * 0.012 : 0) + rng() * R.h * 0.006)
        }
        g.stroke()
      }
    }
  }
  // an HSRA leaflet on pink paper with its printed heading
  {
    const R = r(ATLAS.leaflet)
    g.fillStyle = '#e8a9ae'
    g.fillRect(R.x, R.y, R.w, R.h)
    g.fillStyle = 'rgba(70,28,34,0.7)'
    g.textAlign = 'center'
    g.font = `bold ${Math.round(R.w * 0.045)}px Georgia, "Times New Roman", serif`
    g.fillText('HINDUSTAN SOCIALIST', R.x + R.w / 2, R.y + R.h * 0.07)
    g.fillText('REPUBLICAN ARMY', R.x + R.w / 2, R.y + R.h * 0.11)
    g.font = `bold ${Math.round(R.w * 0.075)}px Georgia, "Times New Roman", serif`
    g.fillText('NOTICE', R.x + R.w / 2, R.y + R.h * 0.19)
    g.fillRect(R.x + R.w * 0.3, R.y + R.h * 0.235, R.w * 0.4, Math.max(1, R.h * 0.005))
    greyText(R.x + R.w * 0.1, R.y + R.h * 0.28, R.w * 0.8, R.h * 0.6, 1, 'rgba(70,28,34,0.32)')
  }
  // plain newsprint for the papers under the top ones
  {
    const R = r(ATLAS.newsprint)
    g.fillStyle = '#b8ab8c'
    g.fillRect(R.x, R.y, R.w, R.h)
    greyText(R.x + R.w * 0.04, R.y + R.h * 0.1, R.w * 0.92, R.h * 0.85, 3, 'rgba(40,36,30,0.4)')
  }
  // a trunk label, painted cream with a stencilled name
  {
    const R = r(ATLAS.label)
    g.fillStyle = '#d8ccaa'
    g.fillRect(R.x, R.y, R.w, R.h)
    g.strokeStyle = 'rgba(30,24,18,0.8)'
    g.lineWidth = Math.max(1, R.h / 30)
    g.strokeRect(R.x + R.w * 0.05, R.y + R.h * 0.1, R.w * 0.9, R.h * 0.8)
    g.fillStyle = 'rgba(30,24,18,0.75)'
    for (let i = 0; i < 6; i++) g.fillRect(R.x + R.w * (0.14 + i * 0.12), R.y + R.h * 0.38, R.w * 0.08, R.h * 0.24)
  }
  return toTexture(c, { anisotropy: TIER_SETTINGS[tier].anisotropy })
}

function buildPapers(b: Batch, tier: QualityTier, rng: () => number): Mat {
  const mat = material(tier, { map: paperAtlas(tier, rng), shininess: 4, specular: 0x0a0a0a })
  const NW = 0.215
  const ND = 0.152
  const T = 0.003
  const cx = 0.3
  const cz = -0.22
  // a stack of quarter-folded newspapers at the back right
  const layers = tier === 'low' ? 3 : 5
  for (let i = 0; i < layers; i++) {
    const g = region(box(NW, T, ND), ...ATLAS.newsprint)
    b.add(g, mat, [cx + (rng() - 0.5) * 0.012, T * (i + 0.5), cz + (rng() - 0.5) * 0.01], [0, -0.12 + (rng() - 0.5) * 0.08, 0], true, true)
  }
  const y = T * layers
  b.add(region(box(NW, T, ND), ...ATLAS.bande), mat, [cx - 0.015, y + T * 0.5, cz - 0.03], [0, 0.16, 0], true, true)
  b.add(region(box(NW, T, ND), ...ATLAS.tribune), mat, [cx + 0.02, y + T * 1.5, cz + 0.035], [0, -0.07, 0], true, true)
  // pink leaflets fanned at the front edge, curling over it
  const sheets: [number, number, number][] = [[0.2, 0.268, -0.34], [0.222, 0.274, 0.04], [0.245, 0.266, 0.28]]
  sheets.forEach(([x, z, yaw], i) => {
    const g = region(new THREE.PlaneGeometry(0.105, 0.148, 1, 8), ...ATLAS.leaflet)
    g.rotateX(-Math.PI / 2)
    g.rotateY(yaw)
    g.translate(x, 0.0016 + i * 0.0005, z)
    const p = g.getAttribute('position') as THREE.BufferAttribute
    for (let k = 0; k < p.count; k++) {
      const over = p.getZ(k) - (DESK.d / 2 + 0.002)
      if (over > 0) p.setY(k, p.getY(k) - over * over * 18 - over * 0.25)
    }
    g.computeVertexNormals()
    b.add(g, mat, [0, 0, 0], [0, 0, 0], true, true)
  })
  return mat
}

// ---------------------------------------------------------------- the tin trunk under the table

function buildTrunk(b: Batch, tier: QualityTier, rng: () => number, m: Mats, paper: Mat) {
  const s = TIER_SETTINGS[tier]
  const paint = material(tier, {
    map: metalTexture(0x52644a, { size: Math.min(128, s.texSize), rng }),
    shininess: 22,
    specular: 0x222222,
  })
  const W = 0.6
  const H = 0.3
  const D = 0.36
  const cx = 0.1
  const cz = -0.05
  const y0 = FLOOR + 0.004
  b.add(box(W, H, D), paint, [cx, y0 + H / 2, cz], [0, 0, 0], false, true)
  // lid lip, two straps, brass corner caps, hasp and padlock, side handles
  b.add(box(W + 0.008, 0.014, D + 0.008), m.iron, [cx, y0 + H - 0.07, cz], [0, 0, 0], false, true)
  for (const dx of [-0.19, 0.19]) b.add(box(0.03, H + 0.004, D + 0.006), m.iron, [cx + dx, y0 + H / 2, cz], [0, 0, 0], false, true)
  if (tier !== 'low') {
    for (const dx of [-1, 1]) for (const dy of [0, 1]) for (const dz of [-1, 1]) {
      b.add(box(0.026, 0.026, 0.026), m.iron, [cx + dx * (W / 2 - 0.011), y0 + 0.011 + dy * (H - 0.022), cz + dz * (D / 2 - 0.011)], [0, 0, 0], false, true)
    }
  }
  b.add(box(0.034, 0.06, 0.01), m.brass, [cx, y0 + H - 0.07, cz + D / 2 + 0.006], [0, 0, 0], false, true)
  b.add(box(0.042, 0.04, 0.016), m.brass, [cx, y0 + H - 0.115, cz + D / 2 + 0.012], [0, 0, 0], false, true)
  b.add(new THREE.TorusGeometry(0.013, 0.003, 4, 10, Math.PI).translate(cx, y0 + H - 0.095, cz + D / 2 + 0.012), m.iron, [0, 0, 0], [0, 0, 0], false, true)
  for (const dx of [-1, 1]) {
    b.add(new THREE.TorusGeometry(0.035, 0.004, 4, 10, Math.PI).rotateY(Math.PI / 2).rotateX(Math.PI), m.iron, [cx + dx * (W / 2 + 0.006), y0 + H - 0.08, cz], [0, 0, 0], false, true)
  }
  const label = region(new THREE.PlaneGeometry(0.15, 0.075), ...ATLAS.label)
  b.add(label, paper, [cx - 0.13, y0 + H * 0.45, cz + D / 2 + 0.002], [0, 0, 0], false, true)
}

/** Two iron keys on a ring, by the newspapers: a parcel goes only to the one who shows them. */
function buildKeys(b: Batch, m: Mats) {
  const y = 0.0016
  const ring: V3 = [0.07, y, -0.205]
  b.add(new THREE.TorusGeometry(0.014, 0.0016, 4, 16).rotateX(Math.PI / 2), m.iron, ring, [0, 0, 0], true, true)
  for (const [a, len] of [[0.35, 0.05], [2.6, 0.042]] as const) {
    const dir = new THREE.Vector3(Math.cos(a), 0, Math.sin(a))
    const side = new THREE.Vector3(-Math.sin(a), 0, Math.cos(a))
    const bowC = new THREE.Vector3(...ring).addScaledVector(dir, 0.014 + 0.009)
    b.add(new THREE.TorusGeometry(0.009, 0.0022, 4, 12).rotateX(Math.PI / 2), m.iron, [bowC.x, y, bowC.z], [0, 0, 0], true, true)
    const s0 = bowC.clone().addScaledVector(dir, 0.009)
    const s1 = s0.clone().addScaledVector(dir, len)
    b.add(rod([s0.x, y, s0.z], [s1.x, y, s1.z], 0.0022, 6, true), m.iron, [0, 0, 0], [0, 0, 0], true, true)
    // the bit, a flag on one side of the barrel's end
    const bit = s1.clone().addScaledVector(dir, -0.007).addScaledVector(side, 0.006)
    b.add(box(0.011, 0.0026, 0.01), m.iron, [bit.x, y, bit.z], [0, -a, 0], true, true)
  }
}

// ---------------------------------------------------------------- the dressing

export const lahore1929: EraDressing = {
  id: 'lahore-1929',
  camera: CAMERA,
  lightColor: pal.lamp,
  build({ scene, tier, rng }) {
    const s = TIER_SETTINGS[tier]
    const root = new THREE.Group()
    root.name = 'lahore-1929'
    const m: Mats = {
      wall: material(tier, {
        map: plasterTexture(pal.wall, { size: s.texSize, rng, anisotropy: s.anisotropy, repeat: [1, 1] }),
        bump: 0.35,
        shininess: 4,
        specular: 0x0a0a0a,
      }),
      wood: material(tier, {
        map: woodTexture('teak', { size: Math.min(256, s.texSize), rng, anisotropy: s.anisotropy, repeat: [1, 1], tint: 0x7a5434 }),
        shininess: 14,
        specular: 0x18120c,
      }),
      iron: material(tier, { color: 0x2b2926, shininess: 30, specular: 0x2a2a2a, metal: true }),
      brass: material(tier, {
        map: metalTexture(0xc0913f, { size: Math.min(128, s.texSize), rng }),
        shininess: 70,
        specular: 0x8a6a34,
        metal: true,
      }),
    }

    const b = createBatch()
    buildRoom(b, tier, rng, m)
    if (tier !== 'low') buildDamp(b, tier, rng)
    const win = buildWindow(b, tier, m)
    const spokes = material(tier, { map: spokeTexture(tier === 'low' ? 128 : 256), transparent: true, side: THREE.DoubleSide, depthWrite: false, shininess: 40, metal: true })
    buildBicycle(b, tier, spokes)
    const cloth = buildPegAndCoat(b, tier, rng, m)
    buildMatka(b, tier, rng, m)
    const paper = buildPapers(b, tier, rng)
    buildBooks(b, cloth, paper)
    buildTrunk(b, tier, rng, m, paper)
    if (tier !== 'low') buildKeys(b, m)
    const statics = b.build()

    const desk = createDesk({ palette: pal, tier, rng, legs: 'square' })
    const outside = buildOutside(tier, rng)
    const lantern = buildLantern(tier, rng)
    // the fount shades the desk right under the lantern
    const shade = new THREE.Mesh(
      new THREE.PlaneGeometry(0.3, 0.3).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ map: blobTexture(64), transparent: true, depthWrite: false, opacity: 0.85 }),
    )
    shade.position.set(SPOTS.lamp.x, 0.0007, SPOTS.lamp.z)
    const light = createWarmLight({ tier, color: pal.lamp, position: FLAME, intensity: 1.1, glow: 'flame', flicker: 0.55 })
    const point = light.group.children.find((o) => (o as THREE.PointLight).isPointLight) as THREE.PointLight | undefined
    const i0 = point?.intensity || 1

    root.add(statics, desk.group, outside, lantern.group, shade, win.latch, light.group)
    scene.add(root)

    const glassEmissive = lantern.glass.emissiveIntensity
    return {
      update(t) {
        light.update(t)
        // the tin and glass brighten and dim with the flame (and with the caught beat)
        const k = point ? Math.min(1.3, point.intensity / i0) : 1
        lantern.body.color.setScalar(0.3 + 0.7 * k)
        lantern.glass.emissiveIntensity = glassEmissive * k
        // the loose latch hook stirs in the night air; it casts no shadow
        const sec = t / 1000
        win.latch.rotation.z = 0.07 * Math.sin(sec * 1.9) + 0.04 * Math.sin(sec * 0.61 + 1.3) * Math.sin(sec * 3.7)
      },
      dispose() {
        scene.remove(root)
        disposeTree(root)
      },
    }
  },
}

export default lahore1929
