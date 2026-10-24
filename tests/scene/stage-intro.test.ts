// The intro after Begin on the 3D stage (jsdom): the two cards slide onto the desk, the clip snaps,
// the parrot winks, skip() finishes it, a second call redraws, and clearIntro sends them off.
// three's WebGLRenderer is a stub, the 2D canvases record, and frames are pumped by hand.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { IntroSpec, StageCueName } from '../../src/scene/types'
import { fake2d } from './fake-canvas'

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

const fakeGL = {
  RENDERER: 0x1f01,
  getContextAttributes: () => ({ antialias: false }),
  getExtension: () => null,
  getParameter: () => 'Stub GPU',
}

let frames: FrameRequestCallback[] = []
let now = 0
async function pump(ms: number) {
  for (let t = 0; t < ms; t += 16) {
    now += 16
    const due = frames
    frames = []
    for (const f of due) f(now)
    await Promise.resolve()
  }
}
async function settle() {
  for (let i = 0; i < 40; i++) await Promise.resolve()
  await new Promise((r) => setTimeout(r, 0))
  for (let i = 0; i < 40; i++) await Promise.resolve()
}

/** Portraits load at once (jsdom never loads images). */
class InstantImage {
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  decoding = ''
  naturalWidth = 480
  naturalHeight = 640
  set src(_v: string) {
    queueMicrotask(() => this.onload?.())
  }
}

let drawn: string[] = []
beforeEach(() => {
  frames = []
  now = 0
  drawn = []
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(((type: string) => {
    if (type === 'webgl2') return fakeGL
    const f = fake2d()
    return new Proxy(f.ctx, {
      get(t, k: string) {
        if (k === 'fillText') return (s: string, x: number, y: number) => {
          drawn.push(s)
          return (t as unknown as { fillText: (s: string, x: number, y: number) => void }).fillText(s, x, y)
        }
        return (t as unknown as Record<string, unknown>)[k]
      },
      set(t, k: string, v) {
        ;(t as unknown as Record<string, unknown>)[k] = v
        return true
      },
    })
  }) as unknown as HTMLCanvasElement['getContext'])
  vi.stubGlobal('requestAnimationFrame', (f: FrameRequestCallback) => {
    frames.push(f)
    return frames.length
  })
  vi.stubGlobal('cancelAnimationFrame', () => undefined)
  vi.stubGlobal('Image', InstantImage)
})
afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

let uid = 0
const spec = (o: Partial<IntroSpec> = {}): IntroSpec => ({
  era: 'delhi-1857',
  lang: 'en',
  you: { label: 'You', line: "a munshi in Bahadur Shah Zafar's darbar at the Red Fort", art: `/art/t${++uid}-you.webp` },
  tota: { label: 'The Tota', line: "an agent for the Firangi, forging papers in the names of the King's men", art: `/art/t${uid}-tota.webp` },
  ...o,
})

function stageFor(o: { reduced?: boolean; cues?: StageCueName[] } = {}) {
  const el = document.createElement('div')
  document.body.appendChild(el)
  const stage = createStage(el, { reducedMotion: o.reduced ?? false, forceTier: 'low', onCue: (c) => o.cues?.push(c) })
  if (!stage) throw new Error('no stage')
  stage.setEra(sampleDressing)
  return { el, stage }
}

async function state(p: Promise<void>, ms = 0): Promise<'done' | 'pending'> {
  let done = false
  void p.then(() => {
    done = true
  })
  if (ms) await pump(ms)
  await settle()
  return done ? 'done' : 'pending'
}

