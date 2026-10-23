// Time-driven tweens on the stage clock. The clock stops while the stage is paused, so tweens do too.

export type Ease = (k: number) => number

export const ease = {
  linear: (k: number) => k,
  in: (k: number) => k * k * k,
  out: (k: number) => 1 - Math.pow(1 - k, 3),
  inOut: (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2),
  inOutSine: (k: number) => -(Math.cos(Math.PI * k) - 1) / 2,
  /** Overshoots a little before settling: for things that land. */
  outBack: (k: number) => {
    const c = 1.4
    return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2)
  },
} satisfies Record<string, Ease>

export const lerp = (a: number, b: number, k: number) => a + (b - a) * k
export const clamp01 = (k: number) => (k < 0 ? 0 : k > 1 ? 1 : k)

export interface Tweens {
  /** Calls fn with eased progress 0..1 on every tick for `ms`, then resolves. */
  run(ms: number, fn: (k: number) => void, e?: Ease): Promise<void>
  wait(ms: number): Promise<void>
  tick(dtMs: number): void
  /** Jumps every running tween to its end and resolves it. */
  clear(): void
  /** When on, new tweens finish at once, so awaits never hang on a stage that stopped ticking. */
  setInstant(on: boolean): void
  busy(): boolean
}

interface Running {
  t: number
  ms: number
  fn: (k: number) => void
  e: Ease
  resolve: () => void
}

export function createTweens(): Tweens {
  let list: Running[] = []
  let instant = false
  const run = (ms: number, fn: (k: number) => void, e: Ease = ease.linear) =>
    new Promise<void>((resolve) => {
      if (instant || !(ms > 0)) {
        fn(e(1))
        resolve()
        return
      }
      list.push({ t: 0, ms, fn, e, resolve })
    })
  return {
    run,
    wait: (ms) => run(ms, () => undefined),
    tick(dt) {
      if (!list.length) return
      const now = list.slice()
      for (const tw of now) {
        tw.t += dt
        const k = Math.min(1, tw.t / tw.ms)
        tw.fn(tw.e(k))
      }
      const finished = now.filter((tw) => tw.t >= tw.ms)
      if (finished.length) {
        list = list.filter((tw) => tw.t < tw.ms)
        for (const tw of finished) tw.resolve()
      }
    },
    clear() {
      const all = list
      list = []
      for (const tw of all) {
        tw.fn(tw.e(1))
        tw.resolve()
      }
    },
    setInstant(on) {
      instant = on
    },
    busy: () => list.length > 0,
  }
}
