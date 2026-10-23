import type { Fact } from '../../types.js'
import { fanshawe, jl, mh, sen, trial, yule, CHUNI_17, CHUNI_18 } from './sources.js'

// The case file: one short line each. Two lines are hardHidden (blank in Hard mode).
// The calendar now lives in the weekdays rule, and the titles (Canning, Governor-General) in the
// english-titles rule.
export const facts: Fact[] = [
  {
    id: 'court',
    label: { en: 'The King', hi: 'बादशाह' },
    value: { en: 'Bahadur Shah Zafar; coins: Siraj-ud-din (Suraj-u-din)', hi: 'बहादुर शाह ज़फ़र; सिक्कों पर: सिराजुद्दीन' },
    sources: [jl('pp.96-97'), mh('p.59'), sen('p.95')],
  },
  {
    id: 'commanders',
    label: { en: 'Commander-in-Chief', hi: 'कमांडर-इन-चीफ़' },
    value: { en: 'Mirza Mughal, from 18 May', hi: 'मिर्ज़ा मुग़ल, 18 मई से' },
    sources: [jl('p.96'), trial(CHUNI_18)],
  },
  {
    id: 'regiments',
    label: { en: 'Regiments', hi: 'पलटनें' },
    value: { en: '3rd Cavalry; Infantry 11/20/38/54/74', hi: 'तीसरी घुड़सवार; पैदल 11/20/38/54/74' },
    sources: [sen('pp.59-62'), mh('p.53')],
  },
  {
    // Meerut rose on the evening of Sunday 10 May (Sen pp.58-60); the riders reached Delhi on the
    // morning of 11 May (Sen p.70; JL pp.75-79).
    id: 'meerut',
    label: { en: 'Meerut rising', hi: 'मेरठ की बग़ावत' },
    value: { en: 'Sunday 10 May; Delhi, 11 May', hi: 'रविवार 10 मई; दिल्ली, 11 मई' },
    sources: [sen('pp.57-60'), sen('p.70'), jl('pp.75-79')],
  },
  {
    id: 'lahore-gates',
    label: { en: 'Lahore Gates', hi: 'लाहौरी दरवाज़े' },
    value: { en: "Two: city's (west), Fort's (east)", hi: 'दो: शहर का (पश्चिम), क़िले का (पूरब)' },
    sources: [fanshawe('pp.5-6'), fanshawe('p.53'), mh('p.61')],
  },
  {
    id: 'ballabhgarh-road',
    label: { en: 'Ballabhgarh road', hi: 'बल्लभगढ़ की सड़क' },
    value: { en: 'Enters at the Delhi Gate (south)', hi: 'दक्षिण के दिल्ली दरवाज़े पर' },
    sources: [trial('Petition No. 63, 22 May 1857, p.33'), fanshawe('pp.5-6')],
  },
  {
    id: 'money',
    label: { en: 'Money', hi: 'पैसा' },
    value: { en: '16 annas make one rupee', hi: '16 आने का एक रुपया' },
    sources: [yule('s.v. Anna, p.31'), yule('s.v. Pice'), yule('s.v. Mohur, Gold, pp.573-74')],
  },
  {
    id: 'pay',
    label: { en: 'Pay promised', hi: 'वादे की तनख़्वाह' },
    value: { en: 'Foot soldier Rs 30, horseman 50', hi: 'पैदल 30 रुपये, सवार 50 रुपये' },
    sources: [mh('p.60')],
  },
  {
    id: 'bakht-khan',
    hardHidden: true,
    label: { en: 'Bakht Khan', hi: 'बख़्त ख़ान' },
    value: { en: 'Reaches Delhi 1-2 July', hi: '1-2 जुलाई को दिल्ली पहुँचते हैं' },
    sources: [jl('pp.133-35'), sen('pp.83-84')],
  },
  {
    id: 'english-force',
    hardHidden: true,
    label: { en: 'English army', hi: 'अंग्रेज़ी फ़ौज' },
    value: { en: 'Takes the Ridge on 8 June', hi: 'रिज पर 8 जून को क़ब्ज़ा' },
    sources: [sen('p.79'), trial(CHUNI_17), jl('pp.107-08')],
  },
]
