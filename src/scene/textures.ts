// Procedural canvas textures. Linear filtering with mipmaps (the spike's nearest-filtered 64 px
// textures looked pixelated); sides are powers of two and scale with the tier (TIER_SETTINGS.texSize).
import * as THREE from 'three'
import { WOODS, type WoodType } from './palette'
import type { StampKind } from './types'

export interface TexOptions {
  size: number
  rng: () => number
  anisotropy?: number
  repeat?: [number, number]
}

/** Ink colours of the two stamps. ASLI is red; TOTA is parrot green. */
export const STAMP_INK: Record<StampKind, number> = { asli: 0xa8231c, tota: 0x1d7436 }
const STAMP_WORD: Record<StampKind, [string, string]> = { asli: ['ASLI', 'असली'], tota: ['TOTA', 'तोता'] }

function makeCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return c
}

/** Wraps a canvas as a mipmapped, linearly filtered sRGB texture. */
export function toTexture(
  c: HTMLCanvasElement,
  o: { repeat?: [number, number]; anisotropy?: number; color?: boolean } = {},
): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = o.color === false ? THREE.NoColorSpace : THREE.SRGBColorSpace
  t.magFilter = THREE.LinearFilter
  t.minFilter = THREE.LinearMipmapLinearFilter
  t.generateMipmaps = true
  t.anisotropy = o.anisotropy ?? 1
  if (o.repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(o.repeat[0], o.repeat[1])
  }
  return t
}

/**
 * Tileable value noise: sample at (u·px, v·py) with u, v in [0, 1) and it wraps seamlessly.
 * Different px and py stretch it, which is how wood fibres and brushed metal are made.
 */
export function makeNoise(rng: () => number): (x: number, y: number, px: number, py: number) => number {
  const N = 256
  const g = new Float32Array(N * N)
  for (let i = 0; i < g.length; i++) g[i] = rng()
  return (x, y, px, py) => {
    const xi = Math.floor(x)
    const yi = Math.floor(y)
    let fx = x - xi
    let fy = y - yi
    fx = fx * fx * (3 - 2 * fx)
    fy = fy * fy * (3 - 2 * fy)
    const x0 = ((xi % px) + px) % px
    const y0 = ((yi % py) + py) % py
    const x1 = (x0 + 1) % px
    const y1 = (y0 + 1) % py
    // periods above 256 reuse lattice rows; the wrap at px, py still keeps it seamless
    const r0 = (y0 & 255) * N
    const r1 = (y1 & 255) * N
    const a = g[r0 + (x0 & 255)] ?? 0
    const b = g[r0 + (x1 & 255)] ?? 0
    const c = g[r1 + (x0 & 255)] ?? 0
    const d = g[r1 + (x1 & 255)] ?? 0
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy
  }
}

const rgb = (hex: number): [number, number, number] => [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255]
const sstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/** Runs `px(u, v)` per pixel; it returns [r, g, b] in 0..255. */
function paint(size: number, h: number, px: (u: number, v: number, out: number[]) => void): HTMLCanvasElement {
  const c = makeCanvas(size, h)
  const g = c.getContext('2d')
  if (!g) return c
  const img = g.createImageData(size, h)
  const d = img.data
  const out = [0, 0, 0]
  for (let y = 0; y < h; y++) {
    const v = y / h
    for (let x = 0; x < size; x++) {
      px(x / size, v, out)
      const i = (y * size + x) * 4
      d[i] = out[0] ?? 0
      d[i + 1] = out[1] ?? 0
      d[i + 2] = out[2] ?? 0
      d[i + 3] = 255
    }
  }
  g.putImageData(img, 0, 0)
  return c
}

/**
 * Wood with grain along u. `planks` > 0 cuts it into boards along v with fine seams; `joints`
 * (default on) adds one butt joint per board, as on a floor.
 */
