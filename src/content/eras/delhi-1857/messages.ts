import type { Message } from '../../types'
import {
  caveBrowne,
  CHATTA,
  CHUNI_17,
  CHUNI_18,
  CHUNI_19_20,
  fanshawe,
  jl,
  KING_ORDER,
  majumdar,
  mh,
  sen,
  trial,
  yule,
} from './sources'

// Days: 1 = Sun 17 May 1857 … 14 = Sat 30 May 1857. Events on days 1-3 are tier 1.
// Real documents quote public-domain translations, trimmed to the telling line ("…" marks cuts);
// names use the case-file spelling (Mirza Mughal, Abu Bakr).

const KING = { en: 'The King, Red Fort', hi: 'बादशाह सलामत, लाल क़िला' }
const OFFICE = { en: "The King's office", hi: 'बादशाह का दफ़्तर' }
const MUNSHI = { en: "The King's munshi", hi: 'बादशाह का मुंशी' }
const PEOPLE = { en: 'The people of Delhi', hi: 'दिल्ली के लोग' }
const MIRZA = { en: 'Mirza Mughal', hi: 'मिर्ज़ा मुग़ल' }
const DARBAR = { en: 'Report to the darbar', hi: 'दरबार को रिपोर्ट' }
const NEWSWRITER = { en: 'News-writer', hi: 'ख़बरनवीस' }
const NO64 = 'Petition No. 64, dated 24 May 1857, p.34'
const NO60 = 'Petition No. 60, undated, p.32'
const NO63 = 'Petition No. 63, 22 May 1857, p.33'
const PETITIONS = 'petitions, e.g. Nos. 60-68, pp.32-35'
const PERSIAN = "'Authentic News', 23 March 1857, and Delhi newspapers of August-September 1857, c. pp.128-31"

