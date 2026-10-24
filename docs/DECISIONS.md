# Decisions

The project owner's decisions, in the order they were made. When something here conflicts with
older notes, the newest entry wins. This file is public; it explains why the game is the way it is.

## 2026-10-23: Starting the project

**Credit and originality**
- Firangi Tota is *inspired by* [Politburo or Parrot](https://github.com/atomiquest/Politburo-or-Parrot)
  by atomiquest ([play it](https://atomiquest.github.io/Politburo-or-Parrot/)). The README and the
  game's credits screen say so, with a link.
- That repository has no licence, so none of its code, text, images or sounds are copied. Only the
  idea of the game loop is shared, and every line here is written from scratch.
- Every third-party asset (fonts, sounds, archival images) must be CC0, public domain or properly
  licensed, and is listed in `CREDITS.md` with its source and licence.
- No shortcuts that would embarrass an open-source project: no scraped or unlicensed material, no
  secrets in the repo, no tracking that identifies players.

**What the game is**
- A browser game about moments in Indian history. A message arrives each day; some are forged by
  the **Firangi Tota**, an agent for the British who copies the voice but slips on facts. You check
  each one against your case file and stamp it real or forged.
- The first version covers four moments, starting from 1857: **Delhi 1857**, **Bhagat Singh
  1928–31**, **Quit India 1942** (the secret Congress Radio) and **August 1947**.
- In each era the forger is grounded in real history (informers, approvers, police plants).

**Truth**
- Every fact needs a source, read from books and papers rather than taken from summaries. The game
  shows the source after each stamp.
- Fiction is allowed only where it is clearly game fiction, and is never presented as a historical
  claim. The player's character, the forged messages and the wording of most genuine messages are
  written for the game. Every fact inside a genuine message is true and sourced.
- Where a real letter, telegram, leaflet or broadcast exists, the game uses it and marks it
  **📜 Real document** with its source. After each stamp the game says which kind of message it was.

**Tone and humour**
- Serious, with light wit. The game stands with India and with the people who fought for freedom.
- The humour lands on everyone who helped the British or sat out, from any side, then or now:
  informers, title-holders, princes, organisations and British red tape. Each joke is backed by a
  documented quote shown on screen. No side is spared, so no one can call it propaganda.
- Never aimed at a religion or a community. Partition's victims are treated with dignity.

**Difficulty**
- Some forgeries are easy (the case file catches them); some are hard and only someone who knows the
  history will spot them. Easy (7 days), Medium (10) and Hard (14).
- One wrong stamp ends the chapter, in every mode.

**Who it's for**
- Anyone in India, including a kid in a village on a cheap Android phone with a weak network: a
  small download, offline after the first visit, simple Hindi, big buttons.
- English and Hindi, switchable at any time. A 🔊 button reads the message aloud using the phone's
  built-in voice.

**Look and sound**
- A 3D desk scene like the reference, drawn in code, that adjusts its quality to the phone and falls
  back to 2D when 3D isn't available. It must run on an iPhone 14 and on low-end Android.
- Sound on: Indian and period sounds for each era.

**Scope**
- MVP only: the four chapters plus a daily puzzle ("Aaj ka Taar", the same messages for everyone
  that day, with a share card). Everything else comes later, step by step.
- All four chapters are open from the start, with a suggested chronological order.

**Where it lives**
- A public GitHub repo, hosted on Vercel, at firangitota.com.

## 2026-10-23: After the research

- The research for all four eras is in `docs/research/` and comes from primary sources and
  scholarship, not summaries.
- The four chapters, their windows and the player's role in each are set out in the MVP design
  (`docs/superpowers/specs/2026-10-23-firangi-tota-mvp-design.md`).
- Launch as fast as possible, quality first. The owner reads the Hindi and every receipt card
  before the game goes public.

## 2026-10-24: Domain

- firangitota.com was bought on Vercel (team oxdivs-projects) and is valid until 24 Oct 2027. The
  owner chose no auto-renew. It points at the production deploy only after the owner approves the
  preview.

## 2026-10-24: Fully immersive, like the reference

- The owner rejected the first wired build as flat: the message sat in a panel over a dark 3D
  background. The game must live inside the 3D room, the way Politburo or Parrot does: the whole
  screen is the room; each day opens with an in-world day title; the message arrives in that era's own
  way and is printed on the 3D paper; the 3D stamp lands on it; the interface is a thin layer of
  period-styled cards and buttons.
- It should look Indian and of its era, and be more beautiful than the reference: period paper
  forms, saffron, indigo and maroon, block-print borders.

## 2026-10-24: Voices

- Read-aloud uses ElevenLabs voices in the style of each era (an older court munshi in 1857, a young
  Punjabi voice in 1929, a woman radio announcer through an old-radio filter in 1942, a crisp official
  in 1947), in Hindi and English. The browser voice was too poor.
- Two separate controls: a speaker icon for game sound on/off, and a microphone icon that reads the
  message aloud in the era voice.
- The ElevenLabs key lives only on the server (never in the repo or the browser). The voice endpoint
  accepts only our own message ids, and each clip is generated once and cached.
- For now the ElevenLabs account stays on the free plan, so the read-aloud button is hidden behind a
  build flag (`VITE_VOICE=on`) until the plan is upgraded.
- Players can switch read-aloud between the era voice and a "Dastango" storyteller voice. The game
  never imitates a real person's voice without their permission.
- Voices are generated with Fish Audio's free model for now; ElevenLabs stays as an option. Only
  original or designed voices are used: no community-uploaded clones of real people.
- The owner listened to the five Fish Audio samples and chose to keep these library voices. The
  read-aloud button is switched on now that the free model works.
- Simplified: one voice, the "Dastango" storyteller, reads every era. A guest voice of a real
  person is added only with that person's verifiable permission, and credited.

## 2026-10-24: Home screen

- Aaj ka Taar (the daily puzzle) is removed from the home screen for now; its code stays for later.
- Credits are one small line inside the home card.
- No modern UI components (gradient buttons, pills, round icon buttons). Every control is a period
  object: paper, ink stamp, brass, wax seal. Bigger on desktop.
- Opening the site goes straight to one main page: a period paper on the desk with the story, the
  chapter choice, who you are, the forger, and "how long can you hold out" (7/10/14 days). No
  separate language, setup or intro screens. Each era has its own ending stamp and heading.
- The result is shown on the same paper: the slip is circled in pencil with a margin note, then the
  paper turns over to show the verdict, the consequence, the stamp and the source.

## 2026-10-24: Going public

- The repository is public from the first push (MIT). Old 3D test screenshots were removed from the
  history first, and the history was scanned for keys and personal data.
- A Vercel preview goes up first, with the read-aloud voice on. The voice key is an encrypted
  Vercel environment variable and `/api/voice` is rate limited. firangitota.com and production go
  live only after the owner checks the preview.

## 2026-10-24: After a right stamp, and after a wrong one

- The day-count picker marks the chosen card by lifting it and looping its number in ink. No box,
  and no keyboard digits in the corners.
- No "Next" button after a right stamp. When the verdict has been read, the paper lifts off the desk
  and is tossed into the desk's basket, and the next day starts by itself. A tap hurries it.
- A wrong stamp plays out over a few seconds instead of all at once: the alarm sounds first, then
  the room reacts in time with it (red light, shaking, darkness), with more sounds, before the
  verdict turns over on the paper.
- The chosen chapter card lifts into warm lamplight with a brass pin; the other three fade back.
- Playing a chapter again brings different messages in a different order. The game remembers the
  last two runs of each chapter; dated events still fall on their true days.
- Nothing in the game praises the Muslim League. Facts about Jinnah and Pakistan in 1947 stay
  neutral and sourced, and every side still gets its receipts.
- After Begin, a short illustrated intro shows who you are and who the Tota is (original art).
- Sharing: WhatsApp, X, copy link and the phone's share menu. The post carries the result and the
  most interesting forgery of the run, and the link shows a large preview card for that chapter.
- Background sound: one calm instrumental bed and one gentle natural layer per chapter, quieter,
  with soft everyday sounds now and then (a page turning, footsteps, a cup), so the room feels
  lived in. Nothing startling and nothing religious. Music from video sites is an idea for later.

## 2026-10-24: Who you are and who the Tota is, as pictures

- The "You" and "Tota" lines left the main page. After Begin, before day 1, the room shows them as
  two illustrated cards on the desk: YOU as a dossier card with a portrait under a paper clip, and
  THE TOTA as a police notice with a small green parrot stamp. It plays on every Begin, a tap goes
  on, and it goes on by itself a few seconds after the cards settle.
- The owner chose original period-print art, one pair of portraits per chapter (eight in all), in
  one style: an Indian Company-school print on cream paper, in muted saffron, indigo, maroon and
  ink. No real person's likeness, no religious symbols, and every Tota carries a small green parrot.

## 2026-10-24: Live on firangitota.com

- The owner asked to put the game on firangitota.com. It went live with the toss, the caught
  sequence, the intro, sharing and the calm background sound.
- The voice key lives only in the Production environment again (previews have no voice), and the
  voice, share-card and share-link routes are rate limited per visitor.
- The intro waits for Continue; nothing on it goes on by itself. The day cards say "7 days",
  "10 days", "14 days".
- Phones start at full quality; only budget GPUs start lower, and a phone that struggles steps down
  for two days at most. Sound starts off, and the first tap on the speaker turns it on for good.
- The case file reads as a short story with its facts highlighted, in both languages.
- 1947's intro cards and telegram lie on a leather desk pad, framed like the other chapters.
- No electric-looking beam before electric light: 1857's mashaal and 1929's lantern spill a glow;
  only 1942's searchlight and 1947's torch make a beam.
- After a right stamp, two hands crumple the paper (palms facing, fingers round it) and drop the
  ball into the basket. Skip, or Enter, puts it in at once and starts the next day.
- Google Analytics and Vercel Analytics count visits and a few game events. Share cards are drawn
  ahead of time so previews load at once on WhatsApp and X.

## 2026-10-24: Rewards for right stamps

- Every right stamp earns a period-true treasure of its chapter, drawn at random like a loot drop:
  mostly the everyday coin or a sweet, now and then a silver (1947: nickel) rupee, and about once
  every two or three chapters a jackpot (the rare treasure, five rupees at once, or three sweets).
  Surviving a chapter adds its keepsake; surviving on Hard adds the rare treasure too.
- Collect only: rewards never pardon, hint or add time. One wrong stamp still ends the chapter.
- The treasures drop onto the paper's back beside its stamp, then sit as small real objects in the
  desk's free front-right corner: this run's during a chapter, the whole collection between
  chapters, the coin stacks capped with a count slip. A small treasure box on the home paper opens a
  tag of counts. The chapter's end says what the run earned in one line.
- Nothing religious. Each item and its reason are listed in `src/game/rewards.ts`.
