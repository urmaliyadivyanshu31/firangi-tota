import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderDay, setReadable, setStamping, setTimer, setTossing, setVoiceState, type DayProps } from '../../src/ui/screens/day'
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
    const langs = [...root.querySelectorAll<HTMLButtonElement>('.hud .langswitch__opt')]
    expect(langs.map((b) => [b.textContent, b.getAttribute('aria-pressed')])).toEqual([['हिंदी', 'false'], ['English', 'true']])
    langs[1]!.click() // already English: nothing
    langs[0]!.click()
    root.querySelector<HTMLButtonElement>('.hud [data-action="quit"]')!.click()
    expect(on.sound).toHaveBeenCalledTimes(1)
    expect(on.lang).toHaveBeenCalledTimes(1)
    expect(on.quit).toHaveBeenCalledTimes(1)
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
  const two = [
    { id: 'dastango', label: 'दास्तानगो' },
    { id: 'guest', label: 'पीयूष मिश्रा', credit: 'Voice: Piyush Mishra (with permission)' },
  ]

  it('shows no picker when the dastango is the only voice', () => {
    const root = mount()
    const e = era()
    renderDay(root, props(e, chapter(e), { voice: 'idle', voices: [two[0]!], voiceStyle: 'dastango' }), handlers())
    expect(root.querySelector('[data-action="listen"]')).not.toBeNull()
    expect(root.querySelector('[data-action="voice-style"]')).toBeNull()
    expect(root.querySelector('.voice-picker')).toBeNull()
  })

  it('opens a two-option picker from the chevron, reports the pick and shows the guest credit', () => {
    const root = mount()
    const e = era()
    const on = { ...handlers(), voiceStyle: vi.fn() }
    renderDay(root, props(e, chapter(e), { lang: 'hi', voice: 'idle', voices: two, voiceStyle: 'dastango' }), on)
    const picker = root.querySelector<HTMLElement>('.voice-picker')!
    const more = root.querySelector<HTMLButtonElement>('[data-action="voice-style"]')!
    const credit = root.querySelector<HTMLElement>('.voice-credit')!
    expect(credit.hidden).toBe(true)
    more.click()
    expect(picker.classList.contains('is-open')).toBe(true)
    expect(more.getAttribute('aria-expanded')).toBe('true')
    const opts = [...picker.querySelectorAll<HTMLButtonElement>('.voice-opt')]
    expect(opts.map((o) => o.textContent)).toEqual(['दास्तानगो', 'पीयूष मिश्रा'])
    expect(opts.map((o) => o.getAttribute('aria-checked'))).toEqual(['true', 'false'])
    opts[1]!.click()
    expect(on.voiceStyle).toHaveBeenCalledWith('guest')
    expect(opts.map((o) => o.getAttribute('aria-checked'))).toEqual(['false', 'true'])
    expect(picker.classList.contains('is-open')).toBe(false)
    expect(credit.hidden).toBe(false)
    expect(credit.textContent).toBe(two[1]!.credit)
  })

  it('closes the picker with Escape before anything else', () => {
    const root = mount()
    const e = era()
    renderDay(root, props(e, chapter(e), { voice: 'idle', voices: two }), handlers())
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

  it('on a phone on its side (short landscape, even 900 px wide) keeps the tabs and marks the screen short', () => {
    const listeners: (() => void)[] = []
    let short = true
    vi.stubGlobal('matchMedia', (query: string) => ({
      get matches() { return query.includes('min-width: 900px') ? true : query.includes('max-height') ? short : false },
      addEventListener: (_: string, fn: () => void) => listeners.push(fn),
      removeEventListener: () => undefined,
    }))
    const root = mount()
    const e = era()
    renderDay(root, props(e, chapter(e)), handlers())
    const screen = root.querySelector<HTMLElement>('.screen--day')!
    expect(screen.dataset.layout).toBe('narrow')
    expect(screen.hasAttribute('data-short')).toBe(true)
    expect(root.querySelector('button[data-tab="file"]')).not.toBeNull()
    short = false // turned upright on a tablet: wide again
    for (const fn of listeners) fn()
    expect(screen.dataset.layout).toBe('wide')
    expect(screen.hasAttribute('data-short')).toBe(false)
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

  it('reads the case file as story paragraphs, one sentence per fact, the facts highlighted', () => {
    const e = era()
    e.facts.push({ ...structuredClone(e.facts[1]!), id: 'f3', story: { en: 'The seal is [[round]].', hi: 'मुहर [[गोल]] होती है।' } })
    const root = mount()
    renderDay(root, props(e, chapter(e)), handlers())
    const paras = [...root.querySelectorAll<HTMLElement>('.story__ink .story__para')]
    expect(paras.map((p) => [...p.querySelectorAll<HTMLElement>('[data-fact]')].map((s) => s.dataset.fact))).toEqual([['f1'], ['f2', 'f3']])
    expect(paras[1]!.textContent).toBe('The court sat in Delhi. The seal is round.')
    expect([...root.querySelectorAll('.story__ink .hl')].map((x) => x.textContent)).toEqual(['Monday', 'Delhi', 'round'])
    expect(root.querySelector('.story__ink')!.getAttribute('aria-hidden')).toBe('true')
    // screen readers get the same sentences, plain
    expect([...root.querySelectorAll('.story__said p')].map((p) => p.textContent)).toEqual(['The rising began on a Monday.', 'The court sat in Delhi. The seal is round.'])
    expect(root.querySelector('.story')!.textContent).not.toContain('[[')
    renderDay(root, props(e, chapter(e), { lang: 'hi' }), handlers())
    expect(root.querySelector('.story__said p')!.textContent).toBe('विद्रोह सोमवार को शुरू हुआ।')
    expect(root.querySelector('.story__ink .hl')!.textContent).toBe('सोमवार')
  })

  it("blanks a hardHidden fact's highlighted words in Hard only, and reads them as blank", () => {
    const e = era()
    e.facts[0]!.hardHidden = true
    const root = mount()
    renderDay(root, props(e, chapter(e, { difficulty: 'hard', days: 14 })), handlers())
    const line = (id: string) => root.querySelector<HTMLElement>(`.story__ink [data-fact="${id}"]`)!
    expect(line('f1').classList.contains('is-hidden')).toBe(true)
    expect(line('f1').querySelectorAll('.hl.is-blank')).toHaveLength(1)
    expect(line('f1').textContent).toBe('The rising began on a .')
    expect(line('f2').textContent).toBe('The court sat in Delhi.')
    expect(root.querySelector('.story__said')!.textContent).toContain(`The rising began on a ${strings.en.blankFact}.`)
    expect(root.querySelector('.story__said')!.textContent).not.toContain('Monday')
    renderDay(root, props(e, chapter(e, { difficulty: 'medium', days: 10 })), handlers())
    expect(line('f1').textContent).toBe('The rising began on a Monday.')
    expect(root.querySelector('.is-blank')).toBeNull()
  })

  it('pencil-marks the case-file lines that relate to the message, when pencil marks are on', () => {
    const e = era()
    const root = mount()
    // day 2 is the forged m2: "the court sat in Lahore"; the fact about the court's city relates
    renderDay(root, props(e, chapter(e, { day: 2 })), handlers())
    const marked = () => [...root.querySelectorAll<HTMLElement>('.fact.is-pencilled')].map((f) => f.dataset.fact)
    expect(marked()).toEqual(['f2'])
    // its sentence carries the pencil's tick, held to its first word, and reads the same
    const line = root.querySelector<HTMLElement>('[data-fact="f2"]')!
    expect(line.firstElementChild!.className).toBe('fact__tick')
    expect(line.firstElementChild!.textContent).toBe('The')
    expect(line.textContent).toBe('The court sat in Delhi.')
    expect(root.querySelectorAll('.fact__tick')).toHaveLength(1)
    renderDay(root, props(e, chapter(e, { day: 2, difficulty: 'hard', days: 14 })), handlers())
    expect(marked()).toEqual([])
    expect(root.querySelector('.fact__tick')).toBeNull()
  })

  it('pencils the same case-file lines on both halves of a pair, from the union of their checks', () => {
    const e = era()
    const root = mount()
    const marked = () => [...root.querySelectorAll<HTMLElement>('.fact.is-pencilled')].map((f) => f.dataset.fact)
    const m1 = e.messages.find((m) => m.id === 'm1')!
    const m2 = e.messages.find((m) => m.id === 'm2')!
    m1.pair = m2.pair = 'pp' // pair the genuine day 1 with the forged day 2, whose checks differ
    renderDay(root, props(e, chapter(e, { day: 1 })), handlers())
    const genuine = marked()
    renderDay(root, props(e, chapter(e, { day: 2 })), handlers())
    expect(marked()).toEqual(genuine)
    expect(genuine).toContain('f2') // the forged half's line is marked on the genuine half too
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

describe('renderDay: after the stamp', () => {
  it('announces the result and says "Too slow" after a timeout (Ruling R12)', () => {
    const e = era()
    const root = mount()
    renderDay(root, props(e, chapter(e, { phase: 'caught', lastCorrect: false, lastVerdict: 'timeout' }), { revealed: true }), handlers())
    expect(document.getElementById('ft-live')!.textContent).toContain(strings.en.tooSlow)
    expect(root.querySelector('button[data-stamp]')).toBeNull()
  })
})

describe('renderDay: the verdict on the paper', () => {
  const rect = { x: 40, y: 500, w: 120, h: 20 }

  it('keeps only Next, a source button over the paper\u2019s source line, and a mirror for screen readers', () => {
    const e = era()
    const root = mount()
    const on = handlers()
    renderDay(root, props(e, chapter(e, { day: 2, phase: 'stamped', lastCorrect: true, lastVerdict: 'tota' }), {
      revealed: true,
      onPaper: { mirror: 'Right · This message was forged. The court sat in Delhi, not Lahore.', sourceRect: rect, sources: [{ id: 's2', loc: 'ch. 3' }], kind: strings.en.kindForged },
    }), on)
    expect(root.querySelector('.reveal')).toBeNull() // no DOM result card
    expect(root.querySelector('.paper-result__mirror')!.textContent).toContain('The court sat in Delhi, not Lahore.')
    const src = root.querySelector<HTMLButtonElement>('.source-hit')!
    expect(src.style.left).toBe('40px')
    expect(src.style.top).toBe('486px') // centred on the line
    expect(src.style.height).toBe('48px') // never smaller than a fingertip
    expect(src.getAttribute('aria-label')).toBe('Source: B. Author, Second Book (1950), ch. 3')
    const pop = root.querySelector<HTMLElement>('#ft-source-pop')!
    expect(pop.hidden).toBe(true)
    src.click()
    expect(pop.hidden).toBe(false)
    expect(pop.textContent).toContain('B. Author, Second Book (1950), ch. 3')
    expect(pop.textContent).toContain(strings.en.kindForged) // the honest note: written for the game
    root.querySelector<HTMLButtonElement>('[data-action="next"]')!.click()
    expect(on.next).toHaveBeenCalledTimes(1)
  })

  it('at the chapter\u2019s end offers Play again, Home and Share, with the receipts behind a tap', () => {
    const e = era()
    const root = mount()
    const on = { ...handlers(), again: vi.fn(), home: vi.fn(), share: vi.fn() }
    renderDay(root, props(e, chapter(e, { day: 1, phase: 'caught', lastCorrect: false, lastVerdict: 'tota' }), {
      revealed: true,
      onPaper: { mirror: 'You rejected a genuine message', sourceRect: null, sources: [{ id: 's1', loc: 'p. 14' }], end: { receipts: e.receipts } },
    }), on)
    expect(root.querySelector('[data-action="next"]')).toBeNull()
    for (const a of ['again', 'home', 'share']) root.querySelector<HTMLElement>(`[data-action="${a}"]`)!.click()
    expect(on.again).toHaveBeenCalledTimes(1)
    expect(on.home).toHaveBeenCalledTimes(1)
    expect(on.share).toHaveBeenCalledTimes(1)
    const open = root.querySelector<HTMLButtonElement>('[data-action="receipts"]')!
    const pop = root.querySelector<HTMLElement>('#ft-receipts-pop')!
    expect(open.textContent).toBe(strings.en.receipts)
    expect(pop.hidden).toBe(true)
    open.click() // a popover over the scene: the buttons stay where they are
    expect(pop.hidden).toBe(false)
    expect(pop.querySelectorAll('.receipt')).toHaveLength(1)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(pop.hidden).toBe(true)
    // without a rect from the stage, the source is a small slip among the buttons
    expect(root.querySelector('.paper-result__actions [data-action="source"]')!.textContent).toBe(strings.en.source)
  })

  it('a verdict that leads on has no Next: a tap on the room, Space or Enter sends the paper on, and the source card reports itself', () => {
    const e = era()
    const root = mount()
    const on = { ...handlers(), toss: vi.fn(), pop: vi.fn() }
    renderDay(root, props(e, chapter(e, { day: 2, phase: 'stamped', lastCorrect: true, lastVerdict: 'asli' }), {
      revealed: true,
      onPaper: { mirror: 'Right · This message was genuine', sourceRect: rect, sources: [{ id: 's1', loc: 'p. 2' }], auto: true },
    }), on)
    const screen = root.querySelector<HTMLElement>('.screen--day')!
    expect(root.querySelector('[data-action="next"]')).toBeNull()
    expect(root.querySelector('.paper-result__actions')!.children).toHaveLength(0) // nothing waits under the paper
    expect(screen.classList.contains('is-auto')).toBe(true)
    root.querySelector<HTMLElement>('.tapcatch')!.dispatchEvent(new Event('pointerdown'))
    expect(on.toss).toHaveBeenCalledTimes(1)
    expect(on.skip).not.toHaveBeenCalled()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }))
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    expect(on.toss).toHaveBeenCalledTimes(3)
    // a focused control keeps its own keys; the stamp keys stay asleep
    const src = root.querySelector<HTMLButtonElement>('.source-hit')!
    src.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
    expect(on.toss).toHaveBeenCalledTimes(3)
    expect(on.stamp).not.toHaveBeenCalled()
    // the source card opening and closing is reported, so the hold can wait for it (by touch)
    const tapOn = (el: HTMLElement) => {
      el.dispatchEvent(new Event('pointerdown', { bubbles: true }))
      el.click()
    }
    tapOn(src)
    expect(on.pop).toHaveBeenLastCalledWith(true)
    tapOn(root.querySelector<HTMLElement>('[data-action="close-source"]')!)
    expect(on.pop).toHaveBeenLastCalledWith(false)
    // by keyboard, Escape closes it and the player lands back on the source line, which still holds
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
    src.click()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(on.pop).toHaveBeenLastCalledWith(true)
    src.blur()
    expect(on.pop).toHaveBeenLastCalledWith(false)
    // on its way to the basket, the source button goes with the paper
    setTossing(root)
    expect(screen.classList.contains('is-tossing')).toBe(true)
  })

  it('a keyboard player on the source line holds a verdict that leads on; a tap’s focus does not', () => {
    const e = era()
    const root = mount()
    const on = { ...handlers(), toss: vi.fn(), pop: vi.fn() }
    renderDay(root, props(e, chapter(e, { day: 2, phase: 'stamped', lastCorrect: true, lastVerdict: 'asli' }), {
      revealed: true,
      onPaper: { mirror: 'Right', sourceRect: rect, sources: [{ id: 's1', loc: 'p. 2' }], auto: true },
    }), on)
    const src = root.querySelector<HTMLButtonElement>('.source-hit')!
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }))
    src.focus()
    expect(on.pop).toHaveBeenLastCalledWith(true)
    src.blur()
    expect(on.pop).toHaveBeenLastCalledWith(false)
    on.pop.mockClear()
    src.dispatchEvent(new Event('pointerdown', { bubbles: true })) // focus from a tap
    src.focus()
    expect(on.pop).not.toHaveBeenCalled()
  })

  it('a verdict that does not lead on keeps Next, and a tap on the room does nothing', () => {
    const e = era()
    const root = mount()
    const on = { ...handlers(), toss: vi.fn() }
    renderDay(root, props(e, chapter(e, { day: 2, phase: 'stamped', lastCorrect: false, lastVerdict: 'asli' }), {
      revealed: true,
      onPaper: { mirror: 'Wrong', sourceRect: rect, sources: [{ id: 's1', loc: 'p. 2' }] },
    }), on)
    expect(root.querySelector('[data-action="next"]')).not.toBeNull()
    expect(root.querySelector('.screen--day')!.classList.contains('is-auto')).toBe(false)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }))
    expect(on.toss).not.toHaveBeenCalled()
  })

  it('closes the source and receipts cards by touch: their close slip or a tap on the shade', () => {
    const e = era()
    const root = mount()
    renderDay(root, props(e, chapter(e, { day: 1, phase: 'caught', lastCorrect: false, lastVerdict: 'tota' }), {
      revealed: true,
      onPaper: { mirror: 'Wrong', sourceRect: rect, sources: [{ id: 's1', loc: 'p. 14' }], end: { receipts: e.receipts } },
    }), { ...handlers(), again: vi.fn(), home: vi.fn(), share: vi.fn() })
    const src = root.querySelector<HTMLButtonElement>('[data-action="source"]')!
    const source = root.querySelector<HTMLElement>('#ft-source-pop')!
    const receipts = root.querySelector<HTMLElement>('#ft-receipts-pop')!
    const shade = root.querySelector<HTMLElement>('.pop-scrim')!
    expect(shade.hidden).toBe(true)

    src.click()
    expect(source.hidden).toBe(false)
    expect(shade.hidden).toBe(false)
    expect(src.getAttribute('aria-expanded')).toBe('true')
    expect(document.activeElement).toBe(source.querySelector('[data-action="close-source"]'))
    source.querySelector<HTMLButtonElement>('[data-action="close-source"]')!.click()
    expect(source.hidden).toBe(true)
    expect(shade.hidden).toBe(true)
    expect(src.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(src) // focus goes back to what opened it

    root.querySelector<HTMLButtonElement>('[data-action="receipts"]')!.click()
    expect(receipts.hidden).toBe(false)
    src.click() // one card at a time
    expect(receipts.hidden).toBe(true)
    expect(source.hidden).toBe(false)
    shade.click()
    expect(source.hidden).toBe(true)
    expect(shade.hidden).toBe(true)
  })
})
