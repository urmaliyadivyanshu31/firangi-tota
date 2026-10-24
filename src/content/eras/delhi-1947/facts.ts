import type { Fact } from '../../types.js'

// The case file. Every line is readable in every mode it is in (owner 10-24: every check is in the file).
// It grows with the mode (owner 10-24): lines with minMode 'medium' join in Medium and Hard, 'hard' in
// Hard only. Easy keeps the ten lines without a minMode.
// Each line backs at least one forgery's slip (see messages.ts). In story order: the days of freedom
// (para 1), who is where (para 2), the secret on every desk, Radcliffe's awards (para 3). Each story
// says its value and nothing more; the checkable words sit in [[ ]].
export const facts: Fact[] = [
  {
    id: 'appointed-day',
    para: 1,
    label: { en: 'Freedom day', hi: 'आज़ादी का दिन' },
    value: { en: 'Friday 15 Aug; Act 18 July', hi: 'शुक्रवार 15 अगस्त; क़ानून 18 जुलाई' },
    story: {
      en: 'Freedom comes on [[Friday 15 August]], by an [[Act]] that became law on [[18 July]].',
      hi: 'आज़ादी [[शुक्रवार 15 अगस्त]] को आती है, उस [[क़ानून]] से जो [[18 जुलाई]] को बना।',
    },
    sources: [
      { id: 'menon-1957', loc: 'ch. XVII' },
      { id: 'mansergh-xii', loc: 'Introduction' },
    ],
  },
  {
    id: 'session',
    para: 1,
    label: { en: 'Midnight session', hi: 'आधी रात की बैठक' },
    value: { en: '14 Aug, 11 pm; Prasad presides', hi: '14 अगस्त, रात 11 बजे; अध्यक्ष प्रसाद' },
    story: {
      en: 'The midnight session opens on [[14 August]] at [[11 pm]], with [[Prasad]] presiding.',
      hi: 'आधी रात की बैठक [[14 अगस्त]] को [[रात 11 बजे]] शुरू होती है; अध्यक्ष हैं [[प्रसाद]]।',
    },
    sources: [{ id: 'cad-14aug1947' }],
  },
  {
    id: 'tryst',
    para: 1,
    label: { en: "Nehru's speech", hi: 'नेहरू का भाषण' },
    value: { en: 'Assembly, late on 14 August', hi: 'संविधान सभा, 14 अगस्त देर रात' },
    story: {
      en: 'Nehru gives his speech in the [[Assembly]], [[late on 14 August]].',
      hi: 'नेहरू का भाषण [[संविधान सभा]] में, [[14 अगस्त देर रात]] होता है।',
    },
    sources: [{ id: 'cad-14aug1947' }],
  },
  {
    id: 'delhi-flags',
    para: 1,
    label: { en: 'Red Fort flag', hi: 'लाल क़िले का झंडा' },
    value: { en: 'Very early, Saturday 16 August', hi: 'शनिवार 16 अगस्त, बहुत सुबह' },
    story: {
      en: 'The flag goes up at the Red Fort [[very early]] on [[Saturday 16 August]].',
      hi: 'लाल क़िले पर झंडा [[शनिवार 16 अगस्त]] को [[बहुत सुबह]] फहराया जाता है।',
    },
    sources: [{ id: 'campbell-johnson-1951', loc: 'entries for 15 and 16 August 1947' }],
  },
  {
    id: 'delhi-programme',
    minMode: 'medium',
    para: 1,
    label: { en: 'Delhi, 15 August', hi: 'दिल्ली, 15 अगस्त' },
    value: { en: 'Oath 8.30 am; Princes Park evening', hi: 'शपथ सुबह 8.30; शाम प्रिंसेस पार्क' },
    story: {
      en: 'On the 15th the oath is at [[8.30 am]], and the flag goes up in [[Princes Park]] in the [[evening]].',
      hi: '15 तारीख़ को शपथ [[सुबह 8.30]] बजे होती है, और [[शाम]] को [[प्रिंसेस पार्क]] में झंडा फहराया जाता है।',
    },
    sources: [{ id: 'campbell-johnson-1951', loc: 'entry for 15 August 1947' }],
  },
  {
    id: 'oath',
    minMode: 'hard',
    para: 1,
    label: { en: 'The oath', hi: 'शपथ' },
    value: { en: 'Durbar Hall; Justice Kania', hi: 'दरबार हॉल; जस्टिस कानिया' },
    story: {
      en: 'In the [[Durbar Hall]], the oath is given by [[Justice Kania]].',
      hi: '[[दरबार हॉल]] में शपथ [[जस्टिस कानिया]] दिलाते हैं।',
    },
    sources: [{ id: 'campbell-johnson-1951', loc: 'entry for 15 August 1947' }],
  },
  {
    id: 'princes-park',
    minMode: 'hard',
    para: 1,
    label: { en: 'Princes Park crowd', hi: 'प्रिंसेस पार्क की भीड़' },
    value: { en: '30,000 planned; nearly 300,000 came', hi: '30,000 का इंतज़ाम; करीब तीन लाख आए' },
    story: {
      en: 'Princes Park was planned for [[30,000]], but [[nearly 300,000]] came.',
      hi: 'प्रिंसेस पार्क में [[30,000]] लोगों का इंतज़ाम था, पर [[करीब तीन लाख]] आए।',
    },
    sources: [{ id: 'campbell-johnson-1951', loc: 'entry for 15 August 1947' }],
  },
  {
    id: 'tricolour',
    minMode: 'medium',
    para: 1,
    label: { en: 'The new flag', hi: 'नया झंडा' },
    value: { en: "Asoka's wheel, navy blue", hi: 'अशोक का चक्र, गहरा नीला' },
    story: {
      en: "At its centre the flag carries [[Asoka's wheel]], in [[navy blue]].",
      hi: 'झंडे के बीच में [[अशोक का चक्र]] है, [[गहरे नीले]] रंग में।',
    },
    sources: [{ id: 'cad-22jul1947' }],
  },
  {
    id: 'jinnah',
    para: 2,
    label: { en: 'Mr Jinnah', hi: 'मिस्टर जिन्ना' },
    value: { en: "Karachi 7 Aug; Pakistan's Governor-General 15th", hi: '7 अगस्त से कराची; 15 को पाकिस्तान के गवर्नर-जनरल' },
    story: {
      en: 'Mr Jinnah is in [[Karachi]] from [[7 August]]; on the [[15th]] he becomes [[Governor-General]] of [[Pakistan]].',
      hi: 'मिस्टर जिन्ना [[7 अगस्त]] से [[कराची]] में हैं; [[15]] को वे [[पाकिस्तान]] के [[गवर्नर-जनरल]] बनते हैं।',
    },
    sources: [{ id: 'menon-1957', loc: 'ch. XVIII' }],
  },
  {
    id: 'karachi-trip',
    minMode: 'medium',
    para: 2,
    label: { en: 'Viceroy to Karachi', hi: 'वायसराय कराची में' },
    value: { en: 'In Karachi 13th–14th morning; then Delhi', hi: '13 से 14 की सुबह तक कराची; फिर दिल्ली' },
    story: {
      en: 'The Viceroy flies to [[Karachi]] on the [[13th]], speaks there on the [[14th]] [[morning]], then returns to [[Delhi]] that day.',
      hi: 'वायसराय [[13]] को [[कराची]] जाते हैं, [[14]] की [[सुबह]] वहाँ बोलते हैं, और उसी दिन [[दिल्ली]] लौट आते हैं।',
    },
    sources: [
      { id: 'campbell-johnson-1951', loc: 'entries for 13 and 14–15 August 1947' },
      { id: 'capd-1947', loc: 'No. 4, Thursday 14 August 1947' },
    ],
  },
  {
    id: 'karachi-time',
    minMode: 'hard',
    para: 2,
    label: { en: 'Karachi clocks', hi: 'कराची की घड़ी' },
    value: { en: 'Same time as Delhi', hi: 'दिल्ली वाला ही समय' },
    story: {
      en: 'Karachi keeps the [[same time]] as [[Delhi]].',
      hi: 'कराची में भी [[दिल्ली वाला ही समय]] चलता है।',
    },
    sources: [{ id: 'iana-tz', loc: 'Zone Asia/Karachi: +5:30 until 30 September 1951' }],
  },
  {
    id: 'gandhi',
    para: 2,
    label: { en: 'Gandhiji', hi: 'गांधीजी' },
    value: { en: 'Calcutta from 9 Aug; fasts 15th', hi: '9 अगस्त से कलकत्ता; 15 को वहीं उपवास' },
    story: {
      en: 'Gandhiji is in [[Calcutta]] from [[9 August]], and stays there to [[fast]] on the [[15th]].',
      hi: 'गांधीजी [[9 अगस्त]] से [[कलकत्ता]] में हैं, और [[15]] को वहीं रहकर [[उपवास]] रखते हैं।',
    },
    sources: [{ id: 'cwmg-89', loc: 'Introduction; documents for 9–15 August 1947' }],
  },
  {
    id: 'beliaghata',
    minMode: 'medium',
    para: 2,
    label: { en: "Gandhiji's house", hi: 'गांधीजी का घर' },
    value: { en: 'Beliaghata, with Suhrawardy, from 13th', hi: '13 से बेलियाघाटा, सुहरावर्दी के साथ' },
    story: {
      en: 'From the [[13th]], Gandhiji lives in [[Beliaghata]] with [[Suhrawardy]].',
      hi: '[[13]] से गांधीजी [[बेलियाघाटा]] में [[सुहरावर्दी]] के साथ रहते हैं।',
    },
    sources: [{ id: 'cwmg-89', loc: 'Chronology, p. 528 (11 and 13 August 1947); Introduction' }],
  },
  {
    id: 'states',
    para: 2,
    label: { en: 'Princely states', hi: 'रियासतें' },
    value: { en: 'Patel, Minister; V.P. Menon, Secretary', hi: 'पटेल मंत्री; वी.पी. मेनन सचिव' },
    story: {
      en: 'For the princely states, [[Patel]] is the [[Minister]] and [[V.P. Menon]] his [[Secretary]].',
      hi: 'रियासतों का काम: [[पटेल]] [[मंत्री]] हैं, और [[वी.पी. मेनन]] उनके [[सचिव]]।',
    },
    sources: [{ id: 'menon-1956', loc: 'ch. V, Stopping the Gap' }],
  },
  {
    id: 'boundary-force',
    para: 2,
    label: { en: 'Boundary Force', hi: 'बाउंड्री फ़ोर्स' },
    value: { en: 'Maj-Gen Rees; about 50,000 men', hi: 'मेजर-जनरल रीस; करीब 50,000 जवान' },
    story: {
      en: 'The Boundary Force, under [[Major-General Rees]], has [[about 50,000 men]].',
      hi: 'बाउंड्री फ़ोर्स के मुखिया [[मेजर-जनरल रीस]] हैं, और उसमें [[करीब 50,000 जवान]] हैं।',
    },
    sources: [{ id: 'menon-1957', loc: 'ch. XVIII' }],
  },
  {
    id: 'bombay',
    minMode: 'hard',
    para: 2,
    label: { en: 'First troops home', hi: 'पहले फ़ौजी घर' },
    value: { en: 'Bombay 17th; Norfolks on the Georgic', hi: '17 को बंबई; नॉरफ़ॉक जवान, जहाज़ जॉर्जिक' },
    story: {
      en: 'On the [[17th]] in [[Bombay]], the [[Norfolks]] sail home on the troopship [[Georgic]].',
      hi: '[[17]] को [[बंबई]] से [[नॉरफ़ॉक]] के जवान [[जॉर्जिक]] जहाज़ से घर लौटते हैं।',
    },
    sources: [
      { id: 'campbell-johnson-1951', loc: 'entry for 17 August 1947, Bombay' },
      { id: 'mansergh-xii', loc: 'No. 113, para 6 (first contingent on the Georgic, 17 August)' },
    ],
  },
  {
    id: 'radcliffe',
    para: 3,
    label: { en: 'Sir Cyril Radcliffe', hi: 'सर सिरिल रैडक्लिफ़' },
    value: { en: 'Landed 8 July; first India visit', hi: '8 जुलाई को आए; पहली बार भारत' },
    story: {
      en: 'Sir Cyril Radcliffe landed on [[8 July]], on his [[first]] visit to [[India]].',
      hi: 'सर सिरिल रैडक्लिफ़ [[8 जुलाई]] को [[पहली बार भारत]] आए।',
    },
    sources: [
      { id: 'mansergh-xii', loc: 'Introduction' },
      { id: 'chester-2002' },
    ],
  },
  {
    id: 'radcliffe-house',
    minMode: 'hard',
    para: 3,
    label: { en: "Radcliffe's desk", hi: 'रैडक्लिफ़ की मेज़' },
    value: { en: "Comptroller's House, Viceregal estate", hi: 'कंट्रोलर्स हाउस, वायसराय का अहाता' },
    story: {
      en: "He works alone at the [[Comptroller's House]], on the [[Viceregal estate]].",
      hi: 'वे [[कंट्रोलर्स हाउस]] में अकेले काम करते हैं, [[वायसराय के अहाते]] में।',
    },
    sources: [{ id: 'campbell-johnson-1951', loc: 'entry for 12 August 1947' }],
  },
  {
    id: 'sittings',
    minMode: 'medium',
    para: 3,
    label: { en: 'Public sittings', hi: 'खुली सुनवाई' },
    value: { en: 'Calcutta 16–24 July; Lahore 21–31 July', hi: 'कलकत्ता 16–24 जुलाई; लाहौर 21–31 जुलाई' },
    story: {
      en: 'The commissions sat in public in [[Calcutta]] from [[16 to 24 July]], and in [[Lahore]] from [[21 to 31 July]].',
      hi: 'कमीशनों की खुली सुनवाई [[कलकत्ता]] में [[16 से 24 जुलाई]] और [[लाहौर]] में [[21 से 31 जुलाई]] तक हुई।',
    },
    sources: [{ id: 'mansergh-xii', loc: 'No. 488, Appendix I, para 5; Appendix II, para 5' }],
  },
  {
    id: 'punjab-judges',
    minMode: 'hard',
    para: 3,
    label: { en: 'Punjab judges', hi: 'पंजाब के जज' },
    value: { en: 'Mahajan, Teja Singh, Din Muhammad, Munir', hi: 'महाजन, तेजा सिंह, दीन मुहम्मद, मुनीर' },
    story: {
      en: 'On the Punjab commission sit [[Mahajan]], [[Teja Singh]], [[Din Muhammad]] and [[Munir]].',
      hi: 'पंजाब कमीशन में [[महाजन]], [[तेजा सिंह]], [[दीन मुहम्मद]] और [[मुनीर]] बैठते हैं।',
    },
    sources: [{ id: 'mansergh-xii', loc: 'No. 488, Appendix I, para 2' }],
  },
  {
    id: 'gazette-form',
    minMode: 'medium',
    para: 3,
    label: { en: 'Award notice', hi: 'फ़ैसले का ऐलान' },
    value: { en: 'Gazette Extraordinary, not a communiqué', hi: 'गज़ट का ख़ास अंक, प्रेस नोट नहीं' },
    story: {
      en: 'The award will appear as a [[Gazette Extraordinary]], [[not a communiqué]].',
      hi: 'फ़ैसला [[गज़ट के ख़ास अंक]] में छपेगा, [[प्रेस नोट में नहीं]]।',
    },
    sources: [{ id: 'campbell-johnson-1951', loc: 'entry for 9 August 1947' }],
  },
  {
    // Signed on the 12th, Sylhet's dated the 13th (see d4-abell-signed, d8-awards-all-three).
    id: 'awards',
    para: 3,
    label: { en: 'Awards, August 1947', hi: 'फ़ैसले, अगस्त 1947' },
    value: { en: '12th; Sylhet 13th; published Sunday 17th', hi: '12 को; सिलहट 13 को; रविवार 17 को छपे' },
    story: {
      en: "Radcliffe's awards are signed on the [[12th]], [[Sylhet]]'s on the [[13th]], and published on [[Sunday the 17th]].",
      hi: 'रैडक्लिफ़ के फ़ैसलों पर [[12]] को दस्तख़त होते हैं, [[सिलहट]] वाले पर [[13]] को, और वे [[रविवार 17]] को छपते हैं।',
    },
    sources: [
      { id: 'mansergh-xii', loc: 'No. 488; No. 489 (Personal Report No. 17)' },
      { id: 'campbell-johnson-1951', loc: 'entry for 16 August 1947' },
      { id: 'chester-2002' },
    ],
  },
]
