// Text-to-speech providers behind one small interface. Server only.
// Fish Audio is the default (model s2.1-pro-free, $0); ElevenLabs stays for later. Both are plain
// `fetch` calls, so the voice function has no runtime dependency beyond Node itself.
// Neither ever logs a key, a request body or an upstream error body.
//
// One attempt per request, never a retry: a timed-out or dropped request may still have generated
// (and billed) the audio upstream, so trying again could pay twice for one clip. A failure answers
// 503 and the player can tap again.
import type { Lang } from '../src/content/types.js'
import type { ElevenVoice, FishVoice } from '../src/content/voices.js'
import { FISH_MODEL, FISH_MP3_BITRATE, MODEL_ID, OUTPUT_FORMAT } from './voices.js'

const MAX_AUDIO_BYTES = 5 * 1024 * 1024
export const UPSTREAM_TIMEOUT_MS = 25_000
export const FISH_TTS_URL = 'https://api.fish.audio/v1/tts'
export const ELEVENLABS_TTS_URL = 'https://api.elevenlabs.io/v1/text-to-speech'

export type Synth =
  | { provider: 'fish'; synthesize(voice: FishVoice, text: string, lang: Lang): Promise<Uint8Array> }
  | { provider: 'elevenlabs'; synthesize(voice: ElevenVoice, text: string, lang: Lang): Promise<Uint8Array> }

/** The slice of `fetch` the providers use, so tests can pass a mock. */
export type FetchLike = (url: string, init: { method: string; headers: Record<string, string>; body: string; signal?: AbortSignal }) => Promise<{
  ok: boolean
  status: number
  body: ReadableStream<Uint8Array> | null
}>

const defaultFetch = (): FetchLike => fetch as unknown as FetchLike

/** An upstream failure. Carries only the HTTP status, never the body. */
export class UpstreamError extends Error {
  constructor(readonly statusCode?: number) {
    super(`upstream failed${statusCode ? ` (${statusCode})` : ''}`)
  }
}

export async function readAll(stream: ReadableStream<Uint8Array>): Promise<Uint8Array> {
  const reader = stream.getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.byteLength
    if (total > MAX_AUDIO_BYTES) {
      void reader.cancel()
      throw new UpstreamError()
    }
    chunks.push(value)
  }
  const out = new Uint8Array(total)
  let at = 0
  for (const c of chunks) {
    out.set(c, at)
    at += c.byteLength
  }
  return out
}

/** One POST, one answer: no retry (see the top of the file). */
async function postOnce(fetchImpl: FetchLike, url: string, headers: Record<string, string>, body: unknown): Promise<Uint8Array> {
  let res: Awaited<ReturnType<FetchLike>>
  try {
    res = await fetchImpl(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    })
  } catch {
    throw new UpstreamError() // a timeout or a network error; the cause may carry the URL or headers
  }
  if (!res.ok || !res.body) {
    void res.body?.cancel()
    throw new UpstreamError(res.status)
  }
  return readAll(res.body)
}

// ------------------------------------------------------------------ ElevenLabs

/** The JSON body for POST /v1/text-to-speech/{voice_id} (snake_case, as the REST API takes it). */
export function elevenLabsRequestBody(voice: ElevenVoice, text: string, lang: Lang): Record<string, unknown> {
  const fx = voice.effects
  return {
    text,
    model_id: MODEL_ID,
    language_code: lang,
    apply_text_normalization: 'on',
    voice_settings: { stability: voice.settings.stability, similarity_boost: voice.settings.similarityBoost },
    ...(fx
      ? {
          audio_effects: {
            ...(fx.filterPresetId !== undefined ? { filter_preset_id: fx.filterPresetId } : {}),
            ...(fx.environmentId !== undefined ? { environment_id: fx.environmentId } : {}),
            ...(fx.sendLevel !== undefined ? { send_level: fx.sendLevel } : {}),
            ...(fx.distance !== undefined ? { distance: fx.distance } : {}),
          },
        }
      : {}),
  }
}

export function elevenLabsUrl(voice: ElevenVoice): string {
  return `${ELEVENLABS_TTS_URL}/${encodeURIComponent(voice.voiceId)}?output_format=${OUTPUT_FORMAT}`
}

export function elevenLabsSynth(apiKey: string, fetchImpl: FetchLike = defaultFetch()): Synth {
  return {
    provider: 'elevenlabs',
    synthesize: (voice, text, lang) =>
      postOnce(fetchImpl, elevenLabsUrl(voice), { 'xi-api-key': apiKey, Accept: 'audio/mpeg' }, elevenLabsRequestBody(voice, text, lang)),
  }
}

// ------------------------------------------------------------------ Fish Audio

/** The JSON body for POST /v1/tts (fish-audio-api skill, TTSRequest). */
export function fishRequestBody(voice: FishVoice, text: string, lang: Lang): Record<string, unknown> {
  return {
    text,
    reference_id: voice.referenceId,
    format: 'mp3',
    mp3_bitrate: FISH_MP3_BITRATE,
    // Only affects normalization: English has rules; Hindi has none yet, so it is read as written.
    language: lang,
    normalize: true,
    latency: 'normal',
    temperature: voice.temperature ?? 0.7,
    top_p: 0.7,
    prosody: { speed: voice.speed ?? 1, volume: 0, normalize_loudness: true },
  }
}

export function fishSynth(apiKey: string, fetchImpl: FetchLike = defaultFetch()): Synth {
  return {
    provider: 'fish',
    synthesize: (voice, text, lang) =>
      postOnce(fetchImpl, FISH_TTS_URL, { Authorization: `Bearer ${apiKey}`, model: FISH_MODEL }, fishRequestBody(voice, text, lang)),
  }
}
