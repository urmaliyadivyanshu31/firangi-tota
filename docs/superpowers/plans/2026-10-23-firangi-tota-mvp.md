# Firangi Tota MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a static, open-source browser game with four playable chapters (Delhi 1857, Lahore 1929, Bombay 1942, Delhi 1947) plus the daily "Aaj ka Taar" puzzle, in English and Hindi, with a 3D desk that adapts to the phone.

**Architecture:** Pure game logic (`src/game/`) runs on typed content data (`src/content/`). A thin controller (`src/app.ts`) wires that logic to three output layers: a Three.js stage (`src/scene/`), DOM screens (`src/ui/`) and Web Audio (`src/audio/`). The readable message is a DOM "paper" panel, so text is crisp and screen readers can read it, and Hindi shaping is perfect. The 3D desk is atmosphere and the stamping moment. No backend: the daily puzzle is seeded by the IST date.

**Tech Stack:** Vite, TypeScript (strict), Three.js (npm, pinned), Vitest, Playwright (smoke test), vite-plugin-pwa (offline), Vercel (static hosting).

**Spec:** `docs/superpowers/specs/2026-10-23-firangi-tota-mvp-design.md` (read it first). Era facts come from `docs/research/<era>.md`. Owner decisions are in `docs/DECISIONS.md`. 3D findings are in `docs/research/spike-3d-report.md`, and asset picks with licences in `docs/research/assets-manifest.md` (both are copied in when those reports land).

## Global Constraints

- **Originality:** nothing is copied from atomiquest/Politburo-or-Parrot (it has no licence). Credit it as "Inspired by Politburo or Parrot by atomiquest", with a link, in the README and on the credits screen.
- **Licences:** code MIT; game text CC BY 4.0, excluding quoted third-party material. Every asset must be CC0, public domain or OFL/Apache, and listed in `CREDITS.md` with its source URL and licence.
- **Dependencies:** pin exact versions, each published at least two weeks ago. Runtime dependencies: `three` only. Dev dependencies: vite, typescript, vitest, @playwright/test, vite-plugin-pwa.
- **Devices:** Android 8+ with Chrome or WebView and 2 GB of RAM; iOS 15+ Safari; current desktop browsers. Build target: ES2019. KaiOS is out of scope.
- **Load budget:** first load ≤ 600 KB transferred (gzip), with JS ≤ 250 KB gzip. Fonts are subset WOFF2. Recorded audio loads lazily after the first tap.
- **Languages:** every player-facing string exists in `en` and `hi`. Hindi is simple everyday Hindustani in Devanagari, using Latin digits.
- **Copy:** no full stops at the end of banners, headers, buttons or card titles. Sentences in body text are fine.
- **Truth:** every fact, tell, receipt and real document carries at least one `SourceRef` that resolves to that era's `sources.ts`. Religion is never a tell, a punchline or a receipt target.
- **Chapters:** 14 real dates each, starting at the era's window start. Easy plays 7 days, Medium 10, Hard 14. One wrong stamp or a timeout ends the chapter, in every mode.
- **Timers (seconds):** Easy 90, Medium 60, Hard 40. Pencil marks: always in Easy; days 1–3 in Medium; never in Hard. In Hard, facts marked `hardHidden` are blank.
- **Daily puzzle:** 5 messages from one era, the era rotating daily. Seed = IST date `YYYY-MM-DD`. The puzzle plays all 5 even after a miss, so the share grid is complete. Medium rules, no pencil marks.
- **Touch targets** ≥ 48 px. Keyboard: `ArrowLeft`/`1` = ASLI, `ArrowRight`/`2` = TOTA. Respect `prefers-reduced-motion`.
- **Storage:** every `localStorage` read and write is wrapped in try/catch, and the game works without storage.

## Review Focus