export function woodTexture(
  wood: WoodType,
  o: TexOptions & { planks?: number; joints?: boolean; tint?: number },
): THREE.CanvasTexture {
  const n = makeNoise(o.rng)
  const w = WOODS[wood]
  const L = rgb(o.tint ?? w.light)
  const D = rgb(w.dark)
  const fib = Math.max(32, Math.min(128, o.size / 4)) | 0
  const planks = o.planks ?? 0
  const joints = o.joints !== false
  const R = planks > 0 ? 7 : 16 // growth rings per board, or per tile
  const offs = Array.from({ length: Math.max(1, planks) }, () => o.rng())
  const jointAt = Array.from({ length: Math.max(1, planks) }, () => o.rng())
  return toTexture(
    paint(o.size, o.size, (u, v, out) => {
      let pu = u
      let pv = v
      let seam = 0
      let tone = 0
      if (planks > 0) {
        const row = Math.min(planks - 1, Math.floor(v * planks))
        const local = v * planks - row
        pu = (u + (offs[row] ?? 0)) % 1
        pv = (local + row * 0.37) % 1
        const joint = joints && Math.abs(u - (jointAt[row] ?? 0)) < 0.003 ? 0.8 : 0
        seam = Math.max(1 - sstep(0, 0.014, local), sstep(0.986, 1, local), joint) * 0.75
        tone = ((offs[row] ?? 0) - 0.5) * 0.16
      }
      // gently waving growth rings, long fibres along the grain, and broad colour drift
      const warp = n(pu * 1, pv * 3, 1, 3) * 0.6 + n(pu * 3, pv * 6, 3, 6) * 0.4
      const rings = pv * R + warp * 2.4
      const t = rings - Math.floor(rings)
      const late = sstep(0.6, 0.88, t) * (1 - sstep(0.9, 1, t))
      const fiber = n(pu * 4, pv * fib, 4, fib)
      const fine = n(pu * 12, pv * fib * 2, 12, fib * 2)
      const broad = n(pu * 2, pv * 2, 2, 2)
      let k = 0.22 + 0.44 * late + 0.26 * (fiber - 0.5) + 0.12 * (fine - 0.5) + 0.16 * (broad - 0.5) + tone
      k = Math.min(1, Math.max(0, k + seam * 0.6))
      out[0] = L[0] + (D[0] - L[0]) * k
      out[1] = L[1] + (D[1] - L[1]) * k
      out[2] = L[2] + (D[2] - L[2]) * k
    }),
    { repeat: o.repeat ?? [1, 1], anisotropy: o.anisotropy },
  )
}

/** Lime plaster or distemper: soft blotches and fine grain over a base colour. */
export function plasterTexture(color: number, o: TexOptions): THREE.CanvasTexture {
  const n = makeNoise(o.rng)
  const C = rgb(color)
  const hi = Math.max(32, Math.min(128, o.size / 4)) | 0
  return toTexture(
    paint(o.size, o.size, (u, v, out) => {
      const blot = n(u * 4, v * 4, 4, 4) * 0.55 + n(u * 12, v * 12, 12, 12) * 0.3 + n(u * 32, v * 32, 32, 32) * 0.15
      const grain = n(u * hi, v * hi, hi, hi)
      const stain = sstep(0.62, 0.8, n(u * 5, v * 3, 5, 3)) * 0.1
      const k = 1 + (blot - 0.5) * 0.15 + (grain - 0.5) * 0.05 - stain * 0.7
      out[0] = C[0] * k
      out[1] = C[1] * k
      out[2] = C[2] * k * 0.98
    }),
    { repeat: o.repeat ?? [1, 1], anisotropy: o.anisotropy },
  )
}

