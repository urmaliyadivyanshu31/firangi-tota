import type { Era, Lang } from '../../content/types'
import type { ChapterState } from '../../game/state'
import { pencilOn } from '../../game/config'
import { fillTemplate } from '../../game/dates'
import { t, tf } from '../../i18n/strings'
import { announce, h, mount } from '../h'
import { backIcon, speakerIcon } from '../icons'
import { paperEl } from '../paper'
import { proofEl } from '../reveal'
import { canSpeak, onVoicesChanged } from '../speak'

export type Verdict = 'asli' | 'tota'
export type Tab = 'file' | 'rules'

export interface DayProps {
  era: Era
  state: ChapterState
  isoDate: string
  /** Agarbatti left, 1 = full, 0 = burnt out. Update in place with `setTimer`. */
  timerFrac: number
  lang: Lang
  /** Show the reveal panel (right/wrong, kind, why or tells, sources, Next) instead of the stamps. */
  revealed: boolean
  /** Override pencil marks (the daily puzzle has none). Defaults to `pencilOn(difficulty, day)`. */
  pencil?: boolean
  /** Show every rule, none tagged new (the daily puzzle plays with the whole rulebook). */
  allRules?: boolean
}

export interface DayHandlers {
  stamp(v: Verdict): void
  speak(): void
  tab(t: Tab): void
  next(): void
  /** Leave for home. When given, a home button shows in the header. */
  quit?(): void
}

const LOW = 0.3

/** Right, Wrong, or Too slow when the agarbatti burnt out (Ruling R12). */
function verdictKey(s: ChapterState): 'right' | 'wrong' | 'tooSlow' {
  if (s.lastCorrect === true) return 'right'
  return s.lastVerdict === 'timeout' ? 'tooSlow' : 'wrong'
}

// One day screen is live at a time; the keyboard and voice listeners follow the latest render.
let active: { screen: HTMLElement; on: DayHandlers; revealed: boolean; close: () => boolean } | null = null
let keysBound = false
let unsubVoices: () => void = () => {}
const announced = new WeakMap<HTMLElement, string>()

function onKey(e: KeyboardEvent): void {
  if (!active || !active.screen.isConnected) return // another screen has replaced the day
  if (e.altKey || e.ctrlKey || e.metaKey || e.repeat) return
  const target = e.target as HTMLElement | null
  if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return
  if (e.key === 'Escape' && active.close()) return
  if (active.revealed) return
  if (e.key === 'ArrowLeft' || e.key === '1') active.on.stamp('asli')
  else if (e.key === 'ArrowRight' || e.key === '2') active.on.stamp('tota')
}

function applyTimer(el: HTMLElement, frac: number): void {
  const f = Math.min(1, Math.max(0, Number.isFinite(frac) ? frac : 0))
  el.style.setProperty('--burn', String(f))
  el.setAttribute('aria-valuenow', String(Math.round(f * 100)))
  el.classList.toggle('is-low', f < LOW)
}

/** Move the agarbatti without re-rendering (keeps scroll position and the open tab). */
export function setTimer(root: HTMLElement, frac: number): void {
  const el = root.querySelector<HTMLElement>('.agarbatti')
  if (el) applyTimer(el, frac)
}

function agarbatti(lang: Lang, frac: number): HTMLElement {
  const el = h('div', { class: 'agarbatti', role: 'progressbar', 'aria-label': t('timerLabel', lang), 'aria-valuemin': 0, 'aria-valuemax': 100 },
    h('span', { class: 'agarbatti__clip' },
      h('span', { class: 'agarbatti__stick' }, h('span', { class: 'agarbatti__smoke' }))),
    h('span', { class: 'agarbatti__holder' }))
  applyTimer(el, frac)
  return el
}

