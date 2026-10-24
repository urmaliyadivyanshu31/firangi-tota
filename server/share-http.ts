// Node (req, res) adapters for the share page and the card image, shared by the Vite dev and
// preview servers and the Vercel functions (api/s.ts, api/og.ts).
import { readFile } from 'node:fs/promises'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { join } from 'node:path'
import { codeFromPath } from '../src/game/share-code.js'
import { rawQueryOf } from './http.js'
import { CARD_FILE_CACHE, CARD_FILE_RE, handleCardFile, handleOgImage, handleSharePage, IMAGE_TYPE, originFor, type Render, type ShareHttpResult } from './share.js'

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

/**
 * The card file a request names: the path's /og/<name> (the dev and preview servers, and Vercel
 * when it hands the function the original URL), else the `file` query the vercel.json rewrite adds.
 * Null for a plain /api/og?c=…&v=… request; '' for a name that cannot be one.
 */
export function cardFileOf(url: string | undefined): string | null {
  const u = url ?? ''
  const path = u.split(/[?#]/)[0] ?? ''
  if (path.startsWith('/og/')) return /^\/og\/([^/]+)$/.exec(path)?.[1] ?? ''
  const all = new URLSearchParams(rawQueryOf(u)).getAll('file')
  return all.length === 0 ? null : all.length === 1 ? all[0]! : ''
}

/** A card file the build wrote, or null. `name` has passed CARD_FILE_RE, so it stays in `dir`. */
async function storedCard(dir: string, name: string): Promise<Uint8Array | null> {
  try {
    return new Uint8Array(await readFile(join(dir, name)))
  } catch {
    return null
  }
}

/**
 * GET /api/og?c=…&v=… and GET /og/<name> that no file answered, drawn by `render`
 * (server/og/render.ts; tests pass a stub). `cardDir` is the build's dist/og, for `vite preview`:
 * a file found there is sent with the headers vercel.json gives it, the way the CDN serves it.
 */
export function createOgMiddleware(render: Render, opts: { cardDir?: string } = {}) {
  return async function ogMiddleware(req: IncomingMessage, res: ServerResponse): Promise<void> {
    if (!isRead(req)) return methodNotAllowed(res)
    const file = cardFileOf(req.url)
    if (file === null) return send(res, await handleOgImage(rawQueryOf(req.url), render))
    const stored = opts.cardDir && CARD_FILE_RE.test(file) ? await storedCard(opts.cardDir, file) : null
    if (stored) {
      return send(res, {
        status: 200,
        headers: { 'Content-Type': IMAGE_TYPE, 'Cache-Control': CARD_FILE_CACHE, 'Content-Length': String(stored.byteLength), 'X-Content-Type-Options': 'nosniff' },
        body: stored,
      })
    }
    send(res, await handleCardFile(file, render))
  }
}
