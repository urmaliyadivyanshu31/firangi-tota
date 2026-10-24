import type { L10n, Message } from '../../types.js'

// Window: Tuesday 2 April (day 1) to Monday 15 April 1929 (day 14).
// Day 5 = Sat 6 Apr, day 6 = Sun 7 Apr, day 7 = Mon 8 Apr, day 8 = Tue 9 Apr,
// day 9 = Wed 10 Apr, day 10 = Thu 11 Apr, day 11 = Fri 12 Apr, day 12 = Sat 13 Apr,
// day 14 = Mon 15 Apr.
// Story pass: one storyline. Lahore waits while our friend prepares in Delhi (days 1–6),
// the Assembly action (day 7), the news and the Raj's answer (days 8–12), the raid (day 14).
// Messages without onDay must hold true on every day of the window, so they never
// mention the Assembly action or the raid. Tells a player can only catch through a
// rulebook rule carry ruleId, so the engine never shows them (or their twin) earlier.
// Minimalist cut: one idea per message; the case file carries the context. A signature
// stays in the text only where the slip is in it.

const POST_BOX: L10n = { en: 'Post box', hi: 'पोस्ट बॉक्स' }
const PUBLIC: L10n = { en: 'The public', hi: 'आम जनता' }
const VILLAGER: L10n = { en: 'Villager', hi: 'विलेजर' }
const M: L10n = { en: 'M', hi: 'एम' }
const SWAMI: L10n = { en: 'Swami', hi: 'स्वामी' }
const DYAL: L10n = { en: 'Dyal', hi: 'दयाल' }
const PANDITJI: L10n = { en: 'Panditji', hi: 'पंडितजी' }
const BC: L10n = { en: 'B.C.', hi: 'बी.सी.' }
const BALRAJ_CIC: L10n = { en: 'Balraj, Commander-in-Chief', hi: 'बलराज, कमांडर-इन-चीफ़' }
const ASSEMBLY_TO: L10n = { en: 'Members of the Assembly', hi: 'असेंबली के सदस्य' }
const BS: L10n = { en: 'B. S', hi: 'बी. एस' }
const FOR_VILLAGER: L10n = { en: 'For Villager', hi: 'विलेजर के लिए' }

const CHAMAN = { id: 'chaman-lal-2009' }
const SCHEDULE = { id: 'noorani-1996', loc: 'Ordinance No. III of 1930, Schedule, pp. 295–296' }
const KEYS_EVIDENCE = { id: 'noorani-1996', loc: "ch. 'Trial by Tribunal', pp. 141–142 (Jai Gopal's evidence)" }
const SAUNDERS_CH = { id: 'noorani-1996', loc: "ch. 'Saunders Murder', pp. 19–25" }
const IRWIN_PINK = { id: 'noorani-1996', loc: 'p. 45, Irwin to the Secretary of State, 19 April 1929' }
const ASSEMBLY_CH = { id: 'noorani-1996', loc: "ch. 'Bombs in the Central Assembly', pp. 43–44" }
const RAID_CH = { id: 'noorani-1996', loc: "ch. 'Hour of Trial', pp. 57–64" }
const GHOSH = { id: 'ghosh-1945', loc: 'pp. 34–35' }
const DOC64 = { id: 'chaman-lal-reader', loc: 'document 64' }
const MOTILAL = { id: 'maclean-balraj', loc: 'n. 2 (Times of India, 10 April 1929, p. 9)' }

const NOTICE_DEC_EN = (sig: string) =>
  `HINDUSTAN SOCIALIST REPUBLICAN ARMY. NOTICE. J.P. Saunders is dead; Lala Lajpat Rai is avenged … Sorry for the death of a man … Sd/- ${sig}, Dated 18th December, 1928.`
const NOTICE_DEC_HI = (sig: string) =>
  `हिंदुस्तान सोशलिस्ट रिपब्लिकन आर्मी। नोटिस। सॉन्डर्स मर गया; लाला लाजपत राय का बदला ले लिया गया … एक इंसान की मौत का हमें अफ़सोस है … दस्तख़त: ${sig}, तारीख़ 18 दिसंबर 1928।`

// The notice of 23 December 1928, trimmed to its warning against helping the police.
const NOTICE_23_EN = (whom: string) =>
  `The Hindustan Socialist Republican Army. Notice … abstain from offering any sort of assistance to our enemy the police in finding out ${whom} … Balraj, Commander-in-chief.`
const NOTICE_23_HI = (whom: string) =>
  `हिंदुस्तान सोशलिस्ट रिपब्लिकन आर्मी। नोटिस … हमारी दुश्मन पुलिस को ${whom} ढूँढने में किसी तरह की मदद मत करो … बलराज, कमांडर-इन-चीफ़।`

const LEAFLET_EN = (heading: string) =>
  `${heading} (NOTICE). It takes a loud voice to make the deaf hear … Long Live the Revolution. Signed, Balraj, Commander-in-Chief.`
const LEAFLET_HI = (heading: string) =>
  `${heading} (नोटिस)। बहरों को सुनाने के लिए ऊँची आवाज़ चाहिए … इंक़लाब ज़िंदाबाद। दस्तख़त: बलराज, कमांडर-इन-चीफ़।`

const LETTER_OPEN_EN = 'Dear Brother, By the time you receive this letter I will be gone'
const LETTER_OPEN_HI = 'प्यारे भाई, जब तक यह चिट्ठी तुम्हें मिलेगी, मैं जा चुका होऊँगा'

const ASSEMBLY_EN = (day: string, president = 'Vithalbhai') =>
  `Yesterday, ${day}, about half past twelve, as President ${president} Patel rose, two bombs burst in the Assembly. Our two friends waited to be arrested.`
