import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Compass,
  Database,
  Gift,
  Globe2,
  HelpCircle,
  Home,
  Laptop,
  MapPin,
  Menu,
  Settings,
  Users,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { languages } from '../data.js'
import { useI18n } from '../i18n.jsx'
import { formatBytes } from '../services/contentStorage.js'
import ConnectionStatus from './ConnectionStatus.jsx'
import Logo from './Logo.jsx'
import { Progress } from './UI.jsx'

const navItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'learning', label: 'My learning', icon: BookOpen },
  { id: 'explore', label: 'Explore', icon: Compass },
  { id: 'skills', label: 'Digital skills', icon: Laptop },
  { id: 'rewards', label: 'Rewards', icon: Gift },
  { id: 'hubs', label: 'Community hubs', icon: MapPin },
  { id: 'family', label: 'Family', icon: Users },
  { id: 'support', label: 'Help & about', icon: HelpCircle },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function AppShell({
  active,
  onNavigate,
  children,
  connectivity,
  syncState,
  pendingCount,
  storageInfo,
  plainLanguage,
}) {
  const { language, setLanguage, t } = useI18n()
  const [menuOpen, setMenuOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('synced-sidebar-collapsed') === 'true')
  const currentNav = active === 'lesson' ? 'learning' : active
  const storagePercent = storageInfo.quota ? (storageInfo.usage / storageInfo.quota) * 100 : 0

  const navigate = (id) => {
    onNavigate(id)
    setMenuOpen(false)
  }

  const toggleCollapsed = () => {
    const next = !collapsed
    localStorage.setItem('synced-sidebar-collapsed', String(next))
    setCollapsed(next)
  }

  return (
    <div className={`app-shell ${collapsed ? 'sidebar-is-collapsed' : ''}`}>
      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <div className="brand-row">
          <button className="brand" onClick={() => navigate('home')} aria-label="SyncED home">
            <Logo compact={collapsed} />
          </button>
          <button className="sidebar-close" aria-label={t('Close menu')} onClick={() => setMenuOpen(false)}><X size={22} /></button>
        </div>

        <nav className="side-nav" aria-label="Main navigation">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={currentNav === id ? 'nav-active' : ''}
              onClick={() => navigate(id)}
              aria-current={currentNav === id ? 'page' : undefined}
              title={collapsed ? t(label) : undefined}
            >
              <Icon size={21} strokeWidth={1.9} />
              <span>{t(label)}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="side-card storage-card">
            <Database size={20} />
            <div className="side-card-copy">
              <strong>{t('Storage')}</strong>
              <span>{storageInfo.supported ? `${formatBytes(storageInfo.usage)} used` : t('Estimate unavailable')}</span>
              <Progress value={storagePercent} compact />
            </div>
          </div>
          <ConnectionStatus isOnline={connectivity.isOnline} browserOnline={connectivity.browserOnline} demoMode={connectivity.demoMode} syncState={syncState} pendingCount={pendingCount} />
          <button className="collapse-control" onClick={toggleCollapsed} aria-label={t(collapsed ? 'Expand sidebar' : 'Collapse sidebar')} title={t(collapsed ? 'Expand sidebar' : 'Collapse sidebar')}>
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            <span>{t('Collapse sidebar')}</span>
          </button>
        </div>
      </aside>

      {menuOpen ? <button className="sidebar-scrim" aria-label={t('Close menu')} onClick={() => setMenuOpen(false)} /> : null}

      <div className="app-main">
        <header className="topbar">
          <button className="mobile-menu" aria-label={t('Open menu')} onClick={() => setMenuOpen(true)}><Menu size={23} /></button>
          {plainLanguage ? <button className="plain-mode-chip" onClick={() => navigate('settings')}><CheckCircle2 size={15} />{t('Plain language is on')}</button> : null}
          <ConnectionStatus compact isOnline={connectivity.isOnline} browserOnline={connectivity.browserOnline} demoMode={connectivity.demoMode} syncState={syncState} pendingCount={pendingCount} />
          <label className="language-control">
            <Globe2 size={17} />
            <select value={language} onChange={(event) => setLanguage(event.target.value)} aria-label={t('Language')}>
              {languages.map((item) => <option value={item.id} key={item.id}>{item.label}</option>)}
            </select>
            <ChevronDown size={16} />
          </label>
        </header>
        <main className="page-container">{children}</main>
      </div>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {navItems.filter((item) => ['home', 'learning', 'explore', 'rewards', 'hubs'].includes(item.id)).map(({ id, label, icon: Icon }) => (
          <button key={id} className={currentNav === id ? 'nav-active' : ''} onClick={() => navigate(id)}>
            <Icon size={20} />
            <span>{t(label)}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
