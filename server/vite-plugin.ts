// Mounts GET /api/voice on the Vite dev and preview servers, so read-aloud works locally.
// The key is handed in by vite.config.ts from loadEnv (it reads .env.local). Only the server-side
// ElevenLabs client sees it; Vite exposes nothing but VITE_* variables to the browser.
import type { Plugin } from 'vite'
import { createTtsClient, createVoiceMiddleware } from './http.js'
import type { TtsClient } from './voice.js'

export function voiceDevServer(apiKey: string | undefined): Plugin {
  let client: TtsClient | null | undefined
  const middleware = createVoiceMiddleware(() => {
    if (client === undefined) client = createTtsClient(apiKey)
    return client
  })
  return {
    name: 'firangi-voice-api',
    configureServer(server) {
      server.middlewares.use('/api/voice', (req, res) => void middleware(req, res))
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/voice', (req, res) => void middleware(req, res))
    },
  }
}
