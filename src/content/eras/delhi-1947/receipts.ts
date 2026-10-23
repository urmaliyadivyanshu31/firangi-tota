import type { Receipt } from '../../types'

// Receipt cards: documented words, a short joke at the expense of people and their acts,
// and their own explanation where the record has one.
export const receipts: Receipt[] = [
  {
    id: 'radcliffe-five-weeks',
    who: { en: 'Sir Cyril Radcliffe, chairman of both Boundary Commissions', hi: 'सर सिरिल रैडक्लिफ़, दोनों सीमा कमीशनों के अध्यक्ष' },
    quote: {
      en: '"…I do not think that I could manage the 10th: but I think that I can promise the 12th, and I will do the earlier date if I possibly can." (letter to Mountbatten, 23 July 1947)',
      hi: '"…मुझे नहीं लगता कि मैं 10 तारीख़ तक कर पाऊँगा, पर मुझे लगता है कि मैं 12 का वादा कर सकता हूँ, और हो सका तो पहले कर दूँगा।" (माउंटबेटन को चिट्ठी, 23 जुलाई 1947)',
    },
    joke: {
      en: 'He landed on 8 July, never in India before, and promised the 12th. Thirty-five days after he landed, two provinces had new borders dated exactly 12 August',
      hi: 'वे 8 जुलाई को उतरे, पहले कभी भारत नहीं आए थे, और 12 तारीख़ का वादा किया। उतरने के पैंतीस दिन बाद दो सूबों की नई सीमाओं पर ठीक 12 अगस्त की तारीख़ थी',
    },
    theirSide: {
      en: 'Radcliffe, to Kuldip Nayar in 1971: "I had no alternative; the time at my disposal was so short that I could not do a better job."',
      hi: 'रैडक्लिफ़ ने 1971 में कुलदीप नैयर से कहा: "मेरे पास कोई और रास्ता नहीं था; मेरे पास समय इतना कम था कि मैं इससे अच्छा काम नहीं कर सकता था।"',
    },
    source: { id: 'mansergh-xii', loc: 'No. 209 ("think" underlined in the original)' },
  },
  {
    id: 'typewriter-deadlock',
    who: { en: "Partition officials at the Viceroy's meeting in Calcutta, 30 July 1947", hi: 'बँटवारे के अफ़सर, वायसराय की कलकत्ता बैठक, 30 जुलाई 1947' },
    quote: {
      en: 'The division of assets "had also produced a deadlock in connection with typewriters and was likely to prove a source of fundamental difference of approach."',
      hi: 'सामान के बँटवारे में "टाइपराइटरों को लेकर भी बात अटक गई थी, और इससे सोच में बुनियादी फ़र्क़ पैदा होने वाला था।"',
    },
    joke: {
      en: 'Two Dominions in 73 days, and Bengal\'s partition talks had deadlocked on typewriters. The Viceroy passed on the Centre\'s ruling: split them "pro rata, based on the genuine requirements"',
      hi: '73 दिन में दो डोमिनियन बनाने थे, और बंगाल के बँटवारे की बातचीत टाइपराइटरों पर अटक गई। वायसराय ने केंद्र का फ़ैसला सुनाया: इन्हें "असली ज़रूरत के हिसाब से, अनुपात में" बाँटो',
    },
    theirSide: {
      en: 'Their side, from the same minutes: the typewriters themselves "had been settled", and Bengal\'s Governor explained that "it was the general principle on which a decision was required."',
      hi: 'उनकी बात, उसी बैठक के रिकॉर्ड से: टाइपराइटरों का मामला तो "सुलझ गया था", और बंगाल के गवर्नर ने समझाया कि फ़ैसला "आम उसूल पर" चाहिए था।',
    },
    source: { id: 'mansergh-xii', loc: "No. 287 (Viceroy's Twenty Fourth Miscellaneous Meeting, Government House, Bengal, 30 July 1947)" },
  },
  {
    id: 'nizam-title',
    who: { en: 'Viscount Mountbatten, as Crown Representative, for the Nizam of Hyderabad', hi: 'वाइकाउंट माउंटबेटन, क्राउन के प्रतिनिधि के तौर पर, हैदराबाद के निज़ाम के लिए' },
    quote: {
      en: '"I should be grateful if you would make an immediate submission to His Majesty recommending that second son of His Exalted Highness Nizam of Hyderabad be granted title of His Highness." (MOST IMMEDIATE, No. 3384-S, 13 August 1947)',
      hi: '"मैं आभारी रहूँगा अगर आप तुरंत ब्रिटेन के राजा से सिफ़ारिश करें कि हैदराबाद के निज़ाम के दूसरे बेटे को हिज़ हाइनेस का ख़िताब दिया जाए।" (MOST IMMEDIATE, No. 3384-S, 13 अगस्त 1947)',
    },
    joke: {
      en: "The Raj had one day left, and one of its MOST IMMEDIATE telegrams asked for a title for a prince's second son. London said yes the next day. Hyderabad still did not accede",
      hi: 'राज का एक दिन बचा था, और उसका एक MOST IMMEDIATE तार निज़ाम के दूसरे बेटे के लिए ख़िताब माँग रहा था। लंदन ने अगले ही दिन हाँ कह दी। हैदराबाद फिर भी भारत में शामिल नहीं हुआ',
    },
    theirSide: {
      en: 'Mountbatten\'s reason, in his own report: the title "would carry a great deal of weight" with the Nizam, and he wanted Hyderabad to join India. Patel had "no objection".',
      hi: 'माउंटबेटन ने अपनी रिपोर्ट में वजह लिखी: इस ख़िताब का निज़ाम पर "बहुत असर" होता, और वे चाहते थे कि हैदराबाद भारत में शामिल हो। पटेल को "कोई एतराज़ नहीं" था।',
    },
    source: { id: 'mansergh-xii', loc: 'No. 463 and note (King approved, tel. 10644 of 14 August); reason in No. 228, para 21' },
  },
]
