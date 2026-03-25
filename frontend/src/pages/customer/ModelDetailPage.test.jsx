import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import CustomerModelDetailPage from './ModelDetailPage'
import * as api from '../../services/api'

vi.mock('../../services/api')

function renderWithRoute(path = '/customer/models/1') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/customer/models/:id" element={<CustomerModelDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

const model = {
  id: 1,
  name: 'LithoVolt LV Premium MF95D31R',
  model_code: 'MF95D31R',
  sku: 'MF95D31R',
  application_segment: '4WD, SUV, Truck & Industrial Applications',
  series: 'LV Premium',
  battery_type: 'SMF CAL',
  chemistry: 'SMF CAL',
  cca: 850,
  capacity_ah: 95,
  reserve_capacity: 180,
  group_size: 'N70',
  length_mm: 304,
  width_mm: 174,
  height_mm: 203,
  total_height_mm: 224,
  unit_weight_kg: 18,
  terminal_type: 'STD',
  terminal_layout: 'D',
  hold_down: 'FL',
  vent_type: 'TS',
  maintenance_free: true,
  private_warranty_months: 40,
  commercial_warranty_months: 24,
  available_quantity: 12,
  total_quantity: 30,
}

describe('CustomerModelDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders full model detail content', async () => {
    api.inventoryAPI.getBatteryModel = vi.fn(() => Promise.resolve({ data: model }))

    renderWithRoute()

    await waitFor(() => {
      expect(screen.getByText('Battery Model Details')).toBeInTheDocument()
      expect(screen.getByText(model.name)).toBeInTheDocument()
      expect(screen.getByText('Core Specs')).toBeInTheDocument()
      expect(screen.getByText('Dimensions')).toBeInTheDocument()
      expect(screen.getByText('Terminal & Build')).toBeInTheDocument()
      expect(screen.getByText('Warranty & Availability')).toBeInTheDocument()
      expect(screen.getByText('Back to Catalog')).toBeInTheDocument()
    })

    expect(api.inventoryAPI.getBatteryModel).toHaveBeenCalledWith('1')
  })

  it('shows loading skeleton while fetching', () => {
    api.inventoryAPI.getBatteryModel = vi.fn(() => new Promise(() => {}))

    renderWithRoute()

    expect(screen.getByText('Battery Model Details')).toBeInTheDocument()
    expect(document.querySelector('.animate-pulse')).toBeTruthy()
  })

  it('shows error state on request failure', async () => {
    api.inventoryAPI.getBatteryModel = vi.fn(() => Promise.reject(new Error('Network error')))

    renderWithRoute()

    await waitFor(() => {
      expect(screen.getByText('Unable to load model details.')).toBeInTheDocument()
    })
  })
})
