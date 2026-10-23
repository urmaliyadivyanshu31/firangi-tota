// Plays one full day in each era with the real stage, at 390×844 and 1440×900, in Hindi and
// English, and checks the things the eye can miss: stamps stay off until the paper is readable,
// the paper sits clear of the top bar and the stamps, and the console stays clean.
// Start the dev server first (npx vite --port 5391 --strictPort), then:
//   node dev/shoot-integrated.mjs [base] [outDir] [only: en-m,hi-d,...] [eras: delhi-1857,...]
import { mkdirSync, writeFileSync } from 'node:fs'
import { chromium } from '@playwright/test'

const BASE = process.argv[2] ?? 'http://localhost:5391'
const OUT = process.argv[3] ?? 'docs/screens/integrated'
const ONLY = process.argv[4] ?? ''
const ERAS = (process.argv[5] || 'delhi-1857,lahore-1929,bombay-1942,delhi-1947').split(',')
mkdirSync(OUT, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await chromium.launch({ args: ['--use-gl=angle', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
const report = []

async function day(lang, size, era) {
  const mobile = size === 'm'
  const ctx = await browser.newContext({
    viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
    deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile,
  })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  const tag = `${size}-${lang}-${era}`
  let n = 0
  const shot = (name) => page.screenshot({ path: `${OUT}/${tag}-${String(++n).padStart(2, '0')}-${name}.png` })
  const row = { run: tag, errors, checks: {} }

  await page.goto(`${BASE}/?lang=${lang}&seed=11&inspect`, { waitUntil: 'networkidle' })
  await page.waitForSelector('#stage canvas', { state: 'attached', timeout: 20000 }).catch(() => null)
  await sleep(1800)
  if (era === ERAS[0]) await shot('home')
  await page.click(`[data-era="${era}"]`)
  await sleep(1500)
  if (era === ERAS[0]) await shot('setup')
  await page.click('[data-mode="easy"]')
  await sleep(700)
  if (era === ERAS[0]) await shot('intro')
  await page.click('[data-action="next"]')
  await sleep(300)
  await page.click('[data-action="next"]')
  await sleep(900)
  await shot('day-title')
  row.checks.stampsOffDuringArrival = await page.evaluate(() =>
    window.__ft.readable || [...document.querySelectorAll('button[data-stamp]')].every((b) => b.disabled))
  await sleep(1400)
  await shot('arrival')
  const t0 = Date.now()
  await page.waitForFunction(() => window.__ft?.readable === true, null, { timeout: 20000 }).catch(() => null)
  row.checks.readableAfterMs = Date.now() - t0
  row.checks.stampsOnWhenReadable = await page.evaluate(() => [...document.querySelectorAll('button[data-stamp]')].every((b) => !b.disabled))
  await sleep(700)
  await shot('reading')
  // the HUD insets the stage was given, against the overlay's real boxes
  row.checks.insets = await page.evaluate(() => {
    const st = getComputedStyle(document.getElementById('stage'))
    const v = (k) => st.getPropertyValue(k).trim()
    const hud = document.querySelector('.hud').getBoundingClientRect()
    return { top: v('--ft-hud-top'), bottom: v('--ft-hud-bottom'), left: v('--ft-hud-left'), hudBottom: Math.round(hud.bottom) }
  })
  if (mobile) {
    await page.click('[data-tab="file"]')
    await sleep(700)
    await shot('casefile')
    await page.click('.sheet--file .sheet__close')
    await sleep(500)
  }
  const real = await page.evaluate(() => window.__ft.play.state.queue[window.__ft.play.state.day - 1].real)
  await page.click(`[data-stamp="${real ? 'asli' : 'tota'}"]`)
  await sleep(700)
  await shot('stamp')
  await page.waitForSelector('.reveal', { timeout: 10000 }).catch(() => null)
  await sleep(1100)
  await shot('result')
  if (era === ERAS[ERAS.length - 1]) {
    await page.click('[data-action="next"]')
    await page.waitForFunction(() => window.__ft?.readable === true, null, { timeout: 20000 }).catch(() => null)
    const real2 = await page.evaluate(() => window.__ft.play.state.queue[window.__ft.play.state.day - 1].real)
    await page.click(`[data-stamp="${real2 ? 'tota' : 'asli'}"]`)
    await page.waitForSelector('.reveal', { timeout: 10000 }).catch(() => null)
    await sleep(1000)
    await shot('result-wrong')
    await page.click('[data-action="next"]')
    await sleep(1500)
    await shot('end')
  }
  report.push(row)
  await ctx.close()
}

for (const lang of ['en', 'hi']) {
  for (const size of ['m', 'd']) {
    if (ONLY && !ONLY.split(',').includes(`${lang}-${size}`)) continue
    for (const era of ERAS) {
      try {
        await day(lang, size, era)
      } catch (err) {
        report.push({ run: `${size}-${lang}-${era}`, errors: [`FAILED: ${err.message}`], checks: {} })
      }
    }
  }
}
await browser.close()
writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2))
for (const r of report) console.log(r.run, JSON.stringify(r.checks), r.errors.length ? `ERRORS: ${r.errors.join(' | ')}` : 'clean')
