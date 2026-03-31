import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { inventoryAPI } from '../../services/api'
import ProductImage from '../../components/common/ProductImage'

function normalizeList(data) {
  return Array.isArray(data) ? data : data?.results || data?.data || []
}

export default function ModelCatalogPage() {
  const [query, setQuery] = useState('')
  const [series, setSeries] = useState('all')

  const { data, isLoading } = useQuery({
    queryKey: ['customer-model-catalog'],
    queryFn: () => inventoryAPI.getBatteryModels({ ordering: 'name', status: 'active' }),
    select: (response) => response.data,
  })

  const models = useMemo(() => {
    const base = normalizeList(data)
    const text = query.trim().toLowerCase()

    return base.filter((item) => {
      const seriesMatch = series === 'all' || (item.series || '').toLowerCase() === series
      const textMatch =
        !text ||
        (item.name || '').toLowerCase().includes(text) ||
        (item.model_code || item.sku || '').toLowerCase().includes(text) ||
        (item.application_segment || '').toLowerCase().includes(text)

      return seriesMatch && textMatch
    })
  }, [data, query, series])

  const seriesOptions = useMemo(() => {
    const all = normalizeList(data).map((item) => (item.series || '').toLowerCase()).filter(Boolean)
    return ['all', ...Array.from(new Set(all))]
  }, [data])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold neon-title">LithoVolt Model Catalog</h1>
        <p className="text-[color:var(--muted)]">Search by model code, segment, or series to shortlist the right battery.</p>
      </div>

      <div className="panel-card p-5">
        <div className="grid gap-3 md:grid-cols-[2fr,1fr]">
          <input
            className="neon-input"
            placeholder="Search by model code, name, or segment"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <select className="neon-input" value={series} onChange={(event) => setSeries(event.target.value)}>
            {seriesOptions.map((item) => (
              <option key={item} value={item}>
                {item === 'all' ? 'All Series' : item.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
            <article key={`catalog-shimmer-${index}`} className="panel-card p-5 animate-pulse" aria-hidden="true">
              <div className="h-5 w-40 rounded bg-white/10" />
              <div className="mt-3 h-4 w-64 rounded bg-white/10" />
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="h-10 rounded bg-white/10" />
                <div className="h-10 rounded bg-white/10" />
                <div className="h-10 rounded bg-white/10" />
                <div className="h-10 rounded bg-white/10" />
              </div>
            </article>
          ))
          : models.map((item) => (
          <article key={item.id} className="panel-card p-5">
            <ProductImage
              src={item.image_url}
              alt={item.name || item.model_code || item.sku || 'Battery model'}
              className="mb-4 h-44 w-full"
              fallbackText="No model image"
            />
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">{item.name}</h2>
                <p className="text-sm text-[color:var(--muted)]">{item.application_segment || 'General automotive use'}</p>
              </div>
              <span className="tag">{item.series || 'LithoVolt'}</span>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-[color:var(--muted)]">Model</dt>
                <dd>{item.model_code || item.sku}</dd>
              </div>
              <div>
                <dt className="text-[color:var(--muted)]">Type</dt>
                <dd>{item.battery_type || item.chemistry || '-'}</dd>
              </div>
              <div>
                <dt className="text-[color:var(--muted)]">CCA</dt>
                <dd>{item.cca || '-'}</dd>
              </div>
              <div>
                <dt className="text-[color:var(--muted)]">Ah</dt>
                <dd>{item.capacity_ah || item.capacity || '-'}</dd>
              </div>
            </dl>
            <div className="mt-4">
              <Link to={`/customer/models/${item.id}`} className="neon-btn-ghost">View Details</Link>
            </div>
          </article>
          ))}
      </div>

      {!isLoading && models.length === 0 ? <p className="text-sm text-[color:var(--muted)]">No models match your filters.</p> : null}
    </div>
  )
}
