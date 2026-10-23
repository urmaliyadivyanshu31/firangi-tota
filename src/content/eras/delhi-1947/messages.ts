import type { Message } from '../../types'

// Window: Tue 5 Aug (day 1) to Mon 18 Aug 1947 (day 14).
// Event days: 4 = Fri 8 Aug, 8 = Tue 12 Aug, 9 = Wed 13 Aug, 10 = Thu 14 Aug,
// 11 = Fri 15 Aug, 12 = Sat 16 Aug, 13 = Sun 17 Aug.
// The engine places the FIRST onDay message for a day, so each event pair lists the live
// message first; its twin waits until the engine picks among same-day candidates.
// Undated messages may land on any day from 5 to 18 August, so they never name
// Mountbatten's title for "today" or the building's name, both of which change on 15 August.

const CAB = { en: 'Boundary Commission secretariat, Comptroller\'s House', hi: 'सीमा कमीशन का दफ़्तर, कंप्ट्रोलर हाउस' }
const PSV = { en: 'Private Secretary to the Viceroy', hi: 'वायसराय के निजी सचिव' }
const CIPHER = { en: 'Cipher Office, New Delhi', hi: 'साइफ़र दफ़्तर, नई दिल्ली' }
const HEAD = { en: 'Head Clerk, Cipher Office', hi: 'हेड क्लर्क, साइफ़र दफ़्तर' }
const CLERK = { en: 'Cipher clerk', hi: 'साइफ़र क्लर्क' }
const SECRETARIAT = { en: 'Boundary Commission secretariat', hi: 'सीमा कमीशन का दफ़्तर' }
const TEL_LAHORE = { en: 'Telegraph Office, Lahore', hi: 'तार घर, लाहौर' }
const TEL_CALCUTTA = { en: 'Telegraph Office, Calcutta', hi: 'तार घर, कलकत्ता' }
const GOVT_HOUSE = { en: 'Government House, New Delhi', hi: 'गवर्नमेंट हाउस, नई दिल्ली' }

