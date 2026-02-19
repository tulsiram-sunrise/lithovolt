import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { inventoryAPI, orderAPI } from '../../services/api'
import { useToastStore } from '../../store/toastStore'

const createEmptyItem = () => ({ product_type: 'BATTERY_MODEL', item_id: '', quantity: 1 })

export default function OrdersPage() {
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState([createEmptyItem()])
  const queryClient = useQueryClient()
  const addToast = useToastStore((state) => state.addToast)

  const { data: modelsData } = useQuery({
    queryKey: ['wholesaler-models'],
    queryFn: () => inventoryAPI.getBatteryModels({ ordering: 'name', is_active: true }),
    select: (response) => response.data,
  })

  const { data: accessoriesData } = useQuery({
    queryKey: ['wholesaler-accessories'],
    queryFn: () => inventoryAPI.getAccessories({ ordering: 'name', is_active: true }),
    select: (response) => response.data,
  })

  const { data: productsData } = useQuery({
    queryKey: ['wholesaler-products'],
    queryFn: () => inventoryAPI.getProducts({ ordering: 'name', is_active: true }),
    select: (response) => response.data,
  })

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['wholesaler-orders'],
    queryFn: () => orderAPI.getOrders({ ordering: '-created_at' }),
    select: (response) => response.data,
  })

  const createOrder = useMutation({
    mutationFn: (payload) => orderAPI.createOrder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wholesaler-orders'] })
      setNotes('')
      setItems([createEmptyItem()])
      addToast({ type: 'success', title: 'Order placed successfully', message: 'Your order has been submitted to admin.' })
    },
    onError: (error) => {
      addToast({ type: 'error', title: 'Order failed', message: error.response?.data?.detail || 'Unable to place order.' })
    },
  })

  const models = Array.isArray(modelsData) ? modelsData : modelsData?.results || []
  const accessories = Array.isArray(accessoriesData) ? accessoriesData : accessoriesData?.results || []
  const products = Array.isArray(productsData) ? productsData : productsData?.results || []
  const orders = useMemo(() => (Array.isArray(ordersData) ? ordersData : ordersData?.results || []), [ordersData])

  const handleItemChange = (index, field, value) => {
    setItems((prev) => prev.map((item, idx) => {
      if (idx !== index) {
        return item
      }
      if (field === 'product_type') {
        return { ...item, product_type: value, item_id: '' }
      }
      return { ...item, [field]: value }
    }))
  }

  const handleAddItem = () => {
    setItems((prev) => [...prev, createEmptyItem()])
  }

  const handleRemoveItem = (index) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const payloadItems = items
      .filter((item) => item.item_id)
      .map((item) => {
        const payload = {
          product_type: item.product_type,
          quantity: Number(item.quantity || 1),
        }
        if (item.product_type === 'BATTERY_MODEL') {
          payload.battery_model_id = Number(item.item_id)
        }
        if (item.product_type === 'ACCESSORY') {
          payload.accessory_id = Number(item.item_id)
        }
        if (item.product_type === 'PRODUCT') {
          payload.product_id = Number(item.item_id)
        }
        return payload
      })

    if (!payloadItems.length) {
      return
    }

    createOrder.mutate({ notes, items: payloadItems })
  }

  const handleDownloadInvoice = async (orderId) => {
    const response = await orderAPI.getInvoice(orderId)
    const blobUrl = window.URL.createObjectURL(response.data)
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = `invoice_${orderId}.pdf`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(blobUrl)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold neon-title">Orders</h1>
          <p className="text-[color:var(--muted)]">Track orders sent to Lithovolt.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="panel-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Place Order</h2>
          <button type="button" className="neon-btn-secondary" onClick={handleAddItem}>Add Item</button>
        </div>

        {items.map((item, index) => (
          <div key={`${item.product_type}-${item.item_id}-${index}`} className="grid gap-4 md:grid-cols-12">
            <div className="md:col-span-3">
              <label htmlFor={`type-${index}`} className="field-label">Type</label>
              <select
                id={`type-${index}`}
                className="neon-input"
                value={item.product_type}
                onChange={(event) => handleItemChange(index, 'product_type', event.target.value)}
              >
                <option value="BATTERY_MODEL">Battery Model</option>
                <option value="ACCESSORY">Accessory</option>
                <option value="PRODUCT">Product</option>
              </select>
            </div>
            <div className="md:col-span-5">
              <label htmlFor={`item-${index}`} className="field-label">Item</label>
              <select
                id={`item-${index}`}
                className="neon-input"
                value={item.item_id}
                onChange={(event) => handleItemChange(index, 'item_id', event.target.value)}
              >
                <option value="">Select item</option>
                {item.product_type === 'BATTERY_MODEL'
                  ? models.map((model) => (
                    <option key={model.id} value={model.id}>{model.name}</option>
                  ))
                  : null}
                {item.product_type === 'ACCESSORY'
                  ? accessories.map((accessory) => (
                    <option key={accessory.id} value={accessory.id}>{accessory.name}</option>
                  ))
                  : null}
                {item.product_type === 'PRODUCT'
                  ? products.map((product) => (
                    <option key={product.id} value={product.id}>{product.name}</option>
                  ))
                  : null}
              </select>
            </div>
            <div className="md:col-span-3">
              <label htmlFor={`quantity-${index}`} className="field-label">Quantity</label>
              <input
                id={`quantity-${index}`}
                className="neon-input"
                type="number"
                min="1"
                value={item.quantity}
                onChange={(event) => handleItemChange(index, 'quantity', event.target.value)}
              />
            </div>
            <div className="md:col-span-1 flex items-end">
              {items.length > 1 ? (
                <button type="button" className="neon-btn-secondary" onClick={() => handleRemoveItem(index)}>Remove</button>
              ) : null}
            </div>
          </div>
        ))}

        <div>
          <label htmlFor="order-notes" className="field-label">Notes</label>
          <textarea
            id="order-notes"
            className="neon-input min-h-[90px]"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </div>

        <div className="flex items-center justify-end">
          <button className="neon-btn" type="submit" disabled={createOrder.isLoading}>
            {createOrder.isLoading ? 'Submitting...' : 'Submit Order'}
          </button>
        </div>
      </form>

      <div className="panel-card p-6">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Status</th>
              <th>Items</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(ordersLoading ? [] : orders).map((order) => (
              <tr key={order.id}>
                <td>ORD-{order.id}</td>
                <td><span className="tag">{order.status}</span></td>
                <td>{order.total_items}</td>
                <td>
                  {order.status === 'FULFILLED' ? (
                    <button className="neon-btn-secondary" type="button" onClick={() => handleDownloadInvoice(order.id)}>
                      Invoice
                    </button>
                  ) : (
                    <span className="text-xs text-[color:var(--muted)]">Awaiting fulfillment</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {ordersLoading ? <p className="mt-3 text-sm text-[color:var(--muted)]">Loading orders...</p> : null}
        {!ordersLoading && orders.length === 0 ? (
          <p className="mt-3 text-sm text-[color:var(--muted)]">No orders yet.</p>
        ) : null}
      </div>
    </div>
  )
}
