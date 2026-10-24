# Content style

For anyone writing text for the game, in English or Hindi.

## Hindi

- Write simple, everyday Hindustani in Devanagari. Avoid Sanskritised words.
- Keep sentences short.
- Use Latin digits (0 to 9), never Devanagari digits.
- Use the same spelling for every recurring name, from the table below.

## Name table

| English | Hindi |
| --- | --- |
| Bahadur Shah Zafar | बहादुर शाह ज़फ़र |
| Mirza Mughal | मिर्ज़ा मुग़ल |
| Bakht Khan | बख़्त ख़ान |
| Bhagat Singh | भगत सिंह |
| Batukeshwar Dutt | बटुकेश्वर दत्त |
| Sukhdev | सुखदेव |
| Rajguru | राजगुरु |
| Chandrashekhar Azad | चंद्रशेखर आज़ाद |
| Durga Devi | दुर्गा देवी |
| Usha Mehta | उषा मेहता |
| Ram Manohar Lohia | राम मनोहर लोहिया |
| Mountbatten | माउंटबेटन |
| Radcliffe | रैडक्लिफ़ |
| Nehru | नेहरू |
| Patel | पटेल |
| Jinnah | जिन्ना |
| Gandhi | गांधी |

## Length

Everything is read on a phone, against a clock, so every field has a word limit. `npm test` checks
them (`wordLimits` in `src/content/validate.ts`). The numbers are for English; Hindi may use 1.5 times
as many words, rounded up.

| Field | Max words |
| --- | --- |
| Message text | 30, in at most 3 sentences |
| Message from, to | 5 each |
| Tell explanation, why text | 14 |
| Case-file fact label, value | 3, 6 |
| Case-file story | 22, in one sentence |
| Rule | 14 |
| Persona, forger | 12, 14 |
| Intro paragraph | 30 |
| Receipt quote, joke, their side, who | 25, 10, 16, 6 |
| Epilogue paragraph | 28 (at most 3 survived, 2 caught) |
| Ending stamp, ending title | 3, 9 |

## Case file

The case file reads as a short story: two or three paragraphs, one sentence per fact. Each fact keeps
its short `label` and `value` (the pencil marks and the verdict use them) and adds a `story` and a
`para` (its paragraph, 1 to 3). List the facts in story order: who you serve, who leads, which units,
what happened when, where things are, money, then the threat.

- A story says the fact's value and nothing more. No new claim, name or number: if you are unsure,
  write it plainer.
- Put every checkable word of the value inside `[[ ]]`: names, numbers, dates, places, regiments.
  The card shows them in a marker swash, and Hard mode turns a hidden fact's highlights into blanks,
  so the rest of the sentence must not give the value away.
- Write in the era's voice. Hindi stays simple enough for a 12-year-old.
- `npm test` checks the highlights, the numbers, the names and the length (`storyChecks` in
  `src/content/validate.ts`).

Example: `You serve the King, [[Bahadur Shah Zafar]]; his coins name him [[Siraj-ud-din]], also spelt [[Suraj-u-din]].`

## Every check is in the file (owner, 24 October)

A player judges a message only by that mode's case file and the rules that have arrived. So every
pencil mark (`checks`, EN and HI) must be settled there, in every mode the message can come in:

- by one case-file line of that mode whose story holds the mark's numbers and names (or its content
  words, when it has no names), or by one rule that has arrived by the message's first day;
- or by the calendar: a weekday or date the era's weekday rule settles, or the paper's own date line
  for a dated event;
- or by a `verify` note on the message (`'fact:<id>'`, `'rule:<id>'` or `'calendar'`) where the words
  cannot match. The note must be honest: that line has to let a player judge the mark.

A forgery's slip is settled by its tell's fact or rule, which must be in that mode's file. If a detail
is not in the file, rewrite it, add a short sourced fact (with `minMode` where it belongs), move the
message up a mode, or cut it. `coverage` in `src/content/validate.ts` checks all of this.

## Display copy

Banners, headers, buttons and card titles never end with a full stop. Body sentences keep theirs.

## Receipt cards

- Quote documented words, and show the source.
- Never target a religion or a community.
- Never mock the dead or the summoned witnesses.
- Religion is never a tell. A message must not be forged or real because of someone's faith.
