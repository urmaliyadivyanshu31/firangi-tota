// The immersive Stage API (immersive-brief.md), as the app and the UI code against it. The scene
// owns the real types; this file mirrors them so the overlay layer can build and test on its own.
import type { Channel, EraId, Lang } from '../content/types'
import type { EraDressing, StampKind } from '../scene/index'

/** One message as the paper shows it. Everything is already filled in for `lang`. */
export interface SheetSpec {
  era: EraId
  channel: Channel
  lang: Lang
  heading?: string
  from: string
  to: string
  dateLine: string
  serial?: string
  /** Already placeholder-filled. */
  body: string
  /** Substrings of body (or from/to) to underline when `pencil` is true. */
  checks: string[]
  pencil: boolean
  /** A small "Real document" label on the paper. Always false: nothing may say a message is real before the stamp (R30b), and the result card says it after. */
  documentMark?: boolean
}

export interface DayTitle {
  big: string
  small: string
}

export type FlashKind = 'right' | 'wrong'

/** What the app needs from the 3D stage. */
export interface ImmersiveStage {
  setEra(d: EraDressing): void
  stamp(kind: StampKind): Promise<void>
  caught(): Promise<void>
  setPaused(p: boolean): void
  dispose(): void
  establish(): Promise<void>
  dayTitle(t: DayTitle): Promise<void>
  showMessage(s: SheetSpec): Promise<void>
  redrawMessage(s: SheetSpec): void
  flash(kind: FlashKind): void
  skip(): void
}

/** Read-aloud with the era's recorded voices. Plays even when sound is off. */
export type { Voice as VoicePlayer, VoiceState } from '../audio/voice'

/** Which voice reads: the era's own, or the dastango, a theatrical storyteller. */
export type VoiceStyle = 'era' | 'dastango'

/** The 2D fallback: the same sheet, drawn flat. */
export interface ImmersiveFallback {
  setEra(id: EraId): void
  showMessage(s: SheetSpec): Promise<void>
  redrawMessage(s: SheetSpec): void
  flash(kind: FlashKind): void
  dispose(): void
}
