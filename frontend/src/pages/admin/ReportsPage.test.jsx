import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TestWrapper } from '../../test/helpers'
import ReportsPage from './ReportsPage'
import * as api from '../../services/api'
import { useToastStore } from '../../store/toastStore'

vi.mock('../../services/api')

describe('Admin ReportsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useToastStore.setState({ toasts: [] })

    window.URL.createObjectURL = vi.fn(() => 'blob:mock')
    window.URL.revokeObjectURL = vi.fn()
    HTMLAnchorElement.prototype.click = vi.fn()

    api.adminAPI.exportData = vi.fn(() => Promise.resolve({ data: [{ id: 1 }] }))
  })

  it('renders report sections with data', async () => {
    render(
      <TestWrapper>
        <ReportsPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Admin Reports')).toBeInTheDocument()
      expect(screen.getByText('Report Directory')).toBeInTheDocument()
      expect(screen.getByText('Order Operations Report')).toBeInTheDocument()
      expect(screen.getByText('Activity Audit Report')).toBeInTheDocument()
    })
  })

  it('triggers orders report export', async () => {
    render(
      <TestWrapper>
        <ReportsPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('Export Orders')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Export Orders'))

    await waitFor(() => {
      expect(api.adminAPI.exportData).toHaveBeenCalledWith('orders')
    })
  })
})
