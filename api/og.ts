// Vercel Node function: GET /api/og?c=<code>&v=<rev>, a share link's preview card (1200 x 630 JPEG),
// drawn on request. Share pages name the card the build drew instead (/og/<code>.<rev>.jpg, a static
// file); vercel.json sends only a missing one here. Only the canonical query or file name is answered
// with an image, cached for a year; anything else is a 302 (server/share.ts). It needs no keys and
// calls nothing outside this function.
// Relative imports end in `.js` because Vercel runs this file as a plain Node ES module.
import type { IncomingMessage, ServerResponse } from 'node:http'
import { renderCard } from '../server/og/render.js'
import { createOgMiddleware } from '../server/share-http.js'

const middleware = createOgMiddleware(renderCard)

export default function og(req: IncomingMessage, res: ServerResponse): Promise<void> {
  return middleware(req, res)
}
