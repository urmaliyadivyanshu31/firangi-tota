// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'
import type { Message } from '../../src/content/types'
import { SERVER_ERAS } from '../../server/eras'
import { ELEVENLABS_TTS_URL, elevenLabsRequestBody, elevenLabsSynth, FISH_TTS_URL, fishRequestBody, fishSynth, UPSTREAM_TIMEOUT_MS, UpstreamError, type FetchLike, type Synth } from '../../server/providers'
import { handleVoice as handleRaw, type VoiceQuery, type VoiceResult } from '../../server/voice'
import { FISH_MODEL, MODEL_ID, OUTPUT_FORMAT, parseProvider, VOICES } from '../../server/voices'

/** handleVoice takes the raw query string; these tests build it from an object, in key order. */
const handleVoice = (query: VoiceQuery, deps: Parameters<typeof handleRaw>[1]) =>
  handleRaw(new URLSearchParams(query as Record<string, string>).toString(), deps)

const streamOf = (bytes: number[]) =>
  new ReadableStream<Uint8Array>({ start(c) { c.enqueue(new Uint8Array(bytes)); c.close() } })

function mockFetch(responses: { status: number; bytes?: number[] }[]) {
  const calls: { url: string; init: { method: string; headers: Record<string, string>; body: string } }[] = []
  let i = 0
  const impl = vi.fn(async (url: string, init: { method: string; headers: Record<string, string>; body: string }) => {
    calls.push({ url, init })
    const r = responses[Math.min(i++, responses.length - 1)]!
    return { ok: r.status >= 200 && r.status < 300, status: r.status, body: streamOf(r.bytes ?? [1, 2, 3]) }
  })
  return { impl, calls }
}

