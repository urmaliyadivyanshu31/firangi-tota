import type { Fact } from '../../types.js'

// The case file: what the post box knows. Dossier section 4. In story order: who is who (para 1),
// where things are and how real papers look (para 2), how we got here (para 3). Each story says its
// value and nothing more; the checkable words sit in [[ ]]. The Hindi stories need no "tum" or "aap".
export const facts: Fact[] = [
  {
    id: 'delhi',
    para: 1,
    label: { en: 'Our friend', hi: 'हमारा दोस्त' },
    value: { en: 'Bhagat Singh, Sita Ram Bazar, Delhi', hi: 'भगत सिंह, सीता राम बाज़ार, दिल्ली' },
    story: {
      en: 'Our friend [[Bhagat Singh]] is away in [[Delhi]], at [[Sita Ram Bazar]].',
      hi: 'हमारे दोस्त [[भगत सिंह]] [[दिल्ली]] गए हैं, [[सीता राम बाज़ार]] में।',
    },
    sources: [{ id: 'bs-letter-sukhdev', loc: 'editorial note' }],
  },
  {
    id: 'sukhdev',
    para: 1,
    label: { en: "Sukhdev's names", hi: 'सुखदेव के नाम' },
    value: { en: 'Dyal, Swami, Villager', hi: 'दयाल, स्वामी, विलेजर (गाँववाला)' },
    story: {
      en: 'Sukhdev goes by [[Dyal]], [[Swami]] or [[Villager]].',
      hi: 'सुखदेव के नाम हैं [[दयाल]], [[स्वामी]] और [[विलेजर]], यानी गाँववाला।',
    },
    sources: [
      { id: 'noorani-1996', loc: 'Ordinance No. III of 1930, Schedule, pp. 295–296' },
      { id: 'chaman-lal-reader', loc: 'appendix, schedule of accused' },
    ],
  },
  {
    id: 'aliases',
    para: 1,
    label: { en: 'Party names', hi: 'पार्टी के नाम' },
    value: { en: 'Azad: Panditji. Rajguru: M.', hi: 'आज़ाद: पंडितजी। राजगुरु: एम।' },
    story: {
      en: 'In the party, [[Azad]] is [[Panditji]] and [[Rajguru]] is just [[M]].',
      hi: 'पार्टी में [[आज़ाद]] को [[पंडितजी]] कहते हैं, और [[राजगुरु]] बस [[एम]] हैं।',
    },
    sources: [
      { id: 'noorani-1996', loc: 'Ordinance No. III of 1930, Schedule, pp. 295–296' },
      { id: 'chaman-lal-reader', loc: 'appendix, schedule of accused' },
    ],
  },
  {
    id: 'room',
    para: 2,
    label: { en: 'McLeod Road room', hi: 'मैक्लोड रोड का कमरा' },
    value: { en: 'No. 69, Rs 13, tenant B.C.', hi: 'नंबर 69, 13 रुपये, किरायेदार बी.सी.' },
    story: {
      en: 'The room on McLeod Road is [[No. 69]]; the rent is [[Rs 13]], and the tenant is [[B.C.]]',
      hi: 'मैक्लोड रोड का कमरा [[नंबर 69]] है; किराया [[13 रुपये]] है, और किरायेदार [[बी.सी.]] हैं।',
    },
    // B.C. = Bhagwati Charan, the name in the landlord's register.
    sources: [{ id: 'noorani-1996', loc: "ch. 'Hour of Trial', p. 64 (the landlord's evidence)" }],
  },
  {
    id: 'notices',
    para: 2,
    label: { en: 'Party notices', hi: 'पार्टी के नोटिस' },
    value: { en: 'Pink, printed heading, signed Balraj', hi: 'गुलाबी, छपी हेडिंग, बलराज के दस्तख़त' },
    story: {
      en: 'Party notices are [[pink]], with a [[printed heading]], and [[signed Balraj]].',
      hi: 'पार्टी के नोटिस [[गुलाबी]] होते हैं, उन पर [[छपी हेडिंग]] होती है और [[बलराज के दस्तख़त]]।',
    },
    sources: [
      { id: 'hsra-notice-1928', loc: 'editorial note' },
      { id: 'noorani-1996', loc: "ch. 'Saunders Murder', p. 23; Irwin to the Secretary of State, 19 April 1929, p. 45" },
      { id: 'sanyal-1931', loc: "'bold printed heading in red'" },
      { id: 'yashpal-1955', loc: "'Balraj', the name Azad signed with" },
    ],
  },
  {
    id: 'assembly',
    para: 2,
    label: { en: 'The Assembly', hi: 'असेंबली' },
    value: { en: 'Delhi. President: Vithalbhai Patel', hi: 'दिल्ली। प्रेसिडेंट: विट्ठलभाई पटेल' },
    story: {
      en: 'The Assembly sits in [[Delhi]]; its [[President]] is [[Vithalbhai Patel]].',
      hi: 'असेंबली [[दिल्ली]] में है; उसके [[प्रेसिडेंट]] हैं [[विट्ठलभाई पटेल]]।',
    },
    sources: [
      { id: 'chaman-lal-2009' },
      { id: 'hsra-leaflet-1929' },
      { id: 'noorani-1996', loc: "p. 30; ch. 'Bombs in the Central Assembly', pp. 43–44" },
    ],
  },
  {
    id: 'hsra',
    para: 3,
    label: { en: 'HRA became HSRA', hi: 'एच.आर.ए. बनी एच.एस.आर.ए.' },
    value: { en: 'Feroz Shah Kotla, September 1928', hi: 'फ़िरोज़शाह कोटला, सितंबर 1928' },
    story: {
      en: 'The HRA became the HSRA at [[Feroz Shah Kotla]] in [[September 1928]].',
      hi: 'एच.आर.ए. [[सितंबर 1928]] में [[फ़िरोज़शाह कोटला]] में एच.एस.आर.ए. बनी।',
    },
    sources: [
      { id: 'chaman-lal-reader', loc: 'introduction' },
      { id: 'chaman-lal-2009' },
    ],
    hardHidden: true,
  },
  {
    id: 'lajpat-rai',
    para: 3,
    label: { en: 'Lajpat Rai, 1928', hi: 'लाजपत राय, 1928' },
    value: { en: 'Beaten 30 October; died 17 November', hi: '30 अक्टूबर को पिटे; 17 नवंबर को मौत' },
    story: {
      en: 'In 1928, Lajpat Rai was beaten on [[30 October]] and died on [[17 November]].',
      hi: '1928 में लाजपत राय [[30 अक्टूबर]] को पीटे गए, और [[17 नवंबर]] को उनकी मौत हो गई।',
    },
    sources: [{ id: 'sanyal-1931', loc: "ch. 'The Saunders Murder'" }],
    hardHidden: true,
  },
  {
    id: 'saunders',
    para: 3,
    label: { en: 'Saunders shot', hi: 'सॉन्डर्स पर गोली' },
    value: { en: 'Monday 17 December 1928, 4 p.m.', hi: 'सोमवार, 17 दिसंबर 1928, शाम 4 बजे' },
    story: {
      en: 'Saunders was shot at [[4 p.m.]] on [[Monday 17 December 1928]].',
      hi: 'सॉन्डर्स पर [[सोमवार, 17 दिसंबर 1928]] को [[शाम 4 बजे]] गोली चली।',
    },
    sources: [{ id: 'noorani-1996', loc: "ch. 'Saunders Murder', pp. 19–23" }],
  },
  {
    // The escape was Bhagat Singh's, as a young official, with Durga Devi and Rajguru (Noorani p.25;
    // Sanyal ch. IV; Maclean).
    id: 'escape',
    para: 3,
    label: { en: 'December escape', hi: 'दिसंबर में निकलना' },
    value: { en: '20 December, first class, via Lucknow', hi: '20 दिसंबर, फ़र्स्ट क्लास, लखनऊ होकर' },
    story: {
      en: 'Bhagat Singh slipped out of Lahore on [[20 December]], [[first class]], [[via Lucknow]].',
      hi: 'भगत सिंह [[20 दिसंबर]] को लाहौर से निकले, [[फ़र्स्ट क्लास]] में, [[लखनऊ होकर]]।',
    },
    sources: [
      { id: 'noorani-1996', loc: "ch. 'Saunders Murder', p. 25" },
      { id: 'sanyal-1931', loc: 'ch. IV, the escape' },
      { id: 'maclean-durga' },
    ],
    hardHidden: true,
  },
]
