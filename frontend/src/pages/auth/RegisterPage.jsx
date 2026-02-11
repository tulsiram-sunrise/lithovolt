export default function RegisterPage() {
  return (
    <div className="auth-shell">
        <div className="auth-card">
          <h2 className="text-3xl font-semibold neon-title">Create Account</h2>
          <p className="mt-2 text-[color:var(--muted)]">Join Lithovolt to manage orders and warranties.</p>

          <form className="mt-8 space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="field-label">First Name</label>
                <input type="text" className="neon-input" placeholder="First name" />
              </div>
              <div>
                <label className="field-label">Last Name</label>
                <input type="text" className="neon-input" placeholder="Last name" />
              </div>
            </div>
            <div>
              <label className="field-label">Email</label>
              <input type="email" className="neon-input" placeholder="name@company.com" />
            </div>
            <div>
              <label className="field-label">Phone</label>
              <input type="tel" className="neon-input" placeholder="+91 90000 00000" />
            </div>
            <div>
              <label className="field-label">Password</label>
              <input type="password" className="neon-input" placeholder="Create a password" />
            </div>
            <button type="submit" className="neon-btn w-full">
              Create Account
            </button>
            <button type="button" className="neon-btn-secondary w-full">
              Back to Login
            </button>
          </form>
        </div>

        <div className="panel-card panel-card-strong p-8 flex flex-col justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[color:var(--muted)]">Why Lithovolt</p>
            <h3 className="mt-4 text-4xl neon-title">Wholesale Engineered</h3>
            <p className="mt-4 text-[color:var(--muted)]">
              Track every battery, every warranty, and every business relationship with live status updates.
            </p>
          </div>
          <div className="grid gap-3 text-sm text-[color:var(--muted)]">
            <span>• Instant warranty certificate creation</span>
            <span>• Wholesale order tracking</span>
            <span>• Inventory allocation visibility</span>
          </div>
        </div>
    </div>
  )
}
