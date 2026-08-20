import { CheckCircle2, Download, FileText, Play, Search, SlidersHorizontal, Video } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button, EmptyState } from '../components/UI.jsx'
import { courses } from '../data.js'
import { useI18n } from '../i18n.jsx'

export default function ExplorePage({ state, onOpenCourse, onDownloadWorksheet, onDownloadCourse }) {
  const { t } = useI18n()
  const [query, setQuery] = useState('')
  const [subject, setSubject] = useState('All subjects')
  const subjects = ['All subjects', ...courses.map((course) => course.subject)]
  const filtered = useMemo(() => courses.filter((course) => {
    const matchesSubject = subject === 'All subjects' || course.subject === subject
    const haystack = `${t(course.subject)} ${t(course.title)} ${t(course.description)}`.toLowerCase()
    return matchesSubject && haystack.includes(query.toLowerCase())
  }), [query, subject, t])

  return (
    <div className="page-stack explore-page">
      <div className="page-heading split-heading">
        <div><p className="context-line">{t('A library that travels with you')}</p><h1>{t('Explore lessons')}</h1><p>{t(state.settings.plainLanguage ? 'Search for a subject. Download it once. Learn anywhere.' : 'Search six subjects, watch short explainers, download worksheets, and practice offline.')}</p></div>
        <div className="explore-count"><strong>18</strong><span>{t('working practice questions')}</span></div>
      </div>

      <section className="explore-search-panel">
        <label className="explore-search"><Search size={22} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('What do you want to learn?')} /><kbd>⌘ K</kbd></label>
        <div className="subject-filter"><SlidersHorizontal size={17} />{subjects.map((item) => <button key={item} className={subject === item ? 'active' : ''} onClick={() => setSubject(item)}>{t(item)}</button>)}</div>
      </section>

      {filtered.length ? (
        <section className="explore-grid">
          {filtered.map((course) => {
            const Icon = course.icon
            const progress = state.courseProgress[course.id]?.length || 0
            return (
              <article className="explore-card" key={course.id}>
                <div className={`explore-card-art course-art-${course.color}`}><Icon size={40} /><span className="course-art-lines" /></div>
                <div className="explore-card-body">
                  <div className="explore-card-top"><span>{t(course.subject)}</span>{progress ? <em><CheckCircle2 size={14} />{t('{count}/3 complete', { count: progress })}</em> : <em><Download size={14} />{t('Offline ready')}</em>}</div>
                  <h2>{t(course.title)}</h2>
                  <p>{t(state.settings.plainLanguage ? course.plainDescription : course.description)}</p>
                  <div className="content-includes"><span><Video size={15} />{t('1 mini-video')}</span><span><FileText size={15} />{t('1 worksheet')}</span><span><CheckCircle2 size={15} />{t('3 questions')}</span></div>
                  <div className="explore-card-actions"><Button icon={Play} onClick={() => onOpenCourse(course.id)}>{progress ? t('Continue') : t('Start')}</Button><Button variant="quiet" icon={FileText} onClick={() => onDownloadWorksheet(course.id)}>{t('Worksheet')}</Button><button className="download-course-icon" onClick={() => onDownloadCourse(course.id)} aria-label={t('Download {course}', { course: t(course.title) })}><Download size={18} /></button></div>
                </div>
              </article>
            )
          })}
        </section>
      ) : <EmptyState icon={Search} title={t('No lessons found')} body={t('Try another word or choose all subjects.')} />}
    </div>
  )
}
