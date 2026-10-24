import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { startApp } from '../src/app'
import { ERAS, eraById } from '../src/content/registry'
import type { EraId, Message } from '../src/content/types'
import { TOSS_GRACE_MS, TOSS_HOLD_MS, TOSS_RESUME_MS, type Difficulty } from '../src/game/config'
import { dailyFrom } from '../src/game/daily'
import { mulberry32 } from '../src/game/rng'
import { chapterPost, chapterStory, dailyFact, dailyPost } from '../src/game/share'
import { closeShareSlip } from '../src/ui/share-slip'
import { createChapter } from '../src/game/state'
import { forgetLang, setLang } from '../src/i18n/lang'
import { strings } from '../src/i18n/strings'
import type { Voice, VoiceState } from '../src/audio/voice'
import { VOICES } from '../src/content/voices'
import type { IntroSpec, RevealSpec, ScreenRect, SheetSpec, Stage, StageCueName } from '../src/scene/index'

// ---------------------------------------------------------------- mocks: content, stage, audio

const m = vi.hoisted(() => {
  // A stand-in for the stage (src/scene/types.ts Stage), checked against it below.
  const fakeStage = () => ({
    setEra: vi.fn(),
    showPaper: vi.fn(),
    stamp: vi.fn((_k: string) => Promise.resolve()),
    caught: vi.fn(() => Promise.resolve()),
    setPaused: vi.fn(),
    dispose: vi.fn(),
    establish: vi.fn(() => Promise.resolve()),
    dayTitle: vi.fn((_t: { big: string; small: string }) => Promise.resolve()),
    showMessage: vi.fn((_s: SheetSpec) => Promise.resolve()),
    redrawMessage: vi.fn((_s: SheetSpec) => undefined),
    flash: vi.fn((_k: string) => undefined),
    skip: vi.fn(),
    reveal: vi.fn((_s: RevealSpec) => Promise.resolve()),
    getSourceRect: vi.fn((): ScreenRect | null => null),
    getPaperRect: vi.fn((): ScreenRect | null => null),
    toss: vi.fn(() => Promise.resolve()),
    intro: vi.fn((_s: IntroSpec) => Promise.resolve()),
    clearIntro: vi.fn(() => Promise.resolve()),
  })
  return {
    fakeStage,
    stage: fakeStage(),
    createStage: vi.fn(),
    loadStage: vi.fn(),
    fallback: {
      setEra: vi.fn(), dispose: vi.fn(), redrawMessage: vi.fn(), flash: vi.fn(), skip: vi.fn(),
      caught: vi.fn(() => Promise.resolve()),
      showMessage: vi.fn((_s: SheetSpec) => Promise.resolve()),
      dayTitle: vi.fn((_t: { big: string; small: string }) => Promise.resolve()),
      stamp: vi.fn((_k: string) => Promise.resolve()),
      reveal: vi.fn((_s: RevealSpec) => Promise.resolve()),
      getSourceRect: vi.fn((): ScreenRect | null => null),
      getPaperRect: vi.fn((): ScreenRect | null => null),
      toss: vi.fn(() => Promise.resolve()),
      intro: vi.fn((_s: IntroSpec) => Promise.resolve()),
      clearIntro: vi.fn(() => Promise.resolve()),
    },
    mountFallback: vi.fn(),
    audio: { unlock: vi.fn(), setMuted: vi.fn(), cue: vi.fn(), ambience: vi.fn(), setHidden: vi.fn() },
  }
})

vi.mock('../src/content/registry', async () => {
  const { appEras } = await import('./app-fixture')
  const ERAS = appEras()
  return {
    ERAS,
    eraById: (id: string) => {
      const e = ERAS.find((x) => x.id === id)
      if (!e) throw new Error(`Unknown era ${id}`)
      return e
    },
  }
})
vi.mock('../src/scene/index', () => ({ STAGE_LOST_EVENT: 'ft:stage-lost', loadStage: m.loadStage, mountFallback: m.mountFallback }))
vi.mock('../src/scene/eras/index', () => ({ dressingFor: (id: string) => ({ id, fake: true }), ALL_DRESSINGS: [] }))
vi.mock('../src/audio/engine', async () => ({ audio: m.audio, cueForStage: (await import('../src/audio/stage-cues')).cueForStage }))

// ---------------------------------------------------------------- harness

const NOW = Date.parse('2026-10-25T06:00:00Z') // 25 Oct 2026 in IST: Aaj ka Taar #2

let rafQueue = new Map<number, FrameRequestCallback>()
let rafId = 0
let clock = 0

/** Runs one animation frame, `ms` after the last one. */
function frame(ms = 16): void {
  clock += ms
  const cbs = [...rafQueue.values()]
  rafQueue = new Map()
  for (const cb of cbs) cb(clock)
}
/** `seconds` of frames, one per second. */
function seconds(n: number): void {
  for (let i = 0; i < n; i++) frame(1000)
}
/** `total` ms of frames, 100 ms apart (one long frame counts for at most a second). */
function frames(total: number): void {
  for (let t = 0; t < total; t += 100) frame(Math.min(100, total - t))
}
/** The verdict holds on the paper for TOSS_HOLD_MS (counted on frames), then the paper is tossed. */
function holdOut(): void {
  frame(16) // the hold's first frame only starts its clock
  seconds(TOSS_HOLD_MS / 1000)
}

async function flush(): Promise<void> {
  for (let i = 0; i < 6; i++) await new Promise((r) => setTimeout(r, 0))
}

function boot(search = '', now = NOW, voice?: Voice): { ui: HTMLElement; stage: HTMLElement } {
  document.body.innerHTML = '<div id="stage"></div><div id="ui"></div>'
  const stage = document.getElementById('stage')!
  const ui = document.getElementById('ui')!
  startApp({ stage, ui }, { now: () => now, random: mulberry32(99), url: new URL(`https://firangitota.com/${search}`), ...(voice ? { voice } : {}) })
  return { ui, stage }
}

/** The fake must keep matching the real Stage API. */
const _typed: Omit<Stage, 'setEra'> = { ...m.fakeStage() }

/** Under reduced motion the 2D desk's DOM day title is instant. */
function reduceMotion(): void {
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: q.includes('reduce'), addEventListener() {}, removeEventListener() {} }))
}

function deferred(): { promise: Promise<void>; resolve: () => void } {
  let resolve!: () => void
  const promise = new Promise<void>((r) => (resolve = r))
  return { promise, resolve }
}

const stampBtn = (ui: HTMLElement, v: string) => ui.querySelector<HTMLButtonElement>(`[data-stamp="${v}"]`)!

/** The verdict on the paper: what the stage was asked to show, and the DOM's mirror of it. */
const lastReveal = () => m.stage.reveal.mock.calls[m.stage.reveal.mock.calls.length - 1]![0] as RevealSpec
const mirror = (ui: HTMLElement) => ui.querySelector('.paper-result__mirror')?.textContent ?? ''

const $ = (ui: HTMLElement, sel: string) => ui.querySelector<HTMLElement>(sel)
function click(ui: HTMLElement, sel: string): void {
  const el = $(ui, sel)
  if (!el) throw new Error(`nothing matches ${sel} on ${ui.querySelector('.screen')?.className}`)
  el.click()
}
const text = (ui: HTMLElement) => ui.textContent ?? ''
/** On to the next day: Next where it shows (a miss in the daily puzzle), else the verdict's hold runs out and the paper is tossed. */
async function onward(ui: HTMLElement): Promise<void> {
  if ($(ui, '[data-action="next"]')) click(ui, '[data-action="next"]')
  else holdOut()
  await flush()
}
const right = (msg: Message) => (msg.real ? 'asli' : 'tota')
const wrong = (msg: Message) => (msg.real ? 'tota' : 'asli')

function queueFor(id: EraId, d: Difficulty, seed: number): Message[] {
  return createChapter(eraById(id), d, mulberry32(seed)).queue
}

/** Begin, then on past the intro cards (who you are, who the Tota is) with its Continue slip. */
function begin(ui: HTMLElement): void {
  click(ui, '[data-action="begin"]')
  click(ui, '[data-action="intro-go"]')
}

/** The main page: choose the chapter, choose the days, Begin, past the intro → day 1. */
async function toDay1(ui: HTMLElement, id: EraId = 'delhi-1857', d: Difficulty = 'easy'): Promise<void> {
  click(ui, `[data-era="${id}"]`)
  click(ui, `[data-mode="${d}"]`)
  begin(ui)
  await flush()
}

/** The sound and language plaques live outside the screen, top right. */
const dock = (sel: string) => document.querySelector<HTMLElement>(`.controls-dock ${sel}`)

function setHidden(hidden: boolean): void {
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden })
  document.dispatchEvent(new Event('visibilitychange'))
}

const nav = navigator as unknown as Record<string, unknown>

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  setLang('en')
  localStorage.clear() // a first visit: no language picked yet
  rafQueue = new Map()
  rafId = 0
  clock = 0
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    rafQueue.set(++rafId, cb)
    return rafId
  })
  vi.stubGlobal('cancelAnimationFrame', (id: number) => rafQueue.delete(id))
  vi.stubGlobal('requestIdleCallback', (cb: IdleRequestCallback) => setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 50 }), 0))
  Object.assign(m.stage, m.fakeStage())
  m.stage.stamp.mockImplementation(() => Promise.resolve())
  m.stage.caught.mockImplementation(() => Promise.resolve())
  m.createStage.mockImplementation(() => m.stage)
  m.loadStage.mockImplementation(() => Promise.resolve({ createStage: m.createStage }))
  m.mountFallback.mockImplementation(() => m.fallback)
})

afterEach(() => {
  vi.unstubAllGlobals()
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => false })
  for (const k of ['share', 'clipboard', 'userAgent']) delete nav[k]
  closeShareSlip()
})

// ---------------------------------------------------------------- tests

