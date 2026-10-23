// Dev-only preview of the delhi-1947 desk: `npm run dev`, then open /dev/delhi1947.html.
// Same switches as dev/stage.ts, but it loads the cipher-room dressing directly (no era index):
//   ?tier=low|mid|high  force a tier       ?debug     tier, fps, draw calls, triangles, DPR
//   ?reduced            reduced motion     ?shot=stamped|read|caught|desk  script a state for
//   screenshots; sets window.__devDone when settled
import { STAGE_LOST_EVENT, loadStage, mountFallback, type Stage } from '../src/scene/index'
import delhi1947 from '../src/scene/eras/delhi1947'

const q = new URLSearchParams(location.search)
const el = document.getElementById('stage') as HTMLElement
const reduced = q.has('reduced') || matchMedia('(prefers-reduced-motion: reduce)').matches
const shot = q.get('shot')
const w = window as unknown as { __devDone?: boolean; __devStage?: Stage }
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
if (shot) document.body.classList.add('shot')

async function boot() {
  const { createStage } = await loadStage()
  const stage = createStage(el, { reducedMotion: reduced })
  if (!stage) {
    mountFallback(el, delhi1947.id)
    w.__devDone = true
    return
  }
  w.__devStage = stage
  el.addEventListener(STAGE_LOST_EVENT, (e) => {
    e.preventDefault()
    stage.dispose()
    mountFallback(el, delhi1947.id)
  })
  stage.setEra(delhi1947)
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
    // the first moments of the intro move, which looks at the wall above the desk
    stage.setPaused(true)
    await sleep(300)
    stage.setPaused(false)
    await sleep(60)
    stage.setPaused(true)
    w.__devDone = true
    return
  }
  await sleep(2900) // the intro move
  if (shot !== 'desk') {
    stage.showPaper()
    await sleep(1400)
  }
  if (shot === 'stamped' || shot === 'caught') {
    await stage.stamp('asli')
    await sleep(400)
  }
  if (shot === 'caught') await stage.caught()
  await sleep(300)
  w.__devDone = true
}

void boot()
