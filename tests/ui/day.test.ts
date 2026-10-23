import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderDay, setTimer, type DayProps } from '../../src/ui/screens/day'
import { strings } from '../../src/i18n/strings'
import type { Era } from '../../src/content/types'
import type { ChapterState } from '../../src/game/state'
import { chapter, era, mount } from './helpers'

const handlers = () => ({ stamp: vi.fn(), speak: vi.fn(), tab: vi.fn(), next: vi.fn() })

function props(e: Era, s: ChapterState, over: Partial<DayProps> = {}): DayProps {
  return { era: e, state: s, isoDate: '1857-05-11', timerFrac: 1, lang: 'en', revealed: false, ...over }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('renderDay: stamping', () => {
  it('shows ASLI/TOTA buttons labelled from strings.hi in Hindi', () => {
    const root = mount()
    const e = era()
    const on = handlers()
    renderDay(root, props(e, chapter(e), { lang: 'hi' }), on)
    const asli = root.querySelector<HTMLButtonElement>('button[data-stamp="asli"]')!
    const tota = root.querySelector<HTMLButtonElement>('button[data-stamp="tota"]')!
    expect(asli.textContent).toContain(strings.hi.asli)
    expect(tota.textContent).toContain(strings.hi.tota)
    asli.click()
    tota.click()
    expect(on.stamp.mock.calls).toEqual([['asli'], ['tota']])
  })

  it('replaces the contents of root on each render', () => {
    const root = mount()
    const e = era()
    renderDay(root, props(e, chapter(e)), handlers())
    renderDay(root, props(e, chapter(e)), handlers())
    expect(root.querySelectorAll('button[data-stamp="asli"]')).toHaveLength(1)
  })

  it('takes ArrowLeft / 1 for ASLI and ArrowRight / 2 for TOTA', () => {
    const root = mount()
    const e = era()
    const on = handlers()
    renderDay(root, props(e, chapter(e)), on)
    for (const key of ['ArrowLeft', '1', 'ArrowRight', '2']) document.dispatchEvent(new KeyboardEvent('keydown', { key }))
    expect(on.stamp.mock.calls).toEqual([['asli'], ['asli'], ['tota'], ['tota']])
  })

  it('ignores stamp keys once another screen replaces the day in the same root', () => {
    const root = mount()
    const e = era()
    const on = handlers()
    renderDay(root, props(e, chapter(e)), on)
    root.innerHTML = '<div class="screen screen--end"></div>'
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
    expect(on.stamp).not.toHaveBeenCalled()
  })

  it('closes an open sheet with Escape before anything else', () => {
    const root = mount()
    const e = era()
    renderDay(root, props(e, chapter(e)), handlers())
    root.querySelector<HTMLButtonElement>('button[data-tab="file"]')!.click()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(root.querySelector<HTMLElement>('[data-panel="file"]')!.hidden).toBe(true)
  })

  it('ignores stamp keys once revealed, and after the screen is gone', () => {
    const root = mount()
    const e = era()
    const on = handlers()
    renderDay(root, props(e, chapter(e, { phase: 'stamped', lastCorrect: true }), { revealed: true }), on)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
    root.remove()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: '2' }))
    expect(on.stamp).not.toHaveBeenCalled()
  })
})

describe('renderDay: the paper and pencil marks', () => {
  it('shows pencil marks in Easy and none in Hard', () => {
    const e = era()
    const root = mount()
    renderDay(root, props(e, chapter(e), { lang: 'hi' }), handlers())
    expect([...root.querySelectorAll('mark.pencil')].map((m) => m.textContent)).toEqual(['पहरेदार बदले'])
    renderDay(root, props(e, chapter(e, { difficulty: 'hard', days: 14 }), { lang: 'hi' }), handlers())
    expect(root.querySelectorAll('mark.pencil')).toHaveLength(0)
  })

  it('lets the caller turn pencil marks off (the daily puzzle)', () => {
    const e = era()
    const root = mount()
    renderDay(root, props(e, chapter(e), { pencil: false }), handlers())
    expect(root.querySelectorAll('mark.pencil')).toHaveLength(0)
  })

  it('shows the date of the day with its weekday', () => {
    const e = era()
    const root = mount()
    renderDay(root, props(e, chapter(e, { day: 3 })), handlers())
    expect(root.textContent).toContain('Monday, 11 May 1857')
    expect(root.textContent).toContain('Day 3 of 7')
  })
})

