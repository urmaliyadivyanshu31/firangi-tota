// Node (req, res) adapter for handleVoice, shared by the Vite dev server and the Vercel function.
import type { IncomingMessage, ServerResponse } from 'node:http'
import { elevenLabsSynth, fishSynth, type Synth } from './providers.js'
import { handleVoice, type VoiceResult } from './voice.js'
import { parseProvider, type ProviderId } from './voices.js'

/** Server-side settings. Keys come from the server environment only and go only into the provider call. */
export interface VoiceEnv {
  VOICE_PROVIDER?: string
  FISH_API_KEY?: string
  ELEVENLABS_API_KEY?: string
}

const clean = (k: string | undefined) => (k && k.trim() ? k.trim() : null)

/** The active provider and its synthesizer (null when that provider's key is missing). */
export function voiceBackend(env: VoiceEnv): { provider: ProviderId; synth: Synth | null } {
  const provider = parseProvider(env.VOICE_PROVIDER)
  const key = clean(provider === 'fish' ? env.FISH_API_KEY : env.ELEVENLABS_API_KEY)
  if (!key) return { provider, synth: null }
  return { provider, synth: provider === 'fish' ? fishSynth(key) : elevenLabsSynth(key) }
}

/** True only when the server deliberately turns read-aloud on with VOICE_ENABLED=on. */
export function voiceEnabled(env: { VOICE_ENABLED?: string }): boolean {
  return (env.VOICE_ENABLED ?? '').trim().toLowerCase() === 'on'
}

/**
 * The query string exactly as the client sent it, without the `?`: the CDN caches by the raw URL,
 * so handleVoice compares this byte for byte with the canonical query. A fragment never reaches
 * a server, but one is dropped here all the same.
 */
export function rawQueryOf(url: string | undefined): string {
  const u = url ?? ''
  const q = u.indexOf('?')
  if (q < 0) return ''
  const rest = u.slice(q + 1)
  const hash = rest.indexOf('#')
  return hash < 0 ? rest : rest.slice(0, hash)
}

function send(res: ServerResponse, result: VoiceResult): void {
  res.statusCode = result.status
  for (const [k, v] of Object.entries(result.headers)) res.setHeader(k, v)
  res.end(result.body)
}

const JSON_HEADERS = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }

/** 404 for a function that is switched off: it must look like nothing is there. */
export function sendNotFound(res: ServerResponse): void {
  send(res, { status: 404, headers: JSON_HEADERS, body: JSON.stringify({ error: 'not_found' }) })
}

export function createVoiceMiddleware(getBackend: () => { provider: ProviderId; synth: Synth | null }) {
  return async function voiceMiddleware(req: IncomingMessage, res: ServerResponse): Promise<void> {
    if (req.method !== 'GET') {
      send(res, { status: 405, headers: { Allow: 'GET', ...JSON_HEADERS }, body: JSON.stringify({ error: 'method_not_allowed' }) })
      return
    }
    let result: VoiceResult
    try {
      result = await handleVoice(rawQueryOf(req.url), getBackend())
    } catch {
      result = { status: 503, headers: JSON_HEADERS, body: JSON.stringify({ error: 'voice_unavailable' }) }
    }
    send(res, result)
  }
}