export function renderDay(root: HTMLElement, p: DayProps, on: DayHandlers): void {
  const { era, state, isoDate, lang, revealed } = p
  const msg = state.queue[state.day - 1]
  if (!msg) throw new Error(`No message for day ${state.day} (queue has ${state.queue.length})`)
  const pencil = p.pencil ?? pencilOn(state.difficulty, state.day)
  const hard = state.difficulty === 'hard'

  // Top: agarbatti, day count, date, read aloud.
  const speakBtn = h('button', { class: 'icon-btn', type: 'button', 'data-action': 'speak', 'aria-label': t('readAloud', lang), title: t('readAloud', lang), onclick: () => on.speak() }, speakerIcon())
  speakBtn.hidden = !canSpeak(lang)
  unsubVoices()
  unsubVoices = speakBtn.hidden
    ? onVoicesChanged(() => {
        if (speakBtn.isConnected && canSpeak(lang)) speakBtn.hidden = false
      })
    : () => {}

  const quit = on.quit
  const quitBtn = quit
    ? h('button', { class: 'icon-btn day__quit', type: 'button', 'data-action': 'quit', 'aria-label': t('home', lang), title: t('home', lang), onclick: () => quit() }, backIcon())
    : null
  const top = h('header', { class: 'day__top' },
    agarbatti(lang, p.timerFrac),
    h('div', { class: 'day__meta' },
      quitBtn,
      h('div', { class: 'day__when' },
        h('span', { class: 'day__count' }, tf('dayOf', lang, { n: state.day, total: state.days })),
        h('span', { class: 'day__date' }, fillTemplate('{weekday}, {date}', isoDate, lang))),
      speakBtn))

  // The desk: the paper, plus the case file and rulebook sheets that slide over it.
  const facts = h('dl', { class: 'facts' }, era.facts.map((f) =>
    h('div', { class: 'fact', 'data-fact': f.id },
      h('dt', { class: 'fact__label' }, f.label[lang]),
      h('dd', { class: 'fact__value' }, hard && f.hardHidden ? '—' : f.value[lang]))))

  const arrived = p.allRules ? era.rules : era.rules.filter((r) => r.arrivesOnDay <= state.day)
  const isNew = (day: number) => !p.allRules && state.day > 1 && day === state.day
  const anyNew = arrived.some((r) => isNew(r.arrivesOnDay))
  const newTag = () => h('span', { class: 'tag-new' }, t('newTag', lang))
  const rules = h('ol', { class: 'rules' }, arrived.map((r) =>
    h('li', { class: 'rule', 'data-rule': r.id }, h('span', null, r.text[lang]), isNew(r.arrivesOnDay) ? newTag() : null)))

  let open: Tab | null = null
  const panels: Record<Tab, HTMLElement> = {
    file: sheet('file', t('caseFile', lang), facts),
    rules: sheet('rules', t('rulebook', lang), rules),
  }
  const tabs: Partial<Record<Tab, HTMLButtonElement>> = {}

  function setOpen(next: Tab | null): void {
    open = next
    wrap.classList.toggle('has-sheet', open !== null)
    for (const k of ['file', 'rules'] as Tab[]) {
      panels[k].hidden = open !== k
      tabs[k]?.setAttribute('aria-expanded', String(open === k))
      tabs[k]?.classList.toggle('is-open', open === k)
    }
  }

  function sheet(kind: Tab, title: string, content: HTMLElement): HTMLElement {
    const el = h('section', { class: `sheet sheet--${kind}`, id: `ft-panel-${kind}`, 'data-panel': kind, 'aria-label': title },
      h('header', { class: 'sheet__head' },
        h('h2', null, title),
        h('button', { class: 'sheet__close', type: 'button', onclick: () => { setOpen(null); tabs[kind]?.focus() } }, t('closePanel', lang))),
      h('div', { class: 'sheet__body' }, content))
    el.hidden = true
    return el
  }

  const truth = msg.real ? 'asli' : 'tota'
  const wrap = h('div', { class: 'day__paperwrap' },
    paperEl(msg, era, isoDate, lang, pencil),
    revealed ? h('div', { class: `imprint imprint--${truth}`, 'aria-hidden': 'true' }, h('span', null, t(truth, lang))) : null,
    panels.file,
    panels.rules)
  const desk = h('main', { class: 'day__desk' }, wrap)

  // Bottom: tabs and stamps, or the reveal.
  let controls: HTMLElement
  let nextBtn: HTMLButtonElement | null = null
  if (!revealed) {
    const tab = (k: Tab, label: string, extra: HTMLElement | null) => {
      const b = h('button', { class: `tab tab--${k}`, type: 'button', 'data-tab': k, 'aria-controls': `ft-panel-${k}`, 'aria-expanded': 'false',
        onclick: () => { setOpen(open === k ? null : k); on.tab(k) } }, h('span', null, label), extra)
      tabs[k] = b
      return b
    }
    const stampBtn = (v: Verdict, key: string) =>
      h('button', { class: `stamp stamp--${v}`, type: 'button', 'data-stamp': v, onclick: () => on.stamp(v) },
        h('span', { class: 'stamp__word' }, t(v, lang)),
        h('span', { class: 'stamp__hint' }, t(v === 'asli' ? 'asliHint' : 'totaHint', lang), h('kbd', { class: 'stamp__key', 'aria-hidden': 'true' }, key)))
    controls = h('footer', { class: 'day__controls' },
      h('div', { class: 'tabs' }, tab('file', t('caseFile', lang), null), tab('rules', t('rulebook', lang), anyNew ? newTag() : null)),
      h('div', { class: 'stamps' }, stampBtn('asli', '1'), stampBtn('tota', '2')))
  } else {
    const correct = state.lastCorrect === true
    nextBtn = h('button', { class: 'btn btn--primary btn--block', type: 'button', 'data-action': 'next', onclick: () => on.next() }, t('next', lang))
    controls = h('footer', { class: 'day__controls day__controls--reveal' },
      h('section', { class: `reveal reveal--${correct ? 'right' : 'wrong'}`, 'aria-labelledby': 'ft-verdict' },
        h('div', { class: 'reveal__body' },
          h('div', { class: 'reveal__verdict' },
            h('h2', { id: 'ft-verdict', class: 'reveal__word' }, t(verdictKey(state), lang)),
            h('p', { class: 'reveal__truth' }, t(msg.real ? 'wasGenuine' : 'wasForged', lang))),
          proofEl(msg, era, lang)),
        h('div', { class: 'reveal__foot' }, nextBtn)))
  }

  const screen = h('div', { class: `screen screen--day era-${era.id}`, lang, 'data-channel': era.channel }, top, desk, controls)
  mount(root, screen)
  setOpen(null)

  active = { screen, on, revealed, close: () => (open ? (setOpen(null), true) : false) }
  if (!keysBound) {
    document.addEventListener('keydown', onKey)
    keysBound = true
  }

  // Announce once per new message and once per result, not on every re-render.
  const key = `${era.id}|${state.day}|${msg.id}|${revealed}`
  if (announced.get(root) !== key) {
    announced.set(root, key)
    if (revealed) {
      const stop = lang === 'hi' ? '।' : '.'
      announce(`${t(verdictKey(state), lang)}${stop} ${t(msg.real ? 'wasGenuine' : 'wasForged', lang)}${stop}`)
      nextBtn?.focus({ preventScroll: true })
    } else {
      announce(tf('announceDay', lang, { n: state.day, from: fillTemplate(msg.from[lang], isoDate, lang) }))
    }
  }
}
