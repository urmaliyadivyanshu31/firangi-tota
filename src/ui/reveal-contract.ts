// The reveal on the paper (P1's stage.reveal): after the stamp the stage circles the slip, writes a
// margin note, and turns the paper over to show the verdict in the form's own type. Mirrored here
// until the stage ships it; then this re-exports the scene's types.
import type { Lang } from '../content/types'

export interface RevealSpec {
  outcome: 'right' | 'wrong' | 'timeout'
  real: boolean
  /** The real-document tag may show now (R30b: only after the stamp). */
  documentMark: boolean
  /** What to circle on the front: the forgery's slip, or the details that check out. */
  highlight: string[]
  /** The margin note: the one-line tell or why. */
  note: string
  back: {
    /** "You passed the Tota's forgery" / "You rejected a genuine message" / "Too slow", or Right. */
    verdictLine: string
    tell: string
    /** The chapter's end: the era's ending title and one line of what happened. */
    consequence?: string
    /** The chapter's end: the era's ending stamp. */
    stamp?: string
    /** The citation, short. */
    source: string
  }
  lang: Lang
}

/** What a desk offers when it can reveal on the paper. */
export interface RevealDesk {
  reveal(s: RevealSpec): Promise<void>
  /** Where the source line sits on screen once the back is up, for an accessible button over it. */
  getSourceRect(): DOMRect | null
}
