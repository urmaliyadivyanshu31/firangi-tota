// Shared props every era desk reuses: the desk, the two stamps, the paper, the warm lamp light,
// dust motes and the camera rig. All geometry and shaders are written here from scratch.
//
// Layout: the desk top is the plane y = 0, centred on the origin, with +z toward the player.
// The stage puts the paper and stamps on the SPOTS below; dressings keep those spots clear.
import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { mix, type Palette, type WoodType } from './palette'
import { TIER_SETTINGS } from './quality'
import {
  STAMP_INK,
  blobTexture,
  clothTexture,
  glowTexture,
  metalTexture,
  paperTexture,
  plasterTexture,
  stampDecalTexture,
  stoneTexture,
  woodTexture,
} from './textures'
import { clamp01, ease, lerp, type Ease, type Tweens } from './tween'
import type { DressingHooks, EraDressing, QualityTier, StampKind } from './types'

type V3 = [number, number, number]

export const DESK = { w: 1.04, d: 0.62, thick: 0.045 } as const
export const PAPER = { w: 0.21, h: 0.28 } as const
export const STAMP_R = 0.032
export const SPOTS = {
  paper: { x: 0, z: 0.03, yaw: 0.05 },
  /** ASLI sits left of the paper and TOTA right, matching ArrowLeft/ArrowRight. */
  asli: { x: -0.26, z: 0.12 },
  tota: { x: 0.26, z: 0.12 },
  /**
   * Where an era's main lamp stands (back left). Its body must fit inside radius `r` and height
   * `h` (flame included): the desk shot keeps that whole volume in frame (ruling R20).
   */
  lamp: { x: -0.27, z: -0.19, r: 0.065, h: 0.3 },
} as const
/** Stamp handle height. */
export const STAMP_H = 0.1
/** Top of the blotter; the paper rests just above it. */
export const BLOTTER_TOP = 0.002
const PAPER_Y = BLOTTER_TOP + 0.0006
/** Width the desk shot always keeps in frame: the paper and both stamps, with a margin. */
export const FRAME_W = 0.7

// ---------------------------------------------------------------- materials and housekeeping

export interface MatSpec {
  color?: number
  map?: THREE.Texture | null
  /** Bump strength using `map` as the height field; high tier only. */
  bump?: number
  shininess?: number
  specular?: number
  emissive?: number
  /** Metal keeps Phong on mid; everything else drops to Lambert there. */
  metal?: boolean
  side?: THREE.Side
  transparent?: boolean
  opacity?: number
  depthWrite?: boolean
  /** Pull toward the camera to sit on a surface without z-fighting (decals). */
  decal?: boolean
}

/** Phong on high; Phong for metal and Lambert elsewhere on mid; Lambert everywhere on low. */
export function material(tier: QualityTier, s: MatSpec): THREE.MeshPhongMaterial | THREE.MeshLambertMaterial {
  const mode = TIER_SETTINGS[tier].materials
  const rich = mode === 'rich' || (mode === 'mixed' && s.metal === true)
  const base = {
    color: s.color ?? 0xffffff,
    map: s.map ?? null,
    emissive: s.emissive ?? 0x000000,
    side: s.side ?? THREE.FrontSide,
    transparent: s.transparent ?? false,
    opacity: s.opacity ?? 1,
  }
  let m: THREE.MeshPhongMaterial | THREE.MeshLambertMaterial
  if (rich) {
    const p = new THREE.MeshPhongMaterial({ ...base, shininess: s.shininess ?? 10, specular: s.specular ?? 0x141414 })
    if (mode === 'rich' && s.bump && s.map) {
      p.bumpMap = s.map
      p.bumpScale = s.bump
    }
    m = p
  } else {
    m = new THREE.MeshLambertMaterial(base)
  }
  if (s.depthWrite === false) m.depthWrite = false
  if (s.decal) {
    m.polygonOffset = true
    m.polygonOffsetFactor = -1
    m.polygonOffsetUnits = -4
    m.depthWrite = false
  }
  return m
}

/** Disposes every geometry, material, texture and shadow map under `root`. */
export function disposeTree(root: THREE.Object3D): void {
  root.traverse((o) => {
    const mesh = o as THREE.Mesh
    if (mesh.geometry) mesh.geometry.dispose()
    const mats = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : []
    for (const m of mats) {
      for (const v of Object.values(m)) if (v instanceof THREE.Texture) v.dispose()
      const uniforms = (m as THREE.ShaderMaterial).uniforms
      if (uniforms) for (const u of Object.values(uniforms)) if (u.value instanceof THREE.Texture) u.value.dispose()
      m.dispose()
    }
    const light = o as THREE.Light
    if (light.isLight) light.dispose()
  })
}

/** Shadow maps only re-render on request. Call this from a dressing's update when casters move. */
export function markShadowsDirty(scene: THREE.Scene): void {
  scene.userData.shadowsDirty = true
}

export function takeShadowsDirty(scene: THREE.Scene): boolean {
  const d = scene.userData.shadowsDirty === true
  scene.userData.shadowsDirty = false
  return d
}

/** Scales a geometry's UVs, so one tiling texture keeps the same texel size across surfaces. */
export function scaleUv(geo: THREE.BufferGeometry, su: number, sv: number): THREE.BufferGeometry {
  const uv = geo.getAttribute('uv') as THREE.BufferAttribute | undefined
  if (uv) for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * su, uv.getY(i) * sv)
  return geo
}

const place = (geo: THREE.BufferGeometry, pos: V3, rot: V3 = [0, 0, 0]) => {
  const m = new THREE.Matrix4().compose(
    new THREE.Vector3(...pos),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot)),
    new THREE.Vector3(1, 1, 1),
  )
  return geo.applyMatrix4(m)
}

/**
 * Collects static geometry per material and merges it, so a prop made of twenty boxes is one
 * draw call. Keep draw calls ≤ 120 on high and ≤ 60 on low.
 */
