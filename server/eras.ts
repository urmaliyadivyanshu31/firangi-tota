// The eras the voice server can read. Server code cannot use src/content/registry.ts, because its
// import.meta.glob only works inside Vite, and the production function runs in plain Node.
// Node ES modules also need full file names, so every relative import this file reaches ends in
// `.js` (TypeScript maps it to the `.ts` file). tests/server/imports.test.ts checks both rules.
import type { Era, EraId } from '../src/content/types.js'
import bombay1942 from '../src/content/eras/bombay-1942/index.js'
import delhi1857 from '../src/content/eras/delhi-1857/index.js'
import delhi1947 from '../src/content/eras/delhi-1947/index.js'
import lahore1929 from '../src/content/eras/lahore-1929/index.js'

// A Record over EraId: adding an era to the EraId type fails the typecheck until it is listed here.
export const SERVER_ERAS: Record<EraId, Era> = {
  'delhi-1857': delhi1857,
  'lahore-1929': lahore1929,
  'bombay-1942': bombay1942,
  'delhi-1947': delhi1947,
}

export function isEraId(v: string): v is EraId {
  return Object.prototype.hasOwnProperty.call(SERVER_ERAS, v)
}
