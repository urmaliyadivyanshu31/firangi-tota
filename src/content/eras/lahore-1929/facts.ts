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
  // ── Medium and Hard (owner 10-24): the case file grows with the mode. Read against Noorani's
  // archive.org text, Sanyal 1931, Gupta 1972, Nehru 1936, Chaman Lal 2009 and Maclean (Scroll).
  {
    // The schedule spells it 'Parbhat' (Shiv Varma alias Parbhat alias Har Narain); in Hindi, प्रभात.
    id: 'courier',
    para: 1,
    minMode: 'medium',
    label: { en: 'Our courier', hi: 'हमारा हरकारा' },
    value: { en: 'Shiv Verma, called Prabhat', hi: 'शिव वर्मा, यानी प्रभात' },
    story: {
      en: 'Our courier is [[Shiv Verma]], whom we call [[Prabhat]].',
      hi: 'हमारा हरकारा [[शिव वर्मा]] है, जिसे हम [[प्रभात]] कहते हैं।',
    },
    sources: [
      { id: 'noorani-1996', loc: 'Ordinance No. III of 1930, Schedule, pp. 295–296' },
      { id: 'bs-letter-sukhdev', loc: 'editorial note: Shiv Verma carried the letter to Lahore' },
    ],
  },
  {
    // In Delhi with Bhagat Singh in the first week of April (Chaman Lal 2009); 'Battu' or 'Mohan' in the schedule.
    id: 'dutt',
    para: 1,
    minMode: 'medium',
    label: { en: "Our friend's partner", hi: 'हमारे दोस्त का साथी' },
    value: { en: 'Batukeshwar Dutt, called Mohan', hi: 'बटुकेश्वर दत्त, यानी मोहन' },
    story: {
      en: 'In Delhi our friend has [[Batukeshwar Dutt]] beside him, whom we call [[Mohan]].',
      hi: 'दिल्ली में हमारे दोस्त के साथ [[बटुकेश्वर दत्त]] हैं, जिन्हें हम [[मोहन]] कहते हैं।',
    },
    sources: [
      { id: 'noorani-1996', loc: 'Ordinance No. III of 1930, Schedule, pp. 295–296' },
      { id: 'chaman-lal-2009' },
    ],
  },
  {
    id: 'durga',
    para: 1,
    minMode: 'medium',
    label: { en: 'Durga Bhabhi', hi: 'दुर्गा भाभी' },
    value: { en: "B.C.'s wife; son Sachi", hi: 'बी.सी. की पत्नी; बेटा शची' },
    story: {
      en: "[[Durga Bhabhi]] is [[B.C.]]'s wife, and little [[Sachi]] is their son.",
      hi: '[[दुर्गा भाभी]] [[बी.सी.]] की पत्नी हैं, और नन्हा [[शची]] उनका बेटा है।',
    },
    sources: [{ id: 'maclean-durga' }],
  },
  {
    // Born 1907 (Sanyal: 'on a Saturday, in October, 1907'; most later books say 27 or 28 September).
    // Either way he was 21 in April 1929.
    id: 'age',
    para: 1,
    minMode: 'hard',
    label: { en: "Our friend's age", hi: 'हमारे दोस्त की उम्र' },
    value: { en: '21, born 1907', hi: '21 साल, 1907 में जन्म' },
    story: {
      en: 'Our friend, born in [[1907]], is just [[21]].',
      hi: 'हमारा दोस्त [[1907]] में पैदा हुआ, और अभी सिर्फ़ [[21 साल]] का है।',
    },
    sources: [{ id: 'sanyal-1931', loc: "ch. 'The Family and the Boy', pp. 5–6" }],
  },
  {
    // Sanyal: in the HRA at Cawnpore his 'party-name then became "Balwant," under which name he used
    // to contribute articles occasionally to the magazines'.
    id: 'balwant',
    para: 1,
    minMode: 'hard',
    label: { en: 'His pen name', hi: 'उसका लिखने वाला नाम' },
    value: { en: 'Balwant', hi: 'बलवंत' },
    story: {
      en: 'For his magazine articles our friend uses his party name, [[Balwant]].',
      hi: 'पत्रिकाओं के लेखों के लिए हमारा दोस्त अपना पार्टी नाम लिखता है: [[बलवंत]]।',
    },
    sources: [{ id: 'sanyal-1931', loc: "ch. 'Hindusthan Republican Association', p. 13" }],
  },
  {
    id: 'ajit',
    para: 1,
    minMode: 'hard',
    label: { en: "Our friend's uncle", hi: 'हमारे दोस्त के चाचा' },
    value: { en: 'Ajit Singh, in exile abroad', hi: 'अजीत सिंह, विदेश में देश-निकाला' },
    story: {
      en: "Our friend's uncle, [[Ajit Singh]], lives [[in exile abroad]].",
      hi: 'हमारे दोस्त के चाचा [[अजीत सिंह]] [[विदेश में देश-निकाले]] में रहते हैं।',
    },
    sources: [{ id: 'nehru-1936', loc: 'pp. 193–194' }, { id: 'tribune-2010' }],
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
    // 'proprietor of the Kashmir Buildings and had leased out House No. 69 on March 16, 1929 to
    // Bhagwati Charan on Rs. 13 a month' (Noorani p. 64).
    id: 'kashmir',
    para: 2,
    minMode: 'medium',
    label: { en: 'Our building', hi: 'हमारी इमारत' },
    value: { en: 'Kashmir Buildings, taken 16 March', hi: 'कश्मीर बिल्डिंग्स, 16 मार्च से' },
    story: {
      en: 'Our room is in [[Kashmir Buildings]], taken on [[16 March]].',
      hi: 'हमारा कमरा [[कश्मीर बिल्डिंग्स]] में है, जो [[16 मार्च]] को लिया गया।',
    },
    sources: [{ id: 'noorani-1996', loc: "ch. 'Hour of Trial', pp. 58, 64" }],
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
    // The leaflet of 8 April names them ('the Public Safety and the Trade Disputes Bill, while
    // reserving the Press Sedition Bill for the next session'); Noorani p. 29.
    id: 'bills',
    para: 2,
    minMode: 'medium',
    label: { en: 'The two Bills', hi: 'दो बिल' },
    value: { en: 'Public Safety, Trade Disputes', hi: 'पब्लिक सेफ़्टी, ट्रेड डिस्प्यूट्स' },
    story: {
      en: 'The two Bills waiting in Delhi are [[Public Safety]] and [[Trade Disputes]].',
      hi: 'दिल्ली में दो बिल अटके हैं: [[पब्लिक सेफ़्टी]] और [[ट्रेड डिस्प्यूट्स]]।',
    },
    sources: [{ id: 'hsra-leaflet-1929' }, { id: 'noorani-1996', loc: "ch. 'Bombs in the Central Assembly', p. 29" }],
  },
  {
    id: 'irwin',
    para: 2,
    minMode: 'medium',
    label: { en: 'The Viceroy', hi: 'वायसराय' },
    value: { en: 'Lord Irwin', hi: 'लॉर्ड इरविन' },
    story: {
      en: 'The Viceroy in Delhi is [[Lord Irwin]].',
      hi: 'दिल्ली में वायसराय [[लॉर्ड इरविन]] हैं।',
    },
    sources: [{ id: 'noorani-1996', loc: 'pp. 43–45 (Irwin to the Secretary of State, 19 April 1929)' }],
  },
  {
    // 'Two bombs were thrown in quick succession to land behind the Home Member, James Crerar' (Noorani p. 30).
    id: 'crerar',
    para: 2,
    minMode: 'hard',
    label: { en: 'The Home Member', hi: 'होम मेंबर' },
    value: { en: 'Sir James Crerar', hi: 'सर जेम्स क्रेरार' },
    story: {
      en: 'The Home Member is [[Sir James Crerar]].',
      hi: 'होम मेंबर [[सर जेम्स क्रेरार]] हैं।',
    },
    sources: [{ id: 'noorani-1996', loc: "ch. 'Bombs in the Central Assembly', pp. 29–30" }],
  },
  {
    id: 'jallianwala',
    para: 3,
    minMode: 'hard',
    label: { en: 'Jallianwala Bagh', hi: 'जलियाँवाला बाग़' },
    value: { en: 'Amritsar, 13 April 1919', hi: 'अमृतसर, 13 अप्रैल 1919' },
    story: {
      en: 'At [[Amritsar]], troops fired on the crowd in Jallianwala Bagh on [[13 April 1919]].',
      hi: '[[अमृतसर]] के जलियाँवाला बाग़ में [[13 अप्रैल 1919]] को फ़ौज ने भीड़ पर गोली चलाई।',
    },
    sources: [{ id: 'collett-2005' }],
  },
  {
    // Gupta (himself a Kakori accused): the 8-Down train stopped near Kakori, Lucknow district; the
    // arrests of 26 September 1925; Lahiri hanged 17 December, Bismil, Ashfaqulla, Roshan Singh 19 December 1927.
    id: 'kakori',
    para: 3,
    minMode: 'hard',
    label: { en: 'Kakori', hi: 'काकोरी' },
    value: { en: '1925; four hanged, December 1927', hi: '1925; चार को फाँसी, दिसंबर 1927' },
    story: {
      en: 'For the [[1925]] train action at Kakori, [[four]] comrades were hanged in [[December 1927]].',
      hi: '[[1925]] के काकोरी ट्रेन ऐक्शन के लिए [[चार]] साथियों को [[दिसंबर 1927]] में फाँसी हुई।',
    },
    sources: [{ id: 'gupta-1972', loc: 'pp. 107–110' }],
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
    // Noorani: the plan was 'to kill the Superintendent of Police, J.A. Scott'; only after the deed
    // did Bhagat Singh learn 'it was not Scott but his junior' (pp. 1–2, 19–20).
    id: 'scott',
    para: 3,
    minMode: 'medium',
    label: { en: "December's target", hi: 'दिसंबर का निशाना' },
    value: { en: 'J.A. Scott, Superintendent of Police', hi: 'जे.ए. स्कॉट, पुलिस सुपरिंटेंडेंट' },
    story: {
      en: 'In December the target was [[J.A. Scott]], the [[Superintendent of Police]].',
      hi: 'दिसंबर में निशाना [[जे.ए. स्कॉट]] थे, [[पुलिस सुपरिंटेंडेंट]]।',
    },
    sources: [{ id: 'noorani-1996', loc: "pp. 1–2; ch. 'Saunders Murder', pp. 19–20" }],
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
  {
    // 'The Meerut Conspiracy Case began in camera on March 15, 1929 when the District Magistrate of
    // Meerut issued warrants of arrest' against communist and trade union leaders (Noorani p. 134).
    id: 'meerut',
    para: 3,
    minMode: 'medium',
    label: { en: 'Meerut arrests', hi: 'मेरठ की गिरफ़्तारियाँ' },
    value: { en: 'Labour leaders, March 1929', hi: 'मज़दूर नेता, मार्च 1929' },
    story: {
      en: 'In [[March 1929]] the Meerut warrants took the [[labour leaders]].',
      hi: '[[मार्च 1929]] में मेरठ के वारंटों पर [[मज़दूर नेता]] पकड़े गए।',
    },
    sources: [{ id: 'noorani-1996', loc: 'p. 134' }, { id: 'nehru-1936', loc: 'pp. 188–189' }],
  },
]
