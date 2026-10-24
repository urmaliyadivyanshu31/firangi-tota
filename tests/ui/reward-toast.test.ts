import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { REWARD_ITEMS, toastLine, type Drop } from '../../src/game/rewards'
import { GAP_MS, HOLD_MS, HOLD_QUEUED_MS, MAX_WAITING, OUT_MS, OUT_REDUCED_MS, createRewardToast, type ToastItem } from '../../src/ui/reward-toast'

const item = (text: string, over: Partial<ToastItem> = {}): ToastItem => ({ item: 'paisa-1857', jackpot: false, kicker: null, text, lang: 'en', ...over })

beforeEach(() => {
  document.body.innerHTML = ''
  vi.useFakeTimers()
})
afterEach(() => vi.useRealTimers())

const make = (over: Partial<Parameters<typeof createRewardToast>[0]> = {}) =>
  createRewardToast({ parent: document.body, reduced: false, top: () => 80, ...over })
const shown = () => [...document.querySelectorAll<HTMLElement>('.rtoast')]
const texts = () => shown().map((e) => e.textContent)

describe('the reward toast', () => {
  it('sits in a polite live region and shows the line, then slides away after about 2.5 s', () => {
    const t = make()
    expect(t.el.getAttribute('aria-live')).toBe('polite')
    t.push(item('You got a silver rupee'))
    vi.advanceTimersByTime(0)
    expect(shown()).toHaveLength(1)
    const el = shown()[0]!
    expect(el.textContent).toBe('You got a silver rupee')
    expect(el.classList.contains('is-in')).toBe(true)
    expect(t.el.style.top).toBe('80px')
    vi.advanceTimersByTime(HOLD_MS - 1)
    expect(el.classList.contains('is-in')).toBe(true)
    vi.advanceTimersByTime(1)
    expect(el.classList.contains('is-out')).toBe(true)
    vi.advanceTimersByTime(OUT_MS)
    expect(shown()).toHaveLength(0)
  })

  it('waits its delay before the first chit', () => {
    const t = make()
    t.push(item('a'), 700)
    vi.advanceTimersByTime(699)
    expect(shown()).toHaveLength(0)
    vi.advanceTimersByTime(1)
    expect(shown()).toHaveLength(1)
    expect(t.busy()).toBe(true)
  })

  it('queues chits one after another and never overlaps them', () => {
    const t = make()
    t.push(item('first'))
    t.push(item('second'))
    t.push(item('third'))
    vi.advanceTimersByTime(0)
    expect(texts()).toEqual(['first'])
    // with others waiting a chit holds a little shorter
    vi.advanceTimersByTime(HOLD_QUEUED_MS + OUT_MS)
    expect(shown()).toHaveLength(0)
    vi.advanceTimersByTime(GAP_MS)
    expect(texts()).toEqual(['second'])
    vi.advanceTimersByTime(HOLD_QUEUED_MS + OUT_MS + GAP_MS)
    expect(texts()).toEqual(['third'])
    // the last one has nobody behind it: the full hold
    vi.advanceTimersByTime(HOLD_MS - 1)
    expect(shown()[0]!.classList.contains('is-in')).toBe(true)
    vi.advanceTimersByTime(1 + OUT_MS)
    expect(shown()).toHaveLength(0)
    expect(t.busy()).toBe(false)
  })

  it('never has two chits on screen at any moment of a queue', () => {
    const t = make()
    for (let i = 0; i < 4; i++) t.push(item(`n${i}`))
    const seen = new Set<string | null>()
    for (let ms = 0; ms < 12_000; ms += 50) {
      vi.advanceTimersByTime(50)
      expect(shown().length).toBeLessThanOrEqual(1)
      for (const x of texts()) seen.add(x)
    }
    expect([...seen]).toEqual(['n0', 'n1', 'n2', 'n3'])
  })

  it('a push after the queue has run dry starts afresh', () => {
    const t = make()
    t.push(item('one'))
    vi.advanceTimersByTime(HOLD_MS + OUT_MS + GAP_MS + 10)
    expect(shown()).toHaveLength(0)
    t.push(item('two'))
    vi.advanceTimersByTime(0)
    expect(texts()).toEqual(['two'])
  })

  it('a jackpot is warmer: the jackpot class, the kicker over the line, in its own language', () => {
    const t = make()
    t.push(item('एक सोने की मोहर', { jackpot: true, kicker: 'किस्मत चमकी!', lang: 'hi', item: 'mohur-1857' }))
    t.push(item('plain'))
    vi.advanceTimersByTime(0)
    const el = shown()[0]!
    expect(el.classList.contains('rtoast--jackpot')).toBe(true)
    expect(el.lang).toBe('hi')
    expect(el.querySelector('.rtoast__kicker')!.textContent).toBe('किस्मत चमकी!')
    expect(el.textContent).toBe('किस्मत चमकी! एक सोने की मोहर')
    vi.advanceTimersByTime(HOLD_QUEUED_MS + OUT_MS + GAP_MS)
    expect(shown()[0]!.classList.contains('rtoast--jackpot')).toBe(false)
  })

  it('clear takes everything down at once and nothing returns', () => {
    const t = make()
    t.push(item('one'))
    t.push(item('two'))
    vi.advanceTimersByTime(0)
    t.clear()
    expect(shown()).toHaveLength(0)
    expect(t.busy()).toBe(false)
    vi.advanceTimersByTime(20_000)
    expect(shown()).toHaveLength(0)
    t.push(item('three'))
    vi.advanceTimersByTime(0)
    expect(texts()).toEqual(['three'])
  })

  it('is placed under the bar (or the cabinet) as measured when each chit appears', () => {
    let y = 80
    const t = make({ top: () => y })
    t.push(item('a'))
    vi.advanceTimersByTime(0)
    expect(t.el.style.top).toBe('80px')
    y = 300 // Music's cabinet opened meanwhile
    t.push(item('b'))
    vi.advanceTimersByTime(HOLD_MS + OUT_MS + GAP_MS)
    expect(t.el.style.top).toBe('300px')
  })

  it('draws the icon on its token, and reads fine when the icon fails', () => {
    const icon = vi.fn()
    make({ icon }).push(item('a', { item: 'rupee-1857' }))
    vi.advanceTimersByTime(0)
    expect(icon).toHaveBeenCalledTimes(1)
    expect(icon.mock.calls[0]![0]).toBeInstanceOf(HTMLCanvasElement)
    expect(icon.mock.calls[0]![1]).toBe('rupee-1857')
    document.body.innerHTML = ''
    make({
      icon: () => {
        throw new Error('no canvas')
      },
    }).push(item('b'))
    vi.advanceTimersByTime(0)
    expect(texts()).toEqual(['b'])
  })

  it('under reduced motion it carries the reduced class and a shorter way out', () => {
    const t = make({ reduced: true })
    t.push(item('a'))
    vi.advanceTimersByTime(0)
    expect(shown()[0]!.classList.contains('is-reduced')).toBe(true)
    vi.advanceTimersByTime(HOLD_MS + OUT_REDUCED_MS)
    expect(shown()).toHaveLength(0)
  })

  it('a very long queue drops the oldest plain chit, never a jackpot', () => {
    const t = make()
    t.push(item('up'))
    vi.advanceTimersByTime(0)
    for (let i = 0; i < MAX_WAITING; i++) t.push(item(`p${i}`))
    t.push(item('J', { jackpot: true, kicker: 'Jackpot!' }))
    const seen: string[] = []
    for (let ms = 0; ms < 60_000; ms += 100) {
      vi.advanceTimersByTime(100)
      for (const x of texts()) if (!seen.includes(x!)) seen.push(x!)
    }
    expect(seen).not.toContain('p0')
    expect(seen).toContain('Jackpot! J')
  })
})

