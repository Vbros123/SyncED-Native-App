import { useCallback, useEffect, useMemo, useState } from 'react'
import { CheckCircle2, MapPin, RefreshCw, WifiOff } from 'lucide-react'
import AppShell from './components/AppShell.jsx'
import { AssignmentModal, CalendarModal, SyncQueueModal } from './components/AssignmentCenter.jsx'
import { LaunchSequence } from './components/Celebrations.jsx'
import OfflineFallback from './components/OfflineFallback.jsx'
import Onboarding from './components/Onboarding.jsx'
import { Button, Modal, Toast } from './components/UI.jsx'
import { assignmentsSeed, courseContent, courses } from './data.js'
import { useConnectivity } from './hooks/useConnectivity.js'
import { useDownloads } from './hooks/useDownloads.js'
import { usePersistedState } from './hooks/usePersistedState.js'
import { useStorageInfo } from './hooks/useStorageInfo.js'
import { useSyncQueue } from './hooks/useSyncQueue.js'
import { useI18n } from './i18n.jsx'
import ExplorePage from './pages/ExplorePage.jsx'
import FamilyPage from './pages/FamilyPage.jsx'
import HomePage from './pages/HomePage.jsx'
import HubsPage from './pages/HubsPage.jsx'
import LearningPage from './pages/LearningPage.jsx'
import LessonPage from './pages/LessonPage.jsx'
import RewardsPage from './pages/RewardsPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import SkillsPage from './pages/SkillsPage.jsx'
import SupportPage from './pages/SupportPage.jsx'
import { activityStatePatch, clearActivityData, getActivities, saveActivity } from './services/progressStorage.js'
import { addFakeFailedSync, requestBackgroundSync } from './services/syncQueue.js'

const emptyProgress = Object.fromEntries(courses.map((course) => [course.id, []]))

