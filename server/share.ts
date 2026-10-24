// Share links and their preview cards.
//
// GET /s/<code>: a tiny page with Open Graph and Twitter `summary_large_image` tags whose image is
// /api/og?c=<code>&v=<rev>, then on to the game (/share-go.js, a script link-preview crawlers do
// not run) with the chapter and mode picked. GET /api/og: the card itself, a 1200 x 630 PNG.
//
// The code holds only enums and small integers (src/game/share-code.ts), and the card is drawn
// from those and our own content alone: nothing a player typed reaches the page or the image.
// Anything off gets a 302: a near miss to its canonical spelling, the rest to the plain site (or,
// for an image, to the site's own share image). Like /api/voice, an image is served only for the
// exact canonical query, and `v` is a hash of the card's exact drawing, so a design or text change
// gets a new URL instead of a year-old cached card.
import type { Lang } from '../src/content/types.js'
import { parseShareCode, shareCode, totalFor, type ShareResult } from '../src/game/share-code.js'
import { ORDINAL_HI } from '../src/game/share.js'
import { CARD_H, CARD_W, cardSvg } from './og/card.js'
import { SERVER_ERAS } from './eras.js'

export interface ShareHttpResult {
  status: number
  headers: Record<string, string>
  body: Uint8Array | string
}

/** The card's format (server/og/render.ts says why it is a JPEG). */
export const IMAGE_TYPE = 'image/jpeg'
export const IMAGE_CACHE = 'public, max-age=31536000, s-maxage=31536000, immutable'
/** The page is cheap and its image URL carries the card's version, so the CDN keeps it a day. */
export const PAGE_CACHE = 'public, max-age=600, s-maxage=86400'
/** Redirects follow fixes quickly: the CDN keeps them 5 minutes. */
export const REDIRECT_CACHE = 'public, max-age=0, s-maxage=300'

/** Bump when the fonts in server/og/fonts change: the drawing's hash cannot see them. */
const FONTS_REV = 'og-fonts-1'
const PLAIN_SITE = '/'
const PLAIN_IMAGE = '/og.jpg'
const CANONICAL_ORIGIN = 'https://firangitota.com'

/** Hosts that may appear in the page's absolute URLs; anything else gets the canonical origin. */
const HOST_RE = /^(?:(?:www\.)?firangitota\.com|firangi-tota[a-z0-9-]{0,80}\.vercel\.app)$/
const LOCAL_RE = /^(?:localhost|127\.0\.0\.1)(?::\d{1,5})?$/

/**
 * The origin for absolute URLs, from the request's Host header, checked against our own hosts.
 * Local hosts (the dev and preview servers) count only when `allowLocal` is set.
 */
export function originFor(host: string | undefined, allowLocal = false): string {
  const h = (host ?? '').trim().toLowerCase()
  if (allowLocal && LOCAL_RE.test(h)) return `http://${h}`
  return HOST_RE.test(h) ? `https://${h}` : CANONICAL_ORIGIN
}

/** FNV-1a, 32 bit. Not for security: it only versions cache URLs. */
function fnv1a(s: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(16).padStart(8, '0')
}

const revs = new Map<string, string>()

/** The card's version: a hash of its exact SVG (and the fonts' revision). */
export function cardRev(r: ShareResult): string {
  const code = shareCode(r)
  let v = revs.get(code)
  if (!v) {
    v = fnv1a(`${FONTS_REV}|${cardSvg(r)}`)
    revs.set(code, v)
  }
  return v
}

/** The canonical image query, without its `?`. */
export function imageQuery(r: ShareResult): string {
  return `c=${shareCode(r)}&v=${cardRev(r)}`
}

