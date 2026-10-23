// The era desks (Ruling R23). Every `./<name>.ts` beside this file is discovered automatically;
// `index.ts` and files starting with `_` (the sample, fixtures) are skipped. A desk module exports
// its EraDressing, as the default export or a named one. This module imports three.js through the
// desks, so the app loads it with a dynamic import, in the lazy 3D chunk.
import type { EraId } from '../../content/types'
import type { EraDressing } from '../types'
import { sampleDressing } from './_sample'

const modules = import.meta.glob<Record<string, unknown>>(['./*.ts', '!./index.ts', '!./_*.ts'], { eager: true })

function isDressing(v: unknown): v is EraDressing {
  const d = v as Partial<EraDressing> | null
  return typeof d === 'object' && d !== null && typeof d.id === 'string' && typeof d.build === 'function' && typeof d.camera === 'object'
}

export const ALL_DRESSINGS: EraDressing[] = (() => {
  const byId = new Map<EraId, EraDressing>()
  for (const [path, mod] of Object.entries(modules).sort(([a], [b]) => a.localeCompare(b))) {
    const file = path.split('/').pop() ?? ''
    if (file === 'index.ts' || file.startsWith('_')) continue
    for (const v of Object.values(mod)) if (isDressing(v) && !byId.has(v.id)) byId.set(v.id, v)
  }
  return [...byId.values()]
})()

/** The desk for an era. Until an era's own desk is in, it gets the sample desk, never an error. */
export function dressingFor(id: EraId): EraDressing {
  return ALL_DRESSINGS.find((d) => d.id === id) ?? { ...sampleDressing, id }
}
