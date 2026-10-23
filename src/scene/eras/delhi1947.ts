// delhi-1947: the cipher room in Viceroy's House, New Delhi, on a monsoon night, 5 to 18 August 1947.
// Government cream walls, a walnut desk with a green baize top, a brass desk lamp with a green glass
// shade, a typewriter, a wire tray of telegram forms, a candlestick telephone, the Viceroy's tear-off
// countdown calendar, rain running down the window, and a ceiling fan turning overhead.
//
// Layout (desk top y = 0, +z toward the player): the window is in the back wall behind the lamp,
// the calendar hangs above the typewriter, and every tall prop stands in the back band of the desk,
// so the paper, both stamps and their paths stay clear. The desk shot sees the back wall only up to
// about 0.4 m above the desk, so the window sill sits low and the calendar sits just above the props.
//
// What moves: the fan, the rain on the glass and the clock's second hand. The fan is above the
// camera, so it is seen only through its shadow: on high a shadowed ceiling light throws the blades
// across the desk and wall, and the shadow maps re-render each time the blades turn a few degrees.
import * as THREE from 'three'
import { ERA_PALETTES, mix } from '../palette'
import { DESK, SPOTS, createBatch, createDesk, createWarmLight, disposeTree, markShadowsDirty, material, type WarmLight } from '../props'
import { TIER_SETTINGS } from '../quality'
import { blobTexture, clothTexture, glowTexture, paperTexture, plasterTexture, stoneTexture, toTexture, woodTexture } from '../textures'
import { mulberry32 } from '../../game/rng'
import type { EraDressing, QualityTier } from '../types'

type V3 = [number, number, number]
type Ctx2D = CanvasRenderingContext2D

const pal = ERA_PALETTES['delhi-1947']

/** The number on the Viceroy's countdown calendar: the night of 5 August, ten days before the 15th. */
export const CALENDAR_DAYS = 10

// ---------------------------------------------------------------- the room's measurements

const FLOOR_Y = -0.76
/** Lutyens offices are tall; the fan hangs on a long downrod. */
const CEIL_Y = 2.84
const ROOM_W = 3.2
const BACK_Z = -0.4
const FRONT_Z = 1.8
/** The window opening in the back wall, behind the lamp; `reveal` is the depth of the inner reveal. */
const WIN = { x0: -0.64, x1: -0.06, y0: 0.07, y1: 1.32, reveal: 0.14 }
const FRAME_Z = BACK_Z - 0.12
const GLASS_Z = FRAME_Z - 0.004
const VIEW_Z = BACK_Z - 0.2
/** The calendar on the back wall, above the typewriter. */
const CAL = { x: 0.12, y: 0.255, w: 0.19, h: 0.27 }
/** The tear-off pad inside the calendar's board: its width, height and centre height. */
const PAD = (() => {
  const w = CAL.w - 0.026
  const h = w * 1.21
  return { w, h, y: CAL.y - CAL.h / 2 + 0.014 + h / 2 }
})()
/** The typewriter in the back right corner, turned a little toward the chair. */
const TYPEWRITER = { x: 0.29, z: -0.16, yaw: -0.24 }
/** The bulb hangs just below the rim of the shade. */
const BULB: V3 = [SPOTS.lamp.x, 0.168, SPOTS.lamp.z]
const FAN_HUB: V3 = [-0.05, 1.75, 0.4]
/** The overhead bulb, above and behind the fan, so the blades' shadows cross the desk and the wall. */
const CEILING_LAMP: V3 = [0.3, 2.6, 0.15]
const CEILING_COLOR = 0xffd9a8
const CEILING_INTENSITY = 11
/** A slow ceiling fan: 0.2 turns a second, so a blade shadow crosses the desk about every 1.7 s. */
const FAN_SPEED = 0.2 * Math.PI * 2
/** On high the fan's shadow re-renders whenever the blades have turned this far (about every other frame). */
const SHADOW_STEP = THREE.MathUtils.degToRad(3)

const SERIF = 'Georgia, "Times New Roman", serif'

// ---------------------------------------------------------------- canvas textures (era-specific)

function canvas2d(w: number, h: number): [HTMLCanvasElement, Ctx2D | null] {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return [c, c.getContext('2d')]
}

/** Draws `text` centred at (x, y), shrinking the font until it fits `maxW`. */
function fitText(g: Ctx2D, text: string, x: number, y: number, px: number, maxW: number, weight = 'bold'): void {
  let size = px
  g.font = `${weight} ${Math.round(size)}px ${SERIF}`
  const w = g.measureText(text).width
  if (w > maxW && w > 0) {
    size *= maxW / w
    g.font = `${weight} ${Math.round(size)}px ${SERIF}`
  }
  g.fillText(text, x, y)
}

/**
 * The tear-off countdown calendar's front sheet: the big number and the words, under the binding
 * strip with the stubs of the sheets already torn off.
 */
function calendarTexture(w: number, rng: () => number, anisotropy: number): THREE.CanvasTexture {
  const h = Math.round(w * 1.21)
  const [c, g] = canvas2d(w, h)
  if (g) drawCalendarPage(g, w, h, CALENDAR_DAYS, rng)
  return toTexture(c, { anisotropy })
}

/** One page of the countdown pad: the big number of days left, under the binding strip. */
export function drawCalendarPage(g: Ctx2D, w: number, h: number, days: number, rng: () => number): void {
  g.fillStyle = '#efe8d5'
  g.fillRect(0, 0, w, h)
  for (let i = 0; i < 260; i++) {
    g.fillStyle = `rgba(120,100,70,${(0.03 + rng() * 0.05).toFixed(3)})`
    g.fillRect(rng() * w, rng() * h, 1 + rng() * 2, 1 + rng() * 2)
  }
  // stubs of the torn sheets, then the binding strip over them
  g.fillStyle = '#d8ceb4'
  g.beginPath()
  g.moveTo(0, h * 0.05)
  for (let x = 0; x <= w; x += w / 36) g.lineTo(x, h * (0.062 + rng() * 0.022))
  g.lineTo(w, h * 0.05)
  g.closePath()
  g.fill()
  g.fillStyle = '#2b1e17'
  g.fillRect(0, 0, w, h * 0.052)
  g.textAlign = 'center'
  g.textBaseline = 'alphabetic'
  g.fillStyle = '#16120f'
  fitText(g, String(days), w / 2, h * 0.565, h * 0.44, w * 0.82)
  g.fillStyle = '#9e2219'
  g.fillRect(w * 0.12, h * 0.615, w * 0.76, Math.max(1, h * 0.008))
  fitText(g, days === 1 ? 'DAY LEFT' : 'DAYS LEFT', w / 2, h * 0.71, h * 0.082, w * 0.8)
  g.fillStyle = '#1d1915'
  fitText(g, 'TO PREPARE FOR THE', w / 2, h * 0.8, h * 0.06, w * 0.86, 'normal')
  fitText(g, 'TRANSFER OF POWER', w / 2, h * 0.89, h * 0.068, w * 0.86)
}

