// The share card: a 1200 x 630 period paper on the era's desk, one design per chapter. It shows
// the chapter (year and place), the outcome and the days, the mode, the era's own ending stamp,
// the title lettering with the parrot, and one fixed dare. Every word on it comes from the
// ShareResult's enums and our own content; nothing a player typed is ever drawn. Text is set as
// glyph outlines (./text.ts), so the SVG this returns holds no text at all.
//
// Server only; relative imports end in `.js` (Vercel runs this file as a plain Node ES module).
import type { Era, Lang } from '../../src/content/types.js'
import { DAYS } from '../../src/game/config.js'
import { totalFor, type ShareResult } from '../../src/game/share-code.js'
import { strings, type Strings } from '../../src/i18n/strings.js'
import { SERVER_ERAS } from '../eras.js'
import { GlyphSheet, lineBox, measure, textLine, type FaceName } from './text.js'

export const CARD_W = 1200
export const CARD_H = 630

type Style = 'seal' | 'police' | 'raided' | 'telegraph'

/** Each desk's look: the wood and lamp around the paper, the paper, its inks and its type. */
interface Look {
  wood: [string, string]
  lamp: string
  paper: string
  /** Body ink, the accent ink (year, rules) and the faded ink (small print). */
  ink: string
  accent: string
  faint: string
  /** Faces for the year, the outcome and the small lines, in English. Hindi uses Tiro (or Kalam). */
  year: FaceName
  hero: FaceName
  small: FaceName
  heroHi: FaceName
  stamp: Style
  tilt: number
}

const LOOKS: Record<Era['channel'], Look> = {
  // a Mughal court petition: ivory handmade paper, a maroon and gold border, a seal
  petition: {
    wood: ['#3b1d0f', '#8f5532'], lamp: '#ffa04a', paper: '#ead7ab',
    ink: '#3b2516', accent: '#7c211b', faint: '#7a5a3a',
    year: 'printBold', hero: 'printBold', small: 'print', heroHi: 'deva', stamp: 'seal', tilt: -0.9,
  },
  // a hurried note on a ruled notebook leaf, in ink, with a CID stamp on it
  note: {
    wood: ['#4a3020', '#c29660'], lamp: '#ffb25e', paper: '#e4dcc4',
    ink: '#1f2940', accent: '#1d1d1b', faint: '#5d6478',
    year: 'printBold', hero: 'hand', small: 'hand', heroHi: 'hand', stamp: 'police', tilt: 1.1,
  },
  // a typed radio script on thin paper, a RAIDED stamp across it
  radio: {
    wood: ['#2a2018', '#a9743f'], lamp: '#ffbd6e', paper: '#ebe3c9',
    ink: '#23262e', accent: '#a3291f', faint: '#5b5a55',
    year: 'type', hero: 'type', small: 'type', heroHi: 'deva', stamp: 'raided', tilt: -1.2,
  },
  // a telegram form: printed in red-brown, typed strips pasted on, the telegraph office stamp
  telegram: {
    wood: ['#1d2a22', '#2f4a3a'], lamp: '#ffd08e', paper: '#efe2b3',
    ink: '#24231f', accent: '#8a2f1f', faint: '#8d6a4a',
    year: 'type', hero: 'type', small: 'type', heroHi: 'deva', stamp: 'telegraph', tilt: 0.7,
  },
}

/** The stamp inks of the paper's back (src/scene/sheet.ts), and the game's indigo for the daily puzzle. */
const TONE = { caught: '#981b13', survived: '#21458a', daily: '#28317c' } as const

/** The one fixed line under the result. */
const DARE: Record<Lang, string> = { en: 'Can you spot the forgery?', hi: 'क्या आप जालसाज़ी पकड़ पाएँगे?' }
const RIGHT: Record<Lang, string> = { en: 'Right', hi: 'सही' }
const HSRA: Record<Lang, string> = { en: 'H.S.R.A.', hi: 'एच.एस.आर.ए.' }
const LAHORE_CID: Record<Lang, string> = { en: 'C.I.D. LAHORE', hi: 'सी.आई.डी. लाहौर' }
const TELEGRAPH_OFFICE: Record<Lang, string> = { en: 'TELEGRAPH OFFICE', hi: 'तार घर' }

