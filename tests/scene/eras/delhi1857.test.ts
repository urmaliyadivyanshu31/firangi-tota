import * as THREE from 'three'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { mulberry32 } from '../../../src/game/rng'
import delhi1857 from '../../../src/scene/eras/delhi1857'
import { PAPER, SPOTS, STAMP_R } from '../../../src/scene/props'
import type { QualityTier } from '../../../src/scene/types'

const TIERS: QualityTier[] = ['low', 'mid', 'high']

// jsdom has no 2D canvas; the texture helpers already cope with a null context, so say so quietly
beforeAll(() => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation((() => null) as unknown as HTMLCanvasElement['getContext'])
})
afterAll(() => {
  vi.restoreAllMocks()
})

function build(tier: QualityTier) {
  const scene = new THREE.Scene()
  const before = scene.children.length
  const handle = delhi1857.build({ scene, tier, rng: mulberry32(1857) })
  const added = scene.children.slice(before)
  const lights: THREE.Light[] = []
  const draws: THREE.Object3D[] = []
  for (const root of added) {
    root.traverse((o) => {
      if ((o as THREE.Light).isLight) lights.push(o as THREE.Light)
      if ((o as THREE.Mesh).isMesh || (o as THREE.Points).isPoints || (o as THREE.Sprite).isSprite) draws.push(o)
    })
  }
  return { scene, before, handle, added, lights, draws }
}

describe('delhi-1857 desk', () => {
  it('has the right id', () => {
    expect(delhi1857.id).toBe('delhi-1857')
  })

  for (const tier of TIERS) {
    it(`adds a light and at least five meshes at ${tier}`, () => {
      const { lights, draws, handle } = build(tier)
      expect(lights.length).toBeGreaterThanOrEqual(1)
      expect(draws.filter((o) => (o as THREE.Mesh).isMesh).length).toBeGreaterThanOrEqual(5)
      handle.update(0)
      handle.update(1234)
      handle.dispose()
    })
  }

  it('casts no shadows from any light at low', () => {
    const { lights, handle } = build('low')
    expect(lights.filter((l) => l.castShadow)).toEqual([])
    handle.dispose()
  })

  it('stays inside the draw budget: 35 objects at low, 90 at high', () => {
    const low = build('low')
    const high = build('high')
    expect(low.draws.length).toBeLessThanOrEqual(35)
    expect(high.draws.length).toBeLessThanOrEqual(90)
    expect(low.draws.length).toBeLessThan(high.draws.length)
    low.handle.dispose()
    high.handle.dispose()
  })

  it('leaves the scene as it was after dispose', () => {
    for (const tier of TIERS) {
      const { scene, before, handle } = build(tier)
      expect(scene.children.length).toBeGreaterThan(before)
      handle.dispose()
      expect(scene.children.length).toBe(before)
    }
  })

  it('keeps the paper and the two stamp spots clear', () => {
    for (const tier of TIERS) {
      const { added, handle } = build(tier)
      const v = new THREE.Vector3()
      const hits: string[] = []
      const cos = Math.cos(SPOTS.paper.yaw)
      const sin = Math.sin(SPOTS.paper.yaw)
      for (const root of added) {
        root.updateMatrixWorld(true)
        root.traverse((o) => {
          const mesh = o as THREE.Mesh
          if (!mesh.isMesh && !(o as THREE.Points).isPoints) return
          const p = mesh.geometry.getAttribute('position')
          for (let i = 0; i < p.count; i++) {
            v.fromBufferAttribute(p, i).applyMatrix4(mesh.matrixWorld)
            if (v.y < 0.0025 || v.y > 0.16) continue
            // the sheet's rectangle in its own frame, with a 1.5 cm margin
            const dx = v.x - SPOTS.paper.x
            const dz = v.z - SPOTS.paper.z
            const lx = dx * cos - dz * sin
            const lz = dx * sin + dz * cos
            if (Math.abs(lx) < PAPER.w / 2 + 0.015 && Math.abs(lz) < PAPER.h / 2 + 0.015) hits.push(`paper ${v.toArray()}`)
            for (const s of [SPOTS.asli, SPOTS.tota]) {
              if (Math.hypot(v.x - s.x, v.z - s.z) < STAMP_R + 0.03) hits.push(`stamp ${v.toArray()}`)
            }
          }
        })
      }
      expect(hits.slice(0, 5), tier).toEqual([])
      handle.dispose()
    }
  })
})
