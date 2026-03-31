import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import WholesalerDetailPage from './WholesalerDetailPage'
import * as apiModule from '../../services/api'

vi.mock('../../services/api')

describe('WholesalerDetailPage', () => {
  const renderWithRouter = (component) => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/admin/wholesalers/:userId" element={component} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>,
      { initialEntries: ['/admin/wholesalers/5'] }
    )
  }

  it('should render without crashing', () => {
    apiModule.userAPI.getUser.mockResolvedValue({ data: { id: 5, email: 'jane@wholesale.com', is_active: true } })
    const { container } = renderWithRouter(<WholesalerDetailPage />)
    expect(container).toBeTruthy()
  })
})
