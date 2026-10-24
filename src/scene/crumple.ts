// The read paper screwed up into a ball: a fine grid of the sheet, both faces textured with the
// paper's own two sides, morphed from flat to a rough ball (crumpleAt). Also the balls already in
// the basket: one instanced mesh, one draw call however many days were read.
import * as THREE from 'three'
import { mulberry32 } from '../game/rng'
import { mix } from './palette'
import { material } from './props'
import { toTexture } from './textures'
import type { QualityTier } from './types'

/** The ball's radius (m): about 7.5 cm across, as a sheet of foolscap screwed up in two hands. */
export const BALL_R = 0.038

/** The grid across the sheet's width per tier; down its length it follows the paper's shape. */
const GRID_X: Record<QualityTier, number> = { high: 26, mid: 20, low: 12 }
/** On low the morph moves in steps of this much (fewer uploads), the same story. */
const LOW_STEP = 1 / 14

const tri = (x: number) => 1 - 4 * Math.abs(x - Math.round(x))
const clamp01 = (k: number) => (k < 0 ? 0 : k > 1 ? 1 : k)
const smooth = (k: number) => {
  const t = clamp01(k)
  return t * t * (3 - 2 * t)
}

/** The flat sheet and the ball it becomes, for one paper: positions in the sheet's own frame. */
export interface CrumpleShape {
  nx: number
  nz: number
  w: number
  h: number
  flat: Float32Array
  ball: Float32Array
  /** Each point's place in the crease pattern, -1..1: the ridges and valleys it buckles into. */
  crease: Float32Array
}

/**
 * Plans the crumple of a w × h sheet on an (nx+1) × (nz+1) grid. Flat, the sheet lies in its own
 * frame with the verdict side up (+y). The ball gathers the middle of the sheet over its top and
 * the edges under it; past the edges' middles the corners fold back up over the ball, so the
 * written side shows in places, as in a real screwed-up page. Seeded, so each paper is its own ball.
 */
export function planCrumple(nx: number, nz: number, w: number, h: number, seed: number, r = BALL_R): CrumpleShape {
  const rng = mulberry32(seed)
  const n = (nx + 1) * (nz + 1)
  const flat = new Float32Array(n * 3)
  const ball = new Float32Array(n * 3)
  const crease = new Float32Array(n)
  // the creases: straight folds at random angles and spacings, each a sharp ridge-valley wave
  const folds = Array.from({ length: 7 }, (_, i) => {
    const a = rng() * Math.PI
    return { dx: Math.cos(a), dz: Math.sin(a), f: 1 / (0.03 + rng() * 0.05), o: rng(), amp: 1 - i * 0.1 }
  })
  const ampSum = folds.reduce((s, f) => s + f.amp, 0)
  // a slow wobble, so the ball is lumpy rather than round
  const waves = Array.from({ length: 3 }, () => ({ a: (rng() - 0.5) * 60, b: (rng() - 0.5) * 60, p: rng() * Math.PI * 2 }))
  const twist = 0.9 + rng() * 0.8
  const spinAz = rng() * Math.PI * 2
  const r0 = 0.74
  for (let j = 0, i3 = 0, i1 = 0; j <= nz; j++) {
    const v = j / nz
    for (let i = 0; i <= nx; i++, i3 += 3, i1++) {
      const u = i / nx
      const X = (u - 0.5) * w
      const Z = (v - 0.5) * h
      flat[i3] = X
      flat[i3 + 1] = 0
      flat[i3 + 2] = Z
      let c = 0
      for (const f of folds) c += f.amp * tri((X * f.dx + Z * f.dz) * f.f + f.o)
      c /= ampSum
      crease[i1] = c
      let wob = 0
      for (const q of waves) wob += Math.sin(X * q.a + Z * q.b + q.p)
      wob /= waves.length
      // the place on the ball
      const sx = (u - 0.5) * 2
      const sz = (v - 0.5) * 2
      const rr = Math.min(1, Math.hypot(sx, sz) / Math.SQRT2)
      const th = Math.atan2(sz, sx)
      let phi: number
      let rho: number
      if (rr <= r0) {
        phi = Math.PI * (0.05 + 0.9 * (rr / r0))
        rho = r * (0.84 + 0.13 * c + 0.07 * wob)
      } else {
        // a corner folded back up over the ball, written side out
        const t = (rr - r0) / (1 - r0)
        phi = Math.PI * (0.95 - 0.55 * t)
        rho = r * (0.95 + 0.08 * c + 0.05 * wob) + 0.002 + 0.004 * t
      }
      phi += 0.18 * c
      const az = th + spinAz + twist * rr + 0.45 * wob
      const s = Math.sin(phi)
      ball[i3] = s * Math.cos(az) * rho
      ball[i3 + 1] = Math.cos(phi) * rho
      ball[i3 + 2] = s * Math.sin(az) * rho
    }
  }
  return { nx, nz, w, h, flat, ball, crease }
}

