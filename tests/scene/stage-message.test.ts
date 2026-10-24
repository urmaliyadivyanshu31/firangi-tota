// The stage's day choreography in jsdom: three's WebGLRenderer is a stub, the 2D canvases record,
// and requestAnimationFrame is pumped by hand so animations run on a known clock.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { EraId } from '../../src/content/types'
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
const THREE = await import('three')

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

describe('showMessage resolves only once the paper is readable', () => {
  for (const channel of ['petition', 'note', 'radio', 'telegram'] as const) {
    it(`${channel}: the sheet has landed and the camera has leaned in when it resolves`, async () => {
      const { stage } = stageFor(channel === 'telegram' ? delhi1947 : sampleDressing)
      const p = stage.showMessage(sheet({ channel, body: 'Cabinet agrees the boundary award is published only after 15 August. Repeat: after 15 August.' }))
      let resolvedAt = -1
      void p.then(() => {
        resolvedAt = now
      })
      // sample the paper on screen every frame until the promise settles
      let moving = 0
      let last: ReturnType<typeof stage.getPaperRect> = null
      for (let i = 0; i < 900 && resolvedAt < 0; i++) {
        await pump(16)
        const r = stage.getPaperRect()
        if (r && last && Math.abs(r.x - last.x) + Math.abs(r.w - last.w) > 0.5) moving++
        last = r
      }
      expect(resolvedAt).toBeGreaterThan(0)
      expect(moving).toBeGreaterThan(5) // it really did arrive
      const atResolve = stage.getPaperRect()
      expect(atResolve).not.toBeNull()
      await pump(1500)
      const later = stage.getPaperRect()
      // nothing still travelling: only the camera's slow breath remains
      const drift = (a: number, b: number) => Math.abs(a - b) / Math.max(1, Math.abs(b))
      expect(drift(atResolve?.w ?? 0, later?.w ?? 1)).toBeLessThan(0.03)
      expect(drift(atResolve?.h ?? 0, later?.h ?? 1)).toBeLessThan(0.03)
      expect(Math.abs((atResolve?.x ?? 0) - (later?.x ?? 0))).toBeLessThan((later?.w ?? 0) * 0.03 + 1)
      stage.dispose()
    })
  }
})

describe('the verdict keeps the paper clear of the HUD', () => {
  const verdict = {
    outcome: 'right' as const,
    real: true,
    documentMark: false,
    highlight: ['Mirza Mughal'],
    note: 'the details check out',
    back: { verdictLine: 'Right — this one was genuine', tell: 'The diary records it.', stamp: { text: 'Survived', tone: 'survived' as const, style: 'seal' as const }, source: 'Trial of Bahadur Shah, 1858' },
    lang: 'en' as const,
  }
  const setHud = (el: HTMLElement, top: number, bottom: number, left = 0) => {
    el.style.setProperty('--ft-hud-top', `${top}px`)
    el.style.setProperty('--ft-hud-bottom', `${bottom}px`)
    el.style.setProperty('--ft-hud-left', `${left}px`)
    el.style.setProperty('--ft-hud-right', '0px')
  }

  it('re-frames on reveal after a right stamp, so the ending buttons never cover the paper', async () => {
    const { el, stage } = stageFor(sampleDressing)
    setHud(el, 60, 100)
    await state(stage.showMessage(sheet()), 6000)
    await state(stage.stamp('asli'), 3000)
    stage.flash('right')
    const before = stage.getPaperRect()
    expect(before).not.toBeNull()
    // the survived ending brings its buttons in: the HUD's foot grows well past the paper's
    const H = window.innerHeight
    const buttonsTop = (before?.y ?? 0) + (before?.h ?? 0) * 0.6
    setHud(el, 60, H - buttonsTop)
    expect(await state(stage.reveal(verdict), 5000)).toBe('done')
    await pump(800)
    const after = stage.getPaperRect()
    expect(after).not.toBeNull()
    expect((after?.y ?? 0) + (after?.h ?? 0)).toBeLessThanOrEqual(buttonsTop + 2)
    expect(after?.y ?? 0).toBeGreaterThanOrEqual(60 - 2)
    stage.dispose()
  })

  it('glides to a new framing whenever the app changes its HUD, even without a reveal', async () => {
    const { el, stage } = stageFor(sampleDressing)
    setHud(el, 60, 100)
    await state(stage.showMessage(sheet()), 6000)
    const before = stage.getPaperRect()
    setHud(el, 60, window.innerHeight * 0.5)
    await pump(1200)
    const after = stage.getPaperRect()
    expect((after?.y ?? 0) + (after?.h ?? 0)).toBeLessThanOrEqual(window.innerHeight * 0.5 + 2)
    expect(after?.h ?? 0).toBeLessThan(before?.h ?? 0)
    stage.dispose()
  })
})

