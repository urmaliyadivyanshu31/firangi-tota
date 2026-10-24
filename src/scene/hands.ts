// The player's two hands, for screwing up the read paper and dropping it in the basket: warm brown,
// lit by the room like everything else on the desk, in the sleeve of each chapter's persona (an
// angarkha in 1857, a kurta in 1929, khadi rolled up in 1942, a shirt cuff under a coat in 1947).
//
// A hand is one seamless skin grown from a distance field: a broad palm with the thumb's ball and
// the little finger's pad, knuckles, a thumb that comes off the side of the palm near the wrist,
// four tapering fingers of three joints each, nails. It is meshed once per quality tier (surface
// nets) and bent on the GPU by a skeleton of seventeen bones, so posing costs nothing on the CPU.
// Both hands share the mesh; the left is the right one mirrored. Each hand and each sleeve is one
// draw call, and they cast no shadow unless the stage asks.
import * as THREE from 'three'
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js'
import type { EraId } from '../content/types'
import { material } from './props'
import { surfaceNets } from './surface-nets'
import type { QualityTier } from './types'

/** How big the hands are against the meshed one (about 17.5 cm from the wrist to the middle fingertip). */
export const HAND_SCALE = 0.94

/** The skin: the back of the hand, the lighter palm, the nails, the creases over the knuckles. */
export const SKIN = { back: 0x70482f, palm: 0xa27458, nail: 0xb98e78, knuckle: 0x4f3020 } as const

/** Where a hand is (its wrist, in its parent's frame) and how it holds itself. */
export interface HandPose {
  pos: THREE.Vector3
  quat: THREE.Quaternion
  /** 0 = fingers straight … 1 = a fist. About 0.15 is a hand at rest. */
  curl: number
  /** 0 = the thumb out to the side … 1 = across the palm. */
  thumb: number
  /** How far the fingers fan apart: 0 together, 1 as a hand at rest (the default), 1.6 spread wide. */
  spread?: number
}

export interface Hand {
  /** Its wrist: +y runs to the fingertips, +z out of the back of the hand, the palm faces -z. */
  root: THREE.Group
  set(p: HandPose): void
  /** Turns the forearm (and its sleeve) back toward `elbow` (a world point), bending the wrist. */
  aim(elbow: THREE.Vector3): void
}

export interface Hands {
  group: THREE.Group
  left: Hand
  right: Hand
  dispose(): void
}

/** The same pose for the other hand: mirrored across the plane x = 0 of the parent's frame. */
export function mirrorPose(p: HandPose, out: HandPose = { pos: new THREE.Vector3(), quat: new THREE.Quaternion(), curl: 0, thumb: 0 }): HandPose {
  out.pos.set(-p.pos.x, p.pos.y, p.pos.z)
  out.quat.set(p.quat.x, -p.quat.y, -p.quat.z, p.quat.w)
  out.curl = p.curl
  out.thumb = p.thumb
  if (p.spread === undefined) delete out.spread
  else out.spread = p.spread
  return out
}

/** A rotation whose +y is `y` and whose +z leans toward `zHint`. */
export function basisQuat(y: THREE.Vector3, zHint: THREE.Vector3, out = new THREE.Quaternion()): THREE.Quaternion {
  const yy = y.clone().normalize()
  const zz = zHint.clone().addScaledVector(yy, -zHint.dot(yy)).normalize()
  const xx = new THREE.Vector3().crossVectors(yy, zz)
  return out.setFromRotationMatrix(new THREE.Matrix4().makeBasis(xx, yy, zz))
}

// ---------------------------------------------------------------- the hand's shape (a right hand)

type V3 = [number, number, number]

/** A finger or the thumb, straight, as it is meshed: three bones from its base joint to the tip. */
interface Digit {
  /** The base joint: the knuckle of a finger, the thumb's root deep in its ball near the wrist. */
  base: V3
  /** Along the digit, its nail side, and across it (dir × back): an orthonormal frame. */
  dir: V3
  back: V3
  side: V3
  /** The three bones' lengths (the last to the tip of the pad). */
  len: [number, number, number]
  /** The radius at the base, the two joints and the tip (across; the thickness is `flat` of it). */
  r: [number, number, number, number]
  flat: number
  /** How softly it grows out of the palm (m). */
  blend: number
}

