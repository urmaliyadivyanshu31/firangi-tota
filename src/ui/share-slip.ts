import type { Era, Lang } from '../content/types'
import { whatsappHref, xHref } from '../game/share'
import { t } from '../i18n/strings'
import { h, svg } from './h'
import { parrotMark } from './icons'

// The share slip: a period post card over the scene. On it, the post the player is about to send
// (in the language on screen) and the link; under it, the ways to send it, each with its real
// small logo: WhatsApp, X, copy the link, and the phone's own share menu where the browser has
// one. The stamp is the Firangi Tota himself, franked with the chapter's year.

export interface ShareSlipProps {
  era: Era
  lang: Lang
  /** The post, without the link. */
  text: string
  /** The /s/<code> link. */
  url: string
}

export interface ShareSlipHandlers {
  /** Copies the link; resolves whether it worked. */
  copy(url: string): Promise<boolean>
  /** The phone's own share sheet. Given only when the browser has one. */
  native?(): Promise<'shared' | 'cancelled' | 'failed'>
}

interface Open { layer: HTMLElement; opener: HTMLElement | null; timer: number }
let open: Open | null = null

/** Closes the slip if it is up; true when it was. Focus goes back to whatever opened it. */
export function closeShareSlip(): boolean {
  const o = open
  if (!o) return false
  open = null
  window.clearTimeout(o.timer)
  document.removeEventListener('keydown', onKey, true)
  o.layer.remove()
  if (o.opener?.isConnected) o.opener.focus({ preventScroll: true })
  return true
}

function onKey(e: KeyboardEvent): void {
  const o = open
  if (!o) return
  if (e.key === 'Escape') {
    e.preventDefault()
    e.stopPropagation()
    closeShareSlip()
    return
  }
  if (e.key !== 'Tab') return
  // keep the keyboard on the slip while it is up
  const stops = [...o.layer.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')]
  const first = stops[0]
  const last = stops[stops.length - 1]
  if (!first || !last) return
  const at = document.activeElement
  if (e.shiftKey && (at === first || !o.layer.contains(at))) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && (at === last || !o.layer.contains(at))) {
    e.preventDefault()
    first.focus()
  }
}

