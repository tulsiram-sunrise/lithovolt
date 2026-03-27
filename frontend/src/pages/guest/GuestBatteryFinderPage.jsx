import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { fitmentAPI } from '../../services/api'
import PublicSectionHeader from '../../components/public/PublicSectionHeader'

export default function GuestBatteryFinderPage() {
  const [mode, setMode] = useState('vehicle')
  const [form, setForm] = useState({
    registration_number: '',
    state_code: 'NSW',
    market: 'AU',
    make: '',
    model: '',
    year: '',
  })

  const lookup = useMutation({
    mutationFn: async () => {
      if (mode === 'vehicle') {
        const payload = {
          make: form.make,
          model: form.model,
          year: form.year ? Number(form.year) : undefined,
          market: form.market || 'AU',
        }

        const response = await fitmentAPI.vehicleLookup(payload)
        return response.data
      }

      const payload = {
        registration_number: form.registration_number,
        state_code: form.state_code || null,
        market: form.market || 'AU',
      }

      const response = await fitmentAPI.registrationLookup(payload)
      return response.data
    },
  })

  const canSearch =
    mode === 'vehicle'
      ? Boolean(form.make.trim() && form.model.trim())
      : Boolean(form.registration_number.trim() && form.state_code.trim())

  return (
    <div className="space-y-6 md:space-y-7">
      <section className="panel-card guest-hero p-6 md:p-8">
        <PublicSectionHeader
          eyebrow="Battery Finder"
          title="Find My LithoVolt Battery"
          description="Choose a lookup mode below. Start with vehicle details or use registration + state for faster fitment recommendations."
          className="neon-title"
        />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="panel-card p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Mode 1</p>
          <h2 className="mt-2 text-lg font-semibold">Vehicle Details</h2>
          <p className="mt-1 text-sm text-[color:var(--muted)]">Best when you know make/model and want manual control.</p>
        </article>
        <article className="panel-card p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Mode 2</p>
          <h2 className="mt-2 text-lg font-semibold">Registration + State</h2>
          <p className="mt-1 text-sm text-[color:var(--muted)]">Best for quick checks and everyday replacement flows.</p>
        </article>
        <article className="panel-card p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">Support</p>
          <h2 className="mt-2 text-lg font-semibold">Need verification?</h2>
          <p className="mt-1 text-sm text-[color:var(--muted)]">Use Contact page for edge cases and trade recommendations.</p>
        </article>
      </section>

      <div className="panel-card p-6">
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            className={mode === 'vehicle' ? 'neon-btn' : 'neon-btn-secondary'}
            onClick={() => setMode('vehicle')}
          >
            By Vehicle
          </button>
          <button
            className={mode === 'rego' ? 'neon-btn' : 'neon-btn-secondary'}
            onClick={() => setMode('rego')}
          >
            By Rego + State
          </button>
        </div>

        {mode === 'vehicle' ? (
          <div className="grid gap-3 md:grid-cols-3">
            <input
              className="neon-input"
              placeholder="Make"
              value={form.make}
              onChange={(e) => setForm((s) => ({ ...s, make: e.target.value }))}
            />
            <input
              className="neon-input"
              placeholder="Model"
              value={form.model}
              onChange={(e) => setForm((s) => ({ ...s, model: e.target.value }))}
            />
            <input
              className="neon-input"
              placeholder="Year (optional)"
              value={form.year}
              onChange={(e) => setForm((s) => ({ ...s, year: e.target.value }))}
            />
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            <input
              className="neon-input"
              placeholder="Registration number"
              value={form.registration_number}
              onChange={(e) => setForm((s) => ({ ...s, registration_number: e.target.value }))}
            />
            <input
              className="neon-input"
              placeholder="State code"
              value={form.state_code}
              onChange={(e) => setForm((s) => ({ ...s, state_code: e.target.value.toUpperCase() }))}
            />
          </div>
        )}

        <button
          className="neon-btn mt-4"
          disabled={!canSearch || lookup.isPending}
          onClick={() => lookup.mutate()}
        >
          {lookup.isPending ? 'Finding...' : 'Get Recommendation'}
        </button>
      </div>

      {lookup.data ? (
        <div className="space-y-4">
          <div className="panel-card p-5">
            <p className="text-sm text-[color:var(--muted)]">Result Source: {lookup.data.source || 'n/a'}</p>
            <p className="mt-1 text-lg font-semibold">
              {lookup.data.vehicle
                ? `${lookup.data.vehicle.make} ${lookup.data.vehicle.model} ${lookup.data.vehicle.variant || ''}`.trim()
                : 'No vehicle matched'}
            </p>
            <p className="mt-2 text-sm text-[color:var(--muted)]">
              These recommendations are based on available fitment data. Confirm terminal layout and dimensions before installation.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {(lookup.data.recommendations || []).map((item, idx) => (
              <article key={`${item.priority}-${idx}`} className="panel-card p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{item.battery?.name || 'Recommended model'}</h3>
                  <span className="tag">{item.recommendation_type || 'PRIMARY'}</span>
                </div>
                <p className="mt-2 text-sm text-[color:var(--muted)]">Model Code: {item.battery?.model_code || item.battery?.sku || '-'}</p>
                <p className="mt-1 text-sm text-[color:var(--muted)]">Battery Type: {item.battery?.battery_type || item.battery?.chemistry || '-'}</p>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      <section className="panel-card p-5 md:p-6">
        <h2 className="text-2xl font-semibold">Tips for better results</h2>
        <ul className="mt-3 grid gap-3 text-sm text-[color:var(--muted)] md:grid-cols-2">
          <li className="rounded-lg border border-[color:var(--border)] bg-black/15 p-3">Double-check registration format and state code.</li>
          <li className="rounded-lg border border-[color:var(--border)] bg-black/15 p-3">For modified vehicles, compare dimensions and terminal layout.</li>
          <li className="rounded-lg border border-[color:var(--border)] bg-black/15 p-3">Prefer AGM/EFB for higher electrical load profiles.</li>
          <li className="rounded-lg border border-[color:var(--border)] bg-black/15 p-3">Contact support if you need trade or fleet guidance.</li>
        </ul>
      </section>

      {lookup.isError ? <p className="text-sm text-[color:var(--danger)]">Unable to fetch recommendations right now.</p> : null}
    </div>
  )
}
