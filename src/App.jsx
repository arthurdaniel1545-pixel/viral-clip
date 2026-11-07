import { useState } from 'react'
import CreateTab from './components/CreateTab.jsx'
import StylesTab from './components/StylesTab.jsx'
import SettingsTab from './components/SettingsTab.jsx'
import VideoTab from './components/VideoTab.jsx'
import ScheduleTab from './components/ScheduleTab.jsx'

const TABS = [
  { id: 'criar', label: 'Criar' },
  { id: 'video', label: 'Video' },
  { id: 'agenda', label: 'Agenda' },
  { id: 'estilos', label: 'Estilos' },
  { id: 'ajustes', label: 'Ajustes' },
]

export default function App() {
  const [tab, setTab] = useState('criar')
  const [script, setScript] = useState(() => localStorage.getItem('vc.script') || '')
  const setScriptPersist = (v) => { setScript(v); localStorage.setItem('vc.script', v || '') }
  const [format, setFormat] = useState('reels')
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="px-4 pt-5 pb-3">
        <p className="text-xs text-zinc-500">seu estudio de videos</p>
        <h1 className="text-xl font-semibold tracking-tight">ViralClip</h1>
      </header>
      <main className="px-4 pb-24">
        {tab === 'criar' && <CreateTab onScript={setScriptPersist} />}
        {tab === 'video' && (
          <div className="space-y-3">
            <select value={format} onChange={e=>setFormat(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5">
              <option value="reels">Reels/TikTok (9:16)</option>
              <option value="square">Carrossel (1:1)</option>
            </select>
            <VideoTab script={script} format={format} />
          </div>
        )}
        {tab === 'agenda' && <ScheduleTab />}
        {tab === 'estilos' && <StylesTab />}
        {tab === 'ajustes' && <SettingsTab />}
      </main>
      <nav className="fixed bottom-0 inset-x-0 bg-zinc-900/90 backdrop-blur border-t border-zinc-800">
        <div className="flex">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 py-3 text-sm ${tab === t.id ? 'text-emerald-400' : 'text-zinc-400'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
