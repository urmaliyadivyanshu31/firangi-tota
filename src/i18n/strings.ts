import type { Lang } from '../content/types'

// Every player-facing UI string, in English and simple everyday Hindi (docs/content-style.md).
// Display copy (titles, buttons, card titles, banners) never ends with a full stop.
// `{name}` placeholders are filled by `tf`.

const en = {
  // Names
  appName: 'Firangi Tota',
  langSelf: 'English',
  langChange: 'Change language',

  // Home
  tagline: 'Spot the forgeries before the agarbatti burns out',
  continue: 'Continue',
  dailyTitle: 'Aaj ka Taar',
  dailyBody: 'Five messages, the same for everyone today',
  dailyPlay: 'Play',
  dailyDone: 'Played today',
  bestSurvived: 'Survived {mode}',
  bestDays: 'Best: {n} days on {mode}',
  soundOn: 'Sound on',
  soundOff: 'Sound off',
  credits: 'Credits',

  // Setup
  setupQuestion: 'How long can you hold out?',
  modeEasy: 'Easy',
  modeMedium: 'Medium',
  modeHard: 'Hard',
  modeDays: '{n} days',
  modeSeconds: '{s} seconds a message',
  modeEasyNote: 'Pencil marks show what to check',
  modeMediumNote: 'Pencil marks for the first {n} days',
  modeHardNote: 'No pencil marks, and some case-file lines are blank',
  back: 'Back',

  // Intro
  introYou: 'You',
  introForger: 'The Tota',
  introFirstDay: 'Day 1',
  introHow: 'Check each message against your case file and rulebook. Stamp ASLI if it is genuine and TOTA if it is forged.',
  introStakes: 'One wrong stamp, or letting the agarbatti burn out, and you are caught.',
  next: 'Next',
  begin: 'Start day 1',

  // Day
  dayOf: 'Day {n} of {total}',
  asli: 'ASLI',
  tota: 'TOTA',
  asliHint: 'Genuine',
  totaHint: 'Forged',
  caseFile: 'Case file',
  rulebook: 'Rulebook',
  newTag: 'NEW',
  closePanel: 'Back to the message',
  readAloud: 'Read aloud',
  timerLabel: 'Agarbatti, time left',
  announceDay: 'Day {n}. A new message from {from}.',
  petitionTo: 'Humbly submitted to {to}',
  petitionClose: 'Your obedient servant,',
  noteTo: 'For {to}',
  noteFrom: 'From {from}',
  radioHead: 'News slip',
  telegramHead: 'MOST IMMEDIATE',
  telegramNo: 'No. {n}',
  fieldFrom: 'From',
  fieldTo: 'To',

  // Reveal
  right: 'Right',
  wrong: 'Wrong',
  tooSlow: 'Too slow',
  wasGenuine: 'This message was genuine',
  wasForged: 'This message was forged',
  kindReal: '📜 Real document',
  kindWritten: 'Written for the game · every detail checks out',
  kindForged: 'Forged by the Tota · written for the game',
  sources: 'Sources',

  // End
  survivedTitle: 'You survived',
  caughtTitle: 'You were caught',
  nextHappened: 'What happened next',
  caughtHappened: 'What happened to people like you',
  onRecord: 'On the record',
  theirSide: 'Their side',
  lastMessage: 'The last message',
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

  tagline: 'अगरबत्ती ख़त्म होने से पहले जाली संदेश पकड़ें',
  continue: 'आगे खेलें',
  dailyTitle: 'आज का तार',
  dailyBody: 'आज के 5 संदेश, सबके लिए एक जैसे',
  dailyPlay: 'खेलें',
  dailyDone: 'आज खेल लिया',
  bestSurvived: '{mode} पार किया',
  bestDays: 'सबसे आगे: {mode} में {n} दिन',
  soundOn: 'आवाज़ चालू',
  soundOff: 'आवाज़ बंद',
  credits: 'क्रेडिट',

  setupQuestion: 'आप कितने दिन टिक पाएँगे?',
  modeEasy: 'आसान',
  modeMedium: 'मध्यम',
  modeHard: 'मुश्किल',
  modeDays: '{n} दिन',
  modeSeconds: 'हर संदेश के लिए {s} सेकंड',
  modeEasyNote: 'पेंसिल के निशान बताते हैं कि क्या जाँचना है',
  modeMediumNote: 'पहले {n} दिन पेंसिल के निशान',
  modeHardNote: 'पेंसिल के निशान नहीं, और केस फ़ाइल की कुछ लाइनें ख़ाली',
  back: 'वापस',

  introYou: 'आप',
  introForger: 'तोता',
  introFirstDay: 'पहला दिन',
  introHow: 'हर संदेश को अपनी केस फ़ाइल और नियमों से मिलाएँ। सच्चा हो तो असली की मुहर लगाएँ, जाली हो तो तोता की।',
  introStakes: 'एक ग़लत मुहर, या अगरबत्ती ख़त्म हो गई, तो आप पकड़े जाएँगे।',
  next: 'आगे',
  begin: 'पहला दिन शुरू करें',

  dayOf: 'दिन {n} / {total}',
  asli: 'असली',
  tota: 'तोता',
  asliHint: 'सच्चा संदेश',
  totaHint: 'जाली संदेश',
  caseFile: 'केस फ़ाइल',
  rulebook: 'नियम',
  newTag: 'नया',
  closePanel: 'संदेश पर लौटें',
  readAloud: 'पढ़कर सुनाएँ',
  timerLabel: 'अगरबत्ती, बचा हुआ समय',
  announceDay: 'दिन {n}। {from} से नया संदेश।',
  petitionTo: '{to} की ख़िदमत में',
  petitionClose: 'आपका ख़ादिम,',
  noteTo: '{to} के लिए',
  noteFrom: '{from} की ओर से',
  radioHead: 'ख़बर की पर्ची',
  telegramHead: 'सबसे ज़रूरी',
  telegramNo: 'नंबर {n}',
  fieldFrom: 'भेजने वाला',
  fieldTo: 'पाने वाला',

  right: 'सही',
  wrong: 'ग़लत',
  tooSlow: 'देर हो गई',
  wasGenuine: 'यह संदेश सच्चा था',
  wasForged: 'यह संदेश जाली था',
  kindReal: '📜 असली दस्तावेज़',
  kindWritten: 'खेल के लिए लिखा गया · हर बात सच है',
  kindForged: 'तोते की जालसाज़ी · खेल के लिए लिखी गई',
  sources: 'सबूत',

  survivedTitle: 'आप बच निकले',
  caughtTitle: 'आप पकड़े गए',
  nextHappened: 'आगे क्या हुआ',
  caughtHappened: 'आप जैसे लोगों के साथ क्या हुआ',
  onRecord: 'किसने क्या कहा',
  theirSide: 'उनकी बात',
  lastMessage: 'आख़िरी संदेश',
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
  'appName', 'langSelf', 'langChange', 'tagline', 'continue', 'dailyTitle', 'dailyBody', 'dailyPlay',
  'dailyDone', 'bestSurvived', 'bestDays', 'soundOn', 'soundOff', 'credits', 'setupQuestion',
  'modeEasy', 'modeMedium', 'modeHard', 'modeDays', 'modeSeconds', 'modeEasyNote', 'modeMediumNote',
  'modeHardNote', 'back', 'introYou', 'introForger', 'introFirstDay', 'next', 'begin', 'dayOf', 'asli',
  'tota', 'asliHint', 'totaHint', 'caseFile', 'rulebook', 'newTag', 'closePanel', 'readAloud',
  'radioHead', 'telegramHead', 'right', 'wrong', 'wasGenuine', 'wasForged', 'kindReal', 'kindWritten',
  'kindForged', 'sources', 'survivedTitle', 'caughtTitle', 'nextHappened', 'caughtHappened',
  'onRecord', 'theirSide', 'lastMessage', 'playAgain', 'home', 'share', 'creditsInspired', 'creditsCode',
  'tooSlow', 'copied', 'copyFailed', 'shareWhatsApp', 'dailyChapter',
]

export function t(key: keyof Strings, lang: Lang): string {
  return strings[lang][key]
}

/** `t` plus `{name}` placeholders. */
export function tf(key: keyof Strings, lang: Lang, vars: Record<string, string | number>): string {
  return t(key, lang).replace(/\{(\w+)\}/g, (all, name: string) => (name in vars ? String(vars[name]) : all))
}
