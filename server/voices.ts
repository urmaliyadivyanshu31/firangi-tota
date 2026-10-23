// Era voices for read-aloud. Server only: nothing here may be imported by browser code.
// Voice ids are public ElevenLabs Voice Library ids, not secrets, so they live in the repo.
// The key never does: the SDK reads ELEVENLABS_API_KEY on the server.
import type { EraId } from '../src/content/types.js'

/** One model for every era: it speaks Hindi and English with the same voice. */
export const MODEL_ID = 'eleven_v4'

/** Small MP3s keep phones fast; speech does not need more than 64 kbps. */
export const OUTPUT_FORMAT = 'mp3_44100_64'

export interface EraVoice {
  /** Who the listener should hear. */
  character: string
  /** ElevenLabs voice id (Voice Library). */
  voiceId: string
  /** Library name, so a reader of this file knows which voice it is without an API call. */
  voiceName: string
  /** Eleven v4 only takes stability and similarity boost (no style or speed). */
  settings: { stability: number; similarityBoost: number }
  /**
   * Optional audio effects. Ids come from GET /v1/audio-effects/catalog (checked 2026-10-24):
   * filters old_radio, phone, cheap_microphone...; environments small_room, big_room, hall...
   */
  effects?: {
    filterPresetId?: string
    environmentId?: string
    sendLevel?: number
    distance?: number
  }
}

export const ERA_VOICES: Record<EraId, EraVoice> = {
  'delhi-1857': {
    character: 'An older court munshi: warm, measured, Urdu-inflected Hindustani',
    // Swap the voice by changing this one id (and voiceName).
    // Alternatives: iLpGCYkFnnGoa4bBSlqm (Nazir Qureshi), iBRcUZbbi4hxPMzDCm71 (Grandpa Danish).
    voiceId: 'r3CPEby3BZ6hrPxHG8h2',
    voiceName: 'Danish Khan - Expressive, Dramatic Voice',
    settings: { stability: 0.6, similarityBoost: 0.75 },
    // A small, soft room: the munshi reads at his desk in the darbar office.
    effects: { environmentId: 'small_room', sendLevel: 0.25, distance: 0.15 },
  },
  'lahore-1929': {
    character: 'A young, earnest, fiery Punjabi man',
    // Swap the voice by changing this one id (and voiceName).
    // Alternatives: fBXc7vfuym7wUXyB57Eo (Jaskirat), VZBBHbCLrSUawfOmZkE5 (Aryaveer).
    voiceId: 'RxnH5jCRKb1ez2lcmQC1',
    voiceName: 'Pind Punjabi - Energetic and Encouraging',
    // Lower stability gives more fire and range.
    settings: { stability: 0.35, similarityBoost: 0.8 },
  },
  'bombay-1942': {
    character: 'A woman announcer of the secret Congress Radio, heard through an old set',
    // Swap the voice by changing this one id (and voiceName).
    // Alternatives: YJpPt0sBEgMzYwcMkF5o (Sia), y2H4TwIU5I2L0JXOdBeX (Kanika).
    voiceId: 'HSdLdxNgP1KF3yQK3IkB',
    voiceName: 'Vidya - News Reporter',
    settings: { stability: 0.55, similarityBoost: 0.75 },
    effects: { filterPresetId: 'old_radio' },
  },
  'delhi-1947': {
    character: 'A crisp, measured Indian official reading telegrams',
    // Swap the voice by changing this one id (and voiceName).
    // Alternatives: ltvR0942IpmQjl5QbXL1 (Amit Gupta, Prime Time News), M1baVR22tUikfDMapkh7 (Shivank S).
    voiceId: 'l1CrgWMeEfm3xvPbn4YE',
    voiceName: 'Raqib - News Reporter',
    // High stability: steady and official, never theatrical.
    settings: { stability: 0.8, similarityBoost: 0.6 },
    // A faint room tone, as if read in a government office.
    effects: { environmentId: 'small_room', sendLevel: 0.12 },
  },
}
