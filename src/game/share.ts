export function shareText(p: { daily: number; eraTitle: string; results: boolean[] }): string {
  return `Firangi Tota · Aaj ka Taar #${p.daily} · ${p.eraTitle}\n${p.results.map((r) => (r ? '✅' : '❌')).join('')}\nfirangitota.com`
}
