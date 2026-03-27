import React from 'react'

/**
 * Detail Modal for Wholesalers/Consumers
 */
export default function UserDetailModal({ isOpen, user, onClose }) {
  if (!isOpen || !user) return null

  const fullName = user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim()

  const fieldValue = (value) => value || '-'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="panel-card max-h-[90vh] w-full max-w-2xl overflow-y-auto p-6">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold neon-title">{fullName}</h2>
            <p className="mt-1 text-sm text-[color:var(--muted)]">
              {(user.staff_user?.role?.name || user.role?.name) || 'Account'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-2xl text-[color:var(--muted)] hover:text-[color:var(--text)]"
          >
            ✕
          </button>
        </div>

        {/* Status Badge */}
        <div className="mb-6">
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
            user.is_active
              ? 'bg-green-900/30 text-green-400'
              : 'bg-red-900/30 text-red-400'
          }`}>
            {user.is_active ? '● Active' : '● Inactive'}
          </span>
        </div>

        {/* Details Grid */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase text-[color:var(--muted)]">Email</label>
              <p className="mt-1 text-sm">{fieldValue(user.email)}</p>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-[color:var(--muted)]">Phone</label>
              <p className="mt-1 text-sm">{fieldValue(user.phone)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase text-[color:var(--muted)]">First Name</label>
              <p className="mt-1 text-sm">{fieldValue(user.first_name)}</p>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-[color:var(--muted)]">Last Name</label>
              <p className="mt-1 text-sm">{fieldValue(user.last_name)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[color:var(--border)]">
            <div>
              <label className="text-xs font-semibold uppercase text-[color:var(--muted)]">Address</label>
              <p className="mt-1 text-sm">{fieldValue(user.address)}</p>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-[color:var(--muted)]">City</label>
              <p className="mt-1 text-sm">{fieldValue(user.city)}</p>
            </div>
          </div>

          {(user.state || user.postal_code) && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase text-[color:var(--muted)]">State/Province</label>
                <p className="mt-1 text-sm">{fieldValue(user.state)}</p>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-[color:var(--muted)]">Postal Code</label>
                <p className="mt-1 text-sm">{fieldValue(user.postal_code)}</p>
              </div>
            </div>
          )}

          {(user.business_name || user.registration_number) && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[color:var(--border)]">
              <div>
                <label className="text-xs font-semibold uppercase text-[color:var(--muted)]">Business Name</label>
                <p className="mt-1 text-sm">{fieldValue(user.business_name)}</p>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-[color:var(--muted)]">Registration No.</label>
                <p className="mt-1 text-sm">{fieldValue(user.registration_number)}</p>
              </div>
            </div>
          )}

          {user.created_at && (
            <div className="pt-4 border-t border-[color:var(--border)]">
              <label className="text-xs font-semibold uppercase text-[color:var(--muted)]">Account Created</label>
              <p className="mt-1 text-sm">{new Date(user.created_at).toLocaleDateString()}</p>
            </div>
          )}

          {user.notes && (
            <div className="pt-4 border-t border-[color:var(--border)]">
              <label className="text-xs font-semibold uppercase text-[color:var(--muted)]">Notes</label>
              <p className="mt-2 rounded bg-[color:var(--bg-secondary)] p-3 text-sm">{user.notes}</p>
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="mt-8 flex justify-end gap-3">
          <button onClick={onClose} className="neon-btn">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
