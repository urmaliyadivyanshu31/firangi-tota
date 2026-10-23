import type { L10n, Message } from '../../types'

// Message pool for Bombay 1942. Genuine messages are written for the game unless they carry
// `document` (real broadcast or leaflet words from dossier §5). Every forgery is a CID Special
// Branch plant (game fiction) and carries at least one tell.
//
// Window: day 1 = Fri 30 Oct 1942 ... day 14 = Thu 12 Nov 1942. Undated messages are true on any
// day of the window. onDay messages on days 1–3 are tier 1 (Easy keeps days 1–3 at tier 1).

const REC: L10n = { en: 'Recording station', hi: 'रिकॉर्डिंग स्टेशन' }
const SLIP: L10n = { en: 'News slip, by special messenger', hi: 'ख़बर की पर्ची, ख़ास हरकारे से' }
const COURIER: L10n = { en: 'Courier note', hi: 'हरकारे की पर्ची' }
const BULLETIN: L10n = { en: 'Bulletin office', hi: 'बुलेटिन दफ़्तर' }
const FILE: L10n = { en: 'Script file', hi: 'स्क्रिप्ट फ़ाइल' }
const SCRIPT: L10n = { en: 'Script, evening programme', hi: 'स्क्रिप्ट, शाम का प्रोग्राम' }
const ORGANISERS: L10n = { en: 'The organisers', hi: 'संगठन वाले' }
const LEAFLET: L10n = { en: 'Leaflet, to read on air', hi: 'पर्चा, रेडियो पर पढ़ने के लिए' }

