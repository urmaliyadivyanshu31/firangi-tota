// @vitest-environment node
// The production voice function runs as plain Node ES modules on Vercel (each TypeScript file is
// compiled on its own, not bundled). These tests walk every file it reaches, through static and
// dynamic imports, and report the exact file and line of anything that would break there.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = resolve(__dirname, '../..')
const STATIC_RE = /(?:^|\n)[ \t]*(import|export)\s+(type\s+)?(?:[^'";]*?\sfrom\s+)?['"]([^'"]+)['"]/g
const DYNAMIC_RE = /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g
const VITE_ONLY_RE = /import\.meta\.(?:glob\s*[<(]|env\b\s*[.[])/g

interface Edge { spec: string; typeOnly: boolean; line: number }

const lineAt = (src: string, index: number) => src.slice(0, index).split('\n').length

function edges(src: string): Edge[] {
  const out: Edge[] = []
  for (const m of src.matchAll(STATIC_RE)) {
    const at = m.index! + m[0].indexOf(m[1]!)
    out.push({ spec: m[3]!, typeOnly: !!m[2], line: lineAt(src, at) })
  }
  for (const m of src.matchAll(DYNAMIC_RE)) out.push({ spec: m[1]!, typeOnly: false, line: lineAt(src, m.index!) })
  return out
}

/** The .ts source a `.js` import compiles from (Node on Vercel needs the full file name). */
function resolveSpec(from: string, spec: string): string | null {
  if (!spec.endsWith('.js')) return null
  const target = resolve(dirname(from), spec.replace(/\.js$/, '.ts'))
  return existsSync(target) && statSync(target).isFile() ? target : null
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
    const where = (line: number) => `${relative(ROOT, file)}:${line}`
    for (const m of src.matchAll(VITE_ONLY_RE)) {
      problems.push(`${where(lineAt(src, m.index!))} uses ${m[0].trim()}…, which only works inside Vite`)
    }
    for (const e of edges(src)) {
      if (!e.spec.startsWith('.') || e.typeOnly) continue // type-only imports are erased
      if (!e.spec.endsWith('.js')) {
        problems.push(`${where(e.line)} import '${e.spec}' needs a .js ending for the voice server: write '${e.spec}.js'`)
        continue
      }
      const target = resolveSpec(file, e.spec)
      if (!target) problems.push(`${where(e.line)} import '${e.spec}' does not resolve to a .ts file`)
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
  const { seen, problems } = walk(join(ROOT, 'api/voice.ts'))
  const reached = [...seen].map((f) => relative(ROOT, f))

  it('every import the Vercel function reaches resolves, and none is Vite-only', () => {
    expect(problems).toEqual([])
  })

  it('the walk reaches the content', () => {
    expect(reached).toContain('src/content/eras/delhi-1947/messages.ts')
    expect(reached).toContain('src/game/dates.ts')
  })

  it('the function never reaches UI or browser code', () => {
    expect(reached.filter((f) => /^src\/(ui|scene|audio|app\.ts|main\.ts)/.test(f))).toEqual([])
  })

  it('reports the exact file and line of a broken import', () => {
    const from = join(ROOT, 'server/voice.ts')
    expect(resolveSpec(from, './voices.js')).toBe(join(ROOT, 'server/voices.ts'))
    expect(resolveSpec(from, './voices')).toBeNull()
    expect(resolveSpec(from, './no-such-file.js')).toBeNull()
    expect(edges("import a from 'x'\n\nimport { b } from './b'\n")[1]).toEqual({ spec: './b', typeOnly: false, line: 3 })
  })

  it('browser code never imports server code or the SDK (the key lives only there)', () => {
    const bad = tsFiles(join(ROOT, 'src')).filter((f) =>
      edges(readFileSync(f, 'utf8')).some((e) => /(^|\/)server\//.test(e.spec) || e.spec.includes('elevenlabs')))
    expect(bad.map((f) => relative(ROOT, f))).toEqual([])
  })
})
