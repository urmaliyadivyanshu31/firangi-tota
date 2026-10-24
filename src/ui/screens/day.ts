import type { Era, Fact, Lang, Receipt, SourceRef } from '../../content/types'
import { storyParas, storyParts } from '../../content/story'
import type { ChapterState } from '../../game/state'
import type { Difficulty } from '../../game/config'
import { inMode } from '../../game/run'
import { t, tf } from '../../i18n/strings'
import type { VoiceState } from '../../audio/voice'
import type { ScreenRect, SheetSpec } from '../../scene/index'
import { announce, h, mount, svg, type Child } from '../h'
import { hud, setMusic, setSound, setTimer, type ModeKind } from '../hud'
import type { MusicState } from '../controls'
import { isShort, isWide, onLayoutChange, reducedMotion } from '../layout'
import { micIcon } from '../icons'
import { chevronIcon, closeIcon, jaali, skipIcon } from '../ornament'
import { pairChecks, relatedFacts } from '../pencil'
import { formatSource, sourceList } from '../reveal'

// A day over the live room. The message itself is on the 3D paper; the DOM keeps a visually
// hidden copy for screen readers, and a Listen button plays the era's recorded voice. Around it: the thin top bar, the case file and
// rulebook (pinned on the left in landscape, sheets behind two tabs in portrait), the two stamps,
// and after the stamp, the result card.

export { setMusic, setSound, setTimer }

export type Verdict = 'asli' | 'tota'
export type Tab = 'file' | 'rules'

export interface DayProps {
  era: Era
  state: ChapterState
  lang: Lang
  /** What the paper shows: the hidden copy and the pencil marks come from it. */
  sheet: SheetSpec
  /** Agarbatti left, 1 = full, 0 = burnt out. Update in place with `setTimer`. */
  timerFrac: number
  /** Whole seconds left. */
  secs: number
  /** The paper is in view: the stamps work. Before that the arrival plays and a tap skips it. */
  readable: boolean
  /** The verdict is in: it is on the paper's back; the DOM shows Next (or the end's buttons). */
  revealed: boolean
  soundOn: boolean
  /** Music mode, for the record button beside the horn. */
  music?: MusicState
  /** Read-aloud is available (the era voices are loaded), and what it is doing now. */
  voice?: VoiceState
  /** The voices on offer (the dastango, and a guest once enabled) and the one that reads. */
  voices?: VoiceOption[]
  voiceStyle?: string
  /** The Aaj ka Taar number: the mode chip names the puzzle instead of the difficulty. */
  daily?: number
  /** Show every rule, none tagged new (the daily puzzle plays with the whole rulebook). */
  allRules?: boolean
  /** The verdict is on the 3D paper's back: the DOM keeps only the buttons, the source and a mirror. */
  onPaper?: PaperReveal
  /** The read paper is on its way to the basket: the source button over it goes with it. */
  tossing?: boolean
}

export interface PaperReveal {
  /** Everything the paper's back says, for screen readers. */
  mirror: string
  /** Where the paper's source line is on screen (CSS px), for the button over it. */
  sourceRect: ScreenRect | null
  /** Where the paper is on screen, to set the buttons under it. */
  paperRect?: ScreenRect | null
  /** The citations that button opens, and the honest note on what kind of text this was. */
  sources: SourceRef[]
  kind?: string
  /** The chapter ends here: Play again, Home and Share, with the receipts behind a tap; and what the run earned, in one line. */
  end?: { receipts: Receipt[]; earned?: string }
  /**
   * The next day follows by itself: once the verdict has been read the paper goes in the basket.
   * No Next button; a tap on the room or Space sends it at once, and the Skip chip or Enter skips
   * the crumple and the drop as well.
   */
  auto?: boolean
}

export interface DayHandlers {
  stamp(v: Verdict): void
  /** Listen: play the message aloud, or stop it while it plays. */
  listen(): void
  /** The player picked a voice (only offered when there is more than one). */
  voiceStyle?(id: string): void
  tab(t: Tab): void
  next(): void
  /** A tap during an animation: finish it now. */
  skip(): void
  /** The verdict has been read (a tap on the room or Space): toss the paper now. */
  toss?(): void
  /** The Skip chip or Enter while the verdict leads on: the paper is in the basket at once, the next day begins. */
  skipToss?(): void
  /** The source (or receipts) card opened or closed over the paper. */
  pop?(open: boolean): void
  sound(): void
  music?(): void
  lang(): void
  /** Leave for home. When given, a home button shows in the top bar. */
  quit?(): void
  /** The chapter's end, on the paper: play again, go home, share. */
  again?(): void
  home?(): void
  share?(): void
}

