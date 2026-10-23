// Screenshots of the bombay-1942 desk at 390×844 and 360×740 (DPR 3), low and high, plus an
// empty desk and the reading shot. Start the dev server first:
//   npx vite --port 5206 --strictPort &   node dev/shoot-bombay1942.mjs
// Prints the debug stats (draw calls, triangles) per shot as JSON. ONLY=high,low limits the set.
import { mkdirSync } from 'node:fs'
import { chromium } from '@playwright/test'

const BASE = process.env.BASE ?? 'http://localhost:5206'
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
  { name: 'low', query: 'tier=low&shot=stamped', size: [390, 844] },
  { name: 'high', query: 'tier=high&shot=stamped', size: [390, 844] },
  { name: 'low', query: 'tier=low&shot=stamped', size: [360, 740] },
  { name: 'high', query: 'tier=high&shot=stamped', size: [360, 740] },
  { name: 'high-empty', query: 'tier=high&shot=desk', size: [390, 844] },
  { name: 'high-read', query: 'tier=high&shot=read', size: [390, 844] },
  { name: 'high-intro', query: 'tier=high&shot=intro', size: [390, 844] },
]

const only = process.env.ONLY ? process.env.ONLY.split(',') : null
const stats = {}
for (const s of shots.filter((x) => !only || only.includes(x.name))) {
  const [w, h] = s.size
  const page = await (await contextFor(w, h)).newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  await page.goto(`${BASE}/dev/bombay1942.html?debug&${s.query}`)
  await page.waitForFunction(() => window.__devDone === true, null, { timeout: 30000 })
  await page.waitForTimeout(1200) // let the debug overlay refresh its numbers
  const key = `bombay1942-${s.name}-${w}x${h}`
  const info = await page.evaluate(() => window.__ftStage?.info() ?? null)
  stats[key] = info && { tier: info.tier, calls: info.calls, shadowCalls: info.shadowCalls, tris: info.tris, fps: Math.round(info.fps) }
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
