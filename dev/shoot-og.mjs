// Makes the share image (public/og.jpg, 1200×630) from a real screenshot of the game: the main
// page with the 1857 desk and its title paper. Build and preview first:
//   npm run build && npx vite preview --port 4320 --strictPort &   node dev/shoot-og.mjs
// OG_LANG=hi shoots the Hindi page; QUALITY sets the JPEG quality (the file must stay under 200 KB).
import { statSync } from 'node:fs'
import { chromium } from '@playwright/test'

const BASE = process.env.BASE ?? 'http://127.0.0.1:4320'
const OUT = process.env.OUT ?? 'public/og.jpg'
const LANG = process.env.OG_LANG === 'hi' ? 'hi' : 'en'
const QUALITY = Number(process.env.QUALITY ?? 82)

const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal', '--enable-unsafe-swiftshader'] })
// laid out at 1600×840 CSS px, so the whole title paper fits, and captured at 0.75× = 1200×630
const page = await browser.newPage({ viewport: { width: 1600, height: 840 }, deviceScaleFactor: 0.75 })
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
await page.goto(`${BASE}/?lang=${LANG}&tier=high&inspect`)
await page.locator('[data-era="delhi-1857"]').waitFor()
await page.locator('[data-era="delhi-1857"]').click()
await page.waitForFunction(() => window.__ft?.desk === 'stage', null, { timeout: 30_000 })
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(4000) // the establishing shot settles
await page.screenshot({ path: OUT, type: 'jpeg', quality: QUALITY })
await browser.close()
const kb = statSync(OUT).size / 1024
console.log(`${OUT}: ${kb.toFixed(1)} KB (${LANG}, quality ${QUALITY})`)
if (errors.length) console.log('page errors:', errors)
if (kb > 200) process.exitCode = 1
