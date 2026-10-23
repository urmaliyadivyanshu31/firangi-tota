import type { Rule } from '../../types'

// The cipher room's rulebook. Formats follow the telegram headers printed in Mansergh, Vol. XII.
export const rules: Rule[] = [
  {
    id: 'priority',
    text: {
      en: "Priorities: IMPORTANT, IMMEDIATE, MOST IMMEDIATE. Numbers: 'No. 3408-S' or UNNUMBERED. No 'URGENT'.",
      hi: "प्राथमिकता: IMPORTANT, IMMEDIATE, MOST IMMEDIATE। नंबर: 'No. 3408-S' या UNNUMBERED। 'URGENT' कभी नहीं।",
    },
    arrivesOnDay: 1,
  },
  {
    id: 'begins-ends',
    text: {
      en: "Passed-on text sits between 'Begins.' and 'Ends.' Office notes never end with slogans.",
      hi: "आगे भेजा गया संदेश 'Begins.' और 'Ends.' के बीच होता है। दफ़्तरी नोट कभी नारे से ख़त्म नहीं होते।",
    },
    arrivesOnDay: 1,
  },
  {
    id: 'city-names',
    text: {
      en: '1947 names: Calcutta, Bombay, Madras. Kolkata, Mumbai and Chennai are modern.',
      hi: '1947 के नाम: कलकत्ता, बंबई, मद्रास। कोलकाता, मुंबई, चेन्नई आज के नाम हैं।',
    },
    arrivesOnDay: 2,
  },
  {
    id: 'council-house',
    text: {
      en: 'The Constituent Assembly meets at the Council House. There is no Lok Sabha yet.',
      hi: 'संविधान सभा काउंसिल हाउस में बैठती है। लोकसभा अभी है ही नहीं।',
    },
    arrivesOnDay: 3,
  },
  {
    id: 'weekday',
    text: {
      en: 'Weekday must match date. 15 August 1947 is a Friday.',
      hi: 'दिन तारीख़ से मेल खाए। 15 अगस्त 1947 शुक्रवार है।',
    },
    arrivesOnDay: 5,
  },
  {
    id: 'london-time',
    text: {
      en: "London 'Received' stamps show London time, so may read earlier than sending.",
      hi: "लंदन की 'Received' मुहर पर लंदन का समय होता है, जो भेजने के समय से पहले का हो सकता है।",
    },
    arrivesOnDay: 7,
  },
  {
    id: 'garbled',
    text: {
      en: 'A garbled cipher group is written [group corrupt].',
      hi: 'बिगड़े साइफ़र ग्रुप पर [group corrupt] लिखा जाता है।',
    },
    arrivesOnDay: 1,
  },
]
