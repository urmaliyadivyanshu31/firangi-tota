import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderEnd } from '../../src/ui/screens/end'
import { setLang } from '../../src/i18n/lang'
import { strings } from '../../src/i18n/strings'
import type { Era, Receipt } from '../../src/content/types'
import { chapter, era, mount } from './helpers'

const handlers = () => ({ again: vi.fn(), home: vi.fn(), share: vi.fn(), credits: vi.fn() })

function withReceipts(e: Era): Receipt[] {
  e.receipts.push({
    id: 'rc2',
    who: { en: 'A Rai Bahadur', hi: 'एक राय बहादुर' },
    quote: { en: 'I kept my title.', hi: 'मैंने अपना ख़िताब रखा।' },
    joke: { en: 'He kept it well.', hi: 'ख़ूब संभाला।' },
    theirSide: { en: 'He said he served the city.', hi: 'उन्होंने कहा कि वे शहर की सेवा कर रहे थे।' },
    source: { id: 's2', loc: 'p. 7' },
  })
  return e.receipts
}

beforeEach(() => setLang('en'))

describe('renderEnd', () => {
  it("shows every receipt's quote and source", () => {
    const e = era()
    const receipts = withReceipts(e)
    const root = mount()
    renderEnd(root, { era: e, state: chapter(e, { phase: 'survived', day: 7 }), outcome: 'survived', receipts, epilogue: e.epilogue }, handlers())
    const text = root.textContent!
    expect(text).toContain('I read every seal twice.')
    expect(text).toContain('A. Author, First Book (1900), p. 20')
    expect(text).toContain('I kept my title.')
    expect(text).toContain('B. Author, Second Book (1950), p. 7')
    expect(text).toContain('He said he served the city.')
    expect(root.querySelectorAll('.receipt')).toHaveLength(2)
  })

  it('shows the result line for the last message: written for the game', () => {
    const e = era()
    const root = mount()
    // day 7 is m1, genuine, no document
    renderEnd(root, { era: e, state: chapter(e, { phase: 'survived', day: 7 }), outcome: 'survived', receipts: e.receipts, epilogue: e.epilogue }, handlers())
    expect(root.querySelector('.last')!.textContent).toContain('Written for the game · every detail checks out')
  })

  it('shows the result line for the last message: a real document', () => {
    const e = era()
    e.messages[0]!.document = { sources: [{ id: 's1', loc: 'p. 3' }] }
    const root = mount()
    renderEnd(root, { era: e, state: chapter(e, { phase: 'caught', day: 3, lastCorrect: false }), outcome: 'caught', receipts: e.receipts, epilogue: e.epilogue }, handlers())
    expect(root.querySelector('.last')!.textContent).toContain('📜 Real document')
  })

  it('shows the epilogue for the outcome with its sources', () => {
    const e = era()
    const root = mount()
    renderEnd(root, { era: e, state: chapter(e, { phase: 'caught', day: 2, lastCorrect: false }), outcome: 'caught', receipts: e.receipts, epilogue: e.epilogue }, handlers())
    expect(root.textContent).toContain('The forgery was found.')
    expect(root.textContent).not.toContain('The city endured.')
    expect(root.textContent).toContain('A. Author, First Book (1900), p. 30')
    expect(root.textContent).toContain(strings.en.caughtTitle)
  })

  it('speaks the current language', () => {
    setLang('hi')
    const e = era()
    const root = mount()
    renderEnd(root, { era: e, state: chapter(e, { phase: 'survived', day: 7 }), outcome: 'survived', receipts: e.receipts, epilogue: e.epilogue }, handlers())
    expect(root.textContent).toContain('मैंने हर मुहर दो बार देखी।')
    expect(root.textContent).toContain(strings.hi.survivedTitle)
  })

  it('wires again, home, share and credits, and previews share text', () => {
    const e = era()
    const root = mount()
    const on = handlers()
    renderEnd(root, { era: e, state: chapter(e, { phase: 'survived', day: 7 }), outcome: 'survived', receipts: e.receipts, epilogue: e.epilogue, share: 'Firangi Tota · Aaj ka Taar #1\n✅✅' }, on)
    expect(root.querySelector('.share__text')!.textContent).toContain('✅✅')
    for (const a of ['again', 'home', 'share', 'credits']) root.querySelector<HTMLElement>(`[data-action="${a}"]`)!.click()
    expect(on.again).toHaveBeenCalledTimes(1)
    expect(on.home).toHaveBeenCalledTimes(1)
    expect(on.share).toHaveBeenCalledTimes(1)
    expect(on.credits).toHaveBeenCalledTimes(1)
  })

  it('puts the share grid (the daily result) first, right under the verdict', () => {
    const e = era()
    const root = mount()
    renderEnd(root, { era: e, state: chapter(e, { phase: 'caught', day: 5, lastCorrect: false }), outcome: 'caught', receipts: e.receipts, epilogue: e.epilogue, share: 'Firangi Tota · Aaj ka Taar #1\n✅❌' }, handlers())
    const order = [...root.querySelector('.end__scroll')!.children].map((c) => c.className.split(' ')[0])
    expect(order.indexOf('share')).toBe(order.indexOf('end__head') + 1)
  })

  it('relabels the again button when asked (the daily puzzle offers the full chapter)', () => {
    const e = era()
    const root = mount()
    renderEnd(root, { era: e, state: chapter(e, { phase: 'survived', day: 7 }), outcome: 'survived', receipts: e.receipts, epilogue: e.epilogue, againLabel: 'Play the full chapter' }, handlers())
    expect(root.querySelector('[data-action="again"]')!.textContent).toBe('Play the full chapter')
  })
})
