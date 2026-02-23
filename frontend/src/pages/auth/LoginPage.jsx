import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../../services/api'
import { useAuthStore } from '../../store/authStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await authAPI.login({ email, password })
      const { access, user } = response.data
      setAuth(user, access)

      if (user?.role === 'ADMIN') {
        navigate('/admin', { replace: true })
      } else if (user?.role === 'WHOLESALER') {
        navigate('/wholesaler', { replace: true })
      } else {
        // For CONSUMER, RETAILER, or any other role
        navigate('/customer', { replace: true })
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.error || 'Unable to sign in. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="flex flex-col justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-[color:var(--muted)]">Lithovolt</p>
          <h1 className="mt-4 text-4xl md:text-5xl neon-title">Powering Every Warranty</h1>
          <p className="mt-4 max-w-md text-[color:var(--muted)]">
            Manage batteries, warranties, and wholesale orders in one neon-bright command center.
          </p>
        </div>
        <div className="panel-card panel-card-strong p-6">
          <p className="text-sm text-[color:var(--muted)]">Live Highlights</p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-[color:var(--muted)]">Orders Today</p>
              <p className="text-2xl font-semibold">248</p>
            </div>
            <div>
              <p className="text-xs text-[color:var(--muted)]">Active Warranties</p>
              <p className="text-2xl font-semibold">4,982</p>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-card">
        <div>
          <h2 className="text-3xl font-semibold neon-title">Sign In</h2>
          <p className="mt-2 text-[color:var(--muted)]">Access your dashboard instantly.</p>
        </div>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="login-email" className="field-label">Email</label>
            <input
              id="login-email"
              type="email"
              className="neon-input"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="login-password" className="field-label">Password</label>
            <input
              id="login-password"
              type="password"
              className="neon-input"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <button type="submit" className="neon-btn w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
          <button type="button" className="neon-btn-secondary w-full">
            Use OTP Login
          </button>
          <div className="flex items-center justify-between text-sm text-[color:var(--muted)]">
            <span>Forgot password?</span>
            <span className="text-[color:var(--accent)]">Create account</span>
          </div>
        </form>
      </div>
    </div>
  )
}
