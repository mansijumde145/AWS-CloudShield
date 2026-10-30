import { useState } from 'react'
import {
  CheckCircle2,
  Database,
  Lock,
  RefreshCw,
  Server,
  ShieldAlert,
  ShieldCheck,
  Terminal,
} from 'lucide-react'
import StatusBadge from '../components/StatusBadge'
import { setDemoMode } from '../services/api'

export default function SettingsPage({
  isDemoMode,
  onCheckHealth,
  isChecking,
}) {
  const [toggleNotice, setToggleNotice] = useState(null)

  const handleToggleDemoMode = (e) => {
    const forced = e.target.checked
    setDemoMode(forced)
    setToggleNotice(
      forced
        ? 'Switched to Demo Mode (using sample CC lab data).'
        : 'Switched to Live API mode. Pinging /api/health...'
    )
    if (!forced) {
      onCheckHealth()
    }
    setTimeout(() => setToggleNotice(null), 3500)
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Application Settings &amp; Cloud Configuration</h1>
          <p className="page-subtitle">
            Inspect disaster recovery configurations, AWS S3 bucket parameters, and security policies without exposing credentials.
          </p>
        </div>
      </div>

      {toggleNotice && (
        <div className="action-notice notice-success mb-4">
          <CheckCircle2 size={16} />
          <span>{toggleNotice}</span>
        </div>
      )}

      {/* Security Best Practices Banner (Zero Credentials) */}
      <div className="security-banner-card mb-4">
        <div className="sec-banner-icon-wrap">
          <Lock size={22} className="text-success" />
        </div>
        <div className="sec-banner-content">
          <h4 className="sec-banner-title">
            AWS Security Guarantee: Zero Credentials in Frontend Code
          </h4>
          <p className="sec-banner-desc">
            Following the <strong>AWS Well-Architected Framework (Security Pillar)</strong>, this React application contains <em>zero AWS access keys, secret keys, or IAM credentials</em>. All AWS interactions are delegated strictly to the backend Flask API using IAM roles or secure server-side environment variables.
          </p>
          <div className="sec-badges-row">
            <span className="sec-badge">
              <ShieldCheck size={13} className="text-success" />
              <span>No Hardcoded AWS Keys</span>
            </span>
            <span className="sec-badge">
              <ShieldCheck size={13} className="text-success" />
              <span>Same-Origin /api REST Proxy</span>
            </span>
            <span className="sec-badge">
              <ShieldCheck size={13} className="text-success" />
              <span>IAM Least Privilege Architecture</span>
            </span>
          </div>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="settings-grid">
        {/* Card 1: API & Runtime Mode */}
        <div className="content-card">
          <div className="card-header">
            <div className="header-icon-label">
              <Server size={18} className="text-primary" />
              <h3 className="card-title">Backend API Gateway</h3>
            </div>
            <StatusBadge
              type={isDemoMode ? 'Demo Mode' : 'Online'}
              label={isDemoMode ? 'Demo Standby' : 'Live Connected'}
            />
          </div>

          <div className="settings-form-body">
            <div className="settings-field">
              <label className="field-label">API Gateway Route Prefix</label>
              <input
                type="text"
                className="form-control font-mono"
                value="/api"
                readOnly
              />
              <span className="field-hint">
                Proxied automatically by Vite to <code>http://localhost:5000</code> during development.
              </span>
            </div>

            <div className="settings-field">
              <label className="field-label">Health Check Endpoint</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="form-control font-mono"
                  value="GET /api/health"
                  readOnly
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={onCheckHealth}
                  disabled={isChecking}
                >
                  <RefreshCw size={13} className={isChecking ? 'spin-icon' : ''} />
                  <span>{isChecking ? 'Pinging...' : 'Test'}</span>
                </button>
              </div>
            </div>

            {/* Demo Mode Toggle */}
            <div className="settings-toggle-row">
              <div className="toggle-info">
                <span className="toggle-title">Force Demo Simulation Mode</span>
                <span className="toggle-desc">
                  Toggle off to attempt real network calls to the Flask backend, or toggle on to inspect sample evaluation data.
                </span>
              </div>
              <label className="switch" htmlFor="demoModeToggle">
                <input
                  type="checkbox"
                  id="demoModeToggle"
                  checked={isDemoMode}
                  onChange={handleToggleDemoMode}
                />
                <span className="slider round" />
              </label>
            </div>
          </div>
        </div>

        {/* Card 2: AWS S3 Disaster Recovery Target */}
        <div className="content-card">
          <div className="card-header">
            <div className="header-icon-label">
              <Database size={18} className="text-primary" />
              <h3 className="card-title">AWS S3 Target Parameters</h3>
            </div>
            <StatusBadge type="Online" label="Configured" />
          </div>

          <div className="settings-form-body">
            <div className="settings-field">
              <label className="field-label">S3 Backup Bucket Name</label>
              <input
                type="text"
                className="form-control font-mono"
                value="cloudshield-vault-cc-lab"
                readOnly
              />
            </div>

            <div className="settings-field">
              <label className="field-label">Primary AWS Region</label>
              <input
                type="text"
                className="form-control"
                value="us-east-1 (N. Virginia)"
                readOnly
              />
            </div>

            <div className="settings-field">
              <label className="field-label">Object Versioning Policy</label>
              <div className="policy-pill-wrap">
                <span className="policy-badge text-success">
                  <CheckCircle2 size={13} />
                  <span>Enabled (Non-Suspended)</span>
                </span>
              </div>
            </div>

            <div className="settings-field">
              <label className="field-label">Disaster Recovery Replication Site</label>
              <input
                type="text"
                className="form-control"
                value="us-west-2 (Oregon) — Cross-Region Replication"
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Card 3: Disaster Recovery Objectives */}
        <div className="content-card">
          <div className="card-header">
            <div className="header-icon-label">
              <ShieldAlert size={18} className="text-primary" />
              <h3 className="card-title">Recovery Objectives (RPO &amp; RTO)</h3>
            </div>
          </div>

          <div className="settings-form-body">
            <div className="dr-param-item">
              <span className="dr-param-name">Recovery Point Objective (RPO)</span>
              <span className="dr-param-val">&lt; 15 Minutes</span>
              <span className="dr-param-desc">
                Maximum allowable period in which data might be lost between automated snapshots.
              </span>
            </div>

            <div className="dr-param-item">
              <span className="dr-param-name">Recovery Time Objective (RTO)</span>
              <span className="dr-param-val">&lt; 5 Minutes</span>
              <span className="dr-param-desc">
                Maximum acceptable duration to restore service by promoting an older S3 version to head.
              </span>
            </div>

            <div className="dr-param-item">
              <span className="dr-param-name">Restoration Strategy</span>
              <span className="dr-param-val">Non-Destructive S3 CopyObject</span>
              <span className="dr-param-desc">
                Creates a new version with the snapshot contents; existing historical versions are retained.
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Project Information */}
        <div className="content-card">
          <div className="card-header">
            <div className="header-icon-label">
              <Terminal size={18} className="text-primary" />
              <h3 className="card-title">Project &amp; Environment Info</h3>
            </div>
          </div>

          <div className="settings-form-body">
            <div className="info-kv-row">
              <span className="info-k">Project Title:</span>
              <span className="info-v">CloudShield — Disaster Recovery Using AWS</span>
            </div>
            <div className="info-kv-row">
              <span className="info-k">Course / Context:</span>
              <span className="info-v">Cloud Computing Lab (CC Lab)</span>
            </div>
            <div className="info-kv-row">
              <span className="info-k">Frontend Framework:</span>
              <span className="info-v">React 19 + Vite + Lucide Icons</span>
            </div>
            <div className="info-kv-row">
              <span className="info-k">Backend Gateway:</span>
              <span className="info-v">Python Flask + Boto3 AWS SDK</span>
            </div>
            <div className="info-kv-row">
              <span className="info-k">Cloud Provider:</span>
              <span className="info-v">Amazon Web Services (AWS S3)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
