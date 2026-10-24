# Firangi Tota: 3D desk spike report

Date: 24 Oct 2026. Throwaway code. All of it was written from scratch for this spike; none of the reference's code, shaders, text or assets were copied (the reference repo has no licence).

**Verdict.** A procedural Three.js desk scene in the reference's style is cheap enough for budget phones if the quality tiers do their job. On the CPU side the scene costs about 1 ms of JavaScript per frame, even with 6× CPU throttling. The real cost on cheap phones will be GPU fill rate, and that depends almost entirely on canvas pixel count, shadows and MSAA. The tier system targets exactly those three, and the adapter test shows it stepping down correctly. Real-phone numbers are still missing. The preview has an on-device bench (`?bench`) so the owner can collect them in about 30 seconds per phone.

- Preview: **https://firangi-tota-spike.vercel.app** (public production alias of the new throwaway Vercel project `firangi-tota-spike`, scope `oxdivs-projects`. The per-deployment URL sits behind Vercel login, so share only this alias.)
- Source: a throwaway spike project outside this repository, not kept (Vite 8.3.4, TypeScript 6.0.3, three 0.186.1, playwright-core 1.63.0, all pinned and at least two weeks old)
- Bench scripts and raw data: a `measure.mjs` script and its `results.json`, kept with the throwaway spike, not in this repository

## How to test on a real phone

| URL | What it does |
|---|---|
| `/?debug` | Auto tier, plus a HUD with tier, fps, p95, draw calls, triangles, DPR, canvas size, GPU string and adapter log, with buttons to force a tier |
| `/?debug&bench` | Runs low, mid and high for 6 s each after the intro, then shows a table to screenshot (fps, p50, p95, max frame, canvas, calls) |
| `/?tier=low` (or `mid`, `high`) | Forces a tier and turns the adapter off |
| `/?nowebgl` | Shows the 2D fallback |
| tap a seal | Stamp animation: raise, move, press, small shake, synthesized thud, imprint on the paper |
| tap the letter | Reading zoom on the sheet (tap again to go back) |

Testing-only knobs: `?fakegpu=<string>` overrides the GPU string to test detection rules. `?simgpu=<ms per megapixel>` burns main-thread time in proportion to canvas pixels, to imitate a fill-rate-bound GPU. `?gputime` reads GPU time per frame where `EXT_disjoint_timer_query_webgl2` exists (desktop Chrome yes; iOS Safari and most Android Chrome builds no).

## Numbers

### Build and transfer

| Item | Size |
|---|---|
| JS bundle, raw | 616.7 KB (three r186 is about 95% of it) |
| JS, gzip -9 | 157.1 KB (Vite reports 159.6 KB at its default level) |
| JS, brotli -q 11 | 129.6 KB |
| JS as served by Vercel (on-the-fly brotli) | 162.7 KB |
| index.html | 2.1 KB raw, 1.0 KB gzip |
| **Total transferred, cold cache** (measured via CDP `encodedDataLength`) | **361.7 KB** = JS 158.1 + HTML 1.3 + Google Fonts CSS 1.1 + font files 201.2 |
| Font files alone | IM Fell English regular 59.9 KB + italic 57.8 KB, Tiro Devanagari Hindi Devanagari subset 63.6 KB + its Latin subset 19.8 KB |

The fonts weigh more than all of three.js. That is the easiest size win (see pitfalls).

### Frame rate per tier (Chrome 155 headless, 360×800 viewport at DPR 3, mobile and touch emulation, 10 s of rAF timing after the 3.5 s intro)

