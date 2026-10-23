import type { Receipt } from '../../types'

// Receipt cards: documented words, a short joke at the expense of people and their acts,
// and their own explanation where the record has one.
export const receipts: Receipt[] = [
  {
    id: 'radcliffe-five-weeks',
    who: { en: 'Sir Cyril Radcliffe', hi: 'सर सिरिल रैडक्लिफ़' },
    quote: {
      en: '"…I do not think that I could manage the 10th: but I think that I can promise the 12th…" (23 July 1947)',
      hi: '"…मुझे नहीं लगता कि मैं 10 तारीख़ तक कर पाऊँगा, पर मुझे लगता है कि मैं 12 का वादा कर सकता हूँ…" (23 जुलाई 1947)',
    },
    joke: {
      en: "Landed 8 July; two provinces' new borders dated 12 August",
      hi: '8 जुलाई को उतरे; दो सूबों की नई सीमाएँ 12 अगस्त की',
    },
    theirSide: {
      en: 'Radcliffe, 1971: "The time… was so short that I could not do a better job."',
      hi: 'रैडक्लिफ़, 1971: "समय… इतना कम था कि मैं इससे अच्छा काम नहीं कर सकता था।"',
    },
    source: { id: 'mansergh-xii', loc: 'No. 209 ("think" underlined in the original)' },
  },
  {
    id: 'typewriter-deadlock',
    who: { en: 'Partition officials, Calcutta, 30 July 1947', hi: 'बँटवारे के अफ़सर, कलकत्ता, 30 जुलाई 1947' },
    quote: {
      en: '"…a deadlock in connection with typewriters and was likely to prove a source of fundamental difference of approach."',
      hi: '"…टाइपराइटरों को लेकर भी बात अटक गई थी, और इससे सोच में बुनियादी फ़र्क़ पैदा होने वाला था।"',
    },
    joke: {
      en: 'Two Dominions in 73 days; Bengal deadlocked on typewriters',
      hi: '73 दिन में दो डोमिनियन; बंगाल टाइपराइटरों पर अटका',
    },
    theirSide: {
      en: 'The minutes: typewriters "had been settled"; the fight was over the general principle.',
      hi: 'रिकॉर्ड के मुताबिक़ टाइपराइटर का मामला "सुलझ गया था"; झगड़ा आम उसूल पर था।',
    },
    source: { id: 'mansergh-xii', loc: "No. 287 (Viceroy's Twenty Fourth Miscellaneous Meeting, Government House, Bengal, 30 July 1947)" },
  },
  {
    id: 'nizam-title',
    who: { en: 'Mountbatten, for the Nizam of Hyderabad', hi: 'माउंटबेटन, हैदराबाद के निज़ाम के लिए' },
    quote: {
      en: '"…recommending that second son of His Exalted Highness Nizam of Hyderabad be granted title of His Highness." (MOST IMMEDIATE, 13 August 1947)',
      hi: '"…सिफ़ारिश है कि हैदराबाद के निज़ाम के दूसरे बेटे को हिज़ हाइनेस का ख़िताब दिया जाए।" (MOST IMMEDIATE, 13 अगस्त 1947)',
    },
    joke: {
      en: "One day of Raj left. Title granted. Hyderabad didn't accede",
      hi: 'राज का एक दिन बचा। ख़िताब मिला। हैदराबाद शामिल नहीं हुआ',
    },
    theirSide: {
      en: 'Mountbatten: the title "would carry a great deal of weight" with the Nizam. Patel: "no objection".',
      hi: 'माउंटबेटन: इस ख़िताब का निज़ाम पर "बहुत असर" होता। पटेल: "कोई एतराज़ नहीं"।',
    },
    source: { id: 'mansergh-xii', loc: 'No. 463 and note (King approved, tel. 10644 of 14 August); reason in No. 228, para 21' },
  },
]
