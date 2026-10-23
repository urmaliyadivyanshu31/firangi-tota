import type { Lang } from '../content/types'

// Read aloud with the phone's own voice. Nothing is downloaded; if there is no voice for the
// language, the speaker button stays hidden.

function synth(): SpeechSynthesis | undefined {
  return (globalThis as { speechSynthesis?: SpeechSynthesis }).speechSynthesis ?? undefined
}

function voices(): SpeechSynthesisVoice[] {
  try {
    return synth()?.getVoices() ?? []
  } catch {
    return []
  }
}

const norm = (v: SpeechSynthesisVoice) => v.lang.toLowerCase().replace('_', '-')

/** Hindi: any voice whose lang starts with `hi`. English: `en-IN` first, then any `en`. */
export function pickVoice(list: SpeechSynthesisVoice[], lang: Lang): SpeechSynthesisVoice | undefined {
  if (lang === 'hi') return list.find((v) => norm(v).startsWith('hi'))
  return list.find((v) => norm(v).startsWith('en-in')) ?? list.find((v) => norm(v).startsWith('en'))
}

export function canSpeak(lang: Lang): boolean {
  return synth() !== undefined && pickVoice(voices(), lang) !== undefined
}

export function speak(text: string, lang: Lang): void {
  const s = synth()
  const Utterance = (globalThis as { SpeechSynthesisUtterance?: typeof SpeechSynthesisUtterance }).SpeechSynthesisUtterance
  const voice = pickVoice(voices(), lang)
  if (!s || !Utterance || !voice) return
  try {
    s.cancel()
    const u = new Utterance(text)
    u.voice = voice
    u.lang = voice.lang
    u.rate = 0.95
    s.speak(u)
  } catch {
    /* a broken speech engine must never break the game */
  }
}

/** Voice lists often load late (Chrome on Android). Calls `cb` on each change; returns an unsubscribe. */
export function onVoicesChanged(cb: () => void): () => void {
  const s = synth()
  if (!s || typeof s.addEventListener !== 'function') return () => {}
  s.addEventListener('voiceschanged', cb)
  return () => s.removeEventListener('voiceschanged', cb)
}
