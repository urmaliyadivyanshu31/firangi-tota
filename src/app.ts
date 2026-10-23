// The controller. It joins the pure game logic (src/game), the era content, the DOM screens, the
// lazily loaded 3D stage and the audio, and owns the one requestAnimationFrame loop that burns the
// agarbatti. Nothing here imports three.js: the stage and the era desks arrive by dynamic import
// after the first paint (Ruling R10).
import { audio } from './audio/engine'
import { ERAS, eraById } from './content/registry'
import type { Era, EraId, Message } from './content/types'
import { DAYS, TIMER_S, type Difficulty } from './game/config'
import { dailyFrom, type Daily } from './game/daily'
import { dayDate } from './game/dates'
import { mulberry32, seedFrom } from './game/rng'
import { chapterShareText, shareText } from './game/share'
import { createChapter, nextDay, stamp, type ChapterState, type Verdict } from './game/state'
import { store } from './game/storage'
import { getLang, hasLang, setLang } from './i18n/lang'
import { strings, t } from './i18n/strings'
import { STAGE_LOST_EVENT, loadStage, mountFallback, type EraDressing, type Fallback, type QualityTier, type Stage, type StampKind } from './scene/index'
import { h } from './ui/h'
import { messageText } from './ui/paper'
import { speak } from './ui/speak'
import { renderCredits } from './ui/screens/credits'
import { renderDay, setTimer } from './ui/screens/day'
import { renderEnd, type EndProps } from './ui/screens/end'
import { MODE_KEY, renderHome, suggestedEra, type Best } from './ui/screens/home'
import { renderIntro } from './ui/screens/intro'
import { renderLanguage } from './ui/screens/language'
import { renderSetup } from './ui/screens/setup'

export interface AppRoot { stage: HTMLElement; ui: HTMLElement }
export interface AppEnv { now(): number; random(): number; url: URL }

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']
const LOW_TIME = 0.3 // under this share of the agarbatti, it ticks every second
const MAX_FRAME_MS = 1000 // one long frame (a stall, a resume) never burns more than this
const STAMP_IMPACT_MS = 720 // raise 200 + move 360 + hover 70 + press 90 (animateStamp in scene/props.ts)
const ANIM_GUARD_MS = 3500 // a stage animation that never settles must not stall the game
const TIERS: QualityTier[] = ['low', 'mid', 'high']

