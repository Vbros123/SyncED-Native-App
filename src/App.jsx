import { useCallback, useEffect, useState } from 'react'
import { CheckCircle2, MapPin, RefreshCw, WifiOff } from 'lucide-react'
import AppShell from './components/AppShell.jsx'
import { LaunchSequence } from './components/Celebrations.jsx'
import CompletionQrModal from './components/CompletionQrModal.jsx'
import { AssignmentModal, CalendarModal, SyncQueueModal } from './components/AssignmentCenter.jsx'
import { Button, Modal, Toast } from './components/UI.jsx'
import HomePage from './pages/HomePage.jsx'
import LearningPage from './pages/LearningPage.jsx'
import ExplorePage from './pages/ExplorePage.jsx'
import LessonPage from './pages/LessonPage.jsx'
import SkillsPage from './pages/SkillsPage.jsx'
import RewardsPage from './pages/RewardsPage.jsx'
import HubsPage from './pages/HubsPage.jsx'
import FamilyPage from './pages/FamilyPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import SupportPage from './pages/SupportPage.jsx'
import { assignmentsSeed, courseContent, courses, skills } from './data.js'
import { usePersistedState } from './hooks/usePersistedState.js'
import { useI18n } from './i18n.jsx'
import { createCompletionRecord } from './utils/completionQr.js'

const initialState = {
  downloaded: 36,
  lastSync: 'Yesterday, 6:45 PM',
  storageUsed: 12.4,
  assignments: assignmentsSeed,
  completedAssignments: [],
  assignmentResponses: {},
  lateAssignments: [],
  completedSkills: [],
  courseProgress: { algebra: [0], science: [], reading: [], history: [], computing: [], money: [] },
  savedLessons: [],
  queueItems: [
    { id: 'demo-assignment', label: 'Practice: equations', type: 'Assignment draft' },
    { id: 'demo-progress', label: 'Algebra basics', type: 'Learning progress' },
    { id: 'demo-family', label: 'Family activity', type: 'Family progress' },
  ],
  points: 240,
  mascotItem: 'cap',
  mascot: { headwear: 'cap', accessory: 'none', faceColor: 'ocean', bodyColor: 'blue', expression: 'happy' },
  familyActivities: 3,
  familyActivityDone: false,
  deviceRequests: {},
  helpRequests: [],
  settings: {
    plainLanguage: false,
    largeText: false,
    autoDownload: true,
    wifiOnly: true,
    theme: 'light',
    accent: 'blue',
    leaderboardVisible: true,
    assignmentReminders: true,
    syncReminders: true,
  },
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[character])
}

