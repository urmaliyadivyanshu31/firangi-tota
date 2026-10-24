// Web Audio synthesis: every cue and every procedural ambience layer.
// Pure scheduling helpers: they take a context and a destination node and never touch globals.
import type { EraId } from '../content/types'
import { BUGLE_FIGURES_MS, DRUM_ACCENT_MS, KNOCK_RAPS_MS, PHONE_RINGS_MS, WAIL_RISE_MS, type KnockKind } from '../scene/caught'

export type Cue =
  | 'arrive' | 'stampAsli' | 'stampTota' | 'tick' | 'correct' | 'survived' | 'page'
  // the stage's choreography: the 1947 typewriter, the 1857 seal, the 1929 note, the 1942 envelope,
  // and the day title pressed onto the wall
  | 'typeKey' | 'typeSpace' | 'typeDing' | 'typeReturn' | 'sealCrack' | 'paperUnfold' | 'envelopeFlap' | 'titleSettle'
  // the interface: the case file or rulebook opening, a card or tab turning, the rubber stamp
  // buttons, a toggle, the language plaque
  | 'fileOpen' | 'cardTurn' | 'stampPress' | 'toggleClick' | 'plaqueFlick'
  // the agarbatti timer: a faint crackle all through, a clock tick under 30%, a rising tick at the end
  | 'incense' | 'clockTick' | 'tensionTick'
  // the caught or survived telegram arriving on the teleprinter
  | 'endTelegram'
  // the caught sequence (src/scene/caught.ts): each era's alarm, the knocks coming closer, then the
  // alarm cut off and a low swell under the quiet
  | 'bugleAlarm' | 'kettleDrum' | 'whistleShort' | 'whistleLong' | 'bootsRunning' | 'airRaidWail' | 'phoneBell'
  | 'knockFar' | 'knockNear' | 'knockDoor' | 'caughtHush' | 'caughtDark'
  // after Begin: an intro card slid across the desk, the paper clip snapping onto the YOU photo
  | 'cardSlide' | 'clipSnap'
  // the read paper screwed up in the hands (one per squeeze), flicked from the hand, and landing as a
  // ball in the basket
  | 'paperCrumple' | 'paperFlick' | 'ballLand'
  // a reward landing on the desk after a right stamp: a coin's clink, a jackpot's brighter shower, a
  // sweet box or packet set down
  | 'coinClink' | 'jackpotClink' | 'boxSoft'

/** What some cues need to know: the era (the day title's settle) and how close the end is (0..1). */
export interface CueOptions {
  era?: EraId | null
  level?: number
}

/** The cues the typewriter sprite plays (synthesized here only until it has loaded). */
export const SAMPLED_CUES = ['typeKey', 'typeSpace', 'typeDing', 'typeReturn'] as const

export interface Stoppable { stop(): void }

let noiseCache: WeakMap<BaseAudioContext, AudioBuffer> = new WeakMap()
// the caught sequence's alarm plays through one gain per context, so the dark (or a skip) can cut
// every sound still ringing at once; a hushed bus is dropped and the next alarm gets a fresh one
let caughtBuses: WeakMap<BaseAudioContext, GainNode> = new WeakMap()

