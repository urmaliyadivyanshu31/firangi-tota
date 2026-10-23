// Plays the real app to each verdict at several screen sizes and checks the paper stays clear of
// the HUD: right (day 1), survived (the chapter's last day) and caught (a wrong stamp).
// Start the dev server first (npx vite --port 5231 --strictPort), then:
//   node dev/shoot-verdicts.mjs [base] [outDir]      env SIZES=1440x900,390x844  ERA=delhi-1857  LANG=en
import { mkdirSync } from 'node:fs'
import { chromium } from '@playwright/test'

const BASE = process.argv[2] ?? 'http://localhost:5231'
const OUT = process.argv[3] ?? 'docs/screens/immersive/verdicts'
const SIZES = (process.env.SIZES ?? '1440x900,1366x768,390x844,360x740,844x390').split(',').map((s) => s.split('x').map(Number))
const ERA = process.env.ERA ?? 'delhi-1857'
const LANG = process.env.LANG_ ?? 'en'
mkdirSync(OUT, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal', '--use-gl=angle', '--enable-unsafe-swiftshader'] })
const report = []

/** The paper against the HUD: overlap in px with the top bar, the buttons under the paper and the sides. */
async function measure(page) {
  return page.evaluate(() => {
    const ft = window.__ft
    const p = ft?.paperRect?.()
    if (!p) return null
    const r = (el) => el && el.getBoundingClientRect()
    const hud = r(document.querySelector('.hud'))
    const acts = [...document.querySelectorAll('.paper-result__actions > *, .day__controls .stamps')].map(r).filter((x) => x && x.width > 0)
    const dossier = r(document.querySelector('[data-layout="wide"] .dossier'))
    const below = acts.filter((a) => a.left < p.x + p.w && a.right > p.x)
    const buttonsTop = below.length ? Math.min(...below.map((a) => a.top)) : innerHeight
    return {
      paper: { x: Math.round(p.x), y: Math.round(p.y), w: Math.round(p.w), h: Math.round(p.h) },
      overTop: hud ? Math.max(0, Math.round(hud.bottom - p.y)) : 0,
      overButtons: Math.max(0, Math.round(p.y + p.h - buttonsTop)),
      overDossier: dossier && dossier.width ? Math.max(0, Math.round(dossier.right - p.x)) : 0,
      offScreen: Math.round(Math.max(0, -p.x, p.x + p.w - innerWidth, -p.y, p.y + p.h - innerHeight)),
      // the body type on screen: 66 page units on a 1000-unit sheet at most (short messages)
      bodyPxMax: +((p.w * 66) / 1000).toFixed(1),
    }
  })
}

async function readable(page) {
  await page.waitForFunction(() => window.__ft?.readable === true, null, { timeout: 30000 })
}
async function revealed(page) {
  await page.waitForFunction(() => window.__ft?.revealed === true, null, { timeout: 30000 })
  await sleep(900) // the re-fit glide after the buttons come in
}
const realToday = (page) => page.evaluate(() => window.__ft.play.state.queue[window.__ft.play.state.day - 1].real)

for (const [w, h] of SIZES) {
  const tag = `${w}x${h}`
  const mobile = Math.min(w, h) < 600
  for (const run of ['right-survived', 'caught']) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile })
    const page = await ctx.newPage()
    const errors = []
    page.on('pageerror', (e) => errors.push(String(e)))
    try {
      await page.goto(`${BASE}/?lang=${LANG}&seed=7&inspect`, { waitUntil: 'networkidle' })
      await sleep(1200)
      const pickLang = await page.$(`[data-lang="${LANG}"]`)
      if (pickLang) {
        await pickLang.click()
        await sleep(800)
      }
      await page.click(`[data-era="${ERA}"]`)
      await sleep(600)
      await page.click('[data-mode="easy"]')
      await sleep(400)
      const begin = await page.$('[data-action="begin"]')
      if (begin) await begin.click()
      await sleep(700)
      // any intro cards
      for (let i = 0; i < 3; i++) {
        const next = await page.$('[data-action="next"]')
        if (!next || (await page.evaluate(() => window.__ft?.screen)) === 'day') break
        await next.click()
        await sleep(400)
      }
      for (let day = 1; day <= 12; day++) {
        await readable(page)
        const real = await realToday(page)
        const right = run !== 'caught'
        await page.click(`[data-stamp="${(real === right) ? 'asli' : 'tota'}"]`)
        await revealed(page)
        const screen = await page.evaluate(() => window.__ft.screen)
        const end = await page.$('.paper-result__actions [data-action="share"], .paper-result--end, [data-end]')
        const days = await page.evaluate(() => window.__ft.play?.state.days ?? 0)
        const isLast = run === 'caught' || day >= days
        if (day === 1 || isLast) {
          const name = run === 'caught' ? 'caught' : isLast ? 'survived' : 'right'
          const m = await measure(page)
          await page.screenshot({ path: `${OUT}/${tag}-${LANG}-${name}.png` })
          report.push({ size: tag, verdict: name, ...m })
          console.log(tag, name, JSON.stringify(m))
        }
        if (isLast) break
        await page.click('[data-action="next"]')
        await sleep(300)
        void screen
        void end
      }
    } catch (e) {
      console.log(tag, run, 'FAILED', String(e).split('\n')[0])
    }
    if (errors.length) console.log(tag, run, 'page errors:', errors.slice(0, 3).join(' | '))
    await ctx.close()
  }
}
await browser.close()
const bad = report.filter((r) => r.overTop > 2 || r.overButtons > 2 || r.overDossier > 2 || r.offScreen > 2)
console.log(bad.length ? `OVERLAPS: ${JSON.stringify(bad)}` : 'no overlaps')
