// Quality tiers: a start tier from cheap device signals, then adaptation from measured frame times.
// Thresholds and GPU patterns come from docs/research/spike-3d-report.md.
import { store } from '../game/storage'
import type { QualityTier } from './types'

export const TIERS: readonly QualityTier[] = ['low', 'mid', 'high']

export interface TierSettings {
  /** Cap on the renderer pixel ratio. Canvas pixels are the main GPU cost on phones. */
  maxDpr: number
  /** Cap on canvas pixels, so big desktop screens don't blow the budget either. */
  maxPixels: number
  /** MSAA is fixed when the context is created; crossing this line rebuilds the renderer. */
  antialias: boolean
  shadows: 'pcf' | 'basic' | 'none'
  shadowSize: number
  shadowRadius: number
  /** rich = Phong everywhere, mixed = Phong on metal only, cheap = Lambert everywhere. */
  materials: 'rich' | 'mixed' | 'cheap'
  dust: number
  /** Side of the tiling procedural textures (power of two, so mipmaps work). */
  texSize: number
  /** Width of the paper canvas. */
  paperSize: number
  anisotropy: number
  /** Draw-call budget for a whole era scene; the ?debug overlay shows it next to the count. */
  maxCalls: number
}

export const TIER_SETTINGS: Record<QualityTier, TierSettings> = {
  high: {
    maxDpr: 2, maxPixels: 3_200_000, antialias: true, shadows: 'pcf', shadowSize: 1024, shadowRadius: 3,
    materials: 'rich', dust: 110, texSize: 512, paperSize: 512, anisotropy: 8, maxCalls: 120,
  },
  mid: {
    maxDpr: 1.5, maxPixels: 2_200_000, antialias: false, shadows: 'basic', shadowSize: 512, shadowRadius: 1,
    materials: 'mixed', dust: 44, texSize: 256, paperSize: 384, anisotropy: 4, maxCalls: 90,
  },
  low: {
    maxDpr: 1, maxPixels: 1_200_000, antialias: false, shadows: 'none', shadowSize: 0, shadowRadius: 0,
    materials: 'cheap', dust: 12, texSize: 128, paperSize: 256, anisotropy: 1, maxCalls: 60,
  },
}

export interface DeviceSignals {
  dpr: number
  cores?: number
  memGB?: number
  gpu?: string
  /** Short side of the screen in CSS pixels. */
  minSide: number
}

// Old or weak GPUs, plus software renderers.
const LOW_GPU =
  /Mali-[34]\d\d|Mali-T[678]\d\d|Mali-G[35]1(?!\d)|Adreno[^\d]*[34]\d\d(?!\d)|Adreno[^\d]*50[4-6](?!\d)|PowerVR|SGX|SwiftShader|llvmpipe|softpipe|Software|Basic Render/i
// Budget GPUs that manage mid. (?!\d) matters: 'Mali-G71' must not match 'Mali-G710'.
const MID_GPU = /Mali-G(5[27]|6[08]|7[126])(?!\d)|Adreno[^\d]*(5\d\d|6[0-4]\d)(?!\d)/i
// Known strong mobile GPUs: exempt from the dense-screen cap.
const STRONG_GPU = /Adreno[^\d]*(6[5-9]\d|[78]\d\d)(?!\d)|Mali-G(6[1-9]|7[1-9]|9\d)\d|Immortalis|Xclipse|Apple/i
const APPLE_GPU = /Apple/i

const rank = (t: QualityTier) => TIERS.indexOf(t)

/** Cheap signals, worst one wins. The adapter corrects mistakes in either direction. */
export function pickInitialTier(sig: DeviceSignals): QualityTier {
  const gpu = (sig.gpu ?? '').trim()
  const apple = APPLE_GPU.test(gpu)
  let cap: QualityTier = 'high'
  const lower = (t: QualityTier) => {
    if (rank(t) < rank(cap)) cap = t
  }
  if (LOW_GPU.test(gpu)) lower('low')
  else if (MID_GPU.test(gpu)) lower('mid')
  if (sig.memGB !== undefined) {
    if (sig.memGB <= 2) lower('low')
    else if (sig.memGB <= 4) lower('mid')
  }
  // Safari clamps hardwareConcurrency, so only trust it off Apple hardware.
  if (!apple && sig.cores) {
    if (sig.cores <= 2) lower('low')
    else if (sig.cores <= 4) lower('mid')
  }
  // Dense, big screens on GPUs we don't know: start at mid and let the adapter decide.
  if (!apple && sig.dpr >= 2.5 && sig.minSide * sig.dpr >= 1000 && !STRONG_GPU.test(gpu)) lower('mid')
  if (!gpu) lower('mid')
  return cap
}

export interface QualityManager {
  sample(frameMs: number): void
  tier(): QualityTier
  /** For the debug overlay. */
  info(): { avgMs: number; capped: boolean; steppedDown: boolean; steppedUp: boolean }
}

export interface QualityOptions {
  downMs: number
  downN: number
  upMs: number
  upP95Ms: number
  upN: number
  gapMs: number
}

const DEFAULTS: QualityOptions = { downMs: 22, downN: 120, upMs: 17.5, upP95Ms: 20, upN: 240, gapMs: 3000 }