| Tier | CPU throttle | Canvas (px) | fps | p50 ms | p95 ms | max ms | frames >33 ms | draw calls | tris | main thread ms/frame | GPU ms/frame (M4) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| low | 1× | 360×800 | 60 | 16.7 | 16.7 | 16.8 | 0 | 63 | 5.7k | 0.83 | 0.19 |
| mid | 1× | 540×1200 | 60 | 16.7 | 16.8 | 16.8 | 0 | 88 | 7.7k | 0.99 | 0.49 |
| high | 1× | 720×1600 | 60 | 16.7 | 16.8 | 16.8 | 0 | 88 | 7.7k | 0.55 | 1.35 |
| low | 4× | 360×800 | 60 | 16.7 | 16.8 | 16.8 | 0 | 63 | 5.7k | 0.27 | 0.14 |
| mid | 4× | 540×1200 | 60 | 16.7 | 16.7 | 16.8 | 0 | 88 | 7.7k | 0.47 | 0.36 |
| high | 4× | 720×1600 | 60 | 16.7 | 16.7 | 16.8 | 0 | 88 | 7.7k | 0.57 | 0.94 |
| low | 6× | 360×800 | 60 | 16.7 | 16.8 | 16.8 | 0 | 63 | 5.7k | 0.40 | 0.14 |
| mid | 6× | 540×1200 | 60 | 16.7 | 16.8 | 16.8 | 0 | 88 | 7.7k | 0.62 | 0.35 |
| high | 6× | 720×1600 | 60 | 16.7 | 16.8 | 16.8 | 0 | 88 | 7.7k | 0.60 | 0.89 |

How to read this:
- **CPU throttling does not move the needle.** Every tier holds a locked 60 fps at 1×, 4×, 6× and even 20× (from the auto-mode run). I checked that throttling really applies: a fixed JS loop goes from 29 ms to about 100 ms at the 6× setting, so the effective slowdown on this M4 is about 3.5×. The scene's per-frame JavaScript is roughly 1 ms, so there is more than 10× headroom on the main thread.
- **The GPU cannot be throttled.** Chrome has no GPU throttling, and this Mac's GPU (Apple M4, Metal through ANGLE) is about 50× faster than a Mali-G52 MC2. Every fps number above is therefore an upper bound for phones. GPU time scales with canvas pixels: high costs 7× low for 4× the pixels, the rest being MSAA and the shadow pass.
- Time to first frame (load, scene build, shader compile): 265–368 ms unthrottled and 594–654 ms at 6×, from localhost. From the live Vercel URL on this Mac it was 862 ms.
- Stamp frame (re-uploading the whole paper canvas to the GPU): 16.7 ms here at every tier and throttle, so no visible hitch. On phones this is a 2–4 MB `texImage2D` and needs a real-device check (fix below).
- Tier switch (synchronous part, includes `renderer.compile`): 7–30 ms at 1× and 10–56 ms at 6×. The worst case is crossing into high, because that recreates the WebGL context for MSAA. Phones compile shaders much more slowly, so expect a visible hitch of a few hundred milliseconds there.

### Rough estimate for real phones (not measured; replace with `?bench` results)

I scaled the measured M4 GPU times by approximate GPU throughput ratios from public GFXBench Manhattan 3.1 offscreen scores. Treat these as ±50%.

| Device class | Scale vs M4 | low | mid | high |
|---|---|---|---|---|
| Mali-G52 MC2 (Redmi 9/10, Helio G85) | ~50× slower | ~9.5 ms, 60 fps | ~25 ms, ~40 fps, adapter drops to low | ~67 ms, ~15 fps |
| Adreno 610 (Snapdragon 662/665) | ~40× | ~8 ms, 60 fps | ~20 ms, ~50 fps, borderline | ~54 ms, ~18 fps |
| iPhone 14 (A15, 5-core GPU) | ~2.5× | <1 ms | ~1.2 ms | ~3.4 ms, 60 fps with large headroom |

### Detection and adaptation tests

Spoofed GPU strings (`?fakegpu`), 360×800 at DPR 3 (2.6M physical px):

| GPU string | Start tier | Why |
|---|---|---|
| Mali-T720, Adreno (TM) 506, PowerVR Rogue GE8320 | low | GPU on low list |
| Mali-G52 MC2, Adreno (TM) 610, Mali-G57 MC2 | mid | GPU on mid list |
| Adreno (TM) 730, Mali-G710 MC10 | high | no limits found |
| Apple GPU | high | Apple GPU, adapter decides |

Adapter with a simulated fill-rate-bound GPU (`?simgpu`, starting from high):

