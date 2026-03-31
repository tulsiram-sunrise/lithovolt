import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orderAPI } from '../../services/api'
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
  const [confirmRejectOrderId, setConfirmRejectOrderId] = useState(null)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const addToast = useToastStore((state) => state.addToast)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', statusFilter, page],
    queryFn: () => orderAPI.getOrders({
      ordering: '-created_at',
      status: statusFilter || undefined,
      page,
      per_page: 10,
    }),
    select: (response) => response.data,
  })

  const acceptOrder = useMutation({
    mutationFn: (id) => orderAPI.acceptOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      addToast({ type: 'success', title: 'Order accepted', message: 'Wholesaler will be notified.' })
    },
    onError: () => addToast({ type: 'error', title: 'Action failed' }),
  })
  const rejectOrder = useMutation({
    mutationFn: ({ id, reason }) => orderAPI.rejectOrder(id, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      addToast({ type: 'success', title: 'Order rejected' })
    },
    onError: () => addToast({ type: 'error', title: 'Action failed' }),
  })
  const fulfillOrder = useMutation({
    mutationFn: (id) => orderAPI.fulfillOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      addToast({ type: 'success', title: 'Order fulfilled', message: 'Stock allocated to wholesaler.' })
    },
    onError: () => addToast({ type: 'error', title: 'Action failed' }),
  })

  const orders = useMemo(() => {
    const list = Array.isArray(data) ? data : data?.results || data?.data || []
    return list
  }, [data])

  const pagination = useMemo(() => {
    if (Array.isArray(data)) {
      return { current_page: 1, last_page: 1, total: data.length }
    }

    return {
      current_page: data?.current_page || 1,
      last_page: data?.last_page || 1,
      total: data?.total || orders.length,
    }
  }, [data, orders])

  const isMutating = acceptOrder.isPending || rejectOrder.isPending || fulfillOrder.isPending

  const runOrderAction = (type, orderId, mutation, payload) => {
    if (isMutating) {
      return
    }

    setPendingAction({ type, orderId })
    mutation.mutate(payload ?? orderId, {
      onSettled: () => setPendingAction(null),
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold neon-title">Orders</h1>
        <p className="text-[color:var(--muted)]">Approve and fulfill wholesaler orders.</p>
      </div>

      <div className="panel-card p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input className="neon-input md:max-w-xs" placeholder="Search order" />
          <div className="flex gap-2">
            <button className="neon-btn-ghost" onClick={() => { setStatusFilter(''); setPage(1) }}>All</button>
            <button className="neon-btn-ghost" onClick={() => { setStatusFilter('PENDING'); setPage(1) }}>Pending</button>
            <button className="neon-btn-ghost" onClick={() => { setStatusFilter('ACCEPTED'); setPage(1) }}>Accepted</button>
            <button className="neon-btn-ghost" onClick={() => { setStatusFilter('FULFILLED'); setPage(1) }}>Fulfilled</button>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          {isMutating ? <p className="mb-3 text-xs text-[color:var(--muted)]">Processing request...</p> : null}
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Wholesaler</th>
                <th>Status</th>
                <th>Total Items</th>
                <th>Total Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? <ShimmerTableRows rows={6} columns={6} /> : null}
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>ORD-{order.id}</td>
                  <td>{order.user?.full_name || order.user?.email || order.consumer_name || order.consumer_email || 'Wholesaler'}</td>
                  <td><span className={`tag ${getStatusTagClass(order.status)}`}>{order.status}</span></td>
                  <td>{order.total_items || order.items?.length || 0}</td>
                  <td>{Number(order.total_amount || 0).toFixed(2)}</td>
                  <td className="flex gap-2">
                    <button className="neon-btn-ghost" onClick={() => navigate(`/admin/orders/${order.id}`)}>View</button>
                    {order.status === 'PENDING' ? (
                      <>
                        <button
                          className="neon-btn-ghost"
                          onClick={() => runOrderAction('accept', order.id, acceptOrder)}
                          disabled={isMutating}
                        >
                          {pendingAction?.type === 'accept' && pendingAction?.orderId === order.id ? 'Accepting...' : 'Accept'}
                        </button>
                        <button
                          className="neon-btn-ghost"
                          onClick={() => setConfirmRejectOrderId(order.id)}
                          disabled={isMutating}
                        >
                          {pendingAction?.type === 'reject' && pendingAction?.orderId === order.id ? 'Rejecting...' : 'Reject'}
                        </button>
                      </>
                    ) : null}
                    {order.status === 'ACCEPTED' ? (
                      <button
                        className="neon-btn-ghost"
                        onClick={() => runOrderAction('fulfill', order.id, fulfillOrder)}
                        disabled={isMutating}
                      >
                        {pendingAction?.type === 'fulfill' && pendingAction?.orderId === order.id ? 'Fulfilling...' : 'Fulfill'}
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!isLoading && orders.length === 0 ? (
          <p className="mt-3 text-sm text-[color:var(--muted)]">No orders found.</p>
        ) : null}

        {!isLoading && orders.length > 0 ? (
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
        isOpen={confirmRejectOrderId !== null}
        title="Reject Order"
        message="Are you sure you want to reject this order?"
        confirmLabel="Confirm Reject"
        requireReason={true}
        reasonLabel="Rejection Reason"
        reasonPlaceholder="Why is this order being rejected?"
        isSubmitting={rejectOrder.isPending}
        onClose={() => setConfirmRejectOrderId(null)}
        onConfirm={(reason) => {
          const orderId = confirmRejectOrderId
          setConfirmRejectOrderId(null)
          if (orderId) {
            runOrderAction('reject', orderId, rejectOrder, { id: orderId, reason })
          }
        }}
      />
    </div>
  )
}
