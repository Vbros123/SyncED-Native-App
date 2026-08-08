import { Check, Clock3, Database, Download, ListChecks, RefreshCw, Upload } from 'lucide-react'
import { useI18n } from '../i18n.jsx'
import { Button, Progress } from './UI.jsx'

export default function SyncPanel({ online, syncing, syncState, pendingUploads, lastSync, downloaded, storageUsed, onSync, onViewQueue }) {
  const { t } = useI18n()
  return (
    <section className={`sync-panel ${syncing ? 'is-syncing' : ''}`}>
      <div className="sync-main">
        <span className={`sync-check ${online ? 'online' : ''}`}>{syncing ? <RefreshCw size={29} /> : <Check size={32} strokeWidth={3} />}</span>
        <div>
          <h2>{syncing ? t('Syncing your work…') : syncState === 'failed' ? 'Sync failed — your work is still safe' : online ? (pendingUploads ? 'Online · work waiting to sync' : 'All work synced') : t('Ready for offline')}</h2>
          <p>{syncing ? 'Sending one saved item at a time through the Prototype sync server.' : syncState === 'failed' ? 'Retry when you are ready. Failed items stay on this device.' : online ? t('New work can download and completed work can upload.') : t('Everything you need is saved on this device.')}</p>
        </div>
      </div>
      <div className="sync-metric">
        <Download size={21} />
        <span><small>{t('Downloaded lessons')}</small><strong>{downloaded}</strong><em>{t('Up to date')}</em></span>
      </div>
      <button className="sync-metric sync-metric-button" onClick={onViewQueue}>
        <Upload size={21} />
        <span><small>{t('Pending uploads')}</small><strong>{pendingUploads}</strong><em>{pendingUploads ? t('View sync queue') : t('All sent')}</em></span>
      </button>
      <div className="sync-metric storage-metric">
        <Database size={21} />
        <span><small>{t('Storage')}</small><strong>{t('{amount} GB free', { amount: (16 - storageUsed).toFixed(1) })}</strong><Progress value={(storageUsed / 16) * 100} compact /></span>
      </div>
      <div className="sync-metric last-sync-metric">
        <Clock3 size={21} />
        <span><small>{t('Last sync')}</small><strong>{lastSync}</strong><em>{online ? t('Connected') : t('Saved locally')}</em></span>
      </div>
      <div className="sync-action">
        <Button icon={RefreshCw} onClick={onSync} disabled={syncing || (!pendingUploads && syncState === 'synced')}>{syncing ? t('Syncing…') : t('Sync now')}</Button>
        <button className="queue-mini-link" onClick={onViewQueue}><ListChecks size={13} />{t('Queue')}</button>
      </div>
      <span className="prototype-server-label">Prototype sync server</span>
      {syncing ? <span className="sync-running-line" /> : null}
    </section>
  )
}
