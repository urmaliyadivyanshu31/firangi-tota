import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderEnd } from '../../src/ui/screens/end'
import { countdown, renderDailyEnd } from '../../src/ui/screens/daily'
import { setLang } from '../../src/i18n/lang'
import { strings } from '../../src/i18n/strings'
import type { Era, Receipt } from '../../src/content/types'
import { chapter, era, mount } from './helpers'

const handlers = () => ({ again: vi.fn(), home: vi.fn(), share: vi.fn() })

function withReceipts(e: Era): Receipt[] {
  e.receipts.push({
    id: 'rc2',
    who: { en: 'A Rai Bahadur', hi: 'एक राय बहादुर' },
    quote: { en: 'I kept my title.', hi: 'मैंने अपना ख़िताब रखा।' },
    joke: { en: 'He kept it well.', hi: 'ख़ूब संभाला।' },
    theirSide: { en: 'He said he served the city.', hi: 'उन्होंने कहा कि वे शहर की सेवा कर रहे थे।' },
    source: { id: 's2', loc: 'p. 7' },
  })
  return e.receipts
}

beforeEach(() => setLang('en'))

describe('renderEnd: the telegram', () => {
  it('says plainly what happened: a forgery stamped ASLI', () => {
    const e = era()
    const root = mount()
    // day 2 is the forged m2, stamped asli
    renderEnd(root, { era: e, state: chapter(e, { phase: 'caught', day: 2, lastCorrect: false, lastVerdict: 'asli' }), outcome: 'caught', receipts: e.receipts, epilogue: e.epilogue }, handlers())
    expect(root.querySelector('.wire__verdict')!.textContent).toBe(strings.en.verdictPassed)
    expect(root.querySelector('.wire__tell')!.textContent).toBe('The court sat in Delhi, not Lahore.')
    expect([...root.querySelectorAll('.wire__after')].map((p) => p.textContent)).toEqual(['The forgery was found.'])
  })

  it('says plainly what happened: a genuine message stamped TOTA, and a timeout', () => {
    const e = era()
    const root = mount()
    renderEnd(root, { era: e, state: chapter(e, { phase: 'caught', day: 1, lastCorrect: false, lastVerdict: 'tota' }), outcome: 'caught', receipts: e.receipts, epilogue: e.epilogue }, handlers())
    expect(root.querySelector('.wire__verdict')!.textContent).toBe(strings.en.verdictRejected)
    expect(root.querySelector('.wire__tell')!.textContent).toBe('The gate rota is recorded.')
    renderEnd(root, { era: e, state: chapter(e, { phase: 'caught', day: 1, lastCorrect: false, lastVerdict: 'timeout' }), outcome: 'caught', receipts: e.receipts, epilogue: e.epilogue }, handlers())
    expect(root.querySelector('.wire__verdict')!.textContent).toBe(strings.en.tooSlow)
  })

  it('stamps it with the era’s own ending, styled for the era', () => {
    const e = era()
    const root = mount()
    renderEnd(root, { era: e, state: chapter(e, { phase: 'caught', day: 2, lastCorrect: false, lastVerdict: 'asli' }), outcome: 'caught', receipts: e.receipts, epilogue: e.epilogue }, handlers())
    const stamp = root.querySelector<HTMLElement>('.end-stamp')!
    expect(stamp.textContent).toBe('Caught')
    expect(stamp.classList.contains('end-stamp--petition')).toBe(true)
    expect(root.querySelector('.wire__heading')!.textContent).toBe('The forger got through')
    setLang('hi')
    renderEnd(root, { era: e, state: chapter(e, { phase: 'survived', day: 7 }), outcome: 'survived', receipts: e.receipts, epilogue: e.epilogue }, handlers())
    expect(root.querySelector('.end-stamp')!.textContent).toBe('पास')
    expect(root.querySelector('.end-stamp')!.classList.contains('end-stamp--survived')).toBe(true)
    expect(root.querySelector('.wire__verdict')).toBeNull()
  })

  it('falls back to a plain stamp when the era has no endings', () => {
    const e = era()
    Reflect.deleteProperty(e, 'endings')
    const root = mount()
    renderEnd(root, { era: e, state: chapter(e, { phase: 'caught', day: 2, lastCorrect: false, lastVerdict: 'asli' }), outcome: 'caught', receipts: e.receipts, epilogue: e.epilogue }, handlers())
    expect(root.querySelector('.end-stamp--plain')!.textContent).toBe(strings.en.caughtStamp)
    expect(root.querySelector('.wire__heading')!.textContent).toBe(strings.en.caughtTitle)
  })

  it('keeps sources and at most two receipts behind small taps', () => {
    const e = era()
    withReceipts(e)
    e.receipts.push({ ...e.receipts[0]!, id: 'rc3', quote: { en: 'A third quote.', hi: 'तीसरी बात।' } })
    const root = mount()
    renderEnd(root, { era: e, state: chapter(e, { phase: 'survived', day: 7 }), outcome: 'survived', receipts: e.receipts, epilogue: e.epilogue }, handlers())
    const folds = [...root.querySelectorAll<HTMLDetailsElement>('details.fold')]
    expect(folds.map((f) => f.querySelector('summary')!.textContent)).toEqual([strings.en.source, strings.en.receipts])
    expect(folds.every((f) => !f.open)).toBe(true)
    expect(root.querySelectorAll('.receipt')).toHaveLength(2)
    expect(root.textContent).toContain('A. Author, First Book (1900), p. 30')
    expect(root.textContent).not.toContain('A third quote.')
  })

  it('wires again, home and share', () => {
    const e = era()
    const root = mount()
    const on = handlers()
    renderEnd(root, { era: e, state: chapter(e, { phase: 'survived', day: 7 }), outcome: 'survived', receipts: e.receipts, epilogue: e.epilogue }, on)
    for (const a of ['again', 'home', 'share']) root.querySelector<HTMLElement>(`[data-action="${a}"]`)!.click()
    expect(on.again).toHaveBeenCalledTimes(1)
    expect(on.home).toHaveBeenCalledTimes(1)
    expect(on.share).toHaveBeenCalledTimes(1)
  })
})

