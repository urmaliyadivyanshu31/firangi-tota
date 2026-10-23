// The 2D fallback: a still drawing of the era's desk for devices without WebGL2 or after the
// context is lost, with the message drawn big on its paper by the same drawer as the 3D sheet.
// No three.js here, so the app can show it without loading the 3D chunk.
import type { EraId } from '../content/types'
import { ERA_PALETTES, WOODS, css, mix, type Palette } from './palette'
import { TITLE_TONE, drawDayTitle, drawSheet, loadSheetFonts, measureSheet } from './sheet'
import type { DayTitle, FlashKind, SheetSpec, SheetStamp, StampKind } from './types'

export interface Fallback {
  setEra(id: EraId): void
  /** Draws the message on the paper, big enough to read; resolves once fonts are in. */
  showMessage(s: SheetSpec): Promise<void>
  /** Language or pencil change: the same sheet, redrawn. */
  redrawMessage(s: SheetSpec): void
  /** A short saffron glow (right) or red ink from the edges (wrong). */
  flash(kind: FlashKind): void
  /** The day's title over the wall, about 1.6 s. */
  dayTitle(t: DayTitle): Promise<void>
  /** The stamp's imprint on the paper. */
  stamp(kind: StampKind): Promise<void>
  dispose(): void
}

const insetPx = (el: Element, name: string, fallback: number): number => {
  try {
    const n = parseFloat(getComputedStyle(el).getPropertyValue(name))
    return Number.isFinite(n) ? n : fallback
  } catch {
    return fallback
  }
}

const DEVANAGARI = /[ऀ-ॿ]/

export function mountFallback(el: HTMLElement, era: EraId): Fallback {
  const canvas = document.createElement('canvas')
  canvas.style.cssText = 'display:block;width:100%;height:100%'
  canvas.setAttribute('aria-hidden', 'true')
  el.appendChild(canvas)
  let g: CanvasRenderingContext2D | null = null
  try {
    g = canvas.getContext('2d', { alpha: false })
  } catch {
    g = null
  }
  let current = era
  let sheet: SheetSpec | null = null
  let stamp: SheetStamp | null = null
  let title: DayTitle | null = null
  let flashK: { kind: FlashKind; t0: number } | null = null
  let raf = 0
  let disposed = false
  // the composed still (desk, title, paper), kept so a flash only repaints an overlay on top
  let base: HTMLCanvasElement | null = null
  let W = 390
  let H = 844
  let dpr = 1
  const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

  const compose = () => {
    if (!g) return
    W = Math.max(1, el.clientWidth || window.innerWidth || 390)
    H = Math.max(1, el.clientHeight || window.innerHeight || 844)
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    const pw = Math.round(W * dpr)
    const ph = Math.round(H * dpr)
    if (canvas.width !== pw || canvas.height !== ph) {
      canvas.width = pw
      canvas.height = ph
    }
    g.setTransform(dpr, 0, 0, dpr, 0, 0)
    drawDesk(g, W, H, ERA_PALETTES[current])
    if (title) drawTitleOver(g, W, H, title, current)
    if (sheet) drawPaper(g, W, H, sheet, stamp, el)
    if (flashK) {
      // keep the still for the flash frames (one canvas, resized only with the screen)
      base ??= document.createElement('canvas')
      if (base.width !== pw || base.height !== ph) {
        base.width = pw
        base.height = ph
      }
      base.getContext('2d')?.drawImage(canvas, 0, 0)
    }
  }

  const frame = (now: number) => {
    raf = 0
    if (!g || disposed || !flashK) return
    const t = (now - flashK.t0) / (flashK.kind === 'right' ? 1000 : 1300)
    g.setTransform(1, 0, 0, 1, 0, 0)
    if (base) g.drawImage(base, 0, 0)
    g.setTransform(dpr, 0, 0, dpr, 0, 0)
    if (t >= 1) {
      flashK = null
      return
    }
    drawFlash(g, W, H, flashK.kind, t)
    raf = requestAnimationFrame(frame)
  }

  let timer = 0
  const onResize = () => {
    window.clearTimeout(timer)
    timer = window.setTimeout(compose, 100)
  }
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(onResize) : null
  ro?.observe(el)
  window.addEventListener('resize', onResize)
  compose()

  const fonts = (lang: SheetSpec['lang']) =>
    loadSheetFonts(lang, 2000).then((ok) => {
      // a slow network: draw now, and again when the faces arrive
      if (!ok) void loadSheetFonts(lang, 0).then(() => !disposed && compose())
    })

  return {
    setEra(id) {
      current = id
      sheet = null
      stamp = null
      title = null
      compose()
    },
    async showMessage(s) {
      await fonts(s.lang)
      if (disposed) return
      title = null
      sheet = s
      stamp = null
      compose()
    },
    redrawMessage(s) {
      sheet = s
      if (stamp && g) stamp = { ...stamp, at: measureSheet(g, s).stampAt }
      compose()
    },
    flash(kind) {
      if (!g || disposed || reduced || typeof requestAnimationFrame !== 'function') return
      flashK = { kind, t0: typeof performance !== 'undefined' ? performance.now() : Date.now() }
      compose()
      if (!raf) raf = requestAnimationFrame(frame)
    },
    async dayTitle(t) {
      await loadSheetFonts(DEVANAGARI.test(t.big + t.small) ? 'hi' : 'en', 1500)
      if (disposed) return
      sheet = null
      stamp = null
      title = t
      compose()
      await new Promise<void>((r) => setTimeout(r, reduced ? 900 : 1600))
    },
    async stamp(kind) {
      if (!sheet || !g) return
      stamp = { kind, at: measureSheet(g, sheet).stampAt, rot: kind === 'asli' ? -0.18 : 0.14 }
      compose()
    },
    dispose() {
      disposed = true
      window.clearTimeout(timer)
      if (raf) cancelAnimationFrame(raf)
      ro?.disconnect()
      window.removeEventListener('resize', onResize)
      canvas.remove()
      base = null
    },
  }
}

