import { defineConfig, loadEnv } from 'vite'
import { voiceDevServer } from './server/vite-plugin'

export default defineConfig(({ mode }) => {
  // Server-side only: '' loads every variable from .env files for this config, not just VITE_*.
  // The provider keys go to the dev voice endpoint and never into the browser bundle.
  const env = loadEnv(mode, process.cwd(), '')
  return {
    build: { target: 'es2019' },
    plugins: [
      voiceDevServer({
        VOICE_PROVIDER: env.VOICE_PROVIDER,
        FISH_API_KEY: env.FISH_API_KEY,
        ELEVENLABS_API_KEY: env.ELEVENLABS_API_KEY,
      }),
    ],
  }
})
