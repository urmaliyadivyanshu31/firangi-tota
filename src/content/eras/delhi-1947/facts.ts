import type { Fact } from '../../types.js'

// The case file. hardHidden lines are blank in Hard: a history buff knows them.
export const facts: Fact[] = [
  {
    id: 'appointed-day',
    label: { en: 'Appointed day', hi: 'तय दिन' },
    value: {
      en: 'Friday 15 August 1947. Under the Indian Independence Act both new Dominions, India and Pakistan, begin that day. The Act received the Royal Assent on Friday 18 July.',
      hi: 'शुक्रवार, 15 अगस्त 1947। आज़ादी के क़ानून (इंडियन इंडिपेंडेंस ऐक्ट) के तहत दोनों नए डोमिनियन, भारत और पाकिस्तान, इसी दिन शुरू होते हैं। क़ानून को शुक्रवार 18 जुलाई को राजा की मंज़ूरी मिली।',
    },
    sources: [
      { id: 'menon-1957', loc: 'ch. XVII' },
      { id: 'mansergh-xii', loc: 'Introduction' },
    ],
  },
  {
    id: 'titles',
    label: { en: "Mountbatten's titles", hi: 'माउंटबेटन के ओहदे' },
    value: {
      en: 'Viscount Mountbatten of Burma. Until midnight on 14/15 August he is Viceroy and Governor-General. From 15 August he is Governor-General of the Dominion of India only, no longer Viceroy. An earldom is offered on 31 July and announced only on 15 August.',
      hi: 'बर्मा के वाइकाउंट माउंटबेटन। 14/15 अगस्त की आधी रात तक वे वायसराय और गवर्नर-जनरल हैं। 15 अगस्त से वे सिर्फ़ भारत डोमिनियन के गवर्नर-जनरल हैं, वायसराय नहीं। अर्ल की पदवी 31 जुलाई को पेश की गई और 15 अगस्त को ही घोषित हुई।',
    },
    sources: [
      { id: 'mansergh-xii', loc: 'No. 300 and note' },
      { id: 'cad-14aug1947', loc: 'intimation to the Viceroy' },
      { id: 'campbell-johnson-1951', loc: 'entry for 15 August 1947' },
    ],
    hardHidden: true,
  },
  {
    id: 'radcliffe',
    label: { en: 'Sir Cyril Radcliffe', hi: 'सर सिरिल रैडक्लिफ़' },
    value: {
      en: "Chairman of both Boundary Commissions, Punjab and Bengal. His first time in India: he reached Delhi on 8 July. Lives and works at the Comptroller's House on the Viceregal estate. Private secretary: Christopher Beaumont.",
      hi: 'पंजाब और बंगाल, दोनों सीमा कमीशनों के अध्यक्ष। पहली बार भारत आए: 8 जुलाई को दिल्ली पहुँचे। वायसराय के अहाते में कंप्ट्रोलर हाउस में रहते और काम करते हैं। निजी सचिव: क्रिस्टोफ़र बोमॉन्ट।',
    },
    sources: [
      { id: 'mansergh-xii', loc: 'Introduction; No. 377' },
      { id: 'campbell-johnson-1951', loc: 'July–August 1947 entries' },
      { id: 'chester-2002' },
    ],
  },
  {
    id: 'members',
    label: { en: 'Commission members', hi: 'कमीशन के सदस्य' },
    value: {
      en: 'Punjab: Justices Din Muhammad, Muhammad Munir, Mehr Chand Mahajan, Teja Singh. Bengal: Justices Bijan Kumar Mukherjea, C.C. Biswas, Abu Saleh Mohamed Akram, S.A. Rahman. Chairman of both: Sir Cyril Radcliffe.',
      hi: 'पंजाब: जस्टिस दीन मुहम्मद, मुहम्मद मुनीर, मेहर चंद महाजन, तेजा सिंह। बंगाल: जस्टिस बिजन कुमार मुखर्जी, सी.सी. बिस्वास, अबू सालेह मोहम्मद अकरम, एस.ए. रहमान। दोनों के अध्यक्ष: सर सिरिल रैडक्लिफ़।',
    },
    sources: [{ id: 'mansergh-xii', loc: 'No. 488, Appendices I and II' }],
  },
  {
    id: 'awards',
    label: { en: 'The awards', hi: 'सीमा के फ़ैसले' },
    value: {
      en: 'The Punjab and Bengal awards are dated 12 August; the Sylhet award is dated 13 August. They stay sealed until after the celebrations. The leaders get copies on Saturday 16 August, and the awards are published in a Gazette Extraordinary on Sunday 17 August.',
      hi: 'पंजाब और बंगाल के फ़ैसलों पर 12 अगस्त की तारीख़ है, सिलहट के फ़ैसले पर 13 अगस्त की। जश्न ख़त्म होने तक ये बंद रखे जाते हैं। नेताओं को इनकी कॉपी शनिवार 16 अगस्त को मिलती है, और रविवार 17 अगस्त को ये गज़ट के ख़ास अंक में छपते हैं।',
    },
    sources: [
      { id: 'mansergh-xii', loc: 'No. 488; No. 489 (Personal Report No. 17)' },
      { id: 'campbell-johnson-1951', loc: 'entry for 16 August 1947' },
      { id: 'chester-2002' },
    ],
  },
  {
    id: 'notional',
    label: { en: 'Notional districts', hi: 'कामचलाऊ बँटवारा' },
    value: {
      en: "Until the awards, the Act's Schedules divide the provinces for now. The First Schedule (East Bengal) includes Murshidabad, Nadia and Malda; Khulna and the Chittagong Hill Tracts are not in it. The Second Schedule (West Punjab) includes Gurdaspur and Lahore; Amritsar and Ferozepore are not in it.",
      hi: 'फ़ैसले आने तक क़ानून की सूचियाँ सूबों को कामचलाऊ तौर पर बाँटती हैं। पहली सूची (पूर्वी बंगाल) में मुर्शिदाबाद, नदिया और मालदा हैं; खुलना और चटगाँव हिल ट्रैक्ट्स उसमें नहीं हैं। दूसरी सूची (पश्चिमी पंजाब) में गुरदासपुर और लाहौर हैं; अमृतसर और फ़िरोज़पुर उसमें नहीं हैं।',
    },
    sources: [{ id: 'menon-1957', loc: 'Appendix XI: Indian Independence Act, First and Second Schedules' }],
  },
  {
    id: 'session',
    label: { en: 'Midnight session', hi: 'आधी रात की बैठक' },
    value: {
      en: 'Thursday 14 August, in the Constitution Hall of the Council House, New Delhi. Opens at Eleven P.M. In the chair: Dr Rajendra Prasad, President of the Constituent Assembly. Members take the pledge at the stroke of midnight. Hansa Mehta presents the flag on behalf of the women of India.',
      hi: 'गुरुवार 14 अगस्त, काउंसिल हाउस का कॉन्स्टिट्यूशन हॉल, नई दिल्ली। बैठक रात ग्यारह बजे शुरू होती है। अध्यक्षता: डॉ. राजेंद्र प्रसाद, संविधान सभा के अध्यक्ष। ठीक आधी रात को सदस्य शपथ लेते हैं। हंसा मेहता भारत की महिलाओं की ओर से झंडा भेंट करती हैं।',
    },
    sources: [{ id: 'cad-14aug1947' }],
  },
  {
    id: 'staff',
    label: { en: "Who's who", hi: 'कौन क्या है' },
    value: {
      en: 'George Abell: Private Secretary to the Viceroy. Stuart Abbott: Secretary to the Governor of the Punjab, Sir Evan Jenkins. Maj-Gen T.W. Rees: commands the Punjab Boundary Force, set up on 1 August, about 50,000 officers and men.',
      hi: 'जॉर्ज एबेल: वायसराय के निजी सचिव। स्टुअर्ट एबट: पंजाब के गवर्नर सर इवान जेनकिंस के सचिव। मेजर-जनरल टी.डब्ल्यू. रीस: पंजाब बाउंड्री फ़ोर्स के कमांडर। फ़ोर्स 1 अगस्त को बनी, करीब 50,000 अफ़सर और जवान।',
    },
    sources: [
      { id: 'mansergh-xii', loc: 'Nos. 377, 391' },
      { id: 'menon-1957', loc: 'ch. XVIII' },
    ],
  },
  {
    id: 'delhi-flags',
    label: { en: 'Flags in Delhi', hi: 'दिल्ली में झंडा' },
    value: {
      en: 'Friday 15 August: swearing-in at 8.30 am in the Durbar Hall; the flag is raised at the Council House with a 31-gun salute; in the evening, the flag at Princes Park. The flag goes up over the Red Fort very early on Saturday 16 August, and Nehru speaks to some half a million.',
      hi: 'शुक्रवार 15 अगस्त: सुबह 8.30 बजे दरबार हॉल में शपथ; काउंसिल हाउस पर झंडा, 31 तोपों की सलामी; शाम को प्रिंसेस पार्क में झंडा। लाल क़िले पर झंडा शनिवार 16 अगस्त को बहुत सुबह चढ़ता है, और नेहरू करीब पाँच लाख लोगों के सामने बोलते हैं।',
    },
    sources: [{ id: 'campbell-johnson-1951', loc: 'entries for 15 and 16 August 1947' }],
    hardHidden: true,
  },
  {
    id: 'clock',
    label: { en: 'Clocks', hi: 'घड़ियाँ' },
    value: {
      en: 'Delhi and Karachi keep the same time, 5½ hours ahead of Greenwich. London is behind Delhi.',
      hi: 'दिल्ली और कराची का समय एक ही है, ग्रीनविच से 5½ घंटे आगे। लंदन दिल्ली से पीछे है।',
    },
    sources: [
      { id: 'iana-tz', loc: 'Zones Asia/Karachi and Asia/Kolkata' },
      { id: 'mansergh-xii', loc: 'No. 462 (Karachi 8.30 pm, received in London 5.45 pm)' },
    ],
    hardHidden: true,
  },
]
