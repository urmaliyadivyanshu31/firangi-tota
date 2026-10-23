// Plays the real game at 390×844 and screenshots each step into docs/screens/app (gitignored).
// Start the dev server first:
//   npx vite --port 5288 --strictPort &   node dev/shoot-app.mjs
// Runs: Hindi and English bombay-1942 Easy (3 days each, then a wrong stamp / a timeout), a full
// survived run, the daily puzzle (and its stored replay), credits. Prints console errors per run.
// ONLY=hi,en,survive,daily limits the runs. SKIP_TIMEOUT=1 skips the 90 s agarbatti wait.
import { mkdirSync } from 'node:fs'
import { chromium } from '@playwright/test'

const BASE = process.env.BASE ?? 'http://localhost:5288'
const OUT = process.env.OUT ?? 'docs/screens/app'
const ERA = 'bombay-1942'
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({
  args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal', '--enable-unsafe-swiftshader'],
})
const ANDROID_UA = 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const report = {}

async function newPage(run, desktop = false) {
  const ctx = await browser.newContext({
    viewport: desktop ? { width: 1280, height: 800 } : { width: 390, height: 844 },
    deviceScaleFactor: desktop ? 1 : 2,
    isMobile: !desktop,
    hasTouch: !desktop,
    ...(desktop ? {} : { userAgent: ANDROID_UA }),
    permissions: ['clipboard-read', 'clipboard-write'],
  })
  const page = await ctx.newPage()
  const errors = []
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(`${m.type()}: ${m.text()}`) })
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  report[run] = { errors, shots: [] }
  let n = 0
  const shot = async (name) => {
    const file = `${OUT}/${run}-${String(++n).padStart(2, '0')}-${name}.png`
    await page.screenshot({ path: file })
    report[run].shots.push(file)
  }
  return { ctx, page, shot }
}

/** The chapter queue the app builds for ?seed=, from the same modules the dev server serves. */
async function answers(page, era, difficulty, seed) {
  return page.evaluate(async ([era, difficulty, seed]) => {
    const { eraById } = await import('/src/content/registry.ts')
    const { createChapter } = await import('/src/game/state.ts')
    const { mulberry32 } = await import('/src/game/rng.ts')
    return createChapter(eraById(era), difficulty, mulberry32(seed)).queue.map((m) => m.real)
  }, [era, difficulty, seed])
}

async function dailyAnswers(page) {
  return page.evaluate(async () => {
    const { ERAS } = await import('/src/content/registry.ts')
    const { dailyFrom } = await import('/src/game/daily.ts')
    const d = dailyFrom(Date.now(), ERAS)
    return { era: d.era, number: d.number, real: d.messages.map((m) => m.real) }
  })
}

const stageReady = (page) => page.waitForSelector('#stage canvas', { state: 'attached', timeout: 15000 }).catch(() => null)

async function toDay1(page, shot) {
  await page.click(`[data-era="${ERA}"]`)
  await sleep(600)
  await shot('setup')
  await page.click('[data-mode="easy"]')
  await sleep(400)
  await shot('intro-1')
  await page.click('[data-action="next"]')
  await sleep(300)
  await shot('intro-2')
  await page.click('[data-action="next"]')
  await sleep(1600) // the paper slides in
}

async function stampDay(page, shot, verdict, label) {
  await page.click(`[data-stamp="${verdict}"]`)
  await sleep(650) // the stamp is about to hit the paper
  if (label) await shot(`${label}-stamping`)
  await page.waitForSelector('.reveal', { timeout: 8000 })
  await sleep(250)
  if (label) await shot(`${label}-reveal`)
}

async function chapterRun(run, lang, seed, finish) {
  const { ctx, page, shot } = await newPage(run)
  await page.goto(`${BASE}/?seed=${seed}${lang === 'en' ? '&lang=en' : ''}`)
  if (lang === 'hi') {
    await page.waitForSelector('.screen--lang')
    await shot('language')
    await page.click('[data-lang="hi"]')
  }
  await page.waitForSelector('.screen--home')
  await stageReady(page)
  await sleep(3200) // the desk's intro move
  await shot('home')
  const q = await answers(page, ERA, 'easy', seed)
  await toDay1(page, shot)
  for (let day = 1; day <= 3; day++) {
    await shot(`day${day}`)
    if (day === 1) {
      await page.click('[data-tab="file"]')
      await sleep(300)
      await shot('day1-casefile')
      await page.click('[data-tab="rules"]')
      await sleep(300)
      await shot('day1-rulebook')
      await page.click('[data-tab="rules"]')
    }
    await stampDay(page, shot, q[day - 1] ? 'asli' : 'tota', `day${day}`)
    await page.click('[data-action="next"]')
    await sleep(1500)
  }
  await finish(page, shot, q)
  await ctx.close()
}

