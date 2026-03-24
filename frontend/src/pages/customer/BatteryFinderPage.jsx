import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { fitmentAPI } from '../../services/api'

export default function BatteryFinderPage() {
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold neon-title">Find Battery</h1>
        <p className="text-[color:var(--muted)]">Choose lookup mode: by vehicle details or by registration and state.</p>
      </div>

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
              placeholder="Make (Toyota)"
              value={form.make}
              onChange={(e) => setForm((s) => ({ ...s, make: e.target.value }))}
            />
            <input
              className="neon-input"
              placeholder="Model (Hilux)"
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
          <div className="grid gap-3 md:grid-cols-3">
            <input
              className="neon-input md:col-span-2"
              placeholder="Registration number"
              value={form.registration_number}
              onChange={(e) => setForm((s) => ({ ...s, registration_number: e.target.value }))}
            />
            <input
              className="neon-input"
              placeholder="State code (NSW/VIC)"
              value={form.state_code}
              onChange={(e) => setForm((s) => ({ ...s, state_code: e.target.value.toUpperCase() }))}
            />
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            className="neon-btn"
            disabled={!canSearch || lookup.isPending}
            onClick={() => lookup.mutate()}
          >
            {lookup.isPending ? 'Checking...' : 'Find Matching Battery'}
          </button>
        </div>
      </div>

      {lookup.data ? (
        <div className="space-y-4">
          <div className="panel-card p-5">
            <p className="text-sm text-[color:var(--muted)]">Lookup Source: {lookup.data.source || 'n/a'}</p>
            <h2 className="mt-1 text-xl font-semibold">
              {lookup.data.vehicle
                ? `${lookup.data.vehicle.make} ${lookup.data.vehicle.model} ${lookup.data.vehicle.variant || ''}`.trim()
                : 'No vehicle match found'}
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {(lookup.data.recommendations || []).map((item, idx) => (
              <article key={`${item.priority}-${idx}`} className="panel-card p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{item.battery?.name || 'Recommended battery'}</h3>
                  <span className="tag">{item.recommendation_type || 'PRIMARY'}</span>
                </div>
                <p className="mt-2 text-sm text-[color:var(--muted)]">Model: {item.battery?.model_code || item.battery?.sku || '-'}</p>
                <p className="mt-1 text-sm text-[color:var(--muted)]">Type: {item.battery?.battery_type || item.battery?.chemistry || '-'}</p>
                <p className="mt-1 text-sm text-[color:var(--muted)]">CCA: {item.battery?.cca || '-'}</p>
              </article>
            ))}
          </div>

          {(!lookup.data.recommendations || lookup.data.recommendations.length === 0) ? (
            <p className="text-sm text-[color:var(--muted)]">No battery recommendations available for this lookup.</p>
          ) : null}
        </div>
      ) : null}

      {lookup.isError ? <p className="text-sm text-[color:var(--danger)]">Lookup failed. Please verify input and try again.</p> : null}
    </div>
  )
}
