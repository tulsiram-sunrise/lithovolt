import { useAuthStore } from '../../store/authStore'

export default function Navbar() {
  const { user, logout } = useAuthStore()

  return (
    <header className="topbar">
      <div className="flex flex-col gap-3 px-6 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">Lithovolt Platform</p>
          <h2 className="text-2xl font-semibold neon-title">Welcome, {user?.first_name || 'Partner'}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="tag">{user?.role || 'USER'}</span>
          <span className="text-sm text-[color:var(--muted)]">{user?.email}</span>
          <button onClick={logout} className="neon-btn-secondary text-sm">
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