describe('first visit and language', () => {
  const setLanguages = (list: string[]) => Object.defineProperty(navigator, 'languages', { configurable: true, get: () => list })

  it('lands straight on the main page, in Hindi when the browser has a Hindi language', () => {
    setLanguages(['en-GB', 'hi-IN'])
    forgetLang()
    try {
      const { ui } = boot()
      expect($(ui, '.screen--main')).not.toBeNull()
      expect($(ui, '.home__title .sr-only')!.textContent).toBe(strings.hi.appName)
      expect(document.documentElement.lang).toBe('hi')
    } finally {
      delete (navigator as unknown as Record<string, unknown>).languages
    }
  })

  it('lands in English otherwise, keeps a saved choice, and ?lang= overrides it', () => {
    setLanguages(['en-US', 'fr'])
    forgetLang()
    try {
      let { ui } = boot()
      expect($(ui, '.home__title .sr-only')!.textContent).toBe(strings.en.appName)
      setLang('hi')
      ;({ ui } = boot())
      expect($(ui, '.home__title .sr-only')!.textContent).toBe(strings.hi.appName)
      ;({ ui } = boot('?lang=en'))
      expect($(ui, '.home__title .sr-only')!.textContent).toBe(strings.en.appName)
    } finally {
      delete (navigator as unknown as Record<string, unknown>).languages
    }
  })

  it('switches language from the plaque at any time, both names always shown', () => {
    const { ui } = boot('?lang=en')
    expect([...document.querySelectorAll('.controls-dock .langswitch__opt')].map((o) => o.textContent)).toEqual(['हिंदी', 'English'])
    dock('[data-lang="hi"]')!.click()
    expect($(ui, '.home__title .sr-only')!.textContent).toBe(strings.hi.appName)
    expect(localStorage.getItem('ft:lang')).toBe('"hi"')
    expect(dock('[data-lang="hi"]')!.getAttribute('aria-pressed')).toBe('true')
  })
})

