import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orderAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorMessage from '../../components/common/ErrorMessage'
import { useToastStore } from '../../store/toastStore'
import { extractApiErrorMessage } from '../../services/apiError'
import ActionConfirmModal from '../../components/common/ActionConfirmModal'

function getStatusTagClass(status) {
  const normalized = String(status || '').toUpperCase()

  if (normalized === 'PENDING') return 'tag-warning'
  if (normalized === 'ACCEPTED') return 'tag-info'
  if (normalized === 'FULFILLED') return 'tag-success'
  if (normalized === 'REJECTED' || normalized === 'CANCELLED') return 'tag-error'

  return ''
}

function toTimelineEvents(order) {
  const events = []

  // Add order creation
  if (order?.created_at) {
    events.push({
      timestamp: order.created_at,
      title: 'Order Created',
      description: `Order ORD-${order.id} placed`,
      type: 'created',
    })
  }

  // Add status updates based on order status
  if (order?.updated_at && order?.status) {
    events.push({
      timestamp: order.updated_at,
      title: `Status: ${String(order.status).toUpperCase()}`,
      description: `Order status updated to ${order.status}`,
      type: 'status',
    })
  }

  // Sort by timestamp descending (newest first)
  return events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
}

function getItemProductName(item) {
  return (
    item?.product_name
    || item?.product?.name
    || item?.itemable?.name
    || item?.name
    || (item?.sku ? `Product (${item.sku})` : null)
    || `Item #${item?.id ?? ''}`.trim()
  )
}

export default function WholesalerOrderDetailPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const addToast = useToastStore((state) => state.addToast)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const { data: orderData, isLoading: orderLoading, error: orderError } = useQuery({
    queryKey: ['wholesaler-order', orderId],
    queryFn: () => orderAPI.getOrder(orderId),
    select: (response) => response.data,
  })

  const order = useMemo(() => {
    if (Array.isArray(orderData)) return orderData[0]
    return orderData
  }, [orderData])

  const cancelOrder = useMutation({
    mutationFn: (reason) => orderAPI.cancelOrder(orderId, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wholesaler-orders'] })
      queryClient.invalidateQueries({ queryKey: ['wholesaler-order', orderId] })
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

  const timeline = useMemo(() => toTimelineEvents(order), [order])

  if (orderLoading) return <LoadingSpinner />
  if (orderError) return <ErrorMessage error={orderError} />
  if (!order) return <ErrorMessage error={new Error('Order not found')} />

  const items = Array.isArray(order.items) ? order.items : []
  const total = Number(order.total_amount || 0)
  const normalizedStatus = String(order.status || '').toUpperCase()
  const canCancel = normalizedStatus === 'PENDING'

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          className="neon-btn-ghost px-3 py-1 text-sm"
          onClick={() => navigate('/wholesaler/orders')}
        >
          ← Back
        </button>
        <h1 className="text-3xl font-semibold neon-title">Order ORD-{order.id}</h1>
        {canCancel ? (
          <button
            className="neon-btn-ghost"
            onClick={() => setConfirmOpen(true)}
            disabled={cancelOrder.isPending}
          >
            {cancelOrder.isPending ? 'Cancelling...' : 'Cancel Order'}
          </button>
        ) : null}
      </div>

      {/* Order Metadata */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="panel-card rounded-lg p-4">
          <p className="text-xs text-[color:var(--muted)]">Status</p>
          <p className="mt-1">
            <span className={`tag ${getStatusTagClass(order.status)}`}>
              {String(order.status || 'PENDING').toUpperCase()}
            </span>
          </p>
        </div>
        <div className="panel-card rounded-lg p-4">
          <p className="text-xs text-[color:var(--muted)]">Payment Method</p>
          <p className="mt-1 text-sm font-medium">
            {order.payment_method === 'ONLINE' ? 'Online (Stripe)' : 'Pay Later'}
          </p>
        </div>
        <div className="panel-card rounded-lg p-4">
          <p className="text-xs text-[color:var(--muted)]">Created</p>
          <p className="mt-1 text-sm font-medium">
            {order.created_at ? new Date(order.created_at).toLocaleDateString() : '-'}
          </p>
        </div>
        <div className="panel-card rounded-lg p-4">
          <p className="text-xs text-[color:var(--muted)]">Total Amount</p>
          <p className="mt-1 text-xl font-semibold">${total.toFixed(2)}</p>
        </div>
      </div>

      {/* Order Items */}
      <div className="panel-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Items</h2>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const unitPrice = Number(item.unit_price || item.price || 0)
                const itemTotal = unitPrice * (item.quantity || 0)
                return (
                  <tr key={idx}>
                    <td>{getItemProductName(item)}</td>
                    <td>{item.quantity || 0}</td>
                    <td>${unitPrice.toFixed(2)}</td>
                    <td className="font-medium">${itemTotal.toFixed(2)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {items.length === 0 && <p className="mt-3 text-sm text-[color:var(--muted)]">No items in this order.</p>}
      </div>

      {/* Order Notes */}
      {order.notes && (
        <div className="panel-card p-6">
          <h2 className="mb-3 text-lg font-semibold">Notes</h2>
          <p className="text-sm">{order.notes}</p>
        </div>
      )}

      {/* Activity Timeline */}
      {timeline.length > 0 && (
        <div className="panel-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Activity Timeline</h2>
          <div className="space-y-3">
            {timeline.map((event, idx) => (
              <div key={idx} className="border-l-2 border-[color:var(--accent)] pl-4 py-2">
                <p className="text-xs text-[color:var(--muted)]">
                  {event.timestamp ? new Date(event.timestamp).toLocaleString() : '-'}
                </p>
                <p className="mt-1 font-medium">{event.title}</p>
                {event.description && <p className="mt-1 text-sm text-[color:var(--muted)]">{event.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Download Invoice */}
      {order.status === 'FULFILLED' && (
        <div className="panel-card p-6">
          <button
            className="neon-btn"
            onClick={async () => {
              try {
                const response = await orderAPI.getInvoice(order.id)
                const blobUrl = window.URL.createObjectURL(response.data)
                const link = document.createElement('a')
                const headerName = response.headers?.['content-disposition'] || ''
                const matchedName = headerName.match(/filename="?([^";]+)"?/)?.[1]

                link.href = blobUrl
                link.download = matchedName || `invoice_${order.id}.txt`
                document.body.appendChild(link)
                link.click()
                link.remove()
                window.URL.revokeObjectURL(blobUrl)
              } catch (error) {
                console.error('Failed to download invoice:', error)
              }
            }}
          >
            Download Invoice
          </button>
        </div>
      )}

      <ActionConfirmModal
        isOpen={confirmOpen}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? This action is allowed only while pending."
        confirmLabel="Confirm Cancel"
        requireReason={true}
        reasonLabel="Cancellation Reason"
        reasonPlaceholder="Why are you canceling this order?"
        isSubmitting={cancelOrder.isPending}
        onClose={() => setConfirmOpen(false)}
        onConfirm={(reason) => {
          setConfirmOpen(false)
          cancelOrder.mutate(reason)
        }}
      />
    </div>
  )
}
