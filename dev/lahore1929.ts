// Dev-only preview of the lahore-1929 desk: `npm run dev`, then open /dev/lahore1929.html.
//   ?tier=low|mid|high  force a tier       ?debug     tier, fps, draw calls, triangles, DPR
//   ?reduced            reduced motion     ?fallback  the 2D fallback
//   ?shot=intro|desk|stamped|read|caught  script a state for screenshots; sets window.__devDone when settled
import type { EraId } from '../src/content/types'
import { STAGE_LOST_EVENT, loadStage, mountFallback, type Stage } from '../src/scene/index'
import lahore1929 from '../src/scene/eras/lahore1929'

const q = new URLSearchParams(location.search)
const el = document.getElementById('stage') as HTMLElement
const era: EraId = 'lahore-1929'
const reduced = q.has('reduced') || matchMedia('(prefers-reduced-motion: reduce)').matches
const shot = q.get('shot')
const w = window as unknown as { __devDone?: boolean; __devStage?: Stage }
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
if (shot) document.body.classList.add('shot')

async function boot() {
  if (q.has('fallback')) {
    mountFallback(el, era)
    w.__devDone = true
    return
  }
  const { createStage } = await loadStage()
  const stage = createStage(el, { reducedMotion: reduced })
  if (!stage) {
    mountFallback(el, era)
    w.__devDone = true
    return
  }
  w.__devStage = stage
  el.addEventListener(STAGE_LOST_EVENT, (e) => {
    e.preventDefault()
    stage.dispose()
    mountFallback(el, era)
  })
  const t0 = performance.now()
  stage.setEra(lahore1929)
  ;(window as unknown as { __buildMs?: number }).__buildMs = performance.now() - t0 // texture painting + geometry
  for (const b of document.querySelectorAll<HTMLButtonElement>('#bar button')) {
    b.onclick = () => {
      const act = b.dataset.act
      if (act === 'paper') stage.showPaper()
      else if (act === 'asli' || act === 'tota') void stage.stamp(act)
      else if (act === 'caught') void stage.caught()
    }
  }
  if (!shot) return
  if (shot === 'intro') {
    // the wide establishing shot, just as the camera starts to move in
    await sleep(200)
    w.__devDone = true
    return
  }
  await sleep(2900) // the intro move
  if (shot === 'desk') {
    w.__devDone = true
    return
  }
  stage.showPaper()
  await sleep(1400)
  if (shot === 'stamped' || shot === 'caught') {
    await stage.stamp('asli')
    await sleep(400)
  }
  if (shot === 'caught') await stage.caught()
  await sleep(300)
  w.__devDone = true
}

void boot()
