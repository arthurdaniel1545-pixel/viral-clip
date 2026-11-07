import { useState, useEffect } from 'react'

const KEY = 'vc.schedule'

export default function ScheduleTab() {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
  })
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')

  function add() {
    if (!title.trim() || !date) return
    const next = [...items, { id: Date.now(), title: title.trim(), date }]
    setItems(next)
    localStorage.setItem(KEY, JSON.stringify(next))
    setTitle(''); setDate('')
  }
  function remove(id) {
    const next = items.filter(i => i.id !== id)
    setItems(next)
    localStorage.setItem(KEY, JSON.stringify(next))
  }
  function exportIcs() {
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ViralClip//EN']
    items.forEach(i => {
      const d = i.date.replace(/-/g, '')
      lines.push('BEGIN:VEVENT', `SUMMARY:${i.title}`, `DTSTART;VALUE=DATE:${d}`, `DTEND;VALUE=DATE:${d}`, 'END:VEVENT')
    })
    lines.push('END:VCALENDAR')
    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'viralclip.ics'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Titulo do post"
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5" />
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5" />
        <button onClick={add} disabled={!title.trim() || !date}
          className="w-full bg-emerald-500 text-black font-semibold py-2.5 rounded-lg disabled:opacity-50">
          Agendar
        </button>
      </div>
      {items.length > 0 && (
        <>
          <ul className="space-y-2">
            {items.sort((a,b) => a.date.localeCompare(b.date)).map(i => (
              <li key={i.id} className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2">
                <div>
                  <p className="text-sm">{i.title}</p>
                  <p className="text-xs text-zinc-500">{i.date}</p>
                </div>
                <button onClick={() => remove(i.id)} className="text-zinc-500 hover:text-red-400 text-sm">remover</button>
              </li>
            ))}
          </ul>
          <button onClick={exportIcs} className="w-full bg-zinc-800 hover:bg-zinc-700 py-2 rounded-lg text-sm">
            Exportar .ics (Google/Apple Calendar)
          </button>
        </>
      )}
    </div>
  )
}
