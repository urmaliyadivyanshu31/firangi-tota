import type { Fact } from '../../types.js'

// The case file. hardHidden lines are blank in Hard: a history buff knows them.
// Each line backs at least one forgery's slip (see messages.ts).
export const facts: Fact[] = [
  {
    id: 'appointed-day',
    label: { en: 'Freedom day', hi: 'आज़ादी का दिन' },
    value: { en: 'Friday 15 Aug; Act 18 July', hi: 'शुक्रवार 15 अगस्त; क़ानून 18 जुलाई' },
    sources: [
      { id: 'menon-1957', loc: 'ch. XVII' },
      { id: 'mansergh-xii', loc: 'Introduction' },
    ],
  },
  {
    id: 'radcliffe',
    label: { en: 'Sir Cyril Radcliffe', hi: 'सर सिरिल रैडक्लिफ़' },
    value: { en: 'Landed 8 July; first India visit', hi: '8 जुलाई को आए; पहली बार भारत' },
    sources: [
      { id: 'mansergh-xii', loc: 'Introduction' },
      { id: 'chester-2002' },
    ],
  },
  {
    id: 'awards',
    label: { en: 'Awards, August 1947', hi: 'फ़ैसले, अगस्त 1947' },
    value: { en: '12th; Sylhet 13th; published Sunday 17th', hi: '12 को; सिलहट 13 को; रविवार 17 को छपे' },
    sources: [
      { id: 'mansergh-xii', loc: 'No. 488; No. 489 (Personal Report No. 17)' },
      { id: 'campbell-johnson-1951', loc: 'entry for 16 August 1947' },
      { id: 'chester-2002' },
    ],
  },
  {
    id: 'session',
    label: { en: 'Midnight session', hi: 'आधी रात की बैठक' },
    value: { en: '14 Aug, 11 pm; Prasad presides', hi: '14 अगस्त, रात 11 बजे; अध्यक्ष प्रसाद' },
    sources: [{ id: 'cad-14aug1947' }],
  },
  {
    id: 'jinnah',
    label: { en: 'Mr Jinnah', hi: 'मिस्टर जिन्ना' },
    value: { en: 'Karachi from 7 Aug; Governor-General 15th', hi: '7 अगस्त से कराची; 15 को गवर्नर-जनरल' },
    sources: [{ id: 'menon-1957', loc: 'ch. XVIII' }],
  },
  {
    id: 'gandhi',
    label: { en: 'Gandhiji', hi: 'गांधीजी' },
    value: { en: 'Calcutta from 9 Aug; fasts 15th', hi: '9 अगस्त से कलकत्ता; 15 को उपवास' },
    sources: [{ id: 'cwmg-89', loc: 'Introduction; documents for 9–15 August 1947' }],
  },
  {
    id: 'states',
    label: { en: 'Princely states', hi: 'रियासतें' },
    value: { en: 'Patel, Minister; V.P. Menon, Secretary', hi: 'पटेल मंत्री; वी.पी. मेनन सचिव' },
    sources: [{ id: 'menon-1956', loc: 'ch. V, Stopping the Gap' }],
  },
  {
    id: 'boundary-force',
    label: { en: 'Boundary Force', hi: 'बाउंड्री फ़ोर्स' },
    value: { en: 'Maj-Gen Rees; about 50,000 men', hi: 'मेजर-जनरल रीस; करीब 50,000 जवान' },
    sources: [{ id: 'menon-1957', loc: 'ch. XVIII' }],
  },
  {
    id: 'delhi-flags',
    label: { en: 'Red Fort flag', hi: 'लाल क़िले का झंडा' },
    value: { en: 'Very early, Saturday 16 August', hi: 'शनिवार 16 अगस्त, बहुत सुबह' },
    sources: [{ id: 'campbell-johnson-1951', loc: 'entries for 15 and 16 August 1947' }],
    hardHidden: true,
  },
  {
    id: 'tryst',
    label: { en: "Nehru's speech", hi: 'नेहरू का भाषण' },
    value: { en: 'Assembly, late on 14 August', hi: 'संविधान सभा, 14 अगस्त देर रात' },
    sources: [{ id: 'cad-14aug1947' }],
    hardHidden: true,
  },
]
