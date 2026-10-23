// Dev only: screenshot every UI screen through dev/ui.html and report layout problems.
// Usage: npx vite --port 5199 &  then  node dev/shoot-ui.mjs [baseUrl] [outDir]
import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'

const base = process.argv[2] ?? 'http://localhost:5199'
const out = process.argv[3] ?? 'docs/screens/ui'
mkdirSync(out, { recursive: true })

const core = ['lang', 'home', 'setup', 'intro', 'intro2', 'day', 'reveal-right', 'end-survived', 'credits']
const variants = ['home-done', 'day-forged', 'day-low', 'day-file', 'day-rules', 'reveal-wrong', 'end-caught',
  'day&channel=note', 'day&channel=radio', 'day&channel=telegram', 'reveal-right&channel=telegram']
const viewports = [{ width: 360, height: 740 }, { width: 390, height: 844 }]

const browser = await chromium.launch()
const problems = []
for (const vp of viewports) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2, hasTouch: true, isMobile: true })
  const page = await ctx.newPage()
  page.on('pageerror', (e) => problems.push(`pageerror ${e.message}`))
  const list = vp.width === 360 ? [...core, ...variants] : core
  for (const s of list) {
    for (const lang of ['en', 'hi']) {
      await page.goto(`${base}/dev/ui.html?screen=${s}&lang=${lang}`)
      await page.evaluate(() => document.fonts.ready)
      await page.waitForTimeout(450) // let the stamp animations settle
      const name = `${s.replace(/&channel=/, '-')}-${lang}-${vp.width}x${vp.height}`
      const issues = await page.evaluate(() => {
        const found = []
        const W = window.innerWidth
        if (document.documentElement.scrollWidth > W) found.push(`page scrollWidth ${document.documentElement.scrollWidth} > ${W}`)
        for (const el of document.querySelectorAll('#ui *')) {
          if (el.closest('.agarbatti__clip')) continue // the stick slides inside its clipping track
          const r = el.getBoundingClientRect()
          if (r.width === 0 || r.height === 0) continue
          if (r.right > W + 0.5 || r.left < -0.5) found.push(`x-overflow <${el.tagName.toLowerCase()} class="${el.className.baseVal ?? el.className}"> ${Math.round(r.left)}..${Math.round(r.right)}`)
          const cs = getComputedStyle(el)
          if ((cs.overflowX === 'hidden' || cs.overflow === 'hidden') && el.scrollWidth > el.clientWidth + 1) found.push(`clipped-x <${el.tagName.toLowerCase()} class="${el.className}">`)
        }
        // Touch targets
        // Inline links inside running text are exempt (WCAG 2.5.8 inline exception).
        for (const b of document.querySelectorAll('#ui button, #ui a:not(.source a):not(.credits__paper a)')) {
          const r = b.getBoundingClientRect()
          if (r.width && (r.height < 47.5 || r.width < 47.5)) found.push(`small target <${b.tagName.toLowerCase()} class="${b.className}"> ${Math.round(r.width)}x${Math.round(r.height)} "${b.textContent.trim().slice(0, 20)}"`)
        }
        return found
      })
      for (const i of issues) problems.push(`${name}: ${i}`)
      await page.screenshot({ path: `${out}/${name}.jpg`, type: 'jpeg', quality: 68 })
    }
  }
  await ctx.close()
}
await browser.close()
console.log(problems.length ? problems.join('\n') : 'no layout problems found')
