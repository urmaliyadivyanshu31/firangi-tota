# Asset manifest: the desk game (Delhi 1857, Lahore/Delhi 1928–29, Bombay 1942, Delhi Aug 1947)

Researched 23 Oct 2026. The candidates were downloaded to a local working folder outside this
repository (184 files, 57.1 MB in total), which is not kept. Every local path below is relative to
that folder; the source URL beside each one is where to get the file again.

**What the local files are.** They are copies for listening tests, not files to ship.
- Freesound sounds are the site's public HQ previews (MP3). Anything longer than 45 s was cut to a 45 s excerpt and re-encoded to Ogg q3.
- Archive.org 78s were cut to 60 s Ogg excerpts.
- Images were downsized to at most 1600 px.

Before shipping, download each original (Freesound: log in, then download the WAV/FLAC; archive.org: the full MP3/FLAC; Commons: the full file), cut it the way you want, and keep the licence row with it.

**Quality scores (1–5)** come from Freesound ratings and download counts, the uploader's description, recording notes and how well the sound fits the era. **Nobody has listened to these files yet.** Rows marked *ear-check* may contain modern traffic, engines or speech.

---

## 0. Licence verdicts (read first)

| Source | Verdict for a public MIT repo | Why (exact terms) |
|---|---|---|
| **Freesound** | **CC0: yes. CC-BY 3.0/4.0: yes, with attribution. BY-NC and Sampling+: no.** | Each sound has its own licence. NC examples we found and excluded: "Sankh_conch" by Odiasites.com (BY-NC), "Bullock Cart Procession Puttaparthi" by mexist (BY-NC), the lewk tabla set (BY-NC). |
| **Pixabay** | **No. Don't commit raw Pixabay files.** | Pixabay Content License, Prohibited Uses: *"You cannot sell or distribute the Content (either in digital or physical form) on a Standalone basis. This includes selling or distributing Content on a Standalone basis as an image, audio, video, NFT or other digital file… (including through a stock media platform)."* It defines Standalone as *"where no creative effort has been applied to the Content and it remains in substantially the same form as it exists on the Service."* A raw MP3 sitting in a public repo can be downloaded on its own, unchanged, so it is standalone distribution. The licence also can't be changed to CC0 or MIT, and some Pixabay music is registered with YouTube Content ID. Pixabay is fine inside a compiled video. It is not fine for loose files in a repo. |
| **BBC Sound Effects (RemArc licence)** | **No.** | Free use is limited to personal, educational and research purposes. Commercial use is licensed through Pro Sound Effects, and redistributing the files isn't allowed. The official licensing page blocked our fetch, so these terms come from coverage of the licence, not its own text. **BBC sounds have also been re-uploaded to Freesound as "CC0"** (e.g. "TelegraphEquip.BBC.ECD154e.mp3", Freesound #699125). Those uploads are laundered, so avoid anything with BBC catalogue numbers in its name. |
| **Sonniss #GameAudioGDC bundle** | **No raw files.** | License v2.0: *"Licensee may not distribute, publish, sub-license or otherwise supply the sound effects as sound effects to any other person"*, and *"Re-designed and manipulated sounds remain licensed material."* Shipping them in a finished game is allowed, but a public repo hands out the files themselves. AI/ML training is also prohibited. |
| **Wikimedia Commons** | Yes, one file at a time. | Trust the per-file tag, but check that the file is PD in the US too. Indian photos from **1936–1947** are often tagged only "PD India", and their US status may have been restored under the URAA (see 1942 and 1947 below). |
| **archive.org** | Only by date, and only for recordings published in **1925 or earlier**. | Item pages often have no licence at all, and the CC licences uploaders claim mean nothing in either direction. **US:** under the Music Modernization Act, recordings published before 1923 became PD on 1 Jan 2022, recordings from 1923–1946 become PD 100 years after publication (so 1925 recordings became PD on 1 Jan 2026), and recordings from 1947–1956 get 110 years. **India:** sound recordings are protected for 60 years from publication, musical works for life + 60, and performers' rights for 50 years. So a 1932 Abdul Karim Khan Odeon disc is PD in India but protected in the US until 2032, and Akashvani recordings from 1956 (archive.org `dli.akashvani.*`) are PD in India but not in the US. The `dni.ncaa.*` collection is **CC BY-NC 4.0**, so it is excluded. |
| **OpenGameArt** | Little that fits. | "Typewriter sounds" (CC0) and "Electronic Indian tabla tune" (CC0, but electronic, so wrong era). "india rythm" is CC-BY 3.0 and "Roof of the world" is CC-BY-SA 3.0. |
| **Google Fonts** | Yes. | Everything we picked is OFL 1.1 except Special Elite (Apache 2.0). **Rye and Ewert carry a Reserved Font Name.** Subsetting counts as modifying the font, so either ship those two unmodified or rename the subset. |

**Repo hygiene.** State in the README that the code is MIT and the assets are listed in `ASSETS.md` with their own licences (CC0, PD or CC-BY). Keep one row per file, with source URL, licence, author and changes. Don't mix CC-BY-SA files in unless you flag them; we picked none.

---

## 1. Top pick per need

| Need | Top pick (local file) | Licence | Fallback |
|---|---|---|---|
| **1857 Delhi bed** | `ambient/1857-delhi/crows-of-calcutta__fs249567__excerpt45s.ogg` + `ox-cart-wooden-wheels__fs437078…` + `horse-with-old-cart__fs538438.ogg`, with naqqara and shehnai from `archival-pd-audio/talim-hussain_nafiri-nakkara-shehnai_HMV-P5090_1916…` low-passed and far away | CC0 + PD | Synthesise the naqqara (§5) |
| **1857 siege layer** | `ambient/1857-delhi/battle-reenactment-muskets-cannon-distant__fs125932…` (far field, with natural echo) | CC0 | `devices/old-musket-bang__fs538795.mp3`, `devices/cannon-shot__fs187767.mp3` |
| **1929 Lahore bed** | `ambient/1929-lahore/steam-train-station-noises__fs414613…` (made to suggest a 1930s station) + `hooves-carriage-people-street__fs204961…` (tonga) + `steam-whistle__fs71778.mp3` | CC0 | `steam-train-leaving-station__fs125211` |
| **1929 crowd/band** | `ambient/1929-lahore/distant-crowd-cheer__fs102108.ogg`; band from `archival-pd-audio/jehangirs-band-amritsar_bhairvi_odeon_1912…` | CC0 / PD | Record your own "Inquilab Zindabad" chant with volunteers (no file found) |
| **1942 Bombay monsoon bed** | `ambient/1942-bombay/rain-on-tin-roof__fs521773…` or `monsoon-rain-constant__fs263555.ogg` + `sea-waves-against-rocks__fs648860…` + `tram-bell-single__fs497561.mp3` + crows | CC0 | `rain-on-roof-night-kolkata__fs398581`, `light-rain-thunder-india__fs447809` (ear-check) |
| **1942 radio** | Synthesised static and tuning (§5), with `devices/shortwave-static-beeps__fs583363…` and `am-radio-tuning-sweep__fs552482…` as references | CC0 | `shortwave-noise-morse__fs257877.mp3` |
| **1942 Congress Radio opener** | `archival-pd-audio/peara-saheb_iqbal-national-song-tarana-e-hind_HMV-P3928_1919…`. Congress Radio opened with "Hindustan Hamara" (Iqbal). **Ear-check that this disc is "Saare Jahan Se Achha"**: the label only says "Dr. Iqbal's National Song". | PD (1919) | Rights-free performance you record yourselves (Iqbal d. 1938, text PD) |
| **1947 night bed** | `ambient/1947-delhi/night-crickets-distant-dogs-india__fs482687…` + `fireworks-residential-night-thane__fs712284…` (real Indian Diwali crackers) + `crowd-cheering__fs386762…`, with band from `archival-pd-audio/surat-band_hindustani-band-with-bells_GC_1909…` far away | CC0 + PD | `fireworks-small-pops-distant__fs453131`, `marching-band-passes__fs211511` |
| **Telegraph** | **Synthesise it (§5).** `devices/telegraph-sounder-news-keyer__fs112773.mp3` is a real sounder to use as a reference | CC0 | Live CW: `devices/morse-code-40m-band__fs204968…` (1942 shortwave) |
| **Typewriter** | `devices/typewriter-1920s-remington__fs793351.ogg` + `typewriter-bell-carriage-return__fs345955.mp3` + `typewriter-single-key__fs380137.mp3` | CC0 | `old-typewriter-full-sequence__fs259498.ogg` |
| **Stamp thump** | `devices/rubber-stamp-traditional__fs470710.mp3` (rated 4.9, 10k downloads) | CC0 | `stamp-on-paper__fs362624`, `office-stamp-takes__fs514486` |
| **Paper / pen / seal / envelope** | `devices/paper-rustle__fs181774.mp3`, `dip-pen-inkwell-writing__fs518477.ogg`, `wax-seal__fs759526.mp3`, `envelope-tear-open__fs593146.mp3` | CC0 | `quill-pen-hard-paper__fs194905`, `letter-handling-envelope__fs632116` |
| **Clock / match / lamp** | `devices/old-clock-ticking-loop__fs42139.mp3` (18th-century clock), `match-strike__fs423811.mp3`, `oil-lantern-open-close__fs516740.ogg` | CC0 | `old-pendulum-clock__fs657255` |
| **Valve hum** | **Synthesise at 50 Hz (§5).** Freesound tube-hum recordings are 60 Hz US mains, which is wrong for India | — | `devices/vacuum-tube-radio-hum-1939__fs832951…` (repitch it) |
| **Drone** | `instruments/tanpura-drone-E__fs148850.ogg` (rated 5.0) + `harmonium-drone__fs264407…` | CC0 | `tanpura-four-string-drone__fs194435`, `shruti-box-drone__fs95345` |
| **Shehnai** | `archival-pd-audio/talim-hussain_shehnai_HMV-P1472_1916…` (secular court style) | PD | `instruments/shehnai-wedding-ceremony__fs395024…` (CC0, but a live wedding) |
| **Naqqara** | `archival-pd-audio/talim-hussain_nafiri-nakkara-shehnai_HMV-P5090_1916…` + synth (§5) | PD | `instruments/timpani-roll-naqqara-standin__fs428611.mp3` repitched up |
| **Tabla / dhol / dholak** | `instruments/tabla-na-stroke__fs418377.mp3`, `tabla-bayan-kherwa__fs151176.mp3`, `dholak-pattern__fs479246.mp3`, `dhol-street-playing__fs728135.ogg` | CC0 | `instruments-ccby/dhol-beat-johnny-kalsi…` (CC BY 3.0) |
| **Sitar / sarangi / bansuri / harmonium solo** | `instruments/sitar-single-string-ma__fs42192.ogg`, `sarangi-phrase__fs816126.mp3`, `bansuri-bass-E-sample__commons-PD.ogg`, `archival-pd-audio/govindrao-tembe_harmonium-pilu_HMV-P8942_1925…` | CC0 / PD | `archival-pd-audio/fazal-hussain_sitar-jod…_1920`, `mastan-shah_flute…_1924` |
| **Gramophone in the room** | `archival-pd-audio/gauhar-jan_barse-badarva-raga-malhar_pathe-46048_1912…` (a monsoon raga) + `gauhar-jan_announcement-my-name-is-gauhar-jan_1912__last22s.ogg`, run through `devices/gramophone-motor-surface-noise__fs616831…` | PD + CC0 | Synthesised crackle (§5) |
| **Fonts** | Special Elite (typed sheets), Old Standard TT (1857 print), Tiro Devanagari Hindi (old print) + Mukta (UI), Gulzar (Nastaliq), Tiro Gurmukhi + Mukta Mahee | OFL / Apache | See §7 |
| **Images** | 1857: Tytler 1858 photo of Bahadur Shah Zafar and the *Delhi Urdu Akhbar* page of 17 May 1857. 1929: Bhagat Singh photo (Apr 1929) and Survey of India sheet 53 H (1922). 1942: IWM ARP training photo, Bombay 1942, and the 1924 Bombay map. 1947: **no photo is fully safe; draw original props** | PD | See §6 |

