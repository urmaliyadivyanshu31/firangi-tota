import { describe, expect, it, vi } from 'vitest'
import { countdown, renderDailyEnd } from '../../src/ui/screens/daily'
import { strings } from '../../src/i18n/strings'
import { setLang } from '../../src/i18n/lang'
import { era, mount } from './helpers'

setLang('en')

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
    expect(root.textContent).not.toContain(strings.en.caughtStamp)
    expect(root.textContent).not.toContain(strings.en.survivedStamp)
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
