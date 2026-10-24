import { afterEach, describe, expect, it, vi } from 'vitest'
import * as THREE from 'three'
import { mountFallback } from '../../src/scene/fallback'
import { PILE, STACK, createRewardKit, pileLayout } from '../../src/scene/rewards'
import { LOOKS } from '../../src/scene/reward-art'
import type { RevealSpec, SheetSpec, StageCueName } from '../../src/scene/types'
import { fake2d } from './fake-canvas'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

describe('the pile in the desk corner', () => {
  it('stacks coins six high, tops out at twelve and lets a slip count the rest', () => {
    const few = pileLayout('delhi-1857', { 'paisa-1857': 4 })
    expect(few.placed.filter((p) => p.id === 'paisa-1857')).toHaveLength(4)
    expect(few.slips).toEqual([])
    const many = pileLayout('delhi-1857', { 'paisa-1857': 30, 'rupee-1857': 7, 'seal-1857': 2 })
    expect(many.placed.filter((p) => p.id === 'paisa-1857')).toHaveLength(STACK * 2)
    expect(many.slips.map((s) => [s.id, s.n])).toEqual([['paisa-1857', 30], ['seal-1857', 2]])
    // a stack rises a coin's thickness at a time
    const ys = many.placed.filter((p) => p.id === 'paisa-1857').slice(0, STACK).map((p) => p.pos[1])
    for (let i = 1; i < ys.length; i++) expect(ys[i]!).toBeGreaterThan(ys[i - 1]!)
  })

  it('ignores another chapter’s items and stays inside the free corner, clear of the TOTA stamp and the desk edges', () => {
    expect(pileLayout('lahore-1929', { 'paisa-1857': 9 }).placed).toEqual([])
    for (const [era, counts] of [
      ['delhi-1857', { 'paisa-1857': 40, 'halwa-1857': 9, 'rupee-1857': 40, 'mohur-1857': 9, 'seal-1857': 9 }],
      ['lahore-1929', { 'anna-1929': 40, 'barfi-1929': 9, 'rupee-1929': 40, 'note-1929': 9, 'leaflet-1929': 9 }],
      ['bombay-1942', { 'pice-1942': 40, 'halwa-1942': 9, 'rupee-1942': 40, 'valve-1942': 9, 'card-1942': 9 }],
      ['delhi-1947', { 'anna-1947': 40, 'jalebi-1947': 9, 'rupee-1947': 40, 'pass-1947': 9, 'badge-1947': 9 }],
    ] as const) {
      const { placed, slips } = pileLayout(era, counts)
      const c = Math.cos(PILE.yaw)
      const s = Math.sin(PILE.yaw)
      for (const p of [...placed, ...slips.map((x) => ({ id: x.id, pos: x.pos }))]) {
        const look = LOOKS[p.id]!
        const r = 'r' in look ? look.r : Math.max((look as { w: number }).w, (look as { d: number }).d) / 2
        const wx = PILE.x + p.pos[0] * c + p.pos[2] * s
        const wz = PILE.z - p.pos[0] * s + p.pos[2] * c
        expect(wx - r, `${p.id} x`).toBeGreaterThan(0.3) // the TOTA stamp's base ends at x = 0.292
        expect(wx + r, `${p.id} x`).toBeLessThan(0.5) // the desk's right edge is at 0.52
        expect(wz + r, `${p.id} z`).toBeLessThan(0.29) // the front edge is at 0.31
        expect(wz - r, `${p.id} z`).toBeGreaterThan(0.06)
      }
    }
  })

  it('is one merged mesh for every item, rebuilt only when the counts change', () => {
    const scene = new THREE.Scene()
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation((() => fake2d().ctx) as unknown as HTMLCanvasElement['getContext'])
    const kit = createRewardKit({ era: 'delhi-1947', tier: 'low', reduced: false, scene })
    scene.add(kit.group)
    kit.setCounts({ 'anna-1947': 5, 'jalebi-1947': 2, 'rupee-1947': 1, 'pass-1947': 1, 'badge-1947': 1 })
    const meshes = () => kit.group.children.filter((o) => (o as THREE.Mesh).isMesh)
    expect(meshes()).toHaveLength(1)
    const first = meshes()[0]
    kit.setCounts({ 'anna-1947': 5, 'jalebi-1947': 2, 'rupee-1947': 1, 'pass-1947': 1, 'badge-1947': 1 })
    expect(meshes()[0]).toBe(first)
    kit.setCounts({ 'anna-1947': 30 })
    // a slip for the coins past twelve: one more small mesh
    expect(meshes()).toHaveLength(2)
    expect(scene.children.some((o) => (o as THREE.Light).isLight)).toBe(false)
    kit.setCounts({})
    expect(meshes()).toHaveLength(0)
    expect(kit.piece('anna-1947')?.lid).toBeNull()
    expect(kit.piece('jalebi-1947')?.lid).not.toBeNull()
    kit.dispose()
    expect(kit.group.parent).toBeNull()
  })
})

