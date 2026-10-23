import { describe, expect, it } from 'vitest'
import fixture from '../../src/content/eras/_fixture'
import { validateEra } from '../../src/content/validate'
import type { Era } from '../../src/content/types'

const fresh = (): Era => structuredClone(fixture)
const msg = (e: Era, id: string) => {
  const m = e.messages.find((x) => x.id === id)
  if (!m) throw new Error('no message ' + id)
  return m
}
const has = (e: Era, text: string) => expect(validateEra(e).some((p) => p.includes(text))).toBe(true)

describe('validateEra', () => {
  it('accepts the untouched fixture', () => {
    expect(validateEra(fresh())).toEqual([])
  })
  it('requires a tell on a forged message', () => {
    const e = fresh()
    msg(e, 'm2').tells = []
    expect(validateEra(e)).toContain('m2: forged message needs at least one tell')
  })
  it('requires why on a real message', () => {
    const e = fresh()
    delete msg(e, 'm1').why
    has(e, 'why')
  })
  it('rejects tells on a genuine message', () => {
    const e = fresh()
    msg(e, 'm1').tells = structuredClone(msg(e, 'm2').tells)
    has(e, 'genuine message must not have tells')
  })
  it('rejects why or document on a forged message', () => {
    const e = fresh()
    msg(e, 'm2').why = structuredClone(msg(e, 'm1').why)
    msg(e, 'm2').document = { sources: [{ id: 's1' }] }
    has(e, 'forged message must not have why')
    has(e, 'forged message must not have document')
  })
  it('flags an unknown source', () => {
    const e = fresh()
    e.facts[0]!.sources = [{ id: 'nope' }]
    has(e, 'unknown source')
  })
  it('flags unknown sources in every place a SourceRef appears', () => {
    const e = fresh()
    msg(e, 'm1').why!.sources = [{ id: 'x1' }]
    msg(e, 'm1').document = { sources: [{ id: 'x2' }] }
    msg(e, 'm2').tells![0]!.sources = [{ id: 'x3' }]
    e.receipts[0]!.source = { id: 'x4' }
    e.epilogue.sources = [{ id: 'x5' }]
    const problems = validateEra(e).filter((p) => p.includes('unknown source'))
    expect(problems.length).toBeGreaterThanOrEqual(5)
  })
  it('flags an unknown fact on a tell', () => {
    const e = fresh()
    msg(e, 'm2').tells![0]!.factId = 'nope'
    has(e, 'unknown fact')
  })
  it('flags a missing hi string', () => {
    const e = fresh()
    e.messages[0]!.from.hi = ''
    has(e, 'missing hi')
  })
  it('flags a missing en string', () => {
    const e = fresh()
    e.epilogue.caught[0]!.en = '  '
    has(e, 'missing en')
  })
  it('flags a check absent from the filled text', () => {
    const e = fresh()
    msg(e, 'm1').checks = { en: ['guards changed'], hi: ['यह नहीं है'] }
    has(e, 'check not found')
  })
  it('runs checks against the filled text, not the template', () => {
    const e = fresh()
    msg(e, 'm1').checks = { en: ['{date}'], hi: ['पहरेदार बदले'] }
    has(e, 'check not found')
  })
  it('flags duplicate ids', () => {
    const e = fresh()
    e.messages[1]!.id = 'm1'
    has(e, 'duplicate id')
  })
  it('flags onDay outside 1-14', () => {
    const e = fresh()
    msg(e, 'm1').onDay = 15
    has(e, 'onDay')
  })
  it('flags arrivesOnDay outside 1-14', () => {
    const e = fresh()
    e.rules[0]!.arrivesOnDay = 0
    has(e, 'arrivesOnDay')
  })
  it('flags an invalid windowStart', () => {
    const e = fresh()
    e.windowStart = '1857-13-45'
    has(e, 'windowStart')
  })
})
