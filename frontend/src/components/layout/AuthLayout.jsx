import { Link, Outlet, useLocation } from 'react-router-dom'

const authNavItems = [
  { name: 'Home', path: '/' },
  { name: 'Battery Models', path: '/models' },
  { name: 'Find by Vehicle', path: '/find-battery' },
]

export default function AuthLayout() {
  const location = useLocation()

  return (
    <div className="min-h-[100dvh] box-border auth-hero px-4 py-4 md:px-8 md:py-6">
      <header className="guest-header panel-card mb-6">
        <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">LithoVolt Public</p>
            <h1 className="neon-title text-2xl text-[color:var(--accent)]">Access & Discovery</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {authNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`guest-nav-chip ${location.pathname === item.path ? 'active' : ''}`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </header>

      <Outlet />
    </div>
  )
}
