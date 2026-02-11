import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useToastStore } from './toastStore'

describe('toastStore', () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] })
    vi.clearAllTimers()
  })

  it('initializes with empty toasts array', () => {
    const state = useToastStore.getState()
    expect(state.toasts).toEqual([])
  })

  it('adds a toast', () => {
    const toast = {
      type: 'success',
      title: 'Test Toast',
      message: 'This is a test',
    }

    useToastStore.getState().addToast(toast)

    const state = useToastStore.getState()
    expect(state.toasts).toHaveLength(1)
    expect(state.toasts[0]).toMatchObject(toast)
    expect(state.toasts[0].id).toBeDefined()
  })

  it('adds multiple toasts', () => {
    useToastStore.getState().addToast({ type: 'success', title: 'Toast 1' })
    useToastStore.getState().addToast({ type: 'error', title: 'Toast 2' })

    const state = useToastStore.getState()
    expect(state.toasts).toHaveLength(2)
  })

  it('removes a toast by id', () => {
    useToastStore.getState().addToast({ type: 'success', title: 'Toast 1' })
    const state = useToastStore.getState()
    const toastId = state.toasts[0].id

    useToastStore.getState().removeToast(toastId)

    const newState = useToastStore.getState()
    expect(newState.toasts).toHaveLength(0)
  })

  it('auto-removes toast after default duration', () => {
    vi.useFakeTimers()

    useToastStore.getState().addToast({
      type: 'success',
      title: 'Auto Remove',
    })

    expect(useToastStore.getState().toasts).toHaveLength(1)

    vi.advanceTimersByTime(5000)

    expect(useToastStore.getState().toasts).toHaveLength(0)

    vi.useRealTimers()
  })

  it('auto-removes toast after custom duration', () => {
    vi.useFakeTimers()

    useToastStore.getState().addToast({
      type: 'success',
      title: 'Custom Duration',
      duration: 2000,
    })

    vi.advanceTimersByTime(1999)
    expect(useToastStore.getState().toasts).toHaveLength(1)

    vi.advanceTimersByTime(1)
    expect(useToastStore.getState().toasts).toHaveLength(0)

    vi.useRealTimers()
  })
})
