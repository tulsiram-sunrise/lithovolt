import { useToastStore } from '../../store/toastStore'

export default function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts)
  const removeToast = useToastStore((state) => state.removeToast)

  if (!toasts.length) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`panel-card p-4 min-w-[320px] max-w-md pointer-events-auto animate-slide-in ${
            toast.type === 'error' ? 'border-[color:var(--danger)]' : ''
          } ${toast.type === 'success' ? 'border-[color:var(--accent)]' : ''}`}
        >
          <div className="flex items-start gap-3">
            {toast.type === 'success' && (
              <svg className="h-5 w-5 text-[color:var(--accent)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {toast.type === 'error' && (
              <svg className="h-5 w-5 text-[color:var(--danger)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <div className="flex-1">
              <p className="font-medium">{toast.title || (toast.type === 'error' ? 'Error' : 'Success')}</p>
              {toast.message && <p className="text-sm text-[color:var(--muted)] mt-1">{toast.message}</p>}
            </div>
            <button onClick={() => removeToast(toast.id)} className="text-[color:var(--muted)] hover:text-[color:var(--text)]">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
