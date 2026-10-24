import type { Rule } from '../../types.js'

// The party's rules, from the record (dossier sections 3, 6 and 7):
// - Balraj signs the notices: the notices themselves; Yashpal, Simhavalokan.
// - The keys: Jai Gopal's evidence (Noorani, ch. 'Trial by Tribunal', pp. 141–142).
// - Never ask about a comrade's past: Ajoy Ghosh, Bhagat Singh and His Comrades (1945), pp. 34–35.
// - "Action", not "outrage": the notice of 23 December 1928; the government's word was "outrage".
// - Pink paper, printed heading: Irwin to the Secretary of State, 19 April 1929 (Noorani, p. 45).
// - Party names: the Ordinance schedule of 1930 lists the comrades' aliases.
// - The weekday: 2 April 1929 was a Tuesday (the calendar), so were the 9th and 16th; a note's weekday must match its date.
export const rules: Rule[] = [
  {
    id: 'r-weekday',
    text: {
      en: 'Weekday and date must agree: 2, 9, 16 April 1929 are each a Tuesday.',
      hi: 'वार और तारीख़ मेल खाने चाहिए: 2, 9 और 16 अप्रैल 1929, तीनों मंगलवार हैं।',
    },
    arrivesOnDay: 1,
  },
  {
    id: 'r-balraj',
    text: {
      en: "Notices are signed 'Balraj', the Commander-in-Chief.",
      hi: "नोटिसों पर 'बलराज' के दस्तख़त होते हैं, जो कमांडर-इन-चीफ़ हैं।",
    },
    arrivesOnDay: 1,
  },
  {
    id: 'r-keys',
    text: {
      en: 'A parcel goes only to whoever shows the keys.',
      hi: 'सामान सिर्फ़ उसी को मिलता है जो चाबियाँ दिखाए।',
    },
    arrivesOnDay: 1,
  },
  {
    id: 'r-past',
    text: {
      en: 'Never ask a comrade about his past, real name or family.',
      hi: 'किसी साथी से उसकी पिछली ज़िंदगी, असली नाम या परिवार के बारे में मत पूछो।',
    },
    arrivesOnDay: 2,
  },
  {
    id: 'r-police-words',
    text: {
      en: "Comrades say 'action'. 'Outrage', 'miscreants', 'absconders' are police words.",
      hi: "साथी 'कार्रवाई' कहते हैं। 'वारदात', 'बदमाश', 'फ़रार' पुलिस के शब्द हैं।",
    },
    arrivesOnDay: 3,
  },
  {
    id: 'r-pink',
    text: {
      en: "Real notices are pink, with a printed heading 'Hindustan Socialist Republican Army'.",
      hi: "असली नोटिस गुलाबी होते हैं, ऊपर छपी हेडिंग 'हिंदुस्तान सोशलिस्ट रिपब्लिकन आर्मी' के साथ।",
    },
    arrivesOnDay: 5,
  },
  {
    id: 'r-party-names',
    text: {
      en: 'Comrades sign with party names or initials, never full real names.',
      hi: 'साथी पार्टी के नाम या पहले अक्षरों से दस्तख़त करते हैं, पूरे असली नाम से कभी नहीं।',
    },
    arrivesOnDay: 7,
  },
]
