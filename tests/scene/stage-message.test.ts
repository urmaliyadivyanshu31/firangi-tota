// The stage's day choreography in jsdom: three's WebGLRenderer is a stub, the 2D canvases record,
// and requestAnimationFrame is pumped by hand so animations run on a known clock.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { EraDressing, QualityTier, SheetSpec, StageCueName } from '../../src/scene/types'
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

const { createStage, dayNumber } = await import('../../src/scene/stage')
const { sampleDressing } = await import('../../src/scene/eras/_sample')
const delhi1947 = (await import('../../src/scene/eras/delhi1947')).default

const fakeGL = {
  RENDERER: 0x1f01,
  getContextAttributes: () => ({ antialias: false }),
  getExtension: () => null,
  getParameter: () => 'Stub GPU',
}

let frames: FrameRequestCallback[] = []
let now = 0
/** Runs `ms` of frames at 60 fps. */
async function pump(ms: number) {
  for (let t = 0; t < ms; t += 16) {
    now += 16
    const due = frames
    frames = []
    for (const f of due) f(now)
    await Promise.resolve()
  }
}
/** Lets queued promise continuations run without advancing any frames. */
async function settle() {
  for (let i = 0; i < 40; i++) await Promise.resolve()
}

let createdCanvases = 0
beforeEach(() => {
  frames = []
  now = 0
  createdCanvases = 0
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(((type: string) =>
    type === 'webgl2' ? fakeGL : fake2d().ctx) as unknown as HTMLCanvasElement['getContext'])
  const create = document.createElement.bind(document)
  vi.spyOn(document, 'createElement').mockImplementation(((tag: string, o?: ElementCreationOptions) => {
    if (tag === 'canvas') createdCanvases++
    return create(tag, o)
  }) as typeof document.createElement)
  vi.stubGlobal('requestAnimationFrame', (f: FrameRequestCallback) => {
    frames.push(f)
    return frames.length
  })
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

const sheet = (o: Partial<SheetSpec> = {}): SheetSpec => ({
  era: 'delhi-1857',
  channel: 'petition',
  lang: 'en',
  from: 'Chuni Lal',
  to: "The King's office",
  dateLine: 'Monday, 18 May 1857',
  body: 'The King took his seat on the throne, in state. Mirza Mughal was made Commander-in-Chief.',
  checks: ['Mirza Mughal'],
  pencil: true,
  ...o,
})

function stageFor(d: EraDressing = sampleDressing, o: { reduced?: boolean; tier?: QualityTier; cues?: StageCueName[] } = {}) {
  const el = mount()
  const stage = createStage(el, { reducedMotion: o.reduced ?? false, forceTier: o.tier ?? 'low', onCue: (c) => o.cues?.push(c) })
  if (!stage) throw new Error('no stage')
  stage.setEra(d)
  return { el, stage }
}

/** Resolves to 'done' or 'pending' after the given frames and microtasks. */
async function state(p: Promise<void>, ms = 0): Promise<'done' | 'pending'> {
  let done = false
  void p.then(() => {
    done = true
  })
  if (ms) await pump(ms)
  await settle()
  return done ? 'done' : 'pending'
}

describe('showMessage', () => {
  for (const channel of ['petition', 'note', 'radio', 'telegram'] as const) {
    it(`resolves once the ${channel} has arrived and the camera has leaned in`, async () => {
      const cues: StageCueName[] = []
      const { stage } = stageFor(channel === 'telegram' ? delhi1947 : sampleDressing, { cues })
      const p = stage.showMessage(sheet({ channel }))
      expect(await state(p, 300)).toBe('pending')
      expect(await state(p, 6000)).toBe('done')
      // (the typewriter's arrival is its platen ratchet and keys, not a slide)
      if (channel !== 'telegram') expect(cues).toContain('arrive')
      if (channel === 'telegram') expect(cues).toEqual(expect.arrayContaining(['key', 'space', 'return']))
      if (channel === 'petition') expect(cues).toContain('seal')
      if (channel === 'radio') expect(cues).toContain('flap')
      stage.dispose()
    })
  }

  it('with reduced motion, resolves without any animation', async () => {
    const { stage } = stageFor(sampleDressing, { reduced: true })
    expect(await state(stage.showMessage(sheet()))).toBe('done')
    stage.dispose()
  })
})

describe('skip', () => {
  it('finishes an arrival at once, without waiting for frames', async () => {
    const { stage } = stageFor(delhi1947)
    const p = stage.showMessage(sheet({ channel: 'telegram' }))
    await pump(100)
    expect(await state(p)).toBe('pending')
    stage.skip()
    expect(await state(p)).toBe('done')
    stage.dispose()
  })

  it('also finishes work still queued behind it (title, then message)', async () => {
    const { stage } = stageFor(sampleDressing)
    const t = stage.dayTitle({ big: 'Day 1', small: 'Sunday, 17 May 1857' })
    const m = stage.showMessage(sheet())
    stage.skip()
    expect(await state(t)).toBe('done')
    expect(await state(m)).toBe('done')
    // and animations after it run normally again
    const s = stage.stamp('asli')
    expect(await state(s)).toBe('pending')
    expect(await state(s, 3000)).toBe('done')
    stage.dispose()
  })

  it('finishes the day title at once', async () => {
    const { stage } = stageFor(delhi1947)
    const p = stage.dayTitle({ big: 'दिन 3', small: 'गुरुवार, 7 अगस्त 1947' })
    await pump(50)
    stage.skip()
    expect(await state(p)).toBe('done')
    stage.dispose()
  })
})

describe('redrawMessage', () => {
  it('redraws into the same canvas: no new canvas, no new texture source', async () => {
    const { stage } = stageFor(sampleDressing, { reduced: true })
    await stage.showMessage(sheet())
    const before = createdCanvases
    stage.redrawMessage(sheet({ lang: 'hi', body: 'बादशाह शान से तख़्त पर बैठे।', checks: [] }))
    stage.redrawMessage(sheet({ pencil: false }))
    expect(createdCanvases).toBe(before)
    stage.dispose()
  })
})

describe('flash', () => {
  for (const tier of ['low', 'mid', 'high'] as const) {
    it(`does not throw at the ${tier} tier, for either verdict`, async () => {
      const { stage } = stageFor(sampleDressing, { tier })
      expect(() => stage.flash('right')).not.toThrow()
      await pump(400)
      expect(() => stage.flash('wrong')).not.toThrow()
      await pump(2000)
      stage.dispose()
    })
  }

  it('does nothing harmful before an era is set or after dispose', () => {
    const el = mount()
    const stage = createStage(el, { reducedMotion: false, forceTier: 'low' })
    expect(() => stage?.flash('right')).not.toThrow()
    stage?.dispose()
    expect(() => stage?.flash('wrong')).not.toThrow()
    expect(() => stage?.skip()).not.toThrow()
  })
})

describe('establish and the day title', () => {
  it('resolves the wide shot and the title', async () => {
    const cues: StageCueName[] = []
    const { stage } = stageFor(delhi1947, { cues })
    expect(await state(stage.establish(), 2000)).toBe('done')
    expect(await state(stage.dayTitle({ big: 'Day 2', small: 'Wednesday, 6 August 1947' }), 2500)).toBe('done')
    expect(cues).toEqual(expect.arrayContaining(['title', 'flip']))
    stage.dispose()
  })

  it('reads the day from the title for the 1947 countdown', () => {
    expect(dayNumber('Day 3')).toBe(3)
    expect(dayNumber('दिन ११')).toBe(11)
    expect(dayNumber('दिन 7')).toBe(7)
    expect(dayNumber('Today')).toBeNull()
  })
})

describe('the typewriter keeps time with its sound', () => {
  const telegram = (body: string): SheetSpec =>
    sheet({ era: 'delhi-1947', channel: 'telegram', from: 'Secretary of State', to: 'Viceroy', dateLine: '5 Aug 1947', serial: '3408-S', body, checks: [] })

  it('cues one key per struck letter and one space per space, in the order they appear', async () => {
    const { measureSheet, typedKeys } = await import('../../src/scene/sheet')
    const body = 'Your 1662-S. Cabinet agrees the boundary award is published only after 15 August. Repeat: after 15 August.'
    const cues: StageCueName[] = []
    const { stage } = stageFor(delhi1947, { cues })
    const p = stage.showMessage(telegram(body))
    expect(await state(p, 9000)).toBe('done')
    const struck = cues.filter((c) => c === 'key' || c === 'space')
    // exactly one key per non-space character of the typed message
    expect(typedKeys(body)).toHaveLength(body.replace(/\s/g, '').length)
    expect(struck.filter((c) => c === 'key')).toHaveLength(typedKeys(body).length)
    // in the order the layout strikes them (the same measure the reveal uses)
    const lines = measureSheet(fake2d().ctx, telegram(body)).typed.filter((l) => !l.field)
    expect(lines.length).toBeGreaterThan(1)
    expect(struck).toEqual(lines.flatMap((l) => l.keys.map((k) => (k.space ? 'space' : 'key'))))
    // the platen's ratchet as the form rolls in, then one return between lines
    expect(cues.filter((c) => c === 'return')).toHaveLength(lines.length)
    stage.dispose()
  })

  it('cues each key on the frame its letter appears, never in a burst', async () => {
    const cues: StageCueName[] = []
    const { stage } = stageFor(delhi1947, { cues })
    const p = stage.showMessage(telegram('Cabinet agrees the boundary award is published after 15 August.'))
    let maxPerFrame = 0
    let frames = 0
    for (let i = 0; i < 600; i++) {
      const before = cues.filter((c) => c === 'key').length
      await pump(16)
      const n = cues.filter((c) => c === 'key').length - before
      if (n > 0) frames++
      maxPerFrame = Math.max(maxPerFrame, n)
      if ((await state(p)) === 'done') break
    }
    expect(frames).toBeGreaterThan(20)
    expect(maxPerFrame).toBeLessThanOrEqual(2)
    stage.dispose()
  })

  it('stays silent when the typing is skipped', async () => {
    const cues: StageCueName[] = []
    const { stage } = stageFor(delhi1947, { cues })
    const p = stage.showMessage(telegram('Cabinet agrees the boundary award is published after 15 August.'))
    await pump(500)
    const before = cues.filter((c) => c === 'key').length
    stage.skip()
    expect(await state(p)).toBe('done')
    expect(cues.filter((c) => c === 'key').length).toBe(before)
    stage.dispose()
  })
})

describe('reveal: the verdict on the same paper', () => {
  const verdict = {
    outcome: 'right' as const,
    real: true,
    documentMark: true,
    highlight: ['Mirza Mughal'],
    note: 'Mirza Mughal led the army, as the file says',
    back: { verdictLine: 'Right — this one was genuine', tell: 'The diary records it.', stamp: { text: 'Correct', tone: 'right' as const, style: 'seal' as const }, source: 'Trial of Bahadur Shah (1858), p. 113' },
    lang: 'en' as const,
  }

  it('rings the words, turns the paper over and resolves, with the source line findable', async () => {
    const cues: StageCueName[] = []
    const { stage } = stageFor(sampleDressing, { cues })
    await state(stage.showMessage(sheet()), 6000)
    expect(stage.getSourceRect()).toBeNull()
    expect(stage.getPaperRect()).not.toBeNull()
    const p = stage.reveal(verdict)
    expect(await state(p, 400)).toBe('pending')
    expect(await state(p, 4000)).toBe('done')
    expect(cues).toEqual(expect.arrayContaining(['unfold', 'verdictStamp']))
    const src = stage.getSourceRect()
    expect(src).not.toBeNull()
    expect(src?.w).toBeGreaterThan(0)
    stage.dispose()
  })

  it('skip finishes it at once', async () => {
    const { stage } = stageFor(sampleDressing)
    await state(stage.showMessage(sheet()), 6000)
    const p = stage.reveal(verdict)
    await pump(100)
    stage.skip()
    expect(await state(p)).toBe('done')
    expect(stage.getSourceRect()).not.toBeNull()
    stage.dispose()
  })

  it('a second call (a language change) redraws at once', async () => {
    const { stage } = stageFor(sampleDressing)
    await state(stage.showMessage(sheet()), 6000)
    await state(stage.reveal(verdict), 4000)
    expect(await state(stage.reveal({ ...verdict, lang: 'hi', note: 'फ़ौज मिर्ज़ा मुग़ल के हाथ थी' }))).toBe('done')
    stage.dispose()
  })
})