describe('a chapter', () => {
  it('1857 → Easy → day 1 → a right stamp turns the paper over to its verdict and source, then day 2', async () => {
    const { ui } = boot('?lang=en&seed=3')
    await toDay1(ui)
    expect(text(ui)).toContain('Day 1 of 7')
    const q = queueFor('delhi-1857', 'easy', 3)
    const msg = q[0]!
    expect($(ui, '.day__message .msg__body')!.textContent).toBe(m.stage.showMessage.mock.calls[0]![0].body)
    expect(m.stage.showMessage.mock.calls[0]![0].body).toContain(msg.text.en.split(' dated')[0]!)
    click(ui, `[data-stamp="${right(msg)}"]`)
    await flush()

    // the stage stamped the paper, flashed, then turned it over to the verdict
    expect(m.stage.stamp).toHaveBeenCalledWith(right(msg))
    expect(m.stage.flash).toHaveBeenCalledWith('right')
    expect(m.stage.caught).not.toHaveBeenCalled()
    const spec = lastReveal()
    expect(spec).toMatchObject({ outcome: 'right', real: msg.real, highlight: msg.checks!.en, lang: 'en' })
    expect(spec.back.verdictLine).toBe(`${strings.en.right} · ${msg.real ? strings.en.wasGenuine : strings.en.wasForged}`)
    expect(spec.back.tell).toBe(msg.real ? msg.why!.text.en : msg.tells![0]!.explain.en)
    expect(spec.back.source).toBe(msg.real ? `First Book, 1900, ${msg.why!.sources[0]!.loc}` : `Second Book, 1950, ${msg.tells![0]!.sources![0]!.loc}`)
    expect(spec.back.consequence).toBeUndefined()
    // the DOM keeps a mirror, the citations behind the source button, and Next
    expect(mirror(ui)).toContain(spec.back.tell)
    // the paper says it short; the source button opens the full citation
    expect($(ui, '#ft-source-pop')!.textContent).toContain(msg.real ? `A. Author, First Book (1900), ${msg.why!.sources[0]!.loc}` : `B. Author, Second Book (1950), ${msg.tells![0]!.sources![0]!.loc}`)
    expect(ui.querySelector('.reveal, .wire')).toBeNull() // no DOM result card, no telegram
    expect(m.stage.setEra).toHaveBeenCalledWith(expect.objectContaining({ id: 'delhi-1857' }))
    expect(m.stage.setPaused).toHaveBeenLastCalledWith(false)
    expect(m.audio.ambience).toHaveBeenCalledWith('delhi-1857')
    expect(m.audio.cue).toHaveBeenCalledWith(msg.real ? 'stampAsli' : 'stampTota')
    expect(m.audio.cue).toHaveBeenCalledWith('stampPress')
    expect(m.audio.cue).not.toHaveBeenCalledWith('correct') // the stage sounds it inside flash()

    // no Next: the verdict holds to be read, then the paper is tossed and day 2 begins by itself
    expect($(ui, '[data-action="next"]')).toBeNull()
    expect($(ui, '.screen--day.is-auto')).not.toBeNull()
    frame(16)
    seconds(TOSS_HOLD_MS / 1000 - 1)
    await flush()
    expect(m.stage.toss).not.toHaveBeenCalled()
    seconds(1)
    expect(m.stage.toss).toHaveBeenCalledTimes(1)
    await flush()
    expect(text(ui)).toContain('Day 2 of 7')
    expect($(ui, '[data-stamp="asli"]')).not.toBeNull()
    // each day: the title in the room, then the message on the 3D paper
    expect(m.stage.dayTitle.mock.calls.map((c) => c[0].big)).toEqual(['Day 1', 'Day 2'])
    expect(m.stage.showMessage).toHaveBeenCalledTimes(2)
    expect(m.stage.showPaper).not.toHaveBeenCalled()
  })

  it('a wrong stamp darkens the room and ends the chapter on the paper: the verdict, its ending and stamp, the receipts', async () => {
    const { ui } = boot('?lang=en&seed=5')
    await toDay1(ui)
    const msg = queueFor('delhi-1857', 'easy', 5)[0]!
    click(ui, `[data-stamp="${wrong(msg)}"]`)
    await flush()
    expect(m.stage.flash).toHaveBeenCalledWith('wrong')
    expect(m.stage.caught).toHaveBeenCalledTimes(1)
    const spec = lastReveal()
    expect(spec.outcome).toBe('wrong')
    expect(spec.back.verdictLine).toBe(msg.real ? strings.en.verdictRejected : strings.en.verdictPassed)
    expect(spec.back.consequence).toBe('The forger won. You were sent to Kala Pani.')
    expect(spec.back.stamp).toEqual({ text: 'Caught', tone: 'caught', style: 'seal' })
    expect(mirror(ui)).toContain('You were sent to Kala Pani.')
    expect($(ui, '[data-action="next"]')).toBeNull()
    expect($(ui, '[data-action="again"]')).not.toBeNull()
    expect($(ui, '[data-action="home"]')).not.toBeNull()
    expect(ui.querySelectorAll('#ft-receipts-pop .receipt')).toHaveLength(2) // behind the Receipts tap
    expect(text(ui)).toContain('I kept my title.')
    expect(text(ui)).toContain('A. Author, First Book (1900), p. 20')
  })

  it('the agarbatti burning out is a timeout: "Too slow", caught, with ticks in the last 30%', async () => {
    const { ui } = boot('?lang=en&seed=3')
    await toDay1(ui)
    seconds(60)
    expect($(ui, '.paper-result')).toBeNull()
    expect(m.audio.cue).not.toHaveBeenCalledWith('clockTick')
    expect($(ui, '.agarbatti')!.style.getPropertyValue('--burn')).toBe(String(31 / 90)) // the first frame only starts the clock
    seconds(35)
    await flush()
    expect(lastReveal().outcome).toBe('timeout')
    expect(lastReveal().back.verdictLine).toBe(strings.en.tooSlow)
    expect(mirror(ui)).toContain(strings.en.tooSlow)
    // a clock under 30% (26 s down to 6 s), then a rising tension tick in the last 5 s
    const count = (c: string) => m.audio.cue.mock.calls.filter(([x]) => x === c).length
    expect(count('clockTick')).toBeGreaterThanOrEqual(19)
    expect(count('clockTick')).toBeLessThanOrEqual(22)
    expect(count('tensionTick')).toBe(5)
    const levels = m.audio.cue.mock.calls.filter(([x]) => x === 'tensionTick').map((c) => (c as unknown as [string, { level: number }])[1].level)
    expect(levels[0]).toBeCloseTo(0, 5)
    expect(levels[levels.length - 1]).toBeCloseTo(0.8, 5)
    expect(count('incense')).toBeGreaterThanOrEqual(85)
    expect(m.stage.stamp).not.toHaveBeenCalled() // nobody stamped
    expect(m.stage.flash).toHaveBeenCalledWith('wrong')
    expect(m.stage.caught).toHaveBeenCalledTimes(1)
  })

  it('pauses the agarbatti while the tab is hidden and while the verdict shows', async () => {
    const { ui } = boot('?lang=en&seed=3')
    await toDay1(ui)
    seconds(10)
    setHidden(true)
    seconds(200)
    expect($(ui, '.paper-result')).toBeNull()
    setHidden(false)
    seconds(60)
    expect($(ui, '.paper-result')).toBeNull()
    const msg = queueFor('delhi-1857', 'easy', 3)[0]!
    click(ui, `[data-stamp="${right(msg)}"]`)
    await flush()
    // the tab hidden while the verdict shows: nothing burns and the paper waits on the desk
    setHidden(true)
    seconds(200)
    await flush()
    expect(m.stage.reveal).toHaveBeenCalledTimes(1) // still the first verdict: no timeout behind it
    expect(m.stage.toss).not.toHaveBeenCalled()
    expect($(ui, '.paper-result')).not.toBeNull()
  })

  it('puts the sound to sleep while the tab is hidden and wakes it on return', () => {
    boot('?lang=en')
    setHidden(true)
    expect(m.audio.setHidden).toHaveBeenLastCalledWith(true)
    setHidden(false)
    expect(m.audio.setHidden).toHaveBeenLastCalledWith(false)
  })

  it('surviving every day ends on the paper: the best run kept, the survived cue, a share slip', async () => {
    const share = vi.fn(() => Promise.resolve())
    nav.share = share
    const { ui } = boot('?lang=en&seed=8')
    await toDay1(ui)
    const q = queueFor('delhi-1857', 'easy', 8)
    for (let day = 1; day <= 7; day++) {
      expect(text(ui)).toContain(`Day ${day} of 7`)
      click(ui, `[data-stamp="${right(q[day - 1]!)}"]`)
      await flush()
      if (day < 7) await onward(ui)
    }
    expect(lastReveal().back.stamp).toEqual({ text: 'Cleared', tone: 'survived', style: 'seal' })
    expect(m.audio.cue).toHaveBeenCalledWith('survived')
    expect(localStorage.getItem('ft:best:delhi-1857:easy')).toBe('7')
    click(ui, '[data-action="share"]')
    await flush()
    // the slip: the post with its best catch, the /s/ link on this origin, and the ways to send it
    const url = 'https://firangitota.com/s/1857-e7s-en'
    const p = $(document.body, '.share-slip')!
    const post = chapterPost({ result: { era: 'delhi-1857', mode: 'easy', outcome: 'survived', days: 7, lang: 'en' }, ...chapterStory({ era: 'delhi-1857', difficulty: 'easy', day: 7, days: 7, queue: q, phase: 'survived' }, 'survived', 'en') })
    expect(post).toMatch(/^🦜 I held out all 7 days in Bahadur Shah Zafar's darbar, Delhi 1857\nMy best catch: Tell \d+: the place is wrong\n/)
    expect(p.querySelector('.share-slip__msg')!.textContent).toBe(post)
    expect(p.querySelector('.share-slip__link')!.textContent).toBe('firangitota.com/s/1857-e7s-en')
    expect(new URL(p.querySelector<HTMLAnchorElement>('[data-share="x"]')!.href).searchParams.get('url')).toBe(url)
    expect(m.audio.cue).toHaveBeenCalledWith('fileOpen')
    p.querySelector<HTMLElement>('[data-share="native"]')!.click()
    await flush()
    expect(share).toHaveBeenCalledWith({ text: post, url })
    expect($(document.body, '.share-slip')).toBeNull() // shared: the slip goes

    click(ui, '[data-action="share"]')
    click(ui, '[data-action="home"]')
    expect($(document.body, '.share-slip')).toBeNull() // the slip belongs to its screen
    expect($(ui, '[data-era="delhi-1857"]')!.textContent).toContain('Survived Easy')
  })

  it('Play again restarts the same chapter and difficulty at day 1', async () => {
    const { ui } = boot('?lang=en&seed=5')
    await toDay1(ui, 'delhi-1857', 'medium')
    click(ui, `[data-stamp="${wrong(queueFor('delhi-1857', 'medium', 5)[0]!)}"]`)
    await flush()
    click(ui, '[data-action="again"]')
    await flush()
    expect(text(ui)).toContain('Day 1 of 10')
  })

  it('the home button leaves a chapter and stops its agarbatti', async () => {
    const { ui } = boot('?lang=en&seed=3')
    await toDay1(ui)
    click(ui, '[data-action="quit"]')
    expect($(ui, '.screen--main')).not.toBeNull()
    seconds(120)
    expect($(ui, '.screen--main')).not.toBeNull()
    expect(m.stage.stamp).not.toHaveBeenCalled()
  })
})

describe('the toss: after a right stamp the paper goes in the basket and the next day starts by itself', () => {
  /** Day 1 of 1857 Easy, stamped right, its verdict up on the paper. */
  async function rightOnDay1(seed = 3): Promise<HTMLElement> {
    const { ui } = boot(`?lang=en&seed=${seed}`)
    await toDay1(ui)
    click(ui, `[data-stamp="${right(queueFor('delhi-1857', 'easy', seed)[0]!)}"]`)
    await flush()
    expect(m.stage.reveal).toHaveBeenCalledTimes(1)
    return ui
  }
  const key = (k: string, target: EventTarget = document.body) => target.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }))
  const tap = (ui: HTMLElement) => $(ui, '.tapcatch')!.dispatchEvent(new Event('pointerdown'))

  it('a tap on the room tosses at once, but not the tail of a skip in the first moment', async () => {
    const ui = await rightOnDay1()
    tap(ui) // a second tap of the skip that finished the reveal
    expect(m.stage.toss).not.toHaveBeenCalled()
    frame(16)
    frame(TOSS_GRACE_MS + 50)
    tap(ui)
    expect(m.stage.toss).toHaveBeenCalledTimes(1)
    expect($(ui, '.screen--day.is-tossing')).not.toBeNull() // the source button goes with the paper
    tap(ui) // already on its way: it lands at once
    expect(m.stage.skip).toHaveBeenCalled()
    expect(m.stage.toss).toHaveBeenCalledTimes(1)
    await flush()
    expect(text(ui)).toContain('Day 2 of 7')
    expect(m.stage.dayTitle).toHaveBeenCalledTimes(2)
  })

  it('Space or Enter tosses it; a focused control keeps its own keys', async () => {
    let ui = await rightOnDay1()
    frame(16)
    frame(TOSS_GRACE_MS + 50)
    key('Enter', $(ui, '[data-action="source"]')!) // the source button's own Enter
    expect(m.stage.toss).not.toHaveBeenCalled()
    key(' ')
    expect(m.stage.toss).toHaveBeenCalledTimes(1)
    await flush()
    expect(text(ui)).toContain('Day 2 of 7')

    vi.clearAllMocks()
    ui = await rightOnDay1()
    frame(16)
    frame(TOSS_GRACE_MS + 50)
    key('Enter')
    expect(m.stage.toss).toHaveBeenCalledTimes(1)
  })

  it('holds while the source card is open, and gives a fresh moment when it closes', async () => {
    const ui = await rightOnDay1()
    frame(16)
    seconds(2) // a second of the hold is left
    // by touch: a tap opens the card, a tap on its close slip closes it
    const tapOn = (sel: string) => {
      $(ui, sel)!.dispatchEvent(new Event('pointerdown', { bubbles: true }))
      click(ui, sel)
    }
    tapOn('[data-action="source"]')
    expect($(ui, '#ft-source-pop')!.hidden).toBe(false)
    seconds(20)
    expect(m.stage.toss).not.toHaveBeenCalled()
    tapOn('[data-action="close-source"]')
    frame(16)
    frames(TOSS_RESUME_MS - 100)
    expect(m.stage.toss).not.toHaveBeenCalled() // at least TOSS_RESUME_MS again, not the second that was left
    frame(200)
    expect(m.stage.toss).toHaveBeenCalledTimes(1)
  })

  it('a keyboard player on the source line holds it as long as they stay there', async () => {
    const ui = await rightOnDay1()
    frame(16)
    seconds(3) // half a second of the hold is left
    key('Tab')
    $(ui, '[data-action="source"]')!.focus()
    seconds(20)
    expect(m.stage.toss).not.toHaveBeenCalled()
    $(ui, '[data-action="source"]')!.blur()
    frame(16)
    frames(TOSS_RESUME_MS - 100)
    expect(m.stage.toss).not.toHaveBeenCalled()
    frame(200)
    expect(m.stage.toss).toHaveBeenCalledTimes(1)
  })

  it('holds while the tab is hidden, and gives a fresh moment back on it', async () => {
    const ui = await rightOnDay1()
    frame(16)
    seconds(2)
    setHidden(true)
    seconds(30)
    expect(m.stage.toss).not.toHaveBeenCalled()
    setHidden(false)
    frame(16)
    frames(TOSS_RESUME_MS - 100)
    expect(m.stage.toss).not.toHaveBeenCalled()
    frame(200)
    expect(m.stage.toss).toHaveBeenCalledTimes(1)
    await flush()
    expect(text(ui)).toContain('Day 2 of 7')
  })

  it('a language switch while the verdict holds redraws it and gives it a fresh moment; during the toss it waits for the next day', async () => {
    const ui = await rightOnDay1()
    frame(16)
    seconds(2)
    click(ui, '.hud [data-lang="hi"]')
    expect(m.stage.reveal).toHaveBeenCalledTimes(2) // the back, in Hindi, at once
    expect(lastReveal().lang).toBe('hi')
    frame(16)
    frames(TOSS_RESUME_MS - 100)
    expect(m.stage.toss).not.toHaveBeenCalled()
    const going = deferred()
    m.stage.toss.mockImplementationOnce(() => going.promise)
    frame(200)
    expect(m.stage.toss).toHaveBeenCalledTimes(1)
    click(ui, '.hud [data-lang="en"]')
    expect(m.stage.reveal).toHaveBeenCalledTimes(2) // no reveal over the flying paper
    expect($(ui, '.screen--day.is-tossing')).not.toBeNull()
    going.resolve()
    await flush()
    expect(text(ui)).toContain('Day 2 of 7')
    expect(m.stage.showMessage).toHaveBeenLastCalledWith(expect.objectContaining({ lang: 'en' }))
  })

  it('never hangs on a toss that does not land', async () => {
    m.stage.toss.mockImplementation(() => new Promise<void>(() => undefined))
    const ui = await rightOnDay1()
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    try {
      holdOut()
      expect(m.stage.toss).toHaveBeenCalledTimes(1)
      await vi.advanceTimersByTimeAsync(4000) // longer than the whole crumple and throw (about 2.9 s)
      expect(text(ui)).toContain('Day 1 of 7')
      await vi.advanceTimersByTimeAsync(1500) // past TOSS_GUARD_MS
      expect(text(ui)).toContain('Day 2 of 7')
    } finally {
      vi.useRealTimers()
    }
  })

  it('leaving during the hold cancels it', async () => {
    const ui = await rightOnDay1()
    frame(16)
    seconds(1)
    click(ui, '[data-action="quit"]')
    seconds(10)
    expect(m.stage.toss).not.toHaveBeenCalled()
    expect($(ui, '.screen--main')).not.toBeNull()
  })

  it('a caught chapter keeps its buttons and never tosses', async () => {
    const { ui } = boot('?lang=en&seed=5')
    await toDay1(ui)
    click(ui, `[data-stamp="${wrong(queueFor('delhi-1857', 'easy', 5)[0]!)}"]`)
    await flush()
    holdOut()
    await flush()
    expect(m.stage.toss).not.toHaveBeenCalled()
    expect($(ui, '[data-action="again"]')).not.toBeNull()
    expect($(ui, '.screen--day.is-auto')).toBeNull()
  })

  it('the flat desk names its toss beats, and they sound', async () => {
    m.createStage.mockImplementation(() => null)
    const { ui } = boot('?lang=en&seed=3')
    await toDay1(ui)
    const opts = m.mountFallback.mock.calls[0]![2] as { onCue: (n: StageCueName) => void }
    opts.onCue('crumple')
    opts.onCue('toss')
    opts.onCue('tossLand')
    expect(m.audio.cue).toHaveBeenCalledWith('paperCrumple')
    expect(m.audio.cue).toHaveBeenCalledWith('paperFlick')
    expect(m.audio.cue).toHaveBeenCalledWith('ballLand')
    click(ui, `[data-stamp="${right(queueFor('delhi-1857', 'easy', 3)[0]!)}"]`)
    await flush()
    holdOut()
    await flush()
    expect(m.fallback.toss).toHaveBeenCalledTimes(1)
    expect(text(ui)).toContain('Day 2 of 7')
  })
})

