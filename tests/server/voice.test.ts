// @vitest-environment node
// handleVoice tests, run against the ElevenLabs provider id with a fake synthesizer (no network).
// The provider requests (Fish Audio and ElevenLabs over fetch) are covered in providers.test.ts.
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Synth } from '../../server/providers'
import { ERAS } from '../../src/content/registry'
import type { EraId, Lang, Message } from '../../src/content/types'
import type { ElevenVoice } from '../../src/content/voices'
import { dayDate, fillTemplate } from '../../src/game/dates'
import { SERVER_ERAS } from '../../server/eras'
import {
  AUDIO_CACHE,
  MAX_DAY,
  MAX_TEXT_CHARS,
  REDIRECT_CACHE,
  handleVoice as handleRaw,
  parseQuery,
  resolveClip,
  revision,
  type VoiceQuery,
  type VoiceResult,
} from '../../server/voice'
import { MODEL_ID, OUTPUT_FORMAT, VOICES } from '../../server/voices'
import { voiceChoices } from '../../src/content/voices'

const BYTES = new Uint8Array([0x49, 0x44, 0x33, 1, 2, 3, 4])

type Synthesize = (voice: ElevenVoice, text: string, lang: Lang) => Promise<Uint8Array>

/** A fake ElevenLabs synthesizer: `synthesize` records the voice, text and language it was asked for. */
function mockClient(impl?: Synthesize) {
  const synthesize = vi.fn<Synthesize>(impl ?? (() => Promise.resolve(BYTES)))
  const client: Synth = { provider: 'elevenlabs', synthesize }
  return { client, synthesize }
}

/** Deps for the ElevenLabs provider; null means no key is configured. */
const el = (client: Synth | null) => ({ provider: 'elevenlabs' as const, synth: client })

/** A query object written out as a raw query string, keys in the order given. */
function rawOf(query: VoiceQuery): string {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(query)) for (const x of Array.isArray(v) ? v : [v]) p.append(k, String(x))
  return p.toString()
}

/** handleVoice takes the raw query; tests mostly build it from an object. */
const handleVoice = (query: VoiceQuery | string, deps: Parameters<typeof handleRaw>[1]) =>
  handleRaw(typeof query === 'string' ? query : rawOf(query), deps)

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

/** The redirect's canonical query string, raw (without the `?`). */
function canonicalRaw(r: VoiceResult): string {
  expect(r.status).toBe(307)
  return String(r.headers.Location).slice(1)
}

/** Follow the redirect to the canonical, cacheable URL. */
async function fetchClip(query: VoiceQuery, client: Synth | null): Promise<VoiceResult> {
  const first = await handleVoice(query, el(client))
  if (first.status !== 307) return first
  return handleVoice(canonicalRaw(first), el(client))
}

afterEach(() => { vi.restoreAllMocks() })

describe('handleVoice: bad and unknown params', () => {
  const { client, synthesize } = mockClient()
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
      const r = await handleVoice(query, el(client))
      expect(r.status).toBe(400)
      expect(r.headers['Cache-Control']).toBe('no-store')
      expect(JSON.parse(String(r.body))).toEqual({ error: 'bad_request' })
    })
  }

  it('404: unknown era', async () => {
    const r = await handleVoice(q('agra-1600', id, 'en', 1), el(client))
    expect(r.status).toBe(404)
    expect(JSON.parse(String(r.body))).toEqual({ error: 'not_found' })
  })

  it('404: unknown message id in a real era', async () => {
    const r = await handleVoice(q(plain.era, 'no-such-message', 'en', 1), el(client))
    expect(r.status).toBe(404)
  })

  it('404: a real id from a different era', async () => {
    const other = Object.values(SERVER_ERAS).find((e) => e.id !== plain.era && !e.messages.some((m) => m.id === id))!
    const r = await handleVoice(q(other.id, id, 'en', 1), el(client))
    expect(r.status).toBe(404)
  })

  it('bad params are refused before the key is checked, and never reach the provider', async () => {
    expect((await handleVoice(q(plain.era, id, 'fr', 1), el(null))).status).toBe(400)
    expect((await handleVoice(q('agra-1600', id, 'en', 1), el(null))).status).toBe(404)
    expect(synthesize).not.toHaveBeenCalled()
  })
})

