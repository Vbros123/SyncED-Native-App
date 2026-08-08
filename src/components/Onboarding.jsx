import { BookOpenCheck, Download, RefreshCw, Wifi } from 'lucide-react'
import { useState } from 'react'
import { Button } from './UI.jsx'

const screens = [
  { icon: Wifi, title: 'Connect once. Prepare for later.', body: 'Connect to Wi-Fi, then download the lessons you want to carry with you.' },
  { icon: Download, title: 'Learn anywhere without internet.', body: 'Downloaded lesson text, diagrams, quizzes, and worksheets open offline. Your work saves automatically on this device.' },
  { icon: RefreshCw, title: 'Reconnect when you can.', body: 'SyncED queues completed work and sends it one item at a time when your connection returns.' },
]

export default function Onboarding({ onFinish }) {
  const [index, setIndex] = useState(0)
  const screen = screens[index]
  const Icon = screen.icon
  return (
    <div className="onboarding-backdrop" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
      <section className="onboarding-card">
        <div className="onboarding-top"><span><BookOpenCheck size={19} />SyncED offline guide</span><button onClick={onFinish}>Skip</button></div>
        <span className="onboarding-icon"><Icon size={42} /></span>
        <p className="context-line">Step {index + 1} of {screens.length}</p>
        <h1 id="onboarding-title">{screen.title}</h1>
        <p>{screen.body}</p>
        <div className="onboarding-dots" aria-hidden="true">{screens.map((item, itemIndex) => <i className={itemIndex === index ? 'active' : ''} key={item.title} />)}</div>
        <div className="form-actions">
          {index ? <Button variant="quiet" onClick={() => setIndex((current) => current - 1)}>Back</Button> : <span />}
          <Button onClick={() => index === screens.length - 1 ? onFinish() : setIndex((current) => current + 1)}>{index === screens.length - 1 ? 'Start learning' : 'Next'}</Button>
        </div>
      </section>
    </div>
  )
}
