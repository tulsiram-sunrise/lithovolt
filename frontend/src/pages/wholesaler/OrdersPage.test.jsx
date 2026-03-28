import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TestWrapper, mockOrder } from '../../test/helpers'
import OrdersPage from './OrdersPage'
import * as api from '../../services/api'

vi.mock('../../services/api')

describe('Wholesaler OrdersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders orders page with listing and place order action', async () => {
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
      expect(screen.getByRole('link', { name: 'Place New Order' })).toHaveAttribute('href', '/wholesaler/orders/new')
    })
  })

  it('displays existing orders', async () => {
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

  it('requests filtered orders when status filter is selected', async () => {
    api.orderAPI.getOrders = vi.fn(() =>
      Promise.resolve({ data: { results: [] } })
    )

    render(
      <TestWrapper>
        <OrdersPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(api.orderAPI.getOrders).toHaveBeenCalledWith({
        ordering: '-created_at',
        status: undefined,
      })
    })

    fireEvent.click(screen.getByRole('button', { name: 'Pending' }))

    await waitFor(() => {
      expect(api.orderAPI.getOrders).toHaveBeenLastCalledWith({
        ordering: '-created_at',
        status: 'PENDING',
      })
    })
  })
})