/** What the card says, all of it from the result's enums and our own content. */
export interface CardWords {
  place: string
  year: string
  /** The big figure: "7/7", "Day 4", "4/5". */
  hero: string
  /** Under it: "Survived", "Caught", "right". */
  caption: string
  /** "Easy · 7 days", or "Aaj ka Taar". */
  mode: string
  stamp: string
  dare: string
  head: string
}

const s = (lang: Lang, key: keyof Strings) => strings[lang][key]
const fill = (tpl: string, n: number) => tpl.replace('{n}', String(n))

export function cardWords(r: ShareResult): CardWords {
  const era = SERVER_ERAS[r.era]
  const L = r.lang
  const total = totalFor(r.mode)
  const head = { petition: s(L, 'sheetPetitionHead'), note: HSRA[L], radio: s(L, 'sheetRadioHead'), telegram: s(L, 'sheetTelegramHead') }[era.channel]
  const base = { place: era.place[L], year: era.year, dare: DARE[L], head }
  if (r.mode === 'daily') {
    // the stamp names the puzzle, so no mode line under the score
    return { ...base, hero: `${r.days}/${total}`, caption: RIGHT[L], mode: '', stamp: s(L, 'dailyTitle') }
  }
  const mode = `${s(L, r.mode === 'easy' ? 'modeEasy' : r.mode === 'medium' ? 'modeMedium' : 'modeHard')} · ${fill(s(L, 'modeDays'), DAYS[r.mode])}`
  const stamp = era.endings[r.outcome].stamp[L]
  return r.outcome === 'survived'
    ? { ...base, hero: `${r.days}/${total}`, caption: s(L, 'survivedStamp'), mode, stamp }
    : { ...base, hero: fill(s(L, 'dayTitle'), r.days + 1), caption: s(L, 'caughtStamp'), mode, stamp }
}

const n = (v: number) => String(Math.round(v * 10) / 10)

/** The desk around the paper: wood grain, the lamp's pool of light, a dark edge. */
function desk(look: Look): string {
  const [dark, light] = look.wood
  return `<defs>
<radialGradient id="lamp" cx="0.22" cy="0.12" r="1.05"><stop offset="0" stop-color="${look.lamp}" stop-opacity=".55"/><stop offset=".45" stop-color="${look.lamp}" stop-opacity=".12"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
<radialGradient id="vig" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></radialGradient>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".0035 .09" numOctaves="3" seed="11"/><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.3 -.45"/></filter>
</defs>
<rect width="${CARD_W}" height="${CARD_H}" fill="${dark}"/>
<rect width="${CARD_W}" height="${CARD_H}" fill="${light}" opacity=".55" filter="url(#grain)"/>
<rect width="${CARD_W}" height="${CARD_H}" fill="url(#lamp)"/>
<rect width="${CARD_W}" height="${CARD_H}" fill="url(#vig)"/>`
}

// the paper's rectangle, before the tilt
const PX = 58
const PY = 42
const PW = CARD_W - 2 * PX
const PH = CARD_H - 2 * PY

/** Handmade paper: its colour, fibres and mottling, an aged edge, a deckled outline and a shadow. */
function paper(look: Look, extra: string): string {
  return `<defs>
<filter id="deckle" x="-4%" y="-4%" width="108%" height="112%">
<feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="3" seed="7" result="t"/>
<feDisplacementMap in="SourceGraphic" in2="t" scale="8" xChannelSelector="R" yChannelSelector="G" result="d"/>
<feGaussianBlur in="d" stdDeviation="9" result="b"/><feOffset in="b" dx="2" dy="10" result="o"/>
<feColorMatrix in="o" type="matrix" values="0 0 0 0 .06  0 0 0 0 .03  0 0 0 0 .01  0 0 0 .6 0" result="sh"/>
<feMerge><feMergeNode in="sh"/><feMergeNode in="d"/></feMerge>
</filter>
<filter id="fibres" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9 .035" numOctaves="2" seed="4"/><feColorMatrix type="matrix" values="0 0 0 0 .42  0 0 0 0 .3  0 0 0 0 .14  0 0 0 1.4 -.95"/><feComposite in2="SourceAlpha" operator="in"/></filter>
<filter id="mottle" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".011" numOctaves="3" seed="9"/><feColorMatrix type="matrix" values="0 0 0 0 .45  0 0 0 0 .3  0 0 0 0 .12  0 0 0 .7 -.25"/><feComposite in2="SourceAlpha" operator="in"/></filter>
<radialGradient id="age" cx=".5" cy=".45" r=".72"><stop offset=".62" stop-color="#7a5222" stop-opacity="0"/><stop offset="1" stop-color="#7a5222" stop-opacity=".32"/></radialGradient>
</defs>
<g filter="url(#deckle)">
<rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="${look.paper}"/>
<rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="#fff" filter="url(#mottle)" opacity=".55"/>
<rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="#fff" filter="url(#fibres)" opacity=".5"/>
${extra}
<rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="url(#age)"/>
</g>`
}