const norm = (v: V3): V3 => {
  const l = Math.hypot(v[0], v[1], v[2])
  return [v[0] / l, v[1] / l, v[2] / l]
}
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const ortho = (v: V3, to: V3): V3 => {
  const d = v[0] * to[0] + v[1] * to[1] + v[2] * to[2]
  return norm([v[0] - to[0] * d, v[1] - to[1] * d, v[2] - to[2] * d])
}

/** A finger meshed fanned out a little (so neighbours are meshed apart); the pose brings it in. */
const finger = (x: number, y: number, splay: number, len: [number, number, number], r: [number, number, number, number]): Digit => {
  const dir: V3 = [-Math.sin(splay), Math.cos(splay), 0]
  const back: V3 = [0, 0, 1]
  return { base: [x, y, 0.0006], dir, back, side: cross(dir, back), len, r, flat: 0.84, blend: 0.0068 }
}
/** How far apart each finger is meshed (radians about the back of the hand; + leans to the thumb). */
const MESH_SPLAY = [0.17, 0.04, -0.1, -0.26] as const
/** …and how far apart they sit on a hand at rest. */
const REST_SPLAY = [0.06, 0.012, -0.03, -0.085] as const
const FINGERS: Digit[] = [
  finger(-0.0272, 0.0905, MESH_SPLAY[0], [0.039, 0.0238, 0.0205], [0.0097, 0.0088, 0.0081, 0.0073]),
  finger(-0.0089, 0.0935, MESH_SPLAY[1], [0.0432, 0.027, 0.0214], [0.0101, 0.0092, 0.0084, 0.0076]),
  finger(0.0094, 0.0905, MESH_SPLAY[2], [0.0404, 0.0256, 0.0204], [0.0095, 0.0087, 0.0079, 0.0071]),
  finger(0.0266, 0.0832, MESH_SPLAY[3], [0.0318, 0.0195, 0.0181], [0.0084, 0.0076, 0.007, 0.0063]),
]
const THUMB: Digit = (() => {
  const dir = norm([-0.6, 0.7, -0.38])
  const back = ortho([-0.42, -0.12, 0.9], dir)
  return { base: [-0.0185, 0.0105, -0.0045], dir, back, side: cross(dir, back), len: [0.04, 0.031, 0.027], r: [0.0136, 0.0119, 0.0108, 0.0089], flat: 0.9, blend: 0.0125 }
})()
const DIGITS: Digit[] = [...FINGERS, THUMB]
/** The wrist bends here; the forearm and its sleeve turn about it. */
const WRIST_AT = -0.004
/** The sleeve's mouth, a little up the wrist from the palm. */
const CUFF_AT = -0.016
/** Bones: 0 the wrist (the palm), 1–12 the fingers' three each, 13–15 the thumb's, 16 the forearm. */
const FOREARM = 16
const BONES = 17

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x)
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}
const smin = (a: number, b: number, k: number) => {
  const h = Math.max(k - Math.abs(a - b), 0) / k
  return Math.min(a, b) - h * h * k * 0.25
}

/** A rounded cone along +y from radius r1 at 0 to r2 at h, in (distance from the axis, height). */
function roundCone(q: number, y: number, r1: number, r2: number, h: number): number {
  const b = (r1 - r2) / h
  const a = Math.sqrt(1 - b * b)
  const k = -b * q + a * y
  if (k < 0) return Math.hypot(q, y) - r1
  if (k > a * h) return Math.hypot(q, y - h) - r2
  return a * q + b * y - r1
}

/** An ellipsoid's distance (close to true near its surface). */
function ellipsoid(x: number, y: number, z: number, rx: number, ry: number, rz: number): number {
  const k0 = Math.hypot(x / rx, y / ry, z / rz)
  const k1 = Math.hypot(x / (rx * rx), y / (ry * ry), z / (rz * rz))
  return k1 > 0 ? (k0 * (k0 - 1)) / k1 : -Math.min(rx, ry, rz)
}

/** A digit's distance; `far` skips it when the point is clearly nowhere near. */
function digitDist(d: Digit, x: number, y: number, z: number, far = true): number {
  const px = x - d.base[0]
  const py = y - d.base[1]
  const pz = z - d.base[2]
  const v = px * d.dir[0] + py * d.dir[1] + pz * d.dir[2]
  const u = px * d.side[0] + py * d.side[1] + pz * d.side[2]
  const w = (px * d.back[0] + py * d.back[1] + pz * d.back[2]) / d.flat
  const q = Math.hypot(u, w)
  const total = d.len[0] + d.len[1] + d.len[2]
  if (far && (v < -0.03 || v > total + 0.024 || q > 0.032)) return 1
  let best = Infinity
  let s = 0
  for (let j = 0; j < 3; j++) {
    const h = d.len[j]!
    best = Math.min(best, roundCone(q, v - s, d.r[j]!, d.r[j + 1]!, h))
    s += h
  }
  return best
}

