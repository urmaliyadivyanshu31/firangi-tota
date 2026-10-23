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

_Filled in from the research dossiers in `docs/research/`: for each era, the persona, the window
of days, the case file, the forger, the channel, the scene, the sound, the receipts and the
epilogue._

## Left to the builder

Exact visual styling within the era palettes, the copy for UI chrome, and the animation timing.
