// Records the intro after Begin (the YOU and Tota cards on the desk) into docs/screens/intro
// (gitignored): key frames for each era, size and language, and a short video per size.
// Start the dev server first:
//   npx vite --port 5182 --strictPort --host 127.0.0.1 &   node dev/shoot-intro.mjs
// ERAS=delhi-1857,… LANGS=en,hi SIZES=390x844,1440x900 TIER=low VIDEO=1 REDUCED=1 FALLBACK=1 narrow the run.
import { mkdirSync, renameSync } from 'node:fs'
import { chromium } from '@playwright/test'

const BASE = process.env.BASE ?? 'http://127.0.0.1:5182'
const OUT = process.env.OUT ?? 'docs/screens/intro'
const ERAS = (process.env.ERAS ?? 'delhi-1857,lahore-1929,bombay-1942,delhi-1947').split(',')
const LANGS = (process.env.LANGS ?? 'en,hi').split(',')
const SIZES = (process.env.SIZES ?? '390x844,1440x900').split(',').map((s) => s.split('x').map(Number))
const TIER = process.env.TIER ? `&tier=${process.env.TIER}` : ''
const VIDEO = process.env.VIDEO === '1'
const REDUCED = process.env.REDUCED === '1'
const FALLBACK = process.env.FALLBACK === '1'
const FRAMES = (process.env.FRAMES ?? '250,700,1300,2200,3400').split(',').map(Number)
mkdirSync(OUT, { recursive: true })

const args = FALLBACK ? ['--disable-webgl', '--disable-webgl2'] : ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal', '--enable-unsafe-swiftshader']
const browser = await chromium.launch({ args })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const tag = `${process.env.TIER ? `-${process.env.TIER}` : ''}${REDUCED ? '-reduced' : ''}${FALLBACK ? '-2d' : ''}`

for (const [w, h] of SIZES) {
  const phone = w < 600
  const ctx = await browser.newContext({
    viewport: { width: w, height: h },
    deviceScaleFactor: phone ? 2 : 1,
    isMobile: phone,
    hasTouch: phone,
    reducedMotion: REDUCED ? 'reduce' : 'no-preference',
    ...(VIDEO ? { recordVideo: { dir: OUT, size: { width: w, height: h } } } : {}),
  })
  const page = await ctx.newPage()
  page.on('pageerror', (e) => console.log(`[${w}] pageerror ${e.message}`))
  page.on('console', (m) => m.type() === 'error' && console.log(`[${w}] console ${m.text()}`))
  for (const lang of LANGS) {
    for (const era of ERAS) {
      await page.goto(`${BASE}/?seed=1&lang=${lang}&inspect${TIER}`)
      await page.waitForSelector('.screen--main')
      await page.click(`[data-era="${era}"]`)
      await page.waitForFunction(() => window.__ft?.desk !== null, null, { timeout: 15000 })
      await sleep(1900) // the wide shot settles
      const t0 = Date.now()
      await page.click('[data-action="begin"]')
      for (const at of FRAMES) {
        await sleep(Math.max(0, at - (Date.now() - t0)))
        await page.screenshot({ path: `${OUT}/${w}-${lang}-${era}${tag}-${String(at).padStart(4, '0')}.png` })
      }
      const settled = await page.evaluate(() => window.__ft?.intro?.settled ?? null)
      console.log(`${w} ${lang} ${era}${tag}: settled=${settled}`)
      if (VIDEO) {
        await sleep(6800) // the agarbatti on the slip burns out and the day begins by itself
        await page.screenshot({ path: `${OUT}/${w}-${lang}-${era}${tag}-after.png` })
      }
    }
  }
  const video = page.video()
  await ctx.close()
  if (video) renameSync(await video.path(), `${OUT}/${w}${tag}.webm`)
}
await browser.close()
