// Dev-only stage preview: `npm run dev`, then open /dev/stage.html.
//   ?tier=low|mid|high  force a tier       ?debug     tier, fps, draw calls, triangles, DPR
//   ?reduced            reduced motion     ?fallback  the 2D fallback
//   ?shot=stamped|read|caught  script a state for screenshots; sets window.__devDone when settled
//   ?era=<id>           that era's desk (the sample room for an era without one; ?era=sample forces it)
import type { EraId } from '../src/content/types'
import { STAGE_LOST_EVENT, loadStage, mountFallback, type Stage } from '../src/scene/index'
import { sampleDressing } from '../src/scene/eras/_sample'
import { dressingFor } from '../src/scene/eras/index'

const q = new URLSearchParams(location.search)
const el = document.getElementById('stage') as HTMLElement
const eraParam = q.get('era') ?? 'delhi-1857'
const era = (eraParam === 'sample' ? 'delhi-1857' : eraParam) as EraId
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
  stage.setEra(eraParam === 'sample' ? sampleDressing : dressingFor(era))
  for (const b of document.querySelectorAll<HTMLButtonElement>('#bar button')) {
    b.onclick = () => {
      const act = b.dataset.act
      if (act === 'paper') stage.showPaper()
      else if (act === 'asli' || act === 'tota') void stage.stamp(act)
      else if (act === 'caught') void stage.caught()
    }
  }
  if (!shot) return
  await sleep(2900) // the intro move
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
