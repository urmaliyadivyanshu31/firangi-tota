# Contributing

Thank you for helping. Two rules matter most.

## The fact-check rule

Every fact needs a source with a page number or a URL. Read the book or paper itself, not a summary.
Where a real letter, telegram, leaflet or broadcast exists, use it and mark it as a real document with
its source. Fiction is allowed only where it is clearly game fiction, and is never presented as a
historical claim. Pull requests with unsourced facts will not be merged.

## Adding an era

An era is content plus its room. The content folder is found automatically; the room, the sound and
the colours are keyed by the era's id, and the typecheck lists every place that still needs one.

### 1. The content

1. Create a folder under `src/content/eras/`, named by place and year, for example `delhi-1857`.
   Its `index.ts` default-exports the `Era`: messages, case file, rulebook, receipts, epilogue and
   sources, in English and Hindi. Era folders are found automatically (`src/content/registry.ts`
   never changes); folders starting with `_` are fixtures and are skipped.
2. Follow [docs/content-style.md](docs/content-style.md) for wording, names, tone and the word limits.
3. Inside an era folder, end relative imports with `.js` (`import { facts } from './facts.js'`). The
   read-aloud server runs this content in plain Node, which needs the full file name.

### 2. The types

4. In `src/content/types.ts`, add the new id to the `EraId` union, and widen the `order` type of
   `Era` (`1 | 2 | 3 | 4`) by the next number. `order` sets the chapter's place on the main page.
5. Run `npm run typecheck`. Every map keyed by `EraId` now fails until the new era is in it. That is
   the checklist for the rest:
   - `server/eras.ts`: import the era and add it to `SERVER_ERAS` (the voice server cannot use the
     registry's `import.meta.glob`).
   - `src/scene/palette.ts`: the room's palette in `ERA_PALETTES`.
   - `src/scene/sheet.ts`: the day title's tone in `TITLE_TONE`.
   - `src/audio/ambience.ts`: the recorded bed in `BED_FILES`, the far-off one-shots in `LIFE` and
     the synthesized layers in `LAYERS`.
   - `dev/samples.ts`: the sample sheets, titles and verdicts the dev pages draw.

### 3. The room and its sound

6. Add the 3D desk as `src/scene/eras/<placeyear>.ts`, default-exporting an `EraDressing` whose `id`
   is the new era (copy the structure of an existing desk; `_sample.ts` is the fallback room). Desks
   are found by file name, so `src/scene/eras/index.ts` does not change. Add its test under
   `tests/scene/eras/`. Until the desk lands, the era plays in the sample room.
7. Add the room's recorded bed to `public/audio/<era-id>.m4a` (CC0 or public domain, a 27-30 s
   seamless mono loop, AAC about 48 kbps) and list it in [CREDITS.md](CREDITS.md). It is cached on
   first use, so it does not count toward the first-visit budget.
8. Optional: the day title's settle sound in `titleSettle` (`src/audio/synth.ts`); other eras fall
   back to the type-settling sound.
9. If the era brings a new kind of paper, add it to the `Channel` type and give it a sheet layout
   (`LAYOUTS` and `HEADINGS` in `src/scene/sheet.ts`), a stamp style (`STAMP_STYLE` in
   `src/ui/reveal.ts`) and its main-page tile art (`src/ui/screens/main.ts`).

### 4. Check it

10. `npm test` validates the content (sources, pencil marks, word limits, chapter building over
    many seeds), and `npm run build && npm run e2e` plays it in a browser.

**Why `EraId` is a closed union, not data.** The eras are found from their folders at build time,
but a list found at build time cannot become a TypeScript type. Keeping `EraId` closed is what turns
every `Record<EraId, …>` above into a compile-time checklist, so a new era can never ship without its
palette, sound or server entry. Making it a plain `string` would trade those errors for silent
fallbacks at run time, so it stays a union.

## Before you open a pull request

- `npm run typecheck`, `npm test` and `npm run build` must all pass.
- Any new font, sound or image must be CC0, public domain or properly licensed, and listed in [CREDITS.md](CREDITS.md).
- Do not add secrets or anything that identifies players.
