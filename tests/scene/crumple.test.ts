// The paper screwed up into a ball, the balls in the basket, and the hands that do it.
import { describe, expect, it } from 'vitest'
import * as THREE from 'three'
import { BALL_R, ballGeometry, crumpleAt, crumpleHalfWidth, createBinBalls, planCrumple } from '../../src/scene/crumple'
import { createHands, mirrorPose, type HandPose } from '../../src/scene/hands'
import { TOSS, TOSS_LANDS_MS, holdPose, palmUpPose } from '../../src/scene/toss'
import type { EraId } from '../../src/content/types'

const W = 0.21
const H = 0.3

function extent(a: Float32Array) {
  const lo = [Infinity, Infinity, Infinity]
  const hi = [-Infinity, -Infinity, -Infinity]
  for (let i = 0; i < a.length; i += 3) {
    for (let k = 0; k < 3; k++) {
      lo[k] = Math.min(lo[k]!, a[i + k]!)
      hi[k] = Math.max(hi[k]!, a[i + k]!)
    }
  }
  return hi.map((h, k) => h - lo[k]!)
}

describe('the crumple', () => {
  const shape = planCrumple(16, 22, W, H, 7)
  const out = new Float32Array(shape.flat.length)

  it('starts as the flat sheet, exactly where the sheet lay', () => {
    crumpleAt(shape, 0, 0, out)
    const [x, y, z] = extent(out)
    expect(x).toBeCloseTo(W, 5)
    expect(z).toBeCloseTo(H, 5)
    expect(y).toBeLessThan(1e-9)
  })

  it('is pushed in from the sides first, then gathers into a ball about 7.5 cm across', () => {
    const widths = [0, 0.42, 1].map((k) => {
      crumpleAt(shape, k, 0, out)
      return extent(out)[0]!
    })
    for (let i = 1; i < widths.length; i++) expect(widths[i]!).toBeLessThan(widths[i - 1]!)
    // the length gathers too: by the last squeeze it is no longer a sheet
    crumpleAt(shape, 0.76, 0, out)
    expect(extent(out)[2]!).toBeLessThan(H * 0.5)
    crumpleAt(shape, 1, 0, out)
    const size = extent(out)
    for (const s of size) {
      expect(s).toBeGreaterThan(BALL_R * 1.5)
      expect(s).toBeLessThan(BALL_R * 2.5)
    }
    // every point is on or inside a rough ball round the middle
    for (let i = 0; i < out.length; i += 3) expect(Math.hypot(out[i]!, out[i + 1]!, out[i + 2]!)).toBeLessThan(BALL_R * 1.2)
  })

  it('buckles along its creases on the way: the squeezed sheet is no longer flat', () => {
    crumpleAt(shape, 0.42, 0, out)
    expect(extent(out)[1]!).toBeGreaterThan(0.01)
  })

  it('the palms follow the paper in: the half width shrinks to the ball', () => {
    let last = Infinity
    for (let k = 0; k <= 1.0001; k += 0.1) {
      const hw = crumpleHalfWidth(shape, k)
      expect(hw).toBeLessThan(last + 1e-9)
      last = hw
    }
    expect(crumpleHalfWidth(shape, 0)).toBeCloseTo(W / 2, 5)
    expect(crumpleHalfWidth(shape, 1)).toBeCloseTo(BALL_R * 0.92, 5)
  })

  it('wringing turns the two sides opposite ways', () => {
    crumpleAt(shape, 0.42, 0, out)
    const still = Float32Array.from(out)
    crumpleAt(shape, 0.42, 0.3, out)
    let moved = 0
    for (let i = 0; i < out.length; i++) moved = Math.max(moved, Math.abs(out[i]! - still[i]!))
    expect(moved).toBeGreaterThan(0.005)
  })

  it('each paper is its own ball', () => {
    const a = planCrumple(8, 10, W, H, 1)
    const b = planCrumple(8, 10, W, H, 2)
    expect(Array.from(a.ball)).not.toEqual(Array.from(b.ball))
    expect(Array.from(planCrumple(8, 10, W, H, 1).ball)).toEqual(Array.from(a.ball))
  })
})

describe('the balls in the basket', () => {
  it('are one instanced mesh, one draw call however many there are; an empty basket shows nothing', () => {
    const bin = createBinBalls('low', 0xe8dcc0, 13)
    const at = (i: number) => ({ pos: new THREE.Vector3(i * 0.08, 0, 0), quat: new THREE.Quaternion(), s: 1 })
    bin.set([])
    expect(bin.group.children).toHaveLength(0)
    bin.set([at(0), at(1), at(2)])
    expect(bin.group.children).toHaveLength(1)
    const mesh = bin.group.children[0] as THREE.InstancedMesh
    expect(mesh.isInstancedMesh).toBe(true)
    expect(mesh.count).toBe(3)
    // more than it holds: the latest ones show
    bin.set(Array.from({ length: 20 }, (_, i) => at(i)))
    expect(mesh.count).toBe(13)
    const m = new THREE.Matrix4()
    mesh.getMatrixAt(12, m)
    expect(new THREE.Vector3().setFromMatrixPosition(m).x).toBeCloseTo(19 * 0.08, 5)
    bin.set([])
    expect(bin.group.children).toHaveLength(0)
    bin.dispose()
  })

  it('a ball is closed and lumpy, about the size of the one in the hands, and cheaper on low', () => {
    const low = ballGeometry('low')
    const high = ballGeometry('high')
    expect(low.getAttribute('position').count).toBeLessThan(high.getAttribute('position').count)
    const p = high.getAttribute('position')
    let rMin = Infinity
    let rMax = 0
    for (let i = 0; i < p.count; i++) {
      const r = Math.hypot(p.getX(i), p.getY(i), p.getZ(i))
      rMin = Math.min(rMin, r)
      rMax = Math.max(rMax, r)
    }
    expect(rMax).toBeLessThan(BALL_R * 1.15)
    expect(rMin).toBeGreaterThan(BALL_R * 0.6)
    expect(rMax - rMin).toBeGreaterThan(BALL_R * 0.08) // lumpy, not a sphere
  })
})

