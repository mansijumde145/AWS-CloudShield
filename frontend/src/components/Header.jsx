import { Menu, RefreshCw, Wifi, WifiOff } from 'lucide-react'

export default function Header({
  activePage,
  pageTitles,
  isDemoMode,
  isChecking,
  onCheckHealth,
  onToggleMobileMenu,
}) {
  const currentTitle = pageTitles[activePage]?.title || 'Dashboard'
  const currentDesc = pageTitles[activePage]?.description || 'Disaster Recovery Management'

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={onToggleMobileMenu}
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className="header-breadcrumbs">
          <span className="breadcrumb-root">CloudShield</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current" title={currentDesc}>{currentTitle}</span>
        </div>
      </div>

      <div className="header-right">
        {/* Connection status indicator */}
        <div className={`connection-pill ${isDemoMode ? 'pill-demo' : 'pill-live'}`}>
          {isDemoMode ? (
            <>
              <WifiOff size={13} className="pill-icon" />
              <span className="pill-text">Demo Mode (Offline)</span>
            </>
          ) : (
            <>
              <Wifi size={13} className="pill-icon" />
              <span className="pill-text">Live AWS S3 Connected</span>
            </>
          )}
        </div>

        {/* Manual re-test button */}
        <button
          type="button"
          className="header-btn-test"
          onClick={onCheckHealth}
          disabled={isChecking}
          title="Verify Flask API connection (/api/health)"
        >
          <RefreshCw size={14} className={isChecking ? 'spin-icon' : ''} />
          <span className="header-btn-text">
            {isChecking ? 'Checking...' : 'Ping API'}
          </span>
        </button>
      </div>
    </header>
  )
}
