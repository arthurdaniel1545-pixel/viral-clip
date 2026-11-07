import { useState } from 'react'
import { chat, loadConfig } from '../lib/ai.js'
import { speak, ttsAvailable } from '../lib/tts.js'

export default function CreateTab() {
  const [topic, setTopic] = useState('')
  const [script, setScript] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function generate() {
    setLoading(true); setError('')
    try {
      const text = await chat({
        messages: [
          { role: 'system', content: 'Você é um roteirista de vídeos curtos animados. Pesquise mentalmente o tema, confira fatos, e escreva um roteiro narrado de 30-60s com 3-5 cenas. Formato: CENA 1: ... NARRAÇÃO: ...' },
          { role: 'user', content: `Tema: ${topic}` },
        ],
      })
      setScript(text)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Criar vídeo</h2>
      <textarea
        value={topic} onChange={e => setTopic(e.target.value)}
        placeholder="Escreva o assunto do jeito que você falaria..."
        className="w-full h-24 p-3 rounded-lg bg-slate-800 border border-slate-700 resize-none"
      />
      <button
        onClick={generate} disabled={loading || !topic.trim()}
        className="w-full py-3 rounded-lg bg-indigo-600 font-semibold disabled:opacity-50"
      >
        {loading ? 'Gerando...' : 'Gerar roteiro'}
      </button>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      {script && (
        <div className="p-3 rounded-lg bg-slate-800 border border-slate-700 whitespace-pre-wrap text-sm">
          {script}
          {ttsAvailable() && (
            <button onClick={() => speak(script)} className="mt-3 w-full py-2 rounded bg-emerald-600 text-sm font-semibold">
              Ouvir narração
            </button>
          )}
        </div>
      )}
    </div>
  )
}