export default function App() {
  const { t, language, locale } = useI18n()
  const [screen, setScreen] = useState('home')
  const [online, setOnline] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [state, setState] = usePersistedState('synced-demo-state-v2', initialState)
  const [toast, setToast] = useState('')
  const [modal, setModal] = useState(null)
  const [activeAssignment, setActiveAssignment] = useState(null)
  const [selectedCourse, setSelectedCourse] = useState('algebra')
  const [lessonIndex, setLessonIndex] = useState(1)
  const [initialSkill, setInitialSkill] = useState(null)
  const [learningTab, setLearningTab] = useState('courses')
  const [supportTab, setSupportTab] = useState('help')
  const [showLaunch, setShowLaunch] = useState(true)
  const [completionQr, setCompletionQr] = useState(null)
  const finishLaunch = useCallback(() => setShowLaunch(false), [])

  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = locale.dir
  }, [language, locale.dir])

  useEffect(() => {
    document.documentElement.classList.toggle('large-text', state.settings.largeText)
    document.documentElement.dataset.theme = state.settings.theme
    document.documentElement.dataset.accent = state.settings.accent
  }, [state.settings.largeText, state.settings.theme, state.settings.accent])

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(''), 3400)
    return () => window.clearTimeout(timer)
  }, [toast])

  const showToast = (message) => setToast(message)
  const queueItem = (current, item) => current.queueItems.some((existing) => existing.id === item.id) ? current.queueItems : [...current.queueItems, item]

  const performSync = () => {
    setSyncing(true)
    window.setTimeout(() => {
      setState((current) => ({ ...current, queueItems: [], lastSync: 'Just now', downloaded: Math.max(current.downloaded, 36) }))
      setSyncing(false)
      setModal(null)
      showToast(t('Sync complete—everything is up to date.'))
    }, 1300)
  }

  const handleSync = () => {
    if (!online) {
      setModal('offline')
      return
    }
    performSync()
  }

  const navigate = (next, subtab) => {
    if (next === 'learning') setLearningTab(subtab || 'courses')
    if (next === 'support') setSupportTab(subtab || 'help')
    setScreen(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openCourse = (courseId) => {
    const completed = state.courseProgress[courseId] || []
    const questions = courseContent[courseId].questions
    const firstIncomplete = questions.findIndex((_, index) => !completed.includes(index))
    setSelectedCourse(courseId)
    setLessonIndex(firstIncomplete === -1 ? 0 : firstIncomplete)
    navigate('lesson')
  }

  const completeQuestion = (courseId, index) => {
    const course = courses.find((item) => item.id === courseId)
    const question = courseContent[courseId]?.questions[index]
    if (!course || !question || state.courseProgress[courseId]?.includes(index)) return
    const completedAt = new Date().toISOString()
    setState((current) => {
      const completed = current.courseProgress[courseId] || []
      if (completed.includes(index)) return current
      return {
        ...current,
        points: current.points + 10,
        courseProgress: { ...current.courseProgress, [courseId]: [...completed, index] },
        queueItems: queueItem(current, { id: `lesson-${courseId}-${index}`, label: course.title, type: 'Learning progress' }),
      }
    })
    setCompletionQr(createCompletionRecord({ kind: 'course', courseId, courseTitle: course.title, lessonTitle: question.title, points: 10, completedAt }))
    showToast(t('Lesson complete! +10 learning points. Progress is queued to sync.'))
  }

  const toggleSave = (key) => {
    setState((current) => ({ ...current, savedLessons: current.savedLessons.includes(key) ? current.savedLessons.filter((item) => item !== key) : [...current.savedLessons, key] }))
    showToast(state.savedLessons.includes(key) ? t('Removed from saved lessons.') : t('Saved for later on this device.'))
  }

  const submitAssignment = (id, response, isLate) => {
    const assignment = assignmentsSeed.find((item) => item.id === id)
    setState((current) => ({
      ...current,
      points: current.completedAssignments.includes(id) ? current.points : current.points + 15,
      completedAssignments: current.completedAssignments.includes(id) ? current.completedAssignments : [...current.completedAssignments, id],
      assignmentResponses: { ...current.assignmentResponses, [id]: response },
      lateAssignments: isLate && !current.lateAssignments.includes(id) ? [...current.lateAssignments, id] : current.lateAssignments,
      queueItems: queueItem(current, { id: `assignment-${id}`, label: assignment.title, type: isLate ? 'Late assignment submission' : 'Assignment submission' }),
    }))
    setActiveAssignment(null)
    showToast(t(isLate ? 'Submitted late and queued to sync. +15 points.' : 'Assignment submitted and queued to sync. +15 points.'))
  }

  const openSkill = (id) => {
    setInitialSkill(id)
    navigate('skills')
  }

  const completeSkill = (id) => {
    const skill = skills.find((item) => item.id === id)
    if (!skill || state.completedSkills.includes(id)) return
    const completedAt = new Date().toISOString()
    setState((current) => {
      if (current.completedSkills.includes(id)) return current
      return { ...current, points: current.points + 25, completedSkills: [...current.completedSkills, id], queueItems: queueItem(current, { id: `skill-${id}`, label: 'Digital skill completed', type: 'Learning progress' }) }
    })
    setCompletionQr(createCompletionRecord({ kind: 'skill', courseId: id, courseTitle: 'Digital skills', lessonTitle: skill.title, points: 25, completedAt }))
    showToast(t('Digital skill completed. +25 learning points.'))
  }

  const submitDeviceRequest = (id, details) => {
    setState((current) => ({
      ...current,
      deviceRequests: { ...current.deviceRequests, [id]: { ...details, status: 'Waiting for partner review', reference: `SY-${String(2048 + Object.keys(current.deviceRequests).length).padStart(4, '0')}` } },
      queueItems: queueItem(current, { id: `device-${id}`, label: 'Device support request', type: 'Support request' }),
    }))
    showToast(t('Device request saved. Updates will go to {email} after sync.', { email: details.email }))
  }

  const submitHelp = (request) => {
    const id = `help-${Date.now()}`
    setState((current) => ({ ...current, helpRequests: [...current.helpRequests, { id, ...request }], queueItems: queueItem(current, { id, label: request.topic, type: 'Helpdesk question' }) }))
    showToast(t('Helpdesk question saved to the sync queue.'))
  }

  const completeFamilyActivity = () => {
    if (state.familyActivityDone) return
    setState((current) => ({ ...current, points: current.points + 20, familyActivityDone: true, familyActivities: Math.min(5, current.familyActivities + 1), queueItems: queueItem(current, { id: 'family-activity-current', label: 'Family activity', type: 'Family progress' }) }))
    showToast(t('Family activity completed. +20 learning points.'))
  }

  const updateSetting = (key, value) => setState((current) => ({ ...current, settings: { ...current.settings, [key]: value } }))
  const customizeMascot = (slot, value) => {
    setState((current) => ({ ...current, mascot: { ...initialState.mascot, ...(current.mascot || {}), [slot]: value } }))
    showToast(t('Nova’s new look is saved on this device.'))
  }
  const clearDownloads = () => setModal('clear')
  const confirmClearDownloads = () => {
    setState((current) => ({ ...current, downloaded: 0, storageUsed: 10.6 }))
    setModal(null)
    showToast(t('Downloaded lessons removed. Your progress is still safe.'))
  }

  const downloadWorksheet = (courseId) => {
    const course = courses.find((item) => item.id === courseId)
    const content = courseContent[courseId]
    const questions = content.questions.map((question, index) => `<section><h2>${index + 1}. ${escapeHtml(t(question.title))}</h2><p>${escapeHtml(t(question.prompt))}</p>${question.options.map((option, optionIndex) => `<p class="option">${String.fromCharCode(65 + optionIndex)}. ${escapeHtml(t(option))}</p>`).join('')}<div class="answer">${escapeHtml(t('Explain your thinking:'))}</div></section>`).join('')
    const html = `<!doctype html><html lang="${language}" dir="${locale.dir}"><meta charset="utf-8"><title>${escapeHtml(t(course.title))} — ${escapeHtml(t('Worksheet'))}</title><style>body{font:16px system-ui;max-width:780px;margin:40px auto;padding:0 24px;color:#14213d}header{border-bottom:3px solid #0757e6;padding-bottom:18px}h1{margin-bottom:5px}section{margin:28px 0;padding:20px;border:1px solid #cad6e8;border-radius:12px}.option{margin-left:18px}.answer{height:90px;margin-top:20px;padding-top:8px;border-top:1px dashed #98a8bf;color:#66738a}@media print{body{margin:0}section{break-inside:avoid}}</style><body><header><h1>${escapeHtml(t(course.title))}</h1><p>${escapeHtml(t('Printable offline worksheet'))} · SyncED</p><p>${escapeHtml(t('Name:'))} ____________________ &nbsp; ${escapeHtml(t('Date:'))} ____________________</p></header>${questions}<footer>${escapeHtml(t('Open SyncED to check your answers and save progress.'))}</footer></body></html>`
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `SyncED-${courseId}-worksheet-${language}.html`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    showToast(t('Worksheet downloaded. Open it in a browser to print or save as PDF.'))
  }

  const downloadCourse = (courseId) => {
    const course = courses.find((item) => item.id === courseId)
    setState((current) => ({ ...current, downloaded: Math.min(54, current.downloaded + 3), storageUsed: Math.min(15.5, current.storageUsed + 0.03) }))
    showToast(t('{course} is ready offline.', { course: t(course.title) }))
  }

  const activeState = { ...state, assignments: assignmentsSeed }
  let content
  if (screen === 'home') content = <HomePage state={activeState} online={online} syncing={syncing} onSync={handleSync} onViewQueue={() => setModal('queue')} onOpenCourse={openCourse} onOpenSkill={openSkill} onNavigate={navigate} onOpenAssignment={setActiveAssignment} onOpenCalendar={() => setModal('calendar')} />
  else if (screen === 'learning') content = <LearningPage key={learningTab} state={activeState} initialTab={learningTab} onOpenCourse={openCourse} onOpenAssignment={setActiveAssignment} onDownloadAll={() => online ? performSync() : setModal('offline')} onDownloadWorksheet={downloadWorksheet} />
  else if (screen === 'explore') content = <ExplorePage state={activeState} onOpenCourse={openCourse} onDownloadWorksheet={downloadWorksheet} onDownloadCourse={downloadCourse} />
  else if (screen === 'lesson') content = <LessonPage courseId={selectedCourse} lessonIndex={lessonIndex} state={activeState} onBack={() => navigate('learning')} onChangeLesson={setLessonIndex} onCompleteQuestion={completeQuestion} onToggleSave={toggleSave} onViewQueue={() => setModal('queue')} onDownloadWorksheet={downloadWorksheet} />
  else if (screen === 'skills') content = <SkillsPage state={activeState} initialSkill={initialSkill} onClearInitialSkill={() => setInitialSkill(null)} onCompleteSkill={completeSkill} />
  else if (screen === 'rewards') content = <RewardsPage state={activeState} online={online} onCustomize={customizeMascot} onUpdateSetting={updateSetting} />
  else if (screen === 'hubs') content = <HubsPage state={activeState} online={online} onSubmitDeviceRequest={submitDeviceRequest} onShowToast={showToast} />
  else if (screen === 'family') content = <FamilyPage state={activeState} onStartFamilyLesson={(id) => openSkill(id === 'safety' ? 'scams' : id === 'video' ? 'video' : 'email')} onCompleteFamilyActivity={completeFamilyActivity} onShowToast={showToast} />
  else if (screen === 'settings') content = <SettingsPage state={activeState} updateSetting={updateSetting} onClearDownloads={clearDownloads} onSync={handleSync} onNavigate={navigate} onShowToast={showToast} />
  else content = <SupportPage key={supportTab} state={activeState} initialTab={supportTab} onSubmitHelp={submitHelp} />

  const selectedAssignment = assignmentsSeed.find((item) => item.id === activeAssignment)

  return (
    <>
      <AppShell active={screen} onNavigate={navigate} online={online} setOnline={(value) => { setOnline(value); showToast(t(value ? 'Demo Wi-Fi connected. You can sync now.' : 'Offline mode on. Downloaded work still works.')) }} storageUsed={state.storageUsed} plainLanguage={state.settings.plainLanguage}>{content}</AppShell>
      {showLaunch ? <LaunchSequence onComplete={finishLaunch} /> : null}
      <Toast message={toast} onClose={() => setToast('')} />

      {completionQr ? <CompletionQrModal completion={completionQr} onClose={() => setCompletionQr(null)} /> : null}

      <AssignmentModal assignment={selectedAssignment} completed={selectedAssignment ? state.completedAssignments.includes(selectedAssignment.id) : false} savedResponse={selectedAssignment ? state.assignmentResponses[selectedAssignment.id] : ''} onClose={() => setActiveAssignment(null)} onSubmit={submitAssignment} onOpenCourse={openCourse} onDownloadWorksheet={downloadWorksheet} />
      {modal === 'calendar' ? <CalendarModal completedAssignments={state.completedAssignments} onClose={() => setModal(null)} onOpenAssignment={(id) => { setModal(null); setActiveAssignment(id) }} /> : null}
      {modal === 'queue' ? <SyncQueueModal queueItems={state.queueItems} online={online} onSync={performSync} onClose={() => setModal(null)} /> : null}

      {modal === 'offline' ? <Modal title={t('You’re ready to learn offline')} onClose={() => setModal(null)}><div className="offline-modal"><span className="offline-modal-icon"><WifiOff size={32} /></span><p>{t('Downloaded lessons, mini-videos, worksheets, and assignments still work. Connect at a trusted hub when you are ready to send {count} queued items.', { count: state.queueItems.length })}</p><div className="offline-hub-row"><MapPin size={20} /><div><strong>Riverside Community Center</strong><span>0.6 {t('miles')} · {t('Open until 6:00 PM')}</span></div></div><div className="form-actions"><Button variant="quiet" onClick={() => setModal(null)}>{t('Keep learning')}</Button><Button icon={RefreshCw} onClick={() => { setOnline(true); window.setTimeout(performSync, 50) }}>{t('Simulate hub Wi-Fi')}</Button></div></div></Modal> : null}

      {modal === 'clear' ? <Modal title={t('Remove downloaded lessons?')} onClose={() => setModal(null)}><div className="confirm-modal"><span><CheckCircle2 size={26} /></span><p>{t('This frees about 1.8 GB. Progress, completed work, family profiles, and settings stay safe. You will need Wi-Fi to download lesson media again.')}</p><div className="form-actions"><Button variant="quiet" onClick={() => setModal(null)}>{t('Cancel')}</Button><Button variant="danger" onClick={confirmClearDownloads}>{t('Remove downloads')}</Button></div></div></Modal> : null}
    </>
  )
}
