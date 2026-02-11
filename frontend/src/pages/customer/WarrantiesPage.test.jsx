import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TestWrapper, mockWarranty } from '../../test/helpers'
import WarrantiesPage from './WarrantiesPage'
import * as api from '../../services/api'

vi.mock('../../services/api')

describe('Customer WarrantiesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders warranties page', async () => {
    api.warrantyAPI.getWarranties = vi.fn(() =>
      Promise.resolve({ data: { results: [] } })
    )

    render(
      <TestWrapper>
        <WarrantiesPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('My Warranties')).toBeInTheDocument()
    })
  })

  it('displays customer warranties', async () => {
    api.warrantyAPI.getWarranties = vi.fn(() =>
      Promise.resolve({ data: { results: [mockWarranty] } })
    )

    render(
      <TestWrapper>
        <WarrantiesPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText(mockWarranty.warranty_number)).toBeInTheDocument()
      expect(screen.getByText(mockWarranty.serial)).toBeInTheDocument()
      expect(screen.getByText(mockWarranty.battery_model_name)).toBeInTheDocument()
    })
  })

  it('shows certificate download button for each warranty', async () => {
    api.warrantyAPI.getWarranties = vi.fn(() =>
      Promise.resolve({ data: { results: [mockWarranty] } })
    )

    render(
      <TestWrapper>
        <WarrantiesPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Certificate')).toBeInTheDocument()
    })
  })

  it('handles certificate download', async () => {
    api.warrantyAPI.getWarranties = vi.fn(() =>
      Promise.resolve({ data: { results: [mockWarranty] } })
    )
    api.warrantyAPI.getCertificate = vi.fn(() =>
      Promise.resolve({ data: new Blob(['pdf content']) })
    )

    render(
      <TestWrapper>
        <WarrantiesPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Certificate')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Certificate'))

    await waitFor(() => {
      expect(api.warrantyAPI.getCertificate).toHaveBeenCalledWith(
        mockWarranty.id
      )
    })
  })

  it('shows empty state when no warranties', async () => {
    api.warrantyAPI.getWarranties = vi.fn(() =>
      Promise.resolve({ data: { results: [] } })
    )

    render(
      <TestWrapper>
        <WarrantiesPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('No warranties found.')).toBeInTheDocument()
    })
  })
})
