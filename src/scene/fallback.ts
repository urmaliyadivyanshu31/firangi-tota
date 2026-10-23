// The 2D fallback: a still drawing of the era's desk for devices without WebGL2 or after the
// context is lost. No three.js here, so the app can show it without loading the 3D chunk.
import type { EraId } from '../content/types'
import { ERA_PALETTES, WOODS, css, mix, type Palette } from './palette'

export interface Fallback {
  setEra(id: EraId): void
  dispose(): void
}

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

  const draw = () => {
    if (!g) return
    const W = Math.max(1, el.clientWidth || window.innerWidth || 390)
    const H = Math.max(1, el.clientHeight || window.innerHeight || 844)
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(W * dpr)
    canvas.height = Math.round(H * dpr)
    g.setTransform(dpr, 0, 0, dpr, 0, 0)
    drawDesk(g, W, H, ERA_PALETTES[current])
  }

  let timer = 0
  const onResize = () => {
    window.clearTimeout(timer)
    timer = window.setTimeout(draw, 100)
  }
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(onResize) : null
  ro?.observe(el)
  window.addEventListener('resize', onResize)
  draw()

  return {
    setEra(id) {
      current = id
      draw()
    },
    dispose() {
      window.clearTimeout(timer)
      ro?.disconnect()
      window.removeEventListener('resize', onResize)
      canvas.remove()
    },
  }
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
