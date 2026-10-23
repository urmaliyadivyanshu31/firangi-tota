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
    why: {
      text: {
        en: "Mountbatten's real calendar counted down; 5 to 15 August is ten days.",
        hi: 'माउंटबेटन का असली कैलेंडर उल्टी गिनती गिनता था; 5 से 15 अगस्त तक दस दिन हैं।',
      },
      sources: [{ id: 'campbell-johnson-1951', loc: 'July 1947 entry on the tear-off calendar' }],
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
        sources: [{ id: 'campbell-johnson-1951', loc: 'July 1947 entry on the tear-off calendar' }],
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
    checks: { en: ['Calcutta and Noakhali'], hi: ['कलकत्ता और नोआखाली'] },
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
    checks: { en: ['to Karachi today'], hi: ['कराची गए'] },
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
    checks: { en: ['to Lahore today'], hi: ['लाहौर गए'] },
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
    checks: { en: ['roughly the boundary', 'next 48 hours'], hi: ['मोटे तौर पर', 'अगले 48 घंटों'] },
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
    checks: { en: ['signed by Sir Cyril Radcliffe this morning'], hi: ['आज सुबह दस्तख़त किए'] },
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
    checks: { en: ['IMMEDIATE', '24 hours before its release'], hi: ['IMMEDIATE', '24 घंटे पहले'] },
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
    checks: { en: ['reached Calcutta today'], hi: ['कलकत्ता पहुँचे'] },
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
    checks: { en: ['met for the first time today'], hi: ['आज पहली बार बैठी'] },
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

  // ───────────── Day 7, Mon 11 Aug: "You are free" ─────────────
  {
    id: 'd7-you-are-free',
    tier: 2,
    real: true,
    pair: 'you-are-free',
    onDay: 7,
    from: TEL_KARACHI,
    to: CIPHER,
    text: {
      en: "IMMEDIATE, KARACHI, {weekday} {date}. Mr Jinnah, elected President of Pakistan's Constituent Assembly today, told it: 'You are free; you are free to go to your temples…'",
      hi: "IMMEDIATE, कराची, {weekday} {date}। आज पाकिस्तान की संविधान सभा के अध्यक्ष चुने गए मिस्टर जिन्ना ने सभा से कहा: 'आप आज़ाद हैं; आप अपने मंदिरों में जाने के लिए आज़ाद हैं…'",
    },
    checks: { en: ['elected President', 'You are free'], hi: ['अध्यक्ष चुने गए', 'आप आज़ाद हैं'] },
    document: { sources: [{ id: 'capd-1947', loc: 'No. 2, Monday 11 August 1947' }] },
    why: {
      text: {
        en: 'Elected President on 11 August; this line is from his first address.',
        hi: '11 अगस्त को अध्यक्ष चुने गए; यह पंक्ति उनके पहले भाषण की है।',
      },
      sources: [{ id: 'capd-1947', loc: 'No. 2' }, { id: 'menon-1957', loc: 'ch. XVIII' }],
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
    checks: { en: ['Sunday'], hi: ['रविवार'] },
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
    checks: { en: ['Punjab and Bengal awards', 'Sylhet award is not ready'], hi: ['पंजाब और बंगाल के फ़ैसले', 'सिलहट का फ़ैसला अभी तैयार नहीं'] },
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
  {
    id: 'd8-hyderabad-open',
    tier: 2,
    real: true,
    pair: 'hyderabad',
    onDay: 8,
    from: STATES,
    to: CIPHER,
    text: {
      en: 'IMMEDIATE. The Viceroy has told the Nizam of Hyderabad that the offer to join India stays open for two more months.',
      hi: 'IMMEDIATE. वायसराय ने हैदराबाद के निज़ाम से कहा है कि भारत में शामिल होने का न्योता दो महीने और खुला रहेगा।',
    },
    checks: { en: ['two more months'], hi: ['दो महीने और'] },
    why: {
      text: {
        en: 'Menon: on 12 August the offer to Hyderabad was kept open two more months.',
        hi: 'मेनन: 12 अगस्त को हैदराबाद के लिए न्योता दो महीने और खुला रखा गया।',
      },
      sources: [{ id: 'menon-1956', loc: 'ch. V, Stopping the Gap' }],
    },
  },
  {
    id: 'd8-hyderabad-signed',
    tier: 3,
    real: false,
    pair: 'hyderabad',
    onDay: 8,
    from: STATES,
    to: CIPHER,
    text: {
      en: 'IMMEDIATE. The Nizam of Hyderabad has signed the Instrument of Accession today, so Hyderabad joins India on 15 August.',
      hi: 'IMMEDIATE. हैदराबाद के निज़ाम ने आज भारत में शामिल होने के कागज़ पर दस्तख़त कर दिए, यानी हैदराबाद 15 अगस्त को भारत में आएगा।',
    },
    checks: { en: ['has signed the Instrument of Accession'], hi: ['दस्तख़त कर दिए'] },
    tells: [
      {
        kind: 'knowledge',
        explain: {
          en: 'Hyderabad held out in 1947; it came into India only in September 1948.',
          hi: 'हैदराबाद 1947 में शामिल नहीं हुआ; वह सितंबर 1948 में ही भारत में आया।',
        },
        sources: [{ id: 'menon-1956', loc: 'ch. V, Stopping the Gap; Hyderabad chapters' }],
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
    checks: { en: ['Sylhet award today'], hi: ['सिलहट के फ़ैसले पर'] },
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
    checks: { en: ['published tomorrow, the 14th'], hi: ['कल, 14 तारीख़ को छपेंगे'] },
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
    checks: { en: ['Beliaghata', 'many risks'], hi: ['बेलियाघाटा', 'बहुत जोखिम'] },
    document: { sources: [{ id: 'cwmg-89', loc: 'Letter to Satis Chandra Das Gupta, Hydari Mansion, 13 August 1947' }] },
    why: {
      text: {
        en: "13 August evening: Gandhi and Suhrawardy, Bengal's former Premier, began living together.",
        hi: '13 अगस्त की शाम: गांधी और बंगाल के पूर्व प्रीमियर सुहरावर्दी साथ रहने लगे।',
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
    checks: { en: ['leaves Calcutta tonight for Delhi'], hi: ['दिल्ली के लिए निकल रहे हैं'] },
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
    checks: { en: ['Eleven P. M.', 'half a minute to 12'], hi: ['रात ग्यारह बजे', 'बस आधा मिनट'] },
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
    checks: { en: ['President of India'], hi: ['भारत के राष्ट्रपति'] },
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
    id: 'd10-lucknow-flag',
    tier: 3,
    real: true,
    pair: 'lucknow-flag',
    onDay: 10,
    from: WYLIE,
    to: VISCOUNT,
    text: {
      en: 'IMMEDIATE. LUCKNOW, 14 August, 2.45 pm; received in London 12.10 pm: The Union Jack on Lucknow Residency was lowered at 20 hours on 13 August.',
      hi: 'IMMEDIATE. लखनऊ, 14 अगस्त, दोपहर 2.45; लंदन में 12.10 पर मिला: लखनऊ रेज़िडेंसी का यूनियन जैक 13 अगस्त को रात 8 बजे (20 बजे) उतार दिया गया।',
    },
    checks: { en: ['received in London 12.10 pm', 'on 13 August'], hi: ['लंदन में 12.10 पर', '13 अगस्त को'] },
    document: { sources: [{ id: 'mansergh-xii', loc: 'No. 477' }] },
    why: {
      text: {
        en: 'London is 4½ hours behind; Wylie lowered the flag a day earlier than planned.',
        hi: 'लंदन 4½ घंटे पीछे है; वाइली ने झंडा तय दिन से एक दिन पहले उतार दिया।',
      },
      sources: [{ id: 'mansergh-xii', loc: 'No. 477 and note; No. 243, para 6' }],
    },
  },
  {
    id: 'd10-lucknow-tonight',
    tier: 2,
    real: false,
    pair: 'lucknow-flag',
    onDay: 10,
    from: WYLIE,
    to: VISCOUNT,
    text: {
      en: 'IMMEDIATE. LUCKNOW, 14 August, 2.45 pm; received in London 12.10 pm: The Union Jack on Lucknow Residency was lowered at 20 hours on 14 August.',
      hi: 'IMMEDIATE. लखनऊ, 14 अगस्त, दोपहर 2.45; लंदन में 12.10 पर मिला: लखनऊ रेज़िडेंसी का यूनियन जैक 14 अगस्त को रात 8 बजे (20 बजे) उतार दिया गया।',
    },
    checks: { en: ['at 20 hours on 14 August'], hi: ['14 अगस्त को रात 8 बजे'] },
    tells: [
      {
        kind: 'date',
        explain: {
          en: 'Sent at 2.45 pm on the 14th, it cannot report 8 pm that night.',
          hi: '14 की दोपहर 2.45 पर भेजा तार उसी रात 8 बजे की ख़बर नहीं दे सकता।',
        },
        sources: [{ id: 'mansergh-xii', loc: 'No. 477' }],
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
    checks: { en: ['as your Viceroy'], hi: ['आपके वायसराय के रूप में'] },
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
    checks: { en: ['His Excellency the Viceroy'], hi: ['हिज़ एक्सेलेंसी वायसराय'] },
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
      hi: "कल रात की बैठक से, पंडित नेहरू: '…आधी रात के घंटे की चोट पर, जब दुनिया सो रही है, भारत जीवन और आज़ादी के लिए जागेगा।'",
    },
    checks: { en: ['last night', 'midnight hour'], hi: ['कल रात', 'आधी रात के घंटे'] },
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
      hi: "आज सुबह लाल क़िले से, पंडित नेहरू: '…आधी रात के घंटे की चोट पर, जब दुनिया सो रही है, भारत जीवन और आज़ादी के लिए जागेगा।'",
    },
    checks: { en: ['Red Fort this morning'], hi: ['आज सुबह लाल क़िले से'] },
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
    id: 'd11-empty-envelope',
    tier: 3,
    real: true,
    onDay: 11,
    from: PRESS_GH,
    to: CIPHER,
    text: {
      en: 'Note: the envelope Pandit Nehru gave His Excellency after midnight, meant to hold the new Cabinet list, was empty.',
      hi: 'नोट: आधी रात के बाद पंडित नेहरू ने हिज़ एक्सेलेंसी को जो लिफ़ाफ़ा दिया, उसमें नए मंत्रिमंडल की सूची होनी थी। वह ख़ाली निकला।',
    },
    checks: { en: ['was empty'], hi: ['ख़ाली निकला'] },
    why: {
      text: {
        en: "True: Campbell-Johnson was there; 'by sublime oversight Nehru's envelope was empty.'",
        hi: "सच: कैंपबेल-जॉनसन वहीं थे; 'भारी भूल से नेहरू का लिफ़ाफ़ा ख़ाली था।'",
      },
      sources: [{ id: 'campbell-johnson-1951', loc: 'entry for 14–15 August 1947' }],
    },
  },
  {
    id: 'd11-women-flag',
    tier: 2,
    real: true,
    pair: 'women-flag',
    onDay: 11,
    from: CAI,
    to: RECORD,
    text: {
      en: "From last night's sitting: Shrimati Sucheta Kripalani sang Vande Mataram. Shrimati Hansa Mehta: '…on behalf of the women of India, to present this flag to the Nation…'",
      hi: "कल रात की बैठक से: श्रीमती सुचेता कृपलानी ने वंदे मातरम गाया। श्रीमती हंसा मेहता: '…भारत की महिलाओं की ओर से यह झंडा देश को भेंट करना…'",
    },
    checks: { en: ['Hansa Mehta', 'women of India'], hi: ['हंसा मेहता', 'भारत की महिलाओं'] },
    document: { sources: [{ id: 'cad-14aug1947' }] },
    why: {
      text: {
        en: 'Hansa Mehta presented the flag; Sarojini Naidu was absent.',
        hi: 'झंडा हंसा मेहता ने भेंट किया; सरोजिनी नायडू वहाँ नहीं थीं।',
      },
      sources: [{ id: 'cad-14aug1947' }],
    },
  },
  {
    id: 'd11-women-naidu',
    tier: 3,
    real: false,
    pair: 'women-flag',
    onDay: 11,
    from: CAI,
    to: RECORD,
    text: {
      en: "From last night's sitting: Shrimati Sucheta Kripalani sang Vande Mataram. Shrimati Sarojini Naidu: '…on behalf of the women of India, to present this flag to the Nation…'",
      hi: "कल रात की बैठक से: श्रीमती सुचेता कृपलानी ने वंदे मातरम गाया। श्रीमती सरोजिनी नायडू: '…भारत की महिलाओं की ओर से यह झंडा देश को भेंट करना…'",
    },
    checks: { en: ['Sarojini Naidu'], hi: ['सरोजिनी नायडू'] },
    tells: [
      {
        kind: 'name',
        explain: {
          en: 'Hansa Mehta presented the flag; Sarojini Naidu was absent that night.',
          hi: 'झंडा हंसा मेहता ने भेंट किया; सरोजिनी नायडू उस रात थीं ही नहीं।',
        },
        sources: [{ id: 'cad-14aug1947' }],
      },
    ],
  },
  {
    id: 'd11-bismillah-myth',
    tier: 2,
    real: false,
    onDay: 11,
    from: TEL_DELHI,
    to: GOVT_HOUSE,
    text: {
      en: 'IMMEDIATE. At the Red Fort this morning, Ustad Bismillah Khan played the shehnai, and Gandhiji spoke after Pandit Nehru.',
      hi: 'IMMEDIATE. आज सुबह लाल क़िले पर उस्ताद बिस्मिल्लाह ख़ान ने शहनाई बजाई, और पंडित नेहरू के बाद गांधीजी बोले।',
    },
    checks: { en: ['Gandhiji spoke'], hi: ['गांधीजी बोले'] },
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
    checks: { en: ['wildest rumours'], hi: ['सबसे बेतुकी अफ़वाहें'] },
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
    checks: { en: ['announced this morning'], hi: ['आज सुबह हो गया'] },
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
  {
    id: 'd12-leaders',
    tier: 2,
    real: true,
    pair: 'leaders',
    onDay: 12,
    from: { en: 'Conference Secretary, Government House', hi: 'कॉन्फ़्रेंस सचिव, गवर्नमेंट हाउस' },
    to: CIPHER,
    text: {
      en: 'Ministers received the awards this morning. Pandit Nehru, Mr Liaquat Ali Khan and Sardar Patel meet Lord Mountbatten here at 5 pm.',
      hi: 'मंत्रियों को फ़ैसले आज सुबह मिल गए। पंडित नेहरू, मिस्टर लियाक़त अली ख़ान और सरदार पटेल शाम 5 बजे यहाँ लॉर्ड माउंटबेटन से मिलेंगे।',
    },
    checks: { en: ['Mr Liaquat Ali Khan'], hi: ['लियाक़त अली ख़ान'] },
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
      en: 'Ministers received the awards this morning. Pandit Nehru, Mr Jinnah and Sardar Patel meet Lord Mountbatten here at 5 pm.',
      hi: 'मंत्रियों को फ़ैसले आज सुबह मिल गए। पंडित नेहरू, मिस्टर जिन्ना और सरदार पटेल शाम 5 बजे यहाँ लॉर्ड माउंटबेटन से मिलेंगे।',
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
    checks: { en: ['Secretary, States Ministry'], hi: ['रियासत मंत्रालय के सचिव'] },
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
    checks: { en: ['Minister of States'], hi: ['रियासतों के मंत्री'] },
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
    checks: { en: ['joined Pakistan'], hi: ['पाकिस्तान में शामिल'] },
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
    checks: { en: ['Tuesday'], hi: ['मंगलवार'] },
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
  {
    id: 'd14-lahore-award',
    tier: 2,
    real: true,
    pair: 'lahore-award',
    onDay: 14,
    from: TEL_LAHORE,
    to: GOVT_HOUSE,
    text: {
      en: 'IMMEDIATE. The award is out. Lahore city is in West Punjab, Pakistan; Amritsar district is in East Punjab, India.',
      hi: 'IMMEDIATE. फ़ैसला छप गया है। लाहौर शहर पश्चिमी पंजाब, यानी पाकिस्तान में है; अमृतसर ज़िला पूर्वी पंजाब, यानी भारत में।',
    },
    checks: { en: ['Lahore city is in West Punjab'], hi: ['लाहौर शहर पश्चिमी पंजाब'] },
    why: {
      text: {
        en: 'Published 17 August: Lahore went to Pakistan, Amritsar to India.',
        hi: '17 अगस्त को छपा: लाहौर पाकिस्तान को, अमृतसर भारत को मिला।',
      },
      sources: [{ id: 'menon-1957', loc: 'ch. XVII (award outcome)' }, { id: 'mansergh-xii', loc: 'No. 488, Appendix I' }],
    },
  },
  {
    id: 'd14-lahore-reversed',
    tier: 3,
    real: false,
    pair: 'lahore-award',
    onDay: 14,
    from: TEL_LAHORE,
    to: GOVT_HOUSE,
    text: {
      en: 'IMMEDIATE. The award is out. Lahore city is in East Punjab, India; Amritsar district is in West Punjab, Pakistan.',
      hi: 'IMMEDIATE. फ़ैसला छप गया है। लाहौर शहर पूर्वी पंजाब, यानी भारत में है; अमृतसर ज़िला पश्चिमी पंजाब, यानी पाकिस्तान में।',
    },
    checks: { en: ['Lahore city is in East Punjab'], hi: ['लाहौर शहर पूर्वी पंजाब'] },
    tells: [
      {
        kind: 'knowledge',
        explain: { en: 'Reversed: Lahore went to Pakistan and Amritsar to India.', hi: 'उल्टा है: लाहौर पाकिस्तान को और अमृतसर भारत को मिला।' },
        sources: [{ id: 'menon-1957', loc: 'ch. XVII (award outcome)' }],
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
    from: BC,
    to: CIPHER,
    text: {
      en: 'For the file: Sir Cyril Radcliffe landed in Delhi on 8 June, his first time in India, to draw the Punjab and Bengal borders.',
      hi: 'फ़ाइल के लिए: सर सिरिल रैडक्लिफ़ 8 जून को दिल्ली उतरे, पहली बार भारत आए, पंजाब और बंगाल की सीमाएँ खींचने।',
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
    checks: { en: ['Friday 4 July'], hi: ['शुक्रवार 4 जुलाई'] },
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
    checks: { en: ['4 June', '15 August'], hi: ['4 जून', '15 अगस्त'] },
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
    checks: { en: ['about 5,000'], hi: ['करीब 5,000'] },
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
    checks: { en: ['Mr Jinnah Governor-General of Pakistan'], hi: ['मिस्टर जिन्ना पाकिस्तान के'] },
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
    checks: { en: ['IMMEDIATE', 'whatever these may be'], hi: ['IMMEDIATE', 'चाहे जो भी हों'] },
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
    checks: { en: ['no one in this House may contact'], hi: ['कोई भी सर सिरिल रैडक्लिफ़ से'] },
    why: {
      text: {
        en: 'Mountbatten ordered his staff to have no contact with Radcliffe while he worked.',
        hi: 'माउंटबेटन ने स्टाफ़ से कहा था कि रैडक्लिफ़ के काम के दौरान उनसे कोई संपर्क न रखें।',
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
    checks: { en: ['CALCUTTA', 'did not attend in person'], hi: ['कलकत्ता', 'ख़ुद नहीं आए'] },
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
    id: 'travancore-real',
    tier: 2,
    real: true,
    pair: 'travancore',
    from: TRAVANCORE,
    to: { en: 'Lord Mountbatten', hi: 'लॉर्ड माउंटबेटन' },
    text: {
      en: "Your Excellency's letter… has been handed over to me by Sir C.P. Ramaswami Aiyar… I have decided… to take this step of accession to the Dominion of India… RAMA VARMA",
      hi: 'आपका पत्र… मुझे सर सी.पी. रामास्वामी अय्यर ने दिया है… मैंने भारत डोमिनियन में शामिल होने का यह क़दम उठाने का फ़ैसला किया है… रामा वर्मा',
    },
    checks: { en: ['Sir C.P. Ramaswami Aiyar', 'RAMA VARMA'], hi: ['सर सी.पी. रामास्वामी अय्यर', 'रामा वर्मा'] },
    document: { sources: [{ id: 'mansergh-xii', loc: 'No. 284' }] },
    why: {
      text: { en: 'Signed RAMA VARMA, the Maharaja, on 30 July; Sir C.P. was his Dewan.', hi: 'दस्तख़त रामा वर्मा, यानी महाराजा के, 30 जुलाई को; सर सी.पी. उनके दीवान थे।' },
      sources: [{ id: 'mansergh-xii', loc: 'No. 284' }, { id: 'menon-1956', loc: 'ch. V, Stopping the Gap' }],
    },
  },
  {
    id: 'travancore-fake',
    tier: 3,
    real: false,
    pair: 'travancore',
    from: TRAVANCORE,
    to: { en: 'Lord Mountbatten', hi: 'लॉर्ड माउंटबेटन' },
    text: {
      en: "Your Excellency's letter… has been handed over to me by Sir C.P. Ramaswami Aiyar… I have decided… to take this step of accession to India… C.P. RAMASWAMI AIYAR, Maharaja",
      hi: 'आपका पत्र… मुझे सर सी.पी. रामास्वामी अय्यर ने दिया है… मैंने भारत में शामिल होने का यह क़दम उठाने का फ़ैसला किया है… सी.पी. रामास्वामी अय्यर, महाराजा',
    },
    checks: { en: ['C.P. RAMASWAMI AIYAR, Maharaja'], hi: ['सी.पी. रामास्वामी अय्यर, महाराजा'] },
    tells: [
      {
        kind: 'name',
        explain: {
          en: 'Sir C.P. was the Dewan who carried the letter; the Maharaja signed RAMA VARMA.',
          hi: 'सर सी.पी. दीवान थे, जो पत्र लाए; महाराजा ने रामा वर्मा नाम से दस्तख़त किए।',
        },
        sources: [{ id: 'mansergh-xii', loc: 'No. 284' }, { id: 'menon-1956', loc: 'ch. V, Stopping the Gap' }],
      },
    ],
  },

  {
    id: 'cabinet-real',
    tier: 2,
    real: true,
    pair: 'cabinet',
    from: { en: 'Pandit Nehru, 17 York Road', hi: 'पंडित नेहरू, 17 यॉर्क रोड' },
    to: { en: 'Lord Mountbatten', hi: 'लॉर्ड माउंटबेटन' },
    text: {
      en: 'SECRET. 4 August 1947. I give below the names of my colleagues in the new Cabinet:… Sardar Vallabhbhai Patel… Rajkumari Amrit Kaur… Dr. B. R. Ambedkar… JAWAHARLAL NEHRU',
      hi: 'SECRET. 4 अगस्त 1947। नए मंत्रिमंडल में मेरे साथियों के नाम नीचे हैं:… सरदार वल्लभभाई पटेल… राजकुमारी अमृत कौर… डॉक्टर भीमराव आंबेडकर… जवाहरलाल नेहरू',
    },
    checks: { en: ['Rajkumari Amrit Kaur', 'Ambedkar'], hi: ['राजकुमारी अमृत कौर', 'आंबेडकर'] },
    document: { sources: [{ id: 'mansergh-xii', loc: 'No. 332' }] },
    why: {
      text: {
        en: "Nehru's list of 4 August; Ambedkar became Law Minister, Amrit Kaur Health Minister.",
        hi: 'नेहरू की 4 अगस्त की सूची; आंबेडकर क़ानून मंत्री बने, अमृत कौर स्वास्थ्य मंत्री।',
      },
      sources: [
        { id: 'mansergh-xii', loc: 'No. 332' },
        { id: 'campbell-johnson-1951', loc: 'Dramatis personae (Amrit Kaur); entry naming Ambedkar "the Minister of Law"' },
      ],
    },
  },
  {
    id: 'cabinet-drafting',
    tier: 3,
    real: false,
    pair: 'cabinet',
    from: { en: 'Pandit Nehru, 17 York Road', hi: 'पंडित नेहरू, 17 यॉर्क रोड' },
    to: { en: 'Lord Mountbatten', hi: 'लॉर्ड माउंटबेटन' },
    text: {
      en: 'SECRET. 4 August 1947. I give below the names of my colleagues in the new Cabinet:… Rajkumari Amrit Kaur… Dr. B. R. Ambedkar, Chairman of the Drafting Committee… JAWAHARLAL NEHRU',
      hi: 'SECRET. 4 अगस्त 1947। नए मंत्रिमंडल में मेरे साथियों के नाम नीचे हैं:… राजकुमारी अमृत कौर… डॉक्टर भीमराव आंबेडकर, ड्राफ़्टिंग कमेटी के अध्यक्ष… जवाहरलाल नेहरू',
    },
    checks: { en: ['Chairman of the Drafting Committee'], hi: ['ड्राफ़्टिंग कमेटी के अध्यक्ष'] },
    tells: [
      {
        kind: 'anachronism',
        explain: {
          en: 'No Drafting Committee yet: the Assembly set it up on 29 August 1947.',
          hi: 'तब ड्राफ़्टिंग कमेटी थी ही नहीं: सभा ने उसे 29 अगस्त 1947 को बनाया।',
        },
        sources: [{ id: 'cad-29aug1947' }],
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
    checks: { en: ['Rashtrapati Bhavan'], hi: ['राष्ट्रपति भवन'] },
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

  {
    id: 'astrologer-fake',
    tier: 3,
    real: false,
    from: { en: 'Correspondent, Bombay', hi: 'संवाददाता, बंबई' },
    to: CIPHER,
    text: {
      en: 'IMMEDIATE. Astrologers chose the midnight hour for the transfer of power, as they called the 15th unlucky.',
      hi: 'IMMEDIATE. सत्ता सौंपने के लिए आधी रात का समय ज्योतिषियों ने चुना, क्योंकि उन्होंने 15 तारीख़ को अशुभ बताया।',
    },
    checks: { en: ['Astrologers chose the midnight hour'], hi: ['ज्योतिषियों ने चुना'] },
    tells: [
      {
        kind: 'knowledge',
        explain: {
          en: 'No record backs it: midnight began 15 August, the day the Act fixed.',
          hi: 'किसी रिकॉर्ड में ऐसा नहीं: आधी रात से 15 अगस्त शुरू हुआ, जो क़ानून का तय दिन था।',
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
    id: 'paise-fake',
    tier: 3,
    real: false,
    from: { en: 'Despatch Section, New Delhi', hi: 'डाक भेजने वाला विभाग, नई दिल्ली' },
    to: CIPHER,
    text: {
      en: 'Note: letters to the Provinces go by inland post at 10 paise each.',
      hi: 'नोट: सूबों को चिट्ठियाँ देश के अंदर की डाक से जाएँगी, एक चिट्ठी 10 नए पैसे की।',
    },
    checks: { en: ['10 paise each'], hi: ['10 नए पैसे'] },
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
    id: 'calcutta-leak-fake',
    tier: 3,
    real: false,
    from: { en: 'Correspondent, Calcutta', hi: 'संवाददाता, कलकत्ता' },
    to: CIPHER,
    text: {
      en: "MOST IMMEDIATE. Award leaked: '…Calcutta and its port go to East Bengal…' Copies are being sold in the bazaar.",
      hi: "MOST IMMEDIATE. फ़ैसला लीक: '…कलकत्ता और उसका बंदरगाह पूर्वी बंगाल को…' बाज़ार में इसकी नक़लें बिक रही हैं।",
    },
    checks: { en: ['Calcutta and its port go to East Bengal'], hi: ['कलकत्ता और उसका बंदरगाह पूर्वी बंगाल को'] },
    tells: [
      {
        kind: 'knowledge',
        explain: {
          en: 'Calcutta stayed in West Bengal, India; no award text was out before the 17th.',
          hi: 'कलकत्ता पश्चिमी बंगाल, यानी भारत में रहा; 17 से पहले फ़ैसले का कोई पाठ बाहर नहीं था।',
        },
        sources: [{ id: 'menon-1957', loc: 'ch. XVII (award outcome)' }, { id: 'mansergh-xii', loc: 'No. 489' }],
      },
    ],
  },
]
