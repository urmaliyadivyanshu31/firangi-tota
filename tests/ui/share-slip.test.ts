import { afterEach, describe, expect, it, vi } from 'vitest'
import { strings } from '../../src/i18n/strings'
import { closeShareSlip, openShareSlip } from '../../src/ui/share-slip'
import { era } from './helpers'

const URL_ = 'https://firangitota.com/s/1857-e7s-en'
const TEXT = "🦜 I held out all 7 days in Bahadur Shah Zafar's darbar, Delhi 1857\nYour turn, can you spot the Tota?"

async function flush(): Promise<void> {
  for (let i = 0; i < 4; i++) await new Promise((r) => setTimeout(r, 0))
}

const slip = () => document.querySelector<HTMLElement>('.share-slip')
const way = (k: string) => document.querySelector<HTMLElement>(`[data-share="${k}"]`)

afterEach(() => {
  closeShareSlip()
  vi.useRealTimers()
  document.body.innerHTML = ''
})

describe('the share slip', () => {
  it('is a post card with the post, the link and the four ways to send it, each with its logo', () => {
    const native = vi.fn(() => Promise.resolve('shared' as const))
    openShareSlip({ era: era(), lang: 'en', text: TEXT, url: URL_ }, { copy: vi.fn(() => Promise.resolve(true)), native })
    const s = slip()!
    expect(s.getAttribute('role')).toBe('dialog')
    expect(s.getAttribute('aria-modal')).toBe('true')
    expect(s.querySelector('.share-slip__title')!.textContent).toBe(strings.en.sharePostcard)
    expect(s.querySelector('.share-slip__msg')!.textContent).toBe(TEXT)
    expect(s.querySelector('.share-slip__link')!.textContent).toBe('firangitota.com/s/1857-e7s-en')
    expect(s.querySelector('.share-stamp .share-stamp__parrot')).not.toBeNull()
    expect(s.querySelector('.share-stamp__mark')!.textContent).toBe(era().year)
    for (const k of ['whatsapp', 'x', 'copy', 'native']) expect(way(k)!.querySelector('svg.share-way__icon'), k).not.toBeNull()
    const wa = way('whatsapp') as HTMLAnchorElement
    expect(wa.getAttribute('href')).toBe(`https://wa.me/?text=${encodeURIComponent(`${TEXT}\n${URL_}`)}`)
    expect(wa.target).toBe('_blank')
    expect(wa.rel).toBe('noopener noreferrer')
    expect(wa.getAttribute('aria-label')).toBe(strings.en.shareWhatsApp)
    const x = new URL((way('x') as HTMLAnchorElement).href)
    expect(x.searchParams.get('url')).toBe(URL_)
    expect(x.searchParams.get('text')).toBe(TEXT)
    expect(document.activeElement).toBe(wa) // the keyboard starts on the first way
  })

  it('shows the phone’s own share menu only when the browser has one, and closes once it has shared', async () => {
    openShareSlip({ era: era(), lang: 'en', text: TEXT, url: URL_ }, { copy: vi.fn(() => Promise.resolve(true)) })
    expect(way('native')).toBeNull()
    expect(document.querySelector('.share-slip__ways--odd')).not.toBeNull() // the odd way spans the row
    const native = vi.fn((): Promise<'shared' | 'cancelled' | 'failed'> => Promise.resolve('cancelled'))
    openShareSlip({ era: era(), lang: 'en', text: TEXT, url: URL_ }, { copy: vi.fn(() => Promise.resolve(true)), native })
    expect(document.querySelectorAll('.share-slip')).toHaveLength(1) // a second open replaces the first
    way('native')!.click()
    await flush()
    expect(native).toHaveBeenCalledTimes(1)
    expect(slip()).not.toBeNull() // cancelled: still up
    native.mockImplementation(() => Promise.resolve('shared' as const))
    way('native')!.click()
    await flush()
    expect(slip()).toBeNull()
  })

  it('copies the link and says so on the chit for a moment, or selects the link when it cannot', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    const copy = vi.fn(() => Promise.resolve(true))
    openShareSlip({ era: era(), lang: 'hi', text: TEXT, url: URL_ }, { copy })
    way('copy')!.click()
    await vi.advanceTimersByTimeAsync(0)
    expect(copy).toHaveBeenCalledWith(URL_)
    expect(way('copy')!.classList.contains('is-done')).toBe(true)
    expect(way('copy')!.textContent).toBe(strings.hi.copied)
    expect(document.querySelector('.share-slip__note')!.textContent).toBe(strings.hi.copied)
    await vi.advanceTimersByTimeAsync(2500)
    expect(way('copy')!.textContent).toBe(strings.hi.shareCopy)
    expect(way('copy')!.classList.contains('is-done')).toBe(false)

    copy.mockImplementation(() => Promise.resolve(false))
    way('copy')!.click()
    await vi.advanceTimersByTimeAsync(0)
    expect(document.querySelector('.share-slip__note')!.textContent).toBe(strings.hi.copyFailed)
    expect(window.getSelection()?.toString()).toBe('firangitota.com/s/1857-e7s-en')
  })

  it('closes on Escape, on the shade and on its close chit, and gives focus back to what opened it', () => {
    const opener = document.createElement('button')
    document.body.appendChild(opener)
    for (const close of [
      () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })),
      () => document.querySelector<HTMLElement>('.share-scrim')!.click(),
      () => document.querySelector<HTMLElement>('[data-action="close-share"]')!.click(),
    ]) {
      opener.focus()
      openShareSlip({ era: era(), lang: 'en', text: TEXT, url: URL_ }, { copy: vi.fn(() => Promise.resolve(true)) })
      expect(slip()).not.toBeNull()
      close()
      expect(slip()).toBeNull()
      expect(document.activeElement).toBe(opener)
    }
    expect(closeShareSlip()).toBe(false)
  })

  it('keeps Tab on the slip while it is up', () => {
    openShareSlip({ era: era(), lang: 'en', text: TEXT, url: URL_ }, { copy: vi.fn(() => Promise.resolve(true)) })
    const close = document.querySelector<HTMLElement>('[data-action="close-share"]')!
    close.focus()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))
    expect(document.activeElement).toBe(way('whatsapp'))
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }))
    expect(document.activeElement).toBe(close)
  })

  it('puts the post on the card as text, never as markup', () => {
    openShareSlip({ era: era(), lang: 'en', text: '<img src=x onerror="alert(1)">', url: URL_ }, { copy: vi.fn(() => Promise.resolve(true)) })
    expect(slip()!.querySelector('img')).toBeNull()
    expect(slip()!.querySelector('.share-slip__msg')!.textContent).toBe('<img src=x onerror="alert(1)">')
  })
})
