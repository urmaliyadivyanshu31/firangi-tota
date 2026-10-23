// Dev-only harness: mounts one screen with fixture data. Not part of the build.
// /dev/ui.html?screen=day&lang=hi&channel=telegram
import '../src/ui/styles.css'
import fixture from '../src/content/eras/_fixture/index'
import type { Channel, Era, EraId, Lang } from '../src/content/types'
import type { ChapterState } from '../src/game/state'
import { dayDate } from '../src/game/dates'
import { setLang } from '../src/i18n/lang'
import { renderLanguage } from '../src/ui/screens/language'
import { renderHome } from '../src/ui/screens/home'
import { renderSetup } from '../src/ui/screens/setup'
import { renderIntro } from '../src/ui/screens/intro'
import { renderDay } from '../src/ui/screens/day'
import { renderEnd } from '../src/ui/screens/end'
import { renderCredits } from '../src/ui/screens/credits'

const q = new URLSearchParams(location.search)
const screen = q.get('screen') ?? 'home'
const lang = (q.get('lang') === 'hi' ? 'hi' : 'en') as Lang
const channel = (q.get('channel') ?? 'petition') as Channel
setLang(lang)

const YEAR: Record<Channel, string> = { petition: '1857', note: '1929', radio: '1942', telegram: '1947' }
const ID: Record<Channel, EraId> = { petition: 'delhi-1857', note: 'lahore-1929', radio: 'bombay-1942', telegram: 'delhi-1947' }

function eraFor(ch: Channel): Era {
  const e = JSON.parse(JSON.stringify(fixture)) as Era
  return { ...e, id: ID[ch], channel: ch, year: YEAR[ch] }
}
const era = eraFor(channel)
// Extra rules so the rulebook shows the NEW tag on day 3.
era.rules.push(
  { id: 'r2', text: { en: 'A letter from the city names its gate.', hi: 'शहर से आई चिट्ठी में उसके फाटक का नाम होता है।' }, arrivesOnDay: 3 },
  { id: 'r3', text: { en: 'Not shown before day 5.', hi: 'दिन 5 से पहले नहीं दिखेगा।' }, arrivesOnDay: 5 },
)
const [m1, m2] = era.messages as [Era['messages'][number], Era['messages'][number]]

function chapter(over: Partial<ChapterState> = {}): ChapterState {
  return { era: era.id, difficulty: 'easy', day: 1, days: 7, queue: [m1, m2, m1, m2, m1, m2, m1], phase: 'reading', ...over }
}

const root = document.getElementById('ui')!
const log = (name: string) => (...a: unknown[]) => console.log(name, ...a)
const dayOn = { stamp: log('stamp'), speak: log('speak'), tab: log('tab'), next: log('next') }

function day(s: ChapterState, extra: { revealed?: boolean; timerFrac?: number } = {}) {
  renderDay(root, { era, state: s, isoDate: dayDate(era, s.day), timerFrac: extra.timerFrac ?? 0.72, lang, revealed: extra.revealed ?? false }, dayOn)
}

const four = (['petition', 'note', 'radio', 'telegram'] as Channel[]).map((ch, i) => {
  const e = eraFor(ch)
  const places: Record<Channel, [string, string]> = { petition: ['Delhi', 'दिल्ली'], note: ['Lahore', 'लाहौर'], radio: ['Bombay', 'बंबई'], telegram: ['New Delhi', 'नई दिल्ली'] }
  return { ...e, order: (i + 1) as 1 | 2 | 3 | 4, place: { en: places[ch][0], hi: places[ch][1] } }
})

switch (screen) {
  case 'lang':
    renderLanguage(root, { pick: log('pick') })
    break
  case 'home':
  case 'home-done':
    renderHome(root, {
      eras: four,
      best: screen === 'home-done' ? { 'delhi-1857': { difficulty: 'easy', days: 7 }, 'lahore-1929': { difficulty: 'medium', days: 4 } } : {},
      dailyDone: screen === 'home-done',
    }, { chapter: log('chapter'), daily: log('daily'), continue: log('continue'), lang: log('lang'), sound: log('sound'), credits: log('credits') })
    break
  case 'setup':
    renderSetup(root, { era }, { start: log('start'), back: log('back') })
    break
  case 'intro':
  case 'intro2':
    renderIntro(root, { era }, { next: log('next') })
    if (screen === 'intro2') root.querySelector<HTMLElement>('[data-action="next"]')!.click()
    break
  case 'day':
    day(chapter())
    break
  case 'day-forged':
    day(chapter({ day: 2 }))
    break
  case 'day-low':
    day(chapter(), { timerFrac: 0.2 })
    break
  case 'day-file':
    era.facts[0]!.hardHidden = true
    day(chapter({ difficulty: 'hard', days: 14 }))
    root.querySelector<HTMLElement>('[data-tab="file"]')!.click()
    break
  case 'day-rules':
    day(chapter({ day: 3 }))
    root.querySelector<HTMLElement>('[data-tab="rules"]')!.click()
    break
  case 'reveal-right':
    day(chapter({ day: 2, phase: 'stamped', lastCorrect: true }), { revealed: true })
    break
  case 'reveal-wrong':
    day(chapter({ day: 1, phase: 'caught', lastCorrect: false }), { revealed: true, timerFrac: 0.4 })
    break
  case 'end-survived':
  case 'end-caught': {
    const survived = screen === 'end-survived'
    renderEnd(root, {
      era,
      state: chapter(survived ? { day: 7, phase: 'survived' } : { day: 2, phase: 'caught', lastCorrect: false }),
      outcome: survived ? 'survived' : 'caught',
      receipts: era.receipts,
      epilogue: era.epilogue,
      share: survived ? 'Firangi Tota · Aaj ka Taar #1 · 1857\n✅✅✅❌✅\nfirangitota.com' : undefined,
    }, { again: log('again'), home: log('home'), share: log('share'), credits: log('credits') })
    break
  }
  case 'credits':
    renderCredits(root, { back: log('back') })
    break
}
