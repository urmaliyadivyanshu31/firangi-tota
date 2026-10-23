// Text-to-speech providers behind one small interface. Server only.
// Fish Audio is the default (model s2.1-pro-free, $0); ElevenLabs stays for later.
// Neither ever logs a key, a request body or an upstream error body.
import type { ElevenLabs } from '@elevenlabs/elevenlabs-js'
import type { Lang } from '../src/content/types.js'
import type { ElevenVoice, FishVoice } from '../src/content/voices.js'
import { FISH_MODEL, FISH_MP3_BITRATE, MODEL_ID, OUTPUT_FORMAT } from './voices.js'

const MAX_AUDIO_BYTES = 5 * 1024 * 1024
const UPSTREAM_TIMEOUT_MS = 25_000
export const FISH_TTS_URL = 'https://api.fish.audio/v1/tts'

/** The slice of ElevenLabsClient used here, so tests can pass a mock. */
export interface TtsClient {
  textToSpeech: {
    convert(
      voiceId: string,
      request: ElevenLabs.BodyTextToSpeechFull,
      requestOptions?: { timeoutInSeconds?: number; maxRetries?: number },
    ): PromiseLike<ReadableStream<Uint8Array>>
  }
}

export type Synth =
  | { provider: 'fish'; synthesize(voice: FishVoice, text: string, lang: Lang): Promise<Uint8Array> }
  | { provider: 'elevenlabs'; synthesize(voice: ElevenVoice, text: string, lang: Lang): Promise<Uint8Array> }

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

// ------------------------------------------------------------------ ElevenLabs

export function elevenLabsRequest(voice: ElevenVoice, text: string, lang: Lang): ElevenLabs.BodyTextToSpeechFull {
  return {
    text,
    modelId: MODEL_ID,
    languageCode: lang,
    applyTextNormalization: 'on',
    outputFormat: OUTPUT_FORMAT,
    voiceSettings: { stability: voice.settings.stability, similarityBoost: voice.settings.similarityBoost },
    ...(voice.effects ? { audioEffects: { ...voice.effects } } : {}),
  }
}

export function elevenLabsSynth(client: TtsClient): Synth {
  return {
    provider: 'elevenlabs',
    async synthesize(voice, text, lang) {
      const stream = await client.textToSpeech.convert(voice.voiceId, elevenLabsRequest(voice, text, lang), {
        timeoutInSeconds: UPSTREAM_TIMEOUT_MS / 1000,
        maxRetries: 1,
      })
      return readAll(stream)
    },
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

type FetchLike = (url: string, init: { method: string; headers: Record<string, string>; body: string; signal?: AbortSignal }) => Promise<{
  ok: boolean
  status: number
  body: ReadableStream<Uint8Array> | null
}>

const retryable = (status: number) => status === 429 || status >= 500

export function fishSynth(apiKey: string, fetchImpl: FetchLike = fetch as unknown as FetchLike): Synth {
  async function once(voice: FishVoice, text: string, lang: Lang): Promise<Uint8Array> {
    const res = await fetchImpl(FISH_TTS_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', model: FISH_MODEL },
      body: JSON.stringify(fishRequestBody(voice, text, lang)),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    })
    if (!res.ok || !res.body) {
      void res.body?.cancel()
      throw new UpstreamError(res.status)
    }
    return readAll(res.body)
  }
  return {
    provider: 'fish',
    async synthesize(voice, text, lang) {
      try {
        return await once(voice, text, lang)
      } catch (err) {
        const status = err instanceof UpstreamError ? err.statusCode : undefined
        if (status !== undefined && !retryable(status)) throw err
        return once(voice, text, lang) // one retry for 429, 5xx and network errors
      }
    },
  }
}
