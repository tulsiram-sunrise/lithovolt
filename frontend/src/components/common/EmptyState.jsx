import LoadingSpinner from './LoadingSpinner'

export default function EmptyState({ message, icon, action }) {
  return (
    <div className="py-12 text-center">
      {icon && <div className="flex justify-center mb-4">{icon}</div>}
      <p className="text-[color:var(--muted)]">{message || 'No data available.'}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="py-12 text-center">
      <LoadingSpinner size="lg" className="mx-auto mb-4" />
      <p className="text-[color:var(--muted)]">{message}</p>
    </div>
  )
}