/** A telegram form: a printed header and boxes, a few typed lines and a red MOST IMMEDIATE. */
function telegramTexture(w: number, rng: () => number, anisotropy: number): THREE.CanvasTexture {
  const h = Math.round(w * 1.42)
  const [c, g] = canvas2d(w, h)
  if (g) {
    const s = w / 256
    g.fillStyle = '#e9dcbc'
    g.fillRect(0, 0, w, h)
    for (let i = 0; i < 160; i++) {
      g.fillStyle = `rgba(110,90,60,${(0.03 + rng() * 0.05).toFixed(3)})`
      g.fillRect(rng() * w, rng() * h, 1 + rng() * 3 * s, 1 + rng() * 2 * s)
    }
    g.strokeStyle = 'rgba(60,45,35,0.75)'
    g.fillStyle = 'rgba(50,38,30,0.85)'
    g.lineWidth = Math.max(1, 1.4 * s)
    g.strokeRect(10 * s, 10 * s, w - 20 * s, h - 20 * s)
    g.textAlign = 'center'
    g.textBaseline = 'alphabetic'
    fitText(g, 'TELEGRAM', w / 2, 40 * s, 26 * s, w * 0.6)
    // the boxes for office of origin, words, handed in and received
    g.beginPath()
    g.moveTo(10 * s, 52 * s)
    g.lineTo(w - 10 * s, 52 * s)
    g.moveTo(10 * s, 76 * s)
    g.lineTo(w - 10 * s, 76 * s)
    for (const f of [0.32, 0.55, 0.78]) {
      g.moveTo(w * f, 52 * s)
      g.lineTo(w * f, 76 * s)
    }
    g.stroke()
    g.fillStyle = 'rgba(40,36,34,0.55)'
    for (let y = 104 * s; y < h * 0.86; y += 17 * s) {
      let x = 22 * s
      const end = w - (22 + rng() * 60) * s
      while (x < end) {
        const len = (14 + rng() * 34) * s
        g.fillRect(x, y - 5 * s, Math.min(len, end - x), 5 * s)
        x += len + 6 * s
      }
    }
    g.save()
    g.translate(w * 0.62, h * 0.22)
    g.rotate(-0.12)
    g.strokeStyle = 'rgba(165,32,26,0.85)'
    g.fillStyle = 'rgba(165,32,26,0.85)'
    g.lineWidth = Math.max(1, 2 * s)
    g.strokeRect(-70 * s, -16 * s, 140 * s, 30 * s)
    fitText(g, 'MOST IMMEDIATE', 0, 6 * s, 15 * s, 128 * s)
    g.restore()
  }
  return toTexture(c, { anisotropy })
}

/** Four staggered rows of round, rimmed keys on a black deck. */
function keysTexture(w: number, anisotropy: number): THREE.CanvasTexture {
  const h = Math.round(w / 2)
  const [c, g] = canvas2d(w, h)
  if (g) {
    g.fillStyle = '#141312'
    g.fillRect(0, 0, w, h)
    const rows = ['1234567890-', 'QWERTYUIOP', 'ASDFGHJKL;', 'ZXCVBNM,.']
    const pitch = w / 11.6
    const r = pitch * 0.38
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    rows.forEach((keys, row) => {
      const y = h * (0.16 + row * 0.22)
      const x0 = pitch * (0.65 + row * 0.32)
      for (let i = 0; i < keys.length; i++) {
        const x = x0 + i * pitch
        g.fillStyle = '#a7a59c'
        g.beginPath()
        g.arc(x, y, r, 0, Math.PI * 2)
        g.fill()
        g.fillStyle = '#e7e0cb'
        g.beginPath()
        g.arc(x, y, r * 0.76, 0, Math.PI * 2)
        g.fill()
        g.fillStyle = '#1a1a1a'
        g.font = `bold ${Math.max(6, Math.round(r * 0.95))}px ${SERIF}`
        g.fillText(keys[i] ?? '', x, y + r * 0.05)
      }
    })
    // the space bar's shadow line
    g.fillStyle = '#2a2826'
    g.fillRect(w * 0.3, h * 0.93, w * 0.4, h * 0.04)
  }
  return toTexture(c, { anisotropy })
}

/** An office clock dial: cream face, black numerals and minute marks. */
function clockTexture(size: number): THREE.CanvasTexture {
  const [c, g] = canvas2d(size, size)
  if (g) {
    const R = size / 2
    g.translate(R, R)
    g.fillStyle = '#eee6d2'
    g.beginPath()
    g.arc(0, 0, R, 0, Math.PI * 2)
    g.fill()
    g.strokeStyle = '#1b1814'
    g.fillStyle = '#1b1814'
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2
      const long = i % 5 === 0
      g.lineWidth = long ? R * 0.035 : R * 0.014
      g.beginPath()
      g.moveTo(Math.sin(a) * R * 0.92, -Math.cos(a) * R * 0.92)
      g.lineTo(Math.sin(a) * R * (long ? 0.8 : 0.86), -Math.cos(a) * R * (long ? 0.8 : 0.86))
      g.stroke()
    }
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    g.font = `bold ${Math.round(R * 0.2)}px ${SERIF}`
    for (let i = 1; i <= 12; i++) {
      const a = (i / 12) * Math.PI * 2
      g.fillText(String(i), Math.sin(a) * R * 0.64, -Math.cos(a) * R * 0.64)
    }
  }
  return toTexture(c)
}

/**
 * The night outside, seen through rain: monsoon cloud lit from below by the town, a dark line of
 * trees, and warm lamps along a road with their smeared reflections on the wet ground. The canvas
 * is twice as tall as wide and `horizon` is the fraction down from the top.
 */
function nightTexture(w: number, rng: () => number, horizon: number): THREE.CanvasTexture {
  const h = w * 2
  const [c, g] = canvas2d(w, h)
  if (g) {
    const H = horizon * h
    const sky = g.createLinearGradient(0, 0, 0, h)
    sky.addColorStop(0, '#0a101c')
    sky.addColorStop(horizon * 0.6, '#141c2b')
    sky.addColorStop(horizon - 0.01, '#2c2a2e')
    sky.addColorStop(horizon + 0.004, '#0e0f13')
    sky.addColorStop(1, '#08090c')
    g.fillStyle = sky
    g.fillRect(0, 0, w, h)
    const blob = (x: number, y: number, r: number, rgb: string, a: number) => {
      const grd = g.createRadialGradient(x, y, 0, x, y, r)
      grd.addColorStop(0, `rgba(${rgb},${a})`)
      grd.addColorStop(1, `rgba(${rgb},0)`)
      g.fillStyle = grd
      g.fillRect(x - r, y - r, r * 2, r * 2)
    }
    for (let i = 0; i < 16; i++) blob(rng() * w, (0.05 + rng() * (horizon - 0.12)) * h, (0.15 + rng() * 0.25) * w, '78,84,104', 0.16)
    blob(w * 0.45, H, w * 0.7, '120,92,62', 0.16) // the town's glow on the low cloud
    // trees and low roofs on the horizon
    g.fillStyle = '#07080b'
    g.beginPath()
    g.moveTo(0, h)
    let y = 0
    for (let x = 0; x <= w; x += w / 40) {
      y = y * 0.6 + (rng() - 0.5) * 0.4
      g.lineTo(x, H - (0.006 + Math.abs(y) * 0.012 + (rng() < 0.15 ? 0.008 : 0)) * h)
    }
    g.lineTo(w, h)
    g.closePath()
    g.fill()
    // lamps: far ones on the horizon, near ones lower and larger, each with a wet reflection
    const lamp = (x: number, ly: number, r: number, warm: boolean) => {
      const rgb = warm ? '255,188,108' : '226,232,255'
      g.fillStyle = `rgba(${rgb},0.08)`
      const rh = r * 7
      const grd = g.createLinearGradient(0, ly, 0, ly + rh)
      grd.addColorStop(0, `rgba(${rgb},0.22)`)
      grd.addColorStop(1, `rgba(${rgb},0)`)
      g.fillStyle = grd
      g.fillRect(x - r * 0.45, ly, r * 0.9, rh)
      blob(x, ly, r * 2.6, rgb, 0.22)
      blob(x, ly, r, warm ? '255,226,170' : '250,250,255', 0.95)
    }
    for (let i = 0; i < 11; i++) lamp((i + 0.5 + (rng() - 0.5) * 0.6) * (w / 11), H + h * 0.004, w * (0.008 + rng() * 0.008), rng() > 0.2)
    for (let i = 0; i < 5; i++) lamp((i + 0.3 + rng() * 0.4) * (w / 5), H + h * (0.03 + rng() * 0.02), w * (0.02 + rng() * 0.012), true)
  }
  return toTexture(c)
}

