import { ArrowLeft, BookOpenCheck, Check, CheckCircle2, Clock3, Languages, Play, Search, ShieldCheck, Sparkles, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { skills } from '../data.js'
import { useI18n } from '../i18n.jsx'
import { Button, Progress } from '../components/UI.jsx'
import { CorrectCapBurst } from '../components/Celebrations.jsx'

function SkillLesson({ skill, onClose, onComplete }) {
  const { t } = useI18n()
  const [step, setStep] = useState(0)
  const [choice, setChoice] = useState('')
  const [checked, setChecked] = useState(false)
  const [celebrationId, setCelebrationId] = useState(0)
  const Icon = skill.icon
  const correct = choice === 'check'

  const checkAnswer = () => {
    if (checked && correct) {
      setStep(2)
      return
    }
    setChecked(true)
    if (correct) setCelebrationId((current) => current + 1)
  }

  if (step === 2) {
    return (
      <div className="skill-lesson-complete">
        <span className="completion-burst"><Check size={42} strokeWidth={3} /></span><p className="context-line">{t('Lesson complete')}</p><h2>{t('That skill is yours.')}</h2><p>{t('You finished {skill}. Your progress is saved on this device and ready to sync.', { skill: t(skill.title) })}</p>
        <div className="earned-strip"><Sparkles size={20} /><div><strong>{t('+25 learning points')}</strong><span>{t('Points move Nova toward the next upgrade.')}</span></div></div>
        <Button onClick={() => { onComplete(skill.id); onClose() }}>{t('Back to digital skills')}</Button>
      </div>
    )
  }

  return (
    <div className="skill-lesson-view">
      <CorrectCapBurst burstId={celebrationId} />
      <div className="skill-lesson-top"><button className="back-button" onClick={onClose}><ArrowLeft size={18} />{t('Digital skills')}</button><div className="skill-step-progress"><span>{t('Step {current} of 2', { current: step + 1 })}</span><Progress value={(step + 1) * 50} compact /></div></div>
      {step === 0 ? (
        <div className="skill-story">
          <div className={`skill-story-icon skill-color-${skill.color}`}><Icon size={54} /></div><p className="context-line">{t(skill.category)}</p><h2>{t(skill.title)}</h2><p className="skill-lead">{t(skill.description)}</p>
          <div className="message-example"><div className="message-avatar">?</div><div><strong>{t('Account Support')}</strong><span>{t('URGENT: Your school account will close today. Click this link and enter your password now.')}</span></div></div>
          <div className="warning-signs">
            <div><span>1</span><p><strong>{t('Unexpected urgency')}</strong><small>{t('Real school staff give clear context and time.')}</small></p></div>
            <div><span>2</span><p><strong>{t('Asks for private details')}</strong><small>{t('Never share a password through a message.')}</small></p></div>
            <div><span>3</span><p><strong>{t('Unfamiliar link or sender')}</strong><small>{t('Open the official app yourself instead.')}</small></p></div>
          </div>
          <Button onClick={() => setStep(1)}>{t('Try a quick check')}</Button>
        </div>
      ) : (
        <div className="skill-quiz">
          <span className="quiz-icon"><ShieldCheck size={29} /></span><p className="context-line">{t('Quick check')}</p><h2>{t('What should you do first?')}</h2><p>{t('A text says your school password expires in ten minutes and asks you to use a link.')}</p>
          <div className="choice-list">
            {[
              ['click', 'Click quickly so the account stays open'],
              ['reply', 'Reply with your password and ask if it is real'],
              ['check', 'Open the official school app or ask a trusted adult'],
            ].map(([value, label]) => (
              <label className={`${choice === value ? 'selected' : ''} ${checked && value === 'check' ? 'correct' : ''}`} key={value}><input type="radio" name="skill-choice" value={value} checked={choice === value} onChange={() => { setChoice(value); setChecked(false) }} /><span>{choice === value ? <Check size={15} /> : null}</span>{t(label)}</label>
            ))}
          </div>
          {checked ? <div className={`answer-feedback ${correct ? 'correct' : 'incorrect'}`}>{correct ? <CheckCircle2 size={18} /> : <ShieldCheck size={18} />}<span>{correct ? <><strong>{t('Exactly.')}</strong> {t('Use a trusted route instead of the message link.')}</> : <><strong>{t('Try once more.')}</strong> {t('Never rush or share a password because a message tells you to.')}</>}</span></div> : null}
          <Button disabled={!choice} onClick={checkAnswer}>{checked && correct ? t('Finish lesson') : t('Check answer')}</Button>
        </div>
      )}
    </div>
  )
}

export default function SkillsPage({ state, onCompleteSkill, initialSkill, onClearInitialSkill }) {
  const { t, locale } = useI18n()
  const [audience, setAudience] = useState('All')
  const [query, setQuery] = useState('')
  const [activeSkill, setActiveSkill] = useState(initialSkill || null)
  useEffect(() => { if (initialSkill) setActiveSkill(initialSkill) }, [initialSkill])
  const filtered = useMemo(() => skills.filter((skill) => (audience === 'All' || skill.audience === audience || skill.audience === 'Everyone') && `${t(skill.title)} ${t(skill.category)}`.toLowerCase().includes(query.toLowerCase())), [audience, query, t])

  const closeLesson = () => { setActiveSkill(null); onClearInitialSkill?.() }
  if (activeSkill) {
    const skill = skills.find((item) => item.id === activeSkill)
    return <SkillLesson skill={skill} onClose={closeLesson} onComplete={onCompleteSkill} />
  }

  return (
    <div className="page-stack">
      <div className="page-heading split-heading skills-heading"><div><p className="context-line">{t('Confidence for the whole household')}</p><h1>{t('Digital skills')}</h1><p>{t(state.settings.plainLanguage ? 'Short lessons show you how to use devices and stay safe.' : 'Short, plain-language lessons you can learn anywhere—in your selected language.')}</p></div><div className="skills-total"><span><BookOpenCheck size={24} /></span><div><strong>{t('{count} skills learned', { count: state.completedSkills.length })}</strong><p>{t('{count} learning points', { count: state.completedSkills.length * 25 })}</p></div></div></div>
      <section className="skills-feature-band"><div className="skill-band-art"><ShieldCheck size={72} strokeWidth={1.3} /><span className="band-check"><Check size={18} /></span></div><div><span className="small-label"><Sparkles size={14} />{t('Recommended next')}</span><h2>{t('Spot online scams')}</h2><p>{t('Recognize suspicious messages, protect your information, and know who to ask for help.')}</p><div className="meta-line"><Clock3 size={15} />12 {t('min')} <span />{t('Beginner')} <span />{t('Available offline')}</div></div><Button icon={Play} onClick={() => setActiveSkill('scams')}>{state.completedSkills.includes('scams') ? t('Review lesson') : t('Start lesson')}</Button></section>
      <div className="skills-toolbar"><div className="audience-switch">{['All', 'Students', 'Families'].map((item) => <button className={audience === item ? 'active' : ''} onClick={() => setAudience(item)} key={item}>{item === 'Families' ? <Users size={15} /> : null}{t(item)}</button>)}</div><label className="search-control"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('Search skills')} /></label><span className="translation-note"><Languages size={17} />{locale.label}</span></div>
      <section className="skills-list"><div className="list-intro"><h2>{t('Explore skills')}</h2><span>{t('{count} lessons downloaded', { count: filtered.length })}</span></div>{filtered.map((skill) => { const Icon = skill.icon; const complete = state.completedSkills.includes(skill.id); return <article className="skill-row" key={skill.id}><span className={`skill-list-icon skill-color-${skill.color}`}><Icon size={25} /></span><div className="skill-row-copy"><small>{t(skill.category)}</small><h3>{t(skill.title)}</h3><p>{t(state.settings.plainLanguage ? skill.plainDescription : skill.description)}</p></div><div className="skill-row-meta"><span><Clock3 size={14} />{t(skill.duration)}</span><span>{t(skill.audience)}</span>{complete ? <em><CheckCircle2 size={14} />{t('Completed')}</em> : null}</div><Button variant={complete ? 'quiet' : 'secondary'} onClick={() => setActiveSkill(skill.id)}>{complete ? t('Review') : t('Start')}</Button></article>})}</section>
    </div>
  )
}
