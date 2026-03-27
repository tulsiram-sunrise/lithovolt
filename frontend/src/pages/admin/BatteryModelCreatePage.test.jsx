import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TestWrapper } from '../../test/helpers'
import BatteryModelCreatePage from './BatteryModelCreatePage'
import * as api from '../../services/api'

vi.mock('../../services/api')

describe('BatteryModelCreatePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('submits battery model using full-form required fields', async () => {
    api.inventoryAPI.createCatalogItem = vi.fn(() => Promise.resolve({ data: { id: 99 } }))

    render(
      <TestWrapper>
        <BatteryModelCreatePage />
      </TestWrapper>
    )

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'LV 200Ah Pro' } })
    fireEvent.change(screen.getByLabelText('SKU'), { target: { value: 'LV-200-PRO' } })
    fireEvent.change(screen.getByLabelText('Voltage'), { target: { value: '12' } })
    fireEvent.change(screen.getByLabelText('Capacity'), { target: { value: '200' } })
    fireEvent.change(screen.getByLabelText('Total Quantity'), { target: { value: '100' } })
    fireEvent.change(screen.getByLabelText('Available Quantity'), { target: { value: '90' } })
    fireEvent.change(screen.getByLabelText('Price'), { target: { value: '799.5' } })
    fireEvent.change(screen.getByLabelText('Warranty (months)'), { target: { value: '36' } })

    fireEvent.click(screen.getByRole('button', { name: 'Create Model' }))

    await waitFor(() => {
      expect(api.inventoryAPI.createCatalogItem).toHaveBeenCalled()
    })

    const payload = api.inventoryAPI.createCatalogItem.mock.calls[0][0]
    expect(payload).toMatchObject({
      product_type: 'BATTERY',
      name: 'LV 200Ah Pro',
      sku: 'LV-200-PRO',
      voltage: 12,
      capacity: 200,
      total_quantity: 100,
      available_quantity: 90,
      price: 799.5,
      warranty_months: 36,
      default_warranty_months: 36,
      status: 'active',
    })
  })
})
