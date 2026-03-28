import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Sidebar from '../../components/layout/Sidebar'
import PaginationControls from '../../components/common/PaginationControls'
import UserDetailModal from '../../components/admin/UserDetailModal'

const routerFutureFlags = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
}

describe('Admin today changes (smoke + e2e-style)', () => {
  it('sidebar does not include legacy wholesaler applications menu item', () => {
    render(
      <MemoryRouter
        initialEntries={['/admin/wholesalers']}
        future={routerFutureFlags}
      >
        <Sidebar role="admin" />
      </MemoryRouter>
    )

    expect(screen.getByText('Wholesalers')).toBeInTheDocument()
    expect(screen.queryByText('Wholesaler Applications')).not.toBeInTheDocument()
  })

  it('pagination renders page-number navigation as expected', () => {
    render(
      <PaginationControls
        currentPage={3}
        lastPage={8}
        total={80}
        pageSize={10}
      />
    )

    expect(screen.getByText('Page 3 of 8')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '8' })).toBeInTheDocument()
  })

  it('user details modal shows common user fields and wholesaler business fields when available', () => {
    render(
      <UserDetailModal
        isOpen
        onClose={() => {}}
        user={{
          first_name: 'Nova',
          last_name: 'Stone',
          email: 'nova@example.com',
          phone: '999888777',
          address: '88 Ridgeway',
          city: 'Auckland',
          state: 'Auckland',
          postal_code: '1010',
          business_name: 'Nova Batteries',
          registration_number: 'NZ-REG-101',
          role: { name: 'WHOLESALER' },
          is_active: true,
        }}
      />
    )

    expect(screen.getByText('88 Ridgeway')).toBeInTheDocument()
    expect(screen.getByText('Nova Batteries')).toBeInTheDocument()
    expect(screen.getByText('NZ-REG-101')).toBeInTheDocument()
  })
})
