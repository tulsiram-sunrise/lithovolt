import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { inventoryAPI } from '../../services/api'

export default function BatteryModelDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: model, isLoading, isError, error } = useQuery({
    queryKey: ['battery-model', id],
    queryFn: () => inventoryAPI.getCatalogItem(id),
    select: (response) => response.data,
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold neon-title">Loading...</h1>
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold neon-title">Error</h1>
            <p className="text-[color:var(--muted)]">{error?.response?.data?.message || 'Unable to load model.'}</p>
          </div>
          <Link className="neon-btn-secondary" to="/admin/battery-models">Back To List</Link>
        </div>
      </div>
    )
  }

  if (!model) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold neon-title">Not Found</h1>
            <p className="text-[color:var(--muted)]">Battery model not found.</p>
          </div>
          <Link className="neon-btn-secondary" to="/admin/battery-models">Back To List</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold neon-title">{model.name}</h1>
          <p className="text-[color:var(--muted)]">SKU: {model.sku}</p>
        </div>
        <div className="flex gap-3">
          <button className="neon-btn" onClick={() => navigate(`/admin/battery-models/${model.id}/edit`)}>
            Edit Model
          </button>
          <Link className="neon-btn-secondary" to="/admin/battery-models">Back To List</Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <div className="panel-card p-6">
          <h3 className="mb-6 text-base font-bold uppercase text-[color:var(--text-primary)] tracking-wider">Basic Information</h3>
          <div className="space-y-3">
            <DetailRow label="Name" value={model.name} />
            <DetailRow label="SKU" value={model.sku} />
            <DetailRow label="Brand" value={model.brand} />
            <DetailRow label="Series" value={model.series} />
            <DetailRow label="Model Code" value={model.model_code} />
            <DetailRow label="Group Size" value={model.group_size} />
          </div>
        </div>

        {/* Electrical Specifications */}
        <div className="panel-card p-6">
          <h3 className="mb-6 text-base font-bold uppercase text-[color:var(--text-primary)] tracking-wider">Electrical Specifications</h3>
          <div className="space-y-3">
            <DetailRow label="Voltage" value={model.voltage} />
            <DetailRow label="Capacity" value={model.capacity} />
            <DetailRow label="Capacity (Ah)" value={model.capacity_ah} />
            <DetailRow label="Chemistry" value={model.chemistry} />
            <DetailRow label="Battery Type" value={model.battery_type} />
            <DetailRow label="CCA" value={model.cca} />
            <DetailRow label="Reserve Capacity" value={model.reserve_capacity} />
          </div>
        </div>

        {/* Physical Dimensions */}
        <div className="panel-card p-6">
          <h3 className="mb-6 text-base font-bold uppercase text-[color:var(--text-primary)] tracking-wider">Physical Dimensions</h3>
          <div className="space-y-3">
            <DetailRow label="Length (mm)" value={model.length_mm} />
            <DetailRow label="Width (mm)" value={model.width_mm} />
            <DetailRow label="Height (mm)" value={model.height_mm} />
            <DetailRow label="Total Height (mm)" value={model.total_height_mm} />
            <DetailRow label="Unit Weight (kg)" value={model.unit_weight_kg} />
          </div>
        </div>

        {/* Terminal & Configuration */}
        <div className="panel-card p-6">
          <h3 className="mb-6 text-base font-bold uppercase text-[color:var(--text-primary)] tracking-wider">Terminal & Configuration</h3>
          <div className="space-y-3">
            <DetailRow label="Terminal Type" value={model.terminal_type} />
            <DetailRow label="Terminal Layout" value={model.terminal_layout} />
            <DetailRow label="Hold Down" value={model.hold_down} />
            <DetailRow label="Vent Type" value={model.vent_type} />
            <DetailRow label="Maintenance Free" value={model.maintenance_free ? 'Yes' : 'No'} />
          </div>
        </div>

        {/* Warranty & Coverage */}
        <div className="panel-card p-6">
          <h3 className="mb-6 text-base font-bold uppercase text-[color:var(--text-primary)] tracking-wider">Warranty & Coverage</h3>
          <div className="space-y-3">
            <DetailRow label="Warranty (months)" value={model.warranty_months} />
            <DetailRow label="Private Warranty (months)" value={model.private_warranty_months} />
            <DetailRow label="Commercial Warranty (months)" value={model.commercial_warranty_months} />
          </div>
        </div>

        {/* Inventory & Pricing */}
        <div className="panel-card p-6">
          <h3 className="mb-6 text-base font-bold uppercase text-[color:var(--text-primary)] tracking-wider">Inventory & Pricing</h3>
          <div className="space-y-3">
            <DetailRow label="Total Quantity" value={model.total_quantity} />
            <DetailRow label="Available Quantity" value={model.available_quantity} />
            <DetailRow label="Price" value={`$${Number(model.price || 0).toFixed(2)}`} />
            <DetailRow label="Status" value={<span className="capitalize">{model.status}</span>} />
          </div>
        </div>

        {/* Additional Information */}
        <div className="panel-card p-6 md:col-span-2">
          <h3 className="mb-6 text-base font-bold uppercase text-[color:var(--text-primary)] tracking-wider">Additional Information</h3>
          <div className="space-y-3">
            <DetailRow label="Application Segment" value={model.application_segment} />
            <DetailRow label="Datasheet URL" value={model.datasheet_url ? <a href={model.datasheet_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">{model.datasheet_url}</a> : '-'} />
          </div>
        </div>

        {/* Description */}
        {model.description && (
          <div className="panel-card p-6 md:col-span-2">
            <h3 className="mb-6 text-base font-bold uppercase text-[color:var(--text-primary)] tracking-wider">Description</h3>
            <p className="text-[color:var(--text-secondary)]">{model.description}</p>
          </div>
        )}

        {/* Specs */}
        {model.specs && typeof model.specs === 'object' && Object.keys(model.specs).length > 0 && (
          <div className="panel-card p-6 md:col-span-2">
            <h3 className="mb-6 text-base font-bold uppercase text-[color:var(--text-primary)] tracking-wider">Specifications</h3>
            <pre className="overflow-x-auto rounded bg-[color:var(--bg-secondary)] p-3 text-sm text-[color:var(--text-secondary)]">
              {JSON.stringify(model.specs, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-sm text-[color:var(--text-secondary)]">{label}</span>
      <span className="text-sm font-medium text-[color:var(--text-primary)]">{value || '-'}</span>
    </div>
  )
}