/**
 * Ruling R14. Steps down when the last 120 frames average over 22 ms. Steps up when 240
 * consecutive frames average ≤ 17.5 ms with a p95 ≤ 20 ms (a clean 60 Hz vsync stream), at most
 * once per session and never in a session that has already stepped down. Changes are at least
 * 3 s of measured frames apart. A tight cluster around 33 ms is a 30 fps cap (iOS Low Power Mode,
 * battery savers), not GPU load, so it does not step down for that.
 */
export function createQualityManager(
  start: QualityTier,
  apply: (t: QualityTier) => void,
  options: Partial<QualityOptions> = {},
): QualityManager {
  const o = { ...DEFAULTS, ...options }
  const size = Math.max(o.downN, o.upN)
  const ring = new Float64Array(size)
  let count = 0
  let head = 0
  let current = start
  let steppedDown = false
  let steppedUp = false
  let sinceChange = o.gapMs // the first change may come as soon as a window fills
  let lastAvg = 0
  let lastCapped = false

  const stats = (n: number) => {
    let sum = 0
    for (let i = 1; i <= n; i++) sum += ring[(head - i + size) % size] ?? 0
    const mean = sum / n
    let v = 0
    for (let i = 1; i <= n; i++) {
      const d = (ring[(head - i + size) % size] ?? 0) - mean
      v += d * d
    }
    return { mean, sd: Math.sqrt(v / n) }
  }

  // p95 ≤ limit means sorted[floor(0.95·n)] ≤ limit, i.e. at most n − floor(0.95·n) − 1 frames
  // over the limit. Counting avoids sorting 240 samples every frame.
  const p95Within = (n: number, limit: number) => {
    let over = 0
    for (let i = 1; i <= n; i++) if ((ring[(head - i + size) % size] ?? 0) > limit) over++
    return over <= n - Math.floor(0.95 * n) - 1
  }

  const change = (t: QualityTier) => {
    current = t
    count = 0
    head = 0
    sinceChange = 0
    apply(t)
  }

  return {
    sample(ms) {
      if (!(ms > 0) || ms > 250) return // stalls, tab switches and compiles say nothing about the GPU
      ring[head] = ms
      head = (head + 1) % size
      if (count < size) count++
      sinceChange += ms
      const i = rank(current)
      if (count >= o.downN) {
        const { mean, sd } = stats(o.downN)
        lastAvg = mean
        lastCapped = mean >= 30.5 && mean <= 36.5 && sd < 2.5
        if (mean > o.downMs && !lastCapped && i > 0 && sinceChange >= o.gapMs) {
          steppedDown = true
          change(TIERS[i - 1] as QualityTier)
          return
        }
      }
      const canStepUp = !steppedUp && !steppedDown && i < TIERS.length - 1
      if (canStepUp && count >= o.upN && sinceChange >= o.gapMs) {
        if (stats(o.upN).mean <= o.upMs && p95Within(o.upN, o.upP95Ms)) {
          steppedUp = true
          change(TIERS[i + 1] as QualityTier)
        }
      }
    },
    tier: () => current,
    info: () => ({ avgMs: lastAvg, capped: lastCapped, steppedDown, steppedUp }),
  }
}

/** `?tier=low|mid|high` forces a tier and turns the adapter off. */
export function parseTierParam(search: string): QualityTier | undefined {
  let v: string | null = null
  try {
    v = new URLSearchParams(search).get('tier')
  } catch {
    return undefined
  }
  return (TIERS as readonly string[]).includes(v ?? '') ? (v as QualityTier) : undefined
}

const TIER_KEY = 'tier'
const TIER_TTL_MS = 30 * 864e5 // re-measure monthly, so one bad session doesn't pin a device forever

/** The tier this device settled on last time, if recent. */
export function loadSavedTier(now = Date.now()): QualityTier | undefined {
  const v = store.get<unknown>(TIER_KEY, null)
  if (!v || typeof v !== 'object') return undefined
  const { tier, at } = v as { tier?: unknown; at?: unknown }
  if (typeof tier !== 'string' || !(TIERS as readonly string[]).includes(tier)) return undefined
  if (typeof at !== 'number' || now - at > TIER_TTL_MS || at > now + 864e5) return undefined
  return tier as QualityTier
}

export function saveTier(tier: QualityTier, now = Date.now()): void {
  store.set(TIER_KEY, { tier, at: now })
}

export function startTier(o: {
  forced?: QualityTier
  saved?: QualityTier
  detect: () => QualityTier
}): { tier: QualityTier; source: 'forced' | 'saved' | 'detected' } {
  if (o.forced) return { tier: o.forced, source: 'forced' }
  if (o.saved) return { tier: o.saved, source: 'saved' }
  return { tier: o.detect(), source: 'detected' }
}

/** Reads cheap device signals from a live WebGL context. */
export function readDeviceSignals(gl: WebGL2RenderingContext): DeviceSignals {
  let gpu = ''
  try {
    const ext = gl.getExtension('WEBGL_debug_renderer_info')
    gpu = String(gl.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER) ?? '')
  } catch {
    gpu = ''
  }
  const nav = navigator as Navigator & { deviceMemory?: number }
  const scr = typeof screen !== 'undefined' ? screen : undefined
  return {
    dpr: window.devicePixelRatio || 1,
    cores: nav.hardwareConcurrency || undefined,
    memGB: typeof nav.deviceMemory === 'number' ? nav.deviceMemory : undefined,
    gpu,
    minSide: scr ? Math.min(scr.width, scr.height) : Math.min(window.innerWidth, window.innerHeight),
  }
}
