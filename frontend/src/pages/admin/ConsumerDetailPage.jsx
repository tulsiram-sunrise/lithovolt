import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { userAPI, orderAPI, warrantyAPI } from '../../services/api'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorMessage from '../../components/common/ErrorMessage'

const TABS = {
  PROFILE: 'profile',
  ORDERS: 'orders',
  WARRANTIES: 'warranties',
  CLAIMS: 'claims',
}

export default function ConsumerDetailPage() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(TABS.PROFILE)
  const [orderPage, setOrderPage] = useState(1)
  const [warrantyPage, setWarrantyPage] = useState(1)
  const [claimPage, setClaimPage] = useState(1)

  // Fetch user details directly to avoid scope-related list failures
  const { data: userData, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ['consumer-user', userId],
    queryFn: () => userAPI.getUser(userId),
    select: (response) => response.data,
  })

  const user = useMemo(() => {
    if (!userData) return null
    if (Array.isArray(userData)) return userData.find((u) => u.id == userId)
    if (Array.isArray(userData?.results)) return userData.results.find((u) => u.id == userId)
    return userData
  }, [userData, userId])

  // Fetch orders
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['consumer-orders', userId, orderPage],
    queryFn: () =>
      orderAPI.getOrdersByUser(userId, {
        page: orderPage,
        page_size: 10,
      }),
    select: (response) => response.data,
    enabled: activeTab === TABS.ORDERS,
  })

  // Fetch warranties
  const { data: warrantiesData, isLoading: warrantiesLoading } = useQuery({
    queryKey: ['consumer-warranties', userId, warrantyPage],
    queryFn: () =>
      warrantyAPI.getWarranties({
        page: warrantyPage,
        page_size: 10,
        user_id: userId,
      }),
    select: (response) => response.data,
    enabled: activeTab === TABS.WARRANTIES,
  })

  // Fetch warranty claims
  const { data: claimsData, isLoading: claimsLoading } = useQuery({
    queryKey: ['consumer-claims', userId, claimPage],
    queryFn: () =>
      warrantyAPI.getWarrantyClaims({
        page: claimPage,
        page_size: 10,
        user_id: userId,
      }),
    select: (response) => response.data,
    enabled: activeTab === TABS.CLAIMS,
  })

  const orders = useMemo(() => {
    const list = Array.isArray(ordersData) ? ordersData : ordersData?.results || []
    return list
  }, [ordersData])

  const warranties = useMemo(() => {
    const list = Array.isArray(warrantiesData) ? warrantiesData : warrantiesData?.results || []
    return list
  }, [warrantiesData])

  const claims = useMemo(() => {
    const list = Array.isArray(claimsData) ? claimsData : claimsData?.results || []
    return list
  }, [claimsData])

  if (userLoading) return <LoadingSpinner message="Loading consumer details..." />
  if (userError) return <ErrorMessage error={userError} />
  if (!user) return <ErrorMessage error={{ response: { data: { message: 'Consumer not found' } } }} />

  const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="mb-4 text-sm text-[color:var(--accent)] hover:underline"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-semibold neon-title">{fullName}</h1>
          <p className="mt-1 text-[color:var(--muted)]">Consumer Account</p>
        </div>
        <span className={`inline-block px-4 py-2 rounded-lg text-sm font-medium ${
          user.is_active
            ? 'bg-green-900/30 text-green-400'
            : 'bg-red-900/30 text-red-400'
        }`}>
          {user.is_active ? '● Active' : '● Inactive'}
        </span>
      </div>

      {/* Tab Navigation */}
      <div className="panel-card p-4 border-b border-[color:var(--border)]">
        <div className="flex gap-4 overflow-x-auto">
          {Object.entries(TABS).map(([key, value]) => (
            <button
              key={key}
              onClick={() => {
                setActiveTab(value)
                if (value === TABS.ORDERS) setOrderPage(1)
                if (value === TABS.WARRANTIES) setWarrantyPage(1)
                if (value === TABS.CLAIMS) setClaimPage(1)
              }}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === value
                  ? 'text-[color:var(--accent)] border-b-2 border-[color:var(--accent)]'
                  : 'text-[color:var(--muted)] hover:text-[color:var(--text)]'
              }`}
            >
              {key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="panel-card p-6">
        {/* Profile Tab */}
        {activeTab === TABS.PROFILE && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold uppercase text-[color:var(--muted)]">Email</label>
                <p className="mt-2 text-sm">{user.email || '-'}</p>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-[color:var(--muted)]">Phone</label>
                <p className="mt-2 text-sm">{user.phone || '-'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-[color:var(--border)]">
              <div>
                <label className="text-xs font-semibold uppercase text-[color:var(--muted)]">Address</label>
                <p className="mt-2 text-sm">{user.address || '-'}</p>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-[color:var(--muted)]">City</label>
                <p className="mt-2 text-sm">{user.city || '-'}</p>
              </div>
            </div>

            {(user.state || user.postal_code) && (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold uppercase text-[color:var(--muted)]">State</label>
                  <p className="mt-2 text-sm">{user.state || '-'}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-[color:var(--muted)]">Postal Code</label>
                  <p className="mt-2 text-sm">{user.postal_code || '-'}</p>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-[color:var(--border)]">
              <div>
                <label className="text-xs font-semibold uppercase text-[color:var(--muted)]">Account Status</label>
                <p className="mt-2 text-sm">{user.is_verified ? 'Verified' : 'Not Verified'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === TABS.ORDERS && (
          <div className="space-y-4">
            {ordersLoading ? (
              <div className="py-8 text-center text-[color:var(--muted)]">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="py-8 text-center text-[color:var(--muted)]">No orders found</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="data-table w-full">
                    <thead>
                      <tr>
                        <th>Order Number</th>
                        <th>Date</th>
                        <th>Total Amount</th>
                        <th>Status</th>
                        <th>Payment Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td className="font-medium">{order.order_number || `ORD-${order.id}`}</td>
                          <td>{order.created_at?.split('T')[0] || '-'}</td>
                          <td>${order.total_amount?.toFixed(2) || '0.00'}</td>
                          <td>
                            <span className="tag">{order.status || 'UNKNOWN'}</span>
                          </td>
                          <td>
                            <span className="tag">{order.payment_status || 'PENDING'}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* Warranties Tab */}
        {activeTab === TABS.WARRANTIES && (
          <div className="space-y-4">
            {warrantiesLoading ? (
              <div className="py-8 text-center text-[color:var(--muted)]">Loading warranties...</div>
            ) : warranties.length === 0 ? (
              <div className="py-8 text-center text-[color:var(--muted)]">No warranties found</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="data-table w-full">
                    <thead>
                      <tr>
                        <th>Warranty #</th>
                        <th>Serial Number</th>
                        <th>Product</th>
                        <th>Status</th>
                        <th>Expiry Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {warranties.map((warranty) => (
                        <tr key={warranty.id}>
                          <td className="font-medium">{warranty.warranty_number || `WAR-${warranty.id}`}</td>
                          <td>{warranty.serial || '-'}</td>
                          <td>{warranty.product || '-'}</td>
                          <td>
                            <span className="tag">{warranty.status || 'ACTIVE'}</span>
                          </td>
                          <td>{warranty.expiry_date?.split('T')[0] || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* Claims Tab */}
        {activeTab === TABS.CLAIMS && (
          <div className="space-y-4">
            {claimsLoading ? (
              <div className="py-8 text-center text-[color:var(--muted)]">Loading claims...</div>
            ) : claims.length === 0 ? (
              <div className="py-8 text-center text-[color:var(--muted)]">No claims found</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="data-table w-full">
                    <thead>
                      <tr>
                        <th>Claim ID</th>
                        <th>Warranty #</th>
                        <th>Issue Type</th>
                        <th>Status</th>
                        <th>Submitted Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {claims.map((claim) => (
                        <tr key={claim.id}>
                          <td className="font-medium">{`CLM-${claim.id}`}</td>
                          <td>{claim.warranty_number || `WAR-${claim.warranty_id}`}</td>
                          <td>{claim.issue_type || claim.description?.substring(0, 30) || '-'}</td>
                          <td>
                            <span className="tag">{claim.status || 'PENDING'}</span>
                          </td>
                          <td>{claim.created_at?.split('T')[0] || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
