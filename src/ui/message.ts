import type { Channel, Era, Lang, Message } from '../content/types'
import { fillTemplate } from '../game/dates'
import { t, tf, type Strings } from '../i18n/strings'
import type { DayTitle, SheetSpec } from './contract'

// What the paper says, built from content. The paper's own chrome adds no facts that could hide
// or fake a tell: priorities, numbers and slogans stay in the message text, where the rules apply.
// Nothing on it says whether the message is genuine or a real document (Ruling R30b): that shows
// only on the result card, after the stamp.

/** The message body with {date}/{weekday} placeholders filled: what the paper and the hidden copy show. */
export function messageText(msg: Message, isoDate: string, lang: Lang): string {
  return fillTemplate(msg.text[lang], isoDate, lang)
}

/** "Friday, 30 October 1942" */
export function longDate(isoDate: string, lang: Lang): string {
  return fillTemplate('{weekday}, {date}', isoDate, lang)
}

const HEADING: Partial<Record<Channel, keyof Strings>> = {
  petition: 'sheetPetitionHead',
  radio: 'sheetRadioHead',
  telegram: 'sheetTelegramHead',
}

export function buildSheet(p: { era: Era; msg: Message; isoDate: string; lang: Lang; pencil: boolean }): SheetSpec {
  const { era, msg, isoDate, lang } = p
  const fill = (s: string) => fillTemplate(s, isoDate, lang)
  const head = HEADING[era.channel]
  return {
    era: era.id,
    channel: era.channel,
    lang,
    ...(head ? { heading: t(head, lang) } : {}),
    from: fill(msg.from[lang]),
    to: fill(msg.to[lang]),
    dateLine: longDate(isoDate, lang),
    body: messageText(msg, isoDate, lang),
    checks: (msg.checks?.[lang] ?? []).filter((c) => c.trim() !== ''),
    pencil: p.pencil,
    documentMark: false,
  }
}

/** The in-world title for a day: "दिन 1" over "शुक्रवार, 30 अक्टूबर 1942". */
export function dayTitleFor(day: number, isoDate: string, lang: Lang): DayTitle {
  return { big: tf('dayTitle', lang, { n: day }), small: longDate(isoDate, lang) }
}

/** The top bar's place: the chapter title, plus the building when it adds something. */
export function eraLabel(era: Era, lang: Lang): { title: string; place: string | null } {
  const title = era.title[lang]
  const first = era.place[lang].split(',')[0]?.trim() ?? ''
  return { title, place: first && !title.includes(first) ? first : null }
}