/**
 * Rain on a pane, on transparent: beads with a warm glint from the lamp and, when `rivulets` > 0,
 * beads running down with a wet trail above them. Tiles in both directions.
 */
function rainTexture(size: number, rng: () => number, o: { beads: number; rivulets: number; repeat: [number, number] }): THREE.CanvasTexture {
  const [c, g] = canvas2d(size, size)
  if (g) {
    const s = size / 256
    // draw at every wrapped copy that can touch the tile, so the texture repeats seamlessly
    const wrapped = (x: number, y: number, r: number, draw: (x: number, y: number) => void) => {
      for (const dx of [-size, 0, size]) for (const dy of [-size, 0, size]) {
        if (x + dx > -r && x + dx < size + r && y + dy > -r && y + dy < size + r) draw(x + dx, y + dy)
      }
    }
    // a bead is mostly clear: a dark meniscus edge, a faint lens, a bright crescent where it
    // gathers light at the bottom, and on some a pin of reflected lamp near the top
    const bead = (x: number, y: number, r: number, glint: boolean) => {
      g.fillStyle = 'rgba(8,10,16,0.32)'
      g.beginPath()
      g.ellipse(x, y + r * 0.1, r, r * 1.15, 0, 0, Math.PI * 2)
      g.fill()
      g.fillStyle = 'rgba(120,136,160,0.2)'
      g.beginPath()
      g.ellipse(x, y, r * 0.78, r * 0.9, 0, 0, Math.PI * 2)
      g.fill()
      g.strokeStyle = 'rgba(205,215,232,0.32)'
      g.lineWidth = Math.max(0.5, r * 0.28)
      g.beginPath()
      g.ellipse(x, y + r * 0.1, r * 0.66, r * 0.8, 0, Math.PI * 0.2, Math.PI * 0.8)
      g.stroke()
      if (glint) {
        g.fillStyle = 'rgba(255,226,182,0.6)'
        g.beginPath()
        g.arc(x - r * 0.25, y - r * 0.4, Math.max(0.5, r * 0.22), 0, Math.PI * 2)
        g.fill()
      }
    }
    for (let i = 0; i < o.beads; i++) {
      const r = (1 + rng() * rng() * 3.6) * s
      const glint = rng() < 0.35
      wrapped(rng() * size, rng() * size, r, (x, y) => bead(x, y, r, glint))
    }
    for (let i = 0; i < o.rivulets; i++) {
      const x = rng() * size
      const head = rng() * size
      const len = (0.3 + rng() * 0.6) * size
      const wob = (rng() - 0.5) * 6 * s
      const lw = (0.8 + rng() * 1.1) * s
      const r = (1.5 + rng() * 1.3) * s
      wrapped(x, head - len / 2, len, (cx, cy) => {
        const top = cy - len / 2
        const bottom = cy + len / 2
        const grd = g.createLinearGradient(0, top, 0, bottom)
        grd.addColorStop(0, 'rgba(170,186,210,0)')
        grd.addColorStop(1, 'rgba(190,204,226,0.45)')
        g.strokeStyle = grd
        g.lineWidth = lw
        g.beginPath()
        g.moveTo(cx, top)
        g.bezierCurveTo(cx + wob, top + len * 0.33, cx - wob, top + len * 0.66, cx, bottom)
        g.stroke()
        bead(cx, bottom, r, true)
      })
    }
  }
  return toTexture(c, { repeat: o.repeat })
}

/**
 * Brass with the lighting baked in along a lathe profile: faces turned up toward the bulb glow,
 * the rest falls dark. Unlit, because a light a few centimetres from shiny brass blows it out.
 */
function brassForProfile(profile: [number, number][], h: number): THREE.CanvasTexture {
  const [c, g] = canvas2d(4, h)
  if (g) {
    const grad = g.createLinearGradient(0, h, 0, 0)
    const n = profile.length
    for (let j = 0; j < n; j++) {
      const a = profile[Math.max(0, j - 1)] ?? [0, 0]
      const b = profile[Math.min(n - 1, j + 1)] ?? [0, 0]
      const dx = b[0] - a[0]
      const dy = b[1] - a[1]
      const len = Math.hypot(dx, dy) || 1
      const up = Math.max(0, -dx / len) // the outward normal is (dy, -dx)
      const k = Math.min(1, 0.18 + 0.72 * up + (j / n) * 0.16)
      const col = new THREE.Color(0x24150a).lerp(new THREE.Color(0xb27a2c), k)
      if (up > 0.85) col.lerp(new THREE.Color(0xe8b860), 0.3)
      grad.addColorStop(j / (n - 1), `#${col.getHexString()}`)
    }
    g.fillStyle = grad
    g.fillRect(0, 0, 4, h)
  }
  return toTexture(c)
}

/** A desk pedestal's front: walnut with three drawers, dark joints and brass bail pulls. Twice as tall as wide. */
function drawerTexture(w: number, rng: () => number, anisotropy: number): THREE.CanvasTexture {
  const h = w * 2
  const [c, g] = canvas2d(w, h)
  const wood = woodTexture('walnut', { size: w, rng })
  if (g) {
    const img = wood.image as HTMLCanvasElement
    g.drawImage(img, 0, 0, w, w)
    g.drawImage(img, 0, w, w, w)
    g.fillStyle = 'rgba(30,16,8,0.22)'
    g.fillRect(0, 0, w, h)
    const m = w * 0.05
    const plinth = h * 0.085
    const rows = [0, 0.2, 0.555, 1].map((f) => f * (h - plinth))
    for (let i = 0; i < 3; i++) {
      const y0 = (rows[i] ?? 0) + m * 0.6
      const y1 = (rows[i + 1] ?? 0) - m * 0.6
      g.strokeStyle = 'rgba(12,6,3,0.9)'
      g.lineWidth = Math.max(1, w * 0.014)
      g.strokeRect(m, y0, w - 2 * m, y1 - y0)
      g.strokeStyle = 'rgba(255,214,160,0.16)'
      g.lineWidth = Math.max(1, w * 0.006)
      g.strokeRect(m + w * 0.012, y0 + w * 0.012, w - 2 * m - w * 0.024, y1 - y0 - w * 0.024)
      // a brass bail pull: backplate, the bail hanging below it
      const cx = w / 2
      const cy = y0 + Math.min(w * 0.16, (y1 - y0) * 0.42)
      const pw = w * 0.3
      const brass = g.createLinearGradient(0, cy - w * 0.03, 0, cy + w * 0.05)
      brass.addColorStop(0, '#e6bf6a')
      brass.addColorStop(0.5, '#a4752c')
      brass.addColorStop(1, '#4e3412')
      g.fillStyle = brass
      g.fillRect(cx - pw / 2, cy - w * 0.022, pw, w * 0.044)
      g.strokeStyle = brass
      g.lineWidth = Math.max(1.5, w * 0.018)
      g.beginPath()
      g.moveTo(cx - pw * 0.4, cy)
      g.quadraticCurveTo(cx, cy + w * 0.11, cx + pw * 0.4, cy)
      g.stroke()
      if (i === 0) {
        g.fillStyle = '#120b06'
        g.beginPath()
        g.arc(cx, cy - w * 0.065, w * 0.012, 0, Math.PI * 2)
        g.fill()
      }
    }
    g.fillStyle = 'rgba(10,6,3,0.92)'
    g.fillRect(0, h - plinth, w, plinth)
  }
  wood.dispose()
  return toTexture(c, { anisotropy })
}

