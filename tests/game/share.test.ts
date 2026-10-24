import { describe, expect, it } from 'vitest'
import type { EraId, Lang, Message } from '../../src/content/types'
import { DAYS } from '../../src/game/config'
import { chapterPost, chapterStory, clause, dailyFact, dailyPost, MAX_POST, whatsappHref, xHref, type How } from '../../src/game/share'
import type { ShareResult } from '../../src/game/share-code'
import type { ChapterState } from '../../src/game/state'
import { SERVER_ERAS } from '../../server/eras'
import { msg } from './fixture'

const LANGS: Lang[] = ['en', 'hi']
const forged = (id: string, tier: 1 | 2 | 3, tell: string) => msg(id, tier, false, { tells: [{ kind: 'number', explain: { en: tell, hi: `हिंदी ${tell}` } }] })
const genuine = (id: string, why: string) => msg(id, 1, true, { why: { text: { en: why, hi: `सच: ${why}` }, sources: [] } })

function state(queue: Message[], over: Partial<ChapterState>): ChapterState {
  return { era: 'delhi-1857', difficulty: 'easy', day: 1, days: 7, queue, phase: 'reading', ...over }
}

describe('the story a post tells', () => {
  const q = [
    forged('a', 1, 'The 3rd rode, not the 4th.'),
    genuine('b', 'Written for the game: the King wrote to all.'),
    forged('c', 3, 'The 38th was in Delhi, not the 37th.'),
    forged('d', 3, 'Sixteen annas make a rupee.'),
    genuine('e', 'True: a real petition.'),
    forged('f', 2, 'It was a Sunday.'),
    genuine('g', 'Odd but true: the diary says so.'),
  ]

  it('a survived run brags about its hardest catch, the latest of equals', () => {
    expect(chapterStory(state(q, { day: 7, phase: 'survived' }), 'survived', 'en')).toEqual({ how: 'survived', fact: { kind: 'catch', text: 'Sixteen annas make a rupee.' } })
  })

  it('a forgery passed tells its tell; a genuine one thrown out brags about the best catch before it, and never explains the genuine one', () => {
    expect(chapterStory(state(q, { day: 3, phase: 'caught', lastVerdict: 'asli' }), 'caught', 'en')).toEqual({ how: 'missed', fact: { kind: 'missed', text: 'The 38th was in Delhi, not the 37th.' } })
    expect(chapterStory(state(q, { day: 5, phase: 'caught', lastVerdict: 'tota' }), 'caught', 'en')).toEqual({ how: 'rejected', fact: { kind: 'catch', text: 'Sixteen annas make a rupee.' } })
    expect(chapterStory(state(q, { day: 2, phase: 'caught', lastVerdict: 'tota' }), 'caught', 'en')).toEqual({ how: 'rejected', fact: { kind: 'catch', text: 'The 3rd rode, not the 4th.' } })
    // caught on day 1, no forgery caught before: no fact at all (the why would read like filler)
    expect(chapterStory(state([genuine('x', 'Written for the game: the King wrote to all.')], { day: 1, phase: 'caught', lastVerdict: 'tota' }), 'caught', 'en')).toEqual({ how: 'rejected' })
  })

  it('a burnt-out agarbatti brags about the best catch before it, or says nothing more', () => {
    expect(chapterStory(state(q, { day: 4, phase: 'caught', lastVerdict: 'timeout' }), 'caught', 'en')).toEqual({ how: 'timeout', fact: { kind: 'catch', text: 'The 38th was in Delhi, not the 37th.' } })
    expect(chapterStory(state(q, { day: 1, phase: 'caught', lastVerdict: 'timeout' }), 'caught', 'en')).toEqual({ how: 'timeout' })
  })

  it('the daily puzzle tells its best catch, else its first slip', () => {
    expect(dailyFact(q.slice(0, 5), [true, true, true, false, true], 'en')).toEqual({ kind: 'catch', text: 'The 38th was in Delhi, not the 37th.' })
    expect(dailyFact(q.slice(0, 2), [false, false], 'en')).toEqual({ kind: 'missed', text: 'The 3rd rode, not the 4th.' })
    expect(dailyFact(q.slice(1, 2), [true], 'en')).toBeUndefined()
    expect(dailyFact(q.slice(1, 3), [false, false], 'en')).toEqual({ kind: 'missed', text: 'The 38th was in Delhi, not the 37th.' }) // a genuine one missed is skipped
    expect(dailyFact(q.slice(1, 2), [false], 'en')).toBeUndefined()
  })
})

