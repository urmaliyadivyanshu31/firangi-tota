import { defineConfig, loadEnv } from 'vite'
import { voiceDevServer } from './server/vite-plugin'

export default defineConfig(({ mode }) => {
  // Server-side only: '' loads every variable from .env files for this config, not just VITE_*.
  // The ElevenLabs key goes to the dev voice endpoint and never into the browser bundle.
  const env = loadEnv(mode, process.cwd(), '')
  return {
    build: { target: 'es2019' },
    plugins: [voiceDevServer(env.ELEVENLABS_API_KEY)],
  }
})