/** Two seconds of white noise, cached per context. */
export function noiseBuffer(ctx: BaseAudioContext): AudioBuffer {
  const hit = noiseCache.get(ctx)
  if (hit) return hit
  const len = Math.max(1, Math.floor(ctx.sampleRate * 2))
  const buf = ctx.createBuffer(1, len, ctx.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
  noiseCache.set(ctx, buf)
  return buf
}

/** For tests that swap the context between runs. */
export function resetSynthCache(): void {
  noiseCache = new WeakMap()
  caughtBuses = new WeakMap()
}

function env(ctx: BaseAudioContext, dest: AudioNode, t: number, peak: number, attack: number, decay: number): GainNode {
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.linearRampToValueAtTime(peak, t + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay)
  g.connect(dest)
  return g
}

function noiseBurst(ctx: BaseAudioContext, dest: AudioNode, t: number, o: {
  type: BiquadFilterType; freq: number; q?: number; peak: number; attack: number; decay: number
}): void {
  const src = ctx.createBufferSource()
  src.buffer = noiseBuffer(ctx)
  const f = ctx.createBiquadFilter()
  f.type = o.type
  f.frequency.value = o.freq
  f.Q.value = o.q ?? 1
  const g = env(ctx, dest, t, o.peak, o.attack, o.decay)
  src.connect(f)
  f.connect(g)
  src.start(t, Math.random() * 1.5)
  src.stop(t + o.attack + o.decay + 0.05)
}

function tone(ctx: BaseAudioContext, dest: AudioNode, t: number, o: {
  type: OscillatorType; from: number; to?: number; peak: number; attack: number; decay: number
}): void {
  const osc = ctx.createOscillator()
  osc.type = o.type
  osc.frequency.setValueAtTime(o.from, t)
  if (o.to !== undefined) osc.frequency.exponentialRampToValueAtTime(o.to, t + o.attack + o.decay)
  const g = env(ctx, dest, t, o.peak, o.attack, o.decay)
  osc.connect(g)
  osc.start(t)
  osc.stop(t + o.attack + o.decay + 0.05)
}

// ---------- cues (all <= 1.2 s, survived <= 3 s) ----------

/** Dry paper rustle: filtered noise with a few uneven swells. */
function rustle(ctx: BaseAudioContext, dest: AudioNode, t: number, length: number, peak: number): void {
  const swells = 4
  for (let i = 0; i < swells; i++) {
    const at = t + (i / swells) * length * 0.8 + Math.random() * 0.03
    noiseBurst(ctx, dest, at, {
      type: 'bandpass', freq: 3200 + Math.random() * 1800, q: 0.7,
      peak: peak * (0.6 + Math.random() * 0.4), attack: 0.02, decay: length / swells,
    })
  }
}

let tickTock = false

/** The day title settling, in each era's own voice. */
function titleSettle(ctx: BaseAudioContext, dest: AudioNode, t: number, era: EraId | null): void {
  if (era === 'delhi-1857') {
    // a single low tabla "dha": the bayan's bent boom under the dayan's ring
    tone(ctx, dest, t, { type: 'sine', from: 118, to: 82, peak: 0.26, attack: 0.004, decay: 0.42 })
    tone(ctx, dest, t, { type: 'sine', from: 392, peak: 0.09, attack: 0.002, decay: 0.3 })
    tone(ctx, dest, t, { type: 'sine', from: 392 * 2.02, peak: 0.03, attack: 0.002, decay: 0.16 })
    noiseBurst(ctx, dest, t, { type: 'bandpass', freq: 1200, q: 1, peak: 0.05, attack: 0.001, decay: 0.03 })
  } else if (era === 'bombay-1942') {
    // a radio knob turned home: a muffled clunk and a breath of static
    tone(ctx, dest, t, { type: 'sine', from: 140, to: 80, peak: 0.16, attack: 0.003, decay: 0.12 })
    noiseBurst(ctx, dest, t + 0.03, { type: 'bandpass', freq: 2200, q: 0.5, peak: 0.04, attack: 0.02, decay: 0.2 })
  } else {
    // type settling into the forme: a felted low thock and a small clack
    tone(ctx, dest, t, { type: 'sine', from: 130, to: 72, peak: 0.2, attack: 0.004, decay: 0.16 })
    noiseBurst(ctx, dest, t, { type: 'lowpass', freq: 700, peak: 0.1, attack: 0.003, decay: 0.08 })
    noiseBurst(ctx, dest, t + 0.05, { type: 'bandpass', freq: 2600, q: 2, peak: 0.05, attack: 0.001, decay: 0.02 })
  }
}

// ---------- occasional era one-shots, far off and low ----------

/** A horse passing at a walk in the lane: hooves on packed earth. */
export function hooves(ctx: BaseAudioContext, dest: AudioNode, t: number): void {
  for (let i = 0; i < 8; i++) {
    const at = t + i * 0.28 + (i % 2) * 0.09
    noiseBurst(ctx, dest, at, { type: 'bandpass', freq: 900 + Math.random() * 300, q: 2, peak: 0.05, attack: 0.002, decay: 0.04 })
    tone(ctx, dest, at, { type: 'sine', from: 160, to: 110, peak: 0.03, attack: 0.002, decay: 0.05 })
  }
}

/** Two or three far crows: a nasal, falling "kaa". */
export function crows(ctx: BaseAudioContext, dest: AudioNode, t: number): void {
  const n = 2 + Math.floor(Math.random() * 2)
  for (let i = 0; i < n; i++) {
    const at = t + i * (0.42 + Math.random() * 0.2)
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 1500
    bp.Q.value = 3
    const g = env(ctx, dest, at, 0.035, 0.02, 0.26)
    bp.connect(g)
    const osc = ctx.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(560, at)
    osc.frequency.exponentialRampToValueAtTime(380, at + 0.28)
    osc.connect(bp)
    osc.start(at)
    osc.stop(at + 0.32)
  }
}

/** A small bell rung twice (a tonga's, a bicycle's: `quick` rings it fast, like a thumb bell). */
export function smallBell(ctx: BaseAudioContext, dest: AudioNode, t: number, freq: number, quick: boolean): void {
  const n = quick ? 4 : 2
  for (let i = 0; i < n; i++) brassTing(ctx, dest, t + i * (quick ? 0.07 : 0.32), freq, 0.03)
}

/** A steam train's whistle far across the city: two notes, low-passed by the distance. */
export function trainWhistle(ctx: BaseAudioContext, dest: AudioNode, t: number): void {
  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 1400
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.linearRampToValueAtTime(0.03, t + 0.25)
  g.gain.setValueAtTime(0.03, t + 1.4)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 2.1)
  lp.connect(g)
  g.connect(dest)
  for (const f of [523, 659]) {
    const osc = ctx.createOscillator()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(f * 0.97, t)
    osc.frequency.linearRampToValueAtTime(f, t + 0.3)
    osc.connect(lp)
    osc.start(t)
    osc.stop(t + 2.2)
  }
}

/** A tram's foot gong: two heavy clangs. */
export function tramBell(ctx: BaseAudioContext, dest: AudioNode, t: number): void {
  for (const at of [t, t + 0.35]) brassTing(ctx, dest, at, 620, 0.04)
}

/** A far-off air-raid siren on its test: one slow rise and fall, barely over the bed. */
export function arpSiren(ctx: BaseAudioContext, dest: AudioNode, t: number): void {
  siren(ctx, dest, t, 4.5, 0.012)
}

/** A long wash: the sea on the rocks below Marine Drive, or a gust of rain on the window. */
export function wash(ctx: BaseAudioContext, dest: AudioNode, t: number, freq: number, len: number, peak: number): void {
  noiseBurst(ctx, dest, t, { type: 'bandpass', freq, q: 0.5, peak, attack: len * 0.4, decay: len * 0.6 })
}

/** Thunder a long way off: a low rumble that rolls. */
export function thunder(ctx: BaseAudioContext, dest: AudioNode, t: number): void {
  for (let i = 0; i < 3; i++) noiseBurst(ctx, dest, t + i * 0.35, { type: 'lowpass', freq: 140 + i * 30, peak: 0.07 - i * 0.015, attack: 0.15, decay: 1.4 })
}

/** A small brass bell: inharmonic partials, the higher ones dying first. */
function brassTing(ctx: BaseAudioContext, dest: AudioNode, t: number, freq: number, peak: number): void {
  const partials: Array<[number, number, number]> = [[1, 1, 0.75], [2.01, 0.42, 0.5], [2.76, 0.3, 0.38], [5.4, 0.12, 0.16], [8.93, 0.05, 0.08]]
  for (const [ratio, level, decay] of partials) {
    tone(ctx, dest, t, { type: 'sine', from: freq * ratio, peak: peak * level, attack: 0.002, decay })
  }
}

/** A wailing siren through a soft low-pass: up, then down, never harsh. */
function siren(ctx: BaseAudioContext, dest: AudioNode, t: number, len: number, peak: number): void {
  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 1900
  lp.Q.value = 0.7
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.linearRampToValueAtTime(peak, t + 0.09)
  g.gain.setValueAtTime(peak, t + len - 0.28)
  g.gain.exponentialRampToValueAtTime(0.0001, t + len)
  lp.connect(g)
  g.connect(dest)
  for (const [type, detune, level] of [['sawtooth', -5, 0.7], ['triangle', 5, 1]] as const) {
    const osc = ctx.createOscillator()
    osc.type = type
    osc.detune.value = detune
    osc.frequency.setValueAtTime(430, t)
    osc.frequency.linearRampToValueAtTime(860, t + len * 0.45)
    osc.frequency.linearRampToValueAtTime(400, t + len)
    const og = ctx.createGain()
    og.gain.value = level
    osc.connect(og)
    og.connect(lp)
    osc.start(t)
    osc.stop(t + len + 0.05)
  }
}