1. **Hindi text that is longer than the English** (Devanagari runs ~20–40% wider): it must not overflow the paper panel, buttons or case file at 360 px wide. Covered by a Task 9 Playwright test at 360×740 in `hi`.
2. **A forged message whose tell names text that isn't in the message,** for example a `checks` underline substring missing from the Hindi text. Covered by a Task 2 validator test that each `checks.en/hi` substring occurs in `text.en/hi`.
3. **The daily puzzle across midnight IST and on a phone whose clock zone is not IST:** everyone must get the same puzzle for the same IST date. Covered by a Task 3 test that forces `Date` to 2026-11-01T18:45:00Z (00:15 IST on 2 Nov) and expects puzzle #10 (`DAILY_EPOCH` 2026-10-24 = #1). A date before the epoch clamps to #1.
4. **No WebGL, or the WebGL context is lost mid-game:** the game must keep working on the 2D fallback without losing the current day. Covered by a Task 5 test that mocks `getContext('webgl')` to return null and expects `createStage` to return null and the app to mount the fallback. A Task 9 test fires `webglcontextlost` and expects the day to stay playable.
5. **Storage blocked** (private mode, or the accessor throws): the game must start, play, and simply forget progress. Covered by a Task 3 test with a `localStorage` that throws on every call.

---

## Parallel groups (for the agent team)

- **Group A, in order:** Task 1 → Task 2 → Task 3. These are the foundation, and everything else depends on them.
- **Group B, in parallel once Task 2 is merged:** Tasks 10, 11, 12 and 13 (era content, one writer agent each, each followed by its fact-check review).
- **Group C, in parallel once Task 3 is merged:** Task 4 (i18n and UI shell), Task 5 (stage foundation) → Task 6 (era desks), and Task 7 (audio).
- **Group D, after Groups B and C:** Task 8 (controller wiring) → Task 9 (PWA, smoke tests, budget) → Task 14 (deploy preview).

---

### Task 1: Repository foundation

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `index.html`, `src/main.ts`, `.gitignore`, `LICENSE` (MIT, "Copyright (c) 2026 Divyanshu Urmaliya"), `README.md`, `CREDITS.md`, `CONTRIBUTING.md`, `docs/content-style.md`, `vercel.json`, `.github/workflows/ci.yml`, `.github/pull_request_template.md`
- Test: `tests/smoke.test.ts`

**Interfaces:**
- Produces: the scripts `npm run dev | build | preview | test | typecheck`, and `src/main.ts` exporting nothing (the entry point).

- [ ] **Step 1: Write a failing test,** `tests/smoke.test.ts`: `it('runs the test harness', () => expect(1 + 1).toBe(2))`. Run `npm test` before installing anything. Expected: the command fails because nothing is installed yet.
- [ ] **Step 2: Scaffold.**
  - Install pinned dev dependencies and `three`.
  - `tsconfig`: `strict`, `noUncheckedIndexedAccess`, `target ES2019`, `moduleResolution bundler`.
  - Vite: `build.target 'es2019'`.
  - `index.html`: `<div id="stage"></div><div id="ui"></div>`, `lang="en"`, the viewport meta, and the title "Firangi Tota".
- [ ] **Step 3: Write the docs.**
  - **README:** what the game is, how to play, how to run it, the credit line, the licence summary, and a link to CONTRIBUTING.
  - **CONTRIBUTING:** the fact-check rule (every fact needs a source with page or URL), how to add an era folder, and that tests must pass.
  - **`docs/content-style.md`:**
    - the Hindi rules (simple Hindustani, Latin digits, short sentences);
    - consistent transliterations for recurring names, e.g. बहादुर शाह ज़फ़र, भगत सिंह, उषा मेहता, माउंटबेटन;
    - the no-full-stop display-copy rule;
    - the receipt-card rules from the spec.
  - **`CREDITS.md`:** sections for fonts, sounds and images, initially empty.
- [ ] **Step 4: Configure CI and hosting.**
  - `ci.yml`: Node 22; `npm ci`; `npm run typecheck`; `npm test`; `npm run build`.
  - `vercel.json`: `Cache-Control: public, max-age=31536000, immutable` for `/assets/*`; `no-cache` for `/index.html` and `/sw.js`.
- [ ] **Step 5: Verify.** Run `npm test && npm run typecheck && npm run build`. Expected: all three pass and `dist/` exists.
- [ ] **Step 6: Commit.** `git add -A && git commit -m "chore: scaffold Vite + TS + three with CI, licences and contributor docs"`

---

### Task 2: Content contract and validator

**Files:**
- Create: `src/content/types.ts`, `src/content/validate.ts`, `src/content/registry.ts`, `src/content/eras/_fixture/index.ts` (a tiny test era, excluded from the registry)
- Test: `tests/content/validate.test.ts`, `tests/content/eras.test.ts`

**Interfaces:**
- Produces, in `types.ts`:

```ts
export type Lang = 'en' | 'hi';
export type L10n = Record<Lang, string>;
export type EraId = 'delhi-1857' | 'lahore-1929' | 'bombay-1942' | 'delhi-1947';
export type Channel = 'petition' | 'note' | 'radio' | 'telegram';
export type Tier = 1 | 2 | 3;
export type TellKind = 'name' | 'place' | 'number' | 'date' | 'weekday' | 'anachronism'
  | 'habit' | 'empty-loop' | 'form' | 'knowledge';

export interface Source { id: string; author: string; title: string; year: string; url?: string }
export interface SourceRef { id: string; loc?: string }            // loc: page, section or URL anchor
export interface Fact { id: string; label: L10n; value: L10n; sources: SourceRef[]; hardHidden?: boolean }
export interface Rule { id: string; text: L10n; arrivesOnDay: number } // 1-based day index
export interface Tell { kind: TellKind; explain: L10n; factId?: string; sources?: SourceRef[] }
export interface Message {
  id: string; tier: Tier; real: boolean; pair?: string; onDay?: number;
  from: L10n; to: L10n; text: L10n;               // text may contain {date} {weekday} {date+N} {weekday+N}
  checks?: { en: string[]; hi: string[] };        // pencil-mark substrings (after placeholder fill)
  document?: { sources: SourceRef[] };            // present => "📜 Real document"
  why?: { text: L10n; sources: SourceRef[] };     // required when real
  tells?: Tell[];                                 // required (≥1) when forged
}
export interface Receipt { id: string; who: L10n; quote: L10n; joke: L10n; theirSide?: L10n; source: SourceRef }
export interface Epilogue { survived: L10n[]; caught: L10n[]; sources: SourceRef[] }
export interface Era {
  id: EraId; order: 1 | 2 | 3 | 4; title: L10n; place: L10n; year: string;
  persona: L10n; intro: [L10n, L10n]; windowStart: string;   // ISO 'YYYY-MM-DD', 14 days from here
  channel: Channel; forger: L10n;
  sources: Source[]; facts: Fact[]; rules: Rule[]; messages: Message[];
  receipts: Receipt[]; epilogue: Epilogue;
}
```

- Produces: `validateEra(era: Era): string[]`, which returns human-readable problems (an empty array means valid), and `ERAS: Era[]` plus `eraById(id: EraId): Era` in `registry.ts`.

- [ ] **Step 1: Write failing validator tests** in `validate.test.ts`. Each takes the valid `_fixture` era, breaks one thing, and expects a problem string containing the given text:
  - a forged message with no tells → `"m1: forged message needs at least one tell"`;
  - a real message without `why` → `"why"`;
  - a `SourceRef` id missing from `sources` → `"unknown source"`;
  - a `Tell.factId` missing from `facts` → `"unknown fact"`;
  - a missing `hi` string → `"missing hi"`;
  - a `checks.hi` substring absent from `text.hi` after filling → `"check not found"`;
  - two messages with the same id → `"duplicate id"`;
  - `onDay` outside 1–14 → `"onDay"`;
  - a `Rule.arrivesOnDay` outside 1–14 → `"arrivesOnDay"`.
  - The untouched fixture → `[]`.
- [ ] **Step 2: Run** `npx vitest run tests/content/validate.test.ts`. Expected: FAIL, because `validateEra` is not defined.
- [ ] **Step 3: Implement `validateEra`.** Fill placeholders with the window's first date (via `fillTemplate` from Task 3) before checking `checks`. Until Task 3 lands, use a local stub that strips `{…}` tokens, and replace it in Task 3.
- [ ] **Step 4: Write `eras.test.ts`.** For each era in `ERAS`: `expect(validateEra(era)).toEqual([])`; at least 40 messages; at least 16 real and 16 forged; at least 1 message per tier 1–3; 8–10 facts; 5–7 rules; 2–3 receipts. While `ERAS` is empty the test passes trivially, and the content tasks make it bite.
- [ ] **Step 5: Run** `npm test`. Expected: PASS.
- [ ] **Step 6: Commit** `feat(content): typed era contract with validator and fixture era`.

---

### Task 3: Game core (pure logic)

**Files:**
- Create: `src/game/rng.ts`, `src/game/dates.ts`, `src/game/run.ts`, `src/game/state.ts`, `src/game/daily.ts`, `src/game/share.ts`, `src/game/storage.ts`, `src/game/config.ts`
- Modify: `src/content/validate.ts` (use the real `fillTemplate`)
- Test: `tests/game/*.test.ts`