/** A pad of the palm: an ellipsoid at `c` with radii `r`, turned by `a` about the back of the hand. */
interface Pad {
  c: V3
  r: V3
  a: number
}
const THENAR: Pad = { c: [-0.0195, 0.03, -0.0078], r: [0.0168, 0.0295, 0.0138], a: 0.55 }
const HYPO: Pad = { c: [0.0255, 0.036, -0.0058], r: [0.0128, 0.032, 0.0118], a: -0.08 }

/** The palm and the wrist, without the digits. */
function palmDist(x: number, y: number, z: number): number {
  // nowhere near: the distance to its box will do (only the sign and the surface matter)
  const ox = Math.max(Math.abs(x) - 0.062, 0)
  const oy = Math.max(-0.075 - y, y - 0.112, 0)
  const oz = Math.max(-0.036 - z, z - 0.032, 0)
  const out = Math.hypot(ox, oy, oz)
  if (out > 0.014) return out
  // the slab: wider and a little thinner toward the knuckles, its back arched across
  const t = clamp01(y / 0.092)
  const bx = 0.0305 + 0.0125 * t
  const bz = 0.0148 - 0.0024 * t
  const xn = Math.max(-1, Math.min(1, x / bx))
  const zz = z - 0.0026 * (1 - xn * xn) - 0.0006
  const r = 0.0115
  const qx = Math.abs(x) - bx + r
  const qy = Math.abs(y - 0.0465) - 0.0465 + r
  const qz = Math.abs(zz) - bz + r
  let d = Math.hypot(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qy, qz), 0) - r
  // the wrist, an oval running up into the sleeve
  const wy = y - Math.max(-0.075, Math.min(0.012, y))
  d = smin(d, ellipsoid(x, wy, z - 0.0005, 0.0282, 0.0282, 0.0198), 0.016)
  // the ball of the thumb and the little finger's pad, and the pads under the fingers
  const ell = (e: Pad) => {
    const px = x - e.c[0]
    const py = y - e.c[1]
    const ca = Math.cos(e.a)
    const sa = Math.sin(e.a)
    return ellipsoid(px * ca + py * sa, -px * sa + py * ca, z - e.c[2], e.r[0], e.r[1], e.r[2])
  }
  d = smin(d, ell(THENAR), 0.011)
  d = smin(d, ell(HYPO), 0.01)
  d = smin(d, ellipsoid(x + 0.001, y - 0.086, z + 0.0074, 0.034, 0.0095, 0.0068), 0.009)
  // the knuckles, standing up on the back of the hand
  for (const f of FINGERS) d = smin(d, Math.hypot(x - f.base[0], y - f.base[1] + 0.0042, z - 0.0066) - 0.0083, 0.006)
  // a soft hollow in the middle of the palm
  const hollow = Math.hypot(x - 0.002, y - 0.05, z + 0.0268) - 0.0146
  return -smin(-d, hollow, 0.008)
}

/**
 * The whole hand: the thumb grows out of the palm, then each finger out of what is there, so the
 * web between the thumb and the index is skin, as is the little web at each finger's root (beyond
 * it the fingers are meshed fanned apart, and never melt together).
 */
function handDist(x: number, y: number, z: number): number {
  let d = palmDist(x, y, z)
  for (let i = DIGITS.length - 1; i >= 0; i--) {
    const g = DIGITS[i]!
    const f = digitDist(g, x, y, z)
    if (f < 1) d = smin(d, f, g.blend)
  }
  return d
}

/** The grid each tier meshes on (m): a finer skin on better phones. */
const CELL: Record<QualityTier, number> = { high: 0.003, mid: 0.0035, low: 0.0043 }
const BOX = { min: [-0.094, -0.058, -0.056] as const, max: [0.076, 0.196, 0.03] as const }

interface BuiltHand {
  geo: THREE.BufferGeometry
}
const built = new Map<QualityTier, BuiltHand>()

const tmpC = new THREE.Color()
const tmpC2 = new THREE.Color()