function pluck(ctx: BaseAudioContext, dest: AudioNode, t: number, freq: number, peak: number, decay: number): void {
  tone(ctx, dest, t, { type: 'triangle', from: freq, peak, attack: 0.005, decay })
  tone(ctx, dest, t, { type: 'sine', from: freq * 2, peak: peak * 0.3, attack: 0.005, decay: decay * 0.6 })
}

export function playCue(ctx: BaseAudioContext, dest: AudioNode, cue: Cue, o: CueOptions = {}): void {
  const t = ctx.currentTime + 0.01
  switch (cue) {
    case 'fileOpen':
      // a stiff card file opened: a dry rustle with a little body
      rustle(ctx, dest, t, 0.42, 0.15)
      tone(ctx, dest, t, { type: 'sine', from: 190, to: 120, peak: 0.07, attack: 0.01, decay: 0.12 })
      break
    case 'cardTurn':
      // a card turned over: a short swish and a soft landing
      noiseBurst(ctx, dest, t, { type: 'bandpass', freq: 2400, q: 0.8, peak: 0.1, attack: 0.03, decay: 0.09 })
      tone(ctx, dest, t + 0.1, { type: 'sine', from: 160, to: 100, peak: 0.08, attack: 0.003, decay: 0.06 })
      break
    case 'stampPress':
      // the rubber stamp button: a squashy rubber press and a muffled thunk
      tone(ctx, dest, t, { type: 'sine', from: 125, to: 62, peak: 0.32, attack: 0.006, decay: 0.13 })
      noiseBurst(ctx, dest, t, { type: 'lowpass', freq: 650, peak: 0.16, attack: 0.004, decay: 0.06 })
      break
    case 'toggleClick':
      // a small wooden toggle
      noiseBurst(ctx, dest, t, { type: 'bandpass', freq: 1800, q: 3, peak: 0.12, attack: 0.001, decay: 0.018 })
      tone(ctx, dest, t, { type: 'sine', from: 900, to: 600, peak: 0.05, attack: 0.001, decay: 0.03 })
      break
    case 'plaqueFlick':
      // a brass plaque flipped over: a metal flick and a short bright ring
      noiseBurst(ctx, dest, t, { type: 'highpass', freq: 3000, q: 0.8, peak: 0.08, attack: 0.001, decay: 0.015 })
      brassTing(ctx, dest, t + 0.01, 1568, 0.05)
      break
    case 'incense':
      // the agarbatti, barely there: one or two tiny crackles
      noiseBurst(ctx, dest, t + Math.random() * 0.2, { type: 'highpass', freq: 4200, q: 0.6, peak: 0.025 + Math.random() * 0.02, attack: 0.001, decay: 0.01 })
      if (Math.random() < 0.4) noiseBurst(ctx, dest, t + 0.25 + Math.random() * 0.4, { type: 'highpass', freq: 5000, q: 0.6, peak: 0.02, attack: 0.001, decay: 0.008 })
      break
    case 'clockTick': {
      // a wall clock: tick and tock alternate
      tickTock = !tickTock
      noiseBurst(ctx, dest, t, { type: 'bandpass', freq: tickTock ? 2600 : 2100, q: 4, peak: 0.08, attack: 0.001, decay: 0.02 })
      break
    }
    case 'tensionTick': {
      // the last seconds: a tick that rises a little each time, never loud
      const k = Math.max(0, Math.min(1, o.level ?? 0))
      tone(ctx, dest, t, { type: 'triangle', from: 660 + 440 * k, peak: 0.05 + 0.04 * k, attack: 0.002, decay: 0.07 })
      noiseBurst(ctx, dest, t, { type: 'bandpass', freq: 3000 + 1500 * k, q: 3, peak: 0.05, attack: 0.001, decay: 0.015 })
      break
    }
    case 'endTelegram': {
      // a teleprinter burst, quick and mechanical, with the bell at the end of the line
      let at = t
      for (let i = 0; i < 22; i++) {
        noiseBurst(ctx, dest, at, { type: 'bandpass', freq: 2200 + Math.random() * 900, q: 1.4, peak: 0.12 + Math.random() * 0.06, attack: 0.001, decay: 0.02 })
        at += 0.028 + Math.random() * 0.018
      }
      tone(ctx, dest, at + 0.04, { type: 'sine', from: 2093, peak: 0.08, attack: 0.002, decay: 0.45 })
      break
    }
    case 'page':
      rustle(ctx, dest, t, 0.3, 0.18)
      break
    case 'cardSlide':
      // a stiff card pushed across the wood: a short dry hiss that falls, and a soft settle
      noiseBurst(ctx, dest, t, { type: 'bandpass', freq: 2600, q: 0.6, peak: 0.07, attack: 0.04, decay: 0.2 })
      noiseBurst(ctx, dest, t + 0.06, { type: 'bandpass', freq: 1500, q: 0.7, peak: 0.05, attack: 0.03, decay: 0.18 })
      tone(ctx, dest, t + 0.26, { type: 'sine', from: 150, to: 95, peak: 0.07, attack: 0.004, decay: 0.08 })
      break
    case 'clipSnap':
      // a steel paper clip springing shut on a photo: a bright tick and a tiny ring
      noiseBurst(ctx, dest, t, { type: 'highpass', freq: 3800, q: 0.8, peak: 0.09, attack: 0.001, decay: 0.012 })
      tone(ctx, dest, t, { type: 'triangle', from: 3150, to: 2900, peak: 0.035, attack: 0.001, decay: 0.07 })
      tone(ctx, dest, t + 0.004, { type: 'sine', from: 420, to: 300, peak: 0.05, attack: 0.002, decay: 0.03 })
      break
    case 'arrive':
      // A sheet slid across the desk, then a soft tap as it lands.
      rustle(ctx, dest, t, 0.45, 0.2)
      tone(ctx, dest, t + 0.46, { type: 'sine', from: 140, to: 80, peak: 0.25, attack: 0.005, decay: 0.12 })
      break
    case 'tick': {
      // Agarbatti crackle: two or three tiny uneven ticks.
      const n = 2 + Math.floor(Math.random() * 2)
      for (let i = 0; i < n; i++) {
        noiseBurst(ctx, dest, t + i * (0.02 + Math.random() * 0.03), {
          type: 'highpass', freq: 3500, q: 0.7, peak: 0.1 + Math.random() * 0.06, attack: 0.001, decay: 0.012,
        })
      }
      break
    }
    case 'stampAsli':
      // Warm: low thump, soft paper slap.
      tone(ctx, dest, t, { type: 'sine', from: 170, to: 55, peak: 0.6, attack: 0.004, decay: 0.22 })
      noiseBurst(ctx, dest, t, { type: 'lowpass', freq: 1100, peak: 0.3, attack: 0.002, decay: 0.07 })
      break
    case 'stampTota':
      // Sharper: higher knock, bright slap, a small dry ring.
      tone(ctx, dest, t, { type: 'sine', from: 260, to: 90, peak: 0.55, attack: 0.002, decay: 0.16 })
      noiseBurst(ctx, dest, t, { type: 'bandpass', freq: 2600, q: 0.9, peak: 0.4, attack: 0.001, decay: 0.05 })
      tone(ctx, dest, t, { type: 'square', from: 780, peak: 0.05, attack: 0.002, decay: 0.09 })
      break
    case 'correct':
      // A small brass bell struck once, bright and kind, over a soft tick (0.8 s).
      noiseBurst(ctx, dest, t, { type: 'highpass', freq: 4200, q: 0.8, peak: 0.07, attack: 0.001, decay: 0.012 })
      brassTing(ctx, dest, t + 0.012, 1046.5, 0.16)
      break
    case 'typeKey':
      // (until the recorded strikes load) a dry typebar click
      noiseBurst(ctx, dest, t - 0.009, { type: 'bandpass', freq: 2400 + Math.random() * 600, q: 1.2, peak: 0.22, attack: 0.001, decay: 0.025 })
      tone(ctx, dest, t - 0.009, { type: 'sine', from: 210, to: 120, peak: 0.12, attack: 0.001, decay: 0.03 })
      break
    case 'typeSpace':
      noiseBurst(ctx, dest, t - 0.009, { type: 'lowpass', freq: 900, peak: 0.2, attack: 0.002, decay: 0.04 })
      break
    case 'typeDing':
      tone(ctx, dest, t, { type: 'sine', from: 2093, peak: 0.12, attack: 0.002, decay: 0.6 })
      tone(ctx, dest, t, { type: 'sine', from: 2093 * 2.76, peak: 0.04, attack: 0.002, decay: 0.25 })
      break
    case 'typeReturn':
      // the ratchet of the carriage running home, then its knock
      for (let i = 0; i < 9; i++) {
        noiseBurst(ctx, dest, t + i * 0.035, { type: 'bandpass', freq: 3000, q: 2, peak: 0.08, attack: 0.001, decay: 0.012 })
      }
      tone(ctx, dest, t + 0.34, { type: 'sine', from: 180, to: 90, peak: 0.3, attack: 0.003, decay: 0.09 })
      break
    case 'sealCrack':
      // brittle wax giving way: a few sharp crackles over a small low snap
      for (let i = 0; i < 4; i++) {
        noiseBurst(ctx, dest, t + i * (0.008 + Math.random() * 0.014), {
          type: 'highpass', freq: 2800 + Math.random() * 2000, q: 0.9, peak: 0.16 + Math.random() * 0.1, attack: 0.0008, decay: 0.012 + Math.random() * 0.01,
        })
      }
      tone(ctx, dest, t, { type: 'sine', from: 330, to: 110, peak: 0.18, attack: 0.001, decay: 0.07 })
      break
    case 'paperUnfold':
      // stiff paper opening along its crease, ending in a crisp flick
      rustle(ctx, dest, t, 0.32, 0.16)
      noiseBurst(ctx, dest, t + 0.28, { type: 'bandpass', freq: 3600, q: 1.1, peak: 0.2, attack: 0.002, decay: 0.035 })
      break
    case 'envelopeFlap':
      // a manila flap lifting off its fold: a soft breathy swell and a dry tick
      noiseBurst(ctx, dest, t, { type: 'bandpass', freq: 1400, q: 0.6, peak: 0.12, attack: 0.08, decay: 0.16 })
      noiseBurst(ctx, dest, t + 0.2, { type: 'highpass', freq: 3200, q: 0.8, peak: 0.08, attack: 0.001, decay: 0.02 })
      break
    case 'titleSettle':
      titleSettle(ctx, dest, t, o.era ?? null)
      break
    case 'survived': {
      // A gentle tanpura swell with a few plucked notes over it.
      const strings: Array<[number, number]> = [[110, 0], [146.83, 0.12], [146.83, 0.24], [73.42, 0.36]]
      for (const [f, delay] of strings) {
        const osc = ctx.createOscillator()
        osc.type = 'triangle'
        osc.frequency.value = f
        osc.detune.value = delay * 12
        const g = ctx.createGain()
        g.gain.setValueAtTime(0.0001, t + delay)
        g.gain.linearRampToValueAtTime(0.09, t + 1.2 + delay)
        g.gain.exponentialRampToValueAtTime(0.0001, t + 2.8)
        osc.connect(g)
        g.connect(dest)
        osc.start(t + delay)
        osc.stop(t + 2.9)
      }
      const notes: Array<[number, number]> = [[293.66, 0.35], [329.63, 0.85], [392.0, 1.3], [293.66, 1.8]]
      for (const [f, at] of notes) pluck(ctx, dest, t + at, f, 0.14, 0.8)
      break
    }
    // the caught sequence: the alarms and knocks go through one bus, so the dark can cut them off
    case 'bugleAlarm':
      bugleAlarm(ctx, caughtBus(ctx, dest), t)
      break
    case 'kettleDrum':
      kettleDrum(ctx, caughtBus(ctx, dest), t)
      break
    case 'whistleShort':
      peaWhistle(ctx, caughtBus(ctx, dest), t, 0.26, 0.095)
      break
    case 'whistleLong':
      peaWhistle(ctx, caughtBus(ctx, dest), t, 0.85, 0.095)
      break
    case 'bootsRunning':
      bootsRunning(ctx, caughtBus(ctx, dest), t)
      break
    case 'airRaidWail':
      airRaidWail(ctx, caughtBus(ctx, dest), t)
      break
    case 'phoneBell':
      phoneBell(ctx, caughtBus(ctx, dest), t)
      break
    case 'knockFar':
      knock(ctx, caughtBus(ctx, dest), t, 'far', o.era ?? null)
      break
    case 'knockNear':
      knock(ctx, caughtBus(ctx, dest), t, 'near', o.era ?? null)
      break
    case 'knockDoor':
      knock(ctx, caughtBus(ctx, dest), t, 'door', o.era ?? null)
      break
    case 'caughtHush':
      hushCaught(ctx, t)
      break
    case 'caughtDark':
      caughtDark(ctx, dest, t)
      break
    case 'paperCrumple':
      paperCrumple(ctx, dest, t)
      break
    case 'paperFlick':
      paperFlick(ctx, dest, t)
      break
    case 'ballLand':
      ballLand(ctx, dest, t)
      break
    case 'coinClink':
      coinClink(ctx, dest, t, 0.09)
      // and the small second clink of it settling flat
      coinClink(ctx, dest, t + 0.085 + Math.random() * 0.03, 0.035)
      break
    case 'jackpotClink':
      // a shower of coins, then one bright ring over them, held well under full scale
      for (let i = 0; i < 4; i++) coinClink(ctx, dest, t + i * 0.055 + Math.random() * 0.02, 0.07 - i * 0.01)
      brassTing(ctx, dest, t + 0.2, 1568, 0.08)
      brassTing(ctx, dest, t + 0.32, 2093, 0.05)
      break
    case 'boxSoft':
      // a light card box or a paper packet set down on the wood
      tone(ctx, dest, t, { type: 'sine', from: 190, to: 95, peak: 0.11, attack: 0.004, decay: 0.09 })
      noiseBurst(ctx, dest, t, { type: 'lowpass', freq: 900, peak: 0.07, attack: 0.003, decay: 0.06 })
      noiseBurst(ctx, dest, t + 0.012, { type: 'bandpass', freq: 2400, q: 0.8, peak: 0.025, attack: 0.002, decay: 0.04 })
      break
  }
}

