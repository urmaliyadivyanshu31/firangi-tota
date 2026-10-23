import * as THREE from 'three'
import { afterEach, describe, expect, it, vi } from 'vitest'
import bombay1942 from '../../../src/scene/eras/bombay1942'
import { SPOTS } from '../../../src/scene/props'
import type { QualityTier } from '../../../src/scene/types'

// jsdom has no canvas backend. Half the runs use a recording 2D context, so the texture painters
// run their drawing code too; the other half keep jsdom's null context (blank textures).
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

const rng = (seed = 7) => () => {
  seed = (seed * 16807) % 2147483647
  return seed / 2147483647
}

function census(root: THREE.Object3D) {
  let lights = 0
  let shadowLights = 0
  let meshes = 0
  root.traverse((o) => {
    if ((o as THREE.Light).isLight) {
      lights++
      if ((o as THREE.Light).castShadow) shadowLights++
    }
    if ((o as THREE.Mesh).isMesh) meshes++
  })
  return { lights, shadowLights, meshes }
}

const posVersion = (m: THREE.Mesh) => (m.geometry.getAttribute('position') as THREE.BufferAttribute).version

afterEach(() => vi.restoreAllMocks())

describe('bombay-1942 desk', () => {
  it('has the right id, a camera and a warm lamp colour', () => {
    expect(bombay1942.id).toBe('bombay-1942')
    expect(bombay1942.camera.pos).toHaveLength(3)
    expect(bombay1942.camera.look).toHaveLength(3)
    expect(bombay1942.lightColor).toBeGreaterThan(0)
  })

  for (const tier of ['low', 'mid', 'high'] as QualityTier[]) {
    for (const ctx of ['null', 'recording'] as const) {
      it(`builds, animates and disposes cleanly at ${tier} (${ctx} 2D context)`, () => {
        if (ctx === 'recording') {
          vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
            () => fake2d() as unknown as CanvasRenderingContext2D,
          )
        } else {
          vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => null)
        }
        const scene = new THREE.Scene()
        const before = scene.children.slice()
        const d = bombay1942.build({ scene, tier, rng: rng() })
        const c = census(scene)
        expect(c.lights).toBeGreaterThanOrEqual(1)
        expect(c.meshes).toBeGreaterThanOrEqual(5)
        if (tier === 'low') expect(c.shadowLights).toBe(0)
        for (const t of [0, 16, 1000, 61_000]) expect(() => d.update(t)).not.toThrow()
        d.dispose()
        expect(scene.children).toEqual(before)
      })
    }
  }

  it('frees every geometry, material and texture it made', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => null)
    const disposed = new Set<unknown>()
    const made = new Set<unknown>()
    const scene = new THREE.Scene()
    const d = bombay1942.build({ scene, tier: 'high', rng: rng() })
    scene.traverse((o) => {
      const m = o as THREE.Mesh
      if (m.geometry) made.add(m.geometry)
      const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : []
      for (const mat of mats) {
        made.add(mat)
        for (const v of Object.values(mat)) if (v instanceof THREE.Texture) made.add(v)
      }
    })
    for (const x of made) (x as THREE.EventDispatcher<{ dispose: object }>).addEventListener('dispose', () => disposed.add(x))
    d.dispose()
    expect(made.size).toBeGreaterThan(20)
    for (const x of made) expect(disposed.has(x)).toBe(true)
  })

  it('keeps the moving parts out of the shadow pass and the lamp volume clear of props', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => null)
    const scene = new THREE.Scene()
    const d = bombay1942.build({ scene, tier: 'high', rng: rng() })
    scene.userData.shadowsDirty = false
    d.update(500)
    const snap = new Map<THREE.Mesh, { q: THREE.Quaternion; v: number }>()
    scene.traverse((o) => {
      const m = o as THREE.Mesh
      if (m.isMesh) snap.set(m, { q: m.quaternion.clone(), v: posVersion(m) })
    })
    d.update(9000)
    // whatever moved between the two frames must not cast a shadow, because the dressing never
    // asks for a shadow re-render
    let moved = 0
    for (const [m, s0] of snap) {
      if (!m.quaternion.equals(s0.q) || posVersion(m) !== s0.v) {
        moved++
        expect(m.castShadow).toBe(false)
      }
    }
    expect(moved).toBeGreaterThanOrEqual(3) // needle, second hand, curtain
    expect(scene.userData.shadowsDirty).toBe(false)
    // at least one light carries the lamp; it sits inside the lamp's volume
    let lamp: THREE.Light | null = null
    scene.traverse((o) => {
      if ((o as THREE.PointLight).isPointLight && !lamp && o.parent?.userData.warmLight) lamp = o as THREE.Light
    })
    expect(lamp).not.toBeNull()
    const p = (lamp as unknown as THREE.Light).position
    expect(Math.hypot(p.x - SPOTS.lamp.x, p.z - SPOTS.lamp.z)).toBeLessThan(SPOTS.lamp.r)
    expect(p.y).toBeLessThan(SPOTS.lamp.h)
    d.dispose()
  })
})
