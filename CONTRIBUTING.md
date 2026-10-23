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

## Before you open a pull request

- `npm run typecheck`, `npm test` and `npm run build` must all pass.
- Any new font, sound or image must be CC0, public domain or properly licensed, and listed in [CREDITS.md](CREDITS.md).
- Do not add secrets or anything that identifies players.
