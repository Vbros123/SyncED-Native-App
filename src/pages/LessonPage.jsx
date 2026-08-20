import {
  Bookmark,
  BookmarkCheck,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CloudUpload,
  Download,
  FileText,
  Languages,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button, Progress } from '../components/UI.jsx'
import { LessonCompleteBurst } from '../components/Celebrations.jsx'
import { courseContent, courses } from '../data.js'
import { useI18n } from '../i18n.jsx'
import { playCorrectSound } from '../utils/sounds.js'

function MiniVideo({ content }) {
  const { t } = useI18n()
  const [playing, setPlaying] = useState(false)
  const [slide, setSlide] = useState(0)
  const progress = ((slide + 1) / content.videoSlides.length) * 100

  useEffect(() => {
    if (!playing) return undefined
    const timer = window.setInterval(() => {
      setSlide((current) => {
        if (current >= content.videoSlides.length - 1) {
          setPlaying(false)
          return 0
        }
        return current + 1
      })
    }, 3000)
    return () => window.clearInterval(timer)
  }, [playing, content.videoSlides.length])

  const [title, body] = content.videoSlides[slide]
  return (
    <section className="mini-video" aria-label={t('Mini-video: {title}', { title: t(content.videoTitle) })}>
      <div className="video-screen">
        <span className="video-grid" />
        <div className="video-visual"><span>{slide + 1}</span><i /><span>{content.videoSlides.length}</span></div>
        <div className="video-copy"><small>{t('Offline mini-video')}</small><h3>{t(title)}</h3><p>{t(body)}</p></div>
        <button className="video-play" onClick={() => setPlaying(!playing)} aria-label={t(playing ? 'Pause video' : 'Play video')}>{playing ? <Pause size={24} /> : <Play size={24} fill="currentColor" />}</button>
      </div>
      <div className="video-controls"><button onClick={() => setPlaying(!playing)}>{playing ? <Pause size={16} /> : <Play size={16} />}{t(playing ? 'Pause' : 'Play')}</button><Progress value={progress} compact /><span>{slide + 1} / {content.videoSlides.length}</span></div>
    </section>
  )
}