/** Printed furniture on each kind of paper, under the writing. */
function furniture(ch: Era['channel'], look: Look, rightCx: number): string {
  const x0 = PX
  const y0 = PY
  if (ch === 'petition') {
    // a maroon rule, a band of small block-printed flowers, a thin gold rule
    const flowers: string[] = []
    const step = 26
    for (let x = x0 + 40; x <= x0 + PW - 40; x += step) flowers.push(`<use href="#buta" x="${n(x)}" y="${y0 + 30}"/><use href="#buta" x="${n(x)}" y="${y0 + PH - 30}"/>`)
    for (let y = y0 + 40 + step; y <= y0 + PH - 40 - step / 2; y += step) flowers.push(`<use href="#buta" x="${x0 + 30}" y="${n(y)}"/><use href="#buta" x="${x0 + PW - 30}" y="${n(y)}"/>`)
    return `<defs><g id="buta"><circle r="3.2" fill="${look.accent}"/><path d="M0-8.5C2.6-6 2.6-4 0-3.4-2.6-4-2.6-6 0-8.5ZM0 8.5C2.6 6 2.6 4 0 3.4-2.6 4-2.6 6 0 8.5ZM-8.5 0C-6 2.6-4 2.6-3.4 0-4-2.6-6-2.6-8.5 0ZM8.5 0C6 2.6 4 2.6 3.4 0 4-2.6 6-2.6 8.5 0Z" fill="#b8862e"/></g></defs>
<g opacity=".82">
<rect x="${x0 + 16}" y="${y0 + 16}" width="${PW - 32}" height="${PH - 32}" fill="none" stroke="${look.accent}" stroke-width="3.2"/>
<rect x="${x0 + 44}" y="${y0 + 44}" width="${PW - 88}" height="${PH - 88}" fill="none" stroke="#b8862e" stroke-width="1.4"/>
${flowers.join('')}
</g>`
  }
  if (ch === 'note') {
    // a ruled leaf: blue lines, a red margin, three punched holes
    const lines: string[] = []
    for (let y = y0 + 86; y < y0 + PH - 12; y += 42) lines.push(`<path d="M${x0} ${y}H${x0 + PW}" stroke="#7d98c4" stroke-width="1.3" opacity=".55"/>`)
    const holes = [0.2, 0.5, 0.8].map((k) => `<circle cx="${x0 + 30}" cy="${n(y0 + PH * k)}" r="11" fill="#3a2a1c" opacity=".85"/>`).join('')
    return `${lines.join('')}<path d="M${x0 + 96} ${y0}V${y0 + PH}" stroke="#c4473f" stroke-width="1.8" opacity=".7"/><path d="M${x0 + 101} ${y0}V${y0 + PH}" stroke="#c4473f" stroke-width=".8" opacity=".5"/>${holes}`
  }
  if (ch === 'radio') {
    // the typist's margin rule, and the faint ruled guide of the script pad
    return `<path d="M${x0 + 84} ${y0 + 24}V${y0 + PH - 24}" stroke="${look.accent}" stroke-width="1.4" opacity=".5"/>
<path d="M${x0 + 84} ${y0 + 108}H${rightCx - 200}" stroke="${look.faint}" stroke-width="1" opacity=".35"/>`
  }
  // the telegram form: a printed frame, rules under its head (clear of the lettering) and at its foot
  const ruleEnd = rightCx - 210
  return `<g stroke="${look.accent}" fill="none" opacity=".72">
<rect x="${x0 + 22}" y="${y0 + 22}" width="${PW - 44}" height="${PH - 44}" stroke-width="2.4"/>
<path d="M${x0 + 22} ${y0 + 126}H${ruleEnd}M${x0 + 22} ${y0 + 132}H${ruleEnd}" stroke-width="1.2"/>
<path d="M${x0 + 22} ${y0 + PH - 72}H${rightCx - 150}" stroke-width="1.2"/>
</g>`
}

