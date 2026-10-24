// @vitest-environment node
// Share links and their cards: strict codes, canonical redirects, the crawler-facing page, and a
// card drawn only from enums and our own content, as glyph outlines.
import type { IncomingMessage, ServerResponse } from 'node:http'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import type { EraId, Lang } from '../../src/content/types'
import { ERA_YEAR, parseShareCode, shareCode, type ShareResult } from '../../src/game/share-code'
import { CARD_H, CARD_W, cardSvg, cardWords, PARROT } from '../../server/og/card'
import { renderCard } from '../../server/og/render'
import { cardFileOf, createOgMiddleware, createShareMiddleware, shareCodeOf } from '../../server/share-http'
import { allShareResults, CARD_FILE_CACHE, CARD_FILE_RE, cardFile, cardRev, gameHref, handleCardFile, handleOgImage, handleSharePage, IMAGE_CACHE, imageQuery, originFor, PAGE_CACHE, REDIRECT_CACHE, titleLine } from '../../server/share'
import { SERVER_ERAS } from '../../server/eras'

const ORIGIN = 'https://firangitota.com'
const R = (over: Partial<ShareResult> = {}): ShareResult => ({ era: 'delhi-1857', mode: 'easy', outcome: 'survived', days: 7, lang: 'en', ...over })
const ERAS = Object.keys(ERA_YEAR) as EraId[]

function fakeRes() {
  const headers: Record<string, string> = {}
  const res = { statusCode: 0, body: undefined as unknown, setHeader: (k: string, v: string) => { headers[k] = v }, end: (b: unknown) => { res.body = b } }
  return { res, headers }
}

/** The page's meta tags, by name or property. */
function metaOf(html: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const m of html.matchAll(/<meta (?:name|property)="([^"]+)" content="([^"]*)">/g)) out[m[1]!] = m[2]!.replace(/&amp;/g, '&').replace(/&#39;/g, "'")
  return out
}

/** Width and height from a JPEG's frame header. */
function jpegSize(buf: Uint8Array): { w: number; h: number } | null {
  const b = Buffer.from(buf)
  let i = 2
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) return null
    const marker = b[i + 1]!
    if (marker >= 0xc0 && marker <= 0xc3) return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) }
    i += 2 + b.readUInt16BE(i + 2)
  }
  return null
}