export function createBatch() {
  const groups = new Map<THREE.Material, { geos: THREE.BufferGeometry[]; cast: boolean; receive: boolean }>()
  return {
    add(geo: THREE.BufferGeometry, mat: THREE.Material, pos: V3 = [0, 0, 0], rot: V3 = [0, 0, 0], cast = true, receive = true) {
      place(geo, pos, rot)
      const g = groups.get(mat) ?? { geos: [], cast: false, receive: false }
      g.geos.push(geo)
      g.cast ||= cast
      g.receive ||= receive
      groups.set(mat, g)
    },
    build(): THREE.Group {
      const out = new THREE.Group()
      for (const [mat, g] of groups) {
        const indexed = g.geos.every((x) => x.index !== null)
        const parts = g.geos.map((x) => {
          const y = indexed ? x : x.index ? x.toNonIndexed() : x
          for (const name of Object.keys(y.attributes)) if (!['position', 'normal', 'uv'].includes(name)) y.deleteAttribute(name)
          if (!y.getAttribute('uv')) y.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(y.getAttribute('position').count * 2), 2))
          return y
        })
        const merged = mergeGeometries(parts, false)
        for (const p of g.geos) p.dispose()
        if (!merged) continue
        const mesh = new THREE.Mesh(merged, mat)
        mesh.castShadow = g.cast
        mesh.receiveShadow = g.receive
        out.add(mesh)
      }
      groups.clear()
      return out
    },
  }
}

const lathe = (pts: [number, number][], seg: number) =>
  new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg)

// ---------------------------------------------------------------- room and desk

export interface RoomOptions {
  palette: Palette
  tier: QualityTier
  rng: () => number
  /** Floor height below the desk top: about -0.76 for a table, -0.36 for a low writing desk. */
  floorY: number
  floor?: 'planks' | 'stone'
  width?: number
  height?: number
  backZ?: number
  frontZ?: number
}

/** Back and side walls in plaster, a floor and a skirting board: three draw calls. */
export function createRoomShell(o: RoomOptions): THREE.Group {
  const s = TIER_SETTINGS[o.tier]
  const W = o.width ?? 3.2
  const H = o.height ?? 2.8
  const back = o.backZ ?? -0.55
  const front = o.frontZ ?? 1.8
  const depth = front - back
  const tile = 1.2 // metres per texture repeat
  const wallMat = material(o.tier, {
    map: plasterTexture(o.palette.wall, { size: s.texSize, rng: o.rng, anisotropy: s.anisotropy, repeat: [1, 1] }),
    bump: 0.35,
    shininess: 4,
    specular: 0x0a0a0a,
  })
  const floorTex =
    o.floor === 'stone'
      ? stoneTexture(o.palette.floor, { size: s.texSize, rng: o.rng, anisotropy: s.anisotropy, repeat: [1, 1] })
      : woodTexture(o.palette.wood, { size: s.texSize, rng: o.rng, anisotropy: s.anisotropy, repeat: [1, 1], planks: 4, tint: o.palette.floor })
  const floorMat = material(o.tier, { map: floorTex, bump: 0.4, shininess: 12, specular: 0x101010 })
  const trimMat = material(o.tier, { color: mix(o.palette.floor, 0x000000, 0.45), shininess: 14 })
  const b = createBatch()
  const y0 = o.floorY
  b.add(scaleUv(new THREE.PlaneGeometry(W, H), W / tile, H / tile), wallMat, [0, y0 + H / 2, back], [0, 0, 0], false, false)
  b.add(scaleUv(new THREE.PlaneGeometry(depth, H), depth / tile, H / tile), wallMat, [-W / 2, y0 + H / 2, back + depth / 2], [0, Math.PI / 2, 0], false, false)
  b.add(scaleUv(new THREE.PlaneGeometry(depth, H), depth / tile, H / tile), wallMat, [W / 2, y0 + H / 2, back + depth / 2], [0, -Math.PI / 2, 0], false, false)
  b.add(scaleUv(new THREE.PlaneGeometry(W, depth), W / 1.6, depth / 1.6), floorMat, [0, y0, back + depth / 2], [-Math.PI / 2, 0, 0], false, true)
  b.add(new THREE.BoxGeometry(W, 0.09, 0.016), trimMat, [0, y0 + 0.045, back + 0.008], [0, 0, 0], false, false)
  return b.build()
}

export interface DeskOptions {
  palette: Palette
  wood?: WoodType
  tier: QualityTier
  rng: () => number
  /** Desk top to floor. */
  height?: number
  legs?: 'turned' | 'square'
  /** A cloth or leather inlay under the paper. */
  blotter?: boolean
}