**Interfaces:**
- Consumes: the Task 2 types.
- Produces:
  - `mulberry32(seed: number): () => number`; `seedFrom(text: string): number` (FNV-1a).
  - `fillTemplate(text: string, isoDate: string, lang: Lang): string`. Supports `{date}`, `{weekday}`, `{date+N}` and `{weekday+N}`. EN form: "Tuesday" and "19 May 1857". HI form: "मंगलवार" and "19 मई 1857".
  - `dayDate(era: Era, dayIndex: number): string` (ISO; day 1 = `windowStart`).
  - `type Difficulty = 'easy' | 'medium' | 'hard'`; `DAYS: Record<Difficulty, 7 | 10 | 14>`; `TIMER_S: Record<Difficulty, number>` = {easy: 90, medium: 60, hard: 40}; `pencilOn(d: Difficulty, day: number): boolean`.
  - `buildRun(era: Era, d: Difficulty, rng: () => number): Message[]`, with one message per day.
  - The state machine: `type Phase = 'reading' | 'stamped' | 'caught' | 'survived'`; `createChapter(era, d, rng): ChapterState`; `stamp(s: ChapterState, verdict: 'asli' | 'tota' | 'timeout'): ChapterState`; `nextDay(s): ChapterState`.
  - `ChapterState = { era: EraId; difficulty: Difficulty; day: number; days: number; queue: Message[]; phase: Phase; lastCorrect?: boolean }`.
  - `dailyFor(nowMs: number): { number: number; isoDate: string; era: EraId; messages: Message[] }`. `DAILY_EPOCH = '2026-10-24'` (in `config.ts`) is puzzle #1; earlier dates clamp to #1. The era rotates in `order` sequence starting with delhi-1857.
  - `shareText(p: { daily: number; eraTitle: string; results: boolean[] }): string`.
  - `store.get<T>(key: string, fallback: T): T` and `store.set(key: string, value: unknown): void`, never throwing.

- [ ] **Step 1: Write failing tests.**
  - `fillTemplate('{weekday}, {date}', '1857-05-17', 'en') === 'Sunday, 17 May 1857'`.
  - The same template in `hi` gives `'रविवार, 17 मई 1857'`.
  - `fillTemplate('{weekday+1}', '1947-08-14', 'en') === 'Friday'`.
  - `dayDate(fixture, 14)` is 13 days after `windowStart`.
- [ ] **Step 2: Write failing `buildRun` tests** against a fixture pool of 20 pairs, over 200 seeds:
  - the length equals `DAYS[d]`;
  - there are no duplicate ids;
  - both members of a `pair` never appear;
  - an `onDay` message appears only on its day;
  - in every Easy run, days 1–3 are tier 1;
  - Hard runs include at least 2 tier-3 messages;
  - each run has at least 2 real and at least 2 forged messages;
  - the same seed gives the same run.
- [ ] **Step 3: Write failing state tests.**
  - A correct stamp sets `phase` to `'stamped'` and `lastCorrect` to true.
  - A wrong stamp sets `'caught'`.
  - `'timeout'` sets `'caught'`.
  - `nextDay` on the last day after a correct stamp sets `'survived'`.
  - `stamp` in any phase other than `'reading'` returns the state unchanged.
- [ ] **Step 4: Write failing daily, share and storage tests.**
  - `dailyFor(Date.UTC(2026,10,1,18,45))` gives `isoDate === '2026-11-02'` and `number === 10` (the IST rollover). `dailyFor(Date.UTC(2026,9,1))` gives `number === 1` (the clamp).
  - The same `nowMs` gives the same messages.
  - There are 5 messages.
  - `shareText({daily: 12, eraTitle: 'Dilli 1857', results: [true,true,false,true,true]})` equals `'Firangi Tota · Aaj ka Taar #12 · Dilli 1857\n✅✅❌✅✅\nfirangitota.com'`.
  - `store` with a `localStorage` that throws: `get` returns the fallback and `set` doesn't throw.
