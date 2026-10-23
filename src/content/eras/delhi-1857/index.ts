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
      en: 'Delhi, May 1857. The sepoys from Meerut have rallied to old Bahadur Shah Zafar. You are his munshi; each day one paper reaches your desk.',
      hi: 'दिल्ली, मई 1857। मेरठ के सिपाही बूढ़े बादशाह बहादुर शाह ज़फ़र के झंडे तले आ गए हैं। आप उनके मुंशी हैं; हर दिन एक काग़ज़ आपकी मेज़ पर आता है।',
    },
    {
      en: 'This month someone forged a letter in two ministers\' names. The King saw through it. Now the Firangi Tota forges too. Stamp each paper ASLI or TOTA.',
      hi: 'इसी महीने किसी ने दो वज़ीरों के नाम से जाली चिट्ठी लिखी। बादशाह ने चाल पकड़ ली। अब फ़िरंगी तोता भी जालसाज़ी करता है। हर काग़ज़ पर असली या तोता की मुहर लगाइए।',
    },
  ],
  windowStart: '1857-05-17',
  channel: 'petition',
  forger: {
    en: "an agent for the Firangi, forging papers in the names of the King's men",
    hi: 'फ़िरंगी का एजेंट, जो बादशाह के लोगों के नाम से जाली काग़ज़ बनाता है',
  },
  sources,
  facts,
  rules,
  messages,
  receipts,
  epilogue,
}

export default era
