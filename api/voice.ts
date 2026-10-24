// Vercel Node function: GET /api/voice?era=…&id=…&lang=…&day=…[&voice=…]&v=…
// Inert unless VOICE_ENABLED=on is set in the Vercel project: until then every request is a 404
// and no provider is ever called. Keys and the provider (VOICE_PROVIDER, FISH_API_KEY,
// ELEVENLABS_API_KEY) live in the Vercel project settings, Production only, never in the repo.
// Relative imports end in `.js` because Vercel runs this file as a plain Node ES module.
import type { IncomingMessage, ServerResponse } from 'node:http'
import { createVoiceMiddleware, sendNotFound, voiceBackend, voiceEnabled } from '../server/http.js'

// One provider attempt of at most 25 s, never retried (server/providers.ts).
export const config = { maxDuration: 30 }

let backend: ReturnType<typeof voiceBackend> | undefined

const middleware = createVoiceMiddleware(() => {
  // Retry when the key was missing, so fixing the env needs no redeploy of this instance.
  if (!backend?.synth) backend = voiceBackend(process.env)
  return backend
})

export default function voice(req: IncomingMessage, res: ServerResponse): Promise<void> | void {
  if (!voiceEnabled(process.env)) return sendNotFound(res)
  return middleware(req, res)
}
