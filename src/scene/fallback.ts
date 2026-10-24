// The 2D fallback: a still drawing of the era's desk for devices without WebGL2 or after the
// context is lost, with the message drawn big on its paper by the same drawer as the 3D sheet.
// No three.js here, so the app can show it without loading the 3D chunk.
import type { EraId } from '../content/types'
import { ERA_PALETTES, WOODS, css, mix, type Palette } from './palette'
import { MARK_COLORS, TITLE_TONE, drawDayTitle, drawRevealMarks, drawSheet, drawSheetBack, highlightRects, loadSheetFonts, measureSheet, stampBox, type PageRect } from './sheet'
import { beamAt, caughtScore, redAt, type CaughtScore, type KnockKind } from './caught'
import type { DayTitle, FlashKind, RevealSpec, ScreenRect, SheetSpec, SheetStamp, StageCueName, StampKind } from './types'

export interface Fallback {
  setEra(id: EraId): void
  /** Draws the message on the paper, big enough to read; resolves once fonts are in. */
  showMessage(s: SheetSpec): Promise<void>
  /** Language or pencil change: the same sheet, redrawn. */
  redrawMessage(s: SheetSpec): void
  /** A short saffron glow after a right stamp. A wrong one stays still: its red comes in caught(). */
  flash(kind: FlashKind): void
  /**
   * The caught sequence (see Stage.caught and caught.ts), drawn flat: the lamp flickers, red pulses
   * on the alarm's rhythm, a beam sweeps across, the knocks shake the desk, then the dark. Its sounds
   * go out through `onCue`, beat by beat, as the stage's do. skip() ends it.
   */
  caught(): Promise<void>
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

export interface FallbackOptions {
  /** The caught sequence's beats, for sound (the same names the stage sends). */
  onCue?: (name: StageCueName) => void
}

/** How hard each rap of a knock shakes the flat desk (px), closer each time. */
const RAP_PX: Record<KnockKind, number> = { far: 1, near: 3, door: 6 }
/** How dark the desk stays after the sequence, until the verdict turns over. */
const CAUGHT_DARK = 0.5

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
  // the caught sequence in progress, and the dark it leaves over the desk
  // (`ms` is its own clock: each frame adds at most 100 ms, so a tab hidden mid-alarm picks up
  // where it left off instead of firing every beat at once)
  let caughtRun: { last: number; ms: number; score: CaughtScore; next: number; sounded: boolean; done: () => void } | null = null
  let darkK = 0
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
    if (sheet) {
      const v = verdict
      const out = drawPaper(g, W, H, sheet, stamp, el, (c, pw, ph) => {
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
      })
      paperBox = out
    }
    if (darkK > 0) {
      g.fillStyle = `rgba(0,0,0,${darkK.toFixed(3)})`
      g.fillRect(0, 0, W, H)
    }
    if (flashK || caughtRun) {
      // keep the still for the flash frames (one canvas, resized only with the screen)
      base ??= document.createElement('canvas')
      if (base.width !== pw || base.height !== ph) {
        base.width = pw
        base.height = ph
      }
      base.getContext('2d')?.drawImage(canvas, 0, 0)
    }
  }

  const say = (name: StageCueName) => {
    try {
      opts.onCue?.(name)
    } catch {
      /* a listener's error never breaks the desk */
    }
  }

  /** Ends the caught sequence: silently when skipped or cut short, leaving the dark over the desk. */
  const finishCaught = (quiet: boolean) => {
    const c = caughtRun
    if (!c) return
    caughtRun = null
    if (quiet && c.sounded) say('caughtHush')
    darkK = CAUGHT_DARK
    if (!disposed) compose()
    c.done()
  }

  const frame = (now: number) => {
    raf = 0
    if (disposed || (!flashK && !caughtRun)) return
    let more = false
    let dx = 0
    let dy = 0
    const c = caughtRun
    if (c) {
      c.ms += Math.min(100, Math.max(0, now - c.last))
      c.last = now
    }
    const ms = c ? c.ms : 0
    if (c) {
      // the beats due by now: their sounds, and the knocks' shakes
      for (let b = c.score.beats[c.next]; b && b.at <= ms; b = c.score.beats[++c.next]) {
        if (b.cue) {
          say(b.cue)
          c.sounded = b.cue !== 'caughtHush' && b.cue !== 'caughtDark'
        }
      }
      if (!reduced) {
        for (const b of c.score.beats) {
          if (!b.rap || b.at > ms || ms - b.at > 400) continue
          const k = RAP_PX[b.rap] * Math.exp(-(ms - b.at) / 90)
          dx += Math.sin(b.at * 7.1 + ms * 0.09) * k
          dy += Math.cos(b.at * 3.3 + ms * 0.11) * k
        }
      }
    }
    if (g) {
      g.setTransform(1, 0, 0, 1, 0, 0)
      if (base) {
        // shaken: drawn a hair larger, so the edges never show
        const s = dx || dy ? 1.03 : 1
        const bw = base.width * s
        const bh = base.height * s
        g.drawImage(base, (base.width - bw) / 2 + dx * dpr, (base.height - bh) / 2 + dy * dpr, bw, bh)
      }
      g.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (flashK) {
        const t = (now - flashK.t0) / (flashK.kind === 'right' ? 1000 : 1300)
        if (t >= 1) flashK = null
        else {
          drawFlash(g, W, H, flashK.kind, t)
          more = true
        }
      }
      if (c) drawCaught(g, W, H, c.score, ms, reduced)
    }
    if (c && ms >= c.score.end) finishCaught(false)
    else if (c) more = true
    if (more) raf = requestAnimationFrame(frame)
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
      finishCaught(true)
      darkK = 0
      current = id
      sheet = null
      stamp = null
      title = null
      verdict = null
      compose()
    },
    showMessage(s) {
      finishCaught(true)
      darkK = 0
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
      // the verdict turns over in the light: the dark (or a sequence cut short) lifts
      finishCaught(true)
      darkK = 0
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
      if (caughtRun) return finishCaught(true) // a tap during the alarm skips to the verdict
      skipReveal = true
      finishWait?.()
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
      if (kind === 'wrong') return
      if (!g || disposed || reduced || typeof requestAnimationFrame !== 'function') return
      flashK = { kind, t0: typeof performance !== 'undefined' ? performance.now() : Date.now() }
      compose()
      if (!raf) raf = requestAnimationFrame(frame)
    },
    caught() {
      finishCaught(true)
      if (disposed || typeof requestAnimationFrame !== 'function') return Promise.resolve()
      return new Promise<void>((done) => {
        const now = typeof performance !== 'undefined' ? performance.now() : Date.now()
        caughtRun = { last: now, ms: 0, score: caughtScore(current), next: 0, sounded: false, done }
        compose() // keeps the still for the frames
        if (!raf) raf = requestAnimationFrame(frame)
      })
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
      finishCaught(true)
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
  drawSheet(g, pw, ph, s, stamp ?? undefined)
  face?.(g, pw, ph)
  g.restore()
  // (the turn is a hair; for hit boxes the upright box is close enough)
  return { x: left + freeW / 2 - pw / 2, y: top + freeH / 2 - ph / 2, w: pw, h: ph }
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

/**
 * One frame of the caught sequence over the still: the lamp's flicker, the red light pulsing in from
 * the edges, the beam swung across from the window (top right), the flame guttering at the door's
 * raps, then the dark. Under reduced motion: one slow red tint and the dark, nothing moving.
 */
function drawCaught(g: CanvasRenderingContext2D, W: number, H: number, score: CaughtScore, ms: number, reduced: boolean): void {
  const R = Math.hypot(W, H) / 2
  g.save()
  // the beam: a soft wedge of light in three layers for its edge, brightest near the window
  if (!reduced) {
    const b = beamAt(score.beam, ms)
    if (b.amount > 0.002) {
      // carried along past the window, its patch of light crossing the other way
      const ox = W * (0.8 + 0.16 * b.sweep)
      const oy = -H * 0.06
      const a = Math.atan2(H * 0.5 - oy, W * 0.5 - ox) - b.sweep * 0.34
      const [r, gr, bl] = score.beam.color.map((x) => Math.round(x * 255))
      const reach = Math.hypot(W, H) * 1.2
      g.globalCompositeOperation = 'lighter'
      for (const [spread, alpha] of [[1, 0.35], [0.66, 0.35], [0.36, 0.3]] as const) {
        const w = score.beam.width * spread
        const grd = g.createRadialGradient(ox, oy, 0, ox, oy, reach)
        grd.addColorStop(0, `rgba(${r},${gr},${bl},${(alpha * b.amount * score.beam.strength * 1.6).toFixed(3)})`)
        grd.addColorStop(1, `rgba(${r},${gr},${bl},0)`)
        g.fillStyle = grd
        g.beginPath()
        g.moveTo(ox, oy)
        g.lineTo(ox + Math.cos(a - w) * reach, oy + Math.sin(a - w) * reach)
        g.lineTo(ox + Math.cos(a + w) * reach, oy + Math.sin(a + w) * reach)
        g.closePath()
        g.fill()
      }
      g.globalCompositeOperation = 'source-over'
    }
  }
  // the red light
  let amount = 0
  let spread = 1
  let wash = 0
  if (ms >= score.alarm) {
    if (reduced) {
      const e = ms - score.alarm
      amount = e < 260 ? (e / 260) * 0.85 : 0.85 * Math.max(0, 1 - (e - 260) / 1700)
      wash = amount * 0.5
    } else {
      const red = redAt(score, ms)
      amount = 0.3 + 0.7 * red.pulse
      spread = red.creep
      wash = red.pulse * 0.8
    }
    if (ms > score.dark) amount *= Math.max(0, 1 - (ms - score.dark) / 600)
  }
  if (amount > 0.002) {
    const inner = R * (1 - 0.62 * spread)
    const grd = g.createRadialGradient(W / 2, H / 2, Math.max(0, inner - R * 0.1), W / 2, H / 2, R)
    grd.addColorStop(0, 'rgba(163,23,14,0)')
    grd.addColorStop(0.35, `rgba(140,18,10,${(0.5 * amount).toFixed(3)})`)
    grd.addColorStop(1, `rgba(40,4,2,${(0.75 * amount).toFixed(3)})`)
    g.fillStyle = grd
    g.fillRect(0, 0, W, H)
    if (wash > 0.002) {
      g.fillStyle = `rgba(170,24,14,${(0.3 * wash).toFixed(3)})`
      g.fillRect(0, 0, W, H)
    }
  }
  // the lamp: one flicker in the silence, and the flame guttering at the raps on the door
  let shade = 0
  if (ms >= score.flicker[0] && ms < score.flicker[1]) shade = reduced ? 0.25 : 0.55
  if (!reduced) {
    for (const b of score.beats) {
      if (b.rap === 'door' && ms >= b.at && ms - b.at < 300) shade = Math.max(shade, 0.3 * Math.exp(-(ms - b.at) / 110))
    }
  }
  // the dark closing in at the end
  if (ms >= score.dark) shade = Math.max(shade, CAUGHT_DARK * Math.min(1, (ms - score.dark) / (reduced ? 300 : 600)))
  if (shade > 0.002) {
    g.fillStyle = `rgba(0,0,0,${shade.toFixed(3)})`
    g.fillRect(0, 0, W, H)
  }
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
