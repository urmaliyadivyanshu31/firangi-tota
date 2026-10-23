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

describe('renderEnd', () => {
  it("shows every receipt's quote and source", () => {
    const e = era()
    const receipts = withReceipts(e)
    const root = mount()
    renderEnd(root, { era: e, state: chapter(e, { phase: 'survived', day: 7 }), outcome: 'survived', receipts, epilogue: e.epilogue }, handlers())
    const text = root.textContent!
    expect(text).toContain('I read every seal twice.')
    expect(text).toContain('A. Author, First Book (1900), p. 20')
    expect(text).toContain('I kept my title.')
    expect(text).toContain('B. Author, Second Book (1950), p. 7')
    expect(text).toContain('He said he served the city.')
    expect(root.querySelectorAll('.receipt')).toHaveLength(2)
  })

  it('keeps the card short: at most three lines of what happened next and two clippings', () => {
    const e = era()
    withReceipts(e)
    e.receipts.push({ ...e.receipts[0]!, id: 'rc3', quote: { en: 'A third quote.', hi: 'तीसरी बात।' } })
    e.epilogue.survived = [1, 2, 3, 4].map((n) => ({ en: `Line ${n}.`, hi: `पंक्ति ${n}।` }))
    const root = mount()
    renderEnd(root, { era: e, state: chapter(e, { phase: 'survived', day: 7 }), outcome: 'survived', receipts: e.receipts, epilogue: e.epilogue }, handlers())
    expect(root.querySelectorAll('.end__epilogue > p')).toHaveLength(3)
    expect(root.textContent).not.toContain('Line 4.')
    expect(root.querySelectorAll('.receipt')).toHaveLength(2)
    expect(root.textContent).not.toContain('A third quote.')
    expect(root.querySelector('.last')).toBeNull() // the last message was already shown on its result card
  })

  it('shows the epilogue for the outcome with its sources', () => {
    const e = era()
    const root = mount()
    renderEnd(root, { era: e, state: chapter(e, { phase: 'caught', day: 2, lastCorrect: false }), outcome: 'caught', receipts: e.receipts, epilogue: e.epilogue }, handlers())
    expect(root.textContent).toContain('The forgery was found.')
    expect(root.textContent).not.toContain('The city endured.')
    expect(root.textContent).toContain('A. Author, First Book (1900), p. 30')
    expect(root.textContent).toContain(strings.en.caughtTitle)
  })

  it('speaks the current language', () => {
    setLang('hi')
    const e = era()
    const root = mount()
    renderEnd(root, { era: e, state: chapter(e, { phase: 'survived', day: 7 }), outcome: 'survived', receipts: e.receipts, epilogue: e.epilogue }, handlers())
    expect(root.textContent).toContain('मैंने हर मुहर दो बार देखी।')
    expect(root.textContent).toContain(strings.hi.survivedTitle)
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
