import { useState } from 'react'
import { AlertCircle, RefreshCw, X } from 'lucide-react'


export default function DemoBanner({ isDemoMode, onRetryConnection, isChecking }) {
  const [isDismissed, setIsDismissed] = useState(false)

  if (!isDemoMode || isDismissed) {
    return null
  }

  return (
    <div className="demo-banner">
      <div className="demo-banner-content">
        <div className="demo-banner-icon">
          <AlertCircle size={18} />
        </div>
        <div className="demo-banner-text">
          <span className="demo-banner-badge">Demo Mode Active</span>
          <span className="demo-banner-desc">
            Backend server is currently unreachable at <code>/api/health</code>. Displaying sample disaster recovery data. Simulated actions do not alter live AWS resources.
          </span>
        </div>
      </div>
      <div className="demo-banner-actions">
        <button
          type="button"
          className="demo-btn-retry"
          onClick={onRetryConnection}
          disabled={isChecking}
          title="Attempt to connect to live Flask backend"
        >
          <RefreshCw size={13} className={isChecking ? 'spin-icon' : ''} />
          {isChecking ? 'Checking...' : 'Check Live API'}
        </button>
        <button
          type="button"
          className="demo-btn-close"
          onClick={() => setIsDismissed(true)}
          aria-label="Dismiss banner"
          title="Dismiss notification"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  )
}
