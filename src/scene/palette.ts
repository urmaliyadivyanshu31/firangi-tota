// Era palettes, shared by the 3D props and the 2D fallback. No three.js here.
import type { EraId } from '../content/types'

export type WoodType = 'sheesham' | 'teak' | 'deal' | 'walnut'

export interface Palette {
  /** Plaster or paint on the walls. */
  wall: number
  /** The dark the room falls into away from the lamp; also the fog and clear colour. */
  shade: number
  floor: number
  wood: WoodType
  paper: number
  /** Faint writing on the sheet. */
  ink: number
  paperStyle: 'hand' | 'typed'
  /** The lamp's glow. */
  lamp: number
  /** Night outside. */
  sky: number
  /** Cloth: blotter, runner, durrie. */
  accent: number
  /** Fittings: brass in 1857, tin and steel later. */
  metal: number
  /** Stamp handles. */
  handle: 'brass' | 'wood'
}

export const WOODS: Record<WoodType, { light: number; dark: number }> = {
  sheesham: { light: 0x8f5532, dark: 0x3b1d0f },
  teak: { light: 0xa9743f, dark: 0x573416 },
  deal: { light: 0xc29660, dark: 0x765030 },
  walnut: { light: 0x75503a, dark: 0x2c1b11 },
}

export const ERA_PALETTES: Record<EraId, Palette> = {
  // A chamber in the Fort at night: warm lime plaster, sheesham, a brass chirag
  'delhi-1857': {
    wall: 0x9b7d61, shade: 0x120a07, floor: 0x5b3d2b, wood: 'sheesham',
    paper: 0xe7d3a6, ink: 0x3b2516, paperStyle: 'hand',
    lamp: 0xffa04a, sky: 0x0c0f26, accent: 0x7c211b, metal: 0xc8963c, handle: 'brass',
  },
  // A rented room in Lahore: pale lime wash, a deal table, a hurricane lantern
  'lahore-1929': {
    wall: 0x8e9b86, shade: 0x0e100c, floor: 0x6c4b38, wood: 'deal',
    paper: 0xdcd3b9, ink: 0x2c2c2a, paperStyle: 'hand',
    lamp: 0xffb25e, sky: 0x10131c, accent: 0x9a6b3c, metal: 0x8d8c84, handle: 'wood',
  },
  // The Parekh Wadi flat at night: teal walls, teak, one bulb over the transmitter
  'bombay-1942': {
    wall: 0x4f7a77, shade: 0x0a1211, floor: 0x6f5b49, wood: 'teak',
    paper: 0xe9e1c8, ink: 0x23262e, paperStyle: 'typed',
    lamp: 0xffbd6e, sky: 0x0b1020, accent: 0x6b2c2c, metal: 0x6f6a5e, handle: 'wood',
  },
  // The cipher room: government cream, walnut, green baize, a desk lamp
  'delhi-1947': {
    wall: 0xc2b28c, shade: 0x15120c, floor: 0x4f4537, wood: 'walnut',
    paper: 0xefe2b3, ink: 0x2a2a2a, paperStyle: 'typed',
    lamp: 0xffd08e, sky: 0x101a2a, accent: 0x2f4a3a, metal: 0x9a9a94, handle: 'wood',
  },
}

/** 0xRRGGBB to a CSS colour, optionally with alpha. */
export function css(hex: number, alpha = 1): string {
  const r = (hex >> 16) & 255
  const g = (hex >> 8) & 255
  const b = hex & 255
  return alpha >= 1 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${alpha})`
}

/** Mix two 0xRRGGBB colours; k = 0 gives a, k = 1 gives b. */
export function mix(a: number, b: number, k: number): number {
  const ch = (s: number) => Math.round(((a >> s) & 255) * (1 - k) + ((b >> s) & 255) * k)
  return (ch(16) << 16) | (ch(8) << 8) | ch(0)
}
