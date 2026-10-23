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
    en: 'the secret Congress Radio’s announcer-operator, deciding what goes on air at 8:45',
    hi: 'ख़ुफ़िया कांग्रेस रेडियो के अनाउंसर, जो तय करते हैं कि रात 8:45 पर क्या जाएगा',
  },
  intro: [
    {
      en: 'Bombay, 1942. Leaders jailed, papers gagged. Each night at 8:45 pm: “This is the Congress Radio calling on 42.34 metres from somewhere in India.”',
      hi: 'बंबई, 1942। नेता जेल में, अख़बारों की ज़बान बंद। हर रात 8:45 बजे: “यह कांग्रेस रेडियो है, 42.34 मीटर पर, हिंदुस्तान में कहीं से बोल रहा है।”',
    },
    {
      en: 'You read the news and run the set. Couriers bring slips and discs; the CID plants forgeries among them. Stamp each ASLI or TOTA. One fake ends us.',
      hi: 'आप ख़बर पढ़ते हैं और मशीन चलाते हैं। हरकारे पर्चियाँ और रिकॉर्ड लाते हैं; सी.आई.डी. इनमें जाली माल मिला देती है। हर एक पर असली या तोता की मुहर लगाइए। एक जाली ख़बर, और सब ख़त्म।',
    },
  ],
  windowStart: '1942-10-30',
  channel: 'radio',
  forger: {
    en: 'CID Special Branch plants, slipped in among the couriers’ papers',
    hi: 'सी.आई.डी. स्पेशल ब्रांच की जाली पर्चियाँ, हरकारों के काग़ज़ों में छिपाकर',
  },
  sources,
  facts,
  rules,
  messages,
  receipts,
  epilogue,
}

export default era