const runs = {
  async hi() {
    await chapterRun('hi', 'hi', 7, async (page, shot, q) => {
      await shot('day4')
      await stampDay(page, shot, q[3] ? 'tota' : 'asli', 'day4-wrong')
      await page.click('[data-action="next"]')
      await sleep(700)
      await shot('end-caught')
      await page.evaluate(() => document.querySelector('.end__scroll')?.scrollBy(0, 700))
      await sleep(200)
      await shot('end-caught-receipts')
      await page.click('[data-action="share"]')
      await sleep(500)
      await shot('end-share-toast')
    })
  },
  async en() {
    await chapterRun('en', 'en', 11, async (page, shot) => {
      await shot('day4')
      if (process.env.SKIP_TIMEOUT) return
      await sleep(70_000)
      await shot('day4-agarbatti-low')
      await page.waitForSelector('.reveal', { timeout: 30_000 })
      await sleep(300)
      await shot('day4-too-slow')
      await page.click('[data-action="next"]')
      await sleep(700)
      await shot('end-caught')
      await page.click('[data-action="home"]')
      await sleep(600)
      await shot('home-after')
    })
  },
  async survive() {
    const { ctx, page, shot } = await newPage('survive')
    await page.goto(`${BASE}/?seed=21&lang=en`)
    await page.waitForSelector('.screen--home')
    const q = await answers(page, ERA, 'easy', 21)
    await page.click(`[data-era="${ERA}"]`)
    await page.click('[data-mode="easy"]')
    await page.click('[data-action="next"]')
    await page.click('[data-action="next"]')
    for (let day = 1; day <= 7; day++) {
      await sleep(400)
      await stampDay(page, shot, q[day - 1] ? 'asli' : 'tota', day === 7 ? 'day7' : null)
      await page.click('[data-action="next"]')
    }
    await page.waitForSelector('.screen--end')
    await sleep(600)
    await shot('end-survived')
    await page.click('[data-action="share"]')
    await sleep(400)
    await shot('share-toast')
    await page.click('[data-action="home"]')
    await sleep(600)
    await shot('home-after')
    await page.click('[data-action="credits"]')
    await sleep(300)
    await shot('credits')
    await page.evaluate(() => document.querySelector('.credits__scroll')?.scrollBy(0, 900))
    await sleep(200)
    await shot('credits-doc')
    await ctx.close()
  },
  async daily() {
    const { ctx, page, shot } = await newPage('daily')
    await page.goto(`${BASE}/?lang=en`)
    await page.waitForSelector('.screen--home')
    await stageReady(page)
    await sleep(1500)
    const d = await dailyAnswers(page)
    report.daily.puzzle = d
    await page.click('[data-action="daily"]')
    await sleep(1600)
    for (let i = 0; i < 5; i++) {
      await shot(`msg${i + 1}`)
      // one deliberate miss on the 3rd message: the puzzle still plays all 5
      const right = d.real[i] ? 'asli' : 'tota'
      const wrong = d.real[i] ? 'tota' : 'asli'
      await stampDay(page, shot, i === 2 ? wrong : right, `msg${i + 1}`)
      await page.click('[data-action="next"]')
      await sleep(1300)
    }
    await page.waitForSelector('.share__text')
    await shot('result')
    await page.evaluate(() => document.querySelector('.end__scroll')?.scrollTo(0, 99999))
    await sleep(200)
    await shot('result-share-grid')
    report.daily.share = await page.textContent('.share__text')
    await page.click('[data-action="share"]')
    await sleep(400)
    await shot('share-toast')
    report.daily.clipboard = await page.evaluate(() => navigator.clipboard.readText().catch((e) => String(e)))
    await page.reload()
    await page.waitForSelector('.screen--home')
    await sleep(500)
    await shot('home-played')
    await page.click('[data-action="daily"]')
    await sleep(500)
    await shot('replay-stored')
    report.daily.replayShowsResult = (await page.$('[data-stamp]')) === null && (await page.textContent('.share__text')) === report.daily.share
    await ctx.close()
  },
}

runs.desktop = async () => {
  const { ctx, page, shot } = await newPage('desktop', true)
  await page.goto(`${BASE}/?seed=7&lang=en`)
  await page.waitForSelector('.screen--home')
  await stageReady(page)
  await sleep(3200)
  await shot('home')
  const q = await answers(page, ERA, 'easy', 7)
  await toDay1(page, shot)
  await shot('day1')
  await stampDay(page, shot, q[0] ? 'asli' : 'tota', 'day1')
  await ctx.close()
}

const only = process.env.ONLY ? process.env.ONLY.split(',') : Object.keys(runs)
await Promise.all(only.map((name) => runs[name]().catch((e) => { report[name] = { ...(report[name] ?? {}), failed: String(e?.stack ?? e) } })))
await browser.close()
console.log(JSON.stringify(report, null, 2))
