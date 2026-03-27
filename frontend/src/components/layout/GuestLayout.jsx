import { Link, Outlet } from 'react-router-dom'
import PublicHeader from './PublicHeader'

export default function GuestLayout() {
  return (
    <div className="min-h-screen px-4 pb-6 pt-0 md:px-8 md:pb-8 md:pt-0">
      <PublicHeader title="Battery Discovery Hub" />

      <main>
        <Outlet />
      </main>

      <footer className="mt-8 panel-card p-4 md:p-5">
        <div className="flex flex-col gap-3 text-sm text-[color:var(--muted)] md:flex-row md:items-center md:justify-between">
          <p>Built for clean power decisions across consumer and wholesale battery journeys.</p>
          <div className="flex gap-2">
            <Link to="/about" className="guest-nav-chip">About</Link>
            <Link to="/contact" className="guest-nav-chip">Contact</Link>
            <Link to="/support" className="guest-nav-chip">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