/** The hand's skin for a tier: meshed, tied to its bones, and coloured. Made once and shared. */
function handGeometry(tier: QualityTier): THREE.BufferGeometry {
  const have = built.get(tier)
  if (have) return have.geo
  const net = surfaceNets(handDist, BOX.min, BOX.max, CELL[tier], 1)
  const n = net.positions.length / 3
  const skinIndex = new Uint16Array(n * 4)
  const skinWeight = new Float32Array(n * 4)
  const color = new Float32Array(n * 3)
  const nails = tier !== 'low'
  const knuckleCol = new THREE.Color(SKIN.knuckle)
  const nailCol = new THREE.Color(SKIN.nail)
  const cand: [number, number][] = []
  for (let i = 0; i < n; i++) {
    const x = net.positions[i * 3]!
    const y = net.positions[i * 3 + 1]!
    const z = net.positions[i * 3 + 2]!
    const nx = net.normals[i * 3]!
    const ny = net.normals[i * 3 + 1]!
    const nz = net.normals[i * 3 + 2]!
    // the digit this point belongs to, and how far along it
    let gi = 0
    let gd = Infinity
    for (let k = 0; k < DIGITS.length; k++) {
      const dd = digitDist(DIGITS[k]!, x, y, z, false)
      if (dd < gd) {
        gd = dd
        gi = k
      }
    }
    const g = DIGITS[gi]!
    const px = x - g.base[0]
    const py = y - g.base[1]
    const pz = z - g.base[2]
    const v = px * g.dir[0] + py * g.dir[1] + pz * g.dir[2]
    const u = px * g.side[0] + py * g.side[1] + pz * g.side[2]
    const w = px * g.back[0] + py * g.back[1] + pz * g.back[2]
    const thumb = gi === 4
    const [l0, l1, l2] = g.len
    // the skin over each joint follows both bones, so the joints bend smoothly
    const s0 = thumb ? smoothstep(0.0, 0.03, v) : smoothstep(-0.008, 0.008, v)
    const s1 = smoothstep(l0 - 0.006, l0 + 0.004, v)
    const s2 = smoothstep(l0 + l1 - 0.005, l0 + l1 + 0.003, v)
    const fa = 1 - smoothstep(-0.022, 0.002, y)
    const b0 = thumb ? 13 : 1 + gi * 3
    cand.length = 0
    cand.push([0, (1 - s0) * (1 - fa)], [b0, (s0 - s1) * (1 - fa)], [b0 + 1, (s1 - s2) * (1 - fa)], [b0 + 2, s2 * (1 - fa)], [FOREARM, fa])
    cand.sort((a, b) => b[1] - a[1])
    let sum = 0
    for (let k = 0; k < 4; k++) sum += cand[k]![1]
    for (let k = 0; k < 4; k++) {
      skinIndex[i * 4 + k] = cand[k]![0]
      skinWeight[i * 4 + k] = sum > 0 ? cand[k]![1] / sum : k === 0 ? 1 : 0
    }
    // the colour: the back of the hand darker than the palm, creases over the joints, the nails
    const onDigit = s0 > 0.5
    const dorsal = onDigit ? nx * g.back[0] + ny * g.back[1] + nz * g.back[2] : nz
    const c = tmpC.setHex(SKIN.palm).lerp(tmpC2.setHex(SKIN.back), smoothstep(-0.38, 0.32, dorsal))
    if (onDigit) {
      for (const j of [l0, l0 + l1]) {
        const near = Math.exp(-(((v - j) / 0.0027) ** 2))
        if (dorsal > 0) c.lerp(knuckleCol, 0.32 * near * smoothstep(0.15, 0.6, dorsal))
        else c.multiplyScalar(1 - 0.16 * near * smoothstep(-0.15, -0.6, dorsal))
      }
      if (nails) {
        const along = (v - l0 - l1) / l2
        const rr = g.r[2]! + (g.r[3]! - g.r[2]!) * clamp01(along)
        // an oval on the back of the last joint, short of the tip
        const m = smoothstep(0.26, 0.38, along) * (1 - smoothstep(0.84, 0.95, along)) * smoothstep(0.3, 0.55, w / (rr * g.flat)) * (1 - smoothstep(0.42, 0.6, Math.abs(u) / rr))
        if (m > 0) c.lerp(nailCol, 0.75 * m)
      }
    } else if (nz > 0.2) {
      // the back of the hand: the knuckles catch a darker tone, and the tendons from each knuckle
      // toward the wrist stand a little lighter, with the hollows between them darker
      if (!thumb && v > -0.016) c.lerp(knuckleCol, 0.18 * smoothstep(-0.016, -0.004, v) * smoothstep(0.2, 0.7, nz))
      if (y > 0.012 && y < 0.09) {
        let near = 0
        for (const f of FINGERS) {
          const k = clamp01((f.base[1] - y) / (f.base[1] - 0.012))
          const tx = f.base[0] * (1 - 0.45 * k)
          near = Math.max(near, Math.exp(-(((x - tx) / 0.0034) ** 2)))
        }
        const along = smoothstep(0.012, 0.035, y) * (1 - smoothstep(0.075, 0.09, y)) * smoothstep(0.2, 0.7, nz)
        c.multiplyScalar(1 + along * (0.07 * near - 0.05 * (1 - near)))
      }
    }
    color[i * 3] = c.r
    color[i * 3 + 1] = c.g
    color[i * 3 + 2] = c.b
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(net.positions, 3))
  geo.setAttribute('normal', new THREE.BufferAttribute(net.normals, 3))
  geo.setAttribute('color', new THREE.BufferAttribute(color, 3))
  geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndex, 4))
  geo.setAttribute('skinWeight', new THREE.BufferAttribute(skinWeight, 4))
  geo.setIndex(new THREE.BufferAttribute(n < 65536 ? Uint16Array.from(net.indices) : net.indices, 1))
  geo.computeBoundingSphere()
  built.set(tier, { geo })
  return geo
}

