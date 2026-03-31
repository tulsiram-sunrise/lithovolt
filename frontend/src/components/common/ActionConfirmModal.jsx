import { useEffect, useState } from 'react'

export default function ActionConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  requireReason = false,
  reasonLabel = 'Reason',
  reasonPlaceholder = 'Enter reason...',
  isSubmitting = false,
  onClose,
  onConfirm,
}) {
  const [reason, setReason] = useState('')

  useEffect(() => {
    if (!isOpen) {
      setReason('')
    }
  }, [isOpen])

  if (!isOpen) {
    return null
  }

  const isReasonInvalid = requireReason && reason.trim().length === 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="panel-card w-full max-w-md p-6">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-[color:var(--muted)]">{message}</p>

        {requireReason ? (
          <div className="mt-4">
            <label className="field-label" htmlFor="action-confirm-reason">{reasonLabel}</label>
            <textarea
              id="action-confirm-reason"
              className="neon-input mt-1 min-h-[110px] w-full"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder={reasonPlaceholder}
            />
          </div>
        ) : null}

        <div className="mt-6 flex justify-end gap-2">
          <button className="neon-btn-ghost" type="button" onClick={onClose} disabled={isSubmitting}>
            {cancelLabel}
          </button>
          <button
            className="neon-btn"
            type="button"
            onClick={() => onConfirm(requireReason ? reason.trim() : '')}
            disabled={isSubmitting || isReasonInvalid}
          >
            {isSubmitting ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