describe('the daily puzzle', () => {
  it('plays 5 messages without pencil marks and with every rule, then shows a share grid and shares the score', async () => {
    const share = vi.fn(() => Promise.resolve())
    nav.share = share
    const { ui } = boot('?lang=en&daily')
    await flush()
    const d = dailyFrom(NOW, ERAS)
    const era = eraById(d.era)
    expect(text(ui)).toContain('Day 1 of 5')
    expect(m.stage.showMessage.mock.calls[0]![0].pencil).toBe(false)
    expect(ui.querySelectorAll('.rule')).toHaveLength(era.rules.length)
    expect($(ui, '.hud__mode--daily')!.textContent).toBe(`Aaj ka Taar #${d.number}`)
    expect(m.audio.ambience).toHaveBeenCalledWith(d.era)

    // Always stamp ASLI: the forged ones are misses, and the puzzle carries on after them.
    for (let i = 0; i < 5; i++) {
      expect(text(ui)).toContain(`Day ${i + 1} of 5`)
      click(ui, '[data-stamp="asli"]')
      await flush()
      expect($(ui, '.paper-result')).not.toBeNull()
      // a hit leads on by itself; a miss keeps Next (the puzzle carries on after it)
      expect($(ui, '[data-action="next"]') === null).toBe(d.messages[i]!.real)
      await onward(ui)
    }
    const results = d.messages.map((x) => x.real)
    expect(results).toContain(false)
    // the daily card, not the chapter's caught card: the score, the grid, tomorrow and the countdown
    expect($(ui, '.screen--daily-end')).not.toBeNull()
    expect($(ui, '.daily-end__title')!.textContent).toBe(`Aaj ka Taar #${d.number} · ${results.filter(Boolean).length}/5`)
    expect($(ui, '.share-grid')!.dataset.results).toBe(results.map((r) => (r ? '1' : '0')).join(''))
    expect(ui.querySelectorAll('.share-grid .tile')).toHaveLength(5)
    expect(text(ui)).toContain(strings.en.dailyTomorrow)
    expect($(ui, '.daily-end__clock')!.textContent).toBe('12:30:00') // 11:30 IST: 12.5 hours to midnight IST
    expect(text(ui)).not.toContain(strings.en.caughtStamp)
    expect(JSON.parse(localStorage.getItem(`ft:daily:${d.isoDate}`)!).results).toEqual(results)
    click(ui, '[data-action="share"]')
    await flush()
    const right = results.filter(Boolean).length
    const post = dailyPost({ result: { era: d.era, mode: 'daily', outcome: 'caught', days: right, lang: 'en' }, number: d.number, eraTitle: era.title.en, results, fact: dailyFact(d.messages, results, 'en') })
    expect(post).toContain(results.map((r) => (r ? '✅' : '❌')).join(''))
    expect(document.querySelector('.share-slip__msg')!.textContent).toBe(post)
    document.querySelector<HTMLElement>('[data-share="native"]')!.click()
    await flush()
    expect(share).toHaveBeenCalledWith({ text: post, url: `https://firangitota.com/s/${era.year}-d${right}c-en` })
  })

  it('replaying the same IST date shows the stored result, not a new run', async () => {
    let { ui } = boot('?lang=en&daily')
    await flush()
    for (let i = 0; i < 5; i++) {
      click(ui, '[data-stamp="tota"]')
      await flush()
      await onward(ui)
    }
    const first = $(ui, '.share-grid')!.dataset.results

    ;({ ui } = boot('?lang=en&daily', NOW + 3 * 3600_000)) // later the same IST day
    await flush()
    expect($(ui, '[data-stamp]')).toBeNull()
    expect($(ui, '.share-grid')!.dataset.results).toBe(first)

    ;({ ui } = boot('?lang=en&daily', NOW + 24 * 3600_000)) // the next day is a new puzzle
    await flush()
    expect($(ui, '[data-stamp]')).not.toBeNull()
  })

  it('stores each answer at once, so leaving mid-puzzle resumes instead of restarting', async () => {
    let { ui } = boot('?lang=en&daily')
    await flush()
    click(ui, '[data-stamp="asli"]')
    await flush()
    await onward(ui)
    click(ui, '[data-action="quit"]')
    ;({ ui } = boot('?lang=en&daily'))
    await flush()
    expect(text(ui)).toContain('Day 2 of 5')
  })
})

describe('the main page', () => {
  it('opens on the first chapter not yet survived, and Begin starts day 1 with the chosen days', async () => {
    localStorage.setItem('ft:best:delhi-1857:easy', '7') // survived
    localStorage.setItem('ft:best:lahore-1929:hard', '9') // not survived: 9 of 14
    const { ui } = boot('?lang=en&seed=3')
    expect($(ui, '[role="tab"][aria-selected="true"]')!.dataset.era).toBe('lahore-1929')
    expect($(ui, 'article.doc')!.classList.contains('doc--note')).toBe(true)
    click(ui, '[data-mode="medium"]')
    expect(localStorage.getItem('ft:difficulty')).toBe('"medium"')
    begin(ui)
    await flush()
    expect(text(ui)).toContain('Day 1 of 10')
    expect(m.stage.setEra).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'lahore-1929' }))
  })

  it('switching chapter swaps the paper and the room behind it', async () => {
    const { ui } = boot('?lang=en')
    frame()
    await flush()
    m.stage.establish.mockClear()
    click(ui, '[data-era="bombay-1942"]')
    await flush()
    expect($(ui, 'article.doc')!.classList.contains('doc--radio')).toBe(true)
    expect(m.stage.setEra).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'bombay-1942' }))
    expect(m.stage.establish).toHaveBeenCalled()
    expect(m.audio.ambience).toHaveBeenLastCalledWith('bombay-1942')
    expect(m.audio.cue).toHaveBeenCalledWith('cardTurn')
  })

  it('remembers mute across visits; sound is on by default', () => {
    boot('?lang=en')
    expect(m.audio.setMuted).toHaveBeenLastCalledWith(false)
    dock('[data-action="sound"]')!.click()
    expect(localStorage.getItem('ft:muted')).toBe('true')
    expect(m.audio.setMuted).toHaveBeenLastCalledWith(true)
    boot('?lang=en')
    expect(m.audio.setMuted).toHaveBeenLastCalledWith(true)
    expect(dock('[data-action="sound"]')!.getAttribute('aria-pressed')).toBe('false')
  })

  it('unlocks audio on the first tap anywhere', () => {
    boot('?lang=en')
    expect(m.audio.unlock).not.toHaveBeenCalled()
    document.body.dispatchEvent(new Event('pointerup', { bubbles: true }))
    expect(m.audio.unlock).toHaveBeenCalled()
  })

  it('opens the credits from the line at the bottom and comes back, with the plaques still there', () => {
    const { ui } = boot('?lang=en')
    click(ui, '[data-action="credits"]')
    expect(text(ui)).toContain('Inspired by Politburo or Parrot by atomiquest')
    expect(dock('[data-action="sound"]')).not.toBeNull()
    click(ui, '[data-action="back"]')
    expect($(ui, '.screen--main')).not.toBeNull()
  })
})

