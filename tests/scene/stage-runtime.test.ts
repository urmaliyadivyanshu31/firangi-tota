// The real createStage in jsdom, with three's WebGLRenderer swapped for a stub (jsdom has no WebGL).
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { STAGE_LOST_EVENT, type EraDressing } from '../../src/scene/types'

vi.mock('three', async (importOriginal) => {
  const actual = await importOriginal<typeof import('three')>()
  class StubRenderer {
    domElement: HTMLCanvasElement
    shadowMap = { enabled: false, type: 0, autoUpdate: true, needsUpdate: false }
    info = { render: { calls: 0, triangles: 0, frame: 0 } }
    toneMapping = 0
    toneMappingExposure = 1
    outputColorSpace = ''
    private pr = 1
    constructor(o: { canvas: HTMLCanvasElement }) {
      this.domElement = o.canvas
    }
    setPixelRatio(p: number) {
      this.pr = p
    }
    getPixelRatio() {
      return this.pr
    }
    setSize() {}
    render() {
      this.info.render.frame++
    }
    dispose() {}
    forceContextLoss() {}
  }
  return { ...actual, WebGLRenderer: StubRenderer }
})

const { createStage } = await import('../../src/scene/stage')
const { sampleDressing } = await import('../../src/scene/eras/_sample')

// jsdom has no canvas backend: a WebGL2 stand-in for createStage, and a recording 2D context
// that can also back the procedural textures.
const fakeGL = {
  RENDERER: 0x1f01,
  getContextAttributes: () => ({ antialias: false }),
  getExtension: () => null,
  getParameter: () => 'Stub GPU',
}
function fake2d() {
  const grad = { addColorStop: () => undefined }
  return new Proxy({} as Record<string, unknown>, {
    get(target, key: string) {
      if (key in target) return target[key]
      if (key === 'createLinearGradient' || key === 'createRadialGradient') return () => grad
      if (key === 'createImageData') return (w: number, h: number) => ({ data: new Uint8ClampedArray(w * h * 4) })
      return () => undefined
    },
    set(target, key: string, value) {
      target[key] = value
      return true
    },
  })
}

beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(((type: string) =>
    type === 'webgl2' ? fakeGL : fake2d()) as unknown as HTMLCanvasElement['getContext'])
  vi.stubGlobal('requestAnimationFrame', () => 1)
  vi.stubGlobal('cancelAnimationFrame', () => undefined)
})
afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

const mount = () => {
  const el = document.createElement('div')
  document.body.appendChild(el)
  return el
}

describe('stage fallback on failure', () => {
  it('on context loss with no handler, mounts the fallback inside the mount and hides the GL canvas', async () => {
    const el = mount()
    const stage = createStage(el, { reducedMotion: false, forceTier: 'low' })
    expect(stage).not.toBeNull()
    stage?.setEra(sampleDressing)
    const glCanvas = el.querySelector('canvas') as HTMLCanvasElement
    const heard = vi.fn()
    el.addEventListener(STAGE_LOST_EVENT, heard)
    const lost = new Event('webglcontextlost', { cancelable: true })
    glCanvas.dispatchEvent(lost)
    expect(lost.defaultPrevented).toBe(true)
    expect(heard).toHaveBeenCalledTimes(1)
    expect(glCanvas.style.display).toBe('none')
    const canvases = [...el.querySelectorAll('canvas')]
    expect(canvases).toHaveLength(2)
    const fb = canvases.find((c) => c !== glCanvas) as HTMLCanvasElement
    expect(el.contains(fb)).toBe(true)
    expect(fb.style.width).toBe('100%')
    expect(fb.style.height).toBe('100%')
    // the game keeps running: stage calls resolve at once
    await expect(stage?.stamp('asli')).resolves.toBeUndefined()
    await expect(stage?.caught()).resolves.toBeUndefined()
    stage?.dispose()
    expect(el.querySelectorAll('canvas')).toHaveLength(0)
  })

  it('leaves the fallback to the app when it cancels the event', () => {
    const el = mount()
    const stage = createStage(el, { reducedMotion: false, forceTier: 'low' })
    stage?.setEra(sampleDressing)
    el.addEventListener(STAGE_LOST_EVENT, (e) => e.preventDefault())
    const glCanvas = el.querySelector('canvas') as HTMLCanvasElement
    glCanvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true }))
    expect(el.querySelectorAll('canvas')).toHaveLength(1)
    stage?.dispose()
  })

  it('falls back instead of leaving a black stage when a dressing throws', () => {
    const el = mount()
    const stage = createStage(el, { reducedMotion: false, forceTier: 'low' })
    const broken: EraDressing = { ...sampleDressing, build: () => { throw new Error('bad prop') } }
    const reasons: string[] = []
    el.addEventListener(STAGE_LOST_EVENT, (e) => reasons.push((e as CustomEvent<{ reason: string }>).detail.reason))
    const err = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    stage?.setEra(broken)
    expect(err).toHaveBeenCalled()
    expect(reasons).toEqual(['build-failed'])
    const canvases = [...el.querySelectorAll('canvas')]
    expect(canvases).toHaveLength(2)
    expect(canvases[0]?.style.display).toBe('none')
    stage?.dispose()
  })
})