/** A cotton durrie in madder, indigo and ochre stripes, with a border and the weave. */
function durrieTexture(w: number, rng: () => number, anisotropy: number): THREE.CanvasTexture {
  const [c, g] = canvas2d(w, w)
  if (g) {
    const madder = '#6a2c1d'
    const ochre = '#9c7232'
    const indigo = '#222a42'
    const natural = '#a8936c'
    g.fillStyle = madder
    g.fillRect(0, 0, w, w)
    const b = w * 0.07
    // stripes run across the rug, inside the border
    const pattern: [string, number][] = [[madder, 0.09], [indigo, 0.03], [ochre, 0.015], [natural, 0.008], [ochre, 0.015], [indigo, 0.03]]
    let y = b
    let i = 0
    while (y < w - b) {
      const [col, f] = pattern[i % pattern.length] ?? [madder, 0.05]
      g.fillStyle = col
      g.fillRect(b, y, w - 2 * b, Math.min(f * w, w - b - y))
      y += f * w
      i++
    }
    g.strokeStyle = indigo
    g.lineWidth = b * 0.7
    g.strokeRect(b * 0.55, b * 0.55, w - b * 1.1, w - b * 1.1)
    g.strokeStyle = ochre
    g.lineWidth = Math.max(1, b * 0.14)
    g.strokeRect(b * 1.05, b * 1.05, w - b * 2.1, w - b * 2.1)
    // the weave: fine warp lines and a slubby weft
    for (let x = 0; x < w; x += 2) {
      g.fillStyle = `rgba(0,0,0,${(0.05 + rng() * 0.05).toFixed(3)})`
      g.fillRect(x, 0, 1, w)
    }
    for (let yy = 0; yy < w; yy += 3) {
      g.fillStyle = `rgba(255,240,210,${(0.02 + rng() * 0.05).toFixed(3)})`
      g.fillRect(0, yy, w, 1)
    }
  }
  return toTexture(c, { anisotropy })
}

/** Woven cane: rows of strands passing over and under upright stakes. */
function wickerTexture(w: number): THREE.CanvasTexture {
  const [c, g] = canvas2d(w, w)
  if (g) {
    g.fillStyle = '#3b2611'
    g.fillRect(0, 0, w, w)
    const rows = 16
    const cols = 12
    const rh = w / rows
    const cw = w / cols
    for (let r = 0; r < rows; r++) {
      for (let k = 0; k <= cols; k++) {
        const x = k * cw + ((r % 2) * cw) / 2
        const grd = g.createLinearGradient(0, r * rh, 0, (r + 1) * rh)
        grd.addColorStop(0, '#d6a65c')
        grd.addColorStop(0.5, '#a9783a')
        grd.addColorStop(1, '#5e3f18')
        g.fillStyle = grd
        g.beginPath()
        g.ellipse(x, r * rh + rh / 2, cw * 0.47, rh * 0.42, 0, 0, Math.PI * 2)
        g.fill()
      }
    }
  }
  return toTexture(c, { repeat: [3, 2] })
}

// ---------------------------------------------------------------- geometry helpers

/** A plane whose UVs come from its world position along its two axes, so plaster lines up across pieces. */
function wallPlane(w: number, h: number, u0: number, v0: number, tile: number): THREE.PlaneGeometry {
  const geo = new THREE.PlaneGeometry(w, h)
  const p = geo.getAttribute('position') as THREE.BufferAttribute
  const uv = geo.getAttribute('uv') as THREE.BufferAttribute
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (u0 + p.getX(i) + w / 2) / tile, (v0 + p.getY(i) + h / 2) / tile)
  return geo
}

const lathe = (pts: [number, number][], seg: number) =>
  new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg)

const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d)

/** Applies a yaw and an offset to a geometry built around a prop's local origin. */
function local(geo: THREE.BufferGeometry, origin: V3, yaw: number, pos: V3, rot: V3 = [0, 0, 0]): THREE.BufferGeometry {
  geo.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(...pos), new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot)), new THREE.Vector3(1, 1, 1)))
  geo.rotateY(yaw)
  geo.translate(...origin)
  return geo
}

// ---------------------------------------------------------------- the dressing

