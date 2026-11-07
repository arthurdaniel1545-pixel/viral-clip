export function speak(text, { lang = 'pt-BR', rate = 1, pitch = 1, onEnd } = {}) {
  if (!('speechSynthesis' in window)) { onEnd?.(); return }
  const u = new SpeechSynthesisUtterance(text)
  u.lang = lang; u.rate = rate; u.pitch = pitch
  if (onEnd) u.onend = onEnd
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(u)
}
export function stopSpeak() { window.speechSynthesis?.cancel() }
export function ttsAvailable() { return 'speechSynthesis' in window }
