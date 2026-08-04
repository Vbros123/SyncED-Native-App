import { Check, ChevronDown, ChevronUp, Database, ExternalLink, FileQuestion, Globe2, HelpCircle, Laptop, LockKeyhole, Mail, MessageCircleQuestion, School, Send, ShieldCheck, WifiOff } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../components/UI.jsx'
import { evidence } from '../data.js'
import { useI18n } from '../i18n.jsx'

const faqs = [
  ['Can I use SyncED without internet?', 'Yes. Downloaded lessons, videos, worksheets, assignments, and saved progress work offline. A connection is only needed to download new content or send queued work.'],
  ['How are assignment due dates enforced?', 'The device checks the due and closing times. Work after the due time is marked late; work after the closing time is locked. The school confirms the official status after sync.'],
  ['Who can request a refurbished device?', 'A participating school, library, or community organization confirms eligibility through programs it already manages. SyncED does not ask families to upload income documents.'],
  ['Is SyncED a nonprofit?', 'SyncED is currently a proposed nonprofit education initiative and working prototype. It should not claim registered nonprofit status until that legal process is complete.'],
  ['Does SyncED sell student data?', 'No. The product model does not rely on ads or selling personal data. A production pilot would use written school agreements, limited data collection, encryption, access controls, and clear deletion rules.'],
]

