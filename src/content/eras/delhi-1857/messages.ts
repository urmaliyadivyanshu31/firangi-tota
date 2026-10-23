import type { Message } from '../../types'
import {
  caveBrowne,
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

// Days: 1 = Sun 17 May 1857 … 14 = Sat 30 May 1857.
// Event messages (onDay) follow Jiwan Lal's diary and the trial papers. Days 1-3 events are tier 1.
// Real documents (document: …) quote public-domain translations, trimmed; names use the case-file
// spelling (Mirza Mughal, Abu Bakr).

const KING = { en: 'The King, Red Fort', hi: 'बादशाह सलामत, लाल क़िला' }
const OFFICE = { en: "The King's office", hi: 'बादशाह का दफ़्तर' }
const MUNSHI = { en: "The King's munshi", hi: 'बादशाह का मुंशी' }
const PEOPLE = { en: 'The people of Delhi', hi: 'दिल्ली के लोग' }
const MIRZA = { en: 'Mirza Mughal', hi: 'मिर्ज़ा मुग़ल' }
const DARBAR_REPORT = { en: 'Report to the darbar', hi: 'दरबार को रिपोर्ट' }

const eventMessages: Message[] = [
  // ── Day 2, Mon 18 May: the princes get the commands ───────────────────────────────
  {
    id: 'ev-commanders-real',
    tier: 1,
    real: true,
    pair: 'ev-commanders',
    onDay: 2,
    from: { en: 'Chuni Lal, news-writer', hi: 'चुन्नी लाल, अख़बार-नवीस' },
    to: OFFICE,
    text: {
      en: 'Monday, 18th May 1857. The King came from his private apartments into the Hall of Special Audience, and took his seat on the throne, in state. The bands of the five regiments attended and continued playing English music. The King bestowed arms and dresses of honour… on Mirza Mughal as Commander-in-Chief of the whole of the Forces, on… others of his sons as Colonels of infantry, and on his grandson Abu Bakr as Colonel of the regiment of Cavalry.',
      hi: 'सोमवार, 18 मई 1857। बादशाह अपने ख़ास महल से दीवान-ए-ख़ास में आए और शान से तख़्त पर बैठे। पाँचों पलटनों के बैंड आए और अंग्रेज़ी धुनें बजाते रहे। बादशाह ने मिर्ज़ा मुग़ल को पूरी फ़ौज का कमांडर-इन-चीफ़ बनाकर हथियार और इज़्ज़त की पोशाक दी। अपने दूसरे बेटों को पैदल पलटनों का कर्नल बनाया, और अपने पोते अबू बक्र को घुड़सवार पलटन का कर्नल।',
    },
    checks: {
      en: ['Mirza Mughal as Commander-in-Chief', 'Abu Bakr as Colonel of the regiment of Cavalry'],
      hi: ['मिर्ज़ा मुग़ल को पूरी फ़ौज का कमांडर-इन-चीफ़', 'पोते अबू बक्र को घुड़सवार पलटन का कर्नल'],
    },
    document: { sources: [trial(CHUNI_18)] },
    why: {
      text: {
        en: "Chuni Lal's news diary for 18 May, seized and read at the King's trial. Jiwan Lal agrees that the princes got the chief commands that day. And yes, the bands really did play English music.",
        hi: 'यह 18 मई की चुन्नी लाल की ख़बरों की डायरी है, जो पकड़ी गई और बादशाह के मुक़दमे में पढ़ी गई। जीवन लाल भी लिखते हैं कि उस दिन शहज़ादों को बड़ी कमानें मिलीं। और हाँ, बैंड सच में अंग्रेज़ी धुनें बजा रहे थे।',
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
    from: { en: 'Chuni Lal, news-writer', hi: 'चुन्नी लाल, अख़बार-नवीस' },
    to: OFFICE,
    text: {
      en: 'Monday, 18th May 1857. The King came into the Hall of Special Audience and took his seat on the throne, in state. The bands of the five regiments played English music. The King bestowed arms and dresses of honour on Mirza Jawan Bakht as Commander-in-Chief of the whole of the Forces, and on his grandson Abu Bakr as Colonel of the regiment of Cavalry.',
      hi: 'सोमवार, 18 मई 1857। बादशाह दीवान-ए-ख़ास में आए और शान से तख़्त पर बैठे। पाँचों पलटनों के बैंड अंग्रेज़ी धुनें बजाते रहे। बादशाह ने मिर्ज़ा जवाँ बख़्त को पूरी फ़ौज का कमांडर-इन-चीफ़ बनाकर हथियार और इज़्ज़त की पोशाक दी, और अपने पोते अबू बक्र को घुड़सवार पलटन का कर्नल बनाया।',
    },
    checks: {
      en: ['Mirza Jawan Bakht as Commander-in-Chief', 'Abu Bakr as Colonel of the regiment of Cavalry'],
      hi: ['मिर्ज़ा जवाँ बख़्त को पूरी फ़ौज का कमांडर-इन-चीफ़', 'पोते अबू बक्र को घुड़सवार पलटन का कर्नल'],
    },
    tells: [
      {
        kind: 'name',
        factId: 'commanders',
        explain: {
          en: "On 18 May the Commander-in-Chief was Mirza Mughal. Mirza Jawan Bakht, the King's chosen heir, was made his minister the next day. The forger promoted the wrong prince.",
          hi: '18 मई को कमांडर-इन-चीफ़ मिर्ज़ा मुग़ल बने थे। बादशाह के चुने हुए वारिस मिर्ज़ा जवाँ बख़्त को अगले दिन वज़ीर बनाया गया। जालसाज़ ने ग़लत शहज़ादे को तरक़्क़ी दे दी।',
        },
        sources: [jl('pp.96-97'), trial(CHUNI_18)],
      },
    ],
  },

  // ── Day 3, Tue 19 May: gold mohurs in the King's name ─────────────────────────────
  {
    id: 'ev-coins-real',
    tier: 1,
    real: true,
    pair: 'ev-coins',
    onDay: 3,
    from: { en: 'The Diwan-i-Khas', hi: 'दीवान-ए-ख़ास' },
    to: MUNSHI,
    text: {
      en: "Tuesday, 19th May. A thanadar presented gold mohurs struck in the King's name as tribute. On the coins is written: 'Silver and gold coin struck by the King of India, the protector of religion. The sovereign Suraj-u-din the brave.'",
      hi: "मंगलवार, 19 मई। एक थानेदार ने बादशाह के नाम पर ढली सोने की मोहरें नज़राने में पेश कीं। सिक्कों पर लिखा है: 'हिंद के बादशाह, दीन के रखवाले ने चाँदी और सोने का सिक्का चलाया। बादशाह सिराजुद्दीन, बहादुर।'",
    },
    checks: {
      en: ['The sovereign Suraj-u-din the brave', "struck in the King's name"],
      hi: ['बादशाह सिराजुद्दीन, बहादुर', 'बादशाह के नाम पर ढली'],
    },
    document: { sources: [jl('pp.96-97')] },
    why: {
      text: {
        en: "Jiwan Lal copied the coin's words into his diary on 19 May; this is Metcalfe's translation. Suraj-u-din (Siraj-ud-din) was Bahadur Shah's own title.",
        hi: 'जीवन लाल ने 19 मई को सिक्के के शब्द अपनी डायरी में उतारे; यह मेटकाफ़ का अनुवाद है। सिराजुद्दीन बहादुर शाह का अपना शाही नाम था।',
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
      en: "Tuesday, 19th May. A thanadar presented gold mohurs struck in the new King's name as tribute. On the coins is written: 'Silver and gold coin struck by the King of India, the protector of religion. The sovereign Abu Bakr the brave.'",
      hi: "मंगलवार, 19 मई। एक थानेदार ने नए बादशाह के नाम पर ढली सोने की मोहरें नज़राने में पेश कीं। सिक्कों पर लिखा है: 'हिंद के बादशाह, दीन के रखवाले ने चाँदी और सोने का सिक्का चलाया। बादशाह अबू बक्र, बहादुर।'",
    },
    checks: {
      en: ['The sovereign Abu Bakr the brave', "struck in the new King's name"],
      hi: ['बादशाह अबू बक्र, बहादुर', 'नए बादशाह के नाम पर ढली'],
    },
    tells: [
      {
        kind: 'name',
        factId: 'court',
        explain: {
          en: "On 17 May some soldiers did talk of making Abu Bakr king, but the coins presented on 19 May carry the old King's title, Suraj-u-din. The forger minted barrack gossip.",
          hi: '17 मई को कुछ सिपाहियों ने अबू बक्र को बादशाह बनाने की बात ज़रूर की थी, पर 19 मई को पेश हुए सिक्कों पर बूढ़े बादशाह का शाही नाम सिराजुद्दीन है। जालसाज़ ने छावनी की गप को सिक्के में ढाल दिया।',
        },
        sources: [jl('pp.95-97')],
      },
    ],
  },

  // ── Day 4, Wed 20 May: the King refuses a holy war against Hindus ─────────────────
  {
    id: 'ev-holy-war',
    tier: 2,
    real: true,
    onDay: 4,
    from: { en: 'Darbar record', hi: 'दरबार का रोज़नामचा' },
    to: OFFICE,
    text: {
      en: "Wednesday, 20th May. A deputation of Hindu officers arrived to complain of the war against Hindus being preached. The King replied: 'The Holy War is against the English; I have forbidden it against the Hindus.'",
      hi: "बुधवार, 20 मई। हिंदू अफ़सरों का एक दल शिकायत करने आया कि हिंदुओं के ख़िलाफ़ जंग की बातें हो रही हैं। बादशाह ने जवाब दिया: 'जिहाद अंग्रेज़ों के ख़िलाफ़ है; हिंदुओं के ख़िलाफ़ मैंने इसे मना कर दिया है।'",
    },
    checks: {
      en: ['I have forbidden it against the Hindus', 'Wednesday, 20th May'],
      hi: ['हिंदुओं के ख़िलाफ़ मैंने इसे मना कर दिया है', 'बुधवार, 20 मई'],
    },
    document: { sources: [jl('p.98')] },
    why: {
      text: {
        en: "Jiwan Lal's diary for 20 May. Chuni Lal's news diary for the same day has the King saying he regarded Hindus and Muslims alike and would not allow a religious war against the Hindus.",
        hi: '20 मई की जीवन लाल की डायरी। उसी दिन की चुन्नी लाल की डायरी में भी बादशाह कहते हैं कि वे हिंदू और मुसलमान को एक जैसा मानते हैं और हिंदुओं के ख़िलाफ़ मज़हबी जंग नहीं होने देंगे।',
      },
      sources: [jl('p.98'), trial(CHUNI_19_20)],
    },
  },

  // ── Day 5, Thu 21 May: drum proclamation ──────────────────────────────────────────
  {
    id: 'ev-drum',
    tier: 1,
    real: true,
    pair: 'drum',
    onDay: 5,
    from: { en: 'Drum proclamation', hi: 'ढिंढोरा' },
    to: PEOPLE,
    text: {
      en: "Thursday, 21st May. The King's proclamation, by beat of drum: Hindus and Mahommedans must not quarrel.",
      hi: 'गुरुवार, 21 मई। बादशाह का ऐलान, ढोल पीटकर: हिंदू और मुसलमान आपस में न झगड़ें।',
    },
    checks: {
      en: ['by beat of drum', 'must not quarrel'],
      hi: ['ढोल पीटकर', 'आपस में न झगड़ें'],
    },
    document: { sources: [jl('p.100')] },
    why: {
      text: {
        en: 'Jiwan Lal recorded this drum proclamation on 21 May. The same day the King and his council angrily refused a call for a holy war against the Hindus.',
        hi: 'जीवन लाल ने 21 मई को यह ढिंढोरा दर्ज किया। उसी दिन बादशाह और उनके दरबारियों ने हिंदुओं के ख़िलाफ़ जिहाद की माँग को ग़ुस्से से ठुकरा दिया।',
      },
      sources: [jl('p.100')],
    },
  },

  // ── Day 6, Fri 22 May: the King's order to Mirza Mughal ───────────────────────────
  {
    id: 'ev-order-real',
    tier: 2,
    real: true,
    pair: 'ev-order',
    onDay: 6,
    from: { en: 'The King, under his seal', hi: 'बादशाह, अपनी मुहर से' },
    to: MIRZA,
    text: {
      en: 'Our Son, the Illustrious and Valiant Mirza Zohur-ud-din, otherwise Mirza Mughal Bahadur. Learn!… Repeated injunctions have been issued prohibiting plunder and aggression in the city, but all to no purpose; for although ten days have now elapsed, the same evils are prevailing to the present time… The officers of the army too make a practice of coming into court carelessly dressed, wearing caps instead of turbans and carrying their swords.',
      hi: 'हमारे बेटे, नामवर और बहादुर मिर्ज़ा ज़हीरुद्दीन, यानी मिर्ज़ा मुग़ल बहादुर। जान लो! शहर में लूट और ज़्यादती रोकने के हुक्म बार-बार दिए गए, पर सब बेकार; दस दिन बीत गए, और वही बुराइयाँ आज तक चल रही हैं… फ़ौज के अफ़सर भी दरबार में लापरवाही से कपड़े पहनकर आते हैं, पगड़ी की जगह टोपी लगाकर और तलवार लेकर।',
    },
    checks: {
      en: ['Our Son, the Illustrious and Valiant', 'caps instead of turbans'],
      hi: ['हमारे बेटे, नामवर और बहादुर', 'पगड़ी की जगह टोपी'],
    },
    document: { sources: [trial(KING_ORDER)] },
    why: {
      text: {
        en: "The King's own order to Mirza Mughal, read at his trial. It is undated, but 'ten days have now elapsed' since the troops arrived puts it at about 21 or 22 May. The complaint about caps and swords is the King's, word for word.",
        hi: "यह मिर्ज़ा मुग़ल को बादशाह का अपना हुक्म है, जो उनके मुक़दमे में पढ़ा गया। इस पर तारीख़ नहीं है, पर फ़ौज के आने के बाद 'दस दिन बीत गए' से यह लगभग 21 या 22 मई का बनता है। टोपी और तलवार की शिकायत बादशाह के अपने शब्दों में है।",
      },
      sources: [trial(KING_ORDER)],
    },
  },
  {
    id: 'ev-order-forged',
    tier: 2,
    real: false,
    pair: 'ev-order',
    onDay: 6,
    from: { en: 'The King, under his seal', hi: 'बादशाह, अपनी मुहर से' },
    to: MIRZA,
    text: {
      en: 'Our Son, the Illustrious and Valiant Mirza Zohur-ud-din, otherwise Mirza Mughal Bahadur. Learn! We are well pleased with the officers of the army. They ride up to the Hall of Special Audience on horseback and come to court in caps, carrying their swords, as true soldiers should. Let them continue so.',
      hi: 'हमारे बेटे, नामवर और बहादुर मिर्ज़ा ज़हीरुद्दीन, यानी मिर्ज़ा मुग़ल बहादुर। जान लो! हम फ़ौज के अफ़सरों से बहुत ख़ुश हैं। वे घोड़े पर सवार होकर दीवान-ए-ख़ास तक आते हैं और टोपी पहनकर, तलवार लेकर दरबार में आते हैं, जैसे सच्चे सिपाही को आना चाहिए। वे ऐसा ही करते रहें।',
    },
    checks: {
      en: ['ride up to the Hall of Special Audience on horseback', 'come to court in caps'],
      hi: ['घोड़े पर सवार होकर दीवान-ए-ख़ास तक आते हैं', 'टोपी पहनकर'],
    },
    tells: [
      {
        kind: 'habit',
        sources: [trial(KING_ORDER)],
        explain: {
          en: 'The opening is perfect; the opinion is upside down. In his real order the King complains that soldiers ride up to the Hall of Special Audience and come to court in caps instead of turbans. He never praised it. See the rulebook on court manners.',
          hi: 'शुरुआत बिल्कुल सही है; राय उलटी है। असली हुक्म में बादशाह शिकायत करते हैं कि सिपाही घोड़े पर दीवान-ए-ख़ास तक आते हैं और पगड़ी की जगह टोपी पहनकर दरबार में आते हैं। उन्होंने इसकी कभी तारीफ़ नहीं की। नियमों की किताब में दरबार के क़ायदे देखिए।',
        },
      },
    ],
  },

  // ── Day 8, Sun 24 May: the Eid moon, by petition from Ballabhgarh ─────────────────
  {
    id: 'ev-newmoon-real',
    tier: 2,
    real: true,
    pair: 'ev-newmoon',
    onDay: 8,
    from: { en: 'Raja Nahar Singh, Ballabhgarh', hi: 'राजा नाहर सिंह, बल्लभगढ़' },
    to: KING,
    text: {
      en: 'The King! Shelter of the World! Respectfully Sheweth,—… My Lord! This is Sunday, and according to my usual custom, I went to take an airing in the Dilkhusha garden. While I was there, the new moon of the festival of the Eed appeared, and was about the same time distinctly seen by all the residents of this place… (Prayers for the eternal prosperity of the reign.) Petition of the slave and servant, Nahar Singh, Chief of Ballabhgarh. Seal of Rajah Nahar Singh Bahadur.',
      hi: 'बादशाह सलामत! जहाँपनाह! अर्ज़ है कि—… हुज़ूर! आज रविवार है, और अपनी आदत के मुताबिक़ मैं दिलकुशा बाग़ में हवा खाने गया। वहीं ईद का नया चाँद दिखा, और लगभग उसी वक़्त यहाँ के सब लोगों ने उसे साफ़ देखा… (बादशाहत हमेशा बनी रहे।) अर्ज़ी: ग़ुलाम और ख़ादिम नाहर सिंह, बल्लभगढ़ के सरदार की। राजा नाहर सिंह बहादुर की मुहर।',
    },
    checks: {
      en: ['This is Sunday', 'new moon of the festival of the Eed'],
      hi: ['आज रविवार है', 'ईद का नया चाँद'],
    },
    document: { sources: [trial('Petition No. 64, dated 24 May 1857, p.34')] },
    why: {
      text: {
        en: "A real petition dated 24 May 1857, read at the King's trial. 24 May 1857 was a Sunday, and Jiwan Lal also records the new moon that evening, the 29th of Ramzan. Eid followed on Monday.",
        hi: 'यह 24 मई 1857 की असली अर्ज़ी है, जो बादशाह के मुक़दमे में पढ़ी गई। 24 मई 1857 रविवार था, और जीवन लाल भी उसी शाम, रमज़ान की 29 तारीख़ को, नया चाँद दर्ज करते हैं। ईद सोमवार को हुई।',
      },
      sources: [trial('Petition No. 64, dated 24 May 1857, p.34'), jl('p.102')],
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
      en: 'The King! Shelter of the World! Respectfully Sheweth,—… My Lord! This is Monday, and according to my usual custom, I went to take an airing in the Dilkhusha garden. While I was there, the new moon of the festival of the Eed appeared, and was about the same time distinctly seen by all the residents of this place… (Prayers for the eternal prosperity of the reign.) Petition of the slave and servant, Nahar Singh, Chief of Ballabhgarh. Seal of Rajah Nahar Singh Bahadur.',
      hi: 'बादशाह सलामत! जहाँपनाह! अर्ज़ है कि—… हुज़ूर! आज सोमवार है, और अपनी आदत के मुताबिक़ मैं दिलकुशा बाग़ में हवा खाने गया। वहीं ईद का नया चाँद दिखा, और लगभग उसी वक़्त यहाँ के सब लोगों ने उसे साफ़ देखा… (बादशाहत हमेशा बनी रहे।) अर्ज़ी: ग़ुलाम और ख़ादिम नाहर सिंह, बल्लभगढ़ के सरदार की। राजा नाहर सिंह बहादुर की मुहर।',
    },
    checks: {
      en: ['This is Monday', 'new moon of the festival of the Eed'],
      hi: ['आज सोमवार है', 'ईद का नया चाँद'],
    },
    tells: [
      {
        kind: 'weekday',
        factId: 'calendar',
        explain: {
          en: "Count from Sunday 17 May: 24 May is a Sunday too. The real petition says 'This is Sunday', and Jiwan Lal saw the same new moon that evening. A Monday moon would put Eid a day late.",
          hi: "रविवार 17 मई से गिनिए: 24 मई भी रविवार है। असली अर्ज़ी में लिखा है 'आज रविवार है', और जीवन लाल ने भी उसी शाम नया चाँद देखा। सोमवार को चाँद दिखता तो ईद एक दिन देर से पड़ती।",
        },
        sources: [trial('Petition No. 64, dated 24 May 1857, p.34'), jl('p.102')],
      },
    ],
  },

  // ── Day 9, Mon 25 May: Eid, and a false alarm ─────────────────────────────────────
  {
    id: 'ev-eid-real',
    tier: 1,
    real: true,
    pair: 'ev-eid',
    onDay: 9,
    from: DARBAR_REPORT,
    to: OFFICE,
    text: {
      en: 'Monday, the festival of Eid. While the King was at prayer in the Jama Masjid, a camel sowar came from the Raja of Ballabhgarh to say an English force was advancing on the city. For about an hour there was great excitement. It is now found that the sowar mistook an Eid procession for the advance-guard of an English army.',
      hi: 'सोमवार, ईद का दिन। बादशाह जामा मस्जिद में नमाज़ पढ़ रहे थे, तभी बल्लभगढ़ के राजा की तरफ़ से एक ऊँट-सवार आया और बोला कि अंग्रेज़ी फ़ौज शहर की ओर बढ़ रही है। लगभग एक घंटे तक भारी हलचल रही। अब पता चला कि सवार ने ईद के जुलूस को अंग्रेज़ी फ़ौज का अगला दस्ता समझ लिया था।',
    },
    checks: {
      en: ['mistook an Eid procession', 'a camel sowar came from the Raja of Ballabhgarh'],
      hi: ['ईद के जुलूस को अंग्रेज़ी फ़ौज का अगला दस्ता समझ', 'बल्लभगढ़ के राजा की तरफ़ से एक ऊँट-सवार'],
    },
    why: {
      text: {
        en: "Jiwan Lal's diary for 25 May: the King went to the Jama Masjid for Eid, and the camel sowar's 'English army' turned out to be an Eid procession. Written for the game; every detail checks out.",
        hi: "25 मई की जीवन लाल की डायरी: बादशाह ईद पर जामा मस्जिद गए, और ऊँट-सवार की 'अंग्रेज़ी फ़ौज' ईद का जुलूस निकली। यह खेल के लिए लिखा गया है; हर बात सही है।",
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
    from: DARBAR_REPORT,
    to: OFFICE,
    text: {
      en: 'Yesterday, Sunday, was the festival of Eid. While the King was at prayer in the Jama Masjid, a camel sowar came from the Raja of Ballabhgarh to say an English force was advancing on the city. The English are at the gates. Let the King leave the city tonight.',
      hi: 'कल, रविवार को, ईद थी। बादशाह जामा मस्जिद में नमाज़ पढ़ रहे थे, तभी बल्लभगढ़ के राजा की तरफ़ से एक ऊँट-सवार आया और बोला कि अंग्रेज़ी फ़ौज शहर की ओर बढ़ रही है। अंग्रेज़ दरवाज़ों पर हैं। बादशाह आज रात शहर छोड़ दें।',
    },
    checks: {
      en: ['Yesterday, Sunday, was the festival of Eid', 'The English are at the gates'],
      hi: ['कल, रविवार को, ईद थी', 'अंग्रेज़ दरवाज़ों पर हैं'],
    },
    tells: [
      {
        kind: 'date',
        factId: 'calendar',
        explain: {
          en: "Eid is today, Monday 25 May: the new moon was seen only on Sunday evening. And the 'English force' was an Eid procession. A forger who can't find Eid on the calendar wants the King out of Delhi.",
          hi: "ईद आज है, सोमवार 25 मई: नया चाँद रविवार की शाम ही दिखा था। और 'अंग्रेज़ी फ़ौज' असल में ईद का जुलूस थी। जो जालसाज़ कैलेंडर में ईद नहीं ढूँढ पाता, वह बादशाह को दिल्ली से बाहर भेजना चाहता है।",
        },
        sources: [jl('p.102')],
      },
    ],
  },

  // ── Day 11, Wed 27 May: guns filled with gravel ───────────────────────────────────
  {
    id: 'ev-guns-real',
    tier: 1,
    real: true,
    pair: 'ev-guns',
    onDay: 11,
    from: { en: 'Report from the bastions', hi: 'बुर्जों से रिपोर्ट' },
    to: OFFICE,
    text: {
      en: 'It is found today that some guns on the bastions have been spiked, and others filled with stones, gravel and ends of string. Yesterday the guns on the Islamgarh bastion were found filled with kankar. The soldiers blame the King\'s servants. The King\'s servants ask what kind of soldiers let this be done to guns in their own charge.',
      hi: 'आज पता चला कि बुर्जों पर कुछ तोपों में कीलें ठोक दी गई हैं, और कुछ में पत्थर, बजरी और डोरी के टुकड़े भर दिए गए हैं। कल इस्लामगढ़ बुर्ज की तोपों में कंकड़ भरे मिले थे। सिपाही बादशाह के नौकरों पर इल्ज़ाम लगा रहे हैं। बादशाह के नौकर पूछते हैं कि ये कैसे सिपाही हैं जिनकी अपनी निगरानी में तोपों के साथ ऐसा हो गया।',
    },
    checks: {
      en: ['stones, gravel and ends of string', 'Islamgarh bastion'],
      hi: ['पत्थर, बजरी और डोरी के टुकड़े', 'इस्लामगढ़ बुर्ज'],
    },
    why: {
      text: {
        en: "Jiwan Lal's diary for 26 and 27 May, nearly word for word: kankar in the Islamgarh guns, then spiked guns and guns 'filled with stones, gravel, and ends of string', and a two-hour quarrel over who was to blame.",
        hi: "26 और 27 मई की जीवन लाल की डायरी, लगभग उन्हीं शब्दों में: इस्लामगढ़ की तोपों में कंकड़, फिर कीलें ठुकी तोपें और 'पत्थर, बजरी और डोरी के टुकड़ों' से भरी तोपें, और इस पर दो घंटे का झगड़ा कि क़सूर किसका है।",
      },
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
      en: 'Guns on the bastions are found filled with stones, gravel and ends of string. The traitor is found too: at the Kashmiri Gate the guards picked up a letter from Hakim Ahsanullah Khan to the Lieutenant-Governor at Lahore, promising to spoil the guns. Let the Hakim be handed to the soldiers.',
      hi: 'बुर्जों की तोपों में पत्थर, बजरी और डोरी के टुकड़े भरे मिले हैं। ग़द्दार भी मिल गया: कश्मीरी दरवाज़े पर पहरेदारों को हकीम अहसनुल्लाह ख़ान की एक चिट्ठी मिली, लाहौर के लेफ़्टिनेंट-गवर्नर के नाम, जिसमें तोपें बिगाड़ने का वादा है। हकीम को सिपाहियों के हवाले किया जाए।',
    },
    checks: {
      en: ['the Lieutenant-Governor at Lahore', 'the guards picked up a letter'],
      hi: ['लाहौर के लेफ़्टिनेंट-गवर्नर', 'पहरेदारों को हकीम अहसनुल्लाह ख़ान की एक चिट्ठी मिली'],
    },
    tells: [
      {
        kind: 'place',
        factId: 'officials',
        explain: {
          en: "The Lieutenant-Governor sits at Agra. Lahore has a Chief Commissioner, Sir John Lawrence. A real traitor would know where to send his letter. And a letter that conveniently falls into the gate guards' hands is the oldest trick in the rulebook.",
          hi: 'लेफ़्टिनेंट-गवर्नर आगरा में बैठते हैं। लाहौर में चीफ़ कमिश्नर हैं, सर जॉन लॉरेंस। असली ग़द्दार को पता होता कि चिट्ठी कहाँ भेजनी है। और जो चिट्ठी आराम से पहरेदारों के हाथ लग जाए, वह नियमों की किताब की सबसे पुरानी चाल है।',
        },
        sources: [majumdar('p.71'), sen('pp.321-22'), mh('p.59')],
      },
    ],
  },

  // ── Day 13, Fri 29 May: a "spy" in a fortune-teller's dress ───────────────────────
  {
    id: 'ev-spy-real',
    tier: 2,
    real: true,
    pair: 'ev-spy',
    onDay: 13,
    from: DARBAR_REPORT,
    to: OFFICE,
    text: {
      en: 'A European found in the Qudsia Bagh has been brought in. His captors declared him to be John Lawrence, known, they said, by an old wound in his back. When he was stripped, no wound was found. He was dressed as a fortune-teller and carried an almanac in his hand. He is suspected to be a spy.',
      hi: 'क़ुदसिया बाग़ में मिले एक यूरोपियन को पकड़कर लाया गया है। पकड़ने वालों ने कहा कि यह जॉन लॉरेंस है, जिसे पीठ के एक पुराने घाव से पहचाना गया। कपड़े उतरवाने पर कोई घाव नहीं मिला। वह भविष्य बताने वाले के भेस में था और हाथ में पंचांग लिए था। उस पर जासूस होने का शक है।',
    },
    checks: {
      en: ['declared him to be John Lawrence', 'no wound was found'],
      hi: ['यह जॉन लॉरेंस है', 'कोई घाव नहीं मिला'],
    },
    why: {
      text: {
        en: "Jiwan Lal's diary for 29 May tells it just like this. The real John Lawrence was Chief Commissioner of the Punjab, far away at Lahore; the man in the garden was only suspected of spying.",
        hi: '29 मई की जीवन लाल की डायरी में ठीक यही लिखा है। असली जॉन लॉरेंस पंजाब के चीफ़ कमिश्नर थे, दूर लाहौर में; बाग़ वाले आदमी पर सिर्फ़ जासूसी का शक था।',
      },
      sources: [jl('p.107'), majumdar('p.71')],
    },
  },
  {
    id: 'ev-spy-forged',
    tier: 1,
    real: false,
    pair: 'ev-spy',
    onDay: 13,
    from: DARBAR_REPORT,
    to: OFFICE,
    text: {
      en: 'Great news: John Lawrence, Lieutenant-Governor of the Punjab, has been caught in the Qudsia Bagh dressed as a fortune-teller. He knows he is beaten and has confessed everything. The Punjab is ours for the taking.',
      hi: 'बड़ी ख़बर: पंजाब के लेफ़्टिनेंट-गवर्नर जॉन लॉरेंस क़ुदसिया बाग़ में भविष्य बताने वाले के भेस में पकड़े गए हैं। उन्होंने हार मान ली है और सब कुछ क़बूल कर लिया है। पंजाब अब हमारा है।',
    },
    checks: {
      en: ['Lieutenant-Governor of the Punjab', 'has confessed everything'],
      hi: ['पंजाब के लेफ़्टिनेंट-गवर्नर', 'सब कुछ क़बूल कर लिया'],
    },
    tells: [
      {
        kind: 'name',
        factId: 'officials',
        explain: {
          en: 'John Lawrence was Chief Commissioner of the Punjab, not Lieutenant-Governor, and he was at Lahore, not in a Delhi garden. The man brought in on 29 May had no wound, confessed nothing and was only suspected of spying.',
          hi: 'जॉन लॉरेंस पंजाब के चीफ़ कमिश्नर थे, लेफ़्टिनेंट-गवर्नर नहीं, और वे लाहौर में थे, दिल्ली के किसी बाग़ में नहीं। 29 मई को पकड़े गए आदमी के कोई घाव नहीं था, उसने कुछ क़बूल नहीं किया, और उस पर बस जासूसी का शक था।',
        },
        sources: [majumdar('p.71'), jl('p.107')],
      },
    ],
  },

  // ── Day 14, Sat 30 May: the fight at the Hindun ──────────────────────────────────
  {
    id: 'ev-hindun',
    tier: 3,
    real: true,
    onDay: 14,
    from: { en: 'News from the Hindun', hi: 'हिंडन से ख़बर' },
    to: OFFICE,
    text: {
      en: 'Towards evening came news of a fight with the English at the Hindun. Our artillery was taken and the gunners fled. Mirza Abu Bakr, who commanded, has come back and boasts to the King of his bravery in the fight. The bystanders think the praise is all his own.',
      hi: 'शाम होते-होते हिंडन पर अंग्रेज़ों से लड़ाई की ख़बर आई। हमारा तोपख़ाना छिन गया और तोपची भाग गए। मिर्ज़ा अबू बक्र, जो कमान कर रहे थे, लौट आए हैं और बादशाह के सामने अपनी बहादुरी की शेख़ी बघार रहे हैं। पास खड़े लोग समझते हैं कि यह तारीफ़ बस उनके अपने मुँह की है।',
    },
    checks: {
      en: ['fight with the English at the Hindun', 'boasts to the King of his bravery'],
      hi: ['हिंडन पर अंग्रेज़ों से लड़ाई', 'अपनी बहादुरी की शेख़ी'],
    },
    why: {
      text: {
        en: "It sounds like enemy mockery, but it is Jiwan Lal's own entry for 30 May: the bystanders 'understood that he gave himself unfounded praise'. The English won both fights on the Hindun before they marched on Delhi.",
        hi: "यह दुश्मन का मज़ाक़ लगता है, पर यह 30 मई की जीवन लाल की अपनी डायरी है: पास खड़े लोग 'समझ गए कि वे अपनी झूठी तारीफ़ कर रहे हैं'। दिल्ली की ओर बढ़ने से पहले अंग्रेज़ों ने हिंडन की दोनों लड़ाइयाँ जीतीं।",
      },
      sources: [jl('p.108'), sen('p.79')],
    },
  },
]

const datelessMessages: Message[] = [
  // ── Regiments ─────────────────────────────────────────────────────────────────────
  {
    id: 'cavalry-real',
    tier: 1,
    real: true,
    pair: 'cavalry',
    from: { en: 'Officers, 3rd Light Cavalry', hi: 'तीसरी घुड़सवार पलटन के अफ़सर' },
    to: KING,
    text: {
      en: "The King! Shelter of the World! Respectfully Sheweth,— That we, the sowars of the 3rd Light Cavalry, rode from Meerut to your Majesty's presence. Our horses need grain. We pray that grain be given to us from the royal stores. (Prayers for the prosperity of the reign.) Petition of the slaves, the native officers of the 3rd Light Cavalry. Seals of the officers.",
      hi: 'बादशाह सलामत! जहाँपनाह! अर्ज़ है कि— हम, तीसरी घुड़सवार पलटन के सवार, मेरठ से घोड़े दौड़ाकर हुज़ूर की ख़िदमत में आए हैं। हमारे घोड़ों को दाना चाहिए। गुज़ारिश है कि शाही भंडार से हमें दाना दिया जाए। (बादशाहत सदा बनी रहे।) अर्ज़ी: ग़ुलाम, तीसरी घुड़सवार पलटन के देसी अफ़सरों की। अफ़सरों की मुहरें।',
    },
    checks: {
      en: ['3rd Light Cavalry, rode from Meerut', 'Seals of the officers'],
      hi: ['तीसरी घुड़सवार पलटन के सवार, मेरठ से', 'अफ़सरों की मुहरें'],
    },
    why: {
      text: {
        en: 'Written for the game; every detail checks out. The 3rd Light Cavalry rode from Meerut to Delhi, and the form follows real petitions in the trial papers.',
        hi: 'यह खेल के लिए लिखा गया है; हर बात सही है। तीसरी घुड़सवार पलटन मेरठ से दिल्ली आई थी, और अर्ज़ी का ढंग मुक़दमे के काग़ज़ों की असली अर्ज़ियों जैसा है।',
      },
      sources: [sen('pp.59-60'), trial('petitions, e.g. Nos. 60-68, pp.32-35')],
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
      en: "The King! Shelter of the World! Respectfully Sheweth,— That we, the sowars of the 4th Light Cavalry, rode from Meerut to your Majesty's presence. Our horses need grain. We pray that grain be given to us from the royal stores. (Prayers for the prosperity of the reign.) Petition of the slaves, the native officers of the 4th Light Cavalry. Seals of the officers.",
      hi: 'बादशाह सलामत! जहाँपनाह! अर्ज़ है कि— हम, चौथी घुड़सवार पलटन के सवार, मेरठ से घोड़े दौड़ाकर हुज़ूर की ख़िदमत में आए हैं। हमारे घोड़ों को दाना चाहिए। गुज़ारिश है कि शाही भंडार से हमें दाना दिया जाए। (बादशाहत सदा बनी रहे।) अर्ज़ी: ग़ुलाम, चौथी घुड़सवार पलटन के देसी अफ़सरों की। अफ़सरों की मुहरें।',
    },
    checks: {
      en: ['4th Light Cavalry, rode from Meerut', 'Seals of the officers'],
      hi: ['चौथी घुड़सवार पलटन के सवार, मेरठ से', 'अफ़सरों की मुहरें'],
    },
    tells: [
      {
        kind: 'number',
        factId: 'regiments',
        explain: {
          en: 'The cavalry that rode from Meerut was the 3rd Light Cavalry. The forger is one regiment out.',
          hi: 'मेरठ से आई घुड़सवार पलटन तीसरी थी। जालसाज़ एक नंबर चूक गया।',
        },
        sources: [sen('pp.59-60')],
      },
    ],
  },
  {
    id: 'guard-real',
    tier: 1,
    real: true,
    pair: 'guard',
    from: { en: 'A palace officer', hi: 'महल का एक अफ़सर' },
    to: KING,
    text: {
      en: "The King! Shelter of the World! Respectfully Sheweth,— That the guard posted at your slave's house has been withdrawn, and ill-conducted men of the city come in mobs to plunder it. My wife and children live there. I pray that a guard be posted. (Prayers for the King's prosperity.) Petition of the home-born slave. [The King's note, in pencil:] Mirza Mughal will station a guard from the 20th Regiment Native Infantry at the petitioner's house.",
      hi: 'बादशाह सलामत! जहाँपनाह! अर्ज़ है कि— ग़ुलाम के घर पर लगा पहरा हटा लिया गया है, और शहर के बदमाश टोलियाँ बनाकर उसे लूटने आते हैं। मेरी बीवी और बच्चे वहीं रहते हैं। गुज़ारिश है कि पहरा लगाया जाए। (बादशाह सलामत रहें।) अर्ज़ी: घर के पले ग़ुलाम की। [बादशाह की पेंसिल से लिखी टिप्पणी:] मिर्ज़ा मुग़ल 20वीं पैदल पलटन से अर्ज़ी देने वाले के घर पर पहरा लगाएँ।',
    },
    checks: {
      en: ['20th Regiment Native Infantry', 'in pencil'],
      hi: ['20वीं पैदल पलटन', 'पेंसिल से लिखी'],
    },
    why: {
      text: {
        en: "Written for the game, after a real petition of 23 May in the trial papers, on which the King wrote in pencil: 'Mirza Moghal will station a Guard, from the 20th Regiment Native Infantry, at the petitioner's house.' The 20th came from Meerut.",
        hi: "यह खेल के लिए लिखा गया है, मुक़दमे के काग़ज़ों में 23 मई की एक असली अर्ज़ी के आधार पर, जिस पर बादशाह ने पेंसिल से लिखा: 'मिर्ज़ा मुग़ल 20वीं पैदल पलटन से अर्ज़ी देने वाले के घर पर पहरा लगाएँ।' 20वीं पलटन मेरठ से आई थी।",
      },
      sources: [trial('Petition No. 3, dated 23 May 1857'), sen('p.61')],
    },
  },
  {
    id: 'guard-forged',
    tier: 1,
    real: false,
    pair: 'guard',
    from: { en: 'A palace officer', hi: 'महल का एक अफ़सर' },
    to: KING,
    text: {
      en: "The King! Shelter of the World! Respectfully Sheweth,— That the guard posted at your slave's house has been withdrawn, and ill-conducted men of the city come in mobs to plunder it. My wife and children live there. I pray that a guard be posted. (Prayers for the King's prosperity.) Petition of the home-born slave. [The King's note, in pencil:] Mirza Mughal will station a guard from the 37th Regiment Native Infantry at the petitioner's house.",
      hi: 'बादशाह सलामत! जहाँपनाह! अर्ज़ है कि— ग़ुलाम के घर पर लगा पहरा हटा लिया गया है, और शहर के बदमाश टोलियाँ बनाकर उसे लूटने आते हैं। मेरी बीवी और बच्चे वहीं रहते हैं। गुज़ारिश है कि पहरा लगाया जाए। (बादशाह सलामत रहें।) अर्ज़ी: घर के पले ग़ुलाम की। [बादशाह की पेंसिल से लिखी टिप्पणी:] मिर्ज़ा मुग़ल 37वीं पैदल पलटन से अर्ज़ी देने वाले के घर पर पहरा लगाएँ।',
    },
    checks: {
      en: ['37th Regiment Native Infantry', 'in pencil'],
      hi: ['37वीं पैदल पलटन', 'पेंसिल से लिखी'],
    },
    tells: [
      {
        kind: 'number',
        factId: 'regiments',
        explain: {
          en: 'There was no 37th in Delhi. The Delhi regiments were the 38th, 54th and 74th, and the Meerut infantry were the 11th and 20th. The forger missed by one.',
          hi: 'दिल्ली में कोई 37वीं पलटन नहीं थी। दिल्ली की पलटनें 38वीं, 54वीं और 74वीं थीं, और मेरठ की पैदल पलटनें 11वीं और 20वीं। जालसाज़ एक नंबर से चूक गया।',
        },
        sources: [mh('p.53'), sen('pp.59-62')],
      },
    ],
  },

  // ── Money ─────────────────────────────────────────────────────────────────────────
  {
    id: 'annas-real',
    tier: 1,
    real: true,
    pair: 'annas',
    from: { en: 'Shopkeepers of the Chandni Chowk', hi: 'चाँदनी चौक के दुकानदार' },
    to: KING,
    text: {
      en: 'The King! Shelter of the World! Respectfully Sheweth,— That soldiers took cloth from our shops worth 3 rupees 8 annas and paid nothing. We are poor men. We pray that the price be paid to us. (Prayers for the prosperity of the reign.) Petition of the slaves, the shopkeepers of the Chandni Chowk.',
      hi: 'बादशाह सलामत! जहाँपनाह! अर्ज़ है कि— सिपाही हमारी दुकानों से 3 रुपये 8 आने का कपड़ा ले गए और एक पैसा नहीं दिया। हम ग़रीब लोग हैं। गुज़ारिश है कि हमें दाम दिलवाया जाए। (बादशाहत सदा बनी रहे।) अर्ज़ी: ग़ुलाम, चाँदनी चौक के दुकानदारों की।',
    },
    checks: {
      en: ['3 rupees 8 annas', 'paid nothing'],
      hi: ['3 रुपये 8 आने', 'एक पैसा नहीं दिया'],
    },
    why: {
      text: {
        en: "Written for the game; every detail checks out. 16 annas make a rupee, so 3 rupees 8 annas is a real sum, and the King's own order complains that soldiers took the shopkeepers' wares without paying for them.",
        hi: 'यह खेल के लिए लिखा गया है; हर बात सही है। 16 आने का एक रुपया होता है, इसलिए 3 रुपये 8 आने असली रक़म है, और बादशाह का अपना हुक्म शिकायत करता है कि सिपाही दुकानदारों का माल बिना दाम दिए ले जाते हैं।',
      },
      sources: [yule('s.v. Anna, p.31'), trial(KING_ORDER)],
    },
  },
  {
    id: 'annas-forged',
    tier: 1,
    real: false,
    pair: 'annas',
    from: { en: 'Shopkeepers of the Chandni Chowk', hi: 'चाँदनी चौक के दुकानदार' },
    to: KING,
    text: {
      en: 'The King! Shelter of the World! Respectfully Sheweth,— That soldiers took cloth from our shops worth 3 rupees 18 annas and paid nothing. We are poor men. We pray that the price be paid to us. (Prayers for the prosperity of the reign.) Petition of the slaves, the shopkeepers of the Chandni Chowk.',
      hi: 'बादशाह सलामत! जहाँपनाह! अर्ज़ है कि— सिपाही हमारी दुकानों से 3 रुपये 18 आने का कपड़ा ले गए और एक पैसा नहीं दिया। हम ग़रीब लोग हैं। गुज़ारिश है कि हमें दाम दिलवाया जाए। (बादशाहत सदा बनी रहे।) अर्ज़ी: ग़ुलाम, चाँदनी चौक के दुकानदारों की।',
    },
    checks: {
      en: ['3 rupees 18 annas', 'paid nothing'],
      hi: ['3 रुपये 18 आने', 'एक पैसा नहीं दिया'],
    },
    tells: [
      {
        kind: 'number',
        factId: 'money',
        explain: {
          en: "There is no such sum as 3 rupees 18 annas: 16 annas make a rupee, so it would be 4 rupees 2 annas. A Delhi shopkeeper counts annas in his sleep; the Firangi's agent doesn't.",
          hi: '3 रुपये 18 आने जैसी कोई रक़म नहीं होती: 16 आने का एक रुपया होता है, तो यह 4 रुपये 2 आने होते। दिल्ली का दुकानदार नींद में भी आने गिन लेता है; फ़िरंगी का एजेंट नहीं।',
        },
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
      en: "By the King's order. To the officers and men of any regiment that leaves the English and joins the King's army: every foot soldier shall have 30 rupees a month, and every trooper 50 rupees a month. Come to Delhi without delay.",
      hi: 'बादशाह के हुक्म से। अंग्रेज़ों को छोड़कर बादशाह की फ़ौज में आने वाली हर पलटन के अफ़सरों और सिपाहियों के नाम: हर पैदल सिपाही को 30 रुपये महीना मिलेंगे, और हर सवार को 50 रुपये महीना। बिना देर किए दिल्ली आओ।',
    },
    checks: {
      en: ['every foot soldier shall have 30 rupees a month', 'every trooper 50 rupees a month'],
      hi: ['हर पैदल सिपाही को 30 रुपये महीना', 'हर सवार को 50 रुपये महीना'],
    },
    why: {
      text: {
        en: 'Written for the game from Mainodin\'s account: day by day perwanahs went out from the King to regiments, promising 30 rupees a month to infantry and 50 to cavalry who joined, and the soldiers made their way to Delhi.',
        hi: 'यह मैनुद्दीन के बयान से खेल के लिए लिखा गया है: रोज़ बादशाह की तरफ़ से पलटनों को परवाने जाते थे, जिनमें आ मिलने वाले पैदल सिपाही को 30 रुपये और सवार को 50 रुपये महीने का वादा होता था, और सिपाही दिल्ली चल पड़ते थे।',
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
      en: "By the King's order. To the officers and men of any regiment that leaves the English and joins the King's army: every foot soldier shall have 50 rupees a month, and every trooper 30 rupees a month. Come to Delhi without delay.",
      hi: 'बादशाह के हुक्म से। अंग्रेज़ों को छोड़कर बादशाह की फ़ौज में आने वाली हर पलटन के अफ़सरों और सिपाहियों के नाम: हर पैदल सिपाही को 50 रुपये महीना मिलेंगे, और हर सवार को 30 रुपये महीना। बिना देर किए दिल्ली आओ।',
    },
    checks: {
      en: ['every foot soldier shall have 50 rupees a month', 'every trooper 30 rupees a month'],
      hi: ['हर पैदल सिपाही को 50 रुपये महीना', 'हर सवार को 30 रुपये महीना'],
    },
    tells: [
      {
        kind: 'number',
        factId: 'money',
        explain: {
          en: "The numbers are swapped. The King's perwanahs promised 30 rupees to a foot soldier and 50 to a trooper, who has a horse to feed. A forger who pays the horseman less than the man on foot has never fed a horse.",
          hi: 'रक़में उलट दी गई हैं। बादशाह के परवाने पैदल सिपाही को 30 रुपये और सवार को 50 रुपये का वादा करते थे, क्योंकि सवार को घोड़ा भी पालना होता है। जो जालसाज़ सवार को पैदल से कम दे, उसने कभी घोड़े को दाना नहीं खिलाया।',
        },
        sources: [mh('p.60')],
      },
    ],
  },

  // ── Gates ─────────────────────────────────────────────────────────────────────────
  {
    id: 'pass-real',
    tier: 1,
    real: true,
    pair: 'pass',
    from: { en: 'Agent of the Raja of Ballabhgarh', hi: 'बल्लभगढ़ के राजा का मुख़्तार' },
    to: KING,
    text: {
      en: 'The King! Shelter of the World! Respectfully Sheweth,— That on his departure from this, some time ago, agreeably to your Majesty\'s orders, the Rajah left certain necessary articles here, such as clothes, etc., which he has now sent for. I pray, therefore, that a passport may be granted, to the effect that the carts coming from Ballabhgarh are not to be molested by any one, and that when the things are being sent, the Soldiers at the Delhi Gate are not to oppose any hindrance. (Prayers for the prosperity of the reign.) Petition of the menial slave, Ahmad Ali, confidential Agent of the Rajah of Ballabhgarh. Seal of Ahmad Ali. [The King\'s order:] Mirza Mughal will have the pass made out and given.',
      hi: 'बादशाह सलामत! जहाँपनाह! अर्ज़ है कि— कुछ समय पहले हुज़ूर के हुक्म से जाते वक़्त राजा साहब कुछ ज़रूरी सामान, जैसे कपड़े वग़ैरह, यहाँ छोड़ गए थे, जो अब उन्होंने मँगवाया है। इसलिए गुज़ारिश है कि एक पास दिया जाए कि बल्लभगढ़ से आने वाली गाड़ियों को कोई न छेड़े, और सामान भेजते समय दिल्ली दरवाज़े के सिपाही कोई रुकावट न डालें। (बादशाहत सदा बनी रहे।) अर्ज़ी: अदना ग़ुलाम अहमद अली, बल्लभगढ़ के राजा के भरोसेमंद मुख़्तार की। अहमद अली की मुहर। [बादशाह का हुक्म:] मिर्ज़ा मुग़ल पास बनवाकर दे दें।',
    },
    checks: {
      en: ['the Soldiers at the Delhi Gate', 'Seal of Ahmad Ali'],
      hi: ['दिल्ली दरवाज़े के सिपाही', 'अहमद अली की मुहर'],
    },
    document: { sources: [trial('Petition No. 60, undated, p.32')] },
    why: {
      text: {
        en: "A real, undated petition in the trial papers, with the King's order written on it. Ballabhgarh lies south of Delhi, and its road came in at the Delhi Gate in the south wall.",
        hi: 'यह मुक़दमे के काग़ज़ों में मिली एक असली अर्ज़ी है, जिस पर तारीख़ नहीं है और बादशाह का हुक्म लिखा है। बल्लभगढ़ दिल्ली के दक्षिण में है, और उसकी सड़क दक्षिणी दीवार के दिल्ली दरवाज़े पर पहुँचती थी।',
      },
      sources: [trial('Petition No. 60, undated, p.32'), trial('Petition No. 63, 22 May 1857, p.33'), fanshawe('pp.5-6')],
    },
  },
  {
    id: 'pass-forged',
    tier: 1,
    real: false,
    pair: 'pass',
    from: { en: 'Agent of the Raja of Ballabhgarh', hi: 'बल्लभगढ़ के राजा का मुख़्तार' },
    to: KING,
    text: {
      en: 'The King! Shelter of the World! Respectfully Sheweth,— That on his departure from this, some time ago, agreeably to your Majesty\'s orders, the Rajah left certain necessary articles here, such as clothes, etc., which he has now sent for. I pray, therefore, that a passport may be granted, to the effect that the carts coming from Ballabhgarh are not to be molested by any one, and that when the things are being sent, the Soldiers at the Kashmiri Gate are not to oppose any hindrance. (Prayers for the prosperity of the reign.) Petition of the menial slave, Ahmad Ali, confidential Agent of the Rajah of Ballabhgarh. Seal of Ahmad Ali.',
      hi: 'बादशाह सलामत! जहाँपनाह! अर्ज़ है कि— कुछ समय पहले हुज़ूर के हुक्म से जाते वक़्त राजा साहब कुछ ज़रूरी सामान, जैसे कपड़े वग़ैरह, यहाँ छोड़ गए थे, जो अब उन्होंने मँगवाया है। इसलिए गुज़ारिश है कि एक पास दिया जाए कि बल्लभगढ़ से आने वाली गाड़ियों को कोई न छेड़े, और सामान भेजते समय कश्मीरी दरवाज़े के सिपाही कोई रुकावट न डालें। (बादशाहत सदा बनी रहे।) अर्ज़ी: अदना ग़ुलाम अहमद अली, बल्लभगढ़ के राजा के भरोसेमंद मुख़्तार की। अहमद अली की मुहर।',
    },
    checks: {
      en: ['the Soldiers at the Kashmiri Gate', 'carts coming from Ballabhgarh'],
      hi: ['कश्मीरी दरवाज़े के सिपाही', 'बल्लभगढ़ से आने वाली गाड़ियों'],
    },
    tells: [
      {
        kind: 'place',
        factId: 'gates',
        explain: {
          en: "Carts from Ballabhgarh come up the road from the south to the Delhi Gate. The Kashmiri Gate is in the north wall, on the wrong side of the city. The forger sent the Raja's clothes on a tour of Delhi.",
          hi: 'बल्लभगढ़ की गाड़ियाँ दक्षिण की सड़क से दिल्ली दरवाज़े पर आती हैं। कश्मीरी दरवाज़ा उत्तर की दीवार में है, शहर की उलटी तरफ़। जालसाज़ ने राजा के कपड़ों को पूरी दिल्ली की सैर करा दी।',
        },
        sources: [trial('Petition No. 63, 22 May 1857, p.33'), fanshawe('pp.5-6')],
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
      en: 'Mirza Mughal will post a guard at the Lahore Gate of the city, at the western end of the Chandni Chowk, so that the shops there are not plundered.',
      hi: 'मिर्ज़ा मुग़ल शहर के लाहौरी दरवाज़े पर, चाँदनी चौक के पश्चिमी सिरे पर, पहरा लगाएँ, ताकि वहाँ की दुकानें न लूटी जाएँ।',
    },
    checks: {
      en: ['Lahore Gate of the city', 'western end of the Chandni Chowk'],
      hi: ['शहर के लाहौरी दरवाज़े पर', 'चाँदनी चौक के पश्चिमी सिरे पर'],
    },
    why: {
      text: {
        en: "Written for the game in the style of the King's pencil notes; every detail checks out. The Chandni Chowk runs from the city's Lahore Gate in the west wall to the Fort's own Lahore Gate, and in May a regiment was posted at each.",
        hi: 'यह बादशाह की पेंसिल वाली टिप्पणियों के ढंग में खेल के लिए लिखा गया है; हर बात सही है। चाँदनी चौक पश्चिमी दीवार के शहर वाले लाहौरी दरवाज़े से क़िले के अपने लाहौरी दरवाज़े तक जाता है, और मई में दोनों पर एक-एक पलटन तैनात थी।',
      },
      sources: [fanshawe('pp.5-6'), mh('p.61')],
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
      en: 'Mirza Mughal will post a guard at the Lahore Gate of the Fort, at the western end of the Chandni Chowk where it meets the city wall, so that the shops there are not plundered.',
      hi: 'मिर्ज़ा मुग़ल क़िले के लाहौरी दरवाज़े पर, चाँदनी चौक के पश्चिमी सिरे पर जहाँ वह शहर की दीवार से मिलता है, पहरा लगाएँ, ताकि वहाँ की दुकानें न लूटी जाएँ।',
    },
    checks: {
      en: ['Lahore Gate of the Fort', 'where it meets the city wall'],
      hi: ['क़िले के लाहौरी दरवाज़े पर', 'शहर की दीवार से मिलता है'],
    },
    tells: [
      {
        kind: 'place',
        factId: 'gates',
        explain: {
          en: "Delhi has two Lahore Gates. The one in the city wall, at the western end of the Chandni Chowk, is the city's. The Fort's Lahore Gate stands at the other end of the street. The forger fell into the oldest trap in Delhi.",
          hi: 'दिल्ली में दो लाहौरी दरवाज़े हैं। शहर की दीवार वाला, चाँदनी चौक के पश्चिमी सिरे पर, शहर का है। क़िले का लाहौरी दरवाज़ा उसी सड़क के दूसरे सिरे पर है। जालसाज़ दिल्ली के सबसे पुराने जाल में फँस गया।',
        },
        sources: [fanshawe('pp.5-6')],
      },
    ],
  },

  // ── Form and habit ────────────────────────────────────────────────────────────────
  {
    id: 'chatta-real',
    tier: 2,
    real: true,
    pair: 'chatta',
    from: { en: 'Shopkeepers of the Chatta', hi: 'छत्ता बाज़ार के दुकानदार' },
    to: KING,
    text: {
      en: 'The King! Shelter of the World! Respectfully Sheweth,— That a body of soldiers have taken up their quarters right in front of our shops, and we slaves cannot open them. We pray that the soldiers be moved. (Prayers for the prosperity of the reign.) Petition of the slaves, the shopkeepers of the Chatta. [The King\'s order, in pencil:] Mirza Mughal will have their shops given to these shopkeepers.',
      hi: 'बादशाह सलामत! जहाँपनाह! अर्ज़ है कि— सिपाहियों की एक टोली ने ठीक हमारी दुकानों के सामने डेरा डाल लिया है, और हम ग़ुलाम दुकानें नहीं खोल पाते। गुज़ारिश है कि सिपाहियों को हटाया जाए। (बादशाहत सदा बनी रहे।) अर्ज़ी: ग़ुलाम, छत्ता बाज़ार के दुकानदारों की। [बादशाह का हुक्म, पेंसिल से:] मिर्ज़ा मुग़ल इन दुकानदारों को उनकी दुकानें दिलवा दें।',
    },
    checks: {
      en: ['right in front of our shops', 'Mirza Mughal will have their shops given'],
      hi: ['ठीक हमारी दुकानों के सामने डेरा डाल लिया', 'मिर्ज़ा मुग़ल इन दुकानदारों को उनकी दुकानें दिलवा दें'],
    },
    why: {
      text: {
        en: "Written for the game on the model of a real petition from the Chatta shopkeepers in the trial papers, where the King's pencil note reads just like this. The King's own order of May complains that soldiers had quartered themselves in the palace and the bazaars.",
        hi: 'यह मुक़दमे के काग़ज़ों में छत्ता बाज़ार के दुकानदारों की एक असली अर्ज़ी के नमूने पर खेल के लिए लिखा गया है, जिस पर बादशाह की पेंसिल वाली टिप्पणी ठीक ऐसी ही है। मई के बादशाह के अपने हुक्म में शिकायत है कि सिपाहियों ने महल और बाज़ारों में डेरे डाल लिए थे।',
      },
      sources: [trial("petition of the shopkeepers of the Chatta, with the King's pencil order"), trial(KING_ORDER)],
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
      en: 'The King! Shelter of the World! Respectfully Sheweth,— That a body of soldiers have taken up their quarters right in front of our shops, and we slaves cannot open them. We pray that the soldiers be moved. (Prayers for the prosperity of the reign.) Petition of the slaves, the shopkeepers of the Chatta. [The King\'s reply:] My dear Mirza, kindly see that these good shopkeepers get their shops back. Yours affectionately, Bahadur Shah.',
      hi: 'बादशाह सलामत! जहाँपनाह! अर्ज़ है कि— सिपाहियों की एक टोली ने ठीक हमारी दुकानों के सामने डेरा डाल लिया है, और हम ग़ुलाम दुकानें नहीं खोल पाते। गुज़ारिश है कि सिपाहियों को हटाया जाए। (बादशाहत सदा बनी रहे।) अर्ज़ी: ग़ुलाम, छत्ता बाज़ार के दुकानदारों की। [बादशाह का जवाब:] माई डियर मिर्ज़ा, मेहरबानी करके देख लेना कि इन भले दुकानदारों को दुकानें वापस मिल जाएँ। योर्स अफ़ेक्शनेटली, बहादुर शाह।',
    },
    checks: {
      en: ['My dear Mirza', 'Yours affectionately'],
      hi: ['माई डियर मिर्ज़ा', 'योर्स अफ़ेक्शनेटली'],
    },
    tells: [
      {
        kind: 'habit',
        sources: [trial("petition of the shopkeepers of the Chatta, with the King's pencil order")],
        explain: {
          en: "The King's notes on petitions are short orders: 'Mirza Mughal will have their shops given to these shopkeepers.' No 'My dear', no 'Yours affectionately'. That is an English letter wearing a Mughal turban.",
          hi: "अर्ज़ियों पर बादशाह की टिप्पणियाँ छोटे हुक्म होती हैं: 'मिर्ज़ा मुग़ल इन दुकानदारों को उनकी दुकानें दिलवा दें।' न 'माई डियर', न 'योर्स अफ़ेक्शनेटली'। यह मुग़ली पगड़ी पहने एक अंग्रेज़ी चिट्ठी है।",
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
      en: "The King! Shelter of the World! Respectfully Sheweth,— That the soldiers enter and plunder the houses of the people on the false plea that Europeans are hidden there. They obey no one who is not a soldier. I pray that your Majesty's orders, under the royal seal, be sent to their officers. (Prayers for the prosperity of the reign.) Petition of the slave, Kazi Faiz Ulla, Kotwal of the city. Seal of Kazi Faiz Ulla.",
      hi: 'बादशाह सलामत! जहाँपनाह! अर्ज़ है कि— सिपाही यह झूठा बहाना बनाकर लोगों के घरों में घुसते और लूटते हैं कि वहाँ यूरोपियन छिपे हैं। वे सिपाही के सिवा किसी की नहीं सुनते। गुज़ारिश है कि हुज़ूर का हुक्म, शाही मुहर के साथ, उनके अफ़सरों को भेजा जाए। (बादशाहत सदा बनी रहे।) अर्ज़ी: ग़ुलाम क़ाज़ी फ़ैज़ुल्ला, शहर के कोतवाल की। क़ाज़ी फ़ैज़ुल्ला की मुहर।',
    },
    checks: {
      en: ['on the false plea that Europeans are hidden there', 'Seal of Kazi Faiz Ulla'],
      hi: ['झूठा बहाना बनाकर', 'क़ाज़ी फ़ैज़ुल्ला की मुहर'],
    },
    why: {
      text: {
        en: "Written for the game; every detail checks out. Kazi Faiz Ulla was the city's chief police officer in May. The King's own order complains that soldiers plundered houses 'on the false plea that they have concealed Europeans', and Mainodin says the sepoys recognised no authority that was not military.",
        hi: "यह खेल के लिए लिखा गया है; हर बात सही है। मई में क़ाज़ी फ़ैज़ुल्ला शहर के सबसे बड़े पुलिस अफ़सर थे। बादशाह का अपना हुक्म शिकायत करता है कि सिपाही 'यूरोपियन छिपाने के झूठे बहाने' से घर लूटते थे, और मैनुद्दीन लिखते हैं कि सिपाही फ़ौजी के सिवा किसी का हुक्म नहीं मानते थे।",
      },
      sources: [trial(CHUNI_19_20), trial(KING_ORDER), mh('p.58')],
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
      en: "The King! Shelter of the World! Respectfully Sheweth,— That the soldiers enter and plunder the houses of the people on the false plea that Europeans are hidden there. They obey no one who is not a soldier. I pray that your Majesty's orders, under the royal seal, be sent to their officers. I have the honour to be, Sir, your Majesty's most obedient servant, Faiz Ulla.",
      hi: 'बादशाह सलामत! जहाँपनाह! अर्ज़ है कि— सिपाही यह झूठा बहाना बनाकर लोगों के घरों में घुसते और लूटते हैं कि वहाँ यूरोपियन छिपे हैं। वे सिपाही के सिवा किसी की नहीं सुनते। गुज़ारिश है कि हुज़ूर का हुक्म, शाही मुहर के साथ, उनके अफ़सरों को भेजा जाए। आई हैव द ऑनर टू बी, सर, योर मेजेस्टीज़ मोस्ट ओबीडिएंट सर्वेंट, फ़ैज़ुल्ला।',
    },
    checks: {
      en: ['I have the honour to be, Sir', 'most obedient servant'],
      hi: ['आई हैव द ऑनर टू बी, सर', 'मोस्ट ओबीडिएंट सर्वेंट'],
    },
    tells: [
      {
        kind: 'habit',
        sources: [trial('petitions, e.g. Nos. 60-68, pp.32-35')],
        explain: {
          en: "That is how an English clerk ends a letter to his Collector, not how a Kotwal ends a petition to the King. Real petitions close 'Petition of the slave…', usually with the petitioner's seal.",
          hi: "ऐसे तो कोई अंग्रेज़ बाबू अपने कलेक्टर को चिट्ठी ख़त्म करता है, कोतवाल बादशाह को अर्ज़ी नहीं। असली अर्ज़ियाँ 'अर्ज़ी: ग़ुलाम … की' पर ख़त्म होती हैं, अक्सर अर्ज़ी देने वाले की मुहर के साथ।",
        },
      },
    ],
  },

  // ── Weekday ───────────────────────────────────────────────────────────────────────
  {
    id: 'daily-report-real',
    tier: 2,
    real: true,
    pair: 'daily-report',
    from: { en: 'Palace news-writer', hi: 'महल का अख़बार-नवीस' },
    to: OFFICE,
    text: {
      en: 'Report for {weekday}, {date}. The King came from his private apartments into the Hall of Special Audience and held his court. Nobles and officers presented nazars of gold mohurs and rupees. The soldiers again asked for their pay.',
      hi: '{weekday}, {date} की रिपोर्ट। बादशाह अपने ख़ास महल से दीवान-ए-ख़ास में आए और दरबार लगाया। अमीरों और अफ़सरों ने सोने की मोहरों और रुपयों की नज़रें पेश कीं। सिपाहियों ने फिर अपनी तनख़्वाह माँगी।',
    },
    checks: {
      en: ['Report for', 'held his court'],
      hi: ['की रिपोर्ट', 'दरबार लगाया'],
    },
    why: {
      text: {
        en: 'Written for the game; every detail checks out. The date and weekday agree, the soldiers made the King hold a darbar every day, nazars of gold mohurs and rupees were presented at it, and the troops kept demanding pay.',
        hi: 'यह खेल के लिए लिखा गया है; हर बात सही है। तारीख़ और दिन मेल खाते हैं, सिपाहियों ने बादशाह से रोज़ दरबार लगवाया, उसमें सोने की मोहरों और रुपयों की नज़रें पेश होती थीं, और फ़ौज बार-बार तनख़्वाह माँगती थी।',
      },
      sources: [mh('p.60'), trial(CHUNI_18), jl('pp.100, 105')],
    },
  },
  {
    id: 'daily-report-forged',
    tier: 2,
    real: false,
    pair: 'daily-report',
    from: { en: 'Palace news-writer', hi: 'महल का अख़बार-नवीस' },
    to: OFFICE,
    text: {
      en: 'Report for {weekday+1}, {date}. The King came from his private apartments into the Hall of Special Audience and held his court. Nobles and officers presented nazars of gold mohurs and rupees. The soldiers again asked for their pay.',
      hi: '{weekday+1}, {date} की रिपोर्ट। बादशाह अपने ख़ास महल से दीवान-ए-ख़ास में आए और दरबार लगाया। अमीरों और अफ़सरों ने सोने की मोहरों और रुपयों की नज़रें पेश कीं। सिपाहियों ने फिर अपनी तनख़्वाह माँगी।',
    },
    checks: {
      en: ['Report for', 'held his court'],
      hi: ['की रिपोर्ट', 'दरबार लगाया'],
    },
    tells: [
      {
        kind: 'weekday',
        factId: 'calendar',
        explain: {
          en: 'The weekday is one day off. Count from Sunday 17 May. A palace news-writer who lost track of the days would not keep his post for a week.',
          hi: 'दिन एक आगे खिसका हुआ है। रविवार 17 मई से गिनिए। जो अख़बार-नवीस दिन ही भूल जाए, वह हफ़्ता भर भी नौकरी पर नहीं टिकता।',
        },
      },
    ],
  },

  // ── Rumours ───────────────────────────────────────────────────────────────────────
  {
    id: 'ambala-real',
    tier: 2,
    real: true,
    pair: 'rumour',
    from: { en: 'News-writer', hi: 'अख़बार-नवीस' },
    to: OFFICE,
    text: {
      en: 'It is reported that English troops are coming from Ambala. Nothing more is known for certain; otherwise everything is quiet.',
      hi: 'ख़बर है कि अंग्रेज़ी फ़ौजें अंबाला से आ रही हैं। पक्का कुछ और पता नहीं; बाक़ी सब शांत है।',
    },
    checks: {
      en: ['troops are coming from Ambala', 'Nothing more is known for certain'],
      hi: ['अंबाला से आ रही हैं', 'पक्का कुछ और पता नहीं'],
    },
    why: {
      text: {
        en: "Written for the game in the words of Chuni Lal's news diary for 17 May: 'It is reported that troops are coming from Ambala: otherwise everything is quiet.' A rumour honestly labelled as a rumour, and the English force did gather at Ambala and move down by Karnal.",
        hi: "यह 17 मई की चुन्नी लाल की डायरी के शब्दों में खेल के लिए लिखा गया है: 'ख़बर है कि फ़ौजें अंबाला से आ रही हैं; बाक़ी सब शांत है।' अफ़वाह को ईमानदारी से अफ़वाह ही बताया गया है, और अंग्रेज़ी फ़ौज सच में अंबाला में जमा होकर करनाल के रास्ते बढ़ी।",
      },
      sources: [trial(CHUNI_17), jl('p.107')],
    },
  },
  {
    id: 'persian-forged',
    tier: 2,
    real: false,
    pair: 'rumour',
    from: { en: 'News-writer', hi: 'अख़बार-नवीस' },
    to: OFFICE,
    text: {
      en: 'It is certain: a Persian army of 50,000 men has crossed the Attock and will be at Delhi within the month. The English are finished.',
      hi: 'यह पक्की ख़बर है: 50,000 सिपाहियों की ईरानी फ़ौज अटक पार कर चुकी है और महीने भर में दिल्ली पहुँच जाएगी। अंग्रेज़ों का खेल ख़त्म।',
    },
    checks: {
      en: ['It is certain', 'a Persian army of 50,000 men'],
      hi: ['यह पक्की ख़बर है', '50,000 सिपाहियों की ईरानी फ़ौज'],
    },
    tells: [
      {
        kind: 'knowledge',
        sources: [trial("'Authentic News', 23 March 1857, and Delhi newspapers of August-September 1857, c. pp.128-31")],
        explain: {
          en: "No Persian army was coming. In March a forged 'proclamation of the King of Persia' on the Jama Masjid had promised one, and later that summer the Delhi papers printed the Persians at Kandahar, then 50,000 strong, then at Attock, while saying they did not believe it themselves. 'It is certain' is the giveaway; see the rulebook.",
          hi: "कोई ईरानी फ़ौज नहीं आ रही थी। मार्च में जामा मस्जिद पर 'ईरान के बादशाह का' एक जाली ऐलान ऐसा ही वादा कर चुका था, और उसी गर्मी में बाद में दिल्ली के अख़बारों ने ईरानियों को पहले कंधार, फिर 50,000 की तादाद में, फिर अटक पर छापा, पर साथ में लिखा कि वे ख़ुद इस पर यक़ीन नहीं करते। 'पक्की ख़बर' ही पोल खोलती है; नियमों की किताब देखिए।",
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
      en: 'The English at Meerut have gathered in their entrenchment with their wives and children, and have mounted guns. The road to Meerut is not safe for our messengers.',
      hi: 'मेरठ के अंग्रेज़ अपनी बीवियों और बच्चों के साथ अपने मोर्चे में इकट्ठा हो गए हैं और तोपें चढ़ा रखी हैं। मेरठ का रास्ता हमारे हरकारों के लिए सुरक्षित नहीं है।',
    },
    checks: {
      en: ['gathered in their entrenchment', 'mounted guns'],
      hi: ['अपने मोर्चे में इकट्ठा', 'तोपें चढ़ा रखी हैं'],
    },
    why: {
      text: {
        en: "Written for the game; every detail checks out. Chuni Lal's diary for 17 and 18 May reports the English at Meerut gathered in an entrenchment with guns and their families, and the King's messengers robbed on the road.",
        hi: 'यह खेल के लिए लिखा गया है; हर बात सही है। 17 और 18 मई की चुन्नी लाल की डायरी बताती है कि मेरठ के अंग्रेज़ परिवारों और तोपों के साथ एक मोर्चे में जमा थे, और बादशाह के हरकारे रास्ते में लूटे गए।',
      },
      sources: [trial(CHUNI_17), trial(CHUNI_18), jl('p.106')],
    },
  },
  {
    id: 'ridge-forged',
    tier: 3,
    real: false,
    pair: 'english-camp',
    from: DARBAR_REPORT,
    to: OFFICE,
    text: {
      en: "The English have come out of Meerut and Ambala and now hold the Ridge outside the Kashmiri Gate, with guns at Hindu Rao's house. They will storm the city within the week.",
      hi: 'अंग्रेज़ मेरठ और अंबाला से निकल आए हैं और अब कश्मीरी दरवाज़े के बाहर रिज (पहाड़ी) पर जमे हैं, हिंदू राव के मकान पर तोपें लगाकर। हफ़्ते भर में वे शहर पर धावा बोलेंगे।',
    },
    checks: {
      en: ['now hold the Ridge outside the Kashmiri Gate', "guns at Hindu Rao's house"],
      hi: ['रिज (पहाड़ी) पर जमे हैं', 'हिंदू राव के मकान पर तोपें'],
    },
    tells: [
      {
        kind: 'knowledge',
        factId: 'english-force',
        explain: {
          en: 'In May the English force was still gathering at Ambala, Karnal and Meerut. It took the Ridge only on 8 June, after beating the rebels at Badli-ki-Serai, and did not storm Delhi until 14 September. The forger is reading next month\'s news.',
          hi: 'मई में अंग्रेज़ी फ़ौज अभी अंबाला, करनाल और मेरठ में जमा हो रही थी। रिज पर उसने 8 जून को ही क़ब्ज़ा किया, बादली की सराय में बाग़ियों को हराने के बाद, और दिल्ली पर धावा 14 सितंबर को बोला। जालसाज़ अगले महीने का अख़बार पढ़ रहा है।',
        },
        sources: [sen('p.79'), sen('pp.105-07')],
      },
    ],
  },
  {
    id: 'intercept-real',
    tier: 3,
    real: true,
    pair: 'intercept',
    from: { en: 'Seized at the bridge of boats', hi: 'नावों के पुल पर पकड़ी गई' },
    to: { en: 'Addressee torn off', hi: 'पता फटा हुआ' },
    text: {
      en: '(In English.) Sir, the 3rd Light Cavalry and the 11th and 20th Native Infantry rose at Meerut on Sunday the 10th and are now at Delhi, with the 38th, 54th and 74th. The Commander-in-Chief must be told at once. I send this by a trusted hand.',
      hi: '(अंग्रेज़ी में।) सर, तीसरी घुड़सवार पलटन और 11वीं व 20वीं पैदल पलटनें 10 तारीख़, रविवार को मेरठ में बग़ावत कर चुकी हैं और अब दिल्ली में हैं, 38वीं, 54वीं और 74वीं के साथ। कमांडर-इन-चीफ़ को फ़ौरन ख़बर दी जाए। यह चिट्ठी एक भरोसेमंद आदमी के हाथ भेज रहा हूँ।',
    },
    checks: {
      en: ['rose at Meerut on Sunday the 10th', 'The Commander-in-Chief must be told'],
      hi: ['10 तारीख़, रविवार को मेरठ में', 'कमांडर-इन-चीफ़ को फ़ौरन ख़बर दी जाए'],
    },
    why: {
      text: {
        en: 'Written for the game. It reads like a trap, but every detail is right: the regiments, Sunday 10 May, and the Commander-in-Chief (General Anson). On 17 May a man really was seized at the bridge carrying a letter from a European at Meerut.',
        hi: 'यह खेल के लिए लिखा गया है। पढ़ने में जाल लगता है, पर हर बात सही है: पलटनें, रविवार 10 मई, और कमांडर-इन-चीफ़ (जनरल एंसन)। 17 मई को सच में पुल पर एक आदमी पकड़ा गया था, जिसके पास मेरठ के किसी यूरोपियन की चिट्ठी थी।',
      },
      sources: [trial(CHUNI_17), sen('pp.59-62'), mh('p.53'), majumdar('p.71')],
    },
  },
  {
    id: 'intercept-forged',
    tier: 3,
    real: false,
    pair: 'intercept',
    from: { en: 'Seized at the bridge of boats', hi: 'नावों के पुल पर पकड़ी गई' },
    to: { en: 'Addressee torn off', hi: 'पता फटा हुआ' },
    text: {
      en: '(In English.) Sir, the 3rd Light Cavalry and the 11th and 20th Native Infantry rose at Meerut on Sunday the 10th and are now at Delhi, with the 38th, 54th and 74th. His Excellency the Viceroy, Lord Canning, must be told at once. I send this by a trusted hand.',
      hi: '(अंग्रेज़ी में।) सर, तीसरी घुड़सवार पलटन और 11वीं व 20वीं पैदल पलटनें 10 तारीख़, रविवार को मेरठ में बग़ावत कर चुकी हैं और अब दिल्ली में हैं, 38वीं, 54वीं और 74वीं के साथ। हिज़ एक्सीलेंसी वायसराय लॉर्ड कैनिंग को फ़ौरन ख़बर दी जाए। यह चिट्ठी एक भरोसेमंद आदमी के हाथ भेज रहा हूँ।',
    },
    checks: {
      en: ['the Viceroy, Lord Canning', 'rose at Meerut on Sunday the 10th'],
      hi: ['वायसराय लॉर्ड कैनिंग', '10 तारीख़, रविवार को मेरठ में'],
    },
    tells: [
      {
        kind: 'anachronism',
        factId: 'officials',
        explain: {
          en: "In 1857 Lord Canning is Governor-General. 'Viceroy' came only after the Crown took India over from the Company, proclaimed on 1 November 1858. No English officer in May 1857 would promote his chief eighteen months early.",
          hi: "1857 में लॉर्ड कैनिंग गवर्नर-जनरल हैं। 'वायसराय' का ओहदा तब आया जब ताज ने कंपनी से हिंदुस्तान ले लिया, जिसका ऐलान 1 नवंबर 1858 को हुआ। मई 1857 का कोई अंग्रेज़ अफ़सर अपने बड़े साहब को अठारह महीने पहले तरक़्क़ी नहीं देगा।",
        },
        sources: [majumdar('p.71'), sen('p.356')],
      },
    ],
  },

  // ── Knowledge tells and genuine papers that look suspicious ───────────────────────
  {
    id: 'bakht-khan-forged',
    tier: 3,
    real: false,
    pair: 'drum',
    from: { en: 'Drum proclamation', hi: 'ढिंढोरा' },
    to: PEOPLE,
    text: {
      en: 'Proclaimed by beat of drum, by order of General Bakht Khan: every shopkeeper is to keep arms, and any soldier caught plundering will have his arm cut off.',
      hi: 'ढोल पीटकर ऐलान, जनरल बख़्त ख़ान के हुक्म से: हर दुकानदार हथियार रखे, और लूटते पकड़े गए सिपाही का हाथ काट दिया जाएगा।',
    },
    checks: {
      en: ['by order of General Bakht Khan', 'every shopkeeper is to keep arms'],
      hi: ['जनरल बख़्त ख़ान के हुक्म से', 'हर दुकानदार हथियार रखे'],
    },
    tells: [
      {
        kind: 'anachronism',
        factId: 'bakht-khan',
        explain: {
          en: 'A real order, about six weeks early. Bakht Khan had it drummed through the city on 2 July, the day he took command after arriving with the Bareilly brigade. In May he was still at Bareilly, and the Commander-in-Chief was Mirza Mughal.',
          hi: 'हुक्म असली है, बस लगभग छह हफ़्ते पहले आ गया। बख़्त ख़ान ने यह ऐलान 2 जुलाई को करवाया, जिस दिन बरेली ब्रिगेड के साथ पहुँचकर उन्होंने कमान सँभाली। मई में वे अभी बरेली में थे, और कमांडर-इन-चीफ़ मिर्ज़ा मुग़ल थे।',
        },
        sources: [jl('pp.133-35'), sen('p.83')],
      },
    ],
  },
  {
    id: 'baqir-real',
    tier: 3,
    real: true,
    pair: 'baqir',
    from: { en: "Note for the King's office", hi: 'बादशाह के दफ़्तर के लिए नोट' },
    to: MUNSHI,
    text: {
      en: 'On Sunday 17 May, when news came that the Gurgaon revenue was attacked on the road, Maulvi Muhammad Baqir, of the press, was directed to go out at once with two companies of infantry and one troop of cavalry to bring the treasure in safely.',
      hi: 'रविवार 17 मई को, जब ख़बर आई कि गुड़गाँव का लगान रास्ते में लूटा जा रहा है, तब प्रेस वाले मौलवी मुहम्मद बाक़र को हुक्म हुआ कि फ़ौरन पैदल फ़ौज की दो कंपनियाँ और घुड़सवारों का एक दस्ता लेकर ख़ज़ाना सही-सलामत ले आएँ।',
    },
    checks: {
      en: ['Maulvi Muhammad Baqir, of the press', 'On Sunday 17 May'],
      hi: ['प्रेस वाले मौलवी मुहम्मद बाक़र', 'रविवार 17 मई को'],
    },
    why: {
      text: {
        en: "It sounds odd for a newspaper man to lead troops, but Chuni Lal's diary says exactly this for Sunday 17 May, and Jiwan Lal records the same rescue party.",
        hi: 'अख़बार वाले का फ़ौज लेकर जाना अजीब लगता है, पर रविवार 17 मई के लिए चुन्नी लाल की डायरी में ठीक यही लिखा है, और जीवन लाल भी इसी मदद के दस्ते का ज़िक्र करते हैं।',
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
      en: 'On Monday 17 May, when news came that the Gurgaon revenue was attacked on the road, Maulvi Muhammad Baqir, of the press, was directed to go out at once with two companies of infantry and one troop of cavalry to bring the treasure in safely.',
      hi: 'सोमवार 17 मई को, जब ख़बर आई कि गुड़गाँव का लगान रास्ते में लूटा जा रहा है, तब प्रेस वाले मौलवी मुहम्मद बाक़र को हुक्म हुआ कि फ़ौरन पैदल फ़ौज की दो कंपनियाँ और घुड़सवारों का एक दस्ता लेकर ख़ज़ाना सही-सलामत ले आएँ।',
    },
    checks: {
      en: ['On Monday 17 May', 'Maulvi Muhammad Baqir, of the press'],
      hi: ['सोमवार 17 मई को', 'प्रेस वाले मौलवी मुहम्मद बाक़र'],
    },
    tells: [
      {
        kind: 'weekday',
        factId: 'calendar',
        explain: {
          en: "17 May 1857 was a Sunday, your first day at this desk. Everything else here is true, which is just how the Firangi likes it: one wrong day in a page of facts.",
          hi: '17 मई 1857 रविवार था, इस मेज़ पर आपका पहला दिन। बाक़ी सब सच है, और फ़िरंगी को यही पसंद है: सच्ची बातों के पन्ने में एक ग़लत दिन।',
        },
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
      en: 'Proclamation: the King offers a reward of 10,000 rupees for the capture of Sir Theophilus Metcalfe.',
      hi: 'ऐलान: सर थियोफ़िलस मेटकाफ़ को पकड़वाने वाले को बादशाह 10,000 रुपये इनाम देंगे।',
    },
    checks: {
      en: ['10,000 rupees', 'Sir Theophilus Metcalfe'],
      hi: ['10,000 रुपये', 'सर थियोफ़िलस मेटकाफ़'],
    },
    why: {
      text: {
        en: "It looks like a forger's trap, but Mainodin, who was secretly helping Metcalfe get away, records this reward of 10,000 rupees. Jiwan Lal calls the same man 'Sir John Metcalfe'.",
        hi: "यह जालसाज़ का जाल लगता है, पर मैनुद्दीन, जो चुपके से मेटकाफ़ को भगाने में मदद कर रहे थे, 10,000 रुपये के इसी इनाम का ज़िक्र करते हैं। जीवन लाल इसी आदमी को 'सर जॉन मेटकाफ़' कहते हैं।",
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
      en: 'Proclamation: the King offers a reward of 10,000 rupees for the capture of Mr. Simon Fraser, the Commissioner.',
      hi: 'ऐलान: कमिश्नर मिस्टर साइमन फ़्रेज़र को पकड़वाने वाले को बादशाह 10,000 रुपये इनाम देंगे।',
    },
    checks: {
      en: ['10,000 rupees', 'Mr. Simon Fraser, the Commissioner'],
      hi: ['10,000 रुपये', 'कमिश्नर मिस्टर साइमन फ़्रेज़र'],
    },
    tells: [
      {
        kind: 'knowledge',
        factId: 'may-11',
        explain: {
          en: 'Simon Fraser, the Commissioner, had been killed at the palace gate on 11 May. The real reward of 10,000 rupees was for Sir Theophilus Metcalfe, who had escaped. The forger is hunting the wrong man.',
          hi: 'कमिश्नर साइमन फ़्रेज़र 11 मई को महल के दरवाज़े पर मारे जा चुके थे। 10,000 रुपये का असली इनाम सर थियोफ़िलस मेटकाफ़ के लिए था, जो भाग निकले थे। जालसाज़ ग़लत आदमी को ढूँढ रहा है।',
        },
        sources: [jl('pp.80-81'), mh('p.57')],
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
      en: 'On Sunday 17 May, missives went out by troopers to Maharaja Narendra Singh of Patiala, Raja Ram Singh of Jaipur, the Raja of Alwar and the Rajas of Jodhpur, Kotah and Bundi, calling them to come to the King at once.',
      hi: 'रविवार 17 मई को सवारों के हाथ ख़त भेजे गए: पटियाला के महाराजा नरेंद्र सिंह, जयपुर के राजा राम सिंह, अलवर के राजा और जोधपुर, कोटा और बूँदी के राजाओं को, कि वे फ़ौरन बादशाह के पास आएँ।',
    },
    checks: {
      en: ['Maharaja Narendra Singh of Patiala', 'calling them to come to the King at once'],
      hi: ['पटियाला के महाराजा नरेंद्र सिंह', 'फ़ौरन बादशाह के पास आएँ'],
    },
    why: {
      text: {
        en: "Chuni Lal's news diary for 17 May lists exactly these missives. Summoning Patiala looks odd, but the King wrote to every chief he could. Patiala never replied.",
        hi: '17 मई की चुन्नी लाल की डायरी में ठीक यही ख़त गिनाए गए हैं। पटियाला को बुलाना अजीब लगता है, पर बादशाह ने हर उस सरदार को लिखा जिसे लिख सकते थे। पटियाला ने कभी जवाब नहीं दिया।',
      },
      sources: [trial(CHUNI_17), majumdar('p.126')],
    },
  },
  {
    id: 'patiala-forged',
    tier: 3,
    real: false,
    pair: 'patiala',
    from: DARBAR_REPORT,
    to: OFFICE,
    text: {
      en: 'Good news for the darbar: Maharaja Narendra Singh of Patiala has come to Delhi in person with his army and presented a nazar of gold mohurs. He will fight for the King.',
      hi: 'दरबार के लिए ख़ुशख़बरी: पटियाला के महाराजा नरेंद्र सिंह ख़ुद अपनी फ़ौज लेकर दिल्ली आ गए हैं और सोने की मोहरों की नज़र पेश की है। वे बादशाह के लिए लड़ेंगे।',
    },
    checks: {
      en: ['has come to Delhi in person with his army', 'He will fight for the King'],
      hi: ['ख़ुद अपनी फ़ौज लेकर दिल्ली आ गए हैं', 'वे बादशाह के लिए लड़ेंगे'],
    },
    tells: [
      {
        kind: 'knowledge',
        explain: {
          en: "Patiala went the other way. Within eighteen hours of the English call the Maharaja was camped near Ambala, and on 19 May the court heard he had joined the English. He never even answered the King's letters. The only Patiala prince in Delhi was his brother, Kunwar Ajit Singh, who was on bad terms with him.",
          hi: 'पटियाला उलटी तरफ़ गया। अंग्रेज़ों के बुलाने के अठारह घंटे के अंदर महाराजा अंबाला के पास डेरा डाले बैठे थे, और 19 मई को दरबार को ख़बर मिली कि वे अंग्रेज़ों से जा मिले हैं। उन्होंने बादशाह की चिट्ठियों का जवाब तक नहीं दिया। दिल्ली में पटियाला का अकेला राजकुमार उनका भाई कुँवर अजीत सिंह था, जिसकी उनसे बनती नहीं थी।',
        },
        sources: [caveBrowne('p.190'), jl('p.97'), majumdar('p.126')],
      },
    ],
  },
]

export const messages: Message[] = [...eventMessages, ...datelessMessages]
