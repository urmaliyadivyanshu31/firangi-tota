# Contributing

Thank you for helping. Two rules matter most.

## The fact-check rule

Every fact needs a source with a page number or a URL. Read the book or paper itself, not a summary.
Where a real letter, telegram, leaflet or broadcast exists, use it and mark it as a real document with
its source. Fiction is allowed only where it is clearly game fiction, and is never presented as a
historical claim. Pull requests with unsourced facts will not be merged.

## Adding an era

1. Create a folder for the era under `src/content/eras/`, named by place and year, for example `delhi-1857`.
2. Put the messages, case file and sources for that era inside it, in English and Hindi.
3. Follow [docs/content-style.md](docs/content-style.md) for wording, names and tone.
4. Add a test for the new content.
5. Era folders are found automatically; you never edit `registry.ts`. Folders starting with `_` are fixtures and are skipped.
6. Inside an era folder, end relative imports with `.js` (`import { facts } from './facts.js'`). The
   read-aloud server runs this content in plain Node, which needs the full file name. Then add the
   era to `server/eras.ts` and give it a voice in `server/voices.ts`; the typecheck reminds you.

## Before you open a pull request

- `npm run typecheck`, `npm test` and `npm run build` must all pass.
- Any new font, sound or image must be CC0, public domain or properly licensed, and listed in [CREDITS.md](CREDITS.md).
- Do not add secrets or anything that identifies players.