describe('rewards on the flat desk', () => {
  const sheet: SheetSpec = {
    era: 'bombay-1942', channel: 'radio', lang: 'en', from: 'Usha Mehta', to: 'All listeners', dateLine: 'Friday, 30 October 1942',
    body: 'This is the Congress Radio calling on 42.34 metres from somewhere in India.', checks: [], pencil: false,
  }
  const verdict: RevealSpec = {
    outcome: 'right', real: true, documentMark: false, highlight: [], note: 'checks out',
    back: { verdictLine: 'Right · This message was genuine', tell: 'Congress Radio called on 42.34 metres.', stamp: { text: 'Right', tone: 'right', style: 'raided' }, source: 'Usha Mehta (1969), p. 12' },
    lang: 'en',
  }

  it('drop onto the card’s back with their sound, then join the corner when the card is tossed', async () => {
    const f = fake2d()
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation((() => f.ctx) as unknown as HTMLCanvasElement['getContext'])
    const frames = new Map<number, FrameRequestCallback>()
    let id = 0
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => (frames.set(++id, cb), id))
    vi.stubGlobal('cancelAnimationFrame', (n: number) => frames.delete(n))
    const run = (t: number) => {
      const cbs = [...frames.values()]
      frames.clear()
      for (const cb of cbs) cb(t)
    }
    const cues: StageCueName[] = []
    const el = document.createElement('div')
    document.body.appendChild(el)
    const fb = mountFallback(el, 'bombay-1942', { onCue: (n) => cues.push(n) })
    await fb.showMessage(sheet)
    const shown = fb.reveal(verdict)
    fb.skip()
    await shown
    const t0 = performance.now()
    const done = fb.earn({ drops: [{ item: 'pice-1942', qty: 1, jackpot: false }], after: { 'pice-1942': 1 } })
    expect(fb.getEarnRect()).not.toBeNull()
    run(t0 + 100)
    expect(cues).not.toContain('coin')
    run(t0 + 450)
    expect(cues).toContain('coin')
    run(t0 + 700)
    await done
    // drawn on the card from now on
    const before = f.texts.length
    fb.redrawMessage(sheet)
    expect(f.texts.slice(before).map((t) => t.text)).toContain('ANNA')
    // tossed: the card goes, and the corner keeps the coin
    void fb.toss(true)
    expect(fb.getEarnRect()).toBeNull()
    const after = f.texts.length
    fb.setEra('bombay-1942')
    expect(f.texts.slice(after).map((t) => t.text)).toContain('ANNA')
    // a jackpot under its own sound, landed at once when it is a new desk catching up (no sound)
    fb.setPile({ era: 'bombay-1942', counts: {} })
    cues.length = 0
    await fb.earn({ drops: [{ item: 'valve-1942', qty: 1, jackpot: true }], after: { 'valve-1942': 1 }, now: true })
    expect(cues).toEqual([])
    fb.dispose()
  })

  it('with no card turned over, they go straight to the corner', async () => {
    const f = fake2d()
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation((() => f.ctx) as unknown as HTMLCanvasElement['getContext'])
    const fb = mountFallback(document.createElement('div'), 'delhi-1857')
    await expect(fb.earn({ drops: [{ item: 'mohur-1857', qty: 1, jackpot: true }], after: { 'mohur-1857': 1 } })).resolves.toBeUndefined()
    expect(fb.getEarnRect()).toBeNull()
    fb.dispose()
  })
})