describe('renderDay: case file and rulebook', () => {
  it('blanks hardHidden facts as "—" in Hard only', () => {
    const e = era()
    e.facts[0]!.hardHidden = true
    const root = mount()
    renderDay(root, props(e, chapter(e, { difficulty: 'hard', days: 14 })), handlers())
    const value = (id: string) => root.querySelector(`[data-fact="${id}"] .fact__value`)!.textContent
    expect(value('f1')).toBe('—')
    expect(value('f2')).toBe('The court sat in Delhi.')
    renderDay(root, props(e, chapter(e, { difficulty: 'medium', days: 10 })), handlers())
    expect(value('f1')).toBe('The rising began on a Monday.')
  })

  it('hides rules that have not arrived and tags new ones', () => {
    const e = era()
    e.rules = [
      { id: 'r1', text: { en: 'Rule one', hi: 'नियम एक' }, arrivesOnDay: 1 },
      { id: 'r2', text: { en: 'Rule two', hi: 'नियम दो' }, arrivesOnDay: 3 },
      { id: 'r3', text: { en: 'Rule three', hi: 'नियम तीन' }, arrivesOnDay: 5 },
    ]
    const root = mount()
    renderDay(root, props(e, chapter(e, { day: 3 })), handlers())
    const shown = [...root.querySelectorAll<HTMLElement>('[data-rule]')].map((r) => r.dataset.rule)
    expect(shown).toEqual(['r1', 'r2'])
    expect(root.querySelector('[data-rule="r2"] .tag-new')!.textContent).toBe(strings.en.newTag)
    expect(root.querySelector('[data-rule="r1"] .tag-new')).toBeNull()
    // the rulebook tab says something new is inside
    expect(root.querySelector('button[data-tab="rules"] .tag-new')).not.toBeNull()

    renderDay(root, props(e, chapter(e, { day: 3 }), { lang: 'hi' }), handlers())
    expect(root.querySelector('[data-rule="r2"] .tag-new')!.textContent).toBe('नया')
  })

  it('opens and closes the case file and rulebook, telling the caller', () => {
    const e = era()
    const root = mount()
    const on = handlers()
    renderDay(root, props(e, chapter(e)), on)
    const file = root.querySelector<HTMLElement>('[data-panel="file"]')!
    const rules = root.querySelector<HTMLElement>('[data-panel="rules"]')!
    expect(file.hidden).toBe(true)
    root.querySelector<HTMLButtonElement>('button[data-tab="file"]')!.click()
    expect(file.hidden).toBe(false)
    expect(rules.hidden).toBe(true)
    root.querySelector<HTMLButtonElement>('button[data-tab="rules"]')!.click()
    expect(file.hidden).toBe(true)
    expect(rules.hidden).toBe(false)
    root.querySelector<HTMLButtonElement>('button[data-tab="rules"]')!.click()
    expect(rules.hidden).toBe(true)
    expect(on.tab.mock.calls).toEqual([['file'], ['rules'], ['rules']])
  })
})

describe('renderDay: timer and announcements', () => {
  it('draws the agarbatti from timerFrac and turns it red under 30%', () => {
    const e = era()
    const root = mount()
    renderDay(root, props(e, chapter(e), { timerFrac: 0.5 }), handlers())
    const stick = root.querySelector<HTMLElement>('.agarbatti')!
    expect(stick.style.getPropertyValue('--burn')).toBe('0.5')
    expect(stick.classList.contains('is-low')).toBe(false)
    setTimer(root, 0.2)
    expect(stick.style.getPropertyValue('--burn')).toBe('0.2')
    expect(stick.classList.contains('is-low')).toBe(true)
    expect(stick.getAttribute('aria-valuenow')).toBe('20')
  })

  it('announces the new message in a polite live region', () => {
    const e = era()
    const root = mount()
    renderDay(root, props(e, chapter(e, { day: 2 })), handlers())
    const live = document.querySelector('[aria-live="polite"]')!
    expect(live.textContent).toContain('Day 2')
  })
})

describe('renderDay: read aloud', () => {
  it('hides the speaker when speechSynthesis is missing', () => {
    vi.stubGlobal('speechSynthesis', undefined)
    const e = era()
    const root = mount()
    renderDay(root, props(e, chapter(e)), handlers())
    const btn = root.querySelector<HTMLButtonElement>('button[data-action="speak"]')
    expect(btn === null || btn.hidden).toBe(true)
  })

  it('shows the speaker when a voice exists, and calls speak()', () => {
    vi.stubGlobal('speechSynthesis', {
      getVoices: () => [{ lang: 'hi-IN', name: 'Hindi' }],
      addEventListener: () => {},
      removeEventListener: () => {},
    })
    const e = era()
    const root = mount()
    const on = handlers()
    renderDay(root, props(e, chapter(e), { lang: 'hi' }), on)
    const btn = root.querySelector<HTMLButtonElement>('button[data-action="speak"]')!
    expect(btn.hidden).toBe(false)
    btn.click()
    expect(on.speak).toHaveBeenCalledTimes(1)
  })
})