/** Flagstones with mortar lines and per-stone tone. */
export function stoneTexture(color: number, o: TexOptions & { cells?: number }): THREE.CanvasTexture {
  const n = makeNoise(o.rng)
  const C = rgb(color)
  const cells = o.cells ?? 3
  const tones = Array.from({ length: cells * cells * 2 }, () => (o.rng() - 0.5) * 0.22)
  const hi = Math.max(32, Math.min(128, o.size / 4)) | 0
  return toTexture(
    paint(o.size, o.size, (u, v, out) => {
      const row = Math.floor(v * cells)
      const su = (u + (row % 2) * 0.5) % 1
      const col = Math.floor(su * cells)
      const lu = su * cells - col
      const lv = v * cells - row
      const edge = Math.min(lu, 1 - lu, lv, 1 - lv)
      const mortar = 1 - sstep(0.012, 0.03, edge)
      const tone = tones[row * cells * 2 + col] ?? 0
      const grain = n(u * hi, v * hi, hi, hi)
      const blot = n(u * 6, v * 6, 6, 6)
      const k = (1 + tone + (grain - 0.5) * 0.12 + (blot - 0.5) * 0.2) * (1 - mortar * 0.55)
      out[0] = C[0] * k
      out[1] = C[1] * k
      out[2] = C[2] * k
    }),
    { repeat: o.repeat ?? [1, 1], anisotropy: o.anisotropy },
  )
}

/** Woven cloth (khadi, baize, durrie), optionally striped along v. */
export function clothTexture(color: number, o: TexOptions & { stripe?: number }): THREE.CanvasTexture {
  const n = makeNoise(o.rng)
  const C = rgb(color)
  const S = o.stripe === undefined ? null : rgb(o.stripe)
  const threads = Math.max(16, o.size / 4) | 0
  return toTexture(
    paint(o.size, o.size, (u, v, out) => {
      const tu = u * threads
      const tv = v * threads
      const over = (Math.floor(tu) + Math.floor(tv)) % 2 === 0
      const s = over ? Math.sin(Math.PI * (tu - Math.floor(tu))) : Math.sin(Math.PI * (tv - Math.floor(tv)))
      const slub = n(u * 8, v * threads, 8, threads) * 0.6 + n(u * threads, v * 8, threads, 8) * 0.4
      const k = 0.86 + 0.12 * s + (slub - 0.5) * 0.14
      const band = S && Math.floor(v * 8) % 4 === 1 ? S : C
      out[0] = band[0] * k
      out[1] = band[1] * k
      out[2] = band[2] * k
    }),
    { repeat: o.repeat ?? [1, 1], anisotropy: o.anisotropy },
  )
}

/**
 * A damp stain on transparent, for a decal over plaster: mottled wet below an irregular edge, a
 * darker tide mark along it and a pale bloom of salts just past it. The stain rises from the bottom
 * of the canvas (rising damp) and tiles across u; flip the plane to hang it from a sill or a ceiling.
 * Twice as wide as tall.
 */
export function stainTexture(color: number, o: TexOptions): THREE.CanvasTexture {
  const n = makeNoise(o.rng)
  const C = rgb(color)
  const W = o.size
  const H = Math.max(16, o.size / 2)
  const c = makeCanvas(W, H)
  const ctx = c.getContext('2d')
  if (ctx) {
    const img = ctx.createImageData(W, H)
    const d = img.data
    for (let y = 0; y < H; y++) {
      const v = y / H
      for (let x = 0; x < W; x++) {
        const u = x / W
        // the edge wanders between 15% and 70% of the height; below it the wall is wet
        const edge = 0.15 + 0.35 * n(u * 3, 0.5, 3, 4) + 0.2 * n(u * 9, 2.5, 9, 4)
        const t = v - edge
        const wet = sstep(-0.04, 0.4, t) * (0.35 + 0.65 * n(u * 7, v * 3, 7, 3)) * 0.6
        const tide = Math.exp(-((t + 0.02) * (t + 0.02)) / 0.0011) * (0.3 + 0.5 * n(u * 20, 1.5, 20, 4)) * 0.55
        const bloom = Math.exp(-((t + 0.07) * (t + 0.07)) / 0.0025) * sstep(0.35, 0.8, n(u * 14, 3.5, 14, 4)) * 0.3
        const dark = wet + tide
        const a = Math.min(1, dark + bloom)
        const i = (y * W + x) * 4
        for (let ch = 0; ch < 3; ch++) {
          const base = C[ch] ?? 0
          const pale = Math.min(255, base * 1.5 + 40)
          d[i + ch] = a > 0 ? (base * (1 - tide * 0.6) * dark + pale * bloom) / a : base
        }
        d[i + 3] = a * 255
      }
    }
    ctx.putImageData(img, 0, 0)
  }
  return toTexture(c, { repeat: o.repeat ?? [1, 1], anisotropy: o.anisotropy })
}

