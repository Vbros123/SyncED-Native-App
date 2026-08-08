import {
  Backpack,
  Check,
  CircleOff,
  Gift,
  GraduationCap,
  Headphones,
  Lock,
  Medal,
  Palette,
  ShieldCheck,
  Smile,
  Sparkles,
  Target,
  Trophy,
  Users,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import { achievements, leaderboard } from '../data.js'
import { useI18n } from '../i18n.jsx'
import { Progress } from '../components/UI.jsx'

const defaultMascot = {
  headwear: 'cap',
  accessory: 'none',
  faceColor: 'ocean',
  bodyColor: 'blue',
  expression: 'happy',
}

const gearOptions = [
  { id: 'none', slot: 'headwear', title: 'No headgear', cost: 0, icon: CircleOff },
  { id: 'cap', slot: 'headwear', title: 'Scholar cap', cost: 100, icon: GraduationCap },
  { id: 'headphones', slot: 'headwear', title: 'Focus headphones', cost: 200, icon: Headphones },
  { id: 'none', slot: 'accessory', title: 'No accessory', cost: 0, icon: CircleOff },
  { id: 'medal', slot: 'accessory', title: 'Star medal', cost: 150, icon: Medal },
  { id: 'backpack', slot: 'accessory', title: 'Explorer backpack', cost: 300, icon: Backpack },
]

const faceColors = [
  { id: 'ocean', title: 'Ocean blue', main: '#2b75ee', secondary: '#6b57d7' },
  { id: 'cosmic', title: 'Cosmic purple', main: '#8159dc', secondary: '#cf69c7' },
  { id: 'mint', title: 'Mint green', main: '#18a56a', secondary: '#36c7a0' },
  { id: 'sunset', title: 'Sunset coral', main: '#ef6b61', secondary: '#f59c62' },
]

const bodyColors = [
  { id: 'blue', title: 'Ocean blue', color: '#0757e6' },
  { id: 'purple', title: 'Cosmic purple', color: '#7256d9' },
  { id: 'green', title: 'Mint green', color: '#159a61' },
  { id: 'coral', title: 'Sunset coral', color: '#e8665d' },
]

const moods = [
  { id: 'happy', title: 'Happy', icon: Smile },
  { id: 'excited', title: 'Excited', icon: Zap },
  { id: 'focused', title: 'Focused', icon: Target },
]

export default function RewardsPage({ state, online, onCustomize, onUpdateSetting }) {
  const { t } = useI18n()
  const [customTab, setCustomTab] = useState('gear')
  const mascot = { ...defaultMascot, ...(state.mascot || {}) }
  const level = Math.max(1, Math.floor(state.points / 100) + 1)
  const levelProgress = state.points % 100
  const rows = leaderboard.map((row) => row.current ? { ...row, points: state.points } : row).sort((a, b) => b.points - a.points).map((row, index) => ({ ...row, rank: index + 1 }))

  return (
    <div className="page-stack rewards-page">
      <div className="page-heading split-heading">
        <div><p className="context-line">{t('Every lesson builds something')}</p><h1>{t('Rewards')}</h1><p>{t(state.settings.plainLanguage ? 'Finish lessons. Earn points. Unlock new gear for Nova.' : 'Learning points unlock achievements and upgrades for your companion—without purchases or ads.')}</p></div>
        <div className="points-balance"><Sparkles size={22} /><div><strong>{state.points}</strong><span>{t('learning points')}</span></div></div>
      </div>

      <section className="reward-hero">
        <div className={`nova-stage nova-headwear-${mascot.headwear} nova-accessory-${mascot.accessory} nova-face-${mascot.faceColor} nova-body-${mascot.bodyColor} nova-expression-${mascot.expression}`}>
          <span className="nova-glow" />
          <div className="nova-character" role="img" aria-label={t('Customized Nova character')}>
            {mascot.accessory === 'backpack' ? <span className="nova-item nova-backpack" aria-hidden="true"><Backpack /></span> : null}
            <span className="nova-antenna"><i /></span>
            <span className="nova-face"><i /><i /><b /></span>
            <span className="nova-arm nova-arm-left" />
            <span className="nova-arm nova-arm-right" />
            <span className="nova-body"><Sparkles size={24} /></span>
            <span className="nova-foot nova-foot-left" />
            <span className="nova-foot nova-foot-right" />
            {mascot.headwear === 'cap' ? <GraduationCap className="nova-item nova-cap" /> : null}
            {mascot.headwear === 'headphones' ? <Headphones className="nova-item nova-headphones" /> : null}
            {mascot.accessory === 'medal' ? <Medal className="nova-item nova-medal" /> : null}
          </div>
        </div>

        <div className="reward-hero-copy">
          <span className="small-label"><Gift size={14} />{t('Your learning companion')}</span>
          <h2>{t('Nova · Level {level}', { level })}</h2>
          <p>{t('Nova grows as you finish real learning activities. Points cannot be bought and have no cash value.')}</p>
          <div className="level-progress"><div><span>{t('Level {level}', { level })}</span><strong>{t('{count} points to next level', { count: 100 - levelProgress })}</strong></div><Progress value={levelProgress} color="green" /></div>

          <section className="nova-customizer">
            <div className="customizer-heading"><div><Palette size={19} /><strong>{t('Customize Nova')}</strong></div><span>{t('Saved on this device')}</span></div>
            <div className="customizer-tabs" role="tablist" aria-label={t('Customize Nova')}>
              {[
                ['gear', 'Gear', Gift],
                ['colors', 'Colors', Palette],
                ['mood', 'Mood', Smile],
              ].map(([id, label, Icon]) => <button role="tab" aria-selected={customTab === id} className={customTab === id ? 'active' : ''} onClick={() => setCustomTab(id)} key={id}><Icon size={16} />{t(label)}</button>)}
            </div>

            {customTab === 'gear' ? (
              <div className="custom-gear-grid">
                {gearOptions.map((option) => {
                  const Icon = option.icon
                  const unlocked = state.points >= option.cost
                  const equipped = mascot[option.slot] === option.id
                  return (
                    <button
                      className={`${equipped ? 'selected' : ''} ${!unlocked ? 'locked' : ''}`}
                      disabled={!unlocked}
                      key={`${option.slot}-${option.id}`}
                      onClick={() => onCustomize(option.slot, option.id)}
                    >
                      <span><Icon size={21} /></span>
                      <strong>{t(option.title)}</strong>
                      <small>{equipped ? t('Equipped') : option.cost === 0 ? t('Free') : unlocked ? t('Equip') : t('Unlock at {count} points', { count: option.cost })}</small>
                      {equipped ? <Check size={16} /> : !unlocked ? <Lock size={14} /> : null}
                    </button>
                  )
                })}
              </div>
            ) : null}

            {customTab === 'colors' ? (
              <div className="custom-color-groups">
                <div><strong>{t('Face color')}</strong><div>{faceColors.map((option) => <button className={mascot.faceColor === option.id ? 'selected' : ''} aria-label={t('Choose {item}', { item: t(option.title) })} onClick={() => onCustomize('faceColor', option.id)} key={option.id} style={{ '--swatch-main': option.main, '--swatch-secondary': option.secondary }}><span />{mascot.faceColor === option.id ? <Check size={15} /> : null}</button>)}</div></div>
                <div><strong>{t('Body color')}</strong><div>{bodyColors.map((option) => <button className={mascot.bodyColor === option.id ? 'selected' : ''} aria-label={t('Choose {item}', { item: t(option.title) })} onClick={() => onCustomize('bodyColor', option.id)} key={option.id} style={{ '--swatch-main': option.color, '--swatch-secondary': option.color }}><span />{mascot.bodyColor === option.id ? <Check size={15} /> : null}</button>)}</div></div>
              </div>
            ) : null}

            {customTab === 'mood' ? (
              <div className="custom-mood-grid">
                {moods.map((mood) => {
                  const Icon = mood.icon
                  const selected = mascot.expression === mood.id
                  return <button className={selected ? 'selected' : ''} onClick={() => onCustomize('expression', mood.id)} key={mood.id}><Icon size={21} /><span>{t(mood.title)}</span>{selected ? <Check size={15} /> : null}</button>
                })}
              </div>
            ) : null}
          </section>
        </div>
      </section>

      <div className="rewards-grid">
        <section className="panel achievement-panel">
          <div className="section-heading"><div><h2>{t('Achievements')}</h2><p>{t('Milestones earned through completed learning.')}</p></div><Medal size={22} /></div>
          <div className="achievement-grid">
            {achievements.map((achievement) => {
              const Icon = achievement.icon
              const earned = state.points >= achievement.threshold
              return <article className={earned ? 'earned' : ''} key={achievement.id}><span>{earned ? <Icon size={24} /> : <Lock size={20} />}</span><div><strong>{t(achievement.title)}</strong><p>{t(achievement.description)}</p><small>{earned ? t('Earned') : t('{count}/{target} points', { count: state.points, target: achievement.threshold })}</small></div></article>
            })}
          </div>
        </section>

        <section className="panel leaderboard-panel">
          <div className="section-heading"><div><h2>{t('Community leaderboard')}</h2><p>{online ? t('Pilot-wide learning points · updated now') : t('Cached snapshot · connect to refresh')}</p></div><Trophy size={22} /></div>
          <div className="leaderboard-privacy"><ShieldCheck size={17} /><span>{t('Only a first name and last initial appear. Families can hide their row at any time.')}</span><button role="switch" aria-checked={state.settings.leaderboardVisible} className={`toggle ${state.settings.leaderboardVisible ? 'on' : ''}`} onClick={() => onUpdateSetting('leaderboardVisible', !state.settings.leaderboardVisible)}><span /></button></div>
          <div className="leaderboard-list">
            {rows.map((row) => row.current && !state.settings.leaderboardVisible ? null : (
              <div className={row.current ? 'leaderboard-row current' : 'leaderboard-row'} key={row.name}><strong>{row.rank}</strong><span className="leader-avatar">{row.name[0]}</span><div><b>{row.name}</b><small>{row.city}</small></div><em>{row.points} {t('pts')}</em></div>
            ))}
          </div>
          {!state.settings.leaderboardVisible ? <div className="leaderboard-hidden"><Users size={22} /><strong>{t('Your row is hidden')}</strong><p>{t('Your points still count toward achievements on this device.')}</p></div> : null}
        </section>
      </div>
    </div>
  )
}
