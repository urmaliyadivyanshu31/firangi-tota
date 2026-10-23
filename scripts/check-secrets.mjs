#!/usr/bin/env node
// Fails if any file tracked by git looks like it holds a secret. This repo is public, so an API
// key in any commit is a leaked key. Run: npm run check-secrets (CI runs it on every push).
// Findings name the file, line and rule, never the matched text.
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

export const RULES = [
  { name: 'ElevenLabs API key', re: /\bsk_[0-9a-f]{32,}\b/ },
  { name: 'ELEVENLABS_API_KEY with a value', re: /ELEVENLABS_API_KEY\s*[:=]\s*['"]?[^\s'"#]{8,}/ },
  { name: 'secret-looking env assignment', re: /^\s*(?:export\s+)?[A-Z][A-Z0-9_]*(?:API_KEY|SECRET|TOKEN|PASSWORD)\s*=\s*['"]?[A-Za-z0-9_\-/+=.]{16,}/m },
  { name: 'OpenAI-style key', re: /\bsk-(?:proj-|ant-)?[A-Za-z0-9_-]{32,}/ },
  { name: 'GitHub token', re: /\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{40,})\b/ },
  { name: 'AWS access key id', re: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/ },
  { name: 'Google API key', re: /\bAIza[0-9A-Za-z_-]{35}\b/ },
  { name: 'Slack token', re: /\bxox[abprs]-[A-Za-z0-9-]{10,}/ },
  { name: 'Stripe live key', re: /\b[rs]k_live_[0-9A-Za-z]{20,}/ },
  { name: 'private key block', re: /-----BEGIN (?:[A-Z]+ )?PRIVATE KEY-----/ },
]

/** Env files must never be tracked; only .env.example (with empty values) is allowed. */
export function isForbiddenPath(path) {
  const base = path.split('/').pop() ?? path
  return /^\.env(?:\..+)?$/.test(base) && base !== '.env.example'
}

/** Findings for one file's text: [{ path, line, rule }]. */
export function scanText(path, text) {
  const findings = []
  if (isForbiddenPath(path)) findings.push({ path, line: 0, rule: 'tracked env file' })
  const lines = text.split(/\r?\n/)
  for (let i = 0; i < lines.length; i++) {
    for (const rule of RULES) {
      if (rule.re.test(lines[i])) findings.push({ path, line: i + 1, rule: rule.name })
    }
  }
  return findings
}

function trackedFiles(cwd) {
  const out = execFileSync('git', ['ls-files', '-z'], { cwd, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  return out.split('\0').filter(Boolean)
}

function isBinary(buf) {
  return buf.subarray(0, 8000).includes(0)
}

export function scanRepo(cwd = process.cwd()) {
  const findings = []
  for (const path of trackedFiles(cwd)) {
    let buf
    try {
      buf = readFileSync(`${cwd}/${path}`)
    } catch {
      continue // deleted in the working tree but still in the index
    }
    if (isBinary(buf)) {
      if (isForbiddenPath(path)) findings.push({ path, line: 0, rule: 'tracked env file' })
      continue
    }
    findings.push(...scanText(path, buf.toString('utf8')))
  }
  return findings
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const findings = scanRepo()
  if (findings.length) {
    console.error(`check-secrets: ${findings.length} possible secret(s) in tracked files:`)
    for (const f of findings) console.error(`  ${f.path}${f.line ? `:${f.line}` : ''}  ${f.rule}`)
    console.error('Remove the secret, rotate it if it was ever pushed, and keep keys in .env.local (gitignored).')
    process.exit(1)
  }
  console.log('check-secrets: no secrets found in tracked files')
}