/** The message's paper, as big as the screen allows between the HUD bars, turned a hair. */
function drawPaper(g: CanvasRenderingContext2D, W: number, H: number, s: SheetSpec, stamp: SheetStamp | null, el: Element): void {
  // the app's layout (as in shots.ts): wide screens pin the case file in the left 366 px
  const wide = W >= 900 && W > H
  const top = insetPx(el, '--ft-hud-top', wide ? 96 : 90)
  const bottom = insetPx(el, '--ft-hud-bottom', wide ? 128 : 150)
  const left = insetPx(el, '--ft-hud-left', wide ? 366 : 0)
  const right = insetPx(el, '--ft-hud-right', 0)
  const aspect = measureSheet(g, s).aspect
  const freeW = W - left - right
  const freeH = H - top - bottom
  let pw = freeW * 0.92
  let ph = pw * aspect
  if (ph > freeH * 0.94) {
    ph = freeH * 0.94
    pw = ph / aspect
  }
  g.save()
  g.translate(left + freeW / 2, top + freeH / 2)
  g.rotate(-0.012)
  g.translate(-pw / 2, -ph / 2)
  g.shadowColor = 'rgba(0,0,0,0.5)'
  g.shadowBlur = 18
  g.shadowOffsetY = 6
  g.fillStyle = '#e8dcc0'
  g.fillRect(0, 0, pw, ph)
  g.shadowColor = 'rgba(0,0,0,0)'
  g.shadowBlur = 0
  g.shadowOffsetY = 0
  drawSheet(g, pw, ph, s, stamp ?? undefined)
  g.restore()
}

function drawTitleOver(g: CanvasRenderingContext2D, W: number, H: number, t: DayTitle, era: EraId): void {
  const portrait = H > W
  const w = Math.min(W * (portrait ? 0.86 : 0.5), 640)
  g.save()
  g.translate((W - w) / 2, H * (portrait ? 0.14 : 0.1))
  drawDayTitle(g, w, w / 2, t, TITLE_TONE[era], false)
  g.restore()
}

