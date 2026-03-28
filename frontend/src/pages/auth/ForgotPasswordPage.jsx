import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../../services/api'
import { extractApiErrorMessage } from '../../services/apiError'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isRequesting, setIsRequesting] = useState(false)

  const handleRequestReset = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setIsRequesting(true)

    try {
      const response = await authAPI.passwordResetRequest({ email })
      const token = response.data?.reset_token || ''
      setMessage('Reset token generated. Continue to the reset page to set a new password.')
      if (token) {
        navigate(`/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`)
      }
    } catch (err) {
      setError(extractApiErrorMessage(err, 'Unable to request password reset.'))
    } finally {
      setIsRequesting(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h2 className="text-3xl font-semibold neon-title">Forgot Password</h2>
        <p className="mt-2 text-[color:var(--muted)]">Enter your email to request a reset token.</p>

        <form className="mt-8 space-y-4" onSubmit={handleRequestReset}>
          <div>
            <label htmlFor="reset-email" className="field-label">Email</label>
            <input
              id="reset-email"
              type="email"
              className="neon-input"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="neon-btn w-full" disabled={isRequesting}>
            {isRequesting ? 'Requesting...' : 'Request Reset Token'}
          </button>
        </form>

        {message ? <p className="mt-4 text-sm text-[color:var(--accent)]">{message}</p> : null}
        {error ? <p className="mt-4 text-sm text-[color:var(--danger)]">{error}</p> : null}

        <div className="mt-6">
          <Link to="/reset-password" className="text-sm text-[color:var(--accent)] hover:underline">
            I already have a reset token
          </Link>
        </div>

        <div className="mt-6 text-sm text-[color:var(--muted)]">
          <Link to="/login" className="text-[color:var(--accent)] hover:underline">Back to Sign In</Link>
        </div>
      </div>

      <div className="panel-card panel-card-strong p-8 flex flex-col justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-[color:var(--muted)]">Account Recovery</p>
          <h3 className="mt-4 text-4xl neon-title">Secure Reset Flow</h3>
          <p className="mt-4 text-[color:var(--muted)]">
            Request a token in step one, then move to the reset screen to update credentials.
          </p>
        </div>
        <div className="grid gap-3 text-sm text-[color:var(--muted)]">
          <span>• Email-based reset token</span>
          <span>• Dedicated reset confirmation screen</span>
          <span>• Immediate sign-in after password change</span>
        </div>
      </div>
    </div>
  )
}
