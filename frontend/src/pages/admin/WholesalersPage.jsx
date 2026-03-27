import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { userAPI } from '../../services/api'
import ShimmerTableRows from '../../components/common/ShimmerTableRows'
import PaginationControls from '../../components/common/PaginationControls'

export default function WholesalersPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('')
  const [page, setPage] = useState(1)
  const [selectedWholesalerDetail, setSelectedWholesalerDetail] = useState(null)
  const [showWholesalerDetailModal, setShowWholesalerDetailModal] = useState(false)

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-wholesalers', page, search, activeFilter],
    queryFn: () => userAPI.getUsers({
      page,
      page_size: 10,
      scope: 'wholesalers',
      search: search || undefined,
      is_active: activeFilter || undefined,
    }),
    select: (response) => response.data,
  })

  const toggleActive = useMutation({
    mutationFn: (id) => userAPI.toggleActive(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-wholesalers'] }),
  })

  const users = useMemo(() => {
    if (Array.isArray(usersData)) {
      return usersData
    }

    return usersData?.results || usersData?.data || []
  }, [usersData])

  const pagination = useMemo(() => {
    if (Array.isArray(usersData)) {
      return { current_page: 1, last_page: 1, total: usersData.length }
    }

    return {
      current_page: usersData?.current_page || 1,
      last_page: usersData?.last_page || 1,
      total: usersData?.total || users.length,
    }
  }, [users, usersData])

  const handleViewWholesalerDetail = (wholesaler) => {
    setSelectedWholesalerDetail(wholesaler)
    setShowWholesalerDetailModal(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold neon-title">Wholesalers</h1>
        <p className="text-[color:var(--muted)]">Dedicated directory for approved wholesaler accounts.</p>
      </div>

      <div className="panel-card p-6">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input
            className="neon-input md:max-w-xs"
            placeholder="Search wholesalers"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
          />
          <div className="flex gap-2">
            <button className="neon-btn-ghost" onClick={() => { setActiveFilter(''); setPage(1) }}>All</button>
            <button className="neon-btn-ghost" onClick={() => { setActiveFilter('true'); setPage(1) }}>Active</button>
            <button className="neon-btn-ghost" onClick={() => { setActiveFilter('false'); setPage(1) }}>Inactive</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? <ShimmerTableRows rows={6} columns={5} /> : null}
              {!isLoading && users.map((user) => (
                <tr key={user.id}>
                  <td>{user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim()}</td>
                  <td>{user.email || '-'}</td>
                  <td>{user.phone || '-'}</td>
                  <td>{user.is_active ? 'Active' : 'Inactive'}</td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        className="neon-btn-ghost text-xs"
                        onClick={() => handleViewWholesalerDetail(user)}
                      >
                        View
                      </button>
                      <button
                        className="neon-btn-ghost text-xs"
                        onClick={() => toggleActive.mutate(user.id)}
                        disabled={toggleActive.isPending}
                      >
                        {user.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <PaginationControls
          currentPage={pagination.current_page}
          lastPage={pagination.last_page}
          total={pagination.total}
          pageSize={10}
          onPageChange={setPage}
        />
      </div>

      {showWholesalerDetailModal && selectedWholesalerDetail ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowWholesalerDetailModal(false)}>
          <div className="panel-card w-full max-w-2xl p-6" onClick={(event) => event.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold neon-title">Wholesaler Details</h2>
              <button className="neon-btn-ghost" onClick={() => setShowWholesalerDetailModal(false)}>Close</button>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="mb-1 text-sm text-[color:var(--muted)]">First Name</p>
                  <p className="text-lg font-medium">{selectedWholesalerDetail.first_name || '-'}</p>
                </div>
                <div>
                  <p className="mb-1 text-sm text-[color:var(--muted)]">Last Name</p>
                  <p className="text-lg font-medium">{selectedWholesalerDetail.last_name || '-'}</p>
                </div>
              </div>

              <div>
                <p className="mb-1 text-sm text-[color:var(--muted)]">Email</p>
                <p className="text-lg font-medium">{selectedWholesalerDetail.email || '-'}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="mb-1 text-sm text-[color:var(--muted)]">Phone</p>
                  <p className="text-lg font-medium">{selectedWholesalerDetail.phone || '-'}</p>
                </div>
                <div>
                  <p className="mb-1 text-sm text-[color:var(--muted)]">Account Status</p>
                  <p className={`inline-block rounded px-3 py-1 text-sm font-medium ${selectedWholesalerDetail.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {selectedWholesalerDetail.is_active ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>

              {selectedWholesalerDetail.created_at && (
                <div>
                  <p className="mb-1 text-sm text-[color:var(--muted)]">Account Created</p>
                  <p className="text-lg font-medium">{new Date(selectedWholesalerDetail.created_at).toLocaleDateString()}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button className="neon-btn text-sm" onClick={() => {
                  setShowWholesalerDetailModal(false)
                }}>
                  Edit
                </button>
                <button type="button" className="neon-btn-secondary text-sm" onClick={() => setShowWholesalerDetailModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
