// The 2D fallback: a still drawing of the era's desk for devices without WebGL2 or after the
// context is lost, with the message drawn big on its paper by the same drawer as the 3D sheet.
// No three.js here, so the app can show it without loading the 3D chunk.
import type { EraId } from '../content/types'
import { ERA_PALETTES, WOODS, css, mix, type Palette } from './palette'
import { MARK_COLORS, TITLE_TONE, drawDayTitle, drawRevealMarks, drawSheet, drawSheetBack, highlightRects, loadSheetFonts, measureSheet, stampBox, type PageRect } from './sheet'
import type { DayTitle, FlashKind, RevealSpec, ScreenRect, SheetSpec, SheetStamp, StageCueName, StampKind } from './types'

/** The toss, in ms, as on the 3D stage: lift, the arc, the settle and a held breath; or a fade. */
const TOSS = { lift: 260, fly: 740, settle: 140, hold: 380, fade: 320 } as const

export interface FallbackOptions {
  /** The flat desk names its toss beats (the paper leaves, it lands) for the sound. */
  onCue?: (name: StageCueName) => void
}

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
  /**
   * The verdict on the same paper: the pencil marks and note, then its back (see Stage.reveal).
   * Waits for a showMessage still loading its fonts, so the two can be called back to back.
   */
  reveal(r: RevealSpec): Promise<void>
  /** Finishes a reveal in progress (or one just asked for): its back shows at once. */
  skip(): void
  getSourceRect(): ScreenRect | null
  getPaperRect(): ScreenRect | null
  /** The read paper arcs into the basket drawn on the floor (or fades, under reduced motion). */
  toss(): Promise<void>
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

