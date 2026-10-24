// Every era desk has the basket a read paper is tossed into: on every tier, in the scene, in front
// of the desk where the toss shot can see it, and wide enough at its foot to take a sheet.
import * as THREE from 'three'
import { describe, expect, it } from 'vitest'
import { ALL_DRESSINGS } from '../../../src/scene/eras/index'
import { SHEET_W } from '../../../src/scene/message'
import { DESK } from '../../../src/scene/props'

const rng = () => {
  let s = 11
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

describe('the basket on every desk', () => {
  it('there are four desks', () => {
    expect(ALL_DRESSINGS.map((d) => d.id).sort()).toEqual(['bombay-1942', 'delhi-1857', 'delhi-1947', 'lahore-1929'])
  })

  for (const d of ALL_DRESSINGS) {
    for (const tier of ['low', 'mid', 'high'] as const) {
      it(`${d.id} at ${tier}: a basket in the room, in front of the desk, that a sheet fits in`, () => {
        const scene = new THREE.Scene()
        const dressed = d.build({ scene, tier, rng: rng() })
        const b = dressed.hooks?.basket
        expect(b).toBeDefined()
        if (!b) return
        // it is drawn: in the scene graph, visible all the way up, with something to draw
        const obj = b.obj
        expect(obj).toBeDefined()
        let root: THREE.Object3D | null = obj ?? null
        while (root?.parent) {
          expect(root.visible).toBe(true)
          root = root.parent
        }
        expect(root).toBe(scene)
        let meshes = 0
        obj?.traverse((o) => {
          if ((o as THREE.Mesh).isMesh) meshes++
        })
        expect(meshes).toBeGreaterThan(0)
        // on the floor below the desk top, its mouth wholly in front of the desk's front edge
        const [, my, mz] = b.mouth
        expect(my).toBeLessThan(-0.1)
        expect(mz - b.r).toBeGreaterThan(DESK.d / 2)
        // a sheet's width fits across its mouth and its floor
        expect(b.r * 2).toBeGreaterThan(SHEET_W + 0.04)
        expect((b.foot ?? b.r) * 2).toBeGreaterThan(SHEET_W + 0.016)
        expect(b.depth).toBeGreaterThan(0.1)
        dressed.dispose()
      })
    }
  }
})
