import { describe, expect, it } from 'vitest'
import type { EraId } from '../../src/content/types'
import { ALL_DRESSINGS, dressingFor } from '../../src/scene/eras/index'
import { sampleDressing } from '../../src/scene/eras/_sample'

const IDS: EraId[] = ['delhi-1857', 'lahore-1929', 'bombay-1942', 'delhi-1947']

describe('era dressings (Ruling R23)', () => {
  it('lists each era desk once and never the sample', () => {
    const ids = ALL_DRESSINGS.map((d) => d.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const d of ALL_DRESSINGS) {
      expect(d).not.toBe(sampleDressing)
      expect(IDS).toContain(d.id)
      expect(typeof d.build).toBe('function')
    }
  })

  it('returns the registered desk for an era that has one', () => {
    for (const d of ALL_DRESSINGS) expect(dressingFor(d.id)).toBe(d)
  })

  it('falls back to the sample desk, without throwing, for an era whose desk is not in yet', () => {
    for (const id of IDS.filter((x) => !ALL_DRESSINGS.some((d) => d.id === x))) {
      const d = dressingFor(id)
      expect(d.build).toBe(sampleDressing.build)
      expect(d.camera).toEqual(sampleDressing.camera)
    }
  })
})
