import { STYLES } from '../lib/styles.js'

export default function StylesTab() {
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold">Estilos ({STYLES.length})</h2>
      <p className="text-sm text-slate-400">Escolha um estilo ao criar o vídeo.</p>
      <div className="grid grid-cols-2 gap-2">
        {STYLES.map(s => (
          <div key={s.id} className="p-3 rounded-lg bg-slate-800 border border-slate-700">
            <div className="font-semibold text-sm">{s.name}</div>
            <div className="text-xs text-slate-400 mt-1">{s.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
