// The player's two hands, for screwing up the read paper and tossing it in the basket: soft,
// low-poly, warm brown, lit by the room like everything else on the desk, in the sleeve of each
// chapter's persona (an angarkha in 1857, a kurta in 1929, khadi rolled up in 1942, a shirt cuff
// under a coat in 1947). Each hand is one mesh (the fingers are posed on the CPU, about seven
// hundred points) and each sleeve another, so both hands cost four draw calls and cast no shadow.
import * as THREE from 'three'
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js'
import type { EraId } from '../content/types'
import { material } from './props'
import type { QualityTier } from './types'

/** The skin: the back of the hand, the lighter palm, the nails, the creases over the knuckles. */
export const SKIN = { back: 0x6c4632, palm: 0x9a7059, nail: 0xc39a86, knuckle: 0x553424 } as const

/** Where a hand is (its wrist, in its parent's frame) and how it holds itself. */
export interface HandPose {
  pos: THREE.Vector3
  quat: THREE.Quaternion
  /** 0 = fingers open … 1 = a fist. */
  curl: number
  /** 0 = the thumb out to the side … 1 = across the palm. */
  thumb: number
}

export interface Hand {
  /** Its wrist: +y runs to the fingertips, +z out of the back of the hand, the palm faces -z. */
  root: THREE.Group
  set(p: HandPose): void
  /** Turns the sleeve back along the forearm, toward `elbow` (a world point under the eye). */
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

interface Finger {
  root: [number, number, number]
  len: [number, number, number]
  r: [number, number]
  splay: number
}
// the thumb is on -x; index to little finger run along the knuckles from -x to +x
const FINGERS: Finger[] = [
  { root: [-0.0262, 0.089, 0.002], len: [0.037, 0.023, 0.019], r: [0.0097, 0.0083], splay: 0.035 },
  { root: [-0.0087, 0.093, 0.002], len: [0.041, 0.026, 0.02], r: [0.0101, 0.0086], splay: 0.008 },
  { root: [0.0088, 0.0905, 0.002], len: [0.038, 0.024, 0.019], r: [0.0096, 0.0082], splay: -0.02 },
  { root: [0.0258, 0.0835, 0.002], len: [0.03, 0.018, 0.016], r: [0.0085, 0.0072], splay: -0.05 },
]
const THUMB = { root: [-0.0245, 0.017, -0.006] as [number, number, number], len: [0.039, 0.03, 0.025] as [number, number, number], r: [0.0122, 0.0095] as [number, number] }
const THUMB_OPEN = basisQuat(new THREE.Vector3(-0.62, 0.7, -0.36), new THREE.Vector3(-0.55, -0.35, 0.75))
const THUMB_ACROSS = basisQuat(new THREE.Vector3(-0.08, 0.84, -0.55), new THREE.Vector3(-0.92, 0.1, 0.38))
/** The sleeve's mouth, a little up the wrist from the palm. */
const CUFF_AT = new THREE.Vector3(0, -0.016, 0)

const BONES = 1 + FINGERS.length * 3 + 3

interface Part {
  bone: number
  start: number
  count: number
}

const tmpC = new THREE.Color()
const tmpC2 = new THREE.Color()
const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/** Colours a part's points: the palm side lighter than the back, the joints a shade darker. */
function paint(geo: THREE.BufferGeometry, fn: (p: THREE.Vector3, n: THREE.Vector3, c: THREE.Color) => void): void {
  const pos = geo.getAttribute('position') as THREE.BufferAttribute
  const nrm = geo.getAttribute('normal') as THREE.BufferAttribute
  const col = new Float32Array(pos.count * 3)
  const p = new THREE.Vector3()
  const n = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    p.fromBufferAttribute(pos, i)
    n.fromBufferAttribute(nrm, i)
    fn(p, n, tmpC)
    col[i * 3] = tmpC.r
    col[i * 3 + 1] = tmpC.g
    col[i * 3 + 2] = tmpC.b
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3))
}

