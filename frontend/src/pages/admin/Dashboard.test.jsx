import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { TestWrapper, mockBatteryModel, mockOrder } from '../../test/helpers'
import AdminDashboard from './Dashboard'
import * as api from '../../services/api'

vi.mock('../../services/api')

describe('AdminDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
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
      expect(screen.getByText(/Unable to load metrics/i)).toBeInTheDocument()
    })
  })
})
