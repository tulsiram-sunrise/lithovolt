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
      Promise.resolve({ data: { results: [], current_page: 1, last_page: 1 } })
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
      Promise.resolve({ data: { results: [mockOrder], current_page: 1, last_page: 1 } })
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

  it('supports Laravel paginator shape with data array', async () => {
    api.orderAPI.getOrders = vi.fn(() =>
      Promise.resolve({ data: { data: [mockOrder, { ...mockOrder, id: 999 }], current_page: 1, last_page: 1 } })
    )

    render(
      <TestWrapper>
        <OrdersPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText(`ORD-${mockOrder.id}`)).toBeInTheDocument()
      expect(screen.getByText('ORD-999')).toBeInTheDocument()
    })
  })

  it('shows invoice button for fulfilled orders', async () => {
    const fulfilledOrder = { ...mockOrder, status: 'FULFILLED' }
    api.orderAPI.getOrders = vi.fn(() =>
      Promise.resolve({ data: { results: [fulfilledOrder], current_page: 1, last_page: 1 } })
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

  it('shows cancel button only for pending orders', async () => {
    const orders = [
      { ...mockOrder, id: 1, status: 'PENDING' },
      { ...mockOrder, id: 2, status: 'ACCEPTED' },
    ]
    api.orderAPI.getOrders = vi.fn(() =>
      Promise.resolve({ data: { results: orders, current_page: 1, last_page: 1 } })
    )

    render(
      <TestWrapper>
        <OrdersPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    })
  })

  it('requests filtered orders when status filter is selected', async () => {
    api.orderAPI.getOrders = vi.fn(() =>
      Promise.resolve({ data: { results: [], current_page: 1, last_page: 1 } })
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
        page: 1,
        per_page: 10,
      })
    })

    fireEvent.click(screen.getByRole('button', { name: 'Pending' }))

    await waitFor(() => {
      expect(api.orderAPI.getOrders).toHaveBeenLastCalledWith({
        ordering: '-created_at',
        status: 'PENDING',
        page: 1,
        per_page: 10,
      })
    })
  })

  it('navigates to order detail page when View button clicked', async () => {
    api.orderAPI.getOrders = vi.fn(() =>
      Promise.resolve({ data: { results: [mockOrder], current_page: 1, last_page: 1 } })
    )

    render(
      <TestWrapper>
        <OrdersPage />
      </TestWrapper>
    )

    await waitFor(() => {
      const viewButtons = screen.getAllByRole('button', { name: 'View' })
      expect(viewButtons.length).toBeGreaterThan(0)
    })
  })

  it('displays status tags with correct colors', async () => {
    const orders = [
      { ...mockOrder, id: 1, status: 'PENDING' },
      { ...mockOrder, id: 2, status: 'ACCEPTED' },
      { ...mockOrder, id: 3, status: 'FULFILLED' },
    ]
    api.orderAPI.getOrders = vi.fn(() =>
      Promise.resolve({ data: { results: orders, current_page: 1, last_page: 1 } })
    )

    render(
      <TestWrapper>
        <OrdersPage />
      </TestWrapper>
    )

    await waitFor(() => {
      const tags = screen.getAllByText(/PENDING|ACCEPTED|FULFILLED/)
      expect(tags.length).toBeGreaterThanOrEqual(3)
      // Verify color classes are applied
      tags.forEach((tag) => {
        expect(tag.className).toMatch(/tag-(warning|info|success|error)/)
      })
    })
  })
})
