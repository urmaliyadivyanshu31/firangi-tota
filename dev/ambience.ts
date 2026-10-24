// Renders an era's ambience offline (OfflineAudioContext), through the game's own code and the
// master level, and hands back a 16-bit stereo WAV as base64 with the room sounds it played.
// Driven by dev/ambience-render.mjs.
import { MUSIC_FILES, startAmbience, type AmbienceOptions } from '../src/audio/ambience'
import { ROOM, ROOM_FILE, type RoomClip } from '../src/audio/room-sprite'
import type { Later } from '../src/audio/ambience-synth'
import type { EraId } from '../src/content/types'

const SR = 48000
const MASTER_LEVEL = 0.8 // as src/audio/engine.ts

interface RenderRequest {
  era: EraId
  seconds: number
  burstGap?: [number, number]
  layers?: AmbienceOptions['layers']
  /** Seeds the room's choices, so a render can be repeated. */
  seed?: number
}

function mulberry(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function wav16(buf: AudioBuffer): string {
  const ch = buf.numberOfChannels
  const n = buf.length
  const out = new DataView(new ArrayBuffer(44 + n * ch * 2))
  const str = (o: number, s: string): void => { for (let i = 0; i < s.length; i++) out.setUint8(o + i, s.charCodeAt(i)) }
  str(0, 'RIFF'); out.setUint32(4, 36 + n * ch * 2, true); str(8, 'WAVE'); str(12, 'fmt ')
  out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, ch, true); out.setUint32(24, buf.sampleRate, true)
  out.setUint32(28, buf.sampleRate * ch * 2, true); out.setUint16(32, ch * 2, true); out.setUint16(34, 16, true); str(36, 'data'); out.setUint32(40, n * ch * 2, true)
  const data = Array.from({ length: ch }, (_, c) => buf.getChannelData(c))
  let o = 44
  for (let i = 0; i < n; i++) {
    for (let c = 0; c < ch; c++) {
      const v = Math.max(-1, Math.min(1, data[c]![i]!))
      out.setInt16(o, v < 0 ? v * 0x8000 : v * 0x7fff, true)
      o += 2
    }
  }
  const bytes = new Uint8Array(out.buffer)
  let s = ''
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  return btoa(s)
}

async function render(req: RenderRequest): Promise<{ wav: string; events: string[] }> {
  const ctx = new OfflineAudioContext(2, Math.round(req.seconds * SR), SR)
  const master = ctx.createGain()
  master.gain.value = MASTER_LEVEL
  master.connect(ctx.destination)
  const cache = new Map<string, Promise<AudioBuffer | null>>()
  const loadBed = (file: string): Promise<AudioBuffer | null> => {
    let p = cache.get(file)
    if (!p) {
      p = fetch(`/audio/${file}`).then((r) => r.arrayBuffer()).then((d) => ctx.decodeAudioData(d)).catch(() => null)
      cache.set(file, p)
    }
    return p
  }
  // load before the clock starts, as a returning player's cached files would
  const music = MUSIC_FILES[req.era]
  await Promise.all([loadBed(`${req.era}.m4a`), loadBed('room.m4a'), music ? loadBed(music[0]) : null])

  // the scheduler's timers become suspensions of the offline clock, one per render quantum
  const q = 128 / SR
  const due = new Map<number, Array<() => void>>()
  const later: Later = (ms, fn) => {
    const t = Math.max(ctx.currentTime + q, Math.ceil((ctx.currentTime + ms / 1000) / q) * q)
    if (t >= req.seconds) return
    const key = Math.round(t / q)
    let list = due.get(key)
    if (!list) {
      list = []
      due.set(key, list)
      void ctx.suspend(key * q).then(() => {
        const fns = due.get(key) ?? []
        due.delete(key)
        for (const f of fns) f()
        void ctx.resume()
      })
    }
    list.push(fn)
  }
  // note which room sound starts when (a clip is known by its start in the sprite; the tonga bell
  // is the only synthesized one, a 1568 Hz oscillator)
  const events: string[] = []
  const room = await loadBed(ROOM_FILE)
  const make = ctx.createBufferSource.bind(ctx)
  ctx.createBufferSource = () => {
    const src = make()
    const start = src.start.bind(src)
    src.start = (when?: number, offset?: number, duration?: number) => {
      const clip = src.buffer === room ? (Object.keys(ROOM) as RoomClip[]).find((k) => ROOM[k][0] === offset) : undefined
      if (clip) events.push(`${(when ?? 0).toFixed(1)}s ${clip}`)
      start(when, offset, duration)
    }
    return src
  }
  const makeOsc = ctx.createOscillator.bind(ctx)
  let lastBell = -9
  ctx.createOscillator = () => {
    const osc = makeOsc()
    const start = osc.start.bind(osc)
    osc.start = (when?: number) => {
      if (osc.frequency.value === 1568 && (when ?? 0) - lastBell > 1) { lastBell = when ?? 0; events.push(`${lastBell.toFixed(1)}s tonga bell`) }
      start(when)
    }
    return osc
  }
  startAmbience(ctx as unknown as AudioContext, master, req.era, loadBed, {
    later,
    random: mulberry(req.seed ?? 1),
    burstGap: req.burstGap,
    canBurst: () => true,
    layers: req.layers,
  })
  await new Promise((r) => setTimeout(r, 50)) // the loaded bed's start runs in a microtask
  const out = await ctx.startRendering()
  return { wav: wav16(out), events }
}

;(window as unknown as { renderAmbience: typeof render }).renderAmbience = render
document.getElementById('status')!.textContent = 'ready'
