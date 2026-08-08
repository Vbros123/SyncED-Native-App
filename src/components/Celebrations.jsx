import { useEffect } from 'react'
import { GraduationCap, Sparkles } from 'lucide-react'
import Logo from './Logo.jsx'
import { useI18n } from '../i18n.jsx'

const launchCaps = [
  { x: '-34vw', drift: '-28px', delay: '80ms', rotate: '-18deg', scale: '.76' },
  { x: '-23vw', drift: '34px', delay: '230ms', rotate: '16deg', scale: '1.04' },
  { x: '-11vw', drift: '-18px', delay: '30ms', rotate: '-8deg', scale: '.88' },
  { x: '0vw', drift: '14px', delay: '180ms', rotate: '12deg', scale: '1.16' },
  { x: '12vw', drift: '28px', delay: '110ms', rotate: '-14deg', scale: '.92' },
  { x: '24vw', drift: '-30px', delay: '280ms', rotate: '18deg', scale: '.82' },
  { x: '35vw', drift: '18px', delay: '40ms', rotate: '-10deg', scale: '1' },
]

const students = [
  { skin: '#8c4e2f', hair: '#23180f', shirt: '#ff805e', delay: '80ms' },
  { skin: '#d79766', hair: '#4b2c1b', shirt: '#0757e6', delay: '190ms' },
  { skin: '#5e351f', hair: '#15100d', shirt: '#19a343', delay: '300ms' },
]

const answerCaps = [
  { left: '9%', delay: '0ms', drift: '-18px', rotate: '-20deg', scale: '.74' },
  { left: '22%', delay: '100ms', drift: '24px', rotate: '15deg', scale: '.9' },
  { left: '36%', delay: '35ms', drift: '-10px', rotate: '-8deg', scale: '.78' },
  { left: '50%', delay: '145ms', drift: '14px', rotate: '12deg', scale: '1.08' },
  { left: '64%', delay: '60ms', drift: '20px', rotate: '-14deg', scale: '.84' },
  { left: '78%', delay: '180ms', drift: '-24px', rotate: '18deg', scale: '.94' },
  { left: '91%', delay: '20ms', drift: '12px', rotate: '-10deg', scale: '.72' },
]

export function LaunchSequence({ onComplete }) {
  const { t } = useI18n()

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.body.classList.add('launch-is-running')
    const timer = window.setTimeout(onComplete, reducedMotion ? 450 : 3500)
    return () => {
      window.clearTimeout(timer)
      document.body.classList.remove('launch-is-running')
    }
  }, [onComplete])

  return (
    <div className="launch-sequence" role="status" aria-live="polite" data-testid="launch-sequence">
      <div className="launch-curtain launch-curtain-left" />
      <div className="launch-curtain launch-curtain-right" />
      <div className="launch-glow" />
      <div className="launch-copy">
        <Logo />
        <h1>{t('All set to learn')}</h1>
        <p>{t('Your lessons are ready. Pick one thing to do next.')}</p>
      </div>
      <div className="launch-caps" aria-hidden="true">
        {launchCaps.map((cap, index) => (
          <span
            className="launch-cap"
            key={index}
            style={{ '--cap-x': cap.x, '--cap-drift': cap.drift, '--cap-delay': cap.delay, '--cap-rotate': cap.rotate, '--cap-scale': cap.scale }}
          >
            <GraduationCap />
          </span>
        ))}
      </div>
      <div className="launch-students" aria-hidden="true">
        {students.map((student, index) => (
          <div
            className={`launch-student launch-student-${index + 1}`}
            key={index}
            style={{ '--skin': student.skin, '--hair': student.hair, '--shirt': student.shirt, '--student-delay': student.delay }}
          >
            <span className="student-head"><i /><b /><b /><em /></span>
            <span className="student-body"><Sparkles size={18} /></span>
            <span className="student-arm student-arm-left" />
            <span className="student-arm student-arm-right" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function CorrectCapBurst({ burstId }) {
  const { t } = useI18n()
  if (!burstId) return null

  return (
    <div className="correct-cap-burst" role="status" aria-live="polite" data-burst-id={burstId}>
      <span className="sr-only">{t('That’s right.')}</span>
      <div aria-hidden="true">
        {answerCaps.map((cap, index) => (
          <span
            className="answer-cap"
            key={`${burstId}-${index}`}
            style={{ '--cap-left': cap.left, '--cap-delay': cap.delay, '--cap-drift': cap.drift, '--cap-rotate': cap.rotate, '--cap-scale': cap.scale }}
          >
            <GraduationCap />
          </span>
        ))}
      </div>
    </div>
  )
}
