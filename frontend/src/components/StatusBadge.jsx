export default function StatusBadge({ type, label, size = 'md' }) {
  let badgeClass = 'badge-neutral'
  const normalized = (type || label || '').toLowerCase()

  if (
    normalized.includes('protect') ||
    normalized.includes('online') ||
    normalized.includes('active') ||
    normalized.includes('latest') ||
    normalized.includes('success') ||
    normalized.includes('enabled')
  ) {
    badgeClass = 'badge-success'
  } else if (
    normalized.includes('demo') ||
    normalized.includes('warn') ||
    normalized.includes('pending')
  ) {
    badgeClass = 'badge-warning'
  } else if (
    normalized.includes('fail') ||
    normalized.includes('error') ||
    normalized.includes('offline') ||
    normalized.includes('deleted')
  ) {
    badgeClass = 'badge-danger'
  } else if (
    normalized.includes('standard') ||
    normalized.includes('tiering') ||
    normalized.includes('aws') ||
    normalized.includes('s3')
  ) {
    badgeClass = 'badge-blue'
  }

  return (
    <span className={`status-badge ${badgeClass} badge-${size}`}>
      <span className="badge-dot" />
      {label || type}
    </span>
  )
}