/** The desk surface every era shares: top, frame and legs, and an optional blotter. */
export function createDesk(o: DeskOptions): { group: THREE.Group; dispose(): void } {
  const s = TIER_SETTINGS[o.tier]
  const wood = o.wood ?? o.palette.wood
  const H = o.height ?? 0.76
  const T = DESK.thick
  const tex = woodTexture(wood, { size: s.texSize, rng: o.rng, anisotropy: s.anisotropy, repeat: [1, 1], planks: 4, joints: false })
  const topMat = material(o.tier, { map: tex, bump: 0.5, shininess: 30, specular: 0x2a2219 })
  const frameMat = material(o.tier, { map: tex, color: 0xb9a796, shininess: 18, specular: 0x1a140f })
  const group = new THREE.Group()

  const top = new THREE.Mesh(new THREE.BoxGeometry(DESK.w, T, DESK.d), topMat)
  top.position.y = -T / 2
  top.castShadow = true
  top.receiveShadow = true
  group.add(top)

  const b = createBatch()
  const lipY = -T - 0.007
  b.add(new THREE.BoxGeometry(DESK.w + 0.016, 0.014, DESK.d + 0.016), frameMat, [0, lipY, 0])
  const apronH = 0.075
  const apronY = lipY - 0.007 - apronH / 2
  const ax = DESK.w / 2 - 0.05
  const az = DESK.d / 2 - 0.05
  b.add(new THREE.BoxGeometry(DESK.w - 0.1, apronH, 0.02), frameMat, [0, apronY, az])
  b.add(new THREE.BoxGeometry(DESK.w - 0.1, apronH, 0.02), frameMat, [0, apronY, -az])
  b.add(new THREE.BoxGeometry(0.02, apronH, DESK.d - 0.1), frameMat, [ax, apronY, 0])
  b.add(new THREE.BoxGeometry(0.02, apronH, DESK.d - 0.1), frameMat, [-ax, apronY, 0])
  const legLen = H - T - 0.014
  const lx = DESK.w / 2 - 0.06
  const lz = DESK.d / 2 - 0.06
  for (const [x, z] of [[lx, lz], [-lx, lz], [lx, -lz], [-lx, -lz]] as const) {
    let leg: THREE.BufferGeometry
    if (o.legs === 'square') {
      leg = new THREE.CylinderGeometry(0.03, 0.019, legLen, 4, 1)
      leg.rotateY(Math.PI / 4)
      leg.translate(0, -legLen / 2, 0)
    } else {
      // a turned leg: block at the top, a vase, rings, a taper and a foot
      const L = legLen
      leg = lathe(
        [
          [0, -L], [0.02, -L], [0.024, -L + 0.02], [0.016, -L + 0.05], [0.017, -L * 0.62],
          [0.026, -L * 0.5], [0.019, -L * 0.42], [0.024, -L * 0.36], [0.017, -L * 0.3],
          [0.024, -L * 0.2], [0.024, 0], [0, 0],
        ],
        10,
      )
    }
    b.add(leg, frameMat, [x, lipY - 0.007, z], [0, 0, 0], false, true)
  }
  group.add(b.build())

  if (o.blotter !== false) {
    const cloth = clothTexture(mix(o.palette.accent, o.palette.shade, 0.4), { size: Math.min(256, s.texSize), rng: o.rng, repeat: [3, 2], anisotropy: s.anisotropy })
    const blot = new THREE.Mesh(new THREE.BoxGeometry(0.42, BLOTTER_TOP, 0.34), material(o.tier, { map: cloth, shininess: 3 }))
    blot.position.set(SPOTS.paper.x, BLOTTER_TOP / 2, SPOTS.paper.z)
    blot.receiveShadow = true
    group.add(blot)
  }
  return { group, dispose: () => disposeTree(group) }
}

// ---------------------------------------------------------------- the basket

export interface BasketOptions {
  tier: QualityTier
  /** The floor point under its centre. */
  at: V3
  /** Its side as a lathe profile, [radius, height] from the foot up to the lip. */
  profile: [number, number][]
  /** The woven (or wire) side. */
  map: THREE.Texture
  /** The side is a mesh you see through (its map's alpha): a wire basket. */
  seeThrough?: boolean
  /** A little light of its own, so it reads in the dark corner of the room. */
  emissive?: number
  /** A hoop round the lip: its colour (none when omitted). */
  rim?: number
  /** A solid floor inside a see-through side. */
  floor?: number
}

/**
 * The basket a read paper is tossed into after a right stamp, as its own object (the stage rocks it
 * when a paper lands), and the hook that tells the stage where its mouth is. Cheap on low: fewer
 * sides and no hoop.
 */
export function createBasket(o: BasketOptions): { group: THREE.Group; hook: NonNullable<DressingHooks['basket']> } {
  const low = o.tier === 'low'
  const seg = low ? 12 : 22
  const group = new THREE.Group()
  group.name = 'basket'
  group.position.set(...o.at)
  // a wire side is drawn see-through, so far off its fine mesh reads as a grey veil, never vanishing
  const side = material(o.tier, { map: o.map, side: THREE.DoubleSide, shininess: 6, specular: 0x0c0a06, emissive: o.emissive ?? 0, transparent: o.seeThrough, depthWrite: o.seeThrough ? false : undefined })
  const body = new THREE.Mesh(lathe(o.profile, seg), side)
  body.receiveShadow = true
  group.add(body)
  const y0 = o.profile[0]?.[1] ?? 0
  const foot = o.profile.find(([r]) => r > 0.001)?.[0] ?? 0.1
  // the rim is the widest point at the top of the profile
  const top = Math.max(...o.profile.map(([, y]) => y))
  const rTop = Math.max(...o.profile.filter(([, y]) => y >= top - 0.012).map(([r]) => r))
  if (o.floor !== undefined) {
    const floor = new THREE.Mesh(new THREE.CircleGeometry(foot, seg).rotateX(-Math.PI / 2), material(o.tier, { color: o.floor, shininess: 4 }))
    floor.position.y = y0 + 0.004
    group.add(floor)
  }
  if (o.rim !== undefined && !low) {
    const hoop = new THREE.Mesh(new THREE.TorusGeometry(rTop, 0.006, 6, seg * 2).rotateX(Math.PI / 2), material(o.tier, { color: o.rim, shininess: 20, specular: 0x2a2a2a, emissive: o.emissive ?? 0 }))
    hoop.position.y = top
    group.add(hoop)
  }
  // a soft contact shadow on the floor, so it stands rather than floats (it casts none of its own)
  const blob = new THREE.Mesh(
    new THREE.PlaneGeometry(rTop * 2.6, rTop * 2.6).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ map: blobTexture(64), transparent: true, depthWrite: false, opacity: 0.7 }),
  )
  blob.position.set(0.012, 0.0015, 0.016)
  blob.renderOrder = 1
  group.add(blob)
  return {
    group,
    hook: { mouth: [o.at[0], o.at[1] + top, o.at[2]], r: rTop * 0.92, depth: top - y0, foot, obj: group },
  }
}

// ---------------------------------------------------------------- the warm lamp light

export interface WarmLight {
  group: THREE.Group
  /** Where the light comes from, for dust and glints. */
  position: THREE.Vector3
  update(tMs: number): void
  /** Eases the light toward k (1 = normal). `now` skips the ease. */
  setDim(k: number, now?: boolean): void
  dispose(): void
}

