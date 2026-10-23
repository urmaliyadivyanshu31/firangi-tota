import type { Era } from '../../types'
import { epilogue } from './epilogue'
import { facts } from './facts'
import { messages } from './messages'
import { receipts } from './receipts'
import { rules } from './rules'
import { sources } from './sources'

// Lahore, 2–15 April 1929. Research: docs/research/bhagat-singh-1929.md.
// The post-box role is real: Durga Devi received mail for absconding comrades in 1929 (Maclean).
const era: Era = {
  id: 'lahore-1929',
  order: 2,
  title: { en: 'Lahore 1929', hi: 'लाहौर 1929' },
  place: { en: 'Lahore', hi: 'लाहौर' },
  year: '1929',
  persona: {
    en: "a Lahore student, a 'post box' for HSRA comrades in hiding",
    hi: "लाहौर का एक विद्यार्थी, छिपे हुए एच.एस.आर.ए. साथियों का 'पोस्ट बॉक्स'",
  },
  intro: [
    {
      en: "Lahore, April 1929. Since December's shooting, HSRA comrades live in hiding. Their notes come to your rented room, and you pass them on by the rules.",
      hi: 'लाहौर, अप्रैल 1929। दिसंबर की गोलीबारी के बाद से एच.एस.आर.ए. के साथी छिपकर रहते हैं। उनके पर्चे तुम्हारे किराए के कमरे में आते हैं, और तुम उन्हें नियमों से आगे भेजते हो।',
    },
    {
      en: "The CID plants notes in the comrades' voice. Check each against your case file and rules. Stamp ASLI or TOTA. One mistake, and the next knock is the police.",
      hi: 'सीआईडी साथियों की ज़बान में जाली पर्चे भेजती है। हर पर्चे को केस फ़ाइल और नियमों से मिलाओ। असली या तोता की मुहर लगाओ। एक ग़लती, और अगली दस्तक पुलिस की होगी।',
    },
  ],
  windowStart: '1929-04-02',
  channel: 'note',
  forger: {
    en: 'Lahore CID plants: forged notes in the comrades\' voice',
    hi: 'लाहौर सीआईडी के भेजे जाली पर्चे, साथियों की ज़बान में',
  },
  sources,
  facts,
  rules,
  messages,
  receipts,
  epilogue,
}

export default era
