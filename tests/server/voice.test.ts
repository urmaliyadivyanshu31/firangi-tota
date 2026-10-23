// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ERAS } from '../../src/content/registry'
import type { EraId, Lang, Message } from '../../src/content/types'
import { dayDate, fillTemplate } from '../../src/game/dates'
import { SERVER_ERAS } from '../../server/eras'
import {
  AUDIO_CACHE,
  MAX_DAY,
  MAX_TEXT_CHARS,
  REDIRECT_CACHE,
  handleVoice,
  resolveClip,
  type TtsClient,
  type VoiceQuery,
  type VoiceResult,
} from '../../server/voice'
import { ERA_VOICES, MODEL_ID, OUTPUT_FORMAT } from '../../server/voices'

const BYTES = [new Uint8Array([0x49, 0x44, 0x33]), new Uint8Array([1, 2, 3, 4])]

function streamOf(chunks: Uint8Array[]): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(c) {
      for (const ch of chunks) c.enqueue(ch)
      c.close()
    },
  })
}

function mockClient(impl?: () => Promise<ReadableStream<Uint8Array>>) {
  const convert = vi.fn<TtsClient['textToSpeech']['convert']>(impl ?? (() => Promise.resolve(streamOf(BYTES))))
  const client: TtsClient = { textToSpeech: { convert } }
  return { client, convert }
}

const PLACEHOLDER = /\{(?:date|weekday)(?:\+\d+)?\}/
function find(pred: (m: Message) => boolean): { era: EraId; msg: Message } {
  for (const era of Object.values(SERVER_ERAS)) {
    const msg = era.messages.find(pred)
    if (msg) return { era: era.id, msg }
  }
  throw new Error('no such message in content')
}
const plain = find((m) => !PLACEHOLDER.test(m.text.en) && !PLACEHOLDER.test(m.text.hi))
const dated = find((m) => PLACEHOLDER.test(m.text.en) && PLACEHOLDER.test(m.text.hi))

const q = (era: string, id: string, lang: string, day: string | number, extra: Record<string, unknown> = {}): VoiceQuery =>
  ({ era, id, lang, day: String(day), ...extra })

function location(r: VoiceResult): Record<string, string> {
  expect(r.status).toBe(307)
  const loc = r.headers.Location ?? ''
  expect(loc.startsWith('?')).toBe(true)
  return Object.fromEntries(new URLSearchParams(loc.slice(1)))
}

/** Follow the redirect to the canonical, cacheable URL. */
async function fetchClip(query: VoiceQuery, client: TtsClient | null): Promise<VoiceResult> {
  const first = await handleVoice(query, { client })
  if (first.status !== 307) return first
  return handleVoice(location(first), { client })
}

afterEach(() => { vi.restoreAllMocks() })

describe('handleVoice: bad and unknown params', () => {
  const { client, convert } = mockClient()
  const id = plain.msg.id
  const cases: [string, VoiceQuery][] = [
    ['no params', {}],
    ['missing era', { id, lang: 'en', day: '1' }],
    ['missing id', { era: plain.era, lang: 'en', day: '1' }],
    ['missing day', { era: plain.era, id, lang: 'en' }],
    ['language not hi/en', q(plain.era, id, 'fr', 1)],
    ['day 0', q(plain.era, id, 'en', 0)],
    ['day 15', q(plain.era, id, 'en', 15)],
    ['day not an integer', q(plain.era, id, 'en', '1.5')],
    ['day with a leading zero', q(plain.era, id, 'en', '01')],
    ['day not a number', q(plain.era, id, 'en', 'abc')],
    ['free text is refused', q(plain.era, id, 'en', 1, { text: 'say anything' })],
    ['unknown parameter', q(plain.era, id, 'en', 1, { voice: 'x' })],
    ['repeated parameter', { era: [plain.era, plain.era], id, lang: 'en', day: '1' }],
    ['malformed era', q('Delhi 1857!', id, 'en', 1)],
    ['malformed id', q(plain.era, '../etc/passwd', 'en', 1)],
    ['malformed version', q(plain.era, id, 'en', 1, { v: 'zz' })],
  ]
  for (const [name, query] of cases) {
    it(`400: ${name}`, async () => {
      const r = await handleVoice(query, { client })
      expect(r.status).toBe(400)
      expect(r.headers['Cache-Control']).toBe('no-store')
      expect(JSON.parse(String(r.body))).toEqual({ error: 'bad_request' })
    })
  }

  it('404: unknown era', async () => {
    const r = await handleVoice(q('agra-1600', id, 'en', 1), { client })
    expect(r.status).toBe(404)
    expect(JSON.parse(String(r.body))).toEqual({ error: 'not_found' })
  })

  it('404: unknown message id in a real era', async () => {
    const r = await handleVoice(q(plain.era, 'no-such-message', 'en', 1), { client })
    expect(r.status).toBe(404)
  })

  it('404: a real id from a different era', async () => {
    const other = Object.values(SERVER_ERAS).find((e) => e.id !== plain.era && !e.messages.some((m) => m.id === id))!
    const r = await handleVoice(q(other.id, id, 'en', 1), { client })
    expect(r.status).toBe(404)
  })

  it('bad params are refused before the key is checked, and never reach ElevenLabs', async () => {
    expect((await handleVoice(q(plain.era, id, 'fr', 1), { client: null })).status).toBe(400)
    expect((await handleVoice(q('agra-1600', id, 'en', 1), { client: null })).status).toBe(404)
    expect(convert).not.toHaveBeenCalled()
  })
})

