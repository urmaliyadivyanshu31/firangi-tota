// Plays the real app through a right stamp and checks the Skip chip while the verdict leads on:
// where it sits during the stamp and during the hold, a picture of each, and how soon the next day
// is readable after a click on it (or Enter, with KEY=1).
// Start the dev server first (npx vite --port 5190 --strictPort --host 127.0.0.1), then:
//   node dev/shoot-skip.mjs [base] [outDir]     env SIZES=390x844,1440x900  ERA=delhi-1857  LANG_=en  KEY=1  AT=hold|toss
import { mkdirSync } from 'node:fs'
import { chromium } from '@playwright/test'

const BASE = process.argv[2] ?? 'http://127.0.0.1:5190'
const OUT = process.argv[3] ?? 'docs/screens/skip'
const SIZES = (process.env.SIZES ?? '390x844,1440x900').split(',').map((s) => s.split('x').map(Number))
const ERA = process.env.ERA ?? 'delhi-1857'
const LANG = process.env.LANG_ ?? 'en'
const KEY = !!process.env.KEY
const AT = process.env.AT ?? 'hold'
mkdirSync(OUT, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
// --mute-audio: a shoot never plays the game's sound through the machine's speakers
const browser = await chromium.launch({ args: ['--mute-audio', '--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal', '--use-gl=angle'] })
for (const [w, h] of SIZES) {
  const mobile = Math.min(w, h) < 600
  const tag = `${ERA}-${w}x${h}-${LANG}${KEY ? '-enter' : ''}-${AT}`
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  const rect = () => page.evaluate(() => {
    const b = [...document.querySelectorAll('[data-action="skip"]')].find((x) => x.getBoundingClientRect().width > 0)
    if (!b) return null
    const r = b.getBoundingClientRect()
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }
  })
  try {
    await page.goto(`${BASE}/?lang=${LANG}&seed=7&inspect`, { waitUntil: 'networkidle' })
    await sleep(1200)
    await page.click(`[data-era="${ERA}"]`)
    await sleep(400)
    await page.click('[data-mode="easy"]')
    await page.click('[data-action="begin"]')
    await page.click('[data-action="intro-go"]', { timeout: 20000 })
    await page.waitForFunction(() => window.__ft?.readable === true, null, { timeout: 40000 })
    await sleep(400)
    const real = await page.evaluate(() => window.__ft.play.state.queue[window.__ft.play.state.day - 1].real)
    await page.click(`[data-stamp="${real ? 'asli' : 'tota'}"]`)
    await sleep(300)
    const during = await rect()
    await page.screenshot({ path: `${OUT}/${tag}-stamping.png` })
    await page.waitForFunction(() => window.__ft?.revealed === true, null, { timeout: 40000 })
    await sleep(AT === 'toss' ? 3500 + 900 : 900)
    const hold = await rect()
    await page.screenshot({ path: `${OUT}/${tag}-chip.png` })
    const t0 = Date.now()
    if (KEY) await page.keyboard.press('Enter')
    else await page.click('[data-action="skip"]')
    await page.waitForFunction(() => window.__ft?.play?.state.day === 2, null, { timeout: 10000 })
    const nextDay = Date.now() - t0
    await sleep(250)
    await page.screenshot({ path: `${OUT}/${tag}-after.png` })
    await page.waitForFunction(() => window.__ft?.readable === true, null, { timeout: 40000 })
    const readable = Date.now() - t0
    console.log(tag, JSON.stringify({ during, hold, nextDayMs: nextDay, readableMs: readable }), errors.length ? `errors: ${errors.slice(0, 2).join(' | ')}` : '')
  } catch (e) {
    console.log(tag, 'FAILED', String(e).slice(0, 300))
  }
  await ctx.close()
}
await browser.close()