/**
 * A small coin meeting the desk or another coin: a tick, then a few inharmonic metal partials that
 * die fast (a struck disc rings at about 1 : 2.3 : 3.9 : 5.6 of its lowest mode).
 */
function coinClink(ctx: BaseAudioContext, dest: AudioNode, t: number, peak: number): void {
  noiseBurst(ctx, dest, t, { type: 'highpass', freq: 5200, q: 0.7, peak: peak * 0.6, attack: 0.001, decay: 0.01 })
  const f = 2350 + Math.random() * 500
  const partials: Array<[number, number, number]> = [[1, 1, 0.16], [2.32, 0.55, 0.11], [3.89, 0.3, 0.08], [5.6, 0.16, 0.05]]
  for (const [ratio, level, decay] of partials) {
    tone(ctx, dest, t, { type: 'sine', from: f * ratio, peak: peak * level, attack: 0.001, decay })
  }
}

/**
 * One squeeze of a sheet being screwed up (about 0.35 s): the dry body of the paper giving way, a
 * crackle of small sharp creases running through it, and the soft press of the palms. Every call is
 * a little different, so two or three in a row sound like hands, not a loop.
 */
function paperCrumple(ctx: BaseAudioContext, dest: AudioNode, t: number): void {
  const len = 0.26 + Math.random() * 0.1
  // the body: a papery hiss that swells as the hands close and falls away
  const src = ctx.createBufferSource()
  src.buffer = noiseBuffer(ctx)
  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.Q.value = 0.7
  bp.frequency.setValueAtTime(2200 + Math.random() * 900, t)
  bp.frequency.linearRampToValueAtTime(3600 + Math.random() * 1200, t + len * 0.6)
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.linearRampToValueAtTime(0.05 + Math.random() * 0.02, t + 0.05)
  g.gain.exponentialRampToValueAtTime(0.0001, t + len)
  src.connect(bp)
  bp.connect(g)
  g.connect(dest)
  src.start(t, Math.random() * 1.5)
  src.stop(t + len + 0.05)
  // the crackle: tiny sharp clicks, thickest while the paper gives way
  const n = 12 + Math.floor(Math.random() * 6)
  for (let i = 0; i < n; i++) {
    const at = t + Math.pow(Math.random(), 1.3) * len * 0.85
    noiseBurst(ctx, dest, at, { type: 'highpass', freq: 3200 + Math.random() * 3600, q: 0.8, peak: 0.022 + Math.random() * 0.042, attack: 0.001, decay: 0.006 + Math.random() * 0.014 })
  }
  // the palms pressing in: a muffled low push
  noiseBurst(ctx, dest, t + 0.01, { type: 'lowpass', freq: 520 + Math.random() * 200, peak: 0.045, attack: 0.02, decay: 0.09 })
}

