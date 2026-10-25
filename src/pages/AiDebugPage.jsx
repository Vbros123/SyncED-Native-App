import { AlertTriangle, Check, Cpu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { probeWebGpu, isTutorSupported } from '../ai/webgpuProbe.js'
import { loadTutorEngine, unloadTutorEngine } from '../ai/tutorEngine.js'

function Row({ label, ok, detail }) {
  return (
    <div className="ai-debug-row">
      {ok ? <Check size={18} color="var(--color-success, #1a7f37)" /> : <X size={18} color="var(--color-danger, #d1242f)" />}
      <div><strong>{label}</strong>{detail ? <span>{detail}</span> : null}</div>
    </div>
  )
}

export default function AiDebugPage() {
  const [probe, setProbe] = useState(null)
  const [engineStatus, setEngineStatus] = useState('idle')
  const [progressText, setProgressText] = useState('')
  const [modelId, setModelId] = useState('')
  const [engineError, setEngineError] = useState('')

  useEffect(() => {
    let cancelled = false
    probeWebGpu().then((result) => { if (!cancelled) setProbe(result) })
    return () => { cancelled = true }
  }, [])

  const download = async () => {
    setEngineStatus('downloading')
    setEngineError('')
    try {
      const { modelId: id } = await loadTutorEngine((report) => setProgressText(report.text))
      setModelId(id)
      setEngineStatus('ready')
    } catch (error) {
      setEngineError(error?.message || String(error))
      setEngineStatus('error')
    }
  }

  const unload = async () => {
    await unloadTutorEngine()
    setEngineStatus('idle')
    setProgressText('')
    setModelId('')
  }

  return (
    <div className="page-stack" style={{ padding: '24px', maxWidth: '560px', margin: '0 auto' }}>
      <h1><Cpu size={22} style={{ verticalAlign: 'middle', marginRight: '8px' }} />AI tutor — WebGPU probe</h1>
      <p>Debug-only route (<code>#debug-ai</code>). Reports whether this runtime can run the on-device tutor.</p>

      {!probe ? <p>Probing…</p> : (
        <div className="panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Row label="navigator.gpu exists" ok={probe.hasNavigatorGpu} />
          <Row label="requestAdapter() returned an adapter" ok={probe.hasAdapter} />
          <Row label="adapter has shader-f16 feature" ok={probe.hasShaderF16} />
          {probe.adapterInfo ? <p>Adapter: {probe.adapterInfo.vendor || 'unknown vendor'} / {probe.adapterInfo.architecture || 'unknown architecture'}</p> : null}
          {probe.error ? <div className="ai-debug-row"><AlertTriangle size={18} color="var(--color-warning, #9a6700)" /><div><strong>Error</strong><span>{probe.error}</span></div></div> : null}
          <hr />
          <p><strong>Tutor supported:</strong> {isTutorSupported(probe) ? 'yes' : 'no'}</p>

          {isTutorSupported(probe) ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={download} disabled={engineStatus === 'downloading' || engineStatus === 'ready'}>Download model</button>
                <button onClick={unload} disabled={engineStatus === 'idle'}>Unload</button>
              </div>
              <p>Status: {engineStatus}</p>
              {modelId ? <p>Model: {modelId}</p> : null}
              {progressText ? <p>{progressText}</p> : null}
              {engineError ? <p style={{ color: 'var(--color-danger, #d1242f)' }}>{engineError}</p> : null}
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
