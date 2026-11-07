const ELEVEN_KEY = 'vc.elevenKey';
const ELEVEN_VOICE = 'vc.elevenVoice';

export function getElevenKey() { return localStorage.getItem(ELEVEN_KEY) || ''; }
export function setElevenKey(k) { localStorage.setItem(ELEVEN_KEY, k); }
export function getElevenVoice() { return localStorage.getItem(ELEVEN_VOICE) || '21m00Tcm4TlvDq8ikWAM'; }
export function setElevenVoice(v) { localStorage.setItem(ELEVEN_VOICE, v); }

export function ttsAvailable() { return 'speechSynthesis' in window; }
export function stopSpeak() { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); }

export async function speak(text, { onEnd } = {}) {
  const key = getElevenKey();
  if (key) {
    try {
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${getElevenVoice()}`, {
        method: 'POST',
        headers: { 'xi-api-key': key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2' }),
      });
      if (!res.ok) throw new Error('elevenlabs ' + res.status);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => { URL.revokeObjectURL(url); onEnd?.(); };
      await audio.play();
      return;
    } catch (e) {
      console.warn('ElevenLabs failed, falling back to browser', e);
    }
  }
  if (!ttsAvailable()) { onEnd?.(); return; }
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'pt-BR';
  u.rate = 1.05;
  u.onend = () => onEnd?.();
  window.speechSynthesis.speak(u);
}

export async function getElevenAudioBlob(text) {
  const key = getElevenKey()
  if (!key) return null
  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${getElevenVoice()}`, {
      method: 'POST',
      headers: { 'xi-api-key': key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2' }),
    })
    if (!res.ok) return null
    return await res.blob()
  } catch { return null }
}
