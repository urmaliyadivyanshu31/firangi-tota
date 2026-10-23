// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'
import type { Message } from '../../src/content/types'
import { SERVER_ERAS } from '../../server/eras'
import { FISH_TTS_URL, fishRequestBody, fishSynth, UpstreamError, type Synth } from '../../server/providers'
import { handleVoice, type VoiceResult } from '../../server/voice'
import { ALT_VOICES, ERA_VOICES, FISH_MODEL, parseProvider } from '../../server/voices'

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
    const voice = ERA_VOICES['delhi-1857'].fish
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

  it('retries once on 5xx or 429, never on 4xx, and never exposes the body', async () => {
    const flaky = mockFetch([{ status: 503 }, { status: 200, bytes: [1] }])
    expect(Array.from(await fishSynth(key, flaky.impl).synthesize({ referenceId: 'x', title: 't' } as never, 'a', 'en'))).toEqual([1])
    expect(flaky.calls).toHaveLength(2)

    const denied = mockFetch([{ status: 402 }])
    const err = await fishSynth(key, denied.impl).synthesize({ referenceId: 'x', title: 't' } as never, 'a', 'en').catch((e: unknown) => e)
    expect(err).toBeInstanceOf(UpstreamError)
    expect((err as UpstreamError).statusCode).toBe(402)
    expect(String((err as Error).message)).not.toContain(key)
    expect(denied.calls).toHaveLength(1)
  })

  it('every era and every enabled alternate voice has a Fish model', () => {
    for (const v of Object.values(ERA_VOICES)) expect(v.fish.referenceId).toMatch(/^[0-9a-f]{32}$/)
    for (const v of Object.values(ALT_VOICES)) if (v.enabled) expect(v.fish?.referenceId).toMatch(/^[0-9a-f]{32}$/)
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

  it('Fish serves the canonical URL with the era voice, and Dastango with its own', async () => {
    const synthesize = vi.fn(async () => new Uint8Array([4, 5]))
    const deps = fishDeps({ provider: 'fish', synthesize } as Synth)
    const canon = location(await handleVoice(query, deps))
    const ok = await handleVoice(canon, deps)
    expect(ok.status).toBe(200)
    expect(ok.headers['Cache-Control']).toBe('public, max-age=31536000, s-maxage=31536000, immutable')
    expect(synthesize).toHaveBeenLastCalledWith(ERA_VOICES['delhi-1857'].fish, msg.text.hi.trim(), 'hi')

    const dg = location(await handleVoice({ ...query, voice: 'dastango' }, deps))
    expect(dg.v).not.toBe(canon.v)
    await handleVoice(dg, deps)
    expect(synthesize).toHaveBeenLastCalledWith(ALT_VOICES.dastango.fish, msg.text.hi.trim(), 'hi')
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