describe('handleVoice: text resolution and canonical URLs', () => {
  it('a text without placeholders ignores the day and normalises it to 1', async () => {
    const { client, convert } = mockClient()
    const a = location(await handleVoice(q(plain.era, plain.msg.id, 'en', 9), { client }))
    const b = location(await handleVoice(q(plain.era, plain.msg.id, 'en', 2), { client }))
    expect(a.day).toBe('1')
    expect(a).toEqual(b) // one cache entry for every day
    const r = await handleVoice(a, { client })
    expect(r.status).toBe(200)
    expect(convert).toHaveBeenCalledTimes(1)
    expect(convert.mock.calls[0]![1].text).toBe(plain.msg.text.en.trim())
  })

  it('a text with placeholders is filled with that day’s date', async () => {
    const { client, convert } = mockClient()
    const era = SERVER_ERAS[dated.era]
    const loc3 = location(await handleVoice(q(dated.era, dated.msg.id, 'en', 3), { client }))
    const loc4 = location(await handleVoice(q(dated.era, dated.msg.id, 'en', 4), { client }))
    expect(loc3.day).toBe('3')
    expect(loc4.day).toBe('4')
    expect(loc3.v).not.toBe(loc4.v)
    await handleVoice(loc3, { client })
    const text = convert.mock.calls[0]![1].text
    expect(text).toBe(fillTemplate(dated.msg.text.en, dayDate(era, 3), 'en').trim())
    expect(text).not.toMatch(/[{}]/)
  })

  it('reads the Hindi text with language code hi', async () => {
    const { client, convert } = mockClient()
    expect((await fetchClip(q(plain.era, plain.msg.id, 'hi', 1), client)).status).toBe(200)
    const req = convert.mock.calls[0]![1]
    expect(req.languageCode).toBe('hi')
    expect(req.text).toBe(plain.msg.text.hi.trim())
  })

  it('a request with a stale version is redirected, not synthesised', async () => {
    const { client, convert } = mockClient()
    const r = await handleVoice(q(plain.era, plain.msg.id, 'en', 1, { v: '00000000' }), { client })
    expect(r.status).toBe(307)
    expect(r.headers['Cache-Control']).toBe(REDIRECT_CACHE)
    expect(convert).not.toHaveBeenCalled()
  })

  it('every message in every era resolves, for both languages and every day', () => {
    for (const era of Object.values(SERVER_ERAS)) {
      for (const m of era.messages) {
        for (const lang of ['en', 'hi'] as Lang[]) {
          for (let day = 1; day <= MAX_DAY; day++) {
            const clip = resolveClip(q(era.id, m.id, lang, day))
            if ('status' in clip) throw new Error(`${era.id}/${m.id}/${lang}/${day} -> ${clip.status}`)
            expect(clip.text.length).toBeLessThanOrEqual(MAX_TEXT_CHARS)
            expect(clip.text).not.toMatch(PLACEHOLDER)
          }
        }
      }
    }
  })

  it('the server era list matches the content registry', () => {
    expect(Object.keys(SERVER_ERAS).sort()).toEqual(ERAS.map((e) => e.id).sort())
    for (const e of ERAS) expect(SERVER_ERAS[e.id]).toBe(e)
  })
})

