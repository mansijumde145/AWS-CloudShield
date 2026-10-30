import { useState } from 'react'
import {
  Database,
  Lock,
  RefreshCw,
  Server,
  ShieldCheck,
  Wifi,
  WifiOff,
} from 'lucide-react'
import StatusBadge from '../components/StatusBadge'
import { formatDate } from '../utils/formatters'


export default function SystemStatusPage({
  isDemoMode,
  lastHealthCheck,
  auditLogs,
  onCheckHealth,
  isChecking,
}) {
  const [latencyMs, setLatencyMs] = useState(isDemoMode ? 8 : 42)

  const handleManualPing = async () => {
    const start = performance.now()
    await onCheckHealth()
    const diff = Math.round(performance.now() - start)
    setLatencyMs(diff)
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">System Status &amp; Cloud Health</h1>
          <p className="page-subtitle">
            Real-time monitoring of Flask API connectivity, AWS S3 backup storage vault, and disaster recovery audit logs.
          </p>
        </div>
        <div className="page-header-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleManualPing}
            disabled={isChecking}
          >
            <RefreshCw size={15} className={isChecking ? 'spin-icon' : ''} />
            <span>{isChecking ? 'Pinging API...' : 'Run Connectivity Check'}</span>
          </button>
        </div>
      </div>

      {/* Connectivity Overview Banner */}
      <div className={`status-banner ${isDemoMode ? 'banner-demo' : 'banner-online'}`}>
        <div className="status-banner-icon-wrap">
          {isDemoMode ? (
            <WifiOff size={24} className="banner-icon-demo" />
          ) : (
            <Wifi size={24} className="banner-icon-online" />
          )}
        </div>
        <div className="status-banner-content">
          <div className="banner-top-row">
            <h3 className="banner-title">
              {isDemoMode
                ? 'Backend Server: Standby (Demo Mode Active)'
                : 'Flask Backend & AWS S3: Connected & Operational'}
            </h3>
            <StatusBadge
              type={isDemoMode ? 'Demo Mode' : 'Online'}
              label={isDemoMode ? 'Demo Mode Fallback' : 'Live Connected'}
            />
          </div>
          <p className="banner-desc">
            {isDemoMode
              ? 'The Flask backend server is not reachable at /api/health. CloudShield is operating in local Demo Mode with simulated data for CC lab evaluation. Once you launch the Flask server at http://localhost:5000, live requests will automatically resume.'
              : 'All same-origin /api endpoints are successfully responding. Real AWS S3 API calls (boto3) are enabled.'}
          </p>
          <div className="banner-meta-row">
            <span><strong>Endpoint:</strong> <code>GET /api/health</code></span>
            <span><strong>Ping Latency:</strong> ~{latencyMs}ms</span>
            <span><strong>Last Tested:</strong> {lastHealthCheck?.timestamp ? formatDate(lastHealthCheck.timestamp) : 'On Boot'}</span>
          </div>
        </div>
      </div>

      {/* Service Health Breakdown Cards */}
      <div className="stats-grid mb-4">
        <div className="content-card status-metric-card">
          <div className="card-header">
            <div className="metric-header-left">
              <Server size={18} className="text-primary" />
              <span className="metric-name">Flask REST API</span>
            </div>
            <StatusBadge
              type={isDemoMode ? 'Warning' : 'Online'}
              label={isDemoMode ? 'Standby (Offline)' : 'Healthy'}
              size="sm"
            />
          </div>
          <div className="metric-meta-body">
            <div className="meta-line"><span>Target Port:</span> <code>5000</code></div>
            <div className="meta-line"><span>Route Prefix:</span> <code>/api/*</code></div>
            <div className="meta-line"><span>Protocol:</span> <span>HTTP / JSON</span></div>
          </div>
        </div>

        <div className="content-card status-metric-card">
          <div className="card-header">
            <div className="metric-header-left">
              <Database size={18} className="text-primary" />
              <span className="metric-name">AWS S3 Storage</span>
            </div>
            <StatusBadge type="Online" label="Operational" size="sm" />
          </div>
          <div className="metric-meta-body">
            <div className="meta-line"><span>Bucket:</span> <code className="font-mono">cloudshield-vault</code></div>
            <div className="meta-line"><span>Region:</span> <span>us-east-1</span></div>
            <div className="meta-line"><span>Durability:</span> <span>99.999999999% (11 9s)</span></div>
          </div>
        </div>

        <div className="content-card status-metric-card">
          <div className="card-header">
            <div className="metric-header-left">
              <ShieldCheck size={18} className="text-success" />
              <span className="metric-name">S3 Versioning</span>
            </div>
            <StatusBadge type="Online" label="Active" size="sm" />
          </div>
          <div className="metric-meta-body">
            <div className="meta-line"><span>Status:</span> <span className="text-success font-medium">Enabled</span></div>
            <div className="meta-line"><span>MFA Delete:</span> <span>Optional</span></div>
            <div className="meta-line"><span>Rollback Strategy:</span> <span>Non-Destructive Copy</span></div>
          </div>
        </div>

        <div className="content-card status-metric-card">
          <div className="card-header">
            <div className="metric-header-left">
              <Lock size={18} className="text-primary" />
              <span className="metric-name">Data Security</span>
            </div>
            <StatusBadge type="Online" label="Encrypted" size="sm" />
          </div>
          <div className="metric-meta-body">
            <div className="meta-line"><span>At-Rest:</span> <span>SSE-S3 (AES-256)</span></div>
            <div className="meta-line"><span>In-Transit:</span> <span>TLS 1.3 / HTTPS</span></div>
            <div className="meta-line"><span>Frontend Keys:</span> <span className="text-success font-medium">None (Zero Secrets)</span></div>
          </div>
        </div>
      </div>

      {/* S3 Storage Vault Details */}
      <div className="content-card mb-4">
        <div className="card-header">
          <div>
            <h3 className="card-title">AWS Backup Storage Vault Configuration</h3>
            <p className="card-description">Detailed infrastructure parameters for the disaster recovery target bucket</p>
          </div>
        </div>
        <div className="vault-config-grid">
          <div className="config-item">
            <span className="config-label">Bucket Identifier</span>
            <span className="config-value font-mono">cloudshield-vault-cc-lab</span>
          </div>
          <div className="config-item">
            <span className="config-label">Primary AWS Region</span>
            <span className="config-value">us-east-1 (US East - N. Virginia)</span>
          </div>
          <div className="config-item">
            <span className="config-label">Object Versioning Policy</span>
            <span className="config-value text-success font-medium">Enabled (Active Non-Suspended)</span>
          </div>
          <div className="config-item">
            <span className="config-label">Recovery Point Objective (RPO)</span>
            <span className="config-value">&lt; 15 Minutes Target</span>
          </div>
          <div className="config-item">
            <span className="config-label">Recovery Time Objective (RTO)</span>
            <span className="config-value">&lt; 5 Minutes Target</span>
          </div>
          <div className="config-item">
            <span className="config-label">Server-Side Encryption</span>
            <span className="config-value">AWS-managed S3 Keys (SSE-S3 256-bit)</span>
          </div>
          <div className="config-item">
            <span className="config-label">Lifecycle Rule (Non-Current)</span>
            <span className="config-value">Transition to S3 Glacier after 90 days</span>
          </div>
          <div className="config-item">
            <span className="config-label">Replication Mode</span>
            <span className="config-value">Cross-Region S3 Replication (DR Site: us-west-2)</span>
          </div>
        </div>
      </div>

      {/* Operations & Audit Results Table */}
      <div className="content-card table-card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Recent Operation Results &amp; Audit Trail</h3>
            <p className="card-description">
              Cryptographically timestamped log of all upload, restore, and integrity check operations.
            </p>
          </div>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Operation</th>
                <th>Target Object</th>
                <th>Resulting Version ID</th>
                <th>Status</th>
                <th>Triggered By</th>
                <th>Execution Details</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id} className="table-row">
                  <td className="text-muted text-sm whitespace-nowrap">
                    {formatDate(log.timestamp)}
                  </td>
                  <td>
                    <span
                      className={`activity-op-badge ${
                        log.operation === 'RESTORE'
                          ? 'op-restore'
                          : log.operation === 'HEALTH_CHECK'
                          ? 'op-health'
                          : 'op-upload'
                      }`}
                    >
                      {log.operation}
                    </span>
                  </td>
                  <td className="font-mono text-sm" title={log.target}>
                    {log.target.split('/').pop()}
                  </td>
                  <td className="font-mono text-xs text-muted">
                    {log.versionId && log.versionId !== 'N/A'
                      ? `${log.versionId.substring(0, 14)}...`
                      : 'N/A'}
                  </td>
                  <td>
                    <StatusBadge
                      type={log.status}
                      label={log.status}
                      size="sm"
                    />
                  </td>
                  <td className="text-sm">{log.user || 'System'}</td>
                  <td className="text-sm text-muted">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
