import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { inventoryAPI, orderAPI } from '../../services/api'
import { extractApiErrorMessage } from '../../services/apiError'
import { useToastStore } from '../../store/toastStore'

const createEmptyItem = () => ({ product_type: 'BATTERY', item_id: '', quantity: 1 })

export default function PlaceOrderPage() {
  const [notes, setNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('PAY_LATER')
  const [items, setItems] = useState([createEmptyItem()])
  const [formError, setFormError] = useState('')
  const [isSubmitLocked, setIsSubmitLocked] = useState(false)
  const submitLockRef = useRef(false)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const addToast = useToastStore((state) => state.addToast)

  const { data: catalogData } = useQuery({
    queryKey: ['wholesaler-catalog'],
    queryFn: () => inventoryAPI.getCatalogItems({ ordering: 'name', is_active: true, per_page: 200 }),
    select: (response) => response.data,
  })

  const createOrder = useMutation({
    mutationFn: (payload) => orderAPI.createOrder(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['wholesaler-orders'] })

      const checkoutUrl = response?.data?.checkout_url
      if (paymentMethod === 'ONLINE' && checkoutUrl) {
        addToast({
          type: 'success',
          title: 'Redirecting to Stripe',
          message: 'Your order is created. Continue payment on Stripe.',
        })

        if (import.meta.env.MODE === 'test') {
          navigate('/wholesaler/orders')
          return
        }

        window.location.assign(checkoutUrl)
        return
      }

      addToast({
        type: 'success',
        title: 'Order placed successfully',
        message: paymentMethod === 'PAY_LATER'
          ? 'Your order has been submitted with Pay Later.'
          : 'Your order has been submitted to admin.',
      })
      navigate('/wholesaler/orders')
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'Order failed',
        message: extractApiErrorMessage(error, 'Unable to place order.'),
      })
    },
    onSettled: () => {
      submitLockRef.current = false
      setIsSubmitLocked(false)
    },
  })

  const catalogItems = Array.isArray(catalogData) ? catalogData : catalogData?.results || catalogData?.data || []

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
    setFormError('')

    if (createOrder.isPending || submitLockRef.current) {
      return
    }

    if (!items.length) {
      setFormError('Add at least one item before submitting.')
      return
    }

    if (items.some((item) => !item.item_id)) {
      setFormError('Select an item in each order row before submitting.')
      return
    }

    if (items.some((item) => Number(item.quantity || 0) < 1)) {
      setFormError('Quantity must be at least 1 for each order item.')
      return
    }

    const payloadItems = items
      .filter((item) => item.item_id)
      .map((item) => ({
        product_type: 'PRODUCT',
        product_id: Number(item.item_id),
        quantity: Number(item.quantity || 1),
      }))

    if (!payloadItems.length) {
      setFormError('No valid order items found.')
      return
    }

    submitLockRef.current = true
    setIsSubmitLocked(true)
    createOrder.mutate({ notes, payment_method: paymentMethod, items: payloadItems })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold neon-title">Place Order</h1>
          <p className="text-[color:var(--muted)]">Create a new order request for Lithovolt products.</p>
        </div>
        <Link className="neon-btn-secondary" to="/wholesaler/orders">Back to Orders</Link>
      </div>

      <form onSubmit={handleSubmit} className="panel-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Order Items</h2>
          <button type="button" className="neon-btn-secondary" onClick={handleAddItem}>Add Item</button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <button
            type="button"
            className={`panel-card p-4 text-left transition ${paymentMethod === 'ONLINE' ? 'ring-1 ring-[color:var(--accent)]' : ''}`}
            onClick={() => setPaymentMethod('ONLINE')}
          >
            <p className="font-semibold">Online (Stripe)</p>
            <p className="text-sm text-[color:var(--muted)]">Pay instantly using Stripe Checkout.</p>
          </button>
          <button
            type="button"
            className={`panel-card p-4 text-left transition ${paymentMethod === 'PAY_LATER' ? 'ring-1 ring-[color:var(--accent)]' : ''}`}
            onClick={() => setPaymentMethod('PAY_LATER')}
          >
            <p className="font-semibold">Pay Later</p>
            <p className="text-sm text-[color:var(--muted)]">Place order now and settle payment later.</p>
          </button>
        </div>

        <p className="text-sm text-[color:var(--muted)]">Selected payment method: <span className="font-medium text-[color:var(--text)]">{paymentMethod === 'ONLINE' ? 'Online (Stripe)' : 'Pay Later'}</span></p>

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
                <option value="BATTERY">Battery Model</option>
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
                {catalogItems
                  .filter((catalogItem) => {
                    const type = String(catalogItem.product_type || 'BATTERY').toUpperCase()
                    if (item.product_type === 'BATTERY') {
                      return type === 'BATTERY'
                    }
                    if (item.product_type === 'ACCESSORY') {
                      return type === 'ACCESSORY'
                    }
                    return type !== 'BATTERY' && type !== 'ACCESSORY'
                  })
                  .map((catalogItem) => (
                    <option key={catalogItem.id} value={catalogItem.id}>{catalogItem.name}</option>
                  ))}
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

        {formError ? <p className="text-sm text-[color:var(--danger)]">{formError}</p> : null}

        <div className="flex items-center justify-end gap-2">
          <Link className="neon-btn-secondary" to="/wholesaler/orders">Cancel</Link>
          <button className="neon-btn" type="submit" disabled={createOrder.isPending || isSubmitLocked}>
            {(createOrder.isPending || isSubmitLocked) ? 'Submitting...' : (paymentMethod === 'ONLINE' ? 'Proceed to Stripe' : 'Submit Order')}
          </button>
        </div>
      </form>
    </div>
  )
}
