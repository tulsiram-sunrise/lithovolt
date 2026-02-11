import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
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

    expect(screen.getByText('Loading models...')).toBeInTheDocument()
  })

  it('submits new battery model', async () => {
    api.inventoryAPI.getBatteryModels = vi.fn(() =>
      Promise.resolve({ data: { results: [] } })
    )
    api.inventoryAPI.createBatteryModel = vi.fn(() =>
      Promise.resolve({ data: mockBatteryModel })
    )

    render(
      <TestWrapper>
        <BatteryModelsPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Name/i)).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText(/Name/i), {
      target: { value: 'LV 200Ah' },
    })
    fireEvent.change(screen.getByLabelText(/SKU/i), {
      target: { value: 'LV-200' },
    })
    fireEvent.change(screen.getByLabelText(/Warranty/i), {
      target: { value: '24' },
    })

    fireEvent.click(screen.getByText('Create Model'))

    await waitFor(() => {
      expect(api.inventoryAPI.createBatteryModel).toHaveBeenCalledWith({
        name: 'LV 200Ah',
        sku: 'LV-200',
        warranty_months: 24,
      })
    })
  })
})
