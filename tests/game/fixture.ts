import type { Era, Message, Tier } from '../../src/content/types'

const l = (s: string) => ({ en: s, hi: s })

export function msg(id: string, tier: Tier, real: boolean, extra: Partial<Message> = {}): Message {
  return { id, tier, real, from: l('a'), to: l('b'), text: l(id), ...extra }
}

/** 20 pairs (one genuine + one forged each, tiers cycle 1-3) plus two onDay messages. */
export function fixtureEra(): Era {
  const messages: Message[] = []
  for (let i = 0; i < 20; i++) {
    const tier = ((i % 3) + 1) as Tier
    messages.push(msg(`p${i}-r`, tier, true, { pair: `p${i}` }))
    messages.push(msg(`p${i}-f`, tier, false, { pair: `p${i}` }))
  }
  messages.push(msg('day5', 2, true, { onDay: 5 }))
  messages.push(msg('day12', 3, false, { onDay: 12 }))
  return {
    id: 'delhi-1857', order: 1, title: l('Fixture'), place: l('x'), year: '1857',
    persona: l('x'), intro: [l('x'), l('x')], windowStart: '1857-05-10', channel: 'telegram',
    forger: l('x'), sources: [], facts: [], rules: [], messages, receipts: [],
    endings: { caught: { stamp: l('Caught'), title: l('Caught') }, survived: { stamp: l('Cleared'), title: l('Cleared') } },
    epilogue: { survived: [], caught: [], sources: [] },
  }
}

const IDS = ['delhi-1857', 'lahore-1929', 'bombay-1942', 'delhi-1947'] as const

/** 4 eras, order 1-4, 12 unpaired messages each. */
export function fixturePool(): Era[] {
  return IDS.map((id, i) => {
    const base = fixtureEra()
    const messages: Message[] = []
    for (let k = 0; k < 12; k++) messages.push(msg(`${id}-${k}`, ((k % 3) + 1) as Tier, k % 2 === 0))
    return { ...base, id, order: (i + 1) as 1 | 2 | 3 | 4, messages }
  })
}
