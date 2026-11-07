import { useState } from 'react'
import { loadConfig, saveConfig, PROVIDERS } from '../lib/ai.js'

export default function SettingsTab() {
  const [cfg, setCfg] = useState(loadConfig())
  const [saved, setSaved] = useState(false)

  function applyProvider(p) {
    setCfg(c => ({ ...c, baseUrl: p.baseUrl, model: p.model }))
  }
  function save() {
    saveConfig(cfg); setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Configurar IA</h2>
      <p className="text-sm text-slate-400">Use qualquer provedor OpenAI-compatível. Modelos grátis disponíveis em OpenRouter/Gemini/Groq.</p>

      <div className="space-y-2">
        <label className="text-sm font-medium">Provedor rápido</label>
        <div className="grid grid-cols-2 gap-2">
          {PROVIDERS.map(p => (
            <button key={p.id} onClick={() => applyProvider(p)}
              className="p-2 rounded bg-slate-800 border border-slate-700 text-xs text-left">
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Base URL</label>
        <input value={cfg.baseUrl || ''} onChange={e => setCfg({ ...cfg, baseUrl: e.target.value })}
          placeholder="https://openrouter.ai/api/v1" className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Modelo</label>
        <input value={cfg.model || ''} onChange={e => setCfg({ ...cfg, model: e.target.value })}
          placeholder="meta-llama/llama-3.3-70b-instruct:free" className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">API Key</label>
        <input value={cfg.apiKey || ''} onChange={e => setCfg({ ...cfg, apiKey: e.target.value })}
          type="password" placeholder="sk-..." className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700" />
      </div>

      <button onClick={save} className="w-full py-3 rounded-lg bg-indigo-600 font-semibold">
        {saved ? 'Salvo!' : 'Salvar'}
      </button>
    </div>
  )
}
