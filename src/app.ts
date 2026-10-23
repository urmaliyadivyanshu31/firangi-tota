// The controller. It joins the pure game logic (src/game), the era content, the overlay screens,
// the lazily loaded 3D stage and the audio, and owns the one requestAnimationFrame loop that burns
// the agarbatti. The room is always on screen: the stage establishes it behind the cards, titles
// each day, brings the message in on its paper, stamps it and flashes. Nothing here imports
// three.js: the stage and the era desks arrive by dynamic import after the first paint (R10).
import { audio } from './audio/engine'
import { ERAS, eraById } from './content/registry'
import type { Era, EraId, Message } from './content/types'
import { DAYS, TIMER_S, pencilOn, type Difficulty } from './game/config'
import { dailyFrom, type Daily } from './game/daily'
import { dayDate } from './game/dates'
import { mulberry32, seedFrom } from './game/rng'
import { chapterShareText, shareText } from './game/share'
import { createChapter, nextDay, stamp, type ChapterState, type Verdict } from './game/state'
import { store } from './game/storage'
import { getLang, hasLang, setLang } from './i18n/lang'
import { strings, t } from './i18n/strings'
import { STAGE_LOST_EVENT, loadStage, mountFallback, type EraDressing, type Fallback, type QualityTier, type Stage, type StampKind } from './scene/index'
import type { DayTitle, FlashKind, ImmersiveFallback, ImmersiveStage, SheetSpec, VoicePlayer, VoiceState, VoiceStyle } from './ui/contract'
import { h } from './ui/h'
import { buildSheet, dayTitleFor } from './ui/message'
import { createFx, type Fx } from './ui/overlay'
import { renderCredits } from './ui/screens/credits'
import { renderDailyEnd } from './ui/screens/daily'
import { renderDay, setReadable, setSound, setStamping, setTimer, setVoiceState } from './ui/screens/day'
import { renderEnd, type EndProps } from './ui/screens/end'
import { MODE_KEY, renderHome, suggestedEra, type Best } from './ui/screens/home'
import { renderIntro } from './ui/screens/intro'
import { renderLanguage } from './ui/screens/language'
import { renderSetup } from './ui/screens/setup'

export interface AppRoot { stage: HTMLElement; ui: HTMLElement }
export interface AppEnv {
  now(): number
  random(): number
  url: URL
  /** Read-aloud. Defaults to the era voices when the build sets VITE_VOICE=on; tests pass a stub. */
  voice?: VoicePlayer
}

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']
const LOW_TIME = 0.3 // under this share of the agarbatti, it ticks every second
const MAX_FRAME_MS = 1000 // one long frame (a stall, a resume) never burns more than this
const STAMP_IMPACT_MS = 720 // raise 200 + move 360 + hover 70 + press 90 (animateStamp in scene/props.ts)
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
  /** When the stamp hits the paper, for the thunk and the flash. */
  impactMs: number
}

/** The stage as it is today plus whatever of the immersive API it already has. */
type AnyStage = Stage & Partial<ImmersiveStage>
type AnyFallback = Fallback & Partial<ImmersiveFallback>

type Play =
  | { kind: 'chapter'; era: Era; difficulty: Difficulty; state: ChapterState }
  | { kind: 'daily'; era: Era; daily: Daily; state: ChapterState; results: boolean[] }

interface DailyRecord { era: EraId; number: number; results: boolean[] }

type Screen = 'lang' | 'home' | 'setup' | 'intro' | 'day' | 'end' | 'credits'

