import type { Lang } from '../content/types'
import { store } from '../game/storage'

const KEY = 'lang'

function guess(): Lang {
  try {
    return typeof navigator !== 'undefined' && /^hi\b/i.test(navigator.language) ? 'hi' : 'en'
  } catch {
    return 'en'
  }
}

function valid(v: unknown): v is Lang {
  return v === 'en' || v === 'hi'
}

let current: Lang | null = null

/** Has the player picked a language before? (False shows the language screen.) */
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
