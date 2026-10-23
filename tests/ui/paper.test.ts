import { describe, expect, it } from 'vitest'
import { paperEl, messageText } from '../../src/ui/paper'
import { strings } from '../../src/i18n/strings'
import { era, msgById } from './helpers'

const ISO = '1857-05-11'
const marks = (el: HTMLElement) => [...el.querySelectorAll('mark.pencil')].map((m) => m.textContent)

describe('paperEl', () => {
  it('fills date placeholders in the message text', () => {
    const e = era()
    const el = paperEl(msgById(e, 'm1'), e, ISO, 'en', false)
    expect(el.textContent).toContain('On 11 May 1857 the guards changed at the gate.')
    expect(messageText(msgById(e, 'm1'), ISO, 'hi')).toBe('11 मई 1857 को फाटक पर पहरेदार बदले गए।')
  })

  it('wraps exactly each checks.hi substring in <mark class="pencil"> when pencil is on', () => {
    const e = era()
    expect(marks(paperEl(msgById(e, 'm1'), e, ISO, 'hi', true))).toEqual(['पहरेदार बदले'])
    expect(marks(paperEl(msgById(e, 'm2'), e, ISO, 'hi', true))).toEqual(['लाहौर में लगा'])
  })

  it('marks every check, in reading order, and keeps the full text intact', () => {
    const e = era()
    const m = msgById(e, 'm2')
    m.checks = { en: ['Lahore', 'On'], hi: ['लाहौर'] }
    const el = paperEl(m, e, ISO, 'en', true)
    expect(marks(el)).toEqual(['On', 'Lahore'])
    expect(el.querySelector('.paper__text')!.textContent).toBe('On 11 May 1857 the court sat in Lahore.')
  })

  it('has no pencil marks when pencil is off', () => {
    const e = era()
    expect(marks(paperEl(msgById(e, 'm1'), e, ISO, 'hi', false))).toEqual([])
  })

  it('shows sender and addressee', () => {
    const e = era()
    const el = paperEl(msgById(e, 'm1'), e, ISO, 'hi', false)
    expect(el.textContent).toContain('सूबेदार')
    expect(el.textContent).toContain('मुंशी')
  })

  it('styles the paper by channel', () => {
    const e = era()
    const m = msgById(e, 'm1')
    const petition = paperEl(m, e, ISO, 'en', false)
    expect(petition.classList.contains('paper--petition')).toBe(true)
    expect(petition.querySelector('.paper__seal')).not.toBeNull()
    expect(petition.textContent).toContain(strings.en.petitionClose)

    const note = paperEl(m, { ...e, channel: 'note' }, ISO, 'en', false)
    expect(note.classList.contains('paper--note')).toBe(true)

    const radio = paperEl(m, { ...e, channel: 'radio' }, ISO, 'en', false)
    expect(radio.classList.contains('paper--radio')).toBe(true)
    expect(radio.textContent).toContain(strings.en.radioHead)

    const tel = paperEl(m, { ...e, channel: 'telegram' }, ISO, 'hi', false)
    expect(tel.classList.contains('paper--telegram')).toBe(true)
    expect(tel.textContent).toContain(strings.hi.telegramHead)
    expect(tel.querySelector('.paper__number')!.textContent).toMatch(/\d{4}/)
    // the number is stable for a message
    const again = paperEl(m, { ...e, channel: 'telegram' }, ISO, 'hi', false)
    expect(again.querySelector('.paper__number')!.textContent).toBe(tel.querySelector('.paper__number')!.textContent)
  })

  it('marks the paper language for fonts and screen readers', () => {
    const e = era()
    expect(paperEl(msgById(e, 'm1'), e, ISO, 'hi', false).getAttribute('lang')).toBe('hi')
  })
})