describe('the intro after Begin: who you are and who the Tota is', () => {
  const lastIntro = () => m.stage.intro.mock.calls[m.stage.intro.mock.calls.length - 1]![0] as IntroSpec
  const key = (k: string, o: KeyboardEventInit = {}) => document.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...o }))

  async function toIntro(ui: HTMLElement, id: EraId = 'delhi-1857'): Promise<void> {
    click(ui, `[data-era="${id}"]`)
    click(ui, '[data-mode="easy"]')
    click(ui, '[data-action="begin"]')
    await flush()
  }

  it('lays the two cards on the desk in the live room, then waits for Continue', async () => {
    const { ui } = boot('?lang=en&seed=3')
    await toIntro(ui)
    expect($(ui, '.screen--intro')).not.toBeNull()
    expect($(ui, '.screen--day')).toBeNull()
    expect(m.stage.intro).toHaveBeenCalledTimes(1)
    const s = lastIntro()
    expect(s).toMatchObject({ era: 'delhi-1857', lang: 'en', you: { label: 'You', line: 'a clerk', art: '/art/delhi-1857-you.webp' }, tota: { label: 'The Tota', line: 'a rival', art: '/art/delhi-1857-tota.webp' } })
    // the room is the scene: no day yet, no stamps; the plaques stay for sound and language
    expect(m.stage.dayTitle).not.toHaveBeenCalled()
    expect(dock('[data-action="sound"]')!.closest('.controls-dock')!.hasAttribute('hidden')).toBe(false)
    // screen readers get both cards' words, and the cards are settled: the Continue slip is up
    expect($(ui, '.intro__copy')!.textContent).toBe('You: a clerk.The Tota: a rival.')
    expect($(ui, '.screen--intro.is-settled')).not.toBeNull()
    expect($(ui, '.intro__fuse')).toBeNull() // no timer on the slip (owner 10-24)
    // a tap on the room never goes on by itself; only Continue does
    $(ui, '.intro__tap')!.dispatchEvent(new Event('pointerdown'))
    await flush()
    expect($(ui, '.screen--intro')).not.toBeNull()
    click(ui, '[data-action="intro-go"]')
    await flush()
    expect($(ui, '.screen--day')).not.toBeNull()
    expect(m.stage.clearIntro).toHaveBeenCalledTimes(1)
    expect(m.stage.dayTitle).toHaveBeenCalledTimes(1)
  })

  it('a tap while the cards still move finishes their motion first', async () => {
    let settle!: () => void
    m.stage.intro.mockImplementation(() => new Promise<void>((r) => (settle = r)))
    const { ui } = boot('?lang=en&seed=3')
    await toIntro(ui)
    $(ui, '.intro__tap')!.dispatchEvent(new Event('pointerdown'))
    expect(m.stage.skip).toHaveBeenCalledTimes(1)
    expect($(ui, '.screen--intro')).not.toBeNull()
    settle()
    await flush()
    $(ui, '.intro__tap')!.dispatchEvent(new Event('pointerdown'))
    await flush()
    expect($(ui, '.screen--intro')).not.toBeNull()
    expect(m.stage.skip).toHaveBeenCalledTimes(1) // the settled cards are not skipped again
  })

  it('Space or Enter on the room never goes on once the cards are down; Continue does', async () => {
    const { ui } = boot('?lang=en&seed=3')
    await toIntro(ui)
    key('Enter')
    key(' ')
    await flush()
    expect($(ui, '.screen--intro')).not.toBeNull()
    expect(m.stage.skip).not.toHaveBeenCalled()
    click(ui, '[data-action="intro-go"]')
    await flush()
    expect($(ui, '.screen--day')).not.toBeNull()
  })

  it('the Enter that pressed Begin never also skips the cards', async () => {
    let settle!: () => void
    m.stage.intro.mockImplementation(() => new Promise<void>((r) => (settle = r)))
    const { ui } = boot('?lang=en&seed=3')
    await toIntro(ui) // one intro first, so its key handler is already listening
    settle()
    await flush()
    click(ui, '[data-action="intro-go"]')
    await flush()
    click(ui, '[data-action="home"], [data-action="quit"]')
    await flush()
    m.stage.skip.mockClear()
    key('Enter')
    await flush()
    expect($(ui, '.screen--intro')).not.toBeNull()
    expect(m.stage.skip).not.toHaveBeenCalled()
  })

  it('waits for Continue however long it takes, hidden tab or not', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    try {
      const { ui } = boot('?lang=en&seed=3')
      click(ui, '[data-action="begin"]')
      await vi.advanceTimersByTimeAsync(3000)
      setHidden(true)
      await vi.advanceTimersByTimeAsync(20_000)
      setHidden(false)
      await vi.advanceTimersByTimeAsync(60_000)
      expect($(ui, '.screen--intro')).not.toBeNull()
      click(ui, '[data-action="intro-go"]')
      await vi.advanceTimersByTimeAsync(10)
      expect($(ui, '.screen--day')).not.toBeNull()
    } finally {
      vi.useRealTimers()
    }
  })

  it('never stalls on cards that do not settle: Continue comes up after a guard', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    try {
      m.stage.intro.mockImplementation(() => new Promise<void>(() => undefined))
      const { ui } = boot('?lang=en&seed=3')
      click(ui, '[data-action="begin"]')
      await vi.advanceTimersByTimeAsync(4900)
      expect($(ui, '.screen--intro.is-settled')).toBeNull()
      await vi.advanceTimersByTimeAsync(200)
      expect($(ui, '.screen--intro.is-settled')).not.toBeNull()
      click(ui, '[data-action="intro-go"]')
      await vi.advanceTimersByTimeAsync(10)
      expect($(ui, '.screen--day')).not.toBeNull()
    } finally {
      vi.useRealTimers()
    }
  })

  it('the language switch redraws the cards on the desk and the words in the new language', async () => {
    const { ui } = boot('?lang=en&seed=3')
    await toIntro(ui)
    dock('[data-lang="hi"]')!.click()
    expect(lastIntro()).toMatchObject({ lang: 'hi', you: { label: 'आप', line: 'एक मुंशी' }, tota: { label: 'तोता', line: 'एक दुश्मन' } })
    expect($(ui, '.intro__copy')!.textContent).toBe('आप: एक मुंशी।तोता: एक दुश्मन।')
    expect($(ui, '.intro__go')!.textContent).toBe(strings.hi.continue)
    expect($(ui, '.screen--intro')).not.toBeNull()
  })

  it('Continue goes straight to day 1, even while the cards still move', async () => {
    m.stage.intro.mockImplementation(() => new Promise<void>(() => undefined))
    const { ui } = boot('?lang=en&seed=3')
    await toIntro(ui, 'bombay-1942')
    click(ui, '[data-action="intro-go"]')
    await flush()
    expect(text(ui)).toContain('Day 1 of 7')
    expect(m.stage.clearIntro).toHaveBeenCalledTimes(1)
  })

  it('a lost WebGL context mid-intro shows the cards on the 2D desk at once', async () => {
    let settle!: () => void
    m.stage.intro.mockImplementation(() => new Promise<void>((r) => (settle = r)))
    const { ui, stage } = boot('?lang=en&seed=3')
    await toIntro(ui)
    stage.dispatchEvent(new CustomEvent('ft:stage-lost', { cancelable: true, detail: { era: 'delhi-1857', reason: 'context-lost' } }))
    expect(m.fallback.intro).toHaveBeenCalledWith(expect.objectContaining({ era: 'delhi-1857' }))
    expect(m.fallback.skip).toHaveBeenCalled()
    await flush()
    expect($(ui, '.screen--intro.is-settled')).not.toBeNull() // the dead stage's promise is not waited for
    settle()
    click(ui, '[data-action="intro-go"]')
    await flush()
    expect(m.fallback.clearIntro).toHaveBeenCalled()
    expect($(ui, '.screen--day')).not.toBeNull()
  })

  it('on a wide screen the Continue slip sits just under the cards; with no room, along the bottom', async () => {
    m.stage.getPaperRect.mockImplementation(() => ({ x: 100, y: 200, w: 800, h: 300 }))
    const { ui } = boot('?lang=en&seed=3') // jsdom's window is 1024 × 768
    await toIntro(ui)
    const foot = $(ui, '.intro__foot')!
    expect(foot.classList.contains('is-under')).toBe(true)
    expect(foot.style.top).toBe('514px')
    // the language switch draws the slip again, still under the cards
    dock('[data-lang="hi"]')!.click()
    expect($(ui, '.intro__foot')!.style.top).toBe('514px')
    m.stage.getPaperRect.mockImplementation(() => ({ x: 100, y: 300, w: 800, h: 440 }))
    dock('[data-lang="en"]')!.click()
    expect($(ui, '.intro__foot')!.classList.contains('is-under')).toBe(false)
  })

  it('plays on every Begin', async () => {
    const { ui } = boot('?lang=en&seed=3')
    await toIntro(ui)
    click(ui, '[data-action="intro-go"]')
    await flush()
    click(ui, '[data-action="quit"]')
    await flush()
    await toIntro(ui, 'lahore-1929')
    expect(m.stage.intro).toHaveBeenCalledTimes(2)
    expect(lastIntro().era).toBe('lahore-1929')
  })
})

describe('sharing without navigator.share', () => {
  it('offers WhatsApp, X and copy link, and copies the /s/ link', async () => {
    const writeText = vi.fn(() => Promise.resolve())
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    const { ui } = boot('?lang=en&seed=5')
    await toDay1(ui)
    const q = queueFor('delhi-1857', 'easy', 5)
    click(ui, `[data-stamp="${wrong(q[0]!)}"]`)
    await flush()
    click(ui, '[data-action="share"]')
    await flush()
    const slip = document.querySelector<HTMLElement>('.share-slip')!
    expect(slip.querySelector('[data-share="native"]')).toBeNull()
    const url = 'https://firangitota.com/s/1857-e0c-en'
    const post = slip.querySelector('.share-slip__msg')!.textContent!
    expect(post.split('\n')[0]).toBe(q[0]!.real
      ? "🦜 I called a real message fake on day 1 in Bahadur Shah Zafar's darbar, Delhi 1857"
      : "🦜 The Firangi Tota fooled me on day 1 in Bahadur Shah Zafar's darbar, Delhi 1857")
    expect(slip.querySelector<HTMLAnchorElement>('[data-share="whatsapp"]')!.getAttribute('href')).toBe(`https://wa.me/?text=${encodeURIComponent(`${post}\n${url}`)}`)
    slip.querySelector<HTMLElement>('[data-share="copy"]')!.click()
    await flush()
    expect(writeText).toHaveBeenCalledWith(url)
    expect(slip.querySelector('[data-share="copy"]')!.textContent).toBe(strings.en.copied)
  })

  it('shares in the language on screen, with the link in that language', async () => {
    const { ui } = boot('?lang=hi&seed=5')
    await toDay1(ui, 'lahore-1929', 'hard')
    click(ui, `[data-stamp="${wrong(queueFor('lahore-1929', 'hard', 5)[0]!)}"]`)
    await flush()
    click(ui, '[data-action="share"]')
    await flush()
    const slip = document.querySelector<HTMLElement>('.share-slip')!
    expect(slip.closest('.share-layer')!.getAttribute('lang')).toBe('hi')
    expect(slip.querySelector('.share-slip__msg')!.textContent).toMatch(/^🦜 लाहौर 1929 में भगत सिंह के साथियों का पोस्ट बॉक्स बनकर पहले दिन /)
    expect(slip.querySelector('.share-slip__link')!.textContent).toBe('firangitota.com/s/1929-h0c-hi')
  })
})

describe('arriving from a share link', () => {
  it('the link page\u2019s ?chapter and ?mode pick the friend\u2019s chapter and mode, without remembering them', () => {
    localStorage.setItem('ft:difficulty', JSON.stringify('medium'))
    const replace = vi.spyOn(history, 'replaceState')
    const { ui } = boot('?lang=en&chapter=bombay-1942&mode=hard')
    expect($(ui, '[data-era="bombay-1942"]')!.className).toContain('is-on')
    expect($(ui, '[data-mode="hard"]')!.className).toContain('is-on')
    expect(m.audio.ambience).toHaveBeenLastCalledWith('bombay-1942')
    expect(JSON.parse(localStorage.getItem('ft:difficulty')!)).toBe('medium')
    expect(replace).toHaveBeenCalledWith(null, '', '/?lang=en')
    replace.mockRestore()
  })

  it('the offline copy answering /s/<code> picks the same, and a daily code opens the daily puzzle', async () => {
    const replace = vi.spyOn(history, 'replaceState')
    let { ui } = boot('s/1947-h3c-hi')
    expect($(ui, '[data-era="delhi-1947"]')!.className).toContain('is-on')
    expect($(ui, '[data-mode="hard"]')!.className).toContain('is-on')
    expect(replace).toHaveBeenCalledWith(null, '', '/')
    ;({ ui } = boot('s/1857-d4c-en?lang=en'))
    await flush()
    expect(text(ui)).toContain('Day 1 of 5')
    // a code that does not parse changes nothing
    ;({ ui } = boot('s/1858-e7s-en?lang=en'))
    expect($(ui, '.screen--main')).not.toBeNull()
    replace.mockRestore()
  })

  it('ignores picks that are not a chapter or a mode', () => {
    const { ui } = boot('?lang=en&chapter=<script>&mode=impossible')
    expect($(ui, '.screen--main')).not.toBeNull()
    expect(ui.querySelector('[data-mode].is-on')!.getAttribute('data-mode')).toBe('easy')
  })
})

