import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from './authStore'

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.getState().logout()
  })

  it('initializes with default state', () => {
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })

  it('sets user and token on login', () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      role: 'ADMIN',
    }
    const mockToken = 'mock-jwt-token'

    useAuthStore.getState().setAuth(mockUser, mockToken)

    const state = useAuthStore.getState()
    expect(state.user).toEqual(mockUser)
    expect(state.token).toBe(mockToken)
    expect(state.isAuthenticated).toBe(true)
  })

  it('clears user and token on logout', () => {
    const mockUser = { id: 1, email: 'test@example.com' }
    useAuthStore.getState().setAuth(mockUser, 'token')

    useAuthStore.getState().logout()

    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })

  it('updates user profile', () => {
    const mockUser = { id: 1, email: 'test@example.com', first_name: 'Test' }
    useAuthStore.getState().setAuth(mockUser, 'token')

    const updatedData = { first_name: 'Updated', last_name: 'User' }
    useAuthStore.getState().updateUser(updatedData)

    const state = useAuthStore.getState()
    expect(state.user.first_name).toBe('Updated')
    expect(state.user.last_name).toBe('User')
    expect(state.user.email).toBe('test@example.com')
  })

  it('persists token to localStorage on login', () => {
    const mockUser = { id: 1, email: 'test@example.com' }
    const mockToken = 'mock-jwt-token'

    useAuthStore.getState().setAuth(mockUser, mockToken)

    const storedData = JSON.parse(localStorage.getItem('auth-storage') || '{}')
    expect(storedData.state.token).toBe(mockToken)
  })

  it('removes token from localStorage on logout', () => {
    useAuthStore.getState().setAuth({ id: 1 }, 'token')
    useAuthStore.getState().logout()

    expect(localStorage.getItem('auth-storage')).toBeNull()
  })
})
