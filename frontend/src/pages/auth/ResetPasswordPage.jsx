import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { authAPI } from '../../services/api'
import { extractApiErrorMessage } from '../../services/apiError'
import PasswordInput from '../../components/common/PasswordInput'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const [resetToken, setResetToken] = useState(searchParams.get('token') || '')
  const [email] = useState(searchParams.get('email') || '')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    try {
      await authAPI.passwordResetConfirm({
        reset_token: resetToken,
        password: newPassword,
      })
      setMessage('Password updated successfully. You can now sign in with your new password.')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(extractApiErrorMessage(err, 'Unable to reset password. Please verify the token and try again.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h2 className="text-3xl font-semibold neon-title">Reset Password</h2>
        <p className="mt-2 text-[color:var(--muted)]">Enter your token and choose a new password.</p>

        {email ? <p className="mt-4 text-sm text-[color:var(--muted)]">Resetting account: {email}</p> : null}

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="reset-token" className="field-label">Reset Token</label>
            <input
              id="reset-token"
              type="text"
              className="neon-input"
              placeholder="Paste reset token"
              value={resetToken}
              onChange={(e) => setResetToken(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="new-password" className="field-label">New Password</label>
            <PasswordInput
              id="new-password"
              className="neon-input"
              placeholder="Minimum 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <div>
            <label htmlFor="confirm-password" className="field-label">Confirm Password</label>
            <input
              id="confirm-password"
              type="password"
              className="neon-input"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <button type="submit" className="neon-btn-secondary w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Updating...' : 'Set New Password'}
          </button>
        </form>

        {message ? <p className="mt-4 text-sm text-[color:var(--accent)]">{message}</p> : null}
        {error ? <p className="mt-4 text-sm text-[color:var(--danger)]">{error}</p> : null}

        <div className="mt-6 text-sm text-[color:var(--muted)]">
          <Link to="/login" className="text-[color:var(--accent)] hover:underline">Back to Sign In</Link>
        </div>
      </div>

      <div className="panel-card panel-card-strong p-8 flex flex-col justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-[color:var(--muted)]">Step Two</p>
          <h3 className="mt-4 text-4xl neon-title">Confirm And Rotate</h3>
          <p className="mt-4 text-[color:var(--muted)]">
            Paste the reset token and set a new password to recover access securely.
          </p>
        </div>
        <div className="grid gap-3 text-sm text-[color:var(--muted)]">
          <span>• Token verification required</span>
          <span>• Password confirmation built-in</span>
          <span>• Ready for immediate login</span>
        </div>
      </div>
    </div>
  )
}
