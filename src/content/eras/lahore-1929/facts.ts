import type { Fact } from '../../types.js'

// The case file: what the post box knows, one short line each. Dossier section 4.
export const facts: Fact[] = [
  {
    id: 'sukhdev',
    label: { en: "Sukhdev's names", hi: 'सुखदेव के नाम' },
    value: { en: 'Dyal, Swami, Villager', hi: 'दयाल, स्वामी, विलेजर (गाँववाला)' },
    sources: [
      { id: 'noorani-1996', loc: 'Ordinance No. III of 1930, Schedule, pp. 295–296' },
      { id: 'chaman-lal-reader', loc: 'appendix, schedule of accused' },
    ],
  },
  {
    id: 'aliases',
    label: { en: 'Party names', hi: 'पार्टी के नाम' },
    value: { en: 'Azad: Panditji. Rajguru: M.', hi: 'आज़ाद: पंडितजी। राजगुरु: एम।' },
    sources: [
      { id: 'noorani-1996', loc: 'Ordinance No. III of 1930, Schedule, pp. 295–296' },
      { id: 'chaman-lal-reader', loc: 'appendix, schedule of accused' },
    ],
  },
  {
    id: 'notices',
    label: { en: 'Party notices', hi: 'पार्टी के नोटिस' },
    value: { en: 'Pink, printed heading, signed Balraj', hi: 'गुलाबी, छपी हेडिंग, बलराज के दस्तख़त' },
    sources: [
      { id: 'hsra-notice-1928', loc: 'editorial note' },
      { id: 'noorani-1996', loc: "ch. 'Saunders Murder', p. 23; Irwin to the Secretary of State, 19 April 1929, p. 45" },
      { id: 'sanyal-1931', loc: "'bold printed heading in red'" },
      { id: 'yashpal-1955', loc: "'Balraj', the name Azad signed with" },
    ],
  },
  {
    id: 'saunders',
    label: { en: 'Saunders shot', hi: 'सॉन्डर्स पर गोली' },
    value: { en: 'Monday 17 December 1928, 4 p.m.', hi: 'सोमवार, 17 दिसंबर 1928, शाम 4 बजे' },
    sources: [{ id: 'noorani-1996', loc: "ch. 'Saunders Murder', pp. 19–23" }],
  },
  {
    id: 'escape',
    label: { en: 'December escape', hi: 'दिसंबर में निकलना' },
    value: { en: '20 December, first class, via Lucknow', hi: '20 दिसंबर, फ़र्स्ट क्लास, लखनऊ होकर' },
    sources: [
      { id: 'noorani-1996', loc: "ch. 'Saunders Murder', p. 25" },
      { id: 'sanyal-1931', loc: 'ch. IV, the escape' },
      { id: 'maclean-durga' },
    ],
    hardHidden: true,
  },
  {
    id: 'room',
    label: { en: 'McLeod Road room', hi: 'मैक्लोड रोड का कमरा' },
    value: { en: 'No. 69, Rs 13, tenant B.C.', hi: 'नंबर 69, 13 रुपये, किरायेदार बी.सी.' },
    // B.C. = Bhagwati Charan, the name in the landlord's register.
    sources: [{ id: 'noorani-1996', loc: "ch. 'Hour of Trial', p. 64 (the landlord's evidence)" }],
  },
  {
    id: 'assembly',
    label: { en: 'The Assembly', hi: 'असेंबली' },
    value: { en: 'Delhi. President: Vithalbhai Patel', hi: 'दिल्ली। प्रेसिडेंट: विट्ठलभाई पटेल' },
    sources: [
      { id: 'chaman-lal-2009' },
      { id: 'hsra-leaflet-1929' },
      { id: 'noorani-1996', loc: "p. 30; ch. 'Bombs in the Central Assembly', pp. 43–44" },
    ],
  },
  {
    id: 'delhi',
    label: { en: 'Our friend', hi: 'हमारा दोस्त' },
    value: { en: 'Bhagat Singh, Sita Ram Bazar, Delhi', hi: 'भगत सिंह, सीता राम बाज़ार, दिल्ली' },
    sources: [{ id: 'bs-letter-sukhdev', loc: 'editorial note' }],
  },
  {
    id: 'hsra',
    label: { en: 'HRA became HSRA', hi: 'एच.आर.ए. बनी एच.एस.आर.ए.' },
    value: { en: 'Feroz Shah Kotla, September 1928', hi: 'फ़िरोज़शाह कोटला, सितंबर 1928' },
    sources: [
      { id: 'chaman-lal-reader', loc: 'introduction' },
      { id: 'chaman-lal-2009' },
    ],
    hardHidden: true,
  },
  {
    id: 'lajpat-rai',
    label: { en: 'Lajpat Rai, 1928', hi: 'लाजपत राय, 1928' },
    value: { en: 'Beaten 30 October; died 17 November', hi: '30 अक्टूबर को पिटे; 17 नवंबर को मौत' },
    sources: [{ id: 'sanyal-1931', loc: "ch. 'The Saunders Murder'" }],
    hardHidden: true,
  },
]
