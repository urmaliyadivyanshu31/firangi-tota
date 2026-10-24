// The record's Focus tracks: calm nature of the Indian subcontinent, no instruments and no voices,
// so a player can settle in and think. Each is a CC0 field recording (credited in CREDITS.md) cut by
// dev/focus-assets.mjs into a seamless mono loop, public/audio/focus-<id>.m4a, stored at -26 LUFS.
// They are fetched only when picked and play through the game's own audio engine.

export interface FocusTrack {
  id: string
  title: { en: string; hi: string }
  file: string
  /** The loop's length in seconds (the AAC file may carry codec padding past it). */
  seconds: number
}

export const FOCUS_TRACKS: readonly FocusTrack[] = [
  // Kolkata, rain on a fibre roof at midnight
  { id: 'rain', title: { en: 'Monsoon on the roof', hi: 'छत पर बरसात' }, file: 'focus-rain.m4a', seconds: 150 },
  // the Chalakudy river in Kerala, a slow steady flow
  { id: 'river', title: { en: 'By the river', hi: 'नदी किनारे' }, file: 'focus-river.m4a', seconds: 109 },
  // a Goa hillside at sunrise
  { id: 'sunrise', title: { en: 'Birds at sunrise', hi: 'भोर के पंछी' }, file: 'focus-sunrise.m4a', seconds: 150 },
  // a village garden after rain
  { id: 'birds', title: { en: 'After the rain', hi: 'बारिश के बाद' }, file: 'focus-birds.m4a', seconds: 143 },
  // a lakeside near Lonavala at night
  { id: 'crickets', title: { en: 'Crickets at night', hi: 'रात के झींगुर' }, file: 'focus-crickets.m4a', seconds: 150 },
]

export const focusTrack = (id: string): FocusTrack | undefined => FOCUS_TRACKS.find((t) => t.id === id)
