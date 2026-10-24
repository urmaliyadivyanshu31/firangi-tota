// The offline copy's first-use cache, made whole. The service worker caches recorded audio and the
// rarer fonts the first time the page asks for them (vite.config.ts, runtimeCaching), but on a
// first visit the page fetches its fonts, and often its first room sound, before the worker has
// taken control, so those requests never pass through it. Once a worker takes control, this asks
// for the same files again through it. The browser's HTTP cache usually answers, so it costs a
// revalidation at most, and it never touches read-aloud (/api/voice) or anything off-site.

/** Same-origin files that are cached on first use: the room recordings and the font files. */
const FIRST_USE = /^\/(?:audio\/[^/]+|fonts\/[^/]+\.woff2|assets\/[^/]+\.woff2)$/

/** The first-use files this page has already fetched, each once. */
export function firstUseUrls(entries: readonly { name: string }[], origin: string): string[] {
  const out: string[] = []
  for (const e of entries) {
    let url: URL
    try {
      url = new URL(e.name)
    } catch {
      continue
    }
    if (url.origin !== origin || !FIRST_USE.test(url.pathname) || out.includes(url.pathname)) continue
    out.push(url.pathname)
  }
  return out
}

export function warmFirstUseCache(win: Window = window): void {
  const sw = win.navigator.serviceWorker as ServiceWorkerContainer | undefined
  if (!sw || sw.controller || typeof win.performance?.getEntriesByType !== 'function') return
  sw.addEventListener('controllerchange', () => {
    for (const url of firstUseUrls(win.performance.getEntriesByType('resource'), win.location.origin)) {
      win.fetch(url).catch(() => undefined) // offline or gone: it will be cached on its next use
    }
  }, { once: true })
}