/** What the controller needs from a desk: the 3D stage or the 2D fallback. */
interface Desk {
  setEra(id: EraId): void
  showPaper(): void
  stamp(kind: StampKind): Promise<void>
  caught(): Promise<void>
  setPaused(p: boolean): void
  dispose(): void
  /** When the stamp hits the paper, for the thunk. */
  impactMs: number
}

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
  let revealed = false
  let busy = false // a stamp is being animated
  let gen = 0 // bumps on every navigation; async work started before it is dropped

  let muted = store.get<unknown>('muted', false) === true

  // the desk (3D stage or 2D fallback), and what it should show
  let desk: Desk | null = null
  let deskEra: EraId | null = suggestedEra(ERAS, bests())?.id ?? null
  let deskDirty = false // a paper, a stamp or the caught dimming is on it
  let deskPaper = false // a day is on screen
  let holdStage = false // the reveal or the end screen: the desk holds still
  let stageLoad: Promise<void> | null = null

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

  if (params.has('debug')) {
    ;(window as unknown as { __ft?: unknown }).__ft = {
      get screen() { return screen },
      get play() { return play },
      get revealed() { return revealed },
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
    if (deskPaper) desk.showPaper()
    syncPause()
  }

  function stageDesk(s: Stage, dressingFor: (id: EraId) => EraDressing): Desk {
    return {
      setEra: (id) => s.setEra(dressingFor(id)),
      showPaper: () => s.showPaper({ lean: false }), // our paper covers the desk's sheet; keep the room in view
      stamp: (k) => s.stamp(k),
      caught: () => s.caught(),
      setPaused: (p) => s.setPaused(p),
      dispose: () => s.dispose(),
      impactMs: reducedMotion ? 0 : STAMP_IMPACT_MS,
    }
  }

  function fallbackDesk(f: Fallback): Desk {
    return {
      setEra: (id) => f.setEra(id),
      showPaper: () => undefined,
      stamp: () => Promise.resolve(),
      caught: () => Promise.resolve(),
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

  /** The agarbatti runs only on a day in progress with the tab visible; the desk holds still while hidden or under the reveal and the end. */
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
    desk?.setPaused(hidden || holdStage)
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
    setTimer(ui, frac)
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
    revealed = false
    busy = false
    deskPaper = false
    disarmTimer()
    clearToast()
  }

  function showLanguage(): void {
    leave()
    screen = 'lang'
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
    holdStage = false
    audio.ambience(null)
    setDeskEra(deskEra ?? suggestedEra(ERAS, bests())?.id)
    syncPause()
    renderHome(ui, { eras: ERAS, best: bests(), dailyDone: dailyDone(), soundOn: !muted }, {
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
        muted = !muted
        store.set('muted', muted)
        audio.setMuted(muted)
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
    holdStage = false
    setDeskEra(era.id)
    audio.ambience(era.id)
    syncPause()
    renderSetup(ui, { era }, { start: (d) => showIntro(era, d), back: showHome })
  }

  function showIntro(era: Era, d: Difficulty): void {
    screen = 'intro'
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
    holdStage = false
    setDeskEra(era.id)
    audio.ambience(era.id)
    play = { kind: 'chapter', era, difficulty: d, state }
    beginDay()
  }

  // ------------------------------------------------------------------ a day

  function currentMessage(p: Play): Message | undefined {
    return p.state.queue[p.state.day - 1]
  }

  /** The chapter's real date; the daily puzzle plays on the window's last days, when every rule is known. */
  function isoDateFor(p: Play): string {
    if (p.kind === 'chapter') return dayDate(p.era, p.state.day)
    return dayDate(p.era, DAYS.hard - p.state.days + p.state.day)
  }

  function beginDay(): void {
    const p = play
    if (!p) return
    revealed = false
    busy = false
    holdStage = false
    deskPaper = true
    deskDirty = true
    syncPause()
    desk?.showPaper()
    audio.cue('arrive')
    timeLeft = timeTotal = TIMER_S[p.state.difficulty]
    drawDay()
    armTimer(TIMER_S[p.state.difficulty])
  }

  function drawDay(): void {
    const p = play
    if (!p) return
    screen = 'day'
    const lang = getLang()
    const isoDate = isoDateFor(p)
    renderDay(ui, {
      era: p.era,
      state: p.state,
      isoDate,
      timerFrac: timeLeft / timeTotal,
      lang,
      revealed,
      ...(p.kind === 'daily' ? { pencil: false, allRules: true } : {}),
    }, {
      stamp: (v) => void onStamp(v),
      speak: () => {
        const msg = currentMessage(p)
        if (msg) speak(messageText(msg, isoDate, lang), lang)
      },
      tab: () => audio.cue('page'),
      next: onNext,
      quit: showHome,
    })
  }

  async function onStamp(v: Verdict): Promise<void> {
    const p = play
    if (!p || busy || revealed || p.state.phase !== 'reading') return
    busy = true
    const token = gen
    disarmTimer()
    p.state = stamp(p.state, v)
    const correct = p.state.lastCorrect === true
    if (p.kind === 'daily') {
      p.results = [...p.results, correct]
      saveDaily(p.daily, p.results)
    }
    // The paper steps aside and the stamps stop taking taps while the desk plays the stamp (or
    // the caught beat when the agarbatti burnt out).
    ui.querySelector('.screen--day')?.classList.add('is-stamping')
    if (v !== 'timeout') {
      ui.querySelector(`[data-stamp="${v}"]`)?.classList.add('is-chosen')
      await stampDesk(v)
      if (token !== gen) return
    }
    if (correct) audio.cue('correct')
    else {
      audio.cue('caught')
      await guard(desk ? desk.caught() : Promise.resolve())
      if (token !== gen) return
    }
    revealed = true
    busy = false
    holdStage = true
    syncPause()
    drawDay()
  }

  async function stampDesk(kind: StampKind): Promise<void> {
    const d = desk
    let played = false
    const thunk = () => {
      if (played) return
      played = true
      audio.cue(kind === 'asli' ? 'stampAsli' : 'stampTota')
    }
    const timer = setTimeout(thunk, d ? d.impactMs : 0)
    await guard(d ? d.stamp(kind) : Promise.resolve())
    clearTimeout(timer)
    thunk()
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
    holdStage = true
    syncPause()
    const draw = () => {
      screen = 'end'
      renderEnd(ui, props, {
        again,
        home: showHome,
        share: () => void share(line),
        credits: () => showCredits(draw),
      })
    }
    draw()
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
    holdStage = false
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
    const allRight = results.every(Boolean)
    const state: ChapterState = { era: era.id, difficulty: 'medium', day: d.messages.length, days: d.messages.length, queue: d.messages, phase: allRight ? 'survived' : 'caught' }
    const line = shareText({ daily: d.number, eraTitle: era.title[getLang()], results })
    showEnd(
      { era, state, outcome: allRight ? 'survived' : 'caught', receipts: era.receipts, epilogue: era.epilogue, share: line, againLabel: t('dailyChapter', getLang()) },
      line,
      () => {
        void ensureStage()
        showSetup(era)
      },
    )
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
