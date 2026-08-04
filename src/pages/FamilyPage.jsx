import { BookOpenCheck, CalendarCheck, Check, CheckCircle2, ChevronRight, Globe2, Languages, Mail, Play, ShieldCheck, Users, Video } from 'lucide-react'
import { Button, Progress } from '../components/UI.jsx'
import { useI18n } from '../i18n.jsx'

const familyLessons = [
  { id: 'video', title: 'Join a parent–teacher video call', category: 'School tools', time: '10 min', icon: Video, color: 'purple' },
  { id: 'messages', title: 'Read and reply to school messages', category: 'Communication', time: '12 min', icon: Mail, color: 'coral' },
  { id: 'safety', title: 'Help your family stay safe online', category: 'Online safety', time: '15 min', icon: ShieldCheck, color: 'blue' },
]

export default function FamilyPage({ state, onStartFamilyLesson, onCompleteFamilyActivity, onShowToast }) {
  const { t, language, setLanguage, locale } = useI18n()
  return (
    <div className="page-stack family-page">
      <div className="page-heading split-heading">
        <div><p className="context-line">{t('Learn together at home')}</p><h1>{t('Family learning')}</h1><p>{t(state.settings.plainLanguage ? 'Short guides help families use school tools together.' : 'Simple multilingual guides help every person in the household support school success.')}</p></div>
        <button className="family-language" onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}><Languages size={22} /><div><strong>{t('Learning in {language}', { language: locale.label })}</strong><span>{t('Select to switch between English and Spanish')}</span></div><ChevronRight size={18} /></button>
      </div>

      <section className="family-hero-panel">
        <div className="family-hero-copy"><span className="small-label"><Users size={14} />{t('This week’s family goal')}</span><h2>{t('Learn one small skill together')}</h2><p>{t('Complete five activities as a household. Each person’s progress is saved on this device.')}</p><div className="family-goal-bar"><Progress value={(state.familyActivities / 5) * 100} color="green" /><strong>{t('{count} of 5 activities', { count: state.familyActivities })}</strong></div></div>
        <div className="family-orbit"><span className="family-avatar family-avatar-main">M</span><span className="family-avatar family-avatar-two">A</span><span className="family-avatar family-avatar-three">J</span><span className="orbit-center"><Users size={23} /></span></div>
      </section>

      <div className="family-layout">
        <section className="panel family-members">
          <div className="section-heading"><div><h2>{t('Household progress')}</h2><p>{t('Private to this family device')}</p></div><Users size={21} /></div>
          <div className="member-row"><span className="avatar avatar-maya">M</span><div><h3>Maya</h3><p>{t('Student · 4-day streak')}</p><Progress value={68} /></div><strong>68%</strong></div>
          <div className="member-row"><span className="avatar avatar-adult">A</span><div><h3>Ana</h3><p>{t('Parent · Learning in Spanish')}</p><Progress value={42} color="green" /></div><strong>42%</strong></div>
          <div className="member-row"><span className="avatar avatar-young">J</span><div><h3>Jay</h3><p>{t('Student · 2-day streak')}</p><Progress value={31} color="blue" /></div><strong>31%</strong></div>
          <button className="add-family-member" onClick={() => onShowToast(t('Family profile setup opened. This prototype keeps new profiles on this device.'))}>+ {t('Add a family learner')}</button>
        </section>

        <section className="panel family-week">
          <div className="section-heading"><div><h2>{t('Family activity')}</h2><p>{t('About 10 minutes')}</p></div><CalendarCheck size={21} /></div>
          <div className="family-activity-art"><BookOpenCheck size={42} /><span><Globe2 size={18} /></span></div><p className="context-line">{t('Try it together')}</p><h3>{t('Find one trusted school website')}</h3><p>{t('Practice checking the web address, finding contact details, and saving the page for later.')}</p>
          <div className="family-checklist"><span><Check size={15} />{t('Open the official school page')}</span><span><Check size={15} />{t('Find the family resources section')}</span><span><Check size={15} />{t('Save it as a bookmark')}</span></div>
          <Button icon={state.familyActivityDone ? CheckCircle2 : Play} variant={state.familyActivityDone ? 'quiet' : 'primary'} onClick={onCompleteFamilyActivity}>{state.familyActivityDone ? t('Completed together') : t('Start together')}</Button>
        </section>
      </div>

      <section className="family-guides">
        <div className="list-intro"><div><h2>{t('Guides for parents and caregivers')}</h2><p>{t('Downloaded and available in every supported language.')}</p></div><button onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}><Languages size={17} />{language === 'es' ? t('View in English') : t('View in Spanish')}</button></div>
        <div className="family-guide-list">{familyLessons.map((lesson) => { const Icon = lesson.icon; return <article key={lesson.id}><span className={`guide-icon skill-color-${lesson.color}`}><Icon size={23} /></span><div><small>{t(lesson.category)}</small><h3>{t(lesson.title)}</h3><span>{t(lesson.time)} · {t('Plain language')}</span></div><Button variant="secondary" onClick={() => onStartFamilyLesson(lesson.id)}>{t('Start guide')}</Button></article> })}</div>
      </section>
    </div>
  )
}
