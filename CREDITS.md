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

Licence texts: OFL 1.1 at https://openfontlicense.org, Apache 2.0 at https://www.apache.org/licenses/LICENSE-2.0.

## Sounds

Recorded beds are CC0 1.0 (public domain dedication), cut to 27-30 s seamless loops, mixed to mono and encoded as AAC (48 kbps, about -28 LUFS). Everything else you hear (stamps, paper, agarbatti tick, telegraph, shortwave static, valve hum, naqqara, tanpura, shehnai-like motif) is synthesized in the browser by `src/audio/synth.ts` and has no source file.

| File | Source sound | Author | URL | Licence |
|---|---|---|---|---|
| `public/audio/delhi-1857.m4a` | "Crows of Calcutta" mixed with "G52-05-Ox Cart" | Calcuttan; craigsmith | https://freesound.org/people/Calcuttan/sounds/249567/ ; https://freesound.org/people/craigsmith/sounds/437078/ | CC0 1.0 |
| `public/audio/lahore-1929.m4a` | "Steam Train Station Noises" | BobMorris1 | https://freesound.org/people/BobMorris1/sounds/414613/ | CC0 1.0 |
| `public/audio/bombay-1942.m4a` | "Indoors_Shed_RainOnTinRoof_01" | MrFossy | https://freesound.org/people/MrFossy/sounds/521773/ | CC0 1.0 |
| `public/audio/delhi-1947.m4a` | "Night time crickets, distant dogs and traffic" | SukritSen | https://freesound.org/people/SukritSen/sounds/482687/ | CC0 1.0 |

## Images

The parrot mark, the seal and the icons are drawn for this project (MIT, like the code).

## Game text

Game text is CC BY 4.0. Quoted third-party material (from books, papers and documents) is not covered by
that licence and stays with its owners; each quote shows its source.