// ---------------------------------------------------------------- the sleeves

interface SleeveSpec {
  /** The lathe profile from the mouth up the forearm: [radius, distance] (m). */
  profile: [number, number][]
  /** Where the cloth starts to fall in loose folds up the arm (m). */
  folds: number
  /** The cloth's colour at a distance up the sleeve and an angle round it (`rnd` 0..1 per point). */
  color(y: number, a: number, rnd: number, c: THREE.Color): void
  /** Extra pieces (a button), in the sleeve's frame. */
  extra?: (tier: QualityTier) => THREE.BufferGeometry[]
}

const cloth = (hex: number, c: THREE.Color, rnd: number, rough: number) => {
  c.setHex(hex)
  return c.multiplyScalar(1 - rough / 2 + rough * rnd)
}

/** The forearm's length in its sleeve: past it the arm is in the shade of the body, out of the shot. */
const SLEEVE_LEN = 0.24

const SLEEVES: Record<EraId, SleeveSpec> = {
  // a white angarkha: fitted at the wrist in fine gathers, edged with a band of zari and a maroon thread
  'delhi-1857': {
    profile: (() => {
      const p: [number, number][] = [[0.0262, -0.002], [0.0302, 0], [0.0307, 0.006], [0.0307, 0.012], [0.0298, 0.0155], [0.0292, 0.018]]
      for (let i = 0; i < 12; i++) p.push([0.0292 + (i % 2 ? 0.0028 : 0) + i * 0.0003, 0.022 + i * 0.012])
      p.push([0.0372, SLEEVE_LEN], [0, SLEEVE_LEN + 0.004])
      return p
    })(),
    folds: 0.17,
    color(y, _a, rnd, c) {
      if (y < 0.0125) cloth(0xc89b46, c, rnd, 0.22)
      else if (y < 0.0155) cloth(0x7b2531, c, rnd, 0.1)
      else cloth(0xe2d9c7, c, rnd, 0.06)
    },
  },
  // a cream kurta: a loose, plain sleeve with a double line of stitching round the hem
  'lahore-1929': {
    profile: [[0.0332, -0.003], [0.038, 0], [0.0386, 0.004], [0.0386, 0.03], [0.04, 0.12], [0.0418, SLEEVE_LEN], [0, SLEEVE_LEN + 0.004]],
    folds: 0.02,
    color(y, _a, rnd, c) {
      const stitch = (y > 0.0075 && y < 0.0092) || (y > 0.0122 && y < 0.0139)
      cloth(stitch ? 0xa39478 : 0xd8cbb0, c, rnd, 0.07)
    },
  },
  // khadi, the sleeve rolled up past the wrist: bare forearm, then the coarse homespun roll
  'bombay-1942': {
    profile: [[0.0248, 0], [0.0256, 0.03], [0.027, 0.058], [0.0279, 0.061], [0.0342, 0.0645], [0.0388, 0.073], [0.0398, 0.084], [0.0366, 0.094], [0.0335, 0.098], [0.0356, 0.101], [0.0398, SLEEVE_LEN], [0, SLEEVE_LEN + 0.004]],
    folds: 0.11,
    color(y, a, rnd, c) {
      if (y < 0.06) {
        c.setHex(SKIN.back).lerp(tmpC2.setHex(SKIN.palm), 0.25 + 0.2 * Math.cos(a))
        return
      }
      // slubs: the hand-spun thread is thicker and paler in places
      const slub = Math.sin(y * 410 + Math.sin(a * 3) * 2) > 0.82 ? 0.06 : 0
      cloth(0xcfc09c, c, rnd, 0.16).offsetHSL(0, 0, slub)
    },
  },
  // a starched white shirt cuff with its button, under the sleeve of a dark coat
  'delhi-1947': {
    profile: [[0.0256, -0.002], [0.0294, 0], [0.0299, 0.003], [0.0299, 0.029], [0.029, 0.033], [0.0326, 0.036], [0.0332, 0.044], [0.0336, 0.0462], [0.0405, 0.0472], [0.0424, 0.0505], [0.0426, 0.06], [0.0446, SLEEVE_LEN], [0, SLEEVE_LEN + 0.004]],
    folds: 0.065,
    color(y, _a, rnd, c) {
      if (y < 0.0465) cloth(y > 0.0278 && y < 0.0312 ? 0xd6d2c8 : 0xf0ece3, c, rnd, 0.03)
      else cloth(y > 0.0525 && y < 0.0545 ? 0x4c5262 : 0x30364a, c, rnd, 0.05)
    },
    extra(tier) {
      const b = new THREE.CylinderGeometry(0.0033, 0.0033, 0.0024, tier === 'low' ? 6 : 10)
      b.deleteAttribute('uv')
      // on the outer side of the cuff, its face turned out
      b.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(0.0305, 0.015, 0), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2), new THREE.Vector3(1, 1, 1)))
      paint(b, (c) => c.setHex(0xddd3c0))
      return [b]
    },
  },
}

