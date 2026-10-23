// Alternate read-aloud voices, usable in every chapter. Shared by the game (labels, credits) and
// the voice server (provider ids, settings). Voice ids are public provider ids, not secrets.
//
// Adding a voice is config only: fill an entry below. A voice used with someone's permission
// must carry a `credit` line, which the game shows whenever that voice is selected.
// Never add a voice that clones or imitates a real person without their written permission.
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

export interface AltVoice extends ProviderVoices {
  label: L10n
  /** Required for any voice used with a person's permission; shown in the game. */
  credit?: string
  /** A slot that is not ready yet. Disabled voices are refused by the server and hidden in the game. */
  enabled: boolean
}

const CONFIG = {
  dastango: {
    // A dastango tells dastans, long stories, by lamplight: deep, gravelly, theatrical Hindustani.
    // Chosen from the voice libraries by generic traits only (mature male storyteller).
    label: { en: 'Dastango', hi: 'दास्तानगो' },
    enabled: true,
    // Interim Fish library voice with a generic title ("elder inspiration"); replace with a
    // Voice Design model once the Fish account has API credit.
    fish: { referenceId: '65d76b8dc9be4ac78bbf77a93f2227b9', title: 'बुजुर्ग प्रेरणा', temperature: 0.8, speed: 0.92 },
    // ElevenLabs alternatives: YkAJCvEzSQvG7K2YK9kx (Bharadwaj - Deep, Expressive), NAuCjDa0V2FYHGI2F2CS (Kabir - Serious, Calm and Raspy).
    elevenlabs: {
      voiceId: 'iBRcUZbbi4hxPMzDCm71',
      voiceName: 'Grandpa Danish - Rasped and Nostalgic',
      settings: { stability: 0.4, similarityBoost: 0.8 },
      effects: { environmentId: 'small_room', sendLevel: 0.18 },
    },
  },
  // Slot for a future voice used with written permission. To turn it on: set `enabled: true`,
  // the provider id(s) and the credit, e.g. credit: 'Voice: <name> (with permission)'.
  guest: {
    label: { en: 'Guest voice', hi: 'मेहमान आवाज़' },
    enabled: false,
    credit: '',
  },
} satisfies Record<string, AltVoice>

export type AltVoiceId = keyof typeof CONFIG
export const ALT_VOICES: Readonly<Record<AltVoiceId, AltVoice>> = CONFIG
/** 'era' is each chapter's own voice. */
export type VoiceChoice = 'era' | AltVoiceId

export function isVoiceChoice(v: string): v is VoiceChoice {
  return v === 'era' || (Object.prototype.hasOwnProperty.call(ALT_VOICES, v) && ALT_VOICES[v as AltVoiceId].enabled)
}

/** The choices a voice picker should offer, in order. */
export function voiceChoices(): VoiceChoice[] {
  return ['era', ...(Object.keys(ALT_VOICES) as AltVoiceId[]).filter((id) => ALT_VOICES[id].enabled)]
}
