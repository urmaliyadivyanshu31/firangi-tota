import * as THREE from 'three'
import { afterEach, describe, expect, it, vi } from 'vitest'
import delhi1947 from '../../../src/scene/eras/delhi1947'
import { ERA_PALETTES } from '../../../src/scene/palette'
import { BLOTTER_TOP, PAPER, SPOTS, STAMP_R, createDesk, findWarmLights } from '../../../src/scene/props'
import { CARD_W, introLayout } from '../../../src/scene/intro'
import { cardAspect } from '../../../src/scene/intro-card'
import type { QualityTier } from '../../../src/scene/types'
import { fake2d } from '../fake-canvas'

const rng = () => {
  let s = 7
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function built(tier: QualityTier) {
  const scene = new THREE.Scene()
  const before = [...scene.children]
  const dressed = delhi1947.build({ scene, tier, rng: rng() })
  const lights: THREE.Light[] = []
  const meshes: THREE.Mesh[] = []
  scene.traverse((o) => {
    if ((o as THREE.Light).isLight) lights.push(o as THREE.Light)
    if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh)
  })
  return { scene, before, dressed, lights, meshes }
}

/** The mesh lying on the desk with its top at the blotter's height: the leather desk pad. */
function padBox(meshes: THREE.Mesh[]): THREE.Box3 | null {
  for (const m of meshes) {
    m.geometry.computeBoundingBox()
    const b = m.geometry.boundingBox?.clone().applyMatrix4(m.matrixWorld)
    if (b && Math.abs(b.max.y - BLOTTER_TOP) < 1e-6 && b.max.x - b.min.x > 0.3 && b.max.z - b.min.z > 0.2) return b
  }
  return null
}

/** The other eras' blotter, from the shared desk: where the paper and the intro cards are framed. */
function sharedBlotter(): THREE.Box3 {
  const desk = createDesk({ palette: ERA_PALETTES['delhi-1857'], tier: 'low', rng: rng() })
  const meshes: THREE.Mesh[] = []
  desk.group.updateMatrixWorld(true)
  desk.group.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh)
  })
  const b = padBox(meshes)
  desk.dispose()
  if (!b) throw new Error('the shared desk has no blotter')
  return b
}

afterEach(() => vi.restoreAllMocks())