const delhi1947: EraDressing = {
  id: 'delhi-1947',
  camera: { pos: [0, 0.98, 0.92], look: [0, -0.12, 0.06] },
  lightColor: pal.lamp,
  build({ scene, tier, rng }) {
    const s = TIER_SETTINGS[tier]
    const T = s.texSize
    const aniso = s.anisotropy
    const low = tier === 'low'
    const high = tier === 'high'
    const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
    const root = new THREE.Group()
    root.name = 'delhi-1947'
    const b = createBatch()

    // -------------------------------------------------------- materials, shared across props
    const wallMat = material(tier, { map: plasterTexture(pal.wall, { size: T, rng, anisotropy: aniso, repeat: [1, 1] }), bump: 0.3, shininess: 4, specular: 0x0a0a0a })
    const floorMat = material(tier, { map: stoneTexture(pal.floor, { size: T, rng, anisotropy: aniso, repeat: [1, 1] }), bump: 0.3, shininess: 14, specular: 0x101010 })
    const trimMat = material(tier, {
      map: woodTexture('teak', { size: Math.min(256, T), rng, anisotropy: aniso, repeat: [1, 1], tint: 0x7a5230 }),
      color: 0x9a7a62,
      shininess: 30,
      specular: 0x2a2018,
    })
    const baizeMat = material(tier, {
      map: clothTexture(0x2a4a35, { size: Math.min(256, T), rng, anisotropy: aniso, repeat: [7, 4] }),
      shininess: 2,
      specular: 0x050505,
    })
    const blackMat = material(tier, { color: 0x131211, shininess: 70, specular: 0x3c3a36 })
    const nickelMat = material(tier, { color: 0xb8b4aa, metal: true, shininess: 90, specular: 0x9a968c })
    const paperEdgeMat = material(tier, { color: 0xe0d5ba, shininess: 4 })

    // -------------------------------------------------------- room: walls with a window opening, floor
    const tile = 1.2
    const W2 = ROOM_W / 2
    const roomH = CEIL_Y - FLOOR_Y
    const backPiece = (x0: number, x1: number, y0: number, y1: number) =>
      b.add(wallPlane(x1 - x0, y1 - y0, x0, y0, tile), wallMat, [(x0 + x1) / 2, (y0 + y1) / 2, BACK_Z], [0, 0, 0], false, true)
    backPiece(-W2, W2, FLOOR_Y, WIN.y0)
    backPiece(-W2, WIN.x0, WIN.y0, CEIL_Y)
    backPiece(WIN.x1, W2, WIN.y0, CEIL_Y)
    backPiece(WIN.x0, WIN.x1, WIN.y1, CEIL_Y)
    // the inner reveal of a thick wall: two jambs and the head
    const wh = WIN.y1 - WIN.y0
    const wy = (WIN.y0 + WIN.y1) / 2
    b.add(wallPlane(WIN.reveal, wh, 0, WIN.y0, tile), wallMat, [WIN.x0, wy, BACK_Z - WIN.reveal / 2], [0, Math.PI / 2, 0], false, true)
    b.add(wallPlane(WIN.reveal, wh, 0, WIN.y0, tile), wallMat, [WIN.x1, wy, BACK_Z - WIN.reveal / 2], [0, -Math.PI / 2, 0], false, true)
    b.add(wallPlane(WIN.x1 - WIN.x0, WIN.reveal, WIN.x0, 0, tile), wallMat, [(WIN.x0 + WIN.x1) / 2, WIN.y1, BACK_Z - WIN.reveal / 2], [Math.PI / 2, 0, 0], false, true)
    const depth = FRONT_Z - BACK_Z
    b.add(wallPlane(depth, roomH, 0, FLOOR_Y, tile), wallMat, [-W2, FLOOR_Y + roomH / 2, BACK_Z + depth / 2], [0, Math.PI / 2, 0], false, true)
    b.add(wallPlane(depth, roomH, 0, FLOOR_Y, tile), wallMat, [W2, FLOOR_Y + roomH / 2, BACK_Z + depth / 2], [0, -Math.PI / 2, 0], false, true)
    b.add(wallPlane(ROOM_W, depth, -W2, 0, 1.6), floorMat, [0, FLOOR_Y, BACK_Z + depth / 2], [-Math.PI / 2, 0, 0], false, true)
    b.add(box(ROOM_W, 0.12, 0.018), trimMat, [0, FLOOR_Y + 0.06, BACK_Z + 0.009], [0, 0, 0], false, true)

    // -------------------------------------------------------- the window: teak casements, sill, night, rain
    const fw = 0.045 // outer frame
    const ww = WIN.x1 - WIN.x0
    const wcx = (WIN.x0 + WIN.x1) / 2
    const bar = (w: number, h: number, x: number, y: number, d = 0.034) => b.add(box(w, h, d), trimMat, [x, y, FRAME_Z], [0, 0, 0], false, true)
    bar(fw, wh, WIN.x0 + fw / 2, wy)
    bar(fw, wh, WIN.x1 - fw / 2, wy)
    bar(ww, fw, wcx, WIN.y1 - fw / 2)
    bar(ww, 0.055, wcx, WIN.y0 + 0.0275)
    bar(0.05, wh, wcx, wy, 0.04) // where the two casements meet
    const leaf = (ww - 2 * fw - 0.05) / 2
    for (const side of [-1, 1]) {
      const lx = wcx + side * (0.025 + leaf / 2)
      bar(0.018, wh, lx, wy, 0.026) // one glazing bar down each casement
    }
    for (let y = WIN.y0 + 0.055 + 0.29; y < WIN.y1 - 0.1; y += 0.29) bar(ww - 2 * fw, 0.02, wcx, y, 0.026)
    // a plastered sill in the thick wall, a teak nosing along its edge, and an apron under it
    b.add(wallPlane(ww, WIN.reveal, WIN.x0, 0, tile).rotateX(-Math.PI / 2), wallMat, [wcx, WIN.y0, BACK_Z - WIN.reveal / 2], [0, 0, 0], false, true)
    b.add(box(ww + 0.06, 0.022, 0.03), trimMat, [wcx, WIN.y0 - 0.009, BACK_Z + 0.013], [0, 0, 0], false, true)
    b.add(box(ww + 0.02, 0.03, 0.012), trimMat, [wcx, WIN.y0 - 0.035, BACK_Z + 0.006], [0, 0, 0], false, true)
    // the night, close behind the glass so it fills the opening from any camera
    const viewW = ww + 0.3
    const viewY0 = WIN.y0 - 0.2
    const viewY1 = WIN.y1 + 0.2
    const horizonY = 0.24
    const viewTex = nightTexture(low ? 128 : high ? 512 : 256, rng, (viewY1 - horizonY) / (viewY1 - viewY0))
    const viewMat = new THREE.MeshBasicMaterial({ map: viewTex, fog: false })
    const view = new THREE.Mesh(new THREE.PlaneGeometry(viewW, viewY1 - viewY0), viewMat)
    view.position.set(wcx, (viewY0 + viewY1) / 2, VIEW_Z)
    root.add(view)
    // rain on the glass: beads that stay and rivulets that run (one combined layer on low)
    const rainRepeat: [number, number] = [2, 4]
    const rainLayers: { tex: THREE.Texture; speed: number }[] = []
    const rainPlane = (tex: THREE.Texture, z: number, opacity: number) => {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(ww, wh),
        new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, opacity, fog: false }),
      )
      m.position.set(wcx, wy, z)
      root.add(m)
    }
    if (low) {
      const t = rainTexture(128, rng, { beads: 70, rivulets: 9, repeat: rainRepeat })
      rainPlane(t, GLASS_Z, 1)
      rainLayers.push({ tex: t, speed: 0.12 })
    } else {
      const beads = rainTexture(256, rng, { beads: 150, rivulets: 0, repeat: rainRepeat })
      rainPlane(beads, GLASS_Z, 0.9)
      const runs = rainTexture(256, rng, { beads: 12, rivulets: 11, repeat: rainRepeat })
      rainPlane(runs, GLASS_Z + 0.001, 1)
      rainLayers.push({ tex: runs, speed: 0.16 })
    }

    // -------------------------------------------------------- desk with a green baize top
    const desk = createDesk({ palette: pal, wood: 'walnut', tier, rng, legs: 'square', blotter: false })
    root.add(desk.group)
    // the baize lies a hair above the wood and below the low tier's stamp shadows (y 0.0008)
    b.add(new THREE.PlaneGeometry(DESK.w - 0.07, DESK.d - 0.07).rotateX(-Math.PI / 2), baizeMat, [0, 0.0005, 0], [0, 0, 0], false, true)
    // drawer pedestals under it, as on a government pedestal desk, with a modesty panel between
    const carcassMat = material(tier, {
      map: woodTexture('walnut', { size: Math.min(256, T), rng, anisotropy: aniso, repeat: [1, 1], planks: 4, joints: false }),
      color: 0xb9a796,
      shininess: 18,
      specular: 0x1a140f,
    })
    const drawerMat = material(tier, { map: drawerTexture(low ? 64 : 128, rng, aniso), shininess: 22, specular: 0x2a2018 })
    {
      const top = -0.0595 // under the desk's lip
      const ph = top - FLOOR_Y
      const pw = 0.33
      const z0 = -0.27
      const z1 = 0.273 // just proud of the desk's front legs
      for (const side of [-1, 1]) {
        const x = side * (DESK.w / 2 - 0.005 - pw / 2)
        b.add(box(pw, ph, z1 - z0), carcassMat, [x, FLOOR_Y + ph / 2, (z0 + z1) / 2], [0, 0, 0], false, true)
        b.add(new THREE.PlaneGeometry(pw, ph), drawerMat, [x, FLOOR_Y + ph / 2, z1 + 0.0008], [0, 0, 0], false, true)
      }
      const kw = DESK.w - 0.01 - 2 * pw
      b.add(box(kw, 0.42, 0.015), carcassMat, [0, top - 0.075 - 0.21, -0.22], [0, 0, 0], false, true)
    }
    // a striped cotton durrie on the stone, under the desk and the chair
    b.add(
      new THREE.PlaneGeometry(1.5, 1.1).rotateX(-Math.PI / 2),
      material(tier, { map: durrieTexture(low ? 128 : 256, rng, aniso), shininess: 2, specular: 0x040404 }),
      [0, FLOOR_Y + 0.003, 0.36],
      [0, 0.02, 0],
      false,
      true,
    )
    // a cane wastepaper basket in the kneehole, with drafts screwed up in it (not on low)
    if (!low) {
      const prof: [number, number][] = [[0, 0.006], [0.098, 0.006], [0.1, 0]]
      for (let k = 0; k <= 7; k++) prof.push([0.102 + (k / 7) * 0.02, 0.012 + (k / 7) * 0.27])
      prof.push([0.127, 0.288], [0.118, 0.292])
      const basket = lathe(prof, 18)
      b.add(basket, material(tier, { map: wickerTexture(128), side: THREE.DoubleSide, shininess: 6 }), [-0.02, FLOOR_Y, 0.1], [0, 0, 0], false, true)
      const ball = (r: number, pos: V3) => {
        const geo = new THREE.IcosahedronGeometry(r, 1)
        const p = geo.getAttribute('position') as THREE.BufferAttribute
        for (let i = 0; i < p.count; i++) {
          // jitter by position, so corners shared by several faces move together and the ball stays closed
          const h = Math.sin(p.getX(i) * 913.1 + p.getY(i) * 371.7 + p.getZ(i) * 529.3) * 43758.5
          const k = 0.72 + 0.4 * (h - Math.floor(h))
          p.setXYZ(i, p.getX(i) * k, p.getY(i) * k, p.getZ(i) * k)
        }
        geo.computeVertexNormals()
        b.add(geo, paperEdgeMat, pos, [rng() * 3, rng() * 3, 0], false, true)
      }
      ball(0.034, [-0.05, FLOOR_Y + 0.27, 0.085])
      ball(0.03, [0.015, FLOOR_Y + 0.275, 0.13])
      ball(0.028, [0.13, FLOOR_Y + 0.024, 0.2])
    }

    // -------------------------------------------------------- the brass desk lamp with a green shade
    const lampProfile: [number, number][] = [
      [0, 0], [0.058, 0], [0.06, 0.005], [0.056, 0.012], [0.04, 0.018], [0.02, 0.024], [0.012, 0.03],
      [0.011, 0.038], [0.0075, 0.042], [0.0075, 0.15], [0.011, 0.153], [0.011, 0.16], [0.014, 0.163],
      [0.014, 0.172], [0.009, 0.176], [0, 0.176],
    ]
    const lampBody = new THREE.Mesh(lathe(lampProfile, 18), new THREE.MeshBasicMaterial({ map: brassForProfile(lampProfile, 128) }))
    lampBody.position.set(SPOTS.lamp.x, 0, SPOTS.lamp.z)
    root.add(lampBody)
    const shadeProfile: [number, number][] = [
      [0.062, 0.172], [0.063, 0.176], [0.06, 0.19], [0.052, 0.215], [0.039, 0.237], [0.024, 0.25], [0.01, 0.256], [0, 0.257],
    ]
    const shade = new THREE.Mesh(
      lathe(shadeProfile, 24),
      material(tier, { color: 0x1c5a37, emissive: 0x0c2e19, shininess: 90, specular: 0x6f9a7a }),
    )
    shade.position.copy(lampBody.position)
    root.add(shade)
    const finialProfile: [number, number][] = [[0, 0.255], [0.007, 0.256], [0.0085, 0.264], [0.005, 0.272], [0, 0.274]]
    const finial = new THREE.Mesh(lathe(finialProfile, 10), new THREE.MeshBasicMaterial({ map: brassForProfile([[0, 0], [1, 1], [0, 2]], 32) }))
    finial.position.copy(lampBody.position)
    root.add(finial)
    const warm = createWarmLight({ tier, color: pal.lamp, position: BULB, intensity: 1.25, glow: 'bulb', flicker: 0.03 })
    root.add(warm.group)

    // -------------------------------------------------------- telephone: a candlestick set, receiver on its hook
    {
      const o: V3 = [-0.13, 0, -0.245]
      const yaw = 0.35
      b.add(local(lathe([[0, 0], [0.046, 0], [0.047, 0.006], [0.042, 0.016], [0.028, 0.026], [0.013, 0.034], [0.0095, 0.042], [0, 0.042]], 20), o, yaw, [0, 0, 0]), blackMat)
      b.add(local(new THREE.CylinderGeometry(0.0085, 0.0085, 0.2, 10), o, yaw, [0, 0.14, 0]), blackMat)
      b.add(local(new THREE.CylinderGeometry(0.011, 0.012, 0.03, 12), o, yaw, [0, 0.247, 0.008], [0.55, 0, 0]), blackMat)
      // the mouthpiece flares toward the speaker
      b.add(local(lathe([[0.011, 0], [0.013, 0.008], [0.02, 0.02], [0.024, 0.03], [0.021, 0.031], [0.009, 0.012], [0, 0.012]], 16), o, yaw, [0, 0.258, 0.022], [1.15, 0, 0]), blackMat)
      // the hook and the receiver hanging from it, earpiece up
      b.add(local(box(0.04, 0.006, 0.01), o, yaw, [0.022, 0.205, 0]), nickelMat)
      b.add(local(box(0.006, 0.02, 0.022), o, yaw, [0.042, 0.212, 0]), nickelMat)
      b.add(local(new THREE.CylinderGeometry(0.0095, 0.011, 0.085, 10), o, yaw, [0.05, 0.155, 0]), blackMat)
      b.add(local(lathe([[0.01, 0], [0.016, 0.006], [0.022, 0.018], [0.021, 0.022], [0, 0.022]], 14), o, yaw, [0.05, 0.196, 0]), blackMat)
      // the cord from the receiver to the base, then off the back of the desk
      const cord = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.05, 0.112, 0),
        new THREE.Vector3(0.062, 0.05, 0.012),
        new THREE.Vector3(0.04, 0.012, 0.03),
        new THREE.Vector3(-0.01, 0.006, 0.05),
        new THREE.Vector3(-0.05, 0.008, 0.02),
        new THREE.Vector3(-0.045, 0.01, -0.03),
      ])
      b.add(local(new THREE.TubeGeometry(cord, low ? 10 : 18, 0.0026, 5, false), o, yaw, [0, 0, 0]), blackMat)
      const cord2 = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.006, -0.03),
        new THREE.Vector3(0.02, 0.004, -0.06),
        new THREE.Vector3(0.03, 0.003, -0.085),
      ])
      b.add(local(new THREE.TubeGeometry(cord2, 6, 0.0026, 5, false), o, 0, [0, 0, 0]), blackMat)
    }

    // -------------------------------------------------------- wire tray of telegram forms
    const formMat = material(tier, { map: telegramTexture(low ? 128 : 256, rng, aniso), shininess: 4 })
    {
      const o: V3 = [0.035, 0, -0.215]
      const yaw = 0.04
      const TW = 0.17
      const TD = 0.15
      const TH = 0.05
      const wt = 0.0035
      for (const y of [0.004, TH]) {
        b.add(local(box(TW, wt, wt), o, yaw, [0, y, TD / 2]), nickelMat)
        b.add(local(box(TW, wt, wt), o, yaw, [0, y, -TD / 2]), nickelMat)
        b.add(local(box(wt, wt, TD), o, yaw, [TW / 2, y, 0]), nickelMat)
        b.add(local(box(wt, wt, TD), o, yaw, [-TW / 2, y, 0]), nickelMat)
      }
      const posts = low ? 4 : 8
      for (let i = 0; i <= posts; i++) {
        const x = -TW / 2 + (i / posts) * TW
        b.add(local(box(wt, TH, wt), o, yaw, [x, TH / 2, TD / 2]), nickelMat)
        b.add(local(box(wt, TH, wt), o, yaw, [x, TH / 2, -TD / 2]), nickelMat)
      }
      for (const x of [-TW / 2, TW / 2]) for (const z of [-TD / 4, TD / 4]) b.add(local(box(wt, TH, wt), o, yaw, [x, TH / 2, z]), nickelMat)
      for (let i = 1; i < 5; i++) b.add(local(box(TW, wt, wt), o, yaw, [0, 0.004, -TD / 2 + (i / 5) * TD]), nickelMat)
      // the stack, its top form, and one more dropped in askew
      b.add(local(box(0.15, 0.024, 0.13), o, yaw, [0, 0.018, 0]), paperEdgeMat)
      b.add(local(new THREE.PlaneGeometry(0.15, 0.13).rotateX(-Math.PI / 2), o, yaw, [0, 0.0305, 0]), formMat)
      if (!low) b.add(local(new THREE.PlaneGeometry(0.13, 0.155).rotateX(-Math.PI / 2), o, yaw, [0.006, 0.0315, 0.004], [0, -0.16, 0]), formMat)
    }

    // -------------------------------------------------------- a pad of flimsies and a fountain pen, front right
    {
      const o: V3 = [0.19, 0.0005, 0.235]
      const yaw = 0.22
      b.add(local(box(0.08, 0.007, 0.11), o, yaw, [0, 0.0035, 0]), paperEdgeMat)
      b.add(local(new THREE.CylinderGeometry(0.0055, 0.005, 0.1, 10).rotateX(Math.PI / 2), o, yaw, [0.004, 0.013, 0.004], [0, -0.55, 0]), blackMat)
      b.add(local(new THREE.CylinderGeometry(0.0058, 0.0058, 0.006, 10).rotateX(Math.PI / 2), o, yaw, [0.0197, 0.013, -0.0216], [0, -0.55, 0]), nickelMat) // the cap band
      b.add(local(new THREE.ConeGeometry(0.004, 0.016, 8).rotateX(Math.PI / 2), o, yaw, [-0.0263, 0.013, 0.0534], [0, -0.55, 0]), nickelMat) // the nib
    }

    // -------------------------------------------------------- typewriter: black enamel, round keys, a sheet in
    const keysMat = material(tier, { map: keysTexture(low ? 128 : 256, aniso), shininess: 40, specular: 0x2a2a2a })
    const cb = createBatch()
    let idleSheet: THREE.Mesh | null = null
    const sheetMat = material(tier, {
      map: paperTexture({ width: low ? 128 : 256, rng, tint: pal.paper, ink: pal.ink, style: 'typed', anisotropy: aniso }),
      shininess: 4,
    })
    {
      const o: V3 = [TYPEWRITER.x, 0.004, TYPEWRITER.z]
      const yaw = TYPEWRITER.yaw
      const tilt = 0.34
      b.add(local(box(0.25, 0.022, 0.21), o, yaw, [0, 0.011, 0]), blackMat)
      b.add(local(box(0.23, 0.014, 0.115), o, yaw, [0, 0.036, 0.046], [tilt, 0, 0]), blackMat)
      b.add(local(new THREE.PlaneGeometry(0.212, 0.104).rotateX(-Math.PI / 2 + tilt), o, yaw, [0, 0.0438, 0.047]), keysMat)
      b.add(local(box(0.15, 0.007, 0.012), o, yaw, [0, 0.03, 0.103]), nickelMat) // space bar
      b.add(local(box(0.25, 0.072, 0.095), o, yaw, [0, 0.058, -0.052]), blackMat) // the typebar housing
      b.add(local(new THREE.CylinderGeometry(0.048, 0.048, 0.25, 16, 1, false, 0, Math.PI).rotateZ(Math.PI / 2), o, yaw, [0, 0.094, -0.052]), blackMat)
      for (const x of [-0.118, 0.118]) b.add(local(box(0.014, 0.085, 0.17), o, yaw, [x, 0.05, -0.02]), blackMat)
      for (const x of [-0.075, 0.075]) b.add(local(new THREE.CylinderGeometry(0.026, 0.026, 0.006, 16), o, yaw, [x, 0.145, -0.052]), nickelMat)
      // the carriage: rail, platen, knobs, paper table, return lever. It is its own group, so the
      // stage can slide it along the machine while a telegram is typed (and ding it home).
      cb.add(local(box(0.31, 0.014, 0.04), o, yaw, [0, 0.142, -0.09]), nickelMat)
      cb.add(local(new THREE.CylinderGeometry(0.019, 0.019, 0.28, 16).rotateZ(Math.PI / 2), o, yaw, [0, 0.165, -0.09]), blackMat)
      for (const x of [-0.152, 0.152]) cb.add(local(new THREE.CylinderGeometry(0.021, 0.021, 0.016, 14).rotateZ(Math.PI / 2), o, yaw, [x, 0.165, -0.09]), blackMat)
      cb.add(local(box(0.24, 0.004, 0.08), o, yaw, [0, 0.19, -0.13], [0.75, 0, 0]), blackMat)
      cb.add(local(box(0.006, 0.006, 0.06), o, yaw, [-0.17, 0.182, -0.065], [0.35, 0.3, 0]), nickelMat)
      // the sheet, rising out of the platen and leaning back (hidden while a telegram is typed)
      idleSheet = new THREE.Mesh(local(new THREE.PlaneGeometry(0.19, 0.13), o, yaw, [0, 0.236, -0.115], [-0.42, 0, 0]), sheetMat)
      idleSheet.castShadow = true
      idleSheet.receiveShadow = true
      for (const [x, z] of [[-0.11, -0.09], [0.11, -0.09], [-0.11, 0.09], [0.11, 0.09]] as const) {
        b.add(local(new THREE.CylinderGeometry(0.01, 0.011, 0.006, 8), o, yaw, [x, -0.002, z]), blackMat)
      }
    }

    // -------------------------------------------------------- the Viceroy's countdown calendar
    const calTex = calendarTexture(low ? 256 : 512, rng, aniso)
    const calMat = material(tier, { map: calTex, shininess: 6, specular: 0x101010 })
    {
      const z = BACK_Z
      b.add(box(CAL.w, CAL.h, 0.008), trimMat, [CAL.x, CAL.y, z + 0.004], [0, 0, 0], true, true)
      const padW = PAD.w
      const padH = PAD.h
      const padY = PAD.y
      b.add(box(padW, padH, 0.012), paperEdgeMat, [CAL.x, padY, z + 0.014], [0, 0, 0], true, true)
      b.add(new THREE.PlaneGeometry(padW, padH), calMat, [CAL.x, padY, z + 0.0202], [0, 0, 0], false, true)
      // the nail it hangs from
      b.add(new THREE.CylinderGeometry(0.004, 0.004, 0.012, 8).rotateX(Math.PI / 2), nickelMat, [CAL.x, CAL.y + CAL.h / 2 - 0.016, z + 0.014], [0, 0, 0], false, false)
    }

    // -------------------------------------------------------- a wall clock above the calendar (seen in the intro)
    let second: THREE.Mesh | null = null
    {
      const cx = CAL.x
      const cy = 0.66
      const z = BACK_Z
      b.add(new THREE.CylinderGeometry(0.088, 0.088, 0.035, 28).rotateX(Math.PI / 2), trimMat, [cx, cy, z + 0.0175], [0, 0, 0], false, true)
      b.add(new THREE.CircleGeometry(0.074, 28), material(tier, { map: clockTexture(low ? 128 : 256), shininess: 20 }), [cx, cy, z + 0.0355], [0, 0, 0], false, true)
      // a quarter to midnight
      const hand = (len: number, w: number, angle: number) => {
        const g = box(w, len, 0.002)
        g.translate(0, len / 2 - 0.008, 0)
        g.rotateZ(-angle)
        return g
      }
      b.add(hand(0.045, 0.006, (11.75 / 12) * Math.PI * 2), blackMat, [cx, cy, z + 0.037], [0, 0, 0], false, false)
      b.add(hand(0.064, 0.004, (45 / 60) * Math.PI * 2), blackMat, [cx, cy, z + 0.039], [0, 0, 0], false, false)
      second = new THREE.Mesh(hand(0.066, 0.0018, 0), material(tier, { color: 0x8e1f18 }))
      second.position.set(cx, cy, z + 0.041)
      root.add(second)
    }

    // -------------------------------------------------------- the ceiling fan and the ceiling light above it
    const fanB = createBatch()
    {
      fanB.add(new THREE.CylinderGeometry(0.095, 0.082, 0.085, 18), blackMat)
      fanB.add(new THREE.CylinderGeometry(0.035, 0.055, 0.05, 12), blackMat, [0, 0.065, 0])
      const rod = CEIL_Y - FAN_HUB[1]
      fanB.add(new THREE.CylinderGeometry(0.012, 0.012, rod, 6), blackMat, [0, rod / 2, 0])
      fanB.add(new THREE.CylinderGeometry(0.06, 0.035, 0.05, 12), blackMat, [0, rod - 0.025, 0])
      for (let k = 0; k < 3; k++) {
        const yaw = (k / 3) * Math.PI * 2
        const blade = box(0.46, 0.005, 0.11).translate(0.36, -0.03, 0).rotateX(0.14)
        fanB.add(blade, blackMat, [0, 0, 0], [0, yaw, 0])
        fanB.add(box(0.11, 0.008, 0.026).translate(0.13, -0.03, 0), blackMat, [0, 0, 0], [0, yaw, 0])
      }
    }
    const fan = fanB.build()
    fan.name = 'ceiling-fan'
    fan.position.set(...FAN_HUB)
    fan.traverse((m) => {
      m.castShadow = high
      m.receiveShadow = false
    })
    root.add(fan)
    // the overhead bulb: on high a shadowed spot, so the blades sweep across the desk; else a plain point
    const ceilingGroup = new THREE.Group()
    let ceilingLight: THREE.SpotLight | THREE.PointLight
    if (high) {
      const sp = new THREE.SpotLight(CEILING_COLOR, CEILING_INTENSITY, 6, 0.55, 0.6, 2)
      sp.position.set(...CEILING_LAMP)
      sp.target.position.set(0, 0, -0.1)
      sp.castShadow = true
      sp.shadow.mapSize.set(512, 512)
      sp.shadow.radius = 2.5
      sp.shadow.bias = -0.0008
      sp.shadow.normalBias = 0.02
      sp.shadow.camera.near = 0.6
      sp.shadow.camera.far = 4
      ceilingGroup.add(sp, sp.target)
      ceilingLight = sp
    } else {
      const pt = new THREE.PointLight(CEILING_COLOR, CEILING_INTENSITY, 6, 2)
      pt.position.set(...CEILING_LAMP)
      ceilingGroup.add(pt)
      ceilingLight = pt
    }
    // let the stage dim the overhead light with the lamp in the caught beat
    let ceilDim = 1
    let ceilDimTarget = 1
    let lastT = 0
    const ceilingHandle: WarmLight = {
      group: ceilingGroup,
      position: ceilingLight.position,
      update() {},
      setDim(k, now = false) {
        ceilDimTarget = k
        if (now) {
          ceilDim = k
          ceilingLight.intensity = CEILING_INTENSITY * k
        }
      },
      dispose: () => disposeTree(ceilingGroup),
    }
    ceilingGroup.userData.warmLight = ceilingHandle

    // -------------------------------------------------------- the lamp's reflection in the night glass
    if (!low) {
      const glint = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: glowTexture(64), color: mix(pal.lamp, 0xffffff, 0.2), blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.28, fog: false }),
      )
      glint.scale.setScalar(0.12)
      glint.position.set(SPOTS.lamp.x + 0.05, 0.33, GLASS_Z + 0.002)
      root.add(glint)
    }

    // -------------------------------------------------------- low tier: soft contact shadows instead of shadow maps
    if (low) {
      const blobMat = new THREE.MeshBasicMaterial({ map: blobTexture(64), transparent: true, depthWrite: false, opacity: 0.8 })
      const blob = (x: number, z: number, w: number, d: number, yaw = 0) =>
        b.add(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2), blobMat, [x, 0.0009, z], [0, yaw, 0], false, false)
      blob(SPOTS.lamp.x, SPOTS.lamp.z, 0.17, 0.17)
      blob(-0.13, -0.245, 0.13, 0.13)
      blob(0.035, -0.215, 0.24, 0.21, 0.04)
      blob(TYPEWRITER.x, TYPEWRITER.z, 0.34, 0.3, TYPEWRITER.yaw)
    }

    const statics = b.build()
    root.add(statics)
    const carriage = cb.build()
    carriage.name = 'typewriter-carriage'
    if (idleSheet) carriage.add(idleSheet)
    root.add(carriage)
    // the ceiling light goes in after the lamp, so the stage's dust follows the lamp (the first warm light)
    root.add(ceilingGroup)
    scene.add(root)

    const fanRate = FAN_SPEED * (reduced ? 0.25 : 1)
    const rainRate = reduced ? 0.4 : 1
    let lastShadowAngle = Number.NEGATIVE_INFINITY
    return {
      update(tMs) {
        warm.update(tMs)
        const dt = Math.min(100, Math.max(0, tMs - lastT))
        lastT = tMs
        if (ceilDim !== ceilDimTarget) {
          ceilDim += (ceilDimTarget - ceilDim) * (1 - Math.exp(-dt / 220))
          if (Math.abs(ceilDim - ceilDimTarget) < 1e-3) ceilDim = ceilDimTarget
          ceilingLight.intensity = CEILING_INTENSITY * ceilDim
        }
        const sec = tMs / 1000
        const angle = -sec * fanRate
        fan.rotation.y = angle
        if (high && Math.abs(angle - lastShadowAngle) >= SHADOW_STEP) {
          lastShadowAngle = angle
          markShadowsDirty(scene)
        }
        for (const r of rainLayers) r.tex.offset.y = (sec * r.speed * rainRate) % 1
        if (second) second.rotation.z = -(Math.floor(sec) % 60) * ((Math.PI * 2) / 60)
      },
      dispose() {
        scene.remove(root)
        disposeTree(root)
      },
      hooks: {
        // the day title glows on the rain-streaked window; the countdown calendar flips beside it
        title: { pos: [(WIN.x0 + WIN.x1) / 2, 0.6, FRAME_Z + 0.03], w: 0.5, tone: 'glass' },
        titleFrame: [
          [CAL.x - CAL.w / 2, CAL.y - CAL.h / 2, BACK_Z],
          [CAL.x + CAL.w / 2, CAL.y + CAL.h / 2, BACK_Z],
        ],
        wideFrame: [
          [WIN.x0 + 0.05, 0.78, BACK_Z],
          [CAL.x + CAL.w / 2 + 0.04, 0.78, BACK_Z],
        ],
        calendar: {
          pos: [CAL.x, PAD.y, BACK_Z + 0.0202],
          w: PAD.w,
          h: PAD.h,
          firstDay: CALENDAR_DAYS,
          draw: (g, w, h, days) => drawCalendarPage(g, w, h, days, mulberry32(days + 7)),
        },
        typewriter: {
          origin: [TYPEWRITER.x, 0.004, TYPEWRITER.z],
          yaw: TYPEWRITER.yaw,
          platen: [0, 0.178, -0.088],
          lean: 0.42,
          idleSheet: idleSheet ?? undefined,
          carriage,
        },
      },
    }
  },
}

export default delhi1947
