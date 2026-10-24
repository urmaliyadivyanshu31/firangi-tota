// GET /api/voice: one game message, read aloud in its era's voice.
//
// Server only. The browser never sees a provider key, and this endpoint never accepts free
// text: it takes an era, a message id, a language, a day and an optional voice (the Dastango
// storyteller by default, or a guest voice once enabled), and reads our own message. Every
// valid URL maps to one fixed clip, so the set of clips is finite and each is generated once,
// then cached by the CDN and the browser.
//
// Cache busting: the audio URL carries `v`, a short hash of the provider, model, voice and exact
// text. A request without the right `v` (or with a day the text does not depend on) gets a cheap
// redirect to the canonical URL. So a fact-check fix, a voice swap or a provider switch changes
// the URL instead of leaving a year-long cached clip that reads the old words.
//
// The CDN caches by the raw URL, so audio is served only when the raw query string equals the
// canonical one byte for byte. Reordered keys, percent-encoded letters (`%2D`, `%64`), `+` or
// anything else that decodes to the same clip gets the short-lived redirect instead: otherwise
// every spelling of one clip would be a fresh cache entry, a fresh provider call and a fresh bill.
import type { Era, Lang, Message } from '../src/content/types.js'
import { DEFAULT_VOICE, isVoiceChoice, type ElevenVoice, type FishVoice, type VoiceChoice } from '../src/content/voices.js'
import { dayDate, fillTemplate } from '../src/game/dates.js'
import { isEraId, SERVER_ERAS } from './eras.js'
import type { Synth } from './providers.js'
import { FISH_MODEL, FISH_MP3_BITRATE, MODEL_ID, OUTPUT_FORMAT, voiceFor, type ProviderId } from './voices.js'

export type { Synth } from './providers.js'

export interface VoiceDeps {
  /** The active provider. It is part of every cache key, even when no key is configured. */
  provider: ProviderId
  /** null when the provider's key is not set: audio requests answer 503. */
  synth: Synth | null
  now?: () => number
}

/** Query parameters, decoded. A repeated key becomes an array (and is refused). */
export type VoiceQuery = Readonly<Record<string, unknown>>

export interface VoiceResult {
  status: number
  headers: Record<string, string>
  body: Uint8Array | string
}

export const MAX_DAY = 14
/** Longer texts are refused before they reach a provider (our messages are far shorter). */
export const MAX_TEXT_CHARS = 3000

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

const MODEL_OF: Record<ProviderId, string> = {
  fish: `${FISH_MODEL}/mp3-${FISH_MP3_BITRATE}`,
  elevenlabs: `${MODEL_ID}/${OUTPUT_FORMAT}`,
}

export function revision(provider: ProviderId, choice: VoiceChoice, voice: FishVoice | ElevenVoice, lang: Lang, text: string): string {
  return fnv1a(JSON.stringify([provider, MODEL_OF[provider], choice, voice, lang, text]))
}

export interface ResolvedClip {
  era: Era
  message: Message
  lang: Lang
  /** 1 when the text does not depend on the day. */
  day: number
  text: string
  /** 'dastango' (every era's voice) or 'guest'. */
  choice: VoiceChoice
  provider: ProviderId
  voice: FishVoice | ElevenVoice
  rev: string
}

/** The exact clip a valid request asks for under `provider`, or the error to answer with. */
export function resolveClip(query: VoiceQuery, provider: ProviderId): ResolvedClip | VoiceResult {
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
  const choice = query.voice === undefined ? DEFAULT_VOICE : single(query, 'voice')
  if (!choice || !VOICE_RE.test(choice) || !isVoiceChoice(choice)) return bad()

  if (!isEraId(eraId)) return notFound()
  const era = SERVER_ERAS[eraId]
  const message = era.messages.find((m) => m.id === id)
  if (!message) return notFound()
  const voice = voiceFor(choice, provider)
  if (!voice) return notFound() // a disabled voice (the guest slot), or none on this provider

  const template = message.text[lang]
  const day = dependsOnDay(era, template, lang) ? Number(dayRaw) : 1
  const text = fillTemplate(template, dayDate(era, day), lang).trim()
  // Our own content is always within the limit (a test checks every message); refuse, never truncate.
  if (!text || text.length > MAX_TEXT_CHARS) return unavailable()
  return { era, message, lang, day, text, choice, provider, voice, rev: revision(provider, choice, voice, lang, text) }
}

