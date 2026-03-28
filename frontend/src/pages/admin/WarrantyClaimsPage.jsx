import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'
import { extractApiErrorMessage } from '../../services/apiError'
import { useToastStore } from '../../store/toastStore'
import ShimmerTableRows from '../../components/common/ShimmerTableRows'

const FILTERS = ['', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'RESOLVED']

function normalizeStatus(value) {
  return String(value || 'PENDING').toUpperCase()
}

export default function WarrantyClaimsPage() {
  const queryClient = useQueryClient()
  const addToast = useToastStore((state) => state.addToast)
  const [filterStatus, setFilterStatus] = useState('')
  const [selectedClaim, setSelectedClaim] = useState(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [activeAction, setActiveAction] = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-warranty-claims', filterStatus],
    queryFn: () => api.get('/warranty-claims/', { params: { status: filterStatus || undefined, ordering: '-created_at' } }),
    select: (response) => response.data,
  })

  const claims = useMemo(() => {
    const list = Array.isArray(data) ? data : data?.results || data?.data || []
    return list
  }, [data])

  const updateClaim = useMutation({
    mutationFn: ({ claimId, status, notes }) => api.put(`/warranty-claims/${claimId}/`, {
      status,
      resolution: notes || undefined,
    }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-warranty-claims'] })
      setActiveAction('')
      setReviewNotes('')
      addToast({
        type: 'success',
        title: 'Claim updated',
        message: `Claim moved to ${variables.status}.`,
      })
    },
    onError: (err) => {
      addToast({
        type: 'error',
        title: 'Update failed',
        message: extractApiErrorMessage(err, 'Unable to update claim status.'),
      })
    },
  })

  const statusCounts = useMemo(() => {
    return claims.reduce((acc, claim) => {
      const status = normalizeStatus(claim.status)
      acc.total += 1
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, { total: 0, PENDING: 0, UNDER_REVIEW: 0, APPROVED: 0, REJECTED: 0, RESOLVED: 0 })
  }, [claims])

  const openAction = (claim, status) => {
    setSelectedClaim(claim)
    setReviewNotes('')
    setActiveAction(status)
  }

  const submitAction = () => {
    if (!selectedClaim || !activeAction) {
      return
    }

    updateClaim.mutate({
      claimId: selectedClaim.id,
      status: activeAction,
      notes: reviewNotes,
    })
  }

  const errorMessage = error
    ? extractApiErrorMessage(error, 'Unable to load warranty claims.')
    : ''

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold neon-title">Warranty Claims</h1>
        <p className="text-[color:var(--muted)]">Review, approve, reject, and resolve customer claims.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-6">
        <div className="panel-card p-4">
          <p className="text-xs text-[color:var(--muted)]">Total</p>
          <p className="text-2xl font-semibold">{statusCounts.total}</p>
        </div>
        <div className="panel-card p-4">
          <p className="text-xs text-[color:var(--muted)]">Pending</p>
          <p className="text-2xl font-semibold">{statusCounts.PENDING}</p>
        </div>
        <div className="panel-card p-4">
          <p className="text-xs text-[color:var(--muted)]">Under Review</p>
          <p className="text-2xl font-semibold">{statusCounts.UNDER_REVIEW}</p>
        </div>
        <div className="panel-card p-4">
          <p className="text-xs text-[color:var(--muted)]">Approved</p>
          <p className="text-2xl font-semibold">{statusCounts.APPROVED}</p>
        </div>
        <div className="panel-card p-4">
          <p className="text-xs text-[color:var(--muted)]">Rejected</p>
          <p className="text-2xl font-semibold">{statusCounts.REJECTED}</p>
        </div>
        <div className="panel-card p-4">
          <p className="text-xs text-[color:var(--muted)]">Resolved</p>
          <p className="text-2xl font-semibold">{statusCounts.RESOLVED}</p>
        </div>
      </div>

      <div className="panel-card p-6 space-y-4">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((status) => {
            const isActive = filterStatus === status
            const label = status || 'ALL'

            return (
              <button
                key={label}
                type="button"
                className={`neon-btn-ghost ${isActive ? 'ring-1 ring-[color:var(--accent)]' : ''}`}
                onClick={() => setFilterStatus(status)}
              >
                {label}
              </button>
            )
          })}
        </div>

        {errorMessage ? <p className="text-sm text-[color:var(--danger)]">{errorMessage}</p> : null}

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Claim #</th>
                <th>Status</th>
                <th>Warranty</th>
                <th>Consumer</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? <ShimmerTableRows rows={6} columns={6} /> : null}
              {claims.map((claim) => {
                const status = normalizeStatus(claim.status)

                return (
                  <tr key={claim.id}>
                    <td>{claim.claim_number || `CLM-${claim.id}`}</td>
                    <td><span className="tag">{status}</span></td>
                    <td>{claim.warranty?.warranty_number || `WAR-${claim.warranty_id || '-'}`}</td>
                    <td>{claim.user?.full_name || claim.consumer_name || claim.user?.email || '-'}</td>
                    <td>{claim.created_at ? new Date(claim.created_at).toLocaleDateString() : '-'}</td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        {status === 'PENDING' ? (
                          <button type="button" className="neon-btn-ghost" onClick={() => openAction(claim, 'UNDER_REVIEW')}>
                            Start Review
                          </button>
                        ) : null}
                        {status === 'UNDER_REVIEW' ? (
                          <>
                            <button type="button" className="neon-btn-ghost" onClick={() => openAction(claim, 'APPROVED')}>
                              Approve
                            </button>
                            <button type="button" className="neon-btn-ghost" onClick={() => openAction(claim, 'REJECTED')}>
                              Reject
                            </button>
                          </>
                        ) : null}
                        {(status === 'APPROVED' || status === 'REJECTED') ? (
                          <button type="button" className="neon-btn-ghost" onClick={() => openAction(claim, 'RESOLVED')}>
                            Resolve
                          </button>
                        ) : null}
                        <button type="button" className="neon-btn-secondary" onClick={() => setSelectedClaim(claim)}>
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {!isLoading && !claims.length ? (
          <p className="text-sm text-[color:var(--muted)]">No claims found for this filter.</p>
        ) : null}
      </div>

      {selectedClaim ? (
        <div className="panel-card panel-card-strong p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">Claim Details</h2>
            <button type="button" className="neon-btn-secondary" onClick={() => setSelectedClaim(null)}>
              Close
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <p><span className="text-[color:var(--muted)]">Claim:</span> {selectedClaim.claim_number || `CLM-${selectedClaim.id}`}</p>
            <p><span className="text-[color:var(--muted)]">Status:</span> {normalizeStatus(selectedClaim.status)}</p>
            <p><span className="text-[color:var(--muted)]">Warranty:</span> {selectedClaim.warranty?.warranty_number || `WAR-${selectedClaim.warranty_id || '-'}`}</p>
            <p><span className="text-[color:var(--muted)]">Consumer:</span> {selectedClaim.user?.full_name || selectedClaim.user?.email || '-'}</p>
          </div>

          <div>
            <p className="text-[color:var(--muted)]">Complaint</p>
            <p>{selectedClaim.complaint_description || selectedClaim.description || 'No description provided.'}</p>
          </div>

          <div>
            <p className="text-[color:var(--muted)]">Latest Review Notes</p>
            <p>{selectedClaim.review_notes || selectedClaim.resolution || 'No notes added yet.'}</p>
          </div>
        </div>
      ) : null}

      {activeAction && selectedClaim ? (
        <div className="panel-card p-6 space-y-4">
          <h3 className="text-lg font-semibold">Update Claim to {activeAction}</h3>
          <label htmlFor="claim-review-notes" className="field-label">Notes (optional)</label>
          <textarea
            id="claim-review-notes"
            className="neon-input min-h-[100px]"
            value={reviewNotes}
            onChange={(event) => setReviewNotes(event.target.value)}
            placeholder="Add review notes for this action"
          />
          <div className="flex gap-2">
            <button
              type="button"
              className="neon-btn"
              onClick={submitAction}
              disabled={updateClaim.isPending}
            >
              {updateClaim.isPending ? 'Updating...' : `Confirm ${activeAction}`}
            </button>
            <button
              type="button"
              className="neon-btn-secondary"
              onClick={() => {
                setActiveAction('')
                setReviewNotes('')
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
