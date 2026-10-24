import type { EraId } from './types'

// Music mode's playlist: songs of the freedom struggle and Piyush Mishra's songs, in that rousing
// spirit. Every one is the label's own upload on YouTube, played in YouTube's own player (embedded
// from youtube-nocookie.com, never downloaded or hosted here). Each ID was checked on 2026-10-24:
// the channel is the label's, and the video allows embedding. Credited in CREDITS.md.

export interface Song {
  title: { en: string; hi: string }
  film: { en: string; hi: string }
  year: number
  /** The official channel that uploaded it. */
  channel: string
  videoId: string
  /** Music mode starts here when it is first picked on this era's page. */
  era?: EraId
}

export const SONGS: readonly Song[] = [
  { title: { en: 'Aarambh Hai Prachand', hi: 'आरंभ है प्रचंड' }, film: { en: 'Gulaal', hi: 'गुलाल' }, year: 2009, channel: 'T-Series', videoId: 'x9feF5rtMAc', era: 'delhi-1857' },
  { title: { en: 'Pagdi Sambhal Jatta', hi: 'पगड़ी संभाल जट्टा' }, film: { en: 'The Legend of Bhagat Singh', hi: 'द लेजेंड ऑफ़ भगत सिंह' }, year: 2002, channel: 'Tips Official', videoId: 'U_Pf1FHKnJM' },
  { title: { en: 'Mera Rang De Basanti Chola', hi: 'मेरा रंग दे बसंती चोला' }, film: { en: 'The Legend of Bhagat Singh', hi: 'द लेजेंड ऑफ़ भगत सिंह' }, year: 2002, channel: 'Tips Official', videoId: 'Ha_P2DW9VR4', era: 'lahore-1929' },
  { title: { en: 'Sarfaroshi Ki Tamanna', hi: 'सरफ़रोशी की तमन्ना' }, film: { en: 'The Legend of Bhagat Singh', hi: 'द लेजेंड ऑफ़ भगत सिंह' }, year: 2002, channel: 'Tips Official', videoId: 'MxWz46Fm_J8', era: 'bombay-1942' },
  { title: { en: 'Ik Bagal Mein Chaand Hoga', hi: 'इक बगल में चाँद होगा' }, film: { en: 'Gangs of Wasseypur', hi: 'गैंग्स ऑफ़ वासेपुर' }, year: 2012, channel: 'T-Series', videoId: '67_CU8E9sdY' },
  { title: { en: 'Rang De Basanti', hi: 'रंग दे बसंती' }, film: { en: 'Rang De Basanti', hi: 'रंग दे बसंती' }, year: 2006, channel: 'Sony Music India', videoId: 'Azhtn4ptHQI' },
  { title: { en: 'Duniya', hi: 'दुनिया' }, film: { en: 'Gulaal', hi: 'गुलाल' }, year: 2009, channel: 'T-Series', videoId: 'gkKcddq0J4U', era: 'delhi-1947' },
  { title: { en: 'Kandhon Se Milte Hain Kandhe', hi: 'कंधों से मिलते हैं कंधे' }, film: { en: 'Lakshya', hi: 'लक्ष्य' }, year: 2004, channel: 'Sony Music India', videoId: 'FGjQIHVUECk' },
  { title: { en: 'Sheher', hi: 'शहर' }, film: { en: 'Gulaal', hi: 'गुलाल' }, year: 2009, channel: 'T-Series', videoId: 'yQ0t8LcL498' },
]

/** Where Music mode starts on an era's page: its own song, or the top of the list. */
export function firstSong(era: EraId | null): number {
  const i = SONGS.findIndex((s) => s.era === era)
  return i < 0 ? 0 : i
}

/** The embed address: YouTube's privacy-enhanced player, its JS API on, inline on iPhones. */
export function embedUrl(videoId: string, origin: string, lang: 'en' | 'hi'): string {
  const q = new URLSearchParams({ enablejsapi: '1', playsinline: '1', rel: '0', iv_load_policy: '3', autoplay: '1', hl: lang, origin })
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?${q}`
}
