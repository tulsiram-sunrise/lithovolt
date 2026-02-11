import { useEffect, useState } from 'react'
import { userAPI } from '../../services/api'

export default function WholesalerRegisterPage() {
  const [form, setForm] = useState({
    business_name: '',
    registration_number: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    contact_phone: '',
    contact_email: '',
  })
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const loadStatus = async () => {
    try {
      const response = await userAPI.getWholesalerApplications({ ordering: '-created_at' })
      const list = Array.isArray(response.data) ? response.data : response.data?.results || []
      setStatus(list[0]?.status || '')
    } catch (err) {
      setStatus('')
    }
  }

  useEffect(() => {
    loadStatus()
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      setLoading(true)
      setError('')
      setSuccess('')
      const payload = new FormData()
      Object.entries(form).forEach(([key, value]) => {
        if (value) {
          payload.append(key, value)
        }
      })
      await userAPI.submitWholesalerApplication(payload)
      setSuccess('Application submitted. We will review it soon.')
      await loadStatus()
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to submit application.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold neon-title">Wholesaler Signup</h1>
        <p className="text-[color:var(--muted)]">Apply for wholesale access.</p>
      </div>

      {status ? <p className="text-[color:var(--muted)]">Current status: {status}</p> : null}

      <form onSubmit={handleSubmit} className="panel-card p-6 space-y-4">
        <div>
          <label className="field-label">Business Name</label>
          <input className="neon-input" value={form.business_name} onChange={(event) => updateField('business_name', event.target.value)} />
        </div>
        <div>
          <label className="field-label">Registration Number</label>
          <input className="neon-input" value={form.registration_number} onChange={(event) => updateField('registration_number', event.target.value)} />
        </div>
        <div>
          <label className="field-label">Address</label>
          <input className="neon-input" value={form.address} onChange={(event) => updateField('address', event.target.value)} />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <input className="neon-input" placeholder="City" value={form.city} onChange={(event) => updateField('city', event.target.value)} />
          <input className="neon-input" placeholder="State" value={form.state} onChange={(event) => updateField('state', event.target.value)} />
          <input className="neon-input" placeholder="Pincode" value={form.pincode} onChange={(event) => updateField('pincode', event.target.value)} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <input className="neon-input" placeholder="Contact Phone" value={form.contact_phone} onChange={(event) => updateField('contact_phone', event.target.value)} />
          <input className="neon-input" placeholder="Contact Email" value={form.contact_email} onChange={(event) => updateField('contact_email', event.target.value)} />
        </div>
        {error ? <p className="text-[color:var(--danger)]">{error}</p> : null}
        {success ? <p className="text-[color:var(--accent)]">{success}</p> : null}
        <button type="submit" className="neon-btn" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
  )
}
