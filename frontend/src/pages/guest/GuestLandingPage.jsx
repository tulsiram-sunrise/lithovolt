import { Link } from 'react-router-dom'
import lithovoltLogo from '../../assets/lithovolt-logo.png'

export default function GuestLandingPage() {
  return (
    <div className="space-y-6">
      <section className="panel-card guest-hero p-6 md:p-8">
        <div className="grid items-center gap-8 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="animate-fade-up">
            <p className="text-xs uppercase tracking-[0.32em] text-[color:var(--muted)]">LithoVolt Guest Access</p>
            <h1 className="mt-2 text-3xl font-semibold neon-title md:text-5xl">Powering smarter battery choices</h1>
            <p className="mt-3 max-w-2xl text-sm text-[color:var(--muted)] md:text-base">
              Compare models, find vehicle-compatible options, and understand fitment with a faster, cleaner decision flow for both drivers and trade partners.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/find-battery" className="neon-btn">Find by Vehicle</Link>
              <Link to="/models" className="neon-btn-secondary">Browse Models</Link>
              <Link to="/about" className="neon-btn-secondary">About Lithovolt</Link>
            </div>
          </div>

          <div className="panel-card panel-card-strong animate-fade-up p-5" style={{ animationDelay: '120ms' }}>
            <img src={lithovoltLogo} alt="Lithovolt" className="mx-auto h-20 w-auto object-contain md:h-24" />
            <div className="mt-4 space-y-2 text-sm text-[color:var(--muted)]">
              <p className="text-center">Trusted by daily drivers, installers, and wholesale networks.</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl border border-[color:var(--border)] bg-black/20 p-2">
                  <p className="text-xl font-semibold text-[color:var(--accent)]">24h</p>
                  <p>Support</p>
                </div>
                <div className="rounded-xl border border-[color:var(--border)] bg-black/20 p-2">
                  <p className="text-xl font-semibold text-[color:var(--accent)]">Fast</p>
                  <p>Lookup</p>
                </div>
                <div className="rounded-xl border border-[color:var(--border)] bg-black/20 p-2">
                  <p className="text-xl font-semibold text-[color:var(--accent)]">Fit</p>
                  <p>Guidance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="panel-card animate-fade-up p-5" style={{ animationDelay: '40ms' }}>
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Catalog</p>
          <h2 className="mt-2 text-xl font-semibold">Brand-first model search</h2>
          <p className="mt-2 text-sm text-[color:var(--muted)]">Filter by model code, battery type, chemistry, and series without noise.</p>
        </article>
        <article className="panel-card animate-fade-up p-5" style={{ animationDelay: '120ms' }}>
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Vehicle Match</p>
          <h2 className="mt-2 text-xl font-semibold">Registration lookup</h2>
          <p className="mt-2 text-sm text-[color:var(--muted)]">Find recommended batteries by registration with a clear manual fallback path.</p>
        </article>
        <article className="panel-card animate-fade-up p-5" style={{ animationDelay: '200ms' }}>
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Support</p>
          <h2 className="mt-2 text-xl font-semibold">Pre-sales and fitment help</h2>
          <p className="mt-2 text-sm text-[color:var(--muted)]">Reach the team quickly for product, compatibility, and wholesale onboarding questions.</p>
        </article>
      </section>

      <section className="panel-card p-5 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Need help now?</p>
            <h2 className="text-2xl font-semibold">Talk to Lithovolt support</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/contact" className="neon-btn">Contact Us</Link>
            <Link to="/support" className="neon-btn-secondary">Support Center</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
