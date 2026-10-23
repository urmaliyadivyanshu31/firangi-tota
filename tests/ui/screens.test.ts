import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderMain, suggestedEra, type MainProps } from '../../src/ui/screens/main'
import { renderCredits } from '../../src/ui/screens/credits'
import { controlCluster } from '../../src/ui/controls'
import { setLang } from '../../src/i18n/lang'
import { strings } from '../../src/i18n/strings'
import { DAYS, TIMER_S } from '../../src/game/config'
import { fourEras, mount } from './helpers'

beforeEach(() => setLang('en'))

const click = (root: HTMLElement, sel: string) => root.querySelector<HTMLElement>(sel)!.click()
const handlers = () => ({ select: vi.fn(), difficulty: vi.fn(), begin: vi.fn(), credits: vi.fn() })
const props = (over: Partial<MainProps> = {}): MainProps => ({ eras: fourEras(), best: {}, selected: 'delhi-1857', difficulty: 'easy', ...over })

describe('renderMain: the one page', () => {
  it('is one period document: the title, the hook, four chapter tabs in order, and the chosen chapter', () => {
    const root = mount()
    renderMain(root, props(), handlers())
    const doc = root.querySelector<HTMLElement>('article.doc')!
    expect(doc.classList.contains('doc--petition')).toBe(true) // 1857's paper is a court petition
    expect(doc.querySelector('.home__title .sr-only')!.textContent).toBe('Firangi Tota')
    expect(doc.querySelector('.lettering svg.lettering__parrot .parrot__eye')).not.toBeNull()
    expect(doc.querySelector('.doc__hook')!.textContent).toBe(strings.en.premise)
    const tabs = [...doc.querySelectorAll<HTMLElement>('[role="tab"]')]
    expect(tabs.map((t) => t.dataset.era)).toEqual(['delhi-1857', 'lahore-1929', 'bombay-1942', 'delhi-1947'])
    expect(tabs.map((t) => t.getAttribute('aria-selected'))).toEqual(['true', 'false', 'false', 'false'])
    expect(doc.querySelector('[role="tabpanel"]')!.textContent).toContain(fourEras().find((e) => e.id === 'delhi-1857')!.persona.en)
  })

  it('takes the chosen era’s own paper and its artefact tab', () => {
    const root = mount()
    renderMain(root, props({ selected: 'delhi-1947' }), handlers())
    expect(root.querySelector('article.doc')!.classList.contains('doc--telegram')).toBe(true)
    expect(root.querySelector('[data-era="delhi-1857"] .art--seal')).not.toBeNull()
    expect(root.querySelector('[data-era="lahore-1929"] .art--leaflet')).not.toBeNull()
    expect(root.querySelector('[data-era="bombay-1942"] .art--dial .art__needle')).not.toBeNull()
    expect(root.querySelector('[data-era="delhi-1947"] .art--strip')).not.toBeNull()
  })

  it('shows you and the Tota in one line each, the days picker and Begin', () => {
    const root = mount()
    const e = fourEras().find((x) => x.id === 'delhi-1857')!
    renderMain(root, props({ difficulty: 'medium' }), handlers())
    const lines = [...root.querySelectorAll('.doc__line')].map((l) => l.textContent)
    expect(lines).toEqual([`You: ${e.persona.en}`, `Tota: ${e.forger.en}`])
    for (const d of ['easy', 'medium', 'hard'] as const) {
      const b = root.querySelector<HTMLElement>(`[data-mode="${d}"]`)!
      expect(b.textContent).toContain(String(DAYS[d]))
      expect(b.textContent).toContain(String(TIMER_S[d]))
      expect(b.getAttribute('aria-checked')).toBe(String(d === 'medium'))
    }
    expect(root.querySelector('[data-action="begin"]')!.textContent).toBe(strings.en.begin)
    expect(root.querySelector('[data-action="credits"]')!.textContent).toBe(strings.en.homeCredits)
    expect(root.querySelector('[data-action="daily"]')).toBeNull() // Aaj ka Taar is off the main page
  })

  it('wires chapter, days, Begin and credits', () => {
    const root = mount()
    const on = handlers()
    renderMain(root, props(), on)
    click(root, '[data-era="bombay-1942"]')
    click(root, '[data-mode="hard"]')
    click(root, '[data-action="begin"]')
    click(root, '[data-action="credits"]')
    expect(on.select).toHaveBeenCalledWith('bombay-1942')
    expect(on.difficulty).toHaveBeenCalledWith('hard')
    expect(on.begin).toHaveBeenCalledTimes(1)
    expect(on.credits).toHaveBeenCalledTimes(1)
  })

  it('answers the keyboard: arrows switch chapter, 1/2/3 pick the days, Enter begins', () => {
    const root = mount()
    const on = handlers()
    renderMain(root, props({ selected: 'delhi-1857' }), on)
    const key = (k: string) => document.dispatchEvent(new KeyboardEvent('keydown', { key: k }))
    key('ArrowRight')
    key('ArrowLeft')
    key('3')
    key('Enter')
    expect(on.select.mock.calls).toEqual([['lahore-1929'], ['delhi-1947']])
    expect(on.difficulty).toHaveBeenCalledWith('hard')
    expect(on.begin).toHaveBeenCalledTimes(1)
  })

  it('marks a survived chapter with an ink tick and a best run with a pencil tally', () => {
    const root = mount()
    renderMain(root, props({ best: { 'delhi-1857': { difficulty: 'easy', days: 7 }, 'lahore-1929': { difficulty: 'medium', days: 4 } } }), handlers())
    expect(root.querySelector('[data-era="delhi-1857"] .chapter__mark.is-done svg.tick')).not.toBeNull()
    expect(root.querySelector('[data-era="lahore-1929"] .chapter__mark svg.tally')).not.toBeNull()
    expect(root.querySelector('[data-era="delhi-1857"]')!.textContent).toContain('Survived Easy')
    expect(root.querySelector('[data-era="lahore-1929"]')!.textContent).toContain('Best: 4 days on Medium')
  })

  it('suggests the first chapter not yet survived', () => {
    const eras = fourEras()
    expect(suggestedEra(eras, { 'delhi-1857': { difficulty: 'easy', days: 7 } })!.id).toBe('lahore-1929')
    expect(suggestedEra(eras, {})!.id).toBe('delhi-1857')
  })
})

