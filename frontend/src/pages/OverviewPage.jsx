import { useEffect, useState } from 'react'
import {
  ArrowRight,
  Clock,
  Database,
  FileCheck,
  HardDrive,
  Layers,
  RotateCcw,
  ShieldCheck,
  Upload,
} from 'lucide-react'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import { fetchFiles, fetchAuditLogs } from '../services/api'
import { formatBytes, formatRelativeTime } from '../utils/formatters'


export default function OverviewPage({ onNavigate, isDemoMode, onOpenUpload }) {
  const [files, setFiles] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    async function loadData() {
      setIsLoading(true)
      try {
        const [filesRes, logsRes] = await Promise.all([fetchFiles(), fetchAuditLogs()])
        if (isMounted) {
          setFiles(filesRes.files || [])
          setAuditLogs(logsRes.logs || [])
        }
      } catch (err) {
        console.error('Error loading overview data:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    loadData()
    return () => { isMounted = false }
  }, [isDemoMode])

  // Computed metrics
  const totalFiles = files.length
  const totalVersions = files.reduce((acc, f) => acc + (f.versions?.length || f.versionCount || 1), 0)
  const totalStorageBytes = files.reduce((acc, f) => acc + (f.size || 0), 0)
  const restoreOperationsCount = auditLogs.filter(l => l.operation === 'RESTORE').length

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Disaster Recovery Dashboard</h1>
          <p className="page-subtitle">
            Continuous cloud backup, automated object versioning, and non-destructive disaster recovery.
          </p>
        </div>
        <div className="page-header-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => onNavigate('recovery')}
          >
            <RotateCcw size={15} />
            <span>Recovery Center</span>
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onOpenUpload}
          >
            <Upload size={15} />
            <span>Upload Backup</span>
          </button>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="stats-grid">
        <StatCard
          title="Total Backed-Up Files"
          value={isLoading ? '...' : totalFiles}
          subtitle="Vaulted in AWS S3"
          icon={HardDrive}
          tag="Active"
        />
        <StatCard
          title="Stored Object Versions"
          value={isLoading ? '...' : totalVersions}
          subtitle="Protected against data loss"
          icon={Layers}
          tag="Immutable"
        />
        <StatCard
          title="Recovery Drills Run"
          value={isLoading ? '...' : restoreOperationsCount}
          subtitle="Verified non-destructive rollbacks"
          icon={RotateCcw}
          tag="100% Success"
        />
        <StatCard
          title="Vault Storage Used"
          value={isLoading ? '...' : formatBytes(totalStorageBytes)}
          subtitle="Standard & Intelligent-Tiering"
          icon={Database}
          tag="AES-256"
        />
      </div>

      {/* Two Column Layout: Quick Actions & Recent Activity */}
      <div className="dashboard-columns">
        {/* Left Column: Quick Workflow Hub & Architecture Highlights */}
        <div className="dashboard-main-col">
          {/* Quick Workflow Cards */}
          <div className="content-card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Disaster Recovery Operations</h3>
                <p className="card-description">
                  Essential tools for managing cloud backups and recovery points
                </p>
              </div>
            </div>
            <div className="quick-actions-list">
              <div
                className="action-tile"
                onClick={() => onNavigate('files')}
                role="button"
                tabIndex={0}
              >
                <div className="action-tile-icon-wrap tile-blue">
                  <HardDrive size={18} />
                </div>
                <div className="action-tile-info">
                  <h4 className="action-tile-title">Browse &amp; Upload Backups</h4>
                  <p className="action-tile-desc">
                    Search files, inspect AWS storage classes, or vault new revisions.
                  </p>
                </div>
                <ArrowRight size={16} className="action-tile-arrow" />
              </div>

              <div
                className="action-tile"
                onClick={() => onNavigate('versions')}
                role="button"
                tabIndex={0}
              >
                <div className="action-tile-icon-wrap tile-green">
                  <Layers size={18} />
                </div>
                <div className="action-tile-info">
                  <h4 className="action-tile-title">Inspect S3 Version History</h4>
                  <p className="action-tile-desc">
                    Examine historical snapshots, timestamps, and compare version states.
                  </p>
                </div>
                <ArrowRight size={16} className="action-tile-arrow" />
              </div>

              <div
                className="action-tile action-tile-highlight"
                onClick={() => onNavigate('recovery')}
                role="button"
                tabIndex={0}
              >
                <div className="action-tile-icon-wrap tile-amber">
                  <RotateCcw size={18} />
                </div>
                <div className="action-tile-info">
                  <h4 className="action-tile-title">Non-Destructive Recovery Center</h4>
                  <p className="action-tile-desc">
                    Restore previous version snapshots by cloning them to the head object.
                  </p>
                </div>
                <ArrowRight size={16} className="action-tile-arrow" />
              </div>
            </div>
          </div>

          {/* Educational / CC Lab DR Concepts */}
          <div className="content-card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Cloud Disaster Recovery Principles</h3>
                <p className="card-description">
                  How AWS S3 primitives underpin the CloudShield backup architecture
                </p>
              </div>
            </div>
            <div className="dr-concepts-grid">
              <div className="dr-concept-item">
                <div className="concept-header">
                  <ShieldCheck size={16} className="concept-icon-success" />
                  <span className="concept-name">Non-Destructive Restoration</span>
                </div>
                <p className="concept-text">
                  Restoring an older S3 version creates a <strong>new current version</strong> (via S3 CopyObject). Historical versions are never destroyed or purged during rollbacks.
                </p>
              </div>

              <div className="dr-concept-item">
                <div className="concept-header">
                  <Clock size={16} className="concept-icon-blue" />
                  <span className="concept-name">Strict RPO &amp; RTO Objectives</span>
                </div>
                <p className="concept-text">
                  <strong>RPO (Recovery Point Objective):</strong> Target &lt;15 minutes via automated periodic snapshots. <strong>RTO (Recovery Time):</strong> Target &lt;5 minutes for instant reversion.
                </p>
              </div>

              <div className="dr-concept-item">
                <div className="concept-header">
                  <FileCheck size={16} className="concept-icon-green" />
                  <span className="concept-name">Object Immutability &amp; Encryption</span>
                </div>
                <p className="concept-text">
                  All objects are encrypted at rest using AWS SSE-S3 (AES-256). S3 Version IDs guarantee immutable audit logs for enterprise compliance.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: System Status Pill & Recent Activity */}
        <div className="dashboard-side-col">
          {/* Status Overview Card */}
          <div className="content-card">
            <div className="card-header">
              <h3 className="card-title">System Status</h3>
              <StatusBadge
                type={isDemoMode ? 'Demo Mode' : 'Online'}
                label={isDemoMode ? 'Demo Mode' : 'AWS Connected'}
              />
            </div>
            <div className="system-status-summary">
              <div className="summary-row">
                <span className="summary-label">Storage Vault:</span>
                <span className="summary-value font-mono">cloudshield-vault-cc-lab</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Target Region:</span>
                <span className="summary-value">us-east-1 (N. Virginia)</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">S3 Versioning:</span>
                <span className="summary-value text-success font-medium">Enabled</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Encryption:</span>
                <span className="summary-value">SSE-S3 (AES-256)</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">API Gateway:</span>
                <span className="summary-value">
                  {isDemoMode ? 'Demo Standby (Offline)' : 'Flask 5000 Active'}
                </span>
              </div>
            </div>
            <div className="card-footer-action">
              <button
                type="button"
                className="btn btn-subtle w-full"
                onClick={() => onNavigate('status')}
              >
                <span>View Full System Status</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Recent Audit Activity */}
          <div className="content-card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Recent Activity</h3>
                <p className="card-description">Latest operations and automated drills</p>
              </div>
              <button
                type="button"
                className="btn-link-action"
                onClick={() => onNavigate('status')}
              >
                View all
              </button>
            </div>

            <div className="activity-feed">
              {auditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="activity-item">
                  <div className="activity-indicator">
                    <span
                      className={`activity-dot ${
                        log.operation === 'RESTORE'
                          ? 'dot-amber'
                          : log.operation === 'HEALTH_CHECK'
                          ? 'dot-blue'
                          : 'dot-green'
                      }`}
                    />
                  </div>
                  <div className="activity-content">
                    <div className="activity-top">
                      <span className="activity-op-badge">{log.operation}</span>
                      <span className="activity-time">
                        {formatRelativeTime(log.timestamp)}
                      </span>
                    </div>
                    <div className="activity-target font-mono" title={log.target}>
                      {log.target.split('/').pop()}
                    </div>
                    <div className="activity-details">{log.details}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