const skinAt = (nz: number, c: THREE.Color) => c.setHex(SKIN.palm).lerp(tmpC2.setHex(SKIN.back), smoothstep(-0.4, 0.35, nz))

/** The palm: a rounded slab, narrower at the wrist, with the thumb's and the little finger's pads. */
function palmParts(tier: QualityTier): THREE.BufferGeometry[] {
  const low = tier === 'low'
  const slab = new THREE.SphereGeometry(1, low ? 10 : 16, low ? 7 : 12)
  slab.deleteAttribute('uv')
  const p = slab.getAttribute('position') as THREE.BufferAttribute
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i)
    const y = p.getY(i)
    const z = p.getZ(i)
    const sx = Math.sign(x) * Math.pow(Math.abs(x), 0.6)
    const sy = Math.sign(y) * Math.pow(Math.abs(y), 0.72)
    const sz = Math.sign(z) * Math.pow(Math.abs(z), 0.95)
    const along = (sy + 1) / 2 // 0 at the wrist … 1 at the knuckles
    const hx = 0.031 + 0.0115 * along
    const hz = (0.0158 - 0.0034 * along) * (sz < 0 ? 1.1 : 1)
    // the back of the hand arches a little across
    p.setXYZ(i, sx * hx, 0.046 + sy * 0.047, sz * hz + 0.0028 * (1 - sx * sx) * (sz > 0 ? 1 : 0))
  }
  const palm = mergeVertices(slab)
  slab.dispose()
  palm.computeVertexNormals()
  const pad = (s: [number, number, number], at: [number, number, number], rz: number) => {
    const g = new THREE.SphereGeometry(1, low ? 8 : 10, low ? 6 : 8)
    g.deleteAttribute('uv')
    g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(...at), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), rz), new THREE.Vector3(...s)))
    return g
  }
  const thenar = pad([0.0185, 0.03, 0.0135], [-0.021, 0.029, -0.0055], -0.45)
  const hypo = pad([0.0125, 0.031, 0.0115], [0.0245, 0.037, -0.0045], 0.1)
  const wrist = new THREE.CylinderGeometry(0.0245, 0.0268, 0.05, low ? 9 : 12, 1, true)
  wrist.deleteAttribute('uv')
  wrist.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(0, -0.012, 0.0005), new THREE.Quaternion(), new THREE.Vector3(1, 1, 0.7)))
  for (const g of [palm, thenar, hypo, wrist]) paint(g, (_, n, c) => skinAt(n.z, c))
  return [palm, thenar, hypo, wrist]
}

/** One bone of a finger or the thumb: a capsule from its joint along +y, and a nail on the last. */
function segmentParts(tier: QualityTier, len: number, r: number, last: boolean): THREE.BufferGeometry[] {
  const low = tier === 'low'
  const cap = new THREE.CapsuleGeometry(r, len, low ? 2 : 3, low ? 6 : 8)
  cap.deleteAttribute('uv')
  cap.translate(0, len / 2, 0)
  paint(cap, (p, n, c) => {
    skinAt(n.z, c)
    // a crease over the joint on the back of the finger
    if (p.y < r * 0.4 && n.z > 0.5) c.lerp(tmpC2.setHex(SKIN.knuckle), 0.18)
  })
  const out: THREE.BufferGeometry[] = [cap]
  if (last && !low) {
    const nail = new THREE.SphereGeometry(1, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2)
    nail.deleteAttribute('uv')
    // a flattened cap on the back of the tip, rounded like a nail
    nail.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(0, len * 0.72, r * 0.58), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2), new THREE.Vector3(r * 0.66, r * 0.48, len * 0.48)))
    paint(nail, (_, __, c) => c.setHex(SKIN.nail))
    out.push(nail)
  }
  return out
}

