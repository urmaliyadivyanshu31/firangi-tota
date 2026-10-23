import type { Lang } from '../content/types'

// Every player-facing UI string, in English and simple everyday Hindi (docs/content-style.md).
// Display copy (titles, buttons, card titles, banners) never ends with a full stop.
// `{name}` placeholders are filled by `tf`.

const en = {
  // Names
  appName: 'Firangi Tota',
  langSelf: 'English',
  langChange: 'Change language',
  langShort: 'EN',

  // Home
  premise: 'Four desks of the freedom struggle, and one forger: the Firangi Tota',
  continue: 'Continue',
  dailyTitle: 'Aaj ka Taar',
  dailyPlay: 'Play',
  dailyDone: 'Played today',
  dailyScore: 'Aaj ka Taar #{n} · {right}/{total}',
  dailyTomorrow: 'Come back tomorrow for a new one',
  dailyNext: 'Next one in {time}',
  shareGrid: '{right} of {total} right',
  bestSurvived: 'Survived {mode}',
  bestDays: 'Best: {n} days on {mode}',
  soundOn: 'Sound on',
  soundOff: 'Sound off',
  sound: 'Sound',
  credits: 'Credits',

  // Setup
  setupQuestion: 'How long can you hold out?',
  modeEasy: 'Easy',
  modeMedium: 'Medium',
  modeHard: 'Hard',
  modeDays: '{n} days',
  modeSeconds: '{s} seconds each',
  back: 'Back',

  // Intro
  introYou: 'You',
  introHow: 'Check each message against the case file. Stamp ASLI if genuine, TOTA if forged.',
  introStakes: 'One wrong stamp, or a burnt-out agarbatti, and you are caught.',
  next: 'Next',
  begin: 'Start day 1',

  // Day
  dayOf: 'Day {n} of {total}',
  dayLabel: 'Day',
  dayTitle: 'Day {n}',
  skip: 'Skip',
  asli: 'ASLI',
  tota: 'TOTA',
  asliHint: 'Genuine',
  totaHint: 'Forged',
  caseFile: 'Case file',
  rulebook: 'Rulebook',
  newTag: 'NEW',
  closePanel: 'Back to the message',
  blankFact: 'Blank in Hard mode',
  listen: 'Listen',
  listenStop: 'Stop',
  voiceError: 'Voice unavailable',
  voiceStyle: 'Choose the voice',
  voiceEra: 'Era voice',
  voiceDastango: 'Dastango',
  timerLabel: 'Agarbatti, time left',
  fieldFrom: 'From',
  fieldTo: 'To',
  sheetPetitionHead: 'Darbar-e-Mualla',
  sheetRadioHead: 'CONGRESS RADIO · 42.34 m',
  sheetTelegramHead: 'TELEGRAM',

  // Reveal
  right: 'Right',
  wrong: 'Wrong',
  tooSlow: 'Too slow',
  wasGenuine: 'This message was genuine',
  wasForged: 'This message was forged',
  kindReal: 'Real document',
  kindWritten: 'Written for the game · every detail checks out',
  kindForged: 'Forged by the Tota · written for the game',
  source: 'Source',
  tellLabel: 'The tell',
  whyLabel: 'Why it checks out',

  // End
  survivedTitle: 'You survived',
  caughtTitle: 'You were caught',
  nextHappened: 'What happened next',
  caughtHappened: 'What happened to people like you',
  theirSide: 'Their side',
  playAgain: 'Play again',
  home: 'Home',
  share: 'Share',
  copied: 'Copied',
  copyFailed: 'Could not copy, the text is on the screen',
  shareWhatsApp: 'Send on WhatsApp',
  dailyChapter: 'Play chapter',

  // Credits
  creditsInspired: 'Inspired by {title} by atomiquest',
  creditsCode: 'Code: MIT licence',
  creditsText: 'Game text: CC BY 4.0. Quotes from books and documents are not covered and stay with their owners.',
  creditsFonts: 'Fonts: Mukta, Tiro Devanagari Hindi and Old Standard TT (SIL Open Font License), Special Elite (Apache 2.0).',
  creditsAssets: 'Every font, sound and picture is listed with its source and licence in CREDITS.md, in the game’s source code.',
}

export type Strings = Record<keyof typeof en, string>

