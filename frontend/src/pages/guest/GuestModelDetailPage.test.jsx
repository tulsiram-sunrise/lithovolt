import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import GuestModelDetailPage from './GuestModelDetailPage'
import * as api from '../../services/api'

vi.mock('../../services/api')

function renderWithRoute(path = '/models/2') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/models/:id" element={<GuestModelDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

const models = [
  {
    id: 1,
    name: 'LithoVolt LV Premium MF95D31R',
    model_code: 'MF95D31R',
    battery_type: 'SMF CAL',
    capacity_ah: 95,
    series: 'LV Premium',
  },
  {
    id: 2,
    name: 'LithoVolt LV Plus SMFNS70X',
    model_code: 'SMFNS70X',
    battery_type: 'SMF CAL',
    capacity_ah: 75,
    series: 'LV Plus',
    maintenance_free: false,
  },
]

describe('GuestModelDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders matched model details by route id', async () => {
    api.publicCatalogAPI.getBatteryModels = vi.fn(() => Promise.resolve({ data: { results: models } }))

    renderWithRoute('/models/2')

    await waitFor(() => {
      expect(screen.getByText('Battery Model Details')).toBeInTheDocument()
      expect(screen.getByText('LithoVolt LV Plus SMFNS70X')).toBeInTheDocument()
      expect(screen.getByText('Back to Models')).toBeInTheDocument()
    })

    expect(api.publicCatalogAPI.getBatteryModels).toHaveBeenCalled()
  })

  it('shows not found state when id is missing in list', async () => {
    api.publicCatalogAPI.getBatteryModels = vi.fn(() => Promise.resolve({ data: { results: models } }))

    renderWithRoute('/models/999')

    await waitFor(() => {
      expect(screen.getByText('Model not found.')).toBeInTheDocument()
    })
  })

  it('shows error state when fetch fails', async () => {
    api.publicCatalogAPI.getBatteryModels = vi.fn(() => Promise.reject(new Error('boom')))

    renderWithRoute('/models/2')

    await waitFor(() => {
      expect(screen.getByText('Unable to load model details.')).toBeInTheDocument()
    })
  })
})
