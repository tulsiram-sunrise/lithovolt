import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { TestWrapper, mockOrder } from '../../test/helpers'
import OrderDetailPage from './OrderDetailPage'
import * as api from '../../services/api'

vi.mock('../../services/api')
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({ orderId: mockOrder.id }),
  }
})

describe('Wholesaler OrderDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders order details and items', async () => {
    api.orderAPI.getOrder = vi.fn(() =>
      Promise.resolve({ data: mockOrder })
    )

    render(
      <TestWrapper>
        <OrderDetailPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText(`Order ORD-${mockOrder.id}`)).toBeInTheDocument()
      expect(screen.getByText('Items')).toBeInTheDocument()
    })
  })

  it('displays status with color tag', async () => {
    api.orderAPI.getOrder = vi.fn(() =>
      Promise.resolve({ data: { ...mockOrder, status: 'PENDING' } })
    )

    render(
      <TestWrapper>
        <OrderDetailPage />
      </TestWrapper>
    )

    await waitFor(() => {
      const tags = screen.getAllByText(/PENDING/)
      expect(tags.length).toBeGreaterThan(0)
      // Verify color class is applied
      const statusTag = tags.find((t) => t.className.includes('tag-'))
      expect(statusTag).toBeTruthy()
    })
  })

  it('shows invoice download button for fulfilled orders', async () => {
    api.orderAPI.getOrder = vi.fn(() =>
      Promise.resolve({ data: { ...mockOrder, status: 'FULFILLED' } })
    )

    render(
      <TestWrapper>
        <OrderDetailPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Download Invoice')).toBeInTheDocument()
    })
  })

  it('displays order items table', async () => {
    const orderWithItems = {
      ...mockOrder,
      items: [
        {
          id: 1,
          product_name: 'Battery A',
          quantity: 2,
          unit_price: 100,
        },
        {
          id: 2,
          product_name: 'Battery B',
          quantity: 1,
          unit_price: 150,
        },
      ],
    }
    api.orderAPI.getOrder = vi.fn(() =>
      Promise.resolve({ data: orderWithItems })
    )

    render(
      <TestWrapper>
        <OrderDetailPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Battery A')).toBeInTheDocument()
      expect(screen.getByText('Battery B')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('1')).toBeInTheDocument()
    })
  })

  it('uses nested product name fallback', async () => {
    const orderWithNestedProduct = {
      ...mockOrder,
      items: [
        {
          id: 101,
          quantity: 1,
          unit_price: 99,
          product: { name: 'Nested Product Name' },
        },
      ],
    }

    api.orderAPI.getOrder = vi.fn(() => Promise.resolve({ data: orderWithNestedProduct }))

    render(
      <TestWrapper>
        <OrderDetailPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Nested Product Name')).toBeInTheDocument()
    })
  })

  it('shows cancel button only for pending status', async () => {
    api.orderAPI.getOrder = vi.fn(() => Promise.resolve({ data: { ...mockOrder, status: 'PENDING' } }))

    render(
      <TestWrapper>
        <OrderDetailPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Cancel Order' })).toBeInTheDocument()
    })
  })
})
