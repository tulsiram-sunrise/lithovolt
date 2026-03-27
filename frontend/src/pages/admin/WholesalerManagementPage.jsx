import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { userAPI } from '../../services/api'
import ShimmerTableRows from '../../components/common/ShimmerTableRows'
import PaginationControls from '../../components/common/PaginationControls'
import UserDetailModal from '../../components/admin/UserDetailModal'

const normalizeStatus = (value) => String(value || '').toLowerCase()

/**
 * Unified Wholesaler Management Page
 * Combines approved wholesalers and pending applications
 */
export default function WholesalerManagementPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('approved') // 'approved' or 'applications'
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('')
  const [page, setPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showDetail, setShowDetail] = useState(false)

  // Fetch approved wholesalers
  const { data: wholesalersData, isLoading: wholesalersLoading } = useQuery({
    queryKey: ['admin-wholesalers', page, search, activeFilter],
    queryFn: () => userAPI.getUsers({
      page,
      page_size: 10,
      scope: 'wholesalers',
      search: search || undefined,
      is_active: activeFilter || undefined,
    }),
    select: (response) => response.data,
    enabled: activeTab === 'approved',
  })

  // Fetch wholesaler applications
  const { data: applicationsData, isLoading: applicationsLoading } = useQuery({
    queryKey: ['wholesaler-applications', page],
    queryFn: () => userAPI.getWholesalerApplications({
      page,
      page_size: 10,
      ordering: '-updated_at',
    }),
    select: (response) => response.data,
    enabled: activeTab === 'applications',
  })

  const toggleActive = useMutation({
    mutationFn: (id) => userAPI.toggleActive(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-wholesalers'] }),
  })

  const approveApp = useMutation({
    mutationFn: (id) => userAPI.approveWholesalerApplication(id, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wholesaler-applications'] })
      queryClient.invalidateQueries({ queryKey: ['admin-wholesalers'] })
    },
  })

  const rejectApp = useMutation({
    mutationFn: (id) => userAPI.rejectWholesalerApplication(id, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wholesaler-applications'] })
      queryClient.invalidateQueries({ queryKey: ['admin-wholesalers'] })
    },
  })

  const wholesalers = useMemo(() => {
    if (Array.isArray(wholesalersData)) {
      return wholesalersData
    }
    return wholesalersData?.results || wholesalersData?.data || []
  }, [wholesalersData])

  const applications = useMemo(() => {
    const list = Array.isArray(applicationsData) ? applicationsData : applicationsData?.results || []
    return list
  }, [applicationsData])

  const pagination = useMemo(() => {
    const data = activeTab === 'approved' ? wholesalersData : applicationsData
    if (Array.isArray(data)) {
      return { current_page: 1, last_page: 1, total: data.length }
    }
    return {
      current_page: data?.current_page || 1,
      last_page: data?.last_page || 1,
      total: data?.total || (activeTab === 'approved' ? wholesalers.length : applications.length),
    }
  }, [wholesalersData, applicationsData, activeTab, wholesalers, applications])

  const handleDetailClick = (user) => {
    setSelectedUser(user)
    setShowDetail(true)
  }

  const isLoading = activeTab === 'approved' ? wholesalersLoading : applicationsLoading

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold neon-title">Wholesaler Management</h1>
        <p className="text-[color:var(--muted)]">Manage approved wholesalers and review pending applications.</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-[color:var(--border)]">
        <button
          onClick={() => {
            setActiveTab('approved')
            setPage(1)
            setSearch('')
          }}
          className={`px-4 py-3 font-medium transition-colors ${
            activeTab === 'approved'
              ? 'border-b-2 border-[var(--neon-primary)] text-[var(--neon-primary)]'
              : 'text-[color:var(--muted)] hover:text-[color:var(--text)]'
          }`}
        >
          Approved Wholesalers
        </button>
        <button
          onClick={() => {
            setActiveTab('applications')
            setPage(1)
            setSearch('')
          }}
          className={`px-4 py-3 font-medium transition-colors ${
            activeTab === 'applications'
              ? 'border-b-2 border-[var(--neon-primary)] text-[var(--neon-primary)]'
              : 'text-[color:var(--muted)] hover:text-[color:var(--text)]'
          }`}
        >
          Pending Applications
        </button>
      </div>

      {/* Content */}
      <div className="panel-card p-6">
        {/* Filters - Only show for approved wholesalers */}
        {activeTab === 'approved' && (
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
              <button
                className={`neon-btn-ghost ${activeFilter === '' ? 'opacity-100' : 'opacity-60'}`}
                onClick={() => {
                  setActiveFilter('')
                  setPage(1)
                }}
              >
                All
              </button>
              <button
                className={`neon-btn-ghost ${activeFilter === 'true' ? 'opacity-100' : 'opacity-60'}`}
                onClick={() => {
                  setActiveFilter('true')
                  setPage(1)
                }}
              >
                Active
              </button>
              <button
                className={`neon-btn-ghost ${activeFilter === 'false' ? 'opacity-100' : 'opacity-60'}`}
                onClick={() => {
                  setActiveFilter('false')
                  setPage(1)
                }}
              >
                Inactive
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                {activeTab === 'approved' ? (
                  <>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </>
                ) : (
                  <>
                    <th>Business Name</th>
                    <th>Registration No.</th>
                    <th>Contact Email</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {isLoading ? <ShimmerTableRows rows={6} columns={5} /> : null}

              {/* Approved Wholesalers Tab */}
              {activeTab === 'approved' &&
                !isLoading &&
                wholesalers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim()}</td>
                    <td>{user.email || '-'}</td>
                    <td>{user.phone || '-'}</td>
                    <td>{user.is_active ? <span className="tag tag-success">Active</span> : <span className="tag tag-warning">Inactive</span>}</td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          className="neon-btn-ghost text-xs"
                          onClick={() => handleDetailClick(user)}
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

              {/* Applications Tab */}
              {activeTab === 'applications' &&
                !isLoading &&
                applications.map((app) => {
                  const status = normalizeStatus(app.status)
                  const isPending = status === 'pending'

                  return (
                    <tr key={app.id}>
                      <td>{app.business_name || '-'}</td>
                      <td>{app.registration_number || '-'}</td>
                      <td>{app.contact_email || '-'}</td>
                      <td>
                        <span className={`tag ${
                          isPending ? 'tag-warning' : status === 'approved' ? 'tag-success' : 'tag-error'
                        }`}>
                          {status.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            className="neon-btn-ghost text-xs"
                            onClick={() => handleDetailClick(app)}
                          >
                            View
                          </button>
                          {isPending && (
                            <>
                              <button
                                className="neon-btn-ghost text-xs"
                                onClick={() => approveApp.mutate(app.id)}
                                disabled={approveApp.isPending || rejectApp.isPending}
                              >
                                Approve
                              </button>
                              <button
                                className="neon-btn-ghost text-xs"
                                onClick={() => rejectApp.mutate(app.id)}
                                disabled={approveApp.isPending || rejectApp.isPending}
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>

        {!isLoading && (activeTab === 'approved' ? wholesalers.length === 0 : applications.length === 0) && (
          <p className="mt-3 text-sm text-[color:var(--muted)]">
            {activeTab === 'approved' ? 'No approved wholesalers yet.' : 'No applications yet.'}
          </p>
        )}

        {/* Pagination */}
        {!isLoading && (activeTab === 'approved' ? wholesalers.length > 0 : applications.length > 0) && (
          <PaginationControls
            currentPage={pagination.current_page}
            lastPage={pagination.last_page}
            total={pagination.total}
            pageSize={10}
            onPageChange={(newPage) => setPage(newPage)}
            disabled={isLoading}
          />
        )}
      </div>

      {/* Detail Modal */}
      <UserDetailModal
        isOpen={showDetail}
        user={selectedUser}
        onClose={() => {
          setShowDetail(false)
          setSelectedUser(null)
        }}
      />
    </div>
  )
}