describe('toss: the read paper is screwed up and goes in the basket', () => {
  const verdict = {
    outcome: 'right' as const,
    real: true,
    documentMark: false,
    highlight: ['Mirza Mughal'],
    note: 'Mirza Mughal led the army, as the file says',
    back: { verdictLine: 'Right · this one was genuine', tell: 'The diary records it.', stamp: { text: 'Right', tone: 'right' as const, style: 'seal' as const }, source: 'Trial of Bahadur Shah (1858), p. 113' },
    lang: 'en' as const,
  }
  /** The sample room with a basket whose object the test holds, and its scene. */
  function withBasket() {
    const basket = new THREE.Group()
    const box: { scene: InstanceType<typeof THREE.Scene> | null } = { scene: null }
    const hook = { mouth: [0.36, -0.47, 0.5] as [number, number, number], r: 0.14, depth: 0.28, foot: 0.12, obj: basket }
    const dressing: EraDressing = {
      ...sampleDressing,
      build(ctx) {
        box.scene = ctx.scene
        const d = sampleDressing.build(ctx)
        ctx.scene.add(basket)
        return { ...d, hooks: { ...d.hooks, basket: hook } }
      },
    }
    return { dressing, basket, hook, box }
  }
  /** The paper read, its verdict on its back. */
  async function readPaper(d: EraDressing, o: { reduced?: boolean; cues?: StageCueName[]; tier?: QualityTier } = {}) {
    const s = stageFor(d, o)
    await state(s.stage.showMessage(sheet()), 6000)
    await state(s.stage.reveal(verdict), 5000)
    return s
  }
  const named = (scene: InstanceType<typeof THREE.Scene> | null, name: string) => scene!.getObjectByName(name)!
  /** How far apart the points of the ball's mesh lie, across x (m). */
  const spanX = (scene: InstanceType<typeof THREE.Scene> | null) => {
    const mesh = named(scene, 'paper-ball-verdict') as InstanceType<typeof THREE.Mesh>
    const p = mesh.geometry.getAttribute('position')
    let lo = Infinity
    let hi = -Infinity
    for (let i = 0; i < p.count; i++) {
      lo = Math.min(lo, p.getX(i))
      hi = Math.max(hi, p.getX(i))
    }
    return hi - lo
  }

  it('the hands come in, three squeezes screw the paper into a ball, one hand drops it in: each beat sounds, the basket rocks, the ball ends inside', async () => {
    const cues: StageCueName[] = []
    const { dressing, basket, hook, box } = withBasket()
    const { stage } = await readPaper(dressing, { cues })
    expect(stage.getPaperRect()).not.toBeNull()
    // the hands and the ball were made while the verdict was read, and wait out of sight
    expect(named(box.scene, 'hands').visible).toBe(false)
    expect(named(box.scene, 'paper-ball').visible).toBe(false)
    cues.length = 0
    const p = stage.toss()
    await pump(32)
    // the flat ball takes the sheet's place: the sheet is hidden, the hands are in
    expect(named(box.scene, 'message-sheet').visible).toBe(false)
    expect(named(box.scene, 'paper-ball').visible).toBe(true)
    expect(named(box.scene, 'hands').visible).toBe(true)
    const flat = spanX(box.scene)
    expect(flat).toBeCloseTo(0.21, 2)
    // after the first squeeze it is pushed in from the sides; by the third it is a ball
    await pump(600)
    expect(cues).toEqual(['crumple'])
    const squeezed = spanX(box.scene)
    expect(squeezed).toBeLessThan(flat * 0.75)
    await pump(700)
    expect(cues).toEqual(['crumple', 'crumple', 'crumple'])
    const ball = spanX(box.scene)
    expect(ball).toBeLessThan(squeezed)
    expect(ball).toBeGreaterThan(0.06)
    expect(ball).toBeLessThan(0.095) // about 7.5 cm across
    expect(await state(p, 300)).toBe('pending')
    let rocked = false
    for (let t = 0; t < 1400 && !rocked; t += 16) {
      await pump(16)
      rocked = !basket.quaternion.equals(new THREE.Quaternion())
    }
    expect(rocked).toBe(true)
    expect(cues).toEqual(['crumple', 'crumple', 'crumple', 'toss', 'tossLand'])
    expect(await state(p, 2000)).toBe('done')
    expect(basket.quaternion.equals(new THREE.Quaternion())).toBe(true) // settled back on its foot
    expect(stage.getPaperRect()).toBeNull() // no longer on the desk
    expect(named(box.scene, 'hands').visible).toBe(false) // gone again
    // the ball lies in the basket: inside its mouth, below its rim, above its floor
    const ballGroup = named(box.scene, 'paper-ball')
    expect(ballGroup.visible).toBe(true)
    const at = ballGroup.getWorldPosition(new THREE.Vector3())
    expect(Math.hypot(at.x - hook.mouth[0], at.z - hook.mouth[2])).toBeLessThan(hook.r)
    expect(at.y).toBeLessThan(hook.mouth[1])
    expect(at.y).toBeGreaterThan(hook.mouth[1] - hook.depth)
    stage.dispose()
  })

  it('lands in about 2.2 to 2.6 seconds from the end of the hold', async () => {
    const cues: StageCueName[] = []
    const { dressing } = withBasket()
    const { stage } = await readPaper(dressing, { cues })
    cues.length = 0
    void stage.toss()
    let ms = 0
    while (!cues.includes('tossLand') && ms < 4000) {
      await pump(16)
      ms += 16
    }
    expect(ms).toBeGreaterThanOrEqual(2200)
    expect(ms).toBeLessThanOrEqual(2600)
    stage.dispose()
  })

  it('a tap during the crumple lands it at once, with no more crinkles, and the hands gone', async () => {
    const cues: StageCueName[] = []
    const { dressing, hook, box } = withBasket()
    const { stage } = await readPaper(dressing, { cues })
    cues.length = 0
    const p = stage.toss()
    await pump(500)
    expect(cues).toEqual(['crumple'])
    stage.skip()
    expect(await state(p)).toBe('done')
    expect(cues).toEqual(['crumple', 'tossLand'])
    expect(named(box.scene, 'hands').visible).toBe(false)
    const at = named(box.scene, 'paper-ball').getWorldPosition(new THREE.Vector3())
    expect(Math.hypot(at.x - hook.mouth[0], at.z - hook.mouth[2])).toBeLessThan(hook.r)
    stage.dispose()
  })

  it('a tap during the flight lands it at once', async () => {
    const cues: StageCueName[] = []
    const { dressing } = withBasket()
    const { stage } = await readPaper(dressing, { cues })
    cues.length = 0
    const p = stage.toss()
    while (!cues.includes('toss')) await pump(16)
    stage.skip()
    expect(await state(p)).toBe('done')
    expect(cues.at(-1)).toBe('tossLand')
    stage.dispose()
  })

  it('skipped before it begins (the Skip chip or Enter), it is in the basket at once, only its landing heard, no hands', async () => {
    for (const reduced of [false, true]) {
      const cues: StageCueName[] = []
      const { dressing, hook, box } = withBasket()
      const { stage } = await readPaper(dressing, { cues, reduced })
      cues.length = 0
      let shown = false
      const hands = box.scene!.getObjectByName('hands')
      const p = stage.toss(true)
      if (hands) hands.onBeforeRender = () => (shown = true)
      expect(await state(p, 50)).toBe('done')
      expect(cues).toEqual(['tossLand'])
      expect(stage.getPaperRect()).toBeNull()
      expect(named(box.scene, 'message-sheet').visible).toBe(false)
      if (!reduced) {
        expect(named(box.scene, 'hands').visible).toBe(false)
        const at = named(box.scene, 'paper-ball').getWorldPosition(new THREE.Vector3())
        expect(Math.hypot(at.x - hook.mouth[0], at.z - hook.mouth[2])).toBeLessThan(hook.r)
        expect(at.y).toBeLessThan(hook.mouth[1])
      }
      expect(shown).toBe(false)
      // the stage is not left skipping: the next day's title plays out as usual
      const title = stage.dayTitle({ big: 'Day 2', small: 'Monday, 18 May 1857' })
      expect(await state(title, 200)).toBe('pending')
      stage.dispose()
    }
  })

  it('under reduced motion the paper fades from the desk, with a crinkle and the landing, and no hands or flight', async () => {
    const cues: StageCueName[] = []
    const { dressing, basket, box } = withBasket()
    const { stage } = await readPaper(dressing, { cues, reduced: true })
    cues.length = 0
    expect(await state(stage.toss(), 600)).toBe('done')
    expect(cues).toEqual(['crumple', 'tossLand'])
    expect(named(box.scene, 'message-sheet').visible).toBe(false)
    expect(box.scene!.getObjectByName('hands')).toBeUndefined() // never even made
    expect(basket.quaternion.equals(new THREE.Quaternion())).toBe(true) // nothing moved
    // and the basket holds it, as one of its balls
    const bin = named(box.scene, 'bin-papers')
    expect(bin.children).toHaveLength(1)
    expect((bin.children[0] as InstanceType<typeof THREE.InstancedMesh>).count).toBe(1)
    stage.dispose()
  })

  it('the ball stays in the basket while the camera leaves it, then joins the pile: one instanced mesh for every ball', async () => {
    const { dressing, box } = withBasket()
    const { stage } = await readPaper(dressing)
    await state(stage.toss(), 3500)
    const bin = named(box.scene, 'bin-papers')
    const ball = named(box.scene, 'paper-ball')
    expect(bin.children).toHaveLength(0)
    const title = stage.dayTitle({ big: 'Day 2', small: 'Monday, 18 May 1857' })
    await pump(100)
    expect(ball.visible).toBe(true) // still in view while the camera turns to the wall
    expect(await state(title, 2500)).toBe('done')
    expect(ball.visible).toBe(false)
    expect(bin.children).toHaveLength(1)
    const pile = bin.children[0] as InstanceType<typeof THREE.InstancedMesh>
    expect(pile.isInstancedMesh).toBe(true)
    expect(pile.count).toBe(1)
    expect(await state(stage.showMessage(sheet({ body: 'A second petition.' })), 6000)).toBe('done')
    expect(stage.getPaperRect()).not.toBeNull()
    expect(named(box.scene, 'message-sheet').visible).toBe(true) // the sheet is back for the new message
    // a second toss lands on the first: still one mesh, now two balls, the second higher or beside
    await state(stage.reveal(verdict), 5000)
    await state(stage.toss(), 3500)
    await state(stage.dayTitle({ big: 'Day 3', small: 'Tuesday, 19 May 1857' }), 2500)
    expect(bin.children).toHaveLength(1)
    expect(pile.count).toBe(2)
    const m0 = new THREE.Matrix4()
    const m1 = new THREE.Matrix4()
    pile.getMatrixAt(0, m0)
    pile.getMatrixAt(1, m1)
    expect(new THREE.Vector3().setFromMatrixPosition(m0).distanceTo(new THREE.Vector3().setFromMatrixPosition(m1))).toBeGreaterThan(0.05)
    stage.dispose()
  })

  it('a new chapter empties the basket', async () => {
    const { dressing, box } = withBasket()
    const { stage } = await readPaper(dressing, { reduced: true })
    await state(stage.toss(), 600)
    expect(box.scene!.getObjectByName('bin-papers')!.children).toHaveLength(1)
    stage.setEra(dressing)
    expect(box.scene!.getObjectByName('bin-papers')!.children).toHaveLength(0)
    stage.dispose()
  })

  it('resolves at once with nothing on the desk, before an era, or after dispose', async () => {
    const { stage } = stageFor(sampleDressing)
    expect(await state(stage.toss())).toBe('done')
    stage.dispose()
    expect(await state(stage.toss())).toBe('done')
    const bare = createStage(mount(), { reducedMotion: false, forceTier: 'low' })
    expect(await state(bare!.toss())).toBe('done')
    bare!.dispose()
  })

  for (const tier of ['low', 'mid', 'high'] as const) {
    it(`screws up and tosses into the 1947 basket at the ${tier} tier`, async () => {
      const cues: StageCueName[] = []
      const s = stageFor(delhi1947, { tier, cues })
      await state(s.stage.showMessage(sheet({ channel: 'telegram' })), 9000)
      await state(s.stage.reveal(verdict), 5000)
      cues.length = 0
      expect(await state(s.stage.toss(), 3500)).toBe('done')
      expect(cues).toEqual(['crumple', 'crumple', 'crumple', 'toss', 'tossLand'])
      s.stage.dispose()
    })
  }
})
describe('caught: a wrong stamp plays out over about four seconds', () => {
  const ALARMS: Record<EraId, StageCueName[]> = {
    'delhi-1857': ['kettleDrum', 'bugleAlarm'],
    'lahore-1929': ['whistleShort', 'whistleShort', 'whistleLong', 'bootsRunning'],
    'bombay-1942': ['whistleLong', 'airRaidWail'],
    'delhi-1947': ['phoneBell', 'whistleLong'],
  }
  const room = (id: EraId): EraDressing => ({ ...sampleDressing, id })
  /** A wrong stamp on a readable paper; collects the cues heard from the stamp's flash on. */
  async function stamped(id: EraId, o: { reduced?: boolean; tier?: QualityTier } = {}) {
    const cues: StageCueName[] = []
    const s = stageFor(room(id), { cues, ...o })
    await state(s.stage.showMessage(sheet()), 6000)
    await state(s.stage.stamp('tota'), 3000)
    cues.length = 0
    s.stage.flash('wrong')
    return { ...s, cues }
  }

  for (const id of Object.keys(ALARMS) as EraId[]) {
    it(`${id}: silence, then its own alarm, the knocks coming closer, the hush and the dark; then it resolves`, async () => {
      const { stage, cues } = await stamped(id)
      expect(cues).toEqual([]) // the flash of a wrong verdict is silent: the alarm has to come first
      const p = stage.caught()
      expect(await state(p, 60)).toBe('pending')
      expect(cues).toEqual([]) // the beat of silence
      expect(await state(p, 3300)).toBe('pending')
      expect(await state(p, 1200)).toBe('done')
      const alarm = cues.filter((c) => !c.startsWith('knock') && !c.startsWith('caught'))
      expect(alarm).toEqual(ALARMS[id])
      expect(cues.filter((c) => c.startsWith('knock') || c.startsWith('caught'))).toEqual(['knockFar', 'knockNear', 'knockDoor', 'caughtHush', 'caughtDark'])
      expect(cues.indexOf('knockFar')).toBeGreaterThan(cues.indexOf(ALARMS[id][0]!))
      stage.dispose()
    })
  }

  it('the agarbatti burning out (no stamp) holds the full beat of silence before the alarm', async () => {
    const cues: StageCueName[] = []
    const { stage } = stageFor(room('bombay-1942'), { cues })
    await state(stage.showMessage(sheet()), 6000)
    cues.length = 0
    const p = stage.caught()
    await pump(240)
    expect(cues).toEqual([])
    await pump(100)
    expect(cues).toEqual(['whistleLong'])
    expect(await state(p, 4500)).toBe('done')
    stage.dispose()
  })

  it('a tap skips to the verdict at once: nothing more is heard but the alarm being cut off', async () => {
    const { stage, cues } = await stamped('delhi-1947')
    const p = stage.caught()
    await pump(700)
    expect(cues).toContain('phoneBell')
    const heard = cues.length
    stage.skip()
    expect(await state(p)).toBe('done')
    expect(cues.slice(heard)).toEqual(['caughtHush'])
    // and the verdict after it plays normally
    const r = stage.reveal({
      outcome: 'wrong', real: false, documentMark: false, highlight: ['Mirza Mughal'], note: 'Mirza Mughal, not Mirza Khizr', lang: 'en',
      back: { verdictLine: 'You passed the forgery', tell: 'The file names Mirza Mughal.', source: 'Trial (1858), p. 1' },
    })
    expect(await state(r, 400)).toBe('pending')
    expect(await state(r, 4000)).toBe('done')
    stage.dispose()
  })

  it('a new era (the player quits) ends it at once, hushes it, and the next day is not held behind it', async () => {
    const { stage, cues } = await stamped('lahore-1929')
    const p = stage.caught()
    await pump(500)
    stage.setEra(sampleDressing)
    expect(await state(p)).toBe('done')
    expect(cues[cues.length - 1]).toBe('caughtHush')
    const t = stage.dayTitle({ big: 'Day 1', small: 'Sunday, 17 May 1857' })
    expect(await state(t, 2500)).toBe('done')
    stage.dispose()
  })

  it('under reduced motion: the same sounds on the same beats, and it still resolves', async () => {
    const { stage, cues } = await stamped('delhi-1857', { reduced: true })
    const p = stage.caught()
    expect(await state(p, 4500)).toBe('done')
    expect(cues).toEqual(expect.arrayContaining(['kettleDrum', 'bugleAlarm', 'knockFar', 'knockNear', 'knockDoor', 'caughtHush', 'caughtDark']))
    stage.dispose()
  })

  for (const tier of ['low', 'mid', 'high'] as const) {
    it(`does not throw at the ${tier} tier, and the paper is back in reach for the verdict`, async () => {
      const { stage } = await stamped('bombay-1942', { tier })
      expect(await state(stage.caught(), 4500)).toBe('done')
      expect(stage.getPaperRect()).not.toBeNull()
      stage.dispose()
    })
  }

  it('a tier change after the verdict keeps the paper on its back (the rebuilt sheet was turned face up again)', async () => {
    history.replaceState(null, '', '?debug')
    try {
      const { stage } = await stamped('delhi-1857')
      await state(stage.caught(), 4500)
      await state(stage.reveal({
        outcome: 'wrong', real: true, documentMark: false, highlight: ['Mirza Mughal'], note: 'the file agrees', lang: 'en',
        back: { verdictLine: 'You rejected a genuine message', tell: 'The diary records it.', source: 'Trial (1858), p. 1' },
      }), 4000)
      expect(stage.getSourceRect()).not.toBeNull()
      ;(window as unknown as { __ftStage: { setTier(t: QualityTier): void } }).__ftStage.setTier('mid')
      await pump(100)
      expect(stage.getSourceRect()).not.toBeNull()
      stage.dispose()
    } finally {
      history.replaceState(null, '', '/')
      document.getElementById('ft-debug')?.remove()
    }
  })

  it('resolves at once before an era is set and after dispose', async () => {
    const bare = createStage(mount(), { reducedMotion: false, forceTier: 'low' })
    expect(await state(bare!.caught())).toBe('done')
    bare?.dispose()
    expect(await state(bare!.caught())).toBe('done')
  })
})
