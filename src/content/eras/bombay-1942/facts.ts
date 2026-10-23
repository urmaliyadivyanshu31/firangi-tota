import type { Fact } from '../../types'

// The announcer-operator's case file (dossier §4). Three lines are hardHidden: things a history
// buff knows, left blank in Hard.
export const facts: Fact[] = [
  {
    id: 'f-signature',
    label: { en: 'The station on air', hi: 'स्टेशन की पहचान' },
    value: {
      en: 'Opens with: “This is the Congress Radio calling on 42.34 metres from somewhere in India.” The first broadcasts were on 41.78 metres. Evening programme from 8:45 pm. Opening tune Hindustan Hamara (Iqbal’s Sare Jahan Se Achcha); closing tune Vande Mataram.',
      hi: 'शुरुआत: “यह कांग्रेस रेडियो है, 42.34 मीटर पर, हिंदुस्तान में कहीं से बोल रहा है।” पहले प्रसारण 41.78 मीटर पर थे। शाम का प्रोग्राम रात 8:45 से। शुरू में ‘हिंदुस्तान हमारा’ (इक़बाल का ‘सारे जहाँ से अच्छा’), आख़िर में ‘वंदे मातरम्’।',
    },
    sources: [
      { id: 'usha-mehta-1969', loc: 'opening words; tunes' },
      { id: 'chatterjee-1989', loc: 'police transcripts, e.g. 20 Oct 1942' },
      { id: 'thakkar-2021', loc: 'Scroll excerpt (court record: 41.78 m, 8:45 pm)' },
      { id: 'nehru-centre-2021', loc: 'Congress Radio article' },
    ],
  },
  {
    id: 'f-voices',
    label: { en: 'Voices on air', hi: 'रेडियो पर आवाज़ें' },
    value: {
      en: 'Hindustani: Usha Mehta, Moinuddin Harris, Achyut Patwardhan. English: Ram Manohar Lohia, Coomi Dastur. Lohia also writes talks for the station.',
      hi: 'हिंदुस्तानी में: उषा मेहता, मोइनुद्दीन हैरिस, अच्युत पटवर्धन। अंग्रेज़ी में: राम मनोहर लोहिया, कूमी दस्तूर। लोहिया स्टेशन के लिए भाषण भी लिखते हैं।',
    },
    sources: [{ id: 'usha-mehta-1969' }],
  },
  {
    id: 'f-team',
    label: { en: 'Our people', hi: 'हमारे लोग' },
    value: {
      en: 'Babubhai Khakhar is the chief organiser. Vithalbhai Jhaveri runs the recording. Nariman Printer, a technician, built the set. Parts come from Chicago Radio, the firm of Nanak Motwane.',
      hi: 'बाबूभाई खाखर सारा इंतज़ाम देखते हैं। विट्ठलभाई झवेरी रिकॉर्डिंग सँभालते हैं। मशीन मिस्त्री नरीमन प्रिंटर ने बनाई। पुर्ज़े शिकागो रेडियो से आते हैं, जो नानक मोटवाने की कंपनी है।',
    },
    sources: [
      { id: 'chatterjee-1989', loc: 'Home Dept records: the accused' },
      { id: 'huacuja-2023', loc: 'trial' },
      { id: 'thakkar-2021', loc: 'Scroll excerpt' },
    ],
  },
  {
    id: 'f-sites',
    label: { en: 'Where we have been', hi: 'हम कहाँ-कहाँ रहे' },
    value: {
      en: 'Sea View, Chowpatty; Ratan Mahal, Walkeshwar Road; Ajit Villa, Laburnum Road; Laxmi Bhuvan, Sandhurst Road; since 15 Oct, Parekh Wadi, Girgaum Back Road. None of this is ever said on air.',
      hi: 'सी व्यू, चौपाटी; रतन महल, वालकेश्वर रोड; अजीत विला, लैबर्नम रोड; लक्ष्मी भुवन, सैंडहर्स्ट रोड; 15 अक्टूबर से पारेख वाड़ी, गिरगाँव बैक रोड। इनमें से कुछ भी रेडियो पर कभी नहीं बोला जाता।',
    },
    sources: [
      { id: 'huacuja-2023', loc: 'police list of sites (from Sengupta and Chatterjee 1988)' },
      { id: 'chatterjee-1989' },
      { id: 'nehru-centre-2021' },
    ],
  },
  {
    id: 'f-aicc',
    label: { en: 'The resolution', hi: 'प्रस्ताव' },
    value: {
      en: 'The AICC met at Gowalia Tank Maidan, Bombay, on 7–8 Aug 1942 and passed the Quit India resolution on Saturday 8 Aug. Only 13 voted against. Gandhiji’s mantra: “Do or Die” (“Karenge Ya Marenge”).',
      hi: 'ऑल इंडिया कांग्रेस कमेटी 7–8 अगस्त 1942 को बंबई के गोवालिया टैंक मैदान में मिली और शनिवार 8 अगस्त को ‘भारत छोड़ो’ प्रस्ताव पास किया। सिर्फ़ 13 ने विरोध में वोट दिया। गांधीजी का मंत्र: “करो या मरो” (“करेंगे या मरेंगे”)।',
    },
    sources: [
      { id: 'iar-1942', loc: 'AICC proceedings; Chronicle p. 17' },
      { id: 'gandhi-1942' },
      { id: 'goi-1943', loc: 'App. X' },
    ],
  },
  {
    id: 'f-zero-hour',
    label: { en: 'The arrests', hi: 'गिरफ़्तारियाँ' },
    value: {
      en: 'From 5:00 am on Sunday 9 Aug, about 60 police parties arrested the leaders in Bombay at once; a special train left at 7:15 am. That morning Aruna Asaf Ali raised the Congress flag at Gowalia Tank Maidan.',
      hi: 'रविवार 9 अगस्त सुबह 5 बजे से लगभग 60 पुलिस टोलियों ने बंबई में सारे नेता एक साथ पकड़े; सुबह 7:15 पर एक ख़ास ट्रेन चली। उसी सुबह अरुणा आसफ़ अली ने गोवालिया टैंक मैदान में कांग्रेस का झंडा फहराया।',
    },
    sources: [
      { id: 'top-ii-1971', loc: 'No. 624, pp. 806–7' },
      { id: 'rebel-india-1946', loc: 'Bombay section' },
    ],
  },
  {
    id: 'f-detention',
    label: { en: 'Where the leaders are held', hi: 'नेता कहाँ बंद हैं' },
    value: {
      en: 'Gandhiji: the Aga Khan Palace, Poona. The Working Committee: Ahmednagar Fort.',
      hi: 'गांधीजी: आग़ा ख़ान महल, पूना। वर्किंग कमेटी: अहमदनगर क़िला।',
    },
    sources: [{ id: 'top-ii-1971', loc: 'Nos. 624, 625' }],
    hardHidden: true,
  },
  {
    id: 'f-uprising',
    label: { en: 'News from the country', hi: 'देश भर से ख़बरें' },
    value: {
      en: 'Ballia: in August the people set up Chittu Pandey’s “Government of Independent Ballia”. Tamluk: Matangini Hazra, 73, was shot leading a procession on 29 Sep.',
      hi: 'बलिया: अगस्त में लोगों ने चित्तू पांडे की “आज़ाद बलिया सरकार” बनाई। तमलुक: 73 साल की मातंगिनी हाज़रा को 29 सितंबर को जुलूस की अगुवाई करते हुए गोली मारी गई।',
    },
    sources: [
      { id: 'rebel-india-1946', loc: 'Ballia section' },
      { id: 'samanta-1946', loc: 'Tamluk sections' },
    ],
    hardHidden: true,
  },
  {
    id: 'f-money',
    label: { en: 'Money', hi: 'पैसा' },
    value: {
      en: 'Rupees, annas and pies: 16 annas make a rupee. Rs 599-8-0 means 599 rupees and 8 annas. The rupee is not split into 100, so no decimal point.',
      hi: 'रुपया, आना और पाई: 16 आने का एक रुपया। रु. 599-8-0 यानी 599 रुपये और 8 आने। रुपये के 100 हिस्से नहीं होते, इसलिए दशमलव नहीं लगता।',
    },
    sources: [{ id: 'thakkar-2021', loc: 'Scroll excerpt (court figures, Rs 599-8-0)' }],
    hardHidden: true,
  },
  {
    id: 'f-press',
    label: { en: 'The press order', hi: 'अख़बारों पर पाबंदी' },
    value: {
      en: 'Since 8 Aug the papers may print no factual news of the movement except from official sources, the news agencies or correspondents registered with the District Magistrate.',
      hi: '8 अगस्त से अख़बार आंदोलन की कोई असली ख़बर नहीं छाप सकते। छूट सिर्फ़ सरकारी ख़बर, ख़बर एजेंसियों, या ज़िला मजिस्ट्रेट के पास दर्ज रिपोर्टरों की ख़बर को है।',
    },
    sources: [{ id: 'iar-1942', loc: 'late-August chronicle' }],
  },
]
