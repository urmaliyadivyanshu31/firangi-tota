// Dev-only preview of the toss: `npx vite`, then open /dev/crumple.html.
//   ?era=<id>  ?lang=en|hi  ?tier=low|mid|high  ?reduced  ?fallback (the 2D desk)
// Once the verdict is on the paper, window.__devReady is true; window.__devToss() starts the toss
// and window.__devStage.setPaused() holds it still, so a shoot can take frames (dev/shoot-crumple.mjs).
import type { EraId, Lang } from '../src/content/types'
import { loadStage, mountFallback } from '../src/scene/index'
import { dressingFor } from '../src/scene/eras/index'
import { sampleReveal, sampleSheet } from './samples'

const q = new URLSearchParams(location.search)
const el = document.getElementById('stage') as HTMLElement
const era = (q.get('era') ?? 'delhi-1857') as EraId
const lang = (q.get('lang') ?? 'en') as Lang
const reduced = q.has('reduced')
const w = window as unknown as { __devReady?: boolean; __devStage?: { setPaused(p: boolean): void }; __devToss?: () => Promise<void> }

async function boot() {
  if (q.has('fallback')) {
    // the flat desk runs on animation frames: a clock of our own, so a pause holds the frame still
    let now = 1000
    let paused = false
    Object.defineProperty(performance, 'now', { value: () => now, configurable: true })
    window.requestAnimationFrame = (cb: FrameRequestCallback) =>
      window.setTimeout(() => {
        if (!paused) now += 16
        cb(now)
      }, 16)
    const fb = mountFallback(el, era)
    w.__devStage = { setPaused: (p) => (paused = p) }
    await fb.showMessage(sampleSheet(era, lang))
    await fb.stamp('asli')
    const r = fb.reveal(sampleReveal(era, lang, 'right'))
    fb.skip()
    await r
    w.__devToss = () => fb.toss()
    w.__devReady = true
    return
  }
  const { createStage } = await loadStage()
  const stage = createStage(el, { reducedMotion: reduced })
  if (!stage) return
  w.__devStage = stage
  stage.setEra(dressingFor(era))
  await stage.showMessage(sampleSheet(era, lang))
  await stage.stamp('asli')
  stage.flash('right')
  await stage.reveal(sampleReveal(era, lang, 'right'))
  w.__devToss = () => stage.toss()
  w.__devReady = true
}

void boot()