const ANN: L10n = { en: 'Announcer, 8:45 pm', hi: 'अनाउंसर, रात 8:45' }
const ANN_AM: L10n = { en: 'Announcer, morning programme', hi: 'अनाउंसर, सुबह का प्रोग्राम' }

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
        en: 'Real broadcast words. The Bombay police took down this line from Congress Radio on 30 October 1942.',
        hi: 'यह असली प्रसारण के शब्द हैं। बंबई पुलिस ने 30 अक्टूबर 1942 को कांग्रेस रेडियो से यह पंक्ति लिखी थी।',
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
      en: 'Radio is the only place where you can find uncensored news. Listen to us every night from 9:45 pm.',
      hi: 'रेडियो ही वह जगह है जहाँ आपको बिना सेंसर की ख़बर मिल सकती है। हमें हर रात 9:45 बजे से सुनिए।',
    },
    checks: { en: ['9:45 pm'], hi: ['9:45 बजे'] },
    tells: [
      {
        kind: 'number',
        explain: {
          en: 'We go on air at 8:45 pm, not 9:45. The forger copied our line and got our hour wrong.',
          hi: 'हम रात 8:45 बजे बोलते हैं, 9:45 पर नहीं। जालसाज़ ने हमारी पंक्ति तो नक़ल कर ली, पर हमारा समय ग़लत लिख दिया।',
        },
        factId: 'f-signature',
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
      en: 'This week’s discs: Sardar Patel’s speech after the resolution, and Maulana Azad in his own voice. Play them after the news.',
      hi: 'इस हफ़्ते के रिकॉर्ड: प्रस्ताव के बाद का सरदार पटेल का भाषण, और मौलाना आज़ाद की अपनी आवाज़। इन्हें ख़बरों के बाद बजाइए।',
    },
    checks: { en: ['Sardar Patel’s speech', 'Maulana Azad'], hi: ['सरदार पटेल का भाषण', 'मौलाना आज़ाद'] },
    why: {
      text: {
        en: 'Police transcripts of late October 1942 (the published police reports, pp. 115 and 129) record Congress Radio airing Patel’s speech after the resolution and a recording of Azad in his own voice.',
        hi: 'अक्टूबर 1942 के आख़िर के छपे पुलिस रिकॉर्ड (पेज 115 और 129) बताते हैं कि कांग्रेस रेडियो ने प्रस्ताव के बाद का पटेल का भाषण और आज़ाद की अपनी आवाज़ की रिकॉर्डिंग चलाई।',
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
      en: 'This week’s discs: Sardar Patel’s speech after the resolution was passed at Azad Maidan, and Maulana Azad in his own voice.',
      hi: 'इस हफ़्ते के रिकॉर्ड: आज़ाद मैदान में प्रस्ताव पास होने के बाद सरदार पटेल का भाषण, और मौलाना आज़ाद की अपनी आवाज़।',
    },
    checks: { en: ['passed at Azad Maidan'], hi: ['आज़ाद मैदान में प्रस्ताव'] },
    tells: [
      {
        kind: 'place',
        explain: {
          en: 'The resolution was passed at Gowalia Tank Maidan, not Azad Maidan. One famous name led the forger to the wrong ground.',
          hi: 'प्रस्ताव गोवालिया टैंक मैदान में पास हुआ था, आज़ाद मैदान में नहीं। एक मशहूर नाम जालसाज़ को ग़लत मैदान में ले गया।',
        },
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
        en: 'These are the station’s real opening words, as Usha Mehta remembered them: “This is the Congress Radio calling on 42.34 metres from somewhere in India.” Its news went out mainly in Hindustani.',
        hi: 'यह स्टेशन के असली शुरुआती शब्द हैं, जैसे उषा मेहता को याद थे: “यह कांग्रेस रेडियो है, 42.34 मीटर पर, हिंदुस्तान में कहीं से बोल रहा है।” ख़बरें ज़्यादातर हिंदुस्तानी में जाती थीं।',
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
        explain: {
          en: 'We call on 42.34 metres. 43.24 swaps the digits round, and no one at this desk misreads their own dial.',
          hi: 'हम 42.34 मीटर पर बोलते हैं। 43.24 में अंक आपस में बदल गए हैं, और इस मेज़ पर कोई अपनी ही सुई ग़लत नहीं पढ़ता।',
        },
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
      en: 'Remember the morning of 9 August. Our leaders were taken at dawn, and still Aruna Asaf Ali raised the Congress flag at Gowalia Tank Maidan. The police answered with tear gas, then lathis.',
      hi: '9 अगस्त की सुबह याद कीजिए। तड़के हमारे नेता ले जाए गए, फिर भी अरुणा आसफ़ अली ने गोवालिया टैंक मैदान में कांग्रेस का झंडा फहराया। पुलिस ने आँसू गैस छोड़ी, फिर लाठियाँ चलाईं।',
    },
    checks: { en: ['Aruna Asaf Ali', 'Gowalia Tank Maidan'], hi: ['अरुणा आसफ़ अली', 'गोवालिया टैंक मैदान'] },
    why: {
      text: {
        en: 'On 9 August 1942, after the dawn arrests, Aruna Asaf Ali raised the flag at Gowalia Maidan. The police used tear gas, then lathis.',
        hi: '9 अगस्त 1942 को, तड़के की गिरफ़्तारियों के बाद, अरुणा आसफ़ अली ने गोवालिया मैदान में झंडा फहराया। पुलिस ने आँसू गैस छोड़ी, फिर लाठियाँ चलाईं।',
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
      en: 'Remember the morning of 9 August. Our leaders were taken at dawn, and still Sarojini Naidu raised the Congress flag at Gowalia Tank Maidan. The police answered with tear gas, then lathis.',
      hi: '9 अगस्त की सुबह याद कीजिए। तड़के हमारे नेता ले जाए गए, फिर भी सरोजिनी नायडू ने गोवालिया टैंक मैदान में कांग्रेस का झंडा फहराया। पुलिस ने आँसू गैस छोड़ी, फिर लाठियाँ चलाईं।',
    },
    checks: { en: ['Sarojini Naidu'], hi: ['सरोजिनी नायडू'] },
    tells: [
      {
        kind: 'name',
        explain: {
          en: 'It was Aruna Asaf Ali who raised the flag at Gowalia Tank that morning. The forger put the wrong leader at the flagpole.',
          hi: 'उस सुबह गोवालिया टैंक पर झंडा अरुणा आसफ़ अली ने फहराया था। जालसाज़ ने झंडे के पास ग़लत नेता खड़ा कर दिया।',
        },
        factId: 'f-zero-hour',
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
      en: 'On Saturday 8 August the AICC passed the Quit India resolution at Gowalia Tank Maidan. Only 13 voted against. Then Gandhiji gave us the mantra: Do or Die.',
      hi: 'शनिवार 8 अगस्त को गोवालिया टैंक मैदान में ऑल इंडिया कांग्रेस कमेटी ने ‘भारत छोड़ो’ प्रस्ताव पास किया। सिर्फ़ 13 लोगों ने विरोध में वोट दिया। फिर गांधीजी ने हमें मंत्र दिया: करो या मरो।',
    },
    checks: { en: ['Saturday 8 August', 'Only 13'], hi: ['शनिवार 8 अगस्त', 'सिर्फ़ 13'] },
    why: {
      text: {
        en: 'The resolution passed on Saturday 8 August 1942 with “only 13 members” against it, and Gandhi’s mantra that night was “Do or Die”.',
        hi: 'प्रस्ताव शनिवार 8 अगस्त 1942 को पास हुआ, “सिर्फ़ 13 सदस्यों” ने विरोध किया, और उस रात गांधी का मंत्र था “करो या मरो”।',
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
      en: 'On Saturday 8 August the AICC passed the Quit India resolution at Gowalia Tank Maidan. Only 31 voted against. Then Gandhiji gave us the mantra: Do or Die.',
      hi: 'शनिवार 8 अगस्त को गोवालिया टैंक मैदान में ऑल इंडिया कांग्रेस कमेटी ने ‘भारत छोड़ो’ प्रस्ताव पास किया। सिर्फ़ 31 लोगों ने विरोध में वोट दिया। फिर गांधीजी ने हमें मंत्र दिया: करो या मरो।',
    },
    checks: { en: ['Only 31'], hi: ['सिर्फ़ 31'] },
    tells: [
      {
        kind: 'number',
        explain: {
          en: 'Only 13 voted against, not 31. The forger turned the number round.',
          hi: 'विरोध में सिर्फ़ 13 वोट पड़े थे, 31 नहीं। जालसाज़ ने अंक उलट दिए।',
        },
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
      en: 'They came at 5 o’clock on Sunday morning, 9 August. About sixty police parties took our leaders across Bombay at one stroke, and a special train had them out of the city by 7:15.',
      hi: 'वे रविवार 9 अगस्त की सुबह 5 बजे आए। लगभग 60 पुलिस टोलियों ने एक साथ पूरे बंबई में हमारे नेताओं को पकड़ा, और 7:15 तक एक ख़ास ट्रेन उन्हें शहर से बाहर ले गई।',
    },
    checks: { en: ['5 o’clock on Sunday morning', '7:15'], hi: ['सुबह 5 बजे', '7:15'] },
    why: {
      text: {
        en: 'The Governor of Bombay reported that the arrests began at 5:00 a.m. on 9 August with about sixty police parties, and that the special train left at 7:15 a.m.',
        hi: 'बंबई के गवर्नर ने लिखा कि गिरफ़्तारियाँ 9 अगस्त सुबह 5 बजे लगभग 60 पुलिस टोलियों से शुरू हुईं, और ख़ास ट्रेन सुबह 7:15 पर चली।',
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
      en: 'They came on Saturday night, 8 August, the moment the meeting ended. About sixty police parties took our leaders across Bombay at one stroke.',
      hi: 'वे शनिवार 8 अगस्त की रात आए, बैठक ख़त्म होते ही। लगभग 60 पुलिस टोलियों ने एक साथ पूरे बंबई में हमारे नेताओं को पकड़ा।',
    },
    checks: { en: ['Saturday night, 8 August'], hi: ['शनिवार 8 अगस्त की रात'] },
    tells: [
      {
        kind: 'date',
        explain: {
          en: 'In Bombay the arrests began at 5 a.m. on Sunday 9 August, not on the night of the 8th. It is a common mistake, and the forger made it.',
          hi: 'बंबई में गिरफ़्तारियाँ रविवार 9 अगस्त सुबह 5 बजे शुरू हुईं, 8 की रात को नहीं। यह आम ग़लती है, और जालसाज़ ने भी यही की।',
        },
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
      en: 'Where are our leaders? Gandhiji is held at the Aga Khan Palace in Poona. The Working Committee is locked up in Ahmednagar Fort.',
      hi: 'हमारे नेता कहाँ हैं? गांधीजी पूना के आग़ा ख़ान महल में बंद हैं। वर्किंग कमेटी अहमदनगर क़िले में बंद है।',
    },
    checks: { en: ['Aga Khan Palace', 'Ahmednagar Fort'], hi: ['आग़ा ख़ान महल', 'अहमदनगर क़िले'] },
    why: {
      text: {
        en: 'After the arrests Gandhi was taken to the Aga Khan Palace, Poona, and the Working Committee to Ahmednagar Fort.',
        hi: 'गिरफ़्तारी के बाद गांधी को पूना के आग़ा ख़ान महल ले जाया गया, और वर्किंग कमेटी को अहमदनगर क़िले।',
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
      en: 'Where are our leaders? Gandhiji is held in Yerwada jail in Poona. The Working Committee is locked up in Ahmednagar Fort.',
      hi: 'हमारे नेता कहाँ हैं? गांधीजी पूना की यरवदा जेल में बंद हैं। वर्किंग कमेटी अहमदनगर क़िले में बंद है।',
    },
    checks: { en: ['Yerwada jail'], hi: ['यरवदा जेल'] },
    tells: [
      {
        kind: 'place',
        explain: {
          en: 'In 1942 Gandhiji was held at the Aga Khan Palace, not in Yerwada jail. Same city, wrong building.',
          hi: '1942 में गांधीजी आग़ा ख़ान महल में बंद थे, यरवदा जेल में नहीं। शहर वही, इमारत ग़लत।',
        },
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
      en: 'Read, then burn. Nobody goes back to the old flat at Laxmi Bhuvan on Sandhurst Road. The discs come to the usual place only.',
      hi: 'पढ़कर जला दीजिए। सैंडहर्स्ट रोड पर लक्ष्मी भुवन वाले पुराने फ़्लैट पर कोई वापस नहीं जाएगा। रिकॉर्ड सिर्फ़ हमेशा वाली जगह पर आएँगे।',
    },
    checks: { en: ['Laxmi Bhuvan on Sandhurst Road'], hi: ['सैंडहर्स्ट रोड पर लक्ष्मी भुवन'] },
    why: {
      text: {
        en: 'Laxmi Bhuvan on Sandhurst Road was one of the station’s sites from 4 October 1942, before the move to Parekh Wadi on 15 October.',
        hi: 'सैंडहर्स्ट रोड का लक्ष्मी भुवन 4 अक्टूबर 1942 से स्टेशन की एक जगह था, 15 अक्टूबर को पारेख वाड़ी जाने से पहले।',
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
      en: 'Read, then burn. Nobody goes back to the old flat at Laxmi Bhuvan on Hughes Road. The discs come to the usual place only.',
      hi: 'पढ़कर जला दीजिए। ह्यूज़ रोड पर लक्ष्मी भुवन वाले पुराने फ़्लैट पर कोई वापस नहीं जाएगा। रिकॉर्ड सिर्फ़ हमेशा वाली जगह पर आएँगे।',
    },
    checks: { en: ['Laxmi Bhuvan on Hughes Road'], hi: ['ह्यूज़ रोड पर लक्ष्मी भुवन'] },
    tells: [
      {
        kind: 'place',
        explain: {
          en: 'Laxmi Bhuvan is on Sandhurst Road. A courier of ours would never send it to Hughes Road.',
          hi: 'लक्ष्मी भुवन सैंडहर्स्ट रोड पर है। हमारा हरकारा उसे कभी ह्यूज़ रोड पर नहीं भेजता।',
        },
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
      en: 'Vithalbhai has labelled tonight’s discs in his own hand: one for the news, one for the talk. Send the old ones back with the courier.',
      hi: 'विट्ठलभाई ने आज रात के रिकॉर्ड पर अपने हाथ से नाम लिखे हैं: एक ख़बरों का, एक भाषण का। पुराने रिकॉर्ड हरकारे के साथ वापस भेज दीजिए।',
    },
    checks: { en: ['Vithalbhai', 'in his own hand'], hi: ['विट्ठलभाई', 'अपने हाथ से'] },
    why: {
      text: {
        en: 'Vithalbhai Jhaveri ran the recording side, and his handwriting was on the gramophone records the police later seized.',
        hi: 'विट्ठलभाई झवेरी रिकॉर्डिंग सँभालते थे, और पुलिस ने बाद में जो ग्रामोफ़ोन रिकॉर्ड ज़ब्त किए, उन पर उन्हीं की लिखावट थी।',
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
      en: 'Vithalbhai Patel has labelled tonight’s discs in his own hand: one for the news, one for the talk. Send the old ones back with the courier.',
      hi: 'विट्ठलभाई पटेल ने आज रात के रिकॉर्ड पर अपने हाथ से नाम लिखे हैं: एक ख़बरों का, एक भाषण का। पुराने रिकॉर्ड हरकारे के साथ वापस भेज दीजिए।',
    },
    checks: { en: ['Vithalbhai Patel'], hi: ['विट्ठलभाई पटेल'] },
    tells: [
      {
        kind: 'name',
        explain: {
          en: 'Our recording is run by Vithalbhai Jhaveri. Vithalbhai Patel, Sardar Patel’s elder brother, had died in 1933. The forger reached for the most famous Vithalbhai he knew.',
          hi: 'हमारी रिकॉर्डिंग विट्ठलभाई झवेरी सँभालते हैं। सरदार पटेल के बड़े भाई विट्ठलभाई पटेल की मौत 1933 में हो चुकी थी। जालसाज़ को जो सबसे मशहूर विट्ठलभाई याद आए, उसने वही लिख दिया।',
        },
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
      en: 'Two discs tonight. First, the Hindustani news. Second, the English talk in Lohia’s voice.',
      hi: 'आज रात दो रिकॉर्ड हैं। पहला, हिंदुस्तानी में ख़बरें। दूसरा, लोहिया की आवाज़ में अंग्रेज़ी भाषण।',
    },
    checks: { en: ['English talk in Lohia’s voice'], hi: ['लोहिया की आवाज़ में अंग्रेज़ी भाषण'] },
    why: {
      text: {
        en: 'Usha Mehta said most of the station’s English speeches were relayed by Ram Manohar Lohia and Coomi Dastur. Its Hindustani voices included her own, Moinuddin Harris and Achyut Patwardhan.',
        hi: 'उषा मेहता के मुताबिक़ स्टेशन के ज़्यादातर अंग्रेज़ी भाषण राम मनोहर लोहिया और कूमी दस्तूर पढ़ते थे। हिंदुस्तानी में वे ख़ुद, मोइनुद्दीन हैरिस और अच्युत पटवर्धन बोलते थे।',
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
      en: 'Two discs tonight. First, the Hindustani news. Second, an English talk Pandit Nehru recorded for us this week.',
      hi: 'आज रात दो रिकॉर्ड हैं। पहला, हिंदुस्तानी में ख़बरें। दूसरा, अंग्रेज़ी भाषण, जो पंडित नेहरू ने इसी हफ़्ते हमारे लिए रिकॉर्ड किया।',
    },
    checks: { en: ['recorded for us this week'], hi: ['इसी हफ़्ते हमारे लिए रिकॉर्ड किया'] },
    tells: [
      {
        kind: 'name',
        explain: {
          en: 'Pandit Nehru has been locked in Ahmednagar Fort with the Working Committee since 9 August. He recorded nothing for us this week.',
          hi: 'पंडित नेहरू 9 अगस्त से वर्किंग कमेटी के साथ अहमदनगर क़िले में बंद हैं। उन्होंने इस हफ़्ते हमारे लिए कुछ रिकॉर्ड नहीं किया।',
        },
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
      en: 'The police have raided the big radio shops, Chicago Radio among them, and taken technicians away. Send no one to buy parts. We could not get more than two sets ready.',
      hi: 'पुलिस ने बड़ी रेडियो दुकानों पर छापा मारा है, शिकागो रेडियो पर भी, और मिस्त्रियों को उठा ले गई है। पुर्ज़े ख़रीदने किसी को मत भेजिए। हम दो से ज़्यादा सेट तैयार नहीं कर पाए।',
    },
    checks: { en: ['Chicago Radio'], hi: ['शिकागो रेडियो'] },
    why: {
      text: {
        en: 'About a week before the raid of 12 November, police raided radio shops including Chicago Radio and arrested technicians. Usha Mehta said the team “could not get more than two sets prepared”.',
        hi: '12 नवंबर के छापे से लगभग एक हफ़्ता पहले पुलिस ने शिकागो रेडियो समेत रेडियो दुकानों पर छापे मारे और मिस्त्री पकड़े। उषा मेहता ने कहा कि टीम “दो से ज़्यादा सेट तैयार नहीं कर पाई”।',
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
      en: 'The police have raided the big radio shops, Calcutta Radio among them, and taken technicians away. Send no one to buy parts.',
      hi: 'पुलिस ने बड़ी रेडियो दुकानों पर छापा मारा है, कलकत्ता रेडियो पर भी, और मिस्त्रियों को उठा ले गई है। पुर्ज़े ख़रीदने किसी को मत भेजिए।',
    },
    checks: { en: ['Calcutta Radio'], hi: ['कलकत्ता रेडियो'] },
    tells: [
      {
        kind: 'name',
        explain: {
          en: 'Our parts came from Chicago Radio, Nanak Motwane’s firm, and that is the shop the police raided. The forger swapped one city’s name for another.',
          hi: 'हमारे पुर्ज़े शिकागो रेडियो से आते थे, जो नानक मोटवाने की कंपनी है, और पुलिस ने उसी दुकान पर छापा मारा। जालसाज़ ने एक शहर का नाम दूसरे से बदल दिया।',
        },
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
      en: 'This is Congress Radio calling from 42.34. Now we will give you news in Hindi. The entire world is aware that a ban has been laid on the publication of news nowadays.',
      hi: 'यह कांग्रेस रेडियो है, 42.34 से बोल रहा है। अब हम आपको हिंदी में ख़बरें देंगे। पूरी दुनिया जानती है कि आजकल ख़बरें छापने पर पाबंदी लगी है।',
    },
    checks: { en: ['calling from 42.34', 'a ban has been laid'], hi: ['42.34 से बोल रहा है', 'पाबंदी लगी है'] },
    document: { sources: [{ id: 'chatterjee-1989', loc: 'police transcript of 20 Oct 1942' }] },
    why: {
      text: {
        en: 'Real broadcast words, from the police transcript of 20 October 1942. The ban was the government’s press order of 8 August.',
        hi: 'यह असली प्रसारण के शब्द हैं, 20 अक्टूबर 1942 के पुलिस रिकॉर्ड से। पाबंदी 8 अगस्त के सरकारी हुक्म से लगी थी।',
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
      en: 'This is Congress Radio calling from Bombay, on 42.34. Now we will give you news in Hindi. The entire world is aware that a ban has been laid on the publication of news nowadays.',
      hi: 'यह कांग्रेस रेडियो है, बंबई से, 42.34 पर बोल रहा है। अब हम आपको हिंदी में ख़बरें देंगे। पूरी दुनिया जानती है कि आजकल ख़बरें छापने पर पाबंदी लगी है।',
    },
    checks: { en: ['calling from Bombay'], hi: ['बंबई से'] },
    tells: [
      {
        kind: 'form',
        explain: {
          en: 'We never say where we are. The station called from “somewhere in India”, and a script that names the city does the Special Branch’s work for it.',
          hi: 'हम कभी नहीं बताते कि हम कहाँ हैं। स्टेशन “हिंदुस्तान में कहीं से” बोलता था। जो स्क्रिप्ट शहर का नाम ले, वह स्पेशल ब्रांच का काम आसान करती है।',
        },
        ruleId: 'r-nonames',
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
      en: 'Tonight, {weekday} {date}, we go on air at 8:45 pm as always. Keep the news short; the talk runs long.',
      hi: 'आज रात, {weekday} {date}, हम हमेशा की तरह 8:45 बजे बोलेंगे। ख़बरें छोटी रखिए, भाषण लंबा है।',
    },
    checks: { en: ['Tonight', '8:45 pm'], hi: ['आज रात', '8:45 बजे'] },
    why: {
      text: {
        en: 'The weekday matches the date, and the evening programme began at 8:45 pm.',
        hi: 'दिन और तारीख़ मेल खाते हैं, और शाम का प्रोग्राम रात 8:45 बजे शुरू होता था।',
      },
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
      en: 'Tonight, {weekday+1} {date}, we go on air at 8:45 pm as always. Keep the news short; the talk runs long.',
      hi: 'आज रात, {weekday+1} {date}, हम हमेशा की तरह 8:45 बजे बोलेंगे। ख़बरें छोटी रखिए, भाषण लंबा है।',
    },
    checks: { en: ['Tonight'], hi: ['आज रात'] },
    tells: [
      {
        kind: 'weekday',
        explain: {
          en: 'The weekday does not match the date. Check the calendar: the forger is one day off.',
          hi: 'दिन और तारीख़ मेल नहीं खाते। कैलेंडर देखिए: जालसाज़ एक दिन आगे चल रहा है।',
        },
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
      en: 'Every man is free to go to the fullest length under Ahimsa by complete deadlock, strikes and all other non-violent means. Satyagrahis should go out to die and not to live… Karenge Ya Marenge.',
      hi: 'अहिंसा के रास्ते पर हर आदमी पूरी हद तक जाने को आज़ाद है: पूरा काम ठप करके, हड़ताल करके और हर अहिंसक तरीक़े से। सत्याग्रही मरने के लिए निकलें, जीने के लिए नहीं… करेंगे या मरेंगे।',
    },
    checks: { en: ['non-violent means', 'Karenge Ya Marenge'], hi: ['अहिंसक तरीक़े', 'करेंगे या मरेंगे'] },
    document: { sources: [{ id: 'goi-1943', loc: 'App. X' }] },
    why: {
      text: {
        en: 'Real document: Gandhiji’s last message, left at his arrest on 9 August 1942. The government itself printed it in 1943, in its report blaming the Congress.',
        hi: 'असली दस्तावेज़: गांधीजी का आख़िरी संदेश, जो वे 9 अगस्त 1942 को गिरफ़्तारी के वक़्त छोड़ गए। सरकार ने ख़ुद इसे 1943 में कांग्रेस पर दोष डालने वाली अपनी रिपोर्ट में छापा।',
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
      en: 'Mr. Gandhi’s last message, left at his arrest: keep the disturbances within the law and wait at home for news.',
      hi: 'मिस्टर गांधी का आख़िरी संदेश, जो वे गिरफ़्तारी के वक़्त छोड़ गए: गड़बड़ियों को क़ानून के अंदर रखो और घर बैठकर ख़बर का इंतज़ार करो।',
    },
    checks: { en: ['Mr. Gandhi', 'the disturbances'], hi: ['मिस्टर गांधी', 'गड़बड़ियों'] },
    tells: [
      {
        kind: 'habit',
        explain: {
          en: '“Mr. Gandhi” and “the disturbances” are government words; our scripts say Gandhiji. And his real last message ended “Karenge Ya Marenge”, not “wait at home”.',
          hi: '“मिस्टर गांधी” और “गड़बड़ियाँ” सरकारी शब्द हैं; हमारी स्क्रिप्ट में गांधीजी लिखा जाता है। और उनका असली आख़िरी संदेश “करेंगे या मरेंगे” पर ख़त्म होता था, “घर बैठो” पर नहीं।',
        },
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
      en: 'So far we were conducting movements but now we are conducting a revolution. In a revolution there is victory or defeat. This revolution is not of one party or community but of the whole nation.',
      hi: 'अब तक हम आंदोलन चला रहे थे, पर अब हम क्रांति चला रहे हैं। क्रांति में या जीत होती है या हार। यह क्रांति किसी एक पार्टी या एक समुदाय की नहीं, पूरे देश की है।',
    },
    checks: { en: ['of the whole nation'], hi: ['पूरे देश की है'] },
    document: { sources: [{ id: 'usha-mehta-1969' }] },
    why: {
      text: {
        en: 'Words Usha Mehta recalled from the broadcast, in her 1969 interview: Ram Manohar Lohia speaking on Congress Radio.',
        hi: 'ये शब्द उषा मेहता ने 1969 के अपने इंटरव्यू में प्रसारण से याद करके बताए: कांग्रेस रेडियो पर राम मनोहर लोहिया।',
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
      en: 'Before the talk, announce: “You will now hear Dr Ram Manohar Lohia, who recorded this tonight in this very building.”',
      hi: 'भाषण से पहले बोलिए: “अब आप डॉ. राम मनोहर लोहिया को सुनेंगे, जिन्होंने आज रात इसी इमारत में यह रिकॉर्ड किया।”',
    },
    checks: { en: ['Dr Ram Manohar Lohia', 'in this very building'], hi: ['डॉ. राम मनोहर लोहिया', 'इसी इमारत में'] },
    tells: [
      {
        kind: 'form',
        explain: {
          en: 'Never talk of the persons behind the stations. This line names our speaker on air and tells the police where he is. And our talks were cut at a separate recording station, never at the transmitter.',
          hi: 'स्टेशन के पीछे के लोगों की बात कभी नहीं होती। यह पंक्ति रेडियो पर हमारे वक्ता का नाम लेती है और पुलिस को बताती है कि वे कहाँ हैं। और हमारे भाषण एक अलग रिकॉर्डिंग स्टेशन पर रिकॉर्ड होते थे, मशीन वाली जगह पर कभी नहीं।',
        },
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
      en: 'A report has come in that soldiers were shot in a cantonment up north. One messenger, no names, no second source. Hold it until it is confirmed.',
      hi: 'ख़बर आई है कि उत्तर की किसी छावनी में सिपाहियों को गोली मारी गई। सिर्फ़ एक हरकारा, कोई नाम नहीं, कोई दूसरा सबूत नहीं। जब तक पक्की न हो, इसे रोक कर रखिए।',
    },
    checks: { en: ['Hold it until it is confirmed'], hi: ['इसे रोक कर रखिए'] },
    why: {
      text: {
        en: 'The station really did hold news back. On 26 October 1942 it told listeners it had sat on a story of soldiers shot at Meerut for a month “as it was not confirmed”.',
        hi: 'स्टेशन सच में ख़बरें रोकता था। 26 अक्टूबर 1942 को उसने सुनने वालों को बताया कि मेरठ में सिपाहियों को गोली मारने की एक ख़बर उसने महीने भर रोके रखी, “क्योंकि वह पक्की नहीं थी”।',
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
      en: 'No time to check this one. Put it straight on air tonight: the Indian troops in Poona cantonment have refused orders and joined the people.',
      hi: 'इसे जाँचने का वक़्त नहीं है। आज रात सीधे रेडियो पर बोल दीजिए: पूना छावनी के हिंदुस्तानी सिपाहियों ने हुक्म मानने से इनकार कर दिया है और जनता से मिल गए हैं।',
    },
    checks: { en: ['No time to check', 'straight on air'], hi: ['जाँचने का वक़्त नहीं', 'सीधे रेडियो पर'] },
    tells: [
      {
        kind: 'habit',
        explain: {
          en: 'We hold back what we cannot confirm. A slip that begs us to skip the check is how a plant gets false news on air, and false news is what the government needs to discredit us.',
          hi: 'जो ख़बर पक्की न हो, हम उसे रोकते हैं। जो पर्ची जाँच छोड़ने को कहे, उसी से झूठी ख़बर रेडियो पर पहुँचती है, और सरकार को हमें बदनाम करने के लिए यही चाहिए।',
        },
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
      en: 'For listeners setting their watches: since 1 September Indian Standard Time has run one hour ahead as war time, six and a half hours ahead of Greenwich.',
      hi: 'घड़ी मिलाने वालों के लिए: 1 सितंबर से इंडियन स्टैंडर्ड टाइम युद्ध की वजह से एक घंटा आगे है, यानी ग्रीनविच से साढ़े छह घंटे आगे।',
    },
    checks: { en: ['since 1 September', 'six and a half hours'], hi: ['1 सितंबर से', 'साढ़े छह घंटे'] },
    why: {
      text: {
        en: 'The Government of India advanced Indian Standard Time by an hour from midnight on 31 August 1942, which put it six and a half hours ahead of Greenwich.',
        hi: 'भारत सरकार ने 31 अगस्त 1942 की आधी रात से इंडियन स्टैंडर्ड टाइम एक घंटा आगे कर दिया, जिससे वह ग्रीनविच से साढ़े छह घंटे आगे हो गया।',
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
      en: 'For listeners setting their watches: Indian Standard Time is five and a half hours ahead of Greenwich, as it has always been.',
      hi: 'घड़ी मिलाने वालों के लिए: इंडियन स्टैंडर्ड टाइम ग्रीनविच से साढ़े पाँच घंटे आगे है, जैसा हमेशा से रहा है।',
    },
    checks: { en: ['five and a half hours'], hi: ['साढ़े पाँच घंटे'] },
    tells: [
      {
        kind: 'number',
        explain: {
          en: 'Since 1 September 1942 Indian Standard Time has run one hour ahead: six and a half hours ahead of Greenwich, not five and a half. The forger’s watch is still on peacetime.',
          hi: '1 सितंबर 1942 से इंडियन स्टैंडर्ड टाइम एक घंटा आगे है: ग्रीनविच से साढ़े छह घंटे आगे, साढ़े पाँच नहीं। जालसाज़ की घड़ी अब भी पुराने वक़्त पर है।',
        },
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
      en: 'Two new discs from the recording station tonight. The old ones have been played too often; a disc lasts only eight or ten plays. Send them back.',
      hi: 'आज रात रिकॉर्डिंग स्टेशन से दो नए रिकॉर्ड आए हैं। पुराने बहुत बार बज चुके हैं; एक रिकॉर्ड 8 या 10 बार ही चलता है। उन्हें वापस भेज दीजिए।',
    },
    checks: { en: ['eight or ten plays'], hi: ['8 या 10 बार'] },
    why: {
      text: {
        en: 'The station’s talks were cut on gramophone discs at a separate recording station and carried over by volunteers. K. A. Abbas said a disc “could be played, I think, eight or ten times”.',
        hi: 'स्टेशन के भाषण एक अलग रिकॉर्डिंग स्टेशन पर ग्रामोफ़ोन रिकॉर्ड पर काटे जाते थे और साथी उन्हें पहुँचाते थे। के. ए. अब्बास ने कहा कि एक रिकॉर्ड “शायद 8 या 10 बार” बज सकता था।',
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
      en: 'Tonight’s talk comes on a tape spool. Thread it on the recorder before 8:45 and the machine will do the rest.',
      hi: 'आज रात का भाषण टेप की रील पर आया है। 8:45 से पहले उसे रिकॉर्डर पर चढ़ा दीजिए, बाक़ी मशीन ख़ुद कर लेगी।',
    },
    checks: { en: ['tape spool'], hi: ['टेप की रील'] },
    tells: [
      {
        kind: 'anachronism',
        explain: {
          en: 'We had no tape. Our talks came on home-cut gramophone discs from the recording station, as K. A. Abbas said plainly.',
          hi: 'हमारे पास टेप नहीं था। हमारे भाषण रिकॉर्डिंग स्टेशन से घर पर काटे गए ग्रामोफ़ोन रिकॉर्ड पर आते थे, जैसा के. ए. अब्बास ने साफ़ कहा।',
        },
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
      en: 'Say it plainly before Vande Mataram: India has no enmity for the British or any other people. We want British rule to end, that is all.',
      hi: 'वंदे मातरम् से पहले साफ़ कहिए: भारत की अंग्रेज़ों से या किसी और से कोई दुश्मनी नहीं है। हम बस अंग्रेज़ी राज का अंत चाहते हैं।',
    },
    checks: { en: ['no enmity for the British'], hi: ['कोई दुश्मनी नहीं'] },
    why: {
      text: {
        en: 'Usha Mehta recalled the station saying, “India has no enmity for the British or any other people.” The judge later found that Congress Radio never voiced support for the Axis.',
        hi: 'उषा मेहता को याद था कि स्टेशन कहता था: “भारत की अंग्रेज़ों से या किसी और से कोई दुश्मनी नहीं है।” बाद में जज ने भी माना कि कांग्रेस रेडियो ने कभी जर्मनी-जापान का साथ नहीं दिया।',
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
      en: 'Tell listeners tonight: the Japanese army is India’s friend. Welcome it when it comes to Bengal, and help it on its way.',
      hi: 'आज रात सुनने वालों से कहिए: जापानी फ़ौज हिंदुस्तान की दोस्त है। जब वह बंगाल आए तो उसका स्वागत कीजिए और उसकी मदद कीजिए।',
    },
    checks: { en: ['Japanese army is India’s friend'], hi: ['जापानी फ़ौज हिंदुस्तान की दोस्त'] },
    tells: [
      {
        kind: 'habit',
        explain: {
          en: 'We never spoke for Japan or Germany. A pro-Japanese line is exactly what the government wanted, to paint the station as a fifth column. The judge later found Congress Radio never voiced support for the Axis.',
          hi: 'हम कभी जापान या जर्मनी की तरफ़ से नहीं बोले। सरकार यही चाहती थी कि स्टेशन दुश्मन का साथी दिखे। बाद में जज ने भी माना कि कांग्रेस रेडियो ने कभी जर्मनी-जापान का साथ नहीं दिया।',
        },
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
    from: { en: 'Script, morning programme', hi: 'स्क्रिप्ट, सुबह का प्रोग्राम' },
    to: ANN_AM,
    text: {
      en: 'Let the whole country resound with a million voices all trained to talk uniformly by the only voice of truth and freedom in the country, the Congress Radio calling. … Never talk of the persons behind the stations.',
      hi: 'पूरा देश दस लाख आवाज़ों से गूँज उठे, ऐसी आवाज़ें जिन्हें देश में सच और आज़ादी की अकेली आवाज़ ने एक सुर में बोलना सिखाया है: कांग्रेस रेडियो बोल रहा है। … स्टेशनों के पीछे के लोगों की बात कभी मत कीजिए।',
    },
    checks: {
      en: ['Never talk of the persons behind the stations'],
      hi: ['पीछे के लोगों की बात कभी मत कीजिए'],
    },
    document: { sources: [{ id: 'huacuja-2023', loc: 'nn. 90, 129 (transcript of 12 Nov 1942 morning, from Thakkar p. 137)' }] },
    why: {
      text: {
        en: 'Real broadcast words from the morning of 12 November 1942, the day of the raid, from the police transcript.',
        hi: 'यह 12 नवंबर 1942 की सुबह के, जिस दिन छापा पड़ा, असली प्रसारण के शब्द हैं, पुलिस रिकॉर्ड से।',
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
    from: { en: 'Script, morning programme', hi: 'स्क्रिप्ट, सुबह का प्रोग्राम' },
    to: ANN_AM,
    text: {
      en: 'Let the whole country resound with a million voices, the Congress Radio calling. This morning Babubhai Khakhar and Vithalbhai Jhaveri, who run this station, thank every listener.',
      hi: 'पूरा देश दस लाख आवाज़ों से गूँज उठे: कांग्रेस रेडियो बोल रहा है। आज सुबह इस स्टेशन को चलाने वाले बाबूभाई खाखर और विट्ठलभाई झवेरी हर सुनने वाले का शुक्रिया करते हैं।',
    },
    checks: {
      en: ['Babubhai Khakhar and Vithalbhai Jhaveri'],
      hi: ['बाबूभाई खाखर और विट्ठलभाई झवेरी'],
    },
    tells: [
      {
        kind: 'form',
        explain: {
          en: 'Never talk of the persons behind the stations: the real script that morning said exactly that. Naming the organisers on air is a gift to the Special Branch.',
          hi: 'स्टेशन के पीछे के लोगों की बात कभी नहीं होती: उस सुबह की असली स्क्रिप्ट में ठीक यही लिखा था। रेडियो पर संगठन वालों के नाम लेना स्पेशल ब्रांच को तोहफ़ा देना है।',
        },
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
      en: 'Tell the country how they did it. The special train left Bombay at 7:15 that Sunday morning. Gandhiji’s party was taken off the train at Chinchwad, a small station short of Poona; the Working Committee went on to Ahmednagar Fort.',
      hi: 'देश को बताइए कि उन्होंने यह कैसे किया। उस रविवार सुबह 7:15 पर ख़ास ट्रेन बंबई से चली। गांधीजी और उनके साथियों को पूना से थोड़ा पहले चिंचवड़ के छोटे स्टेशन पर ट्रेन से उतारा गया; वर्किंग कमेटी आगे अहमदनगर क़िले गई।',
    },
    checks: { en: ['taken off the train at Chinchwad'], hi: ['चिंचवड़ के छोटे स्टेशन पर ट्रेन से उतारा गया'] },
    why: {
      text: {
        en: 'The Governor of Bombay reported that the special train left at 7:15 a.m. on 9 August, that Gandhi’s party got off at “Chinchwad, a small station short of Poona”, and that the Working Committee went on to Ahmednagar.',
        hi: 'बंबई के गवर्नर ने लिखा कि ख़ास ट्रेन 9 अगस्त सुबह 7:15 पर चली, गांधी और उनके साथी “पूना से थोड़ा पहले चिंचवड़ नाम के छोटे स्टेशन” पर उतरे, और वर्किंग कमेटी आगे अहमदनगर पहुँची।',
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
      en: 'Tell the country how they did it. The special train left Bombay at 7:15 that Sunday morning. Gandhiji’s party was taken off the train at Kalyan; the Working Committee went on to Ahmednagar Fort.',
      hi: 'देश को बताइए कि उन्होंने यह कैसे किया। उस रविवार सुबह 7:15 पर ख़ास ट्रेन बंबई से चली। गांधीजी और उनके साथियों को कल्याण में ट्रेन से उतारा गया; वर्किंग कमेटी आगे अहमदनगर क़िले गई।',
    },
    checks: { en: ['taken off the train at Kalyan'], hi: ['कल्याण में ट्रेन से उतारा गया'] },
    tells: [
      {
        kind: 'place',
        explain: {
          en: 'Gandhiji’s party got off at Chinchwad, “a small station short of Poona”, as the Governor of Bombay reported. Kalyan is barely out of Bombay.',
          hi: 'बंबई के गवर्नर की रिपोर्ट के मुताबिक़ गांधीजी के साथी पूना से थोड़ा पहले चिंचवड़ नाम के छोटे स्टेशन पर उतरे थे। कल्याण तो बंबई से निकलते ही आ जाता है।',
        },
        factId: 'f-zero-hour',
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
      en: 'In late August our broadcasts went out on 41.87 metres. Now listen for us on 42.34.',
      hi: 'अगस्त के आख़िर में हमारे प्रसारण 41.87 मीटर पर जाते थे। अब हमें 42.34 पर सुनिए।',
    },
    checks: { en: ['41.87 metres'], hi: ['41.87 मीटर'] },
    tells: [
      {
        kind: 'number',
        explain: {
          en: 'In late August the station was on 41.78 metres, not 41.87. Close, but a radio operator reads their own dial right.',
          hi: 'अगस्त के आख़िर में स्टेशन 41.78 मीटर पर था, 41.87 पर नहीं। क़रीब है, पर रेडियो चलाने वाला अपनी सुई ठीक पढ़ता है।',
        },
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
      en: 'News from Bihar: Jayaprakash Narayan has escaped from Hazaribagh Jail. He is free, and he has gone underground.',
      hi: 'बिहार से ख़बर: जयप्रकाश नारायण हज़ारीबाग़ जेल से निकल भागे हैं। वे आज़ाद हैं और छिपकर काम में लग गए हैं।',
    },
    checks: { en: ['Hazaribagh Jail'], hi: ['हज़ारीबाग़ जेल'] },
    why: {
      text: {
        en: 'Jayaprakash Narayan escaped from Hazaribagh Jail in early November 1942 and became a leader of the underground. The government’s own report says so.',
        hi: 'जयप्रकाश नारायण नवंबर 1942 की शुरुआत में हज़ारीबाग़ जेल से भागे और छिपकर चल रहे आंदोलन के नेता बने। सरकार की अपनी रिपोर्ट में यह लिखा है।',
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
      en: 'News just in: Jayaprakash Narayan has escaped from Deoli camp. He is free, and he has gone underground.',
      hi: 'अभी-अभी ख़बर आई: जयप्रकाश नारायण देवली कैंप से निकल भागे हैं। वे आज़ाद हैं और छिपकर काम में लग गए हैं।',
    },
    checks: { en: ['Deoli camp'], hi: ['देवली कैंप'] },
    tells: [
      {
        kind: 'knowledge',
        explain: {
          en: 'JP escaped from Hazaribagh Jail in Bihar. Deoli is where he was held in 1941, when his smuggled letters were caught. The forger had last year’s address.',
          hi: 'जेपी बिहार की हज़ारीबाग़ जेल से भागे थे। देवली में वे 1941 में बंद थे, जब उनकी छिपाकर भेजी चिट्ठियाँ पकड़ी गई थीं। जालसाज़ के पास पिछले साल का पता था।',
        },
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
      en: 'Babubhai says the August cash memos must not stay at the flat. Amplifier, pick-up and volume control: Rs 599-8-0. Microphone: Rs 250, billed to “Messrs Babubhai & Co”, a firm that does not exist.',
      hi: 'बाबूभाई कहते हैं कि अगस्त की नक़द रसीदें फ़्लैट पर नहीं रहनी चाहिए। एम्प्लीफ़ायर, पिक-अप और वॉल्यूम कंट्रोल: रु. 599-8-0। माइक्रोफ़ोन: रु. 250, “मेसर्स बाबूभाई एंड कंपनी” के नाम, जो कंपनी है ही नहीं।',
    },
    checks: { en: ['Rs 599-8-0', 'Messrs Babubhai & Co'], hi: ['रु. 599-8-0', 'मेसर्स बाबूभाई एंड कंपनी'] },
    why: {
      text: {
        en: 'It looks like a strange sum, but it checks out. The court record lists the amplifier, pick-up and volume control bought at Chicago Radio for Rs 599-8-0 (599 rupees, 8 annas) on 14 August, and the Rs 250 microphone on 24 August, billed to a firm that did not exist.',
        hi: 'रक़म अजीब लगती है, पर सही है। अदालत के रिकॉर्ड में है कि 14 अगस्त को शिकागो रेडियो से एम्प्लीफ़ायर, पिक-अप और वॉल्यूम कंट्रोल रु. 599-8-0 (599 रुपये, 8 आने) में ख़रीदे गए, और 24 अगस्त को रु. 250 का माइक्रोफ़ोन, एक ऐसी कंपनी के नाम जो थी ही नहीं।',
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
      en: 'Babubhai says the August cash memos must not stay at the flat. Amplifier, pick-up and volume control: Rs 599.50. Microphone: Rs 250, billed to “Messrs Babubhai & Co”, a firm that does not exist.',
      hi: 'बाबूभाई कहते हैं कि अगस्त की नक़द रसीदें फ़्लैट पर नहीं रहनी चाहिए। एम्प्लीफ़ायर, पिक-अप और वॉल्यूम कंट्रोल: रु. 599.50। माइक्रोफ़ोन: रु. 250, “मेसर्स बाबूभाई एंड कंपनी” के नाम, जो कंपनी है ही नहीं।',
    },
    checks: { en: ['Rs 599.50'], hi: ['रु. 599.50'] },
    tells: [
      {
        kind: 'anachronism',
        explain: {
          en: 'In 1942 money was rupees, annas and pies, written Rs 599-8-0: 599 rupees and 8 annas. Decimal rupees came only in 1957. The sum is right; the format is fifteen years early.',
          hi: '1942 में पैसा रुपये, आने और पाई में चलता था, लिखा जाता था रु. 599-8-0: 599 रुपये और 8 आने। दशमलव वाला रुपया 1957 में आया। रक़म सही है, ज़माना ग़लत।',
        },
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
      en: 'Remember Matangini Hazra of Tamluk. She was 73 when she was shot leading a procession on 29 September.',
      hi: 'तमलुक की मातंगिनी हाज़रा को याद कीजिए। 29 सितंबर को जुलूस की अगुवाई करते हुए उन्हें गोली मारी गई। उनकी उम्र 73 साल थी।',
    },
    checks: { en: ['She was 73', '29 September'], hi: ['73 साल', '29 सितंबर'] },
    why: {
      text: {
        en: 'Matangini Hazra, aged 73, was shot leading a procession at Tamluk on 29 September 1942.',
        hi: '73 साल की मातंगिनी हाज़रा को 29 सितंबर 1942 को तमलुक में जुलूस की अगुवाई करते हुए गोली मारी गई।',
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
      en: 'Remember Matangini Hazra of Tamluk. She was 37 when she was shot leading a procession on 29 September.',
      hi: 'तमलुक की मातंगिनी हाज़रा को याद कीजिए। 29 सितंबर को जुलूस की अगुवाई करते हुए उन्हें गोली मारी गई। उनकी उम्र 37 साल थी।',
    },
    checks: { en: ['She was 37'], hi: ['37 साल'] },
    tells: [
      {
        kind: 'number',
        explain: {
          en: 'Matangini Hazra was 73 years old, not 37. The forger flipped the digits.',
          hi: 'मातंगिनी हाज़रा 73 साल की थीं, 37 की नहीं। जालसाज़ ने अंक उलट दिए।',
        },
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
      en: 'For listeners whose dial shows megacycles: 42.34 metres is about 7.08 megacycles. If we fade, move between 39 and 43 metres.',
      hi: 'जिनके रेडियो की सुई मेगासाइकिल में है, उनके लिए: 42.34 मीटर यानी लगभग 7.08 मेगासाइकिल। आवाज़ धीमी पड़े तो 39 से 43 मीटर के बीच सुई घुमाइए।',
    },
    checks: { en: ['7.08 megacycles', 'between 39 and 43 metres'], hi: ['7.08 मेगासाइकिल', '39 से 43 मीटर'] },
    why: {
      text: {
        en: 'It looks modern, but it checks out. 42.34 metres is about 7.08 megacycles on the 40-metre shortwave band, and the station told listeners to “Move between 39 and 43 meters” (broadcast of 18 October 1942).',
        hi: 'यह नया-सा लगता है, पर सही है। 42.34 मीटर शॉर्टवेव के 40 मीटर बैंड पर लगभग 7.08 मेगासाइकिल है, और स्टेशन ने सुनने वालों से कहा था कि “39 से 43 मीटर के बीच घुमाइए” (18 अक्टूबर 1942 का प्रसारण)।',
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
      en: 'For listeners with a modern set: 42.34 metres is about 7.08 MHz on your FM dial. If we fade, move between 39 and 43 metres.',
      hi: 'नए सेट वाले सुनने वालों के लिए: 42.34 मीटर यानी आपके FM डायल पर लगभग 7.08 मेगाहर्ट्ज़। आवाज़ धीमी पड़े तो 39 से 43 मीटर के बीच सुई घुमाइए।',
    },
    checks: { en: ['7.08 MHz', 'FM dial'], hi: ['7.08 मेगाहर्ट्ज़', 'FM डायल'] },
    tells: [
      {
        kind: 'anachronism',
        explain: {
          en: 'Radio men in 1942 said megacycles, “Mc”, as the police did when they logged a broadcast on “6.55 MC”. “MHz” is a later word (the hertz became the standard unit only in 1960), and we were a shortwave station, not FM.',
          hi: '1942 में रेडियो वाले मेगासाइकिल, “Mc”, कहते थे, जैसे पुलिस ने एक प्रसारण “6.55 MC” पर दर्ज किया। “मेगाहर्ट्ज़” बाद का शब्द है (हर्ट्ज़ नाम 1960 में जाकर चलन में आया), और हम शॉर्टवेव स्टेशन थे, FM नहीं।',
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
      en: 'Even their own Home Member admits it. On 16 September Maxwell told the Assembly that police firing had killed 340 people and the military 318, and said his figures were incomplete.',
      hi: 'उनके अपने होम मेंबर भी यह मानते हैं। 16 सितंबर को मैक्सवेल ने असेंबली में बताया कि पुलिस की गोलियों से 340 लोग मारे गए और फ़ौज के हाथों 318, और यह भी कि उनके आँकड़े अधूरे हैं।',
    },
    checks: { en: ['Home Member', '340', '318'], hi: ['होम मेंबर', '340', '318'] },
    why: {
      text: {
        en: 'A Congress script quoting the government’s own Home Member looks odd, but it checks out. On 16 September 1942 the Home Member, Sir Reginald Maxwell, told the Assembly that police firing had killed 340 and the military 318, and that the figures were incomplete.',
        hi: 'कांग्रेस की स्क्रिप्ट में सरकार के अपने होम मेंबर की बात अजीब लगती है, पर यह सही है। 16 सितंबर 1942 को होम मेंबर सर रेजिनाल्ड मैक्सवेल ने असेंबली में बताया कि पुलिस की गोलियों से 340 और फ़ौज के हाथों 318 लोग मारे गए, और आँकड़े अधूरे हैं।',
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
      en: 'Even the Viceroy admits it. On 16 September Lord Wavell told the Assembly that police firing had killed 340 people and the military 318, and said his figures were incomplete.',
      hi: 'वायसराय भी यह मानते हैं। 16 सितंबर को लॉर्ड वेवल ने असेंबली में बताया कि पुलिस की गोलियों से 340 लोग मारे गए और फ़ौज के हाथों 318, और यह भी कि उनके आँकड़े अधूरे हैं।',
    },
    checks: { en: ['Lord Wavell'], hi: ['लॉर्ड वेवल'] },
    tells: [
      {
        kind: 'knowledge',
        explain: {
          en: 'In 1942 the Viceroy was Lord Linlithgow, and these figures came from the Home Member, Maxwell. Wavell was then General Sir Archibald Wavell, the Commander-in-Chief, and not yet a lord. The forger put the wrong man in the chair.',
          hi: '1942 में वायसराय लॉर्ड लिनलिथगो थे, और ये आँकड़े होम मेंबर मैक्सवेल ने दिए थे। तब वेवल जनरल सर आर्चिबाल्ड वेवल थे, कमांडर-इन-चीफ़, लॉर्ड नहीं। जालसाज़ ने कुर्सी पर ग़लत आदमी बिठा दिया।',
        },
        sources: [{ id: 'iar-1942', loc: 'September chronicle, 16 Sep' }, { id: 'top-ii-1971', loc: 'No. 662; front matter (Executive Council: General Sir Archibald Wavell, C-in-C)' }],
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
      en: 'In late August our broadcasts went out on 41.78 metres. Now listen for us on 42.34.',
      hi: 'अगस्त के आख़िर में हमारे प्रसारण 41.78 मीटर पर जाते थे। अब हमें 42.34 पर सुनिए।',
    },
    checks: { en: ['41.78 metres'], hi: ['41.78 मीटर'] },
    why: {
      text: {
        en: 'It looks wrong, but it checks out. The police and court record put the broadcast of 27 August 1942 on 41.78 metres, and by October the station was calling on 42.34. Usha Mehta remembered 42.34 from the very first announcement. Both numbers are real, and why they differ is not known.',
        hi: 'यह ग़लत लगता है, पर सही है। पुलिस और अदालत के रिकॉर्ड में 27 अगस्त 1942 का प्रसारण 41.78 मीटर पर दर्ज है, और अक्टूबर तक स्टेशन 42.34 पर बोल रहा था। उषा मेहता को याद था कि पहली घोषणा से ही 42.34 था। दोनों नंबर असली हैं; फ़र्क़ क्यों है, यह पता नहीं।',
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
      en: 'From Sind: Premier Allah Bux gave back his British titles, Khan Bahadur and O.B.E., in protest. “Mr. Churchill’s speech shattered all hopes,” he said. On 10 October the Governor removed him from office.',
      hi: 'सिंध से ख़बर: प्रीमियर (सूबे की सरकार के मुखिया) अल्लाह बख़्श ने विरोध में अपने अंग्रेज़ी ख़िताब, ख़ान बहादुर और O.B.E., लौटा दिए। उन्होंने कहा, “मिस्टर चर्चिल के भाषण ने सारी उम्मीदें तोड़ दीं।” 10 अक्टूबर को गवर्नर ने उन्हें पद से हटा दिया।',
    },
    checks: { en: ['Allah Bux', '10 October'], hi: ['अल्लाह बख़्श', '10 अक्टूबर'] },
    why: {
      text: {
        en: 'A premier handing back British titles sounds too good to be true, but it checks out. Allah Bux, Premier of Sind, renounced “Khan Bahadur” and “O.B.E.” in protest in September 1942, and the Governor removed him on 10 October.',
        hi: 'यक़ीन नहीं होता कि किसी प्रीमियर ने अंग्रेज़ों के ख़िताब लौटा दिए, पर यह सच है। सिंध के प्रीमियर अल्लाह बख़्श ने सितंबर 1942 में विरोध में “ख़ान बहादुर” और “O.B.E.” लौटाए, और 10 अक्टूबर को गवर्नर ने उन्हें हटा दिया।',
      },
      sources: [{ id: 'iar-1942', loc: 'September chronicle; October chronicle, 10 Oct' }],
    },
  },
]
