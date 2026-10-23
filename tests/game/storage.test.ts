import { afterEach, describe, expect, it, vi } from 'vitest'
import { store } from '../../src/game/storage'

afterEach(() => vi.unstubAllGlobals())

describe('store', () => {
  it('round-trips JSON under the ft: prefix', () => {
    localStorage.clear()
    store.set('best', { a: 1 })
    expect(localStorage.getItem('ft:best')).toBe('{"a":1}')
    expect(store.get('best', null)).toEqual({ a: 1 })
  })
  it('returns the fallback for missing or corrupt values', () => {
    localStorage.clear()
    expect(store.get('nope', 5)).toBe(5)
    localStorage.setItem('ft:bad', '{oops')
    expect(store.get('bad', 'fb')).toBe('fb')
  })
  it('never throws when localStorage throws', () => {
    const boom = () => { throw new Error('denied') }
    vi.stubGlobal('localStorage', { getItem: boom, setItem: boom, removeItem: boom })
    expect(store.get('x', 'fb')).toBe('fb')
    expect(() => store.set('x', 1)).not.toThrow()
  })
})