/** The title lettering from the main page: "फ़िरंगी तोता" over "FIRANGI TOTA", the parrot on top. */
function lettering(sheet: GlyphSheet, cx: number, top: number, scale: number, latinInk: string): string {
  const w = 340
  const dev = 'फ़िरंगी तोता'
  const devSize = 66
  const devW = Math.min(290, measure('deva', dev, devSize))
  const lat = 'FIRANGI TOTA'
  const latSize = 19
  const latTrack = Math.max(0, (206 - measure('print', lat, latSize)) / (lat.length - 1) / latSize)
  const devLine = (dx: number, dy: number, attrs: string, strokeCol: string) =>
    textLine(sheet, dev, { face: 'deva', size: devSize, x: 170 + dx, y: 74 + dy, anchor: 'middle', maxWidth: devW, stroke: { color: strokeCol, width: 2.6 }, attrs })
  return `<defs><linearGradient id="gold" gradientUnits="userSpaceOnUse" x1="0" y1="760" x2="0" y2="-120"><stop offset="0" stop-color="#ffd27a"/><stop offset=".55" stop-color="#f2a33a"/><stop offset="1" stop-color="#d9741c"/></linearGradient>
<filter id="lift" x="-10%" y="-20%" width="120%" height="150%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#2a1205" flood-opacity=".45"/></filter></defs>
<g transform="translate(${n(cx - (w * scale) / 2)} ${n(top)}) scale(${scale})">
<g filter="url(#lift)">
${devLine(3, 3, 'fill="#2d0a10"', '#2d0a10')}
${devLine(0, 0, 'fill="url(#gold)"', '#5a1520')}
</g>
<path d="M34 97H158M182 97H306" stroke="#c77f22" stroke-width="1.6" fill="none"/>
<path d="M170 91l6 6-6 6-6-6z" fill="#c77f22"/><circle cx="30" cy="97" r="2.2" fill="#c77f22"/><circle cx="310" cy="97" r="2.2" fill="#c77f22"/>
${textLine(sheet, lat, { face: 'print', size: latSize, x: 170, y: 126, anchor: 'middle', tracking: latTrack, attrs: `fill="${latinInk}"` })}
<g transform="translate(272 -40) scale(.78)" filter="url(#lift)">${PARROT}</g>
</g>`
}

/** The parrot mark (src/ui/icons.ts parrotMark, a test keeps the two the same), in its 96 x 96 box. */
export const PARROT = `<path d="M43 71C40 80 35 88 28.5 95l6.5.6C41.5 89 46 81 48.5 73.5z" fill="#2c7433"/>
<path d="M45.5 74.5C43 81.5 39 88 34 93.5" fill="none" stroke="#56bb60" stroke-width="1.3" stroke-linecap="round"/>
<path d="M20 76.8h56" stroke="#7a5230" stroke-width="3.6" stroke-linecap="round"/>
<path d="M20 76h56" stroke="#a5774c" stroke-width="1" stroke-linecap="round"/>
<path d="M46 42c-8 6-11 18-7 27 3 6 10 8 15 5 6-4 8-14 7-23-1-6-8-11-15-9z" fill="#3fa94a"/>
<path d="M47 49c-7 6-9 18-6 30 5-2 10-9 11-17 0-6-2-10-5-13z" fill="#2f8f3a"/>
<path d="M42.5 63.5c2 1.8 4.8 2.4 7.6 1.6M42.6 68.5c1.9 1.4 4.3 1.8 6.6 1.1" fill="none" stroke="#62c26c" stroke-width="1" stroke-linecap="round" opacity=".85"/>
<path d="M49.5 74.6c-1.2 1.4-1.2 2.6 0 3.6M54 74.2c-1.2 1.4-1.2 2.6 0 3.6" fill="none" stroke="#5d6b78" stroke-width="1.9" stroke-linecap="round"/>
<circle cx="55" cy="35" r="13.5" fill="#4dbb54"/>
<path d="M64.6 44.6c-3 3.7-7 5.8-11.6 6.2" fill="none" stroke="#1b2a1d" stroke-width="2.4" stroke-linecap="round"/>
<path d="M53 50.9c-4.6.2-8.5-1.8-10.8-5.5" fill="none" stroke="#ec8fab" stroke-width="2.3" stroke-linecap="round"/>
<path d="M65 31.5c8-1.5 13.5 3.5 11.5 12-2-3.2-5.4-4.6-11-4.2z" fill="#d9342b"/>
<path d="M65.5 39.3c4.3 0 6.6 1.9 5.7 5.1-2.4-.4-4.3-1.4-5.7-2.8z" fill="#9e2420"/>
<circle cx="61" cy="33" r="3.1" fill="#fff4d6"/>
<circle cx="61.7" cy="33.1" r="1.65" fill="#161616"/>
<g transform="rotate(-9 55 22)">
<ellipse cx="55" cy="25" rx="21" ry="4.6" fill="#c9b384"/>
<path d="M39.5 24.5c0-16.5 31-16.5 31 0z" fill="#efe3c2"/>
<path d="M39.8 21.2c9.2-2 21.2-2 30.4 0l.2 3.2c-9.4-1.8-21.4-1.8-30.8 0z" fill="#8a6a38"/>
<circle cx="55" cy="10.2" r="2.2" fill="#d8c79a"/>
<path d="M45 18c1-5 6-7.5 11-7.5" fill="none" stroke="#fffaf0" stroke-width="1.6" stroke-linecap="round" opacity=".75"/>
</g>`