describe('the 3D stage (Ruling R10)', () => {
  it('paints the main page without three.js, then loads the stage after the first paint when idle', async () => {
    const { ui, stage } = boot('?lang=en&tier=low')
    expect($(ui, '.screen--main')).not.toBeNull()
    expect(m.loadStage).not.toHaveBeenCalled()
    frame()
    await flush()
    expect(m.loadStage).toHaveBeenCalledTimes(1)
    expect(m.createStage).toHaveBeenCalledWith(stage, expect.objectContaining({ forceTier: 'low', reducedMotion: false }))
    expect(m.stage.setEra).toHaveBeenCalledTimes(1) // the main page shows the chapter's room
  })

  it('loads the stage at once on the first chapter tap', async () => {
    const { ui } = boot('?lang=en')
    click(ui, '[data-era="bombay-1942"]')
    expect(m.loadStage).toHaveBeenCalledTimes(1)
    await flush()
    expect(m.stage.setEra).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'bombay-1942' }))
  })

  it('uses the 2D fallback when there is no WebGL2, and the game still plays', async () => {
    reduceMotion()
    m.createStage.mockImplementation(() => null)
    const { ui, stage } = boot('?lang=en&seed=3')
    await toDay1(ui)
    expect(m.mountFallback).toHaveBeenCalledWith(stage, 'delhi-1857', { onCue: expect.any(Function) })
    const msg = queueFor('delhi-1857', 'easy', 3)[0]!
    click(ui, `[data-stamp="${right(msg)}"]`)
    await flush()
    expect($(ui, '.paper-result')).not.toBeNull()
  })

  it('falls back when the stage chunk fails to load', async () => {
    m.loadStage.mockImplementation(() => Promise.reject(new Error('offline')))
    const { ui, stage } = boot('?lang=en')
    click(ui, '[data-era="lahore-1929"]')
    await flush()
    expect(m.mountFallback).toHaveBeenCalledWith(stage, 'lahore-1929', { onCue: expect.any(Function) })
  })

  it('swaps in the fallback when the WebGL context is lost, keeping the current day', async () => {
    reduceMotion()
    const { ui, stage } = boot('?lang=en&seed=3')
    await toDay1(ui)
    const q = queueFor('delhi-1857', 'easy', 3)
    click(ui, `[data-stamp="${right(q[0]!)}"]`)
    await flush()
    await onward(ui)
    expect(text(ui)).toContain('Day 2 of 7')

    const lost = new CustomEvent('ft:stage-lost', { cancelable: true, detail: { era: 'delhi-1857', reason: 'context-lost' } })
    stage.dispatchEvent(lost)
    expect(lost.defaultPrevented).toBe(true)
    expect(m.stage.dispose).toHaveBeenCalledTimes(1)
    expect(m.mountFallback).toHaveBeenCalledWith(stage, 'delhi-1857', { onCue: expect.any(Function) })
    expect(text(ui)).toContain('Day 2 of 7')

    m.stage.stamp.mockClear()
    click(ui, `[data-stamp="${right(q[1]!)}"]`)
    await flush()
    expect($(ui, '.paper-result')).not.toBeNull()
    expect(m.stage.stamp).not.toHaveBeenCalled() // the dead stage is no longer used
  })

  it('keeps the verdict when the context is lost after the stamp: the 2D desk shows the back and the source button follows it', async () => {
    reduceMotion()
    m.stage.getSourceRect.mockImplementation(() => ({ x: 30, y: 600, w: 200, h: 24 }))
    m.fallback.getSourceRect.mockImplementation(() => ({ x: 12, y: 400, w: 150, h: 20 }))
    const { ui, stage } = boot('?lang=en&seed=3')
    await toDay1(ui)
    const msg = queueFor('delhi-1857', 'easy', 3)[0]!
    click(ui, `[data-stamp="${right(msg)}"]`)
    await flush()
    expect($(ui, '.source-hit')!.style.left).toBe('30px')
    const spec = lastReveal()

    stage.dispatchEvent(new CustomEvent('ft:stage-lost', { cancelable: true, detail: { era: 'delhi-1857', reason: 'context-lost' } }))
    await flush()
    // the paper (revealed: its real-document tag allowed), its verdict, then skip() to the back
    expect(m.fallback.showMessage).toHaveBeenLastCalledWith(expect.objectContaining({ revealed: true }))
    expect(m.fallback.reveal).toHaveBeenCalledWith(spec)
    expect(m.fallback.skip).toHaveBeenCalled()
    const skips = m.fallback.skip.mock.invocationCallOrder
    expect(m.fallback.reveal.mock.invocationCallOrder[0]!).toBeLessThan(skips[skips.length - 1]!)
    // the day is redrawn on the new desk: the verdict stays, the source button moves
    expect($(ui, '.paper-result')).not.toBeNull()
    expect($(ui, '.screen--day.is-auto')).not.toBeNull()
    expect($(ui, '.source-hit')!.style.left).toBe('12px')
    // and the new desk tosses the paper when it has been read
    holdOut()
    await flush()
    expect(m.fallback.toss).toHaveBeenCalledTimes(1)
    expect(m.stage.toss).not.toHaveBeenCalled()
    expect(text(ui)).toContain('Day 2 of 7')
  })

  it('keeps the verdict when the context is lost during the reveal, without waiting for the dead desk', async () => {
    reduceMotion()
    m.stage.reveal.mockImplementation(() => new Promise<void>(() => undefined)) // the lost desk never finishes
    m.fallback.getSourceRect.mockImplementation(() => ({ x: 14, y: 420, w: 150, h: 20 }))
    const { ui, stage } = boot('?lang=en&seed=3')
    await toDay1(ui)
    click(ui, `[data-stamp="${right(queueFor('delhi-1857', 'easy', 3)[0]!)}"]`)
    await flush()
    expect(m.stage.reveal).toHaveBeenCalledTimes(1)
    expect($(ui, '.paper-result')).toBeNull()
    const spec = lastReveal()

    stage.dispatchEvent(new CustomEvent('ft:stage-lost', { cancelable: true, detail: { era: 'delhi-1857', reason: 'context-lost' } }))
    await flush()
    expect(m.fallback.reveal).toHaveBeenCalledWith(spec)
    expect(m.fallback.skip).toHaveBeenCalled()
    expect($(ui, '.paper-result')).not.toBeNull()
    expect($(ui, '.source-hit')!.style.left).toBe('14px')
    expect($(ui, '.screen--day.is-auto')).not.toBeNull()
  })

  it('never hangs on a stamp animation that does not finish', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    try {
      m.stage.stamp.mockImplementation(() => new Promise<void>(() => undefined))
      const { ui } = boot('?lang=en&seed=3')
      click(ui, '[data-era="delhi-1857"]')
      click(ui, '[data-mode="easy"]')
      begin(ui)
      await vi.advanceTimersByTimeAsync(10)
      const verdict = right(queueFor('delhi-1857', 'easy', 3)[0]!)
      click(ui, `[data-stamp="${verdict}"]`)
      // while the stamp comes down the stamps stop taking taps
      expect($(ui, '.screen--day.is-stamping')).not.toBeNull()
      expect($(ui, `[data-stamp="${verdict}"]`)!.classList.contains('is-chosen')).toBe(true)
      expect(stampBtn(ui, 'asli').disabled && stampBtn(ui, 'tota').disabled).toBe(true)
      click(ui, `[data-stamp="${verdict === 'asli' ? 'tota' : 'asli'}"]`) // ignored: one stamp per day
      expect(m.stage.stamp).toHaveBeenCalledTimes(1)
      await vi.advanceTimersByTimeAsync(5000)
      expect($(ui, '.paper-result')).not.toBeNull()
    } finally {
      vi.useRealTimers()
    }
  })

  it('waits out the caught sequence before the paper turns over, and never hangs on one that does not finish', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    try {
      // a sequence that takes its full four seconds and more
      m.stage.caught.mockImplementation(() => new Promise<void>((r) => setTimeout(r, 4400)))
      const { ui } = boot('?lang=en&seed=5')
      click(ui, '[data-era="delhi-1857"]')
      click(ui, '[data-mode="easy"]')
      begin(ui)
      await vi.advanceTimersByTimeAsync(10)
      click(ui, `[data-stamp="${wrong(queueFor('delhi-1857', 'easy', 5)[0]!)}"]`)
      await vi.advanceTimersByTimeAsync(4300) // past the old 3.5 s guard: still the alarm
      expect(m.stage.reveal).not.toHaveBeenCalled()
      expect($(ui, '.screen--day.is-stamping')).not.toBeNull() // a tap on the room skips it
      await vi.advanceTimersByTimeAsync(200)
      expect(m.stage.reveal).toHaveBeenCalledTimes(1)
      // one that never ends: the verdict still comes, after the guard
      m.stage.caught.mockImplementation(() => new Promise<void>(() => undefined))
      m.stage.reveal.mockClear()
      click(ui, '[data-action="again"]')
      await vi.advanceTimersByTimeAsync(10)
      click(ui, `[data-stamp="${wrong(queueFor('delhi-1857', 'easy', 5)[0]!)}"]`) // (the same seed, the same first paper)
      await vi.advanceTimersByTimeAsync(6000)
      expect(m.stage.reveal).not.toHaveBeenCalled()
      await vi.advanceTimersByTimeAsync(600)
      expect(m.stage.reveal).toHaveBeenCalledTimes(1)
    } finally {
      vi.useRealTimers()
    }
  })

  it('a desk lost during the caught sequence goes straight on to the verdict on the new one', async () => {
    m.stage.caught.mockImplementation(() => new Promise<void>(() => undefined))
    const { ui, stage } = boot('?lang=en&seed=5')
    await toDay1(ui)
    click(ui, `[data-stamp="${wrong(queueFor('delhi-1857', 'easy', 5)[0]!)}"]`)
    await flush()
    expect(m.stage.caught).toHaveBeenCalledTimes(1)
    expect(m.stage.reveal).not.toHaveBeenCalled()
    stage.dispatchEvent(new CustomEvent('ft:stage-lost', { cancelable: true, detail: { era: 'delhi-1857', reason: 'context-lost' } }))
    await flush()
    expect(m.fallback.reveal).toHaveBeenCalledTimes(1)
    expect(m.fallback.reveal.mock.calls[0]![0].outcome).toBe('wrong')
    expect($(ui, '.paper-result')).not.toBeNull()
  })

  it('keeps the stamps asleep through a slow arrival (the 1947 telegram types for ~6 s)', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    try {
      m.stage.showMessage.mockImplementation(() => new Promise<void>((r) => setTimeout(r, 6000)))
      const { ui } = boot('?lang=en&seed=3')
      click(ui, '[data-era="delhi-1947"]')
      click(ui, '[data-mode="easy"]')
      begin(ui)
      await vi.advanceTimersByTimeAsync(10)
      expect(m.stage.showMessage).toHaveBeenCalledTimes(1)
      await vi.advanceTimersByTimeAsync(5000) // past the old 3.5 s guard
      expect(stampBtn(ui, 'asli').disabled && stampBtn(ui, 'tota').disabled).toBe(true)
      expect($(ui, '.screen--day.is-arriving')).not.toBeNull()
      await vi.advanceTimersByTimeAsync(1000) // the telegram is typed out
      expect(stampBtn(ui, 'asli').disabled || stampBtn(ui, 'tota').disabled).toBe(false)
    } finally {
      vi.useRealTimers()
    }
  })

  it('still wakes the stamps when an arrival never settles, after the long guard', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    try {
      m.stage.showMessage.mockImplementation(() => new Promise<void>(() => undefined))
      const { ui } = boot('?lang=en&seed=3')
      click(ui, '[data-mode="easy"]')
      begin(ui) // not toDay1: its flush() waits on the faked setTimeout
      await vi.advanceTimersByTimeAsync(8500)
      expect(stampBtn(ui, 'asli').disabled).toBe(true)
      await vi.advanceTimersByTimeAsync(1000)
      expect(stampBtn(ui, 'asli').disabled).toBe(false)
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('the immersive day', () => {
  it('establishes the wide room behind the main page', async () => {
    boot('?lang=en')
    frame()
    await flush()
    expect(m.stage.establish).toHaveBeenCalledTimes(1) // once the stage arrives
  })

  it('titles the day in the room, then brings the message in; the stamps and the agarbatti wait for it', async () => {
    const arrival = deferred()
    m.stage.showMessage.mockImplementation(() => arrival.promise)
    const { ui } = boot('?lang=en&seed=3')
    await toDay1(ui)
    expect(m.stage.dayTitle).toHaveBeenCalledWith({ big: 'Day 1', small: 'Sunday, 17 May 1857' })
    const sheet = m.stage.showMessage.mock.calls[0]![0]
    const msg = queueFor('delhi-1857', 'easy', 3)[0]!
    expect(sheet).toMatchObject({ era: 'delhi-1857', channel: 'petition', lang: 'en', pencil: true, documentMark: false, checks: msg.checks!.en })
    expect(sheet.body).toBe(msg.text.en.replace('{date}', '17 May 1857'))
    expect(stampBtn(ui, 'asli').disabled).toBe(true)
    expect($(ui, '.screen--day.is-arriving')).not.toBeNull()
    expect($(ui, '.day__message')!.textContent).toBe('') // the hidden copy waits for the paper too
    seconds(200)
    expect($(ui, '.paper-result')).toBeNull() // no agarbatti before the paper is readable
    click(ui, `[data-stamp="${right(msg)}"]`)
    expect(m.stage.stamp).not.toHaveBeenCalled()

    arrival.resolve()
    await flush()
    expect(stampBtn(ui, 'asli').disabled).toBe(false)
    expect($(ui, '.day__message .msg__body')!.textContent).toBe(sheet.body)
    seconds(91)
    await flush()
    expect(mirror(ui)).toContain(strings.en.tooSlow)
  })

  it('a tap on the room skips the arrival and the stamp; the stamps stay off while it comes down', async () => {
    const arrival = deferred()
    const stamping = deferred()
    m.stage.showMessage.mockImplementation(() => arrival.promise)
    m.stage.stamp.mockImplementation(() => stamping.promise)
    const { ui } = boot('?lang=en&seed=3')
    await toDay1(ui)
    $(ui, '.tapcatch')!.dispatchEvent(new Event('pointerdown'))
    expect(m.stage.skip).toHaveBeenCalledTimes(1)
    arrival.resolve()
    await flush()
    const msg = queueFor('delhi-1857', 'easy', 3)[0]!
    click(ui, `[data-stamp="${right(msg)}"]`)
    await flush()
    expect(stampBtn(ui, 'asli').disabled && stampBtn(ui, 'tota').disabled).toBe(true)
    expect($(ui, '.paper-result')).toBeNull()
    $(ui, '.tapcatch')!.dispatchEvent(new Event('pointerdown'))
    expect(m.stage.skip).toHaveBeenCalledTimes(2)
    stamping.resolve()
    await flush()
    expect($(ui, '.paper-result')).not.toBeNull()
  })

  it('switches language mid-day: the paper is redrawn, the agarbatti keeps burning', async () => {
    const { ui } = boot('?lang=en&seed=3')
    await toDay1(ui)
    seconds(20)
    click(ui, '.hud [data-lang="hi"]')
    expect(m.stage.redrawMessage).toHaveBeenCalledTimes(1)
    const sheet = m.stage.redrawMessage.mock.calls[0]![0]
    expect(sheet.lang).toBe('hi')
    expect(sheet.body).toContain('17 मई 1857')
    expect($(ui, '.day__message .msg__body')!.textContent).toBe(sheet.body)
    expect($(ui, '.hud__mode')!.textContent).toBe(strings.hi.modeEasy)
    expect(Number($(ui, '.hud__secs')!.textContent)).toBeLessThan(72)
    expect(m.stage.showMessage).toHaveBeenCalledTimes(1) // no second arrival
  })

  it('mutes game sound from the day without leaving it', async () => {
    const { ui } = boot('?lang=en&seed=3')
    await toDay1(ui)
    click(ui, '.hud [data-action="sound"]')
    expect(m.audio.setMuted).toHaveBeenLastCalledWith(true)
    expect(m.audio.cue).toHaveBeenCalledWith('toggleClick')
    expect($(ui, '.hud [data-action="sound"]')!.getAttribute('aria-pressed')).toBe('false')
    expect($(ui, '.screen--day')).not.toBeNull()
  })

  it('shows nothing that gives away the answer before the stamp (R30b)', async () => {
    for (const r of eraById('delhi-1857').messages) if (r.real) r.document = { sources: [{ id: 's1' }] }
    try {
      const { ui } = boot('?lang=en&seed=3')
      await toDay1(ui)
      const screenEl = $(ui, '.screen--day')!
      const attrs = [screenEl, ...screenEl.querySelectorAll('*')].flatMap((el) => [...el.attributes].map((a) => `${a.name}=${a.value}`)).join(' ')
      expect(attrs).not.toMatch(/real|forged|genuine|document|📜/i)
      // the chrome and the hidden copy's header say nothing; the body is the message itself (the
      // fixture's bodies literally say "Genuine report" / "Forged report", which content never does)
      const chrome = screenEl.cloneNode(true) as HTMLElement
      chrome.querySelector('.msg__body')!.remove()
      expect(chrome.textContent).not.toMatch(/\b(real|forged|genuine|document)\b|📜/i)
      expect(screenEl.querySelector('.msg__body')!.textContent).toBe(m.stage.showMessage.mock.calls[0]![0].body)
      expect(m.stage.showMessage.mock.calls[0]![0].documentMark).toBe(false)
    } finally {
      for (const r of eraById('delhi-1857').messages) delete r.document
    }
  })
})

describe('Listen: the era voice reads the message', () => {
  function fakeVoice() {
    let cb: (s: VoiceState) => void = () => undefined
    return {
      play: vi.fn((_p: { era: EraId; id: string; lang: 'en' | 'hi'; day: number }) => {
        cb('loading')
        cb('playing')
        return Promise.resolve()
      }),
      stop: vi.fn(() => cb('idle')),
      onState: vi.fn((fn: (s: VoiceState) => void) => {
        cb = fn
        return () => undefined
      }),
      fail: () => cb('error'),
    }
  }

  it('plays the current message in its era voice, stops on a second tap, and stops on a stamp, a new day or leaving', async () => {
    const voice = fakeVoice()
    const { ui } = boot('?lang=en&seed=3', NOW, voice)
    await toDay1(ui)
    const q = queueFor('delhi-1857', 'easy', 3)
    const btn = () => $(ui, '[data-action="listen"]')!
    expect(btn().textContent).toBe(strings.en.listen)
    click(ui, '[data-action="listen"]')
    expect(voice.play).toHaveBeenCalledWith({ era: 'delhi-1857', id: q[0]!.id, lang: 'en', day: 1, voice: 'dastango' })
    expect(btn().dataset.state).toBe('playing')
    click(ui, '[data-action="listen"]')
    expect(voice.stop).toHaveBeenCalled()
    expect(btn().dataset.state).toBe('idle')

    voice.stop.mockClear()
    click(ui, '[data-action="listen"]')
    click(ui, `[data-stamp="${right(q[0]!)}"]`)
    expect(voice.stop).toHaveBeenCalled() // the stamp
    await flush()
    voice.stop.mockClear()
    holdOut()
    await flush()
    expect(voice.stop).toHaveBeenCalled() // a new day
    voice.stop.mockClear()
    click(ui, '[data-action="quit"]')
    expect(voice.stop).toHaveBeenCalled() // leaving
  })

  it('reads in the dastango everywhere, with no picker while the guest voice is off', async () => {
    localStorage.setItem('ft:voiceStyle', '"era"') // an old choice falls back to the dastango
    const voice = fakeVoice()
    const { ui } = boot('?lang=en&seed=3', NOW, voice)
    await toDay1(ui)
    expect($(ui, '[data-action="voice-style"]')).toBeNull()
    expect($(ui, '.voice-picker')).toBeNull()
    click(ui, '[data-action="listen"]')
    expect(voice.play).toHaveBeenLastCalledWith(expect.objectContaining({ voice: 'dastango' }))
  })

  it('offers Dastango and the guest once the guest voice is enabled, and remembers the pick', async () => {
    const guest = VOICES.guest as { enabled: boolean; label: { en: string; hi: string }; credit?: string }
    const saved = { ...guest }
    Object.assign(guest, { enabled: true, label: { en: 'Piyush Mishra', hi: 'पीयूष मिश्रा' }, credit: 'Voice: Piyush Mishra (with permission)' })
    try {
      const voice = fakeVoice()
      let { ui } = boot('?lang=hi&seed=3', NOW, voice)
      await toDay1(ui)
      click(ui, '[data-action="voice-style"]')
      expect([...ui.querySelectorAll('.voice-opt')].map((o) => o.textContent)).toEqual(['दास्तानगो', 'पीयूष मिश्रा'])
      click(ui, '.voice-opt[data-style="guest"]')
      expect(localStorage.getItem('ft:voiceStyle')).toBe('"guest"')
      expect($(ui, '.voice-credit')!.hidden).toBe(false)
      click(ui, '[data-action="listen"]')
      expect(voice.play).toHaveBeenLastCalledWith(expect.objectContaining({ voice: 'guest' }))
      ;({ ui } = boot('?lang=hi&seed=3', NOW, voice))
      await toDay1(ui)
      expect($(ui, '.voice-opt[data-style="guest"]')!.getAttribute('aria-checked')).toBe('true')
    } finally {
      Object.assign(guest, saved)
    }
  })

  it('leaves the Listen button out entirely unless the build sets VITE_VOICE=on', async () => {
    vi.stubEnv('VITE_VOICE', '')
    const { ui } = boot('?lang=en&seed=3')
    await toDay1(ui)
    expect($(ui, '[data-action="listen"]')).toBeNull()
    expect($(ui, '.listen-group')).toBeNull()
    expect($(ui, '.hud [data-action="sound"]')).not.toBeNull() // game sound is a separate control
  })

  it('loads the voice module and shows Listen with VITE_VOICE=on', async () => {
    vi.stubEnv('VITE_VOICE', 'on')
    const { ui } = boot('?lang=en&seed=3')
    await toDay1(ui)
    for (let i = 0; i < 20 && !$(ui, '[data-action="listen"]'); i++) await flush()
    expect($(ui, '[data-action="listen"]')).not.toBeNull()
  })

  it('says when the voice could not play, and plays even with game sound off', async () => {
    localStorage.setItem('ft:muted', 'true')
    const voice = fakeVoice()
    const { ui } = boot('?lang=hi&seed=3', NOW, voice)
    await toDay1(ui)
    click(ui, '[data-action="listen"]')
    expect(voice.play).toHaveBeenCalledTimes(1)
    voice.fail()
    expect($(ui, '[data-action="listen"]')!.textContent).toBe('आवाज़ नहीं आ पाई')
  })
})

describe('the 2D desk mirrors the stage', () => {
  it('titles the day, draws the same sheet, stamps it and flashes on its own canvas', async () => {
    m.createStage.mockImplementation(() => null)
    const { ui } = boot('?lang=en&seed=3')
    await toDay1(ui)
    const f = m.fallback
    expect(f.dayTitle).toHaveBeenCalledWith({ big: 'Day 1', small: 'Sunday, 17 May 1857' })
    expect(f.showMessage).toHaveBeenCalledTimes(1)
    expect(f.showMessage.mock.calls[0]![0].body).toBe($(ui, '.day__message .msg__body')!.textContent)
    expect(m.audio.cue).toHaveBeenCalledWith('arrive') // the flat desk has no beats of its own
    const msg = queueFor('delhi-1857', 'easy', 3)[0]!
    click(ui, `[data-stamp="${wrong(msg)}"]`)
    await flush()
    expect(f.stamp).toHaveBeenCalledWith(wrong(msg))
    expect(f.flash).toHaveBeenCalledWith('wrong')
    expect(m.audio.cue).toHaveBeenCalledWith(wrong(msg) === 'asli' ? 'stampAsli' : 'stampTota')
    // the caught sequence plays on the flat desk too, its beats voiced through the app's onCue
    expect(f.caught).toHaveBeenCalledTimes(1)
    const onCue = (m.mountFallback.mock.calls[0] as unknown as [HTMLElement, string, { onCue: (n: StageCueName) => void }])[2].onCue
    onCue('whistleLong')
    onCue('knockDoor')
    expect(m.audio.cue).toHaveBeenCalledWith('whistleLong')
    expect(m.audio.cue).toHaveBeenCalledWith('knockDoor')
    expect(m.audio.cue).not.toHaveBeenCalledWith('caught') // no sting at the stamp: the alarm comes after the silence
    expect($(ui, '.paper-result')).not.toBeNull()
  })
})

describe('the stage, wired', () => {
  it('turns the stage beats into sound: the arrival, paper and the stamp landing', async () => {
    const { ui } = boot('?lang=en&seed=3')
    await toDay1(ui)
    const onCue = (m.createStage.mock.calls[0]![1] as { onCue: (n: StageCueName) => void }).onCue
    expect(m.audio.cue).not.toHaveBeenCalledWith('arrive') // the stage times it
    onCue('arrive')
    onCue('unfold')
    onCue('key')
    expect(m.audio.cue).toHaveBeenCalledWith('arrive')
    expect(m.audio.cue).toHaveBeenCalledWith('paperUnfold')
    expect(m.audio.cue).toHaveBeenCalledWith('typeKey')
    const stamping = deferred()
    m.stage.stamp.mockImplementation(() => stamping.promise)
    const msg = queueFor('delhi-1857', 'easy', 3)[0]!
    click(ui, `[data-stamp="${right(msg)}"]`)
    const thunkCue = right(msg) === 'asli' ? 'stampAsli' : 'stampTota'
    expect(m.audio.cue).not.toHaveBeenCalledWith(thunkCue)
    onCue('stamp') // the impact
    expect(m.audio.cue.mock.calls.filter(([c]) => c === thunkCue)).toHaveLength(1)
    expect(m.stage.flash).not.toHaveBeenCalled() // the flash comes after the stamp
    stamping.resolve()
    await flush()
    expect(m.audio.cue.mock.calls.filter(([c]) => c === thunkCue)).toHaveLength(1) // no second thunk
    expect(m.stage.flash).toHaveBeenCalledWith('right')
  })

  it('tells the stage where the overlay sits before the paper comes in', async () => {
    const { ui, stage } = boot('?lang=en&seed=3')
    const box = (top: number, bottom: number, left = 0, right = 390) =>
      ({ top, bottom, left, right, width: right - left, height: bottom - top, x: left, y: top, toJSON: () => ({}) }) as DOMRect
    const real = HTMLElement.prototype.getBoundingClientRect
    HTMLElement.prototype.getBoundingClientRect = function (this: HTMLElement) {
      if (this.classList.contains('hud')) return box(8, 96)
      if (this.classList.contains('tabs')) return box(700, 748)
      if (this.classList.contains('stamps')) return box(756, 824)
      return real.call(this)
    }
    try {
      vi.stubGlobal('innerHeight', 844)
      await toDay1(ui)
      expect(stage.style.getPropertyValue('--ft-hud-top')).toBe('102px')
      expect(stage.style.getPropertyValue('--ft-hud-bottom')).toBe('150px')
      expect(stage.style.getPropertyValue('--ft-hud-left')).toBe('0px')
    } finally {
      HTMLElement.prototype.getBoundingClientRect = real
    }
  })

  it('lets the paper show its real-document tag only after the stamp (R30b)', async () => {
    for (const r of eraById('delhi-1857').messages) if (r.real) r.document = { sources: [{ id: 's1' }] }
    try {
      const { ui } = boot('?lang=en&seed=3')
      await toDay1(ui)
      const msg = queueFor('delhi-1857', 'easy', 3)[0]!
      expect(m.stage.showMessage.mock.calls[0]![0]).toMatchObject({ documentMark: false })
      expect(m.stage.showMessage.mock.calls[0]![0].revealed).toBeUndefined()
      click(ui, `[data-stamp="${right(msg)}"]`)
      await flush()
      expect(lastReveal().documentMark).toBe(msg.real)
    } finally {
      for (const r of eraById('delhi-1857').messages) delete r.document
    }
  })
})

describe('the verdict on the paper: placing the buttons', () => {
  it('puts the source button over the line the stage reports, and Next under the paper', async () => {
    m.stage.getSourceRect.mockImplementation(() => ({ x: 30, y: 600, w: 200, h: 24 }))
    m.stage.getPaperRect.mockImplementation(() => ({ x: 20, y: 120, w: 350, h: 460 }))
    const { ui } = boot('?lang=en&seed=3')
    await toDay1(ui)
    click(ui, `[data-stamp="${right(queueFor('delhi-1857', 'easy', 3)[0]!)}"]`)
    await flush()
    const btn = $(ui, '.source-hit')!
    expect(btn.style.left).toBe('30px')
    expect(btn.style.top).toBe('588px') // centred on the line, a full 48 px tall
    expect(btn.getAttribute('aria-label')).toContain(strings.en.source)
    click(ui, '.source-hit')
    expect($(ui, '#ft-source-pop')!.hidden).toBe(false)
  })

  it('switches language on the verdict: the sheet and its back redraw in the new language', async () => {
    const { ui } = boot('?lang=en&seed=3')
    await toDay1(ui)
    click(ui, `[data-stamp="${right(queueFor('delhi-1857', 'easy', 3)[0]!)}"]`)
    await flush()
    m.stage.redrawMessage.mockClear()
    click(ui, '.hud [data-lang="hi"]')
    expect(m.stage.redrawMessage).toHaveBeenCalledWith(expect.objectContaining({ lang: 'hi' }))
    expect(lastReveal().lang).toBe('hi')
    expect(m.stage.reveal).toHaveBeenCalledTimes(2)
  })

  it('switches language during the stamp: the stamps stay asleep, then both sides of the paper land in the new language', async () => {
    const stamping = deferred()
    m.stage.stamp.mockImplementation(() => stamping.promise)
    const { ui } = boot('?lang=en&seed=3')
    await toDay1(ui)
    const msg = queueFor('delhi-1857', 'easy', 3)[0]!
    click(ui, `[data-stamp="${right(msg)}"]`)
    await flush()
    m.stage.redrawMessage.mockClear()
    click(ui, '.hud [data-lang="hi"]')
    expect($(ui, '.hud__mode')!.textContent).toBe(strings.hi.modeEasy) // the screen switches at once
    expect($(ui, '.screen--day.is-stamping')).not.toBeNull()
    expect(stampBtn(ui, 'asli').disabled && stampBtn(ui, 'tota').disabled).toBe(true)
    expect($(ui, `[data-stamp="${right(msg)}"]`)!.classList.contains('is-chosen')).toBe(true)
    expect(m.stage.redrawMessage).not.toHaveBeenCalled() // the paper waits for the stamp to land
    click(ui, `[data-stamp="${wrong(msg)}"]`) // still one stamp per day
    expect(m.stage.stamp).toHaveBeenCalledTimes(1)

    stamping.resolve()
    await flush()
    // the front first (no real-document tag before the verdict), then the back, both in Hindi
    expect(m.stage.redrawMessage).toHaveBeenCalledTimes(1)
    expect(m.stage.redrawMessage.mock.calls[0]![0]).toMatchObject({ lang: 'hi', documentMark: false })
    expect(m.stage.redrawMessage.mock.calls[0]![0].revealed).toBeUndefined()
    expect(m.stage.reveal).toHaveBeenCalledTimes(1)
    expect(lastReveal().lang).toBe('hi')
    expect($(ui, '.paper-result')).not.toBeNull()
    expect(mirror(ui)).toContain(lastReveal().back.verdictLine)
  })

  it('switches language during the reveal: once it settles the front and the back are redrawn in the new language', async () => {
    const turning = deferred()
    m.stage.reveal.mockImplementationOnce(() => turning.promise)
    const { ui } = boot('?lang=en&seed=3')
    await toDay1(ui)
    click(ui, `[data-stamp="${right(queueFor('delhi-1857', 'easy', 3)[0]!)}"]`)
    await flush()
    expect(lastReveal().lang).toBe('en')
    m.stage.redrawMessage.mockClear()
    click(ui, '.hud [data-lang="hi"]')
    expect(stampBtn(ui, 'asli').disabled && stampBtn(ui, 'tota').disabled).toBe(true)
    expect(m.stage.redrawMessage).not.toHaveBeenCalled()
    expect(m.stage.reveal).toHaveBeenCalledTimes(1) // no second reveal on top of the turning paper

    turning.resolve()
    await flush()
    expect(m.stage.redrawMessage).toHaveBeenLastCalledWith(expect.objectContaining({ lang: 'hi', revealed: true }))
    expect(m.stage.reveal).toHaveBeenCalledTimes(2)
    expect(lastReveal().lang).toBe('hi')
    expect(mirror(ui)).toContain(lastReveal().back.verdictLine)
    expect($(ui, '.screen--day.is-auto')).not.toBeNull()
  })
})
