import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { inventoryAPI, orderAPI } from '../../services/api'

export default function WholesalerDashboard() {
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['wholesaler-orders'],
    queryFn: () => orderAPI.getOrders({ ordering: '-created_at' }),
    select: (response) => response.data,
  })

  const { data: serialsData, isLoading: serialsLoading } = useQuery({
    queryKey: ['wholesaler-serials'],
    queryFn: () => inventoryAPI.getSerials({ ordering: '-created_at' }),
    select: (response) => response.data,
  })

  const orders = useMemo(() => {
    const list = Array.isArray(ordersData) ? ordersData : ordersData?.results || []
    return list
  }, [ordersData])

  const serials = useMemo(() => {
    const list = Array.isArray(serialsData) ? serialsData : serialsData?.results || []
    return list
  }, [serialsData])

  const stats = useMemo(() => {
    const pending = orders.filter((order) => order.status === 'PENDING').length
    const accepted = orders.filter((order) => order.status === 'ACCEPTED').length
    const fulfilled = orders.filter((order) => order.status === 'FULFILLED').length
    const allocatedStock = serials.filter((item) => item.status === 'ALLOCATED').length

    return [
      { label: 'Pending Orders', value: pending },
      { label: 'Accepted Orders', value: accepted },
      { label: 'Fulfilled Orders', value: fulfilled },
      { label: 'Allocated Stock', value: allocatedStock },
    ]
  }, [orders, serials])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold neon-title">Wholesaler Hub</h1>
          <p className="text-[color:var(--muted)]">Track orders and inventory in real time.</p>
        </div>
        <div className="flex gap-3">
          <Link className="neon-btn" to="/wholesaler/orders">Place Order</Link>
          <button className="neon-btn-secondary" type="button" disabled>
            Statement (soon)
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <p className="stat-label">{stat.label}</p>
            <p className="stat-value mt-3">
              {ordersLoading || serialsLoading ? '...' : stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="panel-card p-6">
        <h2 className="text-lg font-semibold">Next Actions</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="panel-card panel-card-strong p-4">
            <p className="text-sm text-[color:var(--muted)]">Pending approvals</p>
            <p className="mt-2 text-xl font-semibold">{ordersLoading ? '...' : stats[0].value} orders</p>
          </div>
          <div className="panel-card panel-card-strong p-4">
            <p className="text-sm text-[color:var(--muted)]">Stock to receive</p>
            <p className="mt-2 text-xl font-semibold">{serialsLoading ? '...' : stats[3].value} units</p>
          </div>
          <div className="panel-card panel-card-strong p-4">
            <p className="text-sm text-[color:var(--muted)]">Fulfilled orders</p>
            <p className="mt-2 text-xl font-semibold">{ordersLoading ? '...' : stats[2].value} orders</p>
          </div>
        </div>
      </div>
    </div>
  )
}
