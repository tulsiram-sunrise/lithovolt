import React from 'react'

/**
 * Detail Modal for Staff Users
 */
export default function StaffDetailModal({ isOpen, staffUser, onClose }) {
  if (!isOpen || !staffUser) return null

  const user = staffUser.user
  const role = staffUser.role
  const supervisor = staffUser.supervisor

  const fullName = user?.full_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim()
  const supervisorName = supervisor?.full_name || `${supervisor?.first_name || ''} ${supervisor?.last_name || ''}`.trim()

  const fieldValue = (value) => value || '-'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="panel-card max-h-[90vh] w-full max-w-2xl overflow-y-auto p-6">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold neon-title">{fullName}</h2>
            <p className="mt-1 text-sm text-[color:var(--neon-primary)]">
              {role?.name || 'Unassigned Role'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-2xl text-[color:var(--muted)] hover:text-[color:var(--text)]"
          >
            ✕
          </button>
        </div>

        {/* Status Badges */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
            staffUser.is_active
              ? 'bg-green-900/30 text-green-400'
              : 'bg-red-900/30 text-red-400'
          }`}>
            {staffUser.is_active ? '● Active' : '● Inactive'}
          </span>
          {role?.is_active ? (
            <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-900/30 text-blue-400">
              Role Active
            </span>
          ) : (
            <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-orange-900/30 text-orange-400">
              Role Inactive
            </span>
          )}
        </div>

        {/* Details Grid */}
        <div className="space-y-6">
          {/* Contact Information */}
          <div className="border-b border-[color:var(--border)] pb-4">
            <h3 className="mb-4 text-sm font-semibold uppercase text-[color:var(--neon-primary)]">Contact Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase text-[color:var(--muted)]">Email</label>
                <p className="mt-1 text-sm">{fieldValue(user?.email)}</p>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-[color:var(--muted)]">Phone</label>
                <p className="mt-1 text-sm">{fieldValue(user?.phone)}</p>
              </div>
            </div>
          </div>

          {/* Role & Supervisor */}
          <div className="border-b border-[color:var(--border)] pb-4">
            <h3 className="mb-4 text-sm font-semibold uppercase text-[color:var(--neon-primary)]">Role & Supervision</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase text-[color:var(--muted)]">Assigned Role</label>
                <p className="mt-1 text-sm">{role?.name || 'Not assigned'}</p>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-[color:var(--muted)]">Supervisor</label>
                <p className="mt-1 text-sm">{supervisorName || 'No supervisor'}</p>
              </div>
            </div>
            {role?.description && (
              <div className="mt-4">
                <label className="text-xs font-semibold uppercase text-[color:var(--muted)]">Role Description</label>
                <p className="mt-2 rounded bg-[color:var(--bg-secondary)] p-3 text-sm">{role.description}</p>
              </div>
            )}
          </div>

          {/* Employment Details */}
          <div className="border-b border-[color:var(--border)] pb-4">
            <h3 className="mb-4 text-sm font-semibold uppercase text-[color:var(--neon-primary)]">Employment Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase text-[color:var(--muted)]">Hire Date</label>
                <p className="mt-1 text-sm">{staffUser.hire_date ? new Date(staffUser.hire_date).toLocaleDateString() : '-'}</p>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-[color:var(--muted)]">Assignment Date</label>
                <p className="mt-1 text-sm">{staffUser.created_at ? new Date(staffUser.created_at).toLocaleDateString() : '-'}</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {staffUser.notes && (
            <div>
              <label className="text-xs font-semibold uppercase text-[color:var(--muted)]">Notes</label>
              <p className="mt-2 rounded bg-[color:var(--bg-secondary)] p-3 text-sm">{staffUser.notes}</p>
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