/** The ball leaving the hand (about 0.2 s): a quick breath of air and the flick of the fingers. */
function paperFlick(ctx: BaseAudioContext, dest: AudioNode, t: number): void {
  const src = ctx.createBufferSource()
  src.buffer = noiseBuffer(ctx)
  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.Q.value = 1.1
  bp.frequency.setValueAtTime(1100, t)
  bp.frequency.exponentialRampToValueAtTime(3400, t + 0.12)
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.linearRampToValueAtTime(0.06, t + 0.04)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2)
  src.connect(bp)
  bp.connect(g)
  g.connect(dest)
  src.start(t, Math.random() * 1.5)
  src.stop(t + 0.25)
  noiseBurst(ctx, dest, t, { type: 'bandpass', freq: 2600, q: 3, peak: 0.05, attack: 0.001, decay: 0.012 })
  // the ball's own rustle as it turns over
  noiseBurst(ctx, dest, t + 0.05, { type: 'highpass', freq: 4200, q: 0.7, peak: 0.025, attack: 0.002, decay: 0.03 })
}

/**
 * A paper ball dropping into the basket (about 0.4 s): a soft, hollow thud, the ball's own crackle
 * as it settles, and a creak or two of the cane as the basket rocks.
 */
function ballLand(ctx: BaseAudioContext, dest: AudioNode, t: number): void {
  tone(ctx, dest, t, { type: 'sine', from: 165, to: 96, peak: 0.11, attack: 0.003, decay: 0.1 })
  noiseBurst(ctx, dest, t, { type: 'lowpass', freq: 640, peak: 0.08, attack: 0.002, decay: 0.06 })
  for (let i = 0; i < 4; i++) {
    noiseBurst(ctx, dest, t + 0.02 + Math.random() * 0.14, { type: 'highpass', freq: 3800 + Math.random() * 2400, q: 0.8, peak: 0.018 + Math.random() * 0.02, attack: 0.001, decay: 0.008 + Math.random() * 0.01 })
  }
  // the small bounce, softer
  tone(ctx, dest, t + 0.12, { type: 'sine', from: 150, to: 104, peak: 0.035, attack: 0.003, decay: 0.06 })
  for (const at of [0.1, 0.26]) {
    noiseBurst(ctx, dest, t + at + Math.random() * 0.03, { type: 'bandpass', freq: 1400 + Math.random() * 500, q: 5, peak: 0.03, attack: 0.002, decay: 0.03 })
  }
}

