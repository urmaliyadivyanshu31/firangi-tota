// The controller. It joins the pure game logic (src/game), the era content, the overlay screens,
// the lazily loaded 3D stage and the audio, and owns the one requestAnimationFrame loop that burns
// the agarbatti. The room is always on screen: the stage establishes it behind the cards, titles
// each day, brings the message in on its paper, stamps it and flashes. Nothing here imports
// three.js: the stage and the era desks arrive by dynamic import after the first paint (R10).
import { gameEvent } from './analytics'
import { audio, cueForStage } from './audio/engine'
import { ERAS, eraById } from './content/registry'
import type { Era, EraId, Message } from './content/types'
import { DAYS, TIMER_S, TOSS_GRACE_MS, TOSS_HOLD_MS, TOSS_RESUME_MS, pencilOn, type Difficulty } from './game/config'
import { dailyFrom, type Daily } from './game/daily'
import { dayDate } from './game/dates'
import { mulberry32, seedFrom } from './game/rng'
import { unitOf } from './game/run'
import { chapterPost, chapterStory, dailyFact, dailyPost } from './game/share'
import { codeFromPath, isShareResult, parseShareCode, shareCode, type ShareResult } from './game/share-code'
import { createChapter, nextDay, stamp, type ChapterState, type Verdict } from './game/state'
import { store } from './game/storage'
import type { Lang } from './content/types'
import { getLang, setLang } from './i18n/lang'
import { t } from './i18n/strings'
import type { Voice, VoiceState } from './audio/voice'
import { DEFAULT_VOICE, VOICES, voiceChoices, type VoiceChoice } from './content/voices'
import {
  STAGE_LOST_EVENT, loadStage, mountFallback,
  type DayTitle, type EraDressing, type Fallback, type FlashKind, type IntroSpec, type QualityTier, type RevealSpec, type ScreenRect, type SheetSpec, type Stage, type StageCueName, type StampKind,
} from './scene/index'
import { controlCluster, setSoundToggle } from './ui/controls'
import { h } from './ui/h'
import { buildSheet, dayTitleFor } from './ui/message'
import { buildReveal, kindLine, messageSources } from './ui/reveal'
import { renderCredits } from './ui/screens/credits'
import { renderDailyEnd } from './ui/screens/daily'
import { renderDay, setReadable, setSound, setStamping, setTimer, setTossing, setVoiceState } from './ui/screens/day'
import { renderIntro, setIntroSettled } from './ui/screens/intro'
import { renderMain, suggestedEra, type Best } from './ui/screens/main'
import { closeShareSlip, openShareSlip } from './ui/share-slip'

export interface AppRoot { stage: HTMLElement; ui: HTMLElement }
export interface AppEnv {
  now(): number
  random(): number
  url: URL
  /** Read-aloud. Defaults to the voice module when the build sets VITE_VOICE=on; tests pass a stub. */
  voice?: Voice
}

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']
const LOW_TIME = 0.3 // under this share of the agarbatti, a clock ticks every second
const TENSION_S = 5 // in the last seconds the tick rises toward the end
const MAX_FRAME_MS = 1000 // one long frame (a stall, a resume) never burns more than this
const ANIM_GUARD_MS = 3500 // a stage animation that never settles must not stall the game
const STAGE_WAIT_MS = 6000 // a day waits this long for the 3D stage before using the 2D desk
const TIERS: QualityTier[] = ['low', 'mid', 'high']
const IST_OFFSET_MS = 330 * 60_000
const DAY_MS = 86_400_000

/** What the controller needs from a desk: the 3D stage or the 2D fallback. */
interface Desk {
  setEra(id: EraId): void
  establish(): Promise<void>
  dayTitle(t: DayTitle): Promise<void>
  showMessage(s: SheetSpec): Promise<void>
  redrawMessage(s: SheetSpec): void
  stamp(kind: StampKind): Promise<void>
  flash(kind: FlashKind): void
  caught(): Promise<void>
  skip(): void
  setPaused(p: boolean): void
  dispose(): void
  /** The desk names its own beats (arrival, stamp impact) through onCue; the flat desk does not. */
  cues: boolean
  /** The verdict on the paper: the slip ringed, a margin note, then the back. */
  reveal(s: RevealSpec): Promise<void>
  /** Where the back's source line and the paper are on screen, for the buttons over and under them. */
  getSourceRect(): ScreenRect | null
  getPaperRect(): ScreenRect | null
  /** The read paper goes in the basket (it names its own beats, on both desks). */
  toss(): Promise<void>
  /** After Begin: the YOU and Tota cards on the desk; resolves once they have settled. */
  intro(s: IntroSpec): Promise<void>
  clearIntro(): Promise<void>
}

const REVEAL_GUARD_MS = 9000 // the circle, the margin note and the turn of the paper
const TOSS_GUARD_MS = 4000 // the paper into the basket, about 1.5 s
// The caught sequence runs about 4.2 s (scene/caught.ts); the guard leaves it room, and a slow
// frame or two, but never lets a desk that stopped ticking hold the verdict back.
const CAUGHT_GUARD_MS = 6500
// The paper's arrival. The 1947 telegram types itself out over 5-6 s by design, so the arrival gets
// the long guard: with the short one the stamps woke before the telegram could be read.
const ARRIVAL_GUARD_MS = 9000
// The intro after Begin: the cards load their portraits (about a second at most), slide in and
// settle, then wait for Continue (owner 10-24: never go on by itself).
const INTRO_GUARD_MS = 5000


type Play =
  | { kind: 'chapter'; era: Era; difficulty: Difficulty; state: ChapterState }
  | { kind: 'daily'; era: Era; daily: Daily; state: ChapterState; results: boolean[] }

interface DailyRecord { era: EraId; number: number; results: boolean[] }

type Screen = 'main' | 'intro' | 'day' | 'end' | 'credits'

