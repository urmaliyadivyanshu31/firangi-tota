import { h, svg } from './h'
import { parrotMark } from './icons'

// Our own ornaments: the title lettering, the jaali corner and the small marks. Static markup only.

let uid = 0

/** "फ़िरंगी तोता" over "FIRANGI TOTA", poster style, with the parrot perched on the headline. */
export function lettering(cls = ''): HTMLElement {
  const id = `lt${++uid}`
  return h('div', { class: `lettering ${cls}`.trim(), 'aria-hidden': 'true' },
    svg(`<svg class="lettering__svg" viewBox="0 0 340 134" focusable="false">
  <defs>
    <linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffd27a"/><stop offset=".55" stop-color="#f2a33a"/><stop offset="1" stop-color="#d9741c"/>
    </linearGradient>
  </defs>
  <text class="lettering__dev lettering__shadow" x="173" y="77" text-anchor="middle" font-size="66" textLength="290" lengthAdjust="spacingAndGlyphs">फ़िरंगी तोता</text>
  <text class="lettering__dev" x="170" y="74" text-anchor="middle" font-size="66" textLength="290" lengthAdjust="spacingAndGlyphs" fill="url(#${id}g)">फ़िरंगी तोता</text>
  <path class="lettering__rule" d="M34 97H158M182 97H306"/>
  <path class="lettering__gem" d="M170 91l6 6-6 6-6-6z"/>
  <circle class="lettering__gem" cx="30" cy="97" r="2"/><circle class="lettering__gem" cx="310" cy="97" r="2"/>
  <text class="lettering__lat" x="170" y="126" text-anchor="middle" font-size="19" textLength="206" lengthAdjust="spacing">FIRANGI TOTA</text>
</svg>`),
    parrotMark('lettering__parrot'))
}

/** A small corner of jaali lattice for a card's top-right corner. */
export function jaali(cls = 'jaali'): SVGSVGElement {
  const id = `jl${++uid}`
  return svg(`<svg class="${cls}" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
  <defs>
    <pattern id="${id}p" width="16" height="16" patternUnits="userSpaceOnUse">
      <rect x="4.5" y="4.5" width="7" height="7" fill="none" stroke="currentColor" stroke-width=".9"/>
      <rect x="4.5" y="4.5" width="7" height="7" transform="rotate(45 8 8)" fill="none" stroke="currentColor" stroke-width=".9"/>
      <path d="M0 8h2.6M13.4 8H16M8 0v2.6M8 13.4V16" stroke="currentColor" stroke-width=".9"/>
      <circle cx="0" cy="0" r="1.5" fill="currentColor"/><circle cx="16" cy="0" r="1.5" fill="currentColor"/>
      <circle cx="0" cy="16" r="1.5" fill="currentColor"/><circle cx="16" cy="16" r="1.5" fill="currentColor"/>
    </pattern>
    <clipPath id="${id}c"><path d="M64 0H6A58 58 0 0 0 64 58Z"/></clipPath>
  </defs>
  <rect width="64" height="64" fill="url(#${id}p)" clip-path="url(#${id}c)"/>
  <path d="M6 0A58 58 0 0 0 64 58" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <path d="M13 0A51 51 0 0 0 64 51" fill="none" stroke="currentColor" stroke-width=".7"/>
</svg>`)
}

/** A rolled scroll: the mark for a real document (instead of an emoji). */
export function scrollMark(): SVGSVGElement {
  return svg(`<svg class="scroll-mark" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
  <path d="M5 3.5h9.5a2 2 0 0 1 2 2V15H7a2 2 0 0 1-2-2z" fill="#f3e2b8" stroke="currentColor" stroke-width="1.2"/>
  <path d="M7 15a2 2 0 1 1-2-2h11.5" fill="none" stroke="currentColor" stroke-width="1.2"/>
  <path d="M8 7h6M8 9.5h6M8 12h4" stroke="currentColor" stroke-width="1" stroke-linecap="round"/>
</svg>`)
}

/** One square of the daily share grid: an ink tick or a cross. */
export function gridTile(right: boolean): SVGSVGElement {
  return svg(right
    ? `<svg class="tile tile--right" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
  <rect x="2" y="2" width="36" height="36" rx="5" fill="currentColor"/>
  <rect x="5.5" y="5.5" width="29" height="29" rx="3" fill="none" stroke="#f3e7cc" stroke-opacity=".5" stroke-width="1.2"/>
  <path d="M12 20.5l5.2 5.2L28.5 14" fill="none" stroke="#f3e7cc" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
    : `<svg class="tile tile--wrong" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
  <rect x="2" y="2" width="36" height="36" rx="5" fill="currentColor"/>
  <rect x="5.5" y="5.5" width="29" height="29" rx="3" fill="none" stroke="#f3e7cc" stroke-opacity=".5" stroke-width="1.2"/>
  <path d="M14 14l12 12M26 14L14 26" fill="none" stroke="#f3e7cc" stroke-width="3.4" stroke-linecap="round"/>
</svg>`)
}

export function skipIcon(): SVGSVGElement {
  return svg(`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  <path d="M5 6l6 6-6 6M12 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`)
}

export function closeIcon(): SVGSVGElement {
  return svg(`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
</svg>`)
}

export function homeIcon(): SVGSVGElement {
  return svg(`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  <path d="M4 11.2L12 4.5l8 6.7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M6.5 10v9h4v-5h3v5h4v-9" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
</svg>`)
}
