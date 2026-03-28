import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TestWrapper } from '../../test/helpers'
import WholesalerManagementPage from './WholesalerManagementPage'
import * as api from '../../services/api'

vi.mock('../../services/api')

describe('WholesalerManagementPage (integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    api.userAPI.getUsers = vi.fn((params) => {
      const page = params?.page || 1
      const results = page === 2
        ? [{ id: 200, first_name: 'Page', last_name: 'Two', email: 'two@example.com', is_active: false }]
        : [{
            id: 100,
            first_name: 'Will',
            last_name: 'Prime',
            full_name: 'Will Prime',
            email: 'will@prime.com',
            phone: '1234567890',
            is_active: true,
            address: '14 Market Rd',
            city: 'Sydney',
            state: 'NSW',
            postal_code: '2000',
            role: { name: 'WHOLESALER' },
          }]

      return Promise.resolve({
        data: {
          results,
          current_page: page,
          last_page: 2,
          total: 2,
        },
      })
    })

    api.userAPI.getWholesalerApplications = vi.fn(() =>
      Promise.resolve({
        data: {
          results: [
            {
              id: 501,
              business_name: 'Battery House',
              registration_number: 'REG-501',
              contact_email: 'owner@battery.house',
              status: 'pending',
              address: '20 Dock Lane',
              city: 'Melbourne',
              state: 'VIC',
              postal_code: '3000',
            },
            {
              id: 502,
              business_name: 'Approved Trader',
              registration_number: 'REG-502',
              contact_email: 'ok@trader.com',
              status: 'approved',
            },
          ],
          current_page: 1,
          last_page: 1,
          total: 2,
        },
      })
    )

    api.userAPI.toggleActive = vi.fn(() => Promise.resolve({ data: {} }))
    api.userAPI.approveWholesalerApplication = vi.fn(() => Promise.resolve({ data: {} }))
    api.userAPI.rejectWholesalerApplication = vi.fn(() => Promise.resolve({ data: {} }))
  })

  it('loads approved tab and paginates with page numbers', async () => {
    render(
      <TestWrapper>
        <WholesalerManagementPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Wholesaler Management')).toBeInTheDocument()
      expect(screen.getByText('Will Prime')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: '2' }))

    await waitFor(() => {
      expect(api.userAPI.getUsers).toHaveBeenCalledWith(expect.objectContaining({
        page: 2,
        page_size: 10,
        scope: 'wholesalers',
      }))
      expect(screen.getByText('Page Two')).toBeInTheDocument()
    })
  })

  it('switches to applications tab, opens details, and shows approve/reject for pending only', async () => {
    render(
      <TestWrapper>
        <WholesalerManagementPage />
      </TestWrapper>
    )

    await waitFor(() => expect(screen.getByText('Will Prime')).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: 'Pending Applications' }))

    await waitFor(() => {
      expect(screen.getByText('Battery House')).toBeInTheDocument()
      expect(screen.getByText('Approved Trader')).toBeInTheDocument()
    })

    const approveButtons = screen.getAllByRole('button', { name: 'Approve' })
    const rejectButtons = screen.getAllByRole('button', { name: 'Reject' })
    expect(approveButtons).toHaveLength(1)
    expect(rejectButtons).toHaveLength(1)

    fireEvent.click(screen.getAllByRole('button', { name: 'View' })[0])

    await waitFor(() => {
      expect(screen.getByText('20 Dock Lane')).toBeInTheDocument()
      expect(screen.getByText('Melbourne')).toBeInTheDocument()
    })
  })
})
