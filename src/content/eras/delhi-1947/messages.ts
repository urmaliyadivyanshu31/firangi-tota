import type { Message } from '../../types'

// Window: Tue 5 Aug (day 1) to Mon 18 Aug 1947 (day 14).
// Event days: 4 = Fri 8 Aug, 8 = Tue 12 Aug, 9 = Wed 13 Aug, 10 = Thu 14 Aug,
// 11 = Fri 15 Aug, 12 = Sat 16 Aug, 13 = Sun 17 Aug. The engine picks one message per event day.
// Undated messages may land on any day from 5 to 18 August, so they never name
// Mountbatten's title for "today" or the building's name, both of which change on 15 August.

const CAB = { en: "Boundary Commission secretariat, Comptroller's House", hi: 'सीमा कमीशन का दफ़्तर, कंप्ट्रोलर हाउस' }
const PSV = { en: 'Private Secretary to the Viceroy', hi: 'वायसराय के निजी सचिव' }
const CIPHER = { en: 'Cipher Office, New Delhi', hi: 'साइफ़र दफ़्तर, नई दिल्ली' }
const HEAD = { en: 'Head Clerk, Cipher Office', hi: 'हेड क्लर्क, साइफ़र दफ़्तर' }
const CLERK = { en: 'Cipher clerk', hi: 'साइफ़र क्लर्क' }
const SECRETARIAT = { en: 'Boundary Commission secretariat', hi: 'सीमा कमीशन का दफ़्तर' }
const TEL_LAHORE = { en: 'Telegraph Office, Lahore', hi: 'तार घर, लाहौर' }
const GOV_SEC_LAHORE = { en: "Governor's Secretary, Lahore", hi: 'गवर्नर के सचिव, लाहौर' }
const TEL_CALCUTTA = { en: 'Telegraph Office, Calcutta', hi: 'तार घर, कलकत्ता' }
const TEL_DELHI = { en: 'Telegraph Office, Delhi', hi: 'तार घर, दिल्ली' }
const GOVT_HOUSE = { en: 'Government House, New Delhi', hi: 'गवर्नमेंट हाउस, नई दिल्ली' }
const ABELL = { en: 'G.E.B. Abell', hi: 'जी.ई.बी. एबेल' }
const ABBOTT = { en: 'Stuart Abbott, Lahore', hi: 'स्टुअर्ट एबट, लाहौर' }
const REPORT = { en: 'Punjab Boundary Commission report', hi: 'पंजाब सीमा कमीशन की रिपोर्ट' }
const GAZETTE = { en: 'Gazette of India Extraordinary', hi: 'गज़ट ऑफ़ इंडिया का ख़ास अंक' }
const TRAVANCORE = { en: 'Maharaja of Travancore, Trivandrum', hi: 'त्रावणकोर के महाराजा, त्रिवेंद्रम' }
const VISCOUNT = { en: 'Viscount Mountbatten of Burma', hi: 'बर्मा के वाइकाउंट माउंटबेटन' }
const CA_OFFICE = { en: 'Constituent Assembly Office, Council House', hi: 'संविधान सभा का दफ़्तर, काउंसिल हाउस' }

