import type { Era, Lang } from '../../content/types'
import type { ChapterState } from '../../game/state'
import { t, tf } from '../../i18n/strings'
import type { SheetSpec, VoiceState } from '../contract'
import { announce, h, mount } from '../h'
import { hud, setSound, setTimer, type ModeKind } from '../hud'
import { isWide, onLayoutChange } from '../layout'
import { micIcon } from '../icons'
import { closeIcon, jaali, skipIcon } from '../ornament'
import { relatedFacts } from '../pencil'
import { proofFold, tellLines, truthEl } from '../reveal'

// A day over the live room. The message itself is on the 3D paper; the DOM keeps a visually
// hidden copy for screen readers, and a Listen button plays the era's recorded voice. Around it: the thin top bar, the case file and
// rulebook (pinned on the left in landscape, sheets behind two tabs in portrait), the two stamps,
// and after the stamp, the result card.

export { setSound, setTimer }

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
  /** Show the result card (right/wrong, kind, why or tells, sources, Next). */
  revealed: boolean
  soundOn: boolean
  /** Read-aloud is available (the era voices are loaded), and what it is doing now. */
  voice?: VoiceState
  /** The Aaj ka Taar number: the mode chip names the puzzle instead of the difficulty. */
  daily?: number
  /** Show every rule, none tagged new (the daily puzzle plays with the whole rulebook). */
  allRules?: boolean
}

export interface DayHandlers {
  stamp(v: Verdict): void
  /** Listen: play the message aloud, or stop it while it plays. */
  listen(): void
  tab(t: Tab): void
  next(): void
  /** A tap during an animation: finish it now. */
  skip(): void
  sound(): void
  lang(): void
  /** Leave for home. When given, a home button shows in the top bar. */
  quit?(): void
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
  for (const b of stampButtons(a.screen)) b.disabled = false
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
  const hard = state.difficulty === 'hard'
  const waiting = !p.readable && !revealed

  // ---- the top bar
  const modeKind: ModeKind = p.daily !== undefined ? 'daily' : state.difficulty
  const modeLabel = p.daily !== undefined ? `${t('dailyTitle', lang)} #${p.daily}` : t(MODE_LABEL[state.difficulty], lang)
  const quit = on.quit
  const top = hud({ era, lang, day: state.day, days: state.days, mode: { kind: modeKind, label: modeLabel }, timerFrac: p.timerFrac, secs: p.secs, soundOn: p.soundOn }, {
    ...(quit ? { home: () => quit() } : {}),
    sound: () => on.sound(),
    lang: () => on.lang(),
  })

  // ---- the case file and the rulebook
  const marked = new Set(p.sheet.pencil ? relatedFacts(p.sheet.checks, era.facts, lang) : [])
  const facts = h('dl', { class: 'facts' }, era.facts.map((f) => {
    const blank = hard && f.hardHidden
    return h('div', { class: `fact${marked.has(f.id) ? ' is-pencilled' : ''}`, 'data-fact': f.id },
      h('dt', { class: 'fact__label' }, f.label[lang]),
      blank
        ? h('dd', { class: 'fact__value is-blank', 'aria-label': t('blankFact', lang) })
        : h('dd', { class: 'fact__value' }, h('span', { class: 'fact__ink' }, f.value[lang])))
  }))

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

  function sheetEl(kind: Tab, title: string, content: HTMLElement, tag: HTMLElement | null): HTMLElement {
    const head = h('header', { class: 'sheet__head' },
      h('span', { class: 'sheet__grab', 'aria-hidden': 'true' }),
      h('h2', { class: 'sheet__title' }, title, tag),
      h('button', { class: 'sheet__close', type: 'button', 'aria-label': t('closePanel', lang), title: t('closePanel', lang),
        onclick: () => { setOpen(null); tabs[kind]?.focus() } }, closeIcon()))
    const el = h('section', { class: `sheet sheet--${kind}`, id: `ft-panel-${kind}`, 'data-panel': kind, 'aria-label': title },
      h('span', { class: kind === 'file' ? 'clip' : 'pin', 'aria-hidden': 'true' }),
      head,
      h('div', { class: 'sheet__body' }, content))
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
    if (wide) {
      const first = facts.querySelector<HTMLElement>('.is-pencilled')
      if (first && typeof first.scrollIntoView === 'function') first.scrollIntoView({ block: 'nearest' })
    }
  }

