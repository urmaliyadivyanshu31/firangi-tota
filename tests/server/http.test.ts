// @vitest-environment node
import type { IncomingMessage, ServerResponse } from 'node:http'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createVoiceMiddleware, rawQueryOf, voiceBackend, voiceEnabled } from '../../server/http'
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
  it('hands handleVoice the raw query string, undecoded and in the order sent', () => {
    expect(rawQueryOf('/api/voice?era=a&id=b&lang=en&day=1')).toBe('era=a&id=b&lang=en&day=1')
    expect(rawQueryOf('/?day=1&era=%64elhi')).toBe('day=1&era=%64elhi') // the Vite mount strips the path
    expect(rawQueryOf('/api/voice??era=a')).toBe('?era=a')
    expect(rawQueryOf('/api/voice?era=a#x')).toBe('era=a')
    expect(rawQueryOf('/api/voice')).toBe('')
    expect(rawQueryOf(undefined)).toBe('')
  })

  it('a reordered or percent-encoded URL is redirected, never synthesised', async () => {
    const first = await run('GET', firstUrl)
    const canon = String(first.headers.Location).slice(1)
    for (const raw of [canon.split('&').reverse().join('&'), canon.replace('-', '%2D'), canon.replace('-', '%2d'), canon.replace('day=', '%64ay=')]) {
      const r = await run('GET', `/api/voice?${raw}`)
      expect(r.res.statusCode).toBe(307)
      expect(r.headers['Cache-Control']).not.toContain('immutable')
      expect(r.synthesize).not.toHaveBeenCalled()
    }
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

})

describe('the Vercel function', () => {
  afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals() })

  it('is on only with VOICE_ENABLED=on', () => {
    expect(voiceEnabled({})).toBe(false)
    expect(voiceEnabled({ VOICE_ENABLED: '' })).toBe(false)
    expect(voiceEnabled({ VOICE_ENABLED: 'off' })).toBe(false)
    expect(voiceEnabled({ VOICE_ENABLED: 'true' })).toBe(false)
    expect(voiceEnabled({ VOICE_ENABLED: 'on' })).toBe(true)
    expect(voiceEnabled({ VOICE_ENABLED: ' ON ' })).toBe(true)
  })

  it('answers 404 without VOICE_ENABLED, even with a key set, and never calls a provider', async () => {
    vi.stubEnv('VOICE_ENABLED', '')
    vi.stubEnv('FISH_API_KEY', fake('test', 'fish'))
    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)
    const { default: handler } = await import('../../api/voice')
    for (const url of [firstUrl, '/api/voice?anything']) {
      const { res, headers } = fakeRes()
      await handler({ method: 'GET', url } as IncomingMessage, res as unknown as ServerResponse)
      expect(res.statusCode).toBe(404)
      expect(headers['Cache-Control']).toBe('no-store')
    }
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('serves the API once VOICE_ENABLED=on', async () => {
    vi.stubEnv('VOICE_ENABLED', 'on')
    vi.stubEnv('FISH_API_KEY', '')
    const { default: handler } = await import('../../api/voice')
    const { res } = fakeRes()
    await handler({ method: 'GET', url: firstUrl } as IncomingMessage, res as unknown as ServerResponse)
    expect(res.statusCode).toBe(307)
  })
})
