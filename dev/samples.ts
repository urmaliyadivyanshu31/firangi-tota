// Sample sheets and day titles for the dev pages: one short message per era in both languages,
// written to the minimal brief (15–30 words), plus one long text to check that the sheet copes.
// Every date line is the era's day 1, the same day the title shows.
import type { EraId, Lang } from '../src/content/types'
import type { DayTitle, RevealSpec, RevealStamp, SheetSpec } from '../src/scene/types'

type Pair = Record<Lang, Omit<SheetSpec, 'lang' | 'era' | 'channel' | 'pencil'>>

const SAMPLES: Record<EraId, { channel: SheetSpec['channel']; pairs: Pair[] }> = {
  'delhi-1857': {
    channel: 'petition',
    pairs: [
      {
        en: {
          from: 'Chuni Lal, news-writer', to: "The King's office", dateLine: 'Sunday, 17 May 1857',
          body: 'The King took his seat on the throne, in state. Mirza Mughal was made Commander-in-Chief of the whole of the Forces.',
          checks: ['Mirza Mughal', 'Commander-in-Chief'], documentMark: true,
        },
        hi: {
          from: 'चुन्नी लाल, ख़बरनवीस', to: 'बादशाह का दफ़्तर', dateLine: 'रविवार, 17 मई 1857',
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
          from: 'Balraj', to: 'The public', dateLine: 'Tuesday, 2 April 1929',
          body: 'HINDUSTAN SOCIALIST REPUBLICAN ARMY. NOTICE. It takes a loud voice to make the deaf hear. Long Live the Revolution. Signed, Balraj, Commander-in-Chief.',
          checks: ['Balraj, Commander-in-Chief'],
        },
        hi: {
          from: 'बलराज', to: 'आम जनता', dateLine: 'मंगलवार, 2 अप्रैल 1929',
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

// ---------------------------------------------------------------- the verdict on the paper

export type RevealKind = 'right' | 'wrong' | 'caught'

interface EraVerdict {
  style: RevealStamp['style']
  /** The sample sheets are genuine: what checks out, and why. */
  note: Record<Lang, string>
  tell: Record<Lang, string>
  source: string
  ending: Record<Lang, string>
}

const VERDICTS: Record<EraId, EraVerdict> = {
  'delhi-1857': {
    style: 'seal',
    note: { en: 'Mirza Mughal led the army, as the file says', hi: 'फ़ौज मिर्ज़ा मुग़ल के हाथ थी, जैसा फ़ाइल में है' },
    tell: { en: "Chuni Lal's news diary for 18 May records the very words.", hi: 'चुन्नी लाल की 18 मई की डायरी में यही दर्ज है।' },
    source: 'Trial of Bahadur Shah (1858), p. 113',
    ending: { en: 'Delhi falls, September 1857. The court is emptied, and so is your desk.', hi: 'सितंबर 1857 में दिल्ली गिरी। दरबार ख़ाली हुआ, और तुम्हारी मेज़ भी।' },
  },
  'lahore-1929': {
    style: 'police',
    note: { en: 'only the person with both keys', hi: 'सिर्फ़ दोनों चाबियों वाले को' },
    tell: { en: "Sukhdev's own rule, in Jai Gopal's evidence: no keys, no parcel.", hi: 'सुखदेव का अपना नियम, जय गोपाल की गवाही में: चाबी नहीं, तो सामान नहीं।' },
    source: 'Noorani, The Trial of Bhagat Singh (1996), p. 141',
    ending: { en: 'The CID raids the post box room. Your name is on their list.', hi: 'सीआईडी ने पोस्ट बॉक्स वाले कमरे पर छापा मारा। तुम्हारा नाम उनकी सूची में है।' },
  },
  'bombay-1942': {
    style: 'raided',
    note: { en: 'the right wavelength: 42.34 metres', hi: 'सही वेवलेंथ: 42.34 मीटर' },
    tell: { en: 'Congress Radio called on 42.34 metres, as its own broadcasts said.', hi: 'कांग्रेस रेडियो 42.34 मीटर पर बोलता था, जैसा उसके प्रसारण कहते थे।' },
    source: 'Usha Mehta, Congress Radio (1969), p. 12',
    ending: { en: 'Police find the transmitter on 12 November. The station goes silent.', hi: '12 नवंबर को पुलिस ने ट्रांसमीटर पकड़ लिया। रेडियो चुप हो गया।' },
  },
  'delhi-1947': {
    style: 'telegraph',
    note: { en: 'the award waits till after the 15th', hi: 'फ़ैसला 15 के बाद ही आएगा' },
    tell: { en: 'The boundary award was held back and published on 17 August.', hi: 'सीमा का फ़ैसला रोका गया, और 17 अगस्त को छपा।' },
    source: 'Transfer of Power, vol. XII (1983), p. 579',
    ending: { en: 'The Viceroy reads the wrong cable. Your post is given away.', hi: 'वायसराय ने ग़लत तार पढ़ा। तुम्हारी कुर्सी किसी और को मिल गई।' },
  },
}

/** A verdict for the dev page's sample sheet: right (stamped ASLI), wrong, or caught (the ending). */
export function sampleReveal(era: EraId, lang: Lang, kind: RevealKind, i = 0): RevealSpec {
  const v = VERDICTS[era]
  const s = sampleSheet(era, lang, i)
  const right = kind === 'right'
  const hi = lang === 'hi'
  const verdictLine = right ? (hi ? 'सही — यह संदेश असली था' : 'Right — this one was genuine') : hi ? 'ग़लत — यह संदेश असली था' : 'Wrong — this one was genuine'
  const stampText = kind === 'caught' ? (hi ? 'पकड़े गए' : 'Caught') : right ? (hi ? 'सही' : 'Correct') : hi ? 'ग़लत' : 'Wrong'
  return {
    outcome: right ? 'right' : 'wrong',
    real: true,
    documentMark: s.documentMark === true,
    highlight: s.checks,
    note: v.note[lang],
    back: {
      verdictLine,
      tell: v.tell[lang],
      ...(kind === 'caught' ? { consequence: v.ending[lang] } : {}),
      stamp: { text: stampText, tone: kind === 'caught' ? 'caught' : right ? 'right' : 'wrong', style: v.style },
      source: v.source,
    },
    lang,
  }
}