export const messages: Message[] = [
  // ───────────── Event days (onDay) ─────────────

  // Day 4, Fri 8 Aug: the Abell letter (real)
  {
    id: 'd4-abell-letter',
    tier: 2,
    real: true,
    pair: 'abell-letter',
    onDay: 4,
    from: { en: 'G.E.B. Abell, Private Secretary to the Viceroy', hi: 'जी.ई.बी. एबेल, वायसराय के निजी सचिव' },
    to: { en: 'Stuart Abbott, Secretary to the Punjab Governor, Lahore', hi: 'स्टुअर्ट एबट, पंजाब के गवर्नर के सचिव, लाहौर' },
    text: {
      en: 'TOP SECRET. 8 August 1947. My dear Abbott, I enclose a map showing roughly the boundary which Sir Cyril Radcliffe proposes to demarcate in his award, and a note by Christopher Beaumont describing it. There will not be any great changes from this boundary, but it will have to be accurately defined with reference to village and zail boundaries in Lahore district. The award itself is expected within the next 48 hours… G. E. B. ABELL',
      hi: 'TOP SECRET. 8 अगस्त 1947। प्रिय एबट, साथ में एक नक्शा भेज रहा हूँ। इसमें मोटे तौर पर वह सीमा है जो सर सिरिल रैडक्लिफ़ अपने फ़ैसले में खींचने वाले हैं। साथ में क्रिस्टोफ़र बोमॉन्ट का नोट है जो इसे समझाता है। इस सीमा में बड़े बदलाव नहीं होंगे, पर लाहौर ज़िले में इसे गाँवों और ज़ैलों की सीमाओं के हिसाब से ठीक-ठीक तय करना होगा। फ़ैसला अगले 48 घंटों में आने की उम्मीद है… जी.ई.बी. एबेल',
    },
    checks: { en: ['Christopher Beaumont', 'zail boundaries', '48 hours'], hi: ['क्रिस्टोफ़र बोमॉन्ट', 'ज़ैलों की सीमाओं', '48 घंटों'] },
    document: { sources: [{ id: 'mansergh-xii', loc: 'No. 377' }] },
    why: {
      text: {
        en: "Abell was the Viceroy's Private Secretary, Abbott was Secretary to the Punjab Governor, and Beaumont was Radcliffe's private secretary. A zail is a group of villages, so 'zail' is right. The enclosed line put the Ferozepore and Zira tahsils in Pakistan; the final award kept both in India. Why it changed is still argued. In 1948 Mountbatten said Abell sent the letter 'without my knowledge'. Pakistani accounts, and Beaumont himself in 1992, said Mountbatten pressed Radcliffe. On 9 August Nehru had forwarded an Indian engineer's note calling it 'disastrous' if Ferozepore and Zira went to Pakistan.",
        hi: "एबेल वायसराय के निजी सचिव थे, एबट पंजाब के गवर्नर के सचिव, और बोमॉन्ट रैडक्लिफ़ के निजी सचिव। ज़ैल कुछ गाँवों का एक समूह होता है, इसलिए 'ज़ैल' सही है। इस नक्शे में फ़िरोज़पुर और ज़ीरा तहसीलें पाकिस्तान में थीं; आख़िरी फ़ैसले में दोनों भारत में रहीं। यह क्यों बदला, इस पर आज भी बहस है। 1948 में माउंटबेटन ने कहा कि एबेल ने चिट्ठी 'मेरी जानकारी के बिना' भेजी। पाकिस्तान के कई लेखकों ने, और 1992 में ख़ुद बोमॉन्ट ने, कहा कि माउंटबेटन ने रैडक्लिफ़ पर दबाव डाला। 9 अगस्त को नेहरू ने एक भारतीय इंजीनियर का नोट आगे भेजा था, जिसमें लिखा था कि फ़िरोज़पुर और ज़ीरा पाकिस्तान को गए तो यह 'तबाही' होगी।",
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
    from: { en: 'G.E.B. Abell, Private Secretary to the Viceroy', hi: 'जी.ई.बी. एबेल, वायसराय के निजी सचिव' },
    to: { en: 'Stuart Abbott, Secretary to the Punjab Governor, Lahore', hi: 'स्टुअर्ट एबट, पंजाब के गवर्नर के सचिव, लाहौर' },
    text: {
      en: 'TOP SECRET. 8 August 1947. My dear Abbott, I enclose a map showing roughly the boundary which Sir Cyril Radcliffe proposes to demarcate in his award, and a note by Christopher Beaumont describing it. There will not be any great changes from this boundary, but it will have to be accurately defined with reference to village and zilla boundaries in Lahore district. The award itself is expected within the next 48 hours… G. E. B. ABELL, Private Secretary to Sir Cyril Radcliffe',
      hi: 'TOP SECRET. 8 अगस्त 1947। प्रिय एबट, साथ में एक नक्शा भेज रहा हूँ। इसमें मोटे तौर पर वह सीमा है जो सर सिरिल रैडक्लिफ़ अपने फ़ैसले में खींचने वाले हैं। साथ में क्रिस्टोफ़र बोमॉन्ट का नोट है जो इसे समझाता है। इस सीमा में बड़े बदलाव नहीं होंगे, पर लाहौर ज़िले में इसे गाँवों और ज़िलों की सीमाओं के हिसाब से ठीक-ठीक तय करना होगा। फ़ैसला अगले 48 घंटों में आने की उम्मीद है… जी.ई.बी. एबेल, सर सिरिल रैडक्लिफ़ के निजी सचिव',
    },
    checks: { en: ['Private Secretary to Sir Cyril Radcliffe', 'zilla boundaries'], hi: ['सर सिरिल रैडक्लिफ़ के निजी सचिव', 'ज़िलों की सीमाओं'] },
    tells: [
      {
        kind: 'name',
        explain: {
          en: "Abell was the Viceroy's Private Secretary, not Radcliffe's. Radcliffe's private secretary was Christopher Beaumont, the man whose note this letter encloses.",
          hi: 'एबेल वायसराय के निजी सचिव थे, रैडक्लिफ़ के नहीं। रैडक्लिफ़ के निजी सचिव क्रिस्टोफ़र बोमॉन्ट थे, जिनका नोट इसी चिट्ठी के साथ भेजा गया है।',
        },
        factId: 'staff',
        sources: [{ id: 'mansergh-xii', loc: 'No. 377' }],
      },
      {
        kind: 'knowledge',
        explain: {
          en: "There is a second slip for history buffs. Abell wrote 'village and zail boundaries'. A zail is a small group of villages; a zilla is a whole district, far too big to fix a line by village limits. Years later a well-known memoir misquoted the letter in exactly this way.",
          hi: "इतिहास के जानकारों के लिए एक और चूक है। एबेल ने 'गाँव और ज़ैल की सीमाएँ' लिखा था। ज़ैल कुछ गाँवों का छोटा समूह है; ज़िला तो पूरा डिस्ट्रिक्ट होता है, गाँवों के हिसाब से लकीर तय करने के लिए बहुत बड़ा। बरसों बाद एक मशहूर किताब ने इस चिट्ठी को ठीक इसी तरह ग़लत लिखा।",
        },
        sources: [{ id: 'mansergh-xii', loc: 'No. 377' }, { id: 'nayar-1971' }],
      },
    ],
  },

  // Day 8, Tue 12 Aug: the Punjab and Bengal awards are signed
  {
    id: 'd8-awards-all-three',
    tier: 1,
    real: false,
    pair: 'awards-signed',
    onDay: 8,
    from: CAB,
    to: PSV,
    text: {
      en: 'MOST IMMEDIATE. NEW DELHI, {date}. Sir Cyril Radcliffe has signed all three awards today: Punjab, Bengal and Sylhet. Publication is fixed for the morning of the 15th.',
      hi: 'MOST IMMEDIATE. नई दिल्ली, {date}। सर सिरिल रैडक्लिफ़ ने आज तीनों फ़ैसलों पर दस्तख़त कर दिए: पंजाब, बंगाल और सिलहट। छपने का समय 15 तारीख़ की सुबह तय है।',
    },
    checks: { en: ['all three awards today', 'morning of the 15th'], hi: ['तीनों फ़ैसलों पर', '15 तारीख़ की सुबह'] },
    tells: [
      {
        kind: 'date',
        explain: {
          en: 'Only the Punjab and Bengal awards are dated 12 August. The Sylhet award is dated 13 August, tomorrow.',
          hi: '12 अगस्त की तारीख़ सिर्फ़ पंजाब और बंगाल के फ़ैसलों पर है। सिलहट का फ़ैसला 13 अगस्त का है, यानी कल का।',
        },
        factId: 'awards',
        sources: [{ id: 'mansergh-xii', loc: 'No. 488' }, { id: 'campbell-johnson-1951', loc: 'entry for 12 August 1947' }],
      },
      {
        kind: 'date',
        explain: {
          en: 'Nothing was published on the 15th. The awards stayed sealed until after the celebrations and came out on Sunday 17 August.',
          hi: '15 को कुछ नहीं छपा। जश्न ख़त्म होने तक फ़ैसले बंद रखे गए और रविवार 17 अगस्त को छपे।',
        },
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
      en: "MOST IMMEDIATE. NEW DELHI, {date}. The Punjab and Bengal reports are complete, dated New Delhi, 12 August 1947. Sir Cyril Radcliffe has endorsed the Punjab map: 'Attached to my Report d. 12 August 1947 for reference.' The Sylhet report will follow.",
      hi: "MOST IMMEDIATE. नई दिल्ली, {date}। पंजाब और बंगाल की रिपोर्टें तैयार हैं, तारीख़ है: नई दिल्ली, 12 अगस्त 1947। पंजाब के नक्शे पर सर सिरिल रैडक्लिफ़ ने लिखा: 'मेरी 12 अगस्त 1947 की रिपोर्ट के साथ, देखने के लिए।' सिलहट की रिपोर्ट बाद में आएगी।",
    },
    checks: { en: ['Punjab and Bengal reports are complete', 'Sylhet report will follow'], hi: ['पंजाब और बंगाल की रिपोर्टें तैयार हैं', 'सिलहट की रिपोर्ट बाद में'] },
    why: {
      text: {
        en: "The Punjab and Bengal reports are dated 'NEW DELHI, 12 August 1947', and Radcliffe endorsed the Punjab map in exactly these words. That evening he told Campbell-Johnson that both awards were 'complete and ready, but that the Sylhet Award was not'. The Sylhet award followed on 13 August.",
        hi: "पंजाब और बंगाल की रिपोर्टों पर 'नई दिल्ली, 12 अगस्त 1947' लिखा है, और रैडक्लिफ़ ने पंजाब के नक्शे पर ठीक यही शब्द लिखे। उसी शाम उन्होंने कैंपबेल-जॉनसन को बताया कि दोनों फ़ैसले 'पूरे और तैयार' हैं, पर सिलहट का नहीं। सिलहट का फ़ैसला 13 अगस्त को आया।",
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
      en: 'IMMEDIATE. NEW DELHI, {date}. Sir Cyril Radcliffe has signed the Sylhet report today. The Punjab and Bengal reports are dated 12 August. All three stay sealed while His Excellency the Earl Mountbatten of Burma is in Karachi.',
      hi: 'IMMEDIATE. नई दिल्ली, {date}। सर सिरिल रैडक्लिफ़ ने आज सिलहट की रिपोर्ट पर दस्तख़त कर दिए। पंजाब और बंगाल की रिपोर्टें 12 अगस्त की हैं। जब तक हिज़ एक्सेलेंसी बर्मा के अर्ल माउंटबेटन कराची में हैं, तीनों बंद रहेंगी।',
    },
    checks: { en: ['the Earl Mountbatten of Burma'], hi: ['बर्मा के अर्ल माउंटबेटन'] },
    tells: [
      {
        kind: 'knowledge',
        explain: {
          en: "On 13 August Mountbatten was still a viscount: 'Viscount Mountbatten of Burma'. London offered him an earldom on 31 July, and it was announced only on 15 August. Everything else in this telegram checks out.",
          hi: "13 अगस्त को माउंटबेटन अब भी वाइकाउंट थे: 'बर्मा के वाइकाउंट माउंटबेटन'। लंदन ने 31 जुलाई को उन्हें अर्ल की पदवी पेश की, और इसकी घोषणा 15 अगस्त को ही हुई। इस तार की बाक़ी हर बात सही है।",
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
      en: 'IMMEDIATE. NEW DELHI, {date}. Sir Cyril Radcliffe has signed the Sylhet report today. The Punjab and Bengal reports are dated 12 August. All three stay sealed while His Excellency is in Karachi.',
      hi: 'IMMEDIATE. नई दिल्ली, {date}। सर सिरिल रैडक्लिफ़ ने आज सिलहट की रिपोर्ट पर दस्तख़त कर दिए। पंजाब और बंगाल की रिपोर्टें 12 अगस्त की हैं। जब तक हिज़ एक्सेलेंसी कराची में हैं, तीनों बंद रहेंगी।',
    },
    checks: { en: ['Sylhet report today', 'dated 12 August'], hi: ['सिलहट की रिपोर्ट पर', '12 अगस्त की हैं'] },
    why: {
      text: {
        en: 'The Sylhet award is dated 13 August and the other two 12 August. Mountbatten flew to Karachi on 13 August, and the awards were kept sealed until after the celebrations.',
        hi: 'सिलहट के फ़ैसले पर 13 अगस्त की तारीख़ है, बाक़ी दोनों पर 12 अगस्त की। माउंटबेटन 13 अगस्त को कराची गए, और जश्न ख़त्म होने तक फ़ैसले बंद रखे गए।',
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
      en: 'The Fifth Session of the Constituent Assembly of India commenced in the Constitution Hall, New Delhi, at Eleven P. M., Mr. President (The Honourable Dr. Rajendra Prasad) in the Chair. … Mr. President: It is just half a minute to 12. I am expecting the clock to strike 12. … As the clock struck twelve (mid-night), Mr. President and all the Members stood up and took the pledge.',
      hi: 'भारत की संविधान सभा का पाँचवाँ सत्र रात ग्यारह बजे कॉन्स्टिट्यूशन हॉल, नई दिल्ली में शुरू हुआ। अध्यक्षता माननीय डॉ. राजेंद्र प्रसाद कर रहे थे। … अध्यक्ष: 12 बजने में बस आधा मिनट है। मैं घड़ी के 12 बजाने का इंतज़ार कर रहा हूँ। … घड़ी में बारह बजते ही अध्यक्ष और सभी सदस्य खड़े हुए और शपथ ली।',
    },
    checks: { en: ['Eleven P. M.', 'Dr. Rajendra Prasad', 'half a minute to 12'], hi: ['रात ग्यारह बजे', 'डॉ. राजेंद्र प्रसाद', 'बस आधा मिनट'] },
    document: { sources: [{ id: 'cad-14aug1947' }] },
    why: {
      text: {
        en: "The session opened at 11 pm with Prasad, President of the Constituent Assembly, in the chair. The record leaves out one sound. The Tribune reported: 'As the clock chimed twelve, conches blew.'",
        hi: "बैठक रात 11 बजे शुरू हुई, और संविधान सभा के अध्यक्ष डॉ. प्रसाद अध्यक्षता कर रहे थे। रिकॉर्ड में एक आवाज़ दर्ज नहीं है। द ट्रिब्यून ने लिखा: 'घड़ी में बारह बजते ही शंख बज उठे।'",
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
    from: { en: 'Constituent Assembly Office, Council House', hi: 'संविधान सभा का दफ़्तर, काउंसिल हाउस' },
    to: PSV,
    text: {
      en: 'IMMEDIATE. NEW DELHI, {date}. Assembly sits in the Constitution Hall at eleven tonight, Dr Rajendra Prasad, President of India, in the chair. Pledge at the stroke of midnight. Shrimati Hansa Mehta will then present the flag on behalf of the women of India.',
      hi: 'IMMEDIATE. नई दिल्ली, {date}। सभा आज रात ग्यारह बजे कॉन्स्टिट्यूशन हॉल में बैठेगी, अध्यक्षता भारत के राष्ट्रपति डॉ. राजेंद्र प्रसाद करेंगे। ठीक आधी रात को शपथ होगी। उसके बाद श्रीमती हंसा मेहता भारत की महिलाओं की ओर से झंडा भेंट करेंगी।',
    },
    checks: { en: ['President of India'], hi: ['भारत के राष्ट्रपति'] },
    tells: [
      {
        kind: 'anachronism',
        explain: {
          en: 'Prasad chaired the session as President of the Constituent Assembly. There was no President of India until India became a republic.',
          hi: 'प्रसाद संविधान सभा के अध्यक्ष के नाते बैठक चला रहे थे। भारत के राष्ट्रपति का पद तो भारत के गणतंत्र बनने पर ही बना।',
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
      en: 'IMMEDIATE. NEW DELHI, {date}. For His Excellency the Viceroy. Crowd at Princes Park already far above the thirty thousand planned. The flag ceremony this evening goes ahead as fixed.',
      hi: 'IMMEDIATE. नई दिल्ली, {date}। हिज़ एक्सेलेंसी वायसराय के लिए। प्रिंसेस पार्क में भीड़ अभी से तय तीस हज़ार से कहीं ज़्यादा है। शाम का झंडा समारोह तय समय पर होगा।',
    },
    checks: { en: ['His Excellency the Viceroy'], hi: ['हिज़ एक्सेलेंसी वायसराय'] },
    tells: [
      {
        kind: 'knowledge',
        explain: {
          en: 'There was no Viceroy on 15 August. After midnight the Assembly endorsed Mountbatten as Governor-General of India, and at 8.30 that morning Chief Justice Kania swore him in. The rest checks out: the park was planned for about 30,000 and drew nearer 300,000.',
          hi: '15 अगस्त को कोई वायसराय नहीं था। आधी रात के बाद सभा ने माउंटबेटन को भारत का गवर्नर-जनरल माना, और सुबह 8.30 बजे चीफ़ जस्टिस कानिया ने उन्हें शपथ दिलाई। बाक़ी सब सही है: पार्क में करीब 30,000 लोगों का इंतज़ाम था, और आए करीब 3 लाख।',
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
      en: 'Message from the Assembly, agreed after midnight: (1) the Constituent Assembly of India has assumed power for the governance of India, and (2) the Constituent Assembly of India has endorsed the recommendation that Lord Mountbatten be Governor-General of India from the 15th August 1947.',
      hi: 'सभा का संदेश, आधी रात के बाद मंज़ूर हुआ: (1) भारत की संविधान सभा ने भारत का शासन सँभाल लिया है, और (2) भारत की संविधान सभा ने यह सिफ़ारिश मान ली है कि 15 अगस्त 1947 से लॉर्ड माउंटबेटन भारत के गवर्नर-जनरल हों।',
    },
    checks: { en: ['assumed power for the governance of India', 'Governor-General of India from the 15th August 1947'], hi: ['शासन सँभाल लिया है', 'भारत के गवर्नर-जनरल हों'] },
    document: { sources: [{ id: 'cad-14aug1947' }] },
    why: {
      text: {
        en: "Prasad and Nehru carried this message to Mountbatten after midnight. He replied: 'I am proud of the honour, and I will do my best to carry out your advice in a constitutional manner.'",
        hi: "प्रसाद और नेहरू आधी रात के बाद यह संदेश लेकर माउंटबेटन के पास गए। उन्होंने जवाब दिया: 'मुझे इस सम्मान पर गर्व है, और मैं आपकी सलाह को संविधान के मुताबिक़ निभाने की पूरी कोशिश करूँगा।'",
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
    from: { en: 'Telegraph Office, Delhi', hi: 'तार घर, दिल्ली' },
    to: GOVT_HOUSE,
    text: {
      en: 'IMMEDIATE. DELHI, {date}. National flag hoisted over the Red Fort very early this morning. Pandit Nehru addressed a crowd of some half a million.',
      hi: 'IMMEDIATE. दिल्ली, {date}। आज बहुत सुबह लाल क़िले पर राष्ट्रीय झंडा फहराया गया। पंडित नेहरू ने करीब पाँच लाख लोगों की भीड़ के सामने भाषण दिया।',
    },
    checks: { en: ['Red Fort very early this morning'], hi: ['आज बहुत सुबह लाल क़िले पर'] },
    why: {
      text: {
        en: "It looks a day late, but it is right. The flag went up over the Red Fort very early on Saturday 16 August, not on the 15th, and Nehru spoke to 'some half a million'.",
        hi: "देखने में यह एक दिन देर से लगता है, पर सही है। लाल क़िले पर झंडा शनिवार 16 अगस्त को बहुत सुबह चढ़ा, 15 को नहीं, और नेहरू ने 'करीब पाँच लाख' लोगों के सामने भाषण दिया।",
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
    from: { en: 'Telegraph Office, Delhi', hi: 'तार घर, दिल्ली' },
    to: GOVT_HOUSE,
    text: {
      en: 'IMMEDIATE. DELHI, {date}. National flag hoisted over the Red Fort yesterday, 15 August, at 8.30 am. Pandit Nehru addressed a crowd of some half a million.',
      hi: 'IMMEDIATE. दिल्ली, {date}। कल, 15 अगस्त को सुबह 8.30 बजे लाल क़िले पर राष्ट्रीय झंडा फहराया गया। पंडित नेहरू ने करीब पाँच लाख लोगों की भीड़ के सामने भाषण दिया।',
    },
    checks: { en: ['Red Fort yesterday, 15 August'], hi: ['कल, 15 अगस्त'] },
    tells: [
      {
        kind: 'date',
        explain: {
          en: "The Red Fort flag went up very early today, Saturday 16 August. At 8.30 am on the 15th Mountbatten was being sworn in in the Durbar Hall, and that day's flag was raised at the Council House.",
          hi: 'लाल क़िले पर झंडा आज, शनिवार 16 अगस्त को बहुत सुबह चढ़ा। 15 की सुबह 8.30 बजे तो दरबार हॉल में माउंटबेटन की शपथ हो रही थी, और उस दिन का झंडा काउंसिल हाउस पर चढ़ा था।',
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
    from: { en: 'Report of the Punjab Boundary Commission', hi: 'पंजाब सीमा कमीशन की रिपोर्ट' },
    to: { en: 'Gazette of India Extraordinary, for publication', hi: 'गज़ट ऑफ़ इंडिया का ख़ास अंक, छपने के लिए' },
    text: {
      en: "Report of the Punjab Boundary Commission, dated 12 August 1947. Para 12: 'I am conscious too that the award cannot go far towards satisfying sentiments and aspirations deeply held on either side…' CYRIL RADCLIFFE.",
      hi: "पंजाब सीमा कमीशन की रिपोर्ट, तारीख़ 12 अगस्त 1947। पैरा 12: 'मैं यह भी जानता हूँ कि यह फ़ैसला दोनों तरफ़ की गहरी भावनाओं और उम्मीदों को ज़्यादा पूरा नहीं कर सकता…' सिरिल रैडक्लिफ़।",
    },
    checks: { en: ['dated 12 August 1947', 'CYRIL RADCLIFFE'], hi: ['तारीख़ 12 अगस्त 1947', 'सिरिल रैडक्लिफ़'] },
    document: { sources: [{ id: 'mansergh-xii', loc: 'No. 488, Appendix I, para 12' }] },
    why: {
      text: {
        en: 'Signed on 12 August, kept sealed through the celebrations, handed to the leaders on Saturday 16 August, and published in a Gazette Extraordinary on Sunday 17 August.',
        hi: '12 अगस्त को दस्तख़त हुए, जश्न के दौरान बंद रखा गया, शनिवार 16 अगस्त को नेताओं को दिया गया, और रविवार 17 अगस्त को गज़ट के ख़ास अंक में छपा।',
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
    from: { en: 'Gazette of India Extraordinary', hi: 'गज़ट ऑफ़ इंडिया, ख़ास अंक' },
    to: { en: 'For publication', hi: 'छपने के लिए' },
    text: {
      en: "NEW DELHI, Saturday, {date}. Report of the Punjab Boundary Commission, dated 12 August 1947. Para 12: 'I am conscious too that the award cannot go far towards satisfying sentiments and aspirations deeply held on either side…' CYRIL RADCLIFFE.",
      hi: "नई दिल्ली, शनिवार, {date}। पंजाब सीमा कमीशन की रिपोर्ट, तारीख़ 12 अगस्त 1947। पैरा 12: 'मैं यह भी जानता हूँ कि यह फ़ैसला दोनों तरफ़ की गहरी भावनाओं और उम्मीदों को ज़्यादा पूरा नहीं कर सकता…' सिरिल रैडक्लिफ़।",
    },
    checks: { en: ['Saturday'], hi: ['शनिवार'] },
    tells: [
      {
        kind: 'weekday',
        explain: {
          en: '17 August 1947 was a Sunday, and the awards were published on that Sunday. Count on from Friday 15 August.',
          hi: '17 अगस्त 1947 रविवार था, और फ़ैसले उसी रविवार को छपे। शुक्रवार 15 अगस्त से आगे गिनिए।',
        },
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
      en: "For the file. Sir Cyril Radcliffe, chairman of both Boundary Commissions. Office: the Comptroller's House on the Viceregal estate. Private secretary: Mr Christopher Beaumont.",
      hi: 'फ़ाइल के लिए। सर सिरिल रैडक्लिफ़, दोनों सीमा कमीशनों के अध्यक्ष। दफ़्तर: वायसराय के अहाते में कंप्ट्रोलर हाउस। निजी सचिव: मिस्टर क्रिस्टोफ़र बोमॉन्ट।',
    },
    checks: { en: ["Comptroller's House", 'Mr Christopher Beaumont'], hi: ['कंप्ट्रोलर हाउस', 'मिस्टर क्रिस्टोफ़र बोमॉन्ट'] },
    why: {
      text: {
        en: "Radcliffe lived and worked at the Comptroller's House on the Viceregal estate, and Christopher Beaumont was his private secretary.",
        hi: 'रैडक्लिफ़ वायसराय के अहाते में कंप्ट्रोलर हाउस में रहते और काम करते थे, और क्रिस्टोफ़र बोमॉन्ट उनके निजी सचिव थे।',
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
      en: "For the file. Sir Cyril Radcliffe, chairman of both Boundary Commissions. Office: the Comptroller's House on the Viceregal estate. Private secretary: Mr George Abell.",
      hi: 'फ़ाइल के लिए। सर सिरिल रैडक्लिफ़, दोनों सीमा कमीशनों के अध्यक्ष। दफ़्तर: वायसराय के अहाते में कंप्ट्रोलर हाउस। निजी सचिव: मिस्टर जॉर्ज एबेल।',
    },
    checks: { en: ['Mr George Abell'], hi: ['मिस्टर जॉर्ज एबेल'] },
    tells: [
      {
        kind: 'name',
        explain: {
          en: "Radcliffe's private secretary was Christopher Beaumont. George Abell was the Viceroy's Private Secretary.",
          hi: 'रैडक्लिफ़ के निजी सचिव क्रिस्टोफ़र बोमॉन्ट थे। जॉर्ज एबेल वायसराय के निजी सचिव थे।',
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
      en: 'For the file. Sir Cyril Radcliffe, chairman of both Boundary Commissions, reached Delhi on 8 July, his first time in India. He left for Calcutta and Lahore on 10 July.',
      hi: 'फ़ाइल के लिए। दोनों सीमा कमीशनों के अध्यक्ष सर सिरिल रैडक्लिफ़ 8 जुलाई को दिल्ली पहुँचे। वे पहली बार भारत आए थे। 10 जुलाई को वे कलकत्ता और लाहौर के लिए निकले।',
    },
    checks: { en: ['8 July', 'first time in India'], hi: ['8 जुलाई', 'पहली बार भारत'] },
    why: {
      text: {
        en: 'Radcliffe arrived on 8 July and left for Calcutta and Lahore on the 10th. He had never been to India before.',
        hi: 'रैडक्लिफ़ 8 जुलाई को आए और 10 को कलकत्ता और लाहौर के लिए निकले। वे पहले कभी भारत नहीं आए थे।',
      },
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
      en: 'For the file. Sir Cyril Radcliffe, chairman of both Boundary Commissions, reached Delhi on 8 June, his first time in India. He left for Calcutta and Lahore on 10 July.',
      hi: 'फ़ाइल के लिए। दोनों सीमा कमीशनों के अध्यक्ष सर सिरिल रैडक्लिफ़ 8 जून को दिल्ली पहुँचे। वे पहली बार भारत आए थे। 10 जुलाई को वे कलकत्ता और लाहौर के लिए निकले।',
    },
    checks: { en: ['8 June'], hi: ['8 जून'] },
    tells: [
      {
        kind: 'date',
        explain: {
          en: 'He reached Delhi on 8 July. On 8 June there was no chairman at all: the Partition Council agreed on Radcliffe only on 27 June.',
          hi: 'वे 8 जुलाई को दिल्ली पहुँचे। 8 जून को तो कोई अध्यक्ष था ही नहीं: पार्टिशन काउंसिल ने रैडक्लिफ़ का नाम 27 जून को तय किया।',
        },
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
      en: 'For the file. Punjab Boundary Commission: Justices Din Muhammad, Muhammad Munir, Mehr Chand Mahajan and Teja Singh. Chairman: Sir Cyril Radcliffe.',
      hi: 'फ़ाइल के लिए। पंजाब सीमा कमीशन: जस्टिस दीन मुहम्मद, मुहम्मद मुनीर, मेहर चंद महाजन और तेजा सिंह। अध्यक्ष: सर सिरिल रैडक्लिफ़।',
    },
    checks: { en: ['Mehr Chand Mahajan and Teja Singh'], hi: ['मेहर चंद महाजन और तेजा सिंह'] },
    why: {
      text: {
        en: "These are the four Punjab judges named in Radcliffe's award, with Radcliffe as chairman.",
        hi: 'रैडक्लिफ़ के फ़ैसले में यही चार पंजाब जज दर्ज हैं, और अध्यक्ष रैडक्लिफ़ ख़ुद।',
      },
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
      en: 'For the file. Punjab Boundary Commission: Justices Din Muhammad, Muhammad Munir, Mehr Chand Mahajan and C.C. Biswas. Chairman: Sir Cyril Radcliffe.',
      hi: 'फ़ाइल के लिए। पंजाब सीमा कमीशन: जस्टिस दीन मुहम्मद, मुहम्मद मुनीर, मेहर चंद महाजन और सी.सी. बिस्वास। अध्यक्ष: सर सिरिल रैडक्लिफ़।',
    },
    checks: { en: ['C.C. Biswas'], hi: ['सी.सी. बिस्वास'] },
    tells: [
      {
        kind: 'name',
        explain: {
          en: 'Justice C.C. Biswas sat on the Bengal Commission. The fourth Punjab judge was Justice Teja Singh.',
          hi: 'जस्टिस सी.सी. बिस्वास बंगाल कमीशन में थे। पंजाब के चौथे जज जस्टिस तेजा सिंह थे।',
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
      en: 'IMMEDIATE. NEW DELHI, {date}. Punjab Boundary Force under Maj-Gen T.W. Rees, set up on 1 August: about 50,000 officers and men.',
      hi: 'IMMEDIATE. नई दिल्ली, {date}। मेजर-जनरल टी.डब्ल्यू. रीस की पंजाब बाउंड्री फ़ोर्स, 1 अगस्त को बनी: करीब 50,000 अफ़सर और जवान।',
    },
    checks: { en: ['Maj-Gen T.W. Rees', 'about 50,000'], hi: ['टी.डब्ल्यू. रीस', 'करीब 50,000'] },
    why: {
      text: {
        en: 'The Punjab Boundary Force was set up on 1 August under Maj-Gen Rees, with about 50,000 officers and men.',
        hi: 'पंजाब बाउंड्री फ़ोर्स 1 अगस्त को मेजर-जनरल रीस के तहत बनी, जिसमें करीब 50,000 अफ़सर और जवान थे।',
      },
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
      en: 'IMMEDIATE. NEW DELHI, {date}. Punjab Boundary Force under Maj-Gen T.W. Rees, set up on 1 August: about 5,000 officers and men.',
      hi: 'IMMEDIATE. नई दिल्ली, {date}। मेजर-जनरल टी.डब्ल्यू. रीस की पंजाब बाउंड्री फ़ोर्स, 1 अगस्त को बनी: करीब 5,000 अफ़सर और जवान।',
    },
    checks: { en: ['about 5,000'], hi: ['करीब 5,000'] },
    tells: [
      {
        kind: 'number',
        explain: {
          en: 'Menon puts the force at about 50,000 officers and men. The Tota dropped a nought.',
          hi: 'मेनन के मुताबिक़ फ़ोर्स में करीब 50,000 अफ़सर और जवान थे। तोते ने एक शून्य गिरा दिया।',
        },
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
      en: 'Note for the desk. The Indian Independence Act received the Royal Assent on Friday 18 July. The appointed day is Friday 15 August.',
      hi: 'मेज़ के लिए नोट। आज़ादी के क़ानून (इंडियन इंडिपेंडेंस ऐक्ट) को शुक्रवार 18 जुलाई को राजा की मंज़ूरी मिली। तय दिन शुक्रवार 15 अगस्त है।',
    },
    checks: { en: ['Friday 18 July', 'Friday 15 August'], hi: ['शुक्रवार 18 जुलाई', 'शुक्रवार 15 अगस्त'] },
    why: {
      text: {
        en: 'The Bill passed the Commons on 15 July and the Lords on the 16th, and received the Royal Assent on Friday 18 July. The appointed day was Friday 15 August.',
        hi: 'बिल 15 जुलाई को कॉमन्स में और 16 को लॉर्ड्स में पास हुआ, और शुक्रवार 18 जुलाई को राजा की मंज़ूरी मिली। तय दिन शुक्रवार 15 अगस्त था।',
      },
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
      en: 'Note for the desk. The Indian Independence Act received the Royal Assent on Friday 4 July. The appointed day is Friday 15 August.',
      hi: 'मेज़ के लिए नोट। आज़ादी के क़ानून (इंडियन इंडिपेंडेंस ऐक्ट) को शुक्रवार 4 जुलाई को राजा की मंज़ूरी मिली। तय दिन शुक्रवार 15 अगस्त है।',
    },
    checks: { en: ['Friday 4 July'], hi: ['शुक्रवार 4 जुलाई'] },
    tells: [
      {
        kind: 'date',
        explain: {
          en: '4 July is the day the Bill was brought into the House of Commons. The Royal Assent came two weeks later, on Friday 18 July.',
          hi: '4 जुलाई को तो बिल हाउस ऑफ़ कॉमन्स में पेश हुआ था। राजा की मंज़ूरी दो हफ़्ते बाद, शुक्रवार 18 जुलाई को मिली।',
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
      en: 'Reference your query. The First Schedule of the Act lists Murshidabad, Nadia and Malda in East Bengal. Khulna and the Chittagong Hill Tracts are not listed there.',
      hi: 'आपके सवाल के जवाब में। क़ानून की पहली सूची में मुर्शिदाबाद, नदिया और मालदा पूर्वी बंगाल में गिने गए हैं। खुलना और चटगाँव हिल ट्रैक्ट्स उस सूची में नहीं हैं।',
    },
    checks: { en: ['Murshidabad, Nadia and Malda', 'Khulna and the Chittagong Hill Tracts'], hi: ['मुर्शिदाबाद, नदिया और मालदा', 'खुलना और चटगाँव हिल ट्रैक्ट्स'] },
    why: {
      text: {
        en: "The Act's First Schedule put Murshidabad, Nadia and Malda in East Bengal for the time being, and did not list Khulna or the Chittagong Hill Tracts.",
        hi: 'क़ानून की पहली सूची ने कुछ समय के लिए मुर्शिदाबाद, नदिया और मालदा को पूर्वी बंगाल में रखा, और खुलना या चटगाँव हिल ट्रैक्ट्स का नाम नहीं लिया।',
      },
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
      en: 'Reference your query. The First Schedule of the Act lists Khulna and the Chittagong Hill Tracts in East Bengal. Murshidabad, Nadia and Malda are not listed there.',
      hi: 'आपके सवाल के जवाब में। क़ानून की पहली सूची में खुलना और चटगाँव हिल ट्रैक्ट्स पूर्वी बंगाल में गिने गए हैं। मुर्शिदाबाद, नदिया और मालदा उस सूची में नहीं हैं।',
    },
    checks: { en: ['Khulna and the Chittagong Hill Tracts in East Bengal'], hi: ['खुलना और चटगाँव हिल ट्रैक्ट्स पूर्वी बंगाल में'] },
    tells: [
      {
        kind: 'place',
        explain: {
          en: 'It is the other way round. The Schedule put Murshidabad, Nadia and Malda in East Bengal for now and left Khulna and the Chittagong Hill Tracts out. The final award largely reversed this.',
          hi: 'बात उलटी है। सूची ने अभी के लिए मुर्शिदाबाद, नदिया और मालदा को पूर्वी बंगाल में रखा, और खुलना और चटगाँव हिल ट्रैक्ट्स को बाहर छोड़ा। आख़िरी फ़ैसले ने इसे काफ़ी हद तक पलट दिया।',
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
      en: "MOST IMMEDIATE. UNNUMBERED. LAHORE, {date}. Please repeat the Partition Council statement of 22 July, pledging both sides to accept the awards 'whatever these may be'.",
      hi: "MOST IMMEDIATE. UNNUMBERED. लाहौर, {date}। कृपया 22 जुलाई का पार्टिशन काउंसिल वाला बयान फिर से भेजें, जिसमें दोनों पक्षों ने फ़ैसले मानने का वादा किया था, 'चाहे वे जो भी हों'।",
    },
    checks: { en: ['MOST IMMEDIATE. UNNUMBERED.', '22 July'], hi: ['MOST IMMEDIATE. UNNUMBERED.', '22 जुलाई'] },
    why: {
      text: {
        en: "The header follows real telegrams of that week, some of them marked 'UNNUMBERED'. On 22 July the Partition Council pledged both sides to accept the awards 'whatever these may be'.",
        hi: "ऊपर का हिस्सा उस हफ़्ते के असली तारों जैसा है, जिनमें से कुछ पर 'UNNUMBERED' लिखा है। 22 जुलाई को पार्टिशन काउंसिल ने दोनों पक्षों से फ़ैसले मानने का वादा लिया था, 'चाहे वे जो भी हों'।",
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
      en: "URGENT!! Ref: 3408/S/47. LAHORE, {date}. Please repeat the Partition Council statement of 22 July, pledging both sides to accept the awards 'whatever these may be'.",
      hi: "URGENT!! Ref: 3408/S/47. लाहौर, {date}। कृपया 22 जुलाई का पार्टिशन काउंसिल वाला बयान फिर से भेजें, जिसमें दोनों पक्षों ने फ़ैसले मानने का वादा किया था, 'चाहे वे जो भी हों'।",
    },
    checks: { en: ['URGENT!!', 'Ref: 3408/S/47'], hi: ['URGENT!!', 'Ref: 3408/S/47'] },
    tells: [
      {
        kind: 'form',
        ruleId: 'priority',
        explain: {
          en: "Real priorities read IMPORTANT, IMMEDIATE or MOST IMMEDIATE, and numbers read like 'No. 3408-S' or 'UNNUMBERED'. 'URGENT!!' and 'Ref: 3408/S/47' are a modern office's habits.",
          hi: "असली प्राथमिकता IMPORTANT, IMMEDIATE या MOST IMMEDIATE होती है, और नंबर 'No. 3408-S' या 'UNNUMBERED' जैसा। 'URGENT!!' और 'Ref: 3408/S/47' आज के दफ़्तरों की आदत है।",
        },
        sources: [{ id: 'mansergh-xii', loc: 'Nos. 391, 462, 477, 485 (headers)' }],
      },
    ],
  },

  {
    id: 'sign-off-real',
    tier: 2,
    real: true,
    pair: 'sign-off',
    from: { en: "Governor's Secretary, Lahore", hi: 'गवर्नर के सचिव, लाहौर' },
    to: CIPHER,
    text: {
      en: 'IMMEDIATE. LAHORE, {date}. Please pass following to Records Section for the file. Begins. The Punjab Boundary Commission sat in public in Lahore from 21 to 31 July, with no sitting on Sunday the 27th. Ends.',
      hi: 'IMMEDIATE. लाहौर, {date}। नीचे का संदेश फ़ाइल के लिए रिकॉर्ड विभाग को दें। Begins. पंजाब सीमा कमीशन की खुली सुनवाई लाहौर में 21 से 31 जुलाई तक हुई, रविवार 27 तारीख़ को छोड़कर। Ends.',
    },
    checks: { en: ['21 to 31 July', 'Sunday the 27th'], hi: ['21 से 31 जुलाई', 'रविवार 27 तारीख़'] },
    why: {
      text: {
        en: "Radcliffe's own award says the public sittings ran from Monday 21 July to Thursday 31 July, 'with the exception of Sunday, the 27th of July'. Passed-on text sits between 'Begins.' and 'Ends.', as in real telegrams.",
        hi: "रैडक्लिफ़ के फ़ैसले में ख़ुद लिखा है कि खुली सुनवाई सोमवार 21 जुलाई से गुरुवार 31 जुलाई तक चली, 'रविवार 27 जुलाई को छोड़कर'। आगे भेजा गया संदेश असली तारों की तरह 'Begins.' और 'Ends.' के बीच है।",
      },
      sources: [{ id: 'mansergh-xii', loc: 'No. 488, Appendix I, para 5; No. 418 (passed-on text format)' }],
    },
  },
  {
    id: 'sign-off-fake',
    tier: 2,
    real: false,
    pair: 'sign-off',
    from: { en: "Governor's Secretary, Lahore", hi: 'गवर्नर के सचिव, लाहौर' },
    to: CIPHER,
    text: {
      en: 'IMMEDIATE. LAHORE, {date}. Please pass following to Records Section for the file. Begins. The Punjab Boundary Commission sat in public in Lahore from 21 to 31 July, with no sitting on Sunday the 27th. Jai Hind. Ends.',
      hi: 'IMMEDIATE. लाहौर, {date}। नीचे का संदेश फ़ाइल के लिए रिकॉर्ड विभाग को दें। Begins. पंजाब सीमा कमीशन की खुली सुनवाई लाहौर में 21 से 31 जुलाई तक हुई, रविवार 27 तारीख़ को छोड़कर। जय हिंद। Ends.',
    },
    checks: { en: ['Jai Hind'], hi: ['जय हिंद'] },
    tells: [
      {
        kind: 'habit',
        ruleId: 'begins-ends',
        explain: {
          en: "The passed-on text is an office note from the Governor's Secretary, Lahore, and official notes never signed off with a slogan. 'Jai Hind' closed speeches and broadcasts (Nehru ended his broadcast of 3 June with it).",
          hi: "आगे भेजा गया संदेश लाहौर के गवर्नर के सचिव का दफ़्तरी नोट है, और सरकारी नोट किसी नारे से ख़त्म नहीं होते थे। 'जय हिंद' भाषणों और रेडियो पर बोला जाता था (नेहरू ने 3 जून का अपना रेडियो भाषण इसी से ख़त्म किया)।",
        },
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
      en: 'Desk note for {weekday}, {date}. Keep a copy of the Indian Independence Act and its First and Second Schedules on the desk for checking district names.',
      hi: '{weekday}, {date} के लिए मेज़ का नोट। ज़िलों के नाम जाँचने के लिए आज़ादी के क़ानून और उसकी पहली और दूसरी सूची की एक कॉपी मेज़ पर रखें।',
    },
    checks: { en: ['Desk note for'], hi: ['के लिए मेज़ का नोट'] },
    why: {
      text: {
        en: "The weekday matches the date: 15 August 1947 is a Friday, so count from there. The Act's First and Second Schedules really did list the notional districts.",
        hi: 'दिन और तारीख़ मेल खाते हैं: 15 अगस्त 1947 शुक्रवार है, वहाँ से गिनिए। क़ानून की पहली और दूसरी सूची में सच में कामचलाऊ ज़िले दर्ज थे।',
      },
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
      en: 'Desk note for {weekday+1}, {date}. Keep a copy of the Indian Independence Act and its First and Second Schedules on the desk for checking district names.',
      hi: '{weekday+1}, {date} के लिए मेज़ का नोट। ज़िलों के नाम जाँचने के लिए आज़ादी के क़ानून और उसकी पहली और दूसरी सूची की एक कॉपी मेज़ पर रखें।',
    },
    checks: { en: ['Desk note for'], hi: ['के लिए मेज़ का नोट'] },
    tells: [
      {
        kind: 'weekday',
        explain: {
          en: "The weekday does not match the date: it is one day ahead. 15 August 1947 is a Friday; count from there.",
          hi: 'दिन तारीख़ से मेल नहीं खाता: यह एक दिन आगे है। 15 अगस्त 1947 शुक्रवार है, वहाँ से गिनिए।',
        },
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
      en: 'IMMEDIATE. CALCUTTA, {date}. For the file: Bengal Boundary Commission, Justices Bijan Kumar Mukherjea, C.C. Biswas, Abu Saleh Mohamed Akram and S.A. Rahman. Chairman, Sir Cyril Radcliffe.',
      hi: 'IMMEDIATE. कलकत्ता, {date}। फ़ाइल के लिए: बंगाल सीमा कमीशन, जस्टिस बिजन कुमार मुखर्जी, सी.सी. बिस्वास, अबू सालेह मोहम्मद अकरम और एस.ए. रहमान। अध्यक्ष, सर सिरिल रैडक्लिफ़।',
    },
    checks: { en: ['CALCUTTA', 'S.A. Rahman'], hi: ['कलकत्ता', 'एस.ए. रहमान'] },
    why: {
      text: {
        en: "Calcutta is the 1947 name, and these are the four Bengal judges named in Radcliffe's award.",
        hi: 'कलकत्ता 1947 का नाम है, और रैडक्लिफ़ के फ़ैसले में बंगाल के यही चार जज दर्ज हैं।',
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
      en: 'IMMEDIATE. KOLKATA, {date}. For the file: Bengal Boundary Commission, Justices Bijan Kumar Mukherjea, C.C. Biswas, Abu Saleh Mohamed Akram and S.A. Rahman. Chairman, Sir Cyril Radcliffe.',
      hi: 'IMMEDIATE. कोलकाता, {date}। फ़ाइल के लिए: बंगाल सीमा कमीशन, जस्टिस बिजन कुमार मुखर्जी, सी.सी. बिस्वास, अबू सालेह मोहम्मद अकरम और एस.ए. रहमान। अध्यक्ष, सर सिरिल रैडक्लिफ़।',
    },
    checks: { en: ['KOLKATA'], hi: ['कोलकाता'] },
    tells: [
      {
        kind: 'anachronism',
        ruleId: 'city-names',
        explain: {
          en: "In 1947 every telegram says Calcutta. 'Kolkata' is a modern name, and the Tota let it slip.",
          hi: "1947 के हर तार में कलकत्ता लिखा है। 'कोलकाता' आज का नाम है, जो तोते के मुँह से निकल गया।",
        },
        sources: [{ id: 'mansergh-xii', loc: 'No. 287 (Calcutta meeting, 30 July 1947)' }],
      },
    ],
  },

  {
    id: 'council-house-real',
    tier: 2,
    real: true,
    pair: 'council-house',
    from: { en: 'Constituent Assembly Office, Council House', hi: 'संविधान सभा का दफ़्तर, काउंसिल हाउस' },
    to: CIPHER,
    text: {
      en: 'For the file: the Constituent Assembly meets in the Constitution Hall of the Council House, New Delhi. Its President is Dr Rajendra Prasad.',
      hi: 'फ़ाइल के लिए: संविधान सभा नई दिल्ली के काउंसिल हाउस के कॉन्स्टिट्यूशन हॉल में बैठती है। उसके अध्यक्ष डॉ. राजेंद्र प्रसाद हैं।',
    },
    checks: { en: ['Constituent Assembly', 'Council House'], hi: ['संविधान सभा', 'काउंसिल हाउस'] },
    why: {
      text: {
        en: 'The Constituent Assembly met in the Constitution Hall of the Council House, with Dr Rajendra Prasad as its President.',
        hi: 'संविधान सभा काउंसिल हाउस के कॉन्स्टिट्यूशन हॉल में बैठती थी, और डॉ. राजेंद्र प्रसाद उसके अध्यक्ष थे।',
      },
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
      en: 'For the file: the Lok Sabha meets in Parliament House, New Delhi. Its President is Dr Rajendra Prasad.',
      hi: 'फ़ाइल के लिए: लोकसभा नई दिल्ली के पार्लियामेंट हाउस में बैठती है। उसके अध्यक्ष डॉ. राजेंद्र प्रसाद हैं।',
    },
    checks: { en: ['Lok Sabha'], hi: ['लोकसभा'] },
    tells: [
      {
        kind: 'anachronism',
        ruleId: 'council-house',
        explain: {
          en: 'There was no Lok Sabha in 1947. The body was the Constituent Assembly, and it met at the Council House.',
          hi: '1947 में लोकसभा थी ही नहीं। उस वक़्त संविधान सभा थी, और वह काउंसिल हाउस में बैठती थी।',
        },
        sources: [{ id: 'cad-14aug1947' }],
      },
    ],
  },

  {
    id: 'flag-resolution',
    tier: 2,
    real: true,
    pair: 'flag-adopted',
    from: { en: 'Constituent Assembly of India, resolution of 22 July 1947', hi: 'भारत की संविधान सभा, 22 जुलाई 1947 का प्रस्ताव' },
    to: { en: 'Cipher Office file', hi: 'साइफ़र दफ़्तर की फ़ाइल' },
    text: {
      en: 'Resolved that the National Flag of India shall be horizontal tricolour of deep Saffron (Kesari), white and dark green in equal proportion. In the centre of the white band, there shall be a Wheel in navy blue to represent the Charkha. … The ratio of the width to the length of the Flag shall ordinarily be 2:3.',
      hi: 'तय हुआ कि भारत का राष्ट्रीय झंडा आड़ा तिरंगा होगा: गहरा केसरिया, सफ़ेद और गहरा हरा, तीनों बराबर। सफ़ेद पट्टी के बीच में गहरे नीले रंग का एक चक्र होगा, जो चरखे की निशानी है। … झंडे की चौड़ाई और लंबाई का अनुपात आम तौर पर 2:3 होगा।',
    },
    checks: { en: ['deep Saffron (Kesari)', 'navy blue', '2:3'], hi: ['गहरा केसरिया', 'गहरे नीले रंग', '2:3'] },
    document: { sources: [{ id: 'cad-22jul1947' }] },
    why: {
      text: {
        en: 'These are the words of the flag resolution in the Constituent Assembly on Tuesday 22 July 1947: three equal bands and a navy-blue wheel standing for the charkha.',
        hi: 'ये मंगलवार 22 जुलाई 1947 को संविधान सभा में आए झंडे के प्रस्ताव के शब्द हैं: तीन बराबर पट्टियाँ और चरखे की निशानी के तौर पर गहरे नीले रंग का चक्र।',
      },
      sources: [{ id: 'cad-22jul1947' }],
    },
  },
  {
    id: 'flag-monday',
    tier: 2,
    real: false,
    pair: 'flag-adopted',
    from: { en: 'Constituent Assembly Office, Council House', hi: 'संविधान सभा का दफ़्तर, काउंसिल हाउस' },
    to: { en: 'Cipher Office file', hi: 'साइफ़र दफ़्तर की फ़ाइल' },
    text: {
      en: 'For the file: on Monday 22 July the Assembly adopted the National Flag, a horizontal tricolour of deep Saffron (Kesari), white and dark green in equal proportion, with a Wheel in navy blue.',
      hi: 'फ़ाइल के लिए: सोमवार 22 जुलाई को सभा ने राष्ट्रीय झंडा अपनाया, गहरा केसरिया, सफ़ेद और गहरा हरा, तीनों बराबर, और बीच में गहरे नीले रंग का चक्र।',
    },
    checks: { en: ['Monday 22 July'], hi: ['सोमवार 22 जुलाई'] },
    tells: [
      {
        kind: 'weekday',
        explain: {
          en: '22 July 1947 was a Tuesday. Count back from Friday 15 August: 8 August, 1 August and 25 July are Fridays, so 22 July is a Tuesday.',
          hi: '22 जुलाई 1947 मंगलवार था। शुक्रवार 15 अगस्त से पीछे गिनिए: 8 अगस्त, 1 अगस्त और 25 जुलाई शुक्रवार हैं, तो 22 जुलाई मंगलवार हुआ।',
        },
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
      en: "Desk note. London 'Received' stamps can show an earlier hour than our sending time. They are London times, and London's clock is behind ours. Do not query them.",
      hi: "मेज़ का नोट। लंदन की 'Received' मुहर पर कभी-कभी हमारे भेजने के समय से पहले का समय होता है। वह लंदन का समय है, और लंदन की घड़ी हमसे पीछे है। इस पर सवाल न उठाएँ।",
    },
    checks: { en: ['earlier hour than our sending time'], hi: ['भेजने के समय से पहले'] },
    why: {
      text: {
        en: "A real example: Mountbatten's telegram from Karachi, sent at 8.30 pm on 13 August, is stamped 'Received: 13 August, 5.45 pm' in London.",
        hi: "एक असली मिसाल: माउंटबेटन का कराची से 13 अगस्त को रात 8.30 बजे भेजा तार लंदन में 'Received: 13 August, 5.45 pm' की मुहर के साथ दर्ज है।",
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
      en: "Desk note. London 'Received' stamps always show a later hour than our sending time, because London's clock is ahead of ours.",
      hi: "मेज़ का नोट। लंदन की 'Received' मुहर पर हमेशा हमारे भेजने के समय से बाद का समय होता है, क्योंकि लंदन की घड़ी हमसे आगे है।",
    },
    checks: { en: ["London's clock is ahead of ours"], hi: ['लंदन की घड़ी हमसे आगे'] },
    tells: [
      {
        kind: 'knowledge',
        explain: {
          en: "London is behind India, not ahead. That is why a Karachi telegram sent at 8.30 pm on 13 August was stamped 'Received: 13 August, 5.45 pm' in London.",
          hi: "लंदन भारत से पीछे है, आगे नहीं। इसीलिए 13 अगस्त को रात 8.30 बजे कराची से भेजा तार लंदन में 'Received: 13 August, 5.45 pm' की मुहर के साथ दर्ज हुआ।",
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
    from: { en: 'The Maharaja of Travancore, Palace, Trivandrum', hi: 'त्रावणकोर के महाराजा, महल, त्रिवेंद्रम' },
    to: { en: 'Viscount Mountbatten of Burma', hi: 'बर्मा के वाइकाउंट माउंटबेटन' },
    text: {
      en: "PALACE, TRIVANDRUM, 30 July 1947. Your Excellency, Your Excellency's letter of the 22nd July has been handed over to me by Sir C. P. Ramaswami Aiyar. … Having regard to the assurances conveyed by Your Excellency, I have decided, though not without hesitation, to take this step of accession to the Dominion of India subject to the conditions adverted to in your letter. … RAMA VARMA",
      hi: 'महल, त्रिवेंद्रम, 30 जुलाई 1947। हुज़ूर, आपकी 22 जुलाई की चिट्ठी मुझे सर सी.पी. रामास्वामी अय्यर ने दी है। … आपके दिए भरोसों को देखते हुए मैंने, कुछ हिचक के साथ ही सही, आपकी चिट्ठी में लिखी शर्तों पर भारत डोमिनियन में शामिल होने का यह क़दम उठाने का फ़ैसला किया है। … रामा वर्मा',
    },
    checks: { en: ['Sir C. P. Ramaswami Aiyar', 'RAMA VARMA'], hi: ['सर सी.पी. रामास्वामी अय्यर', 'रामा वर्मा'] },
    document: { sources: [{ id: 'mansergh-xii', loc: 'No. 284' }] },
    why: {
      text: {
        en: "The Maharaja signed RAMA VARMA. Sir C.P. Ramaswami Aiyar was his Dewan, who had declared Travancore 'an independent sovereign State' in June and then carried the Viceroy's letter home.",
        hi: "महाराजा ने रामा वर्मा नाम से दस्तख़त किए। सर सी.पी. रामास्वामी अय्यर उनके दीवान थे, जिन्होंने जून में त्रावणकोर को 'पूरी तरह आज़ाद रियासत' कहा था और फिर वायसराय की चिट्ठी लेकर लौटे।",
      },
      sources: [{ id: 'mansergh-xii', loc: 'No. 284' }, { id: 'menon-1956', loc: 'ch. on Travancore' }],
    },
  },
  {
    id: 'travancore-fake',
    tier: 3,
    real: false,
    pair: 'travancore',
    from: { en: 'The Maharaja of Travancore, Palace, Trivandrum', hi: 'त्रावणकोर के महाराजा, महल, त्रिवेंद्रम' },
    to: { en: 'Viscount Mountbatten of Burma', hi: 'बर्मा के वाइकाउंट माउंटबेटन' },
    text: {
      en: "PALACE, TRIVANDRUM, 30 July 1947. Your Excellency, Your Excellency's letter of the 22nd July has been handed over to me by Sir C. P. Ramaswami Aiyar. … Having regard to the assurances conveyed by Your Excellency, I have decided, though not without hesitation, to take this step of accession to the Dominion of India subject to the conditions adverted to in your letter. … C. P. RAMASWAMI AIYAR, Maharaja of Travancore",
      hi: 'महल, त्रिवेंद्रम, 30 जुलाई 1947। हुज़ूर, आपकी 22 जुलाई की चिट्ठी मुझे सर सी.पी. रामास्वामी अय्यर ने दी है। … आपके दिए भरोसों को देखते हुए मैंने, कुछ हिचक के साथ ही सही, आपकी चिट्ठी में लिखी शर्तों पर भारत डोमिनियन में शामिल होने का यह क़दम उठाने का फ़ैसला किया है। … सी.पी. रामास्वामी अय्यर, त्रावणकोर के महाराजा',
    },
    checks: { en: ['C. P. RAMASWAMI AIYAR, Maharaja of Travancore'], hi: ['सी.पी. रामास्वामी अय्यर, त्रावणकोर के महाराजा'] },
    tells: [
      {
        kind: 'name',
        explain: {
          en: 'Sir C.P. Ramaswami Aiyar was the Dewan, the chief minister, not the Maharaja. The real letter is signed RAMA VARMA, and this copy itself says the letter was handed over by Sir C.P., so he cannot also be the Maharaja receiving it.',
          hi: 'सर सी.पी. रामास्वामी अय्यर दीवान यानी मुख्य मंत्री थे, महाराजा नहीं। असली चिट्ठी पर रामा वर्मा के दस्तख़त हैं, और इसी कॉपी में लिखा है कि चिट्ठी सर सी.पी. ने दी, तो चिट्ठी पाने वाले महाराजा वे ख़ुद नहीं हो सकते।',
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
    from: { en: "Governor's Secretary, Lahore", hi: 'गवर्नर के सचिव, लाहौर' },
    to: { en: 'Private Secretary, New Delhi', hi: 'निजी सचिव, नई दिल्ली' },
    text: {
      en: 'IMMEDIATE. LAHORE, {date}. To Private Secretary, New Delhi. Your telegram received with one group [group corrupt]. Please repeat.',
      hi: 'IMMEDIATE. लाहौर, {date}। निजी सचिव, नई दिल्ली के लिए। आपका तार मिला, पर उसका एक ग्रुप [group corrupt] है। कृपया फिर से भेजें।',
    },
    checks: { en: ['[group corrupt]', 'Private Secretary, New Delhi'], hi: ['[group corrupt]', 'निजी सचिव, नई दिल्ली'] },
    why: {
      text: {
        en: "Garbled cipher groups really were marked '[group corrupt]' in that week's telegrams, and asking for a repeat was routine.",
        hi: "उस हफ़्ते के तारों में बिगड़े हुए साइफ़र ग्रुप पर सच में '[group corrupt]' लिखा जाता था, और दोबारा भेजने को कहना आम बात थी।",
      },
      sources: [{ id: 'mansergh-xii', loc: 'No. 466 (Jenkins telegram, 13 August 1947)' }],
    },
  },
  {
    id: 'house-name-fake',
    tier: 3,
    real: false,
    pair: 'house-name',
    from: { en: "Governor's Secretary, Lahore", hi: 'गवर्नर के सचिव, लाहौर' },
    to: { en: 'Private Secretary, Rashtrapati Bhavan', hi: 'निजी सचिव, राष्ट्रपति भवन' },
    text: {
      en: 'IMMEDIATE. LAHORE, {date}. To Private Secretary, Rashtrapati Bhavan, New Delhi. Your telegram received with one group [group corrupt]. Please repeat.',
      hi: 'IMMEDIATE. लाहौर, {date}। निजी सचिव, राष्ट्रपति भवन, नई दिल्ली के लिए। आपका तार मिला, पर उसका एक ग्रुप [group corrupt] है। कृपया फिर से भेजें।',
    },
    checks: { en: ['Rashtrapati Bhavan'], hi: ['राष्ट्रपति भवन'] },
    tells: [
      {
        kind: 'anachronism',
        explain: {
          en: "Nobody called it Rashtrapati Bhavan in 1947. It was the Viceroy's House, and Government House from 15 August. 'Rashtrapati' means President, and India had no President until it became a republic.",
          hi: "1947 में इसे कोई राष्ट्रपति भवन नहीं कहता था। यह वायसराय हाउस था, और 15 अगस्त से गवर्नमेंट हाउस। राष्ट्रपति तो भारत के गणतंत्र बनने के बाद ही हुए।",
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
      en: 'Desk note. Karachi telegrams need no time conversion. Karachi keeps the same clock as Delhi.',
      hi: 'मेज़ का नोट। कराची के तारों में समय बदलने की ज़रूरत नहीं। कराची की घड़ी दिल्ली जैसी ही है।',
    },
    checks: { en: ['same clock as Delhi'], hi: ['दिल्ली जैसी ही'] },
    why: {
      text: {
        en: 'It sounds wrong today, but in 1947 Delhi and Karachi both kept time 5½ hours ahead of Greenwich. Pakistan moved its clocks half an hour back only in 1951.',
        hi: 'आज यह ग़लत लगता है, पर 1947 में दिल्ली और कराची दोनों का समय ग्रीनविच से 5½ घंटे आगे था। पाकिस्तान ने अपनी घड़ियाँ आधा घंटा पीछे 1951 में ही कीं।',
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
      en: 'Desk note. Karachi keeps its clocks half an hour behind Delhi. Take 30 minutes off every Karachi time.',
      hi: 'मेज़ का नोट। कराची की घड़ियाँ दिल्ली से आधा घंटा पीछे हैं। कराची के हर समय में से 30 मिनट घटाएँ।',
    },
    checks: { en: ['half an hour behind Delhi'], hi: ['आधा घंटा पीछे'] },
    tells: [
      {
        kind: 'knowledge',
        explain: {
          en: 'Not in 1947. Delhi and Karachi were on the same clock, so midnight came at the same moment in both. Pakistan moved its clocks half an hour back only in 1951.',
          hi: '1947 में ऐसा नहीं था। दिल्ली और कराची की घड़ी एक थी, तो आधी रात दोनों जगह एक ही पल में आई। पाकिस्तान ने घड़ियाँ आधा घंटा पीछे 1951 में ही कीं।',
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
    to: { en: 'Viscount Mountbatten of Burma', hi: 'बर्मा के वाइकाउंट माउंटबेटन' },
    text: {
      en: "THE VICEROY'S HOUSE, NEW DELHI, 23 July 1947. Dear Viceroy, … I will certainly bear in mind the importance of the earliest possible date for the Award. The time schedule, as you know, has to be a fine one owing to the necessity of giving adequate time first for public hearings and then for full discussions of their differences with the judges of the two simultaneous Commissions. … CYRIL RADCLIFFE",
      hi: 'वायसराय हाउस, नई दिल्ली, 23 जुलाई 1947। प्रिय वायसराय, … फ़ैसले की जल्दी से जल्दी तारीख़ कितनी ज़रूरी है, यह मैं ज़रूर ध्यान में रखूँगा। आप जानते हैं, समय बहुत तंग है। पहले खुली सुनवाई के लिए पूरा समय देना है, फिर जजों से उनके मतभेदों पर पूरी बात करनी है, और दोनों कमीशन साथ-साथ चल रहे हैं। … सिरिल रैडक्लिफ़',
    },
    checks: { en: ["THE VICEROY'S HOUSE, NEW DELHI", 'two simultaneous Commissions'], hi: ['वायसराय हाउस, नई दिल्ली', 'साथ-साथ चल रहे'] },
    document: { sources: [{ id: 'mansergh-xii', loc: 'No. 209' }] },
    why: {
      text: {
        en: "It looks wrong, but it is real. Radcliffe lived at the Comptroller's House, which stands on the Viceregal estate, and he headed this letter 'The Viceroy's House'. The same letter goes on: 'I think that I can promise the 12th.'",
        hi: "देखने में ग़लत लगता है, पर असली है। रैडक्लिफ़ कंप्ट्रोलर हाउस में रहते थे, जो वायसराय के अहाते में ही है, और उन्होंने इस चिट्ठी के ऊपर 'वायसराय हाउस' लिखा। इसी चिट्ठी में आगे लिखा है: 'मुझे लगता है कि मैं 12 तारीख़ का वादा कर सकता हूँ।'",
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
      en: 'IMMEDIATE. BOMBAY, {date}. Astrologers have fixed the hour. Power passes at midnight because the 15th is unlucky, and His Excellency has accepted their advice.',
      hi: 'IMMEDIATE. बंबई, {date}। ज्योतिषियों ने घड़ी तय कर दी है। सत्ता आधी रात को बदलेगी क्योंकि 15 तारीख़ अशुभ है, और हिज़ एक्सेलेंसी ने उनकी सलाह मान ली है।',
    },
    checks: { en: ['Astrologers have fixed the hour'], hi: ['ज्योतिषियों ने घड़ी तय कर दी'] },
    tells: [
      {
        kind: 'knowledge',
        explain: {
          en: "No document shows astrologers setting the time. The Act fixed 15 August, and the Assembly met at 11 pm so it could take power at midnight. The only 'astrology' item in the Viceroy's minutes, on 7 August, was about a Governor-designate's travel date, not the transfer of power. The story that astrologers chose midnight was made popular by a 1975 book.",
          hi: "किसी दस्तावेज़ में नहीं है कि ज्योतिषियों ने समय तय किया। 15 अगस्त क़ानून ने तय किया था, और सभा रात 11 बजे इसलिए बैठी कि आधी रात को सत्ता ले सके। वायसराय के रिकॉर्ड में 'ज्योतिष' वाली अकेली बात 7 अगस्त की है, और वह एक होने वाले गवर्नर के सफ़र की तारीख़ के बारे में थी, सत्ता सौंपने के बारे में नहीं। ज्योतिषियों के आधी रात चुनने की कहानी 1975 की एक किताब से मशहूर हुई।",
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
      en: "IMMEDIATE. MADRAS, {date}. Pandit Nehru will make his 'tryst with destiny' speech from the Red Fort on the morning of 15 August.",
      hi: "IMMEDIATE. मद्रास, {date}। पंडित नेहरू 15 अगस्त की सुबह लाल क़िले से अपना 'ट्रिस्ट विद डेस्टिनी' वाला भाषण देंगे।",
    },
    checks: { en: ['from the Red Fort on the morning of 15 August'], hi: ['लाल क़िले से'] },
    tells: [
      {
        kind: 'knowledge',
        explain: {
          en: "Nehru spoke of the 'tryst with destiny' in the Constituent Assembly at the Council House, late on 14 August, before midnight. The flag went up over the Red Fort on 16 August.",
          hi: "नेहरू ने 'ट्रिस्ट विद डेस्टिनी' वाली बात 14 अगस्त की देर रात, आधी रात से पहले, काउंसिल हाउस में संविधान सभा में कही थी। लाल क़िले पर झंडा 16 अगस्त को चढ़ा।",
        },
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
      en: 'Note. Covers for the Provinces go by inland post at 10 paise a letter. Please send the stamps with the covers.',
      hi: 'नोट। सूबों को जाने वाले लिफ़ाफ़े देश के अंदर की डाक से जाएँगे, 10 नए पैसे की एक चिट्ठी। लिफ़ाफ़ों के साथ टिकट भी भेजें।',
    },
    checks: { en: ['10 paise a letter'], hi: ['10 नए पैसे'] },
    tells: [
      {
        kind: 'anachronism',
        explain: {
          en: 'There were no decimal paise in 1947. A rupee was 16 annas, or 64 pice, or 192 pies, and on 15 August 1947 an inland letter cost 1½ annas. Decimal naye paise came on 1 April 1957.',
          hi: '1947 में दशमलव वाले नए पैसे नहीं थे। एक रुपये में 16 आने, 64 पैसे या 192 पाई होती थीं, और 15 अगस्त 1947 को देश के अंदर एक चिट्ठी 1½ आने की थी। नए पैसे 1 अप्रैल 1957 को आए।',
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
      en: 'MOST IMMEDIATE. CALCUTTA, {date}. Award settled: Murshidabad and the whole of Nadia go to East Bengal, and Khulna stays with West Bengal.',
      hi: 'MOST IMMEDIATE. कलकत्ता, {date}। फ़ैसला तय: मुर्शिदाबाद और पूरा नदिया पूर्वी बंगाल को, और खुलना पश्चिमी बंगाल के साथ रहेगा।',
    },
    checks: { en: ['Murshidabad and the whole of Nadia go to East Bengal'], hi: ['मुर्शिदाबाद और पूरा नदिया'] },
    tells: [
      {
        kind: 'knowledge',
        explain: {
          en: "The real Bengal award did nearly the opposite: Murshidabad went to West Bengal, Nadia was split, and Khulna went to East Bengal. The rumour just repeats the Act's notional lines as if they were the award.",
          hi: 'असली बंगाल फ़ैसला लगभग उलटा था: मुर्शिदाबाद पश्चिमी बंगाल को मिला, नदिया बँट गया, और खुलना पूर्वी बंगाल को गया। यह अफ़वाह बस क़ानून के कामचलाऊ बँटवारे को फ़ैसला बताकर दोहरा रही है।',
        },
        sources: [{ id: 'menon-1957', loc: 'ch. XVII' }],
      },
    ],
  },
]