describe('the toast words', () => {
  const d = (id: string, qty = 1, jackpot = false): Drop => ({ item: id, qty, jackpot })

  it('says what you got, in plain English with no full stop', () => {
    expect(toastLine(d('rupee-1857'), 'en')).toEqual({ kicker: null, text: 'You got a silver rupee' })
    expect(toastLine(d('jalebi-1947', 2), 'en').text).toBe('You got 2 boxes of jalebis')
  })

  it('says it in Hindi with the verb agreeing', () => {
    expect(toastLine(d('rupee-1857'), 'hi').text).toBe('आपको चाँदी का एक रुपया मिला')
    expect(toastLine(d('mohur-1857'), 'hi').text).toBe('आपको एक सोने की मोहर मिली')
    expect(toastLine(d('seal-1857'), 'hi').text).toBe('आपको दरबार की एक मुहर मिली')
    expect(toastLine(d('paisa-1857', 2), 'hi').text).toBe('आपको 2 ताँबे के पैसे मिले')
  })

  it('gives a jackpot a kicker and the item over it', () => {
    expect(toastLine(d('mohur-1857', 1, true), 'en')).toEqual({ kicker: 'Jackpot!', text: 'A gold mohur' })
    expect(toastLine(d('rupee-1929', 5, true), 'en')).toEqual({ kicker: 'Jackpot!', text: 'Five silver rupees' })
    expect(toastLine(d('mohur-1857', 1, true), 'hi')).toEqual({ kicker: 'किस्मत चमकी!', text: 'एक सोने की मोहर' })
  })

  it('has a line for every item in both languages, and none ends in a full stop', () => {
    for (const it of REWARD_ITEMS) {
      for (const lang of ['en', 'hi'] as const) {
        for (const qty of [1, 3]) {
          for (const jackpot of [false, true]) {
            const l = toastLine({ item: it.id, qty, jackpot }, lang)
            expect(l.text.trim(), `${it.id} ${lang}`).not.toBe('')
            expect(l.text).not.toMatch(/[.।]$/)
          }
        }
      }
    }
  })
})