export function mountFallback(el: HTMLElement, era: EraId, opts: FallbackOptions = {}): Fallback {
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
  // the verdict: marks over the front, then the back in its place
  let verdict: { r: RevealSpec; side: 'front' | 'back' } | null = null
  let paperBox: { x: number; y: number; w: number; h: number } | null = null
  let sourceRect: PageRect | null = null
  let title: DayTitle | null = null
  let flashK: { kind: FlashKind; t0: number } | null = null
  let raf = 0
  let disposed = false
  // the last showMessage, which a reveal waits for; skip() lands the reveal on its back at once
  let shown: Promise<void> = Promise.resolve()
  let skipReveal = false
  let finishWait: (() => void) | null = null
  // the composed still (desk, title, paper), kept so a flash only repaints an overlay on top
  let base: HTMLCanvasElement | null = null
  let W = 390
  let H = 844
  let dpr = 1
  const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
  // the toss: the card in flight (drawn from its own picture over the still), and the papers
  // already in the basket
  let tossing: { t0: number; from: PaperBox; sprite: HTMLCanvasElement | null; landed: boolean; finish: () => void } | null = null
  let tossRaf = 0
  let binned = 0
  const cue = (name: StageCueName) => {
    try {
      opts.onCue?.(name)
    } catch {
      /* a listener's error never breaks the desk */
    }
  }
  const clock = () => (typeof performance !== 'undefined' ? performance.now() : Date.now())

  /** What the verdict draws over (or instead of) the paper's front: the marks, or the back. */
  const face = (c: CanvasRenderingContext2D, pw: number, ph: number) => {
    const v = verdict
    if (!v || !sheet) return
    if (v.side === 'back') {
      sourceRect = drawSheetBack(c, pw, ph, sheet, v.r, { stamp: true }).source
      return
    }
    const marks = highlightRects(c, sheet, v.r.highlight, ph / pw)
    const m = measureSheet(c, sheet, ph / pw)
    c.save()
    const at = stamp?.at ?? m.stampAt
    drawRevealMarks(c, pw, ph, marks, { color: v.r.real ? MARK_COLORS.verified : MARK_COLORS.slip, note: v.r.note, lang: v.r.lang, body: m.body, bodyEnd: m.bodyEnd, progress: 1, keep: true, avoid: [stampBox(at[0], at[1], ph / pw)] })
    c.restore()
  }

  /** The paper as it lies now, drawn on its own canvas, to fly it over the still. */
  const cardPicture = (box: PaperBox): HTMLCanvasElement | null => {
    if (!sheet) return null
    try {
      const c = document.createElement('canvas')
      c.width = Math.max(1, Math.round(box.w * dpr))
      c.height = Math.max(1, Math.round(box.h * dpr))
      const cg = c.getContext('2d')
      if (!cg) return null
      cg.scale(dpr, dpr)
      paintCard(cg, box.w, box.h, sheet, stamp, face)
      return c
    } catch {
      return null
    }
  }

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
    drawDesk(g, W, H, ERA_PALETTES[current], binned)
    if (title) drawTitleOver(g, W, H, title, current)
    if (sheet) paperBox = drawPaper(g, W, H, sheet, stamp, el, face)
    if (flashK || tossing) {
      // keep the still for the flash and toss frames (one canvas, resized only with the screen)
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

  /** One frame of the toss: the still, the card on its way, the basket's front over it as it goes in. */
  const tossFrame = (now: number) => {
    tossRaf = 0
    const t = tossing
    if (!g || disposed || !t) return
    const e = now - t.t0
    g.setTransform(1, 0, 0, 1, 0, 0)
    if (base) g.drawImage(base, 0, 0)
    g.setTransform(dpr, 0, 0, dpr, 0, 0)
    const lands = reduced ? TOSS.fade : TOSS.lift + TOSS.fly
    if (!t.landed && e >= lands) {
      t.landed = true
      binned++
      cue('tossLand')
      compose() // the still now has this paper standing in the basket
    }
    if (!t.landed && t.sprite) drawFlight(g, W, H, t.from, t.sprite, e, reduced, ERA_PALETTES[current])
    if (e >= (reduced ? TOSS.fade : lands + TOSS.settle + TOSS.hold)) return t.finish()
    tossRaf = requestAnimationFrame(tossFrame)
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
      tossing?.finish()
      current = id
      sheet = null
      stamp = null
      title = null
      verdict = null
      binned = 0
      compose()
    },
    toss() {
      tossing?.finish()
      const box = paperBox
      if (!g || disposed || !sheet || !box) return Promise.resolve()
      const sprite = cardPicture(box)
      // the desk under the card: it leaves the still and flies over it
      sheet = null
      stamp = null
      verdict = null
      sourceRect = null
      cue('toss')
      return new Promise<void>((resolve) => {
        const t = {
          t0: clock(),
          from: box,
          sprite,
          landed: false,
          finish: () => {
            if (tossing !== t) return
            tossing = null
            if (tossRaf) cancelAnimationFrame(tossRaf)
            tossRaf = 0
            if (!t.landed) {
              t.landed = true
              binned++
              if (!disposed) cue('tossLand')
            }
            if (!disposed) compose()
            resolve()
          },
        }
        tossing = t
        compose()
        if (typeof requestAnimationFrame !== 'function') t.finish()
        else tossRaf = requestAnimationFrame(tossFrame)
      })
    },
    showMessage(s) {
      const job = (async () => {
        await fonts(s.lang)
        if (disposed) return
        title = null
        sheet = s
        stamp = null
        verdict = null
        compose()
      })()
      shown = job
      return job
    },
    async reveal(r) {
      skipReveal = false
      await shown
      if (!sheet) return
      await fonts(r.lang)
      if (disposed || !sheet) return
      const again = verdict !== null
      sheet = { ...sheet, documentMark: r.documentMark, revealed: true }
      verdict = { r, side: again || reduced || skipReveal ? 'back' : 'front' }
      compose()
      if (verdict.side === 'back') return
      await new Promise<void>((done) => {
        const timer = setTimeout(done, 1500)
        finishWait = () => {
          clearTimeout(timer)
          done()
        }
      })
      finishWait = null
      if (disposed || !verdict || verdict.r !== r) return
      verdict = { r, side: 'back' }
      compose()
    },
    skip() {
      skipReveal = true
      finishWait?.()
      tossing?.finish()
    },
    getSourceRect() {
      const b = paperBox
      const s = sourceRect
      if (!b || !s || verdict?.side !== 'back') return null
      return { x: b.x + s.u0 * b.w, y: b.y + s.v0 * b.h, w: (s.u1 - s.u0) * b.w, h: (s.v1 - s.v0) * b.h }
    },
    getPaperRect() {
      return sheet && paperBox ? { ...paperBox } : null
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
      tossing?.finish()
      window.clearTimeout(timer)
      if (raf) cancelAnimationFrame(raf)
      ro?.disconnect()
      window.removeEventListener('resize', onResize)
      canvas.remove()
      base = null
    },
  }
}

