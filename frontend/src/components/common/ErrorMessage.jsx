export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="panel-card p-6 border-[color:var(--danger)]">
      <div className="flex items-start gap-3">
        <svg className="h-5 w-5 text-[color:var(--danger)] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="flex-1">
          <p className="text-[color:var(--danger)] font-medium">Error</p>
          <p className="text-[color:var(--muted)] text-sm mt-1">{message || 'Something went wrong. Please try again.'}</p>
          {onRetry && (
            <button onClick={onRetry} className="mt-3 neon-btn-secondary text-sm">
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
