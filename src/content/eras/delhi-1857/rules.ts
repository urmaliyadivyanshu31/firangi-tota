import type { Rule } from '../../types.js'

// The rulebook, one line each. Sources: trial petitions (form); Chuni Lal's diary, JL p.102 and
// Petition No. 64 (weekdays, Eid); the Trial's Persian-rumour papers; the King's own order (manners);
// Majumdar p.71, Sen p.321 and Fanshawe p.214 (titles); Mainodin p.59 (the planted letter).
export const rules: Rule[] = [
  {
    id: 'petition-form',
    arrivesOnDay: 1,
    text: {
      en: "Court papers never use English letter forms: no 'My dear', no 'obedient servant'.",
      hi: "दरबार के काग़ज़ों में अंग्रेज़ी चिट्ठी का ढंग नहीं होता: न 'माई डियर', न 'ओबीडिएंट सर्वेंट'।",
    },
  },
  {
    id: 'check-case-file',
    arrivesOnDay: 1,
    text: {
      en: 'Check every name, regiment, gate and sum against the case file.',
      hi: 'हर नाम, पलटन, दरवाज़ा और रक़म केस फ़ाइल से मिलाइए।',
    },
  },
  {
    id: 'weekdays',
    arrivesOnDay: 2,
    text: {
      en: '17 May 1857 is a Sunday; count on. Eid is Monday 25 May.',
      hi: '17 मई 1857 रविवार है; आगे गिनिए। ईद सोमवार 25 मई को है।',
    },
  },
  {
    id: 'persian-bait',
    arrivesOnDay: 3,
    text: {
      en: 'Persian armies are rumour. A paper calling one certain fact is planted.',
      hi: 'ईरानी फ़ौज अफ़वाह है। जो काग़ज़ उसे पक्की ख़बर बताए, वह रखवाया गया है।',
    },
  },
  {
    id: 'court-manners',
    arrivesOnDay: 5,
    text: {
      en: 'Officers riding to court or wearing caps anger the King. He never praises it.',
      hi: 'अफ़सरों का घोड़े पर दरबार तक आना या टोपी पहनना बादशाह को बुरा लगता है। वे इसकी कभी तारीफ़ नहीं करते।',
    },
  },
  {
    id: 'english-titles',
    arrivesOnDay: 7,
    text: {
      en: 'Canning is Governor-General; Agra has a Lieutenant-Governor; the Punjab, a Chief Commissioner. No Viceroy.',
      hi: 'कैनिंग गवर्नर-जनरल हैं; आगरा में लेफ़्टिनेंट-गवर्नर; पंजाब में चीफ़ कमिश्नर। वायसराय कोई नहीं।',
    },
  },
  {
    id: 'found-letters',
    arrivesOnDay: 9,
    text: {
      en: "Beware of letters 'found' at a gate that accuse the King's own ministers.",
      hi: "दरवाज़े पर 'मिली' उस चिट्ठी से बचिए जो बादशाह के अपने वज़ीरों पर इल्ज़ाम लगाए।",
    },
  },
]
