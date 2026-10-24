#!/usr/bin/env node
// Draws every share card the game can produce into dist/og at build time, after `vite build`
// (`npm run build` runs both). A share page names its card as /og/<code>.<rev>.jpg, and the CDN
// answers that from these files at once; drawn on request, a card took two seconds, and WhatsApp
// and X drop a preview image that is slow to come. `rev` is the card's drawing hash (cardRev in
// server/share.ts), so a design change gets new names. The cards come from the same renderer as
// /api/og (server/og/render.ts), which Node runs here as TypeScript (scripts/ts-hooks.mjs).
//
//   node scripts/og-cards.mjs [--out dist] [--only 1857-e7s-en,1947-h3c-hi] [--cache <dir>]
//
// resvg draws on libuv's thread pool and the JPEG is encoded in JavaScript, so the cards are drawn
// on worker threads, one per core (OG_WORKERS sets the count). Each card is also kept in
// node_modules/.cache/og-cards, keyed by its name and the renderer's own hash, so a build that
// changes no card copies them instead of drawing them again. Then every card is checked: all
// there, nothing extra, each a 1200 x 630 JPEG of at most 200 KB; anything off fails the build.
// OG_CARDS=0 skips it all for a quick local build (never on CI or Vercel); the dev and preview
// servers then draw a missing card on request.
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { availableParallelism } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import { isMainThread, parentPort, threadId, Worker, workerData } from 'node:worker_threads'

const KB = 1024
/** WhatsApp drops preview images much over 300 KB; the cards keep well under it. */
export const CARD_LIMIT = 200 * KB
/** Smaller than this is a blank, not the card. */
const MIN_BYTES = 20 * KB
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const at = (rel) => new URL(rel, import.meta.url).href

/** Width and height from a baseline or progressive JPEG's frame header. */
export function jpegSize(buf) {
  if (buf[0] !== 0xff || buf[1] !== 0xd8) return null
  let i = 2
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) return null
    const marker = buf[i + 1]
    if (marker >= 0xc0 && marker <= 0xc3) return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) }
    i += 2 + buf.readUInt16BE(i + 2)
  }
  return null
}

/**
 * What is wrong with the cards in `dir`, which must hold exactly the files in `expected`: each a
 * `width` x `height` JPEG of at most `limit` bytes. An empty list means all is well.
 */
export function checkCards(dir, expected, { width, height, limit = CARD_LIMIT }) {
  const problems = []
  const want = new Set(expected)
  for (const name of expected) {
    const p = join(dir, name)
    if (!existsSync(p)) {
      problems.push(`${name}: missing`)
      continue
    }
    const buf = readFileSync(p)
    const size = jpegSize(buf)
    if (!size || size.w !== width || size.h !== height) problems.push(`${name}: not a ${width}x${height} JPEG`)
    if (buf.length > limit) problems.push(`${name}: ${(buf.length / KB).toFixed(1)} KB, over ${(limit / KB).toFixed(0)} KB`)
    if (buf.length < MIN_BYTES) problems.push(`${name}: only ${buf.length} bytes`)
  }
  for (const name of existsSync(dir) ? readdirSync(dir) : []) {
    if (!want.has(name)) problems.push(`${name}: not a card this build draws`)
  }
  return problems
}

/** True when OG_CARDS asks to skip the cards. CI and Vercel always draw them. */
export function skipRequested(env) {
  return /^(0|off|no|false|skip)$/i.test((env.OG_CARDS ?? '').trim()) && !env.CI && !env.VERCEL
}

/** Writes through a temporary name, so a card is never seen half written. */
function writeWhole(path, data) {
  const tmp = `${path}.${process.pid}-${threadId}.tmp`
  writeFileSync(tmp, data)
  renameSync(tmp, path)
}

/** The renderer's own hash: its source, the rasterizer's and encoder's versions, the platform. */
function rendererKey() {
  const h = createHash('sha256')
  h.update(readFileSync(join(ROOT, 'server/og/render.ts')))
  for (const pkg of ['@resvg/resvg-js', 'jpeg-js']) h.update(JSON.parse(readFileSync(join(ROOT, 'node_modules', pkg, 'package.json'), 'utf8')).version)
  h.update(`${process.platform}-${process.arch}`)
  return h.digest('hex').slice(0, 12)
}

/** Draws `jobs` on `threads` worker threads, each taking the next card as it finishes one. */
function draw(jobs, threads, shared) {
  if (!jobs.length) return Promise.resolve()
  return new Promise((done, fail) => {
    let next = 0
    let live = 0
    let failed = false
    const pool = []
    const stop = (err) => {
      if (failed) return
      failed = true
      for (const w of pool) void w.terminate()
      fail(err)
    }
    for (let i = 0; i < Math.min(threads, jobs.length); i++) {
      const w = new Worker(new URL(import.meta.url), { workerData: { ogCards: shared } })
      pool.push(w)
      live++
      w.on('message', () => w.postMessage(next < jobs.length ? jobs[next++] : null))
      w.on('error', stop)
      w.on('exit', (code) => {
        live--
        if (code !== 0) stop(new Error(`a card worker stopped with code ${code}`))
        else if (!live && !failed) done()
      })
    }
  })
}

