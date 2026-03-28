import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { authAPI } from '../../services/api'
import { extractApiErrorMessage } from '../../services/apiError'
import PasswordInput from '../../components/common/PasswordInput'

function resolvePanelBasePath(pathname) {
  if (pathname.startsWith('/admin')) {
    return '/admin'
  }

  if (pathname.startsWith('/wholesaler')) {
    return '/wholesaler'
  }

  return '/customer'
}

export default function ChangePasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const basePath = resolvePanelBasePath(location.pathname)
  const [form, setForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const onChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (form.new_password !== form.new_password_confirmation) {
      setError('New passwords do not match.')
      setLoading(false)
      return
    }

    try {
      await authAPI.changePassword(form)
      setSuccess('Password changed successfully.')
      setForm({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      })
      setTimeout(() => navigate(`${basePath}/profile`), 700)
    } catch (err) {
      setError(extractApiErrorMessage(err, 'Unable to change password.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold neon-title">Change Password</h1>
        <p className="text-[color:var(--muted)]">Keep your account secure by updating password regularly.</p>
      </div>

      <form onSubmit={onSubmit} className="panel-card panel-card-strong p-6 space-y-4 max-w-3xl">
        <div>
          <label className="field-label">Current Password</label>
          <PasswordInput
            className="neon-input"
            name="current_password"
            value={form.current_password}
            onChange={onChange}
            required
          />
        </div>

        <div>
          <label className="field-label">New Password</label>
          <PasswordInput
            className="neon-input"
            name="new_password"
            value={form.new_password}
            onChange={onChange}
            minLength={8}
            required
          />
        </div>

        <div>
          <label className="field-label">Confirm New Password</label>
          <input
            type="password"
            className="neon-input"
            name="new_password_confirmation"
            value={form.new_password_confirmation}
            onChange={onChange}
            minLength={8}
            required
          />
        </div>

        {error ? <p className="text-[color:var(--danger)]">{error}</p> : null}
        {success ? <p className="text-[color:var(--accent)]">{success}</p> : null}

        <div className="flex gap-3">
          <button className="neon-btn-secondary" type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
          <button className="neon-btn" type="button" onClick={() => navigate(`${basePath}/profile`)}>Cancel</button>
        </div>
      </form>
    </div>
  )
}