function paint(geo: THREE.BufferGeometry, fn: (c: THREE.Color, p: THREE.Vector3) => void): void {
  const pos = geo.getAttribute('position') as THREE.BufferAttribute
  const col = new Float32Array(pos.count * 3)
  const p = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    fn(tmpC, p.fromBufferAttribute(pos, i))
    col[i * 3] = tmpC.r
    col[i * 3 + 1] = tmpC.g
    col[i * 3 + 2] = tmpC.b
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3))
}

function buildSleeve(era: EraId, tier: QualityTier): THREE.BufferGeometry {
  const spec = SLEEVES[era]
  // up the arm the profile gets a ring every 2.5 cm, so the folds have points to fall in
  const pts: THREE.Vector2[] = []
  spec.profile.forEach(([r, y], i) => {
    const prev = spec.profile[i - 1]
    if (prev && y - prev[1] > 0.03) {
      const n = Math.ceil((y - prev[1]) / 0.025)
      for (let k = 1; k < n; k++) pts.push(new THREE.Vector2(prev[0] + ((r - prev[0]) * k) / n, prev[1] + ((y - prev[1]) * k) / n))
    }
    pts.push(new THREE.Vector2(r, y))
  })
  const lathe = new THREE.LatheGeometry(pts, tier === 'low' ? 10 : 18)
  lathe.deleteAttribute('uv')
  const geo = mergeVertices(lathe)
  lathe.dispose()
  // loose cloth: soft folds that wind up the forearm
  const p = geo.getAttribute('position') as THREE.BufferAttribute
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i)
    const y = p.getY(i)
    const z = p.getZ(i)
    const k = smoothstep(spec.folds, spec.folds + 0.06, y)
    if (k <= 0) continue
    const a = Math.atan2(x, z)
    const f = 1 + k * (0.045 * Math.sin(a * 3 + y * 34) + 0.025 * Math.sin(a * 5 - y * 52 + 1.3))
    p.setXYZ(i, x * f, y, z * f)
  }
  geo.computeVertexNormals()
  let seed = 9
  const rnd = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  paint(geo, (c, q) => {
    spec.color(q.y, Math.atan2(q.x, q.z), rnd(), c)
    // the forearm falls into the shade of the body toward the elbow, so the sleeve never takes the shot
    c.multiplyScalar(1 - 0.86 * smoothstep(0.035, 0.19, q.y))
  })
  const extra = spec.extra?.(tier) ?? []
  if (!extra.length) return geo
  const all = [geo, ...extra]
  const pos: number[] = []
  const nrm: number[] = []
  const col: number[] = []
  const idx: number[] = []
  for (const g of all) {
    const off = pos.length / 3
    const gp = g.getAttribute('position') as THREE.BufferAttribute
    const gn = g.getAttribute('normal') as THREE.BufferAttribute
    const gc = g.getAttribute('color') as THREE.BufferAttribute
    for (let i = 0; i < gp.count; i++) {
      pos.push(gp.getX(i), gp.getY(i), gp.getZ(i))
      nrm.push(gn.getX(i), gn.getY(i), gn.getZ(i))
      col.push(gc.getX(i), gc.getY(i), gc.getZ(i))
    }
    const index = g.getIndex()
    if (index) for (let i = 0; i < index.count; i++) idx.push(off + index.getX(i))
    else for (let i = 0; i < gp.count; i++) idx.push(off + i)
    g.dispose()
  }
  const out = new THREE.BufferGeometry()
  out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  out.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3))
  out.setAttribute('color', new THREE.Float32BufferAttribute(col, 3))
  out.setIndex(idx)
  return out
}

