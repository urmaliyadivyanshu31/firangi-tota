import type { EraId, Lang } from '../content/types'
import { SONGS, embedUrl, firstSong } from '../content/songs'
import { t } from '../i18n/strings'
import { store } from '../game/storage'
import { YT_STATE, type YTApi, type YTPlayer } from '../audio/youtube'
import { h, svg } from './h'

// Music mode: the songs play in YouTube's own player, set in a walnut radio cabinet docked in a
// corner (a strip under the top bar on phones), with a cream "Now playing" card and brass knobs
// for the previous and next song and for putting the music away. The player is always visible
// while it plays (at least 200x200 px, as YouTube asks); putting it away pauses it. If YouTube
// cannot load, the cabinet says so for a moment and the room's own sound comes back.
// On wider screens the cabinet folds down to a small frame (the 200x200 picture and a brass bar)
// and keeps playing; a brass knob sets the volume, and both are kept for the next visit.

/** The player's volume until the player turns the knob: full songs sit under the game's cues. */
export const VOLUME = 65
/** Under the read-aloud voice and the caught alarm the songs dip to this share of the chosen volume. */
export const DUCK_RATIO = 0.6
/** One arrow-key step of the volume knob, and one PageUp/PageDown step. */
export const VOLUME_STEP = 5
export const VOLUME_PAGE = 10
/** Pixels of drag across the knob's full turn (up or right turns it up). */
const DRAG_RANGE_PX = 160

export type PlayerSize = 'full' | 'mini'

export const clampVolume = (v: number): number => Math.max(0, Math.min(100, Math.round(v)))
/** The kept volume, 0-100 (65 when none was kept or it was not a number). */
export function storedVolume(): number {
  const v = store.get<unknown>('musicVolume', VOLUME)
  return typeof v === 'number' && Number.isFinite(v) ? clampVolume(v) : VOLUME
}
/** What the player hears while the voice or the alarm is on. */
export const duckedVolume = (v: number): number => Math.round(v * DUCK_RATIO)
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
  /** The cabinet changed size: whatever makes room for it measures again. */
  onResize?(): void
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
  /** Full cabinet or the small frame (wider screens; phones always show the strip). */
  size(): PlayerSize
  setSize(size: PlayerSize): void
  volume(): number
  setVolume(v: number): void
  /** The element, for tests. */
  readonly el: HTMLElement
}

