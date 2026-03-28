import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { orderAPI } from '../../services/api'
import { extractApiErrorMessage } from '../../services/apiError'
import { useToastStore } from '../../store/toastStore'
import ShimmerTableRows from '../../components/common/ShimmerTableRows'

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState('')
  const addToast = useToastStore((state) => state.addToast)

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['wholesaler-orders', statusFilter],
    queryFn: () => orderAPI.getOrders({ ordering: '-created_at', status: statusFilter || undefined }),
    select: (response) => response.data,
  })
  const orders = useMemo(() => (Array.isArray(ordersData) ? ordersData : ordersData?.results || []), [ordersData])
  const isFulfilledStatus = (value) => String(value || '').toUpperCase() === 'FULFILLED'
  const normalizeStatus = (value) => String(value || 'PENDING').toUpperCase()
  const normalizePaymentMethod = (value) => {
    const method = String(value || 'PAY_LATER').toUpperCase()
    return method === 'ONLINE' ? 'Online (Stripe)' : 'Pay Later'
  }

  const handleDownloadInvoice = async (orderId) => {
    try {
      const response = await orderAPI.getInvoice(orderId)
      const blobUrl = window.URL.createObjectURL(response.data)
      const link = document.createElement('a')
      const headerName = response.headers?.['content-disposition'] || ''
      const matchedName = headerName.match(/filename="?([^";]+)"?/)?.[1]

      link.href = blobUrl
      link.download = matchedName || `invoice_${orderId}.txt`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(blobUrl)
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Invoice unavailable',
        message: extractApiErrorMessage(error, 'Invoice can only be downloaded after fulfillment.'),
      })
    }
  }

  const totals = useMemo(() => {
    return orders.reduce((acc, order) => {
      const status = normalizeStatus(order.status)
      acc.total += 1
      if (status === 'PENDING') acc.pending += 1
      if (status === 'ACCEPTED') acc.accepted += 1
      if (status === 'FULFILLED') acc.fulfilled += 1
      return acc
    }, { total: 0, pending: 0, accepted: 0, fulfilled: 0 })
  }, [orders])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold neon-title">Orders</h1>
          <p className="text-[color:var(--muted)]">Track orders sent to Lithovolt.</p>
        </div>
        <Link className="neon-btn" to="/wholesaler/orders/new">Place New Order</Link>
      </div>

      <div className="panel-card p-6">
        <div className="mb-4 grid gap-3 md:grid-cols-4">
          <div className="rounded-lg border border-[color:var(--border)] bg-white/5 p-3">
            <p className="text-xs text-[color:var(--muted)]">Total Orders</p>
            <p className="text-xl font-semibold">{totals.total}</p>
          </div>
          <div className="rounded-lg border border-[color:var(--border)] bg-white/5 p-3">
            <p className="text-xs text-[color:var(--muted)]">Pending</p>
            <p className="text-xl font-semibold">{totals.pending}</p>
          </div>
          <div className="rounded-lg border border-[color:var(--border)] bg-white/5 p-3">
            <p className="text-xs text-[color:var(--muted)]">Accepted</p>
            <p className="text-xl font-semibold">{totals.accepted}</p>
          </div>
          <div className="rounded-lg border border-[color:var(--border)] bg-white/5 p-3">
            <p className="text-xs text-[color:var(--muted)]">Fulfilled</p>
            <p className="text-xl font-semibold">{totals.fulfilled}</p>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <button type="button" className="neon-btn-ghost" onClick={() => setStatusFilter('')}>All</button>
          <button type="button" className="neon-btn-ghost" onClick={() => setStatusFilter('PENDING')}>Pending</button>
          <button type="button" className="neon-btn-ghost" onClick={() => setStatusFilter('ACCEPTED')}>Accepted</button>
          <button type="button" className="neon-btn-ghost" onClick={() => setStatusFilter('FULFILLED')}>Fulfilled</button>
          <button type="button" className="neon-btn-ghost" onClick={() => setStatusFilter('REJECTED')}>Rejected</button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Submitted</th>
              <th>Items</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {ordersLoading ? <ShimmerTableRows rows={5} columns={7} /> : null}
            {orders.map((order) => (
              <tr key={order.id}>
                <td>ORD-{order.id}</td>
                <td><span className="tag">{normalizeStatus(order.status)}</span></td>
                <td>{normalizePaymentMethod(order.payment_method)}</td>
                <td>{order.created_at ? new Date(order.created_at).toLocaleDateString() : '-'}</td>
                <td>{order.total_items || order.items?.length || 0}</td>
                <td>{Number(order.total_amount || 0).toFixed(2)}</td>
                <td>
                  {isFulfilledStatus(order.status) ? (
                    <button className="neon-btn-secondary" type="button" onClick={() => handleDownloadInvoice(order.id)}>
                      Invoice
                    </button>
                  ) : (
                    <span className="text-xs text-[color:var(--muted)]">Available after fulfillment</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!ordersLoading && orders.length === 0 ? (
          <p className="mt-3 text-sm text-[color:var(--muted)]">No orders yet.</p>
        ) : null}
      </div>
    </div>
  )
}
