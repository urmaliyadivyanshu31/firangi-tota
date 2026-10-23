import * as THREE from 'three'
import { describe, expect, it } from 'vitest'
import { DESK, FRAME_W, SPOTS, STAMP_R, framePoints, frameShot } from '../../src/scene/props'
import { sampleDressing } from '../../src/scene/eras/_sample'
import type { EraDressing } from '../../src/scene/types'

// Visible width at the look point, for a vertical fov in degrees.
const visibleWidth = (dist: number, fov: number, aspect: number) =>
  2 * dist * Math.tan(((fov * Math.PI) / 180) / 2) * aspect

/** Largest |x| or |y| of any prop outline in normalised device coordinates for this shot. */
function worstNdc(base: EraDressing['camera'], w: number, h: number): number {
  const s = frameShot(base, w / h)
  const cam = new THREE.PerspectiveCamera(s.fov, w / h, 0.03, 30)
  cam.position.copy(s.pos)
  cam.lookAt(s.look)
  cam.updateMatrixWorld()
  cam.updateProjectionMatrix()
  let worst = 0
  for (const p of framePoints()) {
    const v = p.clone().project(cam)
    worst = Math.max(worst, Math.abs(v.x), Math.abs(v.y))
  }
  return worst
}

describe('desk layout', () => {
  it('keeps the paper, both stamps and the lamp on the desk and inside the play area', () => {
    for (const s of [SPOTS.asli, SPOTS.tota]) {
      expect(Math.abs(s.x) + STAMP_R).toBeLessThanOrEqual(FRAME_W / 2)
      expect(Math.abs(s.z) + STAMP_R).toBeLessThanOrEqual(DESK.d / 2)
    }
    expect(Math.abs(SPOTS.lamp.x) + SPOTS.lamp.r).toBeLessThanOrEqual(FRAME_W / 2)
    expect(Math.abs(SPOTS.lamp.z) + SPOTS.lamp.r).toBeLessThanOrEqual(DESK.d / 2)
    expect(SPOTS.asli.x).toBeLessThan(SPOTS.paper.x) // ASLI on the left, like ArrowLeft
    expect(SPOTS.tota.x).toBeGreaterThan(SPOTS.paper.x)
    expect(FRAME_W).toBeLessThanOrEqual(DESK.w)
  })
})

describe('frameShot', () => {
  // R20: every prop on the shared spots sits fully in the portrait frame
  for (const [w, h] of [[360, 740], [390, 844], [360, 800], [412, 915]] as const) {
    it(`keeps every prop in frame on a ${w}×${h} phone`, () => {
      expect(worstNdc(sampleDressing.camera, w, h)).toBeLessThanOrEqual(1)
    })
  }

  it('keeps every prop in frame on landscape screens, and for a low, close camera', () => {
    expect(worstNdc(sampleDressing.camera, 1280, 720)).toBeLessThanOrEqual(1)
    expect(worstNdc(sampleDressing.camera, 1024, 768)).toBeLessThanOrEqual(1)
    expect(worstNdc({ pos: [0, 0.5, 0.6], look: [0, 0, 0] }, 390, 844)).toBeLessThanOrEqual(1)
  })

  it('dollies back on a narrow phone so the play area stays in frame', () => {
    const aspect = 390 / 844
    const s = frameShot(sampleDressing.camera, aspect)
    expect(visibleWidth(s.pos.distanceTo(s.look), s.fov, aspect)).toBeGreaterThanOrEqual(FRAME_W)
  })

  it('keeps the authored distance when everything already fits', () => {
    const far: EraDressing['camera'] = { pos: [0, 1.6, 1.8], look: [0, -0.1, 0] }
    const s = frameShot(far, 16 / 9)
    expect(s.pos.distanceTo(s.look)).toBeCloseTo(Math.hypot(1.7, 1.8), 5)
  })

  it('narrows the field of view as the screen gets wider', () => {
    expect(frameShot(sampleDressing.camera, 0.46).fov).toBeGreaterThan(frameShot(sampleDressing.camera, 1.78).fov)
  })
})
