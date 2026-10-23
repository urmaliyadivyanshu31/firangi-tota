// Shoots every screen of the real app at 390×844 and 1440×900, in Hindi and English.
// Start the dev server first (npx vite --port 5391 --strictPort), then:
//   node dev/shoot-immersive.mjs [base] [outDir] [only: en-m,hi-d,...]   (output is gitignored)
import { mkdirSync } from 'node:fs'
import { chromium } from '@playwright/test'

const BASE = process.argv[2] ?? 'http://localhost:5391'
const OUT = process.argv[3] ?? 'docs/screens/immersive-ui'
const ONLY = process.argv[4] ?? ''
mkdirSync(OUT, { recursive: true })
const ERA = process.env.ERA ?? 'delhi-1857'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// FLAT=1 turns WebGL off, so the 2D desk and its DOM effects are what you see.
const browser = await chromium.launch({ args: process.env.FLAT ? ['--disable-webgl', '--disable-3d-apis'] : ['--use-gl=angle', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
const errors = []

async function run(lang, size) {
  const mobile = size === 'm'
  const ctx = await browser.newContext({
    viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
    deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile,
  })
  const page = await ctx.newPage()
  page.on('pageerror', (e) => errors.push(`${lang}-${size}: ${e.message}`))
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`${lang}-${size}: ${m.text()}`) })
  let n = 0
  const shot = async (name) => {
    await page.screenshot({ path: `${OUT}/${size}-${lang}-${String(++n).padStart(2, '0')}-${name}.png` })
  }
  const q = `?lang=${lang}&seed=7&inspect`

  // first visit: the language card
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  await sleep(2500)
  await shot('language')
  await page.click(`[data-lang="${lang}"]`)
  await sleep(2500)
  await shot('home')

  await page.goto(`${BASE}/${q}`, { waitUntil: 'networkidle' })
  await sleep(1500)
  await page.click(`[data-era="${ERA}"]`)
  await sleep(1800)
  await shot('setup')
  await page.click('[data-mode="easy"]')
  await sleep(700)
  await shot('intro-1')
  await page.click('[data-action="next"]')
  await sleep(500)
  await shot('intro-2')
  await page.click('[data-action="next"]')
  await sleep(500)
  await shot('day-arriving')
  await page.waitForFunction(() => window.__ft?.readable === true, null, { timeout: 15000 }).catch(() => null)
  await sleep(900)
  await shot('day-reading')
  if (mobile) {
    await page.click('[data-tab="file"]')
    await sleep(700)
    await shot('day-casefile')
    await page.click('.sheet--file .sheet__close')
    await sleep(500)
    await page.click('[data-tab="rules"]')
    await sleep(700)
    await shot('day-rulebook')
    await page.click('.sheet--rules .sheet__close')
    await sleep(500)
  }
  const real = await page.evaluate(() => window.__ft.play.state.queue[window.__ft.play.state.day - 1].real)
  await page.click(`[data-stamp="${real ? 'asli' : 'tota'}"]`)
  await sleep(350)
  await shot('day-stamping')
  await page.waitForSelector('.reveal', { timeout: 8000 })
  await sleep(900)
  await shot('result-right')
  await page.click('[data-action="next"]')
  await page.waitForFunction(() => window.__ft?.readable === true, null, { timeout: 15000 }).catch(() => null)
  await sleep(600)
  await shot('day2-reading')
  const real2 = await page.evaluate(() => window.__ft.play.state.queue[window.__ft.play.state.day - 1].real)
  await page.click(`[data-stamp="${real2 ? 'tota' : 'asli'}"]`)
  await page.waitForSelector('.reveal', { timeout: 8000 })
  await sleep(900)
  await shot('result-wrong')
  await page.click('.reveal .fold__head')
  await sleep(300)
  await shot('result-wrong-source')
  await page.click('[data-action="next"]')
  await sleep(1200)
  await shot('end-caught')

  // the daily puzzle, all five, then its result card
  await page.goto(`${BASE}/${q}`, { waitUntil: 'networkidle' })
  await sleep(1200)
  await page.click('[data-action="daily"]')
  for (let i = 0; i < 5; i++) {
    await page.waitForFunction(() => window.__ft?.readable === true, null, { timeout: 15000 }).catch(() => null)
    if (i === 0) await shot('daily-day')
    await page.click('[data-stamp="asli"]')
    await page.waitForSelector('.reveal', { timeout: 8000 })
    await sleep(200)
    await page.click('[data-action="next"]')
  }
  await sleep(1500)
  await shot('daily-end')

  await page.goto(`${BASE}/${q}`, { waitUntil: 'networkidle' })
  await sleep(1000)
  await page.click('[data-action="credits"]')
  await sleep(700)
  await shot('credits')
  await ctx.close()
}

for (const lang of ['en', 'hi']) {
  for (const size of ['m', 'd']) {
    if (ONLY && !ONLY.split(',').includes(`${lang}-${size}`)) continue
    try {
      await run(lang, size)
    } catch (err) {
      errors.push(`${lang}-${size} FAILED: ${err.message}`)
    }
  }
}
await browser.close()
console.log(errors.length ? errors.join('\n') : 'no errors')