export default function LessonPage({ courseId, lessonIndex, state, onBack, onChangeLesson, onCompleteQuestion, onToggleSave, onViewQueue, onDownloadWorksheet }) {
  const { t } = useI18n()
  const course = useMemo(() => courses.find((item) => item.id === courseId) || courses[0], [courseId])
  const content = courseContent[course.id]
  const question = content.questions[lessonIndex] || content.questions[0]
  const [choice, setChoice] = useState(null)
  const [checked, setChecked] = useState(false)
  const [simple, setSimple] = useState(state.settings.plainLanguage)
  const [celebrationId, setCelebrationId] = useState(0)
  const [completedThisVisit, setCompletedThisVisit] = useState(false)
  const correct = choice === question.correct
  const completed = state.courseProgress[course.id]?.includes(lessonIndex)
  const savedKey = `${course.id}:${lessonIndex}`
  const saved = state.savedLessons.includes(savedKey)

  useEffect(() => {
    setChoice(null)
    setChecked(false)
    setCelebrationId(0)
    setCompletedThisVisit(false)
  }, [course.id, lessonIndex])

  const checkAnswer = () => {
    setChecked(true)
    if (choice === question.correct) {
      playCorrectSound()
    }
  }

  const completeLesson = () => {
    if (completed || completedThisVisit) return
    setCompletedThisVisit(true)
    setCelebrationId((current) => current + 1)
    onCompleteQuestion(course.id, lessonIndex)
  }

  const readAloud = () => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const text = `${t(question.title)}. ${t(question.prompt)}. ${t(question.explanation)}`
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text))
  }

  const completedCount = state.courseProgress[course.id]?.length || 0
  const lessonIsComplete = completed || completedThisVisit

  return (
    <div className="lesson-page page-stack">
      <LessonCompleteBurst burstId={celebrationId} />
      <div className="lesson-heading">
        <button className="back-button" onClick={onBack}><ChevronLeft size={19} />{t('My learning')}</button>
        <div className="lesson-title-line"><div><h1>{t(course.title)}</h1><p>{t(course.subject)} <span>›</span> {t('Lesson {current} of {total}', { current: lessonIndex + 1, total: content.questions.length })} <span>•</span> <em><CheckCircle2 size={15} />{t('Available offline')}</em></p></div></div>
      </div>

      <div className="lesson-layout">
        <article className="panel lesson-workspace">
          <div className="lesson-toolbar">
            <div><p className="context-line">{t('Lesson {number}', { number: lessonIndex + 1 })}</p><h2>{t(question.title)}</h2><p>{t(simple ? 'Use a short explanation, then try one question. You can replay the video at any time.' : 'Watch the short explainer, review the key idea, and apply it to a practice question.')}</p></div>
            <div className="lesson-tools"><button onClick={() => setSimple(!simple)} className={simple ? 'active' : ''}><Languages size={17} />{t('Plain language')}</button><button aria-label={t('Read lesson aloud')} onClick={readAloud}><Volume2 size={17} /></button></div>
          </div>

          <MiniVideo content={content} />

          <section className="practice-box">
            <div className="practice-heading"><div><h3>{t('Your turn')}</h3><p>{t(question.prompt)}</p></div><span><Sparkles size={14} />{t('10 points')}</span></div>
            <div className="lesson-choice-list">
              {question.options.map((option, index) => (
                <button key={option} className={`${choice === index ? 'selected' : ''} ${checked && index === question.correct ? 'correct' : ''} ${checked && choice === index && index !== question.correct ? 'incorrect' : ''}`} onClick={() => { setChoice(index); setChecked(false) }}>
                  <span>{choice === index ? <Check size={15} /> : String.fromCharCode(65 + index)}</span>{t(option)}
                </button>
              ))}
            </div>
            {checked && correct ? <div className="answer-feedback correct"><CheckCircle2 size={18} /><span><strong>{t('That’s right.')}</strong> {t(question.explanation)}</span></div> : null}
            {checked && !correct ? <div className="answer-feedback incorrect"><RotateCcw size={18} /><span><strong>{t('Try again.')}</strong> {t('Review the video and choose the answer that best matches the key idea.')}</span></div> : null}
          </section>

          <div className="lesson-actions">
            <Button variant="secondary" icon={ChevronLeft} disabled={lessonIndex === 0} onClick={() => onChangeLesson(lessonIndex - 1)}>{t('Previous')}</Button>
            <Button variant="quiet" icon={saved ? BookmarkCheck : Bookmark} onClick={() => onToggleSave(savedKey)}>{saved ? t('Saved for later') : t('Save for later')}</Button>
            {checked && correct ? (
              !lessonIsComplete
                ? <Button icon={CheckCircle2} onClick={completeLesson}>{t('Complete lesson')}</Button>
                : lessonIndex < content.questions.length - 1
                  ? <Button icon={ChevronRight} onClick={() => onChangeLesson(lessonIndex + 1)}>{t('Next lesson')}</Button>
                  : <Button icon={CheckCircle2} onClick={onBack}>{t('My learning')}</Button>
            ) : <Button onClick={checkAnswer} disabled={choice === null}>{completed ? t('Check again') : t('Check answer')}</Button>}
          </div>

          <div className="lesson-resource-actions"><Button variant="quiet" icon={FileText} onClick={() => onDownloadWorksheet(course.id)}>{t('Download worksheet')}</Button><span>{t('The worksheet is saved as a printable file and works offline.')}</span></div>
          <div className="queued-note"><CloudUpload size={22} /><div><strong>{t('Your work is saved offline')}</strong><span>{t('Completed work will upload automatically when you reconnect.')}</span></div><button onClick={onViewQueue}>{t('View sync queue')}</button></div>
        </article>

        <aside className="panel lesson-outline">
          <div className="outline-heading"><div><h2>{t(course.title)}</h2><p>{t('{done} of {total} complete', { done: completedCount, total: content.questions.length })}</p></div><Progress value={(completedCount / content.questions.length) * 100} /></div>
          <div className="outline-list">
            {content.questions.map((item, index) => {
              const isComplete = state.courseProgress[course.id]?.includes(index)
              const current = index === lessonIndex
              return (
                <button className={`outline-row ${isComplete ? 'outline-complete' : current ? 'outline-current' : 'outline-downloaded'}`} key={item.title} onClick={() => onChangeLesson(index)}>
                  <span>{isComplete ? <Check size={16} strokeWidth={3} /> : current ? index + 1 : <Download size={16} />}</span>
                  <div><strong>{index + 1}. {t(item.title)}</strong><small>{isComplete ? t('Completed') : current ? t('In progress') : t('Downloaded')}</small></div>
                </button>
              )
            })}
          </div>
        </aside>
      </div>
    </div>
  )
}
