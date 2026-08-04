import {
  Bus,
  Check,
  Clock3,
  ExternalLink,
  Filter,
  Laptop,
  LocateFixed,
  Mail,
  MapPin,
  Navigation,
  Search,
  ShieldCheck,
  Smartphone,
  Wifi,
  Wrench,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button, Modal } from '../components/UI.jsx'
import { devicePrograms, hubs } from '../data.js'
import { useI18n } from '../i18n.jsx'

function DeviceRequest({ program, existingRequest, onClose, onSubmit }) {
  const { t } = useI18n()
  const [name, setName] = useState('Maya Johnson')
  const [email, setEmail] = useState('')
  const [school, setSchool] = useState('Jefferson Middle School')
  const [need, setNeed] = useState('I need a device I can use for schoolwork at home.')
  if (existingRequest) {
    return (
      <div className="request-success">
        <span><Check size={30} strokeWidth={3} /></span><h3>{t('Request received')}</h3><p>{t('Your request is saved on this device. Updates will be sent to {email} after the next secure sync.', { email: existingRequest.email })}</p>
        <div><small>{t('Status')}</small><strong>{t(existingRequest.status)}</strong><span>{t('Reference {reference}', { reference: existingRequest.reference })}</span></div>
        <Button onClick={onClose}>{t('Done')}</Button>
      </div>
    )
  }
  return (
    <form className="device-form" onSubmit={(event) => { event.preventDefault(); onSubmit(program.id, { name, email, school, need }) }}>
      <div className="program-summary"><program.icon size={25} /><div><strong>{t(program.title)}</strong><span>{t(program.partner)}</span></div></div>
      <p>{t('This prototype saves the request on this device. A participating school or community partner reviews eligibility after sync; families do not upload income documents here.')}</p>
      <label>{t('Student or family name')}<input required value={name} onChange={(event) => setName(event.target.value)} /></label>
      <label>{t('Email for request updates')}<span className="input-with-icon"><Mail size={16} /><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" /></span></label>
      <label>{t('School or community partner')}<input required value={school} onChange={(event) => setSchool(event.target.value)} /></label>
      <label>{t('What support would help?')}<textarea required value={need} onChange={(event) => setNeed(event.target.value)} rows="3" /></label>
      <label className="consent-check"><input type="checkbox" required /><span>{t('I agree that this contact information can be shared with the selected school or community partner for this request.')}</span></label>
      <div className="form-actions"><Button type="button" variant="quiet" onClick={onClose}>{t('Cancel')}</Button><Button type="submit">{t('Save request')}</Button></div>
    </form>
  )
}

