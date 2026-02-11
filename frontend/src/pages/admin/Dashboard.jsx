import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminAPI, orderAPI } from '../../services/api'

export default function AdminDashboard() {
  const {
    data: metrics,
    isLoading: metricsLoading,
    error: metricsError,
  } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: adminAPI.getMetrics,
    select: (response) => response.data,
  })

  const {
    data: orderData,
    isLoading: ordersLoading,
    error: ordersError,
  } = useQuery({
    queryKey: ['admin-recent-orders'],
    queryFn: () => orderAPI.getOrders({ ordering: '-created_at' }),
    select: (response) => response.data,
  })

  const recentOrders = useMemo(() => {
    const list = Array.isArray(orderData) ? orderData : orderData?.results || []
    return list.slice(0, 6)
  }, [orderData])

  const stats = useMemo(() => {
    const users = metrics?.users_by_role || {}
    const totalUsers = Object.values(users).reduce((sum, value) => sum + value, 0)
    const orders = metrics?.orders_by_status || {}
    const activeOrders = (orders.PENDING || 0) + (orders.ACCEPTED || 0)
    const warranties = metrics?.warranties_by_status || {}
    const totalWarranties = Object.values(warranties).reduce((sum, value) => sum + value, 0)

    return [
      { label: 'Total Users', value: totalUsers, trend: `${users.WHOLESALER || 0} wholesalers` },
      { label: 'Battery Models', value: metrics?.battery_models ?? 0, trend: `${metrics?.serials_by_status?.AVAILABLE || 0} available` },
      { label: 'Active Orders', value: activeOrders, trend: `${orders.PENDING || 0} pending` },
      { label: 'Warranties Issued', value: totalWarranties, trend: `${warranties.ACTIVE || 0} active` },
    ]
  }, [metrics])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold neon-title">Admin Command</h1>
          <p className="text-[color:var(--muted)]">Monitor wholesale flows, warranties, and inventory.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="neon-btn">Create Allocation</button>
          <button className="neon-btn-secondary">Invite Wholesaler</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <p className="stat-label">{stat.label}</p>
            <div className="mt-3 flex items-end justify-between">
              <p className="stat-value">{metricsLoading ? '...' : stat.value}</p>
              <span className="tag">{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[2fr,1fr]">
        <div className="panel-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Orders</h2>
            <button className="neon-btn-ghost">View all</button>
          </div>
          {ordersError ? (
            <p className="mt-4 text-sm text-[color:var(--danger)]">Failed to load orders.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Wholesaler</th>
                    <th>Status</th>
                    <th>Total Items</th>
                  </tr>
                </thead>
                <tbody>
                  {(ordersLoading ? [] : recentOrders).map((order) => (
                    <tr key={order.id}>
                      <td>ORD-{order.id}</td>
                      <td>{order.consumer_name || order.consumer_email || 'Wholesaler'}</td>
                      <td>
                        <span className="tag">{order.status}</span>
                      </td>
                      <td>{order.total_items || order.items?.length || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {ordersLoading ? (
                <p className="mt-3 text-sm text-[color:var(--muted)]">Loading orders...</p>
              ) : null}
            </div>
          )}
        </div>
        <div className="panel-card panel-card-strong p-6">
          <h2 className="text-lg font-semibold">Live Signals</h2>
          <div className="mt-4 space-y-4 text-sm text-[color:var(--muted)]">
            <div>
              <p className="text-[color:var(--text)]">Low stock alerts</p>
              <p>{metrics?.serials_by_status?.AVAILABLE || 0} units available across models.</p>
            </div>
            <div>
              <p className="text-[color:var(--text)]">Pending approvals</p>
              <p>{metrics?.users_by_role?.WHOLESALER || 0} active wholesalers.</p>
            </div>
            <div>
              <p className="text-[color:var(--text)]">Warranty claims</p>
              <p>{metrics?.warranties_by_status?.PENDING || 0} claims pending.</p>
            </div>
            {metricsError ? (
              <p className="text-[color:var(--danger)]">Metrics unavailable.</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
