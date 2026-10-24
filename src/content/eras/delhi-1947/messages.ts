import type { Message } from '../../types.js'

// Window: Tue 5 Aug (day 1) to Mon 18 Aug 1947 (day 14). One story, told through the desk:
// the countdown, Gandhiji's journey east, Jinnah's move to Karachi, Radcliffe's sealed line,
// midnight, freedom, the awards published, and Junagadh's surprise.
// Event days (onDay): 1 = Tue 5, 2 = Wed 6, 3 = Thu 7, 4 = Fri 8, 5 = Sat 9, 6 = Sun 10,
// 7 = Mon 11, 8 = Tue 12, 9 = Wed 13, 10 = Thu 14, 11 = Fri 15, 12 = Sat 16, 13 = Sun 17,
// 14 = Mon 18 August. The engine picks at most one message per event day.
// Undated messages may land on any day from 5 to 18 August, so they never name Mountbatten's
// title for "today" or the building's name, both of which change on 15 August, and they never
// report a dated event as "today".
// The pool grows with the mode (owner 10-24): messages with minMode 'medium' join Medium and Hard runs,
// 'hard' ones Hard runs only. Medium runs are days 1-10 (5-14 Aug), Hard runs all 14.

const HEAD = { en: 'Head Clerk, Cipher Office', hi: 'हेड क्लर्क, साइफ़र दफ़्तर' }
const CLERK = { en: 'Cipher clerk', hi: 'साइफ़र क्लर्क' }
const CIPHER = { en: 'Cipher Office, New Delhi', hi: 'साइफ़र दफ़्तर, नई दिल्ली' }
const BC = { en: 'Boundary Commission office', hi: 'सीमा कमीशन का दफ़्तर' }
const PSV = { en: 'Private Secretary to the Viceroy', hi: 'वायसराय के निजी सचिव' }
const PRESS_VH = { en: "Press Attaché, Viceroy's House", hi: 'प्रेस अताशे, वायसराय हाउस' }
const PRESS_GH = { en: 'Press Attaché, Government House', hi: 'प्रेस अताशे, गवर्नमेंट हाउस' }
const GOVT_HOUSE = { en: 'Government House, New Delhi', hi: 'गवर्नमेंट हाउस, नई दिल्ली' }
const TEL_LAHORE = { en: 'Telegraph Office, Lahore', hi: 'तार घर, लाहौर' }
const TEL_CALCUTTA = { en: 'Telegraph Office, Calcutta', hi: 'तार घर, कलकत्ता' }
const TEL_KARACHI = { en: 'Telegraph Office, Karachi', hi: 'तार घर, कराची' }
const TEL_DELHI = { en: 'Telegraph Office, Delhi', hi: 'तार घर, दिल्ली' }
const ABELL = { en: "G.E.B. Abell, Viceroy's secretary", hi: 'जी.ई.बी. एबेल, वायसराय के सचिव' }
const ABBOTT = { en: 'Stuart Abbott, Lahore', hi: 'स्टुअर्ट एबट, लाहौर' }
const ABELL_DELHI = { en: 'G.E.B. Abell, New Delhi', hi: 'जी.ई.बी. एबेल, नई दिल्ली' }
const STATES = { en: 'States Department, New Delhi', hi: 'रियासत विभाग, नई दिल्ली' }
const CAI = { en: 'Constituent Assembly of India', hi: 'भारत की संविधान सभा' }
const CA_OFFICE = { en: 'Constituent Assembly Office, Council House', hi: 'संविधान सभा का दफ़्तर, काउंसिल हाउस' }
const RECORD = { en: 'Official record', hi: 'सरकारी रिकॉर्ड' }
const MENON = { en: 'V.P. Menon, New Delhi', hi: 'वी.पी. मेनन, नई दिल्ली' }
const DEWAN = { en: 'Dewan of Junagadh', hi: 'जूनागढ़ के दीवान' }
const AWARD = { en: "Radcliffe's Punjab award", hi: 'रैडक्लिफ़ का पंजाब फ़ैसला' }
const GAZETTE = { en: 'Gazette of India Extraordinary', hi: 'गज़ट ऑफ़ इंडिया का ख़ास अंक' }
const WYLIE = { en: 'Sir F. Wylie, Governor, Lucknow', hi: 'सर एफ़. वाइली, गवर्नर, लखनऊ' }
const VISCOUNT = { en: 'Viscount Mountbatten of Burma', hi: 'बर्मा के वाइकाउंट माउंटबेटन' }
const TRAVANCORE = { en: 'Maharaja of Travancore, Trivandrum', hi: 'त्रावणकोर के महाराजा, त्रिवेंद्रम' }
const LISTOWEL = { en: 'Earl of Listowel, London', hi: 'अर्ल ऑफ़ लिस्टोवेल, लंदन' }

