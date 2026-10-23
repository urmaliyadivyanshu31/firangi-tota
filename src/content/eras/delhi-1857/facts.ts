import type { Fact } from '../../types'
import { fanshawe, jl, majumdar, mh, sen, trial, yule, CHUNI_17, CHUNI_18 } from './sources'

// The case file. Two lines are hardHidden: Hard mode blanks them, so only a history buff
// can use them.
export const facts: Fact[] = [
  {
    id: 'court',
    label: { en: 'The court', hi: 'दरबार' },
    value: {
      en: "King Bahadur Shah, pen-name Zafar. His 1857 coins call him 'Suraj-u-din, the brave'. His chief men are Hakim Ahsanullah Khan, his physician, and Nawab Mahbub Ali Khan. His chosen heir is Mirza Jawan Bakht.",
      hi: "बादशाह बहादुर शाह, जो 'ज़फ़र' नाम से शायरी करते हैं। 1857 के सिक्कों पर उनका शाही नाम 'सिराजुद्दीन, बहादुर' है। उनके ख़ास आदमी हैं उनके हकीम, हकीम अहसनुल्लाह ख़ान, और नवाब महबूब अली ख़ान। उनके चुने हुए वारिस मिर्ज़ा जवाँ बख़्त हैं।",
    },
    sources: [jl('pp.96-97'), mh('p.59'), sen('p.95')],
  },
  {
    id: 'commanders',
    label: { en: 'Army commands (from 18 May)', hi: 'फ़ौज की कमान (18 मई से)' },
    value: {
      en: 'Mirza Mughal is Commander-in-Chief. Mirza Khizr Sultan, Mirza Abu Bakr and Mirza Abdullah also hold chief commands.',
      hi: 'मिर्ज़ा मुग़ल कमांडर-इन-चीफ़ हैं। मिर्ज़ा ख़िज़्र सुल्तान, मिर्ज़ा अबू बक्र और मिर्ज़ा अब्दुल्ला के पास भी बड़ी कमानें हैं।',
    },
    sources: [jl('p.96'), trial(CHUNI_18)],
  },
  {
    id: 'regiments',
    label: { en: 'Regiments in the city', hi: 'शहर की पलटनें' },
    value: {
      en: 'From Meerut: the 3rd Light Cavalry and the 11th and 20th Native Infantry. From Delhi: the 38th, 54th and 74th Native Infantry.',
      hi: 'मेरठ से: तीसरी घुड़सवार पलटन (3rd लाइट कैवेलरी), और 11वीं व 20वीं पैदल पलटन। दिल्ली की: 38वीं, 54वीं और 74वीं पैदल पलटन।',
    },
    sources: [sen('pp.59-62'), mh('p.53')],
  },
  {
    id: 'gates',
    label: { en: 'Gates', hi: 'दरवाज़े' },
    value: {
      en: "North wall: Kashmiri and Mori Gates. West wall: Kabul, Lahore and Ajmeri Gates. South wall: Turkman and Delhi Gates. The Chandni Chowk runs from the city's Lahore Gate to the Fort's own Lahore Gate: two different gates. The road from Ballabhgarh comes in at the Delhi Gate.",
      hi: 'उत्तर की दीवार: कश्मीरी और मोरी दरवाज़े। पश्चिम की दीवार: काबुली, लाहौरी और अजमेरी दरवाज़े। दक्षिण की दीवार: तुर्कमान और दिल्ली दरवाज़े। चाँदनी चौक शहर के लाहौरी दरवाज़े से क़िले के अपने लाहौरी दरवाज़े तक जाता है: ये दो अलग दरवाज़े हैं। बल्लभगढ़ से आने वाली सड़क दिल्ली दरवाज़े पर पहुँचती है।',
    },
    sources: [fanshawe('pp.5-6'), mh('p.61'), trial('Petition No. 63, 22 May 1857, p.33')],
  },
  {
    id: 'money',
    label: { en: 'Money and pay', hi: 'पैसा और तनख़्वाह' },
    value: {
      en: "1 rupee = 16 annas; 1 anna = 4 pice. A gold mohur is worth about 15 to 16 rupees. The King's perwanahs promise any regiment that joins him Rs 30 a month for each foot soldier and Rs 50 for each trooper.",
      hi: '1 रुपया = 16 आने; 1 आना = 4 पैसे। सोने की एक मोहर लगभग 15 से 16 रुपये की होती है। बादशाह के परवाने आ मिलने वाली पलटन के हर पैदल सिपाही को 30 रुपये महीना और हर सवार को 50 रुपये महीना देने का वादा करते हैं।',
    },
    sources: [yule('s.v. Anna, p.31'), yule('s.v. Pice'), yule('s.v. Mohur, Gold, pp.573-74'), mh('p.60')],
  },
  {
    id: 'officials',
    label: { en: 'The English side', hi: 'अंग्रेज़ों की तरफ़' },
    value: {
      en: 'Lord Canning is Governor-General. Sir John Lawrence is Chief Commissioner of the Punjab, at Lahore. Mr. Colvin is Lieutenant-Governor of the North-Western Provinces, at Agra.',
      hi: 'लॉर्ड कैनिंग गवर्नर-जनरल हैं। सर जॉन लॉरेंस पंजाब के चीफ़ कमिश्नर हैं, लाहौर में। मिस्टर कॉल्विन उत्तर-पश्चिमी सूबों के लेफ़्टिनेंट-गवर्नर हैं, आगरा में।',
    },
    sources: [majumdar('p.71'), sen('pp.321-22'), mh('p.59')],
  },
  {
    id: 'calendar',
    label: { en: 'Calendar', hi: 'तारीख़ें' },
    value: {
      en: 'Your first day, 17 May 1857, is a Sunday. 24 May is the 29th of Ramzan: the Eid moon is seen that evening. Eid is on Monday 25 May.',
      hi: 'आपका पहला दिन, 17 मई 1857, रविवार है। 24 मई को रमज़ान की 29 तारीख़ है: उसी शाम ईद का चाँद दिखता है। ईद सोमवार 25 मई को है।',
    },
    sources: [jl('p.102'), trial('Petition No. 64, 24 May 1857, p.34'), trial(CHUNI_17)],
  },
  {
    id: 'may-11',
    hardHidden: true,
    label: { en: 'What happened on 11 May', hi: '11 मई को क्या हुआ' },
    value: {
      en: "Commissioner Simon Fraser was killed at the palace gate. Sir Theophilus Metcalfe (Jiwan Lal calls him 'Sir John') escaped, hid in a house in the suburbs three miles out, and got away to Jhajjar.",
      hi: "कमिश्नर साइमन फ़्रेज़र महल के दरवाज़े पर मारे गए। सर थियोफ़िलस मेटकाफ़ (जीवन लाल उन्हें 'सर जॉन' कहते हैं) बच निकले, शहर से तीन मील दूर बाहरी बस्ती के एक घर में छिपे, और फिर झज्जर पहुँच गए।",
    },
    sources: [jl('pp.80-81'), mh('pp.43-46, 57'), jl('p.95')],
  },
  {
    id: 'bakht-khan',
    hardHidden: true,
    label: { en: 'Bakht Khan', hi: 'बख़्त ख़ान' },
    value: {
      en: 'An artillery subahdar of the Bareilly brigade. He reaches Delhi only on 1-2 July 1857, and is made Commander-in-Chief then.',
      hi: 'बरेली ब्रिगेड के तोपख़ाने का एक सूबेदार। वह 1-2 जुलाई 1857 को ही दिल्ली पहुँचता है, और तभी कमांडर-इन-चीफ़ बनता है।',
    },
    sources: [jl('pp.133-35'), sen('pp.83-84')],
  },
  {
    id: 'english-force',
    hardHidden: true,
    label: { en: 'The English force', hi: 'अंग्रेज़ी फ़ौज' },
    value: {
      en: 'In May it is still gathering at Ambala, Karnal and Meerut. It takes the Ridge outside Delhi only on 8 June, after the battle of Badli-ki-Serai.',
      hi: 'मई में वह अभी अंबाला, करनाल और मेरठ में जमा हो रही है। दिल्ली के बाहर की रिज (पहाड़ी) पर वह 8 जून को ही क़ब्ज़ा करती है, बादली की सराय की लड़ाई के बाद।',
    },
    sources: [sen('p.79'), trial(CHUNI_17), jl('p.107')],
  },
]
