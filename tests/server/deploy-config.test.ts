// @vitest-environment node
// vercel.json: the voice function's region and the security headers every response carries.
// The end-to-end tests serve the built game under these same headers (vite.config.ts preview).
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { CARD_FILE_CACHE, IMAGE_TYPE } from '../../server/share'

interface VercelConfig {
  buildCommand?: string
  regions?: string[]
  trailingSlash?: boolean
  rewrites?: { source: string; destination: string }[]
  functions?: Record<string, { maxDuration?: number; includeFiles?: string }>
  headers: { source: string; headers: { key: string; value: string }[] }[]
}

const config = JSON.parse(readFileSync(resolve(__dirname, '../../vercel.json'), 'utf8')) as VercelConfig
const global = Object.fromEntries((config.headers.find((h) => h.source === '/(.*)')?.headers ?? []).map((h) => [h.key.toLowerCase(), h.value]))
const directives = Object.fromEntries((global['content-security-policy'] ?? '').split(';').map((d) => d.trim()).filter(Boolean).map((d) => {
  const [name = '', ...values] = d.split(/\s+/)
  return [name, values]
}))

describe('vercel.json', () => {
  it('runs the voice function in Mumbai, next to the players', () => {
    expect(config.regions).toEqual(['bom1'])
  })

  it('sends share links to their page function, and gives both share functions the card fonts and the shaper', () => {
    expect(config.rewrites).toContainEqual({ source: '/s/:code', destination: '/api/s?code=:code' })
    for (const fn of ['api/og.ts', 'api/s.ts']) {
      expect(existsSync(resolve(__dirname, '../..', fn))).toBe(true)
      const include = config.functions?.[fn]?.includeFiles ?? ''
      expect(include).toContain('server/og/fonts/*.ttf')
      expect(include).toContain('node_modules/harfbuzzjs/dist/harfbuzz.wasm')
      expect(config.functions?.[fn]?.maxDuration).toBeLessThanOrEqual(10)
    }
    for (const font of ['old-standard-tt-400', 'old-standard-tt-700', 'tiro-devanagari-hindi-400', 'special-elite-400', 'kalam-400']) {
      expect(existsSync(resolve(__dirname, `../../server/og/fonts/${font}.ttf`)), font).toBe(true)
    }
    expect(existsSync(resolve(__dirname, '../../node_modules/harfbuzzjs/dist/harfbuzz.wasm'))).toBe(true)
  })

  it('builds with npm run build, which draws every share card into dist/og after the Vite build', () => {
    expect(config.buildCommand).toBe('npm run build')
    const pkg = JSON.parse(readFileSync(resolve(__dirname, '../../package.json'), 'utf8')) as { scripts: Record<string, string> }
    expect(pkg.scripts.build).toBe('vite build && node scripts/og-cards.mjs')
  })

  it('serves the pre-drawn cards as images cached for a year, and sends a missing one to the card function', () => {
    const og = config.headers.find((h) => h.source === '/og/(.*)')?.headers ?? []
    const header = (key: string) => og.find((x) => x.key === key)?.value
    expect(header('Cache-Control')).toBe(CARD_FILE_CACHE)
    expect(header('Content-Type')).toBe(IMAGE_TYPE)
    // Vercel serves a file that exists before any rewrite, so only a miss reaches the function
    expect(config.rewrites).toContainEqual({ source: '/og/:file', destination: '/api/og?file=:file' })
  })

  it('redirects /api/voice/ to /api/voice, so a trailing slash is not a second cache entry', () => {
    expect(config.trailingSlash).toBe(false)
  })

  it('sends a Content-Security-Policy that allows this origin plus Google Analytics and the YouTube player only, and never eval', () => {
    const GA = ['https://*.google-analytics.com', 'https://*.analytics.google.com', 'https://*.googletagmanager.com']
    expect(global['content-security-policy']).toBeTruthy()
    expect(global['content-security-policy']).not.toMatch(/unsafe-eval/)
    // the only wildcards are Google Analytics' own regional subdomains (owner 10-24)
    for (const src of global['content-security-policy']!.split(/[\s;]+/).filter((x) => x.includes('*'))) {
      expect(GA).toContain(src)
    }
    expect(directives['default-src']).toEqual(["'self'"])
    // no inline script (the SW registers from a file, Google's tag is set up from our bundle)
    // YouTube's IFrame API, fetched only when Music mode is first picked (src/audio/youtube.ts)
    expect(directives['script-src']).toEqual(["'self'", 'https://www.googletagmanager.com', 'https://www.youtube.com'])
    // the only frame is Music mode's player, from YouTube's privacy-enhanced host
    expect(directives['frame-src']).toEqual(['https://www.youtube-nocookie.com'])
    expect(directives['connect-src']).toEqual(["'self'", ...GA]) // read-aloud is same-origin (/api/voice)
    expect(directives['media-src']).toEqual(["'self'"])
    expect(directives['font-src']).toEqual(["'self'"]) // the fonts are self-hosted
    expect(directives['frame-ancestors']).toEqual(["'none'"])
    expect(directives['object-src']).toEqual(["'none'"])
    expect(directives['base-uri']).toEqual(["'none'"])
  })

  it('sends the other security headers', () => {
    expect(global['x-content-type-options']).toBe('nosniff')
    expect(global['x-frame-options']).toBe('DENY')
    expect(global['referrer-policy']).toBe('strict-origin-when-cross-origin')
    for (const feature of ['microphone', 'camera', 'geolocation', 'payment']) expect(global['permissions-policy']).toContain(`${feature}=()`)
  })

  it('keeps hashed assets for a year and the entry files always fresh', () => {
    const cache = (source: string) => config.headers.find((h) => h.source === source)?.headers.find((x) => x.key === 'Cache-Control')?.value
    expect(cache('/assets/(.*)')).toContain('immutable')
    for (const f of ['/index.html', '/sw.js', '/registerSW.js']) expect(cache(f)).toBe('no-cache')
  })
})

