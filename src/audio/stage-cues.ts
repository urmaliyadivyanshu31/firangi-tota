// The stage's choreography cues (src/scene StageOptions.onCue) mapped to sounds. One helper, so the
// app wires sound with a single line:
//   createStage(el, { reducedMotion, onCue: (n) => { const c = cueForStage(n); if (c) audio.cue(c) } })
import type { StageCueName } from '../scene/types'
import type { Cue } from './synth'

const MAP: Record<StageCueName, Cue | null> = {
  key: 'typeKey',
  space: 'typeSpace',
  ding: 'typeDing',
  return: 'typeReturn',
  seal: 'sealCrack',
  unfold: 'paperUnfold',
  flap: 'envelopeFlap',
  title: 'titleSettle',
  flip: 'page',
  arrive: 'arrive',
  right: 'correct',
  wrong: 'caught',
  // the stamp's own thunk depends on which stamp, so the app plays stampAsli or stampTota itself
  stamp: null,
  // the era's stamp coming down on the back of the paper after the verdict
  verdictStamp: 'stampAsli',
  // the read paper tossed into the basket, and landing there
  toss: 'paperToss',
  tossLand: 'basketLand',
}

/** The sound for a stage cue, or null when the stage moment has no sound of its own. */
export function cueForStage(name: StageCueName): Cue | null {
  return MAP[name] ?? null
}