export const messages: Message[] = [
  // ───────────── Event days (onDay) ─────────────

  // Day 4, Fri 8 Aug: the Abell letter (real)
  {
    id: 'd4-abell-letter',
    tier: 2,
    real: true,
    pair: 'abell-letter',
    onDay: 4,
    from: ABELL,
    to: ABBOTT,
    text: {
      en: 'I enclose a map showing roughly the boundary which Sir Cyril Radcliffe proposes… with reference to village and zail boundaries in Lahore district. G. E. B. ABELL',
      hi: 'साथ में नक्शा भेज रहा हूँ, जिसमें मोटे तौर पर वह सीमा है जो सर सिरिल रैडक्लिफ़ खींचना चाहते हैं… लाहौर ज़िले में गाँवों और ज़ैलों की सीमाओं के हिसाब से। जी.ई.बी. एबेल',
    },
    checks: { en: ['zail boundaries'], hi: ['ज़ैलों की सीमाओं'] },
    document: { sources: [{ id: 'mansergh-xii', loc: 'No. 377' }] },
    why: {
      text: {
        en: "This line gave Pakistan Ferozepore and Zira tahsils; the award didn't. Why is disputed.",
        hi: 'इस लकीर में फ़िरोज़पुर और ज़ीरा तहसीलें पाकिस्तान में थीं; फ़ैसले में नहीं। क्यों, इस पर बहस है।',
      },
      sources: [{ id: 'mansergh-xii', loc: 'No. 377 and note; No. 395' }, { id: 'chester-2002' }],
    },
  },
  {
    id: 'd4-abell-zilla',
    tier: 2,
    real: false,
    pair: 'abell-letter',
    onDay: 4,
    from: ABELL,
    to: ABBOTT,
    text: {
      en: 'I enclose a map showing roughly the boundary which Sir Cyril Radcliffe proposes… with reference to village and zilla boundaries. G. E. B. ABELL, Private Secretary to Sir Cyril Radcliffe',
      hi: 'साथ में नक्शा भेज रहा हूँ, जिसमें मोटे तौर पर वह सीमा है जो सर सिरिल रैडक्लिफ़ खींचना चाहते हैं… गाँवों और ज़िलों की सीमाओं के हिसाब से। जी.ई.बी. एबेल, सर सिरिल रैडक्लिफ़ के निजी सचिव',
    },
    checks: { en: ['Private Secretary to Sir Cyril Radcliffe', 'zilla boundaries'], hi: ['सर सिरिल रैडक्लिफ़ के निजी सचिव', 'ज़िलों की सीमाओं'] },
    tells: [
      {
        kind: 'name',
        explain: {
          en: "Abell was the Viceroy's secretary, not Radcliffe's; Radcliffe's was Beaumont.",
          hi: 'एबेल वायसराय के सचिव थे, रैडक्लिफ़ के नहीं; रैडक्लिफ़ के सचिव बोमॉन्ट थे।',
        },
        factId: 'staff',
        sources: [{ id: 'mansergh-xii', loc: 'No. 377' }],
      },
      {
        kind: 'knowledge',
        explain: {
          en: "'Zail', a group of villages, not 'zilla', a whole district.",
          hi: "'ज़ैल' यानी कुछ गाँवों का समूह, 'ज़िला' नहीं, जो पूरा डिस्ट्रिक्ट है।",
        },
        sources: [{ id: 'mansergh-xii', loc: 'No. 377' }, { id: 'nayar-1971' }],
      },
    ],
  },

  // Day 8, Tue 12 Aug: the Punjab and Bengal awards are dated
  {
    id: 'd8-awards-all-three',
    tier: 1,
    real: false,
    pair: 'awards-signed',
    onDay: 8,
    from: CAB,
    to: PSV,
    text: {
      en: 'MOST IMMEDIATE. Sir Cyril Radcliffe signed all three awards today: Punjab, Bengal and Sylhet. Publication fixed for the morning of the 15th.',
      hi: 'MOST IMMEDIATE. सर सिरिल रैडक्लिफ़ ने आज तीनों फ़ैसलों पर दस्तख़त कर दिए: पंजाब, बंगाल और सिलहट। छपाई 15 तारीख़ की सुबह तय है।',
    },
    checks: { en: ['all three awards today', 'morning of the 15th'], hi: ['तीनों फ़ैसलों पर', '15 तारीख़ की सुबह'] },
    tells: [
      {
        kind: 'date',
        explain: { en: "Sylhet's award is dated 13 August, not 12.", hi: 'सिलहट का फ़ैसला 13 अगस्त का है, 12 का नहीं।' },
        factId: 'awards',
        sources: [{ id: 'mansergh-xii', loc: 'No. 488' }, { id: 'campbell-johnson-1951', loc: 'entry for 12 August 1947' }],
      },
      {
        kind: 'date',
        explain: { en: 'Published Sunday 17 August, not on the 15th.', hi: 'फ़ैसले रविवार 17 अगस्त को छपे, 15 को नहीं।' },
        factId: 'awards',
        sources: [{ id: 'mansergh-xii', loc: 'No. 489' }],
      },
    ],
  },
  {
    id: 'd8-awards-dated',
    tier: 1,
    real: true,
    pair: 'awards-signed',
    onDay: 8,
    from: CAB,
    to: PSV,
    text: {
      en: 'MOST IMMEDIATE. The Punjab and Bengal reports are complete, dated New Delhi, 12 August 1947. The Sylhet report will follow.',
      hi: 'MOST IMMEDIATE. पंजाब और बंगाल की रिपोर्टें तैयार हैं, तारीख़ नई दिल्ली, 12 अगस्त 1947। सिलहट की रिपोर्ट बाद में आएगी।',
    },
    checks: { en: ['Punjab and Bengal reports are complete', 'Sylhet report will follow'], hi: ['पंजाब और बंगाल की रिपोर्टें तैयार हैं', 'सिलहट की रिपोर्ट बाद में'] },
    why: {
      text: {
        en: "Both dated 12 August; Radcliffe called them 'complete and ready' that evening.",
        hi: "दोनों पर 12 अगस्त की तारीख़; उसी शाम रैडक्लिफ़ ने इन्हें 'पूरे और तैयार' बताया।",
      },
      sources: [{ id: 'mansergh-xii', loc: 'No. 488 and Appendix I, note 21' }, { id: 'campbell-johnson-1951', loc: 'entry for 12 August 1947' }],
    },
  },

  // Day 9, Wed 13 Aug: the Sylhet award; Mountbatten in Karachi
  {
    id: 'd9-earl',
    tier: 3,
    real: false,
    pair: 'sylhet',
    onDay: 9,
    from: CAB,
    to: PSV,
    text: {
      en: 'IMMEDIATE. Sir Cyril Radcliffe signed the Sylhet report today. All three stay sealed while His Excellency the Earl Mountbatten of Burma is in Karachi.',
      hi: 'IMMEDIATE. सर सिरिल रैडक्लिफ़ ने आज सिलहट की रिपोर्ट पर दस्तख़त किए। हिज़ एक्सेलेंसी बर्मा के अर्ल माउंटबेटन कराची में हैं, तब तक तीनों बंद रहेंगी।',
    },
    checks: { en: ['the Earl Mountbatten of Burma'], hi: ['बर्मा के अर्ल माउंटबेटन'] },
    tells: [
      {
        kind: 'knowledge',
        explain: {
          en: 'Viscount, not Earl, on 13 August; the earldom was announced on the 15th.',
          hi: '13 अगस्त को वे वाइकाउंट थे, अर्ल नहीं; अर्ल की घोषणा 15 को हुई।',
        },
        factId: 'titles',
        sources: [{ id: 'mansergh-xii', loc: 'No. 300 and note' }],
      },
    ],
  },
  {
    id: 'd9-sylhet-signed',
    tier: 1,
    real: true,
    pair: 'sylhet',
    onDay: 9,
    from: CAB,
    to: PSV,
    text: {
      en: 'IMMEDIATE. Sir Cyril Radcliffe signed the Sylhet report today. All three stay sealed while His Excellency is in Karachi.',
      hi: 'IMMEDIATE. सर सिरिल रैडक्लिफ़ ने आज सिलहट की रिपोर्ट पर दस्तख़त किए। हिज़ एक्सेलेंसी कराची में हैं, तब तक तीनों बंद रहेंगी।',
    },
    checks: { en: ['Sylhet report today'], hi: ['सिलहट की रिपोर्ट पर'] },
    why: {
      text: {
        en: 'Sylhet is dated 13 August; Mountbatten flew to Karachi that day.',
        hi: 'सिलहट पर 13 अगस्त की तारीख़ है; उसी दिन माउंटबेटन कराची गए।',
      },
      sources: [
        { id: 'mansergh-xii', loc: 'Nos. 488, 489' },
        { id: 'campbell-johnson-1951', loc: 'entry for 13 August 1947, Karachi' },
      ],
    },
  },

  // Day 10, Thu 14 Aug: the midnight session (real record)
  {
    id: 'd10-session-record',
    tier: 2,
    real: true,
    pair: 'midnight-session',
    onDay: 10,
    from: { en: 'Constituent Assembly of India', hi: 'भारत की संविधान सभा' },
    to: { en: 'Official record', hi: 'सरकारी रिकॉर्ड' },
    text: {
      en: '…commenced in the Constitution Hall, New Delhi, at Eleven P. M.… Mr. President: It is just half a minute to 12. I am expecting the clock to strike 12.',
      hi: '…सत्र रात ग्यारह बजे कॉन्स्टिट्यूशन हॉल, नई दिल्ली में शुरू हुआ… अध्यक्ष: 12 बजने में बस आधा मिनट है। मैं घड़ी के 12 बजाने का इंतज़ार कर रहा हूँ।',
    },
    checks: { en: ['Eleven P. M.', 'half a minute to 12'], hi: ['रात ग्यारह बजे', 'बस आधा मिनट'] },
    document: { sources: [{ id: 'cad-14aug1947' }] },
    why: {
      text: {
        en: "11 pm, Prasad presiding; The Tribune: 'As the clock chimed twelve, conches blew.'",
        hi: "रात 11 बजे, प्रसाद की अध्यक्षता में; ट्रिब्यून ने लिखा: 'बारह बजते ही शंख बज उठे।'",
      },
      sources: [{ id: 'cad-14aug1947' }, { id: 'tribune-1947' }],
    },
  },
  {
    id: 'd10-session-naidu',
    tier: 1,
    real: false,
    pair: 'midnight-session',
    onDay: 10,
    from: CA_OFFICE,
    to: PSV,
    text: {
      en: 'IMMEDIATE. Assembly sits at eleven tonight, Dr Rajendra Prasad, President of India, in the chair. Pledge at the stroke of midnight.',
      hi: 'IMMEDIATE. सभा आज रात ग्यारह बजे बैठेगी, अध्यक्षता भारत के राष्ट्रपति राजेंद्र प्रसाद करेंगे। ठीक आधी रात को शपथ होगी।',
    },
    checks: { en: ['President of India'], hi: ['भारत के राष्ट्रपति'] },
    tells: [
      {
        kind: 'anachronism',
        explain: {
          en: 'President of the Constituent Assembly, not of India; India had no President yet.',
          hi: 'संविधान सभा के अध्यक्ष, भारत के राष्ट्रपति नहीं; तब भारत में राष्ट्रपति था ही नहीं।',
        },
        factId: 'session',
        sources: [{ id: 'cad-14aug1947' }],
      },
    ],
  },

  // Day 11, Fri 15 Aug
  {
    id: 'd11-viceroy',
    tier: 3,
    real: false,
    pair: 'fifteenth',
    onDay: 11,
    from: { en: 'Arrangements office, Princes Park', hi: 'इंतज़ाम दफ़्तर, प्रिंसेस पार्क' },
    to: GOVT_HOUSE,
    text: {
      en: 'IMMEDIATE. For His Excellency the Viceroy: crowd at Princes Park far above the thirty thousand planned. Flag ceremony goes ahead this evening.',
      hi: 'IMMEDIATE. हिज़ एक्सेलेंसी वायसराय के लिए: प्रिंसेस पार्क में भीड़ तय तीस हज़ार से कहीं ज़्यादा है। शाम का झंडा समारोह होगा।',
    },
    checks: { en: ['His Excellency the Viceroy'], hi: ['हिज़ एक्सेलेंसी वायसराय'] },
    tells: [
      {
        kind: 'knowledge',
        explain: {
          en: 'Governor-General, not Viceroy: Kania swore him in at 8.30 that morning.',
          hi: 'गवर्नर-जनरल, वायसराय नहीं: सुबह 8.30 बजे कानिया ने उन्हें शपथ दिलाई।',
        },
        factId: 'titles',
        sources: [{ id: 'cad-14aug1947' }, { id: 'campbell-johnson-1951', loc: 'entry for 15 August 1947' }],
      },
    ],
  },
  {
    id: 'd11-intimation',
    tier: 2,
    real: true,
    pair: 'fifteenth',
    onDay: 11,
    from: { en: 'Constituent Assembly of India', hi: 'भारत की संविधान सभा' },
    to: { en: 'Lord Mountbatten, Government House', hi: 'लॉर्ड माउंटबेटन, गवर्नमेंट हाउस' },
    text: {
      en: 'The Constituent Assembly of India has assumed power for the governance of India, and… endorsed the recommendation that Lord Mountbatten be Governor-General of India from the 15th August 1947.',
      hi: 'भारत की संविधान सभा ने भारत का शासन सँभाल लिया है, और… सिफ़ारिश मान ली है कि 15 अगस्त 1947 से लॉर्ड माउंटबेटन भारत के गवर्नर-जनरल हों।',
    },
    checks: { en: ['assumed power for the governance of India', 'Governor-General of India from the 15th August 1947'], hi: ['शासन सँभाल लिया है', 'भारत के गवर्नर-जनरल हों'] },
    document: { sources: [{ id: 'cad-14aug1947' }] },
    why: {
      text: {
        en: "Carried to him after midnight; he replied, 'I am proud of the honour…'",
        hi: "आधी रात के बाद यह संदेश उन तक पहुँचा; जवाब था: 'मुझे इस सम्मान पर गर्व है…'",
      },
      sources: [{ id: 'cad-14aug1947' }, { id: 'campbell-johnson-1951', loc: 'entry for 14–15 August 1947' }],
    },
  },

  // Day 12, Sat 16 Aug: the Red Fort flag
  {
    id: 'd12-red-fort-today',
    tier: 3,
    real: true,
    pair: 'red-fort',
    onDay: 12,
    from: TEL_DELHI,
    to: GOVT_HOUSE,
    text: {
      en: 'IMMEDIATE. National flag hoisted over the Red Fort very early this morning. Pandit Nehru addressed some half a million.',
      hi: 'IMMEDIATE. आज बहुत सुबह लाल क़िले पर राष्ट्रीय झंडा फहराया गया। पंडित नेहरू ने करीब पाँच लाख लोगों के सामने भाषण दिया।',
    },
    checks: { en: ['Red Fort very early this morning'], hi: ['आज बहुत सुबह लाल क़िले पर'] },
    why: {
      text: {
        en: 'Red Fort flag: Saturday 16 August, not Independence Day itself.',
        hi: 'लाल क़िले का झंडा शनिवार 16 अगस्त को चढ़ा, 15 को नहीं।',
      },
      sources: [{ id: 'campbell-johnson-1951', loc: 'entry for 16 August 1947' }],
    },
  },
  {
    id: 'd12-red-fort-yesterday',
    tier: 3,
    real: false,
    pair: 'red-fort',
    onDay: 12,
    from: TEL_DELHI,
    to: GOVT_HOUSE,
    text: {
      en: 'IMMEDIATE. National flag hoisted over the Red Fort yesterday, 15 August, at 8.30 am. Pandit Nehru addressed some half a million.',
      hi: 'IMMEDIATE. कल, 15 अगस्त को सुबह 8.30 बजे लाल क़िले पर राष्ट्रीय झंडा फहराया गया। पंडित नेहरू ने करीब पाँच लाख लोगों के सामने भाषण दिया।',
    },
    checks: { en: ['Red Fort yesterday, 15 August'], hi: ['कल, 15 अगस्त'] },
    tells: [
      {
        kind: 'date',
        explain: {
          en: 'The Red Fort flag rose today, 16 August, not on the 15th.',
          hi: 'लाल क़िले पर झंडा आज, 16 अगस्त को चढ़ा, 15 को नहीं।',
        },
        factId: 'delhi-flags',
        sources: [{ id: 'campbell-johnson-1951', loc: 'entries for 15 and 16 August 1947' }],
      },
    ],
  },

  // Day 13, Sun 17 Aug: the awards are published (real words of the award)
  {
    id: 'd13-gazette-para12',
    tier: 2,
    real: true,
    pair: 'published',
    onDay: 13,
    from: REPORT,
    to: GAZETTE,
    text: {
      en: "Report dated 12 August 1947, para 12: 'I am conscious too that the award cannot go far towards satisfying sentiments and aspirations deeply held on either side…' CYRIL RADCLIFFE.",
      hi: "रिपोर्ट, तारीख़ 12 अगस्त 1947, पैरा 12: 'मैं यह भी जानता हूँ कि यह फ़ैसला दोनों तरफ़ की गहरी भावनाओं और उम्मीदों को ज़्यादा पूरा नहीं कर सकता…' सिरिल रैडक्लिफ़।",
    },
    checks: { en: ['dated 12 August 1947', 'CYRIL RADCLIFFE'], hi: ['तारीख़ 12 अगस्त 1947', 'सिरिल रैडक्लिफ़'] },
    document: { sources: [{ id: 'mansergh-xii', loc: 'No. 488, Appendix I, para 12' }] },
    why: {
      text: {
        en: 'Signed 12 August, kept sealed, published Sunday 17 August.',
        hi: '12 अगस्त को दस्तख़त, फिर बंद रखा गया, रविवार 17 अगस्त को छपा।',
      },
      sources: [
        { id: 'mansergh-xii', loc: 'Nos. 488, 489' },
        { id: 'campbell-johnson-1951', loc: 'entry for 16 August 1947' },
      ],
    },
  },
  {
    id: 'd13-gazette-saturday',
    tier: 2,
    real: false,
    pair: 'published',
    onDay: 13,
    from: REPORT,
    to: GAZETTE,
    text: {
      en: "NEW DELHI, Saturday, {date}. Report dated 12 August 1947, para 12: '…cannot go far towards satisfying sentiments and aspirations deeply held on either side…'",
      hi: "नई दिल्ली, शनिवार, {date}। रिपोर्ट, तारीख़ 12 अगस्त 1947, पैरा 12: '…यह फ़ैसला दोनों तरफ़ की गहरी भावनाओं और उम्मीदों को ज़्यादा पूरा नहीं कर सकता…'",
    },
    checks: { en: ['Saturday'], hi: ['शनिवार'] },
    tells: [
      {
        kind: 'weekday',
        explain: { en: '17 August 1947 was a Sunday, not a Saturday.', hi: '17 अगस्त 1947 रविवार था, शनिवार नहीं।' },
        factId: 'awards',
        ruleId: 'weekday',
        sources: [{ id: 'mansergh-xii', loc: 'No. 489' }],
      },
    ],
  },

  // ───────────── Undated, tier 1: caught from the case file ─────────────

  {
    id: 'radcliffe-ps-real',
    tier: 1,
    real: true,
    pair: 'radcliffe-ps',
    from: SECRETARIAT,
    to: CIPHER,
    text: {
      en: "Sir Cyril Radcliffe's office: the Comptroller's House. Private secretary: Mr Christopher Beaumont.",
      hi: 'सर सिरिल रैडक्लिफ़ का दफ़्तर: कंप्ट्रोलर हाउस। निजी सचिव: मिस्टर क्रिस्टोफ़र बोमॉन्ट।',
    },
    checks: { en: ["Comptroller's House", 'Mr Christopher Beaumont'], hi: ['कंप्ट्रोलर हाउस', 'मिस्टर क्रिस्टोफ़र बोमॉन्ट'] },
    why: {
      text: {
        en: "Radcliffe worked at the Comptroller's House; Beaumont was his private secretary.",
        hi: 'रैडक्लिफ़ कंप्ट्रोलर हाउस में काम करते थे; बोमॉन्ट उनके निजी सचिव थे।',
      },
      sources: [{ id: 'mansergh-xii', loc: 'Introduction; No. 377' }, { id: 'campbell-johnson-1951' }],
    },
  },
  {
    id: 'radcliffe-ps-fake',
    tier: 1,
    real: false,
    pair: 'radcliffe-ps',
    from: SECRETARIAT,
    to: CIPHER,
    text: {
      en: "Sir Cyril Radcliffe's office: the Comptroller's House. Private secretary: Mr George Abell.",
      hi: 'सर सिरिल रैडक्लिफ़ का दफ़्तर: कंप्ट्रोलर हाउस। निजी सचिव: मिस्टर जॉर्ज एबेल।',
    },
    checks: { en: ['Mr George Abell'], hi: ['मिस्टर जॉर्ज एबेल'] },
    tells: [
      {
        kind: 'name',
        explain: {
          en: "Beaumont was Radcliffe's secretary, not Abell, who served the Viceroy.",
          hi: 'रैडक्लिफ़ के सचिव बोमॉन्ट थे, एबेल नहीं; एबेल वायसराय के सचिव थे।',
        },
        factId: 'radcliffe',
        sources: [{ id: 'mansergh-xii', loc: 'No. 377' }],
      },
    ],
  },

  {
    id: 'radcliffe-arrival-real',
    tier: 1,
    real: true,
    pair: 'radcliffe-arrival',
    from: SECRETARIAT,
    to: CIPHER,
    text: {
      en: 'For the file: Sir Cyril Radcliffe reached Delhi on 8 July, his first time in India.',
      hi: 'फ़ाइल के लिए: सर सिरिल रैडक्लिफ़ 8 जुलाई को दिल्ली पहुँचे, पहली बार भारत आए।',
    },
    checks: { en: ['8 July', 'first time in India'], hi: ['8 जुलाई', 'पहली बार भारत'] },
    why: {
      text: { en: 'He landed on 8 July, never in India before.', hi: 'वे 8 जुलाई को आए, पहले कभी भारत नहीं आए थे।' },
      sources: [{ id: 'mansergh-xii', loc: 'Introduction' }, { id: 'chester-2002' }],
    },
  },
  {
    id: 'radcliffe-arrival-fake',
    tier: 1,
    real: false,
    pair: 'radcliffe-arrival',
    from: SECRETARIAT,
    to: CIPHER,
    text: {
      en: 'For the file: Sir Cyril Radcliffe reached Delhi on 8 June, his first time in India.',
      hi: 'फ़ाइल के लिए: सर सिरिल रैडक्लिफ़ 8 जून को दिल्ली पहुँचे, पहली बार भारत आए।',
    },
    checks: { en: ['8 June'], hi: ['8 जून'] },
    tells: [
      {
        kind: 'date',
        explain: { en: '8 July, not 8 June; he was chosen only on 27 June.', hi: '8 जुलाई, 8 जून नहीं; उनका नाम 27 जून को ही तय हुआ।' },
        factId: 'radcliffe',
        sources: [{ id: 'mansergh-xii', loc: 'Introduction' }, { id: 'campbell-johnson-1951', loc: 'entry for 27 June 1947' }],
      },
    ],
  },

  {
    id: 'punjab-members-real',
    tier: 1,
    real: true,
    pair: 'punjab-members',
    from: SECRETARIAT,
    to: CIPHER,
    text: {
      en: 'Punjab Boundary Commission: Justices Din Muhammad, Muhammad Munir, Mehr Chand Mahajan and Teja Singh.',
      hi: 'पंजाब सीमा कमीशन: जस्टिस दीन मुहम्मद, मुहम्मद मुनीर, मेहर चंद महाजन और तेजा सिंह।',
    },
    checks: { en: ['Mehr Chand Mahajan and Teja Singh'], hi: ['मेहर चंद महाजन और तेजा सिंह'] },
    why: {
      text: { en: "The four Punjab judges named in Radcliffe's award.", hi: 'रैडक्लिफ़ के फ़ैसले में दर्ज पंजाब के चारों जज।' },
      sources: [{ id: 'mansergh-xii', loc: 'No. 488, Appendix I' }],
    },
  },
  {
    id: 'punjab-members-fake',
    tier: 1,
    real: false,
    pair: 'punjab-members',
    from: SECRETARIAT,
    to: CIPHER,
    text: {
      en: 'Punjab Boundary Commission: Justices Din Muhammad, Muhammad Munir, Mehr Chand Mahajan and C.C. Biswas.',
      hi: 'पंजाब सीमा कमीशन: जस्टिस दीन मुहम्मद, मुहम्मद मुनीर, मेहर चंद महाजन और सी.सी. बिस्वास।',
    },
    checks: { en: ['C.C. Biswas'], hi: ['सी.सी. बिस्वास'] },
    tells: [
      {
        kind: 'name',
        explain: {
          en: "Biswas sat on the Bengal Commission, not Punjab's; Teja Singh did.",
          hi: 'बिस्वास बंगाल कमीशन में थे, पंजाब में नहीं; वहाँ तेजा सिंह थे।',
        },
        factId: 'members',
        sources: [{ id: 'mansergh-xii', loc: 'No. 488, Appendices I and II' }],
      },
    ],
  },

  {
    id: 'boundary-force-real',
    tier: 1,
    real: true,
    pair: 'boundary-force',
    from: { en: 'Army Headquarters, New Delhi', hi: 'फ़ौजी हेडक्वार्टर, नई दिल्ली' },
    to: CIPHER,
    text: {
      en: 'Punjab Boundary Force under Maj-Gen T.W. Rees, set up 1 August: about 50,000 officers and men.',
      hi: 'मेजर-जनरल टी.डब्ल्यू. रीस की पंजाब बाउंड्री फ़ोर्स, 1 अगस्त को बनी: करीब 50,000 अफ़सर और जवान।',
    },
    checks: { en: ['Maj-Gen T.W. Rees', 'about 50,000'], hi: ['टी.डब्ल्यू. रीस', 'करीब 50,000'] },
    why: {
      text: { en: 'Menon: set up 1 August, about 50,000 officers and men.', hi: 'मेनन: 1 अगस्त को बनी, करीब 50,000 अफ़सर और जवान।' },
      sources: [{ id: 'menon-1957', loc: 'ch. XVIII' }],
    },
  },
  {
    id: 'boundary-force-fake',
    tier: 1,
    real: false,
    pair: 'boundary-force',
    from: { en: 'Army Headquarters, New Delhi', hi: 'फ़ौजी हेडक्वार्टर, नई दिल्ली' },
    to: CIPHER,
    text: {
      en: 'Punjab Boundary Force under Maj-Gen T.W. Rees, set up 1 August: about 5,000 officers and men.',
      hi: 'मेजर-जनरल टी.डब्ल्यू. रीस की पंजाब बाउंड्री फ़ोर्स, 1 अगस्त को बनी: करीब 5,000 अफ़सर और जवान।',
    },
    checks: { en: ['about 5,000'], hi: ['करीब 5,000'] },
    tells: [
      {
        kind: 'number',
        explain: { en: 'About 50,000 officers and men, not 5,000.', hi: 'करीब 50,000 अफ़सर और जवान, 5,000 नहीं।' },
        factId: 'staff',
        sources: [{ id: 'menon-1957', loc: 'ch. XVIII' }],
      },
    ],
  },

  {
    id: 'royal-assent-real',
    tier: 1,
    real: true,
    pair: 'royal-assent',
    from: HEAD,
    to: CLERK,
    text: {
      en: 'Note for the desk: the Indian Independence Act received the Royal Assent on Friday 18 July. The appointed day is Friday 15 August.',
      hi: 'मेज़ के लिए नोट: आज़ादी के क़ानून को शुक्रवार 18 जुलाई को राजा की मंज़ूरी मिली। तय दिन शुक्रवार 15 अगस्त है।',
    },
    checks: { en: ['Friday 18 July', 'Friday 15 August'], hi: ['शुक्रवार 18 जुलाई', 'शुक्रवार 15 अगस्त'] },
    why: {
      text: { en: 'Introduced 4 July; Royal Assent Friday 18 July.', hi: 'बिल 4 जुलाई को पेश हुआ; राजा की मंज़ूरी शुक्रवार 18 जुलाई को।' },
      sources: [{ id: 'menon-1957', loc: 'ch. XVII' }],
    },
  },
  {
    id: 'royal-assent-fake',
    tier: 1,
    real: false,
    pair: 'royal-assent',
    from: HEAD,
    to: CLERK,
    text: {
      en: 'Note for the desk: the Indian Independence Act received the Royal Assent on Friday 4 July. The appointed day is Friday 15 August.',
      hi: 'मेज़ के लिए नोट: आज़ादी के क़ानून को शुक्रवार 4 जुलाई को राजा की मंज़ूरी मिली। तय दिन शुक्रवार 15 अगस्त है।',
    },
    checks: { en: ['Friday 4 July'], hi: ['शुक्रवार 4 जुलाई'] },
    tells: [
      {
        kind: 'date',
        explain: {
          en: 'Royal Assent came 18 July, not 4 July, when the Bill was introduced.',
          hi: 'राजा की मंज़ूरी 18 जुलाई को मिली, 4 जुलाई को नहीं; तब बिल पेश हुआ था।',
        },
        factId: 'appointed-day',
        sources: [{ id: 'menon-1957', loc: 'ch. XVII' }, { id: 'mansergh-xii', loc: 'Introduction' }],
      },
    ],
  },

  {
    id: 'first-schedule-real',
    tier: 1,
    real: true,
    pair: 'first-schedule',
    from: { en: 'Records Section, New Delhi', hi: 'रिकॉर्ड विभाग, नई दिल्ली' },
    to: CIPHER,
    text: {
      en: "The Act's First Schedule lists Murshidabad, Nadia and Malda in East Bengal, but not Khulna or the Chittagong Hill Tracts.",
      hi: 'क़ानून की पहली सूची मुर्शिदाबाद, नदिया और मालदा को पूर्वी बंगाल में रखती है, खुलना या चटगाँव हिल ट्रैक्ट्स को नहीं।',
    },
    checks: { en: ['Murshidabad, Nadia and Malda', 'Khulna or the Chittagong Hill Tracts'], hi: ['मुर्शिदाबाद, नदिया और मालदा', 'खुलना या चटगाँव हिल ट्रैक्ट्स'] },
    why: {
      text: { en: 'The First Schedule put these three in East Bengal for now.', hi: 'पहली सूची ने अभी के लिए इन तीनों को पूर्वी बंगाल में रखा।' },
      sources: [{ id: 'menon-1957', loc: 'Appendix XI, First Schedule' }],
    },
  },
  {
    id: 'first-schedule-fake',
    tier: 1,
    real: false,
    pair: 'first-schedule',
    from: { en: 'Records Section, New Delhi', hi: 'रिकॉर्ड विभाग, नई दिल्ली' },
    to: CIPHER,
    text: {
      en: "The Act's First Schedule lists Khulna and the Chittagong Hill Tracts in East Bengal, but not Murshidabad, Nadia or Malda.",
      hi: 'क़ानून की पहली सूची खुलना और चटगाँव हिल ट्रैक्ट्स को पूर्वी बंगाल में रखती है, मुर्शिदाबाद, नदिया या मालदा को नहीं।',
    },
    checks: { en: ['Khulna and the Chittagong Hill Tracts in East Bengal'], hi: ['खुलना और चटगाँव हिल ट्रैक्ट्स को पूर्वी बंगाल में'] },
    tells: [
      {
        kind: 'place',
        explain: {
          en: 'Murshidabad, Nadia and Malda were listed, not Khulna or the Hill Tracts.',
          hi: 'सूची में मुर्शिदाबाद, नदिया और मालदा थे, खुलना या हिल ट्रैक्ट्स नहीं।',
        },
        factId: 'notional',
        sources: [{ id: 'menon-1957', loc: 'Appendix XI, First Schedule; ch. XVII' }],
      },
    ],
  },

  // ───────────── Undated, tier 2: habits, weekdays, the form, the rulebook ─────────────

  {
    id: 'priority-format-real',
    tier: 2,
    real: true,
    pair: 'priority-format',
    from: TEL_LAHORE,
    to: CIPHER,
    text: {
      en: "MOST IMMEDIATE. UNNUMBERED. Please repeat the Partition Council statement of 22 July, accepting the awards 'whatever these may be'.",
      hi: "MOST IMMEDIATE. UNNUMBERED. कृपया 22 जुलाई का पार्टिशन काउंसिल का बयान फिर भेजें, कि फ़ैसले 'चाहे जो भी हों' माने जाएँगे।",
    },
    checks: { en: ['MOST IMMEDIATE. UNNUMBERED.', '22 July'], hi: ['MOST IMMEDIATE. UNNUMBERED.', '22 जुलाई'] },
    why: {
      text: {
        en: 'Real header style; on 22 July both sides pledged to accept the awards.',
        hi: 'ऊपर का हिस्सा असली तारों जैसा; 22 जुलाई को दोनों पक्षों ने फ़ैसले मानने का वादा किया।',
      },
      sources: [{ id: 'mansergh-xii', loc: 'No. 477 (header); Introduction' }, { id: 'menon-1957', loc: 'ch. XVIII' }],
    },
  },
  {
    id: 'priority-format-fake',
    tier: 2,
    real: false,
    pair: 'priority-format',
    from: TEL_LAHORE,
    to: CIPHER,
    text: {
      en: "URGENT!! Ref: 3408/S/47. Please repeat the Partition Council statement of 22 July, accepting the awards 'whatever these may be'.",
      hi: "URGENT!! Ref: 3408/S/47. कृपया 22 जुलाई का पार्टिशन काउंसिल का बयान फिर भेजें, कि फ़ैसले 'चाहे जो भी हों' माने जाएँगे।",
    },
    checks: { en: ['URGENT!!', 'Ref: 3408/S/47'], hi: ['URGENT!!', 'Ref: 3408/S/47'] },
    tells: [
      {
        kind: 'form',
        explain: {
          en: "Priorities read IMPORTANT, IMMEDIATE or MOST IMMEDIATE, not 'URGENT!!'; numbers, 'No. 3408-S'.",
          hi: "प्राथमिकता IMPORTANT, IMMEDIATE या MOST IMMEDIATE होती है, 'URGENT!!' नहीं; नंबर 'No. 3408-S' जैसा।",
        },
        ruleId: 'priority',
        sources: [{ id: 'mansergh-xii', loc: 'Nos. 391, 462, 477, 485 (headers)' }],
      },
    ],
  },

  {
    id: 'sign-off-real',
    tier: 2,
    real: true,
    pair: 'sign-off',
    from: GOV_SEC_LAHORE,
    to: CIPHER,
    text: {
      en: 'Office note for the file: the Punjab Commission sat in public in Lahore from 21 to 31 July, except Sunday the 27th.',
      hi: 'फ़ाइल के लिए दफ़्तरी नोट: पंजाब कमीशन की खुली सुनवाई लाहौर में 21 से 31 जुलाई तक हुई, रविवार 27 तारीख़ को छोड़कर।',
    },
    checks: { en: ['21 to 31 July', 'Sunday the 27th'], hi: ['21 से 31 जुलाई', 'रविवार 27 तारीख़'] },
    why: {
      text: {
        en: "The award gives these dates, 'with the exception of Sunday, the 27th'.",
        hi: "फ़ैसले में यही तारीख़ें हैं, 'रविवार 27 जुलाई को छोड़कर'।",
      },
      sources: [{ id: 'mansergh-xii', loc: 'No. 488, Appendix I, para 5' }],
    },
  },
  {
    id: 'sign-off-fake',
    tier: 2,
    real: false,
    pair: 'sign-off',
    from: GOV_SEC_LAHORE,
    to: CIPHER,
    text: {
      en: 'Office note for the file: the Punjab Commission sat in public in Lahore from 21 to 31 July, except Sunday the 27th. Jai Hind.',
      hi: 'फ़ाइल के लिए दफ़्तरी नोट: पंजाब कमीशन की खुली सुनवाई लाहौर में 21 से 31 जुलाई तक हुई, रविवार 27 तारीख़ को छोड़कर। जय हिंद।',
    },
    checks: { en: ['Jai Hind'], hi: ['जय हिंद'] },
    tells: [
      {
        kind: 'habit',
        explain: {
          en: "Office notes never sign off 'Jai Hind'; that closed speeches and broadcasts.",
          hi: "दफ़्तरी नोट 'जय हिंद' से ख़त्म नहीं होते; यह भाषणों और रेडियो में बोला जाता था।",
        },
        ruleId: 'begins-ends',
        sources: [{ id: 'campbell-johnson-1951', loc: 'entry for 3 June 1947' }],
      },
    ],
  },

  {
    id: 'today-weekday-real',
    tier: 2,
    real: true,
    pair: 'today-weekday',
    from: HEAD,
    to: CLERK,
    text: {
      en: "Desk note for {weekday}, {date}: keep the Act's Schedules on the desk for checking district names.",
      hi: '{weekday}, {date} के लिए मेज़ का नोट: ज़िलों के नाम जाँचने को क़ानून की सूचियाँ मेज़ पर रखें।',
    },
    checks: { en: ['Desk note for'], hi: ['के लिए मेज़ का नोट'] },
    why: {
      text: { en: 'Weekday matches the date; 15 August 1947 is a Friday.', hi: 'दिन तारीख़ से मेल खाता है; 15 अगस्त 1947 शुक्रवार है।' },
      sources: [{ id: 'menon-1957', loc: 'Appendix XI' }],
    },
  },
  {
    id: 'today-weekday-fake',
    tier: 2,
    real: false,
    pair: 'today-weekday',
    from: HEAD,
    to: CLERK,
    text: {
      en: "Desk note for {weekday+1}, {date}: keep the Act's Schedules on the desk for checking district names.",
      hi: '{weekday+1}, {date} के लिए मेज़ का नोट: ज़िलों के नाम जाँचने को क़ानून की सूचियाँ मेज़ पर रखें।',
    },
    checks: { en: ['Desk note for'], hi: ['के लिए मेज़ का नोट'] },
    tells: [
      {
        kind: 'weekday',
        explain: { en: 'Wrong weekday, one day ahead; 15 August 1947 is a Friday.', hi: 'दिन ग़लत है, एक दिन आगे; 15 अगस्त 1947 शुक्रवार है।' },
        factId: 'appointed-day',
        ruleId: 'weekday',
      },
    ],
  },

  {
    id: 'old-names-real',
    tier: 2,
    real: true,
    pair: 'old-names',
    from: TEL_CALCUTTA,
    to: CIPHER,
    text: {
      en: 'IMMEDIATE, CALCUTTA: Bengal Boundary Commission, Justices Bijan Kumar Mukherjea, C.C. Biswas, Abu Saleh Mohamed Akram and S.A. Rahman.',
      hi: 'IMMEDIATE, कलकत्ता: बंगाल सीमा कमीशन, जस्टिस बिजन कुमार मुखर्जी, सी.सी. बिस्वास, अबू सालेह मोहम्मद अकरम और एस.ए. रहमान।',
    },
    checks: { en: ['CALCUTTA', 'S.A. Rahman'], hi: ['कलकत्ता', 'एस.ए. रहमान'] },
    why: {
      text: {
        en: "Calcutta is the 1947 name; these are the award's four Bengal judges.",
        hi: 'कलकत्ता 1947 का नाम है; ये फ़ैसले में दर्ज बंगाल के चार जज हैं।',
      },
      sources: [{ id: 'mansergh-xii', loc: 'No. 488, Appendix II' }],
    },
  },
  {
    id: 'old-names-fake',
    tier: 2,
    real: false,
    pair: 'old-names',
    from: { en: 'Telegraph Office, Kolkata', hi: 'तार घर, कोलकाता' },
    to: CIPHER,
    text: {
      en: 'IMMEDIATE, KOLKATA: Bengal Boundary Commission, Justices Bijan Kumar Mukherjea, C.C. Biswas, Abu Saleh Mohamed Akram and S.A. Rahman.',
      hi: 'IMMEDIATE, कोलकाता: बंगाल सीमा कमीशन, जस्टिस बिजन कुमार मुखर्जी, सी.सी. बिस्वास, अबू सालेह मोहम्मद अकरम और एस.ए. रहमान।',
    },
    checks: { en: ['KOLKATA'], hi: ['कोलकाता'] },
    tells: [
      {
        kind: 'anachronism',
        explain: { en: 'Calcutta, not Kolkata: every 1947 telegram says Calcutta.', hi: 'कलकत्ता, कोलकाता नहीं: 1947 के हर तार में कलकत्ता लिखा है।' },
        ruleId: 'city-names',
        sources: [{ id: 'mansergh-xii', loc: 'No. 287 (Calcutta meeting, 30 July 1947)' }],
      },
    ],
  },

  {
    id: 'council-house-real',
    tier: 2,
    real: true,
    pair: 'council-house',
    from: CA_OFFICE,
    to: CIPHER,
    text: {
      en: 'For the file: the Constituent Assembly meets in the Constitution Hall of the Council House. Its President is Dr Rajendra Prasad.',
      hi: 'फ़ाइल के लिए: संविधान सभा काउंसिल हाउस के कॉन्स्टिट्यूशन हॉल में बैठती है। उसके अध्यक्ष डॉ. राजेंद्र प्रसाद हैं।',
    },
    checks: { en: ['Constituent Assembly', 'Council House'], hi: ['संविधान सभा', 'काउंसिल हाउस'] },
    why: {
      text: { en: 'The Assembly met in the Council House, with Prasad as President.', hi: 'सभा काउंसिल हाउस में बैठती थी, अध्यक्ष प्रसाद थे।' },
      sources: [{ id: 'cad-14aug1947' }],
    },
  },
  {
    id: 'council-house-fake',
    tier: 2,
    real: false,
    pair: 'council-house',
    from: { en: 'Lok Sabha Secretariat, Parliament House', hi: 'लोकसभा सचिवालय, पार्लियामेंट हाउस' },
    to: CIPHER,
    text: {
      en: 'For the file: the Lok Sabha meets in Parliament House. Its President is Dr Rajendra Prasad.',
      hi: 'फ़ाइल के लिए: लोकसभा पार्लियामेंट हाउस में बैठती है। उसके अध्यक्ष डॉ. राजेंद्र प्रसाद हैं।',
    },
    checks: { en: ['Lok Sabha'], hi: ['लोकसभा'] },
    tells: [
      {
        kind: 'anachronism',
        explain: {
          en: 'Constituent Assembly, not Lok Sabha: there was no Lok Sabha in 1947.',
          hi: 'संविधान सभा, लोकसभा नहीं: 1947 में लोकसभा थी ही नहीं।',
        },
        ruleId: 'council-house',
        sources: [{ id: 'cad-14aug1947' }],
      },
    ],
  },

  {
    id: 'flag-resolution',
    tier: 2,
    real: true,
    pair: 'flag-adopted',
    from: { en: 'Constituent Assembly, 22 July 1947', hi: 'संविधान सभा, 22 जुलाई 1947' },
    to: { en: 'Cipher Office file', hi: 'साइफ़र दफ़्तर की फ़ाइल' },
    text: {
      en: 'Resolved that the National Flag of India shall be horizontal tricolour of deep Saffron (Kesari), white and dark green in equal proportion… a Wheel in navy blue…',
      hi: 'तय हुआ कि भारत का राष्ट्रीय झंडा आड़ा तिरंगा होगा: गहरा केसरिया, सफ़ेद और गहरा हरा, तीनों बराबर… बीच में गहरे नीले रंग का चक्र…',
    },
    checks: { en: ['deep Saffron (Kesari)', 'navy blue'], hi: ['गहरा केसरिया', 'गहरे नीले रंग'] },
    document: { sources: [{ id: 'cad-22jul1947' }] },
    why: {
      text: { en: 'The flag resolution of the Constituent Assembly, Tuesday 22 July 1947.', hi: 'संविधान सभा का झंडे का प्रस्ताव, मंगलवार 22 जुलाई 1947।' },
      sources: [{ id: 'cad-22jul1947' }],
    },
  },
  {
    id: 'flag-monday',
    tier: 2,
    real: false,
    pair: 'flag-adopted',
    from: CA_OFFICE,
    to: { en: 'Cipher Office file', hi: 'साइफ़र दफ़्तर की फ़ाइल' },
    text: {
      en: "For the file: on Monday 22 July the Assembly adopted the flag, '…deep Saffron (Kesari), white and dark green in equal proportion…'",
      hi: "फ़ाइल के लिए: सोमवार 22 जुलाई को सभा ने झंडा अपनाया, '…गहरा केसरिया, सफ़ेद और गहरा हरा, तीनों बराबर…'",
    },
    checks: { en: ['Monday 22 July'], hi: ['सोमवार 22 जुलाई'] },
    tells: [
      {
        kind: 'weekday',
        explain: { en: '22 July 1947 was a Tuesday, not a Monday.', hi: '22 जुलाई 1947 मंगलवार था, सोमवार नहीं।' },
        factId: 'appointed-day',
        ruleId: 'weekday',
        sources: [{ id: 'cad-22jul1947' }],
      },
    ],
  },

  {
    id: 'london-clock-real',
    tier: 2,
    real: true,
    pair: 'london-clock',
    from: HEAD,
    to: CLERK,
    text: {
      en: "Desk note: London 'Received' stamps can show an earlier hour than our sending time. London's clock is behind ours.",
      hi: "मेज़ का नोट: लंदन की 'Received' मुहर पर हमारे भेजने के समय से पहले का समय हो सकता है। लंदन की घड़ी हमसे पीछे है।",
    },
    checks: { en: ['earlier hour than our sending time'], hi: ['भेजने के समय से पहले'] },
    why: {
      text: {
        en: "A Karachi telegram of 8.30 pm was stamped 'Received… 5.45 pm' in London.",
        hi: "कराची का रात 8.30 का तार लंदन में 'Received… 5.45 pm' दर्ज हुआ।",
      },
      sources: [{ id: 'mansergh-xii', loc: 'No. 462' }],
    },
  },
  {
    id: 'london-clock-fake',
    tier: 2,
    real: false,
    pair: 'london-clock',
    from: HEAD,
    to: CLERK,
    text: {
      en: "Desk note: London 'Received' stamps always show a later hour, because London's clock is ahead of ours.",
      hi: "मेज़ का नोट: लंदन की 'Received' मुहर पर हमेशा बाद का समय होता है, क्योंकि लंदन की घड़ी हमसे आगे है।",
    },
    checks: { en: ["London's clock is ahead of ours"], hi: ['लंदन की घड़ी हमसे आगे'] },
    tells: [
      {
        kind: 'knowledge',
        explain: {
          en: 'London is behind India, not ahead: 8.30 pm Karachi, received 5.45 pm.',
          hi: 'लंदन भारत से पीछे है, आगे नहीं: कराची रात 8.30, लंदन में 5.45।',
        },
        factId: 'clock',
        ruleId: 'london-time',
        sources: [{ id: 'mansergh-xii', loc: 'No. 462' }],
      },
    ],
  },

  {
    id: 'travancore-real',
    tier: 2,
    real: true,
    pair: 'travancore',
    from: TRAVANCORE,
    to: VISCOUNT,
    text: {
      en: '…handed over to me by Sir C. P. Ramaswami Aiyar… I have decided, though not without hesitation, to take this step of accession… RAMA VARMA',
      hi: '…चिट्ठी मुझे सर सी.पी. रामास्वामी अय्यर ने दी है… मैंने, कुछ हिचक के साथ ही सही, भारत डोमिनियन में शामिल होने का यह क़दम उठाने का फ़ैसला किया है… रामा वर्मा',
    },
    checks: { en: ['Sir C. P. Ramaswami Aiyar', 'RAMA VARMA'], hi: ['सर सी.पी. रामास्वामी अय्यर', 'रामा वर्मा'] },
    document: { sources: [{ id: 'mansergh-xii', loc: 'No. 284' }] },
    why: {
      text: { en: 'Signed RAMA VARMA, the Maharaja; Sir C.P. was his Dewan.', hi: 'दस्तख़त रामा वर्मा, यानी महाराजा के; सर सी.पी. उनके दीवान थे।' },
      sources: [{ id: 'mansergh-xii', loc: 'No. 284' }, { id: 'menon-1956', loc: 'ch. on Travancore' }],
    },
  },
  {
    id: 'travancore-fake',
    tier: 3,
    real: false,
    pair: 'travancore',
    from: TRAVANCORE,
    to: VISCOUNT,
    text: {
      en: '…handed over to me by Sir C. P. Ramaswami Aiyar… I have decided, though not without hesitation, to take this step of accession… C. P. RAMASWAMI AIYAR, Maharaja',
      hi: '…चिट्ठी मुझे सर सी.पी. रामास्वामी अय्यर ने दी है… मैंने, कुछ हिचक के साथ ही सही, भारत डोमिनियन में शामिल होने का यह क़दम उठाने का फ़ैसला किया है… सी.पी. रामास्वामी अय्यर, महाराजा',
    },
    checks: { en: ['C. P. RAMASWAMI AIYAR, Maharaja'], hi: ['सी.पी. रामास्वामी अय्यर, महाराजा'] },
    tells: [
      {
        kind: 'name',
        explain: {
          en: 'Sir C.P. was the Dewan, not the Maharaja, who signed RAMA VARMA.',
          hi: 'सर सी.पी. दीवान थे, महाराजा नहीं; महाराजा ने रामा वर्मा नाम से दस्तख़त किए।',
        },
        sources: [{ id: 'mansergh-xii', loc: 'No. 284' }, { id: 'menon-1956', loc: 'ch. on Travancore' }],
      },
    ],
  },

  {
    id: 'house-name-real',
    tier: 2,
    real: true,
    pair: 'house-name',
    from: GOV_SEC_LAHORE,
    to: { en: 'Private Secretary, New Delhi', hi: 'निजी सचिव, नई दिल्ली' },
    text: {
      en: 'IMMEDIATE. To Private Secretary, New Delhi: your telegram received with one group [group corrupt]. Please repeat.',
      hi: 'IMMEDIATE. निजी सचिव, नई दिल्ली के लिए: आपका तार मिला, एक ग्रुप [group corrupt] है। कृपया फिर भेजें।',
    },
    checks: { en: ['[group corrupt]', 'Private Secretary, New Delhi'], hi: ['[group corrupt]', 'निजी सचिव, नई दिल्ली'] },
    why: {
      text: {
        en: "Garbled cipher groups really were marked '[group corrupt]' that week.",
        hi: "उस हफ़्ते बिगड़े साइफ़र ग्रुप पर सच में '[group corrupt]' लिखा जाता था।",
      },
      sources: [{ id: 'mansergh-xii', loc: 'No. 466 (Jenkins telegram, 13 August 1947)' }],
    },
  },
  {
    id: 'house-name-fake',
    tier: 3,
    real: false,
    pair: 'house-name',
    from: GOV_SEC_LAHORE,
    to: { en: 'Private Secretary, Rashtrapati Bhavan', hi: 'निजी सचिव, राष्ट्रपति भवन' },
    text: {
      en: 'IMMEDIATE. To Private Secretary, Rashtrapati Bhavan, New Delhi: your telegram received with one group [group corrupt]. Please repeat.',
      hi: 'IMMEDIATE. निजी सचिव, राष्ट्रपति भवन, नई दिल्ली के लिए: आपका तार मिला, एक ग्रुप [group corrupt] है। कृपया फिर भेजें।',
    },
    checks: { en: ['Rashtrapati Bhavan'], hi: ['राष्ट्रपति भवन'] },
    tells: [
      {
        kind: 'anachronism',
        explain: {
          en: "Viceroy's House, Government House from 15 August; Rashtrapati Bhavan came with the republic.",
          hi: 'वायसराय हाउस, 15 अगस्त से गवर्नमेंट हाउस; राष्ट्रपति भवन नाम गणतंत्र के साथ आया।',
        },
        sources: [{ id: 'campbell-johnson-1951', loc: 'datelines, 12 and 16 August 1947' }],
      },
    ],
  },

  // ───────────── Undated, tier 3: knowledge tells and genuine oddities ─────────────

  {
    id: 'karachi-clock-real',
    tier: 3,
    real: true,
    pair: 'karachi-clock',
    from: HEAD,
    to: CLERK,
    text: {
      en: 'Desk note: Karachi telegrams need no time conversion. Karachi keeps the same clock as Delhi.',
      hi: 'मेज़ का नोट: कराची के तारों में समय बदलने की ज़रूरत नहीं। कराची की घड़ी दिल्ली जैसी ही है।',
    },
    checks: { en: ['same clock as Delhi'], hi: ['दिल्ली जैसी ही'] },
    why: {
      text: {
        en: 'Same clock in 1947; Pakistan moved half an hour back only in 1951.',
        hi: '1947 में घड़ी एक ही थी; पाकिस्तान 1951 में आधा घंटा पीछे गया।',
      },
      sources: [{ id: 'iana-tz', loc: 'Zone Asia/Karachi (+5:30 until 30 Sep 1951)' }, { id: 'mansergh-xii', loc: 'No. 462' }],
    },
  },
  {
    id: 'karachi-clock-fake',
    tier: 3,
    real: false,
    pair: 'karachi-clock',
    from: HEAD,
    to: CLERK,
    text: {
      en: 'Desk note: Karachi keeps its clocks half an hour behind Delhi. Take 30 minutes off Karachi times.',
      hi: 'मेज़ का नोट: कराची की घड़ियाँ दिल्ली से आधा घंटा पीछे हैं। कराची के समय में से 30 मिनट घटाएँ।',
    },
    checks: { en: ['half an hour behind Delhi'], hi: ['आधा घंटा पीछे'] },
    tells: [
      {
        kind: 'knowledge',
        explain: {
          en: 'Same clock as Delhi, not half an hour behind; that began in 1951.',
          hi: 'दिल्ली वाली घड़ी, आधा घंटा पीछे नहीं; वह 1951 में शुरू हुआ।',
        },
        factId: 'clock',
        sources: [{ id: 'iana-tz', loc: 'Zone Asia/Karachi (+5:30 until 30 Sep 1951)' }],
      },
    ],
  },

  {
    id: 'radcliffe-letter',
    tier: 3,
    real: true,
    from: { en: 'Sir Cyril Radcliffe', hi: 'सर सिरिल रैडक्लिफ़' },
    to: VISCOUNT,
    text: {
      en: "THE VICEROY'S HOUSE, NEW DELHI, 23 July 1947. Dear Viceroy… The time schedule, as you know, has to be a fine one… CYRIL RADCLIFFE",
      hi: 'वायसराय हाउस, नई दिल्ली, 23 जुलाई 1947। प्रिय वायसराय… आप जानते हैं, समय बहुत तंग है… सिरिल रैडक्लिफ़',
    },
    checks: { en: ["THE VICEROY'S HOUSE, NEW DELHI", 'time schedule'], hi: ['वायसराय हाउस, नई दिल्ली', 'समय बहुत तंग'] },
    document: { sources: [{ id: 'mansergh-xii', loc: 'No. 209' }] },
    why: {
      text: {
        en: "Radcliffe's letter is headed 'The Viceroy's House': the Comptroller's House stands in its estate.",
        hi: "चिट्ठी पर 'वायसराय हाउस' लिखा है: कंप्ट्रोलर हाउस उसी अहाते में है।",
      },
      sources: [{ id: 'mansergh-xii', loc: 'No. 209' }],
    },
  },

  {
    id: 'astrologer-fake',
    tier: 3,
    real: false,
    from: { en: 'Correspondent, Bombay', hi: 'संवाददाता, बंबई' },
    to: CIPHER,
    text: {
      en: 'IMMEDIATE. Astrologers have fixed the hour: power passes at midnight because the 15th is unlucky.',
      hi: 'IMMEDIATE. ज्योतिषियों ने घड़ी तय कर दी है: सत्ता आधी रात को बदलेगी, क्योंकि 15 तारीख़ अशुभ है।',
    },
    checks: { en: ['Astrologers have fixed the hour'], hi: ['ज्योतिषियों ने घड़ी तय कर दी'] },
    tells: [
      {
        kind: 'knowledge',
        explain: {
          en: "No record backs it: power passed at midnight because the Act's day began then.",
          hi: 'किसी रिकॉर्ड में ऐसा नहीं: सत्ता आधी रात को इसलिए बदली कि क़ानून का तय दिन तभी शुरू हुआ।',
        },
        sources: [
          { id: 'campbell-johnson-1951', loc: 'entry for 7 August 1947' },
          { id: 'cad-14aug1947' },
          { id: 'collins-lapierre-1975' },
        ],
      },
    ],
  },

  {
    id: 'tryst-fake',
    tier: 3,
    real: false,
    from: { en: 'Correspondent, Madras', hi: 'संवाददाता, मद्रास' },
    to: CIPHER,
    text: {
      en: "Pandit Nehru will speak from the Red Fort on the morning of 15 August: '…a tryst with destiny…'",
      hi: "पंडित नेहरू 15 अगस्त की सुबह लाल क़िले से बोलेंगे: '…ट्रिस्ट विद डेस्टिनी…'",
    },
    checks: { en: ['from the Red Fort on the morning of 15 August'], hi: ['लाल क़िले से'] },
    tells: [
      {
        kind: 'knowledge',
        explain: { en: 'In the Assembly late on 14 August, not at the Red Fort.', hi: '14 अगस्त की देर रात संविधान सभा में, लाल क़िले पर नहीं।' },
        sources: [{ id: 'cad-14aug1947' }, { id: 'campbell-johnson-1951', loc: 'entry for 16 August 1947' }],
      },
    ],
  },

  {
    id: 'paise-fake',
    tier: 3,
    real: false,
    from: { en: 'Despatch Section, New Delhi', hi: 'डाक भेजने वाला विभाग, नई दिल्ली' },
    to: CIPHER,
    text: {
      en: 'Note: covers for the Provinces go by inland post at 10 paise a letter.',
      hi: 'नोट: सूबों के लिफ़ाफ़े देश के अंदर की डाक से जाएँगे, 10 नए पैसे की एक चिट्ठी।',
    },
    checks: { en: ['10 paise a letter'], hi: ['10 नए पैसे'] },
    tells: [
      {
        kind: 'anachronism',
        explain: {
          en: '1½ annas, not decimal paise; those came in 1957 (old pice were ¼ anna).',
          hi: "1½ आने, 'नए पैसे' नहीं: दशमलव वाले नए पैसे 1957 में आए। तब पुराना पैसा (पाव आना) चलता था।",
        },
        sources: [{ id: 'indianphilately-rates' }],
      },
    ],
  },

  {
    id: 'murshidabad-fake',
    tier: 3,
    real: false,
    from: { en: 'Correspondent, Calcutta', hi: 'संवाददाता, कलकत्ता' },
    to: CIPHER,
    text: {
      en: "MOST IMMEDIATE. Award leaked: '…Murshidabad and the whole of Nadia go to East Bengal, and Khulna stays with West Bengal…'",
      hi: "MOST IMMEDIATE. फ़ैसला लीक: '…मुर्शिदाबाद और पूरा नदिया पूर्वी बंगाल को, और खुलना पश्चिमी बंगाल के साथ…'",
    },
    checks: { en: ['Murshidabad and the whole of Nadia go to East Bengal'], hi: ['मुर्शिदाबाद और पूरा नदिया'] },
    tells: [
      {
        kind: 'knowledge',
        explain: {
          en: 'Murshidabad went to West Bengal and Khulna to East; Nadia was split.',
          hi: 'मुर्शिदाबाद पश्चिमी बंगाल को, खुलना पूर्वी बंगाल को मिला; नदिया बँट गया।',
        },
        sources: [{ id: 'menon-1957', loc: 'ch. XVII' }],
      },
    ],
  },
]
