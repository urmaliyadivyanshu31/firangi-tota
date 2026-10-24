// Shoots the share slip at a chapter's end: day 1 stamped wrong (caught), then Share. One shot per
// era, language and viewport, plus a short video of the slip landing. Run the dev server first:
//   npx vite --port 5183 --strictPort --host 127.0.0.1 &   node dev/shoot-share.mjs
// BASE, OUT (docs/screens/share, gitignored), ERAS, LANGS and SIZES (390x844,1440x900) narrow it.
import { mkdirSync } from 'node:fs'
import { chromium } from '@playwright/test'

const BASE = process.env.BASE ?? 'http://127.0.0.1:5183'
const OUT = process.env.OUT ?? 'docs/screens/share'
const ERAS = (process.env.ERAS ?? 'delhi-1857,lahore-1929,bombay-1942,delhi-1947').split(',')
const LANGS = (process.env.LANGS ?? 'en,hi').split(',')
const SIZES = (process.env.SIZES ?? '390x844,1440x900').split(',').map((s) => s.split('x').map(Number))
const TIER = process.env.TIER ?? 'low'
const VIDEO = process.env.VIDEO !== '0'

mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal', '--enable-unsafe-swiftshader'] })
const errors = []

for (const [w, h] of SIZES) {
  for (const lang of LANGS) {
    for (const era of ERAS) {
      const first = VIDEO && era === ERAS[0] && lang === LANGS[0]
      const context = await browser.newContext({
        viewport: { width: w, height: h },
        deviceScaleFactor: w < 600 ? 2 : 1,
        hasTouch: w < 600,
        isMobile: w < 600,
        userAgent: w < 600 ? 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36' : undefined,
        ...(first ? { recordVideo: { dir: OUT, size: { width: w, height: h } } } : {}),
      })
      const page = await context.newPage()
      page.on('pageerror', (e) => errors.push(`${era} ${lang}: ${e.message}`))
      await page.goto(`${BASE}/?lang=${lang}&seed=3&tier=${TIER}&inspect`)
      await page.locator(`[data-era="${era}"]`).click()
      await page.locator('[data-mode="easy"]').click()
      await page.locator('[data-action="begin"]').click()
      await page.locator('[data-stamp="asli"]:not([disabled])').waitFor({ timeout: 40_000 })
      await page.waitForFunction(() => window.__ft?.readable === true, null, { timeout: 40_000 })
      const real = await page.evaluate(() => window.__ft.play.state.queue[0].real)
      await page.locator(`[data-stamp="${real ? 'tota' : 'asli'}"]`).click()
      await page.locator('[data-action="share"]').waitFor({ timeout: 40_000 })
      await page.waitForTimeout(600)
      await page.locator('[data-action="share"]').click()
      await page.locator('.share-slip').waitFor()
      await page.waitForTimeout(900) // the card lands and the postmark thumps down
      const name = `${OUT}/slip-${era}-${lang}-${w}x${h}.png`
      await page.screenshot({ path: name })
      console.log(name)
      if (first) {
        await page.locator('[data-share="copy"]').click()
        await page.waitForTimeout(1200)
        await page.screenshot({ path: `${OUT}/slip-${era}-${lang}-${w}x${h}-copied.png` })
      }
      await context.close()
    }
  }
}
await browser.close()
if (errors.length) {
  console.log('page errors:', errors)
  process.exitCode = 1
}
