// Screenshots and Playwright videos of a full day on the 3D stage (dev/immersive.html), per era,
// screen size, tier and language. Start the dev server first:
//   npx vite --port 5231 --strictPort &   node dev/shoot-day.mjs
// Env: BASE, OUT (default docs/screens/immersive), ERAS, SIZES (390x844,1440x900), TIERS (low,high),
// LANGS (en,hi), VIDEO=0 to skip video, EXTRA=<query> appended to every URL, BEATS=<beat,...>.
import { mkdirSync, renameSync } from 'node:fs'
import { chromium } from '@playwright/test'

const BASE = process.env.BASE ?? 'http://localhost:5231'
const OUT = process.env.OUT ?? 'docs/screens/immersive'
const list = (v, d) => (v ? v.split(',') : d)
const ERAS = list(process.env.ERAS, ['delhi-1857', 'lahore-1929', 'bombay-1942', 'delhi-1947'])
const SIZES = list(process.env.SIZES, ['390x844', '1440x900']).map((s) => s.split('x').map(Number))
const TIERS = list(process.env.TIERS, ['low', 'high'])
const LANGS = list(process.env.LANGS, ['en', 'hi'])
const VIDEO = process.env.VIDEO !== '0'
const EXTRA = process.env.EXTRA ? `&${process.env.EXTRA}` : ''
// beats to photograph, with a delay after the beat starts (ms)
const SHOTS = process.env.EXTRA?.includes('reveal=')
  ? [
      ['read', 700],
      ['reveal', 1300],
      ['back', 400],
    ]
  : [
      ['establish', 1300],
      ['title', 1150],
      ['arrival', 900],
      ['read', 700],
      ['stamp', 520],
      ['flash', 260],
      ['result', 300],
    ]
const BEATS = list(process.env.BEATS, SHOTS.map((s) => s[0]))
mkdirSync(OUT, { recursive: true })
mkdirSync(`${OUT}/video`, { recursive: true })

const browser = await chromium.launch({
  args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal', '--use-gl=angle', '--enable-unsafe-swiftshader'],
})
const report = []
for (const era of ERAS) {
  for (const [w, h] of SIZES) {
    for (const tier of TIERS) {
      for (const lang of LANGS) {
        const tag = `${era}-${w}x${h}-${tier}-${lang}`
        const ctx = await browser.newContext({
          viewport: { width: w, height: h },
          deviceScaleFactor: w < 600 ? 2 : 1,
          isMobile: w < 600,
          hasTouch: w < 600,
          ...(VIDEO ? { recordVideo: { dir: `${OUT}/video/tmp`, size: { width: w, height: h } } } : {}),
        })
        const page = await ctx.newPage()
        const errors = []
        page.on('pageerror', (e) => errors.push(String(e)))
        page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
        try {
        await page.goto(`${BASE}/dev/immersive.html?auto&hud&era=${era}&lang=${lang}&tier=${tier}${EXTRA}`)
        for (const [beat, delay] of SHOTS) {
          await page.waitForFunction((b) => {
            const order = ['establish', 'title', 'arrival', 'read', 'stamp', 'flash', 'reveal', 'back', 'result', 'done']
            const cur = window.__beat ?? ''
            return order.indexOf(cur) >= order.indexOf(b)
          }, beat, { timeout: 40000 })
          await page.waitForTimeout(delay)
          if (BEATS.includes(beat)) await page.screenshot({ path: `${OUT}/${tag}-${SHOTS.findIndex((s) => s[0] === beat)}-${beat}.png` })
        }
        await page.waitForFunction(() => window.__beat === 'done', null, { timeout: 40000 })
        } catch (e) {
          // one stuck run (a dev-server reload, a slow GPU) must not stop the rest of the matrix
          errors.push(String(e).split('\n')[0])
        }
        const cues = await page.evaluate(() => window.__cues ?? []).catch(() => [])
        const video = page.video()
        await ctx.close()
        if (video) {
          try {
            renameSync(await video.path(), `${OUT}/video/${tag}.webm`)
          } catch (e) {
            errors.push(`video: ${e}`)
          }
        }
        report.push({ tag, cues: cues.join(' '), errors })
        console.log(tag, errors.length ? `ERRORS ${errors.join(' | ')}` : 'ok', cues.join(' '))
      }
    }
  }
}
await browser.close()
