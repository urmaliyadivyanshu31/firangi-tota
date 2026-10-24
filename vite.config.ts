import { createHash } from 'node:crypto'
import { readdirSync, readFileSync } from 'node:fs'
import { defineConfig, loadEnv } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { voiceDevServer } from './server/vite-plugin'

/**
 * The security headers vercel.json sends on every response (the CSP included). `vite preview`
 * sends the same ones, so the end-to-end tests play the built game under the production policy.
 */
function securityHeaders(): Record<string, string> {
  const config = JSON.parse(readFileSync(new URL('./vercel.json', import.meta.url), 'utf8')) as {
    headers: { source: string; headers: { key: string; value: string }[] }[]
  }
  const all = config.headers.find((h) => h.source === '/(.*)')?.headers ?? []
  return Object.fromEntries(all.map((h) => [h.key, h.value]))
}

/** A hash of every recording in public/audio: the audio URLs carry it, so a changed file is fetched fresh. */
function audioRevision(): string {
  const dir = new URL('./public/audio/', import.meta.url)
  const h = createHash('sha256')
  for (const f of readdirSync(dir).sort()) h.update(f).update(readFileSync(new URL(f, dir)))
  return h.digest('hex').slice(0, 10)
}

/** The fonts the first screen needs (index.html preloads them), precached for offline play. */
const CORE_FONTS = ['mukta-400-latin.woff2', 'old-standard-tt-400-latin.woff2', 'tiro-devanagari-hindi-400-devanagari.woff2']

export default defineConfig(({ mode }) => {
  // Server-side only: '' loads every variable from .env files for this config, not just VITE_*.
  // The provider keys go to the dev voice endpoint and never into the browser bundle.
  const env = loadEnv(mode, process.cwd(), '')
  return {
    build: { target: 'es2019' },
    define: { 'import.meta.env.AUDIO_REV': JSON.stringify(audioRevision()) },
    preview: { headers: securityHeaders() },
    plugins: [
      voiceDevServer({
        VOICE_PROVIDER: env.VOICE_PROVIDER,
        FISH_API_KEY: env.FISH_API_KEY,
        ELEVENLABS_API_KEY: env.ELEVENLABS_API_KEY,
      }),
      // Offline after the first visit (Ruling R34). The service worker precaches only the app shell
      // (the HTML, every JS chunk, the lazy stage and era desks included, the CSS, the manifest),
      // the core fonts (the UI's Latin 400 and the papers' default faces, the ones index.html
      // preloads) and the small icons. Recorded audio, rarer font weights and scripts, the intro
      // portraits and the large install icons are cached on first use instead. Read-aloud (/api/voice) is never
      // cached: it is in no precache list and its route is network-only.
      VitePWA({
        registerType: 'autoUpdate',
        // a registerSW.js file, not an inline script, so the Content-Security-Policy needs no
        // 'unsafe-inline' for scripts (vercel.json)
        injectRegister: 'script',
        // the 512 px install icons are fetched by the browser when it installs, online
        includeManifestIcons: false,
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
          globPatterns: [
            '**/*.{html,js,css,webmanifest}',
            ...CORE_FONTS.map((f) => `fonts/${f}`),
            'icons/favicon.svg',
            'icons/apple-touch-icon.png',
            'icons/icon-192.png',
          ],
          // the share cards (dist/og, about 40 MB) are for link-preview crawlers, never the game
          globIgnores: ['og/**'],
          // the 3D stage chunk is well under this; it only guards against a surprise
          maximumFileSizeToCacheInBytes: 1024 * 1024,
          cleanupOutdatedCaches: true,
          // a new version takes over at once (autoUpdate), the first visit included
          clientsClaim: true,
          skipWaiting: true,
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api\//, /^\/og\//],
          runtimeCaching: [
            // read-aloud: always the network, never a cache
            { urlPattern: ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith('/api/'), handler: 'NetworkOnly' },
            // These are static files: a cached copy answers whatever the server's Vary header says
            // (src/offline.ts re-fetches files a CSS font request asked for, with other headers).
            // Their names carry no hash, so they are stale-while-revalidate: the cached copy plays at
            // once (and offline), and a replaced file reaches returning players on their next visit.
            // The recorded room beds and the typewriter, on first use (after the first tap)
            {
              urlPattern: ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith('/audio/'),
              handler: 'StaleWhileRevalidate',
              options: { cacheName: 'ft-audio', matchOptions: { ignoreVary: true }, expiration: { maxEntries: 32 }, cacheableResponse: { statuses: [200] } },
            },
            // the other font files in /fonts/ (Devanagari UI, bolder weights, typewriter), on first use
            {
              urlPattern: ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith('/fonts/') && url.pathname.endsWith('.woff2'),
              handler: 'StaleWhileRevalidate',
              options: { cacheName: 'ft-fonts', matchOptions: { ignoreVary: true }, expiration: { maxEntries: 32 }, cacheableResponse: { statuses: [200] } },
            },
            // the install icons, the share image and the intro portraits (public/art/, two per
            // chapter, fetched when Begin is pressed)
            {
              urlPattern: ({ url, sameOrigin }) => sameOrigin && (url.pathname.startsWith('/icons/') || url.pathname.startsWith('/art/') || url.pathname === '/og.jpg'),
              handler: 'StaleWhileRevalidate',
              options: { cacheName: 'ft-images', matchOptions: { ignoreVary: true }, expiration: { maxEntries: 32 }, cacheableResponse: { statuses: [200] } },
            },
            // hashed font files from the build (the pencil hand): a new version is a new name, so
            // the cached copy never needs checking
            {
              urlPattern: ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith('/assets/') && url.pathname.endsWith('.woff2'),
              handler: 'CacheFirst',
              options: { cacheName: 'ft-assets', matchOptions: { ignoreVary: true }, expiration: { maxEntries: 8 }, cacheableResponse: { statuses: [200] } },
            },
          ],
        },
      }),
    ],
  }
})