| Simulated cost | Result | Settled fps |
|---|---|---|
| 8 ms/Mpx | stays high | 60 |
| 20 ms/Mpx | high→mid at 43 fps | 60 |
| 35 ms/Mpx | high→mid at 25 fps, then mid→low at 44 fps | 60 |
| 70 ms/Mpx (slower than any tier can fix) | high→mid at 12 fps, then mid→low at 22 fps, stays low | 49 |

There was no oscillation in any run, because the adapter never climbs back to a tier it fell from.

## Tier settings and selection rules that worked

| | high | mid | low |
|---|---|---|---|
| DPR cap | 2 | 1.5 | 1 |
| MSAA (context attribute) | on | off | off |
| Shadows | PCF 1024, radius 3 | Basic 512 | none (blob decals instead) |
| Lights | hemi + moon + flame spot + flame point + front fill | hemi + flame spot + flame point + front fill | hemi + flame point + front fill |
| Materials | Phong everywhere | Phong on metal and ink, Lambert elsewhere | Lambert everywhere |
| Dust motes | 140 | 60 | 16 |
| Paper canvas | 1024 px, max anisotropy | 768 px, 4× | 512 px, 1× |

Starting tier (cheap signals, worst one wins):
1. `?tier=` override wins and locks the adapter.
2. GPU string from `WEBGL_debug_renderer_info`, read on a throwaway WebGL2 context that is released right away with `WEBGL_lose_context`:
   - Low list: `Mali-[34]xx`, `Mali-T6xx/T7xx/T8xx`, `Mali-G31/G51`, `Adreno 3xx/4xx/504–506`, `PowerVR`, `SGX`, and software renderers (`SwiftShader`, `llvmpipe`).
   - Mid list: `Mali-G52/G57/G60/G68/G71/G72/G76` and `Adreno 5xx/600–649`.
   - Use `(?!\d)` after Mali model numbers, because `Mali-G71` otherwise matches `Mali-G710`. My first version had this bug and put a flagship Dimensity GPU on mid.
3. `navigator.deviceMemory` ≤2 means low, ≤4 caps at mid. It is Chrome-only; Safari leaves it undefined.
4. `hardwareConcurrency` ≤2 means low, ≤4 caps at mid. This is skipped on Apple, because Safari clamps the value.
5. Touch screen, DPR ≥2.5, more than 2.5M physical pixels and a GPU not on the strong list (`Adreno 65x+/7xx/8xx`, `Mali-G6[1-9]x/G7[1-9]x`, Immortalis, Xclipse, Apple) caps at mid.
6. A hidden GPU string caps at mid. `Apple GPU` starts at high, because any device running current iOS has a decent GPU and the adapter catches the rest.

Adapter: it skips the first 1 s and 0.75 s after every switch (shader compiles and uploads). It measures 2 s windows, steps down below 45 fps, and steps up only above 58 fps and never back to a tier it fell from. After two stable windows it switches to 5 s windows and steps down only below 40 fps. Frames longer than 250 ms are ignored, and the window resets when the tab becomes visible again.

## Pitfalls hit (and ones to expect)

**Fonts in canvas textures**
- Drawing to a canvas never triggers a web-font download. You must call `document.fonts.load()` yourself, then redraw and set `texture.needsUpdate`. `document.fonts.ready` alone can resolve before the font was ever requested.
- Google splits fonts by `unicode-range`. The Devanagari file loads only when the `load()` sample text contains Devanagari. Mixed strings (Devanagari plus spaces, digits and punctuation) also pulled in Tiro's Latin subset, an extra 19.8 KB.
- Any canvas texture that uses the font needs a redraw, not only the paper. The seal bands and the folded letter needed one too. I gave every canvas texture a `redraw()` and call them all when fonts land, on the `loadingdone` event as well.
- `CanvasTexture` needs `colorSpace = SRGBColorSpace`, or every canvas colour looks washed out under r152+ colour management.
- Fonts are 201 KB, more than three.js. For the real build: self-host, drop the IM Fell italic, and subset Tiro to the Devanagari glyphs the game actually uses (likely 20–30 KB). Shaping checked out: conjuncts and matras render correctly in Chrome canvas, as in "मेरठ के सवार सुबह दिल्ली पहुँचे।"