/** A worker thread: draws each card it is sent into the output folder and the cache. */
async function worker({ outDir, cacheDir }) {
  const { installTsHooks } = await import('./ts-hooks.mjs')
  installTsHooks()
  const [{ parseShareCode }, { cardFile }, { cardSvg }, { renderCard }] = await Promise.all([
    import(at('../src/game/share-code.ts')),
    import(at('../server/share.ts')),
    import(at('../server/og/card.ts')),
    import(at('../server/og/render.ts')),
  ])
  parentPort.on('message', (job) => {
    if (!job) return parentPort.close()
    const r = parseShareCode(job.code)?.result
    if (!r || cardFile(r) !== job.file) throw new Error(`card ${job.file} does not match its code ${job.code}`)
    renderCard(cardSvg(r)).then((jpg) => {
      writeWhole(join(outDir, job.file), jpg)
      if (cacheDir) {
        try {
          writeWhole(join(cacheDir, job.file), jpg)
        } catch {
          // a cache that cannot be written only means the next build draws this card again
        }
      }
      parentPort.postMessage(job.file)
    }, (err) => {
      throw err
    })
  })
  parentPort.postMessage(null) // ready
}

async function main() {
  const { values } = parseArgs({ options: { out: { type: 'string', default: join(ROOT, 'dist') }, only: { type: 'string' }, cache: { type: 'string' } } })
  if (skipRequested(process.env)) {
    console.log('og cards: skipped (OG_CARDS=0); the preview server draws each card on request')
    return
  }
  if ((process.env.OG_CARDS ?? '').trim() && (process.env.CI || process.env.VERCEL)) console.log('og cards: OG_CARDS is ignored on CI and Vercel')
  if (!process.features.typescript) {
    // Node 22.6 to 22.17 strip types only behind a flag; older ones not at all
    if (process.execArgv.includes('--experimental-strip-types')) throw new Error('og cards: this Node cannot run TypeScript; use Node 22.18 or later')
    const again = spawnSync(process.execPath, ['--experimental-strip-types', '--disable-warning=ExperimentalWarning', ...process.execArgv, fileURLToPath(import.meta.url), ...process.argv.slice(2)], { stdio: 'inherit' })
    process.exit(again.status ?? 1)
  }
  const threads = Math.max(1, Math.min(16, Number(process.env.OG_WORKERS) || availableParallelism()))
  // resvg draws on libuv's pool, shared by every thread of this process; this must come before
  // anything uses the pool
  process.env.UV_THREADPOOL_SIZE ??= String(Math.max(4, threads))

  const t0 = performance.now()
  const { installTsHooks } = await import('./ts-hooks.mjs')
  installTsHooks()
  const [{ parseShareCode, shareCode }, share, { CARD_W, CARD_H }] = await Promise.all([
    import(at('../src/game/share-code.ts')),
    import(at('../server/share.ts')),
    import(at('../server/og/card.ts')),
  ])
  const results = values.only
    ? values.only.split(',').map((c) => {
      const parsed = parseShareCode(c.trim())
      if (!parsed?.canonical) throw new Error(`og cards: ${c} is not a canonical share code`)
      return parsed.result
    })
    : share.allShareResults()
  const jobs = results.map((r) => ({ code: shareCode(r), file: share.cardFile(r) }))

  const outDir = join(resolve(values.out), share.CARD_DIR)
  rmSync(outDir, { recursive: true, force: true })
  mkdirSync(outDir, { recursive: true })
  const cacheRoot = resolve(values.cache ?? join(ROOT, 'node_modules/.cache/og-cards'))
  const key = rendererKey()
  let cacheDir = join(cacheRoot, key)
  try {
    mkdirSync(cacheDir, { recursive: true })
  } catch {
    cacheDir = null
  }

  // a card already drawn by this renderer is copied; the rest are drawn
  const misses = []
  for (const job of jobs) {
    const cached = cacheDir && join(cacheDir, job.file)
    if (cached && existsSync(cached) && jpegSize(readFileSync(cached))) copyFileSync(cached, join(outDir, job.file))
    else misses.push(job)
  }
  const workers = Math.min(threads, misses.length)
  await draw(misses, threads, { outDir, cacheDir })

  if (cacheDir && !values.only) {
    // keep only this renderer's cards for this build, so the cache never grows past one set
    const keep = new Set(jobs.map((j) => j.file))
    for (const name of readdirSync(cacheRoot)) if (name !== key) rmSync(join(cacheRoot, name), { recursive: true, force: true })
    for (const name of readdirSync(cacheDir)) if (!keep.has(name)) rmSync(join(cacheDir, name), { force: true })
  }

  const problems = checkCards(outDir, jobs.map((j) => j.file), { width: CARD_W, height: CARD_H })
  const sizes = jobs.map((j) => ({ file: j.file, bytes: statSync(join(outDir, j.file), { throwIfNoEntry: false })?.size ?? 0 }))
  const total = sizes.reduce((n, s) => n + s.bytes, 0)
  const largest = sizes.reduce((a, b) => (b.bytes > a.bytes ? b : a), sizes[0])
  const seconds = ((performance.now() - t0) / 1000).toFixed(1)
  console.log(
    `og cards: ${jobs.length} cards (${misses.length} drawn on ${workers} threads, ${jobs.length - misses.length} from the cache) in ${seconds} s,`
    + ` ${(total / KB / KB).toFixed(1)} MB in all, largest ${((largest?.bytes ?? 0) / KB).toFixed(0)} KB (${largest?.file ?? 'none'})`,
  )
  if (problems.length) {
    console.error(`og cards: ${problems.length} problem(s):\n  ${problems.slice(0, 20).join('\n  ')}`)
    process.exit(1)
  }
}

if (!isMainThread && workerData?.ogCards) {
  await worker(workerData.ogCards)
} else if (isMainThread && process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : err)
    process.exit(1)
  })
}
