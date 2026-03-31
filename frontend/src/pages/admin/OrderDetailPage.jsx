import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminAPI, orderAPI } from '../../services/api'
import { useToastStore } from '../../store/toastStore'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorMessage from '../../components/common/ErrorMessage'
import ActionConfirmModal from '../../components/common/ActionConfirmModal'

function toTimelineEvents(activityData, fallbackOrder) {
  const activityItems = Array.isArray(activityData?.items) ? activityData.items : []

  const fromActivity = activityItems.map((item) => ({
    id: `activity-${item.id}`,
    time: item.occurred_at,
    title: item.summary || item.event_type || 'Activity',
    actor: item.metadata?.actor || 'System',
  }))

  const fallback = []
  if (fallbackOrder?.created_at) {
    fallback.push({
      id: 'created',
      time: fallbackOrder.created_at,
      title: `Order created (${fallbackOrder.status || 'PENDING'})`,
      actor: fallbackOrder.user?.full_name || fallbackOrder.user?.email || 'Wholesaler',
    })
  }
  if (fallbackOrder?.updated_at && fallbackOrder?.updated_at !== fallbackOrder?.created_at) {
    fallback.push({
      id: 'updated',
      time: fallbackOrder.updated_at,
      title: `Order updated (${fallbackOrder.status || 'PENDING'})`,
      actor: 'System',
    })
  }

  const merged = [...fromActivity, ...fallback]
  return merged.sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0))
}

