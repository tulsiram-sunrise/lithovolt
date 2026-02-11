import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TestWrapper, mockOrder, mockBatteryModel } from '../../test/helpers'
import OrdersPage from './OrdersPage'
import * as api from '../../services/api'

vi.mock('../../services/api')

describe('Wholesaler OrdersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders orders page with form and list', async () => {
    api.inventoryAPI.getBatteryModels = vi.fn(() =>
      Promise.resolve({ data: { results: [mockBatteryModel] } })
    )
    api.orderAPI.getOrders = vi.fn(() =>
      Promise.resolve({ data: { results: [] } })
    )

    render(
      <TestWrapper>
        <OrdersPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Orders')).toBeInTheDocument()
      expect(screen.getByText('Place Order')).toBeInTheDocument()
    })
  })

  it('allows adding multiple order items', async () => {
    api.inventoryAPI.getBatteryModels = vi.fn(() =>
      Promise.resolve({ data: { results: [mockBatteryModel] } })
    )
    api.orderAPI.getOrders = vi.fn(() =>
      Promise.resolve({ data: { results: [] } })
    )

    render(
      <TestWrapper>
        <OrdersPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Add Item')).toBeInTheDocument()
    })

    // Initially one item row
    expect(screen.getAllByLabelText(/Battery Model/i)).toHaveLength(1)

    // Add another item
    fireEvent.click(screen.getByText('Add Item'))

    // Now should have two item rows
    expect(screen.getAllByLabelText(/Battery Model/i)).toHaveLength(2)
  })

  it('submits order with items', async () => {
    api.inventoryAPI.getBatteryModels = vi.fn(() =>
      Promise.resolve({ data: { results: [mockBatteryModel] } })
    )
    api.orderAPI.getOrders = vi.fn(() =>
      Promise.resolve({ data: { results: [] } })
    )
    api.orderAPI.createOrder = vi.fn(() =>
      Promise.resolve({ data: mockOrder })
    )

    render(
      <TestWrapper>
        <OrdersPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Submit Order')).toBeInTheDocument()
    })

    // Select battery model
    const modelSelect = screen.getByLabelText(/Battery Model/i)
    fireEvent.change(modelSelect, { target: { value: mockBatteryModel.id } })

    // Set quantity
    const quantityInput = screen.getByLabelText(/Quantity/i)
    fireEvent.change(quantityInput, { target: { value: '10' } })

    // Submit
    fireEvent.click(screen.getByText('Submit Order'))

    await waitFor(() => {
      expect(api.orderAPI.createOrder).toHaveBeenCalledWith({
        notes: '',
        items: [
          {
            product_type: 'BATTERY_MODEL',
            battery_model_id: mockBatteryModel.id,
            quantity: 10,
          },
        ],
      })
    })
  })

  it('displays existing orders', async () => {
    api.inventoryAPI.getBatteryModels = vi.fn(() =>
      Promise.resolve({ data: { results: [] } })
    )
    api.orderAPI.getOrders = vi.fn(() =>
      Promise.resolve({ data: { results: [mockOrder] } })
    )

    render(
      <TestWrapper>
        <OrdersPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText(`ORD-${mockOrder.id}`)).toBeInTheDocument()
      expect(screen.getByText(mockOrder.status)).toBeInTheDocument()
    })
  })

  it('shows invoice button for fulfilled orders', async () => {
    const fulfilledOrder = { ...mockOrder, status: 'FULFILLED' }
    api.inventoryAPI.getBatteryModels = vi.fn(() =>
      Promise.resolve({ data: { results: [] } })
    )
    api.orderAPI.getOrders = vi.fn(() =>
      Promise.resolve({ data: { results: [fulfilledOrder] } })
    )

    render(
      <TestWrapper>
        <OrdersPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Invoice')).toBeInTheDocument()
    })
  })
})
