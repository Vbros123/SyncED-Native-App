import {
  Bell,
  Check,
  ChevronRight,
  Database,
  Download,
  Eye,
  Globe2,
  HardDrive,
  Info,
  Languages,
  Moon,
  Palette,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Sun,
  Trash2,
  UserRound,
  Wifi,
} from 'lucide-react'
import { useState } from 'react'
import { Button, Progress } from '../components/UI.jsx'
import OfflineTestPanel from '../components/OfflineTestPanel.jsx'
import { languages } from '../data.js'
import { useI18n } from '../i18n.jsx'
import { formatBytes } from '../services/contentStorage.js'

function Toggle({ checked, onChange, label }) {
  return <button role="switch" aria-checked={checked} aria-label={label} className={`toggle ${checked ? 'on' : ''}`} onClick={() => onChange(!checked)}><span /></button>
}

const sections = [
  ['profile', 'Profile', UserRound],
  ['language', 'Language & reading', Languages],
  ['appearance', 'Appearance', Palette],
  ['offline', 'Offline & storage', Download],
  ['notifications', 'Notifications', Bell],
  ['privacy', 'Privacy', ShieldCheck],
  ['about', 'About SyncED', Info],
]

export default function SettingsPage({ state, updateSetting, onClearDownloads, onSync, onNavigate, onShowToast, connectivity, syncQueue, downloads, storageInfo, onAddTestFailure, onClearActivity }) {
  const { t, language, setLanguage } = useI18n()
  const [active, setActive] = useState('language')

  return (
    <div className="page-stack settings-page">
      <div className="page-heading"><p className="context-line">{t('Make SyncED work for you')}</p><h1>{t('Settings')}</h1><p>{t('Account, language, appearance, accessibility, downloads, and privacy.')}</p></div>
      <div className="settings-layout">
        <nav className="settings-nav" aria-label={t('Settings sections')}>{sections.map(([id, label, Icon]) => <button key={id} className={active === id ? 'active' : ''} onClick={() => setActive(id)}><Icon size={18} />{t(label)}</button>)}</nav>
        <div className="settings-content">
          {active === 'profile' ? <section className="panel settings-section profile-section"><div className="settings-section-heading"><div><h2>{t('Your profile')}</h2><p>{t('Saved securely on this device.')}</p></div><Button variant="secondary" onClick={() => onShowToast(t('Profile editor opened. Changes stay on this device until sync.'))}>{t('Edit profile')}</Button></div><div className="profile-row"><span className="large-avatar">M</span><div><h3>Maya Johnson</h3><p>{t('Student · Jefferson Middle School')}</p><span>{t('SyncED learner ID · 2048-MJ')}</span></div><ChevronRight size={20} /></div></section> : null}

          {active === 'language' ? <section className="panel settings-section">
            <div className="settings-section-heading"><div><h2>{t('Language & reading')}</h2><p>{t('Every screen, lesson, worksheet, and instruction uses the language you choose.')}</p></div><Languages size={22} /></div>
            <label className="setting-row select-setting"><span className="setting-icon"><Globe2 size={19} /></span><div><strong>{t('App language')}</strong><p>{t('Changes the entire interface and learning content.')}</p></div><select value={language} onChange={(event) => setLanguage(event.target.value)}>{languages.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
            <div className="setting-row"><span className="setting-icon"><Eye size={19} /></span><div><strong>{t('Plain-language mode')}</strong><p>{t('Replaces long descriptions with short sentences, direct instructions, and one idea at a time across the app.')}</p></div><Toggle label={t('Plain-language mode')} checked={state.settings.plainLanguage} onChange={(value) => updateSetting('plainLanguage', value)} /></div>
            <div className={`plain-language-preview ${state.settings.plainLanguage ? 'active' : ''}`}><small>{t('Preview')}</small><div><span><b>{t('Standard')}</b>{t('Courses, assignments, and progress are available with or without Wi-Fi.')}</span><ChevronRight size={18} /><span><b>{t('Plain language')}</b>{t('Your lessons work without internet.')}</span></div></div>
            <div className="setting-row"><span className="setting-icon text-size-icon">Aa</span><div><strong>{t('Larger text')}</strong><p>{t('Increase lesson and navigation text size.')}</p></div><Toggle label={t('Larger text')} checked={state.settings.largeText} onChange={(value) => updateSetting('largeText', value)} /></div>
          </section> : null}

          {active === 'appearance' ? <section className="panel settings-section">
            <div className="settings-section-heading"><div><h2>{t('Appearance')}</h2><p>{t('Choose a comfortable theme and accent color.')}</p></div><Palette size={22} /></div>
            <div className="theme-options">{[['light', 'Light', Sun], ['dark', 'Dark', Moon], ['contrast', 'High contrast', Eye]].map(([id, label, Icon]) => <button key={id} className={state.settings.theme === id ? 'active' : ''} onClick={() => updateSetting('theme', id)}><span><Icon size={21} /></span><strong>{t(label)}</strong>{state.settings.theme === id ? <Check size={17} /> : null}</button>)}</div>
            <div className="accent-setting"><div><strong>{t('Accent color')}</strong><p>{t('Changes buttons, links, and progress highlights.')}</p></div><div>{[['blue', '#0757e6'], ['teal', '#087f75'], ['purple', '#7256d9'], ['orange', '#c75d09']].map(([id, color]) => <button key={id} className={state.settings.accent === id ? 'active' : ''} onClick={() => updateSetting('accent', id)} aria-label={t('{color} accent', { color: id })} style={{ '--swatch': color }}>{state.settings.accent === id ? <Check size={15} /> : null}</button>)}</div></div>
          </section> : null}

          {active === 'offline' ? <><section className="panel settings-section">
            <div className="settings-section-heading"><div><h2>{t('Offline & storage')}</h2><p>{t('Choose what SyncED keeps ready on this device.')}</p></div><HardDrive size={22} /></div>
            <div className="storage-overview"><div><span><Database size={21} /></span><p><strong>{storageInfo.supported ? `${formatBytes(storageInfo.usage)} used` : 'Storage estimate unavailable'}</strong><small>{storageInfo.quota ? `${formatBytes(Math.max(0, storageInfo.quota - storageInfo.usage))} estimated available` : 'Available space not reported'}</small></p></div>{storageInfo.quota ? <Progress value={(storageInfo.usage / storageInfo.quota) * 100} /> : null}</div>
            <div className="setting-row"><span className="setting-icon"><Download size={19} /></span><div><strong>{t('Automatically download new lessons')}</strong><p>{t('Download over trusted Wi-Fi at a community hub.')}</p></div><Toggle label={t('Automatically download lessons')} checked={state.settings.autoDownload} onChange={(value) => updateSetting('autoDownload', value)} /></div>
            <div className="setting-row"><span className="setting-icon"><Wifi size={19} /></span><div><strong>{t('Sync only on Wi-Fi')}</strong><p>{t('Protects limited mobile data plans.')}</p></div><Toggle label={t('Sync only on Wi-Fi')} checked={state.settings.wifiOnly} onChange={(value) => updateSetting('wifiOnly', value)} /></div>
            <div className="settings-actions"><Button variant="secondary" icon={RefreshCw} onClick={onSync}>{t('Check for updates')}</Button><Button variant="danger" icon={Trash2} onClick={onClearDownloads}>{t('Remove downloaded lessons')}</Button></div>
          </section><OfflineTestPanel demoMode={connectivity.demoMode} onSetDemoMode={connectivity.setDemoMode} queueEntries={syncQueue.entries} onAddFailure={onAddTestFailure} onRetry={() => syncQueue.sync({ ignoreBackoff: true })} onClearDownloads={downloads.clear} onClearActivity={onClearActivity} /></> : null}

          {active === 'notifications' ? <section className="panel settings-section"><div className="settings-section-heading"><div><h2>{t('Notifications')}</h2><p>{t('Choose which reminders appear on this device.')}</p></div><Bell size={22} /></div><div className="setting-row"><span className="setting-icon"><Bell size={19} /></span><div><strong>{t('Assignment reminders')}</strong><p>{t('Show a reminder before an assignment is due or closes.')}</p></div><Toggle label={t('Assignment reminders')} checked={state.settings.assignmentReminders} onChange={(value) => updateSetting('assignmentReminders', value)} /></div><div className="setting-row"><span className="setting-icon"><RefreshCw size={19} /></span><div><strong>{t('Sync reminders')}</strong><p>{t('Remind me when completed work has not synced.')}</p></div><Toggle label={t('Sync reminders')} checked={state.settings.syncReminders} onChange={(value) => updateSetting('syncReminders', value)} /></div></section> : null}

          {active === 'privacy' ? <section className="panel settings-section"><div className="settings-section-heading"><div><h2>{t('Device & privacy')}</h2><p>{t('Your learning data belongs to you and your school.')}</p></div><ShieldCheck size={22} /></div><div className="setting-row"><span className="setting-icon"><Smartphone size={19} /></span><div><strong>{t('This device')}</strong><p>{t('Last security check today')}</p></div><span className="verified-device"><Check size={14} />{t('Verified')}</span></div><button className="privacy-link" onClick={() => onNavigate('support', 'privacy')}><ShieldCheck size={18} /><span><strong>{t('How SyncED protects family data')}</strong><small>{t('Read the plain-language privacy guide')}</small></span><ChevronRight size={18} /></button></section> : null}

          {active === 'about' ? <section className="panel settings-section"><div className="settings-section-heading"><div><h2>{t('About SyncED')}</h2><p>{t('Offline-first education for students and families.')}</p></div><Info size={22} /></div><p className="settings-about-copy">{t('SyncED is a proposed nonprofit education initiative and working prototype. It is not presented as a registered nonprofit yet.')}</p><Button variant="secondary" onClick={() => onNavigate('support', 'about')}>{t('Open About & impact')}</Button></section> : null}
        </div>
      </div>
    </div>
  )
}