// ---------------------------------------------------------------- posing

const X_AXIS = new THREE.Vector3(1, 0, 0)
const Z_AXIS = new THREE.Vector3(0, 0, 1)
const toVec = (v: V3) => new THREE.Vector3(v[0], v[1], v[2])
const restQuat = (d: Digit) => new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(toVec(d.side), toVec(d.dir), toVec(d.back)))
/** The thumb out beside the hand, and across the palm toward the little finger's root. */
const THUMB_OPEN = basisQuat(new THREE.Vector3(-0.56, 0.74, -0.37), new THREE.Vector3(-0.45, -0.1, 0.9))
const THUMB_ACROSS = basisQuat(new THREE.Vector3(-0.12, 0.6, -0.79), new THREE.Vector3(-0.95, -0.12, 0.25))

function createHand(tier: QualityTier, era: EraId, skinMat: THREE.Material, sleeveMat: THREE.Material, left: boolean): Hand & { dispose(): void } {
  const root = new THREE.Group()
  root.name = left ? 'hand-left' : 'hand-right'
  const mirror = new THREE.Group()
  mirror.scale.set(left ? -HAND_SCALE : HAND_SCALE, HAND_SCALE, HAND_SCALE)
  root.add(mirror)

  // the skeleton in the pose the skin was meshed in
  const bones: THREE.Bone[] = Array.from({ length: BONES }, () => new THREE.Bone())
  const wrist = bones[0]!
  wrist.name = 'wrist'
  const rest: THREE.Quaternion[] = []
  DIGITS.forEach((d, di) => {
    const b0 = di === 4 ? 13 : 1 + di * 3
    let parent = wrist
    for (let j = 0; j < 3; j++) {
      const b = bones[b0 + j]!
      if (j === 0) {
        b.position.set(d.base[0], d.base[1], d.base[2])
        b.quaternion.copy(restQuat(d))
      } else b.position.set(0, d.len[j - 1]!, 0)
      parent.add(b)
      parent = b
    }
    rest.push(restQuat(d))
  })
  const forearm = bones[FOREARM]!
  forearm.name = 'forearm'
  forearm.position.set(0, WRIST_AT, 0)
  wrist.add(forearm)
  const skin = new THREE.SkinnedMesh(handGeometry(tier), skinMat)
  skin.name = 'skin'
  skin.frustumCulled = false
  skin.add(wrist)
  skin.bind(new THREE.Skeleton(bones))

  const sleeve = new THREE.Mesh(buildSleeve(era, tier), sleeveMat)
  sleeve.name = 'sleeve'
  sleeve.frustumCulled = false
  sleeve.position.set(0, CUFF_AT - WRIST_AT, 0)
  sleeve.quaternion.setFromAxisAngle(Z_AXIS, Math.PI) // up the forearm
  forearm.add(sleeve)
  mirror.add(skin)

  const q = new THREE.Quaternion()
  const qz = new THREE.Quaternion()
  const tmpE = new THREE.Vector3()
  const dir = new THREE.Vector3()
  const xs = new THREE.Vector3()
  const zs = new THREE.Vector3()
  const ys = new THREE.Vector3()
  const down = new THREE.Vector3(0, -1, 0)
  const basis = new THREE.Matrix4()
  return {
    root,
    set(p) {
      root.position.copy(p.pos)
      root.quaternion.copy(p.quat)
      const curl = clamp01(p.curl)
      const spread = p.spread ?? 1
      FINGERS.forEach((_, fi) => {
        // the little finger folds a touch further than the index, as a real hand does
        const c = Math.min(1, curl * (1 + 0.06 * fi))
        const flex = [0.1 + c * 1.32, 0.16 + c * 1.56, 0.08 + c * 1.02]
        const splay = REST_SPLAY[fi]! * spread * (1 - 0.65 * c)
        const b0 = 1 + fi * 3
        // fanned about the back of the hand from where it was meshed, then bent at the knuckle
        bones[b0]!.quaternion.copy(rest[fi]!).premultiply(qz.setFromAxisAngle(Z_AXIS, splay - MESH_SPLAY[fi]!)).multiply(q.setFromAxisAngle(X_AXIS, -flex[0]!))
        bones[b0 + 1]!.quaternion.setFromAxisAngle(X_AXIS, -flex[1]!)
        bones[b0 + 2]!.quaternion.setFromAxisAngle(X_AXIS, -flex[2]!)
      })
      const t = clamp01(p.thumb)
      bones[13]!.quaternion.slerpQuaternions(THUMB_OPEN, THUMB_ACROSS, t)
      bones[14]!.quaternion.setFromAxisAngle(X_AXIS, -(0.1 + 0.55 * t))
      bones[15]!.quaternion.setFromAxisAngle(X_AXIS, -(0.12 + 0.6 * t))
    },
    aim(elbow) {
      root.updateWorldMatrix(true, false)
      mirror.updateWorldMatrix(false, false)
      tmpE.copy(elbow)
      mirror.worldToLocal(tmpE)
      dir.set(tmpE.x, tmpE.y - WRIST_AT, tmpE.z).normalize()
      // the wrist bends, but never past about fifty-five degrees: beyond that the forearm follows the hand
      const bend = dir.angleTo(down)
      if (bend > 0.95) dir.lerp(down, 1 - 0.95 / bend).normalize()
      // the forearm bone's +y runs to the hand, so up the arm is its -y
      ys.copy(dir).negate()
      xs.copy(X_AXIS).addScaledVector(ys, -X_AXIS.dot(ys)).normalize()
      zs.crossVectors(xs, ys)
      forearm.quaternion.setFromRotationMatrix(basis.makeBasis(xs, ys, zs))
    },
    dispose() {
      sleeve.geometry.dispose()
      skin.skeleton.dispose()
    },
  }
}

