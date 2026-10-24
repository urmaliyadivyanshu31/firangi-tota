// Builds the Focus tracks of the record's menu: calm nature recordings of the Indian subcontinent,
// each a seamless mono loop (public/audio/focus-<name>.m4a, AAC about 64 kbps), and a 30 s MP3
// listening sample of each in docs/screens/ (gitignored) with its loudness.
//
// The sources are CC0 Freesound recordings (listed in CREDITS.md). Fetch each one's HQ preview MP3
// into a folder as <sound id>.mp3, then:
//   FOCUS_SRC=/path/to/previews node dev/focus-assets.mjs
// Needs ffmpeg (with its native AAC encoder) on the PATH.
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = process.env.FOCUS_SRC
if (!SRC) throw new Error('set FOCUS_SRC to the folder of <id>.mp3 previews')
const tmp = mkdtempSync(join(process.env.TMPDIR ?? tmpdir(), 'focus-'))

const SR = 44100
const KBPS = 64
const LUFS = -26 // calm: the game's volume knob sets where it finally sits
const CEILING = -8 // dBFS: the AAC codec's overshoot still stays well under -6 dBFS

/**
 * Each track: one recording, a stretch from `ss` folded into a loop of `len` seconds with an
 * equal-power crossfade of `xf` seconds, high-passed (wind and handling rumble out) and low-passed
 * (the hiss and the hardest edges off, so it sits warm and far).
 */
const TRACKS = {
  // Kolkata, rain on a fibre roof at midnight: steady, close, no thunder
  rain: { id: 398581, ss: 12, len: 150, xf: 6, hp: 110, lp: 7000 },
  // a Goa hillside at sunrise: rising calls in the trees, a coucal far off, small birds
  sunrise: { id: 137116, ss: 165, len: 150, xf: 6, hp: 300, lp: 7500, ride: true, squash: -30 },
  // the Chalakudy river in Kerala: a slow steady flow, birds on the bank
  river: { id: 332419, ss: 1, len: 109, xf: 5, hp: 150, lp: 7500 },
  // a village garden after rain: tropical birds and crickets
  birds: { id: 451945, ss: 2, len: 143, xf: 6, hp: 220, lp: 9000, ride: true, squash: -34 },
  // a lakeside near Lonavala at night: crickets and insects
  crickets: { id: 732907, ss: 82, len: 150, xf: 6, hp: 400, lp: 8000, ride: true },
}

function ff(args, opts = {}) {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { maxBuffer: 1 << 30, ...opts })
  if (r.status !== 0) throw new Error(`ffmpeg ${args.join(' ')}\n${r.stderr}`)
  return r
}

function decode(id, ss, t, filters) {
  const r = ff(['-ss', String(ss), '-t', String(t), '-i', join(SRC, `${id}.mp3`), '-af', ['aformat=channel_layouts=mono', ...filters].join(','), '-ar', String(SR), '-f', 'f32le', '-'])
  return new Float32Array(r.stdout.buffer.slice(r.stdout.byteOffset, r.stdout.byteOffset + r.stdout.byteLength))
}

const chain = (o) => [
  `highpass=f=${o.hp}:poles=2`, `highpass=f=${o.hp}:poles=2`,
  `lowpass=f=${o.lp}:poles=2`, `lowpass=f=${o.lp}:poles=2`,
  // birdsong comes and goes: a slow hand on the level (about a 15 s window, at most 9 dB) keeps a
  // busy stretch from standing out of a quiet one, without pumping
  ...(o.ride ? ['dynaudnorm=f=1000:g=15:m=2.8:p=0.9:r=0.3'] : []),
  // a call close by (a bird at full cry) is brought nearer the rest: 3:1 above `squash` dBFS,
  // slow enough to keep each call's shape
  ...(o.squash ? [`acompressor=threshold=${(10 ** (o.squash / 20)).toFixed(4)}:ratio=3:attack=15:release=900:knee=6`] : []),
]

/** A look-ahead peak limiter (3 ms look-ahead, 120 ms release) that works around the loop. */
function limitLoop(x, ceiling) {
  const n = x.length
  const look = Math.round(0.003 * SR)
  const att = Math.exp(-1 / (0.0008 * SR))
  const rel = Math.exp(-1 / (0.12 * SR))
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

function writeWav(path, x) {
  const raw = join(tmp, 'raw.f32')
  writeFileSync(raw, Buffer.from(x.buffer, x.byteOffset, x.byteLength))
  ff(['-f', 'f32le', '-ar', String(SR), '-ac', '1', '-i', raw, path])
}

/** ffmpeg's EBU R128 reading of a file: integrated loudness and true peak. */
function measure(path) {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', path, '-af', 'ebur128=peak=true', '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 1 << 28 })
  const sum = r.stderr.slice(r.stderr.lastIndexOf('Summary:'))
  return { I: Number((sum.match(/I:\s+(-?[\d.]+) LUFS/) ?? [])[1] ?? -70), TP: Number((sum.match(/Peak:\s+(-?[\d.]+) dBFS/) ?? [])[1] ?? -70) }
}
function loudness(x) {
  const wav = join(tmp, 'm.wav')
  writeWav(wav, x)
  return measure(wav)
}
const scale = (x, g) => { for (let i = 0; i < x.length; i++) x[i] *= g; return x }

const samples = join(root, 'docs/screens')
mkdirSync(samples, { recursive: true })
for (const [name, o] of Object.entries(TRACKS)) {
  const n = Math.round(o.len * SR)
  const x = Math.round(o.xf * SR)
  const s = decode(o.id, o.ss, o.len + o.xf + 0.1, chain(o)).subarray(0, n + x)
  if (s.length < n + x) throw new Error(`${name}: source ${o.id} is too short from ${o.ss} s`)
  // the stretch just past the end crossfades into the start (equal power: these are noisy beds)
  const loop = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    if (i < x) {
      const k = i / x
      loop[i] = s[i] * Math.sin(k * Math.PI / 2) + s[n + i] * Math.cos(k * Math.PI / 2)
    } else loop[i] = s[i]
  }
  for (let pass = 0; pass < 3; pass++) {
    scale(loop, 10 ** ((LUFS - loudness(loop).I) / 20))
    limitLoop(loop, 10 ** (CEILING / 20))
  }
  const out = join(root, 'public/audio', `focus-${name}.m4a`)
  const wav = join(tmp, 'e.wav')
  writeWav(wav, loop)
  ff(['-i', wav, '-c:a', 'aac', '-b:a', `${KBPS}k`, '-ar', String(SR), '-ac', '1', '-movflags', '+faststart', out])
  // the listening sample: the first 30 s of the encoded file, as the game decodes it
  const mp3 = join(samples, `focus-${name}.mp3`)
  ff(['-i', out, '-t', '30', '-c:a', 'libmp3lame', '-b:a', '128k', mp3])
  const m = measure(out)
  const m30 = measure(mp3)
  console.log(`focus-${name}.m4a  ${o.len}s  I ${m.I.toFixed(1)} LUFS  TP ${m.TP.toFixed(1)} dBFS  ${(readFileSync(out).length / 1024).toFixed(0)} KB | sample I ${m30.I.toFixed(1)} TP ${m30.TP.toFixed(1)}`)
}
