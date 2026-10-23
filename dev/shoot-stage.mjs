// Screenshots of the stage preview at 390×844 (DPR 3) per tier, plus the reading shot, the caught
// beat and the 2D fallback. Start the dev server first:
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
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
})

const shots = [
  { name: 'low', query: 'tier=low&shot=stamped' },
  { name: 'mid', query: 'tier=mid&shot=stamped' },
  { name: 'high', query: 'tier=high&shot=stamped' },
  { name: 'high-read', query: 'tier=high&shot=read' },
  { name: 'high-caught', query: 'tier=high&shot=caught' },
  { name: 'low-read', query: 'tier=low&shot=read' },
  { name: 'fallback-2d', query: 'fallback&shot=1' },
]

const only = process.env.ONLY ? process.env.ONLY.split(',') : null
const stats = {}
for (const s of shots.filter((x) => !only || only.includes(x.name))) {
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  await page.goto(`${BASE}/dev/stage.html?debug&${s.query}`)
  await page.waitForFunction(() => window.__devDone === true, null, { timeout: 30000 })
  await page.waitForTimeout(700) // let the debug overlay refresh its numbers
  stats[s.name] = await page.evaluate(() => window.__ftStage?.info() ?? null)
  await page.evaluate(() => {
    const o = document.getElementById('ft-debug')
    if (o) o.style.display = 'none'
  })
  await page.screenshot({ path: `${OUT}/${s.name}-390x844@3.png` })
  if (errors.length) stats[s.name] = { ...(stats[s.name] ?? {}), errors }
  await page.close()
}
await browser.close()
console.log(JSON.stringify(stats, null, 2))
