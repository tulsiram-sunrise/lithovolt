import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { authAPI } from '../../services/api'
import { useAuthStore } from '../../store/authStore'

function resolvePanelBasePath(pathname) {
  if (pathname.startsWith('/admin')) {
    return '/admin'
  }

  if (pathname.startsWith('/wholesaler')) {
    return '/wholesaler'
  }

  return '/customer'
}

export default function EditProfilePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const basePath = resolvePanelBasePath(location.pathname)
  const authUser = useAuthStore((state) => state.user)
  const updateUser = useAuthStore((state) => state.updateUser)

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const hydrate = async () => {
      try {
        const response = await authAPI.profile()
        const user = response.data
        setForm({
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          phone: user.phone || '',
          address: user.address || '',
          city: user.city || '',
          state: user.state || '',
          postal_code: user.postal_code || '',
        })
      } catch {
        setForm({
          first_name: authUser?.first_name || '',
          last_name: authUser?.last_name || '',
          phone: authUser?.phone || '',
          address: authUser?.address || '',
          city: authUser?.city || '',
          state: authUser?.state || '',
          postal_code: authUser?.postal_code || '',
        })
      }
    }

    hydrate()
  }, [authUser])

  const onChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await authAPI.updateProfile(form)
      updateUser(response.data.user)
      setSuccess('Profile updated successfully.')
      setTimeout(() => navigate(`${basePath}/profile`), 700)
    } catch (err) {
      const details = err.response?.data?.details
      if (details && typeof details === 'object') {
        const firstError = Object.values(details)[0]
        if (Array.isArray(firstError) && firstError.length > 0) {
          setError(firstError[0])
        } else {
          setError('Unable to update profile.')
        }
      } else {
        setError(err.response?.data?.error || 'Unable to update profile.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold neon-title">Edit Profile</h1>
        <p className="text-[color:var(--muted)]">Update your personal and contact details.</p>
      </div>

      <form onSubmit={onSubmit} className="panel-card p-6 space-y-4 max-w-3xl">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="field-label">First Name</label>
            <input className="neon-input" name="first_name" value={form.first_name} onChange={onChange} />
          </div>
          <div>
            <label className="field-label">Last Name</label>
            <input className="neon-input" name="last_name" value={form.last_name} onChange={onChange} />
          </div>
        </div>

        <div>
          <label className="field-label">Phone</label>
          <input className="neon-input" name="phone" value={form.phone} onChange={onChange} />
        </div>

        <div>
          <label className="field-label">Address</label>
          <textarea className="neon-input" name="address" value={form.address} onChange={onChange} rows="3" />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="field-label">City</label>
            <input className="neon-input" name="city" placeholder="City" value={form.city} onChange={onChange} />
          </div>
          <div>
            <label className="field-label">State</label>
            <input className="neon-input" name="state" placeholder="State" value={form.state} onChange={onChange} />
          </div>
          <div>
            <label className="field-label">Postal Code</label>
            <input className="neon-input" name="postal_code" placeholder="Postal Code" value={form.postal_code} onChange={onChange} />
          </div>
        </div>

        {error ? <p className="text-[color:var(--danger)]">{error}</p> : null}
        {success ? <p className="text-[color:var(--accent)]">{success}</p> : null}

        <div className="flex gap-3">
          <button className="neon-btn" type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
          <button className="neon-btn-secondary" type="button" onClick={() => navigate(`${basePath}/profile`)}>Cancel</button>
        </div>
      </form>
    </div>
  )
}
