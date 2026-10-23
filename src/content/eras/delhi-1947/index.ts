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
    en: "an Indian cipher clerk at the Viceroy's House, New Delhi",
    hi: 'नई दिल्ली के वायसराय हाउस में एक भारतीय साइफ़र क्लर्क',
  },
  intro: [
    {
      en: 'Tuesday 5 August 1947. Ten days to the transfer of power. Every telegram for the Viceroy crosses your desk. Sir Cyril Radcliffe is drawing two borders nobody has seen.',
      hi: 'मंगलवार, 5 अगस्त 1947। सत्ता सौंपे जाने में दस दिन बचे हैं। वायसराय का हर तार आपकी मेज़ से गुज़रता है। सर सिरिल रैडक्लिफ़ दो सीमाएँ खींच रहे हैं, जो किसी ने नहीं देखीं।',
    },
    {
      en: 'Rumours run ahead of the line. Some telegrams are forged by the Firangi Tota. Check the case file and stamp ASLI or TOTA.',
      hi: 'अफ़वाहें लकीर से आगे दौड़ रही हैं। कुछ तार फ़िरंगी तोते के जाली तार हैं। केस फ़ाइल से मिलाइए और ASLI या TOTA की मुहर लगाइए।',
    },
  ],
  windowStart: '1947-08-05',
  channel: 'telegram',
  forger: {
    en: "the Firangi Tota, a 'mischief maker' who fakes award telegrams",
    hi: "फ़िरंगी तोता, एक 'शरारती' जो फ़ैसलों के जाली तार भेजता है",
  },
  sources,
  facts,
  rules,
  messages,
  receipts,
  epilogue,
  // Ending stamp and heading. The caught title holds for any mistake: a forgery passed,
  // a genuine telegram rejected, or the agarbatti burning out.
  endings: {
    caught: {
      stamp: { en: 'Rumour out', hi: 'अफ़वाह फैली' },
      title: { en: 'A rumour ran ahead of the truth', hi: 'एक अफ़वाह सच से आगे निकल गई' },
    },
    survived: {
      stamp: { en: 'Truth delivered', hi: 'सच पहुँचा' },
      title: { en: 'Only true telegrams left your desk', hi: 'आपकी मेज़ से सिर्फ़ सच्चे तार निकले' },
    },
  },
}

export default era
