import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import ConsumerDetailPage from './ConsumerDetailPage'
import * as apiModule from '../../services/api'

vi.mock('../../services/api')

describe('ConsumerDetailPage', () => {
  const renderWithRouter = (component) => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/admin/consumers/:userId" element={component} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>,
      { initialEntries: ['/admin/consumers/10'] }
    )
  }

  it('should render without crashing', () => {
    apiModule.userAPI.getUser.mockResolvedValue({ data: { id: 10, email: 'john@example.com', is_active: true } })
    const { container } = renderWithRouter(<ConsumerDetailPage />)
    expect(container).toBeTruthy()
  })
})
