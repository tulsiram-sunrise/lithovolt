import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TestWrapper, mockWarranty } from '../../test/helpers'
import SalesPage from './SalesPage'
import * as api from '../../services/api'

vi.mock('../../services/api')

describe('Wholesaler SalesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders sales page with issue form', async () => {
    api.warrantyAPI.getWarranties = vi.fn(() =>
      Promise.resolve({ data: { results: [] } })
    )

    render(
      <TestWrapper>
        <SalesPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Sales & Warranties')).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /Issue Warranty/i, level: 2 })).toBeInTheDocument()
    })
  })

  it('displays issued warranties', async () => {
    api.warrantyAPI.getWarranties = vi.fn(() =>
      Promise.resolve({ data: { results: [mockWarranty] } })
    )

    render(
      <TestWrapper>
        <SalesPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText(mockWarranty.warranty_number)).toBeInTheDocument()
      expect(screen.getByText(mockWarranty.battery_model_name)).toBeInTheDocument()
    })
  })

  it('validates consumer contact before submitting', async () => {
    api.warrantyAPI.getWarranties = vi.fn(() =>
      Promise.resolve({ data: { results: [] } })
    )

    render(
      <TestWrapper>
        <SalesPage />
      </TestWrapper>
    )

    await waitFor(() => {
      const serialInput = screen.getByLabelText(/Serial Number/i)
      fireEvent.change(serialInput, { target: { value: 'LV000001' } })
    })

    // Submit without email or phone
    fireEvent.click(screen.getByRole('button', { name: /Issue Warranty/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/Provide consumer email or phone/i)
      ).toBeInTheDocument()
    })
  })

  it('submits warranty with consumer details', async () => {
    api.warrantyAPI.getWarranties = vi.fn(() =>
      Promise.resolve({ data: { results: [] } })
    )
    api.warrantyAPI.issueWarranty = vi.fn(() =>
      Promise.resolve({ data: mockWarranty })
    )

    render(
      <TestWrapper>
        <SalesPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Serial Number/i)).toBeInTheDocument()
    })

    // Fill form
    fireEvent.change(screen.getByLabelText(/Serial Number/i), {
      target: { value: 'LV000001' },
    })
    fireEvent.change(screen.getByLabelText(/Consumer Email/i), {
      target: { value: 'consumer@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/First Name/i), {
      target: { value: 'John' },
    })

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /Issue Warranty/i }))

    await waitFor(() => {
      expect(api.warrantyAPI.issueWarranty).toHaveBeenCalledWith({
        serial_number: 'LV000001',
        consumer_email: 'consumer@example.com',
        consumer_first_name: 'John',
      })
    })
  })

  it('shows certificate download button', async () => {
    api.warrantyAPI.getWarranties = vi.fn(() =>
      Promise.resolve({ data: { results: [mockWarranty] } })
    )

    render(
      <TestWrapper>
        <SalesPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Certificate')).toBeInTheDocument()
    })
  })
})
