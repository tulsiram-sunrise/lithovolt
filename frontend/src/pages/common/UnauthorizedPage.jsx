import { Link } from 'react-router-dom'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen px-6 py-16">
      <div className="mx-auto max-w-2xl panel-card panel-card-strong p-8 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">Access Control</p>
        <h1 className="mt-3 text-4xl font-semibold neon-title">Access Denied</h1>
        <p className="mt-4 text-[color:var(--muted)]">
          Your account is signed in, but you do not have permission to open this section.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className="neon-btn-secondary">Go Home</Link>
          <Link to="/login" className="neon-btn">Switch Account</Link>
        </div>
      </div>
    </div>
  )
}
