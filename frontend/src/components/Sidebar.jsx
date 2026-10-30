import {
  Activity,
  HardDrive,
  LayoutDashboard,
  Layers,
  RotateCcw,
  Server,
  Settings,
  Shield,
  X,
} from 'lucide-react'


export default function Sidebar({
  activePage,
  onNavigate,
  isMobileOpen,
  onCloseMobile,
  fileCount = 0,
}) {
  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'files',
      label: 'Backups & Files',
      icon: HardDrive,
      badge: fileCount > 0 ? String(fileCount) : null,
    },
    {
      id: 'versions',
      label: 'Version History',
      icon: Layers,
      badge: null,
    },
    {
      id: 'recovery',
      label: 'Recovery Center',
      icon: RotateCcw,
      badge: 'DR',
      isSpecial: true,
    },
    {
      id: 'status',
      label: 'System Status',
      icon: Activity,
      badge: null,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ]

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="sidebar-mobile-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside className={`app-sidebar ${isMobileOpen ? 'sidebar-open' : ''}`}>
        {/* Brand / Logo */}
        <div className="sidebar-brand">
          <div className="brand-logo-icon">
            <Shield size={22} className="logo-shield" />
          </div>
          <div className="brand-info">
            <span className="brand-title">CloudShield</span>
            <span className="brand-subtitle">AWS Disaster Recovery</span>
          </div>
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={onCloseMobile}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="sidebar-nav">
          <div className="nav-section-label">NAVIGATION</div>
          <ul className="nav-list">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activePage === item.id
              return (
                <li key={item.id} className="nav-item">
                  <button
                    type="button"
                    className={`nav-link ${isActive ? 'nav-link-active' : ''} ${item.isSpecial ? 'nav-link-dr' : ''}`}
                    onClick={() => {
                      onNavigate(item.id)
                      if (onCloseMobile) onCloseMobile()
                    }}
                  >
                    <Icon size={18} className="nav-icon" />
                    <span className="nav-label">{item.label}</span>
                    {item.badge && (
                      <span className={`nav-badge ${item.isSpecial ? 'nav-badge-dr' : ''}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Cloud Architecture Footer */}
        <div className="sidebar-footer">
          <div className="aws-vault-card">
            <div className="vault-header">
              <Server size={14} className="vault-icon" />
              <span className="vault-label">AWS S3 Target</span>
            </div>
            <div className="vault-name">cloudshield-vault-cc-lab</div>
            <div className="vault-meta">
              <span>Region: us-east-1</span>
              <span className="vault-dot">•</span>
              <span>Versioning ON</span>
            </div>
          </div>
          <div className="sidebar-project-tag">
            Cloud Computing Lab Project
          </div>
        </div>
      </aside>
    </>
  )
}
