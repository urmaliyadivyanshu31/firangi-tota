// The lahore-1929 desk, built into a real THREE.Scene. jsdom has no canvas backend, so a
// recording 2D context stands in and the procedural painting code still runs.
import * as THREE from 'three'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mulberry32, seedFrom } from '../../../src/game/rng'
import lahore1929 from '../../../src/scene/eras/lahore1929'
import { SPOTS, STAMP_R } from '../../../src/scene/props'
import type { QualityTier } from '../../../src/scene/types'

function fake2d() {
  const grad = { addColorStop: () => undefined }
  return new Proxy({} as Record<string, unknown>, {
    get(target, key: string) {
      if (key in target) return target[key]
      if (key === 'createLinearGradient' || key === 'createRadialGradient') return () => grad
      if (key === 'createImageData') return (w: number, h: number) => ({ data: new Uint8ClampedArray(w * h * 4) })
      return () => undefined
    },
    set(target, key: string, value) {
      target[key] = value
      return true
    },
  })
}

beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation((() => fake2d()) as unknown as HTMLCanvasElement['getContext'])
})
afterEach(() => vi.restoreAllMocks())

const TIERS: QualityTier[] = ['low', 'mid', 'high']

function build(tier: QualityTier) {
  const scene = new THREE.Scene()
  const before = [...scene.children]
  const dressed = lahore1929.build({ scene, tier, rng: mulberry32(seedFrom(lahore1929.id)) })
  const meshes: THREE.Mesh[] = []
  const lights: THREE.Light[] = []
  scene.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh)
    if ((o as THREE.Light).isLight) lights.push(o as THREE.Light)
  })
  return { scene, before, dressed, meshes, lights }
}

/** Every mesh vertex in world space. */
function* vertices(meshes: THREE.Mesh[]) {
  const v = new THREE.Vector3()
  for (const m of meshes) {
    m.updateWorldMatrix(true, false)
    const p = m.geometry.getAttribute('position')
    for (let i = 0; i < p.count; i++) yield v.fromBufferAttribute(p, i).applyMatrix4(m.matrixWorld)
  }
}

describe('lahore-1929 desk', () => {
  it('has the right id and an authored camera', () => {
    expect(lahore1929.id).toBe('lahore-1929')
    expect(lahore1929.camera.pos).toHaveLength(3)
    expect(lahore1929.camera.look).toHaveLength(3)
  })

  for (const tier of TIERS) {
    it(`builds at ${tier}: at least one light and five meshes, and updates without throwing`, () => {
      const { dressed, meshes, lights } = build(tier)
      expect(lights.length).toBeGreaterThanOrEqual(1)
      expect(meshes.length).toBeGreaterThanOrEqual(5)
      expect(() => {
        for (const t of [0, 16, 1000, 5000]) dressed.update(t)
      }).not.toThrow()
      dressed.dispose()
    })
  }

  it('adds no shadow-casting light at low', () => {
    const { lights, dressed } = build('low')
    expect(lights.filter((l) => l.castShadow)).toHaveLength(0)
    dressed.dispose()
  })

  it('casts the lamp shadow at high', () => {
    const { lights, dressed } = build('high')
    expect(lights.some((l) => l.castShadow)).toBe(true)
    dressed.dispose()
  })

  for (const tier of TIERS) {
    it(`dispose() at ${tier} leaves the scene as it was and frees what it built`, () => {
      const { scene, before, dressed, meshes } = build(tier)
      const geos = new Set(meshes.map((m) => m.geometry))
      const freed = new Set<THREE.BufferGeometry>()
      for (const g of geos) g.addEventListener('dispose', () => freed.add(g))
      dressed.dispose()
      expect(scene.children).toEqual(before)
      let left = 0
      scene.traverse(() => left++)
      expect(left).toBe(1)
      expect(freed.size).toBe(geos.size)
    })
  }

  it('keeps the paper and stamp spots clear, and the lamp inside its volume', () => {
    const { meshes, dressed } = build('high')
    const lamp = SPOTS.lamp
    let inPaper = 0
    let inStamps = 0
    let outsideLamp = 0
    for (const v of vertices(meshes)) {
      if (v.y <= 0.0025 || v.y > 1) continue // the desk top and blotter sit below the paper
      if (Math.abs(v.x - SPOTS.paper.x) < 0.12 && v.z > SPOTS.paper.z - 0.15 && v.z < SPOTS.paper.z + 0.15) inPaper++
      for (const s of [SPOTS.asli, SPOTS.tota]) {
        if (Math.hypot(v.x - s.x, v.z - s.z) < STAMP_R + 0.012 && v.y < 0.14) inStamps++
      }
      const r = Math.hypot(v.x - lamp.x, v.z - lamp.z)
      if (r < 0.1 && (r > lamp.r || v.y > lamp.h)) outsideLamp++
    }
    expect(inPaper).toBe(0)
    expect(inStamps).toBe(0)
    expect(outsideLamp).toBe(0)
    dressed.dispose()
  })
})
