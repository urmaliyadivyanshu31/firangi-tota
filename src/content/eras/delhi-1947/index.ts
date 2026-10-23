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
    en: "an Indian cipher-and-telegraph clerk at the Viceroy's House, New Delhi",
    hi: 'नई दिल्ली के वायसराय हाउस में एक भारतीय साइफ़र और तार क्लर्क',
  },
  intro: [
    {
      en: "Tuesday 5 August 1947. Ten days to freedom. Every telegram for the Viceroy crosses your desk. Sir Cyril Radcliffe is secretly drawing the new borders, his 'awards'.",
      hi: "मंगलवार, 5 अगस्त 1947। आज़ादी में दस दिन बाकी। वायसराय का हर तार आपकी मेज़ से गुज़रता है। सर सिरिल रैडक्लिफ़ चुपचाप नई सीमाएँ खींच रहे हैं, उनके 'फ़ैसले'।",
    },
    {
      en: 'Rumours run ahead of the line, and the Firangi Tota forges telegrams. Check each against the case file and rulebook, then stamp ASLI or TOTA.',
      hi: 'अफ़वाहें लकीर से आगे दौड़ रही हैं, और फ़िरंगी तोता जाली तार भेजता है। हर तार केस फ़ाइल और नियमों से मिलाइए, फिर ASLI या TOTA की मुहर लगाइए।',
    },
  ],
  windowStart: '1947-08-05',
  channel: 'telegram',
  forger: {
    en: "the Firangi Tota, a 'mischief maker' who forges telegrams and award leaks",
    hi: "फ़िरंगी तोता, एक 'शरारती' जो जाली तार और फ़ैसलों की झूठी लीक भेजता है",
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
