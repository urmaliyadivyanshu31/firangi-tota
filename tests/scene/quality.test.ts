import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  TIER_SETTINGS,
  createQualityManager,
  createTierControl,
  loadSavedCeiling,
  loadSavedTier,
  parseTierParam,
  pickInitialTier,
  saveTier,
  startTier,
} from '../../src/scene/quality'
import type { QualityTier } from '../../src/scene/types'

describe('pickInitialTier', () => {
  it('puts old Mali GPUs on low', () => {
    expect(pickInitialTier({ dpr: 3, gpu: 'Mali-T720', minSide: 360 })).toBe('low')
  })
  it('starts Apple GPUs on high', () => {
    expect(pickInitialTier({ dpr: 2, gpu: 'Apple GPU', minSide: 390, cores: 6 })).toBe('high')
  })
  it('puts an Adreno 610 phone with 4 GB on mid', () => {
    expect(pickInitialTier({ dpr: 2, gpu: 'Adreno (TM) 610', minSide: 393, cores: 8, memGB: 4 })).toBe('mid')
  })
  it('puts a Mali-G52 on mid', () => {
    expect(pickInitialTier({ dpr: 2, gpu: 'Mali-G52 MC2', minSide: 360, cores: 8, memGB: 4 })).toBe('mid')
  })
  it('does not mistake a flagship Mali-G710 for a Mali-G71', () => {
    expect(pickInitialTier({ dpr: 2.75, gpu: 'Mali-G710 MC10', minSide: 412, cores: 8, memGB: 8 })).toBe('high')
  })
  it('sends software renderers and 2 GB phones to low', () => {
    expect(pickInitialTier({ dpr: 1, gpu: 'Google SwiftShader', minSide: 800, cores: 8 })).toBe('low')
    expect(pickInitialTier({ dpr: 2, gpu: 'Adreno (TM) 730', minSide: 393, cores: 8, memGB: 2 })).toBe('low')
  })
  it('caps a hidden GPU string at mid', () => {
    expect(pickInitialTier({ dpr: 2, gpu: '', minSide: 390, cores: 8 })).toBe('mid')
  })
  it('caps big dense screens on unknown Android GPUs at mid', () => {
    expect(pickInitialTier({ dpr: 3, gpu: 'Adreno (TM) 660', minSide: 412, cores: 8, memGB: 8 })).toBe('high')
    expect(pickInitialTier({ dpr: 3, gpu: 'Maleoon 910', minSide: 412, cores: 8, memGB: 8 })).toBe('mid')
  })
})

describe('TIER_SETTINGS', () => {
  it('matches the brief per tier', () => {
    expect(TIER_SETTINGS.high).toMatchObject({ maxDpr: 2, antialias: true, shadows: 'pcf', shadowSize: 1024 })
    expect(TIER_SETTINGS.mid).toMatchObject({ maxDpr: 1.5, antialias: false, shadows: 'basic', shadowSize: 512 })
    expect(TIER_SETTINGS.low).toMatchObject({ maxDpr: 1, antialias: false, shadows: 'none', materials: 'cheap' })
    expect(TIER_SETTINGS.low.dust).toBeLessThan(TIER_SETTINGS.mid.dust)
  })
})

