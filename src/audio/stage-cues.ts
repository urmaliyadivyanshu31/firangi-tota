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
  // a wrong verdict is voiced beat by beat by the caught sequence (below), never at the stamp
  wrong: null,
  // the stamp's own thunk depends on which stamp, so the app plays stampAsli or stampTota itself
  stamp: null,
  // the era's stamp coming down on the back of the paper after the verdict
  verdictStamp: 'stampAsli',
  // the caught sequence: each beat of the score sounds as itself
  bugleAlarm: 'bugleAlarm',
  kettleDrum: 'kettleDrum',
  whistleShort: 'whistleShort',
  whistleLong: 'whistleLong',
  bootsRunning: 'bootsRunning',
  airRaidWail: 'airRaidWail',
  phoneBell: 'phoneBell',
  knockFar: 'knockFar',
  knockNear: 'knockNear',
  knockDoor: 'knockDoor',
  caughtHush: 'caughtHush',
  caughtDark: 'caughtDark',
  // after Begin: the intro cards slide onto the desk, the clip snaps onto the YOU photo
  cardSlide: 'cardSlide',
  clipSnap: 'clipSnap',
}

/** The sound for a stage cue, or null when the stage moment has no sound of its own. */
export function cueForStage(name: StageCueName): Cue | null {
  return MAP[name] ?? null
}
