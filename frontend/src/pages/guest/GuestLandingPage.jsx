import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import lithovoltLogo from '../../assets/lithovolt-logo.png'
import { publicCatalogAPI } from '../../services/api'
import PublicSectionHeader from '../../components/public/PublicSectionHeader'

function normalizeList(data) {
  return Array.isArray(data) ? data : data?.results || data?.data || []
}

function toNumber(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export default function GuestLandingPage() {
  const { data: modelResponse, isLoading: isPopularLoading } = useQuery({
    queryKey: ['guest-home-popular-models'],
    queryFn: () => publicCatalogAPI.getBatteryModels({ per_page: 6 }),
    select: (response) => response.data,
  })

  const popularModels = useMemo(() => {
    const list = normalizeList(modelResponse)

    const ranked = [...list].sort((a, b) => {
      // Rank by practical selection signals: higher CCA, then higher capacity, then newest id.
      const ccaDiff = toNumber(b.cca) - toNumber(a.cca)
      if (ccaDiff !== 0) {
        return ccaDiff
      }

      const capacityA = toNumber(a.capacity_ah ?? a.capacity)
      const capacityB = toNumber(b.capacity_ah ?? b.capacity)
      const capacityDiff = capacityB - capacityA
      if (capacityDiff !== 0) {
        return capacityDiff
      }

      return toNumber(b.id) - toNumber(a.id)
    })

    return ranked.slice(0, 6)
  }, [modelResponse])

  return (
    <div className="space-y-6 md:space-y-7">
      <section className="panel-card guest-hero p-6 md:p-8">
        <div className="grid items-center gap-8 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="animate-fade-up">
            <PublicSectionHeader
              eyebrow="LithoVolt Guest Access"
              title="Powering smarter battery choices"
              description="Compare models, find vehicle-compatible options, and understand fitment with a faster, cleaner decision flow for both drivers and trade partners. Lithovolt combines practical battery data with simple decision tools, so you can move from uncertainty to the right battery in minutes."
              className="neon-title"
            />
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
                  <p>Response</p>
                </div>
                <div className="rounded-xl border border-[color:var(--border)] bg-black/20 p-2">
                  <p className="text-xl font-semibold text-[color:var(--accent)]">AU/NZ</p>
                  <p>Coverage</p>
                </div>
                <div className="rounded-xl border border-[color:var(--border)] bg-black/20 p-2">
                  <p className="text-xl font-semibold text-[color:var(--accent)]">Trade</p>
                  <p>Ready</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <article className="panel-card animate-fade-up p-4" style={{ animationDelay: '40ms' }}>
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Coverage</p>
          <h2 className="mt-2 text-2xl font-semibold text-[color:var(--accent)]">1,000+</h2>
          <p className="mt-1 text-sm text-[color:var(--muted)]">Vehicle fitment references</p>
        </article>
        <article className="panel-card animate-fade-up p-4" style={{ animationDelay: '90ms' }}>
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Catalog</p>
          <h2 className="mt-2 text-2xl font-semibold text-[color:var(--accent)]">Multi-type</h2>
          <p className="mt-1 text-sm text-[color:var(--muted)]">AGM, EFB, SMF, and specialty ranges</p>
        </article>
        <article className="panel-card animate-fade-up p-4" style={{ animationDelay: '140ms' }}>
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Workflow</p>
          <h2 className="mt-2 text-2xl font-semibold text-[color:var(--accent)]">3 Steps</h2>
          <p className="mt-1 text-sm text-[color:var(--muted)]">Search, compare, shortlist</p>
        </article>
        <article className="panel-card animate-fade-up p-4" style={{ animationDelay: '190ms' }}>
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Support</p>
          <h2 className="mt-2 text-2xl font-semibold text-[color:var(--accent)]">Human</h2>
          <p className="mt-1 text-sm text-[color:var(--muted)]">Pre-sales and installation guidance</p>
        </article>
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
        <div className="grid gap-5 lg:grid-cols-2">
          <article className="animate-fade-up">
            <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Battery Ranges</p>
            <h2 className="mt-2 text-2xl font-semibold">Solutions for daily commuters to heavy-use fleets</h2>
            <p className="mt-2 text-sm text-[color:var(--muted)]">
              Explore performance-focused options for urban driving, start-stop vehicles, 4WD setups, and high-demand electrical systems. Each listing is structured to help you compare the specs that matter: CCA, capacity, chemistry, and group size.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="tag">AGM</span>
              <span className="tag">EFB</span>
              <span className="tag">SMF</span>
              <span className="tag">Deep Cycle</span>
            </div>
          </article>

          <article className="panel-card panel-card-strong animate-fade-up p-4" style={{ animationDelay: '100ms' }}>
            <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">How It Works</p>
            <ol className="mt-3 space-y-3 text-sm text-[color:var(--muted)]">
              <li className="rounded-lg border border-[color:var(--border)] bg-black/15 p-3">
                <p className="font-semibold text-[color:var(--text)]">1. Enter your vehicle or browse models</p>
                <p className="mt-1">Start with registration lookup or model-first search.</p>
              </li>
              <li className="rounded-lg border border-[color:var(--border)] bg-black/15 p-3">
                <p className="font-semibold text-[color:var(--text)]">2. Compare compatible options</p>
                <p className="mt-1">Review key specs and shortlist suitable batteries quickly.</p>
              </li>
              <li className="rounded-lg border border-[color:var(--border)] bg-black/15 p-3">
                <p className="font-semibold text-[color:var(--text)]">3. Validate with support if needed</p>
                <p className="mt-1">Get fitment guidance for edge cases or trade requirements.</p>
              </li>
            </ol>
          </article>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="panel-card animate-fade-up p-5" style={{ animationDelay: '60ms' }}>
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">For Drivers</p>
          <h2 className="mt-2 text-xl font-semibold">Clear recommendations, less guesswork</h2>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            Use the guided lookup to get compatible options without technical overload. Ideal for first-time buyers and quick replacements.
          </p>
        </article>
        <article className="panel-card animate-fade-up p-5" style={{ animationDelay: '120ms' }}>
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">For Installers & Wholesale Teams</p>
          <h2 className="mt-2 text-xl font-semibold">Fast shortlisting for repeat workflows</h2>
          <p className="mt-2 text-sm text-[color:var(--muted)]">
            Reduce turnaround time with model data, spec comparisons, and direct support channels for volume and account onboarding.
          </p>
        </article>
      </section>

      <section className="panel-card p-5 md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <PublicSectionHeader
            eyebrow="Top Performance Picks"
            title="Ranked by CCA and capacity"
          />
          <Link to="/models" className="neon-btn-ghost">View Full Catalog</Link>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {(isPopularLoading
            ? Array.from({ length: 6 }).map((_, index) => ({ id: `popular-loading-${index}` }))
            : popularModels
          ).map((item) => (
            <article key={item.id} className="rounded-xl border border-[color:var(--border)] bg-black/20 p-4">
              {isPopularLoading ? (
                <>
                  <div className="h-4 w-24 rounded bg-white/10" />
                  <div className="mt-3 h-3 w-40 rounded bg-white/10" />
                  <div className="mt-4 h-3 w-28 rounded bg-white/10" />
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-[color:var(--accent)]">{item.model_code || item.sku || 'Lithovolt'}</p>
                  <h3 className="mt-2 text-lg font-semibold">{item.name || 'Model details available'}</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="tag">CCA {item.cca || '-'}</span>
                    <span className="tag">Cap {item.capacity_ah || item.capacity || '-'}Ah</span>
                  </div>
                  <p className="mt-2 text-sm text-[color:var(--muted)]">
                    {item.battery_type || item.chemistry || 'Battery type listed in details'}
                  </p>
                  <div className="mt-3">
                    <Link to={`/models/${item.id}`} className="neon-btn-ghost">View Model</Link>
                  </div>
                </>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="panel-card p-5 md:p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">What customers say</p>
        <div className="mt-3 grid gap-4 lg:grid-cols-3">
          <blockquote className="rounded-xl border border-[color:var(--border)] bg-black/20 p-4">
            <p className="text-sm text-[color:var(--text)]">“Lookup was quick and accurate. We got the right replacement on the first attempt.”</p>
            <footer className="mt-2 text-xs text-[color:var(--muted)]">Fleet Coordinator, Melbourne</footer>
          </blockquote>
          <blockquote className="rounded-xl border border-[color:var(--border)] bg-black/20 p-4">
            <p className="text-sm text-[color:var(--text)]">“The model comparison made it easy to explain options to our customers.”</p>
            <footer className="mt-2 text-xs text-[color:var(--muted)]">Workshop Lead, Brisbane</footer>
          </blockquote>
          <blockquote className="rounded-xl border border-[color:var(--border)] bg-black/20 p-4">
            <p className="text-sm text-[color:var(--text)]">“Great support response and clear guidance for a difficult fitment case.”</p>
            <footer className="mt-2 text-xs text-[color:var(--muted)]">Installer Partner, Sydney</footer>
          </blockquote>
        </div>
      </section>

      <section className="panel-card p-5 md:p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Trust & Compliance</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-[color:var(--border)] bg-black/15 p-4">
            <p className="text-sm font-semibold text-[color:var(--accent)]">Warranty-backed</p>
            <p className="mt-1 text-sm text-[color:var(--muted)]">Clear warranty registration and claim pathways.</p>
          </div>
          <div className="rounded-xl border border-[color:var(--border)] bg-black/15 p-4">
            <p className="text-sm font-semibold text-[color:var(--accent)]">Secure account flows</p>
            <p className="mt-1 text-sm text-[color:var(--muted)]">Role-based access for customers, trade, and admins.</p>
          </div>
          <div className="rounded-xl border border-[color:var(--border)] bg-black/15 p-4">
            <p className="text-sm font-semibold text-[color:var(--accent)]">Fitment confidence</p>
            <p className="mt-1 text-sm text-[color:var(--muted)]">Compatibility lookup and model-level specification visibility.</p>
          </div>
          <div className="rounded-xl border border-[color:var(--border)] bg-black/15 p-4">
            <p className="text-sm font-semibold text-[color:var(--accent)]">Human support</p>
            <p className="mt-1 text-sm text-[color:var(--muted)]">Direct contact channels for edge cases and onboarding help.</p>
          </div>
        </div>
      </section>

      <section className="panel-card p-5 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Need help now?</p>
            <h2 className="text-2xl font-semibold">Talk to Lithovolt support</h2>
            <p className="mt-1 text-sm text-[color:var(--muted)]">Share your vehicle details and goals, and we will help you choose confidently.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/contact" className="neon-btn">Contact Us</Link>
            <Link to="/support" className="neon-btn-secondary">Support Center</Link>
            <Link to="/find-battery" className="neon-btn-secondary">Start Lookup</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
