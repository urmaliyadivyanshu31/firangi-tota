import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderDay, setReadable, setStamping, setTimer, setVoiceState, type DayProps } from '../../src/ui/screens/day'
import { strings } from '../../src/i18n/strings'
import type { Era } from '../../src/content/types'
import type { ChapterState } from '../../src/game/state'
import { pencilOn } from '../../src/game/config'
import { buildSheet } from '../../src/ui/message'
import { chapter, era, mount } from './helpers'

const handlers = () => ({ stamp: vi.fn(), listen: vi.fn(), tab: vi.fn(), next: vi.fn(), skip: vi.fn(), sound: vi.fn(), lang: vi.fn() })

function props(e: Era, s: ChapterState, over: Partial<DayProps> = {}): DayProps {
  const lang = over.lang ?? 'en'
  const msg = s.queue[s.day - 1]!
  const sheet = buildSheet({ era: e, msg, isoDate: '1857-05-11', lang, pencil: pencilOn(s.difficulty, s.day) })
  return { era: e, state: s, lang, sheet, timerFrac: 1, secs: 90, readable: true, revealed: false, soundOn: true, ...over }
}

/** A matchMedia that answers the 900 px landscape query; `listeners` lets a test flip it. */
function stubWidth(wide: boolean) {
  const listeners: ((e: { matches: boolean }) => void)[] = []
  const q = {
    matches: wide,
    addEventListener: (_: string, fn: (e: { matches: boolean }) => void) => listeners.push(fn),
    removeEventListener: () => undefined,
  }
  vi.stubGlobal('matchMedia', (query: string) => (query.includes('min-width: 900px') ? q : { matches: false, addEventListener() {}, removeEventListener() {} }))
  return {
    set(next: boolean) {
      q.matches = next
      for (const fn of listeners) fn({ matches: next })
    },
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('renderDay: stamps', () => {
  it('shows ASLI and TOTA with Devanagari and English, the meaning, and the key hints', () => {
    const root = mount()
    const e = era()
    const on = handlers()
    renderDay(root, props(e, chapter(e), { lang: 'hi' }), on)
    const asli = root.querySelector<HTMLButtonElement>('button[data-stamp="asli"]')!
    const tota = root.querySelector<HTMLButtonElement>('button[data-stamp="tota"]')!
    expect(asli.querySelector('.stamp__dev')!.textContent).toBe('असली')
    expect(asli.querySelector('.stamp__lat')!.textContent).toBe('ASLI')
    expect(asli.textContent).toContain(strings.hi.asliHint)
    expect(asli.querySelector('.stamp__key')!.textContent).toBe('← 1')
    expect(tota.querySelector('.stamp__key')!.textContent).toBe('→ 2')
    asli.click()
    tota.click()
    expect(on.stamp.mock.calls).toEqual([['asli'], ['tota']])
  })

  it('keeps the stamps off until the paper is readable, then turns them on in place', () => {
    const root = mount()
    const e = era()
    const on = handlers()
    renderDay(root, props(e, chapter(e), { readable: false }), on)
    const asli = root.querySelector<HTMLButtonElement>('button[data-stamp="asli"]')!
    expect(asli.disabled).toBe(true)
    expect(root.querySelector('.screen--day')!.classList.contains('is-arriving')).toBe(true)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: '1' }))
    expect(on.stamp).not.toHaveBeenCalled()
    setReadable(root)
    expect(root.querySelector('button[data-stamp="asli"]')).toBe(asli) // no re-render
    expect(asli.disabled).toBe(false)
    expect(root.querySelector('.screen--day')!.classList.contains('is-arriving')).toBe(false)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: '1' }))
    expect(on.stamp).toHaveBeenCalledWith('asli')
  })

  it('turns the stamps off while one comes down, and marks the chosen one', () => {
    const root = mount()
    const e = era()
    const on = handlers()
    renderDay(root, props(e, chapter(e)), on)
    setStamping(root, 'tota')
    const [asli, tota] = ['asli', 'tota'].map((v) => root.querySelector<HTMLButtonElement>(`button[data-stamp="${v}"]`)!)
    expect(asli!.disabled && tota!.disabled).toBe(true)
    expect(tota!.classList.contains('is-chosen')).toBe(true)
    expect(asli!.classList.contains('is-chosen')).toBe(false)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
    expect(on.stamp).not.toHaveBeenCalled()
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

  it('skips the arrival on a tap on the room, the skip chip, or Escape', () => {
    const root = mount()
    const e = era()
    const on = handlers()
    renderDay(root, props(e, chapter(e), { readable: false }), on)
    root.querySelector<HTMLElement>('.tapcatch')!.dispatchEvent(new Event('pointerdown'))
    root.querySelector<HTMLButtonElement>('[data-action="skip"]')!.click()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(on.skip).toHaveBeenCalledTimes(3)
  })
})

