import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Button, Select, Table, Spin, message, Card, Space, Checkbox } from 'antd';
import { SaveOutlined } from '@ant-design/icons';

const RESOURCES = ['INVENTORY', 'ORDERS', 'WARRANTY_CLAIMS', 'USERS', 'REPORTS', 'SETTINGS'];
const ACTIONS = ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'ASSIGN'];

export default function PermissionsPage() {
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState(new Set());
  const [isSaving, setIsSaving] = useState(false);

  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => api.get('/users/roles/').then((res) => res.data),
  });

  const { data: permissions = [], isLoading: permissionsLoading } = useQuery({
    queryKey: ['permissions', selectedRole],
    queryFn: () =>
      selectedRole ? api.get(`/users/permissions/?role=${selectedRole}`).then((res) => res.data) : Promise.resolve([]),
    enabled: !!selectedRole,
  });

  const createPermissionMutation = useMutation({
    mutationFn: (data) => api.post('/users/permissions/', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions', selectedRole] });
    },
    onError: (error) => {
      if (error.response?.status !== 400 || !error.response?.data?.message?.includes('already exists')) {
        message.error('Error creating permission');
      }
    },
  });

  const deletePermissionMutation = useMutation({
    mutationFn: (id) => api.delete(`/users/permissions/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions', selectedRole] });
    },
    onError: () => message.error('Error deleting permission'),
  });

  const handleRoleChange = (roleId) => {
    const role = roles.find((r) => r.id === roleId);
    setSelectedRole(roleId);
    if (role?.permissions) {
      const permSet = new Set(role.permissions.map((p) => `${p.resource}:${p.action}`));
      setSelectedPermissions(permSet);
    }
  };

  const handlePermissionToggle = (resource, action) => {
    const key = `${resource}:${action}`;
    const newSet = new Set(selectedPermissions);
    const previousSet = new Set(selectedPermissions);

    if (newSet.has(key)) {
      newSet.delete(key);
      const perm = permissions.find((p) => p.resource === resource && p.action === action);
      if (perm) {
        deletePermissionMutation.mutate(perm.id, {
          onError: () => {
            // Rollback on error
            setSelectedPermissions(previousSet);
            message.error('Failed to remove permission');
          },
        });
      }
    } else {
      newSet.add(key);
      createPermissionMutation.mutate(
        { role: selectedRole, resource, action },
        {
          onError: () => {
            // Rollback on error
            setSelectedPermissions(previousSet);
            message.error('Failed to add permission');
          },
        }
      );
    }

    setSelectedPermissions(newSet);
  };

  const isLoading = rolesLoading || permissionsLoading || isSaving;

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: '24px' }}>Roles & Permissions Matrix</h1>

      <Card style={{ marginBottom: '24px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
              Select Role
            </label>
            <Select
              value={selectedRole}
              onChange={handleRoleChange}
              options={roles.map((role) => ({
                label: `${role.name} (${role.staff_count} staff)`,
                value: role.id,
              }))}
              placeholder="Choose a role to manage permissions"
              style={{ width: '300px' }}
            />
          </div>

          {selectedRole && (
            <div style={{ marginTop: '24px' }}>
              <h3>Permissions for {roles.find((r) => r.id === selectedRole)?.name}</h3>

              {isLoading ? (
                <Spin />
              ) : (
                <div style={{ marginTop: '16px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>
                          Resource
                        </th>
                        {ACTIONS.map((action) => (
                          <th key={action} style={{ padding: '12px', textAlign: 'center' }}>
                            {action}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {RESOURCES.map((resource, idx) => (
                        <tr
                          key={resource}
                          style={{
                            borderBottom: '1px solid #f0f0f0',
                            backgroundColor: idx % 2 === 0 ? '#fafafa' : 'white',
                          }}
                        >
                          <td style={{ padding: '12px', fontWeight: 500 }}>{resource}</td>
                          {ACTIONS.map((action) => {
                            const isChecked = selectedPermissions.has(`${resource}:${action}`);
                            return (
                              <td key={action} style={{ padding: '12px', textAlign: 'center' }}>
                                <Checkbox
                                  checked={isChecked}
                                  onChange={() => handlePermissionToggle(resource, action)}
                                  disabled={
                                    createPermissionMutation.isPending || deletePermissionMutation.isPending
                                  }
                                />
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div style={{ marginTop: '24px' }}>
                    <h4>Selected Permissions ({selectedPermissions.size}):</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                      {Array.from(selectedPermissions).sort().map((perm) => (
                        <span
                          key={perm}
                          style={{
                            backgroundColor: '#1890ff',
                            color: 'white',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            fontSize: '12px',
                          }}
                        >
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </Space>
      </Card>
    </div>
  );
}
