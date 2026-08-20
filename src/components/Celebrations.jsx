import { useEffect } from 'react'
import { BookOpen, Download, GraduationCap, Sparkles, Wifi } from 'lucide-react'
import Logo from './Logo.jsx'
import { useI18n } from '../i18n.jsx'

const launchCaps = [
  { x: '-42vw', drift: '-26px', delay: '90ms', rotate: '-18deg', scale: '.64' },
  { x: '-32vw', drift: '30px', delay: '260ms', rotate: '16deg', scale: '.82' },
  { x: '-21vw', drift: '-24px', delay: '150ms', rotate: '-12deg', scale: '1.02' },
  { x: '-10vw', drift: '18px', delay: '25ms', rotate: '10deg', scale: '.88' },
  { x: '0vw', drift: '12px', delay: '190ms', rotate: '-8deg', scale: '1.18' },
  { x: '11vw', drift: '28px', delay: '80ms', rotate: '14deg', scale: '.94' },
  { x: '22vw', drift: '-32px', delay: '300ms', rotate: '-16deg', scale: '.78' },
  { x: '33vw', drift: '20px', delay: '130ms', rotate: '18deg', scale: '1' },
  { x: '42vw', drift: '-18px', delay: '220ms', rotate: '-10deg', scale: '.68' },
]

const students = [
  { skin: '#8c4e2f', hair: '#23180f', shirt: '#ff805e', delay: '80ms' },
  { skin: '#d79766', hair: '#4b2c1b', shirt: '#0757e6', delay: '190ms' },
  { skin: '#5e351f', hair: '#15100d', shirt: '#19a343', delay: '300ms' },
]

const launchStars = [
  ['6%', '12%', '0ms', '.8'], ['15%', '35%', '240ms', '.55'], ['23%', '17%', '420ms', '1'],
  ['34%', '29%', '120ms', '.65'], ['43%', '9%', '500ms', '.85'], ['56%', '22%', '300ms', '.55'],
  ['67%', '11%', '80ms', '1'], ['76%', '34%', '560ms', '.7'], ['88%', '16%', '180ms', '.9'],
  ['94%', '43%', '380ms', '.55'], ['10%', '63%', '460ms', '.7'], ['91%', '70%', '40ms', '.8'],
]

const completionCaps = [
  { left: '5%', delay: '70ms', drift: '-18px', rotate: '-20deg', scale: '.68' },
  { left: '16%', delay: '0ms', drift: '24px', rotate: '15deg', scale: '.86' },
  { left: '27%', delay: '150ms', drift: '-10px', rotate: '-8deg', scale: '.76' },
  { left: '39%', delay: '45ms', drift: '14px', rotate: '12deg', scale: '1' },
  { left: '50%', delay: '190ms', drift: '-16px', rotate: '-14deg', scale: '1.14' },
  { left: '61%', delay: '90ms', drift: '20px', rotate: '18deg', scale: '.82' },
  { left: '73%', delay: '220ms', drift: '-24px', rotate: '-10deg', scale: '.94' },
  { left: '84%', delay: '30ms', drift: '18px', rotate: '16deg', scale: '.78' },
  { left: '95%', delay: '130ms', drift: '-12px', rotate: '-12deg', scale: '.66' },
]

export function LaunchSequence({ onComplete }) {
  const { t } = useI18n()

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.body.classList.add('launch-is-running')
    const timer = window.setTimeout(onComplete, reducedMotion ? 450 : 4200)
    return () => {
      window.clearTimeout(timer)
      document.body.classList.remove('launch-is-running')
    }
  }, [onComplete])

  return (
    <div className="launch-sequence" role="status" aria-live="polite" data-testid="launch-sequence">
      <div className="launch-sky" aria-hidden="true">
        <span className="launch-aurora launch-aurora-one" />
        <span className="launch-aurora launch-aurora-two" />
        <span className="launch-beam launch-beam-left" />
        <span className="launch-beam launch-beam-right" />
        <div className="launch-stars">
          {launchStars.map(([left, top, delay, scale], index) => <i key={index} style={{ '--star-left': left, '--star-top': top, '--star-delay': delay, '--star-scale': scale }} />)}
        </div>
      </div>
      <div className="launch-curtain launch-curtain-left" />
      <div className="launch-curtain launch-curtain-right" />
      <div className="launch-glow" />
      <div className="launch-copy">
        <Logo />
        <span className="launch-ready-pill"><Wifi size={15} />{t('Offline ready')}</span>
        <h1>{t('All set to learn')}</h1>
        <p>{t('Your lessons are ready. Pick one thing to do next.')}</p>
        <span className="launch-progress" aria-hidden="true"><i /></span>
      </div>
      <div className="launch-orbit" aria-hidden="true">
        <span className="launch-orbit-ring launch-orbit-ring-one" />
        <span className="launch-orbit-ring launch-orbit-ring-two" />
        <span className="launch-orbit-icon launch-orbit-book"><BookOpen /></span>
        <span className="launch-orbit-icon launch-orbit-wifi"><Wifi /></span>
        <span className="launch-orbit-icon launch-orbit-download"><Download /></span>
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
      <span className="launch-stage-glow" aria-hidden="true" />
    </div>
  )
}

export function LessonCompleteBurst({ burstId }) {
  const { t } = useI18n()
  if (!burstId) return null

  return (
    <div className="lesson-complete-burst" role="status" aria-live="polite" data-burst-id={burstId}>
      <span className="sr-only">{t('Lesson complete')}</span>
      <span className="lesson-complete-label" aria-hidden="true"><GraduationCap /><strong>{t('Lesson complete')}</strong><Sparkles /></span>
      <div className="completion-caps" aria-hidden="true">
        {completionCaps.map((cap, index) => (
          <span
            className="completion-cap"
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
