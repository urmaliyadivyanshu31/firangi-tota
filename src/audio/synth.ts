// Web Audio synthesis: every cue and every procedural ambience layer.
// Pure scheduling helpers: they take a context and a destination node and never touch globals.

export type Cue = 'arrive' | 'stampAsli' | 'stampTota' | 'tick' | 'correct' | 'caught' | 'survived' | 'page'

export interface Stoppable { stop(): void }

let noiseCache: WeakMap<BaseAudioContext, AudioBuffer> = new WeakMap()

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
export function resetSynthCache(): void { noiseCache = new WeakMap() }

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

function shehnaiNote(ctx: BaseAudioContext, dest: AudioNode, t: number, freq: number, len: number, peak: number): void {
  // Reedy: two detuned saws through a nasal band-pass, gentle vibrato.
  const end = t + 0.04 + len + 0.05
  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = freq * 3
  bp.Q.value = 2.5
  const g = env(ctx, dest, t, peak, 0.04, len)
  bp.connect(g)
  const lfo = ctx.createOscillator()
  lfo.frequency.value = 5.5
  const lfoGain = ctx.createGain()
  lfoGain.gain.value = freq * 0.012
  lfo.connect(lfoGain)
  for (const detune of [-6, 6]) {
    const osc = ctx.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.value = freq
    osc.detune.value = detune
    lfoGain.connect(osc.frequency)
    osc.connect(bp)
    osc.start(t)
    osc.stop(end)
  }
  lfo.start(t)
  lfo.stop(end)
}

function pluck(ctx: BaseAudioContext, dest: AudioNode, t: number, freq: number, peak: number, decay: number): void {
  tone(ctx, dest, t, { type: 'triangle', from: freq, peak, attack: 0.005, decay })
  tone(ctx, dest, t, { type: 'sine', from: freq * 2, peak: peak * 0.3, attack: 0.005, decay: decay * 0.6 })
}

export function playCue(ctx: BaseAudioContext, dest: AudioNode, cue: Cue): void {
  const t = ctx.currentTime + 0.01
  switch (cue) {
    case 'page':
      rustle(ctx, dest, t, 0.3, 0.18)
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
    case 'correct': {
      // Soft rising shehnai-like motif: D, E, G, then A held.
      const notes: Array<[number, number]> = [[293.66, 0.16], [329.63, 0.16], [392.0, 0.18], [440.0, 0.42]]
      let at = t
      for (const [f, len] of notes) { shehnaiNote(ctx, dest, at, f, len, 0.07); at += len * 0.85 }
      break
    }
    case 'caught':
      // A low drum, then a heavy metal door clang and a rattle.
      tone(ctx, dest, t, { type: 'sine', from: 95, to: 38, peak: 0.8, attack: 0.005, decay: 0.55 })
      noiseBurst(ctx, dest, t, { type: 'lowpass', freq: 400, peak: 0.35, attack: 0.003, decay: 0.2 })
      for (const f of [310, 487, 733]) {
        tone(ctx, dest, t + 0.38, { type: 'square', from: f, peak: 0.07, attack: 0.002, decay: 0.7 })
      }
      noiseBurst(ctx, dest, t + 0.38, { type: 'bandpass', freq: 1500, q: 2, peak: 0.25, attack: 0.002, decay: 0.12 })
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
  }
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