export interface VoiceOption {
  id: string
  label: string
  /** Shown whenever this voice is selected (a voice used with someone's permission). */
  credit?: string
}

const MODE_LABEL = { easy: 'modeEasy', medium: 'modeMedium', hard: 'modeHard' } as const

/** Right, Wrong, or Too slow when the agarbatti burnt out (Ruling R12). */
function verdictKey(s: ChapterState): 'right' | 'wrong' | 'tooSlow' {
  if (s.lastCorrect === true) return 'right'
  return s.lastVerdict === 'timeout' ? 'tooSlow' : 'wrong'
}

interface Active {
  root: HTMLElement
  screen: HTMLElement
  on: DayHandlers
  props: DayProps
  close(): boolean
}

// One day screen is live at a time; the keyboard, layout and voice listeners follow the latest render.
let active: Active | null = null
let keysBound = false
// what the player last used, so focus that came from the keyboard can be told from a tap's
let lastInput: 'key' | 'pointer' = 'pointer'
let unsubLayout: () => void = () => {}
const announced = new WeakMap<HTMLElement, string>()

function live(): Active | null {
  return active && active.screen.isConnected ? active : null
}

function stampButtons(screen: HTMLElement): HTMLButtonElement[] {
  return [...screen.querySelectorAll<HTMLButtonElement>('button[data-stamp]')]
}

function onKey(e: KeyboardEvent): void {
  const a = live()
  if (!a) return // another screen has replaced the day
  if (e.altKey || e.ctrlKey || e.metaKey || e.repeat) return
  const target = e.target as HTMLElement | null
  if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return
  if (e.key === 'Escape' && a.close()) return
  const animating = a.screen.classList.contains('is-arriving') || a.screen.classList.contains('is-stamping')
  if (animating && (e.key === 'Escape' || (e.key === ' ' && (!target || target === document.body)))) {
    e.preventDefault()
    a.on.skip()
    return
  }
  // the verdict read: Space sends the paper to the basket, Enter skips straight to the next day
  // (a focused control keeps its keys)
  if (a.props.revealed && a.props.onPaper?.auto && (e.key === ' ' || e.key === 'Enter') && !target?.closest?.('button, a, [role="dialog"]')) {
    e.preventDefault()
    if (e.key === 'Enter' && a.on.skipToss) a.on.skipToss()
    else a.on.toss?.()
    return
  }
  if (a.props.revealed) return
  const v: Verdict | null = e.key === 'ArrowLeft' || e.key === '1' ? 'asli' : e.key === 'ArrowRight' || e.key === '2' ? 'tota' : null
  if (!v) return
  const btn = a.screen.querySelector<HTMLButtonElement>(`button[data-stamp="${v}"]`)
  if (btn && !btn.disabled) a.on.stamp(v)
}

/** The hidden copy of the message: who, to whom, when, then the body. */
function fillCopy(copy: HTMLElement, p: DayProps): void {
  const { lang, sheet, state } = p
  const stop = lang === 'hi' ? '।' : '.'
  copy.replaceChildren(
    h('p', { class: 'msg__meta' },
      `${tf('dayOf', lang, { n: state.day, total: state.days })}${stop} ${t('fieldFrom', lang)}: ${sheet.from}${stop} ${t('fieldTo', lang)}: ${sheet.to}${stop} ${sheet.dateLine}${stop}`),
    h('p', { class: 'msg__body' }, sheet.body))
}

/** The paper is in view: turn the stamps on and give screen readers the message. */
export function setReadable(root: HTMLElement): void {
  const a = live()
  if (!a || a.root !== root || a.props.readable) return
  a.props = { ...a.props, readable: true }
  a.screen.classList.remove('is-arriving')
  for (const b of stampButtons(a.screen)) {
    b.disabled = false
    b.classList.add('is-ready') // a small wobble: they have come alive
  }
  const listen = a.screen.querySelector<HTMLButtonElement>('[data-action="listen"]')
  if (listen) listen.disabled = false
  const copy = a.screen.querySelector<HTMLElement>('.day__message')
  if (copy) fillCopy(copy, a.props)
}

/** A stamp is coming down: no more stamps today, and a tap finishes the animation. */
export function setStamping(root: HTMLElement, v: Verdict | 'timeout'): void {
  const a = live()
  if (!a || a.root !== root) return
  a.screen.classList.add('is-stamping')
  a.close()
  for (const b of stampButtons(a.screen)) {
    b.disabled = true
    b.classList.toggle('is-chosen', b.dataset.stamp === v)
  }
}