describe('createQualityManager', () => {
  const feed = (m: { sample(ms: number): void }, ms: number, n: number) => {
    for (let i = 0; i < n; i++) m.sample(ms)
  }

  it('steps down after 120 samples averaging over 22 ms', () => {
    const apply = vi.fn()
    const m = createQualityManager('high', apply)
    feed(m, 25, 119)
    expect(m.tier()).toBe('high')
    expect(apply).not.toHaveBeenCalled()
    m.sample(25)
    expect(m.tier()).toBe('mid')
    expect(apply).toHaveBeenCalledWith('mid')
  })

  it('holds when frames average just under 22 ms', () => {
    const apply = vi.fn()
    const m = createQualityManager('high', apply)
    feed(m, 21.5, 600)
    expect(m.tier()).toBe('high')
    expect(apply).not.toHaveBeenCalled()
  })

  it('steps up exactly once on a steady 16.7 ms (60 Hz vsync) stream', () => {
    const seen: QualityTier[] = []
    const m = createQualityManager('low', (t) => seen.push(t))
    feed(m, 16.7, 239)
    expect(m.tier()).toBe('low')
    m.sample(16.7) // 240 consecutive samples, average and p95 both 16.7 ms
    expect(m.tier()).toBe('mid')
    feed(m, 16.7, 5000)
    expect(m.tier()).toBe('mid')
    expect(seen).toEqual(['mid'])
  })

  it('does not step up when the average is fine but the p95 is over 20 ms', () => {
    const apply = vi.fn()
    const m = createQualityManager('low', apply)
    // 90% at 14 ms and 10% at 30 ms: average 15.6 ms, but p95 is 30 ms
    for (let i = 0; i < 2000; i++) m.sample(i % 10 === 0 ? 30 : 14)
    expect(m.tier()).toBe('low')
    expect(apply).not.toHaveBeenCalled()
  })

  it('does not step up when frames average over 17.5 ms', () => {
    const apply = vi.fn()
    const m = createQualityManager('mid', apply)
    feed(m, 18, 2000)
    expect(m.tier()).toBe('mid')
    expect(apply).not.toHaveBeenCalled()
  })

  it('never leaves the low/high bounds', () => {
    const apply = vi.fn()
    const low = createQualityManager('low', apply)
    feed(low, 40, 1000)
    expect(low.tier()).toBe('low')
    const high = createQualityManager('high', apply)
    feed(high, 8, 1000)
    expect(high.tier()).toBe('high')
    expect(apply).not.toHaveBeenCalled()
  })

  it('changes tier at most once every 3 s', () => {
    const seen: QualityTier[] = []
    const m = createQualityManager('high', (t) => seen.push(t))
    feed(m, 23, 120) // 2.76 s of slow frames: first step is allowed
    expect(seen).toEqual(['mid'])
    feed(m, 23, 120) // window full again, but only 2.76 s since the last change
    expect(m.tier()).toBe('mid')
    feed(m, 23, 11) // 131 × 23 ms = 3.01 s since the change
    expect(seen).toEqual(['mid', 'low'])
  })

  it('blocks any later step-up once it has stepped down', () => {
    const seen: QualityTier[] = []
    const m = createQualityManager('mid', (t) => seen.push(t))
    feed(m, 30, 120)
    expect(m.tier()).toBe('low')
    feed(m, 16.7, 5000) // would step up in a fresh session
    expect(m.tier()).toBe('low')
    expect(seen).toEqual(['low'])
    expect(m.info()).toMatchObject({ steppedDown: true, steppedUp: false })
  })

  it('can still step down after its one step-up', () => {
    const seen: QualityTier[] = []
    const m = createQualityManager('low', (t) => seen.push(t))
    feed(m, 16.7, 240)
    feed(m, 30, 120)
    expect(seen).toEqual(['mid', 'low'])
    feed(m, 16.7, 5000)
    expect(seen).toEqual(['mid', 'low'])
  })

  it('does not step down on a 33 ms low-variance stream (iOS Low Power Mode cap)', () => {
    const apply = vi.fn()
    const m = createQualityManager('high', apply)
    for (let i = 0; i < 1000; i++) m.sample(33.3 + Math.sin(i) * 0.6)
    expect(m.tier()).toBe('high')
    expect(apply).not.toHaveBeenCalled()
  })

  it('keeps the 30 fps cap through one missed frame (66.7 ms) in the window', () => {
    const apply = vi.fn()
    const m = createQualityManager('high', apply)
    for (let i = 0; i < 1200; i++) m.sample(i % 120 === 60 ? 66.7 : 33.3)
    expect(m.tier()).toBe('high')
    expect(apply).not.toHaveBeenCalled()
  })

  it('keeps the 30 fps cap through two missed frames in one window', () => {
    const apply = vi.fn()
    const m = createQualityManager('high', apply)
    for (let i = 0; i < 1200; i++) m.sample(i % 120 === 30 || i % 120 === 90 ? 66.7 : 33.3 + Math.sin(i) * 0.8)
    expect(m.tier()).toBe('high')
    expect(m.info().capped).toBe(true)
  })

  it('steps down on a genuinely slow 33–40 ms spread (not a cap)', () => {
    const apply = vi.fn()
    const m = createQualityManager('high', apply)
    for (let i = 0; i < 120; i++) m.sample(33 + (i % 8))
    expect(m.tier()).toBe('mid')
    expect(apply).toHaveBeenCalledWith('mid')
  })

  it('never steps up above a saved ceiling', () => {
    const below = createQualityManager('low', () => undefined, { ceiling: 'mid' })
    feed(below, 16.7, 2000)
    expect(below.tier()).toBe('mid') // up to the ceiling is fine
    const at = vi.fn()
    const atCeiling = createQualityManager('mid', at, { ceiling: 'mid' })
    feed(atCeiling, 16.7, 2000)
    expect(atCeiling.tier()).toBe('mid')
    expect(at).not.toHaveBeenCalled()
  })

  it('still steps down when 30 fps frames jitter like a busy GPU', () => {
    const apply = vi.fn()
    const m = createQualityManager('high', apply)
    for (let i = 0; i < 120; i++) m.sample(i % 2 ? 16.7 : 50)
    expect(m.tier()).toBe('mid')
  })

  it('ignores stalls over 250 ms', () => {
    const apply = vi.fn()
    const m = createQualityManager('high', apply)
    feed(m, 1000, 300)
    expect(m.tier()).toBe('high')
    expect(apply).not.toHaveBeenCalled()
  })
})

