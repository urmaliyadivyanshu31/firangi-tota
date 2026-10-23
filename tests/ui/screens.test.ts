import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderLanguage } from '../../src/ui/screens/language'
import { renderHome } from '../../src/ui/screens/home'
import { renderSetup } from '../../src/ui/screens/setup'
import { renderIntro } from '../../src/ui/screens/intro'
import { renderCredits } from '../../src/ui/screens/credits'
import { setLang } from '../../src/i18n/lang'
import { strings } from '../../src/i18n/strings'
import { DAYS, TIMER_S } from '../../src/game/config'
import { era, fourEras, mount } from './helpers'

beforeEach(() => setLang('en'))

const click = (root: HTMLElement, sel: string) => root.querySelector<HTMLElement>(sel)!.click()

describe('renderLanguage', () => {
  it('shows two big buttons, हिंदी and English, and reports the pick', () => {
    const root = mount()
    const pick = vi.fn()
    renderLanguage(root, { pick })
    const buttons = [...root.querySelectorAll('button')]
    expect(buttons.map((b) => b.textContent!.trim())).toEqual(['हिंदी', 'English'])
    buttons[0]!.click()
    buttons[1]!.click()
    expect(pick.mock.calls).toEqual([['hi'], ['en']])
  })
})

describe('renderHome', () => {
  const handlers = () => ({ chapter: vi.fn(), daily: vi.fn(), continue: vi.fn(), lang: vi.fn(), sound: vi.fn(), credits: vi.fn() })

  it('shows the title lettering with the parrot, one premise line and the chapter tiles in order', () => {
    const root = mount()
    renderHome(root, { eras: fourEras(), best: {}, dailyDone: false }, handlers())
    expect(root.querySelector('.home__title .sr-only')!.textContent).toBe('Firangi Tota')
    expect(root.querySelector('.lettering')!.textContent).toContain('फ़िरंगी तोता')
    expect(root.querySelector('.lettering svg.lettering__parrot .parrot__eye')).not.toBeNull()
    expect(root.querySelector('.home__premise')!.textContent).toBe(strings.en.premise)
    const ids = [...root.querySelectorAll<HTMLElement>('[data-era]')].map((c) => c.dataset.era)
    expect(ids).toEqual(['delhi-1857', 'lahore-1929', 'bombay-1942', 'delhi-1947'])
  })

  it('keeps each tile to its year and place, with its own period artefact', () => {
    const root = mount()
    const eras = fourEras()
    renderHome(root, { eras, best: {}, dailyDone: false }, handlers())
    const tile = (id: string) => root.querySelector<HTMLElement>(`[data-era="${id}"]`)!
    const e = eras.find((x) => x.id === 'delhi-1857')!
    expect(tile('delhi-1857').textContent).toBe(`${e.year}${e.place.en}`)
    expect(tile('delhi-1857').querySelector('.art--seal')).not.toBeNull()
    expect(tile('lahore-1929').querySelector('.art--leaflet')).not.toBeNull()
    expect(tile('bombay-1942').querySelector('.art--dial .art__needle')).not.toBeNull()
    expect(tile('delhi-1947').querySelector('.art--strip')).not.toBeNull()
  })

  it('wires chapter, daily, continue, language, sound and credits', () => {
    const root = mount()
    const on = handlers()
    renderHome(root, { eras: fourEras(), best: {}, dailyDone: false }, on)
    click(root, '[data-era="bombay-1942"]')
    click(root, '[data-action="daily"]')
    click(root, '[data-action="continue"]')
    click(root, '[data-action="lang"]')
    click(root, '[data-action="sound"]')
    click(root, '[data-action="credits"]')
    expect(on.chapter).toHaveBeenCalledWith('bombay-1942')
    for (const f of [on.daily, on.continue, on.lang, on.sound, on.credits]) expect(f).toHaveBeenCalledTimes(1)
  })

  it('shows the Aaj ka Taar card, and whether today is done', () => {
    const root = mount()
    renderHome(root, { eras: fourEras(), best: {}, dailyDone: false }, handlers())
    const card = () => root.querySelector<HTMLElement>('[data-action="daily"]')!
    expect(card().textContent).toContain(strings.en.dailyTitle)
    expect(card().textContent).not.toContain(strings.en.dailyDone)
    renderHome(root, { eras: fourEras(), best: {}, dailyDone: true }, handlers())
    expect(card().textContent).toContain(strings.en.dailyDone)
  })

  it('suggests the first chapter not yet survived, and shows bests', () => {
    const root = mount()
    renderHome(root, { eras: fourEras(), best: { 'delhi-1857': { difficulty: 'easy', days: 7 }, 'lahore-1929': { difficulty: 'medium', days: 4 } }, dailyDone: false }, handlers())
    expect(root.querySelector('[data-action="continue"]')!.textContent).toContain('1929')
    expect(root.querySelector('[data-era="delhi-1857"]')!.textContent).toContain(strings.en.modeEasy)
    expect(root.querySelector('[data-era="lahore-1929"]')!.textContent).toContain('4')
    // survived: an ink tick on the tile; a best run: a pencilled 4/10
    expect(root.querySelector('[data-era="delhi-1857"] .chapter__mark.is-done svg')).not.toBeNull()
    expect(root.querySelector('[data-era="lahore-1929"] .chapter__mark')!.textContent).toBe('4/10')
  })

  it('offers the other language on the language button', () => {
    const root = mount()
    renderHome(root, { eras: fourEras(), best: {}, dailyDone: false }, handlers())
    expect(root.querySelector('[data-action="lang"]')!.textContent).toContain('हिंदी')
    setLang('hi')
    renderHome(root, { eras: fourEras(), best: {}, dailyDone: false }, handlers())
    expect(root.querySelector('[data-action="lang"]')!.textContent).toContain('English')
  })
})

describe('renderSetup', () => {
  it('offers the three modes with their days and seconds', () => {
    const root = mount()
    const on = { start: vi.fn(), back: vi.fn() }
    renderSetup(root, { era: era() }, on)
    for (const d of ['easy', 'medium', 'hard'] as const) {
      const b = root.querySelector<HTMLElement>(`[data-mode="${d}"]`)!
      expect(b.textContent).toContain(String(DAYS[d]))
      expect(b.textContent).toContain(String(TIMER_S[d]))
    }
    click(root, '[data-mode="medium"]')
    click(root, '[data-action="back"]')
    expect(on.start).toHaveBeenCalledWith('medium')
    expect(on.back).toHaveBeenCalledTimes(1)
  })
})

describe('renderIntro', () => {
  it('shows two short screens, then calls next()', () => {
    const root = mount()
    const next = vi.fn()
    const e = era()
    renderIntro(root, { era: e }, { next })
    expect(root.textContent).toContain(e.intro[0].en)
    expect(root.textContent).toContain(e.persona.en)
    click(root, '[data-action="next"]')
    expect(next).not.toHaveBeenCalled()
    expect(root.textContent).toContain(e.intro[1].en)
    click(root, '[data-action="next"]')
    expect(next).toHaveBeenCalledTimes(1)
  })

  it('explains the stamps and the stakes on the second card', () => {
    const root = mount()
    renderIntro(root, { era: era() }, { next: vi.fn() })
    click(root, '[data-action="next"]')
    expect(root.textContent).toContain(strings.en.introHow)
    expect(root.textContent).toContain(strings.en.introStakes)
    expect(root.querySelector('[data-action="next"]')!.textContent).toBe(strings.en.begin)
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
