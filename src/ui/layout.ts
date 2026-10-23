// Landscape (≥ 900 px wide) pins the case file and rulebook on the left; anything narrower keeps
// them in sheets behind two tabs. A short landscape screen (a phone on its side) is never "wide":
// it has no height for a pinned dossier, so it keeps the tabs and moves them and the stamps to the
// sides, leaving the paper the full height. JS owns the switch so screens can move focus and ARIA.

export const WIDE_PX = 900
/** A phone on its side: too short for the top bar, the paper and the stamps stacked. */
export const SHORT_MAX_H = 500
const WIDE_QUERY = `(min-width: ${WIDE_PX}px)`
const SHORT_QUERY = `(orientation: landscape) and (max-height: ${SHORT_MAX_H}px)`

function query(q: string): MediaQueryList | null {
  try {
    return typeof matchMedia === 'function' ? matchMedia(q) : null
  } catch {
    return null
  }
}

export function isShort(): boolean {
  const q = query(SHORT_QUERY)
  if (q) return q.matches
  const w = typeof innerWidth === 'number' ? innerWidth : 0
  const h = typeof innerHeight === 'number' ? innerHeight : 0
  return w > h && h > 0 && h <= SHORT_MAX_H
}

export function isWide(): boolean {
  const q = query(WIDE_QUERY)
  const wide = q ? q.matches : (typeof innerWidth === 'number' ? innerWidth : 0) >= WIDE_PX
  return wide && !isShort()
}

/** Calls `cb` when the layout flips (wide, or short). Returns an unsubscribe. */
export function onLayoutChange(cb: (wide: boolean) => void): () => void {
  let last = `${isWide()}|${isShort()}`
  const fn = () => {
    const now = `${isWide()}|${isShort()}`
    if (now === last) return
    last = now
    cb(isWide())
  }
  const qs = [query(WIDE_QUERY), query(SHORT_QUERY)].filter((q): q is MediaQueryList => !!q && typeof q.addEventListener === 'function')
  if (qs.length === 2) {
    for (const q of qs) q.addEventListener('change', fn)
    return () => { for (const q of qs) q.removeEventListener('change', fn) }
  }
  window.addEventListener('resize', fn)
  return () => window.removeEventListener('resize', fn)
}

export function reducedMotion(): boolean {
  try {
    return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}
