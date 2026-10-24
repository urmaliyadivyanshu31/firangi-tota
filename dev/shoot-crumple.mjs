// Frames of the toss from the dev preview (dev/crumple.html): the hands, the crumple, the flick.
// Start the dev server first (npx vite --port 5186 --strictPort --host 127.0.0.1), then:
//   node dev/shoot-crumple.mjs [base] [outDir]
//   env SIZES=390x844,1440x900  ERAS=delhi-1857,...  LANG=en  TIER=low  AT=0,200,500,...  STRIP=1
import { mkdirSync } from 'node:fs'
import { chromium } from '@playwright/test'

const BASE = process.argv[2] ?? 'http://127.0.0.1:5186'
const OUT = process.argv[3] ?? 'docs/screens/crumple-dev'
const SIZES = (process.env.SIZES ?? '390x844').split(',').map((s) => s.split('x').map(Number))
const ERAS = (process.env.ERAS ?? 'delhi-1857').split(',')
const LANG = process.env.LANG_ ?? 'en'
const TIER = process.env.TIER ? `&tier=${process.env.TIER}` : ''
const AT = (process.env.AT ?? '150,400,700,1000,1300,1550,1750,1950,2200,2500').split(',').map(Number)
mkdirSync(OUT, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
// --mute-audio: a shoot never plays sound through the machine's speakers
const browser = await chromium.launch({ args: ['--mute-audio', '--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal', '--use-gl=angle'] })
for (const [w, h] of SIZES) {
  for (const era of ERAS) {
    const tag = `${era}-${w}x${h}${process.env.TIER ? `-${process.env.TIER}` : ''}`
    const mobile = Math.min(w, h) < 600
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: mobile ? 2 : 1 })
    const page = await ctx.newPage()
    const errors = []
    page.on('pageerror', (e) => errors.push(String(e)))
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
    await page.goto(`${BASE}/dev/crumple.html?era=${era}&lang=${LANG}${TIER}`)
    await page.waitForFunction(() => window.__devReady === true, null, { timeout: 30000 })
    await sleep(500)
    await page.evaluate(() => void window.__devToss())
    let ran = 0
    for (const at of AT) {
      const wait = at - ran
      if (wait > 0) await sleep(wait)
      ran = at
      await page.evaluate(() => window.__devStage.setPaused(true))
      await page.screenshot({ path: `${OUT}/${tag}-${String(at).padStart(4, '0')}.png` })
      await page.evaluate(() => window.__devStage.setPaused(false))
    }
    console.log(tag, errors.length ? `errors: ${errors.slice(0, 3).join(' | ')}` : 'ok')
    await ctx.close()
  }
}
await browser.close()
