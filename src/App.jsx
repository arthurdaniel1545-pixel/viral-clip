import { useState } from 'react'
import CreateTab from './components/CreateTab.jsx'
import StylesTab from './components/StylesTab.jsx'
import SettingsTab from './components/SettingsTab.jsx'

const TABS = [
  { id: 'create', label: 'Criar' },
  { id: 'styles', label: 'Estilos' },
  { id: 'settings', label: 'Config' },
]

export default function App() {
  const [tab, setTab] = useState('create')
  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <h1 className="text-lg font-bold tracking-tight">ViralClip</h1>
        <span className="text-xs text-slate-400">qualquer IA · celular · grátis</span>
      </header>
      <main className="flex-1 overflow-y-auto px-4 py-4">
        {tab === 'create' && <CreateTab />}
        {tab === 'styles' && <StylesTab />}
        {tab === 'settings' && <SettingsTab />}
      </main>
      <nav className="border-t border-slate-800 flex">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-3 text-sm font-medium ${tab === t.id ? 'text-white bg-slate-800' : 'text-slate-400'}`}
          >
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
