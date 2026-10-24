// @vitest-environment node
// scripts/og-cards.mjs: the build draws every share card into dist/og, then checks them all; a
// missing, extra, oversized or malformed card fails the build.
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { parseShareCode } from '../../src/game/share-code'
import { CARD_H, CARD_W } from '../../server/og/card'
import { cardFile } from '../../server/share'
import { CARD_LIMIT, checkCards, jpegSize, skipRequested } from '../../scripts/og-cards.mjs'

const SCRIPT = resolve(__dirname, '../../scripts/og-cards.mjs')
const dirs: string[] = []
const tmp = () => {
  const d = mkdtempSync(join(tmpdir(), 'ft-og-cards-'))
  dirs.push(d)
  return d
}
afterEach(() => {
  for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true })
})

/** A JPEG's first bytes with a frame header of the given size, padded to `bytes`. */
function fakeJpeg(w: number, h: number, bytes: number): Buffer {
  const head = Buffer.from([0xff, 0xd8, 0xff, 0xc0, 0x00, 0x11, 0x08, h >> 8, h & 0xff, w >> 8, w & 0xff])
  return Buffer.concat([head, Buffer.alloc(Math.max(0, bytes - head.length))])
}

function run(args: string[], env: Record<string, string | undefined> = {}) {
  const base = { ...process.env }
  delete base.CI
  delete base.VERCEL
  delete base.OG_CARDS
  return spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8', env: { ...base, ...env }, timeout: 60_000 })
}

describe('checking the cards', () => {
  const OK = { width: CARD_W, height: CARD_H }

  it('passes a folder holding exactly the expected 1200 x 630 cards, none over the limit', () => {
    const dir = tmp()
    writeFileSync(join(dir, 'a.jpg'), fakeJpeg(CARD_W, CARD_H, 120 * 1024))
    writeFileSync(join(dir, 'b.jpg'), fakeJpeg(CARD_W, CARD_H, CARD_LIMIT))
    expect(checkCards(dir, ['a.jpg', 'b.jpg'], OK)).toEqual([])
    expect(CARD_LIMIT).toBe(200 * 1024) // WhatsApp's limit is about 300 KB
  })

  it('names each card that is missing, extra, too big, the wrong size, blank or not a JPEG', () => {
    const dir = tmp()
    writeFileSync(join(dir, 'big.jpg'), fakeJpeg(CARD_W, CARD_H, CARD_LIMIT + 1))
    writeFileSync(join(dir, 'small.jpg'), fakeJpeg(600, 315, 100 * 1024))
    writeFileSync(join(dir, 'blank.jpg'), fakeJpeg(CARD_W, CARD_H, 2000))
    writeFileSync(join(dir, 'png.jpg'), Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47]), Buffer.alloc(100 * 1024)]))
    writeFileSync(join(dir, 'stale.jpg'), fakeJpeg(CARD_W, CARD_H, 100 * 1024))
    const problems = checkCards(dir, ['big.jpg', 'small.jpg', 'blank.jpg', 'png.jpg', 'gone.jpg'], OK)
    expect(problems).toEqual([
      'big.jpg: 200.0 KB, over 200 KB',
      'small.jpg: not a 1200x630 JPEG',
      'blank.jpg: only 2000 bytes',
      'png.jpg: not a 1200x630 JPEG',
      'gone.jpg: missing',
      'stale.jpg: not a card this build draws',
    ])
    expect(checkCards(join(dir, 'nowhere'), ['a.jpg'], OK)).toEqual(['a.jpg: missing'])
  })

  it('skips only when asked, and never on CI or Vercel', () => {
    expect(skipRequested({})).toBe(false)
    expect(skipRequested({ OG_CARDS: '0' })).toBe(true)
    expect(skipRequested({ OG_CARDS: 'off' })).toBe(true)
    expect(skipRequested({ OG_CARDS: '1' })).toBe(false)
    expect(skipRequested({ OG_CARDS: '0', CI: 'true' })).toBe(false)
    expect(skipRequested({ OG_CARDS: '0', VERCEL: '1' })).toBe(false)
  })
})

describe('the build step', () => {
  const CODES = ['1857-e7s-en', '1947-h3c-hi']
  const files = CODES.map((c) => cardFile(parseShareCode(c)!.result))

  it('draws real cards with the server renderer into <out>/og, named by their drawing, then copies them from its cache', () => {
    const out = tmp()
    const cache = tmp()
    const first = run(['--out', out, '--cache', cache, '--only', CODES.join(',')])
    expect(first.status, first.stderr).toBe(0)
    expect(first.stdout).toContain('2 cards (2 drawn on 2 threads, 0 from the cache)')
    expect(readdirSync(join(out, 'og')).sort()).toEqual([...files].sort())
    for (const f of files) {
      const img = readFileSync(join(out, 'og', f))
      expect(jpegSize(img), f).toEqual({ w: CARD_W, h: CARD_H })
      expect(img.length).toBeLessThanOrEqual(CARD_LIMIT)
      expect(img.length).toBeGreaterThan(40 * 1024) // a real picture, not a blank
    }
    const again = run(['--out', out, '--cache', cache, '--only', CODES.join(',')])
    expect(again.status, again.stderr).toBe(0)
    expect(again.stdout).toContain('2 cards (0 drawn on 0 threads, 2 from the cache)')
    expect(readdirSync(join(out, 'og')).sort()).toEqual([...files].sort())
  }, 90_000)

  it('starts from an empty folder, so no card of an older drawing is left behind', () => {
    const out = tmp()
    mkdirSync(join(out, 'og'))
    writeFileSync(join(out, 'og', '1857-e7s-en.00000000.jpg'), 'old')
    const res = run(['--out', out, '--cache', tmp(), '--only', CODES[0]!])
    expect(res.status, res.stderr).toBe(0)
    expect(readdirSync(join(out, 'og'))).toEqual([files[0]])
  }, 90_000)

  it('refuses a code the game cannot produce', () => {
    const res = run(['--out', tmp(), '--cache', tmp(), '--only', '1857-e6s-en'])
    expect(res.status).toBe(1)
    expect(res.stderr).toContain('1857-e6s-en is not a canonical share code')
  }, 90_000)

  it('skips everything with OG_CARDS=0 locally, but not on CI', () => {
    const out = tmp()
    const skipped = run(['--out', out, '--cache', tmp(), '--only', CODES[0]!], { OG_CARDS: '0' })
    expect(skipped.status).toBe(0)
    expect(skipped.stdout).toContain('skipped')
    expect(existsSync(join(out, 'og'))).toBe(false)
    const ci = run(['--out', out, '--cache', tmp(), '--only', CODES[0]!], { OG_CARDS: '0', CI: 'true' })
    expect(ci.status, ci.stderr).toBe(0)
    expect(readdirSync(join(out, 'og'))).toEqual([files[0]])
  }, 90_000)
})
