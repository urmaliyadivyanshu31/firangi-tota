// @vitest-environment node
import type { IncomingMessage, ServerResponse } from 'node:http'
import { describe, expect, it, vi } from 'vitest'
import { createTtsClient, createVoiceMiddleware, queryFromUrl } from '../../server/http'
import { SERVER_ERAS } from '../../server/eras'

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
  const convert = vi.fn()
  const mw = createVoiceMiddleware(() => ({ textToSpeech: { convert } }))
  const { res, headers } = fakeRes()
  await mw({ method, url } as IncomingMessage, res as unknown as ServerResponse)
  return { res, headers, convert }
}

describe('voice http adapter', () => {
  it('parses a query and turns repeated keys into arrays', () => {
    expect(queryFromUrl('/api/voice?era=a&id=b&lang=en&day=1')).toEqual({ era: 'a', id: 'b', lang: 'en', day: '1' })
    expect(queryFromUrl('/?era=a&era=b')).toEqual({ era: ['a', 'b'] })
    expect(queryFromUrl(undefined)).toEqual({})
  })

  it('refuses repeated keys with 400', async () => {
    const era = Object.values(SERVER_ERAS)[0]!
    const { res } = await run('GET', `/api/voice?era=${era.id}&era=${era.id}&id=${era.messages[0]!.id}&lang=en&day=1`)
    expect(res.statusCode).toBe(400)
  })

  it('refuses anything but GET', async () => {
    const { res, headers, convert } = await run('POST', '/api/voice')
    expect(res.statusCode).toBe(405)
    expect(headers.Allow).toBe('GET')
    expect(convert).not.toHaveBeenCalled()
  })

  it('redirects a valid first request to the canonical URL', async () => {
    const era = Object.values(SERVER_ERAS)[0]!
    const { res, headers } = await run('GET', `/api/voice?era=${era.id}&id=${era.messages[0]!.id}&lang=en&day=1`)
    expect(res.statusCode).toBe(307)
    expect(headers.Location).toMatch(/^\?era=.+&v=[0-9a-f]{8}$/)
  })

  it('makes no client without a key', () => {
    expect(createTtsClient(undefined)).toBeNull()
    expect(createTtsClient('')).toBeNull()
    expect(createTtsClient('   ')).toBeNull()
  })

  it('makes a server-side client when a key is set (no network call)', () => {
    const fake = ['test', 'only', 'not', 'a', 'key'].join('-')
    const c = createTtsClient(fake)
    expect(typeof c?.textToSpeech.convert).toBe('function')
  })
})
