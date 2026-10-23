// Screenshots of the stage preview at 390×844 (DPR 3) per tier, plus the reading shot, the caught
// beat, the 2D fallback and a 360×740 desk shot. Start the dev server first:
//   npx vite --port 5199 --strictPort &   node dev/shoot-stage.mjs
// Prints the debug stats (draw calls, triangles, DPR) for each tier as JSON.
import { mkdirSync } from 'node:fs'
import { chromium } from '@playwright/test'

const BASE = process.env.BASE ?? 'http://localhost:5199'
const OUT = process.env.OUT ?? 'docs/screens/stage'
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({
  args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal', '--enable-unsafe-swiftshader'],
})
const contexts = {}
const contextFor = async (w, h) =>
  (contexts[`${w}x${h}`] ??= await browser.newContext({
    viewport: { width: w, height: h },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  }))

const shots = [
  { name: 'low', query: 'tier=low&shot=stamped' },
  { name: 'mid', query: 'tier=mid&shot=stamped' },
  { name: 'high', query: 'tier=high&shot=stamped' },
  { name: 'high-read', query: 'tier=high&shot=read' },
  { name: 'high-caught', query: 'tier=high&shot=caught' },
  { name: 'low-read', query: 'tier=low&shot=read' },
  { name: 'fallback-2d', query: 'fallback&shot=1' },
  { name: 'high', query: 'tier=high&shot=stamped', size: [360, 740] },
]

const only = process.env.ONLY ? process.env.ONLY.split(',') : null
const stats = {}
for (const s of shots.filter((x) => !only || only.includes(x.name))) {
  const [w, h] = s.size ?? [390, 844]
  const page = await (await contextFor(w, h)).newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  await page.goto(`${BASE}/dev/stage.html?debug&${s.query}`)
  await page.waitForFunction(() => window.__devDone === true, null, { timeout: 30000 })
  await page.waitForTimeout(700) // let the debug overlay refresh its numbers
  const key = `${s.name}-${w}x${h}`
  stats[key] = await page.evaluate(() => window.__ftStage?.info() ?? null)
  await page.evaluate(() => {
    const o = document.getElementById('ft-debug')
    if (o) o.style.display = 'none'
  })
  await page.screenshot({ path: `${OUT}/${key}@3.png` })
  if (errors.length) stats[key] = { ...(stats[key] ?? {}), errors }
  await page.close()
}
await browser.close()
console.log(JSON.stringify(stats, null, 2))
