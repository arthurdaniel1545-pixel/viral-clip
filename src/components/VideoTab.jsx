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
  return scenes.map(s => ({ text: s, dur: Math.max(3, Math.min(8, s.length / 40)) }))
}

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
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      const buf = await audioBlob.arrayBuffer()
      const audioBuf = await audioCtx.decodeAudioData(buf)
      const src = audioCtx.createBufferSource()
      src.buffer = audioBuf
      const dest = audioCtx.createMediaStreamDestination()
      src.connect(dest)
      src.connect(audioCtx.destination)
      src.start()
      const tracks = [...stream.getVideoTracks(), ...dest.stream.getAudioTracks()]
      stream = new MediaStream(tracks)
    }
    const rec = new MediaRecorder(stream, { mimeType: 'video/webm' })
    const chunks = []
    rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data) }
    rec.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' })
      setUrl(URL.createObjectURL(blob)); setRendering(false); setProgress(100)
    }
    rec.start()
    const start = performance.now()
    let sceneIdx = 0, sceneStart = 0, acc = 0
    const sceneStarts = scenes.map(s => { const t = acc; acc += s.dur; return t })
    function frame() {
      const t = (performance.now() - start) / 1000
      if (t >= totalDur) { rec.stop(); return }
      while (sceneIdx < scenes.length - 1 && t >= sceneStarts[sceneIdx + 1]) sceneIdx++
      const sceneT = t - sceneStarts[sceneIdx]
      const sceneDur = scenes[sceneIdx].dur
      const fade = Math.min(1, sceneT / 0.4) * Math.min(1, (sceneDur - sceneT) / 0.4 + 0.6)
      // background
      const g = ctx.createLinearGradient(0, 0, 0, H)
      g.addColorStop(0, '#0f172a'); g.addColorStop(1, '#1e293b')
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
      // title bar
      ctx.fillStyle = '#34d399'; ctx.font = 'bold 36px sans-serif'; ctx.textAlign = 'center'
      ctx.globalAlpha = fade
      ctx.fillText(`Cena ${sceneIdx + 1}/${scenes.length}`, W / 2, 90)
      // scene text wrapped
      ctx.fillStyle = '#e2e8f0'; ctx.font = '30px sans-serif'
      const words = scenes[sceneIdx].text.split(' ')
      const lines = []; let line = ''
      for (const w of words) {
        if (ctx.measureText(line + ' ' + w).width > W - 80) { lines.push(line); line = w } else line = (line ? line + ' ' : '') + w
      }
      if (line) lines.push(line)
      lines.slice(0, 8).forEach((ln, i) => ctx.fillText(ln, W / 2, H / 2 - 40 + i * 42))
      ctx.globalAlpha = 1
      // progress
      ctx.fillStyle = '#475569'; ctx.fillRect(40, H - 40, W - 80, 6)
      ctx.fillStyle = '#34d399'; ctx.fillRect(40, H - 40, (W - 80) * (t / totalDur), 6)
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
      {!script?.trim() && <p className="text-xs text-zinc-500">Gere um roteiro primeiro na aba Criar.</p>}
      {url && (
        <div className="space-y-2">
          <video src={url} controls className="w-full rounded-lg" />
          <a href={url} download="viralclip.webm" className="block text-center text-emerald-400 text-sm">Baixar</a>
        </div>
      )}
    </div>
  )
}