/** Width and height from a baseline or progressive JPEG's frame header. */
function jpegSize(buf: Buffer): { w: number; h: number } | null {
  let i = 2
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) return null
    const marker = buf[i + 1]!
    const len = buf.readUInt16BE(i + 2)
    if (marker >= 0xc0 && marker <= 0xc3) return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) }
    i += 2 + len
  }
  return null
}

describe('link previews (index.html and public/og.jpg)', () => {
  const html = readFileSync(resolve(__dirname, '../../index.html'), 'utf8')
  const meta = (attr: 'name' | 'property', key: string) =>
    html.match(new RegExp(`<meta\\s+${attr}="${key}"\\s+content="([^"]*)"`))?.[1]

  it('has a description and Open Graph and Twitter tags in both languages', () => {
    const title = 'Firangi Tota · फ़िरंगी तोता'
    expect(meta('property', 'og:title')).toBe(title)
    expect(meta('name', 'twitter:title')).toBe(title)
    for (const d of [meta('name', 'description'), meta('property', 'og:description'), meta('name', 'twitter:description')]) {
      expect(d).toMatch(/[A-Za-z]/)
      expect(d).toMatch(/[ऀ-ॿ]/)
      expect(d).not.toMatch(/[.।]$/) // no full stop at the end of display copy
    }
    expect(meta('property', 'og:image')).toBe('https://firangitota.com/og.jpg')
    expect(meta('name', 'twitter:image')).toBe('https://firangitota.com/og.jpg')
    expect(meta('name', 'twitter:card')).toBe('summary_large_image')
  })

  it('ships a 1200×630 share image under 200 KB', () => {
    const img = readFileSync(resolve(__dirname, '../../public/og.jpg'))
    expect(img.length).toBeLessThanOrEqual(200 * 1024)
    expect(jpegSize(img)).toEqual({ w: 1200, h: 630 })
  })
})
