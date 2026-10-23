import type { L10n, Message } from '../../types.js'

// Window: Tuesday 2 April (day 1) to Monday 15 April 1929 (day 14).
// Day 5 = Sat 6 Apr, day 6 = Sun 7 Apr, day 7 = Mon 8 Apr, day 8 = Tue 9 Apr,
// day 9 = Wed 10 Apr, day 10 = Thu 11 Apr, day 11 = Fri 12 Apr, day 14 = Mon 15 Apr.
// Messages without onDay must hold true on every day of the window, so they never
// mention the Assembly action or the raid. Tells a player can only catch through a
// rulebook rule carry ruleId, so the engine never shows them (or their twin) earlier.

const POST_BOX: L10n = { en: 'Post box', hi: 'पोस्ट बॉक्स' }
const PUBLIC: L10n = { en: 'The public', hi: 'आम जनता' }
const VILLAGER: L10n = { en: 'Villager', hi: 'विलेजर' }
const SWAMI: L10n = { en: 'Swami', hi: 'स्वामी' }
const DYAL: L10n = { en: 'Dyal', hi: 'दयाल' }
const PANDITJI: L10n = { en: 'Panditji', hi: 'पंडितजी' }
const BC: L10n = { en: 'B.C.', hi: 'बी.सी.' }
const BALRAJ_CIC: L10n = { en: 'Balraj, Commander-in-Chief', hi: 'बलराज, कमांडर-इन-चीफ़' }

const SCHEDULE = { id: 'noorani-1996', loc: 'Ordinance No. III of 1930, Schedule, pp. 295–296' }
const KEYS_EVIDENCE = { id: 'noorani-1996', loc: "ch. 'Trial by Tribunal', pp. 141–142 (Jai Gopal's evidence)" }
const SAUNDERS_CH = { id: 'noorani-1996', loc: "ch. 'Saunders Murder', pp. 19–25" }
const IRWIN_PINK = { id: 'noorani-1996', loc: 'p. 45, Irwin to the Secretary of State, 19 April 1929' }
const ASSEMBLY_CH = { id: 'noorani-1996', loc: "ch. 'Bombs in the Central Assembly', pp. 43–44" }
const RAID_CH = { id: 'noorani-1996', loc: "ch. 'Hour of Trial', pp. 57–64" }
const GHOSH = { id: 'ghosh-1945', loc: 'pp. 34–35' }

const NOTICE_DEC_EN = (sig: string) =>
  `HINDUSTAN SOCIALIST REPUBLICAN ARMY. NOTICE. J.P. Saunders is dead; Lala Lajpat Rai is avenged … Beware, Ye Tyrants; Beware … Sorry for the death of a man. But in this man has died the representative of an institution which is so cruel, lowly and so base that it must be abolished … 'Long Live The Revolution'! Sd/- ${sig}, Dated 18th December, 1928.`
const NOTICE_DEC_HI = (sig: string) =>
  `हिंदुस्तान सोशलिस्ट रिपब्लिकन आर्मी। नोटिस। जे.पी. सॉन्डर्स मर गया; लाला लाजपत राय का बदला ले लिया गया … ज़ालिमो, सावधान; सावधान … एक इंसान की मौत का हमें अफ़सोस है। पर इस इंसान के साथ उस व्यवस्था का एक नुमाइंदा मरा है जो इतनी क्रूर, नीच और घटिया है कि उसे मिटा देना ही चाहिए … 'इंक़लाब ज़िंदाबाद'! दस्तख़त: ${sig}, तारीख़ 18 दिसंबर 1928।`

const NOTICE_23_EN = (about: string) =>
  `The Hindustan Socialist Republican Army. Notice. No more secrets No more Special Guess. About ${about} of 17 December. JP Saunders is dead! Lala Lajpat Rai is avenged!! Under the rules and regulations of the H.S.R.A. (Rule 10 B.R.C) it is hereby notified that it was retaliatory action of none but a direct political nature … everybody is hereby requested to abstain from offering any sort of assistance to our enemy the police in finding out our clues. Anybody acting contrary will be severely dealt with. Long Live Revolution. Balraj, Commander-in-chief.`
const NOTICE_23_HI = (about: string) =>
  `हिंदुस्तान सोशलिस्ट रिपब्लिकन आर्मी। नोटिस। अब कोई राज़ नहीं, अब कोई 'स्पेशल गेस' नहीं। 17 दिसंबर की ${about} के बारे में। जे.पी. सॉन्डर्स मर गया! लाला लाजपत राय का बदला ले लिया गया!! एच.एस.आर.ए. के नियमों (रूल 10 बी.आर.सी.) के तहत बताया जाता है कि यह सीधे-सीधे राजनीतिक बदले की कार्रवाई थी … सबसे गुज़ारिश है कि हमारी दुश्मन पुलिस को हमारे सुराग़ ढूँढने में कोई मदद न दें। जो इसके ख़िलाफ़ चलेगा, उससे सख़्ती से निपटा जाएगा। इंक़लाब ज़िंदाबाद। बलराज, कमांडर-इन-चीफ़।`

const LEAFLET_EN = (heading: string) =>
  `${heading} (NOTICE). It takes a loud voice to make the deaf hear … the Government is thrusting upon us new repressive measures like the Public Safety and the Trade Disputes Bill … Let the representatives of the people return to their constituencies and prepare the masses for the coming revolution … it is easy to kill individuals but you cannot kill the ideas … Long Live the Revolution. Signed, Balraj, Commander-in-Chief.`
const LEAFLET_HI = (heading: string) =>
  `${heading} (नोटिस)। बहरों को सुनाने के लिए ऊँची आवाज़ चाहिए … सरकार पब्लिक सेफ़्टी बिल और ट्रेड डिस्प्यूट्स बिल जैसे नए ज़ुल्मी क़ानून हम पर थोप रही है … जनता के चुने हुए लोग अपने इलाक़ों में लौटें और लोगों को आने वाली क्रांति के लिए तैयार करें … इंसानों को मारना आसान है, पर विचारों को कोई नहीं मार सकता … इंक़लाब ज़िंदाबाद। दस्तख़त: बलराज, कमांडर-इन-चीफ़।`

const TRIBUNE_EN =
  "Cutting from The Tribune: 'Two young men, one a Punjabi and the other a Bengali entered the Legislative Assembly, dropped Red leaflets, threw bombs and fired pistols. They were arrested.'"
const TRIBUNE_HI =
  "द ट्रिब्यून की कतरन: 'दो नौजवान, एक पंजाबी और दूसरा बंगाली, लेजिस्लेटिव असेंबली में घुसे, लाल पर्चे गिराए, बम फेंके और पिस्तौलें चलाईं। उन्हें गिरफ़्तार कर लिया गया।'"

