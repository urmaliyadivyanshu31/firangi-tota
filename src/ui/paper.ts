import type { Era, Lang, Message } from '../content/types'
import { fillTemplate } from '../game/dates'
import { seedFrom } from '../game/rng'
import { t, tf, type Strings } from '../i18n/strings'
import { h, svg } from './h'

// The message on the desk, drawn as the era's own paper. The chrome adds no facts of its own
// (no dates, times or headings that could hide or fake a tell): only material, framing and a seal.

/** The message body with {date}/{weekday} placeholders filled. This is what read-aloud speaks. */
export function messageText(msg: Message, isoDate: string, lang: Lang): string {
  return fillTemplate(msg.text[lang], isoDate, lang)
}

type Range = [start: number, end: number]

function findRanges(text: string, checks: string[]): Range[] {
  const found: Range[] = []
  for (const c of checks) {
    if (!c) continue
    for (let i = text.indexOf(c); i !== -1; i = text.indexOf(c, i + c.length)) found.push([i, i + c.length])
  }
  // Reading order; on a tie the longer check wins; overlaps are dropped.
  found.sort((a, b) => a[0] - b[0] || b[1] - a[1])
  const out: Range[] = []
  for (const r of found) if (!out.length || r[0] >= out[out.length - 1]![1]) out.push(r)
  return out
}

/** Text with each range wrapped in <mark class="pencil">. */
function pencilled(text: string, ranges: Range[]): (string | HTMLElement)[] {
  const parts: (string | HTMLElement)[] = []
  let at = 0
  for (const [s, e] of ranges) {
    if (s > at) parts.push(text.slice(at, s))
    parts.push(h('mark', { class: 'pencil' }, text.slice(s, e)))
    at = e
  }
  if (at < text.length) parts.push(text.slice(at))
  return parts
}

/** A string like "Humbly submitted to {to}" with the placeholder replaced by nodes. */
function frame(key: keyof Strings, lang: Lang, name: string, value: (string | HTMLElement)[]): (string | HTMLElement)[] {
  const [before = '', after = ''] = t(key, lang).split(`{${name}}`)
  return [before, ...value, after].filter((p) => p !== '')
}

const SEAL = `<svg class="paper__seal" viewBox="0 0 64 64" aria-hidden="true">
  <path d="M32 2.5L38 5.7L44.8 5.4L48.8 10.9L55.1 13.6L56.3 20.3L60.8 25.4L59 32L60.8 38.6L56.3 43.7L55.1 50.4L48.8 53.1L44.8 58.6L38 58.3L32 61.5L26 58.3L19.2 58.6L15.2 53.1L8.9 50.4L7.7 43.7L3.2 38.6L5 32L3.2 25.4L7.7 20.3L8.9 13.6L15.2 10.9L19.2 5.4L26 5.7Z" fill="#8f2c1f"/>
  <circle cx="32" cy="32" r="21" fill="none" stroke="#e8b9a0" stroke-opacity=".45" stroke-width="1.4"/>
  <circle cx="32" cy="32" r="17.5" fill="none" stroke="#e8b9a0" stroke-opacity=".3" stroke-width=".8"/>
  <g fill="#e8b9a0" fill-opacity=".42">
    <ellipse cx="32" cy="22.5" rx="3.2" ry="7"/><ellipse cx="32" cy="41.5" rx="3.2" ry="7"/>
    <ellipse cx="22.5" cy="32" rx="7" ry="3.2"/><ellipse cx="41.5" cy="32" rx="7" ry="3.2"/>
    <ellipse cx="25.3" cy="25.3" rx="2.4" ry="5.6" transform="rotate(-45 25.3 25.3)"/>
    <ellipse cx="38.7" cy="38.7" rx="2.4" ry="5.6" transform="rotate(-45 38.7 38.7)"/>
    <ellipse cx="38.7" cy="25.3" rx="2.4" ry="5.6" transform="rotate(45 38.7 25.3)"/>
    <ellipse cx="25.3" cy="38.7" rx="2.4" ry="5.6" transform="rotate(45 25.3 38.7)"/>
  </g>
  <circle cx="32" cy="32" r="3.4" fill="#8f2c1f" stroke="#e8b9a0" stroke-opacity=".5"/>
</svg>`

function telegramNumber(msg: Message): number {
  return 1000 + (seedFrom(msg.id) % 9000)
}

export function paperEl(msg: Message, era: Era, isoDate: string, lang: Lang, pencil: boolean): HTMLElement {
  const fill = (s: string) => fillTemplate(s, isoDate, lang)
  const text = messageText(msg, isoDate, lang)
  const from = fill(msg.from[lang])
  const to = fill(msg.to[lang])
  const checks = pencil ? (msg.checks?.[lang] ?? []) : []

  // Pencil marks go on the body. A check that is not in the body (a name in the signature, say)
  // is marked where it does appear.
  const inBody = checks.filter((c) => c && text.includes(c))
  const elsewhere = checks.filter((c) => c && !text.includes(c))
  const body = h('p', { class: 'paper__text' }, pencilled(text, findRanges(text, inBody)))
  const fromNodes = pencilled(from, findRanges(from, elsewhere))
  const toNodes = pencilled(to, findRanges(to, elsewhere))

  const field = (label: keyof Strings, value: (string | HTMLElement)[]) =>
    h('div', { class: 'paper__field' }, h('dt', null, t(label, lang)), h('dd', null, value))

  let parts: (Node | null)[]
  switch (era.channel) {
    case 'petition':
      parts = [
        h('p', { class: 'paper__salute' }, frame('petitionTo', lang, 'to', toNodes)),
        body,
        h('div', { class: 'paper__close' },
          h('p', { class: 'paper__sign' }, t('petitionClose', lang), h('br'), h('span', { class: 'paper__from' }, fromNodes)),
          svg(SEAL)),
      ]
      break
    case 'note':
      parts = [
        h('p', { class: 'paper__salute' }, frame('noteTo', lang, 'to', toNodes)),
        body,
        h('p', { class: 'paper__sign' }, frame('noteFrom', lang, 'from', fromNodes)),
      ]
      break
    case 'radio':
      parts = [
        h('header', { class: 'paper__head' }, t('radioHead', lang)),
        h('dl', { class: 'paper__fields' }, field('fieldFrom', fromNodes), field('fieldTo', toNodes)),
        body,
      ]
      break
    case 'telegram':
      parts = [
        h('header', { class: 'paper__head' },
          h('span', { class: 'paper__priority' }, t('telegramHead', lang)),
          h('span', { class: 'paper__number' }, tf('telegramNo', lang, { n: telegramNumber(msg) }))),
        h('dl', { class: 'paper__fields' }, field('fieldFrom', fromNodes), field('fieldTo', toNodes)),
        body,
      ]
      break
  }

  return h('article', { class: `paper paper--${era.channel} mat-${era.channel}`, lang, tabindex: 0 }, parts)
}
