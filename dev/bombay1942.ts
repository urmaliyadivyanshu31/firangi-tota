// Dev-only preview of the bombay-1942 desk: `npm run dev`, then open /dev/bombay1942.html.
// Same switches as /dev/stage.html (?tier, ?debug, ?reduced), and ?shot=intro|desk|stamped|read|caught.
import { STAGE_LOST_EVENT, loadStage, mountFallback, type Stage } from '../src/scene/index'
import bombay1942 from '../src/scene/eras/bombay1942'

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
    mountFallback(el, bombay1942.id)
    w.__devDone = true
    return
  }
  w.__devStage = stage
  el.addEventListener(STAGE_LOST_EVENT, (e) => {
    e.preventDefault()
    stage.dispose()
    mountFallback(el, bombay1942.id)
  })
  stage.setEra(bombay1942)
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
    await sleep(250) // the first frames of the intro move, then hold that frame
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
    await stage.stamp('tota')
    await sleep(400)
  }
  if (shot === 'caught') await stage.caught()
  await sleep(300)
  w.__devDone = true
}

void boot()
