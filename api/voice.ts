// Vercel Node function: GET /api/voice?era=…&id=…&lang=…&day=…
// The key is set in the Vercel project settings (ELEVENLABS_API_KEY), never in the repo.
// Relative imports end in `.js` because Vercel runs this file as a plain Node ES module.
import { createTtsClient, createVoiceMiddleware } from '../server/http.js'
import type { TtsClient } from '../server/voice.js'

// One ElevenLabs attempt may take up to 25 s and is retried once.
export const config = { maxDuration: 60 }

let client: TtsClient | null = null

export default createVoiceMiddleware(() => (client ??= createTtsClient(process.env.ELEVENLABS_API_KEY)))