// ---------- the caught sequence (src/scene/caught.ts has the score and the hit times)

/** The bus the alarm plays through, made on demand (and afresh after a hush). */
function caughtBus(ctx: BaseAudioContext, dest: AudioNode): GainNode {
  let bus = caughtBuses.get(ctx)
  if (!bus) {
    bus = ctx.createGain()
    bus.gain.value = 1
    bus.connect(dest)
    caughtBuses.set(ctx, bus)
  }
  return bus
}

/** Cuts the alarm off: everything still sounding on the bus fades out in a sixth of a second. */
function hushCaught(ctx: BaseAudioContext, t: number): void {
  const bus = caughtBuses.get(ctx)
  if (!bus) return
  caughtBuses.delete(ctx)
  bus.gain.cancelScheduledValues(t)
  bus.gain.setValueAtTime(1, t)
  bus.gain.linearRampToValueAtTime(0.0001, t + 0.16)
}

/** One bugle note: a sawtooth through a low-pass that opens with the breath, the lip scooping up into pitch. */
function bugleNote(ctx: BaseAudioContext, dest: AudioNode, t: number, freq: number, len: number, peak: number): void {
  const osc = ctx.createOscillator()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(freq * 0.96, t)
  osc.frequency.exponentialRampToValueAtTime(freq, t + 0.03)
  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.Q.value = 1.4
  lp.frequency.setValueAtTime(freq * 1.4, t)
  lp.frequency.exponentialRampToValueAtTime(Math.min(freq * 5, 3600), t + 0.035)
  lp.frequency.exponentialRampToValueAtTime(freq * 2.6, t + len)
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.linearRampToValueAtTime(peak, t + 0.02)
  g.gain.linearRampToValueAtTime(peak * 0.7, t + len)
  g.gain.exponentialRampToValueAtTime(0.0001, t + len + 0.07)
  osc.connect(lp)
  lp.connect(g)
  g.connect(dest)
  osc.start(t)
  osc.stop(t + len + 0.1)
  // the breath behind the tongue's attack
  noiseBurst(ctx, dest, t, { type: 'bandpass', freq: freq * 3, q: 1.2, peak: peak * 0.3, attack: 0.004, decay: 0.035 })
}

/** 1857: a British bugle sounding the alarm across the lines, three quick figures, the last one climbing. */
function bugleAlarm(ctx: BaseAudioContext, dest: AudioNode, t: number): void {
  const G4 = 392
  const C5 = 523.25
  const E5 = 659.25
  const G5 = 783.99
  const figures = [[G4, G4, C5], [G4, G4, C5], [C5, E5, G5]] as const
  BUGLE_FIGURES_MS.forEach((off, i) => {
    const at = t + off / 1000
    const [a, b, c] = figures[i] ?? figures[0]
    bugleNote(ctx, dest, at, a, 0.085, 0.12)
    bugleNote(ctx, dest, at + 0.125, b, 0.085, 0.12)
    bugleNote(ctx, dest, at + 0.25, c, i === 2 ? 0.42 : 0.22, 0.15)
  })
}

/** 1857: a kettle drum's roll swelling under the bugle, ending on one accent with its last figure. */
function kettleDrum(ctx: BaseAudioContext, dest: AudioNode, t: number): void {
  const end = DRUM_ACCENT_MS / 1000
  let at = 0
  for (let i = 0; at < end - 0.04; i++) {
    const k = at / end
    const hit = 0.035 + 0.11 * k * k
    tone(ctx, dest, t + at, { type: 'sine', from: i % 2 ? 100 : 97, to: 86, peak: hit, attack: 0.003, decay: 0.15 })
    noiseBurst(ctx, dest, t + at, { type: 'bandpass', freq: 380, q: 0.7, peak: hit * 0.45, attack: 0.002, decay: 0.04 })
    at += 0.066 - 0.016 * k
  }
  tone(ctx, dest, t + end, { type: 'sine', from: 112, to: 70, peak: 0.34, attack: 0.004, decay: 0.6 })
  noiseBurst(ctx, dest, t + end, { type: 'lowpass', freq: 900, peak: 0.18, attack: 0.002, decay: 0.12 })
}

/** 1929, 1942, 1947: a police pea whistle, a high note trilled by the pea rattling in it, with breath. */
function peaWhistle(ctx: BaseAudioContext, dest: AudioNode, t: number, len: number, peak: number): void {
  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(2650, t)
  osc.frequency.linearRampToValueAtTime(2880, t + 0.06)
  if (len > 0.5) osc.frequency.linearRampToValueAtTime(2960, t + len)
  // the pea: it shakes the pitch and the level together, about thirty times a second
  const pea = ctx.createOscillator()
  pea.type = 'sine'
  pea.frequency.value = 29 + Math.random() * 5
  const fm = ctx.createGain()
  fm.gain.value = 150
  pea.connect(fm)
  fm.connect(osc.frequency)
  const trill = ctx.createGain()
  trill.gain.value = 0.68
  const am = ctx.createGain()
  am.gain.value = 0.32
  pea.connect(am)
  am.connect(trill.gain)
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.linearRampToValueAtTime(peak, t + 0.025)
  g.gain.linearRampToValueAtTime(peak * 0.85, t + len)
  g.gain.exponentialRampToValueAtTime(0.0001, t + len + 0.05)
  osc.connect(trill)
  trill.connect(g)
  g.connect(dest)
  osc.start(t)
  pea.start(t)
  osc.stop(t + len + 0.08)
  pea.stop(t + len + 0.08)
  noiseBurst(ctx, dest, t, { type: 'bandpass', freq: 3000, q: 0.9, peak: peak * 0.35, attack: 0.02, decay: len })
}

