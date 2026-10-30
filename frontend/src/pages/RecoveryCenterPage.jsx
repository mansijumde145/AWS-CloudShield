import { useEffect, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Layers,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react'
import ConfirmModal from '../components/ConfirmModal'
import StatusBadge from '../components/StatusBadge'
import { fetchVersions, restoreFileVersion } from '../services/api'
import { formatBytes, formatDate } from '../utils/formatters'

export default function RecoveryCenterPage({
  files,
  preselectedKey,
  preselectedVersionId,
  onNavigateToVersions,
  onRefreshFiles,
}) {
  const [userSelectedKey, setUserSelectedKey] = useState(null)
  const selectedKey = userSelectedKey !== null ? userSelectedKey : (preselectedKey || (files[0]?.key || ''))
  const [versions, setVersions] = useState([])
  const [selectedVersionId, setSelectedVersionId] = useState(preselectedVersionId || '')
  const [isLoadingVersions, setIsLoadingVersions] = useState(false)
  const [isConfirmedCheckbox, setIsConfirmedCheckbox] = useState(false)

  // Execution states
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [restoreResult, setRestoreResult] = useState(null)
  const [restoreError, setRestoreError] = useState(null)


  // Load versions for selected key
  useEffect(() => {
    if (!selectedKey) return
    let isMounted = true

    async function loadKeyVersions() {
      setIsLoadingVersions(true)
      setRestoreResult(null)
      setRestoreError(null)
      try {
        const res = await fetchVersions(selectedKey)
        if (isMounted) {
          const list = res.versions || []
          setVersions(list)
          // Default to the first historical version if not specified
          if (preselectedVersionId && list.some(v => v.versionId === preselectedVersionId)) {
            setSelectedVersionId(preselectedVersionId)
          } else {
            const historical = list.filter(v => !v.isLatest)
            setSelectedVersionId(historical[0]?.versionId || list[1]?.versionId || list[0]?.versionId || '')
          }
        }
      } catch (err) {
        console.error('Error loading versions for recovery:', err)
        if (isMounted) setVersions([])
      } finally {
        if (isMounted) setIsLoadingVersions(false)
      }
    }

    loadKeyVersions()
    return () => { isMounted = false }
  }, [selectedKey, preselectedVersionId])

  // Current version vs Target historical version
  const currentVersion = versions.find(v => v.isLatest) || versions[0]
  const targetVersion = versions.find(v => v.versionId === selectedVersionId)
  const isTargetAlreadyLatest = currentVersion?.versionId === selectedVersionId

  // Calculate RPO rollback span
  let rpoDiffText = 'N/A'
  if (currentVersion?.lastModified && targetVersion?.lastModified) {
    const diffMs = new Date(currentVersion.lastModified) - new Date(targetVersion.lastModified)
    if (diffMs > 0) {
      const hours = Math.floor(diffMs / (1000 * 60 * 60))
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
      rpoDiffText = `${hours}h ${minutes}m rollback span`
    } else {
      rpoDiffText = 'Same time as head'
    }
  }

  // Handle Restore Execution
  const handleExecuteRestore = async () => {
    if (!selectedKey || !selectedVersionId) return

    setIsRestoring(true)
    setRestoreError(null)

    try {
      const res = await restoreFileVersion(selectedKey, selectedVersionId)
      setRestoreResult(res)
      setIsConfirmModalOpen(false)
      if (onRefreshFiles) await onRefreshFiles()

      // Reload versions to reflect new latest
      const updated = await fetchVersions(selectedKey)
      setVersions(updated.versions || [])
      setSelectedVersionId('')
      setIsConfirmedCheckbox(false)
    } catch (err) {
      setRestoreError(err.message || 'Restoration operation failed.')
      setIsConfirmModalOpen(false)
    } finally {
      setIsRestoring(false)
    }
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Disaster Recovery &amp; Restoration Center</h1>
          <p className="page-subtitle">
            Roll back corrupted or compromised cloud objects to an earlier validated snapshot using AWS non-destructive versioning.
          </p>
        </div>
      </div>

      {/* Primary Result Banner if completed */}
      {restoreResult && (
        <div className="restore-success-card">
          <div className="success-icon-wrap">
            <CheckCircle2 size={24} className="text-success" />
          </div>
          <div className="success-content">
            <div className="success-header">
              <h3 className="success-title">Disaster Recovery Restoration Completed!</h3>
              <StatusBadge
                type={restoreResult.isDemo ? 'Demo Mode' : 'Online'}
                label={restoreResult.isDemo ? 'Demo Mode Simulation' : 'Live S3 Restored'}
              />
            </div>
            <p className="success-desc">
              {restoreResult.message}
            </p>
            <div className="success-meta-grid">
              <div className="meta-box">
                <span className="meta-box-label">Object Key:</span>
                <span className="meta-box-val font-mono">{restoreResult.key}</span>
              </div>
              <div className="meta-box">
                <span className="meta-box-label">New Current Version ID:</span>
                <span className="meta-box-val font-mono">{restoreResult.newVersionId}</span>
              </div>
              <div className="meta-box">
                <span className="meta-box-label">Restored At:</span>
                <span className="meta-box-val">{formatDate(restoreResult.timestamp)}</span>
              </div>
            </div>
            <div className="success-actions mt-3">
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => onNavigateToVersions(restoreResult.key)}
              >
                <Layers size={14} />
                <span>View Updated Version History</span>
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setRestoreResult(null)}
              >
                <span>Run Another Drill</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {restoreError && (
        <div className="action-notice notice-error mb-4">
          <AlertCircle size={18} />
          <span>Restoration Error: {restoreError}</span>
        </div>
      )}

      {/* Educational Callout on S3 CopyObject Principle */}
      <div className="content-card educational-banner mb-4">
        <div className="edu-banner-icon">
          <ShieldAlert size={24} />
        </div>
        <div className="edu-banner-body">
          <h4 className="edu-banner-title">
            How CloudShield Restores Objects in AWS S3 (Non-Destructive Principle)
          </h4>
          <p className="edu-banner-text">
            Under the hood, restoring an earlier revision executes an AWS S3 <code>CopyObject</code> call copying the historical snapshot onto the object key. This creates a <strong>brand new current version</strong>.
          </p>
          <div className="edu-pills-row">
            <span className="edu-pill">
              <CheckCircle2 size={13} className="text-success" />
              <strong>No Data Destruction:</strong> Prior versions are never overwritten or deleted.
            </span>
            <span className="edu-pill">
              <CheckCircle2 size={13} className="text-success" />
              <strong>Instant Roll-Forward:</strong> The previous current state remains available for reversal.
            </span>
            <span className="edu-pill">
              <CheckCircle2 size={13} className="text-success" />
              <strong>Audit Trail:</strong> Preserves full cryptographic history for SOC2/ISO compliance.
            </span>
          </div>
        </div>
      </div>

      {/* Main Workflow Form Card */}
      <div className="content-card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Select Object &amp; Historical Snapshot</h3>
            <p className="card-description">
              Choose the target file and the exact point-in-time snapshot to restore as the active workload head.
            </p>
          </div>
        </div>

        <div className="recovery-form-grid">
          {/* Step 1: Choose File */}
          <div className="form-group">
            <label className="form-label" htmlFor="recoveryFileSelect">
              <span className="step-badge">1</span>
              <span>Target File / Key</span>
            </label>
            <select
              id="recoveryFileSelect"
              className="form-control font-mono"
              value={selectedKey}
              onChange={(e) => {
                setUserSelectedKey(e.target.value)
                setSelectedVersionId('')
              }}
              disabled={isRestoring}
            >
              {files.map((f) => (
                <option key={f.key} value={f.key}>
                  {f.name} ({f.key})
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Choose Version */}
          <div className="form-group">
            <label className="form-label" htmlFor="recoveryVersionSelect">
              <span className="step-badge">2</span>
              <span>Historical Snapshot to Restore</span>
            </label>
            <select
              id="recoveryVersionSelect"
              className="form-control font-mono"
              value={selectedVersionId}
              onChange={(e) => setSelectedVersionId(e.target.value)}
              disabled={isRestoring || isLoadingVersions || versions.length === 0}
            >
              {versions.map((ver, idx) => (
                <option key={ver.versionId} value={ver.versionId}>
                  {ver.isLatest ? '★ [CURRENT ACTIVE] ' : `[Snapshot #${versions.length - idx}] `}
                  {formatDate(ver.lastModified)} — {formatBytes(ver.size)} ({ver.versionId.substring(0, 12)}...)
                </option>
              ))}
            </select>
            {isTargetAlreadyLatest && (
              <span className="form-hint text-warning">
                Notice: The selected version is already the active current head. Choose an older snapshot for a rollback drill.
              </span>
            )}
          </div>
        </div>

        {/* Side-by-side Impact Comparison */}
        {currentVersion && targetVersion && (
          <div className="impact-comparison-section">
            <h4 className="section-label">Pre-Restoration State Comparison</h4>
            <div className="comparison-grid">
              {/* Current Live State */}
              <div className="comparison-box box-current">
                <div className="box-header">
                  <span className="box-indicator">CURRENT LIVE STATE</span>
                  <StatusBadge type="Active" label="Active Head" size="sm" />
                </div>
                <div className="box-body">
                  <div className="box-row">
                    <span className="box-row-label">Version ID:</span>
                    <span className="box-row-val font-mono">{currentVersion.versionId.substring(0, 16)}...</span>
                  </div>
                  <div className="box-row">
                    <span className="box-row-label">Timestamp:</span>
                    <span className="box-row-val">{formatDate(currentVersion.lastModified)}</span>
                  </div>
                  <div className="box-row">
                    <span className="box-row-label">Size:</span>
                    <span className="box-row-val font-mono">{formatBytes(currentVersion.size)}</span>
                  </div>
                  <div className="box-row">
                    <span className="box-row-label">Snapshot Note:</span>
                    <span className="box-row-val text-muted">{currentVersion.note || 'Current production head'}</span>
                  </div>
                </div>
              </div>

              {/* Arrow Connector */}
              <div className="comparison-arrow">
                <RotateCcw size={20} className="arrow-icon" />
                <span className="arrow-label">Rollback</span>
              </div>

              {/* Target Recovery State */}
              <div className="comparison-box box-target">
                <div className="box-header">
                  <span className="box-indicator">PROPOSED RECOVERY TARGET</span>
                  <StatusBadge type="Demo" label="Target Snapshot" size="sm" />
                </div>
                <div className="box-body">
                  <div className="box-row">
                    <span className="box-row-label">Version ID:</span>
                    <span className="box-row-val font-mono">{targetVersion.versionId.substring(0, 16)}...</span>
                  </div>
                  <div className="box-row">
                    <span className="box-row-label">Timestamp:</span>
                    <span className="box-row-val">{formatDate(targetVersion.lastModified)}</span>
                  </div>
                  <div className="box-row">
                    <span className="box-row-label">Size:</span>
                    <span className="box-row-val font-mono">{formatBytes(targetVersion.size)}</span>
                  </div>
                  <div className="box-row">
                    <span className="box-row-label">Snapshot Note:</span>
                    <span className="box-row-val text-muted">{targetVersion.note || 'Historical snapshot'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RPO / RTO Metrics Pill */}
            <div className="recovery-metrics-row">
              <div className="rec-metric-pill">
                <Clock size={14} />
                <span><strong>RPO Target Impact:</strong> {rpoDiffText}</span>
              </div>
              <div className="rec-metric-pill">
                <ShieldCheck size={14} />
                <span><strong>Estimated RTO:</strong> &lt; 2.5 seconds (S3 Metadata Copy)</span>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Checkbox & Action Button */}
        <div className="recovery-confirmation-box">
          <label className="checkbox-label" htmlFor="recoveryConfirmCheck">
            <input
              type="checkbox"
              id="recoveryConfirmCheck"
              className="checkbox-input"
              checked={isConfirmedCheckbox}
              onChange={(e) => setIsConfirmedCheckbox(e.target.checked)}
              disabled={isRestoring || isTargetAlreadyLatest}
            />
            <span className="checkbox-text">
              I verify that I want to restore this historical snapshot. I understand this operation creates a new current version in S3 while keeping the complete version history intact.
            </span>
          </label>

          <div className="action-button-row">
            <button
              type="button"
              className="btn btn-primary btn-lg"
              disabled={!isConfirmedCheckbox || isRestoring || isTargetAlreadyLatest}
              onClick={() => setIsConfirmModalOpen(true)}
            >
              <RotateCcw size={16} />
              <span>{isRestoring ? 'Restoring Object...' : 'Initiate Non-Destructive Restore'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        title="Confirm Disaster Recovery Restoration"
        confirmText="Confirm &amp; Restore Object"
        cancelText="Cancel"
        isLoading={isRestoring}
        variant="primary"
        onConfirm={handleExecuteRestore}
        onCancel={() => setIsConfirmModalOpen(false)}
      >
        <div className="confirm-modal-details">
          <p>
            You are about to restore <strong>{selectedKey}</strong> to snapshot:
          </p>
          <div className="modal-target-box">
            <div><strong>Version ID:</strong> <code>{selectedVersionId}</code></div>
            <div><strong>Snapshot Timestamp:</strong> {targetVersion ? formatDate(targetVersion.lastModified) : ''}</div>
            <div><strong>Snapshot Size:</strong> {targetVersion ? formatBytes(targetVersion.size) : ''}</div>
          </div>
          <div className="modal-safety-note">
            <ShieldCheck size={16} className="text-success" />
            <span>
              <strong>Safe Operation:</strong> AWS S3 will create a <em>new current version</em> with this content. None of your historical versions will be deleted.
            </span>
          </div>
        </div>
      </ConfirmModal>
    </div>
  )
}
