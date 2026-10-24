// A picture of the hands preview (dev/hands.html): six poses of the right hand under a warm lamp.
// Start the dev server first (npx vite --port 5190 --strictPort --host 127.0.0.1), then:
//   node dev/shoot-hands.mjs [base] [outDir]      env TIERS=high,low  ERA=delhi-1857  ZOOM=1
import { mkdirSync } from 'node:fs'
import { chromium } from '@playwright/test'

const BASE = process.argv[2] ?? 'http://127.0.0.1:5190'
const OUT = process.argv[3] ?? 'docs/screens/hands'
const TIERS = (process.env.TIERS ?? 'high').split(',')
const ERA = process.env.ERA ?? 'delhi-1857'
const ZOOM = process.env.ZOOM ?? '1'
const LOOK = process.env.LOOK ?? '0,-0.02'
mkdirSync(OUT, { recursive: true })
// --mute-audio: a shoot never plays sound through the machine's speakers
const browser = await chromium.launch({ args: ['--mute-audio', '--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal', '--use-gl=angle'] })
for (const tier of TIERS) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  await page.goto(`${BASE}/dev/hands.html?tier=${tier}&era=${ERA}&zoom=${ZOOM}&look=${LOOK}`)
  await page.waitForFunction(() => window.__devReady === true, null, { timeout: 30000 })
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${OUT}/hands-${ERA}-${tier}-z${ZOOM}-${LOOK.replace(',', '_')}.png` })
  console.log(tier, errors.length ? `errors: ${errors.slice(0, 3).join(' | ')}` : 'ok')
  await ctx.close()
}
await browser.close()
