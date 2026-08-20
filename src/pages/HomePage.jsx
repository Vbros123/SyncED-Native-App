import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Gift,
  MapPin,
  Navigation,
  ShieldCheck,
  Sparkles,
  Wifi,
} from 'lucide-react'
import CourseRow from '../components/CourseRow.jsx'
import SyncPanel from '../components/SyncPanel.jsx'
import { Button, Progress, TextButton } from '../components/UI.jsx'
import { courses, hubs, skills } from '../data.js'
import { useI18n } from '../i18n.jsx'
import { assignmentDates, assignmentStatus } from '../utils/dates.js'

export default function HomePage({
  online,
  syncing,
  state,
  onSync,
  onViewQueue,
  onOpenCourse,
  onOpenSkill,
  onNavigate,
  onOpenAssignment,
  onOpenCalendar,
}) {
  const { t, formatDate } = useI18n()
  const featuredSkill = skills.find((skill) => skill.featured)
  const SkillIcon = featuredSkill.icon
  const nearestHub = hubs[0]
  const incomplete = state.assignments.filter((item) => !state.completedAssignments.includes(item.id))

  return (
    <div className="home-page page-stack">
      <div className="page-heading home-heading">
        <div>
          <p className="context-line">{formatDate(new Date(), { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          <h1>{t('Good morning, Maya')}</h1>
          {state.settings.plainLanguage ? <p>{t('Your lessons are ready. Pick one thing to do next.')}</p> : null}
        </div>
        <button className="streak-note" onClick={() => onNavigate('rewards')}><span><Check size={15} strokeWidth={3} /></span>{t('4-day learning streak')}</button>
      </div>

      <SyncPanel
        online={online}
        syncing={syncing}
        pendingUploads={state.queueItems.length}
        lastSync={state.lastSync}
        downloaded={state.downloaded}
        storageUsed={state.storageUsed}
        onSync={onSync}
        onViewQueue={onViewQueue}
      />

      <div className="home-primary-grid">
        <section className="panel learning-panel">
          <div className="section-heading">
            <div><h2>{t('Continue learning')}</h2><p>{t(state.settings.plainLanguage ? 'Start where you stopped last time.' : 'Pick up exactly where you left off.')}</p></div>
            <TextButton onClick={() => onNavigate('learning')}>{t('View all')}</TextButton>
          </div>
          <div className="course-list">
            {courses.slice(0, 2).map((course) => <CourseRow key={course.id} course={course} onOpen={onOpenCourse} compact plainLanguage={state.settings.plainLanguage} />)}
          </div>
        </section>

        <aside className="panel assignments-panel">
          <div className="section-heading assignment-heading">
            <div><h2>{t('This week')}</h2><p>{t('{count} assignments to finish', { count: incomplete.length })}</p></div>
            <button className="calendar-button" onClick={onOpenCalendar} aria-label={t('Open assignment calendar')}><CalendarDays size={21} /></button>
          </div>
          <div className="assignment-list">
            {state.assignments.map((assignment) => {
              const Icon = assignment.icon
              const isDone = state.completedAssignments.includes(assignment.id)
              const status = assignmentStatus(assignment, isDone)
              const due = assignmentDates(assignment).due
              return (
                <button className={`assignment-row ${isDone ? 'assignment-done' : ''}`} key={assignment.id} onClick={() => onOpenAssignment(assignment.id)}>
                  <span className="assignment-check">{isDone ? <Check size={15} strokeWidth={3} /> : <Icon size={18} />}</span>
                  <span className="assignment-row-copy">
                    <strong>{t(assignment.title)}</strong>
                    <small>{t(assignment.course)} · {isDone ? t('Completed') : t('Due {date}', { date: formatDate(due, { weekday: 'short', hour: 'numeric', minute: '2-digit' }) })}</small>
                  </span>
                  {!isDone && status === 'due' ? <em>{t('Due soon')}</em> : status === 'late' ? <em className="late">{t('Late')}</em> : null}
                </button>
              )
            })}
          </div>
          <TextButton className="assignment-all" onClick={() => onNavigate('learning', 'assignments')}>{t('All assignments')}</TextButton>
        </aside>
      </div>

      <div className="home-secondary-grid">
        <section className="panel skill-feature">
          <div className="skill-visual">
            <span className="visual-orbit orbit-one" />
            <span className="visual-orbit orbit-two" />
            <SkillIcon size={56} strokeWidth={1.5} />
          </div>
          <div className="skill-feature-copy">
            <span className="small-label"><ShieldCheck size={14} />{t('Digital skill')}</span>
            <h2>{t(featuredSkill.title)}</h2>
            <p>{t(state.settings.plainLanguage ? featuredSkill.plainDescription : featuredSkill.description)}</p>
            <div className="meta-line"><Clock3 size={15} /> {t(featuredSkill.duration)}<span />{t(featuredSkill.level)}</div>
          </div>
          <Button onClick={() => onOpenSkill(featuredSkill.id)}>{t('Start lesson')}</Button>
        </section>

        <section className="panel reward-summary">
          <div className="reward-orb-mini"><Sparkles size={28} /><span>3</span></div>
          <div><span className="small-label"><Gift size={14} />{t('Your learning companion')}</span><h2>{t('Nova is level 3')}</h2><p>{t('Earn {count} more points to unlock the Explorer backpack.', { count: Math.max(0, 300 - state.points) })}</p><Progress value={(state.points / 300) * 100} color="green" compact /></div>
          <Button variant="secondary" onClick={() => onNavigate('rewards')}>{t('View rewards')}</Button>
        </section>
      </div>

      <section className="panel nearest-hub">
        <div className="hub-icon-scene"><Wifi size={20} /><span><MapPin size={31} /></span></div>
        <div className="nearest-hub-title"><p>{t('Nearest community hub')}</p><h2>{nearestHub.name}</h2><span>{nearestHub.distance} {t('mi away')} · {t(nearestHub.walk)}</span></div>
        <div className="hub-services"><small>{t('Services')}</small><span><Wifi size={15} /> {t('Wi-Fi & sync')}</span><span><BookOpen size={15} /> {t('Learning space')}</span></div>
        <div className="hub-hours"><small>{t('Today’s hours')}</small><strong>8:00 AM – 6:00 PM</strong><span className="open-now"><CheckCircle2 size={14} />{t('Open now')}</span></div>
        <div className="hub-actions"><Button variant="secondary" icon={Navigation} onClick={() => onNavigate('hubs')}>{t('Directions')}</Button><TextButton icon={ArrowUpRight} onClick={() => onNavigate('hubs')}>{t('View hub')}</TextButton></div>
      </section>
    </div>
  )
}