const ASSEMBLY_HI = (day: string, president = 'विट्ठलभाई') =>
  `कल, ${day} को, करीब साढ़े बारह बजे, जब प्रेसिडेंट ${president} पटेल उठे, असेंबली में दो बम फटे। हमारे दोनों दोस्त गिरफ़्तारी के इंतज़ार में खड़े रहे।`

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
      en: 'A zinc handbag comes tonight. Give it only to whoever shows the keys. — Villager',
      hi: 'आज रात जस्ते का एक हैंडबैग आएगा। उसे सिर्फ़ उसी को देना जो चाबियाँ दिखाए। — विलेजर',
    },
    checks: { en: ['whoever shows the keys', 'Villager'], hi: ['जो चाबियाँ दिखाए', 'विलेजर'] },
    why: {
      text: {
        en: "Villager was Sukhdev's party name; the keys rule is on record.",
        hi: "'विलेजर' सुखदेव का पार्टी नाम था; चाबियों वाला नियम रिकॉर्ड में है।",
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
      en: 'A zinc handbag comes tonight. Give it only to whoever shows the keys. — Farmer',
      hi: 'आज रात जस्ते का एक हैंडबैग आएगा। उसे सिर्फ़ उसी को देना जो चाबियाँ दिखाए। — फ़ार्मर',
    },
    checks: { en: ['whoever shows the keys', 'Farmer'], hi: ['जो चाबियाँ दिखाए', 'फ़ार्मर'] },
    tells: [
      {
        kind: 'name',
        explain: { en: 'Sukhdev signed Villager, not Farmer.', hi: "सुखदेव 'विलेजर' लिखते थे, 'फ़ार्मर' नहीं।" },
        factId: 'sukhdev',
        sources: [SCHEDULE],
      },
    ],
  },

  {
    id: 'lh-alias-m-g',
    tier: 1,
    real: true,
    pair: 'lh-alias-m',
    from: M,
    to: POST_BOX,
    text: {
      en: 'Hold any letter for me until Panditji asks for it. — M',
      hi: 'मेरी कोई चिट्ठी आए, तो पंडितजी के माँगने तक रखना। — एम',
    },
    checks: { en: ['Panditji', '— M'], hi: ['पंडितजी', '— एम'] },
    verify: { '— M': 'fact:aliases' },
    why: {
      text: { en: "M was Rajguru's party name; Panditji was Azad's.", hi: "'एम' राजगुरु का पार्टी नाम था, 'पंडितजी' आज़ाद का।" },
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
      en: 'Hold any letter for me until Panditji asks for it. — Shivram Rajguru',
      hi: 'मेरी कोई चिट्ठी आए, तो पंडितजी के माँगने तक रखना। — शिवराम राजगुरु',
    },
    checks: { en: ['Panditji', 'Shivram Rajguru'], hi: ['पंडितजी', 'शिवराम राजगुरु'] },
    tells: [
      {
        kind: 'name',
        explain: { en: "Rajguru signed 'M', never his full real name.", hi: "राजगुरु 'एम' लिखते थे, अपना पूरा असली नाम कभी नहीं।" },
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
      en: "Keep Rs 13 ready for the McLeod Road room's rent.",
      hi: 'मैक्लोड रोड वाले कमरे के किराए के 13 रुपये तैयार रखो।',
    },
    checks: { en: ['Rs 13', 'McLeod Road'], hi: ['13 रुपये', 'मैक्लोड रोड'] },
    why: {
      text: { en: 'The McLeod Road room was rented at Rs 13 a month.', hi: 'मैक्लोड रोड वाला कमरा 13 रुपये महीने पर लिया गया था।' },
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
      en: "Keep Rs 31 ready for the McLeod Road room's rent.",
      hi: 'मैक्लोड रोड वाले कमरे के किराए के 31 रुपये तैयार रखो।',
    },
    checks: { en: ['Rs 31', 'McLeod Road'], hi: ['31 रुपये', 'मैक्लोड रोड'] },
    tells: [
      {
        kind: 'number',
        explain: { en: 'The rent was Rs 13, not Rs 31.', hi: 'किराया 13 रुपये था, 31 नहीं।' },
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
      en: 'If police ask where you were on Monday, 17 December, at four: studying at home. Then burn this.',
      hi: 'पुलिस पूछे कि 17 दिसंबर, सोमवार को चार बजे कहाँ थे, तो कहना: घर पर पढ़ रहा था। फिर यह जला देना।',
    },
    checks: { en: ['Monday, 17 December', 'at four'], hi: ['17 दिसंबर, सोमवार', 'चार बजे'] },
    verify: { 'at four': 'fact:saunders' },
    why: {
      text: { en: 'Saunders was shot about 4 p.m., Monday 17 December 1928.', hi: 'सॉन्डर्स को 17 दिसंबर 1928, सोमवार, शाम करीब 4 बजे गोली लगी।' },
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
      en: 'If police ask where you were on Saturday, 15 December, at four: studying at home. Then burn this.',
      hi: 'पुलिस पूछे कि 15 दिसंबर, शनिवार को चार बजे कहाँ थे, तो कहना: घर पर पढ़ रहा था। फिर यह जला देना।',
    },
    checks: { en: ['Saturday, 15 December', 'at four'], hi: ['15 दिसंबर, शनिवार', 'चार बजे'] },
    verify: { 'at four': 'fact:saunders' },
    tells: [
      {
        kind: 'date',
        explain: {
          en: "It was Monday 17 December, not the 15th (a 1972 book's misprint).",
          hi: '17 दिसंबर, सोमवार था, 15 नहीं (यह 1972 की एक किताब की छपाई की ग़लती है)।',
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
      en: "In December our friend left Lahore first class, a sahib with 'wife', child, and M carrying the tiffin. If asked, you know nothing.",
      hi: "दिसंबर में हमारा दोस्त लाहौर से फ़र्स्ट क्लास में निकला: साहब बनकर, साथ में 'पत्नी', बच्चा, और टिफ़िन उठाए एम। कोई पूछे, तो तुम्हें कुछ नहीं पता।",
    },
    checks: { en: ['first class'], hi: ['फ़र्स्ट क्लास'] },
    why: {
      text: {
        en: 'Bhagat Singh left first class on 20 December 1928, Rajguru as servant.',
        hi: 'भगत सिंह 20 दिसंबर 1928 को फ़र्स्ट क्लास से निकले, राजगुरु नौकर बने।',
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
      en: "In December our friend left Lahore third class, a sahib with 'wife', child, and M carrying the tiffin. If asked, you know nothing.",
      hi: "दिसंबर में हमारा दोस्त लाहौर से थर्ड क्लास में निकला: साहब बनकर, साथ में 'पत्नी', बच्चा, और टिफ़िन उठाए एम। कोई पूछे, तो तुम्हें कुछ नहीं पता।",
    },
    checks: { en: ['third class'], hi: ['थर्ड क्लास'] },
    tells: [
      {
        kind: 'number',
        explain: {
          en: "First class, not third: a 'young official' had to look the part.",
          hi: "फ़र्स्ट क्लास, थर्ड नहीं: 'नौजवान अफ़सर' को अफ़सर जैसा दिखना था।",
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
    checks: { en: ['J.P. Saunders is dead', 'Sd/- Balraj'], hi: ['सॉन्डर्स मर गया', 'बलराज'] },
    document: { sources: [{ id: 'hsra-notice-1928' }] },
    why: {
      text: {
        en: "The real notice signed 'Balraj', pasted up on 18–19 December 1928.",
        hi: "'बलराज' के दस्तख़त वाला असली नोटिस, 18–19 दिसंबर 1928 की रात चिपका।",
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
    checks: { en: ['J.P. Saunders is dead', 'Sd/- Baldev'], hi: ['सॉन्डर्स मर गया', 'बलदेव'] },
    tells: [
      {
        kind: 'name',
        explain: { en: 'Notices were signed Balraj, not Baldev.', hi: "नोटिसों पर 'बलराज' के दस्तख़त थे, 'बलदेव' के नहीं।" },
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
      en: 'If a new boy asks: we became the HSRA at Feroz Shah Kotla in September. Nothing more.',
      hi: 'नया लड़का पूछे, तो बस इतना: हम सितंबर में फ़िरोज़शाह कोटला में एच.एस.आर.ए. बने। इससे ज़्यादा कुछ नहीं।',
    },
    checks: { en: ['HSRA', 'Feroz Shah Kotla', 'in September'], hi: ['एच.एस.आर.ए.', 'फ़िरोज़शाह कोटला', 'सितंबर में'] },
    why: {
      text: {
        en: 'The HRA became the HSRA at Feroz Shah Kotla, 8–9 September 1928.',
        hi: 'एच.आर.ए. 8–9 सितंबर 1928 को फ़िरोज़शाह कोटला में एच.एस.आर.ए. बनी।',
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
      en: 'If a new boy asks: we became the HSRA at Feroz Shah Kotla in December. Nothing more.',
      hi: 'नया लड़का पूछे, तो बस इतना: हम दिसंबर में फ़िरोज़शाह कोटला में एच.एस.आर.ए. बने। इससे ज़्यादा कुछ नहीं।',
    },
    checks: { en: ['HSRA', 'Feroz Shah Kotla', 'in December'], hi: ['एच.एस.आर.ए.', 'फ़िरोज़शाह कोटला', 'दिसंबर में'] },
    tells: [
      {
        kind: 'date',
        explain: {
          en: "September 1928, not December (a 1972 book's misprint).",
          hi: 'सितंबर 1928, दिसंबर नहीं (1972 की एक किताब की छपाई की ग़लती)।',
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
      en: 'Tell the new boys why we fight: lathis fell on Lajpat Rai on 30 October, and he died on 17 November.',
      hi: 'नए लड़कों को बताओ कि हम क्यों लड़ते हैं: 30 अक्टूबर को लाजपत राय पर लाठियाँ बरसीं, और 17 नवंबर को उनकी मौत हो गई।',
    },
    checks: { en: ['Lajpat Rai', '30 October', '17 November'], hi: ['लाजपत राय', '30 अक्टूबर', '17 नवंबर'] },
    why: {
      text: {
        en: 'Lajpat Rai was beaten on 30 October and died on 17 November 1928.',
        hi: 'लाजपत राय 30 अक्टूबर को पीटे गए और 17 नवंबर 1928 को उनकी मौत हुई।',
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
      en: 'Tell the new boys why we fight: lathis fell on Lajpat Rai on 30 October, and he died on 17 December.',
      hi: 'नए लड़कों को बताओ कि हम क्यों लड़ते हैं: 30 अक्टूबर को लाजपत राय पर लाठियाँ बरसीं, और 17 दिसंबर को उनकी मौत हो गई।',
    },
    checks: { en: ['Lajpat Rai', '30 October', '17 December'], hi: ['लाजपत राय', '30 अक्टूबर', '17 दिसंबर'] },
    tells: [
      {
        kind: 'date',
        explain: {
          en: 'He died 17 November, not 17 December, the day Saunders was shot.',
          hi: 'मौत 17 नवंबर को हुई, 17 दिसंबर को नहीं; उस दिन सॉन्डर्स को गोली लगी।',
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
      en: 'A new man brings a note from Panditji. Give him tea, and ask nothing about his past.',
      hi: 'पंडितजी की चिट्ठी लेकर एक नया आदमी आएगा। उसे चाय पिलाना, और उसकी पिछली ज़िंदगी के बारे में कुछ मत पूछना।',
    },
    checks: { en: ['note from Panditji', 'ask nothing about his past'], hi: ['पंडितजी की चिट्ठी', 'कुछ मत पूछना'] },
    verify: { 'ask nothing about his past': 'rule:r-past' },
    why: {
      text: {
        en: "Never asking a comrade's past was the party code (Ajoy Ghosh).",
        hi: 'साथी से पिछली ज़िंदगी न पूछना पार्टी का नियम था (अजय घोष)।',
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
      en: "A new man brings a note from Panditji … First get his real name, village and father's name for me.",
      hi: 'पंडितजी की चिट्ठी लेकर एक नया आदमी आएगा … पहले उसका असली नाम, गाँव और पिता का नाम पता करके मुझे भेजो।',
    },
    checks: { en: ['note from Panditji', "real name, village and father's name"], hi: ['पंडितजी की चिट्ठी', 'असली नाम, गाँव और पिता का नाम'] },
    tells: [
      {
        kind: 'habit',
        explain: {
          en: "The party never asked a comrade's past; police files did.",
          hi: 'पार्टी कभी साथी की पिछली ज़िंदगी नहीं पूछती थी; पुलिस की फ़ाइलें पूछती थीं।',
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
      en: 'Someone may come for the bundle in my name … No keys, no bundle, even if he weeps.',
      hi: 'कोई मेरे नाम से गठरी लेने आ सकता है … चाबियाँ नहीं, तो गठरी नहीं, चाहे वह रो दे।',
    },
    checks: { en: ['No keys, no bundle'], hi: ['चाबियाँ नहीं, तो गठरी नहीं'] },
    verify: { 'No keys, no bundle': 'rule:r-keys' },
    why: {
      text: {
        en: "Hand things only to whoever shows the keys: Sukhdev's own rule.",
        hi: 'सामान सिर्फ़ चाबी दिखाने वाले को: यह सुखदेव का अपना नियम था।',
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
      en: 'My cousin comes for the bundle today. He has no keys; give it to him anyway.',
      hi: 'आज मेरा चचेरा भाई गठरी लेने आएगा। उसके पास चाबियाँ नहीं हैं; फिर भी उसे दे देना।',
    },
    checks: { en: ['He has no keys'], hi: ['उसके पास चाबियाँ नहीं हैं'] },
    tells: [
      {
        kind: 'habit',
        explain: { en: 'Keys, not cousins: no keys means no parcel.', hi: 'चाबी चाहिए, रिश्तेदारी नहीं: चाबी नहीं, तो सामान नहीं।' },
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
      en: 'Since our action in December, constables who know our friend have been posted at big junctions. Travel only if you must.',
      hi: 'दिसंबर वाली हमारी कार्रवाई के बाद से बड़े जंक्शनों पर हमारे दोस्त को पहचानने वाले सिपाही तैनात किए गए हैं। बहुत ज़रूरी हो, तभी सफ़र करना।',
    },
    checks: { en: ['our action', 'in December'], hi: ['हमारी कार्रवाई', 'दिसंबर वाली'] },
    why: {
      text: {
        en: "Comrades said 'action'; constables who knew him watched the junctions (Sanyal).",
        hi: "साथी 'कार्रवाई' कहते थे; उन्हें पहचानने वाले सिपाही जंक्शनों पर तैनात थे (सान्याल)।",
      },
      sources: [DOC64, { id: 'sanyal-1931', loc: 'ch. V' }],
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
      en: 'Since our outrage in December, constables who know our friend have been posted at big junctions. Travel only if you must.',
      hi: 'दिसंबर वाली हमारी वारदात के बाद से बड़े जंक्शनों पर हमारे दोस्त को पहचानने वाले सिपाही तैनात किए गए हैं। बहुत ज़रूरी हो, तभी सफ़र करना।',
    },
    checks: { en: ['our outrage', 'in December'], hi: ['हमारी वारदात', 'दिसंबर वाली'] },
    tells: [
      {
        kind: 'habit',
        explain: {
          en: "Comrades said 'action', not 'outrage'; that was police talk.",
          hi: "साथी 'कार्रवाई' कहते थे, 'वारदात' नहीं; वह पुलिस की ज़बान थी।",
        },
        ruleId: 'r-police-words',
        sources: [DOC64, ASSEMBLY_CH],
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
      en: 'Dated {weekday}, {date}. Be at the usual place after dark; the man with the keys will find you.',
      hi: 'तारीख़: {weekday}, {date}। अँधेरा होने के बाद हमेशा वाली जगह आना; चाबियों वाला आदमी तुम्हें ढूँढ लेगा।',
    },
    checks: { en: ['Dated', 'the keys'], hi: ['तारीख़:', 'चाबियों वाला'] },
    verify: { 'Dated': 'calendar' },
    why: {
      text: { en: 'The date and weekday match; nothing here breaks a rule.', hi: 'तारीख़ और दिन मेल खाते हैं; कोई नियम नहीं टूटता।' },
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
      en: 'Dated {weekday+1}, {date}. Be at the usual place after dark; the man with the keys will find you.',
      hi: 'तारीख़: {weekday+1}, {date}। अँधेरा होने के बाद हमेशा वाली जगह आना; चाबियों वाला आदमी तुम्हें ढूँढ लेगा।',
    },
    checks: { en: ['Dated', 'the keys'], hi: ['तारीख़:', 'चाबियों वाला'] },
    verify: { 'Dated': 'calendar' },
    tells: [
      {
        kind: 'weekday',
        ruleId: 'r-weekday',
        explain: {
          en: "Wrong weekday for today's date: a plant typed up in advance.",
          hi: 'आज की तारीख़ का दिन ग़लत है: पहले से तैयार किया जाली पर्चा।',
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
      en: 'The new paper has come: pink, heading already printed. Keep it flat, away from the lantern.',
      hi: 'नया काग़ज़ आ गया है: गुलाबी, हेडिंग पहले से छपी हुई। उसे बिना मोड़े, लालटेन से दूर रखना।',
    },
    checks: { en: ['pink', 'heading', 'printed'], hi: ['गुलाबी', 'हेडिंग', 'छपी हुई'] },
    why: {
      text: {
        en: 'Pink paper with a printed heading, as the Viceroy himself reported.',
        hi: 'छपी हेडिंग वाला गुलाबी काग़ज़, जैसा ख़ुद वायसराय ने लिखा।',
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
      en: 'The new paper has come: plain white, heading to write by hand. Keep it flat, away from the lantern.',
      hi: 'नया काग़ज़ आ गया है: सादा सफ़ेद, हेडिंग हाथ से लिखनी है। उसे बिना मोड़े, लालटेन से दूर रखना।',
    },
    checks: { en: ['plain white', 'heading', 'by hand'], hi: ['सादा सफ़ेद', 'हेडिंग', 'हाथ से'] },
    tells: [
      {
        kind: 'form',
        explain: { en: 'Pink paper with a printed heading, not plain white.', hi: 'छपी हेडिंग वाला गुलाबी काग़ज़, सादा सफ़ेद नहीं।' },
        factId: 'notices',
        ruleId: 'r-pink',
        sources: [IRWIN_PINK],
      },
    ],
  },

  // ───────────── Tier 3 and look-alikes (Hard) ─────────────

  {
    id: 'lh-notice-23-g',
    tier: 2,
    real: true,
    pair: 'lh-notice-23',
    from: BALRAJ_CIC,
    to: PUBLIC,
    text: { en: NOTICE_23_EN('our clues'), hi: NOTICE_23_HI('हमारे सुराग़') },
    checks: { en: ['our clues', 'Balraj, Commander-in-chief'], hi: ['हमारे सुराग़', 'बलराज, कमांडर-इन-चीफ़'] },
    verify: { 'our clues': 'rule:r-police-words' },
    document: { sources: [DOC64] },
    why: {
      text: {
        en: 'The real notice of 23 December 1928, warning Lahore not to help police.',
        hi: '23 दिसंबर 1928 का असली नोटिस: लाहौर को चेतावनी कि पुलिस की मदद न करे।',
      },
      sources: [DOC64],
    },
  },
  {
    id: 'lh-notice-23-f',
    tier: 2,
    real: false,
    pair: 'lh-notice-23',
    from: BALRAJ_CIC,
    to: PUBLIC,
    text: { en: NOTICE_23_EN('the miscreants'), hi: NOTICE_23_HI('बदमाशों को') },
    checks: { en: ['the miscreants', 'Balraj, Commander-in-chief'], hi: ['बदमाशों को', 'बलराज, कमांडर-इन-चीफ़'] },
    tells: [
      {
        kind: 'habit',
        explain: {
          en: "The notice said 'our clues'; 'miscreants' is the police word.",
          hi: "नोटिस में 'हमारे सुराग़' लिखा था; 'बदमाश' पुलिस का शब्द है।",
        },
        ruleId: 'r-police-words',
        sources: [DOC64],
      },
    ],
  },

  // Azad's December escape. Disguise: Maclean (Scroll), 'a panda … ramnami angochha shawl',
  // escorting Sukhdev's mother and sister; Sanyal, 'a pilgrim-party for Muttra'.

  // Gandhi and Congress in 1929: the Calcutta deadline (Dec 1928) vs Purna Swaraj (Lahore, Dec 1929).

  // Jatin Das: his jail hunger strike began in July 1929 (Reader chronology), so not in April.



  // Ajit Singh: 'deported, together with Lala Lajpat Rai, in 1907. For many years he had been an
  // exile abroad' (Nehru). He came back only in the 1940s (Tribune 2010: 1946; others say 1947).
  {
    id: 'lh-ajit-g',
    tier: 3,
    real: true,
    minMode: 'hard',
    pair: 'lh-ajit',
    from: DYAL,
    to: POST_BOX,
    text: {
      en: "Our friend's uncle, Ajit Singh, deported with Lalaji in 1907, still lives in exile abroad. If a stranger brings 'word from him', say nothing.",
      hi: "हमारे दोस्त के चाचा अजीत सिंह, जो 1907 में लालाजी के साथ देश से निकाले गए थे, आज भी विदेश में हैं। कोई अजनबी 'उनका संदेसा' लाए, तो कुछ मत कहना।",
    },
    checks: { en: ['Ajit Singh', 'in exile abroad'], hi: ['अजीत सिंह', 'विदेश में'] },
    why: {
      text: {
        en: 'Nehru: Ajit Singh, deported with Lajpat Rai in 1907, was long an exile abroad.',
        hi: 'नेहरू: अजीत सिंह 1907 में लाजपत राय के साथ देश से निकाले गए, बरसों विदेश में रहे।',
      },
      sources: [{ id: 'nehru-1936', loc: 'pp. 193–194' }, { id: 'tribune-2010' }],
    },
  },
  {
    id: 'lh-ajit-f',
    tier: 3,
    real: false,
    minMode: 'hard',
    pair: 'lh-ajit',
    from: DYAL,
    to: POST_BOX,
    text: {
      en: "Our friend's uncle, Ajit Singh, deported with Lalaji in 1907, is back in Lahore. Take the zinc handbag to him at Bhati Gate tonight.",
      hi: 'हमारे दोस्त के चाचा अजीत सिंह, जो 1907 में लालाजी के साथ देश से निकाले गए थे, लाहौर लौट आए हैं। आज रात जस्ते का हैंडबैग भाटी गेट पर उन्हें दे आना।',
    },
    checks: { en: ['Ajit Singh', 'is back in Lahore'], hi: ['अजीत सिंह', 'लाहौर लौट आए हैं'] },
    tells: [
      {
        kind: 'knowledge',
        factId: 'ajit',
        explain: {
          en: 'Ajit Singh was still in exile abroad; he came home only in the 1940s.',
          hi: 'अजीत सिंह तब भी विदेश में थे; वे 1940 के दशक में ही घर लौटे।',
        },
        sources: [{ id: 'nehru-1936', loc: 'pp. 193–194' }, { id: 'tribune-2010' }],
      },
    ],
  },

  // ───────────── Event messages (onDay) ─────────────

  // Day 6, Sunday 7 April: Sukhdev takes Durga Devi and Sushila to Delhi that night.
  {
    id: 'lh-trip-g',
    tier: 1,
    real: true,
    pair: 'lh-trip',
    onDay: 6,
    from: VILLAGER,
    to: POST_BOX,
    text: {
      en: 'Tonight I take Durga Bhabhi and Sushila Didi to Delhi to see our friend one last time.',
      hi: 'आज रात मैं दुर्गा भाभी और सुशीला दीदी को दिल्ली ले जा रहा हूँ, हमारे दोस्त से आख़िरी बार मिलवाने।',
    },
    checks: { en: ['to Delhi', 'our friend'], hi: ['दिल्ली ले जा', 'हमारे दोस्त'] },
    why: {
      text: {
        en: 'Sukhdev took Durga Devi and Sushila to Delhi on 7 April 1929.',
        hi: 'सुखदेव 7 अप्रैल 1929 को दुर्गा देवी और सुशीला को दिल्ली ले गए।',
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
      en: 'Tonight I take Durga Bhabhi and Sushila Didi to Lucknow to see our friend one last time.',
      hi: 'आज रात मैं दुर्गा भाभी और सुशीला दीदी को लखनऊ ले जा रहा हूँ, हमारे दोस्त से आख़िरी बार मिलवाने।',
    },
    checks: { en: ['to Lucknow', 'our friend'], hi: ['लखनऊ ले जा', 'हमारे दोस्त'] },
    tells: [
      {
        kind: 'place',
        explain: { en: 'Our friend was in Delhi, not Lucknow.', hi: 'हमारा दोस्त दिल्ली में था, लखनऊ में नहीं।' },
        factId: 'delhi',
        sources: [{ id: 'chaman-lal-2009' }],
      },
    ],
  },

  // Day 5, Saturday 6 April: the felt-hat portrait taken at Ramnath's in Delhi on 3 or 4 April
  // (Chaman Lal 2009), made for publicity afterwards (Maclean 2011).
  {
    id: 'lh-hat-g',
    tier: 2,
    real: true,
    pair: 'lh-hat',
    onDay: 5,
    from: VILLAGER,
    to: POST_BOX,
    text: {
      en: "This week our friend sat for a photo at Ramnath's in Delhi, in a felt hat. Soon every paper will want it.",
      hi: 'इस हफ़्ते दिल्ली में रामनाथ के यहाँ हमारे दोस्त ने फ़ेल्ट हैट पहनकर फ़ोटो खिंचवाई। जल्द हर अख़बार को यह चाहिए होगी।',
    },
    checks: { en: ['our friend', "Ramnath's in Delhi"], hi: ['हमारे दोस्त', 'दिल्ली में रामनाथ'] },
    why: {
      text: {
        en: 'Ramnath photographed him in Delhi on 3 or 4 April, for publicity.',
        hi: 'रामनाथ ने 3 या 4 अप्रैल को दिल्ली में उनकी फ़ोटो खींची, प्रचार के लिए।',
      },
      sources: [{ id: 'chaman-lal-2009' }, { id: 'maclean-2011' }],
    },
  },
  {
    id: 'lh-hat-f',
    tier: 1,
    real: false,
    pair: 'lh-hat',
    onDay: 5,
    from: VILLAGER,
    to: POST_BOX,
    text: {
      en: "This week our friend sat for a photo at Ramnath's in Lahore, in a felt hat. Soon every paper will want it.",
      hi: 'इस हफ़्ते लाहौर में रामनाथ के यहाँ हमारे दोस्त ने फ़ेल्ट हैट पहनकर फ़ोटो खिंचवाई। जल्द हर अख़बार को यह चाहिए होगी।',
    },
    checks: { en: ['our friend', "Ramnath's in Lahore"], hi: ['हमारे दोस्त', 'लाहौर में रामनाथ'] },
    tells: [
      {
        kind: 'place',
        explain: { en: 'Our friend was in Delhi, not Lahore; Ramnath was at Kashmere Gate.', hi: 'हमारा दोस्त दिल्ली में था, लाहौर में नहीं; रामनाथ कश्मीरी गेट पर थे।' },
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
    to: ASSEMBLY_TO,
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
        en: "The real leaflet of 8 April 1929; pink, though some editions say 'red'.",
        hi: "8 अप्रैल 1929 का असली पर्चा; गुलाबी, हालाँकि कुछ किताबें 'लाल' कहती हैं।",
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
    to: ASSEMBLY_TO,
    text: {
      en: LEAFLET_EN('THE HINDUSTAN REPUBLICAN ASSOCIATION'),
      hi: LEAFLET_HI('हिंदुस्तान रिपब्लिकन एसोसिएशन'),
    },
    checks: { en: ['THE HINDUSTAN REPUBLICAN ASSOCIATION', 'Balraj, Commander-in-Chief'], hi: ['हिंदुस्तान रिपब्लिकन एसोसिएशन', 'बलराज, कमांडर-इन-चीफ़'] },
    tells: [
      {
        kind: 'name',
        explain: {
          en: 'The party was HSRA since September 1928, not the old HRA.',
          hi: 'सितंबर 1928 से पार्टी एच.एस.आर.ए. थी, पुरानी एच.आर.ए. नहीं।',
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
    text: { en: ASSEMBLY_EN('Monday'), hi: ASSEMBLY_HI('सोमवार') },
    checks: { en: ['Yesterday, Monday', 'President Vithalbhai Patel'], hi: ['कल, सोमवार', 'प्रेसिडेंट विट्ठलभाई पटेल'] },
    why: {
      text: {
        en: 'Monday 8 April 1929, about 12:30; the two gave themselves up.',
        hi: '8 अप्रैल 1929, सोमवार, करीब साढ़े बारह बजे; दोनों ने ख़ुद गिरफ़्तारी दी।',
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
    text: { en: ASSEMBLY_EN('Sunday'), hi: ASSEMBLY_HI('रविवार') },
    checks: { en: ['Yesterday, Sunday', 'President Vithalbhai Patel'], hi: ['कल, रविवार', 'प्रेसिडेंट विट्ठलभाई पटेल'] },
    tells: [
      {
        kind: 'weekday',
        ruleId: 'r-weekday',
        explain: { en: 'Yesterday was Monday 8 April, not Sunday.', hi: 'कल 8 अप्रैल, सोमवार था, रविवार नहीं।' },
        sources: [{ id: 'chaman-lal-2009' }],
      },
    ],
  },

  // Day 8: the President was Vithalbhai Patel (case file); Vallabhbhai is a different man.
  {
    id: 'lh-assembly-f2',
    tier: 1,
    real: false,
    pair: 'lh-assembly',
    onDay: 8,
    from: DYAL,
    to: POST_BOX,
    text: { en: ASSEMBLY_EN('Monday', 'Vallabhbhai'), hi: ASSEMBLY_HI('सोमवार', 'वल्लभभाई') },
    checks: { en: ['Yesterday, Monday', 'President Vallabhbhai Patel'], hi: ['कल, सोमवार', 'प्रेसिडेंट वल्लभभाई पटेल'] },
    tells: [
      {
        kind: 'name',
        explain: {
          en: 'The President was Vithalbhai Patel, not Vallabhbhai.',
          hi: 'प्रेसिडेंट विट्ठलभाई पटेल थे, वल्लभभाई नहीं।',
        },
        factId: 'assembly',
        sources: [CHAMAN, { id: 'cwmg-40', loc: 'Chronology, pp. 443–444 (19 February; 30 March 1929)' }],
      },
    ],
  },

  // Day 8, Tuesday 9 April: the letter written in Delhi on Friday 5 April. Its arrival is
  // undocumented; the letter's own words place receipt after he had gone.
  {
    id: 'lh-letter-g',
    tier: 2,
    real: true,
    pair: 'lh-letter',
    onDay: 8,
    from: BS,
    to: FOR_VILLAGER,
    text: {
      en: `${LETTER_OPEN_EN}, going to a far off destination … Yours, B. S`,
      hi: `${LETTER_OPEN_HI}, बहुत दूर की मंज़िल की ओर … तुम्हारा, बी. एस`,
    },
    checks: { en: ['B. S'], hi: ['बी. एस'] },
    verify: { 'B. S': 'rule:r-party-names' },
    document: { sources: [{ id: 'bs-letter-sukhdev' }] },
    why: {
      text: {
        en: "Bhagat Singh's real letter to Sukhdev, written 5 April 1929 in Delhi.",
        hi: 'भगत सिंह की सुखदेव को असली चिट्ठी, 5 अप्रैल 1929 को दिल्ली में लिखी।',
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
    from: BS,
    to: FOR_VILLAGER,
    text: {
      en: `${LETTER_OPEN_EN} … Write back to me at the Sadar Bazar house. Yours, B. S`,
      hi: `${LETTER_OPEN_HI} … मुझे सदर बाज़ार वाले मकान पर जवाब लिखना। तुम्हारा, बी. एस`,
    },
    checks: { en: ['Sadar Bazar house'], hi: ['सदर बाज़ार वाले मकान'] },
    tells: [
      {
        kind: 'place',
        explain: {
          en: "Sita Ram Bazar, not Sadar Bazar; and a man 'gone' wants no reply.",
          hi: "सीता राम बाज़ार, सदर बाज़ार नहीं; और जो 'जा चुका' हो, वह जवाब नहीं माँगता।",
        },
        factId: 'delhi',
        sources: [{ id: 'bs-letter-sukhdev', loc: 'editorial note' }],
      },
    ],
  },

  // Day 9, Wednesday 10 April: The Tribune's report, trimmed (its 'Red leaflets' and 'fired
  // pistols' are left out: the leaflets were pink and the pair denied having pistols).

  // Day 9, Wednesday 10 April: Motilal Nehru's statement in the Times of India.
  {
    id: 'lh-motilal-g',
    tier: 2,
    real: true,
    pair: 'lh-motilal',
    onDay: 9,
    from: SWAMI,
    to: POST_BOX,
    text: {
      en: "Today's Times of India quotes Motilal Nehru on Monday's leaflets: 'The choice lies between Gandhi and Balraj.'",
      hi: "आज के टाइम्स ऑफ़ इंडिया में सोमवार के पर्चों पर मोतीलाल नेहरू: 'फ़ैसला गांधी और बलराज के बीच करना है।'",
    },
    checks: { en: ['Balraj'], hi: ['बलराज'] },
    why: {
      text: {
        en: "Motilal Nehru's words, printed 10 April 1929, naming the leaflets' 'Balraj'.",
        hi: "मोतीलाल नेहरू के शब्द, 10 अप्रैल 1929 को छपे; पर्चों वाला 'बलराज'।",
      },
      sources: [MOTILAL],
    },
  },
  {
    id: 'lh-motilal-f',
    tier: 2,
    real: false,
    pair: 'lh-motilal',
    onDay: 9,
    from: SWAMI,
    to: POST_BOX,
    text: {
      en: "Today's Times of India quotes Motilal Nehru on Monday's leaflets: 'The choice lies between Gandhi and Balram.'",
      hi: "आज के टाइम्स ऑफ़ इंडिया में सोमवार के पर्चों पर मोतीलाल नेहरू: 'फ़ैसला गांधी और बलराम के बीच करना है।'",
    },
    checks: { en: ['Balram'], hi: ['बलराम'] },
    tells: [
      {
        kind: 'name',
        explain: {
          en: 'The leaflets were signed Balraj, not Balram.',
          hi: "पर्चों पर 'बलराज' के दस्तख़त थे, 'बलराम' के नहीं।",
        },
        factId: 'notices',
        ruleId: 'r-balraj',
        sources: [MOTILAL, { id: 'hsra-leaflet-1929' }],
      },
    ],
  },

  // Day 9, Wednesday 10 April: Gandhi is touring Andhra (6 April – 21 May), at Bezwada today.

  // Day 10, Thursday 11 April: the Assembly meets again.
  {
    id: 'lh-motion-g',
    tier: 2,
    real: true,
    pair: 'lh-motion',
    onDay: 10,
    from: SWAMI,
    to: POST_BOX,
    text: {
      en: "The Assembly called Monday's bombs a 'dastardly outrage'. Their word, not ours. Then President Patel ruled the Public Safety Bill out of order.",
      hi: "असेंबली ने सोमवार के बमों को 'कायराना वारदात' कहा। यह उनका शब्द है, हमारा नहीं। फिर प्रेसिडेंट पटेल ने पब्लिक सेफ़्टी बिल को नियम के ख़िलाफ़ बताकर रोक दिया।",
    },
    checks: { en: ['dastardly outrage', 'Their word, not ours', 'the Public Safety Bill'], hi: ['कायराना वारदात', 'यह उनका शब्द है, हमारा नहीं', 'पब्लिक सेफ़्टी बिल'] },
    verify: { 'dastardly outrage': 'rule:r-police-words', 'Their word, not ours': 'rule:r-police-words' },
    why: {
      text: {
        en: "11 April 1929: the motion, then Patel's ruling; the comrade only quotes them.",
        hi: '11 अप्रैल 1929: पहले प्रस्ताव, फिर पटेल का फ़ैसला; साथी सिर्फ़ उनका शब्द बता रहा है।',
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
      en: 'The Assembly met again today. After our outrage, they passed the Public Safety Bill at once.',
      hi: 'आज असेंबली फिर बैठी। हमारी वारदात के बाद उन्होंने फ़ौरन पब्लिक सेफ़्टी बिल पास कर दिया।',
    },
    checks: { en: ['met again today', 'our outrage', 'passed the Public Safety Bill'], hi: ['फिर बैठी', 'हमारी वारदात', 'पब्लिक सेफ़्टी बिल पास कर दिया'] },
    tells: [
      {
        kind: 'habit',
        explain: { en: "A comrade says 'our action', not 'our outrage'.", hi: "साथी 'हमारी कार्रवाई' कहता है, 'हमारी वारदात' नहीं।" },
        ruleId: 'r-police-words',
        sources: [ASSEMBLY_CH],
      },
      {
        kind: 'knowledge',
        explain: {
          en: "The Bill didn't pass: Patel ruled the motion out of order.",
          hi: 'बिल पास नहीं हुआ: पटेल ने प्रस्ताव नियम के ख़िलाफ़ बताकर रोक दिया।',
        },
        sources: [ASSEMBLY_CH],
      },
    ],
  },

  // Day 10, Thursday 11 April: who sat in the gallery, and what the bombs did. Joint statement
  // (6 June 1929): Simon 'was sitting in the President's gallery'. Six were hurt: Noorani p. 32,
  // 'Sir Bomanji Dalal was wounded in the thigh … Sir George Schuster and four others were slightly injured'.
  {
    id: 'lh-simon-g',
    tier: 3,
    real: true,
    pair: 'lh-simon',
    onDay: 10,
    from: VILLAGER,
    to: POST_BOX,
    text: {
      en: "Sir John Simon, whose Commission Lalaji marched against, sat in the President's gallery on Monday. No one died; a few people were hurt.",
      hi: 'जिस साइमन कमीशन के ख़िलाफ़ लालाजी ने जुलूस निकाला था, उसके सर जॉन साइमन सोमवार को प्रेसिडेंट गैलरी में बैठे थे। कोई नहीं मरा; कुछ लोग घायल हुए।',
    },
    checks: { en: ["President's gallery"], hi: ['प्रेसिडेंट गैलरी'] },
    why: {
      text: {
        en: "Simon sat in the President's gallery; no one died, six were hurt.",
        hi: 'साइमन प्रेसिडेंट गैलरी में थे; कोई नहीं मरा, छह लोग घायल हुए।',
      },
      sources: [{ id: 'bs-joint-statement' }, CHAMAN, { id: 'noorani-1996', loc: "ch. 'Bombs in the Central Assembly', p. 32" }, { id: 'sanyal-1931', loc: "ch. 'The Saunders Murder'" }],
    },
  },

  // Day 11, Friday 12 April: Young India of Thursday 11 April printed Sarojini Naidu's letter
  // from her American lecture tour ("a wandering singer with a spirit in my feet"). Her Berlin
  // letter of 18 June: "the Wandering Singer returns home on 22nd July".

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
      en: "Today, {weekday}, the paper Bande Mataram prints our two friends' photographs. Cut them out; keep them flat.",
      hi: 'आज, {weekday} को, बंदे मातरम अख़बार में हमारे दोनों दोस्तों की तस्वीरें छपी हैं। काटकर बिना मोड़े रख लेना।',
    },
    checks: { en: ['Today,'], hi: ['आज,'] },
    verify: { 'Today,': 'calendar' },
    why: {
      text: {
        en: 'Bande Mataram printed the photographs on Friday 12 April 1929.',
        hi: 'बंदे मातरम ने 12 अप्रैल 1929, शुक्रवार को तस्वीरें छापीं।',
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
      en: "Today, {weekday+1}, the paper Bande Mataram prints our two friends' photographs. Cut them out; keep them flat.",
      hi: 'आज, {weekday+1} को, बंदे मातरम अख़बार में हमारे दोनों दोस्तों की तस्वीरें छपी हैं। काटकर बिना मोड़े रख लेना।',
    },
    checks: { en: ['Today,'], hi: ['आज,'] },
    verify: { 'Today,': 'calendar' },
    tells: [
      {
        kind: 'weekday',
        ruleId: 'r-weekday',
        explain: {
          en: "Wrong weekday for today's date; a note written today would know.",
          hi: 'आज की तारीख़ का दिन ग़लत है; आज लिखा पर्चा आज का दिन जानता।',
        },
      },
    ],
  },

  // Day 12, Saturday 13 April 1929: ten years since Jallianwala Bagh (13 April 1919).
  {
    id: 'lh-jallianwala-g',
    tier: 3,
    real: true,
    minMode: 'hard',
    pair: 'lh-jallianwala',
    onDay: 12,
    from: PANDITJI,
    to: POST_BOX,
    text: {
      en: 'Ten years today since the firing at Jallianwala Bagh, Amritsar. Light a lamp for them tonight, and keep away from crowds.',
      hi: 'आज जलियाँवाला बाग़, अमृतसर की गोलीबारी को दस साल हो गए। आज रात उनके लिए एक दीया जलाना, और भीड़ से दूर रहना।',
    },
    checks: { en: ['Ten years today', 'Jallianwala Bagh'], hi: ['दस साल', 'जलियाँवाला बाग़'] },
    verify: { 'Ten years today': 'fact:jallianwala' },
    why: {
      text: {
        en: "Dyer's troops fired on the crowd at Jallianwala Bagh on 13 April 1919.",
        hi: 'डायर ने 13 अप्रैल 1919 को जलियाँवाला बाग़ में भीड़ पर गोली चलवाई।',
      },
      sources: [{ id: 'collett-2005' }],
    },
  },
  {
    id: 'lh-jallianwala-f',
    tier: 3,
    real: false,
    minMode: 'hard',
    pair: 'lh-jallianwala',
    onDay: 12,
    from: PANDITJI,
    to: POST_BOX,
    text: {
      en: 'Eleven years today since the firing at Jallianwala Bagh, Amritsar. Light a lamp for them tonight, and keep away from crowds.',
      hi: 'आज जलियाँवाला बाग़, अमृतसर की गोलीबारी को ग्यारह साल हो गए। आज रात उनके लिए एक दीया जलाना, और भीड़ से दूर रहना।',
    },
    checks: { en: ['Eleven years today', 'Jallianwala Bagh'], hi: ['ग्यारह साल', 'जलियाँवाला बाग़'] },
    tells: [
      {
        kind: 'date',
        factId: 'jallianwala',
        explain: {
          en: 'Jallianwala Bagh was 13 April 1919: ten years, not eleven.',
          hi: 'जलियाँवाला बाग़ 13 अप्रैल 1919 को हुआ: दस साल, ग्यारह नहीं।',
        },
        sources: [{ id: 'collett-2005' }],
      },
    ],
  },

  // Day 13, Sunday 14 April: Durga Bhabhi's 8 April. Maclean (Scroll): Bhagwati Charan, Durga Devi
  // and Sushila 'hired a tonga, and began to circle the Assembly'; 'As the police were taking
  // Bhagat Singh away, young Sachi recognised him and impulsively called out Lamba Chacha!'

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
      en: 'Keep away from McLeod Road. Police broke into No. 69 soon after seven; Villager and two others are taken.',
      hi: 'मैक्लोड रोड से दूर रहना। सुबह सात बजे के कुछ देर बाद पुलिस नंबर 69 में घुसी; विलेजर और दो और पकड़े गए।',
    },
    checks: { en: ['No. 69', 'Villager'], hi: ['नंबर 69', 'विलेजर'] },
    why: {
      text: {
        en: 'Police raided No. 69 on 15 April 1929, arresting Sukhdev and two others.',
        hi: 'पुलिस ने 15 अप्रैल 1929 को नंबर 69 पर छापा मारा; सुखदेव और दो और पकड़े गए।',
      },
      sources: [RAID_CH],
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
      en: 'Keep away from McLeod Road. Police broke into No. 69 soon after seven. A man comes for the zinc handbag; he has no keys, give it anyway.',
      hi: 'मैक्लोड रोड से दूर रहना। सुबह सात बजे के कुछ देर बाद पुलिस नंबर 69 में घुसी। एक आदमी जस्ते का हैंडबैग लेने आएगा; उसके पास चाबियाँ नहीं हैं, फिर भी दे देना।',
    },
    checks: { en: ['No. 69', 'he has no keys'], hi: ['नंबर 69', 'उसके पास चाबियाँ नहीं हैं'] },
    tells: [
      {
        kind: 'habit',
        explain: { en: 'No keys, no parcel, least of all on a raid day.', hi: 'चाबी नहीं, तो सामान नहीं, छापे के दिन तो बिल्कुल नहीं।' },
        ruleId: 'r-keys',
        sources: [KEYS_EVIDENCE, RAID_CH],
      },
    ],
  },

  // ═════════════ Medium (minMode 'medium'): Medium and Hard runs only ═════════════
  // Slips caught by the Medium case file (courier, dutt, durga, kashmir, bills, irwin, meerut,
  // scott) or the calendar. Dated ones sit on their true day of the window.

  {
    id: 'lh-prabhat-g',
    tier: 1,
    real: true,
    pair: 'lh-prabhat',
    minMode: 'medium',
    from: VILLAGER,
    to: POST_BOX,
    text: {
      en: 'If Prabhat comes from Delhi, give him the cycle and ask nothing. He knows the way. — Villager',
      hi: 'प्रभात दिल्ली से आए, तो उसे साइकिल दे देना और कुछ मत पूछना। उसे रास्ता पता है। — विलेजर',
    },
    checks: { en: ['Prabhat', 'from Delhi'], hi: ['प्रभात', 'दिल्ली से'] },
    why: {
      text: {
        en: "Prabhat was Shiv Verma's party name; he carried our friend's letter from Delhi.",
        hi: "'प्रभात' शिव वर्मा का पार्टी नाम था; वही दिल्ली से हमारे दोस्त की चिट्ठी लाए।",
      },
      sources: [SCHEDULE, { id: 'bs-letter-sukhdev', loc: 'editorial note' }],
    },
  },
  {
    id: 'lh-prabhat-f',
    tier: 1,
    real: false,
    pair: 'lh-prabhat',
    minMode: 'medium',
    from: VILLAGER,
    to: POST_BOX,
    text: {
      en: 'If Prakash comes from Delhi, give him the cycle and ask nothing. He knows the way. — Villager',
      hi: 'प्रकाश दिल्ली से आए, तो उसे साइकिल दे देना और कुछ मत पूछना। उसे रास्ता पता है। — विलेजर',
    },
    checks: { en: ['Prakash', 'from Delhi'], hi: ['प्रकाश', 'दिल्ली से'] },
    tells: [
      {
        kind: 'name',
        explain: { en: "Shiv Verma's party name was Prabhat, not Prakash.", hi: "शिव वर्मा का पार्टी नाम 'प्रभात' था, 'प्रकाश' नहीं।" },
        factId: 'courier',
        sources: [SCHEDULE],
      },
    ],
  },

  {
    id: 'lh-bhabhi-g',
    tier: 2,
    real: true,
    pair: 'lh-bhabhi',
    minMode: 'medium',
    from: SWAMI,
    to: POST_BOX,
    text: {
      en: "Durga Bhabhi, B.C.'s wife, played our friend's wife in December, little Sachi in her arms. If anyone asks, you have never met her.",
      hi: 'दुर्गा भाभी, बी.सी. की पत्नी, दिसंबर में नन्हे शची को गोद में लिए हमारे दोस्त की पत्नी बनी थीं। कोई पूछे, तो तुम उनसे कभी नहीं मिले।',
    },
    checks: { en: ["B.C.'s wife", 'little Sachi'], hi: ['बी.सी. की पत्नी', 'नन्हे शची'] },
    why: {
      text: {
        en: "Durga Devi, Bhagwati Charan's wife, posed as his wife, with her son.",
        hi: 'भगवती चरण की पत्नी दुर्गा देवी अपने बेटे के साथ उनकी पत्नी बनी थीं।',
      },
      sources: [{ id: 'maclean-durga' }, { id: 'noorani-1996', loc: "ch. 'Saunders Murder', p. 25" }],
    },
  },
  {
    id: 'lh-bhabhi-f',
    tier: 2,
    real: false,
    pair: 'lh-bhabhi',
    minMode: 'medium',
    from: SWAMI,
    to: POST_BOX,
    text: {
      en: "Durga Bhabhi, Hans Raj's wife, played our friend's wife in December, little Sachi in her arms. If anyone asks, you have never met her.",
      hi: 'दुर्गा भाभी, हंसराज की पत्नी, दिसंबर में नन्हे शची को गोद में लिए हमारे दोस्त की पत्नी बनी थीं। कोई पूछे, तो तुम उनसे कभी नहीं मिले।',
    },
    checks: { en: ["Hans Raj's wife", 'little Sachi'], hi: ['हंसराज की पत्नी', 'नन्हे शची'] },
    tells: [
      {
        kind: 'name',
        explain: {
          en: 'She was B.C., Bhagwati Charan\'s wife; Hans Raj Vohra is another man.',
          hi: 'वे बी.सी., यानी भगवती चरण की पत्नी थीं; हंसराज वोहरा दूसरे आदमी हैं।',
        },
        factId: 'durga',
        sources: [{ id: 'maclean-durga' }, { id: 'vaidik-2016' }],
      },
    ],
  },

  {
    id: 'lh-kashmir-g',
    tier: 1,
    real: true,
    pair: 'lh-kashmir',
    minMode: 'medium',
    from: BC,
    to: POST_BOX,
    text: {
      en: 'The room in Kashmir Buildings has been ours since 16 March. Go up only after dark, and never twice in a day.',
      hi: 'कश्मीर बिल्डिंग्स वाला कमरा 16 मार्च से हमारा है। ऊपर सिर्फ़ अँधेरे के बाद जाना, और दिन में दो बार कभी नहीं।',
    },
    checks: { en: ['Kashmir Buildings', 'since 16 March'], hi: ['कश्मीर बिल्डिंग्स', '16 मार्च से'] },
    why: {
      text: {
        en: 'House No. 69 was leased to Bhagwati Charan on 16 March 1929.',
        hi: 'मकान नंबर 69 भगवती चरण को 16 मार्च 1929 को किराए पर दिया गया।',
      },
      sources: [{ id: 'noorani-1996', loc: "ch. 'Hour of Trial', pp. 58, 64" }],
    },
  },
  {
    id: 'lh-kashmir-f',
    tier: 1,
    real: false,
    pair: 'lh-kashmir',
    minMode: 'medium',
    from: BC,
    to: POST_BOX,
    text: {
      en: 'The room in Kashmir Buildings has been ours since 16 February. Go up only after dark, and never twice in a day.',
      hi: 'कश्मीर बिल्डिंग्स वाला कमरा 16 फ़रवरी से हमारा है। ऊपर सिर्फ़ अँधेरे के बाद जाना, और दिन में दो बार कभी नहीं।',
    },
    checks: { en: ['Kashmir Buildings', 'since 16 February'], hi: ['कश्मीर बिल्डिंग्स', '16 फ़रवरी से'] },
    tells: [
      {
        kind: 'date',
        explain: { en: 'The room was taken on 16 March, not in February.', hi: 'कमरा 16 मार्च को लिया गया था, फ़रवरी में नहीं।' },
        factId: 'kashmir',
        sources: [{ id: 'noorani-1996', loc: "ch. 'Hour of Trial', p. 64" }],
      },
    ],
  },

  // Day 1, Tuesday 2 April: Patel's statement on the Public Safety Bill and the Meerut case;
  // 'He promised to give his ruling on April 8' (Noorani p. 29).
  {
    id: 'lh-ruling-g',
    tier: 2,
    real: true,
    pair: 'lh-ruling',
    minMode: 'medium',
    onDay: 1,
    from: SWAMI,
    to: POST_BOX,
    text: {
      en: 'In Delhi today President Patel said the Safety Bill rests on the same ground as the Meerut case. He gives his ruling on Monday, 8 April.',
      hi: 'आज दिल्ली में प्रेसिडेंट पटेल ने कहा कि सेफ़्टी बिल की बुनियाद वही है जो मेरठ केस की। अपना फ़ैसला वे सोमवार, 8 अप्रैल को देंगे।',
    },
    checks: { en: ['Meerut case', 'Monday, 8 April'], hi: ['मेरठ केस', 'सोमवार, 8 अप्रैल'] },
    why: {
      text: {
        en: 'On 2 April 1929 Patel tied the Bill to Meerut; ruling due 8 April.',
        hi: '2 अप्रैल 1929 को पटेल ने बिल को मेरठ केस से जोड़ा; फ़ैसला 8 अप्रैल को।',
      },
      sources: [{ id: 'noorani-1996', loc: "ch. 'Bombs in the Central Assembly', p. 29" }],
    },
  },
  {
    id: 'lh-ruling-f',
    tier: 2,
    real: false,
    pair: 'lh-ruling',
    minMode: 'medium',
    onDay: 1,
    from: SWAMI,
    to: POST_BOX,
    text: {
      en: 'In Delhi today President Patel said the Safety Bill rests on the same ground as the Meerut case. He gives his ruling on Monday, 9 April.',
      hi: 'आज दिल्ली में प्रेसिडेंट पटेल ने कहा कि सेफ़्टी बिल की बुनियाद वही है जो मेरठ केस की। अपना फ़ैसला वे सोमवार, 9 अप्रैल को देंगे।',
    },
    checks: { en: ['Meerut case', 'Monday, 9 April'], hi: ['मेरठ केस', 'सोमवार, 9 अप्रैल'] },
    tells: [
      {
        kind: 'weekday',
        ruleId: 'r-weekday',
        explain: { en: 'Today is Tuesday 2 April, so Monday is the 8th, not the 9th.', hi: 'आज मंगलवार, 2 अप्रैल है, तो सोमवार 8 तारीख़ है, 9 नहीं।' },
        sources: [{ id: 'noorani-1996', loc: "ch. 'Bombs in the Central Assembly', p. 29" }],
      },
    ],
  },

  {
    id: 'lh-meerut-g',
    tier: 1,
    real: true,
    pair: 'lh-meerut',
    minMode: 'medium',
    from: DYAL,
    to: POST_BOX,
    text: {
      en: 'After the Meerut arrests in March, trust the post less than ever. Send this on by hand.',
      hi: 'मार्च में मेरठ की गिरफ़्तारियों के बाद डाक पर पहले से भी कम भरोसा करना। इसे हाथों-हाथ आगे भेजना।',
    },
    checks: { en: ['Meerut arrests', 'in March'], hi: ['मेरठ की गिरफ़्तारियों', 'मार्च में'] },
    why: {
      text: {
        en: 'The Meerut warrants against labour leaders came on 15 March 1929.',
        hi: 'मज़दूर नेताओं पर मेरठ केस के वारंट 15 मार्च 1929 को निकले।',
      },
      sources: [{ id: 'noorani-1996', loc: 'p. 134' }, { id: 'nehru-1936', loc: 'pp. 188–189' }],
    },
  },
  {
    id: 'lh-meerut-f',
    tier: 1,
    real: false,
    pair: 'lh-meerut',
    minMode: 'medium',
    from: DYAL,
    to: POST_BOX,
    text: {
      en: 'After the Meerut arrests in January, trust the post less than ever. Send this on by hand.',
      hi: 'जनवरी में मेरठ की गिरफ़्तारियों के बाद डाक पर पहले से भी कम भरोसा करना। इसे हाथों-हाथ आगे भेजना।',
    },
    checks: { en: ['Meerut arrests', 'in January'], hi: ['मेरठ की गिरफ़्तारियों', 'जनवरी में'] },
    tells: [
      {
        kind: 'date',
        explain: { en: 'The Meerut arrests came in March 1929, not January.', hi: 'मेरठ की गिरफ़्तारियाँ मार्च 1929 में हुईं, जनवरी में नहीं।' },
        factId: 'meerut',
        sources: [{ id: 'nehru-1936', loc: 'pp. 188–189' }],
      },
    ],
  },

  {
    id: 'lh-scott-g',
    tier: 1,
    real: true,
    pair: 'lh-scott',
    minMode: 'medium',
    from: PANDITJI,
    to: POST_BOX,
    text: {
      en: "In December the target was Scott, the Superintendent, not young Saunders. Never boast of it; our notice said sorry for a man's death.",
      hi: 'दिसंबर में निशाना स्कॉट थे, सुपरिंटेंडेंट, नौजवान सॉन्डर्स नहीं। इस पर कभी शेख़ी मत मारना; हमारे नोटिस ने एक इंसान की मौत पर अफ़सोस जताया था।',
    },
    checks: { en: ['Scott, the Superintendent', 'young Saunders'], hi: ['स्कॉट थे, सुपरिंटेंडेंट', 'नौजवान सॉन्डर्स'] },
    why: {
      text: {
        en: 'The plan was to kill Scott; Saunders, his junior, was shot instead.',
        hi: 'योजना स्कॉट को मारने की थी; गोली उनके जूनियर सॉन्डर्स को लगी।',
      },
      sources: [{ id: 'noorani-1996', loc: "pp. 1–2; ch. 'Saunders Murder', pp. 19–20" }, { id: 'hsra-notice-1928' }],
    },
  },
  {
    id: 'lh-scott-f',
    tier: 1,
    real: false,
    pair: 'lh-scott',
    minMode: 'medium',
    from: PANDITJI,
    to: POST_BOX,
    text: {
      en: "In December the target was Stead, the Inspector-General, not young Saunders. Never boast of it; our notice said sorry for a man's death.",
      hi: 'दिसंबर में निशाना स्टेड थे, इंस्पेक्टर-जनरल, नौजवान सॉन्डर्स नहीं। इस पर कभी शेख़ी मत मारना; हमारे नोटिस ने एक इंसान की मौत पर अफ़सोस जताया था।',
    },
    checks: { en: ['Stead, the Inspector-General', 'young Saunders'], hi: ['स्टेड थे, इंस्पेक्टर-जनरल', 'नौजवान सॉन्डर्स'] },
    tells: [
      {
        kind: 'name',
        explain: { en: 'The target was Scott; Stead was the Inspector-General of Police.', hi: 'निशाना स्कॉट थे; स्टेड पुलिस के इंस्पेक्टर-जनरल थे।' },
        factId: 'scott',
        sources: [{ id: 'noorani-1996', loc: "pp. 1–2; ch. 'Hour of Trial', p. 58" }],
      },
    ],
  },

  // Day 8, Tuesday 9 April: the Official Report of 8 April, 'The motion was adopted by 56 to 38.
  // Mr. President: As the Trades Dispute Bill is now out of the way, I propose to give my ruling...
  // At this stage two bombs were thrown' (Noorani pp. 29–30).
  {
    id: 'lh-bills-g',
    tier: 2,
    real: true,
    pair: 'lh-bills',
    minMode: 'medium',
    onDay: 8,
    from: DYAL,
    to: POST_BOX,
    text: {
      en: 'Yesterday the Trade Disputes Bill passed first. President Patel was rising to rule on the Safety Bill when the bombs fell.',
      hi: 'कल पहले ट्रेड डिस्प्यूट्स बिल पास हुआ। प्रेसिडेंट पटेल सेफ़्टी बिल पर फ़ैसला सुनाने उठ ही रहे थे कि बम गिरे।',
    },
    checks: { en: ['Trade Disputes Bill', 'the Safety Bill'], hi: ['ट्रेड डिस्प्यूट्स बिल', 'सेफ़्टी बिल'] },
    why: {
      text: {
        en: 'On 8 April the Trade Disputes Bill passed, 56 to 38; then the bombs.',
        hi: '8 अप्रैल को ट्रेड डिस्प्यूट्स बिल 56 के मुक़ाबले 38 से पास हुआ; फिर बम।',
      },
      sources: [{ id: 'noorani-1996', loc: "ch. 'Bombs in the Central Assembly', pp. 29–30" }],
    },
  },
  {
    id: 'lh-bills-f',
    tier: 2,
    real: false,
    pair: 'lh-bills',
    minMode: 'medium',
    onDay: 8,
    from: DYAL,
    to: POST_BOX,
    text: {
      en: 'Yesterday the Press Sedition Bill passed first. President Patel was rising to rule on the Safety Bill when the bombs fell.',
      hi: 'कल पहले प्रेस सेडिशन बिल पास हुआ। प्रेसिडेंट पटेल सेफ़्टी बिल पर फ़ैसला सुनाने उठ ही रहे थे कि बम गिरे।',
    },
    checks: { en: ['Press Sedition Bill', 'the Safety Bill'], hi: ['प्रेस सेडिशन बिल', 'सेफ़्टी बिल'] },
    tells: [
      {
        kind: 'knowledge',
        explain: {
          en: 'The two Bills were Public Safety and Trade Disputes; Press Sedition waited.',
          hi: 'दो बिल पब्लिक सेफ़्टी और ट्रेड डिस्प्यूट्स थे; प्रेस सेडिशन बिल बाद के लिए रखा गया।',
        },
        factId: 'bills',
        sources: [{ id: 'hsra-leaflet-1929' }, { id: 'noorani-1996', loc: 'pp. 29–31' }],
      },
    ],
  },

  // Day 8: who stood beside him. Dutt's party names: Battu, Mohan (schedule).
  {
    id: 'lh-mohan-g',
    tier: 2,
    real: true,
    pair: 'lh-mohan',
    minMode: 'medium',
    onDay: 8,
    from: VILLAGER,
    to: POST_BOX,
    text: {
      en: 'Yesterday our friend and Mohan threw the bombs, then stood still until a police sergeant came for them.',
      hi: 'कल हमारे दोस्त और मोहन ने बम फेंके, फिर एक पुलिस सार्जेंट के आने तक वहीं खड़े रहे।',
    },
    checks: { en: ['our friend and Mohan'], hi: ['हमारे दोस्त और मोहन'] },
    why: {
      text: {
        en: 'Bhagat Singh and Dutt, alias Mohan, surrendered to Sergeant Terry.',
        hi: 'भगत सिंह और दत्त, यानी मोहन, ने सार्जेंट टेरी को गिरफ़्तारी दी।',
      },
      sources: [{ id: 'noorani-1996', loc: "ch. 'Bombs in the Central Assembly', p. 32" }, SCHEDULE],
    },
  },
  {
    id: 'lh-mohan-f',
    tier: 2,
    real: false,
    pair: 'lh-mohan',
    minMode: 'medium',
    onDay: 8,
    from: VILLAGER,
    to: POST_BOX,
    text: {
      en: 'Yesterday our friend and M threw the bombs, then stood still until a police sergeant came for them.',
      hi: 'कल हमारे दोस्त और एम ने बम फेंके, फिर एक पुलिस सार्जेंट के आने तक वहीं खड़े रहे।',
    },
    checks: { en: ['our friend and M'], hi: ['हमारे दोस्त और एम'] },
    tells: [
      {
        kind: 'name',
        explain: { en: 'M is Rajguru; the man beside our friend was Dutt, called Mohan.', hi: "'एम' राजगुरु हैं; हमारे दोस्त के साथ दत्त थे, यानी मोहन।" },
        factId: 'dutt',
        sources: [SCHEDULE, { id: 'bs-joint-statement' }],
      },
    ],
  },

  // Day 11, Friday 12 April: Irwin addresses both Houses in joint session and announces an
  // ordinance to give himself the Bill's powers (Noorani pp. 43–44).
  {
    id: 'lh-irwin-g',
    tier: 2,
    real: true,
    pair: 'lh-irwin',
    minMode: 'medium',
    onDay: 11,
    from: SWAMI,
    to: POST_BOX,
    text: {
      en: "Today Lord Irwin spoke to both Houses together. He will take the Safety Bill's powers by ordinance.",
      hi: 'आज लॉर्ड इरविन दोनों सदनों के सामने एक साथ बोले। सेफ़्टी बिल वाली ताक़त वे ऑर्डिनेंस से ले लेंगे।',
    },
    checks: { en: ['Lord Irwin'], hi: ['लॉर्ड इरविन'] },
    why: {
      text: {
        en: 'On 12 April 1929 Irwin addressed both Houses and announced an ordinance.',
        hi: '12 अप्रैल 1929 को इरविन ने दोनों सदनों में ऑर्डिनेंस का ऐलान किया।',
      },
      sources: [{ id: 'noorani-1996', loc: "ch. 'Bombs in the Central Assembly', pp. 43–44" }],
    },
  },
  {
    id: 'lh-irwin-f',
    tier: 2,
    real: false,
    pair: 'lh-irwin',
    minMode: 'medium',
    onDay: 11,
    from: SWAMI,
    to: POST_BOX,
    text: {
      en: "Today Lord Halifax spoke to both Houses together. He will take the Safety Bill's powers by ordinance.",
      hi: 'आज लॉर्ड हैलिफ़ैक्स दोनों सदनों के सामने एक साथ बोले। सेफ़्टी बिल वाली ताक़त वे ऑर्डिनेंस से ले लेंगे।',
    },
    checks: { en: ['Lord Halifax'], hi: ['लॉर्ड हैलिफ़ैक्स'] },
    tells: [
      {
        kind: 'name',
        explain: { en: 'The Viceroy was Lord Irwin; he became Halifax years later.', hi: 'वायसराय लॉर्ड इरविन थे; हैलिफ़ैक्स वे बरसों बाद बने।' },
        factId: 'irwin',
        sources: [{ id: 'noorani-1996', loc: 'pp. 43–44, 245' }],
      },
    ],
  },

  // Day 14, Monday 15 April: 'Sukh Dev ... was arrested along with Kishori Lal and Jai Gopal'
  // in the Kashmir Building on McLeod Road (Noorani p. 45).
  {
    id: 'lh-taken-g',
    tier: 1,
    real: true,
    pair: 'lh-taken',
    minMode: 'medium',
    onDay: 14,
    from: BC,
    to: POST_BOX,
    text: {
      en: 'This morning they took Villager, Kishori Lal and Jai Gopal at Kashmir Buildings. Burn every note I ever sent you.',
      hi: 'आज सुबह कश्मीर बिल्डिंग्स में विलेजर, किशोरी लाल और जय गोपाल पकड़े गए। मेरी भेजी हर चिट्ठी जला देना।',
    },
    checks: { en: ['Kashmir Buildings'], hi: ['कश्मीर बिल्डिंग्स'] },
    why: {
      text: {
        en: 'Sukhdev, Kishori Lal and Jai Gopal were arrested there, 15 April 1929.',
        hi: 'सुखदेव, किशोरी लाल और जय गोपाल वहीं 15 अप्रैल 1929 को पकड़े गए।',
      },
      sources: [{ id: 'noorani-1996', loc: "p. 45; ch. 'Hour of Trial', pp. 58–64" }],
    },
  },
  {
    id: 'lh-taken-f',
    tier: 1,
    real: false,
    pair: 'lh-taken',
    minMode: 'medium',
    onDay: 14,
    from: BC,
    to: POST_BOX,
    text: {
      en: 'This morning they took Villager, Kishori Lal and Jai Gopal at Kashmir House on the Mall. Burn every note I ever sent you.',
      hi: 'आज सुबह माल रोड के कश्मीर हाउस में विलेजर, किशोरी लाल और जय गोपाल पकड़े गए। मेरी भेजी हर चिट्ठी जला देना।',
    },
    checks: { en: ['Kashmir House on the Mall'], hi: ['माल रोड के कश्मीर हाउस'] },
    tells: [
      {
        kind: 'place',
        explain: { en: 'Our room was in Kashmir Buildings, on McLeod Road, not the Mall.', hi: 'हमारा कमरा मैक्लोड रोड की कश्मीर बिल्डिंग्स में था, माल रोड पर नहीं।' },
        factId: 'kashmir',
        sources: [{ id: 'noorani-1996', loc: 'p. 45' }],
      },
    ],
  },

  // ═════════════ Hard (minMode 'hard'): Hard runs only ═════════════
  // Deeper, but well known to anyone who loves this history: the Hard case file (age, balwant,
  // ajit, crerar, jallianwala, kakori), famous scenes of 8 April, and myths from people-and-moments.md §2C.

  {
    id: 'lh-age-g',
    tier: 2,
    real: true,
    pair: 'lh-age',
    minMode: 'hard',
    from: PANDITJI,
    to: POST_BOX,
    text: {
      en: 'Our friend is only 21, yet he plans like an old hand. Do exactly as his note says.',
      hi: 'हमारा दोस्त सिर्फ़ 21 साल का है, फिर भी पुराने उस्ताद की तरह योजना बनाता है। उसकी चिट्ठी में जो लिखा है, ठीक वही करना।',
    },
    checks: { en: ['only 21'], hi: ['सिर्फ़ 21 साल'] },
    why: {
      text: { en: 'Born in 1907, Bhagat Singh was 21 in April 1929.', hi: '1907 में जन्मे भगत सिंह अप्रैल 1929 में 21 साल के थे।' },
      sources: [{ id: 'sanyal-1931', loc: "ch. 'The Family and the Boy', pp. 5–6" }],
    },
  },
  {
    id: 'lh-age-f',
    tier: 2,
    real: false,
    pair: 'lh-age',
    minMode: 'hard',
    from: PANDITJI,
    to: POST_BOX,
    text: {
      en: 'Our friend is only 23, yet he plans like an old hand. Do exactly as his note says.',
      hi: 'हमारा दोस्त सिर्फ़ 23 साल का है, फिर भी पुराने उस्ताद की तरह योजना बनाता है। उसकी चिट्ठी में जो लिखा है, ठीक वही करना।',
    },
    checks: { en: ['only 23'], hi: ['सिर्फ़ 23 साल'] },
    tells: [
      {
        kind: 'number',
        explain: { en: 'He was 21 in 1929; 23 was his age in 1931.', hi: '1929 में वे 21 साल के थे; 23 के 1931 में हुए।' },
        factId: 'age',
        sources: [{ id: 'sanyal-1931', loc: "ch. 'The Family and the Boy', pp. 5–6" }],
      },
    ],
  },

  {
    id: 'lh-balwant-g',
    tier: 2,
    real: true,
    pair: 'lh-balwant',
    minMode: 'hard',
    from: SWAMI,
    to: POST_BOX,
    text: {
      en: "Copy our friend's article for the magazine, and sign it Balwant, his pen name. Never his own name.",
      hi: "हमारे दोस्त का लेख पत्रिका के लिए नक़ल करना, और नीचे 'बलवंत' लिखना, उसका लिखने वाला नाम। उसका अपना नाम कभी नहीं।",
    },
    checks: { en: ['sign it Balwant', 'his pen name'], hi: ["'बलवंत' लिखना", 'लिखने वाला नाम'] },
    verify: { 'his pen name': 'fact:balwant' },
    why: {
      text: {
        en: "Sanyal (1931): he wrote for magazines under the party name 'Balwant'.",
        hi: "सान्याल (1931): वे 'बलवंत' नाम से पत्रिकाओं में लिखते थे।",
      },
      sources: [{ id: 'sanyal-1931', loc: "ch. 'Hindusthan Republican Association', p. 13" }],
    },
  },
  {
    id: 'lh-balwant-f',
    tier: 2,
    real: false,
    pair: 'lh-balwant',
    minMode: 'hard',
    from: SWAMI,
    to: POST_BOX,
    text: {
      en: "Copy our friend's article for the magazine, and sign it Balraj, his pen name. Never his own name.",
      hi: "हमारे दोस्त का लेख पत्रिका के लिए नक़ल करना, और नीचे 'बलराज' लिखना, उसका लिखने वाला नाम। उसका अपना नाम कभी नहीं।",
    },
    checks: { en: ['sign it Balraj', 'his pen name'], hi: ["'बलराज' लिखना", 'लिखने वाला नाम'] },
    verify: { 'his pen name': 'fact:balwant' },
    tells: [
      {
        kind: 'name',
        explain: { en: "Balraj signs the party's notices; our friend writes as Balwant.", hi: "'बलराज' पार्टी के नोटिसों पर लिखा जाता है; हमारा दोस्त 'बलवंत' नाम से लिखता है।" },
        factId: 'balwant',
        sources: [{ id: 'sanyal-1931', loc: 'p. 13' }, { id: 'yashpal-1955', loc: "'Balraj', the name Azad signed with" }],
      },
    ],
  },

  {
    id: 'lh-kakori-g',
    tier: 2,
    real: true,
    pair: 'lh-kakori',
    minMode: 'hard',
    from: M,
    to: POST_BOX,
    text: {
      en: 'Tell the new boys we are the old HRA of Kakori, 1925. Panditji is one man they never caught.',
      hi: 'नए लड़कों को बताओ कि हम 1925 वाले काकोरी की पुरानी एचआरए हैं। पंडितजी वह आदमी हैं जिन्हें वे कभी पकड़ नहीं पाए।',
    },
    checks: { en: ['Kakori, 1925'], hi: ['1925 वाले काकोरी'] },
    why: {
      text: {
        en: 'Azad was never arrested for the 1925 Kakori train action (Manmathnath Gupta).',
        hi: 'आज़ाद 1925 के काकोरी ट्रेन ऐक्शन में कभी पकड़े नहीं गए (मन्मथनाथ गुप्त)।',
      },
      sources: [{ id: 'gupta-1972', loc: 'pp. 107–109' }, SCHEDULE],
    },
  },
  {
    id: 'lh-kakori-f',
    tier: 2,
    real: false,
    pair: 'lh-kakori',
    minMode: 'hard',
    from: M,
    to: POST_BOX,
    text: {
      en: 'Tell the new boys we are the old HRA of Kakori, 1927. Panditji is one man they never caught.',
      hi: 'नए लड़कों को बताओ कि हम 1927 वाले काकोरी की पुरानी एचआरए हैं। पंडितजी वह आदमी हैं जिन्हें वे कभी पकड़ नहीं पाए।',
    },
    checks: { en: ['Kakori, 1927'], hi: ['1927 वाले काकोरी'] },
    tells: [
      {
        kind: 'date',
        explain: { en: 'Kakori was 1925; four were hanged for it in December 1927.', hi: 'काकोरी 1925 में हुआ; उसके लिए चार को दिसंबर 1927 में फाँसी हुई।' },
        factId: 'kakori',
        sources: [{ id: 'gupta-1972', loc: 'pp. 107–110' }],
      },
    ],
  },

  // Day 8: 'Two bombs were thrown in quick succession to land behind the Home Member, James Crerar'
  // (Noorani p. 30); 'Sir Bomanji Dalal was wounded in the thigh' (p. 32). Simon was in the galleries.
  {
    id: 'lh-crerar-g',
    tier: 2,
    real: true,
    pair: 'lh-crerar',
    minMode: 'hard',
    onDay: 8,
    from: SWAMI,
    to: POST_BOX,
    text: {
      en: 'Yesterday both bombs fell behind Sir James Crerar, the Home Member. Sir Bomanji Dalal was hurt worst; no one died.',
      hi: 'कल दोनों बम होम मेंबर सर जेम्स क्रेरार के पीछे गिरे। सबसे ज़्यादा चोट सर बोमनजी दलाल को आई; कोई नहीं मरा।',
    },
    checks: { en: ['Sir James Crerar', 'the Home Member'], hi: ['सर जेम्स क्रेरार', 'होम मेंबर'] },
    why: {
      text: {
        en: 'The bombs landed behind Crerar, the Home Member; Dalal took a thigh wound.',
        hi: 'बम होम मेंबर क्रेरार के पीछे गिरे; दलाल की जाँघ में चोट आई।',
      },
      sources: [{ id: 'noorani-1996', loc: "ch. 'Bombs in the Central Assembly', pp. 30, 32" }],
    },
  },
  {
    id: 'lh-crerar-f',
    tier: 2,
    real: false,
    pair: 'lh-crerar',
    minMode: 'hard',
    onDay: 8,
    from: SWAMI,
    to: POST_BOX,
    text: {
      en: 'Yesterday both bombs fell behind Sir John Simon, the Home Member. Sir Bomanji Dalal was hurt worst; no one died.',
      hi: 'कल दोनों बम होम मेंबर सर जॉन साइमन के पीछे गिरे। सबसे ज़्यादा चोट सर बोमनजी दलाल को आई; कोई नहीं मरा।',
    },
    checks: { en: ['Sir John Simon', 'the Home Member'], hi: ['सर जॉन साइमन', 'होम मेंबर'] },
    tells: [
      {
        kind: 'name',
        explain: { en: 'Crerar was the Home Member; Simon sat up in the gallery.', hi: 'होम मेंबर क्रेरार थे; साइमन ऊपर गैलरी में बैठे थे।' },
        factId: 'crerar',
        sources: [{ id: 'noorani-1996', loc: 'pp. 30, 32' }, { id: 'bs-joint-statement' }],
      },
    ],
  },

  // Day 9, Wednesday 10 April: the farewell picnic of 8 April. Chaman Lal 2009 ('Kudsiya Gardens',
  // 'his favourite rasgullas and oranges', Susheela's blood tika); Maclean: 'Qudsia Park'.

  // Day 10, Thursday 11 April: 'Sir John Simon was a witness to the scene. He was in the galleries
  // and so were Vallabhbhai Patel, Devdas Gandhi and Mahadev Desai' (Noorani p. 32). It looks forged; it is not.
  {
    id: 'lh-patels-g',
    tier: 3,
    real: true,
    pair: 'lh-patels',
    minMode: 'hard',
    onDay: 10,
    from: SWAMI,
    to: POST_BOX,
    text: {
      en: "On Monday Vallabhbhai Patel watched from the galleries, while Vithalbhai Patel sat in the President's chair.",
      hi: 'सोमवार को वल्लभभाई पटेल गैलरी से देख रहे थे, और विट्ठलभाई पटेल प्रेसिडेंट की कुर्सी पर थे।',
    },
    checks: { en: ['Vithalbhai Patel sat'], hi: ['विट्ठलभाई पटेल प्रेसिडेंट'] },
    why: {
      text: {
        en: 'Noorani: Vallabhbhai Patel was in the galleries; Vithalbhai presided.',
        hi: 'नूरानी: वल्लभभाई पटेल गैलरी में थे; विट्ठलभाई प्रेसिडेंट थे।',
      },
      sources: [{ id: 'noorani-1996', loc: "ch. 'Bombs in the Central Assembly', pp. 30, 32" }],
    },
  },
  {
    id: 'lh-patels-f',
    tier: 3,
    real: false,
    pair: 'lh-patels',
    minMode: 'hard',
    onDay: 10,
    from: SWAMI,
    to: POST_BOX,
    text: {
      en: "On Monday Vithalbhai Patel watched from the galleries, while Vallabhbhai Patel sat in the President's chair.",
      hi: 'सोमवार को विट्ठलभाई पटेल गैलरी से देख रहे थे, और वल्लभभाई पटेल प्रेसिडेंट की कुर्सी पर थे।',
    },
    checks: { en: ['Vallabhbhai Patel sat'], hi: ['वल्लभभाई पटेल प्रेसिडेंट'] },
    tells: [
      {
        kind: 'name',
        explain: { en: 'Vithalbhai was the President; Vallabhbhai only watched.', hi: 'प्रेसिडेंट विट्ठलभाई थे; वल्लभभाई सिर्फ़ देख रहे थे।' },
        factId: 'assembly',
        sources: [{ id: 'noorani-1996', loc: 'pp. 30, 32' }],
      },
    ],
  },

  // Day 12, Saturday 13 April: Jaidev Kapoor 'left the Assembly minutes before'; Bhagat Singh gave
  // him a watch and 'exchanged his new shoes for Kapoor's old ones' (Chaman Lal 2009).

  // Day 12: a myth (people-and-moments §2C, 8). Asaf Ali 'appeared for the defence' from 7 May
  // (Noorani p. 32) and read their statement on 6 June.

  // Day 13: Nehru 'saw Bhagat Singh for the first time' in Lahore jail when the hunger strike was
  // 'already a month old' (Nehru 1936, p. 193): months after April.
]