export interface WarmLightOptions {
  tier: QualityTier
  color: number
  /** The flame or bulb. */
  position: V3
  /** Where the shadowed spot points; defaults to the paper. */
  target?: V3
  /** About 1 for an oil lamp on the desk. */
  intensity?: number
  glow?: 'flame' | 'bulb' | 'none'
  /** 0 = steady (electric), 1 = an oil flame. */
  flicker?: number
}

/**
 * A lamp's light. High and mid get a shadowed spot from the flame onto the desk (PCF 1024 on
 * high, basic 512 on mid) plus an unshadowed point for the room; low gets the point alone.
 * Flicker moves intensity only, never position, so shadow maps don't need re-rendering.
 * The lamp body itself should not cast shadows (it sits under the light).
 */
export function createWarmLight(o: WarmLightOptions): WarmLight {
  const s = TIER_SETTINGS[o.tier]
  const base = o.intensity ?? 1
  const flick = o.flicker ?? (o.glow === 'bulb' ? 0.12 : 1)
  const pos = new THREE.Vector3(...o.position)
  const group = new THREE.Group()
  const point = new THREE.PointLight(o.color, 0, 7, 2)
  point.position.copy(pos)
  group.add(point)
  let spot: THREE.SpotLight | null = null
  if (s.shadows !== 'none') {
    spot = new THREE.SpotLight(o.color, 0, 4, 1.2, 0.85, 2)
    spot.position.copy(pos)
    const t = o.target ?? [SPOTS.paper.x + 0.1, 0, SPOTS.paper.z + 0.05]
    spot.target.position.set(...t)
    spot.castShadow = true
    spot.shadow.mapSize.set(s.shadowSize, s.shadowSize)
    spot.shadow.radius = s.shadowRadius
    spot.shadow.bias = -0.0005
    spot.shadow.normalBias = 0.012
    spot.shadow.camera.near = 0.03
    spot.shadow.camera.far = 3
    group.add(spot, spot.target)
  }
  const spotK = 1.15
  const pointK = spot ? 0.36 : 0.85

  const glowMap = o.glow && o.glow !== 'none' ? glowTexture(64) : null
  let outer: THREE.Mesh | null = null
  let halo: THREE.Sprite | null = null
  let haze: THREE.Sprite | null = null
  if (glowMap) {
    const flame = new THREE.Group()
    flame.position.copy(pos)
    if (o.glow === 'flame') {
      outer = new THREE.Mesh(
        new THREE.SphereGeometry(0.0085, 12, 8),
        new THREE.MeshBasicMaterial({ color: mix(o.color, 0xffe2a0, 0.35), toneMapped: false, fog: false }),
      )
      outer.scale.set(1, 2.3, 1)
      outer.position.y = 0.011
      const core = new THREE.Mesh(
        new THREE.SphereGeometry(0.004, 10, 6),
        new THREE.MeshBasicMaterial({ color: 0xfff3d2, toneMapped: false, fog: false }),
      )
      core.scale.set(1, 2, 1)
      core.position.y = 0.008
      flame.add(outer, core)
    } else {
      const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.018, 14, 10),
        new THREE.MeshBasicMaterial({ color: mix(o.color, 0xffffff, 0.55), toneMapped: false, fog: false }),
      )
      flame.add(bulb)
    }
    halo = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: glowMap, color: o.color, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, fog: false, opacity: 0.85 }),
    )
    halo.scale.setScalar(o.glow === 'bulb' ? 0.2 : 0.13)
    halo.position.y = 0.012
    flame.add(halo)
    if (o.tier !== 'low') {
      haze = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: glowMap, color: o.color, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, fog: false, opacity: 0.15 }),
      )
      haze.scale.setScalar(0.55)
      haze.position.y = 0.012
      flame.add(haze)
    }
    group.add(flame)
  }

  let dim = 1
  let dimTarget = 1
  let lastT = 0
  const handle: WarmLight = {
    group,
    position: pos,
    update(tMs) {
      const dt = Math.min(100, Math.max(0, tMs - lastT))
      lastT = tMs
      dim += (dimTarget - dim) * (1 - Math.exp(-dt / 220))
      const t = tMs / 1000
      const gust = Math.max(0, Math.sin(t * 0.7) * Math.sin(t * 2.3) - 0.6) * 0.7
      const f = 1 + flick * (0.055 * Math.sin(t * 11.3) + 0.04 * Math.sin(t * 17.9 + 1.7) + 0.03 * Math.sin(t * 31.1) - gust * 0.6)
      const k = base * f * dim
      point.intensity = k * pointK
      if (spot) spot.intensity = k * spotK
      if (outer) {
        outer.scale.set(1 - gust * 0.25 * flick, 2.3 * (0.92 + 0.1 * f), 1)
        outer.rotation.z = (Math.sin(t * 3.1) * 0.07 + gust * 0.25) * flick
      }
      if (halo) (halo.material as THREE.SpriteMaterial).opacity = 0.8 * f * dim
      if (haze) (haze.material as THREE.SpriteMaterial).opacity = 0.15 * f * dim
    },
    setDim(k, now = false) {
      dimTarget = k
      if (now) dim = k
    },
    dispose: () => disposeTree(group),
  }
  handle.update(0)
  group.userData.warmLight = handle
  return handle
}

/** Every warm light under `root`, so the stage can dim them all for the caught beat. */
export function findWarmLights(root: THREE.Object3D): WarmLight[] {
  const out: WarmLight[] = []
  root.traverse((o) => {
    const w = o.userData.warmLight as WarmLight | undefined
    if (w) out.push(w)
  })
  return out
}

// ---------------------------------------------------------------- dust motes