/** How far the sides have been pushed in (0..0.62) and how far it is a ball (0..1), at crumple k. */
export function crumpleStage(k: number): { squash: number; ball: number } {
  return { squash: smooth(k / 0.8) * 0.62, ball: Math.pow(smooth((k - 0.26) / 0.74), 1.15) }
}

/** Half the paper's width across the hands at crumple k: where the palms press. */
export function crumpleHalfWidth(s: Pick<CrumpleShape, 'w'>, k: number, r = BALL_R): number {
  const st = crumpleStage(k)
  const sheet = (s.w / 2) * (1 - st.squash)
  return sheet + (r * 0.92 - sheet) * st.ball
}

/**
 * The sheet at crumple k (0 flat … 1 the ball), into `out`. It is pushed in from the sides and
 * buckles along its creases, its ends curling up into the hands, then gathers into the ball.
 * `twist` wrings it: the two sides turn opposite ways about the line between the hands (radians).
 */
export function crumpleAt(s: CrumpleShape, k: number, twist: number, out: Float32Array): void {
  const st = crumpleStage(k)
  const sq = st.squash
  const b = st.ball
  const amp = 0.003 + 0.05 * sq
  const hw = s.w / 2
  const hh = s.h / 2
  const n = (s.nx + 1) * (s.nz + 1)
  for (let i = 0, i3 = 0; i < n; i++, i3 += 3) {
    const X = s.flat[i3] ?? 0
    const Z = s.flat[i3 + 2] ?? 0
    const c = s.crease[i] ?? 0
    const nz = Z / hh
    // squashed from the sides: the paper gathers toward the middle and buckles into ridges
    const x1 = X * (1 - sq)
    const z1 = Z * (1 - 0.55 * sq)
    const y1 = c * amp * Math.min(1, k * 6) + 0.09 * sq * nz * nz * 0.5 - 0.02 * sq * (1 - nz * nz)
    const x = x1 + ((s.ball[i3] ?? 0) - x1) * b
    let y = y1 + ((s.ball[i3 + 1] ?? 0) - y1) * b
    let z = z1 + ((s.ball[i3 + 2] ?? 0) - z1) * b
    if (twist !== 0) {
      const a = twist * Math.max(-1, Math.min(1, X / hw)) * (1 - 0.55 * b)
      const cs = Math.cos(a)
      const sn = Math.sin(a)
      const yy = y * cs - z * sn
      z = y * sn + z * cs
      y = yy
    }
    out[i3] = x
    out[i3 + 1] = y
    out[i3 + 2] = z
  }
}

export interface PaperBall {
  /** Placed by the stage; the ball's centre is its origin. */
  group: THREE.Group
  /**
   * Lays the flat grid over this paper: its size, the verdict side (up) and the written side
   * (down) as the sheet's own textures, at the sheet's brightness. `seed` makes it its own ball.
   */
  prepare(o: { w: number; h: number; back: THREE.Texture | null; front: THREE.Texture; backGlow: number; frontGlow: number; seed: number }): void
  /** 0 = the flat sheet, 1 = the ball; `twist` wrings it (radians). */
  setCrumple(k: number, twist?: number): void
  /** Half its width across the hands now (m). */
  halfWidth(): number
  crumple(): number
  dispose(): void
}

/**
 * The paper on its way to being a ball. Both faces are drawn flat-shaded, so every crease catches
 * the lamp; the faces are the sheet's own canvases (never copied), so the verdict and the message
 * still show in the folds.
 */
