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

export default function GuestAboutPage() {
  return (
    <div className="space-y-6">
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

      <section className="panel-card p-5 md:p-6">
        <h2 className="text-2xl font-semibold">Our public platform mission</h2>
        <p className="mt-2 text-sm text-[color:var(--muted)] md:text-base">
          Help every user quickly answer one question: which battery should I trust for this vehicle and usage profile? The guest journey is optimized to make that answer fast and transparent.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/models" className="neon-btn">Explore Models</Link>
          <Link to="/contact" className="neon-btn-secondary">Talk to the Team</Link>
        </div>
      </section>
    </div>
  )
}
