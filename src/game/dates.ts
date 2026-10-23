import type { Era, Lang } from '../content/types'

const MONTHS: Record<Lang, string[]> = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  hi: ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'],
}
const WEEKDAYS: Record<Lang, string[]> = {
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  hi: ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'],
}

/** UTC date for an ISO 'YYYY-MM-DD' plus `offset` days (proleptic Gregorian). */
function utcDate(iso: string, offset = 0): Date {
  const [y, m, d] = iso.split('-').map(Number) as [number, number, number]
  const date = new Date(0)
  date.setUTCFullYear(y, m - 1, d + offset)
  return date
}

export function addDays(iso: string, offset: number): string {
  const d = utcDate(iso, offset)
  const y = String(d.getUTCFullYear()).padStart(4, '0')
  return `${y}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
}

export function fillTemplate(text: string, isoDate: string, lang: Lang): string {
  return text.replace(/\{(date|weekday)(?:\+(\d+))?\}/g, (_all, kind: string, n?: string) => {
    const d = utcDate(isoDate, n ? Number(n) : 0)
    if (kind === 'weekday') return WEEKDAYS[lang][d.getUTCDay()]!
    return `${d.getUTCDate()} ${MONTHS[lang][d.getUTCMonth()]!} ${d.getUTCFullYear()}`
  })
}

/** ISO date of chapter day `dayIndex` (day 1 = windowStart). */
export function dayDate(era: Era, dayIndex: number): string {
  return addDays(era.windowStart, dayIndex - 1)
}