const eventMessages: Message[] = [
  // ── Day 2, Mon 18 May: the commands ──
  {
    id: 'ev-commanders-real',
    tier: 1,
    real: true,
    pair: 'ev-commanders',
    onDay: 2,
    from: { en: 'Chuni Lal, news-writer', hi: 'चुन्नी लाल, ख़बरनवीस' },
    to: OFFICE,
    text: {
      en: '18th May 1857. The bands of the five regiments… continued playing English music. The King bestowed… dresses of honour… on Mirza Mughal as Commander-in-Chief…',
      hi: '18 मई 1857। पाँचों पलटनों के बैंड… अंग्रेज़ी धुनें बजाते रहे। बादशाह ने… मिर्ज़ा मुग़ल को कमांडर-इन-चीफ़ बनाकर इज़्ज़त की पोशाक दी…',
    },
    checks: { en: ['Mirza Mughal as Commander-in-Chief'], hi: ['मिर्ज़ा मुग़ल को कमांडर-इन-चीफ़'] },
    document: { sources: [trial(CHUNI_18)] },
    why: {
      text: {
        en: "Chuni Lal's news diary, 18 May. Yes, the bands really played English music.",
        hi: 'चुन्नी लाल की ख़बरों की डायरी, 18 मई। हाँ, बैंड सच में अंग्रेज़ी धुनें बजा रहे थे।',
      },
      sources: [trial(CHUNI_18), jl('p.96')],
    },
  },
  {
    id: 'ev-commanders-forged',
    tier: 1,
    real: false,
    pair: 'ev-commanders',
    onDay: 2,
    from: { en: 'Chuni Lal, news-writer', hi: 'चुन्नी लाल, ख़बरनवीस' },
    to: OFFICE,
    text: {
      en: '18th May 1857. The bands of the five regiments… continued playing English music. The King bestowed… dresses of honour… on Mirza Jawan Bakht as Commander-in-Chief…',
      hi: '18 मई 1857। पाँचों पलटनों के बैंड… अंग्रेज़ी धुनें बजाते रहे। बादशाह ने… मिर्ज़ा जवाँ बख़्त को कमांडर-इन-चीफ़ बनाकर इज़्ज़त की पोशाक दी…',
    },
    checks: { en: ['Mirza Jawan Bakht as Commander-in-Chief'], hi: ['मिर्ज़ा जवाँ बख़्त को कमांडर-इन-चीफ़'] },
    tells: [
      {
        kind: 'name',
        factId: 'commanders',
        explain: {
          en: 'Mirza Mughal was made Commander-in-Chief, not Jawan Bakht; he became minister.',
          hi: 'कमांडर-इन-चीफ़ मिर्ज़ा मुग़ल बने, जवाँ बख़्त नहीं; उन्हें वज़ीर बनाया गया।',
        },
        sources: [jl('pp.96-97'), trial(CHUNI_18)],
      },
    ],
  },

  // ── Day 3, Tue 19 May: gold mohurs ──
  {
    id: 'ev-coins-real',
    tier: 1,
    real: true,
    pair: 'ev-coins',
    onDay: 3,
    from: { en: 'The Diwan-i-Khas', hi: 'दीवान-ए-ख़ास' },
    to: MUNSHI,
    text: {
      en: "19th May. The gold mohurs presented today read: 'Silver and gold coin struck by the King of India… The sovereign Suraj-u-din the brave.'",
      hi: "19 मई। आज पेश हुई सोने की मोहरों पर लिखा है: 'हिंद के बादशाह ने चाँदी और सोने का सिक्का चलाया… बादशाह सिराजुद्दीन, बहादुर।'",
    },
    checks: { en: ['The sovereign Suraj-u-din the brave'], hi: ['बादशाह सिराजुद्दीन, बहादुर'] },
    document: { sources: [jl('pp.96-97')] },
    why: {
      text: {
        en: "Jiwan Lal copied this inscription on 19 May. Suraj-u-din (Siraj-ud-din) was Zafar's title.",
        hi: 'जीवन लाल ने 19 मई को यह लिखावट उतारी। सिराजुद्दीन ज़फ़र का अपना शाही नाम था।',
      },
      sources: [jl('pp.96-97')],
    },
  },
  {
    id: 'ev-coins-forged',
    tier: 1,
    real: false,
    pair: 'ev-coins',
    onDay: 3,
    from: { en: 'The Diwan-i-Khas', hi: 'दीवान-ए-ख़ास' },
    to: MUNSHI,
    text: {
      en: "19th May. The gold mohurs presented today read: 'Silver and gold coin struck by the King of India… The sovereign Abu Bakr the brave.'",
      hi: "19 मई। आज पेश हुई सोने की मोहरों पर लिखा है: 'हिंद के बादशाह ने चाँदी और सोने का सिक्का चलाया… बादशाह अबू बक्र, बहादुर।'",
    },
    checks: { en: ['The sovereign Abu Bakr the brave'], hi: ['बादशाह अबू बक्र, बहादुर'] },
    tells: [
      {
        kind: 'name',
        factId: 'court',
        explain: {
          en: 'The coins name Suraj-u-din (Siraj-ud-din), not Abu Bakr, whatever soldiers said.',
          hi: 'सिक्कों पर सिराजुद्दीन है, अबू बक्र नहीं, 17 मई को सिपाही चाहे जो कहें।',
        },
        sources: [jl('pp.95-97')],
      },
    ],
  },

  // ── Day 4, Wed 20 May: no holy war against Hindus ──
  {
    id: 'ev-holy-war',
    tier: 2,
    real: true,
    onDay: 4,
    from: { en: 'Darbar record', hi: 'दरबार की डायरी' },
    to: OFFICE,
    text: {
      en: "20th May. To a deputation of Hindu officers the King replied: 'The Holy War is against the English; I have forbidden it against the Hindus.'",
      hi: "20 मई। हिंदू अफ़सरों के एक दल से बादशाह ने कहा: 'जिहाद अंग्रेज़ों के ख़िलाफ़ है; हिंदुओं के ख़िलाफ़ मैंने इसे मना कर दिया है।'",
    },
    checks: { en: ['I have forbidden it against the Hindus'], hi: ['हिंदुओं के ख़िलाफ़ मैंने इसे मना कर दिया है'] },
    document: { sources: [jl('p.98')] },
    why: {
      text: {
        en: "Jiwan Lal's diary, 20 May; Chuni Lal's news diary agrees.",
        hi: '20 मई की जीवन लाल की डायरी; चुन्नी लाल की डायरी भी यही कहती है।',
      },
      sources: [jl('p.98'), trial(CHUNI_19_20)],
    },
  },

  // ── Day 5, Thu 21 May: drum proclamation ──
  {
    id: 'ev-drum',
    tier: 1,
    real: true,
    onDay: 5,
    from: { en: 'Drum proclamation', hi: 'ढिंढोरा' },
    to: PEOPLE,
    text: {
      en: '21st May. By beat of drum: Hindus and Mahommedans must not quarrel.',
      hi: '21 मई। ढोल पीटकर ऐलान: हिंदू और मुसलमान आपस में न झगड़ें।',
    },
    checks: { en: ['must not quarrel'], hi: ['आपस में न झगड़ें'] },
    document: { sources: [jl('p.100')] },
    why: {
      text: {
        en: 'Jiwan Lal recorded this drum proclamation on 21 May.',
        hi: 'जीवन लाल ने 21 मई को यह ढिंढोरा दर्ज किया।',
      },
      sources: [jl('p.100')],
    },
  },

  // ── Undated (c. 21-22 May): the King's order to Mirza Mughal, gated by court-manners ──
  {
    id: 'ev-order-real',
    tier: 2,
    real: true,
    pair: 'ev-order',
    from: { en: 'The King, under his seal', hi: 'बादशाह, अपनी मुहर से' },
    to: MIRZA,
    text: {
      en: 'Our Son, the Illustrious and Valiant… The officers of the army… make a practice of coming into court… wearing caps instead of turbans and carrying their swords.',
      hi: 'हमारे बेटे, नामवर और बहादुर… फ़ौज के अफ़सर… दरबार में… पगड़ी की जगह टोपी लगाकर और तलवार लेकर आते हैं।',
    },
    checks: {
      en: ['Our Son, the Illustrious and Valiant', 'caps instead of turbans'],
      hi: ['हमारे बेटे, नामवर और बहादुर', 'पगड़ी की जगह टोपी'],
    },
    document: { sources: [trial(KING_ORDER)] },
    why: {
      text: {
        en: "The King's own undated order to Mirza Mughal, read at his trial.",
        hi: 'मिर्ज़ा मुग़ल को बादशाह का अपना बिना तारीख़ का हुक्म, मुक़दमे में पढ़ा गया।',
      },
      sources: [trial(KING_ORDER)],
    },
  },
  {
    id: 'ev-order-forged',
    tier: 2,
    real: false,
    pair: 'ev-order',
    from: { en: 'The King, under his seal', hi: 'बादशाह, अपनी मुहर से' },
    to: MIRZA,
    text: {
      en: 'Our Son, the Illustrious and Valiant… We are well pleased that the officers ride up to our Hall on horseback and come to court in caps.',
      hi: 'हमारे बेटे, नामवर और बहादुर… हम ख़ुश हैं कि अफ़सर घोड़े पर हमारे दीवान तक आते हैं और टोपी पहनकर दरबार में आते हैं।',
    },
    checks: {
      en: ['We are well pleased', 'come to court in caps'],
      hi: ['हम ख़ुश हैं', 'टोपी पहनकर दरबार में'],
    },
    tells: [
      {
        kind: 'habit',
        ruleId: 'court-manners',
        sources: [trial(KING_ORDER)],
        explain: {
          en: 'The King complained of caps and horses at court, not praised them.',
          hi: 'बादशाह ने दरबार में टोपी और घोड़ों की शिकायत की, तारीफ़ नहीं।',
        },
      },
    ],
  },

  // ── Day 8, Sun 24 May: the Eid moon ──
  {
    id: 'ev-newmoon-real',
    tier: 2,
    real: true,
    pair: 'ev-newmoon',
    onDay: 8,
    from: { en: 'Raja Nahar Singh, Ballabhgarh', hi: 'राजा नाहर सिंह, बल्लभगढ़' },
    to: KING,
    text: {
      en: 'My Lord! This is Sunday… the new moon of the festival of the Eed appeared… Petition of… Nahar Singh, Chief of Ballabhgarh. Seal of Rajah Nahar Singh Bahadur.',
      hi: 'हुज़ूर! आज रविवार है… ईद का नया चाँद दिखा… अर्ज़ी: नाहर सिंह, बल्लभगढ़ के सरदार। राजा नाहर सिंह बहादुर की मुहर।',
    },
    checks: { en: ['This is Sunday'], hi: ['आज रविवार है'] },
    document: { sources: [trial(NO64)] },
    why: {
      text: {
        en: 'A real petition of 24 May 1857, which was a Sunday.',
        hi: '24 मई 1857 की असली अर्ज़ी; उस दिन रविवार था।',
      },
      sources: [trial(NO64), jl('p.102')],
    },
  },
  {
    id: 'ev-newmoon-forged',
    tier: 2,
    real: false,
    pair: 'ev-newmoon',
    onDay: 8,
    from: { en: 'Raja Nahar Singh, Ballabhgarh', hi: 'राजा नाहर सिंह, बल्लभगढ़' },
    to: KING,
    text: {
      en: 'My Lord! This is Monday… the new moon of the festival of the Eed appeared… Petition of… Nahar Singh, Chief of Ballabhgarh. Seal of Rajah Nahar Singh Bahadur.',
      hi: 'हुज़ूर! आज सोमवार है… ईद का नया चाँद दिखा… अर्ज़ी: नाहर सिंह, बल्लभगढ़ के सरदार। राजा नाहर सिंह बहादुर की मुहर।',
    },
    checks: { en: ['This is Monday'], hi: ['आज सोमवार है'] },
    tells: [
      {
        kind: 'weekday',
        ruleId: 'weekdays',
        explain: {
          en: '24 May 1857 was a Sunday, not a Monday. Count from 17 May.',
          hi: '24 मई 1857 रविवार था, सोमवार नहीं। 17 मई से गिनिए।',
        },
        sources: [trial(NO64), jl('p.102'), trial(CHUNI_17)],
      },
    ],
  },

  // ── Day 9, Mon 25 May: Eid, and a false alarm ──
  {
    id: 'ev-eid-real',
    tier: 1,
    real: true,
    pair: 'ev-eid',
    onDay: 9,
    from: DARBAR,
    to: OFFICE,
    text: {
      en: 'Eid. During prayers a camel sowar from Ballabhgarh cried that the English were coming. He had mistaken an Eid procession for their advance-guard.',
      hi: 'ईद। नमाज़ के वक़्त बल्लभगढ़ से एक ऊँट-सवार चिल्लाया कि अंग्रेज़ आ रहे हैं। उसने ईद के जुलूस को अंग्रेज़ी फ़ौज समझ लिया था।',
    },
    checks: { en: ['mistaken an Eid procession'], hi: ['ईद के जुलूस को अंग्रेज़ी फ़ौज समझ'] },
    why: {
      text: {
        en: "Jiwan Lal, 25 May: the 'English army' was an Eid procession.",
        hi: "जीवन लाल, 25 मई: 'अंग्रेज़ी फ़ौज' असल में ईद का जुलूस थी।",
      },
      sources: [jl('p.102')],
    },
  },
  {
    id: 'ev-eid-forged',
    tier: 1,
    real: false,
    pair: 'ev-eid',
    onDay: 9,
    from: DARBAR,
    to: OFFICE,
    text: {
      en: 'Eid was yesterday, Sunday. During prayers a camel sowar from Ballabhgarh cried that the English were coming. They are at the gates: let the King flee tonight.',
      hi: 'ईद कल, रविवार को थी। नमाज़ के वक़्त बल्लभगढ़ से एक ऊँट-सवार चिल्लाया कि अंग्रेज़ आ रहे हैं। वे दरवाज़ों पर हैं: बादशाह आज रात निकल जाएँ।',
    },
    checks: { en: ['Eid was yesterday, Sunday'], hi: ['ईद कल, रविवार को थी'] },
    tells: [
      {
        kind: 'date',
        ruleId: 'weekdays',
        explain: {
          en: 'Eid is today, Monday 25 May, not Sunday; the moon came Sunday evening.',
          hi: 'ईद आज, सोमवार 25 मई को है, रविवार को नहीं; चाँद रविवार शाम दिखा था।',
        },
        sources: [jl('p.102'), trial(NO64)],
      },
    ],
  },

  // ── Day 11, Wed 27 May: guns filled with gravel ──
  {
    id: 'ev-guns-real',
    tier: 1,
    real: true,
    pair: 'ev-guns',
    onDay: 11,
    from: { en: 'Report from the bastions', hi: 'बुर्जों से रिपोर्ट' },
    to: OFFICE,
    text: {
      en: "Guns on the bastions are found spiked or filled with stones, gravel and ends of string. The soldiers blame the King's servants.",
      hi: 'बुर्जों पर तोपों में कीलें ठुकी मिलीं, या पत्थर, बजरी और डोरी के टुकड़े भरे मिले। सिपाही बादशाह के नौकरों को दोषी ठहरा रहे हैं।',
    },
    checks: { en: ['stones, gravel and ends of string'], hi: ['पत्थर, बजरी और डोरी के टुकड़े'] },
    why: {
      text: { en: 'Jiwan Lal, 26-27 May, almost word for word.', hi: 'जीवन लाल, 26-27 मई, लगभग उन्हीं शब्दों में।' },
      sources: [jl('pp.103-04')],
    },
  },
  {
    id: 'ev-guns-forged',
    tier: 2,
    real: false,
    pair: 'ev-guns',
    onDay: 11,
    from: { en: 'Report from the bastions', hi: 'बुर्जों से रिपोर्ट' },
    to: OFFICE,
    text: {
      en: "Guns are found filled with gravel. The guards at the Kashmiri Gate picked up the proof: Hakim Ahsanullah Khan's letter to the Lieutenant-Governor at Lahore.",
      hi: 'तोपों में बजरी भरी मिली है। कश्मीरी दरवाज़े के पहरेदारों को सबूत मिल गया: लाहौर के लेफ़्टिनेंट-गवर्नर के नाम हकीम अहसनुल्लाह ख़ान की चिट्ठी।',
    },
    checks: { en: ['the Lieutenant-Governor at Lahore'], hi: ['लाहौर के लेफ़्टिनेंट-गवर्नर'] },
    tells: [
      {
        kind: 'place',
        ruleId: 'english-titles',
        explain: {
          en: 'The Lieutenant-Governor sat at Agra, not Lahore.',
          hi: 'लेफ़्टिनेंट-गवर्नर आगरा में बैठते थे, लाहौर में नहीं।',
        },
        sources: [majumdar('p.71'), sen('pp.321-22')],
      },
      {
        kind: 'habit',
        ruleId: 'found-letters',
        explain: {
          en: "A letter 'found' by gate guards is the oldest trick, not proof.",
          hi: "पहरेदारों को 'मिली' चिट्ठी सबसे पुरानी चाल है, सबूत नहीं।",
        },
        sources: [mh('p.59')],
      },
    ],
  },

  // ── Day 13, Fri 29 May: a "spy" in a fortune-teller's dress ──
  {
    id: 'ev-spy-real',
    tier: 2,
    real: true,
    pair: 'ev-spy',
    onDay: 13,
    from: DARBAR,
    to: OFFICE,
    text: {
      en: 'A European found in the Qudsia Bagh was declared to be John Lawrence, known by an old wound. Stripped, he had no wound. He wore a fortune-teller\'s dress.',
      hi: 'क़ुदसिया बाग़ में मिले एक यूरोपियन को जॉन लॉरेंस बताया गया, जिसे एक पुराने घाव से पहचाना गया। कपड़े उतरवाए तो कोई घाव नहीं था। वह ज्योतिषी के भेस में था।',
    },
    checks: { en: ['declared to be John Lawrence', 'he had no wound'], hi: ['जॉन लॉरेंस बताया गया', 'कोई घाव नहीं था'] },
    why: {
      text: {
        en: 'Jiwan Lal, 29 May. The real Lawrence was far away at Rawalpindi.',
        hi: 'जीवन लाल, 29 मई। असली लॉरेंस दूर रावलपिंडी में थे।',
      },
      sources: [jl('p.107'), majumdar('p.71'), sen('p.77')],
    },
  },
  {
    id: 'ev-spy-forged',
    tier: 1,
    real: false,
    pair: 'ev-spy',
    onDay: 13,
    from: DARBAR,
    to: OFFICE,
    text: {
      en: 'Great news: John Lawrence, Lieutenant-Governor of the Punjab, was caught in the Qudsia Bagh dressed as a fortune-teller. He has confessed everything.',
      hi: 'बड़ी ख़बर: पंजाब के लेफ़्टिनेंट-गवर्नर जॉन लॉरेंस क़ुदसिया बाग़ में ज्योतिषी के भेस में पकड़े गए। उन्होंने सब क़बूल कर लिया है।',
    },
    checks: { en: ['Lieutenant-Governor of the Punjab'], hi: ['पंजाब के लेफ़्टिनेंट-गवर्नर'] },
    tells: [
      {
        kind: 'name',
        ruleId: 'english-titles',
        explain: {
          en: 'Lawrence was Chief Commissioner, not Lieutenant-Governor, and at Rawalpindi that May.',
          hi: 'लॉरेंस चीफ़ कमिश्नर थे, लेफ़्टिनेंट-गवर्नर नहीं, और उस मई रावलपिंडी में थे।',
        },
        sources: [majumdar('p.71'), sen('p.77'), sen('p.327'), jl('p.107')],
      },
    ],
  },

  // ── Day 14, Sat 30 May: the Hindun ──
  {
    id: 'ev-hindun',
    tier: 3,
    real: true,
    onDay: 14,
    from: { en: 'News from the Hindun', hi: 'हिंडन से ख़बर' },
    to: OFFICE,
    text: {
      en: 'News from the Hindun: our guns were taken and the gunners fled. Mirza Abu Bakr, who commanded, boasts to the King of his bravery.',
      hi: 'हिंडन से ख़बर: हमारी तोपें छिन गईं और तोपची भाग गए। कमान करने वाले मिर्ज़ा अबू बक्र बादशाह के सामने अपनी बहादुरी की शेख़ी बघार रहे हैं।',
    },
    checks: { en: ['boasts to the King of his bravery'], hi: ['अपनी बहादुरी की शेख़ी'] },
    why: {
      text: {
        en: 'Odd but true: Jiwan Lal, writing for the English, records this boast, 30 May.',
        hi: 'अजीब पर सच: अंग्रेज़ों के लिए लिखने वाले जीवन लाल ने 30 मई को यह शेख़ी दर्ज की।',
      },
      sources: [jl('pp.78, 108'), sen('p.79')],
    },
  },
]