/**
 * The two hands, hidden until a toss. The left is the right one mirrored (its pose comes from
 * mirrorPose), so the two always match.
 */
export function createHands(o: { tier: QualityTier; era: EraId }): Hands {
  const skinMat = material(o.tier, { color: 0xffffff, shininess: 14, specular: 0x1c140f }) as THREE.MeshLambertMaterial
  skinMat.vertexColors = true
  // a little warmth of its own, so a hand never goes black in the corner of a dim room
  skinMat.emissive.setHex(0x120a06)
  const sleeveMat = material(o.tier, { color: 0xffffff, side: THREE.DoubleSide, shininess: 4 }) as THREE.MeshLambertMaterial
  sleeveMat.vertexColors = true
  sleeveMat.emissive.setHex(0x070504)
  const left = createHand(o.tier, o.era, skinMat, sleeveMat, true)
  const right = createHand(o.tier, o.era, skinMat, sleeveMat, false)
  const rest: HandPose = { pos: new THREE.Vector3(), quat: new THREE.Quaternion(), curl: 0.15, thumb: 0.2 }
  left.set(rest)
  right.set(rest)
  const group = new THREE.Group()
  group.name = 'hands'
  group.visible = false
  group.add(left.root, right.root)
  return {
    group,
    left,
    right,
    dispose() {
      left.dispose()
      right.dispose()
      // the skin's mesh is shared and kept for the next room; only its GPU copy goes
      handGeometry(o.tier).dispose()
      skinMat.dispose()
      sleeveMat.dispose()
    },
  }
}
