// GET /api/voice: one game message, read aloud in its era's voice.
//
// Server only. The browser never sees the ElevenLabs key, and this endpoint never accepts free
// text: it takes an era, a message id, a language, a day and an optional voice (the chapter's
// own voice by default, or an alternate such as Dastango), and reads our own message. Every
// valid URL maps to one fixed clip, so the set of clips is finite and each is generated once,
// then cached by the CDN and the browser.
//
// Cache busting: the audio URL carries `v`, a short hash of the exact text and voice settings.
// A request without the right `v` (or with a day the text does not depend on) gets a cheap
// redirect to the canonical URL. So a fact-check fix or a voice swap changes the URL instead of
// leaving a year-long cached clip that reads the old words.
import type { ElevenLabs } from '@elevenlabs/elevenlabs-js'
import type { Era, Lang, Message } from '../src/content/types.js'
import { dayDate, fillTemplate } from '../src/game/dates.js'
import { isEraId, SERVER_ERAS } from './eras.js'
import { isVoiceChoice, type VoiceChoice, type VoiceSpec } from '../src/content/voices.js'
import { MODEL_ID, OUTPUT_FORMAT, voiceFor } from './voices.js'

/** The slice of ElevenLabsClient this handler uses, so tests can pass a mock. */
export interface TtsClient {
  textToSpeech: {
    convert(
      voiceId: string,
      request: ElevenLabs.BodyTextToSpeechFull,
      requestOptions?: { timeoutInSeconds?: number; maxRetries?: number },
    ): PromiseLike<ReadableStream<Uint8Array>>
  }
}

export interface VoiceDeps {
  /** null when ELEVENLABS_API_KEY is not set: the endpoint answers 503. */
  client: TtsClient | null
  now?: () => number
}

/** Query parameters, as parsed by the dev server or the Vercel function. */
export type VoiceQuery = Readonly<Record<string, unknown>>

export interface VoiceResult {
  status: number
  headers: Record<string, string>
  body: Uint8Array | string
}

export const MAX_DAY = 14
/** Longer texts are refused before they reach ElevenLabs (our messages are far shorter). */
export const MAX_TEXT_CHARS = 3000
const MAX_AUDIO_BYTES = 5 * 1024 * 1024
const UPSTREAM_TIMEOUT_S = 25

export const AUDIO_CACHE = 'public, max-age=31536000, s-maxage=31536000, immutable'
/** Redirects are cheap and must follow content fixes quickly, so the CDN keeps them 5 minutes. */
export const REDIRECT_CACHE = 'public, max-age=0, s-maxage=300'

const ALLOWED = new Set(['era', 'id', 'lang', 'day', 'voice', 'v'])
const ERA_RE = /^[a-z0-9][a-z0-9-]{0,39}$/
const ID_RE = /^[a-z0-9][a-z0-9-]{0,79}$/
const DAY_RE = /^(?:[1-9]|1[0-4])$/
const REV_RE = /^[0-9a-f]{8}$/
const VOICE_RE = /^[a-z][a-z0-9-]{0,31}$/

function fail(status: 400 | 404 | 503, error: string): VoiceResult {
  return {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
    body: JSON.stringify({ error }),
  }
}

const bad = () => fail(400, 'bad_request')
const notFound = () => fail(404, 'not_found')
const unavailable = () => fail(503, 'voice_unavailable')

function single(q: VoiceQuery, key: string): string | undefined {
  const v = q[key]
  return typeof v === 'string' ? v : undefined
}

/** True when the text uses {date}/{weekday} placeholders, so the clip depends on the day. */
function dependsOnDay(era: Era, template: string, lang: Lang): boolean {
  // A filled placeholder always becomes a date or weekday, never the placeholder itself.
  return fillTemplate(template, dayDate(era, 1), lang) !== template
}

/** FNV-1a, 32 bit. Not for security: it only versions cache URLs. */
function fnv1a(s: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(16).padStart(8, '0')
}

export function revision(choice: VoiceChoice, voice: VoiceSpec, lang: Lang, text: string): string {
  return fnv1a(JSON.stringify([MODEL_ID, OUTPUT_FORMAT, choice, voice.voiceId, voice.settings, voice.effects ?? null, lang, text]))
}

export interface ResolvedClip {
  era: Era
  message: Message
  lang: Lang
  /** 1 when the text does not depend on the day. */
  day: number
  text: string
  /** 'era' (the chapter's own voice) or an alternate voice id. */
  choice: VoiceChoice
  voice: VoiceSpec
  rev: string
}

