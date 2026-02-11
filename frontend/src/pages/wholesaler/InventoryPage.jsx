import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { inventoryAPI } from '../../services/api'

export default function InventoryPage() {
  const { data: serialsData, isLoading } = useQuery({
    queryKey: ['wholesaler-serials'],
    queryFn: () => inventoryAPI.getSerials({ ordering: '-created_at' }),
    select: (response) => response.data,
  })

  const serials = Array.isArray(serialsData) ? serialsData : serialsData?.results || []

  const summary = useMemo(() => {
    const map = new Map()
    serials.forEach((item) => {
      const key = item.battery_model_name || 'Unknown Model'
      if (!map.has(key)) {
        map.set(key, { model: key, allocated: 0, sold: 0 })
      }
      const entry = map.get(key)
      if (item.status === 'ALLOCATED') {
        entry.allocated += 1
      }
      if (item.status === 'SOLD') {
        entry.sold += 1
      }
    })
    return Array.from(map.values())
  }, [serials])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold neon-title">Inventory</h1>
        <p className="text-[color:var(--muted)]">Allocated stock and sales summary.</p>
      </div>

      <div className="panel-card p-6">
        <table className="data-table">
          <thead>
            <tr>
              <th>Battery Model</th>
              <th>Allocated</th>
              <th>Sold</th>
            </tr>
          </thead>
          <tbody>
            {(isLoading ? [] : summary).map((item) => (
              <tr key={item.model}>
                <td>{item.model}</td>
                <td>{item.allocated}</td>
                <td>{item.sold}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {isLoading ? <p className="mt-3 text-sm text-[color:var(--muted)]">Loading inventory...</p> : null}
        {!isLoading && summary.length === 0 ? (
          <p className="mt-3 text-sm text-[color:var(--muted)]">No allocated stock yet.</p>
        ) : null}
      </div>
    </div>
  )
}
