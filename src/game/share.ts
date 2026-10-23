export const SHARE_LINK = 'firangitota.com'

export function shareText(p: { daily: number; eraTitle: string; results: boolean[] }): string {
  return `Firangi Tota · Aaj ka Taar #${p.daily} · ${p.eraTitle}\n${p.results.map((r) => (r ? '✅' : '❌')).join('')}\n${SHARE_LINK}`
}

/** "Firangi Tota · Delhi 1857 · Hard · survived 14/14" plus the link. */
export function chapterShareText(p: { eraTitle: string; mode: string; survived: number; days: number }): string {
  return `Firangi Tota · ${p.eraTitle} · ${p.mode} · survived ${p.survived}/${p.days}\n${SHARE_LINK}`
}
