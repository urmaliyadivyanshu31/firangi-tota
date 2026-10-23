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
