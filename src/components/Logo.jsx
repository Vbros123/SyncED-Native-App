export default function Logo({ compact = false }) {
  return (
    <span className={`synced-logo ${compact ? 'logo-compact' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 44 44" role="img">
        <path d="M9 14.5 22 8l13 6.5L22 21 9 14.5Z" fill="currentColor" />
        <path d="M13 19.5v8.2c0 3.8 4.1 6.8 9 6.8s9-3 9-6.8v-8.2L22 24l-9-4.5Z" fill="currentColor" opacity=".72" />
        <path d="M35 16v10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="35" cy="28.5" r="2.2" fill="currentColor" />
      </svg>
      {!compact ? <strong>Sync<span>ED</span></strong> : null}
    </span>
  )
}
