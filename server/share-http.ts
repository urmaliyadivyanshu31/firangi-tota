// Node (req, res) adapters for the share page and the card image, shared by the Vite dev and
// preview servers and the Vercel functions (api/s.ts, api/og.ts).
import type { IncomingMessage, ServerResponse } from 'node:http'
import { codeFromPath } from '../src/game/share-code.js'
import { rawQueryOf } from './http.js'
import { handleOgImage, handleSharePage, originFor, type Render, type ShareHttpResult } from './share.js'

function send(res: ServerResponse, result: ShareHttpResult): void {
  res.statusCode = result.status
  for (const [k, v] of Object.entries(result.headers)) res.setHeader(k, v)
  res.end(result.body)
}

function methodNotAllowed(res: ServerResponse): void {
  send(res, { status: 405, headers: { Allow: 'GET, HEAD', 'Cache-Control': 'no-store' }, body: '' })
}

const isRead = (req: IncomingMessage) => req.method === 'GET' || req.method === 'HEAD'

/**
 * The code a share-page request asks for: the path's /s/<code> (the dev server, and Vercel when it
 * hands the function the original URL), else the `code` query the vercel.json rewrite adds.
 */
export function shareCodeOf(url: string | undefined): string | null {
  const u = url ?? ''
  const path = u.split(/[?#]/)[0] ?? ''
  const fromPath = codeFromPath(path)
  if (fromPath !== null) return fromPath
  const q = new URLSearchParams(rawQueryOf(u))
  const all = q.getAll('code')
  return all.length === 1 ? all[0]! : null
}

/**
 * GET /s/<code>. Absolute URLs use the Host header only (never X-Forwarded-Host, which a client
 * could set and the CDN does not key on), checked against our own hosts; local hosts only count
 * off Vercel, so a cached page can never point a crawler at localhost.
 */
export function createShareMiddleware(opts: { allowLocal: boolean }) {
  return function shareMiddleware(req: IncomingMessage, res: ServerResponse): void {
    if (!isRead(req)) return methodNotAllowed(res)
    send(res, handleSharePage(shareCodeOf(req.url), originFor(req.headers.host, opts.allowLocal)))
  }
}

/** GET /api/og?c=…&v=…, drawn by `render` (server/og/render.ts; tests pass a stub). */
export function createOgMiddleware(render: Render) {
  return async function ogMiddleware(req: IncomingMessage, res: ServerResponse): Promise<void> {
    if (!isRead(req)) return methodNotAllowed(res)
    send(res, await handleOgImage(rawQueryOf(req.url), render))
  }
}