export function createPaperBall(tier: QualityTier, paper: number): PaperBall {
  const group = new THREE.Group()
  group.name = 'paper-ball'
  group.visible = false
  const mk = () => {
    const m = material(tier, { color: 0xffffff, shininess: 5, specular: 0x0b0b0b }) as THREE.MeshLambertMaterial
    m.flatShading = true
    return m
  }
  const upMat = mk()
  const downMat = mk()
  downMat.side = THREE.BackSide
  const plain = mix(paper, 0xffffff, 0.06)
  let shape: CrumpleShape | null = null
  let pos: THREE.BufferAttribute | null = null
  let up: THREE.Mesh | null = null
  let down: THREE.Mesh | null = null
  let k = 0
  let tw = 0
  let shown = -1
  const free = () => {
    for (const m of [up, down]) {
      if (!m) continue
      group.remove(m)
      m.geometry.dispose()
    }
    up = down = null
  }
  const apply = () => {
    if (!shape || !pos) return
    const kk = tier === 'low' && k < 1 ? Math.round(k / LOW_STEP) * LOW_STEP : k
    const key = kk * 1000 + tw
    if (key === shown) return
    shown = key
    crumpleAt(shape, kk, tw, pos.array as Float32Array)
    pos.needsUpdate = true
    up?.geometry.computeBoundingSphere()
  }
  return {
    group,
    prepare(o) {
      free()
      const nx = GRID_X[tier]
      const nz = Math.max(4, Math.round((nx * o.h) / o.w))
      shape = planCrumple(nx, nz, o.w, o.h, o.seed)
      const count = (nx + 1) * (nz + 1)
      pos = new THREE.BufferAttribute(new Float32Array(shape.flat), 3)
      pos.setUsage(THREE.DynamicDrawUsage)
      const normal = new THREE.BufferAttribute(new Float32Array(count * 3), 3)
      for (let i = 0; i < count; i++) normal.setXYZ(i, 0, 1, 0)
      const uvUp = new Float32Array(count * 2)
      const uvDown = new Float32Array(count * 2)
      for (let j = 0, i2 = 0; j <= nz; j++) {
        for (let i = 0; i <= nx; i++, i2 += 2) {
          const u = i / nx
          const v = j / nz
          // the verdict side reads upright from the player's chair, the written side under it
          uvUp[i2] = u
          uvUp[i2 + 1] = 1 - v
          uvDown[i2] = 1 - u
          uvDown[i2 + 1] = 1 - v
        }
      }
      const idx: number[] = []
      for (let j = 0; j < nz; j++) {
        for (let i = 0; i < nx; i++) {
          const a = j * (nx + 1) + i
          const b = a + 1
          const d = a + nx + 1
          const c = d + 1
          idx.push(a, d, b, b, d, c)
        }
      }
      const index = new THREE.BufferAttribute(count > 65535 ? new Uint32Array(idx) : new Uint16Array(idx), 1)
      const geo = (uv: Float32Array) => {
        const g = new THREE.BufferGeometry()
        g.setIndex(index)
        g.setAttribute('position', pos as THREE.BufferAttribute)
        g.setAttribute('normal', normal)
        g.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
        return g
      }
      const setFace = (m: THREE.MeshLambertMaterial, tex: THREE.Texture | null, glow: number) => {
        m.map = tex
        m.emissiveMap = tex
        if (tex) {
          m.color.setRGB(1, 1, 1)
          m.emissive.setRGB(glow, glow, glow)
        } else {
          m.color.setHex(plain)
          m.emissive.setRGB(glow * 0.5, glow * 0.5, glow * 0.5)
        }
        m.needsUpdate = true
      }
      setFace(upMat, o.back, o.backGlow)
      setFace(downMat, o.front, o.frontGlow)
      up = new THREE.Mesh(geo(uvUp), upMat)
      down = new THREE.Mesh(geo(uvDown), downMat)
      up.name = 'paper-ball-verdict'
      down.name = 'paper-ball-message'
      group.add(up, down)
      k = 0
      tw = 0
      shown = -1
      apply()
    },
    setCrumple(next, twist = 0) {
      k = clamp01(next)
      tw = twist
      apply()
    },
    halfWidth: () => (shape ? crumpleHalfWidth(shape, k) : BALL_R),
    crumple: () => k,
    dispose() {
      free()
      // the faces are the sheet's textures: the sheet frees them, not the ball
      upMat.map = upMat.emissiveMap = null
      downMat.map = downMat.emissiveMap = null
      upMat.dispose()
      downMat.dispose()
    },
  }
}

