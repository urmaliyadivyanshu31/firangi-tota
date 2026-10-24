// Renders each era's full ambience offline in a browser (dev/ambience.html, the game's own code)
// and measures it with ffmpeg's EBU R128 meter: integrated loudness, loudness range, true peak and
// the loudest moment. Writes docs/screens/ambience-<era>.mp3 (30 s, with several room sounds, so
// they can be heard) for listening.
//   npx vite --port 5184 --strictPort --host 127.0.0.1 &   node dev/ambience-render.mjs
// LAYERS=1 also measures the bed, the steady layers and the room sounds alone (saved under
// docs/screens/ambience-layers/).
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { chromium } from '@playwright/test'

const BASE = process.env.BASE ?? 'http://127.0.0.1:5184'
const OUT = 'docs/screens'
const ERAS = ['delhi-1857', 'lahore-1929', 'bombay-1942', 'delhi-1947']
const tmp = mkdtempSync(join(process.env.TMPDIR ?? tmpdir(), 'amb-render-'))
mkdirSync(OUT, { recursive: true })
const LAYER_DIR = join(OUT, 'ambience-layers')
if (process.env.LAYERS) mkdirSync(LAYER_DIR, { recursive: true })

function measure(file) {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-v', 'verbose', '-i', file, '-af', 'ebur128=peak=true:framelog=verbose', '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 1 << 28 })
  const s = r.stderr
  let M = -Infinity
  let S = -Infinity
  for (const m of s.matchAll(/M:\s*(-?[\d.]+)\s+S:\s*(-?[\d.]+)/g)) {
    M = Math.max(M, Number(m[1]))
    S = Math.max(S, Number(m[2]))
  }
  const sum = s.slice(s.lastIndexOf('Summary:'))
  const num = (re) => Number((sum.match(re) ?? [])[1])
  return { I: num(/I:\s+(-?[\d.]+) LUFS/), LRA: num(/LRA:\s+(-?[\d.]+) LU/), TP: num(/Peak:\s+(-?[\d.]+) dBFS/), M, S }
}

const fmt = (m) => `I ${m.I.toFixed(1)} LUFS  LRA ${m.LRA.toFixed(1)} LU  TP ${m.TP.toFixed(1)} dBFS  max M ${m.M.toFixed(1)}  max S ${m.S.toFixed(1)}`

const browser = await chromium.launch()
const page = await browser.newPage()
page.on('pageerror', (e) => console.log('page error:', e.message))
await page.goto(`${BASE}/dev/ambience.html`)
await page.locator('#status', { hasText: 'ready' }).waitFor()

async function render(req, file) {
  let b64
  for (let attempt = 0; ; attempt++) {
    try {
      b64 = await page.evaluate((r) => window.renderAmbience(r), req)
      break
    } catch (e) {
      // the dev server reloads the page when a source file has just changed: wait and go again
      if (attempt > 2 || !/context was destroyed|renderAmbience/.test(String(e))) throw e
      await page.waitForTimeout(1500)
      await page.locator('#status', { hasText: 'ready' }).waitFor()
    }
  }
  writeFileSync(file, Buffer.from(b64, 'base64'))
  return measure(file)
}

const rows = []
for (const [i, era] of ERAS.entries()) {
  // what the owner hears: 30 s with a room sound every 5–8 s
  const demo = join(OUT, `ambience-${era}.wav`)
  const d = await render({ era, seconds: 30, burstGap: [5, 8], seed: 11 + i }, demo)
  spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', demo, '-c:a', 'libmp3lame', '-b:a', '160k', join(OUT, `ambience-${era}.mp3`)])
  // what a player gets: two minutes at the game's own pace (a room sound every 15–40 s)
  const g = await render({ era, seconds: 120, seed: 21 + i }, join(tmp, `${era}-game.wav`))
  rows.push(`${era}\n  30 s demo  ${fmt(d)}\n  120 s game ${fmt(g)}`)
  if (process.env.LAYERS) {
    for (const layer of ['bed', 'music', 'steady', 'bursts']) {
      const layers = { bed: layer === 'bed', music: layer === 'music', steady: layer === 'steady', bursts: layer === 'bursts' }
      const m = await render({ era, seconds: 30, burstGap: [5, 8], layers, seed: 31 + i }, join(LAYER_DIR, `${era}-${layer}.wav`))
      rows.push(`  ${layer.padEnd(10)} ${fmt(m)}`)
    }
  }
}
await browser.close()
console.log(rows.join('\n'))
