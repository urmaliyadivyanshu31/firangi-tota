import { defineConfig, loadEnv } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
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
      // Offline after the first visit: the service worker precaches the app shell, every JS chunk
      // (the lazy stage and era desks included), the fonts, the audio and the icons. Read-aloud
      // (/api/voice) is never precached or cached: it is neither in the precache list nor routed.
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'inline',
        manifest: {
          name: 'Firangi Tota',
          short_name: 'Firangi Tota',
          description: 'Spot the forged messages at four desks of the Indian freedom struggle',
          lang: 'en',
          dir: 'ltr',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          // the 1857 palette: the court-red accent; the background is the dark room the game opens in
          theme_color: '#7c211b',
          background_color: '#1d130b',
          icons: [
            { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
          // the Hindi name, for browsers that read manifest translations
          ...({ translations: { hi: { name: 'फ़िरंगी तोता', short_name: 'फ़िरंगी तोता', description: 'आज़ादी की लड़ाई की चार मेज़ों पर जाली संदेश पकड़िए' } } } as object),
        },
        workbox: {
          // everything in dist/ (the public fonts, audio and icons included), once each
          globPatterns: ['**/*.{html,js,css,woff2,m4a,wav,png,svg,webmanifest}'],
          // the audio and the 3D stage chunk are well under this; it only guards against a surprise
          maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
          cleanupOutdatedCaches: true,
          // a new version takes over at once (autoUpdate), the first visit included
          clientsClaim: true,
          skipWaiting: true,
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api\//],
          runtimeCaching: [],
        },
      }),
    ],
  }
})
