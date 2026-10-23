import type { Message } from '../../types.js'
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
} from './sources.js'

// Days: 1 = Sun 17 May 1857 … 14 = Sat 30 May 1857. Events on days 1-3 are tier 1.
// Real documents quote public-domain translations, trimmed to the telling line ("…" marks cuts);
// names use the case-file spelling (Mirza Mughal, Abu Bakr).
// Story pass (2026-10-24): one arc, from a new court (days 2-5) through plunder and Eid (6-9) to
// sabotage, suspicion and spies (10-13) and the first battle on the Hindun (14). Famous moments of
// 1857 (Mangal Pandey, the Meerut 85, Nana Sahib, the Rani of Jhansi, Bakht Khan) come in as
// genuine news or as hard knowledge tells.

const KING = { en: 'The King, Red Fort', hi: 'बादशाह सलामत, लाल क़िला' }
const OFFICE = { en: "The King's office", hi: 'बादशाह का दफ़्तर' }
const MUNSHI = { en: "The King's munshi", hi: 'बादशाह का मुंशी' }
const PEOPLE = { en: 'The people of Delhi', hi: 'दिल्ली के लोग' }
const MIRZA = { en: 'Mirza Mughal', hi: 'मिर्ज़ा मुग़ल' }
const COURT_NEWS = { en: 'Court news-writer', hi: 'दरबार का ख़बरनवीस' }
const NEWSWRITER = { en: 'News-writer', hi: 'ख़बरनवीस' }
const SENIOR = { en: 'The senior munshi', hi: 'बड़े मुंशी' }
const NEW_MUNSHI = { en: 'The new munshi', hi: 'नए मुंशी' }
const NO64 = 'Petition No. 64, dated 24 May 1857, p.34'
const NO60 = 'Petition No. 60, undated, p.32'
const NO63 = 'Petition No. 63, 22 May 1857, p.33'
const PETITIONS = 'petitions, e.g. Nos. 60-68, pp.32-35'
const PERSIAN = "'Authentic News', 23 March 1857, and Delhi newspapers of August-September 1857, c. pp.128-31"
// Mangal Pandey: the attack of 29 March at Barrackpore (Sen pp.49-50; Majumdar pp.46-47) and the
// hanging on 8 April (Cave-Browne I p.21).
const PANDEY = [sen('pp.49-50'), majumdar('pp.46-47'), caveBrowne('p.21')]
// Nana Sahib guarded the Kanpur treasury for the English from about 22 May (Sen pp.131-33);
// Kanpur rose late on 4 June (Sen p.136).
const NANA = [sen('pp.131-33'), sen('p.136')]

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
      en: 'Monday, 18th May 1857. The King… took his seat on the throne, in state. The King bestowed arms and dresses of honour… on Mirza Mughal as Commander-in-Chief…',
      hi: 'सोमवार, 18 मई 1857। बादशाह… शान से तख़्त पर बैठे। बादशाह ने… मिर्ज़ा मुग़ल को कमांडर-इन-चीफ़ बनाकर हथियार और इज़्ज़त की पोशाकें दीं…',
    },
    checks: { en: ['Mirza Mughal as Commander-in-Chief'], hi: ['मिर्ज़ा मुग़ल को कमांडर-इन-चीफ़'] },
    document: { sources: [trial(CHUNI_18)] },
    why: {
      text: {
        en: "Chuni Lal's news diary, Monday 18 May: Mirza Mughal took command of the army.",
        hi: 'चुन्नी लाल की डायरी, सोमवार 18 मई: फ़ौज की कमान मिर्ज़ा मुग़ल को मिली।',
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
      en: 'Monday, 18th May 1857. The King… took his seat on the throne, in state. The King bestowed arms and dresses of honour… on Mirza Jawan Bakht as Commander-in-Chief…',
      hi: 'सोमवार, 18 मई 1857। बादशाह… शान से तख़्त पर बैठे। बादशाह ने… मिर्ज़ा जवाँ बख़्त को कमांडर-इन-चीफ़ बनाकर हथियार और इज़्ज़त की पोशाकें दीं…',
    },
    checks: { en: ['Mirza Jawan Bakht as Commander-in-Chief'], hi: ['मिर्ज़ा जवाँ बख़्त को कमांडर-इन-चीफ़'] },
    tells: [
      {
        kind: 'name',
        factId: 'commanders',
        explain: {
          en: 'Mirza Mughal was made Commander-in-Chief; Jawan Bakht was made minister.',
          hi: 'कमांडर-इन-चीफ़ मिर्ज़ा मुग़ल बने; जवाँ बख़्त वज़ीर बनाए गए।',
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
      en: "19th May. The new gold coins (mohurs) read: 'Silver and gold coin struck by the King of India… The sovereign Suraj-u-din the brave.'",
      hi: "19 मई। सोने की नई मोहरों पर लिखा है: 'हिंद के बादशाह ने चाँदी और सोने का सिक्का चलाया… बादशाह सिराजुद्दीन, बहादुर।'",
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
      en: "19th May. The new gold coins (mohurs) read: 'Silver and gold coin struck by the King of India… The sovereign Abu Bakr the brave.'",
      hi: "19 मई। सोने की नई मोहरों पर लिखा है: 'हिंद के बादशाह ने चाँदी और सोने का सिक्का चलाया… बादशाह अबू बक्र, बहादुर।'",
    },
    checks: { en: ['The sovereign Abu Bakr the brave'], hi: ['बादशाह अबू बक्र, बहादुर'] },
    tells: [
      {
        kind: 'name',
        factId: 'court',
        explain: {
          en: 'The coins name the old King, Siraj-ud-din, not his grandson Abu Bakr.',
          hi: 'सिक्कों पर बूढ़े बादशाह का नाम सिराजुद्दीन है, उनके पोते अबू बक्र का नहीं।',
        },
        sources: [jl('pp.95-97'), trial(CHUNI_18)],
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
      en: "Wednesday, 20th May. To a group of Hindu officers the King replied: 'The Holy War is against the English; I have forbidden it against the Hindus.'",
      hi: "बुधवार, 20 मई। हिंदू अफ़सरों के एक दल से बादशाह ने कहा: 'जिहाद अंग्रेज़ों के ख़िलाफ़ है; हिंदुओं के ख़िलाफ़ मैंने इसे मना कर दिया है।'",
    },
    checks: { en: ['I have forbidden it against the Hindus'], hi: ['हिंदुओं के ख़िलाफ़ मैंने इसे मना कर दिया है'] },
    document: { sources: [jl('p.98')] },
    why: {
      text: {
        en: "Jiwan Lal's diary, Wednesday 20 May; Chuni Lal's news diary agrees.",
        hi: 'बुधवार 20 मई की जीवन लाल की डायरी; चुन्नी लाल की डायरी भी यही कहती है।',
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
      en: 'Thursday, 21st May. By beat of drum: Hindus and Mahommedans must not quarrel.',
      hi: 'गुरुवार, 21 मई। ढोल पीटकर ऐलान: हिंदू और मुसलमान आपस में न झगड़ें।',
    },
    checks: { en: ['must not quarrel'], hi: ['आपस में न झगड़ें'] },
    document: { sources: [jl('p.100')] },
    why: {
      text: {
        en: 'Jiwan Lal recorded this drum proclamation on Thursday 21 May.',
        hi: 'जीवन लाल ने गुरुवार 21 मई को यह ढिंढोरा दर्ज किया।',
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
          en: 'The King complained of caps and horses at court; he never praised them.',
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
    from: COURT_NEWS,
    to: OFFICE,
    text: {
      en: 'Eid, Monday 25 May. During prayers a camel rider from Ballabhgarh cried that the English were coming. He had mistaken an Eid procession for their army.',
      hi: 'ईद, सोमवार 25 मई। नमाज़ के वक़्त बल्लभगढ़ से एक ऊँट-सवार चिल्लाया कि अंग्रेज़ आ रहे हैं। उसने ईद के जुलूस को अंग्रेज़ी फ़ौज समझ लिया था।',
    },
    checks: { en: ['Eid, Monday 25 May', 'mistaken an Eid procession'], hi: ['ईद, सोमवार 25 मई', 'ईद के जुलूस को अंग्रेज़ी फ़ौज समझ'] },
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
    from: COURT_NEWS,
    to: OFFICE,
    text: {
      en: 'Eid was yesterday, Sunday. During prayers a camel rider from Ballabhgarh cried that the English were coming. They are at the gates: let the King flee tonight.',
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

  // ── Day 10, Tue 26 May: stones in the guns, and the King's physician blamed ──
  {
    id: 'ev-guns-real',
    tier: 1,
    real: true,
    pair: 'ev-guns',
    onDay: 10,
    from: { en: 'Report from the bastions', hi: 'बुर्जों से रिपोर्ट' },
    to: OFFICE,
    text: {
      en: "26th May. The guns on the Islamgarh bastion are found stuffed with stones. Soldiers accuse the King's physician, Hakim Ahsanullah Khan; the King shields him.",
      hi: '26 मई। इस्लामगढ़ बुर्ज की तोपों में पत्थर ठुँसे मिले। सिपाही बादशाह के हकीम अहसनुल्लाह ख़ान पर इल्ज़ाम लगा रहे हैं; बादशाह उन्हें बचा रहे हैं।',
    },
    checks: { en: ['found stuffed with stones', 'the King shields him'], hi: ['तोपों में पत्थर ठुँसे मिले', 'बादशाह उन्हें बचा रहे हैं'] },
    why: {
      text: {
        en: 'Jiwan Lal, 26 May: kankar in the guns; the King protected Ahsanullah.',
        hi: 'जीवन लाल, 26 मई: तोपों में कंकड़; बादशाह ने अहसनुल्लाह को बचाया।',
      },
      sources: [jl('p.103')],
    },
  },
  {
    id: 'ev-guns-forged',
    tier: 2,
    real: false,
    pair: 'ev-guns',
    onDay: 10,
    from: { en: 'Report from the bastions', hi: 'बुर्जों से रिपोर्ट' },
    to: OFFICE,
    text: {
      en: "26th May. Guns on the Islamgarh bastion are stuffed with stones. Gate guards found the proof: a letter from the King's physician to the Lieutenant-Governor at Lahore.",
      hi: '26 मई। इस्लामगढ़ बुर्ज की तोपों में पत्थर ठुँसे हैं। पहरेदारों को दरवाज़े पर सबूत मिला: बादशाह के हकीम की चिट्ठी, लाहौर के लेफ़्टिनेंट-गवर्नर के नाम।',
    },
    checks: { en: ['the Lieutenant-Governor at Lahore', 'Gate guards found the proof'], hi: ['लाहौर के लेफ़्टिनेंट-गवर्नर', 'पहरेदारों को दरवाज़े पर सबूत मिला'] },
    tells: [
      {
        kind: 'place',
        ruleId: 'english-titles',
        explain: {
          en: 'The Lieutenant-Governor sat at Agra, not Lahore; the Punjab had a Chief Commissioner.',
          hi: 'लेफ़्टिनेंट-गवर्नर आगरा में थे, लाहौर में नहीं; पंजाब में चीफ़ कमिश्नर थे।',
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

  // ── Day 12, Thu 28 May: news from Kanpur. Nana Sahib still serves the English, for one more week ──
  {
    id: 'nana-real',
    tier: 3,
    real: true,
    pair: 'nana',
    onDay: 12,
    from: NEWSWRITER,
    to: OFFICE,
    text: {
      en: 'News from Kanpur: Nana Sahib of Bithur is guarding the English treasury there, with his own men and two guns.',
      hi: 'कानपुर से ख़बर: बिठूर के नाना साहब अपने आदमियों और दो तोपों के साथ वहाँ अंग्रेज़ों के ख़ज़ाने की रखवाली कर रहे हैं।',
    },
    checks: { en: ['guarding the English treasury'], hi: ['अंग्रेज़ों के ख़ज़ाने की रखवाली'] },
    why: {
      text: {
        en: 'Odd but true: in May the English trusted Nana Sahib; Kanpur rose 4 June.',
        hi: 'अजीब पर सच: मई में अंग्रेज़ नाना साहब पर भरोसा करते थे; कानपुर 4 जून को उठा।',
      },
      sources: NANA,
    },
  },
  {
    id: 'nana-forged',
    tier: 3,
    real: false,
    pair: 'nana',
    onDay: 12,
    from: NEWSWRITER,
    to: OFFICE,
    text: {
      en: 'News from Kanpur: Nana Sahib of Bithur has risen against the English and besieges them in their camp there.',
      hi: 'कानपुर से ख़बर: बिठूर के नाना साहब अंग्रेज़ों के ख़िलाफ़ उठ खड़े हुए हैं और उन्हें उनकी छावनी में घेर रखा है।',
    },
    checks: { en: ['has risen against the English'], hi: ['अंग्रेज़ों के ख़िलाफ़ उठ खड़े हुए हैं'] },
    tells: [
      {
        kind: 'knowledge',
        explain: {
          en: 'Kanpur rose on 4 June; in May Nana Sahib still guarded the English treasury.',
          hi: 'कानपुर 4 जून को उठा; मई में नाना साहब अंग्रेज़ों का ख़ज़ाना सँभाल रहे थे।',
        },
        sources: NANA,
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
    from: COURT_NEWS,
    to: OFFICE,
    text: {
      en: 'A European in a fortune-teller\'s dress was caught. His captors said an old wound proved he was John Lawrence, Chief Commissioner of the Punjab. He had no wound.',
      hi: 'ज्योतिषी के भेस में एक यूरोपियन पकड़ा गया। पकड़ने वालों ने कहा कि एक पुराना घाव साबित करता है कि वह पंजाब के चीफ़ कमिश्नर जॉन लॉरेंस है। उसके शरीर पर कोई घाव नहीं था।',
    },
    checks: { en: ['Chief Commissioner of the Punjab', 'He had no wound'], hi: ['पंजाब के चीफ़ कमिश्नर', 'कोई घाव नहीं था'] },
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
    from: COURT_NEWS,
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

  // ── Day 14, Sat 30 May: the first battle, on the Hindun ──
  {
    id: 'ev-hindun',
    tier: 3,
    real: true,
    onDay: 14,
    from: { en: 'News from the Hindun', hi: 'हिंडन से ख़बर' },
    to: OFFICE,
    text: {
      en: '30th May. At the Hindun river the English took our guns and the gunners fled. Mirza Abu Bakr, who commanded, boasts to the King of his bravery.',
      hi: '30 मई। हिंडन नदी पर अंग्रेज़ों ने हमारी तोपें छीन लीं और तोपची भाग गए। कमान करने वाले मिर्ज़ा अबू बक्र बादशाह के सामने अपनी बहादुरी की शेख़ी बघार रहे हैं।',
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
  // ── Regiments: the Meerut riders and the 85 ──
  {
    id: 'cavalry-real',
    tier: 1,
    real: true,
    pair: 'cavalry',
    from: { en: 'Officers, 3rd Light Cavalry', hi: 'तीसरी घुड़सवार पलटन के अफ़सर' },
    to: KING,
    text: {
      en: 'Shelter of the World! We are the horsemen of the 3rd Light Cavalry. On Sunday 10 May we freed our 85 brothers at Meerut and rode to you.',
      hi: 'जहाँपनाह! हम तीसरी घुड़सवार पलटन के सवार हैं। रविवार 10 मई को हमने मेरठ में अपने 85 भाइयों को छुड़ाया और आपके पास आए।',
    },
    checks: { en: ['3rd Light Cavalry', 'Sunday 10 May'], hi: ['तीसरी घुड़सवार पलटन', 'रविवार 10 मई'] },
    why: {
      text: {
        en: 'Written for the game: on 10 May the 3rd Cavalry freed 85 chained comrades.',
        hi: 'खेल के लिए लिखा गया: 10 मई को तीसरी घुड़सवार पलटन ने 85 बँधे साथियों को छुड़ाया।',
      },
      sources: [sen('pp.57-59'), sen('p.70')],
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
      en: 'Shelter of the World! We are the horsemen of the 4th Light Cavalry. On Sunday 10 May we freed our 85 brothers at Meerut and rode to you.',
      hi: 'जहाँपनाह! हम चौथी घुड़सवार पलटन के सवार हैं। रविवार 10 मई को हमने मेरठ में अपने 85 भाइयों को छुड़ाया और आपके पास आए।',
    },
    checks: { en: ['4th Light Cavalry'], hi: ['चौथी घुड़सवार पलटन'] },
    tells: [
      {
        kind: 'number',
        factId: 'regiments',
        explain: { en: 'The 3rd Light Cavalry rode from Meerut, not the 4th.', hi: 'मेरठ से तीसरी घुड़सवार पलटन आई थी, चौथी नहीं।' },
        sources: [sen('pp.57-60')],
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
      en: 'Shelter of the World! My guard is gone; mobs come to plunder my house. The King wrote in pencil: Mirza Mughal will station a guard from the 20th Native Infantry.',
      hi: 'जहाँपनाह! मेरा पहरा हट गया है; बदमाश घर लूटने आते हैं। बादशाह ने पेंसिल से लिखा: मिर्ज़ा मुग़ल 20वीं पैदल पलटन से पहरा लगाएँ।',
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
      en: 'Shelter of the World! My guard is gone; mobs come to plunder my house. The King wrote in pencil: Mirza Mughal will station a guard from the 37th Native Infantry.',
      hi: 'जहाँपनाह! मेरा पहरा हट गया है; बदमाश घर लूटने आते हैं। बादशाह ने पेंसिल से लिखा: मिर्ज़ा मुग़ल 37वीं पैदल पलटन से पहरा लगाएँ।',
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
    from: { en: "The King's order", hi: 'बादशाह का हुक्म' },
    to: { en: 'Any regiment that joins', hi: 'आ मिलने वाली हर पलटन' },
    text: {
      en: "By the King's order: every foot soldier who joins shall have 30 rupees a month, every horseman 50. Come to Delhi.",
      hi: 'बादशाह के हुक्म से: आ मिलने वाले हर पैदल सिपाही को 30 रुपये महीना मिलेंगे, हर सवार को 50। दिल्ली आओ।',
    },
    checks: { en: ['30 rupees a month, every horseman 50'], hi: ['पैदल सिपाही को 30 रुपये'] },
    why: {
      text: {
        en: 'Mainodin: orders forced from the King promised these sums to regiments.',
        hi: 'मैनुद्दीन: बादशाह से ज़बरदस्ती लिखवाए गए हुक्म पलटनों से यही रक़में कहते थे।',
      },
      sources: [mh('p.60')],
    },
  },
  {
    id: 'pay-forged',
    tier: 1,
    real: false,
    pair: 'pay',
    from: { en: "The King's order", hi: 'बादशाह का हुक्म' },
    to: { en: 'Any regiment that joins', hi: 'आ मिलने वाली हर पलटन' },
    text: {
      en: "By the King's order: every foot soldier who joins shall have 50 rupees a month, every horseman 30. Come to Delhi.",
      hi: 'बादशाह के हुक्म से: आ मिलने वाले हर पैदल सिपाही को 50 रुपये महीना मिलेंगे, हर सवार को 30। दिल्ली आओ।',
    },
    checks: { en: ['50 rupees a month, every horseman 30'], hi: ['पैदल सिपाही को 50 रुपये'] },
    tells: [
      {
        kind: 'number',
        factId: 'pay',
        explain: { en: 'Foot got 30 rupees and horsemen 50, not the reverse: horses eat.', hi: 'पैदल को 30 रुपये, सवार को 50, उलटा नहीं: घोड़ा भी खाता है।' },
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
    from: { en: "Ahmad Ali, Ballabhgarh's agent", hi: 'अहमद अली, बल्लभगढ़ का वकील' },
    to: KING,
    text: {
      en: 'I pray… that a passport may be granted… the carts coming from Ballabhgarh… the Soldiers at the Delhi Gate are not to oppose any hindrance.',
      hi: 'गुज़ारिश है… कि एक पास दिया जाए… बल्लभगढ़ से आने वाली गाड़ियाँ… दिल्ली दरवाज़े के सिपाही कोई रुकावट न डालें।',
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
    from: { en: "Ahmad Ali, Ballabhgarh's agent", hi: 'अहमद अली, बल्लभगढ़ का वकील' },
    to: KING,
    text: {
      en: 'I pray… that a passport may be granted… the carts coming from Ballabhgarh… the Soldiers at the Kashmiri Gate are not to oppose any hindrance.',
      hi: 'गुज़ारिश है… कि एक पास दिया जाए… बल्लभगढ़ से आने वाली गाड़ियाँ… कश्मीरी दरवाज़े के सिपाही कोई रुकावट न डालें।',
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
      en: "Mirza Mughal will post a guard at the city's Lahore Gate, at the western end of the road through the Chandni Chowk, so the shops are not plundered.",
      hi: 'मिर्ज़ा मुग़ल शहर के लाहौरी दरवाज़े पर, चाँदनी चौक वाली सड़क के पश्चिमी सिरे पर, पहरा लगाएँ, ताकि दुकानें न लुटें।',
    },
    checks: { en: ["the city's Lahore Gate", 'western end of the road'], hi: ['शहर के लाहौरी दरवाज़े पर', 'सड़क के पश्चिमी सिरे पर'] },
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
      en: "Mirza Mughal will post a guard at the Fort's Lahore Gate, at the western end of the road through the Chandni Chowk, so the shops are not plundered.",
      hi: 'मिर्ज़ा मुग़ल क़िले के लाहौरी दरवाज़े पर, चाँदनी चौक वाली सड़क के पश्चिमी सिरे पर, पहरा लगाएँ, ताकि दुकानें न लुटें।',
    },
    checks: { en: ["the Fort's Lahore Gate", 'western end of the road'], hi: ['क़िले के लाहौरी दरवाज़े पर', 'सड़क के पश्चिमी सिरे पर'] },
    tells: [
      {
        kind: 'place',
        factId: 'lahore-gates',
        explain: {
          en: "The road's west end holds the city's Lahore Gate; the Fort's is east.",
          hi: 'सड़क के पश्चिमी सिरे पर शहर का लाहौरी दरवाज़ा है; क़िले का पूरब में।',
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
      en: '…Soldiery have established their residence immediately in the front of our shops… The King wrote in pencil: Mirza Mughal will have their shops given to these shop-keepers.',
      hi: '…सिपाहियों ने ठीक हमारी दुकानों के सामने डेरा डाल लिया है… बादशाह ने पेंसिल से लिखा: मिर्ज़ा मुग़ल इन दुकानदारों को उनकी दुकानें दिलवा दें।',
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
      en: '…Soldiery have established their residence immediately in the front of our shops… The King replied: My dear Mirza, kindly see they get their shops back. Yours affectionately, Bahadur Shah.',
      hi: '…सिपाहियों ने ठीक हमारी दुकानों के सामने डेरा डाल लिया है… बादशाह का जवाब: माई डियर मिर्ज़ा, देख लेना कि इन्हें दुकानें वापस मिलें। योर्स अफ़ेक्शनेटली, बहादुर शाह।',
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
      en: 'Shelter of the World! Soldiers plunder houses on the false plea that Europeans hide there. Petition of Kazi Faiz Ulla, Kotwal, under his seal.',
      hi: 'जहाँपनाह! सिपाही यह झूठा बहाना बनाकर घर लूटते हैं कि वहाँ यूरोपियन छिपे हैं। अर्ज़ी: क़ाज़ी फ़ैज़ुल्ला, कोतवाल, अपनी मुहर के साथ।',
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
          en: "A Persian army was rumour; that summer even Delhi's editors doubted Attock.",
          hi: 'ईरानी फ़ौज अफ़वाह थी; उस गर्मी दिल्ली के संपादकों को भी अटक पर शक था।',
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
      en: 'The English at Meerut have gathered with their families and built defences at the Suraj Kund, with guns drawn by elephants.',
      hi: 'मेरठ के अंग्रेज़ परिवारों समेत इकट्ठा हैं, और उन्होंने सूरज कुंड पर किलेबंदी कर ली है, हाथियों से खिंचने वाली तोपों के साथ।',
    },
    checks: { en: ['guns drawn by elephants'], hi: ['हाथियों से खिंचने वाली तोपों'] },
    why: {
      text: {
        en: "Chuni Lal, 17 May: the King's messengers brought exactly this from Meerut.",
        hi: 'चुन्नी लाल, 17 मई: बादशाह के हरकारे मेरठ से ठीक यही ख़बर लाए।',
      },
      sources: [trial(CHUNI_17), trial(CHUNI_18), jl('p.106')],
    },
  },
  {
    id: 'ridge-forged',
    tier: 3,
    real: false,
    pair: 'english-camp',
    from: COURT_NEWS,
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
      en: '(In English.) The 3rd Light Cavalry and the 11th and 20th Native Infantry rose at Meerut on Sunday the 10th. Our Commander-in-Chief must be told.',
      hi: '(अंग्रेज़ी में) तीसरी घुड़सवार पलटन और 11वीं व 20वीं पैदल पलटनें 10 तारीख़, रविवार को मेरठ में उठ खड़ी हुईं। हमारे कमांडर-इन-चीफ़ को ख़बर दी जाए।',
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
      en: "Proclamation under the King's special seal: courts of justice are set up in the city, and soldiers are forbidden all violence.",
      hi: 'बादशाह की ख़ास मुहर से ऐलान: शहर में इंसाफ़ की अदालतें बन गई हैं, और सिपाहियों को हर तरह की ज़ोर-ज़बरदस्ती मना है।',
    },
    checks: { en: ['courts of justice are set up'], hi: ['इंसाफ़ की अदालतें बन गई हैं'] },
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
      en: 'By beat of drum, by order of General Bakht Khan: every shopkeeper must keep arms, and plunderers will be punished.',
      hi: 'ढोल पीटकर ऐलान, जनरल बख़्त ख़ान के हुक्म से: हर दुकानदार हथियार रखे, और लुटेरों को सज़ा मिलेगी।',
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

  // ── The first Sunday, 17 May ──
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
    id: 'missives-real',
    tier: 3,
    real: true,
    pair: 'patiala',
    from: { en: "Note for the King's office", hi: 'बादशाह के दफ़्तर के लिए नोट' },
    to: MUNSHI,
    text: {
      en: "On Sunday 17 May riders carried the King's letters to the rajas of Patiala, Jaipur, Alwar, Jodhpur, Kotah and Bundi.",
      hi: 'रविवार 17 मई को सवार बादशाह की चिट्ठियाँ पटियाला, जयपुर, अलवर, जोधपुर, कोटा और बूँदी के राजाओं के पास ले गए।',
    },
    checks: { en: ["the King's letters to the rajas of Patiala"], hi: ['बादशाह की चिट्ठियाँ पटियाला'] },
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
    from: COURT_NEWS,
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

  // ── Famous moments of 1857, for players who know the year ──
  {
    id: 'pandey-real',
    tier: 3,
    real: true,
    pair: 'pandey',
    from: SENIOR,
    to: NEW_MUNSHI,
    text: {
      en: 'Mangal Pandey of the 34th was hanged at Barrackpore on 8 April. A month later, on 10 May, Meerut rose.',
      hi: '34वीं पलटन के मंगल पांडे को 8 अप्रैल को बैरकपुर में फाँसी दी गई। महीने भर बाद, 10 मई को, मेरठ उठ खड़ा हुआ।',
    },
    checks: { en: ['hanged at Barrackpore on 8 April'], hi: ['बैरकपुर में फाँसी'] },
    why: {
      text: {
        en: 'True: Mangal Pandey attacked his officers at Barrackpore on 29 March; hanged 8 April.',
        hi: 'सच: मंगल पांडे ने 29 मार्च को बैरकपुर में अफ़सरों पर हमला किया; 8 अप्रैल को फाँसी हुई।',
      },
      sources: [...PANDEY, sen('pp.58-60')],
    },
  },
  {
    id: 'pandey-forged',
    tier: 3,
    real: false,
    pair: 'pandey',
    from: SENIOR,
    to: NEW_MUNSHI,
    text: {
      en: 'Mangal Pandey of the 34th was hanged at Meerut on 8 April. A month later, on 10 May, Meerut rose.',
      hi: '34वीं पलटन के मंगल पांडे को 8 अप्रैल को मेरठ में फाँसी दी गई। महीने भर बाद, 10 मई को, मेरठ उठ खड़ा हुआ।',
    },
    checks: { en: ['hanged at Meerut on 8 April'], hi: ['मेरठ में फाँसी'] },
    tells: [
      {
        kind: 'place',
        explain: {
          en: 'Mangal Pandey was hanged at Barrackpore, not Meerut; Meerut rose a month later.',
          hi: 'मंगल पांडे को बैरकपुर में फाँसी हुई, मेरठ में नहीं; मेरठ महीने भर बाद उठा।',
        },
        sources: PANDEY,
      },
    ],
  },
  {
    id: 'rani-forged',
    tier: 3,
    real: false,
    from: NEWSWRITER,
    to: OFFICE,
    text: {
      en: "News from Jhansi: the Rani has beaten the English, and the bazaars already sing 'Khoob ladi mardani, woh to Jhansi wali Rani thi'.",
      hi: "झाँसी से ख़बर: रानी ने अंग्रेज़ों को हरा दिया, और बाज़ारों में अभी से गाया जा रहा है: 'ख़ूब लड़ी मर्दानी, वह तो झाँसी वाली रानी थी'।",
    },
    checks: { en: ['Khoob ladi mardani'], hi: ['ख़ूब लड़ी मर्दानी'] },
    tells: [
      {
        kind: 'anachronism',
        explain: {
          en: "That line is Subhadra Kumari Chauhan's, printed in 1930. Jhansi rose in June.",
          hi: 'यह पंक्ति सुभद्रा कुमारी चौहान की है, 1930 में छपी। झाँसी जून में उठी।',
        },
        sources: [
          { id: 'sudha-chauhan-1981', loc: 'jacket blurb (1904-1948); p.33 (Mukul, 1930)' },
          { id: 'chauhan-1930', loc: "'Jhansi ki Rani'" },
          sen('p.271'),
        ],
      },
    ],
  },
]

export const messages: Message[] = [...eventMessages, ...datelessMessages]