const DUST_VS = /* glsl */ `
uniform float uTime;
uniform float uScale;
uniform float uHeight;
uniform vec3 uLight;
attribute vec4 aSeed;
varying float vGlow;
void main() {
  vec3 p = position;
  float t = uTime;
  p.y = mod(p.y + 0.5 * uHeight + t * (0.004 + aSeed.x * 0.009), uHeight) - 0.5 * uHeight;
  p.x += sin(t * 0.21 + aSeed.y * 6.2832) * 0.035;
  p.z += cos(t * 0.17 + aSeed.z * 6.2832) * 0.035;
  vec4 world = modelMatrix * vec4(p, 1.0);
  float d = distance(world.xyz, uLight);
  float edge = smoothstep(0.5, 0.42, abs(p.y / uHeight));
  vGlow = edge * (0.5 + 0.5 * sin(t * 1.3 + aSeed.w * 40.0)) / (1.0 + 30.0 * d * d);
  vec4 mv = viewMatrix * world;
  gl_Position = projectionMatrix * mv;
  gl_PointSize = max(1.5, (0.0017 + aSeed.x * 0.0021) * uScale / -mv.z);
}`

const DUST_FS = /* glsl */ `
uniform vec3 uColor;
varying float vGlow;
void main() {
  float r = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.05, r) * vGlow;
  gl_FragColor = vec4(uColor * a, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`

export interface Dust {
  points: THREE.Points
  /** `pxPerUnit` = canvas height / (2·tan(fov/2)). */
  update(tMs: number, pxPerUnit: number): void
  dispose(): void
}

/** Dust drifting through the lamplight, animated entirely on the GPU: one draw call. */
export function createDust(o: {
  count: number
  color: number
  center: V3
  size: V3
  light: THREE.Vector3
  rng: () => number
  reducedMotion: boolean
}): Dust {
  const n = Math.max(1, o.count)
  const pos = new Float32Array(n * 3)
  const seed = new Float32Array(n * 4)
  for (let i = 0; i < n; i++) {
    pos[i * 3] = (o.rng() - 0.5) * o.size[0]
    pos[i * 3 + 1] = (o.rng() - 0.5) * o.size[1]
    pos[i * 3 + 2] = (o.rng() - 0.5) * o.size[2]
    for (let j = 0; j < 4; j++) seed[i * 4 + j] = o.rng()
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 4))
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uScale: { value: 800 },
      uHeight: { value: o.size[1] },
      uLight: { value: o.light.clone() },
      uColor: { value: new THREE.Color(o.color).multiplyScalar(1.3) },
    },
    vertexShader: DUST_VS,
    fragmentShader: DUST_FS,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  const points = new THREE.Points(geo, mat)
  points.position.set(...o.center)
  points.frustumCulled = false
  const speed = o.reducedMotion ? 0.25 : 1
  return {
    points,
    update(tMs, pxPerUnit) {
      const u = mat.uniforms
      if (u.uTime) u.uTime.value = (tMs / 1000) * speed
      if (u.uScale) u.uScale.value = pxPerUnit
    },
    dispose: () => disposeTree(points),
  }
}

// ---------------------------------------------------------------- paper

export interface PaperStamp {
  kind: StampKind
  /** Across the sheet, 0..1 from the left. */
  u: number
  /** Down the sheet, 0..1 from the top (far edge). */
  v: number
  rot: number
}

export interface PaperProp {
  group: THREE.Group
  setStamp(s: PaperStamp | null): void
  /** 0..1, for the ink landing. */
  setInk(k: number): void
  /** World point on the sheet at (u, v). */
  pointAt(u: number, v: number): THREE.Vector3
  dispose(): void
}

/**
 * The sheet: a slightly curled plane with a small canvas texture of faint lines. The stamp
 * imprint is its own small decal mesh, so stamping uploads nothing to the GPU.
 */
export function createPaper(o: { palette: Palette; tier: QualityTier; rng: () => number }): PaperProp {
  const s = TIER_SETTINGS[o.tier]
  const geo = new THREE.PlaneGeometry(PAPER.w, PAPER.h, 6, 8)
  geo.rotateX(-Math.PI / 2)
  const p = geo.getAttribute('position') as THREE.BufferAttribute
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) / (PAPER.w / 2)
    const z = p.getZ(i) / (PAPER.h / 2)
    // corners lift a touch and the near edge curls, so it reads as paper, not a card
    p.setY(i, PAPER_Y + 0.0022 * Math.pow(Math.abs(x), 4) + 0.0018 * Math.pow(Math.max(0, z), 6))
  }
  geo.computeVertexNormals()
  const tex = paperTexture({
    width: s.paperSize,
    rng: o.rng,
    tint: o.palette.paper,
    ink: o.palette.ink,
    style: o.palette.paperStyle,
    anisotropy: s.anisotropy,
  })
  const sheet = new THREE.Mesh(geo, material(o.tier, { map: tex, shininess: 6, specular: 0x0c0c0c }))
  sheet.receiveShadow = true
  const decalSize = Math.max(128, s.paperSize / 2)
  const decals: Record<StampKind, THREE.Texture> = {
    asli: stampDecalTexture('asli', { size: decalSize, rng: o.rng }),
    tota: stampDecalTexture('tota', { size: decalSize, rng: o.rng }),
  }
  const decalMat = material(o.tier, { map: decals.asli, transparent: true, decal: true, shininess: 4 })
  const decal = new THREE.Mesh(new THREE.PlaneGeometry(0.088, 0.088).rotateX(-Math.PI / 2), decalMat)
  decal.visible = false
  decal.receiveShadow = true
  const group = new THREE.Group()
  group.add(sheet, decal)
  return {
    group,
    setStamp(st) {
      if (!st) {
        decal.visible = false
        return
      }
      decalMat.map = decals[st.kind]
      decal.position.set((st.u - 0.5) * PAPER.w, PAPER_Y + 0.0006, (st.v - 0.5) * PAPER.h)
      decal.rotation.y = st.rot
      decal.visible = true
    },
    setInk(k) {
      decalMat.opacity = 0.92 * clamp01(k)
    },
    pointAt(u, v) {
      group.updateWorldMatrix(true, false)
      return group.localToWorld(new THREE.Vector3((u - 0.5) * PAPER.w, PAPER_Y + 0.0006, (v - 0.5) * PAPER.h))
    },
    dispose() {
      disposeTree(group)
      decals.asli.dispose()
      decals.tota.dispose()
    },
  }
}

// ---------------------------------------------------------------- stamps

