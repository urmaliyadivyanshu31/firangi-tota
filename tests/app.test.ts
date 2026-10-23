import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { startApp } from '../src/app'
import { ERAS, eraById } from '../src/content/registry'
import type { EraId, Message } from '../src/content/types'
import type { Difficulty } from '../src/game/config'
import { dailyFrom } from '../src/game/daily'
import { mulberry32 } from '../src/game/rng'
import { chapterShareText, shareText } from '../src/game/share'
import { createChapter } from '../src/game/state'
import { setLang } from '../src/i18n/lang'
import { strings } from '../src/i18n/strings'

// ---------------------------------------------------------------- mocks: content, stage, audio

const m = vi.hoisted(() => {
  const fakeStage = () => ({
    setEra: vi.fn(),
    showPaper: vi.fn(),
    stamp: vi.fn((_k: string) => Promise.resolve()),
    caught: vi.fn(() => Promise.resolve()),
    setPaused: vi.fn(),
    dispose: vi.fn(),
  })
  return {
    fakeStage,
    stage: fakeStage(),
    createStage: vi.fn(),
    loadStage: vi.fn(),
    fallback: { setEra: vi.fn(), dispose: vi.fn() },
    mountFallback: vi.fn(),
    audio: { unlock: vi.fn(), setMuted: vi.fn(), cue: vi.fn(), ambience: vi.fn() },
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
vi.mock('../src/audio/engine', () => ({ audio: m.audio }))

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

async function flush(): Promise<void> {
  for (let i = 0; i < 6; i++) await new Promise((r) => setTimeout(r, 0))
}

function boot(search = '', now = NOW): { ui: HTMLElement; stage: HTMLElement } {
  document.body.innerHTML = '<div id="stage"></div><div id="ui"></div>'
  const stage = document.getElementById('stage')!
  const ui = document.getElementById('ui')!
  startApp({ stage, ui }, { now: () => now, random: mulberry32(99), url: new URL(`https://firangitota.com/${search}`) })
  return { ui, stage }
}

const $ = (ui: HTMLElement, sel: string) => ui.querySelector<HTMLElement>(sel)
function click(ui: HTMLElement, sel: string): void {
  const el = $(ui, sel)
  if (!el) throw new Error(`nothing matches ${sel} on ${ui.querySelector('.screen')?.className}`)
  el.click()
}
const text = (ui: HTMLElement) => ui.textContent ?? ''
const right = (msg: Message) => (msg.real ? 'asli' : 'tota')
const wrong = (msg: Message) => (msg.real ? 'tota' : 'asli')

function queueFor(id: EraId, d: Difficulty, seed: number): Message[] {
  return createChapter(eraById(id), d, mulberry32(seed)).queue
}

/** Home → chapter card → difficulty → both intro pages → day 1. */
async function toDay1(ui: HTMLElement, id: EraId = 'delhi-1857', d: Difficulty = 'easy'): Promise<void> {
  click(ui, `[data-era="${id}"]`)
  click(ui, `[data-mode="${d}"]`)
  click(ui, '[data-action="next"]')
  click(ui, '[data-action="next"]')
  await flush()
}

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
  document.querySelectorAll('.toast').forEach((t) => t.remove())
})

// ---------------------------------------------------------------- tests

describe('first visit and language', () => {
  it('shows the language screen; choosing हिंदी persists lang and shows home in Hindi', () => {
    const { ui } = boot()
    expect($(ui, '.screen--lang')).not.toBeNull()
    click(ui, '[data-lang="hi"]')
    expect(localStorage.getItem('ft:lang')).toBe('"hi"')
    expect($(ui, '.screen--home')).not.toBeNull()
    expect($(ui, '.home__title')!.textContent).toBe(strings.hi.appName)
    expect(document.documentElement.lang).toBe('hi')
  })

  it('goes straight home once a language is saved, and ?lang= overrides it', () => {
    setLang('hi') // a language picked on an earlier visit
    let { ui } = boot()
    expect($(ui, '.home__title')!.textContent).toBe(strings.hi.appName)
    ;({ ui } = boot('?lang=en'))
    expect($(ui, '.home__title')!.textContent).toBe(strings.en.appName)
  })

  it('switches language from home at any time', () => {
    const { ui } = boot('?lang=en')
    click(ui, '[data-action="lang"]')
    expect($(ui, '.home__title')!.textContent).toBe(strings.hi.appName)
  })
})

describe('a chapter', () => {
  it('1857 → Easy → intro → day 1 → a right stamp shows the reveal with its source, then day 2', async () => {
    const { ui } = boot('?lang=en&seed=3')
    await toDay1(ui)
    expect(text(ui)).toContain('Day 1 of 7')
    const q = queueFor('delhi-1857', 'easy', 3)
    const msg = q[0]!
    expect(text(ui)).toContain(msg.text.en.split(' dated')[0]!)
    click(ui, `[data-stamp="${right(msg)}"]`)
    await flush()

    const reveal = $(ui, '.reveal--right')!
    expect(reveal).not.toBeNull()
    expect(reveal.textContent).toContain(strings.en.right)
    if (msg.real) {
      expect(reveal.textContent).toContain(msg.why!.text.en)
      expect(reveal.textContent).toContain(`A. Author, First Book (1900), ${msg.why!.sources[0]!.loc}`)
    } else {
      expect(reveal.textContent).toContain(msg.tells![0]!.explain.en)
      expect(reveal.textContent).toContain(`B. Author, Second Book (1950), ${msg.tells![0]!.sources![0]!.loc}`)
    }
    // the stage stamped the paper before the reveal, and holds still while it shows
    expect(m.stage.setEra).toHaveBeenCalledWith(expect.objectContaining({ id: 'delhi-1857' }))
    expect(m.stage.stamp).toHaveBeenCalledWith(right(msg))
    expect(m.stage.caught).not.toHaveBeenCalled()
    expect(m.stage.setPaused).toHaveBeenLastCalledWith(true)
    expect(m.audio.ambience).toHaveBeenCalledWith('delhi-1857')
    expect(m.audio.cue).toHaveBeenCalledWith('arrive')
    expect(m.audio.cue).toHaveBeenCalledWith(msg.real ? 'stampAsli' : 'stampTota')
    expect(m.audio.cue).toHaveBeenCalledWith('correct')

    click(ui, '[data-action="next"]')
    await flush()
    expect(text(ui)).toContain('Day 2 of 7')
    expect($(ui, '[data-stamp="asli"]')).not.toBeNull()
    expect(m.stage.showPaper).toHaveBeenCalledTimes(2)
    // the readable paper covers the desk's own sheet, so the camera keeps the desk shot
    for (const call of m.stage.showPaper.mock.calls) expect(call).toEqual([{ lean: false }])
    expect(m.stage.setPaused).toHaveBeenLastCalledWith(false)
  })

  it('a wrong stamp darkens the stage, says Wrong, then shows the caught end screen with the receipts', async () => {
    const { ui } = boot('?lang=en&seed=5')
    await toDay1(ui)
    const msg = queueFor('delhi-1857', 'easy', 5)[0]!
    click(ui, `[data-stamp="${wrong(msg)}"]`)
    await flush()
    expect($(ui, '.reveal--wrong')!.textContent).toContain(strings.en.wrong)
    expect(m.stage.caught).toHaveBeenCalledTimes(1)
    expect(m.audio.cue).toHaveBeenCalledWith('caught')

    click(ui, '[data-action="next"]')
    await flush()
    expect($(ui, '.screen--end')).not.toBeNull()
    expect(text(ui)).toContain(strings.en.caughtTitle)
    expect(text(ui)).toContain('You were sent to Kala Pani.')
    expect(ui.querySelectorAll('.receipt')).toHaveLength(2)
    expect(text(ui)).toContain('I kept my title.')
    expect(text(ui)).toContain('A. Author, First Book (1900), p. 20')
  })

  it('the agarbatti burning out is a timeout: "Too slow", caught, with ticks in the last 30%', async () => {
    const { ui } = boot('?lang=en&seed=3')
    await toDay1(ui)
    seconds(60)
    expect($(ui, '.reveal')).toBeNull()
    expect(m.audio.cue).not.toHaveBeenCalledWith('tick')
    expect($(ui, '.agarbatti')!.style.getPropertyValue('--burn')).toBe(String(31 / 90)) // the first frame only starts the clock
    seconds(35)
    await flush()
    expect($(ui, '.reveal--wrong')!.querySelector('.reveal__word')!.textContent).toBe(strings.en.tooSlow)
    const ticks = m.audio.cue.mock.calls.filter(([c]) => c === 'tick').length
    expect(ticks).toBeGreaterThanOrEqual(25)
    expect(ticks).toBeLessThanOrEqual(27)
    expect(m.stage.stamp).not.toHaveBeenCalled() // nobody stamped
    expect(m.stage.caught).toHaveBeenCalledTimes(1)
    click(ui, '[data-action="next"]')
    await flush()
    expect(text(ui)).toContain(strings.en.caughtTitle)
  })

  it('pauses the agarbatti while the tab is hidden and while the reveal shows', async () => {
    const { ui } = boot('?lang=en&seed=3')
    await toDay1(ui)
    seconds(10)
    setHidden(true)
    seconds(200)
    expect($(ui, '.reveal')).toBeNull()
    setHidden(false)
    seconds(60)
    expect($(ui, '.reveal')).toBeNull()
    const msg = queueFor('delhi-1857', 'easy', 3)[0]!
    click(ui, `[data-stamp="${right(msg)}"]`)
    await flush()
    seconds(200)
    expect($(ui, '.reveal--right')).not.toBeNull() // still the reveal: no timeout behind it
  })

  it('surviving every day records the best run, plays the survived cue and offers a share line', async () => {
    const share = vi.fn(() => Promise.resolve())
    nav.share = share
    const { ui } = boot('?lang=en&seed=8')
    await toDay1(ui)
    const q = queueFor('delhi-1857', 'easy', 8)
    for (let day = 1; day <= 7; day++) {
      expect(text(ui)).toContain(`Day ${day} of 7`)
      click(ui, `[data-stamp="${right(q[day - 1]!)}"]`)
      await flush()
      click(ui, '[data-action="next"]')
      await flush()
    }
    expect(text(ui)).toContain(strings.en.survivedTitle)
    expect(m.audio.cue).toHaveBeenCalledWith('survived')
    expect(localStorage.getItem('ft:best:delhi-1857:easy')).toBe('7')
    click(ui, '[data-action="share"]')
    await flush()
    expect(share).toHaveBeenCalledWith({ text: chapterShareText({ eraTitle: 'Title 1857', mode: 'Easy', survived: 7, days: 7 }) })
    expect(chapterShareText({ eraTitle: 'Delhi 1857', mode: 'Hard', survived: 14, days: 14 })).toBe('Firangi Tota · Delhi 1857 · Hard · survived 14/14\nfirangitota.com')

    click(ui, '[data-action="home"]')
    expect($(ui, '[data-era="delhi-1857"]')!.textContent).toContain('Survived Easy')
    expect(m.audio.ambience).toHaveBeenLastCalledWith(null)
  })

  it('Play again restarts the same chapter and difficulty at day 1', async () => {
    const { ui } = boot('?lang=en&seed=5')
    await toDay1(ui, 'delhi-1857', 'medium')
    click(ui, `[data-stamp="${wrong(queueFor('delhi-1857', 'medium', 5)[0]!)}"]`)
    await flush()
    click(ui, '[data-action="next"]')
    await flush()
    click(ui, '[data-action="again"]')
    await flush()
    expect(text(ui)).toContain('Day 1 of 10')
  })

  it('the home button leaves a chapter and stops its agarbatti', async () => {
    const { ui } = boot('?lang=en&seed=3')
    await toDay1(ui)
    click(ui, '[data-action="quit"]')
    expect($(ui, '.screen--home')).not.toBeNull()
    seconds(120)
    expect($(ui, '.screen--home')).not.toBeNull()
    expect(m.stage.stamp).not.toHaveBeenCalled()
  })
})

describe('the daily puzzle', () => {
  it('plays 5 messages without pencil marks and with every rule, then shows a share grid that matches shareText', async () => {
    const share = vi.fn(() => Promise.resolve())
    nav.share = share
    const { ui } = boot('?lang=en')
    click(ui, '[data-action="daily"]')
    await flush()
    const d = dailyFrom(NOW, ERAS)
    const era = eraById(d.era)
    expect(text(ui)).toContain('Day 1 of 5')
    expect(ui.querySelector('.pencil')).toBeNull()
    expect(ui.querySelectorAll('.rule')).toHaveLength(era.rules.length)
    expect(m.audio.ambience).toHaveBeenCalledWith(d.era)

    // Always stamp ASLI: the forged ones are misses, and the puzzle carries on after them.
    for (let i = 0; i < 5; i++) {
      expect(text(ui)).toContain(`Day ${i + 1} of 5`)
      click(ui, '[data-stamp="asli"]')
      await flush()
      expect($(ui, '.reveal')).not.toBeNull()
      click(ui, '[data-action="next"]')
      await flush()
    }
    const results = d.messages.map((x) => x.real)
    expect(results).toContain(false)
    const expected = shareText({ daily: d.number, eraTitle: era.title.en, results })
    expect($(ui, '.share__text')!.textContent).toBe(expected)
    expect(JSON.parse(localStorage.getItem(`ft:daily:${d.isoDate}`)!).results).toEqual(results)
    click(ui, '[data-action="share"]')
    await flush()
    expect(share).toHaveBeenCalledWith({ text: expected })
  })

  it('replaying the same IST date shows the stored result, not a new run', async () => {
    let { ui } = boot('?lang=en')
    click(ui, '[data-action="daily"]')
    await flush()
    for (let i = 0; i < 5; i++) {
      click(ui, '[data-stamp="tota"]')
      await flush()
      click(ui, '[data-action="next"]')
      await flush()
    }
    const first = $(ui, '.share__text')!.textContent

    ;({ ui } = boot('?lang=en', NOW + 3 * 3600_000)) // later the same IST day
    expect($(ui, '[data-action="daily"]')!.textContent).toContain(strings.en.dailyDone)
    click(ui, '[data-action="daily"]')
    await flush()
    expect($(ui, '[data-stamp]')).toBeNull()
    expect($(ui, '.share__text')!.textContent).toBe(first)

    ;({ ui } = boot('?lang=en', NOW + 24 * 3600_000)) // the next day is a new puzzle
    expect($(ui, '[data-action="daily"]')!.textContent).not.toContain(strings.en.dailyDone)
  })

  it('stores each answer at once, so leaving mid-puzzle resumes instead of restarting', async () => {
    let { ui } = boot('?lang=en')
    click(ui, '[data-action="daily"]')
    await flush()
    click(ui, '[data-stamp="asli"]')
    await flush()
    click(ui, '[data-action="next"]')
    await flush()
    click(ui, '[data-action="quit"]')
    ;({ ui } = boot('?lang=en'))
    click(ui, '[data-action="daily"]')
    await flush()
    expect(text(ui)).toContain('Day 2 of 5')
  })
})

describe('home', () => {
  it('Continue points to the first era, in order, without a survived run', () => {
    localStorage.setItem('ft:best:delhi-1857:easy', '7') // survived
    localStorage.setItem('ft:best:lahore-1929:hard', '9') // not survived: 9 of 14
    let { ui } = boot('?lang=en')
    expect($(ui, '[data-action="continue"]')!.textContent).toContain('Place 1929 1929')
    click(ui, '[data-action="continue"]')
    expect($(ui, '.screen--setup')!.textContent).toContain('Title 1929')

    for (const id of ['lahore-1929', 'bombay-1942', 'delhi-1947']) localStorage.setItem(`ft:best:${id}:medium`, '10')
    ;({ ui } = boot('?lang=en'))
    click(ui, '[data-action="continue"]')
    expect($(ui, '.screen--setup')!.textContent).toContain('Title 1857') // all done: back to the first
  })

  it('remembers mute across visits; sound is on by default', () => {
    let { ui } = boot('?lang=en')
    expect(m.audio.setMuted).toHaveBeenLastCalledWith(false)
    click(ui, '[data-action="sound"]')
    expect(localStorage.getItem('ft:muted')).toBe('true')
    expect(m.audio.setMuted).toHaveBeenLastCalledWith(true)
    ;({ ui } = boot('?lang=en'))
    expect(m.audio.setMuted).toHaveBeenLastCalledWith(true)
    expect($(ui, '[data-action="sound"]')!.getAttribute('aria-pressed')).toBe('false')
  })

  it('unlocks audio on the first tap anywhere, and plays no ambience at home', () => {
    boot('?lang=en')
    expect(m.audio.unlock).not.toHaveBeenCalled()
    expect(m.audio.ambience).toHaveBeenLastCalledWith(null)
    document.body.dispatchEvent(new Event('pointerup', { bubbles: true }))
    expect(m.audio.unlock).toHaveBeenCalled()
  })

  it('opens the credits from home and comes back', () => {
    const { ui } = boot('?lang=en')
    click(ui, '[data-action="credits"]')
    expect(text(ui)).toContain('Inspired by Politburo or Parrot by atomiquest')
    click(ui, '[data-action="back"]')
    expect($(ui, '.screen--home')).not.toBeNull()
  })
})

describe('sharing without navigator.share', () => {
  it('copies to the clipboard, says Copied, and adds a WhatsApp link on mobile', async () => {
    const writeText = vi.fn(() => Promise.resolve())
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    Object.defineProperty(navigator, 'userAgent', { configurable: true, value: 'Mozilla/5.0 (Linux; Android 10; K) Mobile Safari/537.36' })
    const { ui } = boot('?lang=en&seed=5')
    await toDay1(ui)
    click(ui, `[data-stamp="${wrong(queueFor('delhi-1857', 'easy', 5)[0]!)}"]`)
    await flush()
    click(ui, '[data-action="next"]')
    await flush()
    click(ui, '[data-action="share"]')
    await flush()
    const line = chapterShareText({ eraTitle: 'Title 1857', mode: 'Easy', survived: 0, days: 7 })
    expect(writeText).toHaveBeenCalledWith(line)
    const toast = document.querySelector<HTMLElement>('.toast')!
    expect(toast.textContent).toContain(strings.en.copied)
    expect(toast.querySelector('a')!.getAttribute('href')).toBe(`whatsapp://send?text=${encodeURIComponent(line)}`)
    click(ui, '[data-action="home"]')
    expect(document.querySelector('.toast')).toBeNull() // a toast belongs to its screen
  })

  it('leaves out the WhatsApp link on desktop', async () => {
    const writeText = vi.fn(() => Promise.resolve())
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    Object.defineProperty(navigator, 'userAgent', { configurable: true, value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' })
    const { ui } = boot('?lang=en&seed=5')
    await toDay1(ui)
    click(ui, `[data-stamp="${wrong(queueFor('delhi-1857', 'easy', 5)[0]!)}"]`)
    await flush()
    click(ui, '[data-action="next"]')
    await flush()
    click(ui, '[data-action="share"]')
    await flush()
    const toast = document.querySelector<HTMLElement>('.toast')!
    expect(toast.textContent).toContain(strings.en.copied)
    expect(toast.querySelector('a')).toBeNull()
  })
})

describe('the 3D stage (Ruling R10)', () => {
  it('paints home without three.js, then loads the stage after the first paint when idle', async () => {
    const { ui, stage } = boot('?lang=en&tier=low')
    expect($(ui, '.screen--home')).not.toBeNull()
    expect(m.loadStage).not.toHaveBeenCalled()
    frame()
    await flush()
    expect(m.loadStage).toHaveBeenCalledTimes(1)
    expect(m.createStage).toHaveBeenCalledWith(stage, expect.objectContaining({ forceTier: 'low', reducedMotion: false }))
    expect(m.stage.setEra).toHaveBeenCalledTimes(1) // home shows a desk too
  })

  it('loads the stage at once on the first chapter tap', async () => {
    const { ui } = boot('?lang=en')
    click(ui, '[data-era="bombay-1942"]')
    expect(m.loadStage).toHaveBeenCalledTimes(1)
    await flush()
    expect(m.stage.setEra).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'bombay-1942' }))
  })

  it('uses the 2D fallback when there is no WebGL2, and the game still plays', async () => {
    m.createStage.mockImplementation(() => null)
    const { ui, stage } = boot('?lang=en&seed=3')
    await toDay1(ui)
    expect(m.mountFallback).toHaveBeenCalledWith(stage, 'delhi-1857')
    const msg = queueFor('delhi-1857', 'easy', 3)[0]!
    click(ui, `[data-stamp="${right(msg)}"]`)
    await flush()
    expect($(ui, '.reveal--right')).not.toBeNull()
  })

  it('falls back when the stage chunk fails to load', async () => {
    m.loadStage.mockImplementation(() => Promise.reject(new Error('offline')))
    const { ui, stage } = boot('?lang=en')
    click(ui, '[data-era="lahore-1929"]')
    await flush()
    expect(m.mountFallback).toHaveBeenCalledWith(stage, 'lahore-1929')
  })

  it('swaps in the fallback when the WebGL context is lost, keeping the current day', async () => {
    const { ui, stage } = boot('?lang=en&seed=3')
    await toDay1(ui)
    const q = queueFor('delhi-1857', 'easy', 3)
    click(ui, `[data-stamp="${right(q[0]!)}"]`)
    await flush()
    click(ui, '[data-action="next"]')
    await flush()
    expect(text(ui)).toContain('Day 2 of 7')

    const lost = new CustomEvent('ft:stage-lost', { cancelable: true, detail: { era: 'delhi-1857', reason: 'context-lost' } })
    stage.dispatchEvent(lost)
    expect(lost.defaultPrevented).toBe(true)
    expect(m.stage.dispose).toHaveBeenCalledTimes(1)
    expect(m.mountFallback).toHaveBeenCalledWith(stage, 'delhi-1857')
    expect(text(ui)).toContain('Day 2 of 7')

    m.stage.stamp.mockClear()
    click(ui, `[data-stamp="${right(q[1]!)}"]`)
    await flush()
    expect($(ui, '.reveal--right')).not.toBeNull()
    expect(m.stage.stamp).not.toHaveBeenCalled() // the dead stage is no longer used
  })

  it('never hangs on a stamp animation that does not finish', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    try {
      m.stage.stamp.mockImplementation(() => new Promise<void>(() => undefined))
      const { ui } = boot('?lang=en&seed=3')
      click(ui, '[data-era="delhi-1857"]')
      click(ui, '[data-mode="easy"]')
      click(ui, '[data-action="next"]')
      click(ui, '[data-action="next"]')
      await vi.advanceTimersByTimeAsync(10)
      const verdict = right(queueFor('delhi-1857', 'easy', 3)[0]!)
      click(ui, `[data-stamp="${verdict}"]`)
      // while the stamp comes down the paper steps aside and the stamps stop taking taps
      expect($(ui, '.screen--day.is-stamping')).not.toBeNull()
      expect($(ui, `[data-stamp="${verdict}"]`)!.classList.contains('is-chosen')).toBe(true)
      click(ui, `[data-stamp="${verdict === 'asli' ? 'tota' : 'asli'}"]`) // ignored: one stamp per day
      expect(m.stage.stamp).toHaveBeenCalledTimes(1)
      await vi.advanceTimersByTimeAsync(5000)
      expect($(ui, '.reveal--right')).not.toBeNull()
    } finally {
      vi.useRealTimers()
    }
  })
})
