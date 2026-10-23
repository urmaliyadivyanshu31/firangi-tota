import type { Fact } from '../../types.js'

// The announcer-operator's case file (dossier §4): one short line each. Three are hardHidden.
// The wavelength (42.34 m) and the air time (8:45 pm) live in the rulebook and on the paper's header.
export const facts: Fact[] = [
  {
    id: 'f-aicc',
    label: { en: 'Resolution', hi: 'प्रस्ताव' },
    value: { en: 'Gowalia Tank, 8 Aug; 13 against', hi: 'गोवालिया टैंक, 8 अगस्त; 13 विरोध में' },
    sources: [
      { id: 'iar-1942', loc: 'AICC proceedings; Chronicle p. 17' },
      { id: 'gandhi-1942' },
      { id: 'goi-1943', loc: 'App. X' },
    ],
  },
  {
    id: 'f-zero-hour',
    label: { en: 'Arrests', hi: 'गिरफ़्तारियाँ' },
    value: { en: '5 am, Sunday 9 August', hi: 'रविवार 9 अगस्त, सुबह 5 बजे' },
    sources: [{ id: 'top-ii-1971', loc: 'No. 624, pp. 806–7' }],
  },
  {
    id: 'f-flag',
    label: { en: 'Flag, 9 August', hi: 'झंडा, 9 अगस्त' },
    value: { en: 'Raised by Aruna Asaf Ali', hi: 'अरुणा आसफ़ अली ने फहराया' },
    sources: [{ id: 'rebel-india-1946', loc: 'Bombay section' }],
  },
  {
    id: 'f-train',
    label: { en: 'Gandhiji’s train', hi: 'गांधीजी की ट्रेन' },
    value: { en: 'Off at Chinchwad, short of Poona', hi: 'पूना से पहले, चिंचवड़ में उतारे गए' },
    sources: [{ id: 'top-ii-1971', loc: 'No. 624, p. 807' }],
  },
  {
    id: 'f-detention',
    label: { en: 'Leaders held', hi: 'नेता कहाँ बंद' },
    value: { en: 'Gandhiji: Aga Khan Palace. Nehru: Ahmednagar', hi: 'गांधीजी: आग़ा ख़ान महल। नेहरू: अहमदनगर क़िला' },
    sources: [{ id: 'top-ii-1971', loc: 'Introduction p. xii; No. 553 (letter from Aga Khan’s Palace, 14 Aug 1942)' }],
  },
  {
    id: 'f-newsite',
    label: { en: 'Second site', hi: 'दूसरा ठिकाना' },
    value: { en: 'Paradise Bungalow, Mahalaxmi, from 3 Nov', hi: 'पैराडाइज़ बंगला, महालक्ष्मी, 3 नवंबर से' },
    sources: [
      { id: 'huacuja-2023', loc: 'Fig. 4, police list of sites (from Sengupta and Chatterjee 1988)' },
      { id: 'chatterjee-1989' },
    ],
  },
  {
    id: 'f-team',
    label: { en: 'Our people', hi: 'हमारे लोग' },
    value: { en: 'Vithalbhai Jhaveri records; parts: Chicago Radio', hi: 'रिकॉर्डिंग: विट्ठलभाई झवेरी; पुर्ज़े: शिकागो रेडियो' },
    sources: [
      { id: 'chatterjee-1989', loc: 'Home Dept records: the accused' },
      { id: 'huacuja-2023', loc: 'trial' },
      { id: 'thakkar-2021', loc: 'Scroll excerpt' },
    ],
  },
  {
    id: 'f-uprising',
    label: { en: 'Tamluk, 29 September', hi: 'तमलुक, 29 सितंबर' },
    value: { en: 'Matangini Hazra, 73, shot', hi: 'मातंगिनी हाज़रा, 73 साल, गोली मारी गई' },
    sources: [{ id: 'samanta-1946', loc: 'Tamluk sections' }],
    hardHidden: true,
  },
  {
    id: 'f-money',
    label: { en: 'Money', hi: 'पैसा' },
    value: { en: '16 annas a rupee; no decimals', hi: '16 आने का रुपया; दशमलव नहीं' },
    sources: [{ id: 'thakkar-2021', loc: 'Scroll excerpt (court figures, Rs 599-8-0)' }],
    hardHidden: true,
  },
  {
    id: 'f-chiefs',
    label: { en: 'British chiefs', hi: 'अंग्रेज़ों के मुखिया' },
    value: { en: 'Prime Minister Churchill; Viceroy Linlithgow', hi: 'प्रधानमंत्री चर्चिल; वायसराय लिनलिथगो' },
    sources: [{ id: 'top-ii-1971', loc: 'No. 662 (Linlithgow to Churchill, 31 Aug 1942)' }],
    hardHidden: true,
  },
]
