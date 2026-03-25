import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { TestWrapper, mockBatteryModel } from '../../test/helpers'
import BatteryModelsPage from './BatteryModelsPage'
import * as api from '../../services/api'

vi.mock('../../services/api')

describe('BatteryModelsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders battery models page', async () => {
    api.inventoryAPI.getBatteryModels = vi.fn(() =>
      Promise.resolve({ data: { results: [mockBatteryModel] } })
    )

    render(
      <TestWrapper>
        <BatteryModelsPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Battery Models')).toBeInTheDocument()
      expect(screen.getByText(mockBatteryModel.name)).toBeInTheDocument()
    })
  })

  it('displays loading state', () => {
    api.inventoryAPI.getBatteryModels = vi.fn(() => new Promise(() => {}))

    render(
      <TestWrapper>
        <BatteryModelsPage />
      </TestWrapper>
    )

    expect(document.querySelectorAll('tbody tr').length).toBeGreaterThan(0)
  })

  it('shows add new model navigation', async () => {
    api.inventoryAPI.getBatteryModels = vi.fn(() =>
      Promise.resolve({ data: { results: [] } })
    )

    render(
      <TestWrapper>
        <BatteryModelsPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'Add New Model' })).toHaveAttribute('href', '/admin/battery-models/new')
    })
  })
})
