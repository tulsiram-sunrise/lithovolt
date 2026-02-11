import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TestWrapper, mockOrder } from '../../test/helpers'
import OrdersPage from './OrdersPage'
import * as api from '../../services/api'
import { useToastStore } from '../../store/toastStore'

vi.mock('../../services/api')

describe('Admin OrdersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useToastStore.setState({ toasts: [] })
  })

  it('renders orders page', async () => {
    api.orderAPI.getOrders = vi.fn(() =>
      Promise.resolve({ data: { results: [mockOrder] } })
    )

    render(
      <TestWrapper>
        <OrdersPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Orders')).toBeInTheDocument()
      expect(screen.getByText(`ORD-${mockOrder.id}`)).toBeInTheDocument()
    })
  })

  it('filters orders by status', async () => {
    api.orderAPI.getOrders = vi.fn(() =>
      Promise.resolve({ data: { results: [] } })
    )

    render(
      <TestWrapper>
        <OrdersPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Pending')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Pending'))

    expect(api.orderAPI.getOrders).toHaveBeenCalledWith({
      ordering: '-created_at',
      status: 'PENDING',
    })
  })

  it('accepts pending order', async () => {
    const pendingOrder = { ...mockOrder, status: 'PENDING' }
    api.orderAPI.getOrders = vi.fn(() =>
      Promise.resolve({ data: { results: [pendingOrder] } })
    )
    api.orderAPI.acceptOrder = vi.fn(() =>
      Promise.resolve({ data: { ...pendingOrder, status: 'ACCEPTED' } })
    )

    render(
      <TestWrapper>
        <OrdersPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Accept')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Accept'))

    await waitFor(() => {
      expect(api.orderAPI.acceptOrder).toHaveBeenCalledWith(pendingOrder.id)
    })
  })

  it('rejects pending order', async () => {
    const pendingOrder = { ...mockOrder, status: 'PENDING' }
    api.orderAPI.getOrders = vi.fn(() =>
      Promise.resolve({ data: { results: [pendingOrder] } })
    )
    api.orderAPI.rejectOrder = vi.fn(() =>
      Promise.resolve({ data: { ...pendingOrder, status: 'REJECTED' } })
    )

    render(
      <TestWrapper>
        <OrdersPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Reject')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Reject'))

    await waitFor(() => {
      expect(api.orderAPI.rejectOrder).toHaveBeenCalledWith(pendingOrder.id)
    })
  })

  it('fulfills accepted order', async () => {
    const acceptedOrder = { ...mockOrder, status: 'ACCEPTED' }
    api.orderAPI.getOrders = vi.fn(() =>
      Promise.resolve({ data: { results: [acceptedOrder] } })
    )
    api.orderAPI.fulfillOrder = vi.fn(() =>
      Promise.resolve({ data: { ...acceptedOrder, status: 'FULFILLED' } })
    )

    render(
      <TestWrapper>
        <OrdersPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Fulfill')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Fulfill'))

    await waitFor(() => {
      expect(api.orderAPI.fulfillOrder).toHaveBeenCalledWith(acceptedOrder.id)
    })
  })
})
