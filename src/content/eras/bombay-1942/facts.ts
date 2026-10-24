import type { Fact } from '../../types.js'

// The announcer-operator's case file (dossier §4; people-and-moments.md §3A). In story order: how
// August went (para 1), our own people and place (para 2), the wider war and the British (para 3).
// Each story says its value and nothing more; the checkable words sit in [[ ]]. Three are hardHidden.
// The wavelength (42.34 m) and the air time (8:45 pm) live in the rulebook and on the paper's header.
export const facts: Fact[] = [
  {
    id: 'f-aicc',
    para: 1,
    label: { en: 'Resolution', hi: 'प्रस्ताव' },
    value: { en: 'Gowalia Tank, 8 Aug; 13 against', hi: 'गोवालिया टैंक, 8 अगस्त; 13 विरोध में' },
    story: {
      en: 'The resolution passed at [[Gowalia Tank]] on [[8 August]]; only [[13]] voted against.',
      hi: 'प्रस्ताव [[8 अगस्त]] को [[गोवालिया टैंक]] पर पास हुआ; विरोध में सिर्फ़ [[13]] वोट पड़े।',
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
    value: { en: 'Raised by Aruna Asaf Ali', hi: 'अरुणा आसफ़ अली ने फहराया' },
    story: {
      en: 'On [[9 August]], the flag was raised by [[Aruna Asaf Ali]].',
      hi: '[[9 अगस्त]] को झंडा [[अरुणा आसफ़ अली]] ने फहराया।',
    },
    sources: [{ id: 'rebel-india-1946', loc: 'Bombay section' }],
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
    id: 'f-uprising',
    para: 3,
    label: { en: 'Tamluk, 29 September', hi: 'तमलुक, 29 सितंबर' },
    value: { en: 'Matangini Hazra, 73, shot', hi: 'मातंगिनी हाज़रा, 73 साल, गोली मारी गई' },
    story: {
      en: 'At Tamluk on 29 September, [[Matangini Hazra]], aged [[73]], was [[shot]].',
      hi: '29 सितंबर को तमलुक में [[73 साल]] की [[मातंगिनी हाज़रा]] को [[गोली मारी गई]]।',
    },
    sources: [{ id: 'samanta-1946', loc: 'Tamluk sections' }],
    hardHidden: true,
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
    hardHidden: true,
  },
  {
    id: 'f-chiefs',
    para: 3,
    label: { en: 'British chiefs', hi: 'अंग्रेज़ों के मुखिया' },
    value: { en: 'Prime Minister Churchill; Viceroy Linlithgow', hi: 'प्रधानमंत्री चर्चिल; वायसराय लिनलिथगो' },
    story: {
      en: 'The British chiefs are [[Prime Minister Churchill]] and [[Viceroy Linlithgow]].',
      hi: 'अंग्रेज़ों के मुखिया हैं [[प्रधानमंत्री चर्चिल]] और [[वायसराय लिनलिथगो]]।',
    },
    sources: [{ id: 'top-ii-1971', loc: 'No. 662 (Linlithgow to Churchill, 31 Aug 1942)' }],
    hardHidden: true,
  },
]
