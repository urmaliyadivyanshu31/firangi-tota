// Builds the recorded ambience: one natural bed per era (public/audio/<era>.m4a, a seamless mono
// loop) and the shared sprite of the room's small sounds (public/audio/room.m4a), whose clip map it
// writes to src/audio/room-sprite.ts.
//
// The sources are CC0 Freesound previews (listed in CREDITS.md). Fetch each one's HQ preview MP3
// into a folder as <sound id>.mp3, then:
//   AMB_SRC=/path/to/previews node dev/ambience-assets.mjs
// Needs ffmpeg (with its native AAC encoder) on the PATH.
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = process.env.AMB_SRC
if (!SRC) throw new Error('set AMB_SRC to the folder of <id>.mp3 previews')
const tmp = mkdtempSync(join(process.env.TMPDIR ?? tmpdir(), 'amb-'))

const BED_SR = 44100
const BED_KBPS = 48
const BED_LUFS = -24 // the file's level; the game sets the final level (src/audio/ambience.ts)
const BED_CEILING = -12.5 // dBFS: no peak more than 11.5 dB over the bed's loudness
const SPRITE_SR = 22050
const SPRITE_KBPS = 32
const SPRITE_GAP = 0.45 // silence between clips, so a clip started a codec frame early never bleeds
const XFADE = 2.5 // the loop's crossfade, seconds

/**
 * Each bed is one or two recordings, filtered, levelled against each other (`db` is relative to the
 * first layer), summed and folded into a loop of `len` seconds.
 */
const BEDS = {
  // a Mughal garden fountain: a soft two-tier trickle, warm (the high splashes taken off)
  'delhi-1857': { len: 40, layers: [{ id: 434815, ss: 8, hp: 110, lp: 5200 }] },
  // a light breeze at the window: wind moving through a field, no gusts
  'lahore-1929': { len: 40, layers: [{ id: 447810, ss: 6, hp: 160, lp: 4200 }] },
  // steady monsoon rain close by, the sea breathing far off under it
  'bombay-1942': { len: 40, layers: [{ id: 825226, ss: 4, hp: 190, lp: 4200, notch: 102 }, { id: 578524, ss: 24, hp: 50, lp: 520, db: -5 }] },
  // soft rain on the roofs outside, heard through a closed window
  'delhi-1947': { len: 34, layers: [{ id: 669485, ss: 36, hp: 160, lp: 2600 }] },
}

/**
 * The recorded musical beds (public/audio/<era>-music.m4a): real instruments, each loop cut on a
 * whole number of the instrument's own cycles. 1942's low pad is synthesized instead.
 */
const MUSIC = {
  // a tanpura in C# tuned to Pa: ten rounds of its four strings (3.85 s each)
  'delhi-1857': { len: 38.5, layers: [{ id: 153262, ss: 2, hp: 60, lp: 6500 }] },
  // a harmonium drone, lowered from C# to A (a slower breath), its reeds brought forward so a
  // phone's small speaker still carries it
  'lahore-1929': { len: 32, layers: [{ id: 264442, ss: 4, hp: 140, lp: 5000, shelf: [450, 6], rate: 0.7937 }] },
  // a tanpura in E tuned to Pa: four rounds (4.52 s each)
  'delhi-1947': { len: 18.08, layers: [{ id: 148850, ss: 1, hp: 50, lp: 6500 }] },
}
const MUSIC_SR = 22050
const MUSIC_KBPS = 32

/**
 * The room's small sounds: [name, source id, start, duration, filters]. `fi`/`fo` are the fades in
 * and out; `comp` tames the transient (a cup's clink, a page's flick) so the sound reads at a low
 * level without a sharp peak.
 */
