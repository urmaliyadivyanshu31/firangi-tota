# Firangi Tota · फ़िरंगी तोता

A browser game about moments in Indian history. You sit at a desk in 1857 Delhi, 1929 Lahore, 1942
Bombay or 1947 Delhi, and a message arrives each day. Some are real, and some are forged by the
Firangi Tota, an agent for the British who copies the voice but slips on facts. In English and Hindi.

Inspired by [Politburo or Parrot](https://github.com/atomiquest/Politburo-or-Parrot) by atomiquest.

## How to play

The game opens on one page: the title paper over the room of the chapter you pick. Choose one of the
four chapters, choose how long you want to hold out (Easy 7 days, Medium 10, Hard 14), and Begin.
Two cards land on the desk first: who you are, and who the Tota is.

1. Each day opens with its date, then the message comes in on a paper on your desk, in a 3D room of
   its era (a flat 2D desk on devices without WebGL).
2. Check it against the case file and the rulebook. On Easy (and the first days of Medium) pencil
   marks show what is worth checking.
3. Stamp it ASLI (real) or TOTA (forged) before the agarbatti burns out. Keyboard: `←` or `1` for
   ASLI, `→` or `2` for TOTA.
4. The paper turns over: the verdict, the slip or the reason it is genuine, and the source.
   Real letters, telegrams and broadcasts are marked 📜 Real document.
5. After a right stamp, once the verdict has been read, the paper is tossed into the basket by the
   desk and the next day begins by itself. A tap, `Space` or `Enter` sends it at once; opening the
   source holds it.

One wrong stamp, or letting the agarbatti burn out, ends the chapter. Every fact in the game has a
source you can open from the paper.

The 🔈 speaker (top right, and in the top bar during a day) turns the game's sound on and off, next
to the हिंदी / English switch. The 🎙 microphone button (Listen) on a day reads the message aloud; it is
there only in builds with read-aloud (see below).

After the first visit the game also plays offline: it installs as an app, and the shell, the 3D
rooms and the core fonts are kept on the device. The rooms' recorded sound, the other fonts and the
intro portraits are kept the first time they are used. Read-aloud always needs the network.

## Run it

You need Node 22 or newer.

```
npm install
npm run dev
```

Other commands: `npm run build`, `npm run preview`, `npm test`, `npm run typecheck`, `npm run e2e`
(after a build), `npm run budget` (after a build), `npm run check-secrets`.

### Read-aloud voice (optional)

The 🎙 button reads each message aloud in one storyteller voice, the Dastango, in every era. It is
off unless the build turns it on, and it needs a provider key on the server. The default provider is
Fish Audio (model `s2.1-pro-free`); ElevenLabs also works. The game plays the same without it.

1. Copy `.env.example` to `.env.local`.
2. Set `VITE_VOICE=on`, which builds the 🎙 button into the game.
3. Put your Fish Audio key after `FISH_API_KEY=` (keys: https://fish.audio/app/api-keys). For
   ElevenLabs instead, set `VOICE_PROVIDER=elevenlabs` and `ELEVENLABS_API_KEY`.
4. Run `npm run dev`. The dev server serves `/api/voice` and reads the key on the server side only.

Never commit a key. Git ignores `.env.local`, only variables starting with `VITE_` ever reach the
browser, and `npm run check-secrets` (also run in CI) fails if a key shows up in a tracked file.

## Deploying

The site is a static Vite build on Vercel, plus a function, `api/voice.ts`, for read-aloud, and two
for share links (`api/s.ts` and `api/og.ts`, see below).
`vercel.json` runs the function in Mumbai (`bom1`) and sends the security headers (a
Content-Security-Policy that allows only the site itself, `nosniff`, no framing, a strict referrer
policy and a Permissions-Policy that turns off the microphone, camera and the like).

Read-aloud is off by default: the function answers 404 to everything until `VOICE_ENABLED=on` is
set. To turn it on:

1. In the Vercel project's environment variables, for the **Production** environment only (never
   Preview or Development, so a pull-request preview can never spend on the key):
   - `VITE_VOICE=on` (build time: shows the 🎙 button),
   - `VOICE_ENABLED=on` (run time: switches the function on),
   - `FISH_API_KEY` (or `VOICE_PROVIDER=elevenlabs` and `ELEVENLABS_API_KEY`).
2. Add a Vercel Firewall rate-limit rule for the path `/api/voice`, for example 20 requests per
   minute per IP, answering 429 above that.
3. Set a spending cap (or a hard credit limit) in the voice provider's dashboard, so a flood of
   requests can never cost more than you chose.

Every clip has one canonical URL and is cached by the CDN for a year, so each line is generated
once. Requests spelled any other way get a short-lived redirect to that URL instead of a new clip,
and a failed or timed-out provider call is never retried.

### Share links

When a chapter (or the daily puzzle) ends, Share opens a post card: the post the player is about to
send, in the language on screen, and WhatsApp, X, copy link and the phone's own share menu. The post
carries a link like `https://firangitota.com/s/1857-e7s-en`, whose code holds only the chapter's year,
the mode, the days, the outcome and the language.

Two more functions serve those links, both in `bom1`, both without keys:

- `api/s.ts` (`vercel.json` rewrites `/s/<code>` to it) answers a tiny page with Open Graph and
  Twitter `summary_large_image` tags, then sends people on to the game with the friend's chapter and
  mode picked (`/share-go.js`, a script link-preview crawlers do not run).
- `api/og.ts` draws the preview card, a 1200×630 JPEG: one period paper per chapter with the year and
  place, the outcome and the days, the era's own ending stamp and the title lettering. Only words from
  the code's enums and the game's own content are drawn, as glyph outlines shaped by HarfBuzz, so the
  Hindi is right. Each card has one canonical URL, versioned by a hash of its drawing and cached for a
  year; any other spelling gets a redirect.

`npm run dev` and `npm run preview` serve both. `node dev/shoot-share-cards.mjs` fetches every card
the way a crawler does and saves it under `docs/screens/og/`.

## Licence

- Code: MIT, see [LICENSE](LICENSE).
- Game text: CC BY 4.0, excluding quoted third-party material, which stays with its owners.
- Third-party assets (fonts, sounds) keep their own licences. See [CREDITS.md](CREDITS.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Writers should also read [docs/content-style.md](docs/content-style.md).
