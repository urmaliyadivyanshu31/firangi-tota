import * as THREE from 'three'
import { describe, expect, it } from 'vitest'
import delhi1947 from '../../../src/scene/eras/delhi1947'
import { SPOTS, findWarmLights } from '../../../src/scene/props'
import type { QualityTier } from '../../../src/scene/types'

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
})
