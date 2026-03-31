import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { adminAPI, orderAPI } from '../../services/api'
import ShimmerTableRows from '../../components/common/ShimmerTableRows'
import WholesalerInviteModal from './WholesalerInviteModal'

function toLabel(value) {
  return String(value || '')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function buildMixRows(source = {}, maxRows = 5) {
  const entries = Object.entries(source)
    .map(([key, value]) => ({
      key,
      count: Number(value || 0),
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, maxRows)

  const total = entries.reduce((sum, row) => sum + row.count, 0)
  return entries.map((row) => ({
    ...row,
    percent: total > 0 ? Math.round((row.count / total) * 100) : 0,
  }))
}

function getTotalFromObject(source = {}) {
  return Object.values(source).reduce((sum, value) => sum + Number(value || 0), 0)
}

function buildSparkline(values) {
  if (!Array.isArray(values) || values.length === 0) {
    return ''
  }

  const max = Math.max(...values, 1)
  const min = Math.min(...values)
  const width = 100
  const height = 28

  return values
    .map((value, index) => {
      const x = values.length === 1 ? 0 : (index / (values.length - 1)) * width
      const normalized = max === min ? 0.5 : (value - min) / (max - min)
      const y = height - normalized * height
      return `${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(' ')
}

function formatDelta(delta) {
  if (delta === null || typeof delta === 'undefined') {
    return 'n/a'
  }

  const numeric = Number(delta)
  const sign = numeric > 0 ? '+' : ''
  return `${sign}${numeric.toFixed(1)}%`
}

function normalizeMetricsPayload(source = {}) {
  const totals = source?.totals || {}

  // Backward-compatible: use existing detailed shape when present.
  if (source?.users_by_role || source?.orders_by_status || source?.warranty_claims_by_status) {
    return {
      users_by_role: source?.users_by_role || {},
      orders_by_status: source?.orders_by_status || {},
      warranty_claims_by_status: source?.warranty_claims_by_status || {},
      battery_models: Number(source?.battery_models ?? totals.products ?? 0),
      serials_by_status: source?.serials_by_status || {},
      totals: {
        users: Number(totals.users ?? 0),
        orders: Number(totals.orders ?? 0),
        products: Number(totals.products ?? 0),
        warranties: Number(totals.warranties ?? 0),
      },
    }
  }

  // Newer backend shape: synthesize minimal status maps for dashboard cards/charts.
  const pendingOrders = Number(source?.pending_orders || 0)
  const claimedWarranties = Number(source?.claimed_warranties || 0)

  return {
    users_by_role: {},
    orders_by_status: { PENDING: pendingOrders },
    warranty_claims_by_status: { PENDING: claimedWarranties },
    battery_models: Number(totals.products ?? 0),
    serials_by_status: {},
    totals: {
      users: Number(totals.users ?? 0),
      orders: Number(totals.orders ?? 0),
      products: Number(totals.products ?? 0),
      warranties: Number(totals.warranties ?? 0),
    },
  }
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [trendWindow, setTrendWindow] = useState(30)
  const {
    data: metrics,
    isLoading: metricsLoading,
    error: metricsError,
  } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: adminAPI.getMetrics,
    select: (response) => response.data,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  })

  const {
    data: reportStats,
    isLoading: reportLoading,
    error: reportError,
  } = useQuery({
    queryKey: ['admin-dashboard-report-stats'],
    queryFn: async () => {
      const [ordersRes, usersRes, warrantiesRes] = await Promise.all([
        adminAPI.getOrderStats(),
        adminAPI.getUserStats(),
        adminAPI.getWarrantyStats(),
      ])

      return {
        orders: ordersRes.data,
        users: usersRes.data,
        warranties: warrantiesRes.data,
      }
    },
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  })

  const {
    data: trends,
    isLoading: trendsLoading,
    error: trendsError,
  } = useQuery({
    queryKey: ['admin-trends', trendWindow],
    queryFn: () => adminAPI.getTrends({ days: trendWindow }),
    select: (response) => response.data,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  })

  const {
    data: orderData,
    isLoading: ordersLoading,
    error: ordersError,
  } = useQuery({
    queryKey: ['admin-recent-orders'],
    queryFn: () => orderAPI.getOrders({ ordering: '-created_at', per_page: 20 }),
    select: (response) => response.data,
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
  })

  const normalizedMetrics = useMemo(() => normalizeMetricsPayload(metrics || {}), [metrics])

  const recentOrders = useMemo(() => {
    const list = Array.isArray(orderData) ? orderData : orderData?.results || orderData?.data || []
    return list.slice(0, 6)
  }, [orderData])

  const stats = useMemo(() => {
    const users = normalizedMetrics?.users_by_role || {}
    const consumerCount = Number(users.CONSUMER || 0)
    const wholesalerCount = Number(users.WHOLESALER || 0)
    const orders = normalizedMetrics?.orders_by_status || {}
    const pendingOrders = (orders.PENDING || 0)
    const processingOrders = (orders.PROCESSING || 0)
    const warranties = normalizedMetrics?.warranty_claims_by_status || {}
    const pendingClaims = (warranties.PENDING || 0)
    const processingClaims = (warranties.PROCESSING || 0)

    return [
      { 
        label: 'Consumers', 
        value: consumerCount, 
        trend: `${wholesalerCount} wholesalers`
      },
      { 
        label: 'Battery Models', 
        value: normalizedMetrics?.battery_models ?? 0, 
        trend: `${normalizedMetrics?.serials_by_status?.AVAILABLE || 0} available` 
      },
      { 
        label: 'Orders', 
        value: pendingOrders, 
        trend: `${processingOrders} processing` 
      },
      { 
        label: 'Warranty Claims', 
        value: pendingClaims, 
        trend: `${processingClaims} processing, ${warranties.RESOLVED || 0} resolved` 
      },
    ]
  }, [normalizedMetrics])

  const orderMixRows = useMemo(() => buildMixRows(normalizedMetrics?.orders_by_status || {}), [normalizedMetrics])
  const warrantyMixRows = useMemo(() => buildMixRows(normalizedMetrics?.warranty_claims_by_status || {}), [normalizedMetrics])

  const comparisonRows = useMemo(() => {
    const usersFromDashboard = getTotalFromObject(normalizedMetrics?.users_by_role || {}) || Number(normalizedMetrics?.totals?.users || 0)
    const ordersFromDashboard = getTotalFromObject(normalizedMetrics?.orders_by_status || {}) || Number(normalizedMetrics?.totals?.orders || 0)
    const warrantiesFromDashboard = getTotalFromObject(normalizedMetrics?.warranty_claims_by_status || {}) || Number(normalizedMetrics?.totals?.warranties || 0)

    const usersFromReports = Number(reportStats?.users?.total || 0)
    const ordersFromReports = Number(reportStats?.orders?.total || 0)
    const warrantiesFromReports = Number(reportStats?.warranties?.total || 0)

    return [
      {
        label: 'Users',
        dashboardValue: usersFromDashboard,
        reportValue: usersFromReports,
      },
      {
        label: 'Orders',
        dashboardValue: ordersFromDashboard,
        reportValue: ordersFromReports,
      },
      {
        label: 'Warranty Claims',
        dashboardValue: warrantiesFromDashboard,
        reportValue: warrantiesFromReports,
      },
    ]
  }, [normalizedMetrics, reportStats])

  const hasDataIssue = metricsError || reportError

  const trendCards = useMemo(() => {
    const series = trends?.series || {}
    const totals = trends?.totals || {}
    const delta = trends?.delta_percent || {}

    return [
      {
        key: 'orders',
        label: 'Orders Created',
        color: '#32f79b',
        values: Array.isArray(series.orders) ? series.orders : [],
        total: Number(totals.orders || 0),
        delta: delta.orders,
      },
      {
        key: 'warranties',
        label: 'Warranties Issued',
        color: '#38bdf8',
        values: Array.isArray(series.warranties) ? series.warranties : [],
        total: Number(totals.warranties || 0),
        delta: delta.warranties,
      },
      {
        key: 'users',
        label: 'Users Joined',
        color: '#f59e0b',
        values: Array.isArray(series.users) ? series.users : [],
        total: Number(totals.users || 0),
        delta: delta.users,
      },
    ]
  }, [trends])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold neon-title">Admin Command</h1>
          <p className="text-[color:var(--muted)]">Monitor wholesale flows, warranties, and inventory.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate('/admin/inventory')}
            className="neon-btn"
          >
            Create Allocation
          </button>
          <button
            onClick={() => setShowInviteModal(true)}
            className="neon-btn-secondary"
          >
            Invite Wholesaler
          </button>
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
            <button
              onClick={() => navigate('/admin/orders')}
              className="neon-btn-ghost"
            >
              View all
            </button>
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
                  {ordersLoading ? <ShimmerTableRows rows={6} columns={4} /> : null}
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td>ORD-{order.id}</td>
                      <td>{order.user?.full_name || order.user?.email || order.consumer_name || order.consumer_email || 'Wholesaler'}</td>
                      <td>
                        <span className="tag">{order.status}</span>
                      </td>
                      <td>{order.total_items || order.items?.length || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

      <div className="panel-card p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Trend Monitor</h2>
            <p className="text-xs text-[color:var(--muted)]">Compare recent movement against the previous equivalent period.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[7, 30, 90].map((days) => (
              <button
                key={days}
                onClick={() => setTrendWindow(days)}
                className={days === trendWindow ? 'neon-btn' : 'neon-btn-ghost'}
              >
                {days}d
              </button>
            ))}
          </div>
        </div>

        {trendsLoading ? (
          <p className="mt-4 text-sm text-[color:var(--muted)]">Loading trend series...</p>
        ) : null}

        {trendsError ? (
          <p className="mt-4 text-sm text-[color:var(--danger)]">Trend data unavailable right now.</p>
        ) : null}

        {!trendsLoading && !trendsError ? (
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {trendCards.map((card) => (
              <div key={card.key} className="rounded-xl border border-[color:var(--border)]/40 bg-[color:var(--panel)]/45 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{card.label}</p>
                  <span className="tag">{formatDelta(card.delta)}</span>
                </div>
                <p className="mt-1 text-xl font-semibold">{card.total}</p>
                <svg viewBox="0 0 100 28" className="mt-3 h-10 w-full" preserveAspectRatio="none" role="img" aria-label={`${card.label} trend`}>
                  <polyline
                    fill="none"
                    stroke={card.color}
                    strokeWidth="2"
                    points={buildSparkline(card.values)}
                  />
                </svg>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr,1fr]">
        <div className="panel-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Operational Mix</h2>
            <button onClick={() => navigate('/admin/reports')} className="neon-btn-ghost">Open Reports Hub</button>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-[color:var(--text)]">Order Status Distribution</p>
              <div className="mt-3 space-y-2">
                {metricsLoading ? <p className="text-sm text-[color:var(--muted)]">Loading chart...</p> : null}
                {!metricsLoading && orderMixRows.map((row) => (
                  <div key={row.key}>
                    <div className="mb-1 flex items-center justify-between text-xs text-[color:var(--muted)]">
                      <span>{toLabel(row.key)}</span>
                      <span>{row.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-[color:var(--panel)]/60">
                      <div className="h-2 rounded-full bg-[color:var(--accent)]" style={{ width: `${row.percent}%` }} />
                    </div>
                  </div>
                ))}
                {!metricsLoading && orderMixRows.length === 0 ? <p className="text-sm text-[color:var(--muted)]">No order mix data available.</p> : null}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-[color:var(--text)]">Warranty Status Distribution</p>
              <div className="mt-3 space-y-2">
                {metricsLoading ? <p className="text-sm text-[color:var(--muted)]">Loading chart...</p> : null}
                {!metricsLoading && warrantyMixRows.map((row) => (
                  <div key={row.key}>
                    <div className="mb-1 flex items-center justify-between text-xs text-[color:var(--muted)]">
                      <span>{toLabel(row.key)}</span>
                      <span>{row.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-[color:var(--panel)]/60">
                      <div className="h-2 rounded-full bg-emerald-400" style={{ width: `${row.percent}%` }} />
                    </div>
                  </div>
                ))}
                {!metricsLoading && warrantyMixRows.length === 0 ? <p className="text-sm text-[color:var(--muted)]">No warranty mix data available.</p> : null}
              </div>
            </div>
          </div>
        </div>

        <div className="panel-card p-6">
          <h2 className="text-lg font-semibold">Dashboard vs Reports</h2>
          <p className="mt-1 text-xs text-[color:var(--muted)]">Quick alignment check between dashboard aggregates and dedicated report totals.</p>

          <div className="mt-4 space-y-3">
            {(reportLoading || metricsLoading) ? <p className="text-sm text-[color:var(--muted)]">Comparing data sources...</p> : null}
            {!reportLoading && !metricsLoading && comparisonRows.map((row) => {
              const isAligned = row.dashboardValue === row.reportValue
              return (
                <div key={row.label} className="rounded-lg border border-[color:var(--border)]/40 p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{row.label}</p>
                    <span className="tag">{isAligned ? 'Aligned' : 'Review'}</span>
                  </div>
                  <p className="mt-1 text-xs text-[color:var(--muted)]">Dashboard: {row.dashboardValue} | Reports: {row.reportValue}</p>
                </div>
              )
            })}
            {hasDataIssue ? <p className="text-sm text-[color:var(--danger)]">Comparison unavailable because one data source failed.</p> : null}
          </div>
        </div>
      </div>

      <WholesalerInviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
      />
    </div>
  )
}
