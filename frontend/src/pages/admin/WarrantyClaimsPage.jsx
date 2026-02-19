import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import {
  Button,
  Table,
  Modal,
  Select,
  Input,
  Empty,
  Spin,
  message,
  Tag,
  Drawer,
  Descriptions,
  Timeline,
} from 'antd';
import { CheckOutlined, CloseOutlined, EyeOutlined } from '@ant-design/icons';

const STATUS_COLORS = {
  PENDING: 'default',
  UNDER_REVIEW: 'processing',
  APPROVED: 'success',
  REJECTED: 'error',
  RESOLVED: 'cyan',
};

export default function WarrantyClaimsPage() {
  const queryClient = useQueryClient();
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState(null); // 'assign', 'approve', 'reject', 'resolve'
  const [reviewNotes, setReviewNotes] = useState('');
  const [assignedStaff, setAssignedStaff] = useState('');
  const [filterStatus, setFilterStatus] = useState(null);

  const { data: claims = [], isLoading: claimsLoading } = useQuery({
    queryKey: ['warranty-claims', filterStatus],
    queryFn: () => {
      const url = filterStatus ? `/warranty/claims/?status=${filterStatus}` : '/warranty/claims/';
      return api.get(url).then((res) => res.data);
    },
  });

  const { data: staffUsers = [], isLoading: staffLoading } = useQuery({
    queryKey: ['staff'],
    queryFn: () => api.get('/users/staff/').then((res) => res.data),
  });

  const assignMutation = useMutation({
    mutationFn: (data) =>
      api.post(`/warranty/claims/${selectedClaim.id}/assign/`, {
        assigned_to: assignedStaff,
        review_notes: reviewNotes,
      }),
    onSuccess: () => {
      message.success('Claim assigned successfully');
      queryClient.invalidateQueries({ queryKey: ['warranty-claims'] });
      setActionModalOpen(false);
      setReviewNotes('');
      setAssignedStaff('');
    },
    onError: (error) => message.error(error.response?.data?.message || 'Error assigning claim'),
  });

  const approveMutation = useMutation({
    mutationFn: () =>
      api.post(`/warranty/claims/${selectedClaim.id}/approve/`, {
        review_notes: reviewNotes,
      }),
    onSuccess: () => {
      message.success('Claim approved successfully');
      queryClient.invalidateQueries({ queryKey: ['warranty-claims'] });
      setActionModalOpen(false);
      setReviewNotes('');
    },
    onError: (error) => message.error(error.response?.data?.message || 'Error approving claim'),
  });

  const rejectMutation = useMutation({
    mutationFn: () =>
      api.post(`/warranty/claims/${selectedClaim.id}/reject/`, {
        review_notes: reviewNotes,
      }),
    onSuccess: () => {
      message.success('Claim rejected successfully');
      queryClient.invalidateQueries({ queryKey: ['warranty-claims'] });
      setActionModalOpen(false);
      setReviewNotes('');
    },
    onError: (error) => message.error(error.response?.data?.message || 'Error rejecting claim'),
  });

  const resolveMutation = useMutation({
    mutationFn: () =>
      api.post(`/warranty/claims/${selectedClaim.id}/resolve/`, {
        review_notes: reviewNotes,
      }),
    onSuccess: () => {
      message.success('Claim resolved successfully');
      queryClient.invalidateQueries({ queryKey: ['warranty-claims'] });
      setActionModalOpen(false);
      setReviewNotes('');
    },
    onError: (error) => message.error(error.response?.data?.message || 'Error resolving claim'),
  });

  const handleAction = (claim, type) => {
    setSelectedClaim(claim);
    setActionType(type);
    setReviewNotes('');
    setAssignedStaff('');
    setActionModalOpen(true);
  };

  const handleActionSubmit = () => {
    if (actionType === 'assign') {
      if (!assignedStaff) {
        message.error('Please select a staff member');
        return;
      }
      assignMutation.mutate();
    } else if (actionType === 'approve') {
      approveMutation.mutate();
    } else if (actionType === 'reject') {
      rejectMutation.mutate();
    } else if (actionType === 'resolve') {
      resolveMutation.mutate();
    }
  };

  const columns = [
    {
      title: 'Claim ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (id) => `#${id}`,
    },
    {
      title: 'Warranty',
      dataIndex: ['warranty', 'id'],
      key: 'warranty',
      width: 100,
    },
    {
      title: 'Consumer',
      dataIndex: ['consumer', 'first_name'],
      key: 'consumer',
      width: 120,
      render: (_, record) => `${record.consumer.first_name} ${record.consumer.last_name}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => <Tag color={STATUS_COLORS[status]}>{status}</Tag>,
    },
    {
      title: 'Assigned To',
      dataIndex: ['assigned_to_name'],
      key: 'assigned_to',
      width: 120,
      render: (name) => name || '—',
    },
    {
      title: 'Submitted',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedClaim(record);
              setDrawerOpen(true);
            }}
          >
            View
          </Button>

          {record.status === 'PENDING' && (
            <Button
              size="small"
              onClick={() => handleAction(record, 'assign')}
              style={{ backgroundColor: '#1890ff', color: 'white', border: 'none' }}
            >
              Assign
            </Button>
          )}

          {record.status === 'UNDER_REVIEW' && (
            <>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                size="small"
                onClick={() => handleAction(record, 'approve')}
              >
                Approve
              </Button>
              <Button
                danger
                icon={<CloseOutlined />}
                size="small"
                onClick={() => handleAction(record, 'reject')}
              >
                Reject
              </Button>
            </>
          )}

          {(record.status === 'APPROVED' || record.status === 'REJECTED') && (
            <Button size="small" onClick={() => handleAction(record, 'resolve')}>
              Resolve
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (claimsLoading || staffLoading) return <Spin />;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ marginBottom: '12px' }}>Warranty Claims Management</h1>
        <Select
          value={filterStatus}
          onChange={setFilterStatus}
          options={[
            { label: 'All Status', value: null },
            { label: 'Pending', value: 'PENDING' },
            { label: 'Under Review', value: 'UNDER_REVIEW' },
            { label: 'Approved', value: 'APPROVED' },
            { label: 'Rejected', value: 'REJECTED' },
            { label: 'Resolved', value: 'RESOLVED' },
          ]}
          style={{ width: '200px' }}
        />
      </div>

      {claims.length === 0 ? (
        <Empty description="No claims found" />
      ) : (
        <Table
          columns={columns}
          dataSource={claims}
          rowKey="id"
          pagination={{ pageSize: 15 }}
          size="small"
          scroll={{ x: 1200 }}
        />
      )}

      {/* Claim Details Drawer */}
      <Drawer
        title={selectedClaim ? `Claim #${selectedClaim.id}` : ''}
        placement="right"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        width={600}
      >
        {selectedClaim && (
          <>
            <Descriptions bordered size="small" column={1} style={{ marginBottom: '24px' }}>
              <Descriptions.Item label="Warranty ID">{selectedClaim.warranty.id}</Descriptions.Item>
              <Descriptions.Item label="Consumer">
                {selectedClaim.consumer.first_name} {selectedClaim.consumer.last_name}
              </Descriptions.Item>
              <Descriptions.Item label="Email">{selectedClaim.consumer.email}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={STATUS_COLORS[selectedClaim.status]}>{selectedClaim.status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Assigned To">
                {selectedClaim.assigned_to_name || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Reviewed By">
                {selectedClaim.reviewed_by_name || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                {selectedClaim.description}
              </Descriptions.Item>
              <Descriptions.Item label="Review Notes">
                {selectedClaim.review_notes || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Created">
                {new Date(selectedClaim.created_at).toLocaleString()}
              </Descriptions.Item>
              {selectedClaim.resolution_date && (
                <Descriptions.Item label="Resolved">
                  {new Date(selectedClaim.resolution_date).toLocaleString()}
                </Descriptions.Item>
              )}
            </Descriptions>

            <h4>Status History</h4>
            <Timeline>
              {selectedClaim.status_history?.map((history, idx) => (
                <Timeline.Item key={idx} dot={<span>{history.to_status[0]}</span>}>
                  <p>
                    <strong>
                      {history.from_status} → {history.to_status}
                    </strong>
                  </p>
                  <small>{new Date(history.created_at).toLocaleString()}</small>
                  <p>{history.notes || '—'}</p>
                </Timeline.Item>
              ))}
            </Timeline>
          </>
        )}
      </Drawer>

      {/* Action Modal */}
      <Modal
        title={
          actionType === 'assign'
            ? 'Assign Claim'
            : actionType === 'approve'
              ? 'Approve Claim'
              : actionType === 'reject'
                ? 'Reject Claim'
                : 'Resolve Claim'
        }
        open={actionModalOpen}
        onOk={handleActionSubmit}
        onCancel={() => {
          setActionModalOpen(false);
          setReviewNotes('');
          setAssignedStaff('');
        }}
        confirmLoading={
          assignMutation.isPending || approveMutation.isPending || rejectMutation.isPending || resolveMutation.isPending
        }
      >
        {actionType === 'assign' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
                Assign To Staff Member *
              </label>
              <Select
                value={assignedStaff || undefined}
                onChange={setAssignedStaff}
                options={staffUsers.map((staff) => ({
                  label: `${staff.user_name} (${staff.role_name})`,
                  value: staff.user_id,
                }))}
                placeholder="Select staff member"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
                Notes (Optional)
              </label>
              <Input.TextArea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={3}
                placeholder="Assignment notes"
              />
            </div>
          </div>
        )}

        {(actionType === 'approve' || actionType === 'reject' || actionType === 'resolve') && (
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
              {actionType === 'approve'
                ? 'Approval Notes'
                : actionType === 'reject'
                  ? 'Rejection Reason'
                  : 'Resolution Notes'}{' '}
              (Optional)
            </label>
            <Input.TextArea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              rows={4}
              placeholder={
                actionType === 'reject'
                  ? 'Explain why this claim is being rejected...'
                  : 'Add any additional notes...'
              }
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
