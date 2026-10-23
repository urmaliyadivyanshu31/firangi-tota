// Vercel Node function: GET /api/voice?era=…&id=…&lang=…&day=…[&voice=…]
// Keys and the provider are set in the Vercel project settings (VOICE_PROVIDER, FISH_API_KEY,
// ELEVENLABS_API_KEY), never in the repo. Relative imports end in `.js` because Vercel runs this
// file as a plain Node ES module.
import { createVoiceMiddleware, voiceBackend } from '../server/http.js'

// One provider attempt may take up to 25 s and is retried once.
export const config = { maxDuration: 60 }

let backend: ReturnType<typeof voiceBackend> | undefined

export default createVoiceMiddleware(() => {
  // Retry when the key was missing, so fixing the env needs no redeploy of this instance.
  if (!backend?.synth) backend = voiceBackend(process.env)
  return backend
})
