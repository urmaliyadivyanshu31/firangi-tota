import type { Era } from '../../types.js'
import { epilogue } from './epilogue.js'
import { facts } from './facts.js'
import { messages } from './messages.js'
import { receipts } from './receipts.js'
import { rules } from './rules.js'
import { sources } from './sources.js'

// Chapter 3: the secret Congress Radio, Bombay. Research: docs/research/quit-india-1942.md
const era: Era = {
  id: 'bombay-1942',
  order: 3,
  title: { en: 'Bombay 1942', hi: 'बंबई 1942' },
  place: { en: 'Secret Congress Radio, Bombay', hi: 'ख़ुफ़िया कांग्रेस रेडियो, बंबई' },
  year: '1942',
  persona: {
    en: 'the announcer-operator of the secret Congress Radio, who decides what goes on air before the 8:45 pm broadcast',
    hi: 'ख़ुफ़िया कांग्रेस रेडियो के अनाउंसर और मशीन चलाने वाले, जो तय करते हैं कि रात 8:45 के प्रसारण में क्या जाएगा',
  },
  intro: [
    {
      en: 'Bombay, late October 1942. Since 9 August Gandhiji and the Congress leaders have been in jail, and the papers may not print news of the movement. Every night at 8:45 pm a secret transmitter answers: “This is the Congress Radio calling on 42.34 metres from somewhere in India.”',
      hi: 'बंबई, अक्टूबर 1942 का आख़िर। 9 अगस्त से गांधीजी और कांग्रेस के नेता जेल में हैं, और अख़बार आंदोलन की ख़बरें नहीं छाप सकते। हर रात 8:45 बजे एक ख़ुफ़िया रेडियो जवाब देता है: “यह कांग्रेस रेडियो है, 42.34 मीटर पर, हिंदुस्तान में कहीं से बोल रहा है।”',
    },
    {
      en: 'You read the news and run the set. Couriers bring news slips, scripts and cut discs. The CID Special Branch listens every night, and it slips forgeries in among them. Stamp each one ASLI or TOTA before you go on air. Put one fake on air and the station is finished.',
      hi: 'आप ख़बरें पढ़ते हैं और मशीन चलाते हैं। हरकारे ख़बरों की पर्चियाँ, स्क्रिप्ट और रिकॉर्ड लाते हैं। सी.आई.डी. की स्पेशल ब्रांच हर रात सुनती है, और इन्हीं के बीच जाली पर्चियाँ घुसा देती है। रेडियो पर जाने से पहले हर एक पर असली या तोता की मुहर लगाइए। एक भी जाली ख़बर रेडियो पर गई, तो स्टेशन ख़त्म।',
    },
  ],
  windowStart: '1942-10-30',
  channel: 'radio',
  forger: {
    en: 'CID Special Branch plants: forged slips and scripts slipped in among the couriers’ papers, to trap the station or discredit it',
    hi: 'सी.आई.डी. स्पेशल ब्रांच की जाली पर्चियाँ और स्क्रिप्ट, जो हरकारों के काग़ज़ों में मिला दी जाती हैं, ताकि स्टेशन पकड़ा जाए या बदनाम हो',
  },
  sources,
  facts,
  rules,
  messages,
  receipts,
  epilogue,
}

export default era
