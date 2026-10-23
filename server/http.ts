// Node (req, res) adapter for handleVoice, shared by the Vite dev server and the Vercel function.
import type { IncomingMessage, ServerResponse } from 'node:http'
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'
import { handleVoice, type TtsClient, type VoiceResult } from './voice.js'

/**
 * The server-side ElevenLabs client, or null when no key is configured.
 * The key comes from the server environment (Vercel env or .env.local via Vite's loadEnv) and
 * goes only into this client. It is never logged and never sent to the browser.
 */
export function createTtsClient(apiKey: string | undefined): TtsClient | null {
  if (!apiKey || !apiKey.trim()) return null
  return new ElevenLabsClient({ apiKey: apiKey.trim() })
}

/** Parse a request URL into a query object; repeated keys become arrays (and are refused). */
export function queryFromUrl(url: string | undefined): Record<string, string | string[]> {
  const params = new URL(url ?? '/', 'http://localhost').searchParams
  const query: Record<string, string | string[]> = {}
  for (const key of new Set(params.keys())) {
    const all = params.getAll(key)
    query[key] = all.length === 1 ? all[0]! : all
  }
  return query
}

function send(res: ServerResponse, result: VoiceResult): void {
  res.statusCode = result.status
  for (const [k, v] of Object.entries(result.headers)) res.setHeader(k, v)
  res.end(result.body)
}

export function createVoiceMiddleware(getClient: () => TtsClient | null) {
  return async function voiceMiddleware(req: IncomingMessage, res: ServerResponse): Promise<void> {
    if (req.method !== 'GET') {
      send(res, {
        status: 405,
        headers: { Allow: 'GET', 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
        body: JSON.stringify({ error: 'method_not_allowed' }),
      })
      return
    }
    let result: VoiceResult
    try {
      result = await handleVoice(queryFromUrl(req.url), { client: getClient() })
    } catch {
      result = {
        status: 503,
        headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
        body: JSON.stringify({ error: 'voice_unavailable' }),
      }
    }
    send(res, result)
  }
}
