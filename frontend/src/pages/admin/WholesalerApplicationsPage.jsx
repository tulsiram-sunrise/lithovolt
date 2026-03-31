import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { userAPI } from '../../services/api'
import ShimmerTableRows from '../../components/common/ShimmerTableRows'
import ActionConfirmModal from '../../components/common/ActionConfirmModal'

const normalizeStatus = (value) => String(value || '').toLowerCase()

export default function WholesalerApplicationsPage() {
  const queryClient = useQueryClient()
  const [confirmRejectAppId, setConfirmRejectAppId] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['wholesaler-applications'],
    queryFn: () => userAPI.getWholesalerApplications({ ordering: '-updated_at' }),
    select: (response) => response.data,
  })

  const approveApp = useMutation({
    mutationFn: (id) => userAPI.approveWholesalerApplication(id, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wholesaler-applications'] })
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })

  const rejectApp = useMutation({
    mutationFn: ({ id, notes }) => userAPI.rejectWholesalerApplication(id, { notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wholesaler-applications'] })
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })

  const applications = useMemo(() => {
    const list = Array.isArray(data) ? data : data?.results || []
    return list
  }, [data])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold neon-title">Wholesaler Applications</h1>
        <p className="text-[color:var(--muted)]">Review pending requests and assign wholesaler role on approval.</p>
      </div>

      <div className="panel-card p-6 overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Business</th>
              <th>Registration No.</th>
              <th>Contact Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? <ShimmerTableRows rows={6} columns={5} /> : null}
            {applications.map((app) => {
              const status = normalizeStatus(app.status)
              const isPending = status === 'pending'

              return (
                <tr key={app.id}>
                  <td>{app.business_name || '-'}</td>
                  <td>{app.registration_number || '-'}</td>
                  <td>{app.contact_email || '-'}</td>
                  <td>
                    <span className="tag">{status ? status.toUpperCase() : 'PENDING'}</span>
                  </td>
                  <td>
                    {isPending ? (
                      <div className="flex gap-2">
                        <button
                          className="neon-btn-ghost"
                          onClick={() => approveApp.mutate(app.id)}
                          disabled={approveApp.isPending || rejectApp.isPending}
                        >
                          Approve
                        </button>
                        <button
                          className="neon-btn-ghost"
                          onClick={() => setConfirmRejectAppId(app.id)}
                          disabled={approveApp.isPending || rejectApp.isPending}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm text-[color:var(--muted)]">No action required</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {!isLoading && applications.length === 0 ? (
          <p className="mt-3 text-sm text-[color:var(--muted)]">No applications yet.</p>
        ) : null}
      </div>

      <ActionConfirmModal
        isOpen={confirmRejectAppId !== null}
        title="Reject Application"
        message="Are you sure you want to reject this wholesaler application?"
        confirmLabel="Confirm Reject"
        requireReason={true}
        reasonLabel="Rejection Reason"
        reasonPlaceholder="Why is this application being rejected?"
        isSubmitting={rejectApp.isPending}
        onClose={() => setConfirmRejectAppId(null)}
        onConfirm={(reason) => {
          const appId = confirmRejectAppId
          setConfirmRejectAppId(null)
          if (appId) {
            rejectApp.mutate({ id: appId, notes: reason })
          }
        }}
      />
    </div>
  )
}
