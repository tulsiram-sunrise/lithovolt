import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Button, Table, Modal, Input, Select, Empty, Spin, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

export default function RolesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', is_active: true });

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => api.get('/users/roles/').then((res) => res.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/users/roles/', data),
    onSuccess: () => {
      message.success('Role created successfully');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setFormData({ name: '', description: '', is_active: true });
      setIsModalOpen(false);
    },
    onError: (error) => message.error(error.response?.data?.message || 'Error creating role'),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => api.patch(`/users/roles/${editingRole.id}/`, data),
    onSuccess: () => {
      message.success('Role updated successfully');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setFormData({ name: '', description: '', is_active: true });
      setEditingRole(null);
      setIsModalOpen(false);
    },
    onError: (error) => message.error(error.response?.data?.message || 'Error updating role'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/users/roles/${id}/`),
    onSuccess: () => {
      message.success('Role deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error) => {
      const errorMsg = error.response?.data?.message || 'Error deleting role';
      message.error(errorMsg);
    },
  });

  const handleOpenModal = (role = null) => {
    if (role) {
      setEditingRole(role);
      setFormData({ name: role.name, description: role.description, is_active: role.is_active });
    } else {
      setEditingRole(null);
      setFormData({ name: '', description: '', is_active: true });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      message.error('Role name is required');
      return;
    }

    const roleNames = ['MANAGER', 'SUPPORT', 'SALES', 'TECH'];
    if (!roleNames.includes(formData.name)) {
      message.error('Role must be one of: MANAGER, SUPPORT, SALES, TECH');
      return;
    }

    if (editingRole) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const columns = [
    {
      title: 'Role Name',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Staff Count',
      dataIndex: ['staff_count'],
      key: 'staff_count',
      width: 120,
    },
    {
      title: 'Permissions',
      dataIndex: ['permissions', 'length'],
      key: 'permissions_count',
      width: 120,
    },
    {
      title: 'Active',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 80,
      render: (text) => (text ? 'Yes' : 'No'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleOpenModal(record)}
          />
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            loading={deleteMutation.isPending && deleteMutation.variables === record.id}
            onClick={() => {
              Modal.confirm({
                title: 'Delete Role',
                content: `Are you sure you want to delete the ${record.name} role?`,
                okText: 'Delete',
                okType: 'danger',
                onOk: () => deleteMutation.mutate(record.id),
              });
            }}
          />
        </div>
      ),
    },
  ];

  if (isLoading) return <Spin />;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1>Staff Roles</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
          Create Role
        </Button>
      </div>

      {roles.length === 0 ? (
        <Empty description="No roles created yet" />
      ) : (
        <Table
          columns={columns}
          dataSource={roles}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          size="small"
        />
      )}

      <Modal
        title={editingRole ? `Edit Role - ${editingRole.name}` : 'Create New Role'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
              Role Name *
            </label>
            <Select
              value={formData.name}
              onChange={(value) => setFormData({ ...formData, name: value })}
              options={['MANAGER', 'SUPPORT', 'SALES', 'TECH'].map((name) => ({
                label: name,
                value: name,
              }))}
              placeholder="Select role name"
              disabled={!!editingRole}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
              Description
            </label>
            <Input.TextArea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Role description"
            />
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              Active
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
}
