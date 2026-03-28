import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { TestWrapper } from '../../test/helpers'
import { useToastStore } from '../../store/toastStore'
import WarrantyClaimsPage from './WarrantyClaimsPage'
import api from '../../services/api'

vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
  },
}))

describe('Admin WarrantyClaimsPage', () => {
  const claim = {
    id: 1,
    claim_number: 'CLM-0001',
    status: 'PENDING',
    created_at: '2026-03-27T10:00:00Z',
    consumer_name: 'John Doe',
    complaint_description: 'Battery not charging',
    warranty: {
      id: 4,
      warranty_number: 'WAR-0004',
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    useToastStore.setState({ toasts: [] })
    api.get.mockResolvedValue({ data: { results: [claim] } })
    api.put.mockResolvedValue({ data: { ...claim, status: 'UNDER_REVIEW' } })
  })

  it('renders claims and summary cards', async () => {
    render(
      <TestWrapper>
        <WarrantyClaimsPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Warranty Claims')).toBeInTheDocument()
      expect(screen.getByText('CLM-0001')).toBeInTheDocument()
      expect(screen.getAllByText('PENDING').length).toBeGreaterThan(0)
    })
  })

  it('requests filtered claims when status filter changes', async () => {
    render(
      <TestWrapper>
        <WarrantyClaimsPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/warranty-claims/', {
        params: { status: undefined, ordering: '-created_at' },
      })
    })

    fireEvent.click(screen.getByRole('button', { name: 'PENDING' }))

    await waitFor(() => {
      expect(api.get).toHaveBeenLastCalledWith('/warranty-claims/', {
        params: { status: 'PENDING', ordering: '-created_at' },
      })
    })
  })

  it('updates a pending claim to under review with notes', async () => {
    render(
      <TestWrapper>
        <WarrantyClaimsPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Start Review' })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Start Review' }))
    fireEvent.change(screen.getByLabelText('Notes (optional)'), {
      target: { value: 'Starting technical inspection.' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Confirm UNDER_REVIEW' }))

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith('/warranty-claims/1/', {
        status: 'UNDER_REVIEW',
        resolution: 'Starting technical inspection.',
      })
    })
  })
})
