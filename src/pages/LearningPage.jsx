import { CheckCircle2, ListChecks, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import CourseRow from '../components/CourseRow.jsx'
import DownloadManager from '../components/DownloadManager.jsx'
import { EmptyState, Progress } from '../components/UI.jsx'
import { courses } from '../data.js'
import { useI18n } from '../i18n.jsx'
import { assignmentDates, assignmentStatus } from '../utils/dates.js'

export default function LearningPage({ state, downloads, storageInfo, onOpenCourse, onOpenAssignment, onDownloadPack, initialTab = 'courses' }) {
  const { t, formatDate } = useI18n()
  const [tab, setTab] = useState(initialTab)
  const [query, setQuery] = useState('')
  const filteredCourses = useMemo(
    () => courses.filter((course) => `${t(course.subject)} ${t(course.title)}`.toLowerCase().includes(query.toLowerCase())),
    [query, t],
  )
  const completedQuestions = Object.values(state.courseProgress).reduce((sum, ids) => sum + ids.length, 0)
  const totalQuestions = courses.reduce((sum, course) => sum + course.questionsTotal, 0)
  const overall = Math.round((completedQuestions / totalQuestions) * 100)

  return (
    <div className="page-stack">
      <div className="page-heading split-heading">
        <div><p className="context-line">{t('Your downloaded classroom')}</p><h1>{t('My learning')}</h1><p>{t(state.settings.plainLanguage ? 'Your lessons and assignments work even when the internet does not.' : 'Courses, assignments, and progress — available with or without Wi-Fi.')}</p></div>
        <div className="heading-stat"><strong>{overall}%</strong><span>{t('Overall progress')}</span><Progress value={overall} compact /></div>
      </div>

      <div className="tabs-toolbar">
        <div className="tabs" role="tablist">
          <button className={tab === 'courses' ? 'active' : ''} onClick={() => setTab('courses')}>{t('Courses')} <span>{courses.length}</span></button>
          <button className={tab === 'assignments' ? 'active' : ''} onClick={() => setTab('assignments')}>{t('Assignments')} <span>{state.assignments.length}</span></button>
          <button className={tab === 'downloads' ? 'active' : ''} onClick={() => setTab('downloads')}>{t('Downloads')}</button>
        </div>
        {tab === 'courses' ? <label className="search-control"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('Search courses')} /></label> : null}
      </div>

      {tab === 'courses' ? (
        <section className="learning-course-list">
          <div className="list-intro"><h2>{t('In progress')}</h2><span>{t('{count} downloaded courses', { count: downloads.lessonRecords.length })}</span></div>
          {filteredCourses.length ? filteredCourses.map((course) => <CourseRow key={course.id} course={course} onOpen={onOpenCourse} plainLanguage={state.settings.plainLanguage} isDownloaded={Boolean(downloads.recordMap[course.id])} completedCount={state.courseProgress[course.id]?.length || 0} />) : <EmptyState icon={Search} title={t('No course found')} body={t('Try a different subject or course name.')} />}
        </section>
      ) : null}

      {tab === 'assignments' ? (
        <section className="panel assignment-workspace">
          <div className="section-heading"><div><h2>{t('Assignments')}</h2><p>{t('Due times are checked on this device and confirmed by your school after sync.')}</p></div><ListChecks size={22} /></div>
          {state.assignments.map((assignment) => {
            const Icon = assignment.icon
            const done = state.completedAssignments.includes(assignment.id)
            const status = assignmentStatus(assignment, done)
            const due = assignmentDates(assignment).due
            return (
              <button className={`assignment-detail-row ${done ? 'assignment-done' : ''}`} key={assignment.id} onClick={() => onOpenAssignment(assignment.id)}>
                <span className="assignment-course-icon"><Icon size={20} /></span>
                <span className="assignment-detail-copy"><small>{t(assignment.course)}</small><strong>{t(assignment.title)}</strong><p>{done ? t('Saved on this device · Queued to upload') : t('Due {date}', { date: formatDate(due, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) })}</p></span>
                <span className={`assignment-state ${status}`}>{done ? <><CheckCircle2 size={15} /> {t('Completed')}</> : t(status === 'due' ? 'Due soon' : status === 'late' ? 'Late' : status === 'closed' ? 'Closed' : 'To do')}</span>
                <span className="button button-secondary"><span>{done ? t('View submission') : t('Open assignment')}</span></span>
              </button>
            )
          })}
        </section>
      ) : null}

      {tab === 'downloads' ? <DownloadManager downloads={downloads} storageInfo={storageInfo} onOpenCourse={onOpenCourse} onDownloadPack={onDownloadPack} /> : null}
    </div>
  )
}
