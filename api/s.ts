// Vercel Node function behind /s/<code> (vercel.json rewrites it here): the share link's page,
// with the Open Graph and Twitter card tags crawlers read, then on to the game (server/share.ts).
// Relative imports end in `.js` because Vercel runs this file as a plain Node ES module.
import type { IncomingMessage, ServerResponse } from 'node:http'
import { createShareMiddleware } from '../server/share-http.js'

const middleware = createShareMiddleware({ allowLocal: false })

export default function sharePage(req: IncomingMessage, res: ServerResponse): void {
  middleware(req, res)
}
