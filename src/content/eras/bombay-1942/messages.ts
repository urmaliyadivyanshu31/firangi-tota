import type { L10n, Message } from '../../types'

// Message pool for Bombay 1942. Genuine messages are written for the game unless they carry
// `document` (real broadcast or leaflet words from dossier §5, trimmed with "…"). Every forgery
// is a CID Special Branch plant (game fiction) with at least one tell.
//
// Window: day 1 = Fri 30 Oct 1942 ... day 14 = Thu 12 Nov 1942. Undated messages are true on any
// day of the window. onDay messages on days 1–3 are tier 1 (Easy keeps days 1–3 at tier 1).

const REC: L10n = { en: 'Recording station', hi: 'रिकॉर्डिंग स्टेशन' }
const SLIP: L10n = { en: 'News slip', hi: 'ख़बर की पर्ची' }
const COURIER: L10n = { en: 'Courier note', hi: 'हरकारे की पर्ची' }
const BULLETIN: L10n = { en: 'Bulletin office', hi: 'बुलेटिन दफ़्तर' }
const FILE: L10n = { en: 'Script file', hi: 'स्क्रिप्ट फ़ाइल' }
const SCRIPT: L10n = { en: 'Evening script', hi: 'शाम की स्क्रिप्ट' }
const ORGANISERS: L10n = { en: 'The organisers', hi: 'संगठन वाले' }
const LEAFLET: L10n = { en: 'Leaflet, for air', hi: 'पर्चा, रेडियो के लिए' }
const MORNING: L10n = { en: 'Morning script', hi: 'सुबह की स्क्रिप्ट' }

const ANN: L10n = { en: 'Announcer, 8:45 pm', hi: 'अनाउंसर, रात 8:45' }
const ANN_AM: L10n = { en: 'Announcer, morning', hi: 'अनाउंसर, सुबह' }

