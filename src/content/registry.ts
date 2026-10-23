import type { Era, EraId } from './types'

// Auto-discovers src/content/eras/<folder>/index.ts (default export: Era).
// Folders starting with `_` are fixtures and are skipped. Content writers never edit this file.
const modules = import.meta.glob<{ default: Era }>('./eras/*/index.ts', { eager: true })

export const ERAS: Era[] = Object.entries(modules)
  .filter(([path]) => !path.split('/').some((part) => part.startsWith('_')))
  .map(([, mod]) => mod.default)
  .sort((a, b) => a.order - b.order)

export function eraById(id: EraId): Era {
  const era = ERAS.find((e) => e.id === id)
  if (!era) throw new Error(`Unknown era "${id}". Known eras: ${ERAS.map((e) => e.id).join(', ') || '(none)'}`)
  return era
}
