import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Button, Table, Modal, Select, Empty, Spin, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

export default function StaffPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    user: '',
    role: '',
    supervisor: null,
    hire_date: new Date().toISOString().split('T')[0],
    is_active: true,
  });

  const { data: staffUsers = [], isLoading: staffLoading } = useQuery({
    queryKey: ['staff'],
    queryFn: () => api.get('/users/staff/').then((res) => res.data),
  });

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.get('/users/').then((res) => res.data),
  });

  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => api.get('/users/roles/').then((res) => res.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/users/staff/', data),
    onSuccess: () => {
      message.success('Staff user created successfully');
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      resetForm();
    },
    onError: (error) => message.error(error.response?.data?.message || 'Error creating staff user'),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => api.patch(`/users/staff/${editingStaff.id}/`, data),
    onSuccess: () => {
      message.success('Staff user updated successfully');
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      resetForm();
    },
    onError: (error) => message.error(error.response?.data?.message || 'Error updating staff user'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/users/staff/${id}/`),
    onSuccess: () => {
      message.success('Staff user deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
    onError: (error) => message.error(error.response?.data?.message || 'Error deleting staff user'),
  });

  const resetForm = () => {
    setEditingStaff(null);
    setFormData({
      user: '',
      role: '',
      supervisor: null,
      hire_date: new Date().toISOString().split('T')[0],
      is_active: true,
    });
    setIsModalOpen(false);
  };

  const handleOpenModal = (staff = null) => {
    if (staff) {
      setEditingStaff(staff);
      setFormData({
        user: staff.user_id,
        role: staff.role_id,
        supervisor: staff.supervisor_id,
        hire_date: staff.hire_date,
        is_active: staff.is_active,
      });
    } else {
      setEditingStaff(null);
      setFormData({
        user: '',
        role: '',
        supervisor: null,
        hire_date: new Date().toISOString().split('T')[0],
        is_active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.user || !formData.role) {
      message.error('User and Role are required');
      return;
    }

    const payload = {
      user: formData.user,
      role: formData.role,
      hire_date: formData.hire_date,
      is_active: formData.is_active,
    };

    if (formData.supervisor) {
      payload.supervisor = formData.supervisor;
    }

    if (editingStaff) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const adminUsers = users.filter((u) => u.role === 'ADMIN');

  const columns = [
    {
      title: 'User',
      dataIndex: 'user_name',
      key: 'user_name',
      width: 150,
    },
    {
      title: 'Email',
      dataIndex: 'user_email',
      key: 'user_email',
      width: 200,
    },
    {
      title: 'Role',
      dataIndex: 'role_name',
      key: 'role_name',
      width: 120,
    },
    {
      title: 'Supervisor',
      dataIndex: 'supervisor_name',
      key: 'supervisor_name',
      render: (text) => text || '—',
      width: 150,
    },
    {
      title: 'Hired',
      dataIndex: 'hire_date',
      key: 'hire_date',
      width: 120,
      render: (date) => new Date(date).toLocaleDateString(),
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
                title: 'Delete Staff User',
                content: `Are you sure you want to delete ${record.user_name}?`,
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

  if (staffLoading || usersLoading || rolesLoading) return <Spin />;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1>Staff Management</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
          Add Staff User
        </Button>
      </div>

      {staffUsers.length === 0 ? (
        <Empty description="No staff users assigned yet" />
      ) : (
        <Table
          columns={columns}
          dataSource={staffUsers}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          size="small"
        />
      )}

      <Modal
        title={editingStaff ? 'Edit Staff User' : 'Add Staff User'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={resetForm}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
              User *
            </label>
            <Select
              value={formData.user || undefined}
              onChange={(value) => setFormData({ ...formData, user: value })}
              options={adminUsers.map((user) => ({
                label: `${user.first_name} ${user.last_name} (${user.email})`,
                value: user.id,
              }))}
              placeholder="Select admin user to assign as staff"
              disabled={!!editingStaff}
            />
            <small style={{ color: '#999' }}>Only admin users can be assigned as staff</small>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
              Role *
            </label>
            <Select
              value={formData.role || undefined}
              onChange={(value) => setFormData({ ...formData, role: value })}
              options={roles.map((role) => ({
                label: role.name,
                value: role.id,
              }))}
              placeholder="Select staff role"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
              Supervisor (Optional)
            </label>
            <Select
              value={formData.supervisor || undefined}
              onChange={(value) => setFormData({ ...formData, supervisor: value })}
              options={staffUsers.map((staff) => ({
                label: `${staff.user_name} (${staff.role_name})`,
                value: staff.user_id,
              }))}
              allowClear
              placeholder="Select supervisor (other staff member)"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
              Hire Date
            </label>
            <input
              type="date"
              value={formData.hire_date}
              onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
              style={{ width: '100%', padding: '6px', border: '1px solid #d9d9d9', borderRadius: '4px' }}
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
