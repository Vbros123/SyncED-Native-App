import { useEffect, useRef, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { useI18n } from '../i18n.jsx'
import { probeWebGpu, isTutorSupported } from '../ai/webgpuProbe.js'
import { loadTutorEngine, terminateTutorEngine } from '../ai/tutorEngine.js'
import { generateHint } from '../ai/generateHint.js'
import { Button } from './UI.jsx'

let generating = false
const languageNames = { en: 'English', es: 'Spanish', hi: 'Hindi', ar: 'Arabic', fr: 'French' }

export default function AiTutor({ question }) {
  const { t, language } = useI18n()
  const [supported, setSupported] = useState(null)
  const [status, setStatus] = useState('idle')
  const [progress, setProgress] = useState(0)
  const [hint, setHint] = useState('')
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    probeWebGpu().then((probe) => { if (mounted.current) setSupported(isTutorSupported(probe)) })
    return () => { mounted.current = false }
  }, [])

  const ask = async () => {
    if (generating) { setStatus('fallback'); return }
    generating = true
    setStatus('loading')
    let timer
    let engine
    try {
      const loaded = await loadTutorEngine((report) => {
        if (mounted.current) setProgress(Math.round(Math.max(0, Math.min(1, report.progress || 0)) * 100))
      })
      engine = loaded.engine
      if (!mounted.current) return
      setStatus('thinking')
      const result = await Promise.race([
        generateHint(engine, {
          prompt: t(question.prompt), options: question.options.map((option) => t(option)),
          languageLabel: languageNames[language] || 'English', correctAnswer: t(question.options[question.correct]),
        }),
        new Promise((_, reject) => { timer = window.setTimeout(() => {
          terminateTutorEngine()
          reject(new Error('Hint timed out'))
        }, 45000) }),
      ])
      if (mounted.current) {
        setHint(result || '')
        setStatus(result ? 'ready' : 'fallback')
      }
    } catch {
      if (mounted.current) setStatus('fallback')
    } finally {
      window.clearTimeout(timer)
      generating = false
    }
  }
  const busy = status === 'loading' || status === 'thinking'
  return (
    <section className="ai-tutor" aria-label={t('AI hint')} aria-busy={busy}>
      <h4><Sparkles size={18} />{t('AI hint')}</h4>
      <p>{t('Optional on-device AI. The first download is large and needs internet. Cached models can work offline; your responses stay on this device.')}</p>
      <div role="status" aria-live="polite">
        {supported === false ? <p>{t('AI is unavailable on this device. You can still use the learning tip below.')}</p> : null}
        {status === 'loading' ? <p>{t('Loading AI model: {percent}%', { percent: progress })}</p> : null}
        {status === 'thinking' ? <p>{t('Thinking of a hint…')}</p> : null}
        {status === 'ready' ? <p>{hint}</p> : null}
        {status === 'fallback' ? <p>{t('AI could not provide a hint. Try the learning tip below.')}</p> : null}
      </div>
      <div className="ai-tutor-actions">
        <Button variant="secondary" icon={Sparkles} onClick={ask} disabled={!supported || busy || status === 'ready'}>{t('Download / use AI hint')}</Button>
        <details><summary>{t('Learning tip')}</summary><p>{t('Review the video and choose the answer that best matches the key idea.')}</p></details>
      </div>
      <small>{t('AI hints can be wrong. Check them against the lesson.')}</small>
    </section>
  )
}
