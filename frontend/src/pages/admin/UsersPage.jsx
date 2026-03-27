import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { userAPI } from '../../services/api'
import PasswordInput from '../../components/common/PasswordInput'
import ShimmerTableRows from '../../components/common/ShimmerTableRows'
import PaginationControls from '../../components/common/PaginationControls'
import StaffPage from './StaffPage'

function UserDirectoryTab() {
  const [staffStatus, setStaffStatus] = useState('')
  const [activeFilter, setActiveFilter] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createError, setCreateError] = useState('')
  const [selectedUserDetail, setSelectedUserDetail] = useState(null)
  const [showUserDetailModal, setShowUserDetailModal] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })

  const queryClient = useQueryClient()

  const resetCreateForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    })
    setCreateError('')
  }

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users', page, search, staffStatus, activeFilter],
    queryFn: () => userAPI.getUsers({
      page,
      page_size: 10,
      scope: 'backoffice',
      search: search || undefined,
      staff_status: staffStatus || undefined,
      is_active: activeFilter || undefined,
    }),
    select: (response) => response.data,
  })

  const toggleActive = useMutation({
    mutationFn: (id) => userAPI.toggleActive(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  const createUser = useMutation({
    mutationFn: (payload) => userAPI.createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      setIsCreateOpen(false)
      resetCreateForm()
    },
    onError: (err) => {
      const details = err.response?.data?.errors || err.response?.data?.details
      if (details && typeof details === 'object') {
        const firstError = Object.values(details)[0]
        if (Array.isArray(firstError) && firstError.length > 0) {
          setCreateError(firstError[0])
          return
        }
      }
      setCreateError(err.response?.data?.message || err.response?.data?.error || 'Unable to create user.')
    },
  })

  const baseUsers = useMemo(() => {
    const list = Array.isArray(usersData) ? usersData : usersData?.results || usersData?.data || []
    return list
  }, [usersData])

  const users = useMemo(() => baseUsers, [baseUsers])

  const pagination = useMemo(() => {
    if (Array.isArray(usersData)) {
      return { current_page: 1, last_page: 1, total: users.length }
    }

    return {
      current_page: usersData?.current_page || 1,
      last_page: usersData?.last_page || 1,
      total: usersData?.total || users.length,
    }
  }, [users, usersData])

  const handleCreateChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreateSubmit = (event) => {
    event.preventDefault()
    setCreateError('')

    if (formData.password !== formData.confirmPassword) {
      setCreateError('Passwords do not match.')
      return
    }

    createUser.mutate({
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
    })
  }

  const accessStateForUser = (user) => {
    const staff = user.staff_user || user.staffUser

    if (!staff) {
      return {
        label: 'Blocked: No staff assignment',
        tone: 'blocked',
      }
    }

    if (!staff.is_active) {
      return {
        label: 'Blocked: Staff assignment inactive',
        tone: 'blocked',
      }
    }

    if (!user.is_active) {
      return {
        label: 'Blocked: Account inactive',
        tone: 'blocked',
      }
    }

    return {
      label: 'Allowed: Role-group permissions applied',
      tone: 'allowed',
    }
  }

  const handleViewUserDetail = (user) => {
    setSelectedUserDetail(user)
    setShowUserDetailModal(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button className="neon-btn" onClick={() => { resetCreateForm(); setIsCreateOpen(true) }}>Add Backoffice User</button>
          <button className="neon-btn-secondary">Export</button>
        </div>
      </div>

      {isCreateOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setIsCreateOpen(false)}>
          <div className="panel-card w-full max-w-2xl p-6" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold neon-title">Create Backoffice User</h2>
              <button className="neon-btn-ghost" onClick={() => setIsCreateOpen(false)}>Close</button>
            </div>

            <p className="mb-4 text-sm text-[color:var(--muted)]">
              Consumer accounts self-register. Wholesalers are invited or approved from applications.
              Users created here are for backoffice access only. After creation, assign a staff role group to grant allowed actions.
            </p>

            <form className="space-y-4" onSubmit={handleCreateSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="field-label">First Name</label>
                  <input className="neon-input" name="first_name" value={formData.first_name} onChange={handleCreateChange} required />
                </div>
                <div>
                  <label className="field-label">Last Name</label>
                  <input className="neon-input" name="last_name" value={formData.last_name} onChange={handleCreateChange} required />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="field-label">Email</label>
                  <input className="neon-input" type="email" name="email" value={formData.email} onChange={handleCreateChange} required />
                </div>
                <div>
                  <label className="field-label">Phone</label>
                  <input className="neon-input" name="phone" value={formData.phone} onChange={handleCreateChange} required />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="field-label">Password</label>
                  <PasswordInput className="neon-input" name="password" value={formData.password} onChange={handleCreateChange} minLength={6} required />
                </div>
                <div>
                  <label className="field-label">Confirm Password</label>
                  <input className="neon-input" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleCreateChange} minLength={6} required />
                </div>
              </div>

              {createError ? <p className="text-sm text-[color:var(--danger)]">{createError}</p> : null}

              <div className="flex gap-3">
                <button type="submit" className="neon-btn" disabled={createUser.isPending}>{createUser.isPending ? 'Creating...' : 'Create User'}</button>
                <button type="button" className="neon-btn-secondary" onClick={() => setIsCreateOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <div className="panel-card p-6">
        <p className="mb-3 text-sm text-[color:var(--muted)]">
          Access State shows if a backoffice user can execute governed admin actions right now.
        </p>
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="tag access-state access-state-allowed">Green = Allowed</span>
          <span className="tag access-state access-state-blocked">Red = Blocked</span>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input
            className="neon-input md:max-w-xs"
            placeholder="Search backoffice users"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
          />
          <div className="flex gap-2">
            <button className="neon-btn-ghost" onClick={() => { setStaffStatus(''); setPage(1) }}>All</button>
            <button className="neon-btn-ghost" onClick={() => { setStaffStatus('assigned'); setPage(1) }}>Assigned</button>
            <button className="neon-btn-ghost" onClick={() => { setStaffStatus('unassigned'); setPage(1) }}>Unassigned</button>
            <button className="neon-btn-ghost" onClick={() => { setActiveFilter('true'); setPage(1) }}>Active</button>
            <button className="neon-btn-ghost" onClick={() => { setActiveFilter('false'); setPage(1) }}>Inactive</button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Access Profile</th>
                <th>Access State</th>
                <th>Account Status</th>
                <th>Email</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {usersLoading ? <ShimmerTableRows rows={6} columns={6} /> : null}
              {!usersLoading && users.map((user) => {
                const accessState = accessStateForUser(user)

                return (
                  <tr key={user.id}>
                    <td>{user.full_name || `${user.first_name} ${user.last_name}`.trim()}</td>
                    <td>
                      <span className="tag">
                        {user.staff_user?.role?.name || user.staffUser?.role?.name || 'Unassigned'}
                      </span>
                    </td>
                    <td>
                      <span className={`tag access-state access-state-${accessState.tone}`}>{accessState.label}</span>
                    </td>
                    <td>{user.is_active ? 'Active' : 'Inactive'}</td>
                    <td>{user.email}</td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          className="neon-btn-ghost text-xs"
                          onClick={() => handleViewUserDetail(user)}
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
                )
              })}
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

      {showUserDetailModal && selectedUserDetail ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowUserDetailModal(false)}>
          <div className="panel-card w-full max-w-2xl p-6" onClick={(event) => event.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold neon-title">User Details</h2>
              <button className="neon-btn-ghost" onClick={() => setShowUserDetailModal(false)}>Close</button>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="mb-1 text-sm text-[color:var(--muted)]">First Name</p>
                  <p className="text-lg font-medium">{selectedUserDetail.first_name || '-'}</p>
                </div>
                <div>
                  <p className="mb-1 text-sm text-[color:var(--muted)]">Last Name</p>
                  <p className="text-lg font-medium">{selectedUserDetail.last_name || '-'}</p>
                </div>
              </div>

              <div>
                <p className="mb-1 text-sm text-[color:var(--muted)]">Email</p>
                <p className="text-lg font-medium">{selectedUserDetail.email || '-'}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="mb-1 text-sm text-[color:var(--muted)]">Phone</p>
                  <p className="text-lg font-medium">{selectedUserDetail.phone || '-'}</p>
                </div>
                <div>
                  <p className="mb-1 text-sm text-[color:var(--muted)]">Account Status</p>
                  <p className={`inline-block rounded px-3 py-1 text-sm font-medium ${selectedUserDetail.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {selectedUserDetail.is_active ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="mb-1 text-sm text-[color:var(--muted)]">Staff Assignment</p>
                  <p className="text-lg font-medium">{selectedUserDetail.staff_user?.role?.name || selectedUserDetail.staffUser?.role?.name || 'Unassigned'}</p>
                </div>
                <div>
                  <p className="mb-1 text-sm text-[color:var(--muted)]">Access Permission</p>
                  <p className={`inline-block rounded px-3 py-1 text-sm font-medium tag access-state access-state-${accessStateForUser(selectedUserDetail).tone}`}>
                    {accessStateForUser(selectedUserDetail).label}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button className="neon-btn text-sm" onClick={() => {
                  setShowUserDetailModal(false)
                }}>
                  Edit
                </button>
                <button type="button" className="neon-btn-secondary text-sm" onClick={() => setShowUserDetailModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default function UsersPage({ defaultTab = 'users' }) {
  const [tab, setTab] = useState(defaultTab)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold neon-title">People & Access</h1>
        <p className="text-[color:var(--muted)]">Manage backoffice users and their role-group based access in one place.</p>
      </div>

      <div className="panel-card p-4">
        <div className="flex flex-wrap gap-2">
          <button className="neon-btn-ghost" onClick={() => setTab('users')}>Backoffice Users</button>
          <button className="neon-btn-ghost" onClick={() => setTab('staff')}>Staff Role Assignment</button>
        </div>
      </div>

      {tab === 'users' ? <UserDirectoryTab /> : <StaffPage embedded />}
    </div>
  )
}
