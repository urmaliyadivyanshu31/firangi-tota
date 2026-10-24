// Fetches share links the way a link-preview crawler does and saves their cards: for each chapter
// and outcome (and the daily puzzle), GET /s/<code>, read og:image from the page, GET the image.
// Run the dev or preview server first:
//   npx vite --port 5183 --strictPort --host 127.0.0.1 &   node dev/shoot-share-cards.mjs
// BASE picks the server, OUT the folder (docs/screens/og, gitignored), LANGS=en,hi the languages.
import { mkdirSync, writeFileSync } from 'node:fs'

const BASE = process.env.BASE ?? 'http://127.0.0.1:5183'
const OUT = process.env.OUT ?? 'docs/screens/og'
const LANGS = (process.env.LANGS ?? 'en,hi').split(',')
const CODES = (process.env.CODES ?? '').split(',').filter(Boolean)
const YEARS = ['1857', '1929', '1942', '1947']

const codes = CODES.length
  ? CODES
  : LANGS.flatMap((l) => YEARS.flatMap((y) => [`${y}-e7s-${l}`, `${y}-h3c-${l}`, ...(y === '1857' ? [`${y}-d4c-${l}`, `${y}-m0c-${l}`, `${y}-h14s-${l}`] : [])]))

mkdirSync(OUT, { recursive: true })
let failed = 0
for (const code of codes) {
  const page = await fetch(`${BASE}/s/${code}`, { redirect: 'manual', headers: { 'User-Agent': 'Twitterbot/1.0' } })
  const html = await page.text()
  const image = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1]?.replace(/&amp;/g, '&')
  const card = html.match(/<meta name="twitter:card" content="([^"]+)"/)?.[1]
  if (page.status !== 200 || !image || card !== 'summary_large_image') {
    console.log(`${code}: page ${page.status}, image ${image ?? 'missing'}, card ${card ?? 'missing'}`)
    failed++
    continue
  }
  const t0 = Date.now()
  const res = await fetch(image, { redirect: 'manual' })
  const img = Buffer.from(await res.arrayBuffer())
  const { w, h } = jpegSize(img) ?? { w: 0, h: 0 }
  writeFileSync(`${OUT}/${code}.jpg`, img)
  console.log(`${code}: ${res.status} ${res.headers.get('content-type')} ${w}x${h} ${(img.length / 1024).toFixed(0)} KB ${Date.now() - t0} ms  ${res.headers.get('cache-control')}`)
  if (res.status !== 200 || w !== 1200 || h !== 630 || img.length > 300 * 1024) failed++
}

/** Width and height from a JPEG's frame header. */
function jpegSize(buf) {
  let i = 2
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) return null
    const marker = buf[i + 1]
    if (marker >= 0xc0 && marker <= 0xc3) return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) }
    i += 2 + buf.readUInt16BE(i + 2)
  }
  return null
}
if (failed) process.exitCode = 1
