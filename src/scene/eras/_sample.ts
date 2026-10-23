// A sample dressing for testing and screenshots: an empty room, the shared desk and a brass
// oil lamp. The real era desks live next to this file.
import * as THREE from 'three'
import { ERA_PALETTES, mix } from '../palette'
import { SPOTS, createDesk, createRoomShell, createWarmLight, disposeTree, material } from '../props'
import { makeNoise, toTexture } from '../textures'
import type { DressingHooks, EraDressing } from '../types'

const pal = ERA_PALETTES['delhi-1857']
const FLAME: [number, number, number] = [SPOTS.lamp.x, 0.252, SPOTS.lamp.z]

/**
 * The lamp body is unlit with a baked gradient: a light 2 cm from brass blows it out to white,
 * and an unlit body costs less anyway.
 */
function lampBody(rng: () => number, size: number): THREE.Mesh {
  const c = document.createElement('canvas')
  c.width = 16
  c.height = size
  const g = c.getContext('2d')
  if (g) {
    const grad = g.createLinearGradient(0, size, 0, 0)
    grad.addColorStop(0, '#24160a')
    grad.addColorStop(0.45, '#6a4518')
    grad.addColorStop(0.82, '#c48a38')
    grad.addColorStop(1, '#ffd88e')
    g.fillStyle = grad
    g.fillRect(0, 0, 16, size)
    const n = makeNoise(rng)
    for (let y = 0; y < size; y++) {
      g.fillStyle = `rgba(0,0,0,${(n(0, (y / size) * 24, 1, 24) * 0.22).toFixed(3)})`
      g.fillRect(0, y, 16, 1)
    }
  }
  const tex = toTexture(c)
  const profile: [number, number][] = [
    [0, 0], [0.058, 0], [0.06, 0.006], [0.048, 0.012], [0.03, 0.02], [0.015, 0.032], [0.012, 0.06],
    [0.019, 0.068], [0.011, 0.08], [0.0085, 0.16], [0.016, 0.168], [0.01, 0.178], [0.012, 0.212],
    [0.044, 0.22], [0.05, 0.229], [0.046, 0.236], [0.032, 0.231], [0.006, 0.229], [0.006, 0.238], [0, 0.238],
  ]
  const geo = new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), 18)
  const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex }))
  mesh.position.set(SPOTS.lamp.x, 0, SPOTS.lamp.z)
  return mesh
}

const SAMPLE_HOOKS: DressingHooks = {
  title: { pos: [0, 0.5, -0.545], w: 0.46 },
  wideFrame: [
    [-0.42, 0.62, -0.55],
    [0.42, 0.62, -0.55],
  ],
}

export const sampleDressing: EraDressing = {
  id: 'delhi-1857',
  camera: { pos: [0, 0.98, 0.92], look: [0, -0.12, 0.06] },
  lightColor: pal.lamp,
  build({ scene, tier, rng }) {
    const room = createRoomShell({ palette: pal, tier, rng, floorY: -0.76 })
    const desk = createDesk({ palette: pal, tier, rng, legs: 'turned' })
    const lamp = lampBody(rng, 128)
    // a small dark pool of oil under the wick
    const oil = new THREE.Mesh(
      new THREE.CircleGeometry(0.03, 14).rotateX(-Math.PI / 2),
      material(tier, { color: mix(pal.shade, 0x3a2410, 0.3), shininess: 90, specular: 0x553311 }),
    )
    oil.position.set(SPOTS.lamp.x, 0.2315, SPOTS.lamp.z)
    const light = createWarmLight({ tier, color: pal.lamp, position: FLAME, intensity: 1, glow: 'flame' })
    scene.add(room, desk.group, lamp, oil, light.group)
    return {
      update: (t) => light.update(t),
      dispose() {
        disposeTree(room)
        desk.dispose()
        disposeTree(lamp)
        disposeTree(oil)
        light.dispose()
      },
      hooks: SAMPLE_HOOKS,
    }
  },
}
