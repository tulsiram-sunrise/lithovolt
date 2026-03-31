import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orderAPI } from '../../services/api'
import { extractApiErrorMessage } from '../../services/apiError'
import { useToastStore } from '../../store/toastStore'
import ShimmerTableRows from '../../components/common/ShimmerTableRows'
import PaginationControls from '../../components/common/PaginationControls'
import ActionConfirmModal from '../../components/common/ActionConfirmModal'

function getStatusTagClass(status) {
  const normalized = String(status || '').toUpperCase()

  if (normalized === 'PENDING') return 'tag-warning'
  if (normalized === 'ACCEPTED') return 'tag-info'
  if (normalized === 'FULFILLED') return 'tag-success'
  if (normalized === 'REJECTED' || normalized === 'CANCELLED') return 'tag-error'

  return ''
}

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pendingAction, setPendingAction] = useState(null)
  const [confirmCancelOrderId, setConfirmCancelOrderId] = useState(null)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const addToast = useToastStore((state) => state.addToast)

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['wholesaler-orders', statusFilter, page],
    queryFn: () => orderAPI.getOrders({ ordering: '-created_at', status: statusFilter || undefined, page, per_page: 10 }),
    select: (response) => response.data,
  })
  const orders = useMemo(() => {
    const list = Array.isArray(ordersData)
      ? ordersData
      : ordersData?.results || ordersData?.data || []

    return Array.isArray(list) ? list : []
  }, [ordersData])

  const pagination = useMemo(() => {
    if (Array.isArray(ordersData)) {
      return { current_page: 1, last_page: 1, total: ordersData.length }
    }

    return {
      current_page: ordersData?.current_page || 1,
      last_page: ordersData?.last_page || 1,
      total: ordersData?.total || orders.length,
    }
  }, [ordersData, orders])

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

  const cancelOrder = useMutation({
    mutationFn: ({ id, reason }) => orderAPI.cancelOrder(id, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wholesaler-orders'] })
      queryClient.invalidateQueries({ queryKey: ['wholesaler-order'] })
      addToast({ type: 'success', title: 'Order canceled' })
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'Unable to cancel order',
        message: extractApiErrorMessage(error, 'Order can be canceled only while pending.'),
      })
    },
  })

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

  const isMutating = cancelOrder.isPending

  const runCancelAction = (orderId, reason) => {
    if (isMutating) {
      return
    }

    setPendingAction({ type: 'cancel', orderId })
    cancelOrder.mutate({ id: orderId, reason }, {
      onSettled: () => setPendingAction(null),
    })
  }

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
          <button type="button" className="neon-btn-ghost" onClick={() => { setStatusFilter(''); setPage(1) }}>All</button>
          <button type="button" className="neon-btn-ghost" onClick={() => { setStatusFilter('PENDING'); setPage(1) }}>Pending</button>
          <button type="button" className="neon-btn-ghost" onClick={() => { setStatusFilter('ACCEPTED'); setPage(1) }}>Accepted</button>
          <button type="button" className="neon-btn-ghost" onClick={() => { setStatusFilter('FULFILLED'); setPage(1) }}>Fulfilled</button>
          <button type="button" className="neon-btn-ghost" onClick={() => { setStatusFilter('REJECTED'); setPage(1) }}>Rejected</button>
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
                <td><span className={`tag ${getStatusTagClass(order.status)}`}>{normalizeStatus(order.status)}</span></td>
                <td>{normalizePaymentMethod(order.payment_method)}</td>
                <td>{order.created_at ? new Date(order.created_at).toLocaleDateString() : '-'}</td>
                <td>{order.total_items || order.items?.length || 0}</td>
                <td>${Number(order.total_amount || 0).toFixed(2)}</td>
                <td className="flex gap-2">
                  <button className="neon-btn-ghost" onClick={() => navigate(`/wholesaler/orders/${order.id}`)}>View</button>
                  {normalizeStatus(order.status) === 'PENDING' ? (
                    <button
                      className="neon-btn-ghost"
                      type="button"
                      onClick={() => setConfirmCancelOrderId(order.id)}
                      disabled={isMutating}
                    >
                      {pendingAction?.type === 'cancel' && pendingAction?.orderId === order.id ? 'Cancelling...' : 'Cancel'}
                    </button>
                  ) : null}
                  {isFulfilledStatus(order.status) ? (
                    <button className="neon-btn-secondary" type="button" onClick={() => handleDownloadInvoice(order.id)}>
                      Invoice
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!ordersLoading && orders.length === 0 ? (
          <p className="mt-3 text-sm text-[color:var(--muted)]">No orders yet.</p>
        ) : null}

        {!ordersLoading && orders.length > 0 ? (
          <PaginationControls
            currentPage={pagination.current_page}
            lastPage={pagination.last_page}
            total={pagination.total}
            pageSize={10}
            onPageChange={setPage}
          />
        ) : null}
      </div>

      <ActionConfirmModal
        isOpen={confirmCancelOrderId !== null}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? This action is allowed only while order is pending."
        confirmLabel="Confirm Cancel"
        requireReason={true}
        reasonLabel="Cancellation Reason"
        reasonPlaceholder="Why are you canceling this order?"
        isSubmitting={cancelOrder.isPending}
        onClose={() => setConfirmCancelOrderId(null)}
        onConfirm={(reason) => {
          const orderId = confirmCancelOrderId
          setConfirmCancelOrderId(null)
          if (orderId) {
            runCancelAction(orderId, reason)
          }
        }}
      />
    </div>
  )
}