function HelpTab({ state, onSubmitHelp }) {
  const { t } = useI18n()
  const [topic, setTopic] = useState('Lesson or assignment')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [openFaq, setOpenFaq] = useState(0)
  const [sent, setSent] = useState(false)

  const submit = (event) => {
    event.preventDefault()
    onSubmitHelp({ topic, email, message })
    setSent(true)
  }

  return (
    <div className="support-grid">
      <section className="panel helpdesk-panel">
        <div className="section-heading"><div><h2>{t('Ask the SyncED helpdesk')}</h2><p>{t('Send a question now. If you are offline, it waits securely on this device.')}</p></div><MessageCircleQuestion size={22} /></div>
        {sent ? <div className="help-success"><span><Check size={24} /></span><h3>{t('Question saved')}</h3><p>{t('We will send an update to {email} after this device syncs.', { email })}</p><Button variant="secondary" onClick={() => { setSent(false); setMessage('') }}>{t('Ask another question')}</Button></div> : (
          <form className="help-form" onSubmit={submit}>
            <label>{t('What do you need help with?')}<select value={topic} onChange={(event) => setTopic(event.target.value)}><option>{t('Lesson or assignment')}</option><option>{t('Device or download')}</option><option>{t('Account or privacy')}</option><option>{t('Community hub')}</option></select></label>
            <label>{t('Email for the reply')}<span className="input-with-icon"><Mail size={16} /><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" /></span></label>
            <label>{t('Your question')}<textarea required minLength="10" rows="6" value={message} onChange={(event) => setMessage(event.target.value)} placeholder={t('Tell us what happened and what you were trying to do…')} /></label>
            <Button type="submit" icon={Send}>{t(state.queueItems.length ? 'Save question to sync queue' : 'Send question')}</Button>
          </form>
        )}
      </section>
      <section className="faq-panel"><div className="list-intro"><h2>{t('Common questions')}</h2><span>{t('Clear answers, no jargon')}</span></div><div className="faq-list">{faqs.map(([question, answer], index) => <article key={question}><button onClick={() => setOpenFaq(openFaq === index ? -1 : index)} aria-expanded={openFaq === index}><span><FileQuestion size={18} />{t(question)}</span>{openFaq === index ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</button>{openFaq === index ? <p>{t(answer)}</p> : null}</article>)}</div></section>
    </div>
  )
}

function AboutTab() {
  const { t } = useI18n()
  return (
    <div className="about-stack">
      <section className="about-mission"><div><p className="context-line">{t('Our status and purpose')}</p><h2>{t('Access is more than a Wi-Fi signal')}</h2><p>{t('SyncED is a proposed nonprofit education initiative and working prototype. Its goal is to address device access, reliable connectivity, and digital confidence together—because solving only one gap can still leave a learner behind.')}</p></div><div className="mission-mark"><Globe2 size={42} /><span>{t('Learn anywhere')}</span></div></section>

      <section className="evidence-section"><div className="list-intro"><div><h2>{t('Why this matters')}</h2><p>{t('Evidence behind the problem SyncED is designed to address.')}</p></div></div><div className="evidence-grid">{evidence.map((item) => <article key={item.stat}><strong>{item.stat}</strong><h3>{t(item.label)}</h3><p>{t(item.detail)}</p><a href={item.url} target="_blank" rel="noreferrer">{t('Source: {source}', { source: item.source })}<ExternalLink size={14} /></a></article>)}</div><p className="evidence-note">{t('Statistics describe the cited study years and should be updated as newer source data becomes available.')}</p></section>

      <section className="model-section"><div className="list-intro"><h2>{t('How the model would work')}</h2><span>{t('Pilot design')}</span></div><div className="model-grid">
        <article><span><School size={24} /></span><h3>{t('Partner-led access')}</h3><p>{t('Schools and community organizations identify eligible families through existing programs and referrals. The app avoids public income scoring and document uploads.')}</p></article>
        <article><span><WifiOff size={24} /></span><h3>{t('Offline first')}</h3><p>{t('The same web app works on phones, tablets, Chromebooks, and computers. Content is cached locally, while a secure queue sends progress when a connection returns.')}</p></article>
        <article><span><Laptop size={24} /></span><h3>{t('Device agnostic')}</h3><p>{t('Responsive web standards, keyboard access, touch controls, reduced motion, themes, larger text, and multilingual content keep one product usable across devices.')}</p></article>
      </div></section>
    </div>
  )
}

function PrivacyTab() {
  const { t } = useI18n()
  return (
    <div className="privacy-stack">
      <section className="privacy-hero"><span><ShieldCheck size={38} /></span><div><p className="context-line">{t('Plain-language privacy guide')}</p><h2>{t('Collect less. Protect it. Delete it when it is no longer needed.')}</h2><p>{t('This prototype stores demo progress in this browser. A real school pilot would require reviewed policies, secure accounts, and signed partner agreements before collecting student information.')}</p></div></section>
      <div className="privacy-grid">
        <article><Database size={22} /><h3>{t('What would be collected')}</h3><p>{t('Only what the service needs: account identifier, course progress, assignment submissions, selected language and accessibility settings, support requests, and sync records.')}</p></article>
        <article><LockKeyhole size={22} /><h3>{t('How it would be protected')}</h3><p>{t('Encryption in transit and at rest, role-based access, short retention periods, audit logs, secure updates, and extra review for student records.')}</p></article>
        <article><Globe2 size={22} /><h3>{t('Location choices')}</h3><p>{t('Location is used only after the user selects “Use my location” to rank nearby hubs. A production version should avoid storing precise location after the search.')}</p></article>
      </div>
      <section className="privacy-table panel"><h2>{t('Data control plan')}</h2><div><span><strong>{t('Learning progress')}</strong><small>{t('Stored on device and school system')}</small><em>{t('Family can request export or deletion')}</em></span><span><strong>{t('Device request email')}</strong><small>{t('Shared only with the selected partner')}</small><em>{t('Deleted after follow-up and retention period')}</em></span><span><strong>{t('Leaderboard name')}</strong><small>{t('First name and last initial only')}</small><em>{t('Hidden by default if family opts out')}</em></span><span><strong>{t('Precise location')}</strong><small>{t('Used for the active hub search')}</small><em>{t('Not retained in the proposed design')}</em></span></div></section>
    </div>
  )
}

export default function SupportPage({ state, initialTab = 'help', onSubmitHelp }) {
  const { t } = useI18n()
  const [tab, setTab] = useState(initialTab)
  return (
    <div className="page-stack support-page">
      <div className="page-heading"><p className="context-line">{t('Support, transparency, and impact')}</p><h1>{t('Help & about')}</h1><p>{t('Get help, understand how SyncED works, and review the evidence and privacy plan.')}</p></div>
      <div className="wide-tabs support-tabs"><button className={tab === 'help' ? 'active' : ''} onClick={() => setTab('help')}><HelpCircle size={17} />{t('Helpdesk')}</button><button className={tab === 'about' ? 'active' : ''} onClick={() => setTab('about')}><Globe2 size={17} />{t('About & impact')}</button><button className={tab === 'privacy' ? 'active' : ''} onClick={() => setTab('privacy')}><ShieldCheck size={17} />{t('Privacy')}</button></div>
      {tab === 'help' ? <HelpTab state={state} onSubmitHelp={onSubmitHelp} /> : tab === 'about' ? <AboutTab /> : <PrivacyTab />}
    </div>
  )
}
