import type { Era } from '../../types'

// Test-only era. Folders starting with `_` are skipped by the registry.
const era: Era = {
  id: 'delhi-1857',
  order: 1,
  title: { en: 'Fixture Era', hi: 'परीक्षण युग' },
  place: { en: 'Delhi', hi: 'दिल्ली' },
  year: '1857',
  persona: { en: 'a clerk at the Red Fort', hi: 'लाल क़िले का एक मुंशी' },
  intro: [
    { en: 'Letters reach your desk each morning.', hi: 'हर सुबह चिट्ठियाँ आपकी मेज़ पर पहुँचती हैं।' },
    { en: 'Some are real and some are forged.', hi: 'कुछ असली हैं और कुछ जाली।' },
  ],
  windowStart: '1857-05-11',
  channel: 'petition',
  forger: { en: 'a rival clerk', hi: 'एक प्रतिद्वंद्वी मुंशी' },
  sources: [
    { id: 's1', author: 'A. Author', title: 'First Book', year: '1900' },
    { id: 's2', author: 'B. Author', title: 'Second Book', year: '1950', url: 'https://example.org/book' },
  ],
  facts: [
    {
      id: 'f1',
      label: { en: 'Weekday', hi: 'वार' },
      value: { en: 'The rising began on a Monday.', hi: 'विद्रोह सोमवार को शुरू हुआ।' },
      story: { en: 'The rising began on a [[Monday]].', hi: 'विद्रोह [[सोमवार]] को शुरू हुआ।' },
      para: 1,
      sources: [{ id: 's1', loc: 'p. 12' }],
    },
    {
      id: 'f2',
      label: { en: 'The city', hi: 'शहर' },
      value: { en: 'The court sat in Delhi.', hi: 'दरबार दिल्ली में लगता था।' },
      story: { en: 'The court sat in [[Delhi]].', hi: 'दरबार [[दिल्ली]] में लगता था।' },
      para: 2,
      sources: [{ id: 's2', loc: 'ch. 3' }],
    },
  ],
  rules: [
    {
      id: 'r1',
      text: { en: 'Letters carry the date of writing.', hi: 'चिट्ठियों पर लिखने की तारीख़ होती है।' },
      arrivesOnDay: 1,
    },
  ],
  messages: [
    {
      id: 'm1',
      tier: 1,
      real: true,
      from: { en: 'The Subedar', hi: 'सूबेदार' },
      to: { en: 'The Clerk', hi: 'मुंशी' },
      text: {
        en: 'On {date} the guards changed at the Delhi gate.',
        hi: '{date} को दिल्ली फाटक पर पहरा बदला।',
      },
      checks: { en: ['the Delhi gate'], hi: ['दिल्ली फाटक'] },
      why: {
        text: { en: 'The gate rota is recorded.', hi: 'फाटक की बारी दर्ज है।' },
        sources: [{ id: 's1', loc: 'p. 14' }],
      },
    },
    {
      id: 'm2',
      tier: 1,
      real: false,
      from: { en: 'The Rival', hi: 'प्रतिद्वंद्वी' },
      to: { en: 'The Clerk', hi: 'मुंशी' },
      text: {
        en: 'On {date} the court sat in Lahore.',
        hi: '{date} को दरबार लाहौर में लगा।',
      },
      checks: { en: ['court sat in Lahore'], hi: ['लाहौर में लगा'] },
      tells: [
        {
          kind: 'place',
          explain: { en: 'The court sat in Delhi, not Lahore.', hi: 'दरबार दिल्ली में था, लाहौर में नहीं।' },
          factId: 'f2',
          sources: [{ id: 's2', loc: 'ch. 3' }],
        },
      ],
    },
  ],
  receipts: [
    {
      id: 'rc1',
      who: { en: 'A clerk', hi: 'एक मुंशी' },
      quote: { en: 'I read every seal twice.', hi: 'मैंने हर मुहर दो बार देखी।' },
      joke: { en: 'He still missed one.', hi: 'फिर भी एक छूट गई।' },
      source: { id: 's1', loc: 'p. 20' },
    },
  ],
  endings: {
    caught: { stamp: { en: 'Caught', hi: 'पकड़े गए' }, title: { en: 'The forger got through', hi: 'जालसाज़ निकल गया' } },
    survived: { stamp: { en: 'Cleared', hi: 'पास' }, title: { en: 'Every letter checked out', hi: 'हर चिट्ठी परखी गई' } },
  },
  epilogue: {
    survived: [{ en: 'The city endured.', hi: 'शहर टिका रहा।' }],
    caught: [{ en: 'The forgery was found.', hi: 'जालसाज़ी पकड़ी गई।' }],
    sources: [{ id: 's1', loc: 'p. 30' }],
  },
}

export default era
