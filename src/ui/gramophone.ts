import type { EraId, Lang } from '../content/types'
import { SONGS, embedUrl, firstSong } from '../content/songs'
import { t } from '../i18n/strings'
import { YT_STATE, type YTApi, type YTPlayer } from '../audio/youtube'
import { h, svg } from './h'

// Music mode: the songs play in YouTube's own player, set in a walnut radio cabinet docked in a
// corner (a strip under the top bar on phones), with a cream "Now playing" card and brass knobs
// for the previous and next song and for putting the music away. The player is always visible
// while it plays (at least 200x200 px, as YouTube asks); putting it away pauses it. If YouTube
// cannot load, the cabinet says so for a moment and the room's own sound comes back.

/** The player's volume: full songs sit under the game's cues; lower still under the voice and the alarm. */
export const VOLUME = 65
export const DUCKED_VOLUME = 40
/** How long the player may take to say it is ready before Music gives way to the room. */
export const READY_GUARD_MS = 12_000
/** How long the failure note shows before the cabinet folds away. */
export const FAIL_NOTE_MS = 4_000
/** No sound yet this long after asking to play (an iPhone wants a tap on the picture): say so. */
export const TAP_HINT_MS = 3_000

export interface GramophoneDeps {
  parent: HTMLElement
  lang(): Lang
  /** Loads YouTube's IFrame API (src/audio/youtube.ts); null when it cannot. */
  loadApi(): Promise<YTApi | null>
  /** Under automation the game never talks to YouTube: no API, and no player page unless `allowFrame`. */
  automation: boolean
  allowFrame?: boolean
  /** The room's ambience: off while the cabinet is open, back when it folds or fails. */
  onRoom(on: boolean): void
  /** A song is (or stopped) actually playing: the record button spins. */
  onPlaying(playing: boolean): void
  /** The player put the music away from the cabinet: back to Room mode. */
  onFold(): void
  /** YouTube could not load: back to Room mode. */
  onFail(): void
}

export interface Gramophone {
  /** Opens the cabinet and plays (from the era's own song the first time). */
  open(era: EraId | null): void
  /** Pauses and folds the cabinet away. */
  close(): void
  isOpen(): boolean
  setHidden(hidden: boolean): void
  duck(on: boolean): void
  relabel(): void
  /** Which screen it sits over ('day' docks it under the top bar). */
  setScreen(screen: string): void
  /** The element, for tests. */
  readonly el: HTMLElement
}

const KNOB: Record<'prev' | 'next' | 'fold', string> = {
  prev: '<path d="M7 6v12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M18 6.5v11L9 12z" fill="currentColor"/>',
  next: '<path d="M17 6v12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M6 6.5v11L15 12z" fill="currentColor"/>',
  fold: '<path d="M6 15l6-6 6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
}
const knobIcon = (k: keyof typeof KNOB) => svg(`<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">${KNOB[k]}</svg>`)

