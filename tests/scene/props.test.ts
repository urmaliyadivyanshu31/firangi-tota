import { describe, expect, it } from 'vitest'
import { DESK, FRAME_W, SPOTS, STAMP_R, frameShot } from '../../src/scene/props'

const base = { pos: [0, 0.75, 1.0] as [number, number, number], look: [0, -0.1, 0] as [number, number, number] }

// Visible width at the look point, for a vertical fov in degrees.
const visibleWidth = (dist: number, fov: number, aspect: number) =>
  2 * dist * Math.tan(((fov * Math.PI) / 180) / 2) * aspect

describe('desk layout', () => {
  it('keeps the paper and both stamps on the desk and inside the play area', () => {
    for (const s of [SPOTS.asli, SPOTS.tota]) {
      expect(Math.abs(s.x) + STAMP_R).toBeLessThanOrEqual(FRAME_W / 2)
      expect(Math.abs(s.z) + STAMP_R).toBeLessThanOrEqual(DESK.d / 2)
    }
    expect(SPOTS.asli.x).toBeLessThan(SPOTS.paper.x) // ASLI on the left, like ArrowLeft
    expect(SPOTS.tota.x).toBeGreaterThan(SPOTS.paper.x)
    expect(FRAME_W).toBeLessThanOrEqual(DESK.w)
  })
})

describe('frameShot', () => {
  it('dollies back on a narrow phone so the play area stays in frame', () => {
    const aspect = 390 / 844
    const s = frameShot(base, aspect)
    const dist = s.pos.distanceTo(s.look)
    expect(visibleWidth(dist, s.fov, aspect)).toBeGreaterThanOrEqual(FRAME_W)
  })

  it('keeps the authored distance on wide screens', () => {
    const s = frameShot(base, 16 / 9)
    expect(s.pos.distanceTo(s.look)).toBeCloseTo(Math.hypot(0.85, 1.0), 5)
  })

  it('narrows the field of view as the screen gets wider', () => {
    expect(frameShot(base, 0.46).fov).toBeGreaterThan(frameShot(base, 1.78).fov)
  })
})
