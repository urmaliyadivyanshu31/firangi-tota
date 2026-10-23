import type { Era } from '../../types'
import { epilogue } from './epilogue'
import { facts } from './facts'
import { messages } from './messages'
import { receipts } from './receipts'
import { rules } from './rules'
import { sources } from './sources'

const era: Era = {
  id: 'delhi-1857',
  order: 1,
  title: { en: 'Delhi 1857', hi: 'दिल्ली 1857' },
  place: { en: 'Red Fort, Delhi', hi: 'लाल क़िला, दिल्ली' },
  year: '1857',
  persona: {
    en: "a munshi in Bahadur Shah Zafar's darbar at the Red Fort",
    hi: 'लाल क़िले में बहादुर शाह ज़फ़र के दरबार का एक मुंशी',
  },
  intro: [
    {
      en: 'Delhi, May 1857. The sepoys who rose at Meerut have made the old King, Bahadur Shah Zafar, the head of their rising. You are a munshi in his darbar at the Red Fort. Each day a petition, a letter or a report reaches your desk.',
      hi: 'दिल्ली, मई 1857। मेरठ में बग़ावत करने वाले सिपाहियों ने बूढ़े बादशाह बहादुर शाह ज़फ़र को अपना सरदार बना लिया है। आप लाल क़िले में उनके दरबार के मुंशी हैं। हर दिन कोई अर्ज़ी, चिट्ठी या ख़बर आपकी मेज़ पर आती है।',
    },
    {
      en: "Not every paper is real. Earlier this month someone forged a letter in the names of two of the King's ministers and let the gate guards find it. The King saw through it. In this game the Firangi Tota writes papers like that one. Check each against your case file and stamp it ASLI or TOTA.",
      hi: 'हर काग़ज़ असली नहीं है। इसी महीने किसी ने बादशाह के दो वज़ीरों के नाम से जाली चिट्ठी लिखी और पहरेदारों को मिलने दी। बादशाह ने चाल पकड़ ली। इस खेल में फ़िरंगी तोता ऐसे ही काग़ज़ लिखता है। हर काग़ज़ को केस फ़ाइल से मिलाइए और उस पर असली या तोता की मुहर लगाइए।',
    },
  ],
  windowStart: '1857-05-17',
  channel: 'petition',
  forger: {
    en: "an agent writing for the Firangi, who forges papers in the names of the King's own men and spreads stories of a Persian army",
    hi: 'फ़िरंगी के लिए लिखने वाला एक एजेंट, जो बादशाह के अपने लोगों के नाम से जाली काग़ज़ बनाता है और ईरानी फ़ौज की अफ़वाहें फैलाता है',
  },
  sources,
  facts,
  rules,
  messages,
  receipts,
  epilogue,
}

export default era