---

## 2. Ambient beds

### 2a. Delhi 1857 (no engines allowed)

| Name | Sounds like | Era fit | Source | Licence | Attribution | Duration / size | Local file | Q |
|---|---|---|---|---|---|---|---|---|
| Crows of Calcutta | House crows cawing, the definitive Indian city sound | All eras | https://freesound.org/people/Calcuttan/sounds/249567/ | CC0 1.0 | none (courtesy credit: Calcuttan) | 57 s orig / 45 s, 526 KB | `ambient/1857-delhi/crows-of-calcutta__fs249567__excerpt45s.ogg` | 5 |
| kaak.wav | A single house crow calling from a perch | All | https://freesound.org/people/Calcuttan/sounds/136259/ | CC0 1.0 | — | 24 s, 256 KB | `ambient/1857-delhi/house-crow-kaak__fs136259.ogg` | 4 |
| G52-05-Ox Cart | Slow rumble, squeak and rattle of wooden wheels (stands in for a bullock cart) | 1857/1929 | https://freesound.org/people/craigsmith/sounds/437078/ | CC0 1.0 | — | 53 s / 45 s, 376 KB, mono | `ambient/1857-delhi/ox-cart-wooden-wheels__fs437078__excerpt45s.ogg` | 5 |
| horse with old cart | A horse neighs, then hooves, wheels and creaking as the cart passes | 1857/1929 | https://freesound.org/people/bruno.auzet/sounds/538438/ | CC0 1.0 | — | 33 s, 495 KB | `ambient/1857-delhi/horse-with-old-cart__fs538438.ogg` | 5 |
| old horse drawn carriage drives past | A carriage pass-by | 1857/1929 | https://freesound.org/people/Garuda1982/sounds/631829/ | CC0 1.0 | — | 22 s, 319 KB | `ambient/1857-delhi/old-horse-carriage-passes__fs631829.ogg` | 4 |
| reenactment2 | A battle re-enactment across a field: muskets, cannon, yelling, some drum and fife | 1857 siege (keep it distant; the fife is Western) | https://freesound.org/people/alienistcog/sounds/125932/ | CC0 1.0 | — | 346 s / 45 s, 525 KB | `ambient/1857-delhi/battle-reenactment-muskets-cannon-distant__fs125932__excerpt45s.ogg` | 4 |
| Voice elephant | Elephant call (Mughal and Company elephants) | 1857 | https://freesound.org/people/vataaa/sounds/148873/ | CC0 1.0 | — | 7 s, 167 KB | `ambient/1857-delhi/elephant-voice__fs148873.mp3` | 3 |
| horse.mp3 | Horse whinny | All | https://freesound.org/people/3bagbrew/sounds/59569/ | CC0 1.0 | — | 10 s, 204 KB | `ambient/1857-delhi/horse-whinny__fs59569.mp3` | 4 |
| Market in India | Market walla; *ear-check* for motorbikes and modern speech | 1857 only if clean, otherwise 1929+ | https://freesound.org/people/florianreichelt/sounds/434853/ | CC0 1.0 | (uploader asks for an Instagram tag, but it's optional) | 46 s, 555 KB | `ambient/1857-delhi/market-in-india__fs434853__excerpt45s.ogg` | 3 |
| Outdoor Ambience, pigeons take off (Pushkar) | Ghat evening, pigeons taking off, **light distant traffic** | 1929+ only | https://freesound.org/people/Anantich/sounds/318316/ | CC0 1.0 | — | 137 s / 45 s, 400 KB | `ambient/1857-delhi/pigeons-ghat-ambience-pushkar__fs318316__excerpt45s.ogg` | 3 |
| *Not downloaded:* Delhi street, Chandni Chowk, Old Delhi | Modern horns and traffic | ✗ for 1857 | freesound 336468, 462496, 34864 | CC0 | — | — | — | 1 |

Build the 1857 bazaar as a mix: Indian-language walla with no engines (record it yourselves, or use the cleanest parts of 434853) + crows + cart + hooves + far naqqara.

### 2b. Lahore 1929

| Name | Sounds like | Era fit | Source | Licence | Attribution | Duration / size | Local file | Q |
|---|---|---|---|---|---|---|---|---|
| Steam Train Station Noises | Made "to suggest a busy train station in the 1930's": steam, doors, whistles, reverb | 1929 ★ | https://freesound.org/people/BobMorris1/sounds/414613/ | CC0 1.0 | — | 73 s / 45 s, 539 KB | `ambient/1929-lahore/steam-train-station-noises__fs414613__excerpt45s.ogg` | 5 |
| steam-train-leaving-moor-st-station | A heritage steam train leaving a station | 1929 | https://freesound.org/people/keithpeter/sounds/125211/ | CC0 1.0 | — | 90 s / 45 s, 539 KB | `ambient/1929-lahore/steam-train-leaving-station__fs125211__excerpt45s.ogg` | 4 |
| Steam Whistle | A short loco whistle | 1857–1947 | https://freesound.org/people/Bidone/sounds/71778/ | CC0 1.0 | — | 3 s, 74 KB | `ambient/1929-lahore/steam-whistle__fs71778.mp3` | 4 |
| clatter of hooves | Hooves and carriage with people in a small paved street (tonga) | 1929 ★ | https://freesound.org/people/skitchscharff/sounds/204961/ | CC0 1.0 | — | 72 s / 45 s, 530 KB | `ambient/1929-lahore/hooves-carriage-people-street__fs204961__excerpt45s.ogg` | 4 |
| distant_cheer | Binaural crowd cheering in the distance | 1929/1947 | https://freesound.org/people/moxobna/sounds/102108/ | CC0 1.0 | — | 19 s, 237 KB | `ambient/1929-lahore/distant-crowd-cheer__fs102108.ogg` | 4 |
| crowd ext large after parade | A large crowd yelling (Montreal), so **English voices likely**. Use only heavily low-passed as a wash | 1929 (wash only) | https://freesound.org/people/kyles/sounds/453867/ | CC0 1.0 | — | 471 s / 45 s, 532 KB | `ambient/1929-lahore/crowd-large-after-parade__fs453867__excerpt45s.ogg` | 3 |
| Damal drumming in Pakistan | Dhamaal drumming in Lahore. **This is Sufi devotional music**, so count it as religious (§4d) | 1929 | https://freesound.org/people/nickcase/sounds/553179/ | CC0 1.0 | — | 149 s / 45 s, 424 KB | `ambient/1929-lahore/damal-drumming-lahore__fs553179__excerpt45s.ogg` | 3 |

### 2c. Bombay 1942 (monsoon)