function drawFlash(g: CanvasRenderingContext2D, W: number, H: number, kind: FlashKind, t: number): void {
  const R = Math.hypot(W, H) / 2
  g.save()
  if (kind === 'right') {
    const a = t < 0.12 ? t / 0.12 : 1 - (t - 0.12) / 0.88
    g.globalCompositeOperation = 'lighter'
    const grd = g.createRadialGradient(W / 2, H / 2, R * 0.1, W / 2, H / 2, R)
    grd.addColorStop(0, `rgba(242,162,58,${(0.18 * a).toFixed(3)})`)
    grd.addColorStop(1, `rgba(242,162,58,${(0.42 * a).toFixed(3)})`)
    g.fillStyle = grd
  } else {
    const spread = Math.min(1, t / 0.45)
    const a = t < 0.6 ? 1 : 1 - (t - 0.6) / 0.4
    const inner = R * (1 - 0.62 * (1 - Math.pow(1 - spread, 3)))
    const grd = g.createRadialGradient(W / 2, H / 2, Math.max(0, inner - R * 0.08), W / 2, H / 2, inner + R * 0.02)
    grd.addColorStop(0, 'rgba(163,23,14,0)')
    grd.addColorStop(0.7, `rgba(140,18,10,${(0.62 * a).toFixed(3)})`)
    grd.addColorStop(1, `rgba(163,23,14,${(0.5 * a).toFixed(3)})`)
    g.fillStyle = grd
  }
  g.fillRect(0, 0, W, H)
  g.restore()
}

