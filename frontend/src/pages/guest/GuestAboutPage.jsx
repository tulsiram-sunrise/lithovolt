import { Link } from 'react-router-dom'
import lithovoltLogo from '../../assets/lithovolt-logo.png'

const values = [
  {
    title: 'Reliability First',
    description: 'Every recommendation flow is designed to reduce bad battery matches and installation rework.',
  },
  {
    title: 'Trade + Consumer Friendly',
    description: 'A single platform experience that supports individual buyers and wholesale operations.',
  },
  {
    title: 'Data-Guided Fitment',
    description: 'Model details and compatibility lookup are surfaced with practical decision context.',
  },
]

const milestones = [
  {
    year: '2022',
    title: 'Platform Foundation',
    description: 'Started with a focused mission: simplify battery selection with practical fitment guidance.',
  },
  {
    year: '2024',
    title: 'Trade Workflow Expansion',
    description: 'Added wholesale-oriented tools for account onboarding and faster model shortlisting.',
  },
  {
    year: '2026',
    title: 'Public Discovery Refresh',
    description: 'Unified guest experience across catalog, support, and fitment journeys for cleaner decisions.',
  },
]

export default function GuestAboutPage() {
  return (
    <div className="space-y-6 md:space-y-7">
      <section className="panel-card guest-hero p-6 md:p-8">
        <div className="grid items-center gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="panel-card panel-card-strong animate-fade-up p-6">
            <img src={lithovoltLogo} alt="Lithovolt" className="mx-auto h-24 w-auto object-contain md:h-28" />
          </div>
          <div className="animate-fade-up" style={{ animationDelay: '120ms' }}>
            <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">About Lithovolt</p>
            <h1 className="mt-2 text-3xl font-semibold neon-title md:text-4xl">Energy products with practical confidence</h1>
            <p className="mt-3 text-sm text-[color:var(--muted)] md:text-base">
              Lithovolt builds dependable battery solutions and a cleaner digital journey around selection, fitment, and post-purchase support.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {values.map((value, index) => (
          <article
            key={value.title}
            className="panel-card animate-fade-up p-5"
            style={{ animationDelay: `${80 + index * 80}ms` }}
          >
            <h2 className="text-xl font-semibold">{value.title}</h2>
            <p className="mt-2 text-sm text-[color:var(--muted)]">{value.description}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <article className="panel-card animate-fade-up p-4" style={{ animationDelay: '60ms' }}>
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Focus</p>
          <h2 className="mt-2 text-2xl font-semibold text-[color:var(--accent)]">Fitment</h2>
          <p className="mt-1 text-sm text-[color:var(--muted)]">Recommendation quality over generic search noise.</p>
        </article>
        <article className="panel-card animate-fade-up p-4" style={{ animationDelay: '100ms' }}>
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Coverage</p>
          <h2 className="mt-2 text-2xl font-semibold text-[color:var(--accent)]">AU/NZ</h2>
          <p className="mt-1 text-sm text-[color:var(--muted)]">Built for regional market and vehicle realities.</p>
        </article>
        <article className="panel-card animate-fade-up p-4" style={{ animationDelay: '140ms' }}>
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Support</p>
          <h2 className="mt-2 text-2xl font-semibold text-[color:var(--accent)]">Human</h2>
          <p className="mt-1 text-sm text-[color:var(--muted)]">Pre-sales and edge-case escalation channels.</p>
        </article>
        <article className="panel-card animate-fade-up p-4" style={{ animationDelay: '180ms' }}>
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Audience</p>
          <h2 className="mt-2 text-2xl font-semibold text-[color:var(--accent)]">Dual</h2>
          <p className="mt-1 text-sm text-[color:var(--muted)]">Drivers and trade teams in one flow.</p>
        </article>
      </section>

      <section className="panel-card p-5 md:p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Journey</p>
        <h2 className="mt-2 text-2xl font-semibold">How Lithovolt evolved</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {milestones.map((item, index) => (
            <article key={item.year} className="rounded-xl border border-[color:var(--border)] bg-black/15 p-4 animate-fade-up" style={{ animationDelay: `${60 + index * 60}ms` }}>
              <p className="text-sm font-semibold text-[color:var(--accent)]">{item.year}</p>
              <h3 className="mt-1 text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-[color:var(--muted)]">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel-card p-5 md:p-6">
        <h2 className="text-2xl font-semibold">Our public platform mission</h2>
        <p className="mt-2 text-sm text-[color:var(--muted)] md:text-base">
          Help every user quickly answer one question: which battery should I trust for this vehicle and usage profile? The guest journey is optimized to make that answer fast and transparent.
        </p>
        <p className="mt-2 text-sm text-[color:var(--muted)] md:text-base">
          We design around clarity: accurate specs, understandable trade-offs, and direct support when automated recommendations are not enough.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/models" className="neon-btn">Explore Models</Link>
          <Link to="/contact" className="neon-btn-secondary">Talk to the Team</Link>
        </div>
      </section>
    </div>
  )
}
