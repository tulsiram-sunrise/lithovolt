import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PaginationControls from './PaginationControls'

describe('PaginationControls (unit)', () => {
  it('renders page summary and current/total page text', () => {
    render(
      <PaginationControls
        currentPage={2}
        lastPage={5}
        total={42}
        pageSize={10}
      />
    )

    expect(screen.getByText('Showing 11-20 of 42')).toBeInTheDocument()
    expect(screen.getByText('Page 2 of 5')).toBeInTheDocument()
  })

  it('calls onPageChange for first/prev/next/last and page numbers', () => {
    const onPageChange = vi.fn()

    render(
      <PaginationControls
        currentPage={3}
        lastPage={6}
        total={60}
        pageSize={10}
        onPageChange={onPageChange}
      />
    )

    fireEvent.click(screen.getByTitle('First page'))
    fireEvent.click(screen.getByTitle('Previous page'))
    fireEvent.click(screen.getByRole('button', { name: '4' }))
    fireEvent.click(screen.getByTitle('Next page'))
    fireEvent.click(screen.getByTitle('Last page'))

    expect(onPageChange).toHaveBeenCalledWith(1)
    expect(onPageChange).toHaveBeenCalledWith(2)
    expect(onPageChange).toHaveBeenCalledWith(4)
    expect(onPageChange).toHaveBeenCalledWith(6)
  })

  it('shows ellipsis and edge page buttons for larger page sets', () => {
    render(
      <PaginationControls
        currentPage={5}
        lastPage={10}
        total={100}
        pageSize={10}
      />
    )

    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '10' })).toBeInTheDocument()
    expect(screen.getAllByText('...').length).toBeGreaterThan(0)
  })

  it('disables navigation on first page', () => {
    render(
      <PaginationControls
        currentPage={1}
        lastPage={3}
        total={30}
        pageSize={10}
      />
    )

    expect(screen.getByTitle('First page')).toBeDisabled()
    expect(screen.getByTitle('Previous page')).toBeDisabled()
  })
})