export default function OrderDetailPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const addToast = useToastStore((state) => state.addToast)
  const [pendingAction, setPendingAction] = useState(null)
  const [confirmRejectOpen, setConfirmRejectOpen] = useState(false)

  const {
    data: orderData,
    isLoading: orderLoading,
    error: orderError,
  } = useQuery({
    queryKey: ['admin-order-detail', orderId],
    queryFn: () => orderAPI.getOrder(orderId),
    select: (response) => response.data,
  })

  const {
    data: activityData,
    isLoading: activityLoading,
  } = useQuery({
    queryKey: ['admin-order-activity', orderId],
    queryFn: () => adminAPI.getActivity({ scope: 'ORDERS', search: `#${orderId}`, page_size: 50 }),
    select: (response) => response.data,
  })

  const acceptOrder = useMutation({
    mutationFn: (id) => orderAPI.acceptOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      queryClient.invalidateQueries({ queryKey: ['admin-order-detail', orderId] })
      queryClient.invalidateQueries({ queryKey: ['admin-order-activity', orderId] })
      addToast({ type: 'success', title: 'Order accepted', message: 'Wholesaler will be notified.' })
    },
    onError: () => addToast({ type: 'error', title: 'Action failed' }),
  })

  const rejectOrder = useMutation({
    mutationFn: ({ id, reason }) => orderAPI.rejectOrder(id, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      queryClient.invalidateQueries({ queryKey: ['admin-order-detail', orderId] })
      queryClient.invalidateQueries({ queryKey: ['admin-order-activity', orderId] })
      addToast({ type: 'success', title: 'Order rejected' })
    },
    onError: () => addToast({ type: 'error', title: 'Action failed' }),
  })

  const fulfillOrder = useMutation({
    mutationFn: (id) => orderAPI.fulfillOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      queryClient.invalidateQueries({ queryKey: ['admin-order-detail', orderId] })
      queryClient.invalidateQueries({ queryKey: ['admin-order-activity', orderId] })
      addToast({ type: 'success', title: 'Order fulfilled', message: 'Stock allocated to wholesaler.' })
    },
    onError: () => addToast({ type: 'error', title: 'Action failed' }),
  })

  const isMutating = acceptOrder.isPending || rejectOrder.isPending || fulfillOrder.isPending

  const runOrderAction = (type, id, mutation, payload) => {
    if (isMutating) {
      return
    }

    setPendingAction({ type, id })
    mutation.mutate(payload ?? id, {
      onSettled: () => setPendingAction(null),
    })
  }

  const timeline = useMemo(() => toTimelineEvents(activityData, orderData), [activityData, orderData])

  if (orderLoading) {
    return <LoadingSpinner message="Loading order details..." />
  }

  if (orderError) {
    return <ErrorMessage error={orderError} />
  }

  if (!orderData) {
    return <ErrorMessage error={{ response: { data: { message: 'Order not found' } } }} />
  }

  const status = String(orderData.status || 'PENDING').toUpperCase()

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => navigate('/admin/orders')}
            className="mb-4 text-sm text-[color:var(--accent)] hover:underline"
          >
            ← Back to Orders
          </button>
          <h1 className="text-3xl font-semibold neon-title">Order {orderData.order_number || `ORD-${orderData.id}`}</h1>
          <p className="mt-1 text-[color:var(--muted)]">Full order history and actions</p>
        </div>
        <span className="tag">{status}</span>
      </div>

      <div className="panel-card p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs uppercase text-[color:var(--muted)]">Wholesaler</p>
            <p className="mt-1 font-medium">{orderData.user?.full_name || orderData.user?.email || 'Wholesaler'}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-[color:var(--muted)]">Payment</p>
            <p className="mt-1 font-medium">{orderData.payment_method || 'PAY_LATER'} / {orderData.payment_status || 'PENDING'}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-[color:var(--muted)]">Created</p>
            <p className="mt-1 font-medium">{orderData.created_at ? new Date(orderData.created_at).toLocaleString() : '-'}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-[color:var(--muted)]">Total Amount</p>
            <p className="mt-1 font-medium">{Number(orderData.total_amount || 0).toFixed(2)}</p>
          </div>
        </div>

        {orderData.notes ? (
          <div className="mt-4 border-t border-[color:var(--border)] pt-4">
            <p className="text-xs uppercase text-[color:var(--muted)]">Notes</p>
            <p className="mt-1 text-sm">{orderData.notes}</p>
          </div>
        ) : null}
      </div>

      <div className="panel-card p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Order Items</h2>
          <span className="text-xs text-[color:var(--muted)]">{(orderData.items || []).length} item(s)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {(orderData.items || []).map((item) => (
                <tr key={item.id}>
                  <td>{item.product?.name || item.itemable?.name || `Item #${item.itemable_id}`}</td>
                  <td>{item.quantity || 0}</td>
                  <td>{Number(item.unit_price || 0).toFixed(2)}</td>
                  <td>{Number(item.total_price || 0).toFixed(2)}</td>
                </tr>
              ))}
              {!(orderData.items || []).length ? (
                <tr>
                  <td colSpan={4} className="text-center text-[color:var(--muted)]">No line items available.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel-card p-6">
        <h2 className="text-lg font-semibold">Order History</h2>
        {activityLoading ? (
          <p className="mt-3 text-sm text-[color:var(--muted)]">Loading history...</p>
        ) : timeline.length === 0 ? (
          <p className="mt-3 text-sm text-[color:var(--muted)]">No history available yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {timeline.map((event) => (
              <div key={event.id} className="rounded border border-[color:var(--border)] p-3">
                <p className="text-sm font-medium">{event.title}</p>
                <p className="text-xs text-[color:var(--muted)]">
                  {event.time ? new Date(event.time).toLocaleString() : '-'} · {event.actor || 'System'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="panel-card p-6">
        <h2 className="text-lg font-semibold">Actions</h2>
        {isMutating ? <p className="mt-2 text-xs text-[color:var(--muted)]">Processing request...</p> : null}
        <div className="mt-3 flex flex-wrap gap-2">
          {status === 'PENDING' ? (
            <>
              <button
                className="neon-btn-ghost"
                onClick={() => runOrderAction('accept', orderData.id, acceptOrder)}
                disabled={isMutating}
              >
                {pendingAction?.type === 'accept' && pendingAction?.id === orderData.id ? 'Accepting...' : 'Accept Order'}
              </button>
              <button
                className="neon-btn-ghost"
                onClick={() => setConfirmRejectOpen(true)}
                disabled={isMutating}
              >
                {pendingAction?.type === 'reject' && pendingAction?.id === orderData.id ? 'Rejecting...' : 'Reject Order'}
              </button>
            </>
          ) : null}

          {status === 'ACCEPTED' ? (
            <button
              className="neon-btn-ghost"
              onClick={() => runOrderAction('fulfill', orderData.id, fulfillOrder)}
              disabled={isMutating}
            >
              {pendingAction?.type === 'fulfill' && pendingAction?.id === orderData.id ? 'Fulfilling...' : 'Fulfill Order'}
            </button>
          ) : null}

          {status !== 'PENDING' && status !== 'ACCEPTED' ? (
            <p className="text-sm text-[color:var(--muted)]">No further actions available for current status.</p>
          ) : null}
        </div>
      </div>

      <ActionConfirmModal
        isOpen={confirmRejectOpen}
        title="Reject Order"
        message="Are you sure you want to reject this order?"
        confirmLabel="Confirm Reject"
        requireReason={true}
        reasonLabel="Rejection Reason"
        reasonPlaceholder="Why is this order being rejected?"
        isSubmitting={rejectOrder.isPending}
        onClose={() => setConfirmRejectOpen(false)}
        onConfirm={(reason) => {
          setConfirmRejectOpen(false)
          runOrderAction('reject', orderData.id, rejectOrder, { id: orderData.id, reason })
        }}
      />
    </div>
  )
}
