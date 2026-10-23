// Read-aloud voices. One voice, the Dastango storyteller, reads every era; a guest voice can be
// added later. Shared by the game (labels, credits) and the voice server (provider ids, settings).
// Voice ids are public provider ids, not secrets.
//
// A guest voice of a real person is added only with that person's verifiable permission, and must
// carry a `credit` line, which the game shows whenever that voice is selected. Never add a voice
// that clones or imitates anyone without that permission.
import type { L10n } from './types.js'

/** An ElevenLabs voice (kept for later; the default provider is Fish Audio). */
export interface ElevenVoice {
  voiceId: string
  /** Library name, so a reader knows which voice it is without an API call. */
  voiceName: string
  /** Eleven v4 takes only stability and similarity boost. */
  settings: { stability: number; similarityBoost: number }
  /** Ids from GET /v1/audio-effects/catalog (checked 2026-10-24). */
  effects?: { filterPresetId?: string; environmentId?: string; sendLevel?: number; distance?: number }
}

/** A Fish Audio voice model. */
export interface FishVoice {
  /** Voice model id (`reference_id`). */
  referenceId: string
  /** Model title, so a reader knows which voice it is without an API call. */
  title: string
  /** 0–1, default 0.7: higher is more expressive. */
  temperature?: number
  /** 0.5–2, default 1. */
  speed?: number
}

export interface ProviderVoices {
  elevenlabs?: ElevenVoice
  fish?: FishVoice
}

export interface VoiceConfig extends ProviderVoices {
  label: L10n
  /** Required for any voice used with a person's permission; shown in the game. */
  credit?: string
  /** False until the voice is ready. A disabled voice is answered 404 and hidden in the game. */
  enabled: boolean
}

const CONFIG = {
  dastango: {
    // A dastango tells dastans, long stories, by lamplight: deep, theatrical Hindustani.
    // Chosen from the voice libraries by generic traits only (mature male storyteller).
    label: { en: 'Dastango', hi: 'दास्तानगो' },
    enabled: true,
    // Fish library voice with a generic title ("elder inspiration"), kept by the owner after
    // listening to the samples. Swap by changing this one id.
    fish: { referenceId: '65d76b8dc9be4ac78bbf77a93f2227b9', title: 'बुजुर्ग प्रेरणा', temperature: 0.8, speed: 0.92 },
    // ElevenLabs alternatives: YkAJCvEzSQvG7K2YK9kx (Bharadwaj - Deep, Expressive), NAuCjDa0V2FYHGI2F2CS (Kabir - Serious, Calm and Raspy).
    elevenlabs: {
      voiceId: 'iBRcUZbbi4hxPMzDCm71',
      voiceName: 'Grandpa Danish - Rasped and Nostalgic',
      settings: { stability: 0.4, similarityBoost: 0.8 },
      effects: { environmentId: 'small_room', sendLevel: 0.18 },
    },
  },
  // Slot for a guest voice, used only after its owner's permission is verified. Until then it
  // stays disabled with no model id. To turn it on: `enabled: true`, the provider model id(s)
  // and the credit line, e.g. credit: 'Voice: <name> (with permission)'.
  guest: {
    label: { en: 'Guest voice', hi: 'मेहमान आवाज़' },
    enabled: false,
    credit: '',
  },
} satisfies Record<string, VoiceConfig>

export type VoiceChoice = keyof typeof CONFIG
export const VOICES: Readonly<Record<VoiceChoice, VoiceConfig>> = CONFIG
/** The voice for every era unless the player picks another. */
export const DEFAULT_VOICE: VoiceChoice = 'dastango'

/** A known voice name (enabled or not). */
export function isVoiceChoice(v: string): v is VoiceChoice {
  return Object.prototype.hasOwnProperty.call(VOICES, v)
}

/** The voices a picker should offer, in order. */
export function voiceChoices(): VoiceChoice[] {
  return (Object.keys(VOICES) as VoiceChoice[]).filter((id) => VOICES[id].enabled)
}