export function startApp(root: AppRoot, env: AppEnv): void {
  const ui = root.ui
  const params = env.url.searchParams
  const seed = parseSeed(params.get('seed'))
  const tierParam = params.get('tier')
  const forceTier = TIERS.find((x) => x === tierParam)
  const langParam = params.get('lang')
  const reducedMotion = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

  // ------------------------------------------------------------------ state

  let screen: Screen = 'lang'
  let play: Play | null = null
  let readable = false // the paper is in view: stamps work, the agarbatti burns
  let revealed = false
  let busy = false // a stamp is being animated
  let gen = 0 // bumps on every navigation and every new day; async work started before it is dropped

  let muted = store.get<unknown>('muted', false) === true

  // the desk (3D stage or 2D fallback), and what it should show
  const fx: Fx = createFx(root.stage, reducedMotion)
  let desk: Desk | null = null
  let deskEra: EraId | null = suggestedEra(ERAS, bests())?.id ?? null
  let deskDirty = false // a paper, a stamp or the caught dimming is on it
  let stageLoad: Promise<void> | null = null

  // read-aloud
  let voice: VoicePlayer | null = null
  let voiceState: VoiceState = 'idle'
  let voiceStyle: VoiceStyle = store.get<unknown>('voiceStyle', 'era') === 'dastango' ? 'dastango' : 'era'

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
  document.addEventListener('visibilitychange', syncPause)

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
    }
  }

  if (hasLang()) showHome()
  else showLanguage()

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
          const s = mod.createStage(root.stage, { reducedMotion, forceTier })
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
      desk = fallbackDesk(mountFallback(root.stage, deskEra ?? ERAS[0]?.id ?? 'delhi-1857'))
    }
    const p = play
    if (p && screen === 'day') {
      // A desk that arrives once the paper was readable (a lost context) shows it at once; during
      // the arrival, arrive() brings it in on whichever desk is there.
      if (readable || revealed) {
        void desk.showMessage(sheetFor(p, getLang()))
        desk.skip()
      }
    } else if (screen === 'home' || screen === 'setup' || screen === 'intro' || screen === 'lang') {
      void desk.establish()
    }
    syncPause()
  }

  function stageDesk(s: AnyStage, dressingFor: (id: EraId) => EraDressing): Desk {
    return {
      setEra: (id) => s.setEra(dressingFor(id)),
      establish: () => (s.establish ? s.establish() : Promise.resolve()),
      dayTitle: (x) => (s.dayTitle ? s.dayTitle(x) : Promise.resolve()),
      showMessage: (x) => {
        if (s.showMessage) return s.showMessage(x)
        s.showPaper({ lean: true })
        return Promise.resolve()
      },
      redrawMessage: (x) => s.redrawMessage?.(x),
      stamp: (k) => s.stamp(k),
      flash: (k) => s.flash?.(k),
      caught: () => s.caught(),
      skip: () => s.skip?.(),
      setPaused: (p) => s.setPaused(p),
      dispose: () => s.dispose(),
      impactMs: reducedMotion ? 0 : STAMP_IMPACT_MS,
    }
  }

  /** The flat desk draws the same sheet; the title, the flash and the ink come from the DOM layer. */
  function fallbackDesk(f: AnyFallback): Desk {
    return {
      setEra: (id) => f.setEra(id),
      establish: () => Promise.resolve(),
      dayTitle: (x) => fx.title(x),
      showMessage: (x) => (f.showMessage ? f.showMessage(x) : Promise.resolve()),
      redrawMessage: (x) => f.redrawMessage?.(x),
      stamp: (k) => {
        fx.imprint(k)
        return Promise.resolve()
      },
      flash: (k) => (f.flash ? f.flash(k) : fx.flash(k)),
      caught: () => Promise.resolve(),
      skip: () => fx.skip(),
      setPaused: () => undefined,
      dispose: () => f.dispose(),
      impactMs: 0,
    }
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
    fx.clear()
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

  function bindVoice(v: VoicePlayer): void {
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
    const req = { era: p.era.id, id: msg.id, lang: getLang(), day: dateDay(p), voice: voiceStyle }
    voice.play(req).catch(() => undefined)
  }

  function chooseVoice(s: VoiceStyle): void {
    if (s === voiceStyle) return
    voiceStyle = s
    store.set('voiceStyle', s)
    stopVoice()
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
    if (frac < LOW_TIME && timeLeft > 0) {
      const whole = Math.ceil(timeLeft)
      if (whole < lastWhole) {
        lastWhole = whole
        audio.cue('tick')
      }
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
    play = null
    readable = false
    revealed = false
    busy = false
    stopVoice()
    disarmTimer()
    clearToast()
  }

  function toggleSound(): boolean {
    muted = !muted
    store.set('muted', muted)
    audio.setMuted(muted)
    return !muted
  }

  function showLanguage(): void {
    leave()
    screen = 'lang'
    establish()
    renderLanguage(ui, {
      pick: (l) => {
        setLang(l)
        showHome()
      },
    })
  }

  function showHome(): void {
    leave()
    screen = 'home'
    audio.ambience(null)
    setDeskEra(deskEra ?? suggestedEra(ERAS, bests())?.id)
    establish()
    syncPause()
    renderHome(ui, { eras: ERAS, best: bests(), dailyDone: dailyDone(), soundOn: !muted, ...(today() ? { dailyNumber: today()!.number } : {}) }, {
      chapter: (id) => {
        void ensureStage()
        showSetup(eraById(id))
      },
      daily: () => {
        void ensureStage()
        openDaily()
      },
      continue: () => {
        const e = suggestedEra(ERAS, bests())
        if (!e) return
        void ensureStage()
        showSetup(e)
      },
      lang: () => {
        setLang(getLang() === 'en' ? 'hi' : 'en')
        showHome()
      },
      sound: () => {
        toggleSound()
        showHome()
      },
      credits: () => showCredits(showHome),
    })
  }

  function showCredits(back: () => void): void {
    screen = 'credits'
    clearToast()
    renderCredits(ui, { back })
  }

  function showSetup(era: Era): void {
    leave()
    screen = 'setup'
    setDeskEra(era.id)
    establish()
    audio.ambience(era.id)
    syncPause()
    renderSetup(ui, { era }, { start: (d) => showIntro(era, d), back: showHome })
  }

  function showIntro(era: Era, d: Difficulty): void {
    screen = 'intro'
    establish()
    audio.cue('page')
    renderIntro(ui, { era }, { next: () => startChapter(era, d) })
  }

  function startChapter(era: Era, d: Difficulty): void {
    let state: ChapterState
    try {
      state = createChapter(era, d, seed === null ? env.random : mulberry32(seed))
    } catch (err) {
      console.error('[app] could not build the chapter', err)
      showHome()
      return
    }
    leave()
    setDeskEra(era.id)
    audio.ambience(era.id)
    play = { kind: 'chapter', era, difficulty: d, state }
    beginDay()
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

  /** What the paper shows today. */
  function sheetFor(p: Play, lang = getLang()): SheetSpec {
    const msg = currentMessage(p)
    if (!msg) throw new Error(`No message for day ${p.state.day}`)
    const pencil = p.kind === 'daily' ? false : pencilOn(p.state.difficulty, p.state.day)
    return buildSheet({ era: p.era, msg, isoDate: isoDateFor(p), lang, pencil })
  }

  function beginDay(): void {
    const p = play
    if (!p) return
    const token = ++gen
    stopVoice()
    readable = false
    revealed = false
    busy = false
    deskDirty = true
    fx.clear()
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
    audio.cue('arrive')
    const d = desk
    await guard(d ? d.showMessage(sheetFor(p, lang)) : Promise.resolve())
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
      ...(voice ? { voice: voiceState, voiceStyle } : {}),
      ...(p.kind === 'daily' ? { daily: p.daily.number, allRules: true } : {}),
    }, {
      stamp: (v) => void onStamp(v),
      listen: toggleVoice,
      voiceStyle: chooseVoice,
      tab: () => audio.cue('page'),
      next: onNext,
      skip: () => desk?.skip(),
      sound: () => setSound(ui, toggleSound(), getLang()),
      lang: () => {
        setLang(getLang() === 'en' ? 'hi' : 'en')
        stopVoice()
        drawDay()
        if (readable || revealed) desk?.redrawMessage(sheetFor(p))
      },
      quit: showHome,
    })
  }

  async function onStamp(v: Verdict): Promise<void> {
    const p = play
    if (!p || busy || revealed || !readable || p.state.phase !== 'reading') return
    busy = true
    const token = gen
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
    setStamping(ui, v)
    const flash: FlashKind = correct ? 'right' : 'wrong'
    if (v !== 'timeout') {
      await stampDesk(v, flash)
      if (token !== gen) return
    } else desk?.flash(flash)
    if (correct) audio.cue('correct')
    else {
      audio.cue('caught')
      await guard(desk ? desk.caught() : Promise.resolve())
      if (token !== gen) return
    }
    revealed = true
    busy = false
    drawDay()
  }

  /** The stamp comes down; the thunk and the room's flash land on impact. */
  async function stampDesk(kind: StampKind, flash: FlashKind): Promise<void> {
    const d = desk
    let hit = false
    const impact = () => {
      if (hit) return
      hit = true
      audio.cue(kind === 'asli' ? 'stampAsli' : 'stampTota')
      d?.flash(flash)
    }
    const timer = setTimeout(impact, d ? d.impactMs : 0)
    await guard(d ? d.stamp(kind) : Promise.resolve())
    clearTimeout(timer)
    impact()
  }

  function onNext(): void {
    const p = play
    if (!p || busy || !revealed) return
    if (p.kind === 'chapter') {
      if (p.state.phase === 'caught') return endChapter(p, 'caught')
      p.state = nextDay(p.state)
      if (p.state.phase === 'survived') return endChapter(p, 'survived')
      return beginDay()
    }
    if (p.results.length >= p.daily.messages.length) return endDaily(p)
    const { lastCorrect: _c, lastVerdict: _v, ...rest } = p.state
    p.state = { ...rest, day: p.results.length + 1, phase: 'reading' }
    beginDay()
  }

  // ------------------------------------------------------------------ the end

  function endChapter(p: Extract<Play, { kind: 'chapter' }>, outcome: 'survived' | 'caught'): void {
    const survived = outcome === 'survived' ? p.state.days : p.state.day - 1
    recordBest(p.era.id, p.difficulty, survived)
    if (outcome === 'survived') audio.cue('survived')
    const { era, difficulty, state } = p
    const line = chapterShareText({ eraTitle: era.title.en, mode: strings.en[MODE_KEY[difficulty]], survived, days: state.days })
    showEnd({ era, state, outcome, receipts: era.receipts, epilogue: era.epilogue }, line, () => startChapter(era, difficulty))
  }

  function showEnd(props: EndProps, line: string, again: () => void): void {
    leave()
    screen = 'end'
    syncPause()
    renderEnd(ui, props, { again, home: showHome, share: () => void share(line) })
  }

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
    const line = shareText({ daily: d.number, eraTitle: era.title[getLang()], results })
    leave()
    screen = 'end'
    syncPause()
    const now = env.now()
    renderDailyEnd(ui, { era, number: d.number, results, nextAt: nextDailyAt(now), now: env.now }, {
      share: () => void share(line),
      chapter: () => {
        void ensureStage()
        showSetup(era)
      },
      home: showHome,
    })
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

  async function share(text: string): Promise<void> {
    const lang = getLang()
    const nav = navigator as Navigator & { share?: (d: { text: string }) => Promise<void> }
    if (typeof nav.share === 'function') {
      try {
        await nav.share({ text })
        return
      } catch (err) {
        if ((err as { name?: string } | null)?.name === 'AbortError') return // the player closed the sheet
      }
    }
    const ok = await copyText(text)
    const mobile = /Android|iPhone|iPad|iPod|Mobi/i.test(navigator.userAgent)
    toast(t(ok ? 'copied' : 'copyFailed', lang), mobile ? { href: `whatsapp://send?text=${encodeURIComponent(text)}`, label: t('shareWhatsApp', lang) } : undefined)
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

let toastTimer = 0

/** A toast belongs to the screen it was raised on. */
function clearToast(): void {
  window.clearTimeout(toastTimer)
  document.querySelectorAll('.toast').forEach((el) => el.remove())
}

function toast(message: string, link?: { href: string; label: string }): void {
  clearToast()
  const el = h('div', { class: link ? 'toast toast--link' : 'toast', role: 'status', lang: getLang() },
    h('span', { class: 'toast__text' }, message),
    link ? h('a', { class: 'toast__link', href: link.href }, link.label) : null)
  document.body.appendChild(el)
  toastTimer = window.setTimeout(() => el.remove(), link ? 8000 : 2600)
}
