import type { Epilogue } from '../../types.js'

// Dossier sections 2c, 4, 8 and 12. No gore; the hanging is "evening", as the dossier
// advises, because the hour is disputed. Gandhi's part: his repeated appeals, and the debate.
// caught[0] is the one consequence line on the caught screen; it must fit any mistake
// (a passed forgery, a rejected genuine note, or too slow). caught[1] sits behind a tap.
export const epilogue: Epilogue = {
  survived: [
    {
      en: 'Bhagat Singh and Dutt got life for the bombs. On hunger strike in jail, Jatin Das died on 13 September 1929. Seven comrades turned approver.',
      hi: 'बम के लिए भगत सिंह और दत्त को उम्रक़ैद हुई। जेल में भूख हड़ताल के दौरान 13 सितंबर 1929 को जतिन दास की मौत हो गई। सात साथी सरकारी गवाह बन गए।',
    },
    {
      en: 'In October 1930 a tribunal sentenced Bhagat Singh, Sukhdev and Rajguru to death. On 27 February 1931 Azad died, cornered by police in Allahabad.',
      hi: 'अक्टूबर 1930 में एक ट्रिब्यूनल ने भगत सिंह, सुखदेव और राजगुरु को फाँसी की सज़ा दी। 27 फ़रवरी 1931 को इलाहाबाद में पुलिस से घिरकर आज़ाद की मौत हुई।',
    },
    {
      en: 'They were hanged on the evening of 23 March 1931, a day before the announced date. Gandhi appealed repeatedly, last that morning; historians argue whether he did enough.',
      hi: 'तीनों को 23 मार्च 1931 की शाम फाँसी दी गई, घोषित तारीख़ से एक दिन पहले। गांधी ने कई बार अपील की, आख़िरी बार उसी सुबह; इतिहासकार आज भी बहस करते हैं कि क्या उन्होंने काफ़ी किया।',
    },
  ],
  caught: [
    {
      en: 'Picked up in the CID round-ups, you join the accused in Lahore jail.',
      hi: 'सीआईडी की धर-पकड़ में तुम भी पकड़े जाते हो, और आरोपियों के साथ लाहौर जेल पहुँचते हो।',
    },
    {
      en: "The case grew to 24 accused, with about 600 witnesses planned. Seven comrades took pardons; Ajoy Ghosh wrote they were 'unable to stand police torture'.",
      hi: "केस में 24 आरोपी हुए, और करीब 600 गवाह पेश करने की तैयारी थी। सात साथियों ने माफ़ी ली; अजय घोष ने लिखा कि वे 'पुलिस की यातना सह नहीं पाए'।",
    },
  ],
  sources: [
    { id: 'bs-joint-statement' },
    {
      id: 'noorani-1996',
      loc: "chs. 'Bombs in the Central Assembly' (pp. 43–46), 'Hour of Trial', 'The Magisterial Farce' (pp. 101–119), 'Trial by Tribunal' (pp. 146–147), 'The Execution' (pp. 227–228), \"Gandhi's Truth\" (pp. 239–253)",
    },
    { id: 'chaman-lal-reader', loc: 'chronology; appendix (Ordinance statement); last letter, 22 March 1931' },
    { id: 'gandhi-irwin-1931' },
    { id: 'menon-2009' },
    { id: 'davar-2016' },
    { id: 'pti-2018' },
    { id: 'dutt-tribune-2005' },
    { id: 'gupta-1972', loc: 'pp. 139–143' },
  ],
}
