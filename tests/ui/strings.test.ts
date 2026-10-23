import { describe, expect, it } from 'vitest'
import { DISPLAY_KEYS, strings, t, tf } from '../../src/i18n/strings'
import { getLang, hasLang, setLang } from '../../src/i18n/lang'

describe('strings', () => {
  it('has every key in both languages, non-empty', () => {
    const en = Object.keys(strings.en).sort()
    const hi = Object.keys(strings.hi).sort()
    expect(hi).toEqual(en)
    for (const lang of ['en', 'hi'] as const) {
      for (const [k, v] of Object.entries(strings[lang])) expect(v.trim(), `${lang}.${k}`).not.toBe('')
    }
  })

  it('writes Hindi with Latin digits only', () => {
    for (const [k, v] of Object.entries(strings.hi)) expect(v, k).not.toMatch(/[०-९]/)
  })

  it('never ends display copy with a full stop', () => {
    expect(DISPLAY_KEYS.length).toBeGreaterThan(20)
    for (const lang of ['en', 'hi'] as const) {
      for (const k of DISPLAY_KEYS) expect(strings[lang][k], `${lang}.${k}`).not.toMatch(/[.।]$/)
    }
  })

  it('t looks up and tf fills {placeholders}', () => {
    expect(t('asli', 'en')).toBe('ASLI')
    expect(t('asli', 'hi')).toBe('असली')
    expect(tf('dayOf', 'en', { n: 3, total: 7 })).toBe('Day 3 of 7')
    expect(tf('dayOf', 'hi', { n: 3, total: 7 })).toContain('3')
  })
})

describe('lang', () => {
  it('remembers a pick and sets <html lang>', () => {
    localStorage.clear()
    expect(hasLang()).toBe(false)
    setLang('hi')
    expect(getLang()).toBe('hi')
    expect(hasLang()).toBe(true)
    expect(document.documentElement.lang).toBe('hi')
    setLang('en')
    expect(getLang()).toBe('en')
  })
})
