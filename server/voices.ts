// Era voices for read-aloud, per provider. Server only: nothing here may be imported by browser code.
// Voice ids are public provider ids, not secrets, so they live in the repo. Keys never do.
// Alternate voices for every chapter (Dastango, a future licensed guest) live in
// src/content/voices.ts, because the game shows their labels and credits.
import type { EraId } from '../src/content/types.js'
import { ALT_VOICES, type ElevenVoice, type FishVoice, type ProviderVoices, type VoiceChoice } from '../src/content/voices.js'

export { ALT_VOICES }

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

export interface EraVoice extends ProviderVoices {
  /** Who the listener should hear. */
  character: string
  fish: FishVoice
  elevenlabs: ElevenVoice
}

// Fish voices are interim picks from the public library with generic, descriptive titles and
// descriptions that name no one. They are to be replaced by Voice Design models (original
// characters from a text description) once the Fish account has API credit.
// Fish has no audio effects, so the 1942 old-radio sound comes from the client (Web Audio
// band-pass) when Fish is the provider; ElevenLabs applies `old_radio` itself.
export const ERA_VOICES: Record<EraId, EraVoice> = {
  'delhi-1857': {
    character: 'An older court munshi: warm, measured, Urdu-inflected Hindustani',
    // Swap a voice by changing one id. Fish alternative: 51bea9fdaaa04d4c8b9f5499cfb2a52f (शांत अनुभवी आवाज़).
    fish: { referenceId: '0ba6a433d89b493c97c7dd744638ffe8', title: 'ज्ञानपूर्ण मार्गदर्शक आवाज़', temperature: 0.6, speed: 0.95 },
    // ElevenLabs alternatives: iLpGCYkFnnGoa4bBSlqm (Nazir Qureshi), iBRcUZbbi4hxPMzDCm71 (Grandpa Danish).
    elevenlabs: {
      voiceId: 'r3CPEby3BZ6hrPxHG8h2',
      voiceName: 'Danish Khan - Expressive, Dramatic Voice',
      settings: { stability: 0.6, similarityBoost: 0.75 },
      effects: { environmentId: 'small_room', sendLevel: 0.25, distance: 0.15 },
    },
  },
  'lahore-1929': {
    character: 'A young, earnest, fiery Punjabi man',
    fish: { referenceId: 'fbdce7b58fbb4ea8bd230bbc0c4d9cfa', title: 'Punjab', temperature: 0.8 },
    // ElevenLabs alternatives: fBXc7vfuym7wUXyB57Eo (Jaskirat), VZBBHbCLrSUawfOmZkE5 (Aryaveer).
    elevenlabs: {
      voiceId: 'RxnH5jCRKb1ez2lcmQC1',
      voiceName: 'Pind Punjabi - Energetic and Encouraging',
      settings: { stability: 0.35, similarityBoost: 0.8 },
    },
  },
  'bombay-1942': {
    character: 'A woman announcer of the secret Congress Radio, heard through an old set',
    fish: { referenceId: '4dcad49db8a14538af3b657d944c187e', title: 'Female Model', temperature: 0.6 },
    // ElevenLabs alternatives: YJpPt0sBEgMzYwcMkF5o (Sia), y2H4TwIU5I2L0JXOdBeX (Kanika).
    elevenlabs: {
      voiceId: 'HSdLdxNgP1KF3yQK3IkB',
      voiceName: 'Vidya - News Reporter',
      settings: { stability: 0.55, similarityBoost: 0.75 },
      effects: { filterPresetId: 'old_radio' },
    },
  },
  'delhi-1947': {
    character: 'A crisp, measured Indian official reading telegrams',
    fish: { referenceId: '407bc81e1be54fbcac6fd0d6bfda36fa', title: 'वरिष्ठ तकनीकी स्वर', temperature: 0.5 },
    // ElevenLabs alternatives: ltvR0942IpmQjl5QbXL1 (Amit Gupta, Prime Time News), M1baVR22tUikfDMapkh7 (Shivank S).
    elevenlabs: {
      voiceId: 'l1CrgWMeEfm3xvPbn4YE',
      voiceName: 'Raqib - News Reporter',
      settings: { stability: 0.8, similarityBoost: 0.6 },
      effects: { environmentId: 'small_room', sendLevel: 0.12 },
    },
  },
}

export type ProviderVoice<P extends ProviderId> = P extends 'fish' ? FishVoice : ElevenVoice

/** The provider's voice for `era` when the player picked `choice`, or null if it has none. */
export function voiceFor<P extends ProviderId>(era: EraId, choice: VoiceChoice, provider: P): ProviderVoice<P> | null {
  const entry: ProviderVoices = choice === 'era' ? ERA_VOICES[era] : ALT_VOICES[choice]
  return (entry[provider] as ProviderVoice<P> | undefined) ?? null
}

export function parseProvider(v: string | undefined): ProviderId {
  const p = (v ?? '').trim().toLowerCase()
  return (PROVIDERS as readonly string[]).includes(p) ? (p as ProviderId) : DEFAULT_PROVIDER
}
