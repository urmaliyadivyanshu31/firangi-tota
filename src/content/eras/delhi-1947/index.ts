import type { Era } from '../../types.js'
import { sources } from './sources.js'
import { facts } from './facts.js'
import { rules } from './rules.js'
import { messages } from './messages.js'
import { receipts } from './receipts.js'
import { epilogue } from './epilogue.js'

// Delhi, August 1947. Dossier: docs/research/independence-1947.md
const era: Era = {
  id: 'delhi-1947',
  order: 4,
  title: { en: 'Delhi 1947', hi: 'दिल्ली 1947' },
  place: { en: "Viceroy's House, New Delhi", hi: 'वायसराय हाउस, नई दिल्ली' },
  year: '1947',
  persona: {
    en: "an Indian cipher-and-telegraph clerk at the Viceroy's House, New Delhi, which becomes Government House on 15 August",
    hi: 'नई दिल्ली के वायसराय हाउस में एक भारतीय साइफ़र (गुप्त कोड) और तार क्लर्क। 15 अगस्त से यही इमारत गवर्नमेंट हाउस कहलाती है',
  },
  intro: [
    {
      en: 'Tuesday 5 August 1947. Ten days are left before the transfer of power, and every IMMEDIATE and MOST IMMEDIATE telegram for the Viceroy crosses your desk in the cipher room: Lahore, Karachi, Calcutta, London. At the Comptroller\'s House, Sir Cyril Radcliffe is drawing two borders that nobody outside has seen.',
      hi: 'मंगलवार, 5 अगस्त 1947। सत्ता सौंपे जाने में दस दिन बचे हैं। वायसराय के लिए आने वाला हर IMMEDIATE और MOST IMMEDIATE तार साइफ़र कमरे में आपकी मेज़ से गुज़रता है: लाहौर, कराची, कलकत्ता, लंदन। कंप्ट्रोलर हाउस में सर सिरिल रैडक्लिफ़ दो सीमाएँ खींच रहे हैं, जिन्हें बाहर किसी ने नहीं देखा।',
    },
    {
      en: 'Where the line will fall is the question of the week, and rumours answer it first. Some telegrams are forged by the Firangi Tota, who copies the official voice perfectly and slips on a name, a place, a date or a title. Check each one against the case file and the rulebook. Stamp ASLI if every detail holds, TOTA if one does not.',
      hi: 'लकीर कहाँ खिंचेगी, इस हफ़्ते सबका यही सवाल है, और अफ़वाहें पहले जवाब दे देती हैं। कुछ तार फ़िरंगी तोते के बनाए जाली तार हैं। वह सरकारी भाषा की हूबहू नक़ल करता है, पर किसी नाम, जगह, तारीख़ या ओहदे में चूक जाता है। हर तार को केस फ़ाइल और नियमों से मिलाइए। हर बात सही हो तो ASLI की मुहर, एक भी ग़लत हो तो TOTA।',
    },
  ],
  windowStart: '1947-08-05',
  channel: 'telegram',
  forger: {
    en: "the Firangi Tota, one of the 'mischief makers' spreading the wildest rumours about the awards. His telegrams copy the official voice exactly, but slip on names, places, dates, titles and procedure",
    hi: "फ़िरंगी तोता, उन 'शरारती लोगों' में से एक जो सीमा के फ़ैसलों के बारे में सबसे बेतुकी अफ़वाहें फैलाते हैं। उसके तार सरकारी भाषा की हूबहू नक़ल होते हैं, पर नाम, जगह, तारीख़, ओहदे या तरीक़े में चूक जाते हैं",
  },
  sources,
  facts,
  rules,
  messages,
  receipts,
  epilogue,
}

export default era