describe('the share page (/s/<code>)', () => {
  it('serves a canonical code a page that X, WhatsApp and the rest draw as a large image card', () => {
    const res = handleSharePage('1857-e7s-en', ORIGIN)
    expect(res.status).toBe(200)
    expect(res.headers['Content-Type']).toBe('text/html; charset=utf-8')
    expect(res.headers['Cache-Control']).toBe(PAGE_CACHE)
    const html = String(res.body)
    const meta = metaOf(html)
    // the card the build drew, which the CDN answers at once (scripts/og-cards.mjs)
    const image = `${ORIGIN}/og/${cardFile(R())}`
    expect(image).toMatch(/^https:\/\/firangitota\.com\/og\/1857-e7s-en\.[0-9a-f]{8}\.jpg$/)
    expect(meta['twitter:card']).toBe('summary_large_image')
    expect(meta['og:image']).toBe(image)
    expect(meta['og:image:secure_url']).toBe(image)
    expect(meta['twitter:image']).toBe(image)
    expect(meta['og:image:width']).toBe(String(CARD_W))
    expect(meta['og:image:height']).toBe(String(CARD_H))
    expect(meta['og:image:type']).toBe('image/jpeg')
    expect(meta['og:url']).toBe(`${ORIGIN}/s/1857-e7s-en`) // itself, so no crawler wanders off to the home page
    expect(meta['og:title']).toBe('Survived 7/7 days in Delhi 1857 · Firangi Tota')
    expect(meta['twitter:title']).toBe(meta['og:title'])
    expect(meta['og:description']).not.toMatch(/[.।]$/)
    expect(meta['og:image:alt']).toContain('Delhi 1857')
    expect(html).toContain('<html lang="en">')
    expect(html).toContain('<script src="/share-go.js" defer></script>') // humans go on; crawlers stay
    expect(html).toContain('<a href="/?chapter=delhi-1857&amp;mode=easy" data-go>Play Firangi Tota</a>')
    expect(html).not.toMatch(/http-equiv="refresh"/i) // some crawlers follow a refresh to the home page's card
    expect(html).not.toMatch(/<script>|\son\w+=/i) // no inline script for the CSP to refuse
  })

  it('writes the page in the code’s language', () => {
    const meta = metaOf(String(handleSharePage('1947-h3c-hi', ORIGIN).body))
    expect(meta['og:title']).toBe('दिल्ली 1947 · चौथे दिन पकड़े गए · फ़िरंगी तोता')
    expect(meta['og:locale']).toBe('hi_IN')
    expect(titleLine(R({ mode: 'daily', outcome: 'caught', days: 4 }))).toBe('Aaj ka Taar · 4/5 right · Delhi 1857')
    expect(titleLine(R({ era: 'bombay-1942', mode: 'hard', outcome: 'caught', days: 0, lang: 'hi' }))).toBe('बंबई 1942 · पहले दिन पकड़े गए')
  })

  it('sends a near miss to the canonical code and anything else to the plain site, both with a short cache', () => {
    for (const raw of ['1857-E7S-EN', '1857e7sen', '1857-e07s-en']) {
      expect(handleSharePage(raw, ORIGIN)).toEqual({ status: 302, headers: { Location: '/s/1857-e7s-en', 'Cache-Control': REDIRECT_CACHE }, body: '' })
    }
    for (const raw of [null, '', '1857-e6s-en', '9999-e7s-en', '<svg onload=alert(1)>', 'a'.repeat(500), '..%2F..%2Fetc']) {
      expect(handleSharePage(raw, ORIGIN)).toEqual({ status: 302, headers: { Location: '/', 'Cache-Control': REDIRECT_CACHE }, body: '' })
    }
  })

  it('builds absolute URLs only on our own hosts, and on local ones only off Vercel', () => {
    expect(originFor('firangitota.com')).toBe('https://firangitota.com')
    expect(originFor('WWW.FIRANGITOTA.COM')).toBe('https://www.firangitota.com')
    expect(originFor('firangi-tota-git-main-oxdivs-projects.vercel.app')).toBe('https://firangi-tota-git-main-oxdivs-projects.vercel.app')
    for (const h of [undefined, '', 'evil.com', 'firangitota.com.evil.com', 'evil.vercel.app', 'firangitota.com:8080', 'localhost:5183', 'firangitota.com/"><script>']) {
      expect(originFor(h), String(h)).toBe(ORIGIN)
    }
    expect(originFor('localhost:5183', true)).toBe('http://localhost:5183')
    expect(originFor('127.0.0.1:4324', true)).toBe('http://127.0.0.1:4324')
    expect(originFor('localhost.evil.com', true)).toBe(ORIGIN)
  })

  it('sends a friend to the same chapter and mode, or to the daily puzzle', () => {
    expect(gameHref(R({ era: 'lahore-1929', mode: 'hard', outcome: 'caught', days: 3 }))).toBe('/?chapter=lahore-1929&mode=hard')
    expect(gameHref(R({ mode: 'daily', days: 5 }))).toBe('/?daily')
  })

  it('reads the code from the path, or from the query the vercel.json rewrite adds', () => {
    expect(shareCodeOf('/s/1857-e7s-en')).toBe('1857-e7s-en')
    expect(shareCodeOf('/s/1857-e7s-en?utm=x')).toBe('1857-e7s-en')
    expect(shareCodeOf('/api/s?code=1857-e7s-en')).toBe('1857-e7s-en')
    expect(shareCodeOf('/api/s?code=a&code=b')).toBeNull()
    expect(shareCodeOf('/api/s')).toBeNull()
    expect(shareCodeOf(undefined)).toBeNull()
  })

  it('answers GET and HEAD only, using the Host header and never X-Forwarded-Host', () => {
    const mw = createShareMiddleware({ allowLocal: false })
    let { res, headers } = fakeRes()
    mw({ method: 'POST', url: '/s/1857-e7s-en', headers: {} } as IncomingMessage, res as unknown as ServerResponse)
    expect(res.statusCode).toBe(405)
    expect(headers.Allow).toBe('GET, HEAD')
    ;({ res, headers } = fakeRes())
    mw({ method: 'GET', url: '/api/s?code=1857-e7s-en', headers: { host: 'firangi-tota-abc.vercel.app', 'x-forwarded-host': 'evil.com' } } as unknown as IncomingMessage, res as unknown as ServerResponse)
    expect(res.statusCode).toBe(200)
    expect(metaOf(String(res.body))['og:image']).toMatch(/^https:\/\/firangi-tota-abc\.vercel\.app\/og\/1857-e7s-en\.[0-9a-f]{8}\.jpg$/)
  })
})

