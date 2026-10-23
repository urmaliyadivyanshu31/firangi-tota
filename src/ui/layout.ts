// Landscape (≥ 900 px wide) pins the case file and rulebook on the left; anything narrower keeps
// them in sheets behind two tabs. JS owns the switch so screens can move focus and ARIA with it.

export const WIDE_PX = 900
const QUERY = `(min-width: ${WIDE_PX}px)`

function query(): MediaQueryList | null {
  try {
    return typeof matchMedia === 'function' ? matchMedia(QUERY) : null
  } catch {
    return null
  }
}

export function isWide(): boolean {
  const q = query()
  return q ? q.matches : (typeof innerWidth === 'number' ? innerWidth : 0) >= WIDE_PX
}

/** Calls `cb` when the layout flips. Returns an unsubscribe. */
export function onLayoutChange(cb: (wide: boolean) => void): () => void {
  const q = query()
  if (q && typeof q.addEventListener === 'function') {
    const fn = () => cb(q.matches)
    q.addEventListener('change', fn)
    return () => q.removeEventListener('change', fn)
  }
  let last = isWide()
  const fn = () => {
    const now = isWide()
    if (now !== last) cb((last = now))
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
