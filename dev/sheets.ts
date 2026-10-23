// Dev-only: every sheet design, as drawSheet renders it into the 3D texture (1024 px wide), shown
// at the size the lean-in gives it on a 390 px phone. `?w=<css px>` changes the display width,
// `?stamp` adds an imprint, `?nopencil` turns the pencil marks off, `?title` adds the day titles.
import type { Lang } from '../src/content/types'
import { TITLE_TONE, drawDayTitle, drawSheet, loadSheetFonts, measureSheet } from '../src/scene/sheet'
import type { SheetSpec } from '../src/scene/types'
import { ERA_IDS, longSheet, sampleCount, sampleSheet, sampleTitle } from './samples'

const q = new URLSearchParams(location.search)
const W = Number(q.get('w') ?? 359)
const grid = document.getElementById('grid') as HTMLElement
const w = window as unknown as { __devDone?: boolean }

function add(label: string, s: SheetSpec) {
  const c = document.createElement('canvas')
  const g = c.getContext('2d')
  if (!g) return
  const m = measureSheet(g, s)
  c.width = 1024
  c.height = Math.round(1024 * m.aspect)
  c.style.width = `${W}px`
  c.style.height = `${(W * m.aspect).toFixed(1)}px`
  drawSheet(g, c.width, c.height, s, q.has('stamp') ? { kind: s.body.length % 2 ? 'asli' : 'tota', at: m.stampAt, rot: -0.2 } : undefined)
  const f = document.createElement('figure')
  const cap = document.createElement('figcaption')
  cap.textContent = `${label} · aspect ${m.aspect.toFixed(2)} · body ${m.body}u = ${((m.body * W) / 1000).toFixed(1)}px`
  f.append(cap, c)
  grid.appendChild(f)
}

async function boot() {
  await loadSheetFonts(undefined, 8000)
  const langs: Lang[] = ['en', 'hi']
  for (const era of ERA_IDS) {
    for (let i = 0; i < sampleCount(era); i++) {
      for (const lang of langs) add(`${era} ${i} ${lang}`, sampleSheet(era, lang, i, !q.has('nopencil')))
    }
  }
  add('long en', longSheet('en'))
  if (q.has('title')) {
    for (const era of ERA_IDS) {
      for (const lang of langs) {
        const c = document.createElement('canvas')
        c.width = 1024
        c.height = 512
        c.style.width = `${W}px`
        c.style.background = '#3a2a20'
        const g = c.getContext('2d')
        if (g) drawDayTitle(g, 1024, 512, sampleTitle(era, lang), TITLE_TONE[era])
        grid.appendChild(c)
      }
    }
  }
  w.__devDone = true
}

void boot()