| Name | Sounds like | Era fit | Source | Licence | Attribution | Duration / size | Local file | Q |
|---|---|---|---|---|---|---|---|---|
| Indoors_Shed_RainOnTinRoof_01 | Rain on a tin roof, heard from inside | 1942 ★ | https://freesound.org/people/MrFossy/sounds/521773/ | CC0 1.0 | — | 95 s / 45 s, 554 KB | `ambient/1942-bombay/rain-on-tin-roof__fs521773__excerpt45s.ogg` | 5 |
| Rain.mp3 | "The monsoon rain has set in… constant" | 1942 ★ | https://freesound.org/people/oen/sounds/263555/ | CC0 1.0 | — | 31 s, 382 KB | `ambient/1942-bombay/monsoon-rain-constant__fs263555.ogg` | 5 |
| Rain On Fiber Roof at Night (Kolkata) | Medium rain on a roof at midnight | 1942 | https://freesound.org/people/Sagnik_Basu/sounds/398581/ | CC0 1.0 | — | 178 s / 45 s, 588 KB | `ambient/1942-bombay/rain-on-roof-night-kolkata__fs398581__excerpt45s.ogg` | 4 |
| rain dropping from a roof (India) | Roof dripping | 1942 | https://freesound.org/people/florianreichelt/sounds/434852/ | CC0 1.0 | — | 99 s / 45 s, 598 KB | `ambient/1942-bombay/rain-dripping-from-roof-india__fs434852__excerpt45s.ogg` | 4 |
| Light Rain and Thunder (India) | Rain with thunder; *ear-check* | 1942 | https://freesound.org/people/florianreichelt/sounds/447809/ | CC0 1.0 | — | 63 s / 45 s, 537 KB | `ambient/1942-bombay/light-rain-thunder-india__fs447809__excerpt45s.ogg` | 4 |
| Distant Thunder | Low rumbling (Southampton) | All | https://freesound.org/people/richwise/sounds/361401/ | CC0 1.0 | — | 427 s / 45 s, 503 KB | `ambient/1942-bombay/distant-thunder__fs361401__excerpt45s.ogg` | 4 |
| Sea Waves Against Rocks | Waves on rocks (stands in for the Marine Drive sea wall) | 1942 | https://freesound.org/people/emainta/sounds/648860/ | CC0 1.0 | — | 89 s / 45 s, 572 KB | `ambient/1942-bombay/sea-waves-against-rocks__fs648860__excerpt45s.ogg` | 5 |
| The Black Sea, waves' rustle | Soft waves at night | 1942 | https://freesound.org/people/tomattka/sounds/400660/ | CC0 1.0 | — | 30 s, 374 KB | `ambient/1942-bombay/sea-waves-rustle-night__fs400660.ogg` | 4 |
| 11-3 Tram bell | A single tram bell (Bombay ran electric trams from 1907 to 1964) | 1942 ★ | https://freesound.org/people/16HPanskaWillheimova_Sara/sounds/497561/ | CC0 1.0 | — | 2 s, 42 KB | `ambient/1942-bombay/tram-bell-single__fs497561.mp3` | 4 |
| tram_bell_ride_door | Bratislava tram: bell, pass-by, interior. Modern motor whine is possible; use the bell and rumble only | 1942 | https://freesound.org/people/bajko/sounds/128308/ | CC0 1.0 | — | 275 s / 45 s, 319 KB | `ambient/1942-bombay/tram-bell-ride-doors__fs128308__excerpt45s.ogg` | 3 |
| ship horn | Ship horns and seaport atmosphere (Bombay harbour) | 1942 | https://freesound.org/people/monotraum/sounds/208714/ | CC0 1.0 | — | 34 s, 313 KB | `ambient/1942-bombay/ship-horns-seaport__fs208714.ogg` | 4 |
| Alarm, Air Raid Siren, Test, Devon | British wartime-type siren (Bombay held ARP drills in 1942) | 1942 | https://freesound.org/people/audiojacked/sounds/336640/ | CC0 1.0 | — | 77 s / 45 s, 436 KB | `ambient/1942-bombay/air-raid-siren-test__fs336640__excerpt45s.ogg` | 4 |
| Bird, Peacock Call | Male Indian peafowl, a monsoon cue | All | https://freesound.org/people/Kinoton/sounds/688203/ | CC0 1.0 | — | 6 s, 114 KB | `ambient/1942-bombay/peacock-call__fs688203.mp3` | 5 |
| bike bell bicycle ring | Bicycle bell | 1929–47 | https://freesound.org/people/13gkopeckak/sounds/378912/ | CC0 1.0 | — | 8 s, 139 KB | `ambient/1942-bombay/bicycle-bell__fs378912.mp3` | 4 |
| *Not downloaded:* Over 2 hours of rainfall on a tin roof | Very long, for loop mining | 1942 | https://freesound.org/people/Simon%20Spiers/sounds/577507/ | CC0 1.0 | — | 8438 s | — | 4 |
| *Not downloaded:* Koel-01 | Asian koel call (Singapore) | All | https://freesound.org/s/460466/ | CC0 1.0 | — | 8 s | — | 3 |

### 2d. Delhi, night of 14–15 August 1947

| Name | Sounds like | Era fit | Source | Licence | Attribution | Duration / size | Local file | Q |
|---|---|---|---|---|---|---|---|---|
| Fireworks_Urban_Residential_Night_Diwali_India | Fireworks at mid distance in Thane at night | 1947 ★ | https://freesound.org/people/prospekt42/sounds/712284/ | CC0 1.0 | — | 326 s / 45 s, 531 KB | `ambient/1947-delhi/fireworks-residential-night-thane__fs712284__excerpt45s.ogg` | 4 |
| fireworks small pops Montreal | Small pops at a distance | 1947 | https://freesound.org/people/kyles/sounds/453131/ | CC0 1.0 | — | 143 s / 45 s, 534 KB | `ambient/1947-delhi/fireworks-small-pops-distant__fs453131__excerpt45s.ogg` | 4 |
| firecrackers.wav | Close firecrackers | 1947 | https://freesound.org/people/sbarncar/sounds/121557/ | CC0 1.0 | — | 6 s, 144 KB | `ambient/1947-delhi/firecrackers-close__fs121557.mp3` | 4 |
| Night time crickets, distant dogs and traffic | Indian suburban night: crickets, dogs, faint traffic | 1947 ★ | https://freesound.org/people/SukritSen/sounds/482687/ | CC0 1.0 | — | 70 s / 45 s, 564 KB | `ambient/1947-delhi/night-crickets-distant-dogs-india__fs482687__excerpt45s.ogg` | 5 |
| Crowd_Cheering | Crowd cheering; *ear-check* the language | 1947 | https://freesound.org/people/ken788/sounds/386762/ | CC0 1.0 | — | 195 s / 45 s, 536 KB | `ambient/1947-delhi/crowd-cheering__fs386762__excerpt45s.ogg` | 3 |
| Marching Band Passes By | Western drums and brass passing by | 1947 (far, low-passed) | https://freesound.org/people/FlatHill/sounds/211511/ | CC0 1.0 | (uploader asks for a comment; optional) | 68 s / 45 s, 382 KB | `ambient/1947-delhi/marching-band-passes__fs211511__excerpt45s.ogg` | 3 |
| A flag flapping in the wind | Cloth flag in the wind (the tricolour going up) | 1947 | https://freesound.org/people/felix.blume/sounds/154794/ | CC0 1.0 | — | 60 s / 45 s, 579 KB | `ambient/1947-delhi/flag-flapping__fs154794__excerpt45s.ogg` | 5 |
| Surat Band, Hindustani band baja with bells (1909) | An **Indian brass band** on a 78 | 1947 distant band ★ | §4c | PD | — | — | `archival-pd-audio/surat-band_…` | 4 |

---

## 3. Era devices

