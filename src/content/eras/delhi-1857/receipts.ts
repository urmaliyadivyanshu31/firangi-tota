import type { Receipt } from '../../types'
import { mh, sen } from './sources'

// Receipt cards: documented words about people who sided with the British. People and their acts
// only, never a community. Facts in the jokes and theirSide lines are sourced in the comments.
export const receipts: Receipt[] = [
  {
    // Quote: MH pp.73-74, trimmed. Joke: no reply from Patiala (Majumdar p.126); camped near Ambala
    // within eighteen hours of the English request (Cave-Browne I p.190). theirSide: Sen p.104 (more
    // than half the fighting men on the Ridge were Indians); Scindia's case is in Sen pp.291-93.
    id: 'patiala-jind-nabha',
    who: { en: 'Patiala, Jind and Nabha', hi: 'पटियाला, जींद और नाभा' },
    quote: {
      en: "'…Narnal… was given to Puttiala… Dadra was… made over to the Maharajah of Jeend… Kauli was given to the Rajah of Nabha.' (Mainodin)",
      hi: "'…नारनौल… पटियाला को दिया गया… दादरी… जींद के महाराजा को दे दी गई… कौली नाभा के राजा को दिया गया।' (मैनुद्दीन)",
    },
    joke: {
      en: 'Zafar wrote: no reply. The Company wrote: eighteen hours.',
      hi: 'ज़फ़र ने लिखा: कोई जवाब नहीं। कंपनी ने लिखा: अठारह घंटे।',
    },
    theirSide: {
      en: "Rulers' choices, not a people's. Over half the Ridge's English-side fighters were Indian (Sen).",
      hi: 'ये राजाओं के फ़ैसले थे, किसी क़ौम के नहीं। रिज पर अंग्रेज़ों की ओर से लड़ने वालों में आधे से ज़्यादा हिंदुस्तानी थे (सेन)।',
    },
    source: mh('pp.73-74'),
  },
  {
    // Quote: Azad's foreword to Sen, p. xx. Joke: Sen p.109 (Hodson negotiated the surrender through
    // him). theirSide: JL pp.177, 188-90.
    id: 'ilahi-bakhsh',
    who: { en: 'Mirza Ilahi Bakhsh', hi: 'मिर्ज़ा इलाही बख़्श' },
    quote: {
      en: "'The British had got hold of the traitor Ilahi Baksh who persuaded Bahadur Shah to stay on.' (Azad)",
      hi: "'अंग्रेज़ों ने ग़द्दार इलाही बख़्श को अपने हाथ में कर लिया था, जिसने बहादुर शाह को रुके रहने के लिए मना लिया।' (आज़ाद)",
    },
    joke: {
      en: "Hodson's go-between. Very helpful, just not to the King.",
      hi: 'हॉडसन का बिचौलिया। बड़ा मददगार, बस बादशाह का नहीं।',
    },
    theirSide: {
      en: "Not all one colour: he twice saved Jiwan Lal from extortion (Jiwan Lal's diary).",
      hi: 'तस्वीर एक रंग की नहीं: उसने दो बार जीवन लाल को ज़बरदस्ती की वसूली से बचाया (जीवन लाल की डायरी)।',
    },
    source: sen('Foreword by A. K. Azad, p. xx; pp.95, 109'),
  },
  {
    // Quote: JL p.77. Joke: four paid watchers (JL pp.77-78); honorary magistracy (MH Intro p.3).
    // theirSide: JL p.77.
    id: 'jiwan-lal',
    who: { en: 'Munshi Jiwan Lal', hi: 'मुंशी जीवन लाल' },
    quote: {
      en: "'For many years I had eaten the salt of the English Government and wished it well.' (Jiwan Lal, 11 May 1857)",
      hi: "'बरसों से मैंने अंग्रेज़ी सरकार का नमक खाया था और उसका भला चाहता था।' (जीवन लाल, 11 मई 1857)",
    },
    joke: {
      en: 'Payroll: four watchers. Reward: honorary magistrate.',
      hi: 'तनख़्वाह पर: चार मुख़बिर। इनाम: ऑनरेरी मजिस्ट्रेट।',
    },
    theirSide: {
      en: "He kept faith with his employers; marked 'worthy of death', he hid his family.",
      hi: "उन्होंने अपने मालिकों से वफ़ा निभाई; 'मौत के लायक़' कहे गए तो परिवार को छिपा दिया।",
    },
    source: { id: 'metcalfe-1898', loc: 'JL pp.77-78; Intro p.3' },
  },
]