export interface StampSet {
  group: THREE.Group
  handles: Record<StampKind, THREE.Group>
  rest: Record<StampKind, THREE.Vector3>
  /** Keeps the low tier's contact blobs under the handles. */
  update(): void
  dispose(): void
}

/** Lacquered knobs make the two stamps easy to tell apart: ASLI red, TOTA parrot green. */
const KNOB: Record<StampKind, number> = { asli: 0x8f1d17, tota: 0x22803d }

export function createStamps(o: { palette: Palette; tier: QualityTier; rng: () => number }): StampSet {
  const s = TIER_SETTINGS[o.tier]
  const brass = o.palette.handle === 'brass'
  const bodyMat = brass
    ? material(o.tier, {
        map: metalTexture(o.palette.metal, { size: Math.min(128, s.texSize), rng: o.rng }),
        metal: true,
        shininess: 70,
        specular: 0x9a7a44,
      })
    : material(o.tier, {
        map: woodTexture(o.palette.wood, { size: Math.min(128, s.texSize), rng: o.rng }),
        shininess: 40,
        specular: 0x30261c,
      })
  const group = new THREE.Group()
  const blobMap = o.tier === 'low' ? blobTexture(64) : null
  const blobs: Partial<Record<StampKind, THREE.Mesh>> = {}
  const make = (kind: StampKind): THREE.Group => {
    const h = new THREE.Group()
    const face = new THREE.Mesh(
      new THREE.CylinderGeometry(STAMP_R * 0.94, STAMP_R * 0.94, 0.005, 24),
      material(o.tier, { color: mix(STAMP_INK[kind], 0x000000, 0.35) }),
    )
    face.position.y = 0.0025
    const foot = new THREE.CylinderGeometry(STAMP_R, STAMP_R * 1.03, 0.014, 24)
    foot.translate(0, 0.012, 0)
    const neck = lathe([[0, 0.019], [0.017, 0.019], [0.018, 0.022], [0.011, 0.03], [0.008, 0.044], [0.0095, 0.05], [0, 0.05]], 16)
    const merged = mergeGeometries([foot.toNonIndexed(), neck.toNonIndexed()])
    const body = new THREE.Mesh(merged ?? neck, bodyMat)
    foot.dispose()
    if (merged) neck.dispose()
    const knob = new THREE.Mesh(
      lathe([[0, 0.05], [0.0095, 0.05], [0.015, 0.058], [0.0195, 0.07], [0.0205, 0.078], [0.017, 0.089], [0.009, 0.097], [0, 0.1]], 18),
      material(o.tier, { color: KNOB[kind], shininess: 80, specular: 0x6a5a50 }),
    )
    for (const m of [face, body, knob]) {
      m.castShadow = true
      m.receiveShadow = true
      h.add(m)
    }
    if (blobMap) {
      const blob = new THREE.Mesh(
        new THREE.PlaneGeometry(STAMP_R * 3.2, STAMP_R * 3.2).rotateX(-Math.PI / 2),
        new THREE.MeshBasicMaterial({ map: blobMap, transparent: true, depthWrite: false }),
      )
      blob.position.y = 0.0008
      group.add(blob)
      blobs[kind] = blob
    }
    return h
  }
  const handles = { asli: make('asli'), tota: make('tota') }
  const rest = {
    asli: new THREE.Vector3(SPOTS.asli.x, 0, SPOTS.asli.z),
    tota: new THREE.Vector3(SPOTS.tota.x, 0, SPOTS.tota.z),
  }
  for (const k of ['asli', 'tota'] as const) {
    handles[k].position.copy(rest[k])
    group.add(handles[k])
  }
  const set: StampSet = {
    group,
    handles,
    rest,
    update() {
      for (const k of ['asli', 'tota'] as const) {
        const b = blobs[k]
        if (!b) continue
        const hp = handles[k].position
        b.position.x = hp.x
        b.position.z = hp.z
        ;(b.material as THREE.MeshBasicMaterial).opacity = clamp01(1 - hp.y / 0.12)
      }
    },
    dispose() {
      disposeTree(group)
      blobMap?.dispose()
    },
  }
  set.update()
  return set
}

/**
 * Raise → move → press → shake → return. Resolves when the stamp is back at rest. With reduced
 * motion the stamp stays put and only the imprint appears.
 */
export async function animateStamp(
  set: StampSet,
  kind: StampKind,
  target: THREE.Vector3,
  tw: Tweens,
  o: { reducedMotion: boolean; onImpact(): void },
): Promise<void> {
  const h = set.handles[kind]
  const home = set.rest[kind]
  if (o.reducedMotion) {
    o.onImpact()
    await tw.wait(280)
    return
  }
  const lift = 0.13
  const lean = kind === 'asli' ? -0.14 : 0.14
  await tw.run(200, (k) => {
    h.position.set(home.x, lift * k, home.z)
    h.rotation.z = lean * k
  }, ease.out)
  await tw.run(360, (k) => {
    h.position.set(lerp(home.x, target.x, k), lift + Math.sin(k * Math.PI) * 0.035, lerp(home.z, target.z, k))
    h.rotation.z = lean * (1 - k)
  }, ease.inOut)
  await tw.wait(70)
  await tw.run(90, (k) => {
    h.position.y = lerp(lift, target.y, k)
  }, ease.in)
  o.onImpact()
  await tw.run(120, (k) => {
    const q = Math.sin(k * Math.PI)
    h.scale.set(1 + 0.05 * q, 1 - 0.08 * q, 1 + 0.05 * q)
  })
  h.scale.set(1, 1, 1)
  await tw.run(440, (k) => {
    h.position.set(lerp(target.x, home.x, k), target.y + Math.sin(k * Math.PI) * 0.09, lerp(target.z, home.z, k))
  }, ease.inOut)
  h.position.copy(home)
  h.rotation.z = 0
}

// ---------------------------------------------------------------- camera

export interface Pose {
  pos: THREE.Vector3
  look: THREE.Vector3
  fov: number
}

