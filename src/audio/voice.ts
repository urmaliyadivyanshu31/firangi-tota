// Read-aloud: plays the current message in its era's voice, fetched from /api/voice.
//
// - One <audio> element, reused. It is created and started inside the player's tap (play() is
//   called synchronously from the click handler), which is what iOS needs to allow playback.
// - It ignores the game-sound mute: the player asked for this by tapping.
// - There is no speechSynthesis fallback. If the clip cannot play, the state becomes 'error'.
import type { EraId, Lang } from '../content/types'

export type VoiceState = 'idle' | 'loading' | 'playing' | 'error'

export interface VoiceRequest {
  era: EraId
  id: string
  lang: Lang
  /** Chapter day whose date fills the message: dayDate(era, day) must be the date on screen. */
  day: number
}

export interface Voice {
  /** Start reading `req`. Tapping the message that is loading or playing stops it. Never rejects. */
  play(req: VoiceRequest): Promise<void>
  stop(): void
  /** Called on every state change with the new state and its message. Returns an unsubscribe. */
  onState(cb: (s: VoiceState, req: VoiceRequest | null) => void): () => void
}

export interface VoiceOptions {
  endpoint?: string
  /** Makes the audio element (tests pass a fake). */
  createAudio?: () => HTMLAudioElement
}

export function voiceUrl(req: VoiceRequest, endpoint = '/api/voice'): string {
  const p = new URLSearchParams({ era: req.era, id: req.id, lang: req.lang, day: String(req.day) })
  return `${endpoint}?${p.toString()}`
}

const same = (a: VoiceRequest | null, b: VoiceRequest) =>
  !!a && a.era === b.era && a.id === b.id && a.lang === b.lang && a.day === b.day

export function createVoice(opts: VoiceOptions = {}): Voice {
  const endpoint = opts.endpoint ?? '/api/voice'
  const make = opts.createAudio ?? (() => new Audio())
  let el: HTMLAudioElement | null = null
  let state: VoiceState = 'idle'
  let current: VoiceRequest | null = null
  // Every play() and stop() starts a new generation. The element's events count only while the
  // clip it holds belongs to the live generation, so a stopped or replaced clip stays silent.
  let gen = 0
  let elGen = -1
  const listeners = new Set<(s: VoiceState, req: VoiceRequest | null) => void>()

  function set(s: VoiceState): void {
    if (s === state) return
    state = s
    for (const cb of [...listeners]) {
      try {
        cb(s, current)
      } catch {
        /* a broken listener must not break playback */
      }
    }
  }

  function element(): HTMLAudioElement {
    if (el) return el
    const a = make()
    a.preload = 'auto'
    a.setAttribute('playsinline', '')
    const live = (fn: () => void) => () => {
      if (elGen === gen && current) fn()
    }
    a.addEventListener('playing', live(() => set('playing')))
    a.addEventListener('waiting', live(() => { if (state === 'playing') set('loading') }))
    a.addEventListener('ended', live(() => { current = null; set('idle') }))
    a.addEventListener('error', live(() => set('error')))
    el = a
    return a
  }

  function stop(): void {
    gen++
    try {
      el?.pause()
    } catch {
      /* already stopped */
    }
    current = null
    set('idle')
  }

  function play(req: VoiceRequest): Promise<void> {
    if (same(current, req) && (state === 'loading' || state === 'playing')) {
      stop()
      return Promise.resolve()
    }
    const a = element()
    stop()
    const mine = gen
    elGen = mine
    current = req
    set('loading')
    a.muted = false
    a.volume = 1
    // Setting src aborts the old clip and drops its pending events.
    a.src = voiceUrl(req, endpoint)
    let started: Promise<void>
    try {
      // Synchronous inside the tap: nothing is awaited before this call.
      started = Promise.resolve(a.play())
    } catch {
      started = Promise.reject(new Error('play failed'))
    }
    return started.then(
      () => { if (gen === mine && state === 'loading') set('playing') },
      // A rejection for a clip that was stopped or replaced is expected (AbortError).
      () => { if (gen === mine) set('error') },
    )
  }

  return {
    play,
    stop,
    onState(cb) {
      listeners.add(cb)
      return () => { listeners.delete(cb) }
    },
  }
}

/** The app-wide read-aloud player. */
export const voice: Voice = createVoice()