const initialState = {
  downloaded: 0,
  lastSync: null,
  storageUsed: 0,
  assignments: assignmentsSeed,
  completedAssignments: [],
  assignmentResponses: {},
  lateAssignments: [],
  completedSkills: [],
  courseProgress: emptyProgress,
  quizResults: {},
  savedLessons: [],
  queueItems: [],
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
  const connectivity = useConnectivity()
  const downloads = useDownloads(connectivity.isOnline)
  const syncQueue = useSyncQueue({ isOnline: connectivity.isOnline, isSlow: connectivity.isSlow })
  const storageInfo = useStorageInfo()
  const [state, setState] = usePersistedState('synced-device-state-v3', initialState)
  const [screen, setScreen] = useState('home')
  const [toast, setToast] = useState('')
  const [modal, setModal] = useState(null)
  const [activeAssignment, setActiveAssignment] = useState(null)
  const [selectedCourse, setSelectedCourse] = useState('algebra')
  const [lessonIndex, setLessonIndex] = useState(0)
  const [initialSkill, setInitialSkill] = useState(null)
  const [learningTab, setLearningTab] = useState('courses')
  const [supportTab, setSupportTab] = useState('help')
  const [showLaunch, setShowLaunch] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(() => localStorage.getItem('synced-onboarding-complete') !== 'true')
  const finishLaunch = useCallback(() => setShowLaunch(false), [])
  const online = connectivity.isOnline
  const syncing = syncQueue.syncState === 'syncing'

  const showToast = useCallback((message) => setToast(message), [])

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

  useEffect(() => {
    let cancelled = false
    getActivities().then((activities) => {
      if (cancelled || !activities.length) return
      const saved = activityStatePatch(activities)
      setState((current) => ({
        ...current,
        points: Math.max(current.points, 240 + saved.earnedPoints),
        courseProgress: Object.fromEntries(courses.map((course) => [course.id, [...new Set([...(current.courseProgress[course.id] || []), ...(saved.courseProgress[course.id] || [])])]])),
        quizResults: Object.fromEntries(courses.map((course) => [course.id, { ...(current.quizResults?.[course.id] || {}), ...(saved.quizResults?.[course.id] || {}) }])),
        completedAssignments: [...new Set([...current.completedAssignments, ...saved.completedAssignments])],
        assignmentResponses: { ...current.assignmentResponses, ...saved.assignmentResponses },
        lateAssignments: [...new Set([...current.lateAssignments, ...saved.lateAssignments])],
        completedSkills: [...new Set([...current.completedSkills, ...saved.completedSkills])],
        familyActivityDone: current.familyActivityDone || saved.familyActivityDone,
      }))
    }).catch(() => showToast('Saved activity could not be loaded. Try reloading SyncED.'))
    return () => { cancelled = true }
  }, [setState, showToast])

  const navigate = (next, subtab) => {
    if (next === 'learning') setLearningTab(subtab || 'courses')
    if (next === 'support') setSupportTab(subtab || 'help')
    setScreen(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const performSync = async (options) => {
    if (!online) {
      setModal('offline')
      return
    }
    try {
      const result = await syncQueue.sync(options)
      setModal(null)
      showToast(result.failedCount ? 'Some work could not sync. It remains safely queued.' : t('Sync complete—everything is up to date.'))
    } catch (error) {
      showToast(error.message)
    }
  }

  const handleSync = () => online ? performSync() : setModal('offline')

  const openCourse = (courseId) => {
    if (!online && !downloads.recordMap[courseId]) {
      setSelectedCourse(courseId)
      setModal('lesson-unavailable')
      return false
    }
    const completed = state.courseProgress[courseId] || []
    const questions = courseContent[courseId].questions
    const firstIncomplete = questions.findIndex((_, index) => !completed.includes(index))
    setSelectedCourse(courseId)
    setLessonIndex(firstIncomplete === -1 ? 0 : firstIncomplete)
    navigate('lesson')
    return true
  }

  const recordQuestionAttempt = async (courseId, index, response, correct, attemptNumber) => {
    const course = courses.find((item) => item.id === courseId)
    const firstAttemptCorrect = attemptNumber === 1 && correct
    const score = correct ? (firstAttemptCorrect ? 100 : Math.max(50, 100 - ((attemptNumber - 1) * 25))) : null
    const result = { attempts: attemptNumber, firstAttemptCorrect, completed: correct, lastResponse: response, score }
    await saveActivity({
      id: `quiz-attempt-${courseId}-${index}-${attemptNumber}`,
      activityType: 'quiz-attempt',
      courseId,
      lessonId: `${courseId}-${index}`,
      lessonCompletion: false,
      quizResponses: { selected: response, correct: courseContent[courseId].questions[index].correct },
      quizScore: correct ? score : 0,
      progressPercentage: Math.round(((state.courseProgress[courseId]?.length || 0) / courseContent[courseId].questions.length) * 100),
      pointsEarned: 0,
      metadata: { lessonIndex: index, attemptNumber, correct, firstAttemptCorrect },
    }, { label: course.title, type: 'Quiz attempt' })
    requestBackgroundSync()
    setState((current) => ({
      ...current,
      quizResults: {
        ...(current.quizResults || {}),
        [courseId]: {
          ...(current.quizResults?.[courseId] || {}),
          [index]: result,
        },
      },
    }))
    return result
  }

  const completeQuestion = async (courseId, index, response, result) => {
    const course = courses.find((item) => item.id === courseId)
    const existingCompletion = state.courseProgress[courseId]?.includes(index)
    if (!existingCompletion) {
      await saveActivity({
        id: `quiz-${courseId}-${index}`,
        activityType: 'quiz',
        courseId,
        lessonId: `${courseId}-${index}`,
        lessonCompletion: true,
        quizResponses: { selected: response, correct: courseContent[courseId].questions[index].correct },
        quizScore: result.score,
        progressPercentage: Math.round(((index + 1) / courseContent[courseId].questions.length) * 100),
        pointsEarned: 10,
        metadata: { lessonIndex: index, attempts: result.attempts, firstAttemptCorrect: result.firstAttemptCorrect },
      }, { label: course.title, type: 'Quiz and learning progress' })
      requestBackgroundSync()
      setState((current) => ({
        ...current,
        points: current.points + 10,
        courseProgress: { ...current.courseProgress, [courseId]: [...(current.courseProgress[courseId] || []), index] },
        quizResults: {
          ...(current.quizResults || {}),
          [courseId]: {
            ...(current.quizResults?.[courseId] || {}),
            [index]: { ...result, completed: true },
          },
        },
      }))
    }
    showToast(t('Correct! +10 learning points. Progress is queued to sync.'))
  }

  const toggleSave = (key) => {
    setState((current) => ({ ...current, savedLessons: current.savedLessons.includes(key) ? current.savedLessons.filter((item) => item !== key) : [...current.savedLessons, key] }))
    showToast(state.savedLessons.includes(key) ? t('Removed from saved lessons.') : t('Saved for later on this device.'))
  }

  const submitAssignment = async (id, response, isLate) => {
    const assignment = assignmentsSeed.find((item) => item.id === id)
    const alreadyCompleted = state.completedAssignments.includes(id)
    if (!alreadyCompleted) {
      await saveActivity({
        id: `assignment-${id}`,
        activityType: 'assignment',
        courseId: assignment.courseId,
        assignmentResponses: response,
        progressPercentage: 100,
        pointsEarned: 15,
        metadata: { assignmentId: id, isLate },
      }, { label: assignment.title, type: isLate ? 'Late assignment submission' : 'Assignment submission' })
      requestBackgroundSync()
    }
    setState((current) => ({
      ...current,
      points: alreadyCompleted ? current.points : current.points + 15,
      completedAssignments: alreadyCompleted ? current.completedAssignments : [...current.completedAssignments, id],
      assignmentResponses: { ...current.assignmentResponses, [id]: response },
      lateAssignments: isLate && !current.lateAssignments.includes(id) ? [...current.lateAssignments, id] : current.lateAssignments,
    }))
    setActiveAssignment(null)
    showToast(t(isLate ? 'Submitted late and queued to sync. +15 points.' : 'Assignment submitted and queued to sync. +15 points.'))
  }

  const openSkill = (id) => {
    setInitialSkill(id)
    navigate('skills')
  }

  const completeSkill = async (id) => {
    if (state.completedSkills.includes(id)) return
    await saveActivity({ id: `skill-${id}`, activityType: 'skill', progressPercentage: 100, pointsEarned: 25, metadata: { skillId: id } }, { label: 'Digital skill completed', type: 'Learning progress' })
    requestBackgroundSync()
    setState((current) => ({ ...current, points: current.points + 25, completedSkills: [...current.completedSkills, id] }))
    showToast(t('Digital skill completed. +25 learning points.'))
  }

  const submitDeviceRequest = async (id, details) => {
    const activityId = `device-${id}-${Date.now()}`
    await saveActivity({ id: activityId, activityType: 'support', metadata: { requestType: 'device', programId: id, details } }, { label: 'Device support request', type: 'Support request' })
    setState((current) => ({
      ...current,
      deviceRequests: { ...current.deviceRequests, [id]: { ...details, status: 'Waiting for partner review', reference: `SY-${String(2048 + Object.keys(current.deviceRequests).length).padStart(4, '0')}` } },
    }))
    showToast(t('Device request saved. Updates will go to {email} after sync.', { email: details.email }))
  }

  const submitHelp = async (request) => {
    const id = `help-${Date.now()}`
    await saveActivity({ id, activityType: 'support', metadata: request }, { label: request.topic, type: 'Helpdesk question' })
    setState((current) => ({ ...current, helpRequests: [...current.helpRequests, { id, ...request }] }))
    showToast(t('Helpdesk question saved to the sync queue.'))
  }

  const completeFamilyActivity = async () => {
    if (state.familyActivityDone) return
    await saveActivity({ id: 'family-activity-current', activityType: 'family', progressPercentage: 100, pointsEarned: 20 }, { label: 'Family activity', type: 'Family progress' })
    setState((current) => ({ ...current, points: current.points + 20, familyActivityDone: true, familyActivities: Math.min(5, current.familyActivities + 1) }))
    showToast(t('Family activity completed. +20 learning points.'))
  }

  const updateSetting = (key, value) => setState((current) => ({ ...current, settings: { ...current.settings, [key]: value } }))
  const customizeMascot = (slot, value) => {
    setState((current) => ({ ...current, mascot: { ...initialState.mascot, ...(current.mascot || {}), [slot]: value } }))
    showToast(t('Nova’s new look is saved on this device.'))
  }

  const clearDownloads = () => setModal('clear')
  const confirmClearDownloads = async () => {
    await downloads.clear()
    await storageInfo.refresh()
    setModal(null)
    showToast(t('Downloaded lessons removed. Your progress is still safe.'))
  }

  const downloadWorksheet = (courseId) => {
    const course = courses.find((item) => item.id === courseId)
    const content = courseContent[courseId]
    const questions = content.questions.map((question, index) => `<section><h2>${index + 1}. ${escapeHtml(t(question.title))}</h2><p>${escapeHtml(t(question.prompt, { lesson: t(course.title) }))}</p>${question.options.map((option, optionIndex) => `<p class="option">${String.fromCharCode(65 + optionIndex)}. ${escapeHtml(t(option))}</p>`).join('')}<div class="answer">${escapeHtml(t('Explain your thinking:'))}</div></section>`).join('')
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

  const downloadCourse = async (courseId) => {
    const course = courses.find((item) => item.id === courseId)
    const success = await downloads.download(courseId)
    if (success) {
      await storageInfo.refresh()
      showToast(t('{course} is ready offline.', { course: t(course.title) }))
    } else showToast('The lesson download failed. Check your connection and try again.')
  }

  const downloadPack = async () => {
    const success = await downloads.downloadPack()
    await storageInfo.refresh()
    showToast(success ? 'Resilient Learning Pack is ready offline.' : 'The learning pack could not be downloaded.')
  }

  const finishOnboarding = () => {
    localStorage.setItem('synced-onboarding-complete', 'true')
    setShowOnboarding(false)
  }

  const clearLocalActivity = async () => {
    await clearActivityData()
    setState((current) => ({ ...current, completedAssignments: [], assignmentResponses: {}, lateAssignments: [], completedSkills: [], courseProgress: emptyProgress, quizResults: {}, familyActivityDone: false, points: 240 }))
    showToast('Local activity data cleared. Downloaded lessons were not removed.')
  }

  const addTestFailure = async () => {
    await addFakeFailedSync()
    showToast('Fake failed sync added. It will fail once and remain queued.')
  }

  const lastSyncLabel = syncQueue.lastSuccessfulSync ? new Date(syncQueue.lastSuccessfulSync).toLocaleString() : 'Not synced yet'
  const activeState = useMemo(() => ({
    ...state,
    assignments: assignmentsSeed,
    queueItems: syncQueue.entries,
    lastSync: lastSyncLabel,
    downloaded: downloads.lessonRecords.reduce((total, record) => total + (record.quizQuestions?.length || 0), 0),
    storageUsed: storageInfo.usage / (1024 ** 3),
  }), [downloads.lessonRecords, lastSyncLabel, state, storageInfo.usage, syncQueue.entries])

  let content
  if (screen === 'home') content = <HomePage state={activeState} online={online} syncing={syncing} syncState={syncQueue.syncState} downloads={downloads} onSync={handleSync} onViewQueue={() => setModal('queue')} onOpenCourse={openCourse} onOpenSkill={openSkill} onNavigate={navigate} onOpenAssignment={setActiveAssignment} onOpenCalendar={() => setModal('calendar')} />
  else if (screen === 'learning') content = <LearningPage key={learningTab} state={activeState} initialTab={learningTab} downloads={downloads} storageInfo={storageInfo} onOpenCourse={openCourse} onOpenAssignment={setActiveAssignment} onDownloadPack={downloadPack} />
  else if (screen === 'explore') content = <ExplorePage state={activeState} online={online} downloads={downloads} onOpenCourse={openCourse} onDownloadWorksheet={downloadWorksheet} onDownloadCourse={downloadCourse} />
  else if (screen === 'lesson') content = <LessonPage courseId={selectedCourse} lessonIndex={lessonIndex} state={activeState} downloaded={Boolean(downloads.recordMap[selectedCourse])} onBack={() => navigate('explore')} onChangeLesson={setLessonIndex} onRecordAttempt={recordQuestionAttempt} onCompleteQuestion={completeQuestion} onToggleSave={toggleSave} onViewQueue={() => setModal('queue')} onDownloadWorksheet={downloadWorksheet} />
  else if (screen === 'skills') content = <SkillsPage state={activeState} initialSkill={initialSkill} onClearInitialSkill={() => setInitialSkill(null)} onCompleteSkill={completeSkill} />
  else if (screen === 'rewards') content = <RewardsPage state={activeState} online={online} onCustomize={customizeMascot} onUpdateSetting={updateSetting} />
  else if (screen === 'hubs') content = <HubsPage state={activeState} online={online} onSubmitDeviceRequest={submitDeviceRequest} onShowToast={showToast} />
  else if (screen === 'family') content = <FamilyPage state={activeState} onStartFamilyLesson={(id) => openSkill(id === 'safety' ? 'scams' : id === 'video' ? 'video' : 'email')} onCompleteFamilyActivity={completeFamilyActivity} onShowToast={showToast} />
  else if (screen === 'settings') content = <SettingsPage state={activeState} updateSetting={updateSetting} onClearDownloads={clearDownloads} onSync={handleSync} onNavigate={navigate} onShowToast={showToast} connectivity={connectivity} syncQueue={syncQueue} downloads={downloads} storageInfo={storageInfo} onAddTestFailure={addTestFailure} onClearActivity={clearLocalActivity} />
  else content = <SupportPage key={supportTab} state={activeState} initialTab={supportTab} onSubmitHelp={submitHelp} />

  const selectedAssignment = assignmentsSeed.find((item) => item.id === activeAssignment)

  return (
    <>
      <AppShell active={screen} onNavigate={navigate} connectivity={connectivity} syncState={syncQueue.syncState} pendingCount={syncQueue.pendingCount} storageInfo={storageInfo} plainLanguage={state.settings.plainLanguage}>{content}</AppShell>
      {showLaunch ? <LaunchSequence onComplete={finishLaunch} /> : null}
      {!showLaunch && showOnboarding ? <Onboarding onFinish={finishOnboarding} /> : null}
      <Toast message={toast} onClose={() => setToast('')} />

      <AssignmentModal assignment={selectedAssignment} completed={selectedAssignment ? state.completedAssignments.includes(selectedAssignment.id) : false} savedResponse={selectedAssignment ? state.assignmentResponses[selectedAssignment.id] : ''} onClose={() => setActiveAssignment(null)} onSubmit={submitAssignment} onOpenCourse={openCourse} onDownloadWorksheet={downloadWorksheet} />
      {modal === 'calendar' ? <CalendarModal completedAssignments={state.completedAssignments} onClose={() => setModal(null)} onOpenAssignment={(id) => { setModal(null); setActiveAssignment(id) }} /> : null}
      {modal === 'queue' ? <SyncQueueModal queueItems={syncQueue.entries} online={online} syncState={syncQueue.syncState} onSync={() => performSync({ ignoreBackoff: true })} onClose={() => setModal(null)} /> : null}
      {modal === 'lesson-unavailable' ? <Modal title="Lesson unavailable offline" onClose={() => setModal(null)} size="large"><OfflineFallback onBack={() => setModal(null)} onManageDownloads={() => { setModal(null); navigate('learning', 'downloads') }} /></Modal> : null}

      {modal === 'offline' ? <Modal title={t('You’re ready to learn offline')} onClose={() => setModal(null)}><div className="offline-modal"><span className="offline-modal-icon"><WifiOff size={32} /></span><p>{t('Downloaded lessons, mini-videos, worksheets, and assignments still work. Connect at a trusted hub when you are ready to send {count} queued items.', { count: syncQueue.pendingCount })}</p><div className="offline-hub-row"><MapPin size={20} /><div><strong>Riverside Community Center</strong><span>0.6 {t('miles')} · {t('Open until 6:00 PM')}</span></div></div><div className="form-actions"><Button variant="quiet" onClick={() => setModal(null)}>{t('Keep learning')}</Button><Button icon={RefreshCw} onClick={() => { connectivity.setDemoMode('auto'); setModal(null) }}>{t('Use real connection')}</Button></div></div></Modal> : null}

      {modal === 'clear' ? <Modal title={t('Remove downloaded lessons?')} onClose={() => setModal(null)}><div className="confirm-modal"><span><CheckCircle2 size={26} /></span><p>All locally cached lesson packages will be removed. Progress, completed work, family profiles, settings, and queued activity stay safe.</p><div className="form-actions"><Button variant="quiet" onClick={() => setModal(null)}>{t('Cancel')}</Button><Button variant="danger" onClick={confirmClearDownloads}>{t('Remove downloads')}</Button></div></div></Modal> : null}
    </>
  )
}
