import { svg } from './h'

// Our own drawings. Static markup only.

/** The Firangi Tota: a rose-ringed parakeet in a sola topi. The head and the eye are groups, so CSS can tilt and blink them. */
export function parrotMark(cls = 'mark'): SVGSVGElement {
  return svg(`<svg class="${cls}" viewBox="0 0 96 96" aria-hidden="true" focusable="false">
  <path d="M43 71C40 80 35 88 28.5 95l6.5.6C41.5 89 46 81 48.5 73.5z" fill="#2c7433"/>
  <path d="M45.5 74.5C43 81.5 39 88 34 93.5" fill="none" stroke="#56bb60" stroke-width="1.3" stroke-linecap="round"/>
  <path d="M20 76.8h56" stroke="#7a5230" stroke-width="3.6" stroke-linecap="round"/>
  <path d="M20 76h56" stroke="#a5774c" stroke-width="1" stroke-linecap="round"/>
  <path d="M46 42c-8 6-11 18-7 27 3 6 10 8 15 5 6-4 8-14 7-23-1-6-8-11-15-9z" fill="#3fa94a"/>
  <path d="M47 49c-7 6-9 18-6 30 5-2 10-9 11-17 0-6-2-10-5-13z" fill="#2f8f3a"/>
  <path d="M42.5 63.5c2 1.8 4.8 2.4 7.6 1.6M42.6 68.5c1.9 1.4 4.3 1.8 6.6 1.1" fill="none" stroke="#62c26c" stroke-width="1" stroke-linecap="round" opacity=".85"/>
  <path d="M49.5 74.6c-1.2 1.4-1.2 2.6 0 3.6M54 74.2c-1.2 1.4-1.2 2.6 0 3.6" fill="none" stroke="#5d6b78" stroke-width="1.9" stroke-linecap="round"/>
  <g class="parrot__head">
  <circle cx="55" cy="35" r="13.5" fill="#4dbb54"/>
  <path d="M64.6 44.6c-3 3.7-7 5.8-11.6 6.2" fill="none" stroke="#1b2a1d" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M53 50.9c-4.6.2-8.5-1.8-10.8-5.5" fill="none" stroke="#ec8fab" stroke-width="2.3" stroke-linecap="round"/>
  <path d="M65 31.5c8-1.5 13.5 3.5 11.5 12-2-3.2-5.4-4.6-11-4.2z" fill="#d9342b"/>
  <path d="M65.5 39.3c4.3 0 6.6 1.9 5.7 5.1-2.4-.4-4.3-1.4-5.7-2.8z" fill="#9e2420"/>
  <g class="parrot__eye">
  <circle cx="61" cy="33" r="3.1" fill="#fff4d6"/>
  <circle cx="61.7" cy="33.1" r="1.65" fill="#161616"/>
  </g>
  <g transform="rotate(-9 55 22)">
    <ellipse cx="55" cy="25" rx="21" ry="4.6" fill="#c9b384"/>
    <path d="M39.5 24.5c0-16.5 31-16.5 31 0z" fill="#efe3c2"/>
    <path d="M39.8 21.2c9.2-2 21.2-2 30.4 0l.2 3.2c-9.4-1.8-21.4-1.8-30.8 0z" fill="#8a6a38"/>
    <circle cx="55" cy="10.2" r="2.2" fill="#d8c79a"/>
    <path d="M45 18c1-5 6-7.5 11-7.5" fill="none" stroke="#fffaf0" stroke-width="1.6" stroke-linecap="round" opacity=".75"/>
  </g>
  </g>
</svg>`)
}

/** Game sound (ambience and effects) on: a speaker with waves. */
export function speakerIcon(): SVGSVGElement {
  return svg(`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/>
  <path d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.5a7.8 7.8 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
</svg>`)
}

/** Game sound off: the speaker with a slash through it. */
export function speakerOffIcon(): SVGSVGElement {
  return svg(`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" opacity=".6"/>
  <path d="M15.5 9a4.2 4.2 0 0 1 0 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" opacity=".6"/>
  <path d="M3.5 3.5l17 17" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
</svg>`)
}

/** Listen (read the message aloud in the era voice): a microphone. */
export function micIcon(): SVGSVGElement {
  return svg(`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  <rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor"/>
  <path d="M6 11a6 6 0 0 0 12 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M12 17v3.5M8.5 20.5h7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
</svg>`)
}

export function backIcon(): SVGSVGElement {
  return svg(`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  <path d="M14.5 5.5L8 12l6.5 6.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`)
}
