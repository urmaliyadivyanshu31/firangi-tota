# Credits

Every third-party asset is CC0, public domain or properly licensed. Each entry gives its source and licence.

## Fonts

Self-hosted from `public/fonts/`. The files are the unmodified WOFF2 subsets that the Google Fonts CSS2 API
serves (only the `latin` and `devanagari` subsets are kept), loaded by `unicode-range` so a page only
downloads the scripts it shows.

| Family | Use | Files | Source | Licence |
|---|---|---|---|---|
| Mukta (Ek Type) | UI, Latin and Devanagari | `mukta-{400,600,700}-{latin,devanagari}.woff2` | https://fonts.google.com/specimen/Mukta | SIL Open Font License 1.1 |
| Tiro Devanagari Hindi (Tiro Typeworks) | Hindi text on the papers and receipts | `tiro-devanagari-hindi-400-{latin,devanagari}.woff2` | https://fonts.google.com/specimen/Tiro+Devanagari+Hindi | SIL Open Font License 1.1 |
| Old Standard TT (Alexey Kryukov) | 1857 English paper, receipt quotes | `old-standard-tt-400-latin.woff2` | https://fonts.google.com/specimen/Old+Standard+TT | SIL Open Font License 1.1 |
| Special Elite (Astigmatic) | Typewriter text: 1929, 1942 and 1947 papers | `special-elite-400-latin.woff2` | https://fonts.google.com/specimen/Special+Elite | Apache License 2.0 |
| Kalam (Indian Type Foundry), subset | Handwriting on the 3D papers: the pencil notes, the 1929 notes, signatures | `src/scene/fonts/note-hand.woff2` (Latin plus the Devanagari of the fixed pencil notes; licence beside it) | https://fonts.google.com/specimen/Kalam | SIL Open Font License 1.1 |

The full licence texts ship beside the font files, with each family's copyright line:

- Mukta: `public/fonts/OFL-Mukta.txt`
- Tiro Devanagari Hindi: `public/fonts/OFL-TiroDevanagariHindi.txt`
- Old Standard TT: `public/fonts/OFL-OldStandardTT.txt`
- Special Elite: `public/fonts/Apache-2.0-SpecialElite.txt`
- Kalam: `src/scene/fonts/note-hand-OFL.txt`

The licences are also published at https://openfontlicense.org (OFL 1.1) and https://www.apache.org/licenses/LICENSE-2.0 (Apache 2.0).

The share cards (`/api/og`, drawn on the server) set the same families from TrueType copies in
`server/og/fonts/`, because the card's shaper reads TTF and not WOFF2: Tiro Devanagari Hindi and Kalam
(Latin and Devanagari), Old Standard TT regular and bold, and Special Elite (Latin). They are subsets of
the unmodified TTFs in the Google Fonts repository (https://github.com/google/fonts: `ofl/tirodevanagarihindi`,
`ofl/kalam`, `ofl/oldstandardtt`, `apache/specialelite`), made by `scripts/og-fonts.sh`: the same Latin and
Devanagari ranges the game uses, every OpenType layout feature kept, hinting dropped. None of these fonts
declares a Reserved Font Name. Their licences ship beside them: `OFL-TiroDevanagariHindi.txt`,
`OFL-Kalam.txt`, `OFL-OldStandardTT.txt` and `Apache-2.0-SpecialElite.txt`. They are never sent to the browser.

## Sounds

Recorded beds are CC0 1.0 (public domain dedication), cut to 27-30 s seamless loops, mixed to mono and encoded as AAC (48 kbps, about -28 LUFS). Everything else you hear (stamps, paper, agarbatti tick, telegraph, shortwave static, valve hum, naqqara, tanpura, shehnai-like motif) is synthesized in the browser by `src/audio/synth.ts` and has no source file.