export const messages: Message[] = [
  // ───────────── Tier 1: catchable from the case file ─────────────

  {
    id: 'lh-keys-bag-g',
    tier: 1,
    real: true,
    pair: 'lh-keys-bag',
    from: VILLAGER,
    to: POST_BOX,
    text: {
      en: 'A zinc handbag will reach you tonight. Keep it under your cot. Hand it only to the person who shows the two keys. — Villager',
      hi: 'आज रात तुम्हारे पास जस्ते का एक हैंडबैग पहुँचेगा। उसे अपनी चारपाई के नीचे रखो। उसे सिर्फ़ उसी को देना जो दोनों चाबियाँ दिखाए। — विलेजर',
    },
    checks: { en: ['zinc handbag', 'two keys', 'Villager'], hi: ['जस्ते का एक हैंडबैग', 'दोनों चाबियाँ', 'विलेजर'] },
    why: {
      text: {
        en: "Villager was one of Sukhdev's party names. The keys come from the record: Jai Gopal told the court that Sukhdev once left a zinc handbag with him, showed him two keys, and said to hand it only 'to the person who showed the said keys'.",
        hi: "'विलेजर' सुखदेव का एक पार्टी नाम था। चाबियों वाली बात रिकॉर्ड में है: जयगोपाल ने अदालत में बताया कि सुखदेव ने एक बार उसे जस्ते का हैंडबैग देकर दो चाबियाँ दिखाईं, और कहा कि बैग सिर्फ़ उसी को देना जो ये चाबियाँ दिखाए।",
      },
      sources: [SCHEDULE, KEYS_EVIDENCE],
    },
  },
  {
    id: 'lh-keys-bag-f',
    tier: 1,
    real: false,
    pair: 'lh-keys-bag',
    from: { en: 'Farmer', hi: 'फ़ार्मर' },
    to: POST_BOX,
    text: {
      en: 'A zinc handbag will reach you tonight. Keep it under your cot. Hand it only to the person who shows the two keys. — Farmer',
      hi: 'आज रात तुम्हारे पास जस्ते का एक हैंडबैग पहुँचेगा। उसे अपनी चारपाई के नीचे रखो। उसे सिर्फ़ उसी को देना जो दोनों चाबियाँ दिखाए। — फ़ार्मर',
    },
    checks: { en: ['Farmer'], hi: ['फ़ार्मर'] },
    tells: [
      {
        kind: 'name',
        explain: {
          en: "Sukhdev's party names were Dyal, Swami and Villager. 'Farmer' is a policeman's guess at 'Villager': close enough for a report, not for a comrade.",
          hi: "सुखदेव के पार्टी नाम दयाल, स्वामी और विलेजर थे। 'फ़ार्मर' (किसान) पुलिस का अंदाज़ा है, 'विलेजर' (गाँववाला) के आसपास, पर ग़लत। रिपोर्ट के लिए चल जाता, साथी के लिए नहीं।",
        },
        factId: 'aliases',
        sources: [SCHEDULE],
      },
    ],
  },

  {
    id: 'lh-alias-m-g',
    tier: 1,
    real: true,
    pair: 'lh-alias-m',
    from: { en: 'M', hi: 'एम' },
    to: POST_BOX,
    text: {
      en: 'If a letter comes for me, do not send it on. Keep it until Panditji asks for it. — M',
      hi: 'अगर मेरे लिए कोई चिट्ठी आए, तो आगे मत भेजना। जब तक पंडितजी न माँगें, अपने पास रखना। — एम',
    },
    checks: { en: ['Panditji', '— M'], hi: ['पंडितजी', '— एम'] },
    why: {
      text: {
        en: "'M' was Rajguru's party name and 'Panditji' was Chandrashekhar Azad's. Both appear in the government's own list of the accused.",
        hi: "'एम' राजगुरु का पार्टी नाम था और 'पंडितजी' चंद्रशेखर आज़ाद का। दोनों नाम सरकार की अपनी आरोपियों की सूची में दर्ज हैं।",
      },
      sources: [SCHEDULE],
    },
  },
  {
    id: 'lh-alias-m-f',
    tier: 2,
    real: false,
    pair: 'lh-alias-m',
    from: { en: 'Shivram Rajguru', hi: 'शिवराम राजगुरु' },
    to: POST_BOX,
    text: {
      en: 'If a letter comes for me, do not send it on. Keep it until Panditji asks for it. — Shivram Rajguru',
      hi: 'अगर मेरे लिए कोई चिट्ठी आए, तो आगे मत भेजना। जब तक पंडितजी न माँगें, अपने पास रखना। — शिवराम राजगुरु',
    },
    checks: { en: ['Shivram Rajguru'], hi: ['शिवराम राजगुरु'] },
    tells: [
      {
        kind: 'name',
        explain: {
          en: "Comrades never sign with their full real names. Rajguru signed as 'M'; a note signed 'Shivram Rajguru' is the CID's idea of him.",
          hi: "साथी अपने पूरे असली नाम से कभी दस्तख़त नहीं करते। राजगुरु 'एम' लिखते थे; 'शिवराम राजगुरु' के दस्तख़त वाला पर्चा सीआईडी का बनाया है।",
        },
        factId: 'aliases',
        ruleId: 'r-party-names',
        sources: [SCHEDULE],
      },
    ],
  },

  {
    id: 'lh-rent-g',
    tier: 1,
    real: true,
    pair: 'lh-rent',
    from: SWAMI,
    to: POST_BOX,
    text: {
      en: "Keep Rs 13 ready for this month's rent of the McLeod Road room. Whoever comes for it will show the keys. — Swami",
      hi: 'मैक्लोड रोड वाले कमरे के इस महीने के किराए के 13 रुपये तैयार रखो। जो लेने आएगा, वह चाबियाँ दिखाएगा। — स्वामी',
    },
    checks: { en: ['Rs 13', 'McLeod Road'], hi: ['13 रुपये', 'मैक्लोड रोड'] },
    why: {
      text: {
        en: 'Swami was one of Sukhdev\'s party names. House No. 69 in the Kashmir Buildings on McLeod Road was rented on 16 March 1929 to Bhagwati Charan at Rs 13 a month.',
        hi: "'स्वामी' सुखदेव का एक पार्टी नाम था। मैक्लोड रोड की कश्मीर बिल्डिंग्स का मकान नंबर 69, 16 मार्च 1929 को भगवती चरण को 13 रुपये महीने पर किराए पर दिया गया था।",
      },
      sources: [SCHEDULE, { id: 'noorani-1996', loc: "ch. 'Hour of Trial', p. 64" }],
    },
  },
  {
    id: 'lh-rent-f',
    tier: 1,
    real: false,
    pair: 'lh-rent',
    from: SWAMI,
    to: POST_BOX,
    text: {
      en: "Keep Rs 31 ready for this month's rent of the McLeod Road room. Whoever comes for it will show the keys. — Swami",
      hi: 'मैक्लोड रोड वाले कमरे के इस महीने के किराए के 31 रुपये तैयार रखो। जो लेने आएगा, वह चाबियाँ दिखाएगा। — स्वामी',
    },
    checks: { en: ['Rs 31'], hi: ['31 रुपये'] },
    tells: [
      {
        kind: 'number',
        explain: {
          en: 'The McLeod Road room cost Rs 13 a month. The forger got the digits the wrong way round.',
          hi: 'मैक्लोड रोड वाले कमरे का किराया 13 रुपये महीना था। जालसाज़ ने अंक उलट दिए।',
        },
        factId: 'room',
      },
    ],
  },

  {
    id: 'lh-cover-g',
    tier: 1,
    real: true,
    pair: 'lh-cover',
    from: VILLAGER,
    to: POST_BOX,
    text: {
      en: 'If anyone asks where you were on Monday, 17 December, at four in the afternoon: you were at your books. Learn it, then burn this. — Villager',
      hi: 'अगर कोई पूछे कि 17 दिसंबर, सोमवार को शाम चार बजे तुम कहाँ थे, तो कहना कि पढ़ाई कर रहे थे। यह याद कर लो, फिर यह पर्चा जला देना। — विलेजर',
    },
    checks: { en: ['Monday, 17 December', 'four in the afternoon'], hi: ['17 दिसंबर, सोमवार', 'शाम चार बजे'] },
    why: {
      text: {
        en: 'Saunders was shot at about 4 p.m. on Monday 17 December 1928, outside the District Police Office in Lahore. Villager was Sukhdev\'s party name.',
        hi: "सॉन्डर्स को 17 दिसंबर 1928, सोमवार को शाम करीब 4 बजे लाहौर के ज़िला पुलिस दफ़्तर के बाहर गोली मारी गई थी। 'विलेजर' सुखदेव का पार्टी नाम था।",
      },
      sources: [SAUNDERS_CH, SCHEDULE],
    },
  },
  {
    id: 'lh-cover-f',
    tier: 1,
    real: false,
    pair: 'lh-cover',
    from: VILLAGER,
    to: POST_BOX,
    text: {
      en: 'If anyone asks where you were on Saturday, 15 December, at four in the afternoon: you were at your books. Learn it, then burn this. — Villager',
      hi: 'अगर कोई पूछे कि 15 दिसंबर, शनिवार को शाम चार बजे तुम कहाँ थे, तो कहना कि पढ़ाई कर रहे थे। यह याद कर लो, फिर यह पर्चा जला देना। — विलेजर',
    },
    checks: { en: ['Saturday, 15 December'], hi: ['15 दिसंबर, शनिवार'] },
    tells: [
      {
        kind: 'date',
        explain: {
          en: 'The shooting was on Monday 17 December 1928, not Saturday the 15th. (Even a 1972 history book prints this wrong date.)',
          hi: 'गोली 17 दिसंबर 1928, सोमवार को चली थी, 15 तारीख़, शनिवार को नहीं। (1972 की एक इतिहास की किताब में भी यही ग़लत तारीख़ छपी है।)',
        },
        factId: 'saunders',
        sources: [{ id: 'gupta-1972', loc: 'p. 118' }],
      },
    ],
  },

  {
    id: 'lh-escape-g',
    tier: 1,
    real: true,
    pair: 'lh-escape',
    from: VILLAGER,
    to: POST_BOX,
    text: {
      en: "In December our friend left Lahore in first class: a young sahib with 'his wife' and her little boy, and M as the servant with the tiffin carrier. If anyone asks about the station, you know nothing. — Villager",
      hi: "दिसंबर में हमारा दोस्त फ़र्स्ट क्लास में लाहौर से निकला: एक नौजवान साहब बनकर, साथ में 'पत्नी' बनी एक औरत और उसका नन्हा बेटा, और टिफ़िन-कैरियर उठाए नौकर बना एम। अगर कोई स्टेशन के बारे में पूछे, तो तुम्हें कुछ नहीं पता। — विलेजर",
    },
    checks: { en: ['first class', 'tiffin carrier'], hi: ['फ़र्स्ट क्लास', 'टिफ़िन-कैरियर'] },
    why: {
      text: {
        en: "On Thursday 20 December 1928 Bhagat Singh left Lahore by first class, clean-shaven and dressed as a young official. Durga Devi posed as his wife, with her son Sachi, and Rajguru ('M') played the servant carrying the tiffin carrier.",
        hi: "20 दिसंबर 1928, गुरुवार को भगत सिंह दाढ़ी-बाल कटवाकर, एक नौजवान अफ़सर के भेस में फ़र्स्ट क्लास से लाहौर से निकले। दुर्गा देवी उनकी पत्नी बनीं, साथ में उनका बेटा शची था, और राजगुरु ('एम') टिफ़िन-कैरियर उठाए नौकर बने।",
      },
      sources: [{ id: 'noorani-1996', loc: "ch. 'Saunders Murder', p. 25" }, { id: 'sanyal-1931', loc: 'ch. IV' }, { id: 'maclean-durga' }],
    },
  },
  {
    id: 'lh-escape-f',
    tier: 1,
    real: false,
    pair: 'lh-escape',
    from: VILLAGER,
    to: POST_BOX,
    text: {
      en: "In December our friend left Lahore in third class: a young sahib with 'his wife' and her little boy, and M as the servant with the tiffin carrier. If anyone asks about the station, you know nothing. — Villager",
      hi: "दिसंबर में हमारा दोस्त थर्ड क्लास में लाहौर से निकला: एक नौजवान साहब बनकर, साथ में 'पत्नी' बनी एक औरत और उसका नन्हा बेटा, और टिफ़िन-कैरियर उठाए नौकर बना एम। अगर कोई स्टेशन के बारे में पूछे, तो तुम्हें कुछ नहीं पता। — विलेजर",
    },
    checks: { en: ['third class'], hi: ['थर्ड क्लास'] },
    tells: [
      {
        kind: 'number',
        explain: {
          en: "He travelled first class. A 'young official' with a big official name on the labels of his trunks, sitting in third class, would have drawn every eye on the platform.",
          hi: "वे फ़र्स्ट क्लास में गए थे। संदूकों पर बड़े अफ़सर वाले नाम की पर्चियाँ लगाए 'नौजवान अफ़सर' थर्ड क्लास में बैठता, तो पूरा प्लेटफ़ॉर्म उसे घूरता।",
        },
        factId: 'escape',
        sources: [{ id: 'sanyal-1931', loc: 'ch. IV' }],
      },
    ],
  },

  {
    id: 'lh-notice-dec-g',
    tier: 2,
    real: true,
    pair: 'lh-notice-dec',
    from: { en: 'Balraj', hi: 'बलराज' },
    to: PUBLIC,
    text: { en: NOTICE_DEC_EN('Balraj'), hi: NOTICE_DEC_HI('बलराज') },
    checks: { en: ['Sd/- Balraj', '18th December, 1928'], hi: ['दस्तख़त: बलराज', '18 दिसंबर 1928'] },
    document: { sources: [{ id: 'hsra-notice-1928' }] },
    why: {
      text: {
        en: "This is the real notice the HSRA pasted on Lahore's walls on the night of 18–19 December 1928, in Bhagat Singh's handwriting and signed 'Balraj'. Editions word the notice a little differently; this text follows the shahidbhagatsingh.org transcription.",
        hi: "यह वही असली नोटिस है जो एच.एस.आर.ए. ने 18–19 दिसंबर 1928 की रात लाहौर की दीवारों पर चिपकाया था। यह भगत सिंह की लिखावट में था और इस पर 'बलराज' के दस्तख़त थे। अलग-अलग किताबों में नोटिस के शब्द थोड़े अलग हैं; यह पाठ shahidbhagatsingh.org की नक़ल से है।",
      },
      sources: [{ id: 'hsra-notice-1928' }, { id: 'noorani-1996', loc: "ch. 'Saunders Murder', p. 23" }],
    },
  },
  {
    id: 'lh-notice-dec-f',
    tier: 1,
    real: false,
    pair: 'lh-notice-dec',
    from: { en: 'Baldev', hi: 'बलदेव' },
    to: PUBLIC,
    text: { en: NOTICE_DEC_EN('Baldev'), hi: NOTICE_DEC_HI('बलदेव') },
    checks: { en: ['Sd/- Baldev'], hi: ['दस्तख़त: बलदेव'] },
    tells: [
      {
        kind: 'name',
        explain: {
          en: "HSRA notices were signed 'Balraj'. 'Baldev' is close, and close is exactly how forgers get caught.",
          hi: "एच.एस.आर.ए. के नोटिसों पर 'बलराज' के दस्तख़त होते थे। 'बलदेव' मिलता-जुलता है, और जालसाज़ इसी 'मिलते-जुलते' में पकड़े जाते हैं।",
        },
        factId: 'notices',
        ruleId: 'r-balraj',
        sources: [{ id: 'hsra-notice-1928' }],
      },
    ],
  },

  {
    id: 'lh-founding-g',
    tier: 1,
    real: true,
    pair: 'lh-founding',
    from: PANDITJI,
    to: POST_BOX,
    text: {
      en: 'If a new boy asks what we are, tell him only this: since the meeting at Feroz Shah Kotla in September, we are the Hindustan Socialist Republican Association. The rest he will learn by working. — Panditji',
      hi: 'अगर कोई नया लड़का पूछे कि हम कौन हैं, तो उसे बस इतना बताना: सितंबर में फ़िरोज़शाह कोटला की बैठक के बाद से हम हिंदुस्तान सोशलिस्ट रिपब्लिकन एसोसिएशन हैं। बाक़ी वह काम करके सीखेगा। — पंडितजी',
    },
    checks: { en: ['Feroz Shah Kotla', 'in September'], hi: ['फ़िरोज़शाह कोटला', 'सितंबर में'] },
    why: {
      text: {
        en: "The HRA renamed itself the Hindustan Socialist Republican Association at a meeting at Feroz Shah Kotla, Delhi, on 8–9 September 1928. Panditji was Azad's party name.",
        hi: "एच.आर.ए. ने 8–9 सितंबर 1928 को दिल्ली के फ़िरोज़शाह कोटला की बैठक में अपना नाम हिंदुस्तान सोशलिस्ट रिपब्लिकन एसोसिएशन रखा। 'पंडितजी' आज़ाद का पार्टी नाम था।",
      },
      sources: [{ id: 'chaman-lal-reader', loc: 'introduction' }, { id: 'chaman-lal-2009' }, SCHEDULE],
    },
  },
  {
    id: 'lh-founding-f',
    tier: 1,
    real: false,
    pair: 'lh-founding',
    from: PANDITJI,
    to: POST_BOX,
    text: {
      en: 'If a new boy asks what we are, tell him only this: since the meeting at Feroz Shah Kotla in December, we are the Hindustan Socialist Republican Association. The rest he will learn by working. — Panditji',
      hi: 'अगर कोई नया लड़का पूछे कि हम कौन हैं, तो उसे बस इतना बताना: दिसंबर में फ़िरोज़शाह कोटला की बैठक के बाद से हम हिंदुस्तान सोशलिस्ट रिपब्लिकन एसोसिएशन हैं। बाक़ी वह काम करके सीखेगा। — पंडितजी',
    },
    checks: { en: ['in December'], hi: ['दिसंबर में'] },
    tells: [
      {
        kind: 'date',
        explain: {
          en: 'The meeting at Feroz Shah Kotla was on 8–9 September 1928. (A 1972 history book makes the same slip and dates the meeting to December.)',
          hi: 'फ़िरोज़शाह कोटला की बैठक 8–9 सितंबर 1928 को हुई थी। (1972 की एक किताब में भी यही ग़लती है, वहाँ बैठक दिसंबर में बताई गई है।)',
        },
        factId: 'hsra',
        sources: [{ id: 'gupta-1972', loc: 'pp. 114–122' }],
      },
    ],
  },

  {
    id: 'lh-lalaji-g',
    tier: 1,
    real: true,
    pair: 'lh-lalaji',
    from: SWAMI,
    to: POST_BOX,
    text: {
      en: 'The boys at the hostel ask why. Tell them: on 30 October the lathis fell on Lala Lajpat Rai at the Simon Commission protest, and on 17 November he died. — Swami',
      hi: 'हॉस्टल के लड़के पूछते हैं, क्यों। उन्हें बताओ: 30 अक्टूबर को साइमन कमीशन के विरोध में लाला लाजपत राय पर लाठियाँ बरसीं, और 17 नवंबर को उनकी मौत हो गई। — स्वामी',
    },
    checks: { en: ['30 October', '17 November'], hi: ['30 अक्टूबर', '17 नवंबर'] },
    why: {
      text: {
        en: 'The Simon Commission reached Lahore on Tuesday 30 October 1928. Lajpat Rai was beaten by the police at the protest, and he died on Saturday 17 November 1928.',
        hi: 'साइमन कमीशन 30 अक्टूबर 1928, मंगलवार को लाहौर पहुँचा। विरोध में पुलिस ने लाजपत राय को पीटा, और 17 नवंबर 1928, शनिवार को उनकी मौत हो गई।',
      },
      sources: [{ id: 'sanyal-1931', loc: "ch. 'The Saunders Murder'" }],
    },
  },
  {
    id: 'lh-lalaji-f',
    tier: 1,
    real: false,
    pair: 'lh-lalaji',
    from: SWAMI,
    to: POST_BOX,
    text: {
      en: 'The boys at the hostel ask why. Tell them: on 30 October the lathis fell on Lala Lajpat Rai at the Simon Commission protest, and on 17 December he died. — Swami',
      hi: 'हॉस्टल के लड़के पूछते हैं, क्यों। उन्हें बताओ: 30 अक्टूबर को साइमन कमीशन के विरोध में लाला लाजपत राय पर लाठियाँ बरसीं, और 17 दिसंबर को उनकी मौत हो गई। — स्वामी',
    },
    checks: { en: ['17 December'], hi: ['17 दिसंबर'] },
    tells: [
      {
        kind: 'date',
        explain: {
          en: 'Lajpat Rai died on 17 November 1928. 17 December was the day Saunders was shot, a month later. The forger mixed up his seventeenths.',
          hi: 'लाजपत राय की मौत 17 नवंबर 1928 को हुई थी। 17 दिसंबर को, एक महीने बाद, सॉन्डर्स को गोली लगी थी। जालसाज़ दोनों 17 तारीख़ों में उलझ गया।',
        },
        factId: 'lajpat-rai',
        sources: [{ id: 'sanyal-1931', loc: "ch. 'The Saunders Murder'" }],
      },
    ],
  },

  // ───────────── Tier 2: rules, habits, weekdays, form ─────────────

  {
    id: 'lh-past-g',
    tier: 2,
    real: true,
    pair: 'lh-past',
    from: DYAL,
    to: POST_BOX,
    text: {
      en: 'A new man will come with a note from Panditji. Take the note, give him tea, and ask him nothing about who he was before. — Dyal',
      hi: 'पंडितजी की चिट्ठी लेकर एक नया आदमी आएगा। चिट्ठी ले लेना, उसे चाय पिलाना, और उससे कुछ मत पूछना कि वह पहले कौन था। — दयाल',
    },
    checks: { en: ['ask him nothing', 'Dyal'], hi: ['कुछ मत पूछना', 'दयाल'] },
    why: {
      text: {
        en: "Dyal was one of Sukhdev's party names. Never asking a comrade about his past was the party's code, as Ajoy Ghosh, one of the comrades, later wrote.",
        hi: "'दयाल' सुखदेव का एक पार्टी नाम था। किसी साथी से उसकी पिछली ज़िंदगी के बारे में न पूछना पार्टी का नियम था, जैसा बाद में उन्हीं के एक साथी अजय घोष ने लिखा।",
      },
      sources: [SCHEDULE, GHOSH],
    },
  },
  {
    id: 'lh-past-f',
    tier: 2,
    real: false,
    pair: 'lh-past',
    from: DYAL,
    to: POST_BOX,
    text: {
      en: "A new man will come with a note from Panditji. Before you give him anything, find out his real name, his village and his father's name, and send them to me. — Dyal",
      hi: 'पंडितजी की चिट्ठी लेकर एक नया आदमी आएगा। उसे कुछ भी देने से पहले उसका असली नाम, उसका गाँव और उसके पिता का नाम पता करो, और मुझे भेज दो। — दयाल',
    },
    checks: { en: ["real name, his village and his father's name"], hi: ['असली नाम, उसका गाँव और उसके पिता का नाम'] },
    tells: [
      {
        kind: 'habit',
        explain: {
          en: "The party never asked about a comrade's past. Real name, village, father's name: that is the first line of a police file.",
          hi: 'पार्टी कभी किसी साथी से उसकी पिछली ज़िंदगी के बारे में नहीं पूछती थी। असली नाम, गाँव, पिता का नाम: यह तो पुलिस की फ़ाइल की पहली लाइन है।',
        },
        ruleId: 'r-past',
        sources: [GHOSH, SCHEDULE],
      },
    ],
  },

  {
    id: 'lh-nokeys-g',
    tier: 2,
    real: true,
    pair: 'lh-nokeys',
    from: SWAMI,
    to: POST_BOX,
    text: {
      en: 'Someone may come for the bundle saying I sent him. No keys, no bundle, even if he weeps. — Swami',
      hi: 'हो सकता है कोई गठरी लेने आए और कहे कि मैंने भेजा है। चाबियाँ नहीं, तो गठरी नहीं, चाहे वह रो ही क्यों न दे। — स्वामी',
    },
    checks: { en: ['No keys, no bundle'], hi: ['चाबियाँ नहीं, तो गठरी नहीं'] },
    why: {
      text: {
        en: "Swami was one of Sukhdev's party names, and handing things over only to the person who showed the keys was his own instruction, on record in Jai Gopal's evidence.",
        hi: "'स्वामी' सुखदेव का एक पार्टी नाम था, और सामान सिर्फ़ चाबियाँ दिखाने वाले को देना उन्हीं का निर्देश था। यह जयगोपाल की गवाही में दर्ज है।",
      },
      sources: [SCHEDULE, KEYS_EVIDENCE],
    },
  },
  {
    id: 'lh-nokeys-f',
    tier: 2,
    real: false,
    pair: 'lh-nokeys',
    from: SWAMI,
    to: POST_BOX,
    text: {
      en: 'My cousin will come for the bundle today. He has no keys, but give it to him; he knows my face. — Swami',
      hi: 'आज मेरा चचेरा भाई गठरी लेने आएगा। उसके पास चाबियाँ नहीं हैं, पर उसे दे देना; वह मेरी शक्ल पहचानता है। — स्वामी',
    },
    checks: { en: ['He has no keys'], hi: ['उसके पास चाबियाँ नहीं हैं'] },
    tells: [
      {
        kind: 'habit',
        explain: {
          en: "A parcel goes only to the person who shows the keys. A 'cousin' with no keys is exactly who that rule was made for.",
          hi: "सामान सिर्फ़ उसी को मिलता है जो चाबियाँ दिखाए। बिना चाबी वाला 'चचेरा भाई' ही तो वह आदमी है जिसके लिए यह नियम बना।",
        },
        ruleId: 'r-keys',
        sources: [KEYS_EVIDENCE],
      },
    ],
  },

  {
    id: 'lh-action-g',
    tier: 2,
    real: true,
    pair: 'lh-action',
    from: VILLAGER,
    to: POST_BOX,
    text: {
      en: 'Since our action in December, constables who know our friend by sight have been posted at the big railway junctions. Travel only if you must. — Villager',
      hi: 'दिसंबर वाली हमारी कार्रवाई के बाद से बड़े रेलवे जंक्शनों पर ऐसे सिपाही तैनात किए गए हैं जो हमारे दोस्त को पहचानते हैं। बहुत ज़रूरी हो, तभी सफ़र करना। — विलेजर',
    },
    checks: { en: ['our action', 'big railway junctions'], hi: ['हमारी कार्रवाई', 'बड़े रेलवे जंक्शनों'] },
    why: {
      text: {
        en: "Comrades called it an 'action': their own notice of 23 December speaks of 'retaliatory action'. Sanyal records that afterwards police constables who knew Bhagat Singh were posted at the big junctions.",
        hi: "साथी इसे 'कार्रवाई' कहते थे: 23 दिसंबर के उनके अपने नोटिस में 'बदले की कार्रवाई' लिखा है। सान्याल ने लिखा है कि इसके बाद भगत सिंह को पहचानने वाले सिपाही बड़े जंक्शनों पर तैनात किए गए।",
      },
      sources: [{ id: 'chaman-lal-reader', loc: 'document 64' }, { id: 'sanyal-1931', loc: 'ch. V' }],
    },
  },
  {
    id: 'lh-action-f',
    tier: 2,
    real: false,
    pair: 'lh-action',
    from: VILLAGER,
    to: POST_BOX,
    text: {
      en: 'Since our outrage in December, constables who know our friend by sight have been posted at the big railway junctions. Travel only if you must. — Villager',
      hi: 'दिसंबर वाली हमारी वारदात के बाद से बड़े रेलवे जंक्शनों पर ऐसे सिपाही तैनात किए गए हैं जो हमारे दोस्त को पहचानते हैं। बहुत ज़रूरी हो, तभी सफ़र करना। — विलेजर',
    },
    checks: { en: ['our outrage'], hi: ['हमारी वारदात'] },
    tells: [
      {
        kind: 'habit',
        explain: {
          en: "No comrade calls his own act an 'outrage'. That was the police and government word; the party said 'action'.",
          hi: "कोई साथी अपने काम को 'वारदात' नहीं कहता। यह पुलिस और सरकार की ज़बान थी; पार्टी 'कार्रवाई' कहती थी।",
        },
        ruleId: 'r-police-words',
        sources: [{ id: 'chaman-lal-reader', loc: 'document 64' }, ASSEMBLY_CH],
      },
    ],
  },

  {
    id: 'lh-date1-g',
    tier: 2,
    real: true,
    pair: 'lh-date1',
    from: PANDITJI,
    to: POST_BOX,
    text: {
      en: 'Dated {weekday}, {date}. Be at the usual place after dark. The man with the keys will find you. — Panditji',
      hi: 'तारीख़: {weekday}, {date}। अँधेरा होने के बाद हमेशा वाली जगह पहुँचना। चाबियों वाला आदमी तुम्हें ढूँढ लेगा। — पंडितजी',
    },
    checks: { en: ['Dated', 'the keys'], hi: ['तारीख़:', 'चाबियों वाला'] },
    why: {
      text: {
        en: "Today's date falls on that weekday, 'Panditji' was Azad's party name, and the keys rule holds. Nothing here is out of place.",
        hi: "आज की तारीख़ उसी दिन पड़ती है, 'पंडितजी' आज़ाद का पार्टी नाम था, और चाबियों वाला नियम भी ठीक है। इसमें कुछ भी ग़लत नहीं।",
      },
      sources: [SCHEDULE, KEYS_EVIDENCE],
    },
  },
  {
    id: 'lh-date1-f',
    tier: 2,
    real: false,
    pair: 'lh-date1',
    from: PANDITJI,
    to: POST_BOX,
    text: {
      en: 'Dated {weekday+1}, {date}. Be at the usual place after dark. The man with the keys will find you. — Panditji',
      hi: 'तारीख़: {weekday+1}, {date}। अँधेरा होने के बाद हमेशा वाली जगह पहुँचना। चाबियों वाला आदमी तुम्हें ढूँढ लेगा। — पंडितजी',
    },
    checks: { en: ['Dated'], hi: ['तारीख़:'] },
    tells: [
      {
        kind: 'weekday',
        explain: {
          en: "Look at today's date: it is not that weekday. Someone writing on the day knows what day it is. Someone preparing plants in advance doesn't.",
          hi: 'आज की तारीख़ देखो: उस तारीख़ को यह दिन नहीं पड़ता। उसी दिन लिखने वाले को पता होता है कि आज कौन-सा दिन है। पहले से जाली पर्चे तैयार करने वाले को नहीं।',
        },
      },
    ],
  },

  {
    id: 'lh-date2-g',
    tier: 2,
    real: true,
    pair: 'lh-date2',
    from: DYAL,
    to: POST_BOX,
    text: {
      en: 'Written {weekday}, {date}. The bundle leaves tomorrow, {weekday+1}. Keep it dry till then. — Dyal',
      hi: 'लिखा: {weekday}, {date}। गठरी कल, {weekday+1} को जाएगी। तब तक उसे सूखा रखना। — दयाल',
    },
    checks: { en: ['Written', 'tomorrow'], hi: ['लिखा:', 'गठरी कल'] },
    why: {
      text: {
        en: "The date and both weekdays are right, and 'Dyal' was Sukhdev's party name.",
        hi: "तारीख़ और दोनों दिन सही हैं, और 'दयाल' सुखदेव का पार्टी नाम था।",
      },
      sources: [SCHEDULE],
    },
  },
  {
    id: 'lh-date2-f',
    tier: 2,
    real: false,
    pair: 'lh-date2',
    from: DYAL,
    to: POST_BOX,
    text: {
      en: 'Written {weekday+1}, {date}. The bundle leaves tomorrow. Keep it dry till then. — Dyal',
      hi: 'लिखा: {weekday+1}, {date}। गठरी कल जाएगी। तब तक उसे सूखा रखना। — दयाल',
    },
    checks: { en: ['Written'], hi: ['लिखा:'] },
    tells: [
      {
        kind: 'weekday',
        explain: {
          en: "The weekday doesn't match today's date. The forger dated it a day ahead, as if the note had been typed up early at the office.",
          hi: 'दिन आज की तारीख़ से मेल नहीं खाता। जालसाज़ ने एक दिन आगे का दिन लिख दिया, जैसे पर्चा दफ़्तर में पहले से टाइप करके रखा हो।',
        },
      },
    ],
  },

  {
    id: 'lh-paper-g',
    tier: 2,
    real: true,
    pair: 'lh-paper',
    from: VILLAGER,
    to: POST_BOX,
    text: {
      en: 'The new paper has come: pink, with the heading already printed. Keep it flat and away from the lantern. — Villager',
      hi: 'नया काग़ज़ आ गया है: गुलाबी, ऊपर हेडिंग पहले से छपी हुई। उसे बिना मोड़े रखना और लालटेन से दूर रखना। — विलेजर',
    },
    checks: { en: ['pink', 'printed'], hi: ['गुलाबी', 'छपी हुई'] },
    why: {
      text: {
        en: "Real HSRA notices and leaflets used pink paper with a printed heading. The Viceroy himself reported that the Assembly leaflets were 'typed on pink paper with printed heading', the same as the notices pasted up in Lahore.",
        hi: "एच.एस.आर.ए. के असली नोटिस और पर्चे गुलाबी काग़ज़ पर होते थे, जिन पर हेडिंग छपी होती थी। ख़ुद वायसराय ने लिखा कि असेंबली के पर्चे 'छपी हेडिंग वाले गुलाबी काग़ज़ पर टाइप' थे, ठीक लाहौर में चिपके नोटिसों जैसे।",
      },
      sources: [IRWIN_PINK, { id: 'noorani-1996', loc: "ch. 'Saunders Murder', p. 23" }],
    },
  },
  {
    id: 'lh-paper-f',
    tier: 2,
    real: false,
    pair: 'lh-paper',
    from: VILLAGER,
    to: POST_BOX,
    text: {
      en: 'The new paper has come: plain white, and we will write the heading by hand. Keep it flat and away from the lantern. — Villager',
      hi: 'नया काग़ज़ आ गया है: सादा सफ़ेद, हेडिंग हम हाथ से लिखेंगे। उसे बिना मोड़े रखना और लालटेन से दूर रखना। — विलेजर',
    },
    checks: { en: ['plain white', 'by hand'], hi: ['सादा सफ़ेद', 'हाथ से'] },
    tells: [
      {
        kind: 'form',
        explain: {
          en: 'Real notices were on pink paper with the heading printed. White paper with a hand-written heading would mark every copy as fake, which is the whole idea if you work for the CID.',
          hi: 'असली नोटिस गुलाबी काग़ज़ पर होते थे और हेडिंग छपी होती थी। सफ़ेद काग़ज़ और हाथ की हेडिंग से हर नक़ल जाली लगती, और सीआईडी यही तो चाहती है।',
        },
        factId: 'notices',
        ruleId: 'r-pink',
        sources: [IRWIN_PINK],
      },
    ],
  },

  // ───────────── Tier 3 and look-alikes (Hard) ─────────────

  {
    id: 'lh-notice-23-g',
    tier: 3,
    real: true,
    pair: 'lh-notice-23',
    from: BALRAJ_CIC,
    to: PUBLIC,
    text: { en: NOTICE_23_EN('the incident'), hi: NOTICE_23_HI('घटना') },
    checks: {
      en: ['Special Guess', 'Rule 10 B.R.C', 'Balraj, Commander-in-chief'],
      hi: ['स्पेशल गेस', 'रूल 10 बी.आर.सी.', 'बलराज, कमांडर-इन-चीफ़'],
    },
    document: { sources: [{ id: 'chaman-lal-reader', loc: 'document 64' }] },
    why: {
      text: {
        en: "This is the real second notice, pasted up in Lahore on Sunday 23 December 1928. The strange 'Special Guess' and 'Rule 10 B.R.C' are in the original, and it is signed 'Balraj, Commander-in-chief'.",
        hi: "यह असली दूसरा नोटिस है, जो 23 दिसंबर 1928, रविवार को लाहौर में चिपका। अजीब लगने वाले 'स्पेशल गेस' और 'रूल 10 बी.आर.सी.' असली नोटिस में ही हैं, और दस्तख़त 'बलराज, कमांडर-इन-चीफ़' के हैं।",
      },
      sources: [{ id: 'chaman-lal-reader', loc: 'document 64' }],
    },
  },
  {
    id: 'lh-notice-23-f',
    tier: 2,
    real: false,
    pair: 'lh-notice-23',
    from: BALRAJ_CIC,
    to: PUBLIC,
    text: { en: NOTICE_23_EN('the outrage'), hi: NOTICE_23_HI('वारदात') },
    checks: { en: ['the outrage of 17 December'], hi: ['17 दिसंबर की वारदात'] },
    tells: [
      {
        kind: 'habit',
        explain: {
          en: "The real notice says 'the incident of 17 December' and calls it 'action'. 'Outrage' is the police's word; the party never used it about itself.",
          hi: "असली नोटिस में '17 दिसंबर की घटना' लिखा है और इसे 'कार्रवाई' कहा गया है। 'वारदात' पुलिस का शब्द है; पार्टी अपने लिए इसे कभी नहीं लिखती थी।",
        },
        ruleId: 'r-police-words',
        sources: [{ id: 'chaman-lal-reader', loc: 'document 64' }],
      },
    ],
  },

  {
    id: 'lh-slogan-g',
    tier: 3,
    real: true,
    pair: 'lh-slogan',
    from: PANDITJI,
    to: POST_BOX,
    text: {
      en: "Teach the new boys our two cries: 'Inquilab Zindabad' and 'Down with Imperialism'. In English notices we write 'Long Live Revolution'. — Panditji",
      hi: "नए लड़कों को हमारे दो नारे सिखाओ: 'इंक़लाब ज़िंदाबाद' और 'साम्राज्यवाद मुर्दाबाद'। अंग्रेज़ी नोटिसों में हम 'लॉन्ग लिव रेवोल्यूशन' लिखते हैं। — पंडितजी",
    },
    checks: { en: ['Inquilab Zindabad', 'Down with Imperialism'], hi: ['इंक़लाब ज़िंदाबाद', 'साम्राज्यवाद मुर्दाबाद'] },
    why: {
      text: {
        en: "'Inquilab Zindabad' and 'Down with Imperialism' were the party's cries, raised in the Assembly on 8 April 1929 and in court later that year, and its English notices end 'Long Live Revolution'.",
        hi: "'इंक़लाब ज़िंदाबाद' और 'साम्राज्यवाद मुर्दाबाद' पार्टी के नारे थे। 8 अप्रैल 1929 को असेंबली में और उसी साल बाद में अदालत में यही नारे लगे। अंग्रेज़ी नोटिसों के आख़िर में 'लॉन्ग लिव रेवोल्यूशन' लिखा होता था।",
      },
      sources: [
        { id: 'noorani-1996', loc: "ch. 'The Magisterial Farce', p. 101" },
        { id: 'sanyal-1931' },
        { id: 'chaman-lal-reader', loc: 'document 64' },
      ],
    },
  },
  {
    id: 'lh-slogan-f',
    tier: 3,
    real: false,
    pair: 'lh-slogan',
    from: PANDITJI,
    to: POST_BOX,
    text: {
      en: "Teach the new boys our friend's own cry, 'Inquilab Zindabad'. He made it up himself, and no one else may claim it. — Panditji",
      hi: "नए लड़कों को हमारे दोस्त का अपना नारा सिखाओ: 'इंक़लाब ज़िंदाबाद'। यह उसने ख़ुद बनाया है, और कोई इस पर दावा नहीं कर सकता। — पंडितजी",
    },
    checks: { en: ['He made it up himself'], hi: ['यह उसने ख़ुद बनाया है'] },
    tells: [
      {
        kind: 'knowledge',
        explain: {
          en: "Bhagat Singh said the opposite himself, about this very cry in English, 'Long Live Revolution': 'We are not the originators of this cry' (letter to the Modern Review, December 1929).",
          hi: "भगत सिंह ने ख़ुद इसका उल्टा कहा था, इसी नारे के अंग्रेज़ी रूप 'लॉन्ग लिव रेवोल्यूशन' के बारे में: 'यह नारा हमने शुरू नहीं किया' (मॉडर्न रिव्यू के संपादक को चिट्ठी, दिसंबर 1929)।",
        },
        sources: [{ id: 'bs-modern-review' }],
      },
    ],
  },

  {
    id: 'lh-song-f',
    tier: 3,
    real: false,
    from: VILLAGER,
    to: POST_BOX,
    text: {
      en: "The boys sing our friend's own song, 'Mera Rang De Basanti Chola', in the hostel every night. Let them; it is his. — Villager",
      hi: "हॉस्टल में लड़के हर रात हमारे दोस्त का अपना गीत गाते हैं, 'मेरा रंग दे बसंती चोला'। गाने दो; गीत उसी का है। — विलेजर",
    },
    checks: { en: ["our friend's own song"], hi: ['हमारे दोस्त का अपना गीत'] },
    tells: [
      {
        kind: 'knowledge',
        explain: {
          en: "There is no record from his lifetime that Bhagat Singh wrote this song. The song the accused are on record singing, in court on 4 October 1929, was 'Bharat na reh sakega hargiz ghulam khana' (India will never remain a house of slaves).",
          hi: "उनके जीवन के किसी रिकॉर्ड में नहीं मिलता कि यह गीत भगत सिंह ने लिखा। रिकॉर्ड के मुताबिक़ 4 अक्टूबर 1929 को अदालत में आरोपियों ने दूसरा गीत गाया था: 'भारत न रह सकेगा हरगिज़ ग़ुलाम ख़ाना' (भारत कभी ग़ुलामों का घर नहीं रहेगा)।",
        },
        sources: [{ id: 'noorani-1996', loc: "ch. 'The Magisterial Farce', p. 101" }],
      },
    ],
  },

  // ───────────── Event messages (onDay) ─────────────

  // Day 8, Tuesday 9 April: the letter written in Delhi on Friday 5 April. Its arrival is
// undocumented; the letter's own words place receipt after he had gone.
  {
    id: 'lh-letter-g',
    tier: 2,
    real: true,
    pair: 'lh-letter',
    onDay: 8,
    from: { en: 'B. S', hi: 'बी. एस' },
    to: { en: 'For Villager', hi: 'विलेजर के लिए' },
    text: {
      en: 'Dear Brother, By the time you receive this letter I will be gone, going to a far off destination … I am not weak, not weaker than anyone amongst us, brother … Yours, B. S',
      hi: 'प्यारे भाई, जब तक यह चिट्ठी तुम्हें मिलेगी, मैं जा चुका होऊँगा, बहुत दूर की मंज़िल की ओर … मैं कमज़ोर नहीं हूँ, हममें से किसी से भी कमज़ोर नहीं, भाई … तुम्हारा, बी. एस',
    },
    checks: { en: ['far off destination', 'B. S'], hi: ['बहुत दूर की मंज़िल', 'बी. एस'] },
    document: { sources: [{ id: 'bs-letter-sukhdev' }] },
    why: {
      text: {
        en: "This is Bhagat Singh's real letter to Sukhdev, written on Friday 5 April 1929 at the Sita Ram Bazar house in Delhi. Shiv Verma carried it to Lahore for Sukhdev, and the police found it on him when they arrested him.",
        hi: 'यह भगत सिंह की सुखदेव को लिखी असली चिट्ठी है, जो 5 अप्रैल 1929, शुक्रवार को दिल्ली के सीता राम बाज़ार वाले मकान में लिखी गई। शिव वर्मा इसे सुखदेव के लिए लाहौर ले गए, और गिरफ़्तारी के वक़्त पुलिस को यह सुखदेव के पास मिली।',
      },
      sources: [{ id: 'bs-letter-sukhdev', loc: 'editorial note' }],
    },
  },
  {
    id: 'lh-letter-f',
    tier: 1,
    real: false,
    pair: 'lh-letter',
    onDay: 8,
    from: { en: 'B. S', hi: 'बी. एस' },
    to: { en: 'For Villager', hi: 'विलेजर के लिए' },
    text: {
      en: 'Dear Brother, By the time you receive this letter I will be gone, going to a far off destination … Write back to me at the Sadar Bazar house as soon as you can. Yours, B. S',
      hi: 'प्यारे भाई, जब तक यह चिट्ठी तुम्हें मिलेगी, मैं जा चुका होऊँगा, बहुत दूर की मंज़िल की ओर … जितनी जल्दी हो सके, मुझे सदर बाज़ार वाले मकान पर जवाब लिखना। तुम्हारा, बी. एस',
    },
    checks: { en: ['Sadar Bazar house', 'Write back'], hi: ['सदर बाज़ार वाले मकान', 'जवाब लिखना'] },
    tells: [
      {
        kind: 'place',
        explain: {
          en: "Our friend was at the Sita Ram Bazar house, not Sadar Bazar. And a man who writes 'I will be gone' does not ask for a reply. The CID wanted an address.",
          hi: "हमारा दोस्त सीता राम बाज़ार वाले मकान में था, सदर बाज़ार में नहीं। और जो लिखे 'मैं जा चुका होऊँगा', वह जवाब नहीं माँगता। सीआईडी को पता चाहिए था।",
        },
        factId: 'delhi',
        sources: [{ id: 'bs-letter-sukhdev', loc: 'editorial note' }],
      },
    ],
  },

  // Day 6, Sunday 7 April: Sukhdev takes Bhagwati Charan, Durga Devi and Sushila to Delhi that night.
  {
    id: 'lh-trip-g',
    tier: 1,
    real: true,
    pair: 'lh-trip',
    onDay: 6,
    from: VILLAGER,
    to: POST_BOX,
    text: {
      en: 'Tonight I take Durga and Sushila to Delhi, to see our friend for the last time. Keep everything here until I am back. — Villager',
      hi: 'आज रात मैं दुर्गा और सुशीला को दिल्ली ले जा रहा हूँ, हमारे दोस्त से आख़िरी बार मिलवाने। मेरे लौटने तक सब कुछ यहीं रखना। — विलेजर',
    },
    checks: { en: ['to Delhi', 'the last time'], hi: ['दिल्ली ले जा', 'आख़िरी बार'] },
    why: {
      text: {
        en: "On the night of Sunday 7 April 1929 Sukhdev took Durga Devi and Sushila from Lahore to Delhi to see Bhagat Singh 'for the last time'. Villager was Sukhdev's party name.",
        hi: "7 अप्रैल 1929, रविवार की रात सुखदेव, दुर्गा देवी और सुशीला को लाहौर से दिल्ली ले गए, ताकि वे भगत सिंह से 'आख़िरी बार' मिल सकें। 'विलेजर' सुखदेव का पार्टी नाम था।",
      },
      sources: [{ id: 'chaman-lal-2009' }, { id: 'maclean-durga' }, SCHEDULE],
    },
  },
  {
    id: 'lh-trip-f',
    tier: 1,
    real: false,
    pair: 'lh-trip',
    onDay: 6,
    from: VILLAGER,
    to: POST_BOX,
    text: {
      en: 'Tonight I take Durga and Sushila to Lucknow, to see our friend for the last time. Keep everything here until I am back. — Villager',
      hi: 'आज रात मैं दुर्गा और सुशीला को लखनऊ ले जा रहा हूँ, हमारे दोस्त से आख़िरी बार मिलवाने। मेरे लौटने तक सब कुछ यहीं रखना। — विलेजर',
    },
    checks: { en: ['to Lucknow'], hi: ['लखनऊ ले जा'] },
    tells: [
      {
        kind: 'place',
        explain: {
          en: 'Our friend was in Delhi, at the Sita Ram Bazar house. Lucknow is where he changed trains in December; the forger has opened the wrong file.',
          hi: 'हमारा दोस्त दिल्ली में था, सीता राम बाज़ार वाले मकान में। लखनऊ में तो उसने दिसंबर में गाड़ी बदली थी; जालसाज़ ने ग़लत फ़ाइल खोल ली।',
        },
        factId: 'delhi',
        sources: [{ id: 'chaman-lal-2009' }],
      },
    ],
  },

  // Day 6, Sunday 7 April: the felt-hat portrait taken at Ramnath's in Delhi on 3 or 4 April.
  {
    id: 'lh-hat-g',
    tier: 2,
    real: true,
    pair: 'lh-hat',
    onDay: 6,
    from: VILLAGER,
    to: POST_BOX,
    text: {
      en: 'This week our friend sat for a photograph at Ramnath\'s in Delhi, in a felt hat. It is for afterwards. — Villager',
      hi: 'इस हफ़्ते हमारे दोस्त ने दिल्ली में रामनाथ के यहाँ फ़ेल्ट हैट पहनकर फ़ोटो खिंचवाई। यह बाद के लिए है। — विलेजर',
    },
    checks: { en: ["Ramnath's", 'felt hat'], hi: ['रामनाथ के यहाँ', 'फ़ेल्ट हैट'] },
    why: {
      text: {
        en: 'On 3 or 4 April 1929 Bhagat Singh and B.K. Dutt were photographed by Ramnath, a photographer in Delhi. The felt-hat portrait was made to be published after the Assembly action, and it was.',
        hi: '3 या 4 अप्रैल 1929 को दिल्ली के फ़ोटोग्राफ़र रामनाथ ने भगत सिंह और बटुकेश्वर दत्त की फ़ोटो खींची। फ़ेल्ट हैट वाली यह तस्वीर असेंबली की कार्रवाई के बाद छपने के लिए बनी थी, और छपी भी।',
      },
      sources: [{ id: 'chaman-lal-2009' }, { id: 'maclean-2011' }],
    },
  },
  {
    id: 'lh-hat-f',
    tier: 1,
    real: false,
    pair: 'lh-hat',
    onDay: 6,
    from: VILLAGER,
    to: POST_BOX,
    text: {
      en: 'This week our friend sat for a photograph at Ramnath\'s in Lahore, in a felt hat. It is for afterwards. — Villager',
      hi: 'इस हफ़्ते हमारे दोस्त ने लाहौर में रामनाथ के यहाँ फ़ेल्ट हैट पहनकर फ़ोटो खिंचवाई। यह बाद के लिए है। — विलेजर',
    },
    checks: { en: ["Ramnath's in Lahore"], hi: ['लाहौर में रामनाथ'] },
    tells: [
      {
        kind: 'place',
        explain: {
          en: 'Our friend was in Delhi in early April, and Ramnath was a photographer at Kashmere Gate in Delhi. The forger moved the studio to the wrong city.',
          hi: 'अप्रैल की शुरुआत में हमारा दोस्त दिल्ली में था, और रामनाथ दिल्ली के कश्मीरी गेट के फ़ोटोग्राफ़र थे। जालसाज़ ने दुकान ग़लत शहर में पहुँचा दी।',
        },
        factId: 'delhi',
        sources: [{ id: 'chaman-lal-2009' }],
      },
    ],
  },

  // Day 7, Monday 8 April: the leaflet dropped in the Assembly.
  {
    id: 'lh-leaflet-g',
    tier: 2,
    real: true,
    pair: 'lh-leaflet',
    onDay: 7,
    from: BALRAJ_CIC,
    to: { en: 'Members of the Assembly', hi: 'असेंबली के सदस्य' },
    text: {
      en: LEAFLET_EN('THE HINDUSTAN SOCIALIST REPUBLICAN ARMY'),
      hi: LEAFLET_HI('हिंदुस्तान सोशलिस्ट रिपब्लिकन आर्मी'),
    },
    checks: {
      en: ['THE HINDUSTAN SOCIALIST REPUBLICAN ARMY', 'Balraj, Commander-in-Chief'],
      hi: ['हिंदुस्तान सोशलिस्ट रिपब्लिकन आर्मी', 'बलराज, कमांडर-इन-चीफ़'],
    },
    document: { sources: [{ id: 'hsra-leaflet-1929' }] },
    why: {
      text: {
        en: "This is the real leaflet that came down from the visitors' gallery of the Central Legislative Assembly on Monday 8 April 1929, as the two bombs went off. 'Balraj' was the pen name Azad signed as Commander-in-Chief, and the Viceroy reported the leaflet was typed on pink paper under the same printed heading as the Lahore notices. Some editions call it 'the red pamphlet'; the Viceroy's own report says pink.",
        hi: "यह वही असली पर्चा है जो 8 अप्रैल 1929, सोमवार को सेंट्रल लेजिस्लेटिव असेंबली की दर्शक गैलरी से दो बमों के फटते ही नीचे गिरा। 'बलराज' वह नाम था जिससे आज़ाद कमांडर-इन-चीफ़ के तौर पर दस्तख़त करते थे, और वायसराय ने लिखा कि यह पर्चा गुलाबी काग़ज़ पर उसी छपी हेडिंग के नीचे टाइप था जो लाहौर के नोटिसों पर थी। कुछ किताबें इसे 'लाल पर्चा' कहती हैं; वायसराय की अपनी रिपोर्ट गुलाबी कहती है।",
      },
      sources: [{ id: 'hsra-leaflet-1929' }, IRWIN_PINK, { id: 'yashpal-1955', loc: "'Balraj' as Azad's signature" }],
    },
  },
  {
    id: 'lh-leaflet-f',
    tier: 2,
    real: false,
    pair: 'lh-leaflet',
    onDay: 7,
    from: BALRAJ_CIC,
    to: { en: 'Members of the Assembly', hi: 'असेंबली के सदस्य' },
    text: {
      en: LEAFLET_EN('THE HINDUSTAN REPUBLICAN ASSOCIATION'),
      hi: LEAFLET_HI('हिंदुस्तान रिपब्लिकन एसोसिएशन'),
    },
    checks: { en: ['THE HINDUSTAN REPUBLICAN ASSOCIATION'], hi: ['हिंदुस्तान रिपब्लिकन एसोसिएशन'] },
    tells: [
      {
        kind: 'name',
        explain: {
          en: "The party dropped the name Hindustan Republican Association at Feroz Shah Kotla in September 1928. The real leaflet's printed heading reads 'The Hindustan Socialist Republican Army'. The CID's letterhead is seven months out of date.",
          hi: "पार्टी ने सितंबर 1928 में फ़िरोज़शाह कोटला में 'हिंदुस्तान रिपब्लिकन एसोसिएशन' नाम छोड़ दिया था। असली पर्चे की छपी हेडिंग है 'हिंदुस्तान सोशलिस्ट रिपब्लिकन आर्मी'। सीआईडी की हेडिंग सात महीने पुरानी है।",
        },
        factId: 'hsra',
        ruleId: 'r-pink',
        sources: [{ id: 'hsra-leaflet-1929' }],
      },
    ],
  },

  // Day 8, Tuesday 9 April: news of yesterday in the Assembly.
  {
    id: 'lh-assembly-g',
    tier: 1,
    real: true,
    pair: 'lh-assembly',
    onDay: 8,
    from: DYAL,
    to: POST_BOX,
    text: {
      en: 'Yesterday, Monday, at about half past twelve, as President Patel rose to give his ruling, two bombs burst in the Assembly hall. Pink leaflets came down from the gallery. Our two friends did not run; they waited to be arrested. — Dyal',
      hi: 'कल, सोमवार को, करीब साढ़े बारह बजे, जब प्रेसिडेंट पटेल अपना फ़ैसला सुनाने उठे, असेंबली हॉल में दो बम फटे। गैलरी से गुलाबी पर्चे नीचे गिरे। हमारे दोनों दोस्त भागे नहीं; वे गिरफ़्तारी के इंतज़ार में खड़े रहे। — दयाल',
    },
    checks: { en: ['Yesterday, Monday', 'half past twelve', 'President Patel'], hi: ['कल, सोमवार', 'साढ़े बारह बजे', 'प्रेसिडेंट पटेल'] },
    why: {
      text: {
        en: "On Monday 8 April 1929, at about 12:30, as President Vithalbhai Patel rose to rule on the Public Safety Bill, Bhagat Singh and B.K. Dutt threw two bombs from the visitors' gallery of the Central Legislative Assembly in Delhi, dropped their leaflets and waited to be arrested.",
        hi: '8 अप्रैल 1929, सोमवार को करीब साढ़े बारह बजे, जब प्रेसिडेंट विट्ठलभाई पटेल पब्लिक सेफ़्टी बिल पर फ़ैसला सुनाने उठे, भगत सिंह और बटुकेश्वर दत्त ने दिल्ली में सेंट्रल लेजिस्लेटिव असेंबली की दर्शक गैलरी से दो बम फेंके, पर्चे गिराए और गिरफ़्तारी का इंतज़ार किया।',
      },
      sources: [{ id: 'chaman-lal-2009' }, { id: 'bs-joint-statement' }, IRWIN_PINK],
    },
  },
  {
    id: 'lh-assembly-f',
    tier: 2,
    real: false,
    pair: 'lh-assembly',
    onDay: 8,
    from: DYAL,
    to: POST_BOX,
    text: {
      en: 'Yesterday, Sunday, at about half past twelve, as President Patel rose to give his ruling, two bombs burst in the Assembly hall. Pink leaflets came down from the gallery. Our two friends did not run; they waited to be arrested. — Dyal',
      hi: 'कल, रविवार को, करीब साढ़े बारह बजे, जब प्रेसिडेंट पटेल अपना फ़ैसला सुनाने उठे, असेंबली हॉल में दो बम फटे। गैलरी से गुलाबी पर्चे नीचे गिरे। हमारे दोनों दोस्त भागे नहीं; वे गिरफ़्तारी के इंतज़ार में खड़े रहे। — दयाल',
    },
    checks: { en: ['Yesterday, Sunday'], hi: ['कल, रविवार'] },
    tells: [
      {
        kind: 'weekday',
        explain: {
          en: "Today is Tuesday 9 April, so yesterday was Monday. The bombs fell on Monday 8 April 1929; a note written the next day would not lose a day.",
          hi: 'आज 9 अप्रैल, मंगलवार है, तो कल सोमवार था। बम 8 अप्रैल 1929, सोमवार को फटे थे; अगले दिन लिखा पर्चा एक दिन नहीं भूलता।',
        },
        sources: [{ id: 'chaman-lal-2009' }],
      },
    ],
  },

  // Day 9, Wednesday 10 April: the Tribune headline (unpaired look-alike).
  {
    id: 'lh-tribune-g',
    tier: 3,
    real: true,
    onDay: 9,
    from: SWAMI,
    to: POST_BOX,
    text: { en: TRIBUNE_EN, hi: TRIBUNE_HI },
    checks: { en: ['Red leaflets', 'fired pistols'], hi: ['लाल पर्चे गिराए', 'पिस्तौलें चलाईं'] },
    document: { sources: [{ id: 'dutt-tribune-2005' }] },
    why: {
      text: {
        en: "The Tribune's front-page report on Wednesday 10 April 1929 really read this. The leaflets were pink, and the accused said neither of them had a pistol when they gave themselves up, but the paper printed 'Red' and 'fired pistols'. A paper's report, right or wrong, is not a forgery.",
        hi: "10 अप्रैल 1929, बुधवार को द ट्रिब्यून की पहले पन्ने की ख़बर सचमुच यही थी। पर्चे गुलाबी थे, और आरोपियों ने कहा कि गिरफ़्तारी देते वक़्त उनमें से किसी के पास पिस्तौल नहीं थी, फिर भी अख़बार ने 'लाल' और 'पिस्तौलें चलाईं' छापा। अख़बार की ख़बर, सही हो या ग़लत, जालसाज़ी नहीं होती।",
      },
      sources: [{ id: 'dutt-tribune-2005' }, IRWIN_PINK, { id: 'bs-joint-statement' }],
    },
  },

  // Day 9, Wednesday 10 April: Motilal Nehru's statement in the Times of India.
  {
    id: 'lh-motilal-g',
    tier: 3,
    real: true,
    pair: 'lh-motilal',
    onDay: 9,
    from: SWAMI,
    to: POST_BOX,
    text: {
      en: "The Times of India today prints Motilal Nehru's statement: 'The choice lies between Gandhi and Balraj.' So Balraj is in the big papers now. — Swami",
      hi: "आज टाइम्स ऑफ़ इंडिया में मोतीलाल नेहरू का बयान छपा है: 'फ़ैसला गांधी और बलराज के बीच करना है।' तो अब बलराज बड़े अख़बारों में है। — स्वामी",
    },
    checks: { en: ['Motilal Nehru', 'Gandhi and Balraj'], hi: ['मोतीलाल नेहरू', 'गांधी और बलराज'] },
    why: {
      text: {
        en: "On Wednesday 10 April 1929 the Times of India printed Motilal Nehru's statement with the line 'The choice lies between Gandhi and Balraj', using the name signed on the leaflets.",
        hi: "10 अप्रैल 1929, बुधवार को टाइम्स ऑफ़ इंडिया ने मोतीलाल नेहरू का बयान छापा, जिसमें लिखा था 'फ़ैसला गांधी और बलराज के बीच करना है'। उन्होंने वही नाम लिया जो पर्चों पर दस्तख़त में था।",
      },
      sources: [{ id: 'maclean-balraj', loc: 'n. 2 (Times of India, 10 April 1929, p. 9)' }],
    },
  },
  {
    id: 'lh-motilal-f',
    tier: 3,
    real: false,
    pair: 'lh-motilal',
    onDay: 9,
    from: SWAMI,
    to: POST_BOX,
    text: {
      en: "The Times of India today prints Motilal Nehru's statement: 'The choice lies between Gandhi and Bhagat Singh.' So our friend is in the big papers now. — Swami",
      hi: "आज टाइम्स ऑफ़ इंडिया में मोतीलाल नेहरू का बयान छपा है: 'फ़ैसला गांधी और भगत सिंह के बीच करना है।' तो अब हमारा दोस्त बड़े अख़बारों में है। — स्वामी",
    },
    checks: { en: ['Gandhi and Bhagat Singh'], hi: ['गांधी और भगत सिंह'] },
    tells: [
      {
        kind: 'knowledge',
        explain: {
          en: "Motilal Nehru wrote 'The choice lies between Gandhi and Balraj'. He used the name signed on the leaflets, the very name your rulebook tells you to look for.",
          hi: "मोतीलाल नेहरू ने लिखा था 'फ़ैसला गांधी और बलराज के बीच करना है'। उन्होंने वही नाम लिया जो पर्चों पर दस्तख़त में था, वही नाम जिसे पहचानना तुम्हारे नियम सिखाते हैं।",
        },
        sources: [{ id: 'maclean-balraj', loc: 'n. 2 (Times of India, 10 April 1929, p. 9)' }],
      },
      {
        kind: 'knowledge',
        explain: {
          en: "And on 10 April even The Tribune did not know his name: it called the pair 'two young men, one a Punjabi and the other a Bengali'.",
          hi: "और 10 अप्रैल तक द ट्रिब्यून को भी उनका नाम नहीं पता था: उसने दोनों को 'दो नौजवान, एक पंजाबी और दूसरा बंगाली' लिखा।",
        },
        sources: [{ id: 'dutt-tribune-2005' }],
      },
    ],
  },

  // Day 10, Thursday 11 April: the Assembly meets again.
  {
    id: 'lh-motion-g',
    tier: 3,
    real: true,
    pair: 'lh-motion',
    onDay: 10,
    from: SWAMI,
    to: POST_BOX,
    text: {
      en: "The Assembly met again today and passed, without one voice against, a motion of 'horror and indignation at the dastardly outrage'. Their words, not ours. Then President Patel ruled the Public Safety Bill motion out of order. — Swami",
      hi: "आज असेंबली फिर बैठी और सबने एक राय से प्रस्ताव पास किया कि उन्हें इस 'कायराना वारदात' पर 'दहशत और ग़ुस्सा' है। ये उनके शब्द हैं, हमारे नहीं। फिर प्रेसिडेंट पटेल ने पब्लिक सेफ़्टी बिल वाला प्रस्ताव नियम के ख़िलाफ़ बताकर रोक दिया। — स्वामी",
    },
    checks: {
      en: ['dastardly outrage', 'Their words, not ours', 'out of order'],
      hi: ['कायराना वारदात', 'ये उनके शब्द हैं, हमारे नहीं', 'नियम के ख़िलाफ़'],
    },
    why: {
      text: {
        en: "On Thursday 11 April 1929 President Vithalbhai Patel moved a motion, passed unanimously, recording the House's 'horror and indignation at the dastardly outrage'. Straight after, he ruled the government's Public Safety Bill motion out of order. The government's word is in quotation marks: the comrade reports it, he doesn't use it.",
        hi: "11 अप्रैल 1929, गुरुवार को प्रेसिडेंट विट्ठलभाई पटेल ने प्रस्ताव रखा, जो सबकी सहमति से पास हुआ, कि सदन को इस 'कायराना वारदात' पर 'दहशत और ग़ुस्सा' है। इसके फ़ौरन बाद उन्होंने सरकार का पब्लिक सेफ़्टी बिल वाला प्रस्ताव नियम के ख़िलाफ़ बताकर रोक दिया। सरकारी शब्द उद्धरण में है: साथी उसे बता रहा है, ख़ुद इस्तेमाल नहीं कर रहा।",
      },
      sources: [ASSEMBLY_CH],
    },
  },
  {
    id: 'lh-motion-f',
    tier: 2,
    real: false,
    pair: 'lh-motion',
    onDay: 10,
    from: SWAMI,
    to: POST_BOX,
    text: {
      en: 'The Assembly met again today. After our outrage, they passed the Public Safety Bill at once. — Swami',
      hi: 'आज असेंबली फिर बैठी। हमारी वारदात के बाद उन्होंने फ़ौरन पब्लिक सेफ़्टी बिल पास कर दिया। — स्वामी',
    },
    checks: { en: ['our outrage', 'passed the Public Safety Bill'], hi: ['हमारी वारदात', 'पब्लिक सेफ़्टी बिल पास कर दिया'] },
    tells: [
      {
        kind: 'habit',
        explain: {
          en: "A comrade calling his own act 'our outrage' is speaking police.",
          hi: "जो साथी अपने काम को 'हमारी वारदात' कहे, वह पुलिस की ज़बान बोल रहा है।",
        },
        ruleId: 'r-police-words',
        sources: [ASSEMBLY_CH],
      },
      {
        kind: 'knowledge',
        explain: {
          en: 'And the Bill did not pass that day: President Patel ruled the motion on it out of order.',
          hi: 'और उस दिन बिल पास भी नहीं हुआ: प्रेसिडेंट पटेल ने उसका प्रस्ताव नियम के ख़िलाफ़ बताकर रोक दिया।',
        },
        sources: [ASSEMBLY_CH],
      },
    ],
  },

  // Day 11, Friday 12 April: Bande Mataram prints the photographs.
  {
    id: 'lh-papers-g',
    tier: 2,
    real: true,
    pair: 'lh-papers',
    onDay: 11,
    from: VILLAGER,
    to: POST_BOX,
    text: {
      en: 'Today, {weekday}, Bande Mataram prints the photographs of our two friends. Cut them out and keep them flat. — Villager',
      hi: 'आज, {weekday} को, बंदे मातरम अख़बार में हमारे दोनों दोस्तों की तस्वीरें छपी हैं। काटकर बिना मोड़े रख लेना। — विलेजर',
    },
    checks: { en: ['Today,', 'Bande Mataram'], hi: ['आज,', 'बंदे मातरम अख़बार'] },
    why: {
      text: {
        en: "Lahore's Bande Mataram printed the photographs in its issue of Friday 12 April 1929; copies had been on sale in Lahore since the day before.",
        hi: 'लाहौर के अख़बार बंदे मातरम ने 12 अप्रैल 1929, शुक्रवार के अंक में ये तस्वीरें छापीं; एक दिन पहले से ये लाहौर में बिक रही थीं।',
      },
      sources: [{ id: 'chaman-lal-2009' }],
    },
  },
  {
    id: 'lh-papers-f',
    tier: 2,
    real: false,
    pair: 'lh-papers',
    onDay: 11,
    from: VILLAGER,
    to: POST_BOX,
    text: {
      en: 'Today, {weekday+1}, Bande Mataram prints the photographs of our two friends. Cut them out and keep them flat. — Villager',
      hi: 'आज, {weekday+1} को, बंदे मातरम अख़बार में हमारे दोनों दोस्तों की तस्वीरें छपी हैं। काटकर बिना मोड़े रख लेना। — विलेजर',
    },
    checks: { en: ['Today,'], hi: ['आज,'] },
    tells: [
      {
        kind: 'weekday',
        explain: {
          en: "Check today's date: it is not that weekday. A note written today would know what day it is.",
          hi: 'आज की तारीख़ देखो: उस तारीख़ को यह दिन नहीं पड़ता। आज लिखे पर्चे को आज का दिन पता होता।',
        },
      },
    ],
  },

  // Day 14, Monday 15 April: the raid on House No. 69.
  {
    id: 'lh-raid-g',
    tier: 2,
    real: true,
    pair: 'lh-raid',
    onDay: 14,
    from: BC,
    to: POST_BOX,
    text: {
      en: 'Keep away from McLeod Road. The police broke into No. 69 soon after seven this morning. Villager and two others are taken. Move nothing, see no one, wait. — B.C.',
      hi: 'मैक्लोड रोड से दूर रहना। आज सुबह सात बजे के कुछ देर बाद पुलिस नंबर 69 में घुस गई। विलेजर और दो और पकड़े गए। कुछ भी इधर-उधर मत करना, किसी से मत मिलना, इंतज़ार करना। — बी.सी.',
    },
    checks: { en: ['No. 69', 'soon after seven this morning'], hi: ['नंबर 69', 'सात बजे के कुछ देर बाद'] },
    why: {
      text: {
        en: 'On Monday 15 April 1929, soon after a 7 a.m. phone tip, police raided House No. 69, Kashmir Buildings, which they had traced through a blacksmith and sulphur stains on the drain spout. They arrested Sukhdev, Kishori Lal and Jai Gopal. B.C. (Bhagwati Charan), in whose name the room was rented, was not caught.',
        hi: '15 अप्रैल 1929, सोमवार को सुबह 7 बजे फ़ोन पर ख़बर मिलने के कुछ देर बाद पुलिस ने कश्मीर बिल्डिंग्स के मकान नंबर 69 पर छापा मारा। सुराग़ एक लोहार से मिला था, और परनाले पर गंधक के दाग़ थे। सुखदेव, किशोरी लाल और जयगोपाल गिरफ़्तार हुए। बी.सी. (भगवती चरण), जिनके नाम पर कमरा था, नहीं पकड़े गए।',
      },
      sources: [RAID_CH, { id: 'noorani-1996', loc: "ch. 'Hour of Trial', p. 52 (absconders)" }],
    },
  },
  {
    id: 'lh-raid-f',
    tier: 2,
    real: false,
    pair: 'lh-raid',
    onDay: 14,
    from: BC,
    to: POST_BOX,
    text: {
      en: 'Keep away from McLeod Road. The police broke into No. 69 soon after seven this morning. A man will come for the zinc handbag within the hour. He has no keys, there was no time. Give it to him. — B.C.',
      hi: 'मैक्लोड रोड से दूर रहना। आज सुबह सात बजे के कुछ देर बाद पुलिस नंबर 69 में घुस गई। एक घंटे के अंदर एक आदमी जस्ते का हैंडबैग लेने आएगा। उसके पास चाबियाँ नहीं हैं, वक़्त ही नहीं था। उसे दे देना। — बी.सी.',
    },
    checks: { en: ['He has no keys'], hi: ['उसके पास चाबियाँ नहीं हैं'] },
    tells: [
      {
        kind: 'habit',
        explain: {
          en: 'No keys, no parcel, and a raid is exactly when that rule matters most. The police had just taken three men; now they wanted the bag.',
          hi: 'चाबी नहीं, तो सामान नहीं, और छापे के दिन तो यह नियम सबसे ज़रूरी है। पुलिस अभी तीन लोगों को पकड़ चुकी थी; अब उसे बैग चाहिए था।',
        },
        ruleId: 'r-keys',
        sources: [KEYS_EVIDENCE, RAID_CH],
      },
    ],
  },
]