| Name | Sounds like | Era fit | Source | Licence | Attribution | Duration / size | Local file | Q |
|---|---|---|---|---|---|---|---|---|
| broadcast-news-keyer | A real **telegraph sounder** (clicks, no tone) | 1857 / 1929 reference | https://freesound.org/people/wcfl10/sounds/112773/ | CC0 1.0 | — | 3 s, 65 KB | `devices/telegraph-sounder-news-keyer__fs112773.mp3` | 3 (short; use to tune the synth) |
| Lots of Morse Code | Many 40 m CW conversations | 1942 shortwave | https://freesound.org/people/Buss1000/sounds/204968/ | CC0 1.0 | — | 140 s / 45 s, 488 KB | `devices/morse-code-40m-band__fs204968__excerpt45s.ogg` | 4 |
| Short Wave Radio Noise 4 | Noisy Morse in shortwave static | 1942 | https://freesound.org/people/zmobie/sounds/257877/ | CC0 1.0 | — | 30 s, 198 KB | `devices/shortwave-noise-morse__fs257877.mp3` | 5 |
| Shortwave radio static & beeps | Scrolling through shortwave frequencies | 1942 | https://freesound.org/people/nakkivene66/sounds/583363/ | CC0 1.0 | — | 85 s / 45 s, 519 KB | `devices/shortwave-static-beeps__fs583363__excerpt45s.ogg` | 5 |
| Tuning radio.wav | AM band sweep | 1942 | https://freesound.org/people/MPTSound/sounds/552482/ | CC0 1.0 | — | 73 s / 45 s, 358 KB | `devices/am-radio-tuning-sweep__fs552482__excerpt45s.ogg` | 5 |
| Vacuum Tube Hum Radio | Valves buzzing in a 1939 radio (likely 60 Hz US mains, so repitch to 50 Hz) | 1942 | https://freesound.org/people/SoundsofTheMachine/sounds/832951/ | CC0 1.0 | — | 61 s / 45 s, 340 KB | `devices/vacuum-tube-radio-hum-1939__fs832951__excerpt45s.ogg` | 4 |
| old-radio-noise-switchon-ukw | Siemens valve radio switching on and warming up | 1942 | https://freesound.org/people/DrNI/sounds/27512/ | CC0 1.0 | — | 20 s, 165 KB | `devices/tube-radio-switch-on-noise__fs27512.ogg` | 4 |
| Old radio switch | Rotary on/off switch of a valve radio | 1942 | https://freesound.org/people/eneibol/sounds/369964/ | CC0 1.0 | — | 5 s, 109 KB | `devices/valve-radio-rotary-switch__fs369964.mp3` | 5 |
| typing-1920s-remington | Typing on a 1920s Remington | 1929/1942 ★ | https://freesound.org/people/rpnelson/sounds/793351/ | CC0 1.0 | — | 19 s, 255 KB | `devices/typewriter-1920s-remington__fs793351.ogg` | 5 |
| Typewriter bell & carriage reset | Margin bell and carriage return on an antique machine | 1929/1942 | https://freesound.org/people/knufds/sounds/345955/ | CC0 1.0 | — | 3 s, 70 KB | `devices/typewriter-bell-carriage-return__fs345955.mp3` | 5 |
| Typewriter - single key | One classic key strike | 1929/1942 | https://freesound.org/people/yottasounds/sounds/380137/ | CC0 1.0 | — | 0.3 s, 10 KB | `devices/typewriter-single-key__fs380137.mp3` | 5 |
| OLD_Typewriter_ALL | Paper in, typing, bell, paper out | 1929/1942 | https://freesound.org/people/Spring_Tide/sounds/259498/ | CC0 1.0 | — | 30 s, 377 KB | `devices/old-typewriter-full-sequence__fs259498.ogg` | 5 |
| typewriter22.ogg | Manual typewriter with some carriage returns | 1929/1942 | https://freesound.org/people/tams_kp/sounds/43560/ | CC0 1.0 | — | 124 s / 45 s, 379 KB | `devices/manual-typewriter-returns__fs43560__excerpt45s.ogg` | 4 |
| traditional stamp.wav | Rubber stamp thump | All ★ | https://freesound.org/people/I.fekry/sounds/470710/ | CC0 1.0 | — | 2 s, 37 KB | `devices/rubber-stamp-traditional__fs470710.mp3` | 5 |
| Stamp (kermite607) | A stamp hitting paper | All | https://freesound.org/people/kermite607/sounds/362624/ | CC0 1.0 | — | 0.6 s, 16 KB | `devices/stamp-on-paper__fs362624.mp3` | 5 |
| Office stamp | Several takes | All | https://freesound.org/people/whammy/sounds/514486/ | CC0 1.0 | — | 5 s, 121 KB | `devices/office-stamp-takes__fs514486.mp3` | 4 |
| rustling paper.wav | Paper rustle | All ★ | https://freesound.org/people/keweldog/sounds/181774/ | CC0 1.0 | — | 5 s, 109 KB | `devices/paper-rustle__fs181774.mp3` | 5 |
| Rustling Paper | Handling paper or turning a page | All | https://freesound.org/people/HarpyHarpHarp/sounds/449127/ | CC0 1.0 | — | 6 s, 152 KB | `devices/paper-rustle-page__fs449127.mp3` | 5 |
| Paper handling.wav | Mail and papers handled | All | https://freesound.org/people/sethlind/sounds/265020/ | CC0 1.0 | — | 47 s / 45 s, 389 KB | `devices/paper-and-mail-handling__fs265020__excerpt45s.ogg` | 5 |
| Unfolding a newspaper | Newspaper page turn | 1929+ | https://freesound.org/people/carroll27/sounds/151913/ | CC0 1.0 | — | 2 s, 54 KB | `devices/newspaper-unfold__fs151913.mp3` | 4 |
| fountain_pen_inkwell | Notebook opens, **pen dipped in an inkwell**, writing | 1857 ★ | https://freesound.org/people/aktivfilm/sounds/518477/ | CC0 1.0 | — | 32 s, 406 KB | `devices/dip-pen-inkwell-writing__fs518477.ogg` | 4 |
| Quill pen writing on hard paper | Quill scratch | 1857 | https://freesound.org/people/marcoman89/sounds/194905/ | CC0 1.0 | — | 98 s / 45 s, 440 KB | `devices/quill-pen-hard-paper__fs194905__excerpt45s.ogg` | 5 |
| Quill and Parchment | Quill on parchment | 1857 | https://freesound.org/people/Nickh69/sounds/507864/ | CC0 1.0 | — | 54 s / 45 s, 555 KB | `devices/quill-and-parchment__fs507864__excerpt45s.ogg` | 4 |
| Wax seal | A wax seal pressed onto an envelope | 1857 | https://freesound.org/people/Cerise_Virtuelle/sounds/759526/ | CC0 1.0 | — | 1 s, 31 KB | `devices/wax-seal__fs759526.mp3` | 4 |
| Tearing Open An Envelope | Envelope tear | All | https://freesound.org/people/21100375/sounds/593146/ | CC0 1.0 | — | 3 s, 62 KB | `devices/envelope-tear-open__fs593146.mp3` | 5 |
| Handling a letter | Envelope opened, letter pulled out | All | https://freesound.org/people/MarcelWagner/sounds/632116/ | CC0 1.0 | — | 38 s, 299 KB | `devices/letter-handling-envelope__fs632116.ogg` | 4 |
| Old Scots Clock - Ticking | An 18th-century clock, recorded in stereo, short loop | 1857 ★ | https://freesound.org/people/fauxpress/sounds/42139/ | CC0 1.0 | — | 9 s, 211 KB | `devices/old-clock-ticking-loop__fs42139.mp3` | 4 |
| Old Clock Pendulum | Pendulum clock | All | https://freesound.org/people/Tom_Kaszuba/sounds/657255/ | CC0 1.0 | — | 99 s / 45 s, 566 KB | `devices/old-pendulum-clock__fs657255__excerpt45s.ogg` | 5 |
| Match strike 03 | Match strike | All | https://freesound.org/people/scalywhale/sounds/423811/ | CC0 1.0 | — | 1.4 s, 36 KB | `devices/match-strike__fs423811.mp3` | 5 |
| StrikeMatchLightCandle | Strike, light, set down, blow out | All | https://freesound.org/people/shelbyshark/sounds/464099/ | CC0 1.0 | — | 12 s, 285 KB | `devices/match-light-candle__fs464099.mp3` | 4 |
| Oil Lantern Open and Close | Small oil lantern opened to light the wick (stands in for a diya or lamp) | 1857 | https://freesound.org/people/ImAFoley/sounds/516740/ | CC0 1.0 | — | 21 s, 223 KB | `devices/oil-lantern-open-close__fs516740.ogg` | 4 |
| Candle double wood wick flame | Crackling flame bed | All | https://freesound.org/people/roisin.gleeson/sounds/680474/ | CC0 1.0 | — | 68 s / 45 s, 641 KB | `devices/candle-flame-crackle__fs680474__excerpt45s.ogg` | 4 |
| Gramophone, old record player, motor noise | Motor, surface static, scratches | 1929/1942 | https://freesound.org/people/TRP/sounds/616831/ | CC0 1.0 | — | 149 s / 45 s, 404 KB | `devices/gramophone-motor-surface-noise__fs616831__excerpt45s.ogg` | 5 |
| 071416 Victor Victrola | A 1916 Victrola with its needle stuck at the run-out | 1929 | https://freesound.org/people/thaighaudio/sounds/350323/ | CC0 1.0 | — | 15 s, 325 KB | `devices/victrola-1916-needle-stuck__fs350323.mp3` | 4 |
| fuse_burning_48khz | A fireworks fuse hissing | 1947 | https://freesound.org/people/elonen/sounds/45650/ | CC0 1.0 | — | 8 s, 179 KB | `devices/fuse-burning__fs45650.mp3` | 4 |
| fuse2.wav | Fuse lit on a firecracker | 1947 | https://freesound.org/people/j1987/sounds/140715/ | CC0 1.0 | — | 4 s, 83 KB | `devices/firecracker-fuse__fs140715.mp3` | 5 |
| sparkler_fuse_nm | Close sparkler | 1947 | https://freesound.org/people/Alex_hears_things/sounds/316682/ | CC0 1.0 | — | 19 s, 340 KB | `devices/sparkler-fuse-close__fs316682.mp3` | 5 |
| Knock on the door | Wooden door knock | All | https://freesound.org/people/HunteR4708/sounds/256513/ | CC0 1.0 | — | 7 s, 161 KB | `devices/door-knock-wood__fs256513.mp3` | 5 |
| Footsteps on Wooden Floor | Interior footsteps | All | https://freesound.org/people/ftpalad/sounds/119914/ | CC0 1.0 | — | 6 s, 103 KB | `devices/footsteps-wooden-floor__fs119914.mp3` | 4 |
| Teacup on Saucer | Cup set down | 1929+ | https://freesound.org/people/megashroom/sounds/391497/ | CC0 1.0 | — | 22 s, 178 KB | `devices/teacup-on-saucer__fs391497.ogg` | 5 |
| tea pour | Teapot into a porcelain cup | 1929+ | https://freesound.org/people/fryzu82/sounds/142330/ | CC0 1.0 | — | 5 s, 91 KB | `devices/tea-pour-porcelain__fs142330.mp3` | 4 |
| coins 05 | Coins handled | All | https://freesound.org/people/Anthousai/sounds/336571/ | CC0 1.0 | — | 0.5 s, 16 KB | `devices/coins-handling__fs336571.mp3` | 4 |
| Slow Creaking Stereo | Creaking chair | All | https://freesound.org/people/harveyism/sounds/130364/ | CC0 1.0 | — | 28 s, 378 KB | `devices/chair-creak-slow__fs130364.ogg` | 4 |
| Old Ceiling Fan Running | Ceiling fan (offices, 1929+) | 1929–47 | https://freesound.org/people/mrrap4food/sounds/470591/ | CC0 1.0 | — | 26 s, 228 KB | `devices/old-ceiling-fan__fs470591.ogg` | 4 |
| Fluttering Chinese Fan 02 | Hand fan flutter (stands in for a pankha) | 1857 | https://freesound.org/people/leonelmail/sounds/508673/ | CC0 1.0 | — | 12 s, 277 KB | `devices/hand-fan-flutter__fs508673.mp3` | 4 |
| Original Heidelberg Platen Press | Letterpress, good for secret pamphlets | 1929/1942 | https://freesound.org/people/simongray/sounds/490547/ | CC0 1.0 | — | 44 s, 374 KB | `devices/letterpress-platen-press__fs490547.ogg` | 5 |
| navette de métier à tisser | Loom shuttle (khadi and charkha motif) | 1942 | https://freesound.org/people/Na%C3%AFma/sounds/510266/ | CC0 1.0 | — | 58 s / 45 s, 638 KB | `devices/handloom-shuttle__fs510266__excerpt45s.ogg` | 4 |
| Old Rotary Phone Ringing - Western Electric 500 | A 1950s **American** bell, so slightly off-era. Use sparingly | 1947 | https://freesound.org/people/mycompasstv/sounds/456433/ | CC0 1.0 | — | 60 s / 45 s, 441 KB | `devices/rotary-phone-ringing-1950s__fs456433__excerpt45s.ogg` | 3 |
| old musket bang | Outdoor musket shot | 1857 | https://freesound.org/people/bruno.auzet/sounds/538795/ | CC0 1.0 | — | 4 s, 83 KB | `devices/old-musket-bang__fs538795.mp3` | 4 |
| Cannon Shot | Cannon shot (taken from US-government video, so PD) | 1857 | https://freesound.org/people/qubodup/sounds/187767/ | CC0 1.0 | (uploader asks for a link back; optional) | 12 s, 254 KB | `devices/cannon-shot__fs187767.mp3` | 4 |
| *Not downloaded:* secretary typing on 1940s mechanical typewriter | Long, realistic office typing | 1942 | https://freesound.org/people/PostProdDog/sounds/550859/ | CC0 1.0 | — | 533 s | — | 5 |
| *Not downloaded:* Pendulum clock.flac (made in 1913) | Slightly irregular tick-tock | 1929 | https://freesound.org/people/janacp/sounds/253997/ | CC0 1.0 | — | 348 s | — | 5 |

