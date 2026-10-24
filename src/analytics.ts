// Vercel Web Analytics: cookieless page views plus a few game events (owner 10-24), served from our
// own origin, so the CSP stays 'self'. Off in development and under automation, so test runs and
// agents never count as players.
import { inject, track } from '@vercel/analytics'

type Props = Record<string, string | number | boolean | null>

function enabled(): boolean {
  try {
    return import.meta.env.PROD && navigator.webdriver !== true
  } catch {
    return false
  }
}

export function startAnalytics(): void {
  if (enabled()) inject({ mode: 'production' })
}

/** A chapter begun or ended, or a way of sharing picked. Analytics never breaks the game. */
export function gameEvent(name: 'chapter_start' | 'chapter_end' | 'share', props: Props): void {
  if (!enabled()) return
  try {
    track(name, props)
  } catch {
    /* ignore */
  }
}
