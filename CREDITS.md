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

Every recorded sound is CC0 1.0 (public domain dedication), cut from the sound's Freesound HQ preview by `dev/ambience-assets.mjs` and stored as mono AAC: each era's room bed as a 34-40 s seamless loop (48 kbps), its instrument as an 18-39 s loop cut on the instrument's own cycle (32 kbps), and the rooms' small sounds as one sprite, `public/audio/room.m4a` (32 kbps). Everything else you hear (stamps, paper, agarbatti tick, telegraph, 1942's low pad and valve hum, the 1947 ceiling fan, the room clocks, the tonga bell) is synthesized in the browser by `src/audio/synth.ts` and `src/audio/ambience-synth.ts` and has no source file.

| File | Source sound | Author | URL | Licence |
|---|---|---|---|---|
| `public/audio/delhi-1857.m4a` (a garden fountain) | "Garden Fountain.wav" | kkingotu | https://freesound.org/people/kkingotu/sounds/434815/ | CC0 1.0 |
| `public/audio/lahore-1929.m4a` (a breeze) | "Wheat Field Ambience" | florianreichelt | https://freesound.org/people/florianreichelt/sounds/447810/ | CC0 1.0 |
| `public/audio/bombay-1942.m4a` (monsoon rain and the sea) | "The sound of rain pouring on a balcony" mixed with "Calm ocean waves" | hoshisato; SamsterBirdies | https://freesound.org/people/hoshisato/sounds/825226/ ; https://freesound.org/people/SamsterBirdies/sounds/578524/ | CC0 1.0 |
| `public/audio/delhi-1947.m4a` (rain outside) | "Rain background" | xkeril | https://freesound.org/people/xkeril/sounds/669485/ | CC0 1.0 |
| `public/audio/delhi-1857-music.m4a` (tanpura in C#) | "Tanpura 10" | sankalp | https://freesound.org/people/sankalp/sounds/153262/ | CC0 1.0 |
| `public/audio/lahore-1929-music.m4a` (harmonium, lowered to A) | "Harmonium Drone2" | easy_thunder | https://freesound.org/people/easy_thunder/sounds/264442/ | CC0 1.0 |
| `public/audio/delhi-1947-music.m4a` (tanpura in E) | "Tanpura in E" | iluppai | https://freesound.org/people/iluppai/sounds/148850/ | CC0 1.0 |
| `public/audio/room.m4a` (a page turned) | "Turning a page in a book" | pierreluclandry | https://freesound.org/people/pierreluclandry/sounds/840192/ | CC0 1.0 |
| `public/audio/room.m4a` (a pen nib) | "Fountain Pen Scratching Paper" | DataJuggler | https://freesound.org/people/DataJuggler/sounds/750171/ | CC0 1.0 |
| `public/audio/room.m4a` (a pencil) | "Writing with pencil 2" | fthgurdy | https://freesound.org/people/fthgurdy/sounds/376705/ | CC0 1.0 |
| `public/audio/room.m4a` (wood creaking) | "Creaking in Room 8.wav" | Greg_Surr | https://freesound.org/people/Greg_Surr/sounds/590171/ | CC0 1.0 |
| `public/audio/room.m4a` (a chair) | "Squeaky Chair" | jashngooyen | https://freesound.org/people/jashngooyen/sounds/556763/ | CC0 1.0 |
| `public/audio/room.m4a` (a cup on its saucer) | "Tea cup set down 2.mp3" | TheHiraHira | https://freesound.org/people/TheHiraHira/sounds/460241/ | CC0 1.0 |
| `public/audio/room.m4a` (tea poured) | "pouring with two drips at the end" | Mafon2 | https://freesound.org/people/Mafon2/sounds/330025/ | CC0 1.0 |
| `public/audio/room.m4a` (a spoon in a cup) | "Spoon in a teacup" | HeyItsArnold | https://freesound.org/people/HeyItsArnold/sounds/444892/ | CC0 1.0 |
| `public/audio/room.m4a` (footsteps passing) | "Monastery Footsteps.wav" | markadirector | https://freesound.org/people/markadirector/sounds/467417/ | CC0 1.0 |
| `public/audio/room.m4a` (a door closing) | "Close Wooden Door Quiet" | nozefian | https://freesound.org/people/nozefian/sounds/397918/ | CC0 1.0 |
| `public/audio/room.m4a` (a cough next door) | "distant cough.mp3" | TheWah | https://freesound.org/people/TheWah/sounds/98676/ | CC0 1.0 |
| `public/audio/room.m4a` (voices far off, filtered past words) | "Indoor adult murmur, couple.wav" | SpliceSound | https://freesound.org/people/SpliceSound/sounds/260124/ | CC0 1.0 |
| `public/audio/room.m4a` (a bird's wings) | "Light Wing Flap" | TurboFool | https://freesound.org/people/TurboFool/sounds/561009/ | CC0 1.0 |
| `public/audio/room.m4a` (bangles) | "Bangles.wav" | breglad15 | https://freesound.org/people/breglad15/sounds/175435/ | CC0 1.0 |
| `public/audio/room.m4a` (a hookah) | "Hookah bubling.wav" | oresamp | https://freesound.org/people/oresamp/sounds/417603/ | CC0 1.0 |
| `public/audio/room.m4a` (sparrows) | "House sparrows" | freemaster2 | https://freesound.org/people/freemaster2/sounds/670176/ | CC0 1.0 |
| `public/audio/room.m4a` (a dove) | "Domestic Dove Coo" | haulaway | https://freesound.org/people/haulaway/sounds/735366/ | CC0 1.0 |
| `public/audio/room.m4a` (a magpie robin) | "Magpie Robin Singing.wav" | soumen59 | https://freesound.org/people/soumen59/sounds/478637/ | CC0 1.0 |
| `public/audio/room.m4a` (a myna) | "Dubai Birds Common Myna and House Sparrow" | qubodup | https://freesound.org/people/qubodup/sounds/752071/ | CC0 1.0 |
| `public/audio/room.m4a` (a bicycle bell far off) | "bell.wav" | 13gkopeckak | https://freesound.org/people/13gkopeckak/sounds/378912/ | CC0 1.0 |
| `public/audio/typewriter.wav` (five key strikes and the space bar) | "Typing on a 1920s Remington" | rpnelson | https://freesound.org/people/rpnelson/sounds/793351/ | CC0 1.0 |
| `public/audio/typewriter.wav` (margin bell and carriage return) | "Typewriter bell & carriage reset" | knufds | https://freesound.org/people/knufds/sounds/345955/ | CC0 1.0 |

The typewriter sprite is cut from the sounds' Freesound HQ previews (a login is needed for the
original files; the licence is the same CC0), high-passed, levelled and stored as one 22.05 kHz mono
16-bit WAV (about 100 KB) so every key starts on its exact sample. Everything else new is
synthesized in `src/audio/synth.ts`: the seal crack, the paper and envelope sounds, the day-title
settle (a tabla "dha" in 1857), the bell for a right answer and the siren for a wrong one, the
interface sounds, the agarbatti and clock ticks, and the teleprinter burst of the ending telegram.

## Voice

Read-aloud (optional, off unless the site turns it on) is generated by Fish Audio's text-to-speech from our own game text. The storyteller voice, the Dastango, is a Fish Audio community library voice, "बुजुर्ग प्रेरणा" (model id `65d76b8dc9be4ac78bbf77a93f2227b9`, set in `src/content/voices.ts`): https://fish.audio/m/65d76b8dc9be4ac78bbf77a93f2227b9. It is used under Fish Audio's terms of service, https://fish.audio/terms, and no voice clip is stored in this repository.

## Images

The parrot mark, the seal and the icons are drawn for this project (MIT, like the code).
The app icons in `public/icons/` (192, 512, maskable and apple-touch) are rendered from that parrot
mark by `scripts/icons.mjs` (MIT, like the code).
The share image `public/og.jpg` is our own screenshot of the game (the 1857 desk and the title paper), made by `dev/shoot-og.mjs` (MIT, like the code).
The eight intro portraits in `public/art/` (who you are and who the Tota is, one pair per chapter) are
original art generated for this project with an AI image model (Gemini 3.1 Flash Image, through Figma's
image generation) from our own prompts, in the style of a hand-coloured Company-school print, then
cropped and saved as 480 px WebP. They show invented people, not the likeness of anyone real (MIT,
like the code).

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