/** Wider vertical fov on tall portrait screens, narrower on landscape. */
export const fovFor = (aspect: number) => lerp(58, 38, clamp01((aspect - 0.5) / 1.3))

/**
 * Refits an era's authored desk shot to the screen: if the play area (FRAME_W) would not fit
 * across, dolly back along the view direction; wider screens keep the authored distance.
 */
export function frameShot(base: EraDressing['camera'], aspect: number): Pose {
  const fov = fovFor(aspect)
  const look = new THREE.Vector3(...base.look)
  const off = new THREE.Vector3(...base.pos).sub(look)
  const d0 = off.length()
  const dir = off.normalize()
  const tanH = Math.tan(THREE.MathUtils.degToRad(fov) / 2) * aspect
  let d = Math.max(d0, FRAME_W / 2 / tanH)
  // then back off until every prop on the shared spots is inside the frame, with a small margin
  // for the camera's breathing and shake (R20)
  const cam = new THREE.PerspectiveCamera(fov, aspect, 0.03, 30)
  const v = new THREE.Vector3()
  const inFrame = () => {
    cam.position.copy(look).addScaledVector(dir, d)
    cam.lookAt(look)
    cam.updateMatrixWorld()
    cam.updateProjectionMatrix()
    return framePoints().every((p) => {
      v.copy(p).project(cam)
      return Math.abs(v.x) <= FRAME_MARGIN && Math.abs(v.y) <= FRAME_MARGIN && v.z < 1
    })
  }
  for (let i = 0; i < 60 && !inFrame(); i++) d *= 1.03
  return { pos: look.clone().addScaledVector(dir, d), look, fov }
}

/** Props must project inside ±FRAME_MARGIN in normalised device coordinates. */
export const FRAME_MARGIN = 0.94

let pointsCache: THREE.Vector3[] | null = null
/** The outline of every prop on the shared spots: stamps, paper and the lamp volume. */
export function framePoints(): THREE.Vector3[] {
  if (pointsCache) return pointsCache
  const pts: THREE.Vector3[] = []
  const column = (x: number, z: number, r: number, h: number) => {
    for (let a = 0; a < 8; a++) {
      const px = x + Math.cos((a / 8) * Math.PI * 2) * r
      const pz = z + Math.sin((a / 8) * Math.PI * 2) * r
      pts.push(new THREE.Vector3(px, 0, pz), new THREE.Vector3(px, h, pz))
    }
  }
  column(SPOTS.asli.x, SPOTS.asli.z, STAMP_R, STAMP_H)
  column(SPOTS.tota.x, SPOTS.tota.z, STAMP_R, STAMP_H)
  column(SPOTS.lamp.x, SPOTS.lamp.z, SPOTS.lamp.r, SPOTS.lamp.h)
  const c = Math.cos(SPOTS.paper.yaw)
  const sn = Math.sin(SPOTS.paper.yaw)
  for (const [dx, dz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]] as const) {
    const x = (dx * PAPER.w) / 2
    const z = (dz * PAPER.h) / 2
    pts.push(new THREE.Vector3(SPOTS.paper.x + x * c + z * sn, 0, SPOTS.paper.z - x * sn + z * c))
  }
  pointsCache = pts
  return pts
}

/** Leaning in over the sheet, which sits in the upper part of a portrait screen. */
export function readShot(paper: THREE.Vector3, aspect: number): Pose {
  const fov = fovFor(aspect)
  const tanV = Math.tan(THREE.MathUtils.degToRad(fov) / 2)
  const dist = Math.max((PAPER.h * 1.3) / 2 / tanV, (PAPER.w * 1.3) / 2 / (tanV * aspect))
  const dir = new THREE.Vector3(0, 1, 0.42).normalize()
  const portrait = aspect < 0.8
  const look = paper.clone().add(new THREE.Vector3(0, 0, portrait ? dist * tanV * 0.42 : 0.02))
  return { pos: look.clone().addScaledVector(dir, dist), look, fov }
}

export type ShotName = 'intro' | 'desk' | 'read' | 'caught' | 'custom'

/** A shot computed for the current aspect, so it re-fits when the screen turns or resizes. */
export type PoseFn = (aspect: number) => Pose

export interface CameraRig {
  setBase(base: EraDressing['camera']): void
  setAspect(aspect: number): void
  setPaper(p: THREE.Vector3): void
  /** Eases from wherever the camera is now to `shot`. */
  go(shot: ShotName, ms: number, e?: Ease): Promise<void>
  jump(shot: ShotName): void
  /** Eases to a shot made by `fn` (the 'custom' shot). */
  goTo(fn: PoseFn, ms: number, e?: Ease): Promise<void>
  jumpTo(fn: PoseFn): void
  /** Replaces a named shot's framing (null restores the built-in one). */
  override(shot: Exclude<ShotName, 'custom'>, fn: PoseFn | null): void
  /** Forces cached shots to be recomputed (the things they frame moved). */
  refresh(): void
  /** How far the camera sways (1 = the normal slow breath). */
  setSway(k: number): void
  /** The pointer's additive turn this frame (radians); see parallax.ts. */
  setParallax(yaw: number, pitch: number): void
  /** How much of the pointer turn reaches the camera (eased): near 0 while reading, 1 elsewhere. */
  setParallaxScale(k: number): void
  shot(): ShotName
  shake(amount: number, downward?: number): void
  update(dtMs: number, tMs: number): void
  aspect(): number
}

