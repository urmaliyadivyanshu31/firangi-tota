// Fixture eras for tests/app.test.ts: four small eras, enough for any run and the daily puzzle.
import type { Channel, Era, EraId, Message, Tier } from '../src/content/types'

const IDS: EraId[] = ['delhi-1857', 'lahore-1929', 'bombay-1942', 'delhi-1947']
const YEARS = ['1857', '1929', '1942', '1947']
const CHANNELS: Channel[] = ['petition', 'note', 'radio', 'telegram']
const STARTS = ['1857-05-17', '1929-04-02', '1942-10-30', '1947-08-05']

const l = (en: string, hi: string) => ({ en, hi })

function messages(tag: string): Message[] {
  const out: Message[] = []
  for (let i = 0; i < 15; i++) {
    const tier = ((i % 3) + 1) as Tier
    out.push({
      id: `${tag}-r${i}`, tier, real: true, pair: `${tag}-p${i}`,
      from: l(`Courier ${i}`, `हरकारा ${i}`), to: l('The desk', 'मेज़'),
      text: l(`Genuine report ${i} dated {date}`, `सच्ची ख़बर ${i}, {date}`),
      checks: { en: [`report ${i}`], hi: [`ख़बर ${i}`] },
      why: { text: l(`Report ${i} checks out against the diary`, `ख़बर ${i} डायरी से मिलती है`), sources: [{ id: 's1', loc: `p. ${i + 1}` }] },
    })
    out.push({
      id: `${tag}-f${i}`, tier, real: false, pair: `${tag}-p${i}`,
      from: l(`Stranger ${i}`, `अजनबी ${i}`), to: l('The desk', 'मेज़'),
      text: l(`Forged report ${i} dated {date}`, `जाली ख़बर ${i}, {date}`),
      checks: { en: [`report ${i}`], hi: [`ख़बर ${i}`] },
      tells: [{ kind: 'place', explain: l(`Tell ${i}: the place is wrong`, `निशानी ${i}: जगह ग़लत है`), sources: [{ id: 's2', loc: `ch. ${i + 1}` }] }],
    })
  }
  return out
}

export function appEras(): Era[] {
  return IDS.map((id, i) => ({
    id,
    order: (i + 1) as 1 | 2 | 3 | 4,
    title: l(`Title ${YEARS[i]}`, `शीर्षक ${YEARS[i]}`),
    place: l(`Place ${YEARS[i]}`, `जगह ${YEARS[i]}`),
    year: YEARS[i]!,
    persona: l('a clerk', 'एक मुंशी'),
    intro: [l('First intro page.', 'पहला पन्ना।'), l('Second intro page.', 'दूसरा पन्ना।')],
    windowStart: STARTS[i]!,
    channel: CHANNELS[i]!,
    forger: l('a rival', 'एक दुश्मन'),
    endings: {
      caught: { stamp: l('Caught', 'पकड़े गए'), title: l('The forger won', 'जालसाज़ जीता') },
      survived: { stamp: l('Cleared', 'पास'), title: l('All letters checked', 'सब चिट्ठियाँ परखीं') },
    },
    sources: [
      { id: 's1', author: 'A. Author', title: 'First Book', year: '1900' },
      { id: 's2', author: 'B. Author', title: 'Second Book', year: '1950', url: 'https://example.org/book' },
    ],
    facts: [
      { id: 'f1', label: l('City', 'शहर'), value: l('Delhi', 'दिल्ली'), sources: [{ id: 's1' }] },
      { id: 'f2', label: l('Seal', 'मुहर'), value: l('Round', 'गोल'), sources: [{ id: 's2' }], hardHidden: true },
    ],
    rules: [
      { id: 'r1', text: l('Check the seal', 'मुहर जाँचें'), arrivesOnDay: 1 },
      { id: 'r2', text: l('Check the date', 'तारीख़ जाँचें'), arrivesOnDay: 9 },
    ],
    messages: messages(id),
    receipts: [
      { id: 'rc1', who: l('A Rai Bahadur', 'एक राय बहादुर'), quote: l('I kept my title.', 'मैंने ख़िताब रखा।'), joke: l('He kept it well.', 'ख़ूब संभाला।'), source: { id: 's1', loc: 'p. 20' } },
      { id: 'rc2', who: l('A prince', 'एक राजा'), quote: l('I stayed home.', 'मैं घर रहा।'), joke: l('Comfortably.', 'आराम से।'), source: { id: 's2', loc: 'p. 9' } },
    ],
    epilogue: {
      survived: [l('The city endured.', 'शहर टिका रहा।')],
      caught: [l('You were sent to Kala Pani.', 'आपको काला पानी भेजा गया।')],
      sources: [{ id: 's1', loc: 'p. 30' }],
    },
  }))
}