describe('renderDay: the hidden copy of the message', () => {
  it('matches the sheet the paper shows, and is filled once the paper is readable', () => {
    const root = mount()
    const e = era()
    const p = props(e, chapter(e, { day: 2 }), { readable: false })
    renderDay(root, p, handlers())
    const copy = root.querySelector<HTMLElement>('.day__message')!
    expect(copy.classList.contains('sr-only')).toBe(true)
    expect(copy.getAttribute('aria-live')).toBe('polite')
    expect(copy.textContent).toBe('')
    setReadable(root)
    expect(copy.querySelector('.msg__body')!.textContent).toBe(p.sheet.body)
    expect(copy.textContent).toContain(p.sheet.from)
    expect(copy.textContent).toContain('Day 2 of 7')
  })

  it('has no visible paper panel: the message lives on the 3D paper', () => {
    const root = mount()
    const e = era()
    renderDay(root, props(e, chapter(e)), handlers())
    expect(root.querySelector('.paper, mark.pencil')).toBeNull()
  })
})

describe('renderDay: the top bar', () => {
  it('shows the place, the day as a flip number, the mode, the agarbatti and its seconds', () => {
    const root = mount()
    const e = era({ title: { en: 'Delhi 1857', hi: 'दिल्ली 1857' }, place: { en: 'Red Fort, Delhi', hi: 'लाल क़िला, दिल्ली' } })
    renderDay(root, props(e, chapter(e, { day: 3 }), { lang: 'hi', timerFrac: 0.5, secs: 45 }), handlers())
    expect(root.querySelector('.hud__title')!.textContent).toBe('दिल्ली 1857')
    expect(root.querySelector('.hud__place')!.textContent).toBe('लाल क़िला')
    expect(root.querySelector('.flip__n')!.textContent).toBe('03')
    expect(root.querySelector('.hud__total')!.textContent).toBe('/07')
    expect(root.querySelector('.hud__mode')!.textContent).toBe(strings.hi.modeEasy)
    expect(root.querySelector('.hud__secs')!.textContent).toBe('45')
  })

  it('names the Aaj ka Taar in the mode chip during the daily puzzle', () => {
    const root = mount()
    const e = era()
    renderDay(root, props(e, chapter(e, { difficulty: 'medium', days: 5 }), { daily: 4 }), handlers())
    expect(root.querySelector('.hud__mode--daily')!.textContent).toBe(`${strings.en.dailyTitle} #4`)
  })

  it('burns the agarbatti from the right, turns it vermilion under 30%, and counts the seconds', () => {
    const e = era()
    const root = mount()
    renderDay(root, props(e, chapter(e), { timerFrac: 0.5, secs: 45 }), handlers())
    const stick = root.querySelector<HTMLElement>('.agarbatti')!
    expect(stick.style.getPropertyValue('--burn')).toBe('0.5')
    expect(stick.querySelector('.agarbatti__ember .agarbatti__smoke')).not.toBeNull()
    expect(stick.classList.contains('is-low')).toBe(false)
    setTimer(root, 0.2, 17.4)
    expect(stick.style.getPropertyValue('--burn')).toBe('0.2')
    expect(stick.classList.contains('is-low')).toBe(true)
    expect(stick.getAttribute('aria-valuenow')).toBe('20')
    expect(root.querySelector('.hud__secs')!.textContent).toBe('18')
  })

  it('has separate sound and language buttons, and home when the player may leave', () => {
    const root = mount()
    const e = era()
    const on = { ...handlers(), quit: vi.fn() }
    renderDay(root, props(e, chapter(e)), on)
    const sound = root.querySelector<HTMLButtonElement>('.hud [data-action="sound"]')!
    expect(sound.getAttribute('aria-label')).toBe(strings.en.sound)
    expect(sound.getAttribute('aria-pressed')).toBe('true')
    sound.click()
    root.querySelector<HTMLButtonElement>('.hud [data-action="lang"]')!.click()
    root.querySelector<HTMLButtonElement>('.hud [data-action="quit"]')!.click()
    expect(on.sound).toHaveBeenCalledTimes(1)
    expect(on.lang).toHaveBeenCalledTimes(1)
    expect(on.quit).toHaveBeenCalledTimes(1)
    expect(root.querySelector('.hud [data-action="lang"]')!.textContent).toBe(strings.hi.langShort)
  })
})