/** A five-pointed star, for the police stamp. */
function star(cx: number, cy: number, r: number): string {
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    const rr = i % 2 ? r * 0.45 : r
    pts.push(`${n(cx + Math.cos(a) * rr)},${n(cy + Math.sin(a) * rr)}`)
  }
  return `<polygon points="${pts.join(' ')}"/>`
}

/** A stamp's words on one line, or on two when one line would have to shrink much. */
function stampLines(label: string, face: FaceName, size: number, maxW: number): string[] {
  if (measure(face, label, size) <= maxW * 1.15 || !label.includes(' ')) return [label]
  return splitTwo(label)
}

/** Lines of stamp text centred on `cy`, each shrunk to `maxW` if it must. */
function stampText(sheet: GlyphSheet, lines: string[], o: { face: FaceName; size: number; cy: number; maxW: number; ink: string; tone: string; tracking?: number }): string {
  const gap = o.size * 1.08
  const first = o.cy + o.size * 0.36 - ((lines.length - 1) * gap) / 2
  // pressed a little heavy, the way a rubber stamp's letters spread (the paper's back does the same)
  const stroke = { color: o.tone, width: o.size * 0.045 }
  return lines.map((l, i) => textLine(sheet, l, { face: o.face, size: o.size, x: 0, y: first + i * gap, anchor: 'middle', maxWidth: o.maxW, tracking: o.tracking ?? 0, stroke, attrs: o.ink })).join('')
}

