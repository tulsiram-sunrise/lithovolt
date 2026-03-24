import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminAPI, userAPI } from '../../services/api'
import PasswordInput from '../../components/common/PasswordInput'
import ShimmerTableRows from '../../components/common/ShimmerTableRows'

export default function UsersPage() {
  const [filter, setFilter] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createError, setCreateError] = useState('')
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role_id: '',
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
      role_id: '',
    })
    setCreateError('')
  }

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => userAPI.getUsers({ ordering: '-created_at' }),
    select: (response) => response.data,
  })

  const { data: rolesData } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: adminAPI.getRoles,
    select: (response) => response.data,
  })

  const { data: applicationsData, isLoading: appsLoading } = useQuery({
    queryKey: ['wholesaler-applications'],
    queryFn: () => userAPI.getWholesalerApplications({ ordering: '-created_at' }),
    select: (response) => response.data,
  })

  const toggleActive = useMutation({
    mutationFn: (id) => userAPI.toggleActive(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  const approveApp = useMutation({
    mutationFn: (id) => userAPI.approveWholesalerApplication(id, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wholesaler-applications'] }),
  })

  const rejectApp = useMutation({
    mutationFn: (id) => userAPI.rejectWholesalerApplication(id, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wholesaler-applications'] }),
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

  const users = useMemo(() => {
    const list = Array.isArray(usersData) ? usersData : usersData?.results || []
    if (!filter) {
      return list
    }
    return list.filter((item) => item.role === filter)
  }, [usersData, filter])

  const applications = useMemo(() => {
    const list = Array.isArray(applicationsData) ? applicationsData : applicationsData?.results || []
    return list.slice(0, 6)
  }, [applicationsData])

  const roleOptions = useMemo(() => {
    const list = Array.isArray(rolesData) ? rolesData : rolesData?.results || []
    return list
  }, [rolesData])

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

    const payload = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role_id: formData.role_id ? Number(formData.role_id) : undefined,
    }

    createUser.mutate(payload)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold neon-title">Users</h1>
          <p className="text-[color:var(--muted)]">Manage roles, approvals, and access.</p>
        </div>
        <div className="flex gap-3">
          <button
            className="neon-btn"
            onClick={() => {
              resetCreateForm()
              setIsCreateOpen(true)
            }}
          >
            Add User
          </button>
          <button className="neon-btn-secondary">Export</button>
        </div>
      </div>

      {isCreateOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setIsCreateOpen(false)}>
          <div className="panel-card w-full max-w-2xl p-6" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold neon-title">Create User</h2>
              <button className="neon-btn-ghost" onClick={() => setIsCreateOpen(false)}>Close</button>
            </div>

            <form className="space-y-4" onSubmit={handleCreateSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="field-label">First Name</label>
                  <input
                    className="neon-input"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleCreateChange}
                    placeholder="Jane"
                    required
                  />
                </div>
                <div>
                  <label className="field-label">Last Name</label>
                  <input
                    className="neon-input"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleCreateChange}
                    placeholder="Smith"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="field-label">Email</label>
                  <input
                    className="neon-input"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleCreateChange}
                    placeholder="user@lithovolt.com"
                    required
                  />
                </div>
                <div>
                  <label className="field-label">Phone</label>
                  <input
                    className="neon-input"
                    name="phone"
                    value={formData.phone}
                    onChange={handleCreateChange}
                    placeholder="0412345678"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="field-label">Password</label>
                  <PasswordInput
                    className="neon-input"
                    name="password"
                    value={formData.password}
                    onChange={handleCreateChange}
                    minLength={6}
                    required
                  />
                </div>
                <div>
                  <label className="field-label">Confirm Password</label>
                  <input
                    className="neon-input"
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleCreateChange}
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="field-label">Role</label>
                  <select
                    className="neon-input"
                    name="role_id"
                    value={formData.role_id}
                    onChange={handleCreateChange}
                    required
                  >
                    <option value="">Select role</option>
                    {roleOptions.map((role) => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {createError ? <p className="text-sm text-[color:var(--danger)]">{createError}</p> : null}

              <div className="flex gap-3">
                <button type="submit" className="neon-btn" disabled={createUser.isPending}>
                  {createUser.isPending ? 'Creating...' : 'Create User'}
                </button>
                <button type="button" className="neon-btn-secondary" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[2fr,1fr]">
        <div className="panel-card p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <input className="neon-input md:max-w-xs" placeholder="Search users" />
            <div className="flex gap-2">
              <button className="neon-btn-ghost" onClick={() => setFilter('')}>All</button>
              <button className="neon-btn-ghost" onClick={() => setFilter('WHOLESALER')}>Wholesalers</button>
              <button className="neon-btn-ghost" onClick={() => setFilter('CONSUMER')}>Consumers</button>
            </div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Email</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {usersLoading ? <ShimmerTableRows rows={6} columns={5} /> : null}
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.full_name || `${user.first_name} ${user.last_name}`.trim()}</td>
                    <td><span className="tag">{user.role}</span></td>
                    <td>{user.is_active ? 'Active' : 'Inactive'}</td>
                    <td>{user.email}</td>
                    <td>
                      <button
                        className="neon-btn-ghost"
                        onClick={() => toggleActive.mutate(user.id)}
                        disabled={toggleActive.isLoading}
                      >
                        {user.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel-card panel-card-strong p-6">
          <h2 className="text-lg font-semibold">Wholesaler Applications</h2>
          <div className="mt-4 space-y-4 text-sm text-[color:var(--muted)]">
            {appsLoading
              ? Array.from({ length: 3 }).map((_, index) => (
                <div key={`app-shimmer-${index}`} className="panel-card p-4 animate-pulse" aria-hidden="true">
                  <div className="h-4 w-36 rounded bg-white/10" />
                  <div className="mt-2 h-3 w-44 rounded bg-white/10" />
                  <div className="mt-2 h-3 w-28 rounded bg-white/10" />
                </div>
              ))
              : applications.map((app) => (
              <div key={app.id} className="panel-card p-4">
                <p className="text-[color:var(--text)]">{app.business_name}</p>
                <p>Reg: {app.registration_number}</p>
                <p>Status: {app.status}</p>
                <div className="mt-2 flex gap-2">
                  <button className="neon-btn-ghost" onClick={() => approveApp.mutate(app.id)}>
                    Approve
                  </button>
                  <button className="neon-btn-ghost" onClick={() => rejectApp.mutate(app.id)}>
                    Reject
                  </button>
                </div>
              </div>
              ))}
            {!appsLoading && !applications.length ? <p>No applications yet.</p> : null}
          </div>
        </div>
      </div>
    </div>
  )
}
