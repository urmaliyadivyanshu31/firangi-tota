import type { Receipt } from '../../types.js'

// Dossier section 12. People and their documented acts only; never a community.
// Saunders, Chanan Singh and the witnesses the police summoned are never mocked.
// Quotes keep their qualifiers, so each card is fair to the side it quotes.
export const receipts: Receipt[] = [
  {
    id: 'rc-jai-gopal',
    who: { en: 'Jai Gopal, approver', hi: 'जयगोपाल, सरकारी गवाह बना साथी' },
    quote: {
      en: "'Jai Gopal identified him and stated that he had seen him at Ferozepore. Jai Gopal wept copiously and embraced the accused.' (identification parade for Shiv Verma, Lahore Fort, 7 June 1929)",
      hi: "'जयगोपाल ने उसे पहचाना और कहा कि उसने उसे फ़िरोज़पुर में देखा था। जयगोपाल फूट-फूटकर रोया और आरोपी से लिपट गया।' (शिव वर्मा की पहचान परेड, लाहौर क़िला, 7 जून 1929)",
    },
    joke: {
      en: 'First point him out, then cry on his shoulder. On 21 October 1929 a co-accused, Prem Dutt, threw a slipper at him in court; it cost Prem Dutt three months of solitary confinement.',
      hi: 'पहले उँगली उठाओ, फिर गले लगकर रो लो। 21 अक्टूबर 1929 को साथी आरोपी प्रेम दत्त ने अदालत में उस पर चप्पल फेंकी; इसकी सज़ा प्रेम दत्त को तीन महीने की काल-कोठरी मिली।',
    },
    source: { id: 'noorani-1996', loc: "ch. 'The Magisterial Farce', pp. 108, 117" },
  },
  {
    id: 'rc-vohra',
    who: { en: 'Hans Raj Vohra, approver', hi: 'हंसराज वोहरा, सरकारी गवाह बना साथी' },
    quote: {
      en: "He was bailed out on January 3, 1929, 'without having made any statement concerning his knowledge of the affair'.",
      hi: "3 जनवरी 1929 को वह ज़मानत पर छूटा, 'इस मामले की अपनी जानकारी के बारे में कोई बयान दिए बिना'।",
    },
    joke: {
      en: "The silence did not last. Offered a pardon by the District Magistrate, he turned approver; in Noorani's words, it was 'Hans Raj Vohra's turn to spill the beans'.",
      hi: "यह चुप्पी ज़्यादा दिन नहीं चली। ज़िला मजिस्ट्रेट से माफ़ी का वादा मिला, तो वह सरकारी गवाह बन गया। नूरानी के शब्दों में, अब 'हंसराज वोहरा की बारी थी सब उगल देने की'।",
    },
    theirSide: {
      en: "Decades later he wrote in a letter, quoted by the historian Aparna Vaidik ('A nation betrayed?', Times of India, 2016), that the police told him Sukhdev had already given away all their secrets: 'I could not risk going down with people I no longer respected.'",
      hi: "कई दशक बाद उसने एक चिट्ठी में लिखा, जिसे इतिहासकार अपर्णा वैदिक ने छापा है ('अ नेशन बिट्रेड?', टाइम्स ऑफ़ इंडिया, 2016), कि पुलिस ने उसे बताया था कि सुखदेव सारे राज़ पहले ही खोल चुके हैं: 'जिन लोगों की मैं अब इज़्ज़त नहीं करता था, उनके साथ डूबने का जोखिम मैं नहीं ले सकता था।'",
    },
    // The card's quote and joke are Noorani's; the theirSide letter is cited inline and
    // listed in sources.ts as 'vaidik-2016' (a Receipt carries one source).
    source: { id: 'noorani-1996', loc: "ch. 'Saunders Murder', p. 23; ch. 'The Magisterial Farce', p. 119" },
  },
  {
    id: 'rc-assembly',
    who: { en: 'The Central Legislative Assembly, 11 April 1929', hi: 'सेंट्रल लेजिस्लेटिव असेंबली, 11 अप्रैल 1929' },
    quote: {
      en: "'This House places on record its sense of horror and indignation at the dastardly outrage … The House condemns unreservedly this outrage and assures the authorities of its full support in such reasonable steps as may be necessary to prevent a recurrence of such crimes.' (passed unanimously)",
      hi: "'यह सदन इस कायराना वारदात पर अपनी दहशत और ग़ुस्सा दर्ज करता है … सदन इस वारदात की खुलकर निंदा करता है और ऐसे अपराध दोबारा न हों, इसके लिए ज़रूरी और वाजिब क़दमों में अधिकारियों को पूरे समर्थन का भरोसा देता है।' (सबकी सहमति से पास)",
    },
    joke: {
      en: 'Unanimous. Two years later, on 24 March 1931, the day after the hangings, Diwan Bahadur T. Rangachariar protested in the same chamber and the Nationalists walked out.',
      hi: 'सबकी सहमति से। दो साल बाद, 24 मार्च 1931 को, फाँसी के अगले दिन, उसी सदन में दीवान बहादुर टी. रंगाचारियर ने विरोध किया और नेशनलिस्ट सदस्य उठकर बाहर चले गए।',
    },
    theirSide: {
      en: "President Vithalbhai Patel, moving the motion: 'We meet today under the shadow of a great tragedy which, but for the merciful intervention of Providence, would have resulted in consequences the seriousness of which it is not difficult to imagine.' Minutes later he ruled the government's Public Safety Bill motion out of order.",
      hi: "प्रस्ताव रखते हुए प्रेसिडेंट विट्ठलभाई पटेल ने कहा: 'आज हम एक बड़े हादसे के साये में मिल रहे हैं; ऊपरवाले की मेहरबानी न होती, तो नतीजे कितने गंभीर होते, यह सोचना मुश्किल नहीं।' कुछ ही देर बाद उन्होंने सरकार का पब्लिक सेफ़्टी बिल वाला प्रस्ताव नियम के ख़िलाफ़ बताकर रोक दिया।",
    },
    source: { id: 'noorani-1996', loc: "ch. 'Bombs in the Central Assembly', pp. 43–44; ch. 'The Execution', p. 228" },
  },
]
