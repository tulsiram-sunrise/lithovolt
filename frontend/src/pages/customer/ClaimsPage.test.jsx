import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { TestWrapper } from '../../test/helpers'
import ClaimsPage from './ClaimsPage'
import * as api from '../../services/api'

vi.mock('../../services/api')

describe('Customer ClaimsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders claims table rows', async () => {
    api.warrantyAPI.getWarrantyClaims = vi.fn(() => Promise.resolve({
      data: {
        results: [
          {
            id: 11,
            claim_number: 'CLM-00011',
            status: 'UNDER_REVIEW',
            warranty_number: 'WAR-2026-11',
            created_at: '2026-03-28T00:00:00Z',
            review_notes: 'Assigned to support',
          },
        ],
      },
    }))

    render(
      <TestWrapper>
        <ClaimsPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('My Claims')).toBeInTheDocument()
      expect(screen.getByText('CLM-00011')).toBeInTheDocument()
      expect(screen.getByText('UNDER_REVIEW')).toBeInTheDocument()
      expect(screen.getByText('WAR-2026-11')).toBeInTheDocument()
      expect(screen.getByText('Assigned to support')).toBeInTheDocument()
    })
  })

  it('shows empty state when no claims exist', async () => {
    api.warrantyAPI.getWarrantyClaims = vi.fn(() => Promise.resolve({
      data: { results: [] },
    }))

    render(
      <TestWrapper>
        <ClaimsPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('No claims submitted yet.')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Submit a Claim' })).toHaveAttribute('href', '/customer/claim')
    })
  })

  it('shows API error message when loading fails', async () => {
    api.warrantyAPI.getWarrantyClaims = vi.fn(() => Promise.reject({
      response: {
        data: {
          message: 'Claim API unavailable',
        },
      },
    }))

    render(
      <TestWrapper>
        <ClaimsPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Claim API unavailable')).toBeInTheDocument()
    })
  })
})