/** The era's rubber stamp, in the tone of the outcome, inked unevenly onto the paper. */
function eraStamp(sheet: GlyphSheet, style: Style, cx: number, cy: number, w: CardWords, lang: Lang, tone: string): string {
  const hi = lang === 'hi'
  const face: FaceName = hi ? 'deva' : 'printBold'
  const label = hi ? w.stamp : w.stamp.toUpperCase()
  const ink = `fill="${tone}"`
  const track = hi ? 0 : 0.04
  let body = ''
  let rot = -7
  if (style === 'seal') {
    // the Mughal seal: rings, a band of dots, the words at the heart
    const r = 106
    const dots: string[] = []
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2
      dots.push(`<circle cx="${n(Math.cos(a) * r * 0.75)}" cy="${n(Math.sin(a) * r * 0.75)}" r="3.6"/>`)
    }
    const size = hi ? 38 : 31
    const maxW = r * 1.08
    body = `<g fill="none" stroke="${tone}"><circle r="${r}" stroke-width="8"/><circle r="${n(r * 0.87)}" stroke-width="2.4"/><circle r="${n(r * 0.63)}" stroke-width="2.4"/></g><g ${ink}>${dots.join('')}</g>
${stampText(sheet, stampLines(label, face, size, maxW), { face, size, cy: 0, maxW, ink, tone, tracking: track })}`
  } else if (style === 'police') {
    // the CID's oval: the office above, the words, two stars, the year below
    const rx = 158
    const ry = 98
    const size = hi ? 34 : 28
    const maxW = rx * 1.3
    body = `<g fill="none" stroke="${tone}"><ellipse rx="${rx}" ry="${ry}" stroke-width="7"/><ellipse rx="${rx - 12}" ry="${ry - 12}" stroke-width="2.2"/></g>
${textLine(sheet, LAHORE_CID[lang], { face, size: hi ? 20 : 16, x: 0, y: -50, anchor: 'middle', tracking: hi ? 0 : 0.14, attrs: ink })}
${stampText(sheet, stampLines(label, face, size, maxW), { face, size, cy: 2, maxW, ink, tone, tracking: track })}
<g ${ink}>${star(-rx * 0.82, 2, 9)}${star(rx * 0.82, 2, 9)}</g>
${textLine(sheet, '1929', { face: 'printBold', size: 18, x: 0, y: 70, anchor: 'middle', tracking: 0.24, attrs: ink })}`
    rot = 6
  } else if (style === 'raided') {
    // a bold box across the script, like the stamp on a seized paper
    const bw = 340
    const bh = 128
    body = `<g fill="none" stroke="${tone}"><rect x="${-bw / 2}" y="${-bh / 2}" width="${bw}" height="${bh}" stroke-width="8"/><rect x="${-bw / 2 + 11}" y="${-bh / 2 + 11}" width="${bw - 22}" height="${bh - 22}" stroke-width="2.4"/></g>
${stampText(sheet, [label], { face, size: hi ? 54 : 46, cy: 0, maxW: bw * 0.8, ink, tone, tracking: hi ? 0 : 0.08 })}`
    rot = -9
  } else {
    // the telegraph office's date stamp: the town and year above, the words in the band, the office below
    const r = 118
    const size = hi ? 30 : 25
    const maxW = r * 1.5
    const lines = stampLines(label, face, size, maxW)
    const band = lines.length === 2 ? 34 : 22
    body = `<g fill="none" stroke="${tone}"><circle r="${r}" stroke-width="6"/><circle r="${n(r * 0.8)}" stroke-width="2.2"/></g>
<g ${ink}><rect x="${n(-r * 0.8)}" y="${-band - 4}" width="${n(r * 1.6)}" height="3"/><rect x="${n(-r * 0.8)}" y="${band + 1}" width="${n(r * 1.6)}" height="3"/></g>
${textLine(sheet, hi ? 'दिल्ली · 1947' : 'DELHI · 1947', { face: hi ? 'deva' : 'type', size: hi ? 22 : 19, x: 0, y: -band - 16, anchor: 'middle', maxWidth: r * 1.2, attrs: ink })}
${stampText(sheet, lines, { face, size, cy: 0, maxW, ink, tone, tracking: track })}
${textLine(sheet, TELEGRAPH_OFFICE[lang], { face, size: hi ? 21 : 15, x: 0, y: band + 32, anchor: 'middle', maxWidth: r * 1.2, tracking: hi ? 0 : 0.12, attrs: ink })}`
    rot = -5
  }
  return `<g transform="translate(${n(cx)} ${n(cy)}) rotate(${rot})" filter="url(#ink)" opacity=".9" style="mix-blend-mode:multiply">${body}</g>`
}

