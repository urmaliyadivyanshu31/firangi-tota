import type { Fact } from '../../types'

// The case file: what the post box knows. Dossier section 4, with each line's source.
export const facts: Fact[] = [
  {
    id: 'aliases',
    label: { en: 'Party names', hi: 'पार्टी के नाम' },
    value: {
      en: "Azad: 'Panditji'. Sukhdev: 'Dyal', 'Swami' or 'Villager'. Rajguru: 'M'. B.K. Dutt: 'Battu' or 'Mohan'. Bhagwati Charan: 'B.C.'",
      hi: "आज़ाद: 'पंडितजी'। सुखदेव: 'दयाल', 'स्वामी' या 'विलेजर' (यानी गाँववाला)। राजगुरु: 'एम'। बटुकेश्वर दत्त: 'बट्टू' या 'मोहन'। भगवती चरण: 'बी.सी.'",
    },
    sources: [
      { id: 'noorani-1996', loc: 'Ordinance No. III of 1930, Schedule, pp. 295–296' },
      { id: 'chaman-lal-reader', loc: 'appendix, schedule of accused' },
    ],
  },
  {
    id: 'notices',
    label: { en: 'Party notices', hi: 'पार्टी के नोटिस' },
    value: {
      en: "Pink paper with the printed heading 'Hindustan Socialist Republican Army', then 'Notice', signed 'Balraj', ending 'Long Live Revolution'. The first was pasted up in Lahore on the night of 18–19 December 1928.",
      hi: "गुलाबी काग़ज़, ऊपर छपी हेडिंग 'हिंदुस्तान सोशलिस्ट रिपब्लिकन आर्मी', फिर 'नोटिस', नीचे 'बलराज' के दस्तख़त, आख़िर में 'इंक़लाब ज़िंदाबाद'। पहला नोटिस 18–19 दिसंबर 1928 की रात लाहौर की दीवारों पर चिपका।",
    },
    sources: [
      { id: 'hsra-notice-1928', loc: 'editorial note' },
      { id: 'noorani-1996', loc: "ch. 'Saunders Murder', p. 23; Irwin to the Secretary of State, 19 April 1929, p. 45" },
      { id: 'sanyal-1931', loc: "'bold printed heading in red'" },
      { id: 'yashpal-1955', loc: "'Balraj', the name Azad signed with" },
    ],
  },
  {
    id: 'saunders',
    label: { en: '17 December 1928', hi: '17 दिसंबर 1928' },
    value: {
      en: 'Monday, about 4 p.m., outside the District Police Office, Lahore. The target was SSP J.A. Scott; the man shot was J.P. Saunders, ASP, aged 21. Head Constable Chanan Singh, who chased them, was shot too and died at Mayo Hospital.',
      hi: 'सोमवार, शाम करीब 4 बजे, लाहौर के ज़िला पुलिस दफ़्तर के बाहर। निशाना पुलिस अफ़सर जे.ए. स्कॉट थे; गोली 21 साल के असिस्टेंट सुपरिंटेंडेंट जे.पी. सॉन्डर्स को लगी। पीछा करने वाले हेड कांस्टेबल चानन सिंह को भी गोली लगी, और मेयो अस्पताल में उनकी मौत हो गई।',
    },
    sources: [{ id: 'noorani-1996', loc: "ch. 'Saunders Murder', pp. 19–23" }],
  },
  {
    id: 'escape',
    label: { en: 'The December escape', hi: 'दिसंबर में लाहौर से निकलना' },
    value: {
      en: 'Thursday 20 December 1928, first class. Bhagat Singh clean-shaven, in Western dress, as a young official; Durga Devi as his wife, with her son Sachi; Rajguru as the servant with the tiffin carrier. They changed trains at Lucknow for Calcutta.',
      hi: '20 दिसंबर 1928, गुरुवार, फ़र्स्ट क्लास। भगत सिंह दाढ़ी-बाल कटवाकर, अंग्रेज़ी कपड़ों में, एक नौजवान अफ़सर बने; दुर्गा देवी उनकी पत्नी बनीं, साथ में उनका बेटा शची; राजगुरु टिफ़िन-कैरियर उठाए नौकर बने। लखनऊ में गाड़ी बदलकर वे कलकत्ता गए।',
    },
    sources: [
      { id: 'noorani-1996', loc: "ch. 'Saunders Murder', p. 25" },
      { id: 'sanyal-1931', loc: 'ch. IV, the escape' },
      { id: 'maclean-durga' },
    ],
    hardHidden: true,
  },
  {
    id: 'room',
    label: { en: 'The McLeod Road room', hi: 'मैक्लोड रोड वाला कमरा' },
    value: {
      en: "House No. 69, Kashmir Buildings, McLeod Road, Lahore. Rented on 16 March 1929 in Bhagwati Charan's name, at Rs 13 a month.",
      hi: 'मकान नंबर 69, कश्मीर बिल्डिंग्स, मैक्लोड रोड, लाहौर। 16 मार्च 1929 को भगवती चरण के नाम पर 13 रुपये महीने के किराए पर लिया गया।',
    },
    sources: [{ id: 'noorani-1996', loc: "ch. 'Hour of Trial', p. 64 (the landlord's evidence)" }],
  },
  {
    id: 'assembly',
    label: { en: 'The Assembly in Delhi', hi: 'दिल्ली की असेंबली' },
    value: {
      en: 'The Central Legislative Assembly sits in Delhi. Its President is Vithalbhai Patel. In early April it was debating: the Public Safety Bill and the Trade Disputes Bill.',
      hi: 'सेंट्रल लेजिस्लेटिव असेंबली दिल्ली में बैठती है। इसके प्रेसिडेंट विट्ठलभाई पटेल हैं। अप्रैल की शुरुआत में इसके सामने थे: पब्लिक सेफ़्टी बिल और ट्रेड डिस्प्यूट्स बिल।',
    },
    sources: [
      { id: 'chaman-lal-2009' },
      { id: 'hsra-leaflet-1929' },
      { id: 'noorani-1996', loc: "p. 30; ch. 'Bombs in the Central Assembly', pp. 43–44" },
    ],
  },
  {
    id: 'delhi',
    label: { en: 'Our friend in Delhi', hi: 'दिल्ली में हमारा दोस्त' },
    value: {
      en: 'In early April 1929 Bhagat Singh was staying at the Sita Ram Bazar house in Delhi.',
      hi: 'अप्रैल 1929 की शुरुआत में भगत सिंह दिल्ली के सीता राम बाज़ार वाले मकान में ठहरे थे।',
    },
    sources: [{ id: 'bs-letter-sukhdev', loc: 'editorial note' }],
  },
  {
    id: 'hsra',
    label: { en: "The party's name", hi: 'पार्टी का नाम' },
    value: {
      en: 'The HRA became the Hindustan Socialist Republican Association at Feroz Shah Kotla, Delhi, on 8–9 September 1928.',
      hi: 'एच.आर.ए. 8–9 सितंबर 1928 को दिल्ली के फ़िरोज़शाह कोटला में हिंदुस्तान सोशलिस्ट रिपब्लिकन एसोसिएशन बनी।',
    },
    sources: [
      { id: 'chaman-lal-reader', loc: 'introduction' },
      { id: 'chaman-lal-2009' },
    ],
    hardHidden: true,
  },
  {
    id: 'lajpat-rai',
    label: { en: 'Lala Lajpat Rai', hi: 'लाला लाजपत राय' },
    value: {
      en: 'The Simon Commission came to Lahore on Tuesday 30 October 1928. The police beat many of the protesters, Lajpat Rai among them. He died on Saturday 17 November 1928.',
      hi: 'साइमन कमीशन 30 अक्टूबर 1928, मंगलवार को लाहौर आया। पुलिस ने कई प्रदर्शनकारियों पर लाठियाँ चलाईं, लाजपत राय पर भी। 17 नवंबर 1928, शनिवार को उनकी मौत हो गई।',
    },
    sources: [{ id: 'sanyal-1931', loc: "ch. 'The Saunders Murder'" }],
    hardHidden: true,
  },
]