  function setOpen(next: Tab | null): void {
    open = next
    applyLayout()
  }

  // ---- the controls: tabs and stamps, a skip chip during animations
  const tab = (k: Tab, label: string, extra: HTMLElement | null) => {
    const b = h('button', { class: `tab tab--${k}`, type: 'button', 'data-tab': k, 'aria-controls': `ft-panel-${k}`, 'aria-expanded': 'false',
      onclick: () => { setOpen(open === k ? null : k); on.tab(k) } }, h('span', null, label), extra)
    tabs[k] = b
    return b
  }
  const stampBtn = (v: Verdict, arrow: string, key: string) =>
    h('button', { class: `stamp stamp--${v}`, type: 'button', 'data-stamp': v, disabled: waiting, onclick: () => on.stamp(v) },
      h('span', { class: 'stamp__face' },
        h('span', { class: 'stamp__dev', lang: 'hi' }, t(v, 'hi')),
        h('span', { class: 'stamp__lat', lang: 'en' }, t(v, 'en'))),
      h('span', { class: 'stamp__foot' },
        h('span', { class: 'stamp__hint' }, t(v === 'asli' ? 'asliHint' : 'totaHint', lang)),
        h('kbd', { class: 'stamp__key', 'aria-hidden': 'true' }, `${arrow} ${key}`)))

  let listenBtn: HTMLButtonElement | null = null
  if (p.voice) {
    listenBtn = h('button', { class: 'listen', type: 'button', 'data-action': 'listen', disabled: waiting, onclick: () => on.listen() },
      h('span', { class: 'listen__icon' }, micIcon(), h('span', { class: 'listen__spin', 'aria-hidden': 'true' })),
      h('span', { class: 'listen__label' }, t('listen', lang)))
    applyVoice(listenBtn, p.voice, lang)
  }

  const controls = revealed ? null : h('footer', { class: 'day__controls' },
    h('button', { class: 'day__skip', type: 'button', 'data-action': 'skip', onclick: () => on.skip() }, h('span', null, t('skip', lang)), skipIcon()),
    h('div', { class: 'tabs' }, tab('file', t('caseFile', lang), null), tab('rules', t('rulebook', lang), anyNew ? newTag() : null), listenBtn),
    h('div', { class: 'stamps' }, stampBtn('asli', '←', '1'), stampBtn('tota', '→', '2')))

  // ---- the result card
  let nextBtn: HTMLButtonElement | null = null
  let result: HTMLElement | null = null
  if (revealed) {
    const correct = state.lastCorrect === true
    nextBtn = h('button', { class: 'btn btn--primary btn--block', type: 'button', 'data-action': 'next', onclick: () => on.next() }, t('next', lang))
    result = h('div', { class: 'result' },
      h('section', { class: `pcard reveal reveal--${correct ? 'right' : 'wrong'}`, role: 'dialog', 'aria-labelledby': 'ft-verdict' },
        jaali('pcard__jaali'),
        h('div', { class: 'pcard__scroll' },
          h('h2', { id: 'ft-verdict', class: 'reveal__word' }, h('span', null, t(verdictKey(state), lang))),
          truthEl(msg, lang),
          tellLines(msg, lang),
          proofFold(msg, era, lang)),
        h('footer', { class: 'pcard__foot' }, nextBtn)))
  }

  const copy = h('article', { class: 'day__message sr-only', lang, 'aria-live': 'polite', 'aria-atomic': 'true' })
  const tapcatch = h('div', { class: 'tapcatch', 'aria-hidden': 'true', onpointerdown: () => on.skip() })
  const cls = ['screen', 'screen--day', `era-${era.id}`, waiting ? 'is-arriving' : '', revealed ? 'is-revealed' : ''].filter(Boolean).join(' ')
  const screen = h('div', { class: cls, lang, 'data-channel': era.channel },
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

  active = { root, screen, on, props: { ...p }, close: () => (!wide && open ? (setOpen(null), true) : false) }
  if (!keysBound) {
    document.addEventListener('keydown', onKey)
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
