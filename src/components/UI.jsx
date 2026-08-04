import { Check, ChevronRight, X } from 'lucide-react'
import { useI18n } from '../i18n.jsx'

export function Progress({ value, color = 'blue', label, compact = false }) {
  return (
    <div className={`progress-wrap ${compact ? 'progress-compact' : ''}`}>
      {label ? <div className="progress-label">{label}</div> : null}
      <div className="progress-track" aria-label={`${value}% complete`}>
        <span className={`progress-fill progress-${color}`} style={{ width: `${Math.max(0, Math.min(value, 100))}%` }} />
      </div>
    </div>
  )
}

export function Button({ children, variant = 'primary', icon: Icon, className = '', ...props }) {
  return (
    <button className={`button button-${variant} ${className}`} {...props}>
      {Icon ? <Icon size={18} strokeWidth={2} /> : null}
      <span>{children}</span>
    </button>
  )
}

export function TextButton({ children, icon: Icon = ChevronRight, className = '', ...props }) {
  return (
    <button className={`text-button ${className}`} {...props}>
      <span>{children}</span>
      {Icon ? <Icon size={17} /> : null}
    </button>
  )
}

export function StatusDot({ tone = 'green', children }) {
  return <span className={`status-dot status-${tone}`}>{children}</span>
}

export function Modal({ title, eyebrow, children, onClose, size = 'medium' }) {
  const { t } = useI18n()
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={`modal modal-${size}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-header">
          <div>
            {eyebrow ? <p className="modal-eyebrow">{eyebrow}</p> : null}
            <h2>{title}</h2>
          </div>
          <button className="icon-button" aria-label={t('Close')} onClick={onClose}>
            <X size={21} />
          </button>
        </div>
        <div className="modal-content">{children}</div>
      </section>
    </div>
  )
}

export function Toast({ message, onClose }) {
  const { t } = useI18n()
  if (!message) return null
  return (
    <div className="toast" role="status">
      <span className="toast-icon"><Check size={16} strokeWidth={3} /></span>
      <span>{message}</span>
      <button onClick={onClose} aria-label={t('Dismiss')}><X size={16} /></button>
    </div>
  )
}

export function EmptyState({ icon: Icon, title, body }) {
  return (
    <div className="empty-state">
      <span className="empty-icon"><Icon size={24} /></span>
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  )
}