---

## 4. Indian instruments and music

### 4a. CC0 one-shots and drones

| Name | Sounds like | Era fit | Source | Licence | Attribution | Duration / size | Local file | Q |
|---|---|---|---|---|---|---|---|---|
| Tanpura in E | Flat tanpura drone on Pa (5th) and Sa (8th) | All ★ | https://freesound.org/people/iluppai/sounds/148850/ | CC0 1.0 | — | 23 s, 302 KB | `instruments/tanpura-drone-E__fs148850.ogg` | 5 |
| Tanbura_96Khz24bit | A four-string tanpura droning | All | https://freesound.org/people/psuess/sounds/194435/ | CC0 1.0 | — | 82 s / 45 s, 391 KB | `instruments/tanpura-four-string-drone__fs194435__excerpt45s.ogg` | 5 |
| Harmonium Drone1 | A drone from an Indian-made harmonium (Paul & Co.) | All | https://freesound.org/people/easy_thunder/sounds/264407/ | CC0 1.0 | — | 126 s / 45 s, 483 KB | `instruments/harmonium-drone__fs264407__excerpt45s.ogg` | 5 |
| Shruti Box | Shruti box drone | All | https://freesound.org/people/iluppai/sounds/95345/ | CC0 1.0 | — | 11 s, 282 KB | `instruments/shruti-box-drone__fs95345.mp3` | 4 |
| sitar01.flac | First main string of a sitar (Ma = F) | All | https://freesound.org/people/deleted_user_229898/sounds/42192/ | CC0 1.0 | — | 41 s, 504 KB | `instruments/sitar-single-string-ma__fs42192.ogg` | 4 |
| Sitar 02 | A single sitar hit, good for a stinger | All | https://freesound.org/people/zgump/sounds/87436/ | CC0 1.0 | — | 1.5 s, 34 KB | `instruments/sitar-hit__fs87436.mp3` | 4 |
| Sitar.wav (Toni_Quiroga) | A friend playing in his room | All | https://freesound.org/people/Toni_Quiroga/sounds/339970/ | CC0 1.0 | — | 51 s / 45 s, 432 KB | `instruments/sitar-played__fs339970__excerpt45s.ogg` | 4 |
| tabla_na.wav | The "na" stroke on the dayan | All | https://freesound.org/people/Ninad_P/sounds/418377/ | CC0 1.0 | — | 2 s, 49 KB | `instruments/tabla-na-stroke__fs418377.mp3` | 4 |
| Tabla Rhythm Bayan Tala Kherwa | Bayan loop in kaharwa | All | https://freesound.org/people/afleetingspeck/sounds/151176/ | CC0 1.0 | — | 12 s, 268 KB | `instruments/tabla-bayan-kherwa__fs151176.mp3` | 4 |
| Tabla (Long) | One long F5 note | All | https://freesound.org/people/Sh%C5%8Dtotsu/sounds/689550/ | CC0 1.0 | — | 0.8 s, 20 KB | `instruments/tabla-long-note__fs689550.mp3` | 3 |
| DHOLAK-085-01 | Dholak pattern | All | https://freesound.org/people/iyankc/sounds/479246/ | CC0 1.0 | — | 6 s, 141 KB | `instruments/dholak-pattern__fs479246.mp3` | 3 |
| DHOLAK (BASS SKIN) | A palm hit on the bass skin | All | https://freesound.org/people/curesforbrokenhearts/sounds/536872/ | CC0 1.0 | — | 1.3 s, 25 KB | `instruments/dholak-bass-hit__fs536872.mp3` | 4 |
| Dhol playing in street (Holi greetings) | Street dhol; there may be some singing | 1947 celebration | https://freesound.org/people/deep_/sounds/728135/ | CC0 1.0 | — | 40 s, 310 KB | `instruments/dhol-street-playing__fs728135.ogg` | 4 |
| sarangi2 | A sarangi phrase from a live player | All | https://freesound.org/people/sarman1234/sounds/816126/ | CC0 1.0 | — | 15 s, 328 KB | `instruments/sarangi-phrase__fs816126.mp3` | 4 |
| Sarangi.wav | A single sarangi note | All | https://freesound.org/s/167023/ (deleted user) | CC0 1.0 | — | 4 s, 95 KB | `instruments/sarangi-note__fs167023.mp3` | 3 |
| sant-roll-A#5 | Santoor rolls | All | https://freesound.org/people/batchku/sounds/10677/ | CC0 1.0 | — | 11 s, 247 KB | `instruments/santoor-roll__fs10677.mp3` | 3 |
| FX Indian Ghungroo Anklet | Ankle bells | 1857 court | https://freesound.org/people/bashrambali/sounds/700521/ | CC0 1.0 | — | 62 s / 45 s, 459 KB | `instruments/ghungroo-anklet-bells__fs700521__excerpt45s.ogg` | 4 |
| Mridangam Jati | A Carnatic phrase (south Indian, so lower fit for these four cities) | — | https://freesound.org/people/ajaysm/sounds/194579/ | CC0 1.0 | — | 12 s, 256 KB | `instruments/mridangam-jati__fs194579.mp3` | 3 |
| Timpani Roll | Kettle-drum roll; repitch upward to approximate a nagara | 1857 | https://freesound.org/people/hallkev/sounds/428611/ | CC0 1.0 | — | 16 s, 290 KB | `instruments/timpani-roll-naqqara-standin__fs428611.mp3` | 3 |
| Hindu_Wedding_Ceremony_Music | Shehnai at a Hindu wedding (the uploader writes "Shehnai (clarinet)", so *ear-check* which it is). This is a live performance at a religious ceremony | All | https://freesound.org/people/bobv2/sounds/395024/ | CC0 1.0 | — | 176 s / 45 s, 391 KB | `instruments/shehnai-wedding-ceremony__fs395024__excerpt45s.ogg` | 3 |
| Bansuri sample E bass | A bass bansuri on tonic E | All | https://commons.wikimedia.org/wiki/File:Bansuri_sample_E_bass.ogg | Public domain (uploader's own work released to PD) | — | 99 s, 678 KB, mono | `instruments/bansuri-bass-E-sample__commons-PD.ogg` | 3 |

### 4b. CC-BY (attribution text is required, and is given ready to paste)

| Name | Sounds like | Source | Licence | **Attribution text** | Local file | Q |
|---|---|---|---|---|---|---|
| DHOL BEAT.wav | Professional dhol (Johnny Kalsi, The Dhol Foundation) | https://freesound.org/people/Johnnydhol/sounds/160426/ | CC BY 3.0 | "DHOL BEAT.wav" by Johnny Kalsi (Johnnydhol), The Dhol Foundation, https://freesound.org/s/160426/, licensed under CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/). Excerpted and re-encoded. | `instruments-ccby/dhol-beat-johnny-kalsi__fs160426__excerpt45s.ogg` (93 s orig) | 5 |
| SARANGI 1.wav | Sarangi stings with sympathetic strings | https://freesound.org/people/Johnnydhol/sounds/170316/ | CC BY 3.0 | "SARANGI 1.wav" by Johnnydhol (The Dhol Foundation Archive), https://freesound.org/s/170316/, licensed under CC BY 3.0. | `instruments-ccby/sarangi-sting-dhol-foundation__fs170316.ogg` (18 s) | 4 |
| hindu musical ceremony in the temple | Shehnai, tabla and digital tanpura at a puja in Kanchipuram (**religious**) | https://freesound.org/people/bohitomi/sounds/261871/ | CC BY 4.0 | "hindu musical ceremony in the temple" by bohitomi, https://freesound.org/s/261871/, licensed under CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Excerpted. | `instruments-ccby/shehnai-tabla-temple-puja__fs261871__excerpt45s.ogg` (333 s orig) | 3 |
| *Not downloaded:* Tabla individual bols 1 | Isolated tabla bols from a demonstration | https://freesound.org/people/sankalp/sounds/153268/ | CC BY 4.0 | "Tabla individual bols 1" by sankalp, https://freesound.org/s/153268/, CC BY 4.0 | — | 4 |
| *Not downloaded:* Harmonium/sitar field recordings | e.g. "A Man Approaches with Bowed Sitar, Rishikesh" | Wikimedia Commons, Samuel Corwin | CC BY 4.0 | "<title>" by Samuel Corwin, Wikimedia Commons, CC BY 4.0 | — | 3 |

### 4c. Public-domain historic recordings (archive.org, all published 1906–1925)

PD in India, because recordings published more than 60 years ago are out of copyright and performers' rights last only 50 years. PD in the US, because recordings published in 1925 or earlier have now expired under the MMA. The ragas and bandishes are traditional. Most uploads credit restoration to Laszlo Hortobagyi. Restoring a PD recording adds no new US copyright, but crediting him is a nice courtesy.

