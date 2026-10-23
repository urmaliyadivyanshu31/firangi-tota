// Node (req, res) adapter for handleVoice, shared by the Vite dev server and the Vercel function.
import type { IncomingMessage, ServerResponse } from 'node:http'
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'
import { elevenLabsSynth, fishSynth, type Synth, type TtsClient } from './providers.js'
import { handleVoice, type VoiceResult } from './voice.js'
import { parseProvider, type ProviderId } from './voices.js'

/** Server-side settings. Keys come from the server environment only and go only into the client. */
export interface VoiceEnv {
  VOICE_PROVIDER?: string
  FISH_API_KEY?: string
  ELEVENLABS_API_KEY?: string
}

const clean = (k: string | undefined) => (k && k.trim() ? k.trim() : null)

/** The ElevenLabs client, or null when no key is configured. */
export function createTtsClient(apiKey: string | undefined): TtsClient | null {
  const key = clean(apiKey)
  return key ? new ElevenLabsClient({ apiKey: key }) : null
}

/** The active provider and its synthesizer (null when that provider's key is missing). */
export function voiceBackend(env: VoiceEnv): { provider: ProviderId; synth: Synth | null } {
  const provider = parseProvider(env.VOICE_PROVIDER)
  if (provider === 'fish') {
    const key = clean(env.FISH_API_KEY)
    return { provider, synth: key ? fishSynth(key) : null }
  }
  const client = createTtsClient(env.ELEVENLABS_API_KEY)
  return { provider, synth: client ? elevenLabsSynth(client) : null }
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

export function createVoiceMiddleware(getBackend: () => { provider: ProviderId; synth: Synth | null }) {
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
      result = await handleVoice(queryFromUrl(req.url), getBackend())
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