/** Brass or tin: brushed streaks along u and darker tarnish blotches. */
export function metalTexture(color: number, o: TexOptions): THREE.CanvasTexture {
  const n = makeNoise(o.rng)
  const C = rgb(color)
  const fine = Math.max(32, Math.min(128, o.size / 2)) | 0
  return toTexture(
    paint(o.size, o.size, (u, v, out) => {
      const brush = n(u * 4, v * fine, 4, fine)
      const tarnish = sstep(0.55, 0.85, n(u * 6, v * 6, 6, 6) * 0.7 + n(u * 16, v * 16, 16, 16) * 0.3)
      const k = 0.92 + (brush - 0.5) * 0.2 - tarnish * 0.32
      out[0] = C[0] * k
      out[1] = C[1] * (k + tarnish * 0.04)
      out[2] = C[2] * k
    }),
    { repeat: o.repeat ?? [1, 1], anisotropy: o.anisotropy },
  )
}

/**
 * The sheet on the desk: aged paper with faint, unreadable lines of writing (the readable
 * message lives in the DOM). The lower part stays clear for the stamp.
 */
export function paperTexture(o: {
  width: number
  rng: () => number
  tint: number
  ink: number
  style: 'hand' | 'typed'
  anisotropy?: number
}): THREE.CanvasTexture {
  const W = o.width
  const H = Math.round((W * 4) / 3)
  const n = makeNoise(o.rng)
  const T = rgb(o.tint)
  const c = paint(W, H, (u, v, out) => {
    const mott = n(u * 5, v * 6, 5, 6) * 0.6 + n(u * 20, v * 24, 20, 24) * 0.4
    const fiber = n(u * 48, v * 96, 48, 96)
    const edge = Math.min(u, 1 - u, v * 0.75, (1 - v) * 0.75)
    const tone = 1 - (1 - sstep(0, 0.07, edge)) * 0.22
    const k = (1 + (mott - 0.5) * 0.08 + (fiber - 0.5) * 0.05) * tone
    out[0] = T[0] * k
    out[1] = T[1] * k
    out[2] = T[2] * (k - (1 - tone) * 0.25)
  })
  const g = c.getContext('2d')
  if (g) {
    const s = W / 512
    const r = o.rng
    const ink = rgb(o.ink)
    g.strokeStyle = `rgba(${ink[0]},${ink[1]},${ink[2]},0.34)`
    g.fillStyle = `rgba(${ink[0]},${ink[1]},${ink[2]},0.3)`
    g.lineCap = 'round'
    g.lineJoin = 'round'
    const left = 52 * s
    const right = W - 48 * s
    const top = 70 * s
    const bottom = H * 0.64
    if (o.style === 'hand') {
      const step = 30 * s
      g.lineWidth = Math.max(1, 1.5 * s)
      let y = top
      let line = 0
      while (y < bottom) {
        const indent = line === 0 || r() < 0.12 ? 40 * s : 0
        const end = line === 0 ? left + (180 + r() * 80) * s : right - r() * 70 * s
        let x = left + indent
        const slope = (r() - 0.5) * 0.012
        while (x < end) {
          // a cursive word: small loops of varying height, an occasional ascender or descender
          const len = Math.min(end - x, (22 + r() * 58) * s)
          const xh = 5.5 * s
          let phase = r() * 6
          let amp = 1
          g.beginPath()
          for (let i = 0; i <= len; i += 1.4 * s) {
            if (r() < 0.12) amp = r() < 0.25 ? 2.1 + r() * 0.6 : 0.7 + r() * 0.5
            phase += 0.75 + r() * 0.35
            const yy = y + (x + i - left) * slope - (1 - Math.cos(phase)) * 0.5 * xh * amp
            if (i === 0) g.moveTo(x + i, yy)
            else g.lineTo(x + i + Math.sin(phase) * 1.1 * s, yy)
          }
          g.stroke()
          x += len + (9 + r() * 7) * s
        }
        y += step * (r() < 0.1 ? 1.6 : 1)
        line++
      }
      // signature flourish, bottom right
      g.lineWidth = Math.max(1, 2.6 * s)
      g.beginPath()
      const sx = W * 0.58
      const sy = H * 0.7
      g.moveTo(sx, sy)
      g.bezierCurveTo(sx + 40 * s, sy - 30 * s, sx + 70 * s, sy + 26 * s, sx + 130 * s, sy - 6 * s)
      g.stroke()
    } else {
      const step = 22 * s
      const ch = 7 * s
      g.lineWidth = Math.max(1, 1.2 * s)
      // a form header: two ruled boxes, as on a telegram or a duty sheet
      g.strokeRect(left, 30 * s, right - left, 24 * s)
      g.beginPath()
      g.moveTo(left + (right - left) * 0.62, 30 * s)
      g.lineTo(left + (right - left) * 0.62, 54 * s)
      g.stroke()
      let y = top + 10 * s
      while (y < bottom) {
        let x = left
        const end = right - r() * 90 * s
        while (x < end) {
          const word = 2 + Math.floor(r() * 7)
          for (let i = 0; i < word && x < end; i++) {
            g.fillRect(x, y - ch * (0.6 + r() * 0.4), ch * 0.72, ch * (0.6 + r() * 0.4))
            x += ch
          }
          x += ch
        }
        y += step
      }
    }
  }
  return toTexture(c, { anisotropy: o.anisotropy })
}

