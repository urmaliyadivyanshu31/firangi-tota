import fixture from '../../src/content/eras/_fixture/index'
import type { Era, EraId, Message } from '../../src/content/types'
import type { ChapterState } from '../../src/game/state'

/** A deep copy of the fixture era, safe to mutate in a test. */
export function era(over: Partial<Era> = {}): Era {
  return { ...(JSON.parse(JSON.stringify(fixture)) as Era), ...over }
}

export function msgById(e: Era, id: string): Message {
  const m = e.messages.find((x) => x.id === id)
  if (!m) throw new Error(`no message ${id}`)
  return m
}

/** A 7-day easy chapter whose queue alternates the fixture's genuine m1 and forged m2. */
export function chapter(e: Era, over: Partial<ChapterState> = {}): ChapterState {
  const m1 = msgById(e, 'm1')
  const m2 = msgById(e, 'm2')
  return {
    era: e.id,
    difficulty: 'easy',
    day: 1,
    days: 7,
    queue: [m1, m2, m1, m2, m1, m2, m1],
    phase: 'reading',
    ...over,
  }
}

const IDS: EraId[] = ['delhi-1857', 'lahore-1929', 'bombay-1942', 'delhi-1947']

/** Four eras built from the fixture, deliberately shuffled so order has to come from `order`. */
export function fourEras(): Era[] {
  const years = ['1857', '1929', '1942', '1947']
  const channels = ['petition', 'note', 'radio', 'telegram'] as const
  const list = IDS.map((id, i) =>
    era({
      id,
      order: (i + 1) as 1 | 2 | 3 | 4,
      year: years[i]!,
      channel: channels[i]!,
      title: { en: `Title ${years[i]}`, hi: `शीर्षक ${years[i]}` },
    }),
  )
  return [list[2]!, list[0]!, list[3]!, list[1]!]
}

export function mount(): HTMLElement {
  document.body.innerHTML = ''
  const root = document.createElement('div')
  document.body.appendChild(root)
  return root
}
