// YouTube's IFrame Player API, loaded only when Music mode is first picked (never on page load,
// never under automation). The game attaches it to an iframe it made itself, so the player is
// always YouTube's own visible player on youtube-nocookie.com.

/** The few calls the game makes on a player. */
export interface YTPlayer {
  playVideo(): void
  pauseVideo(): void
  loadVideoById(id: string): void
  setVolume(v: number): void
  destroy(): void
}

export interface YTEvents {
  onReady?(e: { target: YTPlayer }): void
  onStateChange?(e: { data: number }): void
  onError?(e: { data: number }): void
}

export interface YTApi {
  Player: new (el: HTMLIFrameElement, opts: { events: YTEvents }) => YTPlayer
}

/** The player's states (YT.PlayerState). */
export const YT_STATE = { unstarted: -1, ended: 0, playing: 1, paused: 2, buffering: 3, cued: 5 } as const

export const API_URL = 'https://www.youtube.com/iframe_api'
/** How long the API may take to arrive before Music gives way to the room. */
export const API_GUARD_MS = 10_000

let pending: Promise<YTApi | null> | null = null

/**
 * Loads the IFrame API once. Resolves null when it cannot load (offline, blocked in a region,
 * too slow), and a later call tries again.
 */
export function loadYouTubeApi(guardMs = API_GUARD_MS): Promise<YTApi | null> {
  const w = window as unknown as { YT?: YTApi & { loaded?: number }; onYouTubeIframeAPIReady?: () => void }
  if (w.YT?.Player) return Promise.resolve(w.YT)
  if (pending) return pending
  pending = new Promise<YTApi | null>((resolve) => {
    let done = false
    const finish = (api: YTApi | null) => {
      if (done) return
      done = true
      clearTimeout(timer)
      if (!api) pending = null // let a later pick try again
      resolve(api)
    }
    const timer = setTimeout(() => finish(null), guardMs)
    const prev = w.onYouTubeIframeAPIReady
    w.onYouTubeIframeAPIReady = () => {
      prev?.()
      finish(w.YT?.Player ? w.YT : null)
    }
    const s = document.createElement('script')
    s.src = API_URL
    s.async = true
    s.onerror = () => {
      s.remove()
      finish(null)
    }
    document.head.appendChild(s)
  })
  return pending
}
