// Mounts GET /api/voice on the Vite dev and preview servers, so read-aloud works locally.
// vite.config.ts hands in the server-side settings from loadEnv (it reads .env.local). Only the
// provider client sees a key; Vite exposes nothing but VITE_* variables to the browser.
import type { Plugin } from 'vite'
import { createVoiceMiddleware, voiceBackend, type VoiceEnv } from './http.js'

export function voiceDevServer(env: VoiceEnv): Plugin {
  let backend: ReturnType<typeof voiceBackend> | undefined
  const middleware = createVoiceMiddleware(() => (backend ??= voiceBackend(env)))
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
