import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

function titleCase(segment) {
  return segment
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function buildBreadcrumb(pathname) {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) {
    return ['Home']
  }

  return segments.map((segment) => titleCase(segment))
}

export default function Navbar({ isSidebarCollapsed = false, onToggleSidebar }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const onClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const basePanelPath = location.pathname.startsWith('/admin')
    ? '/admin'
    : location.pathname.startsWith('/wholesaler')
      ? '/wholesaler'
      : location.pathname.startsWith('/customer')
        ? '/customer'
        : null
  const panelName = location.pathname.startsWith('/admin')
    ? 'Admin Panel'
    : location.pathname.startsWith('/wholesaler')
      ? 'Wholesaler Panel'
      : 'Customer Panel'
  const breadcrumb = buildBreadcrumb(location.pathname)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="topbar">
      <div className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">Lithovolt Platform · {panelName}</p>
          <p className="mt-1 text-xs text-[color:var(--muted)]">
            {breadcrumb.join(' / ')}
          </p>
          <h2 className="text-2xl font-semibold neon-title">Welcome, {user?.first_name || 'Partner'}</h2>
        </div>
        <div className="relative flex flex-wrap items-center gap-3" ref={dropdownRef}>
          <button
            type="button"
            className="neon-btn-ghost hidden lg:inline-flex"
            onClick={onToggleSidebar}
          >
            {isSidebarCollapsed ? 'Expand Menu' : 'Collapse Menu'}
          </button>
          <span className="tag">{user?.role || 'USER'}</span>
          <button
            className="neon-btn-secondary text-sm"
            onClick={() => setOpen((prev) => !prev)}
            type="button"
          >
            Account
          </button>

          {open ? (
            <div className="absolute right-0 top-[calc(100%+0.5rem)] z-40 w-56 panel-card p-2">
              {basePanelPath ? (
                <>
                  <Link to={`${basePanelPath}/profile`} className="block rounded-lg px-3 py-2 text-sm hover:bg-white/5" onClick={() => setOpen(false)}>
                    View Profile
                  </Link>
                  <Link to={`${basePanelPath}/profile/change-password`} className="block rounded-lg px-3 py-2 text-sm hover:bg-white/5" onClick={() => setOpen(false)}>
                    Change Password
                  </Link>
                </>
              ) : null}
              <button
                className="mt-1 block w-full rounded-lg px-3 py-2 text-left text-sm text-[color:var(--danger)] hover:bg-white/5"
                onClick={handleLogout}
                type="button"
              >
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