describe('the card image (/api/og)', () => {
  const render = () => vi.fn(async (_svg: string) => new Uint8Array([0xff, 0xd8, 0xff]))

  it('draws the canonical query once and caches it for a year', async () => {
    const r = render()
    const q = imageQuery(R())
    expect(q).toMatch(/^c=1857-e7s-en&v=[0-9a-f]{8}$/)
    const res = await handleOgImage(q, r)
    expect(res.status).toBe(200)
    expect(res.headers['Content-Type']).toBe('image/jpeg')
    expect(res.headers['Cache-Control']).toBe(IMAGE_CACHE)
    expect(res.headers['Content-Length']).toBe('3')
    expect(r).toHaveBeenCalledWith(cardSvg(R()))
  })

  it('shares one drawing between requests that arrive together', async () => {
    let finish!: (b: Uint8Array) => void
    const r = vi.fn(() => new Promise<Uint8Array>((res) => (finish = res)))
    const q = imageQuery(R({ era: 'delhi-1947', mode: 'hard', outcome: 'caught', days: 3 }))
    const a = handleOgImage(q, r)
    const b = handleOgImage(q, r)
    finish(new Uint8Array([1]))
    expect((await a).status).toBe(200)
    expect((await b).status).toBe(200)
    expect(r).toHaveBeenCalledTimes(1)
  })

  it('redirects any other spelling of a card to its canonical query, and anything else to the site’s own share image', async () => {
    const r = render()
    const canonical = `/api/og?${imageQuery(R())}`
    for (const q of ['c=1857-e7s-en', 'c=1857-e7s-en&v=00000000', `v=${cardRev(R())}&c=1857-e7s-en`, `c=1857-E7S-EN&v=${cardRev(R())}`, `c=1857e7sen&v=${cardRev(R())}`]) {
      expect(await handleOgImage(q, r), q).toEqual({ status: 302, headers: { Location: canonical, 'Cache-Control': REDIRECT_CACHE }, body: '' })
    }
    for (const q of ['', 'c=', 'c=nope', 'c=1857-e6s-en', `c=1857-e7s-en&c=1857-e7s-en`, `c=1857-e7s-en&v=1&v=2`, `c=1857-e7s-en&text=hello`, `c=1857-e7s-en&v=${'f'.repeat(80)}`]) {
      expect(await handleOgImage(q, r), q).toEqual({ status: 302, headers: { Location: '/og.jpg', 'Cache-Control': REDIRECT_CACHE }, body: '' })
    }
    expect(r).not.toHaveBeenCalled()
  })

  it('falls back to the site’s share image, uncached, if a drawing fails', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const res = await handleOgImage(imageQuery(R({ lang: 'hi' })), vi.fn(async () => { throw new Error('boom') }))
    expect(res).toEqual({ status: 302, headers: { Location: '/og.jpg', 'Cache-Control': 'no-store' }, body: '' })
    warn.mockRestore()
  })

  it('answers GET and HEAD only', async () => {
    const mw = createOgMiddleware(render())
    const { res } = fakeRes()
    await mw({ method: 'DELETE', url: `/api/og?${imageQuery(R())}` } as IncomingMessage, res as unknown as ServerResponse)
    expect(res.statusCode).toBe(405)
  })
})

