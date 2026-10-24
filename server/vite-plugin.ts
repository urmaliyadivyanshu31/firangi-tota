// Mounts GET /api/voice on the Vite dev and preview servers, so read-aloud works locally.
// vite.config.ts hands in the server-side settings from loadEnv (it reads .env.local). Only the
// provider client sees a key; Vite exposes nothing but VITE_* variables to the browser.
// It also serves the share links (/s/<code>) and their cards (/api/og) the way Vercel does. Those
// load on the first such request, so the font shaper and the renderer never slow the server's start.
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Connect, Plugin } from 'vite'
import { createVoiceMiddleware, voiceBackend, type VoiceEnv } from './http.js'

type Handler = (req: IncomingMessage, res: ServerResponse) => void | Promise<void>
let shareRoutes: Promise<{ share: Handler; og: Handler }> | undefined

function loadShareRoutes() {
  shareRoutes ??= Promise.all([import('./share-http.js'), import('./og/render.js')]).then(([http, render]) => ({
    share: http.createShareMiddleware({ allowLocal: true }),
    og: http.createOgMiddleware(render.renderCard),
  }))
  return shareRoutes
}

// mounted without a path prefix, so req.url keeps the full path, as on Vercel
const routes: Connect.NextHandleFunction = (req, res, next) => {
  const path = (req.url ?? '').split('?')[0] ?? ''
  const which = path.startsWith('/s/') ? 'share' : path === '/api/og' ? 'og' : null
  if (!which) return next()
  loadShareRoutes().then((r) => r[which](req, res)).catch((err: unknown) => {
    console.warn('[share] dev route failed', err)
    res.statusCode = 503
    res.end()
  })
}

export function voiceDevServer(env: VoiceEnv): Plugin {
  let backend: ReturnType<typeof voiceBackend> | undefined
  const middleware = createVoiceMiddleware(() => (backend ??= voiceBackend(env)))
  return {
    name: 'firangi-voice-api',
    configureServer(server) {
      server.middlewares.use('/api/voice', (req, res) => void middleware(req, res))
      server.middlewares.use(routes)
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/voice', (req, res) => void middleware(req, res))
      server.middlewares.use(routes)
    },
  }
}
