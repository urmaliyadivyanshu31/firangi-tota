// The era desks, found by file name: every `./<name>.ts` here default-exports an EraDressing.
// `index.ts` and files starting with `_` (the sample) are skipped. Adding a desk means adding its
// file; nothing here changes. These modules import three.js, so only the lazy stage chunk may
// import this file (ruling R10).
import type { EraId } from '../../content/types'
import type { EraDressing } from '../types'
import { sampleDressing } from './_sample'

type EraModule = { default?: EraDressing }

const modules = import.meta.glob<EraModule>(['./*.ts', '!./index.ts', '!./_*.ts'], { eager: true })

function collect(mods: Record<string, EraModule>): Map<EraId, EraDressing> {
  const out = new Map<EraId, EraDressing>()
  for (const [path, mod] of Object.entries(mods)) {
    const file = path.slice(path.lastIndexOf('/') + 1)
    if (file === 'index.ts' || file.startsWith('_')) continue
    const d = mod.default
    if (!d || typeof d.id !== 'string' || typeof d.build !== 'function') {
      throw new Error(`[eras] ${file} must default-export an EraDressing`)
    }
    const dup = out.get(d.id)
    if (dup) throw new Error(`[eras] two desks claim the id "${d.id}" (${file})`)
    out.set(d.id, d)
  }
  return out
}

const BY_ID = collect(modules)

/** Every era desk that exists, in no particular order. */
export const ALL_DRESSINGS: readonly EraDressing[] = [...BY_ID.values()]

/** True when `id` has its own desk (and is not falling back to the sample). */
export function hasDressing(id: EraId): boolean {
  return BY_ID.has(id)
}

/**
 * The desk for an era. An era whose desk has not landed yet gets the sample room, tagged with the
 * requested id so the stage still uses that era's palette, paper and 2D fallback.
 */
export function dressingFor(id: EraId): EraDressing {
  return BY_ID.get(id) ?? { ...sampleDressing, id }
}