describe('renderDay: Listen', () => {
  it('shows a microphone button only when the era voices exist, off until readable', () => {
    const root = mount()
    const e = era()
    const on = handlers()
    renderDay(root, props(e, chapter(e)), on)
    expect(root.querySelector('[data-action="listen"]')).toBeNull()
    renderDay(root, props(e, chapter(e), { readable: false, voice: 'idle' }), on)
    const btn = root.querySelector<HTMLButtonElement>('[data-action="listen"]')!
    expect(btn.disabled).toBe(true)
    expect(btn.textContent).toBe(strings.en.listen)
    setReadable(root)
    btn.click()
    expect(on.listen).toHaveBeenCalledTimes(1)
  })

  it('shows loading, playing (tap to stop) and the error in place', () => {
    const root = mount()
    const e = era()
    renderDay(root, props(e, chapter(e), { lang: 'hi', voice: 'idle' }), handlers())
    const btn = root.querySelector<HTMLButtonElement>('[data-action="listen"]')!
    setVoiceState(root, 'loading')
    expect(btn.dataset.state).toBe('loading')
    expect(btn.getAttribute('aria-busy')).toBe('true')
    setVoiceState(root, 'playing')
    expect(btn.textContent).toBe(strings.hi.listenStop)
    expect(btn.getAttribute('aria-pressed')).toBe('true')
    setVoiceState(root, 'error')
    expect(btn.textContent).toBe('आवाज़ नहीं आ पाई')
  })
})

describe('renderDay: the choice of voice', () => {
  it('opens a two-option picker from the chevron and reports the pick', () => {
    const root = mount()
    const e = era()
    const on = { ...handlers(), voiceStyle: vi.fn() }
    renderDay(root, props(e, chapter(e), { lang: 'hi', voice: 'idle', voiceStyle: 'era' }), on)
    const picker = root.querySelector<HTMLElement>('.voice-picker')!
    const more = root.querySelector<HTMLButtonElement>('[data-action="voice-style"]')!
    expect(picker.classList.contains('is-open')).toBe(false)
    more.click()
    expect(picker.classList.contains('is-open')).toBe(true)
    expect(more.getAttribute('aria-expanded')).toBe('true')
    const opts = [...picker.querySelectorAll<HTMLButtonElement>('.voice-opt')]
    expect(opts.map((o) => o.textContent)).toEqual(['युग की आवाज़', 'दास्तानगो'])
    expect(opts.map((o) => o.getAttribute('aria-checked'))).toEqual(['true', 'false'])
    opts[1]!.click()
    expect(on.voiceStyle).toHaveBeenCalledWith('dastango')
    expect(opts.map((o) => o.getAttribute('aria-checked'))).toEqual(['false', 'true'])
    expect(picker.classList.contains('is-open')).toBe(false)
  })

  it('closes the picker with Escape before anything else', () => {
    const root = mount()
    const e = era()
    renderDay(root, props(e, chapter(e), { voice: 'idle' }), handlers())
    root.querySelector<HTMLButtonElement>('[data-action="voice-style"]')!.click()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(root.querySelector('.voice-picker')!.classList.contains('is-open')).toBe(false)
  })
})

