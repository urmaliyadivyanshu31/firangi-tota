// @vitest-environment node
// The production voice function runs as a plain Node ES module on Vercel (TypeScript is compiled
// file by file, not bundled). Node needs full file names in relative imports, and it has no
// import.meta.glob. These tests walk every file the function reaches and check both rules, so a
// content change cannot break read-aloud in production while everything passes locally.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = resolve(__dirname, '../..')
const IMPORT_RE = /(?:^|\n)\s*(import|export)\s+(type\s+)?(?:[^'";]*?\sfrom\s+)?['"]([^'"]+)['"]/g

interface Edge { from: string; spec: string; typeOnly: boolean }

function edges(file: string): Edge[] {
  const src = readFileSync(file, 'utf8')
  const out: Edge[] = []
  for (const m of src.matchAll(IMPORT_RE)) out.push({ from: file, spec: m[3]!, typeOnly: !!m[2] })
  return out
}

function walk(entry: string) {
  const seen = new Set<string>()
  const problems: string[] = []
  const queue = [entry]
  while (queue.length) {
    const file = queue.pop()!
    if (seen.has(file)) continue
    seen.add(file)
    const src = readFileSync(file, 'utf8')
    if (/import\.meta\.(?:glob\s*[<(]|env\b\s*[.[])/.test(src)) {
      problems.push(`${relative(ROOT, file)} uses import.meta (Vite only)`)
    }
    for (const e of edges(file)) {
      if (!e.spec.startsWith('.')) continue
      if (e.typeOnly) continue // erased at compile time
      if (!e.spec.endsWith('.js')) {
        problems.push(`${relative(ROOT, file)}: import '${e.spec}' needs a .js ending`)
        continue
      }
      const target = resolve(dirname(file), e.spec.replace(/\.js$/, '.ts'))
      if (!existsSync(target)) problems.push(`${relative(ROOT, file)}: '${e.spec}' does not resolve`)
      else queue.push(target)
    }
  }
  return { seen, problems }
}

function tsFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    return statSync(p).isDirectory() ? tsFiles(p) : p.endsWith('.ts') ? [p] : []
  })
}

describe('voice function imports', () => {
  it('every relative import the Vercel function reaches is Node-ready', () => {
    const { seen, problems } = walk(join(ROOT, 'api/voice.ts'))
    expect(problems).toEqual([])
    // Sanity: the walk really reached the content.
    expect([...seen].some((f) => f.includes('src/content/eras/delhi-1947/messages.ts'))).toBe(true)
    expect([...seen].some((f) => f.endsWith('src/game/dates.ts'))).toBe(true)
  })

  it('the function never reaches UI or browser code', () => {
    const { seen } = walk(join(ROOT, 'api/voice.ts'))
    const bad = [...seen].map((f) => relative(ROOT, f)).filter((f) => /^src\/(ui|scene|audio|app\.ts|main\.ts)/.test(f))
    expect(bad).toEqual([])
  })

  it('browser code never imports server code (the key lives only there)', () => {
    const bad = tsFiles(join(ROOT, 'src')).filter((f) => edges(f).some((e) => /(^|\/)server\//.test(e.spec) || e.spec.includes('elevenlabs')))
    expect(bad.map((f) => relative(ROOT, f))).toEqual([])
  })
})