describe('the post', () => {
  const r = (over: Partial<ShareResult>): ShareResult => ({ era: 'delhi-1857', mode: 'easy', outcome: 'survived', days: 7, lang: 'en', ...over })

  it('reads like a person bragging: the result with the place and year, the fact, a dare', () => {
    expect(chapterPost({ result: r({}), how: 'survived', fact: { kind: 'catch', text: 'The 38th was in Delhi, not the 37th.' } })).toBe(
      "🦜 I held out all 7 days in Bahadur Shah Zafar's darbar, Delhi 1857\nMy best catch: the 38th was in Delhi, not the 37th\nYour turn, can you spot the Tota?")
    expect(chapterPost({ result: r({ outcome: 'caught', days: 3, lang: 'hi' }), how: 'missed', fact: { kind: 'missed', text: 'दिल्ली में 38वीं पलटन थी, 37वीं नहीं।' } })).toBe(
      '🦜 दिल्ली 1857 में बहादुर शाह ज़फ़र के दरबार में चौथे दिन फ़िरंगी तोते ने मुझे चकमा दे दिया\nजो चूक मुझसे छूट गई: दिल्ली में 38वीं पलटन थी, 37वीं नहीं\nआप कितने दिन टिकेंगे?')
  })

  it('without a tell to tell, says one short true line instead, never a filler explanation', () => {
    expect(chapterPost({ result: r({ outcome: 'caught', days: 0 }), how: 'rejected' })).toBe(
      "🦜 I called a real message fake on day 1 in Bahadur Shah Zafar's darbar, Delhi 1857\nThe Tota made me doubt the truth\nCan you last longer?")
    expect(chapterPost({ result: r({ outcome: 'caught', days: 0, lang: 'hi' }), how: 'rejected' })).toBe(
      '🦜 दिल्ली 1857 में बहादुर शाह ज़फ़र के दरबार में पहले दिन मैंने असली संदेश को जाली मान लिया\nतोते ने मुझे सच पर ही शक करा दिया\nआप कितने दिन टिकेंगे?')
    expect(chapterPost({ result: r({ era: 'delhi-1947', mode: 'hard', outcome: 'caught', days: 0 }), how: 'timeout' })).toBe(
      "🦜 My agarbatti burnt out on day 1 at the Viceroy's House telegraph desk, Delhi 1947\nThe clock sided with the Tota\nCan you last longer?")
    expect(chapterPost({ result: r({ lang: 'hi' }), how: 'survived' }).split('\n')[1]).toBe('हर सच्ची बात आगे पहुँची')
    expect(chapterPost({ result: r({ outcome: 'caught', days: 2 }), how: 'missed' }).split('\n')[1]).toBe("The Tota's forgery fooled me")
    for (const how of ['survived', 'missed', 'rejected', 'timeout'] as How[]) {
      for (const lang of LANGS) {
        const post = chapterPost({ result: r({ era: 'lahore-1929', mode: 'hard', lang, ...(how === 'survived' ? { days: 14 } : { outcome: 'caught', days: 13 }) }), how })
        expect(post.split('\n'), post).toHaveLength(3)
        expect(post).not.toMatch(/[.।]$/m) // no full stops at line ends
      }
    }
  })

  it('the daily post carries the score, the ticks and crosses, the fact and a dare', () => {
    const results = [true, true, false, true, true]
    expect(dailyPost({ result: r({ mode: 'daily', outcome: 'caught', days: 4 }), number: 12, eraTitle: 'Delhi 1857', results, fact: { kind: 'catch', text: 'It was a Sunday.' } })).toBe(
      '🦜 Aaj ka Taar #12 · Delhi 1857 · 4/5\n✅✅❌✅✅\nMy best catch: it was a Sunday\nCan you beat 4/5 today?')
    expect(dailyPost({ result: r({ mode: 'daily', days: 5, lang: 'hi' }), number: 3, eraTitle: 'दिल्ली 1857', results: [true, true, true, true, true] })).toBe(
      '🦜 आज का तार #3 · दिल्ली 1857 · 5/5\n✅✅✅✅✅\nआज आप भी 5/5 ला पाएँगे?')
  })

  it('stays under the length limit with every real tell and why, in every chapter, language and ending, and never uses a hashtag', () => {
    let longest = ''
    for (const era of Object.values(SERVER_ERAS)) {
      for (const lang of LANGS) {
        for (const m of era.messages) {
          // every tell, as a catch and as the slip that was missed
          const facts = (m.tells ?? []).flatMap((t) => [{ kind: 'catch' as const, text: t.explain[lang] }, { kind: 'missed' as const, text: t.explain[lang] }])
          for (const fact of facts) {
            for (const how of ['survived', 'missed', 'rejected', 'timeout'] as How[]) {
              const days = how === 'survived' ? DAYS.hard : DAYS.hard - 1
              const result: ShareResult = { era: era.id as EraId, mode: 'hard', outcome: how === 'survived' ? 'survived' : 'caught', days, lang }
              const post = chapterPost({ result, how, fact })
              expect(post.length, post).toBeLessThanOrEqual(MAX_POST)
              expect(post).toContain(clause(fact.text, lang)) // the fact is never the part left out
              expect(post).not.toMatch(/#\w/u)
              if (post.length > longest.length) longest = post
            }
          }
        }
      }
    }
    expect(longest.length).toBeGreaterThan(150)
  })

  it('makes a tell a clause: no full stop, a lower-case opening word only where English allows', () => {
    expect(clause('The 38th was in Delhi.', 'en')).toBe('the 38th was in Delhi')
    expect(clause('Jinnah, not Mountbatten, became Governor-General.', 'en')).toBe('Jinnah, not Mountbatten, became Governor-General')
    expect(clause('16 annas make a rupee.', 'en')).toBe('16 annas make a rupee')
    expect(clause('दिल्ली में 38वीं पलटन थी।', 'hi')).toBe('दिल्ली में 38वीं पलटन थी')
  })

  it('hands WhatsApp the post and the link as one message, and X the link apart so it draws its card', () => {
    const text = '🦜 I held out & won\nYour turn?'
    const url = 'https://firangitota.com/s/1857-e7s-en'
    expect(whatsappHref(text, url)).toBe(`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`)
    const x = new URL(xHref(text, url))
    expect(x.origin + x.pathname).toBe('https://x.com/intent/post')
    expect(x.searchParams.get('text')).toBe(text)
    expect(x.searchParams.get('url')).toBe(url)
  })
})
