import type { Rule } from '../../types.js'

// The cipher room's rulebook. Formats follow the telegram headers printed in Mansergh, Vol. XII.
export const rules: Rule[] = [
  {
    id: 'priority',
    text: {
      en: "Telegrams are marked IMPORTANT, IMMEDIATE or MOST IMMEDIATE. Never 'URGENT'.",
      hi: "तारों पर IMPORTANT, IMMEDIATE या MOST IMMEDIATE लिखा होता है। 'URGENT' कभी नहीं।",
    },
    arrivesOnDay: 1,
  },
  {
    id: 'slogans',
    text: {
      en: "Office telegrams and notes never end with a slogan such as 'Jai Hind'.",
      hi: "दफ़्तरी तार और नोट कभी 'जय हिंद' जैसे नारे से ख़त्म नहीं होते।",
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
      en: "No Lok Sabha and no President of India yet; Prasad is the Assembly's President.",
      hi: 'अभी न लोकसभा है, न भारत का राष्ट्रपति; प्रसाद संविधान सभा के अध्यक्ष हैं।',
    },
    arrivesOnDay: 3,
  },
  {
    id: 'weekday',
    text: {
      en: 'The weekday must match the date. 15 August 1947 is a Friday.',
      hi: 'दिन तारीख़ से मेल खाए। 15 अगस्त 1947 शुक्रवार है।',
    },
    arrivesOnDay: 5,
  },
  {
    id: 'london-time',
    text: {
      en: "London is 4½ hours behind Delhi, so its 'Received' times can look earlier.",
      hi: "लंदन दिल्ली से 4½ घंटे पीछे है, इसलिए वहाँ 'मिला' का समय पहले का दिख सकता है।",
    },
    arrivesOnDay: 7,
  },
  {
    id: 'renames',
    text: {
      en: "From 15 August, Mountbatten is no longer Viceroy, and Viceroy's House is Government House.",
      hi: '15 अगस्त से माउंटबेटन वायसराय नहीं रहे, और वायसराय हाउस अब गवर्नमेंट हाउस है।',
    },
    arrivesOnDay: 9,
  },
]