type KnobKind = 'prev' | 'next' | 'fold' | 'small' | 'large' | 'play' | 'pause'
const KNOB: Record<KnobKind, string> = {
  prev: '<path d="M7 6v12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M18 6.5v11L9 12z" fill="currentColor"/>',
  next: '<path d="M17 6v12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M6 6.5v11L15 12z" fill="currentColor"/>',
  fold: '<path d="M6 15l6-6 6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
  // a frame drawn in to its corner, and drawn back out
  small: '<rect x="4.5" y="4.5" width="15" height="15" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6" opacity=".55"/><rect x="11" y="11" width="8.5" height="8.5" rx="1" fill="currentColor"/><path d="M6.5 6.5l4 4M10.5 7v3.5H7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  large: '<rect x="4.5" y="4.5" width="15" height="15" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9 15l6-6M10 9h5v5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  play: '<path d="M8 5.5v13l11-6.5z" fill="currentColor"/>',
  pause: '<path d="M8 6v12M16 6v12" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/>',
}
const knobIcon = (k: KnobKind) => svg(`<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">${KNOB[k]}</svg>`)

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
  let volume = storedVolume()
  let size: PlayerSize = store.get<unknown>('playerSize', 'full') === 'mini' ? 'mini' : 'full'

  const knob = (k: KnobKind, fn: () => void) =>
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
  const smallBtn = knob('small', () => setSize('mini', true))
  const largeBtn = knob('large', () => setSize('full', true))
  const playBtn = knob('play', () => togglePlay())
  // the volume: a ridged brass knob in a ring that lights up to the level, a slider to assistive tech
  const volKnob = h('span', { class: 'gramo__vol-knob', 'aria-hidden': 'true' })
  const vol = h('div', { class: 'gramo__vol', role: 'slider', tabindex: '0', 'data-action': 'music-volume',
    'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-orientation': 'vertical' }, volKnob)
  // the small frame's brass plate: the song's title running past, twice so the loop never shows a seam
  const tickerText = h('span', { class: 'gramo__ticker-run' })
  const ticker = h('div', { class: 'gramo__ticker', 'aria-hidden': 'true' }, h('div', { class: 'gramo__ticker-window' }, tickerText))
  const screen = h('div', { class: 'gramo__screen' })
  const el = h('aside', { class: 'gramo', hidden: true, 'data-screen': 'main', 'data-size': size },
    h('div', { class: 'gramo__cabinet' },
      h('span', { class: 'gramo__crown', 'aria-hidden': 'true' }),
      screen,
      h('div', { class: 'gramo__side' },
        h('div', { class: 'gramo__card' }, now, song, film, via, note),
        ticker,
        h('div', { class: 'gramo__knobs' }, playBtn, prevBtn, nextBtn, vol, smallBtn, largeBtn, foldBtn))))
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
    smallBtn.setAttribute('aria-label', t('musicSmall', lang))
    smallBtn.title = t('musicSmall', lang)
    largeBtn.setAttribute('aria-label', t('musicLarge', lang))
    largeBtn.title = t('musicLarge', lang)
    vol.setAttribute('aria-label', t('musicVolume', lang))
    vol.title = t('musicVolume', lang)
    const line = `${s.title[lang]} · ${s.film[lang]} · ${s.year}`
    tickerText.replaceChildren(h('span', {}, line), h('span', {}, line))
    // the same unhurried pace for a short title and a long one
    ticker.style.setProperty('--ticker-s', `${Math.max(8, Math.round(line.length * 0.32))}s`)
    showPlayState()
    if (!note.hidden) note.textContent = t(failed ? 'musicFailed' : 'musicTap', d.lang())
  }

  function showNote(key: 'musicFailed' | 'musicTap' | null): void {
    note.hidden = key === null
    note.textContent = key ? t(key, d.lang()) : ''
    // the small frame has no card: it shows the note alone while there is one
    el.classList.toggle('has-note', key !== null)
  }

  function setPlaying(p: boolean): void {
    if (p === playing) return
    playing = p
    el.classList.toggle('is-playing', p)
    showPlayState()
    d.onPlaying(p)
  }

  /** The small frame's play knob shows what a press will do. */
  function showPlayState(): void {
    const key = playing ? 'musicPause' : 'musicPlay'
    if (playBtn.dataset.state !== key) {
      playBtn.dataset.state = key
      playBtn.replaceChildren(knobIcon(playing ? 'pause' : 'play'))
    }
    playBtn.setAttribute('aria-label', t(key, d.lang()))
    playBtn.title = t(key, d.lang())
  }

  function togglePlay(): void {
    if (playing) {
      clearTimeout(hintTimer)
      if (player && ready) {
        try { player.pauseVideo() } catch { /* gone */ }
      }
      setPlaying(false)
    } else askToPlay()
  }

  /** What the player should be at right now: the chosen volume, or its dipped share. */
  const heard = (): number => ducked ? duckedVolume(volume) : volume

  function showVolume(): void {
    vol.setAttribute('aria-valuenow', String(volume))
    vol.setAttribute('aria-valuetext', `${volume}%`)
    // the knob turns through 270 degrees, from seven o'clock to five o'clock
    vol.style.setProperty('--vol', String(volume / 100))
  }

  function setVolume(v: number): void {
    const next = clampVolume(v)
    if (next === volume) return
    volume = next
    store.set('musicVolume', volume)
    showVolume()
    if (player && ready) {
      try { player.setVolume(heard()) } catch { /* gone */ }
    }
  }

  function setSize(next: PlayerSize, fromKnob = false): void {
    if (next === size) return
    size = next
    store.set('playerSize', size)
    // only the cabinet's dress changes; the player page stays put, so the song plays on
    el.dataset.size = size
    el.classList.remove('is-resized')
    void el.offsetWidth
    el.classList.add('is-resized')
    if (fromKnob) (size === 'mini' ? largeBtn : smallBtn).focus({ preventScroll: true })
    d.onResize?.()
  }

  // the knob answers arrow keys, PageUp/PageDown, Home/End, a drag (up or right is louder) and the wheel
  vol.addEventListener('keydown', (e) => {
    const by: Record<string, number> = {
      ArrowUp: VOLUME_STEP, ArrowRight: VOLUME_STEP, ArrowDown: -VOLUME_STEP, ArrowLeft: -VOLUME_STEP,
      PageUp: VOLUME_PAGE, PageDown: -VOLUME_PAGE, Home: -100, End: 100,
    }
    const by1 = by[e.key]
    if (by1 === undefined) return
    e.preventDefault()
    setVolume(volume + by1)
  })
  let drag: { id: number; x: number; y: number; from: number } | null = null
  vol.addEventListener('pointerdown', (e) => {
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, from: volume }
    try { vol.setPointerCapture(e.pointerId) } catch { /* not capturable here */ }
    vol.classList.add('is-turning')
    e.preventDefault()
    vol.focus({ preventScroll: true })
  })
  vol.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return
    const moved = (e.clientX - drag.x) - (e.clientY - drag.y)
    setVolume(drag.from + (moved / DRAG_RANGE_PX) * 100)
  })
  const endDrag = (e: PointerEvent) => {
    if (!drag || e.pointerId !== drag.id) return
    drag = null
    vol.classList.remove('is-turning')
  }
  vol.addEventListener('pointerup', endDrag)
  vol.addEventListener('pointercancel', endDrag)
  vol.addEventListener('wheel', (e) => {
    if (e.deltaY === 0) return
    e.preventDefault()
    setVolume(volume + (e.deltaY < 0 ? VOLUME_STEP : -VOLUME_STEP))
  }, { passive: false })

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
      player.setVolume(heard())
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
  showVolume()
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
        try { player.setVolume(heard()) } catch { /* gone */ }
      }
    },
    relabel,
    setScreen(s) {
      el.dataset.screen = s
    },
    size: () => size,
    setSize: (s) => setSize(s),
    volume: () => volume,
    setVolume,
  }
}