export default function HubsPage({ state, online, onSubmitDeviceRequest, onShowToast }) {
  const { t } = useI18n()
  const [tab, setTab] = useState('hubs')
  const [query, setQuery] = useState('')
  const [selectedHub, setSelectedHub] = useState(1)
  const [requestProgram, setRequestProgram] = useState(null)
  const [serviceFilter, setServiceFilter] = useState('All services')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [locating, setLocating] = useState(false)
  const services = ['All services', 'Wi-Fi & sync', 'Device support', 'Learning space', 'Printing']

  const visibleHubs = useMemo(() => hubs.filter((hub) => {
    const haystack = `${hub.name} ${hub.type} ${hub.address} ${hub.city} ${hub.zip} ${hub.services.join(' ')}`.toLowerCase()
    const matchesQuery = haystack.includes(query.toLowerCase())
    const matchesService = serviceFilter === 'All services' || hub.services.some((service) => service === serviceFilter || (serviceFilter === 'Device support' && /Device/.test(service)))
    return matchesQuery && matchesService
  }), [query, serviceFilter])
  const selected = hubs.find((hub) => hub.id === selectedHub) || hubs[0]

  const useLocation = () => {
    setLocating(true)
    if (!navigator.geolocation) {
      setLocating(false)
      onShowToast(t('Location is not available on this device. Enter a city or ZIP code instead.'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      () => { setQuery('Detroit'); setSelectedHub(1); setLocating(false); onShowToast(t('Location found. Showing the closest demo hubs.')) },
      () => { setLocating(false); onShowToast(t('Location was not shared. You can still search by city or ZIP code.')) },
      { enableHighAccuracy: false, timeout: 8000 },
    )
  }

  const openDirections = (hub) => {
    if (!online) {
      onShowToast(t('Directions need internet. The address is saved so you can copy it later.'))
      return
    }
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${hub.address}, ${hub.city}, MI ${hub.zip}`)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="page-stack hubs-page">
      <div className="page-heading split-heading">
        <div><p className="context-line">{t('Access support near you')}</p><h1>{t('Community access')}</h1><p>{t(state.settings.plainLanguage ? 'Find a safe place for Wi-Fi, learning, or device help.' : 'Find trusted places to sync, learn, repair a device, or request technology support.')}</p></div>
        <div className="hub-availability"><span><Wifi size={22} /></span><div><strong>{t('{count} hubs nearby', { count: visibleHubs.length })}</strong><p>{t('Closest is 0.6 miles away')}</p></div></div>
      </div>

      <div className="wide-tabs">
        <button className={tab === 'hubs' ? 'active' : ''} onClick={() => setTab('hubs')}><MapPin size={17} />{t('Wi-Fi & learning hubs')}</button>
        <button className={tab === 'devices' ? 'active' : ''} onClick={() => setTab('devices')}><Smartphone size={17} />{t('Device support')}</button>
      </div>

      {tab === 'hubs' ? (
        <div className="hubs-layout">
          <section className="hub-results">
            <div className="hub-search-row"><label className="search-control"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('Enter city, ZIP code, hub, or service')} /></label><button onClick={useLocation} disabled={locating}><LocateFixed size={17} />{locating ? t('Locating…') : t('Use my location')}</button><button onClick={() => setFiltersOpen(!filtersOpen)}><Filter size={17} />{t('Filters')}</button></div>
            {filtersOpen ? <div className="hub-filter-row">{services.map((service) => <button className={serviceFilter === service ? 'active' : ''} key={service} onClick={() => setServiceFilter(service)}>{t(service)}</button>)}</div> : null}
            <p className="results-count">{t('{count} trusted locations', { count: visibleHubs.length })}</p>
            <div className="hub-result-list">
              {visibleHubs.map((hub) => (
                <button className={`hub-result ${selectedHub === hub.id ? 'selected' : ''}`} key={hub.id} onClick={() => setSelectedHub(hub.id)}>
                  <span className="hub-result-icon"><MapPin size={21} /></span>
                  <div><small>{t(hub.type)}</small><h3>{hub.name}</h3><p>{hub.address}, {hub.city} {hub.zip}</p><span className="hub-open"><Clock3 size={14} />{t(hub.hours)}</span><div className="service-tags">{hub.services.slice(0, 2).map((service) => <em key={service}>{t(service)}</em>)}</div></div>
                  <strong>{hub.distance} {t('mi')}</strong>
                </button>
              ))}
            </div>
          </section>
          <section className="community-map" aria-label={t('Map of community hubs')}>
            <div className="map-road road-one" /><div className="map-road road-two" /><div className="map-road road-three" /><span className="map-water" />
            {visibleHubs.map((hub) => <button key={hub.id} aria-label={hub.name} onClick={() => setSelectedHub(hub.id)} className={`map-marker ${selectedHub === hub.id ? 'active' : ''}`} style={{ left: `${hub.x}%`, top: `${hub.y}%` }}><MapPin size={20} /></button>)}
            <span className="you-marker"><span />{t('You')}</span>
            <div className="map-detail">
              <div><small>{t(selected.type)}</small><h3>{selected.name}</h3><p>{selected.distance} {t('mi')} · {t(selected.walk)}</p></div>
              <span className="open-now">{t('Open now')}</span>
              <div className="map-services">{selected.services.map((service) => <span key={service}>{service === 'Wi-Fi & sync' ? <Wifi size={14} /> : service.includes('repair') || service.includes('support') ? <Wrench size={14} /> : <Laptop size={14} />}{t(service)}</span>)}</div>
              <div className="map-actions"><Button icon={Navigation} onClick={() => openDirections(selected)}>{t('Directions')}</Button><Button variant="secondary" icon={Bus} onClick={() => onShowToast(t('Transit details saved: {walk}.', { walk: t(selected.walk) }))}>{t('Transit')}</Button></div>
            </div>
          </section>
        </div>
      ) : (
        <section className="device-support-layout">
          <div className="device-intro">
            <p className="context-line">{t('No device? Start here.')}</p><h2>{t('One request, trusted local partners')}</h2><p>{t('SyncED is designed to work with school districts, libraries, and community organizations. A partner confirms eligibility using programs it already manages, so the app does not collect family income documents.')}</p>
            <div className="eligibility-note"><ShieldCheck size={21} /><div><strong>{t('Privacy-first eligibility')}</strong><span>{t('School referral, existing program eligibility, or partner review—not a public income score.')}</span></div></div>
            <div className="device-steps"><span><b>1</b>{t('Choose support')}</span><i /><span><b>2</b>{t('Add an email for updates')}</span><i /><span><b>3</b>{t('Partner follows up')}</span></div>
          </div>
          <div className="device-program-list">
            {devicePrograms.map((program) => {
              const Icon = program.icon
              const requested = state.deviceRequests[program.id]
              return (
                <article className="device-program" key={program.id}>
                  <span className="device-program-icon"><Icon size={27} /></span>
                  <div><small>{t(program.partner)}</small><h3>{t(program.title)}</h3><p>{t(program.description)}</p><em>{requested ? <><Check size={14} /> {t(requested.status)}</> : t(program.availability)}</em></div>
                  <Button variant={requested ? 'quiet' : 'secondary'} icon={requested ? Check : ExternalLink} onClick={() => setRequestProgram(program.id)}>{requested ? t('View request') : t('Request support')}</Button>
                </article>
              )
            })}
          </div>
        </section>
      )}

      {requestProgram ? <Modal title={t('Request device support')} eyebrow={t('Saved securely on this device')} onClose={() => setRequestProgram(null)}><DeviceRequest program={devicePrograms.find((program) => program.id === requestProgram)} existingRequest={state.deviceRequests[requestProgram]} onClose={() => setRequestProgram(null)} onSubmit={(id, details) => onSubmitDeviceRequest(id, details)} /></Modal> : null}
    </div>
  )
}
