import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  HardDrive,
  History,
  RotateCcw,
  ShieldCheck,
  Tag,
  User,
} from 'lucide-react'
import { fetchVersions, downloadFileVersion } from '../services/api'
import { formatBytes, formatDate, formatRelativeTime } from '../utils/formatters'

export default function VersionHistoryPage({
  files,
  selectedFileKey,
  onSelectFileKey,
  onNavigateToRecovery,
  onNavigateToFiles,
}) {
  const currentKey = selectedFileKey || (files[0]?.key || '')
  const [versions, setVersions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [copiedVersionId, setCopiedVersionId] = useState(null)
  const [downloadingVerId, setDownloadingVerId] = useState(null)
  const [notification, setNotification] = useState(null)

  // Fetch versions whenever currentKey changes
  useEffect(() => {
    if (!currentKey) return
    let isMounted = true

    async function loadVersions() {
      setIsLoading(true)
      try {
        const res = await fetchVersions(currentKey)
        if (isMounted) {
          setVersions(res.versions || [])
        }
      } catch (err) {
        console.error('Error fetching version history:', err)
        if (isMounted) setVersions([])
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadVersions()
    return () => { isMounted = false }
  }, [currentKey])

  const selectedFile = files.find(f => f.key === currentKey)

  // Copy version ID to clipboard
  const handleCopyVersionId = (versionId) => {
    navigator.clipboard.writeText(versionId)
    setCopiedVersionId(versionId)
    setTimeout(() => setCopiedVersionId(null), 2000)
  }

  // Handle version download
  const handleDownloadVersion = async (versionId) => {
    setDownloadingVerId(versionId)
    try {
      const res = await downloadFileVersion(currentKey, versionId)
      setNotification({
        type: 'success',
        message: res.isDemo
          ? `Downloaded demo file for version ${versionId.substring(0, 10)}...`
          : `Initiated download for version ${versionId.substring(0, 10)}...`,
      })
      setTimeout(() => setNotification(null), 4000)
    } catch (err) {
      setNotification({
        type: 'error',
        message: `Download failed: ${err.message}`,
      })
      setTimeout(() => setNotification(null), 4000)
    } finally {
      setDownloadingVerId(null)
    }
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">S3 Object Version History</h1>
          <p className="page-subtitle">
            Inspect all immutable historical snapshots stored in AWS S3 for continuous disaster recovery auditing.
          </p>
        </div>
        <div className="page-header-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onNavigateToFiles}
          >
            <ArrowLeft size={15} />
            <span>Back to All Files</span>
          </button>
        </div>
      </div>

      {/* Notification banner */}
      {notification && (
        <div className={`action-notice notice-${notification.type}`}>
          <CheckCircle2 size={16} />
          <span>{notification.message}</span>
        </div>
      )}

      {/* File Selector & Summary Card */}
      <div className="content-card mb-4">
        <div className="card-header file-selector-header">
          <div className="file-selector-control">
            <label className="selector-label" htmlFor="fileKeySelect">
              <HardDrive size={16} />
              <span>Select Object Key:</span>
            </label>
            <select
              id="fileKeySelect"
              className="form-control selector-select font-mono"
              value={currentKey}
              onChange={(e) => {
                if (onSelectFileKey) onSelectFileKey(e.target.value)
              }}
            >
              {files.map((file) => (
                <option key={file.key} value={file.key}>
                  {file.name} ({file.key})
                </option>
              ))}
            </select>
          </div>

          {selectedFile && (
            <div className="file-meta-pills">
              <span className="meta-pill">
                <strong>Category:</strong> {selectedFile.category || 'General'}
              </span>
              <span className="meta-pill">
                <strong>Storage:</strong> {selectedFile.storageClass || 'STANDARD'}
              </span>
              <span className="meta-pill">
                <strong>Total Revisions:</strong> {versions.length}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Educational Architecture Callout */}
      <div className="architecture-callout">
        <ShieldCheck size={20} className="callout-icon" />
        <div className="callout-text">
          <span className="callout-title">AWS S3 Object Versioning Mechanics:</span>
          <span>
            Each write or update to this S3 key generates a cryptographically unique <code>VersionId</code>. Historical revisions are retained until explicitly expired by S3 Lifecycle rules. Restoring an older snapshot creates a <em>new current version</em> without deleting previous records.
          </span>
        </div>
      </div>

      {/* Versions Timeline List */}
      <div className="versions-timeline-container">
        {isLoading ? (
          <div className="loading-state-card">
            <div className="spinner" />
            <p className="loading-text">Loading S3 version tree from vault...</p>
          </div>
        ) : versions.length === 0 ? (
          <div className="empty-state-card">
            <History size={36} className="empty-icon" />
            <h4 className="empty-title">No Version Records Found</h4>
            <p className="empty-desc">
              No version history was returned for this key. Verify S3 Versioning status in System Status.
            </p>
          </div>
        ) : (
          <div className="version-cards-stack">
            {versions.map((ver, idx) => {
              const isCurrent = ver.isLatest === true || idx === 0
              return (
                <div
                  key={ver.versionId}
                  className={`version-card ${isCurrent ? 'version-card-current' : 'version-card-historical'}`}
                >
                  {/* Left Column: Version Indicator Badge */}
                  <div className="version-status-col">
                    {isCurrent ? (
                      <div className="version-indicator-current">
                        <span className="indicator-dot" />
                        <span className="indicator-label">CURRENT ACTIVE</span>
                      </div>
                    ) : (
                      <div className="version-indicator-historical">
                        <span className="indicator-label">REVISION #{versions.length - idx}</span>
                      </div>
                    )}
                    <span className="version-date-rel">
                      {formatRelativeTime(ver.lastModified)}
                    </span>
                  </div>

                  {/* Center Column: Metadata */}
                  <div className="version-details-col">
                    <div className="version-id-row">
                      <span className="version-id-label">S3 Version ID:</span>
                      <code className="version-id-code font-mono">
                        {ver.versionId}
                      </code>
                      <button
                        type="button"
                        className="btn-copy-id"
                        onClick={() => handleCopyVersionId(ver.versionId)}
                        title="Copy full Version ID"
                      >
                        {copiedVersionId === ver.versionId ? (
                          <Check size={13} className="text-success" />
                        ) : (
                          <Copy size={13} />
                        )}
                        <span>{copiedVersionId === ver.versionId ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    {ver.note && (
                      <div className="version-note">
                        <Tag size={13} className="note-icon" />
                        <span>{ver.note}</span>
                      </div>
                    )}

                    <div className="version-meta-grid">
                      <div className="ver-meta-item">
                        <Clock size={13} />
                        <span><strong>Timestamp:</strong> {formatDate(ver.lastModified)}</span>
                      </div>
                      <div className="ver-meta-item">
                        <HardDrive size={13} />
                        <span><strong>Size:</strong> {formatBytes(ver.size)}</span>
                      </div>
                      {ver.author && (
                        <div className="ver-meta-item">
                          <User size={13} />
                          <span><strong>Author:</strong> {ver.author}</span>
                        </div>
                      )}
                      {ver.etag && (
                        <div className="ver-meta-item">
                          <span className="ver-etag-label">ETag:</span>
                          <span className="font-mono text-muted">{ver.etag}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="version-actions-col">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleDownloadVersion(ver.versionId)}
                      disabled={downloadingVerId === ver.versionId}
                      title="Download this specific snapshot"
                    >
                      <Download size={14} />
                      <span>{downloadingVerId === ver.versionId ? 'Downloading...' : 'Download'}</span>
                    </button>

                    {isCurrent ? (
                      <span className="current-badge-pill">
                        <CheckCircle2 size={13} />
                        <span>Live Head</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm btn-restore-trigger"
                        onClick={() => onNavigateToRecovery(currentKey, ver.versionId)}
                        title="Prepare non-destructive restoration to head"
                      >
                        <RotateCcw size={14} />
                        <span>Restore This</span>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
