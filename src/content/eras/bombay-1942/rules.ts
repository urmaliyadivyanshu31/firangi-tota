import type { Rule } from '../../types'

// The station's rulebook, from the record (spec "Rules from the record", dossier §6–7).
export const rules: Rule[] = [
  {
    id: 'r-onair',
    text: {
      en: 'On air at 8:45 pm, on 42.34 metres, “from somewhere in India”.',
      hi: 'रात 8:45 बजे, 42.34 मीटर पर, “हिंदुस्तान में कहीं से”।',
    },
    arrivesOnDay: 1,
  },
  {
    id: 'r-nonames',
    text: {
      en: 'On air, never talk of the persons behind the stations. Notes may name them.',
      hi: 'रेडियो पर स्टेशन के पीछे के लोगों की बात कभी नहीं। आपस की पर्चियों में नाम चल सकते हैं।',
    },
    arrivesOnDay: 1,
  },
  {
    id: 'r-confirm',
    text: {
      en: 'Hold back any report we cannot confirm; we held the Meerut story a month.',
      hi: 'जो ख़बर पक्की न हो, रोक लीजिए; मेरठ की ख़बर हमने महीने भर रोकी।',
    },
    arrivesOnDay: 2,
  },
  {
    id: 'r-wartime',
    text: {
      en: 'From 1 September, Indian Standard Time is 6½ hours ahead of Greenwich.',
      hi: '1 सितंबर से इंडियन स्टैंडर्ड टाइम ग्रीनविच से साढ़े छह घंटे आगे है।',
    },
    arrivesOnDay: 3,
  },
  {
    id: 'r-words',
    text: {
      en: 'We say Gandhiji or Bapu. “Mr. Gandhi” and “the disturbances” are government words.',
      hi: 'हम गांधीजी या बापू कहते हैं। “मिस्टर गांधी” और “गड़बड़ियाँ” सरकारी शब्द हैं।',
    },
    arrivesOnDay: 5,
  },
  {
    id: 'r-axis',
    text: {
      en: 'We never speak for Germany or Japan. India has no enmity for any people.',
      hi: 'हम जर्मनी या जापान की तरफ़ से कभी नहीं बोलते। भारत की किसी से दुश्मनी नहीं।',
    },
    arrivesOnDay: 7,
  },
  {
    id: 'r-discs',
    text: {
      en: 'Talks come on home-cut gramophone discs, good for eight or ten plays. No tape.',
      hi: 'भाषण घर पर काटे ग्रामोफ़ोन रिकॉर्ड पर आते हैं, 8 या 10 बार चलने लायक़। टेप नहीं।',
    },
    arrivesOnDay: 9,
  },
]