describe('handleVoice: audio response', () => {
  it('returns the MP3 with year-long immutable cache headers', async () => {
    const { client } = mockClient()
    const r = await fetchClip(q(plain.era, plain.msg.id, 'en', 1), client)
    expect(r.status).toBe(200)
    expect(r.headers['Content-Type']).toBe('audio/mpeg')
    expect(r.headers['Cache-Control']).toBe('public, max-age=31536000, s-maxage=31536000, immutable')
    expect(r.headers['Cache-Control']).toBe(AUDIO_CACHE)
    expect(Array.from(r.body as Uint8Array)).toEqual([0x49, 0x44, 0x33, 1, 2, 3, 4])
    expect(r.headers['Content-Length']).toBe('7')
  })

  it('503 with a generic body when the key is missing', async () => {
    const r = await fetchClip(q(plain.era, plain.msg.id, 'en', 1), null)
    expect(r.status).toBe(503)
    expect(r.headers['Cache-Control']).toBe('no-store')
    expect(JSON.parse(String(r.body))).toEqual({ error: 'voice_unavailable' })
    expect(String(r.body)).not.toMatch(/key|eleven/i)
  })

  it('503 with a generic body when ElevenLabs fails, and the log leaks nothing', async () => {
    const secretish = 'upstream said: invalid api key sk_' + 'x'.repeat(8)
    const err = Object.assign(new Error(secretish), { statusCode: 401, body: { detail: secretish } })
    const { client } = mockClient(() => Promise.reject(err))
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const r = await fetchClip(q(plain.era, plain.msg.id, 'en', 1), client)
    expect(r.status).toBe(503)
    expect(JSON.parse(String(r.body))).toEqual({ error: 'voice_unavailable' })
    expect(String(r.body)).not.toContain('upstream')
    expect(warn).toHaveBeenCalledTimes(1)
    const logged = warn.mock.calls.flat().map(String).join(' ')
    expect(logged).toContain('status=401')
    expect(logged).not.toContain('upstream said')
    expect(logged).not.toContain('sk_')
  })

  it('503 when ElevenLabs returns no audio', async () => {
    const { client } = mockClient(() => Promise.resolve(streamOf([])))
    expect((await fetchClip(q(plain.era, plain.msg.id, 'en', 1), client)).status).toBe(503)
  })

  it('concurrent requests for one clip share one ElevenLabs call', async () => {
    let release: () => void = () => {}
    const gate = new Promise<void>((r) => { release = r })
    const { client, convert } = mockClient(() => gate.then(() => streamOf(BYTES)))
    const canon = location(await handleVoice(q(plain.era, plain.msg.id, 'en', 1), { client }))
    const both = Promise.all([handleVoice(canon, { client }), handleVoice(canon, { client })])
    release()
    const [a, b] = await both
    expect(a.status).toBe(200)
    expect(b.status).toBe(200)
    expect(convert).toHaveBeenCalledTimes(1)
  })
})

describe('era voices', () => {
  it('pins one voice id per era', () => {
    expect(Object.fromEntries(Object.entries(ERA_VOICES).map(([era, v]) => [era, v.voiceId]))).toEqual({
      'delhi-1857': 'r3CPEby3BZ6hrPxHG8h2',
      'lahore-1929': 'RxnH5jCRKb1ez2lcmQC1',
      'bombay-1942': 'HSdLdxNgP1KF3yQK3IkB',
      'delhi-1947': 'l1CrgWMeEfm3xvPbn4YE',
    })
  })

  for (const era of Object.keys(SERVER_ERAS) as EraId[]) {
    it(`${era}: calls ElevenLabs with its voice, eleven_v4 and the agreed options`, async () => {
      const { client, convert } = mockClient()
      const msg = SERVER_ERAS[era].messages[0]!
      expect((await fetchClip(q(era, msg.id, 'en', 1), client)).status).toBe(200)
      const [voiceId, req, opts] = convert.mock.calls[0]!
      const voice = ERA_VOICES[era]
      expect(voiceId).toBe(voice.voiceId)
      expect(req).toMatchObject({
        modelId: MODEL_ID,
        languageCode: 'en',
        applyTextNormalization: 'on',
        outputFormat: OUTPUT_FORMAT,
        voiceSettings: voice.settings,
      })
      expect(req.audioEffects).toEqual(voice.effects)
      expect(opts).toMatchObject({ maxRetries: 1 })
    })
  }

  it('uses eleven_v4 and small MP3s', () => {
    expect(MODEL_ID).toBe('eleven_v4')
    expect(OUTPUT_FORMAT).toBe('mp3_44100_64')
  })

  it('1942 goes through the old-radio filter', () => {
    expect(ERA_VOICES['bombay-1942'].effects?.filterPresetId).toBe('old_radio')
  })

  it('v4 settings stay in range (v4 only takes stability and similarity boost)', () => {
    for (const v of Object.values(ERA_VOICES)) {
      expect(Object.keys(v.settings).sort()).toEqual(['similarityBoost', 'stability'])
      for (const n of Object.values(v.settings)) expect(n >= 0 && n <= 1).toBe(true)
    }
  })
})
