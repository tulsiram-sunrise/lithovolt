import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TestWrapper, mockOrder, mockBatteryModel } from '../../test/helpers'
import PlaceOrderPage from './PlaceOrderPage'
import * as api from '../../services/api'

vi.mock('../../services/api')

describe('Wholesaler PlaceOrderPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    api.inventoryAPI.getCatalogItems = vi.fn(() =>
      Promise.resolve({ data: { results: [mockBatteryModel] } })
    )
  })

  it('renders dedicated place order page', async () => {
    render(
      <TestWrapper>
        <PlaceOrderPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Place Order')).toBeInTheDocument()
      expect(screen.getByText('Order Items')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Back to Orders' })).toHaveAttribute('href', '/wholesaler/orders')
    })
  })

  it('allows adding multiple order items', async () => {
    render(
      <TestWrapper>
        <PlaceOrderPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Add Item')).toBeInTheDocument()
    })

    expect(screen.getAllByLabelText(/Item/i)).toHaveLength(1)

    fireEvent.click(screen.getByText('Add Item'))

    expect(screen.getAllByLabelText(/Item/i)).toHaveLength(2)
  })

  it('submits order with selected items', async () => {
    api.orderAPI.createOrder = vi.fn(() => Promise.resolve({ data: mockOrder }))

    render(
      <TestWrapper>
        <PlaceOrderPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Submit Order')).toBeInTheDocument()
      expect(screen.getByRole('option', { name: mockBatteryModel.name })).toBeInTheDocument()
    })

    const itemSelect = screen.getByLabelText(/Item/i)
    fireEvent.change(itemSelect, { target: { value: String(mockBatteryModel.id) } })

    const quantityInput = screen.getByLabelText(/Quantity/i)
    fireEvent.change(quantityInput, { target: { value: '10' } })

    fireEvent.click(screen.getByText('Submit Order'))

    await waitFor(() => {
      expect(api.orderAPI.createOrder).toHaveBeenCalledWith({
        notes: '',
        payment_method: 'PAY_LATER',
        items: [
          {
            product_type: 'PRODUCT',
            product_id: mockBatteryModel.id,
            quantity: 10,
          },
        ],
      })
    })
  })

  it('submits online payment orders with stripe method', async () => {
    api.orderAPI.createOrder = vi.fn(() => Promise.resolve({
      data: {
        ...mockOrder,
        checkout_url: 'https://checkout.stripe.com/pay/cs_test_123',
      },
    }))

    render(
      <TestWrapper>
        <PlaceOrderPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Online (Stripe)')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Online (Stripe)').closest('button'))

    const itemSelect = screen.getByLabelText(/Item/i)
    fireEvent.change(itemSelect, { target: { value: String(mockBatteryModel.id) } })

    const quantityInput = screen.getByLabelText(/Quantity/i)
    fireEvent.change(quantityInput, { target: { value: '2' } })

    fireEvent.click(screen.getByText('Proceed to Stripe'))

    await waitFor(() => {
      expect(api.orderAPI.createOrder).toHaveBeenCalledWith({
        notes: '',
        payment_method: 'ONLINE',
        items: [
          {
            product_type: 'PRODUCT',
            product_id: mockBatteryModel.id,
            quantity: 2,
          },
        ],
      })
    })
  })

  it('prevents duplicate order creation on rapid submit clicks', async () => {
    let resolveCreate
    api.orderAPI.createOrder = vi.fn(() => new Promise((resolve) => {
      resolveCreate = resolve
    }))

    render(
      <TestWrapper>
        <PlaceOrderPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Submit Order')).toBeInTheDocument()
      expect(screen.getByRole('option', { name: mockBatteryModel.name })).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText(/Item/i), { target: { value: String(mockBatteryModel.id) } })
    fireEvent.change(screen.getByLabelText(/Quantity/i), { target: { value: '1' } })

    const submitButton = screen.getByRole('button', { name: 'Submit Order' })
    fireEvent.click(submitButton)
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(api.orderAPI.createOrder).toHaveBeenCalledTimes(1)
    })

    resolveCreate({ data: mockOrder })
    await waitFor(() => {
      expect(api.orderAPI.createOrder).toHaveBeenCalledTimes(1)
    })
  })
})
