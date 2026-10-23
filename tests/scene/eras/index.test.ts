import { describe, expect, it } from 'vitest'
import type { EraId } from '../../../src/content/types'
import { ALL_DRESSINGS, dressingFor, hasDressing } from '../../../src/scene/eras/index'
import { sampleDressing } from '../../../src/scene/eras/_sample'
import delhi1857 from '../../../src/scene/eras/delhi1857'

describe('era registry', () => {
  it('finds the delhi-1857 desk by its id', () => {
    expect(hasDressing('delhi-1857')).toBe(true)
    expect(dressingFor('delhi-1857')).toBe(delhi1857)
    expect(dressingFor('delhi-1857').id).toBe('delhi-1857')
  })

  it('lists every desk once, keyed by its own id, and never the sample', () => {
    const ids = ALL_DRESSINGS.map((d) => d.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ALL_DRESSINGS).toContain(delhi1857)
    expect(ALL_DRESSINGS).not.toContain(sampleDressing)
    for (const d of ALL_DRESSINGS) expect(dressingFor(d.id)).toBe(d)
  })

  it('falls back to the sample room, tagged with the requested id, for an era without a desk', () => {
    const missing = 'nowhere-1066' as EraId
    expect(hasDressing(missing)).toBe(false)
    const d = dressingFor(missing)
    expect(d.id).toBe(missing)
    expect(d.build).toBe(sampleDressing.build)
    expect(d.camera).toEqual(sampleDressing.camera)
  })
})