describe('delhi-1947 desk', () => {
  it('has the right id and a warm lamp colour', () => {
    expect(delhi1947.id).toBe('delhi-1947')
    expect(delhi1947.lightColor).toBeGreaterThan(0)
  })

  for (const tier of ['low', 'mid', 'high'] as const) {
    it(`builds lights and meshes on ${tier}`, () => {
      const { lights, meshes } = built(tier)
      expect(lights.length).toBeGreaterThanOrEqual(1)
      expect(meshes.length).toBeGreaterThanOrEqual(5)
    })

    it(`dispose() leaves the scene as it was on ${tier}`, () => {
      const { scene, before, dressed } = built(tier)
      const geos: THREE.BufferGeometry[] = []
      scene.traverse((o) => {
        const g = (o as THREE.Mesh).geometry
        if (g) geos.push(g)
      })
      let freed = 0
      for (const g of geos) g.addEventListener('dispose', () => freed++)
      dressed.update(16)
      dressed.dispose()
      expect(scene.children).toEqual(before)
      expect(freed).toBeGreaterThanOrEqual(geos.length)
    })
  }

  it('adds no shadow-casting light on low', () => {
    const { lights } = built('low')
    expect(lights.filter((l) => l.castShadow)).toHaveLength(0)
  })

  it('turns the fan on every tier, and re-renders its shadow only on high', () => {
    for (const tier of ['low', 'mid', 'high'] as const) {
      const { scene, dressed } = built(tier)
      const fan = scene.getObjectByName('ceiling-fan')
      expect(fan).toBeDefined()
      const casters: THREE.Object3D[] = []
      fan?.traverse((o) => {
        if ((o as THREE.Mesh).isMesh) casters.push(o)
      })
      expect(casters.length).toBeGreaterThan(0)
      scene.userData.shadowsDirty = false
      dressed.update(0)
      const a0 = fan?.rotation.y ?? 0
      scene.userData.shadowsDirty = false
      dressed.update(500)
      expect(fan?.rotation.y).not.toBe(a0)
      expect(scene.userData.shadowsDirty === true).toBe(tier === 'high')
      expect(casters.every((m) => m.castShadow === (tier === 'high'))).toBe(true)
    }
  })

  it('keeps the lamp as the first warm light, inside its spot, so the dust follows it', () => {
    const { scene } = built('high')
    const warm = findWarmLights(scene)
    expect(warm.length).toBeGreaterThanOrEqual(1)
    const p = warm[0]?.position
    expect(p).toBeDefined()
    if (!p) return
    expect(Math.hypot(p.x - SPOTS.lamp.x, p.z - SPOTS.lamp.z)).toBeLessThanOrEqual(SPOTS.lamp.r)
    expect(p.y).toBeLessThanOrEqual(SPOTS.lamp.h)
  })

  it('dims the overhead light with the lamp in the caught beat', () => {
    const { scene, dressed } = built('low')
    const before = new Map<THREE.Light, number>()
    scene.traverse((o) => {
      if ((o as THREE.Light).isLight) before.set(o as THREE.Light, (o as THREE.Light).intensity)
    })
    for (const w of findWarmLights(scene)) w.setDim(0.3, true)
    dressed.update(16)
    const overhead = [...before.keys()].find((l) => l.position.y > 2)
    expect(overhead).toBeDefined()
    if (overhead) expect(overhead.intensity).toBeCloseTo((before.get(overhead) ?? 0) * 0.3, 5)
  })

  describe('the leather desk pad (the intro and desk shots frame it like the other eras)', () => {
    for (const tier of ['low', 'mid', 'high'] as const) {
      it(`lies where the other eras' blotter is, at its height, on ${tier}`, () => {
        const { scene, meshes } = built(tier)
        scene.updateMatrixWorld(true)
        const pad = padBox(meshes)
        expect(pad).not.toBeNull()
        if (!pad) return
        const ref = sharedBlotter()
        for (const k of ['x', 'z'] as const) {
          expect(pad.min[k]).toBeCloseTo(ref.min[k], 6)
          expect(pad.max[k]).toBeCloseTo(ref.max[k], 6)
        }
        // it sits on the baize, under the paper (which rests just above BLOTTER_TOP)
        expect(pad.min.y).toBeGreaterThanOrEqual(0)
      })
    }

    it('holds the whole paper, and both intro cards on a tall and a wide screen', () => {
      const { scene, meshes } = built('mid')
      scene.updateMatrixWorld(true)
      const pad = padBox(meshes)
      expect(pad).not.toBeNull()
      if (!pad) return
      const on = (x: number, z: number, margin = 0) =>
        x >= pad.min.x + margin && x <= pad.max.x - margin && z >= pad.min.z + margin && z <= pad.max.z - margin
      const c = Math.cos(SPOTS.paper.yaw)
      const sn = Math.sin(SPOTS.paper.yaw)
      for (const [x, z] of [[-1, -1], [1, -1], [1, 1], [-1, 1]] as const) {
        const lx = (x * PAPER.w) / 2
        const lz = (z * PAPER.h) / 2
        expect(on(SPOTS.paper.x + lx * c + lz * sn, SPOTS.paper.z - lx * sn + lz * c, 0.015)).toBe(true)
      }
      // each card's middle lies well inside the pad, so most of the card is on the leather (a tall
      // screen's lower card runs a little over the front edge, as on the other eras' blotter)
      for (const aspect of [390 / 844, 1440 / 900]) {
        const L = introLayout(aspect)
        const h = CARD_W * cardAspect(aspect)
        for (const card of [L.you, L.tota]) {
          expect(on(card.x, card.z, 0.05)).toBe(true)
          expect(card.z + h / 2).toBeLessThan(pad.max.z + 0.03)
        }
      }
    })

    it('keeps clear of the stamps and the lamp', () => {
      const { scene, meshes } = built('high')
      scene.updateMatrixWorld(true)
      const pad = padBox(meshes)
      expect(pad).not.toBeNull()
      if (!pad) return
      const gap = (x: number, z: number) =>
        Math.hypot(Math.max(pad.min.x - x, 0, x - pad.max.x), Math.max(pad.min.z - z, 0, z - pad.max.z))
      for (const s of [SPOTS.asli, SPOTS.tota]) expect(gap(s.x, s.z)).toBeGreaterThan(STAMP_R)
      expect(gap(SPOTS.lamp.x, SPOTS.lamp.z)).toBeGreaterThan(0.058) // the lamp's foot is 0.058 across its radius
    })

    it('paints its leather, tooling and gilt without a hitch, smaller on low', () => {
      const widths: Record<string, number> = {}
      for (const tier of ['low', 'high'] as const) {
        const ctxs: ReturnType<typeof fake2d>[] = []
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation((() => {
          const f = fake2d()
          ctxs.push(f)
          return f.ctx
        }) as unknown as HTMLCanvasElement['getContext'])
        const { scene, meshes, dressed } = built(tier)
        scene.updateMatrixWorld(true)
        const pad = padBox(meshes)
        const mesh = meshes.find((m) => {
          m.geometry.computeBoundingBox()
          return m.geometry.boundingBox?.max.y === pad?.max.y && (m.material as THREE.MeshLambertMaterial).map
        })
        const img = (mesh?.material as THREE.MeshLambertMaterial | undefined)?.map?.image as HTMLCanvasElement | undefined
        expect(img).toBeDefined()
        widths[tier] = img?.width ?? 0
        // the gilt fillet and the rosettes were drawn on some canvas
        expect(ctxs.some((f) => f.calls.filter((k) => k === 'ellipse').length >= 32)).toBe(true)
        dressed.dispose()
        vi.restoreAllMocks()
      }
      expect(widths.low).toBeLessThanOrEqual(256)
      expect(widths.high).toBeGreaterThan(widths.low ?? 0)
    })
  })
})
