import type { Fact } from '../../types'

// The case file. hardHidden lines are blank in Hard: a history buff knows them.
export const facts: Fact[] = [
  {
    id: 'appointed-day',
    label: { en: 'Appointed day', hi: 'तय दिन' },
    value: { en: '15 Aug, Friday. Assent: 18 July', hi: '15 अगस्त, शुक्रवार। राजा की मंज़ूरी: 18 जुलाई' },
    sources: [
      { id: 'menon-1957', loc: 'ch. XVII' },
      { id: 'mansergh-xii', loc: 'Introduction' },
    ],
  },
  {
    id: 'titles',
    label: { en: "Mountbatten's style", hi: 'माउंटबेटन का ओहदा' },
    value: { en: 'Viscount; not Viceroy after 14 Aug', hi: 'वाइकाउंट; 14 अगस्त के बाद वायसराय नहीं' },
    sources: [
      { id: 'mansergh-xii', loc: 'No. 300 and note' },
      { id: 'cad-14aug1947', loc: 'intimation to the Viceroy' },
      { id: 'campbell-johnson-1951', loc: 'entry for 15 August 1947' },
    ],
    hardHidden: true,
  },
  {
    id: 'radcliffe',
    label: { en: 'Sir Cyril Radcliffe', hi: 'सर सिरिल रैडक्लिफ़' },
    value: { en: 'Arrived 8 July; secretary Christopher Beaumont', hi: '8 जुलाई को आए; सचिव क्रिस्टोफ़र बोमॉन्ट' },
    sources: [
      { id: 'mansergh-xii', loc: 'Introduction; No. 377' },
      { id: 'campbell-johnson-1951', loc: 'July–August 1947 entries' },
      { id: 'chester-2002' },
    ],
  },
  {
    id: 'members',
    label: { en: 'Commission judges', hi: 'कमीशन के जज' },
    value: { en: 'Teja Singh: Punjab. C.C. Biswas: Bengal', hi: 'तेजा सिंह: पंजाब। सी.सी. बिस्वास: बंगाल' },
    sources: [{ id: 'mansergh-xii', loc: 'No. 488, Appendices I and II' }],
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
    id: 'notional',
    label: { en: 'First Schedule', hi: 'पहली सूची' },
    value: { en: 'East Bengal: Murshidabad, Nadia, Malda', hi: 'पूर्वी बंगाल: मुर्शिदाबाद, नदिया, मालदा' },
    sources: [{ id: 'menon-1957', loc: 'Appendix XI: Indian Independence Act, First and Second Schedules' }],
  },
  {
    id: 'session',
    label: { en: 'Midnight session', hi: 'आधी रात की बैठक' },
    value: { en: '11 pm; Prasad, Assembly President, presides', hi: 'रात 11 बजे; संविधान सभा के अध्यक्ष प्रसाद' },
    sources: [{ id: 'cad-14aug1947' }],
  },
  {
    id: 'staff',
    label: { en: "Who's who", hi: 'कौन क्या' },
    value: { en: "Abell: Viceroy's secretary. Rees: ~50,000 troops", hi: 'एबेल: वायसराय के सचिव। रीस: करीब 50,000 फ़ौजी' },
    sources: [
      { id: 'mansergh-xii', loc: 'Nos. 377, 391' },
      { id: 'menon-1957', loc: 'ch. XVIII' },
    ],
  },
  {
    id: 'delhi-flags',
    label: { en: 'Red Fort flag', hi: 'लाल क़िले का झंडा' },
    value: { en: 'Very early, Saturday 16 August', hi: 'शनिवार 16 अगस्त, बहुत सुबह' },
    sources: [{ id: 'campbell-johnson-1951', loc: 'entries for 15 and 16 August 1947' }],
    hardHidden: true,
  },
  {
    id: 'clock',
    label: { en: 'Clocks', hi: 'घड़ियाँ' },
    value: { en: 'Karachi on Delhi time; London behind', hi: 'कराची का समय दिल्ली वाला; लंदन पीछे' },
    sources: [
      { id: 'iana-tz', loc: 'Zones Asia/Karachi and Asia/Kolkata' },
      { id: 'mansergh-xii', loc: 'No. 462 (Karachi 8.30 pm, received in London 5.45 pm)' },
    ],
    hardHidden: true,
  },
]
