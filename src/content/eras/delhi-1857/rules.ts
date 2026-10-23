import type { Rule } from '../../types.js'

// The rulebook. Each rule comes from the record (see the messages that rely on it):
// petition form from the trial papers; weekdays from the calendar; the Persian placard from the
// trial; court manners from the King's own order; titles from Majumdar and Sen; the planted letter
// from Mainodin p.59.
export const rules: Rule[] = [
  {
    id: 'petition-form',
    arrivesOnDay: 1,
    text: {
      en: "A petition to the King opens 'The King! Shelter of the World!' and closes 'Petition of the slave…', often with the petitioner's seal. Court papers never use English letter forms: no 'My dear', no 'Yours faithfully', no 'your obedient servant'.",
      hi: "बादशाह को अर्ज़ी 'बादशाह सलामत! जहाँपनाह!' से शुरू होती है और 'अर्ज़ी: ग़ुलाम … की' पर ख़त्म होती है, अक्सर अर्ज़ी देने वाले की मुहर के साथ। दरबार के काग़ज़ों में अंग्रेज़ी चिट्ठी का ढंग कभी नहीं होता: न 'माई डियर', न 'योर्स फ़ेथफ़ुली', न 'ओबीडिएंट सर्वेंट'।",
    },
  },
  {
    id: 'check-case-file',
    arrivesOnDay: 1,
    text: {
      en: 'Check every name, regiment, gate and sum against the case file. One wrong detail makes the whole paper false.',
      hi: 'हर नाम, पलटन, दरवाज़ा और रक़म केस फ़ाइल से मिलाइए। एक भी ग़लत बात हो तो पूरा काग़ज़ जाली है।',
    },
  },
  {
    id: 'weekdays',
    arrivesOnDay: 2,
    text: {
      en: 'Your first day, 17 May 1857, is a Sunday. Count on from there: a date and its weekday must agree.',
      hi: 'आपका पहला दिन, 17 मई 1857, रविवार है। वहाँ से आगे गिनिए: तारीख़ और दिन आपस में मेल खाने चाहिए।',
    },
  },
  {
    id: 'persian-bait',
    arrivesOnDay: 3,
    text: {
      en: "Persian-army news is the Firangi's favourite bait. In March someone stuck a forged 'proclamation of the King of Persia' on the Jama Masjid, saying he would soon conquer Hindustan and that 500 men in Delhi were already his. Delhi's own paper called the man who put it up a forger. The Firangi's agent plays on the same hope: a paper that reports a Persian army as certain fact is planted.",
      hi: "ईरानी फ़ौज की ख़बर फ़िरंगी का पसंदीदा चारा है। मार्च में किसी ने जामा मस्जिद पर 'ईरान के बादशाह का ऐलान' नाम का एक जाली इश्तिहार चिपका दिया, कि वह जल्द हिंदुस्तान जीत लेगा और दिल्ली में 500 आदमी पहले से उसके साथ हैं। दिल्ली के अपने अख़बार ने उसे लगाने वाले को जालसाज़ कहा। फ़िरंगी का एजेंट इसी उम्मीद से खेलता है: जो काग़ज़ ईरानी फ़ौज को पक्की ख़बर बताए, वह किसी ने रखवाया है।",
    },
  },
  {
    id: 'court-manners',
    arrivesOnDay: 5,
    text: {
      en: 'Court manners: no one rides up to the Hall of Special Audience, and officers come to court in turbans, not caps. The King complains when soldiers break these rules. He never praises it.',
      hi: 'दरबार के क़ायदे: कोई घोड़े पर दीवान-ए-ख़ास तक नहीं आता, और अफ़सर दरबार में पगड़ी पहनकर आते हैं, टोपी नहीं। सिपाही ये क़ायदे तोड़ें तो बादशाह शिकायत करते हैं। वे इसकी कभी तारीफ़ नहीं करते।',
    },
  },
  {
    id: 'english-titles',
    arrivesOnDay: 7,
    text: {
      en: "English titles in 1857: Lord Canning is Governor-General, Agra has a Lieutenant-Governor, and the Punjab has a Chief Commissioner. Nobody is 'Viceroy' yet.",
      hi: "1857 में अंग्रेज़ों के ओहदे: लॉर्ड कैनिंग गवर्नर-जनरल हैं, आगरा में लेफ़्टिनेंट-गवर्नर है, और पंजाब में चीफ़ कमिश्नर। अभी कोई 'वायसराय' नहीं है।",
    },
  },
  {
    id: 'found-letters',
    arrivesOnDay: 9,
    text: {
      en: "Beware of letters 'found' at a gate that accuse the King's own men. In May someone forged a letter in the names of Mahbub Ali Khan and Hakim Ahsanullah Khan and let it fall into the gate guards' hands. The King saw through it.",
      hi: "दरवाज़े पर 'मिली' उन चिट्ठियों से बचिए जो बादशाह के अपने लोगों पर इल्ज़ाम लगाएँ। मई में किसी ने महबूब अली ख़ान और हकीम अहसनुल्लाह ख़ान के नाम से जाली चिट्ठी लिखी और उसे पहरेदारों के हाथ लगने दिया। बादशाह ने चाल पकड़ ली।",
    },
  },
]