export function createGramophone(d: GramophoneDeps): Gramophone {
  let index = -1
  let open = false
  let hidden = false
  let ducked = false
  let failed = false
  let api: YTApi | null = null
  let player: YTPlayer | null = null
  let ready = false
  let playing = false
  let resumeOnShow = false
  let errors = 0
  let loading = false
  /** The song the player page holds (it can lag behind `index` until the player is ready). */
  let loaded = -1
  let readyTimer: ReturnType<typeof setTimeout> | undefined
  let hintTimer: ReturnType<typeof setTimeout> | undefined
  let failTimer: ReturnType<typeof setTimeout> | undefined

  const knob = (k: 'prev' | 'next' | 'fold', fn: () => void) =>
    h('button', { class: `gramo__knob gramo__knob--${k}`, type: 'button', 'data-action': `music-${k}`, onclick: fn }, knobIcon(k))
  const now = h('p', { class: 'gramo__now' })
  const song = h('p', { class: 'gramo__song' })
  const film = h('p', { class: 'gramo__film' })
  const via = h('p', { class: 'gramo__via' })
  const note = h('p', { class: 'gramo__note', hidden: true })
  const prevBtn = knob('prev', () => step(-1))
  const nextBtn = knob('next', () => step(1))
  const foldBtn = knob('fold', () => {
    close()
    d.onFold()
  })
  const screen = h('div', { class: 'gramo__screen' })
  const el = h('aside', { class: 'gramo', hidden: true, 'data-screen': 'main' },
    h('div', { class: 'gramo__cabinet' },
      h('span', { class: 'gramo__crown', 'aria-hidden': 'true' }),
      screen,
      h('div', { class: 'gramo__side' },
        h('div', { class: 'gramo__card' }, now, song, film, via, note),
        h('div', { class: 'gramo__knobs' }, prevBtn, nextBtn, foldBtn))))
  d.parent.appendChild(el)
  let frame: HTMLIFrameElement | null = null

  function relabel(): void {
    const lang = d.lang()
    el.setAttribute('lang', lang)
    el.setAttribute('aria-label', t('music', lang))
    now.textContent = t('musicNow', lang)
    const s = SONGS[index] ?? SONGS[0]!
    song.textContent = s.title[lang]
    film.textContent = `${s.film[lang]} · ${s.year}`
    via.textContent = `${s.channel} · YouTube`
    if (frame) frame.title = `YouTube: ${s.title[lang]} · ${s.film[lang]}`
    prevBtn.setAttribute('aria-label', t('musicPrev', lang))
    prevBtn.title = t('musicPrev', lang)
    nextBtn.setAttribute('aria-label', t('musicNext', lang))
    nextBtn.title = t('musicNext', lang)
    foldBtn.setAttribute('aria-label', t('musicFold', lang))
    foldBtn.title = t('musicFold', lang)
    if (!note.hidden) note.textContent = t(failed ? 'musicFailed' : 'musicTap', d.lang())
  }

  function showNote(key: 'musicFailed' | 'musicTap' | null): void {
    note.hidden = key === null
    note.textContent = key ? t(key, d.lang()) : ''
  }

  function setPlaying(p: boolean): void {
    if (p === playing) return
    playing = p
    el.classList.toggle('is-playing', p)
    d.onPlaying(p)
  }

  /** The address of the current song; under automation it is kept aside, never loaded. */
  function point(f: HTMLIFrameElement): void {
    loaded = index
    const url = embedUrl(SONGS[index]!.videoId, location.origin, d.lang())
    if (d.automation && !d.allowFrame) {
      f.dataset.src = url
      f.src = 'about:blank'
    } else f.src = url
  }

  function makeFrame(): HTMLIFrameElement {
    const f = h('iframe', {
      class: 'gramo__player', allow: 'autoplay; encrypted-media; picture-in-picture', allowfullscreen: true,
      referrerpolicy: 'strict-origin-when-cross-origin',
    })
    point(f)
    screen.replaceChildren(f)
    return f
  }

  function clearTimers(): void {
    clearTimeout(readyTimer)
    clearTimeout(hintTimer)
  }

  function askToPlay(): void {
    if (!player || !ready || hidden || !open) return
    try {
      player.setVolume(ducked ? DUCKED_VOLUME : VOLUME)
      player.playVideo()
    } catch { /* the player went away: the guard below says so */ }
    clearTimeout(hintTimer)
    hintTimer = setTimeout(() => { if (open && !playing && !failed) showNote('musicTap') }, TAP_HINT_MS)
  }

  function fail(): void {
    if (failed) return
    failed = true
    clearTimers()
    try { player?.destroy() } catch { /* already gone */ }
    player = null
    ready = false
    api = null
    frame = null
    screen.replaceChildren()
    setPlaying(false)
    showNote('musicFailed')
    d.onRoom(true)
    d.onFail()
    clearTimeout(failTimer)
    failTimer = setTimeout(() => {
      el.hidden = true
      open = false
      failed = false
      showNote(null)
    }, FAIL_NOTE_MS)
  }

  function attach(a: YTApi): void {
    if (!frame || player) return
    api = a
    clearTimeout(readyTimer)
    readyTimer = setTimeout(() => { if (!ready) fail() }, READY_GUARD_MS)
    try {
      player = new a.Player(frame, {
        events: {
          onReady: () => {
            ready = true
            clearTimeout(readyTimer)
            if (loaded !== index) load()
            askToPlay()
          },
          onStateChange: (e) => {
            setPlaying(e.data === YT_STATE.playing)
            if (e.data === YT_STATE.playing) {
              errors = 0
              clearTimeout(hintTimer)
              showNote(null)
            }
            if (e.data === YT_STATE.ended) step(1)
          },
          // a song that will not play here (removed, region-locked, embedding turned off) is skipped
          onError: () => {
            errors++
            if (errors >= SONGS.length) fail()
            else step(1)
          },
        },
      })
    } catch {
      fail()
    }
  }

  function step(by: number): void {
    index = (index + by + SONGS.length) % SONGS.length
    relabel()
    setPlaying(false)
    if (player) {
      if (ready) {
        load()
        askToPlay()
      }
      // not ready yet: onReady loads it
    } else if (frame) point(frame)
  }

  function load(): void {
    try {
      player?.loadVideoById(SONGS[index]!.videoId)
      loaded = index
    } catch { fail() }
  }

  function start(era: EraId | null): void {
    if (index < 0) index = firstSong(era)
    relabel()
    if (!frame) frame = makeFrame()
    if (d.automation) return
    if (player) {
      askToPlay()
      return
    }
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      fail()
      return
    }
    if (api) {
      attach(api)
      return
    }
    if (loading) return
    loading = true
    void d.loadApi().then((a) => {
      loading = false
      if (!open || failed) return
      if (a) attach(a)
      else fail()
    }, () => {
      loading = false
      fail()
    })
  }

  function close(): void {
    clearTimers()
    if (player && ready) {
      try { player.pauseVideo() } catch { /* gone */ }
    }
    setPlaying(false)
    showNote(null)
    if (!open) return
    open = false
    el.hidden = true
    d.onRoom(true)
  }

  relabel()
  return {
    el,
    open(era) {
      if (failed) return // the failure note is still showing: the room is back for now
      if (!open) {
        open = true
        el.hidden = false
        d.onRoom(false)
      }
      start(era)
    },
    close,
    isOpen: () => open,
    setHidden(hd) {
      if (hd === hidden) return
      hidden = hd
      if (hd) {
        // a hidden tab makes no sound
        resumeOnShow = playing
        if (player && ready && playing) {
          try { player.pauseVideo() } catch { /* gone */ }
        }
      } else if (resumeOnShow && open) {
        resumeOnShow = false
        askToPlay()
      }
    },
    duck(on) {
      if (on === ducked) return
      ducked = on
      if (player && ready) {
        try { player.setVolume(on ? DUCKED_VOLUME : VOLUME) } catch { /* gone */ }
      }
    },
    relabel,
    setScreen(s) {
      el.dataset.screen = s
    },
  }
}
