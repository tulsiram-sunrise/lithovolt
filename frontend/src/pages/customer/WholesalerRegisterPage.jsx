import { useEffect, useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { userAPI } from '../../services/api'
import { extractApiErrorMessage } from '../../services/apiError'

export default function WholesalerRegisterPage() {
  const authUser = useAuthStore((state) => state.user)

  const [form, setForm] = useState({
    business_name: '',
    registration_number: '',
  })
  const [application, setApplication] = useState(null)
  const [status, setStatus] = useState('')
  const [initialLoading, setInitialLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const loadApplication = async () => {
    try {
      const response = await userAPI.getWholesalerApplications({ ordering: '-created_at' })
      const list = Array.isArray(response.data) ? response.data : response.data?.results || []
      const latest = list[0] || null

      if (latest) {
        setApplication(latest)
        setStatus(latest.status || '')
        setForm((prev) => ({
          ...prev,
          business_name: latest.business_name || '',
          registration_number: latest.registration_number || '',
        }))
      } else {
        setApplication(null)
        setStatus('')
      }
    } catch (err) {
      setApplication(null)
      setStatus('')
    }
  }

  useEffect(() => {
    let isMounted = true

    const bootstrap = async () => {
      setInitialLoading(true)
      await loadApplication()
      if (isMounted) {
        setInitialLoading(false)
      }
    }

    bootstrap()

    return () => {
      isMounted = false
    }
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
      await loadApplication()
    } catch (err) {
      setError(extractApiErrorMessage(err, 'Unable to submit application.'))
    } finally {
      setLoading(false)
    }
  }

  const getStatusTone = () => {
    if (status === 'approved') {
      return 'text-[color:var(--accent)]'
    }
    if (status === 'rejected') {
      return 'text-[color:var(--danger)]'
    }
    return 'text-[color:var(--warning)]'
  }

  const hasApplication = !!application
  const normalizedStatus = status || (hasApplication ? 'pending' : '')
  const isRejected = normalizedStatus === 'rejected'
  const readOnly = hasApplication && !isRejected

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold neon-title">Wholesaler Signup</h1>
        <p className="text-[color:var(--muted)]">Apply for wholesale access.</p>
      </div>

      {initialLoading ? (
        <div className="panel-card p-6 space-y-4 animate-pulse" aria-hidden="true">
          <div className="h-5 w-56 rounded bg-white/10" />
          <div className="space-y-2">
            <div className="h-3 w-28 rounded bg-white/10" />
            <div className="h-10 w-full rounded bg-white/10" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-40 rounded bg-white/10" />
            <div className="h-10 w-full rounded bg-white/10" />
          </div>
          <div className="border-t border-[color:var(--border)] pt-4 mt-4 space-y-3">
            <div className="h-3 w-72 rounded bg-white/10" />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="h-14 rounded bg-white/10" />
              <div className="h-14 rounded bg-white/10" />
            </div>
          </div>
          <div className="h-10 w-48 rounded bg-white/10" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="panel-card p-6 space-y-4">
        {hasApplication ? (
          <div className="rounded-lg border border-[color:var(--border)] bg-white/5 p-3">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-[color:var(--muted)]">
                {isRejected
                  ? 'Your previous request was rejected. Update details and resubmit.'
                  : 'Your application is submitted. You can track status below.'}
              </p>
              <p className={`font-semibold uppercase tracking-wide ${getStatusTone()}`}>
                Status: {normalizedStatus}
              </p>
            </div>
          </div>
        ) : null}

        <div>
          <label className="field-label">Business Name</label>
          <input
            className="neon-input"
            required
            value={form.business_name}
            onChange={(event) => updateField('business_name', event.target.value)}
            disabled={readOnly}
          />
        </div>
        <div>
          <label className="field-label">Registration Number</label>
          <input
            className="neon-input"
            required
            value={form.registration_number}
            onChange={(event) => updateField('registration_number', event.target.value)}
            disabled={readOnly}
          />
        </div>

        <div className="border-t border-[color:var(--border)] pt-4 mt-4">
          <p className="text-sm text-[color:var(--muted)] mb-4">We'll use your profile contact information for this application:</p>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="field-label">Contact Email</p>
              <p className="text-white">{authUser?.email || '-'}</p>
            </div>
            <div>
              <p className="field-label">Contact Phone</p>
              <p className="text-white">{authUser?.phone || '-'}</p>
            </div>
          </div>
        </div>

        {error ? <p className="text-[color:var(--danger)]">{error}</p> : null}
        {success ? <p className="text-[color:var(--accent)]">{success}</p> : null}

        {readOnly ? (
          <button type="button" className="neon-btn-secondary" disabled>
            Application Submitted
          </button>
        ) : (
          <button type="submit" className="neon-btn" disabled={loading}>
            {loading ? 'Submitting...' : hasApplication && isRejected ? 'Resubmit Application' : 'Submit Application'}
          </button>
        )}
        </form>
      )}
    </div>
  )
}
