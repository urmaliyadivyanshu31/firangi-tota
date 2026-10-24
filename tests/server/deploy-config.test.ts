// @vitest-environment node
// vercel.json: the voice function's region and the security headers every response carries.
// The end-to-end tests serve the built game under these same headers (vite.config.ts preview).
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

interface VercelConfig {
  regions?: string[]
  trailingSlash?: boolean
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

  it('redirects /api/voice/ to /api/voice, so a trailing slash is not a second cache entry', () => {
    expect(config.trailingSlash).toBe(false)
  })

  it('sends a Content-Security-Policy that allows only this origin and never eval', () => {
    expect(global['content-security-policy']).toBeTruthy()
    expect(global['content-security-policy']).not.toMatch(/unsafe-eval|\*/)
    expect(directives['default-src']).toEqual(["'self'"])
    expect(directives['script-src']).toEqual(["'self'"]) // no inline script (the SW registers from a file)
    expect(directives['connect-src']).toEqual(["'self'"]) // read-aloud is same-origin (/api/voice)
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
