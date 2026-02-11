import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TestWrapper } from '../../test/helpers'
import ClaimWarrantyPage from './ClaimWarrantyPage'
import * as api from '../../services/api'

vi.mock('../../services/api')

describe('Customer ClaimWarrantyPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders claim warranty form', () => {
    render(
      <TestWrapper>
        <ClaimWarrantyPage />
      </TestWrapper>
    )

    expect(screen.getByRole('heading', { name: /Claim Warranty/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/Serial Number/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Phone/i)).toBeInTheDocument()
  })

  it('submits warranty claim with serial and contact info', async () => {
    api.warrantyAPI.claimWarranty = vi.fn(() =>
      Promise.resolve({ data: { warranty_number: 'WAR-2026-001' } })
    )

    render(
      <TestWrapper>
        <ClaimWarrantyPage />
      </TestWrapper>
    )

    // Fill form
    fireEvent.change(screen.getByLabelText(/Serial Number/i), {
      target: { value: 'LV000001' },
    })
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'consumer@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/First Name/i), {
      target: { value: 'John' },
    })
    fireEvent.change(screen.getByLabelText(/Last Name/i), {
      target: { value: 'Doe' },
    })

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /Claim Warranty/i }))

    await waitFor(() => {
      expect(api.warrantyAPI.claimWarranty).toHaveBeenCalledWith({
        serial_number: 'LV000001',
        consumer_email: 'consumer@example.com',
        consumer_phone: '',
        consumer_first_name: 'John',
        consumer_last_name: 'Doe',
      })
    })
  })

  it('displays success message on successful claim', async () => {
    api.warrantyAPI.claimWarranty = vi.fn(() =>
      Promise.resolve({ data: { warranty_number: 'WAR-2026-001' } })
    )

    render(
      <TestWrapper>
        <ClaimWarrantyPage />
      </TestWrapper>
    )

    fireEvent.change(screen.getByLabelText(/Serial Number/i), {
      target: { value: 'LV000001' },
    })
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'consumer@example.com' },
    })

    fireEvent.click(screen.getByRole('button', { name: /Claim Warranty/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/Warranty claimed successfully/i)
      ).toBeInTheDocument()
    })
  })

  it('displays error message on failed claim', async () => {
    api.warrantyAPI.claimWarranty = vi.fn(() =>
      Promise.reject({
        response: { data: { error: 'Serial number not found' } },
      })
    )

    render(
      <TestWrapper>
        <ClaimWarrantyPage />
      </TestWrapper>
    )

    fireEvent.change(screen.getByLabelText(/Serial Number/i), {
      target: { value: 'INVALID' },
    })
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'consumer@example.com' },
    })

    fireEvent.click(screen.getByRole('button', { name: /Claim Warranty/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/Serial number not found/i)
      ).toBeInTheDocument()
    })
  })

  it('disables submit button while loading', async () => {
    api.warrantyAPI.claimWarranty = vi.fn(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    )

    render(
      <TestWrapper>
        <ClaimWarrantyPage />
      </TestWrapper>
    )

    fireEvent.change(screen.getByLabelText(/Serial Number/i), {
      target: { value: 'LV000001' },
    })
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'test@example.com' },
    })

    const submitButton = screen.getByRole('button', { name: /Claim Warranty/i })
    fireEvent.click(submitButton)

    expect(submitButton).toBeDisabled()
    expect(screen.getByText('Submitting...')).toBeInTheDocument()
  })
})
