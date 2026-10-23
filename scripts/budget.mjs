#!/usr/bin/env node
// First-load size budget. Reads dist/index.html, gzips what the first visit has to download before
// the main page works (the HTML, the entry JS and anything it modulepreloads, the CSS, the preloaded
// fonts, the manifest and the service-worker registration) and fails when the total is over 600 KB
// or the JS over 250 KB. The lazy chunks (three.js and the stage, the era desks) load after the first
// paint, so they are not counted. Run after `npm run build`.
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

const KB = 1024
export const LIMITS = { total: 600 * KB, js: 250 * KB }

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = resolve(root, process.argv[2] ?? 'dist')

/** The first-load files named by the built HTML, in the order the browser meets them. */
export function firstLoad(html) {
  const out = []
  const add = (kind, url) => {
    if (!url || /^(https?:)?\/\//.test(url) || out.some((f) => f.url === url)) return
    out.push({ kind, url })
  }
  for (const tag of html.match(/<(script|link)\b[^>]*>/gi) ?? []) {
    const attr = (name) => tag.match(new RegExp(`\\s${name}=["']([^"']+)["']`, 'i'))?.[1]
    if (/^<script/i.test(tag)) {
      if (attr('src')) add('js', attr('src'))
      continue
    }
    const rel = (attr('rel') ?? '').toLowerCase()
    if (rel === 'stylesheet') add('css', attr('href'))
    else if (rel === 'modulepreload') add('js', attr('href'))
    else if (rel === 'preload' && attr('as') === 'font') add('font', attr('href'))
    else if (rel === 'preload' && attr('as') === 'script') add('js', attr('href'))
    else if (rel === 'manifest') add('other', attr('href'))
  }
  return out
}

const gz = (buf) => gzipSync(buf, { level: 9 }).length

function main() {
  const htmlPath = join(dist, 'index.html')
  if (!existsSync(htmlPath)) {
    console.error(`budget: ${htmlPath} not found; run \`npm run build\` first`)
    process.exit(2)
  }
  const html = readFileSync(htmlPath)
  const rows = [{ kind: 'html', url: '/index.html', raw: html.length, gzip: gz(html) }]
  for (const f of firstLoad(html.toString('utf8'))) {
    const p = join(dist, f.url.replace(/^\//, '').split(/[?#]/)[0])
    if (!existsSync(p)) {
      console.error(`budget: ${f.url} is referenced by index.html but missing from ${dist}`)
      process.exit(2)
    }
    const buf = readFileSync(p)
    rows.push({ ...f, raw: buf.length, gzip: gz(buf) })
  }
  const sum = (pick) => rows.filter(pick).reduce((n, r) => n + r.gzip, 0)
  const total = sum(() => true)
  const js = sum((r) => r.kind === 'js')
  const kb = (n) => `${(n / KB).toFixed(1)} KB`
  console.log('First load (gzip):')
  for (const r of rows) console.log(`  ${r.kind.padEnd(5)} ${kb(r.gzip).padStart(9)}  (${kb(r.raw)} raw)  ${r.url}`)
  console.log(`  JS    ${kb(js).padStart(9)} of ${kb(LIMITS.js)}`)
  console.log(`  total ${kb(total).padStart(9)} of ${kb(LIMITS.total)}`)
  const over = []
  if (js > LIMITS.js) over.push(`JS ${kb(js)} > ${kb(LIMITS.js)}`)
  if (total > LIMITS.total) over.push(`total ${kb(total)} > ${kb(LIMITS.total)}`)
  if (over.length) {
    console.error(`budget: over budget: ${over.join('; ')}`)
    process.exit(1)
  }
  console.log('budget: OK')
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()