- [ ] **Step 5: Run** `npx vitest run tests/game`. Expected: FAIL (the modules are missing).
- [ ] **Step 6: Implement.**
  - `buildRun`:
    - Pick tier 1 for days 1–3.
    - Then use a mix that tilts toward tiers 2 and 3 as days pass. In Hard, tier 3 is allowed from day 5.
    - Draw `real` with p = 0.5, then fix up the ends to guarantee at least 2 of each.
    - Place `onDay` messages first.
  - `dailyFor`:
    - Compute the IST date as UTC + 330 minutes.
    - `number` = max(1, days since `DAILY_EPOCH` + 1).
    - The era is `ERAS[(number-1) % 4]`.
    - Draw 5 from that era's full pool with `mulberry32(seedFrom(isoDate))`, respecting pairs.
- [ ] **Step 7: Run** `npm test`. Expected: PASS.
- [ ] **Step 8: Commit** `feat(game): seeded runs, chapter state machine, daily puzzle, share text, safe storage`.

---

### Task 4: i18n strings and the DOM UI shell

**Files:**
- Create: `src/i18n/strings.ts` (an `en`/`hi` UI dictionary), `src/i18n/lang.ts`, `src/ui/h.ts` (a tiny element helper), `src/ui/styles.css`, `src/ui/screens/home.ts`, `src/ui/screens/setup.ts`, `src/ui/screens/intro.ts`, `src/ui/screens/day.ts`, `src/ui/screens/end.ts`, `src/ui/screens/language.ts`, `src/ui/paper.ts`, `src/ui/speak.ts`
- Test: `tests/ui/*.test.ts` (Vitest with jsdom)

**Interfaces:**
- Consumes: Task 2 types; Task 3 `ChapterState`, `fillTemplate`, `pencilOn`, `shareText`.
- Produces:
  - Every screen is a function `(root: HTMLElement, props, on: Handlers) => void` that replaces the contents of `root`.
  - `renderLanguage(root, on: { pick(l: Lang): void })`.
  - `renderHome(root, { eras, best, dailyDone }, on: { chapter(id), daily(), continue(), lang(), sound() })`.
  - `renderSetup(root, { era }, on: { start(d: Difficulty), back() })`.
  - `renderIntro(root, { era }, on: { next() })`.
  - `renderDay(root, { era, state, isoDate, timerFrac, lang, revealed }, on: { stamp(v: 'asli' | 'tota'), speak(), tab(t: 'file' | 'rules') })`.
  - `renderEnd(root, { era, state, outcome: 'survived' | 'caught', receipts, epilogue, share?: string }, on: { again(), home(), share() })`.
  - `t(key: keyof Strings, lang: Lang): string`.
  - `paperEl(msg: Message, era: Era, isoDate: string, lang: Lang, pencil: boolean): HTMLElement`. It is styled by channel: the petition carries seal and honorific framing; the note is pink for 1929 leaflets; the radio slip is a typed script; the telegram has a MOST IMMEDIATE header and a number.
  - `speak(text: string, lang: Lang): void` and `canSpeak(lang: Lang): boolean`. They use `speechSynthesis` with a voice whose `lang` starts with `hi` or `en-IN`/`en`.

- [ ] **Step 1: Write failing tests.**
  - `renderDay` in `hi` shows the ASLI/TOTA buttons with labels from `strings.hi`.
  - The pencil underlines are `<mark class="pencil">` exactly around each `checks.hi` substring when `pencil` is true, and absent when it is false.
  - Facts marked `hardHidden` render as "—" in Hard.
  - Rules with `arrivesOnDay > state.day` are not shown, and new ones carry a "NEW / नया" tag.
  - `renderEnd` shows every receipt's quote and source, and the result line ("📜 Real document" or "Written for the game · every detail checks out") for the last message.
  - `canSpeak` returns false when `speechSynthesis` is undefined, and the speaker button is hidden.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement the screens.**
  - The layout is mobile-first, with a 16 px side gutter.
  - The paper panel scrolls inside itself.
  - The stamp buttons are fixed to the bottom and at least 56 px tall.
  - The agarbatti timer is drawn in CSS at the top: a stick burning down from `timerFrac`, turning red under 30%.
  - Announce new messages and results through an `aria-live="polite"` region.
  - The UI fonts come from the assets manifest, self-hosted under `public/fonts/` and recorded in CREDITS.
