import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export default function Navbar() {
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

  const isCustomerPanel = location.pathname.startsWith('/customer')

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="topbar">
      <div className="flex flex-col gap-3 px-6 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">Lithovolt Platform</p>
          <h2 className="text-2xl font-semibold neon-title">Welcome, {user?.first_name || 'Partner'}</h2>
        </div>
        <div className="relative flex flex-wrap items-center gap-3" ref={dropdownRef}>
          <span className="tag">{user?.role || 'USER'}</span>
          <button
            className="neon-btn-secondary text-sm"
            onClick={() => setOpen((prev) => !prev)}
            type="button"
          >
            {user?.email || 'Account'}
          </button>

          {open ? (
            <div className="absolute right-0 top-[calc(100%+0.5rem)] z-40 w-56 panel-card p-2">
              {isCustomerPanel ? (
                <>
                  <Link to="/customer/profile" className="block rounded-lg px-3 py-2 text-sm hover:bg-white/5" onClick={() => setOpen(false)}>
                    View Profile
                  </Link>
                  <Link to="/customer/profile/change-password" className="block rounded-lg px-3 py-2 text-sm hover:bg-white/5" onClick={() => setOpen(false)}>
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
