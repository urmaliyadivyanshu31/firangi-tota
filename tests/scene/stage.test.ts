import { afterEach, describe, expect, it, vi } from 'vitest'
import { createStage } from '../../src/scene/stage'
import { loadStage } from '../../src/scene/index'
import indexSrc from '../../src/scene/index.ts?raw'
import typesSrc from '../../src/scene/types.ts?raw'
import fallbackSrc from '../../src/scene/fallback.ts?raw'
import paletteSrc from '../../src/scene/palette.ts?raw'

afterEach(() => {
  vi.restoreAllMocks()
  document.body.innerHTML = ''
})

const mountPoint = () => {
  const el = document.createElement('div')
  document.body.appendChild(el)
  return el
}

describe('createStage', () => {
  it('returns null when getContext returns null (no WebGL2)', () => {
    const spy = vi
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockImplementation((() => null) as unknown as HTMLCanvasElement['getContext'])
    const el = mountPoint()
    expect(createStage(el, { reducedMotion: false })).toBeNull()
    expect(spy).toHaveBeenCalledWith('webgl2', expect.anything())
    expect(el.querySelector('canvas')).toBeNull()
  })

  it('returns null when getContext throws', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation((() => {
      throw new Error('blocked')
    }) as unknown as HTMLCanvasElement['getContext'])
    expect(createStage(mountPoint(), { reducedMotion: true, forceTier: 'low' })).toBeNull()
  })
})

describe('scene entry (ruling R10)', () => {
  const sources: Record<string, string> = {
    'index.ts': indexSrc,
    'types.ts': typesSrc,
    'fallback.ts': fallbackSrc,
    'palette.ts': paletteSrc,
  }
  // Any import of three that is not `import type` would pull three.js into the first-paint bundle.
  const staticThree = /^\s*import\s+(?!type\b)[^;]*?from\s+['"]three(?:\/[^'"]*)?['"]/m

  it('keeps three.js out of the modules the app imports before first paint', () => {
    for (const [f, src] of Object.entries(sources)) {
      expect(src.length, f).toBeGreaterThan(0)
      expect(staticThree.test(src), f).toBe(false)
    }
    expect(indexSrc).not.toMatch(/from\s+['"]\.\/stage['"]/)
  })

  it('loadStage resolves the stage module with createStage', async () => {
    const mod = await loadStage()
    expect(typeof mod.createStage).toBe('function')
  })
})
