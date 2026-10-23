// Screenshots of the delhi-1947 desk preview (dev/delhi1947.html) at 390×844 and 360×740, DPR 3,
// per tier. Start the dev server first:
//   npx vite --port 5199 --strictPort &   node dev/shoot-delhi1947.mjs
// Env: BASE (server), OUT (folder), ONLY (comma-separated shot names). Prints the debug stats
// (draw calls, calls in shadow frames, triangles, DPR) for each shot as JSON.
import { mkdirSync } from 'node:fs'
import { chromium } from '@playwright/test'

const BASE = process.env.BASE ?? 'http://localhost:5199'
const OUT = process.env.OUT ?? 'docs/screens/eras'
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
  { name: 'low-desk', query: 'tier=low&shot=desk' },
  { name: 'high-desk', query: 'tier=high&shot=desk' },
  { name: 'high-read', query: 'tier=high&shot=read' },
  { name: 'high-caught', query: 'tier=high&shot=caught' },
  { name: 'high-intro', query: 'tier=high&shot=intro' },
  { name: 'low', query: 'tier=low&shot=stamped', size: [360, 740] },
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
  await page.goto(`${BASE}/dev/delhi1947.html?debug&${s.query}`)
  await page.waitForFunction(() => window.__devDone === true, null, { timeout: 30000 })
  if (!s.query.includes('intro')) await page.waitForTimeout(1200) // let the overlay sample both frame kinds
  const key = `delhi1947-${s.name}-${w}x${h}`
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
const brief = Object.fromEntries(
  Object.entries(stats).map(([k, v]) => [
    k,
    v && { tier: v.tier, calls: v.calls, shadowCalls: v.shadowCalls, tris: v.tris, dpr: v.dpr, fps: Math.round(v.fps), errors: v.errors },
  ]),
)
console.log(JSON.stringify(brief, null, 1))
