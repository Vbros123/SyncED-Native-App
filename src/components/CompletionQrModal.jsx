import { useEffect, useMemo, useState } from 'react'
import QRCode from 'qrcode'
import { CheckCircle2, ShieldCheck } from 'lucide-react'
import { Button, Modal } from './UI.jsx'
import { useI18n } from '../i18n.jsx'

export default function CompletionQrModal({ completion, onClose }) {
  const { t, language } = useI18n()
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [qrError, setQrError] = useState(false)
  const completedLabel = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(language, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(completion.completedAt))
    } catch {
      return completion.completedAt
    }
  }, [completion.completedAt, language])
  const qrText = useMemo(() => [
    `SyncED · ${t('Offline teacher check')}`,
    `${t('Student')}: ${completion.student}`,
    `${t('Lesson')}: ${t(completion.lessonTitle)}`,
    `${t('Course')}: ${t(completion.courseTitle)}`,
    `${t('Completed')}: ${completedLabel}`,
    `${t('Points earned')}: +${completion.points}`,
    `${t('Verification code')}: ${completion.code}`,
  ].join('\n'), [completedLabel, completion, t])

  useEffect(() => {
    let active = true
    setQrDataUrl('')
    setQrError(false)
    QRCode.toDataURL(qrText, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 280,
      color: { dark: '#07162f', light: '#ffffff' },
    }).then((dataUrl) => {
      if (active) setQrDataUrl(dataUrl)
    }).catch(() => {
      if (active) setQrError(true)
    })
    return () => { active = false }
  }, [qrText])

  return (
    <Modal title={t('Teacher check')} eyebrow={t('Offline teacher check')} onClose={onClose} size="small">
      <div className="completion-qr-modal" data-testid="completion-qr-modal">
        <div className="qr-modal-intro">
          <span className="qr-modal-icon"><ShieldCheck size={22} /></span>
          <div><strong>{t('Ready for teacher check')}</strong><p>{t('Show this code to your teacher so they can confirm this lesson.')}</p></div>
        </div>

        <div className="qr-code-frame" data-testid="completion-qr-code">
          {qrDataUrl ? <img src={qrDataUrl} alt={t('Teacher verification QR code')} /> : <div className="qr-code-loading">{qrError ? t('QR code unavailable') : t('Preparing QR code…')}</div>}
        </div>

        <dl className="qr-details">
          <div><dt>{t('Student')}</dt><dd>{completion.student}</dd></div>
          <div><dt>{t('Lesson')}</dt><dd>{t(completion.lessonTitle)}</dd></div>
          <div><dt>{t('Completed')}</dt><dd>{completedLabel}</dd></div>
          <div><dt>{t('Points earned')}</dt><dd>+{completion.points}</dd></div>
        </dl>

        <div className="qr-verification-code"><span>{t('Verification code')}</span><strong>{completion.code}</strong></div>
        <p className="qr-modal-note"><CheckCircle2 size={16} />{t('This check works offline. A teacher can scan the code or compare the code and lesson details on screen.')}</p>
        <div className="form-actions qr-modal-actions"><Button onClick={onClose}>{t('Close teacher check')}</Button></div>
      </div>
    </Modal>
  )
}
