import { AlertTriangle, CheckCircle2, Download, PackageCheck, RefreshCw, Trash2 } from 'lucide-react'
import { courses } from '../data.js'
import { formatBytes, RESILIENT_PACK_ID } from '../services/contentStorage.js'
import { Button, Progress } from './UI.jsx'

function DownloadAction({ course, state, onDownload, onRemove }) {
  if (state.status === 'downloading') return <div className="download-progress" aria-live="polite"><Progress value={state.progress} compact /><span>{state.progress}%</span></div>
  if (state.status === 'downloaded') return <Button variant="danger" icon={Trash2} onClick={() => onRemove(course.id)}>Remove</Button>
  if (state.status === 'update-available') return <Button icon={RefreshCw} onClick={() => onDownload(course.id)}>Update</Button>
  return <Button variant={state.status === 'failed' ? 'secondary' : 'quiet'} icon={state.status === 'failed' ? RefreshCw : Download} onClick={() => onDownload(course.id)}>{state.status === 'failed' ? 'Retry' : 'Download'}</Button>
}

export default function DownloadManager({ downloads, storageInfo, onOpenCourse, onDownloadPack }) {
  const packRecord = downloads.recordMap[RESILIENT_PACK_ID]
  const packState = downloads.statusFor(RESILIENT_PACK_ID)
  const availableBytes = storageInfo.quota ? Math.max(0, storageInfo.quota - storageInfo.usage) : 0

  return (
    <div className="download-manager-stack">
      <section className="panel resilient-pack-card">
        <div className="pack-heading">
          <span><PackageCheck size={28} /></span>
          <div><p className="context-line">Small offline bundle</p><h2>Resilient Learning Pack</h2><p>Useful during outages, severe weather, infrastructure disruptions, travel, or unreliable connectivity.</p></div>
        </div>
        <div className="pack-facts"><span><strong>Math, Science, English</strong>Subjects included</span><span><strong>Under 1 MB</strong>Total size</span><span><strong>About 95 min</strong>Estimated completion</span><span><strong>Aug 6, 2026</strong>Last updated</span></div>
        <p className="pack-note">Includes core lessons, worksheets, a reading resource, one quiz per subject, and help and emergency-learning instructions. It does not replace official emergency guidance.</p>
        {packState.status === 'downloading' ? <div className="pack-download-progress"><Progress value={packState.progress} /><span>Preparing pack… {packState.progress}%</span></div> : (
          <Button icon={packRecord ? RefreshCw : Download} onClick={onDownloadPack}>{packRecord ? 'Update learning pack' : 'Download learning pack'}</Button>
        )}
        {packState.status === 'failed' ? <p className="inline-error"><AlertTriangle size={16} />{packState.error}</p> : null}
      </section>

      <section className="panel downloads-main" aria-labelledby="manage-downloads-title">
        <div className="section-heading"><div><p className="context-line">Saved lesson packages</p><h2 id="manage-downloads-title">Manage Downloads</h2><p>{downloads.lessonRecords.length ? `${downloads.lessonRecords.length} downloaded course${downloads.lessonRecords.length === 1 ? '' : 's'} · ${formatBytes(downloads.bytesUsed)} used` : 'No lesson packages are saved yet.'}</p></div><Download size={22} /></div>
        <div className="managed-download-list">
          {courses.map((course) => {
            const Icon = course.icon
            const record = downloads.recordMap[course.id]
            const state = downloads.statusFor(course.id)
            return (
              <article className="managed-download-row" key={course.id}>
                <span className={`download-icon ${course.color}`}><Icon size={20} /></span>
                <div className="managed-download-copy">
                  <strong>{course.title}</strong>
                  <span>{course.subject} · {record ? formatBytes(record.byteSize) : course.size} · Version {record?.version || course.version || 1}</span>
                  <small>{record ? `Last updated ${new Date(record.lastUpdatedAt).toLocaleString()}` : 'Not downloaded'}</small>
                  {state.status === 'downloading' ? <Progress value={state.progress} compact /> : null}
                  {state.status === 'failed' ? <em><AlertTriangle size={13} />{state.error}</em> : null}
                </div>
                <span className={`download-state state-${state.status}`}>
                  {state.status === 'downloaded' ? <CheckCircle2 size={15} /> : state.status === 'update-available' ? <RefreshCw size={15} /> : state.status === 'failed' ? <AlertTriangle size={15} /> : <Download size={15} />}
                  {state.status === 'not-downloaded' ? 'Not downloaded' : state.status === 'update-available' ? 'Update available' : state.status === 'downloading' ? 'Downloading' : state.status === 'failed' ? 'Failed' : 'Downloaded'}
                </span>
                {record ? <Button variant="quiet" onClick={() => onOpenCourse(course.id)}>Open</Button> : null}
                <DownloadAction course={course} state={state} onDownload={downloads.download} onRemove={downloads.remove} />
              </article>
            )
          })}
        </div>
      </section>

      <aside className="panel storage-awareness">
        <div><p className="context-line">Browser storage</p><h2>{storageInfo.supported ? `${formatBytes(storageInfo.usage)} currently used` : 'Storage estimate unavailable'}</h2><p>{storageInfo.supported && storageInfo.quota ? `${formatBytes(availableBytes)} estimated available` : 'This browser does not report available space.'}</p></div>
        {storageInfo.quota ? <Progress value={(storageInfo.usage / storageInfo.quota) * 100} /> : null}
        <span className={storageInfo.persisted ? 'storage-persistent granted' : 'storage-persistent'}>{storageInfo.persisted ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}{storageInfo.persisted === null ? 'Persistent storage status unsupported' : storageInfo.persisted ? 'Persistent storage granted' : 'Persistent storage not granted'}</span>
        {storageInfo.low ? <p className="storage-warning"><AlertTriangle size={17} />Storage is low. Remove lesson packages you no longer need.</p> : null}
        {!storageInfo.persisted && storageInfo.persisted !== null ? <Button variant="secondary" onClick={storageInfo.requestPersistence}>Request persistent storage</Button> : null}
      </aside>
    </div>
  )
}
