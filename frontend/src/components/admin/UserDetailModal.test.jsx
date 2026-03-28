import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import UserDetailModal from './UserDetailModal'

describe('UserDetailModal (unit)', () => {
  it('renders address fields for any user, even without wholesaler business data', () => {
    const onClose = vi.fn()

    render(
      <UserDetailModal
        isOpen
        onClose={onClose}
        user={{
          id: 10,
          first_name: 'Nora',
          last_name: 'Miles',
          email: 'nora@example.com',
          phone: '9876543210',
          role: { name: 'CONSUMER' },
          is_active: true,
          address: '221B Baker Street',
          city: 'London',
          state: 'Greater London',
          postal_code: 'NW1',
        }}
      />
    )

    expect(screen.getByText('Address')).toBeInTheDocument()
    expect(screen.getByText('221B Baker Street')).toBeInTheDocument()
    expect(screen.getByText('City')).toBeInTheDocument()
    expect(screen.getByText('London')).toBeInTheDocument()
    expect(screen.getByText('State/Province')).toBeInTheDocument()
    expect(screen.getByText('Greater London')).toBeInTheDocument()
    expect(screen.getByText('Postal Code')).toBeInTheDocument()
    expect(screen.getByText('NW1')).toBeInTheDocument()
  })

  it('renders business fields only when business data exists', () => {
    render(
      <UserDetailModal
        isOpen
        onClose={() => {}}
        user={{
          first_name: 'Alex',
          last_name: 'Vendor',
          email: 'alex@vendor.com',
          role: { name: 'WHOLESALER' },
          business_name: 'Vendor Corp',
          registration_number: 'REG-777',
        }}
      />
    )

    expect(screen.getByText('Business Name')).toBeInTheDocument()
    expect(screen.getByText('Vendor Corp')).toBeInTheDocument()
    expect(screen.getByText('Registration No.')).toBeInTheDocument()
    expect(screen.getByText('REG-777')).toBeInTheDocument()
  })

  it('supports object-based role data and closes via close button', () => {
    const onClose = vi.fn()

    render(
      <UserDetailModal
        isOpen
        onClose={onClose}
        user={{
          first_name: 'Ira',
          last_name: 'Stone',
          role: { name: 'ADMIN' },
          email: 'ira@example.com',
        }}
      />
    )

    expect(screen.getByText('ADMIN')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
