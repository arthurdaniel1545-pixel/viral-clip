import { useState, useRef } from 'react'

export default function VideoTab({ script }) {
  const [rendering, setRendering] = useState(false)
  const [url, setUrl] = useState('')
  const canvasRef = useRef(null)

  async function render() {
    setRendering(true)
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = 720, H = 1280
    canvas.width = W; canvas.height = H
    const stream = canvas.captureStream(30)
    const rec = new MediaRecorder(stream, { mimeType: 'video/webm' })
    const chunks = []
    rec.ondataavailable = e => chunks.push(e.data)
    rec.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' })
      setUrl(URL.createObjectURL(blob))
      setRendering(false)
    }
    rec.start()
    const start = performance.now()
    const dur = 6000
    function frame() {
      const t = (performance.now() - start) / dur
      if (t >= 1) { rec.stop(); return }
      const g = ctx.createLinearGradient(0, 0, 0, H)
      g.addColorStop(0, '#0f172a'); g.addColorStop(1, '#1e293b')
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
      ctx.fillStyle = '#34d399'
      ctx.font = 'bold 48px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('ViralClip', W/2, 120)
      ctx.fillStyle = '#e2e8f0'
      ctx.font = '28px sans-serif'
      const lines = (script || 'Seu video animado').slice(0, 200).split('\n')
      lines.forEach((l, i) => ctx.fillText(l.slice(0, 40), W/2, 300 + i*40))
      ctx.fillStyle = '#94a3b8'
      ctx.font = '20px sans-serif'
      ctx.fillText(Math.round(t*100) + '%', W/2, H-60)
      requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)
  }

  return (
    <div className="space-y-4">
      <canvas ref={canvasRef} className="hidden" />
      <button onClick={render} disabled={rendering}
        className="w-full bg-emerald-500 text-black font-semibold py-2.5 rounded-lg disabled:opacity-50">
        {rendering ? 'Renderizando...' : 'Renderizar video (WebM)'}
      </button>
      {url && (
        <div className="space-y-2">
          <video src={url} controls className="w-full rounded-lg" />
          <a href={url} download="viralclip.webm" className="block text-center text-emerald-400 text-sm">Baixar</a>
        </div>
      )}
    </div>
  )
}
