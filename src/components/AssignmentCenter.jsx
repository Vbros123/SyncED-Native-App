import { CalendarDays, Check, Clock3, FileText, Lock, Send, Upload } from 'lucide-react'
import { useState } from 'react'
import { assignmentsSeed } from '../data.js'
import { useI18n } from '../i18n.jsx'
import { assignmentDates, assignmentStatus, calendarDays } from '../utils/dates.js'
import { Button, Modal } from './UI.jsx'

export function AssignmentModal({ assignment, completed, savedResponse = '', onClose, onSubmit, onOpenCourse, onDownloadWorksheet }) {
  const { t, formatDate } = useI18n()
  const [response, setResponse] = useState(savedResponse)
  if (!assignment) return null
  const { due, closes } = assignmentDates(assignment)
  const status = assignmentStatus(assignment, completed)
  const closed = status === 'closed'

  return (
    <Modal title={t(assignment.title)} eyebrow={t(assignment.course)} onClose={onClose} size="large">
      <div className="assignment-modal-body">
        <div className={`deadline-banner deadline-${status}`}>
          {closed ? <Lock size={20} /> : completed ? <Check size={20} /> : <Clock3 size={20} />}
          <div>
            <strong>{completed ? t('Submitted') : closed ? t('Submission closed') : status === 'late' ? t('Late submission') : t('Due {date}', { date: formatDate(due, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) })}</strong>
            <span>{closed ? t('This assignment closed on {date}. Ask your teacher if you need another attempt.', { date: formatDate(closes, { month: 'short', day: 'numeric' }) }) : t('Late work is labeled late until the assignment closes on {date}.', { date: formatDate(closes, { month: 'short', day: 'numeric', hour: 'numeric' }) })}</span>
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
          <textarea rows="6" value={response} onChange={(event) => setResponse(event.target.value)} disabled={closed || completed} placeholder={t('Write your answer or notes here…')} />
        </label>
        <div className="form-actions">
          <Button variant="quiet" onClick={onClose}>{t('Cancel')}</Button>
          <Button icon={completed ? Check : Send} disabled={closed || completed || response.trim().length < 3} onClick={() => onSubmit(assignment.id, response.trim(), status === 'late')}>
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
          const items = date ? assignmentsSeed.filter((assignment) => assignmentDates(assignment, today).due.toDateString() === date.toDateString()) : []
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
      <p className="calendar-note"><CalendarDays size={17} />{t('Select an assignment to open it. Due dates are enforced on this device and confirmed by the school after sync.')}</p>
    </Modal>
  )
}

export function SyncQueueModal({ queueItems, online, onSync, onClose }) {
  const { t } = useI18n()
  return (
    <Modal title={t('Sync queue')} eyebrow={online ? t('Connected') : t('Saved on this device')} onClose={onClose}>
      <div className="sync-queue-list">
        {queueItems.length ? queueItems.map((item) => (
          <div className="sync-queue-row" key={item.id}><span><Upload size={18} /></span><div><strong>{t(item.label)}</strong><small>{t(item.type)}</small></div><em>{t('Waiting')}</em></div>
        )) : <div className="queue-empty"><Check size={24} /><strong>{t('Everything is synced')}</strong><p>{t('There is no work waiting to upload.')}</p></div>}
      </div>
      <div className="form-actions"><Button variant="quiet" onClick={onClose}>{t('Close')}</Button><Button icon={Upload} onClick={onSync} disabled={!online || !queueItems.length}>{online ? t('Sync now') : t('Connect to sync')}</Button></div>
    </Modal>
  )
}
