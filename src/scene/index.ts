// What the app imports before the first paint. Nothing here imports three.js statically (ruling
// R10): the 3D stage and three.js arrive in their own chunk through loadStage().
export type { DayTitle, EarnSpec, EraDressing, PileSpec, RewardDrop, FlashKind, IntroCard, IntroSpec, QualityTier, RevealSpec, RevealStamp, ScreenRect, SheetSpec, SheetStamp, Stage, StageCueName, StageOptions, StampKind } from './types'
// the paper drawer has no three.js in it: the app may use it for share cards and preloading fonts
export { drawSheet, loadSheetFonts, measureSheet } from './sheet'
export { STAGE_LOST_EVENT } from './types'
export { mountFallback, type Fallback } from './fallback'

/**
 * Loads the 3D stage chunk. Call it after the first paint, then `createStage(el, opts)`; when that
 * returns null (no WebGL2), use `mountFallback(el, era)` instead.
 */
export function loadStage(): Promise<typeof import('./stage')> {
  return import('./stage')
}
