import type { Receipt } from '../../types'

// Three receipt cards from dossier §12: left, League and right, each an organisation's public line
// in 1942, in its own words, with its own defence. Allah Bux is the counterpoint on the League card.
// Not used here (see the task report): Mookerjee's letter of 26 July, the RSS (secondhand sources).
export const receipts: Receipt[] = [
  {
    id: 'rc-cpi',
    who: { en: 'CPI, open letter, July 1942', hi: 'कम्युनिस्ट पार्टी, खुली चिट्ठी, जुलाई 1942' },
    quote: {
      en: '“Such a ‘struggle’ to-day will not liquidate but strengthen the bureaucracy.”',
      hi: '“आज ऐसा ‘संघर्ष’ अफ़सरशाही को ख़त्म नहीं करेगा, उलटे उसे मज़बूत करेगा।”',
    },
    joke: { en: 'A People’s War, minus the people in the streets', hi: 'जनता की जंग, बस सड़कों वाली जनता के बिना' },
    theirSide: {
      en: 'Their side: “People’s War” against Hitler; it still demanded “Release Mahatma Gandhi and the National leaders.”',
      hi: 'उनकी बात: हिटलर के ख़िलाफ़ “जनता की जंग”; फिर भी माँग की, “महात्मा गांधी और राष्ट्रीय नेताओं को रिहा करो।”',
    },
    source: { id: 'cpi-open-letter-1942', loc: 'open letter, July 1942 (Joshi 1945, App. I, pp. 291–3); theirSide: CC resolution, Sept 1942' },
  },
  {
    id: 'rc-league',
    who: { en: 'Muslim League resolution, 20 August 1942', hi: 'मुस्लिम लीग का प्रस्ताव, 20 अगस्त 1942' },
    quote: {
      en: '“…call upon the Muslims to abstain from any participation in the movement initiated by the Congress and to continue to pursue their normal peaceful life.”',
      hi: '“…मुसलमानों से कहती है कि कांग्रेस के शुरू किए आंदोलन में किसी भी तरह हिस्सा न लें और अपनी आम, शांत ज़िंदगी जीते रहें।”',
    },
    joke: {
      en: '“Normal peaceful life”? Sind’s Allah Bux handed back his titles',
      hi: '“आम, शांत ज़िंदगी”? सिंध के अल्लाह बख़्श ने ख़िताब लौटा दिए',
    },
    theirSide: {
      en: 'Their side: Muslims want freedom “not a whit less”, the League said, but feared “Hindu raj”.',
      hi: 'उनकी बात: लीग ने कहा, आज़ादी पर मुसलमानों का ज़ोर “ज़रा भी कम नहीं”, पर उसे “हिंदू राज” का डर था।',
    },
    source: { id: 'top-ii-1971', loc: 'No. 598, pp. 772–4' },
  },
  {
    id: 'rc-savarkar',
    who: { en: 'Savarkar, Hindu Mahasabha president, Sept 1942', hi: 'सावरकर, हिंदू महासभा अध्यक्ष, सितंबर 1942' },
    quote: {
      en: '“…all Hindu Sabhaites… who may be serving in the army, navy, air force or working in ammunition factories… that they should stick to the posts…”',
      hi: '“…सभी हिंदू सभाई… जो फ़ौज, नौसेना, वायुसेना में हैं, या गोला-बारूद के कारख़ानों में काम करते हैं… वे अपने पदों पर डटे रहें…”',
    },
    joke: { en: 'Quit India? Not before the shift ends', hi: 'भारत छोड़ो? पहले ड्यूटी तो पूरी कर लें' },
    theirSide: {
      en: 'His side: “responsive co-operation”: Hindus trained in the forces serve Hindu interests (8 April 1942).',
      hi: 'उनकी बात: “जवाबी सहयोग”: फ़ौज में सीखे हिंदू हिंदुओं के हित में काम आएँगे (8 अप्रैल 1942)।',
    },
    source: {
      id: 'iar-1942',
      loc: 'September 1942 chronicle (Savarkar statement from Bombay); theirSide: Historic Statements (1967), statement of 8 Apr 1942',
    },
  },
]
