import { describe, expect, it, vi } from 'vitest'
import { firstUseUrls, warmFirstUseCache } from '../src/offline'

const ORIGIN = 'https://firangitota.com'
const entries = [
  `${ORIGIN}/fonts/mukta-400-devanagari.woff2`,
  `${ORIGIN}/fonts/mukta-400-devanagari.woff2`, // twice: fetched once
  `${ORIGIN}/audio/delhi-1857.m4a`,
  `${ORIGIN}/audio/typewriter.wav`,
  `${ORIGIN}/assets/note-hand-BReeFzZA.woff2`,
  `${ORIGIN}/assets/index-abc.js`,
  `${ORIGIN}/api/voice?era=delhi-1857&id=x&lang=en&day=1&v=00000000`,
  `${ORIGIN}/index.html`,
  'https://elsewhere.example/fonts/x.woff2',
  'not a url',
].map((name) => ({ name }))

describe('the first-use cache, made whole after the first visit', () => {
  it('picks the room recordings and font files, never read-aloud, scripts or other sites', () => {
    expect(firstUseUrls(entries, ORIGIN)).toEqual([
      '/fonts/mukta-400-devanagari.woff2',
      '/audio/delhi-1857.m4a',
      '/audio/typewriter.wav',
      '/assets/note-hand-BReeFzZA.woff2',
    ])
  })

  function fakeWindow(controller: unknown) {
    const target = new EventTarget()
    const fetch = vi.fn((_url: string) => Promise.resolve(new Response('')))
    const win = {
      navigator: { serviceWorker: Object.assign(target, { controller }) },
      performance: { getEntriesByType: (t: string) => (t === 'resource' ? entries : []) },
      location: { origin: ORIGIN },
      fetch,
    } as unknown as Window
    return { win, target, fetch }
  }

  it('fetches them again through the worker once it takes control of the first visit', () => {
    const { win, target, fetch } = fakeWindow(null)
    warmFirstUseCache(win)
    expect(fetch).not.toHaveBeenCalled()
    target.dispatchEvent(new Event('controllerchange'))
    expect(fetch.mock.calls.map((c) => c[0])).toEqual(firstUseUrls(entries, ORIGIN))
    target.dispatchEvent(new Event('controllerchange'))
    expect(fetch).toHaveBeenCalledTimes(4) // once only
  })

  it('does nothing on a later visit (already controlled) or without service workers', () => {
    const later = fakeWindow({})
    warmFirstUseCache(later.win)
    later.target.dispatchEvent(new Event('controllerchange'))
    expect(later.fetch).not.toHaveBeenCalled()
    const fetch = vi.fn()
    expect(() => warmFirstUseCache({ navigator: {}, fetch } as unknown as Window)).not.toThrow()
    expect(fetch).not.toHaveBeenCalled()
  })
})
