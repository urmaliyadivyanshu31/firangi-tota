import type { L10n, Message } from '../../types.js'

// Message pool for Bombay 1942. Genuine messages are written for the game unless they carry
// `document` (real broadcast, leaflet or speech words from dossier §5, trimmed with "…"). Every
// forgery is a CID Special Branch plant (game fiction) with at least one tell.
//
// Window: day 1 = Fri 30 Oct 1942 ... day 14 = Thu 12 Nov 1942. Undated messages are true on any
// day of the window. onDay messages on days 1–3 are tier 1 (Easy keeps days 1–3 at tier 1).
//
// The storyline (onDay events): d1 "uncensored news" goes out; d2 Patel and Azad on record;
// d5 a second site opens; d7 the radio shops are raided; d8 Gandhi's 5 November letter from the
// Aga Khan Palace on Lord Halifax's son; d11 three months since 9 August;
// d12 JP has escaped; d13 Churchill's "liquidation" speech; d14 the morning broadcast, the raid
// on the organisers' office and Lohia's "the work must go on".
// Medium adds d14 "another transmitter overnight"; Hard adds d13 Churchill on the Battle of Egypt.
// Medium and Hard messages (minMode) sit at the end of the pool, each caught by its own case-file fact.
//
// "Records" are gramophone records (rule r-records, day 1). Hindi keeps police papers as
// "पुलिस के काग़ज़" so "रिकॉर्ड" only ever means a gramophone record.

const REC: L10n = { en: 'Recording room', hi: 'रिकॉर्डिंग वाला कमरा' }
const SLIP: L10n = { en: 'News slip', hi: 'ख़बर की पर्ची' }
const COURIER: L10n = { en: 'Courier note', hi: 'हरकारे की पर्ची' }
const NEWSDESK: L10n = { en: 'News office', hi: 'ख़बर दफ़्तर' }
const OLD: L10n = { en: 'Old script', hi: 'पुरानी स्क्रिप्ट' }
const SCRIPT: L10n = { en: 'Evening script', hi: 'शाम की स्क्रिप्ट' }
const ORGANISERS: L10n = { en: 'The organisers', hi: 'संगठन वाले' }
const LEAFLET: L10n = { en: 'Leaflet, for air', hi: 'पर्चा, रेडियो के लिए' }
const MORNING: L10n = { en: 'Morning script', hi: 'सुबह की स्क्रिप्ट' }

const ANN: L10n = { en: 'Announcer, 8:45 pm', hi: 'अनाउंसर, रात 8:45' }
const ANN_AM: L10n = { en: 'Announcer, morning', hi: 'अनाउंसर, सुबह' }

