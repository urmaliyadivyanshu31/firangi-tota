import type { Rule } from '../../types.js'

// The station's rulebook, from the record (spec "Rules from the record", dossier §4, §6–7).
// r-records explains the radio's "records" on day 1, so no message leans on jargon a newcomer lacks.
export const rules: Rule[] = [
  {
    id: 'r-onair',
    text: {
      en: 'We go on air at 8:45 pm, on 42.34 metres, “from somewhere in India”.',
      hi: 'हम रात 8:45 बजे, 42.34 मीटर पर, “हिंदुस्तान में कहीं से” बोलते हैं।',
    },
    arrivesOnDay: 1,
  },
  {
    id: 'r-nonames',
    text: {
      en: 'On air, never name our people or our places. Private notes may.',
      hi: 'रेडियो पर अपने लोगों या ठिकानों के नाम कभी नहीं। आपस की पर्चियों में चलेंगे।',
    },
    arrivesOnDay: 1,
  },
  {
    id: 'r-records',
    text: {
      en: 'Speeches come on gramophone records from our recording room; each lasts 8–10 plays.',
      hi: 'भाषण हमारे रिकॉर्डिंग वाले कमरे से ग्रामोफ़ोन रिकॉर्ड पर आते हैं; हर रिकॉर्ड 8-10 बार बजता है।',
    },
    arrivesOnDay: 1,
  },
  {
    id: 'r-confirm',
    text: {
      en: 'News we cannot confirm waits. We once held a story for a month.',
      hi: 'जो ख़बर पक्की न हो, वह रुकेगी। एक ख़बर हमने महीने भर रोकी थी।',
    },
    arrivesOnDay: 2,
  },
  {
    id: 'r-songs',
    text: {
      en: 'We open with “Sare Jahan Se Achcha” and close with “Vande Mataram”.',
      hi: 'हम “सारे जहाँ से अच्छा” से शुरू करते हैं और “वंदे मातरम्” पर ख़त्म।',
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
]
