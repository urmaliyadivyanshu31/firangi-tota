import type { Rule } from '../../types'

// The cipher room's rulebook. Formats follow the telegram headers printed in Mansergh, Vol. XII.
export const rules: Rule[] = [
  {
    id: 'priority',
    text: {
      en: "Priorities are written IMMEDIATE or MOST IMMEDIATE. Numbers look like 'No. 3408-S', or the telegram says UNNUMBERED. 'URGENT', exclamation marks and 'Ref:' numbers are not used.",
      hi: "प्राथमिकता IMMEDIATE या MOST IMMEDIATE लिखी जाती है। नंबर 'No. 3408-S' जैसा होता है, या तार पर UNNUMBERED लिखा होता है। 'URGENT', '!' के निशान और 'Ref:' वाले नंबर नहीं चलते।",
    },
    arrivesOnDay: 1,
  },
  {
    id: 'begins-ends',
    text: {
      en: "A cipher text sits between 'Begins.' and 'Ends.', with no greeting or slogan. A garbled group is marked [group corrupt].",
      hi: "साइफ़र का संदेश 'Begins.' और 'Ends.' के बीच होता है, उसमें कोई सलाम या नारा नहीं होता। जो हिस्सा बिगड़ जाए, उस पर [group corrupt] लिखा जाता है।",
    },
    arrivesOnDay: 1,
  },
  {
    id: 'city-names',
    text: {
      en: 'Cities go by their 1947 names: Calcutta, Bombay, Madras. Kolkata, Mumbai and Chennai are modern names.',
      hi: 'शहरों के नाम 1947 वाले हैं: कलकत्ता, बंबई, मद्रास। कोलकाता, मुंबई और चेन्नई आज के नाम हैं।',
    },
    arrivesOnDay: 2,
  },
  {
    id: 'council-house',
    text: {
      en: 'The Constituent Assembly meets in the Constitution Hall of the Council House. There is no Lok Sabha yet.',
      hi: 'संविधान सभा काउंसिल हाउस के कॉन्स्टिट्यूशन हॉल में बैठती है। अभी लोकसभा है ही नहीं।',
    },
    arrivesOnDay: 3,
  },
  {
    id: 'weekday',
    text: {
      en: 'Check the weekday against the date. 15 August 1947 is a Friday.',
      hi: 'दिन को तारीख़ से मिलाइए। 15 अगस्त 1947 शुक्रवार है।',
    },
    arrivesOnDay: 5,
  },
  {
    id: 'london-time',
    text: {
      en: "India Office 'Received' stamps show London time, which is behind Delhi. A London stamp can show an earlier hour than the sending time.",
      hi: "इंडिया ऑफ़िस की 'Received' मुहर पर लंदन का समय होता है, जो दिल्ली से पीछे है। इसलिए लंदन की मुहर पर भेजने के समय से पहले का समय भी हो सकता है।",
    },
    arrivesOnDay: 7,
  },
]
