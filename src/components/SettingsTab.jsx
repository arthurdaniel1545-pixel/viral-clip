import { useState } from 'react'
import { loadConfig, saveConfig, PROVIDERS, loadKeys, saveKeys } from '../lib/ai.js'
import { getElevenKey, setElevenKey, getElevenVoice, setElevenVoice } from '../lib/tts.js'

export default function SettingsTab() {
  const [cfg, setCfg] = useState(loadConfig())
  const [keys, setKeys] = useState(loadKeys())
  const [eKey, setEKey] = useState(getElevenKey())
  const [eVoice, setEVoice] = useState(getElevenVoice())
  const [saved, setSaved] = useState(false)

  function applyProvider(p) {
    const preset = PROVIDERS.find(x => x.id === p)
    setCfg(c => ({ ...c, provider: p, baseUrl: preset?.baseUrl || c.baseUrl, model: preset?.model || c.model }))
  }
  function save() {
    saveConfig(cfg); saveKeys(keys); setElevenKey(eKey.trim()); setElevenVoice(eVoice.trim())
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold">IA</h2>
        <p className="text-sm text-zinc-400 mt-1">Escolha o provedor ou use Auto para detectar o melhor disponivel.</p>
      </div>
      <div className="space-y-2">
        <label className="text-sm">Provedor</label>
        <select value={cfg.provider} onChange={e => applyProvider(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2">
          {PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div className="space-y-2">
        <label className="text-sm">URL base</label>
        <input value={cfg.baseUrl || ''} onChange={e => setCfg(c => ({ ...c, baseUrl: e.target.value }))}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 font-mono text-sm" />
      </div>
      <div className="space-y-2">
        <label className="text-sm">Modelo</label>
        <input value={cfg.model || ''} onChange={e => setCfg(c => ({ ...c, model: e.target.value }))}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 font-mono text-sm" />
      </div>
      <div className="space-y-2">
        <label className="text-sm">Chave de API (provedor selecionado)</label>
        <input value={cfg.apiKey || ''} onChange={e => setCfg(c => ({ ...c, apiKey: e.target.value }))} type="password"
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 font-mono text-sm" placeholder="sk-..." />
      </div>

      <div className="pt-2 border-t border-zinc-800">
        <h3 className="text-sm font-semibold mb-2">Chaves por provedor (usadas no modo Auto)</h3>
        {PROVIDERS.filter(p => p.id !== 'auto' && p.id !== 'custom').map(p => (
          <div key={p.id} className="space-y-1 mb-2">
            <label className="text-xs text-zinc-400">{p.name}</label>
            <input value={keys[p.id] || ''} onChange={e => setKeys(k => ({ ...k, [p.id]: e.target.value }))} type="password"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 font-mono text-xs" placeholder="sk-..." />
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-zinc-800">
        <h2 className="text-lg font-semibold">Narração</h2>
        <p className="text-sm text-zinc-400 mt-1">Nativo do navegador é grátis. ElevenLabs dá voz mais natural.</p>
      </div>
      <div className="space-y-2">
        <label className="text-sm">Chave ElevenLabs (opcional)</label>
        <input value={eKey} onChange={e => setEKey(e.target.value)} type="password"
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 font-mono text-sm" placeholder="xi-..." />
      </div>
      <div className="space-y-2">
        <label className="text-sm">ID da voz</label>
        <input value={eVoice} onChange={e => setEVoice(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 font-mono text-sm" />
      </div>

      <button onClick={save} className="w-full bg-emerald-500 text-black font-semibold py-2.5 rounded-lg">
        {saved ? 'Salvo' : 'Salvar'}
      </button>
    </div>
  )
}