/** The whole hand as one geometry, each part tied to a bone, ready to be posed. */
function buildHand(tier: QualityTier): { geo: THREE.BufferGeometry; base: Float32Array; baseN: Float32Array; parts: Part[] } {
  const groups: { bone: number; geos: THREE.BufferGeometry[] }[] = [{ bone: 0, geos: palmParts(tier) }]
  FINGERS.forEach((f, fi) => {
    for (let j = 0; j < 3; j++) {
      const r = f.r[0] + (f.r[1] - f.r[0]) * (j / 2)
      groups.push({ bone: 1 + fi * 3 + j, geos: segmentParts(tier, f.len[j] ?? 0.02, r, j === 2) })
    }
  })
  for (let j = 0; j < 3; j++) {
    const r = THUMB.r[0] + (THUMB.r[1] - THUMB.r[0]) * (j / 2)
    groups.push({ bone: 13 + j, geos: segmentParts(tier, THUMB.len[j] ?? 0.02, r, j === 2) })
  }
  const pos: number[] = []
  const nrm: number[] = []
  const col: number[] = []
  const idx: number[] = []
  const parts: Part[] = []
  for (const gr of groups) {
    const start = pos.length / 3
    for (const g of gr.geos) {
      const off = pos.length / 3
      const p = g.getAttribute('position') as THREE.BufferAttribute
      const n = g.getAttribute('normal') as THREE.BufferAttribute
      const c = g.getAttribute('color') as THREE.BufferAttribute
      for (let i = 0; i < p.count; i++) {
        pos.push(p.getX(i), p.getY(i), p.getZ(i))
        nrm.push(n.getX(i), n.getY(i), n.getZ(i))
        col.push(c.getX(i), c.getY(i), c.getZ(i))
      }
      const index = g.getIndex()
      if (index) for (let i = 0; i < index.count; i++) idx.push(off + index.getX(i))
      else for (let i = 0; i < p.count; i++) idx.push(off + i)
      g.dispose()
    }
    parts.push({ bone: gr.bone, start, count: pos.length / 3 - start })
  }
  const geo = new THREE.BufferGeometry()
  const base = new Float32Array(pos)
  const baseN = new Float32Array(nrm)
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3).setUsage(THREE.DynamicDrawUsage))
  geo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(nrm), 3).setUsage(THREE.DynamicDrawUsage))
  geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(col), 3))
  geo.setIndex(idx)
  return { geo, base, baseN, parts }
}

// ---------------------------------------------------------------- the sleeves

interface SleeveSpec {
  /** The lathe profile from the mouth up the forearm: [radius, distance] (m). */
  profile: [number, number][]
  /** Where the cloth starts to fall in loose folds up the arm (m). */
  folds: number
  /** The cloth's colour at a distance up the sleeve and an angle round it (`rnd` 0..1 per point). */
  color(y: number, a: number, rnd: number, c: THREE.Color): void
  /** How rough the cloth looks: per-point shade variation. */
  rough: number
  /** Extra pieces (a button), in the sleeve's frame. */
  extra?: (tier: QualityTier) => THREE.BufferGeometry[]
}

const cloth = (hex: number, c: THREE.Color, rnd: number, rough: number) => {
  c.setHex(hex)
  return c.multiplyScalar(1 - rough / 2 + rough * rnd)
}