// ---------------------------------------------------------------- the balls in the basket

/** A read paper lying in the basket as a ball: where it came to rest, turned how, and its size. */
export interface BinBall {
  pos: THREE.Vector3
  quat: THREE.Quaternion
  s: number
}

export interface BinBalls {
  group: THREE.Group
  /** Shows these balls in the basket (one instanced mesh, one draw call). */
  set(list: readonly BinBall[]): void
  dispose(): void
}

/** A screwed-up page as a closed lumpy ball: an icosphere pushed in and out along its creases. */
export function ballGeometry(tier: QualityTier, seed = 7): THREE.BufferGeometry {
  const geo = new THREE.IcosahedronGeometry(1, tier === 'low' ? 1 : 2)
  const rng = mulberry32(seed)
  const folds = Array.from({ length: 6 }, () => {
    const a = new THREE.Vector3(rng() - 0.5, rng() - 0.5, rng() - 0.5).normalize()
    return { a, f: 1.4 + rng() * 2.2, o: rng() }
  })
  const p = geo.getAttribute('position') as THREE.BufferAttribute
  const v = new THREE.Vector3()
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i).normalize()
    let c = 0
    for (const f of folds) c += tri(v.dot(f.a) * f.f + f.o)
    c /= folds.length
    // by position, so the corners several faces share move together and the ball stays closed
    const hsh = Math.sin(v.x * 913.1 + v.y * 371.7 + v.z * 529.3) * 43758.5
    const k = BALL_R * (0.86 + 0.16 * c + 0.08 * (hsh - Math.floor(hsh) - 0.5))
    p.setXYZ(i, v.x * k, v.y * k, v.z * k)
  }
  geo.computeVertexNormals()
  return geo
}

/** The days already read, as paper balls in the basket: it fills as the chapter goes on. */
export function createBinBalls(tier: QualityTier, paper: number, max: number): BinBalls {
  const c = document.createElement('canvas')
  c.width = tier === 'low' ? 32 : 64
  c.height = c.width
  try {
    const g = c.getContext('2d')
    if (g) {
      g.fillStyle = `#${mix(paper, 0xffffff, 0.06).toString(16).padStart(6, '0')}`
      g.fillRect(0, 0, c.width, c.height)
      // broken lines of writing and a corner of a stamp, so a ball still reads as a read page
      const u = c.width / 32
      g.fillStyle = 'rgba(60,44,30,0.32)'
      for (let i = 0; i < 7; i++) g.fillRect((3 + (i % 3) * 2) * u, (4 + i * 4) * u, (12 + ((i * 7) % 9)) * u, 1.1 * u)
      g.strokeStyle = 'rgba(46,96,62,0.45)'
      g.lineWidth = 1.4 * u
      g.beginPath()
      g.arc(24 * u, 22 * u, 5 * u, 0, Math.PI * 2)
      g.stroke()
    }
  } catch {
    /* plain paper is fine */
  }
  const tex = toTexture(c)
  const mat = material(tier, { map: tex, shininess: 4 }) as THREE.MeshLambertMaterial
  mat.flatShading = true
  mat.emissiveMap = tex
  mat.emissive.setRGB(0.16, 0.16, 0.16)
  const geo = ballGeometry(tier)
  const mesh = new THREE.InstancedMesh(geo, mat, Math.max(1, max))
  mesh.name = 'bin-balls'
  mesh.receiveShadow = true
  mesh.frustumCulled = false
  const group = new THREE.Group()
  group.name = 'bin-papers'
  const m4 = new THREE.Matrix4()
  const sc = new THREE.Vector3()
  return {
    group,
    set(list) {
      const shown = list.slice(-Math.max(1, max))
      if (!shown.length) {
        group.remove(mesh)
        return
      }
      shown.forEach((b, i) => mesh.setMatrixAt(i, m4.compose(b.pos, b.quat, sc.setScalar(b.s))))
      mesh.count = shown.length
      mesh.instanceMatrix.needsUpdate = true
      if (mesh.parent !== group) group.add(mesh)
    },
    dispose() {
      group.remove(mesh)
      geo.dispose()
      mat.dispose()
      tex.dispose()
      mesh.dispose()
    },
  }
}