- [ ] **Step 4: Run** `npm test`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(ui): bilingual screens, paper panel by channel, agarbatti timer, read-aloud`.

---

### Task 5: Stage foundation (3D) and the 2D fallback

**Files:**
- Create: `src/scene/stage.ts`, `src/scene/quality.ts`, `src/scene/tween.ts`, `src/scene/props.ts` (the shared desk, stamps and paper mesh), `src/scene/textures.ts` (procedural canvas textures), `src/scene/fallback.ts`, `src/scene/types.ts`
- Test: `tests/scene/quality.test.ts`, `tests/scene/stage.test.ts`

**Interfaces:**
- Consumes: `EraId`.
- Produces:
  - In `types.ts`:

    ```ts
    export type QualityTier = 'low' | 'mid' | 'high';
    export interface EraDressing {
      id: EraId;
      build(ctx: { scene: THREE.Scene; tier: QualityTier; rng: () => number }): { update(tMs: number): void; dispose(): void };
      camera: { pos: [number, number, number]; look: [number, number, number] };
      lightColor: number;
    }
    ```

  - `pickInitialTier(sig: { dpr: number; cores?: number; memGB?: number; gpu?: string; minSide: number }): QualityTier`.
  - `createQualityManager(start: QualityTier, apply: (t: QualityTier) => void)`, returning `{ sample(frameMs: number): void; tier(): QualityTier }`.
  - `createStage(el: HTMLElement, opts: { reducedMotion: boolean; forceTier?: QualityTier }): Stage | null`, returning null when WebGL is unavailable.
  - `Stage = { setEra(d: EraDressing): void; showPaper(): void; stamp(kind: 'asli' | 'tota'): Promise<void>; caught(): Promise<void>; setPaused(p: boolean): void; dispose(): void }`.
  - `mountFallback(el: HTMLElement, era: EraId): { setEra(id: EraId): void; dispose(): void }`, which draws a still desk onto a 2D canvas.

- [ ] **Step 1: Write failing tests.**
  - `pickInitialTier({dpr: 3, gpu: 'Mali-T720', minSide: 360})` gives `'low'`.
  - `pickInitialTier({dpr: 2, gpu: 'Apple GPU', minSide: 390, cores: 6})` gives `'high'`.
  - `pickInitialTier({dpr: 2, gpu: 'Adreno (TM) 610', minSide: 393, cores: 8, memGB: 4})` gives `'mid'`.
  - The quality manager steps down after 120 samples averaging under 22 ms, steps up after 240 samples under 15 ms, never leaves the low/high bounds, and changes tier at most once every 3 s.
  - `createStage` returns null when `HTMLCanvasElement.prototype.getContext` returns null.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
  - Take tier thresholds and GPU patterns from `docs/research/spike-3d-report.md`.
  - Per tier: high = pixel ratio min(dpr, 2), PCFSoft shadows at 1024, antialias; mid = 1.5, basic shadows at 512; low = 1, no shadows, Lambert materials, minimal particles.
  - Antialias is decided before the renderer is created.
  - Pause on `visibilitychange`.
  - On `webglcontextlost`, call `preventDefault`, show the fallback, and keep the game running.
  - Write every shader and geometry yourself; copy nothing from the reference.
- [ ] **Step 4: Run** `npm test`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(scene): adaptive-quality stage, shared desk props, 2D fallback`.

---

### Task 6: The four era desks

**Files:**
- Create: `src/scene/eras/delhi1857.ts`, `src/scene/eras/lahore1929.ts`, `src/scene/eras/bombay1942.ts`, `src/scene/eras/delhi1947.ts`, `src/scene/eras/index.ts` (`dressingFor(id: EraId): EraDressing`)
- Test: `tests/scene/eras.test.ts`

**Interfaces:**
- Consumes: `EraDressing` and the props from Task 5.
- Produces: `dressingFor(id)`.

- [ ] **Step 1: Write a failing test.** For each era id, `dressingFor(id).build(...)` with a mocked `THREE.Scene` adds at least one light and at least 5 meshes; at tier `'low'` it adds no shadow-casting lights; `dispose()` removes everything it added.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement** each desk from the spec's "Scene" lines. Everything is procedural (primitives plus canvas textures). One draw-call budget applies at every tier: ≤ 120 at high and ≤ 60 at low, checked with `renderer.info` in a dev overlay (`?debug`).
  - **1857:** a low writing desk, a chirag with flicker, a qalam and inkpot, sealed petitions, and a jharokha onto a night skyline.
  - **1929:** a lantern, a bicycle silhouette, newspapers and pink leaflets.
  - **1942:** a valve transmitter with glowing tubes, a microphone, a gramophone and a curtained window.
  - **1947:** a ceiling fan (rotating), a typewriter, telegram forms, a tear-off calendar and rain on the window.
