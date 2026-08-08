import {
  Bookmark,
  BookmarkCheck,
  Check,
  CheckCircle2,
  CircleCheckBig,
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
import { useEffect, useMemo, useRef, useState } from 'react'
import { Button, Progress } from '../components/UI.jsx'
import { CorrectCapBurst } from '../components/Celebrations.jsx'
import { courseContent, courses } from '../data.js'
import { useI18n } from '../i18n.jsx'

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

export default function LessonPage({ courseId, lessonIndex, state, downloaded, onBack, onChangeLesson, onRecordAttempt, onCompleteQuestion, onToggleSave, onViewQueue, onDownloadWorksheet }) {
  const { t } = useI18n()
  const course = useMemo(() => courses.find((item) => item.id === courseId) || courses[0], [courseId])
  const content = courseContent[course.id]
  const question = content.questions[lessonIndex] || content.questions[0]
  const [choice, setChoice] = useState(null)
  const [checked, setChecked] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [simple, setSimple] = useState(state.settings.plainLanguage)
  const [celebrationId, setCelebrationId] = useState(0)
  const [showReview, setShowReview] = useState(false)
  const overviewRef = useRef(null)
  const wasCompleteRef = useRef(false)
  const correct = choice === question.correct
  const questionPrompt = t(question.prompt, { lesson: t(course.title) })
  const completed = state.courseProgress[course.id]?.includes(lessonIndex)
  const courseResults = useMemo(() => state.quizResults?.[course.id] || {}, [state.quizResults, course.id])
  const savedKey = `${course.id}:${lessonIndex}`
  const saved = state.savedLessons.includes(savedKey)
  const completedCount = state.courseProgress[course.id]?.length || 0
  const allCompleted = completedCount >= content.questions.length
  const firstTryCount = content.questions.filter((_, index) => courseResults[index]?.firstAttemptCorrect ?? state.courseProgress[course.id]?.includes(index)).length
  const correctedCount = content.questions.length - firstTryCount
  const averageScore = Math.round(content.questions.reduce((sum, _, index) => {
    const result = courseResults[index]
    return sum + (result?.score ?? (state.courseProgress[course.id]?.includes(index) ? 100 : 0))
  }, 0) / content.questions.length)

  useEffect(() => {
    setChoice(null)
    setChecked(false)
    setAttempts(courseResults[lessonIndex]?.attempts || 0)
    setCelebrationId(0)
  }, [course.id, lessonIndex])

  useEffect(() => setShowReview(false), [course.id])

  useEffect(() => {
    if (allCompleted && !wasCompleteRef.current) {
      window.requestAnimationFrame(() => overviewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    }
    wasCompleteRef.current = allCompleted
  }, [allCompleted])

  const checkAnswer = async () => {
    setChecked(true)
    if (completed) {
      if (choice === question.correct) setCelebrationId((current) => current + 1)
      return
    }

    const nextAttempts = attempts + 1
    setAttempts(nextAttempts)
    const result = await onRecordAttempt(course.id, lessonIndex, choice, choice === question.correct, nextAttempts)

    if (choice === question.correct) {
      setCelebrationId((current) => current + 1)
      await onCompleteQuestion(course.id, lessonIndex, choice, result)
    }
  }

  const readAloud = () => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const text = `${t(question.title)}. ${questionPrompt}. ${t(question.explanation)}`
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text))
  }

  const correctedLesson = content.questions.findIndex((_, index) => courseResults[index] && !courseResults[index].firstAttemptCorrect)

  return (
    <div className="lesson-page page-stack">
      <CorrectCapBurst burstId={celebrationId} />
      <div className="lesson-heading">
        <button className="back-button" onClick={onBack}><ChevronLeft size={19} />{t('Explore lessons')}</button>
        <div className="lesson-title-line"><div><h1>{t(course.title)}</h1><p>{t(course.subject)} <span>›</span> {t('Question {current} of {total}', { current: lessonIndex + 1, total: content.questions.length })} <span>•</span> <em>{downloaded ? <CheckCircle2 size={15} /> : <Download size={15} />}{downloaded ? t('Available offline') : t('Online access only')}</em></p></div></div>
      </div>

      {allCompleted && !showReview ? (
        <section className="panel quiz-overview" ref={overviewRef} role="status" aria-live="polite">
          <div className="quiz-overview-header">
            <div className="quiz-overview-icon"><CircleCheckBig size={30} /></div>
            <div><p className="context-line">{t('Quiz complete')}</p><h2>{t('You answered all {count} questions.', { count: content.questions.length })}</h2><p>{t('You got {firstTry} right on the first try and corrected {corrected}.', { firstTry: firstTryCount, corrected: correctedCount })}</p></div>
          </div>
          <div className="quiz-score-summary">
            <div className="quiz-score-number"><strong>{averageScore}%</strong><span>{t('Mastery score')}</span></div>
            <div className="quiz-score-copy"><strong>{t('{count} of {total} correct on the first try', { count: firstTryCount, total: content.questions.length })}</strong><span>{t('{count} corrected after another try', { count: correctedCount })}</span><p>{t('Corrected answers finish the quiz but do not count as first-try mastery.')}</p></div>
          </div>
          <details className="quiz-details">
            <summary>{t('See question details')}</summary>
            <div className="quiz-result-list">
              {content.questions.map((item, index) => {
                const result = courseResults[index]
                const firstTry = result?.firstAttemptCorrect ?? state.courseProgress[course.id]?.includes(index)
                return <button key={item.title} onClick={() => onChangeLesson(index)}><span>{index + 1}</span><strong>{t(item.title)}</strong><em className={firstTry ? 'first-try' : 'corrected'}>{firstTry ? t('First try') : t('Corrected in {count} attempts', { count: result?.attempts || 2 })}</em></button>
              })}
            </div>
          </details>
          <div className="quiz-overview-actions"><Button variant="secondary" icon={RotateCcw} onClick={() => { setShowReview(true); onChangeLesson(correctedLesson >= 0 ? correctedLesson : 0) }}>{t(correctedLesson >= 0 ? 'Review corrected question' : 'Review questions')}</Button><Button onClick={onBack}>{t('Choose another lesson')}</Button></div>
        </section>
      ) : null}

      {allCompleted && showReview ? <button className="back-button result-back-button" onClick={() => setShowReview(false)}><ChevronLeft size={19} />{t('Back to quiz result')}</button> : null}

      {!allCompleted || showReview ? <div className="lesson-layout">
        <article className="panel lesson-workspace">
          <div className="lesson-toolbar">
            <div><p className="context-line">{t('Question {number}', { number: lessonIndex + 1 })}</p><h2>{t(question.title)}</h2><p>{t(simple ? 'Use a short explanation, then try one question. You can replay the video at any time.' : 'Watch the short explainer, review the key idea, and apply it to a practice question.')}</p></div>
            <div className="lesson-tools"><button onClick={() => setSimple(!simple)} className={simple ? 'active' : ''}><Languages size={17} />{t('Plain language')}</button><button aria-label={t('Read lesson aloud')} onClick={readAloud}><Volume2 size={17} /></button></div>
          </div>

          <MiniVideo content={content} />

          <section className="practice-box">
            <div className="practice-heading"><div><h3>{t('Your turn')}</h3><p>{questionPrompt}</p></div><span><Sparkles size={14} />{t('10 points')}</span></div>
            <div className="lesson-choice-list">
              {question.options.map((option, index) => (
                <button key={option} className={`${choice === index ? 'selected' : ''} ${checked && index === question.correct ? 'correct' : ''} ${checked && choice === index && index !== question.correct ? 'incorrect' : ''}`} onClick={() => { setChoice(index); setChecked(false) }}>
                  <span>{choice === index ? <Check size={15} /> : String.fromCharCode(65 + index)}</span>{t(option)}
                </button>
              ))}
            </div>
            {checked && correct ? <div className="answer-feedback correct"><CheckCircle2 size={18} /><span><strong>{attempts > 1 ? t('Corrected.') : t('That’s right.')}</strong> {attempts > 1 ? t('Nice recovery. This answer counts as corrected, not first-try mastery.') : t(question.explanation)}</span></div> : null}
            {checked && !correct ? <div className="answer-feedback incorrect"><RotateCcw size={18} /><span><strong>{t('Try again.')}</strong> {t('Review the video and choose the answer that best matches the key idea.')} {!completed ? t('Attempt {count} saved. Your next correct answer will complete this question.', { count: attempts }) : null}</span></div> : null}
          </section>

          <div className="lesson-actions">
            <Button variant="secondary" icon={ChevronLeft} disabled={lessonIndex === 0} onClick={() => onChangeLesson(lessonIndex - 1)}>{t('Previous')}</Button>
            <Button variant="quiet" icon={saved ? BookmarkCheck : Bookmark} onClick={() => onToggleSave(savedKey)}>{saved ? t('Saved for later') : t('Save for later')}</Button>
            {checked && correct && lessonIndex < content.questions.length - 1 ? <Button icon={ChevronRight} onClick={() => onChangeLesson(lessonIndex + 1)}>{t('Next question')}</Button> : <Button onClick={checkAnswer} disabled={choice === null}>{completed ? t('Check again') : t('Check answer')}</Button>}
          </div>

          <div className="lesson-resource-actions"><Button variant="quiet" icon={FileText} onClick={() => onDownloadWorksheet(course.id)}>{t('Download worksheet')}</Button><span>{t('The worksheet is saved as a printable file and works offline.')}</span></div>
          <div className="queued-note"><CloudUpload size={22} /><div><strong>{t('Your work is saved offline')}</strong><span>{t('Completed work will upload automatically when you reconnect.')}</span></div><button onClick={onViewQueue}>{t('View sync queue')}</button></div>
        </article>

        <aside className="panel lesson-outline">
          <div className="outline-heading"><div><h2>{t('Quiz questions')}</h2><p>{t('{done} of {total} questions', { done: Math.min(completedCount, content.questions.length), total: content.questions.length })}</p></div><Progress value={(completedCount / content.questions.length) * 100} /></div>
          <div className="outline-list">
            {content.questions.map((item, index) => {
              const isComplete = state.courseProgress[course.id]?.includes(index)
              const current = index === lessonIndex
              return (
                <button className={`outline-row ${isComplete ? 'outline-complete' : current ? 'outline-current' : 'outline-downloaded'}`} key={item.title} onClick={() => onChangeLesson(index)}>
                  <span>{isComplete ? <Check size={16} strokeWidth={3} /> : current ? index + 1 : <Download size={16} />}</span>
                  <div><strong>{index + 1}. {t(item.title)}</strong><small>{isComplete ? t('Answered') : current ? t('In progress') : t('Not answered')}</small></div>
                </button>
              )
            })}
          </div>
        </aside>
      </div> : null}
    </div>
  )
}