describe('handleVoice: text resolution and canonical URLs', () => {
  it('a text without placeholders ignores the day and normalises it to 1', async () => {
    const { client, synthesize } = mockClient()
    const a = location(await handleVoice(q(plain.era, plain.msg.id, 'en', 9), el(client)))
    const b = location(await handleVoice(q(plain.era, plain.msg.id, 'en', 2), el(client)))
    expect(a.day).toBe('1')
    expect(a).toEqual(b) // one cache entry for every day
    const r = await handleVoice(a, el(client))
    expect(r.status).toBe(200)
    expect(synthesize).toHaveBeenCalledTimes(1)
    expect(synthesize.mock.calls[0]![1]).toBe(plain.msg.text.en.trim())
  })

  it('a text with placeholders is filled with that day’s date', async () => {
    const { client, synthesize } = mockClient()
    const era = SERVER_ERAS[dated.era]
    const loc3 = location(await handleVoice(q(dated.era, dated.msg.id, 'en', 3), el(client)))
    const loc4 = location(await handleVoice(q(dated.era, dated.msg.id, 'en', 4), el(client)))
    expect(loc3.day).toBe('3')
    expect(loc4.day).toBe('4')
    expect(loc3.v).not.toBe(loc4.v)
    await handleVoice(loc3, el(client))
    const text = synthesize.mock.calls[0]![1]
    expect(text).toBe(fillTemplate(dated.msg.text.en, dayDate(era, 3), 'en').trim())
    expect(text).not.toMatch(/[{}]/)
  })

  it('reads the Hindi text with language code hi', async () => {
    const { client, synthesize } = mockClient()
    expect((await fetchClip(q(plain.era, plain.msg.id, 'hi', 1), client)).status).toBe(200)
    const [, text, lang] = synthesize.mock.calls[0]!
    expect(lang).toBe('hi')
    expect(text).toBe(plain.msg.text.hi.trim())
  })

  it('a request with a stale version is redirected, not synthesised', async () => {
    const { client, synthesize } = mockClient()
    const r = await handleVoice(q(plain.era, plain.msg.id, 'en', 1, { v: '00000000' }), el(client))
    expect(r.status).toBe(307)
    expect(r.headers['Cache-Control']).toBe(REDIRECT_CACHE)
    expect(synthesize).not.toHaveBeenCalled()
  })

  it('every message in every era resolves, for both languages and every day', () => {
    for (const era of Object.values(SERVER_ERAS)) {
      for (const m of era.messages) {
        for (const lang of ['en', 'hi'] as Lang[]) {
          for (let day = 1; day <= MAX_DAY; day++) {
            const clip = resolveClip(q(era.id, m.id, lang, day), "elevenlabs")
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

describe('handleVoice: only the byte-exact canonical query is served (the CDN caches raw URLs)', () => {
  // Every spelling below decodes to the same clip. Served as audio, each would be its own CDN
  // entry with a year-long immutable header, and its own provider call.
  async function canonical(): Promise<string> {
    return canonicalRaw(await handleVoice(q(plain.era, plain.msg.id, 'en', 1), el(null)))
  }
  const encodeFirst = (raw: string, ch: string, enc: string) => raw.replace(ch, enc)

  it('serves the canonical query itself', async () => {
    const { client, synthesize } = mockClient()
    const r = await handleVoice(await canonical(), el(client))
    expect(r.status).toBe(200)
    expect(r.headers['Cache-Control']).toBe(AUDIO_CACHE)
    expect(synthesize).toHaveBeenCalledTimes(1)
  })

  const variants: [string, (raw: string) => string][] = [
    ['reordered keys', (raw) => raw.split('&').reverse().join('&')],
    ['v moved to the front', (raw) => { const parts = raw.split('&'); return [parts.pop()!, ...parts].join('&') }],
    ['%2D for a hyphen', (raw) => encodeFirst(raw, '-', '%2D')],
    ['%2d for a hyphen', (raw) => encodeFirst(raw, '-', '%2d')],
    ['%64 for a d', (raw) => raw.replace('day=', '%64ay=')],
    ['%65 inside a value', (raw) => raw.replace('lang=en', 'lang=%65n')],
    ['+ for a space in a value', (raw) => raw.replace('lang=en', 'lang=en+')],
    ['a trailing &', (raw) => `${raw}&`],
    ['a leading &', (raw) => `&${raw}`],
    ['an empty key', (raw) => `${raw}&=`],
    ['a leading ?', (raw) => `?${raw}`],
    ['upper-case %-escape of the =', (raw) => raw.replace('lang=', 'lang%3D')],
    ['a duplicate key with the same value', (raw) => `${raw}&lang=en`],
    ['a duplicate key, the copy first', (raw) => `lang=en&${raw}`],
  ]
  for (const [name, spell] of variants) {
    it(`${name}: never an immutable 200, never a provider call`, async () => {
      const { client, synthesize } = mockClient()
      const raw = spell(await canonical())
      const r = await handleVoice(raw, el(client))
      expect(r.status).not.toBe(200)
      expect(r.headers['Cache-Control']).not.toContain('immutable')
      expect([307, 400]).toContain(r.status)
      if (r.status === 307) {
        expect(r.headers['Cache-Control']).toBe(REDIRECT_CACHE)
        expect(r.headers.Location).toBe(`?${await canonical()}`)
      }
      expect(synthesize).not.toHaveBeenCalled()
    })
  }

  it('the decoded variants redirect to the one canonical URL', async () => {
    const canon = await canonical()
    for (const raw of [canon.split('&').reverse().join('&'), encodeFirst(canon, '-', '%2D'), canon.replace('day=', '%64ay=')]) {
      expect(parseQuery(raw)).toEqual(parseQuery(canon)) // the same clip once decoded
      const r = await handleVoice(raw, el(null))
      expect(r.status).toBe(307)
      expect(r.headers.Location).toBe(`?${canon}`)
    }
  })

  it('parses a raw query and turns repeated keys into arrays', () => {
    expect(parseQuery('era=a&id=b&lang=en&day=1')).toEqual({ era: 'a', id: 'b', lang: 'en', day: '1' })
    expect(parseQuery('?era=a&era=b')).toEqual({ era: ['a', 'b'] })
    expect(parseQuery('')).toEqual({})
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

  it('503 with a generic body when the provider fails, and the log leaks nothing', async () => {
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

  it('503 when the provider returns no audio', async () => {
    const { client } = mockClient(() => Promise.resolve(new Uint8Array(0)))
    expect((await fetchClip(q(plain.era, plain.msg.id, 'en', 1), client)).status).toBe(503)
  })

  it('concurrent requests for one clip share one provider call', async () => {
    let release: () => void = () => {}
    const gate = new Promise<void>((r) => { release = r })
    const { client, synthesize } = mockClient(() => gate.then(() => BYTES))
    const canon = canonicalRaw(await handleVoice(q(plain.era, plain.msg.id, 'en', 1), el(client)))
    const both = Promise.all([handleVoice(canon, el(client)), handleVoice(canon, el(client))])
    release()
    const [a, b] = await both
    expect(a.status).toBe(200)
    expect(b.status).toBe(200)
    expect(synthesize).toHaveBeenCalledTimes(1)
  })
})

describe('one voice: Dastango everywhere, guest slot off', () => {
  it('every era is read by the Dastango voice', async () => {
    for (const eraId of Object.keys(SERVER_ERAS) as EraId[]) {
      const { client, synthesize } = mockClient()
      const msg = SERVER_ERAS[eraId].messages[0]!
      expect((await fetchClip(q(eraId, msg.id, 'hi', 1), client)).status).toBe(200)
      const [voice, , lang] = synthesize.mock.calls[0]!
      expect(voice).toBe(VOICES.dastango.elevenlabs)
      expect(lang).toBe('hi')
    }
  })

  it('Dastango is the default: the canonical URL has no voice parameter', async () => {
    const { client, synthesize } = mockClient()
    const canon = location(await handleVoice(q(plain.era, plain.msg.id, 'en', 1), el(client)))
    expect(canon.voice).toBeUndefined()
    // An explicit voice=dastango redirects to the same plain URL.
    const r = await handleVoice({ ...canon, voice: 'dastango' }, el(client))
    expect(location(r)).toEqual(canon)
    expect(synthesize).not.toHaveBeenCalled()
  })

  it('the guest voice answers 404 while it is disabled', async () => {
    expect(VOICES.guest.enabled).toBe(false)
    expect(VOICES.guest.fish).toBeUndefined()
    expect(VOICES.guest.elevenlabs).toBeUndefined()
    const { client, synthesize } = mockClient()
    const r = await handleVoice(q(plain.era, plain.msg.id, 'en', 1, { voice: 'guest' }), el(client))
    expect(r.status).toBe(404)
    expect(synthesize).not.toHaveBeenCalled()
  })

  const badVoices: [string, unknown][] = [
    ['the old era voice', 'era'],
    ['unknown voice', 'narrator'],
    ['empty voice', ''],
    ['upper case', 'DASTANGO'],
    ['repeated voice', ['dastango', 'guest']],
    ['too long', 'd'.repeat(40)],
  ]
  for (const [name, value] of badVoices) {
    it(`400: ${name}`, async () => {
      const r = await handleVoice(q(plain.era, plain.msg.id, 'en', 1, { voice: value }), el(null))
      expect(r.status).toBe(400)
    })
  }

  it('the cache hash includes the voice', () => {
    const voice = VOICES.dastango.elevenlabs!
    const a = revision('elevenlabs', 'dastango', voice, 'en', 'same text')
    const b = revision('elevenlabs', 'guest', voice, 'en', 'same text')
    const c = revision('elevenlabs', 'dastango', { ...voice, voiceId: 'x'.repeat(20) }, 'en', 'same text')
    expect(a).toMatch(/^[0-9a-f]{8}$/)
    expect(b).not.toBe(a) // a different voice name
    expect(c).not.toBe(a) // a different model behind the same name
  })

  it('offers only enabled voices to a picker', () => {
    expect(voiceChoices()).toEqual(['dastango'])
  })

  it('Dastango has a model on both providers, with valid settings', () => {
    const v = VOICES.dastango
    expect(v.label.en && v.label.hi).toBeTruthy()
    expect(v.elevenlabs?.voiceId).toMatch(/^[A-Za-z0-9]{20}$/)
    expect(v.fish?.referenceId).toMatch(/^[0-9a-f]{32}$/)
    expect(Object.keys(v.elevenlabs!.settings).sort()).toEqual(['similarityBoost', 'stability'])
    for (const n of Object.values(v.elevenlabs!.settings)) expect(n >= 0 && n <= 1).toBe(true)
  })

  it('uses eleven_v4 and small MP3s on ElevenLabs', () => {
    expect(MODEL_ID).toBe('eleven_v4')
    expect(OUTPUT_FORMAT).toBe('mp3_44100_64')
  })
})
