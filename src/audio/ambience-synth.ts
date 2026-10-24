// The ambience's synthesized layers: what synthesizes well. 1942's low pad, a valve set's hum, a
// ceiling fan, a wall clock, and a tonga bell a street away. (The tanpura, the harmonium and the
// rooms' small sounds are recordings: see src/audio/ambience.ts.) Everything is held far under full
// scale; the levels here are relative, and ambience.ts sets each layer in the mix.
//
// Only gain, oscillator, buffer-source and biquad nodes are used, so a phone does little work and
// the test doubles stay simple.

export interface Stoppable { stop(): void }

/** Runs `fn` after `ms` (a timer in the game, an offline render's clock in dev/ambience.ts). */
export type Later = (ms: number, fn: () => void) => void

const noiseCache = new WeakMap<BaseAudioContext, AudioBuffer>()

/** Four seconds of soft pink noise (Paul Kellet's filter), cached per context. */
export function pinkNoise(ctx: BaseAudioContext): AudioBuffer {
  const hit = noiseCache.get(ctx)
  if (hit) return hit
  const len = Math.max(1, Math.floor(ctx.sampleRate * 4))
  const buf = ctx.createBuffer(1, len, ctx.sampleRate)
  const d = buf.getChannelData(0)
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1
    b0 = 0.99886 * b0 + w * 0.0555179
    b1 = 0.99332 * b1 + w * 0.0750759
    b2 = 0.969 * b2 + w * 0.153852
    b3 = 0.8665 * b3 + w * 0.3104856
    b4 = 0.55 * b4 + w * 0.5329522
    b5 = -0.7616 * b5 - w * 0.016898
    d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11
    b6 = w * 0.115926
  }
  noiseCache.set(ctx, buf)
  return buf
}

function stopAll(nodes: Array<{ stop(): void }>): void {
  for (const n of nodes) {
    try { n.stop() } catch { /* already stopped */ }
  }
}

/**
 * Keeps scheduling `play(at)` a little ahead of the audio clock, every `step` seconds. It never
 * piles up: while the context sleeps (a hidden tab) its clock stops, and so does this.
 */
function pump(ctx: BaseAudioContext, later: Later, step: number, play: (at: number) => void, startIn: number): Stoppable {
  let next = ctx.currentTime + startIn
  let on = true
  const tick = (): void => {
    if (!on) return
    const now = ctx.currentTime
    if (next < now) next = now + 0.05 // the page stalled: carry on from here, never in a burst
    while (next < now + 1.2) {
      try { play(next) } catch { /* never break the bed */ }
      next += Math.max(0.2, step)
    }
    later(400, tick)
  }
  tick()
  return { stop: () => { on = false } }
}

export interface DroneOptions {
  /** [frequency Hz, relative level] for each held note. */
  notes: Array<[number, number]>
  level: number
  /** The filter's corner (Hz): lower is darker. */
  tone: number
  /** The breathing: how deep (0..1) and how slow (Hz) the level swells. */
  breath: number
  breathHz: number
  /** The filter drifting up and down by this many Hz (0 for a still tone). */
  drift?: number
}

/**
 * Held notes through one low-pass, swelling slowly. Each note has a quieter second voice a fraction
 * of a hertz away, so it shimmers gently (a slow beat of about ±2 dB, never a pulse), each note at
 * its own rate.
 */
export function drone(ctx: BaseAudioContext, dest: AudioNode, o: DroneOptions): Stoppable {
  const nodes: Array<{ stop(): void }> = []
  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.Q.value = 0.5
  lp.frequency.value = o.tone
  const swell = ctx.createGain()
  swell.gain.value = o.level
  lp.connect(swell)
  swell.connect(dest)
  o.notes.forEach(([f, rel], n) => {
    for (const [offset, part] of [[0, 1], [0.21 + n * 0.13, 0.25]] as const) {
      const osc = ctx.createOscillator()
      osc.type = 'sawtooth'
      osc.frequency.value = f + offset
      const g = ctx.createGain()
      g.gain.value = rel * part
      osc.connect(g)
      g.connect(lp)
      osc.start()
      nodes.push(osc)
    }
  })
  if (o.breath > 0) {
    const lfo = ctx.createOscillator()
    lfo.frequency.value = o.breathHz
    const depth = ctx.createGain()
    depth.gain.value = o.level * o.breath
    lfo.connect(depth)
    depth.connect(swell.gain)
    lfo.start()
    nodes.push(lfo)
  }
  if (o.drift) {
    const lfo = ctx.createOscillator()
    lfo.frequency.value = o.breathHz * 0.61
    const depth = ctx.createGain()
    depth.gain.value = o.drift
    lfo.connect(depth)
    depth.connect(lp.frequency)
    lfo.start()
    nodes.push(lfo)
  }
  return { stop: () => stopAll(nodes) }
}

