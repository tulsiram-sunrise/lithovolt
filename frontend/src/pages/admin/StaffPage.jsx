import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminAPI, userAPI } from '../../services/api'
import ShimmerTableRows from '../../components/common/ShimmerTableRows'
import PaginationControls from '../../components/common/PaginationControls'
import StaffDetailModal from '../../components/admin/StaffDetailModal'
import ActionConfirmModal from '../../components/common/ActionConfirmModal'
import SearchableSelect from '../../components/common/SearchableSelect'
import RichDateInput from '../../components/common/RichDateInput'
import CustomCheckbox from '../../components/common/CustomCheckbox'

function fullName(user) {
  if (!user) {
    return ''
  }

  return user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim()
}

export default function StaffPage({ embedded = false }) {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState(null)
  const [selectedStaffDetail, setSelectedStaffDetail] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('ALL')
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage] = useState(1)
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')
  const [confirmRemoveStaff, setConfirmRemoveStaff] = useState(null)
  const [formData, setFormData] = useState({
    user_id: '',
    role_id: '',
    supervisor_id: '',
    is_active: true,
    notes: '',
    hire_date: new Date().toISOString().split('T')[0],
  })

  const { data: staffData, isLoading: staffLoading } = useQuery({
    queryKey: ['admin-staff', page, search, activeFilter, roleFilter],
    queryFn: () => adminAPI.getStaff({
      page,
      page_size: 8,
      search: search || undefined,
      role_id: roleFilter || undefined,
      is_active: activeFilter === 'ALL' ? undefined : activeFilter === 'ACTIVE',
    }),
    select: (response) => response.data,
  })

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users-for-staff'],
    queryFn: () => userAPI.getUsers({
      scope: 'backoffice',
      staff_status: 'unassigned',
      page: 1,
      page_size: 200,
    }),
    select: (response) => response.data,
  })

  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: adminAPI.getRoles,
    select: (response) => response.data,
  })

  const staffUsers = useMemo(() => {
    const list = Array.isArray(staffData) ? staffData : staffData?.results || staffData?.data || []
    return list
  }, [staffData])

  const pagination = useMemo(() => {
    if (Array.isArray(staffData)) {
      return { current_page: 1, last_page: 1, total: staffData.length }
    }

    return {
      current_page: staffData?.current_page || 1,
      last_page: staffData?.last_page || 1,
      total: staffData?.total || staffUsers.length,
    }
  }, [staffData, staffUsers.length])

  const users = useMemo(() => {
    const list = Array.isArray(usersData) ? usersData : usersData?.results || usersData?.data || []
    return list
  }, [usersData])

  const roles = useMemo(() => {
    const list = Array.isArray(rolesData) ? rolesData : rolesData?.results || rolesData?.data || []
    return list.filter((role) => role.is_active)
  }, [rolesData])

  const createStaff = useMutation({
    mutationFn: (payload) => adminAPI.createStaff(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-staff'] })
      setFeedback('Staff assignment created successfully.')
      setError('')
      closeModal()
    },
    onError: (err) => {
      setError(err.response?.data?.message || err.response?.data?.error || 'Unable to create staff assignment.')
    },
  })

  const updateStaff = useMutation({
    mutationFn: (payload) => adminAPI.updateStaff(editingStaff.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-staff'] })
      setFeedback('Staff assignment updated successfully.')
      setError('')
      closeModal()
    },
    onError: (err) => {
      setError(err.response?.data?.message || err.response?.data?.error || 'Unable to update staff assignment.')
    },
  })

  const deleteStaff = useMutation({
    mutationFn: (id) => adminAPI.deleteStaff(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-staff'] })
      setFeedback('Staff assignment removed successfully.')
      setError('')
    },
    onError: (err) => {
      setError(err.response?.data?.message || err.response?.data?.error || 'Unable to delete staff assignment.')
    },
  })

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingStaff(null)
    setFormData({
      user_id: '',
      role_id: '',
      supervisor_id: '',
      is_active: true,
      notes: '',
      hire_date: new Date().toISOString().split('T')[0],
    })
  }

  const openCreateModal = () => {
    setError('')
    setEditingStaff(null)
    setIsModalOpen(true)
  }

  const openEditModal = (staff) => {
    setError('')
    setEditingStaff(staff)
    setFormData({
      user_id: String(staff.user_id || ''),
      role_id: String(staff.role_id || ''),
      supervisor_id: staff.supervisor_id ? String(staff.supervisor_id) : '',
      is_active: !!staff.is_active,
      notes: staff.notes || '',
      hire_date: staff.hire_date || new Date().toISOString().split('T')[0],
    })
    setIsModalOpen(true)
  }

  const handleViewDetail = (staff) => {
    setSelectedStaffDetail(staff)
    setShowDetailModal(true)
  }

  const adminUsers = useMemo(() => {
    const base = [...users]

    if (editingStaff?.user) {
      const exists = base.some((user) => user.id === editingStaff.user.id)
      if (!exists) {
        base.push(editingStaff.user)
      }
    }

    return base
  }, [editingStaff, users])

  const handleSubmit = (event) => {
    event.preventDefault()
    setError('')

    if (!formData.user_id || !formData.role_id) {
      setError('User and role are required.')
      return
    }

    const basePayload = {
      role_id: Number(formData.role_id),
      supervisor_id: formData.supervisor_id ? Number(formData.supervisor_id) : null,
      is_active: formData.is_active,
      notes: formData.notes,
      hire_date: formData.hire_date,
    }

    if (editingStaff) {
      updateStaff.mutate({
        role_id: basePayload.role_id,
        supervisor_id: basePayload.supervisor_id,
        is_active: basePayload.is_active,
        notes: basePayload.notes,
      })
      return
    }

    createStaff.mutate({
      ...basePayload,
      user_id: Number(formData.user_id),
    })
  }

  return (
    <div className="space-y-6">
      {!embedded ? (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold neon-title">Backoffice Staff</h1>
            <p className="text-[color:var(--muted)]">Assign admin users into restricted role groups with limited permissions.</p>
          </div>
          <button className="neon-btn" onClick={openCreateModal}>Add Staff Assignment</button>
        </div>
      ) : null}

      {embedded ? (
        <div className="flex items-center justify-end">
          <button className="neon-btn" onClick={openCreateModal}>Add Staff Assignment</button>
        </div>
      ) : null}

      {feedback ? <p className="text-sm text-[color:var(--accent)]">{feedback}</p> : null}
      {error ? <p className="text-sm text-[color:var(--danger)]">{error}</p> : null}

      <div className="panel-card p-6">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input
            className="neon-input md:max-w-xs"
            placeholder="Search staff"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
          />
          <div className="flex flex-wrap gap-2">
            <div className="min-w-52">
              <SearchableSelect
                id="staff-role-filter"
                value={roleFilter}
                onChange={(next) => {
                  setRoleFilter(next)
                  setPage(1)
                }}
                placeholder="All roles"
                searchPlaceholder="Search role group..."
                options={[{ value: '', label: 'All roles' }, ...roles.map((role) => ({ value: String(role.id), label: role.name }))]}
              />
            </div>
            <button className="neon-btn-ghost" onClick={() => { setActiveFilter('ALL'); setPage(1) }}>All</button>
            <button className="neon-btn-ghost" onClick={() => { setActiveFilter('ACTIVE'); setPage(1) }}>Active</button>
            <button className="neon-btn-ghost" onClick={() => { setActiveFilter('INACTIVE'); setPage(1) }}>Inactive</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role Group</th>
                <th>Supervisor</th>
                <th>Hired</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {staffLoading || usersLoading || rolesLoading ? <ShimmerTableRows rows={6} columns={7} /> : null}
              {!staffLoading && !usersLoading && !rolesLoading && staffUsers.map((staff) => (
                <tr key={staff.id}>
                  <td>{fullName(staff.user) || '-'}</td>
                  <td>{staff.user?.email || '-'}</td>
                  <td><span className="tag">{staff.role?.name || '-'}</span></td>
                  <td>{fullName(staff.supervisor) || '-'}</td>
                  <td>{staff.hire_date ? new Date(staff.hire_date).toLocaleDateString() : '-'}</td>
                  <td>{staff.is_active ? 'Active' : 'Inactive'}</td>
                  <td>
                    <div className="flex gap-2">
                      <button 
                        className="neon-btn-ghost text-xs" 
                        onClick={() => handleViewDetail(staff)}
                      >
                        View
                      </button>
                      <button className="neon-btn-ghost text-xs" onClick={() => openEditModal(staff)}>Edit</button>
                      <button
                        className="neon-btn-ghost text-xs"
                        onClick={() => setConfirmRemoveStaff({ id: staff.id, name: fullName(staff.user) || staff.user?.email || 'this user' })}
                        disabled={deleteStaff.isPending}
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!staffLoading && !usersLoading && !rolesLoading && staffUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-[color:var(--muted)]">No staff assignments yet.</td>
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
              <h2 className="text-2xl font-semibold neon-title">{editingStaff ? 'Edit Staff Assignment' : 'Add Staff Assignment'}</h2>
              <button className="neon-btn-ghost" onClick={closeModal}>Close</button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <SearchableSelect
                    id="staff-user"
                    label="User"
                    value={formData.user_id}
                    onChange={(next) => setFormData((prev) => ({ ...prev, user_id: next }))}
                    disabled={!!editingStaff}
                    placeholder="Select admin user"
                    searchPlaceholder="Search admin user..."
                    options={adminUsers.map((user) => ({ value: String(user.id), label: `${fullName(user)} (${user.email})`, searchText: `${fullName(user)} ${user.email}` }))}
                  />
                </div>

                <div>
                  <SearchableSelect
                    id="staff-role"
                    label="Role Group"
                    value={formData.role_id}
                    onChange={(next) => setFormData((prev) => ({ ...prev, role_id: next }))}
                    placeholder="Select role group"
                    searchPlaceholder="Search role group..."
                    options={roles.map((role) => ({ value: String(role.id), label: role.name }))}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <SearchableSelect
                    id="staff-supervisor"
                    label="Supervisor (Optional)"
                    value={formData.supervisor_id}
                    onChange={(next) => setFormData((prev) => ({ ...prev, supervisor_id: next }))}
                    placeholder="No supervisor"
                    searchPlaceholder="Search supervisor..."
                    options={[{ value: '', label: 'No supervisor' }, ...staffUsers.map((staff) => ({ value: String(staff.user_id), label: `${fullName(staff.user)} (${staff.role?.name || 'No role'})` }))]}
                  />
                </div>

                <div>
                  <RichDateInput
                    id="staff-hire-date"
                    label="Hire Date"
                    value={formData.hire_date}
                    onChange={(next) => setFormData((prev) => ({ ...prev, hire_date: next }))}
                  />
                </div>
              </div>

              <div>
                <label className="field-label">Notes</label>
                <textarea
                  className="neon-input"
                  rows={3}
                  value={formData.notes}
                  onChange={(event) => setFormData((prev) => ({ ...prev, notes: event.target.value }))}
                  placeholder="Optional internal notes"
                />
              </div>

              <CustomCheckbox
                id="staff-active"
                checked={formData.is_active}
                onChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
                label="Active"
              />

              {error ? <p className="text-sm text-[color:var(--danger)]">{error}</p> : null}

              <div className="flex gap-3">
                <button type="submit" className="neon-btn" disabled={createStaff.isPending || updateStaff.isPending}>
                  {createStaff.isPending || updateStaff.isPending ? 'Saving...' : 'Save'}
                </button>
                <button type="button" className="neon-btn-secondary" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {showDetailModal && selectedStaffDetail ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowDetailModal(false)}>
          <div className="panel-card w-full max-w-2xl p-6" onClick={(event) => event.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold neon-title">Staff Details</h2>
              <button className="neon-btn-ghost" onClick={() => setShowDetailModal(false)}>Close</button>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="mb-1 text-sm text-[color:var(--muted)]">First Name</p>
                  <p className="text-lg font-medium">{selectedStaffDetail.user?.first_name || '-'}</p>
                </div>
                <div>
                  <p className="mb-1 text-sm text-[color:var(--muted)]">Last Name</p>
                  <p className="text-lg font-medium">{selectedStaffDetail.user?.last_name || '-'}</p>
                </div>
              </div>

              <div>
                <p className="mb-1 text-sm text-[color:var(--muted)]">Email</p>
                <p className="text-lg font-medium">{selectedStaffDetail.user?.email || '-'}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="mb-1 text-sm text-[color:var(--muted)]">Role Group</p>
                  <p className="inline-block rounded px-3 py-1 text-sm font-medium tag">{selectedStaffDetail.role?.name || '-'}</p>
                </div>
                <div>
                  <p className="mb-1 text-sm text-[color:var(--muted)]">Status</p>
                  <p className={`inline-block rounded px-3 py-1 text-sm font-medium ${selectedStaffDetail.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {selectedStaffDetail.is_active ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="mb-1 text-sm text-[color:var(--muted)]">Hire Date</p>
                  <p className="text-lg font-medium">{selectedStaffDetail.hire_date ? new Date(selectedStaffDetail.hire_date).toLocaleDateString() : '-'}</p>
                </div>
                <div>
                  <p className="mb-1 text-sm text-[color:var(--muted)]">Supervisor</p>
                  <p className="text-lg font-medium">{fullName(selectedStaffDetail.supervisor) || '-'}</p>
                </div>
              </div>

              {selectedStaffDetail.notes && (
                <div>
                  <p className="mb-1 text-sm text-[color:var(--muted)]">Notes</p>
                  <div className="whitespace-pre-wrap rounded border border-[color:var(--border)] bg-black/40 p-3 text-sm">
                    {selectedStaffDetail.notes}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button className="neon-btn text-sm" onClick={() => {
                  setShowDetailModal(false)
                  handleViewDetail(selectedStaffDetail)
                  setTimeout(() => openEditModal(selectedStaffDetail), 100)
                }}>
                  Edit
                </button>
                <button type="button" className="neon-btn-secondary text-sm" onClick={() => setShowDetailModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <ActionConfirmModal
        isOpen={!!confirmRemoveStaff}
        title="Remove Staff Assignment"
        message={`Are you sure you want to remove staff assignment for ${confirmRemoveStaff?.name || ''}?`}
        confirmLabel="Remove"
        isSubmitting={deleteStaff.isPending}
        onClose={() => setConfirmRemoveStaff(null)}
        onConfirm={() => {
          if (confirmRemoveStaff?.id) {
            deleteStaff.mutate(confirmRemoveStaff.id)
          }
          setConfirmRemoveStaff(null)
        }}
      />
    </div>
  )
}
