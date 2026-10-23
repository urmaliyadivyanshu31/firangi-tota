// Read-aloud voice settings per provider. Server only: nothing here may be imported by browser code.
// There are no per-era voices: the Dastango storyteller reads every era (src/content/voices.ts,
// which the game also reads for labels and credits). Voice ids are public; keys never live here.
import { VOICES, type ElevenVoice, type FishVoice, type VoiceChoice } from '../src/content/voices.js'

export { VOICES }

export type ProviderId = 'fish' | 'elevenlabs'
export const PROVIDERS: readonly ProviderId[] = ['fish', 'elevenlabs']
export const DEFAULT_PROVIDER: ProviderId = 'fish'

/** Fish Audio: S2.1-Pro on the free tier ($0), same quality as s2.1-pro without latency guarantees. */
export const FISH_MODEL = 's2.1-pro-free'
/** ElevenLabs: one model speaks Hindi and English with the same voice. */
export const MODEL_ID = 'eleven_v4'
/** Small MP3s keep phones fast; speech does not need more than 64 kbps. */
export const OUTPUT_FORMAT = 'mp3_44100_64'
export const FISH_MP3_BITRATE = 64

export type ProviderVoice<P extends ProviderId> = P extends 'fish' ? FishVoice : ElevenVoice

/** The provider's model for `choice`, or null if the voice is disabled or has none there. */
export function voiceFor<P extends ProviderId>(choice: VoiceChoice, provider: P): ProviderVoice<P> | null {
  const entry = VOICES[choice]
  if (!entry.enabled) return null
  return (entry[provider] as ProviderVoice<P> | undefined) ?? null
}

export function parseProvider(v: string | undefined): ProviderId {
  const p = (v ?? '').trim().toLowerCase()
  return (PROVIDERS as readonly string[]).includes(p) ? (p as ProviderId) : DEFAULT_PROVIDER
}
