import { NavLink, useLocation } from 'react-router-dom'
import './Layout.css'

const navItems = [
  { path: '/', label: 'Dashboard', icon: '⊞' },
  { path: '/wallets', label: 'Wallets', icon: '◈' },
  { path: '/budget', label: 'Budget', icon: '◉' },
  { path: '/settings', label: 'Settings', icon: '⚙' },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sidebar glass-card">
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <img src="/quickfinancialPNG.png" alt="logo" style={{ width: '55px'}} />
          </div>
          <span className="sidebar-title">Quick Financial</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="mobile-nav glass-card">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={`mobile-nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="mobile-nav-icon">{item.icon}</span>
            <span className="mobile-nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  )
}
