// @vitest-environment node
import type { IncomingMessage, ServerResponse } from 'node:http'
import { describe, expect, it, vi } from 'vitest'
import { createTtsClient, createVoiceMiddleware, queryFromUrl, voiceBackend } from '../../server/http'
import { SERVER_ERAS } from '../../server/eras'
import type { Synth } from '../../server/providers'

function fakeRes() {
  const headers: Record<string, string> = {}
  const res = {
    statusCode: 0,
    body: undefined as unknown,
    setHeader: (k: string, v: string) => { headers[k] = v },
    end: (b: unknown) => { res.body = b },
  }
  return { res, headers }
}

const run = async (method: string, url: string) => {
  const synthesize = vi.fn(async () => new Uint8Array([1, 2, 3]))
  const synth = { provider: 'fish', synthesize } as Synth
  const mw = createVoiceMiddleware(() => ({ provider: 'fish', synth }))
  const { res, headers } = fakeRes()
  await mw({ method, url } as IncomingMessage, res as unknown as ServerResponse)
  return { res, headers, synthesize }
}

const era = Object.values(SERVER_ERAS)[0]!
const firstUrl = `/api/voice?era=${era.id}&id=${era.messages[0]!.id}&lang=en&day=1`
const fake = (...parts: string[]) => parts.join('-')

describe('voice http adapter', () => {
  it('parses a query and turns repeated keys into arrays', () => {
    expect(queryFromUrl('/api/voice?era=a&id=b&lang=en&day=1')).toEqual({ era: 'a', id: 'b', lang: 'en', day: '1' })
    expect(queryFromUrl('/?era=a&era=b')).toEqual({ era: ['a', 'b'] })
    expect(queryFromUrl(undefined)).toEqual({})
  })

  it('refuses repeated keys with 400', async () => {
    const { res } = await run('GET', `${firstUrl}&era=${era.id}`)
    expect(res.statusCode).toBe(400)
  })

  it('refuses anything but GET', async () => {
    const { res, headers, synthesize } = await run('POST', '/api/voice')
    expect(res.statusCode).toBe(405)
    expect(headers.Allow).toBe('GET')
    expect(synthesize).not.toHaveBeenCalled()
  })

  it('redirects a first request, then serves audio from the provider', async () => {
    const first = await run('GET', firstUrl)
    expect(first.res.statusCode).toBe(307)
    expect(first.headers.Location).toMatch(/^\?era=.+&v=[0-9a-f]{8}$/)
    const second = await run('GET', `/api/voice${first.headers.Location}`)
    expect(second.res.statusCode).toBe(200)
    expect(second.synthesize).toHaveBeenCalledTimes(1)
  })
})

describe('provider selection', () => {
  it('defaults to Fish Audio', () => {
    expect(voiceBackend({}).provider).toBe('fish')
    expect(voiceBackend({ VOICE_PROVIDER: 'nonsense' }).provider).toBe('fish')
    expect(voiceBackend({ VOICE_PROVIDER: ' ElevenLabs ' }).provider).toBe('elevenlabs')
  })

  it('has no synthesizer when the active provider has no key', () => {
    expect(voiceBackend({ ELEVENLABS_API_KEY: fake('el', 'only') }).synth).toBeNull() // Fish is active
    expect(voiceBackend({ VOICE_PROVIDER: 'elevenlabs', FISH_API_KEY: fake('fish', 'only') }).synth).toBeNull()
    expect(voiceBackend({ FISH_API_KEY: '   ' }).synth).toBeNull()
  })

  it('builds the right synthesizer for each provider (no network call)', () => {
    expect(voiceBackend({ FISH_API_KEY: fake('test', 'fish') }).synth?.provider).toBe('fish')
    expect(voiceBackend({ VOICE_PROVIDER: 'elevenlabs', ELEVENLABS_API_KEY: fake('test', 'el') }).synth?.provider).toBe('elevenlabs')
  })

  it('makes no ElevenLabs client without a key', () => {
    expect(createTtsClient(undefined)).toBeNull()
    expect(createTtsClient('  ')).toBeNull()
    expect(typeof createTtsClient(fake('test', 'only'))?.textToSpeech.convert).toBe('function')
  })
})