/** The read paper is on its way to the basket: the cards over it close and its source button goes. */
export function setTossing(root: HTMLElement): void {
  const a = live()
  if (!a || a.root !== root || !a.props.revealed) return
  a.props = { ...a.props, tossing: true }
  a.close()
  a.screen.classList.add('is-tossing')
}

const VOICE_LABEL: Record<VoiceState, 'listen' | 'listenStop' | 'voiceError'> = { idle: 'listen', loading: 'listen', playing: 'listenStop', error: 'voiceError' }

function applyVoice(btn: HTMLButtonElement, state: VoiceState, lang: Lang): void {
  btn.dataset.state = state
  btn.setAttribute('aria-busy', String(state === 'loading'))
  btn.setAttribute('aria-pressed', String(state === 'playing'))
  const label = btn.querySelector('.listen__label')
  if (label) label.textContent = t(VOICE_LABEL[state], lang)
}

/** Show what read-aloud is doing: loading, playing (tap to stop), stopped, or failed. */
export function setVoiceState(root: HTMLElement, state: VoiceState): void {
  const a = live()
  if (!a || a.root !== root) return
  a.props = { ...a.props, voice: state }
  const btn = a.screen.querySelector<HTMLButtonElement>('[data-action="listen"]')
  if (btn) applyVoice(btn, state, a.props.lang)
}

