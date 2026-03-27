import { useEffect, useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { adminAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function WholesalerInviteModal({ isOpen, onClose }) {
  const closeTimerRef = useRef(null)
  const wasOpenRef = useRef(false)
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    company_name: '',
    notes: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const mutation = useMutation({
    mutationFn: (data) => adminAPI.inviteWholesaler(data),
    onSuccess: () => {
      setSubmitted(true)
      closeTimerRef.current = setTimeout(() => {
        setFormData({ email: '', name: '', company_name: '', notes: '' })
        setSubmitted(false)
        mutation.reset()
        onClose()
      }, 1500)
    },
  })

  useEffect(() => {
    const wasOpen = wasOpenRef.current

    if (wasOpen && !isOpen) {
      setSubmitted(false)
      mutation.reset()
      setFormData({ email: '', name: '', company_name: '', notes: '' })
    }

    wasOpenRef.current = isOpen
  }, [isOpen])

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current)
      }
    }
  }, [])

  const handleClose = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
    }
    setSubmitted(false)
    mutation.reset()
    onClose()
  }

  if (!isOpen) {
    return null
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.email) {
      return
    }
    mutation.mutate(formData)
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-xl font-semibold">Invite Wholesaler</h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-[color:var(--muted)] hover:text-[color:var(--text)]"
          >
            ✕
          </button>
        </div>

        {submitted && (
          <div className="bg-green-900/20 border border-green-500 rounded px-4 py-3 text-green-200 mb-4">
            ✓ Invitation sent successfully!
          </div>
        )}

        {mutation.error && (
          <div className="bg-red-900/20 border border-red-500 rounded px-4 py-3 text-red-200 mb-4">
            ✕{' '}
            {mutation.error?.response?.data?.message ||
              'Failed to send invitation'}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Email field (required) */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="wholesaler@company.com"
              className="neon-input w-full"
            />
            <p className="text-xs text-[color:var(--muted)] mt-1">
              The email address where the invitation will be sent
            </p>
          </div>

          {/* Name field (optional) */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Contact Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="neon-input w-full"
            />
          </div>

          {/* Company field (optional) */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Company Name
            </label>
            <input
              type="text"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              placeholder="XYZ Energy Solutions"
              className="neon-input w-full"
            />
          </div>

          {/* Notes field (optional) */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Personal Message (optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any custom message for this wholesaler..."
              rows={3}
              className="neon-input w-full resize-none"
            />
            <p className="text-xs text-[color:var(--muted)] mt-1">
              Max 1000 characters
            </p>
          </div>

          {/* Modal footer actions */}
          <div className="flex gap-3 justify-end mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="neon-btn-secondary"
              disabled={mutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="neon-btn"
              disabled={mutation.isPending || !formData.email}
            >
              {mutation.isPending ? (
                <>
                  <LoadingSpinner className="inline-block mr-2" size="sm" />
                  Sending...
                </>
              ) : (
                'Send Invitation'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
