import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { userAPI } from '../../services/api'

export default function UsersPage() {
  const [filter, setFilter] = useState('')
  const queryClient = useQueryClient()

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => userAPI.getUsers({ ordering: '-created_at' }),
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold neon-title">Users</h1>
          <p className="text-[color:var(--muted)]">Manage roles, approvals, and access.</p>
        </div>
        <div className="flex gap-3">
          <button className="neon-btn">Add User</button>
          <button className="neon-btn-secondary">Export</button>
        </div>
      </div>

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
                {(usersLoading ? [] : users).map((user) => (
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
            {usersLoading ? <p className="mt-3 text-sm text-[color:var(--muted)]">Loading users...</p> : null}
          </div>
        </div>

        <div className="panel-card panel-card-strong p-6">
          <h2 className="text-lg font-semibold">Wholesaler Applications</h2>
          <div className="mt-4 space-y-4 text-sm text-[color:var(--muted)]">
            {(appsLoading ? [] : applications).map((app) => (
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
