import React, { useState } from 'react'
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard,
  Compass,
  Sparkles,
  Globe2,
  Building2,
  UtensilsCrossed,
  Camera,
  Heart,
  Star,
  BookOpen,
  Calendar,
  Wallet,
  Users2,
  CheckSquare,
  BarChart3,
  Bot,
  User,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Plane
} from 'lucide-react'

const navSections = [
  {
    title: 'Workspace',
    links: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/trips', label: 'My Trips', icon: Compass },
      { to: '/trips/planner', label: 'AI Trip Planner', icon: Sparkles, badge: 'AI' }
    ]
  },
  {
    title: 'Discover & Explore',
    links: [
      { to: '/destinations', label: 'Destinations', icon: Globe2 },
      { to: '/hotels', label: 'Hotels & Stays', icon: Building2 },
      { to: '/restaurants', label: 'Dining & Cafes', icon: UtensilsCrossed },
      { to: '/attractions', label: 'Attractions', icon: Camera }
    ]
  },
  {
    title: 'Travel Tools',
    links: [
      { to: '/favorites', label: 'Saved Favorites', icon: Heart },
      { to: '/reviews', label: 'Reviews & Ratings', icon: Star },
      { to: '/chat', label: 'AI Travel Assistant', icon: Bot, badge: 'Smart' },
      { to: '/analytics', label: 'Travel Analytics', icon: BarChart3 }
    ]
  },
  {
    title: 'Account',
    links: [
      { to: '/profile', label: 'Profile & Settings', icon: User }
    ]
  }
]

export default function AppLayout() {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const closeSidebar = () => setMobileOpen(false)

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'TM'

  return (
    <div className="app-shell">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="modal-backdrop"
          style={{ zIndex: 45 }}
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`app-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/dashboard" className="brand" onClick={closeSidebar}>
            <div className="brand-icon">
              <Plane size={18} />
            </div>
            <span>
              TripMate <i>AI</i>
            </span>
          </Link>
        </div>

        <nav className="sidebar-nav">
          {navSections.map((section) => (
            <div key={section.title} className="sidebar-group">
              <div className="sidebar-group-title">{section.title}</div>
              <div className="sidebar-links">
                {section.links.map((link) => {
                  const Icon = link.icon
                  return (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      onClick={closeSidebar}
                      className={({ isActive }) =>
                        `sidebar-link ${isActive ? 'active' : ''}`
                      }
                      end={link.to === '/dashboard'}
                    >
                      <Icon size={18} className="sidebar-icon" />
                      <span>{link.label}</span>
                      {link.badge && (
                        <span className="badge badge-coral" style={{ marginLeft: 'auto', fontSize: '0.62rem' }}>
                          {link.badge}
                        </span>
                      )}
                    </NavLink>
                  )
                })}
              </div>
            </div>
          ))}

          {isAdmin && (
            <div className="sidebar-group">
              <div className="sidebar-group-title">Administration</div>
              <div className="sidebar-links">
                <NavLink
                  to="/admin/dashboard"
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                >
                  <ShieldCheck size={18} className="sidebar-icon" />
                  <span>Admin Console</span>
                  <span className="badge badge-danger" style={{ marginLeft: 'auto', fontSize: '0.62rem' }}>
                    Admin
                  </span>
                </NavLink>
              </div>
            </div>
          )}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: 20 }}>
          <button
            onClick={handleLogout}
            className="sidebar-link btn-ghost"
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            <LogOut size={18} className="sidebar-icon" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="app-main">
        <header className="app-topbar">
          <button
            className="btn btn-ghost btn-sm"
            style={{ display: window.innerWidth <= 768 ? 'inline-flex' : 'none' }}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: '0.88rem', color: '#64748b' }}>
              Welcome back, <strong style={{ color: '#0f172a' }}>{user?.fullName || 'Traveler'}</strong>
            </span>
            {isAdmin && <span className="badge badge-primary">Administrator</span>}
          </div>

          <div className="topbar-user">
            <Link to="/profile" className="topbar-avatar" title="View Profile">
              {initials}
            </Link>
            <div className="topbar-info" style={{ display: window.innerWidth <= 640 ? 'none' : 'flex' }}>
              <span className="topbar-name">{user?.fullName}</span>
              <span className="topbar-email">{user?.email}</span>
            </div>
          </div>
        </header>

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
