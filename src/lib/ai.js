const STORAGE_KEY = 'vc.ai'

export function loadConfig() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } catch { return {} }
}
export function saveConfig(cfg) { localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg)) }

export async function chat({ messages, model, temperature = 0.7, signal }) {
  const cfg = loadConfig()
  if (!cfg.baseUrl || !cfg.apiKey) throw new Error('Configure uma IA em Config primeiro.')
  const res = await fetch(`${cfg.baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${cfg.apiKey}` },
    body: JSON.stringify({ model: model || cfg.model, messages, temperature }),
    signal,
  })
  if (!res.ok) { const t = await res.text(); const hint = res.status === 401 ? ' (verifique a chave em Ajustes)' : ''; throw new Error(`IA erro ${res.status}${hint}: ${t}`) }
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}

export const PROVIDERS = [
  { id: 'openrouter', name: 'OpenRouter (modelos grátis)', baseUrl: 'https://openrouter.ai/api/v1', model: 'meta-llama/llama-3.3-70b-instruct:free' },
  { id: 'gemini', name: 'Google Gemini (grátis)', baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai', model: 'gemini-2.0-flash' },
  { id: 'groq', name: 'Groq (grátis)', baseUrl: 'https://api.groq.com/openai/v1', model: 'llama-3.3-70b-versatile' },
  { id: 'ollama', name: 'Ollama (local, grátis)', baseUrl: 'http://localhost:11434/v1', model: 'llama3.2' },
  { id: 'custom', name: 'Custom (OpenAI-compat)', baseUrl: '', model: '' },
]
