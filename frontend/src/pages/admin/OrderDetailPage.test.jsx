import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import OrderDetailPage from './OrderDetailPage'
import * as api from '../../services/api'

vi.mock('../../services/api')

describe('Admin OrderDetailPage', () => {
  let queryClient

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
  })

  const renderPage = () => render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/admin/orders/10']}>
        <Routes>
          <Route path="/admin/orders/:orderId" element={<OrderDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
    {}
  )

  it('renders order details and items', async () => {
    api.orderAPI.getOrder = vi.fn(() => Promise.resolve({
      data: {
        id: 10,
        order_number: 'ORD-10',
        status: 'PENDING',
        payment_method: 'PAY_LATER',
        payment_status: 'PENDING',
        total_amount: 200,
        user: { full_name: 'Wholesaler User' },
        items: [{ id: 1, quantity: 2, unit_price: 100, total_price: 200, product: { name: 'LV Battery' } }],
      },
    }))
    api.adminAPI.getActivity = vi.fn(() => Promise.resolve({ data: { items: [] } }))

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Order Items')).toBeInTheDocument()
      expect(screen.getByText('Wholesaler User')).toBeInTheDocument()
      expect(screen.getByText('LV Battery')).toBeInTheDocument()
    })
  })

  it('runs status action from detail page', async () => {
    api.orderAPI.getOrder = vi.fn(() => Promise.resolve({
      data: {
        id: 10,
        order_number: 'ORD-10',
        status: 'PENDING',
        items: [],
      },
    }))
    api.adminAPI.getActivity = vi.fn(() => Promise.resolve({ data: { items: [] } }))
    api.orderAPI.acceptOrder = vi.fn(() => Promise.resolve({ data: {} }))

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Accept Order')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Accept Order'))

    await waitFor(() => {
      expect(api.orderAPI.acceptOrder).toHaveBeenCalledWith(10)
    })
  })
})