describe('renderDailyEnd', () => {
  const NOW = Date.parse('2026-10-25T06:00:00Z')
  const dailyOn = () => ({ share: vi.fn(), chapter: vi.fn(), home: vi.fn() })

  it('shows the daily score, the share grid, come back tomorrow and the countdown, not the chapter copy', () => {
    const e = era()
    const root = mount()
    const on = dailyOn()
    renderDailyEnd(root, { era: e, number: 2, results: [true, true, false, true, true], nextAt: NOW + (7 * 3600 + 12 * 60 + 33) * 1000, now: () => NOW }, on)
    expect(root.querySelector('.daily-end__title')!.textContent).toBe('Aaj ka Taar #2 · 4/5')
    const grid = root.querySelector<HTMLElement>('.share-grid')!
    expect(grid.dataset.results).toBe('11011')
    expect(grid.querySelectorAll('svg.tile--right')).toHaveLength(4)
    expect(grid.querySelectorAll('svg.tile--wrong')).toHaveLength(1)
    expect(grid.getAttribute('aria-label')).toBe('4 of 5 right')
    expect(root.textContent).toContain(strings.en.dailyTomorrow)
    expect(root.querySelector('.daily-end__clock')!.textContent).toBe('07:12:33')
    expect(root.textContent).not.toContain(strings.en.caughtTitle)
    expect(root.textContent).not.toContain(strings.en.survivedTitle)
    for (const a of ['share', 'again', 'home']) root.querySelector<HTMLElement>(`[data-action="${a}"]`)!.click()
    expect(on.share).toHaveBeenCalledTimes(1)
    expect(on.chapter).toHaveBeenCalledTimes(1)
    expect(on.home).toHaveBeenCalledTimes(1)
    expect(root.querySelector('[data-action="again"]')!.textContent).toBe(strings.en.dailyChapter)
  })

  it('counts down every second', () => {
    vi.useFakeTimers()
    try {
      let now = NOW
      const root = mount()
      renderDailyEnd(root, { era: era(), number: 2, results: [true, false, true, true, true], nextAt: NOW + 65_000, now: () => now }, dailyOn())
      expect(root.querySelector('.daily-end__clock')!.textContent).toBe('00:01:05')
      now += 2000
      vi.advanceTimersByTime(2000)
      expect(root.querySelector('.daily-end__clock')!.textContent).toBe('00:01:03')
    } finally {
      vi.useRealTimers()
    }
  })

  it('writes the countdown as hh:mm:ss and never goes below zero', () => {
    expect(countdown(0)).toBe('00:00:00')
    expect(countdown(-5000)).toBe('00:00:00')
    expect(countdown((23 * 3600 + 59 * 60 + 59) * 1000 + 999)).toBe('23:59:59')
  })
})
