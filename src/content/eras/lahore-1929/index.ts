import type { Era } from '../../types.js'
import { epilogue } from './epilogue.js'
import { facts } from './facts.js'
import { messages } from './messages.js'
import { receipts } from './receipts.js'
import { rules } from './rules.js'
import { sources } from './sources.js'

// Lahore, 2–15 April 1929. Research: docs/research/bhagat-singh-1929.md.
// The post-box role is real: Durga Devi received mail for absconding comrades in 1929 (Maclean).
const era: Era = {
  id: 'lahore-1929',
  order: 2,
  title: { en: 'Lahore 1929', hi: 'लाहौर 1929' },
  place: { en: 'Lahore', hi: 'लाहौर' },
  year: '1929',
  persona: {
    en: "a Lahore student who works as a 'post box' for HSRA comrades in hiding",
    hi: "लाहौर का एक विद्यार्थी, जो छिपे हुए एच.एस.आर.ए. साथियों के लिए 'पोस्ट बॉक्स' का काम करता है",
  },
  intro: [
    {
      en: 'Lahore, April 1929. Since the shooting of 17 December, the comrades of the Hindustan Socialist Republican Army live in hiding. You are a student with a rented room, and their notes come to you. You keep what arrives and pass it on, strictly by the party rules.',
      hi: 'लाहौर, अप्रैल 1929। 17 दिसंबर की गोलीबारी के बाद से हिंदुस्तान सोशलिस्ट रिपब्लिकन आर्मी के साथी छिपकर रह रहे हैं। तुम किराए के कमरे में रहने वाले एक विद्यार्थी हो, और उनके पर्चे तुम्हारे पास आते हैं। जो आता है, तुम उसे सँभालते हो और पार्टी के नियमों के हिसाब से ही आगे भेजते हो।',
    },
    {
      en: "The Lahore CID knows the trick too. Its men plant notes that copy the comrades' voice. Check each one against your case file and the rules, then stamp ASLI or TOTA. One mistake, and the next knock on your door is the police.",
      hi: 'लाहौर की सीआईडी भी यह चाल जानती है। उसके लोग ऐसे जाली पर्चे भेजते हैं जो बिल्कुल साथियों की ज़बान में लिखे होते हैं। हर पर्चे को अपनी केस फ़ाइल और नियमों से मिलाओ, फिर असली या तोता की मुहर लगाओ। एक ग़लती, और अगली दस्तक पुलिस की होगी।',
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