/** A valve set warming: 50 Hz mains and its harmonics, soft and round. */
export function valveHum(ctx: BaseAudioContext, dest: AudioNode, level: number): Stoppable {
  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 260
  const g = ctx.createGain()
  g.gain.value = level
  lp.connect(g)
  g.connect(dest)
  const oscs = ([[50, 1], [100, 0.55], [150, 0.22], [200, 0.08]] as const).map(([f, rel]) => {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = f
    const og = ctx.createGain()
    og.gain.value = rel
    osc.connect(og)
    og.connect(lp)
    osc.start()
    return osc
  })
  return { stop: () => stopAll(oscs) }
}

/**
 * A slow ceiling fan: air pushed round by the blades (pink noise whose level rises and falls with
 * each blade) and the motor's faint hum.
 */
export function ceilingFan(ctx: BaseAudioContext, dest: AudioNode, o: { level: number; bladeHz: number }): Stoppable {
  const src = ctx.createBufferSource()
  src.buffer = pinkNoise(ctx)
  src.loop = true
  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 420
  bp.Q.value = 0.7
  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 1300
  const g = ctx.createGain()
  g.gain.value = o.level
  src.connect(bp)
  bp.connect(lp)
  lp.connect(g)
  g.connect(dest)
  const lfo = ctx.createOscillator()
  lfo.frequency.value = o.bladeHz
  const depth = ctx.createGain()
  depth.gain.value = o.level * 0.3
  lfo.connect(depth)
  depth.connect(g.gain)
  const hum = ctx.createOscillator()
  hum.type = 'sine'
  hum.frequency.value = 100
  const hg = ctx.createGain()
  hg.gain.value = o.level * 0.05
  hum.connect(hg)
  hg.connect(dest)
  src.start()
  lfo.start()
  hum.start()
  return { stop: () => stopAll([src, lfo, hum]) }
}

export interface ClockOptions {
  /** Seconds between ticks. */
  period: number
  level: number
  /** The wood's ring (Hz): the tick sits here, the tock a little lower. */
  tone: number
  /** While this returns true the clock keeps its ticks to itself (the agarbatti's own clock is ticking). */
  hushed?: () => boolean
}

/** A wall clock far back in the room: a soft wooden tick and tock. */
export function wallClock(ctx: BaseAudioContext, dest: AudioNode, o: ClockOptions, later: Later): Stoppable {
  let tock = false
  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 2400
  lp.connect(dest)
  const p = pump(ctx, later, o.period, (at) => {
    tock = !tock
    if (o.hushed?.()) return
    const src = ctx.createBufferSource()
    src.buffer = pinkNoise(ctx)
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = tock ? o.tone * 0.82 : o.tone
    bp.Q.value = 5
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, at)
    g.gain.linearRampToValueAtTime(o.level, at + 0.003)
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.06)
    src.connect(bp)
    bp.connect(g)
    g.connect(lp)
    src.start(at, Math.random() * 3)
    src.stop(at + 0.08)
  }, 0.5)
  return { stop: () => { p.stop(); try { lp.disconnect() } catch { /* already gone */ } } }
}

/** A tonga's bell a street away: a small brass bell struck twice, its top dulled by the distance. */
export function tongaBell(ctx: BaseAudioContext, dest: AudioNode, t: number, level: number): void {
  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 2600
  lp.connect(dest)
  const partials: Array<[number, number, number]> = [[1, 1, 0.9], [2.01, 0.4, 0.6], [2.76, 0.28, 0.45], [5.4, 0.1, 0.2]]
  for (const at of [t, t + 0.34]) {
    for (const [ratio, rel, decay] of partials) {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = 1568 * ratio
      const g = ctx.createGain()
      g.gain.setValueAtTime(0.0001, at)
      g.gain.linearRampToValueAtTime(level * rel, at + 0.006)
      g.gain.exponentialRampToValueAtTime(0.0001, at + decay)
      osc.connect(g)
      g.connect(lp)
      osc.start(at)
      osc.stop(at + decay + 0.05)
    }
  }
}