describe('intro: the YOU and Tota cards on the desk', () => {
  it('slides both cards in, snaps the clip and resolves once they have settled', async () => {
    const cues: StageCueName[] = []
    const { stage } = stageFor({ cues })
    const p = stage.intro(spec())
    expect(await state(p, 300)).toBe('pending')
    expect(await state(p, 3000)).toBe('done')
    expect(cues.filter((c) => c === 'cardSlide')).toHaveLength(2)
    expect(cues).toContain('clipSnap')
    // the cards carry the headings and the lines (English capitals, a capital at the start)
    expect(drawn).toEqual(expect.arrayContaining(['Y', 'O', 'U', 'T', 'H', 'E']))
    expect(drawn.join(' ')).toContain('A munshi in')
    stage.dispose()
  })

  it('with reduced motion fades the cards in, one soft slide and no clip snap', async () => {
    const cues: StageCueName[] = []
    const { stage } = stageFor({ reduced: true, cues })
    const p = stage.intro(spec())
    expect(await state(p, 400)).toBe('done')
    expect(cues).toEqual(['cardSlide'])
    stage.dispose()
  })

  it('skip finishes it at once, quietly', async () => {
    const cues: StageCueName[] = []
    const { stage } = stageFor({ cues })
    const p = stage.intro(spec())
    await pump(100)
    stage.skip()
    expect(await state(p)).toBe('done')
    expect(cues.filter((c) => c === 'clipSnap')).toHaveLength(0)
    stage.dispose()
  })

  it('a second call (a language change) redraws the cards in place, without the slide', async () => {
    const cues: StageCueName[] = []
    const { stage } = stageFor({ cues })
    const s = spec()
    await state(stage.intro(s), 3000)
    cues.length = 0
    drawn = []
    const again = stage.intro({ ...s, lang: 'hi', you: { ...s.you, label: 'आप', line: 'लाल क़िले का एक मुंशी' } })
    expect(await state(again, 50)).toBe('done')
    expect(cues).toEqual([])
    expect(drawn).toContain('आप')
    stage.dispose()
  })

  it('clearIntro sends the cards off, and a day title asked for next waits for it', async () => {
    const cues: StageCueName[] = []
    const { stage } = stageFor({ cues })
    await state(stage.intro(spec()), 3000)
    cues.length = 0
    const gone = stage.clearIntro()
    const title = stage.dayTitle({ big: 'Day 1', small: 'Sunday, 17 May 1857' })
    expect(await state(gone, 100)).toBe('pending')
    expect(await state(gone, 500)).toBe('done')
    expect(cues[0]).toBe('cardSlide')
    expect(await state(title, 3000)).toBe('done')
    expect(cues).toContain('title')
    // nothing left to clear
    expect(await state(stage.clearIntro())).toBe('done')
    stage.dispose()
  })

  it('Continue mid-slide: the cards jump home and leave, and the day title still plays in time', async () => {
    const cues: StageCueName[] = []
    const { stage } = stageFor({ cues })
    const p = stage.intro(spec())
    await pump(200)
    const gone = stage.clearIntro()
    expect(await state(p)).toBe('done')
    const title = stage.dayTitle({ big: 'Day 1', small: 'Sunday, 17 May 1857' })
    expect(await state(gone, 600)).toBe('done')
    // the title is animated, not finished at once by the hurry
    expect(await state(title, 200)).toBe('pending')
    expect(await state(title, 3000)).toBe('done')
    stage.dispose()
  })

  it('Continue after the cards settled, while the wide shot is still easing, never hurries the day', async () => {
    const { stage } = stageFor()
    const wide = stage.establish()
    await state(stage.intro(spec()), 3000)
    void wide
    void stage.establish() // a camera move still in flight when Continue comes
    const gone = stage.clearIntro()
    const title = stage.dayTitle({ big: 'Day 1', small: 'Sunday, 17 May 1857' })
    expect(await state(gone, 2000)).toBe('done')
    expect(await state(title, 200)).toBe('pending')
    expect(await state(title, 3000)).toBe('done')
    stage.dispose()
  })

  it('a day title that comes while the cards are down clears them first', async () => {
    const { stage } = stageFor()
    await state(stage.intro(spec()), 3000)
    const title = stage.dayTitle({ big: 'Day 1', small: 'Sunday, 17 May 1857' })
    expect(await state(title, 4000)).toBe('done')
    expect(await state(stage.clearIntro())).toBe('done')
    stage.dispose()
  })

  it('does nothing harmful before an era is set or after dispose', async () => {
    const el = document.createElement('div')
    const stage = createStage(el, { reducedMotion: false, forceTier: 'low' })!
    expect(await state(stage.intro(spec()))).toBe('done')
    expect(await state(stage.clearIntro())).toBe('done')
    stage.setEra(sampleDressing)
    stage.dispose()
    expect(await state(stage.intro(spec()))).toBe('done')
  })
})
