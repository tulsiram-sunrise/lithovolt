import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { warrantyAPI } from '../../services/api'
import { extractApiErrorMessage } from '../../services/apiError'
import ShimmerTableRows from '../../components/common/ShimmerTableRows'

const STATUS_TONE = {
  PENDING: 'warning',
  UNDER_REVIEW: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  RESOLVED: 'success',
}

function normalizeStatus(value) {
  return String(value || 'PENDING').toUpperCase()
}

export default function CustomerClaimsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['customer-claims-page'],
    queryFn: () => warrantyAPI.getWarrantyClaims({ ordering: '-created_at' }),
    select: (response) => response.data,
  })

  const claims = useMemo(() => {
    const list = Array.isArray(data)
      ? data
      : data?.results || data?.data || []

    return list
  }, [data])

  const errorMessage = error
    ? extractApiErrorMessage(error, 'Unable to load claims right now.')
    : ''

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold neon-title">My Claims</h1>
        <p className="text-[color:var(--muted)]">Track warranty claim status and review notes.</p>
      </div>

      <div className="panel-card p-6">
        {errorMessage ? <p className="text-[color:var(--danger)]">{errorMessage}</p> : null}

        <div className="mt-4 overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Claim #</th>
                <th>Status</th>
                <th>Warranty</th>
                <th>Submitted</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? <ShimmerTableRows rows={5} columns={5} /> : null}
              {claims.map((claim) => {
                const status = normalizeStatus(claim.status)
                const tone = STATUS_TONE[status] || 'default'

                return (
                  <tr key={claim.id}>
                    <td>{claim.claim_number || `CLM-${claim.id}`}</td>
                    <td>
                      <span className={`tag ${tone === 'danger' ? 'text-[color:var(--danger)]' : ''}`}>
                        {status}
                      </span>
                    </td>
                    <td>{claim.warranty_number || claim.warranty?.warranty_number || `WAR-${claim.warranty_id || '-'}`}</td>
                    <td>{claim.created_at ? new Date(claim.created_at).toLocaleDateString() : '-'}</td>
                    <td>{claim.review_notes || claim.resolution || 'No review notes yet.'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {!isLoading && !claims.length ? (
          <div className="mt-6 rounded-lg border border-[color:var(--border)] bg-white/5 p-5">
            <p className="text-sm text-[color:var(--muted)]">No claims submitted yet.</p>
            <Link to="/customer/claim" className="mt-3 inline-block neon-btn-secondary">
              Submit a Claim
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  )
}
