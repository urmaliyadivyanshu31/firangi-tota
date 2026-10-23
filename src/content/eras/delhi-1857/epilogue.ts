import type { Epilogue } from '../../types.js'
import { hodson, hunter, jl, low, majumdar, mh, sen, trial } from './sources.js'

// survived: Sen p.79 (Ridge, 8 June); JL pp.133-35 and Sen pp.83-84 (Bakht Khan); Sen pp.105-07 and
// Hodson pp.331-32 (assault, 14 Sept); Sen p.110 and Hodson pp.340-48 (surrender 21 Sept, Macdowell's
// letter gives the 20th; princes shot the next day, Macdowell gives the 21st); Majumdar pp.74-75 and
// Sen p.113 (trial, exile, death 7 Nov 1862); Trial c. pp.91-98, JL pp.93-94, MH pp.72-73 and
// Sen p.89 (atrocities on both sides). Sen p.411 and Majumdar p.237 (the debate over the name) stay
// in the source list for the end card.
// caught: MH pp.72-73 (reprisals, false witnesses); Low II p.489 (the first batch, "two hundred and
// fifty mutineers", sailed from Calcutta on 4 March 1858; over 2,000 by the end of 1858); Hunter I
// pp.283-84 (the settlement was set up in 1858 because of the Mutiny's life prisoners).
export const epilogue: Epilogue = {
  survived: [
    {
      en: 'On 8 June the English took the Ridge. Bakht Khan arrived on 1-2 July and took command. On 14 September the English stormed Delhi.',
      hi: '8 जून को अंग्रेज़ों ने रिज पर क़ब्ज़ा किया। 1-2 जुलाई को बख़्त ख़ान आए और कमान सँभाली। 14 सितंबर को अंग्रेज़ों ने दिल्ली पर धावा बोला।',
    },
    {
      en: "Zafar surrendered at Humayun's Tomb on 21 September (one letter says the 20th). Hodson shot three princes next day. Zafar died in exile at Rangoon, 7 November 1862.",
      hi: 'ज़फ़र ने 21 सितंबर को हुमायूँ के मक़बरे पर हथियार डाले (एक चिट्ठी में 20 तारीख़ है)। अगले दिन हॉडसन ने तीन शहज़ादों को गोली मारी। ज़फ़र 7 नवंबर 1862 को देश से दूर, रंगून में मरे।',
    },
    {
      en: 'Atrocities on both sides: on 16 May rebels killed European prisoners, mostly women and children; after the fall, British troops killed and hanged the guiltless with the guilty.',
      hi: 'ज़ुल्म दोनों तरफ़ से हुए: 16 मई को बाग़ियों ने यूरोपियन क़ैदियों को मारा, ज़्यादातर औरतें और बच्चे; दिल्ली गिरने के बाद अंग्रेज़ी फ़ौज ने बेक़सूरों को भी क़सूरवारों के साथ मारा और फाँसी दी।',
    },
  ],
  caught: [
    {
      en: "Your stamp let a Firangi paper through. After Delhi fell, 'the gallows slew those who had escaped the sword', and 'false witnesses abounded'.",
      hi: "आपकी मुहर से फ़िरंगी का काग़ज़ आगे निकल गया। दिल्ली गिरी तो 'जो तलवार से बचे, उन्हें फाँसी ने मारा', और 'हर तरफ़ झूठे गवाह थे'।",
    },
    {
      en: 'Convicts of the rising were shipped to Port Blair, the Kala Pani. The first sailed from Calcutta on 4 March 1858; by year end, over 2,000 were there.',
      hi: 'बग़ावत के क़ैदी समंदर पार पोर्ट ब्लेयर, काला पानी, भेजे गए। पहला जत्था 4 मार्च 1858 को कलकत्ता से चला; साल के आख़िर तक वहाँ 2,000 से ज़्यादा थे।',
    },
  ],
  sources: [
    sen('p.79'),
    jl('pp.133-35'),
    sen('pp.83-84'),
    sen('pp.105-07'),
    hodson("pp.331-48 (Macdowell's letter)"),
    sen('p.110'),
    majumdar('pp.74-75'),
    trial('proceedings held in the Hall of Special Audience, e.g. 24 Feb 1858'),
    sen('p.113'),
    trial('c. pp.91-98'),
    jl('pp.93-94'),
    mh('pp.72-73'),
    sen('p.89'),
    sen('p.411'),
    majumdar('p.237'),
    low('p.489'),
    hunter('pp.283-84'),
  ],
}