export const messages: Message[] = [
  // ───────────────────────── Tier 1: case-file and rulebook catches ─────────────────────────

  // Day 1, Fri 30 Oct: the real line of that night.
  {
    id: 'b42-d1-uncensored-g',
    tier: 1,
    real: true,
    pair: 'd1-uncensored',
    onDay: 1,
    from: SCRIPT,
    to: ANN,
    text: {
      en: '8:45 pm tonight: “Radio is the only place where you can find uncensored news.”',
      hi: 'आज रात 8:45 बजे: “रेडियो ही वह जगह है जहाँ आपको बिना काट-छाँट की ख़बर मिलती है।”',
    },
    checks: { en: ['8:45 pm'], hi: ['8:45 बजे'] },
    document: { sources: [{ id: 'huacuja-2023', loc: 'police transcript of 30 Oct 1942' }] },
    why: {
      text: {
        en: 'Real words from that night, 30 October 1942, as police wrote them down.',
        hi: '30 अक्टूबर 1942 की रात के असली शब्द, जैसे पुलिस ने लिखे।',
      },
      sources: [
        { id: 'huacuja-2023', loc: 'police transcript of 30 Oct 1942; n. 120 (on air from 8:45 pm)' },
      ],
    },
  },
  {
    id: 'b42-d1-uncensored-f',
    tier: 1,
    real: false,
    pair: 'd1-uncensored',
    onDay: 1,
    from: SCRIPT,
    to: ANN,
    text: {
      en: '9:45 pm tonight: “Radio is the only place where you can find uncensored news.”',
      hi: 'आज रात 9:45 बजे: “रेडियो ही वह जगह है जहाँ आपको बिना काट-छाँट की ख़बर मिलती है।”',
    },
    checks: { en: ['9:45 pm'], hi: ['9:45 बजे'] },
    tells: [
      {
        kind: 'number',
        explain: { en: 'We go on air at 8:45 pm, not 9:45.', hi: 'हम रात 8:45 बजे बोलते हैं, 9:45 पर नहीं।' },
        ruleId: 'r-onair',
        sources: [{ id: 'nehru-centre-2021' }, { id: 'huacuja-2023', loc: 'n. 120 (transcript of 18 Oct 1942)' }],
      },
    ],
  },

  // Day 2, Sat 31 Oct: late-October broadcasts aired Patel's speech and Azad's own voice.
  {
    id: 'b42-d2-patel-azad-g',
    tier: 1,
    real: true,
    pair: 'd2-patel-azad',
    onDay: 2,
    from: REC,
    to: ANN,
    text: {
      en: 'This week’s recorded speeches: Sardar Patel’s, made after the Gowalia Tank resolution, and Maulana Azad’s, in his own voice.',
      hi: 'इस हफ़्ते के रिकॉर्ड किए भाषण: सरदार पटेल का, जो गोवालिया टैंक वाले प्रस्ताव के बाद दिया गया, और मौलाना आज़ाद का, उनकी अपनी आवाज़ में।',
    },
    checks: { en: ['Gowalia Tank resolution'], hi: ['गोवालिया टैंक वाले प्रस्ताव'] },
    why: {
      text: {
        en: 'Police notes of late October 1942 record both speeches going out.',
        hi: 'अक्टूबर 1942 के आख़िर के पुलिस काग़ज़ों में दोनों भाषण दर्ज हैं।',
      },
      sources: [
        { id: 'huacuja-2023', loc: 'n. 99 (published police reports, pp. 115 and 129)' },
        { id: 'iar-1942', loc: 'AICC proceedings (Gowalia Tank)' },
      ],
    },
  },
  {
    id: 'b42-d2-patel-azad-f',
    tier: 1,
    real: false,
    pair: 'd2-patel-azad',
    onDay: 2,
    from: REC,
    to: ANN,
    text: {
      en: 'This week’s recorded speeches: Sardar Patel’s, made after the Azad Maidan resolution, and Maulana Azad’s, in his own voice.',
      hi: 'इस हफ़्ते के रिकॉर्ड किए भाषण: सरदार पटेल का, जो आज़ाद मैदान वाले प्रस्ताव के बाद दिया गया, और मौलाना आज़ाद का, उनकी अपनी आवाज़ में।',
    },
    checks: { en: ['Azad Maidan resolution'], hi: ['आज़ाद मैदान वाले प्रस्ताव'] },
    tells: [
      {
        kind: 'place',
        explain: { en: 'The resolution was passed at Gowalia Tank, not Azad Maidan.', hi: 'प्रस्ताव गोवालिया टैंक में पास हुआ, आज़ाद मैदान में नहीं।' },
        factId: 'f-aicc',
        sources: [{ id: 'iar-1942', loc: 'AICC proceedings' }],
      },
    ],
  },

  {
    id: 'b42-opening-g',
    tier: 1,
    real: true,
    pair: 'opening',
    from: SCRIPT,
    to: ANN,
    text: {
      en: 'This is the Congress Radio calling on 42.34 metres from somewhere in India. First, the news in Hindustani.',
      hi: 'यह कांग्रेस रेडियो है, 42.34 मीटर पर, हिंदुस्तान में कहीं से बोल रहा है। पहले हिंदुस्तानी में ख़बरें।',
    },
    checks: { en: ['42.34 metres', 'somewhere in India'], hi: ['42.34 मीटर', 'हिंदुस्तान में कहीं से'] },
    why: {
      text: {
        en: 'The station’s real opening words, as Usha Mehta remembered them.',
        hi: 'स्टेशन के असली शुरुआती शब्द, जैसे उषा मेहता को याद थे।',
      },
      sources: [{ id: 'usha-mehta-1969' }, { id: 'huacuja-2023', loc: 'languages' }],
    },
  },
  {
    id: 'b42-opening-f',
    tier: 1,
    real: false,
    pair: 'opening',
    from: SCRIPT,
    to: ANN,
    text: {
      en: 'This is the Congress Radio calling on 43.24 metres from somewhere in India. First, the news in Hindustani.',
      hi: 'यह कांग्रेस रेडियो है, 43.24 मीटर पर, हिंदुस्तान में कहीं से बोल रहा है। पहले हिंदुस्तानी में ख़बरें।',
    },
    checks: { en: ['43.24 metres', 'somewhere in India'], hi: ['43.24 मीटर', 'हिंदुस्तान में कहीं से'] },
    tells: [
      {
        kind: 'number',
        explain: { en: '42.34 metres, not 43.24.', hi: '42.34 मीटर, 43.24 नहीं।' },
        ruleId: 'r-onair',
        sources: [{ id: 'usha-mehta-1969' }],
      },
    ],
  },

  {
    id: 'b42-flag-g',
    tier: 1,
    real: true,
    pair: 'flag',
    from: SLIP,
    to: ANN,
    text: {
      en: 'On 9 August, after the dawn arrests, Aruna Asaf Ali raised the Congress flag at Gowalia Tank Maidan.',
      hi: '9 अगस्त को, तड़के की गिरफ़्तारियों के बाद, अरुणा आसफ़ अली ने गोवालिया टैंक मैदान में कांग्रेस का झंडा फहराया।',
    },
    checks: { en: ['On 9 August', 'Aruna Asaf Ali', 'Gowalia Tank'], hi: ['9 अगस्त को', 'अरुणा आसफ़ अली', 'गोवालिया टैंक'] },
    why: {
      text: {
        en: 'Aruna Asaf Ali raised the flag there on 9 August 1942.',
        hi: '9 अगस्त 1942 को वहाँ झंडा अरुणा आसफ़ अली ने फहराया।',
      },
      sources: [{ id: 'rebel-india-1946', loc: 'Bombay section' }, { id: 'top-ii-1971', loc: 'No. 624 (dawn arrests only)' }],
    },
  },
  {
    id: 'b42-flag-f',
    tier: 1,
    real: false,
    pair: 'flag',
    from: SLIP,
    to: ANN,
    text: {
      en: 'On 9 August, after the dawn arrests, Sarojini Naidu raised the Congress flag at Gowalia Tank Maidan.',
      hi: '9 अगस्त को, तड़के की गिरफ़्तारियों के बाद, सरोजिनी नायडू ने गोवालिया टैंक मैदान में कांग्रेस का झंडा फहराया।',
    },
    checks: { en: ['On 9 August', 'Sarojini Naidu', 'Gowalia Tank'], hi: ['9 अगस्त को', 'सरोजिनी नायडू', 'गोवालिया टैंक'] },
    tells: [
      {
        kind: 'name',
        explain: { en: 'Aruna Asaf Ali raised the flag, not Sarojini Naidu.', hi: 'झंडा अरुणा आसफ़ अली ने फहराया, सरोजिनी नायडू ने नहीं।' },
        factId: 'f-flag',
        sources: [{ id: 'rebel-india-1946', loc: 'Bombay section' }],
      },
    ],
  },

  {
    id: 'b42-vote-g',
    tier: 1,
    real: true,
    pair: 'vote',
    from: SCRIPT,
    to: ANN,
    text: {
      en: 'On Saturday 8 August, at Gowalia Tank, the All-India Congress Committee passed the Quit India resolution. Only 13 voted against.',
      hi: 'शनिवार 8 अगस्त को गोवालिया टैंक में ऑल इंडिया कांग्रेस कमेटी ने ‘भारत छोड़ो’ प्रस्ताव पास किया। सिर्फ़ 13 ने विरोध किया।',
    },
    checks: { en: ['Saturday 8 August', 'Gowalia Tank', 'Only 13'], hi: ['शनिवार 8 अगस्त', 'गोवालिया टैंक', 'सिर्फ़ 13'] },
    why: {
      text: {
        en: 'Passed Saturday 8 August 1942, with “only 13 members” against.',
        hi: 'शनिवार 8 अगस्त 1942 को पास हुआ, “सिर्फ़ 13 सदस्य” विरोध में।',
      },
      sources: [{ id: 'iar-1942', loc: 'Chronicle p. 17; AICC proceedings' }],
    },
  },
  {
    id: 'b42-vote-f',
    tier: 1,
    real: false,
    pair: 'vote',
    from: SCRIPT,
    to: ANN,
    text: {
      en: 'On Saturday 8 August, at Gowalia Tank, the All-India Congress Committee passed the Quit India resolution. Only 31 voted against.',
      hi: 'शनिवार 8 अगस्त को गोवालिया टैंक में ऑल इंडिया कांग्रेस कमेटी ने ‘भारत छोड़ो’ प्रस्ताव पास किया। सिर्फ़ 31 ने विरोध किया।',
    },
    checks: { en: ['Saturday 8 August', 'Gowalia Tank', 'Only 31'], hi: ['शनिवार 8 अगस्त', 'गोवालिया टैंक', 'सिर्फ़ 31'] },
    tells: [
      {
        kind: 'number',
        explain: { en: 'Only 13 voted against, not 31.', hi: 'विरोध में सिर्फ़ 13 थे, 31 नहीं।' },
        factId: 'f-aicc',
        sources: [{ id: 'iar-1942', loc: 'Chronicle p. 17' }],
      },
    ],
  },

  {
    id: 'b42-zero-hour-g',
    tier: 1,
    real: true,
    pair: 'zero-hour',
    from: SLIP,
    to: ANN,
    text: {
      en: 'The police came at 5 o’clock on Sunday morning, 9 August, and took our leaders across Bombay at one stroke.',
      hi: 'पुलिस रविवार 9 अगस्त की सुबह 5 बजे आई और एक ही झटके में पूरे बंबई से हमारे नेताओं को उठा ले गई।',
    },
    checks: { en: ['5 o’clock', 'Sunday morning, 9 August'], hi: ['सुबह 5 बजे', 'रविवार 9 अगस्त'] },
    why: {
      text: {
        en: 'The Governor reported the arrests began at 5 a.m. on 9 August.',
        hi: 'गवर्नर के मुताबिक़ गिरफ़्तारियाँ 9 अगस्त सुबह 5 बजे शुरू हुईं।',
      },
      sources: [{ id: 'top-ii-1971', loc: 'No. 624, pp. 806–7' }],
    },
  },
  {
    id: 'b42-zero-hour-f',
    tier: 1,
    real: false,
    pair: 'zero-hour',
    from: SLIP,
    to: ANN,
    text: {
      en: 'The police came on Saturday night, 8 August, the moment the meeting ended, and took our leaders across Bombay at one stroke.',
      hi: 'पुलिस शनिवार 8 अगस्त की रात, बैठक ख़त्म होते ही आई और एक ही झटके में पूरे बंबई से हमारे नेताओं को उठा ले गई।',
    },
    checks: { en: ['Saturday night, 8 August', 'the moment the meeting ended'], hi: ['शनिवार 8 अगस्त की रात', 'बैठक ख़त्म होते ही'] },
    tells: [
      {
        kind: 'date',
        explain: { en: '5 a.m. on Sunday 9 August, not Saturday night.', hi: 'रविवार 9 अगस्त सुबह 5 बजे, शनिवार की रात नहीं।' },
        factId: 'f-zero-hour',
        sources: [{ id: 'top-ii-1971', loc: 'No. 624' }],
      },
    ],
  },

  {
    id: 'b42-detention-g',
    tier: 1,
    real: true,
    pair: 'detention',
    from: SLIP,
    to: ANN,
    text: {
      en: 'Gandhiji is held at the Aga Khan Palace in Poona. Nehru and the Working Committee are in Ahmednagar Fort.',
      hi: 'गांधीजी पूना के आग़ा ख़ान महल में बंद हैं। नेहरू और वर्किंग कमेटी अहमदनगर क़िले में हैं।',
    },
    checks: { en: ['Aga Khan Palace', 'Ahmednagar'], hi: ['आग़ा ख़ान महल', 'अहमदनगर क़िले'] },
    why: {
      text: {
        en: 'Gandhi at the Aga Khan Palace, Poona; Nehru and the Committee at Ahmednagar Fort.',
        hi: 'गांधी पूना के आग़ा ख़ान महल में, नेहरू और कमेटी अहमदनगर क़िले में।',
      },
      sources: [{ id: 'top-ii-1971', loc: 'Introduction p. xii; No. 553 (letter from Aga Khan’s Palace, 14 Aug 1942)' }],
    },
  },
  {
    id: 'b42-detention-f',
    tier: 1,
    real: false,
    pair: 'detention',
    from: SLIP,
    to: ANN,
    text: {
      en: 'Gandhiji is held in Yerwada jail in Poona. Nehru and the Working Committee are in Ahmednagar Fort.',
      hi: 'गांधीजी पूना की यरवदा जेल में बंद हैं। नेहरू और वर्किंग कमेटी अहमदनगर क़िले में हैं।',
    },
    checks: { en: ['Yerwada jail', 'Ahmednagar'], hi: ['यरवदा जेल', 'अहमदनगर क़िले'] },
    tells: [
      {
        kind: 'place',
        explain: { en: 'The Aga Khan Palace, not Yerwada jail. Same city, wrong building.', hi: 'आग़ा ख़ान महल, यरवदा जेल नहीं। शहर वही, इमारत ग़लत।' },
        factId: 'f-detention',
        sources: [{ id: 'top-ii-1971', loc: 'Introduction p. xii; No. 553 (letter from Aga Khan’s Palace, 14 Aug 1942)' }],
      },
    ],
  },

  // Day 5, Tue 3 Nov: the police list of sites has Paradise Bungalow from this date.
  {
    id: 'b42-d5-site-g',
    tier: 1,
    real: true,
    pair: 'd5-site',
    onDay: 5,
    from: COURIER,
    to: ANN,
    text: {
      en: 'Read, then burn. From today we also work from Paradise Bungalow, near Mahalaxmi Temple.',
      hi: 'पढ़कर जला दीजिए। आज से हम महालक्ष्मी मंदिर के पास पैराडाइज़ बंगले से भी काम करेंगे।',
    },
    checks: { en: ['Paradise Bungalow', 'near Mahalaxmi'], hi: ['पैराडाइज़ बंगले', 'महालक्ष्मी मंदिर के पास'] },
    why: {
      text: {
        en: 'The police list of the station’s sites: Paradise Bungalow, Mahalaxmi, from 3 November 1942.',
        hi: 'पुलिस की ठिकानों वाली सूची: 3 नवंबर 1942 से पैराडाइज़ बंगला, महालक्ष्मी।',
      },
      sources: [
        { id: 'huacuja-2023', loc: 'Fig. 4, police list of sites (from Sengupta and Chatterjee 1988)' },
        { id: 'chatterjee-1989' },
      ],
    },
  },
  {
    id: 'b42-d5-site-f',
    tier: 1,
    real: false,
    pair: 'd5-site',
    onDay: 5,
    from: COURIER,
    to: ANN,
    text: {
      en: 'Read, then burn. From today we also work from Paradise Bungalow, near Mumbadevi Temple.',
      hi: 'पढ़कर जला दीजिए। आज से हम मुंबादेवी मंदिर के पास पैराडाइज़ बंगले से भी काम करेंगे।',
    },
    checks: { en: ['Paradise Bungalow', 'near Mumbadevi Temple'], hi: ['पैराडाइज़ बंगले', 'मुंबादेवी मंदिर के पास'] },
    tells: [
      {
        kind: 'place',
        explain: { en: 'Paradise Bungalow is at Mahalaxmi, not near Mumbadevi.', hi: 'पैराडाइज़ बंगला महालक्ष्मी में है, मुंबादेवी के पास नहीं।' },
        factId: 'f-newsite',
        sources: [{ id: 'huacuja-2023', loc: 'Fig. 4, police list of sites' }],
      },
    ],
  },

  {
    id: 'b42-team-g',
    tier: 1,
    real: true,
    pair: 'team',
    from: COURIER,
    to: ANN,
    text: {
      en: 'Vithalbhai Jhaveri has made tonight’s two records in the recording room. Play them after the news.',
      hi: 'विट्ठलभाई झवेरी ने रिकॉर्डिंग वाले कमरे में आज रात के दो रिकॉर्ड बनाए हैं। ख़बरों के बाद इन्हें बजाइए।',
    },
    checks: { en: ['Vithalbhai Jhaveri', 'recording room'], hi: ['विट्ठलभाई झवेरी', 'रिकॉर्डिंग वाले कमरे'] },
    why: {
      text: {
        en: 'Vithalbhai Jhaveri ran recording; his handwriting was on the seized records.',
        hi: 'रिकॉर्डिंग विट्ठलभाई झवेरी देखते थे; ज़ब्त रिकॉर्डों पर उन्हीं की लिखावट थी।',
      },
      sources: [{ id: 'huacuja-2023', loc: 'trial' }, { id: 'chatterjee-1989' }, { id: 'usha-mehta-1969' }],
    },
  },
  {
    id: 'b42-team-f',
    tier: 1,
    real: false,
    pair: 'team',
    from: COURIER,
    to: ANN,
    text: {
      en: 'Vithalbhai Patel has made tonight’s two records in the recording room. Play them after the news.',
      hi: 'विट्ठलभाई पटेल ने रिकॉर्डिंग वाले कमरे में आज रात के दो रिकॉर्ड बनाए हैं। ख़बरों के बाद इन्हें बजाइए।',
    },
    checks: { en: ['Vithalbhai Patel', 'recording room'], hi: ['विट्ठलभाई पटेल', 'रिकॉर्डिंग वाले कमरे'] },
    tells: [
      {
        kind: 'name',
        explain: { en: 'Vithalbhai Jhaveri makes our records, not Vithalbhai Patel.', hi: 'हमारे रिकॉर्ड विट्ठलभाई झवेरी बनाते हैं, विट्ठलभाई पटेल नहीं।' },
        factId: 'f-team',
      },
    ],
  },

  // ───────────────────────── Tier 2: habits, form, rulebook ─────────────────────────

  {
    id: 'b42-voices-g',
    tier: 2,
    real: true,
    minMode: 'medium',
    pair: 'voices',
    from: REC,
    to: ANN,
    text: {
      en: 'Two records tonight: first the news in Hindustani, then an English talk read by Lohia.',
      hi: 'आज रात दो रिकॉर्ड: पहले हिंदुस्तानी में ख़बरें, फिर लोहिया का पढ़ा हुआ अंग्रेज़ी भाषण।',
    },
    checks: { en: ['read by Lohia'], hi: ['लोहिया का पढ़ा हुआ'] },
    why: {
      text: {
        en: 'Usha Mehta: most English speeches were read by Lohia and Coomi Dastur.',
        hi: 'उषा मेहता: ज़्यादातर अंग्रेज़ी भाषण लोहिया और कूमी दस्तूर पढ़ते थे।',
      },
      sources: [{ id: 'usha-mehta-1969' }],
    },
  },
  {
    id: 'b42-voices-f',
    tier: 2,
    real: false,
    minMode: 'medium',
    pair: 'voices',
    from: REC,
    to: ANN,
    text: {
      en: 'Two records tonight: first the news in Hindustani, then an English talk Nehru recorded for us this week.',
      hi: 'आज रात दो रिकॉर्ड: पहले हिंदुस्तानी में ख़बरें, फिर अंग्रेज़ी भाषण, जो नेहरू ने इसी हफ़्ते हमारे लिए रिकॉर्ड किया।',
    },
    checks: { en: ['Nehru recorded for us'], hi: ['नेहरू ने इसी हफ़्ते'] },
    tells: [
      {
        kind: 'name',
        explain: { en: 'Nehru is locked in Ahmednagar Fort; he recorded nothing for us.', hi: 'नेहरू अहमदनगर क़िले में बंद हैं; उन्होंने हमारे लिए कुछ रिकॉर्ड नहीं किया।' },
        factId: 'f-detention',
        sources: [{ id: 'top-ii-1971', loc: 'Introduction p. xii; No. 624' }],
      },
    ],
  },

  // Day 7, Thu 5 Nov: "a week prior" to the 12 November arrests, police raided the radio shops.
  {
    id: 'b42-d7-shops-g',
    tier: 2,
    real: true,
    pair: 'd7-shops',
    onDay: 7,
    from: COURIER,
    to: ANN,
    text: {
      en: 'Police have raided the radio shops, Chicago Radio among them, and arrested technicians. Send no one to buy parts.',
      hi: 'पुलिस ने रेडियो की दुकानों पर छापा मारा है, शिकागो रेडियो पर भी, और मिस्त्रियों को पकड़ लिया है। पुर्ज़े ख़रीदने किसी को मत भेजिए।',
    },
    checks: { en: ['Chicago Radio'], hi: ['शिकागो रेडियो'] },
    why: {
      text: {
        en: 'A week before the 12 November raid, police raided Chicago Radio and others.',
        hi: '12 नवंबर के छापे से एक हफ़्ता पहले पुलिस ने शिकागो रेडियो समेत दुकानों पर छापे मारे।',
      },
      sources: [{ id: 'usha-mehta-1969' }, { id: 'thakkar-2021', loc: 'Scroll excerpt' }],
    },
  },
  {
    id: 'b42-d7-shops-f',
    tier: 2,
    real: false,
    pair: 'd7-shops',
    onDay: 7,
    from: COURIER,
    to: ANN,
    text: {
      en: 'Police have raided the radio shops, Calcutta Radio among them, and arrested technicians. Send no one to buy parts.',
      hi: 'पुलिस ने रेडियो की दुकानों पर छापा मारा है, कलकत्ता रेडियो पर भी, और मिस्त्रियों को पकड़ लिया है। पुर्ज़े ख़रीदने किसी को मत भेजिए।',
    },
    checks: { en: ['Calcutta Radio'], hi: ['कलकत्ता रेडियो'] },
    tells: [
      {
        kind: 'name',
        explain: { en: 'Our parts come from Chicago Radio, not Calcutta Radio.', hi: 'हमारे पुर्ज़े शिकागो रेडियो से आते हैं, कलकत्ता रेडियो से नहीं।' },
        factId: 'f-team',
        sources: [{ id: 'usha-mehta-1969' }],
      },
    ],
  },

  // Day 8, Fri 6 Nov: Gandhi's letter of 5 November from the Aga Khan Palace ("Detention Camp")
  // on the death of Peter Wood, son of Lord Halifax (Viceroy Irwin of 1929).
  {
    id: 'b42-d8-letter-g',
    tier: 3,
    real: true,
    pair: 'd8-letter',
    onDay: 8,
    from: { en: 'Letter copy, from Poona', hi: 'ख़त की नक़ल, पूना से' },
    to: ANN,
    text: {
      en: 'Gandhiji to the Viceroy, from the Aga Khan Palace, 5 November, on Halifax’s son: “I have just read about the sad but heroic death of Hon’ble Peter Wood in action.”',
      hi: 'गांधीजी का वायसराय को ख़त, आग़ा ख़ान महल से, 5 नवंबर, लॉर्ड हैलिफ़ैक्स के बेटे पर: “मैंने अभी माननीय पीटर वुड की लड़ाई में दुखभरी पर बहादुर मौत के बारे में पढ़ा।”',
    },
    checks: { en: ['from the Aga Khan Palace'], hi: ['आग़ा ख़ान महल से'] },
    document: { sources: [{ id: 'cwmg-76', loc: 'No. 442, pp. 416–17' }] },
    why: {
      text: {
        en: 'Real letter from the Aga Khan Palace, headed “Detention Camp”; private then, published later.',
        hi: 'असली ख़त, आग़ा ख़ान महल से, ऊपर “नज़रबंदी कैंप” लिखा; तब निजी था, बाद में छपा।',
      },
      sources: [{ id: 'cwmg-76', loc: 'No. 442, pp. 416–17 (from TOP III, p. 209)' }, { id: 'mkgandhi-agakhan' }],
    },
  },
  {
    id: 'b42-d8-letter-f',
    tier: 2,
    real: false,
    pair: 'd8-letter',
    onDay: 8,
    from: { en: 'Letter copy, from Poona', hi: 'ख़त की नक़ल, पूना से' },
    to: ANN,
    text: {
      en: 'Gandhiji to the Viceroy, from Ahmednagar Fort, 5 November, on Halifax’s son: “I have just read about the sad but heroic death of Hon’ble Peter Wood in action.”',
      hi: 'गांधीजी का वायसराय को ख़त, अहमदनगर क़िले से, 5 नवंबर, लॉर्ड हैलिफ़ैक्स के बेटे पर: “मैंने अभी माननीय पीटर वुड की लड़ाई में दुखभरी पर बहादुर मौत के बारे में पढ़ा।”',
    },
    checks: { en: ['from Ahmednagar Fort'], hi: ['अहमदनगर क़िले से'] },
    tells: [
      {
        kind: 'place',
        explain: { en: 'Gandhiji is held at the Aga Khan Palace; Ahmednagar Fort holds Nehru.', hi: 'गांधीजी आग़ा ख़ान महल में बंद हैं; अहमदनगर क़िले में नेहरू हैं।' },
        factId: 'f-detention',
        sources: [{ id: 'cwmg-76', loc: 'No. 442' }, { id: 'top-ii-1971', loc: 'Introduction p. xii' }],
      },
    ],
  },

  {
    id: 'b42-opening2-g',
    tier: 2,
    real: true,
    pair: 'opening2',
    from: OLD,
    to: ANN,
    text: {
      en: 'This is Congress Radio calling from 42.34. … The entire world is aware that a ban has been laid on the publication of news nowadays.',
      hi: 'यह कांग्रेस रेडियो है, 42.34 से बोल रहा है। … पूरी दुनिया जानती है कि आजकल ख़बरें छापने पर पाबंदी लगी है।',
    },
    checks: { en: ['calling from 42.34'], hi: ['42.34 से बोल रहा है'] },
    document: { sources: [{ id: 'chatterjee-1989', loc: 'police transcript of 20 Oct 1942' }] },
    why: {
      text: {
        en: 'Real words, 20 October 1942. The ban: the government’s press order of 8 August.',
        hi: 'असली शब्द, 20 अक्टूबर 1942। पाबंदी: 8 अगस्त का सरकारी हुक्म।',
      },
      sources: [
        { id: 'chatterjee-1989', loc: 'police transcript of 20 Oct 1942' },
        { id: 'iar-1942', loc: 'late-August chronicle (press order)' },
      ],
    },
  },
  {
    id: 'b42-opening2-f',
    tier: 2,
    real: false,
    pair: 'opening2',
    from: OLD,
    to: ANN,
    text: {
      en: 'This is Congress Radio calling from Bombay, on 42.34. … The entire world is aware that a ban has been laid on the publication of news nowadays.',
      hi: 'यह कांग्रेस रेडियो है, बंबई से, 42.34 पर बोल रहा है। … पूरी दुनिया जानती है कि आजकल ख़बरें छापने पर पाबंदी लगी है।',
    },
    checks: { en: ['calling from Bombay'], hi: ['बंबई से'] },
    tells: [
      {
        kind: 'form',
        explain: { en: '“Somewhere in India”, not Bombay. We never say where we are.', hi: '“हिंदुस्तान में कहीं से”, बंबई नहीं। हम कभी नहीं बताते कि कहाँ हैं।' },
        ruleId: 'r-onair',
        sources: [{ id: 'usha-mehta-1969' }, { id: 'huacuja-2023', loc: 'n. 90 (transcript of 12 Nov 1942 morning)' }],
      },
    ],
  },


  {
    id: 'b42-gandhiji-g',
    tier: 2,
    real: true,
    pair: 'gandhiji',
    from: LEAFLET,
    to: ANN,
    text: {
      en: 'Gandhiji’s last message: Every man is free to go to the fullest length under Ahimsa… Satyagrahis should go out to die and not to live… Karenge Ya Marenge.',
      hi: 'गांधीजी का आख़िरी संदेश: अहिंसा के रास्ते पर हर आदमी पूरी हद तक जाने को आज़ाद है… सत्याग्रही मरने के लिए निकलें, जीने के लिए नहीं… करेंगे या मरेंगे।',
    },
    checks: { en: ['Gandhiji’s'], hi: ['गांधीजी का'] },
    document: { sources: [{ id: 'goi-1943', loc: 'App. X' }] },
    why: {
      text: {
        en: 'Gandhiji’s last message, left at his arrest. The government printed it in 1943.',
        hi: 'गांधीजी का आख़िरी संदेश, गिरफ़्तारी के वक़्त छोड़ा। सरकार ने इसे 1943 में छापा।',
      },
      sources: [{ id: 'goi-1943', loc: 'App. X' }],
    },
  },
  {
    id: 'b42-gandhiji-f',
    tier: 2,
    real: false,
    pair: 'gandhiji',
    from: LEAFLET,
    to: ANN,
    text: {
      en: 'Mr. Gandhi’s last message, left at his arrest: keep the disturbances within the law… and wait at home.',
      hi: 'मिस्टर गांधी का आख़िरी संदेश, जो वे गिरफ़्तारी के वक़्त छोड़ गए: गड़बड़ियों को क़ानून के अंदर रखो… और घर बैठो।',
    },
    checks: { en: ['Mr. Gandhi’s'], hi: ['मिस्टर गांधी का'] },
    tells: [
      {
        kind: 'habit',
        explain: { en: 'Gandhiji, not “Mr. Gandhi”; “the disturbances” is government talk too.', hi: 'गांधीजी, “मिस्टर गांधी” नहीं; “गड़बड़ियाँ” भी सरकारी भाषा है।' },
        ruleId: 'r-words',
        sources: [{ id: 'goi-1943', loc: 'App. X' }],
      },
    ],
  },

  {
    id: 'b42-lohia-g',
    tier: 2,
    real: true,
    pair: 'lohia',
    from: REC,
    to: ANN,
    text: {
      en: 'Play Lohia’s talk, but never say his name on air. It says: “So far we were conducting movements but now we are conducting a revolution.”',
      hi: 'लोहिया का भाषण बजाइए, पर रेडियो पर उनका नाम कभी मत लीजिए। भाषण में आता है: “अब तक हम आंदोलन चला रहे थे, पर अब हम क्रांति चला रहे हैं।”',
    },
    checks: { en: ['never say his name on air'], hi: ['उनका नाम कभी मत लीजिए'] },
    why: {
      text: {
        en: 'Lohia’s words as Usha Mehta recalled them. On air, no names.',
        hi: 'लोहिया के शब्द, जैसे उषा मेहता को याद थे। रेडियो पर नाम नहीं।',
      },
      sources: [{ id: 'usha-mehta-1969' }, { id: 'huacuja-2023', loc: 'n. 90 (transcript of 12 Nov 1942 morning)' }],
    },
  },
  {
    id: 'b42-lohia-f',
    tier: 2,
    real: false,
    pair: 'lohia',
    from: REC,
    to: ANN,
    text: {
      en: 'Play Lohia’s talk, and first tell listeners: “Now hear Dr Lohia, who recorded this tonight in this very building.”',
      hi: 'लोहिया का भाषण बजाइए, और पहले सुनने वालों से कहिए: “अब सुनिए डॉ. लोहिया को, जिन्होंने आज रात इसी इमारत में यह रिकॉर्ड किया।”',
    },
    checks: { en: ['Now hear Dr Lohia'], hi: ['अब सुनिए डॉ. लोहिया को'] },
    tells: [
      {
        kind: 'form',
        explain: { en: 'On air we never name our people, or say where they are.', hi: 'रेडियो पर हम अपने लोगों का नाम या ठिकाना कभी नहीं बताते।' },
        ruleId: 'r-nonames',
        sources: [{ id: 'huacuja-2023', loc: 'n. 90 (transcript of 12 Nov 1942 morning)' }, { id: 'usha-mehta-1969' }],
      },
    ],
  },

  {
    id: 'b42-confirm-g',
    tier: 2,
    real: true,
    pair: 'confirm',
    from: SLIP,
    to: ANN,
    text: {
      en: 'A report says soldiers were shot in a camp up north. Only one messenger, no second source. Hold it until confirmed.',
      hi: 'ख़बर है कि उत्तर की किसी छावनी में सिपाहियों को गोली मारी गई। बस एक हरकारा, कोई दूसरा गवाह नहीं। पक्की होने तक इसे रोकिए।',
    },
    checks: { en: ['Only one messenger', 'Hold it until confirmed'], hi: ['बस एक हरकारा', 'पक्की होने तक इसे रोकिए'] },
    verify: { 'Only one messenger': 'rule:r-confirm', 'Hold it until confirmed': 'rule:r-confirm' },
    why: {
      text: {
        en: 'The station held its Meerut story a month, “as it was not confirmed”.',
        hi: 'स्टेशन ने मेरठ की ख़बर महीने भर रोकी, “क्योंकि वह पक्की नहीं थी”।',
      },
      sources: [{ id: 'chatterjee-1989', loc: 'police transcript of 26 Oct 1942' }],
    },
  },
  {
    id: 'b42-confirm-f',
    tier: 2,
    real: false,
    pair: 'confirm',
    from: SLIP,
    to: ANN,
    text: {
      en: 'No time to check this one. Put it on air tonight: the Indian troops in Poona have joined the people.',
      hi: 'इसे जाँचने का वक़्त नहीं। आज रात रेडियो पर बोल दीजिए: पूना के हिंदुस्तानी सिपाही जनता से मिल गए हैं।',
    },
    checks: { en: ['No time to check', 'troops in Poona'], hi: ['जाँचने का वक़्त नहीं', 'पूना के हिंदुस्तानी सिपाही'] },
    tells: [
      {
        kind: 'habit',
        explain: { en: 'Unconfirmed news is held back, not rushed on air.', hi: 'कच्ची ख़बर रोकी जाती है, जल्दी में सुनाई नहीं जाती।' },
        ruleId: 'r-confirm',
        sources: [{ id: 'chatterjee-1989', loc: 'police transcript of 26 Oct 1942' }],
      },
    ],
  },

  // Where the news came from: the Congress office in Bombay, run underground by Sucheta Kripalani.

  {
    id: 'b42-songs-g',
    tier: 2,
    real: true,
    pair: 'songs',
    from: SCRIPT,
    to: ANN,
    text: {
      en: 'Tonight’s order: “Sare Jahan Se Achcha”, the news in Hindustani, one talk, and “Vande Mataram” to close.',
      hi: 'आज रात का क्रम: “सारे जहाँ से अच्छा”, हिंदुस्तानी में ख़बरें, एक भाषण, और आख़िर में “वंदे मातरम्”।',
    },
    checks: { en: ['Sare Jahan Se Achcha', 'Vande Mataram'], hi: ['सारे जहाँ से अच्छा', 'वंदे मातरम्'] },
    why: {
      text: {
        en: 'The station always opened with Sare Jahan Se Achcha and closed with Vande Mataram.',
        hi: 'स्टेशन हमेशा “सारे जहाँ से अच्छा” से शुरू और “वंदे मातरम्” पर ख़त्म होता था।',
      },
      sources: [{ id: 'usha-mehta-1969', loc: 'programme; 12 Nov 1942' }, { id: 'huacuja-2023', loc: 'opening song' }],
    },
  },
  {
    id: 'b42-songs-f',
    tier: 2,
    real: false,
    pair: 'songs',
    from: SCRIPT,
    to: ANN,
    text: {
      en: 'Tonight’s order: “Vande Mataram”, the news in Hindustani, one talk, and “Sare Jahan Se Achcha” to close.',
      hi: 'आज रात का क्रम: “वंदे मातरम्”, हिंदुस्तानी में ख़बरें, एक भाषण, और आख़िर में “सारे जहाँ से अच्छा”।',
    },
    checks: { en: ['Vande Mataram', 'Sare Jahan Se Achcha'], hi: ['वंदे मातरम्', 'सारे जहाँ से अच्छा'] },
    tells: [
      {
        kind: 'form',
        explain: { en: 'Sare Jahan Se Achcha opens and Vande Mataram closes, not the other way round.', hi: '“सारे जहाँ से अच्छा” से शुरू, “वंदे मातरम्” पर ख़त्म; उलटा नहीं।' },
        ruleId: 'r-songs',
        sources: [{ id: 'usha-mehta-1969', loc: 'programme' }, { id: 'huacuja-2023', loc: 'opening song' }],
      },
    ],
  },

  {
    id: 'b42-discs-g',
    tier: 2,
    real: true,
    pair: 'discs',
    from: COURIER,
    to: ANN,
    text: {
      en: 'Two new records tonight. The old ones are worn out: a record lasts only eight or ten plays.',
      hi: 'आज रात दो नए रिकॉर्ड। पुराने घिस गए हैं; एक रिकॉर्ड बस 8 या 10 बार चलता है।',
    },
    checks: { en: ['eight or ten plays'], hi: ['8 या 10 बार'] },
    verify: { 'eight or ten plays': 'rule:r-records' },
    why: {
      text: {
        en: 'Abbas: a record “could be played, I think, eight or ten times”.',
        hi: 'अब्बास: एक रिकॉर्ड “शायद 8 या 10 बार” बज सकता था।',
      },
      sources: [{ id: 'abbas-ccas' }, { id: 'usha-mehta-1969' }],
    },
  },
  {
    id: 'b42-discs-f',
    tier: 2,
    real: false,
    pair: 'discs',
    from: COURIER,
    to: ANN,
    text: {
      en: 'Tonight’s talk comes on a tape. Put it on the tape recorder before 8:45.',
      hi: 'आज रात का भाषण टेप पर है। 8:45 से पहले उसे टेप रिकॉर्डर पर चढ़ा दीजिए।',
    },
    checks: { en: ['on a tape'], hi: ['टेप पर है'] },
    tells: [
      {
        kind: 'anachronism',
        explain: { en: 'Gramophone records, not tape: we had no tape recorder.', hi: 'ग्रामोफ़ोन रिकॉर्ड, टेप नहीं; हमारे पास टेप रिकॉर्डर नहीं था।' },
        ruleId: 'r-records',
        sources: [{ id: 'abbas-ccas' }],
      },
    ],
  },

  {
    id: 'b42-axis-g',
    tier: 2,
    real: true,
    pair: 'axis',
    from: SCRIPT,
    to: ANN,
    text: {
      en: 'Say it plainly before “Vande Mataram”: India has no enmity for the British or any other people.',
      hi: '“वंदे मातरम्” से पहले साफ़ कहिए: भारत की अंग्रेज़ों से या किसी और से कोई दुश्मनी नहीं है।',
    },
    checks: { en: ['Vande Mataram', 'no enmity for the British'], hi: ['वंदे मातरम्', 'कोई दुश्मनी नहीं'] },
    verify: { 'no enmity for the British': 'rule:r-axis' },
    why: {
      text: {
        en: 'Usha Mehta recalled these words; the judge found no pro-Axis line.',
        hi: 'उषा मेहता को ये शब्द याद थे; जज ने भी माना कि जर्मनी-जापान का साथ नहीं दिया।',
      },
      sources: [{ id: 'usha-mehta-1969' }, { id: 'huacuja-2023', loc: 'judgment' }],
    },
  },
  {
    id: 'b42-axis-f',
    tier: 2,
    real: false,
    pair: 'axis',
    from: SCRIPT,
    to: ANN,
    text: {
      en: 'Tell listeners tonight: the Japanese army is India’s friend. Welcome it when it reaches Bengal.',
      hi: 'आज रात कहिए: जापानी फ़ौज हिंदुस्तान की दोस्त है। बंगाल पहुँचे तो उसका स्वागत कीजिए।',
    },
    checks: { en: ['Japanese army is India’s friend', 'reaches Bengal'], hi: ['जापानी फ़ौज हिंदुस्तान की दोस्त', 'बंगाल पहुँचे'] },
    tells: [
      {
        kind: 'habit',
        explain: { en: 'We never speak for Japan; that would brand us a fifth column.', hi: 'हम जापान की तरफ़ से कभी नहीं बोलते; इससे हम दुश्मन के साथी कहलाते।' },
        ruleId: 'r-axis',
        sources: [{ id: 'huacuja-2023', loc: 'judgment; Iyengar testimony' }],
      },
    ],
  },

  {
    id: 'b42-train-g',
    tier: 2,
    real: true,
    pair: 'train',
    from: SLIP,
    to: ANN,
    text: {
      en: 'The special train left Bombay at 7:15 am on Sunday 9 August. Gandhiji and those with him were taken off at Chinchwad, short of Poona.',
      hi: 'ख़ास ट्रेन रविवार 9 अगस्त को सुबह 7:15 पर बंबई से चली। गांधीजी और उनके साथी पूना से पहले चिंचवड़ में उतारे गए।',
    },
    checks: { en: ['Sunday 9 August', 'taken off at Chinchwad'], hi: ['रविवार 9 अगस्त', 'चिंचवड़ में उतारे गए'] },
    why: {
      text: {
        en: 'They alighted at “Chinchwad, a small station short of Poona”, said the Governor.',
        hi: 'गवर्नर के मुताबिक़ वे “पूना से थोड़ा पहले, चिंचवड़ के छोटे स्टेशन” पर उतरे।',
      },
      sources: [{ id: 'top-ii-1971', loc: 'No. 624, p. 807; Introduction p. xii' }],
    },
  },
  {
    id: 'b42-train-f',
    tier: 2,
    real: false,
    pair: 'train',
    from: SLIP,
    to: ANN,
    text: {
      en: 'The special train left Bombay at 7:15 am on Sunday 9 August. Gandhiji and those with him were taken off at Kalyan.',
      hi: 'ख़ास ट्रेन रविवार 9 अगस्त को सुबह 7:15 पर बंबई से चली। गांधीजी और उनके साथी कल्याण में उतारे गए।',
    },
    checks: { en: ['Sunday 9 August', 'taken off at Kalyan'], hi: ['रविवार 9 अगस्त', 'कल्याण में उतारे गए'] },
    tells: [
      {
        kind: 'place',
        explain: { en: 'Chinchwad, short of Poona, not Kalyan, barely out of Bombay.', hi: 'चिंचवड़, पूना से पहले; कल्याण नहीं, जो बंबई से निकलते ही आता है।' },
        factId: 'f-train',
        sources: [{ id: 'top-ii-1971', loc: 'No. 624, p. 807' }],
      },
    ],
  },

  // Day 11, Mon 9 Nov: three months to the day since the arrests of 9 August.
  {
    id: 'b42-d11-months-g',
    tier: 2,
    real: true,
    pair: 'd11-months',
    onDay: 11,
    from: SCRIPT,
    to: ANN,
    text: {
      en: 'Three months today since 9 August. Our leaders are still in jail, and we are still on air.',
      hi: '9 अगस्त को आज तीन महीने पूरे हुए। हमारे नेता अब भी जेल में हैं, और हम अब भी रेडियो पर बोल रहे हैं।',
    },
    checks: { en: ['Three months today', 'since 9 August'], hi: ['आज तीन महीने', '9 अगस्त को'] },
    verify: { 'Three months today': 'fact:f-zero-hour' },
    why: {
      text: {
        en: 'Monday 9 November 1942: three months since the arrests of 9 August.',
        hi: 'सोमवार 9 नवंबर 1942: 9 अगस्त की गिरफ़्तारियों को तीन महीने।',
      },
      sources: [{ id: 'calendar-1942' }, { id: 'top-ii-1971', loc: 'No. 624' }],
    },
  },
  {
    id: 'b42-d11-months-f',
    tier: 2,
    real: false,
    pair: 'd11-months',
    onDay: 11,
    from: SCRIPT,
    to: ANN,
    text: {
      en: 'Three months today since 8 August, when they took our leaders. We are still on air.',
      hi: '8 अगस्त को आज तीन महीने पूरे हुए, जब वे हमारे नेताओं को ले गए। हम अब भी रेडियो पर बोल रहे हैं।',
    },
    checks: { en: ['Three months today', 'since 8 August'], hi: ['आज तीन महीने', '8 अगस्त को'] },
    verify: { 'Three months today': 'fact:f-zero-hour' },
    tells: [
      {
        kind: 'date',
        explain: { en: 'The leaders were taken on 9 August, not 8 August.', hi: 'नेता 9 अगस्त को पकड़े गए, 8 अगस्त को नहीं।' },
        factId: 'f-zero-hour',
        sources: [{ id: 'top-ii-1971', loc: 'No. 624' }],
      },
    ],
  },

  // Day 14, Thu 12 Nov: the morning broadcast, then the raid on Babubhai Khakhar's office.
  {
    id: 'b42-d14-voices-g',
    tier: 2,
    real: true,
    pair: 'd14-voices',
    onDay: 14,
    from: MORNING,
    to: ANN_AM,
    text: {
      en: 'Let the whole country resound with a million voices… the Congress Radio calling. … Never talk of the persons behind the stations.',
      hi: 'पूरा देश दस लाख आवाज़ों से गूँज उठे… कांग्रेस रेडियो बोल रहा है। … स्टेशनों के पीछे के लोगों की बात कभी मत कीजिए।',
    },
    checks: { en: ['Never talk of the persons behind the stations'], hi: ['पीछे के लोगों की बात कभी मत कीजिए'] },
    document: { sources: [{ id: 'huacuja-2023', loc: 'nn. 90, 129 (transcript of 12 Nov 1942 morning, from Thakkar p. 137)' }] },
    why: {
      text: {
        en: 'Real words from the morning of 12 November 1942, the day of the raid.',
        hi: 'असली शब्द, 12 नवंबर 1942 की सुबह के; उसी दिन छापा पड़ा।',
      },
      sources: [{ id: 'huacuja-2023', loc: 'nn. 90, 129 (transcript of 12 Nov 1942 morning, from Thakkar p. 137)' }],
    },
  },
  {
    id: 'b42-d14-voices-f',
    tier: 2,
    real: false,
    pair: 'd14-voices',
    onDay: 14,
    from: MORNING,
    to: ANN_AM,
    text: {
      en: 'Let the whole country resound with a million voices… This morning Babubhai Khakhar and Vithalbhai Jhaveri, who run this station, thank every listener.',
      hi: 'पूरा देश दस लाख आवाज़ों से गूँज उठे… आज सुबह इस स्टेशन को चलाने वाले बाबूभाई खाखर और विट्ठलभाई झवेरी हर सुनने वाले का शुक्रिया करते हैं।',
    },
    checks: { en: ['Babubhai Khakhar and Vithalbhai Jhaveri'], hi: ['बाबूभाई खाखर और विट्ठलभाई झवेरी'] },
    tells: [
      {
        kind: 'form',
        explain: { en: 'Never name our people on air, least of all who runs the station.', hi: 'रेडियो पर अपने लोगों के नाम कभी नहीं, स्टेशन चलाने वालों के तो बिल्कुल नहीं।' },
        ruleId: 'r-nonames',
        sources: [{ id: 'huacuja-2023', loc: 'n. 90 (transcript of 12 Nov 1942 morning)' }],
      },
    ],
  },
  {
    id: 'b42-d14-work-g',
    tier: 2,
    real: true,
    onDay: 14,
    from: REC,
    to: ANN,
    text: {
      en: 'Police raided our organisers’ office today. Lohia’s answer: “The fight for freedom cannot stop. The work must go on…”',
      hi: 'आज पुलिस ने हमारे संगठन वालों के दफ़्तर पर छापा मारा। लोहिया का जवाब: “आज़ादी की लड़ाई रुक नहीं सकती। काम चलते रहना चाहिए…”',
    },
    checks: { en: ['Lohia’s answer'], hi: ['लोहिया का जवाब'] },
    why: {
      text: {
        en: 'Usha Mehta: after police raided Babubhai’s office on 12 November, Lohia said this.',
        hi: 'उषा मेहता: 12 नवंबर को बाबूभाई के दफ़्तर पर छापे के बाद लोहिया ने यही कहा।',
      },
      sources: [{ id: 'usha-mehta-1969', loc: '12 Nov 1942: raid on Khakhar’s office; Lohia’s reply' }],
    },
  },

  // ───────────────────────── Tier 3: knowledge tells, and genuine ones that look wrong ─────────────────────────



  // Day 12, Tue 10 Nov: JP escaped from Hazaribagh Jail in early November.

  // Day 13, Wed 11 Nov: Churchill spoke at the Mansion House, London, on 10 November.
  {
    id: 'b42-d13-churchill-g',
    tier: 3,
    real: true,
    pair: 'd13-churchill',
    onDay: 13,
    from: SLIP,
    to: ANN,
    text: {
      en: 'News from London: yesterday Churchill said, “I have not become the King’s First Minister in order to preside over the liquidation of the British Empire.”',
      hi: 'लंदन से ख़बर: कल चर्चिल ने कहा, “मैं बादशाह का प्रधानमंत्री इसलिए नहीं बना हूँ कि ब्रिटिश साम्राज्य को ख़त्म करवाऊँ।”',
    },
    checks: { en: ['Churchill said', 'the King’s First Minister'], hi: ['चर्चिल ने कहा', 'बादशाह का प्रधानमंत्री'] },
    verify: { 'the King’s First Minister': 'fact:f-chiefs' },
    why: {
      text: {
        en: 'Churchill said it at the Mansion House, London, on 10 November 1942.',
        hi: 'चर्चिल ने यह 10 नवंबर 1942 को लंदन के मैंशन हाउस में कहा।',
      },
      sources: [{ id: 'churchill-1942' }],
    },
  },
  {
    id: 'b42-d13-churchill-f',
    tier: 3,
    real: false,
    pair: 'd13-churchill',
    onDay: 13,
    from: SLIP,
    to: ANN,
    text: {
      en: 'News from Delhi: yesterday the Viceroy, Lord Linlithgow, said, “I have not become the King’s First Minister in order to preside over the liquidation of the British Empire.”',
      hi: 'दिल्ली से ख़बर: कल वायसराय लॉर्ड लिनलिथगो ने कहा, “मैं बादशाह का प्रधानमंत्री इसलिए नहीं बना हूँ कि ब्रिटिश साम्राज्य को ख़त्म करवाऊँ।”',
    },
    checks: { en: ['the Viceroy, Lord Linlithgow', 'the King’s First Minister'], hi: ['वायसराय लॉर्ड लिनलिथगो', 'बादशाह का प्रधानमंत्री'] },
    verify: { 'the King’s First Minister': 'fact:f-chiefs' },
    tells: [
      {
        kind: 'knowledge',
        explain: { en: 'Churchill said it in London; the Viceroy is not the King’s First Minister.', hi: 'यह चर्चिल ने लंदन में कहा; वायसराय बादशाह का प्रधानमंत्री नहीं है।' },
        factId: 'f-chiefs',
        sources: [{ id: 'churchill-1942' }],
      },
    ],
  },


  {
    id: 'b42-tamluk-g',
    tier: 3,
    real: true,
    pair: 'tamluk',
    from: { en: 'News slip, from Bengal', hi: 'ख़बर की पर्ची, बंगाल से' },
    to: ANN,
    text: {
      en: 'Remember Matangini Hazra of Tamluk, shot leading a procession on 29 September. She was 73.',
      hi: 'तमलुक की मातंगिनी हाज़रा को याद कीजिए। 29 सितंबर को जुलूस के आगे चलते हुए उन्हें गोली मारी गई। वे 73 साल की थीं।',
    },
    checks: { en: ['Matangini Hazra', '29 September', 'She was 73'], hi: ['मातंगिनी हाज़रा', '29 सितंबर', '73 साल'] },
    why: {
      text: {
        en: 'Matangini Hazra, 73, was shot at Tamluk on 29 September 1942.',
        hi: '73 साल की मातंगिनी हाज़रा को 29 सितंबर 1942 को तमलुक में गोली मारी गई।',
      },
      sources: [{ id: 'samanta-1946', loc: 'Tamluk sections' }],
    },
  },
  {
    id: 'b42-tamluk-f',
    tier: 3,
    real: false,
    pair: 'tamluk',
    from: { en: 'News slip, from Bengal', hi: 'ख़बर की पर्ची, बंगाल से' },
    to: ANN,
    text: {
      en: 'Remember Matangini Hazra of Tamluk, shot leading a procession on 29 September. She was 37.',
      hi: 'तमलुक की मातंगिनी हाज़रा को याद कीजिए। 29 सितंबर को जुलूस के आगे चलते हुए उन्हें गोली मारी गई। वे 37 साल की थीं।',
    },
    checks: { en: ['Matangini Hazra', '29 September', 'She was 37'], hi: ['मातंगिनी हाज़रा', '29 सितंबर', '37 साल'] },
    tells: [
      {
        kind: 'number',
        explain: { en: 'She was 73, not 37.', hi: 'वे 73 साल की थीं, 37 की नहीं।' },
        factId: 'f-uprising',
        sources: [{ id: 'samanta-1946', loc: 'Tamluk sections' }],
      },
    ],
  },

  // Myth (people-and-moments §3C #7): "the government admitted 10,000 dead".

  // Netaji, as knowledge the desk has, never as relayed content (r-axis) and never as the forger.
  {
    id: 'b42-netaji-g',
    tier: 2,
    real: true,
    pair: 'netaji',
    from: NEWSDESK,
    to: ANN,
    text: {
      en: 'Listeners keep asking: is this Netaji’s radio? No. Subhas Bose speaks from Germany, on Azad Hind Radio; we speak from inside India.',
      hi: 'सुनने वाले बार-बार पूछते हैं: क्या यह नेताजी का रेडियो है? नहीं। सुभाष बोस जर्मनी से, आज़ाद हिंद रेडियो पर बोलते हैं; हम हिंदुस्तान के अंदर से बोलते हैं।',
    },
    checks: { en: ['Subhas Bose', 'speaks from Germany', 'Azad Hind Radio'], hi: ['सुभाष बोस', 'जर्मनी से', 'आज़ाद हिंद रेडियो'] },
    why: {
      text: {
        en: 'True: in 1942 Bose broadcast from Germany, and listeners sometimes mixed up the stations.',
        hi: 'सच: 1942 में बोस जर्मनी से बोलते थे, और लोग कभी-कभी दोनों रेडियो को एक समझ लेते थे।',
      },
      sources: [
        { id: 'huacuja-2023', loc: 'p. 1630 (text at n. 65); p. 1639 (text at n. 110)' },
        { id: 'abbas-ccas', loc: 'listeners took Congress Radio for a station abroad' },
      ],
    },
  },
  {
    id: 'b42-netaji-f',
    tier: 3,
    real: false,
    pair: 'netaji',
    from: NEWSDESK,
    to: ANN,
    text: {
      en: 'Listeners keep asking: is this Netaji’s radio? No. Subhas Bose speaks from Singapore, on Azad Hind Radio; we speak from inside India.',
      hi: 'सुनने वाले बार-बार पूछते हैं: क्या यह नेताजी का रेडियो है? नहीं। सुभाष बोस सिंगापुर से, आज़ाद हिंद रेडियो पर बोलते हैं; हम हिंदुस्तान के अंदर से बोलते हैं।',
    },
    checks: { en: ['Subhas Bose', 'speaks from Singapore', 'Azad Hind Radio'], hi: ['सुभाष बोस', 'सिंगापुर से', 'आज़ाद हिंद रेडियो'] },
    tells: [
      {
        kind: 'knowledge',
        explain: { en: 'He was in Germany in 1942; he reached Singapore only on 2 July 1943.', hi: '1942 में वे जर्मनी में थे; सिंगापुर वे 2 जुलाई 1943 को पहुँचे।' },
        factId: 'f-netaji',
        sources: [{ id: 'bipan-chandra-1989', loc: 'ch. 35, p. 477' }, { id: 'huacuja-2023', loc: 'p. 1630 (text at n. 65)' }],
      },
    ],
  },

  // Myth (people-and-moments §3C #10): Nehru's book was written in the fort, but in 1944.



  // ───────────────────────── Medium (minMode 'medium'): the case file grows ─────────────────────────
  // Caught by the Medium facts (f-palace, f-mahadev, f-fort, f-khakhar, f-underground, f-voices,
  // f-parekh, f-ballia) or by the rulebook.

  {
    id: 'b42-m-mahadev-g',
    tier: 1,
    real: true,
    pair: 'm-mahadev',
    minMode: 'medium',
    from: SLIP,
    to: ANN,
    text: {
      en: 'Remember Mahadev Desai, who died at the Aga Khan Palace on 15 August. Gandhiji wired: “Mahadev has died yogi’s and patriot’s death.”',
      hi: 'महादेव देसाई को याद कीजिए, जो 15 अगस्त को आग़ा ख़ान महल में गुज़र गए। गांधीजी ने तार भेजा: “महादेव ने योगी और देशभक्त की मौत पाई है।”',
    },
    checks: { en: ['Mahadev Desai', 'on 15 August', 'Aga Khan Palace'], hi: ['महादेव देसाई', '15 अगस्त', 'आग़ा ख़ान महल'] },
    document: { sources: [{ id: 'cwmg-76-vol', loc: 'No. 435, telegram to Chimanlal N. Shah, 15-8-1942, p. 410' }] },
    why: {
      text: {
        en: 'Real telegram: Mahadev Desai died at the Aga Khan Palace on 15 August 1942.',
        hi: 'असली तार: महादेव देसाई 15 अगस्त 1942 को आग़ा ख़ान महल में गुज़रे।',
      },
      sources: [{ id: 'cwmg-76-vol', loc: 'Introduction; No. 435, p. 410' }, { id: 'mkgandhi-agakhan' }],
    },
  },
  {
    id: 'b42-m-mahadev-f',
    tier: 1,
    real: false,
    pair: 'm-mahadev',
    minMode: 'medium',
    from: SLIP,
    to: ANN,
    text: {
      en: 'Remember Mahadev Desai, who died at the Aga Khan Palace on 15 September. Gandhiji wired: “Mahadev has died yogi’s and patriot’s death.”',
      hi: 'महादेव देसाई को याद कीजिए, जो 15 सितंबर को आग़ा ख़ान महल में गुज़र गए। गांधीजी ने तार भेजा: “महादेव ने योगी और देशभक्त की मौत पाई है।”',
    },
    checks: { en: ['Mahadev Desai', 'on 15 September', 'Aga Khan Palace'], hi: ['महादेव देसाई', '15 सितंबर', 'आग़ा ख़ान महल'] },
    tells: [
      {
        kind: 'date',
        explain: { en: 'Mahadev Desai died on 15 August, not 15 September.', hi: 'महादेव देसाई 15 अगस्त को गुज़रे, 15 सितंबर को नहीं।' },
        factId: 'f-mahadev',
        sources: [{ id: 'cwmg-76-vol', loc: 'Introduction; No. 435, p. 410' }],
      },
    ],
  },

  {
    id: 'b42-m-kasturba-g',
    tier: 1,
    real: true,
    pair: 'm-kasturba',
    minMode: 'medium',
    from: NEWSDESK,
    to: ANN,
    text: {
      en: 'Listeners ask after Kasturba. She is held with Gandhiji at the Aga Khan Palace, and so is Sarojini Naidu.',
      hi: 'सुनने वाले कस्तूरबा का हाल पूछते हैं। वे आग़ा ख़ान महल में गांधीजी के साथ बंद हैं, और सरोजिनी नायडू भी।',
    },
    checks: { en: ['Kasturba', 'Aga Khan Palace', 'Sarojini Naidu'], hi: ['कस्तूरबा', 'आग़ा ख़ान महल', 'सरोजिनी नायडू'] },
    why: {
      text: {
        en: 'Kasturba and Sarojini Naidu were interned with Gandhi at the Aga Khan Palace.',
        hi: 'कस्तूरबा और सरोजिनी नायडू गांधी के साथ आग़ा ख़ान महल में नज़रबंद थीं।',
      },
      sources: [{ id: 'mkgandhi-agakhan' }],
    },
  },
  {
    id: 'b42-m-kasturba-f',
    tier: 1,
    real: false,
    pair: 'm-kasturba',
    minMode: 'medium',
    from: NEWSDESK,
    to: ANN,
    text: {
      en: 'Listeners ask after Kasturba. She is held with Nehru in Ahmednagar Fort, and so is Sarojini Naidu.',
      hi: 'सुनने वाले कस्तूरबा का हाल पूछते हैं। वे अहमदनगर क़िले में नेहरू के साथ बंद हैं, और सरोजिनी नायडू भी।',
    },
    checks: { en: ['Kasturba', 'Ahmednagar Fort', 'Sarojini Naidu'], hi: ['कस्तूरबा', 'अहमदनगर क़िले', 'सरोजिनी नायडू'] },
    tells: [
      {
        kind: 'place',
        explain: { en: 'Both are held with Gandhiji at the Aga Khan Palace, not Ahmednagar.', hi: 'दोनों गांधीजी के साथ आग़ा ख़ान महल में हैं, अहमदनगर में नहीं।' },
        factId: 'f-palace',
        sources: [{ id: 'mkgandhi-agakhan' }],
      },
    ],
  },

  {
    id: 'b42-m-aruna-g',
    tier: 2,
    real: true,
    pair: 'm-aruna',
    minMode: 'medium',
    from: SLIP,
    to: ANN,
    text: {
      en: 'Asaf Ali is locked in Ahmednagar Fort with Nehru, but his wife, Aruna Asaf Ali, is still free and underground.',
      hi: 'आसफ़ अली नेहरू के साथ अहमदनगर क़िले में बंद हैं, पर उनकी पत्नी अरुणा आसफ़ अली अब भी आज़ाद हैं और छिपकर काम कर रही हैं।',
    },
    checks: { en: ['Asaf Ali is locked in Ahmednagar Fort', 'still free and underground'], hi: ['आसफ़ अली नेहरू के साथ', 'अब भी आज़ाद हैं'] },
    verify: { 'still free and underground': 'fact:f-underground' },
    why: {
      text: {
        en: 'Asaf Ali was one of Nehru’s fort companions; Aruna led the underground.',
        hi: 'आसफ़ अली क़िले में नेहरू के साथी थे; अरुणा छिपकर आंदोलन चला रही थीं।',
      },
      sources: [{ id: 'nehru-1946', loc: 'Preface (M. Asaf Ali)' }, { id: 'bipan-chandra-1989', loc: 'ch. 35, p. 468' }],
    },
  },
  {
    id: 'b42-m-aruna-f',
    tier: 2,
    real: false,
    pair: 'm-aruna',
    minMode: 'medium',
    from: SLIP,
    to: ANN,
    text: {
      en: 'Aruna Asaf Ali is locked in Ahmednagar Fort with Nehru, but her husband, Asaf Ali, is still free and underground.',
      hi: 'अरुणा आसफ़ अली नेहरू के साथ अहमदनगर क़िले में बंद हैं, पर उनके पति आसफ़ अली अब भी आज़ाद हैं और छिपकर काम कर रहे हैं।',
    },
    checks: { en: ['Aruna Asaf Ali is locked in Ahmednagar Fort', 'still free and underground'], hi: ['अरुणा आसफ़ अली नेहरू के साथ', 'अब भी आज़ाद हैं'] },
    verify: { 'still free and underground': 'fact:f-underground' },
    tells: [
      {
        kind: 'name',
        explain: { en: 'Swapped: Asaf Ali is in the fort; Aruna is the one underground.', hi: 'उलट दिया: आसफ़ अली क़िले में हैं; छिपकर काम अरुणा कर रही हैं।' },
        factId: 'f-fort',
        sources: [{ id: 'nehru-1946', loc: 'Preface' }, { id: 'bipan-chandra-1989', loc: 'ch. 35, p. 468' }],
      },
    ],
  },

  {
    id: 'b42-m-ballia-g',
    tier: 1,
    real: true,
    pair: 'm-ballia',
    minMode: 'medium',
    from: SLIP,
    to: ANN,
    text: {
      en: 'We were first with the news from Ballia: in August, Chittu Pande ran its own government for a week, till soldiers marched in.',
      hi: 'बलिया की ख़बर सबसे पहले हमने दी: अगस्त में चित्तू पांडे ने वहाँ एक हफ़्ता अपनी सरकार चलाई, फिर फ़ौज आ गई।',
    },
    checks: { en: ['Chittu Pande', 'for a week'], hi: ['चित्तू पांडे', 'एक हफ़्ता'] },
    why: {
      text: {
        en: 'Usha Mehta: the radio broke the Ballia news. Soldiers came a week later.',
        hi: 'उषा मेहता: बलिया की ख़बर पहले रेडियो ने दी। एक हफ़्ते बाद फ़ौज आई।',
      },
      sources: [{ id: 'usha-mehta-1969' }, { id: 'bipan-chandra-1989', loc: 'ch. 35 (parallel governments)' }],
    },
  },
  {
    id: 'b42-m-ballia-f',
    tier: 1,
    real: false,
    pair: 'm-ballia',
    minMode: 'medium',
    from: SLIP,
    to: ANN,
    text: {
      en: 'We were first with the news from Ballia: since August, Chittu Pande’s own government has held out there, and it still holds.',
      hi: 'बलिया की ख़बर सबसे पहले हमने दी: अगस्त से चित्तू पांडे की अपनी सरकार वहाँ टिकी है, और अब भी चल रही है।',
    },
    checks: { en: ['Chittu Pande’s', 'it still holds'], hi: ['चित्तू पांडे', 'अब भी चल रही है'] },
    tells: [
      {
        kind: 'date',
        explain: { en: 'It lasted a week in August; then soldiers marched in.', hi: 'वह अगस्त में एक हफ़्ता चली; फिर फ़ौज आ गई।' },
        factId: 'f-ballia',
        sources: [{ id: 'bipan-chandra-1989', loc: 'ch. 35 (parallel governments)' }],
      },
    ],
  },

  {
    id: 'b42-m-parekh-g',
    tier: 1,
    real: true,
    pair: 'm-parekh',
    minMode: 'medium',
    from: COURIER,
    to: ANN,
    text: {
      en: 'Burn this after reading. Tonight’s records go to Parekh Wadi in Girgaum, where we have worked since 15 October.',
      hi: 'पढ़कर जला दीजिए। आज रात के रिकॉर्ड गिरगाँव की पारेख वाड़ी जाएँगे, जहाँ हम 15 अक्टूबर से काम कर रहे हैं।',
    },
    checks: { en: ['Parekh Wadi in Girgaum', 'since 15 October'], hi: ['गिरगाँव की पारेख वाड़ी', '15 अक्टूबर से'] },
    why: {
      text: {
        en: 'Police list of sites: Parekh Wadi, Girgaum Back Road, from 15 October 1942.',
        hi: 'पुलिस की ठिकानों वाली सूची: पारेख वाड़ी, गिरगाँव बैक रोड, 15 अक्टूबर 1942 से।',
      },
      sources: [
        { id: 'huacuja-2023', loc: 'Fig. 4, police list of sites' },
        { id: 'chatterjee-1989', loc: 'sites' },
      ],
    },
  },
  {
    id: 'b42-m-parekh-f',
    tier: 1,
    real: false,
    pair: 'm-parekh',
    minMode: 'medium',
    from: COURIER,
    to: ANN,
    text: {
      en: 'Burn this after reading. Tonight’s records go to Parekh Wadi in Khetwadi, where we have worked since 15 October.',
      hi: 'पढ़कर जला दीजिए। आज रात के रिकॉर्ड खेतवाड़ी की पारेख वाड़ी जाएँगे, जहाँ हम 15 अक्टूबर से काम कर रहे हैं।',
    },
    checks: { en: ['Parekh Wadi in Khetwadi', 'since 15 October'], hi: ['खेतवाड़ी की पारेख वाड़ी', '15 अक्टूबर से'] },
    tells: [
      {
        kind: 'place',
        explain: { en: 'Parekh Wadi is in Girgaum, not Khetwadi.', hi: 'पारेख वाड़ी गिरगाँव में है, खेतवाड़ी में नहीं।' },
        factId: 'f-parekh',
        sources: [{ id: 'huacuja-2023', loc: 'Fig. 4, police list of sites' }],
      },
    ],
  },

  {
    id: 'b42-m-khakhar-g',
    tier: 1,
    real: true,
    pair: 'm-khakhar',
    minMode: 'medium',
    from: ORGANISERS,
    to: ANN,
    text: {
      en: 'Babubhai Khakhar, our chief organiser, has cleared tonight’s script with Lohia. Read it as written.',
      hi: 'हमारे संगठन के मुखिया बाबूभाई खाखर ने आज रात की स्क्रिप्ट लोहिया से पास करा ली है। जैसी लिखी है, वैसी पढ़िए।',
    },
    checks: { en: ['Babubhai Khakhar', 'with Lohia'], hi: ['बाबूभाई खाखर', 'लोहिया से'] },
    why: {
      text: {
        en: 'Police records: Khakhar was the chief organiser, “responsible to Ram Manohar Lohia”.',
        hi: 'पुलिस के काग़ज़: खाखर सबसे बड़े संगठन वाले थे, और लोहिया को जवाब देते थे।',
      },
      sources: [{ id: 'chatterjee-1989', loc: 'Home Dept records' }],
    },
  },
  {
    id: 'b42-m-khakhar-f',
    tier: 1,
    real: false,
    pair: 'm-khakhar',
    minMode: 'medium',
    from: ORGANISERS,
    to: ANN,
    text: {
      en: 'Babubhai Desai, our chief organiser, has cleared tonight’s script with Lohia. Read it as written.',
      hi: 'हमारे संगठन के मुखिया बाबूभाई देसाई ने आज रात की स्क्रिप्ट लोहिया से पास करा ली है। जैसी लिखी है, वैसी पढ़िए।',
    },
    checks: { en: ['Babubhai Desai', 'with Lohia'], hi: ['बाबूभाई देसाई', 'लोहिया से'] },
    tells: [
      {
        kind: 'name',
        explain: { en: 'Our chief organiser is Babubhai Khakhar, not Babubhai Desai.', hi: 'हमारे मुखिया बाबूभाई खाखर हैं, बाबूभाई देसाई नहीं।' },
        factId: 'f-khakhar',
        sources: [{ id: 'chatterjee-1989', loc: 'Home Dept records' }],
      },
    ],
  },

  {
    id: 'b42-m-coomi-g',
    tier: 2,
    real: true,
    pair: 'm-coomi',
    minMode: 'medium',
    from: REC,
    to: ANN,
    text: {
      en: 'Tonight’s English talk was read onto the record by Coomi Dastur. Play it after the Hindustani news.',
      hi: 'आज रात का अंग्रेज़ी भाषण कूमी दस्तूर ने रिकॉर्ड पर पढ़ा है। हिंदुस्तानी ख़बरों के बाद इसे बजाइए।',
    },
    checks: { en: ['English talk', 'Coomi Dastur'], hi: ['अंग्रेज़ी भाषण', 'कूमी दस्तूर'] },
    why: {
      text: {
        en: 'Usha Mehta: English speeches were mostly by Lohia and Miss Dastur.',
        hi: 'उषा मेहता: अंग्रेज़ी भाषण ज़्यादातर लोहिया और मिस दस्तूर पढ़ते थे।',
      },
      sources: [{ id: 'usha-mehta-1969' }],
    },
  },
  {
    id: 'b42-m-coomi-f',
    tier: 2,
    real: false,
    pair: 'm-coomi',
    minMode: 'medium',
    from: REC,
    to: ANN,
    text: {
      en: 'Tonight’s English talk was read onto the record by Sarojini Naidu. Play it after the Hindustani news.',
      hi: 'आज रात का अंग्रेज़ी भाषण सरोजिनी नायडू ने रिकॉर्ड पर पढ़ा है। हिंदुस्तानी ख़बरों के बाद इसे बजाइए।',
    },
    checks: { en: ['English talk', 'Sarojini Naidu'], hi: ['अंग्रेज़ी भाषण', 'सरोजिनी नायडू'] },
    tells: [
      {
        kind: 'name',
        explain: { en: 'Coomi Dastur reads them; Sarojini Naidu is held at the Aga Khan Palace.', hi: 'ये कूमी दस्तूर पढ़ती हैं; सरोजिनी नायडू आग़ा ख़ान महल में बंद हैं।' },
        factId: 'f-voices',
        sources: [{ id: 'usha-mehta-1969' }, { id: 'mkgandhi-agakhan' }],
      },
    ],
  },

  {
    id: 'b42-m-soldiers-g',
    tier: 2,
    real: true,
    pair: 'm-soldiers',
    minMode: 'medium',
    from: OLD,
    to: ANN,
    text: {
      en: 'From the 27 October script, Gandhiji to soldiers: “Your just orders we shall carry out but the order to fire on our own people we shall never obey.”',
      hi: '27 अक्टूबर की स्क्रिप्ट से, सिपाहियों से गांधीजी: “आपके जायज़ हुक्म हम मानेंगे, पर अपने ही लोगों पर गोली चलाने का हुक्म हम कभी नहीं मानेंगे।”',
    },
    checks: { en: ['Gandhiji'], hi: ['गांधीजी'] },
    document: { sources: [{ id: 'chatterjee-1989', loc: 'Gandhiji’s appeal to soldiers, on air 27 Oct 1942' }] },
    why: {
      text: {
        en: 'Real words: Gandhiji’s appeal to soldiers went on air on 27 October 1942.',
        hi: 'असली शब्द: सिपाहियों से गांधीजी की अपील 27 अक्टूबर 1942 को रेडियो पर गई।',
      },
      sources: [{ id: 'chatterjee-1989', loc: '“Directives to Soldiers”' }],
    },
  },
  {
    id: 'b42-m-soldiers-f',
    tier: 2,
    real: false,
    pair: 'm-soldiers',
    minMode: 'medium',
    from: OLD,
    to: ANN,
    text: {
      en: 'From the 27 October script, Mr. Gandhi to soldiers: “Your just orders we shall carry out but the order to fire on our own people we shall never obey.”',
      hi: '27 अक्टूबर की स्क्रिप्ट से, सिपाहियों से मिस्टर गांधी: “आपके जायज़ हुक्म हम मानेंगे, पर अपने ही लोगों पर गोली चलाने का हुक्म हम कभी नहीं मानेंगे।”',
    },
    checks: { en: ['Mr. Gandhi'], hi: ['मिस्टर गांधी'] },
    tells: [
      {
        kind: 'habit',
        explain: { en: 'Gandhiji, never “Mr. Gandhi”: that is the government’s word.', hi: 'गांधीजी, “मिस्टर गांधी” कभी नहीं; यह सरकारी शब्द है।' },
        ruleId: 'r-words',
        sources: [{ id: 'chatterjee-1989', loc: '“Directives to Soldiers”' }],
      },
    ],
  },

  // Day 14, Thu 12 Nov: after the office raid, Usha Mehta asked for a new transmitter overnight,
  // and the evening programme ran as usual.
  {
    id: 'b42-m-d14-overnight-g',
    tier: 2,
    real: true,
    pair: 'm-d14-overnight',
    minMode: 'medium',
    onDay: 14,
    from: ORGANISERS,
    to: ANN,
    text: {
      en: 'Our office has been raided. The technician’s assistant will build another transmitter overnight; tonight we go on air at 8:45 as usual.',
      hi: 'हमारे दफ़्तर पर छापा पड़ा है। मिस्त्री का सहायक रातों-रात दूसरा ट्रांसमीटर बनाएगा; आज रात हम हमेशा की तरह 8:45 पर बोलेंगे।',
    },
    checks: { en: ['8:45 as usual'], hi: ['8:45 पर'] },
    why: {
      text: {
        en: 'Usha Mehta, 12 November: she asked for a transmitter overnight; the programme ran.',
        hi: 'उषा मेहता, 12 नवंबर: रातों-रात नया ट्रांसमीटर माँगा; प्रोग्राम हमेशा की तरह चला।',
      },
      sources: [{ id: 'usha-mehta-1969', loc: '12 Nov 1942' }, { id: 'huacuja-2023', loc: 'n. 120 (on air from 8:45 pm)' }],
    },
  },
  {
    id: 'b42-m-d14-overnight-f',
    tier: 2,
    real: false,
    pair: 'm-d14-overnight',
    minMode: 'medium',
    onDay: 14,
    from: ORGANISERS,
    to: ANN,
    text: {
      en: 'Our office has been raided. The technician’s assistant will build another transmitter overnight; tonight we go on air at 9:15 as usual.',
      hi: 'हमारे दफ़्तर पर छापा पड़ा है। मिस्त्री का सहायक रातों-रात दूसरा ट्रांसमीटर बनाएगा; आज रात हम हमेशा की तरह 9:15 पर बोलेंगे।',
    },
    checks: { en: ['9:15 as usual'], hi: ['9:15 पर'] },
    tells: [
      {
        kind: 'number',
        explain: { en: 'We go on air at 8:45 pm, not 9:15.', hi: 'हम रात 8:45 पर बोलते हैं, 9:15 पर नहीं।' },
        ruleId: 'r-onair',
        sources: [{ id: 'huacuja-2023', loc: 'n. 120 (transcript of 18 Oct 1942)' }],
      },
    ],
  },

  // ───────────────────────── Hard (minMode 'hard'): deeper, still well known ─────────────────────────
  // Caught by the Hard facts (f-lastmsg, f-printer, f-motwane, f-tuning, f-ina) or by knowledge;
  // three genuine ones look wrong but check out.

  {
    id: 'b42-h-tuning-g',
    tier: 2,
    real: true,
    pair: 'h-tuning',
    minMode: 'hard',
    from: OLD,
    to: ANN,
    text: {
      en: 'From the 18 October script: “We are always on the air from 8:45 pm till you hear Vande Mataram. Move between 39 and 43 meters, which at times is necessary.”',
      hi: '18 अक्टूबर की स्क्रिप्ट से: “वंदे मातरम् सुनाई देने तक हम रात 8:45 से हमेशा रेडियो पर हैं। 39 से 43 मीटर के बीच सुई घुमाइए, कभी-कभी यह ज़रूरी होता है।”',
    },
    checks: { en: ['8:45 pm', 'between 39 and 43 meters'], hi: ['रात 8:45', '39 से 43 मीटर'] },
    document: { sources: [{ id: 'huacuja-2023', loc: 'n. 120 (police transcript of 18 Oct 1942)' }] },
    why: {
      text: {
        en: 'Real words, 18 October 1942, as police wrote them down.',
        hi: 'असली शब्द, 18 अक्टूबर 1942, जैसे पुलिस ने लिखे।',
      },
      sources: [{ id: 'huacuja-2023', loc: 'n. 120 (police transcript of 18 Oct 1942)' }],
    },
  },
  {
    id: 'b42-h-tuning-f',
    tier: 2,
    real: false,
    pair: 'h-tuning',
    minMode: 'hard',
    from: OLD,
    to: ANN,
    text: {
      en: 'From the 18 October script: “We are always on the air from 8:45 pm till you hear Vande Mataram. Move between 49 and 53 meters, which at times is necessary.”',
      hi: '18 अक्टूबर की स्क्रिप्ट से: “वंदे मातरम् सुनाई देने तक हम रात 8:45 से हमेशा रेडियो पर हैं। 49 से 53 मीटर के बीच सुई घुमाइए, कभी-कभी यह ज़रूरी होता है।”',
    },
    checks: { en: ['8:45 pm', 'between 49 and 53 meters'], hi: ['रात 8:45', '49 से 53 मीटर'] },
    tells: [
      {
        kind: 'number',
        explain: { en: 'We say between 39 and 43 metres, not 49 and 53.', hi: 'हम 39 से 43 मीटर कहते हैं, 49 से 53 नहीं।' },
        factId: 'f-tuning',
        sources: [{ id: 'huacuja-2023', loc: 'n. 120 (transcript of 18 Oct 1942)' }],
      },
    ],
  },

  {
    id: 'b42-h-printer-g',
    tier: 1,
    real: true,
    pair: 'h-printer',
    minMode: 'hard',
    from: COURIER,
    to: ANN,
    text: {
      en: 'The transmitter hums again. Nariman Printer has mended it, and he wants his money tonight.',
      hi: 'ट्रांसमीटर फिर चल पड़ा। नरीमन प्रिंटर ने उसे ठीक कर दिया है, और उन्हें आज रात अपने पैसे चाहिए।',
    },
    checks: { en: ['Nariman Printer', 'wants his money'], hi: ['नरीमन प्रिंटर', 'अपने पैसे चाहिए'] },
    verify: { 'wants his money': 'fact:f-printer' },
    why: {
      text: {
        en: 'Printer built the set; police said he worked “for the sake of profit”.',
        hi: 'सेट प्रिंटर ने बनाया; पुलिस ने लिखा, वे “मुनाफ़े के लिए” काम करते थे।',
      },
      sources: [{ id: 'chatterjee-1989', loc: 'Home Dept on Printer' }, { id: 'thakkar-2021', loc: 'Scroll excerpt' }],
    },
  },
  {
    id: 'b42-h-printer-f',
    tier: 1,
    real: false,
    pair: 'h-printer',
    minMode: 'hard',
    from: COURIER,
    to: ANN,
    text: {
      en: 'The transmitter hums again. Nariman Printer has mended it, and he says he wants no money.',
      hi: 'ट्रांसमीटर फिर चल पड़ा। नरीमन प्रिंटर ने उसे ठीक कर दिया है, और वे कहते हैं कि उन्हें कोई पैसा नहीं चाहिए।',
    },
    checks: { en: ['Nariman Printer', 'wants no money'], hi: ['नरीमन प्रिंटर', 'कोई पैसा नहीं चाहिए'] },
    tells: [
      {
        kind: 'habit',
        explain: { en: 'Nariman Printer builds our sets for pay; he always wants his money.', hi: 'नरीमन प्रिंटर हमारे सेट पैसे लेकर बनाते हैं; उन्हें पैसे हमेशा चाहिए।' },
        factId: 'f-printer',
        sources: [{ id: 'chatterjee-1989', loc: 'Home Dept on Printer' }],
      },
    ],
  },

  {
    id: 'b42-h-motwane-g',
    tier: 1,
    real: true,
    pair: 'h-motwane',
    minMode: 'hard',
    from: ORGANISERS,
    to: ANN,
    text: {
      en: 'Nanak Motwane, who owns Chicago Radio, says send no one to his shop: the CID is watching it.',
      hi: 'शिकागो रेडियो के मालिक नानक मोटवाने कहते हैं, उनकी दुकान पर किसी को मत भेजिए: सी.आई.डी. नज़र रख रही है।',
    },
    checks: { en: ['Nanak Motwane', 'owns Chicago Radio'], hi: ['नानक मोटवाने', 'शिकागो रेडियो के मालिक'] },
    why: {
      text: {
        en: 'Motwane owned Chicago Radio; the CID’s Kokje watched the radio shops.',
        hi: 'मोटवाने शिकागो रेडियो के मालिक थे; सी.आई.डी. के कोकजे रेडियो की दुकानों पर नज़र रखते थे।',
      },
      sources: [{ id: 'usha-mehta-1969' }, { id: 'huacuja-2023', loc: 'Kokje watched radio shops' }],
    },
  },
  {
    id: 'b42-h-motwane-f',
    tier: 1,
    real: false,
    pair: 'h-motwane',
    minMode: 'hard',
    from: ORGANISERS,
    to: ANN,
    text: {
      en: 'Vithalbhai Jhaveri, who owns Chicago Radio, says send no one to his shop: the CID is watching it.',
      hi: 'शिकागो रेडियो के मालिक विट्ठलभाई झवेरी कहते हैं, उनकी दुकान पर किसी को मत भेजिए: सी.आई.डी. नज़र रख रही है।',
    },
    checks: { en: ['Vithalbhai Jhaveri', 'owns Chicago Radio'], hi: ['विट्ठलभाई झवेरी', 'शिकागो रेडियो के मालिक'] },
    tells: [
      {
        kind: 'name',
        explain: { en: 'Nanak Motwane owns Chicago Radio; Vithalbhai Jhaveri makes our records.', hi: 'शिकागो रेडियो के मालिक नानक मोटवाने हैं; विट्ठलभाई झवेरी हमारे रिकॉर्ड बनाते हैं।' },
        factId: 'f-motwane',
        sources: [{ id: 'usha-mehta-1969' }],
      },
    ],
  },

  {
    id: 'b42-h-ina-g',
    tier: 3,
    real: true,
    pair: 'h-ina',
    minMode: 'hard',
    from: NEWSDESK,
    to: ANN,
    text: {
      en: 'Listeners ask about the army raised in Malaya from Indian prisoners of war. It is Mohan Singh’s; we speak only for the Congress.',
      hi: 'सुनने वाले मलाया में हिंदुस्तानी जंगी क़ैदियों से बनी फ़ौज के बारे में पूछते हैं। वह मोहन सिंह की है; हम सिर्फ़ कांग्रेस की तरफ़ से बोलते हैं।',
    },
    checks: { en: ['raised in Malaya', 'Mohan Singh’s'], hi: ['मलाया में', 'मोहन सिंह की'] },
    why: {
      text: {
        en: 'In 1942 the INA was Mohan Singh’s, raised in Malaya from Indian prisoners.',
        hi: '1942 में आज़ाद हिंद फ़ौज मोहन सिंह की थी, मलाया में जंगी क़ैदियों से बनी।',
      },
      sources: [{ id: 'bipan-chandra-1989', loc: 'ch. 35, pp. 476–7' }],
    },
  },
  {
    id: 'b42-h-ina-f',
    tier: 3,
    real: false,
    pair: 'h-ina',
    minMode: 'hard',
    from: NEWSDESK,
    to: ANN,
    text: {
      en: 'Listeners ask about the army raised in Malaya from Indian prisoners of war. It is Netaji Subhas Bose’s; we speak only for the Congress.',
      hi: 'सुनने वाले मलाया में हिंदुस्तानी जंगी क़ैदियों से बनी फ़ौज के बारे में पूछते हैं। वह नेताजी सुभाष बोस की है; हम सिर्फ़ कांग्रेस की तरफ़ से बोलते हैं।',
    },
    checks: { en: ['raised in Malaya', 'Netaji Subhas Bose’s'], hi: ['मलाया में', 'नेताजी सुभाष बोस की'] },
    tells: [
      {
        kind: 'knowledge',
        explain: { en: 'In 1942 it is Mohan Singh’s; Netaji reached Singapore only in July 1943.', hi: '1942 में यह मोहन सिंह की है; नेताजी सिंगापुर जुलाई 1943 में पहुँचे।' },
        factId: 'f-ina',
        sources: [{ id: 'bipan-chandra-1989', loc: 'ch. 35, p. 477' }],
      },
    ],
  },

  {
    id: 'b42-h-lastmsg-g',
    tier: 2,
    real: true,
    pair: 'h-lastmsg',
    minMode: 'hard',
    from: LEAFLET,
    to: ANN,
    text: {
      en: 'Tell every listener tonight: Gandhiji’s last message, left at his arrest, says “Karenge Ya Marenge”.',
      hi: 'आज रात हर सुनने वाले से कहिए: गिरफ़्तारी के वक़्त छोड़े गांधीजी के आख़िरी संदेश में लिखा है, “करेंगे या मरेंगे”।',
    },
    checks: { en: ['Gandhiji’s last message', 'Karenge Ya Marenge'], hi: ['गांधीजी के आख़िरी संदेश', 'करेंगे या मरेंगे'] },
    why: {
      text: {
        en: 'His written last message has “Karenge Ya Marenge”; the government printed it in 1943.',
        hi: 'उनके लिखे आख़िरी संदेश में “करेंगे या मरेंगे” है; सरकार ने 1943 में छापा।',
      },
      sources: [{ id: 'goi-1943', loc: 'App. X' }],
    },
  },
  {
    id: 'b42-h-lastmsg-f',
    tier: 2,
    real: false,
    pair: 'h-lastmsg',
    minMode: 'hard',
    from: LEAFLET,
    to: ANN,
    text: {
      en: 'Tell every listener tonight: Sardar Patel’s last message, left at his arrest, says “Karenge Ya Marenge”.',
      hi: 'आज रात हर सुनने वाले से कहिए: गिरफ़्तारी के वक़्त छोड़े सरदार पटेल के आख़िरी संदेश में लिखा है, “करेंगे या मरेंगे”।',
    },
    checks: { en: ['Sardar Patel’s last message', 'Karenge Ya Marenge'], hi: ['सरदार पटेल के आख़िरी संदेश', 'करेंगे या मरेंगे'] },
    tells: [
      {
        kind: 'name',
        explain: { en: '“Karenge Ya Marenge” is in Gandhiji’s last message, not Patel’s.', hi: '“करेंगे या मरेंगे” गांधीजी के आख़िरी संदेश में है, पटेल के नहीं।' },
        factId: 'f-lastmsg',
        sources: [{ id: 'goi-1943', loc: 'App. X' }],
      },
    ],
  },

  // Day 13, Wed 11 Nov: the same Mansion House speech of 10 November, on the Battle of Egypt.

  {
    id: 'b42-h-antiindia-g',
    tier: 3,
    real: true,
    minMode: 'hard',
    from: NEWSDESK,
    to: ANN,
    text: {
      en: 'Anti-India Radio is jamming us again tonight. If the sound fades, tell listeners to keep turning the dial.',
      hi: 'एंटी-इंडिया रेडियो आज रात फिर हमें जाम कर रहा है। आवाज़ धीमी हो तो सुनने वालों से कहिए, सुई घुमाते रहें।',
    },
    checks: { en: ['Anti-India Radio', 'jamming us again'], hi: ['एंटी-इंडिया रेडियो', 'फिर हमें जाम'] },
    verify: { 'jamming us again': 'fact:f-antiindia' },
    why: {
      text: {
        en: 'Usha Mehta: the official radio jammed them, so colleagues called it “Anti-India Radio”.',
        hi: 'उषा मेहता: सरकारी रेडियो उन्हें जाम करता था, इसलिए साथी उसे “एंटी-इंडिया रेडियो” कहते थे।',
      },
      sources: [{ id: 'usha-mehta-1969' }],
    },
  },



  // Things still to come: true events, but not yet in November 1942.
]
