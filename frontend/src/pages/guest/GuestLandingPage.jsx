import { Link } from 'react-router-dom'

export default function GuestLandingPage() {
  return (
    <div className="space-y-6">
      <section className="panel-card guest-hero p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.32em] text-[color:var(--muted)]">LithoVolt Guest Access</p>
        <h1 className="mt-2 text-3xl font-semibold neon-title md:text-4xl">Find the right LithoVolt battery in minutes</h1>
        <p className="mt-3 max-w-2xl text-sm text-[color:var(--muted)] md:text-base">
          Explore our battery models and use vehicle registration lookup to shortlist the best match for your car, SUV, or ute.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/find-battery" className="neon-btn">Find by Vehicle</Link>
          <Link to="/models" className="neon-btn-secondary">Browse Models</Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="panel-card p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Catalog</p>
          <h2 className="mt-2 text-xl font-semibold">Brand-first model search</h2>
          <p className="mt-2 text-sm text-[color:var(--muted)]">Filter by model code, battery type, and series.</p>
        </article>
        <article className="panel-card p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Vehicle Match</p>
          <h2 className="mt-2 text-xl font-semibold">Registration lookup</h2>
          <p className="mt-2 text-sm text-[color:var(--muted)]">Find recommended batteries by registration with manual fallback.</p>
        </article>
        <article className="panel-card p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Confidence</p>
          <h2 className="mt-2 text-xl font-semibold">Fitment recommendations</h2>
          <p className="mt-2 text-sm text-[color:var(--muted)]">See primary and alternate recommendations instantly.</p>
        </article>
      </section>
    </div>
  )
}
