import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminAPI } from '../../services/api'
import ShimmerTableRows from '../../components/common/ShimmerTableRows'
import PaginationControls from '../../components/common/PaginationControls'

export default function RolesPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [page, setPage] = useState(1)
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true,
  })

  const { data: rolesData, isLoading } = useQuery({
    queryKey: ['admin-roles', page, search, statusFilter],
    queryFn: () => adminAPI.getRoles({
      page,
      page_size: 8,
      search: search || undefined,
      is_active: statusFilter === 'ALL' ? undefined : statusFilter === 'ACTIVE',
    }),
    select: (response) => response.data,
  })

  const roles = useMemo(() => {
    const list = Array.isArray(rolesData) ? rolesData : rolesData?.results || rolesData?.data || []
    return list
  }, [rolesData])

  const pagination = useMemo(() => {
    if (Array.isArray(rolesData)) {
      return { current_page: 1, last_page: 1, total: rolesData.length }
    }

    return {
      current_page: rolesData?.current_page || 1,
      last_page: rolesData?.last_page || 1,
      total: rolesData?.total || roles.length,
    }
  }, [roles, rolesData])

  const createRole = useMutation({
    mutationFn: (payload) => adminAPI.createRole(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] })
      setFeedback('Role group created successfully.')
      setError('')
      closeModal()
    },
    onError: (err) => {
      setError(err.response?.data?.message || err.response?.data?.error || 'Unable to create role group.')
    },
  })

  const updateRole = useMutation({
    mutationFn: (payload) => adminAPI.updateRole(editingRole.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] })
      setFeedback('Role group updated successfully.')
      setError('')
      closeModal()
    },
    onError: (err) => {
      setError(err.response?.data?.message || err.response?.data?.error || 'Unable to update role group.')
    },
  })

  const deleteRole = useMutation({
    mutationFn: (id) => adminAPI.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] })
      setFeedback('Role group removed successfully.')
      setError('')
    },
    onError: (err) => {
      setError(err.response?.data?.message || err.response?.data?.error || 'Unable to delete role group.')
    },
  })

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingRole(null)
    setFormData({ name: '', description: '', is_active: true })
  }

  const openCreateModal = () => {
    setError('')
    setFormData({ name: '', description: '', is_active: true })
    setEditingRole(null)
    setIsModalOpen(true)
  }

  const openEditModal = (role) => {
    setError('')
    setEditingRole(role)
    setFormData({
      name: role.name || '',
      description: role.description || '',
      is_active: !!role.is_active,
    })
    setIsModalOpen(true)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setError('')

    if (!formData.name.trim()) {
      setError('Role name is required.')
      return
    }

    if (editingRole) {
      updateRole.mutate({
        description: formData.description,
        is_active: formData.is_active,
      })
      return
    }

    createRole.mutate({
      name: formData.name.trim().toUpperCase(),
      description: formData.description,
      is_active: formData.is_active,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold neon-title">Role Groups</h1>
          <p className="text-[color:var(--muted)]">Create and maintain limited role groups for backoffice staff.</p>
        </div>
        <button className="neon-btn" onClick={openCreateModal}>Create Role Group</button>
      </div>

      {feedback ? <p className="text-sm text-[color:var(--accent)]">{feedback}</p> : null}
      {error ? <p className="text-sm text-[color:var(--danger)]">{error}</p> : null}

      <div className="panel-card p-6">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input
            className="neon-input md:max-w-xs"
            placeholder="Search role groups"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
          />
          <div className="flex gap-2">
            <button className="neon-btn-ghost" onClick={() => { setStatusFilter('ALL'); setPage(1) }}>All</button>
            <button className="neon-btn-ghost" onClick={() => { setStatusFilter('ACTIVE'); setPage(1) }}>Active</button>
            <button className="neon-btn-ghost" onClick={() => { setStatusFilter('INACTIVE'); setPage(1) }}>Inactive</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Staff</th>
                <th>Permissions</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? <ShimmerTableRows rows={6} columns={6} /> : null}
              {!isLoading && roles.map((role) => (
                <tr key={role.id}>
                  <td><span className="tag">{role.name}</span></td>
                  <td>{role.description || '-'}</td>
                  <td>{role.staff_users?.length || 0}</td>
                  <td>{role.permissions?.length || 0}</td>
                  <td>{role.is_active ? 'Active' : 'Inactive'}</td>
                  <td>
                    <div className="flex gap-2">
                      <button className="neon-btn-ghost" onClick={() => openEditModal(role)}>Edit</button>
                      <button
                        className="neon-btn-ghost"
                        onClick={() => {
                          if (window.confirm(`Delete role group ${role.name}?`)) {
                            deleteRole.mutate(role.id)
                          }
                        }}
                        disabled={deleteRole.isPending}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && roles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-[color:var(--muted)]">No role groups created yet.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <PaginationControls
          currentPage={pagination.current_page}
          lastPage={pagination.last_page}
          total={pagination.total}
          pageSize={8}
          onPageChange={setPage}
        />
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={closeModal}>
          <div className="panel-card w-full max-w-2xl p-6" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold neon-title">{editingRole ? 'Edit Role Group' : 'Create Role Group'}</h2>
              <button className="neon-btn-ghost" onClick={closeModal}>Close</button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="field-label">Role Name</label>
                  <input
                    className="neon-input"
                    value={formData.name}
                    disabled={!!editingRole}
                    onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value.toUpperCase() }))}
                    placeholder="SUPPORT_L1"
                    required
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm text-[color:var(--muted)]">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(event) => setFormData((prev) => ({ ...prev, is_active: event.target.checked }))}
                    />
                    Active
                  </label>
                </div>
              </div>

              <div>
                <label className="field-label">Description</label>
                <textarea
                  className="neon-input"
                  value={formData.description}
                  onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
                  placeholder="Describe what this role group can do"
                  rows={4}
                />
              </div>

              {error ? <p className="text-sm text-[color:var(--danger)]">{error}</p> : null}

              <div className="flex gap-3">
                <button type="submit" className="neon-btn" disabled={createRole.isPending || updateRole.isPending}>
                  {createRole.isPending || updateRole.isPending ? 'Saving...' : 'Save'}
                </button>
                <button type="button" className="neon-btn-secondary" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
