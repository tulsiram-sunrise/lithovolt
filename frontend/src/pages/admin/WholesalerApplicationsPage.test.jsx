import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { TestWrapper } from '../../test/helpers'
import WholesalerApplicationsPage from './WholesalerApplicationsPage'
import * as api from '../../services/api'

vi.mock('../../services/api')

describe('WholesalerApplicationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows approve/reject only for pending applications', async () => {
    api.userAPI.getWholesalerApplications = vi.fn(() =>
      Promise.resolve({
        data: [
          {
            id: 1,
            business_name: 'Pending Co',
            registration_number: 'REG-1',
            contact_email: 'pending@example.com',
            status: 'pending',
          },
          {
            id: 2,
            business_name: 'Approved Co',
            registration_number: 'REG-2',
            contact_email: 'approved@example.com',
            status: 'approved',
          },
        ],
      })
    )

    api.userAPI.approveWholesalerApplication = vi.fn(() => Promise.resolve({ data: {} }))
    api.userAPI.rejectWholesalerApplication = vi.fn(() => Promise.resolve({ data: {} }))

    render(
      <TestWrapper>
        <WholesalerApplicationsPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Wholesaler Applications')).toBeInTheDocument()
      expect(screen.getByText('Pending Co')).toBeInTheDocument()
      expect(screen.getByText('Approved Co')).toBeInTheDocument()
    })

    expect(screen.getAllByText('Approve')).toHaveLength(1)
    expect(screen.getAllByText('Reject')).toHaveLength(1)
    expect(screen.getByText('No action required')).toBeInTheDocument()
  })
})
