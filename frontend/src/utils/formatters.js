/**
 * Formatting utilities for CloudShield
 */

export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export function formatDate(isoString) {
  if (!isoString) return 'N/A'
  try {
    const d = new Date(isoString)
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
  } catch {
    return isoString
  }
}

export function formatRelativeTime(isoString) {
  if (!isoString) return ''
  try {
    const now = new Date()
    const past = new Date(isoString)
    const diffMs = now - past
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHour = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHour / 24)

    if (diffSec < 60) return 'Just now'
    if (diffMin < 60) return `${diffMin}m ago`
    if (diffHour < 24) return `${diffHour}h ago`
    return `${diffDay}d ago`
  } catch {
    return ''
  }
}

export function truncateKey(key, maxLength = 32) {
  if (!key) return ''
  if (key.length <= maxLength) return key
  const parts = key.split('/')
  if (parts.length > 1) {
    const filename = parts.pop()
    const prefix = parts.join('/')
    if (filename.length > maxLength - 6) {
      return `${prefix}/...${filename.substring(filename.length - (maxLength - 10))}`
    }
    return `${prefix.substring(0, 8)}.../${filename}`
  }
  return `${key.substring(0, maxLength - 3)}...`
}