describe('the sound and language plaques', () => {
  it('shows both languages with the current one pressed, and a horn for sound', () => {
    const root = mount()
    const on = { sound: vi.fn(), lang: vi.fn() }
    root.appendChild(controlCluster({ soundOn: true, lang: 'hi' }, on))
    const opts = [...root.querySelectorAll<HTMLButtonElement>('.langswitch__opt')]
    expect(opts.map((o) => o.textContent)).toEqual(['हिंदी', 'English'])
    expect(opts.map((o) => o.getAttribute('aria-pressed'))).toEqual(['true', 'false'])
    opts[0]!.click() // the current one does nothing
    opts[1]!.click()
    expect(on.lang.mock.calls).toEqual([['en']])
    const horn = root.querySelector<HTMLButtonElement>('[data-action="sound"]')!
    expect(horn.getAttribute('aria-label')).toBe(strings.hi.sound)
    expect(horn.getAttribute('aria-pressed')).toBe('true')
    horn.click()
    expect(on.sound).toHaveBeenCalledTimes(1)
  })
})

describe('renderCredits', () => {
  it('credits the inspiration, states the licences and points to CREDITS.md', () => {
    const root = mount()
    const back = vi.fn()
    renderCredits(root, { back })
    const link = root.querySelector<HTMLAnchorElement>('a[href="https://github.com/atomiquest/Politburo-or-Parrot"]')!
    expect(link).not.toBeNull()
    expect(root.textContent).toContain('Inspired by Politburo or Parrot by atomiquest')
    expect(root.textContent).toContain('MIT')
    expect(root.textContent).toContain('CC BY 4.0')
    expect(root.textContent).toContain('CREDITS.md')
    click(root, '[data-action="back"]')
    expect(back).toHaveBeenCalledTimes(1)
  })

  it('shows the CREDITS.md content: every font and recording with its source link and licence', () => {
    setLang('hi')
    const root = mount()
    renderCredits(root, { back: vi.fn() })
    const doc = root.querySelector<HTMLElement>('.credits__doc')!
    expect(doc).not.toBeNull()
    expect(doc.getAttribute('lang')).toBe('en') // the legal record stays in English
    expect(doc.textContent).toContain('Mukta')
    expect(doc.textContent).toContain('SIL Open Font License 1.1')
    expect(doc.textContent).toContain('Apache License 2.0')
    expect(doc.textContent).toContain('CC0 1.0')
    expect(doc.querySelector('a[href="https://fonts.google.com/specimen/Mukta"]')).not.toBeNull()
    expect(doc.querySelector('a[href="https://freesound.org/people/MrFossy/sounds/521773/"]')).not.toBeNull()
    for (const a of doc.querySelectorAll('a')) {
      expect(a.getAttribute('href')).toMatch(/^https:\/\//)
      expect(a.getAttribute('rel')).toBe('noopener noreferrer')
    }
  })
})
