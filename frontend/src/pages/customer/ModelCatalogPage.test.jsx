import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { TestWrapper } from '../../test/helpers'
import ModelCatalogPage from './ModelCatalogPage'
import * as api from '../../services/api'

vi.mock('../../services/api')

const models = [
  {
    id: 1,
    name: 'LithoVolt LV Premium MF95D31R',
    model_code: 'MF95D31R',
    sku: 'MF95D31R',
    series: 'LV Premium',
    application_segment: '4WD',
    battery_type: 'SMF CAL',
    capacity_ah: 95,
    cca: 850,
  },
]

describe('ModelCatalogPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders model cards and details links', async () => {
    api.inventoryAPI.getBatteryModels = vi.fn(() => Promise.resolve({ data: { results: models } }))

    render(
      <TestWrapper>
        <ModelCatalogPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('LithoVolt Model Catalog')).toBeInTheDocument()
      expect(screen.getByText(models[0].name)).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'View Details' })).toHaveAttribute('href', '/customer/models/1')
    })
  })

  it('shows empty state when list is empty', async () => {
    api.inventoryAPI.getBatteryModels = vi.fn(() => Promise.resolve({ data: { results: [] } }))

    render(
      <TestWrapper>
        <ModelCatalogPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('No models match your filters.')).toBeInTheDocument()
    })
  })
})