function redirect(location: string, cache = REDIRECT_CACHE): ShareHttpResult {
  return { status: 302, headers: { Location: location, 'Cache-Control': cache }, body: '' }
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

/** The page's title line, from the result alone: "Survived 7/7 days in Delhi 1857". */
export function titleLine(r: ShareResult): string {
  const era = SERVER_ERAS[r.era]
  const name = era.title[r.lang]
  const total = totalFor(r.mode)
  if (r.lang === 'hi') {
    if (r.mode === 'daily') return `आज का तार · ${total} में से ${r.days} सही · ${name}`
    return r.outcome === 'survived'
      ? `${name} · ${r.days}/${total} दिन, बच गए`
      : `${name} · ${ORDINAL_HI[r.days] ?? `${r.days + 1}वें`} दिन पकड़े गए`
  }
  if (r.mode === 'daily') return `Aaj ka Taar · ${r.days}/${total} right · ${name}`
  return r.outcome === 'survived' ? `Survived ${r.days}/${total} days in ${name}` : `Caught on day ${r.days + 1} in ${name}`
}

const SITE: Record<Lang, { name: string; description: string; alt: string; play: string; locale: string }> = {
  en: {
    name: 'Firangi Tota',
    description: "Spot the forged messages at four desks of India's freedom struggle",
    alt: 'A Firangi Tota result card',
    play: 'Play Firangi Tota',
    locale: 'en_IN',
  },
  hi: {
    name: 'फ़िरंगी तोता',
    description: 'आज़ादी की लड़ाई की चार मेज़ों पर जाली संदेश पकड़िए',
    alt: 'फ़िरंगी तोता का नतीजा कार्ड',
    play: 'फ़िरंगी तोता खेलें',
    locale: 'hi_IN',
  },
}

/** Where the page sends a person: the game, with the friend's chapter and mode picked. */
export function gameHref(r: ShareResult): string {
  return r.mode === 'daily' ? '/?daily' : `/?chapter=${r.era}&mode=${r.mode}`
}

/** The page for a parsed, canonical code. */
export function sharePage(r: ShareResult, origin: string): string {
  const site = SITE[r.lang]
  const line = titleLine(r)
  const title = `${line} · ${site.name}`
  const pageUrl = `${origin}/s/${shareCode(r)}`
  const image = `${origin}/api/og?${imageQuery(r)}`
  const alt = `${site.alt}: ${line}`
  const go = gameHref(r)
  const meta = (attr: 'name' | 'property', key: string, value: string) => `<meta ${attr}="${key}" content="${esc(value)}">`
  return `<!doctype html>
<html lang="${r.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
${meta('name', 'description', site.description)}
<meta name="robots" content="noindex">
<link rel="canonical" href="${esc(pageUrl)}">
${meta('property', 'og:type', 'website')}
${meta('property', 'og:site_name', site.name)}
${meta('property', 'og:title', title)}
${meta('property', 'og:description', site.description)}
${meta('property', 'og:url', pageUrl)}
${meta('property', 'og:image', image)}
${meta('property', 'og:image:secure_url', image)}
${meta('property', 'og:image:type', IMAGE_TYPE)}
${meta('property', 'og:image:width', String(CARD_W))}
${meta('property', 'og:image:height', String(CARD_H))}
${meta('property', 'og:image:alt', alt)}
${meta('property', 'og:locale', site.locale)}
${meta('name', 'twitter:card', 'summary_large_image')}
${meta('name', 'twitter:title', title)}
${meta('name', 'twitter:description', site.description)}
${meta('name', 'twitter:image', image)}
${meta('name', 'twitter:image:alt', alt)}
<meta name="theme-color" content="#1d130b">
<link rel="icon" href="/icons/favicon.svg" type="image/svg+xml">
<style>html{background:#1d130b;color:#f6ead0;font:20px/1.4 Georgia,'Times New Roman',serif}body{display:grid;place-items:center;min-height:100vh;margin:0;padding:0 16px;text-align:center}a{color:#f8bd5a}</style>
<script src="/share-go.js" defer></script>
</head>
<body>
<p><a href="${esc(go)}" data-go>${esc(site.play)}</a></p>
</body>
</html>
`
}

/** GET /s/<code>. `rawCode` is the path segment as received (undecoded). */
export function handleSharePage(rawCode: string | null, origin: string): ShareHttpResult {
  const parsed = rawCode ? parseShareCode(rawCode) : null
  if (!parsed) return redirect(PLAIN_SITE)
  if (!parsed.canonical) return redirect(`/s/${shareCode(parsed.result)}`)
  return {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': PAGE_CACHE,
      'X-Content-Type-Options': 'nosniff',
    },
    body: sharePage(parsed.result, origin),
  }
}

export type Render = (svg: string) => Promise<Uint8Array>

// Concurrent requests for the same card on one instance share one render.
const inflight = new Map<string, Promise<Uint8Array>>()

const QUERY_RE = /^c=([0-9a-z-]{1,24})&v=([0-9a-f]{8})$/i

/**
 * GET /api/og. `rawQuery` is the query string exactly as received, without the `?`: only the
 * canonical spelling is ever answered with an image.
 */
export async function handleOgImage(rawQuery: string, render: Render): Promise<ShareHttpResult> {
  if (rawQuery.length > 64) return redirect(PLAIN_IMAGE)
  // the code may come alone (c=…) or with any version; both are steered to the canonical query
  const params = new URLSearchParams(rawQuery)
  const keys = [...params.keys()]
  if (keys.some((k) => k !== 'c' && k !== 'v') || params.getAll('c').length !== 1 || params.getAll('v').length > 1) return redirect(PLAIN_IMAGE)
  const parsed = parseShareCode(params.get('c') ?? '')
  if (!parsed) return redirect(PLAIN_IMAGE)
  const canonical = imageQuery(parsed.result)
  if (rawQuery !== canonical || !QUERY_RE.test(rawQuery)) return redirect(`/api/og?${canonical}`)

  const key = canonical
  let job = inflight.get(key)
  if (!job) {
    job = render(cardSvg(parsed.result))
    inflight.set(key, job)
    const clear = () => { inflight.delete(key) }
    job.then(clear, clear)
  }
  let png: Uint8Array
  try {
    png = await job
  } catch (err) {
    console.warn(`[og] render failed c=${shareCode(parsed.result)} ${(err as Error | null)?.name ?? 'error'}`)
    return redirect(PLAIN_IMAGE, 'no-store')
  }
  return {
    status: 200,
    headers: {
      'Content-Type': IMAGE_TYPE,
      'Cache-Control': IMAGE_CACHE,
      'Content-Length': String(png.byteLength),
      'X-Content-Type-Options': 'nosniff',
    },
    body: png,
  }
}