/** 1929: boots running up the gali, faster and nearer: heels, hobnails, a second man a step behind. */
function bootsRunning(ctx: BaseAudioContext, dest: AudioNode, t: number): void {
  const len = 1.1
  let at = 0
  for (let i = 0; at < len; i++) {
    const k = at / len
    const step = (when: number, p: number) => {
      tone(ctx, dest, when, { type: 'sine', from: 96, to: 58, peak: p, attack: 0.003, decay: 0.075 })
      noiseBurst(ctx, dest, when, { type: 'lowpass', freq: 480 + 1500 * k, peak: p * 0.6, attack: 0.002, decay: 0.05 })
      noiseBurst(ctx, dest, when + 0.012, { type: 'bandpass', freq: 2700, q: 2, peak: p * 0.45 * k, attack: 0.001, decay: 0.014 })
    }
    const peak = 0.05 + 0.2 * k
    step(t + at, peak)
    if (i % 2 === 0) step(t + at + 0.085, peak * 0.6)
    at += 0.19 - 0.06 * k
  }
}

/** 1942: an air-raid siren winding up, its rotor growling under a wail that climbs, dips and climbs again. */
function airRaidWail(ctx: BaseAudioContext, dest: AudioNode, t: number): void {
  const rise = WAIL_RISE_MS / 1000
  const len = 2.8 // the dark's hush usually cuts it first
  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 1500
  lp.Q.value = 0.7
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.linearRampToValueAtTime(0.075, t + rise * 0.8)
  g.gain.setValueAtTime(0.075, t + len - 0.5)
  g.gain.exponentialRampToValueAtTime(0.0001, t + len)
  lp.connect(g)
  g.connect(dest)
  const voices: Array<[OscillatorType, number, number, number]> = [['sawtooth', -6, 0.55, 1], ['triangle', 6, 1, 1], ['sine', 0, 0.45, 0.5]]
  for (const [type, detune, level, mult] of voices) {
    const osc = ctx.createOscillator()
    osc.type = type
    osc.detune.value = detune
    osc.frequency.setValueAtTime(150 * mult, t)
    osc.frequency.exponentialRampToValueAtTime(540 * mult, t + rise)
    osc.frequency.linearRampToValueAtTime(500 * mult, t + rise + 0.25)
    osc.frequency.exponentialRampToValueAtTime(610 * mult, t + rise * 2)
    osc.frequency.linearRampToValueAtTime(590 * mult, t + len)
    const og = ctx.createGain()
    og.gain.value = level
    osc.connect(og)
    og.connect(lp)
    osc.start(t)
    osc.stop(t + len + 0.05)
  }
}

/** 1947: the office telephone's double ring, its clapper drumming between two bells. */
function phoneBell(ctx: BaseAudioContext, dest: AudioNode, t: number): void {
  for (const off of PHONE_RINGS_MS) {
    const at = t + off / 1000
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, at)
    g.gain.linearRampToValueAtTime(0.15, at + 0.012)
    g.gain.setValueAtTime(0.15, at + 0.38)
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.5)
    g.connect(dest)
    // a square wave swings the clapper: one bell is struck as the other rings down
    const clapper = ctx.createOscillator()
    clapper.type = 'square'
    clapper.frequency.value = 21
    clapper.start(at)
    clapper.stop(at + 0.55)
    for (const [f, side] of [[1180, 1], [1330, -1]] as const) {
      const bell = ctx.createGain()
      bell.gain.value = 0.55
      const swing = ctx.createGain()
      swing.gain.value = 0.45 * side
      clapper.connect(swing)
      swing.connect(bell.gain)
      bell.connect(g)
      for (const [ratio, level] of [[1, 0.5], [2.42, 0.12]] as const) {
        const osc = ctx.createOscillator()
        osc.type = 'sine'
        osc.frequency.value = f * ratio
        const og = ctx.createGain()
        og.gain.value = level
        osc.connect(og)
        og.connect(bell)
        osc.start(at)
        osc.stop(at + 0.55)
      }
    }
  }
}

/** One rap on a wooden door: the panel's boom, the knock itself, and whatever rattles in that era. */
function rap(ctx: BaseAudioContext, dest: AudioNode, t: number, power: number, era: EraId | null, muffle: number): void {
  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = muffle
  lp.connect(dest)
  tone(ctx, lp, t, { type: 'sine', from: 118, to: 66, peak: 0.5 * power, attack: 0.003, decay: 0.2 })
  tone(ctx, lp, t, { type: 'triangle', from: 250, to: 170, peak: 0.2 * power, attack: 0.002, decay: 0.07 })
  noiseBurst(ctx, lp, t, { type: 'bandpass', freq: 850, q: 0.9, peak: 0.32 * power, attack: 0.001, decay: 0.05 })
  if (era === 'delhi-1857') {
    // the haveli door's iron kundi beaten against its plate
    brassTing(ctx, lp, t + 0.006, 610, 0.05 * power)
    noiseBurst(ctx, lp, t + 0.004, { type: 'highpass', freq: 2400, q: 0.8, peak: 0.12 * power, attack: 0.001, decay: 0.03 })
  } else if (era === 'lahore-1929') {
    // a lathi cracking on the planks
    noiseBurst(ctx, lp, t, { type: 'bandpass', freq: 1900, q: 2.2, peak: 0.3 * power, attack: 0.0008, decay: 0.022 })
  } else if (era === 'delhi-1947') {
    // the frosted glass in the office door shivers in its frame
    noiseBurst(ctx, lp, t + 0.01, { type: 'highpass', freq: 4200, q: 0.7, peak: 0.05 * power, attack: 0.004, decay: 0.12 })
    tone(ctx, lp, t + 0.01, { type: 'sine', from: 3300, peak: 0.012 * power, attack: 0.002, decay: 0.15 })
  } else {
    // the door shudders on its bolt
    noiseBurst(ctx, lp, t + 0.02, { type: 'lowpass', freq: 320, peak: 0.12 * power, attack: 0.004, decay: 0.12 })
  }
}