- [ ] **Step 4: Run** `npm test`. Expected: PASS.
- [ ] **Step 5: Screenshot all four** at 390×844 with `npm run dev` and Playwright `?tier=low` and `?tier=high`. Save them to `docs/screens/`. Self-review: does each read as its era at a glance?
- [ ] **Step 6: Commit** `feat(scene): four era desks`.

---

### Task 7: Audio

**Files:**
- Create: `src/audio/engine.ts`, `src/audio/synth.ts`, `src/audio/ambience.ts`, `public/audio/*` (only the CC0/PD files chosen from the assets manifest, ≤ 300 KB per era, mono)
- Modify: `CREDITS.md`
- Test: `tests/audio/engine.test.ts`

**Interfaces:**
- Produces: `audio.unlock(): void` (call on the first user gesture); `audio.setMuted(m: boolean): void`; `audio.cue(c: Cue): void`; `audio.ambience(id: EraId | null): void`; and `type Cue = 'arrive' | 'stampAsli' | 'stampTota' | 'tick' | 'correct' | 'caught' | 'survived' | 'page'`.

- [ ] **Step 1: Write failing tests** with a mocked `AudioContext`: `cue()` before `unlock()` is a no-op; `setMuted(true)` sets the master gain to 0; `ambience('bombay-1942')` then `ambience(null)` stops the bed; when `AudioContext` is missing, every call is a safe no-op.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement the synth layer and the era beds.**
  - **Synthesized:** stamp thump, paper rustle, agarbatti crackle tick, telegraph needle ticks plus call bell (1857 and 1947, no Morse sounder in 1857), shortwave static and tuning plus valve hum (1942), naqqara drum hits, tanpura-like drone, correct (a soft rising shehnai-like motif), caught (a low drum and metal door).
  - **Recorded beds** (from the manifest): load them lazily after unlock.
- [ ] **Step 4: Run** `npm test`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(audio): synthesized cues and era ambience`.

---

### Task 8: Controller wiring

**Files:**
- Create: `src/app.ts`
- Modify: `src/main.ts`
- Test: `tests/app.test.ts` (jsdom, with the stage and audio mocked)

**Interfaces:**
- Consumes: everything above.
- Produces: `startApp(root: { stage: HTMLElement; ui: HTMLElement }, env: { now(): number; random(): number; url: URL }): void`.
  - URL params: `?seed=<n>` (fixed RNG), `?tier=low|mid|high`, `?lang=en|hi`, `?debug`.

- [ ] **Step 1: Write failing tests.**
  - A first visit shows the language screen; choosing हिंदी persists `lang` and shows home in Hindi.
  - The flow 1857 → Easy → intro → day 1 → correct stamp shows the reveal (tell or why, with its source), then day 2.
  - A wrong stamp shows the caught end screen with the receipts.
  - The timer reaching 0 counts as a timeout and is caught.
  - Daily: 5 stamps, then a share screen whose text matches `shareText`; replaying the same IST date shows the stored result, not a new run.
  - "Continue" points to the first era without a survived run, in `order`.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
  - Use one `requestAnimationFrame` loop for the timer, and pause it while the reveal shows or the tab is hidden.
  - Unlock audio on the first tap.
  - Use `navigator.share` when it exists; otherwise copy to the clipboard and show a "Copied" toast, with a `whatsapp://send?text=` link on mobile.
  - Include a credits screen reachable from home: inspired-by credit, licences, CREDITS.md content.
- [ ] **Step 4: Run** `npm test`. Expected: PASS.
- [ ] **Step 5: Commit** `feat(app): wire game, stage, UI and audio; daily puzzle flow; credits`.

---

### Task 9: Offline, smoke tests and budget

**Files:**
- Modify: `vite.config.ts` (vite-plugin-pwa: `registerType 'autoUpdate'`, precache the app shell, fonts and audio; manifest name "Firangi Tota", theme colour from the 1857 palette, icons in `public/icons/`)
- Create: `tests/e2e/smoke.spec.ts`, `scripts/budget.mjs`, `playwright.config.ts`
- Modify: `package.json` (scripts `e2e` and `budget`), `.github/workflows/ci.yml` (run `budget`)

