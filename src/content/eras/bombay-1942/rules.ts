import type { Rule } from '../../types'

// The station's rulebook, from the record (spec "Rules from the record", dossier §6–7).
export const rules: Rule[] = [
  {
    id: 'r-onair',
    text: {
      en: 'We go on air at 8:45 pm and stay on until Vande Mataram. The wavelength we announce is 42.34 metres; if we fade, listeners move between 39 and 43 metres.',
      hi: 'हम रात 8:45 बजे बोलना शुरू करते हैं और वंदे मातरम् तक रहते हैं। हम 42.34 मीटर बताते हैं; आवाज़ धीमी पड़े तो सुनने वाले 39 से 43 मीटर के बीच सुई घुमाते हैं।',
    },
    arrivesOnDay: 1,
  },
  {
    id: 'r-nonames',
    text: {
      en: 'Never talk of the persons behind the stations. On air we name none of our people and never say where we are, only “somewhere in India”. Notes between us may use names; scripts for air may not.',
      hi: 'स्टेशन के पीछे के लोगों की बात कभी मत कीजिए। रेडियो पर न हम अपने किसी आदमी का नाम लेते हैं, न बताते हैं कि हम कहाँ हैं, बस “हिंदुस्तान में कहीं से”। आपस की पर्चियों में नाम हो सकते हैं, रेडियो की स्क्रिप्ट में नहीं।',
    },
    arrivesOnDay: 1,
  },
  {
    id: 'r-confirm',
    text: {
      en: 'Hold back any report we cannot confirm. We sat on a story of soldiers shot at Meerut for a month because it was not confirmed.',
      hi: 'जो ख़बर पक्की न हो, उसे रोक लीजिए। मेरठ में सिपाहियों को गोली मारने की एक ख़बर हमने महीने भर रोके रखी, क्योंकि वह पक्की नहीं थी।',
    },
    arrivesOnDay: 2,
  },
  {
    id: 'r-wartime',
    text: {
      en: 'Since 1 September 1942 Indian Standard Time runs one hour ahead as war time: six and a half hours ahead of Greenwich.',
      hi: '1 सितंबर 1942 से इंडियन स्टैंडर्ड टाइम युद्ध की वजह से एक घंटा आगे है: ग्रीनविच से साढ़े छह घंटे आगे।',
    },
    arrivesOnDay: 3,
  },
  {
    id: 'r-words',
    text: {
      en: 'Our words are not the government’s. We say Gandhiji, Mahatmaji or Bapu, and the August Revolution. “Mr. Gandhi” and “the disturbances” are what government papers say.',
      hi: 'हमारे शब्द सरकार के शब्द नहीं हैं। हम गांधीजी, महात्माजी या बापू कहते हैं, और अगस्त क्रांति। “मिस्टर गांधी” और “गड़बड़ियाँ” सरकारी काग़ज़ों की भाषा है।',
    },
    arrivesOnDay: 5,
  },
  {
    id: 'r-axis',
    text: {
      en: 'We do not speak for Germany or Japan. India has no enmity for the British or any other people; we want British rule to end.',
      hi: 'हम जर्मनी या जापान की तरफ़ से नहीं बोलते। भारत की अंग्रेज़ों से या किसी और से दुश्मनी नहीं है; हम अंग्रेज़ी राज का अंत चाहते हैं।',
    },
    arrivesOnDay: 7,
  },
  {
    id: 'r-discs',
    text: {
      en: 'Talks reach us on home-cut gramophone discs from a separate recording station, carried by couriers. A disc lasts eight or ten plays.',
      hi: 'भाषण हमें एक अलग रिकॉर्डिंग स्टेशन से, घर पर काटे गए ग्रामोफ़ोन रिकॉर्ड पर मिलते हैं, जिन्हें हरकारे लाते हैं। एक रिकॉर्ड 8 या 10 बार ही चलता है।',
    },
    arrivesOnDay: 9,
  },
]
