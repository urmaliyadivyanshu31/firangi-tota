import type { Lang } from '../content/types'
import { store } from '../game/storage'

const KEY = 'lang'

/** First visit: Hindi when any of the browser's languages is Hindi, else English. */
function guess(): Lang {
  try {
    if (typeof navigator === 'undefined') return 'en'
    const list = navigator.languages?.length ? navigator.languages : [navigator.language]
    return list.some((l) => /^hi\b/i.test(l ?? '')) ? 'hi' : 'en'
  } catch {
    return 'en'
  }
}

function valid(v: unknown): v is Lang {
  return v === 'en' || v === 'hi'
}

let current: Lang | null = null

/** Has the player picked a language before? */
export function hasLang(): boolean {
  return valid(store.get<unknown>(KEY, null))
}

/** The current UI language: the player's pick, else a guess from the browser. */
export function getLang(): Lang {
  if (current) return current
  const saved = store.get<unknown>(KEY, null)
  current = valid(saved) ? saved : guess()
  return current
}

/** Switch language, remember it (if storage works) and update `<html lang>`. */
export function setLang(l: Lang): void {
  current = l
  store.set(KEY, l)
  if (typeof document !== 'undefined') document.documentElement.lang = l
}
