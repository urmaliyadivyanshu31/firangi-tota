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

The speaker button reads each message aloud in a voice of its era. The default provider is Fish
Audio (model `s2.1-pro-free`); ElevenLabs also works. The game works without either; the button
just shows an error.

1. Copy `.env.example` to `.env.local` and put your Fish Audio key after `FISH_API_KEY=`
   (keys: https://fish.audio/app/api-keys). For ElevenLabs instead, set
   `VOICE_PROVIDER=elevenlabs` and run `npx -y @elevenlabs/cli@latest onboard init`, which stores a
   key for you.
2. Run `npm run dev`. The dev server serves `/api/voice` and reads keys on the server side only.

Never commit a key. Git ignores `.env.local`, only variables starting with `VITE_` ever reach the
browser, and `npm run check-secrets` (also run in CI) fails if a key shows up in a tracked file. In
production, set `VOICE_PROVIDER` and the provider's key in the Vercel project settings.

## Licence

- Code: MIT, see [LICENSE](LICENSE).
- Game text: CC BY 4.0, excluding quoted third-party material, which stays with its owners.
- Third-party assets (fonts, sounds, images) keep their own licences. See [CREDITS.md](CREDITS.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Writers should also read [docs/content-style.md](docs/content-style.md).
