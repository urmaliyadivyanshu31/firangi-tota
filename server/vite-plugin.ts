// Mounts GET /api/voice on the Vite dev and preview servers, so read-aloud works locally.
// vite.config.ts hands in the server-side settings from loadEnv (it reads .env.local). Only the
// provider client sees a key; Vite exposes nothing but VITE_* variables to the browser.
// It also serves the share links (/s/<code>) and their cards (/og/<code>.<rev>.jpg and /api/og)
// the way Vercel does: the preview server sends the cards the build wrote to dist/og, the dev server
// draws each on request. Those load on the first such request, so the font shaper and the renderer
// never slow the server's start.
import type { IncomingMessage, ServerResponse } from 'node:http'
import { resolve } from 'node:path'
import type { Connect, Plugin } from 'vite'
import { createVoiceMiddleware, voiceBackend, type VoiceEnv } from './http.js'

type Handler = (req: IncomingMessage, res: ServerResponse) => void | Promise<void>
let shareModules: Promise<[typeof import('./share-http.js'), typeof import('./og/render.js')]> | undefined

/** Mounted without a path prefix, so req.url keeps the full path, as on Vercel. */
function shareRoutes(cardDir?: string): Connect.NextHandleFunction {
  let handlers: Promise<{ share: Handler; og: Handler }> | undefined
  return (req, res, next) => {
    const path = (req.url ?? '').split('?')[0] ?? ''
    const which = path.startsWith('/s/') ? 'share' : path === '/api/og' || path.startsWith('/og/') ? 'og' : null
    if (!which) return next()
    shareModules ??= Promise.all([import('./share-http.js'), import('./og/render.js')])
    handlers ??= shareModules.then(([http, render]) => ({
      share: http.createShareMiddleware({ allowLocal: true }),
      og: http.createOgMiddleware(render.renderCard, { cardDir }),
    }))
    handlers.then((h) => h[which](req, res)).catch((err: unknown) => {
      console.warn('[share] dev route failed', err)
      res.statusCode = 503
      res.end()
    })
  }
}

export function voiceDevServer(env: VoiceEnv): Plugin {
  let backend: ReturnType<typeof voiceBackend> | undefined
  const middleware = createVoiceMiddleware(() => (backend ??= voiceBackend(env)))
  return {
    name: 'firangi-voice-api',
    configureServer(server) {
      server.middlewares.use('/api/voice', (req, res) => void middleware(req, res))
      server.middlewares.use(shareRoutes())
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/voice', (req, res) => void middleware(req, res))
      // dist/og, where scripts/og-cards.mjs writes the cards (CARD_DIR in server/share.ts)
      server.middlewares.use(shareRoutes(resolve(server.config.root, server.config.build.outDir, 'og')))
    },
  }
}