export function renderDay(root: HTMLElement, p: DayProps, on: DayHandlers): void {
  const { era, state, lang, revealed } = p
  const msg = state.queue[state.day - 1]
  if (!msg) throw new Error(`No message for day ${state.day} (queue has ${state.queue.length})`)
  // the case file's mode: the daily puzzle reads as Medium
  const fileMode: Difficulty = p.daily !== undefined ? 'medium' : state.difficulty
  const scrolls = fileMode !== 'easy'
  const waiting = !p.readable && !revealed

  // ---- the top bar
  const modeKind: ModeKind = p.daily !== undefined ? 'daily' : state.difficulty
  const modeLabel = p.daily !== undefined ? `${t('dailyTitle', lang)} #${p.daily}` : t(MODE_LABEL[state.difficulty], lang)
  const quit = on.quit
  const top = hud({ era, lang, day: state.day, days: state.days, mode: { kind: modeKind, label: modeLabel }, timerFrac: p.timerFrac, secs: p.secs, soundOn: p.soundOn, ...(p.music ? { music: p.music } : {}) }, {
    ...(quit ? { home: () => quit() } : {}),
    sound: () => on.sound(),
    ...(on.music ? { music: () => on.music?.() } : {}),
    lang: () => on.lang(),
  })

  // ---- the case file and the rulebook
  // Only this mode's facts. The pencil ticks its lines in Easy alone (Medium and Hard find the clue
  // themselves), worked out from both halves of a pair, so genuine and forged always tick the same.
  const shownFacts = era.facts.filter((f) => inMode(f, fileMode))
  const marked = new Set(fileMode === 'easy' && p.sheet.pencil ? relatedFacts(pairChecks(msg, era, lang, p.sheet.checks), shownFacts, lang) : [])
  const facts = caseFile(shownFacts, lang, fileMode, marked)

  const arrived = p.allRules ? era.rules : era.rules.filter((r) => r.arrivesOnDay <= state.day)
  const isNew = (day: number) => !p.allRules && state.day > 1 && day === state.day
  const anyNew = arrived.some((r) => isNew(r.arrivesOnDay))
  const newTag = () => h('span', { class: 'tag-new' }, t('newTag', lang))
  const rules = h('ol', { class: 'rules' }, arrived.map((r, i) =>
    h('li', { class: `rule${isNew(r.arrivesOnDay) ? ' is-new' : ''}`, 'data-rule': r.id },
      h('span', { class: 'rule__n', 'aria-hidden': 'true' }, String(i + 1)),
      h('span', { class: 'rule__text' }, r.text[lang]),
      isNew(r.arrivesOnDay) ? newTag() : null)))

  let open: Tab | null = null
  let wide = isWide()
  const tabs: Partial<Record<Tab, HTMLButtonElement>> = {}
  const cueUpdates: (() => void)[] = []

  function sheetEl(kind: Tab, title: string, content: HTMLElement, tag: HTMLElement | null): HTMLElement {
    const head = h('header', { class: 'sheet__head' },
      h('span', { class: 'sheet__grab', 'aria-hidden': 'true' }),
      h('h2', { class: 'sheet__title' }, title, tag),
      h('button', { class: 'sheet__close', type: 'button', 'aria-label': t('closePanel', lang), title: t('closePanel', lang),
        onclick: () => { setOpen(null); tabs[kind]?.focus() } }, closeIcon()))
    // Medium and Hard: the longer file scrolls inside the card, its foot fading into the paper with
    // an inked mark while more lies below; the body takes the keyboard's arrows and Page keys
    const long = kind === 'file' && scrolls
    const body = h('div', { class: 'sheet__body', ...(long ? { tabindex: '0' } : {}) }, content)
    const cue = long
      ? h('span', { class: 'scroll-cue', 'aria-hidden': 'true',
          onclick: () => body.scrollBy({ top: Math.round(body.clientHeight * 0.7), behavior: reducedMotion() ? 'auto' : 'smooth' }) }, moreMark())
      : null
    const el = h('section', { class: `sheet sheet--${kind}${long ? ' sheet--scroll' : ''}`, id: `ft-panel-${kind}`, 'data-panel': kind, 'aria-label': title },
      h('span', { class: kind === 'file' ? 'clip' : 'pin', 'aria-hidden': 'true' }),
      head,
      body,
      cue)
    if (long) cueUpdates.push(watchScroll(el, body))
    swipeDown(el, head, () => setOpen(null))
    return el
  }

  const panels: Record<Tab, HTMLElement> = {
    file: sheetEl('file', t('caseFile', lang), facts, null),
    rules: sheetEl('rules', t('rulebook', lang), rules, anyNew ? newTag() : null),
  }
  const scrim = h('div', { class: 'sheet-scrim', 'aria-hidden': 'true', onclick: () => setOpen(null) })

  function swipeDown(el: HTMLElement, handle: HTMLElement, close: () => void): void {
    let startY = 0
    let dy = 0
    let id: number | null = null
    handle.addEventListener('pointerdown', (e: PointerEvent) => {
      if (wide || !el.classList.contains('is-open') || (e.target as HTMLElement).closest('button')) return
      id = e.pointerId
      startY = e.clientY
      dy = 0
      try { handle.setPointerCapture(id) } catch { /* not capturable (tests, old browsers) */ }
      el.classList.add('is-dragging')
    })
    handle.addEventListener('pointermove', (e: PointerEvent) => {
      if (id !== e.pointerId) return
      dy = Math.max(0, e.clientY - startY)
      el.style.transform = `translateY(${dy}px)`
    })
    const end = (e: PointerEvent) => {
      if (id !== e.pointerId) return
      id = null
      el.classList.remove('is-dragging')
      el.style.transform = ''
      if (dy > 64) close()
    }
    handle.addEventListener('pointerup', end)
    handle.addEventListener('pointercancel', end)
  }

  function applyLayout(): void {
    screen.dataset.layout = wide ? 'wide' : 'narrow'
    // a phone on its side: the tabs and stamps go to the sides of the paper (styles.css)
    if (!wide && isShort()) screen.setAttribute('data-short', '')
    else screen.removeAttribute('data-short')
    for (const k of ['file', 'rules'] as Tab[]) {
      const shown = wide || open === k
      panels[k].classList.toggle('is-open', !wide && open === k)
      panels[k].setAttribute('aria-hidden', String(!shown))
      if (shown) panels[k].removeAttribute('inert')
      else panels[k].setAttribute('inert', '')
      tabs[k]?.setAttribute('aria-expanded', String(!wide && open === k))
      tabs[k]?.classList.toggle('is-open', !wide && open === k)
    }
    scrim.classList.toggle('is-on', !wide && open !== null)
    for (const update of cueUpdates) update()
    if (wide) {
      const first = facts.querySelector<HTMLElement>('.is-pencilled')
      if (first && typeof first.scrollIntoView === 'function') first.scrollIntoView({ block: 'nearest' })
    }
  }

  function setOpen(next: Tab | null): void {
    open = next
    applyLayout()
    // a sheet that slides up takes the focus, so keyboard and screen-reader users land in it
    if (next && !wide) panels[next].querySelector<HTMLElement>('.sheet__close')?.focus({ preventScroll: true })
  }

  // ---- the controls: tabs and stamps, a skip chip during animations
  const tab = (k: Tab, label: string, extra: HTMLElement | null) => {
    const b = h('button', { class: `tab tab--${k}`, type: 'button', 'data-tab': k, 'aria-controls': `ft-panel-${k}`, 'aria-expanded': 'false',
      onclick: () => { setOpen(open === k ? null : k); on.tab(k) } }, h('span', null, label), extra)
    tabs[k] = b
    return b
  }
  // A rubber stamp on a wooden mount: the handle on the left, the inked face with both names, the meaning and the key
  const stampBtn = (v: Verdict, arrow: string, key: string) =>
    h('button', { class: `stamp stamp--${v}`, type: 'button', 'data-stamp': v, disabled: waiting, onclick: () => on.stamp(v) },
      stampHandle(),
      h('span', { class: 'stamp__face' },
        h('span', { class: 'stamp__names' },
          h('span', { class: 'stamp__dev', lang: 'hi' }, t(v, 'hi')),
          h('span', { class: 'stamp__lat', lang: 'en' }, t(v, 'en'))),
        h('span', { class: 'stamp__foot' },
          h('span', { class: 'stamp__hint' }, t(v === 'asli' ? 'asliHint' : 'totaHint', lang)),
          h('kbd', { class: 'stamp__key', 'aria-hidden': 'true' }, `${arrow} ${key}`))))

  // Listen; with more than one voice, a chevron (or a long press) picks the voice
  let listenGroup: HTMLElement | null = null
  let picker: HTMLElement | null = null
  let more: HTMLButtonElement | null = null
  const setPicker = (show: boolean) => {
    picker?.classList.toggle('is-open', show)
    more?.setAttribute('aria-expanded', String(show))
  }
  if (p.voice) {
    let pressTimer = 0
    let longPressed = false
    const listenBtn = h('button', { class: 'listen', type: 'button', 'data-action': 'listen', disabled: waiting,
      onclick: () => {
        if (longPressed) return void (longPressed = false)
        setPicker(false)
        on.listen()
      },
      onpointerdown: () => {
        longPressed = false
        if (!picker) return
        pressTimer = window.setTimeout(() => {
          longPressed = true
          setPicker(true)
        }, 550)
      },
      onpointerup: () => window.clearTimeout(pressTimer),
      onpointerleave: () => window.clearTimeout(pressTimer),
      oncontextmenu: (e: Event) => e.preventDefault() },
    h('span', { class: 'listen__icon' }, micIcon(), h('span', { class: 'listen__spin', 'aria-hidden': 'true' })),
    h('span', { class: 'listen__label' }, t('listen', lang)))
    applyVoice(listenBtn, p.voice, lang)
    const voices = p.voices ?? []
    const chosen = voices.find((v) => v.id === p.voiceStyle) ?? voices[0]
    const credit = h('p', { class: 'voice-credit' }, chosen?.credit ?? '')
    credit.hidden = !chosen?.credit
    if (voices.length > 1) {
      const option = (v: VoiceOption) =>
        h('button', { class: 'voice-opt', type: 'button', role: 'radio', 'aria-checked': String(chosen?.id === v.id), 'data-style': v.id,
          onclick: () => {
            for (const o of picker?.querySelectorAll('.voice-opt') ?? []) o.setAttribute('aria-checked', String((o as HTMLElement).dataset.style === v.id))
            credit.textContent = v.credit ?? ''
            credit.hidden = !v.credit
            setPicker(false)
            on.voiceStyle?.(v.id)
          } }, v.label)
      picker = h('div', { class: 'voice-picker', role: 'radiogroup', 'aria-label': t('voiceStyle', lang) }, voices.map(option))
      more = h('button', { class: 'listen__more', type: 'button', 'data-action': 'voice-style', 'aria-label': t('voiceStyle', lang), title: t('voiceStyle', lang),
        'aria-expanded': 'false', onclick: () => setPicker(!picker?.classList.contains('is-open')) }, chevronIcon())
    }
    listenGroup = h('div', { class: `listen-group${picker ? ' has-picker' : ''}` }, listenBtn, more, picker, credit)
  }

  // the skip chip: during the arrival and the stamp it finishes the animation; while a verdict
  // leads on by itself (the reading, the crumple, the drop) it skips the lot, Enter its key
  const skipChip = (onclick: () => void, key = false) =>
    h('button', { class: 'day__skip', type: 'button', 'data-action': 'skip', onclick, ...(key ? { 'aria-keyshortcuts': 'Enter' } : {}) },
      h('span', null, t('skip', lang)), skipIcon(), key ? h('kbd', { class: 'day__skip-key', 'aria-hidden': 'true' }, '↵') : null)
  const controls = revealed ? null : h('footer', { class: 'day__controls' },
    skipChip(() => on.skip()),
    h('div', { class: 'tabs' }, tab('file', t('caseFile', lang), null), tab('rules', t('rulebook', lang), anyNew ? newTag() : null), listenGroup),
    h('div', { class: 'stamps' }, stampBtn('asli', '←', '1'), stampBtn('tota', '→', '2')))

  // ---- the result is on the 3D paper's back: here only the buttons, the source and a mirror
  let nextBtn: HTMLButtonElement | null = null
  let result: HTMLElement | null = null
  /** Closes the source and receipts cards; true when one was open. */
  let closePops = (): boolean => false
  if (revealed) {
    const r: PaperReveal = p.onPaper ?? { mirror: '', sourceRect: null, sources: [] }
    // The citations and the receipts open as cards over the scene, on a shade that closes them when
    // tapped; each has its own close slip (a phone has no Escape key).
    const closeSlip = (action: string) =>
      h('footer', { class: 'pcard__foot' },
        h('button', { class: 'btn btn--chit', type: 'button', 'data-action': action, onclick: () => closePops() }, t('closePanel', lang)))
    const pop = h('div', { class: 'source-pop pcard', role: 'dialog', 'aria-label': t('source', lang), id: 'ft-source-pop' },
      h('div', { class: 'pcard__scroll' }, r.kind ? h('p', { class: 'kind' }, r.kind) : null, sourceList(r.sources, era)),
      closeSlip('close-source'))
    pop.hidden = true
    const popScrim = h('div', { class: 'pop-scrim', 'aria-hidden': 'true', onclick: () => closePops() })
    popScrim.hidden = true
    let opener: HTMLElement | null = null // focus goes back here when the card closes
    const showPop = (el: HTMLElement, show: boolean, from: HTMLElement) => {
      closePops()
      el.hidden = !show
      popScrim.hidden = !show
      if (!show) return
      opener = from
      on.pop?.(true)
      el.querySelector<HTMLElement>('.pcard__foot button')?.focus({ preventScroll: true })
    }
    const toggleSource = () => {
      const show = Boolean(pop.hidden)
      showPop(pop, show, srcBtn)
      srcBtn.setAttribute('aria-expanded', String(show))
    }
    const label = `${t('source', lang)}: ${r.sources[0] ? formatSource(r.sources[0], era) : ''}`
    const rect = r.sourceRect
    const srcBtn = h('button', { class: rect ? 'source-hit' : 'btn btn--chit source-slip', type: 'button', 'data-action': 'source', 'aria-label': label,
      'aria-controls': 'ft-source-pop', 'aria-expanded': 'false', onclick: toggleSource,
      ...(rect ? { style: `left:${Math.round(rect.x)}px;top:${Math.round(rect.y + rect.h / 2 - Math.max(48, rect.h) / 2)}px;width:${Math.max(48, Math.round(rect.w))}px;height:${Math.max(48, Math.round(rect.h))}px` } : {}) },
      rect ? null : t('source', lang))
    const end = r.end
    // the receipts: newspaper clippings in a popover over the scene, with a close slip
    const receiptsPop = h('div', { class: 'receipts-pop pcard', role: 'dialog', 'aria-label': t('receipts', lang), id: 'ft-receipts-pop' },
      h('div', { class: 'pcard__scroll' },
        h('div', { class: 'receipts' }, (end?.receipts ?? []).slice(0, 2).map((rc, i) =>
          h('article', { class: 'receipt', 'data-receipt': rc.id, style: `--i:${i}` },
            h('blockquote', { class: 'receipt__quote' }, h('p', null, rc.quote[lang])),
            h('p', { class: 'receipt__who' }, rc.who[lang]),
            h('p', { class: 'receipt__joke' }, rc.joke[lang]),
            h('p', { class: 'receipt__source' }, formatSource(rc.source, era)))))),
      closeSlip('close-receipts'))
    receiptsPop.hidden = true
    closePops = () => {
      const wasOpen = !pop.hidden || !receiptsPop.hidden
      const focusInside = pop.contains(document.activeElement) || receiptsPop.contains(document.activeElement)
      pop.hidden = true
      receiptsPop.hidden = true
      popScrim.hidden = true
      srcBtn.setAttribute('aria-expanded', 'false')
      result?.querySelector('[data-action="receipts"]')?.setAttribute('aria-expanded', 'false')
      // reported before the focus goes back, so a keyboard player landing on the source holds it again
      if (wasOpen) on.pop?.(false)
      if (wasOpen && focusInside) opener?.focus({ preventScroll: true })
      return wasOpen
    }
    // A keyboard (or screen-reader) player on the source line holds a verdict that leads on, as the
    // open card does; leaving it gives the hold back. A tap's focus does not count.
    if (r.auto) {
      srcBtn.addEventListener('focus', () => {
        if (lastInput === 'key') on.pop?.(true)
      })
      srcBtn.addEventListener('blur', () => {
        if (pop.hidden) on.pop?.(false)
      })
    }
    const again = on.again
    const home = on.home
    const share = on.share
    const actions = end
      ? [
          end.earned ? h('p', { class: 'paper-result__earned' }, end.earned) : null,
          share ? h('button', { class: 'btn btn--primary btn--block', type: 'button', 'data-action': 'share', onclick: () => share() }, t('share', lang)) : null,
          h('div', { class: 'row2' },
            h('button', { class: 'btn btn--chit', type: 'button', 'data-action': 'again', onclick: () => again?.() }, t('playAgain', lang)),
            h('button', { class: 'btn btn--chit', type: 'button', 'data-action': 'home', onclick: () => home?.() }, t('home', lang))),
          end.receipts.length
            ? h('button', { class: 'link link--receipts', type: 'button', 'data-action': 'receipts', 'aria-controls': 'ft-receipts-pop', 'aria-expanded': 'false',
                onclick: (e: Event) => {
                  const show = Boolean(receiptsPop.hidden)
                  showPop(receiptsPop, show, e.currentTarget as HTMLElement)
                  ;(e.currentTarget as HTMLElement).setAttribute('aria-expanded', String(show))
                } }, t('receipts', lang))
            : null,
        ]
      : r.auto
        ? [] // the next day comes by itself, once the paper is in the basket
        : [(nextBtn = h('button', { class: 'btn btn--primary btn--block', type: 'button', 'data-action': 'next', onclick: () => on.next() }, t('next', lang)))]
    // under the paper: centred on it in landscape, along the bottom on a phone
    const under = r.paperRect && isWide() ? `left:${Math.round(r.paperRect.x)}px;width:${Math.round(r.paperRect.w)}px;right:auto` : ''
    const skipToss = on.skipToss
    result = h('div', { class: 'paper-result' },
      h('p', { class: 'sr-only paper-result__mirror', 'aria-live': 'polite' }, r.mirror),
      rect ? srcBtn : null, popScrim, pop, receiptsPop,
      h('footer', { class: 'paper-result__actions', ...(under ? { style: under } : {}) }, rect ? null : srcBtn, actions),
      // the same chip, in the same corner, while the verdict leads on by itself
      r.auto && !end && skipToss
        ? h('footer', { class: 'day__controls day__controls--hold' }, skipChip(() => skipToss(), true), h('div', { class: 'day__controls-space', 'aria-hidden': 'true' }))
        : null)
  }

  const copy = h('article', { class: 'day__message sr-only', lang, 'aria-live': 'polite', 'aria-atomic': 'true' })
  // a tap on the room finishes an animation, or, once the verdict is read, sends the paper on
  const auto = revealed && p.onPaper?.auto === true
  const tapcatch = h('div', { class: 'tapcatch', 'aria-hidden': 'true', onpointerdown: () => (auto && on.toss ? on.toss() : on.skip()) })
  const cls = ['screen', 'screen--day', `era-${era.id}`, waiting ? 'is-arriving' : '', revealed ? 'is-revealed' : '', auto ? 'is-auto' : '', auto && p.tossing ? 'is-tossing' : ''].filter(Boolean).join(' ')
  const screen = h('div', { class: cls, lang, 'data-channel': era.channel, 'data-file': fileMode },
    tapcatch, top, copy,
    h('aside', { class: 'dossier', 'aria-label': `${t('caseFile', lang)}, ${t('rulebook', lang)}` }, panels.file, panels.rules),
    scrim, controls, result)
  if (p.readable || revealed) fillCopy(copy, p)
  mount(root, screen)
  applyLayout()

  unsubLayout()
  unsubLayout = onLayoutChange((w) => {
    if (!screen.isConnected) return unsubLayout()
    wide = w
    if (wide) open = null
    applyLayout()
  })

  active = {
    root, screen, on, props: { ...p },
    close: () => {
      if (picker?.classList.contains('is-open')) return setPicker(false), true
      if (closePops()) return true
      return !wide && open ? (setOpen(null), true) : false
    },
  }
  if (!keysBound) {
    document.addEventListener('keydown', onKey)
    document.addEventListener('keydown', () => (lastInput = 'key'), { capture: true, passive: true })
    document.addEventListener('pointerdown', () => (lastInput = 'pointer'), { capture: true, passive: true })
    keysBound = true
  }

  // Announce the result once, not on every re-render.
  const key = `${era.id}|${state.day}|${msg.id}|${revealed}`
  if (revealed && announced.get(root) !== key) {
    announced.set(root, key)
    const stop = lang === 'hi' ? '।' : '.'
    announce(`${t(verdictKey(state), lang)}${stop} ${t(msg.real ? 'wasGenuine' : 'wasForged', lang)}${stop}`)
    nextBtn?.focus({ preventScroll: true })
  }
}

