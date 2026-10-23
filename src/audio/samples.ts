// Recorded one-shots: the 1920s typewriter (five key strikes, the space bar, the margin bell and the
// carriage return) in one small sprite, public/audio/typewriter.wav (22.05 kHz mono PCM, so a
// strike starts on the exact sample it is asked for: no codec delay). Every key clip begins 3 ms
// before its strike's attack, so the sound lands on the frame the letter appears. It is fetched and decoded right
// after the audio unlock, then every hit is an AudioBufferSourceNode started at once.
// Sources (CC0, see CREDITS.md): Freesound #793351 (rpnelson, a 1920s Remington) and #345955
// (knufds, bell and carriage return).

export type SampleName = 'key' | 'space' | 'ding' | 'return'

/** Where each clip sits in the sprite: [start, duration] in seconds. */
export const SPRITE: Record<'key0' | 'key1' | 'key2' | 'key3' | 'key4' | 'space' | 'ding' | 'return', [number, number]> = {
  key0: [0.0, 0.105],
  key1: [0.115, 0.105],
  key2: [0.2299, 0.105],
  key3: [0.3449, 0.105],
  key4: [0.4599, 0.105],
  space: [0.5748, 0.115],
  ding: [0.6998, 0.7],
  return: [1.4097, 0.88],
}
export const SPRITE_FILE = 'typewriter.wav'
const KEYS = ['key0', 'key1', 'key2', 'key3', 'key4'] as const

const GAIN: Record<SampleName, number> = { key: 0.55, space: 0.45, ding: 0.42, return: 0.5 }

export interface Sampler {
  /** True once the sprite is decoded; until then play() returns false and the caller synthesizes. */
  ready(): boolean
  /** Plays a clip now. Keys vary in pitch, level and strike, so a line never machine-guns. */
  play(name: SampleName): boolean
}

export function createSampler(ctx: BaseAudioContext, dest: AudioNode, load: (file: string) => Promise<AudioBuffer | null>, rng: () => number = Math.random): Sampler {
  let buffer: AudioBuffer | null = null
  let lastKey = -1
  void load(SPRITE_FILE).then((b) => {
    buffer = b
  })
  return {
    ready: () => buffer !== null,
    play(name) {
      const b = buffer
      if (!b) return false
      let clip: keyof typeof SPRITE = name === 'key' ? 'key0' : name
      let rate = 1
      let gain = GAIN[name]
      if (name === 'key') {
        // never the same strike twice running, a hair off pitch and level each time
        let i = Math.floor(rng() * KEYS.length)
        if (i === lastKey) i = (i + 1 + Math.floor(rng() * (KEYS.length - 1))) % KEYS.length
        lastKey = i
        clip = KEYS[i] ?? 'key0'
        rate = 0.93 + rng() * 0.14
        gain *= 0.72 + rng() * 0.28
      } else if (name === 'space') {
        rate = 0.92 + rng() * 0.06
        gain *= 0.85 + rng() * 0.15
      }
      const [start, dur] = SPRITE[clip]
      const src = ctx.createBufferSource()
      src.buffer = b
      if (src.playbackRate) src.playbackRate.value = rate
      const g = ctx.createGain()
      g.gain.value = gain
      src.connect(g)
      g.connect(dest)
      const t = ctx.currentTime
      src.start(t, start, dur)
      src.stop(t + dur / rate + 0.02)
      return true
    },
  }
}
