# Firangi Tota

A browser game about moments in Indian history. A message arrives each day. Some are real, and some
are forged by the Firangi Tota, an agent for the British who copies the voice but slips on facts.

Inspired by [Politburo or Parrot](https://github.com/atomiquest/Politburo-or-Parrot) by atomiquest.

## How to play

1. Read the message that arrives.
2. Check it against your case file.
3. Stamp it real or forged.

After each stamp the game shows the source. One wrong stamp ends the chapter. The first version
covers four moments: Delhi 1857, Bhagat Singh 1928 to 1931, Quit India 1942 and August 1947. It is
available in English and Hindi.

## Run it

You need Node 22 or newer.

```
npm install
npm run dev
```

Other commands: `npm run build`, `npm run preview`, `npm test`, `npm run typecheck`,
`npm run check-secrets`.

### Era voices (optional)

The speaker button reads each message aloud in a voice of its era, using ElevenLabs. The game works
without it; the button just shows an error.

1. Run `npx -y @elevenlabs/cli@latest onboard init` in this folder. It signs you in and stores a key
   in `.env.local`. To do it by hand, copy `.env.example` to `.env.local` and put your key after
   `ELEVENLABS_API_KEY=`.
2. Run `npm run dev`. The dev server serves `/api/voice` and reads the key on the server side only.

Never commit a key. Git ignores `.env.local`, only variables starting with `VITE_` ever reach the
browser, and `npm run check-secrets` (also run in CI) fails if a key shows up in a tracked file. In
production the key is set as `ELEVENLABS_API_KEY` in the Vercel project settings. Voice Library
voices need a paid ElevenLabs plan to work through the API.

## Licence

- Code: MIT, see [LICENSE](LICENSE).
- Game text: CC BY 4.0, excluding quoted third-party material, which stays with its owners.
- Third-party assets (fonts, sounds, images) keep their own licences. See [CREDITS.md](CREDITS.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Writers should also read [docs/content-style.md](docs/content-style.md).