/** A knock coming closer: muffled down the lane, louder next door, then full on your own door. */
function knock(ctx: BaseAudioContext, dest: AudioNode, t: number, kind: KnockKind, era: EraId | null): void {
  const power = kind === 'far' ? 0.22 : kind === 'near' ? 0.5 : 1
  const muffle = kind === 'far' ? 420 : kind === 'near' ? 1300 : 6000
  KNOCK_RAPS_MS[kind].forEach((off, i) => rap(ctx, dest, t + off / 1000, power * (i === 0 ? 0.92 : 1), era, muffle))
}

/** Under the quiet after the alarm: a low swell sinking away, and the ring of silence in the ears. */
function caughtDark(ctx: BaseAudioContext, dest: AudioNode, t: number): void {
  tone(ctx, dest, t, { type: 'sine', from: 64, to: 42, peak: 0.2, attack: 0.28, decay: 1.3 })
  tone(ctx, dest, t, { type: 'sine', from: 96, to: 63, peak: 0.06, attack: 0.3, decay: 1.0 })
  tone(ctx, dest, t + 0.1, { type: 'sine', from: 3150, peak: 0.007, attack: 0.35, decay: 1.4 })
}

// ---------- ambience layers (return a handle that stops them) ----------

function loopedNoise(ctx: BaseAudioContext, dest: AudioNode, o: {
  type: BiquadFilterType; freq: number; q?: number; gain: number; lfoHz?: number; lfoDepth?: number
}): Stoppable {
  const src = ctx.createBufferSource()
  src.buffer = noiseBuffer(ctx)
  src.loop = true
  const f = ctx.createBiquadFilter()
  f.type = o.type
  f.frequency.value = o.freq
  f.Q.value = o.q ?? 0.7
  const g = ctx.createGain()
  g.gain.value = o.gain
  src.connect(f)
  f.connect(g)
  g.connect(dest)
  const stops: Array<() => void> = []
  src.start()
  stops.push(() => src.stop())
  if (o.lfoHz) {
    const lfo = ctx.createOscillator()
    lfo.frequency.value = o.lfoHz
    const depth = ctx.createGain()
    depth.gain.value = o.gain * (o.lfoDepth ?? 0.6)
    lfo.connect(depth)
    depth.connect(g.gain)
    lfo.start()
    stops.push(() => lfo.stop())
  }
  return { stop: () => stops.forEach((s) => { try { s() } catch { /* already stopped */ } }) }
}

function sustained(ctx: BaseAudioContext, dest: AudioNode, freqs: Array<[number, number]>, type: OscillatorType = 'sine'): Stoppable {
  const oscs = freqs.map(([f, gain]) => {
    const osc = ctx.createOscillator()
    osc.type = type
    osc.frequency.value = f
    const g = ctx.createGain()
    g.gain.value = gain
    osc.connect(g)
    g.connect(dest)
    osc.start()
    return osc
  })
  return { stop: () => oscs.forEach((o) => { try { o.stop() } catch { /* already stopped */ } }) }
}

/** Distant naqqara: a muffled low hit, heard from across the city. */
export function naqqaraHit(ctx: BaseAudioContext, dest: AudioNode, t: number): void {
  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 420
  lp.connect(dest)
  tone(ctx, lp, t, { type: 'sine', from: 130, to: 62, peak: 0.3, attack: 0.006, decay: 0.45 })
  noiseBurst(ctx, lp, t, { type: 'lowpass', freq: 700, peak: 0.15, attack: 0.003, decay: 0.08 })
}

/** One telegraph needle tick: a dry double click. */
export function telegraphClick(ctx: BaseAudioContext, dest: AudioNode, t: number): void {
  noiseBurst(ctx, dest, t, { type: 'bandpass', freq: 2000, q: 6, peak: 0.25, attack: 0.001, decay: 0.012 })
  noiseBurst(ctx, dest, t + 0.035, { type: 'bandpass', freq: 1200, q: 5, peak: 0.18, attack: 0.001, decay: 0.012 })
}

/** A small call bell: one bright ping. */
export function callBell(ctx: BaseAudioContext, dest: AudioNode, t: number): void {
  tone(ctx, dest, t, { type: 'sine', from: 2350, peak: 0.1, attack: 0.002, decay: 0.7 })
  tone(ctx, dest, t, { type: 'sine', from: 3520, peak: 0.04, attack: 0.002, decay: 0.4 })
}

/** The tuning whistle of a shortwave set being turned: a slow heterodyne sweep. */
export function tuningWhistle(ctx: BaseAudioContext, dest: AudioNode, t: number): void {
  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(500, t)
  osc.frequency.exponentialRampToValueAtTime(1700, t + 1.2)
  osc.frequency.exponentialRampToValueAtTime(700, t + 2.4)
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.linearRampToValueAtTime(0.03, t + 0.6)
  g.gain.linearRampToValueAtTime(0.0001, t + 2.4)
  osc.connect(g)
  g.connect(dest)
  osc.start(t)
  osc.stop(t + 2.5)
}

/** Constant low wind. */
export function windBed(ctx: BaseAudioContext, dest: AudioNode): Stoppable {
  return loopedNoise(ctx, dest, { type: 'lowpass', freq: 380, gain: 0.12, lfoHz: 0.11, lfoDepth: 0.7 })
}

/** Shortwave static with a slow wobble. */
export function staticBed(ctx: BaseAudioContext, dest: AudioNode): Stoppable {
  return loopedNoise(ctx, dest, { type: 'bandpass', freq: 2600, q: 0.5, gain: 0.05, lfoHz: 0.3, lfoDepth: 0.8 })
}

/** 50 Hz mains hum (India), with its second and third harmonics. */
export function valveHum(ctx: BaseAudioContext, dest: AudioNode): Stoppable {
  return sustained(ctx, dest, [[50, 0.05], [100, 0.03], [150, 0.012]])
}

/** Tanpura-like drone: Pa, Sa, Sa, low Sa, slightly detuned triangles. */
export function tanpuraDrone(ctx: BaseAudioContext, dest: AudioNode): Stoppable {
  return sustained(ctx, dest, [[110, 0.03], [146.83, 0.03], [147.2, 0.025], [73.42, 0.03]], 'triangle')
}
