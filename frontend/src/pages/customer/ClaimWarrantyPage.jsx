import { useState } from 'react'
import { warrantyAPI } from '../../services/api'

export default function ClaimWarrantyPage() {
  const [form, setForm] = useState({
    serial_number: '',
    consumer_email: '',
    consumer_phone: '',
    consumer_first_name: '',
    consumer_last_name: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      setLoading(true)
      setError('')
      setSuccess('')
      await warrantyAPI.claimWarranty(form)
      setSuccess('Warranty claimed successfully.')
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || 'Unable to claim warranty.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold neon-title">Claim Warranty</h1>
        <p className="text-[color:var(--muted)]">Activate a warranty using serial or QR code.</p>
      </div>

      <form onSubmit={handleSubmit} className="panel-card p-6 space-y-4">
        <div>
          <label htmlFor="claim-serial" className="field-label">Serial Number</label>
          <input
            id="claim-serial"
            className="neon-input"
            value={form.serial_number}
            onChange={(event) => updateField('serial_number', event.target.value)}
            placeholder="LV000000"
            required
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="claim-first-name" className="field-label">First Name</label>
            <input
              id="claim-first-name"
              className="neon-input"
              value={form.consumer_first_name}
              onChange={(event) => updateField('consumer_first_name', event.target.value)}
            />
          </div>
          <div>
            <label htmlFor="claim-last-name" className="field-label">Last Name</label>
            <input
              id="claim-last-name"
              className="neon-input"
              value={form.consumer_last_name}
              onChange={(event) => updateField('consumer_last_name', event.target.value)}
            />
          </div>
        </div>
        <div>
          <label htmlFor="claim-email" className="field-label">Email</label>
          <input
            id="claim-email"
            className="neon-input"
            type="email"
            value={form.consumer_email}
            onChange={(event) => updateField('consumer_email', event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="claim-phone" className="field-label">Phone</label>
          <input
            id="claim-phone"
            className="neon-input"
            value={form.consumer_phone}
            onChange={(event) => updateField('consumer_phone', event.target.value)}
          />
        </div>
        {error ? <p className="text-[color:var(--danger)]">{error}</p> : null}
        {success ? <p className="text-[color:var(--accent)]">{success}</p> : null}
        <button type="submit" className="neon-btn" disabled={loading}>
          {loading ? 'Submitting...' : 'Claim Warranty'}
        </button>
      </form>
    </div>
  )
}
