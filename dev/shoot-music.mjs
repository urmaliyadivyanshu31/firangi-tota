// Screenshots of the record button and its sleeve (Focus tracks, two songs, the room), and the
// songs' cabinet, on the main page and during a day, per screen size and language. The browser is
// muted, and under automation the game never loads YouTube: the cabinet shows its placeholder.
//   npx vite --port 5196 --strictPort --host 127.0.0.1 &   node dev/shoot-music.mjs
// Env: BASE, OUT (default docs/screens/music), SIZES (390x844,1440x900), LANGS (en,hi), ERAS, VIDEO=1.
import { mkdirSync } from 'node:fs'
import { chromium } from '@playwright/test'

const BASE = process.env.BASE ?? 'http://127.0.0.1:5196'
const OUT = process.env.OUT ?? 'docs/screens/music'
const list = (v, d) => (v ? v.split(',') : d)
const SIZES = list(process.env.SIZES, ['390x844', '1440x900']).map((s) => s.split('x').map(Number))
const LANGS = list(process.env.LANGS, ['en', 'hi'])
const ERAS = list(process.env.ERAS, ['delhi-1857'])
const TIER = process.env.TIER ?? 'low'
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({ args: ['--mute-audio', '--use-gl=angle', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
for (const era of ERAS) {
  for (const [w, h] of SIZES) {
    for (const lang of LANGS) {
      const tag = `${era}-${w}x${h}-${lang}`
      const ctx = await browser.newContext({
        viewport: { width: w, height: h }, deviceScaleFactor: w < 600 ? 2 : 1, isMobile: w < 600, hasTouch: w < 600,
        ...(process.env.VIDEO ? { recordVideo: { dir: `${OUT}/video-${tag}`, size: { width: w, height: h } } } : {}),
      })
      const page = await ctx.newPage()
      page.on('pageerror', (e) => console.log(tag, 'page error:', e.message))
      page.on('console', (m) => m.type() === 'error' && console.log(tag, 'console:', m.text()))
      await page.goto(`${BASE}/?seed=1&lang=${lang}&tier=${TIER}&inspect`)
      await page.locator('.screen--main').waitFor()
      await page.locator(`[data-era="${era}"]`).click()
      await page.waitForTimeout(1500)
      await page.screenshot({ path: `${OUT}/${tag}-home-room.png` })
      await page.locator('.controls-dock [data-action="music"]').click()
      await page.locator('.sleeve').waitFor()
      await page.waitForTimeout(600)
      await page.screenshot({ path: `${OUT}/${tag}-home-menu.png` })
      await page.locator('.sleeve [data-choice="focus:rain"]').click()
      await page.waitForTimeout(900)
      await page.screenshot({ path: `${OUT}/${tag}-home-focus.png` })
      await page.keyboard.press('Escape')
      await page.locator('[data-mode="easy"]').click()
      await page.locator('[data-action="begin"]').click()
      await page.locator('[data-action="intro-go"]').click()
      await page.locator('[data-stamp="asli"]:enabled').waitFor({ timeout: 40_000 })
      await page.waitForTimeout(600)
      await page.screenshot({ path: `${OUT}/${tag}-day-focus.png` })
      await page.locator('.hud [data-action="music"]').click()
      await page.locator('.sleeve').waitFor()
      await page.waitForTimeout(600)
      await page.screenshot({ path: `${OUT}/${tag}-day-menu.png` })
      await page.locator('.sleeve [data-choice="song:aarambh"]').click()
      await page.keyboard.press('Escape')
      await page.waitForTimeout(900)
      await page.screenshot({ path: `${OUT}/${tag}-day-song.png` })
      console.log('shot', tag)
      await ctx.close()
    }
  }
}
await browser.close()
