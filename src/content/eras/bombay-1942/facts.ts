import type { Fact } from '../../types.js'

// The announcer-operator's case file (dossier §4; people-and-moments.md §3A). In story order: how
// August went (para 1), our own people and place (para 2), the wider war and the British (para 3).
// Each story says its value and nothing more; the checkable words sit in [[ ]]. Every line is readable in every mode it is in.
// The wavelength (42.34 m) and the air time (8:45 pm) live in the rulebook and on the paper's header.
// The case file grows with the mode (owner 10-24): minMode 'medium' facts join in Medium and Hard,
// 'hard' facts in Hard only (the leaders' whereabouts, our own people, the wider rising, the first INA).
export const facts: Fact[] = [
  {
    id: 'f-aicc',
    para: 1,
    label: { en: 'Resolution, Saturday', hi: 'प्रस्ताव, शनिवार' },
    value: { en: 'Gowalia Tank, 8 Aug; 13 against', hi: 'गोवालिया टैंक, 8 अगस्त; 13 विरोध में' },
    story: {
      en: 'The resolution passed at [[Gowalia Tank]] on [[Saturday 8 August]]; only [[13]] voted against.',
      hi: 'प्रस्ताव [[शनिवार 8 अगस्त]] को [[गोवालिया टैंक]] पर पास हुआ; विरोध में सिर्फ़ [[13]] वोट पड़े।',
    },
    sources: [
      { id: 'iar-1942', loc: 'AICC proceedings; Chronicle p. 17' },
      { id: 'gandhi-1942' },
      { id: 'goi-1943', loc: 'App. X' },
    ],
  },
  {
    id: 'f-zero-hour',
    para: 1,
    label: { en: 'Arrests', hi: 'गिरफ़्तारियाँ' },
    value: { en: '5 am, Sunday 9 August', hi: 'रविवार 9 अगस्त, सुबह 5 बजे' },
    story: {
      en: 'The leaders were arrested at [[5 am]] on [[Sunday 9 August]].',
      hi: 'नेता [[रविवार 9 अगस्त]] को [[सुबह 5 बजे]] गिरफ़्तार हुए।',
    },
    sources: [{ id: 'top-ii-1971', loc: 'No. 624, pp. 806–7' }],
  },
  {
    id: 'f-flag',
    para: 1,
    label: { en: 'Flag, 9 August', hi: 'झंडा, 9 अगस्त' },
    value: { en: 'Aruna Asaf Ali, at Gowalia Tank', hi: 'अरुणा आसफ़ अली, गोवालिया टैंक पर' },
    story: {
      en: 'On [[9 August]], at [[Gowalia Tank]], the flag was raised by [[Aruna Asaf Ali]].',
      hi: '[[9 अगस्त]] को [[गोवालिया टैंक]] पर झंडा [[अरुणा आसफ़ अली]] ने फहराया।',
    },
    sources: [{ id: 'rebel-india-1946', loc: 'Bombay section (the flag at Gowalia Tank Maidan)' }],
  },
  {
    id: 'f-train',
    para: 1,
    label: { en: 'Gandhiji’s train', hi: 'गांधीजी की ट्रेन' },
    value: { en: 'Off at Chinchwad, short of Poona', hi: 'पूना से पहले, चिंचवड़ में उतारे गए' },
    story: {
      en: 'Gandhiji was taken off his train at [[Chinchwad]], [[short of Poona]].',
      hi: 'गांधीजी को [[पूना से पहले]], [[चिंचवड़]] में ट्रेन से उतारा गया।',
    },
    sources: [{ id: 'top-ii-1971', loc: 'No. 624, p. 807' }],
  },
  {
    id: 'f-detention',
    para: 1,
    label: { en: 'Leaders held', hi: 'नेता कहाँ बंद' },
    value: { en: 'Gandhiji: Aga Khan Palace. Nehru: Ahmednagar', hi: 'गांधीजी: आग़ा ख़ान महल। नेहरू: अहमदनगर क़िला' },
    story: {
      en: 'Now [[Gandhiji]] is held in the [[Aga Khan Palace]], and [[Nehru]] at [[Ahmednagar]].',
      hi: 'अब [[गांधीजी]] [[आग़ा ख़ान महल]] में बंद हैं, और [[नेहरू]] [[अहमदनगर क़िले]] में।',
    },
    sources: [{ id: 'top-ii-1971', loc: 'Introduction p. xii; No. 553 (letter from Aga Khan’s Palace, 14 Aug 1942)' }],
  },
  {
    id: 'f-palace',
    para: 1,
    minMode: 'medium',
    label: { en: 'With Gandhiji', hi: 'गांधीजी के साथ' },
    value: { en: 'Kasturba and Sarojini Naidu', hi: 'कस्तूरबा और सरोजिनी नायडू' },
    story: {
      en: 'At the palace, [[Kasturba]] and [[Sarojini Naidu]] are held with Gandhiji.',
      hi: 'महल में गांधीजी के साथ [[कस्तूरबा]] और [[सरोजिनी नायडू]] भी बंद हैं।',
    },
    sources: [{ id: 'mkgandhi-agakhan' }],
  },
  {
    id: 'f-mahadev',
    para: 1,
    minMode: 'medium',
    label: { en: 'Mahadev Desai', hi: 'महादेव देसाई' },
    value: { en: 'Died 15 Aug, Aga Khan Palace', hi: '15 अगस्त को आग़ा ख़ान महल में गुज़रे' },
    story: {
      en: '[[Mahadev Desai]] died at the [[Aga Khan Palace]] on [[15 August]].',
      hi: '[[महादेव देसाई]] [[15 अगस्त]] को [[आग़ा ख़ान महल]] में गुज़र गए।',
    },
    sources: [{ id: 'cwmg-76-vol', loc: 'Introduction; No. 435, telegram to Chimanlal N. Shah, 15-8-1942, p. 410' }, { id: 'mkgandhi-agakhan' }],
  },
  {
    id: 'f-fort',
    para: 1,
    minMode: 'medium',
    label: { en: 'Ahmednagar Fort', hi: 'अहमदनगर क़िला' },
    value: { en: 'With Nehru: Azad, Pant, Asaf Ali', hi: 'नेहरू के साथ: आज़ाद, पंत, आसफ़ अली' },
    story: {
      en: 'In [[Ahmednagar Fort]], [[Nehru]] is held with [[Azad]], [[Pant]] and [[Asaf Ali]].',
      hi: '[[अहमदनगर क़िले]] में [[नेहरू]] के साथ [[आज़ाद]], [[पंत]] और [[आसफ़ अली]] बंद हैं।',
    },
    sources: [
      { id: 'nehru-1946', loc: 'Preface (eleven companions; names Azad, Pant, Narendra Deva, M. Asaf Ali)' },
      { id: 'top-ii-1971', loc: 'Introduction p. xii (Working Committee to Ahmednagar Fort)' },
    ],
  },
  {
    id: 'f-lastmsg',
    para: 1,
    minMode: 'hard',
    label: { en: 'Gandhiji’s last message', hi: 'गांधीजी का आख़िरी संदेश' },
    value: { en: 'Says: Karenge Ya Marenge', hi: 'उसमें: करेंगे या मरेंगे' },
    story: {
      en: 'Gandhiji’s last message, left at his arrest, says [[Karenge Ya Marenge]].',
      hi: 'गिरफ़्तारी के वक़्त छोड़े गांधीजी के आख़िरी संदेश में लिखा है: [[करेंगे या मरेंगे]]।',
    },
    sources: [{ id: 'goi-1943', loc: 'App. X' }],
  },
  {
    id: 'f-team',
    para: 2,
    label: { en: 'Our people', hi: 'हमारे लोग' },
    value: { en: 'Vithalbhai Jhaveri records; parts: Chicago Radio', hi: 'रिकॉर्डिंग: विट्ठलभाई झवेरी; पुर्ज़े: शिकागो रेडियो' },
    story: {
      en: '[[Vithalbhai Jhaveri]] makes our [[records]], and our [[parts]] come from [[Chicago Radio]].',
      hi: 'हमारी [[रिकॉर्डिंग]] [[विट्ठलभाई झवेरी]] करते हैं, और [[पुर्ज़े]] [[शिकागो रेडियो]] से आते हैं।',
    },
    sources: [
      { id: 'chatterjee-1989', loc: 'Home Dept records: the accused' },
      { id: 'huacuja-2023', loc: 'trial' },
      { id: 'thakkar-2021', loc: 'Scroll excerpt' },
    ],
  },
  {
    id: 'f-khakhar',
    para: 2,
    minMode: 'medium',
    label: { en: 'Chief organiser', hi: 'संगठन के मुखिया' },
    value: { en: 'Babubhai Khakhar, answering to Lohia', hi: 'बाबूभाई खाखर, उनके ऊपर लोहिया' },
    story: {
      en: 'Our chief organiser is [[Babubhai Khakhar]], and he answers to [[Lohia]].',
      hi: 'हमारे संगठन के मुखिया [[बाबूभाई खाखर]] हैं, और उनके ऊपर [[लोहिया]] हैं।',
    },
    sources: [
      { id: 'chatterjee-1989', loc: 'Home Dept records: Khakar “chief organiser… responsible to Ram Manohar Lohia”' },
      { id: 'usha-mehta-1969' },
    ],
  },
  {
    id: 'f-underground',
    para: 2,
    minMode: 'medium',
    label: { en: 'Underground leaders', hi: 'छिपकर काम करते नेता' },
    value: { en: 'Aruna Asaf Ali, Achyut Patwardhan', hi: 'अरुणा आसफ़ अली, अच्युत पटवर्धन' },
    story: {
      en: 'Our underground leaders include [[Aruna Asaf Ali]] and [[Achyut Patwardhan]].',
      hi: 'छिपकर काम करने वाले हमारे नेताओं में [[अरुणा आसफ़ अली]] और [[अच्युत पटवर्धन]] हैं।',
    },
    sources: [{ id: 'bipan-chandra-1989', loc: 'ch. 35, p. 468 (the underground leadership)' }],
  },
  {
    id: 'f-voices',
    para: 2,
    minMode: 'medium',
    label: { en: 'English talks', hi: 'अंग्रेज़ी भाषण' },
    value: { en: 'Lohia and Coomi Dastur', hi: 'लोहिया और कूमी दस्तूर' },
    story: {
      en: 'Our English talks are mostly read by [[Lohia]] and [[Coomi Dastur]].',
      hi: 'हमारे अंग्रेज़ी भाषण ज़्यादातर [[लोहिया]] और [[कूमी दस्तूर]] पढ़ते हैं।',
    },
    sources: [{ id: 'usha-mehta-1969', loc: '“Most of the speeches in English were relayed by Dr. Lohia and Miss Dastur”' }],
  },
  {
    id: 'f-parekh',
    para: 2,
    minMode: 'medium',
    label: { en: 'Our transmitter', hi: 'हमारा ट्रांसमीटर' },
    value: { en: 'Parekh Wadi, Girgaum, since 15 October', hi: 'पारेख वाड़ी, गिरगाँव, 15 अक्टूबर से' },
    story: {
      en: 'Since [[15 October]], our transmitter has been at [[Parekh Wadi]], in [[Girgaum]].',
      hi: '[[15 अक्टूबर]] से हमारा ट्रांसमीटर [[गिरगाँव]] की [[पारेख वाड़ी]] में है।',
    },
    sources: [
      { id: 'huacuja-2023', loc: 'Fig. 4, police list of sites (from Sengupta and Chatterjee 1988)' },
      { id: 'chatterjee-1989', loc: 'sites: Parekh Wadi Building, Girgaum Back Road' },
    ],
  },
  {
    id: 'f-newsite',
    para: 2,
    label: { en: 'Second site', hi: 'दूसरा ठिकाना' },
    value: { en: 'Paradise Bungalow, Mahalaxmi, from 3 Nov', hi: 'पैराडाइज़ बंगला, महालक्ष्मी, 3 नवंबर से' },
    story: {
      en: 'From [[3 November]], our second site is [[Paradise Bungalow]], at [[Mahalaxmi]].',
      hi: '[[3 नवंबर]] से हमारा दूसरा ठिकाना है [[पैराडाइज़ बंगला]], [[महालक्ष्मी]] में।',
    },
    sources: [
      { id: 'huacuja-2023', loc: 'Fig. 4, police list of sites (from Sengupta and Chatterjee 1988)' },
      { id: 'chatterjee-1989' },
    ],
  },
  {
    id: 'f-printer',
    para: 2,
    minMode: 'hard',
    label: { en: 'Our technician', hi: 'हमारे मिस्त्री' },
    value: { en: 'Nariman Printer, paid for it', hi: 'नरीमन प्रिंटर, पैसे लेकर' },
    story: {
      en: 'Our sets are built by [[Nariman Printer]], who does it [[for pay]].',
      hi: 'हमारे सेट [[नरीमन प्रिंटर]] बनाते हैं, और यह काम वे [[पैसे लेकर]] करते हैं।',
    },
    sources: [
      { id: 'chatterjee-1989', loc: 'Home Dept: Printer built the set; “for the sake of profit”' },
      { id: 'thakkar-2021', loc: 'Scroll excerpt (court: financial motives)' },
    ],
  },
  {
    id: 'f-motwane',
    para: 2,
    minMode: 'hard',
    label: { en: 'Chicago Radio', hi: 'शिकागो रेडियो' },
    value: { en: 'Owner: Nanak Motwane', hi: 'मालिक: नानक मोटवाने' },
    story: {
      en: 'Chicago Radio’s owner is [[Nanak Motwane]].',
      hi: 'शिकागो रेडियो के मालिक [[नानक मोटवाने]] हैं।',
    },
    sources: [
      { id: 'usha-mehta-1969', loc: '“Nanak Motwani, the proprietor of the Chicago Radio Co.”' },
      { id: 'huacuja-2023', loc: 'the accused' },
    ],
  },
  {
    id: 'f-tuning',
    para: 2,
    minMode: 'hard',
    label: { en: 'Tuning advice', hi: 'सुई की सलाह' },
    value: { en: 'Move between 39 and 43 metres', hi: '39 से 43 मीटर के बीच घुमाइए' },
    story: {
      en: 'When reception fades, we tell listeners to [[move between 39 and 43 metres]].',
      hi: 'आवाज़ धीमी हो तो हम सुनने वालों से कहते हैं, [[39 से 43 मीटर के बीच]] सुई घुमाइए।',
    },
    sources: [{ id: 'huacuja-2023', loc: 'n. 120 (transcript of 18 Oct 1942)' }],
  },
  {
    id: 'f-antiindia',
    para: 2,
    minMode: 'hard',
    label: { en: 'Official radio', hi: 'सरकारी रेडियो' },
    value: { en: 'Anti-India Radio: it jams us', hi: 'एंटी-इंडिया रेडियो: हमें जाम करता है' },
    story: {
      en: 'Here, the official radio is often called [[Anti-India Radio]], because it [[jams]] our broadcasts.',
      hi: 'यहाँ सरकारी रेडियो को अक्सर [[एंटी-इंडिया रेडियो]] कहा जाता है, क्योंकि वह हमारी आवाज़ [[जाम करता है]]।',
    },
    sources: [{ id: 'usha-mehta-1969', loc: 'the official radio jammed them; colleagues called it “not ‘All India Radio’ but ‘Anti-India Radio’”' }],
  },
  {
    id: 'f-ballia',
    para: 3,
    minMode: 'medium',
    label: { en: 'Ballia, August', hi: 'बलिया, अगस्त' },
    value: { en: 'Chittu Pande’s own government, a week', hi: 'चित्तू पांडे की अपनी सरकार, एक हफ़्ता' },
    story: {
      en: 'In August, [[Chittu Pande]] ran Ballia’s [[own government]] for [[a week]], until soldiers marched in.',
      hi: 'अगस्त में [[चित्तू पांडे]] ने बलिया में [[अपनी सरकार]] [[एक हफ़्ता]] चलाई, फिर फ़ौज आ गई।',
    },
    sources: [
      { id: 'bipan-chandra-1989', loc: 'ch. 35 (parallel governments: Ballia, soldiers “a week after”)' },
      { id: 'usha-mehta-1969', loc: 'first to broadcast “the happenings in Ballia”' },
    ],
  },
  {
    id: 'f-uprising',
    para: 3,
    label: { en: 'Tamluk, 29 September', hi: 'तमलुक, 29 सितंबर' },
    value: { en: 'Matangini Hazra, 73, shot', hi: 'मातंगिनी हाज़रा, 73 साल, गोली मारी गई' },
    story: {
      en: 'At Tamluk on 29 September, [[Matangini Hazra]], aged [[73]], was [[shot]].',
      hi: '29 सितंबर को तमलुक में [[73 साल]] की [[मातंगिनी हाज़रा]] को [[गोली मारी गई]]।',
    },
    sources: [{ id: 'samanta-1946', loc: 'Tamluk sections' }],
  },
  {
    id: 'f-netaji',
    para: 3,
    label: { en: 'Netaji Subhas Bose', hi: 'नेताजी सुभाष बोस' },
    value: { en: 'In Germany, on Azad Hind Radio', hi: 'जर्मनी में, आज़ाद हिंद रेडियो पर' },
    story: {
      en: 'Netaji Subhas Bose is in [[Germany]], speaking on [[Azad Hind Radio]].',
      hi: 'नेताजी सुभाष बोस [[जर्मनी]] में हैं, और [[आज़ाद हिंद रेडियो]] पर बोलते हैं।',
    },
    sources: [
      { id: 'huacuja-2023', loc: 'p. 1630 (text at n. 65: in Germany, broadcasting through Quit India); p. 1639 (n. 110: Azad Hind Radio)' },
      { id: 'bipan-chandra-1989', loc: 'ch. 35, p. 477 (reached Singapore only on 2 July 1943)' },
    ],
  },
  {
    id: 'f-chiefs',
    para: 3,
    label: { en: 'British chiefs', hi: 'अंग्रेज़ों के मुखिया' },
    value: { en: 'Churchill, King’s First Minister; Viceroy Linlithgow', hi: 'बादशाह के प्रधानमंत्री चर्चिल; वायसराय लिनलिथगो' },
    story: {
      en: 'The British chiefs are [[Churchill]], the [[King’s First Minister]], that is the prime minister, and [[Viceroy Linlithgow]].',
      hi: 'अंग्रेज़ों के मुखिया हैं [[बादशाह के प्रधानमंत्री चर्चिल]] और [[वायसराय लिनलिथगो]]।',
    },
    sources: [{ id: 'top-ii-1971', loc: 'No. 662 (Linlithgow to Churchill, 31 Aug 1942)' }, { id: 'churchill-1942', loc: '“the King’s First Minister”' }],
  },
  {
    id: 'f-ina',
    para: 3,
    minMode: 'hard',
    label: { en: 'First INA', hi: 'पहली आज़ाद हिंद फ़ौज' },
    value: { en: 'Raised by Mohan Singh, in Malaya', hi: 'मोहन सिंह ने मलाया में खड़ी की' },
    story: {
      en: 'The first INA was raised by [[Mohan Singh]], in [[Malaya]], from prisoners of war.',
      hi: 'पहली आज़ाद हिंद फ़ौज [[मोहन सिंह]] ने [[मलाया]] में जंगी क़ैदियों से खड़ी की।',
    },
    sources: [{ id: 'bipan-chandra-1989', loc: 'ch. 35, pp. 476–7 (INA conceived in Malaya by Mohan Singh; first division 1 Sep 1942)' }],
  },
]
