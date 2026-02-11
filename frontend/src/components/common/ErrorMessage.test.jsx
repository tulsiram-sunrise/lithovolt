import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ErrorMessage from './ErrorMessage'

describe('ErrorMessage', () => {
  it('renders with default message when no message provided', () => {
    render(<ErrorMessage />)
    expect(screen.getByText('Error')).toBeInTheDocument()
    expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument()
  })

  it('renders with custom message', () => {
    render(<ErrorMessage message="Custom error message" />)
    expect(screen.getByText('Custom error message')).toBeInTheDocument()
  })

  it('does not render retry button when onRetry is not provided', () => {
    render(<ErrorMessage message="Test error" />)
    expect(screen.queryByText('Try Again')).not.toBeInTheDocument()
  })

  it('renders retry button when onRetry is provided', () => {
    const onRetry = vi.fn()
    render(<ErrorMessage message="Test error" onRetry={onRetry} />)
    expect(screen.getByText('Try Again')).toBeInTheDocument()
  })

  it('calls onRetry when retry button is clicked', () => {
    const onRetry = vi.fn()
    render(<ErrorMessage message="Test error" onRetry={onRetry} />)
    
    const retryButton = screen.getByText('Try Again')
    fireEvent.click(retryButton)
    
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('displays error icon', () => {
    const { container } = render(<ErrorMessage message="Test error" />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })
})
