import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminAPI } from '../../services/api'
import SearchableSelect from '../../components/common/SearchableSelect'
import CustomCheckbox from '../../components/common/CustomCheckbox'

const RESOURCES = ['INVENTORY', 'ORDERS', 'WARRANTY_CLAIMS', 'USERS', 'REPORTS', 'SETTINGS']
const ACTIONS = ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'ASSIGN']

export default function PermissionsPage() {
  const queryClient = useQueryClient()
  const [selectedRole, setSelectedRole] = useState('')
  const [selectedPermissions, setSelectedPermissions] = useState(new Set())
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')

  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: () => adminAPI.getRoles({ page: 1, page_size: 200 }),
    select: (response) => response.data,
  })

  const roles = useMemo(() => {
    const list = Array.isArray(rolesData) ? rolesData : rolesData?.results || rolesData?.data || []
    return list
  }, [rolesData])

  const selectedRoleId = selectedRole ? Number(selectedRole) : null

  const { data: permissionsData, isLoading: permissionsLoading } = useQuery({
    queryKey: ['admin-permissions', selectedRoleId],
    queryFn: () => adminAPI.getPermissions({ role_id: selectedRoleId }),
    select: (response) => response.data,
    enabled: !!selectedRoleId,
  })

  const permissions = useMemo(() => {
    const list = Array.isArray(permissionsData) ? permissionsData : permissionsData?.results || permissionsData?.data || []
    return list
  }, [permissionsData])

  useEffect(() => {
    const mapped = permissions.map((permission) => `${permission.resource}:${permission.action}`)
    setSelectedPermissions(new Set(mapped))
  }, [permissions])

  const savePermissions = useMutation({
    mutationFn: (payload) => adminAPI.bulkAssignPermissions(payload),
    onSuccess: () => {
      setFeedback('Permission matrix updated successfully.')
      setError('')
      queryClient.invalidateQueries({ queryKey: ['admin-permissions', selectedRoleId] })
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] })
    },
    onError: (err) => {
      setError(err.response?.data?.message || err.response?.data?.error || 'Unable to update permissions.')
      setFeedback('')
    },
  })

  const eventRole = roles.find((role) => role.id === selectedRoleId)

  const togglePermission = (resource, action) => {
    const key = `${resource}:${action}`
    setSelectedPermissions((previous) => {
      const next = new Set(previous)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const handleSave = () => {
    if (!selectedRoleId) {
      setError('Select a role group first.')
      return
    }

    savePermissions.mutate({
      role_id: selectedRoleId,
      permissions: Array.from(selectedPermissions).sort(),
    })
  }

  const roleLoading = rolesLoading || permissionsLoading

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold neon-title">Permissions Matrix</h1>
          <p className="text-[color:var(--muted)]">Control which actions each role group can perform.</p>
        </div>
        <div className="w-full md:w-80">
          <SearchableSelect
            id="permissions-role"
            value={selectedRole}
            onChange={(next) => {
              setSelectedRole(next)
              setFeedback('')
              setError('')
            }}
            placeholder="Select role group"
            searchPlaceholder="Search role group..."
            options={roles.map((role) => ({ value: String(role.id), label: role.name }))}
          />
        </div>
      </div>

      {feedback ? <p className="text-sm text-[color:var(--accent)]">{feedback}</p> : null}
      {error ? <p className="text-sm text-[color:var(--danger)]">{error}</p> : null}

      <div className="panel-card p-6">
        {!selectedRoleId ? (
          <p className="text-[color:var(--muted)]">Select a role group to view and edit permissions.</p>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <h2 className="text-lg font-semibold">{eventRole?.name || 'Role'} Permission Grid</h2>
              <span className="tag">{selectedPermissions.size} selected</span>
            </div>

            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Resource</th>
                    {ACTIONS.map((action) => (
                      <th key={action} className="text-center">{action}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {RESOURCES.map((resource) => (
                    <tr key={resource}>
                      <td><span className="tag">{resource}</span></td>
                      {ACTIONS.map((action) => {
                        const key = `${resource}:${action}`
                        return (
                          <td key={action} className="text-center">
                            <div className="inline-flex justify-center">
                              <CustomCheckbox
                                id={`perm-${resource}-${action}`}
                                checked={selectedPermissions.has(key)}
                                onChange={() => togglePermission(resource, action)}
                                disabled={roleLoading || savePermissions.isPending}
                              />
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {Array.from(selectedPermissions).sort().map((perm) => (
                <span key={perm} className="tag">{perm}</span>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <button className="neon-btn" onClick={handleSave} disabled={savePermissions.isPending || roleLoading}>
                {savePermissions.isPending ? 'Saving...' : 'Save Permissions'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
