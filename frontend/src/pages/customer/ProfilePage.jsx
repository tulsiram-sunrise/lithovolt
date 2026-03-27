import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { authAPI } from '../../services/api'
import { useAuthStore } from '../../store/authStore'

function resolvePanelBasePath(role) {
  if (role === 'ADMIN') {
    return '/admin'
  }

  if (role === 'WHOLESALER') {
    return '/wholesaler'
  }

  return '/customer'
}

export default function CustomerProfilePage() {
  const authUser = useAuthStore((state) => state.user)
  const basePath = resolvePanelBasePath(authUser?.role)
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    role: '',
    is_verified: false,
  })
  const [error, setError] = useState('')

  useEffect(() => {
    const hydrate = async () => {
      try {
        const response = await authAPI.profile()
        const user = response.data
        setProfile({
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          email: user.email || '',
          phone: user.phone || '',
          address: user.address || '',
          city: user.city || '',
          state: user.state || '',
          postal_code: user.postal_code || '',
          role: user.role || '',
          is_verified: !!user.is_verified,
        })
      } catch {
        setProfile({
          first_name: authUser?.first_name || '',
          last_name: authUser?.last_name || '',
          email: authUser?.email || '',
          phone: authUser?.phone || '',
          address: authUser?.address || '',
          city: authUser?.city || '',
          state: authUser?.state || '',
          postal_code: authUser?.postal_code || '',
          role: authUser?.role || '',
          is_verified: !!authUser?.is_verified,
        })
        setError('Unable to load latest profile details. Showing saved session data.')
      }
    }

    hydrate()
  }, [authUser])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold neon-title">My Profile</h1>
        <p className="text-[color:var(--muted)]">View your account details and manage account settings.</p>
      </div>

      <div className="panel-card p-6">
        {error ? <p className="mb-4 text-[color:var(--warning)]">{error}</p> : null}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="field-label">First Name</p>
            <p>{profile.first_name || '-'}</p>
          </div>
          <div>
            <p className="field-label">Last Name</p>
            <p>{profile.last_name || '-'}</p>
          </div>
          <div>
            <p className="field-label">Email</p>
            <p>{profile.email || '-'}</p>
          </div>
          <div>
            <p className="field-label">Phone</p>
            <p>{profile.phone || '-'}</p>
          </div>
          <div>
            <p className="field-label">Role</p>
            <p>{profile.role || '-'}</p>
          </div>
          <div>
            <p className="field-label">Verification</p>
            <p>{profile.is_verified ? 'Verified' : 'Not Verified'}</p>
          </div>
        </div>

        {(profile.address || profile.city || profile.state || profile.postal_code) ? (
          <div className="mt-6 border-t border-[color:var(--border)] pt-6">
            <h3 className="text-lg font-semibold mb-4">Address</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <p className="field-label">Address</p>
                <p className="whitespace-pre-wrap">{profile.address || '-'}</p>
              </div>
              <div>
                <p className="field-label">City</p>
                <p>{profile.city || '-'}</p>
              </div>
              <div>
                <p className="field-label">State</p>
                <p>{profile.state || '-'}</p>
              </div>
              <div>
                <p className="field-label">Postal Code</p>
                <p>{profile.postal_code || '-'}</p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <Link to={`${basePath}/profile/edit`} className="neon-btn">Edit Profile</Link>
          <Link to={`${basePath}/profile/change-password`} className="neon-btn-secondary">Change Password</Link>
          {(authUser?.role === 'CONSUMER' || authUser?.role === 'RETAILER') ? (
            <Link
              to="/customer/wholesaler-register"
              className="inline-flex items-center gap-2 rounded-lg border border-[color:var(--accent)] bg-[color:var(--accent)]/15 px-4 py-2 font-semibold text-[color:var(--accent)] shadow-[0_0_18px_rgba(102,255,190,0.35)] transition hover:-translate-y-0.5 hover:bg-[color:var(--accent)]/25"
            >
              <span aria-hidden="true">★</span>
              <span>Become Wholesaler</span>
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  )
}
