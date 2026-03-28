import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import { useAuthStore } from './store/authStore'

const routerFutureFlags = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
}

function renderApp(path) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]} future={routerFutureFlags}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('ProtectedRoute behavior', () => {
  beforeEach(() => {
    useAuthStore.getState().logout()
  })

  it('redirects unauthenticated users to login', async () => {
    renderApp('/admin')

    expect(await screen.findByRole('heading', { name: /sign in/i })).toBeInTheDocument()
  })

  it('redirects authenticated users without role access to unauthorized page', async () => {
    useAuthStore.getState().setAuth(
      {
        id: 2,
        email: 'wholesaler@example.com',
        role: 'WHOLESALER',
      },
      'test-token'
    )

    renderApp('/admin')

    expect(await screen.findByRole('heading', { name: /access denied/i })).toBeInTheDocument()
  })
})
