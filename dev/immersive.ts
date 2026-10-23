// Dev-only: plays a full day on the 3D stage with sample sheets, so screenshots and video need no app.
//   ?era=<id>      the era (default delhi-1857)      ?lang=en|hi     the language (default en)
//   ?tier=low|mid|high                                 ?reduced        reduced motion
//   ?fallback      the 2D fallback                     ?sample=<n>     which sample sheet (1929 has a leaflet)
//   ?verdict=right|wrong   the stamp and flash at the end (default right)
//   ?reveal=right|wrong|caught   then the verdict on the paper: pencil marks, the turn, the back
//   ?auto          plays the day on load and marks each beat in window.__beat (for the shoot script)
//   ?hud           draws stand-ins for the app's top bar and stamp buttons
//   ?long          a long text, to check the sheet copes
import type { EraId, Lang } from '../src/content/types'
import { STAGE_LOST_EVENT, loadStage, mountFallback, type Fallback, type Stage } from '../src/scene/index'
import { dressingFor } from '../src/scene/eras/index'
import type { SheetSpec } from '../src/scene/types'
import { longSheet, sampleReveal, sampleSheet, sampleTitle, type RevealKind } from './samples'

const q = new URLSearchParams(location.search)
const el = document.getElementById('stage') as HTMLElement
const era = (q.get('era') ?? 'delhi-1857') as EraId
let lang = (q.get('lang') ?? 'en') as Lang
const reduced = q.has('reduced')
const sampleIx = Number(q.get('sample') ?? 0)
const revealKind = (['right', 'wrong', 'caught'] as const).find((k) => q.get('reveal') === k) as RevealKind | undefined
const verdict = revealKind ? (revealKind === 'right' ? 'right' : 'wrong') : q.get('verdict') === 'wrong' ? 'wrong' : 'right'
const w = window as unknown as { __beat?: string; __devStage?: Stage; __cues?: string[] }
w.__cues = []
if (q.has('auto')) document.body.classList.add('shot')
if (q.has('hud')) document.body.classList.add('hudon')

const sheet = (): SheetSpec => (q.has('long') ? longSheet(lang) : sampleSheet(era, lang, sampleIx))
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const beat = (name: string) => {
  w.__beat = name
  console.log(`[beat] ${name} @${Math.round(performance.now())}`)
}

interface Desk {
  establish(): Promise<void>
  dayTitle(t: { big: string; small: string }): Promise<void>
  showMessage(s: SheetSpec): Promise<void>
  redrawMessage(s: SheetSpec): void
  stamp(k: 'asli' | 'tota'): Promise<void>
  flash(k: 'right' | 'wrong'): void
  skip(): void
  reveal(r: ReturnType<typeof sampleReveal>): Promise<void>
  getSourceRect(): { x: number; y: number; w: number; h: number } | null
}

function fromFallback(f: Fallback): Desk {
  return {
    establish: () => Promise.resolve(),
    dayTitle: (t) => f.dayTitle(t),
    showMessage: (s) => f.showMessage(s),
    redrawMessage: (s) => f.redrawMessage(s),
    stamp: (k) => f.stamp(k),
    flash: (k) => f.flash(k),
    skip: () => undefined,
    reveal: (r) => f.reveal(r),
    getSourceRect: () => f.getSourceRect(),
  }
}

async function boot() {
  let desk: Desk
  if (q.has('fallback')) desk = fromFallback(mountFallback(el, era))
  else {
    const { createStage } = await loadStage()
    const stage = createStage(el, { reducedMotion: reduced, onCue: (c) => w.__cues?.push(c) })
    if (!stage) desk = fromFallback(mountFallback(el, era))
    else {
      w.__devStage = stage
      el.addEventListener(STAGE_LOST_EVENT, (e) => {
        e.preventDefault()
        stage.dispose()
        desk = fromFallback(mountFallback(el, era))
      })
      stage.setEra(dressingFor(era))
      desk = stage
    }
  }
  const s = sheet()
  const stampKind = (verdict === 'right') === !!s.documentMark ? 'asli' : 'tota'
  const play = async () => {
    beat('establish')
    await desk.establish()
    await sleep(900)
    beat('title')
    await desk.dayTitle(sampleTitle(era, lang))
    beat('arrival')
    await desk.showMessage(sheet())
    beat('read')
    await sleep(1600)
    beat('stamp')
    await desk.stamp(stampKind)
    beat('flash')
    desk.flash(verdict)
    if (revealKind) {
      await sleep(250)
      beat('reveal')
      await desk.reveal(sampleReveal(era, lang, revealKind, sampleIx))
      beat('back')
      // a box where the app would lay its accessible source button
      const r = desk.getSourceRect()
      if (r && q.has('hits')) {
        const box = document.createElement('div')
        box.style.cssText = `position:fixed;left:${r.x}px;top:${r.y}px;width:${r.w}px;height:${r.h}px;outline:2px dashed #3fa9ff;pointer-events:none;z-index:9`
        document.body.appendChild(box)
      }
      await sleep(1500)
      beat('done')
      return
    }
    if (s.documentMark && verdict === 'right') desk.redrawMessage({ ...sheet(), revealed: true })
    await sleep(1700)
    beat('result')
    await sleep(600)
    beat('done')
  }
  for (const b of document.querySelectorAll<HTMLButtonElement>('#bar button')) {
    b.onclick = () => {
      const act = b.dataset.act
      if (act === 'day') void play()
      else if (act === 'establish') void desk.establish()
      else if (act === 'title') void desk.dayTitle(sampleTitle(era, lang))
      else if (act === 'message') void desk.showMessage(sheet())
      else if (act === 'asli' || act === 'tota') void desk.stamp(act)
      else if (act === 'right' || act === 'wrong') desk.flash(act)
      else if (act === 'skip') desk.skip()
      else if (act === 'lang') {
        lang = lang === 'en' ? 'hi' : 'en'
        desk.redrawMessage(sheet())
      }
    }
  }
  if (q.has('auto')) {
    await sleep(q.has('fallback') ? 300 : 1200) // the stage's own intro move settles first
    await play()
  } else beat('ready')
}

void boot()