| File | Source sound | Author | URL | Licence |
|---|---|---|---|---|
| `public/audio/delhi-1857.m4a` | "Crows of Calcutta" mixed with "G52-05-Ox Cart" | Calcuttan; craigsmith | https://freesound.org/people/Calcuttan/sounds/249567/ ; https://freesound.org/people/craigsmith/sounds/437078/ | CC0 1.0 |
| `public/audio/lahore-1929.m4a` | "Steam Train Station Noises" | BobMorris1 | https://freesound.org/people/BobMorris1/sounds/414613/ | CC0 1.0 |
| `public/audio/bombay-1942.m4a` | "Indoors_Shed_RainOnTinRoof_01" | MrFossy | https://freesound.org/people/MrFossy/sounds/521773/ | CC0 1.0 |
| `public/audio/delhi-1947.m4a` | "Night time crickets, distant dogs and traffic" | SukritSen | https://freesound.org/people/SukritSen/sounds/482687/ | CC0 1.0 |
| `public/audio/typewriter.wav` (five key strikes and the space bar) | "Typing on a 1920s Remington" | rpnelson | https://freesound.org/people/rpnelson/sounds/793351/ | CC0 1.0 |
| `public/audio/typewriter.wav` (margin bell and carriage return) | "Typewriter bell & carriage reset" | knufds | https://freesound.org/people/knufds/sounds/345955/ | CC0 1.0 |

The typewriter sprite is cut from the sounds' Freesound HQ previews (a login is needed for the
original files; the licence is the same CC0), high-passed, levelled and stored as one 22.05 kHz mono
16-bit WAV (about 100 KB) so every key starts on its exact sample. Everything else new is
synthesized in `src/audio/synth.ts`: the seal crack, the paper and envelope sounds, the day-title
settle (a tabla "dha" in 1857), the bell for a right answer and the siren for a wrong one, the
interface sounds, the agarbatti and clock ticks, the teleprinter burst of the ending telegram, and
the occasional sounds of each era's street (naqqara, hooves, crows, tonga and bicycle bells, a train
whistle, a tram gong, an air-raid siren test, the sea, rain gusts, thunder, telegraph ticks).

## Voice

Read-aloud (optional, off unless the site turns it on) is generated by Fish Audio's text-to-speech from our own game text. The storyteller voice, the Dastango, is a Fish Audio community library voice, "बुजुर्ग प्रेरणा" (model id `65d76b8dc9be4ac78bbf77a93f2227b9`, set in `src/content/voices.ts`): https://fish.audio/m/65d76b8dc9be4ac78bbf77a93f2227b9. It is used under Fish Audio's terms of service, https://fish.audio/terms, and no voice clip is stored in this repository.

## Images

The parrot mark, the seal and the icons are drawn for this project (MIT, like the code).
The app icons in `public/icons/` (192, 512, maskable and apple-touch) are rendered from that parrot
mark by `scripts/icons.mjs` (MIT, like the code).
The share image `public/og.jpg` is our own screenshot of the game (the 1857 desk and the title paper), made by `dev/shoot-og.mjs` (MIT, like the code).
The result cards a share link previews (`/api/og`) are drawn for this project by `server/og/card.ts`
(MIT, like the code), with the title lettering and the parrot mark from the game.

The WhatsApp and X marks on the share slip are the glyphs from Simple Icons (https://simpleicons.org,
CC0 1.0), shown in each brand's colour only to link to that service's own share page. WhatsApp and X are
trademarks of their owners. The other marks on the slip (the link, the phone's share menu, the stamp and
postmark) are drawn for this project.

## Server libraries

The share cards are drawn on the server only, with resvg-js (https://github.com/yisibl/resvg-js, MPL-2.0)
to rasterize, harfbuzzjs (https://github.com/harfbuzz/harfbuzzjs, MIT; HarfBuzz itself is under the Old
MIT licence) to shape the text, Hindi included, and jpeg-js (https://github.com/eugeneware/jpeg-js,
BSD-3-Clause) to encode. None of them is part of the game the browser downloads.

## Game text

Game text is CC BY 4.0. Quoted third-party material (from books, papers and documents) is not covered by
that licence and stays with its owners; each quote shows its source.