const CLIPS = [
  ['page', 840192, 0.05, 1.45, { hp: 160, lp: 8000, fi: 0.12, fo: 0.3, comp: [-26, 6] }],
  ['pen', 750171, 2.0, 2.6, { hp: 300, lp: 7000, fi: 0.35, fo: 0.6, comp: true }],
  ['pencil', 376705, 3.0, 2.6, { hp: 300, lp: 7000, fi: 0.35, fo: 0.6, comp: true }],
  ['creak', 590171, 0.0, 3.0, { hp: 120, lp: 5000, fi: 0.1, fo: 0.5 }],
  ['chair', 556763, 1.75, 1.5, { hp: 150, lp: 5000, fi: 0.12, fo: 0.4, comp: true }],
  ['cup', 460241, 0.35, 2.75, { hp: 200, lp: 7500, fi: 0.1, fo: 0.6, comp: [-28, 8] }],
  ['pour', 330025, 0.0, 3.9, { hp: 200, lp: 7000, fi: 0.4, fo: 0.8, comp: [-22, 4] }],
  ['stir', 444892, 1.6, 1.4, { hp: 300, lp: 7500, fi: 0.1, fo: 0.4, comp: [-26, 6] }],
  ['steps', 467417, 2.0, 4.6, { hp: 120, lp: 3000, fi: 1.3, fo: 1.6, comp: [-24, 5] }],
  ['door', 397918, 0.0, 1.9, { hp: 90, lp: 2600, fi: 0.2, fo: 0.5, comp: true }],
  ['cough', 98676, 0.0, 2.1, { hp: 150, lp: 2800, fi: 0.15, fo: 0.5, comp: true }],
  ['murmur', 260124, 2.0, 6.0, { hp: 150, lp: 650, fi: 1.6, fo: 2.0 }],
  ['wings', 561009, 0.0, 2.1, { hp: 200, lp: 6000, fi: 0.2, fo: 0.5, comp: [-24, 5] }],
  ['bangles', 175435, 10.0, 1.6, { hp: 600, lp: 7000, fi: 0.15, fo: 0.5, comp: true }],
  ['hookah', 417603, 0.3, 2.5, { hp: 120, lp: 2400, fi: 0.4, fo: 0.7, comp: [-24, 5] }],
  ['sparrows', 670176, 0.2, 2.8, { hp: 1400, lp: 8500, fi: 0.2, fo: 0.6, comp: [-22, 4] }],
  ['dove', 735366, 0.75, 2.7, { hp: 250, lp: 3500, fi: 0.25, fo: 0.6 }],
  ['robin', 478637, 6.7, 2.6, { hp: 1400, lp: 8500, fi: 0.3, fo: 0.8 }],
  ['myna', 752071, 8.2, 2.4, { hp: 1000, lp: 7500, fi: 0.25, fo: 0.6 }],
  ['bell', 378912, 0.25, 1.9, { hp: 400, lp: 3200, fi: 0.02, fo: 0.6, comp: true }],
]

function ff(args, opts = {}) {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { maxBuffer: 1 << 30, ...opts })
  if (r.status !== 0) throw new Error(`ffmpeg ${args.join(' ')}\n${r.stderr}`)
  return r
}

/** Decodes a stretch of a source to mono float samples through the given filters. */
function decode(id, ss, t, sr, filters) {
  const r = ff(['-ss', String(ss), '-t', String(t), '-i', join(SRC, `${id}.mp3`), '-af', ['aformat=channel_layouts=mono', ...filters].join(','), '-ar', String(sr), '-f', 'f32le', '-'])
  return new Float32Array(r.stdout.buffer.slice(r.stdout.byteOffset, r.stdout.byteOffset + r.stdout.byteLength))
}

function chain(o) {
  const f = []
  if (o.hp) f.push(`highpass=f=${o.hp}:poles=2`, `highpass=f=${o.hp}:poles=2`)
  if (o.notch) f.push(`bandreject=f=${o.notch}:width_type=q:w=4`, `bandreject=f=${o.notch * 2}:width_type=q:w=4`)
  if (o.shelf) f.push(`highshelf=f=${o.shelf[0]}:g=${o.shelf[1]}`)
  if (o.lp) f.push(`lowpass=f=${o.lp}:poles=2`, `lowpass=f=${o.lp}:poles=2`)
  return f
}

/**
 * Takes the edge off a transient: a look-ahead compressor (0.8 ms attack, 90 ms release) on the
 * clip normalised to a full-scale peak, so a clink or a flick keeps its body and loses its spike.
 */
function tame(x, sr, thresholdDb = -20, ratio = 5) {
  const pk = Math.max(1e-6, x.reduce((p, v) => Math.max(p, Math.abs(v)), 0))
  const look = Math.round(0.002 * sr)
  const att = Math.exp(-1 / (0.0008 * sr))
  const rel = Math.exp(-1 / (0.09 * sr))
  const T = 10 ** (thresholdDb / 20)
  const out = new Float32Array(x.length)
  let env = 0
  for (let i = 0; i < x.length; i++) {
    const a = Math.abs(x[Math.min(x.length - 1, i + look)]) / pk
    env = a > env ? att * env + (1 - att) * a : rel * env + (1 - rel) * a
    const g = env > T ? (T * (env / T) ** (1 / ratio)) / env : 1
    out[i] = (x[i] / pk) * g
  }
  return out
}

