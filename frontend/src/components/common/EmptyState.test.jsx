import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import EmptyState, { LoadingState } from './EmptyState'

describe('EmptyState', () => {
  it('renders with default message', () => {
    render(<EmptyState />)
    expect(screen.getByText('No data available.')).toBeInTheDocument()
  })

  it('renders with custom message', () => {
    render(<EmptyState message="No items found" />)
    expect(screen.getByText('No items found')).toBeInTheDocument()
  })

  it('renders icon when provided', () => {
    const icon = <span data-testid="custom-icon">📦</span>
    render(<EmptyState icon={icon} />)
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
  })

  it('renders action button when provided', () => {
    const action = <button>Add Item</button>
    render(<EmptyState action={action} />)
    expect(screen.getByText('Add Item')).toBeInTheDocument()
  })
})

describe('LoadingState', () => {
  it('renders with default message', () => {
    render(<LoadingState />)
    expect(screen.getAllByText('Loading...').length).toBeGreaterThan(0)
  })

  it('renders with custom message', () => {
    render(<LoadingState message="Loading data..." />)
    expect(screen.getByText('Loading data...')).toBeInTheDocument()
  })

  it('renders loading spinner', () => {
    render(<LoadingState />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})
