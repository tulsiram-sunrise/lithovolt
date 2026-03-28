import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { inventoryAPI } from '../../services/api'
import ShimmerTableRows from '../../components/common/ShimmerTableRows'

export default function InventoryPage() {
  const { data: serialsData, isLoading } = useQuery({
    queryKey: ['wholesaler-serials'],
    queryFn: () => inventoryAPI.getSerials({ ordering: '-created_at' }),
    select: (response) => response.data,
  })

  const serials = Array.isArray(serialsData) ? serialsData : serialsData?.results || serialsData?.data || []

  const summary = useMemo(() => {
    const map = new Map()
    serials.forEach((item) => {
      const key = item.product_name || item.battery_model_name || 'Unknown Item'
      if (!map.has(key)) {
        map.set(key, { itemName: key, allocated: 0, sold: 0 })
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
        <h1 className="text-3xl font-semibold neon-title">My Stock</h1>
        <p className="text-[color:var(--muted)]">Stock allocated to your shop by Lithovolt, with sold movement summary.</p>
      </div>

      <div className="panel-card p-6">
        <table className="data-table">
          <thead>
            <tr>
              <th>Catalog Item</th>
              <th>Allocated</th>
              <th>Sold</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? <ShimmerTableRows rows={5} columns={3} /> : null}
            {summary.map((item) => (
              <tr key={item.itemName}>
                <td>{item.itemName}</td>
                <td>{item.allocated}</td>
                <td>{item.sold}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && summary.length === 0 ? (
          <p className="mt-3 text-sm text-[color:var(--muted)]">No stock allocated to your shop yet.</p>
        ) : null}
      </div>
    </div>
  )
}