/**
 * A look-ahead peak limiter (3 ms look-ahead, 80 ms release) that works around the loop, so the
 * gain at the seam is the same on both sides of it.
 */
function limitLoop(x, sr, ceiling) {
  const n = x.length
  const look = Math.round(0.003 * sr)
  const att = Math.exp(-1 / (0.0008 * sr))
  const rel = Math.exp(-1 / (0.08 * sr))
  // the gain each sample needs, then the smallest over the look-ahead window, then a smooth release
  const need = new Float32Array(n)
  for (let i = 0; i < n; i++) need[i] = Math.min(1, ceiling / Math.max(1e-9, Math.abs(x[i])))
  const g = new Float32Array(n)
  let cur = 1
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < n; i++) {
      let m = 1
      for (let k = 0; k <= look; k++) m = Math.min(m, need[(i + k) % n])
      cur = m < cur ? att * cur + (1 - att) * m : rel * cur + (1 - rel) * m
      g[i] = cur
    }
  }
  for (let i = 0; i < n; i++) x[i] *= g[i]
}

function writeWav(path, x, sr) {
  const raw = join(tmp, 'raw.f32')
  writeFileSync(raw, Buffer.from(x.buffer, x.byteOffset, x.byteLength))
  ff(['-f', 'f32le', '-ar', String(sr), '-ac', '1', '-i', raw, path])
}

/** ffmpeg's EBU R128 reading of a mono buffer: integrated, momentary max, true peak. */
function loudness(x, sr) {
  const wav = join(tmp, 'm.wav')
  writeWav(wav, x, sr)
  const r = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-v', 'verbose', '-i', wav, '-af', 'ebur128=peak=true:framelog=verbose', '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 1 << 28 })
  const s = r.stderr
  let mMax = -Infinity
  for (const m of s.matchAll(/M:\s*(-?[\d.]+)/g)) mMax = Math.max(mMax, Number(m[1]))
  const sum = s.slice(s.lastIndexOf('Summary:'))
  return { I: Number((sum.match(/I:\s+(-?[\d.]+) LUFS/) ?? [])[1] ?? -70), M: mMax, TP: Number((sum.match(/Peak:\s+(-?[\d.]+) dBFS/) ?? [])[1] ?? -70) }
}

const peakOf = (x) => x.reduce((p, v) => Math.max(p, Math.abs(v)), 0)
const scale = (x, g) => { for (let i = 0; i < x.length; i++) x[i] *= g; return x }
const db = (g) => 20 * Math.log10(g)

function encodeM4a(x, sr, kbps, out) {
  const wav = join(tmp, 'e.wav')
  writeWav(wav, x, sr)
  ff(['-i', wav, '-c:a', 'aac', '-b:a', `${kbps}k`, '-ar', String(sr), '-ac', '1', '-movflags', '+faststart', out])
}

/**
 * Folds recordings into a seamless loop of `len` seconds and writes it as AAC. `rate` below 1 lowers
 * a recording's pitch (and slows it) by resampling. `correlated` loops (an instrument cut on its own
 * cycle) crossfade at equal gain; noise beds at equal power.
 */
function makeLoop(file, { len, layers, correlated }, sr, kbps, ceilingDb = BED_CEILING) {
  const n = Math.round(len * sr)
  const x = Math.round(XFADE * sr)
  let mix = null
  let ref = null
  for (const layer of layers) {
    const rate = layer.rate ?? 1
    const pre = rate === 1 ? [] : ['aresample=44100', `asetrate=${Math.round(44100 * rate)}`]
    const s = decode(layer.id, layer.ss, (len + XFADE + 0.1) * rate, sr, [...pre, ...chain(layer)]).subarray(0, n + x)
    if (s.length < n + x) throw new Error(`${file}: source ${layer.id} is too short from ${layer.ss} s`)
    const L = loudness(s, sr).I
    if (ref === null) ref = L
    scale(s, 10 ** ((ref + (layer.db ?? 0) - L) / 20))
    if (!mix) mix = Float32Array.from(s)
    else for (let i = 0; i < mix.length; i++) mix[i] += s[i] ?? 0
  }
  // the stretch just past the end crossfades into the start, so the last sample runs on into the first
  const loop = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    if (i < x) {
      const k = i / x
      const [a, b] = correlated ? [k, 1 - k] : [Math.sin(k * Math.PI / 2), Math.cos(k * Math.PI / 2)]
      loop[i] = mix[i] * a + mix[n + i] * b
    } else loop[i] = mix[i]
  }
  // levelled, then the odd splash or heavy drop taken down so no peak stands out of the bed
  scale(loop, 10 ** ((BED_LUFS - loudness(loop, sr).I) / 20))
  limitLoop(loop, sr, 10 ** (ceilingDb / 20))
  scale(loop, 10 ** ((BED_LUFS - loudness(loop, sr).I) / 20))
  limitLoop(loop, sr, 10 ** (ceilingDb / 20))
  const out = join(root, 'public/audio', file)
  encodeM4a(loop, sr, kbps, out)
  const m = loudness(loop, sr)
  console.log(`${file.padEnd(22)} ${len}s  I ${m.I.toFixed(1)} LUFS  TP ${m.TP.toFixed(1)} dBFS  ${(readFileSync(out).length / 1024).toFixed(0)} KB`)
}

