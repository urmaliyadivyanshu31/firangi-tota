// Alternate read-aloud voices, usable in every chapter. Shared by the game (labels, credits) and
// the voice server (ids, settings). Voice ids are public ElevenLabs ids, not secrets.
//
// Adding a voice is config only: add one entry below. A voice used with someone's permission
// must carry a `credit` line, which the game shows whenever that voice is selected, e.g.
//   guest: { label: { en: 'Guest', hi: 'मेहमान' }, credit: 'Voice: <name> (with permission)',
//            voiceId: '<id>', voiceName: '<library or account name>', settings: { stability: 0.5, similarityBoost: 0.75 } },
// Never add a voice that imitates a real person without their written permission.
import type { L10n } from './types.js'

export interface VoiceSpec {
  /** ElevenLabs voice id. */
  voiceId: string
  /** Library name, so a reader knows which voice it is without an API call. */
  voiceName: string
  /** Eleven v4 takes only stability and similarity boost (no style or speed). */
  settings: { stability: number; similarityBoost: number }
  /** Ids from GET /v1/audio-effects/catalog (checked 2026-10-24). */
  effects?: { filterPresetId?: string; environmentId?: string; sendLevel?: number; distance?: number }
}

export interface AltVoice extends VoiceSpec {
  label: L10n
  /** Required for any voice used with a person's permission; shown in the game. */
  credit?: string
}

const CONFIG = {
  dastango: {
    // A dastango tells dastans, long stories, by lamplight: deep, gravelly, theatrical Hindustani.
    // Chosen from the Voice Library by generic traits only (mature male storyteller, rasp).
    label: { en: 'Dastango', hi: 'दास्तानगो' },
    // Swap the voice by changing this one id (and voiceName).
    // Alternatives: YkAJCvEzSQvG7K2YK9kx (Bharadwaj - Deep, Expressive), NAuCjDa0V2FYHGI2F2CS (Kabir - Serious, Calm and Raspy).
    voiceId: 'iBRcUZbbi4hxPMzDCm71',
    voiceName: 'Grandpa Danish - Rasped and Nostalgic',
    // Lower stability for a theatrical, storyteller's range.
    settings: { stability: 0.4, similarityBoost: 0.8 },
    // A small lamplit room.
    effects: { environmentId: 'small_room', sendLevel: 0.18 },
  },
} satisfies Record<string, AltVoice>

export type AltVoiceId = keyof typeof CONFIG
export const ALT_VOICES: Readonly<Record<AltVoiceId, AltVoice>> = CONFIG
/** 'era' is each chapter's own voice. */
export type VoiceChoice = 'era' | AltVoiceId

export function isVoiceChoice(v: string): v is VoiceChoice {
  return v === 'era' || Object.prototype.hasOwnProperty.call(ALT_VOICES, v)
}