/**
 * The case file as a short story: two or three paragraphs of flowing sentences, one per fact of this
 * mode. Easy and Medium put the checkable words in a marker swash; Hard is plain ink. In Easy the
 * sentences the pencil points to today are underlined in pencil with a tick. In Hard a hidden fact's
 * checkable words are blank rules. Screen readers get the same sentences as plain text in every
 * mode, a blank read as "blank".
 */
export function caseFile(facts: Fact[], lang: Lang, mode: Difficulty, marked: Set<string> = new Set()): HTMLElement {
  const paras = storyParas(facts)
  const hard = mode === 'hard'
  const hidden = (f: Fact) => hard && f.hardHidden === true
  const sentence = (f: Fact) => {
    const pencilled = marked.has(f.id)
    const cls = ['fact', pencilled ? 'is-pencilled' : '', hidden(f) ? 'is-hidden' : ''].filter(Boolean).join(' ')
    const nodes: Child[] = storyParts(f.story[lang]).map((part) =>
      !part.hl ? part.text : hidden(f) ? h('span', { class: 'hl is-blank' }) : hard ? part.text : h('span', { class: 'hl' }, part.text))
    if (pencilled) {
      // the pencil's tick stays on the line of the sentence's first word
      const first = nodes.shift()
      const [word, rest] = typeof first === 'string' ? splitFirstWord(first) : [first, '']
      nodes.unshift(h('span', { class: 'fact__tick' }, word), rest)
    }
    return h('span', { class: cls, 'data-fact': f.id }, nodes)
  }
  const plain = (f: Fact) => storyParts(f.story[lang]).map((part) => (part.hl && hidden(f) ? t('blankFact', lang) : part.text)).join('')
  return h('div', { class: `story story--${mode}` },
    h('div', { class: 'story__ink', 'aria-hidden': 'true' }, paras.map((list) =>
      h('p', { class: 'story__para' }, list.flatMap((f, i) => (i > 0 ? [' ', sentence(f)] : [sentence(f)]))))),
    h('div', { class: 'story__said sr-only' }, paras.map((list) => h('p', null, list.map(plain).join(' ')))))
}