describe('renderDay: the reveal (Ruling R2)', () => {
  it('replaces the stamps with right/wrong, the kind, the tell, its sources and Next', () => {
    const e = era()
    const root = mount()
    const on = handlers()
    // day 2 is the forged m2, stamped correctly
    renderDay(root, props(e, chapter(e, { day: 2, phase: 'stamped', lastCorrect: true }), { revealed: true }), on)
    expect(root.querySelector('button[data-stamp]')).toBeNull()
    const reveal = root.querySelector<HTMLElement>('.reveal')!
    expect(reveal.textContent).toContain(strings.en.right)
    expect(reveal.textContent).toContain(strings.en.kindForged)
    expect(reveal.textContent).toContain('The court sat in Delhi, not Lahore.')
    expect(reveal.textContent).toContain('B. Author, Second Book (1950), ch. 3')
    root.querySelector<HTMLButtonElement>('button[data-action="next"]')!.click()
    expect(on.next).toHaveBeenCalledTimes(1)
  })

  it('says wrong and shows why a genuine message checks out', () => {
    const e = era()
    const root = mount()
    renderDay(root, props(e, chapter(e, { day: 1, phase: 'caught', lastCorrect: false }), { revealed: true }), handlers())
    const reveal = root.querySelector<HTMLElement>('.reveal')!
    expect(reveal.textContent).toContain(strings.en.wrong)
    expect(reveal.textContent).toContain('Written for the game · every detail checks out')
    expect(reveal.textContent).toContain('The gate rota is recorded.')
    expect(reveal.textContent).toContain('A. Author, First Book (1900), p. 14')
  })

  it('labels a real document', () => {
    const e = era()
    e.messages[0]!.document = { sources: [{ id: 's2', loc: 'plate 4' }] }
    const root = mount()
    renderDay(root, props(e, chapter(e, { phase: 'stamped', lastCorrect: true }), { revealed: true, lang: 'en' }), handlers())
    const reveal = root.querySelector<HTMLElement>('.reveal')!
    expect(reveal.textContent).toContain('📜 Real document')
    expect(reveal.textContent).toContain('B. Author, Second Book (1950), plate 4')
  })

  it('announces the result', () => {
    const e = era()
    const root = mount()
    renderDay(root, props(e, chapter(e, { phase: 'stamped', lastCorrect: true }), { revealed: true }), handlers())
    expect(document.querySelector('[aria-live="polite"]')!.textContent).toContain(strings.en.right)
  })
})

describe('renderDay: timeouts, the daily puzzle and leaving', () => {
  it('says "Too slow" instead of "Wrong" after a timeout (Ruling R12)', () => {
    const e = era()
    const root = mount()
    renderDay(root, props(e, chapter(e, { phase: 'caught', lastCorrect: false, lastVerdict: 'timeout' }), { revealed: true }), handlers())
    expect(root.querySelector('.reveal__word')!.textContent).toBe(strings.en.tooSlow)
    expect(document.querySelector('[aria-live="polite"]')!.textContent).toContain(strings.en.tooSlow)
    renderDay(root, props(e, chapter(e, { phase: 'caught', lastCorrect: false, lastVerdict: 'asli' }), { revealed: true }), handlers())
    expect(root.querySelector('.reveal__word')!.textContent).toBe(strings.en.wrong)
    renderDay(root, props(e, chapter(e, { phase: 'caught', lastCorrect: false, lastVerdict: 'timeout' }), { revealed: true, lang: 'hi' }), handlers())
    expect(root.querySelector('.reveal__word')!.textContent).toBe('देर हो गई')
  })

  it('shows every rule, none tagged new, when allRules is set (the daily puzzle)', () => {
    const e = era()
    e.rules.push({ id: 'r9', text: { en: 'Late rule', hi: 'बाद का नियम' }, arrivesOnDay: 9 })
    const root = mount()
    renderDay(root, props(e, chapter(e, { day: 2 })), handlers())
    expect(root.querySelector('[data-rule="r9"]')).toBeNull()
    renderDay(root, props(e, chapter(e, { day: 2 }), { allRules: true }), handlers())
    expect(root.querySelector('[data-rule="r9"]')).not.toBeNull()
    expect(root.querySelector('.tag-new')).toBeNull()
  })

  it('shows a home button only when the caller lets the player leave', () => {
    const e = era()
    const root = mount()
    renderDay(root, props(e, chapter(e)), handlers())
    expect(root.querySelector('[data-action="quit"]')).toBeNull()
    const on = { ...handlers(), quit: vi.fn() }
    renderDay(root, props(e, chapter(e)), on)
    const quit = root.querySelector<HTMLButtonElement>('[data-action="quit"]')!
    expect(quit.getAttribute('aria-label')).toBe(strings.en.home)
    quit.click()
    expect(on.quit).toHaveBeenCalledTimes(1)
  })
})