- [ ] **Step 1: Write the failing e2e tests,** with the Playwright mobile projects "Pixel 5" and "iPhone 13":
  - load `/?seed=1&lang=hi&tier=low`, pick 1857 → Easy, start, and expect the paper panel to be visible with no horizontal scroll at 360×740 (`document.documentElement.scrollWidth <= 360`);
  - stamp and expect the reveal;
  - zero console errors;
  - a second run with WebGL disabled (`--disable-webgl`) plays day 1 on the fallback;
  - dispatching `webglcontextlost` on the canvas mid-day keeps the stamp buttons working.
- [ ] **Step 2: Write `scripts/budget.mjs`.** It gzips everything in `dist/` that the first load needs (HTML, entry JS and CSS, preloaded fonts) and fails if the total is over 600 KB or JS is over 250 KB.
- [ ] **Step 3: Run** `npm run build && npm run budget && npm run e2e`. Expected: PASS.
- [ ] **Step 4: Commit** `chore: offline PWA, mobile smoke tests, size budget`.

---

### Tasks 10–13: Era content (one task per era, run in parallel)

Task 10 = `delhi-1857`, Task 11 = `lahore-1929`, Task 12 = `bombay-1942`, Task 13 = `delhi-1947`.

**Files (per era):**
- Create: `src/content/eras/<era>/index.ts` (exports the `Era`), `sources.ts`, `facts.ts`, `rules.ts`, `messages.ts`, `receipts.ts`, `epilogue.ts`
- Modify: `src/content/registry.ts` (add the era)
- Test: covered by `tests/content/eras.test.ts`

**Interfaces:**
- Consumes: the Task 2 types and `docs/research/<era>.md`; the spec's era section is binding (persona, window start, forger, channel, caught framing).

- [ ] **Step 1: Register the era with an empty pool.** Run `npm test` and expect `eras.test.ts` to FAIL on the counts. This is the failing test.
- [ ] **Step 2: Write `sources.ts`.** Include every source the dossier cites that the content uses; ids are short slugs (`metcalfe-1898`).
- [ ] **Step 3: Write the case file and rules.**
  - 8–10 facts from dossier §4. Mark 2–3 of them `hardHidden`: ones a history buff knows.
  - 5–7 rules from dossier §6–7 and the spec's "Rules from the record", arriving on days 1, 1, 2, 3, 5, 7 (and 9).
- [ ] **Step 4: Write `messages.ts`.**
  - **Counts:** at least 40 messages and at least 20 pairs; tier 1 (case-file catches), tier 2 (subtler: habit, weekday, form), tier 3 (knowledge tells, Hard only).
  - **Real documents:** 4–8 real documents from dossier §5, marked with `document`.
  - **Forgeries:** use dossier §7's tempting variants and the spec's hard tells.
  - **Pencil marks:** every message has `checks` in both languages.
  - **Event messages:** a few `onDay` messages for the window's dated events.
  - **Hindi:** follow `docs/content-style.md`.
- [ ] **Step 5: Write `receipts.ts`** (2–3 from dossier §12, with `theirSide` where the dossier has it) and `epilogue.ts` (survived and caught paragraphs from the spec's era section, sourced).
- [ ] **Step 6: Run** `npm test`. Expected: PASS for this era.
- [ ] **Step 7: Fact-check review.** A separate reviewer agent checks every message, fact, tell, receipt and epilogue line against the dossier and its sources. It reports anything unsupported, any religion used as a tell, and any Hindi that is hard for a village kid. Fix it all, then re-run `npm test`.
- [ ] **Step 8: Commit** `content(<era>): case file, rules, 40+ messages, receipts and epilogue`.

---

### Task 14: Preview deploy

**Files:**
- Modify: `README.md` (live link)

- [ ] **Step 1: Create the public repo.** `gh repo create urmaliyadivyanshu31/firangi-tota --public --source . --push`.
- [ ] **Step 2: Deploy.** `node ~/.vercel-cli/node_modules/vercel/dist/vc.js --scope oxdivs-projects deploy` (preview, not production).
- [ ] **Step 3: Check the live preview.** Open it at 360 px in Playwright and play a day in each era.
- [ ] **Step 4: Send the owner the preview link** for the Hindi and receipt review. Production and the domain wait for his OK.
- [ ] **Step 5: Commit and push** `docs: add preview link`.
