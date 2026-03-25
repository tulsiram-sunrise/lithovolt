import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { TestWrapper } from '../../test/helpers'
import GuestModelCatalogPage from './GuestModelCatalogPage'
import * as api from '../../services/api'

vi.mock('../../services/api')

const models = [
  {
    id: 5,
    name: 'LithoVolt LV Plus SMFNS70X',
    model_code: 'SMFNS70X',
    sku: 'SMFNS70X',
    series: 'LV Plus',
    application_segment: 'SUV',
    battery_type: 'SMF CAL',
    capacity_ah: 75,
    cca: 700,
  },
]

describe('GuestModelCatalogPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders model cards and details links', async () => {
    api.publicCatalogAPI.getBatteryModels = vi.fn(() => Promise.resolve({ data: { results: models } }))

    render(
      <TestWrapper>
        <GuestModelCatalogPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Guest Model Browser')).toBeInTheDocument()
      expect(screen.getByText(models[0].name)).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'View Details' })).toHaveAttribute('href', '/models/5')
    })
  })

  it('shows empty state when list is empty', async () => {
    api.publicCatalogAPI.getBatteryModels = vi.fn(() => Promise.resolve({ data: { results: [] } }))

    render(
      <TestWrapper>
        <GuestModelCatalogPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('No models found.')).toBeInTheDocument()
    })
  })
})
