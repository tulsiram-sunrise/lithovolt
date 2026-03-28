import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { TestWrapper, mockOrder } from '../../test/helpers'
import AdminDashboard from './Dashboard'
import * as api from '../../services/api'

vi.mock('../../services/api')

describe('AdminDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    api.adminAPI.inviteWholesaler = vi.fn(() =>
      Promise.resolve({
        data: {
          message: 'Invitation sent successfully',
          invitation: { id: 1, sent_at: '2026-03-27T00:00:00.000000Z' },
        },
      })
    )
    api.adminAPI.getOrderStats = vi.fn(() => Promise.resolve({ data: { total: 0 } }))
    api.adminAPI.getUserStats = vi.fn(() => Promise.resolve({ data: { total: 0 } }))
    api.adminAPI.getWarrantyStats = vi.fn(() => Promise.resolve({ data: { total: 0 } }))
    api.adminAPI.getTrends = vi.fn(() =>
      Promise.resolve({
        data: {
          range: { days: 30, start: '2026-02-27', end: '2026-03-28' },
          series: {
            labels: ['Mar 25', 'Mar 26', 'Mar 27'],
            orders: [1, 2, 3],
            warranties: [0, 1, 1],
            users: [2, 1, 2],
          },
          totals: { orders: 6, warranties: 2, users: 5 },
          previous_totals: { orders: 3, warranties: 1, users: 4 },
          delta_percent: { orders: 100, warranties: 100, users: 25 },
        },
      })
    )
  })

  it('renders loading state initially', () => {
    api.adminAPI.getMetrics = vi.fn(() => new Promise(() => {}))
    api.orderAPI.getOrders = vi.fn(() => new Promise(() => {}))

    render(
      <TestWrapper>
        <AdminDashboard />
      </TestWrapper>
    )

    expect(screen.getByText('Admin Command')).toBeInTheDocument()
  })

  it('displays metrics when loaded', async () => {
    const mockMetrics = {
      users_by_role: { ADMIN: 5, WHOLESALER: 10, CONSUMER: 50 },
      orders_by_status: { PENDING: 3, ACCEPTED: 5, FULFILLED: 12 },
      warranties_by_status: { ACTIVE: 30, EXPIRED: 5 },
      battery_models: 8,
      serials_by_status: { AVAILABLE: 100 },
    }

    api.adminAPI.getMetrics = vi.fn(() =>
      Promise.resolve({ data: mockMetrics })
    )
    api.adminAPI.getOrderStats = vi.fn(() => Promise.resolve({ data: { total: 20 } }))
    api.adminAPI.getUserStats = vi.fn(() => Promise.resolve({ data: { total: 65 } }))
    api.adminAPI.getWarrantyStats = vi.fn(() => Promise.resolve({ data: { total: 35 } }))
    api.orderAPI.getOrders = vi.fn(() =>
      Promise.resolve({ data: { results: [] } })
    )

    render(
      <TestWrapper>
        <AdminDashboard />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Total Users')).toBeInTheDocument()
      expect(screen.getByText('65')).toBeInTheDocument() // 5 + 10 + 50
      expect(screen.getByText('Trend Monitor')).toBeInTheDocument()
      expect(screen.getByText('Operational Mix')).toBeInTheDocument()
      expect(screen.getByText('Dashboard vs Reports')).toBeInTheDocument()
    })
  })

  it('displays recent orders', async () => {
    api.adminAPI.getMetrics = vi.fn(() =>
      Promise.resolve({
        data: {
          users_by_role: {},
          orders_by_status: {},
          warranties_by_status: {},
        },
      })
    )
    api.orderAPI.getOrders = vi.fn(() =>
      Promise.resolve({ data: { results: [mockOrder] } })
    )

    render(
      <TestWrapper>
        <AdminDashboard />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Recent Orders')).toBeInTheDocument()
      expect(screen.getByText(`ORD-${mockOrder.id}`)).toBeInTheDocument()
    })
  })

  it('shows error message when metrics fail to load', async () => {
    api.adminAPI.getMetrics = vi.fn(() =>
      Promise.reject(new Error('Network error'))
    )
    api.orderAPI.getOrders = vi.fn(() =>
      Promise.resolve({ data: { results: [] } })
    )

    render(
      <TestWrapper>
        <AdminDashboard />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText(/Metrics unavailable/i)).toBeInTheDocument()
    })
  })

  it('opens invite modal and submits invitation', async () => {
    api.adminAPI.getMetrics = vi.fn(() =>
      Promise.resolve({
        data: {
          users_by_role: {},
          orders_by_status: {},
          warranties_by_status: {},
        },
      })
    )
    api.orderAPI.getOrders = vi.fn(() =>
      Promise.resolve({ data: { results: [] } })
    )

    render(
      <TestWrapper>
        <AdminDashboard />
      </TestWrapper>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Invite Wholesaler' }))

    fireEvent.change(screen.getByPlaceholderText('wholesaler@company.com'), {
      target: { value: 'partner@example.com' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Send Invitation' }))

    await waitFor(() => {
      expect(api.adminAPI.inviteWholesaler).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'partner@example.com' })
      )
    })
  })
})
