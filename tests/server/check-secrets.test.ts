// @vitest-environment node
import { randomBytes } from 'node:crypto'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { isForbiddenPath, scanRepo, scanText } from '../../scripts/check-secrets.mjs'

// Fake keys are built at runtime, so this file never holds a key-shaped literal.
const fakeKey = () => ['sk', randomBytes(24).toString('hex')].join('_')
const envName = ['ELEVENLABS', 'API', 'KEY'].join('_')

describe('check-secrets', () => {
  it('flags an ElevenLabs-style key planted in a file', () => {
    const findings = scanText('src/oops.ts', `const k = "${fakeKey()}"\n`)
    expect(findings).toEqual([{ path: 'src/oops.ts', line: 1, rule: 'ElevenLabs API key' }])
  })

  it('flags the env variable with a value, and reports the line', () => {
    const findings = scanText('notes.md', `# setup\n${envName}=${fakeKey()}\n`)
    expect(findings.map((f) => f.rule)).toContain(`${envName} with a value`)
    expect(findings.every((f) => f.line === 2)).toBe(true)
  })

  it('allows the variable with no value, as in .env.example and the README', () => {
    expect(scanText('.env.example', `${envName}=\n`)).toEqual([])
    expect(scanText('README.md', `Add \`${envName}=\` to .env.local\n`)).toEqual([])
  })

  it('flags other common key shapes', () => {
    const gh = ['ghp', randomBytes(20).toString('hex')].join('_')
    const pem = ['-----BEGIN', 'PRIVATE', 'KEY-----'].join(' ')
    expect(scanText('a.txt', gh).map((f) => f.rule)).toEqual(['GitHub token'])
    expect(scanText('a.txt', pem).map((f) => f.rule)).toEqual(['private key block'])
  })

  it('never puts the matched text in a finding', () => {
    const key = fakeKey()
    expect(JSON.stringify(scanText('x.ts', key))).not.toContain(key)
  })

  it('refuses tracked env files but allows .env.example', () => {
    expect(isForbiddenPath('.env.local')).toBe(true)
    expect(isForbiddenPath('.env')).toBe(true)
    expect(isForbiddenPath('app/.env.production')).toBe(true)
    expect(isForbiddenPath('.env.example')).toBe(false)
    expect(scanText('.env.local', '')).toEqual([{ path: '.env.local', line: 0, rule: 'tracked env file' }])
  })

  it('the repository itself is clean', () => {
    expect(scanRepo(resolve(__dirname, '../..'))).toEqual([])
  })
})
