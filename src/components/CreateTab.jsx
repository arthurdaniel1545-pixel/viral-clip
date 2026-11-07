import { useState } from 'react'
import { chat } from '../lib/ai.js'
import { speak, stopSpeak } from '../lib/tts.js'
import { STYLES } from '../lib/styles.js'

async function searchFacts(topic) {
  try {
    const r = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(topic)}&format=json&no_html=1`)
    const d = await r.json()
    const bits = []
    if (d.AbstractText) bits.push(d.AbstractText)
    ;(d.RelatedTopics || []).slice(0, 6).forEach(t => { if (t.Text) bits.push(t.Text) })
    return bits.join('\n')
  } catch (e) {
    return ''
  }
}

export default function CreateTab({ onScript }) {
  const [topic, setTopic] = useState('')
  const [style, setStyle] = useState(STYLES[0].id)
  const [script, setScript] = useState('')
  const [loading, setLoading] = useState(false)
  const [speaking, setSpeaking] = useState(false)

  async function generate() {
    setLoading(true)
    const facts = await searchFacts(topic)
    const s = STYLES.find(x => x.id === style)
    const prompt = `Escreva um roteiro curto (45-90s) para um video animado sobre "${topic}", no estilo visual "${s.name}". Use linguagem natural e direta, sem cliches. ${facts ? 'Fatos de referencia:\n' + facts : ''} Retorne apenas o roteiro, com marcacoes [cena] e [narracao].`
    try {
      const text = await chat([{ role: 'user', content: prompt }])
      setScript(text)
      onScript?.(text)
    } finally {
      setLoading(false)
    }
  }

  function toggleSpeak() {
    if (speaking) { stopSpeak(); setSpeaking(false); return }
    setSpeaking(true)
    speak(script, { onEnd: () => setSpeaking(false) })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm text-zinc-300">Tema do video</label>
        <input value={topic} onChange={e => setTopic(e.target.value)}
          placeholder="ex: como funciona a fotossintese"
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5" />
      </div>
      <div className="space-y-2">
        <label className="text-sm text-zinc-300">Estilo visual</label>
        <select value={style} onChange={e => setStyle(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5">
          {STYLES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <button onClick={generate} disabled={!topic.trim() || loading}
        className="w-full bg-emerald-500 text-black font-semibold py-2.5 rounded-lg disabled:opacity-50">
        {loading ? 'Gerando...' : 'Gerar roteiro'}
      </button>
      {script && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 space-y-3">
          <pre className="whitespace-pre-wrap text-sm text-zinc-200 font-sans">{script}</pre>
          <div className="flex gap-2">
            <button onClick={toggleSpeak}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 py-2 rounded-lg text-sm">
              {speaking ? 'Parar' : 'Ouvir narracao'}
            </button>
            <button onClick={() => { navigator.clipboard?.writeText(script) }}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 py-2 rounded-lg text-sm">
              Copiar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