/** The link as it is printed on the card: no scheme. */
const printed = (url: string) => url.replace(/^https?:\/\//, '')

export function openShareSlip(p: ShareSlipProps, on: ShareSlipHandlers): HTMLElement {
  closeShareSlip()
  const { lang } = p
  const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
  const note = h('p', { class: 'share-slip__note', role: 'status', 'aria-live': 'polite' })
  const link = h('p', { class: 'share-slip__link', lang: 'en', dir: 'ltr' }, printed(p.url))

  const way = (kind: string, icon: SVGSVGElement, label: string, attrs: Record<string, string | ((e: Event) => void)>) =>
    h(attrs.href ? 'a' : 'button', { class: `btn btn--chit share-way share-way--${kind}`, 'data-share': kind, ...(attrs.href ? {} : { type: 'button' }), ...attrs },
      icon, h('span', { class: 'share-way__label' }, label))

  const copyLabel = t('shareCopy', lang)
  const copyBtn = way('copy', linkIcon(), copyLabel, {
    onclick: (e: Event) => {
      const btn = e.currentTarget as HTMLElement
      void on.copy(p.url).then((ok) => {
        if (!open || !btn.isConnected) return
        const labelEl = btn.querySelector('.share-way__label')!
        window.clearTimeout(open.timer)
        if (ok) {
          btn.classList.add('is-done')
          labelEl.textContent = t('copied', lang)
          note.textContent = t('copied', lang)
          open.timer = window.setTimeout(() => {
            btn.classList.remove('is-done')
            labelEl.textContent = copyLabel
          }, 2400)
        } else {
          // no clipboard: the link is selected on the card, ready to copy by hand
          note.textContent = t('copyFailed', lang)
          const range = document.createRange()
          range.selectNodeContents(link)
          const sel = window.getSelection()
          sel?.removeAllRanges()
          sel?.addRange(range)
        }
      })
    },
  })

  const ways = [
    way('whatsapp', whatsappIcon(), 'WhatsApp', { href: whatsappHref(p.text, p.url), target: '_blank', rel: 'noopener noreferrer', 'aria-label': t('shareWhatsApp', lang) }),
    way('x', xIcon(), 'X', { href: xHref(p.text, p.url), target: '_blank', rel: 'noopener noreferrer', 'aria-label': t('shareX', lang) }),
    copyBtn,
    on.native
      ? way('native', shareIcon(), t('shareMore', lang), {
          onclick: () => {
            void on.native!().then((r) => {
              if (r === 'shared') closeShareSlip()
            })
          },
        })
      : null,
  ]

  const slip = h('section', { class: 'share-slip', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'ft-share-title' },
    h('header', { class: 'share-slip__head' },
      h('h2', { class: 'share-slip__title', id: 'ft-share-title' }, t('sharePostcard', lang)),
      stamp(p.era)),
    h('p', { class: 'share-slip__msg' }, p.text),
    link,
    h('p', { class: 'share-slip__by' }, t('shareSendBy', lang)),
    h('div', { class: `share-slip__ways${on.native ? '' : ' share-slip__ways--odd'}` }, ways),
    note,
    h('footer', { class: 'share-slip__foot' },
      h('button', { class: 'btn btn--chit', type: 'button', 'data-action': 'close-share', onclick: () => closeShareSlip() }, t('shareClose', lang))))

  const layer = h('div', { class: `share-layer era-${p.era.id}`, lang },
    h('div', { class: 'share-scrim', 'aria-hidden': 'true', onclick: () => closeShareSlip() }),
    slip)
  document.body.appendChild(layer)
  open = { layer, opener, timer: 0 }
  document.addEventListener('keydown', onKey, true)
  slip.querySelector<HTMLElement>('.share-way')?.focus({ preventScroll: true })
  return layer
}

/** The stamp: the parrot on a perforated stamp, franked with a postmark carrying the year. */
function stamp(era: Era): HTMLElement {
  return h('div', { class: 'share-stamp', 'aria-hidden': 'true' },
    svg(`<svg class="share-stamp__paper" viewBox="0 0 64 76" focusable="false"><path d="${perforated(64, 76, 3.2)}" fill="#fbf4e2"/><rect x="6" y="6" width="52" height="64" fill="var(--stamp-ink)"/><rect x="8.5" y="8.5" width="47" height="59" fill="none" stroke="#fbf4e2" stroke-width=".8" opacity=".7"/></svg>`),
    parrotMark('share-stamp__parrot'),
    svg(`<svg class="share-stamp__mark" viewBox="0 0 120 64" focusable="false"><g fill="none" stroke="currentColor"><circle cx="34" cy="32" r="25" stroke-width="2"/><circle cx="34" cy="32" r="19" stroke-width="1"/><path d="M62 18c8-4 14 4 22 0s14 4 22 0s10 2 12 1M62 30c8-4 14 4 22 0s14 4 22 0s10 2 12 1M62 42c8-4 14 4 22 0s14 4 22 0s10 2 12 1" stroke-width="2"/></g><text x="34" y="36.5" text-anchor="middle" font-size="12" fill="currentColor" font-family="'Old Standard TT', Georgia, serif">${era.year}</text></svg>`))
}

/** A stamp's outline with perforations: half-circle bites all round. */
function perforated(w: number, hgt: number, r: number): string {
  const step = r * 2.6
  const bites = (len: number) => Math.max(1, Math.round(len / step))
  let d = `M0 0`
  const nx = bites(w)
  const ny = bites(hgt)
  const sx = w / nx
  const sy = hgt / ny
  for (let i = 0; i < nx; i++) d += `H${(i + 0.5) * sx - r}a${r} ${r} 0 0 0 ${2 * r} 0`
  d += `H${w}`
  for (let i = 0; i < ny; i++) d += `V${(i + 0.5) * sy - r}a${r} ${r} 0 0 0 0 ${2 * r}`
  d += `V${hgt}`
  for (let i = nx - 1; i >= 0; i--) d += `H${(i + 0.5) * sx + r}a${r} ${r} 0 0 0 ${-2 * r} 0`
  d += `H0`
  for (let i = ny - 1; i >= 0; i--) d += `V${(i + 0.5) * sy + r}a${r} ${r} 0 0 0 0 ${-2 * r}`
  return `${d}Z`
}

// The two brand marks are Simple Icons' glyphs (CC0; CREDITS.md), in each brand's own colour.

function whatsappIcon(): SVGSVGElement {
  return svg(`<svg class="share-way__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="#25D366" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>`)
}

function xIcon(): SVGSVGElement {
  return svg(`<svg class="share-way__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="#111" d="M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z"/></svg>`)
}

/** Two chain links (our own drawing). */
function linkIcon(): SVGSVGElement {
  return svg(`<svg class="share-way__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M10 14a4.5 4.5 0 0 0 6.4 0l3.2-3.2a4.5 4.5 0 0 0-6.4-6.4l-1.1 1.1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3.2 3.2a4.5 4.5 0 0 0 6.4 6.4l1.1-1.1"/></g><path class="share-way__tick" d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
}

/** The phone's share mark: a tray with an arrow on Apple devices, three joined dots elsewhere (our own drawings). */
function shareIcon(): SVGSVGElement {
  const apple = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent)
  return svg(apple
    ? `<svg class="share-way__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7.5 7.5 12 3l4.5 4.5"/><path d="M8.5 10.5H6v10h12v-10h-2.5"/></g></svg>`
    : `<svg class="share-way__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><g fill="currentColor"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/></g><path d="M8.6 10.7 15.4 6.3M8.6 13.3l6.8 4.4" stroke="currentColor" stroke-width="2"/></svg>`)
}
