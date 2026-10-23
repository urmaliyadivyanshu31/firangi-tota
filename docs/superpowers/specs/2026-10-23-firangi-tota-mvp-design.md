# Firangi Tota: MVP design

Date: 2026-10-23 · Status: DRAFT (era sections wait for the research)

## What it is

A free, open-source browser game in the style of
[Politburo or Parrot](https://atomiquest.github.io/Politburo-or-Parrot/), set in Indian history.
You sit at a desk in a real moment of the freedom struggle. Each day one message arrives. Some are
genuine. Some are forged by the **Firangi Tota**, an agent working for the British who copies the
voice perfectly but slips on facts. You check the message against your case file and stamp it
**ASLI** (genuine) or **TOTA** (forged) before the agarbatti burns out. One wrong stamp and you're
caught.

**Why:** the owner wants something people across India actually play and share, where every fact
is true and comes with proof (saaksh). He will post it publicly; a wrong fact gets him trolled.

## Credit and originality

Inspired by [Politburo or Parrot](https://github.com/atomiquest/Politburo-or-Parrot) by atomiquest,
credited in the README and on the in-game credits screen. That repo has **no licence** (all rights
reserved), so we share only the idea of the game loop. All code, text, shaders and assets here are
written from scratch or properly licensed (`CREDITS.md`). The running log of owner decisions is
`docs/DECISIONS.md`.

## Decisions made by the owner

| Topic | Decision |
|---|---|
| Moments (MVP) | 1857 Delhi · Bhagat Singh 1928–31 · Quit India 1942 (secret Congress Radio) · August 1947 |
| Forger | A real, historically grounded forger or informer in each era, called the Firangi Tota |
| Language | English + Hindi, switchable at any time |
| Look | 3D desk like the reference; must run on an iPhone 14 and on cheap Android phones |
| Tone | Serious with light wit; proud and on India's side |
| Humour | Roast **every** side that helped the British or sat out (informers, Rai Bahadurs, princes, organisations, left or right, British red tape). Every joke carries a documented quote on screen. Never aimed at a religion or community |
| Truth | Every fact has a source. Hard tells reward people who know their history |
| Chapters | All 4 open; a "continue" button suggests the chronological order |
| Mistakes | One wrong stamp ends the chapter, in every mode |
| Daily puzzle | Yes, in the MVP: "Aaj ka Taar" |
| Read aloud | Yes: a 🔊 button that uses the phone's built-in voice |
| Hosting | Public repo on GitHub (urmaliyadivyanshu31), site on Vercel, domain firangitota.com |
| Scope | MVP only. Nothing beyond the above until it ships |

## Non-goals (MVP)

Evening events (like Volkov's drink), collectible rewards, accounts, leaderboards, a backend,
multiplayer, any AI at runtime, eras before 1857, native apps.

## Anti-goals (a failure even if it works)

- A fact that a history teacher can disprove.
- Roasting one side only, which reads as propaganda.
- Anything that mocks a religion or community, or makes light of Partition's victims.
- A page a village kid on a cheap phone and a weak network can't load or play.

## The game loop

1. **Language:** first visit shows two big buttons, हिंदी / English (remembered).
2. **Home:** the four chapter cards, the daily puzzle and the ⟶ Continue button.
3. **Chapter setup:** pick Easy (7 days) · Medium (10) · Hard (14).
   - Easy: pencil marks under the facts to check, long agarbatti.
   - Medium: pencil marks for the first 3 days, shorter agarbatti.
   - Hard: some case-file lines are blank, and some forgeries can only be caught by knowing the
     history (e.g. "Jai Hind" in 1857, a slogan from the 1940s). Short agarbatti.
4. **Intro:** who you are, where, which day; two short screens.
5. **Each day:** the message arrives through the era's own channel (a harkara's letter, a telegram,
   a radio script). The case file and the rulebook sit beside it; new rules arrive as days pass.
   Stamp ASLI or TOTA before the agarbatti burns out.
6. **After the stamp:** right shows the tell (what gave the forgery away, or why the genuine one
   checks out) plus its **source**. Wrong or too slow means you're caught, and you see where people
   like you were really sent (Kala Pani, Lahore Central Jail, Yerawada…) with a source.
7. **End of chapter:** survive every day and you get "what happened next", with sources, and a share
   card.

### Daily puzzle: "Aaj ka Taar"

- 5 messages, the same for everyone that day. The seed is the date in IST, so there's no server.
- One era per day, rotating; medium rules.
- The share text is WhatsApp-first: `Firangi Tota · Aaj ka Taar #N · 1857` + `✅✅✅❌` + link.
- Played or not is stored locally, so it can't be replayed for a better score that day.

## Content model (the open-source contract)

Each era is one folder of typed data, so contributors can add eras by PR without touching the engine.

```
src/content/
  sources.ts            every source once: id, author, title, year, url, licence
  eras/<era>/
    era.ts              persona, setting, dates, palette, scene props, fuse length
    facts.ts            case-file lines: id, label, value {en, hi}, sources[]
    rules.ts            rulebook lines, with the day each one arrives
    messages.ts         the message pool (below)
    receipts.ts         humour targets: who, documented quote, source
    epilogue.ts         what happened next, with sources
```

A message has: `id`, `tier` (1–3), `real` (true/false), `pair` (a group key, so a genuine message
and its forged twin never both appear in one run), `text {en, hi}`, `from`/`to`/date fields for the
form, and either `why {en, hi}` (genuine) or `tells[]` (forged). A tell has a `kind` (name, place,
number, date, weekday, anachronism, habit, empty-loop, form), an explanation `{en, hi}`, and a
`factId` or `sources[]`.

**Automated checks (Vitest) that must pass:** every forgery has at least one tell; every tell and
fact points to a real fact or source; every string exists in both languages; a run never contains
both halves of a pair; the daily puzzle picks the same messages for the same date; date and weekday
templates are correct.

## Technical design (my calls)

- **Stack:** Vite + TypeScript + Three.js (npm, pinned). No UI framework: one 3D scene plus a few
  DOM panels. React would only add weight.
- **Layout:**
  `src/game/` (pure logic, no DOM: state machine, queue builder, seeded RNG, daily seed, scoring);
  `src/scene/` (renderer, quality manager, shared desk and props, per-era dressing, paper renderer,
  camera and tweens, 2D fallback); `src/audio/` (Web Audio synth and per-era ambience);
  `src/ui/` (HUD, case file, rulebook, cards, share); `src/i18n/` (UI strings en/hi);
  `src/content/` (above).
- **3D like the reference:** everything procedural (primitives plus canvas textures), no model files.
  One shared desk system; each era swaps props, window view, light and palette.
- **Quality manager:** picks a starting tier from device signals, measures the real frame rate for
  the first 2 s, and steps between high / mid / low (pixel ratio, shadows, particles). Pauses when
  the tab is hidden. If WebGL isn't available, the game falls back to a 2D desk and stays playable.
  Tier thresholds come from the 3D test spike.
- **Load budget:** first load ≤ ~600 KB total, so it's playable on a weak 3G connection. Fonts are
  subset WOFF2. Most sounds are synthesized; small recorded ambience loads after the game starts.
  A service worker caches everything, so after the first visit it works offline.
- **Sound:** a Web Audio synth for clicks, stamps, the telegraph, radio static, drums and drones,
  plus a few CC0 recordings. Sound is on by default (unlocked on the first tap), with a mute button.
- **Read aloud:** `speechSynthesis` with an hi-IN / en-IN voice; the button is hidden if the phone
  has no voice for that language.
- **Accessibility:** buttons at least 48 px, keyboard play (← / → or 1 / 2), reduced-motion
  support, screen-reader announcements for new messages and results.
- **Hosting:** static build on Vercel with long cache headers for hashed files. No server, so a viral
  spike costs nothing and can't crash it.
- **Licences:** code MIT; game text CC BY 4.0; third-party assets keep their own licence, listed in
  `CREDITS.md`.
- **Repo hygiene:** small, clear commits; `CONTRIBUTING.md` with the fact-check rule (every fact
  needs a source with page or URL); a PR checklist; CI runs typecheck, tests and build.

## Eras

Each era is grounded in its dossier in `docs/research/`. Every fact, real message, tell and receipt
must come from the dossier, or from a source it cites, with page or URL. Dates and weekdays are
real: day 1 of a chapter is the first date of its window. Easy plays the first 7 days, Medium 10,
Hard all 14. The player's character is fictional; their job is real.

Each chapter ends in one of two ways:
- **Survived:** "what happened next", with sources, plus 2–3 **receipt cards**. A receipt card is a
  documented quote about someone who sided with the British, shown with its source.
- **Caught:** the era's real consequence, with sources, plus the same receipt cards.

### 1. Dilli, 1857 (`delhi-1857.md`)
- **You:** a munshi in Bahadur Shah Zafar's darbar at the Red Fort, reading arzis (petitions),
  letters and news for the King's office.
- **Window:** Sun 17 – Sat 30 May 1857. Jiwan Lal's daily diary is the spine:
  - the new commanders are named;
  - gold mohurs are struck in Zafar's name;
  - Zafar refuses a holy war against Hindus;
  - a drum proclamation orders Hindus and Muslims not to quarrel;
  - the Eid procession is mistaken for a British advance;
  - guns are found stuffed with gravel;
  - a "spy" in a fortune-teller's dress is accused of being John Lawrence.
  - The killings of 16 May fall before the window and are never staged. The epilogue states the
    atrocities on both sides plainly, with sources.
- **Channel:** letters and petitions in Persian or Urdu with seals, handed in at the darbar, plus
  the occasional intercepted English note.
- **Forger:** an agent writing for the Firangi. This is grounded in the real letter forged in May in
  the names of Mahbub Ali Khan and Hakim Ahsanullah and planted on the gate guards (Mainodin, p. 59),
  and in the summer of rumours about a Persian army. Do not name Rajab Ali as the May forger; he
  works for Hodson from June.
- **Case file (examples):** regiments, the gates (including the Fort-versus-city Lahore Gate trap),
  officials and titles (Governor-General Canning, not "Viceroy"), money (16 annas, a gold mohur
  normally ~Rs 16), Hijri dates, seals and honorifics.
- **Hard tells:** "Jai Hind", "Viceroy Canning", the Chandni Chowk clock tower, a railway to Delhi,
  "Indian Army", "Lee-Enfield".
- **Caught:** your stamp helped the Firangi. When Delhi fell in September, the court's servants were
  tried, and convicts of 1857 were sent to the new penal settlement at Port Blair (Kala Pani) from
  March 1858. Verify the source before writing this.
- **Scene:** a chamber in the Fort at night, with a low writing desk, a chirag, qalam and inkpot,
  sealed petitions, and a jharokha onto the Delhi skyline. Sound: naqqar khana drums at the watches,
  drum proclamations, crows, distant horses, and both the azan and temple bells.

### 2. Lahore, 1929 (`bhagat-singh-1929.md`)
- **You:** a "post box", a Lahore student who receives and forwards notes for HSRA comrades in
  hiding. The role is real: Durga Devi did this (Maclean).
- **Window:** Tue 2 – Mon 15 April 1929:
  - the hat photo;
  - Bhagat Singh's letter to Sukhdev;
  - the Assembly bombs and leaflets on 8 April ("It takes a loud voice to make the deaf hear");
  - the Tribune headline;
  - the blacksmith's tip, and the sulphur-stained drain spout at the Kashmir Building.
  - It ends with the raid on 15 April.
- **Channel:** folded notes, pink leaflets with a printed heading, the occasional telegram.
- **Forger:** Lahore CID plants. Informers really did trade clues for reward money: Babu Singh
  offered clues for Rs 1,000.
- **Rules from the record:** notices are signed "Balraj, Commander-in-Chief"; a parcel goes only to
  the person who shows the keys; never ask a comrade about their past; real leaflets are pink with
  the printed heading. Police vocabulary ("outrage", "miscreants") gives a forger away.
- **Caught:** arrested in the Lahore Conspiracy Case round-ups, then Lahore jail. Use the dossier's
  facts.
- **Scene:** a rented room in Lahore, with a lantern, a bicycle, Urdu and English papers and pink
  leaflets. Sound: tongas, bicycle bells, train whistles from Lahore station, distant slogans.

### 3. Bombay, 1942 (`quit-india-1942.md`)
- **You:** the announcer-operator at the secret Congress Radio. It's a composite of the roles of
  Usha Mehta and Chandrakant Jhaveri. You decide what goes on air before the 8:45 pm broadcast.
- **Window:** Fri 30 Oct – Thu 12 Nov 1942. The hunt closes in: radio shops are raided, technicians
  talk, JP escapes on Diwali night. It ends with the raid at Parekh Wadi. If you survive, the
  epilogue shows that the real station was betrayed anyway.
- **Channel:** news slips and scripts brought by couriers, plus cut discs.
- **Forger:** CID Special Branch plants. Netaji's Azad Hind Radio is **not** treated as a forger;
  that would be wrong and needlessly hurtful.
- **Rules from the record:** 42.34 m (41.78 m in the first broadcasts); 8:45 pm; "never talk of the
  persons behind the stations"; hold back unconfirmed reports, as the station really did with a
  Meerut story on 26 Oct; war time GMT+6:30 from 1 Sep 1942.
- **Caught:** arrested, then Yerwada jail. Usha Mehta was released in April 1946.
- **Scene:** the Parekh Wadi flat at night, with a valve transmitter and microphone, a gramophone
  with a Vande Mataram disc, and a curtained window. Sound: shortwave static and tuning, valve hum,
  tram bells, the evening sea wind.

### 4. Delhi, August 1947 (`independence-1947.md`)
- **You:** an Indian cipher-and-telegraph clerk at Government House, New Delhi.
- **Window:** Tue 5 – Mon 18 Aug 1947:
  - the leaked Ferozepore map (8 Aug);
  - "Eliminate Salient";
  - the awards are signed on 12/13 Aug and held back;
  - the midnight session (11 pm; conches; Prasad's "half a minute to 12");
  - the 60 hours of notional boundaries with flags in the wrong towns;
  - publication on Sun 17 Aug.
- **Channel:** telegrams with real formats: MOST IMMEDIATE, numbers like "No. 3408-S",
  "Begins … Ends.", Received stamps.
- **Forger:** forged "award" telegrams from the "mischief makers" the Army Chief warned about ("the
  wildest rumours are current"). Forgeries fail on names, places, dates, titles and procedure, never
  on religion.
- **Hard tells:** "Viceroy" vs "Governor-General" around midnight; Viscount, not Earl; "Rashtrapati
  Bhavan" (the name dates from 1950); "paise" (1957); "the Red Fort flag on 15 Aug" (it was the
  16th); Pakistan's clock half an hour behind (only from 1951).
- **Caught:** not jail in a free India. Your stamp let a rumour run ahead of the truth, told with
  restraint (aggregates and ranges, never gore). The content writer proposes the exact framing and
  it is reviewed.
- **Scene:** the cipher room, with a ceiling fan, typewriter, telegram forms, Mountbatten's real
  tear-off countdown calendar, and monsoon rain on the window. Sound: the teleprinter and sounder,
  the fan, rain, conches and crowds at midnight on 14 Aug.

### Receipts (all eras)
Taken from section 12 of each dossier. Every side that helped the British or sat out gets roasted,
with proof:
- **1857:** the princes rewarded with land.
- **1929:** the approvers, and each organisation's reaction in its own words.
- **1942:** the CPI's "People's War" line, the League's "abstain", Savarkar's "stick to your posts",
  Mookerjee's letter of 26 July, the RSS's stance as documented, and the Rai Bahadurs. Allah Bux,
  who gave up his titles, is the counterpoint.
- **1947:** Radcliffe's five weeks, the typewriter deadlock, the Nizam chasing a title on 13 Aug.

Each card carries the quote, the source, and a one-line explanation from the side itself where the
dossier has one. Never about a religion or a community. Never mock the dead or summoned witnesses.

### Content volume
At least 30 messages per era (about half genuine, half forged) across tiers 1–3, enough that a
14-day run and the daily puzzle rarely repeat. Each era also gets 8–10 case-file lines, 5–7 rules,
the epilogue and 2–3 receipts. Everything is written in English and simple Hindi; the Hindi must be
easy for a village kid, everyday Hindustani in Devanagari, not Sanskritised.

## Left to the builder

Exact visual styling within the era palettes, the copy for UI chrome, and the animation timing.