export const messages: Message[] = [
  // ───────────── Day 1, Tue 5 Aug: ten days left ─────────────
  {
    id: 'd1-calendar',
    tier: 1,
    real: true,
    pair: 'calendar',
    onDay: 1,
    from: { en: "Viceroy's House, New Delhi", hi: 'वायसराय हाउस, नई दिल्ली' },
    to: { en: 'Staff desks', hi: 'स्टाफ़ की मेज़ें' },
    text: {
      en: "The Viceroy's tear-off calendar, one for each staff desk. Today's leaf reads: '10 Days left to prepare for the Transfer of Power'.",
      hi: "वायसराय का फाड़ने वाला कैलेंडर, स्टाफ़ की हर मेज़ के लिए एक। आज के पन्ने पर लिखा है: 'सत्ता सौंपने की तैयारी के लिए 10 दिन बाकी'।",
    },
    checks: { en: ['10 Days left'], hi: ['10 दिन बाकी'] },
    verify: { '10 Days left': 'fact:appointed-day' },
    why: {
      text: {
        en: "Mountbatten's real calendar counted down; 5 to 15 August is ten days.",
        hi: 'माउंटबेटन का असली कैलेंडर उल्टी गिनती गिनता था; 5 से 15 अगस्त तक दस दिन हैं।',
      },
      sources: [{ id: 'campbell-johnson-1951', loc: 'entry for 22 July 1947' }],
    },
  },
  {
    id: 'd1-calendar-twelve',
    tier: 1,
    real: false,
    pair: 'calendar',
    onDay: 1,
    from: { en: "Viceroy's House, New Delhi", hi: 'वायसराय हाउस, नई दिल्ली' },
    to: { en: 'Staff desks', hi: 'स्टाफ़ की मेज़ें' },
    text: {
      en: "The Viceroy's tear-off calendar, one for each staff desk. Today's leaf reads: '12 Days left to prepare for the Transfer of Power'.",
      hi: "वायसराय का फाड़ने वाला कैलेंडर, स्टाफ़ की हर मेज़ के लिए एक। आज के पन्ने पर लिखा है: 'सत्ता सौंपने की तैयारी के लिए 12 दिन बाकी'।",
    },
    checks: { en: ['12 Days left'], hi: ['12 दिन बाकी'] },
    tells: [
      {
        kind: 'number',
        explain: {
          en: 'Ten days, not twelve: today is 5 August, freedom day the 15th.',
          hi: 'बारह नहीं, दस दिन: आज 5 अगस्त है, आज़ादी का दिन 15 को।',
        },
        factId: 'appointed-day',
        sources: [{ id: 'campbell-johnson-1951', loc: 'entry for 22 July 1947' }],
      },
    ],
  },

  // ───────────── Day 2, Wed 6 Aug: Gandhiji leaves Lahore ─────────────
  {
    id: 'd2-gandhi-lahore',
    tier: 1,
    real: true,
    pair: 'gandhi-lahore',
    onDay: 2,
    from: TEL_LAHORE,
    to: CIPHER,
    text: {
      en: 'IMMEDIATE. Gandhiji leaves Lahore by the Calcutta Mail this evening. He will stop a day in Patna, then go on to Calcutta and Noakhali.',
      hi: 'IMMEDIATE. गांधीजी आज शाम कलकत्ता मेल से लाहौर से निकल रहे हैं। वे एक दिन पटना रुकेंगे, फिर कलकत्ता और नोआखाली जाएँगे।',
    },
    checks: { en: ['go on to Calcutta'], hi: ['फिर कलकत्ता'] },
    why: {
      text: {
        en: "Gandhi's own letter, Lahore, 6 August: Calcutta Mail, a day in Patna, then Calcutta.",
        hi: 'गांधी की अपनी चिट्ठी, लाहौर, 6 अगस्त: कलकत्ता मेल, एक दिन पटना, फिर कलकत्ता।',
      },
      sources: [{ id: 'cwmg-89', loc: 'Letter to Vallabhbhai Patel, Lahore, 6 August 1947' }],
    },
  },
  {
    id: 'd2-gandhi-week',
    tier: 1,
    real: false,
    pair: 'gandhi-lahore',
    onDay: 2,
    from: TEL_LAHORE,
    to: CIPHER,
    text: {
      en: 'IMMEDIATE. Gandhiji leaves Lahore by the Calcutta Mail this evening. He will stop a week in Patna and reach Calcutta on the 15th.',
      hi: 'IMMEDIATE. गांधीजी आज शाम कलकत्ता मेल से लाहौर से निकल रहे हैं। वे एक हफ़्ता पटना रुकेंगे और 15 तारीख़ को कलकत्ता पहुँचेंगे।',
    },
    checks: { en: ['reach Calcutta on the 15th'], hi: ['15 तारीख़ को कलकत्ता'] },
    tells: [
      {
        kind: 'date',
        explain: {
          en: 'He reached Calcutta on 9 August, not the 15th, after one day in Patna.',
          hi: 'वे पटना में एक दिन रुककर 9 अगस्त को कलकत्ता पहुँचे, 15 को नहीं।',
        },
        factId: 'gandhi',
        sources: [{ id: 'cwmg-89', loc: 'Letter to Vallabhbhai Patel, Lahore, 6 August 1947; Sodepur, 9 August 1947' }],
      },
    ],
  },

  // ───────────── Day 3, Thu 7 Aug: Jinnah leaves Delhi ─────────────
  {
    id: 'd3-jinnah-karachi',
    tier: 1,
    real: true,
    pair: 'jinnah-karachi',
    onDay: 3,
    from: PRESS_VH,
    to: CIPHER,
    text: {
      en: 'For the file: Mr Jinnah flew from Delhi to Karachi today, bidding farewell to India and all his old associations.',
      hi: 'फ़ाइल के लिए: मिस्टर जिन्ना आज दिल्ली से हवाई जहाज़ से कराची गए। उन्होंने भारत और अपने सब पुराने साथियों से विदा ली।',
    },
    checks: { en: ['Mr Jinnah', 'to Karachi today'], hi: ['मिस्टर जिन्ना', 'कराची गए'] },
    why: {
      text: {
        en: "Menon: 'On 7 August Jinnah bade farewell to India… and flew to Karachi.'",
        hi: "मेनन: '7 अगस्त को जिन्ना ने भारत से विदा ली… और कराची चले गए।'",
      },
      sources: [{ id: 'menon-1957', loc: 'ch. XVIII' }],
    },
  },
  {
    id: 'd3-jinnah-lahore',
    tier: 1,
    real: false,
    pair: 'jinnah-karachi',
    onDay: 3,
    from: PRESS_VH,
    to: CIPHER,
    text: {
      en: 'For the file: Mr Jinnah flew from Delhi to Lahore today, bidding farewell to India and all his old associations.',
      hi: 'फ़ाइल के लिए: मिस्टर जिन्ना आज दिल्ली से हवाई जहाज़ से लाहौर गए। उन्होंने भारत और अपने सब पुराने साथियों से विदा ली।',
    },
    checks: { en: ['Mr Jinnah', 'to Lahore today'], hi: ['मिस्टर जिन्ना', 'लाहौर गए'] },
    tells: [
      {
        kind: 'place',
        explain: {
          en: "Karachi, not Lahore: Jinnah flew to Karachi, Pakistan's capital.",
          hi: 'लाहौर नहीं, कराची: जिन्ना पाकिस्तान की राजधानी कराची गए।',
        },
        factId: 'jinnah',
        sources: [{ id: 'menon-1957', loc: 'ch. XVIII' }],
      },
    ],
  },

  // ───────────── Day 4, Fri 8 Aug: the secret map ─────────────
  {
    id: 'd4-abell-letter',
    tier: 2,
    real: true,
    pair: 'abell-letter',
    onDay: 4,
    from: ABELL,
    to: ABBOTT,
    text: {
      en: 'TOP SECRET. I enclose a map showing roughly the boundary which Sir Cyril Radcliffe proposes… The award itself is expected within the next 48 hours…',
      hi: 'TOP SECRET. साथ में एक नक्शा भेज रहा हूँ, जिसमें मोटे तौर पर वह सीमा है जो सर सिरिल रैडक्लिफ़ खींचना चाहते हैं… फ़ैसला ख़ुद अगले 48 घंटों में आने की उम्मीद है…',
    },
    checks: { en: ['Sir Cyril Radcliffe'], hi: ['सर सिरिल रैडक्लिफ़'] },
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
    id: 'd4-abell-signed',
    tier: 1,
    real: false,
    pair: 'abell-letter',
    onDay: 4,
    from: ABELL,
    to: ABBOTT,
    text: {
      en: 'TOP SECRET. I enclose the award itself, signed by Sir Cyril Radcliffe this morning… Please keep it sealed until it is published…',
      hi: 'TOP SECRET. साथ में ख़ुद फ़ैसला भेज रहा हूँ, जिस पर सर सिरिल रैडक्लिफ़ ने आज सुबह दस्तख़त किए… छपने तक इसे बंद रखें…',
    },
    checks: { en: ['the award itself'], hi: ['ख़ुद फ़ैसला'] },
    tells: [
      {
        kind: 'date',
        explain: {
          en: 'The awards were signed on 12 August, not today, the 8th.',
          hi: 'फ़ैसलों पर 12 अगस्त को दस्तख़त हुए, आज 8 को नहीं।',
        },
        factId: 'awards',
        sources: [{ id: 'mansergh-xii', loc: 'No. 377; No. 488' }],
      },
    ],
  },
  {
    id: 'd4-vj-broadcast',
    tier: 2,
    real: true,
    onDay: 4,
    from: PRESS_VH,
    to: { en: 'All India Radio, Delhi', hi: 'ऑल इंडिया रेडियो, दिल्ली' },
    text: {
      en: "The Viceroy, recorded today for America: '…let us remember August 15th—V.J. Day—not only as the celebration of a victory, but also as the fulfilment of a pledge.'",
      hi: "वायसराय, आज अमेरिका के लिए रिकॉर्ड किया गया: '…आइए 15 अगस्त, वी.जे. डे, को सिर्फ़ एक जीत के जश्न के रूप में नहीं, बल्कि एक वादा पूरा होने के रूप में भी याद करें।'",
    },
    checks: { en: ['August 15th'], hi: ['15 अगस्त'] },
    document: { sources: [{ id: 'campbell-johnson-1951', loc: 'entry for 8 August 1947' }] },
    why: {
      text: {
        en: "Broadcast on 15 August, the second anniversary of V.J. Day, Japan's surrender.",
        hi: '15 अगस्त को प्रसारित; उस दिन वी.जे. डे, यानी जापान के हथियार डालने, के दो साल पूरे हुए।',
      },
      sources: [{ id: 'campbell-johnson-1951', loc: 'entry for 8 August 1947' }],
    },
  },

  // ───────────── Day 5, Sat 9 Aug: Lahore asks; Gandhiji reaches Calcutta ─────────────
  {
    id: 'd5-abbott-reply',
    tier: 2,
    real: true,
    pair: 'abbott-reply',
    onDay: 5,
    from: ABBOTT,
    to: ABELL_DELHI,
    text: {
      en: 'IMMEDIATE. Governor is taking law and order action on preliminary information given… he would like the document in final form 24 hours before its release…',
      hi: 'IMMEDIATE. गवर्नर मिली हुई शुरुआती जानकारी के आधार पर क़ानून-व्यवस्था के क़दम उठा रहे हैं… वे चाहते हैं कि फ़ैसला अपने आख़िरी रूप में, छपने से 24 घंटे पहले मिल जाए…',
    },
    checks: { en: ['IMMEDIATE'], hi: ['IMMEDIATE'] },
    document: { sources: [{ id: 'mansergh-xii', loc: 'No. 391' }] },
    why: {
      text: {
        en: "Lahore's reply to Abell's map; the award was published only on the 17th.",
        hi: 'एबेल के नक्शे पर लाहौर का जवाब; फ़ैसला 17 को ही छपा।',
      },
      sources: [{ id: 'mansergh-xii', loc: 'No. 391; No. 489' }],
    },
  },
  {
    id: 'd5-abbott-urgent',
    tier: 2,
    real: false,
    pair: 'abbott-reply',
    onDay: 5,
    from: ABBOTT,
    to: ABELL_DELHI,
    text: {
      en: 'URGENT. Governor is taking law and order action on preliminary information given… he would like the document in final form 24 hours before its release…',
      hi: 'URGENT. गवर्नर मिली हुई शुरुआती जानकारी के आधार पर क़ानून-व्यवस्था के क़दम उठा रहे हैं… वे चाहते हैं कि फ़ैसला अपने आख़िरी रूप में, छपने से 24 घंटे पहले मिल जाए…',
    },
    checks: { en: ['URGENT'], hi: ['URGENT'] },
    tells: [
      {
        kind: 'form',
        explain: {
          en: "Telegrams say IMMEDIATE or MOST IMMEDIATE, never 'URGENT'.",
          hi: "तारों पर IMMEDIATE या MOST IMMEDIATE लिखा होता है, 'URGENT' कभी नहीं।",
        },
        ruleId: 'priority',
        sources: [{ id: 'mansergh-xii', loc: 'No. 391 (header: IMMEDIATE)' }],
      },
    ],
  },
  {
    id: 'd5-gandhi-calcutta',
    tier: 1,
    real: true,
    onDay: 5,
    from: TEL_CALCUTTA,
    to: CIPHER,
    text: {
      en: 'IMMEDIATE. Gandhiji reached Calcutta today, on his way to Noakhali. He is staying at Sodepur, near the city.',
      hi: 'IMMEDIATE. गांधीजी आज कलकत्ता पहुँचे, नोआखाली जाते हुए। वे शहर के पास सोदपुर में ठहरे हैं।',
    },
    checks: { en: ['reached Calcutta today'], hi: ['आज कलकत्ता पहुँचे'] },
    why: {
      text: {
        en: 'He reached Calcutta on 9 August and spoke at a prayer meeting in Sodepur.',
        hi: 'वे 9 अगस्त को कलकत्ता पहुँचे और सोदपुर में प्रार्थना सभा में बोले।',
      },
      sources: [{ id: 'cwmg-89', loc: 'Speech at prayer meeting, Sodepur, 9 August 1947' }],
    },
  },

  // ───────────── Day 6, Sun 10 Aug: Pakistan's Assembly meets ─────────────
  {
    id: 'd6-pakistan-assembly',
    tier: 1,
    real: true,
    pair: 'pakistan-assembly',
    onDay: 6,
    from: TEL_KARACHI,
    to: CIPHER,
    text: {
      en: "IMMEDIATE. KARACHI. Pakistan's Constituent Assembly met for the first time today, at ten in the morning.",
      hi: 'IMMEDIATE. कराची। पाकिस्तान की संविधान सभा आज पहली बार बैठी, सुबह दस बजे।',
    },
    checks: { en: ['KARACHI'], hi: ['कराची'] },
    why: {
      text: {
        en: "Its first sitting: Karachi, Sunday 10 August 1947, at ten o'clock.",
        hi: 'पहली बैठक: कराची, रविवार 10 अगस्त 1947, सुबह दस बजे।',
      },
      sources: [{ id: 'capd-1947', loc: 'No. 1, Sunday 10 August 1947' }],
    },
  },
  {
    id: 'd6-pakistan-sworn',
    tier: 1,
    real: false,
    pair: 'pakistan-assembly',
    onDay: 6,
    from: TEL_KARACHI,
    to: CIPHER,
    text: {
      en: "IMMEDIATE. KARACHI. Pakistan's Constituent Assembly met for the first time today, and Mr Jinnah was sworn in as Governor-General.",
      hi: 'IMMEDIATE. कराची। पाकिस्तान की संविधान सभा आज पहली बार बैठी, और मिस्टर जिन्ना ने गवर्नर-जनरल की शपथ ली।',
    },
    checks: { en: ['sworn in as Governor-General'], hi: ['गवर्नर-जनरल की शपथ ली'] },
    tells: [
      {
        kind: 'date',
        explain: {
          en: 'Jinnah was sworn in as Governor-General on 15 August, not the 10th.',
          hi: 'जिन्ना ने गवर्नर-जनरल की शपथ 15 अगस्त को ली, 10 को नहीं।',
        },
        factId: 'jinnah',
        sources: [{ id: 'menon-1957', loc: 'ch. XVIII' }, { id: 'capd-1947', loc: 'No. 1' }],
      },
    ],
  },

  // ───────────── Day 7, Mon 11 Aug: Karachi's Assembly sits again ─────────────
  // (owner 10-24: no praise of the League anywhere, so the speech's famous line is not quoted)
  {
    id: 'd7-you-are-free',
    tier: 2,
    real: true,
    pair: 'you-are-free',
    onDay: 7,
    from: TEL_KARACHI,
    to: CIPHER,
    text: {
      en: "IMMEDIATE, KARACHI, Monday {date}. Mr Jinnah was elected President of Pakistan's Constituent Assembly today, at its second sitting.",
      hi: 'IMMEDIATE, कराची, सोमवार {date}। मिस्टर जिन्ना आज पाकिस्तान की संविधान सभा के अध्यक्ष चुने गए, उसकी दूसरी बैठक में।',
    },
    checks: { en: ['Monday', 'Mr Jinnah', 'elected President'], hi: ['सोमवार', 'मिस्टर जिन्ना', 'अध्यक्ष चुने गए'] },
    why: {
      text: {
        en: 'Elected on Monday 11 August, at the second sitting.',
        hi: 'सोमवार 11 अगस्त को, दूसरी बैठक में चुने गए।',
      },
      sources: [{ id: 'capd-1947', loc: 'No. 2, Monday 11 August 1947' }, { id: 'menon-1957', loc: 'ch. XVIII' }],
    },
  },
  {
    id: 'd7-jinnah-sunday',
    tier: 2,
    real: false,
    pair: 'you-are-free',
    onDay: 7,
    from: TEL_KARACHI,
    to: CIPHER,
    text: {
      en: "IMMEDIATE, KARACHI, Sunday {date}. Mr Jinnah was elected President of Pakistan's Constituent Assembly today, at its second sitting.",
      hi: 'IMMEDIATE, कराची, रविवार {date}। मिस्टर जिन्ना आज पाकिस्तान की संविधान सभा के अध्यक्ष चुने गए, उसकी दूसरी बैठक में।',
    },
    checks: { en: ['Sunday', 'Mr Jinnah', 'elected President'], hi: ['रविवार', 'मिस्टर जिन्ना', 'अध्यक्ष चुने गए'] },
    tells: [
      {
        kind: 'weekday',
        explain: { en: '11 August 1947 was a Monday, not a Sunday.', hi: '11 अगस्त 1947 सोमवार था, रविवार नहीं।' },
        factId: 'appointed-day',
        ruleId: 'weekday',
        sources: [{ id: 'capd-1947', loc: 'No. 2, Monday 11 August 1947' }],
      },
    ],
  },

  // ───────────── Day 8, Tue 12 Aug: the awards are ready; Hyderabad waits ─────────────
  {
    id: 'd8-awards-dated',
    tier: 1,
    real: true,
    pair: 'awards-signed',
    onDay: 8,
    from: BC,
    to: PSV,
    text: {
      en: 'MOST IMMEDIATE. Sir Cyril Radcliffe has finished the Punjab and Bengal awards, dated New Delhi, 12 August 1947. The Sylhet award is not ready.',
      hi: 'MOST IMMEDIATE. सर सिरिल रैडक्लिफ़ ने पंजाब और बंगाल के फ़ैसले पूरे कर लिए हैं, तारीख़ नई दिल्ली, 12 अगस्त 1947। सिलहट का फ़ैसला अभी तैयार नहीं।',
    },
    checks: { en: ['12 August 1947', 'Sylhet award is not ready'], hi: ['12 अगस्त 1947', 'सिलहट का फ़ैसला अभी तैयार नहीं'] },
    verify: { '12 August 1947': 'fact:awards' },
    why: {
      text: {
        en: "Both dated 12 August; Radcliffe called them 'complete and ready' that evening.",
        hi: "दोनों पर 12 अगस्त की तारीख़; उसी शाम रैडक्लिफ़ ने इन्हें 'पूरे और तैयार' बताया।",
      },
      sources: [{ id: 'mansergh-xii', loc: 'No. 488 and Appendix I, note 21' }, { id: 'campbell-johnson-1951', loc: 'entry for 12 August 1947' }],
    },
  },
  {
    id: 'd8-awards-all-three',
    tier: 1,
    real: false,
    pair: 'awards-signed',
    onDay: 8,
    from: BC,
    to: PSV,
    text: {
      en: 'MOST IMMEDIATE. Sir Cyril Radcliffe has signed all three awards today: Punjab, Bengal and Sylhet. They will be published on the 15th.',
      hi: 'MOST IMMEDIATE. सर सिरिल रैडक्लिफ़ ने आज तीनों फ़ैसलों पर दस्तख़त कर दिए: पंजाब, बंगाल और सिलहट। ये 15 तारीख़ को छपेंगे।',
    },
    checks: { en: ['all three awards today', 'published on the 15th'], hi: ['तीनों फ़ैसलों पर', '15 तारीख़ को छपेंगे'] },
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

  // ───────────── Day 9, Wed 13 Aug: Sylhet; Beliaghata ─────────────
  {
    id: 'd9-sylhet-signed',
    tier: 1,
    real: true,
    pair: 'sylhet',
    onDay: 9,
    from: BC,
    to: PSV,
    text: {
      en: 'IMMEDIATE. Sir Cyril Radcliffe signed the Sylhet award today. All three awards stay sealed while His Excellency is in Karachi.',
      hi: 'IMMEDIATE. सर सिरिल रैडक्लिफ़ ने आज सिलहट के फ़ैसले पर दस्तख़त किए। हिज़ एक्सेलेंसी कराची में हैं, तब तक तीनों फ़ैसले बंद रहेंगे।',
    },
    checks: { en: ['Sylhet award today', 'stay sealed'], hi: ['सिलहट के फ़ैसले पर', 'बंद रहेंगे'] },
    verify: { 'stay sealed': 'fact:awards' },
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
  {
    id: 'd9-sylhet-tomorrow',
    tier: 1,
    real: false,
    pair: 'sylhet',
    onDay: 9,
    from: BC,
    to: PSV,
    text: {
      en: 'IMMEDIATE. Sir Cyril Radcliffe signed the Sylhet award today. All three awards will be published tomorrow, the 14th.',
      hi: 'IMMEDIATE. सर सिरिल रैडक्लिफ़ ने आज सिलहट के फ़ैसले पर दस्तख़त किए। तीनों फ़ैसले कल, 14 तारीख़ को छपेंगे।',
    },
    checks: { en: ['Sylhet award today', 'published tomorrow, the 14th'], hi: ['सिलहट के फ़ैसले पर', 'कल, 14 तारीख़ को छपेंगे'] },
    tells: [
      {
        kind: 'date',
        explain: {
          en: 'Published Sunday 17 August, after the celebrations, not on the 14th.',
          hi: 'फ़ैसले जश्न के बाद, रविवार 17 अगस्त को छपे, 14 को नहीं।',
        },
        factId: 'awards',
        sources: [{ id: 'mansergh-xii', loc: 'No. 489' }, { id: 'campbell-johnson-1951', loc: 'entry for 12 August 1947' }],
      },
    ],
  },
  {
    id: 'd9-beliaghata',
    tier: 1,
    real: true,
    pair: 'beliaghata',
    onDay: 9,
    from: TEL_CALCUTTA,
    to: CIPHER,
    text: {
      en: "IMMEDIATE. Gandhiji has moved into a house in Beliaghata with Mr Suhrawardy. He writes: 'I have taken many risks, perhaps this is the greatest of all.'",
      hi: "IMMEDIATE. गांधीजी मिस्टर सुहरावर्दी के साथ बेलियाघाटा के एक घर में आ गए हैं। वे लिखते हैं: 'मैंने बहुत जोखिम उठाए हैं, शायद यह सबसे बड़ा है।'",
    },
    checks: { en: ['Beliaghata', 'Mr Suhrawardy'], hi: ['बेलियाघाटा', 'मिस्टर सुहरावर्दी'] },
    document: { sources: [{ id: 'cwmg-89', loc: 'Letter to Satis Chandra Das Gupta, Hydari Mansion, 13 August 1947' }] },
    why: {
      text: {
        en: "13 August evening: Gandhi and Suhrawardy, Bengal's outgoing Premier, began living together.",
        hi: '13 अगस्त की शाम: गांधी और बंगाल के जाते हुए प्रीमियर सुहरावर्दी साथ रहने लगे।',
      },
      sources: [{ id: 'cwmg-89', loc: 'Introduction; letters from Beliaghata, 13 August 1947' }],
    },
  },
  {
    id: 'd9-gandhi-delhi',
    tier: 1,
    real: false,
    pair: 'beliaghata',
    onDay: 9,
    from: TEL_CALCUTTA,
    to: CIPHER,
    text: {
      en: 'IMMEDIATE. Gandhiji leaves Calcutta tonight for Delhi, to be at the midnight session in the Council House tomorrow.',
      hi: 'IMMEDIATE. गांधीजी आज रात कलकत्ता से दिल्ली के लिए निकल रहे हैं, ताकि कल काउंसिल हाउस की आधी रात की बैठक में रहें।',
    },
    checks: { en: ['leaves Calcutta tonight', 'for Delhi'], hi: ['आज रात कलकत्ता से', 'दिल्ली के लिए'] },
    tells: [
      {
        kind: 'place',
        explain: {
          en: 'Gandhiji stayed in Calcutta and fasted there on the 15th.',
          hi: 'गांधीजी कलकत्ता में ही रहे और 15 को वहीं उपवास किया।',
        },
        factId: 'gandhi',
        sources: [{ id: 'cwmg-89', loc: 'Introduction; letter to Agatha Harrison, 15 August 1947' }],
      },
    ],
  },

  // ───────────── Day 10, Thu 14 Aug: Karachi, Lucknow, midnight ─────────────
  {
    id: 'd10-session-record',
    tier: 2,
    real: true,
    pair: 'midnight-session',
    onDay: 10,
    from: CAI,
    to: RECORD,
    text: {
      en: '…commenced in the Constitution Hall, New Delhi, at Eleven P. M.… Mr. President: It is just half a minute to 12. I am expecting the clock to strike 12.',
      hi: '…सत्र रात ग्यारह बजे कॉन्स्टिट्यूशन हॉल, नई दिल्ली में शुरू हुआ… अध्यक्ष: 12 बजने में बस आधा मिनट है। मैं घड़ी के 12 बजाने का इंतज़ार कर रहा हूँ।',
    },
    checks: { en: ['Eleven P. M.', 'Mr. President'], hi: ['रात ग्यारह बजे', 'अध्यक्ष'] },
    verify: { 'Eleven P. M.': 'fact:session' },
    document: { sources: [{ id: 'cad-14aug1947' }] },
    why: {
      text: {
        en: "11 pm, Prasad presiding; The Tribune: 'As the clock chimed twelve, conches blew.'",
        hi: "रात 11 बजे, अध्यक्ष प्रसाद; ट्रिब्यून ने लिखा: 'बारह बजते ही शंख बज उठे।'",
      },
      sources: [{ id: 'cad-14aug1947' }, { id: 'tribune-1947' }],
    },
  },
  {
    id: 'd10-session-president',
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
    checks: { en: ['Dr Rajendra Prasad', 'President of India'], hi: ['राजेंद्र प्रसाद', 'भारत के राष्ट्रपति'] },
    tells: [
      {
        kind: 'anachronism',
        explain: {
          en: 'President of the Constituent Assembly, not of India; India had no President yet.',
          hi: 'संविधान सभा के अध्यक्ष, भारत के राष्ट्रपति नहीं; तब भारत में राष्ट्रपति था ही नहीं।',
        },
        factId: 'session',
        ruleId: 'council-house',
        sources: [{ id: 'cad-14aug1947' }],
      },
    ],
  },
  {
    id: 'd10-karachi-viceroy',
    tier: 2,
    real: true,
    onDay: 10,
    from: { en: 'Constituent Assembly, Karachi', hi: 'संविधान सभा, कराची' },
    to: RECORD,
    text: {
      en: "KARACHI. Lord Mountbatten to Pakistan's Assembly: 'I am speaking to you today as your Viceroy. Tomorrow the Government of the new Dominion of Pakistan will rest in your hands…'",
      hi: "कराची। लॉर्ड माउंटबेटन, पाकिस्तान की सभा से: 'आज मैं आपसे आपके वायसराय के रूप में बोल रहा हूँ। कल नए डोमिनियन पाकिस्तान की सरकार आपके हाथों में होगी…'",
    },
    checks: { en: ['Lord Mountbatten', 'as your Viceroy'], hi: ['लॉर्ड माउंटबेटन', 'आपके वायसराय के रूप में'] },
    document: { sources: [{ id: 'capd-1947', loc: 'No. 4, Thursday 14 August 1947' }] },
    why: {
      text: {
        en: '14 August, 9.10 am, Jinnah presiding. Both Dominions began the next day.',
        hi: '14 अगस्त, सुबह 9.10, अध्यक्ष जिन्ना। दोनों डोमिनियन अगले दिन बने।',
      },
      sources: [{ id: 'capd-1947', loc: 'No. 4' }, { id: 'menon-1957', loc: 'ch. XVIII' }],
    },
  },

  // ───────────── Day 11, Fri 15 Aug: freedom ─────────────
  {
    id: 'd11-intimation',
    tier: 2,
    real: true,
    pair: 'fifteenth',
    onDay: 11,
    from: CAI,
    to: { en: 'Lord Mountbatten, Government House', hi: 'लॉर्ड माउंटबेटन, गवर्नमेंट हाउस' },
    text: {
      en: 'The Constituent Assembly of India has assumed power for the governance of India, and… endorsed the recommendation that Lord Mountbatten be Governor-General of India from the 15th August 1947.',
      hi: 'भारत की संविधान सभा ने भारत का शासन सँभाल लिया है, और… सिफ़ारिश मान ली है कि 15 अगस्त 1947 से लॉर्ड माउंटबेटन भारत के गवर्नर-जनरल हों।',
    },
    checks: { en: ['Lord Mountbatten', 'Governor-General of India'], hi: ['लॉर्ड माउंटबेटन', 'भारत के गवर्नर-जनरल'] },
    document: { sources: [{ id: 'cad-14aug1947' }] },
    why: {
      text: {
        en: "Carried to him after midnight; he replied, 'I am proud of the honour…'",
        hi: "आधी रात के बाद यह संदेश उन तक पहुँचा; जवाब था: 'मुझे इस सम्मान पर गर्व है…'",
      },
      sources: [{ id: 'cad-14aug1947' }, { id: 'campbell-johnson-1951', loc: 'entry for 14–15 August 1947' }],
    },
  },
  {
    id: 'd11-viceroy',
    tier: 2,
    real: false,
    pair: 'fifteenth',
    onDay: 11,
    from: { en: 'Arrangements office, Princes Park', hi: 'इंतज़ाम दफ़्तर, प्रिंसेस पार्क' },
    to: GOVT_HOUSE,
    text: {
      en: 'IMMEDIATE. For His Excellency the Viceroy: crowd at Princes Park far above the thirty thousand planned. Flag ceremony goes ahead this evening.',
      hi: 'IMMEDIATE. हिज़ एक्सेलेंसी वायसराय के लिए: प्रिंसेस पार्क में भीड़ तय तीस हज़ार से कहीं ज़्यादा है। शाम का झंडा समारोह होगा।',
    },
    checks: { en: ['His Excellency the Viceroy', 'Princes Park'], hi: ['हिज़ एक्सेलेंसी वायसराय', 'प्रिंसेस पार्क'] },
    tells: [
      {
        kind: 'anachronism',
        explain: {
          en: 'Governor-General, not Viceroy: Kania swore him in at 8.30 that morning.',
          hi: 'गवर्नर-जनरल, वायसराय नहीं: सुबह 8.30 बजे कानिया ने उन्हें शपथ दिलाई।',
        },
        ruleId: 'renames',
        sources: [{ id: 'cad-14aug1947' }, { id: 'campbell-johnson-1951', loc: 'entry for 15 August 1947' }],
      },
    ],
  },
  {
    id: 'd11-tryst',
    tier: 2,
    real: true,
    pair: 'tryst',
    onDay: 11,
    from: CAI,
    to: RECORD,
    text: {
      en: "From last night's sitting, Pandit Nehru: '…At the stroke of the midnight hour, when the world sleeps, India will awake to life and freedom.'",
      hi: "कल रात की बैठक से, पंडित नेहरू: '…ठीक आधी रात के घंटे पर, जब दुनिया सो रही है, भारत जीवन और आज़ादी के लिए जाग उठेगा।'",
    },
    checks: { en: ['last night', 'Pandit Nehru'], hi: ['कल रात', 'पंडित नेहरू'] },
    verify: { 'last night': 'fact:tryst' },
    document: { sources: [{ id: 'cad-14aug1947' }] },
    why: {
      text: {
        en: 'Spoken in the Assembly late on 14 August, not at the Red Fort.',
        hi: '14 अगस्त की देर रात संविधान सभा में बोला गया, लाल क़िले पर नहीं।',
      },
      sources: [{ id: 'cad-14aug1947' }],
    },
  },
  {
    id: 'd11-tryst-red-fort',
    tier: 3,
    real: false,
    pair: 'tryst',
    onDay: 11,
    from: TEL_DELHI,
    to: GOVT_HOUSE,
    text: {
      en: "From the Red Fort this morning, Pandit Nehru: '…At the stroke of the midnight hour, when the world sleeps, India will awake to life and freedom.'",
      hi: "आज सुबह लाल क़िले से, पंडित नेहरू: '…ठीक आधी रात के घंटे पर, जब दुनिया सो रही है, भारत जीवन और आज़ादी के लिए जाग उठेगा।'",
    },
    checks: { en: ['Red Fort this morning', 'Pandit Nehru'], hi: ['आज सुबह लाल क़िले से', 'पंडित नेहरू'] },
    tells: [
      {
        kind: 'knowledge',
        explain: {
          en: 'Spoken in the Assembly before midnight, not at the Red Fort this morning.',
          hi: 'आधी रात से पहले संविधान सभा में बोला गया, आज सुबह लाल क़िले पर नहीं।',
        },
        factId: 'tryst',
        sources: [{ id: 'cad-14aug1947' }],
      },
      {
        kind: 'date',
        explain: {
          en: "Nehru's Red Fort flag and speech came on the 16th, not today.",
          hi: 'लाल क़िले पर नेहरू का झंडा और भाषण 16 को हुआ, आज नहीं।',
        },
        factId: 'delhi-flags',
        sources: [{ id: 'campbell-johnson-1951', loc: 'entry for 16 August 1947' }],
      },
    ],
  },
  {
    id: 'd11-gandhi-red-fort',
    tier: 2,
    real: false,
    onDay: 11,
    from: TEL_DELHI,
    to: GOVT_HOUSE,
    text: {
      en: 'IMMEDIATE. At the Red Fort this morning, Gandhiji spoke after Pandit Nehru raised the flag.',
      hi: 'IMMEDIATE. आज सुबह लाल क़िले पर पंडित नेहरू के झंडा फहराने के बाद गांधीजी बोले।',
    },
    checks: { en: ['Red Fort this morning', 'Gandhiji spoke', 'Pandit Nehru'], hi: ['आज सुबह लाल क़िले पर', 'पंडित नेहरू', 'गांधीजी बोले'] },
    tells: [
      {
        kind: 'place',
        explain: {
          en: 'Gandhiji spent the day fasting in Calcutta, not at the Red Fort.',
          hi: 'गांधीजी उस दिन कलकत्ता में उपवास पर थे, लाल क़िले पर नहीं।',
        },
        factId: 'gandhi',
        sources: [{ id: 'cwmg-89', loc: 'Letter to Agatha Harrison, Beliaghata, 15 August 1947' }],
      },
      {
        kind: 'date',
        explain: { en: 'The Red Fort flag ceremony was on the 16th, not today.', hi: 'लाल क़िले का झंडा समारोह 16 को हुआ, आज नहीं।' },
        factId: 'delhi-flags',
        sources: [{ id: 'campbell-johnson-1951', loc: 'entry for 16 August 1947' }],
      },
    ],
  },
  {
    id: 'd11-rumours',
    tier: 2,
    real: true,
    pair: 'rumours',
    onDay: 11,
    from: { en: 'Field Marshal Auchinleck', hi: 'फ़ील्ड मार्शल ऑकिनलेक' },
    to: { en: 'Joint Defence Council', hi: 'संयुक्त रक्षा परिषद' },
    text: {
      en: 'SECRET. Boundary Commission… lacking an announcement, the wildest rumours are current, and are being spread by mischief makers of whom there is no lack.',
      hi: 'SECRET. सीमा कमीशन… फ़ैसले का ऐलान न होने से सबसे बेतुकी अफ़वाहें फैली हैं, और उन्हें फैलाने वाले शरारती लोगों की कोई कमी नहीं।',
    },
    checks: { en: ['Boundary Commission', 'lacking an announcement'], hi: ['सीमा कमीशन', 'ऐलान न होने से'] },
    verify: { 'lacking an announcement': 'fact:awards' },
    document: { sources: [{ id: 'mansergh-xii', loc: 'No. 486, para 5' }] },
    why: {
      text: {
        en: "Auchinleck's note of 15 August; the award came out two days later.",
        hi: '15 अगस्त का ऑकिनलेक का नोट; फ़ैसला दो दिन बाद छपा।',
      },
      sources: [{ id: 'mansergh-xii', loc: 'No. 486; No. 489' }],
    },
  },
  {
    id: 'd11-rumours-over',
    tier: 1,
    real: false,
    pair: 'rumours',
    onDay: 11,
    from: { en: 'Field Marshal Auchinleck', hi: 'फ़ील्ड मार्शल ऑकिनलेक' },
    to: { en: 'Joint Defence Council', hi: 'संयुक्त रक्षा परिषद' },
    text: {
      en: 'SECRET. Boundary Commission… the award was announced this morning, and the rumours have already died down.',
      hi: 'SECRET. सीमा कमीशन… फ़ैसले का ऐलान आज सुबह हो गया, और अफ़वाहें थम गई हैं।',
    },
    checks: { en: ['Boundary Commission', 'announced this morning'], hi: ['सीमा कमीशन', 'ऐलान आज सुबह हो गया'] },
    tells: [
      {
        kind: 'date',
        explain: { en: 'The award came out on Sunday 17 August, not on the 15th.', hi: 'फ़ैसला रविवार 17 अगस्त को छपा, 15 को नहीं।' },
        factId: 'awards',
        sources: [{ id: 'mansergh-xii', loc: 'No. 486, para 5; No. 489' }],
      },
    ],
  },

  // ───────────── Day 12, Sat 16 Aug: the Red Fort; the leaders see the line ─────────────
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
    checks: { en: ['Red Fort', 'very early this morning'], hi: ['लाल क़िले पर', 'आज बहुत सुबह'] },
    verify: { 'very early this morning': 'fact:delhi-flags' },
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
    checks: { en: ['Red Fort', 'yesterday, 15 August'], hi: ['लाल क़िले पर', 'कल, 15 अगस्त'] },
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
  {
    id: 'd12-leaders',
    tier: 2,
    real: true,
    pair: 'leaders',
    onDay: 12,
    from: { en: 'Conference Secretary, Government House', hi: 'कॉन्फ़्रेंस सचिव, गवर्नमेंट हाउस' },
    to: CIPHER,
    text: {
      en: 'Ministers now have the awards. Pandit Nehru, Mr Liaquat Ali Khan and Sardar Patel meet Lord Mountbatten here at 5 pm.',
      hi: 'मंत्रियों को फ़ैसले मिल गए हैं। पंडित नेहरू, मिस्टर लियाक़त अली ख़ान और सरदार पटेल शाम 5 बजे यहाँ लॉर्ड माउंटबेटन से मिलेंगे।',
    },
    checks: { en: ['Sardar Patel'], hi: ['सरदार पटेल'] },
    why: {
      text: {
        en: 'Minutes: Government House, 16 August, 5 pm; Liaquat came for Pakistan.',
        hi: 'बैठक का रिकॉर्ड: गवर्नमेंट हाउस, 16 अगस्त, शाम 5 बजे; पाकिस्तान से लियाक़त आए।',
      },
      sources: [{ id: 'mansergh-xii', loc: 'No. 487' }, { id: 'campbell-johnson-1951', loc: 'entry for 16 August 1947' }],
    },
  },
  {
    id: 'd12-leaders-jinnah',
    tier: 1,
    real: false,
    pair: 'leaders',
    onDay: 12,
    from: { en: 'Conference Secretary, Government House', hi: 'कॉन्फ़्रेंस सचिव, गवर्नमेंट हाउस' },
    to: CIPHER,
    text: {
      en: 'Ministers now have the awards. Pandit Nehru, Mr Jinnah and Sardar Patel meet Lord Mountbatten here at 5 pm.',
      hi: 'मंत्रियों को फ़ैसले मिल गए हैं। पंडित नेहरू, मिस्टर जिन्ना और सरदार पटेल शाम 5 बजे यहाँ लॉर्ड माउंटबेटन से मिलेंगे।',
    },
    checks: { en: ['Mr Jinnah'], hi: ['मिस्टर जिन्ना'] },
    tells: [
      {
        kind: 'name',
        explain: {
          en: 'Liaquat came, not Jinnah, who was Governor-General in Karachi.',
          hi: 'जिन्ना नहीं, लियाक़त आए; जिन्ना कराची में गवर्नर-जनरल थे।',
        },
        factId: 'jinnah',
        sources: [{ id: 'mansergh-xii', loc: 'No. 487' }, { id: 'campbell-johnson-1951', loc: 'entry for 16 August 1947' }],
      },
    ],
  },

  // ───────────── Day 13, Sun 17 Aug: the awards are published; Junagadh in the papers ─────────────
  {
    id: 'd13-gazette-para12',
    tier: 2,
    real: true,
    pair: 'published',
    onDay: 13,
    from: AWARD,
    to: GAZETTE,
    text: {
      en: "Published today. Report dated 12 August 1947, para 12: 'I am conscious too that the award cannot go far towards satisfying sentiments and aspirations deeply held on either side…'",
      hi: "आज छपा। रिपोर्ट, तारीख़ 12 अगस्त 1947, पैरा 12: 'मैं यह भी जानता हूँ कि यह फ़ैसला दोनों तरफ़ की गहरी भावनाओं और उम्मीदों को ज़्यादा पूरा नहीं कर सकता…'",
    },
    checks: { en: ['Published today', 'dated 12 August 1947'], hi: ['आज छपा', 'तारीख़ 12 अगस्त 1947'] },
    verify: { 'Published today': 'fact:awards', 'dated 12 August 1947': 'fact:awards' },
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
    from: AWARD,
    to: GAZETTE,
    text: {
      en: "Published Saturday, {date}. Report dated 12 August 1947, para 12: '…the award cannot go far towards satisfying sentiments and aspirations deeply held on either side…'",
      hi: "शनिवार, {date} को छपा। रिपोर्ट, तारीख़ 12 अगस्त 1947, पैरा 12: '…यह फ़ैसला दोनों तरफ़ की गहरी भावनाओं और उम्मीदों को ज़्यादा पूरा नहीं कर सकता…'",
    },
    checks: { en: ['Published Saturday', 'dated 12 August 1947'], hi: ['शनिवार', 'तारीख़ 12 अगस्त 1947'] },
    verify: { 'dated 12 August 1947': 'fact:awards' },
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
  {
    id: 'd13-junagadh-query',
    tier: 1,
    real: true,
    pair: 'junagadh-query',
    onDay: 13,
    from: MENON,
    to: DEWAN,
    text: {
      en: "IMMEDIATE. From V.P. Menon, Secretary, States Ministry: today's newspapers report that Junagadh has joined Pakistan. Please confirm.",
      hi: 'IMMEDIATE. रियासत मंत्रालय के सचिव मेनन की ओर से: आज के अख़बारों में ख़बर है कि जूनागढ़ पाकिस्तान में शामिल हो गया है, कृपया पुष्टि करें।',
    },
    checks: { en: ['V.P. Menon', 'Secretary, States Ministry'], hi: ['मेनन', 'रियासत मंत्रालय के सचिव'] },
    verify: { 'Secretary, States Ministry': 'fact:states' },
    why: {
      text: {
        en: 'Menon learned of it from the newspapers of 17 August and wired at once.',
        hi: 'मेनन को इसका पता 17 अगस्त के अख़बारों से चला, और उन्होंने फ़ौरन तार भेजा।',
      },
      sources: [{ id: 'menon-1956', loc: 'ch. VI, Junagadh' }],
    },
  },
  {
    id: 'd13-junagadh-minister',
    tier: 1,
    real: false,
    pair: 'junagadh-query',
    onDay: 13,
    from: MENON,
    to: DEWAN,
    text: {
      en: "IMMEDIATE. From V.P. Menon, Minister of States: today's newspapers report that Junagadh has joined Pakistan. Please confirm.",
      hi: 'IMMEDIATE. रियासतों के मंत्री मेनन की ओर से: आज के अख़बारों में ख़बर है कि जूनागढ़ पाकिस्तान में शामिल हो गया है, कृपया पुष्टि करें।',
    },
    checks: { en: ['V.P. Menon', 'Minister of States'], hi: ['मेनन', 'रियासतों के मंत्री'] },
    tells: [
      {
        kind: 'name',
        explain: { en: 'Patel was the Minister; V.P. Menon was his Secretary.', hi: 'मंत्री पटेल थे; वी.पी. मेनन उनके सचिव थे।' },
        factId: 'states',
        sources: [{ id: 'menon-1956', loc: 'ch. V, Stopping the Gap' }],
      },
    ],
  },

  // ───────────── Day 14, Mon 18 Aug: the line is known ─────────────
  {
    id: 'd14-junagadh-reply',
    tier: 2,
    real: true,
    pair: 'junagadh-reply',
    onDay: 14,
    from: DEWAN,
    to: MENON,
    text: {
      en: 'IMMEDIATE, JUNAGADH, {weekday} {date}. Reference your telegram of yesterday: Junagadh has joined Pakistan, as announced on 15 August.',
      hi: 'IMMEDIATE, जूनागढ़, {weekday} {date}। कल के आपके तार के जवाब में: जूनागढ़ पाकिस्तान में शामिल हो गया है, जैसा 15 अगस्त को ऐलान हुआ था।',
    },
    checks: { en: ['IMMEDIATE', 'announced on 15 August'], hi: ['IMMEDIATE', '15 अगस्त को ऐलान'] },
    why: {
      text: {
        en: "Menon: 'the next day he telegraphed to me that Junagadh had acceded to Pakistan.'",
        hi: "मेनन: 'अगले दिन उन्होंने मुझे तार भेजा कि जूनागढ़ पाकिस्तान में शामिल हो गया है।'",
      },
      sources: [{ id: 'menon-1956', loc: 'ch. VI, Junagadh' }],
    },
  },
  {
    id: 'd14-junagadh-tuesday',
    tier: 2,
    real: false,
    pair: 'junagadh-reply',
    onDay: 14,
    from: DEWAN,
    to: MENON,
    text: {
      en: 'IMMEDIATE, JUNAGADH, Tuesday {date}. Reference your telegram of yesterday: Junagadh has joined Pakistan, as announced on 15 August.',
      hi: 'IMMEDIATE, जूनागढ़, मंगलवार {date}। कल के आपके तार के जवाब में: जूनागढ़ पाकिस्तान में शामिल हो गया है, जैसा 15 अगस्त को ऐलान हुआ था।',
    },
    checks: { en: ['Tuesday', 'announced on 15 August'], hi: ['मंगलवार', '15 अगस्त को ऐलान'] },
    tells: [
      {
        kind: 'weekday',
        explain: { en: '18 August 1947 was a Monday, not a Tuesday.', hi: '18 अगस्त 1947 सोमवार था, मंगलवार नहीं।' },
        factId: 'appointed-day',
        ruleId: 'weekday',
        sources: [{ id: 'menon-1956', loc: 'ch. VI, Junagadh' }],
      },
    ],
  },

  // ───────────── Undated, tier 1: caught from the case file ─────────────

  {
    id: 'radcliffe-arrival-real',
    tier: 1,
    real: true,
    pair: 'radcliffe-arrival',
    from: BC,
    to: CIPHER,
    text: {
      en: 'For the file: Sir Cyril Radcliffe landed in Delhi on 8 July, his first time in India, to draw the Punjab and Bengal borders.',
      hi: 'फ़ाइल के लिए: सर सिरिल रैडक्लिफ़ 8 जुलाई को दिल्ली उतरे, पहली बार भारत आए, पंजाब और बंगाल की सीमाएँ खींचने।',
    },
    checks: { en: ['Sir Cyril Radcliffe', '8 July', 'first time in India'], hi: ['सर सिरिल रैडक्लिफ़', '8 जुलाई', 'पहली बार भारत'] },
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
    from: BC,
    to: CIPHER,
    text: {
      en: 'For the file: Sir Cyril Radcliffe landed in Delhi on 8 June, his first time in India, to draw the Punjab and Bengal borders.',
      hi: 'फ़ाइल के लिए: सर सिरिल रैडक्लिफ़ 8 जून को दिल्ली उतरे, पहली बार भारत आए, पंजाब और बंगाल की सीमाएँ खींचने।',
    },
    checks: { en: ['Sir Cyril Radcliffe', '8 June', 'first time in India'], hi: ['सर सिरिल रैडक्लिफ़', '8 जून', 'पहली बार भारत'] },
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
    id: 'act-real',
    tier: 1,
    real: true,
    pair: 'act',
    from: HEAD,
    to: CLERK,
    text: {
      en: 'Note for the desk: the Indian Independence Act became law on Friday 18 July. Its appointed day is Friday 15 August.',
      hi: 'मेज़ के लिए नोट: भारत की आज़ादी के क़ानून को शुक्रवार 18 जुलाई को राजा की मंज़ूरी मिली। उसका तय दिन शुक्रवार 15 अगस्त है।',
    },
    checks: { en: ['Friday 18 July', 'Friday 15 August'], hi: ['शुक्रवार 18 जुलाई', 'शुक्रवार 15 अगस्त'] },
    why: {
      text: { en: 'Introduced 4 July; law, by Royal Assent, on Friday 18 July.', hi: 'बिल 4 जुलाई को पेश हुआ; शुक्रवार 18 जुलाई को राजा की मंज़ूरी से क़ानून बना।' },
      sources: [{ id: 'menon-1957', loc: 'ch. XVII' }],
    },
  },
  {
    id: 'act-fake',
    tier: 1,
    real: false,
    pair: 'act',
    from: HEAD,
    to: CLERK,
    text: {
      en: 'Note for the desk: the Indian Independence Act became law on Friday 4 July. Its appointed day is Friday 15 August.',
      hi: 'मेज़ के लिए नोट: भारत की आज़ादी के क़ानून को शुक्रवार 4 जुलाई को राजा की मंज़ूरी मिली। उसका तय दिन शुक्रवार 15 अगस्त है।',
    },
    checks: { en: ['Friday 4 July', 'Friday 15 August'], hi: ['शुक्रवार 4 जुलाई', 'शुक्रवार 15 अगस्त'] },
    tells: [
      {
        kind: 'date',
        explain: {
          en: 'Law on 18 July, not 4 July, when the Bill was only introduced.',
          hi: 'क़ानून 18 जुलाई को बना, 4 जुलाई को नहीं; तब बिल सिर्फ़ पेश हुआ था।',
        },
        factId: 'appointed-day',
        sources: [{ id: 'menon-1957', loc: 'ch. XVII' }, { id: 'mansergh-xii', loc: 'Introduction' }],
      },
    ],
  },

  {
    id: 'four-june-real',
    tier: 1,
    real: true,
    pair: 'four-june',
    from: HEAD,
    to: CLERK,
    text: {
      en: 'For the file: at his press conference on 4 June, the Viceroy first hinted that 15 August would be the likely date.',
      hi: 'फ़ाइल के लिए: 4 जून की प्रेस कॉन्फ़्रेंस में वायसराय ने पहली बार इशारा किया कि तारीख़ शायद 15 अगस्त होगी।',
    },
    checks: { en: ['15 August'], hi: ['15 अगस्त'] },
    why: {
      text: {
        en: "Campbell-Johnson: 'the first informal indication that 15th August would be the likely date'.",
        hi: "कैंपबेल-जॉनसन: '15 अगस्त के तारीख़ होने का पहला हल्का इशारा'।",
      },
      sources: [{ id: 'campbell-johnson-1951', loc: 'entry for 4 June 1947' }],
    },
  },
  {
    id: 'four-june-fake',
    tier: 1,
    real: false,
    pair: 'four-june',
    from: HEAD,
    to: CLERK,
    text: {
      en: 'For the file: at his press conference on 4 June, the Viceroy first hinted that June 1948 would be the likely date.',
      hi: 'फ़ाइल के लिए: 4 जून की प्रेस कॉन्फ़्रेंस में वायसराय ने पहली बार इशारा किया कि तारीख़ शायद जून 1948 होगी।',
    },
    checks: { en: ['June 1948'], hi: ['जून 1948'] },
    tells: [
      {
        kind: 'date',
        explain: {
          en: "15 August 1947, not June 1948, which was London's older deadline.",
          hi: '15 अगस्त 1947, जून 1948 नहीं; वह लंदन की पुरानी आख़िरी तारीख़ थी।',
        },
        factId: 'appointed-day',
        sources: [
          { id: 'campbell-johnson-1951', loc: 'entry for 4 June 1947' },
          { id: 'menon-1957', loc: 'ch. XIV (Attlee statement, 20 February 1947)' },
        ],
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
      en: 'Punjab Boundary Force under Maj-Gen T.W. Rees, set up 1 August: about 50,000 officers and men, to keep the peace in the border districts.',
      hi: 'मेजर-जनरल टी.डब्ल्यू. रीस की पंजाब बाउंड्री फ़ोर्स, 1 अगस्त को बनी: करीब 50,000 अफ़सर और जवान, सीमा के ज़िलों में शांति रखने के लिए।',
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
      en: 'Punjab Boundary Force under Maj-Gen T.W. Rees, set up 1 August: about 5,000 officers and men, to keep the peace in the border districts.',
      hi: 'मेजर-जनरल टी.डब्ल्यू. रीस की पंजाब बाउंड्री फ़ोर्स, 1 अगस्त को बनी: करीब 5,000 अफ़सर और जवान, सीमा के ज़िलों में शांति रखने के लिए।',
    },
    checks: { en: ['Maj-Gen T.W. Rees', 'about 5,000'], hi: ['टी.डब्ल्यू. रीस', 'करीब 5,000'] },
    tells: [
      {
        kind: 'number',
        explain: { en: 'About 50,000 officers and men, not 5,000.', hi: 'करीब 50,000 अफ़सर और जवान, 5,000 नहीं।' },
        factId: 'boundary-force',
        sources: [{ id: 'menon-1957', loc: 'ch. XVIII' }],
      },
    ],
  },

  {
    id: 'dominions-real',
    tier: 1,
    real: true,
    pair: 'dominions',
    from: HEAD,
    to: CLERK,
    text: {
      en: 'Note for the file: from 15 August, Lord Mountbatten is Governor-General of India, and Mr Jinnah Governor-General of Pakistan.',
      hi: 'फ़ाइल के लिए नोट: 15 अगस्त से लॉर्ड माउंटबेटन भारत के गवर्नर-जनरल हैं, और मिस्टर जिन्ना पाकिस्तान के।',
    },
    checks: { en: ['Mr Jinnah Governor-General'], hi: ['मिस्टर जिन्ना पाकिस्तान के'] },
    why: {
      text: { en: 'Two Governors-General: Mountbatten in Delhi, Jinnah in Karachi.', hi: 'दो गवर्नर-जनरल: दिल्ली में माउंटबेटन, कराची में जिन्ना।' },
      sources: [{ id: 'menon-1957', loc: 'ch. XVIII' }],
    },
  },
  {
    id: 'dominions-fake',
    tier: 1,
    real: false,
    pair: 'dominions',
    from: HEAD,
    to: CLERK,
    text: {
      en: 'Note for the file: from 15 August, Lord Mountbatten is Governor-General of both India and Pakistan.',
      hi: 'फ़ाइल के लिए नोट: 15 अगस्त से लॉर्ड माउंटबेटन भारत और पाकिस्तान, दोनों के गवर्नर-जनरल हैं।',
    },
    checks: { en: ['both India and Pakistan'], hi: ['दोनों के गवर्नर-जनरल'] },
    tells: [
      {
        kind: 'name',
        explain: {
          en: "Jinnah, not Mountbatten, became Pakistan's Governor-General; the shared post fell through.",
          hi: 'पाकिस्तान के गवर्नर-जनरल जिन्ना बने, माउंटबेटन नहीं; साझा पद की योजना नहीं चली।',
        },
        factId: 'jinnah',
        sources: [{ id: 'menon-1957', loc: 'ch. XVII (the common Governor-General); ch. XVIII' }],
      },
    ],
  },

  // ───────────── Undated, tier 2: habits, weekdays, the form, the rulebook ─────────────

  {
    id: 'pledge-real',
    tier: 2,
    real: true,
    pair: 'pledge',
    from: TEL_LAHORE,
    to: CIPHER,
    text: {
      en: "IMMEDIATE. Please repeat the Partition Council's statement of 22 July: both Governments will accept the awards, 'whatever these may be'.",
      hi: "IMMEDIATE. कृपया 22 जुलाई का पार्टिशन काउंसिल का बयान फिर भेजें: दोनों सरकारें फ़ैसले मानेंगी, 'चाहे जो भी हों'।",
    },
    checks: { en: ['IMMEDIATE'], hi: ['IMMEDIATE'] },
    why: {
      text: {
        en: 'Real header style; on 22 July both Governments pledged to accept the awards.',
        hi: 'ऊपर का हिस्सा असली तारों जैसा; 22 जुलाई को दोनों सरकारों ने फ़ैसले मानने का वादा किया।',
      },
      sources: [{ id: 'mansergh-xii', loc: 'No. 477 (header); Introduction' }, { id: 'menon-1957', loc: 'ch. XVIII' }],
    },
  },
  {
    id: 'pledge-urgent',
    tier: 2,
    real: false,
    pair: 'pledge',
    from: TEL_LAHORE,
    to: CIPHER,
    text: {
      en: "URGENT!! Please repeat the Partition Council's statement of 22 July: both Governments will accept the awards, 'whatever these may be'.",
      hi: "URGENT!! कृपया 22 जुलाई का पार्टिशन काउंसिल का बयान फिर भेजें: दोनों सरकारें फ़ैसले मानेंगी, 'चाहे जो भी हों'।",
    },
    checks: { en: ['URGENT!!'], hi: ['URGENT!!'] },
    tells: [
      {
        kind: 'form',
        explain: {
          en: "Priorities read IMPORTANT, IMMEDIATE or MOST IMMEDIATE, never 'URGENT!!'.",
          hi: "प्राथमिकता IMPORTANT, IMMEDIATE या MOST IMMEDIATE होती है, 'URGENT!!' कभी नहीं।",
        },
        ruleId: 'priority',
        sources: [{ id: 'mansergh-xii', loc: 'Nos. 391, 462, 477, 485 (headers)' }],
      },
    ],
  },

  {
    id: 'no-contact-real',
    tier: 2,
    real: true,
    pair: 'no-contact',
    from: HEAD,
    to: CLERK,
    text: {
      en: 'Standing order: no one in this House may contact Sir Cyril Radcliffe about the awards, which must be his alone.',
      hi: 'स्थायी आदेश: इस हाउस में कोई भी सर सिरिल रैडक्लिफ़ से फ़ैसलों के बारे में बात नहीं करेगा; फ़ैसले सिर्फ़ उनके अपने हों।',
    },
    checks: { en: ['Sir Cyril Radcliffe'], hi: ['सर सिरिल रैडक्लिफ़'] },
    why: {
      text: {
        en: 'Mountbatten ordered staff to have no contact with Radcliffe; whether it held is disputed.',
        hi: 'माउंटबेटन ने स्टाफ़ से कहा था कि रैडक्लिफ़ से कोई संपर्क न रखें; यह निभा या नहीं, इस पर बहस है।',
      },
      sources: [{ id: 'campbell-johnson-1951', loc: 'entry for 9 August 1947' }],
    },
  },
  {
    id: 'no-contact-jai-hind',
    tier: 2,
    real: false,
    pair: 'no-contact',
    from: HEAD,
    to: CLERK,
    text: {
      en: 'Standing order: no one in this House may contact Sir Cyril Radcliffe about the awards, which must be his alone. Jai Hind.',
      hi: 'स्थायी आदेश: इस हाउस में कोई भी सर सिरिल रैडक्लिफ़ से फ़ैसलों के बारे में बात नहीं करेगा; फ़ैसले सिर्फ़ उनके अपने हों। जय हिंद।',
    },
    checks: { en: ['Jai Hind'], hi: ['जय हिंद'] },
    tells: [
      {
        kind: 'habit',
        explain: {
          en: "Office notes never end with a slogan; 'Jai Hind' closed speeches and broadcasts.",
          hi: "दफ़्तरी नोट नारे से ख़त्म नहीं होते; 'जय हिंद' भाषणों और रेडियो में बोला जाता था।",
        },
        ruleId: 'slogans',
        sources: [{ id: 'campbell-johnson-1951', loc: 'entry for 3 June 1947' }],
      },
    ],
  },

  {
    id: 'calcutta-real',
    tier: 2,
    real: true,
    pair: 'calcutta',
    from: TEL_CALCUTTA,
    to: CIPHER,
    text: {
      en: 'IMMEDIATE, CALCUTTA. The Bengal Commission sat in public here from 16 to 24 July. Sir Cyril Radcliffe did not attend in person.',
      hi: 'IMMEDIATE, कलकत्ता। बंगाल कमीशन की खुली सुनवाई यहाँ 16 से 24 जुलाई तक हुई। सर सिरिल रैडक्लिफ़ ख़ुद नहीं आए।',
    },
    checks: { en: ['CALCUTTA'], hi: ['कलकत्ता'] },
    why: {
      text: {
        en: "His own award: 'I did not attend the public sittings in person.'",
        hi: "उनके अपने फ़ैसले में: 'मैं खुली सुनवाई में ख़ुद शामिल नहीं हुआ।'",
      },
      sources: [{ id: 'mansergh-xii', loc: 'No. 488, Appendix II, para 5' }],
    },
  },
  {
    id: 'calcutta-kolkata',
    tier: 2,
    real: false,
    pair: 'calcutta',
    from: { en: 'Telegraph Office, Kolkata', hi: 'तार घर, कोलकाता' },
    to: CIPHER,
    text: {
      en: 'IMMEDIATE, KOLKATA. The Bengal Commission sat in public here from 16 to 24 July. Sir Cyril Radcliffe did not attend in person.',
      hi: 'IMMEDIATE, कोलकाता। बंगाल कमीशन की खुली सुनवाई यहाँ 16 से 24 जुलाई तक हुई। सर सिरिल रैडक्लिफ़ ख़ुद नहीं आए।',
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
      en: 'For the file: power passes to the Constituent Assembly, which sits in the Council House with Dr Rajendra Prasad presiding.',
      hi: 'फ़ाइल के लिए: सत्ता संविधान सभा को मिलती है, जो काउंसिल हाउस में बैठती है, अध्यक्ष डॉ. राजेंद्र प्रसाद।',
    },
    checks: { en: ['Dr Rajendra Prasad'], hi: ['राजेंद्र प्रसाद'] },
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
      en: 'For the file: power passes to the Lok Sabha, which sits in Parliament House with Dr Rajendra Prasad presiding.',
      hi: 'फ़ाइल के लिए: सत्ता लोकसभा को मिलती है, जो पार्लियामेंट हाउस में बैठती है, अध्यक्ष डॉ. राजेंद्र प्रसाद।',
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
    from: CAI,
    to: { en: 'Cipher Office file', hi: 'साइफ़र दफ़्तर की फ़ाइल' },
    text: {
      en: 'Tuesday 22 July. Resolved that the National Flag of India shall be horizontal tricolour of deep Saffron (Kesari), white and dark green in equal proportion… a Wheel in navy blue…',
      hi: 'मंगलवार 22 जुलाई। तय हुआ कि भारत का राष्ट्रीय झंडा आड़ा तिरंगा होगा: गहरा केसरिया, सफ़ेद और गहरा हरा, तीनों बराबर… बीच में गहरे नीले रंग का चक्र…',
    },
    checks: { en: ['Tuesday 22 July'], hi: ['मंगलवार 22 जुलाई'] },
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
    from: CAI,
    to: { en: 'Cipher Office file', hi: 'साइफ़र दफ़्तर की फ़ाइल' },
    text: {
      en: 'Monday 22 July. Resolved that the National Flag of India shall be horizontal tricolour of deep Saffron (Kesari), white and dark green in equal proportion… a Wheel in navy blue…',
      hi: 'सोमवार 22 जुलाई। तय हुआ कि भारत का राष्ट्रीय झंडा आड़ा तिरंगा होगा: गहरा केसरिया, सफ़ेद और गहरा हरा, तीनों बराबर… बीच में गहरे नीले रंग का चक्र…',
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
    id: 'rashtrapati-fake',
    tier: 2,
    real: false,
    from: { en: "Governor's Secretary, Lahore", hi: 'गवर्नर के सचिव, लाहौर' },
    to: { en: 'Private Secretary, Rashtrapati Bhavan', hi: 'निजी सचिव, राष्ट्रपति भवन' },
    text: {
      en: 'IMMEDIATE. To Private Secretary, Rashtrapati Bhavan, New Delhi: the Governor asks for more troops for the Boundary Force.',
      hi: 'IMMEDIATE. निजी सचिव, राष्ट्रपति भवन, नई दिल्ली के लिए: गवर्नर बाउंड्री फ़ोर्स के लिए और फ़ौज माँग रहे हैं।',
    },
    checks: { en: ['Rashtrapati Bhavan', 'Boundary Force'], hi: ['राष्ट्रपति भवन', 'बाउंड्री फ़ोर्स'] },
    tells: [
      {
        kind: 'anachronism',
        explain: {
          en: "Viceroy's House, then Government House; Rashtrapati Bhavan came with the republic in 1950.",
          hi: 'वायसराय हाउस, फिर गवर्नमेंट हाउस; राष्ट्रपति भवन नाम 1950 में गणतंत्र के साथ आया।',
        },
        ruleId: 'renames',
        sources: [{ id: 'campbell-johnson-1951', loc: 'datelines, 12 and 16 August 1947' }],
      },
    ],
  },

  // ───────────── Undated, tier 3: knowledge tells ─────────────




  // ═════════════ Easy and up: one more undated pair, caught from the case file ═════════════
  {
    id: 'promise-real',
    tier: 1,
    real: true,
    pair: 'promise',
    from: { en: 'Sir Cyril Radcliffe', hi: 'सर सिरिल रैडक्लिफ़' },
    to: { en: 'Lord Mountbatten', hi: 'लॉर्ड माउंटबेटन' },
    text: {
      en: "THE VICEROY'S HOUSE, NEW DELHI, 23 July 1947. I do not think that I could manage the 10th: but I think that I can promise the 12th…",
      hi: 'वायसराय हाउस, नई दिल्ली, 23 जुलाई 1947। मुझे नहीं लगता कि मैं 10 तारीख़ तक कर पाऊँगा, पर लगता है कि 12 का वादा कर सकता हूँ…',
    },
    checks: { en: ['23 July 1947', 'promise the 12th'], hi: ['23 जुलाई 1947', '12 का वादा'] },
    verify: { '23 July 1947': 'fact:radcliffe', 'promise the 12th': 'fact:awards' },
    document: { sources: [{ id: 'mansergh-xii', loc: 'No. 209' }] },
    why: {
      text: {
        en: 'His letter of 23 July; the awards are indeed dated 12 August.',
        hi: '23 जुलाई की उनकी चिट्ठी; फ़ैसलों पर सच में 12 अगस्त की तारीख़ है।',
      },
      sources: [{ id: 'mansergh-xii', loc: 'No. 209; No. 488, Appendix I' }],
    },
  },
  {
    id: 'promise-june',
    tier: 1,
    real: false,
    pair: 'promise',
    from: { en: 'Sir Cyril Radcliffe', hi: 'सर सिरिल रैडक्लिफ़' },
    to: { en: 'Lord Mountbatten', hi: 'लॉर्ड माउंटबेटन' },
    text: {
      en: "THE VICEROY'S HOUSE, NEW DELHI, 23 June 1947. I do not think that I could manage the 10th: but I think that I can promise the 12th…",
      hi: 'वायसराय हाउस, नई दिल्ली, 23 जून 1947। मुझे नहीं लगता कि मैं 10 तारीख़ तक कर पाऊँगा, पर लगता है कि 12 का वादा कर सकता हूँ…',
    },
    checks: { en: ['23 June 1947', 'promise the 12th'], hi: ['23 जून 1947', '12 का वादा'] },
    verify: { 'promise the 12th': 'fact:awards' },
    tells: [
      {
        kind: 'date',
        explain: {
          en: 'He landed only on 8 July; on 23 June he was not in India.',
          hi: 'वे 8 जुलाई को ही आए; 23 जून को वे भारत में नहीं थे।',
        },
        factId: 'radcliffe',
        sources: [{ id: 'mansergh-xii', loc: 'Introduction; No. 209 (dated 23 July 1947)' }],
      },
    ],
  },

  // ═════════════ Medium and Hard (minMode 'medium'): the days lived, 8 to 14 August ═════════════
  // Day 4, Fri 8 Aug: Gandhiji at Patna
  {
    id: 'm4-patna-fast',
    tier: 1,
    real: true,
    pair: 'patna-fast',
    onDay: 4,
    minMode: 'medium',
    from: { en: 'Telegraph Office, Patna', hi: 'तार घर, पटना' },
    to: CIPHER,
    text: {
      en: 'IMMEDIATE. PATNA. At his prayer meeting today, Gandhiji said the 15th should be marked by fasting, spinning and prayer.',
      hi: 'IMMEDIATE. पटना। आज प्रार्थना सभा में गांधीजी ने कहा कि 15 तारीख़ उपवास, चरखा कातने और प्रार्थना से मनाई जाए।',
    },
    checks: { en: ['fasting, spinning and prayer'], hi: ['उपवास, चरखा कातने और प्रार्थना'] },
    verify: { 'fasting, spinning and prayer': 'fact:gandhi' },
    why: {
      text: {
        en: 'At Patna on 8 August he asked for fasting, spinning and prayer.',
        hi: '8 अगस्त को पटना में उन्होंने उपवास, कताई और प्रार्थना को कहा।',
      },
      sources: [{ id: 'cwmg-89', loc: 'Speech at prayer meeting, Patna, 8 August 1947; Chronology, p. 528' }],
    },
  },
  {
    id: 'm4-patna-feasts',
    tier: 1,
    real: false,
    pair: 'patna-fast',
    onDay: 4,
    minMode: 'medium',
    from: { en: 'Telegraph Office, Patna', hi: 'तार घर, पटना' },
    to: CIPHER,
    text: {
      en: 'IMMEDIATE. PATNA. At his prayer meeting today, Gandhiji said the 15th should be marked by lamps, fireworks and feasts.',
      hi: 'IMMEDIATE. पटना। आज प्रार्थना सभा में गांधीजी ने कहा कि 15 तारीख़ दीयों, आतिशबाज़ी और दावतों से मनाई जाए।',
    },
    checks: { en: ['lamps, fireworks and feasts'], hi: ['दीयों, आतिशबाज़ी और दावतों'] },
    tells: [
      {
        kind: 'knowledge',
        explain: {
          en: 'He asked for a fast, not feasts, and fasted himself on the 15th.',
          hi: 'उन्होंने दावत नहीं, उपवास को कहा, और 15 को ख़ुद उपवास रखा।',
        },
        factId: 'gandhi',
        sources: [{ id: 'cwmg-89', loc: 'Speech at prayer meeting, Patna, 8 August 1947' }],
      },
    ],
  },

  // Day 5, Sat 9 Aug: how the award will be announced
  {
    id: 'm5-gazette',
    tier: 2,
    real: true,
    pair: 'gazette-form',
    onDay: 5,
    minMode: 'medium',
    from: { en: "Viceroy's Staff Meeting", hi: 'वायसराय की स्टाफ़ मीटिंग' },
    to: CIPHER,
    text: {
      en: "Decided today: when the award comes, it appears as a Gazette Extraordinary, not as a communiqué from this House, to show the Commission's independence.",
      hi: 'आज तय हुआ: फ़ैसला जब आएगा, गज़ट के ख़ास अंक में छपेगा, इस हाउस के प्रेस नोट की तरह नहीं, ताकि कमीशन की आज़ादी दिखे।',
    },
    checks: { en: ['Gazette Extraordinary', 'not as a communiqué'], hi: ['गज़ट के ख़ास अंक', 'प्रेस नोट की तरह नहीं'] },
    why: {
      text: {
        en: "Campbell-Johnson, 9 August: a Gazette Extraordinary, to underline the Commission's independence.",
        hi: 'कैंपबेल-जॉनसन, 9 अगस्त: कमीशन की आज़ादी दिखाने के लिए गज़ट का ख़ास अंक।',
      },
      sources: [{ id: 'campbell-johnson-1951', loc: 'entry for 9 August 1947' }],
    },
  },
  {
    id: 'm5-communique',
    tier: 2,
    real: false,
    pair: 'gazette-form',
    onDay: 5,
    minMode: 'medium',
    from: { en: "Viceroy's Staff Meeting", hi: 'वायसराय की स्टाफ़ मीटिंग' },
    to: CIPHER,
    text: {
      en: 'Decided today: when the award comes, it appears as a communiqué from this House, not as a Gazette Extraordinary, to save time.',
      hi: 'आज तय हुआ: फ़ैसला जब आएगा, इस हाउस के प्रेस नोट की तरह छपेगा, गज़ट के ख़ास अंक में नहीं, ताकि समय बचे।',
    },
    checks: { en: ['communiqué from this House', 'not as a Gazette Extraordinary'], hi: ['इस हाउस के प्रेस नोट', 'गज़ट के ख़ास अंक में नहीं'] },
    verify: { 'communiqué from this House': 'fact:gazette-form' },
    tells: [
      {
        kind: 'form',
        explain: {
          en: "A Gazette Extraordinary was chosen, not a communiqué from Viceroy's House.",
          hi: 'गज़ट का ख़ास अंक चुना गया, वायसराय हाउस का प्रेस नोट नहीं।',
        },
        factId: 'gazette-form',
        sources: [{ id: 'campbell-johnson-1951', loc: 'entry for 9 August 1947' }],
      },
    ],
  },

  // Day 7, Mon 11 Aug: a knighthood at the farewell party

  // Day 9, Wed 13 Aug: the Viceroy wires from Karachi
  {
    id: 'm9-cash-karachi',
    tier: 2,
    real: true,
    pair: 'cash-balances',
    onDay: 9,
    minMode: 'medium',
    from: VISCOUNT,
    to: LISTOWEL,
    text: {
      en: 'MOST IMMEDIATE, KARACHI, 13 August, 8.30 pm; received 5.45 pm. I fear it is quite out of the question for you to decide the allocation of cash balances…',
      hi: 'MOST IMMEDIATE, कराची, 13 अगस्त, रात 8.30; मिला शाम 5.45। मुझे डर है कि नकद रकम का बँटवारा आप तय करें, यह बिल्कुल नहीं हो सकता…',
    },
    checks: { en: ['KARACHI', 'received 5.45 pm'], hi: ['कराची', 'मिला शाम 5.45'] },
    verify: { 'received 5.45 pm': 'rule:london-time' },
    document: { sources: [{ id: 'mansergh-xii', loc: 'No. 462' }] },
    why: {
      text: {
        en: 'Sent from Karachi; London, 4½ hours behind, logged it at 5.45.',
        hi: 'कराची से भेजा; लंदन 4½ घंटे पीछे है, वहाँ 5.45 पर दर्ज हुआ।',
      },
      sources: [{ id: 'mansergh-xii', loc: 'No. 462 (header)' }, { id: 'campbell-johnson-1951', loc: 'entry for 13 August 1947, Karachi' }],
    },
  },
  {
    id: 'm9-cash-lahore',
    tier: 2,
    real: false,
    pair: 'cash-balances',
    onDay: 9,
    minMode: 'medium',
    from: VISCOUNT,
    to: LISTOWEL,
    text: {
      en: 'MOST IMMEDIATE, LAHORE, 13 August, 8.30 pm; received 5.45 pm. I fear it is quite out of the question for you to decide the allocation of cash balances…',
      hi: 'MOST IMMEDIATE, लाहौर, 13 अगस्त, रात 8.30; मिला शाम 5.45। मुझे डर है कि नकद रकम का बँटवारा आप तय करें, यह बिल्कुल नहीं हो सकता…',
    },
    checks: { en: ['LAHORE', 'received 5.45 pm'], hi: ['लाहौर', 'मिला शाम 5.45'] },
    verify: { 'received 5.45 pm': 'rule:london-time' },
    tells: [
      {
        kind: 'place',
        explain: { en: 'On the 13th he was in Karachi, not Lahore.', hi: '13 को वे कराची में थे, लाहौर में नहीं।' },
        factId: 'karachi-trip',
        sources: [{ id: 'campbell-johnson-1951', loc: 'entry for 13 August 1947, Karachi' }, { id: 'mansergh-xii', loc: 'No. 462' }],
      },
    ],
  },

  // Day 10, Thu 14 Aug: tomorrow's programme; Beliaghata
  {
    id: 'm10-programme',
    tier: 1,
    real: true,
    pair: 'programme',
    onDay: 10,
    minMode: 'medium',
    from: PSV,
    to: { en: 'Staff desks', hi: 'स्टाफ़ की मेज़ें' },
    text: {
      en: 'Programme for tomorrow: the swearing-in, Durbar Hall, 8.30 am; the flag at the Council House; the Princes Park flag in the evening.',
      hi: 'कल का कार्यक्रम: शपथ, दरबार हॉल, सुबह 8.30; काउंसिल हाउस पर झंडा; शाम को प्रिंसेस पार्क में झंडा।',
    },
    checks: { en: ['8.30 am', 'Princes Park flag', 'in the evening'], hi: ['सुबह 8.30', 'प्रिंसेस पार्क में झंडा', 'शाम को'] },
    why: {
      text: {
        en: 'On the 15th: oath at 8.30, Council House flag, Princes Park at evening.',
        hi: '15 को: 8.30 पर शपथ, काउंसिल हाउस पर झंडा, शाम को प्रिंसेस पार्क।',
      },
      sources: [{ id: 'campbell-johnson-1951', loc: 'entry for 15 August 1947' }],
    },
  },
  {
    id: 'm10-programme-dawn',
    tier: 1,
    real: false,
    pair: 'programme',
    onDay: 10,
    minMode: 'medium',
    from: PSV,
    to: { en: 'Staff desks', hi: 'स्टाफ़ की मेज़ें' },
    text: {
      en: 'Programme for tomorrow: the swearing-in, Durbar Hall, 8.30 am; the flag at the Council House; the Princes Park flag at dawn.',
      hi: 'कल का कार्यक्रम: शपथ, दरबार हॉल, सुबह 8.30; काउंसिल हाउस पर झंडा; भोर में प्रिंसेस पार्क में झंडा।',
    },
    checks: { en: ['8.30 am', 'Princes Park flag', 'at dawn'], hi: ['सुबह 8.30', 'प्रिंसेस पार्क में झंडा', 'भोर में'] },
    tells: [
      {
        kind: 'date',
        explain: { en: 'The Princes Park flag went up in the evening, not at dawn.', hi: 'प्रिंसेस पार्क का झंडा शाम को फहरा, भोर में नहीं।' },
        factId: 'delhi-programme',
        sources: [{ id: 'campbell-johnson-1951', loc: 'entry for 15 August 1947' }],
      },
    ],
  },
  {
    id: 'm10-hydari',
    tier: 1,
    real: true,
    pair: 'hydari',
    onDay: 10,
    minMode: 'medium',
    from: TEL_CALCUTTA,
    to: CIPHER,
    text: {
      en: 'IMMEDIATE. CALCUTTA. Gandhiji and Mr Suhrawardy have lived together at Hydari Mansion, Beliaghata, since yesterday evening.',
      hi: 'IMMEDIATE. कलकत्ता। गांधीजी और मिस्टर सुहरावर्दी कल शाम से बेलियाघाटा के हैदरी मेंशन में साथ रह रहे हैं।',
    },
    checks: { en: ['Mr Suhrawardy', 'since yesterday evening'], hi: ['मिस्टर सुहरावर्दी', 'कल शाम से'] },
    verify: { 'since yesterday evening': 'fact:beliaghata' },
    why: {
      text: {
        en: 'They moved into Hydari Mansion on the evening of 13 August.',
        hi: 'वे 13 अगस्त की शाम हैदरी मेंशन में आए।',
      },
      sources: [{ id: 'cwmg-89', loc: 'Chronology, p. 528 (13 August 1947); Introduction' }],
    },
  },
  {
    id: 'm10-hydari-eleventh',
    tier: 1,
    real: false,
    pair: 'hydari',
    onDay: 10,
    minMode: 'medium',
    from: TEL_CALCUTTA,
    to: CIPHER,
    text: {
      en: 'IMMEDIATE. CALCUTTA. Gandhiji and Mr Suhrawardy have lived together at Hydari Mansion, Beliaghata, since the evening of the 11th.',
      hi: 'IMMEDIATE. कलकत्ता। गांधीजी और मिस्टर सुहरावर्दी 11 तारीख़ की शाम से बेलियाघाटा के हैदरी मेंशन में साथ रह रहे हैं।',
    },
    checks: { en: ['Mr Suhrawardy', 'evening of the 11th'], hi: ['मिस्टर सुहरावर्दी', '11 तारीख़ की शाम से'] },
    tells: [
      {
        kind: 'date',
        explain: {
          en: 'They moved in on the 13th; on the 11th Gandhiji only proposed it.',
          hi: 'वे 13 को आए; 11 को गांधीजी ने बस यह सुझाया था।',
        },
        factId: 'beliaghata',
        sources: [{ id: 'cwmg-89', loc: 'Chronology, p. 528 (11 and 13 August 1947)' }],
      },
    ],
  },

  // Medium, undated (the days before the window, or true on any day of it)
  {
    id: 'm-sittings-lahore',
    tier: 1,
    real: true,
    pair: 'sittings',
    minMode: 'medium',
    from: BC,
    to: CIPHER,
    text: {
      en: 'For the file: the Punjab Commission sat in public at Lahore from 21 to 31 July. Sir Cyril did not attend, but read the record daily.',
      hi: 'फ़ाइल के लिए: पंजाब कमीशन ने 21 से 31 जुलाई तक लाहौर में खुली सुनवाई की। सर सिरिल ख़ुद नहीं आए, पर रोज़ का रिकॉर्ड पढ़ते रहे।',
    },
    checks: { en: ['at Lahore', '21 to 31 July'], hi: ['लाहौर में', '21 से 31 जुलाई'] },
    why: {
      text: {
        en: 'His own award: Lahore, 21 to 31 July; he studied the record daily.',
        hi: 'उनका अपना फ़ैसला: लाहौर, 21 से 31 जुलाई; वे रोज़ रिकॉर्ड पढ़ते थे।',
      },
      sources: [{ id: 'mansergh-xii', loc: 'No. 488, Appendix I, para 5' }],
    },
  },
  {
    id: 'm-sittings-simla',
    tier: 1,
    real: false,
    pair: 'sittings',
    minMode: 'medium',
    from: BC,
    to: CIPHER,
    text: {
      en: 'For the file: the Punjab Commission sat in public at Simla from 21 to 31 July. Sir Cyril did not attend, but read the record daily.',
      hi: 'फ़ाइल के लिए: पंजाब कमीशन ने 21 से 31 जुलाई तक शिमला में खुली सुनवाई की। सर सिरिल ख़ुद नहीं आए, पर रोज़ का रिकॉर्ड पढ़ते रहे।',
    },
    checks: { en: ['at Simla', '21 to 31 July'], hi: ['शिमला में', '21 से 31 जुलाई'] },
    tells: [
      {
        kind: 'place',
        explain: {
          en: 'Lahore held the public sittings; the judges went to Simla only afterwards.',
          hi: 'खुली सुनवाई लाहौर में हुई; जज उसके बाद ही शिमला गए।',
        },
        factId: 'sittings',
        sources: [{ id: 'mansergh-xii', loc: 'No. 488, Appendix I, paras 5–6' }],
      },
    ],
  },
  {
    id: 'm-flag-wheel',
    tier: 2,
    real: true,
    pair: 'flag-wheel',
    minMode: 'medium',
    from: CA_OFFICE,
    to: { en: 'Cipher Office file', hi: 'साइफ़र दफ़्तर की फ़ाइल' },
    text: {
      en: "For the file: the flag adopted on 22 July has, in the centre of the white band, a Wheel in navy blue, Asoka's Chakra from Sarnath.",
      hi: 'फ़ाइल के लिए: 22 जुलाई को मंज़ूर हुए झंडे की सफ़ेद पट्टी के बीच में गहरे नीले रंग का चक्र है, सारनाथ वाला अशोक चक्र।',
    },
    checks: { en: ['navy blue', "Asoka's Chakra"], hi: ['गहरे नीले', 'अशोक चक्र'] },
    verify: { "Asoka's Chakra": 'fact:tricolour' },
    why: {
      text: {
        en: "The 22 July resolution: a navy-blue Wheel, as on Asoka's Sarnath capital.",
        hi: '22 जुलाई का प्रस्ताव: गहरे नीले रंग का चक्र, सारनाथ के अशोक स्तंभ जैसा।',
      },
      sources: [{ id: 'cad-22jul1947' }],
    },
  },
  {
    id: 'm-flag-spindle',
    tier: 2,
    real: false,
    pair: 'flag-wheel',
    minMode: 'medium',
    from: CA_OFFICE,
    to: { en: 'Cipher Office file', hi: 'साइफ़र दफ़्तर की फ़ाइल' },
    text: {
      en: 'For the file: the flag adopted on 22 July has, in the centre of the white band, the full charkha in navy blue, spindle and all.',
      hi: 'फ़ाइल के लिए: 22 जुलाई को मंज़ूर हुए झंडे की सफ़ेद पट्टी के बीच में गहरे नीले रंग का पूरा चरखा है, तकुए समेत।',
    },
    checks: { en: ['navy blue', 'spindle and all'], hi: ['गहरे नीले', 'तकुए समेत'] },
    tells: [
      {
        kind: 'knowledge',
        explain: {
          en: "Only the wheel stayed, as Asoka's Chakra; the charkha's spindle went.",
          hi: 'सिर्फ़ चक्र रहा, अशोक चक्र बनकर; चरखे का तकुआ हट गया।',
        },
        factId: 'tricolour',
        sources: [{ id: 'cad-22jul1947', loc: 'the resolution; Nehru on the wheel and the spindle' }],
      },
    ],
  },

  // ═════════════ Hard only (minMode 'hard'): deeper, still well known ═════════════
  // Day 3, Thu 7 Aug: the astrology minute (real, and the root of a famous myth)

  // Day 8, Tue 12 Aug: calling on Radcliffe
  {
    id: 'h8-changing-for-dinner',
    tier: 2,
    real: true,
    pair: 'changing-for-dinner',
    onDay: 8,
    minMode: 'hard',
    from: PRESS_VH,
    to: CIPHER,
    text: {
      en: "For the file: Christie and I called on Sir Cyril at the Comptroller's House this evening. He was changing for dinner; Punjab and Bengal are ready.",
      hi: 'फ़ाइल के लिए: क्रिस्टी और मैं आज शाम कंट्रोलर्स हाउस में सर सिरिल से मिले। वे खाने के लिए कपड़े बदल रहे थे; पंजाब और बंगाल तैयार हैं।',
    },
    checks: { en: ["Comptroller's House"], hi: ['कंट्रोलर्स हाउस'] },
    why: {
      text: {
        en: "Campbell-Johnson, 12 August: Radcliffe, at the Comptroller's House, was 'changing for dinner'.",
        hi: "कैंपबेल-जॉनसन, 12 अगस्त: कंट्रोलर्स हाउस में रैडक्लिफ़ 'खाने के लिए कपड़े बदल रहे थे'।",
      },
      sources: [{ id: 'campbell-johnson-1951', loc: 'entry for 12 August 1947' }],
    },
  },
  {
    id: 'h8-simla-lodge',
    tier: 2,
    real: false,
    pair: 'changing-for-dinner',
    onDay: 8,
    minMode: 'hard',
    from: PRESS_VH,
    to: CIPHER,
    text: {
      en: 'For the file: Christie and I called on Sir Cyril at Viceregal Lodge, Simla, this evening. He was changing for dinner; Punjab and Bengal are ready.',
      hi: 'फ़ाइल के लिए: क्रिस्टी और मैं आज शाम वायसरीगल लॉज, शिमला में सर सिरिल से मिले। वे खाने के लिए कपड़े बदल रहे थे; पंजाब और बंगाल तैयार हैं।',
    },
    checks: { en: ['Viceregal Lodge, Simla'], hi: ['वायसरीगल लॉज, शिमला'] },
    tells: [
      {
        kind: 'place',
        explain: {
          en: "On the 12th he was at the Comptroller's House in Delhi, not Simla.",
          hi: '12 को वे दिल्ली के कंट्रोलर्स हाउस में थे, शिमला में नहीं।',
        },
        factId: 'radcliffe-house',
        sources: [{ id: 'campbell-johnson-1951', loc: 'entry for 12 August 1947' }],
      },
    ],
  },

  // Day 9, Wed 13 Aug: the Raj's last full day, and a title for a prince

  // Day 11, Fri 15 Aug: freedom day, seen up close
  {
    id: 'h11-oath-kania',
    tier: 2,
    real: true,
    pair: 'oath',
    onDay: 11,
    minMode: 'hard',
    from: PRESS_GH,
    to: CIPHER,
    text: {
      en: 'For the file: at 8.30 this morning, in the Durbar Hall, Chief Justice Kania gave the oath to the new Governor-General.',
      hi: 'फ़ाइल के लिए: आज सुबह 8.30 बजे दरबार हॉल में चीफ़ जस्टिस कानिया ने नए गवर्नर-जनरल को शपथ दिलाई।',
    },
    checks: { en: ['8.30 this morning', 'Durbar Hall', 'Justice Kania'], hi: ['सुबह 8.30', 'दरबार हॉल', 'जस्टिस कानिया'] },
    why: {
      text: {
        en: "Campbell-Johnson was there: 'an Indian Chief Justice, Dr. Kania' gave the oath.",
        hi: "कैंपबेल-जॉनसन वहाँ थे: 'एक भारतीय चीफ़ जस्टिस, डॉक्टर कानिया' ने शपथ दिलाई।",
      },
      sources: [{ id: 'campbell-johnson-1951', loc: 'entry for 15 August 1947' }],
    },
  },
  {
    id: 'h11-oath-spens',
    tier: 2,
    real: false,
    pair: 'oath',
    onDay: 11,
    minMode: 'hard',
    from: PRESS_GH,
    to: CIPHER,
    text: {
      en: 'For the file: at 8.30 this morning, in the Durbar Hall, Chief Justice Sir Patrick Spens gave the oath to the new Governor-General.',
      hi: 'फ़ाइल के लिए: आज सुबह 8.30 बजे दरबार हॉल में चीफ़ जस्टिस सर पैट्रिक स्पेंस ने नए गवर्नर-जनरल को शपथ दिलाई।',
    },
    checks: { en: ['8.30 this morning', 'Durbar Hall', 'Sir Patrick Spens'], hi: ['सुबह 8.30', 'दरबार हॉल', 'सर पैट्रिक स्पेंस'] },
    tells: [
      {
        kind: 'name',
        explain: {
          en: 'Kania gave the oath; Spens had left the bench for the Arbitral Tribunal.',
          hi: 'शपथ कानिया ने दिलाई; स्पेंस अदालत छोड़कर बँटवारे की पंच अदालत के अध्यक्ष बन चुके थे।',
        },
        factId: 'oath',
        sources: [{ id: 'campbell-johnson-1951', loc: 'entry for 15 August 1947' }, { id: 'mansergh-xii', loc: 'Introduction (the Arbitral Tribunal)' }],
      },
    ],
  },
  {
    id: 'h11-rainbow',
    tier: 1,
    real: true,
    pair: 'rainbow',
    onDay: 11,
    minMode: 'hard',
    from: { en: 'Arrangements office, Princes Park', hi: 'इंतज़ाम दफ़्तर, प्रिंसेस पार्क' },
    to: GOVT_HOUSE,
    text: {
      en: 'IMMEDIATE. Princes Park: some 300,000 came, ten times the 30,000 planned. Light rain fell as the flag went up, and a rainbow appeared.',
      hi: 'IMMEDIATE. प्रिंसेस पार्क: करीब तीन लाख लोग आए, तय 30,000 से दस गुना। झंडा चढ़ते ही हल्की बारिश हुई, और इंद्रधनुष निकला।',
    },
    checks: { en: ['some 300,000', 'the 30,000 planned'], hi: ['करीब तीन लाख', 'तय 30,000'] },
    verify: { 'the 30,000 planned': 'fact:princes-park' },
    why: {
      text: {
        en: "Campbell-Johnson: planned for 30,000, 'nearer three hundred thousand'; then a rainbow.",
        hi: "कैंपबेल-जॉनसन: इंतज़ाम 30,000 का, आए 'करीब तीन लाख'; फिर इंद्रधनुष।",
      },
      sources: [{ id: 'campbell-johnson-1951', loc: 'entry for 15 August 1947' }],
    },
  },
  {
    id: 'h11-rainbow-planned',
    tier: 1,
    real: false,
    pair: 'rainbow',
    onDay: 11,
    minMode: 'hard',
    from: { en: 'Arrangements office, Princes Park', hi: 'इंतज़ाम दफ़्तर, प्रिंसेस पार्क' },
    to: GOVT_HOUSE,
    text: {
      en: 'IMMEDIATE. Princes Park: some 30,000 came, just as planned. Light rain fell as the flag went up, and a rainbow appeared.',
      hi: 'IMMEDIATE. प्रिंसेस पार्क: करीब 30,000 लोग आए, जितने तय थे। झंडा चढ़ते ही हल्की बारिश हुई, और इंद्रधनुष निकला।',
    },
    checks: { en: ['some 30,000', 'just as planned'], hi: ['करीब 30,000', 'जितने तय थे'] },
    tells: [
      {
        kind: 'number',
        explain: { en: 'Nearly 300,000 came, ten times the 30,000 planned.', hi: 'करीब तीन लाख आए, तय 30,000 से दस गुना।' },
        factId: 'princes-park',
        sources: [{ id: 'campbell-johnson-1951', loc: 'entry for 15 August 1947' }],
      },
    ],
  },

  // Day 13, Sun 17 Aug: Bombay in the rain
  {
    id: 'h13-georgic',
    tier: 2,
    real: true,
    pair: 'georgic',
    onDay: 13,
    minMode: 'hard',
    from: { en: 'Telegraph Office, Bombay', hi: 'तार घर, बंबई' },
    to: GOVT_HOUSE,
    text: {
      en: 'IMMEDIATE. BOMBAY. In rain on the quay, the Governor-General saw off the first British troops to leave India: the Norfolks, on the troopship Georgic.',
      hi: 'IMMEDIATE. बंबई। गवर्नर-जनरल ने बारिश में घाट पर भारत छोड़ने वाले पहले ब्रिटिश फ़ौजियों को विदा किया: नॉरफ़ॉक के जवान, जॉर्जिक जहाज़ पर।',
    },
    checks: { en: ['the Norfolks', 'troopship Georgic'], hi: ['नॉरफ़ॉक', 'जॉर्जिक जहाज़'] },
    why: {
      text: {
        en: 'Campbell-Johnson, 17 August: detachments of the Norfolks, on the Georgic, in rain.',
        hi: 'कैंपबेल-जॉनसन, 17 अगस्त: नॉरफ़ॉक के दस्ते, जॉर्जिक जहाज़ पर, बारिश में।',
      },
      sources: [
        { id: 'campbell-johnson-1951', loc: 'entry for 17 August 1947, Bombay' },
        { id: 'mansergh-xii', loc: 'No. 113, para 6' },
      ],
    },
  },
  {
    id: 'h13-empress',
    tier: 2,
    real: false,
    pair: 'georgic',
    onDay: 13,
    minMode: 'hard',
    from: { en: 'Telegraph Office, Bombay', hi: 'तार घर, बंबई' },
    to: GOVT_HOUSE,
    text: {
      en: 'IMMEDIATE. BOMBAY. In rain on the quay, the Governor-General saw off the first British troops to leave India: the Norfolks, on the Empress of Scotland.',
      hi: 'IMMEDIATE. बंबई। गवर्नर-जनरल ने बारिश में घाट पर भारत छोड़ने वाले पहले ब्रिटिश फ़ौजियों को विदा किया: नॉरफ़ॉक के जवान, एम्प्रेस ऑफ़ स्कॉटलैंड जहाज़ पर।',
    },
    checks: { en: ['the Norfolks', 'Empress of Scotland'], hi: ['नॉरफ़ॉक', 'एम्प्रेस ऑफ़ स्कॉटलैंड'] },
    tells: [
      {
        kind: 'name',
        explain: {
          en: 'The Norfolks sailed on the Georgic; the Empress of Scotland took ex-Governors next day.',
          hi: 'नॉरफ़ॉक जॉर्जिक से गए; एम्प्रेस ऑफ़ स्कॉटलैंड अगले दिन पुराने गवर्नरों को ले गया।',
        },
        factId: 'bombay',
        sources: [{ id: 'campbell-johnson-1951', loc: 'entry for 17 August 1947, Bombay' }],
      },
    ],
  },

  // Day 14, Mon 18 Aug: Id in Calcutta

  // Hard, undated
  {
    id: 'h-judges-real',
    tier: 2,
    real: true,
    pair: 'punjab-judges',
    minMode: 'hard',
    from: BC,
    to: CIPHER,
    text: {
      en: 'For the file: the Punjab Commission is Justices Din Muhammad, Muhammad Munir, Mehr Chand Mahajan and Teja Singh, with Sir Cyril in the chair.',
      hi: 'फ़ाइल के लिए: पंजाब कमीशन में जस्टिस दीन मुहम्मद, मुहम्मद मुनीर, मेहर चंद महाजन और तेजा सिंह हैं, अध्यक्ष सर सिरिल हैं।',
    },
    checks: { en: ['Punjab Commission', 'Mahajan', 'Teja Singh'], hi: ['पंजाब कमीशन', 'महाजन', 'तेजा सिंह'] },
    why: {
      text: { en: 'Exactly as the Punjab award of 12 August names them.', hi: '12 अगस्त के पंजाब फ़ैसले में यही नाम हैं।' },
      sources: [{ id: 'mansergh-xii', loc: 'No. 488, Appendix I, para 2' }],
    },
  },
  {
    id: 'h-judges-biswas',
    tier: 2,
    real: false,
    pair: 'punjab-judges',
    minMode: 'hard',
    from: BC,
    to: CIPHER,
    text: {
      en: 'For the file: the Punjab Commission is Justices Din Muhammad, Muhammad Munir, Mehr Chand Mahajan and C.C. Biswas, with Sir Cyril in the chair.',
      hi: 'फ़ाइल के लिए: पंजाब कमीशन में जस्टिस दीन मुहम्मद, मुहम्मद मुनीर, मेहर चंद महाजन और सी.सी. बिस्वास हैं, अध्यक्ष सर सिरिल हैं।',
    },
    checks: { en: ['Punjab Commission', 'Mahajan', 'C.C. Biswas'], hi: ['पंजाब कमीशन', 'महाजन', 'सी.सी. बिस्वास'] },
    tells: [
      {
        kind: 'name',
        explain: {
          en: 'Justice Biswas sat for Bengal; the fourth Punjab judge was Teja Singh.',
          hi: 'जस्टिस बिस्वास बंगाल कमीशन में थे; पंजाब के चौथे जज तेजा सिंह थे।',
        },
        factId: 'punjab-judges',
        sources: [{ id: 'mansergh-xii', loc: 'No. 488, Appendix I, para 2; Appendix II, para 2' }],
      },
    ],
  },
  {
    id: 'h-clock-real',
    tier: 2,
    real: true,
    pair: 'karachi-clock',
    minMode: 'hard',
    from: HEAD,
    to: CLERK,
    text: {
      en: "Note for the desk: Karachi keeps Delhi's clock, so its telegram times need no change. Only London's run behind.",
      hi: 'मेज़ के लिए नोट: कराची में दिल्ली वाली ही घड़ी चलती है, इसलिए उसके तारों का समय बदलना नहीं पड़ता। सिर्फ़ लंदन का समय पीछे है।',
    },
    checks: { en: ["Karachi keeps Delhi's clock"], hi: ['दिल्ली वाली ही घड़ी'] },
    why: {
      text: {
        en: 'In 1947 both ran 5½ hours ahead of GMT; Pakistan changed in 1951.',
        hi: '1947 में दोनों जगह GMT से 5½ घंटे आगे का समय था; पाकिस्तान ने 1951 में बदला।',
      },
      sources: [{ id: 'iana-tz', loc: 'Zones Asia/Karachi and Asia/Kolkata' }],
    },
  },
  {
    id: 'h-clock-half-hour',
    tier: 2,
    real: false,
    pair: 'karachi-clock',
    minMode: 'hard',
    from: HEAD,
    to: CLERK,
    text: {
      en: 'Note for the desk: Karachi runs half an hour behind Delhi, so add thirty minutes to its telegram times.',
      hi: 'मेज़ के लिए नोट: कराची दिल्ली से आधा घंटा पीछे है, इसलिए उसके तारों के समय में तीस मिनट जोड़ें।',
    },
    checks: { en: ['half an hour behind Delhi'], hi: ['आधा घंटा पीछे'] },
    tells: [
      {
        kind: 'number',
        explain: {
          en: 'Same clock in 1947; Pakistan moved half an hour back only in 1951.',
          hi: '1947 में घड़ी एक ही थी; पाकिस्तान 1951 में ही आधा घंटा पीछे हुआ।',
        },
        factId: 'karachi-time',
        sources: [{ id: 'iana-tz', loc: 'Zone Asia/Karachi: +5:30 until 30 September 1951' }],
      },
    ],
  },
]
