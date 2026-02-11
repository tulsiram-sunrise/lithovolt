import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orderAPI } from '../../services/api'
import { useToastStore } from '../../store/toastStore'

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState('')
  const queryClient = useQueryClient()
  const addToast = useToastStore((state) => state.addToast)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', statusFilter],
    queryFn: () => orderAPI.getOrders({ ordering: '-created_at', status: statusFilter || undefined }),
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
    mutationFn: (id) => orderAPI.rejectOrder(id),
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
    const list = Array.isArray(data) ? data : data?.results || []
    return list
  }, [data])

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
            <button className="neon-btn-ghost" onClick={() => setStatusFilter('')}>All</button>
            <button className="neon-btn-ghost" onClick={() => setStatusFilter('PENDING')}>Pending</button>
            <button className="neon-btn-ghost" onClick={() => setStatusFilter('ACCEPTED')}>Accepted</button>
            <button className="neon-btn-ghost" onClick={() => setStatusFilter('FULFILLED')}>Fulfilled</button>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Wholesaler</th>
                <th>Status</th>
                <th>Total Items</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(isLoading ? [] : orders).map((order) => (
                <tr key={order.id}>
                  <td>ORD-{order.id}</td>
                  <td>{order.consumer_name || order.consumer_email || 'Wholesaler'}</td>
                  <td><span className="tag">{order.status}</span></td>
                  <td>{order.total_items || order.items?.length || 0}</td>
                  <td className="flex gap-2">
                    {order.status === 'PENDING' ? (
                      <>
                        <button className="neon-btn-ghost" onClick={() => acceptOrder.mutate(order.id)}>Accept</button>
                        <button className="neon-btn-ghost" onClick={() => rejectOrder.mutate(order.id)}>Reject</button>
                      </>
                    ) : null}
                    {order.status === 'ACCEPTED' ? (
                      <button className="neon-btn-ghost" onClick={() => fulfillOrder.mutate(order.id)}>Fulfill</button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {isLoading ? <p className="mt-3 text-sm text-[color:var(--muted)]">Loading orders...</p> : null}
        </div>
      </div>
    </div>
  )
}
