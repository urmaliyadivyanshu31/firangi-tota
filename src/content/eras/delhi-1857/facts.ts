import type { Fact } from '../../types.js'
import { fanshawe, jl, mh, sen, trial, yule, CHUNI_17, CHUNI_18 } from './sources.js'

// The case file, in story order: the court and how the rising came (para 1), the city and its money
// (para 2), what lies ahead (para 3). Each story says its value and nothing more; the checkable words
// sit in [[ ]]. Two lines are hardHidden (their highlights are blank in Hard mode).
// The calendar now lives in the weekdays rule, and the titles (Canning, Governor-General) in the
// english-titles rule.
export const facts: Fact[] = [
  {
    // Suraj-u-din is how Jiwan Lal's copy of the coin reads (the genuine coins message quotes it).
    id: 'court',
    para: 1,
    label: { en: 'The King', hi: 'बादशाह' },
    value: { en: 'Bahadur Shah Zafar; coins: Siraj-ud-din (Suraj-u-din)', hi: 'बहादुर शाह ज़फ़र; सिक्कों पर: सिराजुद्दीन' },
    story: {
      en: 'You serve [[Bahadur Shah Zafar]]; his coins name him [[Siraj-ud-din]], also spelt [[Suraj-u-din]].',
      hi: 'आप [[बहादुर शाह ज़फ़र]] की सेवा में हैं; उनके सिक्कों पर उनका नाम [[सिराजुद्दीन]] लिखा है।',
    },
    sources: [jl('pp.96-97'), mh('p.59'), sen('p.95')],
  },
  {
    id: 'commanders',
    para: 1,
    label: { en: 'Commander-in-Chief', hi: 'कमांडर-इन-चीफ़' },
    value: { en: 'Mirza Mughal, from 18 May', hi: 'मिर्ज़ा मुग़ल, 18 मई से' },
    story: {
      en: 'From [[18 May]], the Commander-in-Chief is [[Mirza Mughal]].',
      hi: '[[18 मई]] से कमांडर-इन-चीफ़ हैं [[मिर्ज़ा मुग़ल]]।',
    },
    sources: [jl('p.96'), trial(CHUNI_18)],
  },
  {
    id: 'regiments',
    para: 1,
    label: { en: 'Regiments', hi: 'पलटनें' },
    value: { en: '3rd Cavalry; Infantry 11/20/38/54/74', hi: 'तीसरी घुड़सवार; पैदल 11/20/38/54/74' },
    story: {
      en: "The sepoys' regiments are the [[3rd Cavalry]], on horse, and the [[11th, 20th, 38th, 54th and 74th Infantry]], on foot.",
      hi: 'सिपाहियों की पलटनें ये हैं: घोड़ों पर [[तीसरी घुड़सवार]], और पैदल [[11वीं, 20वीं, 38वीं, 54वीं और 74वीं]]।',
    },
    sources: [sen('pp.59-62'), mh('p.53')],
  },
  {
    // Meerut rose on the evening of Sunday 10 May (Sen pp.58-60); the riders reached Delhi on the
    // morning of 11 May (Sen p.70; JL pp.75-79).
    id: 'meerut',
    para: 1,
    label: { en: 'Meerut rising', hi: 'मेरठ की बग़ावत' },
    value: { en: 'Sunday 10 May; Delhi, 11 May', hi: 'रविवार 10 मई; दिल्ली, 11 मई' },
    story: {
      en: 'The rising began at Meerut on [[Sunday 10 May]] and reached [[Delhi]] on [[11 May]].',
      hi: 'बग़ावत [[रविवार 10 मई]] को मेरठ में शुरू हुई और [[11 मई]] को [[दिल्ली]] पहुँची।',
    },
    sources: [sen('pp.57-60'), sen('p.70'), jl('pp.75-79')],
  },
  {
    id: 'lahore-gates',
    para: 2,
    label: { en: 'Lahore Gates', hi: 'लाहौरी दरवाज़े' },
    value: { en: "Two: city's (west), Fort's (east)", hi: 'दो: शहर का (पश्चिम), क़िले का (पूरब)' },
    story: {
      en: "Delhi has [[two]] Lahore Gates: the [[city's]] to the [[west]], the [[Fort's]] to the [[east]].",
      hi: 'दिल्ली में [[दो]] लाहौरी दरवाज़े हैं: [[शहर का पश्चिम में]], और [[क़िले का पूरब में]]।',
    },
    sources: [fanshawe('pp.5-6'), fanshawe('p.53'), mh('p.61')],
  },
  {
    id: 'ballabhgarh-road',
    para: 2,
    label: { en: 'Ballabhgarh road', hi: 'बल्लभगढ़ की सड़क' },
    value: { en: 'Enters at the Delhi Gate (south)', hi: 'दक्षिण के दिल्ली दरवाज़े पर' },
    story: {
      en: 'The road from Ballabhgarh enters at the [[Delhi Gate]], in the [[south]].',
      hi: 'बल्लभगढ़ की सड़क [[दक्षिण]] के [[दिल्ली दरवाज़े]] से शहर में आती है।',
    },
    sources: [trial('Petition No. 63, 22 May 1857, p.33'), fanshawe('pp.5-6')],
  },
  {
    id: 'money',
    para: 2,
    label: { en: 'Money', hi: 'पैसा' },
    value: { en: '16 annas make one rupee', hi: '16 आने का एक रुपया' },
    story: {
      en: 'Count money with care: [[16 annas]] make [[one rupee]].',
      hi: 'पैसे ध्यान से गिनिए: [[16 आने]] का [[एक रुपया]] होता है।',
    },
    sources: [yule('s.v. Anna, p.31'), yule('s.v. Pice'), yule('s.v. Mohur, Gold, pp.573-74')],
  },
  {
    // MH p.60: the King's orders promised these sums to regiments that came over (see pay-real).
    id: 'pay',
    para: 2,
    label: { en: 'Pay promised', hi: 'वादे की तनख़्वाह' },
    value: { en: 'Foot soldier Rs 30, horseman 50', hi: 'पैदल 30 रुपये, सवार 50 रुपये' },
    story: {
      en: 'Any regiment that joins is promised [[30 rupees]] for each [[foot soldier]] and [[50]] for each [[horseman]].',
      hi: 'आ मिलने वाली पलटनों से वादा है: हर [[पैदल]] सिपाही को [[30 रुपये]], हर [[सवार]] को [[50 रुपये]]।',
    },
    sources: [mh('p.60')],
  },
  {
    id: 'english-force',
    para: 3,
    hardHidden: true,
    label: { en: 'English army', hi: 'अंग्रेज़ी फ़ौज' },
    value: { en: 'Takes the Ridge on 8 June', hi: 'रिज पर 8 जून को क़ब्ज़ा' },
    story: {
      en: 'Ahead, the English army takes the [[Ridge]] on [[8 June]].',
      hi: 'आगे, अंग्रेज़ी फ़ौज [[8 जून]] को [[रिज]] पर क़ब्ज़ा करती है।',
    },
    sources: [sen('p.79'), trial(CHUNI_17), jl('pp.107-08')],
  },
  {
    id: 'bakht-khan',
    para: 3,
    hardHidden: true,
    label: { en: 'Bakht Khan', hi: 'बख़्त ख़ान' },
    value: { en: 'Reaches Delhi 1-2 July', hi: '1-2 जुलाई को दिल्ली पहुँचते हैं' },
    story: {
      en: 'Bakht Khan reaches [[Delhi]] only on [[1-2 July]].',
      hi: 'बख़्त ख़ान [[1-2 जुलाई]] को जाकर [[दिल्ली]] पहुँचते हैं।',
    },
    sources: [jl('pp.133-35'), sen('pp.83-84')],
  },
]
