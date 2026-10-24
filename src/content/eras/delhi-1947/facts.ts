import type { Fact } from '../../types.js'

// The case file. hardHidden lines are blank in Hard: a history buff knows them.
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
    hardHidden: true,
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
    hardHidden: true,
  },
  {
    id: 'jinnah',
    para: 2,
    label: { en: 'Mr Jinnah', hi: 'मिस्टर जिन्ना' },
    value: { en: 'Karachi from 7 Aug; Governor-General 15th', hi: '7 अगस्त से कराची; 15 को गवर्नर-जनरल' },
    story: {
      en: 'Mr Jinnah is in [[Karachi]] from [[7 August]]; he becomes [[Governor-General]] on the [[15th]].',
      hi: 'मिस्टर जिन्ना [[7 अगस्त]] से [[कराची]] में हैं; [[15]] को वे [[गवर्नर-जनरल]] बनते हैं।',
    },
    sources: [{ id: 'menon-1957', loc: 'ch. XVIII' }],
  },
  {
    id: 'gandhi',
    para: 2,
    label: { en: 'Gandhiji', hi: 'गांधीजी' },
    value: { en: 'Calcutta from 9 Aug; fasts 15th', hi: '9 अगस्त से कलकत्ता; 15 को उपवास' },
    story: {
      en: 'Gandhiji is in [[Calcutta]] from [[9 August]], and on the [[15th]] he [[fasts]].',
      hi: 'गांधीजी [[9 अगस्त]] से [[कलकत्ता]] में हैं, और [[15]] को [[उपवास]] रखते हैं।',
    },
    sources: [{ id: 'cwmg-89', loc: 'Introduction; documents for 9–15 August 1947' }],
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
