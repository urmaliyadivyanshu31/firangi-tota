// The record menu's Songs: two of Piyush Mishra's songs (the rest of the menu is calm Focus tracks,
// src/content/focus.ts). Each is the label's own upload on YouTube, played in YouTube's own player
// (embedded from youtube-nocookie.com, never downloaded or hosted here). Each ID was checked on
// 2026-10-24: the channel is the label's, and the video allows embedding. Credited in CREDITS.md.

export interface Song {
  /** Kept in the player's saved choice ("song:<id>"). */
  id: string
  title: { en: string; hi: string }
  film: { en: string; hi: string }
  year: number
  /** The official channel that uploaded it. */
  channel: string
  videoId: string
}

export const SONGS: readonly Song[] = [
  { id: 'aarambh', title: { en: 'Aarambh Hai Prachand', hi: 'आरंभ है प्रचंड' }, film: { en: 'Gulaal', hi: 'गुलाल' }, year: 2009, channel: 'T-Series', videoId: 'x9feF5rtMAc' },
  { id: 'ik-bagal', title: { en: 'Ik Bagal Mein Chaand Hoga', hi: 'इक बगल में चाँद होगा' }, film: { en: 'Gangs of Wasseypur', hi: 'गैंग्स ऑफ़ वासेपुर' }, year: 2012, channel: 'T-Series', videoId: '67_CU8E9sdY' },
]

export const songIndex = (id: string): number => SONGS.findIndex((s) => s.id === id)

/** The embed address: YouTube's privacy-enhanced player, its JS API on, inline on iPhones. */
export function embedUrl(videoId: string, origin: string, lang: 'en' | 'hi'): string {
  const q = new URLSearchParams({ enablejsapi: '1', playsinline: '1', rel: '0', iv_load_policy: '3', autoplay: '1', hl: lang, origin })
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?${q}`
}