/** A worn ink imprint of the ASLI or TOTA stamp, on transparent. */
export function stampDecalTexture(kind: StampKind, o: { size: number; rng: () => number }): THREE.CanvasTexture {
  const S = o.size
  const c = makeCanvas(S, S)
  const g = c.getContext('2d')
  if (g) {
    const [r, gg, b] = rgb(STAMP_INK[kind])
    const col = `rgb(${r},${gg},${b})`
    g.translate(S / 2, S / 2)
    g.strokeStyle = col
    g.fillStyle = col
    g.lineWidth = S * 0.045
    g.beginPath()
    g.arc(0, 0, S * 0.44, 0, Math.PI * 2)
    g.stroke()
    g.lineWidth = S * 0.016
    g.beginPath()
    g.arc(0, 0, S * 0.37, 0, Math.PI * 2)
    g.stroke()
    const [word, hindi] = STAMP_WORD[kind]
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    g.font = `bold ${Math.round(S * 0.2)}px Georgia, "Times New Roman", serif`
    g.fillText(word, 0, -S * 0.05)
    g.font = `${Math.round(S * 0.13)}px "Tiro Devanagari Hindi", "Noto Serif Devanagari", "Kohinoor Devanagari", serif`
    g.fillText(hindi, 0, S * 0.17)
    // knock specks out so it reads as ink pressed by hand, not a vector shape
    g.setTransform(1, 0, 0, 1, 0, 0)
    g.globalCompositeOperation = 'destination-out'
    for (let i = 0; i < 220; i++) {
      g.globalAlpha = 0.25 + o.rng() * 0.7
      const w = (0.6 + o.rng() * 1.8) * (S / 128)
      g.fillRect(o.rng() * S, o.rng() * S, w, w * 0.8)
    }
    // one side pressed lighter
    g.globalAlpha = 0.35
    const fade = g.createLinearGradient(0, 0, S, S * 0.4)
    fade.addColorStop(0, 'rgba(0,0,0,0)')
    fade.addColorStop(1, 'rgba(0,0,0,1)')
    g.fillStyle = fade
    g.fillRect(0, 0, S, S)
  }
  return toTexture(c)
}