/**
 * The message's paper, as big as the screen allows between the HUD bars, turned a hair. `face`
 * draws over (or instead of) the front: the verdict's marks, or the back. Returns its box.
 */
function drawPaper(
  g: CanvasRenderingContext2D,
  W: number,
  H: number,
  s: SheetSpec,
  stamp: SheetStamp | null,
  el: Element,
  face?: (g: CanvasRenderingContext2D, pw: number, ph: number) => void,
): { x: number; y: number; w: number; h: number } {
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
  paintCard(g, pw, ph, s, stamp, face)
  g.restore()
  // (the turn is a hair; for hit boxes the upright box is close enough)
  return { x: left + freeW / 2 - pw / 2, y: top + freeH / 2 - ph / 2, w: pw, h: ph }
}

type PaperBox = { x: number; y: number; w: number; h: number }

/** The paper itself at the origin: its ground, the message, and the verdict's face over it. */
function paintCard(
  g: CanvasRenderingContext2D,
  pw: number,
  ph: number,
  s: SheetSpec,
  stamp: SheetStamp | null,
  face?: (g: CanvasRenderingContext2D, pw: number, ph: number) => void,
): void {
  g.fillStyle = '#e8dcc0'
  g.fillRect(0, 0, pw, ph)
  drawSheet(g, pw, ph, s, stamp ?? undefined)
  face?.(g, pw, ph)
}

/** Where the basket stands on the floor: front right, clear of the paper and the lamp. */
function basketSpot(W: number, H: number): { x: number; y: number; r: number } {
  const portrait = H > W
  return portrait ? { x: W * 0.8, y: H * 0.87, r: Math.min(W * 0.1, 46) } : { x: W * 0.88, y: H * 0.8, r: Math.min(H * 0.075, 56) }
}

/**
 * A cane wastepaper basket seen from the front and a little above: the dark inside of its mouth,
 * the read papers standing in it, the woven body, the rim. `front` draws only the body and rim,
 * over a card that is dropping in.
 */
function drawBasket(g: CanvasRenderingContext2D, b: { x: number; y: number; r: number }, p: Palette, papers: number, front = false): void {
  const rx = b.r
  const ry = b.r * 0.3
  const tall = b.r * 1.25
  const foot = b.r * 0.76
  const cane = mix(0xb08850, WOODS[p.wood].light, 0.35)
  g.save()
  if (!front) {
    // its shadow on the floor, and the dark inside of the mouth
    g.fillStyle = 'rgba(0,0,0,0.35)'
    g.beginPath()
    g.ellipse(b.x + rx * 0.12, b.y + tall, foot * 1.35, ry * 0.9, 0, 0, Math.PI * 2)
    g.fill()
    g.fillStyle = css(mix(cane, p.shade, 0.72))
    g.beginPath()
    g.ellipse(b.x, b.y, rx, ry, 0, 0, Math.PI * 2)
    g.fill()
    // the read papers, standing in it, their tops over the rim
    const n = Math.min(papers, 6)
    for (let i = 0; i < n; i++) {
      const off = ((i * 0.618) % 1) - 0.5
      g.save()
      g.translate(b.x + off * rx * 0.9, b.y + ry * 0.4)
      g.rotate(off * 0.7)
      g.fillStyle = css(mix(p.paper, 0xffffff, 0.04 + (i % 2) * 0.05))
      g.strokeStyle = css(p.ink, 0.25)
      g.lineWidth = 1
      g.beginPath()
      g.rect(-rx * 0.34, -ry * (1.6 + (i % 3) * 0.35), rx * 0.68, ry * 2.4)
      g.fill()
      g.stroke()
      g.restore()
    }
  }
  // the woven body, narrowing to its foot
  g.beginPath()
  g.moveTo(b.x - rx, b.y)
  g.lineTo(b.x - foot, b.y + tall)
  g.ellipse(b.x, b.y + tall, foot, ry * 0.8, 0, Math.PI, 0, true)
  g.lineTo(b.x + rx, b.y)
  g.ellipse(b.x, b.y, rx, ry, 0, 0, Math.PI, false)
  g.closePath()
  const body = g.createLinearGradient(b.x - rx, 0, b.x + rx, 0)
  body.addColorStop(0, css(mix(cane, p.shade, 0.15)))
  body.addColorStop(0.45, css(mix(cane, p.lamp, 0.12)))
  body.addColorStop(1, css(mix(cane, p.shade, 0.55)))
  g.fillStyle = body
  g.fill()
  g.clip()
  // the weave: rows round the body and stakes down it
  g.strokeStyle = css(mix(cane, p.shade, 0.6), 0.6)
  g.lineWidth = Math.max(1, rx / 26)
  for (let i = 1; i < 8; i++) {
    const k = i / 8
    g.beginPath()
    g.ellipse(b.x, b.y + tall * k, rx + (foot - rx) * k, ry * (1 - 0.2 * k), 0, 0, Math.PI)
    g.stroke()
  }
  for (let i = -5; i <= 5; i++) {
    const k = i / 5.5
    g.beginPath()
    g.moveTo(b.x + rx * k, b.y + ry * Math.sqrt(1 - k * k))
    g.lineTo(b.x + foot * k, b.y + tall + ry * 0.8 * Math.sqrt(1 - k * k))
    g.stroke()
  }
  g.restore()
  // the rim, a thick cane hoop
  g.save()
  g.strokeStyle = css(mix(cane, p.lamp, 0.25))
  g.lineWidth = Math.max(2, rx / 9)
  g.beginPath()
  g.ellipse(b.x, b.y, rx, ry, 0, 0, front ? Math.PI : Math.PI * 2)
  g.stroke()
  g.restore()
}