/**
 * Keeps a scrolling card's cue honest: `has-more` while lines lie below the fold, gone at the end
 * (or when it all fits). Returns the check, for a re-layout to run.
 */
export function watchScroll(card: HTMLElement, body: HTMLElement): () => void {
  const update = () => { card.classList.toggle('has-more', body.scrollHeight - body.clientHeight - body.scrollTop > 6) }
  body.addEventListener('scroll', update, { passive: true })
  if (typeof ResizeObserver === 'function') {
    // the fonts arriving, a rotation or a language reflow changes what fits
    const ro = new ResizeObserver(() => (body.isConnected ? update() : ro.disconnect()))
    ro.observe(body)
    if (body.firstElementChild) ro.observe(body.firstElementChild)
  }
  update()
  return update
}

/** The inked "more below" mark at a scrolling card's foot: two loose pen chevrons and a flick. */
function moreMark(): SVGSVGElement {
  return svg(`<svg class="scroll-cue__mark" viewBox="0 0 26 22" aria-hidden="true" focusable="false">
  <path d="M5.2 3.6c2.6 1.9 5 3.7 7.7 6 2.4-2.4 5-4.3 7.9-6.2" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/>
  <path d="M4.4 10.4c2.9 2.1 5.6 4.2 8.6 6.9 2.7-2.8 5.5-4.9 8.7-7.1" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M10.6 20.3c1.6-.5 3.3-.6 5 .1" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" opacity=".6"/>
</svg>`)
}

function splitFirstWord(text: string): [string, string] {
  const m = /^(\S+)([\s\S]*)$/.exec(text)
  return m ? [m[1]!, m[2]!] : [text, '']
}

/** The wooden handle of a rubber stamp, seen from the side. */
function stampHandle(): SVGSVGElement {
  return svg(`<svg class="stamp__handle" viewBox="0 0 30 40" aria-hidden="true" focusable="false">
  <ellipse cx="15" cy="8.5" rx="8" ry="7" fill="#8a5a32"/>
  <ellipse cx="13" cy="6.5" rx="3.6" ry="2.4" fill="#c99a62" opacity=".7"/>
  <path d="M11.5 14h7l1.4 12h-9.8z" fill="#6e4424"/>
  <path d="M4 26h22v6H4z" fill="#9b6a3c"/>
  <path d="M5 32h20v4.5H5z" fill="currentColor"/>
</svg>`)
}
