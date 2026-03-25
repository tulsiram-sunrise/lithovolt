import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../../services/api'
import PasswordInput from '../../components/common/PasswordInput'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  })
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccessMessage('')

    if (formData.password !== formData.password_confirmation) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await authAPI.register(formData)
      setSuccessMessage(response.data?.message || 'Registration successful. Please verify your email before login.')
      setTimeout(() => {
        navigate('/login', { replace: true })
      }, 2000)
    } catch (err) {
      const details = err.response?.data?.details
      if (details && typeof details === 'object') {
        const firstError = Object.values(details)[0]
        if (Array.isArray(firstError) && firstError.length > 0) {
          setError(firstError[0])
        } else {
          setError('Registration failed. Please check your details.')
        }
      } else {
        setError(err.response?.data?.error || 'Registration failed. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-shell">
        <div className="auth-card">
          <h2 className="text-3xl font-semibold neon-title">Create Account</h2>
          <p className="mt-2 text-[color:var(--muted)]">Join Lithovolt to manage orders and warranties.</p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="field-label">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  className="neon-input"
                  placeholder="First name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="field-label">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  className="neon-input"
                  placeholder="Last name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div>
              <label className="field-label">Email</label>
              <input
                type="email"
                name="email"
                className="neon-input"
                placeholder="name@company.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="field-label">Phone</label>
              <input
                type="tel"
                name="phone"
                className="neon-input"
                placeholder="+91 90000 00000"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="field-label">Password</label>
              <PasswordInput
                name="password"
                className="neon-input"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                minLength={8}
                required
              />
            </div>
            <div>
              <label className="field-label">Confirm Password</label>
              <input
                type="password"
                name="password_confirmation"
                className="neon-input"
                placeholder="Re-enter password"
                value={formData.password_confirmation}
                onChange={handleChange}
                minLength={8}
                required
              />
            </div>
            {successMessage ? <p className="text-sm text-[color:var(--success,#4ade80)]">{successMessage}</p> : null}
            {error ? <p className="text-sm text-[color:var(--danger)]">{error}</p> : null}
            <div className="space-y-3 pt-1">
              <button type="submit" className="neon-btn w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </button>
              <Link to="/login" className="neon-btn-secondary block w-full text-center">
                Back to Login
              </Link>
            </div>
          </form>
        </div>

        <div className="panel-card panel-card-strong p-8 flex flex-col justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[color:var(--muted)]">Why Lithovolt</p>
            <h3 className="mt-4 text-4xl neon-title">Wholesale Engineered</h3>
            <p className="mt-4 text-[color:var(--muted)]">
              Track every battery, every warranty, and every business relationship with live status updates.
            </p>
          </div>
          <div className="grid gap-3 text-sm text-[color:var(--muted)]">
            <span>• Instant warranty certificate creation</span>
            <span>• Wholesale order tracking</span>
            <span>• Inventory allocation visibility</span>
          </div>
        </div>
    </div>
  )
}