const hi: Strings = {
  appName: 'फ़िरंगी तोता',
  langSelf: 'हिंदी',
  langChange: 'भाषा बदलें',
  langShort: 'हिंदी',

  premise: 'आज़ादी की लड़ाई की चार मेज़ें, और एक जालसाज़: फ़िरंगी तोता',
  continue: 'आगे खेलें',
  dailyTitle: 'आज का तार',
  dailyPlay: 'खेलें',
  dailyDone: 'आज खेल लिया',
  dailyScore: 'आज का तार #{n} · {right}/{total}',
  dailyTomorrow: 'कल फिर आइए, नया तार मिलेगा',
  dailyNext: 'अगला तार {time} में',
  shareGrid: '{total} में से {right} सही',
  bestSurvived: '{mode} पार किया',
  bestDays: 'सबसे आगे: {mode} में {n} दिन',
  soundOn: 'आवाज़ चालू',
  soundOff: 'आवाज़ बंद',
  sound: 'आवाज़',
  credits: 'क्रेडिट',

  setupQuestion: 'आप कितने दिन टिक पाएँगे?',
  modeEasy: 'आसान',
  modeMedium: 'मध्यम',
  modeHard: 'मुश्किल',
  modeDays: '{n} दिन',
  modeSeconds: 'हर संदेश {s} सेकंड',
  back: 'वापस',

  introYou: 'आप',
  introHow: 'हर संदेश को केस फ़ाइल से मिलाएँ। सच्चा हो तो असली, जाली हो तो तोता।',
  introStakes: 'एक ग़लत मुहर, या अगरबत्ती बुझी, और आप पकड़े गए।',
  next: 'आगे',
  begin: 'पहला दिन शुरू करें',

  dayOf: 'दिन {n} / {total}',
  dayLabel: 'दिन',
  dayTitle: 'दिन {n}',
  skip: 'छोड़ें',
  asli: 'असली',
  tota: 'तोता',
  asliHint: 'सच्चा संदेश',
  totaHint: 'जाली संदेश',
  caseFile: 'केस फ़ाइल',
  rulebook: 'नियम',
  newTag: 'नया',
  closePanel: 'संदेश पर लौटें',
  blankFact: 'मुश्किल मोड में ख़ाली',
  listen: 'सुनो',
  listenStop: 'रोको',
  voiceError: 'आवाज़ नहीं आ पाई',
  voiceStyle: 'आवाज़ चुनें',
  voiceEra: 'युग की आवाज़',
  voiceDastango: 'दास्तानगो',
  timerLabel: 'अगरबत्ती, बचा हुआ समय',
  fieldFrom: 'भेजने वाला',
  fieldTo: 'पाने वाला',
  sheetPetitionHead: 'दरबार-ए-मुअल्ला',
  sheetRadioHead: 'कांग्रेस रेडियो · 42.34 मीटर',
  sheetTelegramHead: 'तार',

  right: 'सही',
  wrong: 'ग़लत',
  tooSlow: 'देर हो गई',
  wasGenuine: 'यह संदेश सच्चा था',
  wasForged: 'यह संदेश जाली था',
  kindReal: 'असली दस्तावेज़',
  kindWritten: 'खेल के लिए लिखा गया · हर बात सच है',
  kindForged: 'तोते की जालसाज़ी · खेल के लिए लिखी गई',
  source: 'स्रोत',
  tellLabel: 'चूक कहाँ थी',
  whyLabel: 'यह सच्चा क्यों है',

  survivedTitle: 'आप बच निकले',
  caughtTitle: 'आप पकड़े गए',
  nextHappened: 'आगे क्या हुआ',
  caughtHappened: 'आप जैसे लोगों के साथ क्या हुआ',
  theirSide: 'उनकी बात',
  playAgain: 'फिर खेलें',
  home: 'होम',
  share: 'शेयर करें',
  copied: 'कॉपी हो गया',
  copyFailed: 'कॉपी नहीं हुआ, टेक्स्ट स्क्रीन पर है',
  shareWhatsApp: 'WhatsApp पर भेजें',
  dailyChapter: 'अध्याय खेलें',

  creditsInspired: 'atomiquest के {title} से प्रेरित',
  creditsCode: 'कोड: MIT लाइसेंस',
  creditsText: 'खेल की लिखाई: CC BY 4.0। किताबों और दस्तावेज़ों से ली गई बातें इसमें शामिल नहीं हैं, वे उनके मालिकों की हैं।',
  creditsFonts: 'फ़ॉन्ट: Mukta, Tiro Devanagari Hindi और Old Standard TT (SIL Open Font License), Special Elite (Apache 2.0)।',
  creditsAssets: 'हर फ़ॉन्ट, आवाज़ और तस्वीर अपने स्रोत और लाइसेंस के साथ गेम के सोर्स कोड में CREDITS.md में दर्ज है।',
}

export const strings: Record<Lang, Strings> = { en, hi }

/** Keys that are display copy (titles, buttons, card titles, banners): never end with a full stop. */
export const DISPLAY_KEYS: (keyof Strings)[] = [
  'appName', 'langSelf', 'langChange', 'continue', 'dailyTitle', 'dailyPlay',
  'dailyDone', 'bestSurvived', 'bestDays', 'soundOn', 'soundOff', 'credits', 'setupQuestion',
  'modeEasy', 'modeMedium', 'modeHard', 'modeDays', 'modeSeconds', 
  'back', 'introYou', 'next', 'begin', 'dayOf', 'asli',
  'tota', 'asliHint', 'totaHint', 'caseFile', 'rulebook', 'newTag', 'closePanel',
  'right', 'wrong', 'wasGenuine', 'wasForged', 'kindReal', 'kindWritten',
  'kindForged', 'survivedTitle', 'caughtTitle', 'nextHappened', 'caughtHappened',
  'theirSide', 'playAgain', 'home', 'share', 'creditsInspired', 'creditsCode',
  'tooSlow', 'copied', 'copyFailed', 'shareWhatsApp', 'dailyChapter',
  'langShort', 'premise', 'dailyScore', 'dailyTomorrow', 'dailyNext', 'shareGrid', 'dayLabel',
  'dayTitle', 'skip', 'blankFact', 'sheetPetitionHead', 'sheetRadioHead',
  'sheetTelegramHead', 'tellLabel', 'whyLabel', 'source', 'sound', 'listen', 'listenStop', 'voiceError',
  'voiceStyle', 'voiceEra', 'voiceDastango',
]

export function t(key: keyof Strings, lang: Lang): string {
  return strings[lang][key]
}

/** `t` plus `{name}` placeholders. */
export function tf(key: keyof Strings, lang: Lang, vars: Record<string, string | number>): string {
  return t(key, lang).replace(/\{(\w+)\}/g, (all, name: string) => (name in vars ? String(vars[name]) : all))
}
