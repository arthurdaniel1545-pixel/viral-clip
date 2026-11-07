import { useState, useRef } from 'react'
import { getElevenAudioBlob } from '../lib/tts.js'

function parseScenes(script) {
  if (!script) return [{ text: 'Seu video animado', dur: 6 }]
  const lines = script.split('\n').map(l => l.trim()).filter(Boolean)
  const scenes = []
  let cur = ''
  for (const l of lines) {
    if (/^\[cena\]/i.test(l)) {
      if (cur) scenes.push(cur)
      cur = l.replace(/^\[cena\]\s*/i, '')
    } else {
      cur += (cur ? ' ' : '') + l.replace(/^\[(narra[cç][aã]o|narracao)\]\s*/i, '')
    }
  }
  if (cur) scenes.push(cur)
  if (!scenes.length) scenes.push(script.slice(0, 300))
  return scenes.map(s => ({ text: s, dur: Math.max(3, Math.min(8, s.length / 35 + 1)) }))
}

const PALETTES = [
  ['#0f172a', '#1e293b', '#34d399'],
  ['#1e1b4b', '#312e81', '#a78bfa'],
  ['#1c1917', '#292524', '#fbbf24'],
  ['#0c4a6e', '#075985', '#38bdf8'],
]

export default function VideoTab({ script, format = 'reels' }) {
  const [rendering, setRendering] = useState(false)
  const [url, setUrl] = useState('')
  const [progress, setProgress] = useState(0)
  const canvasRef = useRef(null)

  async function render() {
    setRendering(true); setUrl(''); setProgress(0)
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const [W, H] = format === 'square' ? [720, 720] : [720, 1280]
    canvas.width = W; canvas.height = H
    const scenes = parseScenes(script)
    const totalDur = scenes.reduce((a, s) => a + s.dur, 0)
    let stream = canvas.captureStream(30)
    const audioBlob = await getElevenAudioBlob(script)
    if (audioBlob) {
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
        const buf = await audioBlob.arrayBuffer()
        const audioBuf = await audioCtx.decodeAudioData(buf)
        const src = audioCtx.createBufferSource()
        src.buffer = audioBuf
        const dest = audioCtx.createMediaStreamDestination()
        src.connect(dest); src.connect(audioCtx.destination); src.start()
        stream = new MediaStream([...stream.getVideoTracks(), ...dest.stream.getAudioTracks()])
      } catch {}
    }
    const rec = new MediaRecorder(stream, { mimeType: 'video/webm' })
    const chunks = []
    rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data) }
    rec.onstop = () => {
      setUrl(URL.createObjectURL(new Blob(chunks, { type: 'video/webm' })))
      setRendering(false); setProgress(100)
    }
    rec.start()
    const start = performance.now()
    const sceneStarts = []
    let acc = 0
    scenes.forEach(s => { sceneStarts.push(acc); acc += s.dur })
    let sceneIdx = 0
    function wrapText(text, maxW) {
      const words = text.split(' '); const lines = []; let line = ''
      for (const w of words) {
        if (ctx.measureText(line + ' ' + w).width > maxW) { lines.push(line); line = w }
        else line = line ? line + ' ' + w : w
      }
      if (line) lines.push(line)
      return lines
    }
    function frame() {
      const t = (performance.now() - start) / 1000
      if (t >= totalDur) { rec.stop(); return }
      while (sceneIdx < scenes.length - 1 && t >= sceneStarts[sceneIdx + 1]) sceneIdx++
      const sceneT = t - sceneStarts[sceneIdx]
      const sceneDur = scenes[sceneIdx].dur
      const pal = PALETTES[sceneIdx % PALETTES.length]
      const fadeIn = Math.min(1, sceneT / 0.5)
      const fadeOut = sceneT > sceneDur - 0.5 ? (sceneDur - sceneT) / 0.5 : 1
      const a = Math.max(0, Math.min(1, fadeIn * fadeOut))
      // bg
      const g = ctx.createLinearGradient(0, 0, W, H)
      g.addColorStop(0, pal[0]); g.addColorStop(1, pal[1])
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
      // floating particles
      ctx.globalAlpha = 0.25
      for (let i = 0; i < 18; i++) {
        const px = (i * 137 + t * 40) % W
        const py = (i * 97 + t * 25) % H
        ctx.fillStyle = pal[2]
        ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI*2); ctx.fill()
      }
      ctx.globalAlpha = a
      // animated accent circle
      ctx.globalAlpha = 0.15
      ctx.fillStyle = pal[2]
      const r = 80 + Math.sin(t * 2) * 20
      ctx.beginPath(); ctx.arc(W / 2, H * 0.25, r, 0, Math.PI * 2); ctx.fill()
      ctx.globalAlpha = a
      // scene number
      ctx.fillStyle = pal[2]; ctx.font = 'bold 28px sans-serif'; ctx.textAlign = 'center'
      ctx.fillText(`Cena ${sceneIdx + 1} de ${scenes.length}`, W / 2, 70)
      // text
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 40px sans-serif'
      const words = scenes[sceneIdx].text.split(' ')
      const reveal = Math.floor((sceneT / sceneDur) * words.length * 1.4)
      const visible = words.slice(0, Math.min(words.length, reveal + 1)).join(' ')
      const lines = wrapText(visible, W - 100)
      const startY = H / 2 - (lines.length * 50) / 2
      lines.forEach((ln, i) => {
        const y = startY + i * 52
        ctx.globalAlpha = a
        ctx.save()
        ctx.translate(W/2, y)
        const sc = 0.85 + 0.15 * a
        ctx.scale(sc, sc)
        ctx.fillText(ln, 0, 0)
        ctx.restore()
      })
      ctx.globalAlpha = 1
      // progress bar
      ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(50, H - 50, W - 100, 8)
      ctx.fillStyle = pal[2]; ctx.fillRect(50, H - 50, (W - 100) * (t / totalDur), 8)
      setProgress(Math.round((t / totalDur) * 100))
      requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)
  }

  return (
    <div className="space-y-4">
      <canvas ref={canvasRef} className="hidden" />
      <button onClick={render} disabled={rendering || !script?.trim()}
        className="w-full bg-emerald-500 text-black font-semibold py-2.5 rounded-lg disabled:opacity-50">
        {rendering ? `Renderizando... ${progress}%` : 'Renderizar video (WebM)'}
      </button>
      {!script?.trim() && <p className="text-xs text-zinc-500">Gere um roteiro primeiro na aba Criar (ou use o exemplo).</p>}
      {url && (
        <div className="space-y-2">
          <video src={url} controls className="w-full rounded-lg" />
          <a href={url} download="viralclip.webm" className="block text-center text-emerald-400 text-sm">Baixar</a>
        </div>
      )}
    </div>
  )
}
