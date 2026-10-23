// Sample sheets and day titles for the dev pages: one short message per era in both languages,
// written to the minimal brief (15–30 words), plus one long text to check that the sheet copes.
import type { EraId, Lang } from '../src/content/types'
import type { DayTitle, SheetSpec } from '../src/scene/types'

type Pair = Record<Lang, Omit<SheetSpec, 'lang' | 'era' | 'channel' | 'pencil'>>

const SAMPLES: Record<EraId, { channel: SheetSpec['channel']; pairs: Pair[] }> = {
  'delhi-1857': {
    channel: 'petition',
    pairs: [
      {
        en: {
          from: 'Chuni Lal, news-writer', to: "The King's office", dateLine: 'Monday, 18 May 1857',
          body: 'The King took his seat on the throne, in state. Mirza Mughal was made Commander-in-Chief of the whole of the Forces.',
          checks: ['Mirza Mughal', 'Commander-in-Chief'], documentMark: true,
        },
        hi: {
          from: 'चुन्नी लाल, ख़बरनवीस', to: 'बादशाह का दफ़्तर', dateLine: 'सोमवार, 18 मई 1857',
          body: 'बादशाह शान से तख़्त पर बैठे। मिर्ज़ा मुग़ल को पूरी फ़ौज का कमांडर-इन-चीफ़ बनाया गया।',
          checks: ['मिर्ज़ा मुग़ल', 'कमांडर-इन-चीफ़'], documentMark: true,
        },
      },
    ],
  },
  'lahore-1929': {
    channel: 'note',
    pairs: [
      {
        en: {
          from: 'Villager', to: 'Post box', dateLine: 'Tuesday, 2 April 1929',
          body: 'A zinc handbag will reach you tonight. Keep it under your cot. Hand it only to the person who shows the two keys. — Villager',
          checks: ['two keys', 'Villager'],
        },
        hi: {
          from: 'विलेजर', to: 'पोस्ट बॉक्स', dateLine: 'मंगलवार, 2 अप्रैल 1929',
          body: 'आज रात जस्ते का एक हैंडबैग पहुँचेगा। उसे चारपाई के नीचे रखो। सिर्फ़ उसी को देना जो दोनों चाबियाँ दिखाए। — विलेजर',
          checks: ['दोनों चाबियाँ', 'विलेजर'],
        },
      },
      {
        en: {
          from: 'Balraj', to: 'The public', dateLine: '9 April 1929',
          body: 'HINDUSTAN SOCIALIST REPUBLICAN ARMY. NOTICE. It takes a loud voice to make the deaf hear. Long Live the Revolution. Signed, Balraj, Commander-in-Chief.',
          checks: ['Balraj, Commander-in-Chief'],
        },
        hi: {
          from: 'बलराज', to: 'आम जनता', dateLine: '9 अप्रैल 1929',
          body: 'हिंदुस्तान सोशलिस्ट रिपब्लिकन आर्मी। नोटिस। बहरों को सुनाने के लिए ऊँची आवाज़ चाहिए। इंक़लाब ज़िंदाबाद। दस्तख़त: बलराज, कमांडर-इन-चीफ़।',
          checks: ['बलराज, कमांडर-इन-चीफ़'],
        },
      },
    ],
  },
  'bombay-1942': {
    channel: 'radio',
    pairs: [
      {
        en: {
          from: 'Usha Mehta', to: 'All listeners', dateLine: 'Friday, 30 October 1942',
          body: 'This is the Congress Radio calling on 42.34 metres from somewhere in India. Tonight: the news the papers will not print.',
          checks: ['42.34 metres'],
        },
        hi: {
          from: 'उषा मेहता', to: 'सभी श्रोता', dateLine: 'शुक्रवार, 30 अक्टूबर 1942',
          body: 'यह कांग्रेस रेडियो है, भारत में कहीं से, 42.34 मीटर पर। आज रात वो ख़बरें, जो अख़बार नहीं छापेंगे।',
          checks: ['42.34 मीटर'],
        },
      },
    ],
  },
  'delhi-1947': {
    channel: 'telegram',
    pairs: [
      {
        en: {
          from: 'Secretary of State, London', to: 'Viceroy, New Delhi', dateLine: '5 Aug 1947 · 21.40', serial: '3408-S',
          body: 'Your 1662-S. Cabinet agrees the boundary award is published only after 15 August. Repeat: after 15 August.',
          checks: ['after 15 August'],
        },
        hi: {
          from: 'सेक्रेटरी ऑफ़ स्टेट, लंदन', to: 'वायसराय, नई दिल्ली', dateLine: '5 अगस्त 1947 · 21.40', serial: '3408-S',
          body: 'आपका 1662-S. कैबिनेट सहमत है कि सीमा का फ़ैसला 15 अगस्त के बाद ही छपेगा। दोहराता हूँ: 15 अगस्त के बाद।',
          checks: ['15 अगस्त के बाद'],
        },
      },
    ],
  },
}

const LONG_EN =
  "Monday, 18th May 1857. The King came from his private apartments into the Hall of Special Audience, and took his seat on the throne, in state. The bands of the five regiments attended and continued playing English music. The King bestowed arms and dresses of honour on Mirza Mughal as Commander-in-Chief of the whole of the Forces, on others of his sons as Colonels of infantry, and on his grandson Abu Bakr as Colonel of the regiment of Cavalry."

export const ERA_IDS: EraId[] = ['delhi-1857', 'lahore-1929', 'bombay-1942', 'delhi-1947']

export function sampleSheet(era: EraId, lang: Lang, i = 0, pencil = true): SheetSpec {
  const e = SAMPLES[era]
  const pair = e.pairs[i % e.pairs.length] ?? e.pairs[0]
  if (!pair) throw new Error(`no sample for ${era}`)
  return { ...pair[lang], era, channel: e.channel, lang, pencil }
}

export function sampleCount(era: EraId): number {
  return SAMPLES[era].pairs.length
}

export function longSheet(lang: Lang): SheetSpec {
  const s = sampleSheet('delhi-1857', lang)
  return lang === 'en' ? { ...s, body: LONG_EN, documentMark: false } : s
}

const TITLES: Record<EraId, Record<Lang, DayTitle>> = {
  'delhi-1857': { en: { big: 'Day 1', small: 'Sunday, 17 May 1857' }, hi: { big: 'दिन 1', small: 'रविवार, 17 मई 1857' } },
  'lahore-1929': { en: { big: 'Day 1', small: 'Tuesday, 2 April 1929' }, hi: { big: 'दिन 1', small: 'मंगलवार, 2 अप्रैल 1929' } },
  'bombay-1942': { en: { big: 'Day 1', small: 'Friday, 30 October 1942' }, hi: { big: 'दिन 1', small: 'शुक्रवार, 30 अक्टूबर 1942' } },
  'delhi-1947': { en: { big: 'Day 1', small: 'Tuesday, 5 August 1947' }, hi: { big: 'दिन 1', small: 'मंगलवार, 5 अगस्त 1947' } },
}

export function sampleTitle(era: EraId, lang: Lang, day = 1): DayTitle {
  const t = TITLES[era][lang]
  return { big: t.big.replace('1', String(day)), small: t.small }
}