const key = ['test', 'fish', 'key'].join('-')
const era = SERVER_ERAS['delhi-1857']
const msg: Message = era.messages.find((m) => !/\{/.test(m.text.hi))!

function location(r: VoiceResult): Record<string, string> {
  expect(r.status).toBe(307)
  return Object.fromEntries(new URLSearchParams(String(r.headers.Location).slice(1)))
}

describe('Fish Audio request', () => {
  it('posts JSON to /v1/tts with the free model, the voice and small MP3s', async () => {
    const { impl, calls } = mockFetch([{ status: 200, bytes: [9, 8, 7] }])
    const synth = fishSynth(key, impl)
    const voice = VOICES.dastango.fish!
    const audio = await synth.synthesize(voice as never, 'नमस्ते', 'hi')
    expect(Array.from(audio)).toEqual([9, 8, 7])
    expect(calls).toHaveLength(1)
    const { url, init } = calls[0]!
    expect(url).toBe(FISH_TTS_URL)
    expect(init.method).toBe('POST')
    expect(init.headers).toMatchObject({ Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', model: 's2.1-pro-free' })
    expect(JSON.parse(init.body)).toMatchObject({
      text: 'नमस्ते',
      reference_id: voice.referenceId,
      format: 'mp3',
      mp3_bitrate: 64,
      language: 'hi',
      normalize: true,
      temperature: voice.temperature,
      prosody: { speed: voice.speed, volume: 0, normalize_loudness: true },
    })
    expect(FISH_MODEL).toBe('s2.1-pro-free')
  })

  it('defaults temperature and speed when a voice leaves them out', () => {
    const body = fishRequestBody({ referenceId: 'x', title: 't' }, 'Hello', 'en')
    expect(body).toMatchObject({ temperature: 0.7, top_p: 0.7, language: 'en', prosody: { speed: 1 } })
  })

  it('makes one attempt only: no retry on 5xx or 429, which might bill twice for one clip', async () => {
    for (const status of [500, 503, 429]) {
      const flaky = mockFetch([{ status }, { status: 200, bytes: [1] }])
      const err = await fishSynth(key, flaky.impl).synthesize({ referenceId: 'x', title: 't' } as never, 'a', 'en').catch((e: unknown) => e)
      expect(err).toBeInstanceOf(UpstreamError)
      expect((err as UpstreamError).statusCode).toBe(status)
      expect(flaky.calls).toHaveLength(1)
    }
  })

  it('makes one attempt only after a timeout or a network error, and the error carries nothing of the request', async () => {
    for (const cause of [new DOMException('The operation timed out.', 'TimeoutError'), new TypeError(`fetch failed ${FISH_TTS_URL} Bearer ${key}`)]) {
      const impl = vi.fn(async () => { throw cause })
      const err = await fishSynth(key, impl as unknown as FetchLike).synthesize({ referenceId: 'x', title: 't' } as never, 'a', 'en').catch((e: unknown) => e)
      expect(err).toBeInstanceOf(UpstreamError)
      expect((err as UpstreamError).statusCode).toBeUndefined()
      expect(String((err as Error).message)).not.toContain(key)
      expect((err as Error).cause).toBeUndefined()
      expect(impl).toHaveBeenCalledTimes(1)
    }
  })

  it('gives every request a timeout signal', async () => {
    const { impl } = mockFetch([{ status: 200 }])
    await fishSynth(key, impl).synthesize({ referenceId: 'x', title: 't' } as never, 'a', 'en')
    const init = impl.mock.calls[0]![1] as { signal?: AbortSignal }
    expect(init.signal).toBeInstanceOf(AbortSignal)
    expect(UPSTREAM_TIMEOUT_MS).toBeLessThanOrEqual(25_000)
  })

  it('never exposes the body of a refusal', async () => {
    const denied = mockFetch([{ status: 402 }])
    const err = await fishSynth(key, denied.impl).synthesize({ referenceId: 'x', title: 't' } as never, 'a', 'en').catch((e: unknown) => e)
    expect(err).toBeInstanceOf(UpstreamError)
    expect((err as UpstreamError).statusCode).toBe(402)
    expect(String((err as Error).message)).not.toContain(key)
    expect(denied.calls).toHaveLength(1)
  })

  it('every enabled voice has a Fish model', () => {
    for (const v of Object.values(VOICES)) if (v.enabled) expect(v.fish?.referenceId).toMatch(/^[0-9a-f]{32}$/)
  })
})

describe('ElevenLabs request (plain fetch, no SDK)', () => {
  const voice = VOICES.dastango.elevenlabs!

  it('posts the REST body to /v1/text-to-speech/{voice} with the key header and small MP3s', async () => {
    const elKey = ['test', 'el', 'key'].join('-')
    const { impl, calls } = mockFetch([{ status: 200, bytes: [5, 6] }])
    const audio = await elevenLabsSynth(elKey, impl).synthesize(voice as never, 'नमस्ते', 'hi')
    expect(Array.from(audio)).toEqual([5, 6])
    expect(calls).toHaveLength(1)
    const { url, init } = calls[0]!
    expect(url).toBe(`${ELEVENLABS_TTS_URL}/${voice.voiceId}?output_format=${OUTPUT_FORMAT}`)
    expect(url.startsWith('https://api.elevenlabs.io/v1/text-to-speech/')).toBe(true)
    expect(init.method).toBe('POST')
    expect(init.headers).toMatchObject({ 'xi-api-key': elKey, 'Content-Type': 'application/json' })
    expect(JSON.parse(init.body)).toEqual({
      text: 'नमस्ते',
      model_id: MODEL_ID,
      language_code: 'hi',
      apply_text_normalization: 'on',
      voice_settings: { stability: voice.settings.stability, similarity_boost: voice.settings.similarityBoost },
      audio_effects: { environment_id: voice.effects!.environmentId, send_level: voice.effects!.sendLevel },
    })
  })

  it('leaves audio effects out when the voice has none', () => {
    const { effects: _fx, ...plain } = voice
    expect(elevenLabsRequestBody(plain, 'a', 'en')).not.toHaveProperty('audio_effects')
  })

  it('makes one attempt only and keeps the body out of the error', async () => {
    const flaky = mockFetch([{ status: 503 }, { status: 200 }])
    const err = await elevenLabsSynth(key, flaky.impl).synthesize(voice as never, 'a', 'en').catch((e: unknown) => e)
    expect(err).toBeInstanceOf(UpstreamError)
    expect((err as UpstreamError).statusCode).toBe(503)
    expect(flaky.calls).toHaveLength(1)
  })
})

describe('provider and cache key', () => {
  const fishDeps = (synth: Synth | null) => ({ provider: 'fish' as const, synth })
  const elDeps = { provider: 'elevenlabs' as const, synth: null }
  const query = { era: era.id, id: msg.id, lang: 'hi', day: '1' }

  it('the same message gets a different canonical hash on each provider', async () => {
    const onFish = location(await handleVoice(query, fishDeps(null)))
    const onEl = location(await handleVoice(query, elDeps))
    expect(onFish.v).not.toBe(onEl.v)
    expect({ ...onFish, v: '' }).toEqual({ ...onEl, v: '' }) // only the hash differs
  })

  it('a URL hashed for one provider is redirected, not served, by the other', async () => {
    const synthesize = vi.fn(async () => new Uint8Array([1]))
    const onEl = location(await handleVoice(query, elDeps))
    const r = await handleVoice(onEl, fishDeps({ provider: 'fish', synthesize } as Synth))
    expect(r.status).toBe(307)
    expect(synthesize).not.toHaveBeenCalled()
  })

  it('Fish serves the canonical URL with the Dastango model in every era', async () => {
    for (const e of Object.values(SERVER_ERAS)) {
      const synthesize = vi.fn(async () => new Uint8Array([4, 5]))
      const deps = fishDeps({ provider: 'fish', synthesize } as Synth)
      const m = e.messages[0]!
      const canon = location(await handleVoice({ era: e.id, id: m.id, lang: 'en', day: '1' }, deps))
      const ok = await handleVoice(canon, deps)
      expect(ok.status).toBe(200)
      expect(ok.headers['Cache-Control']).toBe('public, max-age=31536000, s-maxage=31536000, immutable')
      expect(synthesize).toHaveBeenCalledWith(VOICES.dastango.fish, expect.any(String), 'en')
    }
  })

  it('the guest voice answers 404 on Fish too while disabled', async () => {
    const r = await handleVoice({ ...query, voice: 'guest' }, fishDeps(null))
    expect(r.status).toBe(404)
  })

  it('a synthesizer for the wrong provider is not used', async () => {
    const synthesize = vi.fn(async () => new Uint8Array([1]))
    const canon = location(await handleVoice(query, fishDeps(null)))
    const r = await handleVoice(canon, fishDeps({ provider: 'elevenlabs', synthesize } as Synth))
    expect(r.status).toBe(503)
    expect(synthesize).not.toHaveBeenCalled()
  })

  it('parses VOICE_PROVIDER with Fish as the default', () => {
    expect(parseProvider(undefined)).toBe('fish')
    expect(parseProvider('fish')).toBe('fish')
    expect(parseProvider('ELEVENLABS')).toBe('elevenlabs')
    expect(parseProvider('polly')).toBe('fish')
  })
})