export function createCameraRig(camera: THREE.PerspectiveCamera, tw: Tweens, o: { reducedMotion: boolean }): CameraRig {
  let base: EraDressing['camera'] = { pos: [0, 0.95, 1.1], look: [0, -0.1, 0] }
  let aspect = 1
  const paper = new THREE.Vector3(SPOTS.paper.x, 0, SPOTS.paper.z)
  let current: ShotName = 'desk'
  let blend = 1
  let token = 0
  let shakeAmp = 0
  let thump = 0
  let sway = 1
  let swayNow = 1
  let customFn: PoseFn | null = null
  let pYaw = 0
  let pPitch = 0
  let pScale = 1
  let pScaleNow = 1
  const tmpDir = new THREE.Vector3()
  const tmpRight = new THREE.Vector3()
  const UP_Y = new THREE.Vector3(0, 1, 0)
  const overrides = new Map<ShotName, PoseFn>()
  const from: Pose = { pos: new THREE.Vector3(), look: new THREE.Vector3(), fov: 50 }
  const cur: Pose = { pos: new THREE.Vector3(), look: new THREE.Vector3(), fov: 50 }
  const tmpLook = new THREE.Vector3()
  // shots only change with the base, aspect or paper, so cache them instead of rebuilding per frame
  let version = 0
  const cache = new Map<ShotName, { v: number; pose: Pose }>()
  const poseFor = (name: ShotName): Pose => {
    const hit = cache.get(name)
    if (hit && hit.v === version) return hit.pose
    const pose = computePose(name)
    cache.set(name, { v: version, pose })
    return pose
  }

  const computePose = (name: ShotName): Pose => {
    if (name === 'custom' && customFn) return customFn(aspect)
    const o = overrides.get(name)
    if (o) return o(aspect)
    const desk = frameShot(base, aspect)
    if (name === 'desk' || name === 'custom') return desk
    if (name === 'read') return readShot(paper, aspect)
    const off = desk.pos.clone().sub(desk.look)
    if (name === 'caught') {
      return {
        pos: desk.look.clone().addScaledVector(off, 0.94).add(new THREE.Vector3(0, -0.07, 0)),
        look: desk.look.clone().add(new THREE.Vector3(0, -0.09, 0)),
        fov: desk.fov,
      }
    }
    // intro: further back and higher, looking at the wall above the desk
    return {
      pos: desk.look.clone().addScaledVector(off, 1.5).add(new THREE.Vector3(0.16, 0.3, 0)),
      look: desk.look.clone().add(new THREE.Vector3(0, 0.24, -0.3)),
      fov: desk.fov + 4,
    }
  }
  const copy = (dst: Pose, src: Pose) => {
    dst.pos.copy(src.pos)
    dst.look.copy(src.look)
    dst.fov = src.fov
  }
  copy(cur, poseFor('desk'))

  const rig: CameraRig = {
    setBase(b) {
      base = b
      version++
    },
    setAspect(a) {
      aspect = a
      version++
      camera.aspect = a
      camera.updateProjectionMatrix()
    },
    setPaper(p) {
      paper.copy(p)
      version++
    },
    go(shot, ms, e = ease.inOut) {
      copy(from, cur)
      current = shot
      blend = 0
      const mine = ++token
      return tw.run(ms, (k) => {
        if (mine === token) blend = k
      }, e)
    },
    jump(shot) {
      current = shot
      blend = 1
      token++
      copy(cur, poseFor(shot))
    },
    goTo(fn, ms, e = ease.inOut) {
      customFn = fn
      cache.delete('custom')
      version++
      return rig.go('custom', ms, e)
    },
    jumpTo(fn) {
      customFn = fn
      cache.delete('custom')
      version++
      rig.jump('custom')
    },
    override(shot, fn) {
      if (fn) overrides.set(shot, fn)
      else overrides.delete(shot)
      version++
    },
    refresh() {
      version++
    },
    setSway(k) {
      sway = k
    },
    setParallax(yaw, pitch) {
      pYaw = yaw
      pPitch = pitch
    },
    setParallaxScale(k) {
      pScale = k
    },
    aspect: () => aspect,
    shot: () => current,
    shake(amount, downward = 0) {
      if (o.reducedMotion) return
      shakeAmp = Math.max(shakeAmp, amount)
      thump = Math.max(thump, downward)
    },
    update(dt, t) {
      const target = poseFor(current)
      if (blend < 1) {
        cur.pos.lerpVectors(from.pos, target.pos, blend)
        cur.look.lerpVectors(from.look, target.look, blend)
        cur.fov = lerp(from.fov, target.fov, blend)
      } else copy(cur, target)
      camera.position.copy(cur.pos)
      tmpLook.copy(cur.look)
      if (!o.reducedMotion) {
        // a slow breath, so the room never looks frozen; wider shots sway a little more
        swayNow += (sway - swayNow) * (1 - Math.exp(-dt / 600))
        camera.position.x += Math.sin(t * 0.00042) * 0.004 * swayNow
        camera.position.y += Math.sin(t * 0.00061 + 1) * 0.003 * swayNow
        tmpLook.x += Math.sin(t * 0.00023 + 2) * 0.006 * (swayNow - 1)
        if (thump > 0.0002) {
          // a dull downward knock that settles back
          camera.position.y -= thump
          tmpLook.y -= thump * 0.6
          thump *= Math.pow(0.0015, dt / 1000)
        }
        if (shakeAmp > 0.0002) {
          camera.position.x += (Math.random() - 0.5) * shakeAmp
          camera.position.y += (Math.random() - 0.5) * shakeAmp
          tmpLook.y += (Math.random() - 0.5) * shakeAmp * 0.5
          shakeAmp *= Math.pow(0.004, dt / 1000)
        }
      }
      pScaleNow += (pScale - pScaleNow) * (1 - Math.exp(-dt / 350))
      const py = pYaw * pScaleNow
      const pp = pPitch * pScaleNow
      if (!o.reducedMotion && (Math.abs(py) > 1e-5 || Math.abs(pp) > 1e-5)) {
        // turn the view toward the pointer around the camera: a glance, not a move
        tmpDir.copy(tmpLook).sub(camera.position)
        tmpDir.applyAxisAngle(UP_Y, -py)
        tmpRight.crossVectors(tmpDir, UP_Y).normalize()
        tmpDir.applyAxisAngle(tmpRight, pp)
        tmpLook.copy(camera.position).add(tmpDir)
        camera.position.addScaledVector(tmpRight, py * 0.02)
      }
      camera.lookAt(tmpLook)
      if (Math.abs(camera.fov - cur.fov) > 1e-4) {
        camera.fov = cur.fov
        camera.updateProjectionMatrix()
      }
    },
  }
  return rig
}
