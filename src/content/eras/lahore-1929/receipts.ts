import type { Receipt } from '../../types.js'

// Dossier section 12. People and their documented acts only; never a community.
// Saunders, Chanan Singh and the witnesses the police summoned are never mocked.
// Quotes keep their qualifiers, so each card is fair to the side it quotes.
export const receipts: Receipt[] = [
  {
    id: 'rc-jai-gopal',
    who: { en: 'Jai Gopal, approver', hi: 'जयगोपाल, सरकारी गवाह बना साथी' },
    quote: {
      en: "'Jai Gopal identified him … Jai Gopal wept copiously and embraced the accused.' (Shiv Verma's identification parade, 7 June 1929)",
      hi: "'जयगोपाल ने उसे पहचाना … जयगोपाल फूट-फूटकर रोया और आरोपी से लिपट गया।' (शिव वर्मा की पहचान परेड, 7 जून 1929)",
    },
    joke: { en: 'Point him out, then weep on his shoulder.', hi: 'पहले उँगली उठाओ, फिर गले लगकर रो लो।' },
    source: { id: 'noorani-1996', loc: "ch. 'The Magisterial Farce', p. 117" },
  },
  {
    id: 'rc-vohra',
    who: { en: 'Hans Raj Vohra, approver', hi: 'हंसराज वोहरा, सरकारी गवाह बना साथी' },
    quote: {
      en: "Bailed out on 3 January 1929 'without having made any statement concerning his knowledge of the affair'.",
      hi: "3 जनवरी 1929 को ज़मानत पर छूटा, 'इस मामले की अपनी जानकारी के बारे में कोई बयान दिए बिना'।",
    },
    joke: { en: 'Offered a pardon, he spilled the beans.', hi: 'माफ़ी का वादा मिला, तो सब उगल दिया।' },
    theirSide: {
      en: 'He later wrote that police said Sukhdev had already confessed (letter quoted by Aparna Vaidik, 2016).',
      hi: 'बाद में उसने लिखा कि पुलिस ने बताया था, सुखदेव सब कबूल चुके हैं (अपर्णा वैदिक, 2016)।',
    },
    // The card's quote and joke are Noorani's; the theirSide letter is cited inline and
    // listed in sources.ts as 'vaidik-2016' (a Receipt carries one source).
    source: { id: 'noorani-1996', loc: "ch. 'Saunders Murder', p. 23; ch. 'The Magisterial Farce', p. 119" },
  },
  {
    id: 'rc-assembly',
    who: { en: 'Central Assembly, 11 April 1929', hi: 'सेंट्रल असेंबली, 11 अप्रैल 1929' },
    quote: {
      en: "'Horror and indignation at the dastardly outrage … full support in such reasonable steps as may be necessary to prevent a recurrence …' (unanimous)",
      hi: "'कायराना वारदात पर दहशत और ग़ुस्सा … ऐसा दोबारा न हो, इसके लिए ज़रूरी और वाजिब क़दमों में पूरा समर्थन …' (सबकी सहमति से)",
    },
    joke: {
      en: 'After the hangings in 1931, the Nationalists walked out.',
      hi: '1931 में फाँसी के बाद नेशनलिस्ट सदस्य सदन से बाहर चले गए।',
    },
    theirSide: {
      en: "Patel, moving it: 'but for the merciful intervention of Providence', it could have been far worse.",
      hi: "प्रस्ताव रखते हुए पटेल: 'ऊपरवाले की मेहरबानी न होती', तो नतीजे बहुत बुरे होते।",
    },
    source: { id: 'noorani-1996', loc: "ch. 'Bombs in the Central Assembly', pp. 43–44; ch. 'The Execution', p. 228" },
  },
]
