import { afterEach, describe, expect, it, vi } from 'vitest'
import { mountFallback } from '../../src/scene/fallback'
import { ERA_PALETTES } from '../../src/scene/palette'
import type { EraId } from '../../src/content/types'

afterEach(() => {
  vi.restoreAllMocks()
  document.body.innerHTML = ''
})

// A 2D context that records what was drawn, since jsdom has no canvas backend.
function fake2d() {
  const calls: string[] = []
  const grad = { addColorStop: () => undefined }
  const ctx = new Proxy({} as Record<string, unknown>, {
    get(target, key: string) {
      if (key in target) return target[key]
      if (key === 'createLinearGradient' || key === 'createRadialGradient') return () => grad
      return () => {
        calls.push(key)
      }
    },
    set(target, key: string, value) {
      target[key] = value
      return true
    },
  })
  return { ctx, calls }
}

describe('mountFallback', () => {
  it('draws a still desk on a 2D canvas and cleans up', () => {
    const { ctx, calls } = fake2d()
    const spy = vi
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockImplementation((() => ctx) as unknown as HTMLCanvasElement['getContext'])
    const el = document.createElement('div')
    document.body.appendChild(el)
    const fb = mountFallback(el, 'delhi-1857')
    expect(el.querySelectorAll('canvas')).toHaveLength(1)
    expect(spy).toHaveBeenCalledWith('2d', expect.anything())
    expect(spy).not.toHaveBeenCalledWith('webgl2', expect.anything())
    expect(calls).toContain('fillRect')
    expect(calls).toContain('fill')
    const before = calls.length
    fb.setEra('delhi-1947')
    expect(calls.length).toBeGreaterThan(before)
    fb.dispose()
    expect(el.querySelector('canvas')).toBeNull()
  })

  it('does not throw when the 2D context is unavailable', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
      (() => null) as unknown as HTMLCanvasElement['getContext'],
    )
    const el = document.createElement('div')
    const fb = mountFallback(el, 'bombay-1942')
    expect(() => fb.setEra('lahore-1929')).not.toThrow()
    expect(() => fb.dispose()).not.toThrow()
  })

  it('has a palette for every era', () => {
    const eras: EraId[] = ['delhi-1857', 'lahore-1929', 'bombay-1942', 'delhi-1947']
    for (const id of eras) expect(ERA_PALETTES[id], id).toBeDefined()
  })
})
