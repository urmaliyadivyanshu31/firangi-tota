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
    checks: { en: ['8:45 pm', 'uncensored news'], hi: ['8:45 बजे', 'बिना काट-छाँट की ख़बर'] },
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
    checks: { en: ['9:45 pm', 'uncensored news'], hi: ['9:45 बजे', 'बिना काट-छाँट की ख़बर'] },
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
    checks: { en: ['Sardar Patel’s', 'Gowalia Tank resolution', 'Maulana Azad’s'], hi: ['सरदार पटेल का', 'गोवालिया टैंक वाले प्रस्ताव', 'मौलाना आज़ाद का'] },
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
    checks: { en: ['Sardar Patel’s', 'Azad Maidan resolution', 'Maulana Azad’s'], hi: ['सरदार पटेल का', 'आज़ाद मैदान वाले प्रस्ताव', 'मौलाना आज़ाद का'] },
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
    checks: { en: ['Congress Radio', '42.34 metres', 'somewhere in India'], hi: ['कांग्रेस रेडियो', '42.34 मीटर', 'हिंदुस्तान में कहीं से'] },
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
    checks: { en: ['Congress Radio', '43.24 metres', 'somewhere in India'], hi: ['कांग्रेस रेडियो', '43.24 मीटर', 'हिंदुस्तान में कहीं से'] },
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
    checks: { en: ['On 9 August', 'Aruna Asaf Ali', 'Gowalia Tank Maidan'], hi: ['9 अगस्त को', 'अरुणा आसफ़ अली', 'गोवालिया टैंक मैदान'] },
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
    checks: { en: ['On 9 August', 'Sarojini Naidu', 'Gowalia Tank Maidan'], hi: ['9 अगस्त को', 'सरोजिनी नायडू', 'गोवालिया टैंक मैदान'] },
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
    checks: { en: ['Aga Khan Palace', 'Ahmednagar Fort'], hi: ['आग़ा ख़ान महल', 'अहमदनगर क़िले'] },
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
    checks: { en: ['Yerwada jail', 'Ahmednagar Fort'], hi: ['यरवदा जेल', 'अहमदनगर क़िले'] },
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
    checks: { en: ['Paradise Bungalow', 'near Mahalaxmi Temple'], hi: ['पैराडाइज़ बंगले', 'महालक्ष्मी मंदिर के पास'] },
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
    checks: { en: ['Vithalbhai Jhaveri', 'two records', 'recording room'], hi: ['विट्ठलभाई झवेरी', 'रिकॉर्डिंग वाले कमरे', 'दो रिकॉर्ड'] },
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
    checks: { en: ['Vithalbhai Patel', 'two records', 'recording room'], hi: ['विट्ठलभाई पटेल', 'रिकॉर्डिंग वाले कमरे', 'दो रिकॉर्ड'] },
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
    pair: 'voices',
    from: REC,
    to: ANN,
    text: {
      en: 'Two records tonight: first the news in Hindustani, then an English talk read by Lohia.',
      hi: 'आज रात दो रिकॉर्ड: पहले हिंदुस्तानी में ख़बरें, फिर लोहिया का पढ़ा हुआ अंग्रेज़ी भाषण।',
    },
    checks: { en: ['news in Hindustani', 'read by Lohia'], hi: ['हिंदुस्तानी में ख़बरें', 'लोहिया का पढ़ा हुआ'] },
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
    pair: 'voices',
    from: REC,
    to: ANN,
    text: {
      en: 'Two records tonight: first the news in Hindustani, then an English talk Nehru recorded for us this week.',
      hi: 'आज रात दो रिकॉर्ड: पहले हिंदुस्तानी में ख़बरें, फिर अंग्रेज़ी भाषण, जो नेहरू ने इसी हफ़्ते हमारे लिए रिकॉर्ड किया।',
    },
    checks: { en: ['news in Hindustani', 'Nehru recorded for us'], hi: ['हिंदुस्तानी में ख़बरें', 'नेहरू ने इसी हफ़्ते'] },
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
    checks: { en: ['radio shops', 'Chicago Radio', 'arrested technicians'], hi: ['रेडियो की दुकानों', 'शिकागो रेडियो', 'मिस्त्रियों को पकड़ लिया'] },
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
    checks: { en: ['radio shops', 'Calcutta Radio', 'arrested technicians'], hi: ['रेडियो की दुकानों', 'कलकत्ता रेडियो', 'मिस्त्रियों को पकड़ लिया'] },
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
      en: 'Gandhiji to the Viceroy, from Detention Camp, 5 November, on Lord Halifax’s son: “I have just read about the sad but heroic death of Hon’ble Peter Wood in action.”',
      hi: 'गांधीजी का वायसराय को ख़त, नज़रबंदी कैंप से, 5 नवंबर, लॉर्ड हैलिफ़ैक्स के बेटे पर: “मैंने अभी माननीय पीटर वुड की लड़ाई में दुखभरी पर बहादुर मौत के बारे में पढ़ा।”',
    },
    checks: { en: ['from Detention Camp', '5 November', 'Peter Wood'], hi: ['नज़रबंदी कैंप से', '5 नवंबर', 'पीटर वुड'] },
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
      en: 'Gandhiji to the Viceroy, from Ahmednagar Fort, 5 November, on Lord Halifax’s son: “I have just read about the sad but heroic death of Hon’ble Peter Wood in action.”',
      hi: 'गांधीजी का वायसराय को ख़त, अहमदनगर क़िले से, 5 नवंबर, लॉर्ड हैलिफ़ैक्स के बेटे पर: “मैंने अभी माननीय पीटर वुड की लड़ाई में दुखभरी पर बहादुर मौत के बारे में पढ़ा।”',
    },
    checks: { en: ['from Ahmednagar Fort', '5 November', 'Peter Wood'], hi: ['अहमदनगर क़िले से', '5 नवंबर', 'पीटर वुड'] },
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
    checks: { en: ['calling from 42.34', 'a ban has been laid'], hi: ['42.34 से बोल रहा है', 'पाबंदी लगी है'] },
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
    checks: { en: ['calling from Bombay', 'a ban has been laid'], hi: ['बंबई से', 'पाबंदी लगी है'] },
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
    id: 'b42-weekday-g',
    tier: 2,
    real: true,
    pair: 'weekday',
    from: NEWSDESK,
    to: ANN,
    text: {
      en: 'Tonight, {weekday} {date}, our appeal is to students: “Education can wait but not the freedom.”',
      hi: 'आज रात, {weekday} {date}, हमारी अपील छात्रों से है: “पढ़ाई रुक सकती है, आज़ादी नहीं।”',
    },
    checks: { en: ['Tonight', 'appeal is to students'], hi: ['आज रात', 'अपील छात्रों से है'] },
    why: {
      text: {
        en: 'The weekday matches the date. The line is from Bulletin No. 8, to students.',
        hi: 'दिन और तारीख़ मेल खाते हैं। यह बात छात्रों के नाम बुलेटिन नंबर 8 से है।',
      },
      sources: [
        { id: 'calendar-1942' },
        { id: 'nehru-centre-2021', loc: '“Bulletin No. 8, War of Independence”' },
        { id: 'usha-mehta-1969', loc: 'appeals to students' },
      ],
    },
  },
  {
    id: 'b42-weekday-f',
    tier: 2,
    real: false,
    pair: 'weekday',
    from: NEWSDESK,
    to: ANN,
    text: {
      en: 'Tonight, {weekday+1} {date}, our appeal is to students: “Education can wait but not the freedom.”',
      hi: 'आज रात, {weekday+1} {date}, हमारी अपील छात्रों से है: “पढ़ाई रुक सकती है, आज़ादी नहीं।”',
    },
    checks: { en: ['Tonight', 'appeal is to students'], hi: ['आज रात', 'अपील छात्रों से है'] },
    tells: [
      {
        kind: 'weekday',
        explain: { en: 'The weekday is one day off the date.', hi: 'दिन तारीख़ से एक दिन आगे है।' },
        sources: [{ id: 'calendar-1942' }],
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
    checks: { en: ['Gandhiji’s last message', 'Ahimsa', 'Karenge Ya Marenge'], hi: ['गांधीजी का आख़िरी संदेश', 'अहिंसा', 'करेंगे या मरेंगे'] },
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
    checks: { en: ['Mr. Gandhi’s last message', 'the disturbances', 'wait at home'], hi: ['मिस्टर गांधी का आख़िरी संदेश', 'गड़बड़ियों', 'घर बैठो'] },
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
    checks: { en: ['Lohia’s talk', 'never say his name on air', 'conducting a revolution'], hi: ['लोहिया का भाषण', 'उनका नाम कभी मत लीजिए', 'क्रांति चला रहे हैं'] },
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
    checks: { en: ['Lohia’s talk', 'Now hear Dr Lohia', 'in this very building'], hi: ['लोहिया का भाषण', 'अब सुनिए डॉ. लोहिया को', 'इसी इमारत में'] },
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
    id: 'b42-sucheta-g',
    tier: 2,
    real: true,
    pair: 'sucheta',
    from: COURIER,
    to: ANN,
    text: {
      en: 'Tonight’s main news comes from the Congress office that Sucheta Kripalani runs. Read it straight after Sare Jahan Se Achcha.',
      hi: 'आज रात की ख़ास ख़बरें उस कांग्रेस दफ़्तर से आई हैं जिसे सुचेता कृपलानी चलाती हैं। “सारे जहाँ से अच्छा” के फ़ौरन बाद इन्हें पढ़िए।',
    },
    checks: { en: ['Sucheta Kripalani', 'Sare Jahan Se Achcha'], hi: ['सुचेता कृपलानी', 'सारे जहाँ से अच्छा'] },
    why: {
      text: {
        en: 'Usha Mehta: the Congress office in Bombay, run by Sucheta Kripalani, supplied news.',
        hi: 'उषा मेहता: बंबई का कांग्रेस दफ़्तर, जिसे सुचेता कृपलानी चलाती थीं, ख़बरें भेजता था।',
      },
      sources: [{ id: 'usha-mehta-1969', loc: 'news from the AICC office, Sucheta Kripalani in charge' }],
    },
  },
  {
    id: 'b42-sucheta-f',
    tier: 3,
    real: false,
    pair: 'sucheta',
    from: COURIER,
    to: ANN,
    text: {
      en: 'Tonight’s main news comes from the Congress office that Kasturba Gandhi runs. Read it straight after Sare Jahan Se Achcha.',
      hi: 'आज रात की ख़ास ख़बरें उस कांग्रेस दफ़्तर से आई हैं जिसे कस्तूरबा गांधी चलाती हैं। “सारे जहाँ से अच्छा” के फ़ौरन बाद इन्हें पढ़िए।',
    },
    checks: { en: ['Kasturba Gandhi', 'Sare Jahan Se Achcha'], hi: ['कस्तूरबा गांधी', 'सारे जहाँ से अच्छा'] },
    tells: [
      {
        kind: 'knowledge',
        explain: { en: 'Sucheta Kripalani runs it; Kasturba is held with Gandhiji at the Aga Khan Palace.', hi: 'दफ़्तर सुचेता कृपलानी चलाती हैं; कस्तूरबा गांधीजी के साथ आग़ा ख़ान महल में बंद हैं।' },
        sources: [{ id: 'mkgandhi-agakhan' }, { id: 'usha-mehta-1969' }],
      },
    ],
  },

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
    checks: { en: ['Two new records', 'eight or ten plays'], hi: ['दो नए रिकॉर्ड', '8 या 10 बार'] },
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
    checks: { en: ['on a tape', 'before 8:45'], hi: ['टेप पर है', '8:45 से पहले'] },
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
    checks: { en: ['7:15 am', 'Sunday 9 August', 'taken off at Chinchwad'], hi: ['सुबह 7:15', 'रविवार 9 अगस्त', 'चिंचवड़ में उतारे गए'] },
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
    checks: { en: ['7:15 am', 'Sunday 9 August', 'taken off at Kalyan'], hi: ['सुबह 7:15', 'रविवार 9 अगस्त', 'कल्याण में उतारे गए'] },
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
    checks: { en: ['Three months today', 'since 9 August'], hi: ['9 अगस्त को', 'आज तीन महीने'] },
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
    checks: { en: ['Three months today', 'since 8 August'], hi: ['8 अगस्त को', 'आज तीन महीने'] },
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
    checks: { en: ['a million voices', 'Never talk of the persons behind the stations'], hi: ['दस लाख आवाज़ों', 'पीछे के लोगों की बात कभी मत कीजिए'] },
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
    checks: { en: ['a million voices', 'Babubhai Khakhar and Vithalbhai Jhaveri'], hi: ['दस लाख आवाज़ों', 'बाबूभाई खाखर और विट्ठलभाई झवेरी'] },
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
    checks: { en: ['Lohia’s answer', 'The work must go on'], hi: ['लोहिया का जवाब', 'काम चलते रहना चाहिए'] },
    why: {
      text: {
        en: 'Usha Mehta: after police raided Babubhai’s office on 12 November, Lohia said this.',
        hi: 'उषा मेहता: 12 नवंबर को बाबूभाई के दफ़्तर पर छापे के बाद लोहिया ने यही कहा।',
      },
      sources: [{ id: 'usha-mehta-1969', loc: '12 Nov 1942: raid on Khakhar’s office; Lohia’s reply' }],
    },
  },

  // ───────────────────────── Tier 3: knowledge tells, and genuine ones that look wrong ─────────────────────────

  {
    id: 'b42-flag-chakra-f',
    tier: 3,
    real: false,
    pair: 'flag',
    from: SLIP,
    to: ANN,
    text: {
      en: 'On 9 August, after the dawn arrests, Aruna Asaf Ali raised the tricolour with the Ashoka Chakra at Gowalia Tank Maidan.',
      hi: '9 अगस्त को, तड़के की गिरफ़्तारियों के बाद, अरुणा आसफ़ अली ने गोवालिया टैंक मैदान में अशोक चक्र वाला तिरंगा फहराया।',
    },
    checks: { en: ['Aruna Asaf Ali', 'with the Ashoka Chakra', 'Gowalia Tank Maidan'], hi: ['अरुणा आसफ़ अली', 'गोवालिया टैंक मैदान', 'अशोक चक्र वाला तिरंगा'] },
    tells: [
      {
        kind: 'anachronism',
        explain: { en: 'The 1942 Congress flag had the charkha; the Ashoka Chakra came in July 1947.', hi: '1942 के कांग्रेस झंडे पर चरख़ा था; अशोक चक्र जुलाई 1947 में आया।' },
        sources: [{ id: 'cad-1947', loc: 'resolution on the National Flag' }, { id: 'rebel-india-1946', loc: 'Bombay section' }],
      },
    ],
  },

  {
    id: 'b42-mantra-g',
    tier: 3,
    real: true,
    pair: 'mantra',
    from: LEAFLET,
    to: ANN,
    text: {
      en: 'Gandhiji’s mantra at Gowalia Tank, 8 August: “Do or Die. We shall either free India or die in the attempt.”',
      hi: 'गोवालिया टैंक, 8 अगस्त, गांधीजी का मंत्र: “करो या मरो। या तो हम भारत को आज़ाद करेंगे या इस कोशिश में मर जाएँगे।”',
    },
    checks: { en: ['Gandhiji’s mantra', 'Gowalia Tank, 8 August', 'Do or Die'], hi: ['गोवालिया टैंक, 8 अगस्त', 'गांधीजी का मंत्र', 'करो या मरो'] },
    document: { sources: [{ id: 'gandhi-1942' }] },
    why: {
      text: {
        en: 'Gandhiji’s Hindustani speech, Gowalia Tank, 8 August 1942, in the Collected Works translation.',
        hi: 'गांधीजी का हिंदुस्तानी भाषण, गोवालिया टैंक, 8 अगस्त 1942; यहाँ कलेक्टेड वर्क्स के अंग्रेज़ी अनुवाद से।',
      },
      sources: [{ id: 'gandhi-1942', loc: 'CWMG 76, No. 426 (translation of the Hindi speech)' }, { id: 'bipan-chandra-1989' }],
    },
  },
  {
    id: 'b42-mantra-f',
    tier: 3,
    real: false,
    pair: 'mantra',
    from: LEAFLET,
    to: ANN,
    text: {
      en: 'Pandit Nehru’s mantra at Gowalia Tank, 8 August: “Do or Die. We shall either free India or die in the attempt.”',
      hi: 'गोवालिया टैंक, 8 अगस्त, पंडित नेहरू का मंत्र: “करो या मरो। या तो हम भारत को आज़ाद करेंगे या इस कोशिश में मर जाएँगे।”',
    },
    checks: { en: ['Pandit Nehru’s mantra', 'Gowalia Tank, 8 August', 'Do or Die'], hi: ['गोवालिया टैंक, 8 अगस्त', 'पंडित नेहरू का मंत्र', 'करो या मरो'] },
    tells: [
      {
        kind: 'knowledge',
        explain: { en: '“Do or Die” was Gandhiji’s mantra, not Nehru’s.', hi: '“करो या मरो” गांधीजी का मंत्र था, नेहरू का नहीं।' },
        sources: [{ id: 'gandhi-1942' }],
      },
    ],
  },

  // Day 12, Tue 10 Nov: JP escaped from Hazaribagh Jail in early November.
  {
    id: 'b42-d12-jp-g',
    tier: 3,
    real: true,
    pair: 'd12-jp',
    onDay: 12,
    from: SLIP,
    to: ANN,
    text: {
      en: 'News from Bihar: Jayaprakash Narayan has escaped from Hazaribagh Jail and gone underground.',
      hi: 'बिहार से ख़बर: जयप्रकाश नारायण हज़ारीबाग़ जेल से भाग निकले हैं और छिपकर काम कर रहे हैं।',
    },
    checks: { en: ['Jayaprakash Narayan', 'Hazaribagh Jail'], hi: ['जयप्रकाश नारायण', 'हज़ारीबाग़ जेल'] },
    why: {
      text: {
        en: 'JP escaped from Hazaribagh Jail in early November 1942.',
        hi: 'जेपी नवंबर 1942 की शुरुआत में हज़ारीबाग़ जेल से भागे।',
      },
      sources: [{ id: 'iar-1942', loc: 'official report of the disturbances, reprinted, p. 190' }],
    },
  },
  {
    id: 'b42-d12-jp-f',
    tier: 3,
    real: false,
    pair: 'd12-jp',
    onDay: 12,
    from: SLIP,
    to: ANN,
    text: {
      en: 'News just in: Jayaprakash Narayan has escaped from Deoli camp and gone underground.',
      hi: 'अभी-अभी ख़बर आई: जयप्रकाश नारायण देवली कैंप से भाग निकले हैं और छिपकर काम कर रहे हैं।',
    },
    checks: { en: ['Jayaprakash Narayan', 'Deoli camp'], hi: ['जयप्रकाश नारायण', 'देवली कैंप'] },
    tells: [
      {
        kind: 'knowledge',
        explain: { en: 'Hazaribagh Jail, not Deoli, where he was held in 1941.', hi: 'हज़ारीबाग़ जेल, देवली नहीं; देवली में वे 1941 में बंद थे।' },
        sources: [{ id: 'iar-1942', loc: 'official report of the disturbances, reprinted, p. 190' }],
      },
    ],
  },

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
    checks: { en: ['News from London', 'Churchill said', 'the King’s First Minister'], hi: ['लंदन से ख़बर', 'चर्चिल ने कहा', 'बादशाह का प्रधानमंत्री'] },
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
    checks: { en: ['News from Delhi', 'the Viceroy, Lord Linlithgow', 'the King’s First Minister'], hi: ['दिल्ली से ख़बर', 'वायसराय लॉर्ड लिनलिथगो', 'बादशाह का प्रधानमंत्री'] },
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
    id: 'b42-money-g',
    tier: 3,
    real: true,
    pair: 'money',
    from: ORGANISERS,
    to: ANN,
    text: {
      en: 'Police are asking questions at radio shops. Hide our Chicago Radio bills: the amplifier, Rs 599-8-0, and the microphone, Rs 250.',
      hi: 'पुलिस रेडियो की दुकानों पर पूछताछ कर रही है। शिकागो रेडियो की हमारी रसीदें छिपाइए: एम्प्लीफ़ायर, 599-8-0 रुपये, और माइक्रोफ़ोन, 250 रुपये।',
    },
    checks: { en: ['Chicago Radio bills', 'Rs 599-8-0', 'Rs 250'], hi: ['शिकागो रेडियो', '599-8-0 रुपये', '250 रुपये'] },
    why: {
      text: {
        en: 'Court papers: Rs 599-8-0 (14 August) and Rs 250 (24 August), at Chicago Radio.',
        hi: 'अदालत के काग़ज़: 599-8-0 रुपये (14 अगस्त) और 250 रुपये (24 अगस्त), शिकागो रेडियो से।',
      },
      sources: [{ id: 'thakkar-2021', loc: 'Scroll excerpt (court record)' }, { id: 'huacuja-2023', loc: 'Kokje watched radio shops' }],
    },
  },
  {
    id: 'b42-money-f',
    tier: 3,
    real: false,
    pair: 'money',
    from: ORGANISERS,
    to: ANN,
    text: {
      en: 'Police are asking questions at radio shops. Hide our Chicago Radio bills: the amplifier, Rs 599.50, and the microphone, Rs 250.',
      hi: 'पुलिस रेडियो की दुकानों पर पूछताछ कर रही है। शिकागो रेडियो की हमारी रसीदें छिपाइए: एम्प्लीफ़ायर, 599.50 रुपये, और माइक्रोफ़ोन, 250 रुपये।',
    },
    checks: { en: ['Chicago Radio bills', 'Rs 599.50', 'Rs 250'], hi: ['शिकागो रेडियो', '599.50 रुपये', '250 रुपये'] },
    tells: [
      {
        kind: 'anachronism',
        explain: { en: 'Rs 599-8-0, not 599.50. Decimal rupees are fifteen years away.', hi: '599-8-0 रुपये, 599.50 नहीं। दशमलव वाला रुपया अभी 15 साल दूर है।' },
        sources: [{ id: 'thakkar-2021', loc: 'Scroll excerpt (court record)' }, { id: 'rbi-1957' }],
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

  {
    id: 'b42-toll-g',
    tier: 3,
    real: true,
    pair: 'toll',
    from: SLIP,
    to: ANN,
    text: {
      en: 'Even their own Home Member, Maxwell, told the Assembly on 16 September: police firing had killed 340, and the army 318.',
      hi: 'उनके अपने होम मेंबर (गृह विभाग के मुखिया) मैक्सवेल ने 16 सितंबर को असेंबली में माना: पुलिस की गोलियों से 340 मरे, और फ़ौज की गोलियों से 318।',
    },
    checks: { en: ['Home Member, Maxwell', '16 September', 'killed 340'], hi: ['होम मेंबर', '16 सितंबर', '340 मरे'] },
    why: {
      text: {
        en: 'Home Member Maxwell gave these figures on 16 September 1942, calling them incomplete.',
        hi: 'होम मेंबर मैक्सवेल ने 16 सितंबर 1942 को ये आँकड़े दिए, और इन्हें अधूरा बताया।',
      },
      sources: [{ id: 'iar-1942', loc: 'September chronicle, 16 Sep' }],
    },
  },
  {
    id: 'b42-toll-f',
    tier: 3,
    real: false,
    pair: 'toll',
    from: SLIP,
    to: ANN,
    text: {
      en: 'Even the Viceroy, Lord Wavell, told the Assembly on 16 September: police firing had killed 340, and the army 318.',
      hi: 'वायसराय लॉर्ड वेवल ने भी 16 सितंबर को असेंबली में माना: पुलिस की गोलियों से 340 मरे, और फ़ौज की गोलियों से 318।',
    },
    checks: { en: ['the Viceroy, Lord Wavell', '16 September', 'killed 340'], hi: ['वायसराय लॉर्ड वेवल', '16 सितंबर', '340 मरे'] },
    tells: [
      {
        kind: 'knowledge',
        explain: { en: 'Home Member Maxwell said it; the Viceroy was Linlithgow, not Wavell.', hi: 'यह होम मेंबर मैक्सवेल ने कहा; वायसराय लिनलिथगो थे, वेवल नहीं।' },
        factId: 'f-chiefs',
        sources: [
          { id: 'iar-1942', loc: 'September chronicle, 16 Sep' },
          { id: 'top-ii-1971', loc: 'No. 662; front matter (Executive Council: General Sir Archibald Wavell, C-in-C)' },
        ],
      },
    ],
  },
  // Myth (people-and-moments §3C #7): "the government admitted 10,000 dead".
  {
    id: 'b42-toll-myth-f',
    tier: 3,
    real: false,
    pair: 'toll',
    from: SLIP,
    to: ANN,
    text: {
      en: 'Even their own Home Member, Maxwell, told the Assembly on 16 September: police and army firing had killed 10,000.',
      hi: 'उनके अपने होम मेंबर (गृह विभाग के मुखिया) मैक्सवेल ने 16 सितंबर को असेंबली में माना: पुलिस और फ़ौज की गोलियों से 10,000 मरे।',
    },
    checks: { en: ['Home Member, Maxwell', '16 September', 'killed 10,000'], hi: ['होम मेंबर', '16 सितंबर', '10,000 मरे'] },
    tells: [
      {
        kind: 'number',
        explain: { en: 'Maxwell said 340 and 318; 10,000 was Nehru’s later estimate.', hi: 'मैक्सवेल ने 340 और 318 कहा; 10,000 नेहरू का बाद का अंदाज़ा था।' },
        sources: [{ id: 'iar-1942', loc: 'September chronicle, 16 Sep' }, { id: 'nehru-1946', loc: 'p. 593' }],
      },
    ],
  },

  // Netaji, as knowledge the desk has, never as relayed content (r-axis) and never as the forger.
  {
    id: 'b42-netaji-g',
    tier: 2,
    real: true,
    pair: 'netaji',
    from: NEWSDESK,
    to: ANN,
    text: {
      en: 'Listeners keep asking: is this Netaji’s radio? No. Subhas Chandra Bose speaks from Germany, on Azad Hind Radio; we speak from inside India.',
      hi: 'सुनने वाले बार-बार पूछते हैं: क्या यह नेताजी का रेडियो है? नहीं। सुभाष चंद्र बोस जर्मनी से, आज़ाद हिंद रेडियो पर बोलते हैं; हम हिंदुस्तान के अंदर से बोलते हैं।',
    },
    checks: { en: ['Subhas Chandra Bose', 'speaks from Germany', 'Azad Hind Radio'], hi: ['सुभाष चंद्र बोस', 'जर्मनी से', 'आज़ाद हिंद रेडियो'] },
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
      en: 'Listeners keep asking: is this Netaji’s radio? No. Subhas Chandra Bose speaks from Singapore, on Azad Hind Radio; we speak from inside India.',
      hi: 'सुनने वाले बार-बार पूछते हैं: क्या यह नेताजी का रेडियो है? नहीं। सुभाष चंद्र बोस सिंगापुर से, आज़ाद हिंद रेडियो पर बोलते हैं; हम हिंदुस्तान के अंदर से बोलते हैं।',
    },
    checks: { en: ['Subhas Chandra Bose', 'speaks from Singapore', 'Azad Hind Radio'], hi: ['सुभाष चंद्र बोस', 'सिंगापुर से', 'आज़ाद हिंद रेडियो'] },
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
  {
    id: 'b42-discovery-f',
    tier: 3,
    real: false,
    from: SLIP,
    to: ANN,
    text: {
      en: 'News from Ahmednagar Fort: Pandit Nehru has finished writing his new book there, The Discovery of India.',
      hi: 'अहमदनगर क़िले से ख़बर: पंडित नेहरू ने वहाँ अपनी नई किताब ‘डिस्कवरी ऑफ़ इंडिया’ (भारत एक खोज) लिखकर पूरी कर ली है।',
    },
    checks: { en: ['Ahmednagar Fort', 'Pandit Nehru', 'The Discovery of India'], hi: ['अहमदनगर क़िले', 'पंडित नेहरू', 'डिस्कवरी ऑफ़ इंडिया'] },
    tells: [
      {
        kind: 'anachronism',
        explain: { en: 'He wrote it in Ahmednagar Fort, but in April–September 1944.', hi: 'किताब अहमदनगर क़िले में ही लिखी गई, पर अप्रैल-सितंबर 1944 में।' },
        sources: [{ id: 'nehru-1946', loc: 'Preface' }],
      },
    ],
  },

  {
    id: 'b42-kanaklata-g',
    tier: 2,
    real: true,
    from: { en: 'News slip, from Assam', hi: 'ख़बर की पर्ची, असम से' },
    to: ANN,
    text: {
      en: 'Remember Kanaklata Barua of Assam. On 20 September she led the march on Gohpur police station with the flag in her hands, and was shot.',
      hi: 'असम की कनकलता बरुआ को याद कीजिए। 20 सितंबर को वे हाथ में झंडा लेकर गोहपुर थाने की ओर जुलूस के आगे चलीं, और उन्हें गोली मार दी गई।',
    },
    checks: { en: ['Kanaklata Barua', '20 September', 'Gohpur police station'], hi: ['कनकलता बरुआ', '20 सितंबर', 'गोहपुर थाने'] },
    why: {
      text: {
        en: 'Kanaklata Barua, a teenage girl, was shot at Gohpur thana on 20 September 1942.',
        hi: 'किशोरी कनकलता बरुआ को 20 सितंबर 1942 को गोहपुर थाने पर गोली मारी गई।',
      },
      sources: [{ id: 'rebel-india-1946', loc: 'Assam section (Gohpur, Darrang district)' }],
    },
  },

  {
    id: 'b42-allah-bux-g',
    tier: 3,
    real: true,
    from: { en: 'News slip, from Sind', hi: 'ख़बर की पर्ची, सिंध से' },
    to: ANN,
    text: {
      en: 'Allah Bux gave back his British titles in protest: “Mr. Churchill’s speech shattered all hopes.” On 10 October the Governor sacked him as Sind’s Premier.',
      hi: 'अल्लाह बख़्श ने विरोध में अंग्रेज़ों के दिए ख़िताब लौटा दिए: “मिस्टर चर्चिल के भाषण ने सारी उम्मीदें तोड़ दीं।” 10 अक्टूबर को गवर्नर ने उन्हें सिंध के प्रीमियर (सरकार के मुखिया) के पद से हटा दिया।',
    },
    checks: { en: ['Allah Bux', 'British titles'], hi: ['अल्लाह बख़्श', 'ख़िताब'] },
    why: {
      text: {
        en: 'True: he gave up Khan Bahadur and O.B.E. in September; sacked 10 October.',
        hi: 'सच: सितंबर में उन्होंने ख़ान बहादुर और O.B.E. लौटाए; 10 अक्टूबर को हटाए गए।',
      },
      sources: [{ id: 'iar-1942', loc: 'September chronicle; October chronicle, 10 Oct' }],
    },
  },
]