/** The card on its way: it lifts, arcs over and drops into the basket, turning once; or it fades. */
function drawFlight(g: CanvasRenderingContext2D, W: number, H: number, from: PaperBox, card: HTMLCanvasElement, e: number, reduced: boolean, p: Palette): void {
  const b = basketSpot(W, H)
  const fx = from.x + from.w / 2
  const fy = from.y + from.h / 2
  let x = fx
  let y = fy
  let s = 1
  let rot = -0.012
  let alpha = 1
  if (reduced) {
    alpha = Math.max(0, 1 - e / TOSS.fade)
  } else if (e < TOSS.lift) {
    const k = 1 - Math.pow(1 - e / TOSS.lift, 3)
    y = fy - 14 * k
    s = 1 + 0.03 * k
    rot = -0.012 - 0.05 * k
  } else {
    const t = Math.min(1, (e - TOSS.lift) / TOSS.fly)
    const y1 = fy - 14
    const c1x = fx + (b.x - fx) * 0.2
    const c1y = y1 - H * 0.16
    const c2x = b.x
    const c2y = b.y - H * 0.26
    const ex = b.x
    const ey = b.y + b.r * 0.2
    const u = 1 - t
    x = u * u * u * fx + 3 * u * u * t * c1x + 3 * u * t * t * c2x + t * t * t * ex
    y = u * u * u * y1 + 3 * u * u * t * c1y + 3 * u * t * t * c2y + t * t * t * ey
    const end = (b.r * 1.3) / Math.max(1, from.w)
    s = 1.03 + (end - 1.03) * Math.pow(t, 0.7)
    const turn = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
    rot = -0.062 + Math.PI * 2 * turn
  }
  g.save()
  g.globalAlpha = alpha
  g.translate(x, y)
  g.rotate(rot)
  g.scale(s, s)
  g.shadowColor = 'rgba(0,0,0,0.45)'
  g.shadowBlur = 14 / Math.max(0.2, s)
  g.shadowOffsetY = 6 / Math.max(0.2, s)
  g.drawImage(card, -from.w / 2, -from.h / 2, from.w, from.h)
  g.restore()
  // the basket's front over the card as it drops in
  if (!reduced && e >= TOSS.lift) drawBasket(g, b, p, 0, true)
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

/** Desk, lamp glow, a sheet of paper and the basket on the floor, framed like the 3D desk shot. */
function drawDesk(g: CanvasRenderingContext2D, W: number, H: number, p: Palette, binned = 0): void {
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

  // the basket on the floor, front right, with the papers read so far
  drawBasket(g, basketSpot(W, H), p, binned)

  // vignette
  const v = g.createRadialGradient(W / 2, H * 0.45, Math.min(W, H) * 0.3, W / 2, H * 0.45, Math.max(W, H) * 0.75)
  v.addColorStop(0, css(p.shade, 0))
  v.addColorStop(1, css(p.shade, 0.7))
  g.fillStyle = v
  g.fillRect(0, 0, W, H)
}