describe('createTierControl', () => {
  const run = (c: { frame(ms: number): void }, ms: number, n: number) => {
    for (let i = 0; i < n; i++) c.frame(ms)
  }

  it('does not count old-tier frames while a requested tier waits for a stamp to finish', () => {
    const c = createTierControl({ start: 'high', adaptive: true })
    run(c, 16.7, 60) // the 1 s start-up warm-up
    run(c, 30, 120) // slow: the manager asks for mid
    expect(c.take(false)).toBeNull() // a stamp is running, so the stage can't rebuild yet
    run(c, 30, 300) // still rendering at high: these frames must not count toward mid
    expect(c.take(true)).toBe('mid')
    c.applied()
    run(c, 30, 25) // the 750 ms post-apply warm-up
    run(c, 30, 119) // 119 counted frames at mid: not yet a full window
    expect(c.take(true)).toBeNull()
    expect(c.tier()).toBe('mid')
  })

  it('ignores the slow frames right after setEra rebuilds the world', () => {
    const hitch = (warm: boolean) => {
      const c = createTierControl({ start: 'high', adaptive: true })
      run(c, 16.7, 60) // start-up warm-up
      run(c, 16.7, 200) // steady
      if (warm) c.warm(750) // what setEra does
      run(c, 240, 3) // texture generation and shader compiles
      run(c, 16.7, 117)
      return c.take(true)
    }
    expect(hitch(false)).toBe('mid') // control: counted, those frames would force a step down
    expect(hitch(true)).toBeNull()
  })

  it('reports a settled tier once, after it holds for the settle time, with the step-down flag', () => {
    const settled: [QualityTier, boolean][] = []
    const c = createTierControl({ start: 'mid', adaptive: true, settleMs: 10_000, onSettled: (t, d) => settled.push([t, d]) })
    run(c, 16.7, 60)
    run(c, 30, 120)
    expect(c.take(true)).toBe('low')
    c.applied()
    run(c, 16.7, 45) // warm-up
    run(c, 16.7, 590) // 9.85 s
    expect(settled).toEqual([])
    run(c, 16.7, 20)
    expect(settled).toEqual([['low', true]])
    run(c, 16.7, 2000)
    expect(settled).toHaveLength(1)
  })

  it('does nothing when the tier is forced', () => {
    const c = createTierControl({ start: 'low', adaptive: false })
    run(c, 100, 2000)
    expect(c.take(true)).toBeNull()
    expect(c.tier()).toBe('low')
  })
})

describe('tier memory and start tier', () => {
  beforeEach(() => localStorage.clear())

  it('remembers the settled tier under the tier key', () => {
    saveTier('mid')
    expect(JSON.parse(localStorage.getItem('ft:tier') ?? 'null')).toMatchObject({ tier: 'mid' })
    expect(loadSavedTier()).toBe('mid')
  })

  it('ignores garbage and stale entries', () => {
    localStorage.setItem('ft:tier', JSON.stringify({ tier: 'ultra', at: Date.now() }))
    expect(loadSavedTier()).toBeUndefined()
    localStorage.setItem('ft:tier', JSON.stringify('high'))
    expect(loadSavedTier()).toBeUndefined()
    localStorage.setItem('ft:tier', JSON.stringify({ tier: 'low', at: Date.now() - 40 * 864e5 }))
    expect(loadSavedTier()).toBeUndefined()
  })

  it('saves a ceiling after a step-down and expires it with the tier', () => {
    const now = Date.now()
    saveTier('mid', { tier: 'mid', at: now })
    expect(loadSavedTier()).toBe('mid')
    expect(loadSavedCeiling()).toEqual({ tier: 'mid', at: now })
    saveTier('mid') // a session that never stepped down and had no ceiling
    expect(loadSavedCeiling()).toBeUndefined()
    saveTier('low', { tier: 'mid', at: now - 40 * 864e5 }) // carried forward, but too old
    expect(loadSavedCeiling()).toBeUndefined()
    localStorage.setItem('ft:tier', JSON.stringify({ tier: 'low', at: now - 40 * 864e5, ceiling: 'low', ceilingAt: now }))
    expect(loadSavedCeiling()).toBeUndefined() // no tier, no ceiling
  })

  it('prefers forced, then saved, then detected', () => {
    const detect = vi.fn((): QualityTier => 'mid')
    expect(startTier({ forced: 'low', saved: 'high', detect })).toEqual({ tier: 'low', source: 'forced' })
    expect(startTier({ saved: 'high', detect })).toEqual({ tier: 'high', source: 'saved' })
    expect(detect).not.toHaveBeenCalled()
    expect(startTier({ detect })).toEqual({ tier: 'mid', source: 'detected' })
  })

  it('reads ?tier= and rejects unknown values', () => {
    expect(parseTierParam('?tier=low')).toBe('low')
    expect(parseTierParam('?debug&tier=high')).toBe('high')
    expect(parseTierParam('?tier=ultra')).toBeUndefined()
    expect(parseTierParam('')).toBeUndefined()
  })
})
