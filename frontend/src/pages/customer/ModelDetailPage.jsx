import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { inventoryAPI } from '../../services/api'
import ProductImage from '../../components/common/ProductImage'

function valueOrDash(value) {
  return value === null || value === undefined || value === '' ? '-' : value
}

export default function CustomerModelDetailPage() {
  const { id } = useParams()

  const { data: model, isLoading, isError } = useQuery({
    queryKey: ['customer-model-detail', id],
    queryFn: () => inventoryAPI.getBatteryModel(id),
    select: (response) => response.data,
    enabled: !!id,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold neon-title">Battery Model Details</h1>
          <p className="text-[color:var(--muted)]">Complete technical and fitment-oriented specs.</p>
        </div>
        <Link to="/customer/models" className="neon-btn-secondary">Back to Catalog</Link>
      </div>

      {isLoading ? (
        <div className="panel-card p-6 animate-pulse" aria-hidden="true">
          <div className="h-6 w-64 rounded bg-white/10" />
          <div className="mt-3 h-4 w-96 rounded bg-white/10" />
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <div className="h-12 rounded bg-white/10" />
            <div className="h-12 rounded bg-white/10" />
            <div className="h-12 rounded bg-white/10" />
            <div className="h-12 rounded bg-white/10" />
          </div>
        </div>
      ) : null}

      {isError ? (
        <div className="panel-card p-6">
          <p className="text-[color:var(--danger)]">Unable to load model details.</p>
        </div>
      ) : null}

      {!isLoading && !isError && model ? (
        <div className="space-y-4">
          <div className="panel-card p-6">
            <div className="grid gap-4 md:grid-cols-[220px,1fr] md:items-center">
              <ProductImage
                src={model.image_url}
                alt={model.name || 'Battery model'}
                className="h-44 w-full"
                fallbackText="No model image"
              />
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-semibold">{valueOrDash(model.name)}</h2>
                    <p className="mt-1 text-sm text-[color:var(--muted)]">{valueOrDash(model.application_segment)}</p>
                  </div>
                  <span className="tag">{valueOrDash(model.series || 'LithoVolt')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="panel-card p-6">
              <h3 className="text-lg font-semibold">Core Specs</h3>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div><dt className="text-[color:var(--muted)]">Model Code</dt><dd>{valueOrDash(model.model_code || model.sku)}</dd></div>
                <div><dt className="text-[color:var(--muted)]">Battery Type</dt><dd>{valueOrDash(model.battery_type || model.chemistry)}</dd></div>
                <div><dt className="text-[color:var(--muted)]">CCA</dt><dd>{valueOrDash(model.cca)}</dd></div>
                <div><dt className="text-[color:var(--muted)]">Capacity (Ah)</dt><dd>{valueOrDash(model.capacity_ah || model.capacity)}</dd></div>
                <div><dt className="text-[color:var(--muted)]">Reserve Capacity</dt><dd>{valueOrDash(model.reserve_capacity)}</dd></div>
                <div><dt className="text-[color:var(--muted)]">Group Size</dt><dd>{valueOrDash(model.group_size)}</dd></div>
              </dl>
            </section>

            <section className="panel-card p-6">
              <h3 className="text-lg font-semibold">Dimensions</h3>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div><dt className="text-[color:var(--muted)]">Length (mm)</dt><dd>{valueOrDash(model.length_mm)}</dd></div>
                <div><dt className="text-[color:var(--muted)]">Width (mm)</dt><dd>{valueOrDash(model.width_mm)}</dd></div>
                <div><dt className="text-[color:var(--muted)]">Height (mm)</dt><dd>{valueOrDash(model.height_mm)}</dd></div>
                <div><dt className="text-[color:var(--muted)]">Total Height (mm)</dt><dd>{valueOrDash(model.total_height_mm)}</dd></div>
                <div><dt className="text-[color:var(--muted)]">Unit Weight (kg)</dt><dd>{valueOrDash(model.unit_weight_kg)}</dd></div>
              </dl>
            </section>

            <section className="panel-card p-6">
              <h3 className="text-lg font-semibold">Terminal & Build</h3>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div><dt className="text-[color:var(--muted)]">Terminal Type</dt><dd>{valueOrDash(model.terminal_type)}</dd></div>
                <div><dt className="text-[color:var(--muted)]">Terminal Layout</dt><dd>{valueOrDash(model.terminal_layout)}</dd></div>
                <div><dt className="text-[color:var(--muted)]">Hold Down</dt><dd>{valueOrDash(model.hold_down)}</dd></div>
                <div><dt className="text-[color:var(--muted)]">Vent Type</dt><dd>{valueOrDash(model.vent_type)}</dd></div>
                <div><dt className="text-[color:var(--muted)]">Maintenance Free</dt><dd>{model.maintenance_free === null || model.maintenance_free === undefined ? '-' : (model.maintenance_free ? 'Yes' : 'No')}</dd></div>
              </dl>
            </section>

            <section className="panel-card p-6">
              <h3 className="text-lg font-semibold">Warranty & Availability</h3>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div><dt className="text-[color:var(--muted)]">Private Warranty (mo)</dt><dd>{valueOrDash(model.private_warranty_months || model.warranty_months)}</dd></div>
                <div><dt className="text-[color:var(--muted)]">Commercial Warranty (mo)</dt><dd>{valueOrDash(model.commercial_warranty_months)}</dd></div>
                <div><dt className="text-[color:var(--muted)]">Available Qty</dt><dd>{valueOrDash(model.available_quantity)}</dd></div>
                <div><dt className="text-[color:var(--muted)]">Total Qty</dt><dd>{valueOrDash(model.total_quantity)}</dd></div>
              </dl>
            </section>
          </div>
        </div>
      ) : null}
    </div>
  )
}