| Name | Sounds like | Era fit | Source | Licence / PD reason | Duration / size | Local file | Q |
|---|---|---|---|---|---|---|---|
| Talim Hussain, "Naffiri & Nakkarah (Shehanai)", HMV P.5090 | **Shehnai with naqqara**, the naubat sound of a court gate | 1857 ★ | https://archive.org/details/hmv-p-5090-gc-8-15190-nafiri-and-nakara-talim-hussain | PD: published Jan 1916 | 195 s orig / 60 s, 471 KB | `archival-pd-audio/talim-hussain_nafiri-nakkara-shehnai_HMV-P5090_1916__excerpt60s.ogg` | 5 |
| Talim Hussain, Shehnai (Jaunpuri Todi / Multani), HMV P.1472 | Solo shehnai | 1857 ★ | https://archive.org/details/1752-0902a-8-15125-9016r-shehnai-by-talim-hussain | PD: 1916 | 175 s / 60 s, 566 KB | `archival-pd-audio/talim-hussain_shehnai_HMV-P1472_1916__excerpt60s.ogg` | 5 |
| Janu Jivoobha, "Sarnai & Drum" (Chaughada), Beka 20093 | Sarnai and drum: a festive gate band | 1857 | https://archive.org/details/2643-1362-beka-grand-20093-sarnai-drum | PD: 1906 | 166 s / 60 s, 520 KB | `archival-pd-audio/janu-jivoobha_sarnai-and-drum-chaughada_beka_1906__excerpt60s.ogg` | 4 |
| Jehangir's Band, Amritsar, "Bhairvi", Odeon 95016/7 | A **Punjabi band** | 1929 Lahore ★ | https://archive.org/details/bhairvi-titala | PD: 1912 | 207 s / 60 s, 862 KB | `archival-pd-audio/jehangirs-band-amritsar_bhairvi_odeon_1912__excerpt60s.ogg` | 4 |
| Surat Band, "Hindustani band baja with bells", GC-2-10103 | An **Indian brass band with bells** | 1947 distant band ★ | https://archive.org/details/gc-2101-1 | PD: 1909 | 156 s / 60 s, 506 KB | `archival-pd-audio/surat-band_hindustani-band-with-bells_GC_1909__excerpt60s.ogg` | 4 |
| Peara Saheb, "Dr. Iqbal's National Song", HMV P.3928 | A male singer performing Iqbal. *Ear-check* that it is "Saare Jahan Se Achha" | 1942 Congress Radio opener | https://archive.org/details/dr.-iqbals-national-song-peara-saheb | PD: Apr 1919; Iqbal d. 1938 | 337 s / 60 s, 766 KB | `archival-pd-audio/peara-saheb_iqbal-national-song-tarana-e-hind_HMV-P3928_1919__excerpt60s.ogg` | 4 |
| Gauhar Jan, "Barse Badarva Re" (Raga Malhar), Pathé 46048 | Classical vocal in **the monsoon raga**, ending with "My name is Gauhar Jan, Calcutta" | 1942 gramophone ★ | https://archive.org/details/46048malharcorr | PD: 1912; Gauhar Jan d. 1930 | 118 s / 60 s + 22 s ending, 506 + 189 KB | `archival-pd-audio/gauhar-jan_barse-badarva-raga-malhar_pathe-46048_1912__excerpt60s.ogg`, `…announcement-my-name-is-gauhar-jan_1912__last22s.ogg` | 5 |
| Fazal Hussain, Sitar Jod (Tilak Kamod), HMV P.17531 | Solo sitar | All | https://archive.org/details/hmv-p-17531-8-15443-sitar-jod-tilak-kamod-fazal-hussain | PD: 1920 | 179 s / 60 s, 656 KB | `archival-pd-audio/fazal-hussain_sitar-jod-tilak-kamod_HMV-P17531_1920__excerpt60s.ogg` | 4 |
| Govindrao Tembe, Harmonium, Pilu, HMV P.8942 | Solo harmonium | 1929 | https://archive.org/details/hmv-p-8942-g-c-8-15328-ugich-kan-kanta-karnataki-harmonium-by-govindrao-tembe | PD: 1925 (US PD since 1 Jan 2026) | 216 s / 60 s, 518 KB | `archival-pd-audio/govindrao-tembe_harmonium-pilu_HMV-P8942_1925__excerpt60s.ogg` | 4 |
| Mastan Shah, Flute, "Chatur Mukut", Zonophone N.664 | Bansuri or clarinet-style flute | 1929 | https://archive.org/details/a-flute-chatur-mukut | PD: 1924 | 174 s / 60 s, 598 KB | `archival-pd-audio/mastan-shah_flute-chatur-mukut_zonophone-N664_1924__excerpt60s.ogg` | 3 |
| *Not downloaded:* 175 other pre-1926 discs | The MudritSangeet collection on archive.org | — | `collection:MudritSangeet`; our filtered list is in `research/mudrit_pre1926.txt` | Check each disc's "Released:" year is 1925 or earlier | — | — | — |

### 4d. Religious sounds: a balanced set (use all of them or none)

Our recommendation is to keep these out of the core loop. If a city bed does use them, rotate all four traditions equally, keep them short and distant, and **never put one under a "fake" stamp or a comic beat.** Two of the drum and ensemble files elsewhere are also religious: the Lahore dhamaal drumming (Sufi) and the temple puja shehnai. Count those in the balance too.

| Tradition | Name | Source | Licence | Attribution | Local file | Q |
|---|---|---|---|---|---|---|
| Muslim | evening call to prayer (Jaipur, from a hotel window) | https://freesound.org/people/rucisko/sounds/462739/ | CC0 1.0 | — | `religious-balanced/azaan-evening-jaipur__fs462739__excerpt45s.ogg` (84 s orig) | 4 |
| Hindu | Snailhorn (shankha conch) | https://freesound.org/people/Ohrwurm/sounds/64830/ | CC0 1.0 | — | `religious-balanced/shankha-conch-snailhorn__fs64830__excerpt45s.ogg` | 4 |
| Hindu | Shankh Sound | https://freesound.org/people/rsn267/sounds/746592/ | CC0 1.0 | — | `religious-balanced/shankh-conch-short__fs746592.mp3` | 3 |
| Hindu | 2 Hindu temples' evening bells (Kuala Lumpur) | https://freesound.org/people/LoopUdu/sounds/271627/ | CC0 1.0 | — | `religious-balanced/hindu-temple-bells-evening__fs271627.mp3` | 3 |
| Sikh | Canción relijiosa (a Sikh temple song with harmonium) | https://freesound.org/people/CasaAsiaSons/sounds/240820/ | **CC BY 3.0** | "Canción relijiosa.wav" by CasaAsiaSons, https://freesound.org/s/240820/, CC BY 3.0. Excerpted. | `religious-balanced/gurdwara-kirtan-harmonium-ccby__fs240820__excerpt45s.ogg` | 3 |
| Christian | bec low bell solo (church bell) | https://freesound.org/people/HMTSCCSound/sounds/554655/ | CC0 1.0 | — | `religious-balanced/church-bell-low-solo__fs554655.ogg` | 4 |
| Christian (Indian) | Alleluiah in Dibrughar: children praying in a Catholic cathedral in Assam | https://freesound.org/people/grololo/sounds/34863/ | CC0 1.0 | — | `religious-balanced/church-children-alleluia-dibrugarh__fs34863__excerpt45s.ogg` | 4 |
| *Not downloaded:* Sikh | Day Gurudwara Kirtan (Ludhiana) | https://freesound.org/people/rohitchauhan_17/sounds/856343/ | CC BY 4.0 | "Day Gurudwara Kirtan" by rohitchauhan_17, https://freesound.org/s/856343/, CC BY 4.0 | — (18 min long) | 4 |

---

## 5. Synthesise in code (Web Audio) instead of using files

These come out better as synths: they are small, they vary every time, and they carry no licence risk.

1. **Telegraph sounder (1857, 1929).** A real sounder makes no beep, only two clicks per element: a sharp *click* when the key goes down and a duller *clack* when it comes up.
   - Down: a 3 ms white-noise burst into a `BiquadFilter` bandpass at 2.2 kHz (Q 8). Add a triangle oscillator at about 1.2 kHz with an exponential gain decay of 25 ms.
   - Up: the same at a 700–900 Hz bandpass, −6 dB, with a 15 ms decay.
   - Timing: dot = 1200/WPM ms (15–20 WPM). Add ±8% jitter so it sounds like a human "fist".
   - **Check the 1857 detail before building:** we couldn't confirm whether the Delhi office in May 1857 used O'Shaughnessy's needle/galvanometer instruments or Morse sounders. The same synth can also do "needle ticks" (one soft tick per signal).
