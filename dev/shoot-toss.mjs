// Plays the real app through a right stamp and records the toss: the verdict held on the paper,
// the paper lifted and tossed into the desk's basket, and the next day starting by itself.
// Start the dev server first (npx vite --port 5180 --strictPort --host 127.0.0.1), then:
//   node dev/shoot-toss.mjs [base] [outDir]
//   env SIZES=390x844,1440x900  ERAS=delhi-1857,...  LANGS=en,hi  TIER=low  VIDEO=1  REDUCED=1  FALLBACK=1  DAYS=2
import { mkdirSync, renameSync } from 'node:fs'
import { chromium } from '@playwright/test'

const BASE = process.argv[2] ?? 'http://127.0.0.1:5180'
const OUT = process.argv[3] ?? 'docs/screens/toss'
const SIZES = (process.env.SIZES ?? '390x844,1440x900').split(',').map((s) => s.split('x').map(Number))
const ERAS = (process.env.ERAS ?? 'delhi-1857,lahore-1929,bombay-1942,delhi-1947').split(',')
const LANGS = (process.env.LANGS ?? 'en').split(',')
const TIER = process.env.TIER ? `&tier=${process.env.TIER}` : ''
const VIDEO = !!process.env.VIDEO
const REDUCED = !!process.env.REDUCED
const FALLBACK = !!process.env.FALLBACK
const DAYS = Number(process.env.DAYS ?? 1)
// moments after the verdict is up (ms): the held verdict, then the toss frame by frame
const SHOTS = (process.env.SHOTS ?? '1500,3050,3250,3450,3650,3850,4100,4500,5200').split(',').map(Number)
mkdirSync(OUT, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const args = FALLBACK ? ['--disable-webgl', '--disable-webgl2'] : ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal', '--use-gl=angle']
const browser = await chromium.launch({ args })

for (const [w, h] of SIZES) {
  for (const era of ERAS) {
    for (const lang of LANGS) {
      const tag = `${era}-${w}x${h}-${lang}${process.env.TIER ? `-${process.env.TIER}` : ''}${REDUCED ? '-reduced' : ''}${FALLBACK ? '-2d' : ''}`
      const mobile = Math.min(w, h) < 600
      const dir = `${OUT}/${tag}`
      mkdirSync(dir, { recursive: true })
      const ctx = await browser.newContext({
        viewport: { width: w, height: h },
        deviceScaleFactor: mobile ? 2 : 1,
        isMobile: mobile,
        hasTouch: mobile,
        reducedMotion: REDUCED ? 'reduce' : 'no-preference',
        ...(VIDEO ? { recordVideo: { dir, size: { width: Math.min(w, 960), height: Math.round((Math.min(w, 960) * h) / w) } } } : {}),
      })
      const page = await ctx.newPage()
      const tStart = Date.now() // the video starts with the page
      const marks = []
      const errors = []
      page.on('pageerror', (e) => errors.push(String(e)))
      page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
      try {
        await page.goto(`${BASE}/?lang=${lang}&seed=7&inspect${TIER}`, { waitUntil: 'networkidle' })
        await sleep(1200)
        await page.click(`[data-era="${era}"]`)
        await sleep(500)
        await page.click('[data-mode="easy"]')
        await page.click('[data-action="begin"]')
        for (let day = 1; day <= DAYS; day++) {
          await page.waitForFunction(() => window.__ft?.readable === true, null, { timeout: 40000 })
          await sleep(400)
          const real = await page.evaluate(() => window.__ft.play.state.queue[window.__ft.play.state.day - 1].real)
          await page.click(`[data-stamp="${real ? 'asli' : 'tota'}"]`)
          await page.waitForFunction(() => window.__ft?.revealed === true, null, { timeout: 40000 })
          const t0 = Date.now()
          marks.push(`day ${day} verdict at ${((t0 - tStart) / 1000).toFixed(2)} s`)
          const last = day === DAYS
          if (last) {
            for (const at of SHOTS) {
              const wait = at - (Date.now() - t0)
              if (wait > 0) await sleep(wait)
              await page.screenshot({ path: `${dir}/day${day}-${String(at).padStart(5, '0')}.png` })
            }
          }
          // the next day begins by itself
          await page.waitForFunction((d) => window.__ft?.play?.state.day === d + 1 && window.__ft?.readable === true, day, { timeout: 40000 })
          if (last) await page.screenshot({ path: `${dir}/day${day + 1}-readable.png` })
        }
        console.log(tag, 'ok', marks.join(', '), errors.length ? `errors: ${errors.slice(0, 2).join(' | ')}` : '')
      } catch (e) {
        console.log(tag, 'FAILED', String(e).split('\n')[0], errors.slice(0, 2).join(' | '))
        await page.screenshot({ path: `${dir}/failed.png` }).catch(() => undefined)
      }
      const video = page.video()
      await ctx.close()
      if (video) {
        try {
          renameSync(await video.path(), `${dir}/${tag}.webm`)
        } catch {
          /* keep the generated name */
        }
      }
    }
  }
}
await browser.close()
