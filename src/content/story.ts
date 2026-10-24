import type { Fact } from './types'

// A case-file story sentence: plain words, and the [[highlighted]] words that carry the fact.

export interface StoryPart { text: string; hl: boolean }

const MARK = /\[\[([^[\]]+)\]\]/g

/** The sentence split into plain runs and highlighted runs, in order. */
export function storyParts(story: string): StoryPart[] {
  const out: StoryPart[] = []
  let last = 0
  MARK.lastIndex = 0
  for (let m = MARK.exec(story); m; m = MARK.exec(story)) {
    if (m.index > last) out.push({ text: story.slice(last, m.index), hl: false })
    out.push({ text: m[1]!, hl: true })
    last = m.index + m[0].length
  }
  if (last < story.length) out.push({ text: story.slice(last), hl: false })
  return out
}

/** The sentence as it is read: the markers gone. */
export function plainStory(story: string): string {
  return story.replace(/\[\[|\]\]/g, '')
}

/** Brackets left over once every well-formed [[highlight]] is taken out (nested, empty or unclosed). */
export function strayBrackets(story: string): boolean {
  return /[[\]]/.test(story.replace(MARK, ''))
}

/** The facts grouped into the case file's paragraphs, keeping their order. */
export function storyParas<F extends Pick<Fact, 'para'>>(facts: F[]): F[][] {
  const out: F[][] = []
  let para: number | null = null
  for (const f of facts) {
    if (f.para !== para || out.length === 0) out.push([])
    para = f.para
    out[out.length - 1]!.push(f)
  }
  return out
}