/** The exact clip a valid request asks for, or the error to answer with. */
export function resolveClip(query: VoiceQuery): ResolvedClip | VoiceResult {
  for (const key of Object.keys(query)) if (!ALLOWED.has(key)) return bad()
  const eraId = single(query, 'era')
  const id = single(query, 'id')
  const lang = single(query, 'lang')
  const dayRaw = single(query, 'day')
  const v = query.v === undefined ? undefined : single(query, 'v')
  if (!eraId || !ERA_RE.test(eraId)) return bad()
  if (!id || !ID_RE.test(id)) return bad()
  if (lang !== 'hi' && lang !== 'en') return bad()
  if (!dayRaw || !DAY_RE.test(dayRaw)) return bad()
  if (query.v !== undefined && (!v || !REV_RE.test(v))) return bad()
  const choiceRaw = query.voice === undefined ? 'era' : single(query, 'voice')
  if (!choiceRaw || !VOICE_RE.test(choiceRaw) || !isVoiceChoice(choiceRaw)) return bad()

  if (!isEraId(eraId)) return notFound()
  const era = SERVER_ERAS[eraId]
  const message = era.messages.find((m) => m.id === id)
  if (!message) return notFound()

  const template = message.text[lang]
  const day = dependsOnDay(era, template, lang) ? Number(dayRaw) : 1
  const text = fillTemplate(template, dayDate(era, day), lang).trim()
  // Our own content is always within the limit (a test checks every message); refuse, never truncate.
  if (!text || text.length > MAX_TEXT_CHARS) return unavailable()
  const voice = voiceFor(eraId, choiceRaw)
  return { era, message, lang, day, text, choice: choiceRaw, voice, rev: revision(choiceRaw, voice, lang, text) }
}

/** The canonical query for a clip. `voice` appears only for an alternate voice. */
export function canonicalParams(c: Pick<ResolvedClip, 'era' | 'message' | 'lang' | 'day' | 'choice' | 'rev'>): Record<string, string> {
  return {
    era: c.era.id,
    id: c.message.id,
    lang: c.lang,
    day: String(c.day),
    ...(c.choice === 'era' ? {} : { voice: c.choice }),
    v: c.rev,
  }
}

export function canonicalQuery(c: Pick<ResolvedClip, 'era' | 'message' | 'lang' | 'day' | 'choice' | 'rev'>): string {
  return `?${new URLSearchParams(canonicalParams(c)).toString()}`
}

/** True when the request is exactly the canonical URL (same keys, same values). */
function isCanonical(query: VoiceQuery, clip: ResolvedClip): boolean {
  const want = canonicalParams(clip)
  const keys = Object.keys(query)
  return keys.length === Object.keys(want).length && keys.every((k) => single(query, k) === want[k])
}

async function readAll(stream: ReadableStream<Uint8Array>): Promise<Uint8Array> {
  const reader = stream.getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.byteLength
    if (total > MAX_AUDIO_BYTES) {
      void reader.cancel()
      throw new Error('audio too large')
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

function synthesize(client: TtsClient, clip: ResolvedClip): Promise<Uint8Array> {
  const { voice } = clip
  const request: ElevenLabs.BodyTextToSpeechFull = {
    text: clip.text,
    modelId: MODEL_ID,
    languageCode: clip.lang,
    applyTextNormalization: 'on',
    outputFormat: OUTPUT_FORMAT,
    voiceSettings: { stability: voice.settings.stability, similarityBoost: voice.settings.similarityBoost },
    ...(voice.effects ? { audioEffects: { ...voice.effects } } : {}),
  }
  return Promise.resolve(
    client.textToSpeech.convert(voice.voiceId, request, { timeoutInSeconds: UPSTREAM_TIMEOUT_S, maxRetries: 1 }),
  ).then(readAll)
}

// Concurrent requests for the same clip on one server instance share one ElevenLabs call
// (for example everyone opening the daily puzzle at once before the CDN has the clip).
const inflight = new Map<string, Promise<Uint8Array>>()

function upstreamStatus(err: unknown): number | undefined {
  const s = (err as { statusCode?: unknown } | null)?.statusCode
  return typeof s === 'number' ? s : undefined
}

export async function handleVoice(query: VoiceQuery, deps: VoiceDeps): Promise<VoiceResult> {
  const clip = resolveClip(query)
  if ('status' in clip) return clip

  if (!isCanonical(query, clip)) {
    return {
      status: 307,
      headers: { Location: canonicalQuery(clip), 'Cache-Control': REDIRECT_CACHE },
      body: '',
    }
  }

  const { client } = deps
  if (!client) return unavailable()

  const now = deps.now ?? Date.now
  const started = now()
  const key = `${clip.era.id}|${clip.message.id}|${clip.lang}|${clip.day}|${clip.choice}|${clip.rev}`
  let job = inflight.get(key)
  if (!job) {
    job = synthesize(client, clip)
    inflight.set(key, job)
    const clear = () => { inflight.delete(key) }
    job.then(clear, clear)
  }

  let audio: Uint8Array
  try {
    audio = await job
  } catch (err) {
    // Log only what helps and leaks nothing: never the error object, its body or any header.
    console.warn(`[voice] ElevenLabs failed era=${clip.era.id} id=${clip.message.id} lang=${clip.lang} voice=${clip.choice} status=${upstreamStatus(err) ?? 'none'}`)
    return unavailable()
  }
  if (audio.byteLength === 0) return unavailable()

  return {
    status: 200,
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': AUDIO_CACHE,
      'Content-Length': String(audio.byteLength),
      'X-Content-Type-Options': 'nosniff',
      'Server-Timing': `tts;dur=${Math.max(0, Math.round(now() - started))}`,
    },
    body: audio,
  }
}