for (const [era, bed] of Object.entries(BEDS)) makeLoop(`${era}.m4a`, bed, BED_SR, BED_KBPS)
for (const [era, music] of Object.entries(MUSIC)) makeLoop(`${era}-music.m4a`, { ...music, correlated: true }, MUSIC_SR, MUSIC_KBPS, -10)

// ---------- the room sprite ----------
const pieces = []
const map = {}
let at = SPRITE_GAP
for (const [name, id, ss, t, o] of CLIPS) {
  if (!t) continue
  let s = decode(id, ss, t, SPRITE_SR, chain(o))
  if (o.comp) s = tame(s, SPRITE_SR, ...(Array.isArray(o.comp) ? o.comp : []))
  const fi = Math.round((o.fi ?? 0.1) * SPRITE_SR)
  const fo = Math.round((o.fo ?? 0.3) * SPRITE_SR)
  for (let i = 0; i < fi && i < s.length; i++) s[i] *= Math.sin((i / fi) * Math.PI / 2) ** 2
  for (let i = 0; i < fo && i < s.length; i++) s[s.length - 1 - i] *= Math.sin((i / fo) * Math.PI / 2) ** 2
  // every clip peaks at -3 dBFS in the sprite (the most of the codec); its loudness is recorded so
  // the game can set each one's level by ear-weighted loudness, not by peak
  scale(s, 0.708 / Math.max(1e-6, peakOf(s)))
  const m = loudness(s, SPRITE_SR)
  map[name] = [+at.toFixed(3), +(s.length / SPRITE_SR).toFixed(3), +m.M.toFixed(1)]
  pieces.push(new Float32Array(Math.round(SPRITE_GAP * SPRITE_SR)), s)
  at += s.length / SPRITE_SR + SPRITE_GAP
  console.log(`  ${name.padEnd(9)} ${String(id).padEnd(7)} ${(s.length / SPRITE_SR).toFixed(2)}s  M max ${m.M.toFixed(1)} LUFS, peak to M ${(-3 - m.M).toFixed(1)} dB`)
}
pieces.push(new Float32Array(Math.round(SPRITE_GAP * SPRITE_SR)))
const total = pieces.reduce((a, p) => a + p.length, 0)
const sprite = new Float32Array(total)
let o = 0
for (const p of pieces) { sprite.set(p, o); o += p.length }
const spriteOut = join(root, 'public/audio/room.m4a')
encodeM4a(sprite, SPRITE_SR, SPRITE_KBPS, spriteOut)
console.log(`room.m4a  ${(total / SPRITE_SR).toFixed(1)}s  ${(readFileSync(spriteOut).length / 1024).toFixed(0)} KB`)

const names = Object.keys(map)
writeFileSync(join(root, 'src/audio/room-sprite.ts'), `// Generated by dev/ambience-assets.mjs: do not edit by hand.
// The room's small sounds in public/audio/room.m4a (CC0 recordings, see CREDITS.md). Each clip is
// [start s, duration s, momentary max loudness in LUFS at its -3 dBFS peak in the file].

export const ROOM_FILE = 'room.m4a'

export type RoomClip = ${names.map((n) => `'${n}'`).join(' | ')}

export const ROOM: Record<RoomClip, readonly [number, number, number]> = {
${names.map((n) => `  ${n}: [${map[n].join(', ')}],`).join('\n')}
}
`)
console.log('wrote src/audio/room-sprite.ts')