/** "LAHORE CONSPIRACY CASE" over two lines, split at the space nearest the middle. */
function splitTwo(label: string): [string, string] {
  const mid = label.length / 2
  let best = -1
  for (let i = 0; i < label.length; i++) if (label[i] === ' ' && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i
  return best < 0 ? [label, ''] : [label.slice(0, best), label.slice(best + 1)]
}

/** Worn rubber-stamp ink: specks where the rubber missed, a little wobble at the edges. */
const INK_FILTERS = `<filter id="ink" x="-15%" y="-25%" width="130%" height="150%">
<feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="3" result="speck"/>
<feColorMatrix in="speck" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.6 2.05" result="holes"/>
<feComposite in="SourceGraphic" in2="holes" operator="in" result="worn"/>
<feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="2" seed="5" result="wob"/>
<feDisplacementMap in="worn" in2="wob" scale="3.5" xChannelSelector="R" yChannelSelector="G"/>
</filter>
<filter id="press" x="-5%" y="-10%" width="110%" height="120%">
<feTurbulence type="fractalNoise" baseFrequency=".7" numOctaves="2" seed="8" result="speck"/>
<feColorMatrix in="speck" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -3.2 2.85" result="holes"/>
<feComposite in="SourceGraphic" in2="holes" operator="in"/>
</filter>`

/** The faces each line is set in, on this paper and in this language. */
function facesFor(ch: Era['channel'], look: Look, hi: boolean) {
  if (hi) {
    // Kalam's open 4 reads like a Devanagari 5 beside Hindi, so figures stay in Tiro
    const f: FaceName = ch === 'note' ? 'hand' : 'deva'
    return { head: 'deva' as FaceName, place: f, hero: 'deva' as FaceName, caption: f, mode: 'deva' as FaceName, dare: f }
  }
  return {
    head: (ch === 'radio' || ch === 'telegram' ? 'type' : ch === 'note' ? 'printBold' : 'print') as FaceName,
    place: (ch === 'note' ? 'printBold' : look.small) as FaceName,
    hero: look.hero,
    caption: (ch === 'note' ? 'hand' : ch === 'petition' ? 'printBold' : 'type') as FaceName,
    mode: look.small,
    dare: look.small,
  }
}

/** A loose pencil ring around the result, the way the game rings a slip on the paper. */
function pencilRing(x: number, y: number, w: number, h: number): string {
  const cx = x + w / 2
  const cy = y + h / 2
  const rx = w / 2 + 30
  const ry = h / 2 + 16
  return `<path d="M${n(cx + rx * 0.2)} ${n(cy - ry)}C${n(cx + rx * 1.02)} ${n(cy - ry * 0.98)} ${n(cx + rx * 1.06)} ${n(cy + ry * 0.92)} ${n(cx + rx * 0.05)} ${n(cy + ry)}S${n(cx - rx * 1.06)} ${n(cy + ry * 0.4)} ${n(cx - rx * 0.92)} ${n(cy - ry * 0.3)}S${n(cx - rx * 0.1)} ${n(cy - ry * 1.12)} ${n(cx + rx * 0.5)} ${n(cy - ry * 0.86)}" fill="none" stroke="#4d4a46" stroke-width="2.6" stroke-linecap="round" opacity=".5"/>`
}

/**
 * The card's SVG. Pure: the same result always gives the same markup, so its hash versions the
 * image's URL (server/share.ts).
 */
export function cardSvg(r: ShareResult): string {
  const era = SERVER_ERAS[r.era]
  const ch = era.channel
  const look = LOOKS[ch]
  const w = cardWords(r)
  const L = r.lang
  const hi = L === 'hi'
  const F = facesFor(ch, look, hi)
  const sheet = new GlyphSheet()
  const tone = r.mode === 'daily' ? TONE.daily : r.outcome === 'survived' ? TONE.survived : TONE.caught
  const left = PX + (ch === 'note' ? 132 : ch === 'radio' ? 112 : 98)
  const colW = 540
  const parts: string[] = []
  const t = (text: string, o: Parameters<typeof textLine>[2]) => parts.push(textLine(sheet, text, o))
  const fillOf = (c: string) => `fill="${c}"`

  // the paper's own head: the court's name, the party's initials, the radio's call sign, the telegram form
  let placeY = PY + 150
  if (ch === 'telegram') {
    t(hi ? 'भारतीय डाक और तार विभाग' : 'INDIAN POSTS AND TELEGRAPHS DEPARTMENT', { face: hi ? 'deva' : 'print', size: hi ? 22 : 15, x: left, y: PY + 64, tracking: hi ? 0 : 0.16, maxWidth: colW, attrs: fillOf(look.accent) })
    t(w.head, { face: hi ? 'deva' : 'printBold', size: hi ? 42 : 34, x: left, y: PY + 108, tracking: hi ? 0 : 0.34, attrs: fillOf(look.accent) })
    placeY = PY + 184
  } else {
    t(w.head, { face: F.head, size: hi ? 28 : ch === 'note' ? 21 : 23, x: left, y: PY + 84, tracking: hi ? 0 : ch === 'note' ? 0.26 : 0.06, maxWidth: colW, attrs: fillOf(look.faint) })
  }

  // the chapter: its place (the radio's head already names it), and the year large
  const place = ch === 'radio' ? (w.place.split(', ').pop() ?? w.place) : w.place
  t(hi ? place : place.toUpperCase(), { face: F.place, size: hi ? 34 : 25, x: left, y: placeY, tracking: hi ? 0 : 0.14, maxWidth: colW, attrs: fillOf(look.ink) })
  const yearSize = ch === 'telegram' ? 124 : 152
  const yearY = placeY + (ch === 'telegram' ? 120 : 146)
  parts.push(`<g filter="url(#press)">${textLine(sheet, w.year, { face: look.year, size: yearSize, x: left - 6, y: yearY, tracking: 0.01, attrs: fillOf(look.accent) })}</g>`)

  // the outcome: the big figure, then the caption and the mode beside it
  const heroY = yearY + (ch === 'telegram' ? 100 : 118)
  if (ch === 'telegram') {
    // typed onto strips of tape pasted on the form, the way a telegram's words arrive
    const line = hi ? `${w.hero} · ${w.caption}` : `${w.hero.toUpperCase()}  ${w.caption.toUpperCase()}  STOP`
    const size = hi ? 50 : 46
    const box = lineBox(line, { face: F.hero, size, x: left, maxWidth: colW - 20 })
    const modeLine = hi || !w.mode ? w.mode : `${w.mode.toUpperCase()}  STOP`
    const mbox = lineBox(modeLine, { face: F.mode, size: hi ? 30 : 26, x: left, maxWidth: colW - 20 })
    const strip = (x: number, y: number, bw: number, h: number, tilt: number) =>
      `<rect x="${n(x - 16)}" y="${n(y)}" width="${n(bw + 32)}" height="${n(h)}" fill="#faf6ea" stroke="#d9cfae" stroke-width="1" transform="rotate(${tilt} ${n(x)} ${n(y)})" filter="url(#tape)"/>`
    parts.push(strip(left, heroY - box.size * 0.86, box.w, box.size * 1.22, -0.5))
    t(line, { face: F.hero, size, x: left, y: heroY, maxWidth: colW - 20, attrs: fillOf(look.ink) })
    if (w.mode) {
      parts.push(strip(left, heroY + 26, mbox.w, mbox.size * 1.3, 0.4))
      t(modeLine, { face: F.mode, size: hi ? 30 : 26, x: left, y: heroY + 26 + mbox.size * 0.98, maxWidth: colW - 20, attrs: fillOf(look.ink) })
    }
  } else {
    const heroSize = hi ? 86 : look.hero === 'hand' ? 96 : 92
    const box = lineBox(w.hero, { face: F.hero, size: heroSize, x: left, maxWidth: 300 })
    parts.push(pencilRing(box.x, heroY - box.size * 0.74, box.w, box.size * 0.8))
    // Tiro has no bold: a Hindi figure gets a thin outline so it weighs what the English one does
    t(w.hero, { face: F.hero, size: heroSize, x: left, y: heroY, maxWidth: 300, attrs: fillOf(look.ink), ...(hi ? { stroke: { color: look.ink, width: 2.2 } } : {}) })
    const capX = box.x + box.w + 44
    const capW = left + colW - capX
    // with no mode line (the daily puzzle) the caption sits level with the figure
    t(w.caption, { face: F.caption, size: hi ? 44 : ch === 'note' ? 44 : 40, x: capX, y: heroY - (!w.mode ? 12 : hi ? 30 : 32), maxWidth: capW, attrs: fillOf(tone) })
    if (w.mode) t(w.mode, { face: F.mode, size: hi ? 28 : 24, x: capX, y: heroY + 6, maxWidth: capW, tracking: !hi && F.mode !== 'hand' ? 0.03 : 0, attrs: fillOf(look.faint) })
  }

  // the dare, at the foot of the paper
  t(w.dare, { face: F.dare, size: hi ? 31 : 28, x: left, y: PY + PH - (ch === 'telegram' ? 40 : 52), maxWidth: colW, attrs: `${fillOf(look.ink)} opacity=".88"` })

  // the title lettering, top right, and the era's stamp under it
  const rightCx = PX + PW - 252
  const lettered = lettering(sheet, rightCx, PY + 66, 1.1, look.accent)
  const stamp = eraStamp(sheet, look.stamp, rightCx + 4, PY + PH - 166, w, L, tone)

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_W}" height="${CARD_H}" viewBox="0 0 ${CARD_W} ${CARD_H}">
<defs>${INK_FILTERS}<filter id="tape" x="-5%" y="-30%" width="110%" height="170%"><feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-color="#3a2a10" flood-opacity=".35"/></filter></defs>
${desk(look)}
<g transform="rotate(${look.tilt} ${CARD_W / 2} ${CARD_H / 2})">
${paper(look, '')}
${furniture(ch, look, rightCx)}${parts.join('')}${lettered}${stamp}
</g>
<defs>${sheet.defs()}</defs>
</svg>`
}