describe('the hands', () => {
  const pose = (curl: number): HandPose => ({ pos: new THREE.Vector3(0.1, 0.05, 0.08), quat: new THREE.Quaternion(), curl, thumb: 0.3 })

  it('the left hand is the right one mirrored', () => {
    const r = holdPose(0.1, new THREE.Vector3(0, 0.05, 0), 0.5, 0.2, 0.5)
    const l = mirrorPose(r)
    expect(l.pos.x).toBeCloseTo(-r.pos.x, 9)
    expect(l.pos.y).toBeCloseTo(r.pos.y, 9)
    const fr = new THREE.Vector3(0, 1, 0).applyQuaternion(r.quat)
    const fl = new THREE.Vector3(0, 1, 0).applyQuaternion(l.quat)
    expect(fl.x).toBeCloseTo(-fr.x, 6)
    expect(fl.y).toBeCloseTo(fr.y, 6)
    expect(fl.z).toBeCloseTo(fr.z, 6)
  })

  it('holding the paper, the palm is pressed to its side and faces the other hand', () => {
    const c = new THREE.Vector3(0, 0.06, 0)
    const p = holdPose(0.06, c, 1, 0, 0)
    const palmNormal = new THREE.Vector3(0, 0, -1).applyQuaternion(p.quat)
    expect(palmNormal.x).toBeLessThan(-0.7) // the right palm faces left, toward the ball
    expect(p.pos.x).toBeGreaterThan(0.06)
    // palm up with the ball in it
    const up = palmUpPose(new THREE.Vector3(0.02, 0.06, 0.01))
    expect(new THREE.Vector3(0, 0, -1).applyQuaternion(up.quat).y).toBeGreaterThan(0.85)
  })

  for (const era of ['delhi-1857', 'lahore-1929', 'bombay-1942', 'delhi-1947'] as EraId[]) {
    it(`${era}: two hands and two sleeves, four meshes, hidden until a toss, casting no shadow`, () => {
      const hands = createHands({ tier: 'mid', era })
      expect(hands.group.visible).toBe(false)
      const meshes: THREE.Mesh[] = []
      hands.group.traverse((o) => {
        if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh)
      })
      expect(meshes).toHaveLength(4)
      for (const m of meshes) expect(m.castShadow).toBe(false)
      hands.dispose()
    })
  }

  it('curling the fingers moves the fingertips toward the palm; the sleeve turns toward the elbow', () => {
    const hands = createHands({ tier: 'low', era: 'delhi-1947' })
    const skin = hands.right.root.getObjectByName('skin') as THREE.Mesh
    const sleeve = hands.right.root.getObjectByName('sleeve') as THREE.Mesh
    const p = skin.geometry.getAttribute('position')
    hands.right.set(pose(0))
    // the point furthest along the hand: a fingertip
    let tip = 0
    for (let i = 0; i < p.count; i++) if (p.getY(i) > p.getY(tip)) tip = i
    const open = { y: p.getY(tip), z: p.getZ(tip) }
    hands.right.set(pose(0.5))
    expect(p.getZ(tip)).toBeLessThan(open.z - 0.03) // folded toward the palm side
    expect(p.getY(tip)).toBeLessThan(open.y - 0.04)
    hands.right.aim(new THREE.Vector3(0.1, 0.05, 0.6))
    const along = new THREE.Vector3(0, 1, 0).applyQuaternion(sleeve.quaternion)
    expect(along.y).toBeLessThan(-0.5) // back up the forearm, away from the fingers
    hands.dispose()
  })

  it('the 1947 shirt cuff carries a button; the khadi sleeve is rolled up over a bare forearm', () => {
    const count = (era: EraId) => {
      const h = createHands({ tier: 'mid', era })
      const n = (h.right.root.getObjectByName('sleeve') as THREE.Mesh).geometry.getAttribute('position').count
      h.dispose()
      return n
    }
    expect(count('delhi-1947')).toBeGreaterThan(count('lahore-1929'))
    const h = createHands({ tier: 'mid', era: 'bombay-1942' })
    const col = (h.right.root.getObjectByName('sleeve') as THREE.Mesh).geometry.getAttribute('color')
    const pos = (h.right.root.getObjectByName('sleeve') as THREE.Mesh).geometry.getAttribute('position')
    let skinish = 0
    for (let i = 0; i < pos.count; i++) if (pos.getY(i) < 0.05 && col.getX(i) > col.getZ(i) * 1.3) skinish++
    expect(skinish).toBeGreaterThan(10)
    h.dispose()
  })
})

describe('the beats', () => {
  it('land the ball 2.2 to 2.6 s after the hold ends, with two or three squeezes of about a second in all', () => {
    expect(TOSS_LANDS_MS).toBeGreaterThanOrEqual(2200)
    expect(TOSS_LANDS_MS).toBeLessThanOrEqual(2600)
    const crumple = TOSS.squeezes.reduce((a, b) => a + b, 0)
    expect(crumple).toBeGreaterThanOrEqual(900)
    expect(crumple).toBeLessThanOrEqual(1100)
    expect(TOSS.squeezes.length).toBeGreaterThanOrEqual(2)
    expect(TOSS.squeezes.length).toBeLessThanOrEqual(3)
  })
})
