import { describe, expect, it } from 'vitest'
import { createTweens, ease } from '../../src/scene/tween'

describe('ease', () => {
  it('maps 0 to 0 and 1 to 1', () => {
    for (const f of Object.values(ease)) {
      expect(f(0)).toBeCloseTo(0)
      expect(f(1)).toBeCloseTo(1)
    }
  })
})

describe('createTweens', () => {
  it('runs a tween over its duration and resolves at the end', async () => {
    const tw = createTweens()
    const seen: number[] = []
    let done = false
    const p = tw.run(100, (k) => seen.push(k)).then(() => (done = true))
    tw.tick(40)
    expect(seen[seen.length - 1]).toBeCloseTo(0.4)
    await Promise.resolve()
    expect(done).toBe(false)
    tw.tick(80)
    await p
    expect(seen[seen.length - 1]).toBe(1)
    expect(tw.busy()).toBe(false)
  })

  it('waits for a delay', async () => {
    const tw = createTweens()
    let done = false
    const p = tw.wait(50).then(() => (done = true))
    tw.tick(30)
    await Promise.resolve()
    expect(done).toBe(false)
    tw.tick(30)
    await p
    expect(done).toBe(true)
  })

  it('finishes every running tween on clear so promises never hang', async () => {
    const tw = createTweens()
    const seen: number[] = []
    const p = tw.run(1000, (k) => seen.push(k))
    tw.clear()
    await p
    expect(seen[seen.length - 1]).toBe(1)
  })

  it('in instant mode, finishes new tweens at once (lost or disposed stage)', async () => {
    const tw = createTweens()
    tw.setInstant(true)
    const seen: number[] = []
    await tw.run(500, (k) => seen.push(k))
    await tw.wait(500)
    expect(seen).toEqual([1])
    expect(tw.busy()).toBe(false)
  })
})
