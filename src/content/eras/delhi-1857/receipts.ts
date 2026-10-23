import type { Receipt } from '../../types.js'
import { mh, sen } from './sources.js'

// Receipt cards: documented words about people who sided with the British. People and their acts
// only, never a community. Facts in the jokes and theirSide lines are sourced in the comments.
export const receipts: Receipt[] = [
  {
    // Quote: MH pp.73-74. Joke: no reply from Patiala (Majumdar p.126); camped near Ambala within
    // eighteen hours of the English request (Cave-Browne I p.190). theirSide: Sen pp.291-93
    // (Scindia) and Sen p.104 (more than half the fighting men on the Ridge were Indians).
    id: 'patiala-jind-nabha',
    who: { en: 'Patiala, Jind and Nabha', hi: 'पटियाला, जींद और नाभा' },
    quote: {
      en: "'Perghanah Narnal, which yielded a revenue of 200,000 rupees, was given to Puttiala.' '…Dadra was confiscated and made over to the Maharajah of Jeend.' 'Perghanah Kauli was given to the Rajah of Nabha.' (Mainodin, on the rewards after 1857)",
      hi: "'परगना नारनौल, जिसकी आमदनी 2 लाख रुपये थी, पटियाला को दिया गया।' '…दादरी ज़ब्त करके जींद के महाराजा को दे दिया गया।' 'परगना कौली नाभा के राजा को दिया गया।' (मैनुद्दीन, 1857 के बाद बँटे इनामों पर)",
    },
    joke: {
      en: "The King's letters to Patiala got no reply. The Company's request had the Maharaja camped near Ambala within eighteen hours. Guess which letter paid better.",
      hi: 'बादशाह की चिट्ठियों का पटियाला से कोई जवाब नहीं आया। कंपनी की एक चिट्ठी पर महाराजा अठारह घंटे में अंबाला के पास डेरा डाले बैठे थे। सोचिए, किस चिट्ठी में ज़्यादा कमाई थी।',
    },
    theirSide: {
      en: "These were rulers' choices, not a people's. Scindia of Gwalior kept the rebel Gwalior Contingent idle for the English 'by various devices', yet in June 1858 his own army went over to the rebels and he fled towards Agra. And more than half the fighting men on the English side of the Ridge in September were Indians (Sen).",
      hi: "ये राजाओं के फ़ैसले थे, किसी क़ौम के नहीं। ग्वालियर के सिंधिया ने 'तरह-तरह की तरकीबों से' ग्वालियर की बाग़ी फ़ौज (ग्वालियर कंटिंजेंट) को अंग्रेज़ों के लिए बिठाए रखा, फिर भी जून 1858 में उनकी अपनी फ़ौज बाग़ियों से जा मिली और वे आगरा की ओर भागे। और सितंबर में रिज पर अंग्रेज़ों की तरफ़ से लड़ने वालों में आधे से ज़्यादा हिंदुस्तानी थे (सेन)।",
    },
    source: mh('pp.73-74'),
  },
  {
    // Quote: Azad's foreword to Sen. Joke: Sen p.109 (Ilahi Baksh persuaded the King to go to
    // Humayun's Tomb; Hodson negotiated the surrender through him). theirSide: JL pp.177, 188-90.
    id: 'ilahi-bakhsh',
    who: { en: 'Mirza Ilahi Bakhsh', hi: 'मिर्ज़ा इलाही बख़्श' },
    quote: {
      en: "'The British had got hold of the traitor Ilahi Baksh who persuaded Bahadur Shah to stay on.' (Maulana Azad, foreword to S. N. Sen's Eighteen Fifty-Seven)",
      hi: "'अंग्रेज़ों ने ग़द्दार इलाही बख़्श को अपने हाथ में कर लिया था, जिसने बहादुर शाह को रुके रहने के लिए मना लिया।' (मौलाना आज़ाद, एस. एन. सेन की किताब 'एटीन फ़िफ़्टी-सेवन' की भूमिका में)",
    },
    joke: {
      en: "He steered the King to Humayun's Tomb, and Hodson then negotiated the surrender through him. Very helpful. Just not to the King.",
      hi: 'उसने बादशाह को हुमायूँ के मक़बरे की राह दिखाई, और फिर हॉडसन ने उसी के ज़रिए हथियार डलवाने की बात की। बड़ा मददगार निकला। बस बादशाह का नहीं।',
    },
    theirSide: {
      en: "The record is not all one colour: inside the rebel city he twice saved Jiwan Lal from extortion (Jiwan Lal's diary).",
      hi: 'रिकॉर्ड एक ही रंग का नहीं है: बाग़ी शहर के अंदर उसने दो बार जीवन लाल को ज़बरदस्ती की वसूली से बचाया (जीवन लाल की डायरी)।',
    },
    source: sen('Foreword by A. K. Azad, p. xx; pp.95, 109'),
  },
  {
    // Quote: JL p.77. Joke: four paid watchers (JL pp.77-78); honorary magistracy (MH Intro p.3).
    // theirSide: JL p.77.
    id: 'jiwan-lal',
    who: { en: 'Munshi Jiwan Lal', hi: 'मुंशी जीवन लाल' },
    quote: {
      en: "'For many years I had eaten the salt of the English Government and wished it well.' (Jiwan Lal, diary for 11 May 1857)",
      hi: "'बरसों से मैंने अंग्रेज़ी सरकार का नमक खाया था और उसका भला चाहता था।' (जीवन लाल, 11 मई 1857 की डायरी)",
    },
    joke: {
      en: 'Payroll: four men paid to watch the gates and the palace. Reward: an honorary magistracy once the English were back.',
      hi: 'तनख़्वाह पर: चार आदमी, दरवाज़ों और महल पर नज़र रखने के लिए। इनाम: अंग्रेज़ों के लौटते ही ऑनरेरी मजिस्ट्रेट का ओहदा।',
    },
    theirSide: {
      en: "In his own words he was keeping faith with those he had served for years. When the city's roughs named him as 'worthy of death', he hid his family in the cellars of his house.",
      hi: "उनके अपने शब्दों में, वे उन लोगों से वफ़ा निभा रहे थे जिनकी बरसों नौकरी की थी। जब शहर के बदमाशों ने उन्हें 'मौत के लायक़' बताया, तो उन्होंने अपने परिवार को घर के तहख़ानों में छिपा दिया।",
    },
    source: { id: 'metcalfe-1898', loc: 'JL pp.77-78; Intro p.3' },
  },
]