describe('the pre-drawn cards (/og/<code>.<rev>.jpg)', () => {
  const render = () => vi.fn(async (_svg: string) => new Uint8Array([0xff, 0xd8, 0xff]))

  it('lists every result the game can produce, each once, as the build draws them', () => {
    const results = allShareResults()
    expect(results).toHaveLength(4 * 2 * (8 + 11 + 15 + 6)) // as the share-code round trip counts them
    const codes = new Set(results.map(shareCode))
    expect(codes.size).toBe(results.length)
    for (const r of results) expect(parseShareCode(shareCode(r))).toEqual({ result: r, canonical: true })
    const files = new Set(results.map(cardFile))
    expect(files.size).toBe(results.length)
    for (const r of results) {
      expect(cardFile(r)).toMatch(CARD_FILE_RE)
      expect(cardFile(r)).toBe(`${shareCode(r)}.${cardRev(r)}.jpg`) // the same hash as /api/og's v=
    }
  })

  it('every share page names its own pre-drawn card in og:image, og:image:secure_url and twitter:image', () => {
    for (const r of allShareResults()) {
      const meta = metaOf(String(handleSharePage(shareCode(r), ORIGIN).body))
      const image = `${ORIGIN}/og/${cardFile(r)}`
      expect(meta['og:image'], shareCode(r)).toBe(image)
      expect(meta['og:image:secure_url']).toBe(image)
      expect(meta['twitter:image']).toBe(image)
    }
  })

  it('draws a missing file of today’s name on the spot, cached for a year', async () => {
    const r = render()
    const res = await handleCardFile(cardFile(R({ lang: 'hi' })), r)
    expect(res.status).toBe(200)
    expect(res.headers['Content-Type']).toBe('image/jpeg')
    expect(res.headers['Cache-Control']).toBe(IMAGE_CACHE)
    expect(r).toHaveBeenCalledWith(cardSvg(R({ lang: 'hi' })))
  })

  it('sends an older drawing’s name or another spelling to today’s file, and anything else to the site’s own share image', async () => {
    const r = render()
    const today = `/og/${cardFile(R())}`
    for (const name of ['1857-e7s-en.00000000.jpg', '1857-e7s-en.jpg', '1857-E7S-EN.00000000.jpg', `1857e7sen.${cardRev(R())}.jpg`, `1857-e7s-en.${cardRev(R()).toUpperCase()}.jpg`]) {
      expect(await handleCardFile(name, r), name).toEqual({ status: 302, headers: { Location: today, 'Cache-Control': REDIRECT_CACHE }, body: '' })
    }
    for (const name of ['', 'og.jpg', '1857-e6s-en.00000000.jpg', '1857-e7s-en.00000000.png', '..%2F..%2Fpackage.json', `${'a'.repeat(80)}.jpg`, '1857-e7s-en.a.b.jpg']) {
      expect(await handleCardFile(name, r), name).toEqual({ status: 302, headers: { Location: '/og.jpg', 'Cache-Control': REDIRECT_CACHE }, body: '' })
    }
    expect(r).not.toHaveBeenCalled()
  })

  it('reads the file name from the path, or from the query the vercel.json rewrite adds', () => {
    expect(cardFileOf('/og/1857-e7s-en.0a1b2c3d.jpg')).toBe('1857-e7s-en.0a1b2c3d.jpg')
    expect(cardFileOf('/og/1857-e7s-en.0a1b2c3d.jpg?utm=x')).toBe('1857-e7s-en.0a1b2c3d.jpg')
    expect(cardFileOf('/api/og?file=1857-e7s-en.0a1b2c3d.jpg')).toBe('1857-e7s-en.0a1b2c3d.jpg')
    expect(cardFileOf('/og/a/b.jpg')).toBe('')
    expect(cardFileOf('/api/og?file=a&file=b')).toBe('')
    expect(cardFileOf(`/api/og?${imageQuery(R())}`)).toBeNull()
    expect(cardFileOf(undefined)).toBeNull()
  })

  it('serves a card the build wrote with vercel.json’s headers, and draws one it did not (vite preview)', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ft-og-'))
    try {
      const stored = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3])
      writeFileSync(join(dir, cardFile(R())), stored)
      writeFileSync(join(dir, 'secret.txt'), 'no')
      const r = render()
      const mw = createOgMiddleware(r, { cardDir: dir })
      let { res, headers } = fakeRes()
      await mw({ method: 'GET', url: `/og/${cardFile(R())}` } as IncomingMessage, res as unknown as ServerResponse)
      expect(res.statusCode).toBe(200)
      expect(headers['Cache-Control']).toBe(CARD_FILE_CACHE)
      expect(headers['Content-Type']).toBe('image/jpeg')
      expect(Buffer.from(res.body as Uint8Array)).toEqual(stored)
      expect(r).not.toHaveBeenCalled()
      // not written by the build: drawn on request, as on Vercel
      ;({ res, headers } = fakeRes())
      await mw({ method: 'GET', url: `/api/og?file=${cardFile(R({ lang: 'hi' }))}` } as IncomingMessage, res as unknown as ServerResponse)
      expect(res.statusCode).toBe(200)
      expect(headers['Cache-Control']).toBe(IMAGE_CACHE)
      expect(r).toHaveBeenCalledTimes(1)
      // only card names are ever read from the folder
      for (const url of ['/og/secret.txt', '/og/..%2Fsecret.txt', '/api/og?file=../secret.txt']) {
        ;({ res, headers } = fakeRes())
        await mw({ method: 'GET', url } as IncomingMessage, res as unknown as ServerResponse)
        expect(res.statusCode, url).toBe(302)
        expect(headers.Location).toBe('/og.jpg')
      }
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

describe('the card', () => {
  it('holds no text at all: every word is a glyph outline, and only our own words are drawn', () => {
    for (const era of ERAS) {
      for (const lang of ['en', 'hi'] as Lang[]) {
        for (const r of [R({ era, lang }), R({ era, lang, outcome: 'caught', mode: 'hard', days: 13 }), R({ era, lang, mode: 'daily', outcome: 'caught', days: 2 })]) {
          const svg = cardSvg(r)
          expect(svg).not.toMatch(/<text|<tspan|<foreignObject|<image|<script|href="(?!#)/)
          expect(svg).toMatch(/<use href="#g-deva-\d+"/) // the title lettering, at least
          expect(svg.length).toBeLessThan(600_000)
          expect(cardSvg(r)).toBe(svg) // pure: its hash versions the URL
          const w = cardWords(r)
          const era_ = SERVER_ERAS[era]
          expect(w.year).toBe(era_.year)
          expect(w.place).toBe(era_.place[lang])
          if (r.mode !== 'daily') expect(w.stamp).toBe(era_.endings[r.outcome].stamp[lang])
        }
      }
    }
  })

  it('says the outcome plainly: the days held, the day caught, the daily score', () => {
    expect(cardWords(R())).toMatchObject({ hero: '7/7', caption: 'Survived', mode: 'Easy · 7 days', stamp: 'Court stands' })
    expect(cardWords(R({ outcome: 'caught', days: 3, mode: 'hard' }))).toMatchObject({ hero: 'Day 4', caption: 'Caught', mode: 'Hard · 14 days', stamp: 'Kala Pani' })
    expect(cardWords(R({ mode: 'daily', outcome: 'caught', days: 4, lang: 'hi' }))).toMatchObject({ hero: '4/5', caption: 'सही', mode: '', stamp: 'आज का तार' })
    expect(cardWords(R({ era: 'lahore-1929', lang: 'hi' }))).toMatchObject({ head: 'एच.एस.आर.ए.', hero: '7/7', caption: 'बच गए', mode: 'आसान · 7 दिन' })
  })

  it('versions each card by its drawing', () => {
    const revs = new Set(ERAS.flatMap((era) => (['en', 'hi'] as Lang[]).map((lang) => cardRev(R({ era, lang })))))
    expect(revs.size).toBe(8)
    expect(parseShareCode(shareCode(R()))!.canonical).toBe(true)
  })

  it('carries the same parrot as the game', () => {
    const icons = readFileSync(resolve(__dirname, '../../src/ui/icons.ts'), 'utf8')
    const game = icons.slice(icons.indexOf('export function parrotMark'), icons.indexOf('export function speakerIcon'))
    const shapes = (s: string) => [...s.matchAll(/<(path|circle|ellipse|g transform)[^>]*>/g)].map((m) => m[0].replace(/\s+/g, ' '))
    expect(shapes(PARROT)).toEqual(shapes(game))
  })

  // Real renders: each chapter's card for both outcomes, the languages alternating.
  it('renders all eight era-by-outcome cards as 1200 x 630 JPEGs small enough for WhatsApp', async () => {
    let i = 0
    for (const era of ERAS) {
      for (const outcome of ['survived', 'caught'] as const) {
        const lang: Lang = i++ % 2 ? 'hi' : 'en'
        const img = await renderCard(cardSvg(R({ era, outcome, days: outcome === 'survived' ? 7 : 3, lang })))
        expect(jpegSize(img), `${era} ${outcome}`).toEqual({ w: CARD_W, h: CARD_H })
        expect(img.byteLength).toBeLessThan(300 * 1024)
        expect(img.byteLength).toBeGreaterThan(40 * 1024) // a real picture, not a blank
      }
    }
  }, 30_000)
})
