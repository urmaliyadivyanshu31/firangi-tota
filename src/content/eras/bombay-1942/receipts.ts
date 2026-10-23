import type { Receipt } from '../../types'

// Three receipt cards from dossier §12: left, League and right, each an organisation's public line
// in 1942, in its own words, with its own defence. Allah Bux is the counterpoint on the League card.
// Not used here (see the task report): Mookerjee's letter of 26 July, the RSS (secondhand sources).
export const receipts: Receipt[] = [
  {
    id: 'rc-cpi',
    who: {
      en: 'Communist Party of India, open letter to the Congress Working Committee, July 1942',
      hi: 'भारतीय कम्युनिस्ट पार्टी, कांग्रेस वर्किंग कमेटी को खुली चिट्ठी, जुलाई 1942',
    },
    quote: {
      en: '“Such a ‘struggle’ to-day will not liquidate but strengthen the bureaucracy.”',
      hi: '“आज ऐसा ‘संघर्ष’ अफ़सरशाही को ख़त्म नहीं करेगा, उलटे उसे मज़बूत करेगा।”',
    },
    joke: {
      en: 'The party called the war a People’s War. The people in the streets were fighting a different one',
      hi: 'पार्टी ने युद्ध को ‘जनता की जंग’ कहा। सड़कों पर जनता कोई और ही जंग लड़ रही थी',
    },
    theirSide: {
      en: 'Their side: after Germany attacked the USSR the party saw the war as a People’s War. Its Central Committee resolution of September 1942, “Solve India’s National Crisis Through National Unity!”, “condemns unequivocally the military and police rule of blood and terror” and demands “Release Mahatma Gandhi and the National leaders.”',
      hi: 'उनकी बात: जर्मनी के सोवियत संघ पर हमले के बाद पार्टी इस युद्ध को ‘जनता की जंग’ मानती थी। सितंबर 1942 में उसकी सेंट्रल कमेटी के प्रस्ताव (“राष्ट्रीय एकता से देश का संकट सुलझाओ!”) ने “फ़ौज और पुलिस के ख़ून और दहशत वाले राज” की साफ़ निंदा की और माँग की: “महात्मा गांधी और राष्ट्रीय नेताओं को रिहा करो।”',
    },
    source: { id: 'cpi-open-letter-1942', loc: 'open letter, July 1942 (Joshi 1945, App. I, pp. 291–3); theirSide: CC resolution, Sept 1942' },
  },
  {
    id: 'rc-league',
    who: {
      en: 'All-India Muslim League Working Committee, Bombay, 20 August 1942',
      hi: 'ऑल इंडिया मुस्लिम लीग की वर्किंग कमेटी, बंबई, 20 अगस्त 1942',
    },
    quote: {
      en: '“…call upon the Muslims to abstain from any participation in the movement initiated by the Congress and to continue to pursue their normal peaceful life.”',
      hi: '“…मुसलमानों से कहती है कि कांग्रेस के शुरू किए आंदोलन में किसी भी तरह हिस्सा न लें और अपनी आम, शांत ज़िंदगी जीते रहें।”',
    },
    joke: {
      en: 'A “normal peaceful life”, in August 1942. Sind’s Premier Allah Bux chose otherwise and handed back his British titles',
      hi: 'अगस्त 1942 में “आम, शांत ज़िंदगी”! सिंध के प्रीमियर अल्लाह बख़्श ने अलग रास्ता चुना और अपने अंग्रेज़ी ख़िताब लौटा दिए',
    },
    theirSide: {
      en: 'Their side: “The Muslims are not a whit less insistent on freedom for the country,” the League said, but it saw the movement as aiming at “the establishment of Hindu raj” and a “death blow to the Muslim goal of Pakistan”. The same resolution scolded the British for being “unresponsive to the Muslim League offer of co-operation”.',
      hi: 'उनकी बात: लीग ने कहा, “देश की आज़ादी पर मुसलमानों का ज़ोर ज़रा भी कम नहीं है,” पर उसे लगा कि आंदोलन का मक़सद “हिंदू राज” क़ायम करना और पाकिस्तान के लक्ष्य पर “जानलेवा चोट” करना है। उसी प्रस्ताव में अंग्रेज़ों को भी डाँटा गया कि उन्होंने “मुस्लिम लीग के सहयोग के प्रस्ताव” का कोई जवाब नहीं दिया।',
    },
    source: { id: 'top-ii-1971', loc: 'No. 598, pp. 772–4' },
  },
  {
    id: 'rc-savarkar',
    who: {
      en: 'V. D. Savarkar, President of the Hindu Mahasabha, September 1942',
      hi: 'वी. डी. सावरकर, हिंदू महासभा के अध्यक्ष, सितंबर 1942',
    },
    quote: {
      en: '“I issue this definite instruction to all Hindu Sabhaites… or those who may be serving in the army, navy, air force or working in ammunition factories or holding any post or position of vantage in Government service that they should stick to the posts and continue to perform their regular duties.”',
      hi: '“मैं सभी हिंदू सभाइयों को यह पक्का आदेश देता हूँ… या जो फ़ौज, नौसेना, वायुसेना में हैं, या गोला-बारूद के कारख़ानों में काम करते हैं, या सरकारी नौकरी में कोई भी पद या असर वाली जगह रखते हैं, कि वे अपने पदों पर डटे रहें और अपना रोज़ का काम करते रहें।”',
    },
    joke: {
      en: 'Quit India? Not before the shift ends',
      hi: 'भारत छोड़ो? पहले ड्यूटी तो पूरी कर लें',
    },
    theirSide: {
      en: 'His side: Savarkar called his line “responsive co-operation”, which “implies all and any means from unconditional co-operation to an armed resistance”, and argued that Hindus trained in the forces would serve Hindu interests (statement of 8 April 1942, printed in Historic Statements, a collection of his statements published after his death, 1967).',
      hi: 'उनकी बात: सावरकर ने अपनी नीति को “जवाबी सहयोग” कहा, जिसमें “बिना शर्त सहयोग से लेकर हथियारबंद विरोध तक हर रास्ता” शामिल है, और कहा कि फ़ौज में सीखे हिंदू हिंदुओं के हित में काम आएँगे (8 अप्रैल 1942 का बयान, जो उनके बयानों के संग्रह ‘हिस्टॉरिक स्टेटमेंट्स’ में उनकी मौत के बाद 1967 में छपा)।',
    },
    source: { id: 'iar-1942', loc: 'September 1942 chronicle (Savarkar statement from Bombay); theirSide: Historic Statements (1967), statement of 8 Apr 1942' },
  },
]
