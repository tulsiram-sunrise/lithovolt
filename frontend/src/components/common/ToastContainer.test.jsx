import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import ToastContainer from './ToastContainer'
import { useToastStore } from '../../store/toastStore'

describe('ToastContainer', () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] })
  })

  it('renders nothing when no toasts', () => {
    const { container } = render(<ToastContainer />)
    expect(container.firstChild).toBeNull()
  })

  it('renders success toast', () => {
    act(() => {
      useToastStore.getState().addToast({
        type: 'success',
        title: 'Success',
        message: 'Operation completed',
      })
    })

    render(<ToastContainer />)
    expect(screen.getByText('Success')).toBeInTheDocument()
    expect(screen.getByText('Operation completed')).toBeInTheDocument()
  })

  it('renders error toast', () => {
    act(() => {
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Error',
        message: 'Operation failed',
      })
    })

    render(<ToastContainer />)
    expect(screen.getByText('Error')).toBeInTheDocument()
    expect(screen.getByText('Operation failed')).toBeInTheDocument()
  })

  it('removes toast when close button is clicked', () => {
    act(() => {
      useToastStore.getState().addToast({
        type: 'success',
        title: 'Test Toast',
      })
    })

    render(<ToastContainer />)
    expect(screen.getByText('Test Toast')).toBeInTheDocument()

    const closeButton = screen.getAllByRole('button')[0]
    fireEvent.click(closeButton)

    expect(screen.queryByText('Test Toast')).not.toBeInTheDocument()
  })

  it('auto-removes toast after duration', async () => {
    vi.useFakeTimers()

    act(() => {
      useToastStore.getState().addToast({
        type: 'success',
        title: 'Auto Remove',
        duration: 1000,
      })
    })

    render(<ToastContainer />)
    expect(screen.getByText('Auto Remove')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    await waitFor(() => {
      expect(screen.queryByText('Auto Remove')).not.toBeInTheDocument()
    })

    vi.useRealTimers()
  })

  it('renders multiple toasts', () => {
    act(() => {
      useToastStore.getState().addToast({
        type: 'success',
        title: 'Toast 1',
      })
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Toast 2',
      })
    })

    render(<ToastContainer />)
    expect(screen.getByText('Toast 1')).toBeInTheDocument()
    expect(screen.getByText('Toast 2')).toBeInTheDocument()
  })
})
