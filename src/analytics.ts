// Analytics (owner 10-24): Vercel Web Analytics (cookieless page views, served from our own origin)
// and Google Analytics 4, plus a few game events sent to both. Google's tag loads only after the
// page has loaded and gone idle, so it never slows the first paint on a cheap phone, and its ad
// features stay off. Both are off in development and under automation, so test runs and agents
// never count as players.
import { inject, track } from '@vercel/analytics'

const GA_ID = 'G-WZPE8FW478'

type Props = Record<string, string | number | boolean | null>
type Gtag = (...args: unknown[]) => void

function enabled(): boolean {
  try {
    return import.meta.env.PROD && navigator.webdriver !== true
  } catch {
    return false
  }
}

function gtag(): Gtag | null {
  const w = window as unknown as { gtag?: Gtag }
  return typeof w.gtag === 'function' ? w.gtag : null
}

function startGoogle(): void {
  const w = window as unknown as { dataLayer?: unknown[]; gtag?: Gtag }
  const layer = (w.dataLayer = w.dataLayer ?? [])
  // gtag.js reads the `arguments` objects themselves, not arrays
  w.gtag = function () {
    // eslint-disable-next-line prefer-rest-params
    layer.push(arguments)
  }
  w.gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'granted' })
  w.gtag('js', new Date())
  w.gtag('config', GA_ID)
  const load = (): void => {
    const s = document.createElement('script')
    s.async = true
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
    document.head.appendChild(s)
  }
  const idle = (): void => {
    const ric = (window as unknown as { requestIdleCallback?: (fn: () => void, o?: { timeout: number }) => void }).requestIdleCallback
    if (ric) ric(load, { timeout: 4000 })
    else window.setTimeout(load, 1500)
  }
  if (document.readyState === 'complete') idle()
  else window.addEventListener('load', idle, { once: true })
}

export function startAnalytics(): void {
  if (!enabled()) return
  inject({ mode: 'production' })
  try {
    startGoogle()
  } catch {
    /* analytics never breaks the game */
  }
}

/** A chapter begun or ended, a way of sharing picked, or a reward earned. Analytics never breaks the game. */
export function gameEvent(name: 'chapter_start' | 'chapter_end' | 'share' | 'reward', props: Props): void {
  if (!enabled()) return
  try {
    track(name, props)
    gtag()?.('event', name, props)
  } catch {
    /* ignore */
  }
}