export const messages: Message[] = [
  // ───────────────────────── Tier 1: case-file catches ─────────────────────────

  // Day 1, Fri 30 Oct: the real broadcast of that night.
  {
    id: 'b42-d1-uncensored-g',
    tier: 1,
    real: true,
    pair: 'd1-uncensored',
    onDay: 1,
    from: REC,
    to: ANN,
    text: {
      en: 'Radio is the only place where you can find uncensored news.',
      hi: 'रेडियो ही वह जगह है जहाँ आपको बिना सेंसर की ख़बर मिल सकती है।',
    },
    checks: { en: ['uncensored news'], hi: ['बिना सेंसर की ख़बर'] },
    document: { sources: [{ id: 'huacuja-2023', loc: 'police transcript of 30 Oct 1942' }] },
    why: {
      text: {
        en: 'Real broadcast, from the police transcript of 30 October 1942.',
        hi: 'असली प्रसारण, 30 अक्टूबर 1942 के पुलिस रिकॉर्ड से।',
      },
      sources: [{ id: 'huacuja-2023', loc: 'police transcript of 30 Oct 1942' }],
    },
  },
  {
    id: 'b42-d1-uncensored-f',
    tier: 1,
    real: false,
    pair: 'd1-uncensored',
    onDay: 1,
    from: REC,
    to: ANN,
    text: {
      en: 'Radio is the only place where you can find uncensored news. Listen every night from 9:45 pm.',
      hi: 'रेडियो ही वह जगह है जहाँ आपको बिना सेंसर की ख़बर मिल सकती है। हर रात 9:45 बजे से सुनिए।',
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
      en: 'This week’s discs: Sardar Patel’s speech after the resolution, and Maulana Azad in his own voice.',
      hi: 'इस हफ़्ते के रिकॉर्ड: प्रस्ताव के बाद का सरदार पटेल का भाषण, और मौलाना आज़ाद की अपनी आवाज़।',
    },
    checks: { en: ['Sardar Patel’s speech', 'Maulana Azad'], hi: ['सरदार पटेल का भाषण', 'मौलाना आज़ाद'] },
    why: {
      text: {
        en: 'Police reports of late October 1942 record both going out.',
        hi: 'अक्टूबर 1942 के आख़िर के पुलिस रिकॉर्ड में दोनों दर्ज हैं।',
      },
      sources: [{ id: 'huacuja-2023', loc: 'n. 99 (published police reports, pp. 115 and 129)' }],
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
      en: 'This week’s discs: Sardar Patel’s speech after the resolution was passed at Azad Maidan, and Maulana Azad’s own voice.',
      hi: 'इस हफ़्ते के रिकॉर्ड: आज़ाद मैदान में प्रस्ताव पास होने के बाद सरदार पटेल का भाषण, और मौलाना आज़ाद की अपनी आवाज़।',
    },
    checks: { en: ['passed at Azad Maidan'], hi: ['आज़ाद मैदान में प्रस्ताव'] },
    tells: [
      {
        kind: 'place',
        explain: { en: 'Gowalia Tank Maidan, not Azad Maidan.', hi: 'गोवालिया टैंक मैदान, आज़ाद मैदान नहीं।' },
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
    checks: { en: ['43.24 metres'], hi: ['43.24 मीटर'] },
    tells: [
      {
        kind: 'number',
        explain: { en: '42.34 metres, not 43.24.', hi: '42.34 मीटर, 43.24 नहीं।' },
        factId: 'f-signature',
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
    checks: { en: ['Aruna Asaf Ali', 'Gowalia Tank Maidan'], hi: ['अरुणा आसफ़ अली', 'गोवालिया टैंक मैदान'] },
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
    checks: { en: ['Sarojini Naidu'], hi: ['सरोजिनी नायडू'] },
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
      en: 'On Saturday 8 August the AICC passed the Quit India resolution. Only 13 voted against. Then Gandhiji said: Do or Die.',
      hi: 'शनिवार 8 अगस्त को ऑल इंडिया कांग्रेस कमेटी ने ‘भारत छोड़ो’ प्रस्ताव पास किया। सिर्फ़ 13 ने विरोध किया। फिर गांधीजी बोले: करो या मरो।',
    },
    checks: { en: ['Saturday 8 August', 'Only 13'], hi: ['शनिवार 8 अगस्त', 'सिर्फ़ 13'] },
    why: {
      text: {
        en: 'Passed Saturday 8 August 1942, with “only 13 members” against.',
        hi: 'शनिवार 8 अगस्त 1942 को पास हुआ, “सिर्फ़ 13 सदस्य” विरोध में।',
      },
      sources: [{ id: 'iar-1942', loc: 'Chronicle p. 17' }, { id: 'gandhi-1942' }],
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
      en: 'On Saturday 8 August the AICC passed the Quit India resolution. Only 31 voted against. Then Gandhiji said: Do or Die.',
      hi: 'शनिवार 8 अगस्त को ऑल इंडिया कांग्रेस कमेटी ने ‘भारत छोड़ो’ प्रस्ताव पास किया। सिर्फ़ 31 ने विरोध किया। फिर गांधीजी बोले: करो या मरो।',
    },
    checks: { en: ['Only 31'], hi: ['सिर्फ़ 31'] },
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
      en: 'They came at 5 o’clock on Sunday morning, 9 August, and took our leaders across Bombay at one stroke.',
      hi: 'वे रविवार 9 अगस्त की सुबह 5 बजे आए और एक साथ पूरे बंबई में हमारे नेताओं को पकड़ ले गए।',
    },
    checks: { en: ['5 o’clock on Sunday morning'], hi: ['सुबह 5 बजे'] },
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
      en: 'They came on Saturday night, 8 August, the moment the meeting ended, and took our leaders across Bombay at one stroke.',
      hi: 'वे शनिवार 8 अगस्त की रात आए, बैठक ख़त्म होते ही, और एक साथ पूरे बंबई में हमारे नेताओं को पकड़ ले गए।',
    },
    checks: { en: ['Saturday night, 8 August'], hi: ['शनिवार 8 अगस्त की रात'] },
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
      en: 'Gandhiji is held at the Aga Khan Palace in Poona. The Working Committee is in Ahmednagar Fort.',
      hi: 'गांधीजी पूना के आग़ा ख़ान महल में बंद हैं। वर्किंग कमेटी अहमदनगर क़िले में है।',
    },
    checks: { en: ['Aga Khan Palace', 'Ahmednagar Fort'], hi: ['आग़ा ख़ान महल', 'अहमदनगर क़िले'] },
    why: {
      text: {
        en: 'Gandhi at the Aga Khan Palace, Poona; the Committee at Ahmednagar Fort.',
        hi: 'गांधी पूना के आग़ा ख़ान महल में, कमेटी अहमदनगर क़िले में।',
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
      en: 'Gandhiji is held in Yerwada jail in Poona. The Working Committee is in Ahmednagar Fort.',
      hi: 'गांधीजी पूना की यरवदा जेल में बंद हैं। वर्किंग कमेटी अहमदनगर क़िले में है।',
    },
    checks: { en: ['Yerwada jail'], hi: ['यरवदा जेल'] },
    tells: [
      {
        kind: 'place',
        explain: { en: 'The Aga Khan Palace, not Yerwada jail. Same city, wrong building.', hi: 'आग़ा ख़ान महल, यरवदा जेल नहीं। शहर वही, इमारत ग़लत।' },
        factId: 'f-detention',
        sources: [{ id: 'top-ii-1971', loc: 'Introduction p. xii; No. 553 (letter from Aga Khan’s Palace, 14 Aug 1942)' }],
      },
    ],
  },

  {
    id: 'b42-sites-g',
    tier: 1,
    real: true,
    pair: 'sites',
    from: COURIER,
    to: ANN,
    text: {
      en: 'Read, then burn. Nobody goes back to Laxmi Bhuvan on Sandhurst Road.',
      hi: 'पढ़कर जला दीजिए। सैंडहर्स्ट रोड वाले लक्ष्मी भुवन पर कोई वापस नहीं जाएगा।',
    },
    checks: { en: ['Laxmi Bhuvan on Sandhurst Road'], hi: ['सैंडहर्स्ट रोड वाले लक्ष्मी भुवन'] },
    why: {
      text: {
        en: 'Laxmi Bhuvan, Sandhurst Road, was a station site from 4 October 1942.',
        hi: 'लक्ष्मी भुवन, सैंडहर्स्ट रोड, 4 अक्टूबर 1942 से स्टेशन की जगह था।',
      },
      sources: [
        { id: 'huacuja-2023', loc: 'police list of sites (from Sengupta and Chatterjee 1988)' },
        { id: 'chatterjee-1989' },
      ],
    },
  },
  {
    id: 'b42-sites-f',
    tier: 1,
    real: false,
    pair: 'sites',
    from: COURIER,
    to: ANN,
    text: {
      en: 'Read, then burn. Nobody goes back to Laxmi Bhuvan on Hughes Road.',
      hi: 'पढ़कर जला दीजिए। ह्यूज़ रोड वाले लक्ष्मी भुवन पर कोई वापस नहीं जाएगा।',
    },
    checks: { en: ['Laxmi Bhuvan on Hughes Road'], hi: ['ह्यूज़ रोड वाले लक्ष्मी भुवन'] },
    tells: [
      {
        kind: 'place',
        explain: { en: 'Sandhurst Road, not Hughes Road.', hi: 'सैंडहर्स्ट रोड, ह्यूज़ रोड नहीं।' },
        factId: 'f-sites',
        sources: [{ id: 'huacuja-2023', loc: 'police list of sites' }],
      },
    ],
  },

  {
    id: 'b42-team-g',
    tier: 1,
    real: true,
    pair: 'team',
    from: REC,
    to: ANN,
    text: {
      en: 'Vithalbhai has labelled tonight’s discs in his own hand. Send the old ones back.',
      hi: 'विट्ठलभाई ने आज रात के रिकॉर्ड पर अपने हाथ से नाम लिखे हैं। पुराने वापस भेज दीजिए।',
    },
    checks: { en: ['Vithalbhai', 'in his own hand'], hi: ['विट्ठलभाई', 'अपने हाथ से'] },
    why: {
      text: {
        en: 'Vithalbhai Jhaveri ran recording; his hand was on the seized records.',
        hi: 'विट्ठलभाई झवेरी रिकॉर्डिंग देखते थे; ज़ब्त रिकॉर्डों पर उन्हीं की लिखावट थी।',
      },
      sources: [{ id: 'huacuja-2023', loc: 'trial' }, { id: 'chatterjee-1989' }],
    },
  },
  {
    id: 'b42-team-f',
    tier: 1,
    real: false,
    pair: 'team',
    from: REC,
    to: ANN,
    text: {
      en: 'Vithalbhai Patel has labelled tonight’s discs in his own hand. Send the old ones back.',
      hi: 'विट्ठलभाई पटेल ने आज रात के रिकॉर्ड पर अपने हाथ से नाम लिखे हैं। पुराने वापस भेज दीजिए।',
    },
    checks: { en: ['Vithalbhai Patel'], hi: ['विट्ठलभाई पटेल'] },
    tells: [
      {
        kind: 'name',
        explain: { en: 'Vithalbhai Jhaveri, not Vithalbhai Patel, who died in 1933.', hi: 'विट्ठलभाई झवेरी, विट्ठलभाई पटेल नहीं; उनकी मौत 1933 में हो चुकी थी।' },
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
      en: 'Two discs tonight: first the Hindustani news, then the English talk in Lohia’s voice.',
      hi: 'आज रात दो रिकॉर्ड: पहले हिंदुस्तानी में ख़बरें, फिर लोहिया की आवाज़ में अंग्रेज़ी भाषण।',
    },
    checks: { en: ['English talk in Lohia’s voice'], hi: ['लोहिया की आवाज़ में अंग्रेज़ी भाषण'] },
    why: {
      text: {
        en: 'Usha Mehta: most English speeches were relayed by Lohia and Coomi Dastur.',
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
      en: 'Two discs tonight: first the Hindustani news, then an English talk Pandit Nehru recorded for us this week.',
      hi: 'आज रात दो रिकॉर्ड: पहले हिंदुस्तानी में ख़बरें, फिर अंग्रेज़ी भाषण, जो पंडित नेहरू ने इसी हफ़्ते हमारे लिए रिकॉर्ड किया।',
    },
    checks: { en: ['recorded for us this week'], hi: ['इसी हफ़्ते हमारे लिए रिकॉर्ड किया'] },
    tells: [
      {
        kind: 'name',
        explain: { en: 'Nehru is locked in Ahmednagar Fort, not recording for us.', hi: 'नेहरू अहमदनगर क़िले में बंद हैं, हमारे लिए रिकॉर्ड नहीं कर रहे।' },
        factId: 'f-detention',
        sources: [{ id: 'top-ii-1971', loc: 'Introduction p. xii; No. 624' }],
      },
    ],
  },

  // Day 8, Fri 6 Nov: about a week before 12 Nov the police raided the radio shops.
  {
    id: 'b42-d8-shops-g',
    tier: 2,
    real: true,
    pair: 'd8-shops',
    onDay: 8,
    from: COURIER,
    to: ANN,
    text: {
      en: 'Police have raided the radio shops, Chicago Radio among them, and taken technicians. Send no one to buy parts.',
      hi: 'पुलिस ने रेडियो दुकानों पर छापा मारा है, शिकागो रेडियो पर भी, और मिस्त्री उठा ले गई है। पुर्ज़े ख़रीदने किसी को मत भेजिए।',
    },
    checks: { en: ['Chicago Radio'], hi: ['शिकागो रेडियो'] },
    why: {
      text: {
        en: 'About a week before 12 November, police raided Chicago Radio and others.',
        hi: '12 नवंबर से लगभग एक हफ़्ता पहले पुलिस ने शिकागो रेडियो समेत दुकानों पर छापे मारे।',
      },
      sources: [{ id: 'usha-mehta-1969' }, { id: 'thakkar-2021', loc: 'Scroll excerpt' }],
    },
  },
  {
    id: 'b42-d8-shops-f',
    tier: 2,
    real: false,
    pair: 'd8-shops',
    onDay: 8,
    from: COURIER,
    to: ANN,
    text: {
      en: 'Police have raided the radio shops, Calcutta Radio among them, and taken technicians. Send no one to buy parts.',
      hi: 'पुलिस ने रेडियो दुकानों पर छापा मारा है, कलकत्ता रेडियो पर भी, और मिस्त्री उठा ले गई है। पुर्ज़े ख़रीदने किसी को मत भेजिए।',
    },
    checks: { en: ['Calcutta Radio'], hi: ['कलकत्ता रेडियो'] },
    tells: [
      {
        kind: 'name',
        explain: { en: 'Chicago Radio, Motwane’s firm, not Calcutta Radio.', hi: 'शिकागो रेडियो, मोटवाने की कंपनी; कलकत्ता रेडियो नहीं।' },
        factId: 'f-team',
        sources: [{ id: 'usha-mehta-1969' }],
      },
    ],
  },

  {
    id: 'b42-opening2-g',
    tier: 2,
    real: true,
    pair: 'opening2',
    from: FILE,
    to: ANN,
    text: {
      en: 'This is Congress Radio calling from 42.34. … The entire world is aware that a ban has been laid on the publication of news nowadays.',
      hi: 'यह कांग्रेस रेडियो है, 42.34 से बोल रहा है। … पूरी दुनिया जानती है कि आजकल ख़बरें छापने पर पाबंदी लगी है।',
    },
    checks: { en: ['calling from 42.34', 'a ban has been laid'], hi: ['42.34 से बोल रहा है', 'पाबंदी लगी है'] },
    document: { sources: [{ id: 'chatterjee-1989', loc: 'police transcript of 20 Oct 1942' }] },
    why: {
      text: {
        en: 'Real broadcast, 20 October 1942. The ban: the press order of 8 August.',
        hi: 'असली प्रसारण, 20 अक्टूबर 1942। पाबंदी: 8 अगस्त का सरकारी हुक्म।',
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
    from: FILE,
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
    id: 'b42-weekday-g',
    tier: 2,
    real: true,
    pair: 'weekday',
    from: BULLETIN,
    to: ANN,
    text: {
      en: 'Tonight, {weekday} {date}, we go on air at 8:45 pm as always.',
      hi: 'आज रात, {weekday} {date}, हम हमेशा की तरह 8:45 बजे बोलेंगे।',
    },
    checks: { en: ['Tonight', '8:45 pm'], hi: ['आज रात', '8:45 बजे'] },
    why: {
      text: { en: 'The weekday matches the date.', hi: 'दिन और तारीख़ मेल खाते हैं।' },
      sources: [{ id: 'calendar-1942' }, { id: 'nehru-centre-2021' }],
    },
  },
  {
    id: 'b42-weekday-f',
    tier: 2,
    real: false,
    pair: 'weekday',
    from: BULLETIN,
    to: ANN,
    text: {
      en: 'Tonight, {weekday+1} {date}, we go on air at 8:45 pm as always.',
      hi: 'आज रात, {weekday+1} {date}, हम हमेशा की तरह 8:45 बजे बोलेंगे।',
    },
    checks: { en: ['Tonight'], hi: ['आज रात'] },
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
      en: 'Every man is free to go to the fullest length under Ahimsa… Satyagrahis should go out to die and not to live… Karenge Ya Marenge.',
      hi: 'अहिंसा के रास्ते पर हर आदमी पूरी हद तक जाने को आज़ाद है… सत्याग्रही मरने के लिए निकलें, जीने के लिए नहीं… करेंगे या मरेंगे।',
    },
    checks: { en: ['under Ahimsa', 'Karenge Ya Marenge'], hi: ['अहिंसा के रास्ते पर', 'करेंगे या मरेंगे'] },
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
    checks: { en: ['Mr. Gandhi', 'the disturbances'], hi: ['मिस्टर गांधी', 'गड़बड़ियों'] },
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
      en: 'So far we were conducting movements but now we are conducting a revolution. … This revolution is not of one party or community but of the whole nation.',
      hi: 'अब तक हम आंदोलन चला रहे थे, पर अब हम क्रांति चला रहे हैं। … यह क्रांति किसी एक पार्टी या एक समुदाय की नहीं, पूरे देश की है।',
    },
    checks: { en: ['of the whole nation'], hi: ['पूरे देश की है'] },
    document: { sources: [{ id: 'usha-mehta-1969' }] },
    why: {
      text: {
        en: 'Lohia on air, as Usha Mehta recalled in 1969.',
        hi: 'रेडियो पर लोहिया, जैसा उषा मेहता ने 1969 में याद किया।',
      },
      sources: [{ id: 'usha-mehta-1969' }],
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
      en: 'Before the talk, say: “Now hear Dr Ram Manohar Lohia, who recorded this tonight in this very building.”',
      hi: 'भाषण से पहले बोलिए: “अब सुनिए डॉ. राम मनोहर लोहिया को, जिन्होंने आज रात इसी इमारत में यह रिकॉर्ड किया।”',
    },
    checks: { en: ['Dr Ram Manohar Lohia', 'in this very building'], hi: ['डॉ. राम मनोहर लोहिया', 'इसी इमारत में'] },
    tells: [
      {
        kind: 'form',
        explain: { en: 'Never name the persons behind the stations, or where they are.', hi: 'स्टेशन के पीछे के लोगों का नाम या जगह, कभी नहीं।' },
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
      en: 'Report of soldiers shot in a camp up north. One messenger, no second source. Hold it until confirmed.',
      hi: 'उत्तर की किसी छावनी में सिपाहियों को गोली मारने की ख़बर। एक ही हरकारा, कोई दूसरा सबूत नहीं। पक्की होने तक इसे रोक कर रखिए।',
    },
    checks: { en: ['Hold it until confirmed'], hi: ['इसे रोक कर रखिए'] },
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
      en: 'No time to check this. Put it on air tonight: the Indian troops in Poona cantonment have joined the people.',
      hi: 'इसे जाँचने का वक़्त नहीं। आज रात रेडियो पर बोल दीजिए: पूना छावनी के हिंदुस्तानी सिपाही जनता से मिल गए हैं।',
    },
    checks: { en: ['No time to check'], hi: ['जाँचने का वक़्त नहीं'] },
    tells: [
      {
        kind: 'habit',
        explain: { en: 'Unconfirmed news is held back, not rushed on air.', hi: 'कच्ची ख़बर रोकी जाती है, जल्दी में सुनाई नहीं जाती।' },
        ruleId: 'r-confirm',
        sources: [{ id: 'chatterjee-1989', loc: 'police transcript of 26 Oct 1942' }],
      },
    ],
  },

  {
    id: 'b42-wartime-g',
    tier: 2,
    real: true,
    pair: 'wartime',
    from: BULLETIN,
    to: ANN,
    text: {
      en: 'For listeners setting watches: since 1 September, Indian Standard Time is six and a half hours ahead of Greenwich.',
      hi: 'घड़ी मिलाने वालों के लिए: 1 सितंबर से इंडियन स्टैंडर्ड टाइम ग्रीनविच से साढ़े छह घंटे आगे है।',
    },
    checks: { en: ['since 1 September', 'six and a half hours'], hi: ['1 सितंबर से', 'साढ़े छह घंटे'] },
    why: {
      text: {
        en: 'IST went one hour ahead from midnight, 31 August 1942.',
        hi: '31 अगस्त 1942 की आधी रात से इंडियन स्टैंडर्ड टाइम एक घंटा आगे हुआ।',
      },
      sources: [{ id: 'iar-1942', loc: 'August chronicle (time advanced from midnight of 31 Aug)' }],
    },
  },
  {
    id: 'b42-wartime-f',
    tier: 2,
    real: false,
    pair: 'wartime',
    from: BULLETIN,
    to: ANN,
    text: {
      en: 'For listeners setting watches: Indian Standard Time is five and a half hours ahead of Greenwich, as always.',
      hi: 'घड़ी मिलाने वालों के लिए: इंडियन स्टैंडर्ड टाइम ग्रीनविच से साढ़े पाँच घंटे आगे है, हमेशा की तरह।',
    },
    checks: { en: ['five and a half hours'], hi: ['साढ़े पाँच घंटे'] },
    tells: [
      {
        kind: 'number',
        explain: { en: 'Six and a half hours since 1 September, not five and a half.', hi: '1 सितंबर से साढ़े छह घंटे, साढ़े पाँच नहीं।' },
        ruleId: 'r-wartime',
        sources: [{ id: 'iar-1942', loc: 'August chronicle' }],
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
      en: 'Two new discs tonight. The old ones are worn out; a disc lasts eight or ten plays.',
      hi: 'आज रात दो नए रिकॉर्ड। पुराने घिस गए हैं; एक रिकॉर्ड 8 या 10 बार ही चलता है।',
    },
    checks: { en: ['eight or ten plays'], hi: ['8 या 10 बार'] },
    why: {
      text: {
        en: 'Abbas: a disc “could be played, I think, eight or ten times”.',
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
      en: 'Tonight’s talk comes on a tape spool. Thread it on the recorder before 8:45.',
      hi: 'आज रात का भाषण टेप की रील पर है। 8:45 से पहले उसे रिकॉर्डर पर चढ़ा दीजिए।',
    },
    checks: { en: ['tape spool'], hi: ['टेप की रील'] },
    tells: [
      {
        kind: 'anachronism',
        explain: { en: 'Home-cut gramophone discs, not tape. We had no tape recorders.', hi: 'घर पर काटे ग्रामोफ़ोन रिकॉर्ड, टेप नहीं। हमारे पास टेप रिकॉर्डर नहीं थे।' },
        ruleId: 'r-discs',
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
      en: 'Say it plainly before Vande Mataram: India has no enmity for the British or any other people.',
      hi: 'वंदे मातरम् से पहले साफ़ कहिए: भारत की अंग्रेज़ों से या किसी और से कोई दुश्मनी नहीं है।',
    },
    checks: { en: ['no enmity for the British'], hi: ['कोई दुश्मनी नहीं'] },
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
    checks: { en: ['Japanese army is India’s friend'], hi: ['जापानी फ़ौज हिंदुस्तान की दोस्त'] },
    tells: [
      {
        kind: 'habit',
        explain: { en: 'We never speak for Japan; that would brand us a fifth column.', hi: 'हम जापान की तरफ़ से कभी नहीं बोलते; इससे हम दुश्मन के साथी कहलाते।' },
        ruleId: 'r-axis',
        sources: [{ id: 'huacuja-2023', loc: 'judgment; Iyengar testimony' }],
      },
    ],
  },

  // Day 14, Thu 12 Nov: the morning broadcast, on the day of the raid.
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
    checks: {
      en: ['Never talk of the persons behind the stations'],
      hi: ['पीछे के लोगों की बात कभी मत कीजिए'],
    },
    document: { sources: [{ id: 'huacuja-2023', loc: 'nn. 90, 129 (transcript of 12 Nov 1942 morning, from Thakkar p. 137)' }] },
    why: {
      text: {
        en: 'Real broadcast, the morning of 12 November 1942, the day of the raid.',
        hi: 'असली प्रसारण, 12 नवंबर 1942 की सुबह, जिस दिन छापा पड़ा।',
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
    checks: {
      en: ['Babubhai Khakhar and Vithalbhai Jhaveri'],
      hi: ['बाबूभाई खाखर और विट्ठलभाई झवेरी'],
    },
    tells: [
      {
        kind: 'form',
        explain: { en: 'Never name the persons behind the stations, least of all on air.', hi: 'स्टेशन के पीछे के लोगों के नाम कभी नहीं, रेडियो पर तो बिल्कुल नहीं।' },
        ruleId: 'r-nonames',
        sources: [{ id: 'huacuja-2023', loc: 'n. 90 (transcript of 12 Nov 1942 morning)' }],
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
      en: 'The special train left Bombay at 7:15 am on Sunday 9 August. Gandhiji’s party was taken off at Chinchwad, short of Poona.',
      hi: 'ख़ास ट्रेन रविवार 9 अगस्त को सुबह 7:15 पर बंबई से चली। गांधीजी और उनके साथी पूना से पहले चिंचवड़ में उतारे गए।',
    },
    checks: { en: ['taken off at Chinchwad'], hi: ['चिंचवड़ में उतारे गए'] },
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
      en: 'The special train left Bombay at 7:15 am on Sunday 9 August. Gandhiji’s party was taken off at Kalyan.',
      hi: 'ख़ास ट्रेन रविवार 9 अगस्त को सुबह 7:15 पर बंबई से चली। गांधीजी और उनके साथी कल्याण में उतारे गए।',
    },
    checks: { en: ['taken off at Kalyan'], hi: ['कल्याण में उतारे गए'] },
    tells: [
      {
        kind: 'place',
        explain: { en: 'Chinchwad, short of Poona, not Kalyan, barely out of Bombay.', hi: 'चिंचवड़, पूना से पहले; कल्याण नहीं, जो बंबई से निकलते ही आता है।' },
        factId: 'f-train',
        sources: [{ id: 'top-ii-1971', loc: 'No. 624, p. 807' }],
      },
    ],
  },

  {
    id: 'b42-wavelength-f',
    tier: 2,
    real: false,
    pair: 'wavelength',
    from: SCRIPT,
    to: ANN,
    text: {
      en: 'In late August we broadcast on 41.87 metres. Now listen for us on 42.34.',
      hi: 'अगस्त के आख़िर में हम 41.87 मीटर पर थे। अब हमें 42.34 पर सुनिए।',
    },
    checks: { en: ['41.87 metres'], hi: ['41.87 मीटर'] },
    tells: [
      {
        kind: 'number',
        explain: { en: '41.78 metres in late August, not 41.87.', hi: 'अगस्त के आख़िर में 41.78 मीटर, 41.87 नहीं।' },
        factId: 'f-signature',
        sources: [{ id: 'chatterjee-1989', loc: 'Home Dept record (on air 27 Aug 1942 on 41.78 m)' }],
      },
    ],
  },

  // ───────────────────────── Tier 3: knowledge tells, and genuine ones that look wrong ─────────────────────────

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
      hi: 'बिहार से ख़बर: जयप्रकाश नारायण हज़ारीबाग़ जेल से भाग निकले हैं और छिपकर काम में लग गए हैं।',
    },
    checks: { en: ['Hazaribagh Jail'], hi: ['हज़ारीबाग़ जेल'] },
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
      hi: 'अभी-अभी ख़बर आई: जयप्रकाश नारायण देवली कैंप से भाग निकले हैं और छिपकर काम में लग गए हैं।',
    },
    checks: { en: ['Deoli camp'], hi: ['देवली कैंप'] },
    tells: [
      {
        kind: 'knowledge',
        explain: { en: 'Hazaribagh Jail, not Deoli, where he was held in 1941.', hi: 'हज़ारीबाग़ जेल, देवली नहीं; देवली में वे 1941 में बंद थे।' },
        sources: [{ id: 'iar-1942', loc: 'official report of the disturbances, reprinted, p. 190' }],
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
      en: 'Babubhai says get the August cash memos out of the flat: amplifier, pick-up and volume control, Rs 599-8-0; microphone, Rs 250, billed to “Messrs Babubhai & Co”.',
      hi: 'बाबूभाई कहते हैं अगस्त की नक़द रसीदें फ़्लैट से हटाइए: एम्प्लीफ़ायर, पिक-अप और वॉल्यूम कंट्रोल, रु. 599-8-0; माइक्रोफ़ोन, रु. 250, “मेसर्स बाबूभाई एंड कंपनी” के नाम।',
    },
    checks: { en: ['Rs 599-8-0', 'Messrs Babubhai & Co'], hi: ['रु. 599-8-0', 'मेसर्स बाबूभाई एंड कंपनी'] },
    why: {
      text: {
        en: 'Court record: Rs 599-8-0 (14 August); Rs 250, billed to a fake firm.',
        hi: 'अदालत का रिकॉर्ड: रु. 599-8-0 (14 अगस्त); रु. 250, नक़ली कंपनी के नाम।',
      },
      sources: [{ id: 'thakkar-2021', loc: 'Scroll excerpt (court record)' }],
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
      en: 'Babubhai says get the August cash memos out of the flat: amplifier, pick-up and volume control, Rs 599.50; microphone, Rs 250, billed to “Messrs Babubhai & Co”.',
      hi: 'बाबूभाई कहते हैं अगस्त की नक़द रसीदें फ़्लैट से हटाइए: एम्प्लीफ़ायर, पिक-अप और वॉल्यूम कंट्रोल, रु. 599.50; माइक्रोफ़ोन, रु. 250, “मेसर्स बाबूभाई एंड कंपनी” के नाम।',
    },
    checks: { en: ['Rs 599.50'], hi: ['रु. 599.50'] },
    tells: [
      {
        kind: 'anachronism',
        explain: { en: 'Rs 599-8-0, not 599.50. Decimal rupees are fifteen years away.', hi: 'रु. 599-8-0, 599.50 नहीं। दशमलव वाला रुपया अभी 15 साल दूर है।' },
        factId: 'f-money',
        sources: [{ id: 'thakkar-2021', loc: 'Scroll excerpt (court record)' }],
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
      hi: 'तमलुक की मातंगिनी हाज़रा को याद कीजिए, जिन्हें 29 सितंबर को जुलूस की अगुवाई करते हुए गोली मारी गई। वे 73 साल की थीं।',
    },
    checks: { en: ['She was 73', '29 September'], hi: ['73 साल', '29 सितंबर'] },
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
      hi: 'तमलुक की मातंगिनी हाज़रा को याद कीजिए, जिन्हें 29 सितंबर को जुलूस की अगुवाई करते हुए गोली मारी गई। वे 37 साल की थीं।',
    },
    checks: { en: ['She was 37'], hi: ['37 साल'] },
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
    id: 'b42-megacycles-g',
    tier: 3,
    real: true,
    pair: 'megacycles',
    from: BULLETIN,
    to: ANN,
    text: {
      en: 'For dials marked in megacycles: 42.34 metres is about 7.08 megacycles. If we fade, move between 39 and 43 metres.',
      hi: 'मेगासाइकिल वाली सुई के लिए: 42.34 मीटर यानी लगभग 7.08 मेगासाइकिल। आवाज़ धीमी पड़े तो 39 से 43 मीटर के बीच घुमाइए।',
    },
    checks: { en: ['7.08 megacycles', 'between 39 and 43 metres'], hi: ['7.08 मेगासाइकिल', '39 से 43 मीटर'] },
    why: {
      text: {
        en: 'About 7.08 megacycles, yes; “Move between 39 and 43 meters” went out 18 October.',
        hi: 'हाँ, लगभग 7.08 मेगासाइकिल; “39 से 43 मीटर के बीच घुमाइए” 18 अक्टूबर को कहा गया।',
      },
      sources: [{ id: 'huacuja-2023', loc: 'police transcript of 18 Oct 1942' }, { id: 'chatterjee-1989' }],
    },
  },
  {
    id: 'b42-megacycles-f',
    tier: 3,
    real: false,
    pair: 'megacycles',
    from: BULLETIN,
    to: ANN,
    text: {
      en: 'For modern sets: 42.34 metres is about 7.08 MHz on your FM dial. If we fade, move between 39 and 43 metres.',
      hi: 'नए सेट के लिए: 42.34 मीटर यानी आपके FM डायल पर लगभग 7.08 मेगाहर्ट्ज़। आवाज़ धीमी पड़े तो 39 से 43 मीटर के बीच घुमाइए।',
    },
    checks: { en: ['7.08 MHz', 'FM dial'], hi: ['7.08 मेगाहर्ट्ज़', 'FM डायल'] },
    tells: [
      {
        kind: 'anachronism',
        explain: {
          en: 'Megacycles, not MHz (hertz became standard in 1960); shortwave, not FM.',
          hi: 'मेगासाइकिल, मेगाहर्ट्ज़ नहीं (हर्ट्ज़ 1960 में मानी हुई इकाई बना); शॉर्टवेव, FM नहीं।',
        },
        sources: [{ id: 'huacuja-2023', loc: 'n. 85 (police report, “6.55 MC”)' }, { id: 'chatterjee-1989' }],
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
      en: 'Even their Home Member admits it: on 16 September Maxwell told the Assembly police firing had killed 340, the military 318.',
      hi: 'उनके होम मेंबर भी मानते हैं: 16 सितंबर को मैक्सवेल ने असेंबली में बताया कि पुलिस की गोलियों से 340 मरे, फ़ौज के हाथों 318।',
    },
    checks: { en: ['Home Member', '340', '318'], hi: ['होम मेंबर', '340', '318'] },
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
      en: 'Even the Viceroy admits it: on 16 September Lord Wavell told the Assembly police firing had killed 340, the military 318.',
      hi: 'वायसराय भी मानते हैं: 16 सितंबर को लॉर्ड वेवल ने असेंबली में बताया कि पुलिस की गोलियों से 340 मरे, फ़ौज के हाथों 318।',
    },
    checks: { en: ['Lord Wavell'], hi: ['लॉर्ड वेवल'] },
    tells: [
      {
        kind: 'knowledge',
        explain: { en: 'Home Member Maxwell, not Wavell; the Viceroy was Linlithgow.', hi: 'होम मेंबर मैक्सवेल, वेवल नहीं; वायसराय लिनलिथगो थे।' },
        sources: [
          { id: 'iar-1942', loc: 'September chronicle, 16 Sep' },
          { id: 'top-ii-1971', loc: 'No. 662; front matter (Executive Council: General Sir Archibald Wavell, C-in-C)' },
        ],
      },
    ],
  },

  {
    id: 'b42-wavelength-g',
    tier: 3,
    real: true,
    pair: 'wavelength',
    from: SCRIPT,
    to: ANN,
    text: {
      en: 'In late August we broadcast on 41.78 metres. Now listen for us on 42.34.',
      hi: 'अगस्त के आख़िर में हम 41.78 मीटर पर थे। अब हमें 42.34 पर सुनिए।',
    },
    checks: { en: ['41.78 metres'], hi: ['41.78 मीटर'] },
    why: {
      text: {
        en: 'Police: 41.78 m on 27 August. Usha Mehta: 42.34 from the start. Both real.',
        hi: 'पुलिस: 27 अगस्त को 41.78 मीटर। उषा मेहता: शुरू से 42.34। दोनों असली।',
      },
      sources: [
        { id: 'chatterjee-1989', loc: 'Home Dept record (on air 27 Aug 1942 on 41.78 m); transcript of 20 Oct 1942' },
        { id: 'nehru-centre-2021' },
        { id: 'usha-mehta-1969' },
      ],
    },
  },

  {
    id: 'b42-allah-bux-g',
    tier: 3,
    real: true,
    from: { en: 'News slip, from Sind', hi: 'ख़बर की पर्ची, सिंध से' },
    to: ANN,
    text: {
      en: 'Sind’s Premier Allah Bux gave back his British titles in protest. “Mr. Churchill’s speech shattered all hopes,” he said.',
      hi: 'सिंध के प्रीमियर (सूबे की सरकार के मुखिया) अल्लाह बख़्श ने विरोध में अपने अंग्रेज़ी ख़िताब लौटा दिए। बोले, “मिस्टर चर्चिल के भाषण ने सारी उम्मीदें तोड़ दीं।”',
    },
    checks: { en: ['Allah Bux', 'British titles'], hi: ['अल्लाह बख़्श', 'अंग्रेज़ी ख़िताब'] },
    why: {
      text: {
        en: 'True: Allah Bux renounced Khan Bahadur and O.B.E. in September 1942.',
        hi: 'सच: अल्लाह बख़्श ने सितंबर 1942 में ख़ान बहादुर और O.B.E. लौटाए।',
      },
      sources: [{ id: 'iar-1942', loc: 'September chronicle; October chronicle, 10 Oct' }],
    },
  },
]