export function startApp(root: AppRoot, env: AppEnv): void {
  const ui = root.ui
  const params = env.url.searchParams
  const seed = parseSeed(params.get('seed'))
  const tierParam = params.get('tier')
  const forceTier = TIERS.find((x) => x === tierParam)
  const langParam = params.get('lang')
  const reducedMotion = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

  // ------------------------------------------------------------------ state

  let screen: Screen = 'main'
  /** Redraws the screen on show, for a language change. */
  let redraw: () => void = () => undefined
  let play: Play | null = null
  let readable = false // the paper is in view: stamps work, the agarbatti burns
  let revealed = false
  let busy = false // a stamp is being animated
  let stampedWith: Verdict | null = null // the stamp being animated, so a redraw keeps the stamps asleep
  let gen = 0 // bumps on every navigation and every new day; async work started before it is dropped

  let muted = store.get<unknown>('muted', false) === true

  // A friend's share link picks their chapter and mode: /s/<code> when the offline copy answers
  // it, or the link page's ?chapter=…&mode=… (server/share.ts). Neither is remembered.
  const sharedCode = codeFromPath(env.url.pathname)
  const shared = sharedCode ? parseShareCode(sharedCode)?.result ?? null : null
  const sharedEra = ERAS.find((e) => e.id === (shared ? shared.era : params.get('chapter')))?.id
  const sharedMode = DIFFICULTIES.find((d) => d === (shared ? shared.mode : params.get('mode')))

  // the main page's choices
  let selected: EraId = sharedEra ?? suggestedEra(ERAS, bests())?.id ?? ERAS[0]?.id ?? 'delhi-1857'
  const savedMode = store.get<unknown>('difficulty', 'easy')
  let difficulty: Difficulty = sharedMode ?? DIFFICULTIES.find((d) => d === savedMode) ?? 'easy'

  // sound and language, top right on every screen (in the top bar during a day)
  const controls = h('div', { class: 'controls-dock' })

  // the desk (3D stage or 2D fallback), and what it should show
  let desk: Desk | null = null
  let deskEra: EraId | null = sharedEra ?? suggestedEra(ERAS, bests())?.id ?? null
  let deskDirty = false // a paper, a stamp or the caught dimming is on it
  let stageLoad: Promise<void> | null = null
  // settles whenever a new desk is attached, so a reveal on a lost desk is not waited for
  let deskSwapped = signal()

  // read-aloud
  let voice: Voice | null = null
  let voiceState: VoiceState = 'idle'
  // any stored value but an enabled voice falls back to the dastango (the old 'era' included)
  const storedVoice = store.get<unknown>('voiceStyle', DEFAULT_VOICE)
  let voiceStyle: VoiceChoice = voiceChoices().find((id) => id === storedVoice) ?? DEFAULT_VOICE

  // the stamp whose thunk waits for the stage's impact beat
  let pendingThunk: StampKind | null = null
  // the verdict on the paper: null before the stamp, else whether the chapter's end buttons show
  let verdictEnd: boolean | null = null
  // a phone on its side: the width of the controls beside the paper, kept for the verdict
  let sideInset = 0
  // the verdict as the paper's back shows it, and whether it ends the chapter
  let paper: { spec: RevealSpec; end?: 'caught' | 'survived' } | null = null

  // After a right stamp on a day that leads on, the verdict holds on the paper for TOSS_HOLD_MS,
  // then the paper is tossed into the basket and the next day starts by itself. The hold runs on
  // animation frames (so a hidden tab holds it) and waits while the source card is open.
  let auto = false // the verdict on the paper leads on by itself (no Next button)
  let tossing = false
  let holdLeft = 0 // ms of reading still to run
  let holdRaf = 0
  let holdLast = 0
  let sourceOpen = false
  let holdSpent = 0 // ms of frames since the verdict went up, so the tail of a skip is not a toss

  // the intro after Begin, and its wait before going on by itself
  let intro: { era: Era; difficulty: Difficulty; started: boolean; settled: boolean } | null = null

  // the agarbatti
  let timerArmed = false
  let timerRaf = 0
  let timerLast = 0
  let timeLeft = 1
  let timeTotal = 1
  let lastWhole = Infinity

  const alive = () => ui.isConnected

  // ------------------------------------------------------------------ boot

  if (langParam === 'en' || langParam === 'hi') setLang(langParam)
  else document.documentElement.lang = getLang()
  audio.setMuted(muted)

  // Sound unlocks on the first gesture anywhere (iOS needs it inside the gesture), and again on
  // later gestures in case the system suspended it.
  const unlock = () => audio.unlock()
  for (const ev of ['pointerup', 'touchend', 'click', 'keydown']) document.addEventListener(ev, unlock, { capture: true, passive: true })
  document.addEventListener('visibilitychange', () => {
    // a hidden tab makes no sound: the audio context sleeps and wakes (unless muted) on return
    audio.setHidden(document.hidden === true)
    syncPause()
    // back on the tab, the verdict gets a fresh moment before the paper goes
    if (document.hidden !== true) extendHold()
    syncHold()
  })
  let insetTimer = 0
  window.addEventListener('resize', () => {
    // after the layout settles (the 900 px switch moves the case file), tell the stage again
    window.clearTimeout(insetTimer)
    insetTimer = window.setTimeout(() => {
      if (!alive()) return
      if (screen === 'day') syncHudInsets()
      else if (screen === 'intro' && intro?.started) {
        // the cards re-lay for the screen's new shape (after the stage has taken its new size),
        // and the slip follows them once the camera has re-fitted
        syncIntroInsets()
        void desk?.intro(introSpecFor(intro.era, getLang())).then(placeIntroChip)
        window.setTimeout(placeIntroChip, 600)
      }
    }, screen === 'intro' ? 220 : 60)
  })

  root.stage.addEventListener(STAGE_LOST_EVENT, (e) => {
    // The WebGL context is gone: swap in the 2D desk. The day on screen carries on untouched.
    e.preventDefault()
    const old = desk
    desk = null
    old?.dispose()
    attach(null)
  })

  // Read-aloud is off until the voice plan allows it: only VITE_VOICE=on at build time loads the era
  // voices and shows the Listen button. Any other value leaves the module out of the build.
  if (env.voice) bindVoice(env.voice)
  else if (import.meta.env.VITE_VOICE === 'on') {
    import('./audio/voice').then((m) => alive() && bindVoice(m.voice), (err: unknown) => console.warn('[app] read-aloud could not load', err))
  }

  // ?inspect exposes the game state to test scripts without the stage's ?debug overlay.
  if (params.has('debug') || params.has('inspect')) {
    ;(window as unknown as { __ft?: unknown }).__ft = {
      get screen() { return screen },
      get play() { return play },
      get revealed() { return revealed },
      get readable() { return readable },
      /** 'stage' (3D), 'fallback' (2D) or null while neither has arrived. */
      get desk() { return desk ? (desk.cues ? 'stage' : 'fallback') : null },
      /** Where the paper is on screen (CSS px), for layout checks. */
      paperRect: () => desk?.getPaperRect() ?? null,
      /** The intro after Begin: null, or whether its cards have settled. */
      get intro() { return intro ? { settled: intro.settled } : null },
    }
  }

  document.body.appendChild(controls)
  // the address bar drops the share link's path and picks once they are read
  if (sharedCode !== null || params.has('chapter') || params.has('mode')) cleanShareUrl()
  // the daily puzzle is off the main page for now; ?daily (or a shared daily result) still opens it
  if (params.has('daily') || shared?.mode === 'daily') openDaily()
  else showMain()

  // Ruling R10: the first screen paints without three.js; the stage loads after that paint, when
  // the browser is idle, or at once on the first chapter tap.
  requestAnimationFrame(() => {
    if (typeof requestIdleCallback === 'function') requestIdleCallback(() => void ensureStage(), { timeout: 3000 })
    else setTimeout(() => void ensureStage(), 300)
  })

  // ------------------------------------------------------------------ the desk

  function ensureStage(): Promise<void> {
    if (!stageLoad) {
      stageLoad = Promise.all([loadStage(), import('./scene/eras/index')])
        .then(([mod, eras]) => {
          if (!alive()) return
          const s = mod.createStage(root.stage, { reducedMotion, forceTier, onCue })
          attach(s ? stageDesk(s, eras.dressingFor) : null)
        })
        .catch((err: unknown) => {
          console.warn('[app] the 3D stage could not load; using the 2D desk', err)
          if (alive()) attach(null)
        })
    }
    return stageLoad
  }

  /** Puts a desk in place (null = the 2D fallback) and brings it up to date. */
  function attach(d: Desk | null): void {
    if (d) {
      desk = d
      if (deskEra) d.setEra(deskEra)
    } else {
      desk = fallbackDesk(mountFallback(root.stage, deskEra ?? ERAS[0]?.id ?? 'delhi-1857', { onCue }))
    }
    const p = play
    if (p && screen === 'day') {
      // A desk that arrives once the paper was readable (a lost context) shows it at once; during
      // the arrival, arrive() brings it in on whichever desk is there. A paper already on its way
      // to the basket is not brought back: the next day's title follows on the new desk.
      if ((readable || revealed) && !tossing) catchUp(p)
    } else if (screen === 'intro' && intro?.started) {
      // a desk that arrives during the intro (a lost context) shows the cards at once
      void desk.intro(introSpecFor(intro.era, getLang()))
      desk.skip()
    } else if (screen === 'main') {
      void desk.establish()
    }
    syncPause()
    deskSwapped.resolve()
    deskSwapped = signal()
  }

  /**
   * Brings a new desk up to the day at once: the paper, and when the verdict shows, its back (the
   * reveal, finished by skip()). The day is drawn again once the back is up, so the source button
   * sits over the new desk's source line (getSourceRect), not the lost one's.
   */
  function catchUp(p: Play): void {
    const d = desk
    if (!d) return
    void d.showMessage(sheetFor(p))
    const spec = revealed ? paperInLang(p)?.spec : undefined
    if (!spec) {
      d.skip()
      return
    }
    const token = gen
    const done = d.reveal(spec)
    d.skip()
    drawDay()
    void guard(done, REVEAL_GUARD_MS).then(() => {
      if (token === gen && desk === d && play === p && revealed) drawDay()
    })
  }

  /** The verdict's back in the language on screen (rebuilt when the language changed). */
  function paperInLang(p: Play): typeof paper {
    const msg = currentMessage(p)
    const lang = getLang()
    if (paper && msg && paper.spec.lang !== lang) {
      paper = { ...paper, spec: buildReveal({ era: p.era, msg, verdict: p.state.lastVerdict ?? 'timeout', lang, ...(paper.end ? { end: paper.end } : {}) }) }
    }
    return paper
  }

  /**
   * Both sides of the paper in the language on screen: the front (its real-document tag only once
   * revealed) and, when the verdict shows, the back. Never during the stamp or the reveal: onStamp
   * calls it once they settle.
   */
  function syncPaper(p: Play): void {
    const d = desk
    if (!d) return
    if (readable || revealed) d.redrawMessage(sheetFor(p))
    const before = paper?.spec
    const now = paperInLang(p)
    if (!now || now.spec === before) return
    const token = gen
    void guard(d.reveal(now.spec), REVEAL_GUARD_MS).then(() => {
      if (token === gen && desk === d && play === p && revealed) drawDay()
    })
  }

  function stageDesk(s: Stage, dressingFor: (id: EraId) => EraDressing): Desk {
    return {
      toss: () => s.toss(),
      reveal: (x) => s.reveal(x),
      getSourceRect: () => s.getSourceRect(),
      getPaperRect: () => s.getPaperRect(),
      setEra: (id) => s.setEra(dressingFor(id)),
      establish: () => s.establish(),
      dayTitle: (x) => s.dayTitle(x),
      showMessage: (x) => s.showMessage(x),
      redrawMessage: (x) => s.redrawMessage(x),
      stamp: (k) => s.stamp(k),
      flash: (k) => s.flash(k),
      caught: () => s.caught(),
      skip: () => s.skip(),
      setPaused: (p) => s.setPaused(p),
      dispose: () => s.dispose(),
      intro: (x) => s.intro(x),
      clearIntro: () => s.clearIntro(),
      cues: true,
    }
  }

  /** The flat desk: the same sheet, title, imprint and flash, drawn on one canvas. */
  function fallbackDesk(f: Fallback): Desk {
    return {
      toss: () => f.toss(),
      reveal: (x) => f.reveal(x),
      getSourceRect: () => f.getSourceRect(),
      getPaperRect: () => f.getPaperRect(),
      setEra: (id) => f.setEra(id),
      establish: () => Promise.resolve(),
      dayTitle: (x) => f.dayTitle(x),
      showMessage: (x) => f.showMessage(x),
      redrawMessage: (x) => f.redrawMessage(x),
      stamp: (k) => f.stamp(k),
      flash: (k) => f.flash(k),
      caught: () => f.caught(),
      skip: () => f.skip(),
      setPaused: () => undefined,
      dispose: () => f.dispose(),
      intro: (x) => f.intro(x),
      clearIntro: () => f.clearIntro(),
      cues: false,
    }
  }

  /**
   * The stage's beats, as sound, in sync: the typewriter keys, the seal, the arrival, right and wrong
   * inside flash(). The stamp's thunk depends on which stamp, so it is played here on the impact beat.
   */
  function onCue(name: StageCueName): void {
    if (name === 'stamp') return thunk()
    const c = cueForStage(name)
    if (c) audio.cue(c)
  }

  function thunk(): void {
    const k = pendingThunk
    pendingThunk = null
    if (k) audio.cue(k === 'asli' ? 'stampAsli' : 'stampTota')
  }

  /**
   * Tells the stage where the overlay sits, so the lean-in keeps the paper clear of it: the top bar;
   * the tabs and stamps below (beside the paper on a phone on its side); in landscape the pinned
   * cards on the left; and once the verdict is on the paper, the buttons under or beside it.
   */
  function syncHudInsets(): void {
    const el = root.stage
    const H = window.innerHeight || document.documentElement.clientHeight
    const W = window.innerWidth || document.documentElement.clientWidth
    const rectOf = (node: Element | null) => {
      const r = node?.getBoundingClientRect()
      return r && r.height > 0 && r.width > 0 ? r : null
    }
    const rect = (sel: string) => rectOf(ui.querySelector(sel))
    const all = (sels: string[]) => sels.flatMap((sel) => [...ui.querySelectorAll(sel)].map(rectOf)).filter((r): r is DOMRect => r !== null)
    const day = ui.querySelector<HTMLElement>('.screen--day')
    const hud = rect('.hud')
    if (!day || !hud) return
    const wide = day.dataset.layout === 'wide'
    const short = day.hasAttribute('data-short')
    let bottom = 0
    let side = 0 // a phone on its side: what stands beside the paper, kept equal both sides
    if (short) {
      const lefts = all(['.tab--file', '.stamp--asli'])
      const rights = all(['.tab--rules', '.stamp--tota', '.listen-group', '.paper-result__actions > *'])
      const l = lefts.length ? Math.max(...lefts.map((r) => r.right)) : 0
      const r = rights.length ? W - Math.min(...rights.map((x) => x.left)) : 0
      if (l || r) sideInset = Math.max(l, r) + 8
      side = sideInset
      bottom = 8
    } else if (verdictEnd !== null) {
      // nothing waits under a verdict that leads on by itself, so the paper may use the room
      const acts = all(['.paper-result__actions > *'])
      bottom = acts.length ? H - Math.min(...acts.map((r) => r.top)) + 8 : verdictEnd ? 230 : auto ? 24 : 110
    } else {
      const below = all(['.day__controls .tabs', '.day__controls .stamps'])
      bottom = below.length ? H - Math.min(...below.map((r) => r.top)) + 6 : 0
    }
    const dossier = wide ? rect('.dossier') : null
    el.style.setProperty('--ft-hud-top', `${Math.ceil(hud.bottom + 6)}px`)
    el.style.setProperty('--ft-hud-bottom', `${Math.ceil(bottom)}px`)
    el.style.setProperty('--ft-hud-left', `${Math.ceil(dossier ? dossier.right + 12 : side)}px`)
    el.style.setProperty('--ft-hud-right', `${Math.ceil(wide ? Math.max(0, W - hud.right) : side)}px`)
  }

  /** Shows an era's desk. A desk with a paper or the caught dimming on it is rebuilt clean. */
  function setDeskEra(id: EraId | null | undefined): void {
    if (!id || (id === deskEra && !deskDirty)) return
    deskEra = id
    deskDirty = false
    desk?.setEra(id)
  }

  /** The wide shot of the room, behind the cards. */
  function establish(): void {
    if (desk) void desk.establish()
  }

  /** The agarbatti runs only on a day in progress with the tab visible; the room holds still only while hidden. */
  function syncPause(): void {
    if (!alive()) return
    const hidden = document.hidden === true
    const run = timerArmed && !hidden
    if (run && !timerRaf) {
      timerLast = 0
      timerRaf = requestAnimationFrame(tick)
    } else if (!run && timerRaf) {
      cancelAnimationFrame(timerRaf)
      timerRaf = 0
    }
    desk?.setPaused(hidden)
  }

  // ------------------------------------------------------------------ read-aloud

  function bindVoice(v: Voice): void {
    voice = v
    v.onState((s) => {
      voiceState = s
      if (screen === 'day') setVoiceState(ui, s)
    })
    if (screen === 'day' && !revealed) drawDay()
  }

  function stopVoice(): void {
    voice?.stop()
  }

  function toggleVoice(): void {
    const p = play
    const msg = p && currentMessage(p)
    if (!voice || !p || !msg || !readable || revealed) return
    if (voiceState === 'loading' || voiceState === 'playing') return voice.stop()
    // play() starts inside this tap (iOS); the day is the chapter day whose date is on screen
    voice.play({ era: p.era.id, id: msg.id, lang: getLang(), day: dateDay(p), voice: voiceStyle }).catch(() => undefined)
  }

  function chooseVoice(id: string): void {
    const next = voiceChoices().find((v) => v === id)
    if (!next || next === voiceStyle) return
    voiceStyle = next
    store.set('voiceStyle', next)
    stopVoice()
  }

  /** The voices a picker offers; with only the dastango there is nothing to pick. */
  function voiceList(lang: 'en' | 'hi'): { id: string; label: string; credit?: string }[] {
    return voiceChoices().map((id) => {
      const credit = VOICES[id].credit
      return { id, label: VOICES[id].label[lang], ...(credit ? { credit } : {}) }
    })
  }

  // ------------------------------------------------------------------ the agarbatti

  function armTimer(seconds: number): void {
    timeTotal = seconds
    timeLeft = seconds
    lastWhole = Math.ceil(seconds)
    timerArmed = true
    syncPause()
  }

  function disarmTimer(): void {
    timerArmed = false
    syncPause()
  }

  function tick(now: number): void {
    timerRaf = 0
    if (!timerArmed || !alive()) return
    const dt = timerLast ? Math.min(Math.max(0, now - timerLast), MAX_FRAME_MS) : 0
    timerLast = now
    timeLeft = Math.max(0, timeLeft - dt / 1000)
    const frac = timeLeft / timeTotal
    setTimer(ui, frac, timeLeft)
    const whole = Math.ceil(timeLeft)
    if (whole < lastWhole && timeLeft > 0) {
      lastWhole = whole
      audio.cue('incense')
      if (timeLeft <= TENSION_S) audio.cue('tensionTick', { level: 1 - timeLeft / TENSION_S })
      else if (frac < LOW_TIME) audio.cue('clockTick')
    }
    if (timeLeft <= 0) {
      timerArmed = false
      void onStamp('timeout')
      return
    }
    timerRaf = requestAnimationFrame(tick)
  }

  // ------------------------------------------------------------------ navigation

  /** Ends whatever was in play. */
  function leave(): void {
    gen++
    if (intro) {
      intro = null
      void desk?.clearIntro()
    }
    play = null
    readable = false
    revealed = false
    busy = false
    stampedWith = null
    endHold()
    stopVoice()
    disarmTimer()
    closeShareSlip() // the slip belongs to the screen it was opened on
  }

  function toggleSound(): boolean {
    muted = !muted
    store.set('muted', muted)
    audio.setMuted(muted)
    return !muted
  }

  /** Sound and language, top right; during a day they live in the top bar instead. */
  function drawControls(): void {
    controls.hidden = screen === 'day'
    controls.replaceChildren(controlCluster({ soundOn: !muted, lang: getLang() }, {
      sound: () => {
        const btn = controls.querySelector<HTMLButtonElement>('[data-action="sound"]')
        const on = toggleSound()
        if (btn) setSoundToggle(btn, on, getLang())
        audio.cue('toggleClick')
      },
      lang: (l: Lang) => {
        setLang(l)
        audio.cue('plaqueFlick')
        redraw()
      },
    }))
  }

  /** Shows a screen: remembers how to redraw it (a language change) and refreshes the controls. */
  function show(next: Screen, draw: () => void): void {
    screen = next
    redraw = () => {
      draw()
      drawControls()
    }
    redraw()
  }

  /** The one main page: the chosen chapter's paper over its room. */
  function showMain(): void {
    leave()
    setDeskEra(selected)
    establish()
    audio.ambience(selected)
    syncPause()
    show('main', () => renderMain(ui, { eras: ERAS, best: bests(), selected, difficulty }, {
      select: (id) => {
        if (id === selected || screen !== 'main') return // (not while the page slides away after Begin)
        selected = id
        void ensureStage()
        setDeskEra(id)
        establish()
        audio.ambience(id)
        audio.cue('cardTurn')
        redraw()
      },
      difficulty: (d) => {
        if (d === difficulty || screen !== 'main') return
        audio.cue('toggleClick')
        difficulty = d
        store.set('difficulty', d)
        redraw()
      },
      begin: () => {
        if (screen !== 'main') return // the page is already on its way out
        void ensureStage()
        showIntro(eraById(selected), difficulty)
      },
      credits: () => showCredits(showMain),
    }))
  }

  function showCredits(back: () => void): void {
    closeShareSlip()
    show('credits', () => renderCredits(ui, { back }))
  }

  // ------------------------------------------------------------------ the intro after Begin

  /** Who you are and who the Tota is: two illustrated cards on the desk, then day 1. */
  function showIntro(era: Era, d: Difficulty): void {
    const page = ui.querySelector<HTMLElement>('.screen--main')
    leave()
    setDeskEra(era.id)
    intro = { era, difficulty: d, started: false, settled: false }
    show('intro', drawIntro)
    if (page && !reducedMotion) fadeOut(page)
    void playIntro(gen)
  }

  /** The main page's paper slides away over the room as the cards come in. */
  function fadeOut(page: HTMLElement): void {
    page.classList.add('is-leaving')
    page.setAttribute('aria-hidden', 'true')
    page.querySelectorAll('button').forEach((b) => b.setAttribute('tabindex', '-1'))
    ui.appendChild(page)
    window.setTimeout(() => page.remove(), 400)
  }

  function introSpecFor(era: Era, lang: Lang): IntroSpec {
    const base = import.meta.env.BASE_URL ?? '/'
    return {
      era: era.id,
      lang,
      you: { label: t('introYou', lang), line: era.persona[lang], art: `${base}art/${era.id}-you.webp` },
      tota: { label: t('introTota', lang), line: era.forger[lang], art: `${base}art/${era.id}-tota.webp` },
    }
  }

  function drawIntro(): void {
    const it = intro
    if (!it) return
    const lang = getLang()
    const spec = introSpecFor(it.era, lang)
    renderIntro(ui, { era: it.era, lang, you: spec.you, tota: spec.tota, settled: it.settled }, { go: continueIntro, tap: tapIntro })
    syncIntroInsets()
    if (it.settled) placeIntroChip()
    // a language change redraws the cards on the desk in the new language
    if (it.started) void desk?.intro(spec)
  }

  async function playIntro(token: number): Promise<void> {
    const it = intro
    const stale = () => token !== gen || intro !== it || screen !== 'intro' || !alive()
    if (!it) return
    if (!desk) await guard(ensureStage(), STAGE_WAIT_MS)
    if (stale()) return
    if (!desk) attach(null)
    const d = desk
    it.started = true
    syncIntroInsets()
    // a desk lost mid-intro never finishes it: stop waiting as soon as a new desk is attached
    await guard(Promise.race([d ? d.intro(introSpecFor(it.era, getLang())) : Promise.resolve(), deskSwapped.promise]), INTRO_GUARD_MS)
    if (stale()) return
    it.settled = true
    placeIntroChip()
    setIntroSettled(ui)
  }

  /**
   * On a wide screen the Continue slip sits just under the cards (where the stage says they are);
   * on a phone, or when there is no room under them, it stays along the bottom.
   */
  function placeIntroChip(): void {
    const foot = ui.querySelector<HTMLElement>('.intro__foot')
    if (!foot || screen !== 'intro') return
    const W = window.innerWidth || document.documentElement.clientWidth
    const H = window.innerHeight || document.documentElement.clientHeight
    const r = W > H ? desk?.getPaperRect() ?? null : null
    const goH = foot.querySelector('.intro__go')?.getBoundingClientRect().height || 60
    const top = r && r.h > 0 ? Math.round(r.y + r.h + 14) : 0
    const under = top > 0 && top + goH <= H - 6
    foot.classList.toggle('is-under', under)
    foot.style.top = under ? `${top}px` : ''
  }

  /** A tap on the room finishes the cards' motion; only Continue goes on. */
  function tapIntro(): void {
    if (intro && !intro.settled) desk?.skip()
  }

  function continueIntro(): void {
    const it = intro
    if (!it || screen !== 'intro') return
    if (!desk?.cues) audio.cue('cardSlide') // the 3D desk sounds the cards leaving itself
    startChapter(it.era, it.difficulty) // its leave() sends the cards off the desk
  }

  /**
   * The stage keeps the cards clear of the plaques (top right) and the Continue slip: along the
   * bottom on a phone; on a wide screen, room for the slip just under the cards, so the pair and
   * its slip sit centred together.
   */
  function syncIntroInsets(): void {
    const el = root.stage
    const W = window.innerWidth || document.documentElement.clientWidth
    const H = window.innerHeight || document.documentElement.clientHeight
    const dock = controls.getBoundingClientRect()
    const go = ui.querySelector('.intro__go')?.getBoundingClientRect()
    const goH = go && go.height > 0 ? go.height : 60
    const bottom = W > H ? goH + 30 : go && go.height > 0 ? H - go.top + 12 : 96
    el.style.setProperty('--ft-hud-top', `${Math.ceil(dock.height > 0 ? dock.bottom + 8 : 66)}px`)
    el.style.setProperty('--ft-hud-bottom', `${Math.ceil(bottom)}px`)
    el.style.setProperty('--ft-hud-left', '0px')
    el.style.setProperty('--ft-hud-right', '0px')
  }

  function startChapter(era: Era, d: Difficulty): void {
    let state: ChapterState
    try {
      // a replay steers away from the player's last two runs of this chapter (a ?seed run stays fixed)
      state = seed === null ? createChapter(era, d, env.random, recentUnits(era.id)) : createChapter(era, d, mulberry32(seed))
    } catch (err) {
      console.error('[app] could not build the chapter', err)
      showMain()
      return
    }
    if (seed === null) rememberRun(era.id, state.queue)
    leave()
    setDeskEra(era.id)
    audio.ambience(era.id)
    play = { kind: 'chapter', era, difficulty: d, state }
    gameEvent('chapter_start', { era: era.id, mode: d, lang: getLang() })
    beginDay()
  }

  /** The message units of the player's last two runs of a chapter. */
  function recentUnits(id: EraId): Set<string> {
    const runs = store.get<unknown>(`recent:${id}`, [])
    return new Set(Array.isArray(runs) ? runs.flat().filter((u): u is string => typeof u === 'string') : [])
  }

  function rememberRun(id: EraId, queue: Message[]): void {
    const runs = store.get<unknown>(`recent:${id}`, [])
    const last = Array.isArray(runs) && Array.isArray(runs[0]) ? [runs[0]] : []
    store.set(`recent:${id}`, [queue.map(unitOf), ...last])
  }

  // ------------------------------------------------------------------ a day

  function currentMessage(p: Play): Message | undefined {
    return p.state.queue[p.state.day - 1]
  }

  /** The chapter day whose date is on screen; the daily puzzle plays on the window's last days, when every rule is known. */
  function dateDay(p: Play): number {
    return p.kind === 'chapter' ? p.state.day : DAYS.hard - p.state.days + p.state.day
  }

  function isoDateFor(p: Play): string {
    return dayDate(p.era, dateDay(p))
  }

  /** What the paper shows today. Only after the stamp may it carry its real-document tag (R30b). */
  function sheetFor(p: Play, lang = getLang()): SheetSpec {
    const msg = currentMessage(p)
    if (!msg) throw new Error(`No message for day ${p.state.day}`)
    const pencil = p.kind === 'daily' ? false : pencilOn(p.state.difficulty, p.state.day)
    const sheet = buildSheet({ era: p.era, msg, isoDate: isoDateFor(p), lang, pencil })
    return revealed ? { ...sheet, documentMark: !!msg.document, revealed: true } : sheet
  }

  function beginDay(): void {
    const p = play
    if (!p) return
    controls.hidden = true
    const token = ++gen
    stopVoice()
    readable = false
    revealed = false
    busy = false
    stampedWith = null
    paper = null
    verdictEnd = null
    endHold()
    deskDirty = true
    timerArmed = false
    timeLeft = timeTotal = TIMER_S[p.state.difficulty]
    syncPause()
    screen = 'day'
    drawDay()
    void arrive(p, token)
  }

  /** The day title, then the message comes in. Only once it can be read do the stamps and the agarbatti start. */
  async function arrive(p: Play, token: number): Promise<void> {
    const stale = () => token !== gen || play !== p || !alive()
    if (!desk) await guard(ensureStage(), STAGE_WAIT_MS)
    if (stale()) return
    if (!desk) attach(null)
    const lang = getLang()
    await guard(desk ? desk.dayTitle(dayTitleFor(p.state.day, isoDateFor(p), lang)) : Promise.resolve())
    if (stale()) return
    if (!desk?.cues) audio.cue('arrive') // the 3D stage cues it when the paper actually moves
    syncHudInsets()
    const d = desk
    await guard(d ? d.showMessage(sheetFor(p, lang)) : Promise.resolve(), ARRIVAL_GUARD_MS)
    if (stale()) return
    if (desk && desk !== d) {
      // the desk changed under the arrival (a lost context): show the paper on the new one
      void desk.showMessage(sheetFor(p))
      desk.skip()
    } else if (getLang() !== lang) desk?.redrawMessage(sheetFor(p)) // the language changed during the arrival
    readable = true
    setReadable(ui)
    armTimer(TIMER_S[p.state.difficulty])
  }

  function drawDay(): void {
    const p = play
    if (!p) return
    screen = 'day'
    const lang = getLang()
    // drawing the day again closes a source card that was open over the verdict
    if (sourceOpen) {
      sourceOpen = false
      extendHold()
    }
    renderDay(ui, {
      era: p.era,
      state: p.state,
      lang,
      sheet: sheetFor(p, lang),
      timerFrac: timeLeft / timeTotal,
      secs: timeLeft,
      readable,
      revealed,
      soundOn: !muted,
      ...(voice ? { voice: voiceState, voiceStyle, voices: voiceList(lang) } : {}),
      ...(p.kind === 'daily' ? { daily: p.daily.number, allRules: true } : {}),
      ...(revealed && paper ? { onPaper: paperFor(p, paper) } : {}),
      ...(tossing ? { tossing: true } : {}),
    }, {
      stamp: (v) => void onStamp(v),
      listen: toggleVoice,
      voiceStyle: chooseVoice,
      tab: () => audio.cue('fileOpen'),
      next: onNext,
      skip: () => desk?.skip(),
      toss: hurry,
      pop: (open) => {
        // the hold waits while the source card is open, and gives a fresh moment when it closes
        sourceOpen = open
        if (!open) extendHold()
        syncHold()
      },
      sound: () => {
        setSound(ui, toggleSound(), getLang())
        audio.cue('toggleClick')
      },
      lang: () => {
        setLang(getLang() === 'en' ? 'hi' : 'en')
        audio.cue('plaqueFlick')
        stopVoice()
        extendHold() // the verdict, now in the other language, gets its moment to be read
        // During the stamp or the reveal the paper keeps its language until the animation settles,
        // then onStamp redraws both sides in the new one; the stamps stay asleep meanwhile.
        if (!busy) syncPaper(p)
        drawDay()
      },
      quit: showMain,
      again: () => {
        if (p.kind === 'chapter') startChapter(p.era, p.difficulty)
      },
      home: showMain,
      share: () => {
        if (p.kind === 'chapter' && paper?.end) shareChapter(p, paper.end)
      },
    })
    // a redraw mid-stamp (a language switch) keeps the stamps asleep until the verdict is up
    if (busy && stampedWith) setStamping(ui, stampedWith)
    controls.hidden = true
    syncHudInsets()
    syncHold()
  }

  /** What the DOM keeps while the verdict is on the paper: a mirror, the source button and the end's receipts. */
  function paperFor(p: Play, r: { spec: RevealSpec; end?: 'caught' | 'survived' }) {
    const msg = currentMessage(p)
    const b = r.spec.back
    const stop = r.spec.lang === 'hi' ? '।' : '.'
    return {
      mirror: [b.verdictLine, b.tell, b.consequence, b.stamp?.text].filter(Boolean).join(`${stop} `),
      sourceRect: desk?.getSourceRect() ?? null,
      paperRect: desk?.getPaperRect() ?? null,
      sources: [...(msg ? messageSources(msg, p.era) : []), ...(r.end ? p.era.epilogue.sources : [])],
      ...(msg ? { kind: kindLine(msg, r.spec.lang) } : {}),
      ...(r.end ? { end: { receipts: p.era.receipts } } : {}),
      ...(auto ? { auto: true } : {}),
    }
  }

  async function onStamp(v: Verdict): Promise<void> {
    const p = play
    if (!p || busy || revealed || !readable || p.state.phase !== 'reading') return
    busy = true
    stampedWith = v
    const token = gen
    const langAtStamp = getLang()
    stopVoice()
    disarmTimer()
    p.state = stamp(p.state, v)
    const correct = p.state.lastCorrect === true
    if (p.kind === 'daily') {
      p.results = [...p.results, correct]
      saveDaily(p.daily, p.results)
    }
    // The stamps stop taking taps while the desk plays the stamp, or the caught beat when the
    // agarbatti burnt out. A tap on the room finishes the animation.
    if (v !== 'timeout') audio.cue('stampPress')
    setStamping(ui, v)
    if (v !== 'timeout') {
      await stampDesk(v)
      if (token !== gen) return
    }
    // a right stamp flashes the room (the stage sounds it inside flash(), the flat desk needs the
    // game to); a wrong one, or the agarbatti burning out, plays the caught sequence: a beat of
    // silence, the era's alarm, the room answering it, then the dark (both desks voice its beats)
    const flash: FlashKind = correct ? 'right' : 'wrong'
    desk?.flash(flash)
    if (!desk?.cues && correct) audio.cue('correct')
    if (!correct) {
      // a desk lost mid-sequence never finishes it: stop waiting as soon as a new desk is attached
      await guard(desk ? Promise.race([desk.caught(), deskSwapped.promise]) : Promise.resolve(), CAUGHT_GUARD_MS)
      if (token !== gen) return
    }
    // The verdict goes on the paper's back when the desk can turn it over: the slip circled, a margin
    // note, then the verdict, the tell and, at the chapter's end, the era's ending and its stamp.
    const msg = currentMessage(p)
    const end = p.kind !== 'chapter' ? undefined : !correct ? 'caught' : p.state.day >= p.state.days ? 'survived' : undefined
    const revealDesk = desk
    // a right stamp that leads on (not the chapter's end): no Next, the paper goes once read
    auto = correct && !end && !!revealDesk && !!msg
    if (revealDesk && msg) {
      // the language switched during the stamp: the front catches up before the paper turns over
      if (getLang() !== langAtStamp) revealDesk.redrawMessage(sheetFor(p))
      const spec = buildReveal({ era: p.era, msg, verdict: v, lang: getLang(), ...(end ? { end } : {}) })
      // the buttons below (or beside) the paper's back take more room than the stamps did at the end
      verdictEnd = !!end
      syncHudInsets()
      if (end && p.era.channel === 'telegram') audio.cue('endTelegram') // the ending comes off the teleprinter
      // a desk lost mid-reveal never finishes it: stop waiting as soon as a new desk is attached
      await guard(Promise.race([revealDesk.reveal(spec), deskSwapped.promise]), REVEAL_GUARD_MS)
      if (token !== gen) return
      paper = { spec, ...(end ? { end } : {}) }
      if (end && p.kind === 'chapter') closeChapter(p, end)
    }
    revealed = true
    busy = false
    stampedWith = null
    if (paper && desk && desk !== revealDesk) catchUp(p) // the desk was lost during the reveal
    else if (paper && paper.spec.lang !== getLang()) syncPaper(p) // the language switched during the reveal
    drawDay()
    if (auto) startHold()
  }

  /** The chapter ended on the paper: keep the best run, mark a survived chapter. */
  function closeChapter(p: Extract<Play, { kind: 'chapter' }>, outcome: 'survived' | 'caught'): void {
    if (outcome === 'survived') p.state = nextDay(p.state)
    const survived = outcome === 'survived' ? p.state.days : p.state.day - 1
    recordBest(p.era.id, p.difficulty, survived)
    gameEvent('chapter_end', { era: p.era.id, mode: p.difficulty, outcome, days: survived, lang: getLang() })
    if (outcome === 'survived') audio.cue('survived')
  }

  /** The chapter's share slip: its result, the forgery worth telling, a dare and the link. */
  function shareChapter(p: Extract<Play, { kind: 'chapter' }>, outcome: 'survived' | 'caught'): void {
    const lang = getLang()
    const days = outcome === 'survived' ? p.state.days : p.state.day - 1
    const result: ShareResult = { era: p.era.id, mode: p.difficulty, outcome, days, lang }
    openShare(p.era, result, chapterPost({ result, ...chapterStory(p.state, outcome, lang) }))
  }

  /** The stamp comes down; its thunk lands on the stage's impact beat (or when it is done). */
  async function stampDesk(kind: StampKind): Promise<void> {
    pendingThunk = kind
    await guard(desk ? desk.stamp(kind) : Promise.resolve())
    thunk()
  }

  function onNext(): void {
    const p = play
    if (!p || busy || !revealed) return
    advance(p)
  }

  /** On to the next day, or to the daily puzzle's result. */
  function advance(p: Play): void {
    if (p.kind === 'chapter') {
      if (p.state.phase !== 'stamped') return // a caught or survived chapter ends on the paper's back
      p.state = nextDay(p.state)
      return beginDay()
    }
    if (p.results.length >= p.daily.messages.length) return endDaily(p)
    const { lastCorrect: _c, lastVerdict: _v, ...rest } = p.state
    p.state = { ...rest, day: p.results.length + 1, phase: 'reading' }
    beginDay()
  }

  // ------------------------------------------------------------------ the toss

  /** The verdict leads on: it holds to be read, then the paper goes. */
  function startHold(): void {
    holdLeft = TOSS_HOLD_MS
    holdSpent = 0
    sourceOpen = false
    syncHold()
  }

  /** A new day or leaving: no hold, no toss. */
  function endHold(): void {
    auto = false
    tossing = false
    holdLeft = 0
    sourceOpen = false
    syncHold()
  }

  /** The hold counts down on animation frames while the verdict waits, on a visible tab, with no card over it. */
  function syncHold(): void {
    const run = auto && revealed && !tossing && !sourceOpen && document.hidden !== true && alive()
    if (run && !holdRaf) {
      holdLast = 0
      holdRaf = requestAnimationFrame(holdTick)
    } else if (!run && holdRaf) {
      cancelAnimationFrame(holdRaf)
      holdRaf = 0
    }
  }

  function holdTick(now: number): void {
    holdRaf = 0
    if (!auto || tossing || !alive()) return
    const dt = holdLast ? Math.min(Math.max(0, now - holdLast), MAX_FRAME_MS) : 0
    holdLast = now
    holdLeft -= dt
    holdSpent += dt
    if (holdLeft <= 0) return void toss()
    holdRaf = requestAnimationFrame(holdTick)
  }

  /** Back from the source card, another tab or another language: a fresh moment before the paper goes. */
  function extendHold(): void {
    if (auto && !tossing) holdLeft = Math.max(holdLeft, TOSS_RESUME_MS)
  }

  /** A tap on the room, Space or Enter: the paper goes now; on its way already, it lands at once. */
  function hurry(): void {
    if (tossing) return desk?.skip()
    if (!auto || !revealed || holdSpent < TOSS_GRACE_MS) return
    void toss()
  }

  /** The read paper goes in the basket; then the next day begins by itself. */
  async function toss(): Promise<void> {
    const p = play
    if (!p || !auto || tossing || !revealed) return
    tossing = true
    busy = true // a language switch now waits for the next day
    syncHold()
    setTossing(ui)
    const token = gen
    const d = desk
    // a desk lost on the way never lands it: stop waiting as soon as a new desk is attached
    if (d) await guard(Promise.race([d.toss(), deskSwapped.promise]), TOSS_GUARD_MS)
    if (token !== gen || play !== p) return
    busy = false
    advance(p)
  }

  // ------------------------------------------------------------------ the end

  // ------------------------------------------------------------------ the daily puzzle

  function today(): Daily | null {
    if (ERAS.length === 0) return null
    try {
      return dailyFrom(env.now(), ERAS)
    } catch (err) {
      console.error('[app] no daily puzzle today', err)
      return null
    }
  }

  function readDaily(isoDate: string): DailyRecord | null {
    const r = store.get<unknown>(`daily:${isoDate}`, null) as Partial<DailyRecord> | null
    if (!r || typeof r !== 'object' || !Array.isArray(r.results) || !r.results.every((x) => typeof x === 'boolean')) return null
    return { era: r.era as EraId, number: Number(r.number) || 0, results: r.results }
  }

  function saveDaily(d: Daily, results: boolean[]): void {
    store.set(`daily:${d.isoDate}`, { era: d.era, number: d.number, results } satisfies DailyRecord)
  }

  function dailyDone(): boolean {
    const d = today()
    const r = d ? readDaily(d.isoDate) : null
    return !!d && !!r && r.results.length >= d.messages.length
  }

  function openDaily(): void {
    const d = today()
    if (!d) return
    const rec = readDaily(d.isoDate)
    if (rec && rec.results.length >= d.messages.length) return showDailyResult(d, rec.results)
    // Answers are saved as they are given, so leaving mid-puzzle resumes rather than restarts.
    const results = rec && rec.era === d.era ? rec.results.slice(0, d.messages.length) : []
    leave()
    setDeskEra(d.era)
    audio.ambience(d.era)
    const state: ChapterState = { era: d.era, difficulty: 'medium', day: results.length + 1, days: d.messages.length, queue: d.messages, phase: 'reading' }
    play = { kind: 'daily', era: eraById(d.era), daily: d, state, results }
    beginDay()
  }

  function endDaily(p: Extract<Play, { kind: 'daily' }>): void {
    saveDaily(p.daily, p.results)
    if (p.results.every(Boolean)) audio.cue('survived')
    showDailyResult(p.daily, p.results)
  }

  function showDailyResult(d: Daily, results: boolean[]): void {
    const era = eraById(d.era)
    leave()
    syncPause()
    const now = env.now()
    show('end', () => renderDailyEnd(ui, { era, number: d.number, results, nextAt: nextDailyAt(now), now: env.now }, {
      share: () => {
        const lang = getLang()
        const right = results.filter(Boolean).length
        const result: ShareResult = { era: era.id, mode: 'daily', outcome: right >= results.length ? 'survived' : 'caught', days: right, lang }
        openShare(era, result, dailyPost({ result, number: d.number, eraTitle: era.title[lang], results, fact: dailyFact(d.messages, results, lang) }))
      },
      chapter: () => {
        selected = era.id
        showMain()
      },
      home: showMain,
    }))
  }

  // ------------------------------------------------------------------ progress

  function readBest(id: EraId, d: Difficulty): number {
    const v = store.get<unknown>(`best:${id}:${d}`, 0)
    return typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.min(DAYS[d], Math.floor(v))) : 0
  }

  function recordBest(id: EraId, d: Difficulty, days: number): void {
    if (days > readBest(id, d)) store.set(`best:${id}:${d}`, days)
  }

  /** Per era: the hardest survived run, else the run with the most days. */
  function bests(): Partial<Record<EraId, Best>> {
    const out: Partial<Record<EraId, Best>> = {}
    for (const e of ERAS) {
      const runs = DIFFICULTIES.map((d) => ({ difficulty: d, days: readBest(e.id, d) })).filter((b) => b.days > 0)
      const survived = runs.filter((b) => b.days >= DAYS[b.difficulty])
      const pick = survived[survived.length - 1] ?? [...runs].sort((a, b) => b.days - a.days)[0]
      if (pick) out[e.id] = pick
    }
    return out
  }

  // ------------------------------------------------------------------ sharing

  /**
   * The share slip for a result: the post in the language on screen and its /s/<code> link on this
   * site's origin (so previews work on preview deployments too).
   */
  function openShare(era: Era, result: ShareResult, text: string): void {
    const url = isShareResult(result) ? `${env.url.origin}/s/${shareCode(result)}` : `${env.url.origin}/`
    const nav = navigator as Navigator & { share?: (d: { text?: string; url?: string }) => Promise<void> }
    audio.cue('fileOpen')
    openShareSlip({ era, lang: result.lang, text, url }, {
      copy: copyText,
      ...(typeof nav.share === 'function'
        ? {
            native: async () => {
              try {
                await nav.share!({ text, url })
                return 'shared' as const
              } catch (err) {
                // the player closed the sheet, or the browser refused
                return (err as { name?: string } | null)?.name === 'AbortError' ? 'cancelled' as const : 'failed' as const
              }
            },
          }
        : {}),
    })
  }

  /** Takes the share link's path and its chapter and mode picks out of the address bar. */
  function cleanShareUrl(): void {
    try {
      const next = new URL(env.url.href)
      if (sharedCode !== null) next.pathname = '/'
      next.searchParams.delete('chapter')
      next.searchParams.delete('mode')
      history.replaceState(history.state, '', `${next.pathname}${next.search}${next.hash}`)
    } catch {
      /* a sandboxed page may refuse; the picks still apply */
    }
  }
}

// -------------------------------------------------------------------- helpers

function parseSeed(raw: string | null): number | null {
  if (raw === null || raw.trim() === '') return null
  const s = raw.trim()
  return /^\d+$/.test(s) ? Number(s) >>> 0 : seedFrom(s)
}

/** The next Aaj ka Taar opens at midnight IST. */
export function nextDailyAt(now: number): number {
  return (Math.floor((now + IST_OFFSET_MS) / DAY_MS) + 1) * DAY_MS - IST_OFFSET_MS
}

/** A one-shot signal: `promise` settles when `resolve` is called. */
function signal(): { promise: Promise<void>; resolve: () => void } {
  let resolve!: () => void
  const promise = new Promise<void>((r) => (resolve = r))
  return { promise, resolve }
}

/** Resolves when `p` settles or after `ms`, whichever is first. */
function guard(p: Promise<unknown>, ms = ANIM_GUARD_MS): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, ms)
    const done = () => {
      clearTimeout(timer)
      resolve()
    }
    p.then(done, done)
  })
}

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* no permission or no secure context: try the old way */
  }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    ta.remove()
    return ok
  } catch {
    return false
  }
}