2. **CW Morse over radio (1942).** A sine at 600–800 Hz with 5 ms linear attack and release ramps (so it doesn't click), keyed from Morse text. Add QSB fading with a 0.1–0.3 Hz LFO on gain (depth 0.6) and mix with the static below.
3. **Shortwave static and tuning (1942).**
   - Bed: white noise → bandpass with its centre drifting between 800 and 3000 Hz.
   - Crackle: Poisson impulses (λ ≈ 20/s), each a noise burst of 1–3 ms.
   - Tuning whistle: an oscillator at |dial − station| × k, from 0 to 4 kHz, getting louder as you get close.
   - Locked on: open a 300–3000 Hz bandpass on the programme audio, add a mild `WaveShaper` distortion, and run a slow fade LFO.
4. **Valve hum at 50 Hz.** Indian mains is 50 Hz; the samples are 60 Hz US hum. Sum sines at 50, 100, 150 and 200 Hz with amplitudes 1, 0.5, 0.25 and 0.12, or use a sawtooth at 50 Hz → lowpass at 400 Hz. Keep it at about −35 dB. For warm-up, ramp gain over 3–8 s with a little pitch wobble at first.
5. **Fuse hiss and sparkler (1947).** White noise → highpass at 2 kHz → bandpass whose centre jumps randomly between 1.5 and 6 kHz every 30–80 ms. Multiply gain by a random crackle signal and add sparse pops.
6. **Naqqara or nagara (1857).**
   - Bass drum: a sine sweeping 180→90 Hz over 80 ms, a 400 ms amplitude decay, and a noise burst through a 300–600 Hz bandpass for the stick.
   - Treble drum: 260→170 Hz with a 200 ms decay.
   - Play naubat-style patterns (fast treble rolls over a bass pulse) and put a short `ConvolverNode` reverb on it.
7. **Dhol accents.** Bass side: a sine at 70→50 Hz with a 250 ms decay. Treble side (tilli stick): a noise burst through a 2–4 kHz bandpass with a 40 ms decay. Good for stingers. For tabla, keep the samples.
8. **Tanpura or harmonium drone (if you want to avoid loop seams).**
   - Harmonium: two sawtooth "reeds" on Sa and Pa, the second detuned +3 cents so they beat. Lowpass at 1.5 kHz and add a 0.3 Hz bellows tremolo (±10% gain).
   - Tanpura: Karplus–Strong plucks in the order Pa-Sa-Sa-Sa(low) every 1.2 s. Add a soft-clip `WaveShaper` and a high-shelf for the *jawari* buzz. In a native feedback loop a `DelayNode` is clamped to at least 128 frames, so the pitch tops out around 375 Hz. That is fine at a Sa around 130–150 Hz; use an `AudioWorklet` for higher strings.
   - Even simpler: `playbackRate`-shift the CC0 tanpura loop.
9. **Clock tick.** Alternate a 3.2 kHz and a 2.4 kHz bandpassed click, each a 4 ms noise burst, at 1 Hz with ±5 ms jitter. The CC0 18th-century clock has more character, so either is fine.
10. **Gramophone treatment for the archival 78s.** Hiss (highpass noise at −40 dB), sparse crackle impulses, a rotation thump at 78 rpm (1.3 Hz), a 200–4000 Hz bandpass on the music, and a 0.6 Hz ±0.3% wow on `playbackRate`. This makes the PD 78s sound as if they are playing in the room.
11. **Station ident / interval signal.** Build your own motif: 3–5 FM bell tones over a tanpura drone. **Don't use the All India Radio signature tune** (Walter Kaufmann, 1936; he died in 1984, and its ownership and term are unclear). Congress Radio didn't use it anyway.
12. **Distant fireworks.** Lowpassed noise bursts (cutoff falls with distance) plus a synthetic reverb tail (a convolver with a decaying-noise IR), and the occasional sine whistle sweeping 2→4 kHz. Layer these over the recorded Thane fireworks for variety.

**Better as recorded files:** typewriter, rubber stamp, paper, quill, envelope, tabla, shehnai, sarangi, crowds, rain, crows, horses, trains.

---

## 6. Archival images

Rule for US-hosted safety: the image must be PD in India **and** in the US. Published before 1931 means PD in the US outright. Indian works published from 1936 onward may have had US copyright restored under the URAA unless they were PD in India by 1 Jan 1996.

| Name | Looks like | Era | Source | Licence / PD reason | Size | Local file | Q |
|---|---|---|---|---|---|---|---|
| Bahadur Shah Zafar, May 1858 (Robert Tytler and Charles Shepherd; British Library) | The last Mughal emperor after his trial | 1857 ★ | https://commons.wikimedia.org/wiki/File:Bahadur_Shah_Zafar.jpg | PD: photographed and published 1858; authors died over 100 years ago | 420×324 | `images/1857-delhi/bahadur-shah-zafar-photo-1858.jpg` | 4 (low resolution) |
| Delhi Urdu Akhbar, 17 May 1857 | A page of an Urdu newspaper printed during the uprising (editor Maulvi Muhammad Baqir) | 1857 ★ | https://commons.wikimedia.org/wiki/File:Urdu-akhbar.png | PD: published 1857. A faithful scan of a 2D PD work is PD in the US | 517×837 | `images/1857-delhi/delhi-urdu-akhbar-1857-05-17.png` | 5 |
| Bahadur Shah II in darbar, c. 1837 (San Diego Museum of Art) | A Mughal court painting (gives the Indian perspective) | 1857 | https://commons.wikimedia.org/wiki/File:Bahadur_Shah_II_in_darbar,_1837,_San_Diego_Museum_of_Art.jpg | PD: c. 1837 | 1276×1839 (resized to 1400) | `images/1857-delhi/bahadur-shah-ii-darbar-1837.jpg` | 5 |
| Chandni Chowk, Felice Beato, 1858 | A street scene in Chandni Chowk | 1857 | https://commons.wikimedia.org/wiki/File:Photograph_of_a_street-scene_in_Chandni_Chowk,_Delhi,_by_Felice_Beato,_1858.jpg | PD: 1858; Beato d. 1909 | 1080×939 | `images/1857-delhi/chandni-chowk-beato-1858.jpg` | 4 |
| Chandni Chowk, Samuel Bourne, c. 1863–67 | A clearer street view | 1857 | https://commons.wikimedia.org/wiki/File:Chandni_Chowk,_Delhi,_1863-67.jpg | PD: Bourne d. 1912 | 1600×1214 | `images/1857-delhi/chandni-chowk-bourne-1863.jpg` | 4 |
| Plan of the city of Delhi, Illustrated London News, 1857 | A city plan for the desk | 1857 ★ | https://commons.wikimedia.org/wiki/File:Plan_of_the_city_of_Delhi,_from_the_Illustrated_London_News,_1857.jpg | PD: published 1857 | 1972×1872 | `images/1857-delhi/plan-of-delhi-iln-1857.jpg` | 5 |
| 1863 Dispatch Atlas map of Delhi (Edward Weller) | Hand-coloured city map | 1857 | https://commons.wikimedia.org/wiki/File:1863_Dispatch_Atlas_Map_of_Delhi,_India_-_Geographicus_-_Delhi-dispatch-1867.jpg | PD: 1863 | 4000 px (resized to 1600) | `images/1857-delhi/delhi-map-dispatch-atlas-1863.jpg` | 4 |
| "Delhi, from the Flagstaff Tower", J. R. Turnbull lithograph, 1858 | Siege-era view (**from the British side; frame it with care**) | 1857 | https://commons.wikimedia.org/wiki/File:J._R._Turnbull_-_Delhi,_from_the_Flagstaff_Tower.jpg | PD: 1858 | 4000 px (resized to 1600) | `images/1857-delhi/delhi-from-flagstaff-tower-turnbull-1858.jpg` | 4 |
| Bhagat Singh, April 1929 (Ramnath Photographers, Delhi) | The well-known hat portrait | 1929 ★ | https://commons.wikimedia.org/wiki/File:Bhagat_Singh_1929.jpg | PD-India (photo published 1929; 60 years from publication) and PD-1996 (already PD in India on the URAA date, so PD in the US; also published before 1931) | 1112×1428 | `images/1929-lahore-delhi/bhagat-singh-1929-ramnath.jpg` | 5 |
| Bhagat Singh's letter to the Superintendent, CID, 31 May 1929 | A handwritten letter for the desk | 1929 | https://commons.wikimedia.org/wiki/File:Bhagat_Singh%27s_Letter_to_Superintendent,_CID.jpg | PD: the author died in 1931 (India life + 60 ended 1992; US unpublished works, life + 70, ended 2002) | 499×960 | `images/1929-lahore-delhi/bhagat-singh-letter-cid-1929.jpg` | 4 |
| Lala Lajpat Rai, *Young India*, Feb 1920 | Portrait (his death after the 1928 lathi charge drives the HSRA story) | 1928–29 | https://commons.wikimedia.org/wiki/File:Lala_Lajpat_Rai_photo_in_Young_India.jpg | PD: published 1920 | 728×908 | `images/1929-lahore-delhi/lala-lajpat-rai-young-india-1920.jpg` | 4 |
| Tollinton Market, Lahore, coloured postcard, c. 1910s | A Lahore postcard | 1929 | https://commons.wikimedia.org/wiki/File:Coloured_postcard_print_of_a_photograph_of_Tollinton_Market,_Lahore,_Punjab,_ca.1910%27s.jpg | PD: published before 1931; anonymous | 1017×651 | `images/1929-lahore-delhi/tollinton-market-lahore-postcard-1910s.jpg` | 4 |
| Survey of India sheet 53 H, Delhi, 1922 | A topographic sheet of Delhi | 1929 ★ | https://commons.wikimedia.org/wiki/File:53_H_Delhi_(1922).jpg | PD: a Government of India work published 1922 (60-year term) and published before 1931 | 5358×6894 (resized to 1600) | `images/1929-lahore-delhi/survey-of-india-53H-delhi-1922.jpg` | 5 |
| *Not downloaded:* Central Assembly Hall, New Delhi, 1927 postcard | The chamber where the 1929 bombs were thrown | 1929 | https://commons.wikimedia.org/wiki/File:Central_Assembly_Hall,_New_Delhi.jpg | The underlying card is PD (1927), but **the Commons file is tagged CC BY-SA 4.0** (a Paper Jewels scan). Flagged: attribute it or avoid it | 1200×739 | — | 3 |
| Indian women training for ARP duties, Bombay, 1942 (IWM IND 1492, No. 9 Army Film & Photographic Unit) | A Bombay civil-defence drill | 1942 ★ | https://commons.wikimedia.org/wiki/File:Indian_women_training_for_air_raid_precautions_(ARP)_duties_in_Bombay,_1942._IND1492.jpg | PD: **UK Crown Copyright expired** (a UK government photograph taken before 1957, so it expired 50 years after it was made). It was PD in the UK on the URAA date, so it is PD in the US | 5486 px (resized to 1600) | `images/1942-bombay/arp-training-bombay-1942-iwm-IND1492.jpg` | 5 |
| Bombay City map, 1924 (John Murray, *Handbook for Travellers in India*) | City map for the desk | 1942 ★ | https://commons.wikimedia.org/wiki/File:Bombay_City_map_(1924).jpg | PD: published 1924 | — | `images/1942-bombay/bombay-city-map-1924.jpg` | 5 |
| Map of the City of Bombay, Imperial Gazetteer 1907–09 (J. G. Bartholomew) | A cleaner colour map | 1942 | https://commons.wikimedia.org/wiki/File:Map_of_the_City_of_Bombay_from_The_Imperial_Gazetteer_of_India_(1907-1909).jpg | PD: published 1909; Bartholomew d. 1920 | — | `images/1942-bombay/bombay-city-map-imperial-gazetteer-1909.jpg` | 4 |
| *Not downloaded:* "Mohammedan merchant… Bombay, 1942" | Street trader | 1942 | https://commons.wikimedia.org/wiki/File:Mohammedan_merchant_selling_wares_in_a_street_in_Bombay_in_1942.jpg | Tagged **PD India only**, from an unknown source (oldindianphotos.in). US status is unclear because of the URAA. Avoid it; the caption also uses a period term | — | — | 2 |
| Illuminations in New Delhi, Independence Day 1947 (Photo Division, Govt of India) | Lit-up buildings | 1947 | https://commons.wikimedia.org/wiki/File:Illuminations_in_New_Delhi_on_Independence_Day_in_1947.jpg | **PD in India** (a government work published 1947, expired 2008). **US status is uncertain**: it was still protected in India in 1996, so the URAA may have restored US copyright to about 2042. Medium risk. Use it as reference for original art, or cite it as "Photo Division, Ministry of I&B, Government of India" if you accept the risk | 1444×1487 | `images/1947-delhi/illuminations-new-delhi-1947-photodiv.jpg` | 3 |
| A Delhi bazaar decorated with flags, 15 Aug 1947 (Photo Division) | Street with flags | 1947 | https://commons.wikimedia.org/wiki/File:Godrej_%26_Boyce,_Delhi_on_15_Aug_1947.jpg | Same as above (medium risk) | 1463×1455 | `images/1947-delhi/delhi-bazaar-flags-15aug1947-photodiv.jpg` | 3 |

**Gaps and advice.**
- No PD photograph of the **Delhi Telegraph Office in 1857** exists on Commons; the "Telegraph Memorial" photo there is modern CC BY-SA.
- For 1947, draw or typeset original props instead of relying on photos: a tricolour, a Constituent Assembly pass, a newspaper replica written in your own words. The 1947 Indian photos and newspaper pages all carry the URAA question.
- US Army Map Service sheets are US-federal and so PD everywhere, but the ones on Commons are 1950s–60s editions (e.g. *NH 43-16 Delhi*, 1962), which are anachronistic.
- For balance in 1857, pair the British views (ILN, Turnbull) with Indian sources (the *Urdu Akhbar* page, the darbar painting).

---

## 7. Fonts (all embeddable on the web)

Files are in `fonts/<family>/` with their licence files. The woff2 sizes come from a test with `pyftsubset --layout-features='*'` (output in `research/font-subset-test/`). Basic Latin is U+0020–007E plus Latin-1 and smart quotes; the Devanagari block is U+0900–097F plus Vedic extensions and ZWJ/ZWNJ.

| Role | Family | Licence | TTF size | woff2, subset | Notes | Q |
|---|---|---|---|---|---|---|
| **Typewriter / telegram** ★ | Special Elite | **Apache 2.0** | 162 KB | 50 KB (Latin) | A worn-typewriter texture, good for typed reports and telegrams. Ship `LICENSE.txt` with it | 5 |
| Typewriter, clean | Courier Prime (Regular + Bold) | OFL 1.1 | 69–71 KB each | 17 KB | Clean mono for long text | 5 |
| **Victorian print, 1857** ★ | Old Standard TT (Regular, Italic, Bold) | OFL 1.1 | 243–266 KB | 21 KB | A late-19th-century "Modern" text face, right for newspapers and proclamations | 5 |
| Victorian print, older feel | IM Fell English (Roman + Italic) | OFL 1.1 | 190–197 KB | 60 KB | Rough letterpress texture | 4 |
| Victorian poster display | Rye | OFL 1.1 **with Reserved Font Name "Rye"** | 178 KB | 39 KB | Wood-type poster face. **Ship it unmodified, or rename the subset** | 4 |
| Victorian poster display | Ewert | OFL 1.1 **with Reserved Font Name "Ewert"** | 69 KB | — | Ornamental wood type; same RFN caution | 3 |
| Copperplate hand (letters, 1857) | Pinyon Script | OFL 1.1 | 147 KB | 35 KB | For handwritten notes and signatures | 4 |
| **Devanagari, "old print" + text** ★ | Tiro Devanagari Hindi (also comes in Italic) | OFL 1.1 | 413 KB | 121 KB (Latin + Devanagari) | Traditional book-face proportions, with a matching Latin | 5 |
| Devanagari poster | Rozha One | OFL 1.1 | 315 KB | 82 KB | High-contrast display, good for 1929 and 1942 handbill headlines | 4 |
| Devanagari handwriting | Kalam | OFL 1.1 | 417 KB | 124 KB | Handwritten notes | 3 |
| **UI face pairing with Devanagari** ★ | Mukta (Regular, Bold; 7 weights available) | OFL 1.1 | 408–422 KB | **22 KB Latin only**, 116 KB Latin + Devanagari | One family covers Latin and Devanagari with matched metrics. Split by `unicode-range` so Latin-only pages load 22 KB | 5 |
| **Nastaliq / Urdu** ★ | Gulzar | OFL 1.1 | 940 KB | 180 KB (Arabic blocks); **43 KB for one headline subset by exact text** | Proper Nastaliq. Subset by text for fixed headlines; keep the full block for dynamic text | 5 |
| Nastaliq, alternative | Noto Nastaliq Urdu (variable wght) | OFL 1.1 | 674 KB | 198 KB | More conservative, with wide coverage | 4 |
| **Gurmukhi, "old print"** ★ | Tiro Gurmukhi | OFL 1.1 | 147 KB | 44 KB | Book-like; pairs with Tiro Devanagari | 5 |
| Gurmukhi UI | Mukta Mahee | OFL 1.1 | 206 KB | 41 KB | Matches Mukta for UI | 5 |

**Subsetting.** It works for every family; see the table. For complex scripts (Devanagari, Gurmukhi, Nastaliq), subset by **Unicode block with `--layout-features='*'`** so conjuncts and joining survive. Subset by exact text only for fixed strings such as titles and stamps. Serve woff2 with `unicode-range` splits. All of these are also on the Google Fonts CSS API, but self-hosting avoids a third-party request.

---

## 8. Rejected or flagged (licence and sensitivity pitfalls found)

| Item | Problem |
|---|---|
| Freesound #699125 "TelegraphEquip.BBC.ECD154e.mp3" (marked CC0) | A **BBC library effect re-uploaded as CC0**. Not valid. |
| Freesound #639494 "الأذان (Adhan/Call to Prayer)" (marked CC0) | The description says it was **"Extracted from" a YouTube video**, so the CC0 is not valid. |
| Freesound PhonosUPF "bansuri set…" (#490809 and others, marked CC0) | Cut from a **1976 Hariprasad Chaurasia concert recording**, so the CC0 is not valid. |
| Freesound #249301 "Flautist@Mudiali" (marked CC0) | The street flautist plays the Bollywood song **"O Sathi Re"** (1978). The melody is under copyright. |
| Freesound #178176 "Tabla Loop Shuffle" (marked CC0) | Built from "Boulanger's free library" samples, whose licence is unknown. Avoid. |
| Freesound #415294 "Mumbled Voices" (marked CC0) | Captured broadcast content of unknown ownership, and the speech may be modern. |
| Freesound #705396 "Steam locomotive" (marked CC0) | AI-generated, with unclear provenance. Avoid. |
| Freesound #177474 "VandeMatram.wav" (sarangi, CC BY 4.0) | Licence OK, but **politically contested**. Congress Radio closed with Vande Mataram, so if you depict that, do it as text rather than playing it. |
| Freesound BY-NC (#439477 Sankh conch, #18690 bullock cart procession, the lewk tabla set) and Sampling+ (sonologue dhol, msarkar tabla) | The NC and Sampling+ licences forbid this use. |
| archive.org `dni.ncaa.*` (e.g. Bismillah Khan, NCAA) | CC BY-NC 4.0. |
| archive.org `dli.akashvani.*` (Bismillah Khan, 1956, and others) | PD in India; **not PD in the US** (protected until 2066 under the MMA). |
| archive.org Abdul Karim Khan, Odeon SB 2257 (1932) | PD in India; protected in the US until the end of 2032. |
| All India Radio signature tune (Kaufmann, 1936) | Ownership and term unclear. Don't use it. |
| Modern Delhi and Mumbai street ambiences (Freesound 336468, 34864, 263636, 319360, 221639) | CC0 but full of car horns and engines; **wrong for 1857** and doubtful for 1929. |
| Commons 1942 and 1947 Indian photos tagged only "PD India" | US status unclear under the URAA. |
| Pixabay, BBC Sound Effects, Sonniss GDC | See §0. Raw files can't go into a public repo. |

---

## 9. Draft CREDITS block (CC-BY items only; CC0 and PD items need no credit, though courtesy credit is nice)

```
Sound: "DHOL BEAT.wav" by Johnny Kalsi (Johnnydhol), The Dhol Foundation — https://freesound.org/s/160426/ — CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/) — excerpted, re-encoded.
Sound: "SARANGI 1.wav" by Johnnydhol (The Dhol Foundation Archive) — https://freesound.org/s/170316/ — CC BY 3.0.
Sound: "hindu musical ceremony in the temple" by bohitomi — https://freesound.org/s/261871/ — CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/) — excerpted.
Sound: "Canción relijiosa.wav" by CasaAsiaSons — https://freesound.org/s/240820/ — CC BY 3.0 — excerpted.
Archival recordings (public domain, 1906–1925) digitised via archive.org, MudritSangeet collection; restoration credited to Laszlo Hortobagyi.
Image: "Indian women training for ARP duties in Bombay, 1942" — Imperial War Museum IND 1492 — Crown Copyright expired.
```
