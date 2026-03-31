import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { publicCatalogAPI } from '../../services/api'
import PublicSectionHeader from '../../components/public/PublicSectionHeader'
import ProductImage from '../../components/common/ProductImage'

function normalizeList(data) {
  return Array.isArray(data) ? data : data?.results || data?.data || []
}

export default function GuestModelCatalogPage() {
  const [query, setQuery] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['guest-model-catalog'],
    queryFn: () => publicCatalogAPI.getBatteryModels({ per_page: 60 }),
    select: (response) => response.data,
  })

  const models = useMemo(() => {
    const list = normalizeList(data)
    const term = query.trim().toLowerCase()
    if (!term) {
      return list
    }

    return list.filter((item) => {
      const target = [
        item.name,
        item.model_code,
        item.sku,
        item.series,
        item.application_segment,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return target.includes(term)
    })
  }, [data, query])

  return (
    <div className="space-y-6 md:space-y-7">
      <section className="panel-card guest-hero p-6 md:p-8">
        <PublicSectionHeader
          eyebrow="Model Catalog"
          title="Guest Model Browser"
          description="Search LithoVolt battery models by code, segment, and battery type."
          className="neon-title"
        />
      </section>

      <div className="panel-card p-5">
        <input
          className="neon-input"
          placeholder="Try: MF95D31R, AGM, LV Premium, SUV"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(isLoading ? Array.from({ length: 6 }).map((_, index) => ({ id: `guest-model-shimmer-${index}` })) : models).map((item) => (
          <article key={item.id} className="panel-card p-5">
            <ProductImage
              src={item.image_url}
              alt={item.name || item.model_code || item.sku || 'Battery model'}
              className="mb-4 h-40 w-full"
              fallbackText="No model image"
            />
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-semibold">{item.model_code || item.sku}</h2>
              <span className="tag">{item.series || 'LithoVolt'}</span>
            </div>
            <p className="mt-2 text-sm text-[color:var(--muted)]">{item.name}</p>
            <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
              {isLoading
                ? (
                  <>
                    <div className="h-10 rounded bg-white/10" />
                    <div className="h-10 rounded bg-white/10" />
                    <div className="h-10 rounded bg-white/10" />
                    <div className="h-10 rounded bg-white/10" />
                  </>
                )
                : (
                  <>
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
                    <div>
                      <dt className="text-[color:var(--muted)]">Group</dt>
                      <dd>{item.group_size || '-'}</dd>
                    </div>
                  </>
                )}
            </dl>
            {!isLoading ? (
              <div className="mt-4">
                <Link to={`/models/${item.id}`} className="neon-btn-ghost">View Details</Link>
              </div>
            ) : null}
          </article>
        ))}
      </div>

      {!isLoading && models.length === 0 ? <p className="text-sm text-[color:var(--muted)]">No models found.</p> : null}
    </div>
  )
}