/** The canonical query for a clip. `voice` appears only when it is not the default. */
export function canonicalParams(c: Pick<ResolvedClip, 'era' | 'message' | 'lang' | 'day' | 'choice' | 'rev'>): Record<string, string> {
  return {
    era: c.era.id,
    id: c.message.id,
    lang: c.lang,
    day: String(c.day),
    ...(c.choice === DEFAULT_VOICE ? {} : { voice: c.choice }),
    v: c.rev,
  }
}

/** The canonical query string, with its leading `?` (the redirect's relative Location). */
export function canonicalQuery(c: Pick<ResolvedClip, 'era' | 'message' | 'lang' | 'day' | 'choice' | 'rev'>): string {
  return `?${new URLSearchParams(canonicalParams(c)).toString()}`
}

/** Decodes a raw query string (with or without its `?`); a repeated key becomes an array. */
export function parseQuery(raw: string): Record<string, string | string[]> {
  const params = new URLSearchParams(raw)
  const query: Record<string, string | string[]> = {}
  for (const key of new Set(params.keys())) {
    const all = params.getAll(key)
    query[key] = all.length === 1 ? all[0]! : all
  }
  return query
}

function synthesize(synth: Synth, clip: ResolvedClip): Promise<Uint8Array> {
  // resolveClip picked `voice` for clip.provider, and handleVoice checked synth.provider matches.
  return synth.provider === 'fish'
    ? synth.synthesize(clip.voice as FishVoice, clip.text, clip.lang)
    : synth.synthesize(clip.voice as ElevenVoice, clip.text, clip.lang)
}

// Concurrent requests for the same clip on one server instance share one provider call
// (for example everyone opening the daily puzzle at once before the CDN has the clip).
const inflight = new Map<string, Promise<Uint8Array>>()

function upstreamStatus(err: unknown): number | undefined {
  const s = (err as { statusCode?: unknown } | null)?.statusCode
  return typeof s === 'number' ? s : undefined
}

/**
 * Answers one request. `rawQuery` is the query string exactly as received, without the `?` and
 * undecoded: only the canonical spelling is ever answered with audio.
 */
export async function handleVoice(rawQuery: string, deps: VoiceDeps): Promise<VoiceResult> {
  const clip = resolveClip(parseQuery(rawQuery), deps.provider)
  if ('status' in clip) return clip

  if (rawQuery !== canonicalQuery(clip).slice(1)) {
    return {
      status: 307,
      headers: { Location: canonicalQuery(clip), 'Cache-Control': REDIRECT_CACHE },
      body: '',
    }
  }

  const { synth } = deps
  if (!synth || synth.provider !== deps.provider) return unavailable()

  const now = deps.now ?? Date.now
  const started = now()
  const key = `${clip.provider}|${clip.era.id}|${clip.message.id}|${clip.lang}|${clip.day}|${clip.choice}|${clip.rev}`
  let job = inflight.get(key)
  if (!job) {
    job = synthesize(synth, clip)
    inflight.set(key, job)
    const clear = () => { inflight.delete(key) }
    job.then(clear, clear)
  }

  let audio: Uint8Array
  try {
    audio = await job
  } catch (err) {
    // Log only what helps and leaks nothing: never the error object, its body or any header.
    console.warn(`[voice] ${clip.provider} failed era=${clip.era.id} id=${clip.message.id} lang=${clip.lang} voice=${clip.choice} status=${upstreamStatus(err) ?? 'none'}`)
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