/** Desk, lamp glow and a sheet of paper, framed like the 3D desk shot. */
function drawDesk(g: CanvasRenderingContext2D, W: number, H: number, p: Palette): void {
  const portrait = H > W
  const wood = WOODS[p.wood]
  const back = H * (portrait ? 0.36 : 0.42) // far edge of the desk
  const front = H * (portrait ? 0.6 : 0.78) // near edge
  const inset = W * (portrait ? 0.1 : 0.2)
  const lampX = W * (portrait ? 0.24 : 0.3)
  const lampY = back + (front - back) * 0.12

  // wall, falling into shade toward the top
  const wall = g.createLinearGradient(0, 0, 0, back)
  wall.addColorStop(0, css(mix(p.wall, p.shade, 0.82)))
  wall.addColorStop(1, css(mix(p.wall, p.shade, 0.5)))
  g.fillStyle = wall
  g.fillRect(0, 0, W, back)

  // floor and the space under the desk
  const floor = g.createLinearGradient(0, back, 0, H)
  floor.addColorStop(0, css(mix(p.floor, p.shade, 0.55)))
  floor.addColorStop(1, css(p.shade))
  g.fillStyle = floor
  g.fillRect(0, back, W, H - back)

  // lamp glow on the wall
  const R = Math.max(W, H) * 0.6
  const glow = g.createRadialGradient(lampX, lampY - H * 0.04, 0, lampX, lampY - H * 0.04, R)
  glow.addColorStop(0, css(p.lamp, 0.5))
  glow.addColorStop(0.35, css(p.lamp, 0.16))
  glow.addColorStop(1, css(p.lamp, 0))
  g.fillStyle = glow
  g.fillRect(0, 0, W, H)

  // legs, then the desk top as a trapezoid and its front edge
  g.fillStyle = css(mix(wood.dark, p.shade, 0.55))
  const legW = W * 0.035
  g.fillRect(inset * 0.2 + W * 0.02, front, legW, H - front)
  g.fillRect(W - inset * 0.2 - W * 0.02 - legW, front, legW, H - front)
  const top = g.createLinearGradient(0, back, 0, front)
  top.addColorStop(0, css(mix(wood.light, wood.dark, 0.35)))
  top.addColorStop(1, css(mix(wood.light, wood.dark, 0.7)))
  g.fillStyle = top
  g.beginPath()
  g.moveTo(inset, back)
  g.lineTo(W - inset, back)
  g.lineTo(W + inset * 0.15, front)
  g.lineTo(-inset * 0.15, front)
  g.closePath()
  g.fill()
  // a few grain lines along the desk
  g.strokeStyle = css(wood.dark, 0.18)
  g.lineWidth = 1
  for (let i = 1; i < 7; i++) {
    const y = back + ((front - back) * i) / 7
    g.beginPath()
    g.moveTo(0, y)
    g.bezierCurveTo(W * 0.3, y - 3, W * 0.6, y + 4, W, y - 1)
    g.stroke()
  }
  g.fillStyle = css(mix(wood.dark, p.shade, 0.3))
  g.fillRect(-1, front, W + 2, H * 0.03)

  // the lamp's pool of light on the desk
  const pool = g.createRadialGradient(lampX, lampY, 0, lampX, lampY, W * 0.75)
  pool.addColorStop(0, css(p.lamp, 0.42))
  pool.addColorStop(1, css(p.lamp, 0))
  g.fillStyle = pool
  g.beginPath()
  g.moveTo(inset, back)
  g.lineTo(W - inset, back)
  g.lineTo(W + inset * 0.15, front)
  g.lineTo(-inset * 0.15, front)
  g.closePath()
  g.fill()

  // the sheet, slightly turned, with a soft shadow and faint lines
  const cx = W * 0.5
  const cy = back + (front - back) * 0.55
  const pw = Math.min(W * (portrait ? 0.34 : 0.2), 220)
  const ph = (front - back) * 0.66
  g.save()
  g.translate(cx, cy)
  g.rotate(0.05)
  g.shadowColor = 'rgba(0,0,0,0.35)'
  g.shadowBlur = 12
  g.shadowOffsetY = 4
  g.fillStyle = css(p.paper)
  g.beginPath()
  g.moveTo(-pw * 0.42, -ph / 2)
  g.lineTo(pw * 0.42, -ph / 2)
  g.lineTo(pw / 2, ph / 2)
  g.lineTo(-pw / 2, ph / 2)
  g.closePath()
  g.fill()
  g.shadowColor = 'rgba(0,0,0,0)'
  g.shadowBlur = 0
  g.shadowOffsetY = 0
  g.strokeStyle = css(p.ink, 0.22)
  g.lineWidth = Math.max(1, pw / 110)
  for (let i = 0; i < 7; i++) {
    const t = 0.14 + i * 0.075
    const y = -ph / 2 + ph * t
    const half = pw * (0.42 + 0.08 * t) - pw * 0.1
    g.beginPath()
    g.moveTo(-half, y)
    g.lineTo(half - (i % 3) * pw * 0.08, y)
    g.stroke()
  }
  g.restore()

  // the lamp: a small base and its flame or bulb
  g.fillStyle = css(mix(p.metal, p.shade, 0.35))
  g.beginPath()
  g.ellipse(lampX, lampY, W * 0.045, W * 0.012, 0, 0, Math.PI * 2)
  g.fill()
  g.fillRect(lampX - W * 0.007, lampY - H * 0.07, W * 0.014, H * 0.07)
  g.beginPath()
  g.ellipse(lampX, lampY - H * 0.07, W * 0.03, W * 0.01, 0, 0, Math.PI * 2)
  g.fill()
  const fy = lampY - H * 0.085
  const halo = g.createRadialGradient(lampX, fy, 0, lampX, fy, W * 0.12)
  halo.addColorStop(0, css(mix(p.lamp, 0xffffff, 0.6), 0.95))
  halo.addColorStop(0.25, css(p.lamp, 0.45))
  halo.addColorStop(1, css(p.lamp, 0))
  g.fillStyle = halo
  g.fillRect(lampX - W * 0.12, fy - W * 0.12, W * 0.24, W * 0.24)
  g.fillStyle = css(mix(p.lamp, 0xffffff, 0.55))
  g.beginPath()
  g.ellipse(lampX, fy, W * 0.007, W * 0.016, 0, 0, Math.PI * 2)
  g.fill()

  // vignette
  const v = g.createRadialGradient(W / 2, H * 0.45, Math.min(W, H) * 0.3, W / 2, H * 0.45, Math.max(W, H) * 0.75)
  v.addColorStop(0, css(p.shade, 0))
  v.addColorStop(1, css(p.shade, 0.7))
  g.fillStyle = v
  g.fillRect(0, 0, W, H)
}
