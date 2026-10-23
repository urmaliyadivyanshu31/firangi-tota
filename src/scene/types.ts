// Shared scene types. Type-only imports of three keep this module out of the three.js chunk.
import type * as THREE from 'three'
import type { EraId } from '../content/types'

export type QualityTier = 'low' | 'mid' | 'high'
export type StampKind = 'asli' | 'tota'

/**
 * One era's desk. `build` adds the room, desk, lamp and props to `scene` and returns per-frame
 * `update` and `dispose`. The stage owns the paper, the two stamps, dust and the camera, and
 * places them on the shared desk layout from `props.ts` (`DESK`, `SPOTS`), so dressings keep
 * those spots clear. A dressing whose shadow-casting parts move calls `markShadowsDirty(scene)`
 * from `props.ts` in `update`, because shadow maps only re-render on request.
 */
export interface EraDressing {
  id: EraId
  build(ctx: { scene: THREE.Scene; tier: QualityTier; rng: () => number }): {
    update(tMs: number): void
    dispose(): void
  }
  /** The desk shot, authored for a portrait phone (about 390×844). The stage refits it per aspect. */
  camera: { pos: [number, number, number]; look: [number, number, number] }
  /** The warm colour of the era's lamp; tints the fill light and dust. */
  lightColor: number
}

export interface StageOptions {
  reducedMotion: boolean
  forceTier?: QualityTier
}

export interface Stage {
  setEra(d: EraDressing): void
  /** A fresh sheet slides onto the desk and the camera leans in to read. */
  showPaper(): void
  /** Raise, move, press, shake; resolves when the stamp is back at rest. */
  stamp(kind: StampKind): Promise<void>
  /** A short dark beat: the light dims and the camera drops. Holds until the next showPaper or setEra. */
  caught(): Promise<void>
  setPaused(p: boolean): void
  dispose(): void
}

/**
 * Dispatched (cancelable) on the stage's mount element when the WebGL context is lost. The app
 * calls `preventDefault()` and mounts its own fallback; if nobody does, the stage mounts
 * `mountFallback` itself. Either way the stage keeps resolving `stamp` and `caught` at once.
 */
export const STAGE_LOST_EVENT = 'ft:stage-lost'