const SLEEVES: Record<EraId, SleeveSpec> = {
  // a white angarkha: fitted at the wrist in fine gathers, edged with a band of zari and a maroon thread
  'delhi-1857': {
    profile: (() => {
      const p: [number, number][] = [[0.0272, -0.002], [0.0316, 0], [0.0321, 0.006], [0.0321, 0.012], [0.0312, 0.0155], [0.0306, 0.018]]
      for (let i = 0; i < 12; i++) p.push([0.0306 + (i % 2 ? 0.0034 : 0) + i * 0.0004, 0.022 + i * 0.012])
      p.push([0.04, 0.2], [0.046, 0.32], [0.05, 0.5])
      return p
    })(),
    folds: 0.17,
    rough: 0.06,
    color(y, _a, rnd, c) {
      if (y < 0.0125) cloth(0xc89b46, c, rnd, 0.22)
      else if (y < 0.0155) cloth(0x7b2531, c, rnd, 0.1)
      else cloth(0xefe8da, c, rnd, 0.06)
    },
  },
  // a cream kurta: a loose, plain sleeve with a double line of stitching round the hem
  'lahore-1929': {
    profile: [[0.0352, -0.003], [0.0404, 0], [0.0411, 0.004], [0.041, 0.03], [0.0428, 0.12], [0.0458, 0.25], [0.05, 0.5]],
    folds: 0.02,
    rough: 0.07,
    color(y, _a, rnd, c) {
      const stitch = (y > 0.0075 && y < 0.0092) || (y > 0.0122 && y < 0.0139)
      cloth(stitch ? 0xab9e84 : 0xe5dbc5, c, rnd, 0.07)
    },
  },
  // khadi, the sleeve rolled up past the wrist: bare forearm, then the coarse homespun roll
  'bombay-1942': {
    profile: [[0.0252, 0], [0.026, 0.03], [0.0275, 0.058], [0.0284, 0.061], [0.0352, 0.0645], [0.0402, 0.073], [0.0412, 0.084], [0.0378, 0.094], [0.0345, 0.098], [0.0368, 0.101], [0.041, 0.2], [0.0468, 0.5]],
    folds: 0.11,
    rough: 0.16,
    color(y, a, rnd, c) {
      if (y < 0.06) {
        c.setHex(SKIN.back).lerp(tmpC2.setHex(SKIN.palm), 0.25 + 0.2 * Math.cos(a))
        return
      }
      // slubs: the hand-spun thread is thicker and paler in places
      const slub = Math.sin(y * 410 + Math.sin(a * 3) * 2) > 0.82 ? 0.06 : 0
      cloth(0xd8caa8, c, rnd, 0.16).offsetHSL(0, 0, slub)
    },
  },
  // a starched white shirt cuff with its button, under the sleeve of a dark coat
  'delhi-1947': {
    profile: [[0.0262, -0.002], [0.0301, 0], [0.0306, 0.003], [0.0306, 0.029], [0.0297, 0.033], [0.0334, 0.036], [0.034, 0.044], [0.0344, 0.0462], [0.0416, 0.0472], [0.0436, 0.0505], [0.0438, 0.06], [0.0462, 0.2], [0.05, 0.5]],
    folds: 0.065,
    rough: 0.04,
    color(y, _a, rnd, c) {
      if (y < 0.0465) cloth(y > 0.0278 && y < 0.0312 ? 0xd6d2c8 : 0xf2efe7, c, rnd, 0.03)
      else cloth(y > 0.0525 && y < 0.0545 ? 0x4c5262 : 0x30364a, c, rnd, 0.05)
    },
    extra(tier) {
      const b = new THREE.CylinderGeometry(0.0034, 0.0034, 0.0024, tier === 'low' ? 6 : 10)
      b.deleteAttribute('uv')
      // on the outer side of the cuff, its face turned out
      b.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(0.0312, 0.015, 0), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2), new THREE.Vector3(1, 1, 1)))
      paint(b, (_, __, c) => c.setHex(0xddd3c0))
      return [b]
    },
  },
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
  // loose cloth: soft folds that wind up the forearm, and a slight sag on the underside
  const p = geo.getAttribute('position') as THREE.BufferAttribute
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i)
    const y = p.getY(i)
    const z = p.getZ(i)
    const k = smoothstep(spec.folds, spec.folds + 0.06, y)
    if (k <= 0) continue
    const a = Math.atan2(x, z)
    const f = 1 + k * (0.05 * Math.sin(a * 3 + y * 34) + 0.03 * Math.sin(a * 5 - y * 52 + 1.3))
    p.setXYZ(i, x * f, y, z * f)
  }
  geo.computeVertexNormals()
  let seed = 9
  const rnd = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  paint(geo, (q, _n, c) => {
    spec.color(q.y, Math.atan2(q.x, q.z), rnd(), c)
    // the forearm falls into the shade of the body toward the elbow
    c.multiplyScalar(1 - 0.5 * smoothstep(0.1, 0.36, q.y))
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
    const p = g.getAttribute('position') as THREE.BufferAttribute
    const n = g.getAttribute('normal') as THREE.BufferAttribute
    const c = g.getAttribute('color') as THREE.BufferAttribute
    for (let i = 0; i < p.count; i++) {
      pos.push(p.getX(i), p.getY(i), p.getZ(i))
      nrm.push(n.getX(i), n.getY(i), n.getZ(i))
      col.push(c.getX(i), c.getY(i), c.getZ(i))
    }
    const index = g.getIndex()
    if (index) for (let i = 0; i < index.count; i++) idx.push(off + index.getX(i))
    else for (let i = 0; i < p.count; i++) idx.push(off + i)
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

function createHand(tier: QualityTier, era: EraId, skinMat: THREE.Material, sleeveMat: THREE.Material, left: boolean): Hand & { dispose(): void } {
  const root = new THREE.Group()
  root.name = left ? 'hand-left' : 'hand-right'
  const mirror = new THREE.Group()
  if (left) mirror.scale.set(-1, 1, 1)
  root.add(mirror)
  const built = buildHand(tier)
  const skin = new THREE.Mesh(built.geo, skinMat)
  skin.name = 'skin'
  skin.frustumCulled = false
  const sleeve = new THREE.Mesh(buildSleeve(era, tier), sleeveMat)
  sleeve.name = 'sleeve'
  sleeve.frustumCulled = false
  sleeve.position.copy(CUFF_AT)
  sleeve.quaternion.setFromAxisAngle(Z_AXIS, Math.PI) // up the arm until aimed
  mirror.add(skin, sleeve)

  const bones = Array.from({ length: BONES }, () => new THREE.Matrix4())
  const m = new THREE.Matrix4()
  const r = new THREE.Matrix4()
  const q = new THREE.Quaternion()
  const v = new THREE.Vector3()
  const n = new THREE.Vector3()
  const one = new THREE.Vector3(1, 1, 1)
  let curl = -1
  let thumb = -1
  const pose = () => {
    bones[0]!.identity()
    FINGERS.forEach((f, fi) => {
      // the little finger folds a touch further than the index, as a real hand does
      const c = Math.min(1, curl * (1 + 0.07 * fi))
      const angles = [0.14 + c * 1.22, 0.2 + c * 1.5, 0.12 + c * 0.95]
      const splay = f.splay * (1 - 0.6 * c)
      let prev: THREE.Matrix4 | null = null
      for (let j = 0; j < 3; j++) {
        const b = bones[1 + fi * 3 + j]!
        if (!prev) b.compose(v.set(...f.root), q.setFromAxisAngle(Z_AXIS, splay), one)
        else b.copy(prev).multiply(m.makeTranslation(0, f.len[j - 1] ?? 0, 0))
        b.multiply(r.makeRotationAxis(X_AXIS, -(angles[j] ?? 0)))
        prev = b
      }
    })
    const t = thumb
    const tq = q.slerpQuaternions(THUMB_OPEN, THUMB_ACROSS, t * 0.8)
    const tAngles = [0.08 + 0.22 * t, 0.12 + 0.5 * t, 0.1 + 0.62 * t]
    let prev: THREE.Matrix4 | null = null
    for (let j = 0; j < 3; j++) {
      const b = bones[13 + j]!
      if (!prev) b.compose(v.set(...THUMB.root), tq, one)
      else b.copy(prev).multiply(m.makeTranslation(0, THUMB.len[j - 1] ?? 0, 0))
      b.multiply(r.makeRotationAxis(X_AXIS, -(tAngles[j] ?? 0)))
      prev = b
    }
    const pos = built.geo.getAttribute('position') as THREE.BufferAttribute
    const nrm = built.geo.getAttribute('normal') as THREE.BufferAttribute
    const pa = pos.array as Float32Array
    const na = nrm.array as Float32Array
    const nm = new THREE.Matrix3()
    for (const part of built.parts) {
      const b = bones[part.bone]!
      nm.setFromMatrix4(b)
      for (let i = part.start, e = part.start + part.count; i < e; i++) {
        const i3 = i * 3
        v.set(built.base[i3] ?? 0, built.base[i3 + 1] ?? 0, built.base[i3 + 2] ?? 0).applyMatrix4(b)
        n.set(built.baseN[i3] ?? 0, built.baseN[i3 + 1] ?? 0, built.baseN[i3 + 2] ?? 0).applyMatrix3(nm)
        pa[i3] = v.x
        pa[i3 + 1] = v.y
        pa[i3 + 2] = v.z
        na[i3] = n.x
        na[i3 + 1] = n.y
        na[i3 + 2] = n.z
      }
    }
    pos.needsUpdate = true
    nrm.needsUpdate = true
  }

  const tmpE = new THREE.Vector3()
  const dir = new THREE.Vector3()
  const xs = new THREE.Vector3()
  const zs = new THREE.Vector3()
  const back = new THREE.Vector3(0, -1, 0)
  const basis = new THREE.Matrix4()
  return {
    root,
    set(p) {
      root.position.copy(p.pos)
      root.quaternion.copy(p.quat)
      const c = Math.round(Math.min(1, Math.max(0, p.curl)) * 400) / 400
      const t = Math.round(Math.min(1, Math.max(0, p.thumb)) * 400) / 400
      if (c !== curl || t !== thumb) {
        curl = c
        thumb = t
        pose()
      }
    },
    aim(elbow) {
      root.updateWorldMatrix(true, true)
      tmpE.copy(elbow)
      mirror.worldToLocal(tmpE)
      dir.copy(tmpE).sub(CUFF_AT).normalize()
      // the wrist bends, but never past about fifty degrees: beyond that the forearm follows the hand
      const bend = dir.angleTo(back)
      if (bend > 0.85) dir.lerp(back, 1 - 0.85 / bend).normalize()
      xs.copy(X_AXIS).addScaledVector(dir, -X_AXIS.dot(dir)).normalize()
      zs.crossVectors(xs, dir)
      sleeve.quaternion.setFromRotationMatrix(basis.makeBasis(xs, dir, zs))
    },
    dispose() {
      built.geo.dispose()
      sleeve.geometry.dispose()
    },
  }
}

/**
 * The two hands, hidden until a toss. The left is the right one mirrored (its pose comes from
 * mirrorPose), so the two always match.
 */
export function createHands(o: { tier: QualityTier; era: EraId }): Hands {
  const skinMat = material(o.tier, { color: 0xffffff, shininess: 8, specular: 0x140e0a }) as THREE.MeshLambertMaterial
  skinMat.vertexColors = true
  // a little warmth of its own, so a hand never goes black in the corner of a dim room
  skinMat.emissive.setHex(0x0f0805)
  const sleeveMat = material(o.tier, { color: 0xffffff, side: THREE.DoubleSide, shininess: 4 }) as THREE.MeshLambertMaterial
  sleeveMat.vertexColors = true
  sleeveMat.emissive.setHex(0x080605)
  const left = createHand(o.tier, o.era, skinMat, sleeveMat, true)
  const right = createHand(o.tier, o.era, skinMat, sleeveMat, false)
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
      skinMat.dispose()
      sleeveMat.dispose()
    },
  }
}
