import { describe, expect, it } from 'vitest'
import { PARALLAX_MAX, createParallaxModel } from '../../src/scene/parallax'

const run = (m: ReturnType<typeof createParallaxModel>, ms: number) => {
  let o = m.offset()
  for (let t = 0; t < ms; t += 16) o = m.step(16)
  return o
}

describe('pointer parallax', () => {
  it('stays inside its clamps however far the pointer goes', () => {
    const m = createParallaxModel()
    for (const [x, y] of [[1, 1], [-1, -1], [9, -9], [-40, 40]] as const) {
      m.hover(x, y)
      const o = run(m, 2000)
      expect(Math.abs(o.yaw)).toBeLessThanOrEqual(PARALLAX_MAX.yaw + 1e-9)
      expect(Math.abs(o.pitch)).toBeLessThanOrEqual(PARALLAX_MAX.pitch + 1e-9)
      m.drag(x, y)
      const d = run(m, 2000)
      expect(Math.abs(d.yaw)).toBeLessThanOrEqual(PARALLAX_MAX.yaw + 1e-9)
      expect(Math.abs(d.pitch)).toBeLessThanOrEqual(PARALLAX_MAX.pitch + 1e-9)
    }
    expect(PARALLAX_MAX.yaw).toBeCloseTo((6 * Math.PI) / 180)
    expect(PARALLAX_MAX.pitch).toBeCloseTo((4 * Math.PI) / 180)
  })

  it('a drag turns further than hovering, and both turn toward the pointer', () => {
    const m = createParallaxModel()
    m.hover(1, 1)
    const hover = run(m, 3000)
    m.drag(1, -1)
    const drag = run(m, 3000)
    expect(hover.yaw).toBeGreaterThan(0)
    expect(hover.pitch).toBeGreaterThan(0)
    expect(drag.yaw).toBeGreaterThan(hover.yaw)
    expect(drag.pitch).toBeGreaterThan(hover.pitch)
  })

  it('eases rather than jumps, and decays to zero when let go', () => {
    const m = createParallaxModel()
    m.drag(1, 1)
    const first = m.step(16)
    expect(Math.abs(first.yaw)).toBeLessThan(PARALLAX_MAX.yaw * 0.2)
    run(m, 2000)
    m.release()
    const half = run(m, 200)
    expect(Math.abs(half.yaw)).toBeGreaterThan(0)
    const rest = run(m, 4000)
    expect(rest.yaw).toBe(0)
    expect(rest.pitch).toBe(0)
  })
})
