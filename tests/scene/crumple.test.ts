// The paper screwed up into a ball, the balls in the basket, and the hands that do it.
import { describe, expect, it } from 'vitest'
import * as THREE from 'three'
import { BALL_R, ballGeometry, crumpleAt, crumpleHalfWidth, createBinBalls, planCrumple } from '../../src/scene/crumple'
import { HAND_SCALE, createHands, mirrorPose, type HandPose } from '../../src/scene/hands'
import { BALL_IN_HAND, TOSS, TOSS_LANDS_MS, carryPose, dropFrom, gripPose } from '../../src/scene/toss'
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
  const pose = (curl: number, thumb = 0.3): HandPose => ({ pos: new THREE.Vector3(0.1, 0.05, 0.08), quat: new THREE.Quaternion(), curl, thumb })
  const palm = (p: HandPose) => new THREE.Vector3(0, 0, -1).applyQuaternion(p.quat)
  /** A point of the posed skin, in the hand's own frame (the GPU's skinning, done on the CPU). */
  const skinned = (hands: ReturnType<typeof createHands>, i: number) => {
    const skin = hands.right.root.getObjectByName('skin') as THREE.SkinnedMesh
    hands.right.root.updateMatrixWorld(true)
    skin.skeleton.update()
    return skin.getVertexPosition(i, new THREE.Vector3())
  }

  it('the left hand is the right one mirrored', () => {
    const r = gripPose(0.1, new THREE.Vector3(0, 0.05, 0), 0.5, 0.2, 0.5)
    const l = mirrorPose(r)
    expect(l.pos.x).toBeCloseTo(-r.pos.x, 9)
    expect(l.pos.y).toBeCloseTo(r.pos.y, 9)
    const fr = new THREE.Vector3(0, 1, 0).applyQuaternion(r.quat)
    const fl = new THREE.Vector3(0, 1, 0).applyQuaternion(l.quat)
    expect(fl.x).toBeCloseTo(-fr.x, 6)
    expect(fl.y).toBeCloseTo(fr.y, 6)
    expect(fl.z).toBeCloseTo(fr.z, 6)
  })

  it('crumpling, the palms face each other and a little down, never up; the thumb is on top', () => {
    const c = new THREE.Vector3(0, 0.06, 0)
    for (const k of [0, 0.2, 0.42, 0.76, 1]) {
      for (const twist of [-0.3, 0, 0.3]) {
        const p = gripPose(0.05 + 0.05 * (1 - k), c, k, twist, 0.5)
        const n = palm(p)
        expect(n.x).toBeLessThan(-0.6) // the right palm faces left, toward the paper and the other hand
        expect(n.y).toBeLessThan(0.15) // never palm up
        // the thumb's side of the hand (its -x) is up: the thumb lies along the top
        expect(new THREE.Vector3(-1, 0, 0).applyQuaternion(p.quat).y).toBeGreaterThan(0.35)
        // the fingers point away from the player, round the paper's sides, not at the other hand
        expect(new THREE.Vector3(0, 1, 0).applyQuaternion(p.quat).z).toBeLessThan(-0.6)
      }
    }
    // the palm is at the paper's edge, and squeezing presses it in
    expect(gripPose(0.06, c, 1, 0, 1).pos.x).toBeLessThan(gripPose(0.06, c, 1, 0, 0).pos.x)
  })

  it('carrying, the back of the hand is up and the ball sits under the palm', () => {
    const b = new THREE.Vector3(0.1, 0.09, 0.2)
    const p = carryPose(b, new THREE.Vector3(-0.3, 0, -1).normalize())
    expect(new THREE.Vector3(0, 0, 1).applyQuaternion(p.quat).y).toBeGreaterThan(0.8) // the back up
    expect(palm(p).y).toBeLessThan(-0.8) // the palm down over the ball, never turned up
    const ball = BALL_IN_HAND.clone().applyQuaternion(p.quat).add(p.pos)
    expect(ball.distanceTo(b)).toBeLessThan(1e-9)
    expect(p.pos.y).toBeGreaterThan(b.y) // the hand is over it
    // letting go, the fingers open and the hand stays the same way up: no flip
    const open = carryPose(b, new THREE.Vector3(-0.3, 0, -1).normalize(), 1)
    expect(open.curl).toBeLessThan(p.curl - 0.3)
    expect(palm(open).y).toBeLessThan(-0.7)
  })

  it('the drop: let go clear of the desk, gently, it falls into the basket in about a third of a second', () => {
    const end = new THREE.Vector3(0.34, -0.68, 0.47)
    const d = dropFrom(end, new THREE.Vector3(0, 0.07, 0), 0.28)
    expect(d.at.z).toBeGreaterThan(0.28 + BALL_R) // in front of the desk's edge
    expect(d.at.y).toBeLessThan(0.02)
    expect(d.secs).toBeGreaterThan(0.25)
    expect(d.secs).toBeLessThan(0.45)
    expect(Math.hypot(d.v.x, d.v.z)).toBeLessThan(0.6) // a drop, not a throw
    expect(d.v.y).toBeLessThanOrEqual(0) // let go, not flicked up
    const t = d.secs
    const at = new THREE.Vector3(d.at.x + d.v.x * t, d.at.y + d.v.y * t - 0.5 * 9.8 * t * t, d.at.z + d.v.z * t)
    expect(at.distanceTo(end)).toBeLessThan(1e-6)
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

  it('a hand is one seamless skin on a skeleton, shared by both hands, lighter on low', () => {
    const low = createHands({ tier: 'low', era: 'delhi-1857' })
    const high = createHands({ tier: 'high', era: 'delhi-1857' })
    const skinOf = (h: typeof low, side: 'left' | 'right') => h[side].root.getObjectByName('skin') as THREE.SkinnedMesh
    expect(skinOf(low, 'right').isSkinnedMesh).toBe(true)
    expect(skinOf(low, 'left').geometry).toBe(skinOf(low, 'right').geometry)
    expect(skinOf(low, 'right').skeleton).not.toBe(skinOf(low, 'left').skeleton)
    const g = skinOf(high, 'right').geometry
    expect(skinOf(low, 'right').geometry.getAttribute('position').count).toBeLessThan(g.getAttribute('position').count)
    expect(g.getAttribute('position').count).toBeLessThan(12000)
    // every point is tied to its bones with weights that add up to one
    const w = g.getAttribute('skinWeight')
    for (let i = 0; i < w.count; i += 37) expect(w.getX(i) + w.getY(i) + w.getZ(i) + w.getW(i)).toBeCloseTo(1, 5)
    low.dispose()
    high.dispose()
  })

  it('adult proportions: the middle finger is the longest, the thumb comes off the side near the wrist', () => {
    const hands = createHands({ tier: 'low', era: 'delhi-1857' })
    const skin = hands.right.root.getObjectByName('skin') as THREE.SkinnedMesh
    hands.right.set(pose(0, 0))
    const n = skin.geometry.getAttribute('position').count
    let tip = new THREE.Vector3(0, -1, 0)
    let thumbTip = new THREE.Vector3(1, 0, 0)
    for (let i = 0; i < n; i++) {
      const p = skinned(hands, i)
      if (p.y > tip.y) tip = p
      if (p.x < thumbTip.x) thumbTip = p
    }
    // the wrist to the middle fingertip about 16 to 19 cm, the tip in line with the middle of the hand
    expect(tip.y * HAND_SCALE).toBeGreaterThan(0.155)
    expect(tip.y * HAND_SCALE).toBeLessThan(0.185)
    expect(Math.abs(tip.x)).toBeLessThan(0.02)
    // the thumb is out on its own side, its tip well short of the fingertips
    expect(thumbTip.x).toBeLessThan(-0.05)
    expect(thumbTip.y).toBeLessThan(tip.y * 0.6)
    hands.dispose()
  })

  it('curling the fingers moves the fingertips toward the palm; the forearm turns toward the elbow', () => {
    const hands = createHands({ tier: 'low', era: 'delhi-1947' })
    const skin = hands.right.root.getObjectByName('skin') as THREE.SkinnedMesh
    const sleeve = hands.right.root.getObjectByName('sleeve') as THREE.Mesh
    const bind = skin.geometry.getAttribute('position')
    // the point furthest along the hand as meshed: a fingertip
    let tip = 0
    for (let i = 0; i < bind.count; i++) if (bind.getY(i) > bind.getY(tip)) tip = i
    hands.right.set(pose(0))
    const open = skinned(hands, tip)
    hands.right.set(pose(0.6))
    const shut = skinned(hands, tip)
    expect(shut.z).toBeLessThan(open.z - 0.03) // folded toward the palm side
    expect(shut.y).toBeLessThan(open.y - 0.04)
    const elbow = new THREE.Vector3(0.1, -0.2, 0.3)
    hands.right.aim(elbow)
    hands.right.root.updateMatrixWorld(true)
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(sleeve.getWorldQuaternion(new THREE.Quaternion()))
    const toElbow = elbow.clone().sub(sleeve.getWorldPosition(new THREE.Vector3())).normalize()
    expect(up.dot(toElbow)).toBeGreaterThan(0.6) // up the sleeve is toward the elbow
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
    expect(TOSS.fly).toBeGreaterThan(250) // about as long as a real drop of half a metre
    expect(TOSS_LANDS_MS).toBeGreaterThanOrEqual(2200)
    expect(TOSS_LANDS_MS).toBeLessThanOrEqual(2600)
    const crumple = TOSS.squeezes.reduce((a, b) => a + b, 0)
    expect(crumple).toBeGreaterThanOrEqual(900)
    expect(crumple).toBeLessThanOrEqual(1100)
    expect(TOSS.squeezes.length).toBeGreaterThanOrEqual(2)
    expect(TOSS.squeezes.length).toBeLessThanOrEqual(3)
  })
})
