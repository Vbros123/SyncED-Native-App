import { AlertTriangle, Database, Gauge, RefreshCw, Trash2, WifiOff } from 'lucide-react'
import { Button } from './UI.jsx'

export default function OfflineTestPanel({ demoMode, onSetDemoMode, queueEntries, onAddFailure, onRetry, onClearDownloads, onClearActivity }) {
  return (
    <section className="offline-test-panel" aria-labelledby="offline-test-title">
      <div className="test-feature-label"><AlertTriangle size={16} />Testing feature</div>
      <div className="settings-section-heading"><div><h2 id="offline-test-title">Offline Test Mode</h2><p>Developer tools for exercising local downloads and the Prototype sync server.</p></div><Gauge size={22} /></div>
      <div className="demo-connectivity-control">
        <strong>Demo connectivity control</strong>
        <p>Real browser connectivity is still detected. These controls only override the demo experience.</p>
        <div role="group" aria-label="Demo connectivity control">
          <button className={demoMode === 'auto' ? 'active' : ''} onClick={() => onSetDemoMode('auto')}>Use real connection</button>
          <button className={demoMode === 'offline' ? 'active' : ''} onClick={() => onSetDemoMode('offline')}><WifiOff size={15} />Simulate offline</button>
          <button className={demoMode === 'slow' ? 'active' : ''} onClick={() => onSetDemoMode('slow')}><Gauge size={15} />Simulate slow</button>
        </div>
      </div>
      <div className="test-actions">
        <Button variant="secondary" icon={AlertTriangle} onClick={onAddFailure}>Add fake failed sync</Button>
        <Button variant="secondary" icon={RefreshCw} onClick={onRetry}>Retry synchronization</Button>
        <Button variant="danger" icon={Trash2} onClick={onClearDownloads}>Clear cached lessons</Button>
        <Button variant="danger" icon={Database} onClick={onClearActivity}>Clear local activity data</Button>
      </div>
      <div className="test-queue-view">
        <strong>Pending queue entries ({queueEntries.length})</strong>
        {queueEntries.length ? queueEntries.map((entry) => <div key={entry.id}><span>{entry.label}</span><em>{entry.status}{entry.attempts ? ` · ${entry.attempts} attempt${entry.attempts === 1 ? '' : 's'}` : ''}</em>{entry.lastError ? <small>{entry.lastError}</small> : null}</div>) : <p>No pending entries.</p>}
      </div>
    </section>
  )
}
