import { Check, Clock3, Database, Download, ListChecks, RefreshCw, Upload } from 'lucide-react'
import { useI18n } from '../i18n.jsx'
import { Button, Progress } from './UI.jsx'

export default function SyncPanel({ online, syncing, pendingUploads, downloaded, storageUsed, onSync, onViewQueue }) {
  const { t } = useI18n()
  return (
    <section className={`sync-panel ${syncing ? 'is-syncing' : ''}`}>
      <div className="sync-main">
        <span className={`sync-check ${online ? 'online' : ''}`}>{syncing ? <RefreshCw size={29} /> : <Check size={32} strokeWidth={3} />}</span>
        <div>
          <h2>{syncing ? t('Simulating sync') : online ? t('Demo connection on') : t('Ready for offline')}</h2>
          <p>{t('Demo only. Work stays on this device; nothing is sent to a school.')}</p>
        </div>
      </div>
      <div className="sync-metric">
        <Download size={21} />
        <span><small>{t('Downloaded lessons')}</small><strong>{downloaded}</strong><em>{t('Up to date')}</em></span>
      </div>
      <button className="sync-metric sync-metric-button" onClick={onViewQueue}>
        <Upload size={21} />
        <span><small>{t('Local records')}</small><strong>{pendingUploads}</strong><em>{pendingUploads ? t('View sync queue') : t('Saved on this device')}</em></span>
      </button>
      <div className="sync-metric storage-metric">
        <Database size={21} />
        <span><small>{t('Storage')}</small><strong>{t('{amount} GB free', { amount: (16 - storageUsed).toFixed(1) })}</strong><Progress value={(storageUsed / 16) * 100} compact /></span>
      </div>
      <div className="sync-metric last-sync-metric">
        <Clock3 size={21} />
        <span><small>{t('School delivery')}</small><strong>{t('Not sent to school')}</strong><em>{online ? t('Demo connection on') : t('Saved locally')}</em></span>
      </div>
      <div className="sync-action">
        <Button icon={RefreshCw} onClick={onSync} disabled={syncing}>{syncing ? t('Simulating sync') : t('Simulate sync')}</Button>
        <button className="queue-mini-link" onClick={onViewQueue}><ListChecks size={13} />{t('Queue')}</button>
      </div>
      {syncing ? <span className="sync-running-line" /> : null}
    </section>
  )
}
