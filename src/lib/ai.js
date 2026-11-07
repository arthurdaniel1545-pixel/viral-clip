const STORAGE_KEY = 'vc.ai'
const KEYS_KEY = 'vc.keys'

export function loadConfig() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } catch { return {} }
}
export function saveConfig(cfg) { localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg)) }

export function loadKeys() { try { return JSON.parse(localStorage.getItem(KEYS_KEY) || '{}') } catch { return {} } }
export function saveKeys(k) { localStorage.setItem(KEYS_KEY, JSON.stringify(k)) }
export function getKey(providerId) { return (loadKeys()[providerId] || '').trim() }

export const PROVIDERS = [
  { id: 'auto', name: 'Auto (detecta o melhor)', baseUrl: '', model: '' },
  { id: 'openrouter', name: 'OpenRouter (modelos gratis)', baseUrl: 'https://openrouter.ai/api/v1', model: 'meta-llama/llama-3.3-70b-instruct:free' },
  { id: 'gemini', name: 'Google Gemini (gratis)', baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai', model: 'gemini-3.8-flash' },
  { id: 'groq', name: 'Groq (gratis)', baseUrl: 'https://api.groq.com/openai/v1', model: 'llama-3.3-70b-versatile' },
  { id: 'ollama', name: 'Ollama (local, gratis)', baseUrl: 'http://localhost:11434/v1', model: 'llama3.2' },
  { id: '9router', name: '9Router (local)', baseUrl: 'http://localhost:20128/v1', model: 'gpt-4o-mini' },
  { id: 'custom', name: 'Custom (OpenAI-compat)', baseUrl: '', model: '' },
]

export const AUTO_MODELS = {
  openrouter: ['meta-llama/llama-3.3-70b-instruct:free', 'google/gemma-2-9b-it:free', 'mistralai/mistral-7b-instruct:free'],
  gemini: ['gemini-3.8-flash', 'gemini-2.5-flash'],
  groq: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
  ollama: ['llama3.2', 'llama3.1', 'mistral'],
  '9router': ['gpt-4o-mini', 'gpt-4o', 'claude-3-5-sonnet'],
}

async function tryModel(baseUrl, key, mdl, messages, temperature, signal) {
  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` }
  if (baseUrl.includes('openrouter')) { headers['HTTP-Referer'] = 'https://viralclip.app'; headers['X-Title'] = 'ViralClip' }
  const res = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST', headers,
    body: JSON.stringify({ model: mdl, messages, temperature }), signal,
  })
  if (!res.ok) { const t = await res.text(); throw new Error(`IA erro ${res.status}: ${t}`) }
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}

async function tryProvider(p, messages, model, temperature, signal) {
  const key = getKey(p.id) || (loadConfig().provider === p.id ? loadConfig().apiKey : '')
  if (!key) throw new Error('sem chave')
  const requested = model || 'auto'
  const candidates = (requested === 'auto' || !requested) ? (AUTO_MODELS[p.id] || [p.model]) : [requested]
  let lastErr
  for (const mdl of candidates) {
    try { return await tryModel(p.baseUrl, key, mdl, messages, temperature, signal) } catch (e) { lastErr = e }
  }
  throw lastErr || new Error('falha')
}

export async function chat({ messages, model, temperature = 0.7, signal }) {
  const cfg = loadConfig()
  if (cfg.provider === 'auto') {
    const errors = []
    for (const p of PROVIDERS.filter(x => x.id !== 'auto' && x.id !== 'custom' && x.baseUrl)) {
      try { return await tryProvider(p, messages, model, temperature, signal) } catch (e) { errors.push(`${p.name}: ${e.message}`) }
    }
    if (cfg.baseUrl && cfg.apiKey) {
      try {
        const res = await fetch(`${cfg.baseUrl.replace(/\/$/, '')}/chat/completions`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${cfg.apiKey}` },
          body: JSON.stringify({ model: model || cfg.model, messages, temperature }), signal,
        })
        if (res.ok) { const d = await res.json(); return d.choices?.[0]?.message?.content ?? '' }
      } catch {}
    }
    throw new Error('Nenhum provedor ativo. Configure pelo menos uma chave em Ajustes.\n' + errors.join('\n'))
  }
  const fallbackKey = cfg.apiKey || getKey(cfg.provider)
  if (!cfg.baseUrl || !fallbackKey) throw new Error('Configure uma IA em Ajustes primeiro.')
  cfg.apiKey = fallbackKey
  const p = PROVIDERS.find(x => x.id === cfg.provider) || { baseUrl: cfg.baseUrl, model: cfg.model }
  const baseUrl = cfg.baseUrl || p.baseUrl
  const requested = model || cfg.model || p.model || 'auto'
  const candidates = (requested === 'auto' || !requested) ? (AUTO_MODELS[cfg.provider] || [p.model]) : [requested]
  let lastErr
  for (const mdl of candidates) {
    try {
      const res = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${cfg.apiKey}` },
        body: JSON.stringify({ model: mdl, messages, temperature }), signal,
      })
      if (!res.ok) { const t = await res.text(); throw new Error(`IA erro ${res.status}: ${t}`) }
      const data = await res.json()
      return data.choices?.[0]?.message?.content ?? ''
    } catch (e) { lastErr = e }
  }
  throw lastErr || new Error('falha')
}
