// A recording 2D context for jsdom (which has no canvas backend). measureText is deterministic:
// every character is 0.5 em wide, a Devanagari cluster mark (matra, virama, nukta) adds nothing,
// so wrapping can be checked against a known width.
export interface Drawn {
  text: string
  x: number
  y: number
  font: string
}

export interface FakeCtx {
  ctx: CanvasRenderingContext2D
  calls: string[]
  texts: Drawn[]
}

const COMBINING = /[ऀ-ःऺ-ॏ॑-ॗॢॣ]/g

export function fontPx(font: string): number {
  const m = /(\d+(?:\.\d+)?)px/.exec(font)
  return m ? Number(m[1]) : 10
}

export function textWidth(text: string, font: string): number {
  return text.replace(COMBINING, '').length * fontPx(font) * 0.5
}

export function fake2d(): FakeCtx {
  const calls: string[] = []
  const texts: Drawn[] = []
  const grad = { addColorStop: () => undefined }
  const state: Record<string, unknown> = { font: '10px sans-serif', globalCompositeOperation: 'source-over' }
  const ctx = new Proxy(state, {
    get(target, key: string) {
      if (key in target) return target[key]
      if (key === 'measureText') return (t: string) => ({ width: textWidth(t, String(target.font)) })
      if (key === 'createLinearGradient' || key === 'createRadialGradient') return () => grad
      if (key === 'createPattern') return () => null
      if (key === 'createImageData') return (w: number, h: number) => ({ data: new Uint8ClampedArray(w * h * 4) })
      if (key === 'getImageData') return (_x: number, _y: number, w: number, h: number) => ({ data: new Uint8ClampedArray(w * h * 4) })
      if (key === 'fillText' || key === 'strokeText') {
        return (t: string, x: number, y: number) => {
          calls.push(key)
          if (key === 'fillText') texts.push({ text: t, x, y, font: String(target.font) })
        }
      }
      return () => {
        calls.push(key)
      }
    },
    set(target, key: string, value) {
      target[key] = value
      return true
    },
  }) as unknown as CanvasRenderingContext2D
  return { ctx, calls, texts }
}
