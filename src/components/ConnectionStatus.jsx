import { AlertTriangle, CheckCircle2, CloudOff, RefreshCw, Wifi, WifiOff } from 'lucide-react'

const syncCopy = {
  syncing: ['Syncing', RefreshCw],
  failed: ['Sync failed', AlertTriangle],
  synced: ['All work synced', CheckCircle2],
  waiting: ['Waiting to sync', CloudOff],
  offline: ['Offline', WifiOff],
  idle: ['Online', Wifi],
}
export default function ConnectionStatus({ isOnline, browserOnline, demoMode, syncState, pendingCount = 0, compact = false }) {
  const effectiveState = !isOnline ? 'offline' : syncState
  const [syncLabel, SyncIcon] = syncCopy[effectiveState] || syncCopy.idle
  const connectionLabel = isOnline ? 'Online' : 'Offline'
  const detail = demoMode === 'offline'
    ? 'Demo connectivity control is simulating offline mode'
    : !browserOnline
      ? 'Browser reports no network connection'
      : pendingCount
        ? `${pendingCount} item${pendingCount === 1 ? '' : 's'} pending`
        : syncLabel

  return (
    <div className={`connection-status ${isOnline ? 'is-online' : 'is-offline'} status-${effectiveState} ${compact ? 'is-compact' : ''}`} role="status" aria-live="polite">
      <span className="connection-status-icon">{isOnline ? <Wifi size={17} /> : <WifiOff size={17} />}</span>
      <span><strong>{connectionLabel}</strong><small>{detail}</small></span>
      {!compact ? <span className="sync-state-chip"><SyncIcon size={14} />{syncLabel}</span> : null}
    </div>
  )
}
