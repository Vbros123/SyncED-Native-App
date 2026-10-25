import { CalendarDays, Check, Clock3, FileText, Lock, Send, Upload } from 'lucide-react'
import { useEffect, useState } from 'react'
import { assignmentsSeed } from '../data.js'
import { useI18n } from '../i18n.jsx'
import { assignmentDates, assignmentStatus, assignmentTimeZone, calendarDays } from '../utils/dates.js'
import { Button, Modal } from './UI.jsx'

export function AssignmentModal({ assignment, completed, savedResponse = '', onDraftChange, onClose, onSubmit, onOpenCourse, onDownloadWorksheet }) {
  const { t, formatDate } = useI18n()
  const response = savedResponse
  // Refresh the disabled state if the due/closing time passes while the editor is open.
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])
  if (!assignment) return null
  const { due, closes } = assignmentDates(assignment)
  const status = assignmentStatus(assignment, completed, now)
  const closed = status === 'closed'

  return (
    <Modal title={t(assignment.title)} eyebrow={t(assignment.course)} onClose={onClose} size="large">
      <div className="assignment-modal-body">
        <div className={`deadline-banner deadline-${status}`}>
          {closed ? <Lock size={20} /> : completed ? <Check size={20} /> : <Clock3 size={20} />}
          <div>
            <strong>{completed ? t('Submitted') : closed ? t('Submission closed') : status === 'late' ? t('Late submission') : t('Due {date}', { date: formatDate(due, { timeZone: assignmentTimeZone, timeZoneName: 'short', weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) })}</strong>
            <span>{closed ? t('This assignment closed on {date}. Ask your teacher if you need another attempt.', { date: formatDate(closes, { timeZone: assignmentTimeZone, timeZoneName: 'short', month: 'short', day: 'numeric' }) }) : t('Late work is labeled late until the assignment closes on {date}.', { date: formatDate(closes, { timeZone: assignmentTimeZone, timeZoneName: 'short', month: 'short', day: 'numeric', hour: 'numeric' }) })}</span>
          </div>
        </div>
        <section className="assignment-instructions">
          <h3>{t('Instructions')}</h3>
          <p>{t(assignment.instructions)}</p>
          <div className="assignment-resource-row">
            <Button variant="secondary" icon={FileText} onClick={() => onDownloadWorksheet(assignment.courseId)}>{t('Download worksheet')}</Button>
            <Button variant="quiet" onClick={() => { onOpenCourse(assignment.courseId); onClose() }}>{t('Open lesson')}</Button>
          </div>
        </section>
        <label className="assignment-response">
          <strong>{t('Your response')}</strong>
          <textarea rows="6" value={response} onChange={(event) => onDraftChange(assignment.id, event.target.value)} disabled={closed || completed} placeholder={t('Write your answer or notes here…')} />
        </label>
        <p>{t('Demo only. Work stays on this device; nothing is sent to a school.')}</p>
        <div className="form-actions">
          <Button variant="quiet" onClick={onClose}>{t('Cancel')}</Button>
          <Button icon={completed ? Check : Send} disabled={closed || completed || response.trim().length < 3} onClick={() => onSubmit(assignment.id, response.trim())}>
            {completed ? t('Submitted') : closed ? t('Closed') : t('Submit assignment')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export function CalendarModal({ completedAssignments, onClose, onOpenAssignment }) {
  const { t, formatDate } = useI18n()
  const today = new Date()
  const days = calendarDays(today)
  const weekDays = Array.from({ length: 7 }, (_, index) => formatDate(new Date(2026, 6, 5 + index), { weekday: 'short' }))
  return (
    <Modal title={t('Assignment calendar')} eyebrow={formatDate(today, { month: 'long', year: 'numeric' })} onClose={onClose} size="large">
      <div className="calendar-grid" role="grid">
        {weekDays.map((day) => <span className="calendar-weekday" key={day}>{day}</span>)}
        {days.map((date, index) => {
          const items = date ? assignmentsSeed.filter((assignment) => assignmentDates(assignment).due.toISOString().slice(0, 10) === `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`) : []
          const isToday = date?.toDateString() === today.toDateString()
          return (
            <div className={`calendar-day ${isToday ? 'calendar-today' : ''} ${date ? '' : 'calendar-empty'}`} key={`${date?.toISOString() || 'empty'}-${index}`}>
              {date ? <strong>{date.getDate()}</strong> : null}
              {items.map((assignment) => {
                const done = completedAssignments.includes(assignment.id)
                return <button key={assignment.id} className={done ? 'calendar-event done' : 'calendar-event'} onClick={() => onOpenAssignment(assignment.id)}><span>{t(assignment.course)}</span>{t(assignment.title)}</button>
              })}
            </div>
          )
        })}
      </div>
      <p className="calendar-note"><CalendarDays size={17} />{t('Deadlines are fixed in UTC and checked on this device. No school receives this demo work.')}</p>
    </Modal>
  )
}

export function SyncQueueModal({ queueItems, online, onSync, onClose }) {
  const { t } = useI18n()
  return (
    <Modal title={t('Sync queue')} eyebrow={online ? t('Demo connection on') : t('Saved on this device')} onClose={onClose}>
      <p>{t('Demo only. Work stays on this device; nothing is sent to a school.')}</p><div className="sync-queue-list">
        {queueItems.length ? queueItems.map((item) => (
          <div className="sync-queue-row" key={item.id}><span><Upload size={18} /></span><div><strong>{t(item.label)}</strong><small>{t(item.type)}</small></div><em>{t('Saved on this device')}</em></div>
        )) : <div className="queue-empty"><Check size={24} /><strong>{t('Saved on this device')}</strong><p>{t('Demo only. Work stays on this device; nothing is sent to a school.')}</p></div>}
      </div>
      <div className="form-actions"><Button variant="quiet" onClick={onClose}>{t('Close')}</Button><Button icon={Upload} onClick={onSync} disabled={!online || !queueItems.length}>{online ? t('Simulate sync') : t('Simulate hub Wi-Fi')}</Button></div>
    </Modal>
  )
}
