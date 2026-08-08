import { Download, WifiOff } from 'lucide-react'
import { Button } from './UI.jsx'

export default function OfflineFallback({ onBack, onManageDownloads }) {
  return (
    <section className="panel offline-fallback" role="alert">
      <span><WifiOff size={34} /></span>
      <p className="context-line">Lesson unavailable offline</p>
      <h1>Connect to the internet and download this lesson before using it offline.</h1>
      <p>Your saved progress is safe. Downloading the lesson package once makes its text, diagrams, quiz, and worksheet available without a connection.</p>
      <div className="form-actions">
        <Button variant="quiet" onClick={onBack}>Go back</Button>
        <Button icon={Download} onClick={onManageDownloads}>Manage Downloads</Button>
      </div>
    </section>
  )
}
