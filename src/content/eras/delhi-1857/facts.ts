import type { Fact } from '../../types.js'
import { caveBrowne, fanshawe, hodson, jl, majumdar, mh, sen, trial, yule, CHUNI_17, CHUNI_18, JATMALL_CHAPATI, METCALFE_CHAPATI } from './sources.js'

// The case file, in story order: the court and how the rising came (para 1), the city and its money
// (para 2), what lies ahead (para 3). Each story says its value and nothing more; the checkable words
// sit in [[ ]]. Every line is readable in every mode it is in (owner 10-24: every check is in the file).
// The calendar now lives in the weekdays rule, and the titles (Canning, Governor-General) in the
// english-titles rule.
// The case file grows with the mode (owner 10-24): lines marked minMode 'medium' join in Medium and
// Hard, lines marked 'hard' in Hard only. Every new line was read against its source's full text
// (archive.org links in sources.ts): Jiwan Lal's diary for 17-30 May, Sen, Mainodin, Hodson's letters.
export const facts: Fact[] = [
  {
    // Suraj-u-din is how Jiwan Lal's copy of the coin reads (the genuine coins message quotes it).
    id: 'court',
    para: 1,
    label: { en: 'The King', hi: 'बादशाह' },
    value: { en: 'Bahadur Shah Zafar; coins: Siraj-ud-din (Suraj-u-din)', hi: 'बहादुर शाह ज़फ़र; सिक्कों पर: सिराजुद्दीन' },
    story: {
      en: 'You serve the King, [[Bahadur Shah Zafar]]; his coins name him [[Siraj-ud-din]], also spelt [[Suraj-u-din]].',
      hi: 'आप बादशाह [[बहादुर शाह ज़फ़र]] की सेवा में हैं; उनके सिक्कों पर उनका नाम [[सिराजुद्दीन]] लिखा है।',
    },
    sources: [jl('pp.96-97'), mh('p.59'), sen('p.95')],
  },
  {
    id: 'commanders',
    para: 1,
    label: { en: 'Commander-in-Chief', hi: 'कमांडर-इन-चीफ़' },
    value: { en: 'Mirza Mughal, from 18 May', hi: 'मिर्ज़ा मुग़ल, 18 मई से' },
    story: {
      en: 'From [[18 May]], the Commander-in-Chief is [[Mirza Mughal]].',
      hi: '[[18 मई]] से कमांडर-इन-चीफ़ हैं [[मिर्ज़ा मुग़ल]]।',
    },
    sources: [jl('p.96'), trial(CHUNI_18)],
  },
  {
    // JL p.96, 18 May: "(1) Mirza Mogul; (2) Mirza Kizr Sultan; (3) Mirza Abu Bakr; (4) Mirza Abdullah."
    id: 'princes',
    para: 1,
    minMode: 'medium',
    label: { en: 'Princes, 18 May', hi: 'शहज़ादे, 18 मई' },
    value: { en: 'Khizr Sultan, Abu Bakr, Abdullah', hi: 'ख़िज़्र सुल्तान, अबू बक्र, अब्दुल्लाह' },
    story: {
      en: 'On 18 May the princes [[Khizr Sultan]], [[Abu Bakr]] and [[Abdullah]] get commands too.',
      hi: '18 मई को शहज़ादे [[ख़िज़्र सुल्तान]], [[अबू बक्र]] और [[अब्दुल्लाह]] को भी कमान मिलती है।',
    },
    sources: [jl('p.96'), sen('p.74')],
  },
  {
    // JL pp.91-92 (15 May, the sepoys accuse him of writing to the English), pp.98-99 (20 May, his
    // device to send the soldiers towards Meerut), p.103 (26 May, the King shields him); Chuni Lal,
    // 17 May: the King tells the soldiers to trust him. "Hakim" is the physician's title.
    id: 'ahsanullah',
    para: 1,
    minMode: 'medium',
    label: { en: 'The physician', hi: 'शाही हकीम' },
    value: { en: 'Hakim Ahsanullah Khan', hi: 'हकीम अहसनुल्लाह ख़ान' },
    story: {
      en: "The King's physician and adviser is [[Hakim Ahsanullah Khan]].",
      hi: 'बादशाह के हकीम और सलाहकार हैं [[हकीम अहसनुल्लाह ख़ान]]।',
    },
    sources: [jl('pp.91-92'), jl('pp.98-99'), jl('p.103'), trial(CHUNI_17)],
  },
  {
    // Sen p.69: "a minor son, Jawan Bakht, the child of his old age by his favourite queen, Zinat Mahal".
    id: 'zinat-mahal',
    para: 1,
    minMode: 'medium',
    label: { en: 'The Queen', hi: 'मलिका' },
    value: { en: 'Zinat Mahal, mother of Jawan Bakht', hi: 'ज़ीनत महल, जवाँ बख़्त की माँ' },
    story: {
      en: "The King's favourite queen is [[Zinat Mahal]], mother of his young son [[Jawan Bakht]].",
      hi: 'बादशाह की चहेती मलिका [[ज़ीनत महल]] हैं, उनके छोटे बेटे [[जवाँ बख़्त]] की माँ।',
    },
    sources: [sen('p.69')],
  },
  {
    // JL p.95, 17 May: "The mutineers this day elected Abu Bakr as their King in place of the old King".
    // Sen p.85 calls him "the King's grandson".
    id: 'abu-bakr-king',
    para: 1,
    minMode: 'hard',
    label: { en: "Soldiers' king", hi: 'सिपाहियों का बादशाह' },
    value: { en: 'Abu Bakr, 17 May', hi: 'अबू बक्र, 17 मई' },
    story: {
      en: "On [[17 May]] the soldiers 'elect' the King's grandson [[Abu Bakr]] as their king.",
      hi: "[[17 मई]] को सिपाही बादशाह के पोते [[अबू बक्र]] को अपना बादशाह 'चुन' लेते हैं।",
    },
    sources: [jl('p.95'), sen('p.85')],
  },
  {
    id: 'regiments',
    para: 1,
    label: { en: 'Regiments', hi: 'पलटनें' },
    value: { en: '3rd Light Cavalry; Native Infantry 11/20/38/54/74', hi: 'तीसरी घुड़सवार; पैदल 11/20/38/54/74' },
    story: {
      en: "The sepoys' regiments are the [[3rd Light Cavalry]], on horse, and the [[11th, 20th, 38th, 54th and 74th Native Infantry]], on foot.",
      hi: 'सिपाहियों की पलटनें ये हैं: घोड़ों पर [[तीसरी घुड़सवार]], और पैदल [[11वीं, 20वीं, 38वीं, 54वीं और 74वीं]]।',
    },
    sources: [sen('pp.59-62'), mh('p.53')],
  },
  {
    // MH pp.39-40: each village was told to bake five and pass them on; "neither its origin, nor its
    // intention, were known". At the trial Jat Mall heard of no message with them, and Metcalfe said
    // "There is nothing but conjecture regarding them". Majumdar pp.202-03: more than a dozen readings.
    id: 'chapatis',
    para: 1,
    minMode: 'hard',
    label: { en: 'Chapatis, February', hi: 'रोटियाँ, फ़रवरी' },
    value: { en: 'Passed village to village; meaning unknown', hi: 'गाँव-गाँव पहुँचीं; मतलब किसी को पता नहीं' },
    story: {
      en: 'In February chapatis passed from [[village to village]]; their [[meaning]] was [[unknown]] to all.',
      hi: 'फ़रवरी में रोटियाँ [[गाँव-गाँव]] पहुँचीं; उनका [[मतलब]] किसी को [[पता नहीं]] था।',
    },
    sources: [mh('pp.39-40'), trial(JATMALL_CHAPATI), trial(METCALFE_CHAPATI), majumdar('pp.202-03')],
  },
  {
    // Mangal Pandey's attack at Barrackpore was on 29 March (Sen pp.49-50; Majumdar pp.46-47); he was
    // hanged on 8 April (Cave-Browne I p.21; Kaye I, 9th ed., p.548).
    id: 'pandey',
    para: 1,
    minMode: 'medium',
    label: { en: 'Mangal Pandey', hi: 'मंगल पांडे' },
    value: { en: '34th; hanged at Barrackpore, 8 April', hi: '34वीं; बैरकपुर में फाँसी, 8 अप्रैल' },
    story: {
      en: 'Mangal Pandey of the [[34th]] was hanged at [[Barrackpore]] on [[8 April]].',
      hi: '[[34वीं]] पलटन के मंगल पांडे को [[8 अप्रैल]] को [[बैरकपुर]] में फाँसी दी गई।',
    },
    sources: [sen('pp.49-50'), majumdar('pp.46-47'), caveBrowne('p.21'), { id: 'kaye-1880', loc: 'p.548' }],
  },
  {
    // Meerut rose on the evening of Sunday 10 May (Sen pp.58-60); the riders reached Delhi on the
    // morning of 11 May (Sen p.70; JL pp.75-79).
    id: 'meerut',
    para: 1,
    label: { en: 'Meerut rising', hi: 'मेरठ की बग़ावत' },
    value: { en: 'Sunday 10 May; Delhi, 11 May', hi: 'रविवार 10 मई; दिल्ली, 11 मई' },
    story: {
      en: 'The rising began at Meerut on [[Sunday 10 May]] and reached [[Delhi]] on [[11 May]].',
      hi: 'बग़ावत [[रविवार 10 मई]] को मेरठ में शुरू हुई और [[11 मई]] को [[दिल्ली]] पहुँची।',
    },
    sources: [sen('pp.57-60'), sen('p.70'), jl('pp.75-79')],
  },
  {
    // Sen p.73: nine Englishmen held it; "surrender was demanded in the King's name"; the train was fired.
    id: 'magazine',
    para: 1,
    minMode: 'medium',
    label: { en: 'Magazine, 11 May', hi: 'बारूदख़ाना, 11 मई' },
    value: { en: 'Blown up by nine Englishmen', hi: 'नौ अंग्रेज़ों ने उड़ा दिया' },
    story: {
      en: 'On 11 May the Magazine was [[blown up]] by its [[nine]] [[Englishmen]] rather than handed over.',
      hi: '11 मई को बारूदख़ाने के [[नौ]] [[अंग्रेज़ों]] ने उसे सौंपने के बजाय [[उड़ा दिया]]।',
    },
    sources: [sen('p.73')],
  },
  {
    // Sen p.74: two young signallers in the Delhi telegraph office wired the news to Ambala; from
    // there it reached the Punjab (Lahore had it on the morning of 12 May, Sen p.327).
    id: 'telegraph',
    para: 1,
    minMode: 'hard',
    label: { en: 'Telegraph, 11 May', hi: 'तार, 11 मई' },
    value: { en: 'Signallers wire Ambala and the Punjab', hi: 'तारबाबू अंबाला और पंजाब को तार देते हैं' },
    story: {
      en: 'On 11 May [[two young signallers]] wire the news of Delhi to [[Ambala]] and the [[Punjab]].',
      hi: '11 मई को [[दो नौजवान तारबाबू]] दिल्ली की ख़बर [[अंबाला]] और [[पंजाब]] तक तार से भेज देते हैं।',
    },
    sources: [sen('p.74'), sen('p.327')],
  },
  {
    id: 'lahore-gates',
    para: 2,
    label: { en: 'Lahore Gates', hi: 'लाहौरी दरवाज़े' },
    value: { en: "Two: city's (west), Fort's (east)", hi: 'दो: शहर का (पश्चिम), क़िले का (पूरब)' },
    story: {
      en: "Delhi has [[two]] Lahore Gates: the [[city's]] to the [[west]], the [[Fort's]] to the [[east]].",
      hi: 'दिल्ली में [[दो]] लाहौरी दरवाज़े हैं: [[शहर का पश्चिम में]], और [[क़िले का पूरब में]]।',
    },
    sources: [fanshawe('pp.5-6'), fanshawe('p.53'), mh('p.61')],
  },
  {
    id: 'ballabhgarh-road',
    para: 2,
    label: { en: 'Ballabhgarh road', hi: 'बल्लभगढ़ की सड़क' },
    value: { en: 'Enters at the Delhi Gate (south)', hi: 'दक्षिण के दिल्ली दरवाज़े पर' },
    story: {
      en: 'The road from Ballabhgarh enters at the [[Delhi Gate]], in the [[south]].',
      hi: 'बल्लभगढ़ की सड़क [[दक्षिण]] के [[दिल्ली दरवाज़े]] से शहर में आती है।',
    },
    sources: [trial('Petition No. 63, 22 May 1857, p.33'), fanshawe('pp.5-6')],
  },
  {
    // JL p.100, 21 May: "Rajah Nahar Sing of Bulubgarh had made himself master of the country as far as
    // Palwal". Petition No. 64 (24 May) is his, "Chief of Ballabhgarh", under his seal.
    id: 'nahar-singh',
    para: 2,
    minMode: 'medium',
    label: { en: "Ballabhgarh's chief", hi: 'बल्लभगढ़ के सरदार' },
    value: { en: 'Raja Nahar Singh, master to Palwal', hi: 'राजा नाहर सिंह, पलवल तक मालिक' },
    story: {
      en: "Ballabhgarh's chief is [[Raja Nahar Singh]], master of the country as far as [[Palwal]].",
      hi: 'बल्लभगढ़ के सरदार [[राजा नाहर सिंह]] हैं, जो [[पलवल]] तक के इलाक़े के मालिक हैं।',
    },
    sources: [jl('p.100'), trial('Petition No. 64, dated 24 May 1857, p.34')],
  },
  {
    id: 'money',
    para: 2,
    label: { en: 'Money', hi: 'पैसा' },
    value: { en: '16 annas make one rupee', hi: '16 आने का एक रुपया' },
    story: {
      en: 'Count money with care: [[16 annas]] make [[one rupee]], so a sum never shows [[16 annas]] or more.',
      hi: 'पैसे ध्यान से गिनिए: [[16 आने]] का [[एक रुपया]] होता है, इसलिए किसी रक़म में [[16 या ज़्यादा आने]] नहीं लिखे जाते।',
    },
    sources: [yule('s.v. Anna, p.31'), yule('s.v. Pice'), yule('s.v. Mohur, Gold, pp.573-74')],
  },
  {
    // JL p.100, 21 May: the mutineers "were buying gold mohurs at 32 rupees apiece".
    id: 'gold-mohur',
    para: 2,
    minMode: 'medium',
    label: { en: 'Gold mohur', hi: 'सोने की मोहर' },
    value: { en: '32 rupees each, 21 May', hi: '32 रुपये की एक, 21 मई' },
    story: {
      en: 'On [[21 May]] the soldiers are buying gold mohurs at [[32 rupees]] each.',
      hi: '[[21 मई]] को सिपाही सोने की एक मोहर [[32 रुपये]] में ख़रीद रहे हैं।',
    },
    sources: [jl('p.100')],
  },
  {
    // JL p.99, 21 May: "the newly appointed officers and city bankers raised one lakh of rupees for the
    // payment of the troops".
    id: 'pay-fund',
    para: 2,
    minMode: 'medium',
    label: { en: 'Pay fund', hi: 'तनख़्वाह का पैसा' },
    value: { en: 'One lakh rupees, 21 May', hi: 'एक लाख रुपये, 21 मई' },
    story: {
      en: "On [[21 May]] the new officers and the city's bankers raise [[one lakh]] rupees for the troops' pay.",
      hi: '[[21 मई]] को नए अफ़सर और शहर के साहूकार फ़ौज की तनख़्वाह के लिए [[एक लाख]] रुपये जुटाते हैं।',
    },
    sources: [jl('p.99')],
  },
  {
    // JL p.104, 28 May: "The treasure, Rs. 175,000, brought from the Rohtak Treasury, was examined. Many
    // of the bags were found to contain pice."
    id: 'rohtak',
    para: 2,
    minMode: 'hard',
    label: { en: 'Rohtak treasure', hi: 'रोहतक का ख़ज़ाना' },
    value: { en: 'Rs 175,000; many bags of pice', hi: '1,75,000 रुपये; कई थैलियों में पैसे' },
    story: {
      en: 'The Rohtak treasure, [[Rs 175,000]], turns out to be many bags of mere [[pice]].',
      hi: 'रोहतक का ख़ज़ाना, [[1,75,000 रुपये]], खुला तो कई थैलियों में बस [[पैसे]] निकले।',
    },
    sources: [jl('p.104'), yule('s.v. Pice')],
  },
  {
    // MH p.60: the King's orders promised these sums to regiments that came over (see pay-real).
    id: 'pay',
    para: 2,
    label: { en: 'Pay promised', hi: 'वादे की तनख़्वाह' },
    value: { en: 'Foot soldier Rs 30, horseman 50', hi: 'पैदल 30 रुपये, सवार 50 रुपये' },
    story: {
      en: 'Any regiment that joins is promised [[30 rupees]] for each [[foot soldier]] and [[50]] for each [[horseman]].',
      hi: 'आ मिलने वाली पलटनों से वादा है: हर [[पैदल]] सिपाही को [[30 रुपये]], हर [[सवार]] को [[50 रुपये]]।',
    },
    sources: [mh('p.60')],
  },
  {
    id: 'english-force',
    para: 3,
    label: { en: 'English army, Ambala', hi: 'अंग्रेज़ी फ़ौज, अंबाला' },
    value: { en: 'Takes the Ridge on 8 June', hi: 'रिज पर 8 जून को क़ब्ज़ा' },
    story: {
      en: 'Ahead, the English army marches from Ambala and takes the [[Ridge]] on [[8 June]].',
      hi: 'आगे, अंग्रेज़ी फ़ौज अंबाला से चलकर [[8 जून]] को [[रिज]] पर क़ब्ज़ा करती है।',
    },
    sources: [sen('p.77'), sen('p.79'), trial(CHUNI_17), jl('pp.107-08')],
  },
  {
    id: 'bakht-khan',
    para: 3,
    label: { en: 'Bakht Khan', hi: 'बख़्त ख़ान' },
    value: { en: 'Reaches Delhi 1-2 July', hi: '1-2 जुलाई को दिल्ली पहुँचते हैं' },
    story: {
      en: 'Bakht Khan reaches [[Delhi]] only on [[1-2 July]].',
      hi: 'बख़्त ख़ान [[1-2 जुलाई]] को जाकर [[दिल्ली]] पहुँचते हैं।',
    },
    sources: [jl('pp.133-35'), sen('pp.83-84')],
  },
  {
    // JL p.97, 19 May: "Information received that the Maharajah of Patiala had joined the English with
    // his army". Cave-Browne I p.190: encamped near Ambala within eighteen hours of the call.
    id: 'patiala-side',
    para: 3,
    minMode: 'medium',
    label: { en: 'Patiala', hi: 'पटियाला' },
    value: { en: 'Joined the English; news 19 May', hi: 'अंग्रेज़ों से जा मिला; ख़बर 19 मई' },
    story: {
      en: 'On [[19 May]] news comes that [[Patiala]] has [[joined]] the [[English]].',
      hi: '[[19 मई]] को ख़बर आती है कि [[पटियाला]] [[अंग्रेज़ों]] से [[जा मिला]] है।',
    },
    sources: [jl('p.97'), caveBrowne('p.190')],
  },
  {
    // Sen p.179: Henry Lawrence, Chief Commissioner of Oudh from March 1857, at Lucknow (pp.182-83).
    // Sen p.327: Sir John Lawrence, Chief Commissioner of the Punjab, at Rawalpindi.
    id: 'lawrences',
    para: 3,
    minMode: 'medium',
    label: { en: 'The Lawrences', hi: 'दो लॉरेंस' },
    value: { en: 'Henry: Oudh; John: the Punjab', hi: 'हेनरी: अवध; जॉन: पंजाब' },
    story: {
      en: 'The Lawrences are chief commissioners: [[Henry]] of [[Oudh]], and [[John]] of the [[Punjab]].',
      hi: 'दोनों लॉरेंस चीफ़ कमिश्नर हैं: [[हेनरी]] [[अवध]] के, और [[जॉन]] [[पंजाब]] के।',
    },
    sources: [sen('p.179'), sen('pp.182-83'), sen('p.327')],
  },
  {
    // Kanpur rose late on 4 June; till then Nana Sahib guarded the treasury for the English (Sen
    // pp.131-33, p.136). Jhansi's sepoys rose on 5 June (Sen pp.270-71).
    id: 'kanpur-jhansi',
    para: 3,
    minMode: 'medium',
    label: { en: 'Kanpur and Jhansi', hi: 'कानपुर और झाँसी' },
    value: { en: 'Kanpur 4 June; Jhansi 5 June', hi: 'कानपुर 4 जून; झाँसी 5 जून' },
    story: {
      en: 'Ahead, [[Kanpur]] rises only on [[4 June]], and [[Jhansi]] on [[5 June]].',
      hi: 'आगे, [[कानपुर]] [[4 जून]] को जाकर उठता है, और [[झाँसी]] [[5 जून]] को।',
    },
    sources: [sen('pp.131-33'), sen('p.136'), sen('pp.270-71')],
  },
  {
    // Hodson's letters, pp.234-36: he set out on 20 May with "a party of the Jheend Horse" and on
    // 24 May wrote "I returned from my expedition to Meerut late last night". Sen p.78.
    id: 'hodson-ride',
    para: 3,
    minMode: 'hard',
    label: { en: "Hodson's ride", hi: 'हॉडसन की सवारी' },
    value: { en: 'Karnal–Meerut and back, 20-23 May', hi: 'करनाल–मेरठ और वापस, 20-23 मई' },
    story: {
      en: 'Ahead, Hodson rides from [[Karnal]] to [[Meerut]] and [[back]], [[20-23 May]].',
      hi: 'आगे, हॉडसन [[20-23 मई]] को [[करनाल]] से [[मेरठ]] जाकर [[लौट आता]] है।',
    },
    sources: [hodson('pp.234-36'), sen('p.78')],
  },
  {
    // Sen p.78: "On the 27th May, Anson, ill and worried, died of cholera".
    id: 'anson',
    para: 3,
    minMode: 'hard',
    label: { en: 'General Anson', hi: 'जनरल एन्सन' },
    value: { en: 'Dies of cholera, 27 May', hi: '27 मई को हैज़े से मौत' },
    story: {
      en: 'Ahead, [[General Anson]] dies of [[cholera]] on [[27 May]].',
      hi: 'आगे, अंग्रेज़ों के कमांडर [[जनरल एन्सन]] [[27 मई]] को [[हैज़े]] से मर जाते हैं।',
    },
    sources: [sen('p.78')],
  },
  {
    // Sen p.331: Colonel Nicholson, Deputy Commissioner of Peshawar; p.333: with Chute at Mardan, 24-25 May;
    // p.97: "on the 7th [August] John Nicholson rode to the camp in advance of his column".
    id: 'nicholson',
    para: 3,
    minMode: 'hard',
    label: { en: 'John Nicholson', hi: 'जॉन निकोलसन' },
    value: { en: 'At Peshawar; Delhi only in August', hi: 'पेशावर में; दिल्ली अगस्त में ही' },
    story: {
      en: 'Ahead, [[John Nicholson]] is at [[Peshawar]]; he reaches [[Delhi]] only in [[August]].',
      hi: 'आगे, [[जॉन निकोलसन]] [[पेशावर]] में हैं; [[दिल्ली]] वे [[अगस्त]] में ही पहुँचते हैं।',
    },
    sources: [sen('p.331'), sen('p.333'), sen('p.97')],
  },
]
