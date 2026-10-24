// Lets a build script import the server's TypeScript the way Vercel runs it: Node strips the types
// (Node 22.18 or later), and this resolve hook maps a relative `./x.js` import to `./x.ts` when only
// the .ts file exists (the server's imports end in `.js`, see tests/server/imports.test.ts).
import { existsSync } from 'node:fs'
import * as module from 'node:module'
import { fileURLToPath } from 'node:url'

/** The resolve hook, for module.registerHooks (in-thread) or module.register (its own thread). */
export function resolve(specifier, context, nextResolve) {
  const parent = context.parentURL
  if (/^\.\.?\//.test(specifier) && specifier.endsWith('.js') && parent?.startsWith('file:') && !parent.includes('/node_modules/')) {
    const js = new URL(specifier, parent)
    if (!existsSync(fileURLToPath(js))) {
      const ts = new URL(js.href.replace(/\.js$/, '.ts'))
      if (existsSync(fileURLToPath(ts))) return nextResolve(ts.href, context)
    }
  }
  return nextResolve(specifier, context)
}

/** Installs the hook on this thread (each worker thread calls it too). */
export function installTsHooks() {
  if (typeof module.registerHooks === 'function') module.registerHooks({ resolve })
  else module.register('./ts-hooks.mjs', import.meta.url)
}