const datelessMessages: Message[] = [
  // ── Regiments ──
  {
    id: 'cavalry-real',
    tier: 1,
    real: true,
    pair: 'cavalry',
    from: { en: 'Officers, 3rd Light Cavalry', hi: 'तीसरी घुड़सवार पलटन के अफ़सर' },
    to: KING,
    text: {
      en: 'Shelter of the World! We, the sowars of the 3rd Light Cavalry, rode from Meerut to serve you. Our horses need grain.',
      hi: 'जहाँपनाह! हम, तीसरी घुड़सवार पलटन के सवार, मेरठ से आपकी ख़िदमत में आए हैं। हमारे घोड़ों को दाना चाहिए।',
    },
    checks: { en: ['3rd Light Cavalry, rode from Meerut'], hi: ['तीसरी घुड़सवार पलटन के सवार, मेरठ से'] },
    why: {
      text: {
        en: 'Written for the game: the 3rd Light Cavalry did ride from Meerut.',
        hi: 'खेल के लिए लिखा गया: तीसरी घुड़सवार पलटन सच में मेरठ से आई थी।',
      },
      sources: [sen('pp.59-60'), trial(PETITIONS)],
    },
  },
  {
    id: 'cavalry-forged',
    tier: 1,
    real: false,
    pair: 'cavalry',
    from: { en: 'Officers, 4th Light Cavalry', hi: 'चौथी घुड़सवार पलटन के अफ़सर' },
    to: KING,
    text: {
      en: 'Shelter of the World! We, the sowars of the 4th Light Cavalry, rode from Meerut to serve you. Our horses need grain.',
      hi: 'जहाँपनाह! हम, चौथी घुड़सवार पलटन के सवार, मेरठ से आपकी ख़िदमत में आए हैं। हमारे घोड़ों को दाना चाहिए।',
    },
    checks: { en: ['4th Light Cavalry, rode from Meerut'], hi: ['चौथी घुड़सवार पलटन के सवार, मेरठ से'] },
    tells: [
      {
        kind: 'number',
        factId: 'regiments',
        explain: { en: 'The 3rd Light Cavalry rode from Meerut, not the 4th.', hi: 'मेरठ से तीसरी घुड़सवार पलटन आई थी, चौथी नहीं।' },
        sources: [sen('pp.59-60')],
      },
    ],
  },
  {
    id: 'guard-real',
    tier: 1,
    real: true,
    pair: 'guard',
    from: { en: 'An officer of the King', hi: 'बादशाह का एक अफ़सर' },
    to: KING,
    text: {
      en: 'Shelter of the World! My guard is gone; mobs come to plunder my house. [King, in pencil:] Mirza Mughal will station a guard from the 20th Native Infantry.',
      hi: 'जहाँपनाह! मेरा पहरा हट गया है; बदमाश घर लूटने आते हैं। [बादशाह, पेंसिल से:] मिर्ज़ा मुग़ल 20वीं पैदल पलटन से पहरा लगाएँ।',
    },
    checks: { en: ['20th Native Infantry'], hi: ['20वीं पैदल पलटन'] },
    why: {
      text: {
        en: 'After a real petition of 23 May; the 20th came from Meerut.',
        hi: '23 मई की एक असली अर्ज़ी पर आधारित; 20वीं पलटन मेरठ से आई थी।',
      },
      sources: [trial('Petition No. 3 (Capt. Dildar Ali Khan), dated 23 May 1857, before p.10'), sen('p.61')],
    },
  },
  {
    id: 'guard-forged',
    tier: 1,
    real: false,
    pair: 'guard',
    from: { en: 'An officer of the King', hi: 'बादशाह का एक अफ़सर' },
    to: KING,
    text: {
      en: 'Shelter of the World! My guard is gone; mobs come to plunder my house. [King, in pencil:] Mirza Mughal will station a guard from the 37th Native Infantry.',
      hi: 'जहाँपनाह! मेरा पहरा हट गया है; बदमाश घर लूटने आते हैं। [बादशाह, पेंसिल से:] मिर्ज़ा मुग़ल 37वीं पैदल पलटन से पहरा लगाएँ।',
    },
    checks: { en: ['37th Native Infantry'], hi: ['37वीं पैदल पलटन'] },
    tells: [
      {
        kind: 'number',
        factId: 'regiments',
        explain: { en: 'The 38th was in Delhi, not the 37th.', hi: 'दिल्ली में 38वीं पलटन थी, 37वीं नहीं।' },
        sources: [mh('p.53'), sen('pp.59-62')],
      },
    ],
  },

  // ── Money ──
  {
    id: 'annas-real',
    tier: 1,
    real: true,
    pair: 'annas',
    from: { en: 'Shopkeepers, Chandni Chowk', hi: 'चाँदनी चौक के दुकानदार' },
    to: KING,
    text: {
      en: 'Shelter of the World! Soldiers took cloth worth 3 rupees 8 annas from our shops and paid nothing.',
      hi: 'जहाँपनाह! सिपाही हमारी दुकानों से 3 रुपये 8 आने का कपड़ा ले गए और एक पैसा नहीं दिया।',
    },
    checks: { en: ['3 rupees 8 annas'], hi: ['3 रुपये 8 आने'] },
    why: {
      text: {
        en: "Written for the game; soldiers taking goods unpaid is the King's own complaint.",
        hi: 'खेल के लिए लिखा गया; सिपाहियों का बिना दाम माल ले जाना बादशाह की अपनी शिकायत है।',
      },
      sources: [yule('s.v. Anna, p.31'), trial(KING_ORDER)],
    },
  },
  {
    id: 'annas-forged',
    tier: 1,
    real: false,
    pair: 'annas',
    from: { en: 'Shopkeepers, Chandni Chowk', hi: 'चाँदनी चौक के दुकानदार' },
    to: KING,
    text: {
      en: 'Shelter of the World! Soldiers took cloth worth 3 rupees 18 annas from our shops and paid nothing.',
      hi: 'जहाँपनाह! सिपाही हमारी दुकानों से 3 रुपये 18 आने का कपड़ा ले गए और एक पैसा नहीं दिया।',
    },
    checks: { en: ['3 rupees 18 annas'], hi: ['3 रुपये 18 आने'] },
    tells: [
      {
        kind: 'number',
        factId: 'money',
        explain: { en: '16 annas make a rupee: 4 rupees 2 annas, not 3 rupees 18.', hi: '16 आने का रुपया: 4 रुपये 2 आने, 3 रुपये 18 आने नहीं।' },
        sources: [yule('s.v. Anna, p.31')],
      },
    ],
  },
  {
    id: 'pay-real',
    tier: 1,
    real: true,
    pair: 'pay',
    from: { en: "The King's perwanah", hi: 'बादशाह का परवाना' },
    to: { en: 'Any regiment that joins', hi: 'आ मिलने वाली हर पलटन' },
    text: {
      en: "By the King's order: every foot soldier who joins shall have 30 rupees a month, every trooper 50. Come to Delhi.",
      hi: 'बादशाह के हुक्म से: आ मिलने वाले हर पैदल सिपाही को 30 रुपये महीना मिलेंगे, हर सवार को 50। दिल्ली आओ।',
    },
    checks: { en: ['shall have 30 rupees a month, every trooper 50'], hi: ['पैदल सिपाही को 30 रुपये'] },
    why: {
      text: {
        en: 'Mainodin: perwanahs extorted from the King promised these sums to regiments.',
        hi: 'मैनुद्दीन: बादशाह से लिखवाए गए परवाने पलटनों से यही रक़में कहते थे।',
      },
      sources: [mh('p.60')],
    },
  },
  {
    id: 'pay-forged',
    tier: 1,
    real: false,
    pair: 'pay',
    from: { en: "The King's perwanah", hi: 'बादशाह का परवाना' },
    to: { en: 'Any regiment that joins', hi: 'आ मिलने वाली हर पलटन' },
    text: {
      en: "By the King's order: every foot soldier who joins shall have 50 rupees a month, every trooper 30. Come to Delhi.",
      hi: 'बादशाह के हुक्म से: आ मिलने वाले हर पैदल सिपाही को 50 रुपये महीना मिलेंगे, हर सवार को 30। दिल्ली आओ।',
    },
    checks: { en: ['shall have 50 rupees a month, every trooper 30'], hi: ['पैदल सिपाही को 50 रुपये'] },
    tells: [
      {
        kind: 'number',
        factId: 'pay',
        explain: { en: 'Foot got 30 rupees and troopers 50, not the reverse: horses eat.', hi: 'पैदल को 30 रुपये, सवार को 50, उलटा नहीं: घोड़ा भी खाता है।' },
        sources: [mh('p.60')],
      },
    ],
  },

  // ── Gates ──
  {
    id: 'pass-real',
    tier: 1,
    real: true,
    pair: 'pass',
    from: { en: "Ahmad Ali, Ballabhgarh's agent", hi: 'अहमद अली, बल्लभगढ़ का मुख़्तार' },
    to: KING,
    text: {
      en: 'I pray… that the carts coming from Ballabhgarh are not to be molested… and that… the Soldiers at the Delhi Gate are not to oppose any hindrance.',
      hi: 'गुज़ारिश है… कि बल्लभगढ़ से आने वाली गाड़ियों को कोई न छेड़े… और… दिल्ली दरवाज़े के सिपाही कोई रुकावट न डालें।',
    },
    checks: { en: ['Soldiers at the Delhi Gate'], hi: ['दिल्ली दरवाज़े के सिपाही'] },
    document: { sources: [trial(NO60)] },
    why: {
      text: {
        en: "A real undated petition; Ballabhgarh's road enters at the Delhi Gate.",
        hi: 'बिना तारीख़ की असली अर्ज़ी; बल्लभगढ़ की सड़क दिल्ली दरवाज़े पर आती है।',
      },
      sources: [trial(NO60), trial(NO63), fanshawe('pp.5-6')],
    },
  },
  {
    id: 'pass-forged',
    tier: 1,
    real: false,
    pair: 'pass',
    from: { en: "Ahmad Ali, Ballabhgarh's agent", hi: 'अहमद अली, बल्लभगढ़ का मुख़्तार' },
    to: KING,
    text: {
      en: 'I pray… that the carts coming from Ballabhgarh are not to be molested… and that… the Soldiers at the Kashmiri Gate are not to oppose any hindrance.',
      hi: 'गुज़ारिश है… कि बल्लभगढ़ से आने वाली गाड़ियों को कोई न छेड़े… और… कश्मीरी दरवाज़े के सिपाही कोई रुकावट न डालें।',
    },
    checks: { en: ['Soldiers at the Kashmiri Gate'], hi: ['कश्मीरी दरवाज़े के सिपाही'] },
    tells: [
      {
        kind: 'place',
        factId: 'ballabhgarh-road',
        explain: {
          en: "Ballabhgarh's road enters at the Delhi Gate, not the northern Kashmiri Gate.",
          hi: 'बल्लभगढ़ की सड़क दिल्ली दरवाज़े पर आती है, उत्तर के कश्मीरी दरवाज़े पर नहीं।',
        },
        sources: [trial(NO63), fanshawe('pp.5-6')],
      },
    ],
  },
  {
    id: 'lahore-gate-real',
    tier: 2,
    real: true,
    pair: 'lahore-gate',
    from: { en: 'The King, in pencil', hi: 'बादशाह, पेंसिल से' },
    to: MIRZA,
    text: {
      en: 'Mirza Mughal will post a guard at the Lahore Gate of the city, at the western end of the road through the Chandni Chowk.',
      hi: 'मिर्ज़ा मुग़ल शहर के लाहौरी दरवाज़े पर, चाँदनी चौक वाली सड़क के पश्चिमी सिरे पर, पहरा लगाएँ।',
    },
    checks: { en: ['Lahore Gate of the city', 'western end of the road'], hi: ['शहर के लाहौरी दरवाज़े पर', 'सड़क के पश्चिमी सिरे पर'] },
    why: {
      text: {
        en: "Written for the game: the city's Lahore Gate ends that road in the west.",
        hi: 'खेल के लिए लिखा गया: वह सड़क पश्चिम में शहर के लाहौरी दरवाज़े पर ख़त्म होती है।',
      },
      sources: [fanshawe('pp.5-6'), fanshawe('p.53'), mh('p.61')],
    },
  },
  {
    id: 'lahore-gate-forged',
    tier: 2,
    real: false,
    pair: 'lahore-gate',
    from: { en: 'The King, in pencil', hi: 'बादशाह, पेंसिल से' },
    to: MIRZA,
    text: {
      en: 'Mirza Mughal will post a guard at the Lahore Gate of the Fort, at the western end of the road, where it meets the city wall.',
      hi: 'मिर्ज़ा मुग़ल क़िले के लाहौरी दरवाज़े पर, सड़क के पश्चिमी सिरे पर जहाँ वह शहर की दीवार से मिलती है, पहरा लगाएँ।',
    },
    checks: { en: ['Lahore Gate of the Fort', 'where it meets the city wall'], hi: ['क़िले के लाहौरी दरवाज़े पर', 'शहर की दीवार से मिलती है'] },
    tells: [
      {
        kind: 'place',
        factId: 'lahore-gates',
        explain: {
          en: "The city wall holds the city's Lahore Gate, not the Fort's.",
          hi: 'शहर की दीवार में शहर का लाहौरी दरवाज़ा है, क़िले का नहीं।',
        },
        sources: [fanshawe('pp.5-6'), fanshawe('p.53')],
      },
    ],
  },

  // ── Form and habit ──
  {
    id: 'chatta-real',
    tier: 2,
    real: true,
    pair: 'chatta',
    from: { en: 'Shopkeepers of the Chatta', hi: 'छत्ता बाज़ार के दुकानदार' },
    to: KING,
    text: {
      en: '…Soldiery have established their residence immediately in the front of our shops… [King, in pencil:] Mirza Mughal will have their shops given to these shop-keepers.',
      hi: '…सिपाहियों ने ठीक हमारी दुकानों के सामने डेरा डाल लिया है… [बादशाह, पेंसिल से:] मिर्ज़ा मुग़ल इन दुकानदारों को उनकी दुकानें दिलवा दें।',
    },
    checks: {
      en: ['immediately in the front of our shops', 'Mirza Mughal will have their shops given'],
      hi: ['ठीक हमारी दुकानों के सामने डेरा डाल लिया', 'मिर्ज़ा मुग़ल इन दुकानदारों को उनकी दुकानें दिलवा दें'],
    },
    document: { sources: [trial(CHATTA)] },
    why: {
      text: {
        en: "A real undated petition from the Chatta, with the King's pencil order.",
        hi: 'छत्ता बाज़ार की बिना तारीख़ की असली अर्ज़ी, बादशाह के पेंसिल वाले हुक्म के साथ।',
      },
      sources: [trial(CHATTA), trial(KING_ORDER)],
    },
  },
  {
    id: 'chatta-forged',
    tier: 2,
    real: false,
    pair: 'chatta',
    from: { en: 'Shopkeepers of the Chatta', hi: 'छत्ता बाज़ार के दुकानदार' },
    to: KING,
    text: {
      en: "…Soldiery have established their residence immediately in the front of our shops… [King's reply:] My dear Mirza, kindly see they get their shops back. Yours affectionately, Bahadur Shah.",
      hi: '…सिपाहियों ने ठीक हमारी दुकानों के सामने डेरा डाल लिया है… [बादशाह का जवाब:] माई डियर मिर्ज़ा, देख लेना कि इन्हें दुकानें वापस मिलें। योर्स अफ़ेक्शनेटली, बहादुर शाह।',
    },
    checks: { en: ['My dear Mirza', 'Yours affectionately'], hi: ['माई डियर मिर्ज़ा', 'योर्स अफ़ेक्शनेटली'] },
    tells: [
      {
        kind: 'habit',
        ruleId: 'petition-form',
        sources: [trial(CHATTA)],
        explain: {
          en: "The King's notes are short orders, not 'My dear… Yours affectionately'.",
          hi: "बादशाह की टिप्पणियाँ छोटे हुक्म होती हैं, 'माई डियर… योर्स' वाली चिट्ठी नहीं।",
        },
      },
    ],
  },
  {
    id: 'kotwal-real',
    tier: 2,
    real: true,
    pair: 'kotwal',
    from: { en: 'Kazi Faiz Ulla, Kotwal', hi: 'क़ाज़ी फ़ैज़ुल्ला, कोतवाल' },
    to: KING,
    text: {
      en: 'Shelter of the World! Soldiers plunder houses on the false plea that Europeans hide there. Petition of the slave Kazi Faiz Ulla, under his seal.',
      hi: 'जहाँपनाह! सिपाही यह झूठा बहाना बनाकर घर लूटते हैं कि वहाँ यूरोपियन छिपे हैं। अर्ज़ी: ग़ुलाम क़ाज़ी फ़ैज़ुल्ला, अपनी मुहर के साथ।',
    },
    checks: { en: ['under his seal'], hi: ['अपनी मुहर के साथ'] },
    why: {
      text: {
        en: 'Written for the game: Kazi Faiz Ulla was Kotwal; the plunder plea is documented.',
        hi: 'खेल के लिए लिखा गया: क़ाज़ी फ़ैज़ुल्ला कोतवाल थे; लूट का यह बहाना दर्ज है।',
      },
      sources: [trial(CHUNI_19_20), trial(KING_ORDER), mh('p.58'), jl('p.92')],
    },
  },
  {
    id: 'kotwal-forged',
    tier: 2,
    real: false,
    pair: 'kotwal',
    from: { en: 'Kazi Faiz Ulla, Kotwal', hi: 'क़ाज़ी फ़ैज़ुल्ला, कोतवाल' },
    to: KING,
    text: {
      en: 'Shelter of the World! Soldiers plunder houses on the false plea that Europeans hide there. I have the honour to be, Sir, your most obedient servant, Faiz Ulla.',
      hi: 'जहाँपनाह! सिपाही यह झूठा बहाना बनाकर घर लूटते हैं कि वहाँ यूरोपियन छिपे हैं। आई हैव द ऑनर टू बी, सर, योर मोस्ट ओबीडिएंट सर्वेंट, फ़ैज़ुल्ला।',
    },
    checks: { en: ['your most obedient servant'], hi: ['मोस्ट ओबीडिएंट सर्वेंट'] },
    tells: [
      {
        kind: 'habit',
        ruleId: 'petition-form',
        sources: [trial(PETITIONS)],
        explain: {
          en: "A Kotwal ends with his seal, not 'your most obedient servant'.",
          hi: "कोतवाल अपनी मुहर लगाता है, 'ओबीडिएंट सर्वेंट' नहीं लिखता।",
        },
      },
    ],
  },

  // ── Weekday ──
  {
    id: 'daily-report-real',
    tier: 2,
    real: true,
    pair: 'daily-report',
    from: { en: 'Palace news-writer', hi: 'महल का ख़बरनवीस' },
    to: OFFICE,
    text: {
      en: 'Report for {weekday}, {date}. The King held court in the Hall of Special Audience. The soldiers again asked for their pay.',
      hi: '{weekday}, {date} की रिपोर्ट। बादशाह ने दीवान-ए-ख़ास में दरबार लगाया। सिपाहियों ने फिर तनख़्वाह माँगी।',
    },
    checks: { en: ['Report for'], hi: ['की रिपोर्ट'] },
    why: {
      text: {
        en: 'Written for the game: date and weekday agree; soldiers kept demanding pay.',
        hi: 'खेल के लिए लिखा गया: तारीख़ और दिन मेल खाते हैं; सिपाही बार-बार तनख़्वाह माँगते थे।',
      },
      sources: [mh('p.60'), trial(CHUNI_18), jl('pp.100, 105')],
    },
  },
  {
    id: 'daily-report-forged',
    tier: 2,
    real: false,
    pair: 'daily-report',
    from: { en: 'Palace news-writer', hi: 'महल का ख़बरनवीस' },
    to: OFFICE,
    text: {
      en: 'Report for {weekday+1}, {date}. The King held court in the Hall of Special Audience. The soldiers again asked for their pay.',
      hi: '{weekday+1}, {date} की रिपोर्ट। बादशाह ने दीवान-ए-ख़ास में दरबार लगाया। सिपाहियों ने फिर तनख़्वाह माँगी।',
    },
    checks: { en: ['Report for'], hi: ['की रिपोर्ट'] },
    tells: [
      {
        kind: 'weekday',
        ruleId: 'weekdays',
        explain: { en: 'Wrong weekday, not today: count on from Sunday 17 May.', hi: 'दिन ग़लत है, आज का नहीं: रविवार 17 मई से आगे गिनिए।' },
        sources: [trial(CHUNI_17)],
      },
    ],
  },

  // ── Rumours ──
  {
    id: 'ambala-real',
    tier: 2,
    real: true,
    pair: 'rumour',
    from: NEWSWRITER,
    to: OFFICE,
    text: {
      en: 'It is reported that English troops are coming from Ambala. Nothing more is known for certain.',
      hi: 'ख़बर है कि अंग्रेज़ी फ़ौजें अंबाला से आ रही हैं। पक्का कुछ और पता नहीं।',
    },
    checks: { en: ['troops are coming from Ambala'], hi: ['अंबाला से आ रही हैं'] },
    why: {
      text: {
        en: 'Chuni Lal, 17 May, nearly word for word: a rumour labelled as rumour.',
        hi: 'चुन्नी लाल, 17 मई, लगभग उन्हीं शब्दों में: अफ़वाह को अफ़वाह ही कहा गया।',
      },
      sources: [trial(CHUNI_17), jl('p.107')],
    },
  },
  {
    id: 'persian-forged',
    tier: 2,
    real: false,
    pair: 'rumour',
    from: NEWSWRITER,
    to: OFFICE,
    text: {
      en: 'It is certain: a Persian army of 50,000 has crossed the Attock and will reach Delhi within the month.',
      hi: 'यह पक्की ख़बर है: 50,000 की ईरानी फ़ौज अटक पार कर चुकी है और महीने भर में दिल्ली पहुँचेगी।',
    },
    checks: { en: ['It is certain', 'a Persian army of 50,000'], hi: ['यह पक्की ख़बर है', '50,000 की ईरानी फ़ौज'] },
    tells: [
      {
        kind: 'knowledge',
        ruleId: 'persian-bait',
        sources: [trial(PERSIAN)],
        explain: {
          en: "A Persian army was rumour, not fact; even Delhi's editors doubted Attock.",
          hi: 'ईरानी फ़ौज अफ़वाह थी, सच नहीं; दिल्ली के संपादकों को भी अटक पर शक था।',
        },
      },
    ],
  },
  {
    id: 'meerut-real',
    tier: 2,
    real: true,
    pair: 'english-camp',
    from: { en: "King's messengers, back from Meerut", hi: 'मेरठ से लौटे शाही हरकारे' },
    to: OFFICE,
    text: {
      en: 'The English at Meerut have gathered in their entrenchment with their families and mounted guns.',
      hi: 'मेरठ के अंग्रेज़ परिवारों के साथ अपने मोर्चे में इकट्ठा हो गए हैं और तोपें चढ़ा रखी हैं।',
    },
    checks: { en: ['gathered in their entrenchment'], hi: ['अपने मोर्चे में इकट्ठा'] },
    why: {
      text: {
        en: 'Chuni Lal, 17-18 May: the English at Meerut were entrenched with guns.',
        hi: 'चुन्नी लाल, 17-18 मई: मेरठ के अंग्रेज़ तोपों के साथ मोर्चे में थे।',
      },
      sources: [trial(CHUNI_17), trial(CHUNI_18), jl('p.106')],
    },
  },
  {
    id: 'ridge-forged',
    tier: 3,
    real: false,
    pair: 'english-camp',
    from: DARBAR,
    to: OFFICE,
    text: {
      en: "The English now hold the Ridge outside the Kashmiri Gate, with guns at Hindu Rao's house. They will storm Delhi within the week.",
      hi: 'अंग्रेज़ अब कश्मीरी दरवाज़े के बाहर रिज (पहाड़ी) पर जमे हैं, हिंदू राव के मकान पर तोपें लगाकर। हफ़्ते भर में वे दिल्ली पर धावा बोलेंगे।',
    },
    checks: { en: ['hold the Ridge outside the Kashmiri Gate'], hi: ['रिज (पहाड़ी) पर जमे हैं'] },
    tells: [
      {
        kind: 'knowledge',
        factId: 'english-force',
        explain: { en: 'The English took the Ridge on 8 June, not in May.', hi: 'अंग्रेज़ों ने रिज पर 8 जून को क़ब्ज़ा किया, मई में नहीं।' },
        sources: [sen('p.79'), sen('pp.105-07'), jl('p.108')],
      },
    ],
  },
  {
    id: 'intercept-real',
    tier: 3,
    real: true,
    pair: 'intercept',
    from: { en: 'Seized at the bridge', hi: 'पुल पर पकड़ी गई चिट्ठी' },
    to: { en: 'Addressee torn off', hi: 'पता फटा हुआ' },
    text: {
      en: '(In English.) The 3rd Light Cavalry and the 11th and 20th Native Infantry rose at Meerut on Sunday the 10th. The Commander-in-Chief must be told.',
      hi: '(अंग्रेज़ी में) तीसरी घुड़सवार पलटन और 11वीं व 20वीं पैदल पलटनें 10 तारीख़, रविवार को मेरठ में उठ खड़ी हुईं। कमांडर-इन-चीफ़ को ख़बर दी जाए।',
    },
    checks: { en: ['rose at Meerut on Sunday the 10th'], hi: ['10 तारीख़, रविवार को मेरठ में'] },
    why: {
      text: {
        en: 'Written for the game; it looks like a trap, but every detail is right.',
        hi: 'खेल के लिए लिखा गया; जाल लगता है, पर हर बात सही है।',
      },
      sources: [trial(CHUNI_17), sen('pp.59-62'), mh('p.53'), majumdar('p.71'), sen('p.78')],
    },
  },
  {
    id: 'intercept-forged',
    tier: 3,
    real: false,
    pair: 'intercept',
    from: { en: 'Seized at the bridge', hi: 'पुल पर पकड़ी गई चिट्ठी' },
    to: { en: 'Addressee torn off', hi: 'पता फटा हुआ' },
    text: {
      en: '(In English.) The 3rd Light Cavalry and the 11th and 20th Native Infantry rose at Meerut on Sunday the 10th. The Viceroy, Lord Canning, must be told.',
      hi: '(अंग्रेज़ी में) तीसरी घुड़सवार पलटन और 11वीं व 20वीं पैदल पलटनें 10 तारीख़, रविवार को मेरठ में उठ खड़ी हुईं। वायसराय लॉर्ड कैनिंग को ख़बर दी जाए।',
    },
    checks: { en: ['The Viceroy, Lord Canning'], hi: ['वायसराय लॉर्ड कैनिंग'] },
    tells: [
      {
        kind: 'anachronism',
        factId: 'governor-general',
        ruleId: 'english-titles',
        explain: {
          en: 'Canning was Governor-General, not Viceroy; that title came in November 1858.',
          hi: 'कैनिंग गवर्नर-जनरल थे, वायसराय नहीं; वह ओहदा नवंबर 1858 में आया।',
        },
        sources: [majumdar('p.71'), fanshawe('p.214'), sen('p.356')],
      },
    ],
  },

  // ── Proclamations ──
  {
    id: 'courts-real',
    tier: 2,
    real: true,
    pair: 'proclamation',
    from: { en: 'Proclamation', hi: 'ऐलान' },
    to: PEOPLE,
    text: {
      en: "Proclamation under the King's special seal: courts of justice are established, and soldiers are forbidden acts of violence.",
      hi: 'बादशाह की ख़ास मुहर से ऐलान: इंसाफ़ की अदालतें बन गई हैं, और सिपाहियों को ज़ोर-ज़बरदस्ती मना है।',
    },
    checks: { en: ['courts of justice are established'], hi: ['इंसाफ़ की अदालतें बन गई हैं'] },
    why: {
      text: {
        en: "From the King's own order, which says this notice had no effect.",
        hi: 'बादशाह के अपने हुक्म से, जो कहता है कि इस ऐलान का कोई असर नहीं हुआ।',
      },
      sources: [trial(KING_ORDER), jl('p.92')],
    },
  },
  {
    id: 'bakht-khan-forged',
    tier: 3,
    real: false,
    pair: 'proclamation',
    from: { en: 'Drum proclamation', hi: 'ढिंढोरा' },
    to: PEOPLE,
    text: {
      en: 'By beat of drum, by order of General Bakht Khan: every shopkeeper must keep arms; a soldier caught plundering loses an arm.',
      hi: 'ढोल पीटकर ऐलान, जनरल बख़्त ख़ान के हुक्म से: हर दुकानदार हथियार रखे; लूटते पकड़े गए सिपाही का हाथ कटेगा।',
    },
    checks: { en: ['by order of General Bakht Khan'], hi: ['जनरल बख़्त ख़ान के हुक्म से'] },
    tells: [
      {
        kind: 'anachronism',
        factId: 'bakht-khan',
        explain: {
          en: "A real order of 2 July, not May: Bakht Khan hadn't arrived yet.",
          hi: 'यह 2 जुलाई का असली हुक्म है, मई का नहीं: बख़्त ख़ान तब आए ही नहीं थे।',
        },
        sources: [jl('pp.133-35'), sen('p.83')],
      },
    ],
  },

  // ── Knowledge tells and genuine papers that look odd ──
  {
    id: 'baqir-real',
    tier: 3,
    real: true,
    pair: 'baqir',
    from: { en: "Note for the King's office", hi: 'बादशाह के दफ़्तर के लिए नोट' },
    to: MUNSHI,
    text: {
      en: 'On Sunday 17 May Maulvi Muhammad Baqir, of the press, was sent with two infantry companies and a cavalry troop to save the Gurgaon treasure.',
      hi: 'रविवार 17 मई को प्रेस वाले मौलवी मुहम्मद बाक़र को पैदल फ़ौज की दो कंपनियों और घुड़सवारों के एक दस्ते के साथ गुड़गाँव का ख़ज़ाना बचाने भेजा गया।',
    },
    checks: { en: ['On Sunday 17 May'], hi: ['रविवार 17 मई को'] },
    why: {
      text: {
        en: "Odd but true: Chuni Lal's diary for 17 May says exactly this.",
        hi: 'अजीब पर सच: 17 मई की चुन्नी लाल की डायरी में ठीक यही लिखा है।',
      },
      sources: [trial(CHUNI_17), jl('p.95')],
    },
  },
  {
    id: 'baqir-forged',
    tier: 2,
    real: false,
    pair: 'baqir',
    from: { en: "Note for the King's office", hi: 'बादशाह के दफ़्तर के लिए नोट' },
    to: MUNSHI,
    text: {
      en: 'On Monday 17 May Maulvi Muhammad Baqir, of the press, was sent with two infantry companies and a cavalry troop to save the Gurgaon treasure.',
      hi: 'सोमवार 17 मई को प्रेस वाले मौलवी मुहम्मद बाक़र को पैदल फ़ौज की दो कंपनियों और घुड़सवारों के एक दस्ते के साथ गुड़गाँव का ख़ज़ाना बचाने भेजा गया।',
    },
    checks: { en: ['On Monday 17 May'], hi: ['सोमवार 17 मई को'] },
    tells: [
      {
        kind: 'weekday',
        ruleId: 'weekdays',
        explain: { en: '17 May 1857 was a Sunday, not a Monday.', hi: '17 मई 1857 रविवार था, सोमवार नहीं।' },
        sources: [trial(CHUNI_17)],
      },
    ],
  },
  {
    id: 'bounty-real',
    tier: 3,
    real: true,
    pair: 'bounty',
    from: { en: 'Proclamation', hi: 'ऐलान' },
    to: PEOPLE,
    text: {
      en: 'Proclamation: the King offers 10,000 rupees for the capture of Sir Theophilus Metcalfe.',
      hi: 'ऐलान: सर थियोफ़िलस मेटकाफ़ को पकड़वाने वाले को बादशाह 10,000 रुपये देंगे।',
    },
    checks: { en: ['Sir Theophilus Metcalfe'], hi: ['सर थियोफ़िलस मेटकाफ़'] },
    why: {
      text: {
        en: 'Mainodin, who was secretly hiding Metcalfe, records this reward.',
        hi: 'चुपके से मेटकाफ़ को छिपाने वाले मैनुद्दीन ने यह इनाम दर्ज किया है।',
      },
      sources: [mh('p.57'), jl('pp.95-96')],
    },
  },
  {
    id: 'bounty-forged',
    tier: 3,
    real: false,
    pair: 'bounty',
    from: { en: 'Proclamation', hi: 'ऐलान' },
    to: PEOPLE,
    text: {
      en: 'Proclamation: the King offers 10,000 rupees for the capture of Commissioner Simon Fraser.',
      hi: 'ऐलान: कमिश्नर साइमन फ़्रेज़र को पकड़वाने वाले को बादशाह 10,000 रुपये देंगे।',
    },
    checks: { en: ['Commissioner Simon Fraser'], hi: ['कमिश्नर साइमन फ़्रेज़र'] },
    tells: [
      {
        kind: 'knowledge',
        explain: {
          en: 'Fraser was killed on 11 May; the reward was for Metcalfe, not him.',
          hi: 'फ़्रेज़र 11 मई को मारे जा चुके थे; इनाम मेटकाफ़ के लिए था, उनके लिए नहीं।',
        },
        sources: [jl('pp.80-81'), mh('p.57'), mh('pp.43-46'), jl('p.95')],
      },
    ],
  },
  {
    id: 'missives-real',
    tier: 3,
    real: true,
    pair: 'patiala',
    from: { en: "Note for the King's office", hi: 'बादशाह के दफ़्तर के लिए नोट' },
    to: MUNSHI,
    text: {
      en: "On Sunday 17 May troopers carried the King's summons to Patiala, Jaipur, Alwar, Jodhpur, Kotah and Bundi.",
      hi: 'रविवार 17 मई को सवार बादशाह का बुलावा पटियाला, जयपुर, अलवर, जोधपुर, कोटा और बूँदी ले गए।',
    },
    checks: { en: ["the King's summons to Patiala"], hi: ['बादशाह का बुलावा पटियाला'] },
    why: {
      text: {
        en: 'Chuni Lal, 17 May. The King wrote to all; Patiala never answered.',
        hi: 'चुन्नी लाल, 17 मई। बादशाह ने सबको लिखा; पटियाला ने कभी जवाब नहीं दिया।',
      },
      sources: [trial(CHUNI_17), majumdar('p.126')],
    },
  },
  {
    id: 'patiala-forged',
    tier: 3,
    real: false,
    pair: 'patiala',
    from: DARBAR,
    to: OFFICE,
    text: {
      en: 'Good news: the Maharaja of Patiala has come to Delhi in person with his army to fight for the King.',
      hi: 'ख़ुशख़बरी: पटियाला के महाराजा ख़ुद अपनी फ़ौज लेकर दिल्ली आ गए हैं, बादशाह के लिए लड़ने।',
    },
    checks: { en: ['has come to Delhi in person with his army'], hi: ['ख़ुद अपनी फ़ौज लेकर दिल्ली आ गए हैं'] },
    tells: [
      {
        kind: 'knowledge',
        explain: {
          en: 'Patiala joined the English within eighteen hours of their call, not the King.',
          hi: 'पटियाला अंग्रेज़ों के बुलाने के अठारह घंटे में उनसे जा मिला, बादशाह से नहीं।',
        },
        sources: [caveBrowne('p.190'), jl('p.97'), trial(CHUNI_19_20), majumdar('p.126')],
      },
    ],
  },
]

export const messages: Message[] = [...eventMessages, ...datelessMessages]
