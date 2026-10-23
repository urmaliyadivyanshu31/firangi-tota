#!/usr/bin/env node
// Draws the app icons in public/icons/ from the parrot mark in src/ui/icons.ts, with Playwright's
// Chromium (no image tools needed). Run it again only when the mark changes:
//   node scripts/icons.mjs
// - icon-192.png, icon-512.png: the parrot on a paper roundel with a gold rim (purpose "any")
// - maskable-512.png: the same roundel inside the safe zone of a full-bleed court-red square
// - apple-touch-icon.png (180): iOS fills transparency with black, so it is full-bleed too
// - favicon.svg: the bare mark
import { chromium } from '@playwright/test'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(root, 'public', 'icons')
mkdirSync(out, { recursive: true })

const src = readFileSync(join(root, 'src', 'ui', 'icons.ts'), 'utf8')
const m = src.match(/export function parrotMark[\s\S]*?svg\(`([\s\S]*?)`\)/)
if (!m) throw new Error('parrotMark not found in src/ui/icons.ts')
const mark = m[1].replace('class="${cls}"', '').replace(/\s+aria-hidden="true"|\s+focusable="false"/g, '')
  .replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ')

// the 1857 palette: the court-red accent (theme colour), the petition paper, the gold of the vine
const RED = '#7c211b'
const PAPER = '#f0e0bb'
const GOLD = '#b6862e'

/** A paper roundel with a double gold rim and the parrot, `d` px across, centred in a `size` square. */
function roundel(size, d, bg) {
  const r = d / 2
  const c = size / 2
  const markW = d * 0.86
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  ${bg ? `<rect width="${size}" height="${size}" fill="${bg}"/>` : ''}
  <circle cx="${c}" cy="${c}" r="${r}" fill="${PAPER}"/>
  <circle cx="${c}" cy="${c}" r="${r * 0.955}" fill="none" stroke="${GOLD}" stroke-width="${r * 0.035}"/>
  <circle cx="${c}" cy="${c}" r="${r * 0.9}" fill="none" stroke="${GOLD}" stroke-opacity=".55" stroke-width="${r * 0.012}"/>
  <svg x="${c - markW / 2}" y="${c - markW / 2 - d * 0.02}" width="${markW}" height="${markW}" viewBox="0 0 96 96">${mark.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')}</svg>
</svg>`
}

const icons = [
  { file: 'icon-192.png', size: 192, svg: roundel(192, 184) },
  { file: 'icon-512.png', size: 512, svg: roundel(512, 492) },
  // the maskable safe zone is the centre circle of 80% diameter
  { file: 'maskable-512.png', size: 512, svg: roundel(512, 512 * 0.78, RED) },
  { file: 'apple-touch-icon.png', size: 180, svg: roundel(180, 180 * 0.84, RED) },
]

writeFileSync(join(out, 'favicon.svg'), `${mark.trim()}\n`)
const browser = await chromium.launch()
try {
  const page = await browser.newPage()
  for (const icon of icons) {
    await page.setViewportSize({ width: icon.size, height: icon.size })
    await page.setContent(`<!doctype html><html><body style="margin:0;background:transparent">${icon.svg}</body></html>`)
    await page.locator('svg').first().screenshot({ path: join(out, icon.file), omitBackground: true })
    console.log(`wrote public/icons/${icon.file}`)
  }
} finally {
  await browser.close()
}
console.log('wrote public/icons/favicon.svg')