**Renderer lifecycle (the worst bug in the spike)**
- MSAA is fixed when the context is created, so moving between high and mid means building a new `WebGLRenderer`. When you then call `forceContextLoss()` on the old renderer, its canvas fires `webglcontextlost`. My handler set a shared `lost` flag, so **after the switch the picture froze while rAF still reported 60 fps**. Guard every context event with `if (r === currentRenderer)`. The fps counter alone would never have caught this; the simulated-load test did.
- three r186 is WebGL2-only (WebGL1 was dropped in r163). Detect WebGL2, not WebGL, and send everything else to the 2D fallback. Old iOS (before 15) lands there.
- three r186 **removed `PCFSoftShadowMap`**. It warns and falls back to `PCFShadowMap`, which is now 5 hardware-filtered taps on a Vogel disk with `shadow.radius` controlling softness. Any r128-era tutorial code (like the reference's) needs updating.

**Shadow cost**
- The shadow pass adds 25 draw calls (63 to 88) because every caster is drawn again into the shadow map, and it happens every frame because the flame flickers.
- For the real build: set `shadowMap.autoUpdate = false`. Re-render the map only while something moves (the stamp animation), and keep the flicker in light intensity, not position. That removes the pass on most frames.
- Lights sitting 2–3 cm from the brass lamp blew it out to white. The lamp itself uses an unlit material with a baked vertical gradient whose brightness follows the flicker. It looks better and costs less.
- A spot light at the flame (one shadow map) instead of a point light (a six-face cube map) is the right call.

**DPR and resolution**
- Canvas pixel count is the main GPU lever. On a 360×800 phone at DPR 3: high 1.15M px, mid 0.65M, low 0.29M. Measured GPU time follows pixels almost linearly.
- Capping DPR at 2 (as the reference does) still means 1.15M px with MSAA on a cheap 720p phone. That is too much for Mali-G52-class GPUs; mid's 1.5 cap is the sweet spot.
- Mid and high look almost the same at phone size (side-by-side screenshots). Mid is the value tier.

**iOS Safari (from platform knowledge; not verified on a device in this spike, so check with `?debug`)**
- The GPU string is just `Apple GPU`, so an iPhone 8 and an iPhone 15 Pro look identical. Start high and rely on the adapter.
- `hardwareConcurrency` is clamped and `deviceMemory` is undefined.
- There are no GPU timer queries. The iPhone 14 is a 60 Hz panel, so "above 58 fps" is the only headroom signal you get.
- **Low Power Mode caps rAF at 30 fps**, and some Android battery savers do the same. The adapter would read 30 fps and wrongly drop to low. The real build should detect frame times locked at 33.3 ms with low variance and treat that as a cap, not as GPU load.
- Showing and hiding the URL bar fires `resize`, and every `setSize` reallocates the drawing buffer, causing a hitch. Debounce, or size to `100svh` or `visualViewport`.
- Web Audio needs a user gesture; the spike unlocks it on the first tap. The silent switch mutes Web Audio unless `navigator.audioSession.type = 'playback'` (Safari 17+).
- Safari limits live WebGL contexts per page, so release probe contexts. 2D canvases count toward a per-page canvas memory limit, so shrink or free texture source canvases once uploaded.

**Other**
- Paper stamp updates re-upload the whole canvas. r186 has `Texture.addUpdateRange()` for row ranges, or you can draw each imprint as a small decal mesh on the sheet. Either avoids a multi-MB upload on cheap phones.
- At the default desk framing the paper's text is too small to read on a phone (it is fine on desktop). A reading shot is required. The spike's tap-to-read zoom makes even the low tier's 512 px canvas crisp; see the reading screenshots.
- Portrait phones show about twice as much height as width, so the bottom third of the frame is floor. Plan that area as the game's UI card zone; the spike just darkens it with CSS.
- The 2D fallback works and shares the fonts and interaction, but it is a separate drawing. The real build should drive both renderers from one game state.

## Screenshots

Taken during the spike at 360×800 (3× scale) and 1280×720 (2×), and kept out of the repository:
each tier at 1× and 6× CPU throttling, a landscape shot, the stamped and reading views, the 2D
fallback and the debug overlay. The game's own screenshots are made by the scripts in `dev/`.

## Honest look: does it read as a warm 1857 Delhi desk?

Yes on mood. A brass diya pool of light on a wooden desk at night, a pointed sandstone arch, a crescent moon, and the fort wall and Jama Masjid domes in silhouette against a smoky orange horizon all read as Delhi at night. The paper with English and Hindi lines and the red ASLI and green TOTA seals sell the premise. The warmth is on par with the reference, arguably warmer.

On craft and density it is below the reference, maybe 60–70% of it. The three biggest gaps:

1. **The room is bare.** Large empty plaster walls and an empty floor. The reference's room is full of story props (calendar, poster, tray, tea glass with steam, tins). This scene needs a lived-in munshi's room: a hanging lantern, a shelf of red bahi ledgers, a calligraphy panel or a firman on the wall, a hookah, a pen box, a gaddi and bolster, maybe the munshi's sleeve or hands in frame.
2. **The window lacks Mughal detail and the lower half is a black void.** The arch is a plain pointed ring that reads half-Gothic; a real jharokha has a cusped, multi-foil arch, a jaali screen, brackets and a chhajja. Outside, only the top band (domes, minarets, moon) reads. The near rooftops are flat black slabs with a few lit dots. It needs moonlit rim edges, smoke plumes from the 11 May fires, and a lane or courtyard glow.
3. **Surfaces are primitive and flat.** Plain boxes and lathes with single colours and coarse 64 px textures, so the books look like red plastic blocks. There is no contact darkening where objects meet the desk (except shadows on mid and high), and little secondary motion. The reference has steam, snow and an animated aurora; this has only dust and flicker. Wick smoke, a moth near the lamp and some cloth would help.

## Recommendation for the real build's architecture

Keep Vite, TypeScript and three from npm. The quality and renderer layer and the paper renderer are the two parts that need real engineering; the scene itself is cheap and can grow in props without hurting phones, provided pixels, shadows and MSAA stay under the tier system's control.

Module split:
- **`core/renderer-host.ts`**: owns the `WebGLRenderer` lifecycle. Create and recreate (for MSAA), guarded context-loss and restore, pause on `visibilitychange`, debounced resize sized to `visualViewport`, DPR cap, `compileAsync` during the intro.
- **`core/quality.ts`**: the tier table, cheap-signal detection, the adapter (as in the spike plus a 30 fps cap detector), and the chosen tier saved in `localStorage` so a second visit starts on the right tier. It calls into a `MaterialLibrary` that hands out rich and cheap variants, so props never pick their own material class.
- **`scene/`**: `room.ts`, `desk.ts`, `outside.ts` (sky shader plus one merged, vertex-coloured skyline mesh), `props/*.ts` (lamp, seals, inkpot and so on), `fx/dust.ts` (GPU-animated points) and `camera/shots.ts` (named shots with fit-to-box framing per aspect, tweens, shake, and the reading shot). Each prop is a factory returning `{ object, update(t), applyTier(settings) }`. Static props are merged per material to keep draw calls under about 80, and the shadow map updates only on movement.
- **`paper/`**: a `PaperRenderer` that lays out mixed English and Devanagari text from data (JSON, so copy and localisation live outside the code), measures and wraps per script, waits on a font gate, and draws stamp imprints as decals or with `addUpdateRange`. It renders into a plain canvas, so the 2D fallback and any share card reuse it as is. Fonts are self-hosted and subset.
- **`audio/`**: an `AudioManager` that unlocks on the first gesture, sets `audioSession.type` on iOS, pauses with visibility, holds small SFX (synthesized or one compressed sprite) and a master mute.
- **`game/`**: the state machine and rules, with no rendering. DOM UI cards sit in the portrait bottom zone, and the 3D view and `fallback/2d.ts` both subscribe to the same state.
- **Loading**: render the title and UI first and load the three.js chunk with a dynamic `import()` (about 130–160 KB compressed), so the first paint on a slow 4G phone is not blocked by WebGL.

Before building, run `?debug&bench` on one Mali-G52 or Adreno 610 phone and on the iPhone 14 to replace the estimates above.
