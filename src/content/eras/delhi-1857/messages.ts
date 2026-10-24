import type { Message } from '../../types.js'
import {
  caveBrowne,
  CHATTA,
  CHUNI_17,
  CHUNI_18,
  CHUNI_19_20,
  fanshawe,
  hodson,
  jl,
  JATMALL_CHAPATI,
  KING_ORDER,
  majumdar,
  METCALFE_CHAPATI,
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
// hanging on 8 April (Cave-Browne I p.21; Kaye I, 9th ed., p.548).
const PANDEY = [sen('pp.49-50'), majumdar('pp.46-47'), caveBrowne('p.21'), { id: 'kaye-1880', loc: 'p.548' }]
// Nana Sahib guarded the Kanpur treasury for the English in May (Sen pp.131-33); Kanpur rose
// late on 4 June (Sen p.136). nana-forged is false on every day of the window.
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
    checks: { en: ['Monday, 18th May 1857', 'Mirza Mughal', 'Commander-in-Chief'], hi: ['सोमवार, 18 मई 1857', 'मिर्ज़ा मुग़ल', 'कमांडर-इन-चीफ़'] },
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
    checks: { en: ['Monday, 18th May 1857', 'Mirza Jawan Bakht', 'Commander-in-Chief'], hi: ['सोमवार, 18 मई 1857', 'मिर्ज़ा जवाँ बख़्त', 'कमांडर-इन-चीफ़'] },
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
      hi: "19 मई। सोने के नए सिक्कों (मोहरों) पर लिखा है: 'हिंद के बादशाह ने चाँदी और सोने का सिक्का चलाया… बादशाह सिराजुद्दीन, बहादुर।'",
    },
    checks: { en: ['19th May', 'coins', 'Suraj-u-din'], hi: ['19 मई', 'सिक्कों', 'सिराजुद्दीन'] },
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
      hi: "19 मई। सोने के नए सिक्कों (मोहरों) पर लिखा है: 'हिंद के बादशाह ने चाँदी और सोने का सिक्का चलाया… बादशाह अबू बक्र, बहादुर।'",
    },
    checks: { en: ['19th May', 'coins', 'Abu Bakr'], hi: ['19 मई', 'सिक्कों', 'अबू बक्र'] },
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

  // ── Day 4, Wed 20 May: Mirza Mughal ordered towards Meerut ──
  {
    id: 'ev-march',
    tier: 2,
    real: true,
    onDay: 4,
    from: { en: 'Darbar record', hi: 'दरबार की डायरी' },
    to: OFFICE,
    text: {
      en: 'Wednesday, 20th May. To rid the city of looting soldiers, Mirza Mughal is ordered to march with a strong force towards Meerut.',
      hi: 'बुधवार, 20 मई। शहर को लूटपाट करने वाले सिपाहियों से छुटकारा दिलाने के लिए मिर्ज़ा मुग़ल को बड़ी फ़ौज लेकर मेरठ की ओर कूच का हुक्म मिला है।',
    },
    checks: { en: ['Wednesday, 20th May', 'Mirza Mughal', 'towards Meerut'], hi: ['बुधवार, 20 मई', 'मिर्ज़ा मुग़ल', 'मेरठ की ओर'] },
    why: {
      text: {
        en: "Jiwan Lal, 20 May: Ahsanullah's way to get the soldiers out of the city.",
        hi: 'जीवन लाल, 20 मई: सिपाहियों को शहर से बाहर भेजने की अहसनुल्लाह की तरकीब।',
      },
      sources: [jl('pp.98-99')],
    },
  },

  // ── Day 5, Thu 21 May: Ballabhgarh's raja holds the road south ──
  {
    id: 'ev-palwal',
    tier: 1,
    real: true,
    onDay: 5,
    minMode: 'medium',
    from: COURT_NEWS,
    to: OFFICE,
    text: {
      en: 'Thursday, 21st May. News: Raja Nahar Singh of Ballabhgarh has made himself master of the country as far as Palwal.',
      hi: 'गुरुवार, 21 मई। ख़बर: बल्लभगढ़ के राजा नाहर सिंह ने पलवल तक के इलाक़े पर क़ब्ज़ा कर लिया है।',
    },
    checks: { en: ['Thursday, 21st May', 'Raja Nahar Singh of Ballabhgarh', 'as far as Palwal'], hi: ['गुरुवार, 21 मई', 'बल्लभगढ़ के राजा नाहर सिंह', 'पलवल तक'] },
    why: {
      text: {
        en: 'Jiwan Lal, Thursday 21 May, says just this of Ballabhgarh.',
        hi: 'जीवन लाल, गुरुवार 21 मई, बल्लभगढ़ के बारे में ठीक यही लिखते हैं।',
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
    checks: { en: ['coming into court', 'wearing caps instead of turbans'], hi: ['दरबार में', 'पगड़ी की जगह टोपी लगाकर'] },
    verify: { 'coming into court': 'rule:court-manners', 'wearing caps instead of turbans': 'rule:court-manners' },
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
    checks: { en: ['We are well pleased', 'come to court in caps'], hi: ['हम ख़ुश हैं', 'टोपी पहनकर दरबार में'] },
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
    checks: { en: ['This is Sunday', 'new moon', 'Nahar Singh, Chief of Ballabhgarh'], hi: ['आज रविवार है', 'ईद का नया चाँद', 'बल्लभगढ़ के सरदार'] },
    verify: { 'new moon': 'rule:weekdays' },
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
    checks: { en: ['This is Monday', 'new moon', 'Nahar Singh, Chief of Ballabhgarh'], hi: ['आज सोमवार है', 'ईद का नया चाँद', 'बल्लभगढ़ के सरदार'] },
    verify: { 'new moon': 'rule:weekdays' },
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

  // ── Day 9, Mon 25 May: a festival day, and a false alarm ──
  {
    id: 'ev-eid-real',
    tier: 1,
    real: true,
    pair: 'ev-eid',
    onDay: 9,
    from: COURT_NEWS,
    to: OFFICE,
    text: {
      en: 'Eid, Monday 25 May. A camel rider from Ballabhgarh cried that the English were coming. He had mistaken a festival procession for their army.',
      hi: 'ईद, सोमवार 25 मई। बल्लभगढ़ से एक ऊँट-सवार चिल्लाया कि अंग्रेज़ आ रहे हैं। उसने त्योहार के जुलूस को अंग्रेज़ी फ़ौज समझ लिया था।',
    },
    checks: { en: ['Eid, Monday 25 May', 'camel rider from Ballabhgarh', 'mistaken a festival procession'], hi: ['ईद, सोमवार 25 मई', 'बल्लभगढ़ से एक ऊँट-सवार', 'त्योहार के जुलूस को अंग्रेज़ी फ़ौज समझ'] },
    verify: { 'mistaken a festival procession': 'rule:weekdays' },
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
      en: 'Eid was yesterday, Sunday. A camel rider from Ballabhgarh cried that the English were coming. They are at the gates: let the King flee tonight.',
      hi: 'ईद कल, रविवार को थी। बल्लभगढ़ से एक ऊँट-सवार चिल्लाया कि अंग्रेज़ आ रहे हैं। वे दरवाज़ों पर हैं: बादशाह आज रात निकल जाएँ।',
    },
    checks: { en: ['Eid was yesterday, Sunday', 'camel rider from Ballabhgarh', 'let the King flee tonight'], hi: ['ईद कल, रविवार को थी', 'बल्लभगढ़ से एक ऊँट-सवार', 'बादशाह आज रात निकल जाएँ'] },
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
    checks: { en: ['26th May', 'Hakim Ahsanullah Khan', 'the King shields him'], hi: ['26 मई', 'हकीम अहसनुल्लाह ख़ान', 'बादशाह उन्हें बचा रहे हैं'] },
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
    checks: { en: ['26th May', 'Gate guards found the proof', 'Lieutenant-Governor at Lahore'], hi: ['26 मई', 'पहरेदारों को दरवाज़े पर सबूत मिला', 'लाहौर के लेफ़्टिनेंट-गवर्नर'] },
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
    checks: { en: ['John Lawrence', 'Chief Commissioner of the Punjab'], hi: ['जॉन लॉरेंस', 'पंजाब के चीफ़ कमिश्नर'] },
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
    checks: { en: ['Lieutenant-Governor of the Punjab', 'He has confessed everything'], hi: ['पंजाब के लेफ़्टिनेंट-गवर्नर', 'सब क़बूल कर लिया है'] },
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
    checks: { en: ['Mirza Abu Bakr', 'boasts to the King'], hi: ['मिर्ज़ा अबू बक्र', 'बादशाह के सामने'] },
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
      en: 'Shelter of the World! We are the horsemen of the 3rd Light Cavalry. On Sunday 10 May we freed our jailed brothers at Meerut and rode to you.',
      hi: 'जहाँपनाह! हम तीसरी घुड़सवार पलटन के सवार हैं। रविवार 10 मई को हमने मेरठ में अपने क़ैदी भाइयों को छुड़ाया और आपके पास आए।',
    },
    checks: { en: ['3rd Light Cavalry', 'Sunday 10 May', 'at Meerut'], hi: ['तीसरी घुड़सवार पलटन', 'रविवार 10 मई', 'मेरठ में'] },
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
      en: 'Shelter of the World! We are the horsemen of the 4th Light Cavalry. On Sunday 10 May we freed our jailed brothers at Meerut and rode to you.',
      hi: 'जहाँपनाह! हम चौथी घुड़सवार पलटन के सवार हैं। रविवार 10 मई को हमने मेरठ में अपने क़ैदी भाइयों को छुड़ाया और आपके पास आए।',
    },
    checks: { en: ['4th Light Cavalry', 'Sunday 10 May', 'at Meerut'], hi: ['चौथी घुड़सवार पलटन', 'रविवार 10 मई', 'मेरठ में'] },
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
    checks: { en: ['Mirza Mughal', '20th Native Infantry'], hi: ['मिर्ज़ा मुग़ल', '20वीं पैदल पलटन'] },
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
    checks: { en: ['Mirza Mughal', '37th Native Infantry'], hi: ['मिर्ज़ा मुग़ल', '37वीं पैदल पलटन'] },
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
    verify: { '3 rupees 8 annas': 'fact:money' },
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
    checks: { en: ["By the King's order", '30 rupees a month', 'every horseman 50'], hi: ['बादशाह के हुक्म से', '30 रुपये महीना', 'हर सवार को 50'] },
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
    checks: { en: ["By the King's order", '50 rupees a month', 'every horseman 30'], hi: ['बादशाह के हुक्म से', '50 रुपये महीना', 'हर सवार को 30'] },
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
    checks: { en: ['carts coming from Ballabhgarh', 'the Delhi Gate'], hi: ['बल्लभगढ़ से आने वाली गाड़ियाँ', 'दिल्ली दरवाज़े'] },
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
    checks: { en: ['carts coming from Ballabhgarh', 'the Kashmiri Gate'], hi: ['बल्लभगढ़ से आने वाली गाड़ियाँ', 'कश्मीरी दरवाज़े'] },
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
    verify: { 'western end of the road': 'fact:lahore-gates' },
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
    verify: { 'western end of the road': 'fact:lahore-gates' },
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
    checks: { en: ['The King wrote in pencil', 'Mirza Mughal'], hi: ['बादशाह ने पेंसिल से लिखा', 'मिर्ज़ा मुग़ल'] },
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
    from: { en: 'The Kotwal', hi: 'कोतवाल' },
    to: KING,
    text: {
      en: 'Shelter of the World! Soldiers plunder houses on the false plea that Europeans hide there. Petition of the Kotwal, under his seal.',
      hi: 'जहाँपनाह! सिपाही यह झूठा बहाना बनाकर घर लूटते हैं कि वहाँ यूरोपियन छिपे हैं। अर्ज़ी: कोतवाल, अपनी मुहर के साथ।',
    },
    checks: { en: ['Petition of the Kotwal', 'under his seal'], hi: ['अर्ज़ी: कोतवाल', 'अपनी मुहर के साथ'] },
    verify: { 'Petition of the Kotwal': 'rule:petition-form', 'under his seal': 'rule:petition-form' },
    why: {
      text: {
        en: 'Written for the game: the plunder plea is documented; a Kotwal sealed his petitions.',
        hi: 'खेल के लिए लिखा गया: लूट का यह बहाना दर्ज है; कोतवाल अर्ज़ी पर मुहर लगाता था।',
      },
      sources: [trial(CHUNI_19_20), trial(KING_ORDER), mh('p.58'), jl('p.92')],
    },
  },
  {
    id: 'kotwal-forged',
    tier: 2,
    real: false,
    pair: 'kotwal',
    from: { en: 'The Kotwal', hi: 'कोतवाल' },
    to: KING,
    text: {
      en: 'Shelter of the World! Soldiers plunder houses on the false plea that Europeans hide there. I have the honour to be, Sir, your most obedient servant, the Kotwal.',
      hi: 'जहाँपनाह! सिपाही यह झूठा बहाना बनाकर घर लूटते हैं कि वहाँ यूरोपियन छिपे हैं। आई हैव द ऑनर टू बी, सर, योर मोस्ट ओबीडिएंट सर्वेंट, कोतवाल।',
    },
    checks: { en: ['I have the honour to be, Sir', 'your most obedient servant'], hi: ['आई हैव द ऑनर टू बी, सर', 'मोस्ट ओबीडिएंट सर्वेंट'] },
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
    verify: { 'Report for': 'calendar' },
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
    verify: { 'Report for': 'calendar' },
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
    checks: { en: ['It is reported', 'coming from Ambala', 'Nothing more is known'], hi: ['ख़बर है', 'अंबाला से आ रही हैं', 'पक्का कुछ और पता नहीं'] },
    verify: { 'It is reported': 'rule:persian-bait', 'Nothing more is known': 'rule:persian-bait' },
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
    checks: { en: ['It is certain', 'a Persian army of 50,000', 'crossed the Attock'], hi: ['यह पक्की ख़बर है', '50,000 की ईरानी फ़ौज', 'अटक पार कर चुकी है'] },
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
    checks: { en: ['hold the Ridge', 'Kashmiri Gate', "Hindu Rao's house"], hi: ['रिज (पहाड़ी) पर जमे हैं', 'कश्मीरी दरवाज़े', 'हिंदू राव के मकान'] },
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
      en: '(In English.) The 3rd Light Cavalry and the 11th and 20th Native Infantry rose at Meerut on Sunday the 10th. Lord Canning, the Governor-General, must be told.',
      hi: '(अंग्रेज़ी में) तीसरी घुड़सवार पलटन और 11वीं व 20वीं पैदल पलटनें 10 तारीख़, रविवार को मेरठ में उठ खड़ी हुईं। गवर्नर-जनरल लॉर्ड कैनिंग को ख़बर दी जाए।',
    },
    checks: { en: ['3rd Light Cavalry', 'Sunday the 10th', 'the Governor-General'], hi: ['तीसरी घुड़सवार पलटन', '10 तारीख़, रविवार', 'गवर्नर-जनरल लॉर्ड कैनिंग'] },
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
    checks: { en: ['3rd Light Cavalry', 'Sunday the 10th', 'The Viceroy, Lord Canning'], hi: ['तीसरी घुड़सवार पलटन', '10 तारीख़, रविवार', 'वायसराय लॉर्ड कैनिंग'] },
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
    checks: { en: ["the King's special seal"], hi: ['बादशाह की ख़ास मुहर'] },
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
    checks: { en: ['General Bakht Khan'], hi: ['जनरल बख़्त ख़ान'] },
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
      en: 'On Sunday 17 May two companies of foot and a troop of horse were sent out to rescue a treasure attacked on its way to Delhi.',
      hi: 'रविवार 17 मई को पैदल फ़ौज की दो कंपनियाँ और घुड़सवारों का एक दस्ता दिल्ली आते एक ख़ज़ाने को बचाने भेजा गया, जिस पर हमला हुआ था।',
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
      en: 'On Monday 17 May two companies of foot and a troop of horse were sent out to rescue a treasure attacked on its way to Delhi.',
      hi: 'सोमवार 17 मई को पैदल फ़ौज की दो कंपनियाँ और घुड़सवारों का एक दस्ता दिल्ली आते एक ख़ज़ाने को बचाने भेजा गया, जिस पर हमला हुआ था।',
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
    minMode: 'medium',
    pair: 'patiala',
    from: { en: "Note for the King's office", hi: 'बादशाह के दफ़्तर के लिए नोट' },
    to: MUNSHI,
    text: {
      en: "On Sunday 17 May riders carried the King's letters to the rajas of Patiala, Jaipur, Alwar, Jodhpur, Kotah and Bundi.",
      hi: 'रविवार 17 मई को सवार बादशाह की चिट्ठियाँ पटियाला, जयपुर, अलवर, जोधपुर, कोटा और बूँदी के राजाओं के पास ले गए।',
    },
    checks: { en: ['On Sunday 17 May', "the King's letters", 'rajas of Patiala'], hi: ['रविवार 17 मई को', 'बादशाह की चिट्ठियाँ', 'पटियाला'] },
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
    minMode: 'medium',
    pair: 'patiala',
    from: COURT_NEWS,
    to: OFFICE,
    text: {
      en: 'Good news: the Maharaja of Patiala has come to Delhi in person with his army to fight for the King.',
      hi: 'ख़ुशख़बरी: पटियाला के महाराजा ख़ुद अपनी फ़ौज लेकर दिल्ली आ गए हैं, बादशाह के लिए लड़ने।',
    },
    checks: { en: ['Maharaja of Patiala', 'come to Delhi in person', 'to fight for the King'], hi: ['पटियाला के महाराजा', 'ख़ुद अपनी फ़ौज लेकर दिल्ली आ गए हैं', 'बादशाह के लिए लड़ने'] },
    tells: [
      {
        kind: 'knowledge',
        factId: 'patiala-side',
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
    minMode: 'medium',
    pair: 'pandey',
    from: SENIOR,
    to: NEW_MUNSHI,
    text: {
      en: 'Mangal Pandey of the 34th was hanged at Barrackpore on 8 April. A month later, on 10 May, Meerut rose.',
      hi: '34वीं पलटन के मंगल पांडे को 8 अप्रैल को बैरकपुर में फाँसी दी गई। महीने भर बाद, 10 मई को, मेरठ उठ खड़ा हुआ।',
    },
    checks: { en: ['Mangal Pandey of the 34th', 'at Barrackpore', 'on 8 April'], hi: ['34वीं पलटन के मंगल पांडे', 'बैरकपुर में फाँसी', '8 अप्रैल को'] },
    why: {
      text: {
        en: 'Many books say 29 March: that was his attack. He was hanged 8 April.',
        hi: 'कई किताबें 29 मार्च बताती हैं: उस दिन उन्होंने हमला किया था। फाँसी 8 अप्रैल को हुई।',
      },
      sources: [...PANDEY, sen('pp.58-60')],
    },
  },
  {
    id: 'pandey-forged',
    tier: 3,
    real: false,
    minMode: 'medium',
    pair: 'pandey',
    from: SENIOR,
    to: NEW_MUNSHI,
    text: {
      en: 'Mangal Pandey of the 34th was hanged at Meerut on 8 April. A month later, on 10 May, Meerut rose.',
      hi: '34वीं पलटन के मंगल पांडे को 8 अप्रैल को मेरठ में फाँसी दी गई। महीने भर बाद, 10 मई को, मेरठ उठ खड़ा हुआ।',
    },
    checks: { en: ['Mangal Pandey of the 34th', 'at Meerut', 'on 8 April'], hi: ['34वीं पलटन के मंगल पांडे', 'मेरठ में फाँसी', '8 अप्रैल को'] },
    tells: [
      {
        kind: 'place',
        factId: 'pandey',
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
    minMode: 'medium',
    pair: 'rani',
    from: NEWSWRITER,
    to: OFFICE,
    text: {
      en: "News from Jhansi: the Rani has beaten the English, and the bazaars already sing 'Khoob ladi mardani, woh to Jhansi wali Rani thi'.",
      hi: "झाँसी से ख़बर: रानी ने अंग्रेज़ों को हरा दिया, और बाज़ारों में अभी से गाया जा रहा है: 'ख़ूब लड़ी मर्दानी, वह तो झाँसी वाली रानी थी'।",
    },
    checks: { en: ['has beaten the English', 'Khoob ladi mardani'], hi: ['अंग्रेज़ों को हरा दिया', 'ख़ूब लड़ी मर्दानी'] },
    tells: [
      {
        kind: 'anachronism',
        explain: {
          en: "That line is Subhadra Kumari Chauhan's (born 1904), collected in her Mukul in 1930.",
          hi: "यह पंक्ति सुभद्रा कुमारी चौहान (जन्म 1904) की है, जो 1930 में उनके 'मुकुल' संग्रह में आई।",
        },
        sources: [
          { id: 'sudha-chauhan-1981', loc: 'jacket (1904-1948); p.33 (Mukul collected 1930)' },
          { id: 'chauhan-1930', loc: "first-edition preface dated 13 Nov 1930; 'Jhansi ki Rani'" },
        ],
      },
      {
        kind: 'knowledge',
        factId: 'kanpur-jhansi',
        explain: { en: 'And Jhansi rose in June, not May.', hi: 'और झाँसी जून में उठी, मई में नहीं।' },
        sources: [sen('p.271')],
      },
    ],
  },

  // nana-forged: dateless and unpaired (false on any day of the window).
  {
    id: 'nana-forged',
    tier: 3,
    real: false,
    minMode: 'medium',
    from: NEWSWRITER,
    to: OFFICE,
    text: {
      en: 'News from Kanpur: Nana Sahib of Bithur has risen against the English and besieges them in their camp there.',
      hi: 'कानपुर से ख़बर: बिठूर के नाना साहब अंग्रेज़ों के ख़िलाफ़ उठ खड़े हुए हैं और उन्हें उनकी छावनी में घेर रखा है।',
    },
    checks: { en: ['Nana Sahib of Bithur', 'has risen against the English'], hi: ['बिठूर के नाना साहब', 'उठ खड़े हुए हैं'] },
    tells: [
      {
        kind: 'knowledge',
        factId: 'kanpur-jhansi',
        explain: {
          en: "Kanpur rose on 4 June; till then Nana Sahib even guarded the Company's treasury.",
          hi: 'कानपुर 4 जून को ही उठा; तब तक नाना साहब कंपनी का ख़ज़ाना तक सँभालते थे।',
        },
        sources: NANA,
      },
    ],
  },

  // ── Where were they in May 1857? (docs/research/people-and-moments.md, 1A and 1C) ──
  {
    id: 'zinat-real',
    tier: 2,
    real: true,
    minMode: 'medium',
    pair: 'zinat',
    from: COURT_NEWS,
    to: OFFICE,
    text: {
      en: 'Sunday 17 May. The King told the soldiers to trust his physician Ahsanullah Khan, Mahbub Ali Khan and Queen Zinat Mahal.',
      hi: 'रविवार 17 मई। बादशाह ने सिपाहियों से कहा कि वे उनके हकीम अहसनुल्लाह ख़ान, महबूब अली ख़ान और मलिका ज़ीनत महल पर भरोसा रखें।',
    },
    checks: { en: ['Sunday 17 May', 'Ahsanullah Khan', 'Queen Zinat Mahal'], hi: ['रविवार 17 मई', 'हकीम अहसनुल्लाह ख़ान', 'मलिका ज़ीनत महल'] },
    why: {
      text: {
        en: 'Chuni Lal, 17 May: the King vouched for Ahsanullah, Mahbub Ali and his queen.',
        hi: 'चुन्नी लाल, 17 मई: बादशाह ने अहसनुल्लाह, महबूब अली और अपनी मलिका की ज़मानत दी।',
      },
      sources: [trial(CHUNI_17)],
    },
  },
  {
    id: 'zinat-forged',
    tier: 3,
    real: false,
    minMode: 'medium',
    pair: 'zinat',
    from: COURT_NEWS,
    to: OFFICE,
    text: {
      en: 'Sunday 17 May. The King told the soldiers to trust his physician Ahsanullah Khan, Mahbub Ali Khan and Queen Hazrat Mahal.',
      hi: 'रविवार 17 मई। बादशाह ने सिपाहियों से कहा कि वे उनके हकीम अहसनुल्लाह ख़ान, महबूब अली ख़ान और मलिका हज़रत महल पर भरोसा रखें।',
    },
    checks: { en: ['Sunday 17 May', 'Ahsanullah Khan', 'Queen Hazrat Mahal'], hi: ['रविवार 17 मई', 'हकीम अहसनुल्लाह ख़ान', 'मलिका हज़रत महल'] },
    tells: [
      {
        kind: 'name',
        factId: 'zinat-mahal',
        explain: {
          en: "Zafar's queen was Zinat Mahal; Hazrat Mahal was a Begum of Awadh, at Lucknow.",
          hi: 'ज़फ़र की मलिका ज़ीनत महल थीं; हज़रत महल अवध की बेगम थीं, लखनऊ में।',
        },
        sources: [trial(CHUNI_17), sen('pp.209-10')],
      },
    ],
  },

  // ── Two views Nehru repeated (Glimpses pp.414-15, 4th ed.; Discovery p.384); Sen and Majumdar give the record ──
  {
    id: 'rani-girl-forged',
    tier: 3,
    real: false,
    minMode: 'medium',
    pair: 'rani',
    from: NEWSWRITER,
    to: OFFICE,
    text: {
      en: "News from Jhansi: the Rani, 'a girl-widow, twenty years of age', has declared war on the English.",
      hi: "झाँसी से ख़बर: रानी, 'बीस बरस की एक विधवा लड़की', ने अंग्रेज़ों के ख़िलाफ़ जंग छेड़ दी है।",
    },
    checks: { en: ['a girl-widow, twenty years of age', 'declared war on the English'], hi: ['बीस बरस की एक विधवा लड़की', 'जंग छेड़ दी है'] },
    tells: [
      {
        kind: 'knowledge',
        factId: 'kanpur-jhansi',
        explain: { en: 'Jhansi was quiet in May; its sepoys rose only on 5 June.', hi: 'मई में झाँसी शांत थी; वहाँ के सिपाही 5 जून को ही उठे।' },
        sources: [sen('p.271')],
      },
      {
        kind: 'anachronism',
        explain: {
          en: "Those words are Nehru's, from the 1930s; Sen says her birth date is unknown.",
          hi: 'ये शब्द 1930 के दशक में नेहरू ने लिखे; सेन कहते हैं उनकी जन्म-तारीख़ पता नहीं।',
        },
        sources: [
          { id: 'nehru-1934', loc: 'p.415 (4th ed., 1949)' },
          { id: 'nehru-1946', loc: 'p.384' },
          sen('pp.269-70'),
        ],
      },
    ],
  },
]

// ── Medium and Hard (owner 10-24): more real moments of the fortnight, on their true days ──
// Every dated line below was read in Jiwan Lal's diary for that day (Metcalfe 1898, JL pp.95-108),
// or in Sen, Mainodin and Hodson's letters, as cited. Medium walks days 1-10 (17-26 May); Hard all 14.
const MED = 'medium' as const
const HARD = 'hard' as const
const TREASURY = { en: 'Treasury report', hi: 'ख़ज़ाने की रिपोर्ट' }

const mediumMessages: Message[] = [
  // ── Day 2, Mon 18 May: four princes in command (JL p.96) ──
  {
    id: 'ev-princes-real',
    tier: 1,
    real: true,
    pair: 'ev-princes',
    onDay: 2,
    minMode: MED,
    from: COURT_NEWS,
    to: OFFICE,
    text: {
      en: 'Monday, 18th May. The chief command goes to four princes: Mirza Mughal, Mirza Khizr Sultan, Mirza Abu Bakr and Mirza Abdullah.',
      hi: 'सोमवार, 18 मई। फ़ौज की बड़ी कमान चार शहज़ादों को मिली: मिर्ज़ा मुग़ल, मिर्ज़ा ख़िज़्र सुल्तान, मिर्ज़ा अबू बक्र और मिर्ज़ा अब्दुल्लाह।',
    },
    checks: { en: ['Monday, 18th May', 'Mirza Khizr Sultan', 'Mirza Abu Bakr'], hi: ['सोमवार, 18 मई', 'मिर्ज़ा ख़िज़्र सुल्तान', 'मिर्ज़ा अबू बक्र'] },
    why: {
      text: {
        en: 'Jiwan Lal, Monday 18 May, names exactly these four princes.',
        hi: 'जीवन लाल, सोमवार 18 मई: ठीक यही चार शहज़ादे।',
      },
      sources: [jl('p.96'), sen('p.74')],
    },
  },
  {
    id: 'ev-princes-forged',
    tier: 1,
    real: false,
    pair: 'ev-princes',
    onDay: 2,
    minMode: MED,
    from: COURT_NEWS,
    to: OFFICE,
    text: {
      en: 'Monday, 18th May. The chief command goes to four princes: Mirza Mughal, Mirza Khizr Sultan, Mirza Jawan Bakht and Mirza Abdullah.',
      hi: 'सोमवार, 18 मई। फ़ौज की बड़ी कमान चार शहज़ादों को मिली: मिर्ज़ा मुग़ल, मिर्ज़ा ख़िज़्र सुल्तान, मिर्ज़ा जवाँ बख़्त और मिर्ज़ा अब्दुल्लाह।',
    },
    checks: { en: ['Monday, 18th May', 'Mirza Khizr Sultan', 'Mirza Jawan Bakht'], hi: ['सोमवार, 18 मई', 'मिर्ज़ा ख़िज़्र सुल्तान', 'मिर्ज़ा जवाँ बख़्त'] },
    tells: [
      {
        kind: 'name',
        factId: 'princes',
        explain: {
          en: 'The fourth was Abu Bakr; Jawan Bakht was made minister next day.',
          hi: 'चौथे अबू बक्र थे; जवाँ बख़्त अगले दिन वज़ीर बनाए गए।',
        },
        sources: [jl('pp.96-97')],
      },
    ],
  },

  // ── Day 3, Tue 19 May: Patiala's brother at the palace (JL p.97) ──
  {
    id: 'ev-ajit-real',
    tier: 1,
    real: true,
    pair: 'ev-ajit',
    onDay: 3,
    minMode: MED,
    from: COURT_NEWS,
    to: OFFICE,
    text: {
      en: '19th May. Soldiers seized the brother of the Maharaja of Patiala. The King received him kindly: the brothers are on bad terms, he said.',
      hi: '19 मई। सिपाहियों ने पटियाला के महाराजा के भाई को पकड़ लिया। बादशाह उनसे प्यार से मिले, और बोले कि दोनों भाइयों में अनबन है।',
    },
    checks: { en: ['19th May', 'Maharaja of Patiala'], hi: ['19 मई', 'पटियाला के महाराजा'] },
    why: {
      text: {
        en: "Jiwan Lal, 19 May: the King shielded Patiala's estranged brother.",
        hi: 'जीवन लाल, 19 मई: बादशाह ने पटियाला के रूठे भाई को बचाया।',
      },
      sources: [jl('p.97')],
    },
  },
  {
    id: 'ev-ajit-forged',
    tier: 1,
    real: false,
    pair: 'ev-ajit',
    onDay: 3,
    minMode: MED,
    from: COURT_NEWS,
    to: OFFICE,
    text: {
      en: "19th May. The brother of the Maharaja of Patiala brought the King good news: the Maharaja's army is marching to join us.",
      hi: '19 मई। पटियाला के महाराजा के भाई बादशाह के लिए ख़ुशख़बरी लाए: महाराजा की फ़ौज हमसे मिलने आ रही है।',
    },
    checks: { en: ['Maharaja of Patiala', 'marching to join us'], hi: ['पटियाला के महाराजा', 'हमसे मिलने आ रही है'] },
    tells: [
      {
        kind: 'knowledge',
        factId: 'patiala-side',
        explain: {
          en: 'That very day came news that Patiala had joined the English.',
          hi: 'उसी दिन ख़बर आई कि पटियाला अंग्रेज़ों से जा मिला है।',
        },
        sources: [jl('p.97'), caveBrowne('p.190')],
      },
    ],
  },

  // ── Day 4, Wed 20 May: a false alarm, and scouts stripped on the road (JL p.98) ──
  {
    id: 'ev-scouts-real',
    tier: 2,
    real: true,
    pair: 'ev-scouts',
    onDay: 4,
    minMode: MED,
    from: { en: 'Darbar record', hi: 'दरबार की डायरी' },
    to: OFFICE,
    text: {
      en: 'Wednesday, 20th May. The news of an English force proved false. Our scouts came back stark naked: robbers on the road had stripped them.',
      hi: 'बुधवार, 20 मई। अंग्रेज़ी फ़ौज की ख़बर झूठी निकली। हमारे जासूस बिल्कुल नंगे लौटे: रास्ते के लुटेरों ने उनके कपड़े तक छीन लिए।',
    },
    checks: { en: ['Wednesday, 20th May', 'news of an English force'], hi: ['बुधवार, 20 मई', 'अंग्रेज़ी फ़ौज की ख़बर'] },
    why: {
      text: {
        en: 'Jiwan Lal, Wednesday 20 May: the scouts came back plundered of everything.',
        hi: 'जीवन लाल, बुधवार 20 मई: जासूस सब कुछ लुटाकर लौटे।',
      },
      sources: [jl('p.98')],
    },
  },
  {
    id: 'ev-scouts-forged',
    tier: 2,
    real: false,
    pair: 'ev-scouts',
    onDay: 4,
    minMode: MED,
    from: { en: 'Darbar record', hi: 'दरबार की डायरी' },
    to: OFFICE,
    text: {
      en: 'Thursday, 20th May. The news of an English force proved false. Our scouts came back stark naked: robbers on the road had stripped them.',
      hi: 'गुरुवार, 20 मई। अंग्रेज़ी फ़ौज की ख़बर झूठी निकली। हमारे जासूस बिल्कुल नंगे लौटे: रास्ते के लुटेरों ने उनके कपड़े तक छीन लिए।',
    },
    checks: { en: ['Thursday, 20th May', 'news of an English force'], hi: ['गुरुवार, 20 मई', 'अंग्रेज़ी फ़ौज की ख़बर'] },
    tells: [
      {
        kind: 'weekday',
        ruleId: 'weekdays',
        explain: { en: '20 May 1857 was a Wednesday, not a Thursday.', hi: '20 मई 1857 बुधवार था, गुरुवार नहीं।' },
        sources: [jl('p.98'), trial(CHUNI_17)],
      },
    ],
  },

  // ── Day 5, Thu 21 May: a lakh for the troops (JL p.99) ──
  {
    id: 'ev-lakh-real',
    tier: 1,
    real: true,
    pair: 'ev-lakh',
    onDay: 5,
    minMode: MED,
    from: TREASURY,
    to: OFFICE,
    text: {
      en: "Thursday, 21st May. Under pressure from the King, the new officers and the city bankers have raised one lakh of rupees for the troops' pay.",
      hi: 'गुरुवार, 21 मई। बादशाह के दबाव पर नए अफ़सरों और शहर के साहूकारों ने फ़ौज की तनख़्वाह के लिए एक लाख रुपये जुटाए।',
    },
    checks: { en: ['Thursday, 21st May', 'the city bankers', 'one lakh of rupees'], hi: ['गुरुवार, 21 मई', 'शहर के साहूकारों', 'एक लाख रुपये'] },
    why: {
      text: {
        en: "Jiwan Lal, 21 May: one lakh raised, under the King's pressure.",
        hi: 'जीवन लाल, 21 मई: बादशाह के दबाव पर एक लाख रुपये जुटे।',
      },
      sources: [jl('p.99')],
    },
  },
  {
    id: 'ev-lakh-forged',
    tier: 1,
    real: false,
    pair: 'ev-lakh',
    onDay: 5,
    minMode: MED,
    from: TREASURY,
    to: OFFICE,
    text: {
      en: "Thursday, 21st May. Under pressure from the King, the new officers and the city bankers have raised ten lakh rupees for the troops' pay.",
      hi: 'गुरुवार, 21 मई। बादशाह के दबाव पर नए अफ़सरों और शहर के साहूकारों ने फ़ौज की तनख़्वाह के लिए दस लाख रुपये जुटाए।',
    },
    checks: { en: ['Thursday, 21st May', 'the city bankers', 'ten lakh rupees'], hi: ['गुरुवार, 21 मई', 'शहर के साहूकारों', 'दस लाख रुपये'] },
    tells: [
      {
        kind: 'number',
        factId: 'pay-fund',
        explain: {
          en: 'They raised one lakh, not ten; the bankers already said they were beggared.',
          hi: 'एक लाख जुटे, दस नहीं; साहूकार तो पहले ही ख़ुद को कंगाल बता रहे थे।',
        },
        sources: [jl('p.99'), jl('p.96')],
      },
    ],
  },

  // ── Day 6, Fri 22 May: gold at 32 rupees (JL p.100, reported on the 21st) ──
  {
    id: 'ev-mohur-real',
    tier: 1,
    real: true,
    pair: 'ev-mohur',
    onDay: 6,
    minMode: MED,
    from: NEWSWRITER,
    to: OFFICE,
    text: {
      en: '22nd May. The King was told yesterday that soldiers flush with money are buying gold mohurs at 32 rupees apiece.',
      hi: '22 मई। कल बादशाह को बताया गया कि पैसे से मालामाल सिपाही सोने की मोहरें 32 रुपये फ़ी मोहर ख़रीद रहे हैं।',
    },
    checks: { en: ['22nd May', 'gold mohurs', '32 rupees apiece'], hi: ['22 मई', 'सोने की मोहरें', '32 रुपये फ़ी मोहर'] },
    why: {
      text: {
        en: 'Jiwan Lal, 21 May: the soldiers had money, and wanted gold.',
        hi: 'जीवन लाल, 21 मई: सिपाहियों के पास पैसा था, और उन्हें सोना चाहिए था।',
      },
      sources: [jl('p.100')],
    },
  },
  {
    id: 'ev-mohur-forged',
    tier: 1,
    real: false,
    pair: 'ev-mohur',
    onDay: 6,
    minMode: MED,
    from: NEWSWRITER,
    to: OFFICE,
    text: {
      en: '22nd May. The King was told yesterday that soldiers flush with money are buying gold mohurs at 23 rupees apiece.',
      hi: '22 मई। कल बादशाह को बताया गया कि पैसे से मालामाल सिपाही सोने की मोहरें 23 रुपये फ़ी मोहर ख़रीद रहे हैं।',
    },
    checks: { en: ['22nd May', 'gold mohurs', '23 rupees apiece'], hi: ['22 मई', 'सोने की मोहरें', '23 रुपये फ़ी मोहर'] },
    tells: [
      {
        kind: 'number',
        factId: 'gold-mohur',
        explain: { en: 'That week a gold mohur fetched 32 rupees, not 23.', hi: 'उस हफ़्ते सोने की एक मोहर 32 रुपये की थी, 23 की नहीं।' },
        sources: [jl('p.100')],
      },
    ],
  },

  // ── Day 7, Sat 23 May: a new coinage (JL p.101) ──
  {
    id: 'ev-coinage-real',
    tier: 2,
    real: true,
    pair: 'ev-coinage',
    onDay: 7,
    minMode: MED,
    from: { en: 'Imperial order', hi: 'शाही हुक्म' },
    to: PEOPLE,
    text: {
      en: 'Saturday, 23rd May. On the advice of Ranjit, a jeweller, the old coins are to be called in and a new coinage struck.',
      hi: 'शनिवार, 23 मई। रणजीत नाम के एक जौहरी की सलाह पर पुराने सिक्के वापस लिए जाएँगे और नए सिक्के ढाले जाएँगे।',
    },
    checks: { en: ['Saturday, 23rd May', 'coins'], hi: ['शनिवार, 23 मई', 'सिक्के'] },
    why: {
      text: {
        en: "Jiwan Lal, 23 May: the order followed a jeweller's advice.",
        hi: 'जीवन लाल, 23 मई: यह हुक्म एक जौहरी की सलाह पर निकला।',
      },
      sources: [jl('p.101')],
    },
  },
  {
    id: 'ev-coinage-forged',
    tier: 2,
    real: false,
    pair: 'ev-coinage',
    onDay: 7,
    minMode: MED,
    from: { en: 'Imperial order', hi: 'शाही हुक्म' },
    to: PEOPLE,
    text: {
      en: "Saturday, 23rd May. On the advice of Ranjit, a jeweller, the old coins are called in; new ones bear Mirza Mughal's name.",
      hi: 'शनिवार, 23 मई। रणजीत नाम के एक जौहरी की सलाह पर पुराने सिक्के वापस लिए जाएँगे; नए सिक्कों पर मिर्ज़ा मुग़ल का नाम होगा।',
    },
    checks: { en: ['Saturday, 23rd May', "Mirza Mughal's name"], hi: ['शनिवार, 23 मई', 'मिर्ज़ा मुग़ल का नाम'] },
    tells: [
      {
        kind: 'name',
        factId: 'court',
        explain: {
          en: "Coins bore the King's own name, Siraj-ud-din, never his son's.",
          hi: 'सिक्कों पर बादशाह का अपना नाम सिराजुद्दीन होता था, बेटे का कभी नहीं।',
        },
        sources: [jl('pp.96-97'), jl('p.101')],
      },
    ],
  },

  // ── Day 8, Sun 24 May: flatterers at the audience (JL p.102) ──

  // ── Undated: the palace, the Magazine, Lucknow ──
  {
    id: 'heir-real',
    tier: 2,
    real: true,
    pair: 'heir',
    minMode: MED,
    from: { en: 'Palace news-writer', hi: 'महल का ख़बरनवीस' },
    to: OFFICE,
    text: {
      en: 'Palace talk: Queen Zinat Mahal still hopes that her young son, Mirza Jawan Bakht, will one day follow his father on the throne.',
      hi: 'महल की बातें: मलिका ज़ीनत महल अब भी आस लगाए हैं कि उनका छोटा बेटा, मिर्ज़ा जवाँ बख़्त, एक दिन अपने पिता के बाद तख़्त पर बैठेगा।',
    },
    checks: { en: ['Queen Zinat Mahal', 'her young son', 'Mirza Jawan Bakht'], hi: ['मलिका ज़ीनत महल', 'उनका छोटा बेटा', 'मिर्ज़ा जवाँ बख़्त'] },
    why: {
      text: {
        en: "Sen: the King long pressed for Jawan Bakht, Zinat Mahal's son, as heir.",
        hi: 'सेन: बादशाह बरसों से ज़ीनत महल के बेटे जवाँ बख़्त को वारिस बनाना चाहते थे।',
      },
      sources: [sen('p.69')],
    },
  },
  {
    id: 'heir-forged',
    tier: 2,
    real: false,
    pair: 'heir',
    minMode: MED,
    from: { en: 'Palace news-writer', hi: 'महल का ख़बरनवीस' },
    to: OFFICE,
    text: {
      en: 'Palace talk: Queen Zinat Mahal still hopes that her young son, Mirza Abu Bakr, will one day follow his father on the throne.',
      hi: 'महल की बातें: मलिका ज़ीनत महल अब भी आस लगाए हैं कि उनका छोटा बेटा, मिर्ज़ा अबू बक्र, एक दिन अपने पिता के बाद तख़्त पर बैठेगा।',
    },
    checks: { en: ['Queen Zinat Mahal', 'her young son', 'Mirza Abu Bakr'], hi: ['मलिका ज़ीनत महल', 'उनका छोटा बेटा', 'मिर्ज़ा अबू बक्र'] },
    tells: [
      {
        kind: 'name',
        factId: 'zinat-mahal',
        explain: {
          en: "Zinat Mahal's son was Jawan Bakht; Abu Bakr was the King's grandson.",
          hi: 'ज़ीनत महल के बेटे जवाँ बख़्त थे; अबू बक्र बादशाह के पोते थे।',
        },
        sources: [sen('p.69'), sen('p.85')],
      },
    ],
  },
  {
    id: 'magazine-real',
    tier: 2,
    real: true,
    pair: 'magazine',
    minMode: MED,
    from: SENIOR,
    to: NEW_MUNSHI,
    text: {
      en: "Remember Monday the 11th: when the Magazine was summoned in the King's name, its nine English defenders blew it up rather than give it up.",
      hi: 'सोमवार, 11 तारीख़ याद है: जब बादशाह के नाम पर बारूदख़ाना माँगा गया, तो उसके नौ अंग्रेज़ रखवालों ने उसे सौंपने के बजाय उड़ा दिया।',
    },
    checks: { en: ['Monday the 11th', 'nine English defenders', 'blew it up'], hi: ['सोमवार, 11 तारीख़', 'नौ अंग्रेज़ रखवालों', 'उड़ा दिया'] },
    verify: { 'Monday the 11th': 'fact:meerut', 'blew it up': 'fact:magazine' },
    why: {
      text: {
        en: "Sen: surrender was demanded in the King's name; the nine fired the train.",
        hi: 'सेन: बादशाह के नाम पर समर्पण माँगा गया; नौ ने बारूद में आग लगा दी।',
      },
      sources: [sen('p.73')],
    },
  },
  {
    id: 'magazine-forged',
    tier: 2,
    real: false,
    pair: 'magazine',
    minMode: MED,
    from: SENIOR,
    to: NEW_MUNSHI,
    text: {
      en: "Remember Monday the 11th: when the Magazine was summoned in the King's name, its nine English defenders handed it over, guns and all.",
      hi: 'सोमवार, 11 तारीख़ याद है: जब बादशाह के नाम पर बारूदख़ाना माँगा गया, तो उसके नौ अंग्रेज़ रखवालों ने उसे तोपों समेत सौंप दिया।',
    },
    checks: { en: ['Monday the 11th', 'nine English defenders', 'handed it over'], hi: ['सोमवार, 11 तारीख़', 'नौ अंग्रेज़ रखवालों', 'तोपों समेत सौंप दिया'] },
    verify: { 'Monday the 11th': 'fact:meerut' },
    tells: [
      {
        kind: 'knowledge',
        factId: 'magazine',
        explain: {
          en: 'They never handed it over: the nine blew the Magazine up.',
          hi: 'उन्होंने उसे सौंपा नहीं: नौ ने बारूदख़ाना उड़ा दिया।',
        },
        sources: [sen('p.73')],
      },
    ],
  },
  {
    id: 'lucknow-real',
    tier: 2,
    real: true,
    pair: 'lucknow',
    minMode: MED,
    from: NEWSWRITER,
    to: OFFICE,
    text: {
      en: 'News from Lucknow: Sir Henry Lawrence, Chief Commissioner of Oudh, is making the Residency and the Machchhi Bhawan ready for defence.',
      hi: 'लखनऊ से ख़बर: अवध के चीफ़ कमिश्नर सर हेनरी लॉरेंस रेज़ीडेंसी और मच्छी भवन को बचाव के लिए तैयार कर रहे हैं।',
    },
    checks: { en: ['Sir Henry Lawrence', 'Chief Commissioner of Oudh'], hi: ['सर हेनरी लॉरेंस', 'अवध के चीफ़ कमिश्नर'] },
    why: {
      text: {
        en: 'Sen: after the Meerut news, Henry Lawrence fortified these two places.',
        hi: 'सेन: मेरठ की ख़बर के बाद हेनरी लॉरेंस ने ये दो जगहें मज़बूत कीं।',
      },
      sources: [sen('p.179'), sen('pp.182-83')],
    },
  },
  {
    id: 'lucknow-forged',
    tier: 2,
    real: false,
    pair: 'lucknow',
    minMode: MED,
    from: NEWSWRITER,
    to: OFFICE,
    text: {
      en: 'News from Lucknow: Sir John Lawrence, Chief Commissioner of Oudh, is making the Residency and the Machchhi Bhawan ready for defence.',
      hi: 'लखनऊ से ख़बर: अवध के चीफ़ कमिश्नर सर जॉन लॉरेंस रेज़ीडेंसी और मच्छी भवन को बचाव के लिए तैयार कर रहे हैं।',
    },
    checks: { en: ['Sir John Lawrence', 'Chief Commissioner of Oudh'], hi: ['सर जॉन लॉरेंस', 'अवध के चीफ़ कमिश्नर'] },
    tells: [
      {
        kind: 'name',
        factId: 'lawrences',
        explain: {
          en: 'Oudh had Henry Lawrence; John Lawrence ran the Punjab, from Rawalpindi.',
          hi: 'अवध में हेनरी लॉरेंस थे; जॉन लॉरेंस रावलपिंडी से पंजाब सँभालते थे।',
        },
        sources: [sen('p.179'), sen('p.327')],
      },
    ],
  },
]

const hardMessages: Message[] = [
  // ── Day 1, Sun 17 May: the soldiers "elect" a king (JL p.95) ──
  {
    id: 'ev-abubakr-real',
    tier: 1,
    real: true,
    pair: 'ev-abubakr',
    onDay: 1,
    minMode: HARD,
    from: COURT_NEWS,
    to: OFFICE,
    text: {
      en: "Sunday, 17th May. The soldiers call the old King too infirm and 'elect' his grandson Abu Bakr King in his place. The King scolds them severely.",
      hi: "रविवार, 17 मई। सिपाही बूढ़े बादशाह को बहुत कमज़ोर बताकर उनकी जगह उनके पोते अबू बक्र को बादशाह 'चुन' रहे हैं। बादशाह ने उन्हें सख़्ती से डाँटा।",
    },
    checks: { en: ['Sunday, 17th May', 'grandson Abu Bakr'], hi: ['रविवार, 17 मई', 'पोते अबू बक्र'] },
    why: {
      text: {
        en: "Jiwan Lal, 17 May: they 'elected' Abu Bakr; the King spoke to them severely.",
        hi: "जीवन लाल, 17 मई: उन्होंने अबू बक्र को 'चुना'; बादशाह ने सख़्ती से बात की।",
      },
      sources: [jl('p.95'), sen('p.85')],
    },
  },
  {
    id: 'ev-abubakr-forged',
    tier: 1,
    real: false,
    pair: 'ev-abubakr',
    onDay: 1,
    minMode: HARD,
    from: COURT_NEWS,
    to: OFFICE,
    text: {
      en: "Sunday, 17th May. The soldiers call the old King too infirm and 'elect' his son Mirza Mughal King in his place. The King scolds them severely.",
      hi: "रविवार, 17 मई। सिपाही बूढ़े बादशाह को बहुत कमज़ोर बताकर उनकी जगह उनके बेटे मिर्ज़ा मुग़ल को बादशाह 'चुन' रहे हैं। बादशाह ने उन्हें सख़्ती से डाँटा।",
    },
    checks: { en: ['Sunday, 17th May', 'son Mirza Mughal'], hi: ['रविवार, 17 मई', 'बेटे मिर्ज़ा मुग़ल'] },
    tells: [
      {
        kind: 'name',
        factId: 'abu-bakr-king',
        explain: {
          en: "They 'elected' his grandson Abu Bakr, not Mirza Mughal.",
          hi: "उन्होंने पोते अबू बक्र को 'चुना' था, मिर्ज़ा मुग़ल को नहीं।",
        },
        sources: [jl('p.95')],
      },
    ],
  },

  // ── Day 4, Wed 20 May: General Anson at Ambala (Sen pp.77-78) ──
  {
    id: 'ev-anson-real',
    tier: 2,
    real: true,
    pair: 'ev-anson',
    onDay: 4,
    minMode: HARD,
    from: { en: 'News from Ambala', hi: 'अंबाला से ख़बर' },
    to: OFFICE,
    text: {
      en: 'Wednesday, 20th May. General Anson, the English Commander-in-Chief, is at Ambala gathering carts, stores and guns before he can march on Delhi.',
      hi: 'बुधवार, 20 मई। अंग्रेज़ी कमांडर-इन-चीफ़ जनरल एन्सन अंबाला में हैं, और दिल्ली पर चढ़ाई से पहले गाड़ियाँ, रसद और तोपें जुटा रहे हैं।',
    },
    checks: { en: ['Wednesday, 20th May', 'General Anson', 'at Ambala'], hi: ['बुधवार, 20 मई', 'जनरल एन्सन', 'अंबाला में हैं'] },
    why: {
      text: {
        en: 'Written for the game: Anson reached Ambala on 16 May and gathered transport.',
        hi: 'खेल के लिए लिखा गया: एन्सन 16 मई को अंबाला पहुँचे और सामान जुटाना पड़ा।',
      },
      sources: [sen('p.77'), hodson('p.235')],
    },
  },
  {
    id: 'ev-anson-forged',
    tier: 2,
    real: false,
    pair: 'ev-anson',
    onDay: 4,
    minMode: HARD,
    from: { en: 'News from Ambala', hi: 'अंबाला से ख़बर' },
    to: OFFICE,
    text: {
      en: 'Wednesday, 20th May. General Anson, the English Commander-in-Chief, has died of cholera, and his army will not march on Delhi.',
      hi: 'बुधवार, 20 मई। अंग्रेज़ी कमांडर-इन-चीफ़ जनरल एन्सन हैज़े से मर गए हैं, और उनकी फ़ौज दिल्ली पर चढ़ाई नहीं करेगी।',
    },
    checks: { en: ['Wednesday, 20th May', 'General Anson', 'died of cholera'], hi: ['बुधवार, 20 मई', 'जनरल एन्सन', 'हैज़े से मर गए'] },
    tells: [
      {
        kind: 'date',
        factId: 'anson',
        explain: {
          en: "Anson died of cholera on 27 May, a week after this paper's date.",
          hi: 'एन्सन 27 मई को हैज़े से मरे, इस काग़ज़ की तारीख़ से हफ़्ते भर बाद।',
        },
        sources: [sen('p.78')],
      },
    ],
  },

  // ── Day 8, Sun 24 May: Hodson's ride (Hodson pp.234-36), and Metcalfe alive (JL p.102) ──
  {
    id: 'ev-hodson-real',
    tier: 3,
    real: true,
    pair: 'ev-hodson',
    onDay: 8,
    minMode: HARD,
    from: { en: 'Word from the Karnal road', hi: 'करनाल की सड़क से ख़बर' },
    to: OFFICE,
    text: {
      en: '24th May. An English officer named Hodson rode from Karnal to Meerut with Jind horsemen, and back again, carrying letters.',
      hi: '24 मई। हॉडसन नाम का एक अंग्रेज़ अफ़सर जींद के सवारों के साथ करनाल से मेरठ गया, और चिट्ठियाँ लेकर लौट भी आया।',
    },
    checks: { en: ['named Hodson', 'and back again'], hi: ['हॉडसन नाम का', 'लौट भी आया'] },
    why: {
      text: {
        en: 'Written for the game: Hodson rode to Meerut and back, 20-23 May.',
        hi: 'खेल के लिए लिखा गया: हॉडसन 20-23 मई को मेरठ जाकर लौटा।',
      },
      sources: [hodson('pp.234-36'), sen('p.78')],
    },
  },
  {
    id: 'ev-hodson-forged',
    tier: 3,
    real: false,
    pair: 'ev-hodson',
    onDay: 8,
    minMode: HARD,
    from: { en: 'Word from the Karnal road', hi: 'करनाल की सड़क से ख़बर' },
    to: OFFICE,
    text: {
      en: '24th May. An English officer named Hodson tried to ride from Karnal to Meerut with Jind horsemen, but our men caught him.',
      hi: '24 मई। हॉडसन नाम के एक अंग्रेज़ अफ़सर ने जींद के सवारों के साथ करनाल से मेरठ जाना चाहा, पर हमारे आदमियों ने उसे पकड़ लिया।',
    },
    checks: { en: ['named Hodson', 'our men caught him'], hi: ['हॉडसन नाम के', 'उसे पकड़ लिया'] },
    tells: [
      {
        kind: 'knowledge',
        factId: 'hodson-ride',
        explain: {
          en: 'Hodson got through to Meerut and was back at Karnal by 23 May.',
          hi: 'हॉडसन मेरठ पहुँचा और 23 मई तक करनाल लौट आया।',
        },
        sources: [hodson('pp.234-36')],
      },
    ],
  },

  // ── Day 11, Wed 27 May: Punjabi regiments ask for the King's protection (JL p.103) ──
  {
    id: 'ev-punjabis-real',
    tier: 2,
    real: true,
    pair: 'ev-punjabis',
    onDay: 11,
    minMode: HARD,
    from: COURT_NEWS,
    to: OFFICE,
    text: {
      en: 'Wednesday, 27th May. Two regiments of Punjabis ask the King to protect them, or let them disband. He says he is able and willing to protect them.',
      hi: 'बुधवार, 27 मई। पंजाबियों की दो पलटनों ने बादशाह से हिफ़ाज़त माँगी, या पलटन तोड़ने की इजाज़त। बादशाह बोले, वे हिफ़ाज़त कर सकते हैं और करेंगे।',
    },
    checks: { en: ['Wednesday, 27th May'], hi: ['बुधवार, 27 मई'] },
    why: {
      text: {
        en: "Jiwan Lal, Wednesday 27 May. Punjabis served on Delhi's side too.",
        hi: 'जीवन लाल, बुधवार 27 मई। पंजाबी दिल्ली की तरफ़ से भी लड़े।',
      },
      sources: [jl('p.103')],
    },
  },
  {
    id: 'ev-punjabis-forged',
    tier: 2,
    real: false,
    pair: 'ev-punjabis',
    onDay: 11,
    minMode: HARD,
    from: COURT_NEWS,
    to: OFFICE,
    text: {
      en: 'Thursday, 27th May. Two regiments of Punjabis ask the King to protect them, or let them disband. He says he is able and willing to protect them.',
      hi: 'गुरुवार, 27 मई। पंजाबियों की दो पलटनों ने बादशाह से हिफ़ाज़त माँगी, या पलटन तोड़ने की इजाज़त। बादशाह बोले, वे हिफ़ाज़त कर सकते हैं और करेंगे।',
    },
    checks: { en: ['Thursday, 27th May'], hi: ['गुरुवार, 27 मई'] },
    tells: [
      {
        kind: 'weekday',
        ruleId: 'weekdays',
        explain: { en: '27 May 1857 was a Wednesday, not a Thursday.', hi: '27 मई 1857 बुधवार था, गुरुवार नहीं।' },
        sources: [jl('p.103'), trial(CHUNI_17)],
      },
    ],
  },

  // ── Day 12, Thu 28 May: the Rohtak treasure (JL p.104), and the Queen suspected (Sen p.76) ──
  {
    id: 'ev-rohtak-real',
    tier: 2,
    real: true,
    pair: 'ev-rohtak',
    onDay: 12,
    minMode: HARD,
    from: TREASURY,
    to: OFFICE,
    text: {
      en: '28th May. The Rohtak treasure, Rs 175,000, was examined today. Many of the bags were found to hold only pice.',
      hi: '28 मई। रोहतक का ख़ज़ाना, 1,75,000 रुपये, आज जाँचा गया। कई थैलियों में बस पैसे निकले।',
    },
    checks: { en: ['Rs 175,000', 'Many of the bags', 'only pice'], hi: ['1,75,000 रुपये', 'कई थैलियों में', 'बस पैसे निकले'] },
    why: {
      text: {
        en: 'Odd but true: Jiwan Lal records those bags of pice, 28 May.',
        hi: 'अजीब पर सच: जीवन लाल ने 28 मई को पैसों की ये थैलियाँ दर्ज कीं।',
      },
      sources: [jl('p.104')],
    },
  },
  {
    id: 'ev-rohtak-forged',
    tier: 2,
    real: false,
    pair: 'ev-rohtak',
    onDay: 12,
    minMode: HARD,
    from: TREASURY,
    to: OFFICE,
    text: {
      en: '28th May. The Rohtak treasure, Rs 175,000, was examined today. Every one of the bags was found full of gold mohurs.',
      hi: '28 मई। रोहतक का ख़ज़ाना, 1,75,000 रुपये, आज जाँचा गया। हर थैली सोने की मोहरों से भरी निकली।',
    },
    checks: { en: ['Rs 175,000', 'Every one of the bags', 'gold mohurs'], hi: ['1,75,000 रुपये', 'हर थैली', 'सोने की मोहरों'] },
    tells: [
      {
        kind: 'number',
        factId: 'rohtak',
        explain: { en: 'Many of those bags held only pice, not gold.', hi: 'उनमें से कई थैलियों में बस पैसे थे, सोना नहीं।' },
        sources: [jl('p.104')],
      },
    ],
  },
  {
    id: 'ev-queen-suspected',
    tier: 3,
    real: true,
    onDay: 12,
    minMode: HARD,
    from: COURT_NEWS,
    to: OFFICE,
    text: {
      en: '28th May. A report says the soldiers now suspect Queen Zinat Mahal herself of being in league with the English.',
      hi: '28 मई। एक रिपोर्ट कहती है कि सिपाही अब ख़ुद मलिका ज़ीनत महल पर अंग्रेज़ों से मिले होने का शक करते हैं।',
    },
    checks: { en: ['28th May', 'Queen Zinat Mahal'], hi: ['28 मई', 'मलिका ज़ीनत महल'] },
    why: {
      text: {
        en: 'Odd but true: a report of 28 May says so, and Jiwan Lal agrees.',
        hi: 'अजीब पर सच: 28 मई की एक रिपोर्ट यही कहती है; अगले दिन जीवन लाल भी।',
      },
      sources: [sen('p.76'), jl('p.107')],
    },
  },

  // ── Day 14, Sat 30 May: Patiala's agent arrested (JL p.108) ──
  {
    id: 'ev-vakil-real',
    tier: 2,
    real: true,
    pair: 'ev-vakil',
    onDay: 14,
    minMode: HARD,
    from: COURT_NEWS,
    to: OFFICE,
    text: {
      en: '30th May. At the darbar, the agent of the Maharaja of Patiala was accused of writing to the English and taken to the Kotwali.',
      hi: '30 मई। दरबार में पटियाला के महाराजा के वकील पर अंग्रेज़ों को चिट्ठियाँ लिखने का इल्ज़ाम लगा, और उन्हें कोतवाली ले जाया गया।',
    },
    checks: { en: ['Maharaja of Patiala', 'accused of writing to the English'], hi: ['पटियाला के महाराजा', 'अंग्रेज़ों को चिट्ठियाँ लिखने'] },
    why: {
      text: {
        en: 'Jiwan Lal, 30 May: Patiala had sided with the English, so its agent paid.',
        hi: 'जीवन लाल, 30 मई: पटियाला अंग्रेज़ों के साथ था, सो उसके वकील पर गाज गिरी।',
      },
      sources: [jl('p.108')],
    },
  },
  {
    id: 'ev-vakil-forged',
    tier: 2,
    real: false,
    pair: 'ev-vakil',
    onDay: 14,
    minMode: HARD,
    from: COURT_NEWS,
    to: OFFICE,
    text: {
      en: "30th May. At the darbar, the agent of the Maharaja of Patiala was thanked for his master's help against the English.",
      hi: '30 मई। दरबार में पटियाला के महाराजा के वकील का शुक्रिया अदा किया गया, अंग्रेज़ों के ख़िलाफ़ उनके मालिक की मदद के लिए।',
    },
    checks: { en: ['Maharaja of Patiala', "his master's help"], hi: ['पटियाला के महाराजा', 'उनके मालिक की मदद'] },
    tells: [
      {
        kind: 'knowledge',
        factId: 'patiala-side',
        explain: {
          en: 'Patiala had joined the English; its agent was arrested that day.',
          hi: 'पटियाला अंग्रेज़ों से जा मिला था; उसी दिन उसका वकील पकड़ा गया।',
        },
        sources: [jl('p.97'), jl('p.108')],
      },
    ],
  },

  // ── Undated: the telegraph, the chapatis, Nicholson, a "siege" (Sen pp.73-79, 327-33; MH pp.39-40) ──
  {
    id: 'telegraph-real',
    tier: 3,
    real: true,
    pair: 'telegraph',
    minMode: HARD,
    from: SENIOR,
    to: NEW_MUNSHI,
    text: {
      en: 'On Monday the 11th, two young signallers in the English telegraph office flashed the news of Delhi to Ambala and the Punjab.',
      hi: 'सोमवार, 11 तारीख़ को अंग्रेज़ी तारघर के दो नौजवान तारबाबुओं ने दिल्ली की ख़बर तार से अंबाला और पंजाब तक भेज दी।',
    },
    checks: { en: ['two young signallers', 'Ambala and the Punjab'], hi: ['दो नौजवान तारबाबुओं', 'अंबाला और पंजाब'] },
    why: {
      text: {
        en: 'Sen: two young signallers wired Ambala, Lahore, Rawalpindi and Peshawar.',
        hi: 'सेन: दो नौजवानों ने अंबाला, लाहौर, रावलपिंडी और पेशावर तार भेजा।',
      },
      sources: [sen('p.74'), sen('p.327')],
    },
  },
  {
    id: 'telegraph-forged',
    tier: 3,
    real: false,
    pair: 'telegraph',
    minMode: HARD,
    from: SENIOR,
    to: NEW_MUNSHI,
    text: {
      en: 'On Monday the 11th, the English telegraph office was taken before its two young signallers could send a word to Ambala and the Punjab.',
      hi: 'सोमवार, 11 तारीख़ को अंग्रेज़ी तारघर पर क़ब्ज़ा हो गया, इससे पहले कि उसके दो नौजवान तारबाबू अंबाला और पंजाब तक एक शब्द भेज पाते।',
    },
    checks: { en: ['two young signallers', 'Ambala and the Punjab'], hi: ['दो नौजवान तारबाबू', 'अंबाला और पंजाब'] },
    tells: [
      {
        kind: 'knowledge',
        factId: 'telegraph',
        explain: {
          en: 'They did send it: Lahore had the news on the morning of 12 May.',
          hi: 'क्लर्कों ने ख़बर भेजी थी: 12 मई की सुबह तक लाहौर को पता चल गया।',
        },
        sources: [sen('p.74'), sen('p.327')],
      },
    ],
  },
  {
    id: 'chapati-real',
    tier: 3,
    real: true,
    pair: 'chapati',
    minMode: HARD,
    from: { en: 'Thanadar, Paharganj', hi: 'थानेदार, पहाड़गंज' },
    to: OFFICE,
    text: {
      en: 'Remember February: a watchman brought a chapati and said, bake five like it for the five nearest villages. No one could tell what it meant.',
      hi: 'फ़रवरी याद है: एक चौकीदार एक रोटी लाया और बोला, ऐसी पाँच बनाकर पास के पाँच गाँवों में भेजो। उसका मतलब कोई नहीं बता सका।',
    },
    checks: { en: ['Remember February', 'a chapati', 'what it meant'], hi: ['फ़रवरी याद है', 'एक रोटी', 'उसका मतलब'] },
    verify: { 'what it meant': 'fact:chapatis' },
    why: {
      text: {
        en: "After Mainodin, then Paharganj's thanadar: 'neither its origin, nor its intention, were known'.",
        hi: "मैनुद्दीन के बयान पर, जो तब पहाड़गंज के थानेदार थे: 'न शुरुआत पता थी, न मक़सद'।",
      },
      sources: [mh('pp.39-40')],
    },
  },
  {
    id: 'chapati-forged',
    tier: 3,
    real: false,
    pair: 'chapati',
    minMode: HARD,
    from: { en: 'Thanadar, Paharganj', hi: 'थानेदार, पहाड़गंज' },
    to: OFFICE,
    text: {
      en: 'Remember February: a watchman brought a chapati with a written order inside: bake five like it, and rise together when the sign comes.',
      hi: 'फ़रवरी याद है: एक चौकीदार एक रोटी लाया, अंदर लिखा हुक्म था: ऐसी पाँच बनाओ, और इशारा मिलते ही सब एक साथ उठ खड़े हो।',
    },
    checks: { en: ['Remember February', 'a chapati', 'a written order inside'], hi: ['फ़रवरी याद है', 'एक रोटी', 'अंदर लिखा हुक्म था'] },
    tells: [
      {
        kind: 'knowledge',
        factId: 'chapatis',
        explain: {
          en: 'No message came with the chapatis; nobody knew what they meant.',
          hi: 'रोटियों के साथ कोई संदेश नहीं था; उनका मतलब कोई नहीं जानता था।',
        },
        sources: [mh('pp.39-40'), trial(JATMALL_CHAPATI), trial(METCALFE_CHAPATI), majumdar('pp.202-03')],
      },
    ],
  },
  {
    id: 'nicholson-forged',
    tier: 3,
    real: false,
    minMode: HARD,
    from: NEWSWRITER,
    to: OFFICE,
    text: {
      en: 'News from Karnal: Colonel John Nicholson has joined the English column gathering there to march on Delhi.',
      hi: 'करनाल से ख़बर: कर्नल जॉन निकोलसन वहाँ जुट रही अंग्रेज़ी फ़ौज में आ मिले हैं, जो दिल्ली पर चढ़ने वाली है।',
    },
    checks: { en: ['News from Karnal', 'Colonel John Nicholson'], hi: ['करनाल से ख़बर', 'कर्नल जॉन निकोलसन'] },
    tells: [
      {
        kind: 'knowledge',
        factId: 'nicholson',
        explain: {
          en: 'Nicholson was at Peshawar in May; he reached the Delhi camp on 7 August.',
          hi: 'मई में निकोलसन पेशावर में थे; दिल्ली के कैंप में 7 अगस्त को पहुँचे।',
        },
        sources: [sen('p.331'), sen('p.333'), sen('p.97')],
      },
    ],
  },
  {
    id: 'besieged-forged',
    tier: 3,
    real: false,
    minMode: HARD,
    from: COURT_NEWS,
    to: OFFICE,
    text: {
      en: 'The English have closed every road round the city: Delhi is besieged, and not even the Mathura road is open.',
      hi: 'अंग्रेज़ों ने शहर के चारों ओर हर रास्ता बंद कर दिया है: दिल्ली घिर गई है, मथुरा की सड़क तक खुली नहीं।',
    },
    checks: { en: ['closed every road', 'Delhi is besieged'], hi: ['हर रास्ता बंद', 'दिल्ली घिर गई है'] },
    tells: [
      {
        kind: 'knowledge',
        factId: 'english-force',
        explain: {
          en: 'The Ridge fell to the English on 8 June; the Mathura road never closed.',
          hi: 'अंग्रेज़ रिज पर 8 जून को ही पहुँचे, और मथुरा की सड़क कभी बंद नहीं की।',
        },
        sources: [sen('p.79')],
      },
    ],
  },
]

export const messages: Message[] = [...eventMessages, ...datelessMessages, ...mediumMessages, ...hardMessages]
