import { CheckCircle2, ChevronRight, Download } from 'lucide-react'
import { useI18n } from '../i18n.jsx'
import { Button, Progress } from './UI.jsx'

export default function CourseRow({ course, onOpen, compact = false, plainLanguage = false, isDownloaded = false, completedCount }) {
  const { t } = useI18n()
  const Icon = course.icon
  const done = completedCount ?? 0
  const progress = Math.round((done / course.questionsTotal) * 100)
  return (
    <article className={`course-row ${compact ? 'course-row-compact' : ''}`}>
      <div className={`course-art course-art-${course.color}`}>
        <Icon size={compact ? 30 : 38} strokeWidth={1.7} />
        <span className="course-art-lines" />
      </div>
      <div className="course-copy">
        <p className="course-subject">{t(course.subject)}</p>
        <h3>{t(course.title)}</h3>
        {!compact ? <p className="course-description">{t(plainLanguage ? course.plainDescription : course.description)}</p> : null}
        <div className="course-progress-row">
          <Progress value={progress} color={course.color === 'green' ? 'green' : 'blue'} compact />
          <span>{progress}%</span>
        </div>
        <div className="downloaded-line">
          {isDownloaded ? <CheckCircle2 size={15} /> : <Download size={15} />}
          <span>{isDownloaded ? t('Downloaded') : t('Not downloaded')}</span>
          <span aria-hidden="true">•</span>
          <span>{t('{done} of {total} questions', { done, total: course.questionsTotal })}</span>
        </div>
      </div>
      <div className="course-actions">
        <span className="download-size"><Download size={15} /> {course.size}</span>
        <Button variant="secondary" onClick={() => onOpen(course.id)}>{t('Continue')}</Button>
        <button className="row-chevron" aria-label={t('Open {course}', { course: t(course.title) })} onClick={() => onOpen(course.id)}><ChevronRight size={21} /></button>
      </div>
    </article>
  )
}