/** Soft round glow for halos and flames, white so a material colour can tint it. */
export function glowTexture(size = 64): THREE.CanvasTexture {
  const c = makeCanvas(size, size)
  const g = c.getContext('2d')
  if (g) {
    const r = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    r.addColorStop(0, 'rgba(255,255,255,1)')
    r.addColorStop(0.2, 'rgba(255,255,255,0.55)')
    r.addColorStop(0.55, 'rgba(255,255,255,0.12)')
    r.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = r
    g.fillRect(0, 0, size, size)
  }
  return toTexture(c)
}

/**
 * Woven strips for a basket: split bamboo or cane passing over and under the stakes. `twill`
 * steps each row by half a strand, as a tokri is plaited on the diagonal; `gap` shows between
 * the strands (dark for a close weave). Colours are CSS strings.
 */
export function weaveTexture(
  w: number,
  o: { light: string; mid: string; dark: string; gap: string; rows: number; cols: number; twill?: boolean; repeat?: [number, number] },
): THREE.CanvasTexture {
  const c = makeCanvas(w, w)
  const g = c.getContext('2d')
  if (g) {
    g.fillStyle = o.gap
    g.fillRect(0, 0, w, w)
    const rh = w / o.rows
    const cw = w / o.cols
    for (let r = 0; r < o.rows; r++) {
      // over one stake, under the next: each strand shows as a raised lozenge
      const shift = o.twill ? ((r * cw) / 2) % cw : ((r % 2) * cw) / 2
      for (let k = -1; k <= o.cols; k++) {
        const x = k * cw + shift
        const grd = g.createLinearGradient(0, r * rh, 0, (r + 1) * rh)
        grd.addColorStop(0, o.light)
        grd.addColorStop(0.55, o.mid)
        grd.addColorStop(1, o.dark)
        g.fillStyle = grd
        g.beginPath()
        g.ellipse(x + cw / 2, r * rh + rh / 2, cw * 0.48, rh * 0.4, 0, 0, Math.PI * 2)
        g.fill()
      }
    }
  }
  return toTexture(c, { repeat: o.repeat ?? [3, 2] })
}

/** Galvanised wire mesh with see-through squares (draw it transparent): an office wastepaper basket. */
export function wireTexture(w: number, repeat: [number, number] = [10, 4]): THREE.CanvasTexture {
  const c = makeCanvas(w, w)
  const g = c.getContext('2d')
  if (g) {
    g.clearRect(0, 0, w, w)
    const t = Math.max(2, Math.round(w / 7))
    const grd = g.createLinearGradient(0, 0, w, w)
    grd.addColorStop(0, '#c9c4b8')
    grd.addColorStop(1, '#7d786c')
    g.fillStyle = grd
    // one wire across and one down per tile: the repeat makes the mesh
    g.fillRect(0, 0, w, t)
    g.fillRect(0, 0, t, w)
  }
  return toTexture(c, { repeat })
}

/** A contact-shadow blob for the low tier, which has no shadow maps. */
export function blobTexture(size = 64): THREE.CanvasTexture {
  const c = makeCanvas(size, size)
  const g = c.getContext('2d')
  if (g) {
    const r = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    r.addColorStop(0, 'rgba(0,0,0,0.75)')
    r.addColorStop(0.5, 'rgba(0,0,0,0.35)')
    r.addColorStop(1, 'rgba(0,0,0,0)')
    g.fillStyle = r
    g.fillRect(0, 0, size, size)
  }
  return toTexture(c)
}