describe('renderDay: case file and rulebook', () => {
  it('pins both cards on the left at 900 px and wider, with no tabs', () => {
    stubWidth(true)
    const root = mount()
    const e = era()
    renderDay(root, props(e, chapter(e)), handlers())
    const screen = root.querySelector<HTMLElement>('.screen--day')!
    expect(screen.dataset.layout).toBe('wide')
    for (const k of ['file', 'rules']) expect(root.querySelector(`[data-panel="${k}"]`)!.getAttribute('aria-hidden')).toBe('false')
  })

  it('keeps them in sheets behind two tabs below 900 px, and switches when the width changes', () => {
    const width = stubWidth(false)
    const root = mount()
    const e = era()
    const on = handlers()
    renderDay(root, props(e, chapter(e)), on)
    const screen = root.querySelector<HTMLElement>('.screen--day')!
    const file = root.querySelector<HTMLElement>('[data-panel="file"]')!
    expect(screen.dataset.layout).toBe('narrow')
    expect(file.getAttribute('aria-hidden')).toBe('true')
    expect(file.hasAttribute('inert')).toBe(true)
    root.querySelector<HTMLButtonElement>('button[data-tab="file"]')!.click()
    expect(file.classList.contains('is-open')).toBe(true)
    expect(file.getAttribute('aria-hidden')).toBe('false')
    width.set(true)
    expect(screen.dataset.layout).toBe('wide')
    expect(file.classList.contains('is-open')).toBe(false)
    expect(file.getAttribute('aria-hidden')).toBe('false')
    width.set(false)
    expect(screen.dataset.layout).toBe('narrow')
    expect(file.getAttribute('aria-hidden')).toBe('true')
  })

  it('opens one sheet at a time and closes it with the tab, the close button, the scrim, Escape or a swipe down', () => {
    stubWidth(false)
    const e = era()
    const root = mount()
    const on = handlers()
    renderDay(root, props(e, chapter(e)), on)
    const file = root.querySelector<HTMLElement>('[data-panel="file"]')!
    const rules = root.querySelector<HTMLElement>('[data-panel="rules"]')!
    const tab = (k: string) => root.querySelector<HTMLButtonElement>(`button[data-tab="${k}"]`)!
    const open = (el: HTMLElement) => el.classList.contains('is-open')
    tab('file').click()
    expect([open(file), open(rules)]).toEqual([true, false])
    tab('rules').click()
    expect([open(file), open(rules)]).toEqual([false, true])
    tab('rules').click()
    expect(open(rules)).toBe(false)
    tab('file').click()
    file.querySelector<HTMLButtonElement>('.sheet__close')!.click()
    expect(open(file)).toBe(false)
    tab('file').click()
    root.querySelector<HTMLElement>('.sheet-scrim')!.click()
    expect(open(file)).toBe(false)
    tab('file').click()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(open(file)).toBe(false)
    tab('file').click()
    const head = file.querySelector<HTMLElement>('.sheet__head')!
    const ptr = (type: string, y: number) => {
      const ev = new MouseEvent(type, { clientY: y, bubbles: true }) as MouseEvent & { pointerId: number }
      Object.defineProperty(ev, 'pointerId', { value: 1 })
      head.dispatchEvent(ev)
    }
    ptr('pointerdown', 100)
    ptr('pointermove', 140)
    expect(file.style.transform).toBe('translateY(40px)')
    ptr('pointerup', 140)
    expect(open(file)).toBe(true) // a short drag springs back
    ptr('pointerdown', 100)
    ptr('pointermove', 200)
    ptr('pointerup', 200)
    expect(open(file)).toBe(false)
    expect(on.tab.mock.calls.map((c) => c[0])).toEqual(['file', 'rules', 'rules', 'file', 'file', 'file', 'file'])
  })

  it('leaves hardHidden facts as an empty blank in Hard only', () => {
    const e = era()
    e.facts[0]!.hardHidden = true
    const root = mount()
    renderDay(root, props(e, chapter(e, { difficulty: 'hard', days: 14 })), handlers())
    const value = (id: string) => root.querySelector<HTMLElement>(`[data-fact="${id}"] .fact__value`)!
    expect(value('f1').classList.contains('is-blank')).toBe(true)
    expect(value('f1').textContent).toBe('')
    expect(value('f1').getAttribute('aria-label')).toBe(strings.en.blankFact)
    expect(value('f2').textContent).toBe('The court sat in Delhi.')
    renderDay(root, props(e, chapter(e, { difficulty: 'medium', days: 10 })), handlers())
    expect(value('f1').textContent).toBe('The rising began on a Monday.')
  })

  it('pencil-marks the case-file lines that relate to the message, when pencil marks are on', () => {
    const e = era()
    const root = mount()
    // day 2 is the forged m2: "the court sat in Lahore"; the fact about the court's city relates
    renderDay(root, props(e, chapter(e, { day: 2 })), handlers())
    const marked = () => [...root.querySelectorAll<HTMLElement>('.fact.is-pencilled')].map((f) => f.dataset.fact)
    expect(marked()).toEqual(['f2'])
    renderDay(root, props(e, chapter(e, { day: 2, difficulty: 'hard', days: 14 })), handlers())
    expect(marked()).toEqual([])
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
    expect(root.querySelector('button[data-tab="rules"] .tag-new')).not.toBeNull()
    renderDay(root, props(e, chapter(e, { day: 3 }), { lang: 'hi' }), handlers())
    expect(root.querySelector('[data-rule="r2"] .tag-new')!.textContent).toBe('नया')
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
})

describe('renderDay: the result card (Ruling R2)', () => {
  it('shows the verdict, the one-line tell, the kind and sources behind Source, and Next', () => {
    const e = era()
    const root = mount()
    const on = handlers()
    // day 2 is the forged m2, stamped correctly
    renderDay(root, props(e, chapter(e, { day: 2, phase: 'stamped', lastCorrect: true }), { revealed: true }), on)
    expect(root.querySelector('button[data-stamp]')).toBeNull()
    const reveal = root.querySelector<HTMLElement>('.reveal--right')!
    expect(reveal.querySelector('.reveal__word')!.textContent).toBe(strings.en.right)
    expect(reveal.querySelector('.tell-line')!.textContent).toBe('The court sat in Delhi, not Lahore.')
    const fold = reveal.querySelector<HTMLDetailsElement>('details.fold')!
    expect(fold.open).toBe(false)
    expect(fold.querySelector('summary')!.textContent).toBe(strings.en.source)
    expect(fold.textContent).toContain(strings.en.kindForged)
    expect(fold.textContent).toContain('B. Author, Second Book (1950), ch. 3')
    root.querySelector<HTMLButtonElement>('button[data-action="next"]')!.click()
    expect(on.next).toHaveBeenCalledTimes(1)
  })

  it('says wrong and why a genuine message checks out', () => {
    const e = era()
    const root = mount()
    renderDay(root, props(e, chapter(e, { day: 1, phase: 'caught', lastCorrect: false }), { revealed: true }), handlers())
    const reveal = root.querySelector<HTMLElement>('.reveal--wrong')!
    expect(reveal.querySelector('.reveal__word')!.textContent).toBe(strings.en.wrong)
    expect(reveal.querySelector('.truth')!.textContent).toBe(strings.en.wasGenuine)
    expect(reveal.querySelector('.tell-line')!.textContent).toBe('The gate rota is recorded.')
    expect(reveal.textContent).toContain('Written for the game · every detail checks out')
    expect(reveal.textContent).toContain('A. Author, First Book (1900), p. 14')
  })

  it('labels a real document with a scroll, not an emoji', () => {
    const e = era()
    e.messages[0]!.document = { sources: [{ id: 's2', loc: 'plate 4' }] }
    const root = mount()
    renderDay(root, props(e, chapter(e, { phase: 'stamped', lastCorrect: true }), { revealed: true }), handlers())
    const truth = root.querySelector<HTMLElement>('.truth--document')!
    expect(truth.textContent).toContain(strings.en.kindReal)
    expect(truth.querySelector('svg.scroll-mark')).not.toBeNull()
    expect(root.textContent).not.toContain('📜')
    expect(root.querySelector('.reveal')!.textContent).toContain('B. Author, Second Book (1950), plate 4')
  })

  it('announces the result and says "Too slow" after a timeout (Ruling R12)', () => {
    const e = era()
    const root = mount()
    renderDay(root, props(e, chapter(e, { phase: 'caught', lastCorrect: false, lastVerdict: 'timeout' }), { revealed: true }), handlers())
    expect(root.querySelector('.reveal__word')!.textContent).toBe(strings.en.tooSlow)
    expect(document.getElementById('ft-live')!.textContent).toContain(strings.en.tooSlow)
    renderDay(root, props(e, chapter(e, { phase: 'caught', lastCorrect: false, lastVerdict: 'timeout' }), { revealed: true, lang: 'hi' }), handlers())
    expect(root.querySelector('.reveal__word')!.textContent).toBe('देर हो गई')
  })
})
