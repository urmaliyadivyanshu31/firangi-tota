import type { Rule } from '../../types.js'

// The party's rules, from the record (dossier sections 3, 6 and 7):
// - Balraj signs the notices: the notices themselves; Yashpal, Simhavalokan.
// - The keys: Jai Gopal's evidence (Noorani, ch. 'Trial by Tribunal', pp. 141–142).
// - Never ask about a comrade's past: Ajoy Ghosh, Bhagat Singh and His Comrades (1945).
// - "Action", not "outrage": the notice of 23 December 1928; the government's word was "outrage".
// - Pink paper, printed heading: Irwin to the Secretary of State, 19 April 1929 (Noorani, p. 45).
// - Party names: the Ordinance schedule of 1930 lists the comrades' aliases.
export const rules: Rule[] = [
  {
    id: 'r-balraj',
    text: {
      en: "Party notices are signed by 'Balraj', the Commander-in-Chief. No one else signs them.",
      hi: "पार्टी के नोटिसों पर 'बलराज' के दस्तख़त होते हैं, जो कमांडर-इन-चीफ़ (सेनापति) हैं। कोई और इन पर दस्तख़त नहीं करता।",
    },
    arrivesOnDay: 1,
  },
  {
    id: 'r-keys',
    text: {
      en: 'A parcel goes only to the person who shows the keys. No keys, no parcel, whatever the note says.',
      hi: 'सामान सिर्फ़ उसी को मिलता है जो चाबियाँ दिखाए। चाबी नहीं, तो सामान नहीं, पर्चे में चाहे जो लिखा हो।',
    },
    arrivesOnDay: 1,
  },
  {
    id: 'r-past',
    text: {
      en: 'Never ask a comrade about his past: his real name, his village, his family. Only the police want those.',
      hi: 'किसी साथी से उसकी पिछली ज़िंदगी के बारे में कभी मत पूछो: असली नाम, गाँव, परिवार। ये बातें सिर्फ़ पुलिस को चाहिए।',
    },
    arrivesOnDay: 2,
  },
  {
    id: 'r-police-words',
    text: {
      en: "Comrades call what they do an 'action'. Words like 'outrage', 'miscreants' and 'absconders' are police talk.",
      hi: "साथी अपने काम को 'कार्रवाई' कहते हैं। 'वारदात', 'बदमाश' और 'फ़रार' जैसे शब्द पुलिस की ज़बान हैं।",
    },
    arrivesOnDay: 3,
  },
  {
    id: 'r-pink',
    text: {
      en: "Real notices and leaflets are pink, with the heading 'The Hindustan Socialist Republican Army' printed at the top, and they end 'Long Live Revolution'.",
      hi: "असली नोटिस और पर्चे गुलाबी होते हैं, ऊपर 'हिंदुस्तान सोशलिस्ट रिपब्लिकन आर्मी' की हेडिंग छपी होती है, और आख़िर में 'इंक़लाब ज़िंदाबाद' लिखा होता है।",
    },
    arrivesOnDay: 5,
  },
  {
    id: 'r-party-names',
    text: {
      en: 'Comrades sign with party names or initials, never with their full real names.',
      hi: 'साथी पार्टी के नाम या नाम के पहले अक्षरों से दस्तख़त करते हैं, अपने पूरे असली नाम से कभी नहीं।',
    },
    arrivesOnDay: 7,
  },
]
