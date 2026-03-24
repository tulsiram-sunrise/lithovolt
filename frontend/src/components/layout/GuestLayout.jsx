import { Link, Outlet, useLocation } from 'react-router-dom'

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'Battery Models', path: '/models' },
  { name: 'Find by Vehicle', path: '/find-battery' },
]

export default function GuestLayout() {
  const location = useLocation()

  return (
    <div className="min-h-screen px-4 py-6 md:px-8 md:py-8">
      <header className="guest-header panel-card mb-6">
        <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">LithoVolt Public</p>
            <h1 className="neon-title text-2xl text-[color:var(--accent)]">Battery Discovery Hub</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`guest-nav-chip ${location.pathname === item.path ? 'active' : ''}`}
              >
                {item.name}
              </Link>
            ))}
            <Link to="/login" className="guest-nav-chip guest-nav-chip-login">
              Login
            </Link>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  )
}
